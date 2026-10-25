// ============================================================================
// Ludwigia World Models — 3D Isometric Architectural Geometry & Furniture
// ============================================================================

(function(window) {
  'use strict';

  const {
    isoToScreen,
    HOUSE_MAX_X, HOUSE_MAX_Y,
    DORM_MIN_X, DORM_MAX_X, DORM_MIN_Y, DORM_MAX_Y,
    AI_MIN_X, AI_MAX_X, AI_MIN_Y, AI_MAX_Y
  } = window.LudwigWorldEngine;

  class WorldModels {
    constructor(world) {
      this.world = world;
    }

    // --- Isometric 3D Solid Box Primitive ---
    drawBox(ctx, gx, gy, gz, dx, dy, dz, topCol, leftCol, rightCol, ox, oy) {
      const b0 = isoToScreen(gx, gy, gz, ox, oy);
      const b1 = isoToScreen(gx + dx, gy, gz, ox, oy);
      const b2 = isoToScreen(gx + dx, gy + dy, gz, ox, oy);
      const b3 = isoToScreen(gx, gy + dy, gz, ox, oy);

      const t0 = isoToScreen(gx, gy, gz + dz, ox, oy);
      const t1 = isoToScreen(gx + dx, gy, gz + dz, ox, oy);
      const t2 = isoToScreen(gx + dx, gy + dy, gz + dz, ox, oy);
      const t3 = isoToScreen(gx, gy + dy, gz + dz, ox, oy);

      // Left Face
      if (leftCol) {
        ctx.fillStyle = leftCol;
        ctx.beginPath();
        ctx.moveTo(b0.x, b0.y); ctx.lineTo(b3.x, b3.y); ctx.lineTo(t3.x, t3.y); ctx.lineTo(t0.x, t0.y);
        ctx.closePath();
        ctx.fill();
      }

      // Right Face
      if (rightCol) {
        ctx.fillStyle = rightCol;
        ctx.beginPath();
        ctx.moveTo(b3.x, b3.y); ctx.lineTo(b2.x, b2.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(t3.x, t3.y);
        ctx.closePath();
        ctx.fill();
      }

      // Top Face
      if (topCol) {
        ctx.fillStyle = topCol;
        ctx.beginPath();
        ctx.moveTo(t0.x, t0.y); ctx.lineTo(t1.x, t1.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(t3.x, t3.y);
        ctx.closePath();
        ctx.fill();
      }
    }

    // --- Modern Japanese-Inspired Terrace Railing along South Garden ---
    drawPorchRailing(ctx, gx, gy, len, ox, oy) {
      const H = 0.55;
      const b0 = isoToScreen(gx, gy, 0, ox, oy);
      const b1 = isoToScreen(gx + len, gy, 0, ox, oy);
      const t0 = isoToScreen(gx, gy, H, ox, oy);
      const t1 = isoToScreen(gx + len, gy, H, ox, oy);

      // Glass / Frosted translucent pane
      ctx.fillStyle = 'rgba(224, 242, 254, 0.4)';
      ctx.beginPath();
      ctx.moveTo(b0.x, b0.y); ctx.lineTo(b1.x, b1.y); ctx.lineTo(t1.x, t1.y); ctx.lineTo(t0.x, t0.y);
      ctx.closePath();
      ctx.fill();

      // Top warm cedar handrail
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(t0.x, t0.y); ctx.lineTo(t1.x, t1.y);
      ctx.stroke();

      // Bottom baseboard
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(b0.x, b0.y); ctx.lineTo(b1.x, b1.y);
      ctx.stroke();

      // Balusters
      ctx.strokeStyle = 'rgba(120, 53, 15, 0.65)';
      ctx.lineWidth = 1.5;
      for (let x = gx + 0.8; x < gx + len - 0.2; x += 0.8) {
        const bp = isoToScreen(x, gy, 0, ox, oy);
        const tp = isoToScreen(x, gy, H, ox, oy);
        ctx.beginPath();
        ctx.moveTo(bp.x, bp.y); ctx.lineTo(tp.x, tp.y);
        ctx.stroke();
      }
    }

    // ========================================================================
    // 1. ZONE 1: LUDWIG'S HOUSE INTERIOR FURNITURE
    // ========================================================================

    // --- Master Bed with Double Pillows & Nightstand (x: 1, y: 1) ---
    drawMasterBed(ctx, gx, gy, ox, oy) {
      // Wood Platform Base
      this.drawBox(ctx, gx, gy, 0, 2.1, 2.3, 0.32, '#854d0e', '#713f12', '#582b0c', ox, oy);
      // Tall Headboard
      this.drawBox(ctx, gx, gy, 0.32, 0.25, 2.3, 1.15, '#713f12', '#582b0c', '#3f1d08', ox, oy);
      // Thick Mattress
      this.drawBox(ctx, gx + 0.25, gy + 0.08, 0.32, 1.80, 2.14, 0.28, '#f1f5f9', '#cbd5e1', '#94a3b8', ox, oy);
      // Navy Quilt Duvet
      this.drawBox(ctx, gx + 0.75, gy + 0.08, 0.38, 1.30, 2.14, 0.25, '#1e3a8a', '#1e40af', '#172554', ox, oy);
      // Double Fluffy Pillows
      this.drawBox(ctx, gx + 0.32, gy + 0.25, 0.60, 0.38, 0.75, 0.12, '#ffffff', '#e2e8f0', '#cbd5e1', ox, oy);
      this.drawBox(ctx, gx + 0.32, gy + 1.25, 0.60, 0.38, 0.75, 0.12, '#ffffff', '#e2e8f0', '#cbd5e1', ox, oy);

      // Nightstand with warm lamp
      this.drawBox(ctx, gx, gy + 2.35, 0, 0.65, 0.65, 0.50, '#92400e', '#78350f', '#58240a', ox, oy);
      const lp = isoToScreen(gx + 0.32, gy + 2.65, 0.75, ox, oy);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(lp.x, lp.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Developer Desk with Aligned Anglepoise Lamp & Displays (x: 6, y: 1) ---
    drawDeveloperDesk(ctx, gx, gy, ox, oy) {
      // 1. Desk Base & Tabletop (gx: 6.0, gy: 1.0, w: 2.5, d: 1.2, H: 0.72)
      // Solid Oak Tabletop
      this.drawBox(ctx, gx, gy, 0, 2.5, 1.2, 0.72, '#92400e', '#78350f', '#58240a', ox, oy);

      // 2. Premium Charcoal Leather Desk Mat (properly centered on table)
      const matGx = gx + 0.45;
      const matGy = gy + 0.25;
      const matW = 1.60;
      const matD = 0.75;
      const matZ = 0.725;
      const m0 = isoToScreen(matGx, matGy, matZ, ox, oy);
      const m1 = isoToScreen(matGx + matW, matGy, matZ, ox, oy);
      const m2 = isoToScreen(matGx + matW, matGy + matD, matZ, ox, oy);
      const m3 = isoToScreen(matGx, matGy + matD, matZ, ox, oy);
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(m0.x, m0.y); ctx.lineTo(m1.x, m1.y); ctx.lineTo(m2.x, m2.y); ctx.lineTo(m3.x, m3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 3. 75% Mechanical Keyboard on the Mat
      this.drawBox(ctx, gx + 0.85, gy + 0.62, 0.73, 0.80, 0.28, 0.035, '#0f172a', '#1e293b', '#334155', ox, oy);
      // Keycap Backlit Rows
      const kbP = isoToScreen(gx + 1.25, gy + 0.76, 0.765, ox, oy);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.fillRect(kbP.x - 12, kbP.y - 2, 24, 2);
      ctx.fillRect(kbP.x - 10, kbP.y + 2, 20, 2);

      // 4. Primary Developer Laptop (Open on desk mat facing forward)
      const lapX = gx + 0.80;
      const lapY = gy + 0.35;
      // Laptop Base
      this.drawBox(ctx, lapX, lapY, 0.73, 0.75, 0.32, 0.025, '#94a3b8', '#64748b', '#475569', ox, oy);
      // Laptop Open Screen (Vertical at z = 0.75 to 1.15)
      const ls0 = isoToScreen(lapX, lapY, 0.75, ox, oy);
      const ls1 = isoToScreen(lapX + 0.75, lapY, 0.75, ox, oy);
      const ls2 = isoToScreen(lapX + 0.75, lapY, 1.15, ox, oy);
      const ls3 = isoToScreen(lapX, lapY, 1.15, ox, oy);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(ls0.x, ls0.y); ctx.lineTo(ls1.x, ls1.y); ctx.lineTo(ls2.x, ls2.y); ctx.lineTo(ls3.x, ls3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Glowing IDE Lines on Laptop Screen
      const lpC = isoToScreen(lapX + 0.37, lapY, 0.95, ox, oy);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(lpC.x - 12, lpC.y - 8, 22, 2);
      ctx.fillRect(lpC.x - 8, lpC.y - 4, 16, 2);
      ctx.fillStyle = '#34d399';
      ctx.fillRect(lpC.x - 12, lpC.y, 20, 2);
      ctx.fillRect(lpC.x - 6, lpC.y + 4, 14, 2);

      // 5. Secondary Ultrawide Monitor (Stands firmly on aluminum stand on right side of desk)
      const monStandX = gx + 1.85;
      const monStandY = gy + 0.25;
      // Monitor Stand Pole
      this.drawBox(ctx, monStandX + 0.25, monStandY + 0.1, 0.73, 0.12, 0.12, 0.30, '#cbd5e1', '#94a3b8', '#64748b', ox, oy);
      // Monitor Screen Frame (z = 0.92 to 1.35)
      const ms0 = isoToScreen(monStandX, monStandY, 0.92, ox, oy);
      const ms1 = isoToScreen(monStandX + 0.65, monStandY, 0.92, ox, oy);
      const ms2 = isoToScreen(monStandX + 0.65, monStandY, 1.35, ox, oy);
      const ms3 = isoToScreen(monStandX, monStandY, 1.35, ox, oy);
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.moveTo(ms0.x, ms0.y); ctx.lineTo(ms1.x, ms1.y); ctx.lineTo(ms2.x, ms2.y); ctx.lineTo(ms3.x, ms3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Mon Visualizer Lines
      const msC = isoToScreen(monStandX + 0.32, monStandY, 1.12, ox, oy);
      ctx.fillStyle = '#818cf8';
      ctx.fillRect(msC.x - 10, msC.y - 6, 18, 2);
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(msC.x - 7, msC.y - 2, 14, 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(msC.x - 10, msC.y + 3, 16, 2);

      // 6. Architect Anglepoise Desk Lamp (Stable on back-left desk corner at gx + 0.15, gy + 0.15)
      const lampBaseX = gx + 0.22;
      const lampBaseY = gy + 0.22;
      const basePos = isoToScreen(lampBaseX, lampBaseY, 0.725, ox, oy);

      // Heavy Brass Weighted Circular Base
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(basePos.x, basePos.y, 9, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Lower Arm extending to elbow hinge
      const elbowPos = isoToScreen(lampBaseX + 0.15, lampBaseY + 0.20, 1.15, ox, oy);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(basePos.x, basePos.y - 2);
      ctx.lineTo(elbowPos.x, elbowPos.y);
      ctx.stroke();

      // Elbow Pivot Screw
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(elbowPos.x, elbowPos.y, 3, 0, Math.PI * 2);
      ctx.fill();

      // Upper Arm leaning forward towards the desk mat
      const headPos = isoToScreen(lampBaseX + 0.38, lampBaseY + 0.38, 1.25, ox, oy);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(elbowPos.x, elbowPos.y);
      ctx.lineTo(headPos.x, headPos.y);
      ctx.stroke();

      // Conical Lampshade
      const shadeTip = isoToScreen(lampBaseX + 0.44, lampBaseY + 0.44, 1.05, ox, oy);
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(headPos.x, headPos.y);
      ctx.lineTo(shadeTip.x - 8, shadeTip.y);
      ctx.lineTo(shadeTip.x + 8, shadeTip.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Warm Ambient Radial Glow Pool over the keyboard & mat
      const glowCenter = isoToScreen(lampBaseX + 0.50, lampBaseY + 0.50, 0.73, ox, oy);
      const grad = ctx.createRadialGradient(glowCenter.x, glowCenter.y, 4, glowCenter.x, glowCenter.y, 48);
      grad.addColorStop(0, 'rgba(254, 240, 138, 0.38)');
      grad.addColorStop(0.5, 'rgba(254, 240, 138, 0.14)');
      grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(glowCenter.x, glowCenter.y, 48, 0, Math.PI * 2);
      ctx.fill();

      // 7. Steaming Ceramic Mug
      const mugPos = isoToScreen(gx + 2.15, gy + 0.85, 0.725, ox, oy);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(mugPos.x - 3, mugPos.y - 7, 6, 7);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.strokeRect(mugPos.x - 3, mugPos.y - 7, 6, 7);
    }

    // --- Architectural 4-Tier Bookshelf (Cleanly Aligned against Wall, x: 0, y: 4) ---
    drawBookshelf(ctx, gx, gy, ox, oy) {
      const W = 0.65;  // Depth along X
      const L = 2.50;  // Length along Y
      const H = 2.40;  // Height

      // 1. Backing Wall Panel & Sturdy Side Uprights
      // Left Upright Stile (at y = gy)
      this.drawBox(ctx, gx, gy, 0, W, 0.08, H, '#78350f', '#58240a', '#451a03', ox, oy);
      // Right Upright Stile (at y = gy + L)
      this.drawBox(ctx, gx, gy + L - 0.08, 0, W, 0.08, H, '#78350f', '#58240a', '#451a03', ox, oy);
      // Back Panel
      this.drawBox(ctx, gx, gy, 0, 0.06, L, H, '#58240a', '#451a03', '#311202', ox, oy);
      // Top Cornice Trim
      this.drawBox(ctx, gx, gy, H - 0.06, W, L, 0.06, '#92400e', '#78350f', '#58240a', ox, oy);

      // 2. Four Solid Horizontal Shelves
      const shelvesZ = [0.15, 0.75, 1.35, 1.95];
      shelvesZ.forEach(sz => {
        this.drawBox(ctx, gx, gy, sz, W, L, 0.05, '#92400e', '#78350f', '#58240a', ox, oy);
      });

      // 3. Books Mathematically Sitting Directly ON Shelves (Zero Floating!)
      // Shelf 1 (sz = 0.20): Heavy Hardcover Volumes
      const s1Books = [
        { y: 0.15, len: 0.28, h: 0.46, col: '#1e3a8a' }, // Navy
        { y: 0.45, len: 0.22, h: 0.44, col: '#065f46' }, // Emerald
        { y: 0.70, len: 0.35, h: 0.48, col: '#b45309' }, // Leather
        { y: 1.10, len: 0.30, h: 0.45, col: '#831843' }, // Burgundy
        { y: 1.45, len: 0.26, h: 0.42, col: '#1e293b' }, // Dark Slate
        { y: 1.75, len: 0.35, h: 0.47, col: '#0369a1' }  // Blue
      ];
      s1Books.forEach(b => {
        this.drawBox(ctx, gx + 0.08, gy + b.y, 0.20, 0.48, b.len, b.h, b.col, '#1e293b', '#0f172a', ox, oy);
        // Gold foil spine rib
        const rPos = isoToScreen(gx + 0.56, gy + b.y + b.len * 0.5, 0.20 + b.h * 0.65, ox, oy);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(rPos.x - 2, rPos.y - 1, 4, 1.5);
      });

      // Shelf 2 (sz = 0.80): Textbooks & Stacked Reference Manuals
      const s2Books = [
        { y: 0.15, len: 0.32, h: 0.44, col: '#0d9488' }, // Teal
        { y: 0.50, len: 0.28, h: 0.42, col: '#d97706' }, // Amber
        { y: 0.82, len: 0.30, h: 0.46, col: '#4f46e5' }, // Indigo
        { y: 1.15, len: 0.25, h: 0.40, col: '#7c3aed' }  // Purple
      ];
      s2Books.forEach(b => {
        this.drawBox(ctx, gx + 0.08, gy + b.y, 0.80, 0.48, b.len, b.h, b.col, '#1e293b', '#0f172a', ox, oy);
      });
      // Horizontal Stack on Shelf 2
      this.drawBox(ctx, gx + 0.08, gy + 1.55, 0.80, 0.46, 0.65, 0.08, '#ea580c', '#c2410c', '#9a3412', ox, oy);
      this.drawBox(ctx, gx + 0.08, gy + 1.58, 0.88, 0.44, 0.60, 0.08, '#0284c7', '#0369a1', '#075985', ox, oy);

      // Shelf 3 (sz = 1.40): Literature & Terracotta Potted Plant
      const s3Books = [
        { y: 0.15, len: 0.24, h: 0.40, col: '#be123c' },
        { y: 0.42, len: 0.26, h: 0.42, col: '#15803d' },
        { y: 0.72, len: 0.30, h: 0.38, col: '#a16207' },
        { y: 1.05, len: 0.22, h: 0.42, col: '#0284c7' }
      ];
      s3Books.forEach(b => {
        this.drawBox(ctx, gx + 0.08, gy + b.y, 1.40, 0.46, b.len, b.h, b.col, '#1e293b', '#0f172a', ox, oy);
      });

      // Terracotta Succulent Plant on Shelf 3 (firmly at z = 1.40)
      const potX = gx + 0.22;
      const potY = gy + 1.75;
      this.drawBox(ctx, potX, potY, 1.40, 0.30, 0.30, 0.20, '#ea580c', '#c2410c', '#9a3412', ox, oy);
      const leafPos = isoToScreen(potX + 0.15, potY + 0.15, 1.62, ox, oy);
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(leafPos.x, leafPos.y, 7, 0, Math.PI * 2);
      ctx.fill();

      // Shelf 4 / Top (sz = 2.00): Archival Binders & Trailing Ivy
      const s4Books = [
        { y: 0.15, len: 0.30, h: 0.32, col: '#334155' },
        { y: 0.48, len: 0.30, h: 0.32, col: '#334155' },
        { y: 0.81, len: 0.30, h: 0.32, col: '#334155' }
      ];
      s4Books.forEach(b => {
        this.drawBox(ctx, gx + 0.08, gy + b.y, 2.00, 0.46, b.len, b.h, b.col, '#1e293b', '#0f172a', ox, oy);
      });

      // Delicate English Ivy trailing down the side
      const ivyTip = isoToScreen(gx + 0.58, gy + L - 0.02, 2.00, ox, oy);
      ctx.fillStyle = '#16a34a';
      for (let step = 0; step < 7; step++) {
        ctx.beginPath();
        ctx.arc(ivyTip.x - 2 + (step % 2) * 4, ivyTip.y + step * 7, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // --- Living Room Sofa, Area Rug & Coffee Table (x: 2, y: 5) ---
    drawLivingRoom(ctx, gx, gy, ox, oy) {
      // Area Rug
      const r0 = isoToScreen(gx - 0.2, gy - 0.2, 0.01, ox, oy);
      const r1 = isoToScreen(gx + 2.8, gy - 0.2, 0.01, ox, oy);
      const r2 = isoToScreen(gx + 2.8, gy + 2.2, 0.01, ox, oy);
      const r3 = isoToScreen(gx - 0.2, gy + 2.2, 0.01, ox, oy);
      ctx.fillStyle = '#9a3412';
      ctx.beginPath();
      ctx.moveTo(r0.x, r0.y); ctx.lineTo(r1.x, r1.y); ctx.lineTo(r2.x, r2.y); ctx.lineTo(r3.x, r3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Deep Blue Comfortable Sofa
      // Seat Base
      this.drawBox(ctx, gx, gy, 0, 0.85, 2.0, 0.42, '#2563eb', '#1d4ed8', '#1e40af', ox, oy);
      // High Backrest
      this.drawBox(ctx, gx, gy, 0.42, 0.28, 2.0, 0.55, '#1d4ed8', '#1e40af', '#1e3a8a', ox, oy);
      // Soft Armrests
      this.drawBox(ctx, gx, gy, 0.42, 0.85, 0.22, 0.32, '#2563eb', '#1d4ed8', '#1e40af', ox, oy);
      this.drawBox(ctx, gx, gy + 1.78, 0.42, 0.85, 0.22, 0.32, '#2563eb', '#1d4ed8', '#1e40af', ox, oy);
      // Fluffy Throw Pillows
      this.drawBox(ctx, gx + 0.28, gy + 0.25, 0.44, 0.28, 0.35, 0.28, '#f59e0b', '#d97706', '#b45309', ox, oy);
      this.drawBox(ctx, gx + 0.28, gy + 1.40, 0.44, 0.28, 0.35, 0.28, '#f59e0b', '#d97706', '#b45309', ox, oy);

      // Low Solid Walnut Coffee Table
      this.drawBox(ctx, gx + 1.25, gy + 0.45, 0, 0.85, 1.10, 0.32, '#78350f', '#58240a', '#451a03', ox, oy);
      // Tea Set & Cup
      const cupP = isoToScreen(gx + 1.65, gy + 1.0, 0.33, ox, oy);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cupP.x, cupP.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Dining Table Set (x: 6, y: 5) ---
    drawDiningTable(ctx, gx, gy, ox, oy) {
      // Warm Solid Teak Dining Table (w: 1.8, d: 1.4, H: 0.74)
      this.drawBox(ctx, gx + 0.3, gy + 0.2, 0, 1.4, 1.0, 0.74, '#b45309', '#92400e', '#78350f', ox, oy);
      // Fresh Fruit Platter
      const fP = isoToScreen(gx + 1.0, gy + 0.7, 0.75, ox, oy);
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.ellipse(fP.x, fP.y, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(fP.x - 3, fP.y - 2, 3, 0, Math.PI * 2);
      ctx.arc(fP.x + 3, fP.y - 1, 3.5, 0, Math.PI * 2);
      ctx.fill();
      // Chairs tucked in
      this.drawBox(ctx, gx + 0.6, gy - 0.2, 0, 0.45, 0.35, 0.45, '#78350f', '#58240a', '#451a03', ox, oy);
      this.drawBox(ctx, gx + 0.6, gy + 1.25, 0, 0.45, 0.35, 0.45, '#78350f', '#58240a', '#451a03', ox, oy);
    }

    // ========================================================================
    // 2. ZONE 2: MEN'S DORMITORY 11 ROOM 211 (上床下桌 LOFT BEDS)
    // ========================================================================

    // --- Classic Taiwanese Dorm Loft Bed / Desk Combo (上床下桌) ---
    drawLoftBedDesk(ctx, gx, gy, config, ox, oy) {
      const W = 2.20; // Width along X
      const D = 1.40; // Depth along Y
      const H = 2.25; // Total frame height
      const deskH = 0.70;
      const bedBaseZ = 1.35;
      const facing = config.facing || 'south'; // 'south' = desk opens south (into room); 'north' = desk opens north (into room)

      // 1. Four Structural Dark Iron Posts (rising from z: 0 to H)
      const postCol = '#334155';
      const postL = '#1e293b';
      const postR = '#0f172a';
      const pw = 0.08;
      this.drawBox(ctx, gx, gy, 0, pw, pw, H, postCol, postL, postR, ox, oy);
      this.drawBox(ctx, gx + W - pw, gy, 0, pw, pw, H, postCol, postL, postR, ox, oy);
      this.drawBox(ctx, gx + W - pw, gy + D - pw, 0, pw, pw, H, postCol, postL, postR, ox, oy);
      this.drawBox(ctx, gx, gy + D - pw, 0, pw, pw, H, postCol, postL, postR, ox, oy);

      // 2. LOWER LEVEL: Study Desk Tabletop (z = deskH)
      this.drawBox(ctx, gx + 0.08, gy + 0.08, 0, W - 0.16, D - 0.16, deskH, '#e2d9cc', '#c4b5a0', '#a89984', ox, oy);

      // Under-desk Bookshelf with colorful textbooks
      this.drawBox(ctx, gx + 0.10, gy + 0.10, 0.08, 0.35, D - 0.20, 0.45, '#78350f', '#58240a', '#451a03', ox, oy);

      const scrCol = config.screenColor || '#38bdf8';
      const matZ = bedBaseZ + 0.10;

      if (facing === 'south') {
        // --- NORTH ROW BED: Desk & Ladder face South (+Y, into room) ---
        // Ergonomic Swivel Chair (Seat faces North into desk; backrest faces South into central aisle)
        this.drawBox(ctx, gx + 0.85, gy + D + 0.06, 0, 0.48, 0.48, 0.45, '#1e293b', '#0f172a', '#020617', ox, oy);
        // Backrest on South edge (aisle side)
        this.drawBox(ctx, gx + 0.85, gy + D + 0.44, 0.45, 0.48, 0.10, 0.42, '#334155', '#1e293b', '#0f172a', ox, oy);

        // Laptop / Workstation Display on Desk facing South
        const deskScr0 = isoToScreen(gx + 0.70, gy + 0.30, deskH + 0.02, ox, oy);
        const deskScr1 = isoToScreen(gx + 1.45, gy + 0.30, deskH + 0.02, ox, oy);
        const deskScr2 = isoToScreen(gx + 1.45, gy + 0.30, deskH + 0.42, ox, oy);
        const deskScr3 = isoToScreen(gx + 0.70, gy + 0.30, deskH + 0.42, ox, oy);
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(deskScr0.x, deskScr0.y); ctx.lineTo(deskScr1.x, deskScr1.y); ctx.lineTo(deskScr2.x, deskScr2.y); ctx.lineTo(deskScr3.x, deskScr3.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Glowing Code Screen
        const dC = isoToScreen(gx + 1.05, gy + 0.30, deskH + 0.22, ox, oy);
        ctx.fillStyle = scrCol;
        ctx.fillRect(dC.x - 14, dC.y - 7, 26, 2);
        ctx.fillRect(dC.x - 10, dC.y - 3, 20, 2);
        ctx.fillRect(dC.x - 14, dC.y + 2, 22, 2);

        // Safety Guardrails on South edge (gy + D - pw)
        const railZ = matZ + 0.30;
        this.drawBox(ctx, gx, gy + D - pw, railZ, W, pw, 0.06, '#64748b', '#475569', '#334155', ox, oy);
        this.drawBox(ctx, gx, gy + D - pw, railZ - 0.15, W, pw, 0.05, '#64748b', '#475569', '#334155', ox, oy);

        // Access Steel Ladder on front-right (gy + D + 0.02)
        const ladX = gx + W - 0.35;
        const ladY = gy + D + 0.02;
        for (let rZ = 0.20; rZ <= bedBaseZ; rZ += 0.28) {
          const lp0 = isoToScreen(ladX, ladY, rZ, ox, oy);
          const lp1 = isoToScreen(ladX + 0.28, ladY, rZ, ox, oy);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(lp0.x, lp0.y); ctx.lineTo(lp1.x, lp1.y);
          ctx.stroke();
        }
      } else {
        // --- SOUTH ROW BED: Desk & Ladder face North (-Y, into room) ---
        // Ergonomic Swivel Chair (Seat faces South into desk; backrest faces North into central aisle)
        this.drawBox(ctx, gx + 0.85, gy - 0.54, 0, 0.48, 0.48, 0.45, '#1e293b', '#0f172a', '#020617', ox, oy);
        // Backrest on North edge (aisle side)
        this.drawBox(ctx, gx + 0.85, gy - 0.54, 0.45, 0.48, 0.10, 0.42, '#334155', '#1e293b', '#0f172a', ox, oy);

        // Laptop / Workstation Display on Desk facing North
        const deskScr0 = isoToScreen(gx + 0.70, gy + D - 0.30, deskH + 0.02, ox, oy);
        const deskScr1 = isoToScreen(gx + 1.45, gy + D - 0.30, deskH + 0.02, ox, oy);
        const deskScr2 = isoToScreen(gx + 1.45, gy + D - 0.30, deskH + 0.42, ox, oy);
        const deskScr3 = isoToScreen(gx + 0.70, gy + D - 0.30, deskH + 0.42, ox, oy);
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(deskScr0.x, deskScr0.y); ctx.lineTo(deskScr1.x, deskScr1.y); ctx.lineTo(deskScr2.x, deskScr2.y); ctx.lineTo(deskScr3.x, deskScr3.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Glowing Code Screen
        const dC = isoToScreen(gx + 1.05, gy + D - 0.30, deskH + 0.22, ox, oy);
        ctx.fillStyle = scrCol;
        ctx.fillRect(dC.x - 14, dC.y - 7, 26, 2);
        ctx.fillRect(dC.x - 10, dC.y - 3, 20, 2);
        ctx.fillRect(dC.x - 14, dC.y + 2, 22, 2);

        // Safety Guardrails on North edge (gy)
        const railZ = matZ + 0.30;
        this.drawBox(ctx, gx, gy, railZ, W, pw, 0.06, '#64748b', '#475569', '#334155', ox, oy);
        this.drawBox(ctx, gx, gy, railZ - 0.15, W, pw, 0.05, '#64748b', '#475569', '#334155', ox, oy);

        // Access Steel Ladder on front-right (gy - 0.02)
        const ladX = gx + W - 0.35;
        const ladY = gy - 0.02;
        for (let rZ = 0.20; rZ <= bedBaseZ; rZ += 0.28) {
          const lp0 = isoToScreen(ladX, ladY, rZ, ox, oy);
          const lp1 = isoToScreen(ladX + 0.28, ladY, rZ, ox, oy);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(lp0.x, lp0.y); ctx.lineTo(lp1.x, lp1.y);
          ctx.stroke();
        }
      }

      // 3. UPPER LEVEL: Bed Platform, Mattress & Duvet
      // Platform Base
      this.drawBox(ctx, gx + 0.04, gy + 0.04, bedBaseZ, W - 0.08, D - 0.08, 0.10, '#334155', '#1e293b', '#0f172a', ox, oy);
      // Thick Mattress
      this.drawBox(ctx, gx + 0.08, gy + 0.08, matZ, W - 0.16, D - 0.16, 0.22, '#f8fafc', '#e2e8f0', '#cbd5e1', ox, oy);

      // Cozy Quilt / Duvet (themed color for each roommate)
      const quiltCol = config.duvetColor || '#ea580c';
      this.drawBox(ctx, gx + 0.85, gy + 0.08, matZ + 0.04, W - 0.95, D - 0.16, 0.20, quiltCol, '#9a3412', '#7c2d12', ox, oy);

      // White Fluffy Pillow at Head
      this.drawBox(ctx, gx + 0.15, gy + 0.25, matZ + 0.22, 0.48, 0.85, 0.12, '#ffffff', '#f1f5f9', '#e2e8f0', ox, oy);
    }

    // --- Dorm 11-211 Common Lounge Area (Beloved Classic Blue Sofa, Orange Pillows, Coffee Table & Guitar) ---
    drawDormCommonArea(ctx, gx, gy, ox, oy) {
      // Warm Terra-cotta Area Rug with Gold Trim (Matching the living room aesthetic)
      const r0 = isoToScreen(gx - 0.2, gy - 0.2, 0.01, ox, oy);
      const r1 = isoToScreen(gx + 2.4, gy - 0.2, 0.01, ox, oy);
      const r2 = isoToScreen(gx + 2.4, gy + 2.2, 0.01, ox, oy);
      const r3 = isoToScreen(gx - 0.2, gy + 2.2, 0.01, ox, oy);
      ctx.fillStyle = '#9a3412';
      ctx.beginPath();
      ctx.moveTo(r0.x, r0.y); ctx.lineTo(r1.x, r1.y); ctx.lineTo(r2.x, r2.y); ctx.lineTo(r3.x, r3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Deep Blue Comfortable Sofa (Classic Lounge Sofa)
      // Seat Base
      this.drawBox(ctx, gx, gy, 0, 0.85, 2.0, 0.42, '#2563eb', '#1d4ed8', '#1e40af', ox, oy);
      // High Backrest
      this.drawBox(ctx, gx, gy, 0.42, 0.28, 2.0, 0.55, '#1d4ed8', '#1e40af', '#1e3a8a', ox, oy);
      // Soft Armrests
      this.drawBox(ctx, gx, gy, 0.42, 0.85, 0.22, 0.32, '#2563eb', '#1d4ed8', '#1e40af', ox, oy);
      this.drawBox(ctx, gx, gy + 1.78, 0.42, 0.85, 0.22, 0.32, '#2563eb', '#1d4ed8', '#1e40af', ox, oy);
      // Fluffy Orange Throw Pillows
      this.drawBox(ctx, gx + 0.28, gy + 0.25, 0.44, 0.28, 0.35, 0.28, '#f59e0b', '#d97706', '#b45309', ox, oy);
      this.drawBox(ctx, gx + 0.28, gy + 1.40, 0.44, 0.28, 0.35, 0.28, '#f59e0b', '#d97706', '#b45309', ox, oy);

      // Low Solid Walnut Coffee Table
      this.drawBox(ctx, gx + 1.15, gy + 0.45, 0, 0.80, 1.10, 0.32, '#78350f', '#58240a', '#451a03', ox, oy);
      // White Cup on Table
      const cupP = isoToScreen(gx + 1.55, gy + 1.0, 0.33, ox, oy);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cupP.x, cupP.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Billy's Acoustic Guitar resting against the sofa armrest
      const gP = isoToScreen(gx + 0.35, gy + 2.05, 0.25, ox, oy);
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(gP.x, gP.y, 6, 9, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(gP.x, gP.y - 9); ctx.lineTo(gP.x + 3, gP.y - 20);
      ctx.stroke();
    }

    // ========================================================================
    // 3. ZONE 3: LUDWIGIA AI RESEARCH STUDIO EQUIPMENT
    // ========================================================================

    // --- Dual 42U Datacenter Server Cabinets (x: 19.5, y: 1.2) ---
    drawServerRacks(ctx, gx, gy, ox, oy) {
      const W = 1.80;
      const D = 1.20;
      const H = 2.30;

      // Dark Matte Steel Chassis
      this.drawBox(ctx, gx, gy, 0, W, D, H, '#0f172a', '#020617', '#020617', ox, oy);

      // Smoked Glass Front Panel with Reflections
      const sf0 = isoToScreen(gx + W, gy, 0.05, ox, oy);
      const sf1 = isoToScreen(gx + W, gy + D, 0.05, ox, oy);
      const sf2 = isoToScreen(gx + W, gy + D, H - 0.05, ox, oy);
      const sf3 = isoToScreen(gx + W, gy, H - 0.05, ox, oy);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.beginPath();
      ctx.moveTo(sf0.x, sf0.y); ctx.lineTo(sf1.x, sf1.y); ctx.lineTo(sf2.x, sf2.y); ctx.lineTo(sf3.x, sf3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Animated Multi-Color Blinking Server Node LEDs
      const time = performance.now() * 0.005;
      for (let s = 0.25; s < H - 0.20; s += 0.22) {
        const lp = isoToScreen(gx + W, gy + 0.35, s, ox, oy);
        const blink1 = Math.sin(time * 3 + s * 5) > 0;
        const blink2 = Math.cos(time * 4 + s * 3) > 0;
        ctx.fillStyle = blink1 ? '#22d3ee' : '#0369a1';
        ctx.fillRect(lp.x, lp.y - 2, 3, 2);
        ctx.fillStyle = blink2 ? '#10b981' : '#065f46';
        ctx.fillRect(lp.x + 5, lp.y - 2, 3, 2);
      }
    }

    // --- Ultrawide AI Command Center Workstation (x: 23.5, y: 1.2) ---
    drawAiCommandDesk(ctx, gx, gy, ox, oy) {
      // Carbon Fiber Tabletop with Cyan LED Edge
      this.drawBox(ctx, gx, gy, 0, 2.50, 1.20, 0.74, '#0f172a', '#020617', '#020617', ox, oy);

      // Glowing Cyan Perimeter Trim
      const c0 = isoToScreen(gx, gy, 0.74, ox, oy);
      const c1 = isoToScreen(gx + 2.5, gy, 0.74, ox, oy);
      const c2 = isoToScreen(gx + 2.5, gy + 1.2, 0.74, ox, oy);
      const c3 = isoToScreen(gx, gy + 1.2, 0.74, ox, oy);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c0.x, c0.y); ctx.lineTo(c1.x, c1.y); ctx.lineTo(c2.x, c2.y); ctx.lineTo(c3.x, c3.y);
      ctx.closePath();
      ctx.stroke();

      // Triple Curved Displays showing Neural Loss Curves & Graph Visualizers
      const ds0 = isoToScreen(gx + 0.35, gy + 0.20, 0.75, ox, oy);
      const ds1 = isoToScreen(gx + 2.15, gy + 0.20, 0.75, ox, oy);
      const ds2 = isoToScreen(gx + 2.15, gy + 0.20, 1.35, ox, oy);
      const ds3 = isoToScreen(gx + 0.35, gy + 0.20, 1.35, ox, oy);
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.moveTo(ds0.x, ds0.y); ctx.lineTo(ds1.x, ds1.y); ctx.lineTo(ds2.x, ds2.y); ctx.lineTo(ds3.x, ds3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Real-Time Loss Graph Curves
      const gC = isoToScreen(gx + 1.25, gy + 0.20, 1.05, ox, oy);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(gC.x - 24, gC.y - 8, 48, 2);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(gC.x - 20, gC.y - 2, 40, 2);
      ctx.fillStyle = '#34d399';
      ctx.fillRect(gC.x - 24, gC.y + 4, 32, 2);
    }

    // --- Frosted Glass Whiteboard with DPO Math & Architecture (x: 26.2, y: 4.0) ---
    drawGlassWhiteboard(ctx, gx, gy, ox, oy) {
      const W = 0.08;
      const L = 2.40;
      const H = 1.60;
      const baseZ = 0.60;

      // Chrome Frame
      this.drawBox(ctx, gx, gy, baseZ, W, L, H, '#94a3b8', '#64748b', '#475569', ox, oy);

      // Translucent Frosted Glass
      const g0 = isoToScreen(gx, gy + 0.05, baseZ + 0.05, ox, oy);
      const g1 = isoToScreen(gx, gy + L - 0.05, baseZ + 0.05, ox, oy);
      const g2 = isoToScreen(gx, gy + L - 0.05, baseZ + H - 0.05, ox, oy);
      const g3 = isoToScreen(gx, gy + 0.05, baseZ + H - 0.05, ox, oy);
      ctx.fillStyle = 'rgba(224, 242, 254, 0.35)';
      ctx.beginPath();
      ctx.moveTo(g0.x, g0.y); ctx.lineTo(g1.x, g1.y); ctx.lineTo(g2.x, g2.y); ctx.lineTo(g3.x, g3.y);
      ctx.closePath();
      ctx.fill();

      // Formulas written on glass
      const fPos = isoToScreen(gx, gy + 1.20, baseZ + 0.85, ox, oy);
      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('L_DPO = -E[log σ(β log π_θ/π_ref)]', fPos.x, fPos.y);
      ctx.fillStyle = '#059669';
      ctx.fillText('Prompt -> SFT -> Preference -> Align', fPos.x, fPos.y + 12);
    }

    // --- Espresso & Beverage Bar (x: 19.5, y: 7.2) ---
    drawEspressoBar(ctx, gx, gy, ox, oy) {
      // Marble Countertop Island
      this.drawBox(ctx, gx, gy, 0, 1.80, 1.20, 0.85, '#f8fafc', '#e2e8f0', '#cbd5e1', ox, oy);

      // Italian Chrome Espresso Machine
      this.drawBox(ctx, gx + 0.45, gy + 0.35, 0.85, 0.70, 0.55, 0.45, '#94a3b8', '#64748b', '#475569', ox, oy);
      // Steam & Ceramic Mugs
      const mP = isoToScreen(gx + 1.35, gy + 0.65, 0.86, ox, oy);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(mP.x - 4, mP.y - 7, 8, 7);
    }

    // ========================================================================
    // 4. CENTRAL COURTYARD: PARK BENCHES, FOUNTAIN & AMENITIES
    // ========================================================================

    // --- Refined Cast-Iron Teakwood Park Bench ---
    drawParkBench(ctx, gx, gy, ox, oy) {
      const W = 1.60;
      const D = 0.65;

      // Soft Ground Drop Shadow
      const s0 = isoToScreen(gx - 0.1, gy - 0.1, 0, ox, oy);
      const s1 = isoToScreen(gx + W + 0.1, gy - 0.1, 0, ox, oy);
      const s2 = isoToScreen(gx + W + 0.1, gy + D + 0.1, 0, ox, oy);
      const s3 = isoToScreen(gx - 0.1, gy + D + 0.1, 0, ox, oy);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.20)';
      ctx.beginPath();
      ctx.moveTo(s0.x, s0.y); ctx.lineTo(s1.x, s1.y); ctx.lineTo(s2.x, s2.y); ctx.lineTo(s3.x, s3.y);
      ctx.closePath();
      ctx.fill();

      // Two Ornamental Cast-Iron Curved Supports
      const legX = [gx + 0.15, gx + W - 0.15];
      legX.forEach(lx => {
        const bF = isoToScreen(lx, gy + 0.55, 0, ox, oy);
        const tF = isoToScreen(lx, gy + 0.55, 0.45, ox, oy);
        const bB = isoToScreen(lx, gy + 0.08, 0, ox, oy);
        const tB = isoToScreen(lx, gy + 0.08, 0.82, ox, oy);
        const armF = isoToScreen(lx, gy + 0.55, 0.58, ox, oy);

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(bF.x, bF.y); ctx.lineTo(tF.x, tF.y);
        ctx.moveTo(bB.x, bB.y); ctx.lineTo(tB.x, tB.y);
        ctx.stroke();

        // Scrollwork Armrest
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(tB.x, tB.y - 6);
        ctx.quadraticCurveTo(tF.x, tF.y - 10, armF.x, armF.y);
        ctx.stroke();
      });

      // 3 Polished Teakwood Seat Slats (Smooth parallel slats)
      const seatSlats = [0.15, 0.32, 0.49];
      seatSlats.forEach(sy => {
        this.drawBox(ctx, gx + 0.05, gy + sy, 0.42, W - 0.10, 0.14, 0.05, '#b45309', '#92400e', '#78350f', ox, oy);
      });

      // 2 Ergonomic Backrest Slats
      const backSlats = [0.58, 0.72];
      backSlats.forEach(sz => {
        this.drawBox(ctx, gx + 0.05, gy + 0.08, sz, W - 0.10, 0.06, 0.11, '#d97706', '#b45309', '#92400e', ox, oy);
      });
    }

    // --- Grand Multi-Tiered Courtyard Fountain (x: 13, y: 13) ---
    drawGrandFountain(ctx, gx, gy, ox, oy) {
      // Hexagonal / Octagonal Stone Basin Rim
      this.drawBox(ctx, gx, gy, 0, 3.0, 3.0, 0.45, '#94a3b8', '#64748b', '#475569', ox, oy);

      // Shimmering Water Pool
      const w0 = isoToScreen(gx + 0.2, gy + 0.2, 0.38, ox, oy);
      const w1 = isoToScreen(gx + 2.8, gy + 0.2, 0.38, ox, oy);
      const w2 = isoToScreen(gx + 2.8, gy + 2.8, 0.38, ox, oy);
      const w3 = isoToScreen(gx + 0.2, gy + 2.8, 0.38, ox, oy);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(w0.x, w0.y); ctx.lineTo(w1.x, w1.y); ctx.lineTo(w2.x, w2.y); ctx.lineTo(w3.x, w3.y);
      ctx.closePath();
      ctx.fill();

      // Middle Pedestal & Upper Tier Basin
      this.drawBox(ctx, gx + 0.9, gy + 0.9, 0.45, 1.2, 1.2, 0.65, '#cbd5e1', '#94a3b8', '#64748b', ox, oy);
      this.drawBox(ctx, gx + 0.7, gy + 0.7, 1.10, 1.6, 1.6, 0.25, '#94a3b8', '#64748b', '#475569', ox, oy);

      // Center Spout Spire & Animated Water Spray
      const spire = isoToScreen(gx + 1.5, gy + 1.5, 1.75, ox, oy);
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(spire.x, spire.y, 4, 0, Math.PI * 2);
      ctx.fill();

      const time = performance.now() * 0.006;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2 + time;
        const dist = 14 + Math.sin(time * 2 + i) * 5;
        const h = Math.cos(time * 3 + i) * 6;
        ctx.beginPath();
        ctx.arc(spire.x + Math.cos(ang) * dist, spire.y + Math.sin(ang) * (dist * 0.5) - h, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // --- Lush Flowering Cherry Blossom Tree ---
    drawTree(ctx, tx, ty, ox, oy) {
      // Trunk
      this.drawBox(ctx, tx + 0.35, ty + 0.35, 0, 0.35, 0.35, 1.20, '#78350f', '#58240a', '#451a03', ox, oy);

      // Canopy Spheres
      const p = isoToScreen(tx + 0.5, ty + 0.5, 1.8, ox, oy);
      const isBlossom = (Math.floor(tx + ty) % 2 === 0);
      const col1 = isBlossom ? '#f472b6' : '#22c55e';
      const col2 = isBlossom ? '#fbcfe8' : '#86efac';

      ctx.fillStyle = col1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = col2;
      ctx.beginPath();
      ctx.arc(p.x - 5, p.y - 7, 15, 0, Math.PI * 2);
      ctx.arc(p.x + 8, p.y - 4, 13, 0, Math.PI * 2);
      ctx.fill();
    }

    // =========================================================================
    // ZONE 4: LUDWIGIA GRAND LIBRARY & BOTANICAL READING HALL
    // =========================================================================

    // --- 1. Grand Mahogany Book Wall with Brass Rolling Ladder ---
    drawLibraryBookWall(ctx, gx, gy, ox, oy) {
      const W = 3.2, D = 0.55, H = 2.3;
      const cFrame = '#3f1d12';
      const cSide = '#2b110a';
      const cTop = '#542516';

      // Drop shadow
      this.drawDropShadow(ctx, gx, gy, W, D, ox, oy);

      // Main Bookshelf Casing
      this.drawBox(ctx, gx, gy, 0, W, D, H, cTop, cSide, cFrame, ox, oy);

      // 4 Internal Shelves & Realistic Book Rows
      const shelvesY = [0.15, 0.72, 1.30, 1.88];
      const bookColors = ['#991b1b', '#166534', '#1e40af', '#854d0e', '#581c87', '#0f766e', '#b45309'];

      shelvesY.forEach((sz, shelfIdx) => {
        // Shelf plank
        this.drawBox(ctx, gx + 0.05, gy + 0.04, sz, W - 0.1, D - 0.05, 0.05, '#78350f', '#451a03', '#92400e', ox, oy);

        // Populate row with dense books
        const bookCount = 9;
        const bWidth = (W - 0.25) / bookCount;
        for (let i = 0; i < bookCount; i++) {
          const bx = gx + 0.12 + i * bWidth;
          const bH = 0.42 + ((i * 7 + shelfIdx * 3) % 5) * 0.025;
          const bColor = bookColors[(i * 3 + shelfIdx * 2) % bookColors.length];
          this.drawBox(ctx, bx, gy + 0.1, sz + 0.05, bWidth * 0.85, D * 0.7, bH, '#fde68a', '#d97706', bColor, ox, oy);
        }
      });

      // Brass Rolling Ladder Rail
      const railZ = 1.95;
      const r0 = isoToScreen(gx, gy + D + 0.05, railZ, ox, oy);
      const r1 = isoToScreen(gx + W, gy + D + 0.05, railZ, ox, oy);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(r0.x, r0.y);
      ctx.lineTo(r1.x, r1.y);
      ctx.stroke();

      // Slanted Wooden Rolling Ladder
      const lx = gx + W * 0.65;
      const lTop = isoToScreen(lx, gy + D + 0.06, railZ, ox, oy);
      const lBot = isoToScreen(lx, gy + D + 0.45, 0, ox, oy);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(lTop.x - 3, lTop.y); ctx.lineTo(lBot.x - 3, lBot.y);
      ctx.moveTo(lTop.x + 3, lTop.y); ctx.lineTo(lBot.x + 3, lBot.y);
      ctx.stroke();

      // Ladder Rungs
      for (let r = 1; r <= 6; r++) {
        const t = r / 7;
        const rx = lTop.x * (1 - t) + lBot.x * t;
        const ry = lTop.y * (1 - t) + lBot.y * t;
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(rx - 3.5, ry); ctx.lineTo(rx + 3.5, ry);
        ctx.stroke();
      }

      // Trailing Ivy on Top Cornice
      const topP = isoToScreen(gx + 0.4, gy + 0.1, H, ox, oy);
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(topP.x, topP.y + 4, 5, 0, Math.PI * 2);
      ctx.arc(topP.x + 8, topP.y + 7, 4, 0, Math.PI * 2);
      ctx.arc(topP.x + 14, topP.y + 11, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- 2. Long Walnut Banker's Study Table with Emerald Lamp ---
    drawBankerDesk(ctx, gx, gy, ox, oy) {
      const W = 2.4, D = 1.2, H = 0.72;

      // Drop shadow
      this.drawDropShadow(ctx, gx, gy, W, D, ox, oy);

      // Solid Sturdy Legs
      const legR = 0.07;
      const legColor = '#291209';
      this.drawBox(ctx, gx + 0.1, gy + 0.1, 0, legR, legR, H, null, null, legColor, ox, oy);
      this.drawBox(ctx, gx + W - 0.17, gy + 0.1, 0, legR, legR, H, null, null, legColor, ox, oy);
      this.drawBox(ctx, gx + 0.1, gy + D - 0.17, 0, legR, legR, H, null, null, legColor, ox, oy);
      this.drawBox(ctx, gx + W - 0.17, gy + D - 0.17, 0, legR, legR, H, null, null, legColor, ox, oy);

      // Polished Dark Walnut Tabletop
      this.drawBox(ctx, gx, gy, H - 0.06, W, D, 0.06, '#5c2b16', '#3b180a', '#4a200e', ox, oy);

      // Emerald Green Banker's Lamp in Center
      const lx = gx + W / 2;
      const ly = gy + D / 2;
      const lBase = isoToScreen(lx, ly, H, ox, oy);

      // Brass base & neck
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(lBase.x, lBase.y, 4, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(lBase.x, lBase.y);
      ctx.lineTo(lBase.x, lBase.y - 10);
      ctx.stroke();

      // Emerald green cylindrical glass shade
      ctx.fillStyle = '#059669';
      ctx.strokeStyle = '#047857';
      ctx.lineWidth = 1.0;
      this.roundRect(ctx, lBase.x - 7, lBase.y - 14, 14, 5.5, 2);
      ctx.fill();
      ctx.stroke();

      // Warm downward emerald reading light aura
      const glow = ctx.createRadialGradient(lBase.x, lBase.y - 2, 2, lBase.x, lBase.y - 2, 24);
      glow.addColorStop(0, 'rgba(167, 243, 208, 0.45)');
      glow.addColorStop(0.5, 'rgba(52, 211, 153, 0.20)');
      glow.addColorStop(1, 'rgba(5, 150, 105, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.ellipse(lBase.x, lBase.y - 2, 24, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Open Manuscript on Table
      const mPos = isoToScreen(gx + 0.6, gy + 0.6, H + 0.01, ox, oy);
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(mPos.x - 8, mPos.y - 5, 16, 10);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(mPos.x - 8, mPos.y - 5, 16, 10);
      // Faint lines of calligraphy / math
      ctx.strokeStyle = '#92400e';
      ctx.beginPath();
      ctx.moveTo(mPos.x - 6, mPos.y - 2); ctx.lineTo(mPos.x - 2, mPos.y - 2);
      ctx.moveTo(mPos.x - 6, mPos.y + 1); ctx.lineTo(mPos.x - 2, mPos.y + 1);
      ctx.moveTo(mPos.x + 2, mPos.y - 2); ctx.lineTo(mPos.x + 6, mPos.y - 2);
      ctx.moveTo(mPos.x + 2, mPos.y + 1); ctx.lineTo(mPos.x + 6, mPos.y + 1);
      ctx.stroke();

      // Brass Magnifying Glass & Inkwell
      const inkP = isoToScreen(gx + 1.8, gy + 0.4, H + 0.01, ox, oy);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(inkP.x, inkP.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(inkP.x, inkP.y); ctx.lineTo(inkP.x + 4, inkP.y - 8);
      ctx.stroke();
    }

    // --- 3. Tufted Leather Wingback Armchair & Reading Nook ---
    drawWingbackReadingNook(ctx, gx, gy, ox, oy) {
      // 1. Woven Persian Rug
      const rugP = isoToScreen(gx - 0.2, gy - 0.2, 0, ox, oy);
      const rW = 2.0, rD = 1.8;
      const b0 = isoToScreen(gx - 0.2, gy - 0.2, 0.005, ox, oy);
      const b1 = isoToScreen(gx - 0.2 + rW, gy - 0.2, 0.005, ox, oy);
      const b2 = isoToScreen(gx - 0.2 + rW, gy - 0.2 + rD, 0.005, ox, oy);
      const b3 = isoToScreen(gx - 0.2, gy - 0.2 + rD, 0.005, ox, oy);
      ctx.fillStyle = '#831843'; // Deep wine red
      ctx.beginPath();
      ctx.moveTo(b0.x, b0.y); ctx.lineTo(b1.x, b1.y); ctx.lineTo(b2.x, b2.y); ctx.lineTo(b3.x, b3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // 2. Cognac Tufted Leather Armchair
      this.drawDropShadow(ctx, gx + 0.3, gy + 0.3, 1.2, 1.1, ox, oy);
      // Seat cushion
      this.drawBox(ctx, gx + 0.3, gy + 0.3, 0.22, 1.1, 1.0, 0.32, '#b45309', '#78350f', '#92400e', ox, oy);
      // High Wingback backrest
      this.drawBox(ctx, gx + 0.3, gy + 0.3, 0.54, 0.25, 1.0, 0.82, '#b45309', '#78350f', '#92400e', ox, oy);
      // Armrests
      this.drawBox(ctx, gx + 0.3, gy + 0.3, 0.42, 0.9, 0.22, 0.25, '#92400e', '#78350f', '#b45309', ox, oy);
      this.drawBox(ctx, gx + 0.3, gy + 1.08, 0.42, 0.9, 0.22, 0.25, '#92400e', '#78350f', '#b45309', ox, oy);

      // 3. Side Round Table with Tea
      this.drawBox(ctx, gx + 1.4, gy + 0.4, 0, 0.4, 0.4, 0.52, '#78350f', '#451a03', '#92400e', ox, oy);
      const teaP = isoToScreen(gx + 1.6, gy + 0.6, 0.53, ox, oy);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(teaP.x, teaP.y, 3, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350f'; // Earl grey tea
      ctx.beginPath();
      ctx.arc(teaP.x, teaP.y - 1, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // 4. Vintage Brass Floor Lamp
      const lampBase = isoToScreen(gx + 0.1, gy + 1.3, 0, ox, oy);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(lampBase.x, lampBase.y);
      ctx.lineTo(lampBase.x, lampBase.y - 38);
      ctx.stroke();

      // Scalloped fabric shade
      ctx.fillStyle = '#fef3c7';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(lampBase.x - 7, lampBase.y - 34);
      ctx.lineTo(lampBase.x + 7, lampBase.y - 34);
      ctx.lineTo(lampBase.x + 9, lampBase.y - 26);
      ctx.lineTo(lampBase.x - 9, lampBase.y - 26);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Warm radial floor lamp glow
      const lampGlow = ctx.createRadialGradient(lampBase.x, lampBase.y - 26, 2, lampBase.x, lampBase.y - 10, 32);
      lampGlow.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      lampGlow.addColorStop(0.5, 'rgba(253, 224, 71, 0.18)');
      lampGlow.addColorStop(1, 'rgba(234, 179, 8, 0)');
      ctx.fillStyle = lampGlow;
      ctx.beginPath();
      ctx.ellipse(lampBase.x, lampBase.y - 10, 32, 16, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- 4. Standing Brass Celestial Armillary Globe ---
    drawCelestialGlobe(ctx, gx, gy, ox, oy) {
      const gPos = isoToScreen(gx, gy, 0, ox, oy);

      // Soft drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.ellipse(gPos.x, gPos.y, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Carved Wooden Tripod Pedestal
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(gPos.x, gPos.y - 12); ctx.lineTo(gPos.x - 6, gPos.y);
      ctx.moveTo(gPos.x, gPos.y - 12); ctx.lineTo(gPos.x + 6, gPos.y);
      ctx.moveTo(gPos.x, gPos.y - 12); ctx.lineTo(gPos.x, gPos.y + 2);
      ctx.stroke();

      // Vertical Brass Spindle
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(gPos.x, gPos.y - 12);
      ctx.lineTo(gPos.x, gPos.y - 20);
      ctx.stroke();

      // Celestial Armillary Rings (渾天儀金色同心環)
      const cy = gPos.y - 26;
      ctx.lineWidth = 1.5;

      // Outer Meridian Ring
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(gPos.x, cy, 9, 0, Math.PI * 2);
      ctx.stroke();

      // Slanted Equator Ring
      ctx.strokeStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(gPos.x, cy, 9, 4, Math.PI / 4, 0, Math.PI * 2);
      ctx.stroke();

      // Center miniature celestial sphere
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(gPos.x, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- 5. Botanical Terrarium & Exotic Indoor Ferns ---
    drawTerrarium(ctx, gx, gy, ox, oy) {
      this.drawDropShadow(ctx, gx, gy, 0.8, 0.8, ox, oy);

      // Wooden Pedestal
      this.drawBox(ctx, gx, gy, 0, 0.8, 0.8, 0.55, '#5c2b16', '#3b180a', '#4a200e', ox, oy);

      // Glass Geometric Terrarium Casing
      const tPos = isoToScreen(gx + 0.4, gy + 0.4, 0.55, ox, oy);
      ctx.fillStyle = 'rgba(224, 242, 254, 0.42)';
      ctx.strokeStyle = '#b45309'; // Copper solder joints
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(tPos.x, tPos.y - 8, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Lush Indoor Mini Fern & Succulents
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(tPos.x - 2, tPos.y - 6, 4, 0, Math.PI * 2);
      ctx.arc(tPos.x + 3, tPos.y - 7, 3.5, 0, Math.PI * 2);
      ctx.arc(tPos.x, tPos.y - 11, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Polished River Pebbles
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(tPos.x - 4, tPos.y - 2, 2, 0, Math.PI * 2);
      ctx.arc(tPos.x, tPos.y - 1.5, 2.2, 0, Math.PI * 2);
      ctx.arc(tPos.x + 4, tPos.y - 2, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Export to Global Scope
  window.LudwigWorldModels = WorldModels;

})(window);
