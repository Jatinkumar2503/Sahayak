'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import { STATIONS } from '@/store/journeyStore';

interface StationProps {
  nameEn: string;
  nameHi: string;
  code: string;
  position: [number, number, number];
}

function StationBuilding({ nameEn, nameHi, code, position }: StationProps) {
  return (
    <group position={position}>
      {/* Station Platform Slab (Left of track) */}
      <mesh position={[-4.5, 0.45, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.2, 0.8, 38]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.8} />
      </mesh>

      {/* Yellow Safety Line on Platform Edge */}
      <mesh position={[-2.45, 0.86, 0]} receiveShadow>
        <boxGeometry args={[0.2, 0.02, 38]} />
        <meshStandardMaterial color="#EAB308" roughness={0.5} />
      </mesh>

      {/* Platform Roof / Shed Pillars */}
      {[-12, -4, 4, 12].map((zOffset) => (
        <group key={zOffset} position={[-4.5, 0.85, zOffset]}>
          {/* Pillar */}
          <mesh position={[0, 1.8, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 3.6, 6]} />
            <meshStandardMaterial color="#1E3A8A" metalness={0.6} />
          </mesh>
          {/* Roof Truss beam */}
          <mesh position={[0, 3.6, 0]} castShadow>
            <boxGeometry args={[3.8, 0.15, 0.15]} />
            <meshStandardMaterial color="#1E3A8A" />
          </mesh>
        </group>
      ))}

      {/* Corrugated Shed Roof Canopy */}
      <mesh position={[-4.5, 4.5, 0]} rotation={[0, 0, 0.05]} castShadow>
        <boxGeometry args={[4.4, 0.12, 32]} />
        <meshStandardMaterial color="#1E3A8A" roughness={0.6} />
      </mesh>

      {/* Small Station Master Office / Brick Structure */}
      <mesh position={[-7.5, 1.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.0, 3.2, 14]} />
        <meshStandardMaterial color="#EA580C" roughness={0.85} flatShading />
      </mesh>

      {/* Station Yellow Signboard Posts */}
      <group position={[-4.5, 0.85, 16]}>
        <mesh position={[-0.9, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 2.4]} />
          <meshStandardMaterial color="#1F2937" />
        </mesh>
        <mesh position={[0.9, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 2.4]} />
          <meshStandardMaterial color="#1F2937" />
        </mesh>
        {/* Yellow Board */}
        <mesh position={[0, 2.2, 0]} castShadow>
          <boxGeometry args={[2.4, 0.8, 0.08]} />
          <meshStandardMaterial color="#FACC15" roughness={0.4} />
        </mesh>
      </group>

      {/* Floating 3D Station Label Overlay (Visible from camera) */}
      <Html
        position={[-4.5, 4.2, 0]}
        center
        distanceFactor={45}
        className="pointer-events-none select-none"
      >
        <div className="flex flex-col items-center bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded border-2 border-slate-900 shadow-xl whitespace-nowrap min-w-[130px] text-center">
          <span className="text-sm font-extrabold tracking-wider leading-none">
            {nameEn.toUpperCase()}
          </span>
          <span className="text-xs font-semibold leading-tight text-slate-900/90">
            {nameHi}
          </span>
          <span className="text-[10px] bg-slate-900 text-amber-300 px-1.5 rounded-sm mt-0.5 tracking-widest font-mono">
            [{code}]
          </span>
        </div>
      </Html>
    </group>
  );
}

export function Stations() {
  return (
    <group name="railway-stations">
      {STATIONS.map((station) => (
        <StationBuilding
          key={station.id}
          nameEn={station.nameEn}
          nameHi={station.nameHi}
          code={station.code}
          position={station.position}
        />
      ))}
    </group>
  );
}
