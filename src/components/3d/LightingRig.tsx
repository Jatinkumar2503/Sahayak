'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useJourneyStore } from '@/store/journeyStore';
import { tokens } from '@/styles/tokens';

export function LightingRig() {
  const timeOfDay = useJourneyStore((s) => s.timeOfDay);
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight>(null);

  // Target values based on time of day
  const env = tokens.colors.environment[timeOfDay];
  const targetSunColor = new THREE.Color(env.sun);
  const targetAmbientColor = new THREE.Color(env.ambient);
  const targetFogColor = new THREE.Color(env.fog);

  useFrame((state, delta) => {
    // Smooth lerp for light color transitions
    const lerpFactor = Math.min(delta * 2.5, 1);

    if (dirLightRef.current) {
      dirLightRef.current.color.lerp(targetSunColor, lerpFactor);
      dirLightRef.current.intensity = THREE.MathUtils.lerp(
        dirLightRef.current.intensity,
        env.sunIntensity,
        lerpFactor
      );
    }

    if (hemiLightRef.current) {
      hemiLightRef.current.color.lerp(targetAmbientColor, lerpFactor);
      hemiLightRef.current.intensity = THREE.MathUtils.lerp(
        hemiLightRef.current.intensity,
        env.ambientIntensity,
        lerpFactor
      );
    }

    if (state.scene.fog && state.scene.fog instanceof THREE.Fog) {
      state.scene.fog.color.lerp(targetFogColor, lerpFactor);
      state.scene.fog.near = THREE.MathUtils.lerp(
        state.scene.fog.near,
        env.fogNear,
        lerpFactor
      );
      state.scene.fog.far = THREE.MathUtils.lerp(
        state.scene.fog.far,
        env.fogFar,
        lerpFactor
      );
    }
  });

  return (
    <>
      {/* Three.js Fog for atmospheric depth */}
      <fog attach="fog" args={[env.fog, env.fogNear, env.fogFar]} />

      {/* Hemisphere Light for soft sky/ground ambient fill */}
      <hemisphereLight
        ref={hemiLightRef}
        args={[env.ambient, '#1E293B', env.ambientIntensity]}
        position={[0, 50, 0]}
      />

      {/* Directional Sun Light with optimized 1024 shadow map for stable 60fps */}
      <directionalLight
        ref={dirLightRef}
        args={[env.sun, env.sunIntensity]}
        position={[45, 60, 30]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={10}
        shadow-camera-far={200}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.0006}
      />
    </>
  );
}
