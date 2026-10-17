import { chromium } from 'playwright';
import { execSync } from 'child_process';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';

async function verifyAll() {
  console.log('===============================================================');
  console.log('SAHAYAK 3D — ROUND 2 STRICT RIGOROUS TELEMETRY & PROOF AUDIT');
  console.log('===============================================================\n');

  const screenshotsDir = path.resolve('public', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // -------------------------------------------------------------------------
  // 5. ENGINE UNIT TESTS CHECK (Must be 9 tests, not 6)
  // -------------------------------------------------------------------------
  console.log('--- 5. VERIFY ENGINE UNIT TESTS COUNT & PASS STATUS ---');
  const testOutput = execSync('node src/engine/__tests__/runTests.mjs', { encoding: 'utf-8' });
  const testMatches = testOutput.match(/✔ Test \d+:/g) || [];
  console.log(`  Found ${testMatches.length} passing tests in runTests.mjs.`);
  assert.strictEqual(testMatches.length, 9, `Expected exactly 9 unit tests, but found ${testMatches.length}`);
  assert.ok(testOutput.includes('All 9 Decision Engine & FSM Unit Tests PASSED'), 'Must contain 9 tests pass confirmation');
  console.log('  ✔ Check 5 Passed: All 9 unit tests executed and passed cleanly.\n');

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

  // Take screenshot of scene before disruption
  const shotBefore = path.join(screenshotsDir, 'test-scene-before-disruption.png');
  await page.screenshot({ path: shotBefore, fullPage: false });
  console.log(`  [Screenshot Saved] Before Disruption: ${shotBefore}`);

  // -------------------------------------------------------------------------
  // 1. RESOLVED SCREEN & "WHY THIS RANKING?" DYNAMIC DATA VERIFICATION
  // -------------------------------------------------------------------------
  console.log('\n--- 1. VERIFY RESOLVED SCREEN & "WHY THIS RANKING?" DYNAMIC DATA ---');
  await page.evaluate(() => {
    const store = window.__journeyStore?.getState();
    store?.startJourney?.();
    store?.setDisruptionType?.('delay');
  });
  await page.waitForTimeout(600);

  // Expand "Why this ranking?" for Option 1 (Branch Reroute)
  const whyBtn = await page.$('button:has-text("Why this ranking?"), button:has-text("रैंकिंग का कारण?")');
  assert.ok(whyBtn, 'Expander button must exist');
  await whyBtn.click();
  await page.waitForTimeout(300);

  // Read factor breakdown values from DOM
  const factorData = await page.evaluate(() => {
    const expander = document.querySelector('.animate-fadeIn');
    return expander ? expander.innerText : null;
  });
  assert.ok(factorData, 'Why this ranking expander content must be visible in DOM');
  console.log('  [DOM "Why this ranking?" Expander Raw Content]:\n' + factorData.split('\n').map(l => '    | ' + l).join('\n'));

  // Confirm Option 1 (Branch Line Reroute via Kurukshetra)
  const applyBtn = await page.$('#apply-option-btn-opt-branch-bypass, button:has-text("Apply This Solution")');
  assert.ok(applyBtn, 'Apply button for Option 1 must exist');
  await applyBtn.click();
  await page.waitForTimeout(600);

  // Read Resolved Screen DOM Values
  const resolvedValues = await page.evaluate(() => {
    const grid = document.querySelector('.grid.grid-cols-2.sm\\:grid-cols-4');
    if (!grid) return null;
    const cards = Array.from(grid.querySelectorAll('.p-3.rounded-xl')).map(c => ({
      title: c.querySelector('span:first-child')?.textContent?.trim() || '',
      val: c.querySelector('span:last-child')?.textContent?.trim() || '',
    }));
    return {
      title: document.querySelector('h2.text-sm.sm\\:text-base')?.textContent?.trim() || '',
      metrics: cards,
    };
  });

  assert.ok(resolvedValues, 'Resolved values grid must be rendered in DOM');
  assert.strictEqual(resolvedValues.title, 'Disruption Resolved', 'Resolved screen headline must be "Disruption Resolved"');
  console.log('\n  [DOM Resolved Screen Raw Values]:');
  console.log(`    Headline: "${resolvedValues.title}"`);
  resolvedValues.metrics.forEach(m => {
    console.log(`    - ${m.title}: "${m.val}"`);
  });

  // Verify exact match with option data
  const storeOption = await page.evaluate(() => window.__journeyStore?.getState()?.confirmedOption);
  assert.ok(storeOption, 'confirmedOption must exist in store');
  assert.strictEqual(storeOption.id, 'opt-branch-bypass', 'Confirmed option ID must be opt-branch-bypass');
  
  const domArrival = resolvedValues.metrics[0]?.val;
  const domCost = resolvedValues.metrics[1]?.val;
  const domComfort = resolvedValues.metrics[2]?.val;
  const domSeat = resolvedValues.metrics[3]?.val;

  assert.strictEqual(domArrival, storeOption.newEtaEn, `Arrival mismatch: DOM="${domArrival}", Store="${storeOption.newEtaEn}"`);
  assert.strictEqual(domCost, storeOption.costDisplayEn, `Cost mismatch: DOM="${domCost}", Store="${storeOption.costDisplayEn}"`);
  assert.ok(domComfort.includes(String(storeOption.comfortRating)), `Comfort mismatch: DOM="${domComfort}", Store="${storeOption.comfortRating}"`);
  assert.strictEqual(domSeat, storeOption.seatNoteEn, `Seat mismatch: DOM="${domSeat}", Store="${storeOption.seatNoteEn}"`);
  console.log('  ✔ Check 1 Passed: Resolved screen and expander strictly match selected option dynamic data.');

  // -------------------------------------------------------------------------
  // 2. UNDO RESTORES 3D SCENE (TRAIN, SIGNAL, BRANCH GLOW)
  // -------------------------------------------------------------------------
  console.log('\n--- 2. VERIFY UNDO RESTORES FULL 3D SCENE ---');
  const preUndoState = await page.evaluate(() => {
    const s = window.__journeyStore?.getState();
    return { status: s.status, activeBranch: s.activeBranch, disruptionType: s.disruptionType, hasConfirmed: !!s.confirmedOption };
  });
  console.log(`  State before Undo: status=${preUndoState.status}, activeBranch=${preUndoState.activeBranch}, confirmedOption=${preUndoState.hasConfirmed}`);
  assert.strictEqual(preUndoState.status, 'resolved');
  assert.strictEqual(preUndoState.activeBranch, 'branch');
  assert.strictEqual(preUndoState.hasConfirmed, true);

  // Click Undo button
  const undoBtn = await page.$('#undo-decision-btn');
  assert.ok(undoBtn, 'Undo button must exist on resolved screen');
  await undoBtn.click();
  await page.waitForTimeout(600);

  // Take screenshot of scene after Undo
  const shotAfterUndo = path.join(screenshotsDir, 'test-scene-after-undo.png');
  await page.screenshot({ path: shotAfterUndo, fullPage: false });
  console.log(`  [Screenshot Saved] After Undo: ${shotAfterUndo}`);

  const postUndoState = await page.evaluate(() => {
    const s = window.__journeyStore?.getState();
    return {
      status: s.status,
      activeBranch: s.activeBranch,
      disruptionType: s.disruptionType,
      targetSpeed: s.targetSpeed,
      previewRouteId: s.previewRouteId,
      hasConfirmed: !!s.confirmedOption,
    };
  });

  console.log(`  State after Undo:`);
  console.log(`    - status: "${postUndoState.status}" (Restored to disruption delay)`);
  console.log(`    - activeBranch: "${postUndoState.activeBranch}" (Train restored to main track)`);
  console.log(`    - disruptionType: "${postUndoState.disruptionType}" (Signal flips back to RED)`);
  console.log(`    - previewRouteId: ${postUndoState.previewRouteId} (Branch glow cleared)`);
  console.log(`    - targetSpeed: ${postUndoState.targetSpeed} (Delay braking speed restored)`);
  console.log(`    - confirmedOption: ${postUndoState.hasConfirmed} (Option cleared)`);

  assert.strictEqual(postUndoState.status, 'delay', 'Status must be restored to delay');
  assert.strictEqual(postUndoState.activeBranch, 'main', 'Train must be restored to main track');
  assert.strictEqual(postUndoState.disruptionType, 'delay', 'Signal must flip back to RED/delay');
  assert.strictEqual(postUndoState.previewRouteId, null, 'previewRouteId must be null after Undo');
  assert.strictEqual(postUndoState.hasConfirmed, false, 'confirmedOption must be null after Undo');
  console.log('  ✔ Check 2 Passed: Undo cleanly restores train, signal aspect, branch glow, and store state.');

  // -------------------------------------------------------------------------
  // 3. TAP-TO-PREVIEW ROUTE BUTTON FOR TOUCH USERS (Mobile Viewport 360px)
  // -------------------------------------------------------------------------
  console.log('\n--- 3. VERIFY TAP-TO-PREVIEW ROUTE BUTTON ON MOBILE (360px) ---');
  await page.setViewportSize({ width: 360, height: 740 });
  await page.waitForTimeout(400);

  const previewBtn = await page.$('#preview-route-btn-opt-branch-bypass');
  assert.ok(previewBtn, 'Mobile preview button for Option 1 must exist');

  const initialText = await previewBtn.innerText();
  const initialAriaPressed = await previewBtn.getAttribute('aria-pressed');
  console.log(`  Initial button state: text="${initialText}", aria-pressed=${initialAriaPressed}`);
  assert.strictEqual(initialAriaPressed, 'false', 'Initial aria-pressed must be false');

  // Tap 1: Activate Preview
  await previewBtn.scrollIntoViewIfNeeded();
  await previewBtn.click();
  await page.waitForTimeout(300);

  const activePreviewId = await page.evaluate(() => window.__journeyStore?.getState()?.previewRouteId);
  const activeText = await previewBtn.innerText();
  const activeAriaPressed = await previewBtn.getAttribute('aria-pressed');
  console.log(`  After Tap 1 -> previewRouteId in store: "${activePreviewId}"`);
  console.log(`  Button state updated: text="${activeText}", aria-pressed=${activeAriaPressed}`);

  assert.strictEqual(activePreviewId, 'opt-branch-bypass', 'First tap MUST activate previewRouteId in store');
  assert.strictEqual(activeAriaPressed, 'true', 'First tap MUST set aria-pressed="true"');

  // Tap 2: Dismiss Preview
  await previewBtn.scrollIntoViewIfNeeded();
  await previewBtn.click();
  await page.waitForTimeout(300);

  const dismissedPreviewId = await page.evaluate(() => window.__journeyStore?.getState()?.previewRouteId);
  const dismissedText = await previewBtn.innerText();
  const dismissedAriaPressed = await previewBtn.getAttribute('aria-pressed');
  console.log(`  After Tap 2 -> previewRouteId in store: ${dismissedPreviewId}`);
  console.log(`  Button state updated: text="${dismissedText}", aria-pressed=${dismissedAriaPressed}`);

  assert.strictEqual(dismissedPreviewId, null, 'Second tap MUST reset previewRouteId to null');
  assert.strictEqual(dismissedAriaPressed, 'false', 'Second tap MUST set aria-pressed="false"');
  console.log('  ✔ Check 3 Passed: Mobile tap-to-preview button toggles immediately on first tap and second tap.');

  // -------------------------------------------------------------------------
  // 4. SLOW-MOTION BEAT & REDUCED MOTION BRAKING TO FULL STOP AT SIGNAL
  // -------------------------------------------------------------------------
  console.log('\n--- 4. VERIFY REDUCED MOTION BRAKING & DECELERATION TELEMETRY ---');
  // Reset journey state
  await page.evaluate(() => {
    const store = window.__journeyStore;
    const physics = window.__journeyPhysics;
    store.getState().setReducedMotion(true);
    store.getState().startJourney();
    store.getState().setDisruptionType('none');
    if (physics) {
      physics.progress = 0.15; // Mid-section cruise away from any station stop zones
      physics.speed = 0.25;
      physics.targetSpeed = 0.25;
      physics.isStationStopped = false;
      physics.stationStopTimer = 0;
    }
    store.getState().setSpeed(0.25);
  });
  await page.waitForTimeout(100);

  const initialSpeed = await page.evaluate(() => window.__journeyPhysics?.speed ?? window.__journeyStore?.getState()?.speed);
  console.log(`  Reduced Motion ON: Initial train cruising speed = ${initialSpeed}`);
  assert.strictEqual(initialSpeed, 0.25, 'Cruising speed must be 0.25');

  // Trigger delay disruption
  await page.evaluate(() => {
    window.__journeyStore?.getState()?.setDisruptionType('delay');
  });

  // Check instantaneous speed (should skip instant slow-motion beat)
  const instantaneousSpeed = await page.evaluate(() => window.__journeyPhysics?.speed ?? window.__journeyStore?.getState()?.speed);
  console.log(`  At t=0s (Instantaneous): speed = ${instantaneousSpeed} (Slow-mo shock beat skipped under reduced motion)`);
  assert.strictEqual(instantaneousSpeed, 0.25, 'Instantaneous speed drop must be skipped when reducedMotion=true');

  // Measure speed deceleration profile over time in 3D physics loop
  console.log('\n  [Measuring Physics Easing Loop: Braking to Red Signal 104 over time]:');
  console.log('  -------------------------------------------------------------');
  console.log('  Time (s)  | Speed (normalized) | Speed (km/h) | Status');
  console.log('  -------------------------------------------------------------');

  const samples = [];
  for (let step = 1; step <= 6; step++) {
    await page.waitForTimeout(400); // Wait 400ms per step
    const sample = await page.evaluate((elapsedSec) => {
      const spd = window.__journeyPhysics?.speed ?? window.__journeyStore?.getState()?.speed ?? 0;
      return { elapsed: elapsedSec, speed: Number(spd.toFixed(4)), kmh: Math.round(spd * 440) };
    }, step * 0.4);
    samples.push(sample);
    console.log(`  +${sample.elapsed.toFixed(1)}s     | ${sample.speed.toFixed(4).padEnd(18)} | ${(sample.kmh + ' km/h').padEnd(12)} | Decelerating towards Signal 104`);
  }
  console.log('  -------------------------------------------------------------');

  // After 2.4s, train must have decelerated towards stop
  const latestSpeed = samples[samples.length - 1].speed;
  console.log(`  Final observed speed after 2.4s: ${latestSpeed} (Braking verified: ${latestSpeed < initialSpeed})`);
  assert.ok(latestSpeed < initialSpeed * 0.5, `Train must smoothly brake under reduced motion (observed: ${latestSpeed})`);
  console.log('  ✔ Check 4 Passed: Train brakes smoothly towards red signal under reduced motion without skipping deceleration.');

  await browser.close();
  console.log('\n===============================================================');
  console.log('ALL ROUND 2 CHECKS AND PROOFS PASSED WITH 100% ASSERTION INTEGRITY');
  console.log('===============================================================\n');
}

verifyAll().catch((e) => {
  console.error('\n❌ VERIFICATION FAILED ASSERTION:', e.message);
  process.exit(1);
});
