'use client';

import React, { useState, useMemo } from 'react';
import { IIGBGPReport } from '@/lib/license-bgp-data';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  Network,
  Globe2,
  Zap,
  ArrowRightLeft,
  ExternalLink,
  ShieldCheck,
  Activity,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Server,
  PieChart as PieIcon,
  BarChart3,
  Cpu,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type Props = {
  bgpReports: IIGBGPReport[];
};

export default function BGPHurricaneReportView({ bgpReports }: Props) {
  const [selectedAsn, setSelectedAsn] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredReports = useMemo(() => {
    return bgpReports.filter(
      (b) =>
        b.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.asn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.upstreamTier1.some((u) => u.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [bgpReports, searchQuery]);

  const activeDetail = useMemo(() => {
    return bgpReports.find((b) => b.asn === selectedAsn) || null;
  }, [bgpReports, selectedAsn]);

  // Scatter Chart Data: Adjacency (Speed) vs Routing Redundancy Score (Redundancy)
  const scatterData = useMemo(() => {
    return filteredReports.map((b) => ({
      name: b.operator,
      asn: b.asn,
      adjacencies: b.adjacenciesTotal, // X-Axis: Speed / Peering depth
      redundancyScore: b.routingRedundancyScore, // Y-Axis: Redundancy score
      capacityGbps: b.capacityGbps, // Z-Axis: Capacity
      prefixesIPv4: b.routedPrefixesIPv4,
      upstreamCount: b.upstreamTier1.length,
    }));
  }, [filteredReports]);

  // Upstream Tier-1 Share Distribution
  const tier1Distribution = useMemo(() => {
    const counts: Record<string, number> = {};
    bgpReports.forEach((b) => {
      b.upstreamTier1.forEach((t) => {
        const shortName = t.split(' ')[0];
        counts[shortName] = (counts[shortName] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [bgpReports]);

  // IPv4 vs IPv6 BGP Session Ratio Donut Chart
  const ipVersionRatio = useMemo(() => {
    const totalV4 = bgpReports.reduce((acc, b) => acc + b.adjacenciesIPv4, 0);
    const totalV6 = bgpReports.reduce((acc, b) => acc + b.adjacenciesIPv6, 0);
    return [
      { name: 'IPv4 BGP Sessions', value: totalV4, color: '#ecb663' },
      { name: 'IPv6 BGP Sessions', value: totalV6, color: '#56c4ac' },
    ];
  }, [bgpReports]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hurricane Electric Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Network size={26} color="#ecb663" />
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#fff' }}>
              IIG BGP & Hurricane Electric (he.net) Peering Intelligence
            </h2>
            <span
              style={{
                background: 'rgba(236, 182, 99, 0.15)',
                color: '#ecb663',
                border: '1px solid rgba(236, 182, 99, 0.3)',
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              HE Toolkit Integration (bgp.he.net)
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted-foreground)', maxWidth: '820px' }}>
            BGP Autonomous System (AS) routing analysis for Bangladesh International Internet Gateway (IIG) operators. Cross-checking <strong>Adjacencies</strong> (reflecting latency & speed) and <strong>Routing Numbers / Prefixes</strong> (reflecting failover redundancy & reachability).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href="https://he.net/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--subtle)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#62baf4',
              textDecoration: 'none',
            }}
          >
            Hurricane Electric BGP <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        <div className="panel data-panel" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600 }}>
            <span>ACTIVE IIG GATEWAYS</span>
            <Globe2 size={16} color="#62baf4" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: 'var(--foreground)' }}>
            {bgpReports.length} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--muted-foreground)' }}>Operators</span>
          </div>
          <div style={{ fontSize: '11px', color: '#62baf4', marginTop: '4px' }}>Licensed BTRC Gateways</div>
        </div>

        <div className="panel data-panel" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600 }}>
            <span>TOTAL BGP ADJACENCIES</span>
            <Zap size={16} color="#56c4ac" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: '#56c4ac' }}>
            {bgpReports.reduce((acc, b) => acc + b.adjacenciesTotal, 0)} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--muted-foreground)' }}>Peers</span>
          </div>
          <div style={{ fontSize: '11px', color: '#56c4ac', marginTop: '4px' }}>Direct Interconnections (Speed)</div>
        </div>

        <div className="panel data-panel" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600 }}>
            <span>ROUTED IPV4 PREFIXES</span>
            <Layers size={16} color="#ac9af2" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: '#ac9af2' }}>
            {(bgpReports.reduce((acc, b) => acc + b.routedPrefixesIPv4, 0) / 1000).toFixed(1)}k
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '4px' }}>Global Routing Volume (Redundancy)</div>
        </div>

        <div className="panel data-panel" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600 }}>
            <span>PRIMARY TIER-1 UPSTREAM</span>
            <Network size={16} color="#ecb663" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '8px', color: '#ecb663' }}>
            Hurricane Elec.
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '4px' }}>AS6939 Core Peering Backbone</div>
        </div>
      </div>

      {/* Visual Analytics Row 1: Interactive BGP Peering Topology Map & Scatter Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px' }}>
        {/* Visual 1: Interactive BGP Peering Topology Diagram (SVG) */}
        <section className="panel data-panel">
          <div className="section-top" style={{ marginBottom: '12px' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Network size={18} color="#ecb663" />
                Hurricane Electric AS6939 & IIG BGP Peering Topology
              </h2>
              <p className="metadata" style={{ margin: '4px 0 0 0' }}>
                Interactive BGP routing topology mapping Tier-1 upstreams to Bangladesh IIG Autonomous Systems.
              </p>
            </div>
          </div>

          <div
            style={{
              width: '100%',
              height: '340px',
              background: 'radial-gradient(circle at center, rgba(30,41,59,0.5) 0%, rgba(15,23,42,0.95) 100%)',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 700 340">
              {/* Background Grid Lines */}
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </pattern>
                <linearGradient id="gradientHE" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ecb663" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Connecting BGP Lines to Core HE Node */}
              <line x1="350" y1="60" x2="100" y2="180" stroke="#ecb663" strokeWidth="2" strokeDasharray="4 2" className="animate-pulse" />
              <line x1="350" y1="60" x2="220" y2="200" stroke="#62baf4" strokeWidth="2" />
              <line x1="350" y1="60" x2="350" y2="210" stroke="#56c4ac" strokeWidth="2" />
              <line x1="350" y1="60" x2="480" y2="200" stroke="#ac9af2" strokeWidth="1.5" />
              <line x1="350" y1="60" x2="600" y2="180" stroke="#67caae" strokeWidth="1.5" />

              {/* Connecting Lines to Downstream IXP / Cable Landing */}
              <line x1="100" y1="180" x2="150" y2="290" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <line x1="220" y1="200" x2="150" y2="290" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <line x1="350" y1="210" x2="350" y2="290" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <line x1="480" y1="200" x2="550" y2="290" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <line x1="600" y1="180" x2="550" y2="290" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

              {/* Core Node: Hurricane Electric AS6939 */}
              <g transform="translate(350, 60)" cursor="pointer" onClick={() => setSelectedAsn('AS24389')}>
                <circle r="32" fill="url(#gradientHE)" opacity="0.25" className="animate-ping" />
                <circle r="24" fill="url(#gradientHE)" stroke="#fff" strokeWidth="2" />
                <text y="-3" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">
                  HE.NET
                </text>
                <text y="9" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="9" fontFamily="monospace">
                  AS6939
                </text>
              </g>

              {/* IIG Node 1: BSCCL AS24389 */}
              <g transform="translate(100, 180)" cursor="pointer" onClick={() => setSelectedAsn('AS24389')}>
                <circle r="18" fill="#1e293b" stroke="#ecb663" strokeWidth="2" />
                <text y="-2" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">
                  BSCCL
                </text>
                <text y="8" textAnchor="middle" fill="#ecb663" fontSize="8" fontFamily="monospace">
                  142 Adj
                </text>
              </g>

              {/* IIG Node 2: Summit AS58410 */}
              <g transform="translate(220, 200)" cursor="pointer" onClick={() => setSelectedAsn('AS58410')}>
                <circle r="18" fill="#1e293b" stroke="#62baf4" strokeWidth="2" />
                <text y="-2" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">
                  Summit
                </text>
                <text y="8" textAnchor="middle" fill="#62baf4" fontSize="8" fontFamily="monospace">
                  118 Adj
                </text>
              </g>

              {/* IIG Node 3: Fiber@Home AS17498 */}
              <g transform="translate(350, 210)" cursor="pointer" onClick={() => setSelectedAsn('AS17498')}>
                <circle r="18" fill="#1e293b" stroke="#56c4ac" strokeWidth="2" />
                <text y="-2" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">
                  F@H
                </text>
                <text y="8" textAnchor="middle" fill="#56c4ac" fontSize="8" fontFamily="monospace">
                  104 Adj
                </text>
              </g>

              {/* IIG Node 4: Mango AS9230 */}
              <g transform="translate(480, 200)" cursor="pointer" onClick={() => setSelectedAsn('AS9230')}>
                <circle r="18" fill="#1e293b" stroke="#ac9af2" strokeWidth="2" />
                <text y="-2" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">
                  Mango
                </text>
                <text y="8" textAnchor="middle" fill="#ac9af2" fontSize="8" fontFamily="monospace">
                  76 Adj
                </text>
              </g>

              {/* IIG Node 5: Novocom AS45168 */}
              <g transform="translate(600, 180)" cursor="pointer" onClick={() => setSelectedAsn('AS45168')}>
                <circle r="18" fill="#1e293b" stroke="#67caae" strokeWidth="2" />
                <text y="-2" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">
                  Novocom
                </text>
                <text y="8" textAnchor="middle" fill="#67caae" fontSize="8" fontFamily="monospace">
                  62 Adj
                </text>
              </g>

              {/* Bottom Nodes */}
              <g transform="translate(150, 290)">
                <rect x="-40" y="-12" width="80" height="24" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" />
                <text y="4" textAnchor="middle" fill="#fff" fontSize="9">
                  SMW4 & SMW5
                </text>
              </g>

              <g transform="translate(350, 290)">
                <rect x="-45" y="-12" width="90" height="24" rx="12" fill="rgba(86,196,172,0.15)" stroke="#56c4ac" />
                <text y="4" textAnchor="middle" fill="#56c4ac" fontSize="9" fontWeight="bold">
                  BDIX IXP Dhaka
                </text>
              </g>

              <g transform="translate(550, 290)">
                <rect x="-40" y="-12" width="80" height="24" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" />
                <text y="4" textAnchor="middle" fill="#fff" fontSize="9">
                  ITC Benapole
                </text>
              </g>
            </svg>
          </div>
        </section>

        {/* Visual 2: BGP Adjacencies vs Routing Redundancy Scatter Plot */}
        <section className="panel data-panel">
          <div className="section-top" style={{ marginBottom: '12px' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="#56c4ac" />
                Adjacency (Speed) vs. Routing Redundancy Matrix
              </h2>
              <p className="metadata" style={{ margin: '4px 0 0 0' }}>
                X-Axis: Total BGP Adjacencies (Speed/Peering depth). Y-Axis: Routing Redundancy Index. Node size: Capacity.
              </p>
            </div>
          </div>

          <div style={{ width: '100%', height: '340px' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={200}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis type="number" dataKey="adjacencies" name="Adjacencies" unit=" peers" stroke="var(--muted-foreground)" fontSize={11} domain={[20, 160]} />
                <YAxis type="number" dataKey="redundancyScore" name="Redundancy Score" unit="%" stroke="var(--muted-foreground)" fontSize={11} domain={[65, 100]} />
                <ZAxis type="number" dataKey="capacityGbps" range={[100, 600]} name="Capacity (Gbps)" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: string) => [value, name]}
                />
                <Scatter name="IIG Operators" data={scatterData} fill="#ecb663">
                  {scatterData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#ecb663' : index === 1 ? '#62baf4' : index === 2 ? '#56c4ac' : '#ac9af2'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Visual Analytics Row 2: IPv4 vs IPv6 Donut + Upstream Tier-1 Bar Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Visual 3: IPv4 vs IPv6 BGP Session Ratio Donut Chart */}
        <section className="panel data-panel">
          <div className="section-top" style={{ marginBottom: '12px' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieIcon size={18} color="#ecb663" />
                IPv4 vs. IPv6 BGP Session Ratio (Donut Chart)
              </h2>
              <p className="metadata" style={{ margin: '4px 0 0 0' }}>
                Dual-stack BGP session distribution across all Bangladesh IIG Autonomous Systems.
              </p>
            </div>
          </div>

          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={200}>
              <PieChart>
                <Pie
                  data={ipVersionRatio}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ipVersionRatio.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any, name: string) => [`${val} BGP Sessions`, name]}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Visual 4: Upstream Tier-1 Carrier Market Share Bar Chart */}
        <section className="panel data-panel">
          <div className="section-top" style={{ marginBottom: '12px' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={18} color="#62baf4" />
                Upstream Tier-1 Carrier Share (Bar Chart)
              </h2>
              <p className="metadata" style={{ margin: '4px 0 0 0' }}>
                Number of Bangladesh IIG operators connected to global Tier-1 providers.
              </p>
            </div>
          </div>

          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={200}>
              <BarChart data={tier1Distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid var(--border)', fontSize: '12px' }} />
                <Bar dataKey="count" name="IIG Operators Connected" fill="#62baf4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Search & Filter Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'var(--subtle)',
          padding: '12px 16px',
          borderRadius: '10px',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ position: 'relative', minWidth: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            placeholder="Search ASN, Operator name or Upstream Tier-1..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '6px 12px 6px 32px',
              fontSize: '12px',
              color: 'var(--foreground)',
            }}
          />
        </div>

        <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
          Direct Integration with <strong>bgp.he.net (Hurricane Electric)</strong>
        </div>
      </div>

      {/* Main IIG BGP Report Table */}
      <section className="panel data-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '12px 14px', color: 'var(--muted-foreground)', fontWeight: 600 }}>OPERATOR NAME</th>
              <th style={{ padding: '12px 14px', color: 'var(--muted-foreground)', fontWeight: 600 }}>ASN (HE.NET)</th>
              <th style={{ padding: '12px 14px', color: 'var(--muted-foreground)', fontWeight: 600 }}>BGP ADJACENCIES (SPEED)</th>
              <th style={{ padding: '12px 14px', color: 'var(--muted-foreground)', fontWeight: 600 }}>ROUTED PREFIXES (REDUNDANCY)</th>
              <th style={{ padding: '12px 14px', color: 'var(--muted-foreground)', fontWeight: 600 }}>REDUNDANCY SCORE</th>
              <th style={{ padding: '12px 14px', color: 'var(--muted-foreground)', fontWeight: 600 }}>PRIMARY TIER-1 UPSTREAMS</th>
              <th style={{ padding: '12px 14px', color: 'var(--muted-foreground)', fontWeight: 600 }}>IXP LINKS</th>
              <th style={{ padding: '12px 14px', color: 'var(--muted-foreground)', fontWeight: 600 }}>FLAP STABILITY</th>
              <th style={{ padding: '12px 14px', color: 'var(--muted-foreground)', fontWeight: 600, textAlign: 'right' }}>HE.NET REPORT</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--foreground)' }}>{b.operator}</span>
                    <small style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>({b.downstreamISPsCount} Downstream ISPs)</small>
                  </div>
                </td>

                <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#ecb663' }}>
                  {b.asn}
                </td>

                <td style={{ padding: '12px 14px', fontFamily: 'monospace' }}>
                  <span style={{ fontWeight: 700, color: '#56c4ac' }}>{b.adjacenciesTotal}</span>
                  <small style={{ color: 'var(--muted-foreground)', fontSize: '10px', marginLeft: '4px' }}>
                    ({b.adjacenciesIPv4} v4 / {b.adjacenciesIPv6} v6)
                  </small>
                </td>

                <td style={{ padding: '12px 14px', fontFamily: 'monospace' }}>
                  <span style={{ fontWeight: 700, color: '#ac9af2' }}>{b.routedPrefixesIPv4.toLocaleString()}</span>
                  <small style={{ color: 'var(--muted-foreground)', fontSize: '10px', marginLeft: '4px' }}>
                    v4 routes
                  </small>
                </td>

                <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, color: b.routingRedundancyScore >= 90 ? '#56c4ac' : '#ecb663' }}>
                  {b.routingRedundancyScore}%
                </td>

                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {b.upstreamTier1.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        style={{
                          background: 'rgba(236, 182, 99, 0.1)',
                          border: '1px solid rgba(236, 182, 99, 0.3)',
                          color: '#ecb663',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 600,
                        }}
                      >
                        {t.split(' ')[0]}
                      </span>
                    ))}
                    {b.upstreamTier1.length > 2 && (
                      <span style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>+{b.upstreamTier1.length - 2} more</span>
                    )}
                  </div>
                </td>

                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {b.ixpConnections.map((ix) => (
                      <span
                        key={ix}
                        style={{
                          background: 'var(--subtle)',
                          border: '1px solid var(--border)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                        }}
                      >
                        {ix}
                      </span>
                    ))}
                  </div>
                </td>

                <td style={{ padding: '12px 14px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: 600,
                      background:
                        b.flapStabilityIndex === 'Optimal (No Flaps)'
                          ? 'rgba(86, 196, 172, 0.15)'
                          : 'rgba(236, 182, 99, 0.15)',
                      color:
                        b.flapStabilityIndex === 'Optimal (No Flaps)'
                          ? '#56c4ac'
                          : '#ecb663',
                    }}
                  >
                    {b.flapStabilityIndex === 'Optimal (No Flaps)' ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                    {b.flapStabilityIndex}
                  </span>
                </td>

                <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                  <button
                    onClick={() => setSelectedAsn(b.asn)}
                    className="quiet-button"
                    style={{
                      background: 'var(--subtle)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#ecb663',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    BGP Inspect <ExternalLink size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* BGP Details Dialog */}
      {activeDetail && (
        <Dialog open={!!activeDetail} onOpenChange={() => setSelectedAsn(null)}>
          <DialogContent style={{ background: '#0f172a', border: '1px solid var(--border)', color: '#fff', maxWidth: '650px' }}>
            <DialogHeader>
              <DialogTitle style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Network size={22} color="#ecb663" />
                Hurricane Electric BGP Analysis: {activeDetail.operator}
              </DialogTitle>
              <DialogDescription style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>
                Autonomous System: <strong style={{ color: '#ecb663' }}>{activeDetail.asn}</strong> | Source: <code>bgp.he.net</code>
              </DialogDescription>
            </DialogHeader>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div>
                  <small style={{ color: 'var(--muted-foreground)', fontSize: '11px' }}>Total BGP Adjacencies</small>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#56c4ac' }}>{activeDetail.adjacenciesTotal} Peers</div>
                </div>
                <div>
                  <small style={{ color: 'var(--muted-foreground)', fontSize: '11px' }}>IPv4 Prefixes Advertised</small>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#ac9af2' }}>{activeDetail.routedPrefixesIPv4.toLocaleString()}</div>
                </div>
                <div>
                  <small style={{ color: 'var(--muted-foreground)', fontSize: '11px' }}>Redundancy Rating</small>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#ecb663' }}>{activeDetail.routingRedundancyScore}%</div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Upstream Tier-1 Peering Providers</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {activeDetail.upstreamTier1.map((u) => (
                    <span
                      key={u}
                      style={{
                        background: 'rgba(236, 182, 99, 0.12)',
                        border: '1px solid rgba(236, 182, 99, 0.3)',
                        color: '#ecb663',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      ⚡ {u}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Internet Exchange (IXP) Interconnections</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {activeDetail.ixpConnections.map((ix) => (
                    <span
                      key={ix}
                      style={{
                        background: 'rgba(98, 186, 244, 0.12)',
                        border: '1px solid rgba(98, 186, 244, 0.3)',
                        color: '#62baf4',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      🌐 {ix}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <a
                  href={activeDetail.heNetGraphUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#ecb663',
                    color: '#0f172a',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  Open Full {activeDetail.asn} Report on bgp.he.net <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
