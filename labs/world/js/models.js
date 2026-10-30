// ============================================================================
// Ludwigia World Models — 3D Isometric Architectural Geometry & Furniture
// ============================================================================

(function(window) {
  'use strict';

  const {
    isoToScreen,
    HOUSE_MAX_X, HOUSE_MAX_Y,
    DORM_MIN_X, DORM_MAX_X, DORM_MIN_Y, DORM_MAX_Y,
    AI_MIN_X, AI_MAX_X, AI_MIN_Y, AI_MAX_Y,
    SCHOOL_MIN_X, SCHOOL_MAX_X, SCHOOL_MIN_Y, SCHOOL_MAX_Y,
    DOUYIN_MIN_X, DOUYIN_MAX_X, DOUYIN_MIN_Y, DOUYIN_MAX_Y
  } = window.LudwigWorldEngine;

  class WorldModels {
    constructor(world) {
      this.world = world;
    }

    // --- Isometric 3D Solid Box Primitive (Fully Closed Solid Surfaces) ---
    drawBox(ctx, gx, gy, gz, dx, dy, dz, topCol, leftCol, rightCol, ox, oy, backCol = null) {
      const b0 = isoToScreen(gx, gy, gz, ox, oy);
      const b1 = isoToScreen(gx + dx, gy, gz, ox, oy);
      const b2 = isoToScreen(gx + dx, gy + dy, gz, ox, oy);
      const b3 = isoToScreen(gx, gy + dy, gz, ox, oy);

      const t0 = isoToScreen(gx, gy, gz + dz, ox, oy);
      const t1 = isoToScreen(gx + dx, gy, gz + dz, ox, oy);
      const t2 = isoToScreen(gx + dx, gy + dy, gz + dz, ox, oy);
      const t3 = isoToScreen(gx, gy + dy, gz + dz, ox, oy);

      const lCol = leftCol || rightCol;
      const rCol = rightCol || leftCol;

      // North / Back-facing Exterior Face (facing diagonally top-right on screen: b0 -> b1 -> t1 -> t0)
      if (backCol) {
        ctx.fillStyle = backCol;
        ctx.beginPath();
        ctx.moveTo(b0.x, b0.y); ctx.lineTo(b1.x, b1.y); ctx.lineTo(t1.x, t1.y); ctx.lineTo(t0.x, t0.y);
        ctx.closePath();
        ctx.fill();
      }

      // Left Visible Face (Front-Left on screen, facing diagonally bottom-left: b3 -> b2)
      if (lCol) {
        ctx.fillStyle = lCol;
        ctx.beginPath();
        ctx.moveTo(b3.x, b3.y); ctx.lineTo(b2.x, b2.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(t3.x, t3.y);
        ctx.closePath();
        ctx.fill();
      }

      // Right Visible Face (Front-Right on screen, facing diagonally bottom-right: b2 -> b1)
      if (rCol) {
        ctx.fillStyle = rCol;
        ctx.beginPath();
        ctx.moveTo(b2.x, b2.y); ctx.lineTo(b1.x, b1.y); ctx.lineTo(t1.x, t1.y); ctx.lineTo(t2.x, t2.y);
        ctx.closePath();
        ctx.fill();
      }

      // Top Visible Face (t0 -> t1 -> t2 -> t3)
      if (topCol) {
        ctx.fillStyle = topCol;
        ctx.beginPath();
        ctx.moveTo(t0.x, t0.y); ctx.lineTo(t1.x, t1.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(t3.x, t3.y);
        ctx.closePath();
        ctx.fill();
      }
    }

    // --- Soft Ambient Drop Shadow on Floor Plane ---
    drawDropShadow(ctx, gx, gy, w, d, ox, oy) {
      const s0 = isoToScreen(gx, gy, 0, ox, oy);
      const s1 = isoToScreen(gx + w, gy, 0, ox, oy);
      const s2 = isoToScreen(gx + w, gy + d, 0, ox, oy);
      const s3 = isoToScreen(gx, gy + d, 0, ox, oy);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.moveTo(s0.x, s0.y); ctx.lineTo(s1.x, s1.y); ctx.lineTo(s2.x, s2.y); ctx.lineTo(s3.x, s3.y);
      ctx.closePath();
      ctx.fill();
    }

    // --- Rounded Rectangle Helper Primitive ---
    roundRect(ctx, x, y, w, h, r = 0) {
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, w, h, r);
      } else {
        if (r > w / 2) r = w / 2;
        if (r > h / 2) r = h / 2;
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();
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
      // Keycap Backlit Rows (along isometric X axis on the keyboard top face)
      const kbY1 = gy + 0.70;
      const kbY2 = gy + 0.78;
      const k1a = isoToScreen(gx + 0.92, kbY1, 0.766, ox, oy);
      const k1b = isoToScreen(gx + 1.58, kbY1, 0.766, ox, oy);
      const k2a = isoToScreen(gx + 0.95, kbY2, 0.766, ox, oy);
      const k2b = isoToScreen(gx + 1.55, kbY2, 0.766, ox, oy);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(k1a.x, k1a.y); ctx.lineTo(k1b.x, k1b.y);
      ctx.moveTo(k2a.x, k2a.y); ctx.lineTo(k2b.x, k2b.y);
      ctx.stroke();

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

      // Glowing IDE Lines on Laptop Screen (in true +0.5 isometric screen perspective)
      const lsTL = isoToScreen(lapX + 0.05, lapY, 1.12, ox, oy);
      ctx.save();
      ctx.translate(lsTL.x, lsTL.y);
      ctx.transform(1, 0.5, 0, 1, 0, 0); // Shear along X axis (+0.5 slope)

      // Tab Bar
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 20, 1.8);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(1, 0.4, 4, 1);

      // Syntax-highlighted code lines
      ctx.fillStyle = '#38bdf8'; // Cyan keyword
      ctx.fillRect(1, 2.8, 6, 1.2);
      ctx.fillStyle = '#f472b6'; // Pink identifier
      ctx.fillRect(8, 2.8, 7, 1.2);

      ctx.fillStyle = '#34d399'; // Emerald function / string
      ctx.fillRect(3, 4.8, 12, 1.2);

      ctx.fillStyle = '#a78bfa'; // Purple statement
      ctx.fillRect(3, 6.8, 8, 1.2);
      ctx.fillStyle = '#fbbf24'; // Amber parameter
      ctx.fillRect(12, 6.8, 4, 1.2);

      ctx.fillStyle = '#38bdf8'; // Cyan closing
      ctx.fillRect(1, 8.8, 10, 1.2);

      // Glowing cursor
      ctx.fillStyle = '#67e8f9';
      ctx.fillRect(12, 8.8, 1.2, 1.2);

      ctx.restore();

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

      // Mon Visualizer Lines (in true +0.5 isometric screen perspective)
      const msTL = isoToScreen(monStandX + 0.05, monStandY, 1.31, ox, oy);
      ctx.save();
      ctx.translate(msTL.x, msTL.y);
      ctx.transform(1, 0.5, 0, 1, 0, 0); // Shear along X axis (+0.5 slope)

      // Telemetry / Terminal Header Bar
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 17, 1.8);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(1, 0.4, 2, 1);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(4, 0.4, 2, 1);

      // Terminal Visualizer Lines
      ctx.fillStyle = '#818cf8';
      ctx.fillRect(1, 2.8, 12, 1.2);
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(1, 4.8, 9, 1.2);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(3, 6.8, 11, 1.2);
      ctx.fillStyle = '#34d399';
      ctx.fillRect(1, 8.8, 8, 1.2);
      // Activity indicator
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(10, 8.8, 4, 1.2);

      ctx.restore();

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

    // --- Architectural 4-Tier Bookshelf (Solid Frame, Clear Corners, Recessed Books, x: 0.1, y: 3.8) ---
    drawBookshelf(ctx, gx, gy, ox, oy) {
      const W = 0.65;  // Depth along X
      const L = 2.50;  // Length along Y
      const H = 2.45;  // Total Height

      // Helper quad drawers with exact isometric perspective
      const fillFront = (x, y0, y1, z0, z1, col) => {
        const p0 = isoToScreen(x, y0, z0, ox, oy);
        const p1 = isoToScreen(x, y1, z0, ox, oy);
        const p2 = isoToScreen(x, y1, z1, ox, oy);
        const p3 = isoToScreen(x, y0, z1, ox, oy);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.fill();
      };

      const fillSide = (x0, x1, y, z0, z1, col) => {
        const p0 = isoToScreen(x0, y, z0, ox, oy);
        const p1 = isoToScreen(x1, y, z0, ox, oy);
        const p2 = isoToScreen(x1, y, z1, ox, oy);
        const p3 = isoToScreen(x0, y, z1, ox, oy);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.fill();
      };

      const fillTop = (x0, x1, y0, y1, z, col) => {
        const p0 = isoToScreen(x0, y0, z, ox, oy);
        const p1 = isoToScreen(x1, y0, z, ox, oy);
        const p2 = isoToScreen(x1, y1, z, ox, oy);
        const p3 = isoToScreen(x0, y1, z, ox, oy);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.fill();
      };

      const backX = gx + 0.06;
      const frontX = gx + W;
      const yStart = gy;
      const yEnd = gy + L;

      // 1. Backing Wall Panel & Base Plinth
      // Dark Cavity Backing (Inside the bookshelf)
      fillFront(backX, yStart + 0.04, yEnd - 0.04, 0.14, H - 0.10, '#2d1406');
      // Left Inner Panel
      fillSide(backX, frontX, yStart + 0.04, 0.14, H - 0.10, '#3a1a08');
      
      // Bottom Base Plinth (Elevates bookcase from ground)
      fillFront(frontX, yStart, yEnd, 0, 0.14, '#78350f');
      fillSide(gx, frontX, yEnd, 0, 0.14, '#58240a');
      fillTop(backX, frontX, yStart, yEnd, 0.14, '#92400e');

      // 2. Shelves & Books (Rendered strictly tier by tier from bottom to top)
      // Books depth: sits from backX + 0.03 to backX + 0.36 (recessed inside by ~0.23 units from front edge!)
      const bBackX = backX + 0.03;
      const bFrontX = backX + 0.36;

      const renderBook = (y0, y1, zBase, h, col, foil) => {
        // Front Spine (facing room, South-East)
        fillFront(bFrontX, y0, y1, zBase, zBase + h, col);
        if (foil) {
          fillFront(bFrontX + 0.002, y0 + 0.02, y1 - 0.02, zBase + h * 0.70, zBase + h * 0.70 + 0.025, '#fbbf24');
          fillFront(bFrontX + 0.002, y0 + 0.02, y1 - 0.02, zBase + h * 0.30, zBase + h * 0.30 + 0.025, '#fbbf24');
        }
        // Top Page Edge (Antique white paper)
        fillTop(bBackX, bFrontX, y0, y1, zBase + h, '#fef3c7');
        // Right Side (visible when book is at the right edge of a group)
        fillSide(bBackX, bFrontX, y1, zBase, zBase + h, '#0f172a');
      };

      // Tier 1 Books (z = 0.14): Heavy Academic Volumes
      const t1Books = [
        { y: yStart + 0.12, w: 0.22, h: 0.44, col: '#1e3a8a', foil: true },
        { y: yStart + 0.36, w: 0.20, h: 0.42, col: '#065f46', foil: true },
        { y: yStart + 0.58, w: 0.26, h: 0.46, col: '#b45309', foil: true },
        { y: yStart + 0.86, w: 0.22, h: 0.40, col: '#831843', foil: true },
        { y: yStart + 1.34, w: 0.24, h: 0.45, col: '#1e293b', foil: true },
        { y: yStart + 1.60, w: 0.28, h: 0.43, col: '#0369a1', foil: true },
        { y: yStart + 1.90, w: 0.22, h: 0.41, col: '#4338ca', foil: true },
        { y: yStart + 2.14, w: 0.22, h: 0.44, col: '#047857', foil: true }
      ];
      t1Books.forEach(b => renderBook(b.y, b.y + b.w, 0.14, b.h, b.col, b.foil));

      // Shelf 2 Plank (z = 0.70)
      fillTop(backX, frontX, yStart, yEnd, 0.70, '#92400e');
      fillFront(frontX, yStart, yEnd, 0.65, 0.70, '#78350f');
      fillSide(gx, frontX, yEnd, 0.65, 0.70, '#58240a');

      // Tier 2 Books (z = 0.70): Textbooks & Math Treatises
      const t2Books = [
        { y: yStart + 0.12, w: 0.25, h: 0.42, col: '#0d9488', foil: true },
        { y: yStart + 0.39, w: 0.24, h: 0.40, col: '#d97706', foil: true },
        { y: yStart + 0.65, w: 0.28, h: 0.44, col: '#4f46e5', foil: true },
        { y: yStart + 1.34, w: 0.26, h: 0.42, col: '#7c3aed', foil: true },
        { y: yStart + 1.62, w: 0.22, h: 0.38, col: '#be123c', foil: true }
      ];
      t2Books.forEach(b => renderBook(b.y, b.y + b.w, 0.70, b.h, b.col, b.foil));

      // Horizontal Stacked Books on Tier 2 Right Bay
      const hx0 = bBackX, hx1 = bFrontX + 0.04;
      const hy0 = yStart + 1.88, hy1 = yStart + 2.38;
      // Book 1
      fillFront(hx1, hy0, hy1, 0.70, 0.77, '#ea580c');
      fillSide(hx0, hx1, hy1, 0.70, 0.77, '#9a3412');
      fillTop(hx0, hx1, hy0, hy1, 0.77, '#c2410c');
      // Book 2
      fillFront(hx1 - 0.02, hy0 + 0.03, hy1 - 0.03, 0.77, 0.84, '#0284c7');
      fillSide(hx0, hx1 - 0.02, hy1 - 0.03, 0.77, 0.84, '#075985');
      fillTop(hx0, hx1 - 0.02, hy0 + 0.03, hy1 - 0.03, 0.84, '#0369a1');

      // Shelf 3 Plank (z = 1.28)
      fillTop(backX, frontX, yStart, yEnd, 1.28, '#92400e');
      fillFront(frontX, yStart, yEnd, 1.23, 1.28, '#78350f');
      fillSide(gx, frontX, yEnd, 1.23, 1.28, '#58240a');

      // Tier 3 Books (z = 1.28)
      const t3Books = [
        { y: yStart + 0.12, w: 0.24, h: 0.42, col: '#e11d48', foil: true },
        { y: yStart + 0.38, w: 0.22, h: 0.39, col: '#15803d', foil: true },
        { y: yStart + 0.62, w: 0.26, h: 0.41, col: '#a16207', foil: true },
        { y: yStart + 1.34, w: 0.24, h: 0.40, col: '#0284c7', foil: true },
        { y: yStart + 1.60, w: 0.22, h: 0.38, col: '#6d28d9', foil: true }
      ];
      t3Books.forEach(b => renderBook(b.y, b.y + b.w, 1.28, b.h, b.col, b.foil));

      // Delicate Potted Succulent on Tier 3 (firmly placed on the shelf)
      const potY = yStart + 2.05;
      fillFront(bFrontX - 0.02, potY - 0.12, potY + 0.12, 1.28, 1.44, '#c2410c');
      fillSide(bBackX + 0.08, bFrontX - 0.02, potY + 0.12, 1.28, 1.44, '#9a3412');
      fillTop(bBackX + 0.08, bFrontX - 0.02, potY - 0.12, potY + 0.12, 1.44, '#7c2d12');
      // Green succulent rosettes
      const succulentP = isoToScreen(bBackX + 0.18, potY, 1.46, ox, oy);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(succulentP.x, succulentP.y - 2, 6, 0, Math.PI * 2);
      ctx.arc(succulentP.x - 4, succulentP.y - 5, 4, 0, Math.PI * 2);
      ctx.arc(succulentP.x + 4, succulentP.y - 5, 4, 0, Math.PI * 2);
      ctx.fill();

      // Shelf 4 Plank (z = 1.86)
      fillTop(backX, frontX, yStart, yEnd, 1.86, '#92400e');
      fillFront(frontX, yStart, yEnd, 1.81, 1.86, '#78350f');
      fillSide(gx, frontX, yEnd, 1.81, 1.86, '#58240a');

      // Tier 4 Books / Archival Binders (z = 1.86)
      const t4Books = [
        { y: yStart + 0.14, w: 0.26, h: 0.36, col: '#334155', foil: false },
        { y: yStart + 0.42, w: 0.26, h: 0.36, col: '#334155', foil: false },
        { y: yStart + 0.70, w: 0.26, h: 0.36, col: '#334155', foil: false },
        { y: yStart + 1.34, w: 0.26, h: 0.36, col: '#475569', foil: false },
        { y: yStart + 1.62, w: 0.26, h: 0.36, col: '#475569', foil: false },
        { y: yStart + 1.90, w: 0.26, h: 0.36, col: '#475569', foil: false }
      ];
      t4Books.forEach(b => {
        renderBook(b.y, b.y + b.w, 1.86, b.h, b.col, false);
        // White archive label on spine
        fillFront(bFrontX + 0.002, b.y + 0.06, b.y + b.w - 0.06, 1.86 + 0.12, 1.86 + 0.24, '#f8fafc');
      });

      // 3. FRONT ARCHITECTURAL CASING, CORNERS & DIVISION STILES (Drawn LAST on top!)
      const cFrame = '#78350f';
      const cSide = '#58240a';
      const cTop = '#92400e';

      // Left Vertical Front Stile (y = yStart)
      fillFront(frontX, yStart, yStart + 0.08, 0, H - 0.12, cFrame);
      // Right Vertical Front Stile (y = yEnd - 0.08)
      fillFront(frontX, yEnd - 0.08, yEnd, 0, H - 0.12, cFrame);
      // Central Vertical Bay Divider Stile (y = mid)
      const midY = (yStart + yEnd) / 2;
      fillFront(frontX, midY - 0.04, midY + 0.04, 0.14, H - 0.12, '#6b2d0b');

      // Right Solid Side Panel (Whole outer wall facing South-West)
      fillSide(gx, frontX, yEnd, 0, H, cSide);

      // Top Projecting Cornice Crown Molding
      const cx0 = gx - 0.04, cx1 = frontX + 0.04;
      const cy0 = yStart - 0.04, cy1 = yEnd + 0.04;
      fillFront(cx1, cy0, cy1, H - 0.12, H, cTop);
      fillSide(cx0, cx1, cy1, H - 0.12, H, cFrame);
      fillTop(cx0, cx1, cy0, cy1, H, '#a16207');

      // Delicate ivy vine cascading gracefully along the side panel (never obscuring books!)
      const ivyX = cx1 - 0.02;
      const ivyY = cy1 + 0.01;
      const ivyStart = isoToScreen(ivyX, ivyY, H - 0.06, ox, oy);
      ctx.fillStyle = '#16a34a';
      for (let s = 0; s < 6; s++) {
        ctx.beginPath();
        ctx.arc(ivyStart.x + ((s % 2) ? 3 : -2), ivyStart.y + s * 9, 3.5, 0, Math.PI * 2);
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
      // North Armrest (Top-Right on screen, gy to gy+0.22)
      this.drawBox(ctx, gx + 0.28, gy, 0.42, 0.57, 0.22, 0.32, '#2563eb', '#1d4ed8', '#1e40af', ox, oy);
      // Fluffy Throw Pillows (Drawn before South armrest so South armrest naturally frames the pillow without occlusion glitch!)
      this.drawBox(ctx, gx + 0.30, gy + 0.26, 0.42, 0.24, 0.32, 0.25, '#f59e0b', '#d97706', '#b45309', ox, oy);
      this.drawBox(ctx, gx + 0.30, gy + 1.42, 0.42, 0.24, 0.32, 0.25, '#f59e0b', '#d97706', '#b45309', ox, oy);
      // South Armrest (Bottom-Left on screen, gy+1.78 to gy+2.00)
      this.drawBox(ctx, gx + 0.28, gy + 1.78, 0.42, 0.57, 0.22, 0.32, '#2563eb', '#1d4ed8', '#1e40af', ox, oy);

      // Low Solid Walnut Coffee Table
      this.drawBox(ctx, gx + 1.25, gy + 0.45, 0, 0.85, 1.10, 0.32, '#78350f', '#58240a', '#451a03', ox, oy);
      // Tea Set & Cup
      const cupP = isoToScreen(gx + 1.65, gy + 1.0, 0.33, ox, oy);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cupP.x, cupP.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Dining Table Set (Solid Turned Teak Table, 4 Legs, Scandinavian Dining Chairs, x: 6, y: 5) ---
    // --- Dining Table Set (Solid Turned Teak Table, 4 Legs, Scandinavian Dining Chairs, x: 6, y: 5) ---
    drawDiningTable(ctx, gx, gy, ox, oy) {
      // 1. Soft Ambient Floor Shadow under table
      const s0 = isoToScreen(gx + 0.25, gy + 0.10, 0.01, ox, oy);
      const s1 = isoToScreen(gx + 1.85, gy + 0.10, 0.01, ox, oy);
      const s2 = isoToScreen(gx + 1.85, gy + 1.40, 0.01, ox, oy);
      const s3 = isoToScreen(gx + 0.25, gy + 1.40, 0.01, ox, oy);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
      ctx.beginPath();
      ctx.moveTo(s0.x, s0.y); ctx.lineTo(s1.x, s1.y); ctx.lineTo(s2.x, s2.y); ctx.lineTo(s3.x, s3.y);
      ctx.closePath();
      ctx.fill();

      const cLeg = '#78350f', cLegL = '#58240a', cLegR = '#451a03';
      const cTop = '#b45309', cTopL = '#92400e', cTopR = '#78350f';
      const cApron = '#78350f', cApronL = '#58240a', cApronR = '#451a03';

      // 2. North Chair (Across the table, facing South towards room)
      const ncx = gx + 0.75, ncy = gy - 0.25;
      const chW = 0.60, chD = 0.40, chH = 0.44;
      // 4 Chair Legs
      this.drawBox(ctx, ncx + 0.03, ncy + 0.03, 0, 0.05, 0.05, chH, cLeg, cLegL, cLegR, ox, oy);
      this.drawBox(ctx, ncx + chW - 0.08, ncy + 0.03, 0, 0.05, 0.05, chH, cLeg, cLegL, cLegR, ox, oy);
      this.drawBox(ctx, ncx + 0.03, ncy + chD - 0.08, 0, 0.05, 0.05, chH, cLeg, cLegL, cLegR, ox, oy);
      this.drawBox(ctx, ncx + chW - 0.08, ncy + chD - 0.08, 0, 0.05, 0.05, chH, cLeg, cLegL, cLegR, ox, oy);
      // Padded Linen Seat Cushion
      this.drawBox(ctx, ncx, ncy, chH - 0.04, chW, chD, 0.05, '#f1f5f9', '#cbd5e1', '#94a3b8', ox, oy);
      // Backrest along North edge
      this.drawBox(ctx, ncx, ncy, chH, chW, 0.06, 0.38, cTop, cTopL, cTopR, ox, oy);

      // 3. Dining Table (w: 1.5, d: 1.1, H: 0.74)
      const tx = gx + 0.30, ty = gy + 0.15;
      const tW = 1.50, tD = 1.10, tH = 0.74;
      const legW = 0.09;
      const topThick = 0.06;
      const underH = tH - topThick;

      // 4 Solid Turned Table Legs
      this.drawBox(ctx, tx + 0.05, ty + 0.05, 0, legW, legW, underH, cLeg, cLegL, cLegR, ox, oy);
      this.drawBox(ctx, tx + tW - legW - 0.05, ty + 0.05, 0, legW, legW, underH, cLeg, cLegL, cLegR, ox, oy);
      this.drawBox(ctx, tx + 0.05, ty + tD - legW - 0.05, 0, legW, legW, underH, cLeg, cLegL, cLegR, ox, oy);
      this.drawBox(ctx, tx + tW - legW - 0.05, ty + tD - legW - 0.05, 0, legW, legW, underH, cLeg, cLegL, cLegR, ox, oy);

      // Table Underframe Apron Rails
      this.drawBox(ctx, tx + 0.05, ty + tD - legW - 0.03, underH - 0.08, tW - 0.10, 0.04, 0.08, cApron, cApronL, cApronR, ox, oy);
      this.drawBox(ctx, tx + tW - legW - 0.03, ty + 0.05, underH - 0.08, 0.04, tD - 0.10, 0.08, cApron, cApronL, cApronR, ox, oy);

      // Solid Teak Tabletop Board
      this.drawBox(ctx, tx, ty, underH, tW, tD, topThick, cTop, cTopL, cTopR, ox, oy);

      // 4. Fresh Fruit Centerpiece on Ceramic Plate
      const fP = isoToScreen(tx + tW / 2, ty + tD / 2, tH, ox, oy);
      // Ceramic Platter
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(fP.x, fP.y, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Fresh Apples & Citrus
      ctx.fillStyle = '#ef4444'; // Red Apple
      ctx.beginPath();
      ctx.arc(fP.x - 4, fP.y - 2, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ea580c'; // Tangerine
      ctx.beginPath();
      ctx.arc(fP.x + 4, fP.y - 1, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e'; // Green Pear
      ctx.beginPath();
      ctx.arc(fP.x, fP.y - 5, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // 5. South Chair (Foreground, facing North into table)
      const scx = gx + 0.75, scy = gy + 1.35;
      // 4 Chair Legs
      this.drawBox(ctx, scx + 0.03, scy + 0.03, 0, 0.05, 0.05, chH, cLeg, cLegL, cLegR, ox, oy);
      this.drawBox(ctx, scx + chW - 0.08, scy + 0.03, 0, 0.05, 0.05, chH, cLeg, cLegL, cLegR, ox, oy);
      this.drawBox(ctx, scx + 0.03, scy + chD - 0.08, 0, 0.05, 0.05, chH, cLeg, cLegL, cLegR, ox, oy);
      this.drawBox(ctx, scx + chW - 0.08, scy + chD - 0.08, 0, 0.05, 0.05, chH, cLeg, cLegL, cLegR, ox, oy);
      // Padded Linen Seat Cushion
      this.drawBox(ctx, scx, scy, chH - 0.04, chW, chD, 0.05, '#f1f5f9', '#cbd5e1', '#94a3b8', ox, oy);
      // Backrest along South edge
      this.drawBox(ctx, scx, scy + chD - 0.06, chH, chW, 0.06, 0.38, cTop, cTopL, cTopR, ox, oy);
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

      // 1. Structural Dark Iron Posts (rising from z: 0 to H)
      const postCol = '#334155';
      const postL = '#1e293b';
      const postR = '#0f172a';
      const pw = 0.08;
      this.drawBox(ctx, gx, gy, 0, pw, pw, H, postCol, postL, postR, ox, oy);
      this.drawBox(ctx, gx + W - pw, gy, 0, pw, pw, H, postCol, postL, postR, ox, oy);
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

        // Glowing Code Screen (in true +0.5 isometric screen perspective)
        const dTL = isoToScreen(gx + 0.75, gy + 0.30, deskH + 0.39, ox, oy);
        ctx.save();
        ctx.translate(dTL.x, dTL.y);
        ctx.transform(1, 0.5, 0, 1, 0, 0);
        ctx.fillStyle = scrCol;
        ctx.fillRect(1, 2, 18, 1.4);
        ctx.fillRect(4, 4.2, 13, 1.4);
        ctx.fillRect(1, 6.4, 15, 1.4);
        ctx.restore();

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

        // Glowing Code Screen (in true +0.5 isometric screen perspective)
        const dTL = isoToScreen(gx + 0.75, gy + D - 0.30, deskH + 0.39, ox, oy);
        ctx.save();
        ctx.translate(dTL.x, dTL.y);
        ctx.transform(1, 0.5, 0, 1, 0, 0);
        ctx.fillStyle = scrCol;
        ctx.fillRect(1, 2, 18, 1.4);
        ctx.fillRect(4, 4.2, 13, 1.4);
        ctx.fillRect(1, 6.4, 15, 1.4);
        ctx.restore();

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

      // 4. Foreground Structural Dark Iron Post (Front-Right / Bottom-Right Corner at gx + W - pw, gy + D - pw)
      // Drawn after desk and mattress so it seamlessly encloses the corner and rises from z: 0 to H
      this.drawBox(ctx, gx + W - pw, gy + D - pw, 0, pw, pw, H, postCol, postL, postR, ox, oy);
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
      // North Armrest (Top-Right on screen, gy to gy+0.22)
      this.drawBox(ctx, gx + 0.28, gy, 0.42, 0.57, 0.22, 0.32, '#2563eb', '#1d4ed8', '#1e40af', ox, oy);
      // Fluffy Orange Throw Pillows (Drawn before South armrest so South armrest naturally frames the pillow without occlusion glitch!)
      this.drawBox(ctx, gx + 0.30, gy + 0.26, 0.42, 0.24, 0.32, 0.25, '#f59e0b', '#d97706', '#b45309', ox, oy);
      this.drawBox(ctx, gx + 0.30, gy + 1.42, 0.42, 0.24, 0.32, 0.25, '#f59e0b', '#d97706', '#b45309', ox, oy);
      // South Armrest (Bottom-Left on screen, gy+1.78 to gy+2.00)
      this.drawBox(ctx, gx + 0.28, gy + 1.78, 0.42, 0.57, 0.22, 0.32, '#2563eb', '#1d4ed8', '#1e40af', ox, oy);

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

      // Triple Curved Displays Frame (along X axis at gy + 0.20)
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

      // Real-Time Loss Graph Curves in Exact Screen Perspective (+0.5 isometric shear along X)
      const scrTL = isoToScreen(gx + 0.40, gy + 0.20, 1.32, ox, oy);
      ctx.save();
      ctx.translate(scrTL.x, scrTL.y);
      ctx.transform(1, 0.5, 0, 1, 0, 0); // Shear along X axis (+0.5 slope)

      // Top Status Indicators
      ctx.fillStyle = '#06b6d4'; ctx.fillRect(2, 2, 2, 2);
      ctx.fillStyle = '#10b981'; ctx.fillRect(6, 2, 2, 2);
      ctx.font = 'bold 3.2px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('CLUSTER-GPU-01 • DPO LOSS', 11, 4.5);

      // Coordinate Grid Lines (Faint horizontal reference lines)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.20)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(4, 7.5); ctx.lineTo(50, 7.5);
      ctx.moveTo(4, 11.5); ctx.lineTo(50, 11.5);
      ctx.stroke();

      // Cyan Loss Curve (Gentle decaying convergence curve, stays within safe middle band)
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(4, 7.2);
      ctx.bezierCurveTo(15, 9.5, 28, 10.6, 50, 10.8);
      ctx.stroke();

      // Purple Reference Margin Curve (Subtle reference baseline tracking below primary loss)
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(4, 8.2);
      ctx.bezierCurveTo(16, 10.0, 30, 11.2, 50, 11.4);
      ctx.stroke();

      // Telemetry Metric (Cleanly separated at bottom margin)
      ctx.fillStyle = '#34d399';
      ctx.font = '2.8px monospace';
      ctx.fillText('loss: 0.1428 | lr: 5e-6', 4, 14.5);

      ctx.restore();
    }

    // --- Frosted Glass Whiteboard with DPO Math & Architecture (x: 26.2, y: 4.0) ---
    drawGlassWhiteboard(ctx, gx, gy, ox, oy) {
      const W = 0.08;
      const L = 2.40;
      const H = 1.60;
      const baseZ = 0.60;

      // Chrome Frame
      this.drawBox(ctx, gx, gy, baseZ, W, L, H, '#94a3b8', '#64748b', '#475569', ox, oy);

      // Translucent Frosted Glass Panel
      const g0 = isoToScreen(gx, gy + 0.05, baseZ + 0.05, ox, oy);
      const g1 = isoToScreen(gx, gy + L - 0.05, baseZ + 0.05, ox, oy);
      const g2 = isoToScreen(gx, gy + L - 0.05, baseZ + H - 0.05, ox, oy);
      const g3 = isoToScreen(gx, gy + 0.05, baseZ + H - 0.05, ox, oy);
      ctx.fillStyle = 'rgba(224, 242, 254, 0.35)';
      ctx.beginPath();
      ctx.moveTo(g0.x, g0.y); ctx.lineTo(g1.x, g1.y); ctx.lineTo(g2.x, g2.y); ctx.lineTo(g3.x, g3.y);
      ctx.closePath();
      ctx.fill();

      // Whiteboard Stand Legs (Two Chrome Support Posts to Floor)
      const leg1 = isoToScreen(gx, gy + 0.25, 0, ox, oy);
      const leg1T = isoToScreen(gx, gy + 0.25, baseZ, ox, oy);
      const leg2 = isoToScreen(gx, gy + L - 0.25, 0, ox, oy);
      const leg2T = isoToScreen(gx, gy + L - 0.25, baseZ, ox, oy);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(leg1.x, leg1.y); ctx.lineTo(leg1T.x, leg1T.y);
      ctx.moveTo(leg2.x, leg2.y); ctx.lineTo(leg2T.x, leg2T.y);
      ctx.stroke();

      // Mathematical Formulas Projected in Exact Isometric Perspective (-0.5 shear along Y)
      // Top-Left corner of the whiteboard writing surface in screen coordinates
      const pTL = isoToScreen(gx, gy + L - 0.12, baseZ + H - 0.14, ox, oy);
      ctx.save();
      ctx.translate(pTL.x, pTL.y);
      ctx.transform(1, -0.5, 0, 1, 0, 0); // Shear along Y axis (-0.5 slope)

      // Section Header: Direct Preference Optimization (Scaled to fit within panel)
      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 2.8px monospace';
      ctx.fillText('DIRECT PREFERENCE OPTIMIZATION', 4, 6.5);

      // Cyan Underline
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.6)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(4, 8.5); ctx.lineTo(54, 8.5);
      ctx.stroke();

      // Formula Line 1: DPO Objective Loss Function
      ctx.fillStyle = '#0369a1';
      ctx.font = '2.5px monospace';
      ctx.fillText('L(θ) = -E[log σ(β·log(π_θ/π_ref))]', 4, 14.5);

      // Formula Line 2: Alignment Pipeline Flow
      ctx.fillStyle = '#047857';
      ctx.font = '2.4px monospace';
      ctx.fillText('Prompt → SFT → Pairs → Implicit Reward', 4, 21.5);

      // Formula Line 3: Gradient Vector Flow
      ctx.fillStyle = '#7c3aed';
      ctx.font = '2.3px monospace';
      ctx.fillText('∇_θ L = -β·E[σ(-Δr)·(∇log π_w - ∇log π_l)]', 4, 28.5);

      // Mini Coordinate Axes for Implicit Reward Margin
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.45)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(4, 38); ctx.lineTo(54, 38); // x-axis
      ctx.moveTo(4, 38); ctx.lineTo(4, 32);  // y-axis
      ctx.stroke();

      // Sigmoid Preference Probability Curve on Glass
      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(5, 37.5);
      ctx.bezierCurveTo(18, 37.5, 32, 34.0, 52, 34.0);
      ctx.stroke();

      // Curve formula annotation
      ctx.fillStyle = '#0891b2';
      ctx.font = '2.2px monospace';
      ctx.fillText('P(w ≻ l) = σ(r_w - r_l)', 12, 32.5);

      ctx.restore();
    }

    // --- Espresso & Beverage Bar (Solid Marble Island & Chrome Machine, x: 19.5, y: 7.2) ---
    drawEspressoBar(ctx, gx, gy, ox, oy) {
      // Marble Countertop Island (w: 1.8, d: 1.2, h: 0.85)
      this.drawBox(ctx, gx, gy, 0, 1.80, 1.20, 0.85, '#f8fafc', '#e2e8f0', '#cbd5e1', ox, oy);

      // Italian Chrome Espresso Machine (w: 0.70, d: 0.55, h: 0.45)
      this.drawBox(ctx, gx + 0.45, gy + 0.35, 0.85, 0.70, 0.55, 0.45, '#94a3b8', '#64748b', '#475569', ox, oy);

      const barTopZ = 0.85;
      const mBaseZ = barTopZ + 0.45;
      // Chrome cup warming tray on top of machine
      const mTop = isoToScreen(gx + 0.80, gy + 0.62, mBaseZ, ox, oy);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.ellipse(mTop.x, mTop.y, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ceramic Coffee Mug with Saucer & Latte Art
      const mP = isoToScreen(gx + 1.40, gy + 0.65, barTopZ + 0.01, ox, oy);
      // Saucer
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.ellipse(mP.x, mP.y, 8, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Orange ceramic mug body
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.ellipse(mP.x, mP.y - 4, 5.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Rich Crema / Coffee surface
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(mP.x, mP.y - 4, 4, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(mP.x, mP.y - 4, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Glass Water Carafe
      const cP = isoToScreen(gx + 0.25, gy + 0.85, barTopZ + 0.01, ox, oy);
      ctx.fillStyle = 'rgba(224, 242, 254, 0.65)';
      ctx.beginPath();
      ctx.ellipse(cP.x, cP.y - 6, 4, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.stroke();
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

    // --- 1. Grand Mahogany Book Wall with Brass Rolling Ladder (North Wall) ---
    drawLibraryBookWall(ctx, gx, gy, ox, oy, W = 3.6, ladderStyle = 1) {
      const D = 0.55, H = 2.3;
      const postW = 0.08;

      // Drop shadow
      this.drawDropShadow(ctx, gx, gy, W, D, ox, oy);

      // 1. Dark interior back-wall lining (gives deep dimensional recess behind books)
      this.drawBox(ctx, gx + 0.04, gy + 0.04, 0.08, W - 0.08, 0.05, H - 0.16, '#261008', '#180803', '#1e0b04', ox, oy);

      // 2. Heavy Molded Base Plinth
      this.drawBox(ctx, gx, gy, 0, W, D, 0.12, '#542516', '#2b110a', '#3f1d12', ox, oy);

      // 3. Side upright pillars and central architectural column
      this.drawBox(ctx, gx, gy, 0.12, postW, D, H - 0.20, '#542516', '#2b110a', '#3f1d12', ox, oy);
      this.drawBox(ctx, gx + W - postW, gy, 0.12, postW, D, H - 0.20, '#542516', '#2b110a', '#3f1d12', ox, oy);
      const midX = gx + W / 2 - postW / 2;
      this.drawBox(ctx, midX, gy, 0.12, postW, D, H - 0.20, '#5c2b16', '#2e1207', '#451a03', ox, oy);

      // 4. Five Shelves Across the 2 Bays
      const shelvesZ = [0.12, 0.52, 0.92, 1.32, 1.72];
      const shelfH = 0.045;
      const shelfD = D - 0.04;

      const palette = [
        { spine: '#881337', rib: '#fde047', top: '#fef3c7', side: '#4c0519' }, // Burgundy / Gold
        { spine: '#1e3a8a', rib: '#93c5fd', top: '#f8fafc', side: '#0f172a' }, // Oxford Blue / Silver
        { spine: '#14532d', rib: '#86efac', top: '#f0fdf4', side: '#052e16' }, // Forest Green / Gold
        { spine: '#78350f', rib: '#fef08a', top: '#fef3c7', side: '#451a03' }, // Antique Leather
        { spine: '#581c87', rib: '#f5d0fe', top: '#faf5ff', side: '#3b0764' }, // Royal Plum
        { spine: '#991b1b', rib: '#fde047', top: '#fef3c7', side: '#450a0a' }, // Crimson
        { spine: '#0f766e', rib: '#99f6e4', top: '#f0fdfa', side: '#134e4a' }, // Deep Teal
        { spine: '#b45309', rib: '#fef08a', top: '#fef3c7', side: '#78350f' }, // Amber Folio
        { spine: '#312e81', rib: '#c7d2fe', top: '#e0e7ff', side: '#1e1b4b' }  // Midnight Indigo
      ];

      shelvesZ.forEach((sz, shelfIdx) => {
        // Shelf plank across the whole width
        this.drawBox(ctx, gx + postW * 0.5, gy + 0.04, sz, W - postW, shelfD, shelfH, '#78350f', '#451a03', '#5c2b16', ox, oy);

        // Populate Left Bay and Right Bay
        const bays = [
          { startX: gx + postW + 0.02, endX: midX - 0.02 },
          { startX: midX + postW + 0.02, endX: gx + W - postW - 0.02 }
        ];

        bays.forEach((bay, bayIdx) => {
          const bayW = bay.endX - bay.startX;
          const numBooks = 13;
          const bookW = bayW / numBooks;

          // Brass bookends at ends
          const beLeft = isoToScreen(bay.startX, gy + D - 0.02, sz + shelfH, ox, oy);
          ctx.fillStyle = '#d97706';
          ctx.fillRect(beLeft.x - 2, beLeft.y - 8, 3, 8);

          for (let b = 0; b < numBooks; b++) {
            const bx = bay.startX + b * bookW;
            const seed = (shelfIdx * 17 + bayIdx * 11 + b * 7);
            const p = palette[seed % palette.length];
            const bH = 0.31 + (seed % 5) * 0.015;
            const bDepth = shelfD * 0.85;

            // Book 3D Box
            this.drawBox(ctx, bx, gy + 0.08, sz + shelfH, bookW * 0.88, bDepth, bH, p.top, p.spine, p.side, ox, oy);

            // Embossed Gold Spine Ribs on the front-facing spine
            const pSpineBottom = isoToScreen(bx + bookW * 0.44, gy + 0.08 + bDepth, sz + shelfH, ox, oy);
            const spineScreenH = bH * 32;
            ctx.strokeStyle = p.rib;
            ctx.lineWidth = 0.8;
            for (let rib = 1; rib <= 3; rib++) {
              const ry = pSpineBottom.y - spineScreenH * (0.22 * rib + 0.12);
              ctx.beginPath();
              ctx.moveTo(pSpineBottom.x - 2.5, ry);
              ctx.lineTo(pSpineBottom.x + 2.5, ry);
              ctx.stroke();
            }
          }

          const beRight = isoToScreen(bay.endX, gy + D - 0.02, sz + shelfH, ox, oy);
          ctx.fillStyle = '#d97706';
          ctx.fillRect(beRight.x - 1, beRight.y - 8, 3, 8);
        });
      });

      // 5. Crown Cornice / Header with Dentil Moulding
      this.drawBox(ctx, gx - 0.04, gy - 0.02, H - 0.12, W + 0.08, D + 0.06, 0.14, '#6b2a16', '#341308', '#4a1b0d', ox, oy);
      // Gold inlay cornice band
      const cP0 = isoToScreen(gx - 0.04, gy + D + 0.04, H - 0.04, ox, oy);
      const cP1 = isoToScreen(gx + W + 0.04, gy + D + 0.04, H - 0.04, ox, oy);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cP0.x, cP0.y);
      ctx.lineTo(cP1.x, cP1.y);
      ctx.stroke();

      // 6. Brass Rolling Ladder Rail
      const railZ = 1.88;
      const r0 = isoToScreen(gx - 0.06, gy + D + 0.06, railZ, ox, oy);
      const r1 = isoToScreen(gx + W + 0.06, gy + D + 0.06, railZ, ox, oy);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(r0.x, r0.y);
      ctx.lineTo(r1.x, r1.y);
      ctx.stroke();

      // Brass Brackets along Rail
      for (const t of [0.08, 0.5, 0.92]) {
        const bp = isoToScreen(gx + W * t, gy + D + 0.06, railZ, ox, oy);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 7. Slanted Rolling Ladder (position varies by ladderStyle)
      const ladderXRatio = ladderStyle === 1 ? 0.35 : 0.72;
      const lx = gx + W * ladderXRatio;
      const lTop = isoToScreen(lx, gy + D + 0.07, railZ, ox, oy);
      const lBot = isoToScreen(lx, gy + D + 0.48, 0, ox, oy);

      // Brass ladder hook at top
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(lTop.x, lTop.y - 3, 3, 0, Math.PI * 2);
      ctx.stroke();

      // Ladder side rails
      ctx.strokeStyle = '#3b180a';
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(lTop.x - 3.5, lTop.y); ctx.lineTo(lBot.x - 3.5, lBot.y);
      ctx.moveTo(lTop.x + 3.5, lTop.y); ctx.lineTo(lBot.x + 3.5, lBot.y);
      ctx.stroke();

      // Brass ladder rungs
      for (let r = 1; r <= 7; r++) {
        const t = r / 8;
        const rx = lTop.x * (1 - t) + lBot.x * t;
        const ry = lTop.y * (1 - t) + lBot.y * t;
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(rx - 3.5, ry); ctx.lineTo(rx + 3.5, ry);
        ctx.stroke();
      }

      // Brass caster wheels at bottom
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(lBot.x - 3.5, lBot.y + 1, 2, 0, Math.PI * 2);
      ctx.arc(lBot.x + 3.5, lBot.y + 1, 2, 0, Math.PI * 2);
      ctx.fill();

      // 8. Cascading Ivy along Cornice
      const ivyStartX = ladderStyle === 1 ? gx + 0.5 : gx + W - 0.9;
      const topP = isoToScreen(ivyStartX, gy + 0.05, H, ox, oy);
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(topP.x, topP.y + 3, 5.5, 0, Math.PI * 2);
      ctx.arc(topP.x + 7, topP.y + 6, 4.5, 0, Math.PI * 2);
      ctx.arc(topP.x + 13, topP.y + 11, 4, 0, Math.PI * 2);
      ctx.arc(topP.x + 18, topP.y + 17, 3, 0, Math.PI * 2);
      ctx.arc(topP.x + 22, topP.y + 24, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- 1B. West Wall Library Stack (Spines Face East (+X), Visible on Right Face) ---
    drawLibraryWestBookWall(ctx, gx, gy, ox, oy, len = 2.6) {
      const W = 0.55, D = len, H = 2.2;
      this.drawDropShadow(ctx, gx, gy, W, D, ox, oy);

      // Base plinth
      this.drawBox(ctx, gx, gy, 0, W, D, 0.12, '#542516', '#2b110a', '#3f1d12', ox, oy);

      // Back lining along West wall
      this.drawBox(ctx, gx, gy + 0.04, 0.12, 0.06, D - 0.08, H - 0.20, '#261008', '#180803', '#1e0b04', ox, oy);

      // Shelves (5 tiers)
      const shelvesZ = [0.12, 0.52, 0.92, 1.32, 1.72];
      const shelfH = 0.045;

      const palette = [
        { spine: '#991b1b', rib: '#fde047', top: '#fef3c7', left: '#450a0a' },
        { spine: '#1e40af', rib: '#93c5fd', top: '#f8fafc', left: '#172554' },
        { spine: '#166534', rib: '#86efac', top: '#f0fdf4', left: '#052e16' },
        { spine: '#854d0e', rib: '#fef08a', top: '#fef3c7', left: '#451a03' },
        { spine: '#6b21a8', rib: '#f5d0fe', top: '#faf5ff', left: '#3b0764' },
        { spine: '#0f766e', rib: '#99f6e4', top: '#f0fdfa', left: '#134e4a' },
        { spine: '#b45309', rib: '#fde047', top: '#fef3c7', left: '#78350f' }
      ];

      shelvesZ.forEach((sz, shelfIdx) => {
        // Shelf plank extending along Y
        this.drawBox(ctx, gx + 0.04, gy + 0.04, sz, W - 0.04, D - 0.08, shelfH, '#78350f', '#451a03', '#5c2b16', ox, oy);

        // Books placed along Y with spines facing East (+X face)
        const numBooks = 12;
        const bookStep = (D - 0.16) / numBooks;
        for (let b = 0; b < numBooks; b++) {
          const by = gy + 0.08 + b * bookStep;
          const seed = shelfIdx * 13 + b * 5;
          const p = palette[seed % palette.length];
          const bH = 0.31 + (seed % 4) * 0.015;

          // Book box with spine on rightCol (+X face)
          this.drawBox(ctx, gx + 0.08, by, sz + shelfH, W * 0.82, bookStep * 0.88, bH, p.top, p.left, p.spine, ox, oy);

          // Gold spine ribbing on the +X facing spine
          const spPoint = isoToScreen(gx + 0.08 + W * 0.82, by + bookStep * 0.44, sz + shelfH, ox, oy);
          const spineH = bH * 32;
          ctx.strokeStyle = p.rib;
          ctx.lineWidth = 0.8;
          for (let rib = 1; rib <= 3; rib++) {
            const ry = spPoint.y - spineH * (0.22 * rib + 0.12);
            ctx.beginPath();
            ctx.moveTo(spPoint.x - 2, ry);
            ctx.lineTo(spPoint.x + 2, ry);
            ctx.stroke();
          }
        }
      });

      // Top Cornice
      this.drawBox(ctx, gx - 0.02, gy - 0.02, H - 0.12, W + 0.06, D + 0.04, 0.14, '#6b2a16', '#341308', '#4a1b0d', ox, oy);
    }

    // --- 1C. Mobile Library Book Cart / Scholarly Book Trolley ---
    drawLibraryBookCart(ctx, gx, gy, ox, oy) {
      const W = 0.95, D = 0.55, H = 0.82;
      this.drawDropShadow(ctx, gx, gy, W, D, ox, oy);

      // 4 Brass Casters
      const casterCol = '#d97706';
      const cR = 0.04;
      for (const [cx, cy] of [[gx + 0.08, gy + 0.08], [gx + W - 0.12, gy + 0.08], [gx + 0.08, gy + D - 0.12], [gx + W - 0.12, gy + D - 0.12]]) {
        this.drawBox(ctx, cx, cy, 0, cR, cR, 0.08, casterCol, '#92400e', '#b45309', ox, oy);
      }

      // Wooden Side Panels & Curved Handles
      const sideW = 0.05;
      this.drawBox(ctx, gx, gy, 0.08, sideW, D, H - 0.08, '#542516', '#2b110a', '#3f1d12', ox, oy);
      this.drawBox(ctx, gx + W - sideW, gy, 0.08, sideW, D, H - 0.08, '#542516', '#2b110a', '#3f1d12', ox, oy);

      // Brass Push Handles at ends
      const hL = isoToScreen(gx + sideW / 2, gy + D / 2, H + 0.08, ox, oy);
      const hR = isoToScreen(gx + W - sideW / 2, gy + D / 2, H + 0.08, ox, oy);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(hL.x, hL.y, 4, 0, Math.PI * 2);
      ctx.arc(hR.x, hR.y, 4, 0, Math.PI * 2);
      ctx.stroke();

      // Two Tiers of Shelves
      const tiers = [0.14, 0.48];
      const bColors = ['#991b1b', '#1e40af', '#166534', '#854d0e', '#581c87', '#0f766e', '#b45309'];

      tiers.forEach((tz, tIdx) => {
        // Shelf bottom
        this.drawBox(ctx, gx + sideW, gy + 0.04, tz, W - sideW * 2, D - 0.08, 0.04, '#78350f', '#451a03', '#5c2b16', ox, oy);

        // Row of 7 books on each shelf
        const numBooks = 7;
        const bW = (W - sideW * 2 - 0.04) / numBooks;
        for (let i = 0; i < numBooks; i++) {
          const bx = gx + sideW + 0.02 + i * bW;
          const col = bColors[(tIdx * 4 + i * 3) % bColors.length];
          const bH = 0.24 + ((i * 3) % 4) * 0.015;
          this.drawBox(ctx, bx, gy + 0.08, tz + 0.04, bW * 0.88, D * 0.72, bH, '#fde68a', col, '#451a03', ox, oy);

          // Spine rib
          const sp = isoToScreen(bx + bW * 0.44, gy + 0.08 + D * 0.72, tz + 0.04, ox, oy);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(sp.x - 2, sp.y - bH * 14);
          ctx.lineTo(sp.x + 2, sp.y - bH * 14);
          ctx.stroke();
        }
      });
    }

    // --- 1D. Illuminated Rare Book Vitrine & Manuscript Cabinet ---
    drawRareBookVitrine(ctx, gx, gy, ox, oy) {
      const W = 2.4, D = 0.55, H = 1.9;
      this.drawDropShadow(ctx, gx, gy, W, D, ox, oy);

      // Dark Walnut Base Cabinet
      this.drawBox(ctx, gx, gy, 0, W, D, 0.45, '#542516', '#2b110a', '#3f1d12', ox, oy);

      // Brass door pulls on lower cabinet
      const pL = isoToScreen(gx + W * 0.35, gy + D + 0.01, 0.25, ox, oy);
      const pR = isoToScreen(gx + W * 0.65, gy + D + 0.01, 0.25, ox, oy);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(pL.x, pL.y, 2, 0, Math.PI * 2);
      ctx.arc(pR.x, pR.y, 2, 0, Math.PI * 2);
      ctx.fill();

      // Interior Velvet Display Cavity
      this.drawBox(ctx, gx + 0.06, gy + 0.04, 0.45, W - 0.12, 0.04, H - 0.55, '#3b0764', '#1e053a', '#2e0854', ox, oy);

      // Glass Shelves with illuminated rare codices & scrolls
      const glassZ = [0.85, 1.30];
      glassZ.forEach((gz, gIdx) => {
        // Brass / Glass shelf
        this.drawBox(ctx, gx + 0.06, gy + 0.04, gz, W - 0.12, D - 0.06, 0.03, 'rgba(186, 230, 253, 0.75)', 'rgba(56, 189, 248, 0.5)', '#0284c7', ox, oy);

        // Displayed items: antique codices on brass stands, rolled scrolls
        const codexCol = gIdx === 0 ? '#991b1b' : '#1e3a8a';
        this.drawBox(ctx, gx + 0.35, gy + 0.12, gz + 0.03, 0.45, 0.32, 0.25, '#fef3c7', codexCol, '#78350f', ox, oy);
        
        // Antique rolled parchment scroll with scarlet ribbon
        const sP = isoToScreen(gx + 1.25, gy + 0.25, gz + 0.03, ox, oy);
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.ellipse(sP.x, sP.y - 4, 14, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sP.x, sP.y - 7);
        ctx.lineTo(sP.x, sP.y - 1);
        ctx.stroke();

        // Leather bound volume with brass clasp
        this.drawBox(ctx, gx + 1.65, gy + 0.12, gz + 0.03, 0.42, 0.30, 0.28, '#fef08a', '#14532d', '#052e16', ox, oy);
      });

      // Fluted Corner Pilasters
      const pw = 0.07;
      this.drawBox(ctx, gx, gy, 0.45, pw, D, H - 0.55, '#542516', '#2b110a', '#3f1d12', ox, oy);
      this.drawBox(ctx, gx + W - pw, gy, 0.45, pw, D, H - 0.55, '#542516', '#2b110a', '#3f1d12', ox, oy);

      // Top Carved Pediment & Cornice
      this.drawBox(ctx, gx - 0.03, gy - 0.02, H - 0.10, W + 0.06, D + 0.04, 0.12, '#6b2a16', '#341308', '#4a1b0d', ox, oy);

      // Subtle Glass reflection across the front
      const g0 = isoToScreen(gx + 0.08, gy + D, 0.48, ox, oy);
      const g1 = isoToScreen(gx + W - 0.08, gy + D, 0.48, ox, oy);
      const g2 = isoToScreen(gx + W - 0.08, gy + D, H - 0.12, ox, oy);
      const g3 = isoToScreen(gx + 0.08, gy + D, H - 0.12, ox, oy);
      ctx.fillStyle = 'rgba(224, 242, 254, 0.12)';
      ctx.beginPath();
      ctx.moveTo(g0.x, g0.y); ctx.lineTo(g1.x, g1.y); ctx.lineTo(g2.x, g2.y); ctx.lineTo(g3.x, g3.y);
      ctx.closePath();
      ctx.fill();

      // Diagonal glass glare sheen
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(g0.x + 20, g0.y - 10);
      ctx.lineTo(g3.x + 45, g3.y + 15);
      ctx.stroke();
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

      // Open Manuscript on Table (True isometric rhombus on tabletop surface)
      const m0 = isoToScreen(gx + 0.55, gy + 0.45, H + 0.005, ox, oy);
      const m1 = isoToScreen(gx + 0.95, gy + 0.45, H + 0.005, ox, oy);
      const m2 = isoToScreen(gx + 0.95, gy + 0.75, H + 0.005, ox, oy);
      const m3 = isoToScreen(gx + 0.55, gy + 0.75, H + 0.005, ox, oy);
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.moveTo(m0.x, m0.y); ctx.lineTo(m1.x, m1.y); ctx.lineTo(m2.x, m2.y); ctx.lineTo(m3.x, m3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Faint lines of calligraphy / math along isometric X
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 0.8;
      for (const my of [0.53, 0.61, 0.67]) {
        const l0a = isoToScreen(gx + 0.58, gy + my, H + 0.006, ox, oy);
        const l0b = isoToScreen(gx + 0.72, gy + my, H + 0.006, ox, oy);
        const l1a = isoToScreen(gx + 0.78, gy + my, H + 0.006, ox, oy);
        const l1b = isoToScreen(gx + 0.92, gy + my, H + 0.006, ox, oy);
        ctx.beginPath();
        ctx.moveTo(l0a.x, l0a.y); ctx.lineTo(l0b.x, l0b.y);
        ctx.moveTo(l1a.x, l1a.y); ctx.lineTo(l1b.x, l1b.y);
        ctx.stroke();
      }

      // Leather-Bound Scholarly Folio Stack on Right Side of Desk
      // Folio 1 (bottom): Burgundy volume
      this.drawBox(ctx, gx + 1.48, gy + 0.46, H, 0.52, 0.42, 0.045, '#fef3c7', '#881337', '#4c0519', ox, oy);
      // Folio 2 (middle): Emerald volume
      this.drawBox(ctx, gx + 1.50, gy + 0.48, H + 0.045, 0.48, 0.38, 0.04, '#fef3c7', '#14532d', '#052e16', ox, oy);
      // Folio 3 (top): Oxford Blue volume, slightly askew
      this.drawBox(ctx, gx + 1.52, gy + 0.51, H + 0.085, 0.44, 0.35, 0.038, '#fef3c7', '#1e3a8a', '#0f172a', ox, oy);

      // Trailing Scarlet Ribbon Bookmark from top folio
      const rib0 = isoToScreen(gx + 1.70, gy + 0.52, H + 0.12, ox, oy);
      const rib1 = isoToScreen(gx + 1.76, gy + 0.90, H + 0.005, ox, oy);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(rib0.x, rib0.y);
      ctx.quadraticCurveTo(rib0.x + 8, rib0.y + 12, rib1.x, rib1.y);
      ctx.stroke();

      // Brass Reading Spectacles on Desk
      const specP = isoToScreen(gx + 1.15, gy + 0.45, H + 0.005, ox, oy);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(specP.x - 3.5, specP.y, 2.5, 0, Math.PI * 2);
      ctx.arc(specP.x + 3.5, specP.y, 2.5, 0, Math.PI * 2);
      ctx.moveTo(specP.x - 1, specP.y - 1);
      ctx.lineTo(specP.x + 1, specP.y - 1);
      ctx.stroke();

      // Brass Magnifying Glass & Inkwell
      const inkP = isoToScreen(gx + 1.82, gy + 0.35, H + 0.01, ox, oy);
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

      // 3. Side Round Table with Novel Stack & Tea
      this.drawBox(ctx, gx + 1.4, gy + 0.35, 0, 0.5, 0.5, 0.52, '#78350f', '#451a03', '#92400e', ox, oy);

      // Stack of 3 novels on side table
      this.drawBox(ctx, gx + 1.42, gy + 0.38, 0.52, 0.24, 0.18, 0.035, '#fef3c7', '#881337', '#4c0519', ox, oy);
      this.drawBox(ctx, gx + 1.44, gy + 0.40, 0.555, 0.22, 0.16, 0.032, '#fef3c7', '#166534', '#052e16', ox, oy);
      this.drawBox(ctx, gx + 1.45, gy + 0.42, 0.587, 0.20, 0.15, 0.030, '#fef3c7', '#1e40af', '#0f172a', ox, oy);

      // Steaming Earl Grey Tea with saucer
      const teaP = isoToScreen(gx + 1.72, gy + 0.62, 0.53, ox, oy);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(teaP.x, teaP.y, 3.5, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350f'; // Earl grey tea
      ctx.beginPath();
      ctx.arc(teaP.x, teaP.y - 1, 2.0, 0, Math.PI * 2);
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

    // ========================================================================
    // 5. ZONE 5: SANMIN HIGH SCHOOL CLASSROOM MODELS (SW2)
    // ========================================================================

    // --- Classic Front-Facing Classroom Blackboard & Clock (Centered on North Wall, facing South towards students) ---
    drawSchoolBlackboard(ctx, gx, gy, ox, oy, width = 5.2) {
      const H = 1.10;
      const elev = 0.90;
      const centerX = gx + width / 2;

      // 1. Wooden Outer Frame & Depth Box along North Wall (running along X, facing +Y)
      this.drawBox(ctx, gx, gy, elev - 0.05, width, 0.08, H + 0.10, '#854d0e', '#713f12', '#58240a', ox, oy);

      // 2. Front Blackboard Face (Facing South-West / Camera at constant Y = gy + 0.085)
      const cp = isoToScreen(centerX, gy + 0.085, elev + H / 2, ox, oy);
      const Wpx = (width - 0.16) * 32;
      const Hpx = H * 32;

      ctx.save();
      ctx.translate(cp.x, cp.y);
      ctx.transform(1, 0.5, 0, 1, 0, 0); // Sheared flat onto the South-facing North partition wall!

      // Deep Matte Emerald Chalkboard Face (Matching Image 1!)
      ctx.fillStyle = '#1b4332';
      ctx.fillRect(-Wpx / 2, -Hpx / 2, Wpx, Hpx);

      // Fine Inner Wood Inlay Border
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-Wpx / 2, -Hpx / 2, Wpx, Hpx);

      // Aluminum / Wood Bottom Chalk Tray
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-Wpx / 2, Hpx / 2 - 3, Wpx, 4);
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-Wpx / 2, Hpx / 2 - 3, Wpx, 4);

      // Yellow Chalk Eraser in the Center (Exactly like Image 1!)
      ctx.fillStyle = '#eab308'; // Bright yellow felt eraser
      ctx.fillRect(-12, Hpx / 2 - 6, 24, 4.5);
      ctx.fillStyle = '#713f12'; // Wood backing
      ctx.fillRect(-12, Hpx / 2 - 1.5, 24, 1.5);

      // White and Colored Chalk Sticks on Tray
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-32, Hpx / 2 - 4, 7, 2);
      ctx.fillStyle = '#f87171'; // Red chalk
      ctx.fillRect(-42, Hpx / 2 - 4, 6, 2);
      ctx.fillStyle = '#60a5fa'; // Blue chalk
      ctx.fillRect(24, Hpx / 2 - 4, 6, 2);

      // Handwritten White Chalk Formulas & Parabola Diagram
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      // Parabola graph on left side
      ctx.moveTo(-Wpx / 2 + 18, 8);
      ctx.quadraticCurveTo(-Wpx / 2 + 35, -14, -Wpx / 2 + 52, 8);
      ctx.stroke();

      // Math Equations
      ctx.fillStyle = 'rgba(254, 240, 138, 0.95)';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('f(x)=ax²+bx+c', -Wpx / 2 + 60, -6);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '8px monospace';
      ctx.fillText('lim Δx→0 (Δy/Δx)', -Wpx / 2 + 60, 6);

      ctx.restore();

      // 3. Wall-Mounted Round Classroom Clock above the Blackboard Center
      const clockCenter = isoToScreen(centerX, gy + 0.085, elev + H + 0.32, ox, oy);
      ctx.save();
      ctx.translate(clockCenter.x, clockCenter.y);
      ctx.transform(1, 0.5, 0, 1, 0, 0);

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Clock tick marks and hands (pointing to 10:10)
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(-3.5, -4);
      ctx.moveTo(0, 0); ctx.lineTo(4.5, -2);
      ctx.stroke();

      ctx.restore();
    }

    // --- Teacher Lecture Podium (x: gx, y: gy) ---
    drawTeacherPodium(ctx, gx, gy, ox, oy) {
      const W = 0.95;
      const D = 0.75;
      const H = 0.95;

      this.drawDropShadow(ctx, gx, gy, W, D, ox, oy);

      // Wooden Podium Body
      this.drawBox(ctx, gx, gy, 0, W, D, H, '#a16207', '#78350f', '#854d0e', ox, oy);

      // Top Angled Surface Rim
      this.drawBox(ctx, gx, gy, H, W, D, 0.06, '#ca8a04', '#92400e', '#a16207', ox, oy);

      // Teacher Textbook & Red Grading Pen
      const topP = isoToScreen(gx + 0.45, gy + 0.35, H + 0.07, ox, oy);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(topP.x - 3, topP.y, 6, 4, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#dc2626'; // Red pen
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(topP.x + 4, topP.y - 2); ctx.lineTo(topP.x + 9, topP.y + 3);
      ctx.stroke();

      // Small Gooseneck Microphone
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(topP.x - 8, topP.y + 4);
      ctx.quadraticCurveTo(topP.x - 10, topP.y - 8, topP.x - 6, topP.y - 12);
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(topP.x - 6, topP.y - 12, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Taiwanese High School Student Desk & Chair Combo (Matching Image 1) ---
    drawStudentDesk(ctx, gx, gy, arg4, arg5, arg6) {
      let ox = 0, oy = 0, options = {};
      if (typeof arg4 === 'number' && typeof arg5 === 'number') {
        ox = arg4;
        oy = arg5;
        options = arg6 || {};
      } else {
        options = arg4 || {};
        ox = arg5 || 0;
        oy = arg6 || 0;
      }
      const W = 1.05;
      const D = 0.72;
      const deskH = 0.65;
      const backpackCol = options.backpackColor || '#0284c7';

      this.drawDropShadow(ctx, gx, gy, W, D, ox, oy);

      // 4 Light Painted Tubular Steel Legs (Matching Image 1: clean light metal legs)
      const legR = '#cbd5e1';
      const legL = '#94a3b8';
      const legT = '#f1f5f9';
      this.drawBox(ctx, gx + 0.05, gy + 0.05, 0, 0.07, 0.07, deskH, legT, legL, legR, ox, oy);
      this.drawBox(ctx, gx + W - 0.12, gy + 0.05, 0, 0.07, 0.07, deskH, legT, legL, legR, ox, oy);
      this.drawBox(ctx, gx + 0.05, gy + D - 0.12, 0, 0.07, 0.07, deskH, legT, legL, legR, ox, oy);
      this.drawBox(ctx, gx + W - 0.12, gy + D - 0.12, 0, 0.07, 0.07, deskH, legT, legL, legR, ox, oy);

      // White/Cream Under-Desk Book Cubby Box (Matching Image 1: white book storage box with opening facing student!)
      this.drawBox(ctx, gx + 0.06, gy + 0.06, deskH - 0.22, W - 0.12, D - 0.12, 0.18, '#ffffff', '#e2e8f0', '#cbd5e1', ox, oy);
      // Hollow cubby opening on the front face (facing South towards student)
      const op0 = isoToScreen(gx + 0.10, gy + D - 0.058, deskH - 0.20, ox, oy);
      const op1 = isoToScreen(gx + W - 0.10, gy + D - 0.058, deskH - 0.20, ox, oy);
      const op2 = isoToScreen(gx + W - 0.10, gy + D - 0.058, deskH - 0.06, ox, oy);
      const op3 = isoToScreen(gx + 0.10, gy + D - 0.058, deskH - 0.06, ox, oy);
      ctx.fillStyle = '#64748b'; // Inner shadow of book cubby
      ctx.beginPath();
      ctx.moveTo(op0.x, op0.y); ctx.lineTo(op1.x, op1.y); ctx.lineTo(op2.x, op2.y); ctx.lineTo(op3.x, op3.y);
      ctx.closePath();
      ctx.fill();
      // Stored textbook inside cubby
      const bk0 = isoToScreen(gx + 0.18, gy + D - 0.057, deskH - 0.18, ox, oy);
      const bk1 = isoToScreen(gx + W - 0.25, gy + D - 0.057, deskH - 0.18, ox, oy);
      const bk2 = isoToScreen(gx + W - 0.25, gy + D - 0.057, deskH - 0.11, ox, oy);
      const bk3 = isoToScreen(gx + 0.18, gy + D - 0.057, deskH - 0.11, ox, oy);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(bk0.x, bk0.y); ctx.lineTo(bk1.x, bk1.y); ctx.lineTo(bk2.x, bk2.y); ctx.lineTo(bk3.x, bk3.y);
      ctx.closePath();
      ctx.fill();

      // Warm Light Oak / Peach Wooden Desktop (Matching Image 1: light wood desktop with bevel)
      this.drawBox(ctx, gx, gy, deskH, W, D, 0.06, '#f59e0b', '#d97706', '#b45309', ox, oy);


      // Student Chair (tucked neatly into the back of the desk, facing North!)
      const cGx = gx + 0.20;
      const cGy = gy + D + 0.15;
      const cW = 0.65;
      const cD = 0.55;
      const seatH = 0.38;

      this.drawDropShadow(ctx, cGx, cGy, cW, cD, ox, oy);
      // 4 Chair Legs (light tubular metal)
      this.drawBox(ctx, cGx + 0.04, cGy + 0.04, 0, 0.05, 0.05, seatH, legT, legL, legR, ox, oy);
      this.drawBox(ctx, cGx + cW - 0.09, cGy + 0.04, 0, 0.05, 0.05, seatH, legT, legL, legR, ox, oy);
      this.drawBox(ctx, cGx + 0.04, cGy + cD - 0.09, 0, 0.05, 0.05, seatH, legT, legL, legR, ox, oy);
      this.drawBox(ctx, cGx + cW - 0.09, cGy + cD - 0.09, 0, 0.05, 0.05, seatH, legT, legL, legR, ox, oy);

      // Wooden Curved Chair Seat (Matching Image 1: warm light oak wood)
      this.drawBox(ctx, cGx, cGy, seatH, cW, cD, 0.04, '#f59e0b', '#d97706', '#b45309', ox, oy);

      // Chair Backrest Uprights & Curved Wooden Slat
      this.drawBox(ctx, cGx + 0.05, cGy + cD - 0.07, seatH, 0.04, 0.04, 0.32, legT, legL, legR, ox, oy);
      this.drawBox(ctx, cGx + cW - 0.09, cGy + cD - 0.07, seatH, 0.04, 0.04, 0.32, legT, legL, legR, ox, oy);
      this.drawBox(ctx, cGx, cGy + cD - 0.07, seatH + 0.24, cW, 0.05, 0.09, '#f59e0b', '#d97706', '#b45309', ox, oy);
    }

    // --- Classroom Cork Bulletin Board on Back Wall ---
    drawClassroomBulletinBoard(ctx, gx, gy, ox, oy, width = 3.2) {
      const H = 0.85;
      const elev = 0.90;

      // Dark Wood Frame
      this.drawBox(ctx, gx, gy, elev - 0.04, width, 0.12, H + 0.08, '#78350f', '#5c2b16', '#5c2b16', ox, oy);
      // Cork Surface
      this.drawBox(ctx, gx + 0.08, gy + 0.02, elev, width - 0.16, 0.08, H, '#d97706', '#b45309', '#b45309', ox, oy);

      // Pinned colorful paper notices (Schedule, announcements)
      const b1 = isoToScreen(gx + 0.6, gy + 0.06, elev + 0.45, ox, oy);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(b1.x - 7, b1.y - 9, 14, 18);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(b1.x - 5, b1.y - 7, 10, 3);

      const b2 = isoToScreen(gx + 1.6, gy + 0.06, elev + 0.40, ox, oy);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(b2.x - 8, b2.y - 10, 16, 20);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(b2.x - 6, b2.y - 8, 12, 3);

      const b3 = isoToScreen(gx + 2.5, gy + 0.06, elev + 0.45, ox, oy);
      ctx.fillStyle = '#86efac';
      ctx.fillRect(b3.x - 6, b3.y - 8, 12, 16);
    }

    // --- Classroom Storage Cubbies / Locker Shelves ---
    drawClassroomLockers(ctx, gx, gy, ox, oy, width = 2.4) {
      const H = 1.15;
      this.drawDropShadow(ctx, gx, gy, width, 0.65, ox, oy);

      // Cabinet Casing
      this.drawBox(ctx, gx, gy, 0, width, 0.65, H, '#a16207', '#78350f', '#854d0e', ox, oy);

      // Cubby dividers
      this.drawBox(ctx, gx + width / 2 - 0.02, gy + 0.05, 0.05, 0.04, 0.55, H - 0.1, '#78350f', '#5c2b16', '#5c2b16', ox, oy);
      this.drawBox(ctx, gx + 0.05, gy + 0.05, H / 2, width - 0.1, 0.55, 0.04, '#78350f', '#5c2b16', '#5c2b16', ox, oy);
    }

    // ========================================================================
    // 6. ZONE 6: DOUYIN / TIKTOK TECH OFFICE EQUIPMENT (SE2)
    // ========================================================================

    // --- Modern Dual-Monitor Engineering Workstation & Ergonomic Chair ---
    drawOfficeWorkstation(ctx, gx, gy, arg4, arg5, arg6) {
      let ox = 0, oy = 0, options = {};
      if (typeof arg4 === 'number' && typeof arg5 === 'number') {
        ox = arg4;
        oy = arg5;
        options = arg6 || {};
      } else {
        options = arg4 || {};
        ox = arg5 || 0;
        oy = arg6 || 0;
      }
      const W = 1.80;
      const D = 0.95;
      const deskH = 0.68;
      const isStanding = options.isStanding || false;
      const actualH = isStanding ? 0.95 : deskH;

      this.drawDropShadow(ctx, gx, gy, W, D, ox, oy);

      // Matte Black Motorized Frame Legs
      const legCol = '#0f172a';
      this.drawBox(ctx, gx + 0.10, gy + 0.10, 0, 0.10, D - 0.20, actualH, legCol, legCol, legCol, ox, oy);
      this.drawBox(ctx, gx + W - 0.20, gy + 0.10, 0, 0.10, D - 0.20, actualH, legCol, legCol, legCol, ox, oy);

      // Premium Chamfered Slate/Carbon Desktop
      this.drawBox(ctx, gx, gy, actualH, W, D, 0.06, '#1e293b', '#0f172a', '#0f172a', ox, oy);

      // Oversized Felt Desk Mat
      this.drawBox(ctx, gx + 0.20, gy + 0.15, actualH + 0.06, W - 0.40, D - 0.25, 0.015, '#334155', '#1e293b', '#1e293b', ox, oy);

      // Dual Ultrawide Displays on Articulating Arms
      // Monitor 1: Code Editor with Syntax Highlighting
      const m1_X = gx + 0.25;
      const m1_Y = gy + 0.12;
      this.drawBox(ctx, m1_X + 0.35, m1_Y, actualH + 0.06, 0.08, 0.08, 0.35, legCol, legCol, legCol, ox, oy);
      this.drawBox(ctx, m1_X, m1_Y, actualH + 0.35, 0.75, 0.08, 0.48, '#0f172a', '#020617', '#020617', ox, oy);
      // Glowing IDE Display Face
      const s1 = isoToScreen(m1_X + 0.02, m1_Y + 0.08, actualH + 0.38, ox, oy);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(s1.x, s1.y - 18, 22, 14);
      // Colorful code lines
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(s1.x + 2, s1.y - 16, 8, 1.5);
      ctx.fillStyle = '#4ade80'; ctx.fillRect(s1.x + 2, s1.y - 13, 14, 1.5);
      ctx.fillStyle = '#f43f5e'; ctx.fillRect(s1.x + 4, s1.y - 10, 10, 1.5);
      ctx.fillStyle = '#fbbf24'; ctx.fillRect(s1.x + 2, s1.y - 7, 16, 1.5);

      // Monitor 2: Live Douyin Algorithm Telemetry with Cyan & Magenta Glow!
      const m2_X = gx + 0.95;
      const m2_Y = gy + 0.12;
      this.drawBox(ctx, m2_X + 0.35, m2_Y, actualH + 0.06, 0.08, 0.08, 0.35, legCol, legCol, legCol, ox, oy);
      this.drawBox(ctx, m2_X, m2_Y, actualH + 0.35, 0.75, 0.08, 0.48, '#0f172a', '#020617', '#020617', ox, oy);
      const s2 = isoToScreen(m2_X + 0.02, m2_Y + 0.08, actualH + 0.38, ox, oy);
      ctx.fillStyle = '#090d16';
      ctx.fillRect(s2.x, s2.y - 18, 22, 14);
      // Neon Algorithm Curves (Cyan & Magenta TikTok theme)
      ctx.strokeStyle = '#25f4ee';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(s2.x + 2, s2.y - 8); ctx.lineTo(s2.x + 8, s2.y - 14); ctx.lineTo(s2.x + 14, s2.y - 9); ctx.lineTo(s2.x + 20, s2.y - 15);
      ctx.stroke();
      ctx.strokeStyle = '#fe2c55';
      ctx.beginPath();
      ctx.moveTo(s2.x + 2, s2.y - 6); ctx.lineTo(s2.x + 9, s2.y - 10); ctx.lineTo(s2.x + 15, s2.y - 6); ctx.lineTo(s2.x + 20, s2.y - 12);
      ctx.stroke();

      // Mechanical RGB Keyboard & Ergonomic Mouse
      const kbP = isoToScreen(gx + 0.65, gy + 0.50, actualH + 0.08, ox, oy);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(kbP.x - 8, kbP.y - 3, 16, 6);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(kbP.x - 7, kbP.y - 2, 14, 1);

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(kbP.x + 12, kbP.y, 2.5, 4, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Open MacBook Pro on Laptop Stand (Right side)
      const mbP = isoToScreen(gx + 1.45, gy + 0.45, actualH + 0.08, ox, oy);
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.ellipse(mbP.x, mbP.y, 7, 5, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(mbP.x - 5, mbP.y - 12, 10, 8);

      // Ceramic Coffee Mug
      const mugP = isoToScreen(gx + 0.35, gy + 0.55, actualH + 0.08, ox, oy);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(mugP.x, mugP.y, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ergonomic Mesh Chair (Aeron Style)
      if (!isStanding) {
        const chX = gx + 0.55;
        const chY = gy + D + 0.20;
        this.drawDropShadow(ctx, chX, chY, 0.70, 0.70, ox, oy);

        // 5-Star Caster Base
        const cP = isoToScreen(chX + 0.35, chY + 0.35, 0, ox, oy);
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cP.x, cP.y, 9, 0, Math.PI * 2);
        ctx.fill();

        // Pneumatic Lift Cylinder
        this.drawBox(ctx, chX + 0.30, chY + 0.30, 0, 0.10, 0.10, 0.40, '#475569', '#334155', '#334155', ox, oy);

        // Breathable Mesh Seat & Lumbar Back
        this.drawBox(ctx, chX + 0.10, chY + 0.10, 0.40, 0.50, 0.50, 0.06, '#1e293b', '#0f172a', '#0f172a', ox, oy);
        this.drawBox(ctx, chX + 0.12, chY + 0.45, 0.46, 0.46, 0.08, 0.42, '#1e293b', '#0f172a', '#0f172a', ox, oy);
        // Headrest
        this.drawBox(ctx, chX + 0.22, chY + 0.48, 0.90, 0.26, 0.06, 0.12, '#334155', '#1e293b', '#1e293b', ox, oy);
      }
    }

    // --- Glass Conference Meeting Table (x: gx, y: gy) ---
    drawOfficeMeetingTable(ctx, gx, gy, ox, oy) {
      const W = 2.40;
      const D = 1.40;
      const H = 0.68;

      this.drawDropShadow(ctx, gx, gy, W, D, ox, oy);

      // Brushed Steel Frame & Legs
      const legC = '#475569';
      this.drawBox(ctx, gx + 0.15, gy + 0.15, 0, 0.10, 0.10, H, legC, legC, legC, ox, oy);
      this.drawBox(ctx, gx + W - 0.25, gy + 0.15, 0, 0.10, 0.10, H, legC, legC, legC, ox, oy);
      this.drawBox(ctx, gx + 0.15, gy + D - 0.25, 0, 0.10, 0.10, H, legC, legC, legC, ox, oy);
      this.drawBox(ctx, gx + W - 0.25, gy + D - 0.25, 0, 0.10, 0.10, H, legC, legC, legC, ox, oy);

      // Smoked Glass Table Surface with Cyan Sheen
      this.drawBox(ctx, gx, gy, H, W, D, 0.06, 'rgba(30, 41, 59, 0.90)', '#0f172a', '#0f172a', ox, oy);

      // Center Aluminum Cable Box & Power Ports
      this.drawBox(ctx, gx + W / 2 - 0.40, gy + D / 2 - 0.12, H + 0.06, 0.80, 0.24, 0.02, '#94a3b8', '#64748b', '#64748b', ox, oy);

      // Two Slim Laptops Open on Table
      const lp1 = isoToScreen(gx + 0.65, gy + 0.70, H + 0.07, ox, oy);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(lp1.x - 7, lp1.y - 4, 14, 8);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(lp1.x - 6, lp1.y - 12, 12, 8);

      const lp2 = isoToScreen(gx + 1.75, gy + 0.70, H + 0.07, ox, oy);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(lp2.x - 7, lp2.y - 4, 14, 8);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(lp2.x - 6, lp2.y - 12, 12, 8);
    }

    // --- Developer Compute Tower & High-Throughput Rig ---
    drawOfficeServerStation(ctx, gx, gy, ox, oy) {
      const W = 0.90;
      const D = 0.90;
      const H = 1.70;

      this.drawDropShadow(ctx, gx, gy, W, D, ox, oy);

      // Matte Black Chassis
      this.drawBox(ctx, gx, gy, 0, W, D, H, '#0f172a', '#020617', '#020617', ox, oy);

      // Acrylic Door with Pulsing TikTok-Themed LEDs
      const time = performance.now() * 0.004;
      const sf0 = isoToScreen(gx + W, gy, 0.05, ox, oy);
      const sf1 = isoToScreen(gx + W, gy + D, 0.05, ox, oy);
      const sf2 = isoToScreen(gx + W, gy + D, H - 0.05, ox, oy);
      const sf3 = isoToScreen(gx + W, gy, H - 0.05, ox, oy);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.beginPath();
      ctx.moveTo(sf0.x, sf0.y); ctx.lineTo(sf1.x, sf1.y); ctx.lineTo(sf2.x, sf2.y); ctx.lineTo(sf3.x, sf3.y);
      ctx.closePath();
      ctx.fill();

      // Smooth Dual-Tone Cyan/Magenta Edge Blend
      const factor = Math.sin(time) * 0.5 + 0.5;
      const nr = Math.round(37 * factor + 254 * (1 - factor));
      const ng = Math.round(244 * factor + 44 * (1 - factor));
      const nb = Math.round(238 * factor + 85 * (1 - factor));
      ctx.strokeStyle = `rgb(${nr}, ${ng}, ${nb})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Blinking Node LEDs
      for (let s = 0.25; s < H - 0.15; s += 0.24) {
        const lp = isoToScreen(gx + W, gy + 0.35, s, ox, oy);
        const blinkCyan = Math.sin(time * 3 + s * 6) > 0;
        const blinkPink = Math.cos(time * 2.5 + s * 4) > 0;
        ctx.fillStyle = blinkCyan ? '#25f4ee' : '#0e7490';
        ctx.fillRect(lp.x, lp.y - 2, 3, 2);
        ctx.fillStyle = blinkPink ? '#fe2c55' : '#881337';
        ctx.fillRect(lp.x + 5, lp.y - 2, 3, 2);
      }
    }

    // --- 10. Garden Stone Chinese Chess Table & Drum Stools (戶外石雕象棋桌與石鼓凳) ---
    // Modeled with authentic Chinese Xiangqi (楚河漢界、九宮格、木質圓形紅黑棋子，呼應爸爸下象棋)
    drawGardenChessTable(ctx, gx, gy, ox, oy) {
      // 1. Natural Slate Paving Slab (Under table and stools on grass)
      this.drawDropShadow(ctx, gx - 0.2, gy - 0.2, 2.0, 1.9, ox, oy);
      const paverP0 = isoToScreen(gx - 0.2, gy - 0.2, 0.005, ox, oy);
      const paverP1 = isoToScreen(gx + 1.8, gy - 0.2, 0.005, ox, oy);
      const paverP2 = isoToScreen(gx + 1.8, gy + 1.7, 0.005, ox, oy);
      const paverP3 = isoToScreen(gx - 0.2, gy + 1.7, 0.005, ox, oy);
      ctx.fillStyle = '#64748b'; // Slate stone
      ctx.beginPath();
      ctx.moveTo(paverP0.x, paverP0.y); ctx.lineTo(paverP1.x, paverP1.y); ctx.lineTo(paverP2.x, paverP2.y); ctx.lineTo(paverP3.x, paverP3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Flagstone joint lines
      const j0 = isoToScreen(gx - 0.2, gy + 0.75, 0.006, ox, oy);
      const j1 = isoToScreen(gx + 1.8, gy + 0.75, 0.006, ox, oy);
      const j2 = isoToScreen(gx + 0.8, gy - 0.2, 0.006, ox, oy);
      const j3 = isoToScreen(gx + 0.8, gy + 1.7, 0.006, ox, oy);
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(j0.x, j0.y); ctx.lineTo(j1.x, j1.y);
      ctx.moveTo(j2.x, j2.y); ctx.lineTo(j3.x, j3.y);
      ctx.stroke();

      // 2. West Stone Drum Stool (石鼓凳 1)
      const st1X = gx - 0.05, st1Y = gy + 0.50;
      this.drawDropShadow(ctx, st1X, st1Y, 0.45, 0.45, ox, oy);
      this.drawBox(ctx, st1X + 0.05, st1Y + 0.05, 0, 0.35, 0.35, 0.10, '#cbd5e1', '#94a3b8', '#64748b', ox, oy);
      this.drawBox(ctx, st1X, st1Y, 0.10, 0.45, 0.45, 0.20, '#e2e8f0', '#94a3b8', '#cbd5e1', ox, oy);
      this.drawBox(ctx, st1X + 0.05, st1Y + 0.05, 0.30, 0.35, 0.35, 0.08, '#f1f5f9', '#cbd5e1', '#94a3b8', ox, oy);

      // 3. Central Carved Stone Table (主石桌)
      const tblX = gx + 0.40, tblY = gy + 0.35;
      this.drawDropShadow(ctx, tblX, tblY, 0.95, 0.95, ox, oy);
      this.drawBox(ctx, tblX + 0.15, tblY + 0.15, 0, 0.60, 0.60, 0.12, '#cbd5e1', '#64748b', '#94a3b8', ox, oy);
      this.drawBox(ctx, tblX + 0.25, tblY + 0.25, 0.12, 0.40, 0.40, 0.40, '#e2e8f0', '#94a3b8', '#cbd5e1', ox, oy);
      this.drawBox(ctx, tblX, tblY, 0.52, 0.90, 0.90, 0.12, '#f8fafc', '#94a3b8', '#cbd5e1', ox, oy);

      // 4. Inset Chinese Chessboard (傳統木質象棋棋盤)
      const bW = 0.74; // Width along X (9 columns)
      const bH = 0.80; // Height along Y (10 rows)
      const bX = tblX + (0.90 - bW) / 2;
      const bY = tblY + (0.90 - bH) / 2;
      const bZ = 0.645;

      // Dark Aged Ebony Border Trim
      this.drawBox(ctx, bX - 0.02, bY - 0.02, bZ, bW + 0.04, bH + 0.04, 0.025, '#451a03', '#270e02', '#1a0801', ox, oy);
      // Warm Beech Wood Playing Surface
      this.drawBox(ctx, bX, bY, bZ + 0.015, bW, bH, 0.015, '#fde68a', '#d97706', '#b45309', ox, oy);

      const gridZ = bZ + 0.031;
      const marginX = 0.045;
      const marginY = 0.045;
      const startX = bX + marginX;
      const startY = bY + marginY;
      const colW = (bW - marginX * 2) / 8; // 8 intervals for 9 columns
      const rowH = (bH - marginY * 2) / 9; // 9 intervals for 10 rows

      // 5. Draw Xiangqi Grid Lines
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 0.9;

      // 10 Horizontal lines (r = 0 to 9)
      for (let r = 0; r <= 9; r++) {
        const pLeft = isoToScreen(startX, startY + r * rowH, gridZ, ox, oy);
        const pRight = isoToScreen(startX + 8 * colW, startY + r * rowH, gridZ, ox, oy);
        ctx.beginPath();
        ctx.moveTo(pLeft.x, pLeft.y);
        ctx.lineTo(pRight.x, pRight.y);
        ctx.stroke();
      }

      // Vertical lines (c = 0 to 8)
      // Outer border columns (0 and 8) run all the way from row 0 to 9
      [0, 8].forEach(c => {
        const pTop = isoToScreen(startX + c * colW, startY, gridZ, ox, oy);
        const pBottom = isoToScreen(startX + c * colW, startY + 9 * rowH, gridZ, ox, oy);
        ctx.beginPath();
        ctx.moveTo(pTop.x, pTop.y);
        ctx.lineTo(pBottom.x, pBottom.y);
        ctx.stroke();
      });

      // Internal columns (1 to 7) are interrupted by the River (楚河漢界) between r = 4 and r = 5
      for (let c = 1; c <= 7; c++) {
        // Red side (rows 0 to 4)
        const p0 = isoToScreen(startX + c * colW, startY, gridZ, ox, oy);
        const p1 = isoToScreen(startX + c * colW, startY + 4 * rowH, gridZ, ox, oy);
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y);
        ctx.stroke();

        // Black side (rows 5 to 9)
        const p2 = isoToScreen(startX + c * colW, startY + 5 * rowH, gridZ, ox, oy);
        const p3 = isoToScreen(startX + c * colW, startY + 9 * rowH, gridZ, ox, oy);
        ctx.beginPath();
        ctx.moveTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
        ctx.stroke();
      }

      // 6. The Nine Palaces (九宮格 diagonal cross lines)
      // Red Palace: cols 3..5, rows 0..2
      const rP0 = isoToScreen(startX + 3 * colW, startY, gridZ, ox, oy);
      const rP1 = isoToScreen(startX + 5 * colW, startY + 2 * rowH, gridZ, ox, oy);
      const rP2 = isoToScreen(startX + 5 * colW, startY, gridZ, ox, oy);
      const rP3 = isoToScreen(startX + 3 * colW, startY + 2 * rowH, gridZ, ox, oy);
      ctx.beginPath();
      ctx.moveTo(rP0.x, rP0.y); ctx.lineTo(rP1.x, rP1.y);
      ctx.moveTo(rP2.x, rP2.y); ctx.lineTo(rP3.x, rP3.y);
      ctx.stroke();

      // Black Palace: cols 3..5, rows 7..9
      const bP0 = isoToScreen(startX + 3 * colW, startY + 7 * rowH, gridZ, ox, oy);
      const bP1 = isoToScreen(startX + 5 * colW, startY + 9 * rowH, gridZ, ox, oy);
      const bP2 = isoToScreen(startX + 5 * colW, startY + 7 * rowH, gridZ, ox, oy);
      const bP3 = isoToScreen(startX + 3 * colW, startY + 9 * rowH, gridZ, ox, oy);
      ctx.beginPath();
      ctx.moveTo(bP0.x, bP0.y); ctx.lineTo(bP1.x, bP1.y);
      ctx.moveTo(bP2.x, bP2.y); ctx.lineTo(bP3.x, bP3.y);
      ctx.stroke();

      // 7. River Calligraphy: "楚 河" & "漢 界"
      const riverMidY = startY + 4.5 * rowH;
      const riv1 = isoToScreen(startX + 2 * colW, riverMidY, gridZ, ox, oy);
      const riv2 = isoToScreen(startX + 6 * colW, riverMidY, gridZ, ox, oy);

      ctx.save();
      ctx.translate(riv1.x, riv1.y);
      ctx.transform(1, 0.5, 0, 1, 0, 0); // Sheared onto table surface
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 6.5px "PingFang TC", "Songti TC", "Kaiti TC", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('楚 河', 0, 0);
      ctx.restore();

      ctx.save();
      ctx.translate(riv2.x, riv2.y);
      ctx.transform(1, 0.5, 0, 1, 0, 0);
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 6.5px "PingFang TC", "Songti TC", "Kaiti TC", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('漢 界', 0, 0);
      ctx.restore();

      // 8. Authentic Chinese Chess Pieces (圓形木質紅黑象棋子，精巧尺寸不重疊)
      const xiangqiPieces = [
        // Red Pieces (紅方)
        { c: 4, r: 0, char: '帥', isRed: true },
        { c: 3, r: 1, char: '仕', isRed: true },
        { c: 6, r: 2, char: '相', isRed: true },
        { c: 2, r: 2, char: '傌', isRed: true },
        { c: 8, r: 2, char: '俥', isRed: true },
        { c: 4, r: 2, char: '炮', isRed: true }, // 當頭炮
        { c: 4, r: 4, char: '兵', isRed: true },

        // Black Pieces (黑方)
        { c: 4, r: 9, char: '將', isRed: false },
        { c: 5, r: 8, char: '士', isRed: false },
        { c: 2, r: 9, char: '象', isRed: false },
        { c: 7, r: 7, char: '馬', isRed: false },
        { c: 0, r: 8, char: '車', isRed: false },
        { c: 1, r: 7, char: '砲', isRed: false },
        { c: 4, r: 5, char: '卒', isRed: false }  // 對頂卒
      ];

      xiangqiPieces.forEach(p => {
        const px = startX + p.c * colW;
        const py = startY + p.r * rowH;
        const botP = isoToScreen(px, py, gridZ, ox, oy);
        const topP = isoToScreen(px, py, gridZ + 0.025, ox, oy);

        // Ground drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(botP.x + 0.3, botP.y + 0.3, 2.3, 1.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wooden counter disc rim
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(topP.x, topP.y + 0.6, 2.1, 1.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wooden counter disc top (ivory / beech wood face)
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.ellipse(topP.x, topP.y, 2.0, 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = p.isRed ? '#dc2626' : '#1e293b';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Character text (delicate and crisp calligraphy)
        ctx.fillStyle = p.isRed ? '#dc2626' : '#0f172a';
        ctx.font = 'bold 2.8px "PingFang TC", "Songti TC", "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.char, topP.x, topP.y + 0.2);
      });

      // 9. East Stone Drum Stool (石鼓凳 2)
      const st2X = gx + 1.25, st2Y = gy + 0.50;
      this.drawDropShadow(ctx, st2X, st2Y, 0.45, 0.45, ox, oy);
      this.drawBox(ctx, st2X + 0.05, st2Y + 0.05, 0, 0.35, 0.35, 0.10, '#cbd5e1', '#94a3b8', '#64748b', ox, oy);
      this.drawBox(ctx, st2X, st2Y, 0.10, 0.45, 0.45, 0.20, '#e2e8f0', '#94a3b8', '#cbd5e1', ox, oy);
      this.drawBox(ctx, st2X + 0.05, st2Y + 0.05, 0.30, 0.35, 0.35, 0.08, '#f1f5f9', '#cbd5e1', '#94a3b8', ox, oy);

      // 10. Ceramic Tea Set on Corner of Table
      const teaP = isoToScreen(tblX + 0.78, tblY + 0.14, 0.645, ox, oy);
      ctx.fillStyle = '#065f46';
      ctx.beginPath();
      ctx.arc(teaP.x, teaP.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#047857';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Soft Rising Steam Curl
      const t = performance.now() * 0.002;
      const steamY = teaP.y - 4 - (t * 8 % 8);
      const steamAlpha = Math.max(0, 1 - (teaP.y - steamY) / 12);
      ctx.strokeStyle = `rgba(255, 255, 255, ${steamAlpha * 0.5})`;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(teaP.x, teaP.y - 2);
      ctx.quadraticCurveTo(teaP.x + Math.sin(t * 3) * 3, teaP.y - 6, teaP.x, steamY);
      ctx.stroke();
    }

    // --- 11. Architectural Campus Monument Sign / Pylon Totem (園區迎賓景觀導引立碑) ---
    drawEntranceTotem(ctx, gx, gy, type, ox, oy) {
      // 1. Foundation Slab & Shadow
      this.drawDropShadow(ctx, gx, gy, 0.7, 0.45, ox, oy);
      this.drawBox(ctx, gx, gy, 0, 0.65, 0.35, 0.14, '#334155', '#1e293b', '#475569', ox, oy);

      // 2. Standing Monument Pillar (Width 0.55 along X, Depth 0.12 along Y, Height 1.25)
      const pX = gx + 0.05, pY = gy + 0.10;
      let topCol = '#1e293b', leftCol = '#0f172a', rightCol = '#334155';
      if (type === 'lib') {
        topCol = '#78350f'; leftCol = '#451a03'; rightCol = '#92400e';
      }
      this.drawBox(ctx, pX, pY, 0.14, 0.55, 0.14, 1.25, topCol, leftCol, rightCol, ox, oy);

      // 3. Front Face Sign (Facing South-West / Camera at constant Y)
      const frontY = pY + 0.142;
      const centerZ = 0.78;
      const cp = isoToScreen(pX + 0.275, frontY, centerZ, ox, oy);

      ctx.save();
      ctx.translate(cp.x, cp.y);
      ctx.transform(1, 0.5, 0, 1, 0, 0); // Front-facing isometric orientation (parallel to X axis)

      if (type === 'ai') {
        // AI Studio Cyber Totem
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-38, -19, 76, 38);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(-38, -19, 76, 38);
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.45)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-36, -17, 72, 34);

        // Icon & Dual-Language Typography
        ctx.fillStyle = '#22d3ee';
        ctx.font = 'bold 8.5px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡ AI STUDIO', 0, -6);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 8px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillText('智慧研究室', 0, 7);

      } else if (type === 'lib') {
        // Grand Library Scholar Bronze Totem
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-42, -19, 84, 38);
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(-42, -19, 84, 38);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-40, -17, 80, 34);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 8.5px -apple-system, BlinkMacSystemFont, "Segoe UI", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('📖 GRAND LIBRARY', 0, -6);

        ctx.fillStyle = '#fef3c7';
        ctx.font = 'bold 8px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillText('知識藏書閣', 0, 7);
      } else if (type === 'douyin') {
        // Douyin Tech Office Totem
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-40, -19, 80, 38);
        ctx.strokeStyle = '#25f4ee';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(-40, -19, 80, 38);
        ctx.strokeStyle = '#fe2c55';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-38, -17, 76, 34);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🎵 TikTok RecSys', 0, -6);

        ctx.fillStyle = '#25f4ee';
        ctx.font = 'bold 8px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillText('TikTok 推薦團隊', 0, 7);
      }
      ctx.restore();

      // 4. Top Monument Finial Indicator (Drawn in clean world coordinates outside sheared plaque context)
      const topP = isoToScreen(pX + 0.275, pY + 0.07, 1.40, ox, oy);
      if (type === 'ai') {
        ctx.fillStyle = Math.sin(performance.now() * 0.005) > 0 ? '#22d3ee' : '#0891b2';
        ctx.beginPath();
        ctx.arc(topP.x, topP.y - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'lib') {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(topP.x, topP.y - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'douyin') {
        ctx.fillStyle = '#fe2c55';
        ctx.beginPath();
        ctx.arc(topP.x, topP.y - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // --- 12. TikTok / Douyin Official Floor Emblem (Ground Decal) ---
    // Renders the official circular black disc with cyan/magenta chromatic aberration musical note
    drawTikTokFloorEmblem(ctx, cx, cy, radiusTiles = 1.5, ox, oy) {
      const center = isoToScreen(cx, cy, 0.005, ox, oy);
      // In 2:1 isometric projection on ground plane:
      const R = radiusTiles * 32 * 1.414;

      ctx.save();
      ctx.translate(center.x, center.y);
      ctx.scale(1, 0.5); // Project 2D upright coordinates into 2:1 isometric floor ellipse

      // 1. Black Circular Disc Base
      ctx.fillStyle = '#010204';
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fill();

      // Outer Dual Rim (Cyan & Magenta tech glow)
      ctx.strokeStyle = '#25f4ee';
      ctx.lineWidth = 3.0;
      ctx.stroke();

      ctx.strokeStyle = '#fe2c55';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, R - 2.5, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Official TikTok Musical Note with Chromatic Aberration
      const scale = R * 0.016;

      const drawSingleNote = (shiftX, shiftY, fillCol) => {
        ctx.save();
        ctx.translate(shiftX, shiftY);
        ctx.fillStyle = fillCol;

        ctx.beginPath();

        // Note Head Outer: Center (-10 * scale, 14 * scale), radius 16 * scale
        const hx = -10 * scale;
        const hy = 14 * scale;
        const rOut = 16 * scale;
        const stemW = 8.5 * scale;
        const stemRight = hx + rOut; // -10 + 16 = +6 * scale
        const stemLeft = stemRight - stemW; // -2.5 * scale
        const stemTop = -30 * scale;

        // Outer Head Arc (from bottom around to stem connection)
        ctx.arc(hx, hy, rOut, Math.PI * 0.5, Math.PI * 1.5, false);
        // Connect to top of head
        ctx.lineTo(stemLeft, hy);
        // Up along left side of stem
        ctx.lineTo(stemLeft, stemTop);
        // Top of stem (flat)
        ctx.lineTo(stemRight, stemTop);

        // Flag / Hook Outer Curve (sweeping right and down)
        ctx.bezierCurveTo(
          stemRight + 12 * scale, stemTop,
          24 * scale, stemTop + 8 * scale,
          24 * scale, -10 * scale
        );
        // Flag bottom edge
        ctx.lineTo(24 * scale - 7 * scale, -10 * scale - 2 * scale);
        // Flag Inner Curve back to stem
        ctx.bezierCurveTo(
          16 * scale, stemTop + 14 * scale,
          stemRight + 2 * scale, stemTop + 12 * scale,
          stemRight, stemTop + 16 * scale
        );
        // Down along right side of stem
        ctx.lineTo(stemRight, hy);
        // Complete the outer head bottom arc
        ctx.arc(hx, hy, rOut, 0, Math.PI * 0.5, false);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      };

      // Chromatic Shift Offsets
      const offset = 2.4 * scale;

      // Pass 1: Cyan (#00f2fe) shifted Top-Left
      drawSingleNote(-offset, -offset, '#00f2fe');

      // Pass 2: Magenta (#fe2c55) shifted Bottom-Right
      drawSingleNote(offset, offset, '#fe2c55');

      // Pass 3: Crisp Pure White (#ffffff) in the Center
      drawSingleNote(0, 0, '#ffffff');

      // Inner Cutout Hole for Note Head (creates the authentic hollow ring!)
      // Cyan inner offset hole
      ctx.fillStyle = '#010204';
      ctx.beginPath();
      ctx.arc(-10 * scale - offset, 14 * scale - offset, 7.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Magenta inner offset hole
      ctx.fillStyle = '#fe2c55';
      ctx.beginPath();
      ctx.arc(-10 * scale + offset, 14 * scale + offset, 7.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Center black hole
      ctx.fillStyle = '#010204';
      ctx.beginPath();
      ctx.arc(-10 * scale, 14 * scale, 7.5 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // --- 13. Interior Architectural Brand Wall Sign (室內特色形象招牌主牆) ---
    // Mounted on the South-facing interior North wall of each major campus building,
    // providing 100% unobstructed, front-facing brand identity for visitors!
    drawInteriorBrandSign(ctx, gx, gy, gz, type, ox, oy) {
      const center = isoToScreen(gx, gy, gz, ox, oy);

      ctx.save();
      ctx.translate(center.x, center.y);
      ctx.transform(1, 0.5, 0, 1, 0, 0); // Sheared flat onto the South-facing North partition wall!

      if (type === 'library') {
        // Grand Scholar Library: Carved Walnut & Gilded Bronze Plaque with Museum Spotlight
        const W = 118;
        const H = 26;

        // Ambient Warm Downlight Cone on the wall
        const grad = ctx.createRadialGradient(0, -6, 2, 0, 10, 50);
        grad.addColorStop(0, 'rgba(251, 191, 36, 0.28)');
        grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(-W, -H, W * 2, H * 3);

        // Dark Walnut Wood Backing Board
        ctx.fillStyle = '#270e04';
        ctx.fillRect(-W / 2, -H / 2, W, H);

        // Gilded Brass Fillet Outer Frame
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(-W / 2, -H / 2, W, H);

        // Gold Inlay Inner Border
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-W / 2 + 2.5, -H / 2 + 2.5, W - 5, H - 5);

        // Typography
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 8.5px "Times New Roman", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('📖 GRAND SCHOLAR ARCHIVE & LIBRARY', 0, -4.5);

        ctx.fillStyle = '#fef3c7';
        ctx.font = 'bold 7.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillText('路德維希亞 • 皇家總圖書館', 0, 5.5);

      } else if (type === 'ai') {
        // AI Research Studio: Cyber Obsidian & Electric Cyan Neon Panel
        const W = 112;
        const H = 26;

        // Cyan Neon Ambient Backlight
        const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, 45);
        grad.addColorStop(0, 'rgba(6, 182, 212, 0.28)');
        grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(-W, -H, W * 2, H * 2.5);

        // Obsidian Glass Face
        ctx.fillStyle = '#020617';
        ctx.fillRect(-W / 2, -H / 2, W, H);

        // Electric Cyan Border
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(-W / 2, -H / 2, W, H);

        // Inner Tech Corner Bracket Lines
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-W / 2 + 2.5, -H / 2 + 2.5, W - 5, H - 5);

        // Pulsing Neon Text
        ctx.fillStyle = '#22d3ee';
        ctx.font = 'bold 8.5px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡ LUDWIGIA AI RESEARCH LAB', 0, -4.5);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 7.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillText('人工智慧前瞻實驗室 • AGENT LAB', 0, 5.5);

      } else if (type === 'douyin') {
        // Douyin Tech Office: Matte Carbon Fiber & Dual Cyan/Magenta Neon Wall
        const W = 116;
        const H = 26;

        // Cyan/Magenta Ambient Backlight
        const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, 48);
        grad.addColorStop(0, 'rgba(37, 244, 238, 0.22)');
        grad.addColorStop(0.5, 'rgba(254, 44, 85, 0.18)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(-W, -H, W * 2, H * 2.5);

        // Matte Carbon Panel
        ctx.fillStyle = '#020617';
        ctx.fillRect(-W / 2, -H / 2, W, H);

        // Dual Border: Cyan Top/Left, Magenta Bottom/Right
        ctx.strokeStyle = '#25f4ee';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(-W / 2, -H / 2, W, H);

        ctx.strokeStyle = '#fe2c55';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-W / 2 + 2, -H / 2 + 2, W - 4, H - 4);

        // Typography
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🎵 TikTok RecSys', 0, -4.5);

        ctx.fillStyle = '#25f4ee';
        ctx.font = 'bold 7.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillText('TikTok 推薦團隊', 0, 5.5);

      } else if (type === 'school') {
        // Sanmin High School: Evergreen & Brass Academic Lintel Board
        const W = 110;
        const H = 25;

        // Dark Wood Frame
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-W / 2 - 2, -H / 2 - 2, W + 4, H + 4);

        // Forest Pine Board Face
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(-W / 2, -H / 2, W, H);

        // Gold Inner Fillet
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-W / 2 + 2, -H / 2 + 2, W - 4, H - 4);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏫 三民高中', 0, -4.5);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 7.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillText('誠 • 敬 • 勤 • 毅', 0, 5.5);
      }

      ctx.restore();
    }

    // --- 14. Modern Office Tech Coffee & Refreshment Bar ---
    drawOfficeCoffeeBar(ctx, gx, gy, ox, oy) {
      const W = 1.40;
      const D = 0.70;
      const H = 0.88;

      this.drawDropShadow(ctx, gx, gy, W, D, ox, oy);

      // White Quartz Counter Cabinet with Light Wood Trim
      this.drawBox(ctx, gx, gy, 0, W, D, H, '#f8fafc', '#e2e8f0', '#cbd5e1', ox, oy);

      // Matte Black Espresso Machine
      this.drawBox(ctx, gx + 0.15, gy + 0.12, H, 0.40, 0.35, 0.42, '#0f172a', '#1e293b', '#1e293b', ox, oy);
      // Silver Portafilter
      this.drawBox(ctx, gx + 0.22, gy + 0.44, H + 0.18, 0.10, 0.12, 0.04, '#cbd5e1', '#94a3b8', '#94a3b8', ox, oy);

      // Glass Snack / Fruit Bowl
      const fP = isoToScreen(gx + 0.82, gy + 0.28, H + 0.08, ox, oy);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.ellipse(fP.x, fP.y, 7, 5, 0.1, 0, Math.PI * 2);
      ctx.fill();
      // Apples & Oranges
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(fP.x - 2, fP.y - 2, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.beginPath(); ctx.arc(fP.x + 3, fP.y - 1, 3, 0, Math.PI * 2); ctx.fill();

      // Clear Water Dispenser with Blue Reservoir
      this.drawBox(ctx, gx + 1.05, gy + 0.12, H, 0.25, 0.25, 0.48, 'rgba(56, 189, 248, 0.75)', '#0284c7', '#0369a1', ox, oy);
    }

    // --- 15. Douyin High-Tech Transparent Speed Gate Turnstile (透明速通門閘機) ---
    // High-visibility transparent safety glass barrier with stainless turnstiles & unpredictable opening cycles
    drawDouyinSpeedGate(ctx, gx, gy, gateAnim = 0.0, isOpen = false, ox, oy) {
      const northPedY = 36.52;
      const southPedY = 38.48;
      const pedW = 0.35;
      const pedD = 0.30;
      const pedH = 0.96;

      // 1. Drop Shadows for Turnstile Stanchions
      this.drawDropShadow(ctx, gx - 0.12, northPedY, pedW, pedD, ox, oy);
      this.drawDropShadow(ctx, gx - 0.12, southPedY, pedW, pedD, ox, oy);

      // 2. Stainless Steel Pedestals (North & South Stanchions)
      const stColorTop = '#1e293b';
      const stColorLeft = '#0f172a';
      const stColorRight = '#334155';
      this.drawBox(ctx, gx - 0.12, northPedY, 0, pedW, pedD, pedH, stColorTop, stColorLeft, stColorRight, ox, oy);
      this.drawBox(ctx, gx - 0.12, southPedY, 0, pedW, pedD, pedH, stColorTop, stColorLeft, stColorRight, ox, oy);

      // 3. NFC Swiping Plate & Status Indicators on Stanchions
      const drawPedestalHUD = (py) => {
        // NFC Scanner glass pad on top
        const pad = isoToScreen(gx + 0.05, py + 0.15, pedH + 0.01, ox, oy);
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.ellipse(pad.x, pad.y, 8, 4, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isOpen ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Direction / Access indicator light facing courtyard (-X)
        const ind = isoToScreen(gx - 0.12, py + 0.15, pedH * 0.65, ox, oy);
        ctx.fillStyle = isOpen ? '#22c55e' : '#ef4444';
        ctx.shadowColor = isOpen ? '#22c55e' : '#ef4444';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(ind.x - 3, ind.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      };
      drawPedestalHUD(northPedY);
      drawPedestalHUD(southPedY);

      // 4. Two Highly Visible Transparent Barrier Wings ("看得出來的那種透明閘門")
      // Passage is between 36.85 and 38.45. Center is at 37.65.
      const wingLength = 0.78;
      const swingAngle = gateAnim * (Math.PI * 0.44); // 0 to ~79 degrees into room (+X)

      const drawGlassWing = (hingeX, hingeY, isNorth) => {
        const sign = isNorth ? 1 : -1;
        // In closed state: points towards center (+Y for North, -Y for South)
        // In open state: swings inward into the room (+X)
        const tipX = hingeX + Math.sin(swingAngle) * wingLength;
        const tipY = hingeY + sign * Math.cos(swingAngle) * wingLength;

        const zBot = 0.18;
        const zTop = 1.12;

        const b0 = isoToScreen(hingeX, hingeY, zBot, ox, oy);
        const b1 = isoToScreen(tipX, tipY, zBot, ox, oy);
        const t1 = isoToScreen(tipX, tipY, zTop, ox, oy);
        const t0 = isoToScreen(hingeX, hingeY, zTop, ox, oy);

        // Glass Body with luminous frosted reflection
        const grad = ctx.createLinearGradient(b0.x, b0.y, t1.x, t1.y);
        grad.addColorStop(0.0, 'rgba(37, 244, 238, 0.38)');
        grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.48)'); // Bright frosted glass reflection
        grad.addColorStop(0.7, 'rgba(37, 244, 238, 0.28)');
        grad.addColorStop(1.0, 'rgba(254, 44, 85, 0.32)');  // Douyin Magenta accent

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(b0.x, b0.y);
        ctx.lineTo(b1.x, b1.y);
        ctx.lineTo(t1.x, t1.y);
        ctx.lineTo(t0.x, t0.y);
        ctx.closePath();
        ctx.fill();

        // Distinct Outlines ("看得出來的那種")
        // Luminous Cyan Top Rim
        ctx.strokeStyle = '#25f4ee';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(t0.x, t0.y);
        ctx.lineTo(t1.x, t1.y);
        ctx.stroke();

        // Leading Impact Strip (Bright White Rubber Bumper at the tip where wings meet)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(b1.x, b1.y);
        ctx.lineTo(t1.x, t1.y);
        ctx.stroke();

        // Bottom Edge with Magenta accent
        ctx.strokeStyle = '#fe2c55';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(b0.x, b0.y);
        ctx.lineTo(b1.x, b1.y);
        ctx.stroke();

        // Frosted Etched Safety Warning Stripes (2 crisp horizontal bands across the glass)
        const drawEtchBand = (zRatio) => {
          const ez = zBot + (zTop - zBot) * zRatio;
          const e0 = isoToScreen(hingeX, hingeY, ez, ox, oy);
          const e1 = isoToScreen(tipX, tipY, ez, ox, oy);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(e0.x, e0.y);
          ctx.lineTo(e1.x, e1.y);
          ctx.stroke();
        };
        drawEtchBand(0.40);
        drawEtchBand(0.70);

        // Hinge Pivot Column
        const h0 = isoToScreen(hingeX, hingeY, 0.12, ox, oy);
        const h1 = isoToScreen(hingeX, hingeY, 1.18, ox, oy);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(h0.x, h0.y);
        ctx.lineTo(h1.x, h1.y);
        ctx.stroke();
      };

      // Draw North & South Wings
      drawGlassWing(gx + 0.05, 36.85, true);
      drawGlassWing(gx + 0.05, 38.45, false);

      // 5. Center Lock Icon on Glass when closed
      if (gateAnim < 0.35) {
        const lockP = isoToScreen(gx + 0.05, 37.65, 0.72, ox, oy);
        ctx.fillStyle = isOpen ? '#22c55e' : '#ef4444';
        ctx.beginPath();
        ctx.arc(lockP.x, lockP.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.0;
        ctx.stroke();
      }
    }

    // =========================================================================
    // DIORAMA BOUNDARY DECORATIONS, BASKETBALL COURT & MIDNIGHT SNACK STREET
    // =========================================================================

    // --- 1. Isometric Diorama Floating Earth Crust Base ---
    drawDioramaCrust(ctx, mapW, mapH, ox, oy) {
      const depth = 0.85; // Thickness of floating diorama island base
      const isDark = (this.world.currentTimeState === 'night' || this.world.currentTimeState === 'galaxy');

      // Shading colors
      const soilCol = isDark ? '#382314' : '#653b1b';
      const rockCol = isDark ? '#111827' : '#1e293b';
      const shadowCol = 'rgba(0, 0, 0, 0.35)';
      const tNow = performance.now() * 0.001;

      // 1. Dream Pink Cloud Sea (夢境粉雲海) — Floating beneath the cliff before cliff is drawn
      for (let x = 0; x < mapW; x += 1.5) {
        const floatY = Math.sin(tNow * 1.4 + x * 0.7) * 4;
        const cp = isoToScreen(x + 0.75, mapH, -depth - 0.28, ox, oy);
        const rad = 28 + Math.sin(tNow + x) * 6;
        const cGrad = ctx.createRadialGradient(cp.x, cp.y + floatY, 3, cp.x, cp.y + floatY, rad);
        cGrad.addColorStop(0, 'rgba(251, 207, 232, 0.45)');
        cGrad.addColorStop(0.5, 'rgba(244, 114, 182, 0.28)');
        cGrad.addColorStop(1, 'rgba(244, 114, 182, 0)');
        ctx.fillStyle = cGrad;
        ctx.beginPath();
        ctx.arc(cp.x, cp.y + floatY, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let y = 0; y < mapH; y += 1.5) {
        const floatY = Math.sin(tNow * 1.4 + y * 0.7) * 4;
        const cp = isoToScreen(mapW, y + 0.75, -depth - 0.28, ox, oy);
        const rad = 28 + Math.sin(tNow + y) * 6;
        const cGrad = ctx.createRadialGradient(cp.x, cp.y + floatY, 3, cp.x, cp.y + floatY, rad);
        cGrad.addColorStop(0, 'rgba(251, 207, 232, 0.45)');
        cGrad.addColorStop(0.5, 'rgba(244, 114, 182, 0.28)');
        cGrad.addColorStop(1, 'rgba(244, 114, 182, 0)');
        ctx.fillStyle = cGrad;
        ctx.beginPath();
        ctx.arc(cp.x, cp.y + floatY, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // A. South-facing Exposed Cliff Face (along y = mapH, from x = 0 to mapW)
      // Draw segment by segment to preserve depth shading
      for (let x = 0; x < mapW; x++) {
        const t0 = isoToScreen(x, mapH, 0, ox, oy);
        const t1 = isoToScreen(x + 1, mapH, 0, ox, oy);
        const m0 = isoToScreen(x, mapH, -depth * 0.35, ox, oy);
        const m1 = isoToScreen(x + 1, mapH, -depth * 0.35, ox, oy);
        const b0 = isoToScreen(x, mapH, -depth, ox, oy);
        const b1 = isoToScreen(x + 1, mapH, -depth, ox, oy);
        const s0 = isoToScreen(x, mapH, -depth - 0.25, ox, oy);
        const s1 = isoToScreen(x + 1, mapH, -depth - 0.25, ox, oy);

        // Drop shadow below cliff
        ctx.fillStyle = shadowCol;
        ctx.beginPath();
        ctx.moveTo(b0.x, b0.y); ctx.lineTo(b1.x, b1.y);
        ctx.lineTo(s1.x, s1.y + 6); ctx.lineTo(s0.x, s0.y + 6);
        ctx.closePath();
        ctx.fill();

        // Bedrock lower layer
        ctx.fillStyle = (x % 2 === 0) ? rockCol : (isDark ? '#0b1120' : '#172033');
        ctx.beginPath();
        ctx.moveTo(m0.x, m0.y); ctx.lineTo(m1.x, m1.y);
        ctx.lineTo(b1.x, b1.y); ctx.lineTo(b0.x, b0.y);
        ctx.closePath();
        ctx.fill();

        // Soil middle layer
        ctx.fillStyle = (x % 2 === 0) ? soilCol : (isDark ? '#2e1c10' : '#573215');
        ctx.beginPath();
        ctx.moveTo(t0.x, t0.y); ctx.lineTo(t1.x, t1.y);
        ctx.lineTo(m1.x, m1.y); ctx.lineTo(m0.x, m0.y);
        ctx.closePath();
        ctx.fill();

        // Overhang turf rim line
        ctx.strokeStyle = isDark ? '#14532d' : '#365314';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(t0.x, t0.y); ctx.lineTo(t1.x, t1.y);
        ctx.stroke();
      }

      // B. East-facing Exposed Cliff Face (along x = mapW, from y = 0 to mapH)
      for (let y = 0; y < mapH; y++) {
        const t0 = isoToScreen(mapW, y, 0, ox, oy);
        const t1 = isoToScreen(mapW, y + 1, 0, ox, oy);
        const m0 = isoToScreen(mapW, y, -depth * 0.35, ox, oy);
        const m1 = isoToScreen(mapW, y + 1, -depth * 0.35, ox, oy);
        const b0 = isoToScreen(mapW, y, -depth, ox, oy);
        const b1 = isoToScreen(mapW, y + 1, -depth, ox, oy);
        const s0 = isoToScreen(mapW, y, -depth - 0.25, ox, oy);
        const s1 = isoToScreen(mapW, y + 1, -depth - 0.25, ox, oy);

        // Drop shadow below cliff
        ctx.fillStyle = shadowCol;
        ctx.beginPath();
        ctx.moveTo(b0.x, b0.y); ctx.lineTo(b1.x, b1.y);
        ctx.lineTo(s1.x, s1.y + 6); ctx.lineTo(s0.x, s0.y + 6);
        ctx.closePath();
        ctx.fill();

        // Bedrock lower layer (slightly darker side face)
        ctx.fillStyle = (y % 2 === 0) ? (isDark ? '#080d1a' : '#141d2e') : (isDark ? '#050811' : '#0f172a');
        ctx.beginPath();
        ctx.moveTo(m0.x, m0.y); ctx.lineTo(m1.x, m1.y);
        ctx.lineTo(b1.x, b1.y); ctx.lineTo(b0.x, b0.y);
        ctx.closePath();
        ctx.fill();

        // Soil middle layer
        ctx.fillStyle = (y % 2 === 0) ? (isDark ? '#26170d' : '#4a2b12') : (isDark ? '#20120a' : '#3f240e');
        ctx.beginPath();
        ctx.moveTo(t0.x, t0.y); ctx.lineTo(t1.x, t1.y);
        ctx.lineTo(m1.x, m1.y); ctx.lineTo(m0.x, m0.y);
        ctx.closePath();
        ctx.fill();

        // Overhang turf rim line
        ctx.strokeStyle = isDark ? '#14532d' : '#2d4710';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(t0.x, t0.y); ctx.lineTo(t1.x, t1.y);
        ctx.stroke();
      }

      // 3. Glowing Dream Pink Aurora Rim along the entire lower cliff foundation
      ctx.save();
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.65)';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#f472b6';
      ctx.shadowBlur = 8;
      // South cliff baseline
      const sb0 = isoToScreen(0, mapH, -depth, ox, oy);
      const sb1 = isoToScreen(mapW, mapH, -depth, ox, oy);
      ctx.beginPath();
      ctx.moveTo(sb0.x, sb0.y);
      ctx.lineTo(sb1.x, sb1.y);
      ctx.stroke();
      // East cliff baseline
      const eb0 = isoToScreen(mapW, 0, -depth, ox, oy);
      const eb1 = isoToScreen(mapW, mapH, -depth, ox, oy);
      ctx.beginPath();
      ctx.moveTo(eb0.x, eb0.y);
      ctx.lineTo(eb1.x, eb1.y);
      ctx.stroke();
      ctx.restore();
    }

    // --- 2. Trimmed Perimeter Boxwood Hedge ---
    drawPerimeterHedge(ctx, gx, gy, ox, oy, lenX = 1.0, lenY = 1.0) {
      const H = 0.55;
      this.drawBox(ctx, gx, gy, 0, lenX, lenY, H, '#22c55e', '#15803d', '#166534', ox, oy);
      // Small floral dots on top
      const p = isoToScreen(gx + lenX * 0.5, gy + lenY * 0.5, H, ox, oy);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(p.x - 3, p.y - 2, 1.8, 0, Math.PI * 2);
      ctx.arc(p.x + 4, p.y + 1, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- 2B. High Campus Sports Perimeter Fence & Safety Netting Wall ---
    drawSportsFence(ctx, gx, gy, ox, oy, lenX = 1.0, lenY = 1.0) {
      const H = 2.45;
      const baseH = 0.45;
      const postW = 0.16;

      // 1. Heavy Concrete Sports Base Curb with Emerald Coating
      this.drawBox(ctx, gx, gy, 0, lenX, lenY, baseH, '#059669', '#047857', '#065f46', ox, oy);

      // 2. Top Steel Header Tension Rail
      this.drawBox(ctx, gx, gy, H - 0.12, lenX, lenY, 0.12, '#475569', '#334155', '#1e293b', ox, oy);

      // 3. Middle Tension Wire Cable
      this.drawBox(ctx, gx, gy, 1.45, lenX, lenY, 0.05, '#64748b', '#475569', '#334155', ox, oy);

      // 4. Semi-Transparent Chain-Link Safety Mesh
      const m0 = isoToScreen(gx, gy, baseH, ox, oy);
      const m1 = isoToScreen(gx + lenX, gy + lenY, baseH, ox, oy);
      const m2 = isoToScreen(gx + lenX, gy + lenY, H - 0.12, ox, oy);
      const m3 = isoToScreen(gx, gy, H - 0.12, ox, oy);

      ctx.save();
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.beginPath();
      ctx.moveTo(m0.x, m0.y); ctx.lineTo(m1.x, m1.y); ctx.lineTo(m2.x, m2.y); ctx.lineTo(m3.x, m3.y);
      ctx.closePath();
      ctx.fill();

      // Mesh Grid Border Lines
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.50)';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Intermediate Vertical Support Posts along the fence span
      const isX = lenX >= lenY;
      const totalLen = isX ? lenX : lenY;
      const postSpacing = 2.2;
      const count = Math.max(1, Math.round(totalLen / postSpacing));
      for (let i = 0; i <= count; i++) {
        const t = i / count;
        const px = isX ? gx + t * (lenX - postW) : gx;
        const py = isX ? gy : gy + t * (lenY - postW);
        this.drawBox(ctx, px, py, baseH, postW, postW, H - baseH, '#334155', '#1e293b', '#0f172a', ox, oy);
      }
      ctx.restore();
    }

    // --- 3. Classic Campus Twin-Lantern Streetlight ---
    drawStreetlight(ctx, gx, gy, ox, oy) {
      const H = 2.45;
      // Post base & shaft
      this.drawBox(ctx, gx + 0.40, gy + 0.40, 0, 0.20, 0.20, H, '#475569', '#1e293b', '#0f172a', ox, oy);
      // Cross arm at top
      this.drawBox(ctx, gx + 0.15, gy + 0.44, H - 0.15, 0.70, 0.12, 0.12, '#475569', '#334155', '#1e293b', ox, oy);

      // Twin warm amber lantern heads
      const l1 = isoToScreen(gx + 0.20, gy + 0.50, H - 0.35, ox, oy);
      const l2 = isoToScreen(gx + 0.80, gy + 0.50, H - 0.35, ox, oy);
      const isNight = (this.world.currentTimeState === 'night' || this.world.currentTimeState === 'galaxy');

      [l1, l2].forEach(lp => {
        // Glow halo at night
        if (isNight) {
          const glow = ctx.createRadialGradient(lp.x, lp.y, 2, lp.x, lp.y, 22);
          glow.addColorStop(0, 'rgba(251, 191, 36, 0.65)');
          glow.addColorStop(0.5, 'rgba(245, 158, 11, 0.25)');
          glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(lp.x, lp.y, 22, 0, Math.PI * 2);
          ctx.fill();
        }

        // Glass housing
        ctx.fillStyle = isNight ? '#fef08a' : '#fef9c3';
        ctx.beginPath();
        ctx.arc(lp.x, lp.y, 4.0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });
    }

    // --- 4. South Boulevard Gateway Portal Sign ---
    drawRoadPortalSign(ctx, gx, gy, ox, oy) {
      // Wooden / Steel signpost
      this.drawBox(ctx, gx + 0.42, gy + 0.42, 0, 0.16, 0.16, 1.85, '#64748b', '#334155', '#1e293b', ox, oy);
      // Directional Green Signboard
      const b0 = isoToScreen(gx - 0.3, gy + 0.5, 1.35, ox, oy);
      const b1 = isoToScreen(gx + 1.2, gy + 0.5, 1.35, ox, oy);
      const t1 = isoToScreen(gx + 1.2, gy + 0.5, 1.85, ox, oy);
      const t0 = isoToScreen(gx - 0.3, gy + 0.5, 1.85, ox, oy);

      ctx.fillStyle = '#065f46'; // Express highway / campus green
      ctx.beginPath();
      ctx.moveTo(b0.x, b0.y); ctx.lineTo(b1.x, b1.y); ctx.lineTo(t1.x, t1.y); ctx.lineTo(t0.x, t0.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      const cp = isoToScreen(gx + 0.45, gy + 0.5, 1.60, ox, oy);
      ctx.save();
      ctx.translate(cp.x, cp.y);
      ctx.transform(1, 0.5, 0, 1, 0, 0); // Sheared onto X-axis highway sign face
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang TC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('三民路', 0, 0);
      ctx.restore();
    }

    // --- 5. Streetball Basketball Hoop (West Sector) ---
    drawBasketballHoop(ctx, gx, gy, ox, oy) {
      // Base weight box with safety padding (blue)
      this.drawBox(ctx, gx, gy + 0.15, 0, 0.65, 0.70, 0.55, '#38bdf8', '#0284c7', '#0369a1', ox, oy);

      // Angled heavy steel boom extension pole
      this.drawBox(ctx, gx + 0.20, gy + 0.35, 0.55, 0.25, 0.28, 2.30, '#1e293b', '#0f172a', '#020617', ox, oy);

      // Forward cantilever boom arm towards east
      this.drawBox(ctx, gx + 0.25, gy + 0.38, 2.70, 0.90, 0.22, 0.15, '#1e293b', '#0f172a', '#020617', ox, oy);

      // Transparent Glass Backboard (Facing Eastwards towards court)
      const bbX = gx + 1.15;
      const bbY = gy + 0.05;
      const b0 = isoToScreen(bbX, bbY, 2.45, ox, oy);
      const b1 = isoToScreen(bbX, bbY + 0.95, 2.45, ox, oy);
      const t1 = isoToScreen(bbX, bbY + 0.95, 3.15, ox, oy);
      const t0 = isoToScreen(bbX, bbY, 3.15, ox, oy);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'; // Glass sheen
      ctx.beginPath();
      ctx.moveTo(b0.x, b0.y); ctx.lineTo(b1.x, b1.y); ctx.lineTo(t1.x, t1.y); ctx.lineTo(t0.x, t0.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner Target Box (Red rectangle)
      const tb0 = isoToScreen(bbX, bbY + 0.28, 2.65, ox, oy);
      const tb1 = isoToScreen(bbX, bbY + 0.68, 2.65, ox, oy);
      const tt1 = isoToScreen(bbX, bbY + 0.68, 2.95, ox, oy);
      const tt0 = isoToScreen(bbX, bbY + 0.28, 2.95, ox, oy);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(tb0.x, tb0.y); ctx.lineTo(tb1.x, tb1.y); ctx.lineTo(tt1.x, tt1.y); ctx.lineTo(tt0.x, tt0.y);
      ctx.closePath();
      ctx.stroke();

      // Steel Mounting Bracket Connecting Backboard to Rim
      const mnt0 = isoToScreen(bbX, bbY + 0.48, 2.62, ox, oy);
      const mnt1 = isoToScreen(bbX + 0.12, bbY + 0.48, 2.62, ox, oy);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(mnt0.x, mnt0.y); ctx.lineTo(mnt1.x, mnt1.y);
      ctx.stroke();

      // True Isometric Horizontal Orange Rim (Ring extending eastward into court)
      const rcX = bbX + 0.30;
      const rcY = bbY + 0.48;
      const rcZ = 2.62;
      const R_rim = 0.20;
      const rimSegs = 20;

      ctx.save();
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      const topNetPts = [];
      for (let i = 0; i < rimSegs; i++) {
        const a = (i / rimSegs) * Math.PI * 2;
        const rx = rcX + R_rim * Math.cos(a);
        const ry = rcY + R_rim * Math.sin(a);
        const pt = isoToScreen(rx, ry, rcZ, ox, oy);
        topNetPts.push(pt);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.stroke();

      // True 3D White Nylon Netting (Hanging downwards along -Z axis)
      const netBtmZ = 2.22;
      const R_netBtm = 0.09;
      const btmNetPts = [];
      for (let i = 0; i < rimSegs; i++) {
        const a = (i / rimSegs) * Math.PI * 2;
        const bx = rcX + R_netBtm * Math.cos(a);
        const by = rcY + R_netBtm * Math.sin(a);
        btmNetPts.push(isoToScreen(bx, by, netBtmZ, ox, oy));
      }

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      // Draw 10 braided vertical & cross nylon cords
      const cordStep = 2;
      for (let i = 0; i < rimSegs; i += cordStep) {
        ctx.moveTo(topNetPts[i].x, topNetPts[i].y);
        ctx.lineTo(btmNetPts[i].x, btmNetPts[i].y);
        const nextIdx = (i + cordStep) % rimSegs;
        ctx.moveTo(topNetPts[i].x, topNetPts[i].y);
        ctx.lineTo(btmNetPts[nextIdx].x, btmNetPts[nextIdx].y);
      }
      // Bottom Net Loop
      for (let i = 0; i < rimSegs; i++) {
        if (i === 0) ctx.moveTo(btmNetPts[0].x, btmNetPts[0].y);
        else ctx.lineTo(btmNetPts[i].x, btmNetPts[i].y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    // --- 6. Metal Ball Rack with Spalding Basketballs ---
    drawBasketballRack(ctx, gx, gy, ox, oy) {
      // Metallic tubular stand
      this.drawBox(ctx, gx, gy, 0, 0.45, 0.90, 0.55, '#94a3b8', '#64748b', '#475569', ox, oy);
      // 3 Basketballs on rack
      const balls = [
        { dx: 0.22, dy: 0.22, dz: 0.62 },
        { dx: 0.22, dy: 0.50, dz: 0.62 },
        { dx: 0.22, dy: 0.75, dz: 0.62 }
      ];
      balls.forEach(b => {
        const bp = isoToScreen(gx + b.dx, gy + b.dy, b.dz, ox, oy);
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, 5.0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        // Ball seam
        ctx.beginPath();
        ctx.arc(bp.x - 1, bp.y, 3.5, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      });
    }

    // --- 7. NCU Midnight Snack Street 1: Iconic Blue Food Truck (小貨車改裝餐車) ---
    // Modeled after authentic Central University campus festival & midnight food truck
    drawFoodTruck(ctx, gx, gy, ox, oy) {
      const isNight = (this.world.currentTimeState === 'night' || this.world.currentTimeState === 'galaxy');

      // 1. Truck Chassis & 4 Rubber Wheels with Silver Hubcaps
      const wheelPositions = [
        { wx: gx + 0.1, wy: gy + 0.5 },
        { wx: gx + 1.4, wy: gy + 0.5 },
        { wx: gx + 0.1, wy: gy + 2.2 },
        { wx: gx + 1.4, wy: gy + 2.2 }
      ];
      wheelPositions.forEach(w => {
        this.drawBox(ctx, w.wx, w.wy, 0, 0.18, 0.42, 0.34, '#1e293b', '#0f172a', '#020617', ox, oy);
        const wp = isoToScreen(w.wx + 0.09, w.wy + 0.21, 0.17, ox, oy);
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(wp.x, wp.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Dark steel lower frame chassis
      this.drawBox(ctx, gx + 0.15, gy + 0.3, 0.18, 1.35, 2.4, 0.22, '#334155', '#1e293b', '#0f172a', ox, oy);

      // 2. Front Driver Cab (South end: gy + 1.7 to gy + 2.7)
      // Metallic Central Blue Cab Body (中華菱利經典藍)
      this.drawBox(ctx, gx + 0.1, gy + 1.7, 0.35, 1.45, 1.05, 0.72, '#2563eb', '#1d4ed8', '#1e40af', ox, oy);
      // Windshield & Cab Roof
      this.drawBox(ctx, gx + 0.15, gy + 1.75, 1.07, 1.35, 0.95, 0.52, '#3b82f6', '#1d4ed8', '#1e3a8a', ox, oy);
      // Front Windshield Glass
      const ws0 = isoToScreen(gx + 0.18, gy + 2.68, 0.98, ox, oy);
      const ws1 = isoToScreen(gx + 1.47, gy + 2.68, 0.98, ox, oy);
      const ws2 = isoToScreen(gx + 1.47, gy + 2.68, 1.50, ox, oy);
      const ws3 = isoToScreen(gx + 0.18, gy + 2.68, 1.50, ox, oy);
      ctx.fillStyle = 'rgba(147, 197, 253, 0.75)';
      ctx.beginPath();
      ctx.moveTo(ws0.x, ws0.y); ctx.lineTo(ws1.x, ws1.y); ctx.lineTo(ws2.x, ws2.y); ctx.lineTo(ws3.x, ws3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Front Headlights & Chrome Bumper
      const hlLeft = isoToScreen(gx + 0.25, gy + 2.76, 0.55, ox, oy);
      const hlRight = isoToScreen(gx + 1.35, gy + 2.76, 0.55, ox, oy);
      [hlLeft, hlRight].forEach(hl => {
        ctx.fillStyle = isNight ? '#fef08a' : '#f8fafc';
        if (isNight) {
          ctx.shadowColor = '#fef08a';
          ctx.shadowBlur = 8;
        }
        ctx.beginPath();
        ctx.arc(hl.x, hl.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 3. Rear Food Truck Kitchen & Serving Counter (gy + 0.15 to gy + 1.70)
      // Solid warm wood drop-side serving bar box
      this.drawBox(ctx, gx + 0.05, gy + 0.15, 0.35, 1.55, 1.55, 0.48, '#854d0e', '#713f12', '#582b0c', ox, oy);

      // Solid West-facing wood front panel (facing street along Y-axis)
      const fw0 = isoToScreen(gx + 0.05, gy + 0.15, 0.35, ox, oy);
      const fw1 = isoToScreen(gx + 0.05, gy + 1.70, 0.35, ox, oy);
      const fw2 = isoToScreen(gx + 0.05, gy + 1.70, 0.83, ox, oy);
      const fw3 = isoToScreen(gx + 0.05, gy + 0.15, 0.83, ox, oy);
      ctx.fillStyle = '#854d0e';
      ctx.beginPath();
      ctx.moveTo(fw0.x, fw0.y); ctx.lineTo(fw1.x, fw1.y); ctx.lineTo(fw2.x, fw2.y); ctx.lineTo(fw3.x, fw3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#582b0c';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Wood Counter Front Menu Plaque
      const cp = isoToScreen(gx + 0.05, gy + 0.925, 0.59, ox, oy);
      ctx.save();
      ctx.translate(cp.x, cp.y);
      ctx.transform(1, -0.5, 0, 1, 0, 0); // Sheared onto Y-axis truck counter
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(-45, -7, 90, 14);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.0;
      ctx.strokeRect(-45, -7, 90, 14);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 7px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang TC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('炒泡麵 • 特調飲品 🚚', 0, 0);
      ctx.restore();

      // Stainless steel kitchen counter surface
      this.drawBox(ctx, gx + 0.12, gy + 0.20, 0.83, 1.40, 1.45, 0.08, '#cbd5e1', '#94a3b8', '#64748b', ox, oy);

      // Sizzling Noodle Wok & Condiments on Counter
      const wokP = isoToScreen(gx + 0.65, gy + 0.85, 0.93, ox, oy);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(wokP.x, wokP.y, 8, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Steam over wok
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(wokP.x, wokP.y - 6, 4, 0, Math.PI * 2);
      ctx.arc(wokP.x + 3, wokP.y - 11, 5, 0, Math.PI * 2);
      ctx.fill();

      // 4. White Canopy Support Poles
      const polePositions = [
        { px: gx + 0.1, py: gy + 0.15 },
        { px: gx + 1.5, py: gy + 0.15 },
        { px: gx + 0.1, py: gy + 1.65 },
        { px: gx + 1.5, py: gy + 1.65 }
      ];
      polePositions.forEach(p => {
        this.drawBox(ctx, p.px, p.py, 0.88, 0.06, 0.06, 1.15, '#f8fafc', '#cbd5e1', '#94a3b8', ox, oy);
      });

      // 5. Classic Striped Retractable Awning (藍白條紋遮陽篷，真實復刻中央大學餐車)
      this.drawBox(ctx, gx - 0.05, gy + 0.05, 2.00, 1.75, 1.70, 0.22, '#0284c7', '#0369a1', '#075985', ox, oy);
      // Striped awning accents along X-axis
      for (let s = 0; s < 4; s++) {
        const sx = gx - 0.02 + s * 0.44;
        this.drawBox(ctx, sx, gy + 0.08, 2.02, 0.22, 1.64, 0.20, '#ffffff', '#e2e8f0', '#cbd5e1', ox, oy);
      }

      // 6. Rooftop Circular Backlit Lightbox Sign (車頂圓形招牌)
      const signP = isoToScreen(gx + 0.82, gy + 0.90, 2.30, ox, oy);
      ctx.save();
      ctx.translate(signP.x, signP.y);
      if (isNight) {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
      }
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 6.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang TC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('餐車', 0, 0);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // --- 8. NCU Midnight Snack Street 2: Famous 「好兇蛋餅 / 無敵蛋餅」 ---
    // Modeled after user photo of the famous NCU egg pancake stall with iconic round yellow sign
    drawEggPancakeStall(ctx, gx, gy, ox, oy) {
      const isNight = (this.world.currentTimeState === 'night' || this.world.currentTimeState === 'galaxy');

      // 1. Stainless Steel Prep Counter Base (x: gx to gx+1.45, y: gy to gy+1.85, z: 0 to 0.85)
      this.drawBox(ctx, gx, gy, 0, 1.45, 1.85, 0.85, '#cbd5e1', '#94a3b8', '#64748b', ox, oy);

      // Solid West-facing Stainless Steel Front Panel (facing street along Y-axis)
      const w0 = isoToScreen(gx, gy, 0, ox, oy);
      const w1 = isoToScreen(gx, gy + 1.85, 0, ox, oy);
      const w2 = isoToScreen(gx, gy + 1.85, 0.85, ox, oy);
      const w3 = isoToScreen(gx, gy, 0.85, ox, oy);
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(w0.x, w0.y); ctx.lineTo(w1.x, w1.y); ctx.lineTo(w2.x, w2.y); ctx.lineTo(w3.x, w3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Front Counter Plaque Signboard: "無敵蛋餅 • 招牌現煎 🍳"
      const cp = isoToScreen(gx, gy + 0.925, 0.44, ox, oy);
      ctx.save();
      ctx.translate(cp.x, cp.y);
      ctx.transform(1, -0.5, 0, 1, 0, 0); // Sheared onto Y-axis stall counter
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-52, -8, 104, 16);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-52, -8, 104, 16);
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 7.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang TC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('無敵蛋餅 • 招牌現煎 🍳', 0, 0);
      ctx.restore();

      // 2. Heavy-Duty Teppanyaki Sizzling Flat-top Griddle (平底鐵板煎台)
      this.drawBox(ctx, gx + 0.15, gy + 0.18, 0.85, 1.15, 0.82, 0.10, '#334155', '#1e293b', '#0f172a', ox, oy);
      // Golden Egg Pancakes Sizzling on Griddle
      const ep0 = isoToScreen(gx + 0.45, gy + 0.45, 0.97, ox, oy);
      const ep1 = isoToScreen(gx + 0.85, gy + 0.70, 0.97, ox, oy);
      [ep0, ep1].forEach(ep => {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.ellipse(ep.x, ep.y, 7, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.0;
        ctx.stroke();
      });

      // 3. Tall Tower of Folded White Takeaway Paper Meal Boxes (外帶紙餐盒堆疊)
      this.drawBox(ctx, gx + 0.20, gy + 1.20, 0.85, 0.45, 0.45, 0.65, '#f8fafc', '#e2e8f0', '#cbd5e1', ox, oy);
      // Sauce Squeeze Bottles (Red Sweet Chili & Dark Thick Soy Sauce)
      const b0 = isoToScreen(gx + 0.85, gy + 1.30, 0.95, ox, oy);
      const b1 = isoToScreen(gx + 1.05, gy + 1.40, 0.95, ox, oy);
      ctx.fillStyle = '#ef4444'; // Red Sweet Chili
      ctx.fillRect(b0.x - 2, b0.y - 12, 4, 12);
      ctx.fillStyle = '#78350f'; // Dark Thick Soy Sauce
      ctx.fillRect(b1.x - 2, b1.y - 12, 4, 12);

      // 4. Stainless Steel Canopy Poles
      this.drawBox(ctx, gx + 0.05, gy + 0.05, 0.85, 0.05, 0.05, 1.20, '#94a3b8', '#64748b', '#475569', ox, oy);
      this.drawBox(ctx, gx + 1.35, gy + 0.05, 0.85, 0.05, 0.05, 1.20, '#94a3b8', '#64748b', '#475569', ox, oy);
      this.drawBox(ctx, gx + 0.05, gy + 1.75, 0.85, 0.05, 0.05, 1.20, '#94a3b8', '#64748b', '#475569', ox, oy);
      this.drawBox(ctx, gx + 1.35, gy + 1.75, 0.85, 0.05, 0.05, 1.20, '#94a3b8', '#64748b', '#475569', ox, oy);

      // Stainless Steel Canopy Roof (Z: 2.05 to 2.21)
      this.drawBox(ctx, gx - 0.05, gy - 0.05, 2.05, 1.55, 1.95, 0.16, '#cbd5e1', '#94a3b8', '#64748b', ox, oy);
      // Canopy Roof West Edge Face (gives solid roof thickness)
      const rw0 = isoToScreen(gx - 0.05, gy - 0.05, 2.05, ox, oy);
      const rw1 = isoToScreen(gx - 0.05, gy + 1.90, 2.05, ox, oy);
      const rw2 = isoToScreen(gx - 0.05, gy + 1.90, 2.21, ox, oy);
      const rw3 = isoToScreen(gx - 0.05, gy - 0.05, 2.21, ox, oy);
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(rw0.x, rw0.y); ctx.lineTo(rw1.x, rw1.y); ctx.lineTo(rw2.x, rw2.y); ctx.lineTo(rw3.x, rw3.y);
      ctx.closePath();
      ctx.fill();

      // Warm Incandescent Heat Lamp hanging over counter
      const lp = isoToScreen(gx + 0.65, gy + 0.70, 1.85, ox, oy);
      ctx.fillStyle = '#fef08a';
      if (isNight) {
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
      }
      ctx.beginPath();
      ctx.arc(lp.x, lp.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 5. ICONIC ROUND YELLOW SIGNBOARD 「無敵蛋餅」 (復刻實體招牌)
      // Steel Mounting Pole extending from canopy roof corner
      this.drawBox(ctx, gx + 0.05, gy + 0.20, 2.21, 0.05, 0.05, 0.32, '#334155', '#1e293b', '#0f172a', ox, oy);

      const signP = isoToScreen(gx + 0.075, gy + 0.225, 2.52, ox, oy);
      ctx.save();
      ctx.translate(signP.x, signP.y);
      if (isNight) {
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
      }
      // Bright Yellow Circle
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Bold Black Calligraphic Text 「無敵 蛋餅」
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 8.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang TC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('無敵', 0, -3.5);
      ctx.font = 'bold 7px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang TC", sans-serif';
      ctx.fillText('蛋餅', 0, 4.5);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // --- 9. NCU Midnight Snack Street 3: Famous 「傻師傅湯包」 (實體店鋪建築) ---
    // Modeled after user photo of legendary NCU back-door dumpling shop — authentic 1-story storefront building
    drawShaShiFuDumplings(ctx, gx, gy, ox, oy) {
      const isNight = (this.world.currentTimeState === 'night' || this.world.currentTimeState === 'galaxy');

      // 1. Foundation Plinth & Full Shop Floor Slab (covering entire shop footprint gx to gx+3.80, gy to gy+3.00)
      this.drawBox(ctx, gx, gy, 0, 3.80, 3.00, 0.04, '#cbd5e1', '#94a3b8', '#64748b', ox, oy);
      const in0 = isoToScreen(gx, gy, 0.04, ox, oy);
      const in1 = isoToScreen(gx + 3.80, gy, 0.04, ox, oy);
      const in2 = isoToScreen(gx + 3.80, gy + 3.00, 0.04, ox, oy);
      const in3 = isoToScreen(gx, gy + 3.00, 0.04, ox, oy);
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(in0.x, in0.y); ctx.lineTo(in1.x, in1.y); ctx.lineTo(in2.x, in2.y); ctx.lineTo(in3.x, in3.y);
      ctx.closePath();
      ctx.fill();

      // Interior Floor Warm Illumination Glow
      if (isNight) {
        ctx.fillStyle = 'rgba(254, 240, 138, 0.08)';
        ctx.fill();
      }

      // 2. Building Exterior Walls (Back & Sides)
      // North Wall (Back-Right, along X: x: gx to gx+3.80, y: gy, z: 0.04 to 2.65)
      this.drawBox(ctx, gx, gy, 0.04, 3.80, 0.25, 2.61, '#b91c1c', '#991b1b', '#7f1d1d', ox, oy);
      // North-West Corner Pillar (West face closure: x: gx, y: gy to gy+0.25, z: 0.04 to 2.65)
      const nwc0 = isoToScreen(gx, gy, 0.04, ox, oy);
      const nwc1 = isoToScreen(gx, gy + 0.25, 0.04, ox, oy);
      const nwc2 = isoToScreen(gx, gy + 0.25, 2.65, ox, oy);
      const nwc3 = isoToScreen(gx, gy, 2.65, ox, oy);
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(nwc0.x, nwc0.y); ctx.lineTo(nwc1.x, nwc1.y); ctx.lineTo(nwc2.x, nwc2.y); ctx.lineTo(nwc3.x, nwc3.y);
      ctx.closePath();
      ctx.fill();

      // East Back Wall (Back, along Y: x: gx+3.55, y: gy to gy+3.20, z: 0.04 to 2.65)
      this.drawBox(ctx, gx + 3.55, gy, 0.04, 0.25, 3.20, 2.61, '#991b1b', '#7f1d1d', '#450a0a', ox, oy);
      // South Wall (Front-Left cutaway: x: gx to gx+3.80, y: gy+2.95, z: 0.04 to 2.65)
      this.drawBox(ctx, gx, gy + 2.95, 0.04, 3.80, 0.25, 2.61, '#b91c1c', '#991b1b', '#7f1d1d', ox, oy);

      // 3. Kitchen Station Solid Tile Wall Backdrop (faces West towards street opening: closes camera sightline)
      const kb0 = isoToScreen(gx + 0.85, gy + 0.05, 0.04, ox, oy);
      const kb1 = isoToScreen(gx + 0.85, gy + 1.85, 0.04, ox, oy);
      const kb2 = isoToScreen(gx + 0.85, gy + 1.85, 2.15, ox, oy);
      const kb3 = isoToScreen(gx + 0.85, gy + 0.05, 2.15, ox, oy);
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.moveTo(kb0.x, kb0.y); ctx.lineTo(kb1.x, kb1.y); ctx.lineTo(kb2.x, kb2.y); ctx.lineTo(kb3.x, kb3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Stainless Steel Kitchen Range Hood / Commercial Exhaust Canopy over Steamers (z: 1.85 to 2.15, depth 0.65)
      this.drawBox(ctx, gx + 0.15, gy + 0.10, 1.85, 0.70, 1.70, 0.28, '#e2e8f0', '#94a3b8', '#64748b', ox, oy);

      // Traditional Wood Menu Plaque Strips on Kitchen Backdrop Wall
      const menuTitles = ['小籠湯包', '排骨酥湯', '鮮肉蒸餃', '酸辣湯'];
      menuTitles.forEach((mText, mi) => {
        const mY = gy + 0.25 + mi * 0.40;
        const mp = isoToScreen(gx + 0.84, mY, 1.45, ox, oy);
        ctx.save();
        ctx.translate(mp.x, mp.y);
        ctx.transform(1, -0.5, 0, 1, 0, 0);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-10, -18, 20, 36);
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-10, -18, 20, 36);
        ctx.fillStyle = '#fef3c7';
        ctx.font = 'bold 5.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang TC", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let ci = 0; ci < mText.length; ci++) {
          ctx.fillText(mText[ci], 0, -11 + ci * 7);
        }
        ctx.restore();
      });

      // 4. Dine-In Area: Neatly arranged tables and stools against the East/Back wall (gx + 2.1 to 3.4)
      // Dining Table 1 (Clean wooden dine-in table with stainless steel edge)
      this.drawBox(ctx, gx + 2.20, gy + 0.60, 0.04, 1.05, 0.75, 0.65, '#f1f5f9', '#cbd5e1', '#94a3b8', ox, oy);
      // Red Plastic Night-Market Dining Stools
      const stools = [
        { sx: gx + 2.00, sy: gy + 0.85 },
        { sx: gx + 3.25, sy: gy + 0.85 },
        { sx: gx + 2.60, sy: gy + 0.35 }
      ];
      stools.forEach(s => {
        this.drawBox(ctx, s.sx, s.sy, 0.04, 0.22, 0.22, 0.35, '#ef4444', '#dc2626', '#b91c1c', ox, oy);
      });

      // Table Condiment Tray (Soy sauce & vinegar cruets + chopstick dispenser)
      const cpP = isoToScreen(gx + 2.95, gy + 0.85, 0.71, ox, oy);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(cpP.x - 3, cpP.y - 7, 3, 7);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(cpP.x + 1, cpP.y - 8, 3, 8);

      // 5. Street-Facing Dumpling Cooking & Prep Front Counter (West facade: x: gx to gx+0.85, y: gy+0.05 to gy+1.85)
      // Solid Counter Base Box
      this.drawBox(ctx, gx, gy + 0.05, 0.04, 0.85, 1.80, 0.85, '#dc2626', '#b91c1c', '#991b1b', ox, oy);

      // Solid West-Facing Counter Front Panel (facing street along Y-axis)
      const fw0 = isoToScreen(gx, gy + 0.05, 0.04, ox, oy);
      const fw1 = isoToScreen(gx, gy + 1.85, 0.04, ox, oy);
      const fw2 = isoToScreen(gx, gy + 1.85, 0.89, ox, oy);
      const fw3 = isoToScreen(gx, gy + 0.05, 0.89, ox, oy);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(fw0.x, fw0.y); ctx.lineTo(fw1.x, fw1.y); ctx.lineTo(fw2.x, fw2.y); ctx.lineTo(fw3.x, fw3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Stainless Steel Countertop Rim
      this.drawBox(ctx, gx - 0.03, gy + 0.03, 0.89, 0.91, 1.84, 0.06, '#f8fafc', '#cbd5e1', '#94a3b8', ox, oy);
      // West Rim Lip Face
      const rlw0 = isoToScreen(gx - 0.03, gy + 0.03, 0.89, ox, oy);
      const rlw1 = isoToScreen(gx - 0.03, gy + 1.87, 0.89, ox, oy);
      const rlw2 = isoToScreen(gx - 0.03, gy + 1.87, 0.95, ox, oy);
      const rlw3 = isoToScreen(gx - 0.03, gy + 0.03, 0.95, ox, oy);
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(rlw0.x, rlw0.y); ctx.lineTo(rlw1.x, rlw1.y); ctx.lineTo(rlw2.x, rlw2.y); ctx.lineTo(rlw3.x, rlw3.y);
      ctx.closePath();
      ctx.fill();

      // Counter Front Banner: "湯包 • 排骨酥 • 蒸餃 🥟"
      const cpBanner = isoToScreen(gx, gy + 0.95, 0.47, ox, oy);
      ctx.save();
      ctx.translate(cpBanner.x, cpBanner.y);
      ctx.transform(1, -0.5, 0, 1, 0, 0); // Sheared onto Y-axis counter face
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(-52, -8, 104, 16);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-52, -8, 104, 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 7.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang TC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('湯包 • 排骨酥 • 蒸餃 🥟', 0, 0);
      ctx.restore();

      // 6. Authentic Bamboo Steamers (三疊竹蒸籠，中央宵夜街現蒸熱氣)
      const steamerStacks = [
        { sx: gx + 0.28, sy: gy + 0.45, tiers: 3 },
        { sx: gx + 0.50, sy: gy + 0.90, tiers: 3 },
        { sx: gx + 0.28, sy: gy + 1.35, tiers: 2 }
      ];
      steamerStacks.forEach((st, idx) => {
        for (let tier = 0; tier < st.tiers; tier++) {
          const sz = 0.96 + tier * 0.16;
          const sp = isoToScreen(st.sx, st.sy, sz, ox, oy);
          ctx.fillStyle = (tier === st.tiers - 1) ? '#b45309' : '#d97706';
          ctx.beginPath();
          ctx.ellipse(sp.x, sp.y, 7.5, 4.2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }

        // Rising Steam Animation
        const steamTime = (performance.now() * 0.002 + idx * 1.5) % 3;
        const steamAlpha = Math.max(0, 0.65 - steamTime * 0.2);
        const topP = isoToScreen(st.sx, st.sy, 1.44 + steamTime * 0.35, ox, oy);
        ctx.fillStyle = `rgba(255, 255, 255, ${steamAlpha})`;
        ctx.beginPath();
        ctx.arc(topP.x - 2, topP.y - 2, 4 + steamTime * 2.2, 0, Math.PI * 2);
        ctx.arc(topP.x + 3, topP.y - 6, 5 + steamTime * 2.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // 7. Roll-up Shutter Garage Lintel over Entrance (y: gy+1.85 to gy+2.95)
      this.drawBox(ctx, gx - 0.02, gy + 1.85, 2.10, 0.14, 1.10, 0.25, '#64748b', '#475569', '#334155', ox, oy);

      // 7. LARGE RED STOREFRONT SIGNBOARD 「傻師傅湯包」 (大紅底白字經典店面橫幅招牌)
      this.drawBox(ctx, gx - 0.06, gy, 2.15, 0.22, 2.95, 0.50, '#dc2626', '#b91c1c', '#7f1d1d', ox, oy);

      // Solid West Face of Storefront Signboard
      const sw0 = isoToScreen(gx - 0.06, gy, 2.15, ox, oy);
      const sw1 = isoToScreen(gx - 0.06, gy + 2.95, 2.15, ox, oy);
      const sw2 = isoToScreen(gx - 0.06, gy + 2.95, 2.65, ox, oy);
      const sw3 = isoToScreen(gx - 0.06, gy, 2.65, ox, oy);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(sw0.x, sw0.y); ctx.lineTo(sw1.x, sw1.y); ctx.lineTo(sw2.x, sw2.y); ctx.lineTo(sw3.x, sw3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Signboard Text along Y-axis front
      const signP = isoToScreen(gx - 0.06, gy + 1.48, 2.40, ox, oy);
      ctx.save();
      ctx.translate(signP.x, signP.y);
      ctx.transform(1, -0.5, 0, 1, 0, 0); // Sheared onto Y-axis storefront fascia
      if (isNight) {
        ctx.shadowColor = '#fca5a5';
        ctx.shadowBlur = 12;
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang TC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('傻師傅湯包', 0, 0);
      ctx.shadowBlur = 0;
      ctx.restore();

      // 8. Protruding Vertical Lightbox Sign 「傻師傅 湯包」 (立體外凸招牌)
      // Dual Iron Wall Mounting Brackets
      this.drawBox(ctx, gx - 0.22, gy + 0.12, 2.45, 0.22, 0.05, 0.05, '#1e293b', '#0f172a', '#020617', ox, oy);
      this.drawBox(ctx, gx - 0.22, gy + 0.12, 2.80, 0.22, 0.05, 0.05, '#1e293b', '#0f172a', '#020617', ox, oy);

      // Sign Box (x: gx-0.28 to gx-0.18, y: gy+0.05 to gy+0.35, z: 2.30 to 2.95)
      this.drawBox(ctx, gx - 0.28, gy + 0.05, 2.30, 0.10, 0.30, 0.65, '#dc2626', '#b91c1c', '#991b1b', ox, oy);

      // Sign Box West Face
      const sbw0 = isoToScreen(gx - 0.28, gy + 0.05, 2.30, ox, oy);
      const sbw1 = isoToScreen(gx - 0.28, gy + 0.35, 2.30, ox, oy);
      const sbw2 = isoToScreen(gx - 0.28, gy + 0.35, 2.95, ox, oy);
      const sbw3 = isoToScreen(gx - 0.28, gy + 0.05, 2.95, ox, oy);
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.moveTo(sbw0.x, sbw0.y); ctx.lineTo(sbw1.x, sbw1.y); ctx.lineTo(sbw2.x, sbw2.y); ctx.lineTo(sbw3.x, sbw3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Vertical text on the West face
      const vertP = isoToScreen(gx - 0.28, gy + 0.20, 2.62, ox, oy);
      ctx.save();
      ctx.translate(vertP.x, vertP.y);
      ctx.transform(1, -0.5, 0, 1, 0, 0);
      if (isNight) {
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 7px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang TC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('傻師傅', 0, -6);
      ctx.fillText('湯包', 0, 6);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // --- 10. Ground-Standing Street Pole Signboard (插在地上的立式看板招牌) ---
    drawGroundStandingSign(ctx, gx, gy, title, subtitle, bgColor, textColor, ox, oy, icon = '') {
      const isNight = (this.world.currentTimeState === 'night' || this.world.currentTimeState === 'galaxy');

      // Sturdy Dual Metal Ground Stakes / Pole (Z = 0 to 1.15)
      this.drawBox(ctx, gx + 0.05, gy + 0.10, 0, 0.06, 0.06, 1.15, '#334155', '#1e293b', '#0f172a', ox, oy);
      this.drawBox(ctx, gx + 0.05, gy + 0.70, 0, 0.06, 0.06, 1.15, '#334155', '#1e293b', '#0f172a', ox, oy);

      // Ground Concrete Base Block
      this.drawBox(ctx, gx, gy + 0.05, 0, 0.16, 0.75, 0.14, '#94a3b8', '#64748b', '#475569', ox, oy);

      // Signboard Panel (Facing West towards road / sheared along Y-axis)
      const sp = isoToScreen(gx + 0.04, gy + 0.42, 0.95, ox, oy);
      ctx.save();
      ctx.translate(sp.x, sp.y);
      ctx.transform(1, -0.5, 0, 1, 0, 0); // Sheared onto Y-axis

      const W = 48;
      const H = 30;

      if (isNight) {
        ctx.shadowColor = bgColor || '#facc15';
        ctx.shadowBlur = 8;
      }
      // Board Background
      ctx.fillStyle = bgColor || '#facc15';
      ctx.fillRect(-W / 2, -H / 2, W, H);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-W / 2, -H / 2, W, H);

      // Main Text
      ctx.fillStyle = textColor || '#0f172a';
      ctx.font = 'bold 8.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang TC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((icon ? icon + ' ' : '') + title, 0, subtitle ? -5 : 0);

      // Subtitle
      if (subtitle) {
        ctx.font = '6px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang TC", sans-serif';
        ctx.fillText(subtitle, 0, 7);
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // --- 10. Classic Parked Taiwanese Scooter (中央宵夜街經典路邊機車群) ---
    // Modeled after the scooters lined up on the asphalt street in NCU Night Market
    drawScooter(ctx, gx, gy, color, ox, oy) {
      const col = color || '#0284c7';

      // Dual Rubber Wheels with Hubs
      this.drawBox(ctx, gx + 0.12, gy + 0.10, 0, 0.15, 0.22, 0.25, '#1e293b', '#0f172a', '#020617', ox, oy);
      this.drawBox(ctx, gx + 0.12, gy + 0.65, 0, 0.15, 0.22, 0.25, '#1e293b', '#0f172a', '#020617', ox, oy);

      // Scooter Body Chassis
      this.drawBox(ctx, gx + 0.10, gy + 0.18, 0.15, 0.22, 0.58, 0.35, col, '#0f172a', '#020617', ox, oy);

      // Cushioned Black Seat
      this.drawBox(ctx, gx + 0.08, gy + 0.20, 0.50, 0.24, 0.42, 0.12, '#334155', '#1e293b', '#0f172a', ox, oy);

      // Front Handlebar Cowl & Headlight
      this.drawBox(ctx, gx + 0.10, gy + 0.68, 0.45, 0.20, 0.18, 0.35, col, '#0f172a', '#020617', ox, oy);
      const hlP = isoToScreen(gx + 0.20, gy + 0.86, 0.72, ox, oy);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(hlP.x, hlP.y, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Rear Metal Cargo Rack & Tail Light
      const tlP = isoToScreen(gx + 0.20, gy + 0.12, 0.45, ox, oy);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(tlP.x, tlP.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Backward Compatibility Aliases ---
    drawSnackStallFriedChicken(ctx, gx, gy, ox, oy) {
      this.drawEggPancakeStall(ctx, gx, gy, ox, oy);
    }
    drawSnackStallBobaTea(ctx, gx, gy, ox, oy) {
      this.drawFoodTruck(ctx, gx, gy, ox, oy);
    }
    drawSnackStallLuwei(ctx, gx, gy, ox, oy) {
      this.drawShaShiFuDumplings(ctx, gx, gy, ox, oy);
    }

    // --- 10. Street Corner Foldable Table & Iconic Red Plastic Stools ---
    drawNightMarketTable(ctx, gx, gy, ox, oy) {
      // Foldable Round Steel Table
      this.drawBox(ctx, gx + 0.40, gy + 0.40, 0, 0.10, 0.10, 0.65, '#94a3b8', '#64748b', '#475569', ox, oy); // Leg
      const tp = isoToScreen(gx + 0.45, gy + 0.45, 0.65, ox, oy);
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.ellipse(tp.x, tp.y, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Snack paper bag and drink on table
      ctx.fillStyle = '#b45309';
      ctx.fillRect(tp.x - 4, tp.y - 6, 5, 5);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(tp.x + 4, tp.y - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // 3 Iconic Taiwanese Red Plastic Stools
      const stools = [
        { sx: gx + 0.15, sy: gy + 0.45 },
        { sx: gx + 0.75, sy: gy + 0.45 },
        { sx: gx + 0.45, sy: gy + 0.80 }
      ];
      stools.forEach(s => {
        this.drawBox(ctx, s.sx, s.sy, 0, 0.28, 0.28, 0.38, '#ef4444', '#dc2626', '#b91c1c', ox, oy);
        // Hollow hole in center of stool
        const hp = isoToScreen(s.sx + 0.14, s.sy + 0.14, 0.38, ox, oy);
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.arc(hp.x, hp.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // --- 11. Midnight Snack Street Entrance Archway ---
    drawNightMarketArch(ctx, gx, gy, ox, oy) {
      // Left & Right Pillars
      this.drawBox(ctx, gx, gy, 0, 0.30, 0.30, 2.80, '#ef4444', '#dc2626', '#b91c1c', ox, oy);
      this.drawBox(ctx, gx + 2.8, gy, 0, 0.30, 0.30, 2.80, '#ef4444', '#dc2626', '#b91c1c', ox, oy);

      // Overhead Crossbeam with Glowing Sign
      this.drawBox(ctx, gx - 0.10, gy - 0.05, 2.70, 3.30, 0.40, 0.55, '#b91c1c', '#991b1b', '#7f1d1d', ox, oy);

      const cp = isoToScreen(gx + 1.55, gy + 0.15, 2.95, ox, oy);
      const isNight = (this.world.currentTimeState === 'night' || this.world.currentTimeState === 'galaxy');

      ctx.save();
      ctx.translate(cp.x, cp.y);
      ctx.transform(1, 0.5, 0, 1, 0, 0); // Sheared onto X-axis archway beam!

      const W = 180;
      const H = 22;

      // Crimson Lacquer Backing Board
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(-W / 2, -H / 2, W, H);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(-W / 2, -H / 2, W, H);
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-W / 2 + 2, -H / 2 + 2, W - 4, H - 4);

      if (isNight) {
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;
      }
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 9.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang TC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏮 宵夜街 • MIDNIGHT SNACK HUB 🏮', 0, 0);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // --- 12. Overhead Hanging Fairy Lights Strand ---
    drawFairyLights(ctx, x1, y1, z1, x2, y2, z2, ox, oy) {
      const isNight = (this.world.currentTimeState === 'night' || this.world.currentTimeState === 'galaxy');

      // Festoon Support Poles at curb endpoints (x1, y1) and (x2, y2)
      this.drawBox(ctx, x1 - 0.04, y1 - 0.04, 0, 0.08, 0.08, z1, '#334155', '#1e293b', '#0f172a', ox, oy);
      this.drawBox(ctx, x2 - 0.04, y2 - 0.04, 0, 0.08, 0.08, z2, '#334155', '#1e293b', '#0f172a', ox, oy);

      const count = 7;
      const pts = [];

      for (let i = 0; i <= count; i++) {
        const t = i / count;
        const gx = x1 + (x2 - x1) * t;
        const gy = y1 + (y2 - y1) * t;
        // Catenary sag curve (gentle realistic suspension)
        const sag = Math.sin(t * Math.PI) * 0.22;
        const gz = z1 + (z2 - z1) * t - sag;
        pts.push(isoToScreen(gx, gy, gz, ox, oy));
      }

      // Steel cable
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.75)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();

      // Warm Bulbs along cable
      for (let i = 1; i < pts.length - 1; i++) {
        const p = pts[i];
        if (isNight) {
          const glow = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, 8);
          glow.addColorStop(0, 'rgba(253, 224, 71, 0.85)');
          glow.addColorStop(0.5, 'rgba(245, 158, 11, 0.35)');
          glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = isNight ? '#fef08a' : '#fde047';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // =========================================================================
    // LUDWIGIA INDOOR SPECIALTY CAFE (溫馨文青的室內精品咖啡館)
    // =========================================================================

    // --- 13. Indoor Barista Counter & Commercial Espresso Machine ---
    drawCafeBarCounter(ctx, gx, gy, ox, oy) {
      // Warm Dark Walnut Base with Brass Base Kickplate
      this.drawBox(ctx, gx, gy, 0, 2.80, 1.10, 0.92, '#78350f', '#58240a', '#451a03', ox, oy);
      // Polished Calacatta Gold White Marble Countertop Overhang
      this.drawBox(ctx, gx - 0.05, gy - 0.05, 0.92, 2.90, 1.20, 0.10, '#f8fafc', '#e2e8f0', '#cbd5e1', ox, oy);

      // Commercial Dual-Group Chrome Espresso Machine (La Marzocco Style)
      this.drawBox(ctx, gx + 0.35, gy + 0.25, 1.02, 0.90, 0.60, 0.55, '#f1f5f9', '#94a3b8', '#64748b', ox, oy);
      // Cup Warming Top Tray with Inset Ceramic Cups
      this.drawBox(ctx, gx + 0.40, gy + 0.30, 1.57, 0.80, 0.50, 0.06, '#334155', '#1e293b', '#0f172a', ox, oy);
      const cp1 = isoToScreen(gx + 0.55, gy + 0.45, 1.63, ox, oy);
      const cp2 = isoToScreen(gx + 0.90, gy + 0.45, 1.63, ox, oy);
      [cp1, cp2].forEach(c => {
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(c.x, c.y, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // Chrome Dual Group Heads & Portafilters
      const pf1 = isoToScreen(gx + 0.65, gy + 0.82, 1.15, ox, oy);
      const pf2 = isoToScreen(gx + 0.95, gy + 0.82, 1.15, ox, oy);
      ctx.fillStyle = '#0f172a';
      [pf1, pf2].forEach(p => {
        ctx.fillRect(p.x - 3, p.y - 2, 6, 4);
      });

      // Conical Burr Coffee Grinder (Matte Black)
      this.drawBox(ctx, gx + 1.35, gy + 0.30, 1.02, 0.35, 0.40, 0.68, '#1e293b', '#0f172a', '#020617', ox, oy);
      // Transparent Bean Hopper with Roasted Coffee Beans
      this.drawBox(ctx, gx + 1.38, gy + 0.33, 1.70, 0.28, 0.32, 0.30, 'rgba(254, 215, 170, 0.5)', 'rgba(217, 119, 6, 0.4)', 'rgba(180, 83, 9, 0.4)', ox, oy);

      // Glass Pastry Showcase (Displaying Basque Cheesecake & Butter Croissants)
      this.drawBox(ctx, gx + 1.85, gy + 0.20, 1.02, 0.90, 0.65, 0.45, 'rgba(241, 245, 249, 0.45)', 'rgba(226, 232, 240, 0.35)', 'rgba(203, 213, 225, 0.35)', ox, oy);
      // Pastries inside
      const pCroissant = isoToScreen(gx + 2.10, gy + 0.45, 1.12, ox, oy);
      const pCake = isoToScreen(gx + 2.50, gy + 0.50, 1.12, ox, oy);
      ctx.fillStyle = '#d97706'; // Golden Croissant
      ctx.beginPath();
      ctx.ellipse(pCroissant.x, pCroissant.y, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350f'; // Basque Cheesecake slice
      ctx.beginPath();
      ctx.moveTo(pCake.x, pCake.y - 3); ctx.lineTo(pCake.x + 4, pCake.y + 3); ctx.lineTo(pCake.x - 4, pCake.y + 3);
      ctx.closePath();
      ctx.fill();

      // Ceramic Takeaway Cup Stack
      const cupStack = isoToScreen(gx + 0.15, gy + 0.50, 1.02, ox, oy);
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(cupStack.x - 3, cupStack.y - 8, 6, 8);
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(cupStack.x - 3, cupStack.y - 8, 6, 8);
    }

    // --- 14. Cafe Wall Chalkboard Menu (Mounted on North Transversal Wall) ---
    drawCafeMenuBoard(ctx, gx, gy, ox, oy) {
      const p = isoToScreen(gx, gy, 1.45, ox, oy);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.transform(1, 0.5, 0, 1, 0, 0); // Sheared onto X-axis transversal wall!

      const W = 110;
      const H = 64;

      // Dark Slate Blackboard with Teak Frame
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-W / 2 - 2, -H / 2 - 2, W + 4, H + 4);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-W / 2, -H / 2, W, H);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.0;
      ctx.strokeRect(-W / 2, -H / 2, W, H);

      // Chalkboard Menu Typography
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 7.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('☕ SPECIALTY COFFEE', 0, -20);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '6px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('• Espresso / Americano', -W / 2 + 8, -8);
      ctx.fillText('• Flat White / Latte', -W / 2 + 8, 2);
      ctx.fillText('• Hand-Drip Single Origin', -W / 2 + 8, 12);
      ctx.fillText('• Basque Cheesecake', -W / 2 + 8, 22);
      ctx.restore();
    }

    // --- 15. Indoor Lounge Coffee Table & Leather Armchairs ---
    drawCafeLoungeTable(ctx, gx, gy, ox, oy) {
      // 1. Woven Nordic Area Rug on Parquet Floor
      const r0 = isoToScreen(gx - 0.35, gy - 0.35, 0.01, ox, oy);
      const r1 = isoToScreen(gx + 1.85, gy - 0.35, 0.01, ox, oy);
      const r2 = isoToScreen(gx + 1.85, gy + 1.65, 0.01, ox, oy);
      const r3 = isoToScreen(gx - 0.35, gy + 1.65, 0.01, ox, oy);
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.moveTo(r0.x, r0.y); ctx.lineTo(r1.x, r1.y); ctx.lineTo(r2.x, r2.y); ctx.lineTo(r3.x, r3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // 2. Background Armchair (North-West / Red Armchair — BEHIND table)
      // Drawn before table so the round tabletop naturally occludes and frames it!
      const c1X = gx - 0.05;
      const c1Y = gy + 0.42;
      this.drawBox(ctx, c1X, c1Y, 0, 0.45, 0.45, 0.38, '#c2410c', '#9a3412', '#7c2d12', ox, oy);
      this.drawBox(ctx, c1X, c1Y, 0.38, 0.10, 0.45, 0.38, '#9a3412', '#7c2d12', '#431407', ox, oy); // Backrest

      // 3. Middle Layer: Solid Walnut Round Coffee Table & Steaming Mugs
      this.drawBox(ctx, gx + 0.65, gy + 0.55, 0, 0.12, 0.12, 0.55, '#451a03', '#3b180a', '#291006', ox, oy); // Table base
      const tp = isoToScreen(gx + 0.71, gy + 0.61, 0.55, ox, oy);
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(tp.x, tp.y, 18, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 2 Steaming Ceramic Mugs with Heart Foam Latte Art
      const cup1 = { x: tp.x - 5, y: tp.y - 2 };
      const cup2 = { x: tp.x + 6, y: tp.y + 1 };
      [cup1, cup2].forEach(c => {
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(c.x, c.y, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        // Coffee Surface & Foam
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.arc(c.x, c.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef3c7'; // Cream heart dot
        ctx.beginPath();
        ctx.arc(c.x, c.y, 1.0, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Foreground Armchair (South-East / Navy Armchair — IN FRONT of table)
      // Drawn after table so it naturally renders in front of table edge!
      const c2X = gx + 1.25;
      const c2Y = gy + 0.45;
      this.drawBox(ctx, c2X, c2Y, 0, 0.45, 0.45, 0.38, '#334155', '#1e293b', '#0f172a', ox, oy);
      this.drawBox(ctx, c2X + 0.35, c2Y, 0.38, 0.10, 0.45, 0.38, '#1e293b', '#0f172a', '#020617', ox, oy); // Backrest
    }

    // --- 16. Window-Facing Timber Bar Counter & Stools ---
    drawCafeWindowBar(ctx, gx, gy, ox, oy) {
      // Long Oak Window Counter
      this.drawBox(ctx, gx, gy, 0, 2.40, 0.45, 0.90, '#d97706', '#b45309', '#92400e', ox, oy);

      // 2 High Wooden Barstools with Footrests
      const stools = [gx + 0.45, gx + 1.65];
      stools.forEach(sx => {
        this.drawBox(ctx, sx, gy - 0.40, 0, 0.30, 0.30, 0.65, '#78350f', '#58240a', '#451a03', ox, oy);
        // Brass Footrest Ring
        const sP = isoToScreen(sx + 0.15, gy - 0.25, 0.65, ox, oy);
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.ellipse(sP.x, sP.y, 8, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Open MacBook / Laptop on the Window Bar
      this.drawBox(ctx, gx + 0.90, gy + 0.10, 0.90, 0.45, 0.32, 0.04, '#cbd5e1', '#94a3b8', '#64748b', ox, oy);
      // Open Screen tilted
      const sp = isoToScreen(gx + 1.12, gy + 0.12, 0.94, ox, oy);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(sp.x - 6, sp.y - 12, 12, 10);
      ctx.fillStyle = '#38bdf8'; // Glowing Code Screen
      ctx.fillRect(sp.x - 5, sp.y - 11, 10, 8);

      // Glass of Iced Cold Brew with Straw
      const iced = isoToScreen(gx + 1.60, gy + 0.20, 0.90, ox, oy);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillRect(iced.x - 2, iced.y - 7, 4, 7);
      ctx.fillStyle = '#451a03'; // Coffee
      ctx.fillRect(iced.x - 2, iced.y - 5, 4, 5);
      // Straw
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(iced.x, iced.y - 5); ctx.lineTo(iced.x + 2, iced.y - 11);
      ctx.stroke();
    }

    // --- 17. Indoor Tall Potted Monstera / Fiddle-Leaf Fig ---
    drawCafeIndoorPlant(ctx, gx, gy, ox, oy) {
      // Modern Terracotta Cylindrical Planter
      this.drawBox(ctx, gx, gy, 0, 0.55, 0.55, 0.60, '#ea580c', '#c2410c', '#9a3412', ox, oy);
      // Soil
      const sp = isoToScreen(gx + 0.27, gy + 0.27, 0.60, ox, oy);
      ctx.fillStyle = '#291006';
      ctx.beginPath();
      ctx.ellipse(sp.x, sp.y, 9, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lush Broad Emerald Leaves
      const leaves = [
        { dx: -10, dy: -12, rx: 9, ry: 5, rot: -0.4, color: '#16a34a' },
        { dx: 8, dy: -14, rx: 11, ry: 6, rot: 0.35, color: '#15803d' },
        { dx: -12, dy: -22, rx: 12, ry: 7, rot: -0.2, color: '#22c55e' },
        { dx: 6, dy: -24, rx: 13, ry: 7, rot: 0.4, color: '#16a34a' },
        { dx: 0, dy: -32, rx: 14, ry: 8, rot: 0.05, color: '#15803d' }
      ];
      leaves.forEach(l => {
        ctx.save();
        ctx.translate(sp.x + l.dx, sp.y + l.dy);
        ctx.rotate(l.rot);
        ctx.fillStyle = l.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, l.rx, l.ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
      });
    }

    // --- 18. Modern Industrial Corner Bookshelf ---
    drawCafeBookshelf(ctx, gx, gy, ox, oy) {
      // Matte Black Steel Frame & Oak Shelves
      this.drawBox(ctx, gx, gy, 0, 1.20, 0.45, 1.85, '#78350f', '#58240a', '#451a03', ox, oy);

      // Colorful Coffee Table & Tech Books on Shelves
      const books = [
        { z: 0.45, dx: 0.20, color: '#38bdf8' },
        { z: 0.45, dx: 0.45, color: '#f59e0b' },
        { z: 0.45, dx: 0.70, color: '#ec4899' },
        { z: 1.05, dx: 0.25, color: '#10b981' },
        { z: 1.05, dx: 0.55, color: '#8b5cf6' },
        { z: 1.05, dx: 0.85, color: '#f97316' }
      ];
      books.forEach(b => {
        this.drawBox(ctx, gx + b.dx, gy + 0.08, b.z, 0.20, 0.28, 0.45, b.color, '#1e293b', '#0f172a', ox, oy);
      });
    }

    // --- 19. Suspended Brass Pendant Lamp with Warm Lighting Cone ---
    drawCafePendantLamp(ctx, gx, gy, z = 2.2, ox, oy) {
      const lampP = isoToScreen(gx, gy, z, ox, oy);
      const floorP = isoToScreen(gx, gy, 0, ox, oy);

      // Thin Steel Cable from Ceiling
      const ceilP = isoToScreen(gx, gy, 3.2, ox, oy);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(ceilP.x, ceilP.y);
      ctx.lineTo(lampP.x, lampP.y);
      ctx.stroke();

      // Brass Dome Lampshade
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.arc(lampP.x, lampP.y, 6, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Warm Amber Bulb & Ambient Light Glow
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(lampP.x, lampP.y + 2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Soft Warm Light Circle on Floor
      const grad = ctx.createRadialGradient(floorP.x, floorP.y, 2, floorP.x, floorP.y, 35);
      grad.addColorStop(0, 'rgba(253, 224, 71, 0.22)');
      grad.addColorStop(1, 'rgba(253, 224, 71, 0.0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(floorP.x, floorP.y, 35, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // =========================================================================
    // ESPORTS CYBER CAFE & THE HOWLING ABYSS (ARAM) ARENA
    // =========================================================================

    // --- 15. Cyber Cafe Holographic Entrance Marquee ---
    drawCyberCafeSign(ctx, gx, gy, ox, oy) {
      // Twin Dark Steel Truss Pillars
      this.drawBox(ctx, gx, gy, 0, 0.35, 0.35, 2.70, '#1e293b', '#0f172a', '#020617', ox, oy);
      this.drawBox(ctx, gx + 3.0, gy, 0, 0.35, 0.35, 2.70, '#1e293b', '#0f172a', '#020617', ox, oy);

      // Overhead Cyber Billboard Backing
      this.drawBox(ctx, gx - 0.15, gy - 0.05, 2.65, 3.60, 0.45, 0.65, '#0f172a', '#020617', '#000000', ox, oy);

      const cp = isoToScreen(gx + 1.65, gy + 0.15, 2.95, ox, oy);
      ctx.save();
      ctx.translate(cp.x, cp.y);
      ctx.transform(1, 0.5, 0, 1, 0, 0); // Sheared onto X-axis billboard face!

      const W = 186;
      const H = 22;

      // Neon Gradient Border & Ambient Glow
      const grad = ctx.createLinearGradient(-W / 2, 0, W / 2, 0);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(0.5, '#3b82f6');
      grad.addColorStop(1, '#8b5cf6');

      // Cyber Carbon Face Plate
      ctx.fillStyle = '#020617';
      ctx.fillRect(-W / 2, -H / 2, W, H);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.strokeRect(-W / 2, -H / 2, W, H);
      ctx.shadowBlur = 0;

      // Inner Circuit Corner Accents
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-W / 2 + 2, -H / 2 + 2, W - 4, H - 4);

      // High-Tech Clean Typography
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang TC", "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡ 召喚師電競網咖 • CYBER LAN LOUNGE ⚡', 0, 0);

      ctx.restore();
    }

    // --- 16. High-Refresh Curved Gaming Rig & RGB Battle Station ---
    drawCyberCafeRig(ctx, gx, gy, ox, oy, isRedSide = false) {
      // Carbon fiber desk surface
      this.drawBox(ctx, gx, gy, 0, 1.35, 0.75, 0.72, '#0f172a', '#020617', '#1e293b', ox, oy);

      // Curved Ultrawide Gaming Monitor
      this.drawBox(ctx, gx + 0.30, gy + 0.12, 0.72, 0.75, 0.14, 0.45, '#1e293b', '#0f172a', '#020617', ox, oy);

      // Screen Display (Glowing League of Legends ARAM / Rift Match)
      const sp0 = isoToScreen(gx + 0.32, gy + 0.24, 0.78, ox, oy);
      const sp1 = isoToScreen(gx + 1.02, gy + 0.24, 0.78, ox, oy);
      const st1 = isoToScreen(gx + 1.02, gy + 0.24, 1.15, ox, oy);
      const st0 = isoToScreen(gx + 0.32, gy + 0.24, 1.15, ox, oy);

      ctx.fillStyle = isRedSide ? '#ef4444' : '#0284c7';
      ctx.beginPath();
      ctx.moveTo(sp0.x, sp0.y); ctx.lineTo(sp1.x, sp1.y); ctx.lineTo(st1.x, st1.y); ctx.lineTo(st0.x, st0.y);
      ctx.closePath();
      ctx.fill();

      // Mini Health Bar & Map lines on screen
      ctx.fillStyle = '#22c55e';
      const hpBar = isoToScreen(gx + 0.65, gy + 0.25, 1.12, ox, oy);
      ctx.fillRect(hpBar.x - 12, hpBar.y, 24, 2);

      // RGB Backlit Keyboard & Mouse Pad
      const kp = isoToScreen(gx + 0.65, gy + 0.52, 0.73, ox, oy);
      ctx.fillStyle = isRedSide ? 'rgba(239, 68, 68, 0.75)' : 'rgba(6, 182, 212, 0.75)';
      ctx.fillRect(kp.x - 10, kp.y - 3, 20, 7);

      // Liquid-Cooled Tempered Glass PC Tower with Internal RGB LEDs
      this.drawBox(ctx, gx + 1.12, gy + 0.15, 0.72, 0.20, 0.48, 0.42, '#38bdf8', '#0284c7', '#0f172a', ox, oy);

      // Ergonomic Racing Bucket Gaming Chair
      const chairCol = isRedSide ? '#dc2626' : '#2563eb';
      // Seat Cushion
      this.drawBox(ctx, gx + 0.50, gy + 0.82, 0, 0.38, 0.38, 0.45, chairCol, '#1e293b', '#0f172a', ox, oy);
      // High Racing Backrest
      this.drawBox(ctx, gx + 0.50, gy + 0.82, 0.45, 0.10, 0.38, 0.55, chairCol, '#1e293b', '#0f172a', ox, oy);
      // Headrest Pillow
      this.drawBox(ctx, gx + 0.50, gy + 0.90, 0.95, 0.10, 0.22, 0.10, '#f8fafc', '#94a3b8', '#64748b', ox, oy);
    }

    // --- 17. Cyber Cafe Snack & Instant Ramen Bar ---
    drawCyberSnackBar(ctx, gx, gy, ox, oy) {
      // Counter Base
      this.drawBox(ctx, gx, gy, 0, 1.80, 0.85, 0.85, '#1e293b', '#0f172a', '#020617', ox, oy);

      // Two Steaming Ramen Bowls with Poached Egg
      const r1 = isoToScreen(gx + 0.50, gy + 0.40, 0.88, ox, oy);
      const r2 = isoToScreen(gx + 1.15, gy + 0.40, 0.88, ox, oy);
      [r1, r2].forEach(rp => {
        // Red bowl
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.ellipse(rp.x, rp.y, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Golden yolk egg
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(rp.x, rp.y - 1, 2, 0, Math.PI * 2);
        ctx.fill();
        // Steam
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.arc(rp.x, rp.y - 6, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Coca-Cola & Monster Energy Cans
      const canP = isoToScreen(gx + 1.55, gy + 0.35, 0.88, ox, oy);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(canP.x - 2, canP.y - 5, 4, 6);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(canP.x + 3, canP.y - 5, 4, 6);
    }

    // --- 18. Freljordian Horned Guardian Statue (Ancient Warrior with Suspension Chains) ---
    drawAbyssGuardianStatue(ctx, gx, gy, ox, oy, isNorthSide = true) {
      // 1. Heavy Stone Cantilever Pier extending over the chasm
      this.drawBox(ctx, gx, gy, 0, 1.30, 1.30, 0.45, '#1e293b', '#0f172a', '#090d16', ox, oy);

      // 2. Heavy Seated Stone Warrior Torso & Shoulders
      this.drawBox(ctx, gx + 0.15, gy + 0.15, 0.45, 1.00, 1.00, 0.95, '#334155', '#1e293b', '#0f172a', ox, oy);

      // 3. Helm & Horns (Center at z: 1.40)
      const hP = isoToScreen(gx + 0.65, gy + 0.65, 1.45, ox, oy);

      // Carved Stern Stone Helmet
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(hP.x, hP.y, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Glowing Cold Cyan Slit Eyes
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6;
      ctx.fillRect(hP.x - 6, hP.y - 1, 3.5, 2);
      ctx.fillRect(hP.x + 2.5, hP.y - 1, 3.5, 2);
      ctx.shadowBlur = 0;

      // Massive Curved Ram Horns
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      // Left Ram Horn
      ctx.arc(hP.x - 9, hP.y - 7, 9, Math.PI * 0.9, Math.PI * 1.9, false);
      // Right Ram Horn
      ctx.arc(hP.x + 9, hP.y - 7, 9, Math.PI * 1.1, Math.PI * 0.1, true);
      ctx.stroke();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Heavy Iron Suspension Chain Ring & Chains Plunging into the Abyss
      const ringP = isoToScreen(gx + 0.65, gy + 0.65, 0.40, ox, oy);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.arc(ringP.x, ringP.y, 7, 0, Math.PI * 2);
      ctx.stroke();

      // Iron Links plunging downward into the dark chasm
      const chainOffsetY = isNorthSide ? -18 : 28;
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(ringP.x, ringP.y);
      ctx.bezierCurveTo(ringP.x, ringP.y + chainOffsetY * 0.5, ringP.x + 8, ringP.y + chainOffsetY * 0.8, ringP.x + 12, ringP.y + chainOffsetY * 1.6);
      ctx.stroke();
    }

    // --- 19. Parapet Fire Brazier (Warm Orange Glow on Frost Stone) ---
    drawAbyssBrazier(ctx, gx, gy, ox, oy) {
      // Carved Stone Pedestal
      this.drawBox(ctx, gx, gy, 0, 0.65, 0.65, 0.65, '#334155', '#1e293b', '#0f172a', ox, oy);

      // Wrought-iron Tripod Bowl at z: 0.65
      const bP = isoToScreen(gx + 0.32, gy + 0.32, 0.68, ox, oy);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(bP.x, bP.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Warm Amber Glow onto Surrounding Frost Stone
      const pulse = 0.85 + Math.sin(performance.now() * 0.007) * 0.15;
      const glow = ctx.createRadialGradient(bP.x, bP.y, 2, bP.x, bP.y, 28 * pulse);
      glow.addColorStop(0, 'rgba(251, 146, 60, 0.65)');
      glow.addColorStop(0.45, 'rgba(249, 115, 22, 0.28)');
      glow.addColorStop(1, 'rgba(234, 88, 12, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(bP.x, bP.y, 28 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Animated Leaping Fire Flame
      const fH = 9 + Math.sin(performance.now() * 0.015) * 3;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(bP.x - 4, bP.y);
      ctx.quadraticCurveTo(bP.x - 3, bP.y - fH * 0.6, bP.x, bP.y - fH);
      ctx.quadraticCurveTo(bP.x + 3, bP.y - fH * 0.6, bP.x + 4, bP.y);
      ctx.closePath();
      ctx.fill();

      // White Hot Flame Core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bP.x, bP.y - 2, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- 20. Stone Balustrade / Railing Wall Segment with Frost Cap ---
    drawAbyssParapetSegment(ctx, gx, gy, lenX, lenY, ox, oy) {
      // Stone Parapet Base
      this.drawBox(ctx, gx, gy, 0, lenX, lenY, 0.50, '#334155', '#1e293b', '#0f172a', ox, oy);
      // Frosted Blue Stone Cap
      this.drawBox(ctx, gx - 0.04, gy - 0.04, 0.50, lenX + 0.08, lenY + 0.08, 0.10, '#93c5fd', '#60a5fa', '#3b82f6', ox, oy);
    }

    // --- 21. Broken Railing Gap with Dangling Heavy Chains ---
    drawAbyssBrokenRailing(ctx, gx, gy, ox, oy, isNorthSide = true) {
      // Jagged Fractured Stone Pedestals on either side of gap
      this.drawBox(ctx, gx, gy, 0, 0.40, 0.40, 0.42, '#334155', '#1e293b', '#0f172a', ox, oy);
      this.drawBox(ctx, gx + 1.20, gy, 0, 0.40, 0.40, 0.38, '#334155', '#1e293b', '#0f172a', ox, oy);

      // Wooden Repair Plank across the gap
      this.drawBox(ctx, gx + 0.30, gy + 0.05, 0.35, 1.00, 0.30, 0.08, '#b45309', '#92400e', '#78350f', ox, oy);

      // Heavy Dangling Chains falling into the Abyss
      const cP1 = isoToScreen(gx + 0.45, gy + 0.20, 0.30, ox, oy);
      const cP2 = isoToScreen(gx + 1.15, gy + 0.20, 0.30, ox, oy);
      const dy = isNorthSide ? -24 : 32;

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(cP1.x, cP1.y);
      ctx.quadraticCurveTo(cP1.x - 4, cP1.y + dy * 0.6, cP1.x - 2, cP1.y + dy);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cP2.x, cP2.y);
      ctx.quadraticCurveTo(cP2.x + 6, cP2.y + dy * 0.7, cP2.x + 4, cP2.y + dy);
      ctx.stroke();
    }

    // --- 22. Ancient Bridge Entrance Rune Obelisk (West Gateway) ---
    drawAbyssEntranceGateway(ctx, gx, gy, ox, oy) {
      // Stepped Foundation
      this.drawBox(ctx, gx, gy, 0, 0.80, 0.80, 0.40, '#1e293b', '#0f172a', '#020617', ox, oy);
      // Tall Carved Obelisk
      this.drawBox(ctx, gx + 0.10, gy + 0.10, 0.40, 0.60, 0.60, 1.80, '#334155', '#1e293b', '#0f172a', ox, oy);

      // Glowing Cyan Nordic Runes
      const rP = isoToScreen(gx + 0.40, gy + 0.40, 1.30, ox, oy);
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(rP.x, rP.y - 10);
      ctx.lineTo(rP.x, rP.y + 10);
      ctx.moveTo(rP.x - 5, rP.y - 4);
      ctx.lineTo(rP.x + 5, rP.y + 4);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Icy Frost Spire on Top
      const topP = isoToScreen(gx + 0.40, gy + 0.40, 2.25, ox, oy);
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.moveTo(topP.x - 6, topP.y);
      ctx.lineTo(topP.x, topP.y - 14);
      ctx.lineTo(topP.x + 6, topP.y);
      ctx.closePath();
      ctx.fill();
    }

    // --- 23. Ancient Howling Abyss Turret (Freljord Rune Obelisk) ---
    drawAbyssTurret(ctx, gx, gy, ox, oy) {
      // Ground Runic Targeting Circle Ring
      const groundP = isoToScreen(gx + 0.80, gy + 0.80, 0.02, ox, oy);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(groundP.x, groundP.y, 48, 24, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Tier 1 Octagonal Base (Frost-carved stone)
      this.drawBox(ctx, gx, gy, 0, 1.60, 1.60, 0.70, '#334155', '#1e293b', '#0f172a', ox, oy);

      // Tier 2 Tapered Turret Column with Carved Ancient Runes
      this.drawBox(ctx, gx + 0.20, gy + 0.20, 0.70, 1.20, 1.20, 1.30, '#475569', '#334155', '#1e293b', ox, oy);

      // Glowing Cyan Rune Bands on Turret
      const rP = isoToScreen(gx + 0.80, gy + 0.80, 1.40, ox, oy);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.0;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(rP.x, rP.y, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Tier 3 Floating Hextech Core Crystal (Hovering at z: 2.35)
      const coreP = isoToScreen(gx + 0.80, gy + 0.80, 2.45, ox, oy);

      // Cyan Aura Glow
      const glow = ctx.createRadialGradient(coreP.x, coreP.y, 2, coreP.x, coreP.y, 30);
      glow.addColorStop(0, 'rgba(56, 189, 248, 0.90)');
      glow.addColorStop(0.5, 'rgba(14, 165, 233, 0.40)');
      glow.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(coreP.x, coreP.y, 30, 0, Math.PI * 2);
      ctx.fill();

      // Sharp Diamond Core Gemstone
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.moveTo(coreP.x, coreP.y - 14);
      ctx.lineTo(coreP.x + 9, coreP.y);
      ctx.lineTo(coreP.x, coreP.y + 14);
      ctx.lineTo(coreP.x - 9, coreP.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Turret Top Horn Spikes
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(coreP.x - 14, coreP.y + 6);
      ctx.lineTo(coreP.x - 18, coreP.y - 8);
      ctx.lineTo(coreP.x - 10, coreP.y + 2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(coreP.x + 14, coreP.y + 6);
      ctx.lineTo(coreP.x + 18, coreP.y - 8);
      ctx.lineTo(coreP.x + 10, coreP.y + 2);
      ctx.closePath();
      ctx.fill();
    }

    // --- 24. Freljordian Inhibitor (Ancient Arcane Crystal Core) ---
    drawAbyssInhibitor(ctx, gx, gy, ox, oy) {
      // Tier 1 Hexagonal Stone Dais
      this.drawBox(ctx, gx, gy, 0, 1.40, 1.40, 0.50, '#1e293b', '#0f172a', '#020617', ox, oy);
      // Gold Hextech Runic Ring
      this.drawBox(ctx, gx + 0.15, gy + 0.15, 0.50, 1.10, 1.10, 0.15, '#eab308', '#ca8a04', '#a16207', ox, oy);

      // Hovering Arcane Crystal Core
      const floatZ = 1.10 + Math.sin(performance.now() * 0.003) * 0.08;
      const cP = isoToScreen(gx + 0.70, gy + 0.70, floatZ, ox, oy);

      // 3 Orbiting Floating Rune Stones (Split into Back/Front Depth Passes)
      const angle = performance.now() * 0.002;
      const stones = [];
      for (let i = 0; i < 3; i++) {
        const a = angle + (i * Math.PI * 2) / 3;
        const oxS = Math.cos(a) * 16;
        const oyS = Math.sin(a) * 8;
        stones.push({
          x: cP.x + oxS,
          y: cP.y + oyS,
          isBack: oyS < 0
        });
      }

      const drawStone = (s) => {
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.0;
        ctx.stroke();
      };

      // 1. Draw BACK stones (behind the crystal in 3D orbit)
      stones.filter(s => s.isBack).forEach(drawStone);

      // 2. Cyan Aura
      const glow = ctx.createRadialGradient(cP.x, cP.y, 2, cP.x, cP.y, 24);
      glow.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
      glow.addColorStop(0.5, 'rgba(14, 165, 233, 0.30)');
      glow.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cP.x, cP.y, 24, 0, Math.PI * 2);
      ctx.fill();

      // 3. Octagonal Floating Inhibitor Crystal (occludes back stones)
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(cP.x, cP.y - 12);
      ctx.lineTo(cP.x + 8, cP.y - 4);
      ctx.lineTo(cP.x + 8, cP.y + 6);
      ctx.lineTo(cP.x, cP.y + 14);
      ctx.lineTo(cP.x - 8, cP.y + 6);
      ctx.lineTo(cP.x - 8, cP.y - 4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 4. Draw FRONT stones (in front of the crystal in 3D orbit)
      stones.filter(s => !s.isBack).forEach(drawStone);
    }

    // --- 25. Floating Emerald Health Relic (ARAM Health Pack) ---
    drawHealthRelic(ctx, gx, gy, ox, oy) {
      // Ground Rune Circle on Snow
      const baseP = isoToScreen(gx + 0.50, gy + 0.50, 0.02, ox, oy);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(baseP.x, baseP.y, 18, 10, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Floating Emerald Health Cross
      const floatZ = 0.65 + Math.sin(performance.now() * 0.003) * 0.08;
      const crossP = isoToScreen(gx + 0.50, gy + 0.50, floatZ, ox, oy);

      // Green Aura Glow
      const glow = ctx.createRadialGradient(crossP.x, crossP.y, 2, crossP.x, crossP.y, 18);
      glow.addColorStop(0, 'rgba(52, 211, 153, 0.85)');
      glow.addColorStop(0.6, 'rgba(16, 185, 129, 0.25)');
      glow.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(crossP.x, crossP.y, 18, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Green Cross
      ctx.fillStyle = '#6ee7b7';
      ctx.fillRect(crossP.x - 2.5, crossP.y - 8, 5, 16);
      ctx.fillRect(crossP.x - 8, crossP.y - 2.5, 16, 5);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(crossP.x - 2.5, crossP.y - 8, 5, 16);
      ctx.strokeRect(crossP.x - 8, crossP.y - 2.5, 16, 5);
    }

    // --- 26. Multi-Mood Snow Poros (Snack / Tongue / Sleep / Hop) ---
    drawPoro(ctx, gx, gy, ox, oy, mood = 'tongue') {
      const p = isoToScreen(gx + 0.35, gy + 0.35, 0.20, ox, oy);

      if (mood === 'sleep') {
        // Curled up sleeping snowball
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(p.x, p.y + 2, 8.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.0;
        ctx.stroke();

        // Horns resting flat
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(p.x - 5, p.y - 3, 3, Math.PI, Math.PI * 1.8);
        ctx.arc(p.x + 5, p.y - 3, 3, Math.PI * 1.2, Math.PI * 2);
        ctx.stroke();

        // Sleeping slit eyes (^_^)
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(p.x - 3, p.y + 1, 2, Math.PI, 0);
        ctx.arc(p.x + 3, p.y + 1, 2, Math.PI, 0);
        ctx.stroke();

        // 'zZ' drift
        const zP = isoToScreen(gx + 0.35, gy + 0.35, 0.65 + Math.sin(performance.now() * 0.002) * 0.05, ox, oy);
        ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('zZ', zP.x + 6, zP.y - 4);
        return;
      }

      // Fluffy White Body (Round sphere)
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 9.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Curved Brown Ram Horns
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(p.x - 6, p.y - 7, 4, Math.PI, Math.PI * 1.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(p.x + 6, p.y - 7, 4, Math.PI * 1.2, Math.PI * 2);
      ctx.stroke();

      // Big Cute Black Eyes
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(p.x - 3.5, p.y - 1.5, 1.8, 0, Math.PI * 2);
      ctx.arc(p.x + 3.5, p.y - 1.5, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x - 3.8, p.y - 2.0, 0.7, 0, Math.PI * 2);
      ctx.arc(p.x + 3.2, p.y - 2.0, 0.7, 0, Math.PI * 2);
      ctx.fill();

      if (mood === 'snack') {
        // Holding a delicious Poro-Snax cookie
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(p.x, p.y + 4, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      } else {
        // Iconic Long Pink Tongue Hanging Out!
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y + 4.5, 3.2, 5.0, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Little Paws
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(p.x - 5, p.y + 7.5, 2.2, 0, Math.PI * 2);
      ctx.arc(p.x + 5, p.y + 7.5, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- 27. Freljord Frost Crystal Brush (ARAM Mid-Lane Tall Grass) ---
    drawAbyssBrush(ctx, gx, gy, ox, oy) {
      const bP = isoToScreen(gx + 0.50, gy + 0.50, 0, ox, oy);
      // Ice blades
      const blades = [
        { dx: -10, dy: -6, h: 18, color: '#38bdf8' },
        { dx: -4,  dy: -8, h: 24, color: '#e0f2fe' },
        { dx: 2,   dy: -7, h: 22, color: '#7dd3fc' },
        { dx: 8,   dy: -5, h: 16, color: '#0ea5e9' }
      ];
      blades.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.moveTo(bP.x + b.dx - 2, bP.y + b.dy);
        ctx.lineTo(bP.x + b.dx, bP.y + b.dy - b.h);
        ctx.lineTo(bP.x + b.dx + 2, bP.y + b.dy);
        ctx.closePath();
        ctx.fill();
      });
    }

    // --- 28. Floating Broken Abyss Chasm Crag & Suspended Chains ---
    drawAbyssChasmPillar(ctx, gx, gy, ox, oy) {
      // Floating Jagged Stone Pillar in the Mist
      this.drawBox(ctx, gx, gy, -0.40, 1.10, 1.10, 1.20, '#1e293b', '#0f172a', '#020617', ox, oy);

      // Cyan Rune Inscription
      const rP = isoToScreen(gx + 0.55, gy + 0.55, 0.40, ox, oy);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(rP.x - 5, rP.y - 8, 10, 16);

      // Heavy Iron Anchor Chain spanning towards bridge
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(rP.x, rP.y);
      ctx.lineTo(rP.x - 25, rP.y + 18);
      ctx.stroke();
    }

    // --- 29. Epic Floating Howling Abyss Nexus Core Crystal ---
    drawAbyssNexus(ctx, gx, gy, ox, oy) {
      // Heavy Octagonal Stone & Hextech Plinth
      this.drawBox(ctx, gx, gy, 0, 2.20, 2.20, 0.65, '#1e293b', '#0f172a', '#020617', ox, oy);
      // Gold Hextech Inlay Ring
      this.drawBox(ctx, gx + 0.20, gy + 0.20, 0.65, 1.80, 1.80, 0.20, '#eab308', '#ca8a04', '#a16207', ox, oy);

      // Center Hovering Giant Nexus Crystal
      const floatZ = 1.70 + Math.sin(performance.now() * 0.002) * 0.14;
      const nexP = isoToScreen(gx + 1.10, gy + 1.10, floatZ, ox, oy);

      // Prepare 3 Rotating Golden Orbital Wing Blades (Split into Back/Front Depth Passes)
      const angle = (performance.now() * 0.0015);
      const blades = [];
      for (let i = 0; i < 3; i++) {
        const a = angle + (i * Math.PI * 2) / 3;
        const oxBlade = Math.cos(a) * 32;
        const oyBlade = Math.sin(a) * 16;
        blades.push({
          x: nexP.x + oxBlade,
          y: nexP.y + oyBlade,
          angle: a,
          isBack: oyBlade < 0
        });
      }

      const drawBlade = (b) => {
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, 7, 14, b.angle, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Inner Hextech Rune Gleam
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, 3, 7, b.angle, 0, Math.PI * 2);
        ctx.fill();
      };

      // 1. Draw BACK orbital blades (behind the crystal in 3D orbit)
      blades.filter(b => b.isBack).forEach(drawBlade);

      // 2. Huge Nexus Pulsing Blue Aura
      const aura = ctx.createRadialGradient(nexP.x, nexP.y, 4, nexP.x, nexP.y, 46);
      aura.addColorStop(0, 'rgba(56, 189, 248, 0.95)');
      aura.addColorStop(0.4, 'rgba(14, 165, 233, 0.45)');
      aura.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(nexP.x, nexP.y, 46, 0, Math.PI * 2);
      ctx.fill();

      // 3. Grand Multi-faceted Crystal Core (Naturally occludes back blades)
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(nexP.x, nexP.y - 26);
      ctx.lineTo(nexP.x + 18, nexP.y - 6);
      ctx.lineTo(nexP.x + 13, nexP.y + 22);
      ctx.lineTo(nexP.x, nexP.y + 30);
      ctx.lineTo(nexP.x - 13, nexP.y + 22);
      ctx.lineTo(nexP.x - 18, nexP.y - 6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Crystal Inner Facet Gleam Shading
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.moveTo(nexP.x, nexP.y - 26);
      ctx.lineTo(nexP.x + 18, nexP.y - 6);
      ctx.lineTo(nexP.x, nexP.y + 6);
      ctx.closePath();
      ctx.fill();

      // 4. Draw FRONT orbital blades (in front of the crystal in 3D orbit)
      blades.filter(b => !b.isBack).forEach(drawBlade);
    }
  }

  // Export to Global Scope
  window.LudwigWorldModels = WorldModels;

})(window);
