'use client';

import React, { useRef, useMemo, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { journeyPhysics } from '@/store/journeyPhysics';

import { useJourneyStore } from '@/store/journeyStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const CLOUD_COUNT = 18;
const PARTICLE_COUNT = 45;

export function ParallaxAtmosphere() {
  const { camera } = useThree();
  const isLiteMode = useJourneyStore((s) => s.isLiteMode);
  const isReducedMotion = useReducedMotion();
  const activeCloudCount = isLiteMode ? 6 : CLOUD_COUNT;
  const cloudsRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Procedural cloud cluster positions
  const cloudData = useMemo(() => {
    const list: { pos: THREE.Vector3; speed: number; scale: THREE.Vector3 }[] = [];
    for (let i = 0; i < CLOUD_COUNT; i++) {
      list.push({
        pos: new THREE.Vector3(
          (Math.sin(i * 99) - 0.5) * 140,
          35 + Math.abs(Math.cos(i * 37)) * 15,
          -i * 30 + 40
        ),
        speed: 1.2 + (i % 3) * 0.6,
        scale: new THREE.Vector3(
          8 + (i % 4) * 3,
          2.5 + (i % 2) * 1.5,
          6 + (i % 3) * 2
        ),
      });
    }
    return list;
  }, []);

  // Speed streak / locomotive steam particles buffer
  const particleGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const opacities = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.8;
      positions[i * 3 + 1] = 2.0 + Math.random() * 1.5;
      positions[i * 3 + 2] = -Math.random() * 8;
      opacities[i] = Math.random();
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
    return geo;
  }, []);

  useLayoutEffect(() => {
    if (!cloudsRef.current) return;
    const dummy = new THREE.Object3D();

    cloudData.slice(0, activeCloudCount).forEach((c, i) => {
      dummy.position.copy(c.pos);
      dummy.scale.copy(c.scale);
      dummy.updateMatrix();
      cloudsRef.current?.setMatrixAt(i, dummy.matrix);
    });

    cloudsRef.current.instanceMatrix.needsUpdate = true;
  }, [cloudData, activeCloudCount]);

  useFrame((_, delta) => {
    // 1. Drifting Clouds Parallax: clouds stay completely static under reduced motion
    if (cloudsRef.current && !isReducedMotion) {
      const dummy = new THREE.Object3D();
      cloudData.slice(0, activeCloudCount).forEach((c, i) => {
        // Drift along X and slowly along Z
        c.pos.x += delta * c.speed;
        if (c.pos.x > 80) c.pos.x = -80;

        dummy.position.copy(c.pos);
        dummy.scale.copy(c.scale);
        dummy.updateMatrix();
        cloudsRef.current?.setMatrixAt(i, dummy.matrix);
      });
      cloudsRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. Dynamic Speed-Based Camera FOV (stabilized when reduced motion is preferred)
    if (camera instanceof THREE.PerspectiveCamera) {
      if (isReducedMotion) {
        camera.fov = 55;
      } else {
        const targetFov = 53 + (journeyPhysics.speed / 0.25) * 4.5;
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, delta * 2);
      }
      camera.updateProjectionMatrix();
    }
  });

  return (
    <group name="parallax-atmosphere">
      {/* Low-Poly Drifting Clouds (Instanced) */}
      <instancedMesh
        ref={cloudsRef}
        args={[undefined, undefined, activeCloudCount]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#F8FAFC"
          roughness={0.9}
          transparent
          opacity={0.85}
          flatShading
        />
      </instancedMesh>
    </group>
  );
}
