import React, { useEffect, useRef, useState } from 'react';
import { TimePhase, TIME_PHASE_CONFIGS } from '../types/timeCycle';

interface ParallaxBackgroundProps {
  scrollX: number;
  stageWidth: number;
  timePhase: TimePhase;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  speedX: number;
  speedY: number;
  alpha: number;
  pulseSpeed: number;
  phase: number;
}


export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
  scrollX,
  stageWidth,
  timePhase,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentConfig = TIME_PHASE_CONFIGS[timePhase];

  // Only the active time phase (plus the outgoing one during its 1s crossfade) is mounted.
  // Previously all 4 phases were always mounted at opacity 0, which kept ~12 extra 5600px-wide
  // composited layers alive (hundreds of MB of GPU tiles) for invisible content.
  // Derived during render (not in an effect) so the outgoing layer never unmounts for a frame.
  const [phaseState, setPhaseState] = useState<{ current: TimePhase; fading: TimePhase | null }>({
    current: timePhase,
    fading: null,
  });
  if (phaseState.current !== timePhase) {
    setPhaseState({ current: timePhase, fading: phaseState.current });
  }
  const fadingPhase = phaseState.current === timePhase ? phaseState.fading : phaseState.current;
  useEffect(() => {
    if (!phaseState.fading) return;
    const t = window.setTimeout(() => setPhaseState((st) => ({ ...st, fading: null })), 1100);
    return () => window.clearTimeout(t);
  }, [phaseState]);
  const mountedPhases: TimePhase[] = fadingPhase && fadingPhase !== timePhase ? [fadingPhase, timePhase] : [timePhase];
  // Incoming layer fades in via keyframes (it mounts fresh, so a CSS transition would not run)
  const fadeInClass = fadingPhase ? ' animate-phase-in' : '';

  // Optimize canvas particles: lightweight, locked 60fps
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // A few quiet spores; count scales with viewport area (24 on a 1440x900 desktop, ~10 on phones)
    const count = Math.round(Math.max(10, Math.min(24, (width * height) / (1440 * 900) * 24)));
    const reduceMotion =
      typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const particles: Particle[] = Array.from({ length: count }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.2 + 0.6,
      color: '255, 255, 255',
      speedX: (Math.random() - 0.5) * 0.15,
      speedY: -Math.random() * 0.2 - 0.05,
      alpha: Math.random() * 0.3 + 0.15,
      pulseSpeed: Math.random() * 0.01 + 0.005,
      phase: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const baseColor = '226, 232, 240'; // neutral: the accent is reserved for UI

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.phase += p.pulseSpeed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const a = Math.max(0.08, Math.min(0.5, p.alpha + Math.sin(p.phase) * 0.12));

        // Core bright pip
        ctx.fillStyle = `rgba(${baseColor}, ${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // prefers-reduced-motion: draw a single static frame of spores, no animation loop
      if (!reduceMotion) animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [timePhase]);

  // Subtle parallax shift ratios (safe across all screen widths)
  const farSkyX = -scrollX * 0.08;
  const mountainsX = -scrollX * 0.18;
  const midTreesX = -scrollX * 0.36;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* 1. Base Sky: 100% full viewport, zero cutoff, opacity crossfade */}
      {mountedPhases.map((phase) => {
        const cfg = TIME_PHASE_CONFIGS[phase];
        const isActive = timePhase === phase;
        return (
          <div
            key={phase}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out${isActive ? fadeInClass : ''}`}
            style={{
              opacity: isActive ? 1 : 0,
              background: cfg.skyBackground,
              zIndex: isActive ? 2 : 1,
            }}
          />
        );
      })}

      {/* 2. Seamless Ultra-wide Aurora Mist (5600px wide, zero boundary cut) */}
      {mountedPhases.map((phase) => {
        const cfg = TIME_PHASE_CONFIGS[phase];
        const isActive = timePhase === phase;
        return (
          <div
            key={`aurora-${phase}`}
            className={`absolute top-0 h-[75%] w-[5600px] transition-opacity duration-1000 ease-in-out will-change-transform${isActive ? fadeInClass : ''}`}
            style={{
              opacity: isActive ? 0.4 : 0,
              transform: `translate3d(${farSkyX}px, 0, 0)`,
              background: cfg.auroraMist,
              zIndex: 3,
            }}
          />
        );
      })}

      {/* 3. Golden Sun (Dawn / Day) */}
      <div
        className="absolute w-52 h-52 rounded-full pointer-events-none transition-all duration-1000 ease-in-out will-change-[transform,opacity]"
        style={{
          left: `${currentConfig.sunPosition.x}px`,
          top: `${currentConfig.sunPosition.y}px`,
          transform: `translate3d(${farSkyX * 1.15}px, 0, 0)`,
          opacity: currentConfig.sunOpacity,
          background: 'radial-gradient(circle at center, #fffbeb 0%, #fde68a 35%, rgba(245, 158, 11, 0.6) 65%, transparent 80%)',
          boxShadow: `0 0 40px 8px rgba(245, 158, 11, ${0.18 * currentConfig.glowIntensity})`,
          zIndex: 4,
        }}
      >
      </div>

      {/* 4. Moon (dusk / night): one pale neutral disc */}
      <div
        className="absolute top-12 left-[480px] w-36 h-36 rounded-full pointer-events-none transition-opacity duration-1000 ease-in-out will-change-[transform,opacity]"
        style={{
          transform: `translate3d(${farSkyX * 1.2}px, 0, 0)`,
          opacity: currentConfig.moonOpacity,
          background: 'radial-gradient(circle at 35% 35%, #f8fafc 0%, #cbd5e1 55%, #64748b 100%)',
          boxShadow: `0 0 32px rgba(226, 232, 240, ${0.15 * currentConfig.glowIntensity})`,
          zIndex: 4,
        }}
      >
      </div>

      {/* 5. Distant Mystical Mountain Ridges (Ultra-wide 5600px continuous span) */}
      <div
        className="absolute bottom-0 w-[5600px] h-[55%] pointer-events-none will-change-transform"
        style={{
          transform: `translate3d(${mountainsX}px, 0, 0)`,
          zIndex: 5,
        }}
      >
        {mountedPhases.map((phase) => {
          const cfg = TIME_PHASE_CONFIGS[phase];
          const isActive = timePhase === phase;
          return (
            <svg
              key={`mountains-${phase}`}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out${isActive ? fadeInClass : ''}`}
              style={{ opacity: isActive ? 0.75 : 0 }}
              viewBox="0 0 5600 600"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={`mountGrad_${phase}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={cfg.mountainGrad.stop0} />
                  <stop offset="60%" stopColor={cfg.mountainGrad.stop60} />
                  <stop offset="100%" stopColor={cfg.mountainGrad.stop100} />
                </linearGradient>
              </defs>

              <path
                d="M 0 600 
                   L 0 380 
                   Q 280 240, 520 320 
                   T 1050 260 
                   T 1600 350 
                   T 2150 210 
                   T 2750 310 
                   T 3350 240 
                   T 3900 320 
                   T 4500 250 
                   T 5100 330 
                   L 5600 290 
                   L 5600 600 Z"
                fill={`url(#mountGrad_${phase})`}
              />
              <path
                d="M 0 380 
                   Q 280 240, 520 320 
                   T 1050 260 
                   T 1600 350 
                   T 2150 210 
                   T 2750 310 
                   T 3350 240 
                   T 3900 320 
                   T 4500 250 
                   T 5100 330 
                   L 5600 290"
                fill="none"
                stroke={cfg.mountainGrad.rimGlow}
                strokeWidth="1.25"
                strokeOpacity="0.5"
              />
            </svg>
          );
        })}
      </div>

      {/* 6. Midground Layer: Ancient Trees & Landscape (Ultra-wide 5600px continuous span) */}
      <div
        className="absolute bottom-0 w-[5600px] h-[75%] pointer-events-none will-change-transform"
        style={{
          transform: `translate3d(${midTreesX}px, 0, 0)`,
          zIndex: 6,
        }}
      >
        {mountedPhases.map((phase) => {
          const cfg = TIME_PHASE_CONFIGS[phase];
          const isActive = timePhase === phase;
          return (
            <svg
              key={`forest-${phase}`}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out${isActive ? fadeInClass : ''}`}
              style={{ opacity: isActive ? 0.95 : 0 }}
              viewBox="0 0 5600 800"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={`forestGrad_${phase}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={cfg.forestGrad.stop0} />
                  <stop offset="50%" stopColor={cfg.forestGrad.stop50} />
                  <stop offset="100%" stopColor={cfg.forestGrad.stop100} />
                </linearGradient>
              </defs>

              <path
                d="M 0 800 
                   L 0 550 
                   C 180 540, 320 460, 480 470 
                   C 680 480, 850 560, 1080 540 
                   C 1260 520, 1420 590, 1620 580 
                   C 1820 570, 2020 510, 2220 520 
                   C 2460 530, 2680 470, 2900 490 
                   C 3180 510, 3420 560, 3650 540 
                   C 3950 520, 4250 570, 4550 530 
                   C 4850 500, 5150 550, 5450 535 
                   L 5600 550 L 5600 800 Z"
                fill={`url(#forestGrad_${phase})`}
              />

              {/* Colossal Sacred World Tree (萬年神木天幕剪影) */}
              {/* Massive Sprawling Roots Base */}
              <path
                d="M 160 800 C 230 730, 290 620, 340 480 C 370 300, 390 120, 420 0 C 470 0, 490 140, 520 300 C 560 480, 610 650, 750 800 Z"
                fill="#051512"
              />
              {/* Secondary Root Pillars */}
              <path
                d="M 220 800 Q 280 670, 360 480 M 680 800 Q 600 660, 510 470"
                stroke="#030d0b"
                strokeWidth="24"
                strokeLinecap="round"
                fill="none"
              />

              {/* Towering Spreading Branches across Sky */}
              <path
                d="M 370 240 C 260 160, 140 100, -20 120 M 340 180 C 220 90, 80 40, -40 20 M 390 100 C 310 20, 180 -30, 60 -50"
                stroke="#04120f"
                strokeWidth="32"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 500 240 C 620 160, 760 100, 940 120 M 520 180 C 650 90, 810 40, 960 20 M 480 100 C 580 20, 720 -30, 860 -50"
                stroke="#04120f"
                strokeWidth="32"
                strokeLinecap="round"
                fill="none"
              />

              {/* Grand Foliage Masses (神木茂盛樹冠葉層) */}
              <g opacity="0.65">
                <ellipse cx="120" cy="80" rx="180" ry="70" fill="#031812" />
                <ellipse cx="280" cy="40" rx="200" ry="85" fill="#05241b" />
                <ellipse cx="440" cy="20" rx="220" ry="90" fill="#041d16" />
                <ellipse cx="620" cy="50" rx="190" ry="80" fill="#05241b" />
                <ellipse cx="780" cy="90" rx="170" ry="65" fill="#031812" />
                {/* Emerald glowing canopy rim */}
                <ellipse cx="450" cy="15" rx="160" ry="45" fill="#065f46" opacity="0.25" />
                <ellipse cx="270" cy="35" rx="140" ry="40" fill="#065f46" opacity="0.2" />
                <ellipse cx="630" cy="45" rx="140" ry="40" fill="#065f46" opacity="0.2" />
              </g>

              {/* Mushroom Stalks and Cap at x: ~2550 */}
              <path
                d="M 2520 800 C 2530 680, 2550 490, 2570 320 C 2580 260, 2600 260, 2610 320 C 2630 490, 2650 680, 2680 800 Z"
                fill="#0c160e"
              />
              <ellipse cx="2590" cy="300" rx="200" ry="60" fill="#132416" />

              {/* Distant Temple Ruins arch at x: ~4200 */}
              <path
                d="M 4180 800 L 4180 500 M 4280 800 L 4280 500"
                stroke="#08141d"
                strokeWidth="16"
              />
            </svg>
          );
        })}
      </div>

      {/* 7. Canvas Spores: pinned to full viewport */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

      {/* 8. Bottom Fog with Opacity Crossfade */}
      {mountedPhases.map((phase) => {
        const cfg = TIME_PHASE_CONFIGS[phase];
        const isActive = timePhase === phase;
        return (
          <div
            key={`fog-${phase}`}
            className={`absolute bottom-0 left-0 right-0 h-36 pointer-events-none transition-opacity duration-1000 ease-in-out${isActive ? fadeInClass : ''}`}
            style={{
              opacity: isActive ? 1 : 0,
              background: cfg.fogGradient,
              zIndex: 11,
            }}
          />
        );
      })}
    </div>
  );
};
