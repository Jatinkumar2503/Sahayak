'use client';

import React, { useEffect, useState } from 'react';
import { useJourneyStore } from '@/store/journeyStore';
import { journeyPhysics } from '@/store/journeyPhysics';

export function StatsOverlay() {
  const showFps = useJourneyStore((s) => s.showFps);
  const status = useJourneyStore((s) => s.status);
  const [telemetry, setTelemetry] = useState({
    fps: 60,
    frameTime: 16.6,
    progress: 2.0,
    speed: 110,
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const calcFps = () => {
      frameCount++;
      const now = performance.now();
      const elapsed = now - lastTime;

      // Update telemetry display every 400ms to preserve 60fps rendering budget
      if (elapsed >= 400) {
        const currentFps = Math.round((frameCount * 1000) / elapsed);
        setTelemetry({
          fps: currentFps,
          frameTime: parseFloat((elapsed / frameCount).toFixed(1)),
          progress: parseFloat((journeyPhysics.progress * 100).toFixed(1)),
          speed: Math.round(journeyPhysics.speed * 440),
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

  return (
    <aside
      aria-label="Engine Performance Telemetry"
      className="fixed bottom-4 left-4 z-40 bg-slate-950/85 backdrop-blur-md border border-slate-700/60 text-slate-300 text-xs font-mono p-3 rounded-lg shadow-2xl flex flex-col gap-1.5 min-w-[190px] pointer-events-auto"
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
        <span className="font-semibold">{telemetry.frameTime} ms</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">Track Progress:</span>
        <span className="font-semibold">{telemetry.progress}%</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">Train Speed:</span>
        <span className="font-semibold">{telemetry.speed} km/h</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">Status:</span>
        <span className="font-semibold uppercase text-sky-400">{status}</span>
      </div>
    </aside>
  );
}
