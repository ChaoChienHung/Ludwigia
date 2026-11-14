// ============================================================================
// Ludwigia World — Modular Architecture Prefabs
// Gaming Dimension: Centered Cyber Cafe, Grand Symmetric ARAM Bridge & Minecraft Island
// ============================================================================

(function(window) {
  'use strict';

  const { isoToScreen, screenToIso } = window.LudwigWorldEngine || {};

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

      // 2. Minecraft Island North Cliff Edge, Fences & Gateway Fire Pillars (blocks entrance flanks, leaving center x: 12.75..15.25 open)
      nav.setBlock(7.0, 93.6, 5.75, 0.8, true);      // West Northern Fence, Cliff & West Gateway Pillar (x: 7.0..12.75)
      nav.setBlock(15.25, 93.6, 5.75, 0.8, true);    // East Northern Fence, Cliff & East Gateway Pillar (x: 15.25..21.0)

      // 3. Minecraft Island Perimeter Fences (West x=7.0, East x=21.0, South y=111.0)
      nav.setBlock(6.8, 94.0, 0.5, 17.2, true);     // West Cliff Fence (x: 6.8..7.3, y: 94..111.2)
      nav.setBlock(20.7, 94.0, 0.5, 17.2, true);    // East Cliff Fence (x: 20.7..21.2, y: 94..111.2)
      nav.setBlock(7.0, 110.7, 14.2, 0.5, true);    // South Cliff Fence (x: 7..21.2, y: 110.7..111.2)

      // 4. Void Chasm Outer Boundaries
      nav.setBlock(0.0, 93.0, 6.8, 20.0, true);     // Flanking Void West of Island
      nav.setBlock(21.2, 93.0, 32.8, 20.0, true);   // Flanking Void East of Island
      nav.setBlock(0.0, 111.2, 54.0, 2.0, true);    // Flanking Void South of Island

      // 5. Symmetrical Bridge Artifacts along Centerline x: 14.0
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
      // D. MINECRAFT ISLAND INTERIOR OBSTACLES (x: 7..21, y: 93..111)
      // ======================================================================
      // Oak Wood Cabin (x: 9..15, y: 97..103, spacious doorway at x: 12.8..14.2 at y: 97)
      nav.setBlock(9.0, 96.8, 3.8, 0.5, true);    // North Wall Left (x: 9..12.8)
      nav.setBlock(14.2, 96.8, 0.8, 0.5, true);   // North Wall Right Pillar (x: 14.2..15)
      nav.setBlock(8.8, 97.0, 0.5, 6.0, true);    // West Wall (x: 8.8..9.3, y: 97..103)
      nav.setBlock(14.7, 97.0, 0.5, 6.0, true);   // East Wall (x: 14.7..15.2, y: 97..103)
      nav.setBlock(9.0, 102.7, 6.0, 0.5, true);   // South Wall (x: 9..15, y: 102.7..103.2)

      // Cabin Furniture Obstacles (Neatly arranged along back & side walls, doorway corridor 100% unobstructed!)
      nav.setBlock(9.6, 97.5, 0.9, 0.9, true);    // Large Wooden Storage Chest (x: 9.8)
      nav.setBlock(10.6, 97.5, 0.9, 0.9, true);   // Crafting Table (x: 10.7)
      nav.setBlock(11.5, 97.5, 0.9, 0.9, true);   // Furnace (x: 11.6)
      nav.setBlock(9.6, 99.3, 1.4, 2.1, true);    // Minecraft Red Bed (x: 9.8, y: 99.5)

      // Farmland Fences (x: 16..20, y: 97..102, perimeter fences placed cleanly at x=15.5 and y=96.6/102.0)
      nav.setBlock(15.4, 96.4, 4.8, 0.4, true);   // North Fence (y = 96.6)
      nav.setBlock(19.8, 96.6, 0.4, 5.6, true);   // East Fence (x = 20.0)
      nav.setBlock(15.4, 101.8, 4.8, 0.4, true);  // South Fence (y = 102.0)
      nav.setBlock(15.4, 96.6, 0.4, 2.2, true);   // West Fence Top (y: 96.6..98.8)
      nav.setBlock(15.4, 100.2, 0.4, 2.0, true);  // West Fence Bottom (y: 100.2..102.2, gate open at 98.8..100.2)

      // Oak Tree Trunk
      nav.setBlock(7.6, 105.8, 1.0, 1.0, true);
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
        xMin: 18.9, xMax: 19.35, yMin: 48.8, yMax: 57.2,
        draw: () => {
          ctx.save();
          if (world.wallAlphaCyber < 0.99) ctx.globalAlpha = world.wallAlphaCyber;
          models.drawBox(ctx, 19.0, 48.8, 0, 0.25, 8.2, 0.35, '#1e293b', '#0f172a', '#020617', world.ox, world.oy);
          models.drawBox(ctx, 19.0, 48.8, H - 0.25, 0.25, 8.2, 0.25, '#1e293b', '#0f172a', '#020617', world.ox, world.oy);
          for (let y = 48.8; y <= 57.0; y += 2.05) {
            models.drawBox(ctx, 19.0, y, 0.35, 0.25, 0.25, H - 0.60, '#38bdf8', '#0284c7', '#0369a1', world.ox, world.oy);
          }
          models.drawBox(ctx, 19.0, 48.8, 1.25, 0.25, 8.2, 0.12, '#0f172a', '#1e293b', '#334155', world.ox, world.oy);

          const p0 = isoToScreen(19.26, 48.8, 0.35, world.ox, world.oy);
          const p1 = isoToScreen(19.26, 57.0, 0.35, world.ox, world.oy);
          const p2 = isoToScreen(19.26, 57.0, H - 0.25, world.ox, world.oy);
          const p3 = isoToScreen(19.26, 48.8, H - 0.25, world.ox, world.oy);

          const glassGrad = ctx.createLinearGradient(p0.x, p0.y, p2.x, p2.y);
          glassGrad.addColorStop(0, 'rgba(6, 182, 212, 0.58)');
          glassGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.48)');
          glassGrad.addColorStop(1, 'rgba(2, 132, 199, 0.62)');
          ctx.fillStyle = glassGrad;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.60)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
          ctx.lineWidth = 1.8;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 6;
          const nm0 = isoToScreen(19.27, 48.8, 1.25, world.ox, world.oy);
          const nm1 = isoToScreen(19.27, 57.0, 1.25, world.ox, world.oy);
          ctx.beginPath();
          ctx.moveTo(nm0.x, nm0.y); ctx.lineTo(nm1.x, nm1.y);
          ctx.stroke();
          ctx.restore();
        }
      });

      // 4. South Exterior Wall & Panoramic Cyber Glass Windows Overlooking Howling Abyss (x: 9..19, y = 57.0)
      // 4.1 South Facade — Left Panoramic Cyber Glass Window Bay (x = 9..12.8, y = 57.0)
      list.push({
        xMin: 8.8, xMax: 13.0, yMin: 56.8, yMax: 57.3,
        draw: () => {
          ctx.save();
          if (world.wallAlphaCyber < 0.99) ctx.globalAlpha = world.wallAlphaCyber;

          // Bottom Sill & Top Lintel (Full 3D)
          models.drawBox(ctx, 9.0, 57.0, 0, 3.8, 0.25, 0.45, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);
          models.drawBox(ctx, 9.0, 57.0, 2.30, 3.8, 0.25, H - 2.30, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);

          // Structural Vertical Pillars (Left corner & Door frame left)
          models.drawBox(ctx, 9.0, 57.0, 0.45, 0.35, 0.25, 1.85, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);
          models.drawBox(ctx, 12.45, 57.0, 0.45, 0.35, 0.25, 1.85, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);
          // Vertical Center Window Mullion
          models.drawBox(ctx, 10.75, 57.0, 0.45, 0.18, 0.25, 1.85, '#38bdf8', '#0284c7', '#0369a1', world.ox, world.oy, '#0284c7');
          // Horizontal Transom Bar
          models.drawBox(ctx, 9.35, 57.0, 1.35, 3.10, 0.25, 0.10, '#0f172a', '#1e293b', '#334155', world.ox, world.oy, '#1e293b');

          // Large Vibrant Cyan-Teal Tinted Glass Window Pane (Facing South toward Abyss Bridge!)
          const p0 = isoToScreen(9.35, 57.25, 0.45, world.ox, world.oy);
          const p1 = isoToScreen(12.45, 57.25, 0.45, world.ox, world.oy);
          const p2 = isoToScreen(12.45, 57.25, 2.30, world.ox, world.oy);
          const p3 = isoToScreen(9.35, 57.25, 2.30, world.ox, world.oy);

          const gGrad = ctx.createLinearGradient(p0.x, p0.y, p2.x, p2.y);
          gGrad.addColorStop(0, 'rgba(6, 182, 212, 0.65)');
          gGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.50)');
          gGrad.addColorStop(1, 'rgba(56, 189, 248, 0.60)');
          ctx.fillStyle = gGrad;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fill();

          // Crisp Silver Window Edge
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.80)';
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

      // 4.2 South Facade — Right Panoramic Cyber Glass Window Bay (x = 15.2..19.0, y = 57.0)
      list.push({
        xMin: 15.0, xMax: 19.2, yMin: 56.8, yMax: 57.3,
        draw: () => {
          ctx.save();
          if (world.wallAlphaCyber < 0.99) ctx.globalAlpha = world.wallAlphaCyber;

          // Bottom Sill & Top Lintel (Full 3D)
          models.drawBox(ctx, 15.2, 57.0, 0, 3.8, 0.25, 0.45, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);
          models.drawBox(ctx, 15.2, 57.0, 2.30, 3.8, 0.25, H - 2.30, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);

          // Structural Vertical Pillars (Door frame right & Right corner)
          models.drawBox(ctx, 15.2, 57.0, 0.45, 0.35, 0.25, 1.85, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);
          models.drawBox(ctx, 18.65, 57.0, 0.45, 0.35, 0.25, 1.85, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);
          // Vertical Center Window Mullion
          models.drawBox(ctx, 16.95, 57.0, 0.45, 0.18, 0.25, 1.85, '#a855f7', '#8b5cf6', '#7c3aed', world.ox, world.oy, '#8b5cf6');
          // Horizontal Transom Bar
          models.drawBox(ctx, 15.55, 57.0, 1.35, 3.10, 0.25, 0.10, '#0f172a', '#1e293b', '#334155', world.ox, world.oy, '#1e293b');

          // Large Vibrant Electric Sky-Blue/Violet Tinted Glass Window Pane
          const p0 = isoToScreen(15.55, 57.25, 0.45, world.ox, world.oy);
          const p1 = isoToScreen(18.65, 57.25, 0.45, world.ox, world.oy);
          const p2 = isoToScreen(18.65, 57.25, 2.30, world.ox, world.oy);
          const p3 = isoToScreen(15.55, 57.25, 2.30, world.ox, world.oy);

          const gGrad = ctx.createLinearGradient(p0.x, p0.y, p2.x, p2.y);
          gGrad.addColorStop(0, 'rgba(56, 189, 248, 0.65)');
          gGrad.addColorStop(0.5, 'rgba(129, 140, 248, 0.50)');
          gGrad.addColorStop(1, 'rgba(168, 85, 247, 0.60)');
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
      list.push({
        xMin: 12.8, xMax: 15.2, yMin: 56.8, yMax: 57.3,
        draw: () => {
          ctx.save();
          if (world.wallAlphaCyber < 0.99) ctx.globalAlpha = world.wallAlphaCyber;
          // Lintel wall beam above doorway (z: 2.20 to H = 2.70, x: 13.0 to 15.0)
          models.drawBox(ctx, 13.0, 57.0, 2.20, 2.0, 0.25, H - 2.20, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy, cyberWallL);

          // Sheared High-Tech Cyber Signboard mounted flush on lintel front surface (y = 57.26, z: 2.48, safely above sliding door header)
          const sp = isoToScreen(14.0, 57.26, 2.48, world.ox, world.oy);
          ctx.save();
          ctx.translate(sp.x, sp.y);
          ctx.transform(1, 0.5, 0, 1, 0, 0); // Sheared onto X-axis longitudinal wall!

          const sW = 142;
          const sH = 17;
          // Dark Cyber Carbon Plate
          ctx.fillStyle = '#020617';
          ctx.fillRect(-sW / 2, -sH / 2, sW, sH);

          // Neon Cyan Glow Border
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.2;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.strokeRect(-sW / 2, -sH / 2, sW, sH);
          ctx.shadowBlur = 0;

          // Crisp Bilingual Typography
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang TC", "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 4;
          ctx.fillText('⚡ 電玩傳送門 • GAMING PORTAL ⚡', 0, 0);

          ctx.restore();
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

      const drawFenceSegmentY = (xPos, yStart, yEnd) => {
        // Continuous longitudinal crossbars along Y axis
        models.drawBox(ctx, xPos, yStart, 0.30, 0.12, yEnd - yStart, 0.10, '#a16e3b', '#7c4d21', '#5c3714', world.ox, world.oy);
        models.drawBox(ctx, xPos, yStart, 0.60, 0.12, yEnd - yStart, 0.10, '#a16e3b', '#7c4d21', '#5c3714', world.ox, world.oy);
        // Vertical fence posts every 1.5 tiles
        for (let fy = yStart; fy <= yEnd + 0.1; fy += 1.5) {
          models.drawBox(ctx, xPos, fy, 0, 0.22, 0.22, 0.85, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
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
      // 1. North Bridgehead Gateway Pillars & Braziers (at y = 57.3, aligned with bridge balustrades)
      list.push({
        xMin: 10.8, xMax: 17.2, yMin: 57.1, yMax: 57.7,
        draw: () => {
          models.drawGatewayFirePillar(ctx, 11.0, 57.3, world.ox, world.oy, 1.30);
          models.drawGatewayFirePillar(ctx, 16.35, 57.3, world.ox, world.oy, 1.30);
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
        xMin: 12.0, xMax: 16.0, yMin: 93.6, yMax: 94.2,
        draw: () => {
          models.drawGatewayFirePillar(ctx, 12.1, 93.8, world.ox, world.oy, 1.30);
          models.drawGatewayFirePillar(ctx, 15.25, 93.8, world.ox, world.oy, 1.30);
        }
      });

      // ======================================================================
      // D. MINECRAFT ISLAND PERIMETER FENCES & CLIFF BOUNDARIES (x: 7..21, y: 93..111)
      // Placed securely along the floating island edges to frame the sanctuary
      // ======================================================================
      // 1. North Cliff Fences (y = 94.0, terminates flush against Gateway Stone Pillars at x: 12.1 and x: 15.9)
      list.push({
        xMin: 6.8, xMax: 12.2, yMin: 93.8, yMax: 94.2,
        draw: () => drawFenceSegment(7.0, 12.1, 94.0)
      });
      list.push({
        xMin: 15.8, xMax: 21.2, yMin: 93.8, yMax: 94.2,
        draw: () => drawFenceSegment(15.9, 21.0, 94.0)
      });

      // 2. West Cliff Fence (x = 7.0, y: 94..111)
      list.push({
        xMin: 6.8, xMax: 7.3, yMin: 94.0, yMax: 111.0,
        draw: () => drawFenceSegmentY(7.0, 94.0, 111.0)
      });

      // 3. East Cliff Fence (x = 21.0, y: 94..111)
      list.push({
        xMin: 20.7, xMax: 21.2, yMin: 94.0, yMax: 111.0,
        draw: () => drawFenceSegmentY(21.0, 94.0, 111.0)
      });

      // 4. South Cliff Fence (y = 111.0, x: 7..21)
      list.push({
        xMin: 6.8, xMax: 21.2, yMin: 110.8, yMax: 111.2,
        draw: () => drawFenceSegment(7.0, 21.0, 111.0)
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

      // 2. Classic Minecraft Oak Wood Cabin (x: 9..15, y: 97..103)
      // Decomposed into distinct architectural layers for 100% cycle-free topological depth sorting!

      // Helper: Authentic Minecraft Connected Glass Window (Seamless connected blocks, pixelated white rim & diagonal glare streaks)
      const drawMinecraftConnectedGlassWindow = (gx, gy, gz, dx, dy, dz, isAlongX, alpha = 1.0) => {
        ctx.save();
        if (alpha < 0.99) ctx.globalAlpha = alpha;

        // 1. 3D Translucent Glass Block Volume (Matches wall thickness 0.35)
        models.drawBox(
          ctx, gx, gy, gz, dx, dy, dz,
          'rgba(240, 249, 255, 0.55)',
          'rgba(186, 230, 253, 0.45)',
          'rgba(147, 197, 253, 0.45)',
          world.ox, world.oy,
          'rgba(186, 230, 253, 0.40)'
        );

        // 2. Camera-Facing Facet: Connected Border, Block Seams & Classic Diagonal Glare Streaks
        if (isAlongX) {
          // South-Facing Facade (Along X axis, at py = gy + dy)
          const py = gy + dy;
          const p0 = isoToScreen(gx, py, gz, world.ox, world.oy);
          const p1 = isoToScreen(gx + dx, py, gz, world.ox, world.oy);
          const p2 = isoToScreen(gx + dx, py, gz + dz, world.ox, world.oy);
          const p3 = isoToScreen(gx, py, gz + dz, world.ox, world.oy);

          // Subtle Glass Surface Tint
          ctx.fillStyle = 'rgba(186, 230, 253, 0.22)';
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fill();

          // Connected Glass Outer Frame
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
          ctx.lineWidth = 1.3;
          ctx.stroke();

          // Seamless block subdivision seams (connected 1x1 glass block panes)
          const blockCount = Math.round(dx / 1.1) || 4;
          const step = dx / blockCount;
          for (let i = 1; i < blockCount; i++) {
            const bx = gx + step * i;
            const bBottom = isoToScreen(bx, py, gz, world.ox, world.oy);
            const bTop = isoToScreen(bx, py, gz + dz, world.ox, world.oy);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(bBottom.x, bBottom.y); ctx.lineTo(bTop.x, bTop.y);
            ctx.stroke();
          }

          // Iconic Minecraft Glass Glare Streaks in each block
          for (let i = 0; i < blockCount; i++) {
            const cx = gx + step * (i + 0.35);
            const cz = gz + dz * 0.72;
            const g1 = isoToScreen(cx, py, cz, world.ox, world.oy);
            const g2 = isoToScreen(cx + step * 0.32, py, cz - dz * 0.38, world.ox, world.oy);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(g1.x, g1.y); ctx.lineTo(g2.x, g2.y);
            ctx.stroke();
          }
        } else {
          // East-Facing Facade (Along Y axis, at px = gx + dx)
          const px = gx + dx;
          const p0 = isoToScreen(px, gy, gz, world.ox, world.oy);
          const p1 = isoToScreen(px, gy + dy, gz, world.ox, world.oy);
          const p2 = isoToScreen(px, gy + dy, gz + dz, world.ox, world.oy);
          const p3 = isoToScreen(px, gy, gz + dz, world.ox, world.oy);

          ctx.fillStyle = 'rgba(186, 230, 253, 0.22)';
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
          ctx.lineWidth = 1.3;
          ctx.stroke();

          const blockCount = Math.round(dy / 1.1) || 4;
          const step = dy / blockCount;
          for (let i = 1; i < blockCount; i++) {
            const by = gy + step * i;
            const bBottom = isoToScreen(px, by, gz, world.ox, world.oy);
            const bTop = isoToScreen(px, by, gz + dz, world.ox, world.oy);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(bBottom.x, bBottom.y); ctx.lineTo(bTop.x, bTop.y);
            ctx.stroke();
          }

          for (let i = 0; i < blockCount; i++) {
            const cy = gy + step * (i + 0.35);
            const cz = gz + dz * 0.72;
            const g1 = isoToScreen(px, cy, cz, world.ox, world.oy);
            const g2 = isoToScreen(px, cy + step * 0.32, cz - dz * 0.38, world.ox, world.oy);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(g1.x, g1.y); ctx.lineTo(g2.x, g2.y);
            ctx.stroke();
          }
        }

        ctx.restore();
      };

      // 2A. Back North Wall & NW/NE Pillars (y: 96.8..97.4, doorway at x: 12.8..14.2)
      list.push({
        xMin: 8.9, xMax: 15.1, yMin: 96.8, yMax: 97.4,
        draw: () => {
          // NW Log Pillar
          models.drawBox(ctx, 9.0, 97.0, 0, 0.8, 0.8, 2.20, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy);
          // NE Log Pillar
          models.drawBox(ctx, 14.2, 97.0, 0, 0.8, 0.8, 2.20, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy);
          // North Wall Solid Left (x: 9.8..12.8)
          models.drawBox(ctx, 9.8, 97.0, 0, 3.0, 0.35, 2.20, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          // North Doorway Overhead Lintel (x: 12.8..14.2)
          models.drawBox(ctx, 12.8, 97.0, 1.95, 1.4, 0.35, 0.25, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);

          // Wall Torch with Warm Animated Flickering Light
          models.drawBox(ctx, 12.4, 97.1, 1.20, 0.10, 0.10, 0.45, '#78350f', '#451a03', '#291006', world.ox, world.oy);
          const tp = isoToScreen(12.45, 97.15, 1.70, world.ox, world.oy);
          ctx.save();
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 10;
          ctx.fillRect(tp.x - 2.5, tp.y - 2.5, 5, 5);
          ctx.restore();
        }
      });

      // 2B. Back-Left West Wall (x: 8.8..9.35, y: 97.8..102.2) — Spans full width connecting NW to SW log pillar
      list.push({
        xMin: 8.8, xMax: 9.35, yMin: 97.8, yMax: 102.2,
        draw: () => {
          // Lower Solid Planks
          models.drawBox(ctx, 9.0, 97.8, 0, 0.35, 4.4, 0.80, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          // Upper Solid Planks
          models.drawBox(ctx, 9.0, 97.8, 1.80, 0.35, 4.4, 0.40, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          // West Window Connected Minecraft Glass (Full 4.4 span from y: 97.8 to 102.2)
          drawMinecraftConnectedGlassWindow(9.0, 97.8, 0.80, 0.35, 4.4, 1.00, false, 1.0);
        }
      });

      // 2C. Cabin Interior Furniture (Arranged along back & side walls, doorway corridor 100% unobstructed!)
      // Large Wooden Storage Chest (x: 9.8, y: 97.6)
      list.push({
        xMin: 9.6, xMax: 10.6, yMin: 97.4, yMax: 98.4,
        draw: () => {
          models.drawBox(ctx, 9.8, 97.6, 0, 0.75, 0.75, 0.65, '#a16207', '#854d0e', '#713f12', world.ox, world.oy);
          const cp = isoToScreen(10.18, 97.6, 0.40, world.ox, world.oy);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(cp.x - 2, cp.y - 2, 4, 4);
        }
      });

      // Crafting Table (x: 10.7, y: 97.6) — Placed neatly beside chest along solid north wall
      list.push({
        xMin: 10.5, xMax: 11.5, yMin: 97.4, yMax: 98.4,
        draw: () => {
          models.drawBox(ctx, 10.7, 97.6, 0, 0.75, 0.75, 0.75, '#b45309', '#92400e', '#78350f', world.ox, world.oy);
          const topP = isoToScreen(11.08, 97.98, 0.75, world.ox, world.oy);
          ctx.fillStyle = '#451a03';
          ctx.fillRect(topP.x - 5, topP.y - 4, 10, 8);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(topP.x - 5, topP.y - 4, 10, 8);
        }
      });

      // Furnace (x: 11.6, y: 97.6) — Placed neatly beside crafting table along solid north wall
      list.push({
        xMin: 11.4, xMax: 12.4, yMin: 97.4, yMax: 98.4,
        draw: () => {
          models.drawBox(ctx, 11.6, 97.6, 0, 0.75, 0.75, 0.75, '#475569', '#334155', '#1e293b', world.ox, world.oy);
          const fp = isoToScreen(11.98, 98.35, 0.38, world.ox, world.oy);
          ctx.save();
          ctx.fillStyle = '#f97316';
          ctx.shadowColor = '#ea580c';
          ctx.shadowBlur = 8;
          ctx.fillRect(fp.x - 3, fp.y - 3, 6, 6);
          ctx.restore();
        }
      });

      // Minecraft Red Bed (x: 9.8, y: 99.5) — Placed comfortably along west wall beneath the window
      list.push({
        xMin: 9.6, xMax: 11.0, yMin: 99.3, yMax: 101.4,
        draw: () => {
          models.drawBox(ctx, 9.8, 99.5, 0, 1.05, 1.95, 0.18, '#582b0c', '#3f1d08', '#291006', world.ox, world.oy);
          models.drawBox(ctx, 9.8, 99.5, 0.18, 1.05, 1.95, 0.20, '#dc2626', '#b91c1c', '#991b1b', world.ox, world.oy);
          models.drawBox(ctx, 9.8, 99.5, 0.38, 1.05, 0.55, 0.08, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);
        }
      });

      // 2D. Camera-Facing East Wall (x: 14.6..15.1, y: 97.8..102.2) — Supports wallAlphaMinecraft
      list.push({
        xMin: 14.6, xMax: 15.1, yMin: 97.8, yMax: 102.2,
        draw: () => {
          ctx.save();
          if (world.wallAlphaMinecraft < 0.99) ctx.globalAlpha = world.wallAlphaMinecraft;
          // Lower Solid Planks
          models.drawBox(ctx, 14.6, 97.8, 0, 0.35, 4.4, 0.80, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          // Upper Solid Planks
          models.drawBox(ctx, 14.6, 97.8, 1.80, 0.35, 4.4, 0.40, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          // East Window Connected Minecraft Glass (Full 4.4 span from y: 97.8 to 102.2)
          drawMinecraftConnectedGlassWindow(14.6, 97.8, 0.80, 0.35, 4.4, 1.00, false, world.wallAlphaMinecraft);
          ctx.restore();
        }
      });

      // 2E. Camera-Facing South Wall & SW/SE Pillars (y: 102.2..103.1) — Supports wallAlphaMinecraft
      list.push({
        xMin: 8.9, xMax: 15.1, yMin: 102.2, yMax: 103.1,
        draw: () => {
          ctx.save();
          if (world.wallAlphaMinecraft < 0.99) ctx.globalAlpha = world.wallAlphaMinecraft;
          // SW Log Pillar
          models.drawBox(ctx, 9.0, 102.2, 0, 0.8, 0.8, 2.20, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy);
          // SE Log Pillar
          models.drawBox(ctx, 14.2, 102.2, 0, 0.8, 0.8, 2.20, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy);
          // Lower Solid Planks
          models.drawBox(ctx, 9.8, 102.6, 0, 4.4, 0.35, 0.80, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          // Upper Solid Planks
          models.drawBox(ctx, 9.8, 102.6, 1.80, 4.4, 0.35, 0.40, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          // South Window Connected Minecraft Glass (Full 4.4 span from x: 9.8 to 14.2)
          drawMinecraftConnectedGlassWindow(9.8, 102.6, 0.80, 4.4, 0.35, 1.00, true, world.wallAlphaMinecraft);
          ctx.restore();
        }
      });

      // 3. Rectangular Minecraft Farmland (x: 16..20, y: 97..102)
      // Authentic Minecraft Pumpkins & Crops cleanly decoupled from perimeter fences!

      // 3A. North & East Back Perimeter Fences (Placed cleanly outside crop tiles at y=96.6 & x=20.0)
      list.push({
        xMin: 15.5, xMax: 20.2, yMin: 96.4, yMax: 96.8,
        draw: () => {
          // North perimeter fence posts & rails
          models.drawBox(ctx, 15.6, 96.6, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 17.8, 96.6, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 20.0, 96.6, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 15.64, 96.64, 0.25, 4.36, 0.10, 0.10, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 15.64, 96.64, 0.50, 4.36, 0.10, 0.10, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
        }
      });
      list.push({
        xMin: 19.8, xMax: 20.3, yMin: 96.6, yMax: 102.2,
        draw: () => {
          // East perimeter fence posts & rails
          models.drawBox(ctx, 20.0, 96.6, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 20.0, 99.3, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 20.0, 102.0, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 20.04, 96.64, 0.25, 0.10, 5.36, 0.10, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 20.04, 96.64, 0.50, 0.10, 5.36, 0.10, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
        }
      });

      // 3B. Helper: Authentic Minecraft Pumpkin Modeling
      const drawMinecraftPumpkin = (gx, gy, gz = 0.08, hasFace = false) => {
        const pSize = 0.56;
        const x0 = gx - pSize / 2;
        const y0 = gy - pSize / 2;
        // Orange Pumpkin Block
        models.drawBox(
          ctx, x0, y0, gz,
          pSize, pSize, pSize,
          '#f97316', '#ea580c', '#c2410c',
          world.ox, world.oy
        );
        // Dark Green Top Stem
        models.drawBox(
          ctx, gx - 0.07, gy - 0.07, gz + pSize,
          0.14, 0.14, 0.12,
          '#65a30d', '#4d7c0f', '#365314',
          world.ox, world.oy
        );
        // Subtle vertical segment seams on the left and right visible faces
        const leftMid = isoToScreen(gx, y0 + pSize, gz + pSize * 0.5, world.ox, world.oy);
        ctx.strokeStyle = 'rgba(154, 52, 18, 0.45)';
        ctx.lineWidth = 0.8;
        const pTop = isoToScreen(gx, y0 + pSize, gz + pSize, world.ox, world.oy);
        const pBot = isoToScreen(gx, y0 + pSize, gz, world.ox, world.oy);
        ctx.beginPath(); ctx.moveTo(pTop.x, pTop.y); ctx.lineTo(pBot.x, pBot.y); ctx.stroke();

        // Iconic Minecraft Carved Face (Jack-o'-Lantern) on South-West front face
        if (hasFace) {
          const ep1 = isoToScreen(gx - 0.14, y0 + pSize + 0.01, gz + pSize * 0.62, world.ox, world.oy);
          const ep2 = isoToScreen(gx + 0.14, y0 + pSize + 0.01, gz + pSize * 0.62, world.ox, world.oy);
          const mp = isoToScreen(gx, y0 + pSize + 0.01, gz + pSize * 0.25, world.ox, world.oy);
          ctx.save();
          ctx.fillStyle = '#1e1b4b';
          ctx.fillRect(ep1.x - 2.5, ep1.y - 2.5, 4.5, 4.5);
          ctx.fillRect(ep2.x - 2.5, ep2.y - 2.5, 4.5, 4.5);
          ctx.fillRect(mp.x - 5.5, mp.y - 2, 11, 3.5);
          ctx.restore();
        }
      };

      const drawWheat = (gx, gy, gz = 0.08) => {
        models.drawBox(ctx, gx - 0.22, gy - 0.22, gz, 0.44, 0.44, 0.36, '#eab308', '#ca8a04', '#a16207', world.ox, world.oy);
      };

      const drawCarrot = (gx, gy, gz = 0.08) => {
        models.drawBox(ctx, gx - 0.22, gy - 0.22, gz, 0.44, 0.44, 0.32, '#22c55e', '#16a34a', '#15803d', world.ox, world.oy);
      };

      // Crop Rows (Decomposed per row with tight bounds, xMin >= 16.2 completely clear of west fence at x=15.6!)
      // Row 1: y = 97.5
      list.push({
        xMin: 16.2, xMax: 19.8, yMin: 97.2, yMax: 97.8,
        draw: () => {
          drawMinecraftPumpkin(16.5, 97.5, 0.08, false);
          drawWheat(17.5, 97.5, 0.08);
          drawMinecraftPumpkin(18.5, 97.5, 0.08, true);
          drawWheat(19.5, 97.5, 0.08);
        }
      });

      // Row 2: y = 98.5
      list.push({
        xMin: 16.2, xMax: 19.8, yMin: 98.2, yMax: 98.8,
        draw: () => {
          drawCarrot(16.5, 98.5, 0.08);
          drawMinecraftPumpkin(17.5, 98.5, 0.08, false);
          drawCarrot(19.5, 98.5, 0.08);
        }
      });

      // Row 3: y = 100.5
      list.push({
        xMin: 16.2, xMax: 19.8, yMin: 100.2, yMax: 100.8,
        draw: () => {
          drawMinecraftPumpkin(16.5, 100.5, 0.08, true);
          drawWheat(17.5, 100.5, 0.08);
          drawMinecraftPumpkin(19.5, 100.5, 0.08, false);
        }
      });

      // Row 4: y = 101.5
      list.push({
        xMin: 16.2, xMax: 19.8, yMin: 101.2, yMax: 101.8,
        draw: () => {
          drawWheat(16.5, 101.5, 0.08);
          drawMinecraftPumpkin(17.5, 101.5, 0.08, false);
          drawWheat(18.5, 101.5, 0.08);
          drawCarrot(19.5, 101.5, 0.08);
        }
      });

      // 3C. South & West Perimeter Fences (Placed at x=15.6 & y=102.0, zero clipping with crops!)
      list.push({
        xMin: 15.5, xMax: 20.2, yMin: 101.9, yMax: 102.3,
        draw: () => {
          // South perimeter fence posts & rails
          models.drawBox(ctx, 15.6, 102.0, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 17.8, 102.0, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 20.0, 102.0, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 15.64, 102.04, 0.25, 4.36, 0.10, 0.10, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 15.64, 102.04, 0.50, 4.36, 0.10, 0.10, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
        }
      });

      // West Perimeter Fence North Segment (x: 15.6, y: 96.6..98.6)
      list.push({
        xMin: 15.4, xMax: 15.8, yMin: 96.5, yMax: 98.7,
        draw: () => {
          models.drawBox(ctx, 15.6, 96.6, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 15.6, 98.6, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 15.64, 96.64, 0.25, 0.10, 2.00, 0.10, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 15.64, 96.64, 0.50, 0.10, 2.00, 0.10, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
        }
      });

      // West Perimeter Fence South Segment (x: 15.6, y: 100.2..102.0, gate opening at y: 98.6..100.2 is wide open!)
      list.push({
        xMin: 15.4, xMax: 15.8, yMin: 100.1, yMax: 102.3,
        draw: () => {
          models.drawBox(ctx, 15.6, 100.2, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 15.6, 102.0, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 15.64, 100.24, 0.25, 0.10, 1.80, 0.10, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 15.64, 100.24, 0.50, 0.10, 1.80, 0.10, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
        }
      });

      // 4. Living Animated Minecraft Sheep (Wanders peacefully, grazes grass, authentic face & eyes!)
      list.push({
        get xMin() { return (world.minecraftSheep ? world.minecraftSheep.x : 12.0) - 0.7; },
        get xMax() { return (world.minecraftSheep ? world.minecraftSheep.x : 12.0) + 0.7; },
        get yMin() { return (world.minecraftSheep ? world.minecraftSheep.y : 105.0) - 0.7; },
        get yMax() { return (world.minecraftSheep ? world.minecraftSheep.y : 105.0) + 0.7; },
        draw: () => {
          // Initialize persistent sheep state on world engine
          if (!world.minecraftSheep) {
            world.minecraftSheep = {
              x: 12.0,
              y: 105.2,
              targetX: 12.0,
              targetY: 105.2,
              state: 'grazing', // 'grazing', 'idle', 'walking'
              timer: 3.5,
              facing: 'south_west',
              walkTimer: 0,
              headAngle: 0.85,
              bubbleText: '',
              bubbleTimer: 0
            };
          }
          const sheep = world.minecraftSheep;
          const dt = 0.016; // Standard frame tick approximation

          // Behavior state machine
          sheep.timer -= dt;
          if (sheep.bubbleTimer > 0) sheep.bubbleTimer -= dt;

          if (sheep.state === 'grazing') {
            sheep.headAngle += (1.0 - sheep.headAngle) * 0.1;
            if (sheep.timer <= 0) {
              sheep.state = Math.random() < 0.4 ? 'idle' : 'walking';
              if (sheep.state === 'walking') {
                sheep.targetX = 11.2 + Math.random() * 2.2;
                sheep.targetY = 104.5 + Math.random() * 2.2;
                sheep.facing = (sheep.targetX - sheep.x > (sheep.targetY - sheep.y)) ? 'south_east' : 'south_west';
              }
              sheep.timer = 3.0 + Math.random() * 3.0;
            }
          } else if (sheep.state === 'idle') {
            sheep.headAngle += (0.0 - sheep.headAngle) * 0.1;
            if (sheep.timer <= 0) {
              sheep.state = 'walking';
              sheep.targetX = 11.2 + Math.random() * 2.2;
              sheep.targetY = 104.5 + Math.random() * 2.2;
              sheep.facing = (sheep.targetX - sheep.x > (sheep.targetY - sheep.y)) ? 'south_east' : 'south_west';
              sheep.timer = 4.0;
            }
          } else if (sheep.state === 'walking') {
            sheep.headAngle += (0.05 - sheep.headAngle) * 0.1;
            const dx = sheep.targetX - sheep.x;
            const dy = sheep.targetY - sheep.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 0.08) {
              const speed = 0.55 * dt;
              sheep.x += (dx / dist) * speed;
              sheep.y += (dy / dist) * speed;
              sheep.walkTimer += dt * 8;
            } else {
              sheep.state = 'grazing';
              sheep.timer = 4.0 + Math.random() * 4.0;
            }
          }

          const sx = sheep.x;
          const sy = sheep.y;
          const isWalking = sheep.state === 'walking';
          const legSwing = isWalking ? Math.sin(sheep.walkTimer) * 0.08 : 0;
          const chewOffset = (sheep.state === 'grazing') ? Math.sin(performance.now() * 0.012) * 0.015 : 0;

          // 1. Four Blocky Minecraft Sheep Legs (Tan skin with dark hooves)
          const legW = 0.16;
          const legH = 0.42;
          const hoofH = 0.10;
          const legSkinT = '#c49c7d';
          const legSkinL = '#bfa085';
          const legSkinR = '#ad8e75';
          const hoofT = '#4a382a';
          const hoofL = '#3f3024';
          const hoofR = '#2a1f17';

          // Helper to draw one authentic two-tone leg (tan skin upper + dark hoof base)
          const drawLeg = (lx, ly, swing) => {
            const curY = ly + swing;
            // Dark Hoof Base (z: 0 to 0.10)
            models.drawBox(ctx, lx, curY, 0, legW, legW, hoofH, hoofT, hoofL, hoofR, world.ox, world.oy);
            // Tan Skin Upper Leg (z: 0.10 to 0.42)
            models.drawBox(ctx, lx, curY, hoofH, legW, legW, legH - hoofH, legSkinT, legSkinL, legSkinR, world.ox, world.oy);
          };

          // Back Legs
          drawLeg(sx - 0.30, sy - 0.34, -legSwing); // Back-Left
          drawLeg(sx + 0.14, sy - 0.34, legSwing);  // Back-Right

          // Front Legs
          drawLeg(sx - 0.30, sy + 0.20, legSwing);  // Front-Left
          drawLeg(sx + 0.14, sy + 0.20, -legSwing); // Front-Right

          // 2. Volumetric White Wool Body (0.78 x 1.00 x 0.66)
          models.drawBox(ctx, sx - 0.39, sy - 0.50, 0.40, 0.78, 1.00, 0.66, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);

          // Subtle Minecraft Pixelated Wool Shading (soft authentic blocky texture)
          const woolPatch0 = isoToScreen(sx - 0.20, sy - 0.20, 1.06, world.ox, world.oy);
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(woolPatch0.x - 5, woolPatch0.y - 2, 7, 5);
          const woolPatch1 = isoToScreen(sx + 0.10, sy + 0.15, 1.06, world.ox, world.oy);
          ctx.fillRect(woolPatch1.x - 3, woolPatch1.y - 2, 6, 4);

          // Tiny Wool Tail at the Back Center
          const tailWag = Math.sin(performance.now() * 0.006) * 0.02;
          models.drawBox(ctx, sx - 0.07 + tailWag, sy - 0.54, 0.82, 0.14, 0.08, 0.14, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);

          // 3. Authentic Minecraft Sheep Head & Wool Hood
          // Dynamic Head Elevation: Held high and level when standing/walking; lowered to grass when grazing!
          const headZ = (0.68 * (1 - sheep.headAngle) + 0.16 * sheep.headAngle) + chewOffset;
          const headY = sy + 0.32 + sheep.headAngle * 0.16;
          const headX = sx - 0.19;
          const hW = 0.38; // Width along X
          const hL = 0.44; // Length along Y
          const hH = 0.38; // Height along Z

          // Base Head Box (Top face: White Wool Hood; Right face: shaded side; Left/Front: face base)
          models.drawBox(
            ctx, headX, headY, headZ,
            hW, hL, hH,
            '#f8fafc', // Top: 100% Authentic White Wool Hood!
            '#c49c7d', // Left (+Y): Tan Skin Face Base
            '#cbd5e1', // Right (+X): Wool Side Hood
            world.ox, world.oy
          );

          // Head Side Face (+X face): Front 40% is Tan Skin; Back 60% is White Wool Hood
          const sideSkinY0 = headY + hL * 0.55;
          const sideSkinY1 = headY + hL;
          const sp0 = isoToScreen(headX + hW, sideSkinY0, headZ, world.ox, world.oy);
          const sp1 = isoToScreen(headX + hW, sideSkinY1, headZ, world.ox, world.oy);
          const sp2 = isoToScreen(headX + hW, sideSkinY1, headZ + hH * 0.65, world.ox, world.oy);
          const sp3 = isoToScreen(headX + hW, sideSkinY0, headZ + hH * 0.65, world.ox, world.oy);
          ctx.fillStyle = '#ad8e75'; // Tan skin on front half of side head
          ctx.beginPath();
          ctx.moveTo(sp0.x, sp0.y); ctx.lineTo(sp1.x, sp1.y);
          ctx.lineTo(sp2.x, sp2.y); ctx.lineTo(sp3.x, sp3.y);
          ctx.closePath();
          ctx.fill();

          // Side Eye Wrap (White sclera wraps around the +X corner)
          const sew0 = isoToScreen(headX + hW, headY + hL * 0.84, headZ + hH * 0.44, world.ox, world.oy);
          const sew1 = isoToScreen(headX + hW, sideSkinY1, headZ + hH * 0.44, world.ox, world.oy);
          const sew2 = isoToScreen(headX + hW, sideSkinY1, headZ + hH * 0.66, world.ox, world.oy);
          const sew3 = isoToScreen(headX + hW, headY + hL * 0.84, headZ + hH * 0.66, world.ox, world.oy);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(sew0.x, sew0.y); ctx.lineTo(sew1.x, sew1.y);
          ctx.lineTo(sew2.x, sew2.y); ctx.lineTo(sew3.x, sew3.y);
          ctx.closePath();
          ctx.fill();

          // Front Face (+Y face at fy = headY + hL, facing South-West directly toward the camera!)
          const fy = headY + hL;

          // 1. Forehead Wool Fringe (Top 35% of front face is thick white fleece)
          const wfTopL = isoToScreen(headX, fy, headZ + hH, world.ox, world.oy);
          const wfTopR = isoToScreen(headX + hW, fy, headZ + hH, world.ox, world.oy);
          const wfBotR = isoToScreen(headX + hW, fy, headZ + hH * 0.65, world.ox, world.oy);
          const wfBotL = isoToScreen(headX, fy, headZ + hH * 0.65, world.ox, world.oy);
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.moveTo(wfTopL.x, wfTopL.y); ctx.lineTo(wfTopR.x, wfTopR.y);
          ctx.lineTo(wfBotR.x, wfBotR.y); ctx.lineTo(wfBotL.x, wfBotL.y);
          ctx.closePath();
          ctx.fill();

          // 2. Eyes (Positioned right at the two outer lateral edges, below forehead wool)
          // Left Eye (-X corner): Outer white sclera + Inner black pupil
          const leW0 = isoToScreen(headX, fy, headZ + hH * 0.44, world.ox, world.oy);
          const leW1 = isoToScreen(headX + hW * 0.16, fy, headZ + hH * 0.44, world.ox, world.oy);
          const leW2 = isoToScreen(headX + hW * 0.16, fy, headZ + hH * 0.66, world.ox, world.oy);
          const leW3 = isoToScreen(headX, fy, headZ + hH * 0.66, world.ox, world.oy);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(leW0.x, leW0.y); ctx.lineTo(leW1.x, leW1.y);
          ctx.lineTo(leW2.x, leW2.y); ctx.lineTo(leW3.x, leW3.y);
          ctx.closePath();
          ctx.fill();

          const leB0 = isoToScreen(headX + hW * 0.14, fy, headZ + hH * 0.44, world.ox, world.oy);
          const leB1 = isoToScreen(headX + hW * 0.28, fy, headZ + hH * 0.44, world.ox, world.oy);
          const leB2 = isoToScreen(headX + hW * 0.28, fy, headZ + hH * 0.66, world.ox, world.oy);
          const leB3 = isoToScreen(headX + hW * 0.14, fy, headZ + hH * 0.66, world.ox, world.oy);
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.moveTo(leB0.x, leB0.y); ctx.lineTo(leB1.x, leB1.y);
          ctx.lineTo(leB2.x, leB2.y); ctx.lineTo(leB3.x, leB3.y);
          ctx.closePath();
          ctx.fill();

          // Right Eye (+X corner): Inner black pupil + Outer white sclera
          const reB0 = isoToScreen(headX + hW * 0.72, fy, headZ + hH * 0.44, world.ox, world.oy);
          const reB1 = isoToScreen(headX + hW * 0.86, fy, headZ + hH * 0.44, world.ox, world.oy);
          const reB2 = isoToScreen(headX + hW * 0.86, fy, headZ + hH * 0.66, world.ox, world.oy);
          const reB3 = isoToScreen(headX + hW * 0.72, fy, headZ + hH * 0.66, world.ox, world.oy);
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.moveTo(reB0.x, reB0.y); ctx.lineTo(reB1.x, reB1.y);
          ctx.lineTo(reB2.x, reB2.y); ctx.lineTo(reB3.x, reB3.y);
          ctx.closePath();
          ctx.fill();

          const reW0 = isoToScreen(headX + hW * 0.84, fy, headZ + hH * 0.44, world.ox, world.oy);
          const reW1 = isoToScreen(headX + hW, fy, headZ + hH * 0.44, world.ox, world.oy);
          const reW2 = isoToScreen(headX + hW, fy, headZ + hH * 0.66, world.ox, world.oy);
          const reW3 = isoToScreen(headX + hW * 0.84, fy, headZ + hH * 0.66, world.ox, world.oy);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(reW0.x, reW0.y); ctx.lineTo(reW1.x, reW1.y);
          ctx.lineTo(reW2.x, reW2.y); ctx.lineTo(reW3.x, reW3.y);
          ctx.closePath();
          ctx.fill();

          // 3. Pink Minecraft Sheep Snout / Nose (Centered on lower face)
          const sntX0 = headX + hW * 0.32;
          const sntX1 = headX + hW * 0.68;
          const sntZ0 = headZ + hH * 0.10;
          const sntZ1 = headZ + hH * 0.38;
          const snt0 = isoToScreen(sntX0, fy, sntZ0, world.ox, world.oy);
          const snt1 = isoToScreen(sntX1, fy, sntZ0, world.ox, world.oy);
          const snt2 = isoToScreen(sntX1, fy, sntZ1, world.ox, world.oy);
          const snt3 = isoToScreen(sntX0, fy, sntZ1, world.ox, world.oy);
          ctx.fillStyle = '#c87582'; // Natural authentic Minecraft sheep nose pink
          ctx.beginPath();
          ctx.moveTo(snt0.x, snt0.y); ctx.lineTo(snt1.x, snt1.y);
          ctx.lineTo(snt2.x, snt2.y); ctx.lineTo(snt3.x, snt3.y);
          ctx.closePath();
          ctx.fill();

          // Subtle Nostril / Mouth Line
          const mth0 = isoToScreen(headX + hW * 0.38, fy, headZ + hH * 0.12, world.ox, world.oy);
          const mth1 = isoToScreen(headX + hW * 0.62, fy, headZ + hH * 0.12, world.ox, world.oy);
          ctx.strokeStyle = '#834550';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(mth0.x, mth0.y); ctx.lineTo(mth1.x, mth1.y);
          ctx.stroke();

          // Grazing Grass Particles (when actively eating grass)
          if (sheep.state === 'grazing' && Math.sin(performance.now() * 0.01) > 0.3) {
            const gp = isoToScreen(headX + hW * 0.5, fy + 0.06, headZ, world.ox, world.oy);
            ctx.fillStyle = '#84cc16';
            ctx.fillRect(gp.x - 2, gp.y - 1, 2.5, 2.5);
            ctx.fillRect(gp.x + 3, gp.y - 3, 2, 2);
          }

          // Floating Speech Bubble when Bleating
          if (sheep.bubbleTimer > 0 && sheep.bubbleText) {
            const bp = isoToScreen(sx, sy, 1.45, world.ox, world.oy);
            ctx.save();
            ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            const tw = ctx.measureText(sheep.bubbleText).width;
            const bw = tw + 16;
            const bh = 22;
            const bx = bp.x - bw / 2;
            const by = bp.y - bh - 6;

            ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
            ctx.strokeStyle = '#84cc16';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.roundRect(bx, by, bw, bh, 6);
            ctx.fill();
            ctx.stroke();

            // Downward pointer arrow
            ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
            ctx.beginPath();
            ctx.moveTo(bp.x - 4, by + bh);
            ctx.lineTo(bp.x + 4, by + bh);
            ctx.lineTo(bp.x, by + bh + 5);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#f8fafc';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(sheep.bubbleText, bp.x, by + bh / 2);
            ctx.restore();
          }
        }
      });

      // 5. Blocky Minecraft Oak Tree (at x: 7.8, y: 106.0)
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
