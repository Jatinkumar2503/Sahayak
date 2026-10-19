'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useJourneyStore, STATIONS, SIGNALS, getNextSignalAhead } from '@/store/journeyStore';
import { journeyPhysics, COACH_COUNT, COACH_OFFSET_STEP } from '@/store/journeyPhysics';
import { mainTrackCurve, branchTrackCurve, getBlendedRoutePoint } from './trackCurves';

// Station stop threshold distances
const STATION_SLOW_ZONE = 0.045; // Starts decelerating
const STATION_STOP_ZONE = 0.008; // Dwells at station platform
const STATION_DWELL_SECONDS = 4.0; // Seconds to stop at platform

// Helper to create a soft radial gradient canvas texture for contact-blob shadows
function createBlobShadowTexture() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(64, 128, 10, 64, 128, 64);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

export function Train() {
  const status = useJourneyStore((s) => s.status);
  const disruptionType = useJourneyStore((s) => s.disruptionType);
  const activeSignalId = useJourneyStore((s) => s.activeSignalId);
  const activeBranch = useJourneyStore((s) => s.activeBranch);
  const shadowTier = useJourneyStore((s) => s.shadowTier);

  // References to the 5 individual vehicle groups (Engine + 4 Coaches)
  const coachRefs = [
    useRef<THREE.Group>(null),
    useRef<THREE.Group>(null),
    useRef<THREE.Group>(null),
    useRef<THREE.Group>(null),
    useRef<THREE.Group>(null),
  ];

  // Wheel pair meshes for spinning animation
  const wheelPairsRef = useRef<THREE.Group[]>([]);

  // Soft contact blob shadow texture
  const blobShadowTexture = useMemo(() => createBlobShadowTexture(), []);

  // Station dwell departure tracking (prevents infinite dwell loop)
  const departedStationIdRef = useRef<string | null>(null);
  const currentStationIdRef = useRef<string | null>(null);

  const isBraking = (disruptionType === 'delay' || disruptionType === 'cancellation') && status !== 'resolved';
  const showBlobShadow = shadowTier === 'blob';

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    let speedDuringFrame = journeyPhysics.speed;

    // Reset station departed flags when near corridor start
    if (journeyPhysics.progress < 0.1) {
      departedStationIdRef.current = null;
    }

    // 1. Station-Stop Sequence & S-Curve Speed Easing
    if (!journeyPhysics.scrollDriven) {
      let approachingStation = false;

      if (journeyPhysics.stationStopTimer > 0) {
        // Currently dwelling at station
        journeyPhysics.stationStopTimer -= delta;
        journeyPhysics.speed = 0;
        journeyPhysics.isStationStopped = true;
        journeyPhysics.doorsOpen = true;

        if (journeyPhysics.stationStopTimer <= 0) {
          // Depart station: accelerate back
          journeyPhysics.isStationStopped = false;
          journeyPhysics.doorsOpen = false;
          departedStationIdRef.current = currentStationIdRef.current;
          currentStationIdRef.current = null;
          if (journeyPhysics.speed <= 0.01) {
            journeyPhysics.speed = 0.05;
          }
        }
      } else {
        // Check if train is approaching any station platform
        for (const st of STATIONS) {
          // If taking the bypass chord line, bypass Panipat without stopping at main platform
          if (activeBranch === 'branch' && st.id === 'panipat') {
            continue;
          }

          // Once train passes the station, clear departed flag for future loops
          if (departedStationIdRef.current === st.id && journeyPhysics.progress > st.progress + 0.01) {
            departedStationIdRef.current = null;
          }

          // If recently departed from this station, do not re-trigger stop
          if (departedStationIdRef.current === st.id) {
            continue;
          }

          const dist = st.progress - journeyPhysics.progress;

          // Approaching station: smooth S-curve deceleration
          if (dist > 0 && dist < STATION_SLOW_ZONE) {
            approachingStation = true;
            if (dist < STATION_STOP_ZONE && !journeyPhysics.isStationStopped) {
              // Trigger station dwell
              journeyPhysics.stationStopTimer = STATION_DWELL_SECONDS;
              journeyPhysics.isStationStopped = true;
              journeyPhysics.doorsOpen = true;
              currentStationIdRef.current = st.id;
            } else {
              // Smooth deceleration into platform
              const tDecel = dist / STATION_SLOW_ZONE;
              const easedSpeed = Math.max(0.04, journeyPhysics.targetSpeed * Math.sin((tDecel * Math.PI) / 2));
              journeyPhysics.speed = THREE.MathUtils.lerp(journeyPhysics.speed, easedSpeed, delta * 3);
            }
            break;
          }
        }

        // Constant Deceleration Braking Curve: v = v0 * sqrt(remaining / initial) with NO final clamp or snap
        if ((disruptionType === 'delay' || disruptionType === 'cancellation') && status !== 'resolved') {
          const CORRIDOR_CURVE_LENGTH = 568.74;
          const SIGNAL_STOP_MARGIN_UNITS = 4.5;
          const BRAKE_ZONE_DISTANCE = 40.0;
          const MARGIN_PROGRESS = SIGNAL_STOP_MARGIN_UNITS / CORRIDOR_CURVE_LENGTH;

          const activeSig =
            SIGNALS.find((s) => s.id === activeSignalId) ||
            getNextSignalAhead(journeyPhysics.progress);
          const stopProgress = (activeSig.progress - MARGIN_PROGRESS + 1) % 1;
          const distRemaining = (stopProgress - journeyPhysics.progress) * CORRIDOR_CURVE_LENGTH;

          const initialDist = journeyPhysics.initialBrakeDist ?? distRemaining;
          const v0 = journeyPhysics.initialBrakeSpeed || 0.25;

          if (distRemaining <= 0 || initialDist <= 0) {
            journeyPhysics.speed = 0;
            journeyPhysics.isBrakingPhase = true;
          } else if (distRemaining > BRAKE_ZONE_DISTANCE) {
            // Farther than 40 units ahead: keep train at cruise speed until reaching 40 units from stop mark
            journeyPhysics.speed = v0;
            journeyPhysics.isBrakingPhase = false;
          } else {
            // Within 40 units of stop mark: brake with sqrt curve
            if (!journeyPhysics.isBrakingPhase) {
              journeyPhysics.isBrakingPhase = true;
              journeyPhysics.brakingStartTime = time;
            }
            const brakeZone = Math.min(BRAKE_ZONE_DISTANCE, initialDist);
            const ratio = Math.max(0, Math.min(1, distRemaining / brakeZone));
            journeyPhysics.speed = v0 * Math.sqrt(ratio);
          }
        } else if (!approachingStation && journeyPhysics.stationStopTimer <= 0) {
          journeyPhysics.speed = THREE.MathUtils.lerp(
            journeyPhysics.speed,
            journeyPhysics.targetSpeed,
            delta * 2.2
          );
        }
      }

      const SPEED_TO_PROGRESS_FACTOR = 0.125;
      const speedDuringFrame = journeyPhysics.speed;
      const deltaProgress = Math.max(0, journeyPhysics.speed * SPEED_TO_PROGRESS_FACTOR * delta);
      let nextProgress = journeyPhysics.progress + deltaProgress;

      if ((disruptionType === 'delay' || disruptionType === 'cancellation') && status !== 'resolved') {
        const CORRIDOR_CURVE_LENGTH = 568.74;
        const SIGNAL_STOP_MARGIN_UNITS = 4.5;
        const MARGIN_PROGRESS = SIGNAL_STOP_MARGIN_UNITS / CORRIDOR_CURVE_LENGTH;
        const activeSig =
          SIGNALS.find((s) => s.id === activeSignalId) ||
          getNextSignalAhead(journeyPhysics.progress);
        const stopProgress = (activeSig.progress - MARGIN_PROGRESS + 1) % 1;

        if (nextProgress >= stopProgress && journeyPhysics.progress <= stopProgress) {
          nextProgress = stopProgress;
          journeyPhysics.speed = 0;
        }
      }

      // Seamless journey looping: When train completes run past Ambala (progress >= 0.98),
      // smoothly loop back to Delhi approach with head at 0.06 or more
      if (nextProgress >= 0.98) {
        const store = useJourneyStore.getState();
        const isReduced = store.reducedMotion;

        // Clear any active disruption on loop to guarantee clean consistent state
        if (store.disruptionType !== 'none' || store.status !== 'on-time') {
          store.setDisruptionType('none');
        }

        journeyPhysics.progress = 0.06;
        journeyPhysics.speed = 0.25;
        journeyPhysics.targetSpeed = 0.25;
        journeyPhysics.activeBranch = 'main';
        departedStationIdRef.current = null;
        currentStationIdRef.current = null;
        store.setProgress(0.06);
        store.setActiveBranch('main');
        store.setActiveSignalId('sig-102');

        if (!isReduced) {
          store.setIsLoopFading(true);
          setTimeout(() => {
            useJourneyStore.getState().setIsLoopFading(false);
          }, 600);
        }
      } else {
        journeyPhysics.progress = Math.max(journeyPhysics.progress, nextProgress);
        if (disruptionType === 'none') {
          const approachingSig = getNextSignalAhead(journeyPhysics.progress);
          if (useJourneyStore.getState().activeSignalId !== approachingSig.id) {
            useJourneyStore.getState().setActiveSignalId(approachingSig.id);
          }
        }
      }
    }

    // 3. Update Wheel Spin Angle
    journeyPhysics.wheelAngle = (journeyPhysics.wheelAngle + journeyPhysics.speed * delta * 28) % (Math.PI * 2);

    // 4. Position and Orient Each Vehicle using getBlendedRoutePoint (Arc-Length Parameterization)
    const up = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i < COACH_COUNT; i++) {
      const ref = coachRefs[i].current;
      if (!ref) continue;

      // Locomotive head is at i=0 (progress). Coach i is at head - i * COACH_OFFSET_STEP
      const coachProgress = (journeyPhysics.progress - i * COACH_OFFSET_STEP + 1) % 1;
      journeyPhysics.coachProgresses[i] = coachProgress;

      // Route abstraction: every coach follows the exact continuous blended curve path
      const { pos: pt, tangent } = getBlendedRoutePoint(coachProgress, activeBranch);

      ref.position.set(pt.x, pt.y + 0.45, pt.z);

      const rotMatrix = new THREE.Matrix4().lookAt(
        new THREE.Vector3(0, 0, 0),
        tangent,
        up
      );
      ref.quaternion.setFromRotationMatrix(rotMatrix);

      // Subtle organic coach sway (roll angle around track direction)
      const sway =
        Math.sin(time * 3.8 + i * 0.8) *
        0.016 *
        Math.min(1, journeyPhysics.speed / 0.15);
      ref.rotateZ(sway);
    }

    // 5. Per-Frame Logging for Automated Physics & Displacement Assertion
    const CORRIDOR_CURVE_LENGTH = 568.74;
    const currentP = journeyPhysics.progress;
    const prevP = journeyPhysics.prevFrameProgress ?? currentP;
    const dispUnits = Math.abs(currentP - prevP) * CORRIDOR_CURVE_LENGTH;
    journeyPhysics.prevFrameProgress = currentP;

    if (journeyPhysics.isLoggingFrames && delta > 0) {
      const SPEED_TO_PROGRESS_FACTOR = 0.125;
      const effectiveSpeed = Math.max(journeyPhysics.speed, speedDuringFrame);
      journeyPhysics.frameLogs.push({
        dt: delta,
        progress: currentP,
        displacementUnits: dispUnits,
        speedUnitsPerSec: effectiveSpeed * SPEED_TO_PROGRESS_FACTOR * CORRIDOR_CURVE_LENGTH,
        speed: effectiveSpeed,
        coachProgresses: [...journeyPhysics.coachProgresses],
      });
    }

    // Rotate spinning wheels
    wheelPairsRef.current.forEach((wheelGroup) => {
      if (wheelGroup) {
        wheelGroup.rotation.x = journeyPhysics.wheelAngle;
      }
    });
  });

  return (
    <group name="sahayak-train-consist">
      {/* 1. LEAD LOCOMOTIVE (WAP-7 / Vande Bharat Aerodynamic Lead) */}
      <group ref={coachRefs[0]} name="locomotive">
        {/* Contact-Blob Soft Shadow (High-performance tier) */}
        {showBlobShadow && blobShadowTexture && (
          <mesh position={[0, -0.4, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.6, 6.2]} />
            <meshBasicMaterial
              map={blobShadowTexture}
              transparent
              opacity={0.65}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Main Locomotive Body */}
        <mesh position={[0, 0.9, 0]} castShadow={!showBlobShadow}>
          <boxGeometry args={[1.9, 1.8, 5.0]} />
          <meshStandardMaterial color="#B91C1C" roughness={0.35} metalness={0.4} />
        </mesh>

        {/* Aerodynamic Cab Nose Wedge */}
        <mesh position={[0, 0.65, 2.8]} rotation={[0.3, 0, 0]} castShadow={!showBlobShadow}>
          <boxGeometry args={[1.85, 1.3, 1.2]} />
          <meshStandardMaterial color="#DC2626" roughness={0.35} />
        </mesh>

        {/* Front Cowcatcher / Pilot Shield */}
        <mesh position={[0, 0.15, 3.2]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[1.8, 0.35, 0.3]} />
          <meshStandardMaterial color="#0F172A" metalness={0.8} />
        </mesh>

        {/* Cab Windshield Glass */}
        <mesh position={[0, 1.1, 2.65]}>
          <boxGeometry args={[1.6, 0.6, 0.2]} />
          <meshStandardMaterial color="#38BDF8" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Indian Railways Golden Yellow Stripe */}
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[1.94, 0.16, 5.1]} />
          <meshStandardMaterial color="#E69F00" roughness={0.4} />
        </mesh>

        {/* Headlight beam */}
        <spotLight
          position={[0, 0.8, 3.2]}
          target-position={[0, 0, 15]}
          color="#FEF08A"
          intensity={3.2}
          distance={45}
          angle={0.45}
          penumbra={0.6}
        />
        <mesh position={[0, 0.8, 3.2]}>
          <sphereGeometry args={[0.15, 10, 10]} />
          <meshBasicMaterial color="#FEF08A" />
        </mesh>

        {/* Roof Pantograph Assembly */}
        <group position={[0, 1.95, -1.2]}>
          <mesh>
            <boxGeometry args={[0.9, 0.12, 1.2]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.4, 4]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.9} />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[1.4, 0.06, 0.1]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.9} />
          </mesh>
        </group>

        {/* Bogie Wheel Assemblies (Front & Rear) */}
        {[-1.6, 1.6].map((zPos, bIdx) => (
          <group key={zPos} position={[0, -0.05, zPos]}>
            {/* Bogie Frame */}
            <mesh position={[0, 0.1, 0]}>
              <boxGeometry args={[1.8, 0.2, 1.6]} />
              <meshStandardMaterial color="#1E293B" metalness={0.8} />
            </mesh>
            {/* Left & Right Wheel Pairs */}
            <group
              ref={(el) => {
                if (el) wheelPairsRef.current[bIdx] = el;
              }}
            >
              {[-0.5, 0.5].map((wZ) => (
                <group key={wZ} position={[0, 0, wZ]}>
                  {/* Axle */}
                  <mesh rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.04, 0.04, 1.6, 6]} />
                    <meshStandardMaterial color="#64748B" metalness={0.9} />
                  </mesh>
                  {/* Left Wheel */}
                  <mesh position={[-0.72, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.32, 0.32, 0.08, 8]} />
                    <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.3} />
                  </mesh>
                  {/* Right Wheel */}
                  <mesh position={[0.72, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.32, 0.32, 0.08, 8]} />
                    <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.3} />
                  </mesh>
                </group>
              ))}
            </group>
          </group>
        ))}

        {/* Rear Coupler to Coach 1 */}
        <mesh position={[0, 0.2, -2.6]}>
          <boxGeometry args={[0.3, 0.25, 0.4]} />
          <meshStandardMaterial color="#0F172A" metalness={0.9} />
        </mesh>
      </group>

      {/* 2. PASSENGER COACHES (4 Coaches with Gangway Vestibules & Windows) */}
      {[1, 2, 3, 4].map((coachIdx) => (
        <group
          key={coachIdx}
          ref={coachRefs[coachIdx]}
          name={`coach-${coachIdx}`}
        >
          {/* Contact-Blob Soft Shadow */}
          {showBlobShadow && blobShadowTexture && (
            <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.5, 5.8]} />
              <meshBasicMaterial
                map={blobShadowTexture}
                transparent
                opacity={0.6}
                depthWrite={false}
              />
            </mesh>
          )}

          {/* Coach Body (Indian Railways Heritage Navy Blue) */}
          <mesh position={[0, 0.9, 0]} castShadow={!showBlobShadow}>
            <boxGeometry args={[1.85, 1.75, 4.8]} />
            <meshStandardMaterial color="#1E3A8A" roughness={0.4} metalness={0.3} />
          </mesh>

          {/* Golden Yellow Continuous Window Belt Stripe */}
          <mesh position={[0, 0.85, 0]}>
            <boxGeometry args={[1.88, 0.45, 4.82]} />
            <meshStandardMaterial color="#E69F00" roughness={0.4} />
          </mesh>

          {/* Passenger Tinted Glass Windows (Left & Right Sides) */}
          <mesh position={[-0.94, 0.95, 0]}>
            <boxGeometry args={[0.04, 0.4, 4.0]} />
            <meshStandardMaterial
              color="#0284C7"
              emissive="#0369A1"
              emissiveIntensity={0.25}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[0.94, 0.95, 0]}>
            <boxGeometry args={[0.04, 0.4, 4.0]} />
            <meshStandardMaterial
              color="#0284C7"
              emissive="#0369A1"
              emissiveIntensity={0.25}
              roughness={0.1}
            />
          </mesh>

          {/* Coach Roof Air Conditioning Pods */}
          <mesh position={[0, 1.84, 0]}>
            <boxGeometry args={[1.2, 0.15, 3.8]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.7} />
          </mesh>

          {/* Passenger Boarding Doors Glow (Interactive on Station Stops) */}
          <mesh position={[-0.94, 0.55, 1.8]}>
            <boxGeometry args={[0.05, 1.0, 0.6]} />
            <meshStandardMaterial
              color={journeyPhysics.doorsOpen ? '#009E73' : '#1E293B'}
              emissive={journeyPhysics.doorsOpen ? '#009E73' : '#000000'}
              emissiveIntensity={journeyPhysics.doorsOpen ? 1.2 : 0}
            />
          </mesh>

          {/* Front & Rear Flexible Accordion Vestibule Bellows */}
          <mesh position={[0, 0.85, 2.45]}>
            <boxGeometry args={[1.4, 1.5, 0.2]} />
            <meshStandardMaterial color="#1E293B" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.85, -2.45]}>
            <boxGeometry args={[1.4, 1.5, 0.2]} />
            <meshStandardMaterial color="#1E293B" roughness={0.9} />
          </mesh>

          {/* Coupler Hardware */}
          <mesh position={[0, 0.2, 2.55]}>
            <boxGeometry args={[0.25, 0.2, 0.25]} />
            <meshStandardMaterial color="#0F172A" metalness={0.9} />
          </mesh>
          <mesh position={[0, 0.2, -2.55]}>
            <boxGeometry args={[0.25, 0.2, 0.25]} />
            <meshStandardMaterial color="#0F172A" metalness={0.9} />
          </mesh>

          {/* Bogie Wheel Assemblies */}
          {[-1.5, 1.5].map((zPos, bIdx) => (
            <group key={zPos} position={[0, -0.05, zPos]}>
              <mesh position={[0, 0.1, 0]}>
                <boxGeometry args={[1.75, 0.18, 1.5]} />
                <meshStandardMaterial color="#1E293B" metalness={0.8} />
              </mesh>
              <group
                ref={(el) => {
                  if (el) wheelPairsRef.current[2 + (coachIdx - 1) * 2 + bIdx] = el;
                }}
              >
                {[-0.45, 0.45].map((wZ) => (
                  <group key={wZ} position={[0, 0, wZ]}>
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                      <cylinderGeometry args={[0.04, 0.04, 1.6, 6]} />
                      <meshStandardMaterial color="#64748B" metalness={0.9} />
                    </mesh>
                    <mesh position={[-0.72, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                      <cylinderGeometry args={[0.3, 0.3, 0.08, 8]} />
                      <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.3} />
                    </mesh>
                    <mesh position={[0.72, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                      <cylinderGeometry args={[0.3, 0.3, 0.08, 8]} />
                      <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.3} />
                    </mesh>
                  </group>
                ))}
              </group>
            </group>
          ))}

          {/* Tail Brake Lights on Final Coach */}
          {coachIdx === 4 && (
            <group position={[0, 0.8, -2.44]}>
              <mesh position={[-0.6, 0, 0]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshStandardMaterial
                  color={isBraking ? '#D55E00' : '#881337'}
                  emissive={isBraking ? '#D55E00' : '#450A0A'}
                  emissiveIntensity={isBraking ? 2.5 : 0.4}
                />
              </mesh>
              <mesh position={[0.6, 0, 0]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshStandardMaterial
                  color={isBraking ? '#D55E00' : '#881337'}
                  emissive={isBraking ? '#D55E00' : '#450A0A'}
                  emissiveIntensity={isBraking ? 2.5 : 0.4}
                />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  );
}
