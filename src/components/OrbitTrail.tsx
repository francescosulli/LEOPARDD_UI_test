import { Line } from '@react-three/drei';
import type { SatelliteState, Vec3 } from '../types/orbital';
import { kmToSceneTuple } from '../utils/math';

type OrbitTrailProps = {
  states?: SatelliteState[];
  points?: Vec3[];
  color?: string;
  opacity?: number;
};

export default function OrbitTrail({
  states,
  points,
  color = '#ff9b3d',
  opacity = 0.82,
}: OrbitTrailProps) {
  const sourcePoints = points ?? states?.map((state) => state.positionKm) ?? [];

  if (sourcePoints.length < 2) {
    return null;
  }

  const stride = Math.max(1, Math.floor(sourcePoints.length / 780));
  const linePoints = sourcePoints
    .filter((_, index) => index % stride === 0 || index === sourcePoints.length - 1)
    .map(kmToSceneTuple);

  return (
    <Line
      points={linePoints}
      color={color}
      lineWidth={1.6}
      transparent
      opacity={opacity}
      dashed={false}
    />
  );
}
