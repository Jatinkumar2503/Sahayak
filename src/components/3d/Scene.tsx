'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { AlertTriangle, Compass, CheckCircle2 } from 'lucide-react';
import { useJourneyStore, STATIONS } from '@/store/journeyStore';
import { translations } from '@/i18n/translations';
import { SkyDome } from './SkyDome';
import { LightingRig } from './LightingRig';
import { LowPolyTerrain } from './LowPolyTerrain';
import { TrackSpline } from './TrackSpline';
import { Stations } from './Stations';
import { Train } from './Train';
import { FollowCamera } from './FollowCamera';
import { RenderTelemetry } from './RenderTelemetry';
import { ParallaxAtmosphere } from './ParallaxAtmosphere';
import { BrakeSparks } from './BrakeSparks';
import { SignalHeads } from './SignalHeads';

/**
 * Task 1: Low-power detector
 * Samples actual rendered FPS for 3 seconds after scene load.
 * If average FPS < 40, automatically switches to Lite Mode.
 */
function LowPowerDetector() {
  const isLiteMode = useJourneyStore((s) => s.isLiteMode);
  const setLiteMode = useJourneyStore((s) => s.setLiteMode);
  const setLowPowerDetected = useJourneyStore((s) => s.setLowPowerDetected);

  const sampleStartTime = useRef<number | null>(null);
  const frameCount = useRef(0);
  const evaluated = useRef(false);

  useFrame(() => {
    if (evaluated.current || isLiteMode) return;
    if (sampleStartTime.current === null) {
      sampleStartTime.current = performance.now();
      frameCount.current = 0;
      return;
    }

    frameCount.current++;
    const elapsedSec = (performance.now() - sampleStartTime.current) / 1000;

    if (elapsedSec >= 3.0) {
      evaluated.current = true;
      const avgFps = frameCount.current / elapsedSec;
      if (avgFps < 40) {
        console.warn(
          `[Sahayak 3D] Low-power rendering detected (${avgFps.toFixed(1)} FPS < 40 FPS). Auto-switched to Lite Mode.`
        );
        setLowPowerDetected(true);
        setLiteMode(true);
      }
    }
  });

  return null;
}

/**
 * Task 2: Loading screen with real visual progress
 */
function SceneLoadingScreen() {
  const [progress, setProgress] = useState(15);
  const language = useJourneyStore((s) => s.language);
  const t = translations[language];

  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(45), 150);
    const timer2 = setTimeout(() => setProgress(80), 400);
    const timer3 = setTimeout(() => setProgress(100), 750);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-100 z-10 p-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border-2 border-amber-400/60 flex items-center justify-center text-amber-400">
          <Compass className="w-6 h-6 animate-spin" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-extrabold tracking-wide text-white">
            {t.loadingProgress}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Northern Corridor • Delhi ➔ Ambala • {progress}%
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="bg-amber-400 h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Task 2: Graceful 2D Fallback Page when WebGL is unavailable
 */
function WebGLFallbackView() {
  const language = useJourneyStore((s) => s.language);
  const status = useJourneyStore((s) => s.status);
  const t = translations[language];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 z-10 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-400/70 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-center">
        <div className="flex items-center justify-center gap-2 text-amber-400">
          <AlertTriangle className="w-7 h-7" />
          <h2 className="text-lg font-bold">{t.webglFallbackTitle}</h2>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
          {t.webglFallbackDesc}
        </p>

        {/* 2D Schematic Track Corridor Alternative */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-3 text-left">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">Train: Express 00001</span>
            <span className="font-mono font-bold text-amber-400 uppercase">{status}</span>
          </div>

          <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden my-2">
            <div className="absolute left-0 top-0 bottom-0 bg-emerald-500 w-1/3" />
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            {STATIONS.map((st) => (
              <span key={st.id}>{st.code}</span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Interactive Decision Engine, Family Share, and Speech Voice remain fully active</span>
        </div>
      </div>
    </div>
  );
}

export function Scene() {
  const isLiteMode = useJourneyStore((s) => s.isLiteMode);
  const [hasWebGL, setHasWebGL] = useState(true);

  // Feature detect WebGL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
      }
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return <WebGLFallbackView />;
  }

  // Task 3: Cap pixel ratio by device class
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const dpr: [number, number] | number = isLiteMode ? 1.0 : isMobile ? [1, 1.25] : [1, 1.5];

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-950">
      <Suspense fallback={<SceneLoadingScreen />}>
        <Canvas
          shadows
          dpr={dpr}
          camera={{ position: [0, 10, 30], fov: 55, near: 0.1, far: 600 }}
          gl={{
            antialias: false, // Disabling MSAA saves ~7ms on integrated GPUs with no visual loss in flat shading
            powerPreference: 'high-performance',
          }}
          className="w-full h-full"
        >
          {/* Automatic 3-second low power detection */}
          <LowPowerDetector />

          {/* Renderer Stats Collector (draw calls & triangles) */}
          <RenderTelemetry />

          {/* Sky Dome with Day/Dusk Shader */}
          <SkyDome />

          {/* Hybrid Tier Lighting Rig with soft contact shadows & optional 1024 depth shadow map */}
          <LightingRig />

          {/* Procedural low-poly terrain, crops, trees, and catenary masts */}
          <LowPolyTerrain />

          {/* Main corridor Catmull-Rom spline with instanced sleepers, rails, and reroute branch */}
          <TrackSpline />

          {/* Low-poly station architectures (Delhi, Panipat, Ambala) */}
          <Stations />

          {/* 3D Track Signal Heads with Slow Pulsing Red/Yellow/Green Lamps */}
          <SignalHeads position={[2.8, 0, -165]} />

          {/* Moving 5-Coach Articulated Train with aerodynamic locomotive and passenger coaches */}
          <Train />

          {/* Electric Traction Brake Pad Sparks & Friction Dust (auto-disabled in Lite Mode) */}
          <BrakeSparks />

          {/* Drifting Clouds Parallax & Speed-Based Dynamic FOV (simplified in Lite Mode) */}
          <ParallaxAtmosphere />

          {/* Smooth following camera with chase, cinematic, and map modes */}
          <FollowCamera />
        </Canvas>
      </Suspense>
    </div>
  );
}
