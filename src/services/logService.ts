import { LogCategory, LogEntry, LogLevel } from '../types';

type LogListener = (logs: LogEntry[]) => void;

class LogService {
  private logs: LogEntry[] = [];
  private listeners: Set<LogListener> = new Set();
  private maxLogs = 500;
  private noteCount = 0;

  constructor() {
    // Initial boot log
    this.addLog({
      level: 'info',
      category: 'system',
      message: 'Virtual Piano CV Log Service initialized',
      details: `Started at ${new Date().toLocaleTimeString()}`,
    });
  }

  public subscribe(listener: LogListener): () => void {
    this.listeners.add(listener);
    listener(this.logs);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const copy = [...this.logs];
    this.listeners.forEach((listener) => listener(copy));
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public getNoteCount(): number {
    return this.noteCount;
  }

  public addLog(entry: { level: LogLevel; category: LogCategory; message: string; details?: string }) {
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date(),
      ...entry,
    };

    if (entry.category === 'note') {
      this.noteCount++;
    }

    this.logs = [newLog, ...this.logs].slice(0, this.maxLogs);
    this.notify();
  }

  public logNote(note: string, source: 'hand_cv' | 'keyboard' | 'mouse_touch', details?: string) {
    const sourceLabel =
      source === 'hand_cv' ? '✋ Hand Gesture' : source === 'keyboard' ? '⌨️ Keyboard' : '🖱️ Touch/Click';
    this.addLog({
      level: 'success',
      category: 'note',
      message: `Played Note [${note}] via ${sourceLabel}`,
      details,
    });
  }

  public logVision(message: string, level: LogLevel = 'info', details?: string) {
    this.addLog({
      level,
      category: 'vision',
      message,
      details,
    });
  }

  public logAudio(message: string, level: LogLevel = 'info', details?: string) {
    this.addLog({
      level,
      category: 'audio',
      message,
      details,
    });
  }

  public logSystem(message: string, level: LogLevel = 'info', details?: string) {
    this.addLog({
      level,
      category: 'system',
      message,
      details,
    });
  }

  public clearLogs() {
    this.logs = [];
    this.noteCount = 0;
    this.addLog({
      level: 'info',
      category: 'system',
      message: 'Log history cleared',
    });
  }

  public exportLogs(format: 'json' | 'txt' = 'txt') {
    let content = '';
    const filename = `virtual-piano-logs-${new Date().toISOString().slice(0, 10)}.${format}`;

    if (format === 'json') {
      content = JSON.stringify(this.logs, null, 2);
    } else {
      content = `=========================================================\n` +
        `VIRTUAL PIANO CV - REAL-TIME ACTIVITY & EVENT LOG\n` +
        `Exported: ${new Date().toLocaleString()}\n` +
        `Total Notes Played: ${this.noteCount}\n` +
        `=========================================================\n\n` +
        this.logs
          .map(
            (log) =>
              `[${log.timestamp.toLocaleTimeString()}] [${log.category.toUpperCase()}] [${log.level.toUpperCase()}] ${log.message}${log.details ? ` (${log.details})` : ''}`
          )
          .join('\n');
    }

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const logService = new LogService();
