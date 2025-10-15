import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF, Float, Html } from '@react-three/drei';
import * as THREE from 'three';

// Simple 3D Bee Model using basic Three.js geometries
function BeeModel({ isHovering }: { isHovering: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const wingsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Gentle floating animation
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    
    // Gentle rotation
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    
    // Wing flapping
    if (wingsRef.current) {
      const wingFlap = Math.sin(state.clock.elapsedTime * 8) * 0.3;
      wingsRef.current.children[0].rotation.z = wingFlap;
      wingsRef.current.children[1].rotation.z = -wingFlap;
    }
    
    // Hover effect
    if (isHovering && groupRef.current) {
      groupRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
    } else if (groupRef.current) {
      groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Bee Body */}
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.4, 0.8, 4, 8]} />
          <meshStandardMaterial color="#edb421" metalness={0.3} roughness={0.7} />
        </mesh>
        
        {/* Black stripes */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.41, 0.41, 0.2, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.41, 0.41, 0.2, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Head */}
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color="#edb421" />
        </mesh>
        
        {/* Eyes */}
        <mesh position={[0.15, 0.85, 0.25]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[-0.15, 0.85, 0.25]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Pupils */}
        <mesh position={[0.15, 0.85, 0.32]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.15, 0.85, 0.32]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* Antennae */}
        <mesh position={[0.1, 1.1, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[-0.1, 1.1, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Antennae balls */}
        <mesh position={[0.1, 1.3, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[-0.1, 1.3, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Wings */}
        <group ref={wingsRef} position={[0, 0.3, -0.3]}>
          {/* Right wing */}
          <mesh position={[0.5, 0, 0]} rotation={[0, 0, 0.3]}>
            <planeGeometry args={[0.8, 1.2]} />
            <meshStandardMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.3} 
              side={THREE.DoubleSide}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          
          {/* Left wing */}
          <mesh position={[-0.5, 0, 0]} rotation={[0, 0, -0.3]}>
            <planeGeometry args={[0.8, 1.2]} />
            <meshStandardMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.3} 
              side={THREE.DoubleSide}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        </group>
        
        {/* Stinger */}
        <mesh position={[0, -0.7, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.08, 0.3, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </Float>
  );
}

// Loading fallback
function Loader() {
  return (
    <Html center>
      <div className="text-white text-xl">Loading 3D Mascot...</div>
    </Html>
  );
}

interface BeeMascot3DProps {
  className?: string;
  enableControls?: boolean;
}

const BeeMascot3D: React.FC<BeeMascot3DProps> = ({ 
  className = '', 
  enableControls = false 
}) => {
  const [isHovering, setIsHovering] = React.useState(false);

  return (
    <div 
      className={`w-full h-full ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, 5, 5]} intensity={0.5} color="#edb421" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          castShadow
        />
        
        {/* Bee Model */}
        <Suspense fallback={<Loader />}>
          <BeeModel isHovering={isHovering} />
        </Suspense>
        
        {/* Optional Controls */}
        {enableControls && (
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 3}
          />
        )}
      </Canvas>
    </div>
  );
};

export default BeeMascot3D;
