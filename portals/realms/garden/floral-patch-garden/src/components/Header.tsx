import React from "react";
import { AudioEngine } from "./AudioEngine";
import { SoundMixer } from "./SoundMixer";
import { Sparkles, Volume2, VolumeX, Leaf, Sun, CloudRain, Snowflake, Compass, Home } from "lucide-react";

interface HeaderProps {
  currentTheme: "greenhouse" | "twilight" | "sunset" | "meadow";
  onThemeChange: (theme: "greenhouse" | "twilight" | "sunset" | "meadow") => void;
  isMuted: boolean;
  onToggleMute: () => void;
  totalWriting: number;
  totalClusters: number;
  weather: "sunny" | "rainy" | "autumn" | "snowy" | "mystic";
  onToggleWeather: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMuted,
  onToggleMute,
  totalWriting,
  totalClusters,
  weather,
  onToggleWeather,
}) => {
  return (
    <header className="relative z-50 w-full rounded-3xl border border-[#142d22]/80 bg-[#0c1411]/80 backdrop-blur-md p-6 md:p-8 shadow-2xl animate-fade-in">
      {/* Bioluminescent micro floating auras in corners (clipped safely inside backdrop overlay) */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none z-0">
        <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-[#10b981]/15 blur-2xl animate-pulse animate-duration-3000"></div>
        <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl animate-pulse animate-duration-4000"></div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div>
          {/* Logo brand and flower emblem */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#10b981] rounded-xl text-[#030605] shadow-lg shadow-emerald-500/20 animate-[pulse_3s_infinite] flex items-center justify-center">
              <Leaf className="w-6 h-6 text-[#030605]" />
            </div>
            <span className="font-accent font-black tracking-[0.25em] text-emerald-450 text-xs md:text-sm uppercase">
              Garden of Ludwigia
            </span>
          </div>

          <h1 className="font-accent font-black text-4xl md:text-5xl lg:text-6xl text-white tracking-tight mt-5 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            Garden of Ludwigia
          </h1>

          <p className="font-sans text-emerald-100/90 text-[15px] md:text-lg mt-5 max-w-3xl leading-relaxed">
            Welcome to my interactive knowledge ecology. Each of my research tags is cultivated into a lush, organic <strong className="text-emerald-400 font-accent font-bold">Cluster</strong>. Individual notes bloom into distinct, dynamic <strong className="text-amber-400 font-accent font-bold">Flora Blooms</strong> possessing their own botanical symmetries and symbolic language.
          </p>

          {/* Quick stats badges - enlarged */}
          <div className="flex flex-wrap items-center gap-4 mt-7">
            <span className="inline-flex items-center gap-2.5 px-5.5 py-3 rounded-full text-xs md:text-sm font-accent font-black tracking-wider uppercase bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 shadow-md">
              <Leaf className="w-5 h-5 text-emerald-400 animate-sway" />
              <strong className="text-sm md:text-base">{totalClusters}</strong> tag clusters
            </span>
            <span className="inline-flex items-center gap-2.5 px-5.5 py-3 rounded-full text-xs md:text-sm font-accent font-black tracking-wider uppercase bg-amber-950/60 border border-amber-500/30 text-amber-300 shadow-md">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <strong className="text-sm md:text-base">{totalWriting}</strong> thought blooms
            </span>
          </div>
        </div>

        {/* Global Toolbar Zone */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <a
            href="../index.html"
            className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl border font-accent font-black text-sm tracking-widest uppercase transition-all cursor-pointer shadow-md bg-[#070e0a]/80 text-emerald-300 hover:bg-[#10b981] hover:text-[#030605] border-[#142d22]"
            title="Back to main site"
          >
            <Home className="w-4.5 h-4.5" />
            <span>Home</span>
          </a>
          {/* White Noise Sliders Engine */}
          <SoundMixer />

          {/* Active Status Display Indicator */}
          <div className={`hidden lg:flex items-center gap-3 px-4.5 py-3 rounded-xl bg-[#070e0a]/80 border text-xs font-accent font-bold uppercase tracking-widest transition-colors duration-500 ${
            weather === "sunny" ? "border-[#142d22] text-emerald-450" : 
            weather === "rainy" ? "border-sky-950/80 text-sky-400" : 
            weather === "autumn" ? "border-amber-950/60 text-amber-500" : 
            weather === "snowy" ? "border-violet-950/80 text-violet-400" : 
            "border-fuchsia-950/80 text-fuchsia-400"
          }`}>
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                weather === "sunny" ? "bg-emerald-400" : 
                weather === "rainy" ? "bg-sky-400" : 
                weather === "autumn" ? "bg-amber-400" : 
                weather === "snowy" ? "bg-violet-400" : 
                "bg-fuchsia-400"
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                weather === "sunny" ? "bg-emerald-500" : 
                weather === "rainy" ? "bg-sky-500" : 
                weather === "autumn" ? "bg-amber-500" : 
                weather === "snowy" ? "bg-violet-500" : 
                "bg-fuchsia-500"
              }`}></span>
            </span>
            <span>{
              weather === "sunny" ? "Bioluminescent Grid Active" : 
              weather === "rainy" ? "Hydration Mist Active" : 
              weather === "autumn" ? "Autumn Maple Harvest Active" : 
              weather === "snowy" ? "Glacial Cryo Active" : 
              "Mystic Resonance Active"
            }</span>
          </div>

          {/* Dynamic Weather Toggle */}
          <button
            onClick={() => {
              onToggleWeather();
              AudioEngine.playChime(
                weather === "sunny" ? 0.95 : 
                weather === "rainy" ? 1.15 : 
                weather === "autumn" ? 1.05 : 
                weather === "snowy" ? 1.35 : 
                0.8
              );
            }}
            className={`flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl border font-accent font-black text-sm tracking-widest uppercase transition-all cursor-pointer shadow-md duration-300 ${
              weather === "sunny" ? "bg-amber-950/25 text-amber-300 hover:bg-amber-500 hover:text-[#0b1110] border-amber-500/20 hover:border-amber-500" :
              weather === "rainy" ? "bg-sky-950/25 text-sky-300 hover:bg-sky-500 hover:text-[#050b10] border-sky-500/20 hover:border-sky-500" :
              weather === "autumn" ? "bg-orange-950/25 text-orange-400 hover:bg-orange-500 hover:text-[#0b1110] border-amber-500/20 hover:border-orange-500" :
              weather === "snowy" ? "bg-violet-950/25 text-violet-300 hover:bg-violet-500 hover:text-[#0a0510] border-violet-500/20 hover:border-violet-500" :
              "bg-fuchsia-950/25 text-fuchsia-300 hover:bg-fuchsia-500 hover:text-[#100510] border-fuchsia-500/20 hover:border-fuchsia-500"
            }`}
            title={`Current: ${weather}. Click to cycle weather.`}
            id="weather-toggle-button"
          >
            {weather === "sunny" ? (
              <Sun className="w-4.5 h-4.5 text-amber-400 animate-[spin_16s_linear_infinite]" />
            ) : weather === "rainy" ? (
              <CloudRain className="w-4.5 h-4.5 text-sky-400 animate-bounce" />
            ) : weather === "autumn" ? (
              <Leaf className="w-4.5 h-4.5 text-amber-500 animate-sway" />
            ) : weather === "snowy" ? (
              <Snowflake className="w-4.5 h-4.5 text-violet-400 animate-pulse" />
            ) : (
              <Compass className="w-4.5 h-4.5 text-fuchsia-400 animate-spin" />
            )}
            <span>{weather}</span>
          </button>

          {/* Clean Mute Toggle */}
          <button
            onClick={() => {
              onToggleMute();
              if (isMuted) {
                setTimeout(() => AudioEngine.playChime(1.15), 100);
              }
            }}
            className={`flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl border font-accent font-black text-sm tracking-widest uppercase transition-all cursor-pointer shadow-md ${
              isMuted
                ? "bg-[#060b09] text-emerald-800 hover:text-emerald-500 border-[#142d22]"
                : "bg-emerald-950/20 text-[#10b981] hover:bg-emerald-500 hover:text-[#0b1310] border-emerald-500/20 hover:border-emerald-500 shadow-emerald-500/5"
            }`}
            title={isMuted ? "Audio Off" : "Audio On"}
            id="audio-mute-button"
          >
            {isMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5 text-emerald-450 animate-pulse" />}
            <span>Ambiance</span>
          </button>
        </div>
      </div>
    </header>
  );
};
