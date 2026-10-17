'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  XCircle,
  GitBranch,
  Repeat,
  RotateCcw,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useJourneyStore } from '@/store/journeyStore';
import { disruptionReducer } from '@/engine/disruptionFSM';
import { translations } from '@/i18n/translations';

export function DisruptionPanel() {
  const disruptionType = useJourneyStore((s) => s.disruptionType);
  const setDisruptionType = useJourneyStore((s) => s.setDisruptionType);
  const resetJourney = useJourneyStore((s) => s.resetJourney);
  const language = useJourneyStore((s) => s.language);
  const elderMode = useJourneyStore((s) => s.elderMode);
  const isDisruptionPanelOpen = useJourneyStore((s) => s.isDisruptionPanelOpen);
  const toggleDisruptionPanel = useJourneyStore((s) => s.toggleDisruptionPanel);

  const [selectedDelayMinutes, setSelectedDelayMinutes] = useState<10 | 25 | 60>(25);

  const t = translations[language];

  const handleTriggerDelay = (mins: 10 | 25 | 60) => {
    setSelectedDelayMinutes(mins);
    setDisruptionType('delay');
  };

  const handleTriggerCancellation = () => {
    setDisruptionType('cancellation');
  };

  const handleTriggerMissedConnection = () => {
    setDisruptionType('missed_connection');
  };

  const handleTriggerPlatformChange = () => {
    setDisruptionType('platform_change');
  };

  if (!isDisruptionPanelOpen) {
    return (
      <button
        onClick={toggleDisruptionPanel}
        aria-label="Open Disruption Simulator Panel"
        className="fixed top-20 right-4 sm:right-6 z-40 bg-slate-950/90 backdrop-blur-xl border border-amber-400/60 hover:border-amber-400 p-2.5 min-h-[44px] rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-all focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-95"
      >
        <Sparkles className="w-4 h-4" />
        <span>{t.simulatorTitle}</span>
        <ChevronDown className="w-4 h-4" />
      </button>
    );
  }

  return (
    <section
      aria-label={t.simulatorTitle}
      className={`fixed top-20 right-4 sm:right-6 z-40 bg-slate-950/95 backdrop-blur-xl border border-slate-700/60 p-4 rounded-2xl shadow-2xl transition-all ${
        elderMode ? 'max-w-md text-base' : 'max-w-sm text-xs'
      }`}
    >
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E69F00]" aria-hidden="true" />
          <h2 className="font-extrabold text-slate-100 tracking-wide uppercase text-[11px] sm:text-xs">
            {t.simulatorTitle}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono bg-amber-400/10 text-[#E69F00] px-2 py-0.5 rounded border border-[#E69F00]/30 font-bold">
            {t.simulatedDataBadge}
          </span>
          <button
            onClick={toggleDisruptionPanel}
            aria-label="Collapse Disruption Simulator Panel"
            className="p-1 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {/* 1. Delay Simulator with 10m / 25m / 60m Selector */}
        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-slate-300 font-bold">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#E69F00]" />
              {t.simulateDelay}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Signal 104</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Delay duration options">
            {[10, 25, 60].map((mins) => {
              const isSelected = disruptionType === 'delay' && selectedDelayMinutes === mins;
              return (
                <button
                  key={mins}
                  onClick={() => handleTriggerDelay(mins as 10 | 25 | 60)}
                  className={`py-2 px-2 rounded-lg font-bold text-xs transition-all min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#E69F00] active:scale-95 ${
                    isSelected
                      ? 'bg-[#E69F00] text-slate-950 shadow-md scale-[1.02]'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  +{mins} min
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Cancellation / Section Halt Button */}
        <button
          onClick={handleTriggerCancellation}
          className={`flex items-center justify-between p-3 min-h-[44px] rounded-xl font-bold transition-all border active:scale-95 focus-visible:ring-2 focus-visible:ring-[#D55E00] ${
            disruptionType === 'cancellation'
              ? 'bg-[#D55E00] text-white border-[#D55E00] shadow-lg'
              : 'bg-slate-900/80 text-slate-200 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <span className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-[#D55E00]" />
            {t.simulateCancellation}
          </span>
          <span className="text-[10px] opacity-75">Km 74</span>
        </button>

        {/* 3. Missed Connection Button */}
        <button
          onClick={handleTriggerMissedConnection}
          className={`flex items-center justify-between p-3 min-h-[44px] rounded-xl font-bold transition-all border active:scale-95 focus-visible:ring-2 focus-visible:ring-[#0072B2] ${
            disruptionType === 'missed_connection'
              ? 'bg-[#0072B2] text-white border-[#0072B2] shadow-lg'
              : 'bg-slate-900/80 text-slate-200 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <span className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-[#56B4E9]" />
            {t.simulateMissedConnection}
          </span>
          <span className="text-[10px] opacity-75">Ambala Cantt</span>
        </button>

        {/* 4. Platform Reallocation Button */}
        <button
          onClick={handleTriggerPlatformChange}
          className={`flex items-center justify-between p-3 min-h-[44px] rounded-xl font-bold transition-all border active:scale-95 focus-visible:ring-2 focus-visible:ring-[#E69F00] ${
            disruptionType === 'platform_change'
              ? 'bg-amber-600 text-white border-amber-500 shadow-lg'
              : 'bg-slate-900/80 text-slate-200 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <span className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-amber-400" />
            {t.simulatePlatformChange}
          </span>
          <span className="text-[10px] opacity-75">PF 2 ➔ PF 4</span>
        </button>

        {/* 5. Reset Simulator Button */}
        <button
          onClick={resetJourney}
          className="flex items-center justify-center gap-2 py-2.5 px-3 mt-1 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 font-bold transition-all active:scale-95 border border-slate-800 focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.resetJourney}</span>
        </button>
      </div>
    </section>
  );
}
