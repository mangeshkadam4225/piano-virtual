import { Hands, Results, NormalizedLandmarkList } from '@mediapipe/hands';
import { DetectedHand, FingertipInfo, Point2D } from '../types';

export class HandTrackerService {
  private hands: Hands | null = null;
  private isInitialized = false;
  private isLoading = false;
  private lastDetectedHands: DetectedHand[] = [];
  
  // Smoothing parameters
  private smoothingAlpha = 0.55; 
  private deadzoneThreshold = 0.0025; // Deadzone to ignore camera micro-jitter

  // Memory for smoothing & baseline
  private prevFingertips: Map<string, Point2D> = new Map();
  private prevZValues: Map<string, number> = new Map();
  private prevDistances: Map<string, number> = new Map();
  private touchStateMemory: Map<string, boolean> = new Map();

  // Calibrated surface depth baseline (0mm level)
  private surfaceBaselineZ = 0.02;
  private isSurfaceCalibrated = false;

  // Touch threshold in mm (distance <= threshold triggers note)
  private triggerThresholdMm = 6.0;
  private releaseThresholdMm = 10.0;

  // Modes
  private touchMode: 'depth_tap' | 'proximity' | 'pinch' = 'depth_tap';

  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    if (this.isLoading) return false;

    this.isLoading = true;

    try {
      this.hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.hands.onResults((results: Results) => {
        this.processResults(results);
      });

      await this.hands.initialize();
      this.isInitialized = true;
      return true;
    } catch (err) {
      console.warn('MediaPipe Hands initialization error:', err);
      return false;
    } finally {
      this.isLoading = false;
    }
  }


  public async processVideoFrame(videoElement: HTMLVideoElement): Promise<DetectedHand[]> {
    if (!this.isInitialized || !this.hands) {
      await this.initialize();
    }

    if (this.hands && videoElement.readyState >= 2) {
      try {
        await this.hands.send({ image: videoElement });
      } catch {
        // Frame skipped
      }
    }

    return this.lastDetectedHands;
  }

  private processResults(results: Results) {
    const hands: DetectedHand[] = [];

    if (results.multiHandLandmarks && results.multiHandedness) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks: NormalizedLandmarkList = results.multiHandLandmarks[i];
        const handedness = results.multiHandedness[i];
        const handLabel = handedness?.label || (i === 0 ? 'Right' : 'Left');
        const score = handedness?.score || 0.9;

        // Landmark #8 is INDEX_FINGER_TIP
        const rawIndexTip = landmarks[8];
        const rawIndexPoint: Point2D = { x: rawIndexTip.x, y: rawIndexTip.y };

        const handKey = `${handLabel}_${i}`;
        const smoothedIndexPoint = this.applySmoothing(`${handKey}_index`, rawIndexPoint);

        const fingerDefs: { name: FingertipInfo['name']; tipIdx: number; pipIdx: number; mcpIdx: number }[] = [
          { name: 'thumb', tipIdx: 4, pipIdx: 3, mcpIdx: 2 },
          { name: 'index', tipIdx: 8, pipIdx: 6, mcpIdx: 5 },
          { name: 'middle', tipIdx: 12, pipIdx: 10, mcpIdx: 9 },
          { name: 'ring', tipIdx: 16, pipIdx: 14, mcpIdx: 13 },
          { name: 'pinky', tipIdx: 20, pipIdx: 18, mcpIdx: 17 },
        ];

        const fingertips: FingertipInfo[] = [];
        let maxTouchScore = 0;
        let lowestDistMm = 999;

        // Reference landmarks
        const wrist = landmarks[0];
        const indexMcp = landmarks[5];
        const handSpan = Math.hypot(indexMcp.x - wrist.x, indexMcp.y - wrist.y) || 0.2;

        fingerDefs.forEach(({ name, tipIdx, pipIdx, mcpIdx }) => {
          const tip = landmarks[tipIdx];
          const pip = landmarks[pipIdx];
          const mcp = landmarks[mcpIdx];

          const smoothedPt = this.applySmoothing(`${handKey}_${name}`, { x: tip.x, y: tip.y });

          // Smooth Z-depth with micro-jitter deadzone
          const prevZ = this.prevZValues.get(`${handKey}_${name}_z`) ?? tip.z;
          const zDelta = Math.abs(tip.z - prevZ);
          const smoothedZ = zDelta < 0.002 ? prevZ : prevZ + this.smoothingAlpha * (tip.z - prevZ);
          this.prevZValues.set(`${handKey}_${name}_z`, smoothedZ);

          // Relative depth to knuckle
          const deltaZ = smoothedZ - mcp.z;

          // Kinematic joint flexion
          const dist2D = Math.hypot(tip.x - mcp.x, tip.y - mcp.y);
          const seg1 = Math.hypot(pip.x - mcp.x, pip.y - mcp.y);
          const seg2 = Math.hypot(tip.x - pip.x, tip.y - pip.y);
          const totalBoneLen = seg1 + seg2 || 0.1;
          const extensionRatio = Math.min(1.0, dist2D / totalBoneLen);

          // Pinch measurement
          const thumbTip = landmarks[4];
          const pinchDist = Math.hypot(landmarks[8].x - thumbTip.x, landmarks[8].y - thumbTip.y);
          const isPinching = pinchDist < 0.05;

          // mm Distance estimation with scale factor
          const pixelToMmScale = 180 / handSpan;
          const zOffset = this.surfaceBaselineZ - deltaZ;
          let rawDistanceMm = Math.max(0, Math.round(zOffset * pixelToMmScale * 0.45));

          if (extensionRatio > 0.88 && deltaZ < 0) {
            rawDistanceMm += Math.round((extensionRatio - 0.88) * 35);
          }

          if (this.touchMode === 'proximity') {
            rawDistanceMm = 0;
          } else if (this.touchMode === 'pinch') {
            rawDistanceMm = isPinching ? 0 : Math.round(pinchDist * 300);
          }

          // Smooth distance value to remove numerical flutter
          const prevDist = this.prevDistances.get(`${handKey}_${name}_dist`) ?? rawDistanceMm;
          const distDelta = Math.abs(rawDistanceMm - prevDist);
          const smoothedDistMm = distDelta <= 1 ? prevDist : Math.round(prevDist + 0.5 * (rawDistanceMm - prevDist));
          this.prevDistances.set(`${handKey}_${name}_dist`, smoothedDistMm);

          if (smoothedDistMm < lowestDistMm) {
            lowestDistMm = smoothedDistMm;
          }

          // Hysteresis touch check
          const fingerStateKey = `${handKey}_${name}_touch`;
          const wasTouching = this.touchStateMemory.get(fingerStateKey) || false;

          let isTouching = false;
          if (wasTouching) {
            isTouching = smoothedDistMm <= this.releaseThresholdMm;
          } else {
            isTouching = smoothedDistMm <= this.triggerThresholdMm;
          }
          this.touchStateMemory.set(fingerStateKey, isTouching);

          const touchDepth = Math.max(0, Math.min(1, 1.0 - smoothedDistMm / 35));
          if (touchDepth > maxTouchScore) {
            maxTouchScore = touchDepth;
          }

          fingertips.push({
            name,
            landmarkIndex: tipIdx,
            point: smoothedPt,
            z: smoothedZ,
            isTouching,
            touchDepth,
            distanceToSurfaceMm: smoothedDistMm,
          });
        });

        const isTouchingPaper = fingertips.some(f => f.isTouching);

        hands.push({
          handedness: handLabel as 'Left' | 'Right',
          score,
          landmarks: landmarks.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z })),
          indexFingertip: smoothedIndexPoint,
          fingertips,
          isTouchingPaper,
          touchDepthScore: maxTouchScore,
          minDistanceMm: lowestDistMm === 999 ? 50 : lowestDistMm,
        });
      }
    }

    this.lastDetectedHands = hands;
  }

  private applySmoothing(key: string, current: Point2D): Point2D {
    const prev = this.prevFingertips.get(key);
    if (!prev) {
      this.prevFingertips.set(key, current);
      return current;
    }

    const dx = current.x - prev.x;
    const dy = current.y - prev.y;
    const dist = Math.hypot(dx, dy);

    // Deadzone filter: ignore micro sub-pixel noise
    if (dist < this.deadzoneThreshold) {
      return prev;
    }

    // Dynamic alpha: smooth small motions, respond immediately to fast strikes
    const dynamicAlpha = dist > 0.05 ? 0.85 : this.smoothingAlpha;

    const smoothed = {
      x: prev.x + dynamicAlpha * dx,
      y: prev.y + dynamicAlpha * dy,
    };

    this.prevFingertips.set(key, smoothed);
    return smoothed;
  }

  public calibrateSurfaceBaseline(hands: DetectedHand[]): { success: boolean; baselineZ: number } {
    if (hands.length === 0) return { success: false, baselineZ: this.surfaceBaselineZ };

    const hand = hands[0];
    const indexTip = hand.fingertips.find(f => f.name === 'index');
    if (!indexTip || hand.landmarks.length < 9) return { success: false, baselineZ: this.surfaceBaselineZ };

    const indexMcp = hand.landmarks[5];
    const deltaZ = indexTip.z - indexMcp.z;

    this.surfaceBaselineZ = deltaZ;
    this.isSurfaceCalibrated = true;

    return { success: true, baselineZ: deltaZ };
  }

  public setTriggerThresholdMm(thresholdMm: number) {
    this.triggerThresholdMm = Math.max(1, Math.min(25, thresholdMm));
    this.releaseThresholdMm = this.triggerThresholdMm + 4.0;
  }

  public setTouchDetectionMode(mode: 'depth_tap' | 'proximity' | 'pinch') {
    this.touchMode = mode;
  }

  public getSurfaceBaselineZ(): number {
    return this.surfaceBaselineZ;
  }

  public setSurfaceBaselineZ(z: number) {
    this.surfaceBaselineZ = z;
    this.isSurfaceCalibrated = true;
  }
}

export const handTracker = new HandTrackerService();
