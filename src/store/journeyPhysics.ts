/**
 * Sahayak 3D Mutable Physics State
 * Keeps high-frequency per-frame animation telemetry out of React/Zustand render trees.
 * Eliminates 60fps React component re-rendering overhead.
 */

export interface JourneyPhysicsState {
  progress: number;
  speed: number;
  targetSpeed: number;
  coachOffsets: number[]; // Arc-length offsets for engine and 4 coaches
  coachProgresses: number[];
  coachRotations: number[]; // Subtle sway angles
  wheelAngle: number;
  isStationStopped: boolean;
  stationStopTimer: number;
  doorsOpen: boolean;
  activeBranch: 'main' | 'branch';
}

// 1 Engine + 4 Coaches. Arc-length offsets (in normalized 0-1 curve progress)
// Curve total length is ~560 visual units. Coach length + coupler gap is ~7.5 units -> offset ~0.0135
export const COACH_COUNT = 5; // 1 Engine + 4 Passenger Coaches
export const COACH_OFFSET_STEP = 0.0145; // Even arc-length step

export const journeyPhysics: JourneyPhysicsState = {
  progress: 0.02,
  speed: 0.25,
  targetSpeed: 0.25,
  coachOffsets: [0, 1 * COACH_OFFSET_STEP, 2 * COACH_OFFSET_STEP, 3 * COACH_OFFSET_STEP, 4 * COACH_OFFSET_STEP],
  coachProgresses: [0.02, 0.02 - 1 * COACH_OFFSET_STEP, 0.02 - 2 * COACH_OFFSET_STEP, 0.02 - 3 * COACH_OFFSET_STEP, 0.02 - 4 * COACH_OFFSET_STEP],
  coachRotations: [0, 0, 0, 0, 0],
  wheelAngle: 0,
  isStationStopped: false,
  stationStopTimer: 0,
  doorsOpen: false,
  activeBranch: 'main',
};
