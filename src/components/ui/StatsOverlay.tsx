'use client';

import React, { useEffect, useState } from 'react';
import { useJourneyStore } from '@/store/journeyStore';

export function StatsOverlay() {
  const showFps = useJourneyStore((s) => s.showFps);
  const [fps, setFps] = useState(60);
  const [frameTime, setFrameTime] = useState(16.6);
  const speed = useJourneyStore((s) => s.speed);
  const progress = useJourneyStore((s) => s.progress);
  const status = useJourneyStore((s) => s.status);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const calcFps = () => {
      frameCount++;
      const now = performance.now();
      const elapsed = now - lastTime;

      if (elapsed >= 500) {
        const currentFps = Math.round((frameCount * 1000) / elapsed);
        setFps(currentFps);
        setFrameTime(parseFloat((elapsed / frameCount).toFixed(1)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(calcFps);
    };

    animId = requestAnimationFrame(calcFps);
    return () => cancelAnimationFrame(animId);
  }, []);

  if (!showFps) return null;

  return (
    <aside
      aria-label="Engine Performance Telemetry"
      className="fixed bottom-4 left-4 z-40 bg-slate-950/85 backdrop-blur-md border border-slate-700/60 text-slate-300 text-xs font-mono p-3 rounded-lg shadow-2xl flex flex-col gap-1.5 min-w-[180px] pointer-events-auto"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-[11px] font-bold text-amber-400">
        <span>R3F ENGINE STATS</span>
        <span
          className={`px-1.5 py-0.2 rounded font-black ${
            fps >= 50 ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
          }`}
        >
          {fps} FPS
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">Frame Time:</span>
        <span className="font-semibold">{frameTime} ms</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">Track Progress:</span>
        <span className="font-semibold">{(progress * 100).toFixed(1)}%</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">Train Speed:</span>
        <span className="font-semibold">{(speed * 440).toFixed(0)} km/h</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">Status:</span>
        <span className="font-semibold uppercase text-sky-400">{status}</span>
      </div>
    </aside>
  );
}
