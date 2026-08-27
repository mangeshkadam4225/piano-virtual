# 🎹 Virtual Piano Using Computer Vision

> **BE Final Year Major Project &bull; Department of Computer Engineering**  
> *Real-Time Hand Landmark Tracking & 4-Corner Perspective Homography Matrix Math*

---

[![React 19](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands_v0.4-orange.svg)](https://developers.google.com/mediapipe)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-Apache_2.0-green.svg)](LICENSE)

---

## 📌 Executive Summary & Abstract

Physical electronic keyboards and acoustic pianos are expensive (costing ₹3,000 to ₹15,000+), heavy, and non-portable, creating significant financial barriers for music learners. This project introduces **Virtual Piano CV**, a high-performance computer vision system that transforms any standard **A4 printed paper sheet** or virtual air space into a fully functional acoustic piano instrument using a webcam or smartphone camera.

The system integrates:
1. **MediaPipe Hand Landmarker** for real-time sub-millimeter 3D tracking of index fingertip (Landmark #8).
2. **OpenCV Perspective Homography Transformation** ($3 \times 3$ matrix) to eliminate perspective distortion from angled camera views.
3. **Polyphonic Web Audio Engine** providing sub-20ms low-latency acoustic piano sound synthesis.

---

## 🚀 Key Features

- 📄 **Paper Piano Mode**: Print an A4 sheet, place it under your webcam, and play notes by touching the printed keys.
- 💨 **Air Floating Mode**: Play virtual 3D hologram keys floating in mid-air using fingertip depth tracking.
- 📐 **4-Corner Homography Calibration**: Interactive corner pinning tool that calculates perspective transformation matrices in real time.
- 🔊 **Sub-20ms Audio Latency**: High-definition polyphonic Web Audio API synthesis with acoustic harmonics.
- 📑 **Instant PDF Sheet Generator**: Built-in jsPDF generator to print custom A4 piano layouts on demand.
- 🐍 **Standalone Python Exporter**: Export runnable Python 3.12 OpenCV & MediaPipe scripts directly from the web interface.
- 📱 **Android Kotlin Project Generator**: Generate a complete Android Studio CameraX app project ready for mobile deployment.

---

## 🏗 System Architecture & Pipeline

```
┌─────────────────────────┐
│ Smartphone / Webcam     │ (Live 30-60 FPS Frame Feed)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ MediaPipe Hands Engine  │ (Tracks Landmark #8 Index Fingertip)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 3x3 Homography Matrix   │ (Warps skewed camera (x,y) to rectified 2D sheet coordinates)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Key Polygon Collision   │ (Determines C4 to C5 white/black key intersection)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Web Audio Synthesizer   │ (Plays polyphonic acoustic note with low latency)
└─────────────────────────┘
```

---

## 📐 Mathematical Model: Perspective Homography

To transform camera coordinates $(x_{cam}, y_{cam})$ into normalized 2D sheet coordinates $(u, v) \in [0, 1] \times [0, 1]$, a $3 \times 3$ Homography matrix $H$ is computed from 4 reference corners:

$$\begin{bmatrix} u \cdot w \\ v \cdot w \\ w \end{bmatrix} = \begin{bmatrix} h_{11} & h_{12} & h_{13} \\ h_{21} & h_{22} & h_{23} \\ h_{31} & h_{32} & h_{33} \end{bmatrix} \begin{bmatrix} x \\ y \\ 1 \end{bmatrix}$$

Warped point mapping is computed as:
$$u = \frac{h_{11}x + h_{12}y + h_{13}}{h_{31}x + h_{32}y + h_{33}}, \quad v = \frac{h_{21}x + h_{22}y + h_{23}}{h_{31}x + h_{32}y + h_{33}}$$

---

## 📦 Directory Structure

```
virtual-piano-cv-2/
├── ARCHITECTURE.md             # In-depth architectural guide & component map
├── README.md                   # Primary project documentation (this file)
├── index.html                  # HTML5 entry with MediaPipe CDN
├── package.json                # Project dependencies & scripts
├── vite.config.ts              # Vite configuration with Tailwind CSS plugin
├── tsconfig.json               # TypeScript configuration
└── src/
    ├── App.tsx                 # Root component & state management
    ├── main.tsx                # React app entry point
    ├── types.ts                # TypeScript data interfaces & types
    ├── components/             # UI Components (Canvas, Calibration, Modals, Navbar)
    └── services/               # Core Services (Hand tracking, OpenCV, Homography, Sound)
```

---

## ⚙️ Quickstart & Local Setup

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **bun**

### Step-by-Step Installation

1. **Clone Repository**:
   ```bash
   git clone https://github.com/mangeshkadam4225/piano-virtual.git
   cd piano-virtual
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`. Allow camera permissions when prompted.

4. **Build Production Bundle**:
   ```bash
   npm run build
   ```

---

## 🛠 Troubleshooting & Common Fixes

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| `sh: vite: command not found` | `node_modules` not installed | Run `npm install` before building. |
| Camera image not loading | Camera permission blocked or missing HTTPS | Grant camera access in browser address bar. |
| Audio does not play | Browser autoplay restrictions | Click anywhere on screen to enable Web Audio Context. |
| Hand tracking unstable | Poor ambient room lighting | Increase room lighting or adjust tracking sensitivity in Settings. |
| GitHub Push Error 403 | Saved credentials conflict | Follow instructions in `ARCHITECTURE.md` to push using a Personal Access Token. |

---

## 📄 License & Credits

Developed as a **BE Final Year Major Project** for Department of Computer Engineering.  
Licensed under the [Apache License 2.0](LICENSE).
