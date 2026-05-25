import * as satellite from 'satellite.js';
import type {
  CachedDebrisTemplate,
  DebrisCatalogResult,
  DebrisObject,
} from '../types/orbital';

const LIVE_GROUPS = [
  'cosmos-2251-debris',
  'iridium-33-debris',
  'fengyun-1c-debris',
  'cosmos-1408-debris',
];

const LOCAL_TLE_GROUPS = [
  { group: 'cosmos-2251-debris', path: '/data/celestrak_cosmos_2251_debris.tle' },
  { group: 'iridium-33-debris', path: '/data/celestrak_iridium_33_debris.tle' },
  { group: 'fengyun-1c-debris', path: '/data/celestrak_fengyun_1c_debris.tle' },
  { group: 'cosmos-1408-debris', path: '/data/celestrak_cosmos_1408_debris.tle' },
];

const CELESTRAK_BASE_URL = 'https://celestrak.org/NORAD/elements/gp.php';
const CACHED_PUBLIC_TLE_SOURCE = 'Cache TLE pubblica (CelesTrak)';

type CachedPayload = {
  generatedAt: string;
  templates: CachedDebrisTemplate[];
};

function timeoutSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    dispose: () => window.clearTimeout(timeout),
  };
}

function checksum(lineWithoutChecksum: string) {
  let sum = 0;

  for (const char of lineWithoutChecksum) {
    if (/\d/.test(char)) {
      sum += Number(char);
    } else if (char === '-') {
      sum += 1;
    }
  }

  return String(sum % 10);
}

function withChecksum(line: string) {
  const padded = line.padEnd(68, ' ').slice(0, 68);
  return `${padded}${checksum(padded)}`;
}

function epochToTleDate(isoDate: string) {
  const date = new Date(isoDate);
  const year = date.getUTCFullYear();
  const startOfYear = Date.UTC(year, 0, 0, 0, 0, 0, 0);
  const dayOfYear = (date.getTime() - startOfYear) / 86_400_000;
  const shortYear = String(year % 100).padStart(2, '0');

  return `${shortYear}${dayOfYear.toFixed(8).padStart(12, '0')}`;
}

function buildTleFromTemplate(
  template: CachedDebrisTemplate,
  generatedAt: string,
  variantIndex: number,
) {
  const satnum = String((Number(template.noradId) + variantIndex) % 100000).padStart(5, '0');
  const raan = (template.raanDeg + variantIndex * 17.217) % 360;
  const arg = (template.argumentOfPerigeeDeg + variantIndex * 9.73) % 360;
  const anomaly = (template.meanAnomalyDeg + variantIndex * 27.91) % 360;
  const inclination = Math.min(
    112,
    Math.max(28, template.inclinationDeg + Math.sin(variantIndex * 0.71) * 7.5),
  );
  const eccentricity = Math.min(
    0.025,
    Math.max(0.0001, template.eccentricity + (variantIndex % 9) * 0.00013),
  );
  const meanMotion = Math.min(
    15.7,
    Math.max(11.2, template.meanMotionRevPerDay + Math.cos(variantIndex * 0.37) * 0.24),
  );

  const line1 = withChecksum(
    `1 ${satnum}U 26001A   ${epochToTleDate(generatedAt)}  .00000210  00000+0  ${
      template.bstar ?? '65000-4'
    } 0  999`,
  );
  const line2 = withChecksum(
    `2 ${satnum} ${inclination.toFixed(4).padStart(8, ' ')} ${raan
      .toFixed(4)
      .padStart(8, ' ')} ${String(Math.round(eccentricity * 10_000_000)).padStart(
      7,
      '0',
    )} ${arg.toFixed(4).padStart(8, ' ')} ${anomaly
      .toFixed(4)
      .padStart(8, ' ')} ${meanMotion.toFixed(8).padStart(11, ' ')}    0`,
  );

  return { line1, line2, satnum };
}

function tleBstar(value: string | number | undefined) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric) || numeric === 0) {
    return '00000-0';
  }

  const sign = numeric < 0 ? '-' : ' ';
  const absolute = Math.abs(numeric);
  const exponent = Math.floor(Math.log10(absolute)) + 1;
  const mantissa = Math.round((absolute / 10 ** exponent) * 100000)
    .toString()
    .padStart(5, '0')
    .slice(0, 5);

  return `${sign}${mantissa}${exponent >= 0 ? '+' : '-'}${Math.abs(exponent)}`;
}

function internationalDesignator(objectId: string | number | undefined) {
  const id = String(objectId ?? '');
  const match = id.match(/^(\d{4})-(\d{3})([A-Z]{1,3})$/i);

  if (!match) {
    return '26001A  ';
  }

  return `${match[1].slice(2)}${match[2]}${match[3].toUpperCase().padEnd(3, ' ')}`.slice(0, 8);
}

function buildTleFromGpRecord(record: Record<string, string | number | undefined>) {
  const norad = String(record.NORAD_CAT_ID ?? '').padStart(5, '0').slice(-5);
  const epoch = typeof record.EPOCH === 'string' ? record.EPOCH : undefined;
  const inclination = Number(record.INCLINATION);
  const raan = Number(record.RA_OF_ASC_NODE);
  const eccentricity = Number(record.ECCENTRICITY);
  const argPerigee = Number(record.ARG_OF_PERICENTER);
  const meanAnomaly = Number(record.MEAN_ANOMALY);
  const meanMotion = Number(record.MEAN_MOTION);

  if (
    !epoch ||
    !Number.isFinite(inclination) ||
    !Number.isFinite(raan) ||
    !Number.isFinite(eccentricity) ||
    !Number.isFinite(argPerigee) ||
    !Number.isFinite(meanAnomaly) ||
    !Number.isFinite(meanMotion)
  ) {
    return null;
  }

  const line1 = withChecksum(
    `1 ${norad}U ${internationalDesignator(record.OBJECT_ID)} ${epochToTleDate(
      epoch,
    )}  .00000000  00000+0 ${tleBstar(record.BSTAR)} 0  999`,
  );
  const line2 = withChecksum(
    `2 ${norad} ${inclination.toFixed(4).padStart(8, ' ')} ${raan
      .toFixed(4)
      .padStart(8, ' ')} ${String(Math.round(eccentricity * 10_000_000)).padStart(
      7,
      '0',
    )} ${argPerigee.toFixed(4).padStart(8, ' ')} ${meanAnomaly
      .toFixed(4)
      .padStart(8, ' ')} ${meanMotion.toFixed(8).padStart(11, ' ')}    0`,
  );

  return { line1, line2 };
}

function parseTleText(
  text: string,
  group: string,
  maxObjects: number,
  source = 'Live CelesTrak',
) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);
  const objects: DebrisObject[] = [];

  for (let index = 0; index < lines.length - 1 && objects.length < maxObjects; index += 1) {
    const line = lines[index].trim();

    if (!line.startsWith('1 ') || !lines[index + 1]?.trim().startsWith('2 ')) {
      continue;
    }

    const line1 = line;
    const line2 = lines[index + 1].trim();
    const nameLine = lines[index - 1]?.startsWith('1 ') ? undefined : lines[index - 1];
    const satrec = satellite.twoline2satrec(line1, line2);

    if (!satrec || Number(satrec.error) !== 0) {
      index += 1;
      continue;
    }

    const noradId = line1.slice(2, 7).trim();
    objects.push({
      id: `${group}-${noradId}`,
      name: nameLine?.trim() || `${group.toUpperCase()} ${noradId}`,
      noradId,
      source,
      sourceGroup: group,
      tleLine1: line1,
      tleLine2: line2,
      satrec,
      epoch: epochFromTleLine(line1),
    });
    index += 1;
  }

  return objects;
}

function epochFromTleLine(line1: string) {
  const shortYear = Number(line1.slice(18, 20));
  const dayOfYear = Number(line1.slice(20, 32));

  if (!Number.isFinite(shortYear) || !Number.isFinite(dayOfYear)) {
    return undefined;
  }

  const year = shortYear < 57 ? shortYear + 2000 : shortYear + 1900;
  const start = Date.UTC(year, 0, 1, 0, 0, 0, 0);
  return new Date(start + (dayOfYear - 1) * 86_400_000).toISOString();
}

function parseJsonGpPayload(payload: unknown, group: string, maxObjects: number) {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.slice(0, maxObjects).flatMap((record): DebrisObject[] => {
    try {
      const typedRecord = record as Record<string, string | number | undefined>;
      const tle = buildTleFromGpRecord(typedRecord);

      if (!tle) {
        return [];
      }

      const satrec = satellite.twoline2satrec(tle.line1, tle.line2);

      if (!satrec || Number(satrec.error) !== 0) {
        return [];
      }

      const noradId = String(typedRecord.NORAD_CAT_ID ?? typedRecord.OBJECT_ID ?? '');

      return [
        {
          id: `${group}-${noradId}`,
          name: String(typedRecord.OBJECT_NAME ?? `${group.toUpperCase()} ${noradId}`),
          noradId,
          source: 'Live CelesTrak',
          sourceGroup: group,
          tleLine1: tle.line1,
          tleLine2: tle.line2,
          satrec,
          epoch: typeof typedRecord.EPOCH === 'string' ? typedRecord.EPOCH : undefined,
        },
      ];
    } catch {
      return [];
    }
  });
}

async function fetchLiveGroup(group: string, maxObjects: number) {
  const jsonUrl = `${CELESTRAK_BASE_URL}?GROUP=${group}&FORMAT=json`;
  const jsonTimeout = timeoutSignal(6500);

  try {
    const response = await fetch(jsonUrl, { signal: jsonTimeout.signal });

    if (response.ok) {
      const payload = await response.json();
      const parsed = parseJsonGpPayload(payload, group, maxObjects);

      if (parsed.length) {
        return parsed;
      }
    }
  } catch {
    // The TLE endpoint below is intentionally attempted after JSON or CORS failures.
  } finally {
    jsonTimeout.dispose();
  }

  const tleUrl = `${CELESTRAK_BASE_URL}?GROUP=${group}&FORMAT=tle`;
  const tleTimeout = timeoutSignal(6500);

  try {
    const response = await fetch(tleUrl, { signal: tleTimeout.signal });

    if (!response.ok) {
      return [];
    }

    return parseTleText(await response.text(), group, maxObjects);
  } catch {
    return [];
  } finally {
    tleTimeout.dispose();
  }
}

async function fetchLiveCatalog(maxObjects: number) {
  const perGroup = Math.ceil(maxObjects / LIVE_GROUPS.length);
  const results = await Promise.allSettled(
    LIVE_GROUPS.map((group) => fetchLiveGroup(group, perGroup)),
  );

  return results
    .flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
    .slice(0, maxObjects);
}

async function fetchCachedTleCatalog(maxObjects: number) {
  const perGroup = Math.ceil(maxObjects / LOCAL_TLE_GROUPS.length);
  const results = await Promise.allSettled(
    LOCAL_TLE_GROUPS.map(async ({ group, path }) => {
      const response = await fetch(path);

      if (!response.ok) {
        return [];
      }

      return parseTleText(await response.text(), group, perGroup, CACHED_PUBLIC_TLE_SOURCE);
    }),
  );

  return results
    .flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
    .slice(0, maxObjects);
}

async function fetchCachedCatalog(maxObjects: number) {
  const tleObjects = await fetchCachedTleCatalog(maxObjects);

  if (tleObjects.length >= Math.min(40, maxObjects)) {
    return tleObjects;
  }

  const response = await fetch('/data/debris_sample.json');

  if (!response.ok) {
    throw new Error('Dataset locale non disponibile.');
  }

  const payload = (await response.json()) as CachedPayload;
  const objects: DebrisObject[] = [];
  let variantIndex = 0;

  while (objects.length < maxObjects) {
    for (const template of payload.templates) {
      if (objects.length >= maxObjects) {
        break;
      }

      const { line1, line2, satnum } = buildTleFromTemplate(template, payload.generatedAt, variantIndex);
      const satrec = satellite.twoline2satrec(line1, line2);

      if (satrec && Number(satrec.error) === 0) {
        objects.push({
          id: `cached-${satnum}-${variantIndex}`,
          name:
            variantIndex < payload.templates.length
              ? template.name
              : `${template.name} / demo clone ${variantIndex + 1}`,
          noradId: satnum,
          source: 'Cached demo data',
          tleLine1: line1,
          tleLine2: line2,
          satrec,
          epoch: payload.generatedAt,
          isSynthetic: variantIndex >= payload.templates.length,
        });
      }

      variantIndex += 1;
    }
  }

  return objects;
}

function shouldUseLocalCacheOnly() {
  const params = new URLSearchParams(window.location.search);
  return params.get('source') === 'cache' || params.has('offline') || navigator.onLine === false;
}

export async function fetchDebrisCatalog(maxObjects = 600): Promise<DebrisCatalogResult> {
  if (shouldUseLocalCacheOnly()) {
    const cachedObjects = await fetchCachedCatalog(maxObjects);
    const hasPublicTleCache = cachedObjects.some((object) => object.source === CACHED_PUBLIC_TLE_SOURCE);

    return {
      objects: cachedObjects,
      status: hasPublicTleCache ? 'Cache TLE pubblica' : 'Cached demo data',
      message: hasPublicTleCache
        ? `${cachedObjects.length} TLE reali caricati dalla cache pubblica locale. Modalità offline/cache attiva.`
        : `${cachedObjects.length} oggetti caricati dal catalogo demo locale.`,
      attemptedLive: false,
    };
  }

  const liveObjects = await fetchLiveCatalog(maxObjects);

  if (liveObjects.length >= Math.min(40, maxObjects)) {
    const supplementedObjects =
      liveObjects.length < maxObjects
        ? [
            ...liveObjects,
            ...(await fetchCachedCatalog(maxObjects - liveObjects.length)).map((object) => ({
              ...object,
              id: `supplement-${object.id}`,
            })),
          ]
        : liveObjects;

    return {
      objects: supplementedObjects.slice(0, maxObjects),
      status: 'Live CelesTrak',
      message:
        liveObjects.length < maxObjects
          ? `${liveObjects.length} oggetti CelesTrak GP + ${
              supplementedObjects.length - liveObjects.length
            } supplementari da cache TLE locale.`
          : `${liveObjects.length} oggetti acquisiti da CelesTrak GP.`,
      attemptedLive: true,
    };
  }

  const cachedObjects = await fetchCachedCatalog(maxObjects);
  const hasPublicTleCache = cachedObjects.some((object) => object.source === CACHED_PUBLIC_TLE_SOURCE);

  return {
    objects: cachedObjects,
    status: hasPublicTleCache ? 'Cache TLE pubblica' : 'Cached demo data',
    message: hasPublicTleCache
      ? `${cachedObjects.length} TLE reali caricati dalla cache pubblica locale. ESA DISCOS richiede autenticazione per l'accesso diretto.`
      : `${cachedObjects.length} oggetti caricati dal catalogo demo locale.`,
    attemptedLive: true,
  };
}
