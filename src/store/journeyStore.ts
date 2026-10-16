import { create } from 'zustand';
import { journeyPhysics, ShadowQualityTier } from './journeyPhysics';

export type JourneyStatus = 'on-time' | 'delay' | 'cancelled' | 'rerouted' | 'resolved';
export type DisruptionType = 'none' | 'delay' | 'cancellation' | 'missed_connection' | 'platform_change';
export type TimeOfDay = 'day' | 'dusk';
export type CameraMode = 'chase' | 'cinematic' | 'map';
export type Language = 'en' | 'hi';
export type ShadowTier = 'blob' | 'dynamic' | 'auto';

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

  // Shadow tier management
  shadowTier: ShadowTier;
  scrollMode: boolean;

  // Lite mode & Low-power fallback
  isLiteMode: boolean;
  isLowPowerDetected: boolean;

  // Modals
  isFamilyShareOpen: boolean;
  isDisruptionPanelOpen: boolean;
  isTimelineOpen: boolean;
  isOnboardingOpen: boolean;
  isVoiceAssistantOpen: boolean;

  setProgress: (progress: number) => void;
  setSpeed: (speed: number) => void;
  setTargetSpeed: (targetSpeed: number) => void;
  setStatus: (status: JourneyStatus) => void;
  setDisruptionType: (disruption: DisruptionType) => void;
  toggleTimeOfDay: () => void;
  setCameraMode: (mode: CameraMode) => void;
  setShowFps: (show: boolean) => void;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  toggleElderMode: () => void;
  setElderMode: (elder: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  setActiveBranch: (branch: 'main' | 'branch') => void;
  setShadowTier: (tier: ShadowTier) => void;
  toggleScrollMode: () => void;
  toggleFamilyShare: () => void;
  setFamilyShareOpen: (open: boolean) => void;
  toggleDisruptionPanel: () => void;
  setDisruptionPanelOpen: (open: boolean) => void;
  toggleTimeline: () => void;
  setTimelineOpen: (open: boolean) => void;
  toggleVoiceAssistant: () => void;
  setVoiceAssistantOpen: (open: boolean) => void;
  toggleLiteMode: () => void;
  setLiteMode: (lite: boolean) => void;
  setLowPowerDetected: (detected: boolean) => void;
  setIsOnboardingOpen: (open: boolean) => void;
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

  shadowTier: 'blob', // Default fast contact blob shadows
  scrollMode: false,

  isLiteMode: false,
  isLowPowerDetected: false,

  isFamilyShareOpen: false,
  isDisruptionPanelOpen: true,
  isTimelineOpen: false,
  isOnboardingOpen: false,
  isVoiceAssistantOpen: false,

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
    set((state) => {
      const next = state.language === 'en' ? 'hi' : 'en';
      if (typeof window !== 'undefined') {
        localStorage.setItem('sahayak_language', next);
      }
      return { language: next };
    }),
  setLanguage: (language) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sahayak_language', language);
    }
    set({ language });
  },
  toggleElderMode: () =>
    set((state) => {
      const next = !state.elderMode;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sahayak_elder_mode', String(next));
      }
      journeyPhysics.targetSpeed = next ? 0.16 : 0.25;
      return { elderMode: next };
    }),
  setElderMode: (elderMode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sahayak_elder_mode', String(elderMode));
    }
    journeyPhysics.targetSpeed = elderMode ? 0.16 : 0.25;
    set({ elderMode });
  },
  setReducedMotion: (reducedMotion) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sahayak_reduced_motion', String(reducedMotion));
    }
    set({ reducedMotion });
  },
  setActiveBranch: (activeBranch) => {
    journeyPhysics.activeBranch = activeBranch;
    set({ activeBranch });
  },
  setShadowTier: (shadowTier) => {
    journeyPhysics.shadowQuality = shadowTier === 'dynamic' ? 'dynamic' : 'blob';
    set({ shadowTier });
  },
  toggleScrollMode: () =>
    set((state) => {
      const next = !state.scrollMode;
      journeyPhysics.scrollDriven = next;
      return { scrollMode: next };
    }),
  toggleFamilyShare: () =>
    set((state) => ({ isFamilyShareOpen: !state.isFamilyShareOpen })),
  setFamilyShareOpen: (open) => set({ isFamilyShareOpen: open }),
  toggleDisruptionPanel: () =>
    set((state) => ({ isDisruptionPanelOpen: !state.isDisruptionPanelOpen })),
  setDisruptionPanelOpen: (open) => set({ isDisruptionPanelOpen: open }),
  toggleTimeline: () =>
    set((state) => ({ isTimelineOpen: !state.isTimelineOpen })),
  setTimelineOpen: (open) => set({ isTimelineOpen: open }),
  toggleVoiceAssistant: () =>
    set((state) => ({ isVoiceAssistantOpen: !state.isVoiceAssistantOpen })),
  setVoiceAssistantOpen: (open) => set({ isVoiceAssistantOpen: open }),
  toggleLiteMode: () =>
    set((state) => {
      const next = !state.isLiteMode;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sahayak_lite_mode', String(next));
      }
      journeyPhysics.shadowQuality = 'blob';
      return { isLiteMode: next, shadowTier: 'blob' };
    }),
  setLiteMode: (isLiteMode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sahayak_lite_mode', String(isLiteMode));
    }
    journeyPhysics.shadowQuality = 'blob';
    set({ isLiteMode, shadowTier: 'blob' });
  },
  setLowPowerDetected: (isLowPowerDetected) => set({ isLowPowerDetected }),
  setIsOnboardingOpen: (open) => set({ isOnboardingOpen: open }),
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
