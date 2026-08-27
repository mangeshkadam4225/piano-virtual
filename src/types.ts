export enum AppMode {
  HOME = 'HOME',
  PLAYING = 'PLAYING',
  CALIBRATION = 'CALIBRATION',
  SETTINGS = 'SETTINGS',
  ABOUT = 'ABOUT',
  REPORT = 'REPORT',
}

export interface Point2D {
  x: number; // Normalized 0-1 or pixel coordinate
  y: number;
}

export interface QuadPoints {
  topLeft: Point2D;
  topRight: Point2D;
  bottomRight: Point2D;
  bottomLeft: Point2D;
}

export interface PianoKey {
  id: string;
  note: string; // e.g. "C4", "D4"
  label: string; // "C", "D"
  frequency: number; // Hz
  isBlack: boolean;
  rectRatio: {
    x: number; // 0 to 1 relative to piano region
    y: number; // 0 to 1
    width: number; // 0 to 1
    height: number; // 0 to 1
  };
}

export interface KeyState {
  keyId: string;
  isPressed: boolean;
  pressTime: number;
  confidence: number;
  fingerId?: number;
}

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface FingertipInfo {
  name: 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';
  landmarkIndex: number;
  point: Point2D;
  z: number;
  isTouching: boolean;
  touchDepth: number; // 0 (far/hover) to 1 (firm contact)
  distanceToSurfaceMm: number; // Distance in millimeters above the paper surface
  warpedPoint?: Point2D;
  activeKeyId?: string;
}

export interface DetectedHand {
  handedness: 'Left' | 'Right';
  score: number;
  landmarks: HandLandmark[];
  indexFingertip: Point2D;
  indexFingertipWarped?: Point2D; // Mapped to normalized piano rect
  fingertips: FingertipInfo[];
  isTouchingPaper: boolean;
  touchDepthScore: number; // 0..1
  minDistanceMm: number; // Lowest distance in mm to paper among all fingers
}

export interface CalibrationConfig {
  corners: QuadPoints;
  isCalibrated: boolean;
  keyCount: number; // 8 for C4-C5, 12 for chromatic octave
  sensitivity: number; // 0.1 to 1.0 threshold
  smoothing: number; // 0 to 1 filter factor
  cornerDetectionMode: 'auto' | 'manual';
  surfaceBaselineZ: number; // Calibrated paper surface reference depth
  touchTriggerThresholdMm: number; // Distance in mm to trigger note (e.g. 6mm)
}

export interface AppSettings {
  volume: number; // 0 to 1
  instrument: 'grand_piano' | 'synth_piano' | 'electric_piano' | 'organ';
  showLandmarks: boolean;
  showKeyHighlights: boolean;
  showDebugInfo: boolean;
  showPianoGrid: boolean;
  selectedCameraId: string;
  mirrorCamera: boolean;
  touchFeedbackSound: boolean;
  keyCount: number;
  fingertipLandmark: 'index' | 'middle' | 'thumb' | 'all';
  playMode: 'paper' | 'air'; // Paper calibrated mode vs Air dummy layout mode
  airPreset: 'bottom' | 'center' | 'wide';
  touchDetectionMode: 'depth_tap' | 'proximity' | 'pinch';
  touchSensitivity: number; // 0.1 to 1.0
  multiFingerMode: boolean; // Play multiple keys / chords with all fingers
  hologramLaserGuide: boolean; // Show AR holographic vertical distance beam
  touchTriggerThresholdMm: number; // Trigger threshold distance (e.g., 6 mm)
}

export interface ComputerVisionStats {
  fps: number;
  handDetected: boolean;
  pianoDetected: boolean;
  activeKeyNote: string | null;
  processingTimeMs: number;
  calibrationConfidence: number;
  touchState?: 'Touching Paper' | 'Hovering' | 'No Hands';
  touchPressurePercent?: number;
  fingerDistanceMm?: number;
}

export type LogCategory = 'note' | 'vision' | 'audio' | 'system';
export type LogLevel = 'info' | 'success' | 'warning' | 'error';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: string;
}

