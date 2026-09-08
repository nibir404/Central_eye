export type DivisionTelemetry = {
  division: string;
  demandMW: number;
  supplyMW: number;
  shortageMW: number;
  loadSheddingMW: number;
  loadSheddingHours: number;
  gridFrequency: number;
  towersTotal: number;
  towersActive: number;
  towers2G: number;
  towers3G: number;
  towers4G: number;
  towers5G: number;
  networkUptime: number;
  avgLatencyMs: number;
  throughputMbps: number;
  packetLossPct: number;
  activeIncidents: number;
};

export type OperatorTelemetry = {
  operator: string;
  subscribersM: number;
  tech2G: number;
  tech3G: number;
  tech4G: number;
  tech5G: number;
  avgLatencyMs: number;
  throughputMbps: number;
  uploadMbps: number;
  packetLossPct: number;
  callDropRate: number;
  siteUptimePct: number;
  btsSites: number;
  spectrumMHz: number;
  color: string;
};

export type SubseaCableStatus = {
  name: string;
  location: string;
  capacityTbps: number;
  activeTrafficGbps: number;
  utilizationPct: number;
  latencyMs: number;
  status: 'Optimal' | 'Degraded' | 'Critical';
};

export type TelemetryEvent = {
  id: string;
  timestamp: string;
  sector: 'Electricity' | 'Telecom' | 'System';
  severity: 'Info' | 'Warning' | 'Critical';
  division: string;
  message: string;
};

export type DistrictTelecomData = {
  rank: number;
  name: string;
  division: string;
  connectivityIndex: number;
  speedMbps: number;
  latencyMs: number;
  callDropRate: number;
  coverage4G: number;
  btsSites: number;
  status: 'Top Tier' | 'Moderate' | 'Underserved';
};

export type SpectrumBandInfo = {
  band: string;
  frequency: string;
  gpMHz: number;
  robiMHz: number;
  blMHz: number;
  teletalkMHz: number;
  totalMHz: number;
};

export type PipelineScenario = 'normal' | 'peak_heatwave' | 'storm_cyclone' | 'severe_load_shedding';

export const INITIAL_DIVISIONS: DivisionTelemetry[] = [
  {
    division: 'Dhaka',
    demandMW: 4850,
    supplyMW: 4620,
    shortageMW: 230,
    loadSheddingMW: 210,
    loadSheddingHours: 1.2,
    gridFrequency: 49.98,
    towersTotal: 14420,
    towersActive: 14350,
    towers2G: 840,
    towers3G: 1260,
    towers4G: 10860,
    towers5G: 1390,
    networkUptime: 99.51,
    avgLatencyMs: 22,
    throughputMbps: 42.5,
    packetLossPct: 0.12,
    activeIncidents: 1,
  },
  {
    division: 'Chattogram',
    demandMW: 2980,
    supplyMW: 2790,
    shortageMW: 190,
    loadSheddingMW: 180,
    loadSheddingHours: 1.8,
    gridFrequency: 49.95,
    towersTotal: 9120,
    towersActive: 8980,
    towers2G: 512,
    towers3G: 768,
    towers4G: 7130,
    towers5G: 570,
    networkUptime: 98.46,
    avgLatencyMs: 26,
    throughputMbps: 35.1,
    packetLossPct: 0.28,
    activeIncidents: 1,
  },
  {
    division: 'Rajshahi',
    demandMW: 1720,
    supplyMW: 1540,
    shortageMW: 180,
    loadSheddingMW: 175,
    loadSheddingHours: 2.4,
    gridFrequency: 49.92,
    towersTotal: 5810,
    towersActive: 5740,
    towers2G: 410,
    towers3G: 680,
    towers4G: 4480,
    towers5G: 270,
    networkUptime: 98.82,
    avgLatencyMs: 31,
    throughputMbps: 29.4,
    packetLossPct: 0.35,
    activeIncidents: 0,
  },
  {
    division: 'Khulna',
    demandMW: 1890,
    supplyMW: 1710,
    shortageMW: 180,
    loadSheddingMW: 170,
    loadSheddingHours: 2.1,
    gridFrequency: 49.91,
    towersTotal: 6080,
    towersActive: 5980,
    towers2G: 440,
    towers3G: 730,
    towers4G: 4680,
    towers5G: 230,
    networkUptime: 98.37,
    avgLatencyMs: 33,
    throughputMbps: 28.8,
    packetLossPct: 0.41,
    activeIncidents: 0,
  },
  {
    division: 'Barishal',
    demandMW: 940,
    supplyMW: 840,
    shortageMW: 100,
    loadSheddingMW: 95,
    loadSheddingHours: 2.7,
    gridFrequency: 49.89,
    towersTotal: 3450,
    towersActive: 3380,
    towers2G: 270,
    towers3G: 430,
    towers4G: 2590,
    towers5G: 160,
    networkUptime: 97.97,
    avgLatencyMs: 38,
    throughputMbps: 24.3,
    packetLossPct: 0.52,
    activeIncidents: 0,
  },
  {
    division: 'Sylhet',
    demandMW: 1280,
    supplyMW: 1110,
    shortageMW: 170,
    loadSheddingMW: 165,
    loadSheddingHours: 3.1,
    gridFrequency: 49.86,
    towersTotal: 4110,
    towersActive: 3910,
    towers2G: 340,
    towers3G: 510,
    towers4G: 3080,
    towers5G: 180,
    networkUptime: 95.13,
    avgLatencyMs: 48,
    throughputMbps: 22.2,
    packetLossPct: 1.15,
    activeIncidents: 1,
  },
  {
    division: 'Rangpur',
    demandMW: 1450,
    supplyMW: 1260,
    shortageMW: 190,
    loadSheddingMW: 185,
    loadSheddingHours: 2.9,
    gridFrequency: 49.90,
    towersTotal: 4980,
    towersActive: 4890,
    towers2G: 410,
    towers3G: 650,
    towers4G: 3740,
    towers5G: 180,
    networkUptime: 98.21,
    avgLatencyMs: 35,
    throughputMbps: 26.5,
    packetLossPct: 0.39,
    activeIncidents: 0,
  },
  {
    division: 'Mymensingh',
    demandMW: 1120,
    supplyMW: 990,
    shortageMW: 130,
    loadSheddingMW: 125,
    loadSheddingHours: 2.5,
    gridFrequency: 49.91,
    towersTotal: 3840,
    towersActive: 3770,
    towers2G: 310,
    towers3G: 490,
    towers4G: 2880,
    towers5G: 160,
    networkUptime: 98.17,
    avgLatencyMs: 34,
    throughputMbps: 27.1,
    packetLossPct: 0.36,
    activeIncidents: 0,
  },
];

export const INITIAL_OPERATORS: OperatorTelemetry[] = [
  {
    operator: 'Grameenphone',
    subscribersM: 84.33,
    tech2G: 6,
    tech3G: 8,
    tech4G: 76,
    tech5G: 10,
    avgLatencyMs: 23,
    throughputMbps: 38.8,
    uploadMbps: 16.4,
    packetLossPct: 0.14,
    callDropRate: 0.31,
    siteUptimePct: 99.42,
    btsSites: 21400,
    spectrumMHz: 107.4,
    color: '#62baf4',
  },
  {
    operator: 'Robi Axiata',
    subscribersM: 57.24,
    tech2G: 8,
    tech3G: 10,
    tech4G: 74,
    tech5G: 8,
    avgLatencyMs: 27,
    throughputMbps: 33.4,
    uploadMbps: 14.1,
    packetLossPct: 0.21,
    callDropRate: 0.36,
    siteUptimePct: 98.95,
    btsSites: 16800,
    spectrumMHz: 104.0,
    color: '#ac9af2',
  },
  {
    operator: 'Banglalink',
    subscribersM: 37.40,
    tech2G: 10,
    tech3G: 12,
    tech4G: 72,
    tech5G: 6,
    avgLatencyMs: 30,
    throughputMbps: 30.9,
    uploadMbps: 12.8,
    packetLossPct: 0.28,
    callDropRate: 0.42,
    siteUptimePct: 98.45,
    btsSites: 11500,
    spectrumMHz: 80.0,
    color: '#ecb663',
  },
  {
    operator: 'Teletalk',
    subscribersM: 6.83,
    tech2G: 18,
    tech3G: 22,
    tech4G: 55,
    tech5G: 5,
    avgLatencyMs: 41,
    throughputMbps: 21.5,
    uploadMbps: 8.5,
    packetLossPct: 0.65,
    callDropRate: 0.82,
    siteUptimePct: 96.20,
    btsSites: 4200,
    spectrumMHz: 45.2,
    color: '#67caae',
  },
];

export const INITIAL_CABLES: SubseaCableStatus[] = [
  {
    name: 'SEA-ME-WE 4',
    location: 'Cox’s Bazar Landing Station',
    capacityTbps: 1.8,
    activeTrafficGbps: 1420,
    utilizationPct: 78.8,
    latencyMs: 38,
    status: 'Optimal',
  },
  {
    name: 'SEA-ME-WE 5',
    location: 'Kuakata Landing Station',
    capacityTbps: 3.6,
    activeTrafficGbps: 2680,
    utilizationPct: 74.4,
    latencyMs: 34,
    status: 'Optimal',
  },
];

export const SPECTRUM_BANDS: SpectrumBandInfo[] = [
  { band: '900 MHz', frequency: 'Sub-1GHz Coverage', gpMHz: 14.4, robiMHz: 12.6, blMHz: 10.6, teletalkMHz: 10.2, totalMHz: 47.8 },
  { band: '1800 MHz', frequency: 'Mid-Band Capacity', gpMHz: 20.0, robiMHz: 18.0, blMHz: 15.0, teletalkMHz: 10.0, totalMHz: 63.0 },
  { band: '2100 MHz', frequency: '3G / 4G Core', gpMHz: 25.0, robiMHz: 23.4, blMHz: 15.0, teletalkMHz: 10.0, totalMHz: 73.4 },
  { band: '2300 MHz', frequency: 'TDD Capacity', gpMHz: 0.0, robiMHz: 60.0, blMHz: 40.0, teletalkMHz: 30.0, totalMHz: 130.0 },
  { band: '2600 MHz', frequency: '4G / 5G High Speed', gpMHz: 60.0, robiMHz: 60.0, blMHz: 40.0, teletalkMHz: 0.0, totalMHz: 160.0 },
  { band: '3.5 GHz', frequency: '5G NR Prime', gpMHz: 100.0, robiMHz: 100.0, blMHz: 60.0, teletalkMHz: 60.0, totalMHz: 320.0 },
];

export const DISTRICT_RANKINGS: DistrictTelecomData[] = [
  { rank: 1, name: 'Dhaka', division: 'Dhaka', connectivityIndex: 94.8, speedMbps: 46.2, latencyMs: 21, callDropRate: 0.22, coverage4G: 99.8, btsSites: 7420, status: 'Top Tier' },
  { rank: 2, name: 'Gazipur', division: 'Dhaka', connectivityIndex: 91.2, speedMbps: 42.1, latencyMs: 23, callDropRate: 0.26, coverage4G: 99.4, btsSites: 2980, status: 'Top Tier' },
  { rank: 3, name: 'Chattogram', division: 'Chattogram', connectivityIndex: 89.5, speedMbps: 38.6, latencyMs: 25, callDropRate: 0.29, coverage4G: 98.9, btsSites: 4850, status: 'Top Tier' },
  { rank: 4, name: 'Narayanganj', division: 'Dhaka', connectivityIndex: 88.7, speedMbps: 39.4, latencyMs: 24, callDropRate: 0.31, coverage4G: 99.1, btsSites: 1940, status: 'Top Tier' },
  { rank: 5, name: 'Sylhet Sadar', division: 'Sylhet', connectivityIndex: 86.4, speedMbps: 34.2, latencyMs: 28, callDropRate: 0.35, coverage4G: 97.5, btsSites: 1820, status: 'Top Tier' },
  { rank: 6, name: 'Rajshahi Sadar', division: 'Rajshahi', connectivityIndex: 84.1, speedMbps: 31.8, latencyMs: 30, callDropRate: 0.38, coverage4G: 96.8, btsSites: 1650, status: 'Moderate' },
  { rank: 7, name: 'Khulna Sadar', division: 'Khulna', connectivityIndex: 83.5, speedMbps: 30.5, latencyMs: 32, callDropRate: 0.39, coverage4G: 96.2, btsSites: 1710, status: 'Moderate' },
  { rank: 8, name: 'Bogura', division: 'Rajshahi', connectivityIndex: 81.2, speedMbps: 28.9, latencyMs: 33, callDropRate: 0.41, coverage4G: 95.4, btsSites: 1420, status: 'Moderate' },
  { rank: 9, name: 'Cumilla', division: 'Chattogram', connectivityIndex: 80.8, speedMbps: 29.2, latencyMs: 34, callDropRate: 0.42, coverage4G: 95.1, btsSites: 1680, status: 'Moderate' },
  { rank: 10, name: 'Barishal Sadar', division: 'Barishal', connectivityIndex: 78.4, speedMbps: 26.4, latencyMs: 36, callDropRate: 0.46, coverage4G: 94.2, btsSites: 1250, status: 'Moderate' },
  { rank: 60, name: 'Kurigram', division: 'Rangpur', connectivityIndex: 61.2, speedMbps: 16.5, latencyMs: 52, callDropRate: 0.88, coverage4G: 84.5, btsSites: 610, status: 'Underserved' },
  { rank: 61, name: 'Sunamganj', division: 'Sylhet', connectivityIndex: 59.5, speedMbps: 15.2, latencyMs: 56, callDropRate: 0.94, coverage4G: 82.1, btsSites: 540, status: 'Underserved' },
  { rank: 62, name: 'Khagrachhari', division: 'Chattogram', connectivityIndex: 54.8, speedMbps: 13.8, latencyMs: 61, callDropRate: 1.12, coverage4G: 76.4, btsSites: 390, status: 'Underserved' },
  { rank: 63, name: 'Rangamati', division: 'Chattogram', connectivityIndex: 51.4, speedMbps: 12.1, latencyMs: 64, callDropRate: 1.25, coverage4G: 72.8, btsSites: 360, status: 'Underserved' },
  { rank: 64, name: 'Bandarban', division: 'Chattogram', connectivityIndex: 48.2, speedMbps: 10.4, latencyMs: 69, callDropRate: 1.41, coverage4G: 68.5, btsSites: 280, status: 'Underserved' },
];

export function generateNextTick(
  prevDivisions: DivisionTelemetry[],
  prevOperators: OperatorTelemetry[],
  prevCables: SubseaCableStatus[],
  scenario: PipelineScenario
): {
  divisions: DivisionTelemetry[];
  operators: OperatorTelemetry[];
  cables: SubseaCableStatus[];
  event: TelemetryEvent | null;
} {
  const timeStr = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' BST';
  let scenarioFactor = 1.0;
  if (scenario === 'peak_heatwave') scenarioFactor = 1.25;
  if (scenario === 'severe_load_shedding') scenarioFactor = 1.35;
  if (scenario === 'storm_cyclone') scenarioFactor = 0.9;

  const updatedDivisions = prevDivisions.map((d) => {
    const demandDelta = (Math.random() - 0.48) * 45 * scenarioFactor;
    const newDemand = Math.max(700, Math.round(d.demandMW + demandDelta));
    let supplyDelta = (Math.random() - 0.5) * 30;
    if (scenario === 'severe_load_shedding') supplyDelta -= 35;
    const newSupply = Math.max(500, Math.min(newDemand + 50, Math.round(d.supplyMW + supplyDelta)));

    const shortage = Math.max(0, newDemand - newSupply);
    const loadShed = Math.round(shortage * 0.92);
    const loadShedHrs = Math.max(0.2, parseFloat((d.loadSheddingHours + (Math.random() - 0.5) * 0.1).toFixed(1)));

    const freqDelta = (Math.random() - 0.5) * 0.03;
    const newFreq = parseFloat(Math.min(50.15, Math.max(49.65, d.gridFrequency + freqDelta)).toFixed(2));

    let uptimeDelta = (Math.random() - 0.48) * 0.15;
    if (scenario === 'storm_cyclone' && (d.division === 'Chattogram' || d.division === 'Barishal' || d.division === 'Sylhet')) {
      uptimeDelta -= 0.6;
    }
    const newUptime = parseFloat(Math.min(99.9, Math.max(88.0, d.networkUptime + uptimeDelta)).toFixed(2));
    const activeTowers = Math.round((d.towersTotal * newUptime) / 100);

    const latDelta = (Math.random() - 0.5) * 2;
    const newLat = Math.max(18, Math.round(d.avgLatencyMs + latDelta));

    return {
      ...d,
      demandMW: newDemand,
      supplyMW: newSupply,
      shortageMW: shortage,
      loadSheddingMW: loadShed,
      loadSheddingHours: loadShedHrs,
      gridFrequency: newFreq,
      towersActive: activeTowers,
      networkUptime: newUptime,
      avgLatencyMs: newLat,
    };
  });

  const updatedOperators = prevOperators.map((op) => {
    const latDelta = (Math.random() - 0.5) * 1.5;
    const newLat = Math.max(15, Math.round(op.avgLatencyMs + latDelta));
    const tpDelta = (Math.random() - 0.5) * 1.2;
    const newTp = parseFloat(Math.max(10, op.throughputMbps + tpDelta).toFixed(1));
    return {
      ...op,
      avgLatencyMs: newLat,
      throughputMbps: newTp,
    };
  });

  const updatedCables = prevCables.map((c) => {
    const trafDelta = (Math.random() - 0.48) * 25;
    const newTraf = Math.max(800, Math.round(c.activeTrafficGbps + trafDelta));
    const maxGbps = c.capacityTbps * 1000;
    const util = parseFloat(((newTraf / maxGbps) * 100).toFixed(1));
    let status: 'Optimal' | 'Degraded' | 'Critical' = 'Optimal';
    if (util > 85) status = 'Degraded';
    if (util > 95) status = 'Critical';
    return {
      ...c,
      activeTrafficGbps: newTraf,
      utilizationPct: util,
      status,
    };
  });

  let newEvent: TelemetryEvent | null = null;
  const rand = Math.random();
  if (rand < 0.35) {
    const randomDiv = updatedDivisions[Math.floor(Math.random() * updatedDivisions.length)];
    if (rand < 0.12) {
      newEvent = {
        id: 'EVT-' + Math.floor(1000 + Math.random() * 9000),
        timestamp: timeStr,
        sector: 'Electricity',
        severity: randomDiv.shortageMW > 200 ? 'Critical' : 'Warning',
        division: randomDiv.division,
        message: `Grid frequency shifted to ${randomDiv.gridFrequency} Hz in ${randomDiv.division}. Shortage at ${randomDiv.shortageMW} MW.`,
      };
    } else if (rand < 0.25) {
      newEvent = {
        id: 'EVT-' + Math.floor(1000 + Math.random() * 9000),
        timestamp: timeStr,
        sector: 'Telecom',
        severity: randomDiv.networkUptime < 96 ? 'Warning' : 'Info',
        division: randomDiv.division,
        message: `${randomDiv.division} network uptime at ${randomDiv.networkUptime}%. Average latency: ${randomDiv.avgLatencyMs} ms.`,
      };
    } else {
      newEvent = {
        id: 'EVT-' + Math.floor(1000 + Math.random() * 9000),
        timestamp: timeStr,
        sector: 'System',
        severity: 'Info',
        division: 'National',
        message: `Real-time telemetry stream synchronized across ${updatedDivisions.length} divisions.`,
      };
    }
  }

  return {
    divisions: updatedDivisions,
    operators: updatedOperators,
    cables: updatedCables,
    event: newEvent,
  };
}
