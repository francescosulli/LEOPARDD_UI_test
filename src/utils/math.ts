import type { Vec3 } from '../types/orbital';

export const EARTH_RADIUS_KM = 6371;
export const EARTH_SCENE_RADIUS = 2;
export const KM_TO_SCENE = EARTH_SCENE_RADIUS / EARTH_RADIUS_KM;
export const MU_EARTH_KM3_S2 = 398600.4418;

export function degToRad(value: number) {
  return (value * Math.PI) / 180;
}

export function radToDeg(value: number) {
  return (value * 180) / Math.PI;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function magnitude(vector: Vec3) {
  return Math.hypot(vector.x, vector.y, vector.z);
}

export function distance(a: Vec3, b: Vec3) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

export function subtract(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function scale(vector: Vec3, factor: number): Vec3 {
  return { x: vector.x * factor, y: vector.y * factor, z: vector.z * factor };
}

export function normalize(vector: Vec3): Vec3 {
  const length = magnitude(vector);

  if (!Number.isFinite(length) || length < 1e-9) {
    return { x: 1, y: 0, z: 0 };
  }

  return scale(vector, 1 / length);
}

export function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function isFiniteVec3(vector: Vec3) {
  return Number.isFinite(vector.x) && Number.isFinite(vector.y) && Number.isFinite(vector.z);
}

export function kmToSceneTuple(vector: Vec3): [number, number, number] {
  return [vector.x * KM_TO_SCENE, vector.z * KM_TO_SCENE, -vector.y * KM_TO_SCENE];
}

export function hashNumber(input: string) {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash >>> 0);
}
