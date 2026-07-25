import React, { useState, useMemo, useEffect } from "react";
import { Writing, FLOWER_PROFILES } from "../types";
import { 
  Search, 
  Sparkles, 
  Leaf, 
  ArrowRight, 
  Droplet, 
  Compass, 
  CloudRain, 
  Tag
} from "lucide-react";
import { AudioEngine } from "./AudioEngine";
import { FlowerRenderer } from "./FlowerRenderer";
import { motion, AnimatePresence } from "motion/react";

interface GardenLandingProps {
  writing: Writing[];
  onSelectCluster: (tag: string, articleIdToExpand?: string) => void;
}

const formatTag = (value: string) => {
  const v = String(value || "").trim();
  if (!v) return "";
  return v
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
};


interface PlotTheme {
  signBg: string;
  signBorder: string;
  woodColor: string;
  shadowColor: string;
  soilGradient: string;
  ambientGlow: string;
  textTone: string;
  pebbleStyle: string;
}

// Custom specialized colors and shaders for each plot to represent unique microclimates
const getPlotTheme = (tagName: string, idx: number): PlotTheme => {
  const norm = tagName.trim().toLowerCase();
  
  if (norm.includes("intelligence") || norm.includes("science") || norm.includes("data")) {
    return {
      signBg: "bg-gradient-to-r from-emerald-900/95 to-teal-950/95",
      signBorder: "border-emerald-400/50",
      woodColor: "from-emerald-600 via-emerald-700 to-emerald-800 border-emerald-400/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)]",
      shadowColor: "shadow-emerald-500/10",
      soilGradient: "from-[#021c13] via-[#043322]/80 to-[#010806]/35",
      ambientGlow: "rgba(16, 185, 129, 0.15)",
      textTone: "text-emerald-400",
      pebbleStyle: "bg-emerald-950/40 hover:bg-[#10b981] border-emerald-800 text-emerald-300 hover:text-[#0b1310]"
    };
  }
  
  if (norm.includes("dev") || norm.includes("frontend") || norm.includes("tech") || norm.includes("web")) {
    return {
      signBg: "bg-gradient-to-r from-sky-900/95 to-slate-950/95",
      signBorder: "border-sky-400/50",
      woodColor: "from-sky-500 via-sky-600 to-sky-700 border-sky-400/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)]",
      shadowColor: "shadow-sky-500/10",
      soilGradient: "from-[#021324] via-[#042442]/80 to-[#01060e]/35",
      ambientGlow: "rgba(14, 165, 233, 0.15)",
      textTone: "text-sky-450",
      pebbleStyle: "bg-sky-950/40 hover:bg-sky-500 border-sky-800 text-sky-300 hover:text-[#050a10]"
    };
  }

  if (norm.includes("philosophy") || norm.includes("thought") || norm.includes("mind") || norm.includes("theory")) {
    return {
      signBg: "bg-gradient-to-r from-purple-900/95 to-violet-950/95",
      signBorder: "border-purple-400/50",
      woodColor: "from-purple-500 via-purple-600 to-purple-700 border-purple-400/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)]",
      shadowColor: "shadow-purple-500/10",
      soilGradient: "from-[#0d041c] via-[#1b0938]/80 to-[#04010a]/35",
      ambientGlow: "rgba(139, 92, 246, 0.15)",
      textTone: "text-purple-400",
      pebbleStyle: "bg-purple-950/40 hover:bg-purple-500 border-purple-800 text-purple-300 hover:text-[#040208]"
    };
  }

  if (norm.includes("lifestyle") || norm.includes("craft") || norm.includes("hand") || norm.includes("culture")) {
    return {
      signBg: "bg-gradient-to-r from-amber-900/95 to-orange-950/95",
      signBorder: "border-amber-400/50",
      woodColor: "from-amber-600 via-amber-500 to-amber-700 border-amber-400/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)]",
      shadowColor: "shadow-amber-500/10",
      soilGradient: "from-[#1d0c02] via-[#3d1902]/80 to-[#080200]/35",
      ambientGlow: "rgba(245, 158, 11, 0.15)",
      textTone: "text-amber-400",
      pebbleStyle: "bg-amber-950/40 hover:bg-amber-500 border-amber-800 text-amber-300 hover:text-[#0a0400]"
    };
  }

  if (norm.includes("design") || norm.includes("art") || norm.includes("visual") || norm.includes("layout")) {
    return {
      signBg: "bg-gradient-to-r from-rose-900/95 to-pink-950/95",
      signBorder: "border-rose-400/50",
      woodColor: "from-rose-500 via-rose-600 to-rose-700 border-rose-400/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)]",
      shadowColor: "shadow-rose-500/10",
      soilGradient: "from-[#1c040d] via-[#38091a]/80 to-[#070104]/35",
      ambientGlow: "rgba(244, 63, 94, 0.15)",
      textTone: "text-rose-400",
      pebbleStyle: "bg-rose-950/40 hover:bg-rose-500 border-rose-800 text-rose-300 hover:text-[#0a0004]"
    };
  }

  // Cozy wildwood standard values with cheerful redwood/amber finishes
  const defaultWoods = [
    "from-[#a2441f] via-[#c25123] to-[#7f3012] border-amber-500/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]", // beautiful polished Redwood
    "from-[#d97706] via-[#b45309] to-[#78350f] border-amber-500/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]", // rustic Honey Amber
    "from-stone-500 via-stone-600 to-stone-700 border-stone-400/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]" // weather-worn Birch
  ];
  const woodSel = defaultWoods[idx % defaultWoods.length];
  return {
    signBg: "bg-gradient-to-r from-stone-900/95 to-neutral-950/95",
    signBorder: "border-stone-550/50",
    woodColor: woodSel,
    shadowColor: "shadow-[#10b981]/5",
    soilGradient: "from-[#020b08] via-[#051c14]/80 to-[#010403]/35",
    ambientGlow: "rgba(16, 185, 129, 0.12)",
    textTone: "text-emerald-450",
    pebbleStyle: "bg-stone-900/40 hover:bg-[#10b981] border-stone-800 text-emerald-300 hover:text-[#050b08]"
  };
};

export const GardenLanding: React.FC<GardenLandingProps> = ({ writing, onSelectCluster }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const [filterMode, setFilterMode] = useState<"popular" | "recent">("popular");
  const [isRaining, setIsRaining] = useState(false);
  const [waterAnimationTarget, setWaterAnimationTarget] = useState<string | null>(null);

  // Group notes into tag clusters
  const groupedClusters = useMemo(() => {
    const map: Record<string, { writing: Writing[]; lastUpdated: number }> = {};

    writing.forEach((art) => {
      art.tags.forEach((tag) => {
        const trimmedTag = tag.trim();
        if (!trimmedTag) return;
        
        if (!map[trimmedTag]) {
          map[trimmedTag] = { writing: [], lastUpdated: 0 };
        }
        map[trimmedTag].writing.push(art);

        const artTime = new Date(art.date).getTime();
        if (artTime > map[trimmedTag].lastUpdated) {
          map[trimmedTag].lastUpdated = artTime;
        }
      });
    });

    return Object.entries(map).map(([tagName, info]) => ({
      tagName,
      writing: info.writing,
      lastUpdated: info.lastUpdated,
      flowerCount: info.writing.length,
    }));
  }, [writing]);

  // Load and manage Soil Hydration state
  const [hydrationMap, setHydrationMap] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem("lug_flora_hydration");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {};
  });

  // Seeds initial cluster hydration map
  useEffect(() => {
    let changed = false;
    const nextMap = { ...hydrationMap };
    groupedClusters.forEach((c) => {
      if (nextMap[c.tagName] === undefined) {
        nextMap[c.tagName] = Math.floor(Math.random() * 25) + 65; // initial water level
        changed = true;
      }
    });
    if (changed) {
      setHydrationMap(nextMap);
      localStorage.setItem("lug_flora_hydration", JSON.stringify(nextMap));
    }
  }, [groupedClusters]);

  // Evaporation tick
  useEffect(() => {
    const interval = setInterval(() => {
      setHydrationMap((prev) => {
        const next = { ...prev };
        let updated = false;
        Object.keys(next).forEach((key) => {
          if (Math.random() < 0.25 && next[key] > 20) {
            next[key] = Math.max(15, next[key] - 1);
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem("lug_flora_hydration", JSON.stringify(next));
        }
        return next;
      });
    }, 14000);
    return () => clearInterval(interval);
  }, []);

  const handleWaterSingle = (tagName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    AudioEngine.playWater();

    setWaterAnimationTarget(tagName);
    setTimeout(() => setWaterAnimationTarget(null), 850);

    setHydrationMap((prev) => {
      const next = { ...prev, [tagName]: 100 };
      localStorage.setItem("lug_flora_hydration", JSON.stringify(next));
      return next;
    });
  };

  const handleGlobalWaterShower = () => {
    AudioEngine.playWater();
    setTimeout(() => AudioEngine.playChime(1.15), 300);
    setIsRaining(true);

    const next = { ...hydrationMap };
    Object.keys(next).forEach((key) => {
      next[key] = 100;
    });

    setHydrationMap(next);
    localStorage.setItem("lug_flora_hydration", JSON.stringify(next));

    setTimeout(() => {
      setIsRaining(false);
    }, 3200);
  };

  // Filtered clusters by search query
  const filteredClusters = useMemo(() => {
    let result = groupedClusters.filter((c) => {
      const tagMatches = c.tagName.toLowerCase().includes(searchQuery.toLowerCase());
      const articleMatches = c.writing.some(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.summary.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return tagMatches || articleMatches;
    });

    if (filterMode === "popular") {
      result.sort((a, b) => b.flowerCount - a.flowerCount || a.tagName.localeCompare(b.tagName));
    } else {
      result.sort((a, b) => b.lastUpdated - a.lastUpdated || a.tagName.localeCompare(b.tagName));
    }

    return result;
  }, [groupedClusters, searchQuery, filterMode]);

  // Coordinates placements of growing flowers inside the plot
  const flowerPlacements = [
    { left: "15%", bottom: "32%", scale: 0.95 },
    { left: "48%", bottom: "56%", scale: 1.15 },
    { left: "78%", bottom: "25%", scale: 0.9 },
    { left: "30%", bottom: "20%", scale: 1.05 },
    { left: "64%", bottom: "42%", scale: 1.08 },
    { left: "84%", bottom: "50%", scale: 0.98 },
  ];

  return (
    <div className="space-y-8 relative pb-20">
      {/* Dynamic Rain Overlay */}
      {isRaining && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden bg-emerald-950/15 backdrop-blur-[0.5px]">
          {Array.from({ length: 48 }).map((_, i) => {
            const x = Math.random() * 100;
            const delay = Math.random() * 2.5;
            const duration = Math.random() * 1.1 + 0.7;
            const height = Math.random() * 35 + 20;
            return (
              <div
                key={i}
                className="absolute bg-gradient-to-b from-sky-400/90 via-emerald-400/50 to-transparent w-[1px]"
                style={{
                  left: `${x}%`,
                  top: `-${height}px`,
                  height: `${height}px`,
                  animation: `fall ${duration}s linear infinite`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Magical Control Shelf */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-5 rounded-3xl bg-[#060c09]/95 border border-[#122e20]/80 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute -left-12 -top-12 w-28 h-28 rounded-full bg-emerald-500/5 filter blur-xl pointer-events-none"></div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-emerald-500/60" />
          <input
            type="text"
            className="w-full bg-[#030605]/85 text-emerald-100 pl-11 pr-4 py-3 rounded-xl border border-[#143126]/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/25 focus:border-[#10b981] transition-all placeholder-emerald-900"
            placeholder="Whisper search tags to locate fenced garden plots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter controls / Global Mist sprinkler */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-[#030605] p-1 rounded-xl border border-[#123122]/60">
            <span className="p-1 px-2.5 text-[10px] text-emerald-600/80 font-accent font-black uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              Cultivate:
            </span>
            <button
              onClick={() => {
                setFilterMode("popular");
                AudioEngine.playChime(1.0);
              }}
              className={`px-3 py-1 text-3xs font-accent font-black tracking-widest uppercase transition-all duration-200 rounded-lg cursor-pointer ${
                filterMode === "popular"
                  ? "bg-[#10b981] text-[#030605]"
                  : "text-emerald-500 hover:text-emerald-250 cursor-pointer"
              }`}
            >
              Lushness
            </button>
            <button
              onClick={() => {
                setFilterMode("recent");
                AudioEngine.playChime(1.08);
              }}
              className={`px-3 py-1 text-3xs font-accent font-black tracking-widest uppercase transition-all duration-200 rounded-lg cursor-pointer ${
                filterMode === "recent"
                  ? "bg-[#10b981] text-[#030605]"
                  : "text-emerald-500 hover:text-emerald-250 cursor-pointer"
              }`}
            >
              Recency
            </button>
          </div>

          <div className="h-4.5 w-[1px] bg-[#142d22]/80"></div>

          {/* Showers */}
          <button
            onClick={handleGlobalWaterShower}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-3xs font-accent font-black tracking-widest uppercase transition-all border cursor-pointer ${
              isRaining
                ? "bg-sky-500 text-[#030605] border-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.4)] animate-pulse"
                : "bg-[#091511] border-emerald-500/20 hover:border-sky-500 text-sky-400 hover:bg-sky-500/10"
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 animate-bounce" />
            <span>Mist Shower</span>
          </button>



        </div>
      </div>

      {filteredClusters.length > 0 ? (
        /* THE COZY HOMESTEAD FIELD: A grid of completely containerless fenced garden patches with winding paths */
        <div 
          id="homestead-field" 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-24 gap-x-12 pt-12 cursor-default relative"
        >
          {filteredClusters.map((cluster, idx) => {
            const moisture = hydrationMap[cluster.tagName] ?? 75;
            const theme = getPlotTheme(cluster.tagName, idx);
            const isHighlyMoist = moisture >= 80;
            const isThirsting = moisture < 50;
            const isSprayed = waterAnimationTarget === cluster.tagName;

            return (
              <div
                key={cluster.tagName}
                className="relative group/plot flex flex-col items-center justify-between min-h-[460px] p-2 transition-transform duration-300 hover:-translate-y-1"
              >
                {/* Sprayed interactive splash ring */}
                {isSprayed && (
                  <div className="absolute inset-0 bg-sky-500/5 border-2 border-sky-400/30 rounded-[3rem] animate-ping pointer-events-none z-40"></div>
                )}

                {/* Ambient bio-glow behind this specific un-carded plot */}
                <div 
                  className="absolute inset-2 -z-10 rounded-[3rem] pointer-events-none blur-3xl transition-opacity duration-500" 
                  style={{
                    backgroundColor: theme.ambientGlow,
                    opacity: isHighlyMoist ? 1 : 0.4
                  }}
                ></div>

                {/* ================= SECTION A: DETACHED FREESTANDING SIGNPOSTS ================= */}
                <div className="relative z-25 flex flex-col items-center mb-4 min-y-24 group-hover/plot:scale-103 transition-transform w-[90%]">
                  {/* Two Wooden Support Posts sinking into the soil below */}
                  <div className={`absolute left-1/4 top-8 w-1.5 h-20 bg-gradient-to-b ${theme.woodColor} border-r shadow-lg -z-10`}></div>
                  <div className={`absolute right-1/4 top-8 w-1.5 h-20 bg-gradient-to-b ${theme.woodColor} border-l shadow-lg -z-10`}></div>

                  {/* Freestanding Timber Sign Plate with clean wooden background */}
                  <div 
                    className={`relative px-5 py-4 rounded-2xl border-2 text-center shadow-xl ${theme.signBg} ${theme.signBorder} ${theme.shadowColor}`}
                  >
                    {/* Metal eyelets / chain rings hanging detail */}
                    <div className="absolute -top-1.5 left-1/4 w-3.5 h-1.5 bg-[#451a03] border border-[#030605] rounded-full"></div>
                    <div className="absolute -top-1.5 right-1/4 w-3.5 h-1.5 bg-[#451a03] border border-[#030605] rounded-full"></div>

                    <div className="flex flex-col items-center justify-center">
                      <h4 className="font-accent font-black text-xs md:text-sm tracking-widest text-[#ffffff] uppercase leading-tight group-hover/plot:text-[#10b981] transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                        {formatTag(cluster.tagName)}
                      </h4>

                      <div className="flex items-center justify-center gap-2 mt-2 border-t border-white/20 pt-1.5 w-full">
                        <span className="font-mono text-[9.5px] font-black uppercase text-amber-300 tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                          {cluster.flowerCount} Blooms
                        </span>
                        <span className="text-[10px] text-white/40">•</span>
                        <span className="font-sans text-[9px] font-bold text-emerald-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                          {moisture}% hydrated
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ================= SECTION B: THE FENCED LOAMY SOIL BED ================= */}
                {/* UPGRADED WITH REALISTIC 3D PERSPECTIVE TRANSFORM (A gorgeous isometric wooden box enclosing the loam) */}
                <div 
                  className="relative w-full h-44"
                  style={{
                    perspective: "1000px",
                    transformStyle: "preserve-3d"
                  }}
                >
                  <div 
                     className={`absolute inset-0 rounded-3xl bg-gradient-to-t border border-[#143122]/70 ${theme.soilGradient} shadow-2xl transition-all duration-300 select-none overflow-hidden`}
                    style={{
                      transform: "rotateX(15deg) rotateY(-8deg) rotateZ(1.5deg)",
                      transformStyle: "preserve-3d",
                      boxShadow: "0 18px 36px rgba(0,0,0,0.7), inset 0 2px 14px rgba(255,255,255,0.06)"
                    }}
                  >
                    {/* Faint ambient light spores */}
                    {isHighlyMoist && (
                      <div className="absolute inset-x-8 top-1 h-5 pointer-events-none z-10 flex justify-between opacity-75 select-none text-[8px] text-emerald-400">
                        <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>✦</span>
                        <span className="animate-bounce" style={{ animationDelay: "1s" }}>✦</span>
                      </div>
                    )}

                    {/* ====== BACK ROW FENCE POSTS (Widely spaced to prevent visual overlap with corners and sides) ====== */}
                    <div className="absolute top-0 inset-x-6 h-10 flex justify-between items-start pointer-events-none z-10 opacity-95">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-3.5 h-11 bg-gradient-to-b ${theme.woodColor} rounded-t-[10px] rounded-b-[2px] border-x border-b shadow-[1px_2px_4px_rgba(0,0,0,0.55)] relative transition-all`}
                        >
                          {/* Realistic golden wood grain streak */}
                          <div className="absolute inset-y-1 left-1 w-[1px] bg-white/20"></div>
                          <div className="absolute inset-y-1.5 right-1 w-[1.5px] bg-black/15"></div>
                        </div>
                      ))}
                      {/* Solid Thick Wooden Beam cross-bar - matching the theme post woodColor beautifully! */}
                      <div className={`absolute top-3 inset-x-0 h-2 bg-gradient-to-r ${theme.woodColor} border-y shadow-sm opacity-95`}></div>
                      <div className={`absolute top-7 inset-x-0 h-2 bg-gradient-to-r ${theme.woodColor} border-y shadow-sm opacity-95`}></div>
                    </div>

                    {/* ====== SIDE LEFT FENCE POSTS (Given great margin offsets top & bottom to never crash into other fences) ====== */}
                    <div className="absolute left-1 top-6 bottom-6 w-3 h-28 flex flex-col justify-between items-start pointer-events-none z-35 opacity-90">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-3 h-7 bg-gradient-to-r ${theme.woodColor} rounded-sm border-y border-r shadow-[1px_1px_3px_rgba(0,0,0,0.5)] relative`}
                        >
                          <div className="absolute top-0.5 inset-x-0.5 h-[1px] bg-white/20"></div>
                        </div>
                      ))}
                      <div className={`absolute left-1.5 top-1 bottom-1 w-[2.5px] bg-gradient-to-b ${theme.woodColor} border-r shadow-sm opacity-90`}></div>
                    </div>

                    {/* ====== SIDE RIGHT FENCE POSTS (Given great margin offsets top & bottom to never crash into other fences) ====== */}
                    <div className="absolute right-1 top-6 bottom-6 w-3 h-28 flex flex-col justify-between items-end pointer-events-none z-35 opacity-90">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-3 h-7 bg-gradient-to-l ${theme.woodColor} rounded-sm border-y border-l shadow-[-1px_1px_3px_rgba(0,0,0,0.5)] relative`}
                        >
                          <div className="absolute top-0.5 inset-x-0.5 h-[1px] bg-white/20"></div>
                        </div>
                      ))}
                      <div className={`absolute right-1.5 top-1 bottom-1 w-[2.5px] bg-gradient-to-b ${theme.woodColor} border-l shadow-sm opacity-90`}></div>
                    </div>

                    {/* Ground Base dirt layer */}
                    <div className="absolute inset-x-0 bottom-0 h-2.5 bg-gradient-to-t from-stone-950 to-stone-900 border-t border-[#122e20]/60 z-10"></div>

                    {/* Swaying weeds background foliage (MADE MUCH BRIGHTER & GLOWING FOR AMAZING VISIBILITY) */}
                    <div className="absolute bottom-1 left-6 w-12 h-14 text-emerald-300/65 drop-shadow-[0_0_10px_rgba(52,211,153,0.65)] pointer-events-none animate-sway">
                      <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
                        <path d="M10,95 Q15,40 5,5 Q30,45 40,95 Q48,55 58,15 L70,95 T100,95" />
                      </svg>
                    </div>
                    <div className="absolute bottom-1 right-8 w-16 h-12 text-teal-300/60 drop-shadow-[0_0_10px_rgba(45,212,191,0.6)] pointer-events-none animate-sway-delayed">
                      <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
                        <path d="M5,95 Q25,35 15,10 Q35,50 48,95 L72,12 Q80,60 95,95" />
                      </svg>
                    </div>

                    {/* ====== THE IMMERSIVE FLOWER ELEMENTS (Renders directly inside fences) ====== */}
                    {cluster.writing.map((art, fidx) => {
                      const flowerKey = art.flowerName || "Daisy";
                      const p = FLOWER_PROFILES[flowerKey] || FLOWER_PROFILES.Daisy;
                      
                      const coord = flowerPlacements[fidx % flowerPlacements.length];
                      const wateringMultiplier = isHighlyMoist ? 1.05 : isThirsting ? 0.88 : 1.0;
                      const finalScale = coord.scale * wateringMultiplier;
                      const swaySetting = fidx % 2 === 0 ? "animate-sway" : "animate-sway-delayed";

                      return (
                        <div
                          key={art.id}
                          className="absolute group/flower cursor-pointer"
                          style={{
                            left: coord.left,
                            bottom: coord.bottom,
                            transform: `scale(${finalScale})`,
                            zIndex: Math.floor(25 + fidx),
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            AudioEngine.playChime(1.0 + fidx * 0.15);
                            onSelectCluster(cluster.tagName, art.id);
                          }}
                        >
                          {/* Species Hover Tooltip */}
                          <div className="absolute bottom-11 left-1/2 -translate-x-1/2 w-48 p-2.5 rounded-xl bg-[#040806]/95 border border-[#163529] text-emerald-100 text-3xs font-sans leading-relaxed tracking-wide shadow-2xl opacity-0 scale-95 group-hover/flower:opacity-100 group-hover/flower:scale-100 transition-all pointer-events-none duration-250 z-[90] text-center">
                            <p className="font-accent text-2xs text-emerald-400 font-black mb-1 uppercase">
                              {p.emoji} {p.name}
                            </p>
                            <p className="font-bold line-clamp-2 leading-tight text-white mb-1.5">{art.title}</p>
                            <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-mono text-[9px] border-t border-[#12241e] pt-1.5">
                              <span>{art.date}</span>
                              <span>•</span>
                              <span>{art.readingTime}</span>
                            </div>
                            <span className="text-amber-400 block mt-1.5 font-accent font-black animate-pulse text-[10px] uppercase tracking-wider">
                              Examine Blooms ↗
                            </span>
                          </div>

                          {/* Stems and Flower head model */}
                          <div className={`relative ${swaySetting}`} style={{ animationDuration: isHighlyMoist ? "3s" : "6.5s" }}>
                            <FlowerRenderer
                              flowerName={flowerKey}
                              svgColor={p.svgColor}
                              size={32}
                              className="transition-transform duration-300 hover:scale-125 hover:rotate-12 drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]"
                            />
                            <svg viewBox="0 0 20 100" className="w-1.5 h-5.5 mx-auto -mt-2 text-emerald-500 fill-current">
                              <path d="M10,0 Q6,40 10,100" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path d="M10,35 Q18,25 18,15" stroke="currentColor" strokeWidth="2.5" fill="none" />
                            </svg>
                          </div>
                        </div>
                      );
                    })}

                    {/* ====== FRONT ROW FENCE POSTS (Widely spaced to prevent visual overlap with corners and sides) ====== */}
                    <div className="absolute bottom-0 inset-x-6 h-[1.7rem] flex justify-between items-end pointer-events-none z-30 opacity-95">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-3.5 h-6 bg-gradient-to-b ${theme.woodColor} rounded-t-[8px] rounded-b-[2px] border-x border-t shadow-[0_-1px_3px_rgba(0,0,0,0.4)] relative`}
                        >
                          {/* Golden Wood highlight lines */}
                          <div className="absolute inset-y-1.5 left-1 w-[1px] bg-white/20"></div>
                          <div className="absolute inset-y-1.5 right-1 w-[1.5px] bg-black/20"></div>
                          
                          {/* Front picket metallic nails */}
                          <div className="w-1 h-1 rounded-full bg-slate-400 border border-slate-600 shadow-sm mx-auto mt-1" />
                        </div>
                      ))}
                      {/* Solid Thick Wood Crossbar rail - matching the theme post woodColor beautifully! */}
                      <div className={`absolute bottom-1.5 inset-x-0 h-2 bg-gradient-to-r ${theme.woodColor} border-y shadow-sm opacity-95`}></div>
                    </div>
                  </div>
                </div>

                {/* ================= SECTION C: THE SOOTHE COBBLESTONE CONTROLS ================= */}
                {/* (Styled like mossy timber planks or cobblestones placed on the meadow ground) */}
                <div className="w-full mt-4 space-y-2.5 relative z-25 px-2">
                  
                  {/* Soil Moist meter and Sprinkler button */}
                  <div className="flex items-center justify-between">
                    {/* Water rate */}
                    <div className="flex items-center gap-1.5">
                      <Droplet className={`w-3.5 h-3.5 ${isHighlyMoist ? "text-emerald-400" : isThirsting ? "text-amber-500 animate-pulse" : "text-emerald-600"}`} />
                      <span className={`text-[10.5px] font-accent font-black uppercase tracking-wider ${isHighlyMoist ? "text-emerald-400" : isThirsting ? "text-amber-500 animate-pulse" : "text-emerald-700"}`}>
                        {isHighlyMoist ? "Wet Loam" : isThirsting ? "Thirsty bed" : "Moist Bed"}
                      </span>
                    </div>

                    {/* Cobblestone style Water Splasher */}
                    <button
                      onClick={(e) => handleWaterSingle(cluster.tagName, e)}
                      className={`px-3 py-1 rounded-xl border text-[9px] font-accent font-black tracking-widest uppercase transition-all duration-200 flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 ${
                        isHighlyMoist
                          ? "bg-stone-950/45 border-stone-900 text-stone-700"
                          : "bg-sky-500/10 border-sky-500/35 text-sky-400 hover:bg-[#0c4a6e] hover:text-white hover:border-sky-400 shadow-md animate-pulse"
                      }`}
                      title="Water this soil bed plot"
                    >
                      <Droplet className="w-3 h-3 text-sky-400" />
                      <span>Sprinkle</span>
                    </button>
                  </div>

                  {/* Symmetrical entering path button designed as a weathered dark plank floor */}
                  <button
                    onClick={() => {
                      AudioEngine.playChime(1.1);
                      onSelectCluster(cluster.tagName);
                    }}
                    className={`flex items-center justify-center gap-2 w-full py-3 rounded-2xl border text-2xs font-accent font-black tracking-widest uppercase transition-all duration-220 cursor-pointer shadow-lg relative ${theme.pebbleStyle}`}
                  >
                    <span>Open Cluster ({cluster.flowerCount})</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover/plot:translate-x-1 duration-200" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div id="cluster-empty" className="flex flex-col items-center justify-center py-20 px-8 rounded-3xl border-2 border-dashed border-[#163024]/60 bg-[#06100c]/40 text-center animate-pulse-ring">
          <div className="p-4 bg-emerald-950/40 rounded-full text-emerald-800">
            <Leaf className="w-8 h-8 animate-sway" />
          </div>
          <h3 className="font-accent font-bold text-lg text-emerald-100 mt-4">
            No Sprouts Found in Earth
          </h3>
          <p className="font-sans text-xs text-emerald-700 mt-2 max-w-sm leading-relaxed">
            No clusters match my search coordinates. Try clearing my filters or check back later.
          </p>
        </div>
      )}
    </div>
  );
};
