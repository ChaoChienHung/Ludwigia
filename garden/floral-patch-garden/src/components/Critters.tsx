import React, { useState, useEffect, useRef } from "react";

interface Critter {
  id: number;
  type: "butterfly" | "firefly";
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  speed: number; // speed per frame (percentage)
  angle: number; // heading direction in radians
  color: string;
  size: number;
  wingPhase: number; // timing trigger for wing flap waves
}

interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  alpha: number;
  vy: number;
}

export const Critters: React.FC = () => {
  const [critters, setCritters] = useState<Critter[]>([]);
  const [sparkles, setSparkles] = useState<SparkleParticle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  // Initialize four serene, majestic aesthetic creatures
  useEffect(() => {
    const list: Critter[] = [
      {
        id: ++nextId.current,
        type: "butterfly",
        x: 20,
        y: 35,
        speed: 0.008, // Slow, peaceful drift
        angle: 0.8, // Radians
        color: "from-cyan-400 via-sky-400 to-indigo-500",
        size: 38,
        wingPhase: Math.random() * 10
      },
      {
        id: ++nextId.current,
        type: "butterfly",
        x: 80,
        y: 25,
        speed: 0.007,
        angle: 3.4,
        color: "from-pink-400 via-fuchsia-400 to-purple-500",
        size: 36,
        wingPhase: Math.random() * 10
      },
      {
        id: ++nextId.current,
        type: "firefly",
        x: 35,
        y: 75,
        speed: 0.009,
        angle: 4.8,
        color: "from-lime-400 to-emerald-500",
        size: 30,
        wingPhase: Math.random() * 10
      },
      {
        id: ++nextId.current,
        type: "firefly",
        x: 70,
        y: 60,
        speed: 0.008,
        angle: 2.1,
        color: "from-amber-400 to-orange-500",
        size: 28,
        wingPhase: Math.random() * 10
      }
    ];
    setCritters(list);
  }, []);

  // Soft continuous frame ticker (no bouncing, smooth central attraction + steering)
  useEffect(() => {
    let animFrame: number;
    const tick = () => {
      // 1. Update insects kinematics
      setCritters((prev) =>
        prev.map((c) => {
          // Increase wave movement phase
          const nextPhase = c.wingPhase + 0.04; // Slower phase increments

          // Silky smooth wandering steering using harmonic waves instead of noisy random jitter
          const wanderForce = Math.sin(nextPhase * 0.12) * 0.006;
          let nextAngle = c.angle + wanderForce;

          // Soft vector attraction back to the center of the garden to avoid drifting out of bounds
          const targetX = 50;
          const targetY = 48;
          const dx = targetX - c.x;
          const dy = targetY - c.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 30) {
            const angleToCenter = Math.atan2(dy, dx);
            let diff = angleToCenter - nextAngle;
            // Normalize angular difference mapping onto [-PI, PI]
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            
            // Extremely gentle guidance scalar to steer slowly towards center
            nextAngle += diff * 0.005;
          }

          // Compute exact velocities based on the exact polar angle heading
          const vx = Math.cos(nextAngle) * c.speed;
          const vy = Math.sin(nextAngle) * c.speed;

          const nx = c.x + vx;
          const ny = c.y + vy;

          // Spark trail creation
          if (Math.random() < 0.02) {
            setSparkles((old) => [
              ...old,
              {
                id: ++nextId.current,
                x: nx + (Math.random() - 0.5) * 0.8,
                y: ny + (Math.random() - 0.5) * 0.8,
                size: Math.random() * 2 + 1.2,
                color: c.type === "butterfly" 
                  ? (c.color.includes("pink") ? "rgba(244,114,182,0.4)" : "rgba(34,211,238,0.4)")
                  : (c.color.includes("amber") ? "rgba(245,158,11,0.4)" : "rgba(163,230,53,0.4)"),
                alpha: 0.8,
                vy: Math.random() * 0.06 + 0.02
              }
            ]);
          }

          return {
            ...c,
            x: nx,
            y: ny,
            angle: nextAngle,
            wingPhase: nextPhase
          };
        })
      );

      // 2. Purely passive spark drift physical engine
      setSparkles((prev) =>
        prev
          .map((p) => ({
            ...p,
            y: p.y + p.vy,
            alpha: p.alpha - 0.008
          }))
          .filter((p) => p.alpha > 0)
      );

      animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-x-0 top-16 bottom-16 pointer-events-none z-10 select-none overflow-hidden">
      {/* Invisible SVG definition holder for delicate insect gradients */}
      <svg className="absolute w-0 h-0 pointer-events-none" style={{ visibility: "hidden" }}>
        <defs>
          <linearGradient id="butterfly-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="butterfly-pink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#e879f9" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.35" />
          </linearGradient>
        </defs>
      </svg>

      {/* 1. Dust & Stars sparkling background */}
      {sparkles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none transition-opacity duration-100 ease-out shadow-[0_0_5px_currentColor]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            color: p.color,
            opacity: p.alpha,
            transform: "translate(-50%, -50%)"
          }}
        />
      ))}

      {/* 2. Delicate passive decoration insect components */}
      {critters.map((c) => {
        // Derive exact direction to rotate (SVG defaults facing UP at 0 degrees)
        const rotationDegrees = c.angle * (180 / Math.PI) + 90;
        
        // Butterfly wing-flap animation synced to its own phase cycle
        const isLeftWingClosed = Math.sin(c.wingPhase) > 0.1;

        return (
          <div
            key={c.id}
            className="absolute pointer-events-none"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: `${c.size}px`,
              height: `${c.size}px`,
              transform: `translate(-50%, -50%) rotate(${rotationDegrees}deg)`
            }}
          >
            {c.type === "butterfly" ? (
              // Realistic Fluttering Bioluminescent Butterfly
              <div className="relative w-full h-full flex items-center justify-center pointer-events-none" style={{ perspective: "800px" }}>
                {/* Glowing Aura Ring */}
                <div className="absolute inset-0 bg-cyan-500/5 rounded-full filter blur-md"></div>
                
                {/* Left Wing */}
                <div
                  className="absolute right-[50%] w-[48%] h-[92%] origin-right transition-transform duration-100 ease-in-out"
                  style={{
                    transform: isLeftWingClosed ? "rotateY(-70deg)" : "rotateY(-10deg)",
                    transformStyle: "preserve-3d"
                  }}
                >
                  <svg viewBox="0 0 40 60" className="w-full h-full drop-shadow-[0_0_3px_rgba(34,211,238,0.45)]">
                    <path
                      d="M 40 30 C 25 -2, 4 5, 8 22 C 10 32, 28 32, 40 30 C 28 35, 12 36, 12 48 C 12 58, 28 55, 40 30"
                      fill={c.color.includes("pink") ? "url(#butterfly-pink)" : "url(#butterfly-cyan)"}
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="0.8"
                    />
                    <ellipse cx="25" cy="18" rx="4" ry="6" fill="#ffffff" opacity="0.25" />
                    <circle cx="18" cy="40" r="2" fill="#ffffff" opacity="0.3" />
                  </svg>
                </div>

                {/* Right Wing */}
                <div
                  className="absolute left-[50%] w-[48%] h-[92%] origin-left transition-transform duration-100 ease-in-out"
                  style={{
                    transform: isLeftWingClosed ? "rotateY(70deg)" : "rotateY(10deg)",
                    transformStyle: "preserve-3d"
                  }}
                >
                  <svg viewBox="0 0 40 60" className="w-full h-full scale-x-[-1] drop-shadow-[0_0_3px_rgba(34,211,238,0.45)]">
                    <path
                      d="M 40 30 C 25 -2, 4 5, 8 22 C 10 32, 28 32, 40 30 C 28 35, 12 36, 12 48 C 12 58, 28 55, 40 30"
                      fill={c.color.includes("pink") ? "url(#butterfly-pink)" : "url(#butterfly-cyan)"}
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="0.8"
                    />
                    <ellipse cx="25" cy="18" rx="4" ry="6" fill="#ffffff" opacity="0.25" />
                    <circle cx="18" cy="40" r="2" fill="#ffffff" opacity="0.3" />
                  </svg>
                </div>

                {/* Slender Insect Body */}
                <div className="absolute w-[11%] h-[75%] bg-zinc-950 rounded-full border border-white/10 shadow-[0_0_5px_rgba(34,211,238,0.3)] flex flex-col items-center justify-between py-1 relative z-10">
                  <span className="w-1 h-1 rounded-full bg-cyan-400/50 animate-ping absolute -top-0.5" />
                </div>
              </div>
            ) : (
              // Realistic Bioluminescent Gold / Emerald Firefly (金色流螢)
              <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
                {/* Luminous tail lantern glow trailing below */}
                <div className="absolute bottom-0 w-6 h-6 rounded-full bg-lime-400/10 blur-sm animate-pulse"></div>
                
                {/* Gliding wings structure */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Left wing - pivots from thorax (origin-top-right) and sweeps backward */}
                  <div 
                    className="absolute w-[14%] h-[52%] bg-lime-100/20 border border-lime-300/20 rounded-full origin-top-right transition-transform duration-100"
                    style={{
                      transform: isLeftWingClosed 
                        ? "rotate(-12deg) scaleX(0.95)" 
                        : "rotate(-28deg) scaleX(0.85)",
                      right: "50%",
                      top: "26%"
                    }} 
                  />
                  {/* Right wing - pivots from thorax (origin-top-left) and sweeps backward */}
                  <div 
                    className="absolute w-[14%] h-[52%] bg-lime-100/20 border border-lime-300/20 rounded-full origin-top-left transition-transform duration-100"
                    style={{
                      transform: isLeftWingClosed 
                        ? "rotate(12deg) scaleX(0.95)" 
                        : "rotate(28deg) scaleX(0.85)",
                      left: "50%",
                      top: "26%"
                    }} 
                  />
                </div>

                {/* Slender realistic body */}
                <div className="relative w-[18%] h-[75%] flex flex-col items-center">
                  {/* Tiny Insect Antennae */}
                  <div className="absolute -top-1.5 flex justify-between w-2.5 h-1.5 block">
                    <div className="w-[1px] h-1.5 bg-neutral-700 origin-bottom rotate-[-20deg]"></div>
                    <div className="w-[1px] h-1.5 bg-neutral-700 origin-bottom rotate-[20deg]"></div>
                  </div>
                  
                  {/* Insect head & core eyes */}
                  <div className="w-full h-[20%] bg-zinc-900 rounded-t-full border border-neutral-800 flex justify-between px-0.5 items-center relative z-10">
                    <div className="w-0.5 h-0.5 rounded-full bg-lime-400/60" />
                    <div className="w-0.5 h-0.5 rounded-full bg-lime-400/60" />
                  </div>
                  
                  {/* Thorax segments */}
                  <div className="w-full h-[35%] bg-zinc-950 border-x border-neutral-800 rounded-b-sm relative z-10"></div>
                  
                  {/* Bioluminescent abdomen segment (pulsing bottom lantern at rear) */}
                  <div className="w-[85%] h-[45%] bg-gradient-to-b from-zinc-950 via-lime-950 to-lime-300/80 rounded-b-full border border-lime-400/20 shadow-[0_0_10px_#a3e635] flex items-end justify-center relative z-10 overflow-hidden">
                    <div className="w-full h-1/2 bg-gradient-to-t from-lime-300 to-lime-400 animate-ping absolute rounded-full opacity-40"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
