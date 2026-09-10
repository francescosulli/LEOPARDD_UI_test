import type { RiskLevel } from '../types/orbital';
import type { Language } from '../i18n/LanguageContext';

function localeFor(language: Language) {
  return language === 'it' ? 'it-IT' : 'en-US';
}

function naLabel(language: Language) {
  return language === 'it' ? 'n.d.' : 'N/A';
}

export function formatKm(value: number, digits = 1, language: Language = 'it') {
  if (!Number.isFinite(value)) {
    return naLabel(language);
  }

  return `${value.toLocaleString(localeFor(language), {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })} km`;
}

export function formatVelocity(value: number, language: Language = 'it') {
  if (!Number.isFinite(value)) {
    return naLabel(language);
  }

  return `${value.toLocaleString(localeFor(language), {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })} km/s`;
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function formatDateTime(timestamp: number, language: Language = 'it') {
  return new Intl.DateTimeFormat(localeFor(language), {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(timestamp));
}

export function formatDateTimeLong(timestamp: number, language: Language = 'it') {
  return new Intl.DateTimeFormat(localeFor(language), {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export function formatDurationSeconds(seconds: number): string {
  const abs = Math.abs(Math.round(seconds));
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = Math.floor(abs % 60);
  if (h > 0) {
    return `${h}h ${m}m ${s}s`;
  }
  if (m > 0) {
    return `${m}m ${s}s`;
  }
  return `${s}s`;
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

