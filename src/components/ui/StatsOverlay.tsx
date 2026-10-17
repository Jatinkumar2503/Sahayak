'use client';

import React, { useEffect, useState } from 'react';
import { useJourneyStore } from '@/store/journeyStore';
import { journeyPhysics } from '@/store/journeyPhysics';

export function StatsOverlay() {
  const showFps = useJourneyStore((s) => s.showFps);
  const status = useJourneyStore((s) => s.status);
  const shadowTier = useJourneyStore((s) => s.shadowTier);
  const setShadowTier = useJourneyStore((s) => s.setShadowTier);

  const [telemetry, setTelemetry] = useState({
    fps: 60,
    frameTime: 16.6,
    progress: 2.0,
    speed: 110,
    calls: 0,
    triangles: 0,
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const calcFps = () => {
      frameCount++;
      const now = performance.now();
      const elapsed = now - lastTime;

      // Update telemetry display every 350ms to preserve 60fps rendering budget
      if (elapsed >= 350) {
        const currentFps = Math.round((frameCount * 1000) / elapsed);
        setTelemetry({
          fps: currentFps,
          frameTime: parseFloat((elapsed / frameCount).toFixed(1)),
          progress: parseFloat((journeyPhysics.progress * 100).toFixed(1)),
          speed: Math.round(journeyPhysics.speed * 440),
          calls: journeyPhysics.renderInfo.calls,
          triangles: journeyPhysics.renderInfo.triangles,
        });
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(calcFps);
    };

    animId = requestAnimationFrame(calcFps);
    return () => cancelAnimationFrame(animId);
  }, []);

  if (!showFps) return null;

  const toggleShadow = () => {
    const nextTier = shadowTier === 'blob' ? 'dynamic' : 'blob';
    setShadowTier(nextTier);
  };

  return (
    <aside
      aria-label="Engine Performance Telemetry"
      className="fixed bottom-4 left-4 z-40 bg-slate-950/90 backdrop-blur-md border border-slate-700/60 text-slate-300 text-xs font-mono p-3 rounded-xl shadow-2xl flex flex-col gap-1.5 min-w-[210px] pointer-events-auto"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-[11px] font-bold text-[#E69F00]">
        <span>R3F ENGINE STATS</span>
        <span
          className={`px-1.5 py-0.5 rounded font-black ${
            telemetry.fps >= 55
              ? 'bg-emerald-950 text-[#009E73] border border-[#009E73]/40'
              : 'bg-amber-950 text-[#E69F00] border border-[#E69F00]/40'
          }`}
        >
          {telemetry.fps} FPS
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-slate-400">Frame Time:</span>
        <span className="font-semibold text-slate-200">{telemetry.frameTime} ms</span>
      </div>

      <div className="flex justify-between">
        <span className="text-slate-400">Draw Calls:</span>
        <span className={`font-semibold ${telemetry.calls < 150 ? 'text-emerald-400' : 'text-amber-400'}`}>
          {telemetry.calls || '—'}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-slate-400">Triangles:</span>
        <span className={`font-semibold ${telemetry.triangles < 300000 ? 'text-emerald-400' : 'text-amber-400'}`}>
          {telemetry.triangles ? `${Math.round(telemetry.triangles / 1000)}k` : '—'}
        </span>
      </div>

      <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
        <span className="text-slate-400">Shadow Tier:</span>
        <button
          onClick={toggleShadow}
          title="Click to toggle between Blob (Fast) and Dynamic (1024) shadows"
          className={`px-3 py-2 min-h-[44px] min-w-[90px] flex items-center justify-center rounded-lg text-xs font-bold uppercase transition-all active:scale-95 ${
            shadowTier === 'dynamic'
              ? 'bg-blue-950 text-sky-200 border border-sky-500/60'
              : 'bg-emerald-950 text-emerald-200 border border-emerald-500/60'
          }`}
        >
          {shadowTier === 'dynamic' ? 'Dynamic 1024' : 'Blob (Fast)'}
        </button>
      </div>

      <div className="flex justify-between pt-0.5">
        <span className="text-slate-400">Status:</span>
        <span className="font-semibold uppercase text-sky-400">{status}</span>
      </div>
    </aside>
  );
}
