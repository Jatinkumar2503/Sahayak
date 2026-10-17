'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useJourneyStore } from '@/store/journeyStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SignalHeadProps {
  position?: [number, number, number];
  signalId?: string;
}

export function SignalHeads({ position = [2.8, 0, -165], signalId = 'sig-104' }: SignalHeadProps) {
  const status = useJourneyStore((s) => s.status);
  const disruptionType = useJourneyStore((s) => s.disruptionType);
  const activeSignalId = useJourneyStore((s) => s.activeSignalId);
  const isReducedMotion = useReducedMotion();

  const redLampRef = useRef<THREE.MeshStandardMaterial>(null);
  const yellowLampRef = useRef<THREE.MeshStandardMaterial>(null);
  const greenLampRef = useRef<THREE.MeshStandardMaterial>(null);

  // Red signal when delayed, cancelled, or holding for the active signal ahead
  const isThisSignalActive = !signalId || signalId === activeSignalId || (!activeSignalId && signalId === 'sig-104');
  const isRed = (disruptionType === 'delay' || disruptionType === 'cancellation') && isThisSignalActive;
  const isYellow = (disruptionType === 'missed_connection' || disruptionType === 'platform_change') && isThisSignalActive;
  const isGreen = !isRed && !isYellow;

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Pulse rate: 1.0 Hz (1 cycle per second), well below the 2 Hz/3 Hz photosensitive threshold
    const pulse = isReducedMotion ? 1.0 : 0.65 + 0.35 * Math.sin(time * Math.PI * 2);

    if (redLampRef.current) {
      redLampRef.current.emissiveIntensity = isRed ? pulse * 2.5 : 0.05;
    }
    if (yellowLampRef.current) {
      yellowLampRef.current.emissiveIntensity = isYellow ? pulse * 2.2 : 0.05;
    }
    if (greenLampRef.current) {
      greenLampRef.current.emissiveIntensity = isGreen ? 1.8 : 0.05;
    }
  });

  return (
    <group position={position} name="railway-signal-mast">
      {/* Concrete Foundation Base */}
      <mesh position={[0, 0.3, 0]} receiveShadow>
        <boxGeometry args={[0.8, 0.6, 0.8]} />
        <meshStandardMaterial color="#64748B" roughness={0.9} />
      </mesh>

      {/* Tall Signal Post Mast */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 5.8, 6]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Signal Head Black Backplate */}
      <mesh position={[0, 5.2, 0.1]} castShadow>
        <boxGeometry args={[0.7, 1.8, 0.3]} />
        <meshStandardMaterial color="#0F172A" roughness={0.7} />
      </mesh>

      {/* Black Circular Sun Hoods */}
      {[0.5, 0, -0.5].map((yOffset) => (
        <mesh key={yOffset} position={[0, 5.2 + yOffset, 0.28]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.14, 8, 1, true]} />
          <meshStandardMaterial color="#0F172A" side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* RED LAMP (Top) */}
      <mesh position={[0, 5.7, 0.26]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial
          ref={redLampRef}
          color="#D55E00" // Okabe-Ito Vermilion / Red
          emissive="#D55E00"
          emissiveIntensity={isRed ? 2.5 : 0.05}
          roughness={0.2}
        />
      </mesh>

      {/* YELLOW LAMP (Middle) */}
      <mesh position={[0, 5.2, 0.26]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial
          ref={yellowLampRef}
          color="#E69F00" // Okabe-Ito Amber
          emissive="#E69F00"
          emissiveIntensity={isYellow ? 2.2 : 0.05}
          roughness={0.2}
        />
      </mesh>

      {/* GREEN LAMP (Bottom) */}
      <mesh position={[0, 4.7, 0.26]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial
          ref={greenLampRef}
          color="#009E73" // Okabe-Ito Bluish Green
          emissive="#009E73"
          emissiveIntensity={isGreen ? 1.8 : 0.05}
          roughness={0.2}
        />
      </mesh>

      {/* Number Plate Identification "104" */}
      <mesh position={[0, 3.8, 0.12]}>
        <boxGeometry args={[0.4, 0.5, 0.04]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
      </mesh>
    </group>
  );
}
