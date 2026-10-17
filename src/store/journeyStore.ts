import { create } from 'zustand';
import { journeyPhysics, ShadowQualityTier } from './journeyPhysics';
import { broadcastJourneyState, getSyncChannel } from '@/utils/broadcastSync';

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

export interface PreviousDisruptionState {
  disruptionType: DisruptionType;
  status: JourneyStatus;
  activeBranch: 'main' | 'branch';
  targetSpeed: number;
  speed: number;
  cameraMode: CameraMode;
}

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

  // Modals & Panels
  isFamilyShareOpen: boolean;
  isDisruptionPanelOpen: boolean;
  isTimelineOpen: boolean;
  isOnboardingOpen: boolean;
  isVoiceAssistantOpen: boolean;

  // Guided Flow & UX Polish
  journeyStarted: boolean;
  isDemoToolsOpen: boolean;
  previewRouteId: string | null;
  confirmedOption: any | null;
  previousDisruptionState: PreviousDisruptionState | null;

  startJourney: () => void;
  toggleDemoTools: () => void;
  setDemoToolsOpen: (open: boolean) => void;
  setPreviewRouteId: (id: string | null) => void;
  confirmOption: (option: any) => void;
  undoConfirmedOption: () => void;

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

export const useJourneyStore = create<JourneyState>((set, get) => ({
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
  isDisruptionPanelOpen: false, // Default closed into Demo Tools
  isTimelineOpen: false,
  isOnboardingOpen: false,
  isVoiceAssistantOpen: false,

  journeyStarted: false,
  isDemoToolsOpen: false,
  previewRouteId: null,
  confirmedOption: null,
  previousDisruptionState: null,

  startJourney: () => {
    journeyPhysics.targetSpeed = 0.25;
    journeyPhysics.speed = 0.05;
    set({
      journeyStarted: true,
      status: 'on-time',
      speed: 0.05,
      targetSpeed: 0.25,
    });
  },
  toggleDemoTools: () => set((state) => ({ isDemoToolsOpen: !state.isDemoToolsOpen })),
  setDemoToolsOpen: (open) => set({ isDemoToolsOpen: open }),
  setPreviewRouteId: (previewRouteId) => set({ previewRouteId }),
  confirmOption: (option) => {
    const state = get();
    const prev: PreviousDisruptionState = {
      disruptionType: state.disruptionType,
      status: state.status,
      activeBranch: state.activeBranch,
      targetSpeed: journeyPhysics.targetSpeed,
      speed: journeyPhysics.speed,
      cameraMode: state.cameraMode,
    };

    const nextBranch = option?.actionType === 'reroute' ? 'branch' : state.activeBranch;

    // Cross-tab broadcast sync
    broadcastJourneyState({
      status: 'resolved',
      disruptionType: state.disruptionType,
      confirmedOption: option,
      activeBranch: nextBranch,
      timestamp: Date.now(),
    });

    set({
      confirmedOption: option,
      previousDisruptionState: prev,
      status: 'resolved',
      previewRouteId: null,
    });
  },
  undoConfirmedOption: () => {
    const state = get();
    const prev = state.previousDisruptionState;

    if (prev) {
      journeyPhysics.activeBranch = prev.activeBranch;
      journeyPhysics.targetSpeed = prev.targetSpeed;
      journeyPhysics.speed = prev.speed;

      broadcastJourneyState({
        status: prev.status,
        disruptionType: prev.disruptionType,
        confirmedOption: null,
        activeBranch: prev.activeBranch,
        timestamp: Date.now(),
      });

      set({
        confirmedOption: null,
        status: prev.status,
        disruptionType: prev.disruptionType,
        activeBranch: prev.activeBranch,
        targetSpeed: prev.targetSpeed,
        speed: prev.speed,
        cameraMode: prev.cameraMode,
        previewRouteId: null,
        previousDisruptionState: null,
      });
      return;
    }

    // Default fallback if no prior state was recorded
    journeyPhysics.activeBranch = 'main';
    journeyPhysics.targetSpeed = 0.02;

    broadcastJourneyState({
      status: 'delay',
      disruptionType: 'delay',
      confirmedOption: null,
      activeBranch: 'main',
      timestamp: Date.now(),
    });

    set({
      confirmedOption: null,
      status: 'delay',
      disruptionType: 'delay',
      activeBranch: 'main',
      targetSpeed: 0.02,
      cameraMode: 'chase',
      previewRouteId: null,
      previousDisruptionState: null,
    });
  },

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

    // Short dramatic slow-motion beat when disruption triggers (unless reduced motion is active)
    const currentStore = get();
    if (disruptionType !== 'none' && !currentStore.reducedMotion) {
      journeyPhysics.speed = Math.max(0.015, journeyPhysics.speed * 0.35);
    }
    journeyPhysics.targetSpeed = targetSpeed;

    broadcastJourneyState({
      status: nextStatus,
      disruptionType,
      confirmedOption: null,
      activeBranch: 'main',
      timestamp: Date.now(),
    });

    set({
      disruptionType,
      status: nextStatus,
      targetSpeed,
      previewRouteId: null,
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
      journeyPhysics.shadowQuality = next ? 'blob' : 'blob';
      return { isLiteMode: next };
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

    broadcastJourneyState({
      status: 'on-time',
      disruptionType: 'none',
      confirmedOption: null,
      activeBranch: 'main',
      timestamp: Date.now(),
    });

    set({
      status: 'on-time',
      progress: 0.02,
      speed: 0.25,
      targetSpeed: 0.25,
      disruptionType: 'none',
      activeBranch: 'main',
      journeyStarted: true,
      isDemoToolsOpen: false,
      previewRouteId: null,
      confirmedOption: null,
      previousDisruptionState: null,
    });
  },
}));

// Cross-tab synchronization listener & test automation hook
if (typeof window !== 'undefined') {
  (window as any).__journeyStore = useJourneyStore;
  const channel = getSyncChannel();
  if (channel) {
    channel.onmessage = (event) => {
      if (event.data?.type === 'JOURNEY_SYNC' && event.data.payload) {
        const p = event.data.payload;
        useJourneyStore.setState({
          status: p.status as JourneyStatus,
          disruptionType: p.disruptionType as DisruptionType,
          confirmedOption: p.confirmedOption,
          activeBranch: p.activeBranch,
        });
        if (p.activeBranch) {
          journeyPhysics.activeBranch = p.activeBranch;
        }
      }
    };
  }
}
