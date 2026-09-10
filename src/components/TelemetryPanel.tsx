import { Activity, Database, Navigation, TimerReset } from 'lucide-react';
import type { CatalogStatus, ConjunctionEvent, DebrisFrame, SatelliteState } from '../types/orbital';
import { EARTH_RADIUS_KM, magnitude } from '../utils/math';
import { formatDateTime, formatKm, formatVelocity } from '../utils/formatting';
import { useLanguage } from '../i18n/LanguageContext';
import { translateCatalogStatus, translateRiskLabel } from '../i18n/translations';

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
  const { language, t } = useLanguage();
  const altitude = userState ? magnitude(userState.positionKm) - EARTH_RADIUS_KM : undefined;
  const speed = userState ? magnitude(userState.velocityKmS) : undefined;

  return (
    <div className="mission-panel pointer-events-auto absolute bottom-4 left-4 right-[408px] z-20 hidden min-h-24 rounded px-4 py-3 xl:block">
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-white/50">
            <Database size={13} />
            {t('telemetry.orbitalData')}
          </div>
          <p className="mt-2 text-sm text-white">{translateCatalogStatus(language, dataStatus)}</p>
          <p className="mt-1 truncate text-xs text-white/50">{message}</p>
        </div>
        <div className="rounded border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-white/50">
            <Navigation size={13} />
            {t('telemetry.satellite')}
          </div>
          <p className="mt-2 text-sm text-white">
            {altitude ? formatKm(altitude, 1, language) : t('telemetry.waiting')}
          </p>
          <p className="mt-1 text-xs text-white/50">
            {speed ? formatVelocity(speed, language) : t('telemetry.propagationNotStarted')}
          </p>
        </div>
        <div className="rounded border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-white/50">
            <TimerReset size={13} />
            {t('telemetry.simulatedTime')}
          </div>
          <p className="mt-2 text-sm text-white">
            {currentFrame ? formatDateTime(currentFrame.timestamp, language) : t('telemetry.na')}
          </p>
          <p className="mt-1 text-xs text-white/50">
            {t('telemetry.skippedPropagation')}: {skipped}
          </p>
        </div>
        <div className="rounded border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-white/50">
            <Activity size={13} />
            {t('telemetry.selectedObject')}
          </div>
          <p className="mt-2 truncate text-sm text-white">
            {selectedEvent ? selectedEvent.debrisName : t('telemetry.noConjunction')}
          </p>
          <p className="mt-1 text-xs text-white/50">
            {selectedEvent
              ? `${translateRiskLabel(language, selectedEvent.riskLevel)} · ${formatKm(selectedEvent.minDistanceKm, 2, language)}`
              : t('telemetry.selectEventSidebar')}
          </p>
        </div>
      </div>
    </div>
  );
}
