import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getDecisionOptions } from '../decisionEngine';
import { DisruptionFSMState } from '../disruptionFSM';

describe('Decision Engine Unit Tests', () => {
  it('1. Returns empty options when state is NORMAL or RESOLVED', () => {
    const normalState: DisruptionFSMState = {
      kind: 'NORMAL',
      delayMinutes: 0,
      reasonEn: 'Clear',
      reasonHi: 'साफ़',
      timestamp: Date.now(),
    };
    assert.strictEqual(getDecisionOptions(normalState).length, 0);

    const resolvedState: DisruptionFSMState = {
      kind: 'RESOLVED',
      delayMinutes: 0,
      reasonEn: 'Resolved',
      reasonHi: 'सुलझा',
      timestamp: Date.now(),
    };
    assert.strictEqual(getDecisionOptions(resolvedState).length, 0);
  });

  it('2. Short Delay (10 min) ranks Hold & Wait as #1 with ₹0 cost', () => {
    const delayState: DisruptionFSMState = {
      kind: 'DELAYED',
      delayMinutes: 10,
      reasonEn: 'Freight congestion',
      reasonHi: 'मालगाड़ी विलंब',
      timestamp: Date.now(),
    };
    const options = getDecisionOptions(delayState);
    expect(options.length).toBeGreaterThanOrEqual(2);
    expect(options[0].isTopRanked).toBe(true);
    expect(options[0].costInr).toBe(0);
    expect(options[0].actionType).toBe('resume');
  });

  it('3. Long Delay (25 min) ranks Branch Reroute as #1 saving 22 minutes', () => {
    const delayState: DisruptionFSMState = {
      kind: 'DELAYED',
      delayMinutes: 25,
      reasonEn: 'Major signal failure',
      reasonHi: 'सिग्नल विफलता',
      timestamp: Date.now(),
    };
    const options = getDecisionOptions(delayState);
    expect(options.length).toBe(3);
    expect(options[0].rank).toBe(1);
    expect(options[0].actionType).toBe('reroute');
    expect(options[0].timeDeltaMinutes).toBeLessThan(0); // Time saved
  });

  it('4. Missed Connection provides connection recovery route with highest confidence', () => {
    const missedState: DisruptionFSMState = {
      kind: 'MISSED_CONNECTION',
      delayMinutes: 25,
      reasonEn: 'Ambala connection missed',
      reasonHi: 'अम्बाला कनेक्शन छूटा',
      timestamp: Date.now(),
    };
    const options = getDecisionOptions(missedState);
    expect(options).toHaveLength(2);
    expect(options[0].confidenceScore).toBe(98);
    expect(options[0].actionType).toBe('reroute');
  });

  it('5. Cancellation provides guaranteed priority seat transfer to parallel train', () => {
    const cancelState: DisruptionFSMState = {
      kind: 'CANCELLED',
      delayMinutes: 999,
      reasonEn: 'Track blockade',
      reasonHi: 'ट्रैक अवरोध',
      timestamp: Date.now(),
    };
    const options = getDecisionOptions(cancelState);
    expect(options).toHaveLength(2);
    expect(options[0].titleEn).toContain('Shatabdi');
    expect(options[0].actionType).toBe('rebook');
    expect(options[0].costInr).toBe(0); // Full IRCTC fee protection
  });

  it('6. Platform Change provides step-free wheelchair & battery cart accessibility option', () => {
    const platState: DisruptionFSMState = {
      kind: 'PLATFORM_CHANGE',
      delayMinutes: 12,
      reasonEn: 'Platform reassigned',
      reasonHi: 'प्लेटफ़ॉर्म बदला',
      timestamp: Date.now(),
    };
    const options = getDecisionOptions(platState);
    expect(options).toHaveLength(2);
    expect(options[0].actionType).toBe('reroute');
    expect(options[1].titleEn).toContain('Battery Cart');
  });
});
