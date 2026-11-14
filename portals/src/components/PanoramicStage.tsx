import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Play,
  Pause,
  Clock,
  Sparkles,
} from 'lucide-react';
import { PORTALS_DATA } from '../data/portalsData';
import { PortalItem } from '../types/portal';
import { TimePhase, TIME_PHASE_CONFIGS } from '../types/timeCycle';
import { PortalComponent } from './PortalComponent';
import { ParallaxBackground } from './ParallaxBackground';
import { wonderlandAudio } from '../utils/audio';

interface PanoramicStageProps {
  onSelectPortal: (portal: PortalItem) => void;
  activePortalId: string | null;
  onHoverPortal: (id: string | null) => void;
  scrollTargetX: number | null;
  onScrollTargetDone: () => void;
}

const STAGE_WIDTH = 3400;
const SCROLL_STEP = 620;
const CYCLE_ORDER: TimePhase[] = ['dawn', 'day', 'dusk', 'night'];
const AUTO_CYCLE_DURATION_MS = 20000;

export const PanoramicStage: React.FC<PanoramicStageProps> = ({
  onSelectPortal,
  activePortalId,
  onHoverPortal,
  scrollTargetX,
  onScrollTargetDone,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollX, setScrollX] = useState(0);
  const [maxScroll, setMaxScroll] = useState(STAGE_WIDTH - 1200);
  const [viewportWidth, setViewportWidth] = useState(1200);
  const [stageHeight, setStageHeight] = useState(800);

  // --- Spring Physics Camera Engine ---
  // Controls smooth panning, drag momentum, and spring-damped easing
  const currentXRef = useRef(0);
  const targetXRef = useRef(0);
  const velocityRef = useRef(0);
  const maxScrollRef = useRef(STAGE_WIDTH - 1200);

  // Drag tracking refs
  const isDraggingRef = useRef(false);
  const [isDraggingState, setIsDraggingState] = useState(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const lastMouseXRef = useRef(0);
  const lastMouseTimeRef = useRef(0);
  const mouseVelocityRef = useRef(0);

  // Global Day / Night Cycle
  const [timePhase, setTimePhase] = useState<TimePhase>('night');
  const [isAutoCycling, setIsAutoCycling] = useState<boolean>(true);
  const [cycleProgress, setCycleProgress] = useState<number>(0);

  // Measure viewport and stage dimensions
  const updateMetrics = useCallback(() => {
    if (containerRef.current) {
      const vw = containerRef.current.clientWidth;
      const vh = containerRef.current.clientHeight;
      const newMax = Math.max(0, STAGE_WIDTH - vw);
      setViewportWidth(vw);
      setStageHeight(vh);
      setMaxScroll(newMax);
      maxScrollRef.current = newMax;
    }
  }, []);

  useEffect(() => {
    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, [updateMetrics]);

  // Spring Animation Physics Loop (Locked 60/120fps RAF)
  useEffect(() => {
    let animId: number;
    const springK = 0.082; // Spring stiffness
    const damping = 0.81; // Damping ratio

    const step = () => {
      const container = containerRef.current;
      if (container) {
        const max = maxScrollRef.current;

        if (!isDraggingRef.current) {
          // Calculate spring acceleration toward target
          const diff = targetXRef.current - currentXRef.current;
          const force = diff * springK;
          velocityRef.current = (velocityRef.current + force) * damping;
          currentXRef.current += velocityRef.current;

          // Boundary spring resistance
          if (currentXRef.current < 0) {
            currentXRef.current *= 0.8;
            velocityRef.current *= 0.5;
            targetXRef.current = 0;
          } else if (currentXRef.current > max) {
            currentXRef.current = max + (currentXRef.current - max) * 0.8;
            velocityRef.current *= 0.5;
            targetXRef.current = max;
          }

          // Apply to DOM scroll
          container.scrollLeft = currentXRef.current;
          setScrollX(currentXRef.current);
        }
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Handle external scroll target (from TopBar or Minimap) with spring glide
  useEffect(() => {
    if (scrollTargetX !== null) {
      const max = maxScrollRef.current;
      const target = Math.max(0, Math.min(max, scrollTargetX - viewportWidth / 2));
      targetXRef.current = target;
      onScrollTargetDone();
    }
  }, [scrollTargetX, viewportWidth, onScrollTargetDone]);

  // Smooth Spring Arrow Navigation
  const panLeft = () => {
    wonderlandAudio.playNavClick();
    targetXRef.current = Math.max(0, targetXRef.current - SCROLL_STEP);
  };

  const panRight = () => {
    wonderlandAudio.playNavClick();
    const max = maxScrollRef.current;
    targetXRef.current = Math.min(max, targetXRef.current + SCROLL_STEP);
  };

  // Mouse Drag with spring physics and momentum fling
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, [role="button"]')) {
      return;
    }
    isDraggingRef.current = true;
    setIsDraggingState(true);
    dragStartXRef.current = e.clientX;
    dragStartScrollRef.current = currentXRef.current;
    lastMouseXRef.current = e.clientX;
    lastMouseTimeRef.current = performance.now();
    velocityRef.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const now = performance.now();
    const dt = now - lastMouseTimeRef.current;
    if (dt > 8) {
      const dx = e.clientX - lastMouseXRef.current;
      mouseVelocityRef.current = -dx / dt; // pixels per ms
      lastMouseXRef.current = e.clientX;
      lastMouseTimeRef.current = now;
    }

    const deltaX = e.clientX - dragStartXRef.current;
    const max = maxScrollRef.current;
    let nextX = dragStartScrollRef.current - deltaX;

    // Overdrag rubber-banding resistance
    if (nextX < 0) {
      nextX = nextX * 0.4;
    } else if (nextX > max) {
      nextX = max + (nextX - max) * 0.4;
    }

    currentXRef.current = nextX;
    targetXRef.current = nextX;

    if (containerRef.current) {
      containerRef.current.scrollLeft = nextX;
      setScrollX(nextX);
    }
  };

  const handleMouseUpOrLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDraggingState(false);

      // Apply fling momentum from drag release
      const flingVelocity = mouseVelocityRef.current * 16; // scaled to 60fps
      const clampedFling = Math.max(-35, Math.min(35, flingVelocity));
      velocityRef.current = clampedFling;

      const max = maxScrollRef.current;
      targetXRef.current = Math.max(0, Math.min(max, currentXRef.current + clampedFling * 12));
    }
  };

  // Smooth Wheel Panning with spring target nudge
  const handleWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const max = maxScrollRef.current;
    targetXRef.current = Math.max(0, Math.min(max, targetXRef.current + delta * 1.15));
  };

  // Day/Night Auto-cycle timer
  useEffect(() => {
    if (!isAutoCycling) {
      setCycleProgress(0);
      return;
    }

    const intervalStep = 250;
    const progressIncrement = (intervalStep / AUTO_CYCLE_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setCycleProgress((prev) => {
        if (prev + progressIncrement >= 100) {
          setTimePhase((curr) => {
            const nextIdx = (CYCLE_ORDER.indexOf(curr) + 1) % CYCLE_ORDER.length;
            return CYCLE_ORDER[nextIdx];
          });
          return 0;
        }
        return prev + progressIncrement;
      });
    }, intervalStep);

    return () => clearInterval(timer);
  }, [isAutoCycling]);

  const handlePhaseSelect = (phase: TimePhase) => {
    wonderlandAudio.playNavClick();
    setTimePhase(phase);
    setCycleProgress(0);
  };

  const canScrollLeft = scrollX > 15;
  const canScrollRight = scrollX < maxScroll - 15;
  const currentConfig = TIME_PHASE_CONFIGS[timePhase];

  const getTimePhaseIcon = (phase: TimePhase) => {
    switch (phase) {
      case 'dawn':
        return <Sunrise className="w-3.5 h-3.5 text-amber-400" />;
      case 'day':
        return <Sun className="w-3.5 h-3.5 text-yellow-300" />;
      case 'dusk':
        return <Sunset className="w-3.5 h-3.5 text-fuchsia-400" />;
      case 'night':
        return <Moon className="w-3.5 h-3.5 text-cyan-300" />;
    }
  };

  // --- Dynamic Mathematical Spline for Ley Line ---
  // Guaranteed 100% exact node alignment with all 6 portals in pixels
  const portalNodes = useMemo(() => {
    return PORTALS_DATA.map((p) => ({
      id: p.id,
      name: p.name,
      x: p.x,
      y: (p.yPercent / 100) * stageHeight,
      color: p.colors.primary,
      accent: p.colors.accent,
      glow: p.colors.glow,
      symbol: p.signpost.runeSymbol,
    }));
  }, [stageHeight]);

  const leyLineSplinePath = useMemo(() => {
    if (portalNodes.length < 2) return '';
    let d = `M ${portalNodes[0].x} ${portalNodes[0].y}`;

    for (let i = 0; i < portalNodes.length - 1; i++) {
      const p1 = portalNodes[i];
      const p2 = portalNodes[i + 1];
      const dx = p2.x - p1.x;

      // Smooth horizontal-tangent cubic bezier control points (S-curve)
      const cp1x = p1.x + dx * 0.5;
      const cp1y = p1.y;
      const cp2x = p2.x - dx * 0.5;
      const cp2y = p2.y;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    return d;
  }, [portalNodes]);

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-slate-950 select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onWheel={handleWheel}
      style={{ cursor: isDraggingState ? 'grabbing' : 'grab' }}
    >
      {/* 1. Parallax Background Layer: Fixed to viewport, zero cutoff */}
      <ParallaxBackground
        scrollX={scrollX}
        stageWidth={STAGE_WIDTH}
        timePhase={timePhase}
      />

      {/* 2. Scrollable Viewport with Spring Physics */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-x-hidden overflow-y-hidden no-scrollbar relative z-10 bg-transparent"
      >
        {/* 3400px Wide Panoramic Stage */}
        <div
          className="relative h-full pointer-events-none"
          style={{ width: `${STAGE_WIDTH}px` }}
        >
          {/* Dynamic Celestial Ley-Line SVG: 1:1 Pixel Accuracy connecting every portal center */}
          <svg
            className="absolute inset-0 pointer-events-none z-10 overflow-visible"
            width={STAGE_WIDTH}
            height={stageHeight}
            style={{ width: `${STAGE_WIDTH}px`, height: `${stageHeight}px` }}
          >
            <defs>
              <linearGradient id="celestialLeyGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                <stop offset="20%" stopColor="#06b6d4" stopOpacity="0.75" />
                <stop offset="45%" stopColor="#14b8a6" stopOpacity="0.75" />
                <stop offset="70%" stopColor="#a855f7" stopOpacity="0.75" />
                <stop offset="85%" stopColor="#f59e0b" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.6" />
              </linearGradient>

              <filter id="leyGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Glowing Ley Line Spline Path */}
            <path
              d={leyLineSplinePath}
              fill="none"
              stroke="url(#celestialLeyGradient)"
              strokeWidth="2.2"
              strokeDasharray="8 12"
              className="animate-dash-flow"
              filter="url(#leyGlow)"
            />

            {/* Precision Node Anchor Points at each Portal Center */}
            {portalNodes.map((node) => (
              <g key={`node-${node.id}`} className="transition-transform duration-300">
                {/* Concentric node glow ring */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="14"
                  fill="none"
                  stroke={node.color}
                  strokeWidth="1.5"
                  strokeDasharray="3 4"
                  className="animate-dash-flow"
                  opacity="0.8"
                />
                {/* Core node dot */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="5"
                  fill={node.accent}
                  style={{
                    filter: `drop-shadow(0 0 8px ${node.color})`,
                  }}
                />
              </g>
            ))}
          </svg>

          {/* Render All 6 Portals with their custom surroundings and signposts */}
          {PORTALS_DATA.map((portal) => (
            <div key={portal.id} className="pointer-events-auto">
              <PortalComponent
                portal={portal}
                onSelect={onSelectPortal}
                isHovered={activePortalId === portal.id}
                onHoverChange={onHoverPortal}
                glowMultiplier={currentConfig.glowIntensity}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Floating Day / Night Cycle HUD (Top Right) */}
      <div className="fixed top-20 right-6 z-40 pointer-events-none">
        <div className="p-3 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-700/60 shadow-2xl flex flex-col gap-2.5 pointer-events-auto max-w-xs transition-all duration-300">
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-700">
                {getTimePhaseIcon(timePhase)}
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white font-fantasy">
                  <span>{currentConfig.name}</span>
                  <span className="text-[10px] text-slate-400 font-sans">
                    ({Math.round(currentConfig.glowIntensity * 100)}% 光暈)
                  </span>
                </div>
                <div className="text-[10px] text-emerald-400">
                  仙境日夜光影流轉
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsAutoCycling(!isAutoCycling)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all cursor-pointer ${
                isAutoCycling
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={isAutoCycling ? '暫停日夜自動流轉' : '啟動日夜自動流轉'}
              aria-label="切換自動循環"
            >
              {isAutoCycling ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* 4 Time Phase Selector Buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            {CYCLE_ORDER.map((phase) => {
              const active = timePhase === phase;
              return (
                <button
                  key={phase}
                  onClick={() => handlePhaseSelect(phase)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-medium flex flex-col items-center gap-1 transition-all cursor-pointer border ${
                    active
                      ? 'bg-slate-800 text-white border-emerald-400/80 shadow-md ring-1 ring-emerald-400/40'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                >
                  {getTimePhaseIcon(phase)}
                  <span className="text-[10px]">
                    {phase === 'dawn'
                      ? '晨曦'
                      : phase === 'day'
                      ? '正午'
                      : phase === 'dusk'
                      ? '暮色'
                      : '幽夜'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Time Progression Progress Bar */}
          {isAutoCycling && (
            <div className="space-y-1">
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-purple-400 transition-all duration-200"
                  style={{ width: `${cycleProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[9px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>流轉進行中</span>
                </span>
                <span>{Math.round((cycleProgress / 100) * (AUTO_CYCLE_DURATION_MS / 1000))}s</span>
              </div>
            </div>
          )}

          <p className="text-[10px] text-slate-400 leading-tight italic bg-slate-900/50 p-2 rounded-xl border border-slate-800/60">
            {currentConfig.description}
          </p>
        </div>
      </div>

      {/* Floating Left Navigation Arrow (Triggers Spring Glide) */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 pointer-events-none">
        <button
          onClick={panLeft}
          disabled={!canScrollLeft}
          className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all duration-200 pointer-events-auto backdrop-blur-md cursor-pointer ${
            canScrollLeft
              ? 'bg-slate-950/80 border-emerald-500/50 text-emerald-300 hover:scale-105 hover:bg-emerald-950/80 shadow-lg shadow-emerald-950/60 active:scale-95'
              : 'opacity-25 bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed'
          }`}
          style={{
            boxShadow: canScrollLeft ? '0 0 20px rgba(16, 185, 129, 0.3)' : undefined,
          }}
          aria-label="向左探索仙境"
          title="向左平移畫面"
        >
          <ChevronLeft className="w-8 h-8 -ml-0.5" />
        </button>
      </div>

      {/* Floating Right Navigation Arrow (Triggers Spring Glide) */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 pointer-events-none">
        <button
          onClick={panRight}
          disabled={!canScrollRight}
          className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all duration-200 pointer-events-auto backdrop-blur-md cursor-pointer ${
            canScrollRight
              ? 'bg-slate-950/80 border-emerald-500/50 text-emerald-300 hover:scale-105 hover:bg-emerald-950/80 shadow-lg shadow-emerald-950/60 active:scale-95'
              : 'opacity-25 bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed'
          }`}
          style={{
            boxShadow: canScrollRight ? '0 0 20px rgba(16, 185, 129, 0.3)' : undefined,
          }}
          aria-label="向右探索仙境"
          title="向右平移畫面"
        >
          <ChevronRight className="w-8 h-8 -mr-0.5" />
        </button>
      </div>

      {/* Bottom Floating Mini-Map / Radar Navigation Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none w-[90%] max-w-xl">
        <div className="p-2.5 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 shadow-2xl flex flex-col gap-2 pointer-events-auto">
          <div className="relative h-6 w-full rounded-lg bg-slate-900/90 border border-slate-800 overflow-hidden flex items-center px-3">
            {/* Viewport Highlight indicator */}
            <div
              className="absolute top-0 bottom-0 bg-emerald-500/15 border-x border-emerald-400/40 transition-all duration-75 pointer-events-none rounded"
              style={{
                left: `${(scrollX / STAGE_WIDTH) * 100}%`,
                width: `${(viewportWidth / STAGE_WIDTH) * 100}%`,
              }}
            />

            {/* Portal Markers on Radar */}
            {PORTALS_DATA.map((p) => {
              const markerLeftPercent = (p.x / STAGE_WIDTH) * 100;
              const isActive = activePortalId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    wonderlandAudio.playNavClick();
                    const max = maxScrollRef.current;
                    targetXRef.current = Math.max(0, Math.min(max, p.x - viewportWidth / 2));
                  }}
                  className={`absolute -translate-x-1/2 flex items-center justify-center transition-all cursor-pointer group ${
                    isActive ? 'scale-125 z-20' : 'hover:scale-110'
                  }`}
                  style={{ left: `${markerLeftPercent}%` }}
                  title={`${p.name} · ${p.signpost.destination}`}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] font-fantasy font-bold transition-transform shadow-md"
                    style={{
                      backgroundColor: p.colors.primary,
                      borderColor: p.colors.accent,
                      boxShadow: `0 0 10px ${p.colors.glow}`,
                      color: '#020617',
                    }}
                  >
                    {p.signpost.runeSymbol}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>仙境全景探索軸</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline opacity-75">
                點擊兩側箭頭、拖曳甩動或滾輪平移 (彈性緩衝已啟動)
              </span>
              <span className="text-emerald-400 font-fantasy">
                {Math.round((scrollX / (maxScroll || 1)) * 100)}% 領域
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
