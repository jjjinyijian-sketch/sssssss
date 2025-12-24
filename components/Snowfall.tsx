
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SNOW_COUNT = 1500;
const BOUNDS = 25;

const Snowfall: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);

  // Initialize snow particle data: positions and individual speeds
  // Speeds increased by 3x from original (0.02-0.07 range to 0.06-0.21 range)
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(SNOW_COUNT * 3);
    const spd = new Float32Array(SNOW_COUNT);
    for (let i = 0; i < SNOW_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * BOUNDS * 2;
      pos[i * 3 + 1] = Math.random() * BOUNDS * 2 - BOUNDS;
      pos[i * 3 + 2] = (Math.random() - 0.5) * BOUNDS * 2;
      spd[i] = 0.06 + Math.random() * 0.15;
    }
    return [pos, spd];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < SNOW_COUNT; i++) {
      const i3 = i * 3;
      // Move snow down at the increased speed
      posAttr.array[i3 + 1] -= speeds[i];
      
      // Add slight horizontal drift/sway
      posAttr.array[i3] += Math.sin(time + i) * 0.005;
      posAttr.array[i3 + 2] += Math.cos(time + i) * 0.005;

      // Reset when snow falls below the floor
      if (posAttr.array[i3 + 1] < -BOUNDS / 2) {
        posAttr.array[i3 + 1] = BOUNDS;
        posAttr.array[i3] = (Math.random() - 0.5) * BOUNDS * 2;
        posAttr.array[i3 + 2] = (Math.random() - 0.5) * BOUNDS * 2;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={SNOW_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#ffffff"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
};

export default Snowfall;
