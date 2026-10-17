'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Clock,
  IndianRupee,
  Star,
  ShieldCheck,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useJourneyStore } from '@/store/journeyStore';
import { journeyPhysics } from '@/store/journeyPhysics';
import { getDecisionOptions, DecisionOption } from '@/engine/decisionEngine';
import { translations } from '@/i18n/translations';

export function DecisionCardsOverlay() {
  const disruptionType = useJourneyStore((s) => s.disruptionType);
  const status = useJourneyStore((s) => s.status);
  const language = useJourneyStore((s) => s.language);
  const elderMode = useJourneyStore((s) => s.elderMode);
  const setStatus = useJourneyStore((s) => s.setStatus);
  const setActiveBranch = useJourneyStore((s) => s.setActiveBranch);
  const setCameraMode = useJourneyStore((s) => s.setCameraMode);

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const t = translations[language];
  const isHindi = language === 'hi';

  // Construct FSM state for decision engine
  const fsmState = {
    kind: (disruptionType === 'delay'
      ? 'DELAYED'
      : disruptionType === 'cancellation'
      ? 'CANCELLED'
      : disruptionType === 'missed_connection'
      ? 'MISSED_CONNECTION'
      : disruptionType === 'platform_change'
      ? 'PLATFORM_CHANGE'
      : status === 'resolved'
      ? 'RESOLVED'
      : 'NORMAL') as any,
    delayMinutes: disruptionType === 'delay' ? 25 : 0,
    reasonEn: '',
    reasonHi: '',
    timestamp: 0,
  };

  const options = getDecisionOptions(fsmState);

  // Plain-Language Status Announcement for aria-live region
  const getBannerAnnouncement = () => {
    switch (disruptionType) {
      case 'delay':
        return t.bannerDelay25;
      case 'cancellation':
        return t.bannerCancellation;
      case 'missed_connection':
        return t.bannerMissedConnection;
      case 'platform_change':
        return t.bannerPlatformChange;
      default:
        return status === 'resolved' ? t.bannerResolved : t.bannerNormal;
    }
  };

  const handleApplyOption = (option: DecisionOption) => {
    setSelectedOptionId(option.id);
    setStatus('resolved');

    // 3D Outcomes triggered deterministically:
    if (option.actionType === 'reroute') {
      // 1. Reroute plays: train switches onto glowing bypass branch track
      setActiveBranch('branch');
      journeyPhysics.activeBranch = 'branch';
      journeyPhysics.targetSpeed = 0.24;
    } else if (option.actionType === 'rebook') {
      // 2. Rebook: camera swoops to side view showcasing parallel track priority connection
      setCameraMode('cinematic');
      journeyPhysics.targetSpeed = 0.22;
    } else if (option.actionType === 'resume') {
      // 3. Wait & hold: train holds then smoothly resumes forward
      setTimeout(() => {
        journeyPhysics.targetSpeed = 0.25;
      }, 1200);
    } else if (option.actionType === 'cab') {
      setCameraMode('map');
    }
  };

  // If normal cruising and not resolved, do not show options cards
  if (options.length === 0 && status !== 'resolved') {
    return (
      <div className="sr-only" aria-live="polite">
        {t.bannerNormal}
      </div>
    );
  }

  return (
    <aside
      aria-label={t.decisionCardsHeader}
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-4 pointer-events-auto transition-all ${
        elderMode ? 'scale-105' : ''
      }`}
    >
      {/* 1. Plain-Language Status Banner with Live Region */}
      <div
        role="alert"
        aria-live={disruptionType === 'cancellation' ? 'assertive' : 'polite'}
        className="mb-3 p-3 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-amber-400/50 shadow-2xl flex items-center justify-between gap-3 text-slate-100"
      >
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-[#E69F00] shrink-0" aria-hidden="true" />
          <p className="text-xs sm:text-sm font-bold tracking-wide">
            {getBannerAnnouncement()}
          </p>
        </div>
        <span className="text-[10px] font-mono text-[#E69F00] border border-[#E69F00]/30 px-2 py-0.5 rounded-full shrink-0 font-bold">
          {t.simulatedDataBadge}
        </span>
      </div>

      {/* 2. Ranked Decision Cards Grid */}
      {options.length > 0 && status !== 'resolved' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {options.map((option) => {
            const isTop = option.isTopRanked;
            const isSelected = selectedOptionId === option.id;

            return (
              <div
                key={option.id}
                className={`relative flex flex-col justify-between p-3.5 rounded-2xl backdrop-blur-xl transition-all duration-300 border shadow-2xl ${
                  isTop
                    ? 'bg-slate-900/95 border-amber-400/80 ring-2 ring-amber-400/20'
                    : 'bg-slate-950/90 border-slate-700/60 hover:border-slate-500'
                }`}
              >
                {/* Top-Ranked Crown Badge */}
                {isTop && (
                  <div className="absolute -top-2.5 left-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{t.rankedRecommendation}</span>
                  </div>
                )}

                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-100 mt-1">
                    {isHindi ? option.titleHi : option.titleEn}
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    {isHindi ? option.descHi : option.descEn}
                  </p>

                  {/* One-line Reason for Ranking */}
                  <div className="mt-2 text-[10px] text-amber-300/90 bg-amber-400/10 p-1.5 rounded-lg border border-amber-400/20">
                    <span className="font-bold">Why: </span>
                    {isHindi ? option.rankingReasonHi : option.rankingReasonEn}
                  </div>

                  {/* Multi-Criteria Metrics Bar */}
                  <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2 border-t border-slate-800 text-[10px]">
                    <div className="flex items-center gap-1 text-slate-300">
                      <Clock className="w-3 h-3 text-[#56B4E9]" />
                      <span>{isHindi ? option.timeDisplayHi : option.timeDisplayEn}</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-300 font-mono">
                      <IndianRupee className="w-3 h-3 text-emerald-400" />
                      <span>{isHindi ? option.costDisplayHi : option.costDisplayEn}</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-300">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{option.comfortRating}/5 Comfort</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-300">
                      <ShieldCheck className="w-3 h-3 text-[#009E73]" />
                      <span>{option.confidenceScore}% Confidence</span>
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => handleApplyOption(option)}
                  className={`mt-3 py-2.5 px-3 min-h-[44px] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-95 ${
                    isTop
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-md hover:scale-[1.02]'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <span>{t.selectOptionBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Resolved Confirmation Toast */}
      {status === 'resolved' && (
        <div className="bg-emerald-950/90 backdrop-blur-xl border border-emerald-500/80 p-3.5 rounded-2xl shadow-2xl flex items-center justify-between text-emerald-200 text-xs sm:text-sm font-bold">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-400" />
            <span>{t.bannerResolved}</span>
          </div>
          <span className="text-[11px] bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded font-mono">
            3D Outcome Active
          </span>
        </div>
      )}
    </aside>
  );
}
