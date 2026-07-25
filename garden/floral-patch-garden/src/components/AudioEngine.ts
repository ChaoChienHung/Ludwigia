// A clean, zero-dependency Web Audio synthesizer to generate organic digital garden ambiance.
let audioCtx: AudioContext | null = null;
let isMutedGlobal = false;

// Continuous background sound mixer nodes
let isMixerRunning = false;
let mixedNodes: {
  windSource: AudioNode | null;
  windGain: GainNode | null;
  rainSource: AudioNode | null;
  rainGain: GainNode | null;
  insectsSource: AudioNode | null;
  insectsGain: GainNode | null;
  padGains: GainNode[];
  padOscs: OscillatorNode[];
} = {
  windSource: null,
  windGain: null,
  rainSource: null,
  rainGain: null,
  insectsSource: null,
  insectsGain: null,
  padGains: [],
  padOscs: []
};

// Current volume states [0-100]
const volumes = {
  campfire: 0,
  rain: 0,
  insects: 0,
  pad: 0
};

function getAudioContext(): AudioContext | null {
  if (isMutedGlobal) return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Generate an organic white-to-brownish noise buffer
function createNoiseBuffer(ctx: AudioContext, seconds = 2.0): AudioBuffer {
  const size = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  // Brown noise simulation: integrated white noise
  let lastOut = 0.0;
  for (let i = 0; i < size; i++) {
    const white = Math.random() * 2 - 1;
    // Low-pass leak for deep brown rumble
    data[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = data[i];
    // Magnify
    data[i] *= 3.5;
  }
  return buffer;
}

// Generate high frequency click spray for rain patters
function createRainPatterBuffer(ctx: AudioContext): AudioBuffer {
  const size = ctx.sampleRate * 1.5;
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i++) {
    const p = Math.random();
    // High-pass sparse transients
    if (p > 0.993) {
      data[i] = Math.random() * 2 - 1;
    } else {
      data[i] = 0;
    }
  }
  return buffer;
}

export const AudioEngine = {
  toggleMute() {
    isMutedGlobal = !isMutedGlobal;
    if (isMutedGlobal) {
      this.stopMixer();
      if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
      }
    } else {
      getAudioContext();
      this.startMixer();
    }
    return isMutedGlobal;
  },

  getMuted() {
    return isMutedGlobal;
  },

  // Soft block friction and a low frequency warm thump for card flipping
  playFlip() {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.18);
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {
      console.warn("Audio play failed:", e);
    }
  },

  // Gorgeous glassy chime for blooming/flower clicks
  playChime(frequencyFactor = 1.0) {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880 * frequencyFactor, now);
      osc1.frequency.exponentialRampToValueAtTime(1200 * frequencyFactor, now + 0.3);
      
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1520 * frequencyFactor, now);
      
      gain1.gain.setValueAtTime(0.05, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      
      gain2.gain.setValueAtTime(0.02, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.2);
    } catch (e) {
      console.warn("Audio play failed:", e);
    }
  },

  // SESSOSAL SPECIALTY: Plays dynamic plant feedback suited to current weather theme
  playFlowerClick(season: "sunny" | "rainy" | "autumn" | "snowy" | "mystic", fidx = 0) {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const baseFreq = 523.25 * (1 + fidx * 0.15); // Pentatonic increments

      if (season === "snowy") {
        // Glistening Ice-Shatter effect: rapid high crystals
        const frequencies = [3500, 4800, 6200, 8500];
        frequencies.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(f, now + idx * 0.008);
          gain.gain.setValueAtTime(0.03 / (idx + 1), now + idx * 0.008);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.008 + 0.04);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.008);
          osc.stop(now + idx * 0.008 + 0.05);
        });
      } else if (season === "autumn") {
        // Rustling Dry Leaves: noise burst bandpass sweep
        const bufferSize = ctx.sampleRate * 0.25;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(2200, now);
        filter.frequency.exponentialRampToValueAtTime(1400, now + 0.22);
        filter.Q.setValueAtTime(2.0, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.23);
      } else if (season === "rainy") {
        // Liquid splash drop sounds
        this.playWater();
      } else if (season === "mystic") {
        // Celestial Space Sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(baseFreq * 1.5, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 4.0, now + 0.85);

        // Gentle cosmic vibrato
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 6;
        lfoGain.gain.value = 25;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

        osc.connect(gain);
        gain.connect(ctx.destination);
        
        lfo.start(now);
        osc.start(now);
        
        lfo.stop(now + 0.9);
        osc.stop(now + 0.9);
      } else {
        // Sunny: Gorgeous vibrant glassy chime
        this.playChime(1.0 + fidx * 0.12);
      }
    } catch (e) {
      console.warn("Audio play failed:", e);
    }
  },

  // Fluted flourishing arpeggio for planting a note (grows new flowers!)
  playPlant() {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const pitches = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      
      pitches.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch (e) {
      console.warn("Audio play failed:", e);
    }
  },

  // Liquid sparkling drop sweep for watering a soil bed
  playWater() {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const drops = [0, 0.08];
      drops.forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(650, now + delay);
        osc.frequency.exponentialRampToValueAtTime(1600, now + delay + 0.12);
        
        gain.gain.setValueAtTime(0.04, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.12);
      });
    } catch (e) {
      console.warn("Audio play failed:", e);
    }
  },

  // ==========================================
  // AMBIENT SOUND MIXER STATE & CONTYNUERS
  // ==========================================
  startMixer() {
    const ctx = getAudioContext();
    if (!ctx || isMixerRunning) return;
    try {
      isMixerRunning = true;
      const now = ctx.currentTime;

      // 1. Campfire Wood & Deep Fireplace Wind Rumble
      const windSource = ctx.createBufferSource();
      windSource.buffer = createNoiseBuffer(ctx, 3.0);
      windSource.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = "lowpass";
      windFilter.frequency.setValueAtTime(220, now);

      mixedNodes.windGain = ctx.createGain();
      mixedNodes.windGain.gain.setValueAtTime((volumes.campfire / 100) * 0.15, now);

      windSource.connect(windFilter);
      windFilter.connect(mixedNodes.windGain);
      mixedNodes.windGain.connect(ctx.destination);
      windSource.start(now);
      mixedNodes.windSource = windSource;

      // Campfire snaps scheduler: we'll simulate snaps right inside a silent setInterval loop or procedurally
      // to avoid heavy background scheduling, which keeps the app incredibly robust and clean.

      // 2. Rain Leaves (Patting/Mist)
      const rainSource = ctx.createBufferSource();
      rainSource.buffer = createRainPatterBuffer(ctx);
      rainSource.loop = true;

      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = "bandpass";
      rainFilter.frequency.setValueAtTime(2400, now);
      rainFilter.Q.setValueAtTime(1.5, now);

      mixedNodes.rainGain = ctx.createGain();
      mixedNodes.rainGain.gain.setValueAtTime((volumes.rain / 100) * 0.12, now);

      rainSource.connect(rainFilter);
      rainFilter.connect(mixedNodes.rainGain);
      mixedNodes.rainGain.connect(ctx.destination);
      rainSource.start(now);
      mixedNodes.rainSource = rainSource;

      // 3. Summer Night Insects
      const insectsSource = ctx.createOscillator();
      insectsSource.type = "sine";
      insectsSource.frequency.setValueAtTime(5200, now);

      // Amplitude Modulation LFO for crickets chirping
      const insectLFO = ctx.createOscillator();
      insectLFO.frequency.setValueAtTime(10, now); // 10Hz chirp rate

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.6, now); // scale chirp amplitude depth

      const insectModGain = ctx.createGain();
      insectModGain.gain.setValueAtTime(0.3, now);

      // Connect LFO Mod
      insectLFO.connect(lfoGain);
      lfoGain.connect(insectModGain.gain);
      
      mixedNodes.insectsGain = ctx.createGain();
      mixedNodes.insectsGain.gain.setValueAtTime((volumes.insects / 100) * 0.08, now);

      insectsSource.connect(insectModGain);
      insectModGain.connect(mixedNodes.insectsGain);
      mixedNodes.insectsGain.connect(ctx.destination);

      insectLFO.start(now);
      insectsSource.start(now);
      mixedNodes.insectsSource = insectsSource;

      // 4. Peaceful Cosmic Celestial Pad (Harmonic Drone Tuned to F-Major Pentatonic)
      const chord = [174.61, 261.63, 349.23, 392.00, 440.00, 523.25]; // F3, C4, F4, G4, A4, C5
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = (idx % 2 === 0) ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, now);

        // slow panning or LFO frequency modulation
        const oscLfo = ctx.createOscillator();
        oscLfo.frequency.value = 0.15 + idx * 0.04;
        const oscLfoGain = ctx.createGain();
        oscLfoGain.gain.value = 1.8;
        oscLfo.connect(oscLfoGain);
        oscLfoGain.connect(osc.frequency);

        const individualGain = ctx.createGain();
        // Slow soft volume swell
        individualGain.gain.setValueAtTime(0.01 + Math.random() * 0.03, now);

        const masterNodeGain = ctx.createGain();
        masterNodeGain.gain.setValueAtTime((volumes.pad / 100) * 0.08, now);

        osc.connect(individualGain);
        individualGain.connect(masterNodeGain);
        masterNodeGain.connect(ctx.destination);

        oscLfo.start(now);
        osc.start(now);

        mixedNodes.padOscs.push(osc);
        mixedNodes.padOscs.push(oscLfo); // store to stop later
        mixedNodes.padGains.push(masterNodeGain);
      });

    } catch (e) {
      console.warn("Background audio engine start fail:", e);
    }
  },

  updateVolume(type: "campfire" | "rain" | "insects" | "pad", percent: number) {
    volumes[type] = percent;
    const ctx = getAudioContext();
    if (!ctx || !isMixerRunning) return;
    
    const now = ctx.currentTime;
    const vol = percent / 100;

    if (type === "campfire" && mixedNodes.windGain) {
      mixedNodes.windGain.gain.linearRampToValueAtTime(vol * 0.15, now + 0.1);
    }
    if (type === "rain" && mixedNodes.rainGain) {
      mixedNodes.rainGain.gain.linearRampToValueAtTime(vol * 0.12, now + 0.1);
    }
    if (type === "insects" && mixedNodes.insectsGain) {
      mixedNodes.insectsGain.gain.linearRampToValueAtTime(vol * 0.08, now + 0.1);
    }
    if (type === "pad" && mixedNodes.padGains.length > 0) {
      mixedNodes.padGains.forEach((g) => {
        g.gain.linearRampToValueAtTime(vol * 0.08, now + 0.15);
      });
    }
  },

  getVolumes() {
    return { ...volumes };
  },

  stopMixer() {
    isMixerRunning = false;
    try {
      if (mixedNodes.windSource) {
        mixedNodes.windSource.disconnect();
        mixedNodes.windSource = null;
      }
      if (mixedNodes.rainSource) {
        mixedNodes.rainSource.disconnect();
        mixedNodes.rainSource = null;
      }
      if (mixedNodes.insectsSource) {
        mixedNodes.insectsSource.disconnect();
        mixedNodes.insectsSource = null;
      }
      mixedNodes.padOscs.forEach(o => {
        try { o.stop(); } catch(e){}
        try { o.disconnect(); } catch(e){}
      });
      mixedNodes.padOscs = [];
      mixedNodes.padGains.forEach(g => {
        try { g.disconnect(); } catch(e){}
      });
      mixedNodes.padGains = [];
    } catch (e) {
      console.warn("Error stopping background audio loops:", e);
    }
  }
};


