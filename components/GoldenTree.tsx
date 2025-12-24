
import React, { useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';

const TREE_PARTICLE_COUNT = 2500;
const BASE_PARTICLE_COUNT = 1500;
const RIBBON_PARTICLE_COUNT = 3600; 
const RIBBON_LOOPS = 6;
const TREE_HEIGHT = 5.5; 
const ORNAMENT_COUNT = 64; 

const EXPLODE_BOUNDS = {
  x: 12,
  y: 9,
  z: 6
};

// Ornament Types
const ORNAMENT_TYPES = ['gift', 'sock', 'candy', 'bell'];

interface GoldenTreeProps {
  state: TreeState;
  rotationOffset: number;
  photos: string[];
}

const Ornament: React.FC<{ type: string; index: number; treeState: TreeState; rotationOffset: number }> = ({ type, index, treeState, rotationOffset }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  const params = useMemo(() => {
    // Distribution logic similar to the tree shape
    const t = (index / ORNAMENT_COUNT); 
    const angle = (index * (Math.PI * 2 / 5)) + Math.random() * 0.5; 
    const height = t * TREE_HEIGHT - TREE_HEIGHT / 2;
    const radius = (1 - t) * 3.0 + 0.4; 
    
    const explodePos = new THREE.Vector3(
      (Math.random() - 0.5) * EXPLODE_BOUNDS.x * 1.8,
      (Math.random() - 0.5) * EXPLODE_BOUNDS.y * 1.8,
      (Math.random() - 0.5) * EXPLODE_BOUNDS.z * 1.5
    );

    return { angle, height, radius, explodePos };
  }, [index]);

  useFrame((stateContext) => {
    if (!meshRef.current) return;
    
    if (treeState === TreeState.TREE) {
      const time = stateContext.clock.getElapsedTime();
      const currentAngle = params.angle + time * 0.15 + rotationOffset * 0.5;
      
      const targetX = Math.cos(currentAngle) * params.radius;
      const targetY = params.height + Math.sin(time * 0.5 + index) * 0.05;
      const targetZ = Math.sin(currentAngle) * params.radius;

      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.08);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.08);
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.08);
      
      meshRef.current.rotation.y += 0.01;
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 0.32, 0.05));
    } else {
      meshRef.current.position.lerp(params.explodePos, 0.03);
      meshRef.current.rotation.x += 0.02;
      meshRef.current.rotation.z += 0.01;
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 0.2, 0.08));
    }
  });

  // Color Definitions
  const isRed = type === 'gift' || type === 'bell';
  
  // Red theme (Light Red / Salmon)
  const lightRed = "#ff9999";
  const emissiveRed = "#ff3333";
  const glowRed = "#ff6666";

  // Blue theme (Deep Blue)
  const darkBlue = "#001a66";
  const emissiveBlue = "#0044ff";
  const glowBlue = "#0055ff";

  const currentBase = isRed ? lightRed : darkBlue;
  const currentEmissive = isRed ? emissiveRed : emissiveBlue;
  const currentGlow = isRed ? glowRed : glowBlue;

  return (
    <group ref={meshRef}>
      {type === 'gift' && (
        <group>
          <mesh>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color={currentBase} emissive={currentEmissive} emissiveIntensity={5} roughness={0.1} metalness={0.8} />
          </mesh>
          {/* Ribbon */}
          <mesh scale={[1.05, 0.2, 1.05]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
          </mesh>
          {/* Glow Halo */}
          <mesh scale={[1.4, 1.4, 1.4]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshBasicMaterial color={currentGlow} transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      )}
      {type === 'sock' && (
        <group rotation={[0, 0, Math.PI / 8]}>
          <group>
            <mesh>
              <cylinderGeometry args={[0.15, 0.15, 0.5, 12]} />
              <meshStandardMaterial color={currentBase} emissive={currentEmissive} emissiveIntensity={5} />
            </mesh>
            <mesh position={[0.15, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.15, 0.15, 0.3, 12]} />
              <meshStandardMaterial color={currentBase} emissive={currentEmissive} emissiveIntensity={5} />
            </mesh>
          </group>
          {/* Glow Halo */}
          <group scale={[1.3, 1.3, 1.3]}>
            <mesh>
              <cylinderGeometry args={[0.15, 0.15, 0.5, 12]} />
              <meshBasicMaterial color={currentGlow} transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
            <mesh position={[0.15, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.15, 0.15, 0.3, 12]} />
              <meshBasicMaterial color={currentGlow} transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
          </group>
        </group>
      )}
      {type === 'candy' && (
        <group>
          <group>
            <mesh>
              <cylinderGeometry args={[0.06, 0.06, 0.6, 8]} />
              <meshStandardMaterial color={currentBase} emissive={currentEmissive} emissiveIntensity={5} />
            </mesh>
            <mesh position={[0.15, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.15, 0.06, 8, 16, Math.PI]} />
              <meshStandardMaterial color={currentBase} emissive={currentEmissive} emissiveIntensity={5} />
            </mesh>
          </group>
          {/* Glow Halo */}
          <group scale={[1.5, 1.5, 1.5]}>
            <mesh>
              <cylinderGeometry args={[0.06, 0.06, 0.6, 8]} />
              <meshBasicMaterial color={currentGlow} transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
            <mesh position={[0.15, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.15, 0.06, 8, 16, Math.PI]} />
              <meshBasicMaterial color={currentGlow} transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
          </group>
        </group>
      )}
      {type === 'bell' && (
        <group rotation={[Math.PI, 0, 0]}>
          <group>
            <mesh>
              <coneGeometry args={[0.3, 0.5, 16]} />
              <meshStandardMaterial color={currentBase} emissive={currentEmissive} emissiveIntensity={6} metalness={1} roughness={0.1} />
            </mesh>
            <mesh position={[0, -0.25, 0]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
            </mesh>
          </group>
          {/* Glow Halo */}
          <group scale={[1.3, 1.3, 1.3]}>
            <mesh>
              <coneGeometry args={[0.3, 0.5, 16]} />
              <meshBasicMaterial color={currentGlow} transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
          </group>
        </group>
      )}
      <pointLight color={currentEmissive} distance={2.5} intensity={3.5} />
    </group>
  );
};

const HangingPhoto: React.FC<{ url: string; index: number; treeState: TreeState; rotationOffset: number }> = ({ url, index, treeState, rotationOffset }) => {
  const meshRef = useRef<THREE.Group>(null);
  const texture = useLoader(THREE.TextureLoader, url);
  
  const params = useMemo(() => {
    const t = Math.random(); 
    const angle = (index * (Math.PI * 2 / 8)) + Math.random() * 2; 
    const height = t * TREE_HEIGHT - TREE_HEIGHT / 2;
    const radius = (1 - t) * 2.8 + 0.6; 
    const speed = 0.3 + Math.random() * 0.4;

    const explodePos = new THREE.Vector3(
      (Math.random() - 0.5) * EXPLODE_BOUNDS.x * 1.5,
      (Math.random() - 0.5) * EXPLODE_BOUNDS.y * 1.5,
      (Math.random() - 0.5) * EXPLODE_BOUNDS.z
    );

    return { angle, height, radius, speed, explodePos };
  }, [index]);

  useFrame((stateContext) => {
    if (!meshRef.current) return;
    
    if (treeState === TreeState.TREE) {
      const time = stateContext.clock.getElapsedTime();
      const currentAngle = params.angle + time * 0.1 * params.speed + rotationOffset * 0.5;
      
      const targetX = Math.cos(currentAngle) * params.radius;
      const targetY = params.height + Math.sin(time * 0.8 + index) * 0.05;
      const targetZ = Math.sin(currentAngle) * params.radius;

      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.1);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.1);
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.1);
      
      meshRef.current.lookAt(stateContext.camera.position);
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 0.75, 0.05));
    } else {
      meshRef.current.position.lerp(params.explodePos, 0.03);
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 0.4, 0.08));
    }
  });

  return (
    <group ref={meshRef} scale={[0, 0, 0]}>
      <mesh>
        <planeGeometry args={[1.05, 1.05]} />
        <meshBasicMaterial color="#ffdd44" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent opacity={0.95} />
      </mesh>
      <pointLight color="#ffcc33" distance={1.8} intensity={0.6} />
    </group>
  );
};

const GoldenTree: React.FC<GoldenTreeProps> = ({ state, rotationOffset, photos }) => {
  const treePointsRef = useRef<THREE.Points>(null);
  const treeGlowRef = useRef<THREE.Points>(null);
  const basePointsRef = useRef<THREE.Points>(null);
  const ribbonRef = useRef<THREE.Points>(null);
  const ribbonGlowRef = useRef<THREE.Points>(null);
  const starRef = useRef<THREE.Mesh>(null);
  const starGlowRef = useRef<THREE.PointLight>(null);

  const [treeData, treeGlowData, baseData, ribbonData, ribbonGlowData, ornamentData] = useMemo(() => {
    const treeGlowCount = Math.floor(TREE_PARTICLE_COUNT / 5);
    const treeCoreCount = TREE_PARTICLE_COUNT - treeGlowCount;

    const treePos = new Float32Array(treeCoreCount * 3);
    const treeTar = new Float32Array(treeCoreCount * 3);
    const treeExplode = new Float32Array(treeCoreCount * 3);

    const tgPos = new Float32Array(treeGlowCount * 3);
    const tgTar = new Float32Array(treeGlowCount * 3);
    const tgExplode = new Float32Array(treeGlowCount * 3);

    let coreIdx = 0;
    let glowIdx = 0;

    for (let i = 0; i < TREE_PARTICLE_COUNT; i++) {
      const t = Math.random(); 
      const height = t * TREE_HEIGHT - TREE_HEIGHT / 2;
      const angle = t * Math.PI * 2 * RIBBON_LOOPS + (Math.random() - 0.5) * 1.2; 
      const radius = (1 - t) * 3.4; 
      
      const jitterX = (Math.random() - 0.5) * 1.5; 
      const jitterY = (Math.random() - 0.5) * 0.4;
      const jitterZ = (Math.random() - 0.5) * 1.5; 

      const tx = Math.cos(angle) * radius + jitterX;
      const ty = height + jitterY;
      const tz = Math.sin(angle) * radius + jitterZ;

      const ex = (Math.random() - 0.5) * EXPLODE_BOUNDS.x * 2;
      const ey = (Math.random() - 0.5) * EXPLODE_BOUNDS.y * 2;
      const ez = (Math.random() - 0.5) * EXPLODE_BOUNDS.z;

      const px = (Math.random() - 0.5) * 40;
      const py = (Math.random() - 0.5) * 40;
      const pz = (Math.random() - 0.5) * 40;

      if (i % 5 === 0 && glowIdx < treeGlowCount) {
        tgPos[glowIdx * 3] = px; tgPos[glowIdx * 3 + 1] = py; tgPos[glowIdx * 3 + 2] = pz;
        tgTar[glowIdx * 3] = tx; tgTar[glowIdx * 3 + 1] = ty; tgTar[glowIdx * 3 + 2] = tz;
        tgExplode[glowIdx * 3] = ex; tgExplode[glowIdx * 3 + 1] = ey; tgExplode[glowIdx * 3 + 2] = ez;
        glowIdx++;
      } else if (coreIdx < treeCoreCount) {
        treePos[coreIdx * 3] = px; treePos[coreIdx * 3 + 1] = py; treePos[coreIdx * 3 + 2] = pz;
        treeTar[coreIdx * 3] = tx; treeTar[coreIdx * 3 + 1] = ty; treeTar[coreIdx * 3 + 2] = tz;
        treeExplode[coreIdx * 3] = ex; treeExplode[coreIdx * 3 + 1] = ey; treeExplode[coreIdx * 3 + 2] = ez;
        coreIdx++;
      }
    }

    const basePos = new Float32Array(BASE_PARTICLE_COUNT * 3);
    for (let i = 0; i < BASE_PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * 7.5; 
      basePos[i * 3] = Math.cos(angle) * radius;
      basePos[i * 3 + 1] = -TREE_HEIGHT / 2 - 0.8 + (Math.random() - 0.5) * 0.6;
      basePos[i * 3 + 2] = Math.sin(angle) * radius;
    }

    const ribbonGlowCount = Math.floor(RIBBON_PARTICLE_COUNT / 3);
    const ribbonCoreCount = RIBBON_PARTICLE_COUNT - ribbonGlowCount;
    
    const coreRibbonPos = new Float32Array(ribbonCoreCount * 3);
    const glowRibbonPos = new Float32Array(ribbonGlowCount * 3);
    
    let rCoreIdx = 0;
    let rGlowIdx = 0;

    for (let i = 0; i < RIBBON_PARTICLE_COUNT; i++) {
      const t = i / RIBBON_PARTICLE_COUNT;
      const height = t * TREE_HEIGHT - TREE_HEIGHT / 2;
      const angle = t * Math.PI * 2 * RIBBON_LOOPS;
      const wrapRadius = (1 - t) * 4.0; 
      const spread = 1.0; 
      
      const x = Math.cos(angle) * wrapRadius + (Math.random() - 0.5) * spread;
      const y = height + (Math.random() - 0.5) * (spread * 0.5);
      const z = Math.sin(angle) * wrapRadius + (Math.random() - 0.5) * spread;

      if (i % 3 === 0 && rGlowIdx < ribbonGlowCount) {
        glowRibbonPos[rGlowIdx * 3] = x;
        glowRibbonPos[rGlowIdx * 3 + 1] = y;
        glowRibbonPos[rGlowIdx * 3 + 2] = z;
        rGlowIdx++;
      } else if (rCoreIdx < ribbonCoreCount) {
        coreRibbonPos[rCoreIdx * 3] = x;
        coreRibbonPos[rCoreIdx * 3 + 1] = y;
        coreRibbonPos[rCoreIdx * 3 + 2] = z;
        rCoreIdx++;
      }
    }

    const ornaments = [];
    for(let i=0; i<ORNAMENT_COUNT; i++) {
      ornaments.push(ORNAMENT_TYPES[i % ORNAMENT_TYPES.length]);
    }

    return [
      { pos: treePos, tar: treeTar, explode: treeExplode, count: treeCoreCount },
      { pos: tgPos, tar: tgTar, explode: tgExplode, count: treeGlowCount },
      { pos: basePos },
      { pos: coreRibbonPos },
      { pos: glowRibbonPos },
      ornaments
    ];
  }, []);

  useFrame((stateContext) => {
    const time = stateContext.clock.getElapsedTime();
    const rotSpeed = 0.001 + rotationOffset * 0.06;
    
    if (treePointsRef.current) {
      const currentPos = treePointsRef.current.geometry.attributes.position.array as Float32Array;
      const lerpFactor = state === TreeState.TREE ? 0.05 : 0.02;

      for (let i = 0; i < treeData.count; i++) {
        const i3 = i * 3;
        if (state === TreeState.TREE) {
          currentPos[i3] += (treeData.tar[i3] - currentPos[i3]) * lerpFactor;
          currentPos[i3 + 1] += (treeData.tar[i3 + 1] - currentPos[i3 + 1]) * lerpFactor;
          currentPos[i3 + 2] += (treeData.tar[i3 + 2] - currentPos[i3 + 2]) * lerpFactor;
        } else {
          currentPos[i3] += (treeData.explode[i3] - currentPos[i3]) * lerpFactor;
          currentPos[i3 + 1] += (treeData.explode[i3 + 1] - currentPos[i3 + 1]) * lerpFactor;
          currentPos[i3 + 2] += (treeData.explode[i3 + 2] - currentPos[i3 + 2]) * lerpFactor;
          currentPos[i3] += Math.sin(time + i) * 0.01;
          currentPos[i3 + 1] += Math.cos(time + i) * 0.01;
        }
      }
      treePointsRef.current.geometry.attributes.position.needsUpdate = true;
      treePointsRef.current.rotation.y += rotSpeed;
    }

    if (treeGlowRef.current) {
      const currentPos = treeGlowRef.current.geometry.attributes.position.array as Float32Array;
      const lerpFactor = state === TreeState.TREE ? 0.05 : 0.02;

      for (let i = 0; i < treeGlowData.count; i++) {
        const i3 = i * 3;
        if (state === TreeState.TREE) {
          currentPos[i3] += (treeGlowData.tar[i3] - currentPos[i3]) * lerpFactor;
          currentPos[i3 + 1] += (treeGlowData.tar[i3 + 1] - currentPos[i3 + 1]) * lerpFactor;
          currentPos[i3 + 2] += (treeGlowData.tar[i3 + 2] - currentPos[i3 + 2]) * lerpFactor;
        } else {
          currentPos[i3] += (treeGlowData.explode[i3] - currentPos[i3]) * lerpFactor;
          currentPos[i3 + 1] += (treeGlowData.explode[i3 + 1] - currentPos[i3 + 1]) * lerpFactor;
          currentPos[i3 + 2] += (treeGlowData.explode[i3 + 2] - currentPos[i3 + 2]) * lerpFactor;
        }
      }
      treeGlowRef.current.geometry.attributes.position.needsUpdate = true;
      treeGlowRef.current.rotation.y += rotSpeed;
      (treeGlowRef.current.material as THREE.PointsMaterial).size = 0.25; 
    }

    if (ribbonRef.current) {
      ribbonRef.current.rotation.y += rotSpeed;
      ribbonRef.current.visible = state === TreeState.TREE;
    }
    if (ribbonGlowRef.current) {
      ribbonGlowRef.current.rotation.y += rotSpeed;
      ribbonGlowRef.current.visible = state === TreeState.TREE;
      (ribbonGlowRef.current.material as THREE.PointsMaterial).size = 0.22;
    }

    if (starRef.current) {
      const starScale = state === TreeState.TREE ? 1.05 : 0;
      starRef.current.scale.setScalar(THREE.MathUtils.lerp(starRef.current.scale.x, starScale, 0.1));
      if (starGlowRef.current) {
        starGlowRef.current.intensity = starScale * 25;
      }
    }

    if (basePointsRef.current) {
      basePointsRef.current.visible = state === TreeState.TREE;
      basePointsRef.current.rotation.y -= 0.0005;
    }
  });

  return (
    <group scale={[0.95, 0.95, 0.95]}>
      <group position={[0, TREE_HEIGHT / 2 + 0.5, 0]}>
        <mesh ref={starRef}>
          <sphereGeometry args={[0.25, 32, 32]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#ffdd00" 
            emissiveIntensity={50} 
            toneMapped={false}
          />
          <pointLight ref={starGlowRef} color="#ffdd00" distance={18} intensity={25} />
        </mesh>
      </group>

      {/* Main Golden Tree Particles (Core) */}
      <points ref={treePointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={treeData.count} array={treeData.pos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.065} color="#ffea00" transparent opacity={1.0} blending={THREE.AdditiveBlending} sizeAttenuation={true} depthWrite={false} />
      </points>

      {/* Golden Halo layer - Steady Glow */}
      <points ref={treeGlowRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={treeGlowData.count} array={treeGlowData.pos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.25} color="#ffb700" transparent opacity={0.4} sizeAttenuation={true} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>

      {/* Core Blue Shimmer Ribbon */}
      <points ref={ribbonRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={ribbonData.pos.length / 3} array={ribbonData.pos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.055} color="#e0ffff" transparent opacity={1.0} sizeAttenuation={true} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>

      {/* Glow Halo Ribbon layer - Steady Glow */}
      <points ref={ribbonGlowRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={ribbonGlowData.pos.length / 3} array={ribbonGlowData.pos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.22} color="#00ffff" transparent opacity={0.35} sizeAttenuation={true} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>

      <points ref={basePointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={BASE_PARTICLE_COUNT} array={baseData.pos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#ffaa00" transparent opacity={0.5} blending={THREE.AdditiveBlending} sizeAttenuation={true} depthWrite={false} />
      </points>

      <group>
        {photos.map((url, i) => (
          <HangingPhoto key={`photo-${url}-${i}`} url={url} index={i} treeState={state} rotationOffset={rotationOffset} />
        ))}
      </group>

      <group>
        {ornamentData.map((type, i) => (
          <Ornament key={`ornament-${i}`} type={type} index={i} treeState={state} rotationOffset={rotationOffset} />
        ))}
      </group>
    </group>
  );
};

export default GoldenTree;
