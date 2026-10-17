import { chromium } from 'playwright';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';
const CORRIDOR_CURVE_LENGTH = 568.74;

async function runBrakingAndDiff() {
  console.log('================================================================');
  console.log('SAHAYAK 3D — CORRIDOR SIGNAL BRAKING, STATION/ELDER & PIXEL DIFF');
  console.log('================================================================\n');

  const browser = await chromium.launch({
    executablePath: fs.existsSync(CHROME_PATH) ? CHROME_PATH : undefined,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

  // Dismiss onboarding if present
  try {
    const skipBtn = await page.$('button:has-text("Skip")');
    if (skipBtn) await skipBtn.click();
  } catch {}
  await page.waitForTimeout(500);

  // ---------------------------------------------------------------------------
  // 1. SIGNAL-TARGETED BRAKING ACROSS 5 START POSITIONS ON THE CORRIDOR
  // ---------------------------------------------------------------------------
  console.log('--- 1. TESTING DELAY BRAKING ACROSS 5 START POSITIONS ALONG CORRIDOR ---');

  const testPositions = [
    { label: 'Pos 1 (Delhi -> Panipat)', startProgress: 0.19, expectedSignal: 'Signal 102' },
    { label: 'Pos 2 (Approaching Panipat Outer)', startProgress: 0.38, expectedSignal: 'Signal 104' },
    { label: 'Pos 3 (Panipat Approach Close)', startProgress: 0.41, expectedSignal: 'Signal 104' },
    { label: 'Pos 4 (Panipat -> Ambala)', startProgress: 0.64, expectedSignal: 'Signal 106' },
    { label: 'Pos 5 (Approaching Ambala)', startProgress: 0.84, expectedSignal: 'Signal 108' },
  ];

  const brakingResults = [];

  for (let idx = 0; idx < testPositions.length; idx++) {
    const test = testPositions[idx];
    console.log(`\n  [Run ${idx + 1}/5] ${test.label}: startProgress=${test.startProgress}`);

    // Set train position and reset journey state
    await page.evaluate((pos) => {
      const store = window.__journeyStore.getState();
      const physics = window.__journeyPhysics;

      store.startJourney();
      store.setDisruptionType('none');

      physics.progress = pos;
      physics.speed = 0.25;
      physics.targetSpeed = 0.25;
      physics.isStationStopped = false;
      physics.stationStopTimer = 0;
      store.setSpeed(0.25);
    }, test.startProgress);

    await page.waitForTimeout(200);

    // Trigger delay disruption
    await page.evaluate(() => {
      window.__journeyStore.getState().setDisruptionType('delay');
    });

    const startTime = Date.now();
    let stopTime = null;
    let finalTelemetry = null;

    console.log('    Time (s)  | Speed (norm) | Dist to Signal | Target Signal | Train Progress');
    console.log('    --------------------------------------------------------------------------');

    while ((Date.now() - startTime) < 8000) {
      await page.waitForTimeout(250);
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
        ];
        const sig = signals.find((s) => s.id === activeSignalId) || signals[1];
        const distUnits = (sig.progress - physics.progress) * 568.74;

        return {
          speed: physics.speed,
          progress: physics.progress,
          signalName: sig.nameEn,
          signalProgress: sig.progress,
          distanceToSignal: Number(distUnits.toFixed(2)),
        };
      });

      const isStopped = telem.speed < 0.005;

      console.log(
        `    +${elapsedSec.toFixed(1)}s     | ${telem.speed.toFixed(4).padEnd(12)} | ${(telem.distanceToSignal + ' m').padEnd(14)} | ${telem.signalName.padEnd(13)} | ${telem.progress.toFixed(5)}`
      );

      finalTelemetry = telem;

      if (isStopped && stopTime === null) {
        stopTime = elapsedSec;
        break;
      }
    }

    console.log('    --------------------------------------------------------------------------');
    console.log(`    Result: Stop Time = ${stopTime ? stopTime.toFixed(2) + 's' : 'Timeout (>8s)'}, Final Dist = ${finalTelemetry.distanceToSignal} m`);

    // Strict assertions:
    assert.ok(stopTime !== null, `[${test.label}] Train must stop within 8.0 seconds`);
    assert.ok(stopTime <= 6.0, `[${test.label}] Stop time must be <= 6.0s (actual: ${stopTime.toFixed(2)}s)`);
    assert.ok(stopTime >= 2.0, `[${test.label}] Stop time must be >= 2.0s (actual: ${stopTime.toFixed(2)}s)`);
    assert.ok(
      finalTelemetry.distanceToSignal >= 3.0 && finalTelemetry.distanceToSignal <= 6.0,
      `[${test.label}] Train must stop short of signal within margin of 3-6 scene units (actual: ${finalTelemetry.distanceToSignal}m)`
    );
    assert.ok(
      finalTelemetry.progress < finalTelemetry.signalProgress,
      `[${test.label}] Train must never pass the signal (progress: ${finalTelemetry.progress} < signal: ${finalTelemetry.signalProgress})`
    );

    brakingResults.push({
      label: test.label,
      startProgress: test.startProgress,
      stopTime: Number(stopTime.toFixed(2)),
      finalDistance: finalTelemetry.distanceToSignal,
      targetSignal: finalTelemetry.signalName,
    });
  }

  console.log('\n  ✔ All 5 start positions PASSED signal-targeted deceleration assertions:');
  console.table(brakingResults);

  // ---------------------------------------------------------------------------
  // 2. STATION STOP & ELDER MODE DECELERATION
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. STATION STOP & ELDER MODE TELEMETRY ---');

  // A. Station Stop at Panipat (progress 0.50, slow zone starts at 0.045 distance)
  console.log('  Testing Station Stop deceleration into Panipat platform (progress = 0.50)...');
  await page.evaluate(() => {
    const store = window.__journeyStore.getState();
    const physics = window.__journeyPhysics;

    store.startJourney();
    store.setDisruptionType('none');
    physics.progress = 0.465; // Approaching station slow zone
    physics.speed = 0.25;
    physics.targetSpeed = 0.25;
    physics.isStationStopped = false;
    physics.stationStopTimer = 0;
    store.setSpeed(0.25);
  });

  const stationStartTime = Date.now();
  let stationStopTime = null;
  let stationFinalSpeed = null;

  while ((Date.now() - stationStartTime) < 8000) {
    await page.waitForTimeout(200);
    const elapsedSec = (Date.now() - stationStartTime) / 1000;

    const telem = await page.evaluate(() => {
      const physics = window.__journeyPhysics;
      return {
        speed: physics.speed,
        progress: physics.progress,
        isStationStopped: physics.isStationStopped,
        stationStopTimer: physics.stationStopTimer,
      };
    });

    if (telem.isStationStopped && stationStopTime === null) {
      stationStopTime = elapsedSec;
      stationFinalSpeed = telem.speed;
      break;
    }
  }

  console.log(`    Station stop time: ${stationStopTime ? stationStopTime.toFixed(2) + 's' : 'Timeout (>8s)'}`);
  console.log(`    Station final speed: ${stationFinalSpeed !== null ? stationFinalSpeed.toFixed(4) : 'N/A'}`);
  assert.ok(stationStopTime !== null, 'Train must enter station dwell within 8s');
  assert.ok(stationFinalSpeed < 0.005, 'Train speed at station dwell must be 0');
  console.log('  ✔ Station Stop passed: smooth deceleration into platform dwell.\n');

  // B. Elder Mode
  console.log('  Testing Elder Mode (reduced target speed)...');
  const elderData = await page.evaluate(() => {
    const store = window.__journeyStore;
    store.getState().setElderMode(true);
    const updatedState = store.getState();
    const physics = window.__journeyPhysics;
    return {
      elderMode: updatedState.elderMode,
      targetSpeed: physics.targetSpeed,
    };
  });

  console.log(`    Elder Mode state: ${elderData.elderMode ? 'ON' : 'OFF'}`);
  console.log(`    Elder targetSpeed: ${elderData.targetSpeed} (expected: 0.16)`);
  assert.strictEqual(elderData.elderMode, true, 'Elder mode must be active');
  assert.strictEqual(elderData.targetSpeed, 0.16, 'Elder mode target speed must be 0.16');
  console.log('  ✔ Elder Mode passed: targetSpeed is 0.16.\n');

  // ---------------------------------------------------------------------------
  // 3. CANVAS-ONLY PIXEL DIFF: AFTER DELAY VS AFTER UNDO
  // ---------------------------------------------------------------------------
  console.log('--- 3. CANVAS-ONLY PIXEL DIFF: AFTER DELAY VS AFTER UNDO ---');

  // Reset to clean delay state
  await page.evaluate(() => {
    const store = window.__journeyStore.getState();
    const physics = window.__journeyPhysics;

    store.setElderMode(false);
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
    return window.__journeyPhysics && window.__journeyPhysics.speed < 0.005;
  }, { timeout: 8000 });
  await page.waitForTimeout(500);

  // Capture canvas after delay triggers (before confirming option)
  const canvasLocator = page.locator('canvas');
  const bufDelay = await canvasLocator.screenshot({
    path: path.join(process.cwd(), 'public', 'screenshots', 'test-canvas-delay-state.png'),
  });
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

  // Wait for train to settle back in delay state
  await page.waitForFunction(() => {
    const store = window.__journeyStore.getState();
    return store.disruptionType === 'delay' && store.status === 'delay' && store.activeBranch === 'main';
  }, { timeout: 5000 });
  await page.waitForTimeout(800);

  // Capture canvas after Undo
  const bufUndo = await canvasLocator.screenshot({
    path: path.join(process.cwd(), 'public', 'screenshots', 'test-canvas-after-undo.png'),
  });
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
  console.log('ALL SIGNAL BRAKING, STATION/ELDER & CANVAS PIXEL DIFF CHECKS PASSED');
  console.log('================================================================\n');
}

runBrakingAndDiff().catch((e) => {
  console.error('\n❌ SCRIPT ASSERTION FAILED:', e.message);
  process.exit(1);
});
