/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppMode, AppSettings, CalibrationConfig, ComputerVisionStats } from './types';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { PianoCanvas } from './components/PianoCanvas';
import { CalibrationWizard } from './components/CalibrationWizard';
import { PrintableSheetModal } from './components/PrintableSheetModal';
import { ProjectReportModal } from './components/ProjectReportModal';
import { SettingsModal } from './components/SettingsModal';
import { AboutModal } from './components/AboutModal';
import { TutorialModal } from './components/TutorialModal';
import { ActivityLogPanel } from './components/ActivityLogPanel';
import { openCVProcessor } from './services/opencvProcessor';

const DEFAULT_CALIBRATION: CalibrationConfig = {
  corners: openCVProcessor.getDefaultQuad(640, 480),
  isCalibrated: true,
  keyCount: 8,
  sensitivity: 0.5,
  smoothing: 0.4,
  cornerDetectionMode: 'auto',
  surfaceBaselineZ: 0.02,
  touchTriggerThresholdMm: 6.0,
};

const DEFAULT_SETTINGS: AppSettings = {
  volume: 0.8,
  instrument: 'grand_piano',
  showLandmarks: true,
  showKeyHighlights: true,
  showDebugInfo: true,
  showPianoGrid: true,
  selectedCameraId: '',
  mirrorCamera: false,
  touchFeedbackSound: true,
  keyCount: 8,
  fingertipLandmark: 'index',
  playMode: 'paper',
  airPreset: 'bottom',
  touchDetectionMode: 'depth_tap',
  touchSensitivity: 0.65,
  multiFingerMode: false,
  hologramLaserGuide: true,
  touchTriggerThresholdMm: 6.0,
};

export default function App() {
  const [currentMode, setMode] = useState<AppMode>(AppMode.HOME);

  // Modals state
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [isPrintableSheetOpen, setIsPrintableSheetOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  // Persistent Settings & Calibration
  const [calibration, setCalibration] = useState<CalibrationConfig>(() => {
    try {
      const saved = localStorage.getItem('virtual_piano_calibration');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_CALIBRATION;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('virtual_piano_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  });

  const [stats, setStats] = useState<ComputerVisionStats>({
    fps: 0,
    handDetected: false,
    pianoDetected: false,
    activeKeyNote: null,
    processingTimeMs: 0,
    calibrationConfidence: 0,
  });

  // Save Settings
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('virtual_piano_settings', JSON.stringify(newSettings));
    } catch {
      // Storage restricted
    }
  };

  // Save Calibration
  const handleUpdateCalibration = (newCalib: CalibrationConfig) => {
    setCalibration(newCalib);
    try {
      localStorage.setItem('virtual_piano_calibration', JSON.stringify(newCalib));
    } catch {
      // Storage restricted
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header Navbar */}
      <Navbar
        currentMode={currentMode}
        setMode={setMode}
        stats={stats}
        onOpenCalibration={() => setIsCalibrationOpen(true)}
        onOpenPrintableSheet={() => setIsPrintableSheetOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenLogs={() => setIsLogsOpen(true)}
      />

      {/* Main Mode View */}
      <main className="flex-1">
        {currentMode === AppMode.HOME ? (
          <HomeScreen
            setMode={setMode}
            onOpenCalibration={() => setIsCalibrationOpen(true)}
            onOpenPrintableSheet={() => setIsPrintableSheetOpen(true)}
            onOpenReport={() => setIsReportOpen(true)}
            onOpenTutorial={() => setIsTutorialOpen(true)}
          />
        ) : (
          <PianoCanvas
            settings={settings}
            calibration={calibration}
            onUpdateCalibration={handleUpdateCalibration}
            onStatsUpdate={setStats}
          />
        )}
      </main>

      {/* Modals */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onStartPlaying={() => setMode(AppMode.PLAYING)}
      />

      <CalibrationWizard
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        calibration={calibration}
        onSaveCalibration={handleUpdateCalibration}
      />

      <PrintableSheetModal
        isOpen={isPrintableSheetOpen}
        onClose={() => setIsPrintableSheetOpen(false)}
      />

      <ProjectReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <ActivityLogPanel
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
      />
    </div>
  );
}

