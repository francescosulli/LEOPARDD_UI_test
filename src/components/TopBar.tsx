import { Activity, ArrowLeft, Database, RadioTower } from 'lucide-react';
import { Link } from 'react-router-dom';
import AstreoLogo from './AstreoLogo';
import type { CatalogStatus } from '../types/orbital';
import { formatDateTime } from '../utils/formatting';

type TopBarProps = {
  dataStatus: CatalogStatus | 'Loading';
  currentTime?: number;
  debrisCount: number;
  isPlaying: boolean;
};

export default function TopBar({ dataStatus, currentTime, debrisCount, isPlaying }: TopBarProps) {
  const isLive = dataStatus === 'Live CelesTrak';
  const isPublicCache = dataStatus === 'Cache TLE pubblica';
  const sourceLabel = isLive ? 'live' : isPublicCache ? 'cache reale' : 'fallback';

  return (
    <header className="pointer-events-auto mission-panel absolute left-4 right-4 top-4 z-20 flex min-h-16 items-center justify-between gap-4 rounded px-4 py-3">
      <div className="flex min-w-0 items-center gap-4">
        <AstreoLogo compact />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-astro-orange text-astro-orange status-light" />
            <p className="truncate text-sm font-semibold uppercase tracking-[0.18em] text-white">
              LEOPARDD
            </p>
          </div>
          <p className="truncate text-xs text-white/60">
            Low Earth Orbit Prediction and Analysis of Radar-Detected Debris
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 lg:gap-3">
        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
            <Database size={14} />
            <span>{dataStatus}</span>
            <span className={isLive || isPublicCache ? 'text-astro-orange' : 'text-astro-flame'}>
              {sourceLabel}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
            <RadioTower size={14} />
            <span>{debrisCount} oggetti</span>
          </div>
          <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
            <Activity size={14} className={isPlaying ? 'text-astro-orange' : 'text-white/52'} />
            <span>{currentTime ? formatDateTime(currentTime) : 'Simulazione pronta'}</span>
          </div>
        </div>
        <Link
          to="/"
          aria-label="Esci dalla demo e torna alla pagina iniziale"
          className="flex h-10 items-center justify-center gap-2 rounded border border-astro-orange/25 bg-astro-orange/10 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:border-astro-orange/60 hover:bg-astro-orange/18"
        >
          <ArrowLeft size={15} />
          <span>Esci dalla demo</span>
        </Link>
      </div>
    </header>
  );
}
