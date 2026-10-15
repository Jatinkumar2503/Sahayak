import { create } from 'zustand';
import { journeyPhysics } from './journeyPhysics';

export type JourneyStatus = 'on-time' | 'delay' | 'cancelled' | 'rerouted';
export type DisruptionType = 'none' | 'delay' | 'cancellation' | 'missed_connection' | 'platform_change';
export type TimeOfDay = 'day' | 'dusk';
export type CameraMode = 'chase' | 'cinematic' | 'map';
export type Language = 'en' | 'hi';

export interface StationInfo {
  id: string;
  nameEn: string;
  nameHi: string;
  code: string;
  progress: number; // 0 to 1 along track
  position: [number, number, number];
}

export const STATIONS: StationInfo[] = [
  {
    id: 'delhi',
    nameEn: 'New Delhi',
    nameHi: 'नई दिल्ली',
    code: 'NDLS',
    progress: 0.05,
    position: [0, 0, 0],
  },
  {
    id: 'panipat',
    nameEn: 'Panipat Junction',
    nameHi: 'पानीपत जंक्शन',
    code: 'PNP',
    progress: 0.5,
    position: [0, 0, -200],
  },
  {
    id: 'ambala',
    nameEn: 'Ambala Cantt',
    nameHi: 'अम्बाला कैंट',
    code: 'UMB',
    progress: 0.95,
    position: [0, 0, -400],
  },
];

export interface JourneyState {
  status: JourneyStatus;
  progress: number;
  speed: number;
  targetSpeed: number;
  disruptionType: DisruptionType;

  timeOfDay: TimeOfDay;
  cameraMode: CameraMode;
  showFps: boolean;

  language: Language;
  elderMode: boolean;
  reducedMotion: boolean;

  activeBranch: 'main' | 'branch';
  branchProgress: number;

  setProgress: (progress: number) => void;
  setSpeed: (speed: number) => void;
  setTargetSpeed: (targetSpeed: number) => void;
  setStatus: (status: JourneyStatus) => void;
  setDisruptionType: (disruption: DisruptionType) => void;
  toggleTimeOfDay: () => void;
  setCameraMode: (mode: CameraMode) => void;
  setShowFps: (show: boolean) => void;
  toggleLanguage: () => void;
  toggleElderMode: () => void;
  setReducedMotion: (reduced: boolean) => void;
  setActiveBranch: (branch: 'main' | 'branch') => void;
  resetJourney: () => void;
}

export const useJourneyStore = create<JourneyState>((set) => ({
  status: 'on-time',
  progress: 0.02,
  speed: 0.25,
  targetSpeed: 0.25,
  disruptionType: 'none',

  timeOfDay: 'day',
  cameraMode: 'chase',
  showFps: true,

  language: 'en',
  elderMode: false,
  reducedMotion: false,

  activeBranch: 'main',
  branchProgress: 0,

  setProgress: (progress) => {
    journeyPhysics.progress = progress;
    set({ progress });
  },
  setSpeed: (speed) => {
    journeyPhysics.speed = speed;
    set({ speed });
  },
  setTargetSpeed: (targetSpeed) => {
    journeyPhysics.targetSpeed = targetSpeed;
    set({ targetSpeed });
  },
  setStatus: (status) => set({ status }),
  setDisruptionType: (disruptionType) => {
    let nextStatus: JourneyStatus = 'on-time';
    let targetSpeed = 0.25;

    if (disruptionType === 'delay') {
      nextStatus = 'delay';
      targetSpeed = 0.02; // Slowing down to brake
    } else if (disruptionType === 'cancellation') {
      nextStatus = 'cancelled';
      targetSpeed = 0; // Hard brake
    } else if (disruptionType === 'missed_connection' || disruptionType === 'platform_change') {
      nextStatus = 'rerouted';
      targetSpeed = 0.15;
    }

    journeyPhysics.targetSpeed = targetSpeed;

    set({
      disruptionType,
      status: nextStatus,
      targetSpeed,
    });
  },
  toggleTimeOfDay: () =>
    set((state) => ({ timeOfDay: state.timeOfDay === 'day' ? 'dusk' : 'day' })),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setShowFps: (showFps) => set({ showFps }),
  toggleLanguage: () =>
    set((state) => ({ language: state.language === 'en' ? 'hi' : 'en' })),
  toggleElderMode: () => set((state) => ({ elderMode: !state.elderMode })),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setActiveBranch: (activeBranch) => {
    journeyPhysics.activeBranch = activeBranch;
    set({ activeBranch });
  },
  resetJourney: () => {
    journeyPhysics.progress = 0.02;
    journeyPhysics.speed = 0.25;
    journeyPhysics.targetSpeed = 0.25;
    journeyPhysics.activeBranch = 'main';

    set({
      status: 'on-time',
      progress: 0.02,
      speed: 0.25,
      targetSpeed: 0.25,
      disruptionType: 'none',
      activeBranch: 'main',
    });
  },
}));
