import React from 'react';
import { X, Download, Printer, CheckCircle2, FileText, Info } from 'lucide-react';
import { printableSheetService } from '../services/printableSheet';
import { PIANO_KEYS_8 } from '../services/audioEngine';

interface PrintableSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintableSheetModal: React.FC<PrintableSheetModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    printableSheetService.downloadPDF();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-6 text-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Printable Paper Piano Sheet (A4 PDF)</h2>
              <p className="text-xs text-slate-400">Downloadable paper sheet template with computer vision fiducial markers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Paper Keyboard Live Preview Box */}
        <div className="bg-white p-6 rounded-xl border border-slate-700 text-slate-900 space-y-4 shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-700 tracking-wider uppercase">A4 Paper Keyboard Sheet Preview</span>
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">297mm x 210mm</span>
          </div>

          {/* SVG Keyboard Graphic */}
          <div className="relative bg-slate-50 p-4 rounded border-2 border-slate-900 overflow-hidden">
            {/* 4 Corner Markers */}
            <div className="absolute top-2 left-2 w-5 h-5 bg-slate-900 rounded-xs border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">1</div>
            <div className="absolute top-2 right-2 w-5 h-5 bg-slate-900 rounded-xs border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">2</div>
            <div className="absolute bottom-2 right-2 w-5 h-5 bg-slate-900 rounded-xs border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">3</div>
            <div className="absolute bottom-2 left-2 w-5 h-5 bg-slate-900 rounded-xs border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">4</div>

            {/* Keys Grid */}
            <div className="my-6 mx-8 flex border-2 border-slate-900 bg-white h-28 relative">
              {PIANO_KEYS_8.map((key) => (
                <div key={key.id} className="flex-1 border-r border-slate-900 relative flex flex-col justify-end pb-2 items-center">
                  <span className="font-bold text-sm text-slate-900">{key.note}</span>
                </div>
              ))}

              {/* Black keys overlays */}
              <div className="absolute top-0 left-[10%] w-[5.5%] h-[60%] bg-slate-900 rounded-b-xs" />
              <div className="absolute top-0 left-[22.5%] w-[5.5%] h-[60%] bg-slate-900 rounded-b-xs" />
              <div className="absolute top-0 left-[47.5%] w-[5.5%] h-[60%] bg-slate-900 rounded-b-xs" />
              <div className="absolute top-0 left-[60%] w-[5.5%] h-[60%] bg-slate-900 rounded-b-xs" />
              <div className="absolute top-0 left-[72.5%] w-[5.5%] h-[60%] bg-slate-900 rounded-b-xs" />
            </div>
          </div>
        </div>

        {/* Printing & Usage Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-2">
            <span className="font-bold text-white flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Recommended Printing Settings</span>
            </span>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li>Paper Size: <strong>A4 (Landscape)</strong></li>
              <li>Scale: <strong>100% / Actual Size</strong> (Do not shrink)</li>
              <li>Paper Type: Standard 70-80 GSM white paper</li>
            </ul>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-2">
            <span className="font-bold text-white flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Testing Without a Printer</span>
            </span>
            <p className="text-slate-300 leading-relaxed">
              If you do not have a printer nearby, open this PDF on a tablet or second phone screen and place it flat on your table under your smartphone camera!
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 border-t border-slate-800 pt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition">
            Close
          </button>
          <button
            onClick={handleDownload}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Printable A4 PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
