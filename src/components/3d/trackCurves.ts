import * as THREE from 'three';

// Control points for the Northern Indian railway corridor (Delhi -> Panipat -> Ambala)
export const MAIN_CORRIDOR_POINTS: THREE.Vector3[] = [
  new THREE.Vector3(0, 0, 80),        // Approach to Delhi
  new THREE.Vector3(0, 0, 40),        // Delhi Station Platform
  new THREE.Vector3(4, 0.2, -30),     // Gentle curve out of Delhi
  new THREE.Vector3(18, 0.6, -110),   // Haryana countryside bend
  new THREE.Vector3(10, 0.4, -180),   // Approaching Panipat
  new THREE.Vector3(0, 0, -220),      // Panipat Junction Platform
  new THREE.Vector3(-14, 0.8, -270),  // Canal crossing curve
  new THREE.Vector3(-22, 1.2, -340),  // Approaching GT Road stretch
  new THREE.Vector3(-10, 0.5, -390),  // Approaching Ambala
  new THREE.Vector3(0, 0, -430),      // Ambala Cantt Platform
  new THREE.Vector3(0, 0, -480),      // Beyond Ambala
];

// Alternate branch track for rerouting (diverges after Panipat around Z=-220)
export const BRANCH_CORRIDOR_POINTS: THREE.Vector3[] = [
  new THREE.Vector3(0, 0, -220),      // Panipat switch point
  new THREE.Vector3(12, 0.5, -260),   // Branch turnout
  new THREE.Vector3(26, 1.0, -320),   // Kurukshetra bypass chord line
  new THREE.Vector3(16, 0.8, -380),   // Re-aligning towards Ambala Outer
  new THREE.Vector3(0, 0, -430),      // Re-converging at Ambala
];

// Main continuous track curve
export const mainTrackCurve = new THREE.CatmullRomCurve3(
  MAIN_CORRIDOR_POINTS,
  false,
  'centripetal',
  0.5
);

// Branch track curve
export const branchTrackCurve = new THREE.CatmullRomCurve3(
  BRANCH_CORRIDOR_POINTS,
  false,
  'centripetal',
  0.5
);

/**
 * Calculates a point on the left or right rail offset from the center curve
 */
export function getRailCurves(centerCurve: THREE.CatmullRomCurve3, gaugeWidth = 1.676) {
  const halfGauge = 0.7;
  const numSamples = 200;
  const leftPoints: THREE.Vector3[] = [];
  const rightPoints: THREE.Vector3[] = [];

  for (let i = 0; i <= numSamples; i++) {
    const t = i / numSamples;
    const pt = centerCurve.getPointAt(t);
    const tangent = centerCurve.getTangentAt(t).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();

    leftPoints.push(new THREE.Vector3().copy(pt).addScaledVector(normal, -halfGauge).add(new THREE.Vector3(0, 0.22, 0)));
    rightPoints.push(new THREE.Vector3().copy(pt).addScaledVector(normal, halfGauge).add(new THREE.Vector3(0, 0.22, 0)));
  }

  return {
    leftCurve: new THREE.CatmullRomCurve3(leftPoints),
    rightCurve: new THREE.CatmullRomCurve3(rightPoints),
  };
}

/**
 * Continuous Route Blending Abstraction
 * Smoothly interpolates from main line to branch line over a fixed arc-length window.
 * Ensures every individual coach samples identical continuous path coordinates with zero corner cutting.
 */
export function getBlendedRoutePoint(progress: number, branch: 'main' | 'branch') {
  if (branch === 'main' || progress < 0.48 || progress > 0.96) {
    return {
      pos: mainTrackCurve.getPointAt(progress),
      tangent: mainTrackCurve.getTangentAt(progress).normalize(),
    };
  }

  // Progress along the branch curve segment (mapped from 0.48 -> 0.95)
  const branchT = (progress - 0.48) / (0.95 - 0.48);
  const clampedBranchT = Math.max(0, Math.min(1, branchT));

  // Turnout entry transition zone (between progress 0.48 and 0.53)
  if (progress < 0.53) {
    const blendWeight = THREE.MathUtils.smoothstep(progress, 0.48, 0.53);
    const mainPos = mainTrackCurve.getPointAt(progress);
    const branchPos = branchTrackCurve.getPointAt(clampedBranchT);
    const pos = new THREE.Vector3().lerpVectors(mainPos, branchPos, blendWeight);

    const mainTan = mainTrackCurve.getTangentAt(progress).normalize();
    const branchTan = branchTrackCurve.getTangentAt(clampedBranchT).normalize();
    const tangent = new THREE.Vector3().lerpVectors(mainTan, branchTan, blendWeight).normalize();

    return { pos, tangent };
  }

  // Turnout exit transition zone (between progress 0.90 and 0.95)
  if (progress > 0.90) {
    const blendWeight = THREE.MathUtils.smoothstep(progress, 0.90, 0.95);
    const branchPos = branchTrackCurve.getPointAt(clampedBranchT);
    const mainPos = mainTrackCurve.getPointAt(progress);
    const pos = new THREE.Vector3().lerpVectors(branchPos, mainPos, blendWeight);

    const branchTan = branchTrackCurve.getTangentAt(clampedBranchT).normalize();
    const mainTan = mainTrackCurve.getTangentAt(progress).normalize();
    const tangent = new THREE.Vector3().lerpVectors(branchTan, mainTan, blendWeight).normalize();

    return { pos, tangent };
  }

  // Fully aligned on bypass branch track
  return {
    pos: branchTrackCurve.getPointAt(clampedBranchT),
    tangent: branchTrackCurve.getTangentAt(clampedBranchT).normalize(),
  };
}
