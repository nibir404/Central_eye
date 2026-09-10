export type LicenseCategory = 'MNO' | 'IIG' | 'ICX' | 'IGW' | 'ANS / ISP' | 'NTTN';

export type OperatorSLAData = {
  id: string;
  name: string;
  category: LicenseCategory;
  selfReportedUptime: number; // e.g. 99.85%
  customerCrossCheckedUptime: number; // e.g. 99.12%
  discrepancyDelta: number; // e.g. -0.73%
  slaBenchmark: number; // e.g. 99.50%
  complianceRate: number; // e.g. 96.4%
  status: 'Verified' | 'Minor Discrepancy' | 'SLA Breach Flagged' | 'Under Audit';
  validationProbes: string[]; // e.g. ['Customer Enterprise SNMP', 'BDIX Active Ping Probes', 'Downstream Outage Tickets']
  activeIncidents: number;
  mttrMins: number; // Mean Time To Resolve
  subscribersOrClients: string;
  details: string;
  trend24h: number[];
};

export type IIGBGPReport = {
  id: string;
  operator: string;
  asn: string; // e.g. 'AS24389'
  adjacenciesTotal: number; // Adjacency count (reflecting connection speed & peer count)
  adjacenciesIPv4: number;
  adjacenciesIPv6: number;
  routedPrefixesIPv4: number; // Routing number (reflecting redundancy & reachability volume)
  routedPrefixesIPv6: number;
  routingRedundancyScore: number; // 0-100 score reflecting redundancies & path diversity
  upstreamTier1: string[]; // e.g. ['Hurricane Electric (AS6939)', 'Tata (AS6453)', 'NTT (AS2914)']
  ixpConnections: string[]; // e.g. ['BDIX', 'Equinix SG', 'SGIX', 'HKIX']
  flapStabilityIndex: 'Optimal (No Flaps)' | 'Minor Flap Alert' | 'Flapping Detected';
  downstreamISPsCount: number;
  capacityGbps: number;
  heNetGraphUrl: string;
  asPathDiversityScore: number;
  lastUpdated: string;
};

export const INITIAL_LICENSE_SLA_OPERATORS: OperatorSLAData[] = [
  // --- MNO (Mobile Network Operators) ---
  {
    id: 'MNO-01',
    name: 'Grameenphone Ltd.',
    category: 'MNO',
    selfReportedUptime: 99.85,
    customerCrossCheckedUptime: 99.42,
    discrepancyDelta: -0.43,
    slaBenchmark: 99.50,
    complianceRate: 98.2,
    status: 'Verified',
    validationProbes: ['Active Tower Probes', 'Customer App Outage Telemetry', 'BTRC Benchmark Ping'],
    activeIncidents: 1,
    mttrMins: 28,
    subscribersOrClients: '84.3M Subscribers',
    details: '99.42% customer-validated uptime. 1 minor fiber cut incident in Sylhet circle under repair.',
    trend24h: [99.6, 99.5, 99.4, 99.3, 99.42, 99.5, 99.42],
  },
  {
    id: 'MNO-02',
    name: 'Robi Axiata Ltd.',
    category: 'MNO',
    selfReportedUptime: 99.70,
    customerCrossCheckedUptime: 98.95,
    discrepancyDelta: -0.75,
    slaBenchmark: 99.50,
    complianceRate: 95.8,
    status: 'Minor Discrepancy',
    validationProbes: ['Downstream Enterprise Probes', 'BTRC Audit Probes', 'Crowdsourced Latency Logs'],
    activeIncidents: 2,
    mttrMins: 42,
    subscribersOrClients: '57.2M Subscribers',
    details: '0.75% discrepancy detected between operator report and enterprise customer probes during peak load hours.',
    trend24h: [99.2, 99.1, 98.8, 98.9, 99.0, 98.95, 98.95],
  },
  {
    id: 'MNO-03',
    name: 'Banglalink Digital Communications',
    category: 'MNO',
    selfReportedUptime: 99.60,
    customerCrossCheckedUptime: 98.45,
    discrepancyDelta: -1.15,
    slaBenchmark: 99.50,
    complianceRate: 92.4,
    status: 'SLA Breach Flagged',
    validationProbes: ['Enterprise Customer SNMP', 'Third-Party Ping Probes', 'Sub-station Outage Logs'],
    activeIncidents: 3,
    mttrMins: 55,
    subscribersOrClients: '37.4M Subscribers',
    details: 'SLA Breach Flagged: 1.15% deviation from self-reported metric. Outages in Barishal & Chattogram rural sectors.',
    trend24h: [98.9, 98.7, 98.3, 98.2, 98.5, 98.45, 98.45],
  },
  {
    id: 'MNO-04',
    name: 'Teletalk Bangladesh Ltd.',
    category: 'MNO',
    selfReportedUptime: 98.50,
    customerCrossCheckedUptime: 96.20,
    discrepancyDelta: -2.30,
    slaBenchmark: 99.00,
    complianceRate: 85.1,
    status: 'Under Audit',
    validationProbes: ['State Agency Monitoring', 'BTRC National Sensor Grid', 'User Disruption Tickets'],
    activeIncidents: 5,
    mttrMins: 110,
    subscribersOrClients: '6.8M Subscribers',
    details: 'Under Regulatory Audit: High discrepancy (-2.30%). Chronic power grid dependence without battery backup.',
    trend24h: [97.0, 96.8, 96.1, 95.9, 96.3, 96.20, 96.20],
  },

  // --- IIG (International Internet Gateway) ---
  {
    id: 'IIG-01',
    name: 'Bangladesh Submarine Cable Company (BSCCL)',
    category: 'IIG',
    selfReportedUptime: 99.99,
    customerCrossCheckedUptime: 99.95,
    discrepancyDelta: -0.04,
    slaBenchmark: 99.90,
    complianceRate: 99.8,
    status: 'Verified',
    validationProbes: ['Hurricane Electric BGP Probe', 'ISP Core Router Telemetry', 'BDIX IXP Monitoring'],
    activeIncidents: 0,
    mttrMins: 12,
    subscribersOrClients: 'Primary Subsea Backbone (SMW4 & SMW5)',
    details: 'Highest tier reliability. Fully verified across 4,500+ downstream ISP customer routes.',
    trend24h: [99.98, 99.97, 99.96, 99.95, 99.95, 99.95, 99.95],
  },
  {
    id: 'IIG-02',
    name: 'Summit Communications Ltd. (IIG)',
    category: 'IIG',
    selfReportedUptime: 99.95,
    customerCrossCheckedUptime: 99.82,
    discrepancyDelta: -0.13,
    slaBenchmark: 99.80,
    complianceRate: 99.1,
    status: 'Verified',
    validationProbes: ['Cross-Border Terrestrial Probes', 'HE BGP AS58410 Monitor', 'Bank & Telecom SLA Audits'],
    activeIncidents: 1,
    mttrMins: 18,
    subscribersOrClients: 'Terrestrial Fiber & ITC Interconnects',
    details: 'Excellent customer cross-checking SLA. 1 minor fiber maintenance link swap recorded in Benapole.',
    trend24h: [99.88, 99.85, 99.80, 99.82, 99.84, 99.82, 99.82],
  },
  {
    id: 'IIG-03',
    name: 'Fiber@Home Ltd. (IIG Network)',
    category: 'IIG',
    selfReportedUptime: 99.90,
    customerCrossCheckedUptime: 99.65,
    discrepancyDelta: -0.25,
    slaBenchmark: 99.80,
    complianceRate: 98.4,
    status: 'Verified',
    validationProbes: ['Downstream ISP ICMP Probes', 'BGP AS17498 Adjacency Monitor', 'Banking Network Telemetry'],
    activeIncidents: 1,
    mttrMins: 22,
    subscribersOrClients: '1,200+ Downstream Corporate & ISP clients',
    details: 'Verified SLA. High redundancy across ITC land borders and subsea routes.',
    trend24h: [99.72, 99.70, 99.62, 99.65, 99.68, 99.65, 99.65],
  },
  {
    id: 'IIG-04',
    name: 'Mango Teleservices Ltd.',
    category: 'IIG',
    selfReportedUptime: 99.85,
    customerCrossCheckedUptime: 99.10,
    discrepancyDelta: -0.75,
    slaBenchmark: 99.50,
    complianceRate: 96.0,
    status: 'Minor Discrepancy',
    validationProbes: ['HE BGP AS9230 Adjacency Check', 'ISP Latency Sensors', 'Enterprise Transit Logs'],
    activeIncidents: 2,
    mttrMins: 35,
    subscribersOrClients: '450+ Regional ISPs & Corporate Networks',
    details: '0.75% discrepancy detected due to packet drop during upstream link failover to Tata AS6453.',
    trend24h: [99.4, 99.2, 98.9, 99.0, 99.15, 99.10, 99.10],
  },
  {
    id: 'IIG-05',
    name: 'Novocom Services Ltd.',
    category: 'IIG',
    selfReportedUptime: 99.80,
    customerCrossCheckedUptime: 98.75,
    discrepancyDelta: -1.05,
    slaBenchmark: 99.50,
    complianceRate: 93.8,
    status: 'SLA Breach Flagged',
    validationProbes: ['HE BGP AS45168 Monitor', 'Regional ISP SLA Reports', 'BDIX Peer Validation'],
    activeIncidents: 2,
    mttrMins: 48,
    subscribersOrClients: '320+ Downstream ISPs',
    details: 'SLA Breach Flagged: Customer cross-checked uptime dropped to 98.75% during Dhaka ring maintenance.',
    trend24h: [99.1, 98.9, 98.6, 98.7, 98.8, 98.75, 98.75],
  },
  {
    id: 'IIG-06',
    name: 'BD Hub Limited',
    category: 'IIG',
    selfReportedUptime: 99.75,
    customerCrossCheckedUptime: 98.40,
    discrepancyDelta: -1.35,
    slaBenchmark: 99.50,
    complianceRate: 91.5,
    status: 'SLA Breach Flagged',
    validationProbes: ['HE BGP AS135515 Monitor', 'Enterprise Customer Ping Matrix', 'Ticket Correlation Engine'],
    activeIncidents: 3,
    mttrMins: 62,
    subscribersOrClients: '180+ Enterprise & ISP Clients',
    details: 'SLA Breach: Downstream ISPs reported 98.40% availability vs 99.75% claimed by operator portal.',
    trend24h: [98.8, 98.5, 98.2, 98.3, 98.45, 98.40, 98.40],
  },

  // --- ICX (Interconnection Exchange) ---
  {
    id: 'ICX-01',
    name: 'M&H Telecom Ltd.',
    category: 'ICX',
    selfReportedUptime: 99.95,
    customerCrossCheckedUptime: 99.88,
    discrepancyDelta: -0.07,
    slaBenchmark: 99.80,
    complianceRate: 99.6,
    status: 'Verified',
    validationProbes: ['MNO Interconnect CDR Logs', 'BTRC Voice Quality Engine', 'SIP Gateway Probes'],
    activeIncidents: 0,
    mttrMins: 14,
    subscribersOrClients: 'National Voice Interconnect Exchange',
    details: 'High compliance. Verified across Grameenphone, Robi, Banglalink interconnect trunks.',
    trend24h: [99.92, 99.90, 99.87, 99.88, 99.89, 99.88, 99.88],
  },
  {
    id: 'ICX-02',
    name: 'Summit ICX',
    category: 'ICX',
    selfReportedUptime: 99.90,
    customerCrossCheckedUptime: 99.75,
    discrepancyDelta: -0.15,
    slaBenchmark: 99.80,
    complianceRate: 98.9,
    status: 'Verified',
    validationProbes: ['Operator Trunk Telemetry', 'BTRC Call Completion Monitor', 'ASR Quality Sensors'],
    activeIncidents: 1,
    mttrMins: 20,
    subscribersOrClients: 'MNO & PSTN Interconnect Provider',
    details: 'Verified performance. Minor route latency spike in Sylhet voice exchange handled seamlessly.',
    trend24h: [99.82, 99.78, 99.72, 99.75, 99.76, 99.75, 99.75],
  },
  {
    id: 'ICX-03',
    name: 'Bangla Trac Communications',
    category: 'ICX',
    selfReportedUptime: 99.85,
    customerCrossCheckedUptime: 99.20,
    discrepancyDelta: -0.65,
    slaBenchmark: 99.50,
    complianceRate: 96.8,
    status: 'Minor Discrepancy',
    validationProbes: ['Operator Call Drop Probes', 'Interconnect Trunk Metrics', 'Enterprise Voice Logs'],
    activeIncidents: 1,
    mttrMins: 32,
    subscribersOrClients: 'Multi-Operator Interconnect Hub',
    details: '0.65% discrepancy verified via MNO interconnect trunk call-drop logs during peak volume.',
    trend24h: [99.5, 99.3, 99.1, 99.2, 99.25, 99.20, 99.20],
  },

  // --- IGW (International Gateway) ---
  {
    id: 'IGW-01',
    name: 'Mir Telecom Ltd.',
    category: 'IGW',
    selfReportedUptime: 99.90,
    customerCrossCheckedUptime: 99.80,
    discrepancyDelta: -0.10,
    slaBenchmark: 99.50,
    complianceRate: 99.2,
    status: 'Verified',
    validationProbes: ['International Carrier Voice Probes', 'BTRC Gateway Telemetry', 'VoIP Route Monitors'],
    activeIncidents: 0,
    mttrMins: 15,
    subscribersOrClients: 'Global Voice & SMS Transit Gateway',
    details: 'Verified SLA. High call completion rate across international incoming/outgoing voice traffic.',
    trend24h: [99.85, 99.82, 99.78, 99.80, 99.81, 99.80, 99.80],
  },
  {
    id: 'IGW-02',
    name: 'Roots Communication Ltd.',
    category: 'IGW',
    selfReportedUptime: 99.80,
    customerCrossCheckedUptime: 99.05,
    discrepancyDelta: -0.75,
    slaBenchmark: 99.50,
    complianceRate: 95.5,
    status: 'Minor Discrepancy',
    validationProbes: ['Global Wholesale Carrier Probes', 'ASR/NER Voice Metrics', 'BTRC Gateway Monitor'],
    activeIncidents: 1,
    mttrMins: 36,
    subscribersOrClients: 'International Voice Routes',
    details: 'Minor discrepancy verified through international carrier ASR drop reports during European peak hours.',
    trend24h: [99.3, 99.1, 98.9, 99.0, 99.10, 99.05, 99.05],
  },

  // --- ANS / ISP (Access Network Service / Internet Service Providers) ---
  {
    id: 'ISP-01',
    name: 'Link3 Technologies Ltd.',
    category: 'ANS / ISP',
    selfReportedUptime: 99.80,
    customerCrossCheckedUptime: 99.45,
    discrepancyDelta: -0.35,
    slaBenchmark: 99.50,
    complianceRate: 98.5,
    status: 'Verified',
    validationProbes: ['Corporate Customer Edge Probes', 'FTTH Optical Line Monitor', 'BDIX Latency Grid'],
    activeIncidents: 1,
    mttrMins: 24,
    subscribersOrClients: '120k+ Corporate & Broadband FTTH Lines',
    details: 'Verified cross-check SLA. Minimal latency drift recorded on enterprise fiber rings.',
    trend24h: [99.6, 99.5, 99.4, 99.45, 99.48, 99.45, 99.45],
  },
  {
    id: 'ISP-02',
    name: 'AmberIT Limited',
    category: 'ANS / ISP',
    selfReportedUptime: 99.75,
    customerCrossCheckedUptime: 99.15,
    discrepancyDelta: -0.60,
    slaBenchmark: 99.50,
    complianceRate: 96.9,
    status: 'Minor Discrepancy',
    validationProbes: ['Enterprise Customer SNMP', 'Bank ATM Connectivity Monitor', 'User Portal Feedback'],
    activeIncidents: 2,
    mttrMins: 38,
    subscribersOrClients: '95k+ Enterprise & Banking Connections',
    details: 'Minor discrepancy (-0.60%) detected during fiber link relocation project in Motijheel commercial area.',
    trend24h: [99.4, 99.2, 98.9, 99.1, 99.20, 99.15, 99.15],
  },
  {
    id: 'ISP-03',
    name: 'Carnival Internet (Dot Lines)',
    category: 'ANS / ISP',
    selfReportedUptime: 99.70,
    customerCrossCheckedUptime: 98.60,
    discrepancyDelta: -1.10,
    slaBenchmark: 99.50,
    complianceRate: 93.0,
    status: 'SLA Breach Flagged',
    validationProbes: ['FTTH Subscriber Edge Probes', 'Speedtest Telemetry Grid', 'Customer Ticket Log API'],
    activeIncidents: 3,
    mttrMins: 52,
    subscribersOrClients: '210k+ Residential Broadband Users',
    details: 'SLA Breach Flagged: Residential customers logged 98.60% uptime vs 99.70% claimed by ISP dashboard.',
    trend24h: [99.0, 98.8, 98.4, 98.5, 98.7, 98.60, 98.60],
  },

  // --- NTTN (Nationwide Telecommunication Transmission Network) ---
  {
    id: 'NTTN-01',
    name: 'Fiber@Home NTTN',
    category: 'NTTN',
    selfReportedUptime: 99.98,
    customerCrossCheckedUptime: 99.91,
    discrepancyDelta: -0.07,
    slaBenchmark: 99.90,
    complianceRate: 99.7,
    status: 'Verified',
    validationProbes: ['MNO Tower Fiber Monitoring', 'IIG Backhaul OTDR Sensors', 'BTRC Fiber Integrity Grid'],
    activeIncidents: 1,
    mttrMins: 16,
    subscribersOrClients: '68,000+ km Fiber Transmission Network',
    details: 'Verified backbone stability. Transmission backhaul powering over 32,000 mobile BTS towers nationwide.',
    trend24h: [99.95, 99.93, 99.90, 99.91, 99.92, 99.91, 99.91],
  },
  {
    id: 'NTTN-02',
    name: 'Summit Communications NTTN',
    category: 'NTTN',
    selfReportedUptime: 99.95,
    customerCrossCheckedUptime: 99.86,
    discrepancyDelta: -0.09,
    slaBenchmark: 99.90,
    complianceRate: 99.4,
    status: 'Verified',
    validationProbes: ['BTS Fiber Ring Monitoring', 'ISP Backhaul Telemetry', 'Railway Optical Fiber Sensors'],
    activeIncidents: 1,
    mttrMins: 19,
    subscribersOrClients: '55,000+ km Nationwide Transmission Mesh',
    details: 'Verified transmission SLA. Excellent redundancy across East-West railway optical fiber routes.',
    trend24h: [99.91, 99.88, 99.84, 99.86, 99.87, 99.86, 99.86],
  },
  {
    id: 'NTTN-03',
    name: 'Bahon Limited (NTTN)',
    category: 'NTTN',
    selfReportedUptime: 99.80,
    customerCrossCheckedUptime: 98.90,
    discrepancyDelta: -0.90,
    slaBenchmark: 99.50,
    complianceRate: 95.2,
    status: 'Minor Discrepancy',
    validationProbes: ['Regional ISP Backhaul Probes', 'District Fiber OTDR Metrics', 'Customer Outage Reports'],
    activeIncidents: 2,
    mttrMins: 45,
    subscribersOrClients: 'Regional Transmission Fiber Links',
    details: '0.90% discrepancy detected on Sylhet-Tamabil optical transmission link following road construction work.',
    trend24h: [99.2, 99.0, 98.7, 98.8, 98.95, 98.90, 98.90],
  },
];

export const INITIAL_IIG_BGP_REPORTS: IIGBGPReport[] = [
  {
    id: 'BGP-01',
    operator: 'Bangladesh Subsea Cable Co. (BSCCL)',
    asn: 'AS24389',
    adjacenciesTotal: 142, // High Adjacencies = Speed, Direct peering, low latency hops
    adjacenciesIPv4: 98,
    adjacenciesIPv6: 44,
    routedPrefixesIPv4: 18450, // Routing Prefixes = Reachability & Redundancy volume
    routedPrefixesIPv6: 3210,
    routingRedundancyScore: 98.5,
    upstreamTier1: [
      'Hurricane Electric (AS6939)',
      'Tata Communications (AS6453)',
      'NTT America (AS2914)',
      'Telia Company (AS1299)',
      'Sparkle (AS6762)',
    ],
    ixpConnections: ['BDIX (Dhaka)', 'Equinix Singapore (SG1)', 'SGIX', 'HKIX', 'NIX Mumbai'],
    flapStabilityIndex: 'Optimal (No Flaps)',
    downstreamISPsCount: 1250,
    capacityGbps: 5400,
    heNetGraphUrl: 'https://bgp.he.net/AS24389',
    asPathDiversityScore: 97.2,
    lastUpdated: 'Live BGP Feed (HE bgp.he.net)',
  },
  {
    id: 'BGP-02',
    operator: 'Summit Communications Ltd. (IIG)',
    asn: 'AS58410',
    adjacenciesTotal: 118,
    adjacenciesIPv4: 82,
    adjacenciesIPv6: 36,
    routedPrefixesIPv4: 14200,
    routedPrefixesIPv6: 2450,
    routingRedundancyScore: 96.2,
    upstreamTier1: [
      'Hurricane Electric (AS6939)',
      'Tata Communications (AS6453)',
      'Singtel (AS7473)',
      'Airtel India (AS9498)',
    ],
    ixpConnections: ['BDIX (Dhaka)', 'Equinix Singapore', 'SGIX'],
    flapStabilityIndex: 'Optimal (No Flaps)',
    downstreamISPsCount: 890,
    capacityGbps: 3800,
    heNetGraphUrl: 'https://bgp.he.net/AS58410',
    asPathDiversityScore: 94.8,
    lastUpdated: 'Live BGP Feed (HE bgp.he.net)',
  },
  {
    id: 'BGP-03',
    operator: 'Fiber@Home Ltd. (IIG)',
    asn: 'AS17498',
    adjacenciesTotal: 104,
    adjacenciesIPv4: 74,
    adjacenciesIPv6: 30,
    routedPrefixesIPv4: 12850,
    routedPrefixesIPv6: 2180,
    routingRedundancyScore: 94.8,
    upstreamTier1: [
      'Hurricane Electric (AS6939)',
      'NTT America (AS2914)',
      'Tata Communications (AS6453)',
    ],
    ixpConnections: ['BDIX (Dhaka)', 'SGIX', 'Equinix Singapore'],
    flapStabilityIndex: 'Optimal (No Flaps)',
    downstreamISPsCount: 780,
    capacityGbps: 3200,
    heNetGraphUrl: 'https://bgp.he.net/AS17498',
    asPathDiversityScore: 93.5,
    lastUpdated: 'Live BGP Feed (HE bgp.he.net)',
  },
  {
    id: 'BGP-04',
    operator: 'Mango Teleservices Ltd.',
    asn: 'AS9230',
    adjacenciesTotal: 76,
    adjacenciesIPv4: 54,
    adjacenciesIPv6: 22,
    routedPrefixesIPv4: 8900,
    routedPrefixesIPv6: 1420,
    routingRedundancyScore: 88.4,
    upstreamTier1: [
      'Hurricane Electric (AS6939)',
      'Tata Communications (AS6453)',
      'Bharti Airtel (AS9498)',
    ],
    ixpConnections: ['BDIX (Dhaka)', 'Equinix Singapore'],
    flapStabilityIndex: 'Minor Flap Alert',
    downstreamISPsCount: 450,
    capacityGbps: 1900,
    heNetGraphUrl: 'https://bgp.he.net/AS9230',
    asPathDiversityScore: 86.1,
    lastUpdated: 'Live BGP Feed (HE bgp.he.net)',
  },
  {
    id: 'BGP-05',
    operator: 'Novocom Services Ltd.',
    asn: 'AS45168',
    adjacenciesTotal: 62,
    adjacenciesIPv4: 44,
    adjacenciesIPv6: 18,
    routedPrefixesIPv4: 7200,
    routedPrefixesIPv6: 1100,
    routingRedundancyScore: 84.1,
    upstreamTier1: [
      'Hurricane Electric (AS6939)',
      'Telia Company (AS1299)',
    ],
    ixpConnections: ['BDIX (Dhaka)', 'SGIX'],
    flapStabilityIndex: 'Optimal (No Flaps)',
    downstreamISPsCount: 320,
    capacityGbps: 1400,
    heNetGraphUrl: 'https://bgp.he.net/AS45168',
    asPathDiversityScore: 82.5,
    lastUpdated: 'Live BGP Feed (HE bgp.he.net)',
  },
  {
    id: 'BGP-06',
    operator: 'BD Hub Limited',
    asn: 'AS135515',
    adjacenciesTotal: 48,
    adjacenciesIPv4: 34,
    adjacenciesIPv6: 14,
    routedPrefixesIPv4: 5100,
    routedPrefixesIPv6: 850,
    routingRedundancyScore: 79.5,
    upstreamTier1: [
      'Hurricane Electric (AS6939)',
      'Singtel (AS7473)',
    ],
    ixpConnections: ['BDIX (Dhaka)'],
    flapStabilityIndex: 'Flapping Detected',
    downstreamISPsCount: 180,
    capacityGbps: 950,
    heNetGraphUrl: 'https://bgp.he.net/AS135515',
    asPathDiversityScore: 77.0,
    lastUpdated: 'Live BGP Feed (HE bgp.he.net)',
  },
  {
    id: 'BGP-07',
    operator: 'Delta Telecom Ltd.',
    asn: 'AS138982',
    adjacenciesTotal: 34,
    adjacenciesIPv4: 26,
    adjacenciesIPv6: 8,
    routedPrefixesIPv4: 3400,
    routedPrefixesIPv6: 480,
    routingRedundancyScore: 73.2,
    upstreamTier1: [
      'Hurricane Electric (AS6939)',
    ],
    ixpConnections: ['BDIX (Dhaka)'],
    flapStabilityIndex: 'Optimal (No Flaps)',
    downstreamISPsCount: 110,
    capacityGbps: 650,
    heNetGraphUrl: 'https://bgp.he.net/AS138982',
    asPathDiversityScore: 71.4,
    lastUpdated: 'Live BGP Feed (HE bgp.he.net)',
  },
];

export function tickLicenseAndBgpTelemetry(
  slaList: OperatorSLAData[],
  bgpList: IIGBGPReport[]
): {
  slaList: OperatorSLAData[];
  bgpList: IIGBGPReport[];
} {
  const nextSla = slaList.map((item) => {
    const deltaChange = (Math.random() - 0.5) * 0.04;
    const newCross = parseFloat(Math.min(99.99, Math.max(92.0, item.customerCrossCheckedUptime + deltaChange)).toFixed(2));
    const disc = parseFloat((newCross - item.selfReportedUptime).toFixed(2));
    const comp = parseFloat(Math.min(100, Math.max(75, 100 + disc * 3)).toFixed(1));

    let status = item.status;
    if (disc < -1.0) status = 'SLA Breach Flagged';
    else if (disc < -0.5) status = 'Minor Discrepancy';
    else if (disc >= -0.5 && status !== 'Under Audit') status = 'Verified';

    const newTrend = [...item.trend24h.slice(1), newCross];

    return {
      ...item,
      customerCrossCheckedUptime: newCross,
      discrepancyDelta: disc,
      complianceRate: comp,
      status,
      trend24h: newTrend,
    };
  });

  const nextBgp = bgpList.map((bgp) => {
    const adjDelta = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0;
    const newTotalAdj = Math.max(10, bgp.adjacenciesTotal + adjDelta);
    return {
      ...bgp,
      adjacenciesTotal: newTotalAdj,
      adjacenciesIPv4: Math.round(newTotalAdj * 0.7),
      adjacenciesIPv6: Math.round(newTotalAdj * 0.3),
      lastUpdated: 'Live BGP Feed (HE bgp.he.net)',
    };
  });

  return { slaList: nextSla, bgpList: nextBgp };
}
