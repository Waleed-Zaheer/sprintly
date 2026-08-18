"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";

/**
 * A quiet, secondary layer behind the real product mockup — not the hero's
 * subject anymore. A few slowly-drifting cards (echoing actual task cards,
 * not an abstract shape) at low opacity, positioned toward the edges so the
 * screenshot in front stays the thing your eye lands on.
 */
function DriftingCard({
  position,
  color,
  scale = 1,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
}) {
  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.7}>
      <RoundedBox args={[0.55 * scale, 0.38 * scale, 0.04]} radius={0.07} position={position}>
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.05} transparent opacity={0.35} />
      </RoundedBox>
    </Float>
  );
}

export function HeroScene() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 3, 4]} intensity={0.8} />
        <Suspense fallback={null}>
          <DriftingCard position={[-3.6, 1.9, -1.2]} color="#22d3c5" scale={1.1} />
          <DriftingCard position={[3.7, -1.8, -1.4]} color="#8b7dff" scale={0.9} />
          <DriftingCard position={[3.9, 2.2, -1.6]} color="#ff7a59" scale={0.7} />
          <DriftingCard position={[-3.9, -2.1, -1.2]} color="#6d5efc" scale={0.8} />
        </Suspense>
      </Canvas>
    </div>
  );
}
