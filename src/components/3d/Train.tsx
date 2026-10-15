'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useJourneyStore } from '@/store/journeyStore';
import { journeyPhysics } from '@/store/journeyPhysics';
import { mainTrackCurve, branchTrackCurve } from './trackCurves';

export function Train() {
  const groupRef = useRef<THREE.Group>(null);
  const disruptionType = useJourneyStore((s) => s.disruptionType);
  const activeBranch = useJourneyStore((s) => s.activeBranch);

  useFrame((_, delta) => {
    // Read from and write to mutable journeyPhysics (ZERO React re-renders!)
    const currentSpeed = THREE.MathUtils.lerp(
      journeyPhysics.speed,
      journeyPhysics.targetSpeed,
      delta * 2
    );
    journeyPhysics.speed = currentSpeed;

    // Advance progress along track
    journeyPhysics.progress = (journeyPhysics.progress + currentSpeed * 0.05 * delta) % 1;

    if (!groupRef.current) return;

    // Pick active curve
    const isBranching =
      activeBranch === 'branch' &&
      journeyPhysics.progress > 0.45 &&
      journeyPhysics.progress < 0.95;
    const curve = isBranching ? branchTrackCurve : mainTrackCurve;

    // Arc-length parameterization using getPointAt
    const pt = curve.getPointAt(journeyPhysics.progress);
    const tangent = curve.getTangentAt(journeyPhysics.progress).normalize();

    groupRef.current.position.set(pt.x, pt.y + 0.45, pt.z);

    const up = new THREE.Vector3(0, 1, 0);
    const rotMatrix = new THREE.Matrix4().lookAt(
      new THREE.Vector3(0, 0, 0),
      tangent,
      up
    );
    groupRef.current.quaternion.setFromRotationMatrix(rotMatrix);
  });

  const isBraking = disruptionType === 'delay' || disruptionType === 'cancellation';

  return (
    <group ref={groupRef} name="sahayak-express">
      {/* Indian Railways WAP-7 / Vande Bharat Styled Locomotive */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[1.9, 1.8, 5.2]} />
        <meshStandardMaterial color="#B91C1C" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Aerodynamic Cab Nose Wedge */}
      <mesh position={[0, 0.65, 2.9]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[1.85, 1.3, 1.2]} />
        <meshStandardMaterial color="#DC2626" roughness={0.4} />
      </mesh>

      {/* Cab Windshield Glass */}
      <mesh position={[0, 1.1, 2.7]}>
        <boxGeometry args={[1.6, 0.6, 0.2]} />
        <meshStandardMaterial color="#38BDF8" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Headlight beam */}
      <spotLight
        position={[0, 0.8, 3.2]}
        target-position={[0, 0, 15]}
        color="#FEF08A"
        intensity={3.5}
        distance={45}
        angle={0.45}
        penumbra={0.6}
      />
      <mesh position={[0, 0.8, 3.2]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshBasicMaterial color="#FEF08A" />
      </mesh>

      {/* Roof Pantograph */}
      <mesh position={[0, 1.95, -1.2]}>
        <boxGeometry args={[0.9, 0.3, 1.2]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>

      {/* Rear Brake Light glow when stopping */}
      <mesh position={[0, 0.8, -2.65]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial
          color={isBraking ? '#D55E00' : '#7F1D1D'}
          emissive={isBraking ? '#D55E00' : '#450A0A'}
          emissiveIntensity={isBraking ? 2.5 : 0.2}
        />
      </mesh>
    </group>
  );
}
