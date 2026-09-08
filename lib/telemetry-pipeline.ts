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
  packetLossPct: number;
  siteUptimePct: number;
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
    towersTotal: 8420,
    towersActive: 8350,
    towers2G: 840,
    towers3G: 1260,
    towers4G: 5460,
    towers5G: 790,
    networkUptime: 99.17,
    avgLatencyMs: 24,
    throughputMbps: 38.5,
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
    towersTotal: 5120,
    towersActive: 5040,
    towers2G: 512,
    towers3G: 768,
    towers4G: 3430,
    towers5G: 330,
    networkUptime: 98.44,
    avgLatencyMs: 28,
    throughputMbps: 32.1,
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
    towersTotal: 3410,
    towersActive: 3370,
    towers2G: 410,
    towers3G: 680,
    towers4G: 2180,
    towers5G: 100,
    networkUptime: 98.82,
    avgLatencyMs: 34,
    throughputMbps: 26.4,
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
    towersTotal: 3680,
    towersActive: 3620,
    towers2G: 440,
    towers3G: 730,
    towers4G: 2360,
    towers5G: 90,
    networkUptime: 98.37,
    avgLatencyMs: 36,
    throughputMbps: 24.8,
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
    towersTotal: 1950,
    towersActive: 1910,
    towers2G: 270,
    towers3G: 430,
    towers4G: 1160,
    towers5G: 50,
    networkUptime: 97.95,
    avgLatencyMs: 41,
    throughputMbps: 21.3,
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
    towersTotal: 2410,
    towersActive: 2290,
    towers2G: 340,
    towers3G: 510,
    towers4G: 1380,
    towers5G: 60,
    networkUptime: 95.02,
    avgLatencyMs: 54,
    throughputMbps: 18.2,
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
    towersTotal: 2980,
    towersActive: 2930,
    towers2G: 410,
    towers3G: 650,
    towers4G: 1810,
    towers5G: 60,
    networkUptime: 98.32,
    avgLatencyMs: 38,
    throughputMbps: 23.5,
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
    towersTotal: 2240,
    towersActive: 2200,
    towers2G: 310,
    towers3G: 490,
    towers4G: 1350,
    towers5G: 50,
    networkUptime: 98.21,
    avgLatencyMs: 37,
    throughputMbps: 24.1,
    packetLossPct: 0.36,
    activeIncidents: 0,
  },
];

export const INITIAL_OPERATORS: OperatorTelemetry[] = [
  {
    operator: 'Grameenphone',
    subscribersM: 84.33,
    tech2G: 10,
    tech3G: 15,
    tech4G: 68,
    tech5G: 7,
    avgLatencyMs: 25,
    throughputMbps: 35.8,
    packetLossPct: 0.18,
    siteUptimePct: 99.12,
    color: '#62baf4',
  },
  {
    operator: 'Robi Axiata',
    subscribersM: 57.24,
    tech2G: 12,
    tech3G: 18,
    tech4G: 65,
    tech5G: 5,
    avgLatencyMs: 29,
    throughputMbps: 31.4,
    packetLossPct: 0.24,
    siteUptimePct: 98.65,
    color: '#ac9af2',
  },
  {
    operator: 'Banglalink',
    subscribersM: 37.40,
    tech2G: 14,
    tech3G: 20,
    tech4G: 62,
    tech5G: 4,
    avgLatencyMs: 32,
    throughputMbps: 28.9,
    packetLossPct: 0.31,
    siteUptimePct: 98.15,
    color: '#ecb663',
  },
  {
    operator: 'Teletalk',
    subscribersM: 6.83,
    tech2G: 22,
    tech3G: 28,
    tech4G: 47,
    tech5G: 3,
    avgLatencyMs: 44,
    throughputMbps: 19.5,
    packetLossPct: 0.72,
    siteUptimePct: 95.80,
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

  // Generate random notification event
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
