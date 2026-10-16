'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useJourneyStore } from '@/store/journeyStore';
import { journeyPhysics } from '@/store/journeyPhysics';
import { mainTrackCurve } from './trackCurves';
import { tokens } from '@/styles/tokens';

export function LightingRig() {
  const timeOfDay = useJourneyStore((s) => s.timeOfDay);
  const shadowTier = useJourneyStore((s) => s.shadowTier);
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight>(null);

  const env = tokens.colors.environment[timeOfDay];
  const targetSunColor = new THREE.Color(env.sun);
  const targetAmbientColor = new THREE.Color(env.ambient);
  const targetFogColor = new THREE.Color(env.fog);

  const isDynamicShadow = shadowTier === 'dynamic';

  useFrame((state, delta) => {
    const lerpFactor = Math.min(delta * 2.5, 1);

    // Toggle shadow map dynamically on WebGLRenderer
    if (state.gl.shadowMap.enabled !== isDynamicShadow) {
      state.gl.shadowMap.enabled = isDynamicShadow;
    }

    // Keep directional shadow frustum tightly following the train
    const trainPt = mainTrackCurve.getPointAt(journeyPhysics.progress);

    if (dirLightRef.current) {
      dirLightRef.current.color.lerp(targetSunColor, lerpFactor);
      dirLightRef.current.intensity = THREE.MathUtils.lerp(
        dirLightRef.current.intensity,
        env.sunIntensity,
        lerpFactor
      );

      dirLightRef.current.castShadow = isDynamicShadow;
      dirLightRef.current.position.set(trainPt.x + 25, 40, trainPt.z + 18);
      dirLightRef.current.target.position.set(trainPt.x, trainPt.y, trainPt.z);
      dirLightRef.current.target.updateMatrixWorld();
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
      <fog attach="fog" args={[env.fog, env.fogNear, env.fogFar]} />

      <hemisphereLight
        ref={hemiLightRef}
        args={[env.ambient, '#1E293B', env.ambientIntensity]}
        position={[0, 50, 0]}
      />

      {/* Directional Sun Light with hybrid shadow tier */}
      <directionalLight
        ref={dirLightRef}
        args={[env.sun, env.sunIntensity]}
        position={[25, 40, 18]}
        castShadow={isDynamicShadow}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={5}
        shadow-camera-far={80}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.0008}
      />
    </>
  );
}
