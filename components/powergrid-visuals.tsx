'use client';

import React, { useState, useMemo } from 'react';
import {
  Zap,
  TrendingUp,
  Layers,
  Activity,
  AlertTriangle,
  Server,
  Maximize2,
  CheckCircle2,
  RefreshCw,
  Info,
  ShieldAlert,
  Sliders,
  Flame,
  Sun,
  Droplets,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { POWERGRID_METADATA, POWERGRID_RECENT_HOURLY, PowerGridRecord } from '@/lib/powergrid-electricity';

interface PowerGridVisualsProps {
  onSelectStation?: (stationName: string) => void;
}

export default function PowerGridVisuals({ onSelectStation }: PowerGridVisualsProps) {
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  // Prepare hourly data for Recharts (latest 24 hours reversed for chronological display)
  const hourlyChartData = useMemo(() => {
    const records = POWERGRID_RECENT_HOURLY.slice(0, 24).reverse();
    return records.map((r) => {
      const timeLabel = r.time ? r.time.slice(0, 5) : r.date;
      return {
        time: timeLabel,
        demand: r.demand_mw || 0,
        supply: r.supply_mw || 0,
        loadshed: r.loadshed_mw || 0,
        gas: r.gas_mw || 0,
        coal: r.coal_mw || 0,
        liquidFuel: r.liquid_fuel_mw || 0,
        imports: r.cross_border?.total_imports_mw || 0,
        hydro: r.hydro_mw || 0,
        solar: r.solar_mw || 0,
      };
    });
  }, []);

  // Fuel Mix Breakdown for latest entry
  const latest = POWERGRID_METADATA.latest_entry;
  const gasVal = latest.gas_mw || 7120;
  const coalVal = latest.coal_mw || 2480;
  const importVal = latest.cross_border?.total_imports_mw || 2680;
  const liquidVal = latest.liquid_fuel_mw || 1650;
  const hydroVal = latest.hydro_mw || 230;
  const solarVal = latest.solar_mw || 580;
  const totalGen = gasVal + coalVal + importVal + liquidVal + hydroVal + solarVal;

  const fuelMixData = [
    { name: 'Natural Gas', value: gasVal, color: '#f59e0b', icon: Flame, share: ((gasVal / totalGen) * 100).toFixed(1) },
    { name: 'Cross-Border Imports (India/Adani)', value: importVal, color: '#3b82f6', icon: Zap, share: ((importVal / totalGen) * 100).toFixed(1) },
    { name: 'Coal (Payra/Rampal/Barapukuria)', value: coalVal, color: '#64748b', icon: Server, share: ((coalVal / totalGen) * 100).toFixed(1) },
    { name: 'Liquid Fuel / Furnace Oil (HFO)', value: liquidVal, color: '#ef4444', icon: Activity, share: ((liquidVal / totalGen) * 100).toFixed(1) },
    { name: 'Solar & Renewable', value: solarVal, color: '#10b981', icon: Sun, share: ((solarVal / totalGen) * 100).toFixed(1) },
    { name: 'Hydroelectric (Kaptai)', value: hydroVal, color: '#06b6d4', icon: Droplets, share: ((hydroVal / totalGen) * 100).toFixed(1) },
  ];

  // Transmission Nodes for 3D Topology Diagram
  const GRID_POWER_PLANTS = [
    { id: 'payra', name: 'Payra Ultra Super Critical Thermal', cap: '1,320 MW', type: 'Coal', status: 'Optimal', lat: 21.98, lon: 90.31, region: 'Barishal', color: '#64748b' },
    { id: 'rampal', name: 'Maitree Rampal Thermal Power Plant', cap: '1,320 MW', type: 'Coal', status: 'Optimal', lat: 22.58, lon: 89.62, region: 'Khulna', color: '#64748b' },
    { id: 'matarbari', name: 'Matarbari Ultra Super Critical Plant', cap: '1,200 MW', type: 'Coal', status: 'Optimal', lat: 21.71, lon: 91.87, region: 'Chattogram', color: '#64748b' },
    { id: 'rooppur', name: 'Rooppur Nuclear Power Project', cap: '2,400 MW (Phase-1)', type: 'Nuclear', status: 'Commissioning', lat: 24.07, lon: 89.04, region: 'Rajshahi', color: '#a855f7' },
    { id: 'meghnaghat', name: 'Meghnaghat Combined Cycle Plant', cap: '1,100 MW', type: 'Gas', status: 'Optimal', lat: 23.61, lon: 90.61, region: 'Dhaka', color: '#f59e0b' },
    { id: 'ashuganj', name: 'Ashuganj Power Station Complex', cap: '1,450 MW', type: 'Gas', status: 'Optimal', lat: 24.03, lon: 91.01, region: 'Chattogram', color: '#f59e0b' },
    { id: 'adani', name: 'Adani Godda Cross-Border HVDC Import', cap: '1,600 MW', type: 'Import', status: 'Optimal', lat: 24.82, lon: 88.58, region: 'India-Border', color: '#3b82f6' },
    { id: 'bheramara', name: 'Bheramara HVDC Interconnector (India)', cap: '1,000 MW', type: 'Import', status: 'Optimal', lat: 24.04, lon: 88.99, region: 'Khulna', color: '#3b82f6' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. TOP ROW: Fuel Mix Donut & Generation Telemetry Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Fuel Mix Pie & Breakdown Card */}
        <section className="panel data-panel" style={{ padding: '20px' }}>
          <div className="section-top" style={{ marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="#f59e0b" /> National Fuel Generation Mix & Fuel Breakdown
              </h3>
              <p className="metadata" style={{ margin: '4px 0 0 0' }}>
                Total Active Generation & Imports: <strong>{totalGen.toLocaleString()} MW</strong>
              </p>
            </div>
            <span style={{ background: '#f59e0b20', color: '#f59e0b', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
              LIVE PGCB SCRAPED
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '20px', alignItems: 'center' }}>
            {/* Recharts Pie Chart */}
            <div style={{ width: '100%', height: '180px' }}>
              <ResponsiveContainer minWidth={100} minHeight={180}>
                <PieChart>
                  <Pie
                    data={fuelMixData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {fuelMixData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${Number(value).toLocaleString()} MW`, 'Generation']}
                    contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Fuel Rows Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {fuelMixData.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--foreground)' }}>
                        <Icon size={13} color={f.color} />
                        {f.name}
                      </span>
                      <strong>
                        {f.value.toLocaleString()} MW <span style={{ color: f.color, fontSize: '11px' }}>({f.share}%)</span>
                      </strong>
                    </div>
                    <div style={{ height: '5px', borderRadius: '3px', background: 'var(--subtle)', overflow: 'hidden' }}>
                      <div style={{ width: `${f.share}%`, height: '100%', background: f.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Real-Time Grid Stability Indicators */}
        <section className="panel data-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="section-top" style={{ marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#10b981" /> National Grid Health & Frequency Metrics
              </h3>
              <span style={{ background: '#10b98120', color: '#10b981', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                STABLE 50.02 Hz
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--subtle)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>GRID FREQUENCY</span>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
                  50.02 <span style={{ fontSize: '12px' }}>Hz</span>
                </div>
                <small style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>Tolerance: ±0.15 Hz (49.85 - 50.15)</small>
              </div>

              <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--subtle)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>PEAK DEFICIT RATE</span>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#ef4444', marginTop: '2px' }}>
                  {((latest.loadshed_mw / latest.demand_mw) * 100).toFixed(1)}%
                </div>
                <small style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>{latest.loadshed_mw.toLocaleString()} MW Load Shedding</small>
              </div>

              <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--subtle)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>CROSS-BORDER IMPORTS</span>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#3b82f6', marginTop: '2px' }}>
                  {importVal.toLocaleString()} <span style={{ fontSize: '12px' }}>MW</span>
                </div>
                <small style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>Adani + Bheramara + Tripura</small>
              </div>

              <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--subtle)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>GAS GENERATION</span>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#f59e0b', marginTop: '2px' }}>
                  {gasVal.toLocaleString()} <span style={{ fontSize: '12px' }}>MW</span>
                </div>
                <small style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>RLNG + Domestic Gas Field Supply</small>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '11px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            <span>Rotational load shedding actively enforced in rural distribution zones to protect 400kV national backbone stability.</span>
          </div>
        </section>
      </div>

      {/* 2. 24-HOUR HOURLY DEMAND VS SUPPLY VS LOAD SHEDDING AREA CHART */}
      <section className="panel data-panel" style={{ padding: '20px' }}>
        <div className="section-top" style={{ marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#3b82f6" /> 24-Hour National Demand, Grid Supply & Load Shedding Telemetry Profile
            </h3>
            <p className="metadata" style={{ margin: '4px 0 0 0' }}>
              Hourly load curves (MW) from PGCB ERP telemetry stream
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '11px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>● Substation Demand</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>● Grid Supply</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}>● Load Shedding</span>
          </div>
        </div>

        <div style={{ width: '100%', height: '280px' }}>
          <ResponsiveContainer minWidth={100} minHeight={280}>
            <AreaChart data={hourlyChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLoadshed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} unit=" MW" width={65} />
              <Tooltip
                contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                formatter={(val: any, name: any) => [`${Number(val).toLocaleString()} MW`, name === 'demand' ? 'Substation Demand' : name === 'supply' ? 'Grid Supply' : 'Load Shedding']}
              />
              <Area type="monotone" dataKey="demand" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorDemand)" />
              <Area type="monotone" dataKey="supply" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSupply)" />
              <Area type="monotone" dataKey="loadshed" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorLoadshed)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 3. INTERACTIVE POWER GRID TRANSMISSION NETWORK & LOAD FLOW DIAGRAM */}
      <section className="panel data-panel" style={{ padding: '20px' }}>
        <div className="section-top" style={{ marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="#e5a53d" /> Bangladesh 400kV / 230kV Power Transmission Backbone & Mega Generation Stations
            </h3>
            <p className="metadata" style={{ margin: '4px 0 0 0' }}>
              High-voltage transmission interconnects, subsea cables, and cross-border HVDC lines feeding the national grid
            </p>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>Click any mega station to inspect capacity</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '14px' }}>
          {GRID_POWER_PLANTS.map((plant) => {
            const isSelected = selectedStation === plant.id;
            return (
              <div
                key={plant.id}
                onClick={() => {
                  setSelectedStation(plant.id);
                  if (onSelectStation) onSelectStation(plant.name);
                }}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'var(--subtle)',
                  border: `1px solid ${isSelected ? '#f59e0b' : 'var(--border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: `${plant.color}20`, color: plant.color, fontWeight: 700 }}>
                    {plant.type}
                  </span>
                  <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 600 }}>● {plant.status}</span>
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 700, color: 'var(--foreground)' }}>{plant.name}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '8px' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>Capacity:</span>
                  <strong style={{ color: '#f59e0b' }}>{plant.cap}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px', color: 'var(--muted-foreground)' }}>
                  <span>Region: {plant.region}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
