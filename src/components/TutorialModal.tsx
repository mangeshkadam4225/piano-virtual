import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Layers, Wind, FileText, CheckCircle2, ArrowRight, ArrowLeft, Play, Cpu, Lightbulb } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPlaying: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose, onStartPlaying }) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 space-y-6 text-slate-100 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 text-slate-950 font-bold shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white">How to Play: Virtual Piano CV Guide</h2>
                <span className="text-[11px] bg-cyan-500/20 text-cyan-300 font-semibold px-2 py-0.5 rounded border border-cyan-500/30">
                  Interactive Tutorial
                </span>
              </div>
              <p className="text-xs text-slate-400">Play piano on printed paper or wave your hands in the air using the dummy layout</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Dots */}
        <div className="grid grid-cols-4 gap-2 text-xs font-semibold flex-shrink-0">
          {[
            { num: 1, title: '1. Two Play Modes' },
            { num: 2, title: '2. Play in the Air' },
            { num: 3, title: '3. Geometry & Math' },
            { num: 4, title: '4. Tips & Python' },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setActiveStep(s.num)}
              className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-0.5 ${
                activeStep === s.num
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-[11px]">{s.title}</span>
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div className="overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 flex-1 pr-1">
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 space-y-3">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                  <span>Choose Your Playing Style</span>
                </h3>
                <p className="leading-relaxed text-xs sm:text-sm text-slate-300">
                  You can play the Virtual Piano in two different ways depending on your current environment:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Mode 1: Paper Piano */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                      <FileText className="w-4 h-4" />
                      <span>Option A: Printed Paper Sheet</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Download and print the high-contrast A4 PDF template. Place it flat under your camera and use 4-corner perspective calibration to align the virtual keys to your physical paper.
                    </p>
                    <div className="text-[11px] font-mono text-emerald-300/80 bg-emerald-500/10 p-2 rounded">
                      Best for: Tactile paper feel & accurate finger positioning
                    </div>
                  </div>

                  {/* Mode 2: Air Piano */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/40 space-y-2">
                    <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
                      <Wind className="w-4 h-4" />
                      <span>Option B: Play in the Air (Dummy Layout)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      No printer or paper needed! The app renders a floating dummy keyboard overlay in mid-air. Simply wave your hands and tap fingers in the camera view to trigger notes.
                    </p>
                    <div className="text-[11px] font-mono text-cyan-300/80 bg-cyan-500/10 p-2 rounded">
                      Best for: Instant practice, travel, and zero-paper setups
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 space-y-4">
                <h3 className="text-base font-bold text-cyan-400 flex items-center space-x-2">
                  <Wind className="w-5 h-5" />
                  <span>How to Play "In the Air" with Dummy Layout</span>
                </h3>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-start space-x-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center flex-shrink-0 text-xs">1</div>
                    <div>
                      <span className="font-bold text-white block mb-0.5">Toggle "Air Piano Mode" in Controls</span>
                      <span className="text-slate-400">Click the <strong>Air Piano</strong> toggle button on the camera playing screen. The virtual keyboard floats directly on screen.</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center flex-shrink-0 text-xs">2</div>
                    <div>
                      <span className="font-bold text-white block mb-0.5">Position Your Laptop or Phone Camera</span>
                      <span className="text-slate-400">Ensure the webcam faces you with your hands clearly visible in the lower half of the frame.</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center flex-shrink-0 text-xs">3</div>
                    <div>
                      <span className="font-bold text-white block mb-0.5">Point Your Index Fingertip</span>
                      <span className="text-slate-400">MediaPipe Hand Landmarker tracks your index fingertip (#8) with real-time neon particle feedback and triggers notes when hovering or dipping over keys.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 space-y-3">
                <h3 className="text-base font-bold text-indigo-400 flex items-center space-x-2">
                  <Cpu className="w-5 h-5" />
                  <span>How it Works: UNET Segmentation & Key Geometry</span>
                </h3>
                <p className="leading-relaxed text-xs">
                  The vision system breaks down the piano region into two distinct geometric groups and calculates exact key bounds:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl border border-rose-500/30 space-y-1.5">
                    <span className="font-bold text-rose-400 block">Small Region (C, D, E)</span>
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                      <li>Bottom line divided into <strong>3 cells</strong> for white notes: C, D, E</li>
                      <li>Top line divided into <strong>2 cells</strong> for black notes: C#4 and D#4</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-blue-500/30 space-y-1.5">
                    <span className="font-bold text-blue-400 block">Big Region (F, G, A, B)</span>
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                      <li>Bottom line divided into <strong>4 cells</strong> for white notes: F, G, A, B</li>
                      <li>Top line divided into <strong>3 cells</strong> for black notes: F#4, G#4, A#4</li>
                    </ul>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                  <span className="font-bold text-cyan-300 block">Black Key Ratio Math (6/9 Height)</span>
                  <p className="text-slate-400">
                    The height of black notes is fixed to exactly <strong>6/9 (~66.67%)</strong> of the total keyboard height. Overlapping rectangular regions are dynamically subtracted so black keys take top hit priority over white keys.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 space-y-3">
                <h3 className="text-base font-bold text-amber-400 flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5" />
                  <span>Pro Tips & Running the Python Version</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>Good Lighting:</strong> Keep room well-lit with high contrast between your hands and background.</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>Keyboard Shortcuts:</strong> You can also play via desktop keys: <code>A, S, D, F, G, H, J, K</code> and <code>W, E, T, Y, U</code>.</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>Python 3.12 Version:</strong> Download the complete Python project files from the "Android & Python Report" modal and run with <code>runme.bat</code> or <code>python main.py</code>.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 flex-shrink-0">
          {activeStep > 1 ? (
            <button
              onClick={() => setActiveStep(activeStep - 1)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : <div />}

          {activeStep < 4 ? (
            <button
              onClick={() => setActiveStep(activeStep + 1)}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onStartPlaying();
              }}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/30 transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Playing Piano Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
