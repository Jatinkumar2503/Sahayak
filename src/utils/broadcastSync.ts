/**
 * BroadcastChannel helper for cross-tab synchronization of Family Share & Disruption State.
 * Enables real-time synchronization between passenger view and family tracking tabs
 * without external servers or network dependencies.
 */

export interface SyncPayload {
  status: string;
  disruptionType: string;
  confirmedOption: any | null;
  activeBranch: 'main' | 'branch';
  timestamp: number;
}

let syncChannel: BroadcastChannel | null = null;

export function getSyncChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return null;
  }
  if (!syncChannel) {
    try {
      syncChannel = new BroadcastChannel('sahayak_family_sync');
    } catch {
      return null;
    }
  }
  return syncChannel;
}

export function broadcastJourneyState(payload: SyncPayload) {
  const channel = getSyncChannel();
  if (channel) {
    try {
      channel.postMessage({
        type: 'JOURNEY_SYNC',
        payload,
      });
    } catch {
      // Ignore broadcast error
    }
  }
}
