# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **filter regeneration factory dashboard** (`鈺祥企業柳營再生戰情中心`) - an interactive IoT dashboard system for monitoring filter regeneration manufacturing processes. The project demonstrates a WISE-IOT concept for vendor communication and includes simulated AI-powered analytics.

**Core Process Flow**: Arrival → Degumming → Baking → Testing → Packaging

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (opens on localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Technology Stack
- **Build Tool**: Vite (ES modules, fast HMR)
- **Frontend**: Vanilla JavaScript (no framework dependencies)
- **Charts**: Chart.js for data visualizations
- **Styling**: CSS with CSS Grid for responsive layouts
- **Deployment**: Vercel (auto-deploy on main branch push)

### Application Structure

The application uses a **dual-entry architecture**:

1. **`index.html`** → **`src/main.js`** (Vite-based modular approach)
   - Main entry point using ES modules
   - Imports Chart.js, CSS, and AI modules
   - Renders dashboard content dynamically

2. **`factory-dashboard.html`** (Standalone HTML file)
   - Self-contained version with inline CSS/JS
   - Uses CDN Chart.js
   - Legacy approach for compatibility

### Key Modules

#### Core Application (`src/main.js`)
- **Dashboard Rendering**: Programmatically creates HTML content for factory monitoring widgets
- **Chart Management**: Initializes 5 Chart.js instances (production, pareto, SPC, AOI, energy)
- **Real-time Updates**: Updates metrics every 5 seconds with simulated data
- **Time Display**: Live clock updating every second

#### AI Engine (`src/ai-engine.js`)
- **4 AI Models**: PredictiveMaintenance, QualityAnalysis, AnomalyDetection, ProcessOptimization
- **Real-time Analysis**: Runs every 10 seconds analyzing simulated equipment data
- **Alert System**: Generates maintenance alerts and quality insights
- **Recommendation Engine**: Provides optimization suggestions based on process data

#### AI Components (`src/ai-components.js`)
- **Dynamic UI Generation**: Creates 4 AI widgets (insights, recommendations, health, maintenance)
- **Event-Driven Updates**: Listens for AI engine events and updates UI accordingly
- **Export Functionality**: JSON report export for AI analysis results
- **Health Monitoring**: Visual indicators for AI system status

#### Styling (`src/style.css`)
- **Responsive Grid**: 6-column desktop layout, adapts to 4/3/2 columns on smaller screens
- **Glass Morphism Design**: Backdrop-filter blur effects with translucent backgrounds
- **Widget System**: Standardized `.widget` class with hover effects and scrollable content
- **Color Coding**: Status colors (good/warning/alert) for different metrics

## Data Architecture

### Factory Monitoring Metrics
- **Process Efficiency**: FPY (First Pass Yield), RTY (Roll Throughput Yield), OEE
- **Bottleneck Analysis**: Utilization rates, wait times, retention percentages for degumming/baking/testing stations
- **Quality Control**: Defect analysis (incomplete degumming, uneven baking, contamination, cracks)
- **Environmental**: Temperature, humidity, AMC concentration monitoring
- **Equipment Status**: Oven temperatures, baking times, operational states

### AI Analytics Features
- **Predictive Maintenance**: Equipment failure predictions with probability scores
- **Quality Root Cause Analysis**: Automated diagnosis of quality issues
- **Anomaly Detection**: Real-time process deviation identification
- **Process Optimization**: Efficiency improvement recommendations

## Development Guidelines

### Adding New Widgets
1. **HTML Structure**: Follow the `.widget` → `.widget-title` → `.widget-content` pattern
2. **Responsive Design**: Test on 6/4/3/2 column grid layouts
3. **Chart Integration**: Use Chart.js with white text defaults, no grid display
4. **Data Updates**: Implement periodic refresh for live dashboard feel

### Working with AI Modules
- **AI Engine**: Extend model classes for new analysis types
- **UI Components**: Use `createAIWidget()` pattern for consistent styling
- **Event System**: Use CustomEvents for AI ↔ UI communication
- **Model Badges**: Include AI model name and tech stack in widget footers

### Styling Conventions
- **Color Palette**: Blue gradient background (#1e3c72 → #2a5298), cyan accents (#00d4ff)
- **Status Colors**: Green (#4CAF50), Orange (#FF9800), Red (#f44336)
- **Glass Effects**: Use `backdrop-filter: blur(10px)` with rgba backgrounds
- **Typography**: Microsoft JhengHei for Chinese text, Arial fallback

## Deployment

- **Platform**: Vercel with automatic deployment
- **Configuration**: `vercel.json` redirects all routes to index.html (SPA behavior)
- **Production URL**: https://wise-iot-center.vercel.app
- **Branch Strategy**: Deploy main branch automatically

## Data Integration Notes

This is a **demonstration system** with simulated data. For production deployment:
- Replace mock data generators with real IoT data sources
- Integrate with WMS tracking systems for serial number traceability
- Connect to ERP APIs for work order and material tracking
- Add real equipment IoT sensor data streams
- Implement actual AI/ML model endpoints instead of simulation classes

## Locale and Content

- **Primary Language**: Traditional Chinese (zh-TW)
- **Domain Context**: Filter regeneration manufacturing for industrial air filtration
- **Terminology**: Uses traditional manufacturing terms (OEE, FPY, RTY, SPC, Cpk)