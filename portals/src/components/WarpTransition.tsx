import React, { useEffect, useRef, useState } from 'react';
import { PortalItem } from '../types/portal';
import { Lang, UI } from '../i18n';

interface WarpTransitionProps {
  portal: PortalItem;
  lang: Lang;
  onCancel: () => void;
}

// Duration of the swirl before navigation. Short on purpose: the portal click *is* the decision;
// this only gives a sense of travel and a brief window to cancel (Esc or the cancel button).
// This is the one deliberate, full-strength effect in the lobby.
export const WARP_DURATION_MS = 700;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const WarpTransition: React.FC<WarpTransitionProps> = ({ portal, lang, onCancel }) => {
  const cancelledRef = useRef(false);
  const [reduced] = useState(prefersReducedMotion);

  useEffect(() => {
    cancelledRef.current = false;
    const target = portal.targetUrl;
    // Reduced motion: no swirl, navigate almost immediately (still cancellable for a beat)
    const delay = reduced ? 120 : WARP_DURATION_MS;
    const timer = window.setTimeout(() => {
      if (!cancelledRef.current && target) window.location.href = target;
    }, delay);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelledRef.current = true;
        window.clearTimeout(timer);
        onCancel();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [portal, onCancel, reduced]);

  const [c0, c1, c2] = portal.colors.vortexGradient;
  const dest = portal.destination?.[lang] ?? portal.name[lang];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden select-none bg-[#05070c] animate-warp-backdrop"
      role="status"
      aria-live="polite"
    >
      {!reduced && (
        <div
          className="absolute w-[40vmax] h-[40vmax] rounded-full animate-warp-swirl"
          style={{ background: `conic-gradient(from 0deg, ${c0}, ${c2}, ${c1}, ${c0})` }}
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-2 text-center px-6">
        <span className="ap-caption uppercase tracking-[0.2em] text-white/70">{UI.warping[lang]}</span>
        <span className="ap-display">{dest}</span>
        <button
          type="button"
          onClick={() => {
            cancelledRef.current = true;
            onCancel();
          }}
          className="ap-chip mt-4"
        >
          {UI.cancelWarp[lang]}
        </button>
      </div>
    </div>
  );
};
