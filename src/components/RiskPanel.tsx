import { AlertTriangle, Crosshair, ShieldCheck, Sparkles } from 'lucide-react';
import type { ConjunctionEvent } from '../types/orbital';
import {
  formatDateTime,
  formatKm,
  formatPercent,
  formatVelocity,
  riskLabel,
  riskTone,
} from '../utils/formatting';

type RiskPanelProps = {
  events: ConjunctionEvent[];
  selectedEventId?: string | null;
  onSelect: (event: ConjunctionEvent) => void;
  isPropagating: boolean;
  onRunScenario?: () => void;
};

export default function RiskPanel({
  events,
  selectedEventId,
  onSelect,
  isPropagating,
  onRunScenario,
}: RiskPanelProps) {
  return (
    <section className="mission-panel pointer-events-auto flex h-full min-h-0 flex-col overflow-hidden rounded">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <Crosshair size={15} className="text-astro-flame" />
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
            Possibili Congiunzioni & Rischio
          </span>
        </div>
        {events.length ? (
          <span className="rounded border border-astro-orange/30 bg-astro-orange/15 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-astro-cream">
            {events.length} {events.length === 1 ? 'Evento' : 'Eventi'}
          </span>
        ) : (
          <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[0.62rem] text-white/50">
            Top 10
          </span>
        )}
      </div>

      {/* Content Area with Vertical Scroll */}
      <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
        {isPropagating ? (
          <div className="grid h-32 place-items-center rounded border border-white/10 bg-white/[0.03] text-xs uppercase tracking-[0.18em] text-white/60">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-ping rounded-full bg-astro-orange" />
              Calcolo congiunzioni in corso...
            </div>
          </div>
        ) : events.length ? (
          <div className="space-y-2.5">
            {events.map((event, index) => {
              const selected = event.id === selectedEventId;
              const isCritical = event.riskLevel === 'Critical';
              const isHigh = event.riskLevel === 'High';

              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onSelect(event)}
                  className={`w-full rounded border p-2.5 text-left transition hover:translate-y-[-1px] ${
                    selected
                      ? 'border-astro-orange bg-astro-orange/18 shadow-glow ring-1 ring-astro-orange/60'
                      : riskTone(event.riskLevel)
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[0.62rem] font-bold text-white/40">
                          #{index + 1}
                        </span>
                        <p className="truncate text-xs font-bold text-white">{event.debrisName}</p>
                      </div>
                      <p className="mt-0.5 text-[0.62rem] font-medium uppercase tracking-[0.12em] text-white/50">
                        NORAD {event.noradId ?? 'n.d.'}
                        {event.isSynthetic ? ' · DEMO' : ''}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider ${
                        isCritical
                          ? 'bg-red-500/25 text-red-200 ring-1 ring-red-500/50'
                          : isHigh
                            ? 'bg-astro-orange/30 text-astro-cream ring-1 ring-astro-orange/50'
                            : event.riskLevel === 'Medium'
                              ? 'bg-astro-flame/20 text-astro-cream'
                              : 'bg-white/10 text-white/80'
                      }`}
                    >
                      {riskLabel(event.riskLevel)}
                    </span>
                  </div>

                  {/* Card Metrics Grid */}
                  <div className="mt-2 grid grid-cols-4 gap-1 rounded bg-black/25 p-1.5 text-[0.68rem]">
                    <div>
                      <span className="block text-[0.58rem] uppercase text-white/45">Distanza</span>
                      <span className="font-mono font-bold text-white">
                        {formatKm(event.minDistanceKm, 1)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[0.58rem] uppercase text-white/45">Vel. Rel.</span>
                      <span className="font-mono font-semibold text-white/90">
                        {formatVelocity(event.relativeVelocityKmS)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[0.58rem] uppercase text-white/45">TCA</span>
                      <span className="font-mono text-white/80">
                        {formatDateTime(event.closestApproachTime)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[0.58rem] uppercase text-white/45">Affidabilità</span>
                      <span className="font-mono text-astro-cream">
                        {formatPercent(event.confidence)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid min-h-28 place-items-center rounded border border-white/10 bg-white/[0.02] p-3 text-center">
            <div>
              <ShieldCheck className="mx-auto mb-1.5 text-emerald-400" size={22} />
              <p className="text-xs font-medium text-white">
                Nessuna congiunzione critica nell'orizzonte impostato.
              </p>
              {onRunScenario ? (
                <button
                  type="button"
                  onClick={onRunScenario}
                  className="mt-2.5 inline-flex items-center gap-1.5 rounded border border-astro-flame/40 bg-astro-flame/15 px-2.5 py-1 text-xs font-semibold text-astro-cream transition hover:bg-astro-flame/25"
                >
                  <Sparkles size={13} />
                  Simula Allerta Congiunzione
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Footer Disclaimer */}
      <div className="border-t border-white/10 bg-black/20 px-3 py-2 text-[0.62rem] text-white/50">
        <div className="flex items-center gap-1.5 leading-relaxed">
          <AlertTriangle size={12} className="shrink-0 text-astro-flame" />
          <span>Demo divulgativa. Score di rischio basato su distanze minime campionate in ECI.</span>
        </div>
      </div>
    </section>
  );
}
