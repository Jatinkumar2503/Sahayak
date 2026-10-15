'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useJourneyStore } from '@/store/journeyStore';
import { tokens } from '@/styles/tokens';

const VERTEX_SHADER = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3 topColor;
  uniform vec3 bottomColor;
  uniform float offset;
  uniform float exponent;
  varying vec3 vWorldPosition;

  void main() {
    float h = normalize(vWorldPosition + offset).y;
    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
  }
`;

export function SkyDome() {
  const timeOfDay = useJourneyStore((s) => s.timeOfDay);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const env = tokens.colors.environment[timeOfDay];
  const targetTop = useMemo(() => new THREE.Color(env.skyTop), [env.skyTop]);
  const targetBottom = useMemo(() => new THREE.Color(env.skyBottom), [env.skyBottom]);

  const uniforms = useMemo(
    () => ({
      topColor: { value: new THREE.Color(env.skyTop) },
      bottomColor: { value: new THREE.Color(env.skyBottom) },
      offset: { value: 30 },
      exponent: { value: 0.6 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((_, delta) => {
    if (materialRef.current) {
      const lerpFactor = Math.min(delta * 2.5, 1);
      materialRef.current.uniforms.topColor.value.lerp(targetTop, lerpFactor);
      materialRef.current.uniforms.bottomColor.value.lerp(targetBottom, lerpFactor);
    }
  });

  return (
    <mesh position={[0, 0, -200]}>
      <sphereGeometry args={[350, 32, 20]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
