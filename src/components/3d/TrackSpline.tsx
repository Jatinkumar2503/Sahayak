'use client';

import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { mainTrackCurve, branchTrackCurve, getRailCurves } from './trackCurves';
import { useJourneyStore } from '@/store/journeyStore';

const SLEEPER_SPACING = 0.85; // Distance between concrete sleepers

export function TrackSpline() {
  const activeBranch = useJourneyStore((s) => s.activeBranch);
  const disruptionType = useJourneyStore((s) => s.disruptionType);
  const sleepersRef = useRef<THREE.InstancedMesh>(null);
  const branchSleepersRef = useRef<THREE.InstancedMesh>(null);

  // Generate rail tubes for main track
  const { leftCurve: mainLeft, rightCurve: mainRight } = useMemo(
    () => getRailCurves(mainTrackCurve),
    []
  );

  const mainLeftRailGeo = useMemo(
    () => new THREE.TubeGeometry(mainLeft, 180, 0.05, 4, false),
    [mainLeft]
  );
  const mainRightRailGeo = useMemo(
    () => new THREE.TubeGeometry(mainRight, 180, 0.05, 4, false),
    [mainRight]
  );

  // Generate rail tubes for branch track
  const { leftCurve: branchLeft, rightCurve: branchRight } = useMemo(
    () => getRailCurves(branchTrackCurve),
    []
  );

  const branchLeftRailGeo = useMemo(
    () => new THREE.TubeGeometry(branchLeft, 120, 0.05, 4, false),
    [branchLeft]
  );
  const branchRightRailGeo = useMemo(
    () => new THREE.TubeGeometry(branchRight, 120, 0.05, 4, false),
    [branchRight]
  );

  // Main track ballast ribbon
  const mainBallastGeo = useMemo(() => {
    const curve = mainTrackCurve;
    const length = curve.getLength();
    const steps = 300;
    const width = 2.8;

    const positions: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const pt = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const normal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

      const leftPt = new THREE.Vector3().copy(pt).addScaledVector(normal, -width / 2);
      const rightPt = new THREE.Vector3().copy(pt).addScaledVector(normal, width / 2);

      positions.push(leftPt.x, leftPt.y + 0.05, leftPt.z);
      positions.push(rightPt.x, rightPt.y + 0.05, rightPt.z);

      if (i < steps) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Compute number of sleepers along main track
  const sleeperCount = useMemo(() => {
    return Math.floor(mainTrackCurve.getLength() / SLEEPER_SPACING);
  }, []);

  // Compute number of sleepers along branch track
  const branchSleeperCount = useMemo(() => {
    return Math.floor(branchTrackCurve.getLength() / SLEEPER_SPACING);
  }, []);

  // Position instanced sleepers for main track
  useLayoutEffect(() => {
    if (!sleepersRef.current) return;
    const dummy = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i < sleeperCount; i++) {
      const t = i / sleeperCount;
      const pt = mainTrackCurve.getPointAt(t);
      const tangent = mainTrackCurve.getTangentAt(t).normalize();

      dummy.position.set(pt.x, pt.y + 0.1, pt.z);
      const rotMatrix = new THREE.Matrix4().lookAt(
        new THREE.Vector3(0, 0, 0),
        tangent,
        up
      );
      dummy.quaternion.setFromRotationMatrix(rotMatrix);
      dummy.updateMatrix();

      sleepersRef.current.setMatrixAt(i, dummy.matrix);
    }
    sleepersRef.current.instanceMatrix.needsUpdate = true;
  }, [sleeperCount]);

  // Position instanced sleepers for branch track
  useLayoutEffect(() => {
    if (!branchSleepersRef.current) return;
    const dummy = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i < branchSleeperCount; i++) {
      const t = i / branchSleeperCount;
      const pt = branchTrackCurve.getPointAt(t);
      const tangent = branchTrackCurve.getTangentAt(t).normalize();

      dummy.position.set(pt.x, pt.y + 0.1, pt.z);
      const rotMatrix = new THREE.Matrix4().lookAt(
        new THREE.Vector3(0, 0, 0),
        tangent,
        up
      );
      dummy.quaternion.setFromRotationMatrix(rotMatrix);
      dummy.updateMatrix();

      branchSleepersRef.current.setMatrixAt(i, dummy.matrix);
    }
    branchSleepersRef.current.instanceMatrix.needsUpdate = true;
  }, [branchSleeperCount]);

  const isRerouteActive = activeBranch === 'branch' || disruptionType === 'missed_connection' || disruptionType === 'platform_change';

  return (
    <group name="track-system">
      {/* Ballast Gravel Bed */}
      <mesh geometry={mainBallastGeo} receiveShadow>
        <meshStandardMaterial color="#475569" roughness={0.9} flatShading />
      </mesh>

      {/* Main Track Instanced Sleepers (Indian Railways Concrete PSC Sleepers) */}
      <instancedMesh
        ref={sleepersRef}
        args={[undefined, undefined, sleeperCount]}
        receiveShadow
      >
        <boxGeometry args={[2.0, 0.12, 0.28]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.8} />
      </instancedMesh>

      {/* Main Steel Rails */}
      <mesh geometry={mainLeftRailGeo} receiveShadow>
        <meshStandardMaterial
          color="#E2E8F0"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>
      <mesh geometry={mainRightRailGeo} receiveShadow>
        <meshStandardMaterial
          color="#E2E8F0"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>

      {/* Branch Track Sleepers */}
      <instancedMesh
        ref={branchSleepersRef}
        args={[undefined, undefined, branchSleeperCount]}
        receiveShadow
      >
        <boxGeometry args={[2.0, 0.12, 0.28]} />
        <meshStandardMaterial
          color={isRerouteActive ? '#38BDF8' : '#64748B'}
          roughness={0.8}
        />
      </instancedMesh>

      {/* Branch Steel Rails with Reroute Highlight glow */}
      <mesh geometry={branchLeftRailGeo} castShadow receiveShadow>
        <meshStandardMaterial
          color={isRerouteActive ? '#38BDF8' : '#94A3B8'}
          emissive={isRerouteActive ? '#0284C7' : '#000000'}
          emissiveIntensity={isRerouteActive ? 0.6 : 0}
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>
      <mesh geometry={branchRightRailGeo} castShadow receiveShadow>
        <meshStandardMaterial
          color={isRerouteActive ? '#38BDF8' : '#94A3B8'}
          emissive={isRerouteActive ? '#0284C7' : '#000000'}
          emissiveIntensity={isRerouteActive ? 0.6 : 0}
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}
