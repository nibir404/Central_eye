'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Network, Globe2, Zap, Play, Pause, RotateCcw, Plus, Minus, ExternalLink, Activity, Layers, ShieldCheck, Server } from 'lucide-react';
import { IIGBGPReport } from '@/lib/license-bgp-data';

type BGPNode = {
  id: string;
  name: string;
  asn: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  type: 'HE_CORE' | 'TIER1_PEER' | 'BANGLADESH_IIG' | 'SUBSEA_LANDING' | 'IXP_HUB';
  details: string;
  color: string;
  adjacencies?: number;
  prefixesV4?: number;
  prefixesV6?: number;
  capacityGbps?: number;
  upstreams?: string[];
};

const DETAILED_BGP_NODES: BGPNode[] = [
  // --- Hurricane Electric Core Tier-1 Backbone Hubs (AS6939) ---
  { id: 'HE-01', name: 'Hurricane Electric Fremont Core', asn: 'AS6939', city: 'Fremont', country: 'USA', lat: 37.54, lon: -121.98, type: 'HE_CORE', details: 'Fremont, CA, USA Core HQ Backbone Hub', color: '#ecb663', adjacencies: 4250, prefixesV4: 945000, prefixesV6: 185000, capacityGbps: 24000 },
  { id: 'HE-02', name: 'HE New York Equinix NY4', asn: 'AS6939', city: 'New York', country: 'USA', lat: 40.71, lon: -74.0, type: 'HE_CORE', details: 'East Coast Transatlantic Gateway', color: '#ecb663', adjacencies: 3800, prefixesV4: 920000, prefixesV6: 178000, capacityGbps: 18000 },
  { id: 'HE-03', name: 'HE London Telehouse North', asn: 'AS6939', city: 'London', country: 'UK', lat: 51.5, lon: -0.12, type: 'HE_CORE', details: 'London Telehouse Transatlantic & European Hub', color: '#ecb663', adjacencies: 3600, prefixesV4: 910000, prefixesV6: 172000, capacityGbps: 16000 },
  { id: 'HE-04', name: 'HE Frankfurt DE-CIX Hub', asn: 'AS6939', city: 'Frankfurt', country: 'Germany', lat: 50.11, lon: 8.68, type: 'HE_CORE', details: 'DE-CIX Central European BGP Node', color: '#ecb663', adjacencies: 3400, prefixesV4: 895000, prefixesV6: 168000, capacityGbps: 15000 },
  { id: 'HE-05', name: 'HE Amsterdam AMS-IX Node', asn: 'AS6939', city: 'Amsterdam', country: 'Netherlands', lat: 52.37, lon: 4.9, type: 'HE_CORE', details: 'AMS-IX European Transit Point', color: '#ecb663', adjacencies: 2900, prefixesV4: 870000, prefixesV6: 160000, capacityGbps: 12000 },
  { id: 'HE-06', name: 'HE Singapore Equinix SG1', asn: 'AS6939', city: 'Singapore', country: 'Singapore', lat: 1.35, lon: 103.81, type: 'HE_CORE', details: 'Asia-Pacific Core Subsea Transit Hub', color: '#ecb663', adjacencies: 2800, prefixesV4: 880000, prefixesV6: 165000, capacityGbps: 14000 },
  { id: 'HE-07', name: 'HE Tokyo Equinix TY2', asn: 'AS6939', city: 'Tokyo', country: 'Japan', lat: 35.67, lon: 139.65, type: 'HE_CORE', details: 'JPNAP East Asia Transit Hub', color: '#ecb663', adjacencies: 2400, prefixesV4: 850000, prefixesV6: 155000, capacityGbps: 11000 },
  { id: 'HE-08', name: 'HE Hong Kong HKIX Node', asn: 'AS6939', city: 'Hong Kong', country: 'Hong Kong', lat: 22.31, lon: 114.16, type: 'HE_CORE', details: 'HKIX Greater China & SE Asia Hub', color: '#ecb663', adjacencies: 2100, prefixesV4: 830000, prefixesV6: 150000, capacityGbps: 9500 },
  { id: 'HE-09', name: 'HE Mumbai Equinix MB1', asn: 'AS6939', city: 'Mumbai', country: 'India', lat: 19.07, lon: 72.87, type: 'HE_CORE', details: 'South Asia Core Gateway Hub', color: '#ecb663', adjacencies: 1850, prefixesV4: 810000, prefixesV6: 142000, capacityGbps: 8200 },

  // --- Global Tier-1 Carrier Peers ---
  { id: 'T1-01', name: 'Tata Communications (AS6453)', asn: 'AS6453', city: 'Mumbai', country: 'India', lat: 19.15, lon: 72.9, type: 'TIER1_PEER', details: 'Tata Global Subsea & ITC Interconnect', color: '#ac9af2', adjacencies: 1950, prefixesV4: 900000, capacityGbps: 16000 },
  { id: 'T1-02', name: 'NTT America (AS2914)', asn: 'AS2914', city: 'Tokyo', country: 'Japan', lat: 35.7, lon: 139.7, type: 'TIER1_PEER', details: 'NTT Global IP Network Backbone', color: '#ac9af2', adjacencies: 2100, prefixesV4: 915000, capacityGbps: 18000 },
  { id: 'T1-03', name: 'Telia Company (AS1299)', asn: 'AS1299', city: 'Stockholm', country: 'Sweden', lat: 59.32, lon: 18.06, type: 'TIER1_PEER', details: 'Arelion / Telia Global Carrier', color: '#ac9af2', adjacencies: 2300, prefixesV4: 930000, capacityGbps: 20000 },
  { id: 'T1-04', name: 'Singtel (AS7473)', asn: 'AS7473', city: 'Singapore', country: 'Singapore', lat: 1.3, lon: 103.85, type: 'TIER1_PEER', details: 'Singtel Regional Subsea Backbone', color: '#ac9af2', adjacencies: 1400, prefixesV4: 760000, capacityGbps: 10000 },

  // --- Bangladesh IIG Autonomous System Gateways ---
  { id: 'BD-01', name: 'BSCCL (Submarine Cable Co.)', asn: 'AS24389', city: 'Cox’s Bazar', country: 'Bangladesh', lat: 21.43, lon: 91.98, type: 'BANGLADESH_IIG', details: 'Primary National Gateway (SMW4 & SMW5 Cable Landing)', color: '#56c4ac', adjacencies: 142, prefixesV4: 18450, prefixesV6: 3210, capacityGbps: 5400, upstreams: ['Hurricane Electric (AS6939)', 'Tata (AS6453)', 'NTT (AS2914)'] },
  { id: 'BD-02', name: 'Summit Communications IIG', asn: 'AS58410', city: 'Dhaka', country: 'Bangladesh', lat: 23.78, lon: 90.42, type: 'BANGLADESH_IIG', details: 'Terrestrial ITC Benapole & Subsea Cable IIG Hub', color: '#62baf4', adjacencies: 118, prefixesV4: 14200, prefixesV6: 2450, capacityGbps: 3800, upstreams: ['Hurricane Electric (AS6939)', 'Tata (AS6453)', 'Singtel (AS7473)'] },
  { id: 'BD-03', name: 'Fiber@Home IIG Network', asn: 'AS17498', city: 'Dhaka', country: 'Bangladesh', lat: 23.81, lon: 90.41, type: 'BANGLADESH_IIG', details: 'Nationwide Fiber Mesh & Multi-homed IIG Node', color: '#56c4ac', adjacencies: 104, prefixesV4: 12850, prefixesV6: 2180, capacityGbps: 3200, upstreams: ['Hurricane Electric (AS6939)', 'NTT (AS2914)'] },
  { id: 'BD-04', name: 'Mango Teleservices IIG', asn: 'AS9230', city: 'Dhaka', country: 'Bangladesh', lat: 23.75, lon: 90.39, type: 'BANGLADESH_IIG', details: 'ITC Benapole & Regional Gateway Hub', color: '#ac9af2', adjacencies: 76, prefixesV4: 8900, prefixesV6: 1420, capacityGbps: 1900, upstreams: ['Hurricane Electric (AS6939)', 'Tata (AS6453)'] },
  { id: 'BD-05', name: 'Novocom Services IIG', asn: 'AS45168', city: 'Dhaka', country: 'Bangladesh', lat: 23.77, lon: 90.4, type: 'BANGLADESH_IIG', details: 'Dhaka Metropolitan Gateway Ring Node', color: '#67caae', adjacencies: 62, prefixesV4: 7200, prefixesV6: 1100, capacityGbps: 1400, upstreams: ['Hurricane Electric (AS6939)', 'Telia (AS1299)'] },
  { id: 'BD-06', name: 'BD Hub Limited IIG', asn: 'AS135515', city: 'Dhaka', country: 'Bangladesh', lat: 23.79, lon: 90.42, type: 'BANGLADESH_IIG', details: 'Enterprise IIG & Banking Interconnect', color: '#f87171', adjacencies: 48, prefixesV4: 5100, prefixesV6: 850, capacityGbps: 950, upstreams: ['Hurricane Electric (AS6939)'] },
  { id: 'BD-07', name: 'Delta Telecom IIG', asn: 'AS138982', city: 'Dhaka', country: 'Bangladesh', lat: 23.8, lon: 90.4, type: 'BANGLADESH_IIG', details: 'Regional Transit Gateway', color: '#62baf4', adjacencies: 34, prefixesV4: 3400, prefixesV6: 480, capacityGbps: 650, upstreams: ['Hurricane Electric (AS6939)'] },

  // --- Subsea Landing Stations & IXP Interconnect Hubs ---
  { id: 'IX-01', name: 'BDIX National IXP', asn: 'BDIX-DHAKA', city: 'Dhaka', country: 'Bangladesh', lat: 23.73, lon: 90.38, type: 'IXP_HUB', details: 'Bangladesh National Internet Exchange Point', color: '#62baf4', capacityGbps: 1200 },
  { id: 'IX-02', name: 'Kuakata Cable Landing (SMW5)', asn: 'SMW5-LANDING', city: 'Kuakata', country: 'Bangladesh', lat: 21.84, lon: 90.12, type: 'SUBSEA_LANDING', details: 'Kuakata SEA-ME-WE 5 Landing Station (3.6 Tbps)', color: '#56c4ac', capacityGbps: 3600 },
  { id: 'IX-03', name: 'ITC Benapole Border Crossing', asn: 'ITC-BENAPOLE', city: 'Benapole', country: 'Bangladesh', lat: 23.04, lon: 88.89, type: 'SUBSEA_LANDING', details: 'Cross-Border Terrestrial Fiber to Petrapole, India', color: '#ecb663', capacityGbps: 2200 },
];

const DETAILED_ROUTING_ARCS = [
  // High-Capacity Global Tier-1 BGP Arcs
  { from: 'HE-01', to: 'HE-03', color: '#ecb663', speed: 0.1, label: 'Transatlantic HE Core' },
  { from: 'HE-01', to: 'HE-06', color: '#ecb663', speed: 0.09, label: 'Transpacific HE Core' },
  { from: 'HE-03', to: 'HE-06', color: '#ecb663', speed: 0.12, label: 'Eurasian Core Arc' },
  { from: 'HE-06', to: 'HE-09', color: '#ecb663', speed: 0.15, label: 'Singapore - Mumbai Link' },

  // Direct Tier-1 Connections to Bangladesh IIG Gateways
  { from: 'HE-06', to: 'BD-01', color: '#ecb663', speed: 0.16, label: 'HE Singapore -> BSCCL (AS24389)' },
  { from: 'HE-06', to: 'BD-02', color: '#62baf4', speed: 0.15, label: 'HE Singapore -> Summit (AS58410)' },
  { from: 'HE-06', to: 'BD-03', color: '#56c4ac', speed: 0.14, label: 'HE Singapore -> Fiber@Home (AS17498)' },
  { from: 'HE-09', to: 'BD-01', color: '#ecb663', speed: 0.16, label: 'HE Mumbai -> BSCCL Subsea' },
  { from: 'HE-03', to: 'BD-01', color: '#ecb663', speed: 0.11, label: 'HE London -> BSCCL SMW4' },
  { from: 'T1-01', to: 'BD-02', color: '#ac9af2', speed: 0.14, label: 'Tata Mumbai -> Summit ITC' },
  { from: 'T1-01', to: 'BD-04', color: '#ac9af2', speed: 0.13, label: 'Tata Mumbai -> Mango ITC' },
  { from: 'T1-02', to: 'BD-03', color: '#56c4ac', speed: 0.12, label: 'NTT Tokyo -> Fiber@Home' },
  { from: 'HE-06', to: 'BD-05', color: '#67caae', speed: 0.13, label: 'HE Singapore -> Novocom' },

  // Internal & Subsea Landing Arcs
  { from: 'BD-01', to: 'IX-01', color: '#56c4ac', speed: 0.22, label: 'BSCCL -> BDIX IXP' },
  { from: 'BD-02', to: 'IX-01', color: '#62baf4', speed: 0.22, label: 'Summit -> BDIX IXP' },
  { from: 'BD-03', to: 'IX-01', color: '#56c4ac', speed: 0.22, label: 'Fiber@Home -> BDIX IXP' },
  { from: 'BD-01', to: 'IX-02', color: '#ecb663', speed: 0.2, label: 'BSCCL -> Kuakata SMW5' },
  { from: 'BD-02', to: 'IX-03', color: '#ecb663', speed: 0.2, label: 'Summit -> Benapole ITC' },
  { from: 'BD-04', to: 'IX-03', color: '#ac9af2', speed: 0.2, label: 'Mango -> Benapole ITC' },
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
  const apiRef = useRef<{ zoom: (factor: number) => void; reset: () => void; focusNode: (node: BGPNode) => void } | null>(null);
  const [selectedNode, setSelectedNode] = useState<BGPNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<BGPNode | null>(null);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [webglFailed, setWebglFailed] = useState<boolean>(false);
  const [arcFilter, setArcFilter] = useState<'ALL' | 'TIER1' | 'BANGLADESH'>('ALL');

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
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 1, 2500);
    camera.position.set(0, 160, 430);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 180;
    controls.maxDistance = 900;
    controls.autoRotate = isRotating;
    controls.autoRotateSpeed = 0.75;
    controls.update();

    // Lighting Setup
    scene.add(new THREE.AmbientLight(0xd5e8ff, 1.4));
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.8);
    sunLight.position.set(400, 300, 300);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xecb663, 1.6);
    rimLight.position.set(-400, -200, -300);
    scene.add(rimLight);

    const globeRadius = 140;

    // 1. Detailed 3D Globe Sphere
    const globeGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const globeMat = new THREE.MeshStandardMaterial({
      color: 0x0f1c3f,
      roughness: 0.65,
      metalness: 0.35,
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globeMesh);

    // Lat/Lon Coordinate Lines & Equator Ring
    const gridGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(globeRadius + 0.6, 36, 18));
    const gridMat = new THREE.LineBasicMaterial({ color: 0x1e3e6b, transparent: true, opacity: 0.35 });
    const gridLines = new THREE.LineSegments(gridGeo, gridMat);
    scene.add(gridLines);

    // Glowing Equator Line
    const equatorGeo = new THREE.RingGeometry(globeRadius + 0.8, globeRadius + 1.4, 64);
    const equatorMat = new THREE.MeshBasicMaterial({ color: 0x62baf4, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
    const equatorMesh = new THREE.Mesh(equatorGeo, equatorMat);
    equatorMesh.rotation.x = Math.PI / 2;
    scene.add(equatorMesh);

    // Atmosphere Glow Outer Ring
    const atmosphereGeo = new THREE.SphereGeometry(globeRadius + 9, 48, 48);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x62baf4,
      transparent: true,
      opacity: 0.09,
      side: THREE.DoubleSide,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphereMesh);

    // 2. Starfield Background
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 1400;
    const starPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 1800;
      starPositions[i + 1] = (Math.random() - 0.5) * 1800;
      starPositions[i + 2] = (Math.random() - 0.5) * 1800;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.3, transparent: true, opacity: 0.65 });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // 3. Render Detailed BGP Nodes & Pulsating Beacons
    const nodeMeshes: THREE.Mesh[] = [];
    const nodeMap = new Map<string, THREE.Vector3>();

    DETAILED_BGP_NODES.forEach((node) => {
      const pos = latLonToVector3(node.lat, node.lon, globeRadius + 1.8);
      nodeMap.set(node.id, pos);

      const colorHex = parseInt(node.color.replace('#', '0x'));
      const isCore = node.type === 'HE_CORE';
      const isBd = node.type === 'BANGLADESH_IIG';

      const size = isCore ? 4.8 : isBd ? 4.0 : 3.2;
      const markerGeo = new THREE.SphereGeometry(size, 16, 16);
      const markerMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.65,
        roughness: 0.2,
      });
      const markerMesh = new THREE.Mesh(markerGeo, markerMat);
      markerMesh.position.copy(pos);
      markerMesh.userData = { node };
      scene.add(markerMesh);
      nodeMeshes.push(markerMesh);

      // Pulsating Halo Ring
      const ringGeo = new THREE.RingGeometry(size * 1.3, size * 2.2, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(0, 0, 0);
      scene.add(ringMesh);
    });

    // 4. Render 3D Curved Arc Streams
    const animatedParticles: { particle: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; speed: number; progress: number }[] = [];

    DETAILED_ROUTING_ARCS.forEach((arc) => {
      const start = nodeMap.get(arc.from);
      const end = nodeMap.get(arc.to);
      if (!start || !end) return;

      // Elevated 3D Arc
      const mid = start.clone().add(end).multiplyScalar(0.5);
      const distance = start.distanceTo(end);
      const elevation = globeRadius + Math.min(75, distance * 0.28);
      mid.normalize().multiplyScalar(elevation);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(50);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
      const curveMat = new THREE.LineBasicMaterial({
        color: parseInt(arc.color.replace('#', '0x')),
        transparent: true,
        opacity: 0.55,
      });
      const curveLine = new THREE.Line(curveGeo, curveMat);
      scene.add(curveLine);

      // Animated Flow Particle
      const particleGeo = new THREE.SphereGeometry(2.2, 8, 8);
      const particleMat = new THREE.MeshBasicMaterial({
        color: parseInt(arc.color.replace('#', '0x')),
      });
      const particleMesh = new THREE.Mesh(particleGeo, particleMat);
      scene.add(particleMesh);

      animatedParticles.push({
        particle: particleMesh,
        curve,
        speed: arc.speed,
        progress: Math.random(),
      });
    });

    // Camera APIs
    apiRef.current = {
      zoom: (factor: number) => {
        camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target);
        controls.update();
      },
      reset: () => {
        controls.reset();
        camera.position.set(0, 160, 430);
        controls.target.set(0, 0, 0);
        controls.update();
      },
      focusNode: (node: BGPNode) => {
        const targetPos = latLonToVector3(node.lat, node.lon, globeRadius + 220);
        camera.position.copy(targetPos);
        controls.target.set(0, 0, 0);
        controls.update();
        setSelectedNode(node);
      },
    };

    // Raycaster Node Pick
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        const n = intersects[0].object.userData.node as BGPNode;
        setSelectedNode(n);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        const n = intersects[0].object.userData.node as BGPNode;
        setHoveredNode(n);
        renderer.domElement.style.cursor = 'pointer';
      } else {
        setHoveredNode(null);
        renderer.domElement.style.cursor = 'grab';
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);

    // Resize Handler
    const handleResize = () => {
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(el);
    handleResize();

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      controls.autoRotate = isRotating;
      controls.update();

      // Animate Flow Particles
      animatedParticles.forEach((item) => {
        item.progress += delta * item.speed;
        if (item.progress > 1) item.progress = 0;
        const pt = item.curve.getPoint(item.progress);
        item.particle.position.copy(pt);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.dispose();
      if (renderer.domElement && el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
    };
  }, [isRotating]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '520px', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border)', background: '#080d1a' }}>
      {/* 3D WebGL Host Canvas */}
      <div ref={hostRef} style={{ width: '100%', height: '100%' }} />

      {/* WebGL Fallback Notification */}
      {webglFailed && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080d1a', color: '#fff', fontSize: '13px' }}>
          3D WebGL renderer unavailable on this device.
        </div>
      )}

      {/* Top Banner overlay */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '10px 16px',
          color: '#fff',
        }}
      >
        <Globe2 size={22} color="#ecb663" className="animate-spin-slow" />
        <div>
          <strong style={{ fontSize: '14px', display: 'block' }}>Hurricane Electric 3D BGP Network Globe</strong>
          <small style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>bgp.he.net Global Autonomous System Topology & Subsea Arcs</small>
        </div>
      </div>

      {/* Top-Right Legend */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '12px 16px',
          fontSize: '11px',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ecb663' }} />
          <span>HE AS6939 Core Global Hubs ({DETAILED_BGP_NODES.filter((n) => n.type === 'HE_CORE').length})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#56c4ac' }} />
          <span>Bangladesh IIG Gateways ({DETAILED_BGP_NODES.filter((n) => n.type === 'BANGLADESH_IIG').length})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ac9af2' }} />
          <span>Global Tier-1 Carrier Peers (Tata, NTT, Telia)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#62baf4' }} />
          <span>Subsea Cable Landings & BDIX IXP</span>
        </div>
      </div>

      {/* Quick Location Dock at bottom left */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          maxWidth: '520px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          padding: '8px 12px',
          borderRadius: '10px',
          border: '1px solid var(--border)',
        }}
      >
        <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Server size={12} color="#ecb663" /> Focus Node:
        </span>
        {DETAILED_BGP_NODES.filter((n) => n.type === 'BANGLADESH_IIG' || n.asn === 'AS6939').slice(0, 5).map((node) => (
          <button
            key={node.id}
            onClick={() => apiRef.current?.focusNode(node)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '10px',
              color: node.color,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {node.asn} ({node.city})
          </button>
        ))}
      </div>

      {/* Controls Bar bottom-right */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          display: 'flex',
          gap: '8px',
        }}
      >
        <button
          onClick={() => apiRef.current?.zoom(0.85)}
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: '#fff',
            padding: '8px',
            cursor: 'pointer',
          }}
          title="Zoom In"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={() => apiRef.current?.zoom(1.15)}
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: '#fff',
            padding: '8px',
            cursor: 'pointer',
          }}
          title="Zoom Out"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={() => setIsRotating(!isRotating)}
          style={{
            background: isRotating ? '#ecb663' : 'rgba(15, 23, 42, 0.85)',
            color: isRotating ? '#0f172a' : '#fff',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {isRotating ? <Pause size={14} /> : <Play size={14} />} {isRotating ? 'Pause Globe' : 'Auto Rotate'}
        </button>
        <button
          onClick={() => apiRef.current?.reset()}
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: '#fff',
            padding: '8px',
            cursor: 'pointer',
          }}
          title="Reset Camera"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Hover Node Tooltip */}
      {hoveredNode && !selectedNode && (
        <div
          style={{
            position: 'absolute',
            top: '75px',
            left: '16px',
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '6px 12px',
            color: '#fff',
            fontSize: '11px',
            pointerEvents: 'none',
          }}
        >
          <strong style={{ color: hoveredNode.color }}>{hoveredNode.asn}</strong>: {hoveredNode.name} ({hoveredNode.city}, {hoveredNode.country})
        </div>
      )}

      {/* Selected Node Details Overlay Modal */}
      {selectedNode && (
        <div
          style={{
            position: 'absolute',
            bottom: '70px',
            left: '16px',
            background: 'rgba(15, 23, 42, 0.96)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px 20px',
            color: '#fff',
            maxWidth: '380px',
            boxShadow: '0 12px 30px -5px rgba(0,0,0,0.6)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: selectedNode.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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

          {selectedNode.upstreams && (
            <div style={{ marginTop: '10px' }}>
              <span style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>Primary Tier-1 Upstreams:</span>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                {selectedNode.upstreams.map((u) => (
                  <span key={u} style={{ background: 'rgba(236, 182, 99, 0.12)', border: '1px solid rgba(236, 182, 99, 0.3)', color: '#ecb663', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                    {u}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '12px', textAlign: 'right' }}>
            <a
              href={`https://bgp.he.net/${selectedNode.asn}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '11px',
                color: '#ecb663',
                fontWeight: 600,
                textDecoration: 'none',
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
    </div>
  );
}
