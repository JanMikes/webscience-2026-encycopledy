import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useRef } from "react";
import * as THREE from "three";

export default function BattleArena3D({ critPulse = 0 }: { critPulse?: number }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 3.2, 9.5], fov: 42 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 2]}
    >
      <color attach="background" args={["#06060e"]} />
      <fog attach="fog" args={["#06060e", 9, 26]} />

      <ambientLight intensity={0.25} />
      <hemisphereLight args={["#ff1f7a", "#0e0e1c", 0.5]} />
      <directionalLight position={[6, 10, 6]} intensity={1.2} color="#fff" castShadow />
      <pointLight position={[-4, 2, 2]} intensity={2.5} color="#ff1f7a" distance={14} />
      <pointLight position={[4, 2, 2]} intensity={2.5} color="#00e5ff" distance={14} />
      <pointLight position={[0, 6, -3]} intensity={1.4} color="#c0ff00" distance={20} />

      <CinematicCamera />
      <Floor />
      <Platform position={[-3.2, 0, 0]} color="#ff1f7a" />
      <Platform position={[3.2, 0, 0]} color="#00e5ff" />
      <BackWall />

      <EffectComposer multisampling={0}>
        <Bloom intensity={1.6} luminanceThreshold={0.18} luminanceSmoothing={0.4} mipmapBlur />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[0.0008 + critPulse * 0.004, 0.0008 + critPulse * 0.004]}
        />
        <Vignette eskil={false} offset={0.2} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
}

function CinematicCamera() {
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime();
    camera.position.x = Math.sin(t * 0.15) * 0.55;
    camera.position.y = 3.2 + Math.sin(t * 0.3) * 0.15;
    camera.lookAt(0, 1.1, 0);
  });
  return null;
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial color="#0a0a18" metalness={0.55} roughness={0.4} />
      {/* grid */}
      <GridLines />
    </mesh>
  );
}

function GridLines() {
  // Wireframe overlay using a separate plane positioned just above
  return null;
}

function Platform({ position, color }: { position: [number, number, number]; color: string }) {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ringRef.current) ringRef.current.rotation.z = clock.getElapsedTime() * 0.4;
  });
  return (
    <group position={position}>
      {/* base cylinder */}
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <cylinderGeometry args={[1.4, 1.6, 0.16, 48]} />
        <meshStandardMaterial color="#13132a" metalness={0.7} roughness={0.2} emissive={color} emissiveIntensity={0.18} />
      </mesh>
      {/* glowing ring on top */}
      <mesh ref={ringRef} position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.15, 1.3, 64]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.85} toneMapped={false} />
      </mesh>
      {/* light beam pillar */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.05, 0.5, 5, 24, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  );
}

function BackWall() {
  return (
    <group position={[0, 2.5, -5]}>
      {Array.from({ length: 14 }).map((_, i) => {
        const x = (i - 6.5) * 1.3;
        return (
          <mesh key={i} position={[x, Math.sin(i * 0.7) * 0.3, 0]}>
            <boxGeometry args={[0.05, 4 + Math.sin(i) * 1.5, 0.05]} />
            <meshBasicMaterial color={i % 2 ? "#ff1f7a" : "#00e5ff"} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}
