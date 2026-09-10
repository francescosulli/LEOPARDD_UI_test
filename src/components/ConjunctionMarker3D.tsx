import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import type { Mesh, PointLight } from 'three';
import type { ConjunctionEvent } from '../types/orbital';
import { kmToSceneTuple } from '../utils/math';
import { formatDateTime, formatKm } from '../utils/formatting';
import { useLanguage } from '../i18n/LanguageContext';

type ConjunctionMarker3DProps = {
  event: ConjunctionEvent;
  currentTimestamp?: number;
  onJumpToTca?: (timestamp: number) => void;
};

export default function ConjunctionMarker3D({
  event,
  currentTimestamp,
  onJumpToTca,
}: ConjunctionMarker3DProps) {
  const { language, t } = useLanguage();
  const ringRef = useRef<Mesh>(null);
  const lightRef = useRef<PointLight>(null);

  const isCritical = event.riskLevel === 'Critical';
  const isHigh = event.riskLevel === 'High';
  const colorHex = isCritical ? '#ff2a55' : isHigh ? '#ff8800' : '#f59e0b';

  const userPos = kmToSceneTuple(event.userPositionKm);
  const debrisPos = kmToSceneTuple(event.debrisPositionKm);

  const midpoint: [number, number, number] = [
    (userPos[0] + debrisPos[0]) / 2,
    (userPos[1] + debrisPos[1]) / 2,
    (userPos[2] + debrisPos[2]) / 2,
  ];

  // Time difference in seconds between current simulation time and TCA
  const diffSec = currentTimestamp
    ? (event.closestApproachTime - currentTimestamp) / 1000
    : 0;
  const isAtTca = currentTimestamp ? Math.abs(diffSec) <= 45 : false;

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // Subtle breathing pulse on the ring
    if (ringRef.current) {
      const p = (time * 1.0) % 1;
      ringRef.current.scale.setScalar(1 + p * 1.8);
      const mat = ringRef.current.material as { opacity: number };
      if (mat) mat.opacity = Math.max(0, 1 - p * 1.1) * 0.75;
      ringRef.current.lookAt(0, 0, 0);
    }
  });

  const formattedTime = formatDateTime(event.closestApproachTime, language);
  // Extract time portion if it has comma (e.g. "10 set, 19:23:30" -> "19:23:30")
  const timeOnly = formattedTime.includes(',')
    ? formattedTime.split(',')[1].trim()
    : formattedTime;

  return (
    <group position={midpoint}>
      {/* Discrete glowing waypoint node */}
      <mesh>
        <sphereGeometry args={[0.024, 12, 12]} />
        <meshBasicMaterial color={colorHex} />
      </mesh>

      {/* Subtle diamond target reticle */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <ringGeometry args={[0.042, 0.054, 4]} />
        <meshBasicMaterial color={colorHex} transparent opacity={0.8} />
      </mesh>

      {/* Breathing radar pulse ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.03, 0.042, 24]} />
        <meshBasicMaterial color={colorHex} transparent opacity={0.65} />
      </mesh>

      {/* Thin connector line between satellite and debris closest pass points */}
      <group position={[-midpoint[0], -midpoint[1], -midpoint[2]]}>
        <Line
          points={[userPos, debrisPos]}
          color={colorHex}
          lineWidth={2.2}
          transparent
          opacity={0.8}
        />
      </group>

      {/* Compact, non-intrusive micro-badge */}
      <Html
        position={[0, 0.07, 0]}
        center
        distanceFactor={9.5}
        zIndexRange={[100, 0]}
        style={{ pointerEvents: 'auto', userSelect: 'none' }}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onJumpToTca?.(event.closestApproachTime);
          }}
          title={t('globe.jumpToTca')}
          className={`pointer-events-auto flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[0.62rem] font-medium text-white shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95 ${
            isCritical
              ? 'border-red-500/70 bg-black/80 shadow-[0_0_12px_rgba(239,68,68,0.4)] hover:bg-red-950/80'
              : 'border-astro-orange/60 bg-black/80 shadow-[0_0_12px_rgba(239,125,23,0.3)] hover:bg-astro-950/90'
          }`}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                isCritical ? 'bg-red-400' : 'bg-astro-orange'
              }`}
            />
            <span
              className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                isCritical ? 'bg-red-500' : 'bg-astro-orange'
              }`}
            />
          </span>
          <span className="text-white/80">
            TCA: <strong className="font-mono text-astro-cream font-bold">{timeOnly}</strong>
          </span>
          <span className="text-white/30">·</span>
          <span className="font-mono text-white/70">
            {formatKm(event.minDistanceKm, 1, language)}
          </span>
        </div>
      </Html>
    </group>
  );
}
