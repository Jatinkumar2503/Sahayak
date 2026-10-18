'use client';

import React, { useEffect } from 'react';
import {
  Clock,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  GitBranch,
  X,
  Compass,
} from 'lucide-react';
import { useJourneyStore, STATIONS, SIGNALS, getNextSignalAhead } from '@/store/journeyStore';
import { journeyPhysics } from '@/store/journeyPhysics';
import { translations } from '@/i18n/translations';

export function JourneyTimelineA11y() {
  const status = useJourneyStore((s) => s.status);
  const disruptionType = useJourneyStore((s) => s.disruptionType);
  const activeBranch = useJourneyStore((s) => s.activeBranch);
  const activeSignalId = useJourneyStore((s) => s.activeSignalId);
  const language = useJourneyStore((s) => s.language);
  const isTimelineOpen = useJourneyStore((s) => s.isTimelineOpen);
  const setTimelineOpen = useJourneyStore((s) => s.setTimelineOpen);

  const approachingSignal = getNextSignalAhead(journeyPhysics.progress);
  const activeSignal = disruptionType !== 'none'
    ? (SIGNALS.find((s) => s.id === activeSignalId) || approachingSignal)
    : approachingSignal;

  const t = translations[language];
  const isHindi = language === 'hi';
  const modalRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  // Trap focus and restore focus on close
  useEffect(() => {
    if (!isTimelineOpen) return;
    previousFocusRef.current = document.activeElement as HTMLElement;

    const focusTimer = setTimeout(() => {
      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTimelineOpen(false);
        previousFocusRef.current?.focus();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isTimelineOpen, setTimelineOpen]);

  const getStatusText = () => {
    switch (status) {
      case 'delay':
        return t.statusDelay;
      case 'cancelled':
        return t.statusCancelled;
      case 'rerouted':
        return t.statusRerouted;
      case 'resolved':
        return t.statusResolved;
      case 'on-time':
      default:
        return t.statusOnTime;
    }
  };

  const getSignalAspectText = () => {
    if (disruptionType === 'delay' || disruptionType === 'cancellation') {
      return isHindi ? `${activeSignal.nameHi}: रुकें (लाल)` : `${activeSignal.nameEn}: STOP (Red)`;
    }
    if (disruptionType === 'missed_connection' || disruptionType === 'platform_change') {
      return isHindi ? `${activeSignal.nameHi}: सावधानी (पीला)` : `${activeSignal.nameEn}: CAUTION (Yellow)`;
    }
    return isHindi ? `${activeSignal.nameHi}: साफ़ (हरा)` : `${activeSignal.nameEn}: CLEAR (Green)`;
  };

  // Station ETAs (Simulated)
  const STATION_SCHEDULES = [
    { id: 'delhi', eta: '17:15 (Dep)', code: 'NDLS' },
    { id: 'panipat', eta: status === 'delay' ? '18:10 (+25m)' : '17:45', code: 'PNP' },
    { id: 'ambala', eta: status === 'delay' ? '18:55 (+25m)' : '18:30', code: 'UMB' },
  ];

  return (
    <>
      {/* 1. Permanent Screen-Reader Text Alternative in Document Flow */}
      <section
        aria-label={t.timelineTitle}
        className="sr-only"
      >
        <h2>{t.timelineTitle}</h2>
        <p>{t.timelineDesc}</p>
        <p>Current train: Express 00001</p>
        <p>Journey Status: {getStatusText()}</p>
        <p>{isHindi ? 'निकटवर्ती ट्रैक सिग्नल:' : 'Approaching Track Signal:'} {getSignalAspectText()}</p>
        <p>Route Alignment: {activeBranch === 'branch' ? 'Bypass Chord Line' : 'Main Corridor'}</p>
        <ol>
          {STATIONS.map((st, i) => {
            const isPassed = journeyPhysics.progress >= st.progress;
            const sched = STATION_SCHEDULES[i];
            return (
              <li key={st.id}>
                {i + 1}. {isHindi ? st.nameHi : st.nameEn} ({st.code}) - ETA: {sched.eta} - Status: {isPassed ? 'Passed' : 'Upcoming'}
              </li>
            );
          })}
        </ol>
      </section>

      {/* 2. Visual Interactive Panel when Opened */}
      {isTimelineOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.timelineTitle}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md pointer-events-auto"
        >
          <div
            ref={modalRef}
            className="relative w-full max-w-md bg-slate-950 border-2 border-amber-400/80 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col justify-between max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-extrabold text-white">{t.timelineTitle}</h2>
              </div>
              <button
                onClick={() => setTimelineOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
                aria-label={t.closeModal}
                title={t.closeModal}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Journey Overview Banner */}
            <div className="my-4 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">{t.currentLocation}:</span>
                <span className="font-mono font-bold text-amber-400">
                  Express 00001 • {(journeyPhysics.progress * 100).toFixed(0)}% Corridor Complete
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">{isHindi ? 'निकटवर्ती सिग्नल:' : 'Approaching Signal:'}</span>
                <span className="font-bold text-emerald-400">{getSignalAspectText()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">Route Track:</span>
                <span className="font-bold text-sky-400">
                  {activeBranch === 'branch' ? 'Bypass Chord Line (Track B)' : 'Northern Main Corridor (Track A)'}
                </span>
              </div>
            </div>

            {/* Station Timetable List */}
            <ol className="space-y-2.5 text-xs my-2">
              {STATIONS.map((st, i) => {
                const isPassed = journeyPhysics.progress >= st.progress;
                const isCurrent = Math.abs(journeyPhysics.progress - st.progress) < 0.08;
                const sched = STATION_SCHEDULES[i];

                return (
                  <li
                    key={st.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'border-amber-400 bg-amber-950/40 font-bold text-amber-300 ring-2 ring-amber-400/20'
                        : isPassed
                        ? 'border-emerald-700 bg-emerald-950/20 text-slate-200'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {isPassed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="font-extrabold text-sm text-slate-100">
                          {i + 1}. {isHindi ? st.nameHi : st.nameEn} ({st.code})
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {sched.eta}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-[10px] text-slate-400 mt-2">
              <span>WCAG AA Equal Alternative</span>
              <span className="font-mono text-amber-400 font-bold">{t.simulatedDataBadge}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
