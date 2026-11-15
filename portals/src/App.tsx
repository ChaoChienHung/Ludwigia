import React, { useState, useEffect, useCallback } from 'react';
import { PortalItem } from './types/portal';
import { TopBar } from './components/TopBar';
import { PanoramicStage } from './components/PanoramicStage';
import { WarpTransition } from './components/WarpTransition';
import { wonderlandAudio } from './utils/audio';
import { fmt, UI, useLang } from './i18n';

const WELCOME_SEEN_KEY = 'aetheria_welcome_seen_v1';

export default function App() {
  const lang = useLang();
  const [warpPortal, setWarpPortal] = useState<PortalItem | null>(null);
  const [sealedPortal, setSealedPortal] = useState<PortalItem | null>(null);
  const [activePortalId, setActivePortalId] = useState<string | null>(null);
  const [scrollTargetX, setScrollTargetX] = useState<number | null>(null);
  // Welcome card is shown only on the first visit (remembered in localStorage)
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    try {
      return localStorage.getItem(WELCOME_SEEN_KEY) !== '1';
    } catch {
      return true;
    }
  });

  const handleStart = () => {
    setShowWelcome(false);
    try {
      localStorage.setItem(WELCOME_SEEN_KEY, '1');
    } catch {
      /* storage unavailable: the card simply shows again next time */
    }
    wonderlandAudio.startAmbient();
    wonderlandAudio.playNavClick();
  };

  // Returning visitors skip the card, so start ambience on their first gesture instead
  useEffect(() => {
    if (showWelcome) return;
    const start = () => wonderlandAudio.startAmbient();
    window.addEventListener('pointerdown', start, { once: true });
    window.addEventListener('keydown', start, { once: true });
    return () => {
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
  }, [showWelcome]);

  // Clicking a portal warps straight into its realm (no info panel). Portals without a
  // destination are sealed: they only show a short notice.
  const handleSelectPortal = useCallback((portal: PortalItem) => {
    if (portal.targetUrl) {
      wonderlandAudio.playPortalWarp();
      setWarpPortal(portal);
    } else {
      wonderlandAudio.playNavClick();
      setSealedPortal(portal);
    }
  }, []);

  const handleCancelWarp = useCallback(() => setWarpPortal(null), []);
  const handleHoverPortal = useCallback((id: string | null) => setActivePortalId(id), []);
  const handleScrollTargetDone = useCallback(() => setScrollTargetX(null), []);

  // Coming back with the browser Back button can restore this page from the bfcache with the
  // warp overlay still mounted; clear it so the lobby is usable again.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setWarpPortal(null);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  useEffect(() => {
    if (!sealedPortal) return;
    const t = window.setTimeout(() => setSealedPortal(null), 2200);
    return () => window.clearTimeout(t);
  }, [sealedPortal]);

  const handleResetView = () => {
    setScrollTargetX(0);
    wonderlandAudio.playNavClick();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#05070c] text-[var(--ap-text)] select-none">
      <TopBar lang={lang} onResetView={handleResetView} />

      <main className="w-full h-full pt-14">
        <PanoramicStage
          lang={lang}
          onSelectPortal={handleSelectPortal}
          activePortalId={activePortalId}
          onHoverPortal={handleHoverPortal}
          scrollTargetX={scrollTargetX}
          onScrollTargetDone={handleScrollTargetDone}
        />
      </main>

      {/* Direct warp transition (~0.7s swirl, Esc / button to cancel) */}
      {warpPortal && <WarpTransition portal={warpPortal} lang={lang} onCancel={handleCancelWarp} />}

      {/* Sealed portal notice */}
      {sealedPortal && (
        <div
          className="ap-panel ap-body fixed top-[72px] left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full animate-modal-in pointer-events-none"
          role="status"
          aria-live="polite"
        >
          {fmt(UI.sealedNotice[lang], { name: sealedPortal.name[lang] })}
        </div>
      )}

      {/* First-visit welcome card (plain, no backdrop blur over the animated scene) */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div
            className="ap-panel w-full max-w-sm p-6 flex flex-col gap-4 animate-modal-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
          >
            <div className="flex flex-col gap-1">
              <span className="ap-caption">{UI.welcomeEyebrow[lang]}</span>
              <h2 id="welcome-title" className="ap-display">
                {UI.welcomeTitle[lang]}
              </h2>
            </div>
            <p className="ap-body text-[var(--ap-text-muted)]">{UI.welcomeBody[lang]}</p>
            <p className="ap-caption">{UI.welcomeOpen[lang]}</p>
            <button type="button" onClick={handleStart} className="ap-btn-primary self-start" autoFocus>
              {UI.welcomeStart[lang]}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
