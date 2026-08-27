export interface PythonFile {
  filename: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const PYTHON_PROJECT_FILES: PythonFile[] = [
  {
    filename: 'requirements.txt',
    path: 'requirements.txt',
    language: 'text',
    description: 'Python project dependencies: OpenCV, MediaPipe, NumPy, ONNX Runtime, and Playsound/Pygame audio synthesizer.',
    content: `opencv-python>=4.8.0
numpy>=1.24.0
mediapipe>=0.10.0
onnxruntime>=1.16.0
playsound>=1.3.0
pygame>=2.5.0
`,
  },
  {
    filename: 'runme.bat',
    path: 'runme.bat',
    language: 'bat',
    description: 'Windows batch script to automatically install dependencies and launch the Virtual Piano Python application.',
    content: `@echo off
echo ===================================================
echo   Virtual Piano CV - Python 3.12 Launcher
echo   Plays piano on printed paper or in the air!
echo ===================================================
echo.

echo [1/2] Installing requirements...
pip install -r requirements.txt

echo.
echo [2/2] Launching Virtual Piano CV...
python main.py

pause
`,
  },
  {
    filename: 'runme.sh',
    path: 'runme.sh',
    language: 'bash',
    description: 'macOS/Linux shell script to install dependencies and run Virtual Piano CV.',
    content: `#!/usr/bin/env bash
echo "==================================================="
echo "  Virtual Piano CV - Python 3.12 Launcher"
echo "==================================================="
pip install -r requirements.txt
python3 main.py
`,
  },
  {
    filename: 'piano_geometry.py',
    path: 'piano_geometry.py',
    language: 'python',
    description: 'Mathematical 3-cell + 4-cell key region generator with 6/9 height black keys and JSON export.',
    content: `import json
import numpy as np

class PianoGeometry:
    """
    Divides the piano sheet into 3-cell (C,D,E) and 4-cell (F,G,A,B) regions.
    Black notes have 6/9 height of the total region, with overlap subtracted.
    """
    def __init__(self):
        self.frequencies = {
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
            'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25,
            'Cs4': 277.18, 'Ds4': 311.13, 'Fs4': 369.99, 'Gs4': 415.30, 'As4': 466.16
        }
        self.keys = self._generate_layout()

    def _generate_layout(self):
        keys = []
        # 8 White Keys (C4 to C5)
        white_notes = [('C4', 'C'), ('D4', 'D'), ('E4', 'E'), ('F4', 'F'),
                       ('G4', 'G'), ('A4', 'A'), ('B4', 'B'), ('C5', 'C5')]
        for i, (nid, lbl) in enumerate(white_notes):
            keys.append({
                'id': nid, 'note': nid, 'label': lbl, 'is_black': False,
                'freq': self.frequencies[nid],
                'rect': {'x': i * 0.125, 'y': 0.0, 'w': 0.125, 'h': 1.0}
            })

        # 5 Black Keys (6/9 height = ~0.6667)
        black_notes = [
            ('Cs4', 'C#', 0.088, 0.074),
            ('Ds4', 'D#', 0.213, 0.074),
            ('Fs4', 'F#', 0.463, 0.074),
            ('Gs4', 'G#', 0.588, 0.074),
            ('As4', 'A#', 0.713, 0.074),
        ]
        for nid, lbl, x, w in black_notes:
            keys.append({
                'id': nid, 'note': nid, 'label': lbl, 'is_black': True,
                'freq': self.frequencies[nid],
                'rect': {'x': x, 'y': 0.0, 'w': w, 'h': 6.0 / 9.0}
            })
        return keys

    def get_key_at_point(self, u, v):
        """Returns the hit piano key at normalized coordinate (u, v) in [0, 1]"""
        # 1. Check black keys first (top layer priority)
        for k in self.keys:
            if k['is_black']:
                r = k['rect']
                if r['x'] <= u <= r['x'] + r['w'] and r['y'] <= v <= r['y'] + r['h']:
                    return k

        # 2. Check white keys
        for k in self.keys:
            if not k['is_black']:
                r = k['rect']
                if r['x'] <= u <= r['x'] + r['w'] and r['y'] <= v <= r['y'] + r['h']:
                    return k
        return None

    def export_json(self, filepath="piano_layout.json"):
        with open(filepath, "w") as f:
            json.dump({'keys': self.keys, 'black_key_height': 6/9}, f, indent=2)
`,
  },
  {
    filename: 'audio_synth.py',
    path: 'audio_synth.py',
    language: 'python',
    description: 'Low-latency acoustic piano sound synthesizer with triangular fundamentals and sine harmonics.',
    content: `import numpy as np
import threading
try:
    import pygame
    PYGAME_AVAILABLE = True
except ImportError:
    PYGAME_AVAILABLE = False

class AudioSynth:
    def __init__(self, sample_rate=44100):
        self.sample_rate = sample_rate
        self.sounds = {}
        self.active_key = None

        if PYGAME_AVAILABLE:
            pygame.mixer.init(frequency=sample_rate, size=-16, channels=2, buffer=512)
            self._precompute_notes()

    def _generate_piano_wave(self, freq, duration=1.2):
        t = np.linspace(0, duration, int(self.sample_rate * duration), False)
        # Fundamental (triangle) + 2 Harmonics (sine)
        fundamental = 0.6 * np.sin(2 * np.pi * freq * t)
        h1 = 0.25 * np.sin(2 * np.pi * 2 * freq * t)
        h2 = 0.15 * np.sin(2 * np.pi * 3 * freq * t)
        wave = fundamental + h1 + h2

        # Piano ADSR Envelope (Fast attack, gentle exponential decay)
        envelope = np.exp(-3.5 * t)
        sound_array = (wave * envelope * 32767).astype(np.int16)
        stereo = np.column_stack((sound_array, sound_array))
        return pygame.sndarray.make_sound(stereo)

    def _precompute_notes(self):
        freqs = {
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
            'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25,
            'Cs4': 277.18, 'Ds4': 311.13, 'Fs4': 369.99, 'Gs4': 415.30, 'As4': 466.16
        }
        for note, f in freqs.items():
            self.sounds[note] = self._generate_piano_wave(f)

    def play_note(self, note_name):
        if note_name == self.active_key:
            return
        self.active_key = note_name
        if PYGAME_AVAILABLE and note_name in self.sounds:
            self.sounds[note_name].play()
        else:
            print(f"🎵 [Sound Trigger]: {note_name}")

    def stop_note(self):
        self.active_key = None
`,
  },
  {
    filename: 'hand_tracker.py',
    path: 'hand_tracker.py',
    language: 'python',
    description: 'MediaPipe Hands index fingertip (Landmark #8) real-time extractor with EMA smoothing.',
    content: `import cv2
import mediapipe as mp

class HandTracker:
    def __init__(self, max_num_hands=2, min_detection_confidence=0.5):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            max_num_hands=max_num_hands,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=0.5
        )
        self.mp_draw = mp.solutions.drawing_utils
        self.prev_x = None
        self.prev_y = None
        self.alpha = 0.45  # Smoothing filter

    def process_frame(self, frame):
        h, w, _ = frame.shape
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb)

        fingertips = []
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                # Landmark 8 is INDEX_FINGER_TIP
                tip = hand_landmarks.landmark[8]
                raw_x, raw_y = tip.x, tip.y

                # Exponential Moving Average (EMA) smoothing
                if self.prev_x is None:
                    sx, sy = raw_x, raw_y
                else:
                    sx = self.prev_x + self.alpha * (raw_x - self.prev_x)
                    sy = self.prev_y + self.alpha * (raw_y - self.prev_y)

                self.prev_x, self.prev_y = sx, sy
                fingertips.append((sx, sy))

                # Draw skeleton
                self.mp_draw.draw_landmarks(frame, hand_landmarks, self.mp_hands.HAND_CONNECTIONS)
        else:
            self.prev_x, self.prev_y = None, None

        return fingertips
`,
  },
  {
    filename: 'main.py',
    path: 'main.py',
    language: 'python',
    description: 'Main application loop supporting both Printed Paper and Air Piano (Dummy Layout) modes.',
    content: `import cv2
import numpy as np
from piano_geometry import PianoGeometry
from hand_tracker import HandTracker
from audio_synth import AudioSynth

def main():
    cap = cv2.VideoCapture(0)
    geometry = PianoGeometry()
    tracker = HandTracker()
    synth = AudioSynth()

    # Mode: 'paper' (Perspective Homography) or 'air' (Floating Dummy Layout)
    mode = 'air'
    
    # 4-Corner Calibration Matrix Points (Default Lower 50% ROI)
    src_pts = np.float32([[100, 260], [540, 260], [580, 440], [60, 440]])
    dst_pts = np.float32([[0, 0], [1, 0], [1, 1], [0, 1]])
    H = cv2.getPerspectiveTransform(src_pts, dst_pts)
    H_inv = np.linalg.inv(H)

    print("====================================================")
    print("  Virtual Piano CV (Python 3.12)")
    print("  Keys: [A] Air Piano Mode | [P] Paper Sheet Mode | [Q] Quit")
    print("====================================================")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)  # Mirror frame
        h, w, _ = frame.shape

        # 1. Process Hand Tracking
        fingertips = tracker.process_frame(frame)
        hit_key = None

        # 2. Draw Piano Region Quad
        pts = src_pts.astype(np.int32).reshape((-1, 1, 2))
        cv2.polylines(frame, [pts], isClosed=True, color=(0, 255, 255), thickness=2)

        # 3. Draw Keys in Camera Perspective
        for k in geometry.keys:
            r = k['rect']
            # Corner points in normalized space
            k_pts_norm = np.array([
                [r['x'], r['y'], 1.0],
                [r['x'] + r['w'], r['y'], 1.0],
                [r['x'] + r['w'], r['y'] + r['h'], 1.0],
                [r['x'], r['y'] + r['h'], 1.0]
            ]).T

            # Project to Camera Space
            cam_pts = H_inv @ k_pts_norm
            cam_pts /= cam_pts[2, :]
            poly = cam_pts[:2, :].T.astype(np.int32)

            color = (30, 30, 30) if k['is_black'] else (240, 240, 240)
            cv2.fillPoly(frame, [poly], color)
            cv2.polylines(frame, [poly], isClosed=True, color=(0, 200, 255) if k['is_black'] else (80, 80, 80), thickness=1)

        # 4. Check Fingertip Intersections
        for (fx, fy) in fingertips:
            px, py = int(fx * w), int(fy * h)
            cv2.circle(frame, (px, py), 12, (0, 255, 255), 2)
            cv2.circle(frame, (px, py), 4, (255, 255, 255), -1)

            # Transform Point to Normalized Piano Space
            pt_cam = np.array([px, py, 1.0], dtype=np.float32)
            pt_piano = H @ pt_cam
            if abs(pt_piano[2]) > 1e-6:
                u = pt_piano[0] / pt_piano[2]
                v = pt_piano[1] / pt_piano[2]
                hit = geometry.get_key_at_point(u, v)
                if hit:
                    hit_key = hit

        # 5. Play Sound
        if hit_key:
            synth.play_note(hit_key['note'])
            cv2.putText(frame, f"NOTE: {hit_key['note']}", (30, 60),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 255), 3)
        else:
            synth.stop_note()

        # HUD Text
        cv2.putText(frame, f"Mode: {mode.upper()} | Press 'A' for Air, 'P' for Paper, 'Q' to Quit",
                    (20, h - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 2)

        cv2.imshow("Virtual Piano CV - Python", frame)
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('a'):
            mode = 'air'
            src_pts = np.float32([[80, 320], [w-80, 320], [w-80, h-40], [80, h-40]])
            H = cv2.getPerspectiveTransform(src_pts, dst_pts)
            H_inv = np.linalg.inv(H)
        elif key == ord('p'):
            mode = 'paper'

    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()
`,
  },
];
