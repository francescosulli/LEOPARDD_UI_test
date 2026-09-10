import { useRef } from 'react';
import { Group, SRGBColorSpace } from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { EARTH_SCENE_RADIUS } from '../utils/math';

export default function Earth() {
  const earthTexture = useTexture(
    `${import.meta.env.BASE_URL}textures/earth_atmos_2048.jpg`,
  );
  const groupRef = useRef<Group>(null);

  earthTexture.colorSpace = SRGBColorSpace;

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.055;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[EARTH_SCENE_RADIUS, 96, 96]} />
        <meshBasicMaterial map={earthTexture} />
      </mesh>
    </group>
  );
}


