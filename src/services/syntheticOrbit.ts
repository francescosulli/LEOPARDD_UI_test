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
  clamp,
  cross,
  degToRad,
  dot,
  magnitude,
  normalize,
  radToDeg,
  scale,
  subtract,
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
    name,
  };
}

export function propagateSyntheticOrbit(
  orbit: SimpleOrbitInput,
  timeline: Date[],
  name = 'ASTREO-DEMO-SAT',
) {
  const epochDate = timeline[0] ?? new Date();
  return timeline.map((date) => propagateSyntheticState(orbit, date, epochDate, name));
}

interface KeplerianStateOrbit {
  semiMajorAxisKm: number;
  eccentricity: number;
  inclinationDeg: number;
  raanDeg: number;
  argumentOfPerigeeDeg: number;
  meanAnomalyAtEpochRad: number;
  epochMs: number;
}

function stateVectorsToOrbit(r: Vec3, v: Vec3, epochMs: number): KeplerianStateOrbit {
  const rMag = Math.max(100, magnitude(r));
  const vMag = Math.max(0.1, magnitude(v));
  const h = cross(r, v);
  const hMag = Math.max(1e-5, magnitude(h));

  const n = { x: -h.y, y: h.x, z: 0 };
  const nMag = magnitude(n);

  const rDotV = dot(r, v);
  const coeffR = vMag * vMag - MU_EARTH_KM3_S2 / rMag;
  const eVec = scale(subtract(scale(r, coeffR), scale(v, rDotV)), 1 / MU_EARTH_KM3_S2);
  const ecc = clamp(magnitude(eVec), 0.0001, 0.2);

  const energy = (vMag * vMag) / 2 - MU_EARTH_KM3_S2 / rMag;
  const a = Math.abs(-MU_EARTH_KM3_S2 / (2 * Math.min(-0.01, energy)));

  const incDeg = radToDeg(Math.acos(clamp(h.z / hMag, -1, 1)));
  let raanDeg = nMag > 1e-5 ? radToDeg(Math.atan2(n.y, n.x)) : 0;
  if (raanDeg < 0) raanDeg += 360;

  let argpDeg = 0;
  if (nMag > 1e-5 && ecc > 1e-4) {
    const cosArgp = clamp(dot(n, eVec) / (nMag * ecc), -1, 1);
    argpDeg = radToDeg(Math.acos(cosArgp));
    if (eVec.z < 0) argpDeg = 360 - argpDeg;
  }

  let nuRad = 0;
  if (ecc > 1e-4) {
    const cosNu = clamp(dot(eVec, r) / (ecc * rMag), -1, 1);
    nuRad = Math.acos(cosNu);
    if (rDotV < 0) nuRad = 2 * Math.PI - nuRad;
  }

  const E0 = 2 * Math.atan2(
    Math.sqrt(Math.max(0, 1 - ecc)) * Math.sin(nuRad / 2),
    Math.sqrt(1 + ecc) * Math.cos(nuRad / 2),
  );
  const M0 = (E0 - ecc * Math.sin(E0) + 2 * Math.PI) % (2 * Math.PI);

  return {
    semiMajorAxisKm: a,
    eccentricity: ecc,
    inclinationDeg: incDeg,
    raanDeg,
    argumentOfPerigeeDeg: argpDeg,
    meanAnomalyAtEpochRad: M0,
    epochMs,
  };
}

function propagateKeplerianOrbitState(
  orbit: KeplerianStateOrbit,
  targetTimeMs: number,
): { positionKm: Vec3; velocityKmS: Vec3 } {
  const dtSeconds = (targetTimeMs - orbit.epochMs) / 1000;
  const nRadS = Math.sqrt(MU_EARTH_KM3_S2 / orbit.semiMajorAxisKm ** 3);
  let M = (orbit.meanAnomalyAtEpochRad + nRadS * dtSeconds) % (2 * Math.PI);
  if (M < 0) M += 2 * Math.PI;

  const E = solveKepler(M, orbit.eccentricity);
  const sinE = Math.sin(E);
  const cosE = Math.cos(E);

  const safeEcc = orbit.eccentricity;
  const trueAnomaly = 2 * Math.atan2(
    Math.sqrt(1 + safeEcc) * Math.sin(E / 2),
    Math.sqrt(1 - safeEcc) * Math.cos(E / 2),
  );

  const radiusKm = orbit.semiMajorAxisKm * (1 - safeEcc * cosE);
  const parameterKm = orbit.semiMajorAxisKm * (1 - safeEcc ** 2);

  const posPerifocal: Vec3 = {
    x: radiusKm * Math.cos(trueAnomaly),
    y: radiusKm * Math.sin(trueAnomaly),
    z: 0,
  };
  const velPerifocal: Vec3 = {
    x: -Math.sqrt(MU_EARTH_KM3_S2 / parameterKm) * Math.sin(trueAnomaly),
    y: Math.sqrt(MU_EARTH_KM3_S2 / parameterKm) * (safeEcc + Math.cos(trueAnomaly)),
    z: 0,
  };

  const simpleInput: SimpleOrbitInput = {
    altitudeKm: orbit.semiMajorAxisKm - EARTH_RADIUS_KM,
    inclinationDeg: orbit.inclinationDeg,
    eccentricity: orbit.eccentricity,
    raanDeg: orbit.raanDeg,
    argumentOfPerigeeDeg: orbit.argumentOfPerigeeDeg,
    meanAnomalyDeg: radToDeg(orbit.meanAnomalyAtEpochRad),
  };

  return {
    positionKm: rotateFromPerifocal(posPerifocal, simpleInput),
    velocityKmS: rotateFromPerifocal(velPerifocal, simpleInput),
  };
}

type CrossingScenarioConfig = {
  id: string;
  name: string;
  noradId: string;
  fractionTca: number;
  missDistanceKm: number;
  // Rotation angle of debris velocity vector relative to satellite track (in degrees)
  crossingAngleDeg: number;
  outOfPlanePitchDeg: number;
  missDirection: 'radial' | 'normal' | 'cross';
};

const DIVERSE_CROSSING_SCENARIOS: CrossingScenarioConfig[] = [
  {
    id: 'syn-cosmos-2251-deb',
    name: 'COSMOS-2251 DEB (Incrocio Ortogonale 90°)',
    noradId: '34454',
    fractionTca: 0.35,
    missDistanceKm: 2.4,
    crossingAngleDeg: 88,
    outOfPlanePitchDeg: 12,
    missDirection: 'normal',
  },
  {
    id: 'syn-fengyun-1c-deb',
    name: 'FENGYUN-1C DEB (Incontro Frontale Retrogrado 155°)',
    noradId: '29745',
    fractionTca: 0.65,
    missDistanceKm: 4.1,
    crossingAngleDeg: 155,
    outOfPlanePitchDeg: -18,
    missDirection: 'cross',
  },
  {
    id: 'syn-cosmos-1408-deb',
    name: 'COSMOS-1408 DEB (Incrocio Inclinato 60°)',
    noradId: '49812',
    fractionTca: 0.48,
    missDistanceKm: 11.8,
    crossingAngleDeg: 62,
    outOfPlanePitchDeg: 28,
    missDirection: 'radial',
  },
  {
    id: 'syn-iridium-33-deb',
    name: 'IRIDIUM-33 DEB (Sorpasso Co-Orbitale 18°)',
    noradId: '33890',
    fractionTca: 0.82,
    missDistanceKm: 28.5,
    crossingAngleDeg: 18,
    outOfPlanePitchDeg: 4,
    missDirection: 'normal',
  },
];

export function appendDramaticDemoDebris(
  objects: DebrisObject[],
  frames: DebrisFrame[],
  userStates: SatelliteState[],
) {
  if (!frames.length || !userStates.length || frames.length !== userStates.length) {
    return { objects, frames };
  }

  const generatedOrbits: { object: DebrisObject; orbit: KeplerianStateOrbit }[] = [];

  for (const config of DIVERSE_CROSSING_SCENARIOS) {
    const tcaIndex = Math.max(1, Math.min(userStates.length - 2, Math.floor(userStates.length * config.fractionTca)));
    const userAtTca = userStates[tcaIndex];
    if (!userAtTca || magnitude(userAtTca.positionKm) < 100) {
      continue;
    }

    const rSat = userAtTca.positionKm;
    const vSat = userAtTca.velocityKmS;
    const rNorm = normalize(rSat);
    const vNorm = normalize(vSat);
    const hNorm = normalize(cross(rNorm, vNorm));


    // Construct miss vector
    let missVec: Vec3;
    if (config.missDirection === 'normal') {
      missVec = scale(hNorm, config.missDistanceKm);
    } else if (config.missDirection === 'radial') {
      missVec = scale(rNorm, config.missDistanceKm);
    } else {
      missVec = scale(add(scale(hNorm, 0.707), scale(rNorm, 0.707)), config.missDistanceKm);
    }

    const rDebrisAtTca = add(rSat, missVec);

    // Construct crossing velocity vector: rotate vNorm by crossingAngleDeg around rNorm, plus outOfPlanePitchDeg
    const yawRad = degToRad(config.crossingAngleDeg);
    const pitchRad = degToRad(config.outOfPlanePitchDeg);
    const speed = magnitude(vSat);

    // v_deb = speed * [ cos(pitch)*(cos(yaw)*vNorm + sin(yaw)*hNorm) + sin(pitch)*rNorm ]
    const horizontal = add(scale(vNorm, Math.cos(yawRad)), scale(hNorm, Math.sin(yawRad)));
    const vDebrisNorm = add(scale(horizontal, Math.cos(pitchRad)), scale(rNorm, Math.sin(pitchRad)));
    const vDebrisAtTca = scale(normalize(vDebrisNorm), speed);

    const debrisOrbit = stateVectorsToOrbit(rDebrisAtTca, vDebrisAtTca, userAtTca.timestamp);

    generatedOrbits.push({
      object: {
        id: config.id,
        name: config.name,
        noradId: config.noradId,
        source: 'Scenario sintetico SSA',
        isSynthetic: true,
      },
      orbit: debrisOrbit,
    });
  }

  if (!generatedOrbits.length) {
    return { objects, frames };
  }

  const newDebrisCount = generatedOrbits.length;
  const appendedFrames = frames.map((frame) => {
    const oldPosLength = frame.positionsKm.length;
    const oldVelLength = frame.velocitiesKmS.length;
    const nextPositions = new Float32Array(oldPosLength + newDebrisCount * 3);
    const nextVelocities = new Float32Array(oldVelLength + newDebrisCount * 3);

    nextPositions.set(frame.positionsKm);
    nextVelocities.set(frame.velocitiesKmS);

    generatedOrbits.forEach((entry, idx) => {
      const state = propagateKeplerianOrbitState(entry.orbit, frame.timestamp);
      const offsetPos = oldPosLength + idx * 3;
      const offsetVel = oldVelLength + idx * 3;

      nextPositions[offsetPos] = state.positionKm.x;
      nextPositions[offsetPos + 1] = state.positionKm.y;
      nextPositions[offsetPos + 2] = state.positionKm.z;

      nextVelocities[offsetVel] = state.velocityKmS.x;
      nextVelocities[offsetVel + 1] = state.velocityKmS.y;
      nextVelocities[offsetVel + 2] = state.velocityKmS.z;
    });

    return {
      ...frame,
      positionsKm: nextPositions,
      velocitiesKmS: nextVelocities,
    };
  });

  return {
    objects: [...objects, ...generatedOrbits.map((g) => g.object)],
    frames: appendedFrames,
  };
}
