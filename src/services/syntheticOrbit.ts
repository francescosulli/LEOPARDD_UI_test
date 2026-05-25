import type {
  DebrisFrame,
  DebrisObject,
  SatelliteState,
  SimpleOrbitInput,
  Vec3,
} from '../types/orbital';
import {
  EARTH_RADIUS_KM,
  MU_EARTH_KM3_S2,
  add,
  cross,
  degToRad,
  magnitude,
  normalize,
  scale,
} from '../utils/math';

function solveKepler(meanAnomalyRad: number, eccentricity: number) {
  let eccentricAnomaly = meanAnomalyRad;

  for (let iteration = 0; iteration < 8; iteration += 1) {
    const delta =
      (eccentricAnomaly -
        eccentricity * Math.sin(eccentricAnomaly) -
        meanAnomalyRad) /
      (1 - eccentricity * Math.cos(eccentricAnomaly));
    eccentricAnomaly -= delta;

    if (Math.abs(delta) < 1e-9) {
      break;
    }
  }

  return eccentricAnomaly;
}

function rotateFromPerifocal(vector: Vec3, orbit: SimpleOrbitInput): Vec3 {
  const raan = degToRad(orbit.raanDeg);
  const inclination = degToRad(orbit.inclinationDeg);
  const argumentOfPerigee = degToRad(orbit.argumentOfPerigeeDeg);

  const cosO = Math.cos(raan);
  const sinO = Math.sin(raan);
  const cosI = Math.cos(inclination);
  const sinI = Math.sin(inclination);
  const cosW = Math.cos(argumentOfPerigee);
  const sinW = Math.sin(argumentOfPerigee);

  return {
    x:
      (cosO * cosW - sinO * sinW * cosI) * vector.x +
      (-cosO * sinW - sinO * cosW * cosI) * vector.y,
    y:
      (sinO * cosW + cosO * sinW * cosI) * vector.x +
      (-sinO * sinW + cosO * cosW * cosI) * vector.y,
    z: sinW * sinI * vector.x + cosW * sinI * vector.y,
  };
}

export function propagateSyntheticState(
  orbit: SimpleOrbitInput,
  date: Date,
  epochDate: Date,
  name = 'ASTREO-DEMO-SAT',
): SatelliteState {
  const safeEccentricity = Math.min(Math.max(orbit.eccentricity, 0), 0.2);
  const semiMajorAxisKm = EARTH_RADIUS_KM + Math.max(120, orbit.altitudeKm);
  const meanMotionRadS = Math.sqrt(MU_EARTH_KM3_S2 / semiMajorAxisKm ** 3);
  const dtSeconds = (date.getTime() - epochDate.getTime()) / 1000;
  const meanAnomaly =
    (degToRad(orbit.meanAnomalyDeg) + meanMotionRadS * dtSeconds) % (Math.PI * 2);
  const eccentricAnomaly = solveKepler(meanAnomaly, safeEccentricity);
  const trueAnomaly =
    2 *
    Math.atan2(
      Math.sqrt(1 + safeEccentricity) * Math.sin(eccentricAnomaly / 2),
      Math.sqrt(1 - safeEccentricity) * Math.cos(eccentricAnomaly / 2),
    );
  const radiusKm = semiMajorAxisKm * (1 - safeEccentricity * Math.cos(eccentricAnomaly));
  const parameterKm = semiMajorAxisKm * (1 - safeEccentricity ** 2);

  const positionPerifocal = {
    x: radiusKm * Math.cos(trueAnomaly),
    y: radiusKm * Math.sin(trueAnomaly),
    z: 0,
  };
  const velocityPerifocal = {
    x: -Math.sqrt(MU_EARTH_KM3_S2 / parameterKm) * Math.sin(trueAnomaly),
    y:
      Math.sqrt(MU_EARTH_KM3_S2 / parameterKm) *
      (safeEccentricity + Math.cos(trueAnomaly)),
    z: 0,
  };

  return {
    timestamp: date.getTime(),
    dateIso: date.toISOString(),
    positionKm: rotateFromPerifocal(positionPerifocal, orbit),
    velocityKmS: rotateFromPerifocal(velocityPerifocal, orbit),
    source: 'synthetic demo orbit',
  };
}

export function propagateSyntheticOrbit(
  orbit: SimpleOrbitInput,
  timeline: Date[],
  name = 'ASTREO-DEMO-SAT',
) {
  const epochDate = timeline[0] ?? new Date();

  // Assumption: this is a simplified two-body ECI orbit for outreach demos.
  // It ignores drag, J2 perturbations, covariance, maneuvers, and tracking uncertainty.
  return timeline.map((date) => propagateSyntheticState(orbit, date, epochDate, name));
}

export function appendDramaticDemoDebris(
  objects: DebrisObject[],
  frames: DebrisFrame[],
  userStates: SatelliteState[],
) {
  if (!frames.length || !userStates.length || frames.length !== userStates.length) {
    return { objects, frames };
  }

  const syntheticObject: DebrisObject = {
    id: 'synthetic-demo-conjunction',
    name: 'Scenario sintetico ASTREO-NEAR-PASS',
    noradId: 'SYN-001',
    source: 'Scenario sintetico',
    isSynthetic: true,
  };
  const closestIndex = Math.max(1, Math.floor(userStates.length * 0.42));
  const appendedFrames = frames.map((frame, frameIndex) => {
    const oldLength = frame.positionsKm.length;
    const nextPositions = new Float32Array(oldLength + 3);
    const nextVelocities = new Float32Array(frame.velocitiesKmS.length + 3);
    nextPositions.set(frame.positionsKm);
    nextVelocities.set(frame.velocitiesKmS);

    const user = userStates[frameIndex];
    const radial = normalize(user.positionKm);
    const normal = normalize(cross(radial, { x: 0.2, y: 0.7, z: 0.4 }));
    const alongTrack = normalize(cross(normal, radial));
    const distanceFromTca = Math.abs(frameIndex - closestIndex);
    const missDistanceKm = 3.4 + Math.min(230, distanceFromTca * 9.5);
    const lateralSweepKm = Math.sin(frameIndex * 0.23) * Math.min(45, distanceFromTca * 1.8);
    const syntheticPosition = add(
      add(user.positionKm, scale(normal, missDistanceKm)),
      scale(alongTrack, lateralSweepKm),
    );
    const syntheticVelocity = scale(user.velocityKmS, -0.58);

    nextPositions[oldLength] = syntheticPosition.x;
    nextPositions[oldLength + 1] = syntheticPosition.y;
    nextPositions[oldLength + 2] = syntheticPosition.z;
    nextVelocities[frame.velocitiesKmS.length] = syntheticVelocity.x;
    nextVelocities[frame.velocitiesKmS.length + 1] = syntheticVelocity.y;
    nextVelocities[frame.velocitiesKmS.length + 2] = syntheticVelocity.z;

    return {
      ...frame,
      positionsKm: nextPositions,
      velocitiesKmS: nextVelocities,
    };
  });

  if (magnitude(userStates[closestIndex]?.positionKm ?? { x: 0, y: 0, z: 0 }) < 1) {
    return { objects, frames };
  }

  return {
    objects: [...objects, syntheticObject],
    frames: appendedFrames,
  };
}
