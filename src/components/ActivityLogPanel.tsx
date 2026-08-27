import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Trash2,
  Download,
  Search,
  Filter,
  X,
  Music,
  Eye,
  Volume2,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Pause,
  Play,
  Copy,
  Check,
} from 'lucide-react';
import { LogCategory, LogEntry, LogLevel } from '../types';
import { logService } from '../services/logService';

interface ActivityLogPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isDocked?: boolean;
}

export const ActivityLogPanel: React.FC<ActivityLogPanelProps> = ({
  isOpen,
  onClose,
  isDocked = false,
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<LogCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = logService.subscribe((updatedLogs) => {
      setLogs(updatedLogs);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: LogCategory) => {
    switch (category) {
      case 'note':
        return <Music className="w-3.5 h-3.5 text-emerald-400" />;
      case 'vision':
        return <Eye className="w-3.5 h-3.5 text-cyan-400" />;
      case 'audio':
        return <Volume2 className="w-3.5 h-3.5 text-indigo-400" />;
      case 'system':
      default:
        return <Info className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'success':
        return <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-mono"><CheckCircle2 className="w-3 h-3" /> SUCCESS</span>;
      case 'warning':
        return <span className="inline-flex items-center gap-1 text-amber-400 text-xs font-mono"><AlertTriangle className="w-3 h-3" /> WARN</span>;
      case 'error':
        return <span className="inline-flex items-center gap-1 text-rose-400 text-xs font-mono"><XCircle className="w-3 h-3" /> ERROR</span>;
      case 'info':
      default:
        return <span className="inline-flex items-center gap-1 text-sky-400 text-xs font-mono"><Info className="w-3 h-3" /> INFO</span>;
    }
  };

  const handleCopy = (log: LogEntry) => {
    const text = `[${log.timestamp.toLocaleTimeString()}] [${log.category.toUpperCase()}] ${log.message}${log.details ? ` (${log.details})` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900/95 border border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-100">
      {/* Header */}
      <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-2 text-base">
              Real-Time Activity & Event Log
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {logs.length} events
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Live stream of note triggers, MediaPipe vision, and audio synthesis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              autoScroll
                ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30'
                : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800'
            }`}
            title={autoScroll ? 'Auto-scroll enabled' : 'Auto-scroll paused'}
          >
            {autoScroll ? <Play className="w-3.5 h-3.5 fill-current text-indigo-400" /> : <Pause className="w-3.5 h-3.5 text-slate-400" />}
            {autoScroll ? 'Auto-Scroll' : 'Paused'}
          </button>

          <button
            onClick={() => logService.exportLogs('txt')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-all flex items-center gap-1.5"
            title="Export logs as TXT"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>

          <button
            onClick={() => logService.clearLogs()}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all flex items-center gap-1.5"
            title="Clear all logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filter Toolbar & Search */}
      <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {(
            [
              { id: 'all', label: 'All', icon: <Filter className="w-3 h-3" /> },
              { id: 'note', label: 'Notes', icon: <Music className="w-3 h-3" /> },
              { id: 'vision', label: 'Vision', icon: <Eye className="w-3 h-3" /> },
              { id: 'audio', label: 'Audio', icon: <Volume2 className="w-3 h-3" /> },
              { id: 'system', label: 'System', icon: <Info className="w-3 h-3" /> },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search log messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Log Feed List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {filteredLogs.length === 0 ? (
          <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-slate-500 gap-2">
            <Terminal className="w-8 h-8 opacity-40" />
            <p className="text-sm">No log entries found</p>
            {searchQuery && <p className="text-xs text-slate-600">Try clearing your search query</p>}
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="group p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-indigo-500/40 hover:bg-slate-950 transition-all flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span className="text-[11px] text-slate-500 whitespace-nowrap pt-0.5">
                  {log.timestamp.toLocaleTimeString()}
                </span>

                <div className="pt-0.5">{getCategoryIcon(log.category)}</div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    {getLevelBadge(log.level)}
                    <span className="font-semibold text-slate-200 text-xs">{log.message}</span>
                  </div>
                  {log.details && (
                    <p className="text-[11px] text-slate-400 break-words font-sans bg-slate-900/80 px-2 py-1 rounded border border-slate-800 mt-1">
                      {log.details}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleCopy(log)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-all"
                title="Copy log entry"
              >
                {copiedId === log.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Footer stats bar */}
      <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Logging Active
          </span>
          <span>Notes Triggered: <strong className="text-slate-200">{logService.getNoteCount()}</strong></span>
        </div>
        <div>
          Showing {filteredLogs.length} of {logs.length} events
        </div>
      </div>
    </div>
  );

  if (isDocked) {
    return <div className="w-full h-80 my-4">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[85vh]">{content}</div>
    </div>
  );
};
