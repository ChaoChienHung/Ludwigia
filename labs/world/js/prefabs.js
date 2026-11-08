// ============================================================================
// Ludwigia World — Modular Architecture Prefabs
// Gaming Dimension: Centered Cyber Cafe, Grand Symmetric ARAM Bridge & Minecraft Island
// ============================================================================

(function(window) {
  'use strict';

  const GamingDimensionPrefab = {
    id: 'gaming_dimension',

    // --- 1. Collision & Navigation Grid Setup ---
    initNav(nav) {
      if (!nav) return;

      // ======================================================================
      // A. CYBER CAFE (x: 9..19, y: 49..57, centered at x: 14)
      // Directly aligned with Central Boulevard (x: 12..15)
      // ======================================================================
      // North Wall (y = 48.8): Left (x: 9..13) and Right (x: 15..19.2)
      // Solid collision block on row 48, leaving doorway at x: 13.0..15.0 wide open for direct North entrance!
      nav.setBlock(9.0, 48.4, 4.0, 0.80, true);
      nav.setBlock(15.0, 48.4, 4.2, 0.80, true);

      // West Wall: Floor-to-ceiling panoramic glass curtain wall (x = 8.8, y: 48.8..57.2)
      nav.setBlock(8.6, 48.5, 0.50, 8.5, true);

      // East Wall: Floor-to-ceiling panoramic glass curtain wall (x = 19.0, y: 48.8..57.2)
      nav.setBlock(19.0, 48.5, 0.50, 8.5, true);

      // South Wall (y = 57.0): Left (x: 9..13) and Right (x: 15..19.2)
      // Leaves south portal doorway at x: 13.0..15.0 wide open directly onto bridge deck!
      nav.setBlock(9.0, 56.6, 4.0, 0.80, true);
      nav.setBlock(15.0, 56.6, 4.2, 0.80, true);

      // Cyber Cafe Internal Rigs (flanking the central x: 13..15 aisle)
      nav.setBlock(10.2, 51.2, 1.8, 0.8, true);   // Blue Rig Row 1
      nav.setBlock(10.2, 54.2, 1.8, 0.8, true);   // Blue Rig Row 2
      nav.setBlock(16.0, 51.2, 1.8, 0.8, true);   // Red Rig Row 1
      nav.setBlock(16.0, 54.2, 1.8, 0.8, true);   // Red Rig Row 2
      nav.setBlock(17.2, 52.5, 1.6, 1.0, true);   // Snack & Monster Bar

      // ======================================================================
      // B. MAIN ISLAND SOUTH CLIFF WOODEN PERIMETER FENCE (y = 57.0)
      // Blocks anyone from walking off the south cliff into the abyss
      // Only passage across to the other side is through the Bridge!
      // ======================================================================
      nav.setBlock(0.0, 56.6, 9.0, 0.80, true);   // West Cliff Fence (x: 0..9)
      nav.setBlock(19.0, 56.6, 35.0, 0.80, true); // East Cliff Fence (x: 19..54 completely sealed!)

      // ======================================================================
      // C. THE HOWLING ABYSS BOTTOMLESS VOID CHASM & BRIDGE BALUSTRADES
      // 36 tiles long North-South grand bridge (x: 11..17, y: 57..93)
      // Flanking empty void chasm is 100% blocked from walking/pathfinding!
      // ======================================================================
      // 1. Flanking Void Chasm & Parapet Railings (Zero gaps, strictly prevents walking into abyss!)
      nav.setBlock(0.0, 57.0, 11.35, 36.5, true);   // West Flanking Abyss Void + Balustrade (x: 0..11.35, y: 57..93.5)
      nav.setBlock(16.75, 57.0, 37.25, 36.5, true); // East Flanking Abyss Void + Balustrade (x: 16.75..54, y: 57..93.5)

      // 2. Minecraft Island North Cliff Edge & Fence (blocks y: 93..94.8 outside x: 12.5..15.5)
      nav.setBlock(0.0, 93.0, 12.35, 1.8, true);    // West Northern Fence & Cliff
      nav.setBlock(15.75, 93.0, 38.25, 1.8, true);  // East Northern Fence & Cliff

      // 3. Minecraft Island Outer Flanking Void (x < 7 or x > 21 for y >= 94.5)
      nav.setBlock(0.0, 94.5, 7.0, 17.0, true);     // West Minecraft Flanking Void (x: 0..7, y: 94.5..111.5)
      nav.setBlock(21.0, 94.5, 33.0, 17.0, true);   // East Minecraft Flanking Void (x: 21..54, y: 94.5..111.5)
      nav.setBlock(0.0, 111.0, 54.0, 2.0, true);    // South Minecraft Void Boundary (y >= 111)

      // 4. Symmetrical Bridge Artifacts along Centerline x: 14.0
      // Inner & Outer Turret distance enlarged to 4.5 tiles, keeping health relics on the sides!
      nav.setBlock(12.9, 60.2, 2.2, 2.0, true);   // Blue Nexus (leaves y: 57..60.2 clear in front of door!)
      nav.setBlock(13.3, 63.8, 1.4, 1.4, true);   // Blue Inhibitor
      nav.setBlock(13.2, 67.0, 1.6, 1.4, true);   // Blue Inner Turret
      nav.setBlock(13.2, 71.5, 1.6, 1.4, true);   // Blue Outer Turret (distance between turrets = 4.5 tiles!)

      nav.setBlock(13.2, 78.5, 1.6, 1.4, true);   // Red Outer Turret
      nav.setBlock(13.2, 83.0, 1.6, 1.4, true);   // Red Inner Turret (distance between turrets = 4.5 tiles!)
      nav.setBlock(13.3, 86.2, 1.4, 1.4, true);   // Red Inhibitor
      nav.setBlock(12.9, 89.0, 2.2, 2.0, true);   // Red Nexus (leaves clear approach to Minecraft gate)

      // ======================================================================
      // D. MINECRAFT ISLAND (x: 7..21, y: 93..111)
      // ======================================================================
      // Oak Wood Cabin (x: 9..15, y: 97..103, doorway at x: 13..15, y: 97)
      nav.setBlock(9.0, 97.0, 4.0, 0.40, true);   // North Wall Left (x: 9..13)
      nav.setBlock(15.0, 97.0, 0.4, 0.40, true);  // North Wall Right Pillar
      nav.setBlock(8.8, 97.0, 0.40, 6.2, true);   // West Wall
      nav.setBlock(15.0, 97.0, 0.40, 6.2, true);  // East Wall
      nav.setBlock(9.0, 103.0, 6.2, 0.40, true);  // South Wall

      // Cabin Furniture Obstacles
      nav.setBlock(9.5, 99.2, 1.4, 1.8, true);    // Minecraft Red Bed
      nav.setBlock(13.8, 98.2, 0.8, 0.8, true);   // Crafting Table
      nav.setBlock(13.8, 100.2, 0.8, 0.8, true);  // Furnace
      nav.setBlock(9.5, 97.8, 0.8, 0.8, true);    // Chest

      // Farmland Fences (x: 16..20, y: 97..102, gate at x: 16, y: 99)
      nav.setBlock(16.0, 97.0, 0.35, 2.0, true);  // West Fence Top
      nav.setBlock(16.0, 100.0, 0.35, 2.0, true); // West Fence Bottom (leaves 99..100 gate)
      nav.setBlock(20.0, 97.0, 0.35, 5.0, true);  // East Fence
      nav.setBlock(16.0, 97.0, 4.2, 0.35, true);  // North Fence
      nav.setBlock(16.0, 102.0, 4.2, 0.35, true); // South Fence

      // Oak Tree Trunk
      nav.setBlock(7.7, 106.0, 0.8, 0.8, true);
    },

    // --- 2. Register Bed Furniture Spot for Minecraft Red Bed ---
    initFurniture(charManager) {
      if (!charManager || !charManager.furnitureSpots) return;
      if (!charManager.furnitureSpots.some(f => f.id === 'minecraft_bed')) {
        charManager.furnitureSpots.push({
          id: 'minecraft_bed',
          type: 'bed',
          zone: 'minecraft_sanctuary',
          x: 10.2,
          y: 100.2,
          z: 0.32,
          facing: 1,
          name: 'Minecraft 經典大紅床',
          duvetColor: '#dc2626',
          labelZh: '躺上紅床睡覺',
          labelEn: 'Sleep in Minecraft Bed'
        });
      }
    },

    // --- 3. Static Entities Registration ---
    initEntities(list, world) {
      if (!list || !world) return;
      const ctx = world.ctx;
      const models = world.models;
      const H = 2.70;

      // ======================================================================
      // A. CYBER CAFE / GAMING DIMENSION PORTAL ENCLOSURE (x: 9..19, y: 49..57)
      // Directly aligned with Central Boulevard (x: 12..15)
      // Features large glowing colored glass windows & automated sliding glass doors!
      // ======================================================================
      const cyberWallT = '#0f172a';
      const cyberWallL = '#1e293b';
      const cyberWallR = '#090d16';

      // 1. North Facade — Left Panoramic Colored Glass Window Bay (x = 9..12.8, y = 48.8)
      list.push({
        xMin: 8.8, xMax: 12.9, yMin: 48.6, yMax: 49.0,
        draw: () => {
          // Bottom Sill & Top Lintel (Full 3D with North backCol)
          models.drawBox(ctx, 9.0, 48.8, 0, 3.8, 0.25, 0.45, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy, cyberWallL);
          models.drawBox(ctx, 9.0, 48.8, 2.30, 3.8, 0.25, H - 2.30, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy, cyberWallL);

          // Structural Vertical Pillars (Left corner & Door frame left)
          models.drawBox(ctx, 9.0, 48.8, 0.45, 0.35, 0.25, 1.85, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy, cyberWallL);
          models.drawBox(ctx, 12.45, 48.8, 0.45, 0.35, 0.25, 1.85, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy, cyberWallL);
          // Vertical Center Window Mullion
          models.drawBox(ctx, 10.75, 48.8, 0.45, 0.18, 0.25, 1.85, '#38bdf8', '#0284c7', '#0369a1', world.ox, world.oy, '#0284c7');
          // Horizontal Transom Bar
          models.drawBox(ctx, 9.35, 48.8, 1.35, 3.10, 0.25, 0.10, '#0f172a', '#1e293b', '#334155', world.ox, world.oy, '#1e293b');

          // Large Vibrant Cyan-Teal Tinted Glass Window Pane (Facing North directly to visitors!)
          const p0 = isoToScreen(9.35, 48.78, 0.45, world.ox, world.oy);
          const p1 = isoToScreen(12.45, 48.78, 0.45, world.ox, world.oy);
          const p2 = isoToScreen(12.45, 48.78, 2.30, world.ox, world.oy);
          const p3 = isoToScreen(9.35, 48.78, 2.30, world.ox, world.oy);

          ctx.save();
          const gGrad = ctx.createLinearGradient(p0.x, p0.y, p2.x, p2.y);
          gGrad.addColorStop(0, 'rgba(6, 182, 212, 0.72)');
          gGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.58)');
          gGrad.addColorStop(1, 'rgba(56, 189, 248, 0.70)');
          ctx.fillStyle = gGrad;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fill();

          // Crisp Silver Window Edge
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.lineWidth = 1.4;
          ctx.stroke();

          // Electric Cyan Neon Glow Line along the window sill
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.0;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
          ctx.restore();
        }
      });

      // 1.1 North Facade — Right Panoramic Colored Glass Window Bay (x = 15.2..19.0, y = 48.8)
      list.push({
        xMin: 15.1, xMax: 19.2, yMin: 48.6, yMax: 49.0,
        draw: () => {
          // Bottom Sill & Top Lintel (Full 3D with North backCol)
          models.drawBox(ctx, 15.2, 48.8, 0, 3.8, 0.25, 0.45, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy, cyberWallL);
          models.drawBox(ctx, 15.2, 48.8, 2.30, 3.8, 0.25, H - 2.30, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy, cyberWallL);

          // Structural Vertical Pillars (Door frame right & Right corner)
          models.drawBox(ctx, 15.2, 48.8, 0.45, 0.35, 0.25, 1.85, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy, cyberWallL);
          models.drawBox(ctx, 18.65, 48.8, 0.45, 0.35, 0.25, 1.85, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy, cyberWallL);
          // Vertical Center Window Mullion
          models.drawBox(ctx, 16.95, 48.8, 0.45, 0.18, 0.25, 1.85, '#a855f7', '#8b5cf6', '#7c3aed', world.ox, world.oy, '#8b5cf6');
          // Horizontal Transom Bar
          models.drawBox(ctx, 15.55, 48.8, 1.35, 3.10, 0.25, 0.10, '#0f172a', '#1e293b', '#334155', world.ox, world.oy, '#1e293b');

          // Large Vibrant Electric Sky-Blue/Violet Tinted Glass Window Pane
          const p0 = isoToScreen(15.55, 48.78, 0.45, world.ox, world.oy);
          const p1 = isoToScreen(18.65, 48.78, 0.45, world.ox, world.oy);
          const p2 = isoToScreen(18.65, 48.78, 2.30, world.ox, world.oy);
          const p3 = isoToScreen(15.55, 48.78, 2.30, world.ox, world.oy);

          ctx.save();
          const gGrad = ctx.createLinearGradient(p0.x, p0.y, p2.x, p2.y);
          gGrad.addColorStop(0, 'rgba(56, 189, 248, 0.72)');
          gGrad.addColorStop(0.5, 'rgba(129, 140, 248, 0.60)');
          gGrad.addColorStop(1, 'rgba(168, 85, 247, 0.68)');
          ctx.fillStyle = gGrad;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fill();

          // Crisp Silver Window Edge
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.lineWidth = 1.4;
          ctx.stroke();

          // Electric Violet Neon Glow Line along the window sill
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2.0;
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
          ctx.restore();
        }
      });

      // Overhead North Door Lintel & Neon Marquee Sign
      list.push({
        xMin: 12.8, xMax: 15.2, yMin: 48.6, yMax: 49.0,
        draw: () => {
          models.drawBox(ctx, 12.8, 48.8, 2.25, 2.4, 0.25, H - 2.25, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy, cyberWallL);
          models.drawCyberCafeSign(ctx, 12.6, 48.7, world.ox, world.oy);
        }
      });

      // Automatic Dual-Leaf Sliding Glass Door at North Entrance (x: 13..15, y: 48.8)
      // Features prominent glowing cyan sliding glass panels clearly visible whether open or closed!
      list.push({
        xMin: 12.0, xMax: 16.0, yMin: 48.55, yMax: 49.05,
        draw: () => {
          const openT = world.doorCyberNorthOpen || 0.0;
          const slideDist = 0.88 * openT;

          // 1. Sleek Titanium Door Top Header & Overhead Slide Rail (z: 2.15..2.27)
          models.drawBox(ctx, 12.75, 48.74, 2.15, 2.50, 0.22, 0.12, '#0f172a', '#1e293b', '#334155', world.ox, world.oy, '#334155');

          // 2. Motion Sensor Unit (Centered above door at x: 14.0, z: 2.22)
          const sensP = isoToScreen(14.0, 48.72, 2.22, world.ox, world.oy);
          ctx.save();
          ctx.fillStyle = '#090d16';
          ctx.fillRect(sensP.x - 7, sensP.y - 3, 14, 6);
          // Sensor LED Status Indicator: Red/Orange when closed, Electric Cyan when active/open!
          ctx.fillStyle = openT > 0.08 ? '#38bdf8' : '#f97316';
          ctx.shadowColor = openT > 0.08 ? '#38bdf8' : '#f97316';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(sensP.x, sensP.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // 3. Recessed Ground Door Guide Track
          models.drawBox(ctx, 12.75, 48.76, 0, 2.50, 0.16, 0.03, '#334155', '#1e293b', '#0f172a', world.ox, world.oy, '#334155');

          // 4. Left Sliding Glass Leaf (Width 0.96, Slides Left)
          const leftDoorX = 13.0 - slideDist;
          models.drawBox(ctx, leftDoorX, 48.78, 0.03, 0.96, 0.12, 2.12,
            'rgba(56, 189, 248, 0.85)', 'rgba(2, 132, 199, 0.75)', 'rgba(3, 105, 161, 0.75)',
            world.ox, world.oy, 'rgba(14, 165, 233, 0.80)'
          );
          // Left North Glass Panel Face with Frosted Privacy Bands
          const lp0 = isoToScreen(leftDoorX + 0.04, 48.76, 0.05, world.ox, world.oy);
          const lp1 = isoToScreen(leftDoorX + 0.92, 48.76, 0.05, world.ox, world.oy);
          const lp2 = isoToScreen(leftDoorX + 0.92, 48.76, 2.10, world.ox, world.oy);
          const lp3 = isoToScreen(leftDoorX + 0.04, 48.76, 2.10, world.ox, world.oy);
          ctx.save();
          ctx.fillStyle = 'rgba(14, 165, 233, 0.58)';
          ctx.beginPath();
          ctx.moveTo(lp0.x, lp0.y); ctx.lineTo(lp1.x, lp1.y); ctx.lineTo(lp2.x, lp2.y); ctx.lineTo(lp3.x, lp3.y);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.90)';
          ctx.lineWidth = 1.3;
          ctx.stroke();

          // Frosted center horizontal stripe
          const lb0 = isoToScreen(leftDoorX + 0.08, 48.75, 0.88, world.ox, world.oy);
          const lb1 = isoToScreen(leftDoorX + 0.88, 48.75, 0.88, world.ox, world.oy);
          const lb2 = isoToScreen(leftDoorX + 0.88, 48.75, 1.18, world.ox, world.oy);
          const lb3 = isoToScreen(leftDoorX + 0.08, 48.75, 1.18, world.ox, world.oy);
          ctx.fillStyle = 'rgba(240, 249, 255, 0.85)';
          ctx.beginPath();
          ctx.moveTo(lb0.x, lb0.y); ctx.lineTo(lb1.x, lb1.y); ctx.lineTo(lb2.x, lb2.y); ctx.lineTo(lb3.x, lb3.y);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          // Left Handle (Vertical brushed silver handle)
          models.drawBox(ctx, leftDoorX + 0.82, 48.74, 0.70, 0.06, 0.16, 0.65, '#f8fafc', '#cbd5e1', '#94a3b8', world.ox, world.oy, '#cbd5e1');

          // 5. Right Sliding Glass Leaf (Width 0.96, Slides Right)
          const rightDoorX = 14.04 + slideDist;
          models.drawBox(ctx, rightDoorX, 48.78, 0.03, 0.96, 0.12, 2.12,
            'rgba(56, 189, 248, 0.85)', 'rgba(2, 132, 199, 0.75)', 'rgba(3, 105, 161, 0.75)',
            world.ox, world.oy, 'rgba(14, 165, 233, 0.80)'
          );
          // Right North Glass Panel Face with Frosted Privacy Bands
          const rp0 = isoToScreen(rightDoorX + 0.04, 48.76, 0.05, world.ox, world.oy);
          const rp1 = isoToScreen(rightDoorX + 0.92, 48.76, 0.05, world.ox, world.oy);
          const rp2 = isoToScreen(rightDoorX + 0.92, 48.76, 2.10, world.ox, world.oy);
          const rp3 = isoToScreen(rightDoorX + 0.04, 48.76, 2.10, world.ox, world.oy);
          ctx.save();
          ctx.fillStyle = 'rgba(14, 165, 233, 0.58)';
          ctx.beginPath();
          ctx.moveTo(rp0.x, rp0.y); ctx.lineTo(rp1.x, rp1.y); ctx.lineTo(rp2.x, rp2.y); ctx.lineTo(rp3.x, rp3.y);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.90)';
          ctx.lineWidth = 1.3;
          ctx.stroke();

          // Frosted center horizontal stripe
          const rb0 = isoToScreen(rightDoorX + 0.08, 48.75, 0.88, world.ox, world.oy);
          const rb1 = isoToScreen(rightDoorX + 0.88, 48.75, 0.88, world.ox, world.oy);
          const rb2 = isoToScreen(rightDoorX + 0.88, 48.75, 1.18, world.ox, world.oy);
          const rb3 = isoToScreen(rightDoorX + 0.08, 48.75, 1.18, world.ox, world.oy);
          ctx.fillStyle = 'rgba(240, 249, 255, 0.85)';
          ctx.beginPath();
          ctx.moveTo(rb0.x, rb0.y); ctx.lineTo(rb1.x, rb1.y); ctx.lineTo(rb2.x, rb2.y); ctx.lineTo(rb3.x, rb3.y);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          // Right Handle (Vertical brushed silver handle)
          models.drawBox(ctx, rightDoorX + 0.08, 48.74, 0.70, 0.06, 0.16, 0.65, '#f8fafc', '#cbd5e1', '#94a3b8', world.ox, world.oy, '#cbd5e1');
        }
      });

      // 2. West Panoramic Colored Glass Windows (x = 8.8, y: 48.8..57.2)
      list.push({
        xMin: 8.7, xMax: 9.1, yMin: 48.8, yMax: 57.2,
        draw: () => {
          models.drawBox(ctx, 8.8, 48.8, 0, 0.25, 8.2, 0.35, '#1e293b', '#0f172a', '#020617', world.ox, world.oy);
          models.drawBox(ctx, 8.8, 48.8, H - 0.25, 0.25, 8.2, 0.25, '#1e293b', '#0f172a', '#020617', world.ox, world.oy);
          for (let y = 48.8; y <= 57.0; y += 2.05) {
            models.drawBox(ctx, 8.8, y, 0.35, 0.25, 0.25, H - 0.60, '#38bdf8', '#0284c7', '#0369a1', world.ox, world.oy);
          }
          models.drawBox(ctx, 8.8, 48.8, 1.25, 0.25, 8.2, 0.12, '#0f172a', '#1e293b', '#334155', world.ox, world.oy);

          const p0 = isoToScreen(8.92, 48.8, 0.35, world.ox, world.oy);
          const p1 = isoToScreen(8.92, 57.0, 0.35, world.ox, world.oy);
          const p2 = isoToScreen(8.92, 57.0, H - 0.25, world.ox, world.oy);
          const p3 = isoToScreen(8.92, 48.8, H - 0.25, world.ox, world.oy);

          ctx.save();
          const glassGrad = ctx.createLinearGradient(p0.x, p0.y, p2.x, p2.y);
          glassGrad.addColorStop(0, 'rgba(6, 182, 212, 0.58)');
          glassGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.48)');
          glassGrad.addColorStop(1, 'rgba(2, 132, 199, 0.62)');
          ctx.fillStyle = glassGrad;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.40)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
          ctx.lineWidth = 1.8;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 6;
          const nm0 = isoToScreen(8.93, 48.8, 1.25, world.ox, world.oy);
          const nm1 = isoToScreen(8.93, 57.0, 1.25, world.ox, world.oy);
          ctx.beginPath();
          ctx.moveTo(nm0.x, nm0.y); ctx.lineTo(nm1.x, nm1.y);
          ctx.stroke();
          ctx.restore();
        }
      });

      // 3. East Panoramic Colored Glass Windows (x = 19.0, y: 48.8..57.2)
      list.push({
        xMin: 18.9, xMax: 19.3, yMin: 48.8, yMax: 57.2,
        draw: () => {
          models.drawBox(ctx, 19.0, 48.8, 0, 0.25, 8.2, 0.35, '#1e293b', '#0f172a', '#020617', world.ox, world.oy);
          models.drawBox(ctx, 19.0, 48.8, H - 0.25, 0.25, 8.2, 0.25, '#1e293b', '#0f172a', '#020617', world.ox, world.oy);
          for (let y = 48.8; y <= 57.0; y += 2.05) {
            models.drawBox(ctx, 19.0, y, 0.35, 0.25, 0.25, H - 0.60, '#38bdf8', '#0284c7', '#0369a1', world.ox, world.oy);
          }
          models.drawBox(ctx, 19.0, 48.8, 1.25, 0.25, 8.2, 0.12, '#0f172a', '#1e293b', '#334155', world.ox, world.oy);

          const p0 = isoToScreen(19.12, 48.8, 0.35, world.ox, world.oy);
          const p1 = isoToScreen(19.12, 57.0, 0.35, world.ox, world.oy);
          const p2 = isoToScreen(19.12, 57.0, H - 0.25, world.ox, world.oy);
          const p3 = isoToScreen(19.12, 48.8, H - 0.25, world.ox, world.oy);

          ctx.save();
          const glassGrad = ctx.createLinearGradient(p0.x, p0.y, p2.x, p2.y);
          glassGrad.addColorStop(0, 'rgba(6, 182, 212, 0.58)');
          glassGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.48)');
          glassGrad.addColorStop(1, 'rgba(2, 132, 199, 0.62)');
          ctx.fillStyle = glassGrad;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.40)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
          ctx.lineWidth = 1.8;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 6;
          const nm0 = isoToScreen(19.13, 48.8, 1.25, world.ox, world.oy);
          const nm1 = isoToScreen(19.13, 57.0, 1.25, world.ox, world.oy);
          ctx.beginPath();
          ctx.moveTo(nm0.x, nm0.y); ctx.lineTo(nm1.x, nm1.y);
          ctx.stroke();
          ctx.restore();
        }
      });

      // 4. South Exterior Wall & Automatic Sliding Glass Doorway (x = 13..15, y = 57.0)
      list.push({
        xMin: 8.8, xMax: 13.0, yMin: 56.8, yMax: 57.2,
        draw: () => models.drawBox(ctx, 9.0, 57.0, 0, 4.0, 0.25, H, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy, cyberWallL)
      });
      list.push({
        xMin: 15.0, xMax: 19.2, yMin: 56.8, yMax: 57.2,
        draw: () => models.drawBox(ctx, 15.0, 57.0, 0, 4.0, 0.25, H, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy, cyberWallL)
      });
      list.push({
        xMin: 12.8, xMax: 15.2, yMin: 56.8, yMax: 57.2,
        draw: () => {
          // Lintle wall beam above doorway
          models.drawBox(ctx, 13.0, 57.0, 2.20, 2.0, 0.25, H - 2.20, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy, cyberWallL);
          // Glowing Neon Portal Sign "DIMENSION PORTAL"
          const sp = isoToScreen(14.0, 57.12, 2.45, world.ox, world.oy);
          ctx.save();
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.fillText('⚡ DIMENSION PORTAL ⚡', sp.x, sp.y);
          ctx.restore();
        }
      });

      // Automatic Dual-Leaf Sliding Glass Door (Opens seamlessly when characters approach!)
      list.push({
        xMin: 12.0, xMax: 16.0, yMin: 56.75, yMax: 57.25,
        draw: () => {
          const openT = world.doorCyberSouthOpen || 0.0;
          const slideDist = 0.88 * openT;

          // 1. Sleek Titanium Door Top Header & Overhead Slide Rail (z: 2.12..2.26)
          models.drawBox(ctx, 12.8, 57.0, 2.12, 2.4, 0.20, 0.14, '#0f172a', '#1e293b', '#334155', world.ox, world.oy);

          // 2. Motion Sensor Unit (Centered above door at x: 14.0, z: 2.20)
          const sensP = isoToScreen(14.0, 57.08, 2.20, world.ox, world.oy);
          ctx.save();
          ctx.fillStyle = '#090d16';
          ctx.fillRect(sensP.x - 7, sensP.y - 3, 14, 6);
          // Sensor LED Status Indicator: Red/Orange when closed, Electric Cyan when approaching/open!
          ctx.fillStyle = openT > 0.08 ? '#38bdf8' : '#f97316';
          ctx.shadowColor = openT > 0.08 ? '#38bdf8' : '#f97316';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(sensP.x, sensP.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // 3. Left Sliding Glass Leaf (Width 0.95, Slides Left)
          const leftDoorX = 13.0 - slideDist;
          // Left Door Frame & Tinted Cyber Glass
          models.drawBox(ctx, leftDoorX, 57.0, 0, 0.95, 0.10, 2.12,
            'rgba(14, 165, 233, 0.55)', 'rgba(2, 132, 199, 0.60)', 'rgba(3, 105, 161, 0.70)',
            world.ox, world.oy
          );
          // Frosted Glass Safety Stripe on Left Leaf
          models.drawBox(ctx, leftDoorX + 0.05, 57.0, 0.90, 0.85, 0.12, 0.22,
            'rgba(240, 249, 255, 0.70)', 'rgba(224, 242, 254, 0.65)', 'rgba(186, 230, 253, 0.60)',
            world.ox, world.oy
          );
          // Left Handle (Vertical metallic bar at leading edge)
          models.drawBox(ctx, leftDoorX + 0.82, 57.0, 0.75, 0.06, 0.14, 0.55,
            '#e2e8f0', '#94a3b8', '#64748b', world.ox, world.oy
          );

          // 4. Right Sliding Glass Leaf (Width 0.95, Slides Right)
          const rightDoorX = 14.05 + slideDist;
          // Right Door Frame & Tinted Cyber Glass
          models.drawBox(ctx, rightDoorX, 57.0, 0, 0.95, 0.10, 2.12,
            'rgba(14, 165, 233, 0.55)', 'rgba(2, 132, 199, 0.60)', 'rgba(3, 105, 161, 0.70)',
            world.ox, world.oy
          );
          // Frosted Glass Safety Stripe on Right Leaf
          models.drawBox(ctx, rightDoorX + 0.05, 57.0, 0.90, 0.85, 0.12, 0.22,
            'rgba(240, 249, 255, 0.70)', 'rgba(224, 242, 254, 0.65)', 'rgba(186, 230, 253, 0.60)',
            world.ox, world.oy
          );
          // Right Handle (Vertical metallic bar at leading edge)
          models.drawBox(ctx, rightDoorX + 0.07, 57.0, 0.75, 0.06, 0.14, 0.55,
            '#e2e8f0', '#94a3b8', '#64748b', world.ox, world.oy
          );
        }
      });

      // 5. Cyber Cafe Internal Stations (flanking the central open walkway)
      // Blue Team Battle Stations (West row x = 10.5)
      list.push({
        xMin: 10.2, xMax: 12.0, yMin: 51.2, yMax: 52.1,
        draw: () => models.drawCyberCafeRig(ctx, 10.5, 51.2, world.ox, world.oy, false)
      });
      list.push({
        xMin: 10.2, xMax: 12.0, yMin: 54.2, yMax: 55.1,
        draw: () => models.drawCyberCafeRig(ctx, 10.5, 54.2, world.ox, world.oy, false)
      });
      // Red Team Battle Stations (East row x = 16.0)
      list.push({
        xMin: 16.0, xMax: 17.8, yMin: 51.2, yMax: 52.1,
        draw: () => models.drawCyberCafeRig(ctx, 16.0, 51.2, world.ox, world.oy, true)
      });
      list.push({
        xMin: 16.0, xMax: 17.8, yMin: 54.2, yMax: 55.1,
        draw: () => models.drawCyberCafeRig(ctx, 16.0, 54.2, world.ox, world.oy, true)
      });
      // Snack & Monster Energy Counter
      list.push({
        xMin: 17.0, xMax: 18.8, yMin: 52.5, yMax: 54.0,
        draw: () => models.drawCyberSnackBar(ctx, 17.0, 52.5, world.ox, world.oy)
      });

      // ======================================================================
      // B. MAIN ISLAND SOUTH CLIFF RUSTIC WOODEN PERIMETER FENCE (y = 57.0)
      // Runs across southern island edge (x: 0..9 and x: 19..32)
      // ======================================================================
      const drawFenceSegment = (xStart, xEnd, yPos) => {
        // Continuous horizontal crossbars
        models.drawBox(ctx, xStart, yPos, 0.30, xEnd - xStart, 0.12, 0.10, '#a16e3b', '#7c4d21', '#5c3714', world.ox, world.oy);
        models.drawBox(ctx, xStart, yPos, 0.60, xEnd - xStart, 0.12, 0.10, '#a16e3b', '#7c4d21', '#5c3714', world.ox, world.oy);
        // Vertical fence posts every 1.5 tiles
        for (let fx = xStart; fx <= xEnd + 0.1; fx += 1.5) {
          models.drawBox(ctx, fx, yPos, 0, 0.22, 0.22, 0.85, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
        }
      };

      // West Southern Cliff Fence (x: 0..9)
      list.push({
        xMin: -0.2, xMax: 9.2, yMin: 56.8, yMax: 57.2,
        draw: () => drawFenceSegment(0.0, 9.0, 57.0)
      });
      // East Southern Cliff Fence (x: 19..32)
      list.push({
        xMin: 18.8, xMax: 32.5, yMin: 56.8, yMax: 57.2,
        draw: () => drawFenceSegment(19.0, 32.0, 57.0)
      });

      // ======================================================================
      // C. HOWLING ABYSS NORTH-SOUTH SUSPENSION BRIDGE (x: 11..17, y: 57..93)
      // Fully Symmetrical ARAM Layout (Blue Nexus -> Blue Turrets -> Mid -> Red Turrets -> Red Nexus)
      // ======================================================================
      // 1. North Bridgehead Gateway Pillars & Braziers (at y = 57.0, framing bridge entrance cleanly without any crossbeam obscuring the Nexus)
      list.push({
        xMin: 10.6, xMax: 17.4, yMin: 56.8, yMax: 57.4,
        draw: () => {
          models.drawBox(ctx, 10.8, 57.0, 0, 0.70, 0.70, 1.50, '#334155', '#1e293b', '#0f172a', world.ox, world.oy);
          models.drawBox(ctx, 16.5, 57.0, 0, 0.70, 0.70, 1.50, '#334155', '#1e293b', '#0f172a', world.ox, world.oy);
          models.drawAbyssBrazier(ctx, 10.9, 56.8, world.ox, world.oy);
          models.drawAbyssBrazier(ctx, 16.6, 56.8, world.ox, world.oy);
        }
      });

      // 2. West Stone Balustrade (segmented by 2-tile chunks for cycle-free isometric depth sorting)
      for (let y = 57; y < 93; y += 2) {
        const segLen = Math.min(2, 93 - y);
        list.push({
          xMin: 10.90, xMax: 11.35,
          yMin: y, yMax: y + segLen,
          draw: () => {
            // Parapet stone base (z: 0..0.48)
            models.drawBox(ctx, 11.0, y, 0, 0.25, segLen, 0.48, '#334155', '#1e293b', '#0f172a', world.ox, world.oy);
            // Frosted stone cap (z: 0.48..0.58)
            models.drawBox(ctx, 10.96, y, 0.48, 0.33, segLen, 0.10, '#93c5fd', '#60a5fa', '#3b82f6', world.ox, world.oy);
            // Decorative stone pillar at pillar intervals (every 4 tiles)
            if (y % 4 === 1) {
              models.drawBox(ctx, 10.94, y + 0.80, 0, 0.35, 0.35, 0.50, '#475569', '#334155', '#1e293b', world.ox, world.oy);
              models.drawBox(ctx, 10.92, y + 0.78, 0.50, 0.39, 0.39, 0.10, '#bae6fd', '#7dd3fc', '#38bdf8', world.ox, world.oy);
            }
          }
        });
      }

      // 3. East Stone Balustrade (segmented by 2-tile chunks on outer edge of tile 17: x = 17.75)
      for (let y = 57; y < 93; y += 2) {
        const segLen = Math.min(2, 93 - y);
        list.push({
          xMin: 17.65, xMax: 18.10,
          yMin: y, yMax: y + segLen,
          draw: () => {
            // Parapet stone base (z: 0..0.48)
            models.drawBox(ctx, 17.75, y, 0, 0.25, segLen, 0.48, '#334155', '#1e293b', '#0f172a', world.ox, world.oy);
            // Frosted stone cap (z: 0.48..0.58)
            models.drawBox(ctx, 17.71, y, 0.48, 0.33, segLen, 0.10, '#93c5fd', '#60a5fa', '#3b82f6', world.ox, world.oy);
            // Decorative stone pillar at pillar intervals (every 4 tiles)
            if (y % 4 === 1) {
              models.drawBox(ctx, 17.69, y + 0.80, 0, 0.35, 0.35, 0.50, '#475569', '#334155', '#1e293b', world.ox, world.oy);
              models.drawBox(ctx, 17.67, y + 0.78, 0.50, 0.39, 0.39, 0.10, '#bae6fd', '#7dd3fc', '#38bdf8', world.ox, world.oy);
            }
          }
        });
      }

      // 4. Blue Side Artifacts (turret distance enlarged to 4.5 tiles; health relic along West balustrade)
      list.push({
        xMin: 12.8, xMax: 15.2, yMin: 60.1, yMax: 62.5,
        draw: () => models.drawAbyssNexus(ctx, 12.9, 60.2, world.ox, world.oy)
      });
      list.push({
        xMin: 13.2, xMax: 14.8, yMin: 63.7, yMax: 65.3,
        draw: () => models.drawAbyssInhibitor(ctx, 13.3, 63.8, world.ox, world.oy)
      });
      list.push({
        xMin: 13.1, xMax: 14.9, yMin: 66.9, yMax: 68.7,
        draw: () => models.drawAbyssTurret(ctx, 13.2, 67.0, world.ox, world.oy)
      });
      list.push({
        xMin: 13.1, xMax: 14.9, yMin: 71.4, yMax: 73.2,
        draw: () => models.drawAbyssTurret(ctx, 13.2, 71.5, world.ox, world.oy)
      });
      // Blue Side Health Relic (Nestled along West Wall Balustrade, clearing the center lane!)
      list.push({
        xMin: 11.4, xMax: 12.4, yMin: 69.8, yMax: 71.0,
        draw: () => models.drawHealthRelic(ctx, 11.6, 70.0, world.ox, world.oy)
      });

      // 5. Mid-Lane Symmetrical Frost Bushes (y: 74..76)
      list.push({
        xMin: 11.2, xMax: 12.6, yMin: 74.0, yMax: 76.2,
        draw: () => models.drawAbyssBrush(ctx, 11.3, 74.2, world.ox, world.oy)
      });
      list.push({
        xMin: 15.4, xMax: 16.8, yMin: 74.0, yMax: 76.2,
        draw: () => models.drawAbyssBrush(ctx, 15.5, 74.2, world.ox, world.oy)
      });

      // 6. Red Side Artifacts (turret distance enlarged to 4.5 tiles; health relic along East balustrade)
      // Red Side Health Relic (Nestled along East Wall Balustrade, clearing the center lane!)
      list.push({
        xMin: 15.6, xMax: 16.8, yMin: 79.8, yMax: 81.0,
        draw: () => models.drawHealthRelic(ctx, 16.0, 80.0, world.ox, world.oy)
      });
      list.push({
        xMin: 13.1, xMax: 14.9, yMin: 78.4, yMax: 80.2,
        draw: () => models.drawAbyssTurret(ctx, 13.2, 78.5, world.ox, world.oy)
      });
      list.push({
        xMin: 13.1, xMax: 14.9, yMin: 82.9, yMax: 84.7,
        draw: () => models.drawAbyssTurret(ctx, 13.2, 83.0, world.ox, world.oy)
      });
      list.push({
        xMin: 13.2, xMax: 14.8, yMin: 86.1, yMax: 87.7,
        draw: () => models.drawAbyssInhibitor(ctx, 13.3, 86.2, world.ox, world.oy)
      });
      list.push({
        xMin: 12.8, xMax: 15.2, yMin: 88.9, yMax: 91.3,
        draw: () => models.drawAbyssNexus(ctx, 12.9, 89.0, world.ox, world.oy)
      });

      // 7. South Bridgehead Gateway Pillars & Braziers (at y = 93.8, framing Minecraft Sanctuary entrance without any beam obscuring the Nexus)
      list.push({
        xMin: 10.6, xMax: 17.4, yMin: 93.6, yMax: 94.2,
        draw: () => {
          models.drawBox(ctx, 10.8, 93.8, 0, 0.70, 0.70, 1.50, '#334155', '#1e293b', '#0f172a', world.ox, world.oy);
          models.drawBox(ctx, 16.5, 93.8, 0, 0.70, 0.70, 1.50, '#334155', '#1e293b', '#0f172a', world.ox, world.oy);
          models.drawAbyssBrazier(ctx, 10.9, 93.6, world.ox, world.oy);
          models.drawAbyssBrazier(ctx, 16.6, 93.6, world.ox, world.oy);
        }
      });

      // ======================================================================
      // D. MINECRAFT ISLAND NORTH CLIFF WOODEN PERIMETER FENCE (y = 94.0)
      // Placed securely on solid ground at y = 94, cleanly connecting to bridge entrance
      // ======================================================================
      // West Northern Cliff Fence (x: 7.0..12.5)
      list.push({
        xMin: 6.8, xMax: 12.6, yMin: 93.8, yMax: 94.2,
        draw: () => drawFenceSegment(7.0, 12.5, 94.0)
      });
      // East Northern Cliff Fence (x: 15.5..21.0)
      list.push({
        xMin: 15.4, xMax: 21.2, yMin: 93.8, yMax: 94.2,
        draw: () => drawFenceSegment(15.5, 21.0, 94.0)
      });

      // ======================================================================
      // E. THE MINECRAFT ISLAND (x: 7..21, y: 93..111)
      // ======================================================================
      const oakLogBark = '#49331e';
      const oakLogSide = '#6d4c28';
      const oakLogRing = '#9c7a4f';
      const oakPlankTop = '#c69a59';
      const oakPlankLeft = '#a1783f';
      const oakPlankRight = '#7c5928';

      // 1. Entrance Welcome Signboard (x: 14.0, y: 94.5)
      list.push({
        xMin: 13.6, xMax: 14.6, yMin: 94.3, yMax: 94.8,
        draw: () => {
          models.drawBox(ctx, 13.9, 94.4, 0, 0.16, 0.16, 0.70, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy);
          models.drawBox(ctx, 13.5, 94.4, 0.65, 1.00, 0.14, 0.45, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          const sp = isoToScreen(14.0, 94.45, 0.90, world.ox, world.oy);
          ctx.fillStyle = '#382314';
          ctx.font = 'bold 7px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('MINECRAFT', sp.x, sp.y - 2);
          ctx.fillText('SANCTUARY', sp.x, sp.y + 6);
        }
      });

      // 2. Classic Minecraft Oak Wood Cabin (x: 9..15, y: 97..103)
      // Open-top isometric building — NO ROOF so interior layout is 100% visible!
      // Complete Solid Oak Wood Floor inside the cabin!
      list.push({
        xMin: 9.0, xMax: 15.0, yMin: 97.0, yMax: 103.0,
        draw: () => {
          models.drawBox(ctx, 9.0, 97.0, 0, 6.0, 6.0, 0.08, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          // 4 Corner Oak Log Pillars (z: 0..2.2)
          models.drawBox(ctx, 9.0, 97.0, 0, 0.8, 0.8, 2.20, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy);
          models.drawBox(ctx, 14.2, 97.0, 0, 0.8, 0.8, 2.20, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy);
          models.drawBox(ctx, 9.0, 102.2, 0, 0.8, 0.8, 2.20, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy);
          models.drawBox(ctx, 14.2, 102.2, 0, 0.8, 0.8, 2.20, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy);

          // West Wall with 2x2 Glass Window
          models.drawBox(ctx, 9.0, 97.8, 0, 0.35, 4.4, 0.80, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          models.drawBox(ctx, 9.0, 97.8, 1.80, 0.35, 4.4, 0.40, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          models.drawBox(ctx, 9.0, 99.0, 0.80, 0.28, 2.0, 1.00, 'rgba(186, 230, 253, 0.55)', 'rgba(125, 211, 252, 0.4)', 'rgba(56, 189, 248, 0.3)', world.ox, world.oy);

          // South Wall with Glass Window
          models.drawBox(ctx, 9.8, 102.6, 0, 4.4, 0.35, 0.80, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          models.drawBox(ctx, 9.8, 102.6, 1.80, 4.4, 0.35, 0.40, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          models.drawBox(ctx, 11.0, 102.6, 0.80, 2.0, 0.28, 1.00, 'rgba(186, 230, 253, 0.55)', 'rgba(125, 211, 252, 0.4)', 'rgba(56, 189, 248, 0.3)', world.ox, world.oy);

          // East Wall with Window
          models.drawBox(ctx, 14.6, 97.8, 0, 0.35, 4.4, 0.80, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          models.drawBox(ctx, 14.6, 97.8, 1.80, 0.35, 4.4, 0.40, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          models.drawBox(ctx, 14.6, 99.0, 0.80, 0.28, 2.0, 1.00, 'rgba(186, 230, 253, 0.55)', 'rgba(125, 211, 252, 0.4)', 'rgba(56, 189, 248, 0.3)', world.ox, world.oy);

          // North Wall (doorway at x: 13..15)
          models.drawBox(ctx, 9.8, 97.0, 0, 3.2, 0.35, 2.20, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          models.drawBox(ctx, 13.0, 97.0, 2.00, 1.2, 0.35, 0.20, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
        }
      });

      // 3. Cabin Interior Furniture (Fully visible without roof!)
      // A. Minecraft Red Bed (x: 9.8, y: 99.5)
      list.push({
        xMin: 9.5, xMax: 11.0, yMin: 99.3, yMax: 101.5,
        draw: () => {
          models.drawBox(ctx, 9.8, 99.5, 0, 1.05, 1.95, 0.18, '#582b0c', '#3f1d08', '#291006', world.ox, world.oy);
          models.drawBox(ctx, 9.8, 99.5, 0.18, 1.05, 1.95, 0.20, '#dc2626', '#b91c1c', '#991b1b', world.ox, world.oy);
          models.drawBox(ctx, 9.8, 99.5, 0.38, 1.05, 0.55, 0.08, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);
        }
      });

      // B. Crafting Table (x: 13.8, y: 98.2)
      list.push({
        xMin: 13.6, xMax: 14.6, yMin: 98.0, yMax: 99.0,
        draw: () => {
          models.drawBox(ctx, 13.8, 98.2, 0, 0.75, 0.75, 0.75, '#b45309', '#92400e', '#78350f', world.ox, world.oy);
          const topP = isoToScreen(14.18, 98.58, 0.75, world.ox, world.oy);
          ctx.fillStyle = '#451a03';
          ctx.fillRect(topP.x - 5, topP.y - 4, 10, 8);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(topP.x - 5, topP.y - 4, 10, 8);
        }
      });

      // C. Furnace (x: 13.8, y: 100.2)
      list.push({
        xMin: 13.6, xMax: 14.6, yMin: 100.0, yMax: 101.0,
        draw: () => {
          models.drawBox(ctx, 13.8, 100.2, 0, 0.75, 0.75, 0.75, '#475569', '#334155', '#1e293b', world.ox, world.oy);
          const fp = isoToScreen(13.8, 100.58, 0.38, world.ox, world.oy);
          ctx.fillStyle = '#f97316';
          ctx.shadowColor = '#ea580c';
          ctx.shadowBlur = 8;
          ctx.fillRect(fp.x - 3, fp.y - 3, 6, 6);
          ctx.shadowBlur = 0;
        }
      });

      // D. Large Wooden Storage Chest (x: 9.8, y: 97.8)
      list.push({
        xMin: 9.5, xMax: 10.6, yMin: 97.6, yMax: 98.6,
        draw: () => {
          models.drawBox(ctx, 9.8, 97.8, 0, 0.75, 0.75, 0.65, '#a16207', '#854d0e', '#713f12', world.ox, world.oy);
          const cp = isoToScreen(10.18, 97.8, 0.40, world.ox, world.oy);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(cp.x - 2, cp.y - 2, 4, 4);
        }
      });

      // E. Wall Torch
      list.push({
        xMin: 11.8, xMax: 12.4, yMin: 97.0, yMax: 97.4,
        draw: () => {
          models.drawBox(ctx, 12.0, 97.1, 1.20, 0.10, 0.10, 0.45, '#78350f', '#451a03', '#291006', world.ox, world.oy);
          const tp = isoToScreen(12.05, 97.15, 1.70, world.ox, world.oy);
          ctx.save();
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 10;
          ctx.fillRect(tp.x - 2.5, tp.y - 2.5, 5, 5);
          ctx.restore();
        }
      });

      // 4. Rectangular Minecraft Farmland (x: 16..20, y: 97..102)
      list.push({
        xMin: 15.8, xMax: 20.2, yMin: 96.8, yMax: 102.2,
        draw: () => {
          // Continuous Farmland Soil Bed
          models.drawBox(ctx, 16.0, 97.0, 0, 4.0, 5.0, 0.12, '#3b2314', '#27170c', '#170c06', world.ox, world.oy);

          // Central 1x1 Water Irrigation Well (at x: 18, y: 99)
          models.drawBox(ctx, 18.0, 99.0, 0.08, 1.0, 1.0, 0.04, '#0284c7', '#0369a1', '#075985', world.ox, world.oy);
          const lp = isoToScreen(18.5, 99.5, 0.13, world.ox, world.oy);
          ctx.fillStyle = '#15803d';
          ctx.fillRect(lp.x - 3, lp.y - 2, 6, 4);

          // Flourishing Crops: Golden Wheat & Carrots
          const cropSpots = [
            { x: 16.5, y: 97.5, type: 'wheat' }, { x: 17.5, y: 97.5, type: 'carrot' }, { x: 18.5, y: 97.5, type: 'wheat' }, { x: 19.5, y: 97.5, type: 'carrot' },
            { x: 16.5, y: 98.5, type: 'carrot' }, { x: 17.5, y: 98.5, type: 'wheat' }, { x: 19.5, y: 98.5, type: 'wheat' },
            { x: 16.5, y: 100.5, type: 'wheat' }, { x: 17.5, y: 100.5, type: 'carrot' }, { x: 19.5, y: 100.5, type: 'carrot' },
            { x: 16.5, y: 101.5, type: 'carrot' }, { x: 17.5, y: 101.5, type: 'wheat' }, { x: 18.5, y: 101.5, type: 'wheat' }, { x: 19.5, y: 101.5, type: 'carrot' }
          ];

          cropSpots.forEach(c => {
            const topColor = c.type === 'wheat' ? '#eab308' : '#22c55e';
            const leftColor = c.type === 'wheat' ? '#ca8a04' : '#16a34a';
            const rightColor = c.type === 'wheat' ? '#a16207' : '#15803d';
            models.drawBox(ctx, c.x - 0.25, c.y - 0.25, 0.12, 0.50, 0.50, 0.40, topColor, leftColor, rightColor, world.ox, world.oy);
          });

          // Interconnected Perimeter Fences & Gate (x: 16, y: 99..100.5)
          const fencePosts = [
            { gx: 16.0, gy: 97.0 }, { gx: 18.0, gy: 97.0 }, { gx: 20.0, gy: 97.0 },
            { gx: 20.0, gy: 99.5 }, { gx: 20.0, gy: 102.0 },
            { gx: 18.0, gy: 102.0 }, { gx: 16.0, gy: 102.0 },
            { gx: 16.0, gy: 98.0 }, { gx: 16.0, gy: 100.5 }
          ];
          fencePosts.forEach(p => {
            models.drawBox(ctx, p.gx, p.gy, 0, 0.20, 0.20, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          });
          // Dual horizontal oak fence rails linking posts together
          // North perimeter rail
          models.drawBox(ctx, 16.0, 97.04, 0.25, 4.0, 0.12, 0.12, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 16.0, 97.04, 0.50, 4.0, 0.12, 0.12, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          // East perimeter rail
          models.drawBox(ctx, 20.04, 97.0, 0.25, 0.12, 5.0, 0.12, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 20.04, 97.0, 0.50, 0.12, 5.0, 0.12, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          // South perimeter rail
          models.drawBox(ctx, 16.0, 102.04, 0.25, 4.0, 0.12, 0.12, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 16.0, 102.04, 0.50, 4.0, 0.12, 0.12, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          // West perimeter top rail (y: 97..98)
          models.drawBox(ctx, 16.04, 97.0, 0.25, 0.12, 1.0, 0.12, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 16.04, 97.0, 0.50, 0.12, 1.0, 0.12, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          // West perimeter bottom rail (y: 100.5..102)
          models.drawBox(ctx, 16.04, 100.5, 0.25, 0.12, 1.5, 0.12, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 16.04, 100.5, 0.50, 0.12, 1.5, 0.12, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
        }
      });

      // 5. Blocky Minecraft Sheep (grazing peacefully at x: 12.0, y: 105.0)
      list.push({
        xMin: 11.6, xMax: 12.8, yMin: 104.5, yMax: 105.8,
        draw: () => {
          const sx = 12.0, sy = 105.0;
          models.drawBox(ctx, sx, sy, 0, 0.16, 0.16, 0.40, '#cbd5e1', '#94a3b8', '#64748b', world.ox, world.oy);
          models.drawBox(ctx, sx + 0.50, sy, 0, 0.16, 0.16, 0.40, '#cbd5e1', '#94a3b8', '#64748b', world.ox, world.oy);
          models.drawBox(ctx, sx, sy + 0.70, 0, 0.16, 0.16, 0.40, '#cbd5e1', '#94a3b8', '#64748b', world.ox, world.oy);
          models.drawBox(ctx, sx + 0.50, sy + 0.70, 0, 0.16, 0.16, 0.40, '#cbd5e1', '#94a3b8', '#64748b', world.ox, world.oy);
          // Fluffy White Wool Body
          models.drawBox(ctx, sx - 0.10, sy - 0.10, 0.40, 0.85, 1.10, 0.75, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);
          // Pink/Beige Head
          models.drawBox(ctx, sx + 0.10, sy - 0.35, 0.65, 0.45, 0.45, 0.45, '#fbcfe8', '#f472b6', '#e2e8f0', world.ox, world.oy);
          const ep = isoToScreen(sx + 0.10, sy - 0.35, 0.85, world.ox, world.oy);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(ep.x - 4, ep.y - 2, 2.5, 2.5);
          ctx.fillRect(ep.x + 2, ep.y - 2, 2.5, 2.5);
        }
      });

      // 6. Blocky Minecraft Oak Tree (at x: 7.8, y: 106.0)
      list.push({
        xMin: 7.0, xMax: 9.2, yMin: 105.0, yMax: 107.5,
        draw: () => {
          const tx = 7.8, ty = 106.0;
          models.drawBox(ctx, tx, ty, 0, 0.65, 0.65, 2.40, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy);
          models.drawBox(ctx, tx - 1.20, ty - 1.20, 2.00, 3.00, 3.00, 1.00, '#38a169', '#2f855a', '#22543d', world.ox, world.oy);
          models.drawBox(ctx, tx - 0.75, ty - 0.75, 3.00, 2.10, 2.10, 0.90, '#48bb78', '#38a169', '#276749', world.ox, world.oy);
          models.drawBox(ctx, tx - 0.35, ty - 0.35, 3.90, 1.35, 1.35, 0.60, '#68d391', '#48bb78', '#2f855a', world.ox, world.oy);
        }
      });
    }
  };

  window.GamingDimensionPrefab = GamingDimensionPrefab;

})(window);
