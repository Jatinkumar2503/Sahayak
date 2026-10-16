'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Compass,
  AlertTriangle,
  Accessibility,
  CheckCircle,
  X,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useJourneyStore } from '@/store/journeyStore';
import { translations } from '@/i18n/translations';

export function OnboardingModal() {
  const language = useJourneyStore((s) => s.language);
  const isOnboardingOpen = useJourneyStore((s) => s.isOnboardingOpen);
  const setIsOnboardingOpen = useJourneyStore((s) => s.setIsOnboardingOpen);

  const [step, setStep] = useState(1);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const t = translations[language];

  // Auto-open on first visit if not previously seen
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('sahayak_onboarding_seen');
      if (!seen) {
        setIsOnboardingOpen(true);
      }
    }
  }, [setIsOnboardingOpen]);

  // Trap focus and restore focus on close
  useEffect(() => {
    if (!isOnboardingOpen) return;
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
        handleFinish();
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
  }, [isOnboardingOpen]);

  const handleFinish = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sahayak_onboarding_seen', 'true');
    }
    setIsOnboardingOpen(false);
    previousFocusRef.current?.focus();
  };

  if (!isOnboardingOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.onboardingTitle}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md pointer-events-auto"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-slate-950 border-2 border-amber-400/80 rounded-3xl p-6 shadow-2xl ring-1 ring-white/10 text-slate-100 flex flex-col justify-between min-h-[420px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" aria-hidden="true" />
            <h2 className="text-base font-extrabold tracking-tight text-white">
              {t.onboardingTitle}
            </h2>
          </div>
          <button
            onClick={handleFinish}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-amber-400"
            aria-label={t.closeModal}
            title={t.closeModal}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="my-auto py-6">
          {step === 1 && (
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0072B2] to-[#56B4E9] flex items-center justify-center text-white shadow-xl">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-amber-400">
                {t.onboardingStep1Title}
              </h3>
              <p className="text-sm text-slate-300 max-w-md leading-relaxed">
                {t.onboardingStep1Desc}
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#E69F00] to-amber-600 flex items-center justify-center text-slate-950 shadow-xl">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-amber-400">
                {t.onboardingStep2Title}
              </h3>
              <p className="text-sm text-slate-300 max-w-md leading-relaxed">
                {t.onboardingStep2Desc}
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-[#009E73] flex items-center justify-center text-white shadow-xl">
                <Accessibility className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-emerald-400">
                {t.onboardingStep3Title}
              </h3>
              <p className="text-sm text-slate-300 max-w-md leading-relaxed">
                {t.onboardingStep3Desc}
              </p>
            </div>
          )}
        </div>

        {/* Step Indicators & Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div role="group" className="flex items-center gap-1.5" aria-label={`Step ${step} of 3`}>
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  step === s ? 'w-6 bg-amber-400' : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-amber-400 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.onboardingBack}</span>
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
              >
                {t.onboardingSkip}
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all shadow-md flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <span>{t.onboardingNext}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-md flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t.onboardingFinish}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
