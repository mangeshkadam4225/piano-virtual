import React, { useState, useEffect } from 'react';
import { Play, Sliders, Settings, Info, FileText, Printer, Music, Eye, Sparkles, BookOpen, Terminal } from 'lucide-react';
import { AppMode, ComputerVisionStats } from '../types';
import { logService } from '../services/logService';

interface NavbarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  stats: ComputerVisionStats;
  onOpenCalibration: () => void;
  onOpenPrintableSheet: () => void;
  onOpenReport: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onOpenTutorial: () => void;
  onOpenLogs?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  setMode,
  stats,
  onOpenCalibration,
  onOpenPrintableSheet,
  onOpenReport,
  onOpenSettings,
  onOpenAbout,
  onOpenTutorial,
  onOpenLogs,
}) => {
  const [logCount, setLogCount] = useState(0);

  useEffect(() => {
    const unsub = logService.subscribe((logs) => {
      setLogCount(logs.length);
    });
    return () => unsub();
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setMode(AppMode.HOME)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Music className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  Virtual Piano
                </span>
                <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">
                  CV Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Computer Vision Powered Paper Piano</p>
            </div>
          </div>

          {/* Quick Real-Time Status Bar */}
          {currentMode === AppMode.PLAYING && (
            <div className="hidden md:flex items-center space-x-3 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${stats.handDetected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                <span className="text-slate-300 font-medium">{stats.handDetected ? 'Hand Tracked' : 'Searching Hand'}</span>
              </div>
              <div className="h-3 w-px bg-slate-700" />
              <div className="flex items-center space-x-1">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-300">{stats.fps} FPS</span>
              </div>
              {stats.activeKeyNote && (
                <>
                  <div className="h-3 w-px bg-slate-700" />
                  <div className="bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded text-xs border border-cyan-500/40 animate-pulse">
                    Note: {stats.activeKeyNote}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Navigation Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {currentMode === AppMode.PLAYING ? (
              <button
                onClick={() => setMode(AppMode.HOME)}
                className="px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700"
              >
                Home
              </button>
            ) : (
              <button
                onClick={() => setMode(AppMode.PLAYING)}
                className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Playing</span>
              </button>
            )}

            {onOpenLogs && (
              <button
                onClick={onOpenLogs}
                className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-lg bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1.5 transition relative"
                title="View Real-Time Activity & Note Logs"
              >
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Live Logs</span>
                {logCount > 0 && (
                  <span className="ml-1 bg-indigo-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                    {logCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={onOpenTutorial}
              className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 text-cyan-300 border border-cyan-500/40 flex items-center space-x-1.5 transition shadow-sm"
              title="How to Play Tutorial"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Tutorial</span>
            </button>

            <button
              onClick={onOpenCalibration}
              className="p-2 sm:px-3 sm:py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition"
              title="Calibrate Piano Sheet"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Calibrate</span>
            </button>

            <button
              onClick={onOpenPrintableSheet}
              className="p-2 sm:px-3 sm:py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition"
              title="Print Paper Piano Sheet PDF"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Print Sheet</span>
            </button>

            <button
              onClick={onOpenReport}
              className="p-2 sm:px-3 sm:py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition"
              title="Project Report, Python & Android Studio Code"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span className="hidden lg:inline">Code & Report</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenAbout}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="About Project"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

