import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import { Box3, type Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import type { SatelliteState } from '../types/orbital';
import { kmToSceneTuple } from '../utils/math';

type SatelliteMarkerProps = {
  state?: SatelliteState;
};

const ASTREO_MODEL_PATH = `${import.meta.env.BASE_URL}models/CubeSat_Unico_PV_Fondo.glb`;

// Preload the Astreo CubeSat GLTF model
useGLTF.preload(ASTREO_MODEL_PATH);

function AstreoGLBModel() {
  const { scene } = useGLTF(ASTREO_MODEL_PATH);

  const { clonedScene, scaleFactor, centerOffset } = useMemo(() => {
    const clone = scene.clone(true);
    const box = new Box3().setFromObject(clone);
    const size = new Vector3();
    box.getSize(size);
    const center = new Vector3();
    box.getCenter(center);

    // Boost material responsiveness under scene lighting
    clone.traverse((child) => {
      if (child instanceof Mesh && child.material) {
        const mat = child.material;
        if (mat instanceof MeshStandardMaterial) {
          mat.roughness = Math.min(mat.roughness, 0.45);
          mat.metalness = Math.max(mat.metalness, 0.4);
          mat.envMapIntensity = 1.5;
        }
      }
    });

    // Make size prominent and well-proportioned (~0.58 scene units)
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? 0.58 / maxDim : 1;

    return {
      clonedScene: clone,
      scaleFactor: scale,
      centerOffset: [-center.x, -center.y, -center.z] as [number, number, number],
    };
  }, [scene]);

  return (
    <group>
      <group scale={scaleFactor}>
        <primitive object={clonedScene} position={centerOffset} />
      </group>

      {/* Astreo Telemetry Beacon */}
      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.014, 16, 16]} />
        <meshBasicMaterial color="#ef7d17" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.028, 12, 12]} />
        <meshBasicMaterial color="#ff9b3d" transparent opacity={0.35} toneMapped={false} />
      </mesh>
    </group>
  );
}

function HubbleModel() {
  return (
    <group scale={0.88}>
      {/* Main Optical Telescope Barrel (Forward Cylinder) */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.052, 0.052, 0.26, 24]} />
        <meshStandardMaterial color="#f1f5f9" metalness={0.92} roughness={0.14} />
      </mesh>

      {/* Aft Shroud / Equipment Bay (Wider Rear Cylinder) */}
      <mesh position={[0, -0.11, 0]}>
        <cylinderGeometry args={[0.068, 0.068, 0.16, 24]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Primary Mirror Aperture Cavity (Dark Interior) */}
      <mesh position={[0, 0.21, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.018, 24]} />
        <meshBasicMaterial color="#020617" />
      </mesh>

      {/* Secondary Mirror Spider Support */}
      <mesh position={[0, 0.205, 0]}>
        <boxGeometry args={[0.09, 0.004, 0.004]} />
        <meshBasicMaterial color="#475569" />
      </mesh>
      <mesh position={[0, 0.205, 0]}>
        <boxGeometry args={[0.004, 0.004, 0.09]} />
        <meshBasicMaterial color="#475569" />
      </mesh>

      {/* Aperture Door (Tilted Open Lid) */}
      <mesh position={[0, 0.24, 0.04]} rotation={[0.45, 0, 0]}>
        <cylinderGeometry args={[0.054, 0.054, 0.005, 24]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.24, 0.042]} rotation={[0.45, 0, 0]}>
        <cylinderGeometry args={[0.048, 0.048, 0.004, 24]} />
        <meshBasicMaterial color="#d97706" toneMapped={false} />
      </mesh>

      {/* 2 Solar Array Wings (Roll-Out Solar Panels) */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.07, -0.01, 0]}>
          {/* Mounting Boom */}
          <mesh position={[side * 0.045, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.005, 0.005, 0.09, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Solar Panel Wing */}
          <mesh position={[side * 0.16, 0, 0]}>
            <boxGeometry args={[0.15, 0.36, 0.004]} />
            <meshStandardMaterial
              color="#0f2b4c"
              emissive="#0284c7"
              emissiveIntensity={0.35}
              metalness={0.65}
              roughness={0.25}
            />
          </mesh>
          {/* Solar Panel Grid Line Accent */}
          <mesh position={[side * 0.16, 0, 0.003]}>
            <boxGeometry args={[0.154, 0.364, 0.002]} />
            <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.55} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* 2 High Gain Dish Antennas (HGA) */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.08, 0.06, -0.04]} rotation={[0, side * 0.45, side * 0.35]}>
          <mesh position={[side * 0.04, 0.03, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.08, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.85} />
          </mesh>
          <mesh position={[side * 0.08, 0.05, 0]} rotation={[0, 0, side * -0.5]}>
            <sphereGeometry args={[0.026, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.12} />
          </mesh>
        </group>
      ))}

      {/* Status Beacon */}
      <mesh position={[0, -0.2, 0.07]}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshBasicMaterial color="#38bdf8" toneMapped={false} />
      </mesh>
    </group>
  );
}

function StarlinkModel() {
  return (
    <group scale={1.6}>
      {/* Flat-Pack Main Chassis (Distinctive Thin Rectangular Bus) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.26, 0.022, 0.14]} />
        <meshStandardMaterial color="#334155" metalness={0.88} roughness={0.18} />
      </mesh>

      {/* Chassis Metallic Edge Trim */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.266, 0.014, 0.146]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Earth-Facing Phased Array Antennas (Nadir Face) */}
      {[-0.065, 0.065].map((xPos) => (
        <group key={xPos} position={[xPos, -0.012, 0]}>
          <mesh>
            <boxGeometry args={[0.1, 0.005, 0.11]} />
            <meshStandardMaterial color="#475569" metalness={0.75} roughness={0.25} />
          </mesh>
          <mesh position={[0, -0.003, 0]}>
            <boxGeometry args={[0.09, 0.002, 0.1]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.65} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Single Large Extended Solar Array (Starlink Signature Wing) */}
      <group position={[0, 0, 0.07]}>
        {/* Hinge & Boom Mechanism */}
        <mesh position={[0, 0, 0.025]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.05, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} />
        </mesh>

        {/* Solar Wing (Single Long Array) */}
        <mesh position={[0, 0, 0.24]}>
          <boxGeometry args={[0.22, 0.005, 0.38]} />
          <meshStandardMaterial
            color="#091a30"
            emissive="#0284c7"
            emissiveIntensity={0.38}
            metalness={0.7}
            roughness={0.22}
          />
        </mesh>
        {/* Solar Cells Grid Overlay */}
        <mesh position={[0, 0.004, 0.24]}>
          <boxGeometry args={[0.224, 0.002, 0.384]} />
          <meshBasicMaterial color="#00f0ff" wireframe transparent opacity={0.5} toneMapped={false} />
        </mesh>
      </group>

      {/* Krypton / Argon Hall-Effect Ion Thruster (Rear Nozzle + Plasma Glow) */}
      <group position={[0, 0, -0.075]}>
        {/* Thruster Base */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.024, 0.015, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.92} />
        </mesh>
        {/* Ion Engine Plasma Plume Glow */}
        <mesh position={[0, 0, -0.024]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.018, 0.05, 16]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.95} toneMapped={false} />
        </mesh>
      </group>

      {/* Star Tracker Optical Sensor Hood */}
      <mesh position={[0.1, 0.018, -0.04]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.01, 0.018, 12]} />
        <meshBasicMaterial color="#ef7d17" toneMapped={false} />
      </mesh>
    </group>
  );
}

function ISSModel() {
  return (
    <group scale={0.45}>
      {/* Central Pressurized Modules */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 0.3, 16]} />
        <meshStandardMaterial color="#f0f4f8" metalness={0.75} roughness={0.2} />
      </mesh>
      {/* Transverse module */}
      <mesh position={[0, 0, 0.07]}>
        <cylinderGeometry args={[0.024, 0.024, 0.1, 12]} />
        <meshStandardMaterial color="#dbe5ee" metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Cupola */}
      <mesh position={[0, -0.032, 0.07]}>
        <sphereGeometry args={[0.015, 12, 12]} />
        <meshBasicMaterial color="#ef7d17" toneMapped={false} />
      </mesh>

      {/* Main Integrated Truss Structure (ITS) */}
      <mesh position={[0, 0.028, 0]}>
        <boxGeometry args={[0.68, 0.022, 0.022]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.88} roughness={0.18} />
      </mesh>

      {/* 4 Dual Solar Array Assemblies (8 Wings Total) */}
      {[-0.28, -0.18, 0.18, 0.28].map((xPos) => (
        <group key={xPos} position={[xPos, 0.028, 0]}>
          {/* Top Wing */}
          <mesh position={[0, 0.13, 0]}>
            <boxGeometry args={[0.078, 0.22, 0.004]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive="#c2410c"
              emissiveIntensity={0.26}
              roughness={0.3}
              metalness={0.55}
            />
          </mesh>
          <mesh position={[0, 0.13, 0.003]}>
            <boxGeometry args={[0.082, 0.224, 0.002]} />
            <meshBasicMaterial color="#ff9b3d" wireframe transparent opacity={0.5} toneMapped={false} />
          </mesh>

          {/* Bottom Wing */}
          <mesh position={[0, -0.13, 0]}>
            <boxGeometry args={[0.078, 0.22, 0.004]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive="#c2410c"
              emissiveIntensity={0.26}
              roughness={0.3}
              metalness={0.55}
            />
          </mesh>
          <mesh position={[0, -0.13, 0.003]}>
            <boxGeometry args={[0.082, 0.224, 0.002]} />
            <meshBasicMaterial color="#ff9b3d" wireframe transparent opacity={0.5} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Thermal Radiators */}
      {[-0.09, 0.09].map((xPos) => (
        <mesh key={xPos} position={[xPos, 0.028, -0.065]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.046, 0.005, 0.11]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.15} metalness={0.85} />
        </mesh>
      ))}

      {/* Status Beacon */}
      <mesh position={[0, 0.055, 0]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshBasicMaterial color="#38bdf8" toneMapped={false} />
      </mesh>
    </group>
  );
}

function StandardSatelliteModel() {
  return (
    <group scale={1.5}>
      <mesh>
        <boxGeometry args={[0.11, 0.085, 0.095]} />
        <meshStandardMaterial
          color="#f8efe2"
          emissive="#4d2206"
          emissiveIntensity={0.45}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>

      <mesh position={[0, 0, 0.055]}>
        <boxGeometry args={[0.062, 0.05, 0.01]} />
        <meshBasicMaterial color="#ef7d17" toneMapped={false} />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.17, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.19, 0.085, 0.007]} />
            <meshBasicMaterial color="#22446e" toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.045, 0.007]}>
            <boxGeometry args={[0.196, 0.005, 0.005]} />
            <meshBasicMaterial color="#ff9b3d" transparent opacity={0.8} toneMapped={false} />
          </mesh>
          <mesh position={[0, -0.045, 0.007]}>
            <boxGeometry args={[0.196, 0.005, 0.005]} />
            <meshBasicMaterial color="#ff9b3d" transparent opacity={0.8} toneMapped={false} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.078, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.005, 0.005, 0.095, 8]} />
        <meshBasicMaterial color="#fff7ed" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.13, 0]}>
        <sphereGeometry args={[0.014, 12, 12]} />
        <meshBasicMaterial color="#ff9b3d" toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function SatelliteMarker({ state }: SatelliteMarkerProps) {
  const groupRef = useRef<Group>(null);
  const modelRef = useRef<Group>(null);

  const nameUpper = state?.name?.toUpperCase() || '';
  const isISS = nameUpper.includes('ISS') || nameUpper.includes('ZARYA') || nameUpper.includes('STATION');
  const isHubble = nameUpper.includes('HUBBLE') || nameUpper.includes('HST');
  const isStarlink = nameUpper.includes('STARLINK');
  const isAstreo = !isISS && !isHubble && !isStarlink;

  useFrame(({ camera, clock }) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.lookAt(camera.position);

    if (modelRef.current) {
      modelRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.5) * 0.03;
      modelRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.3) * 0.03;
    }
  });

  if (!state) {
    return null;
  }

  return (
    <group ref={groupRef} position={kmToSceneTuple(state.positionKm)}>
      <group ref={modelRef}>
        {isISS ? (
          <ISSModel />
        ) : isHubble ? (
          <HubbleModel />
        ) : isStarlink ? (
          <StarlinkModel />
        ) : isAstreo ? (
          <Suspense fallback={<StandardSatelliteModel />}>
            <AstreoGLBModel />
          </Suspense>
        ) : (
          <StandardSatelliteModel />
        )}
      </group>
    </group>
  );
}


