import type {
  ConjunctionEvent,
  DebrisFrame,
  DebrisObject,
  RiskLevel,
  SatelliteState,
  Vec3,
} from '../types/orbital';
import { clamp, distance, magnitude, subtract } from '../utils/math';

type MutableCandidate = {
  debrisIndex: number;
  minDistanceKm: number;
  relativeVelocityKmS: number;
  closestFrameIndex: number;
  closeSampleCount: number;
  userPositionKm: Vec3;
  debrisPositionKm: Vec3;
};

function riskLevelFromDistance(distanceKm: number): RiskLevel | null {
  if (distanceKm < 5) {
    return 'Critical';
  }

  if (distanceKm < 15) {
    return 'High';
  }

  if (distanceKm < 50) {
    return 'Medium';
  }

  if (distanceKm < 100) {
    return 'Low';
  }

  return null;
}

function dataFreshnessFactor(debris: DebrisObject, now: Date) {
  if (debris.isSynthetic) {
    return 0.94;
  }

  if (!debris.epoch) {
    return 0.68;
  }

  const ageDays = Math.abs(now.getTime() - new Date(debris.epoch).getTime()) / 86_400_000;

  return clamp(Math.exp(-ageDays / 60), 0.34, 1);
}

function confidenceScore(
  distanceKm: number,
  relativeVelocityKmS: number,
  closeSampleCount: number,
  debris: DebrisObject,
  now: Date,
) {
  const distanceFactor = Math.exp(-distanceKm / 24);
  const velocityFactor = clamp(relativeVelocityKmS / 9.5, 0.45, 1.15);
  const samplingFactor = clamp(0.48 + closeSampleCount / 5, 0.48, 1);
  const freshness = dataFreshnessFactor(debris, now);

  return clamp(100 * distanceFactor * velocityFactor * samplingFactor * freshness, 1, 99);
}

export function detectConjunctions(
  userStates: SatelliteState[],
  debrisObjects: DebrisObject[],
  debrisFrames: DebrisFrame[],
  now = new Date(),
): ConjunctionEvent[] {
  if (!userStates.length || userStates.length !== debrisFrames.length) {
    return [];
  }

  const candidates: MutableCandidate[] = debrisObjects.map((_, debrisIndex) => ({
    debrisIndex,
    minDistanceKm: Number.POSITIVE_INFINITY,
    relativeVelocityKmS: 0,
    closestFrameIndex: 0,
    closeSampleCount: 0,
    userPositionKm: { x: 0, y: 0, z: 0 },
    debrisPositionKm: { x: 0, y: 0, z: 0 },
  }));

  debrisFrames.forEach((frame, frameIndex) => {
    const user = userStates[frameIndex];

    for (let debrisIndex = 0; debrisIndex < debrisObjects.length; debrisIndex += 1) {
      const offset = debrisIndex * 3;
      const debrisPosition = {
        x: frame.positionsKm[offset],
        y: frame.positionsKm[offset + 1],
        z: frame.positionsKm[offset + 2],
      };

      if (
        !Number.isFinite(debrisPosition.x) ||
        !Number.isFinite(debrisPosition.y) ||
        !Number.isFinite(debrisPosition.z)
      ) {
        continue;
      }

      const separation = distance(user.positionKm, debrisPosition);
      const candidate = candidates[debrisIndex];

      if (separation < 100) {
        candidate.closeSampleCount += 1;
      }

      if (separation < candidate.minDistanceKm) {
        const debrisVelocity = {
          x: frame.velocitiesKmS[offset],
          y: frame.velocitiesKmS[offset + 1],
          z: frame.velocitiesKmS[offset + 2],
        };
        const relativeVelocity = magnitude(subtract(user.velocityKmS, debrisVelocity));

        candidate.minDistanceKm = separation;
        candidate.relativeVelocityKmS = relativeVelocity;
        candidate.closestFrameIndex = frameIndex;
        candidate.userPositionKm = user.positionKm;
        candidate.debrisPositionKm = debrisPosition;
      }
    }
  });

  const events = candidates
    .map((candidate) => {
      const riskLevel = riskLevelFromDistance(candidate.minDistanceKm);

      if (!riskLevel) {
        return null;
      }

      const debris = debrisObjects[candidate.debrisIndex];

      return {
        id: `${debris.id}-${candidate.closestFrameIndex}`,
        debrisId: debris.id,
        debrisName: debris.name,
        noradId: debris.noradId,
        closestApproachTime: debrisFrames[candidate.closestFrameIndex].timestamp,
        closestApproachIso: debrisFrames[candidate.closestFrameIndex].dateIso,
        minDistanceKm: candidate.minDistanceKm,
        relativeVelocityKmS: candidate.relativeVelocityKmS,
        riskLevel,
        confidence: confidenceScore(
          candidate.minDistanceKm,
          candidate.relativeVelocityKmS,
          candidate.closeSampleCount,
          debris,
          now,
        ),
        closeSampleCount: candidate.closeSampleCount,
        userPositionKm: candidate.userPositionKm,
        debrisPositionKm: candidate.debrisPositionKm,
        debrisIndex: candidate.debrisIndex,
        isSynthetic: debris.isSynthetic,
      } satisfies ConjunctionEvent;
    })
    .filter(Boolean) as ConjunctionEvent[];

  return events.sort((a, b) => a.minDistanceKm - b.minDistanceKm).slice(0, 10);
}
