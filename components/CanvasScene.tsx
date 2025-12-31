'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { interpolateCamera, getActiveSceneIndex, SCENES } from '@/data/scenes';

interface CanvasSceneProps {
  scrollProgress: number;
  reducedMotion: boolean;
}

export default function CanvasScene({ scrollProgress, reducedMotion }: CanvasSceneProps) {
  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
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
  const activeVisual = SCENES[activeIndex]?.visuals.key || 'shirtToBin';

  return (
    <>
      {/* Enhanced lighting for visibility */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} color="#ff6b35" />
      <pointLight position={[0, 0, 10]} intensity={0.5} color="#e8e6e3" />

      {/* Camera controller */}
      <CameraController scrollProgress={scrollProgress} reducedMotion={reducedMotion} />

      {/* Background stars - brighter */}
      <Stars
        radius={100}
        depth={50}
        count={2000}
        factor={5}
        saturation={0}
        fade
        speed={reducedMotion ? 0 : 0.3}
      />

      {/* Lighter fog for depth without losing visuals */}
      <fog attach="fog" args={['#0a0a0c', 30, 200]} />

      {/* Scene visuals */}
      <VisualElements
        activeVisual={activeVisual}
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
        activeIndex={activeIndex}
      />

      {/* Environment */}
      <Environment preset="night" />
    </>
  );
}

function CameraController({
  scrollProgress,
  reducedMotion,
}: {
  scrollProgress: number;
  reducedMotion: boolean;
}) {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3());
  const posRef = useRef(new THREE.Vector3());

  useFrame(() => {
    const { pos, lookAt, fov } = interpolateCamera(scrollProgress);

    // Smoother camera movement with better damping
    const dampFactor = reducedMotion ? 0.15 : 0.03;

    posRef.current.set(pos[0], pos[1], pos[2]);
    targetRef.current.set(lookAt[0], lookAt[1], lookAt[2]);

    camera.position.lerp(posRef.current, dampFactor);
    
    // Update FOV smoothly
    if ((camera as THREE.PerspectiveCamera).fov !== undefined) {
      const perspCamera = camera as THREE.PerspectiveCamera;
      perspCamera.fov = THREE.MathUtils.lerp(perspCamera.fov, fov, dampFactor);
      perspCamera.updateProjectionMatrix();
    }

    camera.lookAt(targetRef.current);
  });

  return null;
}

function VisualElements({
  activeVisual,
  scrollProgress,
  reducedMotion,
  activeIndex,
}: {
  activeVisual: string;
  scrollProgress: number;
  reducedMotion: boolean;
  activeIndex: number;
}) {
  return (
    <>
      {/* Scene 0: Shirt */}
      <ShirtMesh
        visible={activeVisual === 'shirtToBin'}
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
      />

      {/* Scene 1: Bin to Truck */}
      <BinScene
        visible={activeVisual === 'binToTruck'}
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
      />

      {/* Scene 2: Landfill */}
      <LandfillScene
        visible={activeVisual === 'landfillZoom'}
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
      />

      {/* Scene 3: Labels and Threads */}
      <ThreadsScene
        visible={activeVisual === 'labelsAndThreads'}
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
      />

      {/* Scene 4: Fibers to Polymers */}
      <FibersScene
        visible={activeVisual === 'fibersToPolymers'}
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
      />

      {/* Scene 5: Wash Particles */}
      <WashScene
        visible={activeVisual === 'washParticles'}
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
      />

      {/* Scene 6: River to Gyre */}
      <OceanScene
        visible={activeVisual === 'riverToGyre'}
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
      />

      {/* Scene 7: Methane Plumes */}
      <MethaneScene
        visible={activeVisual === 'methanePlumes'}
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
      />

      {/* Scene 8: Global System */}
      <GlobalScene
        visible={activeVisual === 'globalSystemOverlay'}
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
      />

      {/* Scene 9: Repair and Reuse */}
      <FinalScene
        visible={activeVisual === 'repairAndReuse'}
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
      />
    </>
  );
}

// Improved shirt mesh that actually looks like a T-shirt
function ShirtMesh({
  visible,
  scrollProgress,
  reducedMotion,
}: {
  visible: boolean;
  scrollProgress: number;
  reducedMotion: boolean;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const sceneProgress = Math.min(1, Math.max(0, scrollProgress / 0.1));

  useFrame((state) => {
    if (meshRef.current && !reducedMotion) {
      // Gentle floating motion
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
      meshRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      
      // Fall animation as scene progresses - clamped properly
      const fallProgress = Math.min(1, sceneProgress * 1.5);
      meshRef.current.position.y = THREE.MathUtils.lerp(0.3, -1.5, fallProgress);
      meshRef.current.rotation.z = THREE.MathUtils.lerp(0, Math.PI * 0.3, fallProgress);
      meshRef.current.rotation.x = THREE.MathUtils.lerp(0, 0.3, fallProgress);
    }
  });

  if (!visible) return null;

  return (
    <Float speed={reducedMotion ? 0 : 1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={meshRef} position={[0, 0.3, 0]}>
        {/* Main shirt body - T-shape */}
        <mesh position={[0, 0, 0]}>
          {/* Torso */}
          <boxGeometry args={[1.4, 1.6, 0.08]} />
          <meshStandardMaterial
            color="#f5f3f0"
            roughness={0.85}
            metalness={0}
          />
        </mesh>

        {/* Left sleeve */}
        <mesh position={[-0.95, 0.55, 0]} rotation={[0, 0, Math.PI / 5]}>
          <boxGeometry args={[0.7, 0.45, 0.07]} />
          <meshStandardMaterial color="#f5f3f0" roughness={0.85} />
        </mesh>

        {/* Right sleeve */}
        <mesh position={[0.95, 0.55, 0]} rotation={[0, 0, -Math.PI / 5]}>
          <boxGeometry args={[0.7, 0.45, 0.07]} />
          <meshStandardMaterial color="#f5f3f0" roughness={0.85} />
        </mesh>

        {/* Collar - V-neck shape */}
        <mesh position={[0, 0.7, 0.05]}>
          <ringGeometry args={[0.12, 0.22, 32, 1, 0, Math.PI]} />
          <meshStandardMaterial color="#d8d5d0" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>

        {/* Collar edge */}
        <mesh position={[0, 0.75, 0.05]}>
          <torusGeometry args={[0.18, 0.025, 8, 32, Math.PI]} />
          <meshStandardMaterial color="#c8c5c0" roughness={0.8} />
        </mesh>

        {/* Bottom hem detail */}
        <mesh position={[0, -0.82, 0.045]}>
          <boxGeometry args={[1.35, 0.04, 0.01]} />
          <meshStandardMaterial color="#d8d5d0" roughness={0.9} />
        </mesh>

        {/* Subtle fold lines */}
        <mesh position={[0.3, 0, 0.045]}>
          <boxGeometry args={[0.01, 1.2, 0.01]} />
          <meshStandardMaterial color="#e0ddd8" roughness={0.9} transparent opacity={0.5} />
        </mesh>
        <mesh position={[-0.3, 0, 0.045]}>
          <boxGeometry args={[0.01, 1.2, 0.01]} />
          <meshStandardMaterial color="#e0ddd8" roughness={0.9} transparent opacity={0.5} />
        </mesh>
      </group>
    </Float>
  );
}

function BinScene({
  visible,
  scrollProgress,
  reducedMotion,
}: {
  visible: boolean;
  scrollProgress: number;
  reducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const sceneProgress = Math.min(1, Math.max(0, (scrollProgress - 0.1) / 0.1));

  useFrame((state) => {
    if (groupRef.current && !reducedMotion) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  if (!visible) return null;

  // Clothes fall INTO the bin, not through it
  const clothesFallProgress = Math.min(1, sceneProgress * 2);
  const binLidOpen = Math.min(0.6, sceneProgress * 1.2);

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Garbage bin - larger and more visible */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1, 0.8, 2, 24]} />
        <meshStandardMaterial color="#3a3a42" roughness={0.6} metalness={0.3} />
      </mesh>
      
      {/* Bin rim */}
      <mesh position={[0, 1.05, 0]}>
        <torusGeometry args={[1.02, 0.08, 8, 24]} />
        <meshStandardMaterial color="#4a4a52" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Lid - opens as clothes fall */}
      <group position={[0, 1.1, -0.9]} rotation={[-binLidOpen, 0, 0]}>
        <mesh position={[0, 0, 0.9]}>
          <cylinderGeometry args={[1.05, 1.05, 0.12, 24]} />
          <meshStandardMaterial color="#2a2a32" roughness={0.5} metalness={0.4} />
        </mesh>
        {/* Lid handle */}
        <mesh position={[0, 0.08, 0.9]}>
          <boxGeometry args={[0.3, 0.06, 0.1]} />
          <meshStandardMaterial color="#5a5a62" roughness={0.4} metalness={0.5} />
        </mesh>
      </group>

      {/* Falling clothes - stop INSIDE the bin */}
      {[0, 1, 2, 3, 4].map((i) => {
        const delay = i * 0.15;
        const itemProgress = Math.max(0, Math.min(1, (clothesFallProgress - delay) * 2));
        // Clothes stop at bin bottom (y = -0.8) not below
        const yPos = THREE.MathUtils.lerp(3, -0.3 + i * 0.15, itemProgress);
        const rotation = itemProgress * Math.PI * (0.5 + i * 0.3);
        
        return (
          <mesh
            key={i}
            position={[
              Math.sin(i * 1.5) * 0.25,
              yPos,
              Math.cos(i * 1.5) * 0.25,
            ]}
            rotation={[rotation * 0.3, rotation, rotation * 0.2]}
            scale={0.35}
          >
            <boxGeometry args={[1, 1.3, 0.06]} />
            <meshStandardMaterial
              color={['#f5f3f0', '#a0a0a8', '#c44536', '#3a6a8a', '#4a6a5a'][i]}
              roughness={0.85}
            />
          </mesh>
        );
      })}

      {/* Truck silhouette in background - more visible */}
      <group position={[4, 0.5, -6]}>
        <mesh>
          <boxGeometry args={[3, 2, 1.5]} />
          <meshStandardMaterial color="#2a2a32" roughness={0.8} />
        </mesh>
        <mesh position={[-2, -0.2, 0]}>
          <boxGeometry args={[1.2, 1.5, 1.4]} />
          <meshStandardMaterial color="#252530" roughness={0.8} />
        </mesh>
        {/* Wheels */}
        <mesh position={[-1.5, -1.2, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
          <meshStandardMaterial color="#1a1a20" roughness={0.9} />
        </mesh>
        <mesh position={[1, -1.2, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
          <meshStandardMaterial color="#1a1a20" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

function LandfillScene({
  visible,
  scrollProgress,
  reducedMotion,
}: {
  visible: boolean;
  scrollProgress: number;
  reducedMotion: boolean;
}) {
  const debris = useMemo(() => {
    const items = [];
    for (let i = 0; i < 300; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 25;
      items.push({
        position: [
          Math.cos(angle) * radius,
          Math.random() * 4 - 1 + Math.sin(radius * 0.3) * 2,
          Math.sin(angle) * radius,
        ] as [number, number, number],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ] as [number, number, number],
        scale: 0.15 + Math.random() * 0.5,
        color: ['#e8e6e3', '#b0b0b8', '#c44536', '#3a6a8a', '#4a6a5a', '#ff8855', '#8080a0'][
          Math.floor(Math.random() * 7)
        ],
      });
    }
    return items;
  }, []);

  if (!visible) return null;

  return (
    <group position={[0, -2, 0]}>
      {/* Ground - textured terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[120, 120, 32, 32]} />
        <meshStandardMaterial color="#252528" roughness={1} />
      </mesh>

      {/* Mounds of debris */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[8, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3a3a40" roughness={0.95} />
      </mesh>
      <mesh position={[-12, -1, 8]}>
        <sphereGeometry args={[6, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#353538" roughness={0.95} />
      </mesh>
      <mesh position={[10, -0.5, -5]}>
        <sphereGeometry args={[7, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#404045" roughness={0.95} />
      </mesh>

      {/* Debris items - brighter colors */}
      {debris.map((item, i) => (
        <mesh
          key={i}
          position={item.position}
          rotation={item.rotation}
          scale={item.scale}
        >
          <boxGeometry args={[1, 1.3, 0.08]} />
          <meshStandardMaterial color={item.color} roughness={0.85} />
        </mesh>
      ))}

      {/* Atmospheric dust particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={500}
            array={new Float32Array(1500).map(() => (Math.random() - 0.5) * 60)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color="#8a8a8f" size={0.1} transparent opacity={0.4} />
      </points>
    </group>
  );
}

function ThreadsScene({
  visible,
  scrollProgress,
  reducedMotion,
}: {
  visible: boolean;
  scrollProgress: number;
  reducedMotion: boolean;
}) {
  const threadsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (threadsRef.current && !reducedMotion) {
      threadsRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  const threads = useMemo(() => {
    const items = [];
    for (let i = 0; i < 60; i++) {
      const startAngle = Math.random() * Math.PI * 2;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(
          Math.cos(startAngle) * 8,
          -6,
          Math.sin(startAngle) * 8
        ),
        new THREE.Vector3(
          Math.cos(startAngle + 0.5) * 5,
          -2,
          Math.sin(startAngle + 0.5) * 5
        ),
        new THREE.Vector3(
          Math.cos(startAngle + 1) * 3,
          2,
          Math.sin(startAngle + 1) * 3
        ),
        new THREE.Vector3(
          Math.cos(startAngle + 1.5) * 4,
          6,
          Math.sin(startAngle + 1.5) * 4
        ),
      ]);
      items.push({
        curve,
        color: ['#f0ede8', '#b0b0b8', '#e06040', '#5090b0'][Math.floor(Math.random() * 4)],
      });
    }
    return items;
  }, []);

  if (!visible) return null;

  return (
    <group ref={threadsRef}>
      {threads.map((thread, i) => (
        <mesh key={i}>
          <tubeGeometry args={[thread.curve, 32, 0.03, 8, false]} />
          <meshStandardMaterial 
            color={thread.color} 
            roughness={0.7}
            emissive={thread.color}
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}

      {/* Floating labels */}
      {[...Array(8)].map((_, i) => (
        <mesh
          key={`label-${i}`}
          position={[
            Math.cos(i * 0.8) * 6,
            Math.sin(i * 1.2) * 4,
            Math.sin(i * 0.8) * 6,
          ]}
          rotation={[Math.random(), Math.random(), Math.random()]}
        >
          <planeGeometry args={[0.8, 0.4]} />
          <meshStandardMaterial 
            color="#f5f3f0" 
            roughness={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function FibersScene({
  visible,
  scrollProgress,
  reducedMotion,
}: {
  visible: boolean;
  scrollProgress: number;
  reducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && !reducedMotion) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.1;
    }
  });

  const polymers = useMemo(() => {
    const items = [];
    // Create a double helix pattern
    for (let i = 0; i < 80; i++) {
      const t = i * 0.15;
      const radius = 3 + Math.sin(t * 0.5) * 2;
      items.push({
        position: [
          Math.cos(t) * radius,
          t - 6,
          Math.sin(t) * radius,
        ] as [number, number, number],
        scale: 0.08 + Math.random() * 0.12,
      });
    }
    return items;
  }, []);

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {/* Polymer chain visualization - DNA-like helix */}
      {polymers.map((p, i) => (
        <mesh key={i} position={p.position}>
          <sphereGeometry args={[p.scale, 12, 12]} />
          <meshStandardMaterial
            color="#ff7040"
            roughness={0.3}
            metalness={0.4}
            emissive="#ff6b35"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}

      {/* Connecting bonds */}
      {polymers.slice(0, -1).map((p, i) => {
        const next = polymers[i + 1];
        const start = new THREE.Vector3(...p.position);
        const end = new THREE.Vector3(...next.position);
        const mid = start.clone().lerp(end, 0.5);
        const length = start.distanceTo(end);
        const direction = end.clone().sub(start).normalize();
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction
        );

        return (
          <mesh
            key={`bond-${i}`}
            position={mid}
            quaternion={quaternion}
          >
            <cylinderGeometry args={[0.02, 0.02, length, 8]} />
            <meshStandardMaterial
              color="#ff9060"
              transparent
              opacity={0.6}
            />
          </mesh>
        );
      })}

      {/* Background fibers */}
      {[...Array(30)].map((_, i) => {
        const angle = (i / 30) * Math.PI * 2;
        return (
          <mesh
            key={`fiber-${i}`}
            position={[Math.cos(angle) * 12, 0, Math.sin(angle) * 12]}
            rotation={[Math.random(), angle, Math.random()]}
          >
            <cylinderGeometry args={[0.05, 0.05, 8, 8]} />
            <meshStandardMaterial color="#606068" transparent opacity={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}

function WashScene({
  visible,
  scrollProgress,
  reducedMotion,
}: {
  visible: boolean;
  scrollProgress: number;
  reducedMotion: boolean;
}) {
  const particlesRef = useRef<THREE.Points>(null);
  const drumRef = useRef<THREE.Group>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(2400);
    for (let i = 0; i < 800; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 1.5 + Math.random() * 4;
      const y = (Math.random() - 0.5) * 12;
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * radius;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (!reducedMotion) {
      if (drumRef.current) {
        drumRef.current.rotation.z = state.clock.elapsedTime * 0.3;
      }
      if (particlesRef.current) {
        particlesRef.current.rotation.y = state.clock.elapsedTime * 0.15;
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < 800; i++) {
          positions[i * 3 + 1] -= 0.03;
          if (positions[i * 3 + 1] < -6) {
            positions[i * 3 + 1] = 6;
          }
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });

  if (!visible) return null;

  return (
    <group>
      {/* Washing machine drum - more visible */}
      <group ref={drumRef} position={[0, 0, 0]}>
        <mesh>
          <torusGeometry args={[5, 0.4, 16, 48]} />
          <meshStandardMaterial
            color="#505058"
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
        
        {/* Drum holes */}
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 5, Math.sin(angle) * 5, 0]}
            >
              <circleGeometry args={[0.3, 16]} />
              <meshStandardMaterial color="#303038" side={THREE.DoubleSide} />
            </mesh>
          );
        })}
      </group>

      {/* Glass door effect */}
      <mesh position={[0, 0, 2]}>
        <circleGeometry args={[5.5, 48]} />
        <meshStandardMaterial
          color="#4080a0"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Microfiber particles - brighter blue */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={800}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#60a0d0"
          size={0.08}
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>

      {/* Water swirl effect */}
      <mesh position={[0, -4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 2, 8, 32]} />
        <meshStandardMaterial
          color="#4080a0"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function OceanScene({
  visible,
  scrollProgress,
  reducedMotion,
}: {
  visible: boolean;
  scrollProgress: number;
  reducedMotion: boolean;
}) {
  const gyreRef = useRef<THREE.Group>(null);
  const oceanRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!reducedMotion) {
      if (gyreRef.current) {
        gyreRef.current.rotation.y = state.clock.elapsedTime * 0.08;
      }
      if (oceanRef.current) {
        const positions = oceanRef.current.geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const z = positions.getZ(i);
          positions.setY(
            i,
            Math.sin(x * 0.3 + state.clock.elapsedTime * 0.5) * 0.8 +
              Math.sin(z * 0.2 + state.clock.elapsedTime * 0.4) * 0.5
          );
        }
        positions.needsUpdate = true;
      }
    }
  });

  const debrisParticles = useMemo(() => {
    const items = [];
    for (let i = 0; i < 400; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 18;
      items.push({
        position: [
          Math.cos(angle) * radius,
          Math.random() * 3 - 1.5,
          Math.sin(angle) * radius,
        ] as [number, number, number],
        scale: 0.03 + Math.random() * 0.08,
        color: ['#f0ede8', '#e06040', '#60a0d0'][Math.floor(Math.random() * 3)],
      });
    }
    return items;
  }, []);

  if (!visible) return null;

  return (
    <group>
      {/* Ocean surface - brighter */}
      <mesh ref={oceanRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <planeGeometry args={[100, 100, 48, 48]} />
        <meshStandardMaterial
          color="#2860a0"
          roughness={0.2}
          metalness={0.15}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Gyre visualization */}
      <group ref={gyreRef} position={[0, 0, 0]}>
        {/* Spiral rings */}
        {[...Array(6)].map((_, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, (i * Math.PI) / 6]}>
            <torusGeometry args={[6 + i * 2.5, 0.15, 8, 64]} />
            <meshStandardMaterial
              color="#ff7040"
              transparent
              opacity={0.5 - i * 0.07}
              emissive="#ff6b35"
              emissiveIntensity={0.2}
            />
          </mesh>
        ))}

        {/* Debris particles */}
        {debrisParticles.map((p, i) => (
          <mesh key={i} position={p.position}>
            <sphereGeometry args={[p.scale, 6, 6]} />
            <meshStandardMaterial color={p.color} roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Depth gradient */}
      <mesh position={[0, -10, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#102040" />
      </mesh>
    </group>
  );
}

function MethaneScene({
  visible,
  scrollProgress,
  reducedMotion,
}: {
  visible: boolean;
  scrollProgress: number;
  reducedMotion: boolean;
}) {
  const plumesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (plumesRef.current && !reducedMotion) {
      plumesRef.current.children.forEach((child, i) => {
        child.position.y += 0.03;
        const mesh = child as THREE.Mesh;
        mesh.scale.x = 1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.15;
        mesh.scale.z = 1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.15;
        if (child.position.y > 35) {
          child.position.y = 0;
        }
      });
    }
  });

  if (!visible) return null;

  return (
    <group>
      {/* Landfill ground with more detail */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#252528" roughness={1} />
      </mesh>

      {/* Landfill mounds */}
      {[...Array(5)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(i * 1.2) * 20,
            -3,
            Math.sin(i * 1.2) * 20,
          ]}
        >
          <coneGeometry args={[8, 6, 16]} />
          <meshStandardMaterial color="#353538" roughness={0.95} />
        </mesh>
      ))}

      {/* Methane plumes - more visible green tint */}
      <group ref={plumesRef}>
        {[...Array(25)].map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 50,
              Math.random() * 25,
              (Math.random() - 0.5) * 50,
            ]}
          >
            <coneGeometry args={[2.5, 10, 16, 1, true]} />
            <meshStandardMaterial
              color="#50a070"
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
              emissive="#40a060"
              emissiveIntensity={0.15}
            />
          </mesh>
        ))}
      </group>

      {/* Atmospheric haze */}
      <mesh position={[0, 15, 0]}>
        <sphereGeometry args={[60, 32, 32]} />
        <meshStandardMaterial
          color="#405040"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

function GlobalScene({
  visible,
  scrollProgress,
  reducedMotion,
}: {
  visible: boolean;
  scrollProgress: number;
  reducedMotion: boolean;
}) {
  const globeRef = useRef<THREE.Mesh>(null);
  const emissionsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!reducedMotion) {
      if (globeRef.current) {
        globeRef.current.rotation.y = state.clock.elapsedTime * 0.04;
      }
      if (emissionsRef.current) {
        emissionsRef.current.rotation.y = -state.clock.elapsedTime * 0.02;
      }
    }
  });

  if (!visible) return null;

  return (
    <group>
      {/* Earth sphere - more vibrant */}
      <mesh ref={globeRef} position={[0, 0, 0]}>
        <sphereGeometry args={[18, 64, 64]} />
        <meshStandardMaterial
          color="#2870a0"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Continents overlay */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[18.2, 48, 48]} />
        <meshStandardMaterial
          color="#40a060"
          roughness={0.9}
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Emissions layer */}
      <group ref={emissionsRef}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[22, 32, 32]} />
          <meshStandardMaterial
            color="#ff6b35"
            transparent
            opacity={0.12}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Emission hotspots - brighter */}
        {[...Array(40)].map((_, i) => {
          const phi = Math.acos(-1 + (2 * i) / 40);
          const theta = Math.sqrt(40 * Math.PI) * phi;
          return (
            <mesh
              key={i}
              position={[
                20 * Math.sin(phi) * Math.cos(theta),
                20 * Math.sin(phi) * Math.sin(theta),
                20 * Math.cos(phi),
              ]}
            >
              <sphereGeometry args={[0.6, 12, 12]} />
              <meshStandardMaterial
                color="#ff6b35"
                emissive="#ff6b35"
                emissiveIntensity={0.7}
              />
            </mesh>
          );
        })}
      </group>

      {/* Orbital rings */}
      <mesh rotation={[Math.PI / 6, 0, 0]}>
        <torusGeometry args={[28, 0.1, 8, 64]} />
        <meshStandardMaterial color="#808090" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function FinalScene({
  visible,
  scrollProgress,
  reducedMotion,
}: {
  visible: boolean;
  scrollProgress: number;
  reducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && !reducedMotion) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {/* Mended shirt - glowing with hope */}
      <Float speed={reducedMotion ? 0 : 1} rotationIntensity={0.08} floatIntensity={0.2}>
        <group position={[0, 0, 0]}>
          {/* Shirt body - brighter */}
          <mesh>
            <boxGeometry args={[2.5, 3, 0.18]} />
            <meshStandardMaterial
              color="#f8f6f2"
              roughness={0.75}
              emissive="#40a070"
              emissiveIntensity={0.08}
            />
          </mesh>

          {/* Sleeves */}
          <mesh position={[-1.6, 0.8, 0]} rotation={[0, 0, Math.PI / 5]}>
            <boxGeometry args={[1, 0.6, 0.15]} />
            <meshStandardMaterial color="#f8f6f2" roughness={0.75} />
          </mesh>
          <mesh position={[1.6, 0.8, 0]} rotation={[0, 0, -Math.PI / 5]}>
            <boxGeometry args={[1, 0.6, 0.15]} />
            <meshStandardMaterial color="#f8f6f2" roughness={0.75} />
          </mesh>

          {/* Visible mend/repair patches - decorative */}
          <mesh position={[0.4, -0.3, 0.1]}>
            <boxGeometry args={[0.5, 0.6, 0.02]} />
            <meshStandardMaterial
              color="#50a080"
              emissive="#40a070"
              emissiveIntensity={0.4}
            />
          </mesh>
          <mesh position={[-0.3, 0.4, 0.1]}>
            <boxGeometry args={[0.35, 0.35, 0.02]} />
            <meshStandardMaterial
              color="#60b090"
              emissive="#50a080"
              emissiveIntensity={0.3}
            />
          </mesh>

          {/* Circular arrows - recycle/reuse symbol */}
          <group position={[0, 0, 0.25]} rotation={[0, 0, 0]}>
            <mesh>
              <torusGeometry args={[0.7, 0.06, 8, 32]} />
              <meshStandardMaterial
                color="#50a080"
                emissive="#40a070"
                emissiveIntensity={0.5}
              />
            </mesh>
            {[0, 1, 2].map((i) => (
              <mesh
                key={i}
                position={[
                  Math.cos((i * Math.PI * 2) / 3) * 0.7,
                  Math.sin((i * Math.PI * 2) / 3) * 0.7,
                  0,
                ]}
                rotation={[0, 0, (i * Math.PI * 2) / 3 - Math.PI / 2]}
              >
                <coneGeometry args={[0.15, 0.3, 8]} />
                <meshStandardMaterial
                  color="#50a080"
                  emissive="#40a070"
                  emissiveIntensity={0.5}
                />
              </mesh>
            ))}
          </group>
        </group>
      </Float>

      {/* Ambient particles - hope/renewal */}
      <Stars
        radius={40}
        depth={15}
        count={400}
        factor={4}
        saturation={0.8}
        fade
        speed={reducedMotion ? 0 : 0.4}
      />

      {/* Warm hopeful glow */}
      <pointLight position={[0, 0, 8]} intensity={1.5} color="#50a080" distance={25} />
      <pointLight position={[0, 5, 0]} intensity={0.8} color="#f8f6f2" distance={20} />
    </group>
  );
}
