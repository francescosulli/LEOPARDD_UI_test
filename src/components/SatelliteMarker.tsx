import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';
import type { SatelliteState } from '../types/orbital';
import { kmToSceneTuple } from '../utils/math';

type SatelliteMarkerProps = {
  state?: SatelliteState;
};

function ISSModel() {
  return (
    <group scale={1.25}>
      {/* Central Pressurized Modules (Zarya, Zvezda, Unity, Destiny, Columbus, Kibo) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.024, 0.024, 0.26, 16]} />
        <meshStandardMaterial color="#f0f4f8" metalness={0.72} roughness={0.24} />
      </mesh>
      {/* Transverse module (Harmony / Node 2) */}
      <mesh position={[0, 0, 0.06]}>
        <cylinderGeometry args={[0.02, 0.02, 0.08, 12]} />
        <meshStandardMaterial color="#dbe5ee" metalness={0.65} roughness={0.3} />
      </mesh>
      {/* Cupola / Docking Port Glow */}
      <mesh position={[0, -0.028, 0.06]}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshBasicMaterial color="#ef7d17" toneMapped={false} />
      </mesh>

      {/* Main Integrated Truss Structure (ITS) */}
      <mesh position={[0, 0.024, 0]}>
        <boxGeometry args={[0.56, 0.018, 0.018]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* 4 Dual Solar Array Assemblies (8 Wings Total) */}
      {[-0.23, -0.15, 0.15, 0.23].map((xPos) => (
        <group key={xPos} position={[xPos, 0.024, 0]}>
          {/* Top Wing */}
          <mesh position={[0, 0.11, 0]}>
            <boxGeometry args={[0.064, 0.18, 0.003]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive="#c2410c"
              emissiveIntensity={0.22}
              roughness={0.35}
              metalness={0.5}
            />
          </mesh>
          {/* Top Wing Photovoltaic Grid Accent */}
          <mesh position={[0, 0.11, 0.002]}>
            <boxGeometry args={[0.068, 0.184, 0.002]} />
            <meshBasicMaterial color="#ff9b3d" wireframe transparent opacity={0.45} toneMapped={false} />
          </mesh>

          {/* Bottom Wing */}
          <mesh position={[0, -0.11, 0]}>
            <boxGeometry args={[0.064, 0.18, 0.003]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive="#c2410c"
              emissiveIntensity={0.22}
              roughness={0.35}
              metalness={0.5}
            />
          </mesh>
          {/* Bottom Wing Photovoltaic Grid Accent */}
          <mesh position={[0, -0.11, 0.002]}>
            <boxGeometry args={[0.068, 0.184, 0.002]} />
            <meshBasicMaterial color="#ff9b3d" wireframe transparent opacity={0.45} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Thermal Radiators (Central Truss) */}
      {[-0.07, 0.07].map((xPos) => (
        <mesh key={xPos} position={[xPos, 0.024, -0.055]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.038, 0.004, 0.09]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.8} />
        </mesh>
      ))}

      {/* Status Beacon LED */}
      <mesh position={[0, 0.045, 0]}>
        <sphereGeometry args={[0.009, 8, 8]} />
        <meshBasicMaterial color="#38bdf8" toneMapped={false} />
      </mesh>
    </group>
  );
}

function StandardSatelliteModel() {
  return (
    <group scale={1.34}>
      <mesh>
        <boxGeometry args={[0.09, 0.07, 0.08]} />
        <meshStandardMaterial
          color="#f8efe2"
          emissive="#4d2206"
          emissiveIntensity={0.45}
          metalness={0.55}
          roughness={0.28}
        />
      </mesh>

      <mesh position={[0, 0, 0.047]}>
        <boxGeometry args={[0.052, 0.042, 0.008]} />
        <meshBasicMaterial color="#ef7d17" toneMapped={false} />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.142, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.16, 0.072, 0.006]} />
            <meshBasicMaterial color="#22446e" toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.038, 0.006]}>
            <boxGeometry args={[0.166, 0.004, 0.004]} />
            <meshBasicMaterial color="#ff9b3d" transparent opacity={0.72} toneMapped={false} />
          </mesh>
          <mesh position={[0, -0.038, 0.006]}>
            <boxGeometry args={[0.166, 0.004, 0.004]} />
            <meshBasicMaterial color="#ff9b3d" transparent opacity={0.72} toneMapped={false} />
          </mesh>
          <mesh position={[side * 0.083, 0, 0.006]}>
            <boxGeometry args={[0.005, 0.078, 0.004]} />
            <meshBasicMaterial color="#ff9b3d" transparent opacity={0.72} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, 0.004]}>
            <boxGeometry args={[0.154, 0.006, 0.004]} />
            <meshBasicMaterial color="#ff9b3d" transparent opacity={0.72} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.024, 0.004]}>
            <boxGeometry args={[0.154, 0.004, 0.004]} />
            <meshBasicMaterial color="#fff7ed" transparent opacity={0.38} toneMapped={false} />
          </mesh>
          <mesh position={[0, -0.024, 0.004]}>
            <boxGeometry args={[0.154, 0.004, 0.004]} />
            <meshBasicMaterial color="#fff7ed" transparent opacity={0.38} toneMapped={false} />
          </mesh>
          <mesh position={[side * -0.04, 0, 0.004]}>
            <boxGeometry args={[0.005, 0.066, 0.004]} />
            <meshBasicMaterial color="#fff7ed" transparent opacity={0.35} toneMapped={false} />
          </mesh>
          <mesh position={[side * 0.04, 0, 0.004]}>
            <boxGeometry args={[0.005, 0.066, 0.004]} />
            <meshBasicMaterial color="#fff7ed" transparent opacity={0.35} toneMapped={false} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.065, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.004, 0.004, 0.08, 8]} />
        <meshBasicMaterial color="#fff7ed" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.112, 0]}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshBasicMaterial color="#ff9b3d" toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function SatelliteMarker({ state }: SatelliteMarkerProps) {
  const groupRef = useRef<Group>(null);
  const modelRef = useRef<Group>(null);

  const isISS = Boolean(state?.name && /iss|station|zarya/i.test(state.name));

  useFrame(({ camera, clock }) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.lookAt(camera.position);

    if (modelRef.current) {
      modelRef.current.rotation.z = Math.sin(clock.elapsedTime * 1.15) * 0.14;
      modelRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.7) * 0.18;
    }
  });

  if (!state) {
    return null;
  }

  return (
    <group ref={groupRef} position={kmToSceneTuple(state.positionKm)}>
      <group ref={modelRef}>
        {isISS ? <ISSModel /> : <StandardSatelliteModel />}
      </group>
    </group>
  );
}
