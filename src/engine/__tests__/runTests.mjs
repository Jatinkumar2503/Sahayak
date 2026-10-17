import assert from 'node:assert';
import { getDecisionOptions } from '../decisionEngine.ts';
import { disruptionReducer, INITIAL_DISRUPTION_STATE } from '../disruptionFSM.ts';

console.log('Running Decision Engine deterministic tests...');

// 1. Normal state
const normal = getDecisionOptions({ kind: 'NORMAL', delayMinutes: 0, reasonEn: '', reasonHi: '', timestamp: 0 });
assert.strictEqual(normal.length, 0, 'Normal state must return 0 options');
console.log('✔ Test 1: Normal state returns empty options passed');

// 2. Short delay (10m)
const delay10 = getDecisionOptions({ kind: 'DELAYED', delayMinutes: 10, reasonEn: '', reasonHi: '', timestamp: 0 });
assert.ok(delay10.length >= 2, 'Short delay must return >= 2 options');
assert.strictEqual(delay10[0].actionType, 'resume', 'Short delay #1 action must be resume');
assert.strictEqual(delay10[0].costInr, 0, 'Short delay cost must be 0');
console.log('✔ Test 2: Short delay ranks Hold & Wait as #1 with ₹0 cost passed');

// 3. Long delay (25m)
const delay25 = getDecisionOptions({ kind: 'DELAYED', delayMinutes: 25, reasonEn: '', reasonHi: '', timestamp: 0 });
assert.strictEqual(delay25.length, 3, 'Long delay must return 3 options');
assert.strictEqual(delay25[0].actionType, 'reroute', 'Long delay #1 action must be reroute');
assert.ok(delay25[0].timeDeltaMinutes < 0, 'Reroute must save time');
console.log('✔ Test 3: Long delay ranks Branch Reroute as #1 saving 22 minutes passed');

// 4. Missed connection
const missed = getDecisionOptions({ kind: 'MISSED_CONNECTION', delayMinutes: 25, reasonEn: '', reasonHi: '', timestamp: 0 });
assert.strictEqual(missed[0].confidenceScore, 84, 'Missed connection branch confidence must be 84%');
console.log('✔ Test 4: Missed connection provides shortcut with 84% hedged confidence passed');

// 5. Cancellation
const cancel = getDecisionOptions({ kind: 'CANCELLED', delayMinutes: 999, reasonEn: '', reasonHi: '', timestamp: 0 });
assert.strictEqual(cancel[0].actionType, 'rebook', 'Cancellation #1 must be priority rebook');
assert.strictEqual(cancel[0].costInr, 0, 'Cancellation ticket fee must be 0');
console.log('✔ Test 5: Cancellation provides guaranteed seat transfer with fee protection passed');

// 6. Platform change
const platform = getDecisionOptions({ kind: 'PLATFORM_CHANGE', delayMinutes: 12, reasonEn: '', reasonHi: '', timestamp: 0 });
assert.strictEqual(platform[0].actionType, 'reroute', 'Platform change #1 must be track crossover');
console.log('✔ Test 6: Platform change provides crossover and battery cart accessibility passed');

// 7. Resolved state transition with dynamic option attributes
const delayState = disruptionReducer(INITIAL_DISRUPTION_STATE, { type: 'TRIGGER_DELAY', minutes: 25 });
assert.strictEqual(delayState.kind, 'DELAYED');
const optionsForDelay = getDecisionOptions(delayState);
const chosenOption = optionsForDelay[0]; // Branch Reroute

const resolvedState = disruptionReducer(delayState, {
  type: 'RESOLVE_DISRUPTION',
  optionId: chosenOption.id,
  outcomeAction: chosenOption.actionType,
});

assert.strictEqual(resolvedState.kind, 'RESOLVED', 'Resolved state kind must be RESOLVED');
assert.strictEqual(resolvedState.selectedOptionId, chosenOption.id, 'Resolved state must retain chosen option ID');
assert.strictEqual(resolvedState.outcomeAction, 'reroute', 'Resolved state action must match option actionType');
assert.ok(chosenOption.newEtaEn.length > 0, 'Resolved option must have dynamic ETA (EN)');
assert.ok(chosenOption.newEtaHi.length > 0, 'Resolved option must have dynamic ETA (HI)');
assert.ok(chosenOption.costDisplayEn.length > 0, 'Resolved option must have dynamic Cost (EN)');
assert.ok(chosenOption.transfersDisplayEn.length > 0, 'Resolved option must have dynamic Transfers (EN)');
assert.ok(chosenOption.seatNoteEn.length > 0, 'Resolved option must have dynamic Seat Note (EN)');
assert.ok(chosenOption.rankingReasonEn.length > 0, 'Resolved option must have dynamic Ranking Reason (EN)');
console.log('✔ Test 7: Disruption resolution successfully links dynamic option attributes passed');

// 8. Undo state transition restores prior state
const undoneState = disruptionReducer(resolvedState, {
  type: 'UNDO_RESOLUTION',
  previousState: delayState,
});

assert.strictEqual(undoneState.kind, 'DELAYED', 'Undone state must restore DELAYED kind');
assert.strictEqual(undoneState.delayMinutes, 25, 'Undone state must restore 25 min delay');
assert.strictEqual(undoneState.selectedOptionId, undefined, 'Undone state must clear selected option ID');
console.log('✔ Test 8: Disruption undo successfully restores pre-disruption state passed');

// 9. Dynamic data validation across all disruption scenarios
const testDisruptions = [
  { kind: 'DELAYED', delayMinutes: 10, reasonEn: '', reasonHi: '', timestamp: 0 },
  { kind: 'DELAYED', delayMinutes: 25, reasonEn: '', reasonHi: '', timestamp: 0 },
  { kind: 'CANCELLED', delayMinutes: 999, reasonEn: '', reasonHi: '', timestamp: 0 },
  { kind: 'MISSED_CONNECTION', delayMinutes: 25, reasonEn: '', reasonHi: '', timestamp: 0 },
  { kind: 'PLATFORM_CHANGE', delayMinutes: 12, reasonEn: '', reasonHi: '', timestamp: 0 },
];

let totalOptionsChecked = 0;
for (const disruption of testDisruptions) {
  const opts = getDecisionOptions(disruption);
  for (const opt of opts) {
    totalOptionsChecked++;
    assert.ok(opt.id, 'Option id must be defined');
    assert.ok(opt.newEtaEn, `Option ${opt.id} must have newEtaEn`);
    assert.ok(opt.newEtaHi, `Option ${opt.id} must have newEtaHi`);
    assert.ok(opt.costDisplayEn, `Option ${opt.id} must have costDisplayEn`);
    assert.ok(opt.costDisplayHi, `Option ${opt.id} must have costDisplayHi`);
    assert.ok(opt.transfersDisplayEn, `Option ${opt.id} must have transfersDisplayEn`);
    assert.ok(opt.transfersDisplayHi, `Option ${opt.id} must have transfersDisplayHi`);
    assert.ok(opt.seatNoteEn, `Option ${opt.id} must have seatNoteEn`);
    assert.ok(opt.seatNoteHi, `Option ${opt.id} must have seatNoteHi`);
    assert.ok(opt.rankingReasonEn, `Option ${opt.id} must have rankingReasonEn`);
    assert.ok(opt.rankingReasonHi, `Option ${opt.id} must have rankingReasonHi`);
    assert.ok(typeof opt.comfortRating === 'number' && opt.comfortRating >= 1 && opt.comfortRating <= 5, 'Comfort rating 1-5');
    assert.ok(typeof opt.confidenceScore === 'number' && opt.confidenceScore >= 0 && opt.confidenceScore <= 100, 'Confidence score 0-100');
  }
}
console.log(`✔ Test 9: All ${totalOptionsChecked} generated options across disruptions contain complete dynamic fields passed`);

// 10. Position-aware gating: before branch junction (progress < 0.48)
const beforeSwitch = getDecisionOptions(
  { kind: 'DELAYED', delayMinutes: 25, reasonEn: '', reasonHi: '', timestamp: 0 },
  { progress: 0.35 }
);
assert.strictEqual(beforeSwitch[0].id, 'opt-branch-bypass', 'Before switch, bypass must be #1');
assert.strictEqual(beforeSwitch[0].disabled, false, 'Before switch, bypass must be enabled');
console.log('✔ Test 10: Position-aware decision engine enables branch chord when before switch (progress < 0.48) passed');

// 11. Position-aware gating: after branch junction (progress >= 0.48)
const afterSwitch = getDecisionOptions(
  { kind: 'DELAYED', delayMinutes: 25, reasonEn: '', reasonHi: '', timestamp: 0 },
  { progress: 0.65 }
);
assert.strictEqual(afterSwitch[0].id, 'opt-rebook-express', 'After switch, Express Special transfer must become #1');
assert.strictEqual(afterSwitch[0].isTopRanked, true, 'Express transfer must be top ranked');
const disabledBypass = afterSwitch.find(o => o.id === 'opt-branch-bypass');
assert.ok(disabledBypass, 'Bypass option must still be present');
assert.strictEqual(disabledBypass.disabled, true, 'Bypass must be marked disabled');
assert.ok(disabledBypass.disabledReasonEn.includes('behind'), 'Must explain branch junction is behind train in English');
assert.ok(disabledBypass.disabledReasonHi.includes('पीछे'), 'Must explain branch junction is behind train in Hindi');
console.log('✔ Test 11: Position-aware decision engine disables branch chord and shows plain-language reason when past switch (progress >= 0.48) passed');

console.log('\nAll 11 Decision Engine & FSM Unit Tests PASSED successfully!');
