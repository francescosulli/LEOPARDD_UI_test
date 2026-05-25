import { useRef } from 'react';
import { AdditiveBlending, BackSide, Group, Mesh, SRGBColorSpace } from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { EARTH_SCENE_RADIUS } from '../utils/math';

export default function Earth() {
  const [earthTexture, cloudTexture] = useTexture([
    '/textures/earth_atmos_2048.jpg',
    '/textures/earth_clouds_1024.png',
  ]);
  const groupRef = useRef<Group>(null);
  const cloudRef = useRef<Mesh>(null);

  earthTexture.colorSpace = SRGBColorSpace;
  cloudTexture.colorSpace = SRGBColorSpace;

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.055;
    }

    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.075;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[EARTH_SCENE_RADIUS, 96, 96]} />
        <meshStandardMaterial map={earthTexture} roughness={0.78} metalness={0.02} />
      </mesh>
      <mesh ref={cloudRef} scale={1.012}>
        <sphereGeometry args={[EARTH_SCENE_RADIUS, 96, 96]} />
        <meshStandardMaterial
          map={cloudTexture}
          transparent
          opacity={0.34}
          depthWrite={false}
          roughness={0.92}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[EARTH_SCENE_RADIUS * 1.006, 96, 96]} />
        <meshBasicMaterial color="#ff9b3d" wireframe transparent opacity={0.03} />
      </mesh>
      <mesh scale={1.06}>
        <sphereGeometry args={[EARTH_SCENE_RADIUS, 96, 96]} />
        <meshBasicMaterial
          color="#ef7d17"
          transparent
          opacity={0.16}
          side={BackSide}
          blending={AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
