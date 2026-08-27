import React from 'react';
import { Play, Sliders, Printer, FileCode, Camera, Eye, Music, ShieldCheck, Cpu, Smartphone, Download, Layers, Wind, Sparkles, Terminal } from 'lucide-react';
import { AppMode } from '../types';

interface HomeScreenProps {
  setMode: (mode: AppMode) => void;
  onOpenCalibration: () => void;
  onOpenPrintableSheet: () => void;
  onOpenReport: () => void;
  onOpenTutorial: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  setMode,
  onOpenCalibration,
  onOpenPrintableSheet,
  onOpenReport,
  onOpenTutorial,
}) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        {/* Main Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>BE Final Year Major Project &bull; Piano on Pages</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Virtual Piano Using <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Computer Vision</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Play piano on printed paper or wave your hands in the air using the floating dummy layout.
            Zero hardware cost with real-time MediaPipe fingertip tracking and perspective homography.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-3 sm:gap-4">
            <button
              onClick={() => setMode(AppMode.PLAYING)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 flex items-center space-x-2 transition transform hover:-translate-y-0.5"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Playing Piano</span>
            </button>

            <button
              onClick={onOpenTutorial}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-semibold text-base border border-cyan-500/40 flex items-center space-x-2 transition shadow-md"
            >
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>Watch / Read Tutorial</span>
            </button>

            <button
              onClick={onOpenPrintableSheet}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-base border border-slate-700/80 flex items-center space-x-2 transition"
            >
              <Printer className="w-5 h-5 text-emerald-400" />
              <span>Get Paper Piano (A4 PDF)</span>
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            onClick={() => setMode(AppMode.PLAYING)}
            className="group bg-slate-900/90 hover:bg-slate-800/90 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition cursor-pointer flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. Play on Paper or Air</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Play on physical printed paper sheets or floating virtual keys in mid-air using MediaPipe landmark #8 index fingertip tracking.
              </p>
            </div>
            <div className="mt-4 text-xs font-semibold text-indigo-400 flex items-center space-x-1">
              <span>Open Playing Mode</span>
              <span>&rarr;</span>
            </div>
          </div>

          <div
            onClick={onOpenCalibration}
            className="group bg-slate-900/90 hover:bg-slate-800/90 p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. 4-Corner Homography</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                3x3 Perspective Homography Matrix math corrects paper tilt, mapping camera coordinates into rectified 2D keyboard bounds.
              </p>
            </div>
            <div className="mt-4 text-xs font-semibold text-cyan-400 flex items-center space-x-1">
              <span>Calibrate Sheet</span>
              <span>&rarr;</span>
            </div>
          </div>

          <div
            onClick={onOpenTutorial}
            className="group bg-slate-900/90 hover:bg-slate-800/90 p-6 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition cursor-pointer flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. UNET & Key Geometry</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                3-cell (C,D,E) and 4-cell (F,G,A,B) regional key geometry with 6/9 height black keys and touch collision algorithms.
              </p>
            </div>
            <div className="mt-4 text-xs font-semibold text-purple-400 flex items-center space-x-1">
              <span>View Guide</span>
              <span>&rarr;</span>
            </div>
          </div>

          <div
            onClick={onOpenReport}
            className="group bg-slate-900/90 hover:bg-slate-800/90 p-6 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition cursor-pointer flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">4. Python & Android Code</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complete Python 3.12 (OpenCV, ONNX, MediaPipe, NumPy) & Android Studio Kotlin source code ready for download and execution.
              </p>
            </div>
            <div className="mt-4 text-xs font-semibold text-amber-400 flex items-center space-x-1">
              <span>View Code & Report</span>
              <span>&rarr;</span>
            </div>
          </div>
        </div>

        {/* System Architecture Flow Diagram */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>Computer Vision Pipeline & Key Architecture</span>
              </h2>
              <p className="text-xs text-slate-400">Sequential real-time execution flow from video capture to sub-20ms audio synthesis</p>
            </div>
            <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2.5 py-1 rounded border border-slate-700">Python & Web Ready</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
            {[
              { title: 'Camera', desc: 'Live Stream', color: 'border-blue-500/40 bg-blue-500/10 text-blue-300' },
              { title: 'Segmentation', desc: 'UNET / ROI', color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' },
              { title: 'Homography', desc: 'Perspective Matrix', color: 'border-teal-500/40 bg-teal-500/10 text-teal-300' },
              { title: 'Hand Detector', desc: 'MediaPipe Hands', color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300' },
              { title: 'Index Fingertip', desc: 'Landmark #8', color: 'border-purple-500/40 bg-purple-500/10 text-purple-300' },
              { title: 'Geometry Map', desc: '3+4 Cell Bounds', color: 'border-pink-500/40 bg-pink-500/10 text-pink-300' },
              { title: '6/9 Black Keys', desc: 'Accidental Map', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
              { title: 'Audio Synth', desc: 'Low-Latency Sound', color: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
            ].map((step, idx) => (
              <div key={idx} className={`p-3 rounded-xl border ${step.color} flex flex-col justify-center space-y-1`}>
                <span className="text-[10px] font-mono opacity-80 uppercase tracking-widest">Step {idx + 1}</span>
                <span className="text-xs font-bold leading-tight">{step.title}</span>
                <span className="text-[10px] opacity-75">{step.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-6">
        <p>Virtual Piano Using Computer Vision &bull; BE Final Year Major Project &bull; Piano on Pages</p>
      </div>
    </div>
  );
};
