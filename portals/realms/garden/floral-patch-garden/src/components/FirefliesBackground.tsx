import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  decay: number;
  color: string;
  speedFactor: number;
}

interface Raindrop {
  x: number;
  y: number;
  vy: number;
  length: number;
  alpha: number;
}

interface Snowflake {
  x: number;
  y: number;
  r: number;
  d: number;
  vy: number;
  vx: number;
  alpha: number;
}

interface AutumnLeaf {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  spinSpeed: number;
  size: number;
  alpha: number;
  colorStr: string;
}

interface MysticSpore {
  x: number;
  y: number;
  r: number;
  angle: number;
  speed: number;
  amplitude: number;
  alpha: number;
  color: string;
}

interface FirefliesBackgroundProps {
  weather: "sunny" | "rainy" | "snowy" | "mystic" | "autumn";
}

export const FirefliesBackground: React.FC<FirefliesBackgroundProps> = ({ weather }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const weatherRef = useRef(weather);

  useEffect(() => {
    weatherRef.current = weather;
  }, [weather]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particle: Particle[] = [];
    const particleCount = 45;

    const colors = [
      "rgba(16, 185, 129, ",   // Emerald
      "rgba(52, 211, 153, ",   // Light emerald
      "rgba(245, 158, 11, ",   // Amber
      "rgba(20, 184, 166, ",   // Teal
      "rgba(139, 92, 246, "    // Purple
    ];

    const createParticle = (initRandom = false): Particle => {
      const radius = Math.random() * 2 + 1;
      return {
        x: Math.random() * width,
        y: initRandom ? Math.random() * height : height + 10,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.6 - 0.2,
        radius,
        alpha: Math.random() * 0.4 + 0.2,
        decay: Math.random() * 0.002 + 0.001,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedFactor: Math.random() * 1.5 + 0.5
      };
    };

    // Initialize particle
    for (let i = 0; i < particleCount; i++) {
      particle.push(createParticle(true));
    }

    // Initialize raindrops
    const raindrops: Raindrop[] = [];
    const raindropCount = 70;
    for (let i = 0; i < raindropCount; i++) {
      raindrops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vy: Math.random() * 6 + 8,
        length: Math.random() * 15 + 12,
        alpha: Math.random() * 0.15 + 0.05
      });
    }

    // Initialize snowflakes
    const snowflakes: Snowflake[] = [];
    const snowflakeCount = 65;
    for (let i = 0; i < snowflakeCount; i++) {
      snowflakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.5 + 1,
        d: Math.random() * 100,
        vy: Math.random() * 0.8 + 0.5,
        vx: Math.random() * 0.5 - 0.25,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    // Initialize mystic spores
    const mysticSpores: MysticSpore[] = [];
    const mysticCount = 40;
    const mysticColors = [
      "rgba(168, 85, 247, ",  // Celestial Purple
      "rgba(236, 72, 153, ",  // Velvet Pink
      "rgba(6, 182, 212, ",   // Cyan Nebula
      "rgba(99, 102, 241, "   // Indigo Dawn
    ];
    for (let i = 0; i < mysticCount; i++) {
      mysticSpores.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 3 + 1.5,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.6 + 0.4,
        amplitude: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.6 + 0.3,
        color: mysticColors[Math.floor(Math.random() * mysticColors.length)]
      });
    }

    // Initialize autumn falling leaves
    const autumnLeaves: AutumnLeaf[] = [];
    const leafCount = 30;
    const leafColors = [
      "224, 76, 26",   // Maple orange-red
      "245, 158, 11",  // Warm amber
      "217, 119, 6",   // Copper brown
      "180, 83, 9"     // Crimson rust
    ];
    for (let i = 0; i < leafCount; i++) {
      autumnLeaves.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.random() * 0.6 - 0.2, // Drifting slight rightward wind
        vy: Math.random() * 0.7 + 0.4,  // Falling speed
        angle: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.015 + 0.005,
        size: Math.random() * 6 + 7, // Leaf size radius
        alpha: Math.random() * 0.6 + 0.3,
        colorStr: leafColors[Math.floor(Math.random() * leafColors.length)]
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const currentWeather = weatherRef.current;

      // 1. Draw Rain (Active on "rainy")
      if (currentWeather === "rainy") {
        raindrops.forEach((r) => {
          r.y += r.vy;
          r.x += (Math.random() - 0.5) * 0.2;
          
          if (r.y > height) {
            r.y = -20;
            r.x = Math.random() * width;
          }

          ctx.beginPath();
          ctx.strokeStyle = `rgba(186, 230, 253, ${r.alpha})`; // Elegant sky-blue droplets
          ctx.lineWidth = 0.85;
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.x + (r.vy * 0.015), r.y + r.length);
          ctx.stroke();
        });
      }

      // 2. Draw Gentle Snow (Active on "snowy")
      if (currentWeather === "snowy") {
        snowflakes.forEach((s) => {
          s.y += s.vy;
          s.x += s.vx + Math.sin(s.d) * 0.15;
          s.d += 0.01;

          if (s.y > height) {
            s.y = -10;
            s.x = Math.random() * width;
          }

          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 3. Draw Mystic Plasma Spores (Active on "mystic")
      if (currentWeather === "mystic") {
        mysticSpores.forEach((m) => {
          m.x -= m.speed; // Drift leftwards smoothly
          m.y += Math.sin(m.angle) * m.amplitude;
          m.angle += 0.02;

          if (m.x < -20) {
            m.x = width + 20;
            m.y = Math.random() * height;
          }

          ctx.beginPath();
          const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 4.5);
          grad.addColorStop(0, `${m.color}${m.alpha})`);
          grad.addColorStop(0.4, `${m.color}${m.alpha * 0.4})`);
          grad.addColorStop(1, `${m.color}0)`);
          
          ctx.fillStyle = grad;
          ctx.arc(m.x, m.y, m.r * 4.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 3.5 Draw Spinning Falling Autumn Leaves (Active on "autumn")
      if (currentWeather === "autumn") {
        autumnLeaves.forEach((leaf) => {
          leaf.y += leaf.vy;
          leaf.x += leaf.vx + Math.sin(leaf.angle) * 0.2;
          leaf.angle += leaf.spinSpeed;

          if (leaf.y > height + 20) {
            leaf.y = -20;
            leaf.x = Math.random() * width;
          }

          ctx.save();
          ctx.translate(leaf.x, leaf.y);
          ctx.rotate(leaf.angle);
          
          // Draw a lovely pointed dual-curve autumn leaf outline
          ctx.beginPath();
          ctx.fillStyle = `rgba(${leaf.colorStr}, ${leaf.alpha})`;
          ctx.moveTo(0, -leaf.size);
          ctx.quadraticCurveTo(leaf.size * 0.6, -leaf.size * 0.2, 0, leaf.size);
          ctx.quadraticCurveTo(-leaf.size * 0.6, -leaf.size * 0.2, 0, -leaf.size);
          ctx.fill();
          
          // Tiny leaf stem midline
          ctx.beginPath();
          ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
          ctx.lineWidth = 1;
          ctx.moveTo(0, -leaf.size);
          ctx.lineTo(0, leaf.size * 1.2);
          ctx.stroke();

          ctx.restore();
        });
      }

      // 4. Draw Standard Bioluminescent Spores (Always active but tinted/adjusted based on weather)
      particle.forEach((p, idx) => {
        p.y += p.vy * p.speedFactor;
        p.x += p.vx;

        // Attract to mouse
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        if (mx > 0 && my > 0) {
          const dx = mx - p.x;
          const dy = my - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 250) {
            // Sunny geometric connection lines
            if (distance < 120 && idx % 3 === 0 && currentWeather === "sunny") {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(mx, my);
              ctx.strokeStyle = `${p.color}${(1 - distance / 120) * 0.08})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }

            // Normal soft attraction
            const force = (250 - distance) / 250;
            p.x += (dx / distance) * force * 0.7;
            p.y += (dy / distance) * force * 0.7;
          }
        }

        let renderAlpha = p.alpha;
        let pColor = p.color;

        if (currentWeather === "rainy") {
          renderAlpha *= 0.35; // Faint glow in rainy forest
          pColor = "rgba(56, 189, 248, "; // Blue-tint spores
        } else if (currentWeather === "snowy") {
          renderAlpha *= 0.45; // Soft dimmer violet/white spores for frosty snowfields
          pColor = "rgba(167, 139, 250, "; 
        } else if (currentWeather === "mystic") {
          renderAlpha *= 0.8; // Atmospheric cosmic spores
          pColor = "rgba(232, 121, 249, "; // Cosmic magenta hue
        } else if (currentWeather === "autumn") {
          renderAlpha *= 1.1; // Cozy warm copper/rust embers
          pColor = "rgba(244, 107, 24, "; 
        } else {
          renderAlpha *= 1.3; // Full beautiful shiny gold/green on Sunny days
        }

        ctx.beginPath();
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3.5);
        grad.addColorStop(0, `${pColor}${renderAlpha})`);
        grad.addColorStop(0.5, `${pColor}${renderAlpha * 0.35})`);
        grad.addColorStop(1, `${pColor}0)`);
        
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.radius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Recycle
        if (p.y < -20 || p.x < -20 || p.x > width + 20) {
          particle[idx] = createParticle(false);
          particle[idx].y = height + 10;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: "screen" }}
    />
  );
};
