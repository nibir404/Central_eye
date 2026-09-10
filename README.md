# Central Eye — National Infrastructure Intelligence Platform 👁️🇧🇩
### Powered by PUKU-AI

Central Eye is Bangladesh’s unified national infrastructure intelligence command center platform built for real-time monitoring and historical intelligence across the **Electricity (Power Grid)** and **Telecommunications (BTRC)** sectors.

Central Eye provides real-time telemetry streaming, interactive WebGL 3D/2D geospatial infrastructure mapping, automated data scrapers, official regulatory statistics, operator SLA cross-verification, and BGP routing analytics across all 8 administrative divisions of Bangladesh.

---

## 🌟 Key Highlights & Recent Updates

### 🛡️ 1. Operator SLA Cross-Verification Matrix (`SLA Cross-Check`)
Multi-license compliance engine cross-checking self-reported operator uptimes against enterprise SNMP probes, downstream ISP ping grids, and real-time customer incident logs to eliminate false SLA claims:

- **Stacked Uptime Breakdown Chart**:
  - Displays customer-validated availability (teal) stacked with discrepancy gaps (amber) to visualize SLA inflation.
  - Hover tooltips reveal complete operator details (full company name, category badge, compliance status, and exact percentages) with zero label clutter on axis ticks.
- **License Category SLA Compliance Radar**:
  - Multi-axis radar contrasting overall compliance rates vs. cross-checked uptime across MNO, IIG, ICX, IGW, ANS/ISP, and NTTN tiers.
- **License Category Distribution (Donut Chart)**:
  - Regulatory market share breakdown across active license holders.
- **National SLA Discrepancy Risk Gauge**:
  - Real-time SVG gauge calculating overall national SLA inflation risk based on cross-verification variance and penalty flags.
- **Audit Table & Filtering**:
  - Live filtering by operator name, license category, and SLA breach/audit status.

---

### 🌐 2. IIG BGP & Hurricane Electric Report (`IIG BGP & Hurricane Report`)
Advanced routing intelligence visualizer for International Internet Gateway (IIG) licensees, measuring global BGP reachability and path diversity:

- **Interactive 3D WebGL BGP Globe (`HE3DGlobeScene`)**:
  - Renders international fiber paths and BGP peering arcs connecting Dhaka to global Tier-1 Internet hubs (Hurricane Electric AS6939, Tata Communications AS6453, NTT AS2914, Telstra AS4637, Singtel AS7473).
- **BGP Peering Depth vs Redundancy Scatter Plot**:
  - Plots total BGP adjacencies (X-axis) against path redundancy scores (Y-axis) with bubble sizing scaled by total capacity (Gbps).
- **Upstream Tier-1 Share Distribution**:
  - Market concentration of international transit suppliers across Bangladeshi IIG operators.
- **AS Path Diversity & BGP Flap Index**:
  - Real-time routing stability scoring and route flapping detection.

---

### 📡 3. Comprehensive BTRC Telecom Statistics (`পরিসংখ্যান`)
Integrated complete statutory data scraped from the **Bangladesh Telecommunication Regulatory Commission (BTRC)** official portals:

1. **টেলিডেনসিটি (Teledensity & Penetration)**: Voice teledensity, broadband penetration, and 60-month historical trends.
2. **মোবাইল গ্রাহক (Mobile Subscribers)**: Monthly subscriber breakdowns across **Grameenphone**, **Robi Axiata**, **Banglalink**, and **Teletalk** (190M+ total subscribers).
3. **ইন্টারনেট গ্রাহক (Internet Subscribers)**: Mobile Internet vs. Fixed Broadband (ISP & PSTN) subscribers and bandwidth growth.
4. **মোবাইল ফোন হ্যান্ডসেটের তথ্য (Handset Manufacturing & Imports)**: Local manufacturing vs. CBU imports categorized by technology generation (**2G, 3G, 4G, 5G**).
5. **অপারেটর টাওয়ার সংখ্যা (Operator & TowerCo Towers)**: 46,000+ national towers tracked across MNOs and TowerCos (**edotco, Summit Towers, Kirtonkhola, Frontier Towers, BTCL**).
6. **এমএনও নেটওয়ার্কে হ্যান্ডসেট পেনিট্রেশন তথ্য (MNO Handset Penetration)**: Device distribution across cellular carrier networks.
7. **সেবার মান (QoS) সংক্রান্ত তথ্য (Quality of Service)**: Call Drop Rate (CDR), Call Setup Success Rate (CSSR), 4G throughput benchmarks.
8. **বরাদ্দকৃত তরঙ্গের তথ্য (Allocated Spectrum & Frequencies)**: 406.6 MHz national spectrum allocation across 700 MHz to 2.6 GHz bands.
9. **অপটিক্যাল ফাইবারের তথ্য (Optical Fiber Infrastructure)**: 179,000+ km of national optical fiber backbones.
10. **অবৈধ ভিওআইপি ও সেবা বন্ধ করণ (Illegal VoIP & SIM Enforcement)**: Enforcement metrics, illegal SIM deactivations, and raids.

---

### 🗺️ 4. Dynamic Infrastructure Geospatial Mapping
Interactive WebGL and SVG map with contextual sector switching:

- **⚡ Electricity Sector**:
  - **Power Plants**: Payra 1,320 MW, Rampal 1,320 MW, Matarbari 1,200 MW, Rooppur NPP 2,400 MW, Sirajganj, Ashuganj, Bibiyana Gas Complex, Ghorashal, Meghnaghat.
  - **Super Grid Substations**: Aminbazar 400kV, Kaliakoir, Bogura, Ishwardi, Madunaghat, Bibiyana 400kV.
  - **Cross-Border Corridors**: Adani Godda 400kV HVDC (1,496 MW), Bheramara 500kV HVDC (1,000 MW), Tripura – Comilla 400kV (160 MW).
- **📡 Telecom Sector**:
  - **National BTS Towers**: Master switching centers, primary aggregation nodes, and regional base stations.
  - **Submarine Cable Landing Stations**: SMW-4 (Cox's Bazar), SMW-5 (Kuakata), SMW-6 (Planned).
  - **Optical Fiber Backbones**: Nationwide NTTN transmission links (Summit, Fiber@Home, Bahon, BTCL, PGCB OPGW).

---

### ⚡ 5. Real-Time Power Grid Generation & Demand Monitoring
Scraped and integrated directly with **Power Grid Bangladesh (PGCB)** ERP systems:
- Real-time generation by fuel type (Gas, Coal, Heavy Fuel Oil, Diesel, Hydro, Solar, Cross-border Import).
- Demand vs. Supply vs. Rotational Load Shedding across all 8 divisions.
- Dynamic responsive metric cards that automatically expand to fill full row width.
- Live grid frequency monitoring (50.00 Hz baseline) with critical excursion alarms.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 / React 19 / Vite (vinext)
- **Styling**: Vanilla CSS tokens & Tailwind CSS with Glassmorphism
- **3D & Mapping Engine**: Three.js, WebGL, GeoJSON SVGLoader, OrbitControls
- **Charts & Visualizations**: Recharts (Stacked Bar, Radar, Area, Donut, Scatter), Lucide React
- **Data Scraping & Pipeline**: Python 3 (BeautifulSoup4, pypdf, requests)
- **Data Stores**: Optimized static JSON datasets under `public/data/` and `lib/`

---

## 📦 Getting Started

### Prerequisites
- Node.js `>= 22.13.0`
- npm `>= 10.0.0`
- Python `>= 3.10` *(optional, for running scrapers)*

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nibir404/Central_eye.git
   cd Central_eye/dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🔄 Automated Data Scrapers

The project includes custom Python scrapers to pull official data directly from government portals:

- **BTRC Scraper** (`scripts/scrape_btrc.py`):
  Pulls all 9 statutory pages from `btrc.gov.bd` (Teledensity, Mobile/Internet Subscribers, Handset manufacturing, Tower counts, QoS reports, Spectrum allocations, Optical fiber routes, VoIP enforcement).
  ```bash
  python3 scripts/scrape_btrc.py
  ```

- **Power Grid Scraper** (`scripts/scrape_powergrid.py`):
  Extracts live plant-level generation, regional demand, and load shedding from `erp.powergrid.gov.bd`.
  ```bash
  python3 scripts/scrape_powergrid.py
  ```

---

## 📂 Project Structure

```
dashboard/
├── app/
│   ├── favicon.ico                   # Favicon
│   ├── globals.css                   # Glassmorphic HUD theme & layout rules
│   ├── layout.tsx                    # Root layout & PUKU-AI metadata
│   └── page.tsx                      # Command Center Main UI, Sub-menus & Layout Controller
├── components/
│   ├── bgp-hurricane-report-view.tsx # IIG BGP & Hurricane Electric routing analytics view
│   ├── btrc-telecom-views.tsx        # 10 BTRC statutory telecommunication data views & charts
│   ├── he-3d-globe-scene.tsx         # Interactive 3D WebGL globe with international BGP arcs
│   ├── powergrid-visuals.tsx         # Power Grid Bangladesh load shedding & generation charts
│   ├── sla-crosscheck-view.tsx       # Operator SLA Cross-Verification Matrix & Stacked Bar Chart
│   └── ui/                           # Reusable UI primitives (dialog, tabs, checkbox, progress)
├── lib/
│   ├── btrc-telecom.ts               # BTRC data models, types, and summary metadata
│   ├── infrastructure-assets.ts      # Mapped Electricity & Telecom infrastructure assets
│   ├── license-bgp-data.ts           # Operator SLA verification & IIG BGP report datasets
│   ├── powergrid-electricity.ts      # PGCB generation & load shedding data models
│   └── telemetry-pipeline.ts         # Real-time streaming simulation engine
├── public/
│   ├── data/                         # Scraped historical JSON datasets (BTRC & PGCB)
│   └── bangladesh.json               # GeoJSON boundaries of Bangladesh
└── scripts/
    ├── scrape_btrc.py                # Automated BTRC portal scraping script
    └── scrape_powergrid.py           # Automated PGCB ERP scraping script
```

---

## 📜 License

Distributed under the MIT License.

