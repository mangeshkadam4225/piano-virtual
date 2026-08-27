import { PianoKey } from '../types';

// Standard 8 White Keys + 5 Black Keys layout for Octave 4
// Uses 3-cell (C,D,E) + 4-cell (F,G,A,B) geometry with 6/9 height black keys
export const PIANO_KEYS_8: PianoKey[] = [
  { id: 'C4', note: 'C4', label: 'C', frequency: 261.63, isBlack: false, rectRatio: { x: 0, y: 0, width: 0.125, height: 1 } },
  { id: 'D4', note: 'D4', label: 'D', frequency: 293.66, isBlack: false, rectRatio: { x: 0.125, y: 0, width: 0.125, height: 1 } },
  { id: 'E4', note: 'E4', label: 'E', frequency: 329.63, isBlack: false, rectRatio: { x: 0.25, y: 0, width: 0.125, height: 1 } },
  { id: 'F4', note: 'F4', label: 'F', frequency: 349.23, isBlack: false, rectRatio: { x: 0.375, y: 0, width: 0.125, height: 1 } },
  { id: 'G4', note: 'G4', label: 'G', frequency: 392.00, isBlack: false, rectRatio: { x: 0.5, y: 0, width: 0.125, height: 1 } },
  { id: 'A4', note: 'A4', label: 'A', frequency: 440.00, isBlack: false, rectRatio: { x: 0.625, y: 0, width: 0.125, height: 1 } },
  { id: 'B4', note: 'B4', label: 'B', frequency: 493.88, isBlack: false, rectRatio: { x: 0.75, y: 0, width: 0.125, height: 1 } },
  { id: 'C5', note: 'C5', label: 'C5', frequency: 523.25, isBlack: false, rectRatio: { x: 0.875, y: 0, width: 0.125, height: 1 } },
];

export const PIANO_KEYS_13: PianoKey[] = [
  // White keys: 3-cell small region (C, D, E) + 4-cell big region (F, G, A, B) + Octave C5
  { id: 'C4', note: 'C4', label: 'C4', frequency: 261.63, isBlack: false, rectRatio: { x: 0.0, y: 0, width: 0.125, height: 1.0 } },
  { id: 'D4', note: 'D4', label: 'D4', frequency: 293.66, isBlack: false, rectRatio: { x: 0.125, y: 0, width: 0.125, height: 1.0 } },
  { id: 'E4', note: 'E4', label: 'E4', frequency: 329.63, isBlack: false, rectRatio: { x: 0.25, y: 0, width: 0.125, height: 1.0 } },
  { id: 'F4', note: 'F4', label: 'F4', frequency: 349.23, isBlack: false, rectRatio: { x: 0.375, y: 0, width: 0.125, height: 1.0 } },
  { id: 'G4', note: 'G4', label: 'G4', frequency: 392.00, isBlack: false, rectRatio: { x: 0.5, y: 0, width: 0.125, height: 1.0 } },
  { id: 'A4', note: 'A4', label: 'A4', frequency: 440.00, isBlack: false, rectRatio: { x: 0.625, y: 0, width: 0.125, height: 1.0 } },
  { id: 'B4', note: 'B4', label: 'B4', frequency: 493.88, isBlack: false, rectRatio: { x: 0.75, y: 0, width: 0.125, height: 1.0 } },
  { id: 'C5', note: 'C5', label: 'C5', frequency: 523.25, isBlack: false, rectRatio: { x: 0.875, y: 0, width: 0.125, height: 1.0 } },

  // Black keys: 2-cell (C#, D#) + 3-cell (F#, G#, A#), height = 6/9 (~0.6667)
  { id: 'Cs4', note: 'C#4', label: 'C#', frequency: 277.18, isBlack: true, rectRatio: { x: 0.088, y: 0, width: 0.074, height: 6 / 9 } },
  { id: 'Ds4', note: 'D#4', label: 'D#', frequency: 311.13, isBlack: true, rectRatio: { x: 0.213, y: 0, width: 0.074, height: 6 / 9 } },
  { id: 'Fs4', note: 'F#4', label: 'F#', frequency: 369.99, isBlack: true, rectRatio: { x: 0.463, y: 0, width: 0.074, height: 6 / 9 } },
  { id: 'Gs4', note: 'G#4', label: 'G#', frequency: 415.30, isBlack: true, rectRatio: { x: 0.588, y: 0, width: 0.074, height: 6 / 9 } },
  { id: 'As4', note: 'A#4', label: 'A#', frequency: 466.16, isBlack: true, rectRatio: { x: 0.713, y: 0, width: 0.074, height: 6 / 9 } },
];

export const generateLayoutJson = () => {
  return {
    version: '2.0',
    model: 'UNET_MobileNetV2_Segmenter',
    description: 'Virtual Piano 3-cell + 4-cell segmentation geometry with 6/9 height black keys',
    regions: {
      small_region: {
        label: 'C_D_E (Red Mask)',
        white_notes: ['C4', 'D4', 'E4'],
        black_notes: ['C#4', 'D#4'],
        cells_bottom: 3,
        cells_top: 2,
      },
      big_region: {
        label: 'F_G_A_B (Blue Mask)',
        white_notes: ['F4', 'G4', 'A4', 'B4'],
        black_notes: ['F#4', 'G#4', 'A#4'],
        cells_bottom: 4,
        cells_top: 3,
      },
    },
    black_key_height_ratio: 6 / 9,
    keys: PIANO_KEYS_13,
  };
};

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private activeVoices: Map<string, { oscs: OscillatorNode[]; gain: GainNode }> = new Map();
  private volume: number = 0.8;
  private instrument: 'grand_piano' | 'synth_piano' | 'electric_piano' | 'organ' = 'grand_piano';

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public setInstrument(inst: 'grand_piano' | 'synth_piano' | 'electric_piano' | 'organ') {
    this.instrument = inst;
  }

  public playNote(keyId: string, frequency: number) {
    this.init();
    if (!this.ctx) return;

    // If already playing this key, don't restart unnecessarily
    if (this.activeVoices.has(keyId)) return;

    const now = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);

    const oscs: OscillatorNode[] = [];

    if (this.instrument === 'grand_piano') {
      // Fundamental + Harmonics for rich piano body
      const fundamental = this.ctx.createOscillator();
      fundamental.type = 'triangle';
      fundamental.frequency.setValueAtTime(frequency, now);

      const harmonic1 = this.ctx.createOscillator();
      harmonic1.type = 'sine';
      harmonic1.frequency.setValueAtTime(frequency * 2, now);

      const harmonic2 = this.ctx.createOscillator();
      harmonic2.type = 'sine';
      harmonic2.frequency.setValueAtTime(frequency * 3, now);

      const h1Gain = this.ctx.createGain();
      h1Gain.gain.value = 0.3;
      const h2Gain = this.ctx.createGain();
      h2Gain.gain.value = 0.15;

      // Filter for acoustic warmth
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(frequency * 4, now);
      filter.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + 1.2);

      fundamental.connect(filter);
      harmonic1.connect(h1Gain);
      h1Gain.connect(filter);
      harmonic2.connect(h2Gain);
      h2Gain.connect(filter);

      filter.connect(masterGain);

      oscs.push(fundamental, harmonic1, harmonic2);

      // Acoustic Piano Envelope: Fast attack, quick decay, long release
      masterGain.gain.linearRampToValueAtTime(this.volume, now + 0.015);
      masterGain.gain.exponentialRampToValueAtTime(this.volume * 0.4, now + 0.3);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
    } else if (this.instrument === 'synth_piano') {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(frequency, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);

      osc.connect(filter);
      filter.connect(masterGain);
      oscs.push(osc);

      masterGain.gain.linearRampToValueAtTime(this.volume, now + 0.01);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    } else if (this.instrument === 'electric_piano') {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);

      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(frequency * 0.5, now);

      osc.connect(masterGain);
      subOsc.connect(masterGain);
      oscs.push(osc, subOsc);

      masterGain.gain.linearRampToValueAtTime(this.volume, now + 0.02);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
    } else {
      // Organ
      const osc = this.ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(frequency, now);
      osc.connect(masterGain);
      oscs.push(osc);

      masterGain.gain.linearRampToValueAtTime(this.volume * 0.7, now + 0.01);
      masterGain.gain.setValueAtTime(this.volume * 0.7, now + 2.0);
    }

    masterGain.connect(this.ctx.destination);

    oscs.forEach(o => o.start(now));
    this.activeVoices.set(keyId, { oscs, gain: masterGain });
  }

  public stopNote(keyId: string) {
    if (!this.ctx) return;
    const voice = this.activeVoices.get(keyId);
    if (voice) {
      const now = this.ctx.currentTime;
      try {
        voice.gain.gain.cancelScheduledValues(now);
        const currentGain = Math.max(0.0001, voice.gain.gain.value);
        voice.gain.gain.setValueAtTime(currentGain, now);
        voice.gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.15);
      } catch {
        // Fallback in case parameters cannot be ramped
      }

      setTimeout(() => {
        voice.oscs.forEach(o => {
          try {
            o.stop();
            o.disconnect();
          } catch {
            // Already stopped
          }
        });
      }, 160);

      this.activeVoices.delete(keyId);
    }
  }

  public stopAllNotes() {
    this.activeVoices.forEach((_, keyId) => this.stopNote(keyId));
  }
}

export const audioEngine = new AudioEngine();
