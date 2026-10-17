/**
 * Disruption State Machine (Pure Module)
 * Strictly typed deterministic transitions:
 * NORMAL -> (DELAYED | CANCELLED | MISSED_CONNECTION | PLATFORM_CHANGE) -> RESOLVED -> NORMAL
 */

export type DisruptionStateKind =
  | 'NORMAL'
  | 'DELAYED'
  | 'CANCELLED'
  | 'MISSED_CONNECTION'
  | 'PLATFORM_CHANGE'
  | 'RESOLVED';

export interface DisruptionFSMState {
  kind: DisruptionStateKind;
  delayMinutes: number; // 0, 10, 25, 60
  reasonEn: string;
  reasonHi: string;
  selectedOptionId?: string;
  outcomeAction?: 'resume' | 'reroute' | 'rebook' | 'cab';
  timestamp: number;
}

export type DisruptionEvent =
  | { type: 'TRIGGER_DELAY'; minutes: 10 | 25 | 60 }
  | { type: 'TRIGGER_CANCELLATION' }
  | { type: 'TRIGGER_MISSED_CONNECTION' }
  | { type: 'TRIGGER_PLATFORM_CHANGE'; fromPlatform: number; toPlatform: number }
  | { type: 'RESOLVE_DISRUPTION'; optionId: string; outcomeAction: 'resume' | 'reroute' | 'rebook' | 'cab' }
  | { type: 'UNDO_RESOLUTION'; previousState: DisruptionFSMState }
  | { type: 'RESET_NORMAL' };

export const INITIAL_DISRUPTION_STATE: DisruptionFSMState = {
  kind: 'NORMAL',
  delayMinutes: 0,
  reasonEn: 'All signals clear. Journey on schedule.',
  reasonHi: 'सभी सिग्नल साफ़। यात्रा निर्धारित समय पर है।',
  timestamp: 0,
};

/**
 * Pure transition reducer
 */
export function disruptionReducer(
  current: DisruptionFSMState,
  event: DisruptionEvent
): DisruptionFSMState {
  switch (event.type) {
    case 'TRIGGER_DELAY':
      return {
        kind: 'DELAYED',
        delayMinutes: event.minutes,
        reasonEn: `Preceding freight congestion causing ${event.minutes}-minute signal delay.`,
        reasonHi: `आगे मालगाड़ी के कारण ${event.minutes} मिनट का सिग्नल विलंब।`,
        timestamp: Date.now(),
      };

    case 'TRIGGER_CANCELLATION':
      return {
        kind: 'CANCELLED',
        delayMinutes: 999,
        reasonEn: 'Emergency track maintenance ahead at Km 74. Section halt enforced.',
        reasonHi: 'किमी ७४ पर आपातकालीन ट्रैक रखरखाव। खंड रोक लागू।',
        timestamp: Date.now(),
      };

    case 'TRIGGER_MISSED_CONNECTION':
      return {
        kind: 'MISSED_CONNECTION',
        delayMinutes: 25,
        reasonEn: 'Connecting Kalka Shatabdi departure at Ambala Cantt missed by 25 min.',
        reasonHi: 'अम्बाला कैंट पर कनेक्टिंग कालका शताब्दी २५ मिनट से छूटेगी।',
        timestamp: Date.now(),
      };

    case 'TRIGGER_PLATFORM_CHANGE':
      return {
        kind: 'PLATFORM_CHANGE',
        delayMinutes: 12,
        reasonEn: `Berth reallocation at Panipat Jn: diverted from Platform ${event.fromPlatform} to Platform ${event.toPlatform}.`,
        reasonHi: `पानीपत जं. पर प्लेटफ़ॉर्म परिवर्तन: प्लेटफ़ॉर्म ${event.fromPlatform} से प्लेटफ़ॉर्म ${event.toPlatform} में डायवर्ट।`,
        timestamp: Date.now(),
      };

    case 'RESOLVE_DISRUPTION':
      return {
        ...current,
        kind: 'RESOLVED',
        selectedOptionId: event.optionId,
        outcomeAction: event.outcomeAction,
        timestamp: Date.now(),
      };

    case 'UNDO_RESOLUTION':
      return {
        ...event.previousState,
        timestamp: Date.now(),
      };

    case 'RESET_NORMAL':
    default:
      return {
        ...INITIAL_DISRUPTION_STATE,
        timestamp: Date.now(),
      };
  }
}
