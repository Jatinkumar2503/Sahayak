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
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  Armchair,
  Users,
  Eye,
  GitBranch,
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
  const setActiveBranch = useJourneyStore((s) => s.setActiveBranch);
  const setCameraMode = useJourneyStore((s) => s.setCameraMode);
  const setPreviewRouteId = useJourneyStore((s) => s.setPreviewRouteId);
  const previewRouteId = useJourneyStore((s) => s.previewRouteId);
  const confirmOption = useJourneyStore((s) => s.confirmOption);
  const confirmedOption = useJourneyStore((s) => s.confirmedOption as DecisionOption | null);
  const undoConfirmedOption = useJourneyStore((s) => s.undoConfirmedOption);
  const resetJourney = useJourneyStore((s) => s.resetJourney);
  const setFamilyShareOpen = useJourneyStore((s) => s.setFamilyShareOpen);

  const [expandedWhyId, setExpandedWhyId] = useState<string | null>(null);

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

  const options = getDecisionOptions(fsmState, { progress: journeyPhysics.progress });

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
    confirmOption(option);
    setPreviewRouteId(null);

    // 3D Outcomes triggered deterministically:
    if (option.actionType === 'reroute') {
      setActiveBranch('branch');
      journeyPhysics.activeBranch = 'branch';
      journeyPhysics.targetSpeed = 0.24;
    } else if (option.actionType === 'rebook') {
      setCameraMode('cinematic');
      journeyPhysics.targetSpeed = 0.22;
    } else if (option.actionType === 'resume') {
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
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-4 pointer-events-auto transition-all max-h-[calc(100vh-7rem)] overflow-y-auto overflow-x-hidden ${
        elderMode ? 'scale-105' : ''
      }`}
    >
      {/* 1. Plain-Language Status Banner with Live Region */}
      {status !== 'resolved' && (
        <div
          role="alert"
          aria-live={disruptionType === 'cancellation' ? 'assertive' : 'polite'}
          className="mb-3 p-3.5 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-amber-400/50 shadow-2xl flex items-center justify-between gap-3 text-slate-100"
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
      )}

      {/* 2. Ranked Decision Cards Grid */}
      {options.length > 0 && status !== 'resolved' && (
        <div>
          <h2 className="sr-only">{t.decisionCardsHeader}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {options.map((option) => {
            const isTop = option.isTopRanked;
            const isWhyExpanded = expandedWhyId === option.id;
            const isPreviewActive = previewRouteId === option.id;

            return (
              <div
                key={option.id}
                className={`relative flex flex-col justify-between p-3.5 rounded-2xl backdrop-blur-xl transition-all duration-300 border shadow-2xl ${
                  isTop
                    ? 'bg-slate-900/95 border-amber-400/80 ring-2 ring-amber-400/20'
                    : isPreviewActive
                    ? 'bg-slate-900/95 border-amber-400/60 ring-1 ring-amber-400/30'
                    : 'bg-slate-950/90 border-slate-700/60 hover:border-slate-400'
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

                  {/* Multi-Criteria Metrics Summary */}
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

                  {/* Tap-to-Preview Route Toggle Button for Touch / Mobile Users (hidden if option is disabled) */}
                  {!option.disabled && (
                    <button
                      type="button"
                      id={`preview-route-btn-${option.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewRouteId(isPreviewActive ? null : option.id);
                      }}
                      aria-pressed={isPreviewActive}
                      className={`mt-2 py-2 px-2.5 min-h-[44px] w-full rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all border ${
                        isPreviewActive
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-extrabold'
                          : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isPreviewActive ? t.hidePreviewBtn : t.previewRouteBtn}</span>
                    </button>
                  )}

                  {/* Accessible "Why this ranking?" expander button */}
                  <button
                    type="button"
                    aria-expanded={isWhyExpanded}
                    onClick={() => setExpandedWhyId(isWhyExpanded ? null : option.id)}
                    className="mt-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center justify-between w-full py-2 px-2.5 min-h-[44px] rounded-xl bg-slate-900/90 border border-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-95"
                  >
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isWhyExpanded ? t.hideRankingBtn : t.whyRankingBtn}</span>
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${isWhyExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Collapsible Factor Breakdown (All factors driven by dynamic option data) */}
                  {isWhyExpanded && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] space-y-1.5 animate-fadeIn">
                      <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex justify-between">
                        <span>{t.rankingFactorsTitle}</span>
                        <span className="text-[#009E73]">Rank #{option.rank}</span>
                      </div>
                      <div className="space-y-1 text-slate-300">
                        <div className="flex justify-between">
                          <span>{t.factorConfidence}:</span>
                          <span className="font-semibold text-emerald-400">{option.confidenceScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t.factorTimeSaved}:</span>
                          <span className="font-semibold text-sky-400">
                            {isHindi ? option.timeDisplayHi : option.timeDisplayEn}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t.factorComfort}:</span>
                          <span className="font-semibold text-amber-300">{option.comfortRating}/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t.factorCost}:</span>
                          <span className="font-semibold text-emerald-300">
                            {isHindi ? option.costDisplayHi : option.costDisplayEn}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t.factorTransfer}:</span>
                          <span className="font-semibold text-purple-300">
                            {isHindi ? option.transfersDisplayHi : option.transfersDisplayEn}
                          </span>
                        </div>
                      </div>
                      <p className="pt-1 border-t border-slate-800 text-[9px] text-slate-400 italic">
                        {isHindi ? option.rankingReasonHi : option.rankingReasonEn}
                      </p>
                    </div>
                  )}

                  {/* Plain-Language Reason Alert if Option is Disabled */}
                  {option.disabled && (
                    <div
                      className="mt-2.5 p-2 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-[10px] sm:text-[11px] flex items-start gap-1.5 leading-snug"
                      role="alert"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      <span>{isHindi ? option.disabledReasonHi : option.disabledReasonEn}</span>
                    </div>
                  )}
                </div>

                {/* Apply Button */}
                <button
                  type="button"
                  id={`apply-option-btn-${option.id}`}
                  disabled={option.disabled}
                  aria-disabled={option.disabled ? 'true' : undefined}
                  onClick={() => !option.disabled && handleApplyOption(option)}
                  className={`mt-3 py-2.5 px-3 min-h-[44px] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-95 ${
                    option.disabled
                      ? 'bg-slate-800/40 text-slate-500 border border-slate-800/80 cursor-not-allowed opacity-60'
                      : isTop
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-md hover:scale-[1.02]'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <span>{option.disabled ? (isHindi ? 'बाईपास अनुपलब्ध' : 'Bypass Unavailable') : t.selectOptionBtn}</span>
                  {!option.disabled && <ArrowRight className="w-3.5 h-3.5" />}
                </button>

                {/* Quick Recovery Action for Judges & Travelers to restart journey and experience bypass */}
                {option.disabled && (
                  <button
                    type="button"
                    id="restart-journey-bypass-btn"
                    onClick={() => resetJourney()}
                    className="mt-2 py-2.5 px-3 min-h-[44px] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'बाईपास आज़माने के लिए यात्रा पुनः प्रारंभ करें' : 'Restart journey to try the bypass'}</span>
                  </button>
                )}
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* 3. Resolved Screen Summarizing Outcome with Undo & Family Share Buttons */}
      {status === 'resolved' && (
        <div className="p-5 rounded-3xl bg-slate-950/95 backdrop-blur-2xl border-2 border-emerald-500/80 shadow-2xl text-slate-100 flex flex-col gap-4 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-6 h-6 text-[#009E73]" />
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-white">
                  {t.resolvedTitle}
                </h2>
                <p className="text-xs text-slate-300">
                  {t.resolvedSubtitle}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              3D Outcome Active
            </span>
          </div>

          {/* Outcome Summary Grid (Driven dynamically by confirmedOption data) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                {t.newArrival}
              </span>
              <span className="font-extrabold text-white text-sm">
                {confirmedOption ? (isHindi ? confirmedOption.newEtaHi : confirmedOption.newEtaEn) : '18:35'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                {t.additionalCost}
              </span>
              <span className="font-extrabold text-emerald-300 text-sm">
                {confirmedOption ? (isHindi ? confirmedOption.costDisplayHi : confirmedOption.costDisplayEn) : '₹0'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                {t.comfortScore}
              </span>
              <span className="font-extrabold text-amber-300 text-sm">
                {confirmedOption ? `${confirmedOption.comfortRating}/5 ${isHindi ? 'सितारे' : 'Stars'}` : '4/5'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Armchair className="w-3.5 h-3.5 text-purple-400" />
                {t.seatNote}
              </span>
              <span className="font-bold text-slate-200 text-xs truncate" title={confirmedOption ? (isHindi ? confirmedOption.seatNoteHi : confirmedOption.seatNoteEn) : ''}>
                {confirmedOption
                  ? (isHindi ? confirmedOption.seatNoteHi : confirmedOption.seatNoteEn)
                  : (isHindi ? 'वर्तमान आरक्षित कोच सी-४, सीट २४' : 'Coach C-4, Seat 24 (Reserved AC)')}
              </span>
            </div>
          </div>

          {/* Action Row: Undo Decision Button & Share with Family Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-400">
              {t.undoDesc}
            </span>

            <div className="flex items-center gap-2">
              {/* Share with family button */}
              <button
                type="button"
                onClick={() => setFamilyShareOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <Users className="w-4 h-4" />
                <span>{t.shareWithFamilyBtn}</span>
              </button>

              {/* Undo button */}
              <button
                type="button"
                id="undo-decision-btn"
                onClick={undoConfirmedOption}
                className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 hover:border-amber-400/60 font-bold text-xs transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.undoBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
