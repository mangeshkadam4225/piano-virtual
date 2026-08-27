# Virtual Piano CV — Architecture & Developer Documentation

This document explains the software architecture, computer vision pipeline, project directory layout, and step-by-step troubleshooting guide for developers and evaluators.

---

## 🛠 Project Overview

**Virtual Piano Using Computer Vision** is an interactive computer vision web and native mobile application that allows users to play acoustic piano notes by waving their hands over a printed paper piano sheet or in mid-air using a webcam or smartphone camera.

---

## 📁 Directory Structure & File Map

```
virtual-piano-cv-2/
├── index.html                  # HTML entry point with MediaPipe CDN & Google Fonts
├── package.json                # Project dependencies, build scripts, and metadata
├── tsconfig.json               # TypeScript compiler options
├── vite.config.ts              # Vite bundle configuration & Tailwind v4 plugin
├── .gitignore                  # Git ignore patterns (node_modules, dist, etc.)
├── README.md                   # Primary project documentation & quickstart
├── ARCHITECTURE.md             # Detailed developer guide & file map (this file)
└── src/
    ├── main.tsx                # Application bootstrap rendering <App /> into DOM
    ├── App.tsx                 # Root React component, state management, modal controllers
    ├── types.ts                # TypeScript interfaces, types, enums (KeyNote, AppMode, etc.)
    ├── index.css               # Global Tailwind CSS imports and custom animations
    │
    ├── components/             # React UI Components & Overlay Panels
    │   ├── HomeScreen.tsx           # Main landing hero section, feature cards & execution flow
    │   ├── Navbar.tsx               # Top navigation bar (Mode toggle, Calibration, Settings, PDF)
    │   ├── PianoCanvas.tsx          # Real-time WebGL video stream, fingertip tracking & key canvas overlay
    │   ├── CalibrationWizard.tsx    # Interactive 4-corner homography calibration modal & auto-detection
    │   ├── PrintableSheetModal.tsx  # Printable A4 PDF sheet generator modal & preview
    │   ├── ProjectReportModal.tsx   # Interactive academic report viewer & code exporter
    │   ├── SettingsModal.tsx        # Audio/Visual settings (Instrument, Volume, Sensitivity, Debug)
    │   ├── AboutModal.tsx           # BE Final Year Major Project credits & technical specs
    │   ├── TutorialModal.tsx        # Step-by-step user guide & camera setup tips
    │   └── ActivityLogPanel.tsx     # Real-time event log & diagnostic logger panel
    │
    └── services/               # Computer Vision, Math & Audio Engine Services
        ├── handTracker.ts           # MediaPipe Hands API wrapper & fingertip landmark smoothing
        ├── opencvProcessor.ts       # Contour detection, sheet boundary extraction & homography helper
        ├── perspectiveTransform.ts  # 3x3 Perspective Homography Matrix math & 2D point warping
        ├── audioEngine.ts           # Low-latency Web Audio API polyphonic acoustic synthesizer
        ├── printableSheet.ts        # jsPDF engine for generating A4 paper piano sheets
        ├── logService.ts            # Centralized activity & performance telemetry logging engine
        ├── pythonProjectGenerator.ts# Bundles full standalone Python 3.12 (OpenCV, MediaPipe) source code
        └── androidProjectGenerator.ts# Bundles full Kotlin Android Studio CameraX application project
```

---

## ⚡ Computer Vision & Audio Pipeline Details

### 1. Camera Frame Ingestion (`PianoCanvas.tsx`)
- Captures 30–60 FPS video stream from user webcam using HTML5 `navigator.mediaDevices.getUserMedia`.
- Renders live video onto an HTML `<canvas>` element for sub-millisecond drawing overlays.

### 2. MediaPipe Hand Landmark Tracking (`handTracker.ts`)
- Ingests video frame into `@mediapipe/hands`.
- Tracks 21 3D hand landmarks per hand.
- Extracts **Index Fingertip (Landmark #8)** and applies exponential moving average (EMA) smoothing to eliminate camera jitter.

### 3. Perspective Homography Transformation (`perspectiveTransform.ts`)
- Maps arbitrary camera coordinates $(x_{cam}, y_{cam})$ to a normalized 2D piano sheet bounding box $[0, 1] \times [0, 1]$.
- Calculates $3 \times 3$ Homography Matrix $H$ from 4 calibrated corners (Top-Left, Top-Right, Bottom-Right, Bottom-Left) using Gaussian Elimination.
- Computes warped coordinates:
  $$u = \frac{h_{11}x + h_{12}y + h_{13}}{h_{31}x + h_{32}y + h_{33}}, \quad v = \frac{h_{21}x + h_{22}y + h_{23}}{h_{31}x + h_{32}y + h_{33}}$$

### 4. Key Polygon Spatial Collision (`types.ts` & `PianoCanvas.tsx`)
- Divides sheet geometry into **8 White Keys (C4 to C5)** and **5 Black Keys (C#4, D#4, F#4, G#4, A#4)**.
- Performs point-in-polygon collision checks to identify which key note is pressed.

### 5. Low-Latency Sound Synthesis (`audioEngine.ts`)
- Utilizes Web Audio API `AudioContext` with custom polyphonic gain envelopes and bandpass filtering.
- Synthesizes realistic acoustic piano frequency harmonics with sub-20ms audio latency.

---

## 🚀 How to Run & Build the Project

### Prerequisites
- Node.js version **18.0.0 or higher**
- `npm` or `bun` package manager

### Commands
```bash
# 1. Install project dependencies
npm install

# 2. Start local development server (http://localhost:3000)
npm run dev

# 3. Type-check TypeScript code
npx tsc --noEmit

# 4. Build production bundle into dist/
npm run build

# 5. Preview production build locally
npm run preview
```

---

## 🔧 Common Errors & How to Fix Them

| Problem / Error | Cause | Resolution |
| :--- | :--- | :--- |
| **`sh: vite: command not found`** | Node modules missing | Run `npm install` before running build scripts. |
| **Camera access blocked / blank screen** | Browser permissions denied or HTTP host | Allow camera permission in browser URL bar. Ensure server runs on `localhost` or HTTPS. |
| **Audio does not play on finger touch** | Browser Web Audio autoplay policy suspended | Click anywhere on the webpage or press "Start Playing Piano" to un-mute AudioContext. |
| **Fingertip tracking lag / low FPS** | Integrated GPU overload or high camera resolution | Lower video resolution in `SettingsModal.tsx` or enable hardware acceleration in browser. |
| **Paper keys misaligned** | Tilting camera angle | Click **Calibrate** in Navbar and adjust the 4 yellow corner pins to align with your paper sheet. |
| **GitHub push error 403 Forbidden** | macOS Keychain credential conflict | Use a GitHub Personal Access Token (PAT) with `git push https://<TOKEN>@github.com/...` |

---

## 👨‍💻 Developer & Examiner Credits
- **BE Final Year Major Project**: Computer Science & Engineering Department
- **Technologies**: React 19, TypeScript, MediaPipe, OpenCV, Web Audio API, Tailwind CSS, Vite
