'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { journeyPhysics } from '@/store/journeyPhysics';
import { mainTrackCurve, branchTrackCurve } from './trackCurves';

const STEAM_PARTICLE_COUNT = 32;

export function SteamParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    return Array.from({ length: STEAM_PARTICLE_COUNT }, (_, i) => ({
      age: (i / STEAM_PARTICLE_COUNT) * 1.5,
      lifetime: 1.5,
      offset: new THREE.Vector3((Math.random() - 0.5) * 0.2, 0, (Math.random() - 0.5) * 0.2),
      scale: 0.2,
      progressAnchor: 0,
    }));
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const curve =
      journeyPhysics.activeBranch === 'branch' &&
      journeyPhysics.progress > 0.45 &&
      journeyPhysics.progress < 0.95
        ? branchTrackCurve
        : mainTrackCurve;

    particles.forEach((p, i) => {
      p.age += delta;

      if (p.age >= p.lifetime) {
        // Respawn at engine cab roof
        p.age = 0;
        p.progressAnchor = (journeyPhysics.progress - 0.003 + 1) % 1;
        p.offset.set(
          (Math.random() - 0.5) * 0.25,
          Math.random() * 0.1,
          (Math.random() - 0.5) * 0.25
        );
      }

      const lifeProgress = p.age / p.lifetime;
      const pt = curve.getPointAt(p.progressAnchor);

      // Rise slightly and expand
      const y = pt.y + 2.3 + lifeProgress * 1.4;
      const scale = THREE.MathUtils.lerp(0.2, 0.9, lifeProgress);

      dummy.position.set(pt.x + p.offset.x, y, pt.z + p.offset.z);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();

      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, STEAM_PARTICLE_COUNT]}
    >
      <sphereGeometry args={[0.3, 6, 6]} />
      <meshStandardMaterial
        color="#CBD5E1"
        transparent
        opacity={0.35}
        roughness={1}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
