import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, Sliders, Play, Volume2, RotateCcw, AlertTriangle, CheckCircle2, Eye, EyeOff, Layers, Sparkles, Wind, FileText, Move, Hand, Activity, Zap, Target, Crosshair, VolumeX, Terminal } from 'lucide-react';
import { AppSettings, CalibrationConfig, ComputerVisionStats, DetectedHand, FingertipInfo, PianoKey, Point2D, QuadPoints } from '../types';
import { audioEngine, PIANO_KEYS_8, PIANO_KEYS_13 } from '../services/audioEngine';
import { PerspectiveTransform } from '../services/perspectiveTransform';
import { handTracker } from '../services/handTracker';
import { openCVProcessor } from '../services/opencvProcessor';
import { logService } from '../services/logService';
import { ActivityLogPanel } from './ActivityLogPanel';


interface PianoCanvasProps {
  settings: AppSettings;
  calibration: CalibrationConfig;
  onUpdateCalibration: (config: CalibrationConfig) => void;
  onStatsUpdate: (stats: ComputerVisionStats) => void;
}

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

const AIR_PRESETS: Record<'bottom' | 'center' | 'wide', QuadPoints> = {
  bottom: {
    topLeft: { x: 0.1, y: 0.55 },
    topRight: { x: 0.9, y: 0.55 },
    bottomRight: { x: 0.9, y: 0.92 },
    bottomLeft: { x: 0.1, y: 0.92 },
  },
  center: {
    topLeft: { x: 0.12, y: 0.35 },
    topRight: { x: 0.88, y: 0.35 },
    bottomRight: { x: 0.88, y: 0.72 },
    bottomLeft: { x: 0.12, y: 0.72 },
  },
  wide: {
    topLeft: { x: 0.05, y: 0.5 },
    topRight: { x: 0.95, y: 0.5 },
    bottomRight: { x: 0.95, y: 0.95 },
    bottomLeft: { x: 0.05, y: 0.95 },
  },
};

export const PianoCanvas: React.FC<PianoCanvasProps> = ({
  settings,
  calibration,
  onUpdateCalibration,
  onStatsUpdate,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const transformRef = useRef<PerspectiveTransform>(new PerspectiveTransform());

  // Play Mode: 'paper' (Perspective Calibrated) or 'air' (Floating Dummy Layout)
  const [playMode, setPlayMode] = useState<'paper' | 'air'>(settings.playMode || 'air');
  const [airPreset, setAirPreset] = useState<'bottom' | 'center' | 'wide'>(settings.airPreset || 'bottom');

  // Trigger Mode: 'instant' (Plays immediately when finger reaches key) vs 'tap' (requires downward strike)
  const [triggerMode, setTriggerMode] = useState<'instant' | 'tap'>('instant');

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeKeyNotes, setActiveKeyNotes] = useState<string[]>([]);
  const [touchStateText, setTouchStateText] = useState<'Active' | 'No Hands'>('No Hands');

  // Set of active pressed key IDs
  const activePressedKeyIdsRef = useRef<Set<string>>(new Set());
  const isPointerDownRef = useRef(false);
  const activeKeyboardKeyRef = useRef<string | null>(null);
  const lastUiUpdateRef = useRef(0);

  // Dragging calibration corners state
  const [draggingCorner, setDraggingCorner] = useState<keyof QuadPoints | null>(null);

  // FPS calculation
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(performance.now());
  const [currentFps, setCurrentFps] = useState(0);

  const keys: PianoKey[] = settings.keyCount === 13 ? PIANO_KEYS_13 : PIANO_KEYS_8;

  // Active Quad corners depending on mode
  const activeCorners: QuadPoints = playMode === 'air' ? AIR_PRESETS[airPreset] : calibration.corners;

  // Keyboard shortcut mappings for desktop testing
  const KEYBOARD_MAP: Record<string, string> = {
    '1': 'C4', 'a': 'C4', 'A': 'C4',
    '2': 'D4', 's': 'D4', 'S': 'D4',
    '3': 'E4', 'd': 'E4', 'D': 'E4',
    '4': 'F4', 'f': 'F4', 'F': 'F4',
    '5': 'G4', 'g': 'G4', 'G': 'G4',
    '6': 'A4', 'h': 'A4', 'H': 'A4',
    '7': 'B4', 'j': 'B4', 'J': 'B4',
    '8': 'C5', 'k': 'C5', 'K': 'C5',
    'w': 'Cs4', 'W': 'Cs4',
    'e': 'Ds4', 'E': 'Ds4',
    't': 'Fs4', 'T': 'Fs4',
    'y': 'Gs4', 'Y': 'Gs4',
    'u': 'As4', 'U': 'As4',
  };

  const [isLogPanelOpen, setIsLogPanelOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const keyId = KEYBOARD_MAP[e.key];
      if (keyId) {
        audioEngine.init();
        const found = keys.find(k => k.id === keyId);
        if (found) {
          activeKeyboardKeyRef.current = keyId;
          if (!activePressedKeyIdsRef.current.has(keyId)) {
            activePressedKeyIdsRef.current.add(keyId);
            audioEngine.playNote(keyId, found.frequency);
            setActiveKeyNotes(Array.from(activePressedKeyIdsRef.current).map(id => keys.find(k => k.id === id)?.note || id));
            logService.logNote(found.note, 'keyboard', `Key [${e.key.toUpperCase()}] (${found.frequency} Hz)`);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyId = KEYBOARD_MAP[e.key];
      if (keyId) {
        if (activeKeyboardKeyRef.current === keyId) activeKeyboardKeyRef.current = null;
        if (activePressedKeyIdsRef.current.has(keyId)) {
          audioEngine.stopNote(keyId);
          activePressedKeyIdsRef.current.delete(keyId);
          setActiveKeyNotes(Array.from(activePressedKeyIdsRef.current).map(id => keys.find(k => k.id === id)?.note || id));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keys]);

  // Initialize Camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      audioEngine.init(); // Auto-unlock Web Audio
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: playMode === 'paper' ? 'environment' : 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          deviceId: settings.selectedCameraId ? { exact: settings.selectedCameraId } : undefined,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
          logService.logVision('Webcam camera stream active', 'success', `Resolution: 1280x720`);
        };
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      setCameraError('Camera permission denied or unavailable. You can test piano notes using on-screen keys or desktop keys A-K.');
      setIsCameraActive(false);
      logService.logVision('Camera access unavailable', 'warning', err instanceof Error ? err.message : String(err));
    }

  }, [settings.selectedCameraId, playMode]);

  // Update Homography Matrix
  useEffect(() => {
    if (activeCorners) {
      transformRef.current.computeHomography(activeCorners, 1.0, 1.0);
    }
  }, [activeCorners]);

  // Start Camera on Mount
  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  // Main Real-Time Vision & Audio Processing Loop
  useEffect(() => {
    let animFrameId: number;

    const processFrame = async () => {
      const startTime = performance.now();
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (canvas) {
        const ctx = canvas.getContext('2d', { alpha: false });

        if (ctx) {
          // Lock buffer size to 1280x720
          if (canvas.width !== CANVAS_WIDTH || canvas.height !== CANVAS_HEIGHT) {
            canvas.width = CANVAS_WIDTH;
            canvas.height = CANVAS_HEIGHT;
          }

          const width = CANVAS_WIDTH;
          const height = CANVAS_HEIGHT;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // 1. Draw Camera Frame
          if (video && isCameraActive && video.readyState >= 2) {
            ctx.save();
            if (settings.mirrorCamera || playMode === 'air') {
              ctx.translate(width, 0);
              ctx.scale(-1, 1);
            }
            ctx.drawImage(video, 0, 0, width, height);
            ctx.restore();
          } else {
            const bgGradient = ctx.createLinearGradient(0, 0, width, height);
            bgGradient.addColorStop(0, '#0a0f1d');
            bgGradient.addColorStop(1, '#15172b');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, width, height);

            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += 40) {
              ctx.beginPath();
              ctx.moveTo(x, 0);
              ctx.lineTo(x, height);
              ctx.stroke();
            }
          }

          // 2. Draw Calibrated Piano Region Polygon
          const corners = activeCorners;
          const pTL = { x: corners.topLeft.x * width, y: corners.topLeft.y * height };
          const pTR = { x: corners.topRight.x * width, y: corners.topRight.y * height };
          const pBR = { x: corners.bottomRight.x * width, y: corners.bottomRight.y * height };
          const pBL = { x: corners.bottomLeft.x * width, y: corners.bottomLeft.y * height };

          ctx.beginPath();
          ctx.moveTo(pTL.x, pTL.y);
          ctx.lineTo(pTR.x, pTR.y);
          ctx.lineTo(pBR.x, pBR.y);
          ctx.lineTo(pBL.x, pBL.y);
          ctx.closePath();

          if (playMode === 'air') {
            ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
            ctx.strokeStyle = '#06b6d4';
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 16;
          } else {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
            ctx.strokeStyle = calibration.isCalibrated ? '#10b981' : '#f59e0b';
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 10;
          }
          ctx.fill();
          ctx.lineWidth = 2.5;
          if (playMode === 'paper' && !calibration.isCalibrated) {
            ctx.setLineDash([6, 4]);
          } else {
            ctx.setLineDash([]);
          }
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.shadowBlur = 0;

          // 3. Process MediaPipe Hand Tracking
          let detectedHands: DetectedHand[] = [];
          if (video && isCameraActive) {
            detectedHands = await handTracker.processVideoFrame(video);
          }

          const newlyTriggeredKeyIds = new Set<string>();
          const isMirrored = settings.mirrorCamera || playMode === 'air';

          detectedHands.forEach((hand) => {
            // Index fingertip is primary (landmark 8)
            const rawTip = hand.indexFingertip;
            const effectiveX = isMirrored ? 1 - rawTip.x : rawTip.x;
            const effectiveY = rawTip.y;
            const effectivePt: Point2D = { x: effectiveX, y: effectiveY };

            // Warp coordinate to 2D Piano Key space [0, 1]
            const warpedPt = transformRef.current.transformPoint(effectivePt);
            const u = warpedPt.x;
            const v = warpedPt.y;

            // Collision check against piano keys
            let hitKey: PianoKey | null = null;

            // Check black keys first (top layer)
            const hitBlackKey = keys.find((k) => {
              if (!k.isBlack) return false;
              const r = k.rectRatio;
              return u >= r.x && u <= r.x + r.width && v >= r.y && v <= r.y + r.height;
            });

            if (hitBlackKey) {
              hitKey = hitBlackKey;
            } else {
              const hitWhiteKey = keys.find((k) => {
                if (k.isBlack) return false;
                const r = k.rectRatio;
                return u >= r.x && u <= r.x + r.width && v >= r.y && v <= r.y + r.height;
              });
              if (hitWhiteKey) hitKey = hitWhiteKey;
            }

            // In instant mode, any key hit triggers immediately!
            // In tap mode, require hand touch
            const shouldPlay = triggerMode === 'instant' ? (hitKey !== null) : (hitKey !== null && hand.isTouchingPaper);

            if (hitKey && shouldPlay) {
              newlyTriggeredKeyIds.add(hitKey.id);
            }

            // Draw Fingertip Cursor & Ripple
            const camPxX = effectiveX * width;
            const camPxY = effectiveY * height;

            ctx.beginPath();
            const radius = hitKey ? 18 : 12;
            ctx.arc(camPxX, camPxY, radius, 0, 2 * Math.PI);
            if (hitKey) {
              ctx.fillStyle = 'rgba(6, 182, 212, 0.45)';
              ctx.strokeStyle = '#06b6d4';
              ctx.lineWidth = 3;
              ctx.shadowColor = '#06b6d4';
              ctx.shadowBlur = 20;
            } else {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1.5;
              ctx.shadowBlur = 0;
            }
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Core dot
            ctx.beginPath();
            ctx.arc(camPxX, camPxY, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            // Label above finger
            if (hitKey) {
              ctx.font = 'bold 13px sans-serif';
              ctx.fillStyle = '#38bdf8';
              ctx.textAlign = 'center';
              ctx.fillText(`PLAY: ${hitKey.note}`, camPxX, camPxY - radius - 6);
            }
          });

          // 4. Draw Individual Holographic Piano Keys
          keys.forEach((key) => {
            const isCurrentlyPressed =
              activePressedKeyIdsRef.current.has(key.id) || newlyTriggeredKeyIds.has(key.id);

            const r = key.rectRatio;
            const kTL = transformRef.current.inverseTransformPoint({ x: r.x, y: r.y });
            const kTR = transformRef.current.inverseTransformPoint({ x: r.x + r.width, y: r.y });
            const kBR = transformRef.current.inverseTransformPoint({ x: r.x + r.width, y: r.y + r.height });
            const kBL = transformRef.current.inverseTransformPoint({ x: r.x, y: r.y + r.height });

            const ptTL = { x: kTL.x * width, y: kTL.y * height };
            const ptTR = { x: kTR.x * width, y: kTR.y * height };
            const ptBR = { x: kBR.x * width, y: kBR.y * height };
            const ptBL = { x: kBL.x * width, y: kBL.y * height };

            ctx.beginPath();
            ctx.moveTo(ptTL.x, ptTL.y);
            ctx.lineTo(ptTR.x, ptTR.y);
            ctx.lineTo(ptBR.x, ptBR.y);
            ctx.lineTo(ptBL.x, ptBL.y);
            ctx.closePath();

            if (isCurrentlyPressed) {
              // Vibrant Key Highlight on touch/pointing
              ctx.fillStyle = key.isBlack ? 'rgba(236, 72, 153, 0.95)' : 'rgba(6, 182, 212, 0.85)';
              ctx.shadowColor = key.isBlack ? '#ec4899' : '#06b6d4';
              ctx.shadowBlur = 28;
            } else if (playMode === 'air') {
              ctx.fillStyle = key.isBlack ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.35)';
              ctx.shadowBlur = 0;
            } else {
              ctx.fillStyle = key.isBlack ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.25)';
              ctx.shadowBlur = 0;
            }
            ctx.fill();

            ctx.strokeStyle = isCurrentlyPressed ? '#ffffff' : key.isBlack ? '#ec4899' : '#cbd5e1';
            ctx.lineWidth = isCurrentlyPressed ? 2.5 : key.isBlack ? 2 : 1.5;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Note Label inside Key
            const labelCenterX = (ptTL.x + ptTR.x + ptBR.x + ptBL.x) / 4;
            const labelCenterY = (ptTL.y + ptTR.y + ptBR.y + ptBL.y) / 4 + (key.isBlack ? -6 : 14);

            ctx.font = isCurrentlyPressed ? 'bold 16px sans-serif' : '13px sans-serif';
            ctx.fillStyle = isCurrentlyPressed ? '#ffffff' : key.isBlack ? '#f472b6' : '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(key.label, labelCenterX, labelCenterY);
          });

          // 5. Direct Low-Latency Sound Playback Sync
          activePressedKeyIdsRef.current.forEach((keyId) => {
            if (!newlyTriggeredKeyIds.has(keyId) && !isPointerDownRef.current && activeKeyboardKeyRef.current !== keyId) {
              audioEngine.stopNote(keyId);
              activePressedKeyIdsRef.current.delete(keyId);
            }
          });

          newlyTriggeredKeyIds.forEach((keyId) => {
            if (!activePressedKeyIdsRef.current.has(keyId)) {
              activePressedKeyIdsRef.current.add(keyId);
              const foundKey = keys.find(k => k.id === keyId);
              if (foundKey) {
                audioEngine.playNote(keyId, foundKey.frequency);
                logService.logNote(foundKey.note, 'hand_cv', `MediaPipe tracking hit key (${foundKey.frequency} Hz)`);
              }
            }
          });


          // 6. Calibration Corner Drag Handles (Paper Mode)
          if (playMode === 'paper' && !calibration.isCalibrated) {
            const cornerList: { key: keyof QuadPoints; pt: Point2D; label: string }[] = [
              { key: 'topLeft', pt: pTL, label: 'TL (1)' },
              { key: 'topRight', pt: pTR, label: 'TR (2)' },
              { key: 'bottomRight', pt: pBR, label: 'BR (3)' },
              { key: 'bottomLeft', pt: pBL, label: 'BL (4)' },
            ];

            cornerList.forEach(({ key, pt, label }) => {
              const isHovered = draggingCorner === key;
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, isHovered ? 14 : 10, 0, 2 * Math.PI);
              ctx.fillStyle = isHovered ? '#ec4899' : '#f59e0b';
              ctx.fill();
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 2.5;
              ctx.stroke();

              ctx.font = 'bold 11px sans-serif';
              ctx.fillStyle = '#ffffff';
              ctx.fillText(label, pt.x, pt.y - 16);
            });
          }

          // Throttled UI state updates (every 100ms)
          const now = performance.now();
          if (now - lastUiUpdateRef.current >= 100) {
            lastUiUpdateRef.current = now;
            const activeNotesList = Array.from(activePressedKeyIdsRef.current).map(
              id => keys.find(k => k.id === id)?.note || id
            );
            setActiveKeyNotes(activeNotesList);
            setTouchStateText(detectedHands.length === 0 ? 'No Hands' : 'Active');
          }

          // FPS & Stats Update (1 sec interval)
          frameCountRef.current++;
          if (now - lastFpsTimeRef.current >= 1000) {
            const fps = Math.round((frameCountRef.current * 1000) / (now - lastFpsTimeRef.current));
            setCurrentFps(fps);
            frameCountRef.current = 0;
            lastFpsTimeRef.current = now;

            onStatsUpdate({
              fps,
              handDetected: detectedHands.length > 0,
              pianoDetected: true,
              activeKeyNote: Array.from(activePressedKeyIdsRef.current).map(id => keys.find(k => k.id === id)?.note || id)[0] || null,
              processingTimeMs: Math.round(performance.now() - startTime),
              calibrationConfidence: playMode === 'air' ? 1.0 : calibration.isCalibrated ? 0.95 : 0.6,
            });
          }
        }
      }

      animFrameId = requestAnimationFrame(processFrame);
    };

    animFrameId = requestAnimationFrame(processFrame);
    return () => cancelAnimationFrame(animFrameId);
  }, [isCameraActive, settings, calibration, keys, draggingCorner, onStatsUpdate, playMode, activeCorners, triggerMode]);

  // Pointer Handlers
  const checkKeyUnderPointer = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (clientX - rect.left) / rect.width;
    const clickY = (clientY - rect.top) / rect.height;

    const warped = transformRef.current.transformPoint({ x: clickX, y: clickY });
    const u = warped.x;
    const v = warped.y;

    const hitBlackKey = keys.find((k) => {
      if (!k.isBlack) return false;
      const r = k.rectRatio;
      return u >= r.x && u <= r.x + r.width && v >= r.y && v <= r.y + r.height;
    });

    if (hitBlackKey) return hitBlackKey;

    return keys.find((k) => {
      if (k.isBlack) return false;
      const r = k.rectRatio;
      return u >= r.x && u <= r.x + r.width && v >= r.y && v <= r.y + r.height;
    });
  };

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isPointerDownRef.current = true;
    audioEngine.init();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;

    if (playMode === 'paper' && !calibration.isCalibrated) {
      const corners = calibration.corners;
      const threshold = 0.05;
      const keysList: (keyof QuadPoints)[] = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
      for (const k of keysList) {
        const c = corners[k];
        const dist = Math.hypot(clickX - c.x, clickY - c.y);
        if (dist < threshold) {
          setDraggingCorner(k);
          return;
        }
      }
    }

    const hitKey = checkKeyUnderPointer(e.clientX, e.clientY);
    if (hitKey) {
      if (!activePressedKeyIdsRef.current.has(hitKey.id)) {
        activePressedKeyIdsRef.current.add(hitKey.id);
        audioEngine.playNote(hitKey.id, hitKey.frequency);
        setActiveKeyNotes(Array.from(activePressedKeyIdsRef.current).map(id => keys.find(k => k.id === id)?.note || id));
        logService.logNote(hitKey.note, 'mouse_touch', `Canvas pointer click (${hitKey.frequency} Hz)`);
      }
    }
  };


  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (playMode === 'paper' && draggingCorner && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

      const updatedQuad: QuadPoints = {
        ...calibration.corners,
        [draggingCorner]: { x, y },
      };

      onUpdateCalibration({
        ...calibration,
        corners: updatedQuad,
      });
      return;
    }

    if (isPointerDownRef.current) {
      const hitKey = checkKeyUnderPointer(e.clientX, e.clientY);
      if (hitKey && !activePressedKeyIdsRef.current.has(hitKey.id)) {
        activePressedKeyIdsRef.current.forEach(id => audioEngine.stopNote(id));
        activePressedKeyIdsRef.current.clear();
        activePressedKeyIdsRef.current.add(hitKey.id);
        audioEngine.playNote(hitKey.id, hitKey.frequency);
        setActiveKeyNotes([hitKey.note]);
      }
    }
  };

  const handleCanvasPointerUp = () => {
    isPointerDownRef.current = false;
    setDraggingCorner(null);
    activePressedKeyIdsRef.current.forEach(id => audioEngine.stopNote(id));
    activePressedKeyIdsRef.current.clear();
    setActiveKeyNotes([]);
  };

  const handleKeyTriggerStart = (key: PianoKey) => {
    audioEngine.init();
    if (!activePressedKeyIdsRef.current.has(key.id)) {
      activePressedKeyIdsRef.current.add(key.id);
      audioEngine.playNote(key.id, key.frequency);
      setActiveKeyNotes(Array.from(activePressedKeyIdsRef.current).map(id => keys.find(k => k.id === id)?.note || id));
      logService.logNote(key.note, 'mouse_touch', `Screen key button click (${key.frequency} Hz)`);
    }
  };


  const handleKeyTriggerEnd = (keyId: string) => {
    if (activePressedKeyIdsRef.current.has(keyId)) {
      audioEngine.stopNote(keyId);
      activePressedKeyIdsRef.current.delete(keyId);
      setActiveKeyNotes(Array.from(activePressedKeyIdsRef.current).map(id => keys.find(k => k.id === id)?.note || id));
    }
  };

  const handleAutoDetectPiano = () => {
    if (canvasRef.current) {
      const res = openCVProcessor.detectPianoCorners(canvasRef.current, calibration.corners);
      onUpdateCalibration({
        ...calibration,
        corners: res.quad,
        isCalibrated: true,
      });
    }
  };

  const whiteKeys = keys.filter(k => !k.isBlack);
  const blackKeys = keys.filter(k => k.isBlack);

  const keyShortcutHint: Record<string, string> = {
    'C4': 'A / 1', 'D4': 'S / 2', 'E4': 'D / 3', 'F4': 'F / 4',
    'G4': 'G / 5', 'A4': 'H / 6', 'B4': 'J / 7', 'C5': 'K / 8',
    'Cs4': 'W', 'Ds4': 'E', 'Fs4': 'T', 'Gs4': 'Y', 'As4': 'U',
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto p-3 sm:p-6 space-y-4">
      {/* Hidden Video Element */}
      <video ref={videoRef} className="hidden" playsInline muted />

      {/* Top Header Mode Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setPlayMode('air')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
              playMode === 'air'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Wind className="w-4 h-4" />
            <span>🪄 Air Piano (Dummy Layout)</span>
          </button>

          <button
            onClick={() => setPlayMode('paper')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
              playMode === 'paper'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>📄 Paper Sheet Piano</span>
          </button>
        </div>

        {/* Trigger Mode Selector */}
        <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium hidden sm:inline">Sound Trigger:</span>
          <button
            onClick={() => setTriggerMode('instant')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              triggerMode === 'instant'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            ✨ Instant Finger Play
          </button>
          <button
            onClick={() => setTriggerMode('tap')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              triggerMode === 'tap'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            🖐️ Tap Down Only
          </button>
        </div>
      </div>

      {/* Main Holographic Vision Canvas - Rock Solid 16:9 Aspect Ratio */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-800 shadow-2xl group">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          className="w-full h-full object-contain cursor-crosshair touch-none block"
        />

        {/* Camera Error Banner */}
        {cameraError && (
          <div className="absolute inset-x-4 top-4 bg-amber-500/90 text-slate-950 p-3 rounded-xl flex items-center space-x-3 text-xs sm:text-sm font-semibold shadow-lg">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* HUD Overlay Stats */}
        <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-200 flex items-center space-x-3 shadow-md">
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span>{isCameraActive ? 'CV Finger Tracking Active' : 'Simulation'}</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <span>{currentFps} FPS</span>
          <div className="h-3 w-px bg-slate-700" />
          <span className="text-cyan-400 font-mono font-bold">
            {activeKeyNotes.length > 0 ? `Playing: ${activeKeyNotes.join(', ')}` : 'Move finger over piano keys'}
          </span>
        </div>

        {/* Mode Tag */}
        <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-semibold flex items-center space-x-1.5 shadow-md">
          {playMode === 'paper' ? (
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <FileText className="w-3.5 h-3.5" />
              <span>Paper Sheet Mode</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-cyan-300">
              <Wind className="w-3.5 h-3.5" />
              <span>Air Piano Mode</span>
            </div>
          )}
        </div>

        {/* Calibration Helper Banner */}
        {playMode === 'paper' && !calibration.isCalibrated && (
          <div className="absolute bottom-4 inset-x-4 bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-amber-500/50 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
              <span>Drag the 4 corner markers to match your paper sheet corners!</span>
            </div>
            <button
              onClick={handleAutoDetectPiano}
              className="px-3 py-1 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition ml-2 flex-shrink-0"
            >
              Auto-Detect Sheet
            </button>
          </div>
        )}
      </div>

      {/* Preset bar for Air Mode */}
      {playMode === 'air' && (
        <div className="w-full bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <span className="text-slate-400 font-medium">Virtual Air Layout Position:</span>
          <div className="flex items-center space-x-2">
            {(['bottom', 'center', 'wide'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => setAirPreset(preset)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                  airPreset === preset
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interactive On-Screen Digital Keyboard */}
      <div className="w-full bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white tracking-wide">Interactive Piano Keyboard</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">Touch or Press Keys (A-K / 1-8)</span>
          </div>
          {activeKeyNotes.length > 0 && (
            <div className="flex items-center space-x-1 text-cyan-400 font-mono font-bold animate-pulse">
              <span>Playing:</span>
              <span className="bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/40 text-xs">{activeKeyNotes.join(' + ')}</span>
            </div>
          )}
        </div>

        {/* Piano Keys Visualizer Bar */}
        <div className="relative w-full h-32 select-none touch-none rounded-xl overflow-hidden border-2 border-slate-950 shadow-2xl bg-slate-950 flex">
          {/* White Keys */}
          {whiteKeys.map((key) => {
            const isPressed = activeKeyNotes.includes(key.note);
            return (
              <button
                key={key.id}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleKeyTriggerStart(key);
                }}
                onPointerUp={() => handleKeyTriggerEnd(key.id)}
                onPointerLeave={() => handleKeyTriggerEnd(key.id)}
                className={`flex-1 relative flex flex-col justify-end items-center pb-2 transition-all duration-75 border-r border-slate-300 last:border-r-0 ${
                  isPressed
                    ? 'bg-gradient-to-t from-cyan-400 to-cyan-200 text-slate-950 shadow-inner translate-y-0.5'
                    : 'bg-gradient-to-b from-white via-slate-100 to-slate-200 text-slate-800 hover:bg-slate-100 active:bg-cyan-300'
                }`}
              >
                <span className="text-xs sm:text-sm font-bold tracking-tight">{key.note}</span>
                <span className="text-[9px] text-slate-500 font-mono hidden sm:block">{keyShortcutHint[key.id] || ''}</span>
              </button>
            );
          })}

          {/* Black Keys */}
          {blackKeys.map((key) => {
            const isPressed = activeKeyNotes.includes(key.note);
            return (
              <button
                key={key.id}
                style={{
                  left: `${key.rectRatio.x * 100}%`,
                  width: `${key.rectRatio.width * 100}%`,
                  height: `${key.rectRatio.height * 100}%`,
                }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleKeyTriggerStart(key);
                }}
                onPointerUp={() => handleKeyTriggerEnd(key.id)}
                onPointerLeave={() => handleKeyTriggerEnd(key.id)}
                className={`absolute top-0 z-10 rounded-b-md flex flex-col justify-end items-center pb-1.5 transition-all duration-75 border border-slate-950 ${
                  isPressed
                    ? 'bg-gradient-to-t from-pink-500 to-rose-400 text-white shadow-lg shadow-pink-500/50'
                    : 'bg-gradient-to-b from-slate-800 to-slate-950 text-pink-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-[10px] sm:text-xs font-bold leading-none">{key.note}</span>
                <span className="text-[8px] text-pink-300/70 font-mono hidden sm:block mt-0.5">{keyShortcutHint[key.id] || ''}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div className="w-full bg-slate-900 rounded-xl p-3 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (isCameraActive) {
                if (videoRef.current && videoRef.current.srcObject) {
                  const stream = videoRef.current.srcObject as MediaStream;
                  stream.getTracks().forEach((t) => t.stop());
                }
                setIsCameraActive(false);
              } else {
                startCamera();
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center space-x-1.5 border border-slate-700"
          >
            <Camera className="w-4 h-4 text-indigo-400" />
            <span>{isCameraActive ? 'Stop Camera' : 'Start Camera'}</span>
          </button>

          {playMode === 'paper' && (
            <>
              <button
                onClick={handleAutoDetectPiano}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center space-x-1.5 border border-slate-700"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Auto Detect Paper</span>
              </button>

              <button
                onClick={() =>
                  onUpdateCalibration({
                    ...calibration,
                    corners: openCVProcessor.getDefaultQuad(640, 480),
                    isCalibrated: false,
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center space-x-1.5 border border-slate-700"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Reset Box</span>
              </button>
            </>
          )}
          <button
            onClick={() => setIsLogPanelOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-300 font-medium flex items-center space-x-1.5 border border-indigo-500/30 shadow-sm"
          >
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>Activity Log Panel</span>
          </button>
        </div>



        <div className="flex items-center space-x-3">
          <span className="text-slate-400">Keys: {settings.keyCount} Notes</span>
          <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-indigo-500/30">
            {settings.instrument.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>


      {/* Activity Log Panel Modal */}
      <ActivityLogPanel
        isOpen={isLogPanelOpen}
        onClose={() => setIsLogPanelOpen(false)}
      />
    </div>
  );
};

