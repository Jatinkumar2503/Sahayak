'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { journeyPhysics } from '@/store/journeyPhysics';
import { useJourneyStore } from '@/store/journeyStore';

export function RenderTelemetry() {
  const { gl } = useThree();
  const shadowTier = useJourneyStore((s) => s.shadowTier);
  const setShadowTier = useJourneyStore((s) => s.setShadowTier);

  let fpsSampleTime = 0;
  let fpsFrames = 0;
  let sustainedHighFpsDuration = 0;

  useFrame((_, delta) => {
    // Collect Three.js renderer stats directly from WebGLRenderer info
    journeyPhysics.renderInfo.calls = gl.info.render.calls;
    journeyPhysics.renderInfo.triangles = gl.info.render.triangles;

    // Headroom detection for auto-tier upgrade
    fpsSampleTime += delta;
    fpsFrames++;

    if (fpsSampleTime >= 0.5) {
      const instantFps = Math.round(fpsFrames / fpsSampleTime);
      fpsSampleTime = 0;
      fpsFrames = 0;

      if (instantFps >= 58) {
        sustainedHighFpsDuration += 0.5;
        // If sustained high FPS on real GPU and tier is auto, can elevate to dynamic
        if (sustainedHighFpsDuration >= 4.0 && shadowTier === 'auto') {
          journeyPhysics.shadowQuality = 'dynamic';
          setShadowTier('dynamic');
        }
      } else {
        sustainedHighFpsDuration = 0;
      }
    }
  });

  return null;
}
