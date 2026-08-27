import React, { useState } from 'react';
import { X, Sliders, CheckCircle2, RotateCcw, Sparkles, Smartphone, Layers, ArrowRight, ArrowLeft } from 'lucide-react';
import { CalibrationConfig, QuadPoints } from '../types';
import { openCVProcessor } from '../services/opencvProcessor';

interface CalibrationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  calibration: CalibrationConfig;
  onSaveCalibration: (config: CalibrationConfig) => void;
}

export const CalibrationWizard: React.FC<CalibrationWizardProps> = ({
  isOpen,
  onClose,
  calibration,
  onSaveCalibration,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [currentQuad, setCurrentQuad] = useState<QuadPoints>(calibration.corners);
  const [keyCount, setKeyCount] = useState<number>(calibration.keyCount || 8);

  if (!isOpen) return null;

  const handleAutoDetect = () => {
    const defaultQuad = openCVProcessor.getDefaultQuad(640, 480);
    setCurrentQuad(defaultQuad);
  };

  const handleReset = () => {
    const defaultQuad = openCVProcessor.getDefaultQuad(640, 480);
    setCurrentQuad(defaultQuad);
  };

  const handleSave = () => {
    onSaveCalibration({
      ...calibration,
      corners: currentQuad,
      keyCount,
      isCalibrated: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 text-slate-100 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Paper Piano Calibration Wizard</h2>
              <p className="text-xs text-slate-400">Calibrate paper sheet coordinates for accurate key mapping</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-2 text-xs">
          {[
            { num: 1, title: 'Positioning' },
            { num: 2, title: 'Corners Alignment' },
            { num: 3, title: 'Key Configuration' },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => setStep(s.num as 1 | 2 | 3)}
              className={`flex items-center space-x-2 cursor-pointer ${
                step === s.num ? 'text-cyan-400 font-bold' : step > s.num ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step === s.num
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : step > s.num
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {s.num}
              </div>
              <span className="hidden sm:inline">{s.title}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Step 1: Physical Setup Instructions</span>
              </h3>
              <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 leading-relaxed">
                <li>Print the <strong>A4 Paper Piano Sheet</strong> or display it on a second tablet screen.</li>
                <li>Place the printed piano paper on a flat surface in a well-lit room.</li>
                <li>Mount your smartphone on a stand or prop it up above the paper so all 4 corners of the keyboard are visible.</li>
                <li>Ensure your hands can move freely across the keys without blocking the camera lens.</li>
              </ol>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>Step 2: 4-Corner Homography Matrix Alignment</span>
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleAutoDetect}
                    className="px-2.5 py-1 text-xs bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 rounded border border-cyan-500/40 flex items-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto Detect</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-2.5 py-1 text-xs bg-slate-700 text-slate-300 hover:bg-slate-600 rounded flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                On the main playing screen, drag the yellow corner handles (TL, TR, BR, BL) to match the outer corners of your printed paper piano. This perspective transformation converts skewed camera angles into a 2D plane.
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Step 3: Select Keyboard Layout</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setKeyCount(8)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                    keyCount === 8
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <span className="text-sm font-bold text-white block mb-1">8 White Keys</span>
                    <span className="text-xs text-slate-400">C4, D4, E4, F4, G4, A4, B4, C5</span>
                  </div>
                  <span className="text-[10px] font-semibold text-cyan-400 mt-3">Standard Beginner Mode</span>
                </div>

                <div
                  onClick={() => setKeyCount(13)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                    keyCount === 13
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <span className="text-sm font-bold text-white block mb-1">13 Keys (Chromatic)</span>
                    <span className="text-xs text-slate-400">8 White Keys + 5 Black Sharp Keys</span>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-400 mt-3">Advanced Octave Mode</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as 1 | 2)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              onClick={() => setStep((step + 1) as 2 | 3)}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-600/30 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Start Playing</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
