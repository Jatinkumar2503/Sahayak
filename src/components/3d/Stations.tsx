'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { STATIONS } from '@/store/journeyStore';

interface StationProps {
  nameEn: string;
  nameHi: string;
  code: string;
  position: [number, number, number];
}

function createStationSignboardTexture(nameEn: string, nameHi: string, code: string) {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Indian Railways Iconic Yellow Board Background
  ctx.fillStyle = '#FACC15';
  ctx.fillRect(0, 0, 512, 160);

  // Black Border
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 502, 150);

  // Station Names in Black
  ctx.fillStyle = '#0F172A';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Hindi Name with cross-platform Devanagari font fallbacks
  ctx.font = 'bold 36px "Mangal", "Nirmala UI", "Noto Sans Devanagari", "Segoe UI", Arial, sans-serif';
  ctx.fillText(nameHi, 256, 45);

  // English Name
  ctx.font = '900 42px "Segoe UI", Arial, sans-serif';
  ctx.fillText(nameEn.toUpperCase(), 256, 95);

  // Station Code Pill
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(190, 126, 132, 26);
  ctx.fillStyle = '#FDE047';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(`[ ${code} ]`, 256, 140);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

function StationBuilding({ nameEn, nameHi, code, position }: StationProps) {
  const signTexture = useMemo(
    () => createStationSignboardTexture(nameEn, nameHi, code),
    [nameEn, nameHi, code]
  );

  return (
    <group position={position}>
      {/* Station Platform Slab (Left of track) */}
      <mesh position={[-4.5, 0.45, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.2, 0.8, 42]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.8} />
      </mesh>

      {/* Yellow Safety Line on Platform Edge */}
      <mesh position={[-2.45, 0.86, 0]} receiveShadow>
        <boxGeometry args={[0.2, 0.02, 42]} />
        <meshStandardMaterial color="#EAB308" roughness={0.5} />
      </mesh>

      {/* Platform Roof / Shed Pillars */}
      {[-16, -8, 0, 8, 16].map((zOffset) => (
        <group key={zOffset} position={[-4.5, 0.85, zOffset]}>
          <mesh position={[0, 1.8, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 3.6, 6]} />
            <meshStandardMaterial color="#1E3A8A" metalness={0.6} />
          </mesh>
          <mesh position={[0, 3.6, 0]} castShadow>
            <boxGeometry args={[3.8, 0.15, 0.15]} />
            <meshStandardMaterial color="#1E3A8A" />
          </mesh>
        </group>
      ))}

      {/* Corrugated Shed Roof Canopy */}
      <mesh position={[-4.5, 4.5, 0]} rotation={[0, 0, 0.05]} castShadow>
        <boxGeometry args={[4.4, 0.12, 38]} />
        <meshStandardMaterial color="#1E3A8A" roughness={0.6} />
      </mesh>

      {/* Station Master Office / Brick Structure */}
      <mesh position={[-7.5, 1.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.0, 3.2, 16]} />
        <meshStandardMaterial color="#EA580C" roughness={0.85} flatShading />
      </mesh>

      {/* Station Yellow Signboard (North End) */}
      <group position={[-4.5, 0.85, 17]}>
        <mesh position={[-1.1, 1.3, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 2.6]} />
          <meshStandardMaterial color="#1F2937" />
        </mesh>
        <mesh position={[1.1, 1.3, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 2.6]} />
          <meshStandardMaterial color="#1F2937" />
        </mesh>
        {/* Double-sided Yellow Board Mesh */}
        <mesh position={[0, 2.2, 0]} castShadow>
          <boxGeometry args={[3.0, 0.95, 0.08]} />
          {signTexture ? (
            <meshStandardMaterial map={signTexture} roughness={0.4} />
          ) : (
            <meshStandardMaterial color="#FACC15" roughness={0.4} />
          )}
        </mesh>
      </group>

      {/* Station Yellow Signboard (South End) */}
      <group position={[-4.5, 0.85, -17]}>
        <mesh position={[-1.1, 1.3, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 2.6]} />
          <meshStandardMaterial color="#1F2937" />
        </mesh>
        <mesh position={[1.1, 1.3, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 2.6]} />
          <meshStandardMaterial color="#1F2937" />
        </mesh>
        <mesh position={[0, 2.2, 0]} castShadow rotation={[0, Math.PI, 0]}>
          <boxGeometry args={[3.0, 0.95, 0.08]} />
          {signTexture ? (
            <meshStandardMaterial map={signTexture} roughness={0.4} />
          ) : (
            <meshStandardMaterial color="#FACC15" roughness={0.4} />
          )}
        </mesh>
      </group>
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
