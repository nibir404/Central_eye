'use client';
import React, { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import InfrastructureScene from './infrastructure-scene';
import {
  INITIAL_DIVISIONS,
  INITIAL_OPERATORS,
  INITIAL_CABLES,
  SPECTRUM_BANDS,
  DISTRICT_RANKINGS,
  generateNextTick,
  DivisionTelemetry,
  OperatorTelemetry,
  SubseaCableStatus,
  TelemetryEvent,
  PipelineScenario,
} from '@/lib/telemetry-pipeline';
import {
  POWERGRID_METADATA,
  POWERGRID_RECENT_HOURLY,
  PowerGridRecord,
} from '@/lib/powergrid-electricity';
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Bell,
  Building2,
  Check,
  ChevronRight,
  Compass,
  Cpu,
  Database,
  Download,
  FileText,
  Globe2,
  Layers,
  LayoutDashboard,
  MapPin,
  Maximize2,
  Minus,
  Moon,
  Network,
  Pause,
  PhoneCall,
  PieChart,
  Play,
  Plus,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  Server,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Signal,
  Sliders,
  Sun,
  TrendingUp,
  TriangleAlert,
  Users,
  Wifi,
  Zap,
} from 'lucide-react';
import SLACrossCheckView from '@/components/sla-crosscheck-view';
import BGPHurricaneReportView from '@/components/bgp-hurricane-report-view';
import {
  INITIAL_LICENSE_SLA_OPERATORS,
  INITIAL_IIG_BGP_REPORTS,
  tickLicenseAndBgpTelemetry,
  OperatorSLAData,
  IIGBGPReport,
} from '@/lib/license-bgp-data';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { INFRASTRUCTURE_ASSETS, InfrastructureAsset } from '@/lib/infrastructure-assets';
import BtrcTelecomViews from '@/components/btrc-telecom-views';
import PowerGridVisuals from '@/components/powergrid-visuals';
import {
  BTRC_METADATA,
  TELCO_SUBMENU_ITEMS,
  TelcoSubMenuId,
} from '@/lib/btrc-telecom';

const sourceBtrc = 'https://btrc.portal.gov.bd/pages/static-pages/6922dda8933eb65569e15c3d';
const sourcePower = 'https://bpdb.portal.gov.bd/pages/static-pages/6922e134933eb65569e2ad95';
const divisions = ['All Bangladesh', 'Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];

type Asset = InfrastructureAsset;
const assets: Asset[] = INFRASTRUCTURE_ASSETS;

const POWER_GRID_LINES = [
  ['P-PAYRA', 'P-AMINBAZAR'],
  ['P-RAMPAL', 'P-AMINBAZAR'],
  ['P-MEGHNAGHAT', 'P-AMINBAZAR'],
  ['P-GHORASHAL', 'P-MEGHNAGHAT'],
  ['P-ASHUGANJ', 'P-MEGHNAGHAT'],
  ['P-BIBIYANA', 'P-ASHUGANJ'],
  ['P-TRIPURA-IMPORT', 'P-HATHAZARI'],
  ['P-MATARBARI', 'P-HATHAZARI'],
  ['P-KAPTAI', 'P-HATHAZARI'],
  ['P-HATHAZARI', 'P-ASHUGANJ'],
  ['P-SIRAJGANJ', 'P-AMINBAZAR'],
  ['P-ROOPPUR', 'P-SIRAJGANJ'],
  ['P-BHERAMARA-HVDC', 'P-ROOPPUR'],
  ['P-BOGRA-GRID', 'P-SIRAJGANJ'],
  ['P-ADANI-IMPORT', 'P-BOGRA-GRID'],
  ['P-BARAPUKURIA', 'P-BOGRA-GRID'],
  ['P-TEESTA-SOLAR', 'P-BOGRA-GRID'],
  ['P-MYM-GRID', 'P-GHORASHAL'],
];

const OPTICAL_FIBER_ROUTES = [
  ['T-SMW4', 'T-SUMMIT-TOWER'],
  ['T-SUMMIT-TOWER', 'T-BTRC-HQ'],
  ['T-SMW5', 'T-KIRTONKHOLA'],
  ['T-KIRTONKHOLA', 'T-BTRC-HQ'],
  ['T-BTRC-HQ', 'T-GP-NOC'],
  ['T-BTRC-HQ', 'T-ROBI-NOC'],
  ['T-BTRC-HQ', 'T-BL-NOC'],
  ['T-BTRC-HQ', 'T-TELETALK-NOC'],
  ['T-BTRC-HQ', 'T-EDOTCO-HUB'],
  ['T-BTRC-HQ', 'T-BTCL-MOGBAZAR'],
  ['T-BTRC-HQ', 'T-FIBERATHOME'],
  ['T-BTRC-HQ', 'T-SUMMIT-FIBER'],
  ['T-FIBERATHOME', 'T-SYLHET-HUB'],
  ['T-SUMMIT-FIBER', 'T-KHULNA-NODE'],
  ['T-BTCL-MOGBAZAR', 'T-MYM-NODE'],
  ['T-BTCL-MOGBAZAR', 'T-FRONTIER'],
  ['T-FRONTIER', 'T-RANGPUR-TOWER'],
  ['T-BTCL-MOGBAZAR', 'T-INFOSARKER-CORE'],
  ['T-BTRC-HQ', 'T-VOIP-SURVEILLANCE'],
];

const incidents = [
  { id: 'INC-0241', title: 'Fiber route disruption', division: 'Sylhet', sector: 'Telecom', severity: 'Critical', impact: '12,400 subscriptions', owner: 'NTTN Response Team', cause: 'Excavation damage', action: 'Reroute traffic; dispatch fiber repair team', eta: '14:30 BST', progress: 35, asset: 'D-01' },
  { id: 'INC-0240', title: 'Transformer loading above baseline', division: 'Dhaka', sector: 'Electricity', severity: 'Watch', impact: '3 industrial feeders', owner: 'Grid Operations', cause: 'Increased demand spike', action: 'Review load balancing and transformer temperature', eta: '15:00 BST', progress: 65, asset: 'P-03' },
  { id: 'INC-0238', title: 'Backup link capacity reduced', division: 'Chattogram', sector: 'Telecom', severity: 'Watch', impact: '1 core route', owner: 'Transmission Team', cause: 'Scheduled maintenance window', action: 'Validate failover capacity before maintenance', eta: '16:00 BST', progress: 72, asset: 'T-03' },
];

const nav = [
  ['Overview', LayoutDashboard],
  ['Live Telemetry', Activity],
  ['Electricity', Zap],
  ['Telecom', Radio],
  ['National map', Globe2],
  ['Incidents', TriangleAlert],
  ['Regulation', ShieldCheck],
  ['Projects', Building2],
  ['Analytics', Cpu],
  ['Reports', FileText],
  ['Data catalog', Database],
] as const;

const xy = (a: { lon: number; lat: number }) => ({ x: (a.lon - 88) * 132 + 70, y: (26.7 - a.lat) * 115 + 35 });

function Picker({ value, onChange, values }: { value: string; onChange: (v: string) => void; values: string[] }) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger className="picker">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {values.map((v) => (
          <SelectItem key={v} value={v}>
            {v}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Tag({ children, tone = 'green' }: { children: React.ReactNode; tone?: string }) {
  return <span className={'tag ' + tone}>{children}</span>;
}

function Spark({ color = '#56c4ac', down = false }: { color?: string; down?: boolean }) {
  return (
    <svg viewBox="0 0 120 34" className="spark" aria-hidden="true">
      <path d={down ? 'M0 7L10 11L20 9L30 15L40 13L50 20L60 17L70 23L80 19L90 25L100 23L120 29' : 'M0 29L10 23L20 25L30 14L40 19L50 13L60 18L70 8L80 12L90 4L100 8L120 3'} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export default function Home() {
  const [dark, setDark] = useState(true);
  const [page, setPage] = useState('Overview');
  const [division, setDivision] = useState('All Bangladesh');
  const [sector, setSector] = useState('All sectors');
  const [period, setPeriod] = useState('24 hours');
  const [view, setView] = useState('3D');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(-9);
  const [layers, setLayers] = useState(['Electricity', 'Telecom', 'Connections']);
  const [geo, setGeo] = useState<any[]>([]);
  const [mapError, setMapError] = useState(false);
  const [selected, setSelected] = useState<Asset | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [role, setRole] = useState('Executive');
  const [severity, setSeverity] = useState('All severity');
  const [ack, setAck] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const [telcoSubTabId, setTelcoSubTabId] = useState<TelcoSubMenuId>('teledensity');
  const [telcoSubTab, setTelcoSubTab] = useState<
    'Overview & Market Share' | 'License & SLA Cross-Check' | 'IIG BGP & Hurricane Report' | 'QoS & Performance' | 'Infrastructure & BTS' | 'District Ranking & Outages'
  >('Overview & Market Share');
  const [districtSearch, setDistrictSearch] = useState('');
  const [electricitySubTab, setElectricitySubTab] = useState<
    'Grid Balance & Overview' | 'Fuel Mix & Imports' | 'Hourly Demand Curves' | 'PowerGrid Historical Log'
  >('Grid Balance & Overview');
  const [pgSearch, setPgSearch] = useState('');
  const [pgFilterRemark, setPgFilterRemark] = useState<'All' | 'Peaks' | 'Loadshed'>('All');
  const [pgPage, setPgPage] = useState(1);

  const downloadPowerGridJSON = () => {
    const a = document.createElement('a');
    a.href = '/data/powergrid_unified.json';
    a.download = 'powergrid_bangladesh_scraped.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setNotice('Downloading complete PowerGrid dataset (3,570 records)');
  };

  const downloadPowerGridCSV = () => {
    const headers = ['date', 'time', 'demand_mw', 'supply_mw', 'loadshed_mw', 'total_gen_mw', 'gas_mw', 'coal_mw', 'liquid_fuel_mw', 'hydro_mw', 'solar_mw', 'wind_mw', 'imports_mw', 'remark'];
    const rows = POWERGRID_RECENT_HOURLY.map((r) => [
      r.date,
      r.time,
      r.demand_mw,
      r.supply_mw,
      r.loadshed_mw,
      r.total_gen_mw ?? 0,
      r.gas_mw ?? 0,
      r.coal_mw ?? 0,
      r.liquid_fuel_mw ?? 0,
      r.hydro_mw ?? 0,
      r.solar_mw ?? 0,
      r.wind_mw ?? 0,
      r.cross_border?.total_imports_mw ?? 0,
      `"${(r.remark || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'powergrid_bangladesh_hourly.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setNotice('Exported PowerGrid CSV data');
  };

  // Pipeline state
  const [isStreaming, setIsStreaming] = useState(true);
  const [scenario, setScenario] = useState<PipelineScenario>('normal');
  const [speed, setSpeed] = useState<number>(1);
  const [divisionsData, setDivisionsData] = useState<DivisionTelemetry[]>(INITIAL_DIVISIONS);
  const [operatorsData, setOperatorsData] = useState<OperatorTelemetry[]>(INITIAL_OPERATORS);
  const [cablesData, setCablesData] = useState<SubseaCableStatus[]>(INITIAL_CABLES);
  const [slaOperators, setSlaOperators] = useState<OperatorSLAData[]>(INITIAL_LICENSE_SLA_OPERATORS);
  const [bgpReports, setBgpReports] = useState<IIGBGPReport[]>(INITIAL_IIG_BGP_REPORTS);
  const [eventsLog, setEventsLog] = useState<TelemetryEvent[]>([
    { id: 'EVT-1001', timestamp: '16:11:00 BST', sector: 'System', severity: 'Info', division: 'National', message: 'Real-time telemetry pipeline initialized for ICT Ministry.' },
  ]);

  const drag = useRef<number | null>(null);

  // Real-time telemetry stream effect
  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      const next = generateNextTick(divisionsData, operatorsData, cablesData, scenario);
      setDivisionsData(next.divisions);
      setOperatorsData(next.operators);
      setCablesData(next.cables);

      const nextSlaBgp = tickLicenseAndBgpTelemetry(slaOperators, bgpReports);
      setSlaOperators(nextSlaBgp.slaList);
      setBgpReports(nextSlaBgp.bgpList);

      if (next.event) {
        setEventsLog((prev) => [next.event!, ...prev.slice(0, 19)]);
      }
    }, 2500 / speed);
    return () => clearInterval(interval);
  }, [isStreaming, scenario, speed, divisionsData, operatorsData, cablesData, slaOperators, bgpReports]);

  useEffect(() => {
    setDark(localStorage.getItem('central-eye-theme') !== 'light');
    setSaved(!!localStorage.getItem('central-eye-view'));
    fetch('/bangladesh.json')
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((data) => setGeo(data as any[]))
      .catch(() => setMapError(true));

    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: unknown, options: unknown) => void | Promise<void> } }).modelContext;
    if (!context) return;
    const life = new AbortController();
    try {
      Promise.resolve(
        context.registerTool(
          {
            name: 'configure_infrastructure_view',
            description: 'Set the visible region and sector filters on the national infrastructure map.',
            inputSchema: {
              type: 'object',
              properties: {
                division: { type: 'string', enum: divisions },
                sector: { type: 'string', enum: ['All sectors', 'Electricity', 'Telecom'] },
              },
              required: ['division', 'sector'],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false, untrustedContentHint: false },
            execute(input: unknown) {
              const v = input as { division: string; sector: string };
              if (!v || !divisions.includes(v.division) || !['All sectors', 'Electricity', 'Telecom'].includes(v.sector)) throw Error('Choose a supported division and sector');
              flushSync(() => {
                setDivision(v.division);
                setSector(v.sector);
                setPage('National map');
                setLayers(['Electricity', 'Telecom', 'Connections']);
              });
              return { division: v.division, sector: v.sector, page: 'National map', dataStatus: 'Active Infrastructure View' };
            },
          },
          { signal: life.signal }
        )
      ).catch(() => { });
    } catch { }
    return () => life.abort();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('central-eye-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(''), 3500);
      return () => clearTimeout(t);
    }
  }, [notice]);

  // Aggregate telemetry totals
  const totalDemand = divisionsData.reduce((acc, d) => acc + d.demandMW, 0);
  const totalSupply = divisionsData.reduce((acc, d) => acc + d.supplyMW, 0);
  const totalShortage = Math.max(0, totalDemand - totalSupply);
  const totalLoadShed = divisionsData.reduce((acc, d) => acc + d.loadSheddingMW, 0);
  const avgFrequency = (divisionsData.reduce((acc, d) => acc + d.gridFrequency, 0) / divisionsData.length).toFixed(2);
  const totalTowers = divisionsData.reduce((acc, d) => acc + d.towersTotal, 0);
  const activeTowers = divisionsData.reduce((acc, d) => acc + d.towersActive, 0);
  const avgUptime = ((activeTowers / totalTowers) * 100).toFixed(2);
  const totalTrafficGbps = cablesData.reduce((acc, c) => acc + c.activeTrafficGbps, 0);
  const totalCapacityGbps = cablesData.reduce((acc, c) => acc + c.capacityTbps * 1000, 0);
  const overallCableUtil = ((totalTrafficGbps / totalCapacityGbps) * 100).toFixed(1);
  const avgDownloadSpeed = (operatorsData.reduce((acc, op) => acc + op.throughputMbps, 0) / operatorsData.length).toFixed(1);
  const avgLatency = Math.round(operatorsData.reduce((acc, op) => acc + op.avgLatencyMs, 0) / operatorsData.length);

  const filtered = assets.filter((a) => (division === 'All Bangladesh' || a.division === division) && (sector === 'All sectors' || a.sector === sector) && layers.includes(a.sector));
  const alerts = incidents.filter((a) => (division === 'All Bangladesh' || a.division === division) && (sector === 'All sectors' || a.sector === sector) && (severity === 'All severity' || a.severity === severity));

  function go(p: string) {
    setPage(p);
    if (p === 'Electricity') {
      setView('3D');
      setLayers(['Electricity', 'Connections']);
      setSector('Electricity');
    } else if (p === 'Telecom') {
      setView('3D');
      setLayers(['Telecom', 'Connections']);
      setSector('Telecom');
    } else {
      setSector('All sectors');
    }
  }

  function exportData() {
    const rows = [['ID', 'Name', 'Sector', 'Division', 'Owner', 'Capacity', 'Operational Status'], ...filtered.map((a) => [a.id, a.name, a.sector, a.division, a.owner, a.capacity, a.status])];
    const blob = new Blob([rows.map((r) => r.map((c) => '"' + c.replaceAll('"', '""') + '"').join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url;
    el.download = 'central-eye-infrastructure-data.csv';
    el.click();
    URL.revokeObjectURL(url);
    setNotice('Filtered asset data exported');
  }

  const map = (
    <section className={'map-card panel sector-' + (sector === 'Electricity' ? 'electricity' : sector === 'Telecom' ? 'telecom' : 'all')}>
      <div className="map-heading">
        <div>
          <span className="eyebrow">GEOSPATIAL INTELLIGENCE</span>
          <h2>{sector === 'Electricity' ? 'Powering a nation.' : sector === 'Telecom' ? 'A nation, in connection.' : 'One nation. Connected systems.'}</h2>
          <p>
            {filtered.length} mapped infrastructure assets <span>·</span> {division}
          </p>
        </div>
        <Tabs value={view} onValueChange={(v) => setView(String(v))}>
          <TabsList>
            <TabsTrigger value="2D">2D</TabsTrigger>
            <TabsTrigger value="3D">3D</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className={'map-body ' + (view === '3D' ? 'is-three' : '')}>
        <div className="map-layers">
          <span className="eyebrow">
            <Layers size={13} /> MAP LAYERS
          </span>
          {['Electricity', 'Telecom', 'Connections'].map((l, i) => (
            <label key={l}>
              <Checkbox checked={layers.includes(l)} onCheckedChange={(v) => setLayers(v ? [...layers, l] : layers.filter((x) => x !== l))} />
              <span className={'dot dot-' + i} />
              {l}
            </label>
          ))}
        </div>
        <div
          className="map-stage"
          style={{ display: view === '3D' ? 'none' : undefined }}
          onPointerDown={(e) => {
            if ((e.target as Element).closest('[data-asset]')) return;
            drag.current = e.clientX;
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (drag.current !== null) {
              setRotation((r) => Math.max(-45, Math.min(45, r + (e.clientX - drag.current!) * 0.15)));
              drag.current = e.clientX;
            }
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
        >
          {mapError ? (
            <div className="map-loading">
              Boundary data could not load. <button onClick={() => location.reload()}>Retry</button>
            </div>
          ) : geo.length === 0 ? (
            <div className="map-loading">Loading Bangladesh boundaries…</div>
          ) : (
            <svg
              className="bangladesh-map"
              viewBox="0 0 760 730"
              role="img"
              aria-label="Interactive Bangladesh infrastructure map."
              style={{ transform: `scale(${zoom}) perspective(1100px) rotateX(${view === '3D' ? 25 : 0}deg) rotateZ(${view === '3D' ? rotation : 0}deg)` }}
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="5" />
                </filter>
                <radialGradient id="mapGlow">
                  <stop stopColor="#2bb797" stopOpacity=".15" />
                  <stop offset="1" stopColor="#2bb797" stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="355" cy="430" rx="305" ry="290" fill="url(#mapGlow)" />
              {view === '3D' &&
                [14, 10, 6].map((y) => (
                  <g key={y} transform={`translate(0 ${y})`} className="map-depth">
                    {geo.map((f, i) => (
                      <path key={i} d={f.path} />
                    ))}
                  </g>
                ))}
              <g>
                {geo.map((f, i) => (
                  <path key={i} d={f.path} className={'map-region ' + (division !== 'All Bangladesh' && f.division !== division ? 'dim' : '')}>
                    <title>
                      {f.name}, {f.division}
                    </title>
                  </path>
                ))}
              </g>
              {layers.includes('Connections') &&
                (sector === 'Electricity'
                  ? POWER_GRID_LINES
                  : sector === 'Telecom'
                    ? OPTICAL_FIBER_ROUTES
                    : [...POWER_GRID_LINES, ...OPTICAL_FIBER_ROUTES]
                ).map(([fromId, toId], idx) => {
                  const fromAsset = assets.find((a) => a.id === fromId);
                  const toAsset = assets.find((a) => a.id === toId);
                  if (!fromAsset || !toAsset) return null;
                  if (division !== 'All Bangladesh' && fromAsset.division !== division && toAsset.division !== division) return null;
                  const from = xy(fromAsset),
                    to = xy(toAsset);
                  const isTelco = fromAsset.sector === 'Telecom';
                  return (
                    <path
                      key={idx}
                      d={`M${from.x} ${from.y}Q${(from.x + to.x) / 2 + 20} ${(from.y + to.y) / 2 - 20} ${to.x} ${to.y}`}
                      className={'connection ' + (isTelco ? 'fiber' : '')}
                      stroke={isTelco ? '#48a989' : '#e3bf75'}
                    />
                  );
                })}
              {[
                { name: 'RANGPUR', lon: 89.1, lat: 26.08 },
                { name: 'RAJSHAHI', lon: 88.6, lat: 24.75 },
                { name: 'MYMENSINGH', lon: 90.27, lat: 25.14 },
                { name: 'SYLHET', lon: 91.7, lat: 25.25 },
                { name: 'DHAKA', lon: 90.18, lat: 23.55 },
                { name: 'KHULNA', lon: 89.12, lat: 22.7 },
                { name: 'BARISHAL', lon: 90.25, lat: 22.55 },
                { name: 'CHATTOGRAM', lon: 91.77, lat: 22.85 },
              ].map((c) => (
                <text key={c.name} x={xy(c).x} y={xy(c).y} className="city-label">
                  {c.name}
                </text>
              ))}
              {filtered.map((a) => {
                const p = xy(a),
                  color = a.status === 'Critical' ? '#ff7e75' : a.sector === 'Electricity' ? '#edbc61' : '#61b8f8';
                const h = view === '3D' ? 32 : 0;
                return (
                  <g key={a.id} data-asset="true" className="asset-marker" onClick={() => setSelected(a)}>
                    <title>
                      {a.name} — {a.status}
                    </title>
                    <ellipse cx={p.x} cy={p.y + 5} rx="14" ry="7" fill={color} opacity=".14" />
                    <line x1={p.x} y1={p.y} x2={p.x} y2={p.y - h} stroke={color} strokeWidth="4" opacity=".6" />
                    <circle cx={p.x} cy={p.y - h} r="13" fill={color} opacity=".15" />
                    <circle cx={p.x} cy={p.y - h} r="7" fill={color} stroke="var(--map-pin-border)" strokeWidth="2" />
                    {a.id === 'P-03' && (
                      <g transform={`translate(${p.x + 17},${p.y - h - 19})`}>
                        <rect width="132" height="41" rx="7" className="map-tooltip" />
                        <text x="10" y="17" className="pin-label">
                          Ghorashal station
                        </text>
                        <text x="10" y="31" className="pin-sub">
                          Watch · Maintenance
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
              <text x="430" y="680" className="sea-label">
                B A Y O F B E N G A L
              </text>
              <text x="105" y="400" className="country-label">
                INDIA
              </text>
              <text x="640" y="570" className="country-label" transform="rotate(65 640 570)">
                MYANMAR
              </text>
            </svg>
          )}
        </div>
        {view === '3D' && (mapError || !geo.length) && (
          <div className="scene-fallback">
            <strong>{mapError ? 'Boundary data could not load.' : 'Preparing 3D map…'}</strong>
            {mapError && <button onClick={() => location.reload()}>Retry map</button>}
          </div>
        )}
        {view === '3D' && !mapError && geo.length > 0 && <InfrastructureScene geo={geo} assets={filtered} dark={dark} sector={sector} division={division} connections={layers.includes('Connections')} onSelect={setSelected} onFallback={() => setView('2D')} />}
        <div className="compass">
          <Compass size={27} />
          <span>N</span>
        </div>
        <div className="map-controls">
          <button aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}>
            <Plus />
          </button>
          <button aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.65, z - 0.15))}>
            <Minus />
          </button>
          <button
            aria-label="Reset map orientation"
            onClick={() => {
              setZoom(1);
              setRotation(-9);
            }}
          >
            <RotateCcw />
          </button>
          <button aria-label="Open national map" onClick={() => go('National map')}>
            <Maximize2 />
          </button>
        </div>
        <div className="map-bottom">
          <span>
            <i className="dot dot-0" /> Power <i className="dot dot-1" /> Telecom <i className="dot dot-2" /> Alert
          </span>
          <span>{view === '3D' ? 'Drag to rotate · Select a marker' : 'Select a marker to inspect'}</span>
        </div>
      </div>
      <div className="map-credit">Boundaries: geoBoundaries / BBS / OCHA · CC BY 4.0</div>
    </section>
  );

  const isTelcoView = page === 'Telecom' || sector === 'Telecom';

  return (
    <SidebarProvider>
      <Sidebar className="main-sidebar">
        <SidebarHeader>
          <div className="brand">
            <span className="brand-icon">
              <img src="/puku-ai.png" alt="PUKU-AI Logo" className="brand-logo-img" />
            </span>
            <div>
              Central Eye<span>INFRASTRUCTURE INTELLIGENCE</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <div className="workspace">
              <span className="flag">●</span>
              <div>
                Bangladesh<small>ICT Ministry Workspace</small>
              </div>
              <ChevronRight size={15} />
            </div>
            <span className="nav-label">WORKSPACE</span>
            <SidebarMenu>
              {nav.map(([name, Icon]) => (
                <React.Fragment key={name}>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={page === name} onClick={() => go(name)}>
                      <Icon />
                      <span>{name}</span>
                      {name === 'Incidents' && <b className="nav-count">3</b>}
                      {name === 'Live Telemetry' && <span className="tiny" style={{ background: 'var(--primary)', color: '#fff', border: 'none' }}>STREAM</span>}
                      {name === 'Telecom' && (
                        <span className="tiny" style={{ background: 'var(--subtle)', color: 'var(--primary)', border: '1px solid var(--border)' }}>
                          BTRC
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {name === 'Telecom' && (
                    <div
                      style={{
                        paddingLeft: '14px',
                        margin: '2px 0 6px 8px',
                        borderLeft: '2px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}
                    >
                      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted-foreground)', padding: '4px 6px 2px', letterSpacing: '0.6px' }}>
                        পরিসংখ্যান
                      </div>
                      {TELCO_SUBMENU_ITEMS.map((item) => {
                        const isSubActive = page === 'Telecom' && telcoSubTabId === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              go('Telecom');
                              setTelcoSubTabId(item.id);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              width: '100%',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              textAlign: 'left',
                              background: isSubActive ? 'var(--sidebar-accent)' : 'transparent',
                              color: isSubActive ? 'var(--sidebar-accent-foreground)' : 'var(--sidebar-foreground)',
                              fontWeight: isSubActive ? 600 : 400,
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.title_bn}
                            </span>
                            {item.countBadge && (
                              <span style={{ fontSize: '9px', opacity: 0.75, flexShrink: 0, marginLeft: '4px' }}>
                                {item.countBadge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </React.Fragment>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="sidebar-status">
            <span className="dot healthy" />
            Live Stream Active
            <small>ICT Ministry Telemetry Engine</small>
          </div>
          <button className="profile" onClick={() => setSource('About Central Eye')}>
            <span className="avatar">CE</span>
            <span>
              National Intelligence<small>{role} workspace</small>
            </span>
            <Settings2 size={16} />
          </button>
        </SidebarFooter>
      </Sidebar>
      <main className="app-main">
        <header className="topbar">
          <div className="breadcrumbs">
            <SidebarTrigger />
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{page}</strong>
          </div>
          <div className="top-actions">
            <button className="search-button" onClick={() => setSearchOpen(true)}>
              <Search size={16} />
              <span>Search infrastructure…</span>
              <kbd>⌘ K</kbd>
            </button>
            <button className="icon-button" aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'} onClick={() => setDark(!dark)}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="icon-button notification" aria-label="View 3 active incidents" onClick={() => go('Incidents')}>
              <Bell size={18} />
              <i />
            </button>
            <span className="avatar small">CE</span>
          </div>
        </header>

        {/* Real-time Telemetry Pipeline Control & Live Ticker Bar */}
        <div className="telemetry-control-bar">
          <div className="telemetry-controls-left">
            <span className="telemetry-status-badge">
              <span className={'dot ' + (isStreaming ? 'healthy' : '')} style={{ width: '8px', height: '8px', background: isStreaming ? '#56c4ac' : '#888' }} />
              {isStreaming ? 'STREAMING REAL-TIME' : 'PAUSED'}
            </span>

            <button className="quiet-button telemetry-btn" onClick={() => setIsStreaming(!isStreaming)}>
              {isStreaming ? <Pause size={13} /> : <Play size={13} />} {isStreaming ? 'Pause Stream' : 'Resume Stream'}
            </button>

            <div className="telemetry-select-wrapper">
              <Sliders size={13} /> Scenario:
              <select value={scenario} onChange={(e) => setScenario(e.target.value as PipelineScenario)} className="telemetry-select">
                <option value="normal">Normal Grid Operations</option>
                <option value="peak_heatwave">Peak Heatwave Demand</option>
                <option value="severe_load_shedding">Severe Load Shedding</option>
                <option value="storm_cyclone">Coastal Cyclone Outage</option>
              </select>
            </div>

            <div className="telemetry-speed-group">
              {[1, 2, 5].map((s) => (
                <button key={s} onClick={() => setSpeed(s)} className={'speed-btn ' + (speed === s ? 'active' : '')}>
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div className="telemetry-ticker-box">
            <Activity size={13} style={{ color: 'var(--primary)', flex: 'none' }} />
            <span style={{ color: 'var(--muted-foreground)', flex: 'none' }}>Latest Event:</span>
            <span style={{ color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
              {eventsLog.length > 0 ? `${eventsLog[0].timestamp} [${eventsLog[0].sector}] ${eventsLog[0].message}` : 'Connecting stream...'}
            </span>
          </div>
        </div>

        <div className="page-body">
          <div className="page-title">
            <div>
              <div className="title-overline">
                BANGLADESH <span>/</span> ICT MINISTRY TELEMETRY COMMAND CENTER
              </div>
              <h1>{page === 'Overview' ? 'National Overview' : page}</h1>
              <p>{isTelcoView ? 'Real-time telecommunication spectrum, 4G/5G coverage, subscriber penetration, network speeds, and subsea bandwidth analytics.' : 'Real-time telemetry monitoring for electricity shortages, load shedding, and network operations.'}</p>
            </div>
            <div className="title-actions">
              <Picker
                value={role}
                onChange={(v) => {
                  setRole(v);
                  setNotice(`Role switched to ${v}`);
                }}
                values={['Executive', 'Grid Operator', 'Regulator']}
              />
              <button
                className="primary-button"
                onClick={() => {
                  setDivision('All Bangladesh');
                  setSector('All sectors');
                  setNotice('Dashboard filters reset');
                }}
              >
                <RotateCcw size={14} /> Reset filters
              </button>
            </div>
          </div>

          <div className="filterbar">
            <div>
              <Picker value={division} onChange={setDivision} values={divisions} />
              <Picker value={sector} onChange={setSector} values={['All sectors', 'Electricity', 'Telecom']} />
              <Picker value={period} onChange={setPeriod} values={['Live pulse', '1 hour', '24 hours', '7 days']} />
              <button
                className={'quiet-button ' + (saved ? 'saved' : '')}
                onClick={() => {
                  if (saved) {
                    const raw = localStorage.getItem('central-eye-view');
                    if (raw) {
                      const v = JSON.parse(raw);
                      setDivision(v.division);
                      setSector(v.sector);
                      setNotice('Restored saved view');
                    }
                  } else {
                    localStorage.setItem('central-eye-view', JSON.stringify({ division, sector }));
                    setSaved(true);
                    setNotice('View saved on this device');
                  }
                }}
              >
                {saved ? <Check size={14} /> : <Plus size={14} />} {saved ? 'Restore saved view' : 'Save view'}
              </button>
            </div>
            <span className="snapshot">
              <span className="dot healthy" /> Real-time Pipeline <span className="divider">|</span>
              <Tag tone="green">{isTelcoView ? 'TELECOM TELEMETRY' : 'LIVE TELEMETRY'}</Tag>
            </span>
          </div>

          {/* Dynamic Top Metrics Cards Switcher */}
          {['Overview', 'Live Telemetry', 'Electricity', 'Telecom', 'National map'].includes(page) && (
            <div className="metrics">
              {isTelcoView
                ? [
                  {
                    label: 'টেলিডেনসিটি (Teledensity)',
                    value: `${BTRC_METADATA.metrics.teledensity_pct}`,
                    unit: '%',
                    icon: Signal,
                    sub: `ইন্টারনেট পেনেট্রেশন: ${BTRC_METADATA.metrics.internet_penetration_pct}%`,
                    detail: `ফিক্সড ব্রডব্যান্ড: 8.63% · মোবাইল: 68.79%`,
                    color: '#65c7ab',
                    id: 'Mobile subscriptions',
                  },
                  {
                    label: 'মোট মোবাইল গ্রাহক (Subscribers)',
                    value: `${BTRC_METADATA.metrics.total_mobile_subs_m}`,
                    unit: 'Million',
                    icon: Users,
                    sub: `GP 87.0M · Robi 58.8M · BL 37.8M · TT 6.8M`,
                    detail: `সক্রিয় সিম সংযোগ (BTRC Official)`,
                    color: '#70b8f4',
                    id: 'Mobile subscriptions',
                  },
                  {
                    label: 'মোট ইন্টারনেট গ্রাহক (Internet)',
                    value: `${BTRC_METADATA.metrics.total_internet_subs_m}`,
                    unit: 'Million',
                    icon: Globe2,
                    sub: `মোবাইল: 121.52M · আইএসপি: 15.23M`,
                    detail: `৭৭.৪২% জাতীয় ইন্টারনেট ব্যবহারকারী`,
                    color: '#6ccaff',
                    id: 'Subsea Cable Bandwidth',
                  },
                  {
                    label: 'অপারেটর টাওয়ার সংখ্যা (Towers)',
                    value: `${BTRC_METADATA.metrics.total_towers.toLocaleString()}`,
                    unit: 'Towers',
                    icon: Server,
                    sub: `টাওয়ারকো: 24,728 (53%) · এমএনও: 21,882 (47%)`,
                    detail: `ফাইবার: 179,775 কি.মি. · তরঙ্গ: 406.6 MHz`,
                    color: '#e6b561',
                    id: 'Subsea Cable Bandwidth',
                  },
                ].map((m, i) => (
                  <button className="metric panel" key={m.label} onClick={() => setSource(m.id)}>
                    <div className="metric-label">
                      <span>{m.label}</span>
                      <m.icon size={17} style={{ color: m.color }} />
                    </div>
                    <div className="metric-value">
                      {m.value}
                      <span>{m.unit}</span>
                    </div>
                    <div className="metric-detail" style={{ color: m.color }}>
                      <span>•</span> {m.detail}
                    </div>
                    <div className="metric-bottom">
                      <span>{m.sub}</span>
                      <Spark color={m.color} />
                    </div>
                  </button>
                ))
                : page === 'Electricity'
                  ? [
                    {
                      label: 'Substation Demand',
                      value: POWERGRID_METADATA.latest_entry.demand_mw.toLocaleString(),
                      unit: 'MW',
                      icon: Zap,
                      sub: `Supply: ${POWERGRID_METADATA.latest_entry.supply_mw.toLocaleString()} MW · Gen: ${(POWERGRID_METADATA.latest_entry.total_gen_mw ?? 0).toLocaleString()} MW`,
                      detail: `Power Grid Bangladesh · Deficit: ${((POWERGRID_METADATA.latest_entry.loadshed_mw / POWERGRID_METADATA.latest_entry.demand_mw) * 100).toFixed(1)}%`,
                      color: POWERGRID_METADATA.latest_entry.loadshed_mw > 1000 ? '#ed9786' : '#e6b561',
                      id: 'Grid-installed capacity',
                    },
                    {
                      label: 'Active Load Shedding',
                      value: POWERGRID_METADATA.latest_entry.loadshed_mw.toLocaleString(),
                      unit: 'MW',
                      icon: RefreshCw,
                      sub: `7d Avg Shedding: ${POWERGRID_METADATA.stats_7d.avg_loadshed_mw} MW (Peak: ${POWERGRID_METADATA.stats_7d.max_loadshed_mw} MW)`,
                      detail: `Rotational shedding active across grid substations`,
                      color: '#ed9786',
                      id: 'Active Load Shedding',
                    },
                    {
                      label: 'Cross-Border Power Imports',
                      value: (POWERGRID_METADATA.latest_entry.cross_border?.total_imports_mw ?? 2409).toLocaleString(),
                      unit: 'MW',
                      icon: Server,
                      sub: `Adani: ${POWERGRID_METADATA.latest_entry.cross_border?.india_adani_mw} MW · Bheramara: ${POWERGRID_METADATA.latest_entry.cross_border?.india_bheramara_mw} MW · Tripura: ${POWERGRID_METADATA.latest_entry.cross_border?.india_tripura_mw} MW`,
                      detail: `${(((POWERGRID_METADATA.latest_entry.cross_border?.total_imports_mw ?? 2409) / (POWERGRID_METADATA.latest_entry.total_gen_mw || 1)) * 100).toFixed(1)}% of total generation mix`,
                      color: '#70b8f4',
                      id: 'Grid-installed capacity',
                    },
                    {
                      label: 'Total Generation Fuel Mix',
                      value: (POWERGRID_METADATA.latest_entry.total_gen_mw ?? 15344).toLocaleString(),
                      unit: 'MW',
                      icon: Activity,
                      sub: `Coal: ${(POWERGRID_METADATA.latest_entry.coal_mw ?? 0).toLocaleString()} MW · Gas: ${(POWERGRID_METADATA.latest_entry.gas_mw ?? 0).toLocaleString()} MW · Oil: ${(POWERGRID_METADATA.latest_entry.liquid_fuel_mw ?? 0).toLocaleString()} MW`,
                      detail: `9 Fuel sources + Cross-border interconnectors`,
                      color: '#65c7ab',
                      id: 'Grid-installed capacity',
                    },
                  ].map((m) => (
                    <button className="metric panel" key={m.label} onClick={() => setSource(m.id)}>
                      <div className="metric-label">
                        <span>{m.label}</span>
                        <m.icon size={17} style={{ color: m.color }} />
                      </div>
                      <div className="metric-value">
                        {m.value}
                        <span>{m.unit}</span>
                      </div>
                      <div className="metric-detail" style={{ color: m.color }}>
                        <span>•</span> {m.detail}
                      </div>
                      <div className="metric-bottom">
                        <span>{m.sub}</span>
                        <Spark color={m.color} />
                      </div>
                    </button>
                  ))
                  : [
                    {
                      label: 'National Power Shortage',
                      value: totalShortage.toLocaleString(),
                      unit: 'MW',
                      icon: Zap,
                      sub: `Demand: ${totalDemand.toLocaleString()} MW · Supply: ${totalSupply.toLocaleString()} MW`,
                      detail: totalShortage > 0 ? `Deficit: ${((totalShortage / totalDemand) * 100).toFixed(1)}%` : 'Balanced Grid',
                      color: totalShortage > 500 ? '#ed9786' : '#e6b561',
                      id: 'Grid-installed capacity',
                    },
                    {
                      label: 'Active Load Shedding',
                      value: totalLoadShed.toLocaleString(),
                      unit: 'MW',
                      icon: RefreshCw,
                      sub: `Grid Freq: ${avgFrequency} Hz (Target 50.0 Hz)`,
                      detail: `Rotational load shedding active across ${divisionsData.filter((d) => d.loadSheddingMW > 0).length} divisions`,
                      color: '#e6b561',
                      id: 'Active Load Shedding',
                    },
                    {
                      label: 'Cross-Border Power Imports',
                      value: (POWERGRID_METADATA.latest_entry.cross_border?.total_imports_mw ?? 2409).toLocaleString(),
                      unit: 'MW',
                      icon: Server,
                      sub: `Adani: ${POWERGRID_METADATA.latest_entry.cross_border?.india_adani_mw ?? 1414} MW · Bheramara: ${POWERGRID_METADATA.latest_entry.cross_border?.india_bheramara_mw ?? 823} MW`,
                      detail: `${(((POWERGRID_METADATA.latest_entry.cross_border?.total_imports_mw ?? 2409) / (POWERGRID_METADATA.latest_entry.total_gen_mw || 1)) * 100).toFixed(1)}% of total generation mix`,
                      color: '#70b8f4',
                      id: 'Grid-installed capacity',
                    },
                    {
                      label: 'National Power Generation',
                      value: (POWERGRID_METADATA.latest_entry.total_gen_mw ?? 15344).toLocaleString(),
                      unit: 'MW',
                      icon: Activity,
                      sub: `Coal: ${(POWERGRID_METADATA.latest_entry.coal_mw ?? 4888).toLocaleString()} MW · Gas: ${(POWERGRID_METADATA.latest_entry.gas_mw ?? 4857).toLocaleString()} MW`,
                      detail: `Thermal & Hydro generation + Interconnectors`,
                      color: '#65c7ab',
                      id: 'Grid-installed capacity',
                    },
                  ].map((m, i) => (
                    <button className="metric panel" key={m.label} onClick={() => (i === 1 ? go('Live Telemetry') : setSource(m.id))}>
                      <div className="metric-label">
                        <span>{m.label}</span>
                        <m.icon size={17} style={{ color: m.color }} />
                      </div>
                      <div className="metric-value">
                        {m.value}
                        <span>{m.unit}</span>
                      </div>
                      <div className="metric-detail" style={{ color: m.color }}>
                        <span>•</span> {m.detail}
                      </div>
                      <div className="metric-bottom">
                        <span>{m.sub}</span>
                        <Spark color={m.color} />
                      </div>
                    </button>
                  ))}
            </div>
          )}

          {/* Overview & National Map View */}
          {['Overview', 'National map'].includes(page) && (
            <>
              <div className={page === 'National map' ? 'map-layout expanded' : 'map-layout'}>
              {map}
              <aside className="intelligence">
                <section className="panel health-panel">
                  <div className="section-top">
                    <h2>Live Grid & Network Pulse</h2>
                    <Activity size={17} />
                  </div>
                  <p className="metadata">Real-time telemetry signals</p>
                  {[
                    ['Electricity Shortage', totalShortage > 500 ? 'Critical Deficit' : 'Active Shedding', `${totalShortage} MW shortage (${totalLoadShed} MW shedding)`],
                    ['Telco 3G/4G/5G Network', Number(avgUptime) < 97 ? 'Attention' : 'Normal', `Site Uptime: ${avgUptime}% · ${activeTowers.toLocaleString()} towers live`],
                    ['Subsea Fiber Landing', 'Optimal', `Traffic: ${(totalTrafficGbps / 1000).toFixed(2)} Tbps (SEA-ME-WE 4/5)`],
                  ].map(([n, s, d], i) => (
                    <div className="health-row" key={n}>
                      <div className={'health-icon health-' + i}>{i === 0 ? <Zap size={18} /> : i === 1 ? <Radio size={18} /> : <ShieldCheck size={18} />}</div>
                      <div>
                        <strong>{n}</strong>
                        <small>{d}</small>
                      </div>
                      <Tag tone={i === 0 ? 'red' : i === 1 ? (Number(avgUptime) < 97 ? 'amber' : 'green') : 'green'}>{s}</Tag>
                    </div>
                  ))}
                </section>
                <section className="panel attention-panel">
                  <div className="section-top">
                    <h2>Needs Attention</h2>
                    <span className="count">{alerts.length}</span>
                  </div>
                  {alerts.slice(0, 2).map((a) => (
                    <button className="attention-item" key={a.id} onClick={() => setSelected(assets.find((x) => x.id === a.asset)!)}>
                      <div>
                        <Tag tone={a.severity === 'Critical' ? 'red' : 'amber'}>{a.severity}</Tag>
                        <span className="metadata">{a.division}</span>
                      </div>
                      <h3>{a.title}</h3>
                      <p>{a.impact} potentially affected</p>
                      <span className="attention-link">
                        Inspect incident <ArrowUpRight size={14} />
                      </span>
                    </button>
                  ))}
                  {!alerts.length && <p className="empty">No incidents match your filters.</p>}
                  <button className="full-link" onClick={() => go('Incidents')}>
                    Open Incident Center <ArrowRight size={16} />
                  </button>
                </section>
              </aside>
            </div>

            {page === 'Overview' && (
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <SLACrossCheckView slaOperators={slaOperators} />
                <BGPHurricaneReportView bgpReports={bgpReports} />
              </div>
            )}
          </>
          )}

          {/* DEDICATED ELECTRICITY COMMAND PAGE POWERED BY LIVE POWER GRID BANGLADESH PLC SCRAPED DATA */}
          {page === 'Electricity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* PowerGrid Source Banner & Actions */}
              <div
                className="panel"
                style={{
                  padding: '20px 24px',
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--card) 90%, #f6bf6515), var(--background))',
                  borderColor: '#f6bf6555',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ background: '#f6bf6520', color: '#e5a53d', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Zap size={14} /> POWER GRID BANGLADESH PLC (PGCB)
                    </span>
                    <Tag tone="green">LIVE SCRAPED DATA</Tag>
                    <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                      {POWERGRID_METADATA.total_unified_records.toLocaleString()} Records Scraped · {POWERGRID_METADATA.date_range.earliest} to {POWERGRID_METADATA.date_range.latest}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: 650, margin: '2px 0 6px' }}>
                    National Electricity Generation, Demand & Load Shedding Intelligence
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', maxWidth: '900px', lineHeight: 1.5 }}>
                    Hourly real-time telemetry aggregated from Power Grid Bangladesh official ERP portals: Substation Demand, Actual Grid Supply, Rotational Loadshedding, and Generation Breakdown across 9 Fuel Types & Cross-Border Transmission Lines.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <a
                    href="https://erp.powergrid.gov.bd/web/generations/view_demand_supply_loadshed_bn"
                    target="_blank"
                    rel="noreferrer"
                    className="quiet-button"
                    style={{ border: '1px solid var(--border)', borderRadius: '7px', fontSize: '12px', background: 'var(--card)' }}
                    title="Open official Demand, Supply & Loadshed Portal"
                  >
                    <span>Demand & Loadshed Portal</span>
                    <ArrowUpRight size={14} />
                  </a>
                  <a
                    href="https://erp.powergrid.gov.bd/w/generations/view_generations_bn"
                    target="_blank"
                    rel="noreferrer"
                    className="quiet-button"
                    style={{ border: '1px solid var(--border)', borderRadius: '7px', fontSize: '12px', background: 'var(--card)' }}
                    title="Open official Hourly Generation by Fuel Portal"
                  >
                    <span>Generation Portal</span>
                    <ArrowUpRight size={14} />
                  </a>
                  <button
                    className="primary-button"
                    onClick={downloadPowerGridCSV}
                    style={{ fontSize: '12px', padding: '8px 14px' }}
                  >
                    <Download size={14} /> Export CSV
                  </button>
                  <button
                    className="quiet-button"
                    onClick={downloadPowerGridJSON}
                    style={{ border: '1px solid var(--border)', borderRadius: '7px', fontSize: '12px', background: 'var(--card)' }}
                  >
                    <Database size={14} /> Scraped JSON (3,570)
                  </button>
                </div>
              </div>

              {/* PowerGrid Visual Infographics, Donut Charts & 24-Hour Area Telemetry */}
              <PowerGridVisuals />

              {/* Electricity Sub-Navigation Bar */}
              <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', flexWrap: 'wrap' }}>
                {[
                  ['Grid Balance & Overview', Zap],
                  ['Fuel Mix & Imports', Layers],
                  ['Hourly Demand Curves', TrendingUp],
                  ['PowerGrid Historical Log', Database],
                ].map(([tabName, Icon]) => (
                  <button
                    key={tabName as string}
                    onClick={() => setElectricitySubTab(tabName as any)}
                    className="quiet-button"
                    style={{
                      background: electricitySubTab === tabName ? 'var(--primary)' : 'var(--subtle)',
                      color: electricitySubTab === tabName ? '#fff' : 'var(--muted-foreground)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    <Icon size={15} />
                    {tabName as string}
                  </button>
                ))}
              </div>

              {/* Sub-Tab 1: Grid Balance & Overview */}
              {electricitySubTab === 'Grid Balance & Overview' && (
                <>
                  <div className="map-layout expanded">{map}</div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '20px' }}>
                    {/* Real-time Substation Demand vs Supply */}
                    <section className="panel data-panel">
                      <div className="section-top">
                        <h2>Live Grid Balance (Substation End)</h2>
                        <Tag tone={POWERGRID_METADATA.latest_entry.loadshed_mw > 1000 ? 'red' : 'amber'}>
                          DEFICIT: {((POWERGRID_METADATA.latest_entry.loadshed_mw / POWERGRID_METADATA.latest_entry.demand_mw) * 100).toFixed(1)}%
                        </Tag>
                      </div>
                      <p className="metadata">
                        Snapshot: {POWERGRID_METADATA.latest_entry.date} at {POWERGRID_METADATA.latest_entry.time} BST · Substation telemetry
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
                        <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--subtle)', border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', display: 'block' }}>SUBSTATION DEMAND</span>
                          <strong style={{ fontSize: '22px', fontWeight: 650, color: '#f0b452' }}>
                            {POWERGRID_METADATA.latest_entry.demand_mw.toLocaleString()} <span style={{ fontSize: '12px' }}>MW</span>
                          </strong>
                        </div>
                        <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--subtle)', border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', display: 'block' }}>GRID SUPPLY</span>
                          <strong style={{ fontSize: '22px', fontWeight: 650, color: '#48a989' }}>
                            {POWERGRID_METADATA.latest_entry.supply_mw.toLocaleString()} <span style={{ fontSize: '12px' }}>MW</span>
                          </strong>
                        </div>
                        <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--subtle)', border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', display: 'block' }}>LOAD SHEDDING</span>
                          <strong style={{ fontSize: '22px', fontWeight: 650, color: '#ec7b6b' }}>
                            {POWERGRID_METADATA.latest_entry.loadshed_mw.toLocaleString()} <span style={{ fontSize: '12px' }}>MW</span>
                          </strong>
                        </div>
                      </div>

                      {/* Demand satisfaction bar */}
                      <div style={{ marginTop: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                          <span>Supply Coverage Ratio</span>
                          <strong>{((POWERGRID_METADATA.latest_entry.supply_mw / POWERGRID_METADATA.latest_entry.demand_mw) * 100).toFixed(1)}% Served</strong>
                        </div>
                        <div style={{ height: '10px', borderRadius: '5px', background: '#ec7b6b33', overflow: 'hidden', display: 'flex' }}>
                          <div
                            style={{
                              width: `${(POWERGRID_METADATA.latest_entry.supply_mw / POWERGRID_METADATA.latest_entry.demand_mw) * 100}%`,
                              background: '#48a989',
                              height: '100%',
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                          <span>Met by Generation & Imports</span>
                          <span>Unmet (Rotational Load Shedding)</span>
                        </div>
                      </div>

                      {/* Peak events summary */}
                      <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Today’s Grid Peak Highlights</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div style={{ padding: '10px', borderRadius: '6px', background: 'var(--subtle)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Tag tone="amber">Day Peak (12:00 BST)</Tag>
                            </div>
                            <p style={{ fontSize: '14px', fontWeight: 600, margin: '6px 0 2px' }}>16,076 MW Demand</p>
                            <small style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>Supply: 13,567 MW · Shedding: 2,509 MW · Solar: 662 MW</small>
                          </div>
                          <div style={{ padding: '10px', borderRadius: '6px', background: 'var(--subtle)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Tag tone="red">Evening Peak (19:00 BST)</Tag>
                            </div>
                            <p style={{ fontSize: '14px', fontWeight: 600, margin: '6px 0 2px' }}>17,280 MW Demand</p>
                            <small style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>Supply: 14,578 MW · Shedding: 2,702 MW · Adani: 1,417 MW</small>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Cross-border and Interconnection Status */}
                    <section className="panel data-panel">
                      <div className="section-top">
                        <h2>Cross-Border Transmission Interconnectors</h2>
                        <Tag tone="green">TOTAL: {POWERGRID_METADATA.latest_entry.cross_border?.total_imports_mw.toLocaleString()} MW</Tag>
                      </div>
                      <p className="metadata">International power import corridors supplying the national transmission grid</p>

                      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {[
                          {
                            name: 'India - Adani Godda Dedicated Corridor',
                            voltage: '400 kV HVDC/HVAC Dedicated Link',
                            capacity: '1,600 MW',
                            flow: POWERGRID_METADATA.latest_entry.cross_border?.india_adani_mw ?? 1414,
                            status: 'Optimal',
                            share: (((POWERGRID_METADATA.latest_entry.cross_border?.india_adani_mw ?? 1414) / (POWERGRID_METADATA.latest_entry.total_gen_mw || 1)) * 100).toFixed(1),
                            color: '#70b8f4',
                          },
                          {
                            name: 'India - Bheramara Back-to-Back HVDC',
                            voltage: '500 kV Back-to-Back Substation (Bahrampur-Bheramara)',
                            capacity: '1,000 MW',
                            flow: POWERGRID_METADATA.latest_entry.cross_border?.india_bheramara_mw ?? 823,
                            status: 'Optimal',
                            share: (((POWERGRID_METADATA.latest_entry.cross_border?.india_bheramara_mw ?? 823) / (POWERGRID_METADATA.latest_entry.total_gen_mw || 1)) * 100).toFixed(1),
                            color: '#e5a53d',
                          },
                          {
                            name: 'India - Tripura Transmission Link',
                            voltage: '400 kV Surjamaninagar - South Comilla',
                            capacity: '200 MW',
                            flow: POWERGRID_METADATA.latest_entry.cross_border?.india_tripura_mw ?? 172,
                            status: 'Optimal',
                            share: (((POWERGRID_METADATA.latest_entry.cross_border?.india_tripura_mw ?? 172) / (POWERGRID_METADATA.latest_entry.total_gen_mw || 1)) * 100).toFixed(1),
                            color: '#a78bfa',
                          },
                          {
                            name: 'Nepal - Bangladesh Cross-Border Link',
                            voltage: 'Scheduled Trilateral Corridor via Indian Grid',
                            capacity: '40 MW',
                            flow: POWERGRID_METADATA.latest_entry.cross_border?.nepal_mw ?? 0,
                            status: 'Scheduled',
                            share: '0.0',
                            color: '#94a3b8',
                          },
                        ].map((link) => (
                          <div key={link.name} style={{ padding: '12px', borderRadius: '8px', background: 'var(--subtle)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <strong style={{ fontSize: '13px' }}>{link.name}</strong>
                                <small style={{ display: 'block', color: 'var(--muted-foreground)', fontSize: '11px', marginTop: '2px' }}>{link.voltage}</small>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '15px', fontWeight: 700, color: link.color }}>{link.flow} MW</span>
                                <small style={{ display: 'block', fontSize: '10px', color: 'var(--muted-foreground)' }}>Capacity: {link.capacity}</small>
                              </div>
                            </div>
                            <div className="bar-track" style={{ marginTop: '8px' }}>
                              <span style={{ width: `${Math.min(100, (link.flow / parseInt(link.capacity.replace(/\D/g, ''))) * 100)}%`, background: link.color }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </>
              )}

              {/* Sub-Tab 2: Fuel Mix & Imports */}
              {electricitySubTab === 'Fuel Mix & Imports' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: '20px' }}>
                  {/* Generation by Fuel Breakdown */}
                  <section className="panel data-panel">
                    <div className="section-top">
                      <h2>Real-Time Generation Breakdown by Fuel Type</h2>
                      <Tag tone="green">TOTAL GEN: {(POWERGRID_METADATA.latest_entry.total_gen_mw ?? 15344).toLocaleString()} MW</Tag>
                    </div>
                    <p className="metadata">
                      Hourly generation telemetry by source · Power Grid Bangladesh PLC
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                      {[
                        {
                          name: 'Coal (কয়লা)',
                          desc: 'Payra, Rampal, Matarbari, Barisal thermal stations',
                          mw: POWERGRID_METADATA.latest_entry.coal_mw ?? 4888,
                          color: '#556975',
                        },
                        {
                          name: 'Natural Gas (গ্যাস)',
                          desc: 'Combined cycle & steam plants (Ashuganj, Ghorashal, Haripur)',
                          mw: POWERGRID_METADATA.latest_entry.gas_mw ?? 4857,
                          color: '#e5a53d',
                        },
                        {
                          name: 'Liquid Fuel / HFO (তরল জ্বালানী)',
                          desc: 'Quick rental and peaking furnace oil / diesel engines',
                          mw: POWERGRID_METADATA.latest_entry.liquid_fuel_mw ?? 2968,
                          color: '#ec7b6b',
                        },
                        {
                          name: 'Cross-Border Imports (ভারত ও নেপাল)',
                          desc: 'Adani 400kV, Bheramara 500kV HVDC, Tripura 400kV lines',
                          mw: POWERGRID_METADATA.latest_entry.cross_border?.total_imports_mw ?? 2409,
                          color: '#469bfc',
                        },
                        {
                          name: 'Hydroelectric (হাইড্রো)',
                          desc: 'Kaptai 230 MW Hydroelectric Power Station (BPDB)',
                          mw: POWERGRID_METADATA.latest_entry.hydro_mw ?? 222,
                          color: '#48a989',
                        },
                        {
                          name: 'Solar PV (সৌর)',
                          desc: 'Grid-connected solar parks (Mymensingh, Teknaf, Sreepur, Sirajganj)',
                          mw: POWERGRID_METADATA.latest_entry.solar_mw ?? 0,
                          note: 'Day peak up to 662 MW',
                          color: '#facc15',
                        },
                        {
                          name: 'Wind Power (বায়ু)',
                          desc: 'Cox’s Bazar 60 MW Wind Farm & Kutubdia pilots',
                          mw: POWERGRID_METADATA.latest_entry.wind_mw ?? 0,
                          note: 'Day peak up to 15 MW',
                          color: '#38bdf8',
                        },
                      ].map((fuel) => {
                        const total = POWERGRID_METADATA.latest_entry.total_gen_mw || 15344;
                        const pct = ((fuel.mw / total) * 100).toFixed(1);
                        return (
                          <div key={fuel.name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                              <div>
                                <strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <i className="dot" style={{ background: fuel.color }} />
                                  {fuel.name}
                                </strong>
                                <small style={{ display: 'block', color: 'var(--muted-foreground)', fontSize: '11px', marginTop: '2px' }}>
                                  {fuel.desc} {fuel.note && `· ${fuel.note}`}
                                </small>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <strong style={{ fontSize: '14px' }}>{fuel.mw.toLocaleString()} MW</strong>
                                <small style={{ display: 'block', fontSize: '11px', color: 'var(--muted-foreground)' }}>{pct}% of mix</small>
                              </div>
                            </div>
                            <div className="bar-track" style={{ marginTop: '8px' }}>
                              <span style={{ width: `${pct}%`, background: fuel.color }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Fuel Distribution & Transition Summary */}
                  <section className="panel data-panel">
                    <div className="section-top">
                      <h2>Fuel Mix Portfolio Analysis</h2>
                      <Activity size={18} />
                    </div>
                    <p className="metadata">National energy balance & sustainability profile</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '16px' }}>
                      <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--subtle)', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontWeight: 600 }}>THERMAL FOSSIL GENERATION</span>
                        <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '6px 0 2px', color: '#ec9c8e' }}>
                          {(
                            (POWERGRID_METADATA.latest_entry.coal_mw ?? 0) +
                            (POWERGRID_METADATA.latest_entry.gas_mw ?? 0) +
                            (POWERGRID_METADATA.latest_entry.liquid_fuel_mw ?? 0)
                          ).toLocaleString()} MW
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                          {(
                            (((POWERGRID_METADATA.latest_entry.coal_mw ?? 0) +
                              (POWERGRID_METADATA.latest_entry.gas_mw ?? 0) +
                              (POWERGRID_METADATA.latest_entry.liquid_fuel_mw ?? 0)) /
                              (POWERGRID_METADATA.latest_entry.total_gen_mw || 1)) *
                            100
                          ).toFixed(1)}% of total domestic generation is fossil fuel (Coal, Natural Gas, HFO)
                        </p>
                      </div>

                      <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--subtle)', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontWeight: 600 }}>CROSS-BORDER REGIONAL TRADE</span>
                        <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '6px 0 2px', color: '#70b8f4' }}>
                          {(POWERGRID_METADATA.latest_entry.cross_border?.total_imports_mw ?? 2409).toLocaleString()} MW
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                          {(
                            ((POWERGRID_METADATA.latest_entry.cross_border?.total_imports_mw ?? 2409) /
                              (POWERGRID_METADATA.latest_entry.total_gen_mw || 1)) *
                            100
                          ).toFixed(1)}% supplied via high-voltage international transmission interconnections
                        </p>
                      </div>

                      <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--subtle)', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontWeight: 600 }}>RENEWABLES & HYDROELECTRIC</span>
                        <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '6px 0 2px', color: '#65c7ab' }}>
                          {(
                            (POWERGRID_METADATA.latest_entry.hydro_mw ?? 0) +
                            (POWERGRID_METADATA.latest_entry.solar_mw ?? 0) +
                            (POWERGRID_METADATA.latest_entry.wind_mw ?? 0)
                          ).toLocaleString()} MW
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                          Hydro (222 MW) + Day Solar peaks up to 662 MW + Wind (up to 15 MW)
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* Sub-Tab 3: Hourly Demand Curves */}
              {electricitySubTab === 'Hourly Demand Curves' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <section className="panel data-panel">
                    <div className="section-top">
                      <div>
                        <h2>Recent 24-Hour Real-Time Generation vs Power Demand Profile</h2>
                        <p className="metadata">Actual hourly values from Power Grid Bangladesh PLC (PGCB) telemetry</p>
                      </div>
                      <Tag tone="green">LIVE TELEMETRY</Tag>
                    </div>

                    <div className="chart-legend" style={{ margin: '18px 0 10px' }}>
                      <span>
                        <i className="dot" style={{ background: '#f0b452' }} /> Substation Demand (MW)
                      </span>
                      <span>
                        <i className="dot" style={{ background: '#48a989' }} /> Grid Supply (MW)
                      </span>
                      <span>
                        <i className="dot" style={{ background: '#ec7b6b' }} /> Load Shedding (MW)
                      </span>
                      <span>
                        <i className="dot" style={{ background: '#64c7af' }} /> Total Generation (MW)
                      </span>
                    </div>

                    {/* SVG Curve for recent 24 hours */}
                    <div style={{ height: '220px', width: '100%', position: 'relative', marginTop: '15px' }}>
                      <svg viewBox="0 0 800 200" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                        {[40, 80, 120, 160].map((y) => (
                          <line key={y} x1="0" x2="800" y1={y} y2={y} stroke="var(--border)" strokeDasharray="3 5" />
                        ))}
                        {/* Demand line */}
                        <polyline
                          points={POWERGRID_RECENT_HOURLY.slice(0, 24)
                            .map((r, idx) => {
                              const x = (idx / 23) * 800;
                              const y = 190 - ((r.demand_mw - 10000) / 8000) * 160;
                              return `${x},${Math.max(10, Math.min(190, y))}`;
                            })
                            .reverse()
                            .join(' ')}
                          fill="none"
                          stroke="#f0b452"
                          strokeWidth="2.5"
                          strokeDasharray="5 3"
                        />
                        {/* Supply line */}
                        <polyline
                          points={POWERGRID_RECENT_HOURLY.slice(0, 24)
                            .map((r, idx) => {
                              const x = (idx / 23) * 800;
                              const y = 190 - ((r.supply_mw - 10000) / 8000) * 160;
                              return `${x},${Math.max(10, Math.min(190, y))}`;
                            })
                            .reverse()
                            .join(' ')}
                          fill="none"
                          stroke="#48a989"
                          strokeWidth="3"
                        />
                        {/* Loadshedding line */}
                        <polyline
                          points={POWERGRID_RECENT_HOURLY.slice(0, 24)
                            .map((r, idx) => {
                              const x = (idx / 23) * 800;
                              const y = 190 - (r.loadshed_mw / 4000) * 160;
                              return `${x},${Math.max(10, Math.min(190, y))}`;
                            })
                            .reverse()
                            .join(' ')}
                          fill="none"
                          stroke="#ec7b6b"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '8px' }}>
                      {POWERGRID_RECENT_HOURLY.slice(0, 24)
                        .filter((_, i) => i % 4 === 0)
                        .reverse()
                        .map((r) => (
                          <span key={r.date + r.time}>{r.time.slice(0, 5)}</span>
                        ))}
                    </div>
                  </section>

                  {/* Hourly Telemetry Detail Table */}
                  <section className="panel data-panel">
                    <div className="section-top">
                      <h2>Last 24 Hours Hourly Grid Telemetry</h2>
                      <Tag tone="green">24 RECORDS</Tag>
                    </div>
                    <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {['Time', 'Date', 'Demand (MW)', 'Supply (MW)', 'Loadshed (MW)', 'Deficit %', 'Generation (MW)', 'Gas (MW)', 'Coal (MW)', 'Imports (MW)', 'Remarks'].map((h) => (
                              <TableHead key={h}>{h}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {POWERGRID_RECENT_HOURLY.slice(0, 24).map((r, idx) => {
                            const deficitPct = r.demand_mw > 0 ? ((r.loadshed_mw / r.demand_mw) * 100).toFixed(1) : '0.0';
                            return (
                              <TableRow key={idx}>
                                <TableCell style={{ fontWeight: 650 }}>{r.time}</TableCell>
                                <TableCell>{r.date}</TableCell>
                                <TableCell style={{ color: '#f0b452', fontWeight: 600 }}>{r.demand_mw.toLocaleString()}</TableCell>
                                <TableCell style={{ color: '#48a989', fontWeight: 600 }}>{r.supply_mw.toLocaleString()}</TableCell>
                                <TableCell style={{ color: r.loadshed_mw > 2000 ? '#ec7b6b' : 'inherit', fontWeight: 600 }}>
                                  {r.loadshed_mw.toLocaleString()}
                                </TableCell>
                                <TableCell>{deficitPct}%</TableCell>
                                <TableCell>{(r.total_gen_mw ?? 0).toLocaleString()}</TableCell>
                                <TableCell>{(r.gas_mw ?? 0).toLocaleString()}</TableCell>
                                <TableCell>{(r.coal_mw ?? 0).toLocaleString()}</TableCell>
                                <TableCell>{(r.cross_border?.total_imports_mw ?? 0).toLocaleString()}</TableCell>
                                <TableCell>
                                  {r.remark ? (
                                    <Tag tone={r.remark.includes('Peak') ? 'amber' : 'neutral'}>{r.remark}</Tag>
                                  ) : (
                                    <span style={{ color: 'var(--muted-foreground)' }}>—</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </section>
                </div>
              )}

              {/* Sub-Tab 4: PowerGrid Historical Log */}
              {electricitySubTab === 'PowerGrid Historical Log' && (
                <section className="panel data-panel">
                  <div className="section-top">
                    <div>
                      <h2>Power Grid Bangladesh PLC — Historical Scraped Telemetry</h2>
                      <p className="metadata">
                        Search and inspect all {POWERGRID_METADATA.total_unified_records.toLocaleString()} hourly demand, supply, loadshedding and generation logs.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="quiet-button" onClick={downloadPowerGridCSV} style={{ border: '1px solid var(--border)', borderRadius: '6px', fontSize: '11px' }}>
                        <Download size={13} /> Export CSV
                      </button>
                      <button className="primary-button" onClick={downloadPowerGridJSON} style={{ fontSize: '11px', padding: '6px 12px' }}>
                        <Database size={13} /> Full JSON
                      </button>
                    </div>
                  </div>

                  {/* Filter Toolbar */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', margin: '16px 0', flexWrap: 'wrap' }}>
                    <div className="search-input" style={{ flex: 1, minWidth: '240px', padding: '8px 12px' }}>
                      <Search size={16} />
                      <input
                        placeholder="Search date (e.g. 08-09-2026, 07-09-2026) or time..."
                        value={pgSearch}
                        onChange={(e) => {
                          setPgSearch(e.target.value);
                          setPgPage(1);
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {(['All', 'Peaks', 'Loadshed'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => {
                            setPgFilterRemark(mode);
                            setPgPage(1);
                          }}
                          className="quiet-button"
                          style={{
                            background: pgFilterRemark === mode ? 'var(--primary)' : 'var(--subtle)',
                            color: pgFilterRemark === mode ? '#fff' : 'var(--muted-foreground)',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            fontSize: '11px',
                            padding: '6px 12px',
                          }}
                        >
                          {mode === 'All' ? 'All Logs' : mode === 'Peaks' ? 'Peak Hours Only' : 'High Loadshed (>2000 MW)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Historical Table */}
                  {(() => {
                    const filtered = POWERGRID_RECENT_HOURLY.filter((r) => {
                      const matchSearch =
                        !pgSearch ||
                        r.date.includes(pgSearch) ||
                        r.time.includes(pgSearch) ||
                        (r.remark && r.remark.toLowerCase().includes(pgSearch.toLowerCase()));
                      const matchRemark =
                        pgFilterRemark === 'All'
                          ? true
                          : pgFilterRemark === 'Peaks'
                            ? r.remark && r.remark.toLowerCase().includes('peak')
                            : r.loadshed_mw >= 2000;
                      return matchSearch && matchRemark;
                    });

                    const perPage = 15;
                    const totalPages = Math.ceil(filtered.length / perPage) || 1;
                    const pageRecords = filtered.slice((pgPage - 1) * perPage, pgPage * perPage);

                    return (
                      <>
                        <div className="table-responsive">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {['Date', 'Time', 'Demand (MW)', 'Supply (MW)', 'Loadshed (MW)', 'Total Gen (MW)', 'Gas (MW)', 'Coal (MW)', 'Liquid Fuel (MW)', 'Imports (MW)', 'Hydro (MW)', 'Solar (MW)', 'Remarks'].map((h) => (
                                  <TableHead key={h}>{h}</TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {pageRecords.map((r, idx) => (
                                <TableRow key={r.date + r.time + idx}>
                                  <TableCell style={{ fontWeight: 600 }}>{r.date}</TableCell>
                                  <TableCell>{r.time}</TableCell>
                                  <TableCell style={{ color: '#f0b452', fontWeight: 600 }}>{r.demand_mw.toLocaleString()}</TableCell>
                                  <TableCell style={{ color: '#48a989', fontWeight: 600 }}>{r.supply_mw.toLocaleString()}</TableCell>
                                  <TableCell style={{ color: r.loadshed_mw > 2000 ? '#ec7b6b' : 'inherit', fontWeight: 600 }}>
                                    {r.loadshed_mw.toLocaleString()}
                                  </TableCell>
                                  <TableCell style={{ fontWeight: 600 }}>{(r.total_gen_mw ?? 0).toLocaleString()}</TableCell>
                                  <TableCell>{(r.gas_mw ?? 0).toLocaleString()}</TableCell>
                                  <TableCell>{(r.coal_mw ?? 0).toLocaleString()}</TableCell>
                                  <TableCell>{(r.liquid_fuel_mw ?? 0).toLocaleString()}</TableCell>
                                  <TableCell style={{ color: '#70b8f4' }}>{(r.cross_border?.total_imports_mw ?? 0).toLocaleString()}</TableCell>
                                  <TableCell>{(r.hydro_mw ?? 0).toLocaleString()}</TableCell>
                                  <TableCell>{(r.solar_mw ?? 0).toLocaleString()}</TableCell>
                                  <TableCell>
                                    {r.remark ? (
                                      <Tag tone={r.remark.includes('Peak') ? 'amber' : 'neutral'}>{r.remark}</Tag>
                                    ) : (
                                      <span style={{ color: 'var(--muted-foreground)' }}>—</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                              {!pageRecords.length && (
                                <TableRow>
                                  <TableCell colSpan={13} style={{ textAlign: 'center', padding: '30px', color: 'var(--muted-foreground)' }}>
                                    No records match the active search and filter.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Pagination Bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                          <span>
                            Showing {(pgPage - 1) * perPage + 1}–{Math.min(pgPage * perPage, filtered.length)} of {filtered.length} matching records
                          </span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              disabled={pgPage <= 1}
                              onClick={() => setPgPage((p) => Math.max(1, p - 1))}
                              className="quiet-button"
                              style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 10px' }}
                            >
                              Previous
                            </button>
                            <span style={{ padding: '4px 8px', fontWeight: 600, color: 'var(--foreground)' }}>
                              Page {pgPage} of {totalPages}
                            </span>
                            <button
                              disabled={pgPage >= totalPages}
                              onClick={() => setPgPage((p) => Math.min(totalPages, p + 1))}
                              className="quiet-button"
                              style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 10px' }}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </section>
              )}
            </div>
          )}

          {/* DEDICATED TELECOM COMMAND PAGE WITH BTRC SUB-MENUS & ALL 10 DATASETS */}
          {page === 'Telecom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Map Section Visualizing Telecom Infrastructure */}
              <div className="map-layout expanded">{map}</div>

              {/* BTRC Full Categories & Datasets */}
              <BtrcTelecomViews
                activeTab={telcoSubTabId}
                onSelectTab={(id) => setTelcoSubTabId(id)}
                setNotice={setNotice}
              />

              {/* SLA Cross-Check Matrix & BGP Hurricane Electric Visual Analytics */}
              <SLACrossCheckView slaOperators={slaOperators} />
              <BGPHurricaneReportView bgpReports={bgpReports} />
            </div>
          )}

          {/* Page 2: Dedicated "Live Telemetry & Pipeline" Tab */}
          {page === 'Live Telemetry' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <section className="panel data-panel">
                <div className="section-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2>Real-Time Regional Telemetry Matrix (ICT Ministry Command)</h2>
                    <p className="metadata">Live streaming power shortage, load shedding, and 3G/4G/5G mobile tower metrics across all 8 divisions.</p>
                  </div>
                  <Tag tone="green">STREAMING LIVE</Tag>
                </div>
                <div className="table-responsive">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {['Division', 'Demand (MW)', 'Supply (MW)', 'Power Deficit (MW)', 'Load Shed (MW)', 'Grid Freq (Hz)', '4G/5G Site Uptime', 'Avg Latency (ms)', 'Incidents', 'Action'].map((h) => (
                          <TableHead key={h}>{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {divisionsData.map((d) => (
                        <TableRow key={d.division}>
                          <TableCell style={{ fontWeight: 600 }}>{d.division}</TableCell>
                          <TableCell>{d.demandMW.toLocaleString()}</TableCell>
                          <TableCell>{d.supplyMW.toLocaleString()}</TableCell>
                          <TableCell>
                            <Tag tone={d.shortageMW > 200 ? 'red' : d.shortageMW > 100 ? 'amber' : 'green'}>{d.shortageMW} MW</Tag>
                          </TableCell>
                          <TableCell>{d.loadSheddingMW} MW</TableCell>
                          <TableCell style={{ fontFamily: 'monospace' }}>{d.gridFrequency} Hz</TableCell>
                          <TableCell>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Progress value={d.networkUptime} style={{ width: '60px' }} />
                              <span>{d.networkUptime}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{d.avgLatencyMs} ms</TableCell>
                          <TableCell>{d.activeIncidents > 0 ? <Tag tone="red">{d.activeIncidents} Active</Tag> : <Tag tone="green">0</Tag>}</TableCell>
                          <TableCell>
                            <button
                              className="primary-button"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => {
                                setDivision(d.division);
                                go('National map');
                              }}
                            >
                              Focus Region
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </section>

              {/* Subsea & Core Backbone Fiber Status */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '20px' }}>
                {cablesData.map((cable) => (
                  <section className="panel data-panel" key={cable.name}>
                    <div className="section-top" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <h2>{cable.name} Subsea Cable</h2>
                        <p className="metadata">{cable.location}</p>
                      </div>
                      <Tag tone={cable.status === 'Optimal' ? 'green' : 'amber'}>{cable.status}</Tag>
                    </div>
                    <div style={{ margin: '15px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                        <span>Capacity Utilization</span>
                        <strong>
                          {cable.activeTrafficGbps} Gbps / {(cable.capacityTbps * 1000).toLocaleString()} Gbps ({cable.utilizationPct}%)
                        </strong>
                      </div>
                      <Progress value={cable.utilizationPct} />
                    </div>
                    <p className="metadata">Latency to International Core Hub: {cable.latencyMs} ms · Direct fiber connectivity active.</p>
                  </section>
                ))}
              </div>
            </div>
          )}

          {/* Overview & Analytics Telemetry View */}
          {['Overview', 'Analytics'].includes(page) && (
            <div className="bottom-grid">
              <section className="panel trend-panel">
                <div className="section-top">
                  <div>
                    <h2>{sector === 'Telecom' ? 'Subscription Trend' : 'Generation vs Power Demand Profile'}</h2>
                    <p className="metadata">{sector === 'Telecom' ? 'BTRC monthly report · Millions of subscriptions' : 'Real-time telemetry load profile (MW) and grid balance'}</p>
                  </div>
                  {sector !== 'Telecom' && (
                    <Tabs value={period} onValueChange={(v) => setPeriod(String(v))}>
                      <TabsList>{['24 hours', '7 days'].map((v) => <TabsTrigger key={v} value={v}>{v}</TabsTrigger>)}</TabsList>
                    </Tabs>
                  )}
                </div>
                <div className="chart-legend">
                  <span>
                    <i className="dot healthy" />
                    {sector === 'Telecom' ? 'Mobile Subscriptions' : 'Power Supply (MW)'}
                  </span>
                  {sector !== 'Telecom' && (
                    <span>
                      <i className="dot dot-0" />
                      Power Demand (MW)
                    </span>
                  )}
                  <Tag tone="green">{sector === 'Telecom' ? 'OFFICIAL REPORT' : 'STREAMING LIVE'}</Tag>
                </div>
                <div className="line-chart">
                  <div className="y-axis">{(sector === 'Telecom' ? ['190', '188', '186', '184'] : ['16k', '14k', '12k', '10k']).map((v) => <span key={v}>{v}</span>)}</div>
                  <svg viewBox="0 0 700 150" preserveAspectRatio="none" role="img" aria-label="Generation and demand profile">
                    <defs>
                      <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop stopColor="#43bd9e" stopOpacity=".25" />
                        <stop offset="1" stopColor="#43bd9e" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[10, 50, 90, 130].map((y) => (
                      <line key={y} x1="0" x2="700" y1={y} y2={y} stroke="var(--border)" strokeDasharray="3 5" />
                    ))}
                    {sector === 'Telecom' ? (
                      <polyline points="0,28 116,36 232,51 348,65 464,75 580,104 700,107" fill="none" stroke="#64c7af" strokeWidth="3" />
                    ) : (
                      <>
                        <path
                          d={
                            period === '24 hours'
                              ? 'M0 98Q35 104 70 87T140 94T210 55T280 66T350 31T420 55T490 25T560 43T630 15L700 31L700 150L0 150Z'
                              : 'M0 110L100 92L200 72L300 84L400 41L500 62L600 25L700 39L700 150L0 150Z'
                          }
                          fill="url(#chartFill)"
                        />
                        <path
                          d={
                            period === '24 hours'
                              ? 'M0 98Q35 104 70 87T140 94T210 55T280 66T350 31T420 55T490 25T560 43T630 15L700 31'
                              : 'M0 110L100 92L200 72L300 84L400 41L500 62L600 25L700 39'
                          }
                          fill="none"
                          stroke="#64c7af"
                          strokeWidth="2.5"
                        />
                        <path
                          d={
                            period === '24 hours'
                              ? 'M0 114Q35 119 70 104T140 112T210 71T280 90T350 55T420 70T490 45T560 60T630 32L700 42'
                              : 'M0 123L100 103L200 88L300 97L400 55L500 75L600 42L700 55'
                          }
                          fill="none"
                          stroke="#e0b86a"
                          strokeWidth="2"
                          strokeDasharray="5 5"
                        />
                      </>
                    )}
                  </svg>
                </div>
                <div className="x-axis">{(sector === 'Telecom' ? ['Jul 25', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan 26'] : period === '24 hours' ? ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:00'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']).map((t) => <span key={t}>{t}</span>)}</div>
              </section>

              {/* Telco Network 2G / 3G / 4G / 5G Operator Breakdown */}
              <section className="panel operator-panel">
                <div className="section-top">
                  <h2>Telco 3G/4G/5G Network Metrics</h2>
                  <button aria-label="Inspect BTRC data source" onClick={() => setSource('Mobile subscriptions')}>
                    <ArrowUpRight size={17} />
                  </button>
                </div>
                <p className="metadata">Operator Spectrum & Generation Migration (4G/5G Priority)</p>
                {operatorsData.map((op) => (
                  <div className="operator" key={op.operator}>
                    <div>
                      <span>
                        <i className="dot" style={{ background: op.color }} />
                        {op.operator}
                      </span>
                      <strong>
                        {op.subscribersM.toFixed(2)}
                        <small>M subs</small>
                      </strong>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px', fontSize: '10px', color: 'var(--muted-foreground)' }}>
                      <span>4G: {op.tech4G}%</span> · <span>5G: {op.tech5G}%</span> · <span>Latency: {op.avgLatencyMs}ms</span> · <span>Speed: {op.throughputMbps}Mbps</span>
                    </div>
                    <div className="bar-track">
                      <span style={{ width: `${(op.subscribersM / 185.8) * 100}%`, background: op.color }} />
                    </div>
                  </div>
                ))}
              </section>
            </div>
          )}

          {page === 'Incidents' && (
            <section className="panel data-panel">
              <div className="section-top">
                <div>
                  <h2>Response Priorities</h2>
                  <p className="metadata">Active infrastructure incident queue.</p>
                </div>
                <Picker value={severity} onChange={setSeverity} values={['All severity', 'Critical', 'Watch']} />
              </div>
              <div className="incident-grid">
                {alerts.map((a) => (
                  <article key={a.id} className="incident-card">
                    <div className="section-top">
                      <Tag tone={a.severity === 'Critical' ? 'red' : 'amber'}>{a.severity}</Tag>
                      <span className="metadata">{a.id}</span>
                    </div>
                    <h2>{a.title}</h2>
                    <p>
                      <MapPin size={15} />
                      {a.division} · {a.sector}
                    </p>
                    <dl>
                      <dt>Impact</dt>
                      <dd>{a.impact}</dd>
                      <dt>Cause</dt>
                      <dd>{a.cause}</dd>
                      <dt>Owner</dt>
                      <dd>{a.owner}</dd>
                      <dt>Next action</dt>
                      <dd>{a.action}</dd>
                      <dt>Estimated restoration</dt>
                      <dd>{a.eta}</dd>
                    </dl>
                    <Progress value={a.progress} />
                    <p className="metadata">{a.progress}% restoration complete</p>
                    <button
                      className="primary-button"
                      onClick={() => {
                        setAck([...ack, a.id]);
                        setNotice('Incident acknowledged');
                      }}
                      disabled={ack.includes(a.id)}
                    >
                      {ack.includes(a.id) ? <Check size={15} /> : <ShieldCheck size={15} />} {ack.includes(a.id) ? 'Acknowledged' : 'Acknowledge incident'}
                    </button>
                  </article>
                ))}
              </div>
              {!alerts.length && <div className="empty">No incidents match these filters.</div>}
            </section>
          )}

          {page === 'Regulation' && (
            <section className="panel data-panel">
              <div className="section-top">
                <h2>Regulatory Evidence & Governance</h2>
                <Tag tone="neutral">ACTIVE MONITORING</Tag>
              </div>
              <div className="reg-grid">
                {[
                  ['License Registry', 'Central registry for operating licenses, compliance conditions, and renewal schedules across operators.'],
                  ['Spectrum Utilization', 'Real-time frequency band allocation and spectral occupancy monitoring across mobile network operators.'],
                  ['Quality of Service', 'Continuous monitoring of regional latency, packet loss, call drop rates, and network throughput SLAs.'],
                  ['Consumer Complaints', 'Aggregated user feedback, outage reports, and resolution times for public consumer protection.'],
                ].map(([n, desc]) => (
                  <article className="incident-card" key={n}>
                    <ShieldCheck size={25} />
                    <h2>{n}</h2>
                    <Tag tone="green">Active</Tag>
                    <p>{desc}</p>
                    <a className="attention-link" href="https://btrc.gov.bd" target="_blank" rel="noreferrer">
                      Visit BTRC Portal <ArrowUpRight size={14} />
                    </a>
                  </article>
                ))}
              </div>
            </section>
          )}

          {page === 'Projects' && (
            <section className="panel data-panel">
              <div className="section-top">
                <div>
                  <h2>Infrastructure Project Portfolio</h2>
                  <p className="metadata">National grid and network expansion project tracker.</p>
                </div>
                <Tag tone="neutral">ACTIVE PROJECTS</Tag>
              </div>
              {[
                ['Grid resilience upgrade', 'Electricity', 'Dhaka', 68, 'On track'],
                ['Regional fiber redundancy', 'Telecom', 'Sylhet', 42, 'At risk'],
                ['Coastal backup connectivity', 'Telecom', 'Barishal', 81, 'On track'],
              ]
                .filter((x) => (division === 'All Bangladesh' || x[2] === division) && (sector === 'All sectors' || x[1] === sector))
                .map(([n, s, d, p, t]) => (
                  <div className="project-row" key={n}>
                    <Building2 />
                    <div>
                      <h3>{n}</h3>
                      <p className="metadata">
                        Infrastructure project · {s} · {d}
                      </p>
                    </div>
                    <Progress value={Number(p)} />
                    <strong>{p}%</strong>
                    <Tag tone={t === 'At risk' ? 'amber' : 'green'}>{t}</Tag>
                  </div>
                ))}
            </section>
          )}

          {page === 'Reports' && (
            <section className="panel data-panel">
              <h2>Export infrastructure dataset</h2>
              <p className="report-copy">Download the currently filtered asset registry, including infrastructure locations, owners, and operational statuses.</p>
              <button className="primary-button" onClick={exportData}>
                <ArrowDownToLine size={16} /> Download asset CSV
              </button>
              <div className="source-box">
                <strong>Report scope</strong>
                <p>
                  {division} · {sector} · {filtered.length} assets
                </p>
                <p>Reference periods: BPDB and BTRC official records.</p>
              </div>
            </section>
          )}

          {page === 'Data catalog' && (
            <section className="panel data-panel">
              <h2>Data catalog & sources</h2>
              <p className="metadata">National infrastructure dataset registry and sources.</p>
              <div className="table-responsive">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {['Dataset', 'Reference Period', 'Coverage / Definition', 'Status', 'Source'].map((h) => (
                        <TableHead key={h}>{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ['Grid-installed capacity', 'Nov 2025', '28,949 MW grid-installed capacity', 'Official snapshot', sourcePower],
                      ['Mobile subscriptions', 'Jan 2026', '185.80 million active subscriptions', 'Official snapshot', sourceBtrc],
                      ['Administrative boundaries', 'Sep 2026', 'geoBoundaries cartographic representation', 'Public geodata', 'https://github.com/ifahimreza/bangladesh-geojson'],
                      ['Assets & Facilities', 'Current', 'Infrastructure node positions & connectivity', 'Verified', ''],
                      ['Incidents & Operations', 'Real-time', 'Operational alerts and load status', 'Active', ''],
                    ].map(([n, d, c, s, u]) => (
                      <TableRow key={n}>
                        <TableCell>{n}</TableCell>
                        <TableCell>{d}</TableCell>
                        <TableCell>{c}</TableCell>
                        <TableCell>
                          <Tag tone="neutral">{s}</Tag>
                        </TableCell>
                        <TableCell>{u ? <a href={u} target="_blank" rel="noreferrer">Open ↗</a> : 'Internal'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          )}

          {page === 'SLA Cross-Check' && (
            <SLACrossCheckView slaOperators={slaOperators} />
          )}

          {page === 'IIG BGP Peering' && (
            <BGPHurricaneReportView bgpReports={bgpReports} />
          )}

          <footer className="page-footer">
            <span>
              <span className="dot healthy" /> Central Eye · National Infrastructure Intelligence
            </span>
            <button onClick={() => go('Data catalog')}>
              Source transparency <ArrowUpRight size={13} />
            </button>
            <span>National Infrastructure Command Center</span>
          </footer>
        </div>
      </main>

      <Sheet open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <SheetContent className="detail-sheet">
          <SheetHeader>
            <span className="eyebrow">ASSET INTELLIGENCE</span>
            <SheetTitle>{selected?.name}</SheetTitle>
            <SheetDescription>
              {selected?.division} · {selected?.kind}
            </SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="detail-body">
              <Tag tone={selected.status === 'Critical' ? 'red' : selected.status === 'Watch' ? 'amber' : 'green'}>{selected.status} status</Tag>
              <dl>
                <dt>Asset ID</dt>
                <dd>{selected.id}</dd>
                <dt>Organization</dt>
                <dd>{selected.owner}</dd>
                <dt>Sector</dt>
                <dd>{selected.sector}</dd>
                <dt>Capacity</dt>
                <dd>{selected.capacity}</dd>
                <dt>Location</dt>
                <dd>
                  {selected.lat.toFixed(2)}° N, {selected.lon.toFixed(2)}° E
                </dd>
              </dl>
              {incidents
                .filter((i) => i.asset === selected.id)
                .map((i) => (
                  <div key={i.id} className="source-box">
                    <span className="eyebrow">INCIDENT ALERT · {i.id}</span>
                    <h3>{i.title}</h3>
                    <p>
                      {i.cause}. Potential impact: {i.impact}.
                    </p>
                    <strong>Recommended action</strong>
                    <p>{i.action}.</p>
                    <p>Owner: {i.owner}</p>
                    <p>ETA: {i.eta}</p>
                    <button
                      className="primary-button"
                      onClick={() => {
                        setAck([...ack, i.id]);
                        setNotice('Incident acknowledged');
                      }}
                      disabled={ack.includes(i.id)}
                    >
                      {ack.includes(i.id) ? 'Acknowledged' : 'Acknowledge incident'}
                    </button>
                  </div>
                ))}
              <div className="source-box">
                <strong>Infrastructure Overview</strong>
                <p>Key national infrastructure facility. Map coordinates indicate operational location area. Connected lines illustrate network routing relationships.</p>
                <button
                  className="attention-link"
                  onClick={() => {
                    setSelected(null);
                    go('Data catalog');
                  }}
                >
                  Inspect data catalog <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={!!source} onOpenChange={(o) => { if (!o) setSource(null); }}>
        <DialogContent className="source-dialog">
          <DialogHeader>
            <DialogTitle>{source}</DialogTitle>
            <DialogDescription>Evidence, definition, and reporting context</DialogDescription>
          </DialogHeader>
          {source === 'Grid-installed capacity' ? (
            <>
              <div className="big-number">
                28,949 <span>MW</span>
              </div>
              <p>Grid-installed capacity reported by BPDB for November 2025. This is nameplate capacity, not available generation.</p>
              <p>Frequency: periodic publication · Coverage: Bangladesh · Confidence: official published snapshot.</p>
              <a href={sourcePower} target="_blank" rel="noreferrer">
                Open official BPDB reference ↗
              </a>
            </>
          ) : source === 'Mobile subscriptions' ? (
            <>
              <div className="big-number">
                185.80 <span>million</span>
              </div>
              <p>BTRC, January 2026. Active mobile network subscriptions total.</p>
              <p>Frequency: monthly · Coverage: Bangladesh · Confidence: official published snapshot.</p>
              <a href={sourceBtrc} target="_blank" rel="noreferrer">
                Open official BTRC reference ↗
              </a>
            </>
          ) : (
            <>
              <p>Central Eye is Bangladesh’s unified national infrastructure intelligence platform, providing monitoring, spatial analytics, and incident management across power and telecommunications networks.</p>
              <p>Use map markers, layer controls, regional filters, incident management, and data exports to monitor national infrastructure systems.</p>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="search-dialog">
          <DialogHeader>
            <DialogTitle>Search infrastructure</DialogTitle>
            <DialogDescription>Find infrastructure assets, facilities, divisions, and workspace pages.</DialogDescription>
          </DialogHeader>
          <div className="search-input">
            <Search size={18} />
            <input autoFocus placeholder="Try Payra, Sylhet, or incidents…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="search-results">
            {assets
              .filter((a) => (a.name + ' ' + a.division + ' ' + a.sector).toLowerCase().includes(query.toLowerCase()))
              .map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    setSearchOpen(false);
                    setSelected(a);
                  }}
                >
                  <MapPin size={16} />
                  <span>
                    {a.name}
                    <small>
                      {a.division} · {a.kind}
                    </small>
                  </span>
                  <ArrowUpRight size={14} />
                </button>
              ))}
            {nav
              .filter(([n]) => n.toLowerCase().includes(query.toLowerCase()))
              .map(([n, Icon]) => (
                <button
                  key={n}
                  onClick={() => {
                    setSearchOpen(false);
                    go(n);
                  }}
                >
                  <Icon size={16} />
                  <span>
                    {n}
                    <small>Workspace page</small>
                  </span>
                  <ChevronRight size={14} />
                </button>
              ))}
            {!assets.some((a) => (a.name + ' ' + a.division + ' ' + a.sector).toLowerCase().includes(query.toLowerCase())) && !nav.some(([n]) => n.toLowerCase().includes(query.toLowerCase())) && <p className="empty">No results. Try a division or asset name.</p>}
          </div>
        </DialogContent>
      </Dialog>
      {notice && (
        <div role="status" className="toast">
          <Check size={16} />
          {notice}
        </div>
      )}
    </SidebarProvider>
  );
}

function AssetTable({ data, onSelect }: { data: Asset[]; onSelect: (a: Asset) => void }) {
  return (
    <div className="table-responsive">
      <Table>
        <TableHeader>
          <TableRow>
            {['Asset', 'Sector', 'Division', 'Owner', 'Status', ''].map((h, i) => (
              <TableHead key={i}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((a) => (
            <TableRow key={a.id}>
              <TableCell>
                <button className="table-link" onClick={() => onSelect(a)}>
                  {a.name}
                </button>
              </TableCell>
              <TableCell>{a.sector}</TableCell>
              <TableCell>{a.division}</TableCell>
              <TableCell>{a.owner}</TableCell>
              <TableCell>
                <Tag tone={a.status === 'Critical' ? 'red' : a.status === 'Watch' ? 'amber' : 'green'}>{a.status}</Tag>
              </TableCell>
              <TableCell>
                <button aria-label={'Inspect ' + a.name} onClick={() => onSelect(a)}>
                  <ArrowUpRight size={16} />
                </button>
              </TableCell>
            </TableRow>
          ))}
          {!data.length && (
            <TableRow>
              <TableCell colSpan={6}>No assets match this view. Enable a map layer or adjust your filters.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
