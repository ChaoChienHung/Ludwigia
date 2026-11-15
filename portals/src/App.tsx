import React, { useState, useEffect, useCallback } from 'react';
import { PortalItem } from './types/portal';
import { TopBar } from './components/TopBar';
import { PanoramicStage } from './components/PanoramicStage';
import { WarpTransition } from './components/WarpTransition';
import { wonderlandAudio } from './utils/audio';
import { Compass, Sparkles, MoveHorizontal, MousePointerClick } from 'lucide-react';

const WELCOME_SEEN_KEY = 'aetheria_welcome_seen_v1';

export default function App() {
  const [warpPortal, setWarpPortal] = useState<PortalItem | null>(null);
  const [sealedNotice, setSealedNotice] = useState<string | null>(null);
  const [activePortalId, setActivePortalId] = useState<string | null>(null);
  const [scrollTargetX, setScrollTargetX] = useState<number | null>(null);
  // Welcome guide is shown only on the first visit (remembered in localStorage)
  const [showWelcomeGuide, setShowWelcomeGuide] = useState<boolean>(() => {
    try {
      return localStorage.getItem(WELCOME_SEEN_KEY) !== '1';
    } catch {
      return true;
    }
  });

  // Initialize ambient music upon user's first gesture
  const handleStartExploring = () => {
    setShowWelcomeGuide(false);
    try {
      localStorage.setItem(WELCOME_SEEN_KEY, '1');
    } catch {
      /* storage unavailable: guide simply shows again next time */
    }
    wonderlandAudio.startAmbient();
    wonderlandAudio.playNavClick();
  };

  // Returning visitors skip the guide, so start ambience on their first gesture instead
  useEffect(() => {
    if (showWelcomeGuide) return;
    const start = () => wonderlandAudio.startAmbient();
    window.addEventListener('pointerdown', start, { once: true });
    window.addEventListener('keydown', start, { once: true });
    return () => {
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
  }, [showWelcomeGuide]);

  // Clicking a portal warps straight into its realm (no info panel). Portals without a
  // destination are "sealed": they only show a short notice.
  const handleSelectPortal = useCallback((portal: PortalItem) => {
    if (portal.targetUrl) {
      wonderlandAudio.playPortalWarp();
      setWarpPortal(portal);
    } else {
      wonderlandAudio.playNavClick();
      setSealedNotice(portal.name);
    }
  }, []);

  const handleCancelWarp = useCallback(() => setWarpPortal(null), []);

  // Coming back with the browser Back button can restore this page from the bfcache with the
  // warp overlay still mounted; clear it so the lobby is usable again.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setWarpPortal(null);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);
  const handleHoverPortal = useCallback((id: string | null) => setActivePortalId(id), []);
  const handleScrollTargetDone = useCallback(() => setScrollTargetX(null), []);

  useEffect(() => {
    if (!sealedNotice) return;
    const t = window.setTimeout(() => setSealedNotice(null), 2200);
    return () => window.clearTimeout(t);
  }, [sealedNotice]);

  const handleResetView = () => {
    setScrollTargetX(0);
    wonderlandAudio.playNavClick();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* Top Bar with Top Bar Contract */}
      <TopBar onResetView={handleResetView} />

      {/* Main Interactive Panoramic Wonderland Stage */}
      <main className="w-full h-full pt-16">
        <PanoramicStage
          onSelectPortal={handleSelectPortal}
          activePortalId={activePortalId}
          onHoverPortal={handleHoverPortal}
          scrollTargetX={scrollTargetX}
          onScrollTargetDone={handleScrollTargetDone}
        />
      </main>

      {/* Direct warp transition (~0.7s swirl, Esc / button to cancel) */}
      {warpPortal && <WarpTransition portal={warpPortal} onCancel={handleCancelWarp} />}

      {/* Sealed portal notice */}
      {sealedNotice && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-950/90 border border-slate-700 text-xs text-slate-200 shadow-xl animate-modal-in pointer-events-none"
          role="status"
          aria-live="polite"
        >
          {sealedNotice} · 封印中，尚未開放
        </div>
      )}

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
                  點擊傳送門即刻穿越：古樹之門直通【數位花園】，浮島星環直通【Ludwigia World】。
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
