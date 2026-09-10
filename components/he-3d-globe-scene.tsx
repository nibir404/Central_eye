'use client';

import React, { useState, useMemo } from 'react';
import {
  Network,
  Globe2,
  Zap,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Activity,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Server,
  Anchor,
  Building2,
  Cpu,
  ArrowUpRight,
  Filter,
  BarChart3,
} from 'lucide-react';
import { IIGBGPReport } from '@/lib/license-bgp-data';

type BGPNodeType = 'GLOBAL_TIER1' | 'SUBSEA_LANDING' | 'BANGLADESH_IIG' | 'NATIONAL_IXP';

type NetworkNode = {
  id: string;
  name: string;
  asn: string;
  location: string;
  tier: BGPNodeType;
  color: string;
  peers: number;
  capacityTbps: number;
  prefixesV4: number;
  latencyMs: number;
  details: string;
  upstreams?: string[];
  subseaCables?: string[];
};

const BGP_NETWORK_NODES: NetworkNode[] = [
  // Tier 1: Global Core Backbone Hubs
  { id: 'HE-FREMONT', name: 'Hurricane Electric Core HQ', asn: 'AS6939', location: 'Fremont, CA, USA', tier: 'GLOBAL_TIER1', color: '#f59e0b', peers: 4250, capacityTbps: 24.0, prefixesV4: 945000, latencyMs: 185, details: 'Primary Global BGP Backbone HQ & Peering Point' },
  { id: 'HE-LONDON', name: 'HE London Telehouse North', asn: 'AS6939', location: 'London, UK', tier: 'GLOBAL_TIER1', color: '#f59e0b', peers: 3600, capacityTbps: 16.0, prefixesV4: 910000, latencyMs: 128, details: 'European Transatlantic & LINX Interconnect' },
  { id: 'HE-SINGAPORE', name: 'HE Singapore Equinix SG1', asn: 'AS6939', location: 'Singapore', tier: 'GLOBAL_TIER1', color: '#f59e0b', peers: 2800, capacityTbps: 14.0, prefixesV4: 880000, latencyMs: 38, details: 'Asia-Pacific Core Subsea Transit Gateway' },
  { id: 'HE-MUMBAI', name: 'HE Mumbai Equinix MB1', asn: 'AS6939', location: 'Mumbai, India', tier: 'GLOBAL_TIER1', color: '#f59e0b', peers: 1850, capacityTbps: 8.2, prefixesV4: 810000, latencyMs: 24, details: 'South Asia Core Gateway & ITC Interconnect' },
  { id: 'TATA-MUMBAI', name: 'Tata Communications', asn: 'AS6453', location: 'Mumbai, India', tier: 'GLOBAL_TIER1', color: '#a855f7', peers: 1950, capacityTbps: 16.0, prefixesV4: 900000, latencyMs: 26, details: 'Tata Global Subsea & ITC Terrestrial Transit' },
  { id: 'NTT-TOKYO', name: 'NTT America', asn: 'AS2914', location: 'Tokyo, Japan', tier: 'GLOBAL_TIER1', color: '#a855f7', peers: 2100, capacityTbps: 18.0, prefixesV4: 915000, latencyMs: 82, details: 'NTT Global IP Network Transpacific Backbone' },

  // Tier 2: Subsea Cables & ITC Crossings
  { id: 'SUB-SMW4', name: 'Cox’s Bazar SMW4 Landing Station', asn: 'SMW4-BD', location: 'Cox’s Bazar, BD', tier: 'SUBSEA_LANDING', color: '#10b981', peers: 14, capacityTbps: 1.8, prefixesV4: 0, latencyMs: 12, details: 'SEA-ME-WE 4 Submarine Cable Landing Station (1.8 Tbps)', subseaCables: ['Marseille', 'Alexandria', 'Jeddah', 'Mumbai', 'Cox’s Bazar', 'Singapore'] },
  { id: 'SUB-SMW5', name: 'Kuakata SMW5 Landing Station', asn: 'SMW5-BD', location: 'Kuakata, BD', tier: 'SUBSEA_LANDING', color: '#10b981', peers: 18, capacityTbps: 3.6, prefixesV4: 0, latencyMs: 14, details: 'SEA-ME-WE 5 Submarine Cable Landing Station (3.6 Tbps)', subseaCables: ['Toulon', 'Cairo', 'Fujairah', 'Colombo', 'Kuakata', 'Singapore'] },
  { id: 'SUB-ITC', name: 'Benapole Terrestrial ITC Station', asn: 'ITC-BD', location: 'Benapole, BD', tier: 'SUBSEA_LANDING', color: '#3b82f6', peers: 12, capacityTbps: 2.4, prefixesV4: 0, latencyMs: 18, details: 'International Terrestrial Cable (ITC) Cross-Border Fiber', subseaCables: ['Petrapole', 'Kolkata', 'Mumbai'] },

  // Tier 3: Bangladesh IIG Gateways
  { id: 'BD-BSCCL', name: 'BSCCL (Submarine Cable Co.)', asn: 'AS24389', location: 'Cox’s Bazar / Dhaka', tier: 'BANGLADESH_IIG', color: '#14b8a6', peers: 142, capacityTbps: 5.4, prefixesV4: 18450, latencyMs: 15, details: 'Primary National Gateway Operator (SMW4 & SMW5 Cable Owner)', upstreams: ['Hurricane Electric (AS6939)', 'Tata (AS6453)', 'NTT (AS2914)'] },
  { id: 'BD-SUMMIT', name: 'Summit Communications IIG', asn: 'AS58410', location: 'Dhaka, BD', tier: 'BANGLADESH_IIG', color: '#38bdf8', peers: 118, capacityTbps: 3.8, prefixesV4: 14200, latencyMs: 16, details: 'Terrestrial ITC & Subsea Multi-homed IIG Gateway', upstreams: ['Hurricane Electric (AS6939)', 'Tata (AS6453)', 'Singtel (AS7473)'] },
  { id: 'BD-FIBER', name: 'Fiber@Home IIG Network', asn: 'AS17498', location: 'Dhaka, BD', tier: 'BANGLADESH_IIG', color: '#14b8a6', peers: 104, capacityTbps: 3.2, prefixesV4: 12850, latencyMs: 16, details: 'Nationwide Optical Fiber Mesh & Multi-homed IIG Node', upstreams: ['Hurricane Electric (AS6939)', 'NTT (AS2914)'] },
  { id: 'BD-MANGO', name: 'Mango Teleservices IIG', asn: 'AS9230', location: 'Dhaka, BD', tier: 'BANGLADESH_IIG', color: '#a855f7', peers: 76, capacityTbps: 1.9, prefixesV4: 8900, latencyMs: 18, details: 'ITC Benapole & Regional Gateway Hub', upstreams: ['Hurricane Electric (AS6939)', 'Tata (AS6453)'] },
  { id: 'BD-NOVO', name: 'Novocom Services IIG', asn: 'AS45168', location: 'Dhaka, BD', tier: 'BANGLADESH_IIG', color: '#67caae', peers: 62, capacityTbps: 1.4, prefixesV4: 7200, latencyMs: 17, details: 'Dhaka Ring Metro Gateway & ISP Aggregator', upstreams: ['Hurricane Electric (AS6939)', 'Telia (AS1299)'] },

  // Tier 4: National Exchange & Edge
  { id: 'BD-BDIX', name: 'BDIX National IXP', asn: 'BDIX-IXP', location: 'Dhaka, BD', tier: 'NATIONAL_IXP', color: '#6366f1', peers: 520, capacityTbps: 1.2, prefixesV4: 24500, latencyMs: 3, details: 'Bangladesh National Internet Exchange Point (500+ Peers)' },
];

export default function HE3DGlobeScene({ bgpReports }: { bgpReports: IIGBGPReport[] }) {
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(BGP_NETWORK_NODES[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredNodes = useMemo(() => {
    return BGP_NETWORK_NODES.filter((node) => {
      const matchesTier = selectedTier === 'ALL' || node.tier === selectedTier;
      const matchesSearch =
        !searchQuery.trim() ||
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.asn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTier && matchesSearch;
    });
  }, [selectedTier, searchQuery]);

  const globalTier1Nodes = useMemo(() => BGP_NETWORK_NODES.filter((n) => n.tier === 'GLOBAL_TIER1'), []);
  const subseaNodes = useMemo(() => BGP_NETWORK_NODES.filter((n) => n.tier === 'SUBSEA_LANDING'), []);
  const iigNodes = useMemo(() => BGP_NETWORK_NODES.filter((n) => n.tier === 'BANGLADESH_IIG'), []);
  const ixpNodes = useMemo(() => BGP_NETWORK_NODES.filter((n) => n.tier === 'NATIONAL_IXP'), []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        background: 'var(--card)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        padding: '24px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header & Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ background: '#f59e0b20', color: '#f59e0b', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Network size={14} /> HURRICANE ELECTRIC BGP TOPOLOGY MATRIX
            </span>
            <span style={{ background: '#10b98120', color: '#10b981', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
              LIVE TELEMETRY FLOW
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
            Global BGP Autonomous System Peering & Subsea Bandwidth Architecture
          </h2>
        </div>

        {/* Tier Filter Tabs & Search */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--subtle)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0 10px', width: '220px' }}>
            <Search size={14} color="var(--muted-foreground)" style={{ marginRight: '6px' }} />
            <input
              type="text"
              placeholder="Filter ASN, City, Cable..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'var(--foreground)', fontSize: '12px', width: '100%', outline: 'none', padding: '6px 0' }}
            />
          </div>

          {[
            ['ALL', 'All Tiers'],
            ['GLOBAL_TIER1', 'Tier-1 Core'],
            ['SUBSEA_LANDING', 'Subsea Cables'],
            ['BANGLADESH_IIG', 'BD IIG Gateways'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedTier(key)}
              style={{
                background: selectedTier === key ? 'var(--primary)' : 'var(--subtle)',
                color: selectedTier === key ? '#fff' : 'var(--muted-foreground)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* TOPOLOGY FLOW MAP GRAPH (4-TIER FLOW PIPELINE) */}
      <div
        style={{
          position: 'relative',
          padding: '24px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(7,11,18,0.98))',
          border: '1px solid var(--border)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '20px',
        }}
      >
        {/* TIER 1: GLOBAL TIER-1 CORE HUBS */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', borderBottom: '1px solid rgba(245, 158, 11, 0.3)', paddingBottom: '8px' }}>
            <Server size={16} color="#f59e0b" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
              1. Global Tier-1 Backbone
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {globalTier1Nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '12px', color: node.color }}>{node.asn}</strong>
                    <span style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>{node.latencyMs}ms</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 650, color: '#fff' }}>{node.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '6px', color: 'var(--muted-foreground)' }}>
                    <span>{node.location}</span>
                    <strong style={{ color: '#56c4ac' }}>{node.peers.toLocaleString()} Peers</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TIER 2: SUBSEA LANDINGS & ITC CROSSINGS */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', borderBottom: '1px solid rgba(16, 185, 129, 0.3)', paddingBottom: '8px' }}>
            <Anchor size={16} color="#10b981" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
              2. Subsea & ITC Landings
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {subseaNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '12px', color: node.color }}>{node.asn}</strong>
                    <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }}>{node.capacityTbps} Tbps</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 650, color: '#fff' }}>{node.name}</div>
                  <div style={{ fontSize: '11px', marginTop: '6px', color: 'var(--muted-foreground)' }}>{node.location}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TIER 3: BANGLADESH IIG GATEWAYS */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', borderBottom: '1px solid rgba(56, 189, 248, 0.3)', paddingBottom: '8px' }}>
            <Zap size={16} color="#38bdf8" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
              3. BD IIG Autonomous Systems
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {iigNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '12px', color: node.color }}>{node.asn}</strong>
                    <span style={{ fontSize: '10px', color: '#56c4ac', fontWeight: 700 }}>{node.capacityTbps} Tbps</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 650, color: '#fff' }}>{node.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '6px', color: 'var(--muted-foreground)' }}>
                    <span>{node.peers} Peers</span>
                    <strong style={{ color: '#ac9af2' }}>{node.prefixesV4.toLocaleString()} Routes</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TIER 4: NATIONAL IXP & EDGE DISTRIBUTION */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', borderBottom: '1px solid rgba(99, 102, 241, 0.3)', paddingBottom: '8px' }}>
            <Building2 size={16} color="#6366f1" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase' }}>
              4. IXP & End User Edge
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ixpNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '12px', color: node.color }}>{node.asn}</strong>
                    <span style={{ fontSize: '10px', color: '#6366f1', fontWeight: 700 }}>{node.latencyMs}ms Latency</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 650, color: '#fff' }}>{node.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '6px', color: 'var(--muted-foreground)' }}>
                    <span>{node.location}</span>
                    <strong style={{ color: '#6366f1' }}>{node.peers} Peering ASNs</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SELECTED NODE TELEMETRY INSPECTOR */}
      {selectedNode && (
        <div
          style={{
            padding: '20px',
            borderRadius: '12px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid var(--border)',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: selectedNode.color, textTransform: 'uppercase' }}>
                ● {selectedNode.tier.replace('_', ' ')}
              </span>
              <strong style={{ fontSize: '16px', color: '#ecb663' }}>{selectedNode.asn}</strong>
              <span style={{ fontSize: '13px', color: '#fff', fontWeight: 650 }}>{selectedNode.name}</span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted-foreground)' }}>
              {selectedNode.location} · {selectedNode.details}
            </p>

            {selectedNode.upstreams && (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '8px', fontSize: '11px' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Tier-1 Upstreams:</span>
                {selectedNode.upstreams.map((u) => (
                  <span key={u} style={{ background: 'rgba(236, 182, 99, 0.12)', border: '1px solid rgba(236, 182, 99, 0.3)', color: '#ecb663', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                    {u}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ padding: '8px 14px', borderRadius: '8px', background: 'var(--subtle)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--muted-foreground)', display: 'block' }}>TOTAL PEERS</span>
              <strong style={{ fontSize: '16px', color: '#56c4ac' }}>{selectedNode.peers.toLocaleString()}</strong>
            </div>
            <div style={{ padding: '8px 14px', borderRadius: '8px', background: 'var(--subtle)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--muted-foreground)', display: 'block' }}>CAPACITY</span>
              <strong style={{ fontSize: '16px', color: '#62baf4' }}>{selectedNode.capacityTbps} Tbps</strong>
            </div>

            <a
              href={`https://bgp.he.net/${selectedNode.asn}`}
              target="_blank"
              rel="noreferrer"
              className="primary-button"
              style={{ fontSize: '12px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>View bgp.he.net</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
