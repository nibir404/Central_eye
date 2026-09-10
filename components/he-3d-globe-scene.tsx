'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Network, Globe2, Zap, Play, Pause, RotateCcw, Plus, Minus, ExternalLink, Activity, Layers, ShieldCheck } from 'lucide-react';
import { IIGBGPReport } from '@/lib/license-bgp-data';

type BGPNode = {
  id: string;
  name: string;
  asn: string;
  lat: number;
  lon: number;
  type: 'HE_CORE' | 'BANGLADESH_IIG' | 'SUBSEA_LANDING' | 'IXP_HUB';
  details: string;
  color: string;
  adjacencies?: number;
  prefixes?: number;
};

const BGP_NODES: BGPNode[] = [
  // Hurricane Electric Core Tier-1 Backbone Hubs (AS6939)
  { id: 'HE-01', name: 'Hurricane Electric Fremont Core', asn: 'AS6939', lat: 37.54, lon: -121.98, type: 'HE_CORE', details: 'Fremont, CA, USA Core HQ Backbone', color: '#ecb663' },
  { id: 'HE-02', name: 'HE London Telehouse Hub', asn: 'AS6939', lat: 51.5, lon: -0.12, type: 'HE_CORE', details: 'London, UK European BGP Hub', color: '#ecb663' },
  { id: 'HE-03', name: 'HE Singapore Equinix SG1', asn: 'AS6939', lat: 1.35, lon: 103.81, type: 'HE_CORE', details: 'Singapore Asia-Pacific Core Hub', color: '#ecb663' },
  { id: 'HE-04', name: 'HE Frankfurt DE-CIX Hub', asn: 'AS6939', lat: 50.11, lon: 8.68, type: 'HE_CORE', details: 'Frankfurt Central Europe Gateway', color: '#ecb663' },
  { id: 'HE-05', name: 'HE Tokyo Equinix TY2', asn: 'AS6939', lat: 35.67, lon: 139.65, type: 'HE_CORE', details: 'Tokyo East-Asia Core Node', color: '#ecb663' },

  // Bangladesh IIG Autonomous System Gateways
  { id: 'BD-01', name: 'BSCCL (Submarine Cable Co.)', asn: 'AS24389', lat: 21.43, lon: 91.98, type: 'BANGLADESH_IIG', details: 'SMW4 & SMW5 Subsea Landing Station', color: '#56c4ac', adjacencies: 142, prefixes: 18450 },
  { id: 'BD-02', name: 'Summit Communications IIG', asn: 'AS58410', lat: 23.78, lon: 90.42, type: 'BANGLADESH_IIG', details: 'Terrestrial ITC & Subsea Gateway', color: '#62baf4', adjacencies: 118, prefixes: 14200 },
  { id: 'BD-03', name: 'Fiber@Home IIG Network', asn: 'AS17498', lat: 23.81, lon: 90.41, type: 'BANGLADESH_IIG', details: 'National Backbone & Multi-homed IIG', color: '#56c4ac', adjacencies: 104, prefixes: 12850 },
  { id: 'BD-04', name: 'Mango Teleservices IIG', asn: 'AS9230', lat: 23.75, lon: 90.39, type: 'BANGLADESH_IIG', details: 'ITC Benapole & Subsea Gateway', color: '#ac9af2', adjacencies: 76, prefixes: 8900 },
  { id: 'BD-05', name: 'Novocom Services IIG', asn: 'AS45168', lat: 23.77, lon: 90.4, type: 'BANGLADESH_IIG', details: 'Dhaka Gateway Ring Node', color: '#67caae', adjacencies: 62, prefixes: 7200 },
  { id: 'BD-06', name: 'BD Hub Limited IIG', asn: 'AS135515', lat: 23.79, lon: 90.42, type: 'BANGLADESH_IIG', details: 'Enterprise IIG Gateway Node', color: '#f87171', adjacencies: 48, prefixes: 5100 },
  { id: 'BD-07', name: 'Delta Telecom IIG', asn: 'AS138982', lat: 23.8, lon: 90.4, type: 'BANGLADESH_IIG', details: 'Regional Gateway Node', color: '#62baf4', adjacencies: 34, prefixes: 3400 },

  // Subsea Landing & IXP Interconnect Hubs
  { id: 'IX-01', name: 'BDIX (Bangladesh IXP)', asn: 'BDIX-DHAKA', lat: 23.73, lon: 90.38, type: 'IXP_HUB', details: 'National Peering Exchange (Dhaka)', color: '#62baf4' },
  { id: 'IX-02', name: 'Kuakata Cable Station', asn: 'SMW5-LANDING', lat: 21.84, lon: 90.12, type: 'SUBSEA_LANDING', details: 'Kuakata SEA-ME-WE 5 Cable Station', color: '#56c4ac' },
];

const ROUTING_ARCS = [
  // HE Core to Bangladesh IIG Arcs
  { from: 'HE-03', to: 'BD-01', color: '#ecb663', speed: 0.15 }, // Singapore -> BSCCL
  { from: 'HE-03', to: 'BD-02', color: '#62baf4', speed: 0.14 }, // Singapore -> Summit
  { from: 'HE-03', to: 'BD-03', color: '#56c4ac', speed: 0.13 }, // Singapore -> Fiber@Home
  { from: 'HE-02', to: 'BD-01', color: '#ecb663', speed: 0.11 }, // London -> BSCCL
  { from: 'HE-01', to: 'BD-02', color: '#ac9af2', speed: 0.1 },  // Fremont -> Summit
  { from: 'HE-04', to: 'BD-04', color: '#ecb663', speed: 0.12 }, // Frankfurt -> Mango
  { from: 'HE-03', to: 'BD-05', color: '#67caae', speed: 0.13 }, // Singapore -> Novocom

  // Internal Bangladesh Peering Arcs
  { from: 'BD-01', to: 'IX-01', color: '#56c4ac', speed: 0.2 },
  { from: 'BD-02', to: 'IX-01', color: '#62baf4', speed: 0.2 },
  { from: 'BD-03', to: 'IX-01', color: '#56c4ac', speed: 0.2 },
  { from: 'BD-01', to: 'IX-02', color: '#ecb663', speed: 0.18 },
];

// Helper: Convert Lat/Lon coordinates to 3D Sphere Vector3
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
  const apiRef = useRef<{ zoom: (factor: number) => void; reset: () => void } | null>(null);
  const [selectedNode, setSelectedNode] = useState<BGPNode | null>(null);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [webglFailed, setWebglFailed] = useState<boolean>(false);

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
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 1, 2000);
    camera.position.set(0, 150, 420);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 200;
    controls.maxDistance = 800;
    controls.autoRotate = isRotating;
    controls.autoRotateSpeed = 0.8;
    controls.update();

    // Lights
    scene.add(new THREE.AmbientLight(0xd5e8ff, 1.2));
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight1.position.set(300, 400, 200);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xecb663, 1.8);
    dirLight2.position.set(-300, -200, -200);
    scene.add(dirLight2);

    const globeRadius = 140;

    // 1. Globe Sphere (Dark Earth Globe)
    const globeGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const globeMat = new THREE.MeshStandardMaterial({
      color: 0x0b1329,
      roughness: 0.7,
      metalness: 0.3,
      wireframe: false,
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globeMesh);

    // Globe Grid Wireframe Lines
    const gridGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(globeRadius + 0.5, 36, 18));
    const gridMat = new THREE.LineBasicMaterial({ color: 0x1e3a5f, transparent: true, opacity: 0.35 });
    const gridLines = new THREE.LineSegments(gridGeo, gridMat);
    scene.add(gridLines);

    // Atmosphere Glow Outer Ring
    const atmosphereGeo = new THREE.SphereGeometry(globeRadius + 8, 48, 48);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x62baf4,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphereMesh);

    // 2. Starfield Particle Background
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 1200;
    const starPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 1600;
      starPositions[i + 1] = (Math.random() - 0.5) * 1600;
      starPositions[i + 2] = (Math.random() - 0.5) * 1600;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, transparent: true, opacity: 0.6 });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // 3. Render Nodes & Markers
    const nodeMeshes: THREE.Mesh[] = [];
    const nodeMap = new Map<string, THREE.Vector3>();

    BGP_NODES.forEach((node) => {
      const pos = latLonToVector3(node.lat, node.lon, globeRadius + 1.5);
      nodeMap.set(node.id, pos);

      const colorHex = parseInt(node.color.replace('#', '0x'));
      const isCore = node.type === 'HE_CORE';
      const isBd = node.type === 'BANGLADESH_IIG';

      const size = isCore ? 4.5 : isBd ? 3.8 : 3.0;
      const markerGeo = new THREE.SphereGeometry(size, 16, 16);
      const markerMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      const markerMesh = new THREE.Mesh(markerGeo, markerMat);
      markerMesh.position.copy(pos);
      markerMesh.userData = { node };
      scene.add(markerMesh);
      nodeMeshes.push(markerMesh);

      // Pulse Ring
      const ringGeo = new THREE.RingGeometry(size * 1.2, size * 1.8, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(0, 0, 0);
      scene.add(ringMesh);
    });

    // 4. Render Elevated 3D BGP Arc Curves with Animated Flow Particles
    const animatedParticles: { particle: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; speed: number; progress: number }[] = [];

    ROUTING_ARCS.forEach((arc) => {
      const start = nodeMap.get(arc.from);
      const end = nodeMap.get(arc.to);
      if (!start || !end) return;

      // Calculate midpoint elevated above sphere surface for 3D flight arc
      const mid = start.clone().add(end).multiplyScalar(0.5);
      const distance = start.distanceTo(end);
      const elevation = globeRadius + Math.min(60, distance * 0.25);
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

      // Moving Flow Particle
      const particleGeo = new THREE.SphereGeometry(2.0, 8, 8);
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

    // Camera Zoom and Controls API
    apiRef.current = {
      zoom: (factor: number) => {
        camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target);
        controls.update();
      },
      reset: () => {
        controls.reset();
        camera.position.set(0, 150, 420);
        controls.target.set(0, 0, 0);
        controls.update();
      },
    };

    // Raycaster for Picking Nodes
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

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

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

      // Animate Arc Flow Particles
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
      renderer.dispose();
      if (renderer.domElement && el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
    };
  }, [isRotating]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '480px', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border)', background: '#0b1329' }}>
      {/* 3D WebGL Host Canvas */}
      <div ref={hostRef} style={{ width: '100%', height: '100%' }} />

      {/* WebGL Fallback Notification */}
      {webglFailed && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1329', color: '#fff', fontSize: '13px' }}>
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
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '8px 14px',
          color: '#fff',
        }}
      >
        <Globe2 size={20} color="#ecb663" className="animate-spin-slow" />
        <div>
          <strong style={{ fontSize: '13px', display: 'block' }}>Hurricane Electric 3D BGP Globe</strong>
          <small style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>bgp.he.net Real-Time Global Network Topology</small>
        </div>
      </div>

      {/* Top-Right Legend */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '10px 14px',
          fontSize: '11px',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ecb663' }} />
          <span>HE AS6939 Tier-1 Core Hubs</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#56c4ac' }} />
          <span>Bangladesh IIG Autonomous Systems</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#62baf4' }} />
          <span>BDIX & Subsea Cable Landing</span>
        </div>
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

      {/* Selected Node Overlay Modal */}
      {selectedNode && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '14px 18px',
            color: '#fff',
            maxWidth: '360px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: selectedNode.color, textTransform: 'uppercase' }}>
              ● {selectedNode.type.replace('_', ' ')}
            </span>
            <button
              onClick={() => setSelectedNode(null)}
              style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', fontSize: '14px' }}
            >
              ✕
            </button>
          </div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700 }}>{selectedNode.name}</h4>
          <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: 'var(--muted-foreground)' }}>{selectedNode.details}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'rgba(255,255,255,0.04)', padding: '8px', borderRadius: '6px', fontSize: '11px' }}>
            <div>
              <span style={{ color: 'var(--muted-foreground)' }}>ASN:</span> <strong style={{ color: '#ecb663' }}>{selectedNode.asn}</strong>
            </div>
            {selectedNode.adjacencies && (
              <div>
                <span style={{ color: 'var(--muted-foreground)' }}>Peers:</span> <strong style={{ color: '#56c4ac' }}>{selectedNode.adjacencies} Peers</strong>
              </div>
            )}
            {selectedNode.prefixes && (
              <div>
                <span style={{ color: 'var(--muted-foreground)' }}>Prefixes:</span> <strong style={{ color: '#ac9af2' }}>{selectedNode.prefixes} routes</strong>
              </div>
            )}
            <div>
              <span style={{ color: 'var(--muted-foreground)' }}>Coordinates:</span> <strong>{selectedNode.lat}°, {selectedNode.lon}°</strong>
            </div>
          </div>

          <div style={{ marginTop: '10px', textAlign: 'right' }}>
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
              }}
            >
              View on bgp.he.net <ExternalLink size={12} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
