'use client';

import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useJourneyStore } from '@/store/journeyStore';
import { tokens } from '@/styles/tokens';

const TREE_COUNT = 240;
const POLE_COUNT = 50;

export function LowPolyTerrain() {
  const timeOfDay = useJourneyStore((s) => s.timeOfDay);
  const treeCanopyRef = useRef<THREE.InstancedMesh>(null);
  const treeTrunkRef = useRef<THREE.InstancedMesh>(null);
  const poleRef = useRef<THREE.InstancedMesh>(null);

  const env = tokens.colors.environment[timeOfDay];

  // Procedural low-poly terrain mesh with flat corridor along center
  const terrainGeo = useMemo(() => {
    const width = 180;
    const depth = 620;
    const segX = 36;
    const segZ = 64;
    const geo = new THREE.PlaneGeometry(width, depth, segX, segZ);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Keep corridor around track (x between -12 and 12) flat
      const distFromCenter = Math.abs(x);
      const flatZone = THREE.MathUtils.smoothstep(distFromCenter, 10, 50);

      // Gentle rolling hills on sides
      const hillNoise =
        Math.sin(x * 0.05 + 1.2) * 3.5 +
        Math.cos(z * 0.03 + 0.4) * 4.0 +
        Math.sin((x + z) * 0.02) * 2.5;

      pos.setY(i, hillNoise * flatZone - 0.2);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  // Compute instanced tree positions (avoiding track center)
  const treeTransforms = useMemo(() => {
    const list: { pos: THREE.Vector3; scale: number; rot: number }[] = [];
    const rnd = (seed: number) => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    let seed = 42;
    for (let i = 0; i < TREE_COUNT; i++) {
      // Pick side of track (left or right)
      const side = rnd(seed++) > 0.5 ? 1 : -1;
      const x = side * (14 + rnd(seed++) * 65);
      const z = 60 - rnd(seed++) * 540;
      const scale = 0.7 + rnd(seed++) * 0.6;
      const rot = rnd(seed++) * Math.PI * 2;

      // Approximate terrain height at (x, z)
      const dist = Math.abs(x);
      const flatZone = THREE.MathUtils.smoothstep(dist, 10, 50);
      const y =
        (Math.sin(x * 0.05 + 1.2) * 3.5 +
          Math.cos(z * 0.03 + 0.4) * 4.0 +
          Math.sin((x + z) * 0.02) * 2.5) *
          flatZone -
        0.2;

      list.push({
        pos: new THREE.Vector3(x, y, z),
        scale,
        rot,
      });
    }
    return list;
  }, []);

  // Compute catenary electric poles (OHE masts) along track
  const poleTransforms = useMemo(() => {
    const list: { pos: THREE.Vector3; rotY: number }[] = [];
    for (let i = 0; i < POLE_COUNT; i++) {
      const z = 50 - i * 11;
      const x = -2.6; // Left side of track
      list.push({
        pos: new THREE.Vector3(x, 0, z),
        rotY: 0,
      });
    }
    return list;
  }, []);

  // Apply tree matrices
  useLayoutEffect(() => {
    if (!treeCanopyRef.current || !treeTrunkRef.current) return;
    const dummy = new THREE.Object3D();

    treeTransforms.forEach((t, i) => {
      // Trunk
      dummy.position.set(t.pos.x, t.pos.y + 0.8 * t.scale, t.pos.z);
      dummy.rotation.set(0, t.rot, 0);
      dummy.scale.set(t.scale, t.scale, t.scale);
      dummy.updateMatrix();
      treeTrunkRef.current?.setMatrixAt(i, dummy.matrix);

      // Canopy
      dummy.position.set(t.pos.x, t.pos.y + 2.2 * t.scale, t.pos.z);
      dummy.rotation.set(0, t.rot, 0);
      dummy.scale.set(t.scale, t.scale, t.scale);
      dummy.updateMatrix();
      treeCanopyRef.current?.setMatrixAt(i, dummy.matrix);
    });

    treeTrunkRef.current.instanceMatrix.needsUpdate = true;
    treeCanopyRef.current.instanceMatrix.needsUpdate = true;
  }, [treeTransforms]);

  // Apply pole matrices
  useLayoutEffect(() => {
    if (!poleRef.current) return;
    const dummy = new THREE.Object3D();

    poleTransforms.forEach((p, i) => {
      dummy.position.set(p.pos.x, p.pos.y + 2.5, p.pos.z);
      dummy.rotation.set(0, p.rotY, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      poleRef.current?.setMatrixAt(i, dummy.matrix);
    });

    poleRef.current.instanceMatrix.needsUpdate = true;
  }, [poleTransforms]);

  return (
    <group name="terrain-and-environment">
      {/* Low-Poly Rolling Ground */}
      <mesh geometry={terrainGeo} receiveShadow position={[0, 0, -190]}>
        <meshStandardMaterial
          color={env.terrainGrass}
          roughness={0.88}
          flatShading
        />
      </mesh>

      {/* Decorative Agricultural Mustard / Crop Field Patches */}
      <mesh
        position={[-35, 0.08, -120]}
        rotation={[-Math.PI / 2, 0, 0.15]}
        receiveShadow
      >
        <planeGeometry args={[35, 70]} />
        <meshStandardMaterial color="#EAB308" roughness={0.9} />
      </mesh>
      <mesh
        position={[38, 0.08, -260]}
        rotation={[-Math.PI / 2, 0, -0.1]}
        receiveShadow
      >
        <planeGeometry args={[40, 85]} />
        <meshStandardMaterial color="#84CC16" roughness={0.9} />
      </mesh>
      <mesh
        position={[-42, 0.08, -350]}
        rotation={[-Math.PI / 2, 0, 0.05]}
        receiveShadow
      >
        <planeGeometry args={[45, 90]} />
        <meshStandardMaterial color="#CA8A04" roughness={0.9} />
      </mesh>

      {/* Low-Poly Tree Canopies (Instanced) */}
      <instancedMesh
        ref={treeCanopyRef}
        args={[undefined, undefined, TREE_COUNT]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[1.4, 2.8, 5]} />
        <meshStandardMaterial color="#15803D" roughness={0.7} flatShading />
      </instancedMesh>

      {/* Tree Trunks (Instanced) */}
      <instancedMesh
        ref={treeTrunkRef}
        args={[undefined, undefined, TREE_COUNT]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.2, 0.3, 1.6, 5]} />
        <meshStandardMaterial color="#78350F" roughness={0.9} />
      </instancedMesh>

      {/* Railway Catenary OHE Masts (Instanced) */}
      <instancedMesh
        ref={poleRef}
        args={[undefined, undefined, POLE_COUNT]}
        castShadow
      >
        <cylinderGeometry args={[0.08, 0.1, 5, 4]} />
        <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
      </instancedMesh>
    </group>
  );
}
