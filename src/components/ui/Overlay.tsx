'use client';

import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  OctagonAlert,
  GitBranch,
  Accessibility,
  Languages,
  RotateCcw,
  Volume2,
  VolumeX,
  Megaphone,
  Users,
  Sparkles,
  Mic,
  Compass,
  HelpCircle,
  Eye,
  Zap,
  Palette,
} from 'lucide-react';
import Link from 'next/link';
import { useJourneyStore, STATIONS } from '@/store/journeyStore';
import { journeyPhysics } from '@/store/journeyPhysics';
import { railwayAudio } from '@/utils/audioEngine';
import { translations } from '@/i18n/translations';

export function Overlay() {
  const status = useJourneyStore((s) => s.status);
  const timeOfDay = useJourneyStore((s) => s.timeOfDay);
  const cameraMode = useJourneyStore((s) => s.cameraMode);
  const language = useJourneyStore((s) => s.language);
  const elderMode = useJourneyStore((s) => s.elderMode);
  const reducedMotion = useJourneyStore((s) => s.reducedMotion);
  const disruptionType = useJourneyStore((s) => s.disruptionType);
  const isLiteMode = useJourneyStore((s) => s.isLiteMode);
  const isLowPowerDetected = useJourneyStore((s) => s.isLowPowerDetected);

  const toggleTimeOfDay = useJourneyStore((s) => s.toggleTimeOfDay);
  const setCameraMode = useJourneyStore((s) => s.setCameraMode);
  const toggleLanguage = useJourneyStore((s) => s.toggleLanguage);
  const toggleElderMode = useJourneyStore((s) => s.toggleElderMode);
  const toggleLiteMode = useJourneyStore((s) => s.toggleLiteMode);
  const setReducedMotion = useJourneyStore((s) => s.setReducedMotion);
  const resetJourney = useJourneyStore((s) => s.resetJourney);

  const t = translations[language];

  // Throttled HUD metrics (updated at 4Hz to prevent 60fps React re-renders)
  const [hudState, setHudState] = useState({
    progress: 0.02,
    speed: 0.25,
  });
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setHudState({
        progress: journeyPhysics.progress,
        speed: journeyPhysics.speed,
      });
    }, 250);
    return () => clearInterval(interval);
  }, []);

  const isHindi = language === 'hi';

  // Find next station
  const nextStation =
    STATIONS.find((st) => st.progress > hudState.progress) || STATIONS[STATIONS.length - 1];

  // Authentic Okabe-Ito status badge config (colorblind-safe icons + patterns + text)
  const getStatusBadge = () => {
    switch (status) {
      case 'resolved':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />,
          labelEn: 'RESOLVED',
          labelHi: 'समाधान लागू',
          classes: 'bg-[#004D38]/60 text-[#D1FAE5] border-emerald-400 shadow-emerald-400/20',
          pattern: 'border-solid border-2',
        };
      case 'delay':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-[#E69F00]" aria-hidden="true" />,
          labelEn: 'DELAYED (+25m)',
          labelHi: 'विलंबित (+२५ मि.)',
          classes: 'bg-[#7A5400]/40 text-[#FEF3C7] border-[#E69F00] shadow-[#E69F00]/20',
          pattern: 'border-dashed border-2',
        };
      case 'cancelled':
        return {
          icon: <XCircle className="w-4 h-4 text-[#D55E00]" aria-hidden="true" />,
          labelEn: 'SECTION HALT',
          labelHi: 'खंड रोक',
          classes: 'bg-[#6E3100]/40 text-[#FFE4E6] border-[#D55E00] shadow-[#D55E00]/20',
          pattern: 'border-dotted border-2',
        };
      case 'rerouted':
        return {
          icon: <GitBranch className="w-4 h-4 text-[#56B4E9]" aria-hidden="true" />,
          labelEn: 'REROUTED (BRANCH)',
          labelHi: 'मार्ग परिवर्तित (शाखा)',
          classes: 'bg-[#003B5C]/40 text-[#DBEAFE] border-[#0072B2] shadow-[#0072B2]/20',
          pattern: 'border-double border-4',
        };
      case 'on-time':
      default:
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-[#009E73]" aria-hidden="true" />,
          labelEn: 'ON TIME',
          labelHi: 'समय पर',
          classes: 'bg-[#004D38]/40 text-[#D1FAE5] border-[#009E73] shadow-[#009E73]/20',
          pattern: 'border-solid border-2',
        };
    }
  };

  // Signal 104 HTML Aspect (SVG Icon & Text Fallback, never relying on color alone)
  const getSignalAspect = () => {
    if (disruptionType === 'delay' || disruptionType === 'cancellation') {
      return {
        icon: <OctagonAlert className="w-3.5 h-3.5 text-[#D55E00]" aria-hidden="true" />,
        textEn: 'Signal 104: STOP (Red)',
        textHi: 'सिग्नल १०४: रोकें (लाल)',
        colorClass: 'text-[#FEF3C7] bg-[#6E3100]/70 border-[#D55E00]',
      };
    }
    if (disruptionType === 'missed_connection' || disruptionType === 'platform_change') {
      return {
        icon: <AlertTriangle className="w-3.5 h-3.5 text-[#E69F00]" aria-hidden="true" />,
        textEn: 'Signal 104: CAUTION (Yellow)',
        textHi: 'सिग्नल १०४: सावधानी (पीला)',
        colorClass: 'text-[#FEF3C7] bg-[#7A5400]/70 border-[#E69F00]',
      };
    }
    return {
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#009E73]" aria-hidden="true" />,
      textEn: 'Signal 104: CLEAR (Green)',
      textHi: 'सिग्नल १०४: साफ़ (हरा)',
      colorClass: 'text-[#D1FAE5] bg-[#004D38]/70 border-[#009E73]',
    };
  };

  const statusBadge = getStatusBadge();
  const signalAspect = getSignalAspect();

  return (
    <div
      className={`absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-30 select-none ${
        elderMode ? 'font-sans text-base' : 'text-xs'
      }`}
    >
      {/* Skip to Content for Screen Readers & Keyboard Nav */}
      <a
        href="#main-controls"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-[#E69F00] text-slate-950 font-bold px-4 py-2.5 focus:min-h-[44px] focus:inline-flex focus:items-center rounded-xl shadow-2xl focus:outline-none focus:ring-4 focus:ring-white"
      >
        {t.skipToContent}
      </a>

      {/* Screen Reader Live Region for Status Changes */}
      <div className="sr-only" aria-live="polite" role="status">
        {isHindi
          ? `वर्तमान स्थिति: ${statusBadge.labelHi}, गति: ${(hudState.speed * 440).toFixed(0)} किमी प्रति घंटा`
          : `Current Journey Status: ${statusBadge.labelEn}, Speed: ${(hudState.speed * 440).toFixed(0)} km/h`}
      </div>

      {/* Top Navigation & Status Bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        {/* Brand & Train Badge */}
        <div className="flex items-center gap-3 bg-slate-950/85 backdrop-blur-md border border-slate-700/60 px-4 py-2 rounded-2xl shadow-2xl">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0072B2] to-[#E69F00] flex items-center justify-center font-black text-slate-950 text-sm shadow-md">
            IR
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-100 leading-tight">
              Sahayak 3D <span className="text-xs font-semibold text-[#E69F00]">/ सहायक ३डी</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Live Status Pill with Authentic Okabe-Ito colorblind-safe styling */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black shadow-lg backdrop-blur-md transition-all duration-300 ${statusBadge.classes} ${statusBadge.pattern}`}
        >
          {statusBadge.icon}
          <span>{isHindi ? statusBadge.labelHi : statusBadge.labelEn}</span>
        </div>

        {/* Live Signal 104 Aspect Badge (SVG Icon & Text, never relying on color alone) */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md shadow-lg transition-all ${signalAspect.colorClass}`}
          title="Trackside Signal 104 aspect status (Accessibility Text Alternative)"
        >
          {signalAspect.icon}
          <span>{isHindi ? signalAspect.textHi : signalAspect.textEn}</span>
        </div>

        {/* Primary Interactive Modules: Family Share, Voice Assistant, Timeline */}
        <div className="flex items-center gap-2">
          {/* Family Live Share Phone Trigger Button */}
          <button
            onClick={useJourneyStore.getState().toggleFamilyShare}
            className="flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-[#E69F00]"
            title={isHindi ? 'परिवार लाइव शेयर देखें' : 'View Family Live Share'}
          >
            <Users className="w-4 h-4" />
            <span>{isHindi ? 'परिवार शेयर' : 'Family Share'}</span>
          </button>

          {/* Voice Assistant Button */}
          <button
            onClick={useJourneyStore.getState().toggleVoiceAssistant}
            className="flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl bg-amber-500/90 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-white"
            title={t.voiceTitle}
          >
            <Mic className="w-4 h-4" />
            <span>{isHindi ? 'वॉयस' : 'Voice'}</span>
          </button>

          {/* Accessible HTML Timeline Panel Toggle */}
          <button
            onClick={useJourneyStore.getState().toggleTimeline}
            className="flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold text-xs border border-slate-700 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-400"
            title={t.timelineTitle}
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">{isHindi ? 'समयरेखा' : 'Timeline'}</span>
          </button>

          {/* Onboarding Help Guide Button */}
          <button
            onClick={() => useJourneyStore.getState().setIsOnboardingOpen(true)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 flex items-center justify-center min-h-[44px] min-w-[44px] active:scale-95"
            title={t.onboardingTitle}
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Design System Link */}
          <Link
            href="/design-system"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 flex items-center justify-center min-h-[44px] min-w-[44px] active:scale-95"
            title="Design System & Tokens"
          >
            <Palette className="w-5 h-5" />
          </Link>
        </div>

        {/* Accessibility & Environment Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-700/60 p-1.5 rounded-2xl shadow-2xl">
          {/* Day / Dusk Toggle */}
          <button
            onClick={toggleTimeOfDay}
            title={timeOfDay === 'day' ? 'Switch to Dusk Mode' : 'Switch to Day Mode'}
            aria-label={`Current lighting is ${timeOfDay}. Click to toggle.`}
            className="p-2.5 rounded-xl text-slate-300 hover:text-[#E69F00] hover:bg-slate-800 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 focus-visible:ring-2 focus-visible:ring-[#E69F00]"
          >
            {timeOfDay === 'day' ? (
              <Sun className="w-5 h-5 text-[#E69F00]" />
            ) : (
              <Moon className="w-5 h-5 text-[#56B4E9]" />
            )}
          </button>

          {/* Camera View Switcher */}
          <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
            {(['chase', 'cinematic', 'map'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setCameraMode(mode)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#E69F00] ${
                  cameraMode === mode
                    ? 'bg-[#0072B2] text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`Switch to ${mode} camera view`}
              >
                {mode === 'chase' ? 'Chase' : mode === 'cinematic' ? 'Side' : 'Map'}
              </button>
            ))}
          </div>

          {/* Hindi / English Toggle */}
          <button
            onClick={toggleLanguage}
            title="Toggle Hindi/English Language"
            className="flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-bold rounded-xl text-slate-300 hover:text-[#E69F00] hover:bg-slate-800 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-[#E69F00]"
          >
            <Languages className="w-4 h-4" />
            <span>{isHindi ? 'EN' : 'हिन्दी'}</span>
          </button>

          {/* Reduced Motion Toggle */}
          <button
            onClick={() => setReducedMotion(!reducedMotion)}
            title={reducedMotion ? t.reducedMotionOn : t.reducedMotionOff}
            className={`p-2.5 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 focus-visible:ring-2 focus-visible:ring-[#E69F00] ${
              reducedMotion
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Eye className="w-5 h-5" />
          </button>

          {/* Elder Mode Toggle */}
          <button
            onClick={toggleElderMode}
            title={elderMode ? t.elderModeOn : t.elderModeOff}
            aria-label={elderMode ? t.elderModeOn : t.elderModeOff}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-[#E69F00] ${
              elderMode
                ? 'bg-[#E69F00] text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Accessibility className="w-4 h-4" />
          </button>

          {/* Lite Mode Toggle (Low Power Fallback) */}
          <button
            onClick={toggleLiteMode}
            title={isLiteMode ? t.liteModeOn : t.liteModeOff}
            aria-label={isLiteMode ? t.liteModeOn : t.liteModeOff}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-[#E69F00] ${
              isLiteMode
                ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" />
          </button>

          {/* Sound Mute / Unmute Toggle */}
          <button
            onClick={() => {
              setIsMuted(railwayAudio.toggleMute());
            }}
            title={isMuted ? t.audioMuted : t.audioUnmuted}
            aria-label={isMuted ? t.audioMuted : t.audioUnmuted}
            className="p-2.5 rounded-xl text-slate-300 hover:text-[#E69F00] hover:bg-slate-800 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 focus-visible:ring-2 focus-visible:ring-[#E69F00]"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-[#009E73]" />}
          </button>

          {/* Train Horn Button */}
          <button
            onClick={() => railwayAudio.playHorn()}
            title={t.hornTitle}
            aria-label={t.hornTitle}
            className="p-2.5 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 focus-visible:ring-2 focus-visible:ring-[#E69F00]"
          >
            <Megaphone className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Middle Corridor Indicator */}
      <div className="flex flex-col items-center gap-2 my-auto pointer-events-none">
        {/* Station Journey Bar */}
        <div className="pointer-events-auto bg-slate-950/80 backdrop-blur-md border border-slate-700/60 px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-4 text-xs">
          {STATIONS.map((st, i) => {
            const isPassed = hudState.progress >= st.progress;
            const isCurrent = Math.abs(hudState.progress - st.progress) < 0.1;
            return (
              <React.Fragment key={st.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                      isCurrent
                        ? 'bg-[#E69F00] border-[#FEF3C7] ring-4 ring-[#E69F00]/30 scale-125'
                        : isPassed
                        ? 'bg-[#009E73] border-[#D1FAE5]'
                        : 'bg-slate-800 border-slate-600'
                    }`}
                  />
                  <span
                    className={`mt-1 font-bold ${
                      isCurrent
                        ? 'text-[#E69F00]'
                        : isPassed
                        ? 'text-slate-200'
                        : 'text-slate-500'
                    }`}
                  >
                    {isHindi ? st.nameHi : st.nameEn}
                  </span>
                </div>
                {i < STATIONS.length - 1 && (
                  <div className="w-12 sm:w-20 h-0.5 bg-slate-700 relative">
                    <div
                      className="absolute left-0 top-0 h-full bg-[#009E73] transition-all duration-300"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            ((hudState.progress - st.progress) /
                              (STATIONS[i + 1].progress - st.progress)) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <footer id="main-controls" className="flex flex-wrap items-end justify-between gap-4 pointer-events-auto">
        {/* Speedometer & Progress Tile */}
        <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/60 p-3.5 rounded-2xl shadow-2xl flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {isHindi ? 'ट्रेन की गति' : 'Train Speed'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-100 font-mono">
                {(hudState.speed * 440).toFixed(0)}
              </span>
              <span className="text-xs text-[#E69F00] font-bold">km/h</span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {isHindi ? 'अगला स्टेशन' : 'Next Station'}
            </span>
            <span className="text-xs font-bold text-slate-200">
              {isHindi ? nextStation.nameHi : nextStation.nameEn} ({nextStation.code})
            </span>
          </div>
        </div>

        {/* Quick Action Controls */}
        <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/60 p-2 rounded-2xl shadow-2xl flex items-center gap-2">
          <button
            onClick={useJourneyStore.getState().toggleDisruptionPanel}
            className="flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isHindi ? 'सिम्युलेटर पैनल' : 'Simulator'}</span>
          </button>

          <button
            onClick={resetJourney}
            title={isHindi ? 'यात्रा रीसेट करें' : 'Reset Train to Start'}
            className="flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isHindi ? 'रीसेट' : 'Reset'}</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
