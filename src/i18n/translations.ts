import type { CatalogMessage, CatalogStatus, RiskLevel } from '../types/orbital';
import type { Language } from './LanguageContext';

export const translations = {
  'landing.badge': {
    it: 'Demo pubblica non operativa',
    en: 'Non-operational public demo',
  },
  'landing.tag': {
    it: 'ASTREO / Demo LEOPARDD',
    en: 'ASTREO / LEOPARDD Demo',
  },
  'landing.description': {
    it: 'Esplora un ambiente semplificato di Space Situational Awareness: visualizza i detriti spaziali, inserisci un satellite, propaga la sua orbita e individua i possibili passaggi ravvicinati.',
    en: 'Explore a simplified Space Situational Awareness environment: visualize space debris, insert a satellite, propagate its orbit, and identify possible close approaches.',
  },
  'landing.cta': {
    it: 'Fai partire la demo',
    en: 'Launch the demo',
  },

  'topBar.objectsSuffix': {
    it: 'oggetti',
    en: 'objects',
  },
  'topBar.simulationReady': {
    it: 'Simulazione pronta',
    en: 'Simulation ready',
  },
  'topBar.exitDemo': {
    it: 'Esci dalla demo',
    en: 'Exit demo',
  },
  'topBar.exitDemoAria': {
    it: 'Esci dalla demo e torna alla pagina iniziale',
    en: 'Exit the demo and return to the home page',
  },
  'topBar.sourceLive': {
    it: 'live',
    en: 'live',
  },
  'topBar.sourceCache': {
    it: 'cache reale',
    en: 'real cache',
  },
  'topBar.sourceFallback': {
    it: 'fallback',
    en: 'fallback',
  },

  'controlPanel.missionConfig': {
    it: 'Configurazione Missione',
    en: 'Mission Configuration',
  },
  'controlPanel.issScenarioActive': {
    it: 'Scenario ISS Attivo',
    en: 'ISS Scenario Active',
  },
  'controlPanel.tabIss': {
    it: 'Scenario ISS',
    en: 'ISS Scenario',
  },
  'controlPanel.tabKepler': {
    it: 'Keplero',
    en: 'Kepler',
  },
  'controlPanel.tabTle': {
    it: 'Editor TLE',
    en: 'TLE Editor',
  },
  'controlPanel.issStationLabel': {
    it: 'Stazione Spaziale Internazionale',
    en: 'International Space Station',
  },
  'controlPanel.massLabel': {
    it: 'Massa',
    en: 'Mass',
  },
  'controlPanel.altitudeShort': {
    it: 'Quota',
    en: 'Altitude',
  },
  'controlPanel.inclinationShort': {
    it: 'Inclinaz.',
    en: 'Inclin.',
  },
  'controlPanel.velocityShort': {
    it: 'Velocità',
    en: 'Velocity',
  },
  'controlPanel.safetyBoxLabel': {
    it: 'Safety Box 4×50×50 km:',
    en: 'Safety Box 4×50×50 km:',
  },
  'controlPanel.safetyBoxBody': {
    it: 'se un detrito transita con distanza critica, viene valutata una manovra di evasione',
    en: 'if debris passes at a critical distance, an evasive maneuver is evaluated:',
  },
  'controlPanel.damLabel': {
    it: 'DAM (Debris Avoidance Maneuver)',
    en: 'DAM (Debris Avoidance Maneuver)',
  },
  'controlPanel.propagateIss': {
    it: 'Propaga ISS',
    en: 'Propagate ISS',
  },
  'controlPanel.damAlert': {
    it: 'Allerta DAM',
    en: 'DAM Alert',
  },
  'controlPanel.quickPresets': {
    it: 'Preset Rapidi',
    en: 'Quick Presets',
  },
  'controlPanel.presetAstreo': {
    it: 'ASTREO Sat',
    en: 'ASTREO Sat',
  },
  'controlPanel.presetHubble': {
    it: 'Hubble',
    en: 'Hubble',
  },
  'controlPanel.presetStarlink': {
    it: 'Starlink',
    en: 'Starlink',
  },
  'controlPanel.altitude': {
    it: 'Altitudine',
    en: 'Altitude',
  },
  'controlPanel.inclination': {
    it: 'Inclinazione',
    en: 'Inclination',
  },
  'controlPanel.eccentricity': {
    it: 'Eccentricità',
    en: 'Eccentricity',
  },
  'controlPanel.raan': {
    it: 'RAAN (Ω)',
    en: 'RAAN (Ω)',
  },
  'controlPanel.argPerigee': {
    it: 'Arg. perigeo (ω)',
    en: 'Arg. of perigee (ω)',
  },
  'controlPanel.meanAnomaly': {
    it: 'Anomalia media (M)',
    en: 'Mean anomaly (M)',
  },
  'controlPanel.satelliteName': {
    it: 'Nome Satellite / Payload',
    en: 'Satellite Name / Payload',
  },
  'controlPanel.tleLine1': {
    it: 'Riga TLE 1',
    en: 'TLE Line 1',
  },
  'controlPanel.tleLine2': {
    it: 'Riga TLE 2',
    en: 'TLE Line 2',
  },
  'controlPanel.formatOk': {
    it: 'Formato OK',
    en: 'Format OK',
  },
  'controlPanel.mustStartWith1': {
    it: 'Deve iniziare con "1 "',
    en: 'Must start with "1 "',
  },
  'controlPanel.mustStartWith2': {
    it: 'Deve iniziare con "2 "',
    en: 'Must start with "2 "',
  },
  'controlPanel.sgp4Note': {
    it: 'Propagazione SGP4 automatica compatibile con NORAD/CelesTrak.',
    en: 'Automatic SGP4 propagation compatible with NORAD/CelesTrak.',
  },
  'controlPanel.simulationParams': {
    it: 'Parametri Simulazione',
    en: 'Simulation Parameters',
  },
  'controlPanel.horizonShort': {
    it: 'Orizzonte',
    en: 'Horizon',
  },
  'controlPanel.stepShort': {
    it: 'Passo',
    en: 'Step',
  },
  'controlPanel.catalogObjects': {
    it: 'Oggetti catalogo attivi',
    en: 'Active catalog objects',
  },
  'controlPanel.hour1': { it: '1 ora', en: '1 hour' },
  'controlPanel.hours6': { it: '6 ore', en: '6 hours' },
  'controlPanel.hours12': { it: '12 ore', en: '12 hours' },
  'controlPanel.hours24': { it: '24 ore', en: '24 hours' },
  'controlPanel.days3': { it: '3 giorni', en: '3 days' },
  'controlPanel.days7': { it: '7 giorni', en: '7 days' },
  'controlPanel.min1': { it: '1 min', en: '1 min' },
  'controlPanel.min5': { it: '5 min', en: '5 min' },
  'controlPanel.min10': { it: '10 min', en: '10 min' },
  'controlPanel.min30': { it: '30 min', en: '30 min' },
  'controlPanel.debris300': { it: '300 oggetti', en: '300 objects' },
  'controlPanel.debris600': { it: '600 oggetti', en: '600 objects' },
  'controlPanel.debris1000': { it: '1000 oggetti', en: '1000 objects' },
  'controlPanel.pauseSimulation': {
    it: 'Pausa simulazione',
    en: 'Pause simulation',
  },
  'controlPanel.playSimulation': {
    it: 'Riproduci simulazione',
    en: 'Play simulation',
  },
  'controlPanel.speedLabel': {
    it: 'Velocità',
    en: 'Speed',
  },
  'controlPanel.calculating': {
    it: 'Calcolo...',
    en: 'Calculating...',
  },
  'controlPanel.propagateOrbit': {
    it: 'Propaga orbita',
    en: 'Propagate orbit',
  },
  'controlPanel.scenarioIss': {
    it: 'Allerta ISS',
    en: 'ISS Alert',
  },
  'controlPanel.scenarioDefault': {
    it: 'Scenario Demo',
    en: 'Demo Scenario',
  },
  'controlPanel.resetAria': {
    it: 'Reset',
    en: 'Reset',
  },

  'riskPanel.title': {
    it: 'Possibili Congiunzioni & Rischio',
    en: 'Possible Conjunctions & Risk',
  },
  'riskPanel.eventSingular': {
    it: 'Evento',
    en: 'Event',
  },
  'riskPanel.eventPlural': {
    it: 'Eventi',
    en: 'Events',
  },
  'riskPanel.top10': {
    it: 'Top 10',
    en: 'Top 10',
  },
  'riskPanel.calculating': {
    it: 'Calcolo congiunzioni in corso...',
    en: 'Calculating conjunctions...',
  },
  'riskPanel.norad': {
    it: 'NORAD',
    en: 'NORAD',
  },
  'riskPanel.demoSuffix': {
    it: 'DEMO',
    en: 'DEMO',
  },
  'riskPanel.distanceShort': {
    it: 'Distanza',
    en: 'Distance',
  },
  'riskPanel.velRelShort': {
    it: 'Vel. Rel.',
    en: 'Rel. Vel.',
  },
  'riskPanel.tca': {
    it: 'TCA',
    en: 'TCA',
  },
  'riskPanel.confidenceShort': {
    it: 'Affidabilità',
    en: 'Confidence',
  },
  'riskPanel.emptyState': {
    it: "Nessuna congiunzione critica nell'orizzonte impostato.",
    en: 'No critical conjunction detected in the configured horizon.',
  },
  'riskPanel.simulateAlert': {
    it: 'Simula Allerta Congiunzione',
    en: 'Simulate Conjunction Alert',
  },
  'riskPanel.disclaimer': {
    it: 'Demo divulgativa. Score di rischio basato su distanze minime campionate in ECI.',
    en: 'Outreach demo. Risk score based on minimum distances sampled in ECI.',
  },
  'riskPanel.na': {
    it: 'n.d.',
    en: 'N/A',
  },

  'telemetry.orbitalData': {
    it: 'Dati orbitali',
    en: 'Orbital data',
  },
  'telemetry.satellite': {
    it: 'Satellite',
    en: 'Satellite',
  },
  'telemetry.simulatedTime': {
    it: 'Tempo simulato',
    en: 'Simulated time',
  },
  'telemetry.selectedObject': {
    it: 'Oggetto selezionato',
    en: 'Selected object',
  },
  'telemetry.waiting': {
    it: 'In attesa',
    en: 'Waiting',
  },
  'telemetry.propagationNotStarted': {
    it: 'Propagazione non avviata',
    en: 'Propagation not started',
  },
  'telemetry.na': {
    it: 'n.d.',
    en: 'N/A',
  },
  'telemetry.skippedPropagation': {
    it: 'Scarti propagazione',
    en: 'Propagation skips',
  },
  'telemetry.noConjunction': {
    it: 'Nessuna congiunzione',
    en: 'No conjunction',
  },
  'telemetry.selectEventSidebar': {
    it: 'Seleziona un evento nella sidebar',
    en: 'Select an event in the sidebar',
  },

  'loading.acquiringCatalog': {
    it: 'Acquisizione catalogo orbitale...',
    en: 'Acquiring orbital catalog...',
  },
  'loading.propagatingStates': {
    it: 'Propagazione stati orbitali...',
    en: 'Propagating orbital states...',
  },

  'errors.catalogLoad': {
    it: 'Errore nel caricamento dei dati orbitali.',
    en: 'Error loading orbital data.',
  },
  'errors.propagation': {
    it: 'Errore durante propagazione o validazione del satellite.',
    en: 'Error during satellite propagation or validation.',
  },

  'status.liveCelestrak': {
    it: 'Live CelesTrak',
    en: 'Live CelesTrak',
  },
  'status.publicCache': {
    it: 'Cache TLE pubblica',
    en: 'Public TLE cache',
  },
  'status.cachedDemo': {
    it: 'Dati demo in cache',
    en: 'Cached demo data',
  },
  'status.loading': {
    it: 'Caricamento...',
    en: 'Loading...',
  },

  'globe.debrisRendered': {
    it: 'Oggetti renderizzati',
    en: 'Objects rendered',
  },
} as const;

export type TranslationKey = keyof typeof translations;

export function translateCatalogStatus(language: Language, status: CatalogStatus | 'Loading'): string {
  switch (status) {
    case 'Live CelesTrak':
      return translations['status.liveCelestrak'][language];
    case 'Cache TLE pubblica':
      return translations['status.publicCache'][language];
    case 'Cached demo data':
      return translations['status.cachedDemo'][language];
    default:
      return translations['status.loading'][language];
  }
}

const riskLabels: Record<RiskLevel, { it: string; en: string }> = {
  Low: { it: 'Basso', en: 'Low' },
  Medium: { it: 'Medio', en: 'Medium' },
  High: { it: 'Alto', en: 'High' },
  Critical: { it: 'Critico', en: 'Critical' },
};

export function translateRiskLabel(language: Language, level: RiskLevel): string {
  return riskLabels[level][language];
}

export function formatCatalogMessage(language: Language, message: CatalogMessage): string {
  const { key, count, supplement } = message;

  switch (key) {
    case 'offlineCacheReal':
      return language === 'it'
        ? `${count} TLE reali caricati dalla cache pubblica locale. Modalità offline/cache attiva.`
        : `${count} real TLEs loaded from the local public cache. Offline/cache mode active.`;
    case 'offlineCacheDemo':
      return language === 'it'
        ? `${count} oggetti caricati dal catalogo demo locale.`
        : `${count} objects loaded from the local demo catalog.`;
    case 'liveSupplemented':
      return language === 'it'
        ? `${count} oggetti CelesTrak GP + ${supplement ?? 0} supplementari da cache TLE locale.`
        : `${count} CelesTrak GP objects + ${supplement ?? 0} supplemented from the local TLE cache.`;
    case 'liveFull':
      return language === 'it'
        ? `${count} oggetti acquisiti da CelesTrak GP.`
        : `${count} objects acquired from CelesTrak GP.`;
    case 'cacheRealFallback':
      return language === 'it'
        ? `${count} TLE reali caricati dalla cache pubblica locale. ESA DISCOS richiede autenticazione per l'accesso diretto.`
        : `${count} real TLEs loaded from the local public cache. ESA DISCOS requires authentication for direct access.`;
    case 'cacheDemoFallback':
      return language === 'it'
        ? `${count} oggetti caricati dal catalogo demo locale.`
        : `${count} objects loaded from the local demo catalog.`;
    default:
      return '';
  }
}
