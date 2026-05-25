import * as satellite from 'satellite.js';
import type {
  DebrisFrame,
  DebrisObject,
  PropagatedDebrisCatalog,
  SatelliteInput,
  SatelliteState,
} from '../types/orbital';
import { isFiniteVec3 } from '../utils/math';
import { propagateSyntheticOrbit } from './syntheticOrbit';

const DEFAULT_TLE_NAME = 'ASTREO-DEMO-TLE';

export function createTimeline(startDate: Date, horizonHours: number, stepMinutes: number) {
  const safeStepMinutes = Math.max(1, stepMinutes);
  const stepCount = Math.floor((Math.max(1, horizonHours) * 60) / safeStepMinutes);
  const timeline: Date[] = [];

  for (let index = 0; index <= stepCount; index += 1) {
    timeline.push(new Date(startDate.getTime() + index * safeStepMinutes * 60_000));
  }

  return timeline;
}

export function parseTle(line1: string, line2: string) {
  const trimmedLine1 = line1.trim();
  const trimmedLine2 = line2.trim();

  if (!trimmedLine1.startsWith('1 ') || !trimmedLine2.startsWith('2 ')) {
    throw new Error('Le righe TLE devono iniziare con "1 " e "2 ".');
  }

  const satrec = satellite.twoline2satrec(trimmedLine1, trimmedLine2);

  if (!satrec || Number(satrec.error) !== 0) {
    throw new Error('TLE non valido o non propagabile con SGP4.');
  }

  return satrec;
}

function propagateSatrec(satrec: unknown, date: Date) {
  const result = satellite.propagate(satrec as never, date);
  const position = result.position as { x: number; y: number; z: number } | boolean | undefined;
  const velocity = result.velocity as { x: number; y: number; z: number } | boolean | undefined;

  if (
    typeof position !== 'object' ||
    typeof velocity !== 'object' ||
    !position ||
    !velocity
  ) {
    return null;
  }

  const state = {
    positionKm: { x: position.x, y: position.y, z: position.z },
    velocityKmS: { x: velocity.x, y: velocity.y, z: velocity.z },
  };

  if (!isFiniteVec3(state.positionKm) || !isFiniteVec3(state.velocityKmS)) {
    return null;
  }

  return state;
}

export function propagateUserSatellite(input: SatelliteInput, timeline: Date[]): SatelliteState[] {
  if (input.mode === 'simple') {
    return propagateSyntheticOrbit(input, timeline, input.name);
  }

  const satrec = parseTle(input.tleLine1, input.tleLine2);
  const label = input.tleName.trim() || input.name.trim() || DEFAULT_TLE_NAME;

  return timeline.map((date) => {
    const propagated = propagateSatrec(satrec, date);

    if (!propagated) {
      throw new Error(`Impossibile propagare il TLE di ${label} alla data richiesta.`);
    }

    return {
      timestamp: date.getTime(),
      dateIso: date.toISOString(),
      positionKm: propagated.positionKm,
      velocityKmS: propagated.velocityKmS,
      source: 'SGP4 TLE',
    };
  });
}

function getDebrisSatrec(debris: DebrisObject) {
  if (debris.satrec) {
    return debris.satrec;
  }

  if (!debris.tleLine1 || !debris.tleLine2) {
    return null;
  }

  try {
    return parseTle(debris.tleLine1, debris.tleLine2);
  } catch {
    return null;
  }
}

export function propagateDebrisCatalog(
  debrisObjects: DebrisObject[],
  timeline: Date[],
  maxDebris: number,
): PropagatedDebrisCatalog {
  const cappedObjects = debrisObjects.slice(0, maxDebris);
  const prepared = cappedObjects
    .map((object) => ({ object, satrec: getDebrisSatrec(object) }))
    .filter((entry) => entry.satrec);

  const initiallyValid = prepared.filter((entry) => propagateSatrec(entry.satrec, timeline[0]));
  const frames: DebrisFrame[] = timeline.map((date) => {
    const positionsKm = new Float32Array(initiallyValid.length * 3);
    const velocitiesKmS = new Float32Array(initiallyValid.length * 3);

    initiallyValid.forEach((entry, debrisIndex) => {
      const propagated = propagateSatrec(entry.satrec, date);
      const offset = debrisIndex * 3;

      if (!propagated) {
        positionsKm[offset] = Number.NaN;
        positionsKm[offset + 1] = Number.NaN;
        positionsKm[offset + 2] = Number.NaN;
        velocitiesKmS[offset] = Number.NaN;
        velocitiesKmS[offset + 1] = Number.NaN;
        velocitiesKmS[offset + 2] = Number.NaN;
        return;
      }

      positionsKm[offset] = propagated.positionKm.x;
      positionsKm[offset + 1] = propagated.positionKm.y;
      positionsKm[offset + 2] = propagated.positionKm.z;
      velocitiesKmS[offset] = propagated.velocityKmS.x;
      velocitiesKmS[offset + 1] = propagated.velocityKmS.y;
      velocitiesKmS[offset + 2] = propagated.velocityKmS.z;
    });

    return {
      timestamp: date.getTime(),
      dateIso: date.toISOString(),
      positionsKm,
      velocitiesKmS,
    };
  });

  return {
    objects: initiallyValid.map((entry) => entry.object),
    frames,
    skipped: cappedObjects.length - initiallyValid.length,
  };
}
