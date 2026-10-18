import { create } from 'zustand';
import { journeyPhysics, ShadowQualityTier, COACH_OFFSET_STEP } from './journeyPhysics';
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

export interface SignalInfo {
  id: string;
  nameEn: string;
  nameHi: string;
  code: string;
  progress: number;
  position: [number, number, number];
}

export const SIGNALS: SignalInfo[] = [
  {
    id: 'sig-102',
    nameEn: 'Signal 102',
    nameHi: 'सिग्नल १०२',
    code: 'SIG-102',
    progress: 0.22,
    position: [9.1, 0.3, -44.3],
  },
  {
    id: 'sig-104',
    nameEn: 'Signal 104',
    nameHi: 'सिग्नल १०४',
    code: 'SIG-104',
    progress: 0.44,
    position: [15.4, 0.5, -166.1],
  },
  {
    id: 'sig-106',
    nameEn: 'Signal 106',
    nameHi: 'सिग्नल १०६',
    code: 'SIG-106',
    progress: 0.68,
    position: [-16.8, 1.1, -301.5],
  },
  {
    id: 'sig-108',
    nameEn: 'Signal 108',
    nameHi: 'सिग्नल १०८',
    code: 'SIG-108',
    progress: 0.88,
    position: [-1.0, 0.2, -411.5],
  },
  {
    id: 'sig-110',
    nameEn: 'Signal 110',
    nameHi: 'सिग्नल ११०',
    code: 'SIG-110',
    progress: 0.95,
    position: [0.0, 0.2, -430.0],
  },
];

export function getNextSignalAhead(progress: number): SignalInfo {
  for (const sig of SIGNALS) {
    if (sig.progress > progress + 0.001) return sig;
  }
  // Terminal approach buffer signal at corridor terminus (never wraps backwards)
  return {
    id: 'sig-terminal',
    nameEn: 'Terminal Signal 112',
    nameHi: 'टर्मिनल सिग्नल ११२',
    code: 'SIG-112',
    progress: 0.99,
    position: [0, 0.2, -475],
  };
}

export interface PreviousDisruptionState {
  disruptionType: DisruptionType;
  status: JourneyStatus;
  activeBranch: 'main' | 'branch';
  targetSpeed: number;
  speed: number;
  progress: number;
  cameraMode: CameraMode;
}

export interface JourneyState {
  status: JourneyStatus;
  statusMessageEn: string;
  statusMessageHi: string;
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

  // Signal management
  activeSignalId: string;
  setActiveSignalId: (id: string) => void;

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

  isLoopFading: boolean;
  setIsLoopFading: (isLoopFading: boolean) => void;

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
  statusMessageEn: 'ON TIME',
  statusMessageHi: 'समय पर',
  progress: 0.06,
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
  activeSignalId: 'sig-102',

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
  isLoopFading: false,
  setIsLoopFading: (isLoopFading) => set({ isLoopFading }),

  startJourney: () => {
    journeyPhysics.targetSpeed = 0.25;
    journeyPhysics.speed = 0.05;
    set({
      journeyStarted: true,
      status: 'on-time',
      disruptionType: 'none',
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
      progress: journeyPhysics.progress,
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
      journeyPhysics.progress = prev.progress;

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
        progress: prev.progress,
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
  setActiveSignalId: (activeSignalId) => set({ activeSignalId }),
  setDisruptionType: (disruptionType) => {
    let nextStatus: JourneyStatus = 'on-time';
    let targetSpeed = 0.25;

    let nextSignalId = get().activeSignalId || 'sig-102';

    let statusMessageEn = 'ON TIME';
    let statusMessageHi = 'समय पर';

    if (disruptionType === 'delay' || disruptionType === 'cancellation') {
      nextStatus = disruptionType === 'delay' ? 'delay' : 'cancelled';
      statusMessageEn = disruptionType === 'delay' ? 'Signal ahead is red, slowing' : 'Section Halt';
      statusMessageHi = disruptionType === 'delay' ? 'आगे सिग्नल लाल है, गति धीमी हो रही है' : 'खंड रोक';
      targetSpeed = disruptionType === 'delay' ? 0.02 : 0;

      // Target the red signal immediately ahead of the train
      const nextSig = getNextSignalAhead(journeyPhysics.progress);
      nextSignalId = nextSig.id;

      const CORRIDOR_CURVE_LENGTH = 568.74;
      const SIGNAL_STOP_MARGIN_UNITS = 4.5;
      const stopProgress = (nextSig.progress - (SIGNAL_STOP_MARGIN_UNITS / CORRIDOR_CURVE_LENGTH) + 1) % 1;
      const initialDist = (stopProgress - journeyPhysics.progress) * CORRIDOR_CURVE_LENGTH;

      // Handle edge case: train is already inside the 4.5-unit stop margin before the signal or station dwell
      if (initialDist <= 0 || journeyPhysics.isStationStopped) {
        journeyPhysics.speed = 0;
        journeyPhysics.initialBrakeDist = 0;
        journeyPhysics.initialBrakeSpeed = 0;
        journeyPhysics.targetSignalProgress = nextSig.progress;
        journeyPhysics.stopProgress = journeyPhysics.progress; // Progress NEVER decreases!
        journeyPhysics.isBrakingPhase = true;
      } else {
        const currentCruiseSpeed = journeyPhysics.speed > 0.005 ? journeyPhysics.speed : 0.25;
        journeyPhysics.initialBrakeSpeed = Math.min(currentCruiseSpeed, 0.25);
        journeyPhysics.initialBrakeDist = initialDist;
        journeyPhysics.targetSignalProgress = nextSig.progress;
        journeyPhysics.stopProgress = stopProgress;
        journeyPhysics.isBrakingPhase = initialDist <= 40.0;
      }
    } else if (disruptionType === 'missed_connection' || disruptionType === 'platform_change') {
      nextStatus = 'rerouted';
      statusMessageEn = 'REROUTED';
      statusMessageHi = 'मार्ग परिवर्तित';
      targetSpeed = 0.15;
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
      statusMessageEn,
      statusMessageHi,
      activeSignalId: nextSignalId,
      targetSpeed,
      speed: journeyPhysics.speed,
      progress: journeyPhysics.progress,
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
    journeyPhysics.progress = 0.06;
    journeyPhysics.speed = 0.25;
    journeyPhysics.targetSpeed = 0.25;
    journeyPhysics.activeBranch = 'main';
    journeyPhysics.coachProgresses = [
      0.06,
      0.06 - 1 * COACH_OFFSET_STEP,
      0.06 - 2 * COACH_OFFSET_STEP,
      0.06 - 3 * COACH_OFFSET_STEP,
      0.06 - 4 * COACH_OFFSET_STEP,
    ];

    broadcastJourneyState({
      status: 'on-time',
      disruptionType: 'none',
      confirmedOption: null,
      activeBranch: 'main',
      timestamp: Date.now(),
    });

    set({
      status: 'on-time',
      progress: 0.06,
      speed: 0.25,
      targetSpeed: 0.25,
      disruptionType: 'none',
      activeBranch: 'main',
      activeSignalId: 'sig-102',
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
  (window as any).__journeyPhysics = journeyPhysics;
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
