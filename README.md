# Central Eye — National Infrastructure Intelligence Platform 👁️🇧🇩
### Powered by PUKU-AI

Central Eye is Bangladesh’s unified national infrastructure intelligence command center platform built for real-time monitoring and historical intelligence across the **Electricity (Power Grid)** and **Telecommunications (BTRC)** sectors.

Central Eye provides real-time telemetry streaming, interactive WebGL 3D/2D geospatial infrastructure mapping, automated data scrapers, official regulatory statistics, and high-frequency anomaly detection across all 8 administrative divisions of Bangladesh.

---

## 🌟 Key Highlights & Recent Updates

### 📡 1. Comprehensive BTRC Telecom Statistics (`পরিসংখ্যান`)
Integrated complete statutory data scraped from the **Bangladesh Telecommunication Regulatory Commission (BTRC)** official portals, accessible directly from the expandable Telecom sub-menu:

1. **টেলিডেনসিটি (Teledensity & Penetration)**:
   - Voice teledensity, broadband penetration, and 60-month historical trends.
2. **মোবাইল গ্রাহক (Mobile Subscribers)**:
   - Monthly subscriber breakdowns across **Grameenphone**, **Robi Axiata**, **Banglalink**, and **Teletalk** (190M+ total subscribers).
3. **ইন্টারনেট গ্রাহক (Internet Subscribers)**:
   - Mobile Internet vs. Fixed Broadband (ISP & PSTN) subscribers and bandwidth growth.
4. **মোবাইল ফোন হ্যান্ডসেটের তথ্য (Handset Manufacturing & Imports)**:
   - Local manufacturing vs. CBU imports categorized by technology generation (**2G, 3G, 4G, 5G**).
5. **অপারেটর টাওয়ার সংখ্যা (Operator & TowerCo Towers)**:
   - 46,000+ national towers tracked across MNOs and TowerCos (**edotco, Summit Towers, Kirtonkhola, Frontier Towers, BTCL**).
6. **এমএনও নেটওয়ার্কে হ্যান্ডসেট পেনিট্রেশন তথ্য (MNO Handset Penetration)**:
   - Device distribution across each cellular carrier network.
7. **সেবার মান (QoS) সংক্রান্ত তথ্য (Quality of Service)**:
   - Call Drop Rate (CDR), Call Setup Success Rate (CSSR), 4G download/upload throughput benchmarks.
8. **বরাদ্দকৃত তরঙ্গের তথ্য (Allocated Spectrum & Frequencies)**:
   - 406.6 MHz national spectrum allocation across 700 MHz, 900 MHz, 1800 MHz, 2100 MHz, 2.3 GHz, and 2.6 GHz bands.
9. **অপটিক্যাল ফাইবারের তথ্য (Optical Fiber Infrastructure)**:
   - 179,000+ km of national optical fiber (Overhead vs. Underground, Government vs. Private NTTN).
10. **অবৈধ ভিওআইপি ও সেবা বন্ধ করণ (Illegal VoIP & SIM Enforcement)**:
    - BTRC enforcement metrics: illegal SIM deactivations, law-enforcement raids, and seized equipment.

---

### 🗺️ 2. Dynamic Infrastructure Geospatial Mapping
The interactive map dynamically switches infrastructure layers based on the active sector:

- **⚡ When Electricity is Selected**:
  - **Power Generation Plants**: Payra 1,320 MW, Rampal 1,320 MW, Matarbari 1,200 MW, Rooppur NPP 2,400 MW, Sirajganj Combined Cycle, Ashuganj Power Hub, Bibiyana Gas Complex, Ghorashal, Meghnaghat.
  - **Super Grid Substations (400kV / 230kV)**: Aminbazar 400kV, Kaliakoir, Bogura, Ishwardi, Madunaghat, Bibiyana 400kV.
  - **Cross-Border Transmission Corridors**:
    - Adani Godda 400kV Dedicated HVDC Import Line (1,496 MW)
    - Bheramara 500kV HVDC Back-to-Back Interconnection (1,000 MW)
    - Tripura – Comilla 400kV Interconnection (160 MW)
  - **National High-Voltage Grid Lines**: 400kV and 230kV transmission spines rendered with animated golden flow vectors.

- **📡 When Telecom is Selected**:
  - **National BTS Towers & Hubs**: Operator master switching centers (MSC), primary aggregation nodes, and regional base stations.
  - **Submarine Cable Landing Stations**:
    - **SMW-4 (SEA-ME-WE 4)** Landing Station at Cox's Bazar
    - **SMW-5 (SEA-ME-WE 5)** Landing Station at Kuakata, Patuakhali
    - **SMW-6 (SEA-ME-WE 6)** Planned landing site
  - **Optical Fiber Backbones**: Nationwide NTTN transmission links (Summit Communications, Fiber@Home, Bahon, BTCL, and PGCB OPGW).

---

### ⚡ 3. Real-Time Power Grid Generation & Demand Monitoring
Scraped and integrated directly with **Power Grid Bangladesh (PGCB)** ERP systems:
- Real-time generation by fuel type (Gas, Coal, Heavy Fuel Oil, Diesel, Hydro, Solar, Cross-border Import).
- Demand vs. Supply vs. Rotational Load Shedding across all 8 divisions.
- Live grid frequency monitoring (50.00 Hz baseline) with critical excursion alarms.

---

### 🤖 4. PUKU-AI Command Features
- Full branding integration with custom icons and dark glassmorphic command HUD.
- Live telemetry streaming engine with controllable simulation speeds (1x, 2x, 5x).
- Scenario stress tests: *Heatwave Peak Load*, *Rotational Shedding*, *Cyclone Grid Damage*.
- Exportable CSV and JSON data tables for regulatory reporting and dispatch operations.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 / React 19 / Vite (vinext)
- **Styling**: Vanilla CSS tokens & Tailwind CSS with Glassmorphism
- **3D & Mapping Engine**: Three.js, WebGL, GeoJSON SVGLoader, OrbitControls
- **Icons**: Lucide React
- **Data Scraping & Pipeline**: Python 3 (BeautifulSoup4, pypdf, requests)
- **Data Stores**: Static optimized JSON datasets under `public/data/`

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
   cd Central_eye
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
Central_eye/
├── app/
│   ├── favicon.ico              # PUKU-AI Favicon
│   ├── globals.css              # Glassmorphic HUD theme & layout rules
│   ├── infrastructure-scene.tsx # Three.js WebGL 3D Bangladesh map
│   ├── layout.tsx               # Root layout & PUKU-AI metadata
│   └── page.tsx                 # Main Command Center UI, Sub-menus & Map Controller
├── components/
│   ├── btrc-telecom-views.tsx   # 10 comprehensive BTRC statutory data views & charts
│   └── ui/                      # UI primitives
├── lib/
│   ├── btrc-telecom.ts          # BTRC data models, types, and summary metadata
│   ├── infrastructure-assets.ts # 41 mapped Electricity & Telecom infrastructure assets
│   ├── powergrid-electricity.ts # PGCB generation & load shedding data models
│   ├── telemetry-pipeline.ts    # Real-time streaming simulation engine
│   └── utils.ts                 # Utility helpers
├── public/
│   ├── data/                    # Scraped historical JSON datasets (BTRC & PGCB)
│   ├── puku-ai.png              # PUKU-AI branding logo
│   └── bangladesh.json          # GeoJSON boundaries of Bangladesh
└── scripts/
    ├── scrape_btrc.py           # Automated BTRC portal scraping script
    └── scrape_powergrid.py      # Automated PGCB ERP scraping script
```

---

## 📜 License

Distributed under the MIT License.
