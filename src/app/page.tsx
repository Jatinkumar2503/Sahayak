'use client';

import dynamic from 'next/dynamic';
import { Overlay } from '@/components/ui/Overlay';
import { StatsOverlay } from '@/components/ui/StatsOverlay';
import { ScrollDriver } from '@/components/ui/ScrollDriver';
import { JourneyTimelineA11y } from '@/components/ui/JourneyTimelineA11y';
import { DisruptionPanel } from '@/components/ui/DisruptionPanel';
import { DecisionCardsOverlay } from '@/components/ui/DecisionCardsOverlay';
import { FamilyShareModal } from '@/components/ui/FamilyShareModal';
import { useJourneyStore } from '@/store/journeyStore';

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
  const isFamilyShareOpen = useJourneyStore((s) => s.isFamilyShareOpen);
  const setFamilyShareOpen = useJourneyStore((s) => s.setFamilyShareOpen);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* Fullscreen 3D Railway World */}
      <Scene />

      {/* Accessible HTML Overlay */}
      <Overlay />

      {/* Phase 3 Disruption Simulation Control Panel */}
      <DisruptionPanel />

      {/* Phase 3 Deterministic Ranked Decision Cards & A11y Live Banner */}
      <DecisionCardsOverlay />

      {/* Phase 3 Family Live Share Phone Frame Mockup Modal */}
      <FamilyShareModal
        isOpen={isFamilyShareOpen}
        onClose={() => setFamilyShareOpen(false)}
      />

      {/* Dev Frame Rate, Draw Calls & Performance Telemetry */}
      <StatsOverlay />

      {/* Wheel / Trackpad Scroll-Driven Journey Driver */}
      <ScrollDriver />

      {/* Screen Reader Semantic HTML Journey Timeline */}
      <JourneyTimelineA11y />
    </main>
  );
}
