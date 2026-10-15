'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useJourneyStore } from '@/store/journeyStore';
import { journeyPhysics } from '@/store/journeyPhysics';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { mainTrackCurve, branchTrackCurve } from './trackCurves';

export function FollowCamera() {
  const { camera } = useThree();
  const cameraMode = useJourneyStore((s) => s.cameraMode);
  const activeBranch = useJourneyStore((s) => s.activeBranch);
  const isReducedMotion = useReducedMotion();

  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    const isBranching =
      activeBranch === 'branch' &&
      journeyPhysics.progress > 0.45 &&
      journeyPhysics.progress < 0.95;
    const curve = isBranching ? branchTrackCurve : mainTrackCurve;

    const trainPos = curve.getPointAt(journeyPhysics.progress);
    const tangent = curve.getTangentAt(journeyPhysics.progress).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();

    const targetPos = new THREE.Vector3();
    const targetLookAt = new THREE.Vector3().copy(trainPos).add(new THREE.Vector3(0, 1.2, 0));

    if (cameraMode === 'chase') {
      // Behind and slightly above the train
      targetPos
        .copy(trainPos)
        .addScaledVector(tangent, 16)
        .add(new THREE.Vector3(0, 7.5, 0))
        .addScaledVector(normal, 3.5);
    } else if (cameraMode === 'cinematic') {
      // Side low-angle cinematic fly-by
      targetPos
        .copy(trainPos)
        .addScaledVector(tangent, 6)
        .add(new THREE.Vector3(0, 3.2, 0))
        .addScaledVector(normal, 12);
    } else {
      // Map / Top-down helicopter view
      targetPos
        .copy(trainPos)
        .add(new THREE.Vector3(0, 48, 12));
    }

    if (isReducedMotion) {
      // Fixed position without rapid swinging/lerping
      camera.position.copy(targetPos);
      camera.lookAt(targetLookAt);
    } else {
      // Fluid lerp for 60fps tracking
      const factor = Math.min(delta * 4, 1);
      camera.position.lerp(targetPos, factor);
      currentLookAt.current.lerp(targetLookAt, factor);
      camera.lookAt(currentLookAt.current);
    }
  });

  return null;
}
