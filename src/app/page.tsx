'use client';

import dynamic from 'next/dynamic';
import { Overlay } from '@/components/ui/Overlay';
import { StatsOverlay } from '@/components/ui/StatsOverlay';
import { ScrollDriver } from '@/components/ui/ScrollDriver';
import { JourneyTimelineA11y } from '@/components/ui/JourneyTimelineA11y';

// Dynamically import Three.js canvas to ensure clean browser-only rendering
const Scene = dynamic(() => import('@/components/3d/Scene').then((m) => m.Scene), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-slate-200">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wider text-amber-400">
          INITIALIZING SAHAYAK 3D CORRIDOR...
        </p>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* Fullscreen 3D Railway World */}
      <Scene />

      {/* Accessible HTML Overlay */}
      <Overlay />

      {/* Dev Frame Rate, Draw Calls & Performance Telemetry */}
      <StatsOverlay />

      {/* Wheel / Trackpad Scroll-Driven Journey Driver */}
      <ScrollDriver />

      {/* Screen Reader Semantic HTML Journey Timeline */}
      <JourneyTimelineA11y />
    </main>
  );
}
