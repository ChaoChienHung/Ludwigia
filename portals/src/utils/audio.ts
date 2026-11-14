/**
 * Synthesizes mystical wonderland sound effects using the Web Audio API.
 * Requires no external audio assets; zero latency, hermetic and lightweight.
 */

class WonderlandAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private isAmbientPlaying: boolean = false;

  constructor() {
    // Check saved mute preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wonderland_muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('wonderland_muted', String(this.isMuted));
    }

    if (this.isMuted) {
      this.stopAmbient();
    } else {
      this.startAmbient();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public startAmbient() {
    if (this.isMuted || this.isAmbientPlaying) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.04, this.ctx.currentTime + 3);
      this.ambientGain.connect(this.ctx.destination);

      // Deep gentle warm drone (F2 ~ 87.3Hz)
      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc1.type = 'sine';
      this.ambientOsc1.frequency.setValueAtTime(87.31, this.ctx.currentTime);

      // Shimmering octave fifth (C4 ~ 261.6Hz)
      this.ambientOsc2 = this.ctx.createOscillator();
      this.ambientOsc2.type = 'triangle';
      this.ambientOsc2.frequency.setValueAtTime(261.63, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      this.ambientOsc1.connect(filter);
      this.ambientOsc2.connect(filter);
      filter.connect(this.ambientGain);

      this.ambientOsc1.start();
      this.ambientOsc2.start();
      this.isAmbientPlaying = true;
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  public stopAmbient() {
    if (!this.isAmbientPlaying || !this.ctx || !this.ambientGain) return;
    try {
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, this.ctx.currentTime);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
      setTimeout(() => {
        if (this.ambientOsc1) {
          this.ambientOsc1.stop();
          this.ambientOsc1.disconnect();
          this.ambientOsc1 = null;
        }
        if (this.ambientOsc2) {
          this.ambientOsc2.stop();
          this.ambientOsc2.disconnect();
          this.ambientOsc2 = null;
        }
        this.isAmbientPlaying = false;
      }, 850);
    } catch {
      this.isAmbientPlaying = false;
    }
  }

  /**
   * Play crystal chord chime when hovering over a portal
   */
  public playPortalHover(preset: 'wood' | 'astral' | 'water' | 'crystal' | 'spore' | 'moon') {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const frequencies: Record<string, number[]> = {
        wood: [261.63, 329.63, 392.0, 523.25], // C Major pentatonic
        astral: [440.0, 554.37, 659.25, 880.0], // A Major celestial
        water: [293.66, 369.99, 440.0, 587.33], // D Celtic liquid
        crystal: [523.25, 659.25, 783.99, 1046.5], // High crystal bell
        spore: [349.23, 440.0, 523.25, 698.46], // F Warm golden
        moon: [392.0, 493.88, 587.33, 783.99], // G Pure silver
      };

      const notes = frequencies[preset] || frequencies.wood;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0, now + idx * 0.04);
        gain.gain.linearRampToValueAtTime(0.045 / (idx + 1), now + idx * 0.04 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.9);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.95);
      });
    } catch {
      // Ignored
    }
  }

  /**
   * Sound when entering or clicking a portal (warp sweep)
   */
  public playPortalWarp() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      // Low pass filter to keep it rich and mystical
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.5);
      filter.frequency.exponentialRampToValueAtTime(300, now + 1.2);

      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.4);
      osc.frequency.exponentialRampToValueAtTime(220, now + 1.2);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.25);
    } catch {
      // Ignored
    }
  }

  /**
   * Subtle click chime when navigating
   */
  public playNavClick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Ignored
    }
  }
}

export const wonderlandAudio = new WonderlandAudioEngine();
