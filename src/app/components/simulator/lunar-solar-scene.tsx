"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import {
  CYCLE_HOURS,
  DAY_HOURS,
  NIGHT_HOURS,
  solarFraction,
} from "../../data/simulator";

const REGOLITH_COLOR = "#8A8478";
const REGOLITH_SHADOW_COLOR = "#3A362F";
const PANEL_COLOR = "#1A1A1A";
const SUN_GLOW_COLOR = "#D8C9A0";
const SKY_DAY_COLOR = new THREE.Color("#FAF9F6");
const SKY_NIGHT_COLOR = new THREE.Color("#1F1D1A");
const GROUND_DAY_COLOR = new THREE.Color(REGOLITH_COLOR);
const GROUND_NIGHT_COLOR = new THREE.Color(REGOLITH_SHADOW_COLOR);

const SUN_ORBIT_RADIUS = 6;
const SUN_MIN_INTENSITY = 0.05;
const SUN_MAX_INTENSITY = 1.6;

// Returns the sun's angle (radians) around a full day/night circle: 0 at
// sunrise, PI at sunset, continuing below the horizon through the night
// back to 2*PI at the next sunrise.
function sunAngle(hourInCycle: number): number {
  const h = ((hourInCycle % CYCLE_HOURS) + CYCLE_HOURS) % CYCLE_HOURS;
  if (h < DAY_HOURS) return (h / DAY_HOURS) * Math.PI;
  return Math.PI + ((h - DAY_HOURS) / NIGHT_HOURS) * Math.PI;
}

function SceneContents({
  timeHoursRef,
}: {
  timeHoursRef: React.RefObject<number>;
}) {
  const sunRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const groundMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const backgroundRef = useRef<THREE.Color>(null);

  useFrame(() => {
    const hourInCycle = timeHoursRef.current;
    const angle = sunAngle(hourInCycle);
    const fraction = solarFraction(hourInCycle);

    const sunX = Math.cos(angle) * SUN_ORBIT_RADIUS;
    const sunY = Math.sin(angle) * SUN_ORBIT_RADIUS;

    if (sunRef.current) {
      sunRef.current.position.set(sunX, sunY, 0);
    }
    if (lightRef.current) {
      lightRef.current.position.set(sunX, sunY, 2);
      lightRef.current.intensity =
        SUN_MIN_INTENSITY + fraction * (SUN_MAX_INTENSITY - SUN_MIN_INTENSITY);
    }
    if (groundMaterialRef.current) {
      groundMaterialRef.current.color.lerpColors(
        GROUND_NIGHT_COLOR,
        GROUND_DAY_COLOR,
        fraction
      );
    }
    if (backgroundRef.current) {
      backgroundRef.current.lerpColors(SKY_NIGHT_COLOR, SKY_DAY_COLOR, fraction);
    }
  });

  return (
    <>
      <color ref={backgroundRef} attach="background" args={[SKY_NIGHT_COLOR]} />
      <ambientLight intensity={0.15} />
      <directionalLight ref={lightRef} intensity={SUN_MIN_INTENSITY} />

      <mesh ref={sunRef}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshBasicMaterial color={SUN_GLOW_COLOR} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[10, 10, 8, 8]} />
        <meshStandardMaterial
          ref={groundMaterialRef}
          color={REGOLITH_COLOR}
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      <mesh position={[0, -0.15, 0]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[1.6, 0.05, 1]} />
        <meshStandardMaterial color={PANEL_COLOR} roughness={0.55} metalness={0.1} />
      </mesh>
    </>
  );
}

export function LunarSolarScene({
  timeHoursRef,
}: {
  timeHoursRef: React.RefObject<number>;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true }}
      camera={{ position: [3, 1.6, 4], fov: 40 }}
    >
      <SceneContents timeHoursRef={timeHoursRef} />
    </Canvas>
  );
}
