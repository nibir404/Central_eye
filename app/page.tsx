'use client';
import { useState, useEffect, useRef } from 'react';
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

const sourceBtrc = 'https://btrc.portal.gov.bd/pages/static-pages/6922dda8933eb65569e15c3d';
const sourcePower = 'https://bpdb.portal.gov.bd/pages/static-pages/6922e134933eb65569e2ad95';
const divisions = ['All Bangladesh', 'Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];

type Asset = { id: string; name: string; sector: string; kind: string; division: string; lat: number; lon: number; owner: string; capacity: string; status: string };

const assets: Asset[] = [
  { id: 'P-01', name: 'Payra Power Plant', sector: 'Electricity', kind: 'Power plant', division: 'Barishal', lat: 21.99, lon: 90.28, owner: 'BCPCL', capacity: '1,320 MW', status: 'Normal' },
  { id: 'P-02', name: 'Kaptai Hydropower Plant', sector: 'Electricity', kind: 'Power plant', division: 'Chattogram', lat: 22.49, lon: 92.22, owner: 'BPDB', capacity: '230 MW', status: 'Normal' },
  { id: 'P-03', name: 'Ghorashal Power Station', sector: 'Electricity', kind: 'Power plant', division: 'Dhaka', lat: 23.98, lon: 90.64, owner: 'BPDB', capacity: 'Multi-unit station', status: 'Watch' },
  { id: 'P-04', name: 'Bheramara Grid Hub', sector: 'Electricity', kind: 'Grid hub', division: 'Khulna', lat: 24.03, lon: 88.99, owner: 'Power Grid Bangladesh', capacity: 'Interconnection', status: 'Normal' },
  { id: 'P-05', name: 'Ashuganj Power Station', sector: 'Electricity', kind: 'Power plant', division: 'Chattogram', lat: 24.04, lon: 91.01, owner: 'APSCL', capacity: 'Multi-unit station', status: 'Normal' },
  { id: 'T-01', name: 'BTRC Headquarters', sector: 'Telecom', kind: 'Regulatory office', division: 'Dhaka', lat: 23.78, lon: 90.42, owner: 'BTRC', capacity: 'Regulatory authority', status: 'Normal' },
  { id: 'T-02', name: 'Kuakata Cable Landing Station', sector: 'Telecom', kind: 'Cable landing', division: 'Barishal', lat: 21.84, lon: 90.12, owner: 'BSCPLC', capacity: 'SEA-ME-WE 5', status: 'Normal' },
  { id: 'T-03', name: 'Cox’s Bazar Cable Landing', sector: 'Telecom', kind: 'Cable landing', division: 'Chattogram', lat: 21.43, lon: 91.98, owner: 'BSCPLC', capacity: 'SEA-ME-WE 4', status: 'Watch' },
  { id: 'D-01', name: 'Sylhet Network Hub', sector: 'Telecom', kind: 'Network hub', division: 'Sylhet', lat: 24.89, lon: 91.87, owner: 'Sylhet Telecom', capacity: 'Primary Fiber Node', status: 'Critical' },
  { id: 'D-02', name: 'Rangpur Grid Hub', sector: 'Electricity', kind: 'Grid hub', division: 'Rangpur', lat: 25.74, lon: 89.27, owner: 'NESCO', capacity: 'Substation 132/33kV', status: 'Normal' },
  { id: 'D-03', name: 'Rajshahi Network Hub', sector: 'Telecom', kind: 'Network hub', division: 'Rajshahi', lat: 24.37, lon: 88.60, owner: 'BTCL', capacity: 'Regional Switching Center', status: 'Normal' },
  { id: 'D-04', name: 'Mymensingh Grid Hub', sector: 'Electricity', kind: 'Grid hub', division: 'Mymensingh', lat: 24.75, lon: 90.40, owner: 'PDB', capacity: 'Substation 132/33kV', status: 'Normal' },
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
  const [telcoSubTab, setTelcoSubTab] = useState<'Overview & Market Share' | 'QoS & Performance' | 'Infrastructure & BTS' | 'District Ranking & Outages'>('Overview & Market Share');
  const [districtSearch, setDistrictSearch] = useState('');

  // Pipeline state
  const [isStreaming, setIsStreaming] = useState(true);
  const [scenario, setScenario] = useState<PipelineScenario>('normal');
  const [speed, setSpeed] = useState<number>(1);
  const [divisionsData, setDivisionsData] = useState<DivisionTelemetry[]>(INITIAL_DIVISIONS);
  const [operatorsData, setOperatorsData] = useState<OperatorTelemetry[]>(INITIAL_OPERATORS);
  const [cablesData, setCablesData] = useState<SubseaCableStatus[]>(INITIAL_CABLES);
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
      if (next.event) {
        setEventsLog((prev) => [next.event!, ...prev.slice(0, 19)]);
      }
    }, 2500 / speed);
    return () => clearInterval(interval);
  }, [isStreaming, scenario, speed, divisionsData, operatorsData, cablesData]);

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
      ).catch(() => {});
    } catch {}
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
                filtered.slice(1).map((a) => {
                  const from = xy(filtered[0]),
                    to = xy(a);
                  return <path key={a.id} d={`M${from.x} ${from.y}Q${(from.x + to.x) / 2 + 40} ${(from.y + to.y) / 2 - 50} ${to.x} ${to.y}`} className={'connection ' + (a.sector === 'Telecom' ? 'fiber' : '')} />;
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
              <Layers size={23} />
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
                <SidebarMenuItem key={name}>
                  <SidebarMenuButton isActive={page === name} onClick={() => go(name)}>
                    <Icon />
                    <span>{name}</span>
                    {name === 'Incidents' && <b className="nav-count">3</b>}
                    {name === 'Live Telemetry' && <span className="tiny" style={{ background: 'var(--primary)', color: '#fff', border: 'none' }}>STREAM</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
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
            <Activity size={13} style={{ color: 'var(--primary)', flexNone: true }} />
            <span style={{ color: 'var(--muted-foreground)', flexNone: true }}>Latest Event:</span>
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
                  if (v === 'Operations') go('Incidents');
                  if (v === 'Regulatory') go('Regulation');
                  if (v === 'Analyst') go('Analytics');
                }}
                values={['Executive', 'Operations', 'Regulatory', 'Analyst']}
              />
              <button className="primary-button" onClick={exportData}>
                <ArrowDownToLine size={16} /> Export Data
              </button>
            </div>
          </div>

          <div className="filterbar">
            <div>
              <Picker value={division} onChange={setDivision} values={divisions} />
              <Picker value={sector} onChange={setSector} values={['All sectors', 'Electricity', 'Telecom']} />
              <button
                className={'quiet-button ' + (saved ? 'saved' : '')}
                onClick={() => {
                  if (saved) {
                    const s = JSON.parse(localStorage.getItem('central-eye-view') || '{}');
                    setDivision(s.division || 'All Bangladesh');
                    setSector(s.sector || 'All sectors');
                    setNotice('Saved view restored');
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
                      label: 'Total Mobile Subscribers',
                      value: '185.80',
                      unit: 'Million',
                      icon: Users,
                      sub: '131.25M Internet Subs (75.4% Penetration)',
                      detail: 'Mobile Broadband Penetration: 68.2%',
                      color: '#65c7ab',
                      id: 'Mobile subscriptions',
                    },
                    {
                      label: 'Avg Speed & Latency',
                      value: `${avgDownloadSpeed}`,
                      unit: 'Mbps',
                      icon: Signal,
                      sub: `Latency: ${avgLatency} ms · Call Drop Rate: 0.38%`,
                      detail: `Download: ${avgDownloadSpeed} Mbps · Upload: 14.2 Mbps`,
                      color: '#70b8f4',
                      id: 'Mobile subscriptions',
                    },
                    {
                      label: 'National Data Consumption',
                      value: '4,280',
                      unit: 'PB/mo',
                      icon: Activity,
                      sub: '14.2 GB / user / month average',
                      detail: 'Subsea Traffic: 4.10 Tbps active stream',
                      color: '#6ccaff',
                      id: 'Subsea Cable Bandwidth',
                    },
                    {
                      label: 'Total BTS Sites & Fiber',
                      value: '48,620',
                      unit: 'BTS',
                      icon: Server,
                      sub: '42.5% Fiberized Towers · 162.4k km Fiber',
                      detail: `4G Coverage: 98.4% · 5G Coverage: 14.8%`,
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
                      label: '4G / 5G Mobile Site Uptime',
                      value: `${avgUptime}%`,
                      unit: 'online',
                      icon: Wifi,
                      sub: `${activeTowers.toLocaleString()} of ${totalTowers.toLocaleString()} sites live`,
                      detail: `${(totalTowers - activeTowers).toLocaleString()} sites down or on backup battery`,
                      color: '#65c7ab',
                      id: 'Mobile subscriptions',
                    },
                    {
                      label: 'Subsea Cable Bandwidth',
                      value: (totalTrafficGbps / 1000).toFixed(2),
                      unit: 'Tbps',
                      icon: Server,
                      sub: 'SEA-ME-WE 4 & SEA-ME-WE 5 Landing Stations',
                      detail: `Average latency: ${cablesData[0].latencyMs} ms to international hubs`,
                      color: '#70b8f4',
                      id: 'Subsea Cable Bandwidth',
                    },
                  ].map((m, i) => (
                    <button className="metric panel" key={m.label} onClick={() => (i === 1 ? go('Live Telemetry') : i === 2 ? go('Telecom') : setSource(m.id))}>
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
                        {i > 1 && <Spark color={m.color} />}
                      </div>
                    </button>
                  ))}
            </div>
          )}

          {/* Overview & National Map View */}
          {['Overview', 'National map'].includes(page) && (
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
                    ['Telco 3G/4G/5G Network', avgUptime < 97 ? 'Attention' : 'Normal', `Site Uptime: ${avgUptime}% · ${activeTowers.toLocaleString()} towers live`],
                    ['Subsea Fiber Landing', 'Optimal', `Traffic: ${(totalTrafficGbps / 1000).toFixed(2)} Tbps (SEA-ME-WE 4/5)`],
                  ].map(([n, s, d], i) => (
                    <div className="health-row" key={n}>
                      <div className={'health-icon health-' + i}>{i === 0 ? <Zap size={18} /> : i === 1 ? <Radio size={18} /> : <ShieldCheck size={18} />}</div>
                      <div>
                        <strong>{n}</strong>
                        <small>{d}</small>
                      </div>
                      <Tag tone={i === 0 ? 'red' : i === 1 ? (avgUptime < 97 ? 'amber' : 'green') : 'green'}>{s}</Tag>
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
          )}

          {/* DEDICATED TELECOM COMMAND PAGE WITH SUB-MENUS & ALL 20 METRICS + DIAGRAMS */}
          {page === 'Telecom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Telecom Sub-Navigation Bar */}
              <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', flexWrap: 'wrap' }}>
                {[
                  ['Overview & Market Share', PieChart],
                  ['QoS & Performance', BarChart3],
                  ['Infrastructure & BTS', Server],
                  ['District Ranking & Outages', Award],
                ].map(([tabName, Icon]) => (
                  <button
                    key={tabName as string}
                    onClick={() => setTelcoSubTab(tabName as any)}
                    className="quiet-button"
                    style={{
                      background: telcoSubTab === tabName ? 'var(--primary)' : 'var(--subtle)',
                      color: telcoSubTab === tabName ? '#fff' : 'var(--muted-foreground)',
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

              {/* Sub-Tab 1: Overview & Market Share */}
              {telcoSubTab === 'Overview & Market Share' && (
                <>
                  <div className="map-layout expanded">{map}</div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '20px' }}>
                    {/* Market-Share Donut / Bar Visualization */}
                    <section className="panel data-panel">
                      <div className="section-top">
                        <h2>Mobile Operator Market Share & Subscriber Totals</h2>
                        <Tag tone="green">BTRC 2026</Tag>
                      </div>
                      <p className="metadata">Total Mobile Subscribers: 185.80 Million</p>
                      {operatorsData.map((op) => {
                        const pct = ((op.subscribersM / 185.8) * 100).toFixed(1);
                        return (
                          <div key={op.operator} style={{ marginTop: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="dot" style={{ background: op.color, width: '10px', height: '10px' }} />
                                {op.operator}
                              </span>
                              <span>
                                {op.subscribersM.toFixed(2)}M ({pct}%)
                              </span>
                            </div>
                            <Progress value={Number(pct)} style={{ height: '8px', marginTop: '6px' }} />
                          </div>
                        );
                      })}
                    </section>

                    {/* Coverage-vs-Adoption Funnel Diagram */}
                    <section className="panel data-panel">
                      <div className="section-top">
                        <h2>Coverage vs. Adoption Funnel</h2>
                        <Tag tone="neutral">NATIONAL DIGITIZATION</Tag>
                      </div>
                      <p className="metadata">Population coverage down to 4G/5G power users.</p>
                      {[
                        ['1. Total Population', '173.0M', 100, '#62baf4'],
                        ['2. 4G Population Covered', '170.2M', 98.4, '#56c4ac'],
                        ['3. Total Mobile Subscribers', '185.8M', 92.1, '#ac9af2'],
                        ['4. Internet Subscribers', '131.2M', 75.4, '#ecb663'],
                        ['5. Active 4G/5G Data Users', '89.4M', 51.7, '#67caae'],
                      ].map(([label, val, pct, color]) => (
                        <div key={label as string} style={{ marginTop: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                            <span>{label as string}</span>
                            <strong>{val as string}</strong>
                          </div>
                          <div className="bar-track" style={{ height: '7px', marginTop: '5px' }}>
                            <span style={{ width: `${pct}%`, background: color as string }} />
                          </div>
                        </div>
                      ))}
                    </section>
                  </div>

                  {/* Digital Divide & Subscriber Trend */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
                    <section className="panel trend-panel">
                      <div className="section-top">
                        <div>
                          <h2>Mobile & Fixed Broadband Subscriber Growth</h2>
                          <p className="metadata">Monthly subscriptions trend (Millions)</p>
                        </div>
                      </div>
                      <div className="chart-legend">
                        <span>
                          <i className="dot healthy" />
                          Mobile Subscriptions (185.80M)
                        </span>
                        <span>
                          <i className="dot dot-0" />
                          Fixed ISP Broadband (12.45M)
                        </span>
                      </div>
                      <div className="line-chart">
                        <div className="y-axis">
                          {['190M', '150M', '100M', '50M'].map((v) => (
                            <span key={v}>{v}</span>
                          ))}
                        </div>
                        <svg viewBox="0 0 700 150" preserveAspectRatio="none" role="img" aria-label="Subscriber trends">
                          <polyline points="0,28 116,36 232,51 348,65 464,75 580,104 700,107" fill="none" stroke="#64c7af" strokeWidth="3" />
                          <polyline points="0,135 116,130 232,125 348,120 464,118 580,114 700,110" fill="none" stroke="#e0b86a" strokeWidth="2" strokeDasharray="4 4" />
                        </svg>
                      </div>
                      <div className="x-axis">
                        {['Jul 25', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan 26'].map((t) => (
                          <span key={t}>{t}</span>
                        ))}
                      </div>
                    </section>

                    <section className="panel data-panel">
                      <div className="section-top">
                        <h2>National Digital Divide Index</h2>
                        <Award size={18} style={{ color: 'var(--primary)' }} />
                      </div>
                      <div style={{ textAlign: 'center', margin: '20px 0' }}>
                        <div style={{ fontSize: '42px', fontWeight: 700, color: 'var(--primary)' }}>78.4 <span style={{ fontSize: '16px' }}>/ 100</span></div>
                        <p className="metadata">National Connectivity Index Score</p>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ background: 'var(--subtle)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>Urban Score</span>
                          <div style={{ fontSize: '20px', fontWeight: 600, color: '#56c4ac' }}>88.2</div>
                        </div>
                        <div style={{ background: 'var(--subtle)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>Rural Score</span>
                          <div style={{ fontSize: '20px', fontWeight: 600, color: '#e6b561' }}>68.6</div>
                        </div>
                      </div>
                    </section>
                  </div>
                </>
              )}

              {/* Sub-Tab 2: QoS & Performance */}
              {telcoSubTab === 'QoS & Performance' && (
                <>
                  {/* QoS Scorecards */}
                  <div className="metrics">
                    {[
                      { label: 'Avg Download Speed', value: `${avgDownloadSpeed}`, unit: 'Mbps', icon: Signal, color: '#56c4ac', detail: 'Target > 20 Mbps (BTRC SLA)' },
                      { label: 'Avg Network Latency', value: `${avgLatency}`, unit: 'ms', icon: Activity, color: '#70b8f4', detail: 'Target < 35 ms' },
                      { label: 'Call Drop Rate', value: '0.38%', unit: 'drops', icon: PhoneCall, color: '#e6b561', detail: 'BTRC Benchmark < 1.0%' },
                      { label: 'Consumer Complaint SLA', value: '94.6%', unit: 'resolved', icon: ShieldCheck, color: '#65c7ab', detail: '14,280 monthly grievances' },
                    ].map((card) => (
                      <div className="metric panel" key={card.label}>
                        <div className="metric-label">
                          <span>{card.label}</span>
                          <card.icon size={17} style={{ color: card.color }} />
                        </div>
                        <div className="metric-value">
                          {card.value} <span>{card.unit}</span>
                        </div>
                        <div className="metric-detail" style={{ color: card.color }}>
                          • {card.detail}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Operator Comparison Bars */}
                  <section className="panel data-panel">
                    <div className="section-top">
                      <h2>Operator QoS Benchmark Comparison</h2>
                      <Tag tone="green">BTRC AUDIT</Tag>
                    </div>
                    <div className="table-responsive">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {['Operator', 'DL Speed', 'UL Speed', 'Latency', 'Call Drop Rate', 'Packet Loss', 'BTRC Rating'].map((h) => (
                              <TableHead key={h}>{h}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {operatorsData.map((op) => (
                            <TableRow key={op.operator}>
                              <TableCell style={{ fontWeight: 600 }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                  <i className="dot" style={{ background: op.color }} />
                                  {op.operator}
                                </span>
                              </TableCell>
                              <TableCell style={{ fontWeight: 600 }}>{op.throughputMbps} Mbps</TableCell>
                              <TableCell>{op.uploadMbps} Mbps</TableCell>
                              <TableCell style={{ fontFamily: 'monospace' }}>{op.avgLatencyMs} ms</TableCell>
                              <TableCell>
                                <Tag tone={op.callDropRate < 0.4 ? 'green' : 'amber'}>{op.callDropRate}%</Tag>
                              </TableCell>
                              <TableCell>{op.packetLossPct}%</TableCell>
                              <TableCell>
                                <Tag tone="green">Grade A</Tag>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </section>

                  {/* Spectrum-Band Allocation Chart */}
                  <section className="panel data-panel">
                    <div className="section-top">
                      <h2>Spectrum-Band MHz Allocation & Utilization</h2>
                      <Tag tone="neutral">SPECTRUM REGISTRY</Tag>
                    </div>
                    <p className="metadata">Active MHz bandwidth allocated per operator across sub-1GHz, mid-band, and 5G NR prime frequencies.</p>
                    <div className="table-responsive">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {['Spectrum Band', 'Frequency Class', 'Grameenphone (MHz)', 'Robi Axiata (MHz)', 'Banglalink (MHz)', 'Teletalk (MHz)', 'Total Bandwidth'].map((h) => (
                              <TableHead key={h}>{h}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {SPECTRUM_BANDS.map((sb) => (
                            <TableRow key={sb.band}>
                              <TableCell style={{ fontWeight: 600 }}>{sb.band}</TableCell>
                              <TableCell>{sb.frequency}</TableCell>
                              <TableCell>{sb.gpMHz} MHz</TableCell>
                              <TableCell>{sb.robiMHz} MHz</TableCell>
                              <TableCell>{sb.blMHz} MHz</TableCell>
                              <TableCell>{sb.teletalkMHz} MHz</TableCell>
                              <TableCell style={{ fontWeight: 600, color: 'var(--primary)' }}>{sb.totalMHz} MHz</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </section>
                </>
              )}

              {/* Sub-Tab 3: Infrastructure & BTS */}
              {telcoSubTab === 'Infrastructure & BTS' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '20px' }}>
                    <div className="metric panel">
                      <div className="metric-label"><span>Total BTS Towers</span><Server size={17} style={{ color: '#56c4ac' }} /></div>
                      <div className="metric-value">48,620 <span>sites</span></div>
                      <div className="metric-detail" style={{ color: '#56c4ac' }}>• 42.5% Fiberized Towers</div>
                    </div>
                    <div className="metric panel">
                      <div className="metric-label"><span>NTTN Fiber Deployed</span><Activity size={17} style={{ color: '#70b8f4' }} /></div>
                      <div className="metric-value">162,400 <span>km</span></div>
                      <div className="metric-detail" style={{ color: '#70b8f4' }}>• Nationwide Transmission</div>
                    </div>
                    <div className="metric panel">
                      <div className="metric-label"><span>Subsea Landing Stations</span><Globe2 size={17} style={{ color: '#e6b561' }} /></div>
                      <div className="metric-value">5.4 <span>Tbps</span></div>
                      <div className="metric-detail" style={{ color: '#e6b561' }}>• SEA-ME-WE 4 & SEA-ME-WE 5</div>
                    </div>
                  </div>

                  {/* Subsea Cable & Backbone Fiber Topology */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '20px' }}>
                    {cablesData.map((cable) => (
                      <section className="panel data-panel" key={cable.name}>
                        <div className="section-top" style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <h2>{cable.name} Subsea Cable Station</h2>
                            <p className="metadata">{cable.location}</p>
                          </div>
                          <Tag tone={cable.status === 'Optimal' ? 'green' : 'amber'}>{cable.status}</Tag>
                        </div>
                        <div style={{ margin: '15px 0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                            <span>International Bandwidth Stream</span>
                            <strong>
                              {cable.activeTrafficGbps} Gbps / {(cable.capacityTbps * 1000).toLocaleString()} Gbps ({cable.utilizationPct}%)
                            </strong>
                          </div>
                          <Progress value={cable.utilizationPct} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted-foreground)', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                          <span>Latency to Core Hub: {cable.latencyMs} ms</span>
                          <span>Link Status: {cable.status}</span>
                        </div>
                      </section>
                    ))}
                  </div>

                  {/* Operator BTS Towers Breakdown */}
                  <section className="panel data-panel">
                    <div className="section-top">
                      <h2>Operator Tower / BTS Sites Breakdown</h2>
                      <Tag tone="green">INFRASTRUCTURE AUDIT</Tag>
                    </div>
                    <div className="table-responsive">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {['Operator', 'Total BTS Sites', '4G BTS Count', '5G Nodes Count', 'Fiberized Sites %', 'Site Uptime'].map((h) => (
                              <TableHead key={h}>{h}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {operatorsData.map((op) => (
                            <TableRow key={op.operator}>
                              <TableCell style={{ fontWeight: 600 }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                  <i className="dot" style={{ background: op.color }} />
                                  {op.operator}
                                </span>
                              </TableCell>
                              <TableCell style={{ fontWeight: 600 }}>{op.btsSites.toLocaleString()} sites</TableCell>
                              <TableCell>{Math.round(op.btsSites * 0.82).toLocaleString()}</TableCell>
                              <TableCell>{Math.round(op.btsSites * 0.08).toLocaleString()}</TableCell>
                              <TableCell>{(op.tech4G * 0.6).toFixed(1)}%</TableCell>
                              <TableCell>
                                <Progress value={op.siteUptimePct} style={{ width: '60px', display: 'inline-block', marginRight: '8px' }} />
                                <span>{op.siteUptimePct}%</span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </section>
                </>
              )}

              {/* Sub-Tab 4: District Ranking & Outages */}
              {telcoSubTab === 'District Ranking & Outages' && (
                <>
                  {/* Best / Worst Performing Districts */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '20px' }}>
                    <section className="panel data-panel" style={{ borderTop: '3px solid #56c4ac' }}>
                      <div className="section-top">
                        <h2>Top 5 Best Performing Districts</h2>
                        <Tag tone="green">TOP CONNECTIVITY</Tag>
                      </div>
                      {DISTRICT_RANKINGS.slice(0, 5).map((d) => (
                        <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                          <div>
                            <strong>#{d.rank} {d.name}</strong> <small style={{ color: 'var(--muted-foreground)' }}>({d.division})</small>
                            <p style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>Speed: {d.speedMbps} Mbps · Latency: {d.latencyMs}ms</p>
                          </div>
                          <Tag tone="green">{d.connectivityIndex} Index</Tag>
                        </div>
                      ))}
                    </section>

                    <section className="panel data-panel" style={{ borderTop: '3px solid #ed9786' }}>
                      <div className="section-top">
                        <h2>Top 5 Underserved / Lowest Performing</h2>
                        <Tag tone="red">DIGITAL DIVIDE FOCUS</Tag>
                      </div>
                      {DISTRICT_RANKINGS.slice(-5).reverse().map((d) => (
                        <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                          <div>
                            <strong>#{d.rank} {d.name}</strong> <small style={{ color: 'var(--muted-foreground)' }}>({d.division})</small>
                            <p style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>Speed: {d.speedMbps} Mbps · Latency: {d.latencyMs}ms</p>
                          </div>
                          <Tag tone="amber">{d.connectivityIndex} Index</Tag>
                        </div>
                      ))}
                    </section>
                  </div>

                  {/* District-Wise Connectivity Table */}
                  <section className="panel data-panel">
                    <div className="section-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
                      <div>
                        <h2>64-District Telecom Connectivity Matrix</h2>
                        <p className="metadata">District ranking, index score, speed, call drop rate, and 4G coverage.</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--subtle)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '6px' }}>
                        <Search size={14} />
                        <input
                          placeholder="Filter district..."
                          value={districtSearch}
                          onChange={(e) => setDistrictSearch(e.target.value)}
                          style={{ background: 'none', border: 'none', outline: 'none', fontSize: '12px', color: 'var(--foreground)' }}
                        />
                      </div>
                    </div>
                    <div className="table-responsive">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {['Rank', 'District', 'Division', 'Index Score', 'Avg Speed (Mbps)', 'Latency (ms)', 'Call Drop Rate', '4G Coverage', 'BTS Count', 'Status'].map((h) => (
                              <TableHead key={h}>{h}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {DISTRICT_RANKINGS.filter((d) => (d.name + ' ' + d.division).toLowerCase().includes(districtSearch.toLowerCase())).map((d) => (
                            <TableRow key={d.name}>
                              <TableCell style={{ fontWeight: 700 }}>#{d.rank}</TableCell>
                              <TableCell style={{ fontWeight: 600 }}>{d.name}</TableCell>
                              <TableCell>{d.division}</TableCell>
                              <TableCell style={{ fontWeight: 600, color: 'var(--primary)' }}>{d.connectivityIndex}</TableCell>
                              <TableCell>{d.speedMbps} Mbps</TableCell>
                              <TableCell style={{ fontFamily: 'monospace' }}>{d.latencyMs} ms</TableCell>
                              <TableCell>{d.callDropRate}%</TableCell>
                              <TableCell>{d.coverage4G}%</TableCell>
                              <TableCell>{d.btsSites.toLocaleString()}</TableCell>
                              <TableCell>
                                <Tag tone={d.status === 'Top Tier' ? 'green' : d.status === 'Moderate' ? 'amber' : 'red'}>{d.status}</Tag>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </section>
                </>
              )}
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

          {/* Electricity & Load Shedding View */}
          {['Overview', 'Electricity', 'Analytics'].includes(page) && (
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
