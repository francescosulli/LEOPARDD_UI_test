import {
  Clock3,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  Satellite,
  Sparkles,
} from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import type { PropagationSettings, SatelliteInput } from '../types/orbital';

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
  onChange: (value: number) => void;
};

function NumericField({ label, value, min, max, step = 1, onChange }: NumericFieldProps) {
  return (
    <label className="grid gap-1 text-xs text-white/64">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-10 rounded border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none transition focus:border-astro-orange/55"
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
  return (
    <aside className="mission-panel pointer-events-auto flex h-full flex-col overflow-hidden rounded">
      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em]">
          <Satellite size={16} className="text-astro-orange" />
          Inserisci satellite
        </div>
        <p className="mt-1 text-xs text-white/56">
          Demo pubblica non operativa, con orbita sintetica generata dai parametri inseriti.
        </p>
      </div>

      <div className="thin-scrollbar flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          <NumericField
            label="Altitudine km"
            value={input.altitudeKm}
            min={120}
            max={36000}
            step={5}
            onChange={(value) => setInput((current) => ({ ...current, mode: 'simple', altitudeKm: value }))}
          />
          <NumericField
            label="Inclinazione"
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
            label="RAAN"
            value={input.raanDeg}
            min={0}
            max={360}
            step={1}
            onChange={(value) => setInput((current) => ({ ...current, mode: 'simple', raanDeg: value }))}
          />
          <NumericField
            label="Arg. perigeo"
            value={input.argumentOfPerigeeDeg}
            min={0}
            max={360}
            step={1}
            onChange={(value) =>
              setInput((current) => ({ ...current, mode: 'simple', argumentOfPerigeeDeg: value }))
            }
          />
          <NumericField
            label="Anomalia media"
            value={input.meanAnomalyDeg}
            min={0}
            max={360}
            step={1}
            onChange={(value) =>
              setInput((current) => ({ ...current, mode: 'simple', meanAnomalyDeg: value }))
            }
          />
        </div>

        {inputError ? (
          <div className="rounded border border-red-300/30 bg-red-500/10 px-3 py-2 text-xs text-red-100">
            {inputError}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-xs text-white/64">
            <span>Orizzonte temporale</span>
            <select
              value={settings.horizonHours}
              onChange={(event) =>
                setSettings((current) => ({ ...current, horizonHours: Number(event.target.value) }))
              }
              className="h-10 rounded border border-white/10 bg-astro-900 px-3 text-sm text-white outline-none transition focus:border-astro-orange/55"
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
            <span>Passo temporale</span>
            <select
              value={settings.stepMinutes}
              onChange={(event) =>
                setSettings((current) => ({ ...current, stepMinutes: Number(event.target.value) }))
              }
              className="h-10 rounded border border-white/10 bg-astro-900 px-3 text-sm text-white outline-none transition focus:border-astro-orange/55"
            >
              <option value={1}>1 min</option>
              <option value={5}>5 min</option>
              <option value={10}>10 min</option>
              <option value={30}>30 min</option>
            </select>
          </label>
        </div>

        <label className="grid gap-1 text-xs text-white/64">
          <span>Oggetti catalogo</span>
          <select
            value={settings.maxDebris}
            onChange={(event) =>
              setSettings((current) => ({ ...current, maxDebris: Number(event.target.value) }))
            }
            className="h-10 rounded border border-white/10 bg-astro-900 px-3 text-sm text-white outline-none transition focus:border-astro-orange/55"
          >
            <option value={300}>300</option>
            <option value={600}>600</option>
            <option value={1000}>1000</option>
          </select>
        </label>

        <div className="flex items-center gap-3 rounded border border-white/10 bg-white/[0.04] p-3">
          <button
            type="button"
            aria-label={isPlaying ? 'Pausa simulazione' : 'Riproduci simulazione'}
            onClick={() => setIsPlaying(!isPlaying)}
            className="grid h-9 w-9 place-items-center rounded border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/[0.1]"
          >
            {isPlaying ? <Pause size={17} /> : <Play size={17} />}
          </button>
          <label className="grid flex-1 gap-1 text-xs text-white/64">
            <span className="flex items-center gap-2">
              <Gauge size={13} />
              Velocità animazione
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
          <span className="w-10 text-right text-xs text-white/64">{speed}x</span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1fr_42px] gap-2 border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => onPropagate(false)}
          disabled={isPropagating}
          className="flex h-10 items-center justify-center gap-2 rounded bg-astro-orange px-3 text-xs font-semibold text-astro-950 shadow-glow transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
        >
          <Clock3 size={15} />
          {isPropagating ? 'Propagazione...' : 'Propaga orbita'}
        </button>

        <button
          type="button"
          onClick={onScenario}
          disabled={isPropagating}
          className={`flex h-10 items-center justify-center gap-2 rounded border px-3 text-xs font-semibold transition ${
            scenarioActive
              ? 'border-astro-flame/45 bg-astro-flame/18 text-astro-flame'
              : 'border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]'
          }`}
        >
          <Sparkles size={15} />
          Scenario sintetico
        </button>

        <button
          type="button"
          aria-label="Reset"
          onClick={onReset}
          className="grid h-10 place-items-center rounded border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/[0.1]"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </aside>
  );
}
