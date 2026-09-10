import { useCallback, useEffect, useMemo, useState } from 'react';
import ControlPanel from '../components/ControlPanel';
import GlobeScene from '../components/GlobeScene';
import LoadingOverlay from '../components/LoadingOverlay';
import RiskPanel from '../components/RiskPanel';
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
import { useLanguage } from '../i18n/LanguageContext';

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
  const { t } = useLanguage();
  const [input, setInput] = useState<SatelliteInput>(DEFAULT_INPUT);
  const [settings, setSettings] = useState<PropagationSettings>(DEFAULT_SETTINGS);
  const [catalog, setCatalog] = useState<DebrisObject[]>([]);
  const [sceneDebris, setSceneDebris] = useState<DebrisObject[]>([]);
  const [debrisFrames, setDebrisFrames] = useState<DebrisFrame[]>([]);
  const [userStates, setUserStates] = useState<SatelliteState[]>([]);
  const [events, setEvents] = useState<ConjunctionEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [dataStatus, setDataStatus] = useState<CatalogStatus | 'Loading'>('Loading');
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

  // Immediate reactive satellite state update when input changes
  useEffect(() => {
    try {
      const now = new Date();
      let user: SatelliteState;
      try {
        const userStatesNow = propagateUserSatellite(input, [now]);
        user = userStatesNow[0];
      } catch {
        user = propagateSyntheticState(input, now, now, input.name);
      }

      setUserStates((current) => {
        if (current.length <= 1) {
          return [user];
        }
        try {
          const timeline = createTimeline(now, settings.horizonHours, settings.stepMinutes);
          return propagateUserSatellite(input, timeline);
        } catch {
          return [user];
        }
      });
    } catch (error) {
      console.error(error);
    }
  }, [input, settings.horizonHours, settings.stepMinutes]);

  const initializeCurrentView = useCallback(
    (objects: DebrisObject[], maxDebris = DEFAULT_SETTINGS.maxDebris, satelliteInput = input) => {
      const now = new Date();
      let user: SatelliteState;
      try {
        const userStatesNow = propagateUserSatellite(satelliteInput, [now]);
        user = userStatesNow[0];
      } catch {
        user = propagateSyntheticState(satelliteInput, now, now, satelliteInput.name);
      }
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
    [input],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      setIsLoadingCatalog(true);

      try {
        const result = await fetchDebrisCatalog(1000);

        if (cancelled) {
          return;
        }

        setCatalog(result.objects);
        setDataStatus(result.status);
        initializeCurrentView(result.objects);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(error);
        setDataStatus('Cached demo data');
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
          console.error(error);
          setInputError(t('errors.propagation'));
          setIsPlaying(false);
        } finally {
          setIsPropagating(false);
        }
      }, 40);
    },
    [catalog, input, recomputeEvents, scenarioActive, settings.horizonHours, settings.maxDebris, settings.stepMinutes, t],
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

  const handleJumpToTca = useCallback(
    (timestamp: number) => {
      if (!debrisFrames.length) return;
      let bestIdx = 0;
      let bestDiff = Number.POSITIVE_INFINITY;
      debrisFrames.forEach((frame, idx) => {
        const diff = Math.abs(frame.timestamp - timestamp);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestIdx = idx;
        }
      });
      setFrameIndex(bestIdx);
    },
    [debrisFrames],
  );

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
        currentTimestamp={currentFrame?.timestamp}
        onJumpToTca={handleJumpToTca}
        isLoading={isLoadingCatalog || isPropagating}
      />
      <TopBar
        dataStatus={dataStatus}
        currentTime={currentFrame?.timestamp}
        debrisCount={sceneDebris.length}
        isPlaying={isPlaying}
      />
      <div className="absolute bottom-3 right-3 top-20 z-20 flex w-[440px] max-w-[calc(100vw-24px)] flex-col gap-3 lg:bottom-4 lg:right-4 lg:w-[470px]">
        <div className="min-h-0 flex-[1.15]">
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
        </div>
        <div className="min-h-0 flex-1">
          <RiskPanel
            events={events}
            selectedEventId={selectedEventId}
            onSelect={(event) => setSelectedEventId(event.id)}
            isPropagating={isPropagating}
            onRunScenario={handleScenario}
            onJumpToTca={handleJumpToTca}
          />
        </div>
      </div>
      <LoadingOverlay
        visible={isLoadingCatalog}
        message={t('loading.acquiringCatalog')}
      />
    </main>
  );
}
