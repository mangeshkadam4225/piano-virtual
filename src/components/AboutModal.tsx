import React from 'react';
import { X, Info, Cpu, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-6 text-slate-100 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">About Major Project</h2>
              <p className="text-xs text-slate-400">BE Final Year Computer Engineering Project</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Details */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-2">
            <h3 className="font-bold text-white text-sm">Virtual Piano Using Computer Vision</h3>
            <p className="text-xs text-slate-400">
              An innovative augmented reality solution that replaces expensive physical hardware with an unpowered printed paper sheet and smartphone camera vision algorithms.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-purple-400">Core Objectives</h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Zero hardware cost: Practice piano with any smartphone and printed paper sheet.</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Perspective Correction: Homography matrix math eliminates phone angle tilt.</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Real-Time Index Fingertip Tracking: Uses MediaPipe Hand Landmarker.</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Low Latency Sound: Polyphonic audio engine with acoustic piano string harmonics.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
            <span className="font-semibold text-slate-200 block">Technology Stack</span>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {['Kotlin', 'CameraX', 'OpenCV', 'MediaPipe Hands', 'Web Audio API', 'React 19', 'TypeScript', 'Tailwind CSS'].map((tech) => (
                <span key={tech} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-800 pt-4">
          <button onClick={onClose} className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
