'use client';

import { useRef, Suspense, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Stars, Center } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { getActiveSceneIndex, SCENES } from '@/data/scenes';

interface CanvasSceneProps {
  scrollProgress: number;
  reducedMotion: boolean;
}

export default function CanvasScene({ scrollProgress, reducedMotion }: CanvasSceneProps) {
  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <SceneContent scrollProgress={scrollProgress} reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}

function SceneContent({
  scrollProgress,
  reducedMotion,
}: {
  scrollProgress: number;
  reducedMotion: boolean;
}) {
  const activeIndex = getActiveSceneIndex(scrollProgress);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[-5, 3, -5]} intensity={0.4} color="#ff6b35" />
      <pointLight position={[0, 0, 8]} intensity={0.6} color="#ff8855" />

      {/* Background stars */}
      <Stars
        radius={100}
        depth={50}
        count={1500}
        factor={4}
        saturation={0}
        fade
        speed={reducedMotion ? 0 : 0.3}
      />

      {/* Fog for depth */}
      <fog attach="fog" args={['#0a0a0c', 8, 30]} />

      {/* Render scene models/shapes */}
      {SCENES.map((scene, index) => (
        <SceneVisual
          key={scene.id}
          sceneIndex={index}
          modelPath={scene.visuals.model}
          scrollProgress={scrollProgress}
          reducedMotion={reducedMotion}
          isActive={index === activeIndex}
          rotation={scene.visuals.rotation}
          rotationAmplitude={scene.visuals.rotationAmplitude}
          scale={scene.visuals.scale}
        />
      ))}

      {/* Environment */}
      <Environment preset="night" />
    </>
  );
}

interface SceneVisualProps {
  sceneIndex: number;
  modelPath?: string;
  scrollProgress: number;
  reducedMotion: boolean;
  isActive: boolean;
  rotation?: [number, number, number];
  rotationAmplitude?: [number, number, number];
  scale?: number;
}

function SceneVisual({
  sceneIndex,
  modelPath,
  scrollProgress,
  reducedMotion,
  isActive,
  rotation,
  rotationAmplitude,
  scale,
}: SceneVisualProps) {
  const scene = SCENES[sceneIndex];
  const sceneStart = scene.scroll.start;
  const sceneEnd = scene.scroll.end;
  
  // Calculate scene progress (0 to 1 within this scene)
  const sceneProgress = Math.max(0, Math.min(1, (scrollProgress - sceneStart) / (sceneEnd - sceneStart)));
  
  // Model should be visible from slightly before scene starts to when it scrolls off
  const visibleStart = sceneIndex === 0 ? 0 : sceneStart - 0.02;
  const isVisible = scrollProgress >= visibleStart && scrollProgress <= sceneEnd + 0.05;
  
  // Entry animation: scroll IN from bottom (0% to 20% of scene)
  const entryProgress = Math.min(1, sceneProgress / 0.2); // 0 to 1 over first 20%
  
  // Exit animation: scroll OFF to top (80% to 100% of scene)
  // Delayed to give buffer after last narration line appears
  const exitProgress = Math.max(0, (sceneProgress - 0.8) / 0.2); // 0 to 1 over last 20%
  
  // Brightness: start dim, brighten at 10-30%, then stay bright
  const brightnessProgress = Math.min(1, Math.max(0, (sceneProgress - 0.1) / 0.2));
  
  if (!isVisible) return null;
  
  // If there's a model path, try to load the STL (no fallback while loading)
  if (modelPath) {
    return (
      <STLModelLoader
        path={modelPath}
        entryProgress={entryProgress}
        exitProgress={exitProgress}
        brightnessProgress={brightnessProgress}
        reducedMotion={reducedMotion}
        isActive={isActive}
        sceneIndex={sceneIndex}
        rotation={rotation}
        rotationAmplitude={rotationAmplitude}
        scale={scale}
      />
    );
  }
  
  // Otherwise show fallback shape
  return (
    <FallbackShape
      sceneIndex={sceneIndex}
      entryProgress={entryProgress}
      exitProgress={exitProgress}
      brightnessProgress={brightnessProgress}
      reducedMotion={reducedMotion}
      isActive={isActive}
      rotation={rotation}
      rotationAmplitude={rotationAmplitude}
    />
  );
}

interface STLModelLoaderProps {
  path: string;
  entryProgress: number;
  exitProgress: number;
  brightnessProgress: number;
  reducedMotion: boolean;
  isActive: boolean;
  sceneIndex: number;
  rotation?: [number, number, number];
  rotationAmplitude?: [number, number, number];
  scale?: number;
}

function STLModelLoader({ 
  path, 
  entryProgress,
  exitProgress,
  brightnessProgress,
  reducedMotion, 
  isActive, 
  sceneIndex,
  rotation = [0, 0, 0],
  rotationAmplitude = [0.05, 0.2, 0],
  scale: customScale = 1,
}: STLModelLoaderProps) {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Load STL file manually to handle errors
  useEffect(() => {
    setLoadState('loading');
    const loader = new STLLoader();
    
    loader.load(
      path,
      (geo: THREE.BufferGeometry) => {
        setGeometry(geo);
        setLoadState('loaded');
      },
      undefined,
      () => {
        console.warn(`Failed to load STL: ${path}`);
        setLoadState('error');
      }
    );

    return () => {
      if (geometry) {
        geometry.dispose();
      }
    };
  }, [path]);

  // Compute bounding box to center and scale the model
  const modelScale = useMemo(() => {
    if (!geometry) return 1;
    
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (!box) return 1;
    
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    return maxDim > 0 ? 2 / maxDim : 1;
  }, [geometry]);

  // Animation
  useFrame((state) => {
    if (groupRef.current) {
      // Apply initial rotation + animated oscillation
      if (!reducedMotion) {
        groupRef.current.rotation.x = rotation[0] + Math.sin(state.clock.elapsedTime * 0.3) * rotationAmplitude[0];
        groupRef.current.rotation.y = rotation[1] + Math.sin(state.clock.elapsedTime * 0.5) * rotationAmplitude[1];
        groupRef.current.rotation.z = rotation[2] + Math.sin(state.clock.elapsedTime * 0.4) * rotationAmplitude[2];
      } else {
        groupRef.current.rotation.x = rotation[0];
        groupRef.current.rotation.y = rotation[1];
        groupRef.current.rotation.z = rotation[2];
      }
      
      // Entry: scroll up from below (-8 to 0)
      // Exit: scroll up off screen (0 to +8)
      const entryOffset = (1 - easeOutCubic(entryProgress)) * -8;
      const exitOffset = easeInCubic(exitProgress) * 8;
      groupRef.current.position.y = entryOffset + exitOffset;
    }

    // Update material brightness
    if (materialRef.current) {
      // Brightness ramps up from 0.05 to full value
      const baseEmissive = isActive ? 0.35 : 0.2;
      materialRef.current.emissiveIntensity = 0.05 + brightnessProgress * (baseEmissive - 0.05);
      
      // Opacity based on entry/exit
      const entryOpacity = easeOutCubic(entryProgress);
      const exitOpacity = 1 - easeInCubic(exitProgress);
      materialRef.current.opacity = Math.min(entryOpacity, exitOpacity);
    }
  });

  // While loading, show nothing (not a placeholder)
  if (loadState === 'loading') {
    return null;
  }

  // If loading failed, show nothing (or could show fallback if desired)
  if (loadState === 'error' || !geometry) {
    return null;
  }

  return (
    <group ref={groupRef}>
      <Center>
        <mesh geometry={geometry} scale={modelScale * customScale}>
          <meshStandardMaterial
            ref={materialRef}
            color="#ff6b35"
            emissive="#ff6b35"
            emissiveIntensity={0.05}
            roughness={0.4}
            metalness={0.3}
            transparent
            opacity={0}
          />
        </mesh>
      </Center>
    </group>
  );
}

interface FallbackShapeProps {
  sceneIndex: number;
  entryProgress: number;
  exitProgress: number;
  brightnessProgress: number;
  reducedMotion: boolean;
  isActive: boolean;
  rotation?: [number, number, number];
  rotationAmplitude?: [number, number, number];
}

function FallbackShape({
  sceneIndex,
  entryProgress,
  exitProgress,
  brightnessProgress,
  reducedMotion,
  isActive,
  rotation = [0, 0, 0],
  rotationAmplitude = [0.05, 0.2, 0],
}: FallbackShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Apply initial rotation + animated oscillation
      if (!reducedMotion) {
        meshRef.current.rotation.x = rotation[0] + Math.sin(state.clock.elapsedTime * 0.3) * rotationAmplitude[0];
        meshRef.current.rotation.y = rotation[1] + Math.sin(state.clock.elapsedTime * 0.5) * rotationAmplitude[1];
        meshRef.current.rotation.z = rotation[2] + Math.sin(state.clock.elapsedTime * 0.4) * rotationAmplitude[2];
      } else {
        meshRef.current.rotation.x = rotation[0];
        meshRef.current.rotation.y = rotation[1];
        meshRef.current.rotation.z = rotation[2];
      }
      
      // Entry: scroll up from below (-8 to 0)
      // Exit: scroll up off screen (0 to +8)
      const entryOffset = (1 - easeOutCubic(entryProgress)) * -8;
      const exitOffset = easeInCubic(exitProgress) * 8;
      meshRef.current.position.y = entryOffset + exitOffset;
    }

    // Update material brightness
    if (materialRef.current) {
      const baseEmissive = isActive ? 0.35 : 0.2;
      materialRef.current.emissiveIntensity = 0.05 + brightnessProgress * (baseEmissive - 0.05);
      
      const entryOpacity = easeOutCubic(entryProgress);
      const exitOpacity = 1 - easeInCubic(exitProgress);
      materialRef.current.opacity = Math.min(entryOpacity, exitOpacity);
    }
  });

  // Different fallback shapes for different scenes
  const shapes: Record<number, JSX.Element> = {
    0: <boxGeometry args={[1.2, 1.6, 0.1]} />,
    1: <cylinderGeometry args={[0.8, 0.6, 1.5, 16]} />,
    2: <coneGeometry args={[1.5, 1, 8]} />,
    3: <torusGeometry args={[0.8, 0.2, 8, 32, Math.PI * 1.9]} />,
    4: <icosahedronGeometry args={[1, 0]} />,
    5: <torusKnotGeometry args={[0.6, 0.2, 64, 16]} />,
    6: <sphereGeometry args={[1, 32, 32]} />,
    7: <object3D />,
    8: <sphereGeometry args={[1.2, 32, 32]} />,
    9: <boxGeometry args={[1, 1.4, 0.1]} />,
  };

  return (
    <mesh ref={meshRef}>
      {shapes[sceneIndex] || <boxGeometry args={[1, 1, 1]} />}
      <meshStandardMaterial
        ref={materialRef}
        color="#ff6b35"
        emissive="#ff6b35"
        emissiveIntensity={0.05}
        roughness={0.4}
        metalness={0.3}
        transparent
        opacity={0}
      />
    </mesh>
  );
}

// Easing functions
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t: number): number {
  return t * t * t;
}
