import React, { useEffect, useState } from 'react';
import { X, Settings, Volume2, Eye, Camera, RefreshCw, Music } from 'lucide-react';
import { AppSettings } from '../types';
import { audioEngine } from '../services/audioEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    if (isOpen && navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setCameras(videoDevices);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVolumeChange = (vol: number) => {
    onUpdateSettings({ ...settings, volume: vol });
    audioEngine.setVolume(vol);
  };

  const handleInstrumentChange = (inst: 'grand_piano' | 'synth_piano' | 'electric_piano' | 'organ') => {
    onUpdateSettings({ ...settings, instrument: inst });
    audioEngine.setInstrument(inst);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 text-slate-100 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Application Settings</h2>
              <p className="text-xs text-slate-400">Audio synthesis, camera, and vision overlay options</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Settings */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>Audio & Instrument Timbre</span>
          </h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Piano Master Volume</span>
              <span className="font-mono text-cyan-400 font-bold">{Math.round(settings.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs text-slate-300 block">Instrument Preset</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'grand_piano', label: 'Grand Piano (Acoustic)' },
                { id: 'synth_piano', label: 'Synth Piano' },
                { id: 'electric_piano', label: 'Electric Piano' },
                { id: 'organ', label: 'Church Organ' },
              ].map((inst) => (
                <button
                  key={inst.id}
                  onClick={() => handleInstrumentChange(inst.id as any)}
                  className={`p-2.5 rounded-lg border text-left font-medium transition ${
                    settings.instrument === inst.id
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {inst.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Computer Vision & Overlay Settings */}
        <div className="space-y-4 border-t border-slate-800 pt-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Eye className="w-4 h-4 text-indigo-400" />
            <span>Computer Vision & Display</span>
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between bg-slate-800/60 p-3 rounded-lg border border-slate-700/80 cursor-pointer">
              <span className="text-slate-200">Show MediaPipe Hand Skeleton Landmarks</span>
              <input
                type="checkbox"
                checked={settings.showLandmarks}
                onChange={(e) => onUpdateSettings({ ...settings, showLandmarks: e.target.checked })}
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between bg-slate-800/60 p-3 rounded-lg border border-slate-700/80 cursor-pointer">
              <span className="text-slate-200">Mirror Camera Video Stream</span>
              <input
                type="checkbox"
                checked={settings.mirrorCamera}
                onChange={(e) => onUpdateSettings({ ...settings, mirrorCamera: e.target.checked })}
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between bg-slate-800/60 p-3 rounded-lg border border-slate-700/80 cursor-pointer">
              <div>
                <span className="text-slate-200 block font-medium">Multi-Finger Chord Polyphony</span>
                <span className="text-[11px] text-slate-400">Track all 5 fingertips simultaneously to play piano chords</span>
              </div>
              <input
                type="checkbox"
                checked={settings.multiFingerMode}
                onChange={(e) => onUpdateSettings({ ...settings, multiFingerMode: e.target.checked })}
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
              />
            </label>

            <div className="space-y-1.5 bg-slate-800/60 p-3 rounded-lg border border-slate-700/80">
              <div className="flex items-center justify-between text-slate-200">
                <span>Paper Touch Sensitivity</span>
                <span className="font-mono text-emerald-400 font-bold">{Math.round(settings.touchSensitivity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={settings.touchSensitivity}
                onChange={(e) => onUpdateSettings({ ...settings, touchSensitivity: parseFloat(e.target.value) })}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Camera Selector */}
        {cameras.length > 0 && (
          <div className="space-y-2 border-t border-slate-800 pt-4 text-xs">
            <span className="text-slate-300 block font-medium">Select Video Camera Input</span>
            <select
              value={settings.selectedCameraId}
              onChange={(e) => onUpdateSettings({ ...settings, selectedCameraId: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="">Default Environment / Back Camera</option>
              {cameras.map((c) => (
                <option key={c.deviceId} value={c.deviceId}>
                  {c.label || `Camera ${c.deviceId.slice(0, 5)}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
