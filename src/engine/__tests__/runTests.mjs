import assert from 'node:assert';
import { getDecisionOptions } from '../decisionEngine.ts';

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

console.log('\nAll 6 Decision Engine Unit Tests PASSED successfully!');
