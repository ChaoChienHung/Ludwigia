import React, { useEffect, useRef, useState } from 'react';
import { PortalItem } from '../types/portal';

interface WarpTransitionProps {
  portal: PortalItem;
  onCancel: () => void;
}

// Duration of the swirl before navigation. Short on purpose: the portal click *is* the decision,
// this only gives a sense of travel and a brief window to cancel (Esc or the cancel button).
export const WARP_DURATION_MS = 700;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const WarpTransition: React.FC<WarpTransitionProps> = ({ portal, onCancel }) => {
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

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden select-none animate-warp-backdrop"
      style={{ background: `radial-gradient(circle at 50% 50%, ${portal.colors.glow} 0%, #020617 70%)` }}
      role="status"
      aria-live="polite"
    >
      {!reduced && (
        <div
          className="absolute w-[40vmax] h-[40vmax] rounded-full animate-warp-swirl"
          style={{
            background: `conic-gradient(from 0deg, ${c0}, ${c2 ?? c1}, ${c1}, ${c0})`,
            boxShadow: `0 0 120px 40px ${portal.colors.glow}`,
          }}
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-3 text-center px-6">
        <span className="text-xs tracking-[0.3em] uppercase text-white/70">躍遷中</span>
        <span className="text-xl md:text-2xl font-fantasy font-bold text-white drop-shadow">
          {portal.targetLabel ?? portal.signpost.destination}
        </span>
        <button
          type="button"
          onClick={() => {
            cancelledRef.current = true;
            onCancel();
          }}
          className="mt-2 px-3 py-1 rounded-full bg-black/40 border border-white/20 text-[11px] text-white/80 hover:text-white cursor-pointer"
        >
          取消（Esc）
        </button>
      </div>
    </div>
  );
};
