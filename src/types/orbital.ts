export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type CatalogStatus = 'Live CelesTrak' | 'Cache TLE pubblica' | 'Cached demo data';

export type SatelliteInputMode = 'simple' | 'tle';

export interface DebrisObject {
  id: string;
  name: string;
  noradId?: string;
  source: string;
  tleLine1?: string;
  tleLine2?: string;
  satrec?: unknown;
  epoch?: string;
  isSynthetic?: boolean;
  sourceGroup?: string;
}

export interface CachedDebrisTemplate {
  name: string;
  noradId: string;
  inclinationDeg: number;
  raanDeg: number;
  eccentricity: number;
  argumentOfPerigeeDeg: number;
  meanAnomalyDeg: number;
  meanMotionRevPerDay: number;
  bstar?: string;
}

export interface DebrisCatalogResult {
  objects: DebrisObject[];
  status: CatalogStatus;
  message: string;
  attemptedLive: boolean;
}

export interface SimpleOrbitInput {
  altitudeKm: number;
  inclinationDeg: number;
  eccentricity: number;
  raanDeg: number;
  argumentOfPerigeeDeg: number;
  meanAnomalyDeg: number;
}

export interface SatelliteInput extends SimpleOrbitInput {
  mode: SatelliteInputMode;
  name: string;
  tleName: string;
  tleLine1: string;
  tleLine2: string;
}

export interface SatelliteState {
  timestamp: number;
  dateIso: string;
  positionKm: Vec3;
  velocityKmS: Vec3;
  source: 'SGP4 TLE' | 'synthetic demo orbit';
}

export interface DebrisFrame {
  timestamp: number;
  dateIso: string;
  positionsKm: Float32Array;
  velocitiesKmS: Float32Array;
}

export interface PropagatedDebrisCatalog {
  objects: DebrisObject[];
  frames: DebrisFrame[];
  skipped: number;
}

export interface ConjunctionEvent {
  id: string;
  debrisId: string;
  debrisName: string;
  noradId?: string;
  closestApproachTime: number;
  closestApproachIso: string;
  minDistanceKm: number;
  relativeVelocityKmS: number;
  riskLevel: RiskLevel;
  confidence: number;
  closeSampleCount: number;
  userPositionKm: Vec3;
  debrisPositionKm: Vec3;
  debrisIndex: number;
  isSynthetic?: boolean;
}

export interface PropagationSettings {
  horizonHours: number;
  stepMinutes: number;
  maxDebris: number;
}
