import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';
import type { SatelliteState } from '../types/orbital';
import { kmToSceneTuple } from '../utils/math';

type SatelliteMarkerProps = {
  state?: SatelliteState;
};

export default function SatelliteMarker({ state }: SatelliteMarkerProps) {
  const groupRef = useRef<Group>(null);
  const modelRef = useRef<Group>(null);

  useFrame(({ camera, clock }) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.lookAt(camera.position);

    if (modelRef.current) {
      modelRef.current.rotation.z = Math.sin(clock.elapsedTime * 1.15) * 0.18;
      modelRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.7) * 0.22;
    }
  });

  if (!state) {
    return null;
  }

  return (
    <group ref={groupRef} position={kmToSceneTuple(state.positionKm)}>
      <group ref={modelRef} scale={1.34}>
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
    </group>
  );
}
