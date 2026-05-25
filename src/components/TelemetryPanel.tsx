import { Activity, Database, Navigation, TimerReset } from 'lucide-react';
import type { CatalogStatus, ConjunctionEvent, DebrisFrame, SatelliteState } from '../types/orbital';
import { EARTH_RADIUS_KM, magnitude } from '../utils/math';
import { formatDateTime, formatKm, formatVelocity, riskLabel } from '../utils/formatting';

type TelemetryPanelProps = {
  dataStatus: CatalogStatus | 'Loading';
  message: string;
  currentFrame?: DebrisFrame;
  userState?: SatelliteState;
  selectedEvent?: ConjunctionEvent | null;
  skipped: number;
};

export default function TelemetryPanel({
  dataStatus,
  message,
  currentFrame,
  userState,
  selectedEvent,
  skipped,
}: TelemetryPanelProps) {
  const altitude = userState ? magnitude(userState.positionKm) - EARTH_RADIUS_KM : undefined;
  const speed = userState ? magnitude(userState.velocityKmS) : undefined;

  return (
    <div className="mission-panel pointer-events-auto absolute bottom-4 left-4 right-[408px] z-20 hidden min-h-24 rounded px-4 py-3 xl:block">
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-white/50">
            <Database size={13} />
            Dati orbitali
          </div>
          <p className="mt-2 text-sm text-white">{dataStatus}</p>
          <p className="mt-1 truncate text-xs text-white/50">{message}</p>
        </div>
        <div className="rounded border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-white/50">
            <Navigation size={13} />
            Satellite
          </div>
          <p className="mt-2 text-sm text-white">{altitude ? formatKm(altitude, 1) : 'In attesa'}</p>
          <p className="mt-1 text-xs text-white/50">
            {speed ? formatVelocity(speed) : 'Propagazione non avviata'}
          </p>
        </div>
        <div className="rounded border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-white/50">
            <TimerReset size={13} />
            Tempo simulato
          </div>
          <p className="mt-2 text-sm text-white">
            {currentFrame ? formatDateTime(currentFrame.timestamp) : 'n.d.'}
          </p>
          <p className="mt-1 text-xs text-white/50">Scarti propagazione: {skipped}</p>
        </div>
        <div className="rounded border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-white/50">
            <Activity size={13} />
            Oggetto selezionato
          </div>
          <p className="mt-2 truncate text-sm text-white">
            {selectedEvent ? selectedEvent.debrisName : 'Nessuna congiunzione'}
          </p>
          <p className="mt-1 text-xs text-white/50">
            {selectedEvent
              ? `${riskLabel(selectedEvent.riskLevel)} · ${formatKm(selectedEvent.minDistanceKm, 2)}`
              : 'Seleziona un evento nella sidebar'}
          </p>
        </div>
      </div>
    </div>
  );
}
