import React, { useState } from 'react';
import { X, FileText, Code, Copy, Check, Download, Layers, Cpu, BookOpen, Smartphone, Terminal } from 'lucide-react';
import { ANDROID_KOTLIN_PROJECT, AndroidFile } from '../services/androidProjectGenerator';
import { PYTHON_PROJECT_FILES, PythonFile } from '../services/pythonProjectGenerator';

interface ProjectReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectReportModal: React.FC<ProjectReportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'python_code' | 'android_code'>('report');
  const [selectedAndroidFile, setSelectedAndroidFile] = useState<AndroidFile>(ANDROID_KOTLIN_PROJECT[0]);
  const [selectedPythonFile, setSelectedPythonFile] = useState<PythonFile>(PYTHON_PROJECT_FILES[3]); // main.py or piano_geometry
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyCode = (content: string, filename: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full p-6 space-y-6 text-slate-100 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Project Documentation, Python & Android Source Code</h2>
              <p className="text-xs text-slate-400">Virtual Piano Using Computer Vision &bull; Final Year Major Project</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 flex-shrink-0">
          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition ${
              activeTab === 'report' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Complete Project Report & Viva Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('python_code')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition ${
              activeTab === 'python_code' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Python 3.12 Version ({PYTHON_PROJECT_FILES.length} Files)</span>
          </button>

          <button
            onClick={() => setActiveTab('android_code')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition ${
              activeTab === 'android_code' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Android Studio Kotlin Code ({ANDROID_KOTLIN_PROJECT.length} Files)</span>
          </button>
        </div>

        {/* Tab 1: Project Report Documentation */}
        {activeTab === 'report' && (
          <div className="overflow-y-auto space-y-6 pr-2 text-xs sm:text-sm text-slate-300 flex-1">
            {/* Title & Abstract */}
            <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700/80 space-y-3">
              <h3 className="text-base font-bold text-amber-400 flex items-center space-x-2">
                <Cpu className="w-4 h-4" />
                <span>1. Abstract & Introduction</span>
              </h3>
              <p className="leading-relaxed">
                Physical electronic piano keyboards cost around ₹3,000 to ₹15,000, presenting a financial barrier for music students and beginners. This project proposes a low-cost <strong>Virtual Piano Using Computer Vision</strong> that transforms an inexpensive paper piano printout (or air dummy layout) into an interactive musical instrument using a standard smartphone camera.
              </p>
              <p className="leading-relaxed">
                The application uses <strong>OpenCV</strong> for paper boundary contour extraction and <strong>4-Point Perspective Homography Matrix transformation</strong> to correct phone tilt. It integrates <strong>MediaPipe Hand Landmarker</strong> for tracking the index fingertip landmark (#8) in real time and maps fingertip coordinates into 2D piano key polygons, triggering low-latency sound synthesis.
              </p>
            </div>

            {/* UNET & Geometry Breakdown */}
            <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700/80 space-y-3">
              <h3 className="text-base font-bold text-cyan-400 flex items-center space-x-2">
                <Layers className="w-4 h-4" />
                <span>2. Segmentation & Key Geometry Mathematics</span>
              </h3>
              <p className="leading-relaxed">
                The paper keyboard region is partitioned into two distinct geometric groups:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900 rounded-lg border border-rose-500/30">
                  <span className="font-bold text-rose-400 block mb-1">Small Region (C, D, E)</span>
                  <span className="text-slate-400">Bottom line divided into 3 equal white cells. Top line divided into 2 black cells (C#4, D#4) with 6/9 height.</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-blue-500/30">
                  <span className="font-bold text-blue-400 block mb-1">Big Region (F, G, A, B)</span>
                  <span className="text-slate-400">Bottom line divided into 4 equal white cells. Top line divided into 3 black cells (F#4, G#4, A#4) with 6/9 height.</span>
                </div>
              </div>
            </div>

            {/* Homography Math Equations */}
            <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700/80 space-y-3">
              <h3 className="text-base font-bold text-indigo-400 flex items-center space-x-2">
                <Layers className="w-4 h-4" />
                <span>3. Perspective Homography Matrix Model</span>
              </h3>
              <p className="leading-relaxed">
                To transform skewed camera perspective coordinates $(x, y)$ into standard 2D normalized sheet space $(u, v)$, a $3 \times 3$ Homography matrix $H$ is computed from 4 reference corner points:
              </p>
              <div className="bg-slate-950 p-3 rounded-lg font-mono text-cyan-300 text-xs overflow-x-auto text-center border border-slate-800">
                {`[ u*w ]   [ h11 h12 h13 ] [ x ]
[ v*w ] = [ h21 h22 h23 ] [ y ]
[  w  ]   [ h31 h32 h33 ] [ 1 ]`}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Python Source Code Browser */}
        {activeTab === 'python_code' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden">
            {/* File List */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 overflow-y-auto max-h-[60vh]">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2">Python 3.12 Files</span>
              {PYTHON_PROJECT_FILES.map((file) => (
                <div
                  key={file.filename}
                  onClick={() => setSelectedPythonFile(file)}
                  className={`p-2.5 rounded-lg text-xs cursor-pointer transition border ${
                    selectedPythonFile.filename === file.filename
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="truncate">{file.filename}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1 truncate">{file.description}</span>
                </div>
              ))}
            </div>

            {/* Code Viewer */}
            <div className="md:col-span-2 bg-slate-950 rounded-xl border border-slate-800 flex flex-col overflow-hidden max-h-[60vh]">
              <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">{selectedPythonFile.filename}</span>
                  <span className="text-[10px] text-slate-400">{selectedPythonFile.description}</span>
                </div>
                <button
                  onClick={() => handleCopyCode(selectedPythonFile.content, selectedPythonFile.filename)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 border border-slate-700 transition"
                >
                  {copiedFile === selectedPythonFile.filename ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 overflow-y-auto font-mono text-xs text-cyan-200 leading-relaxed bg-slate-950 flex-1">
                <pre>{selectedPythonFile.content}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Android Kotlin Source Code Browser */}
        {activeTab === 'android_code' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden">
            {/* File List */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 overflow-y-auto max-h-[60vh]">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2">Project Source Files</span>
              {ANDROID_KOTLIN_PROJECT.map((file) => (
                <div
                  key={file.filename}
                  onClick={() => setSelectedAndroidFile(file)}
                  className={`p-2.5 rounded-lg text-xs cursor-pointer transition border ${
                    selectedAndroidFile.filename === file.filename
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span className="truncate">{file.filename}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1 truncate">{file.path}</span>
                </div>
              ))}
            </div>

            {/* Code Viewer */}
            <div className="md:col-span-2 bg-slate-950 rounded-xl border border-slate-800 flex flex-col overflow-hidden max-h-[60vh]">
              <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">{selectedAndroidFile.filename}</span>
                  <span className="text-[10px] text-slate-400">{selectedAndroidFile.description}</span>
                </div>
                <button
                  onClick={() => handleCopyCode(selectedAndroidFile.content, selectedAndroidFile.filename)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 border border-slate-700 transition"
                >
                  {copiedFile === selectedAndroidFile.filename ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Copy File</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 overflow-y-auto font-mono text-xs text-indigo-200 leading-relaxed bg-slate-950 flex-1">
                <pre>{selectedAndroidFile.content}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 flex-shrink-0">
          <span className="text-xs text-slate-400">Department of Computer Engineering &bull; Major Project Demo</span>
          <button onClick={onClose} className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition">
            Close Modal
          </button>
        </div>
      </div>
    </div>
  );
};
