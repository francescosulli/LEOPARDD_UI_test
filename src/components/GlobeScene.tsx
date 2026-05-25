import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, OrbitControls, Stars } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import { Color, Vector3 } from 'three';
import DebrisCloud from './DebrisCloud';
import Earth from './Earth';
import OrbitTrail from './OrbitTrail';
import SatelliteMarker from './SatelliteMarker';
import type { ConjunctionEvent, DebrisFrame, DebrisObject, SatelliteState, Vec3 } from '../types/orbital';
import { kmToSceneTuple } from '../utils/math';

type GlobeSceneProps = {
  debrisObjects: DebrisObject[];
  debrisFrame?: DebrisFrame;
  debrisFrames: DebrisFrame[];
  userState?: SatelliteState;
  userTrail: SatelliteState[];
  selectedEvent?: ConjunctionEvent | null;
};

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.32} />
      <directionalLight position={[5, 3, 6]} intensity={1.65} color="#fff7ed" />
      <pointLight position={[-5, -4, -3]} intensity={0.55} color="#ef7d17" />
    </>
  );
}

function FocusController({ selectedEvent }: { selectedEvent?: ConjunctionEvent | null }) {
  const { camera, controls } = useThree() as never as {
    camera: { position: Vector3; lookAt: (target: Vector3) => void };
    controls?: { target: Vector3; update: () => void };
  };
  const target = useMemo(() => {
    if (!selectedEvent) {
      return null;
    }

    const midpoint: Vec3 = {
      x: (selectedEvent.userPositionKm.x + selectedEvent.debrisPositionKm.x) / 2,
      y: (selectedEvent.userPositionKm.y + selectedEvent.debrisPositionKm.y) / 2,
      z: (selectedEvent.userPositionKm.z + selectedEvent.debrisPositionKm.z) / 2,
    };
    return new Vector3(...kmToSceneTuple(midpoint));
  }, [selectedEvent]);

  useFrame((_, delta) => {
    if (!target) {
      return;
    }

    const desired = target.clone().normalize().multiplyScalar(7.2).add(target);
    camera.position.lerp(desired, Math.min(1, delta * 1.8));

    if (controls) {
      controls.target.lerp(target, Math.min(1, delta * 2.6));
      controls.update();
    } else {
      camera.lookAt(target);
    }
  });

  return null;
}

function RiskConnector({ selectedEvent }: { selectedEvent?: ConjunctionEvent | null }) {
  if (!selectedEvent) {
    return null;
  }

  return (
    <Line
      points={[kmToSceneTuple(selectedEvent.userPositionKm), kmToSceneTuple(selectedEvent.debrisPositionKm)]}
      color={selectedEvent.riskLevel === 'Critical' ? '#ff4d6d' : '#ff9b3d'}
      lineWidth={2.4}
      transparent
      opacity={0.86}
    />
  );
}

export default function GlobeScene({
  debrisObjects,
  debrisFrame,
  debrisFrames,
  userState,
  userTrail,
  selectedEvent,
}: GlobeSceneProps) {
  const selectedDebrisTrail = useMemo(() => {
    if (!selectedEvent) {
      return [];
    }

    return debrisFrames
      .map((frame) => {
        const offset = selectedEvent.debrisIndex * 3;

        return {
          x: frame.positionsKm[offset],
          y: frame.positionsKm[offset + 1],
          z: frame.positionsKm[offset + 2],
        };
      })
      .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.z));
  }, [debrisFrames, selectedEvent]);
  const pulse = selectedEvent?.riskLevel === 'Critical' || selectedEvent?.riskLevel === 'High';

  return (
    <div className="absolute inset-0 bg-astro-950">
      <Canvas camera={{ position: [0, 4.4, 7.2], fov: 46 }} gl={{ antialias: true, alpha: false }}>
        <color attach="background" args={['#030711']} />
        <fog attach="fog" args={[new Color('#030711'), 8, 18]} />
        <Suspense fallback={null}>
          <Stars radius={120} depth={56} count={4600} factor={4.2} saturation={0.35} fade speed={0.45} />
          <SceneLights />
          <Earth />
          <DebrisCloud
            positionsKm={debrisFrame?.positionsKm}
            highlightedIndex={selectedEvent?.debrisIndex ?? null}
            riskPulse={pulse}
          />
          <OrbitTrail states={userTrail} color="#ff9b3d" opacity={0.92} />
          <OrbitTrail points={selectedDebrisTrail} color="#fff7ed" opacity={0.46} />
          <SatelliteMarker state={userState} />
          <RiskConnector selectedEvent={selectedEvent} />
          <FocusController selectedEvent={selectedEvent} />
          <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={3.2} maxDistance={13} />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-0 grid-mask opacity-60" />
      <div className="pointer-events-none absolute inset-0 scanlines" />
      <div className="pointer-events-none absolute left-5 top-5 rounded border border-astro-orange/15 bg-black/24 px-3 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-white/70">
        Oggetti renderizzati: {debrisObjects.length}
      </div>
    </div>
  );
}
