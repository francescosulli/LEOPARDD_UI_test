import type { RiskLevel } from '../types/orbital';

export function formatKm(value: number, digits = 1) {
  if (!Number.isFinite(value)) {
    return 'n.d.';
  }

  return `${value.toLocaleString('it-IT', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })} km`;
}

export function formatVelocity(value: number) {
  if (!Number.isFinite(value)) {
    return 'n.d.';
  }

  return `${value.toLocaleString('it-IT', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })} km/s`;
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function formatDateTime(timestamp: number) {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(timestamp));
}

export function formatDateTimeLong(timestamp: number) {
  return new Intl.DateTimeFormat('it-IT', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export function riskLabel(level: RiskLevel) {
  const labels: Record<RiskLevel, string> = {
    Low: 'Basso',
    Medium: 'Medio',
    High: 'Alto',
    Critical: 'Critico',
  };

  return labels[level];
}

export function riskTone(level: RiskLevel) {
  const tones: Record<RiskLevel, string> = {
    Low: 'border-white/18 bg-white/[0.055] text-white',
    Medium: 'border-astro-flame/30 bg-astro-flame/10 text-astro-cream',
    High: 'border-astro-orange/42 bg-astro-orange/14 text-astro-cream',
    Critical: 'border-red-300/45 bg-red-500/14 text-red-100 shadow-glow-red',
  };

  return tones[level];
}
