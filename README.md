# Central Eye — National Infrastructure Intelligence Platform 👁️🇧🇩

Central Eye is Bangladesh’s unified national infrastructure intelligence command center platform built for the **Ministry of Information and Communication Technology (ICT Ministry)**. It provides real-time telemetry streaming, interactive WebGL 3D/2D geospatial mapping, regional load shedding and power shortage monitoring, and 2G/3G/4G/5G telecommunication spectrum analytics across all 8 administrative divisions of Bangladesh.

---

## 🚀 Key Features

### ⚡ 1. Real-Time Telemetry Pipeline & Live Ticker
- **Live Event Stream**: Continuous real-time updates (every 2.5s) monitoring grid frequency fluctuations, power deficits, latency shifts, and network outages.
- **Simulation Control Engine**: Toggle streaming, adjust simulation speed (**1x, 2x, 5x**), and select crisis scenarios:
  - *Normal Grid Operations*
  - *Peak Heatwave Demand Spike*
  - *Severe Rotational Load Shedding*
  - *Coastal Cyclone / Storm Outage*

### 🔋 2. Electricity Shortage & Load Shedding Command
- **National Power Shortage (MW)**: Real-time calculation of national demand vs. supply with shortfall percentages.
- **Regional Load Shedding Breakdown**: Division-by-division active load shedding MW, feeder counts, rotational schedules, and average daily outage hours.
- **Grid Stability Gauge**: Live grid frequency tracking (target: **50.0 Hz**) with automated threshold alert triggers.

### 📡 3. Telco 3G / 4G / 5G Network & Spectrum Analytics
- **Mobile Site Uptime**: Real-time monitoring of active tower sites (% uptime, online vs. backup battery towers).
- **Generation Migration**: Tracker for 2G, 3G, 4G, and 5G network distribution across major operators (**Grameenphone, Robi Axiata, Banglalink, Teletalk**).
- **Subsea Fiber Landing**: Bandwidth utilization and round-trip latency metrics for **SEA-ME-WE 4** (Cox's Bazar) and **SEA-ME-WE 5** (Kuakata).

### 🗺️ 4. Interactive 3D WebGL Geospatial Explorer
- Built with **Three.js & WebGL** extruding geographic division shapes, 3D lattice power pylons, mobile transmission towers, curved high-voltage power lines, and animated fiber link particles.
- **Division Matrix**: Full breakdown across all 8 divisions (*Dhaka, Chattogram, Rajshahi, Khulna, Barishal, Sylhet, Rangpur, Mymensingh*).
- 2D fallback map mode with zoom, pan, and asset inspection dialogs.

### 📱 5. Fully Mobile Responsive Architecture
- Responsive CSS grid & flex layout supporting all device breakpoints (**320px, 480px, 768px, 1024px, 1280px, 1600px+**).
- Horizontal scrollable container for wide telemetry data tables.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 / Vite (vinext)
- **UI Library**: React 19, Tailwind CSS, Lucide Icons, Radix / Shadcn UI components
- **3D Engine**: Three.js, SVGLoader, OrbitControls
- **State & Pipeline**: Real-time custom state engine (`lib/telemetry-pipeline.ts`)

---

## 📦 Getting Started

### Prerequisites
- Node.js `>= 22.13.0`
- npm `>= 10.0.0`

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

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```
dashboard/
├── app/
│   ├── globals.css              # Custom design system & breakpoint CSS
│   ├── infrastructure-scene.tsx # Three.js WebGL 3D Bangladesh map
│   ├── layout.tsx               # Root layout & Metadata
│   └── page.tsx                 # Central Eye Command Center UI & Tabs
├── components/
│   └── ui/                      # Radix / Shadcn UI primitives
├── lib/
│   ├── telemetry-pipeline.ts    # Real-time data streaming pipeline & simulation scenarios
│   └── utils.ts                 # Class merging utilities
└── public/
    └── bangladesh.json          # GeoJSON boundaries data
```

---

## 📜 License

Distributed under the MIT License.
