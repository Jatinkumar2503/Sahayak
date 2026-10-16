'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Battery,
  Wifi,
  Clock,
  Navigation,
  RefreshCw,
  X,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useJourneyStore, STATIONS } from '@/store/journeyStore';
import { journeyPhysics } from '@/store/journeyPhysics';
import { translations } from '@/i18n/translations';

interface FamilyShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FamilyShareModal({ isOpen, onClose }: FamilyShareModalProps) {
  const status = useJourneyStore((s) => s.status);
  const disruptionType = useJourneyStore((s) => s.disruptionType);
  const activeBranch = useJourneyStore((s) => s.activeBranch);
  const language = useJourneyStore((s) => s.language);

  const [lastUpdatedSec, setLastUpdatedSec] = useState(2);
  const [viewState, setViewState] = useState<'ready' | 'loading' | 'offline'>('ready');

  const t = translations[language];
  const isHindi = language === 'hi';

  // Live updated seconds ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdatedSec((prev) => (prev > 50 ? 1 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  // Compute family status message based on live journey store
  const getFamilyStatusMessage = () => {
    if (activeBranch === 'branch') {
      return t.familyStatusRerouted;
    }
    if (status === 'resolved') {
      return t.familyStatusRebooked;
    }
    if (disruptionType === 'delay') {
      return t.familyStatusDelayed;
    }
    return t.familyStatusSafe;
  };

  const nextStation =
    STATIONS.find((st) => st.progress > journeyPhysics.progress) || STATIONS[STATIONS.length - 1];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.familyShareTitle}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm pointer-events-auto"
    >
      {/* Smartphone Frame Mockup */}
      <div className="relative w-full max-w-[340px] bg-slate-950 rounded-[40px] p-3 border-4 border-slate-700 shadow-2xl ring-1 ring-white/10 overflow-hidden">
        {/* Phone Speaker & Camera Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-20 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />
        </div>

        {/* Inner Phone Screen Container */}
        <div className="bg-slate-900 rounded-[32px] p-4 text-slate-100 flex flex-col justify-between min-h-[560px] border border-slate-800">
          {/* Status Bar */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 pb-2 border-b border-slate-800/60">
            <span>17:42</span>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-slate-300" />
              <Battery className="w-4 h-4 text-emerald-400" />
              <span>84%</span>
            </div>
          </div>

          {/* Phone Header with Close Button */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold leading-tight">{t.familyShareTitle}</h3>
                <p className="text-[10px] text-slate-400">{t.familyShareSubtitle}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Close Family Share dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* View States: Loading / Offline / Ready */}
          {viewState === 'loading' ? (
            <div className="my-auto flex flex-col items-center justify-center gap-2 py-12">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs text-slate-300">Synchronizing satellite GPS link...</p>
            </div>
          ) : viewState === 'offline' ? (
            <div className="my-auto p-4 bg-rose-950/40 rounded-2xl border border-rose-500/50 text-center flex flex-col items-center gap-2">
              <AlertTriangle className="w-8 h-8 text-rose-400" />
              <p className="text-xs font-bold text-rose-200">Satellite GPS Packet Dropped</p>
              <button
                onClick={() => setViewState('ready')}
                className="mt-2 text-xs bg-rose-600 text-white px-3 py-1 rounded-lg"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 my-auto">
              {/* Main Safety Status Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-950/80 to-slate-900 border border-emerald-500/60 shadow-lg">
                <div className="flex items-center gap-2 text-[#009E73] mb-1">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">
                    IRCTC Verified Passenger Status
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-white leading-tight">
                  {getFamilyStatusMessage()}
                </h4>
                <p className="text-[11px] text-slate-300 mt-1">
                  12001 Vande Bharat Express • Coach C-4, Seat 24 (Window)
                </p>
              </div>

              {/* Journey GPS Metrics Card */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Navigation className="w-3 h-3 text-sky-400" />
                    Live Location:
                  </span>
                  <span className="font-bold text-slate-200">
                    Approaching {isHindi ? nextStation.nameHi : nextStation.nameEn}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[11px]">Current Speed:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {Math.round(journeyPhysics.speed * 440)} km/h
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[11px]">Est. Ambala Arrival:</span>
                  <span className="font-bold text-slate-200">
                    {status === 'delay' ? '18:55 (+25m)' : '18:30 (On Time)'}
                  </span>
                </div>
              </div>

              {/* Simulated Data Badge & Last Update */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-amber-400" />
                  Updated {lastUpdatedSec}s ago
                </span>
                <span className="bg-amber-400/10 text-[#E69F00] px-1.5 py-0.5 rounded font-bold border border-[#E69F00]/30 font-mono">
                  {t.simulatedDataBadge}
                </span>
              </div>
            </div>
          )}

          {/* Test State Toggles (Offline / Loading simulation) */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-800 text-[10px]">
            <button
              onClick={() => setViewState(viewState === 'offline' ? 'ready' : 'offline')}
              className="text-slate-500 hover:text-slate-300 underline"
            >
              Toggle Offline State
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => {
                setViewState('loading');
                setTimeout(() => setViewState('ready'), 1000);
              }}
              className="text-slate-500 hover:text-slate-300 underline"
            >
              Test Sync Loading
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
