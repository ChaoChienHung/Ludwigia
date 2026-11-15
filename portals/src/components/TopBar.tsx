import React, { useState } from 'react';
import { wonderlandAudio } from '../utils/audio';
import { Volume2, VolumeX, RotateCcw, Sparkles, Sprout, Globe, Home } from 'lucide-react';

interface TopBarProps {
  onResetView: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onResetView }) => {
  const [isMuted, setIsMuted] = useState(wonderlandAudio.getMuted());

  const handleAudioToggle = () => {
    const muted = wonderlandAudio.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 px-4 md:px-6 bg-slate-950/80 backdrop-blur-md border-b border-emerald-900/30 flex items-center justify-between gap-4 md:gap-6 select-none">
      {/* Zone 1: Brand & Home */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onResetView();
          }}
          className="text-base md:text-lg font-fantasy font-bold tracking-wider text-emerald-300 hover:text-emerald-200 transition-colors whitespace-nowrap flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span>Aetheria Portals</span>
        </a>
      </div>

      {/* Portal-by-portal navigation lives in the bottom minimap; the top bar keeps only
          brand, the two realm shortcuts, home and audio so it fits on phones. */}

      {/* Zone 3: Dimensional Teleport Gateways (Garden, World, Home) & Controls */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Teleport: Digital Garden */}
        <a
          href="./realms/garden/index.html"
          className="px-2.5 md:px-3 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 hover:text-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-950/50 hover:shadow-emerald-500/20 active:scale-95"
          title="前往數位花園 (Digital Garden)"
        >
          <Sprout className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">數位花園</span>
        </a>

        {/* Teleport: Ludwigia World */}
        <a
          href="./realms/world/index.html"
          className="px-2.5 md:px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shadow-purple-950/50 hover:shadow-purple-500/20 active:scale-95"
          title="前往 Ludwigia World 虛擬世界"
        >
          <Globe className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Ludwigia World</span>
        </a>

        {/* Teleport: Main Home */}
        <a
          href="../index.html"
          className="hidden lg:flex px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-medium items-center gap-1.5 transition-all"
          title="返回首頁"
        >
          <Home className="w-3.5 h-3.5 text-slate-400" />
          <span>首頁</span>
        </a>

        {/* Reset View */}
        <button
          onClick={onResetView}
          className="p-1.5 md:p-2 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          title="回歸仙境起點"
          aria-label="回歸起點"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={handleAudioToggle}
          className={`p-1.5 md:p-2 rounded-xl border text-xs font-medium flex items-center transition-all cursor-pointer ${
            isMuted
              ? 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200'
              : 'bg-emerald-950/80 border-emerald-600/50 text-emerald-300 shadow-sm shadow-emerald-900/40'
          }`}
          title={isMuted ? '開啟環境仙境音效' : '靜音環境音效'}
          aria-label={isMuted ? '開啟音效' : '靜音'}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4 text-slate-400" />
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-emerald-400" />
            </>
          )}
        </button>
      </div>
    </header>
  );
};
