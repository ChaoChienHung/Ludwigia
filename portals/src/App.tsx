import React, { useState, useEffect } from 'react';
import { PORTALS_DATA } from './data/portalsData';
import { PortalItem } from './types/portal';
import { TopBar } from './components/TopBar';
import { PanoramicStage } from './components/PanoramicStage';
import { WorldPreviewModal } from './components/WorldPreviewModal';
import { wonderlandAudio } from './utils/audio';
import { Compass, Sparkles, MoveHorizontal, MousePointerClick } from 'lucide-react';

export default function App() {
  const [selectedPortal, setSelectedPortal] = useState<PortalItem | null>(null);
  const [activePortalId, setActivePortalId] = useState<string | null>(null);
  const [scrollTargetX, setScrollTargetX] = useState<number | null>(null);
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(true);

  // Initialize ambient music upon user's first gesture
  const handleStartExploring = () => {
    setShowWelcomeGuide(false);
    wonderlandAudio.startAmbient();
    wonderlandAudio.playNavClick();
  };

  const handleScrollToPortal = (x: number) => {
    setScrollTargetX(x);
  };

  const handleResetView = () => {
    setScrollTargetX(0);
    wonderlandAudio.playNavClick();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* Top Bar with Top Bar Contract */}
      <TopBar
        onScrollToPortal={handleScrollToPortal}
        onResetView={handleResetView}
        activePortalId={activePortalId}
      />

      {/* Main Interactive Panoramic Wonderland Stage */}
      <main className="w-full h-full pt-16">
        <PanoramicStage
          onSelectPortal={(portal) => setSelectedPortal(portal)}
          activePortalId={activePortalId}
          onHoverPortal={(id) => setActivePortalId(id)}
          scrollTargetX={scrollTargetX}
          onScrollTargetDone={() => setScrollTargetX(null)}
        />
      </main>

      {/* World Preview Card Modal (when a portal is clicked) */}
      <WorldPreviewModal
        portal={selectedPortal}
        onClose={() => setSelectedPortal(null)}
      />

      {/* First-time Welcome & Exploration Guide Overlay */}
      {showWelcomeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none">
          <div className="max-w-md w-full p-6 md:p-8 rounded-3xl bg-slate-950/90 border border-emerald-500/40 shadow-2xl text-center space-y-6 animate-modal-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950/80 border border-emerald-400/50 flex items-center justify-center shadow-lg shadow-emerald-950/60">
              <Sparkles className="w-8 h-8 text-emerald-300 animate-spin" style={{ animationDuration: '10s' }} />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">
                歡迎蒞臨維度樞紐
              </span>
              <h2 className="text-2xl font-fantasy font-bold text-white mt-1">
                幻光仙境傳送門
              </h2>
              <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
                這座廣袤的發光仙境森林中，隱藏著 6 處與自然地貌融為一體的動態異界傳送門。
              </p>
            </div>

            {/* Feature Hints */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-300 mb-1">
                  <MoveHorizontal className="w-4 h-4 text-emerald-400" />
                  <span>全景水平漫遊</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  點擊兩側懸浮箭頭、按住滑鼠拖曳或滾輪，自由平移探索。
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-cyan-300 mb-1">
                  <MousePointerClick className="w-4 h-4 text-cyan-400" />
                  <span>維度躍遷樞紐</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  古樹之門直通【數位花園】，浮島星環直通【Ludwigia World】。
                </p>
              </div>
            </div>

            <button
              onClick={handleStartExploring}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-95 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-500/25 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>啟程漫遊仙境</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
