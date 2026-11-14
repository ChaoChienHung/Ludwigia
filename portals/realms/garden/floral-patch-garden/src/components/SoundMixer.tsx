import React, { useState, useEffect } from "react";
import { AudioEngine } from "./AudioEngine";
import { 
  Volume2, 
  VolumeX, 
  Flame, 
  CloudRain, 
  Sparkles, 
  Leaf, 
  Music,
  Sliders
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const SoundMixer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volumes, setVolumes] = useState<{
    campfire: number;
    rain: number;
    insects: number;
    pad: number;
  }>({
    campfire: 0,
    rain: 0,
    insects: 0,
    pad: 0
  });

  // Load current volumes on mount
  useEffect(() => {
    setIsMuted(AudioEngine.getMuted());
    const current = AudioEngine.getVolumes();
    setVolumes(current);
  }, []);

  const handleMuteToggle = () => {
    const muted = AudioEngine.toggleMute();
    setIsMuted(muted);
    // If we just unmuted, make sure the mixer nodes are active
    if (!muted) {
      AudioEngine.startMixer();
      // Restore levels
      Object.entries(volumes).forEach(([key, val]) => {
        AudioEngine.updateVolume(key as any, val as number);
      });
    }
  };

  const handleVolumeChange = (type: "campfire" | "rain" | "insects" | "pad", value: number) => {
    // If currently muted, unmute first so user immediately hears feedback
    if (isMuted) {
      AudioEngine.toggleMute();
      setIsMuted(false);
    }
    
    // Explicitly start audio mixer loops on user first action
    AudioEngine.startMixer();

    setVolumes(prev => ({ ...prev, [type]: value }));
    AudioEngine.updateVolume(type, value);
  };

  const isAnyActive = Object.values(volumes).some(v => (v as number) > 0) && !isMuted;


  return (
    <div className="relative z-30">
      {/* Floating Toggle Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          AudioEngine.playChime(isOpen ? 0.9 : 1.15);
        }}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-accent font-black text-3xs md:text-2xs tracking-widest uppercase transition-all duration-300 shadow-md cursor-pointer ${
          isOpen
            ? "bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            : isAnyActive
            ? "bg-[#180f08] border-amber-500/50 text-amber-400 hover:bg-[#321c0e] animate-pulse"
            : "bg-[#060c09] border-emerald-500/20 hover:border-amber-500/40 text-emerald-500 hover:text-amber-400 hover:bg-amber-950/15"
        }`}
        title="Open forest white noise sound mixer"
      >
        <Sliders className={`w-3.5 h-3.5 ${isAnyActive ? "animate-spin" : ""}`} style={{ animationDuration: "12s" }} />
        <span>Botanical Mixer</span>
        {isAnyActive && (
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
          </span>
        )}
      </button>

      {/* Expanded Mixer Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 z-50 rounded-2xl bg-gradient-to-b from-[#1c1109] via-[#100a05] to-[#0a0603] border-2 border-amber-950 p-5 shadow-2xl space-y-5"
          >
            {/* Wooden Header Plate */}
            <div className="flex items-center justify-between border-b border-amber-950/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-950/40 rounded-lg border border-amber-900/30 text-amber-500">
                  <Music className="w-4 h-4 animate-sway" />
                </div>
                <div>
                  <h4 className="font-accent font-black text-2xs md:text-xs text-amber-300 tracking-wider uppercase">
                    Flora Sound Mixer
                  </h4>
                  <p className="text-[9px] text-amber-600 font-mono leading-none">Acoustics Synth Engine</p>
                </div>
              </div>

              {/* Master Mute Speaker button */}
              <button
                onClick={handleMuteToggle}
                className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                  isMuted 
                    ? "bg-red-950/35 border-red-800 text-red-400" 
                    : "bg-amber-950/20 border-amber-900/40 text-amber-400 hover:bg-amber-500 hover:text-stone-950"
                }`}
                title={isMuted ? "Unmute sounds" : "Mute sounds"}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Sliders Zone */}
            <div className="space-y-4">
              {/* 1. Campfire Wind */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-accent font-bold uppercase tracking-wider text-amber-200">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                    篝火微風 Campfire
                  </span>
                  <span className="font-mono text-amber-600 text-[10px]">{volumes.campfire}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumes.campfire}
                  onChange={(e) => handleVolumeChange("campfire", parseInt(e.target.value))}
                  className="w-full accent-orange-500 h-1 bg-stone-900 rounded-lg appearance-none cursor-pointer border border-[#211208]"
                />
              </div>

              {/* 2. Rain Leaves */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-accent font-bold uppercase tracking-wider text-sky-200">
                  <span className="flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-sky-450 animate-bounce" />
                    細雨拍葉 Rain Drop
                  </span>
                  <span className="font-mono text-sky-650 text-[10px]">{volumes.rain}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumes.rain}
                  onChange={(e) => handleVolumeChange("rain", parseInt(e.target.value))}
                  className="w-full accent-sky-400 h-1 bg-stone-900 rounded-lg appearance-none cursor-pointer border border-[#101b2b]"
                />
              </div>

              {/* 3. Summer Insects */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-accent font-bold uppercase tracking-wider text-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-emerald-500 animate-sway" />
                    夏夜靈蟲 Insects
                  </span>
                  <span className="font-mono text-emerald-600 text-[10px]">{volumes.insects}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumes.insects}
                  onChange={(e) => handleVolumeChange("insects", parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-stone-900 rounded-lg appearance-none cursor-pointer border border-[#0d2112]"
                />
              </div>

              {/* 4. Cosmic space resonance */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-accent font-bold uppercase tracking-wider text-fuchsia-200">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-fuchsia-400 animate-spin" style={{ animationDuration: "8s" }} />
                    星空仙境 Celestial
                  </span>
                  <span className="font-mono text-fuchsia-600 text-[10px]">{volumes.pad}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumes.pad}
                  onChange={(e) => handleVolumeChange("pad", parseInt(e.target.value))}
                  className="w-full accent-fuchsia-500 h-1 bg-stone-900 rounded-lg appearance-none cursor-pointer border border-[#2a0e38]"
                />
              </div>
            </div>

            {/* Simulated Live Audio Spectrum Grid */}
            <div className="h-6 flex items-end justify-between px-2 pt-1 border-t border-amber-950/40">
              {Array.from({ length: 18 }).map((_, i) => {
                const isActive = isAnyActive;
                const delay = `${i * 0.08}s`;
                return (
                  <div
                    key={i}
                    className={`w-[3px] bg-amber-500/75 rounded-t-sm transition-all duration-300 ${
                      isActive ? "animate-aurora-bar" : "h-1 bg-amber-950/20"
                    }`}
                    style={{
                      height: isActive ? `${Math.floor(Math.random() * 18) + 3}px` : "3px",
                      animationDelay: delay
                    }}
                  />
                );
              })}
            </div>

            <p className="text-[9px] text-[#855132] font-sans text-center leading-relaxed">
              Synthesized procedurally using browser Web Audio Nodes.<br/>
              Zero static assets: light, fast & green!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
