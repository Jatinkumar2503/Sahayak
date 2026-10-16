'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { journeyPhysics } from '@/store/journeyPhysics';
import { useJourneyStore } from '@/store/journeyStore';
import { mainTrackCurve, branchTrackCurve } from './trackCurves';

const SPARK_COUNT = 24;

/**
 * Electric Locomotive Braking Sparks & Brake Dust
 * Triggers realistic under-bogie brake pad sparks and dust ONLY during deceleration/braking.
 * Eliminates out-of-place steam on electric traction.
 */
export function BrakeSparks() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const disruptionType = useJourneyStore((s) => s.disruptionType);

  // Sparks only active when braking or decelerating into station
  const isBraking =
    disruptionType === 'delay' ||
    disruptionType === 'cancellation' ||
    (journeyPhysics.speed < journeyPhysics.targetSpeed && journeyPhysics.speed > 0.01);

  const particles = useMemo(() => {
    return Array.from({ length: SPARK_COUNT }, (_, i) => ({
      age: (i / SPARK_COUNT) * 0.4,
      lifetime: 0.35 + Math.random() * 0.15,
      offset: new THREE.Vector3((Math.random() - 0.5) * 1.4, 0, (Math.random() - 0.5) * 2.0),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 1.8,
        Math.random() * 0.8 + 0.2,
        -(Math.random() * 2.5 + 1.0)
      ),
    }));
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    if (!isBraking) {
      // Hide all sparks when not braking
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      for (let i = 0; i < SPARK_COUNT; i++) {
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
      return;
    }

    const curve =
      journeyPhysics.activeBranch === 'branch' &&
      journeyPhysics.progress > 0.45 &&
      journeyPhysics.progress < 0.95
        ? branchTrackCurve
        : mainTrackCurve;

    const leadPt = curve.getPointAt(journeyPhysics.progress);

    particles.forEach((p, i) => {
      p.age += delta;

      if (p.age >= p.lifetime) {
        // Reset spark at wheel-rail contact point
        p.age = 0;
        const side = Math.random() > 0.5 ? 0.72 : -0.72;
        p.offset.set(side, 0.15, (Math.random() - 0.5) * 3.2);
        p.velocity.set(
          (Math.random() - 0.5) * 1.2,
          Math.random() * 0.6 + 0.1,
          -(Math.random() * 2.2 + 0.5)
        );
      }

      const lifeProgress = p.age / p.lifetime;
      const currentPos = new THREE.Vector3()
        .copy(leadPt)
        .add(p.offset)
        .addScaledVector(p.velocity, p.age);

      const scale = THREE.MathUtils.lerp(0.12, 0.02, lifeProgress);

      dummy.position.copy(currentPos);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();

      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, SPARK_COUNT]}
    >
      <sphereGeometry args={[0.2, 4, 4]} />
      <meshBasicMaterial
        color="#FDE047"
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
