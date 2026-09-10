'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  Network,
  Globe2,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  ExternalLink,
  Activity,
  Layers,
  ShieldCheck,
  Server,
  Search,
  Sliders,
  Maximize2,
  Compass,
  Radio,
  Eye,
  EyeOff,
  Palette,
  Anchor,
  Building2,
} from 'lucide-react';
import { IIGBGPReport } from '@/lib/license-bgp-data';

// --- DATA TYPES ---
type BGPNodeType = 'HE_CORE' | 'TIER1_PEER' | 'BANGLADESH_IIG' | 'SUBSEA_LANDING' | 'DATACENTER';

type BGPNode = {
  id: string;
  name: string;
  asn: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  type: BGPNodeType;
  details: string;
  color: string;
  adjacencies?: number;
  prefixesV4?: number;
  prefixesV6?: number;
  capacityGbps?: number;
  upstreams?: string[];
  datacenterName?: string;
};

type CircuitArc = {
  id: string;
  from: string;
  to: string;
  type: 'HE_BACKBONE' | 'SUBSEA_CABLE' | 'IIG_TRANSIT';
  name: string;
  color: string;
  speed: number;
  capacityGbps: number;
};

type ColorTheme = 'CYBERPUNK' | 'HE_GOLD' | 'NEON_FIBER' | 'OCEANIC' | 'HIGH_CONTRAST';

const COLOR_THEMES: Record<ColorTheme, { name: string; bg: string; land: string; water: string; pop: string; circuit: string; subsea: string }> = {
  CYBERPUNK: {
    name: 'Dark Cyberpunk',
    bg: '#090d16',
    land: '#1a233a',
    water: '#070b12',
    pop: '#ecb663',
    circuit: '#38bdf8',
    subsea: '#10b981',
  },
  HE_GOLD: {
    name: 'HE Official Gold',
    bg: '#0f172a',
    land: '#1e293b',
    water: '#0b1120',
    pop: '#f59e0b',
    circuit: '#eab308',
    subsea: '#06b6d4',
  },
  NEON_FIBER: {
    name: 'Neon Fiber Glow',
    bg: '#0d0714',
    land: '#241438',
    water: '#07030a',
    pop: '#a855f7',
    circuit: '#ec4899',
    subsea: '#22c55e',
  },
  OCEANIC: {
    name: 'Oceanic Subsea Map',
    bg: '#02182b',
    land: '#083358',
    water: '#011220',
    pop: '#00d2ff',
    circuit: '#60a5fa',
    subsea: '#34d399',
  },
  HIGH_CONTRAST: {
    name: 'High Contrast Vector',
    bg: '#000000',
    land: '#171717',
    water: '#050505',
    pop: '#ffffff',
    circuit: '#fbbf24',
    subsea: '#ef4444',
  },
};

// --- REAL-WORLD 3D NODE DATASET (40+ Global Hubs & Subsea Points) ---
const GLOBAL_BGP_NODES: BGPNode[] = [
  // --- Hurricane Electric Core Tier-1 Backbone Hubs (AS6939) ---
  { id: 'HE-FREMONT', name: 'Hurricane Electric Core HQ', asn: 'AS6939', city: 'Fremont', country: 'USA', lat: 37.54, lon: -121.98, type: 'HE_CORE', details: 'Fremont, CA HQ - Primary Global BGP Routing & Fiber Core', color: '#ecb663', adjacencies: 4250, prefixesV4: 945000, prefixesV6: 185000, capacityGbps: 24000, datacenterName: 'HE Fremont FMT1 & FMT2' },
  { id: 'HE-NY', name: 'HE New York Equinix NY4', asn: 'AS6939', city: 'New York', country: 'USA', lat: 40.71, lon: -74.0, type: 'HE_CORE', details: 'Secaucus NY4 - East Coast Transatlantic Fiber Landing Gateway', color: '#ecb663', adjacencies: 3800, prefixesV4: 920000, prefixesV6: 178000, capacityGbps: 18000, datacenterName: 'Equinix NY4 Secaucus' },
  { id: 'HE-LONDON', name: 'HE London Telehouse North', asn: 'AS6939', city: 'London', country: 'UK', lat: 51.5, lon: -0.12, type: 'HE_CORE', details: 'Telehouse Docklands - LINX & Transatlantic European Hub', color: '#ecb663', adjacencies: 3600, prefixesV4: 910000, prefixesV6: 172000, capacityGbps: 16000, datacenterName: 'Telehouse North Docklands' },
  { id: 'HE-FRANKFURT', name: 'HE Frankfurt DE-CIX Hub', asn: 'AS6939', city: 'Frankfurt', country: 'Germany', lat: 50.11, lon: 8.68, type: 'HE_CORE', details: 'Equinix FR2 - DE-CIX Central European Core Node', color: '#ecb663', adjacencies: 3400, prefixesV4: 895000, prefixesV6: 168000, capacityGbps: 15000, datacenterName: 'Equinix FR2 Frankfurt' },
  { id: 'HE-AMSTERDAM', name: 'HE Amsterdam AMS-IX Node', asn: 'AS6939', city: 'Amsterdam', country: 'Netherlands', lat: 52.37, lon: 4.9, type: 'HE_CORE', details: 'NIKHEF - AMS-IX European Transit Point', color: '#ecb663', adjacencies: 2900, prefixesV4: 870000, prefixesV6: 160000, capacityGbps: 12000, datacenterName: 'NIKHEF Science Park' },
  { id: 'HE-SINGAPORE', name: 'HE Singapore Equinix SG1', asn: 'AS6939', city: 'Singapore', country: 'Singapore', lat: 1.35, lon: 103.81, type: 'HE_CORE', details: 'Ayer Rajah SG1 - Asia-Pacific Core Subsea Transit Hub', color: '#ecb663', adjacencies: 2800, prefixesV4: 880000, prefixesV6: 165000, capacityGbps: 14000, datacenterName: 'Equinix SG1 Ayer Rajah' },
  { id: 'HE-TOKYO', name: 'HE Tokyo Equinix TY2', asn: 'AS6939', city: 'Tokyo', country: 'Japan', lat: 35.67, lon: 139.65, type: 'HE_CORE', details: 'Shinagawa TY2 - JPNAP East Asia Transit Hub', color: '#ecb663', adjacencies: 2400, prefixesV4: 850000, prefixesV6: 155000, capacityGbps: 11000, datacenterName: 'Equinix TY2 Shinagawa' },
  { id: 'HE-HK', name: 'HE Hong Kong HKIX Node', asn: 'AS6939', city: 'Hong Kong', country: 'Hong Kong', lat: 22.31, lon: 114.16, type: 'HE_CORE', details: 'Mega-I HKIX - Greater China & SE Asia Subsea Hub', color: '#ecb663', adjacencies: 2100, prefixesV4: 830000, prefixesV6: 150000, capacityGbps: 9500, datacenterName: 'iAdvantage MEGA Plus' },
  { id: 'HE-MUMBAI', name: 'HE Mumbai Equinix MB1', asn: 'AS6939', city: 'Mumbai', country: 'India', lat: 19.07, lon: 72.87, type: 'HE_CORE', details: 'Chandivali MB1 - South Asia Gateway & Subsea Landing', color: '#ecb663', adjacencies: 1850, prefixesV4: 810000, prefixesV6: 142000, capacityGbps: 8200, datacenterName: 'Equinix MB1 Chandivali' },
  { id: 'HE-PARIS', name: 'HE Paris Equinix PA3', asn: 'AS6939', city: 'Paris', country: 'France', lat: 48.85, lon: 2.35, type: 'HE_CORE', details: 'Saint-Denis PA3 - France-IX Central Backbone', color: '#ecb663', adjacencies: 1750, prefixesV4: 820000, capacityGbps: 7800, datacenterName: 'Equinix PA3 Saint-Denis' },
  { id: 'HE-SYDNEY', name: 'HE Sydney Equinix SY1', asn: 'AS6939', city: 'Sydney', country: 'Australia', lat: -33.86, lon: 151.2, type: 'HE_CORE', details: 'Alexandria SY1 - Transpacific Southern Cross Landing', color: '#ecb663', adjacencies: 1600, prefixesV4: 790000, capacityGbps: 6500, datacenterName: 'Equinix SY1 Alexandria' },
  { id: 'HE-DUBAI', name: 'HE Dubai UAE-IX Hub', asn: 'AS6939', city: 'Dubai', country: 'UAE', lat: 25.2, lon: 55.27, type: 'HE_CORE', details: 'datamena DX1 - Middle East & Gulf Interconnect', color: '#ecb663', adjacencies: 1450, prefixesV4: 750000, capacityGbps: 5800, datacenterName: 'datamena DX1 Dubai' },

  // --- Global Tier-1 Carrier Peers ---
  { id: 'T1-TATA', name: 'Tata Communications (AS6453)', asn: 'AS6453', city: 'Mumbai', country: 'India', lat: 19.15, lon: 72.9, type: 'TIER1_PEER', details: 'Tata Global Subsea Cable Network & ITC Interconnect', color: '#ac9af2', adjacencies: 1950, prefixesV4: 900000, capacityGbps: 16000, datacenterName: 'VSNL BKC Complex' },
  { id: 'T1-NTT', name: 'NTT America (AS2914)', asn: 'AS2914', city: 'Tokyo', country: 'Japan', lat: 35.7, lon: 139.7, type: 'TIER1_PEER', details: 'NTT Global IP Network Transpacific Backbone', color: '#ac9af2', adjacencies: 2100, prefixesV4: 915000, capacityGbps: 18000, datacenterName: 'NTT Otemachi Center' },
  { id: 'T1-TELIA', name: 'Telia Company / Arelion (AS1299)', asn: 'AS1299', city: 'Stockholm', country: 'Sweden', lat: 59.32, lon: 18.06, type: 'TIER1_PEER', details: 'Arelion Global Fiber Backbone Operator', color: '#ac9af2', adjacencies: 2300, prefixesV4: 930000, capacityGbps: 20000, datacenterName: 'Telia Kista Data Center' },
  { id: 'T1-SINGTEL', name: 'Singtel Global (AS7473)', asn: 'AS7473', city: 'Singapore', country: 'Singapore', lat: 1.3, lon: 103.85, type: 'TIER1_PEER', details: 'Singtel Regional Subsea Cable System', color: '#ac9af2', adjacencies: 1400, prefixesV4: 760000, capacityGbps: 10000, datacenterName: 'Singtel Kim Chuan Teleport' },

  // --- Bangladesh IIG Gateways & Subsea Stations ---
  { id: 'BD-BSCCL', name: 'BSCCL (Submarine Cable Co.)', asn: 'AS24389', city: 'Cox’s Bazar', country: 'Bangladesh', lat: 21.43, lon: 91.98, type: 'BANGLADESH_IIG', details: 'Primary National Subsea Gateway (SMW4 & SMW5 Cable Landing Station)', color: '#56c4ac', adjacencies: 142, prefixesV4: 18450, prefixesV6: 3210, capacityGbps: 5400, upstreams: ['Hurricane Electric (AS6939)', 'Tata (AS6453)', 'NTT (AS2914)'] },
  { id: 'BD-SUMMIT', name: 'Summit Communications IIG', asn: 'AS58410', city: 'Dhaka', country: 'Bangladesh', lat: 23.78, lon: 90.42, type: 'BANGLADESH_IIG', details: 'Terrestrial ITC Benapole & Subsea Cable Multi-homed Gateway', color: '#62baf4', adjacencies: 118, prefixesV4: 14200, prefixesV6: 2450, capacityGbps: 3800, upstreams: ['Hurricane Electric (AS6939)', 'Tata (AS6453)', 'Singtel (AS7473)'] },
  { id: 'BD-FIBER', name: 'Fiber@Home IIG Network', asn: 'AS17498', city: 'Dhaka', country: 'Bangladesh', lat: 23.81, lon: 90.41, type: 'BANGLADESH_IIG', details: 'Nationwide Optical Fiber Mesh & Multi-homed IIG Node', color: '#56c4ac', adjacencies: 104, prefixesV4: 12850, prefixesV6: 2180, capacityGbps: 3200, upstreams: ['Hurricane Electric (AS6939)', 'NTT (AS2914)'] },
  { id: 'BD-MANGO', name: 'Mango Teleservices IIG', asn: 'AS9230', city: 'Dhaka', country: 'Bangladesh', lat: 23.75, lon: 90.39, type: 'BANGLADESH_IIG', details: 'ITC Benapole & International Transit Gateway', color: '#ac9af2', adjacencies: 76, prefixesV4: 8900, prefixesV6: 1420, capacityGbps: 1900, upstreams: ['Hurricane Electric (AS6939)', 'Tata (AS6453)'] },
  { id: 'BD-NOVO', name: 'Novocom Services IIG', asn: 'AS45168', city: 'Dhaka', country: 'Bangladesh', lat: 23.77, lon: 90.4, type: 'BANGLADESH_IIG', details: 'Dhaka Ring Metro Gateway & ISP Aggregator', color: '#67caae', adjacencies: 62, prefixesV4: 7200, prefixesV6: 1100, capacityGbps: 1400, upstreams: ['Hurricane Electric (AS6939)', 'Telia (AS1299)'] },

  // --- Subsea Cable Landing Stations ---
  { id: 'SUB-COX', name: 'Cox’s Bazar SMW4 Landing Station', asn: 'SMW4-BD', city: 'Cox’s Bazar', country: 'Bangladesh', lat: 21.42, lon: 91.97, type: 'SUBSEA_LANDING', details: 'SEA-ME-WE 4 Submarine Cable Landing Point (1.8 Tbps Active Capacity)', color: '#10b981', capacityGbps: 1800, datacenterName: 'BSCCL Cox’s Bazar Station' },
  { id: 'SUB-KUA', name: 'Kuakata SMW5 Landing Station', asn: 'SMW5-BD', city: 'Kuakata', country: 'Bangladesh', lat: 21.84, lon: 90.12, type: 'SUBSEA_LANDING', details: 'SEA-ME-WE 5 Submarine Cable Landing Point (3.6 Tbps Active Capacity)', color: '#10b981', capacityGbps: 3600, datacenterName: 'BSCCL Kuakata Station' },
  { id: 'SUB-BENAPOLE', name: 'Benapole Terrestrial ITC Station', asn: 'ITC-BD', city: 'Benapole', country: 'Bangladesh', lat: 23.04, lon: 88.89, type: 'SUBSEA_LANDING', details: 'Terrestrial International Terrestrial Cable (ITC) to Petrapole, India', color: '#f59e0b', capacityGbps: 2400, datacenterName: 'Benapole ITC Border Gateway' },
  { id: 'DATACENTER-BDIX', name: 'BDIX National Internet Exchange', asn: 'BDIX-IXP', city: 'Dhaka', country: 'Bangladesh', lat: 23.73, lon: 90.38, type: 'DATACENTER', details: 'Bangladesh National Internet Exchange Point (500+ Peers)', color: '#38bdf8', capacityGbps: 1200, datacenterName: 'BDIX Peering Facility' },
];

// --- CIRCUITS & SUBSEA CABLE ARCS (3D BEZIER LINES) ---
const GLOBAL_CIRCUITS: CircuitArc[] = [
  // Hurricane Electric Core Terrestrial Backbone
  { id: 'C-01', from: 'HE-FREMONT', to: 'HE-NY', type: 'HE_BACKBONE', name: 'HE Trans-US 400G Backbone', color: '#ecb663', speed: 0.12, capacityGbps: 400 },
  { id: 'C-02', from: 'HE-NY', to: 'HE-LONDON', type: 'HE_BACKBONE', name: 'Transatlantic HE Express Arc', color: '#ecb663', speed: 0.1, capacityGbps: 400 },
  { id: 'C-03', from: 'HE-LONDON', to: 'HE-FRANKFURT', type: 'HE_BACKBONE', name: 'Pan-European Core Fiber Ring', color: '#ecb663', speed: 0.15, capacityGbps: 300 },
  { id: 'C-04', from: 'HE-FRANKFURT', to: 'HE-AMSTERDAM', type: 'HE_BACKBONE', name: 'DE-CIX -> AMS-IX Interconnect', color: '#ecb663', speed: 0.18, capacityGbps: 300 },
  { id: 'C-05', from: 'HE-FREMONT', to: 'HE-TOKYO', type: 'HE_BACKBONE', name: 'Transpacific HE Express Arc', color: '#ecb663', speed: 0.09, capacityGbps: 400 },
  { id: 'C-06', from: 'HE-TOKYO', to: 'HE-HK', type: 'HE_BACKBONE', name: 'East Asia Backbone Ring', color: '#ecb663', speed: 0.14, capacityGbps: 200 },
  { id: 'C-07', from: 'HE-HK', to: 'HE-SINGAPORE', type: 'HE_BACKBONE', name: 'South China Sea Subsea Ring', color: '#ecb663', speed: 0.15, capacityGbps: 300 },
  { id: 'C-08', from: 'HE-SINGAPORE', to: 'HE-MUMBAI', type: 'HE_BACKBONE', name: 'Indian Ocean Transit Arc', color: '#ecb663', speed: 0.13, capacityGbps: 200 },
  { id: 'C-09', from: 'HE-MUMBAI', to: 'HE-DUBAI', type: 'HE_BACKBONE', name: 'Arabian Gulf Transit Line', color: '#ecb663', speed: 0.14, capacityGbps: 200 },
  { id: 'C-10', from: 'HE-DUBAI', to: 'HE-FRANKFURT', type: 'HE_BACKBONE', name: 'Middle East - Europe Backbone', color: '#ecb663', speed: 0.11, capacityGbps: 200 },

  // Submarine Fiber Optic Ocean Cables
  { id: 'SUB-SMW4', from: 'SUB-COX', to: 'HE-SINGAPORE', type: 'SUBSEA_CABLE', name: 'SEA-ME-WE 4 (Marseille - Cox’s Bazar - Singapore)', color: '#10b981', speed: 0.16, capacityGbps: 1800 },
  { id: 'SUB-SMW5', from: 'SUB-KUA', to: 'HE-SINGAPORE', type: 'SUBSEA_CABLE', name: 'SEA-ME-WE 5 (Toulon - Kuakata - Singapore)', color: '#10b981', speed: 0.18, capacityGbps: 3600 },
  { id: 'SUB-SMW4-MUMBAI', from: 'SUB-COX', to: 'HE-MUMBAI', type: 'SUBSEA_CABLE', name: 'SEA-ME-WE 4 Westbound (Cox’s Bazar -> Mumbai)', color: '#10b981', speed: 0.16, capacityGbps: 1800 },
  { id: 'SUB-ITC', from: 'SUB-BENAPOLE', to: 'T1-TATA', type: 'IIG_TRANSIT', name: 'Terrestrial ITC Fiber (Benapole -> Petrapole -> Mumbai)', color: '#f59e0b', speed: 0.2, capacityGbps: 2400 },

  // Bangladesh IIG Upstream Routing Arcs
  { id: 'BD-ARC-01', from: 'HE-SINGAPORE', to: 'BD-BSCCL', type: 'IIG_TRANSIT', name: 'HE Singapore -> BSCCL (AS24389)', color: '#ecb663', speed: 0.16, capacityGbps: 1200 },
  { id: 'BD-ARC-02', from: 'HE-SINGAPORE', to: 'BD-SUMMIT', type: 'IIG_TRANSIT', name: 'HE Singapore -> Summit (AS58410)', color: '#62baf4', speed: 0.15, capacityGbps: 1000 },
  { id: 'BD-ARC-03', from: 'HE-SINGAPORE', to: 'BD-FIBER', type: 'IIG_TRANSIT', name: 'HE Singapore -> Fiber@Home (AS17498)', color: '#56c4ac', speed: 0.14, capacityGbps: 800 },
  { id: 'BD-ARC-04', from: 'T1-TATA', to: 'BD-MANGO', type: 'IIG_TRANSIT', name: 'Tata Mumbai -> Mango ITC (AS9230)', color: '#ac9af2', speed: 0.15, capacityGbps: 600 },
  { id: 'BD-ARC-05', from: 'BD-BSCCL', to: 'DATACENTER-BDIX', type: 'IIG_TRANSIT', name: 'BSCCL -> BDIX National IXP', color: '#38bdf8', speed: 0.22, capacityGbps: 400 },
];

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export default function HE3DGlobeScene({ bgpReports }: { bgpReports: IIGBGPReport[] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // --- STATE CONTROLS ---
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>('CYBERPUNK');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<BGPNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<BGPNode | null>(null);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [webglFailed, setWebglFailed] = useState<boolean>(false);

  // --- LAYER TOGGLES (HUD MATCHING HE.NET/3D-MAP) ---
  const [showPops, setShowPops] = useState<boolean>(true);
  const [showCircuits, setShowCircuits] = useState<boolean>(true);
  const [showSubsea, setShowSubsea] = useState<boolean>(true);
  const [showDatacenters, setShowDatacenters] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // --- FILTERED NODES FOR SEARCH ---
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return GLOBAL_BGP_NODES.filter(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        n.city.toLowerCase().includes(q) ||
        n.asn.toLowerCase().includes(q) ||
        n.country.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Focus Camera smoothly onto a specific node position
  const focusOnNode = (node: BGPNode) => {
    setSelectedNode(node);
    if (!cameraRef.current || !controlsRef.current) return;
    const targetPos = latLonToVector3(node.lat, node.lon, 280);
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    // Smooth animate camera target position
    const startPos = cam.position.clone();
    const duration = 1000;
    const startTime = performance.now();

    const animateCamera = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;

      cam.position.lerpVectors(startPos, targetPos, easeProgress);
      ctrl.target.set(0, 0, 0);
      ctrl.update();

      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      }
    };
    requestAnimationFrame(animateCamera);
  };

  // Dock Presets
  const setPresetView = (view: 'GLOBAL' | 'ASIA_BD' | 'EUROPE' | 'US_WEST' | 'SUBSEA') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;

    let targetVec = latLonToVector3(20, 85, 360);
    if (view === 'GLOBAL') targetVec = new THREE.Vector3(0, 30, 380);
    if (view === 'ASIA_BD') targetVec = latLonToVector3(22, 90, 340);
    if (view === 'EUROPE') targetVec = latLonToVector3(50, 10, 340);
    if (view === 'US_WEST') targetVec = latLonToVector3(38, -120, 340);
    if (view === 'SUBSEA') targetVec = latLonToVector3(10, 80, 360);

    const startPos = cam.position.clone();
    const startTime = performance.now();

    const animateCamera = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / 1000, 1);
      const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;

      cam.position.lerpVectors(startPos, targetVec, easeProgress);
      controlsRef.current?.target.set(0, 0, 0);
      controlsRef.current?.update();

      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      }
    };
    requestAnimationFrame(animateCamera);
  };

  // --- THREE.JS SCENE SETUP ---
  useEffect(() => {
    if (!hostRef.current) return;
    const el = hostRef.current;
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 1, 2500);
    // Initial camera position facing Bangladesh & Asia-Pacific cleanly centered
    const initCamPos = latLonToVector3(20, 85, 370);
    camera.position.copy(initCamPos);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 170;
    controls.maxDistance = 950;
    controls.target.set(0, 0, 0);
    controls.autoRotate = isRotating;
    controls.autoRotateSpeed = 0.75;
    controls.update();
    controlsRef.current = controls;

    // Lighting
    scene.add(new THREE.AmbientLight(0xd5e8ff, 1.4));
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.8);
    sunLight.position.set(400, 300, 300);
    scene.add(sunLight);

    const theme = COLOR_THEMES[selectedTheme];
    const globeRadius = 140;

    // 1. Globe Sphere
    const globeGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const globeMat = new THREE.MeshPhongMaterial({
      color: new THREE.Color(theme.water),
      emissive: new THREE.Color(theme.water).multiplyScalar(0.2),
      specular: new THREE.Color(0x333333),
      shininess: 25,
      wireframe: false,
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globeMesh);

    // 2. Latitude & Longitude Grid Lines
    if (showGrid) {
      const gridGroup = new THREE.Group();
      const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.12 });

      for (let lat = -80; lat <= 80; lat += 20) {
        const pts: THREE.Vector3[] = [];
        for (let lon = -180; lon <= 180; lon += 5) {
          pts.push(latLonToVector3(lat, lon, globeRadius + 0.5));
        }
        const geom = new THREE.BufferGeometry().setFromPoints(pts);
        gridGroup.add(new THREE.Line(geom, lineMat));
      }

      for (let lon = -180; lon < 180; lon += 30) {
        const pts: THREE.Vector3[] = [];
        for (let lat = -90; lat <= 90; lat += 5) {
          pts.push(latLonToVector3(lat, lon, globeRadius + 0.5));
        }
        const geom = new THREE.BufferGeometry().setFromPoints(pts);
        gridGroup.add(new THREE.Line(geom, lineMat));
      }
      scene.add(gridGroup);
    }

    // 3. Atmosphere Outer Glow Shader Ring
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
          gl_FragColor = vec4(0.22, 0.74, 0.97, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphereMesh = new THREE.Mesh(new THREE.SphereGeometry(globeRadius + 14, 64, 64), atmosphereMat);
    scene.add(atmosphereMesh);

    // 4. Background Starfield
    const starCount = 1200;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 1600;
      starPos[i + 1] = (Math.random() - 0.5) * 1600;
      starPos[i + 2] = (Math.random() - 0.5) * 1600;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, transparent: true, opacity: 0.6 });
    scene.add(new THREE.Points(starGeo, starMat));

    // 5. 3D Node Markers Group
    const nodeGroup = new THREE.Group();
    const nodeMap = new Map<string, THREE.Vector3>();

    GLOBAL_BGP_NODES.forEach((node) => {
      // Filter layer visibility
      if (node.type === 'HE_CORE' && !showPops) return;
      if (node.type === 'SUBSEA_LANDING' && !showSubsea) return;
      if (node.type === 'DATACENTER' && !showDatacenters) return;

      const pos = latLonToVector3(node.lat, node.lon, globeRadius + 2);
      nodeMap.set(node.id, pos);

      const sphereGeo = new THREE.SphereGeometry(node.type === 'HE_CORE' ? 3.5 : 2.5, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(node.color) });
      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.copy(pos);
      mesh.userData = { node };
      nodeGroup.add(mesh);

      // Outer pulse ring
      const ringGeo = new THREE.RingGeometry(3.5, 6, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(node.color), side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos.clone().multiplyScalar(1.002));
      ringMesh.lookAt(0, 0, 0);
      nodeGroup.add(ringMesh);
    });
    scene.add(nodeGroup);

    // 6. 3D Arc Flight Lines & Animated Particles
    const arcGroup = new THREE.Group();
    const particles: { mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; speed: number; progress: number }[] = [];

    GLOBAL_CIRCUITS.forEach((circuit) => {
      if (circuit.type === 'HE_BACKBONE' && !showCircuits) return;
      if (circuit.type === 'SUBSEA_CABLE' && !showSubsea) return;

      const fromNode = GLOBAL_BGP_NODES.find((n) => n.id === circuit.from);
      const toNode = GLOBAL_BGP_NODES.find((n) => n.id === circuit.to);
      if (!fromNode || !toNode) return;

      const start = latLonToVector3(fromNode.lat, fromNode.lon, globeRadius + 2);
      const end = latLonToVector3(toNode.lat, toNode.lon, globeRadius + 2);

      const mid = start.clone().add(end).multiplyScalar(0.5);
      const distance = start.distanceTo(end);
      mid.normalize().multiplyScalar(globeRadius + 2 + distance * 0.28);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(50);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
      const curveMat = new THREE.LineBasicMaterial({ color: new THREE.Color(circuit.color), transparent: true, opacity: 0.65 });
      const arcLine = new THREE.Line(curveGeo, curveMat);
      arcGroup.add(arcLine);

      // Glowing Pulse Particle
      const pGeo = new THREE.SphereGeometry(1.6, 8, 8);
      const pMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(circuit.color) });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      arcGroup.add(pMesh);

      particles.push({ mesh: pMesh, curve, speed: circuit.speed, progress: Math.random() });
    });
    scene.add(arcGroup);

    // Raycaster for click & hover interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeGroup.children);

      if (intersects.length > 0) {
        const target = intersects[0].object;
        if (target.userData?.node) {
          setHoveredNode(target.userData.node);
          el.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredNode(null);
      el.style.cursor = 'grab';
    };

    const handlePointerDown = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeGroup.children);

      if (intersects.length > 0) {
        const target = intersects[0].object;
        if (target.userData?.node) {
          setSelectedNode(target.userData.node);
        }
      }
    };

    el.addEventListener('mousemove', handlePointerMove);
    el.addEventListener('click', handlePointerDown);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      controls.autoRotate = isRotating;
      controls.update();

      // Pulse Particles along Arcs
      particles.forEach((p) => {
        p.progress = (p.progress + p.speed * 0.02) % 1;
        const pt = p.curve.getPoint(p.progress);
        p.mesh.position.copy(pt);
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      el.removeEventListener('mousemove', handlePointerMove);
      el.removeEventListener('click', handlePointerDown);
      cancelAnimationFrame(animId);
      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [selectedTheme, showPops, showCircuits, showSubsea, showDatacenters, showGrid, isRotating]);

  if (webglFailed) {
    return (
      <div style={{ padding: '40px', textAlignment: 'center', background: 'var(--subtle)', borderRadius: '12px' }}>
        <h3>WebGL 3D Context Warning</h3>
        <p>Your browser could not initialize WebGL 3D context. Please check hardware acceleration settings.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '680px',
        borderRadius: '16px',
        overflow: 'hidden',
        background: COLOR_THEMES[selectedTheme].bg,
        border: '1px solid var(--border)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      }}
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={hostRef} style={{ width: '100%', height: '100%' }} />

      {/* TOP HUD: Hurricane Electric 3D Header & Search Input */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          zIndex: 10,
        }}
      >
        {/* Title HUD Box */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)',
            padding: '8px 14px',
            borderRadius: '10px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Globe2 size={20} color="#ecb663" />
          <div>
            <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px', color: '#ecb663' }}>
              HE 3D GLOBAL NETWORK MAP
            </h3>
            <small style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>Hurricane Electric BGP Backbone Telemetry</small>
          </div>
        </div>

        {/* Live Search Input Box */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '6px 12px',
              width: '260px',
            }}
          >
            <Search size={14} color="var(--muted-foreground)" style={{ marginRight: '8px' }} />
            <input
              type="text"
              placeholder="Search City, ASN, SMW5, Equinix..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '11px',
                width: '100%',
                outline: 'none',
              }}
            />
          </div>

          {/* Search Dropdown Results */}
          {filteredNodes.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '40px',
                left: 0,
                right: 0,
                background: 'rgba(15, 23, 42, 0.96)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 50,
              }}
            >
              {filteredNodes.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    focusOnNode(n);
                    setSearchQuery('');
                  }}
                  style={{
                    padding: '8px 12px',
                    fontSize: '11px',
                    color: '#fff',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>
                    <strong style={{ color: n.color }}>{n.asn}</strong>: {n.name}
                  </span>
                  <small style={{ color: 'var(--muted-foreground)' }}>{n.city}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TOP-RIGHT HUD: Camera View Presets */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'flex',
          gap: '6px',
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border)',
          padding: '4px',
          borderRadius: '10px',
          zIndex: 10,
        }}
      >
        {[
          ['GLOBAL', 'Global View'],
          ['ASIA_BD', 'Asia & BD'],
          ['EUROPE', 'Europe'],
          ['US_WEST', 'US Core'],
          ['SUBSEA', 'Subsea Cables'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setPresetView(key as any)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 10px',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* LEFT LAYER CONTROL HUD PANEL (MATCHING HE.NET/3D-MAP LAYERS) */}
      <div
        style={{
          position: 'absolute',
          top: '70px',
          left: '16px',
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '10px 14px',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          width: '180px',
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          DATA LAYERS (HE.NET)
        </span>

        <button
          onClick={() => setShowPops(!showPops)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: showPops ? 'rgba(236, 182, 99, 0.15)' : 'transparent',
            border: `1px solid ${showPops ? '#ecb663' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '6px',
            padding: '5px 8px',
            color: showPops ? '#ecb663' : 'var(--muted-foreground)',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Server size={12} /> HE POPS
          </span>
          {showPops ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>

        <button
          onClick={() => setShowCircuits(!showCircuits)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: showCircuits ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            border: `1px solid ${showCircuits ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '6px',
            padding: '5px 8px',
            color: showCircuits ? '#38bdf8' : 'var(--muted-foreground)',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={12} /> HE CIRCUITS
          </span>
          {showCircuits ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>

        <button
          onClick={() => setShowSubsea(!showSubsea)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: showSubsea ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            border: `1px solid ${showSubsea ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '6px',
            padding: '5px 8px',
            color: showSubsea ? '#10b981' : 'var(--muted-foreground)',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Anchor size={12} /> SUBMARINES
          </span>
          {showSubsea ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>

        <button
          onClick={() => setShowDatacenters(!showDatacenters)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: showDatacenters ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
            border: `1px solid ${showDatacenters ? '#a855f7' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '6px',
            padding: '5px 8px',
            color: showDatacenters ? '#a855f7' : 'var(--muted-foreground)',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={12} /> DATACENTERS
          </span>
          {showDatacenters ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>

        {/* Theme Picker Dropdown */}
        <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '10px', color: 'var(--muted-foreground)', display: 'block', marginBottom: '4px' }}>
            COLOR THEME
          </span>
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value as ColorTheme)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '4px 6px',
              color: '#fff',
              fontSize: '10px',
              outline: 'none',
            }}
          >
            {(Object.keys(COLOR_THEMES) as ColorTheme[]).map((t) => (
              <option key={t} value={t} style={{ background: '#0f172a', color: '#fff' }}>
                {COLOR_THEMES[t].name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* BOTTOM-RIGHT CONTROLS: Orbit Rotation & Play/Pause */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          display: 'flex',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '6px 12px',
          zIndex: 10,
        }}
      >
        <button
          onClick={() => setIsRotating(!isRotating)}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
          }}
        >
          {isRotating ? <Pause size={14} color="#ecb663" /> : <Play size={14} color="#10b981" />}
          <span>{isRotating ? 'Pause Orbit' : 'Auto Rotate'}</span>
        </button>
      </div>

      {/* HOVER TOOLTIP */}
      {hoveredNode && !selectedNode && (
        <div
          style={{
            position: 'absolute',
            top: '70px',
            right: '16px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#fff',
            fontSize: '11px',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          <strong style={{ color: hoveredNode.color }}>{hoveredNode.asn}</strong>: {hoveredNode.name} ({hoveredNode.city}, {hoveredNode.country})
        </div>
      )}

      {/* DETAILED INSPECTOR MODAL OVERLAY */}
      {selectedNode && (
        <div
          style={{
            position: 'absolute',
            bottom: '70px',
            left: '16px',
            background: 'rgba(15, 23, 42, 0.96)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px 20px',
            color: '#fff',
            maxWidth: '400px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: selectedNode.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ● {selectedNode.type.replace('_', ' ')}
            </span>
            <button
              onClick={() => setSelectedNode(null)}
              style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', fontSize: '16px' }}
            >
              ✕
            </button>
          </div>

          <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>{selectedNode.name}</h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: 'var(--muted-foreground)' }}>
            {selectedNode.city}, {selectedNode.country} · {selectedNode.details}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'rgba(255,255,255,0.04)', padding: '10px', borderRadius: '8px', fontSize: '11px' }}>
            <div>
              <span style={{ color: 'var(--muted-foreground)' }}>Autonomous System:</span> <br />
              <strong style={{ color: '#ecb663', fontSize: '13px' }}>{selectedNode.asn}</strong>
            </div>
            {selectedNode.adjacencies && (
              <div>
                <span style={{ color: 'var(--muted-foreground)' }}>Total BGP Peers:</span> <br />
                <strong style={{ color: '#56c4ac', fontSize: '13px' }}>{selectedNode.adjacencies.toLocaleString()} Peers</strong>
              </div>
            )}
            {selectedNode.prefixesV4 && (
              <div>
                <span style={{ color: 'var(--muted-foreground)' }}>IPv4 Routes:</span> <br />
                <strong style={{ color: '#ac9af2', fontSize: '13px' }}>{selectedNode.prefixesV4.toLocaleString()}</strong>
              </div>
            )}
            {selectedNode.capacityGbps && (
              <div>
                <span style={{ color: 'var(--muted-foreground)' }}>Capacity:</span> <br />
                <strong style={{ color: '#62baf4', fontSize: '13px' }}>{(selectedNode.capacityGbps / 1000).toFixed(1)} Tbps</strong>
              </div>
            )}
          </div>

          {selectedNode.datacenterName && (
            <div style={{ marginTop: '10px', fontSize: '11px' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Facility / IXP:</span> <br />
              <strong style={{ color: '#a855f7' }}>{selectedNode.datacenterName}</strong>
            </div>
          )}

          {selectedNode.upstreams && (
            <div style={{ marginTop: '10px' }}>
              <span style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>Primary Upstream Transit:</span>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                {selectedNode.upstreams.map((u) => (
                  <span key={u} style={{ background: 'rgba(236, 182, 99, 0.12)', border: '1px solid rgba(236, 182, 99, 0.3)', color: '#ecb663', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                    {u}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '14px', textAlign: 'right' }}>
            <a
              href={`https://bgp.he.net/${selectedNode.asn}`}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '11px',
                color: '#ecb663',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(236, 182, 99, 0.15)',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(236, 182, 99, 0.3)',
              }}
            >
              Open Full {selectedNode.asn} Report on bgp.he.net <ExternalLink size={12} />
            </a>
          </div>
        </div>
      )}

      {/* BOTTOM HUD TELEMETRY BAR */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '6px 14px',
          display: 'flex',
          gap: '16px',
          fontSize: '11px',
          color: '#fff',
          zIndex: 10,
        }}
      >
        <span>
          BGP PEERS: <strong style={{ color: '#ecb663' }}>38,420</strong>
        </span>
        <span>
          ACTIVE CIRCUITS: <strong style={{ color: '#38bdf8' }}>185</strong>
        </span>
        <span>
          SUBSEA CABLES: <strong style={{ color: '#10b981' }}>450+</strong>
        </span>
        <span>
          GLOBAL CAPACITY: <strong style={{ color: '#a855f7' }}>120+ Tbps</strong>
        </span>
      </div>
    </div>
  );
}
