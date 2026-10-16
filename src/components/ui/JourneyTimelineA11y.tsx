'use client';

import React from 'react';
import { useJourneyStore, STATIONS } from '@/store/journeyStore';
import { journeyPhysics } from '@/store/journeyPhysics';

export function JourneyTimelineA11y() {
  const status = useJourneyStore((s) => s.status);
  const language = useJourneyStore((s) => s.language);
  const isHindi = language === 'hi';

  return (
    <section
      aria-label={isHindi ? 'रेल यात्रा की पूरी समयरेखा एवं स्टेशन विवरण' : 'Rail Journey Full Timeline and Station Details'}
      className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-20 focus-within:left-6 focus-within:z-50 focus-within:bg-slate-950 focus-within:p-6 focus-within:rounded-xl focus-within:border-2 focus-within:border-amber-400 focus-within:max-w-md focus-within:shadow-2xl"
    >
      <h2 className="text-base font-bold text-amber-400 mb-2">
        {isHindi ? 'यात्रा समयरेखा (पाठ विकल्प)' : 'Journey Timeline (Accessible Text Alternative)'}
      </h2>
      <p className="text-xs text-slate-300 mb-3">
        {isHindi
          ? `वर्तमान स्थिति: ${status}. ट्रेन दिल्ली से अम्बाला की ओर अग्रसर है।`
          : `Current status: ${status}. Train is en route from New Delhi to Ambala Cantt.`}
      </p>

      <ol className="space-y-2 text-xs">
        {STATIONS.map((st, i) => {
          const isPassed = journeyPhysics.progress >= st.progress;
          const isCurrent = Math.abs(journeyPhysics.progress - st.progress) < 0.08;

          return (
            <li
              key={st.id}
              className={`p-2 rounded border ${
                isCurrent
                  ? 'border-amber-400 bg-amber-950/40 font-bold text-amber-300'
                  : isPassed
                  ? 'border-emerald-600 bg-emerald-950/20 text-slate-300'
                  : 'border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex justify-between items-center">
                <span>
                  {i + 1}. {isHindi ? st.nameHi : st.nameEn} ({st.code})
                </span>
                <span className="text-[10px] uppercase font-mono">
                  {isCurrent
                    ? (isHindi ? 'वर्तमान स्टेशन' : 'Arriving / At Platform')
                    : isPassed
                    ? (isHindi ? 'पार किया' : 'Passed')
                    : (isHindi ? 'आगामी' : 'Upcoming')}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
