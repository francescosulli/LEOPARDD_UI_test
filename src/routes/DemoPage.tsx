import { useCallback, useEffect, useMemo, useState } from 'react';
import ControlPanel from '../components/ControlPanel';
import GlobeScene from '../components/GlobeScene';
import LoadingOverlay from '../components/LoadingOverlay';
import RiskPanel from '../components/RiskPanel';
import TelemetryPanel from '../components/TelemetryPanel';
import TopBar from '../components/TopBar';
import { fetchDebrisCatalog } from '../services/celestrak';
import { detectConjunctions } from '../services/conjunction';
import { createTimeline, propagateDebrisCatalog, propagateUserSatellite } from '../services/propagation';
import { appendDramaticDemoDebris, propagateSyntheticState } from '../services/syntheticOrbit';
import type {
  CatalogStatus,
  ConjunctionEvent,
  DebrisFrame,
  DebrisObject,
  PropagationSettings,
  SatelliteInput,
  SatelliteState,
} from '../types/orbital';

const DEFAULT_INPUT: SatelliteInput = {
  mode: 'simple',
  name: 'ASTREO-DEMO-SAT',
  altitudeKm: 550,
  inclinationDeg: 51.6,
  eccentricity: 0.0005,
  raanDeg: 0,
  argumentOfPerigeeDeg: 0,
  meanAnomalyDeg: 0,
  tleName: '',
  tleLine1: '1 25544U 98067A   26135.54791667  .00016717  00000+0  30170-3 0  9995',
  tleLine2: '2 25544  51.6404 125.1561 0005829 116.5293 347.5920 15.50054895482442',
};

const DEFAULT_SETTINGS: PropagationSettings = {
  horizonHours: 6,
  stepMinutes: 5,
  maxDebris: 600,
};

function useSimulationClock(frameCount: number, isPlaying: boolean, speed: number, setFrameIndex: (value: number | ((current: number) => number)) => void) {
  useEffect(() => {
    if (!isPlaying || frameCount <= 1) {
      return undefined;
    }

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const deltaSeconds = (now - last) / 1000;
      last = now;
      setFrameIndex((current) => (current + deltaSeconds * speed) % frameCount);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [frameCount, isPlaying, setFrameIndex, speed]);
}

export default function DemoPage() {
  const [input, setInput] = useState<SatelliteInput>(DEFAULT_INPUT);
  const [settings, setSettings] = useState<PropagationSettings>(DEFAULT_SETTINGS);
  const [catalog, setCatalog] = useState<DebrisObject[]>([]);
  const [sceneDebris, setSceneDebris] = useState<DebrisObject[]>([]);
  const [debrisFrames, setDebrisFrames] = useState<DebrisFrame[]>([]);
  const [userStates, setUserStates] = useState<SatelliteState[]>([]);
  const [events, setEvents] = useState<ConjunctionEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [dataStatus, setDataStatus] = useState<CatalogStatus | 'Loading'>('Loading');
  const [catalogMessage, setCatalogMessage] = useState('Acquiring orbital catalog...');
  const [skippedDebris, setSkippedDebris] = useState(0);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [isPropagating, setIsPropagating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(12);
  const [frameIndex, setFrameIndex] = useState(0);
  const [scenarioActive, setScenarioActive] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  useSimulationClock(debrisFrames.length, isPlaying, speed, setFrameIndex);

  const currentFrameIndex = debrisFrames.length
    ? Math.min(debrisFrames.length - 1, Math.floor(frameIndex) % debrisFrames.length)
    : 0;
  const currentFrame = debrisFrames[currentFrameIndex];
  const currentUserState = userStates[currentFrameIndex] ?? userStates[0];
  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );

  const recomputeEvents = useCallback(
    (nextUserStates: SatelliteState[], nextDebris: DebrisObject[], nextFrames: DebrisFrame[]) => {
      const nextEvents = detectConjunctions(nextUserStates, nextDebris, nextFrames);
      setEvents(nextEvents);
      setSelectedEventId((current) => {
        if (current && nextEvents.some((event) => event.id === current)) {
          return current;
        }

        return nextEvents[0]?.id ?? null;
      });
    },
    [],
  );

  const initializeCurrentView = useCallback(
    (objects: DebrisObject[], maxDebris = DEFAULT_SETTINGS.maxDebris) => {
      const now = new Date();
      const user = propagateSyntheticState(DEFAULT_INPUT, now, now, DEFAULT_INPUT.name);
      const propagatedDebris = propagateDebrisCatalog(objects, [now], maxDebris);

      setSceneDebris(propagatedDebris.objects);
      setDebrisFrames(propagatedDebris.frames);
      setUserStates([user]);
      setSkippedDebris(propagatedDebris.skipped);
      setEvents([]);
      setSelectedEventId(null);
      setFrameIndex(0);
      setIsPlaying(false);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      setIsLoadingCatalog(true);
      setCatalogMessage('Acquiring orbital catalog...');

      try {
        const result = await fetchDebrisCatalog(1000);

        if (cancelled) {
          return;
        }

        setCatalog(result.objects);
        setDataStatus(result.status);
        setCatalogMessage(result.message);
        initializeCurrentView(result.objects);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setDataStatus('Cached demo data');
        setCatalogMessage(
          error instanceof Error ? error.message : 'Errore nel caricamento dei dati orbitali.',
        );
      } finally {
        if (!cancelled) {
          setIsLoadingCatalog(false);
        }
      }
    }

    loadCatalog();

    return () => {
      cancelled = true;
    };
  }, [initializeCurrentView]);

  const runPropagation = useCallback(
    (withScenario = scenarioActive) => {
      if (!catalog.length) {
        return;
      }

      setIsPropagating(true);
      setInputError(null);

      window.setTimeout(() => {
        try {
          const startDate = new Date();
          const timeline = createTimeline(startDate, settings.horizonHours, settings.stepMinutes);
          const nextUserStates = propagateUserSatellite(input, timeline);
          const propagatedDebris = propagateDebrisCatalog(catalog, timeline, settings.maxDebris);
          const scenario = withScenario
            ? appendDramaticDemoDebris(propagatedDebris.objects, propagatedDebris.frames, nextUserStates)
            : { objects: propagatedDebris.objects, frames: propagatedDebris.frames };

          setSceneDebris(scenario.objects);
          setDebrisFrames(scenario.frames);
          setUserStates(nextUserStates);
          setSkippedDebris(propagatedDebris.skipped);
          recomputeEvents(nextUserStates, scenario.objects, scenario.frames);
          setFrameIndex(0);
          setIsPlaying(true);
          setScenarioActive(withScenario);
        } catch (error) {
          setInputError(
            error instanceof Error
              ? error.message
              : 'Errore durante propagazione o validazione del satellite.',
          );
          setIsPlaying(false);
        } finally {
          setIsPropagating(false);
        }
      }, 40);
    },
    [catalog, input, recomputeEvents, scenarioActive, settings.horizonHours, settings.maxDebris, settings.stepMinutes],
  );

  useEffect(() => {
    if (userStates.length > 1 && debrisFrames.length > 1 && sceneDebris.length) {
      recomputeEvents(userStates, sceneDebris, debrisFrames);
    }
  }, [debrisFrames, recomputeEvents, sceneDebris, userStates]);

  const handleReset = useCallback(() => {
    setInput(DEFAULT_INPUT);
    setSettings(DEFAULT_SETTINGS);
    setScenarioActive(false);
    setInputError(null);
    initializeCurrentView(catalog, DEFAULT_SETTINGS.maxDebris);
  }, [catalog, initializeCurrentView]);

  const handleScenario = useCallback(() => {
    runPropagation(true);
  }, [runPropagation]);

  const userTrail = userStates.length > 1 ? userStates : [];

  return (
    <main className="relative h-screen overflow-hidden bg-astro-950 text-white">
      <GlobeScene
        debrisObjects={sceneDebris}
        debrisFrame={currentFrame}
        debrisFrames={debrisFrames}
        userState={currentUserState}
        userTrail={userTrail}
        selectedEvent={selectedEvent}
      />
      <TopBar
        dataStatus={dataStatus}
        currentTime={currentFrame?.timestamp}
        debrisCount={sceneDebris.length}
        isPlaying={isPlaying}
      />
      <div className="absolute bottom-3 left-3 right-3 top-24 z-20 grid grid-rows-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-3 lg:bottom-4 lg:left-auto lg:right-4 lg:w-[380px] lg:grid-rows-[minmax(0,1.35fr)_minmax(0,0.95fr)] lg:gap-4">
        <ControlPanel
          input={input}
          setInput={setInput}
          settings={settings}
          setSettings={setSettings}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          speed={speed}
          setSpeed={setSpeed}
          scenarioActive={scenarioActive}
          isPropagating={isPropagating}
          inputError={inputError}
          onPropagate={runPropagation}
          onReset={handleReset}
          onScenario={handleScenario}
        />
        <RiskPanel
          events={events}
          selectedEventId={selectedEventId}
          onSelect={(event) => setSelectedEventId(event.id)}
          isPropagating={isPropagating}
        />
      </div>
      <TelemetryPanel
        dataStatus={dataStatus}
        message={catalogMessage}
        currentFrame={currentFrame}
        userState={currentUserState}
        selectedEvent={selectedEvent}
        skipped={skippedDebris}
      />
      <LoadingOverlay
        visible={isLoadingCatalog || isPropagating}
        message={isLoadingCatalog ? 'Acquiring orbital catalog...' : 'Propagating orbital states...'}
      />
    </main>
  );
}
