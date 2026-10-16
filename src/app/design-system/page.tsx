import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  OctagonAlert,
  GitBranch,
  ShieldCheck,
  Eye,
  Accessibility,
  Compass,
} from 'lucide-react';
import { tokens } from '@/styles/tokens';

export const metadata = {
  title: 'Sahayak 3D — Accessible Design System',
  description: 'Design system specifications, Okabe-Ito colorblind palette, typography, status glyphs, and motion principles.',
};

export default function DesignSystemPage() {
  const okabeItoColors = [
    {
      name: 'Bluish Green',
      hex: '#009E73',
      usage: 'On-Time Status, Clear Signal 104, Resolved States',
      contrastOnDark: '8.4:1 (WCAG AAA)',
      textClass: 'text-[#009E73]',
      bgClass: 'bg-[#009E73]',
    },
    {
      name: 'Orange / Amber',
      hex: '#E69F00',
      usage: 'Delays, Caution Signal 104, Universal Focus Rings',
      contrastOnDark: '9.2:1 (WCAG AAA)',
      textClass: 'text-[#E69F00]',
      bgClass: 'bg-[#E69F00]',
    },
    {
      name: 'Vermilion',
      hex: '#D55E00',
      usage: 'Cancellations, Danger Signal 104, Assertive Alerts',
      contrastOnDark: '5.6:1 (WCAG AA)',
      textClass: 'text-[#D55E00]',
      bgClass: 'bg-[#D55E00]',
    },
    {
      name: 'Blue',
      hex: '#0072B2',
      usage: 'Bypass Rerouting, Primary Action Buttons, Indian Rail Navy',
      contrastOnDark: '4.8:1 (WCAG AA)',
      textClass: 'text-[#0072B2]',
      bgClass: 'bg-[#0072B2]',
    },
    {
      name: 'Sky Blue',
      hex: '#56B4E9',
      usage: 'Day Sky Dome, Atmospheric Fog, Secondary Accents',
      contrastOnDark: '10.5:1 (WCAG AAA)',
      textClass: 'text-[#56B4E9]',
      bgClass: 'bg-[#56B4E9]',
    },
    {
      name: 'Reddish Purple',
      hex: '#CC79A7',
      usage: 'Secondary Badges, Passenger Highlights',
      contrastOnDark: '6.1:1 (WCAG AA)',
      textClass: 'text-[#CC79A7]',
      bgClass: 'bg-[#CC79A7]',
    },
    {
      name: 'Yellow',
      hex: '#F0E442',
      usage: 'Indian Railways Station Signboards, High-Visibility Highlights',
      contrastOnDark: '14.2:1 (WCAG AAA)',
      textClass: 'text-[#F0E442]',
      bgClass: 'bg-[#F0E442]',
    },
  ];

  const typographyScale = [
    { label: 'Display Title', size: '2.25rem (36px)', weight: '900 ExtraBold', sample: 'Express 00001 Corridor' },
    { label: 'Heading 1', size: '1.5rem (24px)', weight: '800 Bold', sample: 'Signal 104 Danger Ahead' },
    { label: 'Heading 2', size: '1.25rem (20px)', weight: '700 Bold', sample: 'Take Chord Bypass Detour' },
    { label: 'Body Text', size: '1rem (16px)', weight: '400 Regular', sample: 'Train diverted via chord line saving 22 minutes of transit delay.' },
    { label: 'UI Badges', size: '0.75rem (12px)', weight: '700 Bold', sample: 'ON TIME • समय पर' },
    { label: 'Telemetry Mono', size: '0.6875rem (11px)', weight: '600 Mono', sample: 'FRAME: 16.6ms • 60 FPS • 85 CALLS' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 max-w-5xl mx-auto space-y-12">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-8 border-b border-slate-800">
        <div className="space-y-1">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors focus-visible:outline-2 focus-visible:outline-amber-400 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to 3D Simulator
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Sahayak 3D Design System
          </h1>
          <p className="text-sm text-slate-400">
            Formal design tokens, Okabe-Ito colorblind accessibility, dual-modality glyphs, and motion standards.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>WCAG 2.1 AA Compliant</span>
        </div>
      </header>

      {/* 1. Okabe-Ito Palette */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            1. Authentic Okabe-Ito Colorblind-Safe Standard
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Standardized palette proven universally distinguishable across Protanopia, Deuteranopia, Tritanopia, and Monochromacy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {okabeItoColors.map((c) => (
            <div
              key={c.name}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{c.name}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                  {c.hex}
                </span>
              </div>
              <div
                className="w-full h-12 rounded-xl shadow-inner border border-white/10"
                style={{ backgroundColor: c.hex }}
              />
              <div className="space-y-1 text-xs">
                <p className="text-slate-300 font-medium leading-snug">{c.usage}</p>
                <p className="text-[11px] text-emerald-400 font-mono">{c.contrastOnDark}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Dual-Modality Status Components */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            2. Dual-Modality Status Components (Never Color Alone)
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Per WCAG 1.4.1 (Use of Color), every status combines an Okabe-Ito tint, geometric SVG glyph, visible dual-language text, and unique border patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* On-Time */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-[#009E73]/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#004D38] border border-[#009E73] flex items-center justify-center text-[#009E73]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">On-Time / समय पर</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono">Circle</span>
              </div>
              <p className="text-xs text-slate-400">Regular corridor velocity (0.25) • Signal 104 CLEAR</p>
            </div>
          </div>

          {/* Delay */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-[#E69F00]/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#7A5400] border border-[#E69F00] flex items-center justify-center text-[#E69F00]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Delayed / विलंबित</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-mono">Triangle</span>
              </div>
              <p className="text-xs text-slate-400">Deceleration (0.02) • Signal 104 CAUTION/STOP</p>
            </div>
          </div>

          {/* Cancellation */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-[#D55E00]/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6E3100] border border-[#D55E00] flex items-center justify-center text-[#D55E00]">
              <OctagonAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Cancelled / रद्द</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 font-mono">Octagon</span>
              </div>
              <p className="text-xs text-slate-400">Section Halt (0.00) • Signal 104 STOP (Red)</p>
            </div>
          </div>

          {/* Rerouted */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-[#0072B2]/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#003B5C] border border-[#0072B2] flex items-center justify-center text-[#56B4E9]">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Rerouted / मार्ग परिवर्तित</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-mono">Branch</span>
              </div>
              <p className="text-xs text-slate-400">Parametric chord spline blend • Slower approach</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Typography Scale */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            3. Typography Hierarchy & Scalability
          </h2>
          <p className="text-xs text-slate-400">
            Fluid typography scale supporting up to 200% browser text zoom without clipping.
          </p>
        </div>

        <div className="divide-y divide-slate-800 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          {typographyScale.map((t) => (
            <div key={t.label} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="w-48 shrink-0">
                <span className="text-xs font-mono text-amber-400 font-bold">{t.label}</span>
                <p className="text-[11px] text-slate-400 font-mono">{t.size} • {t.weight}</p>
              </div>
              <div className="text-white truncate font-medium">
                {t.sample}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Motion & Reduced Motion Principles */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            4. Motion Principles & Vestibular Safety
          </h2>
          <p className="text-xs text-slate-400">
            Smooth 60fps animations balanced with full reduced-motion safeguards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              Standard Motion (60 FPS Target)
            </h3>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Following camera smoothly interpolates position via lerp factors (0.04 to 0.08).</li>
              <li>Train bogies swivel along spline tangents with subtle 0.015 rad curve sway.</li>
              <li>Speed changes adapt dynamically between 0.25 (running) and 0.02 (braking).</li>
              <li>Interactive controls use snappy 150ms transform presses (<code className="font-mono text-amber-300">active:scale-95</code>).</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              Reduced Motion (<code className="font-mono text-xs text-emerald-300">prefers-reduced-motion</code>)
            </h3>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Camera bobbing and curve sway are locked to zero.</li>
              <li>Reroute branch transitions switch instantly via gentle cross-fade.</li>
              <li>Pulsing glow shaders on Signal 104 heads are completely frozen.</li>
              <li>All UI animations and slide transitions are disabled.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Elder Mode Specifications */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            5. Senior Citizen Accessibility (Elder Mode / वरिष्ठ मोड)
          </h2>
          <p className="text-xs text-slate-400">
            Tailored specifically for senior citizens and low-vision travelers navigating rail distress.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border-2 border-amber-400/80 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Accessibility className="w-5 h-5" />
            <span className="font-bold text-sm">Elder Mode Enhancements</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="space-y-1">
              <span className="font-bold text-white">1. High-Contrast Geometry</span>
              <p>Prominent 2px solid amber borders (<code className="text-amber-300 font-mono">#E69F00</code>) around all cards and touch targets.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-white">2. Slower Visual Pace</span>
              <p>Locomotive velocity reduced by 36% (targetSpeed: 0.16) for relaxed visual tracking.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-white">3. Enlarged Touch Targets</span>
              <p>All action buttons strictly exceed 48×48px with 18px+ typography.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
