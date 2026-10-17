import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, GitBranch, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
      {/* Subtle Rail Track Background Grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #475569 1px, transparent 1px), linear-gradient(to bottom, #475569 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10 flex flex-col items-center">
        {/* Signal Aspect Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#6E3100]/60 border border-[#D55E00] text-[#FEF3C7] text-xs font-bold mb-6 shadow-lg">
          <AlertTriangle className="w-4 h-4 text-[#D55E00]" aria-hidden="true" />
          <span>Signal 404 • Track Switched</span>
        </div>

        {/* 404 Heading */}
        <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight leading-tight">
          Track Not Found
        </h1>
        <p className="text-lg font-bold text-[#E69F00] mt-1">
          ४०४ • ट्रैक नहीं मिला
        </p>

        {/* Explanation */}
        <p className="text-sm text-slate-400 mt-4 leading-relaxed">
          The rail corridor line or station page you are looking for does not exist on this route or has been rerouted to an alternate siding.
        </p>

        {/* Return to Simulator CTA */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 min-h-[48px] rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm shadow-xl transition-all transform active:scale-95 focus-visible:ring-4 focus-visible:ring-emerald-400"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Return to Rail Simulator</span>
          </Link>
          <Link
            href="/design-system"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <GitBranch className="w-4 h-4 text-[#56B4E9]" aria-hidden="true" />
            <span>Design Tokens</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
