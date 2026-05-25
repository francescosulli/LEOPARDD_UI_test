import { AlertTriangle, Crosshair, ShieldCheck } from 'lucide-react';
import type { ConjunctionEvent } from '../types/orbital';
import {
  formatDateTimeLong,
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
};

export default function RiskPanel({
  events,
  selectedEventId,
  onSelect,
  isPropagating,
}: RiskPanelProps) {
  return (
    <section className="mission-panel pointer-events-auto flex min-h-0 flex-1 flex-col rounded">
      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em]">
            <Crosshair size={16} className="text-astro-flame" />
            Possibili congiunzioni
          </div>
          <span className="rounded border border-white/10 bg-white/[0.05] px-2 py-1 text-[0.65rem] uppercase tracking-[0.15em] text-white/54">
            Top 10
          </span>
        </div>
        <p className="mt-1 text-xs text-white/56">Distanze in ECI coerenti, campionate nel tempo.</p>
      </div>

      <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
        {isPropagating ? (
          <div className="grid h-36 place-items-center rounded border border-white/10 bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-white/56">
            Analisi rischio...
          </div>
        ) : events.length ? (
          <div className="space-y-3">
            {events.map((event) => {
              const selected = event.id === selectedEventId;

              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onSelect(event)}
                  className={`w-full rounded border p-3 text-left transition hover:translate-y-[-1px] hover:border-astro-orange/45 ${
                    selected ? 'border-astro-orange/60 bg-astro-orange/14' : riskTone(event.riskLevel)
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{event.debrisName}</p>
                      <p className="mt-1 text-[0.68rem] uppercase tracking-[0.14em] text-white/50">
                        NORAD {event.noradId ?? 'n.d.'}
                        {event.isSynthetic ? ' · sintetico' : ''}
                      </p>
                    </div>
                    <span
                      className={`rounded px-2 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] ${
                        event.riskLevel === 'Critical'
                          ? 'bg-red-500/20 text-red-100'
                          : event.riskLevel === 'High'
                            ? 'bg-astro-orange/25 text-astro-cream'
                            : event.riskLevel === 'Medium'
                              ? 'bg-astro-flame/18 text-astro-cream'
                              : 'bg-white/12 text-white'
                      }`}
                    >
                      {riskLabel(event.riskLevel)}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/78">
                    <div>
                      <span className="block text-white/42">Distanza minima</span>
                      {formatKm(event.minDistanceKm, 2)}
                    </div>
                    <div>
                      <span className="block text-white/42">Velocità relativa</span>
                      {formatVelocity(event.relativeVelocityKmS)}
                    </div>
                    <div>
                      <span className="block text-white/42">TCA</span>
                      {formatDateTimeLong(event.closestApproachTime)}
                    </div>
                    <div>
                      <span className="block text-white/42">Affidabilità stimata</span>
                      {formatPercent(event.confidence)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid min-h-24 place-items-center rounded border border-white/10 bg-white/[0.04] p-3 text-center">
            <div>
              <ShieldCheck className="mx-auto mb-2 text-astro-orange" size={22} />
              <p className="text-xs font-medium text-white">No high-risk close approaches detected in this demo horizon.</p>
              <p className="mt-1 text-[0.68rem] text-white/54">
                Usa “Scenario sintetico” per mostrare una congiunzione dimostrativa al pubblico.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 px-4 py-3">
        <div className="flex gap-2 text-[0.68rem] leading-relaxed text-white/56">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-astro-flame" />
          <span>
            Demo for outreach and educational purposes. The risk score is a simplified estimate based on
            public orbital data and does not represent an operational collision probability.
          </span>
        </div>
      </div>
    </section>
  );
}
