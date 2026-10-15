'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { SkyDome } from './SkyDome';
import { LightingRig } from './LightingRig';
import { LowPolyTerrain } from './LowPolyTerrain';
import { TrackSpline } from './TrackSpline';
import { Stations } from './Stations';
import { Train } from './Train';
import { FollowCamera } from './FollowCamera';

function SceneFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-slate-200">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium tracking-wide">Loading Sahayak 3D Corridor...</p>
      </div>
    </div>
  );
}

export function Scene() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-950">
      <Suspense fallback={<SceneFallback />}>
        <Canvas
          shadows
          dpr={[1, 1.25]} // Capped at 1.25 for guaranteed 60fps on all laptop displays
          camera={{ position: [0, 10, 30], fov: 55, near: 0.1, far: 600 }}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
          }}
          className="w-full h-full"
        >
          {/* Sky Dome with Day/Dusk Shader */}
          <SkyDome />

          {/* Optimized Lighting Rig with soft shadows and animated fog */}
          <LightingRig />

          {/* Procedural low-poly terrain, crops, trees, and catenary masts */}
          <LowPolyTerrain />

          {/* Main corridor Catmull-Rom spline with instanced sleepers, rails, and reroute branch */}
          <TrackSpline />

          {/* Low-poly station architectures (Delhi, Panipat, Ambala) */}
          <Stations />

          {/* Moving Train with aerodynamic locomotive and braking lights */}
          <Train />

          {/* Smooth following camera with chase, cinematic, and map modes */}
          <FollowCamera />
        </Canvas>
      </Suspense>
    </div>
  );
}
