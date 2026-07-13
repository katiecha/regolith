"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { solarFraction } from "../../data/simulator";

const REGOLITH_COLOR = "#8A8478";
const REGOLITH_SHADOW_COLOR = "#3A362F";
const PANEL_COLOR = "#1A1A1A";
const SUN_GLOW_COLOR = "#D8C9A0";
const SKY_DAY_COLOR = new THREE.Color("#FAF9F6");
const SKY_NIGHT_COLOR = new THREE.Color("#1F1D1A");

const SUN_ORBIT_RADIUS = 6;
const SUN_MIN_INTENSITY = 0.05;
const SUN_MAX_INTENSITY = 1.6;

function SceneContents({
  timeHoursRef,
}: {
  timeHoursRef: React.RefObject<number>;
}) {
  const sunRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const groundRef = useRef<THREE.Mesh>(null);
  const backgroundColor = useMemo(() => new THREE.Color(), []);

  useFrame(({ scene }) => {
    const fraction = solarFraction(timeHoursRef.current);
    const angle = fraction * Math.PI;

    const sunX = Math.cos(angle) * SUN_ORBIT_RADIUS;
    const sunY = Math.sin(angle) * SUN_ORBIT_RADIUS;

    if (sunRef.current) {
      sunRef.current.position.set(sunX, Math.max(sunY, -1.5), 0);
    }
    if (lightRef.current) {
      lightRef.current.position.set(sunX, Math.max(sunY, -1.5), 2);
      lightRef.current.intensity =
        SUN_MIN_INTENSITY + fraction * (SUN_MAX_INTENSITY - SUN_MIN_INTENSITY);
    }
    if (groundRef.current) {
      const material = groundRef.current.material as THREE.MeshStandardMaterial;
      material.color.lerpColors(
        new THREE.Color(REGOLITH_SHADOW_COLOR),
        new THREE.Color(REGOLITH_COLOR),
        fraction
      );
    }

    backgroundColor.lerpColors(SKY_NIGHT_COLOR, SKY_DAY_COLOR, fraction);
    scene.background = backgroundColor;
  });

  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight ref={lightRef} intensity={SUN_MIN_INTENSITY} />

      <mesh ref={sunRef}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshBasicMaterial color={SUN_GLOW_COLOR} />
      </mesh>

      <mesh
        ref={groundRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
      >
        <planeGeometry args={[10, 10, 8, 8]} />
        <meshStandardMaterial color={REGOLITH_COLOR} roughness={0.9} metalness={0} />
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
