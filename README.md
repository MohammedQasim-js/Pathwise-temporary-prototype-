# Pathwise 🛒

> **See the path. Fix the floor.**  
> Retail floor flow analytics and layout optimization platform.

[![Next.js](https://img.shields.io/badge/Next.js-15.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%204.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Canvas](https://img.shields.io/badge/HTML5-Canvas%202D-E34F26?logo=html5)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

---

## 📌 Overview

Retail stores lose revenue every day to aisle bottlenecks, unvisited dead zones, and poorly placed promotional displays—usually without store managers knowing why.

**Pathwise** bridges the gap between raw in-store video surveillance/tracking and floor operations. By combining continuous pedestrian flow simulation, aisle capacity modeling, and interactive "what-if" fixture placement, Pathwise transforms foot-traffic friction into quantifiable layout improvements.

---

## ✨ Key Features

### 1. 🗺️ Interactive Digital Twin Floor Canvas (`FloorView`)
- **Physics-Aware Shopper Simulation**: Simulates shopper agents traveling along calibrated store routes with dynamic speed drops during congestion.
- **Multi-Layer Analytical Overlays**:
  - **🔥 Heatmap**: Density-based foot traffic distribution across the entire floor.
  - **⏱️ Dwell Time**: Spotlights zones and end-caps where shoppers pause and browse.
  - **🌊 Flow Paths**: Visualizes dominant shopper routes with particle-based velocity indicators.
  - **🏷️ Zone Classification**: Automatically categorizes areas into **Hot Zones**, **Pass-Throughs**, **Hidden Gems**, and **Dead Zones** based on visitor volume vs. dwell time.
  - **🎯 Sensor Confidence**: Displays observation confidence and tracking coverage across the space.

### 2. 🔀 "What-If" Layout Sandbox
- **Interactive Fixture Manipulation**: Drag or relocate promotional display units (e.g., `Display D1`) across aisles.
- **Instant Capacity Recalculation**: Live re-computation of aisle utilization ($U = \frac{Q}{Q_{\max} \cdot W_{\text{eff}}}$) and bottleneck warnings as fixtures move.
- **Preset Action Recommendations**: One-click preview of layout fixes (e.g., clearing the Aisle 2 entrance bottleneck by moving Display D1 into the open beverage concourse).

### 3. 🕒 Time-of-Day Traffic Scrubbing & Congestion Replay
- **Hourly Timeline Slider**: Scrub across operating hours (09:00 to 21:00) with realistic shopper volume scaling and peak rush hour detection (19:00).
- **Bottleneck Replay Mode**: Trigger animated particle replays focused on specific congested segments to visually inspect slowdowns and queue formations.

### 4. 📊 Executive Action Report (`ReportView`)
- **Actionable Merchandising Insights**: Quantified recommendations showing exact utilization reductions and projected lift in engaged shoppers.
- **Zone Performance Matrix**: Comprehensive table tracking visitor count, dwell time, and traffic confidence per department.
- **One-Click Export**: Easy clipboard summary generation and print-optimized reporting.

### 5. 🤖 Computer Vision & ML Blueprint (`PlanView`)
- Detailed implementation roadmap for real-world deployment:
  - **Person Detection**: YOLO11 / RT-DETR for bounding box detection at 8–10 FPS.
  - **Multi-Object Tracking**: ByteTrack and BoT-SORT for persistent trajectory identification.
  - **Click-to-Calibrate Homography**: Transform camera perspective pixels into metric floor coordinates ($0.3\text{ m}$ tolerance).
  - **Staff vs. Shopper Filtering**: Trajectory heuristics and uniform color filtering.
  - **Privacy by Design**: Edge vectorization without storing facial data or biometric PII.

---

## 🏗️ Project Architecture

```
pathwise/
├── app/
│   ├── layout.tsx         # Root layout with Bricolage Grotesque & Instrument Sans fonts
│   ├── page.tsx           # Main application state, theme switching & tab router
│   └── globals.css        # Tailwind CSS imports & theme definitions
├── components/
│   ├── canvas/
│   │   └── floor-canvas.tsx   # Canvas component handling rendering loop & interaction
│   ├── ui/
│   │   └── header.tsx         # Branding, navigation tabs & dark/light mode toggle
│   └── views/
│       ├── floor-view.tsx     # Digital twin floor analyzer & fixture sandbox
│       ├── report-view.tsx    # Executive layout action report & analytics
│       └── plan-view.tsx      # CV/ML implementation blueprint & roadmap
├── lib/
│   ├── canvas-renderer.ts     # High-performance 2D Canvas rendering & color LUTs
│   ├── store-engine.ts        # Floor geometry, capacity formulas, zones & paths
│   ├── types.ts               # Data models for fixtures, zones, paths & analysis
│   └── utils.ts               # Styling & class helper utilities
├── metadata.json              # Application metadata and capabilities
└── package.json               # Dependencies and build scripts
```

---

## 🧮 Mathematical & Capacity Model

Pathwise applies retail flow dynamics to assess congestion:
- **Maximum Aisle Flow Rate ($Q_{\max}$)**: Standardized to $0.12\text{ persons} / \text{s} / \text{m}$ of usable width.
- **Effective Aisle Width ($W_{\text{eff}}$)**: Clearance distance minus unusable edge margins ($W_{\min} = 0.4\text{ m}$).
- **Bottleneck Thresholds**:
  - $U \ge 0.80$: **Bottleneck** (Severe congestion, significant shopper slowdown)
  - $0.60 \le U < 0.80$: **Watch** (Elevated density, potential slowdown)
  - $U < 0.60$: **OK** (Smooth, unhindered pedestrian flow)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm`, `pnpm`, or `yarn`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MohammedQasim-js/Pathwise-temporary-prototype-.git
   cd Pathwise-temporary-prototype-
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional):**
   Copy the example environment file if you intend to enable AI Studio server-side integrations:
   ```bash
   cp .env.example .env.local
   ```
   Add your Gemini API key to `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Core Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5.9](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animation**: [Motion (`motion/react`)](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Rendering**: Custom 2D HTML5 Canvas engine with LUT color lookup tables

---

## 🔒 Privacy by Design

Pathwise adheres to strict physical retail privacy standards:
- **No PII Recorded**: No face recognition, demographic profiling, or identity tracking.
- **Edge Trajectory Extraction**: Video feeds are processed locally on edge nodes; only coordinate paths $(x, y, t)$ are stored for analytics.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
