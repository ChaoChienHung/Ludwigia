import { useState, useEffect } from "react";
import { Writing } from "./types";
import { INITIAL_ARTICLES } from "./data";
import { Header } from "./components/Header";
import { GardenLanding } from "./components/GardenLanding";
import { PatchView } from "./components/PatchView";
import { AudioEngine } from "./components/AudioEngine";
import { FirefliesBackground } from "./components/FirefliesBackground";
import { SeedPlanter } from "./components/SeedPlanter";
import { Critters } from "./components/Critters";
import { Leaf, Globe, Sparkles, Sprout } from "lucide-react";

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<"greenhouse" | "twilight" | "sunset" | "meadow">("greenhouse");
  const [isMuted, setIsMuted] = useState(false);
  const [weather, setWeather] = useState<"sunny" | "rainy" | "autumn" | "snowy" | "mystic">("sunny");
  const [writing, setWriting] = useState<Writing[]>([]);
  const [isPlanterOpen, setIsPlanterOpen] = useState(false);

  
  // Track selected patch tag; can optionally carry an article ID to expand automatically (e.g. when clicking a flower Tooltip)
  const [activeCluster, setActiveCluster] = useState<{
    tag: string;
    initialWritingIdToExpand?: string;
  } | null>(null);

  // Load default seeds and merge with localStorage custom planted thoughts
  useEffect(() => {
    try {
      const stored = localStorage.getItem("lug_flora_notes");
      if (stored) {
        const parsed = JSON.parse(stored) as Writing[];
        // Filter out duplicates if somehow added
        const combined = [...INITIAL_ARTICLES, ...parsed.filter(p => !INITIAL_ARTICLES.some(i => i.id === p.id))];
        setWriting(combined);
      } else {
        setWriting(INITIAL_ARTICLES);
      }
    } catch (e) {
      console.error("Failed to load custom notes:", e);
      setWriting(INITIAL_ARTICLES);
    }
  }, []);

  // Set initial muted state from AudioEngine
  useEffect(() => {
    setIsMuted(AudioEngine.getMuted());
  }, []);

  const handleToggleMute = () => {
    const nextMuted = AudioEngine.toggleMute();
    setIsMuted(nextMuted);
  };

  // Plant a new thought and save to local storage
  const handlePlantThought = (newWriting: Writing) => {
    const updated = [newWriting, ...writing.filter(a => a.id !== newWriting.id)];
    setWriting(updated);
    
    // Save only custom writing to localstorage to avoid duplications info issues
    const customOnly = updated.filter(a => a.isCustom);
    localStorage.setItem("lug_flora_notes", JSON.stringify(customOnly));
  };

  // Switch to a tag cluster; scroll to top smoothly
  const handleSelectCluster = (tag: string, articleIdToExpand?: string) => {
    setActiveCluster({ tag, initialWritingIdToExpand: articleIdToExpand });
    const base = `#patch/${encodeURIComponent(tag)}`;
    const next = articleIdToExpand ? `${base}/${encodeURIComponent(articleIdToExpand)}` : base;
    try {
      window.location.hash = next;
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToGarden = () => {
    setActiveCluster(null);
    try {
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    } catch (e) {
      try {
        window.location.hash = "";
      } catch (e2) {}
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const parseHashCluster = () => {
    const raw = String(window.location.hash || "");
    const h = raw.startsWith("#") ? raw.slice(1) : raw;
    const parts = h.split("/").filter(Boolean);
    if (parts[0] !== "patch") return null;
    const tag = parts[1] ? decodeURIComponent(parts[1]) : "";
    if (!tag) return null;
    const articleIdToExpand = parts[2] ? decodeURIComponent(parts[2]) : undefined;
    return { tag, initialWritingIdToExpand: articleIdToExpand };
  };

  useEffect(() => {
    const initial = parseHashCluster();
    if (initial) setActiveCluster(initial);

    const onHashChange = () => {
      const next = parseHashCluster();
      setActiveCluster(next);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Gather aggregate statistics
  const totalWriting = writing.length;
  const uniqueTags = Array.from(new Set(writing.flatMap(a => a.tags)));
  const totalClusters = uniqueTags.length;

  const backgroundClass = 
    weather === "sunny" ? "from-[#040807] via-[#08120e] to-[#020403] text-emerald-100" :
    weather === "rainy" ? "from-[#020a12] via-[#04111d] to-[#010306] text-sky-100" :
    weather === "autumn" ? "from-[#170902] via-[#2d1508] to-[#060301] text-amber-100" :
    weather === "snowy" ? "from-[#090b16] via-[#101224] to-[#030408] text-violet-100" :
    "from-[#0a0210] via-[#130421] to-[#04010a] text-fuchsia-100";

  const selectionClass = 
    weather === "sunny" ? "selection:bg-emerald-500/20 selection:text-emerald-100" :
    weather === "rainy" ? "selection:bg-sky-500/20 selection:text-sky-100" :
    weather === "autumn" ? "selection:bg-amber-650/20 selection:text-amber-100" :
    weather === "snowy" ? "selection:bg-violet-500/20 selection:text-violet-100" :
    "selection:bg-fuchsia-500/20 selection:text-fuchsia-100";

  return (
    <div className={`min-h-screen bg-[#030605] bg-gradient-to-b ${backgroundClass} ${selectionClass} transition-colors duration-1000 py-6 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden`}>
      {/* Immersive Bioluminescent Particle Canvas (Sunny fireflies, Rainy droplets, Snowy flakes, Mystic auroras) */}
      <FirefliesBackground weather={weather} />

      {/* Fauna & Critters elements floating around the screen */}
      <Critters />


      <div className="max-w-6xl mx-auto space-y-8 pb-16 relative z-10">
        
        {/* Navigation / Header Brand & Stats */}
        <Header
          currentTheme={currentTheme}
          onThemeChange={setCurrentTheme}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          totalWriting={totalWriting}
          totalClusters={totalClusters}
          weather={weather}
          onToggleWeather={() => setWeather((prev) => {
            if (prev === "sunny") return "rainy";
            if (prev === "rainy") return "autumn";
            if (prev === "autumn") return "snowy";
            if (prev === "snowy") return "mystic";
            return "sunny";
          })}
        />

        {/* Dynamic Context Router Screen */}
        <main className="w-full">
          {activeCluster ? (
            /* --- localized Patch View --- */
            <PatchView
              selectedTag={activeCluster.tag}
              writing={writing}
              onBackToGarden={handleBackToGarden}
              initialWritingIdToExpand={activeCluster.initialWritingIdToExpand}
            />
          ) : (
            /* --- main Garden Landing page --- */
            <GardenLanding
              writing={writing}
              onSelectCluster={handleSelectCluster}
            />
          )}
        </main>


        {/* Aesthetic footer zone */}
        <footer className="w-full text-center py-8 border-t border-[#122b21]/60 space-y-3 relative z-10 mt-12">
          <div className="flex items-center justify-center gap-2 text-emerald-600">
            <Leaf className={`w-5 h-5 animate-sway transition-colors duration-500 ${
              weather === 'sunny' ? 'text-[#10b981]' : 
              weather === 'rainy' ? 'text-sky-400' : 
              weather === 'autumn' ? 'text-amber-500' : 
              weather === 'snowy' ? 'text-violet-400' : 
              'text-fuchsia-400'
            }`} />
            <span className={`font-accent font-black tracking-[0.2em] text-xs md:text-sm uppercase transition-colors duration-500 ${
              weather === 'sunny' ? 'text-emerald-500' : 
              weather === 'rainy' ? 'text-sky-400' : 
              weather === 'autumn' ? 'text-amber-500' : 
              weather === 'snowy' ? 'text-violet-400' : 
              'text-fuchsia-400'
            }`}>
              Garden of Ludwigia · 2026
            </span>
          </div>


          <p className="font-sans text-emerald-400/90 text-sm md:text-base leading-relaxed max-w-lg mx-auto">
            Reading, learning, and thinking are akin to cultivating a garden. With daily watering and careful pruning, the oasis in my heart remains evergreen.
          </p>

          <div className="flex items-center justify-center gap-4 text-[11px] font-accent text-emerald-800 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Live Ambient Tuning
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              Durable Local Persistence
            </span>
          </div>
        </footer>

      </div>

      {/* Floating Botanical Seed Planter Hotkey */}
      <button
        onClick={() => {
          AudioEngine.playChime(1.2);
          setIsPlanterOpen(true);
        }}
        className={`fixed bottom-6 right-6 z-30 group flex items-center justify-center gap-2.5 p-4 md:px-5.5 md:py-4 rounded-full text-[#030605] border shadow-lg transform hover:scale-105 hover:-translate-y-0.5 duration-300 cursor-pointer active:scale-95 ${
          weather === "sunny" ? "bg-[#10b981] hover:bg-[#34d399] border-[#047857]/45 shadow-[0_0_20px_rgba(16,185,129,0.3)]" :
          weather === "rainy" ? "bg-sky-500 hover:bg-sky-400 border-sky-600/45 shadow-[0_0_20px_rgba(14,165,233,0.3)]" :
          weather === "autumn" ? "bg-amber-500 hover:bg-amber-400 border-[#b45309]/45 shadow-[0_0_20px_rgba(245,158,11,0.3)]" :
          weather === "snowy" ? "bg-violet-500 hover:bg-violet-400 border-violet-600/45 shadow-[0_0_20px_rgba(139,92,246,0.3)] animate-pulse" :
          "bg-fuchsia-500 hover:bg-fuchsia-400 border-fuchsia-600/45 shadow-[0_0_20px_rgba(217,70,239,0.3)]"
        }`}
        title="Plant custom thought"
      >
        <Sprout className="w-5 h-5 text-[#030605] animate-bounce" />
        <span className="hidden md:inline font-accent font-black tracking-wider text-xs uppercase">Sow Thought</span>
      </button>

      {/* Planter Modal Panel */}
      <SeedPlanter
        isOpen={isPlanterOpen}
        onClose={() => setIsPlanterOpen(false)}
        onPlant={handlePlantThought}
        existingTags={uniqueTags}
      />
    </div>
  );
}
