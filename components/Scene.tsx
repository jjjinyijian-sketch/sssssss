
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Float, Stars } from '@react-three/drei';
import GoldenTree from './GoldenTree';
import Snowfall from './Snowfall';
import { TreeState } from '../types';

interface SceneProps {
  treeState: TreeState;
  rotationOffset: number;
  photos: string[];
}

const Scene: React.FC<SceneProps> = ({ treeState, rotationOffset, photos }) => {
  return (
    <Canvas 
      shadows 
      className="bg-black" 
      camera={{ position: [0, 1, 16], fov: 40 }} // Moved camera back to z=16 for wider coverage
      gl={{ antialias: true, alpha: false }}
    >
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[0, 1, 16]} fov={40} />
        <OrbitControls 
          enablePan={false} 
          minDistance={10} 
          maxDistance={22} 
          enableRotate={true}
          autoRotate={treeState === TreeState.TREE}
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.5}
        />
        
        {/* Atmosphere */}
        <color attach="background" args={['#020202']} />
        <fog attach="fog" args={['#020202', 8, 28]} />
        
        <ambientLight intensity={0.4} />
        <spotLight position={[5, 12, 10]} angle={0.3} penumbra={1} intensity={4.5} color="#fff" />
        <pointLight position={[0, -4, 0]} intensity={3.5} color="#ffcc33" />
        
        <Environment preset="night" />

        {/* Dynamic Snowfall effect */}
        <Snowfall />

        {/* Stars in background */}
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

        {/* The Golden Tree Component */}
        <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.25}>
          <GoldenTree state={treeState} rotationOffset={rotationOffset} photos={photos} />
        </Float>

        {/* Refractive Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.5, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial 
            color="#050505" 
            roughness={0.05} 
            metalness={0.9} 
            transparent 
            opacity={0.4} 
          />
        </mesh>
      </Suspense>
    </Canvas>
  );
};

export default Scene;
