'use client';

import React, { useState, useMemo } from 'react';
import { OperatorSLAData, LicenseCategory } from '@/lib/license-bgp-data';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
  BarChart,
  PieChart,
  Pie,
  AreaChart,
  Area,
} from 'recharts';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
  Activity,
  FileCheck,
  PieChart as PieIcon,
  BarChart3,
  TrendingDown,
  Layers,
  Gauge,
  SlidersHorizontal,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type Props = {
  slaOperators: OperatorSLAData[];
};

const CATEGORY_COLORS: Record<string, string> = {
  MNO: '#62baf4',
  IIG: '#56c4ac',
  ICX: '#ac9af2',
  IGW: '#ecb663',
  'ANS / ISP': '#67caae',
  NTTN: '#f87171',
};

export default function SLACrossCheckView({ slaOperators }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Statuses');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectOperator, setInspectOperator] = useState<OperatorSLAData | null>(null);

  const categories = ['All Categories', 'MNO', 'IIG', 'ICX', 'IGW', 'ANS / ISP', 'NTTN'];
  const statuses = ['All Statuses', 'Verified', 'Minor Discrepancy', 'SLA Breach Flagged', 'Under Audit'];

  // Filtered operators
  const filteredOperators = useMemo(() => {
    return slaOperators.filter((op) => {
      const matchCat = selectedCategory === 'All Categories' || op.category === selectedCategory;
      const matchStat = selectedStatus === 'All Statuses' || op.status === selectedStatus;
      const matchSearch =
        op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.validationProbes.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchStat && matchSearch;
    });
  }, [slaOperators, selectedCategory, selectedStatus, searchQuery]);

  // Executive Summary Metrics
  const metrics = useMemo(() => {
    if (slaOperators.length === 0) return { avgSelf: 0, avgCross: 0, avgDelta: 0, breachCount: 0, riskIndex: 0 };
    const totalSelf = slaOperators.reduce((acc, curr) => acc + curr.selfReportedUptime, 0);
    const totalCross = slaOperators.reduce((acc, curr) => acc + curr.customerCrossCheckedUptime, 0);
    const totalDelta = slaOperators.reduce((acc, curr) => acc + curr.discrepancyDelta, 0);
    const breachCount = slaOperators.filter((op) => op.status === 'SLA Breach Flagged' || op.status === 'Under Audit').length;
    const avgDelta = totalDelta / slaOperators.length;
    const riskIndex = Math.min(100, Math.round(Math.abs(avgDelta) * 45 + (breachCount / slaOperators.length) * 55));
    return {
      avgSelf: (totalSelf / slaOperators.length).toFixed(2),
      avgCross: (totalCross / slaOperators.length).toFixed(2),
      avgDelta: avgDelta.toFixed(2),
      breachCount,
      riskIndex,
    };
  }, [slaOperators]);

  // Data for Discrepancy Bar & Line Combo Chart
  const chartData = useMemo(() => {
    return filteredOperators.map((op) => ({
      name: op.name.replace(/ (Ltd|Limited|Digital Communications|Company|\(IIG\)|\(NTTN\))/gi, ''),
      fullName: op.name,
      Category: op.category,
      'Self-Reported Uptime (%)': op.selfReportedUptime,
      'Customer Cross-Checked (%)': op.customerCrossCheckedUptime,
      'Discrepancy Gap (%)': Math.abs(op.discrepancyDelta),
      status: op.status,
    }));
  }, [filteredOperators]);

  // Data for Category Distribution Pie Chart (Donut Chart)
  const categoryPieData = useMemo(() => {
    const cats: LicenseCategory[] = ['MNO', 'IIG', 'ICX', 'IGW', 'ANS / ISP', 'NTTN'];
    return cats.map((cat) => {
      const count = slaOperators.filter((o) => o.category === cat).length;
      return { name: cat, value: count, color: CATEGORY_COLORS[cat] || '#62baf4' };
    });
  }, [slaOperators]);

  // Data for License Category Radar Chart
  const categoryRadarData = useMemo(() => {
    const cats: LicenseCategory[] = ['MNO', 'IIG', 'ICX', 'IGW', 'ANS / ISP', 'NTTN'];
    return cats.map((cat) => {
      const ops = slaOperators.filter((o) => o.category === cat);
      if (ops.length === 0) return { category: cat, compliance: 100, avgCross: 100, discrepancy: 0 };
      const avgCross = ops.reduce((acc, o) => acc + o.customerCrossCheckedUptime, 0) / ops.length;
      const avgComp = ops.reduce((acc, o) => acc + o.complianceRate, 0) / ops.length;
      const avgDisc = Math.abs(ops.reduce((acc, o) => acc + o.discrepancyDelta, 0) / ops.length);
      return {
        category: cat,
        'Compliance Rate': parseFloat(avgComp.toFixed(1)),
        'Cross-Checked Uptime': parseFloat(avgCross.toFixed(2)),
        'Avg Discrepancy Gap': parseFloat(avgDisc.toFixed(2)),
      };
    });
  }, [slaOperators]);

  // Data for 24-hour Trend Area Chart
  const areaTrendData = useMemo(() => {
    const hours = ['T-6h', 'T-5h', 'T-4h', 'T-3h', 'T-2h', 'T-1h', 'Now'];
    return hours.map((h, i) => {
      const avgCross = slaOperators.reduce((acc, op) => acc + (op.trend24h[i] || op.customerCrossCheckedUptime), 0) / slaOperators.length;
      const avgSelf = slaOperators.reduce((acc, op) => acc + op.selfReportedUptime, 0) / slaOperators.length;
      return {
        time: h,
        'Validated Customer Uptime': parseFloat(avgCross.toFixed(2)),
        'Claimed Self Uptime': parseFloat(avgSelf.toFixed(2)),
      };
    });
  }, [slaOperators]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
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
            <ShieldCheck size={26} color="#62baf4" />
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#fff' }}>
              Operator SLA Cross-Verification Matrix
            </h2>
            <span
              style={{
                background: 'rgba(98, 186, 244, 0.15)',
                color: '#62baf4',
                border: '1px solid rgba(98, 186, 244, 0.3)',
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              Customer-Validated Telemetry
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted-foreground)', maxWidth: '780px' }}>
            Multi-license compliance engine cross-checking self-reported operator uptimes against enterprise SNMP probes, downstream ISP ping grids, and real-time customer incident logs to eliminate false SLA claims.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--subtle)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12px',
              color: 'var(--foreground)',
            }}
          >
            <Activity size={14} className="animate-pulse" color="#56c4ac" />
            <span>Customer Probes: <strong>14,250 Live Sensors</strong></span>
          </div>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        <div className="panel data-panel" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600 }}>
            <span>TOTAL LICENSEES</span>
            <FileCheck size={16} color="#62baf4" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: 'var(--foreground)' }}>
            {slaOperators.length} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--muted-foreground)' }}>Operators</span>
          </div>
          <div style={{ fontSize: '11px', color: '#62baf4', marginTop: '4px' }}>Across 6 License Categories</div>
        </div>

        <div className="panel data-panel" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600 }}>
            <span>AVG CLAIMED UPTIME</span>
            <Activity size={16} color="#ac9af2" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: '#ac9af2' }}>
            {metrics.avgSelf}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '4px' }}>Claimed by Operator Dashboards</div>
        </div>

        <div className="panel data-panel" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600 }}>
            <span>CUSTOMER CROSS-CHECKED</span>
            <CheckCircle2 size={16} color="#56c4ac" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: '#56c4ac' }}>
            {metrics.avgCross}%
          </div>
          <div style={{ fontSize: '11px', color: '#56c4ac', marginTop: '4px' }}>Validated via Customer Telemetry</div>
        </div>

        <div className="panel data-panel" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600 }}>
            <span>AVG DISCREPANCY GAP</span>
            <AlertTriangle size={16} color="#ecb663" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: Number(metrics.avgDelta) < -0.5 ? '#ecb663' : '#56c4ac' }}>
            {metrics.avgDelta}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '4px' }}>Variance (Cross-Checked vs Self-Report)</div>
        </div>

        <div className="panel data-panel" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600 }}>
            <span>SLA BREACHES / AUDITS</span>
            <ShieldAlert size={16} color="#f87171" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: '#f87171' }}>
            {metrics.breachCount} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--muted-foreground)' }}>Operators</span>
          </div>
          <div style={{ fontSize: '11px', color: '#f87171', marginTop: '4px' }}>Flagged for BTRC Penalty Review</div>
        </div>
      </div>

      {/* Visual Analytics Row 1: Dual Chart Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px' }}>
        {/* Chart 1: Operator Uptime Discrepancy Bar & Line Combo Chart */}
        <section className="panel data-panel">
          <div className="section-top" style={{ marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={18} color="#62baf4" />
                Self-Reported vs. Customer Cross-Checked Uptime (%)
              </h2>
              <p className="metadata" style={{ margin: '4px 0 0 0' }}>
                Contrasting claimed uptime (bars) against customer cross-checked SLA (lines). Highlighted gaps show inflation.
              </p>
            </div>
          </div>

          <div style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 40, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis domain={[94, 100]} stroke="var(--muted-foreground)" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: string) => [`${value}%`, name]}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Self-Reported Uptime (%)" fill="#62baf4" opacity={0.65} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Customer Cross-Checked (%)" fill="#56c4ac" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="Discrepancy Gap (%)" stroke="#ecb663" strokeWidth={2} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Chart 2: License Category SLA Health Radar Chart */}
        <section className="panel data-panel">
          <div className="section-top" style={{ marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck size={18} color="#ac9af2" />
                License Category SLA Compliance Radar
              </h2>
              <p className="metadata" style={{ margin: '4px 0 0 0' }}>
                Comparing average compliance score and customer cross-checked availability across license tiers.
              </p>
            </div>
          </div>

          <div style={{ width: '100%', height: '320px', display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={categoryRadarData}>
                <PolarGrid stroke="rgba(255,255,255,0.12)" />
                <PolarAngleAxis dataKey="category" stroke="var(--foreground)" fontSize={12} fontWeight={600} />
                <PolarRadiusAxis angle={30} domain={[80, 100]} stroke="var(--muted-foreground)" fontSize={10} />
                <Radar name="Compliance Rate (%)" dataKey="Compliance Rate" stroke="#ac9af2" fill="#ac9af2" fillOpacity={0.35} />
                <Radar name="Cross-Checked Uptime (%)" dataKey="Cross-Checked Uptime" stroke="#56c4ac" fill="#56c4ac" fillOpacity={0.25} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Visual Analytics Row 2: Pie Donut Chart + Area Trend + SVG Risk Gauge Diagram */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Visual 3: License Category Share Pie/Donut Chart */}
        <section className="panel data-panel">
          <div className="section-top" style={{ marginBottom: '12px' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieIcon size={18} color="#56c4ac" />
                License Category Distribution (Pie / Donut)
              </h2>
              <p className="metadata" style={{ margin: '4px 0 0 0' }}>
                Share of active operators monitored per regulatory license tier.
              </p>
            </div>
          </div>

          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryPieData.map((entry) => (
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
                  formatter={(val: any, name: string) => [`${val} Operators`, name]}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Visual 4: 24-Hour Verified SLA Trend Area Chart */}
        <section className="panel data-panel">
          <div className="section-top" style={{ marginBottom: '12px' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#62baf4" />
                24-Hour National Verified Uptime Trend (Area)
              </h2>
              <p className="metadata" style={{ margin: '4px 0 0 0' }}>
                Continuous SLA validation trend comparing claimed vs customer cross-checked availability.
              </p>
            </div>
          </div>

          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#56c4ac" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#56c4ac" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorSelf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#62baf4" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#62baf4" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={10} />
                <YAxis domain={[95, 100]} stroke="var(--muted-foreground)" fontSize={10} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid var(--border)', fontSize: '12px' }} />
                <Area type="monotone" dataKey="Validated Customer Uptime" stroke="#56c4ac" fillOpacity={1} fill="url(#colorCross)" />
                <Area type="monotone" dataKey="Claimed Self Uptime" stroke="#62baf4" fillOpacity={1} fill="url(#colorSelf)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Visual 5: SVG SLA Discrepancy Risk Gauge Meter */}
        <section className="panel data-panel">
          <div className="section-top" style={{ marginBottom: '12px' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gauge size={18} color="#ecb663" />
                National Discrepancy Risk Gauge Diagram
              </h2>
              <p className="metadata" style={{ margin: '4px 0 0 0' }}>
                Calculated risk score based on SLA inflation and audit penalty flags.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px' }}>
            <svg width="220" height="130" viewBox="0 0 200 120">
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="16" strokeLinecap="round" />
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke={metrics.riskIndex > 50 ? '#f87171' : metrics.riskIndex > 25 ? '#ecb663' : '#56c4ac'}
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${(metrics.riskIndex / 100) * 251} 251`}
              />
              {/* Needle Indicator */}
              <g transform={`rotate(${-90 + (metrics.riskIndex / 100) * 180}, 100, 100)`}>
                <line x1="100" y1="100" x2="100" y2="35" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                <circle cx="100" cy="100" r="6" fill="#fff" />
              </g>
              <text x="100" y="90" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="bold">
                {metrics.riskIndex}%
              </text>
              <text x="100" y="112" textAnchor="middle" fill="var(--muted-foreground)" fontSize="10">
                SLA Inflation Risk Level
              </text>
            </svg>
            <div style={{ display: 'flex', gap: '16px', fontSize: '11px', marginTop: '10px' }}>
              <span style={{ color: '#56c4ac' }}>● Low (0-25%)</span>
              <span style={{ color: '#ecb663' }}>● Moderate (26-50%)</span>
              <span style={{ color: '#f87171' }}>● High Risk (51-100%)</span>
            </div>
          </div>
        </section>
      </div>

      {/* Filtering & Live Controls Bar */}
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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
            <input
              type="text"
              placeholder="Filter by operator or probe..."
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

          {/* License Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)' }}>Category:</span>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    background: selectedCategory === cat ? 'var(--primary)' : 'var(--background)',
                    color: selectedCategory === cat ? '#fff' : 'var(--muted-foreground)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)' }}>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '12px',
              }}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
          Showing <strong>{filteredOperators.length}</strong> of <strong>{slaOperators.length}</strong> operators
        </div>
      </div>

      {/* Main SLA Cross-Check Audit Table */}
      <section className="panel data-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '12px 14px', color: 'var(--muted-foreground)', fontWeight: 600 }}>OPERATOR NAME</th>
              <th style={{ padding: '12px 14px', color: 'var(--muted-foreground)', fontWeight: 600 }}>CATEGORY</th>
              <th style={{ padding: '12px 14px', color: 'var(--muted-foreground)', fontWeight: 600 }}>SELF-REPORTED</th>
              <th style={{ padding: '12px 14px', color: 'var(--muted-foreground)', fontWeight: 600 }}>CUSTOMER CROSS-CHECKED</th>
              <th style={{ padding: '12px 14px', color: 'var(--muted-foreground)', fontWeight: 600 }}>DISCREPANCY GAP</th>
              <th style={{ padding: '12px 14px', color: 'var(--muted-foreground)', fontWeight: 600 }}>AUDIT STATUS</th>
              <th style={{ padding: '12px 14px', color: 'var(--muted-foreground)', fontWeight: 600 }}>CROSS-CHECK PROBE SOURCES</th>
              <th style={{ padding: '12px 14px', color: 'var(--muted-foreground)', fontWeight: 600 }}>MTTR</th>
              <th style={{ padding: '12px 14px', color: 'var(--muted-foreground)', fontWeight: 600, textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredOperators.map((op) => {
              const isBreach = op.status === 'SLA Breach Flagged' || op.status === 'Under Audit';
              const isWarning = op.status === 'Minor Discrepancy';
              return (
                <tr
                  key={op.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: isBreach ? 'rgba(248, 113, 113, 0.04)' : isWarning ? 'rgba(236, 182, 99, 0.03)' : 'transparent',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--foreground)' }}>{op.name}</span>
                      <small style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>({op.subscribersOrClients})</small>
                    </div>
                  </td>

                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        background: 'var(--subtle)',
                        border: '1px solid var(--border)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      {op.category}
                    </span>
                  </td>

                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#ac9af2', fontWeight: 600 }}>
                    {op.selfReportedUptime.toFixed(2)}%
                  </td>

                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, color: op.customerCrossCheckedUptime >= op.slaBenchmark ? '#56c4ac' : '#f87171' }}>
                    {op.customerCrossCheckedUptime.toFixed(2)}%
                  </td>

                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, color: op.discrepancyDelta < -1.0 ? '#f87171' : op.discrepancyDelta < -0.5 ? '#ecb663' : '#56c4ac' }}>
                    {op.discrepancyDelta.toFixed(2)}%
                  </td>

                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background:
                          op.status === 'Verified'
                            ? 'rgba(86, 196, 172, 0.15)'
                            : op.status === 'Minor Discrepancy'
                            ? 'rgba(236, 182, 99, 0.15)'
                            : 'rgba(248, 113, 113, 0.15)',
                        color:
                          op.status === 'Verified'
                            ? '#56c4ac'
                            : op.status === 'Minor Discrepancy'
                            ? '#ecb663'
                            : '#f87171',
                        border: `1px solid ${
                          op.status === 'Verified'
                            ? 'rgba(86, 196, 172, 0.3)'
                            : op.status === 'Minor Discrepancy'
                            ? 'rgba(236, 182, 99, 0.3)'
                            : 'rgba(248, 113, 113, 0.3)'
                        }`,
                      }}
                    >
                      {op.status === 'Verified' && <CheckCircle2 size={12} />}
                      {op.status === 'Minor Discrepancy' && <AlertTriangle size={12} />}
                      {(op.status === 'SLA Breach Flagged' || op.status === 'Under Audit') && <ShieldAlert size={12} />}
                      {op.status}
                    </span>
                  </td>

                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {op.validationProbes.map((probe) => (
                        <span
                          key={probe}
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '10px',
                            color: 'var(--muted-foreground)',
                          }}
                        >
                          {probe}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td style={{ padding: '12px 14px', fontFamily: 'monospace' }}>
                    {op.mttrMins} mins
                  </td>

                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <button
                      onClick={() => setInspectOperator(op)}
                      className="quiet-button"
                      style={{
                        background: 'var(--subtle)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#62baf4',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      Inspect <ExternalLink size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Operator Inspection Modal / Dialog */}
      {inspectOperator && (
        <Dialog open={!!inspectOperator} onOpenChange={() => setInspectOperator(null)}>
          <DialogContent style={{ background: '#0f172a', border: '1px solid var(--border)', color: '#fff', maxWidth: '650px' }}>
            <DialogHeader>
              <DialogTitle style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} color="#62baf4" />
                SLA Cross-Audit Details: {inspectOperator.name}
              </DialogTitle>
              <DialogDescription style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>
                License Category: <strong>{inspectOperator.category}</strong> | ID: <code>{inspectOperator.id}</code>
              </DialogDescription>
            </DialogHeader>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div>
                  <small style={{ color: 'var(--muted-foreground)', fontSize: '11px' }}>Claimed Uptime</small>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#ac9af2' }}>{inspectOperator.selfReportedUptime}%</div>
                </div>
                <div>
                  <small style={{ color: 'var(--muted-foreground)', fontSize: '11px' }}>Validated Uptime</small>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#56c4ac' }}>{inspectOperator.customerCrossCheckedUptime}%</div>
                </div>
                <div>
                  <small style={{ color: 'var(--muted-foreground)', fontSize: '11px' }}>Discrepancy Delta</small>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: inspectOperator.discrepancyDelta < -0.5 ? '#f87171' : '#56c4ac' }}>
                    {inspectOperator.discrepancyDelta}%
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Regulatory Audit Notes</h4>
                <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', background: 'var(--subtle)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  {inspectOperator.details}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Cross-Verification Probes</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {inspectOperator.validationProbes.map((probe) => (
                    <span
                      key={probe}
                      style={{
                        background: 'rgba(98, 186, 244, 0.1)',
                        border: '1px solid rgba(98, 186, 244, 0.3)',
                        color: '#62baf4',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      ✓ {probe}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>24-Hour Verified Uptime Trend</h4>
                <div style={{ width: '100%', height: '140px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inspectOperator.trend24h.map((v, i) => ({ time: `T-${6 - i}h`, uptime: v }))}>
                      <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={10} />
                      <YAxis domain={[94, 100]} stroke="var(--muted-foreground)" fontSize={10} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid var(--border)' }} />
                      <Bar dataKey="uptime" fill="#56c4ac" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
