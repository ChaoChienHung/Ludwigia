import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Play,
  Pause,
} from 'lucide-react';
import { PORTALS_DATA } from '../data/portalsData';
import { PortalItem } from '../types/portal';
import { TimePhase, TIME_PHASE_CONFIGS } from '../types/timeCycle';
import { PortalComponent } from './PortalComponent';
import { ParallaxBackground } from './ParallaxBackground';
import { wonderlandAudio } from '../utils/audio';
import { fmt, Lang, UI } from '../i18n';

interface PanoramicStageProps {
  lang: Lang;
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
  lang,
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
  const [isAutoCycling, setIsAutoCycling] = useState<boolean>(false);
  const [cycleProgress, setCycleProgress] = useState<number>(0);
  const [isHudOpen, setIsHudOpen] = useState<boolean>(false);

  const kickSpringRef = useRef<(() => void) | null>(null);

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
      if (targetXRef.current > newMax) targetXRef.current = newMax;
      kickSpringRef.current?.();
    }
  }, []);

  useEffect(() => {
    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, [updateMetrics]);

  // Spring Animation Physics Loop (on-demand RAF)
  // The loop only runs while the camera is actually moving: it starts when a target/drag/fling
  // changes (kickSpring) and stops once position and velocity settle. At rest the stage costs
  // zero frames, and React state is only updated when the rounded scroll position changes.
  const springRafRef = useRef<number | null>(null);
  const lastCommittedXRef = useRef<number>(0);

  const commitScroll = useCallback((x: number) => {
    const container = containerRef.current;
    if (container) container.scrollLeft = x;
    const rounded = Math.round(x * 2) / 2;
    if (rounded !== lastCommittedXRef.current) {
      lastCommittedXRef.current = rounded;
      setScrollX(rounded);
    }
  }, []);

  const kickSpring = useCallback(() => {
    if (springRafRef.current !== null) return;
    const springK = 0.082; // Spring stiffness
    const damping = 0.81; // Damping ratio

    const step = () => {
      springRafRef.current = null;
      if (isDraggingRef.current) return; // drag handler drives position directly
      const max = maxScrollRef.current;

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

      // Settled: snap to target and stop scheduling frames
      const settled =
        Math.abs(targetXRef.current - currentXRef.current) < 0.3 && Math.abs(velocityRef.current) < 0.05;
      if (settled) {
        currentXRef.current = targetXRef.current;
        velocityRef.current = 0;
      }

      commitScroll(currentXRef.current);

      if (!settled) springRafRef.current = requestAnimationFrame(step);
    };

    springRafRef.current = requestAnimationFrame(step);
  }, [commitScroll]);

  kickSpringRef.current = kickSpring;

  useEffect(() => {
    return () => {
      if (springRafRef.current !== null) cancelAnimationFrame(springRafRef.current);
    };
  }, []);

  // Handle external scroll target (from TopBar or Minimap) with spring glide
  useEffect(() => {
    if (scrollTargetX !== null) {
      const max = maxScrollRef.current;
      const target = Math.max(0, Math.min(max, scrollTargetX - viewportWidth / 2));
      targetXRef.current = target;
      kickSpring();
      onScrollTargetDone();
    }
  }, [scrollTargetX, viewportWidth, onScrollTargetDone, kickSpring]);

  // --- Phone layout: swipe / arrows move one portal at a time (card-style browsing) ---
  const [isPhone, setIsPhone] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767.98px)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767.98px)');
    const onChange = (e: MediaQueryListEvent) => setIsPhone(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const viewportWidthRef = useRef(viewportWidth);
  viewportWidthRef.current = viewportWidth;

  // Index of the portal closest to the viewport centre for a given scroll position
  const nearestPortalIndex = useCallback((x: number) => {
    const centre = x + viewportWidthRef.current / 2;
    let best = 0;
    for (let i = 1; i < PORTALS_DATA.length; i++) {
      if (Math.abs(PORTALS_DATA[i].x - centre) < Math.abs(PORTALS_DATA[best].x - centre)) best = i;
    }
    return best;
  }, []);

  const snapToPortal = useCallback(
    (index: number) => {
      const i = Math.max(0, Math.min(PORTALS_DATA.length - 1, index));
      const max = maxScrollRef.current;
      targetXRef.current = Math.max(0, Math.min(max, PORTALS_DATA[i].x - viewportWidthRef.current / 2));
      kickSpring();
    },
    [kickSpring],
  );

  // Smooth Spring Arrow Navigation
  const panLeft = () => {
    wonderlandAudio.playNavClick();
    if (isPhone) {
      snapToPortal(nearestPortalIndex(targetXRef.current) - 1);
      return;
    }
    targetXRef.current = Math.max(0, targetXRef.current - SCROLL_STEP);
    kickSpring();
  };

  const panRight = () => {
    wonderlandAudio.playNavClick();
    if (isPhone) {
      snapToPortal(nearestPortalIndex(targetXRef.current) + 1);
      return;
    }
    const max = maxScrollRef.current;
    targetXRef.current = Math.min(max, targetXRef.current + SCROLL_STEP);
    kickSpring();
  };

  // Touch: the stage follows the finger; on release phones snap to the previous / next portal
  // (swipe > 40px) or back to the nearest one. A swipe never counts as a tap on a portal.
  const touchRef = useRef<{ x0: number; scroll0: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchRef.current = { x0: e.touches[0].clientX, scroll0: currentXRef.current, moved: false };
    isDraggingRef.current = true;
    velocityRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const t = touchRef.current;
    if (!t || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - t.x0;
    if (Math.abs(dx) > 8) t.moved = true;
    const max = maxScrollRef.current;
    let nextX = t.scroll0 - dx;
    if (nextX < 0) nextX *= 0.4;
    else if (nextX > max) nextX = max + (nextX - max) * 0.4;
    currentXRef.current = nextX;
    targetXRef.current = nextX;
    commitScroll(nextX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const t = touchRef.current;
    touchRef.current = null;
    isDraggingRef.current = false;
    if (!t) return;
    const dx = (e.changedTouches[0]?.clientX ?? t.x0) - t.x0;
    if (t.moved) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 400);
    }
    if (isPhone) {
      const from = nearestPortalIndex(t.scroll0);
      snapToPortal(dx < -40 ? from + 1 : dx > 40 ? from - 1 : nearestPortalIndex(currentXRef.current));
    } else {
      const max = maxScrollRef.current;
      targetXRef.current = Math.max(0, Math.min(max, currentXRef.current));
      kickSpring();
    }
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // Phones open on the first portal centred
  const didInitialSnapRef = useRef(false);
  useEffect(() => {
    if (isPhone && !didInitialSnapRef.current && viewportWidth < 768) {
      didInitialSnapRef.current = true;
      snapToPortal(0);
    }
  }, [isPhone, viewportWidth, snapToPortal]);

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

    commitScroll(nextX);
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
      kickSpring();
    }
  };

  // Smooth Wheel Panning with spring target nudge
  const handleWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const max = maxScrollRef.current;
    targetXRef.current = Math.max(0, Math.min(max, targetXRef.current + delta * 1.15));
    kickSpring();
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
  const centreIndex = nearestPortalIndex(scrollX);
  const centrePortal = PORTALS_DATA[centreIndex];

  const getTimePhaseIcon = (phase: TimePhase) => {
    const cls = 'w-4 h-4';
    switch (phase) {
      case 'dawn':
        return <Sunrise className={cls} aria-hidden="true" />;
      case 'day':
        return <Sun className={cls} aria-hidden="true" />;
      case 'dusk':
        return <Sunset className={cls} aria-hidden="true" />;
      case 'night':
        return <Moon className={cls} aria-hidden="true" />;
    }
  };

  // Path connecting the portals: one thin dashed line in the site accent (no multi-colour
  // gradient, no glow filter, no animation)
  const leyLineSplinePath = useMemo(() => {
    const nodes = PORTALS_DATA.map((p) => ({ x: p.x, y: (p.yPercent / 100) * stageHeight }));
    if (nodes.length < 2) return '';
    let d = `M ${nodes[0].x} ${nodes[0].y}`;
    for (let i = 0; i < nodes.length - 1; i++) {
      const p1 = nodes[i];
      const p2 = nodes[i + 1];
      const dx = p2.x - p1.x;
      d += ` C ${p1.x + dx * 0.5} ${p1.y}, ${p2.x - dx * 0.5} ${p2.y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [stageHeight]);

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-[#05070c] select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onClickCapture={handleClickCapture}
      style={{ cursor: isDraggingState ? 'grabbing' : 'grab', touchAction: 'none' }}
    >
      <ParallaxBackground scrollX={scrollX} stageWidth={STAGE_WIDTH} timePhase={timePhase} />

      {/* Scrollable viewport driven by the spring camera */}
      <div ref={containerRef} className="w-full h-full overflow-hidden no-scrollbar relative z-10">
        <div className="relative h-full pointer-events-none" style={{ width: `${STAGE_WIDTH}px` }}>
          <svg
            className="absolute inset-0 pointer-events-none z-10 overflow-visible"
            width={STAGE_WIDTH}
            height={stageHeight}
            style={{ width: `${STAGE_WIDTH}px`, height: `${stageHeight}px` }}
            aria-hidden="true"
          >
            <path
              d={leyLineSplinePath}
              fill="none"
              stroke="var(--ap-accent)"
              strokeOpacity="0.35"
              strokeWidth="1.5"
              strokeDasharray="2 8"
              strokeLinecap="round"
            />
            {PORTALS_DATA.map((p) => (
              <circle
                key={`node-${p.id}`}
                cx={p.x}
                cy={(p.yPercent / 100) * stageHeight}
                r="3"
                fill={p.targetUrl ? 'var(--ap-accent)' : 'rgba(255,255,255,0.35)'}
              />
            ))}
          </svg>

          {PORTALS_DATA.map((portal) => (
            <div key={portal.id} className="pointer-events-auto">
              <PortalComponent
                portal={portal}
                lang={lang}
                onSelect={onSelectPortal}
                isHovered={activePortalId === portal.id}
                onHoverChange={onHoverPortal}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Time of day: a single chip by default; expands into a small panel on demand */}
      <div className="absolute top-4 right-4 md:right-6 z-40">
        {isHudOpen ? (
          <div className="ap-panel p-3 flex flex-col gap-3 w-[248px]" role="group" aria-label={UI.timeOfDay[lang]}>
            <div className="flex items-center justify-between gap-2">
              <span className="ap-caption">{UI.timeOfDay[lang]}</span>
              <button
                type="button"
                onClick={() => setIsHudOpen(false)}
                className="ap-chip ap-chip--icon"
                title={UI.closeHud[lang]}
                aria-label={UI.closeHud[lang]}
              >
                <ChevronUp className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {CYCLE_ORDER.map((phase) => (
                <button
                  key={phase}
                  type="button"
                  onClick={() => handlePhaseSelect(phase)}
                  aria-pressed={timePhase === phase}
                  className="ap-chip ap-chip--icon !w-full"
                  title={UI.phase[phase][lang]}
                  aria-label={UI.phase[phase][lang]}
                >
                  {getTimePhaseIcon(phase)}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsAutoCycling(!isAutoCycling)}
              aria-pressed={isAutoCycling}
              className="ap-chip !justify-start"
              title={isAutoCycling ? UI.pauseCycle[lang] : UI.resumeCycle[lang]}
            >
              {isAutoCycling ? <Pause className="w-4 h-4" aria-hidden="true" /> : <Play className="w-4 h-4" aria-hidden="true" />}
              <span>{UI.autoCycle[lang]}</span>
            </button>
            {isAutoCycling && (
              <div className="h-0.5 w-full rounded-full bg-[var(--ap-fill)] overflow-hidden" aria-hidden="true">
                <div
                  className="h-full w-full origin-left bg-[var(--ap-accent)] transition-transform duration-200 ease-linear"
                  style={{ transform: `scaleX(${cycleProgress / 100})` }}
                />
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsHudOpen(true)}
            className="ap-chip"
            title={UI.openHud[lang]}
            aria-label={`${UI.timeOfDay[lang]}: ${UI.phase[timePhase][lang]}`}
            aria-expanded={false}
          >
            {getTimePhaseIcon(timePhase)}
            <span className="hidden sm:inline">{UI.phase[timePhase][lang]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--ap-text-muted)]" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Side arrows (desktop: pan a screen; phone: previous / next portal) */}
      <button
        type="button"
        onClick={panLeft}
        disabled={!canScrollLeft}
        className="ap-chip ap-chip--lg ap-chip--icon absolute left-4 top-1/2 -translate-y-1/2 z-40"
        aria-label={UI.panLeft[lang]}
        title={UI.panLeft[lang]}
      >
        <ChevronLeft className="w-5 h-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={panRight}
        disabled={!canScrollRight}
        className="ap-chip ap-chip--lg ap-chip--icon absolute right-4 top-1/2 -translate-y-1/2 z-40"
        aria-label={UI.panRight[lang]}
        title={UI.panRight[lang]}
      >
        <ChevronRight className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Bottom: phone = current portal card + dots; desktop = minimap */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-32px)] max-w-xl flex flex-col gap-2">
        {isPhone && (
          <div className="ap-panel px-4 py-3 flex items-center gap-3">
            <span className="font-fantasy text-base text-[var(--ap-text-muted)]" aria-hidden="true">
              {centrePortal.signpost.runeSymbol}
            </span>
            <div className="flex-1 min-w-0">
              <div className="ap-title truncate">
                {centrePortal.targetUrl ? centrePortal.destination?.[lang] : centrePortal.name[lang]}
              </div>
              <div className="ap-caption truncate">
                {centrePortal.targetUrl ? centrePortal.name[lang] : UI.sealed[lang]} · {centreIndex + 1}/{PORTALS_DATA.length}
              </div>
            </div>
            {centrePortal.targetUrl ? (
              <button type="button" onClick={() => onSelectPortal(centrePortal)} className="ap-btn-primary !h-9 !px-4">
                {UI.enter[lang]}
              </button>
            ) : (
              <span className="ap-caption">{UI.sealed[lang]}</span>
            )}
          </div>
        )}

        <div className="ap-panel px-4 py-2 flex flex-col gap-1">
          <div className="relative h-5 w-full">
            {/* Viewport indicator */}
            <div
              className="absolute top-0 bottom-0 rounded-full border border-[var(--ap-border-strong)] bg-[var(--ap-fill)] pointer-events-none"
              style={{
                left: `${(scrollX / STAGE_WIDTH) * 100}%`,
                width: `${(viewportWidth / STAGE_WIDTH) * 100}%`,
              }}
            />
            {PORTALS_DATA.map((p, i) => {
              const isActive = activePortalId === p.id || (isPhone && i === centreIndex);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    wonderlandAudio.playNavClick();
                    snapToPortal(i);
                  }}
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center cursor-pointer"
                  style={{ left: `${(p.x / STAGE_WIDTH) * 100}%` }}
                  title={fmt(UI.jumpTo[lang], { name: p.name[lang] })}
                  aria-label={fmt(UI.jumpTo[lang], { name: p.name[lang] })}
                >
                  <span
                    className="block rounded-full transition-all duration-150"
                    style={{
                      width: isActive ? 10 : 6,
                      height: isActive ? 10 : 6,
                      background: isActive
                        ? 'var(--ap-accent)'
                        : p.targetUrl
                        ? 'rgba(255,255,255,0.7)'
                        : 'rgba(255,255,255,0.3)',
                    }}
                  />
                </button>
              );
            })}
          </div>
          <div className="hidden sm:block ap-caption text-center">{UI.minimapHint[lang]}</div>
          {isPhone && <div className="ap-caption text-center">{UI.swipeHint[lang]}</div>}
        </div>
      </div>
    </div>
  );
};
