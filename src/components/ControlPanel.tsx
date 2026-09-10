import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Compass,
  FileCode2,
  Gauge,
  Info,
  Pause,
  Play,
  Rocket,
  RotateCcw,
  Satellite,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import type { PropagationSettings, SatelliteInput } from '../types/orbital';

export const SATELLITE_PRESETS: Record<string, SatelliteInput> = {
  iss: {
    mode: 'tle',
    name: 'ISS (ZARYA)',
    altitudeKm: 418,
    inclinationDeg: 51.64,
    eccentricity: 0.0005,
    raanDeg: 125.16,
    argumentOfPerigeeDeg: 116.53,
    meanAnomalyDeg: 347.59,
    tleName: 'ISS (ZARYA)',
    tleLine1: '1 25544U 98067A   26135.54791667  .00016717  00000+0  30170-3 0  9995',
    tleLine2: '2 25544  51.6404 125.1561 0005829 116.5293 347.5920 15.50054895482442',
  },
  astreo: {
    mode: 'simple',
    name: 'ASTREO-DEMO-SAT',
    altitudeKm: 550,
    inclinationDeg: 51.6,
    eccentricity: 0.0005,
    raanDeg: 0,
    argumentOfPerigeeDeg: 0,
    meanAnomalyDeg: 0,
    tleName: 'ASTREO-DEMO-SAT',
    tleLine1: '1 25544U 98067A   26135.54791667  .00016717  00000+0  30170-3 0  9995',
    tleLine2: '2 25544  51.6404 125.1561 0005829 116.5293 347.5920 15.50054895482442',
  },
  hubble: {
    mode: 'simple',
    name: 'HUBBLE (HST)',
    altitudeKm: 535,
    inclinationDeg: 28.47,
    eccentricity: 0.0003,
    raanDeg: 45,
    argumentOfPerigeeDeg: 80,
    meanAnomalyDeg: 120,
    tleName: 'HST',
    tleLine1: '1 20580U 90037B   26135.45000000  .00001000  00000+0  35000-4 0  9991',
    tleLine2: '2 20580  28.4690  45.1200 0002800  80.1500 120.3000 15.09000000000000',
  },
  starlink: {
    mode: 'simple',
    name: 'STARLINK-LEO',
    altitudeKm: 550,
    inclinationDeg: 53.05,
    eccentricity: 0.0001,
    raanDeg: 80,
    argumentOfPerigeeDeg: 90,
    meanAnomalyDeg: 45,
    tleName: 'STARLINK',
    tleLine1: '1 44713U 19074A   26135.50000000  .00002000  00000+0  10000-3 0  9998',
    tleLine2: '2 44713  53.0500  80.0000 0001000  90.0000  45.0000 15.06000000000000',
  },
};

type ControlPanelProps = {
  input: SatelliteInput;
  setInput: Dispatch<SetStateAction<SatelliteInput>>;
  settings: PropagationSettings;
  setSettings: Dispatch<SetStateAction<PropagationSettings>>;
  isPlaying: boolean;
  setIsPlaying: (value: boolean) => void;
  speed: number;
  setSpeed: (value: number) => void;
  scenarioActive: boolean;
  isPropagating: boolean;
  inputError?: string | null;
  onPropagate: (withScenario?: boolean) => void;
  onReset: () => void;
  onScenario: () => void;
};

type NumericFieldProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
};

function NumericField({ label, value, min, max, step = 1, unit, onChange }: NumericFieldProps) {
  return (
    <label className="grid gap-1 text-xs text-white/70">
      <span className="flex items-center justify-between">
        <span>{label}</span>
        {unit ? <span className="text-[0.65rem] text-white/40">{unit}</span> : null}
      </span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-9 rounded border border-white/10 bg-white/[0.06] px-2.5 text-xs text-white outline-none transition focus:border-astro-orange/55"
      />
    </label>
  );
}

export default function ControlPanel({
  input,
  setInput,
  settings,
  setSettings,
  isPlaying,
  setIsPlaying,
  speed,
  setSpeed,
  scenarioActive,
  isPropagating,
  inputError,
  onPropagate,
  onReset,
  onScenario,
}: ControlPanelProps) {
  const isISS = Boolean(input.name && /iss|zarya|station/i.test(input.name));
  const [activeTab, setActiveTab] = useState<'iss' | 'kepler' | 'tle'>(
    isISS ? 'iss' : input.mode === 'tle' ? 'tle' : 'kepler',
  );

  const handleSelectPreset = (key: keyof typeof SATELLITE_PRESETS) => {
    const preset = SATELLITE_PRESETS[key];
    if (preset) {
      setInput({ ...preset });
      if (key === 'iss') {
        setActiveTab('iss');
      }
    }
  };

  return (
    <aside className="mission-panel pointer-events-auto flex h-full flex-col overflow-hidden rounded">
      {/* Header with Navigation Tabs */}
      <div className="border-b border-white/10 bg-black/20 p-3 pb-0">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">
            <Satellite size={15} className="text-astro-orange" />
            Configurazione Missione
          </div>
          {isISS ? (
            <span className="inline-flex items-center gap-1 rounded border border-astro-orange/40 bg-astro-orange/15 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-astro-cream">
              <Rocket size={11} className="text-astro-orange" />
              Scenario ISS Attivo
            </span>
          ) : null}
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-1 border-b border-white/10 pb-2 text-[0.72rem]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('iss');
              handleSelectPreset('iss');
            }}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 font-medium transition ${
              activeTab === 'iss'
                ? 'bg-astro-orange font-semibold text-astro-950 shadow-sm'
                : 'bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            <Rocket size={13} />
            Scenario ISS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kepler')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 font-medium transition ${
              activeTab === 'kepler'
                ? 'bg-astro-orange font-semibold text-astro-950 shadow-sm'
                : 'bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            <Compass size={13} />
            Keplero
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tle')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 font-medium transition ${
              activeTab === 'tle'
                ? 'bg-astro-orange font-semibold text-astro-950 shadow-sm'
                : 'bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            <FileCode2 size={13} />
            Editor TLE
          </button>
        </div>
      </div>

      {/* Main Content Area with Scroll */}
      <div className="thin-scrollbar flex-1 space-y-4 overflow-y-auto p-3.5">
        {/* TAB 1: SCENARIO ISS */}
        {activeTab === 'iss' && (
          <div className="space-y-3">
            {/* ISS Hero Card */}
            <div className="relative overflow-hidden rounded border border-astro-orange/30 bg-gradient-to-br from-astro-orange/15 via-white/[0.03] to-transparent p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-wider text-astro-orange">
                    <Rocket size={11} />
                    Stazione Spaziale Internazionale
                  </div>
                  <h3 className="mt-0.5 text-base font-bold text-white">ISS (ZARYA)</h3>
                  <p className="mt-0.5 text-[0.68rem] text-white/60">
                    NORAD ID: <span className="font-mono text-white/90">25544</span> · COSPAR: <span className="font-mono text-white/90">1998-067A</span>
                  </p>
                </div>
                <div className="rounded border border-white/10 bg-black/40 px-2 py-1 text-right">
                  <span className="block text-[0.6rem] uppercase tracking-wider text-white/50">Massa</span>
                  <span className="font-mono text-xs font-semibold text-white">~450 t</span>
                </div>
              </div>

              {/* ISS Telemetry Grid */}
              <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
                <div className="rounded border border-white/10 bg-white/[0.04] p-1.5">
                  <span className="block text-[0.6rem] uppercase text-white/45">Quota</span>
                  <span className="font-mono text-xs font-semibold text-astro-cream">418 km</span>
                </div>
                <div className="rounded border border-white/10 bg-white/[0.04] p-1.5">
                  <span className="block text-[0.6rem] uppercase text-white/45">Inclinaz.</span>
                  <span className="font-mono text-xs font-semibold text-astro-cream">51.64°</span>
                </div>
                <div className="rounded border border-white/10 bg-white/[0.04] p-1.5">
                  <span className="block text-[0.6rem] uppercase text-white/45">Velocità</span>
                  <span className="font-mono text-xs font-semibold text-astro-cream">7.66 km/s</span>
                </div>
              </div>

              {/* SSA Protocol Note */}
              <div className="mt-2.5 flex items-start gap-2 rounded border border-white/10 bg-black/30 p-2 text-[0.66rem] leading-relaxed text-white/70">
                <ShieldAlert size={14} className="mt-0.5 shrink-0 text-astro-flame" />
                <span>
                  <strong className="text-white">Safety Box 4×50×50 km:</strong> se un detrito transita con distanza critica, viene valutata una manovra di evasione <em>DAM (Debris Avoidance Maneuver)</em>.
                </span>
              </div>
            </div>

            {/* Quick Actions for ISS */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setInput({ ...SATELLITE_PRESETS.iss });
                  onPropagate(false);
                }}
                disabled={isPropagating}
                className="flex h-9 items-center justify-center gap-1.5 rounded bg-astro-orange px-2 text-xs font-semibold text-astro-950 shadow-glow transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
              >
                <Clock3 size={14} />
                Propaga ISS
              </button>
              <button
                type="button"
                onClick={() => {
                  setInput({ ...SATELLITE_PRESETS.iss });
                  onScenario();
                }}
                disabled={isPropagating}
                className="flex h-9 items-center justify-center gap-1.5 rounded border border-astro-flame/45 bg-astro-flame/15 px-2 text-xs font-semibold text-astro-cream transition hover:bg-astro-flame/25 disabled:cursor-wait disabled:opacity-60"
              >
                <Sparkles size={14} />
                Allerta DAM
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: KEPLERIAN PARAMETERS */}
        {activeTab === 'kepler' && (
          <div className="space-y-3">
            {/* Quick Presets Chips */}
            <div>
              <span className="mb-1.5 block text-[0.65rem] uppercase tracking-wider text-white/50">Preset Rapidi</span>
              <div className="grid grid-cols-3 gap-1 text-[0.68rem]">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('astreo')}
                  className={`truncate rounded border px-2 py-1 transition ${
                    input.name === 'ASTREO-DEMO-SAT'
                      ? 'border-astro-orange bg-astro-orange/20 text-astro-cream'
                      : 'border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]'
                  }`}
                >
                  ASTREO Sat
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('hubble')}
                  className={`truncate rounded border px-2 py-1 transition ${
                    input.name === 'HUBBLE (HST)'
                      ? 'border-astro-orange bg-astro-orange/20 text-astro-cream'
                      : 'border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]'
                  }`}
                >
                  Hubble
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('starlink')}
                  className={`truncate rounded border px-2 py-1 transition ${
                    input.name === 'STARLINK-LEO'
                      ? 'border-astro-orange bg-astro-orange/20 text-astro-cream'
                      : 'border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]'
                  }`}
                >
                  Starlink
                </button>
              </div>
            </div>

            {/* Keplerian Fields Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <NumericField
                label="Altitudine"
                unit="km"
                value={input.altitudeKm}
                min={120}
                max={36000}
                step={5}
                onChange={(value) => setInput((current) => ({ ...current, mode: 'simple', altitudeKm: value }))}
              />
              <NumericField
                label="Inclinazione"
                unit="°"
                value={input.inclinationDeg}
                min={0}
                max={180}
                step={0.1}
                onChange={(value) => setInput((current) => ({ ...current, mode: 'simple', inclinationDeg: value }))}
              />
              <NumericField
                label="Eccentricità"
                value={input.eccentricity}
                min={0}
                max={0.2}
                step={0.0001}
                onChange={(value) => setInput((current) => ({ ...current, mode: 'simple', eccentricity: value }))}
              />
              <NumericField
                label="RAAN (Ω)"
                unit="°"
                value={input.raanDeg}
                min={0}
                max={360}
                step={1}
                onChange={(value) => setInput((current) => ({ ...current, mode: 'simple', raanDeg: value }))}
              />
              <NumericField
                label="Arg. perigeo (ω)"
                unit="°"
                value={input.argumentOfPerigeeDeg}
                min={0}
                max={360}
                step={1}
                onChange={(value) => setInput((current) => ({ ...current, mode: 'simple', argumentOfPerigeeDeg: value }))}
              />
              <NumericField
                label="Anomalia media (M)"
                unit="°"
                value={input.meanAnomalyDeg}
                min={0}
                max={360}
                step={1}
                onChange={(value) => setInput((current) => ({ ...current, mode: 'simple', meanAnomalyDeg: value }))}
              />
            </div>
          </div>
        )}

        {/* TAB 3: TLE EDITOR */}
        {activeTab === 'tle' && (
          <div className="space-y-2.5">
            <label className="grid gap-1 text-xs text-white/70">
              <span>Nome Satellite / Payload</span>
              <input
                type="text"
                value={input.tleName || input.name}
                onChange={(event) =>
                  setInput((current) => ({
                    ...current,
                    mode: 'tle',
                    name: event.target.value,
                    tleName: event.target.value,
                  }))
                }
                className="h-9 rounded border border-white/10 bg-white/[0.06] px-2.5 text-xs text-white outline-none transition focus:border-astro-orange/55"
              />
            </label>

            <label className="grid gap-1 text-xs text-white/70">
              <span className="flex justify-between">
                <span>Riga TLE 1</span>
                {input.tleLine1.startsWith('1 ') ? (
                  <span className="flex items-center gap-1 text-[0.65rem] text-emerald-400">
                    <CheckCircle2 size={11} /> Formato OK
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[0.65rem] text-red-400">
                    <AlertCircle size={11} /> Deve iniziare con "1 "
                  </span>
                )}
              </span>
              <input
                type="text"
                value={input.tleLine1}
                onChange={(event) =>
                  setInput((current) => ({ ...current, mode: 'tle', tleLine1: event.target.value }))
                }
                className="h-8 rounded border border-white/10 bg-black/40 px-2 font-mono text-[0.68rem] text-white outline-none transition focus:border-astro-orange/55"
              />
            </label>

            <label className="grid gap-1 text-xs text-white/70">
              <span className="flex justify-between">
                <span>Riga TLE 2</span>
                {input.tleLine2.startsWith('2 ') ? (
                  <span className="flex items-center gap-1 text-[0.65rem] text-emerald-400">
                    <CheckCircle2 size={11} /> Formato OK
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[0.65rem] text-red-400">
                    <AlertCircle size={11} /> Deve iniziare con "2 "
                  </span>
                )}
              </span>
              <input
                type="text"
                value={input.tleLine2}
                onChange={(event) =>
                  setInput((current) => ({ ...current, mode: 'tle', tleLine2: event.target.value }))
                }
                className="h-8 rounded border border-white/10 bg-black/40 px-2 font-mono text-[0.68rem] text-white outline-none transition focus:border-astro-orange/55"
              />
            </label>

            <div className="flex items-center gap-1.5 text-[0.65rem] text-white/50">
              <Info size={12} className="text-astro-orange" />
              <span>Propagazione SGP4 automatica compatibile con NORAD/CelesTrak.</span>
            </div>
          </div>
        )}

        {inputError ? (
          <div className="rounded border border-red-300/30 bg-red-500/10 p-2 text-xs text-red-100">
            {inputError}
          </div>
        ) : null}

        {/* Global Propagation Settings */}
        <div className="border-t border-white/10 pt-3">
          <div className="mb-2 text-[0.68rem] font-semibold uppercase tracking-wider text-white/60">
            Parametri Simulazione
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="grid gap-1 text-xs text-white/64">
              <span>Orizzonte</span>
              <select
                value={settings.horizonHours}
                onChange={(event) =>
                  setSettings((current) => ({ ...current, horizonHours: Number(event.target.value) }))
                }
                className="h-8 rounded border border-white/10 bg-astro-900 px-2 text-xs text-white outline-none transition focus:border-astro-orange/55"
              >
                <option value={1}>1 ora</option>
                <option value={6}>6 ore</option>
                <option value={12}>12 ore</option>
                <option value={24}>24 ore</option>
                <option value={72}>3 giorni</option>
                <option value={168}>7 giorni</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs text-white/64">
              <span>Passo</span>
              <select
                value={settings.stepMinutes}
                onChange={(event) =>
                  setSettings((current) => ({ ...current, stepMinutes: Number(event.target.value) }))
                }
                className="h-8 rounded border border-white/10 bg-astro-900 px-2 text-xs text-white outline-none transition focus:border-astro-orange/55"
              >
                <option value={1}>1 min</option>
                <option value={5}>5 min</option>
                <option value={10}>10 min</option>
                <option value={30}>30 min</option>
              </select>
            </label>
          </div>

          <label className="mt-2 grid gap-1 text-xs text-white/64">
            <span>Oggetti catalogo attivi</span>
            <select
              value={settings.maxDebris}
              onChange={(event) =>
                setSettings((current) => ({ ...current, maxDebris: Number(event.target.value) }))
              }
              className="h-8 rounded border border-white/10 bg-astro-900 px-2 text-xs text-white outline-none transition focus:border-astro-orange/55"
            >
              <option value={300}>300 oggetti</option>
              <option value={600}>600 oggetti</option>
              <option value={1000}>1000 oggetti</option>
            </select>
          </label>
        </div>

        {/* Playback Clock Controls */}
        <div className="flex items-center gap-2.5 rounded border border-white/10 bg-white/[0.04] p-2.5">
          <button
            type="button"
            aria-label={isPlaying ? 'Pausa simulazione' : 'Riproduci simulazione'}
            onClick={() => setIsPlaying(!isPlaying)}
            className="grid h-8 w-8 shrink-0 place-items-center rounded border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/[0.12]"
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <label className="grid flex-1 gap-1 text-xs text-white/64">
            <span className="flex items-center justify-between text-[0.68rem]">
              <span className="flex items-center gap-1.5">
                <Gauge size={12} />
                Velocità
              </span>
              <span className="font-mono text-white/80">{speed}x</span>
            </span>
            <input
              type="range"
              min={1}
              max={80}
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
              className="accent-astro-orange"
            />
          </label>
        </div>
      </div>

      {/* Action Footer */}
      <div className="grid grid-cols-[1fr_1fr_40px] gap-2 border-t border-white/10 p-2.5">
        <button
          type="button"
          onClick={() => onPropagate(false)}
          disabled={isPropagating}
          className="flex h-9 items-center justify-center gap-1.5 rounded bg-astro-orange px-2 text-xs font-semibold text-astro-950 shadow-glow transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
        >
          <Clock3 size={14} />
          {isPropagating ? 'Calcolo...' : 'Propaga orbita'}
        </button>

        <button
          type="button"
          onClick={onScenario}
          disabled={isPropagating}
          className={`flex h-9 items-center justify-center gap-1.5 rounded border px-2 text-xs font-semibold transition ${
            scenarioActive
              ? 'border-astro-flame/45 bg-astro-flame/18 text-astro-flame'
              : 'border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]'
          }`}
        >
          <Sparkles size={14} />
          {isISS ? 'Allerta ISS' : 'Scenario Demo'}
        </button>

        <button
          type="button"
          aria-label="Reset"
          onClick={onReset}
          className="grid h-9 place-items-center rounded border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/[0.1]"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </aside>
  );
}
