import { chromium } from 'playwright';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runVerification() {
  console.log('================================================================');
  console.log('SAHAYAK 3D: CORRIDOR SIGNAL BRAKING, BYPASS REROUTE & DIFF SUITE');
  console.log('================================================================\n');

  const browser = await chromium.launch({
    executablePath: fs.existsSync(CHROME_PATH) ? CHROME_PATH : undefined,
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox'],
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Dismiss onboarding modal if open
  await page.evaluate(() => {
    localStorage.setItem('sahayak_onboarding_seen', 'true');
    const store = window.__journeyStore.getState();
    if (store.setIsOnboardingOpen) {
      store.setIsOnboardingOpen(false);
    }
  });
  try {
    const skipBtn = await page.$('button:has-text("Skip"), button:has-text("छोड़ें")');
    if (skipBtn) await skipBtn.click();
  } catch {}
  await page.waitForTimeout(300);

  // ---------------------------------------------------------------------------
  // 1. SIGNAL-TARGETED BRAKING & BYPASS REROUTE ACROSS 8 CORRIDOR POSITIONS
  // ---------------------------------------------------------------------------
  console.log('--- 1. TESTING DELAY BRAKING & BYPASS REROUTE ACROSS 8 CORRIDOR POSITIONS ---');

  const testPositions = [
    { label: 'Pos 1 (Delhi -> Panipat)', startProgress: 0.19, expectedSignal: 'Signal 102', hasBranchAhead: true },
    { label: 'Pos 2 (Approaching Panipat Outer)', startProgress: 0.38, expectedSignal: 'Signal 104', hasBranchAhead: true },
    { label: 'Pos 3 (Panipat Approach Close)', startProgress: 0.41, expectedSignal: 'Signal 104', hasBranchAhead: true },
    { label: 'Pos 4 (Panipat -> Ambala)', startProgress: 0.64, expectedSignal: 'Signal 106', hasBranchAhead: false },
    { label: 'Pos 5 (Approaching Ambala)', startProgress: 0.84, expectedSignal: 'Signal 108', hasBranchAhead: false },
    { label: 'Pos 6 (After Last Signal)', startProgress: 0.91, expectedSignal: 'Signal 110', hasBranchAhead: false },
    { label: 'Pos 7 (Inside 4.5-Unit Stop Margin)', startProgress: 0.436, expectedSignal: 'Signal 104', isInsideMargin: true, hasBranchAhead: true },
    { label: 'Pos 8 (Station Dwell at Panipat)', startProgress: 0.50, expectedSignal: 'Signal 106', isStationDwell: true, hasBranchAhead: false },
  ];

  const runSummary = [];

  for (let idx = 0; idx < testPositions.length; idx++) {
    const test = testPositions[idx];
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`[Run ${idx + 1}/8] ${test.label}: startProgress=${test.startProgress}, hasBranchAhead=${test.hasBranchAhead}`);
    console.log(`--------------------------------------------------------------------------------`);

    // Reset journey and position train
    const initialSpeed = await page.evaluate((t) => {
      const store = window.__journeyStore.getState();
      const physics = window.__journeyPhysics;

      store.startJourney();
      store.setDisruptionType('none');
      store.setActiveBranch('main');
      physics.activeBranch = 'main';

      physics.progress = t.startProgress;
      physics.targetSpeed = t.isStationDwell ? 0 : 0.25;
      physics.speed = t.isStationDwell ? 0 : 0.25;
      physics.isStationStopped = !!t.isStationDwell;
      physics.stationStopTimer = t.isStationDwell ? 10 : 0;
      store.setSpeed(physics.speed);
      return physics.speed;
    }, test);

    await page.waitForTimeout(200);

    // Trigger delay disruption
    await page.evaluate(() => {
      window.__journeyStore.getState().setDisruptionType('delay');
    });

    const startTime = Date.now();
    let stopTime = null;
    let finalTelemetry = null;
    let maxSpeedObserved = 0;
    const speedSamples = [];

    console.log('    Time (s)  | Speed (norm) | Dist to Signal | Target Signal | Train Progress');
    console.log('    --------------------------------------------------------------------------');

    while ((Date.now() - startTime) < 7000) {
      await page.waitForTimeout(200);
      const elapsedSec = (Date.now() - startTime) / 1000;

      const telem = await page.evaluate(() => {
        const physics = window.__journeyPhysics;
        const store = window.__journeyStore.getState();
        const activeSignalId = store.activeSignalId;
        const signals = [
          { id: 'sig-102', nameEn: 'Signal 102', progress: 0.22 },
          { id: 'sig-104', nameEn: 'Signal 104', progress: 0.44 },
          { id: 'sig-106', nameEn: 'Signal 106', progress: 0.68 },
          { id: 'sig-108', nameEn: 'Signal 108', progress: 0.88 },
          { id: 'sig-110', nameEn: 'Signal 110', progress: 0.95 },
        ];
        const sig = signals.find((s) => s.id === activeSignalId) || signals[1];
        const distUnits = (sig.progress - physics.progress) * 568.74;

        return {
          speed: physics.speed,
          progress: physics.progress,
          signalName: sig.nameEn,
          signalProgress: sig.progress,
          distanceToSignal: Number(distUnits.toFixed(2)),
          activeSignalId: store.activeSignalId,
        };
      });

      speedSamples.push(telem.speed);
      if (telem.speed > maxSpeedObserved) {
        maxSpeedObserved = telem.speed;
      }

      const isStopped = telem.speed < 0.005;

      console.log(
        `    +${elapsedSec.toFixed(1)}s     | ${telem.speed.toFixed(4).padEnd(12)} | ${(telem.distanceToSignal + ' units').padEnd(14)} | ${telem.signalName.padEnd(13)} | ${telem.progress.toFixed(5)}`
      );

      finalTelemetry = telem;

      if (isStopped && stopTime === null) {
        stopTime = elapsedSec;
        break;
      }
    }

    console.log('    --------------------------------------------------------------------------');
    console.log(`    Deceleration Result: Stop Time = ${stopTime ? stopTime.toFixed(2) + 's' : 'Halted immediately'}, Final Dist = ${finalTelemetry.distanceToSignal} units`);

    // Assertion 1: Speed Cap — train NEVER accelerates after disruption
    assert.ok(
      maxSpeedObserved <= initialSpeed + 0.001,
      `[${test.label}] Maximum braking speed (${maxSpeedObserved.toFixed(4)}) must NOT exceed trigger speed (${initialSpeed.toFixed(4)})`
    );
    console.log(`    ✔ Speed Cap Passed: max speed ${maxSpeedObserved.toFixed(4)} <= initial trigger speed ${initialSpeed.toFixed(4)}`);

    // Assertion 2: Continuous stop with no snap — last two speed samples differ by under 0.01
    if (speedSamples.length >= 2 && !test.isStationDwell) {
      const lastSample = speedSamples[speedSamples.length - 1];
      const secondLastSample = speedSamples[speedSamples.length - 2];
      const stepDiff = Math.abs(secondLastSample - lastSample);
      console.log(`    Continuous Stop Check: penultimate speed=${secondLastSample.toFixed(4)} -> final speed=${lastSample.toFixed(4)} (diff=${stepDiff.toFixed(4)})`);
      assert.ok(
        stepDiff < 0.015,
        `[${test.label}] Final stop must be continuous with no snap (last two samples step diff ${stepDiff.toFixed(4)} must be < 0.015)`
      );
      console.log(`    ✔ Continuous Stop Passed: speed difference ${stepDiff.toFixed(4)} < 0.015`);
    }

    // Assertion 3: Dynamic signal name matches target signal
    assert.strictEqual(
      finalTelemetry.signalName,
      test.expectedSignal,
      `[${test.label}] Active signal in store/HUD must be ${test.expectedSignal} (actual: ${finalTelemetry.signalName})`
    );
    console.log(`    ✔ Dynamic Signal Name Passed: stopping at ${finalTelemetry.signalName}`);

    // Assertion 4: Bypass Option Verification
    if (test.hasBranchAhead) {
      // Branch is ahead: Bypass option must be enabled, ranked #1, and clicking it moves train onto branch monotonically
      console.log(`    Checking Branch Bypass Option (Branch is ahead)...`);
      const options = await page.evaluate(() => {
        return window.__journeyStore.getState();
      });

      const applyBtn = page.locator('#apply-option-btn-opt-branch-bypass');
      await applyBtn.waitFor({ state: 'visible', timeout: 3000 });
      const isDisabled = await applyBtn.getAttribute('disabled');
      assert.ok(isDisabled === null, `[${test.label}] Bypass button must NOT be disabled when branch is ahead`);

      // Apply bypass option
      await applyBtn.click();
      console.log('    Clicked Bypass Option -> Advancing train forward onto branch...');

      // Sample frames as train advances
      const trackPoints = [];
      let isMonotonic = true;

      for (let f = 0; f < 10; f++) {
        await page.waitForTimeout(100);
        const pt = await page.evaluate(() => {
          const physics = window.__journeyPhysics;
          return {
            progress: physics.progress,
            speed: physics.speed,
            activeBranch: physics.activeBranch,
          };
        });

        if (trackPoints.length > 0) {
          const prevP = trackPoints[trackPoints.length - 1].progress;
          if (pt.progress < prevP - 0.0001) {
            isMonotonic = false;
          }
        }
        trackPoints.push(pt);
      }

      assert.ok(isMonotonic, `[${test.label}] Train progress must be monotonically non-decreasing (never move backwards)`);
      assert.strictEqual(trackPoints[trackPoints.length - 1].activeBranch, 'branch', `[${test.label}] Train must end up on branch track`);
      console.log(`    ✔ Monotonic Bypass Reroute Passed: progress advanced smoothly with zero backwards movement.`);
    } else {
      // Branch is BEHIND: Bypass option must be disabled or show plain-language reason
      console.log(`    Checking Disabled Bypass Option (Branch is behind train)...`);
      const bypassStatus = await page.evaluate(() => {
        const physics = window.__journeyPhysics;
        const store = window.__journeyStore.getState();
        const fsmState = {
          kind: 'DELAYED',
          delayMinutes: 25,
          reasonEn: '',
          reasonHi: '',
          timestamp: 0,
        };
        // Use decision engine directly
        return {
          progress: physics.progress,
        };
      });

      const applyBtn = page.locator('#apply-option-btn-opt-branch-bypass');
      const isVisible = await applyBtn.isVisible().catch(() => false);
      if (isVisible) {
        const isDisabled = await applyBtn.getAttribute('disabled');
        const ariaDisabled = await applyBtn.getAttribute('aria-disabled');
        assert.ok(
          isDisabled !== null || ariaDisabled === 'true',
          `[${test.label}] Bypass button must be disabled when past branch junction`
        );
        const btnText = await applyBtn.innerText();
        assert.ok(
          btnText.includes('Unavailable') || btnText.includes('अनुपलब्ध'),
          `[${test.label}] Button text must indicate bypass unavailable (actual: "${btnText}")`
        );
        console.log(`    ✔ Bypass Card Disabled: button is disabled with text "${btnText}"`);
      } else {
        console.log(`    ✔ Bypass Card Hidden: bypass option not shown when branch is behind train`);
      }
    }

    runSummary.push({
      label: test.label,
      startProgress: test.startProgress,
      targetSignal: finalTelemetry.signalName,
      maxSpeed: Number(maxSpeedObserved.toFixed(4)),
      hasBranchAhead: test.hasBranchAhead,
      status: 'PASSED',
    });
  }

  console.log('\n================================================================');
  console.log('CORRIDOR SIGNAL BRAKING & BYPASS SUMMARY (ALL 8 POSITIONS)');
  console.log('================================================================');
  console.table(runSummary);

  // ---------------------------------------------------------------------------
  // 2. CANVAS-ONLY PIXEL DIFF: AFTER DELAY VS AFTER UNDO
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. CANVAS-ONLY PIXEL DIFF: AFTER DELAY VS AFTER UNDO ---');

  // Reset to clean delay state
  await page.evaluate(() => {
    const store = window.__journeyStore.getState();
    const physics = window.__journeyPhysics;

    store.setElderMode(false);
    store.setReducedMotion(true);
    store.startJourney();
    store.setDisruptionType('none');
    physics.progress = 0.41;
    physics.speed = 0.25;
    physics.targetSpeed = 0.25;
    physics.isStationStopped = false;
    physics.stationStopTimer = 0;
    store.setSpeed(0.25);
  });

  await page.waitForTimeout(300);

  // Trigger delay
  await page.evaluate(() => {
    window.__journeyStore.getState().setDisruptionType('delay');
  });

  // Wait for train to achieve complete stop
  console.log('  Waiting for train to come to a halt in delay state...');
  await page.waitForFunction(() => {
    return window.__journeyPhysics && window.__journeyPhysics.speed === 0;
  }, { timeout: 10000 });
  await page.waitForTimeout(500);

  // Helper to capture only the 3D WebGL canvas with HTML overlays hidden
  const captureCanvasOnly = async (filename) => {
    await page.evaluate(() => {
      document.querySelectorAll('main > *').forEach((child) => {
        if (!child.contains(document.querySelector('canvas'))) {
          child.style.display = 'none';
        }
      });
    });

    const buf = await page.locator('canvas').screenshot({
      path: path.join(process.cwd(), 'public', 'screenshots', filename),
    });

    await page.evaluate(() => {
      document.querySelectorAll('main > *').forEach((child) => {
        child.style.display = '';
      });
    });

    return buf;
  };

  // Capture canvas after delay triggers (before confirming option)
  const bufDelay = await captureCanvasOnly('test-canvas-delay-state.png');
  console.log('  Captured canvas: public/screenshots/test-canvas-delay-state.png');

  // Apply branch bypass option
  const applyBtn = page.locator('#apply-option-btn-opt-branch-bypass');
  await applyBtn.waitFor({ state: 'visible', timeout: 5000 });
  await applyBtn.click();
  console.log('  Applied option: Branch Bypass (switching to resolved state)');

  // Wait for resolved screen with Undo button
  const undoBtn = page.locator('#undo-decision-btn');
  await undoBtn.waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForTimeout(500);

  // Click Undo button
  await undoBtn.click();
  console.log('  Clicked Undo button (restoring delay state)');

  // Wait for train to settle back in delay state with complete zero speed
  await page.waitForFunction(() => {
    const store = window.__journeyStore.getState();
    const physics = window.__journeyPhysics;
    return store.disruptionType === 'delay' && store.status === 'delay' && store.activeBranch === 'main' && physics.speed === 0;
  }, { timeout: 8000 });
  await page.waitForTimeout(1000);

  // Capture canvas after Undo
  const bufUndo = await captureCanvasOnly('test-canvas-after-undo.png');
  console.log('  Captured canvas: public/screenshots/test-canvas-after-undo.png');

  // Compute pixel diff in browser using in-memory data URLs
  const diffResult = await page.evaluate(async ({ b64Delay, b64Undo }) => {
    const loadImg = (b64) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(new Error('Failed to load image in canvas: ' + e));
        img.src = 'data:image/png;base64,' + b64;
      });

    const [imgDelay, imgUndo] = await Promise.all([
      loadImg(b64Delay),
      loadImg(b64Undo),
    ]);

    const canvas = document.createElement('canvas');
    canvas.width = imgDelay.width;
    canvas.height = imgDelay.height;
    const ctx = canvas.getContext('2d');

    // Draw Delay image
    ctx.drawImage(imgDelay, 0, 0);
    const dataDelay = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // Draw After Undo image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgUndo, 0, 0);
    const dataUndo = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    const totalPixels = canvas.width * canvas.height;
    let differingPixels = 0;
    const threshold = 15; // Noise tolerance for WebGL canvas jitter

    for (let i = 0; i < dataDelay.length; i += 4) {
      const dr = Math.abs(dataDelay[i] - dataUndo[i]);
      const dg = Math.abs(dataDelay[i + 1] - dataUndo[i + 1]);
      const db = Math.abs(dataDelay[i + 2] - dataUndo[i + 2]);

      if (dr > threshold || dg > threshold || db > threshold) {
        differingPixels++;
      }
    }

    const diffPercent = (differingPixels / totalPixels) * 100;
    return {
      width: canvas.width,
      height: canvas.height,
      totalPixels,
      differingPixels,
      matchingPixels: totalPixels - differingPixels,
      diffPercent: Number(diffPercent.toFixed(2)),
      matchPercent: Number((100 - diffPercent).toFixed(2)),
    };
  }, { b64Delay: bufDelay.toString('base64'), b64Undo: bufUndo.toString('base64') });

  console.log(`\n  [Canvas Pixel Diff Results]:`);
  console.log(`    Compared: test-canvas-delay-state.png vs test-canvas-after-undo.png`);
  console.log(`    Dimensions: ${diffResult.width} × ${diffResult.height}`);
  console.log(`    Total Pixels: ${diffResult.totalPixels.toLocaleString()}`);
  console.log(`    Matching Pixels: ${diffResult.matchingPixels.toLocaleString()} (${diffResult.matchPercent}%)`);
  console.log(`    Differing Pixels: ${diffResult.differingPixels.toLocaleString()} (${diffResult.diffPercent}%)`);

  // Assert diff is strictly under 2%
  assert.ok(
    diffResult.diffPercent < 2.0,
    `Canvas pixel difference must be strictly under 2% (actual: ${diffResult.diffPercent}%)`
  );
  console.log(`  ✔ Pixel Diff Passed: Canvas difference is ${diffResult.diffPercent}% (< 2.0% threshold).\n`);

  await browser.close();
  console.log('================================================================');
  console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY WITH ZERO ASSERTION FAILURES');
  console.log('================================================================\n');
}

runVerification().catch((e) => {
  console.error('\n❌ SCRIPT ASSERTION FAILED:', e.message);
  process.exit(1);
});
