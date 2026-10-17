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
  X,
  Wrench,
  Play,
  ArrowRight,
  MousePointerClick,
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
  const scrollMode = useJourneyStore((s) => s.scrollMode);

  const journeyStarted = useJourneyStore((s) => s.journeyStarted);
  const isDemoToolsOpen = useJourneyStore((s) => s.isDemoToolsOpen);

  const startJourney = useJourneyStore((s) => s.startJourney);
  const toggleDemoTools = useJourneyStore((s) => s.toggleDemoTools);
  const setDemoToolsOpen = useJourneyStore((s) => s.setDemoToolsOpen);
  const setDisruptionType = useJourneyStore((s) => s.setDisruptionType);

  const toggleTimeOfDay = useJourneyStore((s) => s.toggleTimeOfDay);
  const setCameraMode = useJourneyStore((s) => s.setCameraMode);
  const toggleLanguage = useJourneyStore((s) => s.toggleLanguage);
  const toggleElderMode = useJourneyStore((s) => s.toggleElderMode);
  const toggleLiteMode = useJourneyStore((s) => s.toggleLiteMode);
  const toggleScrollMode = useJourneyStore((s) => s.toggleScrollMode);
  const setReducedMotion = useJourneyStore((s) => s.setReducedMotion);
  const resetJourney = useJourneyStore((s) => s.resetJourney);

  const t = translations[language];
  const isHindi = language === 'hi';

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

  // Keyboard accessibility: Escape closes the Demo Tools drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDemoToolsOpen) {
        setDemoToolsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDemoToolsOpen, setDemoToolsOpen]);

  // Find next station
  const nextStation =
    STATIONS.find((st) => st.progress > hudState.progress) || STATIONS[STATIONS.length - 1];

  // Authentic Okabe-Ito status badge config
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

  // Signal 104 HTML Aspect
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
        href="#primary-action-btn"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-[#E69F00] text-slate-950 font-bold px-4 py-2.5 focus:min-h-[44px] focus:inline-flex focus:items-center rounded-xl shadow-2xl focus:outline-none focus:ring-4 focus:ring-white pointer-events-auto"
      >
        {t.skipToContent}
      </a>

      {/* Screen Reader Live Region for Status Changes */}
      <div className="sr-only" aria-live="polite" role="status">
        {isHindi
          ? `वर्तमान स्थिति: ${statusBadge.labelHi}, गति: ${(hudState.speed * 440).toFixed(0)} किमी प्रति घंटा`
          : `Current Journey Status: ${statusBadge.labelEn}, Speed: ${(hudState.speed * 440).toFixed(0)} km/h`}
      </div>

      {/* Top Header Bar: Clean & Minimal */}
      <header className="flex items-center justify-between gap-3 pointer-events-auto">
        {/* Brand & Train Badge */}
        <div className="flex items-center gap-2.5 bg-slate-950/85 backdrop-blur-md border border-slate-700/60 px-3.5 py-2 rounded-2xl shadow-2xl">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#0072B2] to-[#E69F00] flex items-center justify-center font-black text-slate-950 text-xs shadow-md">
            IR
          </div>
          <span className="text-sm font-extrabold tracking-tight text-slate-100">
            Sahayak 3D <span className="text-xs font-semibold text-[#E69F00]">/ सहायक ३डी</span>
          </span>
        </div>

        {/* Live Status Pill & Signal (Visible once journey starts) */}
        {journeyStarted && (
          <div className="hidden md:flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black shadow-lg backdrop-blur-md transition-all duration-300 ${statusBadge.classes} ${statusBadge.pattern}`}
            >
              {statusBadge.icon}
              <span>{isHindi ? statusBadge.labelHi : statusBadge.labelEn}</span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md shadow-lg transition-all ${signalAspect.colorClass}`}
              title="Trackside Signal 104 aspect status"
            >
              {signalAspect.icon}
              <span>{isHindi ? signalAspect.textHi : signalAspect.textEn}</span>
            </div>
          </div>
        )}

        {/* Controls: Language Toggle & Collapsible "Demo tools" Drawer Trigger */}
        <div className="flex items-center gap-2">
          {/* Language Toggle (EN / हिन्दी) */}
          <button
            onClick={toggleLanguage}
            title={t.languageToggle}
            aria-label={t.languageToggle}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[44px] text-xs font-bold rounded-xl bg-slate-950/85 hover:bg-slate-900 text-slate-200 border border-slate-700/60 shadow-lg transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-[#E69F00]"
          >
            <Languages className="w-4 h-4 text-[#E69F00]" aria-hidden="true" />
            <span>{isHindi ? 'EN' : 'हिन्दी'}</span>
          </button>

          {/* Labeled Collapsible "Demo tools" Drawer Trigger */}
          <button
            id="demo-tools-trigger"
            aria-expanded={isDemoToolsOpen}
            aria-controls="demo-tools-drawer"
            onClick={toggleDemoTools}
            className="flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] text-xs font-bold rounded-xl bg-slate-900/95 hover:bg-slate-800 text-amber-300 border border-amber-400/40 shadow-xl transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-400"
            title={t.demoToolsTitle}
          >
            <Wrench className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span>{t.demoToolsTitle}</span>
          </button>
        </div>
      </header>

      {/* Guided Flow: Initial First View vs Active Journey */}
      {!journeyStarted ? (
        /* FIRST VIEW: Train Scene, Plain-Language Status Headline, One Primary Action */
        <main className="my-auto flex flex-col items-center justify-center text-center px-4 pointer-events-auto">
          <div className="max-w-md w-full bg-slate-950/90 backdrop-blur-xl border border-slate-700/80 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col items-center">
            {/* Plain-Language Status Headline */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Platform 1 • NDLS</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight leading-snug">
              {t.journeyBoardingStatus}
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-slate-400 font-medium">
              Express 00001 • New Delhi (NDLS) → Ambala Cantt (UMB)
            </p>

            {/* ONE PRIMARY ACTION: "Start journey" */}
            <button
              id="primary-action-btn"
              onClick={startJourney}
              className="mt-6 w-full sm:w-auto px-8 py-3.5 min-h-[48px] rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-base shadow-2xl shadow-emerald-500/25 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 focus-visible:ring-4 focus-visible:ring-emerald-400"
            >
              <Play className="w-5 h-5 fill-current" aria-hidden="true" />
              <span>{t.startJourneyBtn}</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </main>
      ) : (
        /* GUIDED FLOW STEP 2: Running Journey with "Simulate a problem" Action */
        disruptionType === 'none' &&
        status !== 'resolved' && (
          <main className="my-auto flex flex-col items-center text-center px-4 pointer-events-auto">
            <div className="max-w-md w-full bg-slate-950/90 backdrop-blur-xl border border-slate-700/80 p-5 sm:p-6 rounded-3xl shadow-2xl flex flex-col items-center">
              {/* Plain-Language Status Headline */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#004D38]/60 border border-[#009E73]/50 text-emerald-300 text-xs font-bold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#009E73]" />
                <span>{(hudState.speed * 440).toFixed(0)} km/h • {isHindi ? 'समय पर' : 'On Time'}</span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight leading-snug">
                {t.journeyRunningStatus}
              </h2>

              {/* ONE PRIMARY ACTION: "Simulate a problem" */}
              <button
                id="primary-action-btn"
                onClick={() => setDisruptionType('delay')}
                className="mt-4 w-full sm:w-auto px-7 py-3 min-h-[48px] rounded-2xl bg-gradient-to-r from-amber-500 to-[#E69F00] hover:from-amber-400 hover:to-[#E69F00] text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-95 focus-visible:ring-4 focus-visible:ring-white"
              >
                <AlertTriangle className="w-5 h-5 text-slate-950" aria-hidden="true" />
                <span>{t.simulateProblemBtn}</span>
              </button>
            </div>
          </main>
        )
      )}

      {/* Middle Station Journey Bar (Visible once journey started) */}
      {journeyStarted && (
        <div className="flex flex-col items-center gap-2 my-auto pointer-events-none">
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
      )}

      {/* Bottom Telemetry Bar (Speedometer & Station info once journey started) */}
      {journeyStarted && (
        <footer id="main-controls" className="flex flex-wrap items-end justify-between gap-4 pointer-events-auto">
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

          <button
            onClick={resetJourney}
            title={isHindi ? 'यात्रा रीसेट करें' : 'Reset Train to Start'}
            className="flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] text-xs font-bold rounded-xl bg-slate-950/85 hover:bg-slate-900 text-slate-300 hover:text-amber-400 border border-slate-700/60 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isHindi ? 'रीसेट' : 'Reset'}</span>
          </button>
        </footer>
      )}

      {/* ========================================================================= */}
      {/* COLLAPSIBLE "DEMO TOOLS" DRAWER (Keyboard accessible, labeled, clean)      */}
      {/* ========================================================================= */}
      {/* Backdrop */}
      {isDemoToolsOpen && (
        <div
          onClick={toggleDemoTools}
          aria-hidden="true"
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 pointer-events-auto transition-opacity"
        />
      )}

      {/* Slide-out Drawer Panel */}
      <aside
        id="demo-tools-drawer"
        role="region"
        aria-label={t.demoToolsTitle}
        aria-hidden={!isDemoToolsOpen}
        className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-slate-950/95 backdrop-blur-2xl border-l border-slate-800 shadow-2xl z-50 p-5 flex flex-col justify-between overflow-y-auto pointer-events-auto transform transition-transform duration-300 ease-in-out ${
          isDemoToolsOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        <div>
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-400" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-black text-slate-100">{t.demoToolsTitle}</h2>
                <p className="text-[11px] text-slate-400">{t.demoToolsDesc}</p>
              </div>
            </div>
            <button
              onClick={toggleDemoTools}
              aria-label={t.closeDemoTools}
              className="p-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section 1: Disruption Simulation */}
          <div className="py-4 border-b border-slate-800/80 space-y-2.5">
            <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              {isHindi ? 'सिमुलेशन और परिदृश्य' : 'Simulation & Scenarios'}
            </h3>

            {/* Disruption Simulator Modal Opener */}
            <button
              onClick={() => {
                useJourneyStore.getState().toggleDisruptionPanel();
                setDemoToolsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700/60 font-bold text-xs transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{isHindi ? 'परिदृश्य सिम्युलेटर पैनल' : 'Scenario Simulator Panel'}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Quick Trigger Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDisruptionType('delay')}
                className="px-3 py-2 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#E69F00]" />
                <span>{isHindi ? 'सिग्नल विलंब (+25m)' : 'Delay (+25m)'}</span>
              </button>
              <button
                onClick={() => setDisruptionType('cancellation')}
                className="px-3 py-2 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <XCircle className="w-3.5 h-3.5 text-[#D55E00]" />
                <span>{isHindi ? 'खंड रोक' : 'Halt'}</span>
              </button>
              <button
                onClick={() => setDisruptionType('missed_connection')}
                className="px-3 py-2 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <GitBranch className="w-3.5 h-3.5 text-[#56B4E9]" />
                <span>{isHindi ? 'कनेक्शन छूटा' : 'Missed Conn'}</span>
              </button>
              <button
                onClick={() => setDisruptionType('platform_change')}
                className="px-3 py-2 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isHindi ? 'प्लेटफ़ॉर्म बदलाव' : 'Platform Chg'}</span>
              </button>
            </div>
          </div>

          {/* Section 2: Live Passenger Tools (Family Share, Voice, Timeline) */}
          <div className="py-4 border-b border-slate-800/80 space-y-2.5">
            <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              {isHindi ? 'यात्री सहायता उपकरण' : 'Passenger Tools'}
            </h3>

            {/* Family Live Share */}
            <button
              onClick={() => {
                useJourneyStore.getState().toggleFamilyShare();
                setDemoToolsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 min-h-[44px] rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 font-bold text-xs transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>{isHindi ? 'परिवार लाइव शेयर' : 'Family Live Share'}</span>
              </div>
              <span className="text-[10px] text-blue-400 font-mono">SMS / Web</span>
            </button>

            {/* Voice Assistant */}
            <button
              onClick={() => {
                useJourneyStore.getState().toggleVoiceAssistant();
                setDemoToolsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 min-h-[44px] rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-amber-400" />
                <span>{t.voiceTitle}</span>
              </div>
              <span className="text-[10px] text-amber-400 font-mono">Web Speech</span>
            </button>

            {/* Timeline Panel */}
            <button
              onClick={() => {
                useJourneyStore.getState().toggleTimeline();
                setDemoToolsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-700 font-bold text-xs transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>{t.timelineTitle}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">3 Stations</span>
            </button>
          </div>

          {/* Section 3: Performance, Rendering & Camera */}
          <div className="py-4 border-b border-slate-800/80 space-y-2.5">
            <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              {isHindi ? 'प्रदर्शन व कैमरा' : 'Display & Performance'}
            </h3>

            {/* Lite Mode Toggle */}
            <button
              onClick={toggleLiteMode}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                isLiteMode
                  ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>{isLiteMode ? t.liteModeOn : t.liteModeOff}</span>
              </div>
              <span className="text-[10px] font-mono">{isLiteMode ? 'ON' : 'OFF'}</span>
            </button>

            {/* Scroll Mode Toggle */}
            <button
              onClick={toggleScrollMode}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-400 ${
                scrollMode
                  ? 'bg-amber-500 text-slate-950 shadow-lg'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-amber-400" />
                <span>{scrollMode ? t.scrollModeOn : t.scrollModeOff}</span>
              </div>
              <span className="text-[10px] font-mono">{scrollMode ? 'ON' : 'OFF'}</span>
            </button>

            {/* Camera View Switcher */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 font-semibold">{isHindi ? 'कैमरा दृश्य' : 'Camera Angle'}</span>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {(['chase', 'cinematic', 'map'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setCameraMode(mode)}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#E69F00] ${
                      cameraMode === mode
                        ? 'bg-[#0072B2] text-white shadow-sm font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode === 'chase' ? 'Chase' : mode === 'cinematic' ? 'Side' : 'Map'}
                  </button>
                ))}
              </div>
            </div>

            {/* Day / Dusk Lighting */}
            <button
              onClick={toggleTimeOfDay}
              className="w-full flex items-center justify-between px-3.5 py-2.5 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-[#E69F00]"
            >
              <div className="flex items-center gap-2">
                {timeOfDay === 'day' ? (
                  <Sun className="w-4 h-4 text-[#E69F00]" />
                ) : (
                  <Moon className="w-4 h-4 text-[#56B4E9]" />
                )}
                <span>{timeOfDay === 'day' ? t.dayMode : t.duskMode}</span>
              </div>
              <span className="text-[10px] font-mono">{timeOfDay.toUpperCase()}</span>
            </button>
          </div>

          {/* Section 4: Accessibility & Audio */}
          <div className="py-4 border-b border-slate-800/80 space-y-2.5">
            <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              {isHindi ? 'सुलभता एवं ऑडियो' : 'Accessibility & Audio'}
            </h3>

            {/* Elder Mode Toggle */}
            <button
              onClick={toggleElderMode}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-[#E69F00] ${
                elderMode
                  ? 'bg-[#E69F00] text-slate-950 font-bold'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Accessibility className="w-4 h-4" />
                <span>{elderMode ? t.elderModeOn : t.elderModeOff}</span>
              </div>
              <span className="text-[10px] font-mono">{elderMode ? 'ON' : 'OFF'}</span>
            </button>

            {/* Reduced Motion Toggle */}
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-[#E69F00] ${
                reducedMotion
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{reducedMotion ? t.reducedMotionOn : t.reducedMotionOff}</span>
              </div>
              <span className="text-[10px] font-mono">{reducedMotion ? 'ON' : 'OFF'}</span>
            </button>

            {/* Audio Track & Train Horn */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsMuted(railwayAudio.toggleMute())}
                className="px-3 py-2 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#E69F00]"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-[#009E73]" />}
                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
              </button>
              <button
                onClick={() => railwayAudio.playHorn()}
                className="px-3 py-2 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#E69F00]"
              >
                <Megaphone className="w-4 h-4" />
                <span>Horn</span>
              </button>
            </div>
          </div>

          {/* Section 5: Documentation & Help */}
          <div className="py-4 space-y-2">
            <button
              onClick={() => {
                useJourneyStore.getState().setIsOnboardingOpen(true);
                setDemoToolsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 text-xs font-semibold transition-colors active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>{t.onboardingTitle}</span>
            </button>

            <Link
              href="/design-system"
              className="w-full flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 text-xs font-semibold transition-colors active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <Palette className="w-4 h-4 text-[#56B4E9]" />
              <span>Design System & Tokens</span>
            </Link>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500">
          Sahayak 3D • Accessible Low-Poly Rail Companion
        </div>
      </aside>
    </div>
  );
}
