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
      nav.setBlock(6.0, 93.6, 6.75, 0.8, true);      // West Northern Fence, Cliff & West Gateway Pillar (x: 6.0..12.75)
      nav.setBlock(15.25, 93.6, 6.75, 0.8, true);    // East Northern Fence, Cliff & East Gateway Pillar (x: 15.25..22.0)

      // 3. Minecraft Island Perimeter Fences (West x=6.0, East x=22.0, South y=111.0)
      nav.setBlock(5.8, 94.0, 0.5, 17.2, true);      // West Cliff Fence (x: 5.8..6.3, y: 94..111.2)
      nav.setBlock(21.8, 94.0, 0.5, 5.0, true);      // East Cliff Fence North (y: 94..99)
      nav.setBlock(21.8, 101.0, 0.5, 10.2, true);    // East Cliff Fence South (y: 101..111.2)
      nav.setBlock(6.0, 110.7, 16.0, 0.5, true);     // South Cliff Fence (x: 6..22, y: 110.7..111.2)

      // 4. Void Chasm Outer Boundaries & Inter-Island Abyss Gaps
      nav.setBlock(0.0, 93.0, 5.8, 20.0, true);      // Flanking Void West of Minecraft Island
      nav.setBlock(22.2, 93.0, 3.6, 6.0, true);      // Void Chasm between islands North of bridge (y: 93..99)
      nav.setBlock(22.2, 101.4, 3.6, 10.0, true);    // Void Chasm between islands South of bridge (y: 101.4..111.4)
      nav.setBlock(49.2, 93.0, 4.8, 20.0, true);     // Flanking Void East of Pokemon Island
      nav.setBlock(0.0, 111.2, 54.0, 2.0, true);     // Flanking Void South of all Islands

      // 5. Connecting Skybridge to Pokémon Island (x: 22.0..26.0, y: 99..101)
      nav.setBlock(22.0, 98.6, 4.0, 0.4, true);      // Bridge North Railing (y = 98.6..99.0)
      nav.setBlock(22.0, 101.0, 4.0, 0.4, true);     // Bridge South Railing (y = 101.0..101.4)

      // 6. Symmetrical Bridge Artifacts along Centerline x: 14.0
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
      // D. MINECRAFT ISLAND INTERIOR OBSTACLES (x: 6..22, y: 93..111)
      // Fully decluttered: spacious central avenue & smooth front-to-back pass-through!
      // ======================================================================
      // Oak Wood Cabin (x: 9..15, y: 97..103, front door at y: 97, matching back door at y: 103!)
      nav.setBlock(9.0, 96.8, 3.8, 0.5, true);    // North Wall Left (x: 9..12.8)
      nav.setBlock(14.2, 96.8, 0.8, 0.5, true);   // North Wall Right Pillar (x: 14.2..15)
      nav.setBlock(8.8, 97.0, 0.5, 6.0, true);    // West Wall (x: 8.8..9.3, y: 97..103)
      nav.setBlock(14.7, 97.0, 0.5, 6.0, true);   // East Wall (x: 14.7..15.2, y: 97..103)
      nav.setBlock(9.0, 102.3, 3.8, 0.5, true);   // South Wall Left (x: 9..12.8)
      nav.setBlock(14.2, 102.3, 0.8, 0.5, true);  // South Wall Right Pillar (x: 14.2..15)
      // Note: Doorway at x: 12.8..14.2 is 100% open at both front and back!

      // Cabin Furniture Obstacles (Neatly arranged along back & side walls)
      nav.setBlock(9.6, 97.5, 0.9, 0.9, true);    // Large Wooden Storage Chest (x: 9.8)
      nav.setBlock(10.6, 97.5, 0.9, 0.9, true);   // Crafting Table (x: 10.7)
      nav.setBlock(11.5, 97.5, 0.9, 0.9, true);   // Furnace (x: 11.6)
      nav.setBlock(9.6, 99.3, 1.4, 2.1, true);    // Minecraft Red Bed (x: 9.8, y: 99.5)

      // Farmland Fences placed neatly at x: 16.0..20.0 (leaving 2.0-tile wide passage to bridge on East!)
      nav.setBlock(16.0, 96.4, 4.0, 0.4, true);   // North Fence (y = 96.6)
      nav.setBlock(19.8, 96.6, 0.4, 5.0, true);   // East Fence (x = 20.0)
      nav.setBlock(16.0, 101.4, 4.0, 0.4, true);  // South Fence (y = 101.4)
      nav.setBlock(16.0, 96.6, 0.4, 1.4, true);   // West Fence Top (y: 96.6..98.0)
      nav.setBlock(16.0, 100.0, 0.4, 1.4, true);  // West Fence Bottom (y: 100.0..101.4, spacious 2.0-tile gate open at 98.0..100.0!)

      // Oak Tree Trunk (placed on west fringe leaving central lawn unobstructed)
      nav.setBlock(6.8, 106.5, 1.0, 1.0, true);

      // ======================================================================
      // E. POKÉMON SANCTUARY & CENTER (x: 25.8..49.2, y: 93..111)
      // ======================================================================
      // 1. Perimeter Fences & Cliff Boundaries
      nav.setBlock(25.8, 93.0, 23.4, 0.8, true);   // North Perimeter Fence (y = 93.0)
      nav.setBlock(48.8, 93.0, 0.5, 18.2, true);   // East Perimeter Fence (x = 48.8..49.2)
      nav.setBlock(25.8, 110.8, 23.4, 0.8, true);  // South Perimeter Fence (y = 110.8..111.2)
      nav.setBlock(25.8, 93.0, 0.5, 6.0, true);    // West Perimeter Fence North (y: 93..99)
      nav.setBlock(25.8, 101.0, 0.5, 10.0, true);  // West Perimeter Fence South (y: 101..111)

      // 2. Pokémon Center Architectural Walls (x: 34..42, y: 94..98.5)
      nav.setBlock(34.0, 93.8, 8.0, 0.5, true);    // North Wall (y = 93.8..94.2)
      nav.setBlock(33.8, 94.0, 0.5, 4.4, true);    // West Wall (x = 33.8..34.2)
      nav.setBlock(41.8, 94.0, 0.5, 4.4, true);    // East Wall (x = 41.8..42.2)
      nav.setBlock(34.0, 98.1, 3.0, 0.4, true);    // South Wall Left (x: 34..37)
      nav.setBlock(39.0, 98.1, 3.0, 0.4, true);    // South Wall Right (x: 39..42)
      // Wide automatic sliding door opening at x: 37.0..39.0 at y: 98.1 is 100% WALKABLE!

      // 3. Pokémon Center Interior Furniture
      nav.setBlock(37.0, 94.9, 3.0, 0.9, true);    // Center Healing Counter & 6-Ball Recovery Station (ix: 37..39 only; ix: 35 & 36 100% CLEAR!)
      nav.setBlock(40.5, 94.9, 1.3, 0.9, true);    // Corner PC Storage Terminal (ix: 40..41 only)
      nav.setBlock(34.1, 96.1, 0.9, 1.5, true);    // Plush Waiting Lounge Sofa along west wall (ix: 34 only!)

      // 4. Pokémon Creatures Obstacles
      nav.setBlock(43.6, 103.5, 2.8, 2.0, true);   // Snoozing Snorlax on Eastern Lawn (Immense Body)
      nav.setBlock(32.1, 100.6, 0.8, 0.8, true);   // Pokémon Quest Eevee on Western Lawn
      nav.setBlock(34.1, 107.1, 0.8, 0.8, true);   // Pokémon Quest Jolteon on SW Lawn
      nav.setBlock(42.6, 100.6, 0.8, 0.8, true);   // Pokémon Quest Flareon on East Lawn
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
        xMin: 6.0, xMax: 12.2, yMin: 93.8, yMax: 94.2,
        draw: () => drawFenceSegment(6.0, 12.1, 94.0)
      });
      list.push({
        xMin: 15.8, xMax: 22.0, yMin: 93.8, yMax: 94.2,
        draw: () => drawFenceSegment(15.9, 21.8, 94.0)
      });

      // 2. West Cliff Fence (x = 6.0, y: 94..111)
      list.push({
        xMin: 5.8, xMax: 6.3, yMin: 94.0, yMax: 111.0,
        draw: () => drawFenceSegmentY(6.0, 94.0, 111.0)
      });

      // 3. East Cliff Fence North (x = 21.8, y: 94..99)
      list.push({
        xMin: 21.5, xMax: 22.1, yMin: 94.0, yMax: 99.0,
        draw: () => drawFenceSegmentY(21.8, 94.0, 99.0)
      });

      // 3B. East Cliff Fence South (x = 21.8, y: 101..111)
      list.push({
        xMin: 21.5, xMax: 22.1, yMin: 101.0, yMax: 111.0,
        draw: () => drawFenceSegmentY(21.8, 101.0, 111.0)
      });

      // 4. South Cliff Fence (y = 111.0, x: 6..22)
      list.push({
        xMin: 6.0, xMax: 22.0, yMin: 110.8, yMax: 111.2,
        draw: () => drawFenceSegment(6.0, 21.8, 111.0)
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

      // Helper: Authentic Dynamic Minecraft Oak Door with Auto Open/Close Swing
      // Features: Oak wood door leaf (with 4 upper peek windows in 2x2 grid, 4 lower recessed panels, iron latch)
      // Swings smoothly between closed (flush across doorway along X) and open (90° inward against inner left jamb along Y).
      const drawMinecraftOakDoor = (doorX, doorY, doorZ, isSouthFacing = false, alpha = 1.0, openProgress = 0.0) => {
        ctx.save();
        if (alpha < 0.99) ctx.globalAlpha = alpha;

        const jambW = 0.12;
        const doorW = 1.16;   // Door leaf width along length
        const doorT = 0.08;   // Door leaf thickness
        const doorH = 1.95;   // Height of Minecraft door (2 blocks high)

        // 1. Left and Right Door Jamb Trims
        models.drawBox(ctx, doorX, doorY, doorZ, jambW, 0.35, 1.95, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy);
        models.drawBox(ctx, doorX + 1.40 - jambW, doorY, doorZ, jambW, 0.35, 1.95, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy);

        // 2. Dynamic Rotated Door Leaf
        const prog = Math.max(0, Math.min(1, openProgress));
        // Swing angle:
        // North door swings into cabin (+Y): angle 0 -> +PI/2
        // South door swings into cabin (-Y): angle 0 -> -PI/2
        const angle = (isSouthFacing ? -prog : prog) * (Math.PI / 2);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        // Hinge anchor (inner edge of left jamb)
        const hx = doorX + jambW;
        const hy = isSouthFacing ? (doorY + 0.35 - 0.04) : (doorY + 0.04);
        const hz = doorZ;

        // Direction vectors
        const ux = doorW * cos, uy = doorW * sin;
        const vx = isSouthFacing ? (doorT * sin) : (-doorT * sin);
        const vy = isSouthFacing ? (-doorT * cos) : (doorT * cos);

        // 4 Base corners & 4 Top corners
        const p0 = isoToScreen(hx, hy, hz, world.ox, world.oy);
        const p1 = isoToScreen(hx + ux, hy + uy, hz, world.ox, world.oy);
        const p2 = isoToScreen(hx + ux + vx, hy + uy + vy, hz, world.ox, world.oy);
        const p3 = isoToScreen(hx + vx, hy + vy, hz, world.ox, world.oy);

        const q0 = isoToScreen(hx, hy, hz + doorH, world.ox, world.oy);
        const q1 = isoToScreen(hx + ux, hy + uy, hz + doorH, world.ox, world.oy);
        const q2 = isoToScreen(hx + ux + vx, hy + uy + vy, hz + doorH, world.ox, world.oy);
        const q3 = isoToScreen(hx + vx, hy + vy, hz + doorH, world.ox, world.oy);

        const cross2d = (a, b, c) => (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);

        const drawPoly = (pts, fillCol, strokeCol = null) => {
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
          ctx.closePath();
          ctx.fillStyle = fillCol;
          ctx.fill();
          if (strokeCol) {
            ctx.strokeStyle = strokeCol;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        };

        // Screen projection of surface point on front/back face
        const getPointOnFace = (u, v, isBackFace = false) => {
          const gx = hx + u * ux + (isBackFace ? vx : 0);
          const gy = hy + u * uy + (isBackFace ? vy : 0);
          const gz = hz + v * doorH;
          return isoToScreen(gx, gy, gz, world.ox, world.oy);
        };

        const drawDoorFaceDetails = (isBackFace = false) => {
          // Upper Cutout Peek Windows (4 windows in 2x2 grid)
          const winCols = [[0.15, 0.46], [0.54, 0.85]];
          const winRows = [[0.74, 0.90], [0.55, 0.71]];
          for (const [u1, u2] of winCols) {
            for (const [v1, v2] of winRows) {
              const wPts = [
                getPointOnFace(u1, v1, isBackFace),
                getPointOnFace(u2, v1, isBackFace),
                getPointOnFace(u2, v2, isBackFace),
                getPointOnFace(u1, v2, isBackFace)
              ];
              drawPoly(wPts, '#0f172a', '#1e293b');
            }
          }

          // Lower Recessed Wood Panels (4 panels in 2x2 grid)
          const panRows = [[0.29, 0.48], [0.08, 0.26]];
          for (const [u1, u2] of winCols) {
            for (const [v1, v2] of panRows) {
              const panPts = [
                getPointOnFace(u1, v1, isBackFace),
                getPointOnFace(u2, v1, isBackFace),
                getPointOnFace(u2, v2, isBackFace),
                getPointOnFace(u1, v2, isBackFace)
              ];
              drawPoly(panPts, '#8c6239', '#71421e');
            }
          }

          // Metal Latch / Handle
          const handlePts = [
            getPointOnFace(0.86, 0.47, isBackFace),
            getPointOnFace(0.95, 0.47, isBackFace),
            getPointOnFace(0.95, 0.53, isBackFace),
            getPointOnFace(0.86, 0.53, isBackFace)
          ];
          drawPoly(handlePts, '#64748b', '#334155');
        };

        // Determine face visibility with 2D cross products
        const fFront = cross2d(p0, q0, q1) > 0;
        const fLatch = cross2d(p1, q1, q2) > 0;
        const fBack  = cross2d(p2, q2, q3) > 0;
        const fHinge = cross2d(p3, q3, q0) > 0;

        // Render visible faces in correct painter's depth order
        // 1. Back face (if facing camera)
        if (fBack) {
          drawPoly([p2, q2, q3, p3], '#8c6239', '#71421e');
          drawDoorFaceDetails(true);
        }

        // 2. Hinge edge (if facing camera)
        if (fHinge) {
          drawPoly([p3, q3, q0, p0], '#784d28', '#5a3416');
        }

        // 3. Latch edge (if facing camera)
        if (fLatch) {
          drawPoly([p1, q1, q2, p2], '#9a6b3f', '#784d28');
        }

        // 4. Front face (if facing camera)
        if (fFront) {
          drawPoly([p0, q0, q1, p1], '#b88958', '#9a6b3f');
          drawDoorFaceDetails(false);
        }

        // 5. Top face (always visible from above)
        drawPoly([q0, q1, q2, q3], '#d4a373', '#b88958');

        ctx.restore();
      };

      // 2A. Back North Wall & NW/NE Pillars (y: 96.8..98.4, doorway at x: 12.8..14.2)
      list.push({
        xMin: 8.9, xMax: 15.1, yMin: 96.8, yMax: 98.4,
        draw: () => {
          // NW Log Pillar
          models.drawBox(ctx, 9.0, 97.0, 0, 0.8, 0.8, 2.20, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy);
          // NE Log Pillar
          models.drawBox(ctx, 14.2, 97.0, 0, 0.8, 0.8, 2.20, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy);
          // North Wall Solid Left (x: 9.8..12.8)
          models.drawBox(ctx, 9.8, 97.0, 0, 3.0, 0.35, 2.20, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          // North Doorway Overhead Lintel (x: 12.8..14.2)
          models.drawBox(ctx, 12.8, 97.0, 1.95, 1.4, 0.35, 0.25, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          // Authentic Minecraft Oak Door at North Entrance (smooth dynamic swing auto open/close)
          drawMinecraftOakDoor(12.8, 97.0, 0, false, 1.0, world.doorMinecraftNorthOpen || 0);

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

      // 2E. Camera-Facing South Wall & SW/SE Pillars (y: 101.15..103.1) — Supports wallAlphaMinecraft
      // Open back door at x: 12.8..14.2 allows smooth pass-through from front door straight into backyard!
      list.push({
        xMin: 8.9, xMax: 15.1, yMin: 101.15, yMax: 103.1,
        draw: () => {
          ctx.save();
          if (world.wallAlphaMinecraft < 0.99) ctx.globalAlpha = world.wallAlphaMinecraft;
          // SW Log Pillar
          models.drawBox(ctx, 9.0, 102.2, 0, 0.8, 0.8, 2.20, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy);
          // SE Log Pillar
          models.drawBox(ctx, 14.2, 102.2, 0, 0.8, 0.8, 2.20, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy);
          // Left Wall Section (x: 9.8..12.8) - Flush at y: 102.45
          // Lower Solid Planks
          models.drawBox(ctx, 9.8, 102.45, 0, 3.0, 0.35, 0.80, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          // Upper Solid Planks
          models.drawBox(ctx, 9.8, 102.45, 1.80, 3.0, 0.35, 0.40, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          // South Window Connected Minecraft Glass (Span x: 9.8 to 12.8)
          drawMinecraftConnectedGlassWindow(9.8, 102.45, 0.80, 3.0, 0.35, 1.00, true, world.wallAlphaMinecraft);
          // Upper Oak Lintel above Open Back Doorway (x: 12.8 to 14.2, z: 1.95..2.20)
          models.drawBox(ctx, 12.8, 102.45, 1.95, 1.4, 0.35, 0.25, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          // Authentic Minecraft Oak Door at South Exit (smooth dynamic swing auto open/close)
          drawMinecraftOakDoor(12.8, 102.45, 0, true, world.wallAlphaMinecraft, world.doorMinecraftSouthOpen || 0);
          ctx.restore();
        }
      });

      // 2F. Minecraft Sanctuary Oak Cabin Authentic Gabled Roof & Chimney (z: 2.20..3.85)
      // Elevated above interior walls (z: 2.20), smoothly fades to 0.0 when player enters cabin!
      list.push({
        xMin: 8.5, xMax: 15.5, yMin: 96.5, yMax: 103.3, z: 2.20,
        draw: () => {
          if (world.roofAlphaMinecraft <= 0.005) return;

          ctx.save();
          if (world.roofAlphaMinecraft < 0.99) ctx.globalAlpha = world.roofAlphaMinecraft;

          // Tier 1 (Lowest Eaves Overhang, z = 2.20..2.55)
          // West Eaves
          models.drawBox(ctx, 8.6, 96.6, 2.20, 1.8, 6.6, 0.35, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          // East Eaves
          models.drawBox(ctx, 13.6, 96.6, 2.20, 1.8, 6.6, 0.35, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          // North & South Cobblestone Eaves Trim
          models.drawBox(ctx, 8.6, 96.6, 2.20, 6.8, 0.40, 0.38, '#737373', '#525252', '#404040', world.ox, world.oy);
          models.drawBox(ctx, 8.6, 102.8, 2.20, 6.8, 0.40, 0.38, '#737373', '#525252', '#404040', world.ox, world.oy);

          // Tier 2 (Mid-slope Stairs, z = 2.55..2.90)
          // West Slope
          models.drawBox(ctx, 9.8, 96.6, 2.55, 1.4, 6.6, 0.35, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          // East Slope
          models.drawBox(ctx, 12.8, 96.6, 2.55, 1.4, 6.6, 0.35, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          // North & South Cobblestone Mid Trim
          models.drawBox(ctx, 9.8, 96.6, 2.55, 4.4, 0.40, 0.38, '#737373', '#525252', '#404040', world.ox, world.oy);
          models.drawBox(ctx, 9.8, 102.8, 2.55, 4.4, 0.40, 0.38, '#737373', '#525252', '#404040', world.ox, world.oy);

          // Tier 3 (Peak Roof Ridge Slabs, z = 2.90..3.25)
          // Central Peak Ridge
          models.drawBox(ctx, 10.8, 96.6, 2.90, 2.4, 6.6, 0.35, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          // North & South Cobblestone Peak Gable Cap
          models.drawBox(ctx, 10.8, 96.6, 2.90, 2.4, 0.40, 0.38, '#737373', '#525252', '#404040', world.ox, world.oy);
          models.drawBox(ctx, 10.8, 102.8, 2.90, 2.4, 0.40, 0.38, '#737373', '#525252', '#404040', world.ox, world.oy);

          // Cobblestone Chimney (x: 13.2..14.1, y: 97.4..98.3, z: 2.50..3.85)
          models.drawBox(ctx, 13.2, 97.4, 2.50, 0.90, 0.90, 1.25, '#737373', '#525252', '#404040', world.ox, world.oy);
          models.drawBox(ctx, 13.1, 97.3, 3.75, 1.10, 1.10, 0.15, '#525252', '#404040', '#262626', world.ox, world.oy);
          models.drawBox(ctx, 13.3, 97.5, 3.85, 0.70, 0.70, 0.05, '#0f172a', '#020617', '#000000', world.ox, world.oy);

          // Animated Cozy Campfire Smoke Particles drifting into the sky
          const smt = performance.now() * 0.0018;
          for (let s = 0; s < 3; s++) {
            const sp = (smt + s * 0.33) % 1.0;
            const sx = 13.65 + Math.sin(sp * 4 + s) * 0.15;
            const sy = 97.85 + Math.cos(sp * 3 + s) * 0.15;
            const sz = 3.90 + sp * 1.5;
            const smScreen = isoToScreen(sx, sy, sz, world.ox, world.oy);
            ctx.fillStyle = `rgba(226, 232, 240, ${(1.0 - sp) * 0.65})`;
            ctx.beginPath();
            ctx.arc(smScreen.x, smScreen.y, 4 + sp * 6, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      });

      // 3. Rectangular Minecraft Farmland (shifted to x: 16.0..20.0, y: 96.6..101.4)
      // Wide 2.0-tile avenue on east (x: 20.0..22.0) cleanly unblocks movement to the Skybridge!
      // Farmland soil (x: 17..19, y: 98..100) has an authentic 1-tile grass buffer from the perimeter fence!

      // 3A. North & East Back Perimeter Fences (x: 16.0..20.0)
      list.push({
        xMin: 15.9, xMax: 20.1, yMin: 96.4, yMax: 96.8,
        draw: () => {
          // North perimeter fence posts & rails
          models.drawBox(ctx, 16.0, 96.6, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 18.0, 96.6, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 20.0, 96.6, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 16.04, 96.64, 0.25, 3.96, 0.10, 0.10, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 16.04, 96.64, 0.50, 3.96, 0.10, 0.10, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
        }
      });
      list.push({
        xMin: 19.8, xMax: 20.2, yMin: 96.6, yMax: 101.6,
        draw: () => {
          // East perimeter fence posts & rails
          models.drawBox(ctx, 20.0, 96.6, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 20.0, 99.0, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 20.0, 101.4, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 20.04, 96.64, 0.25, 0.10, 4.76, 0.10, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 20.04, 96.64, 0.50, 0.10, 4.76, 0.10, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
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

      // Crop Rows (Decomposed per row with tight bounds, cleanly positioned inside x: 17.2..18.8, y: 98.2..100.2)
      // Row 1: y = 98.5
      list.push({
        xMin: 17.2, xMax: 18.8, yMin: 98.2, yMax: 98.8,
        draw: () => {
          drawMinecraftPumpkin(17.5, 98.5, 0.08, false);
          drawWheat(18.5, 98.5, 0.08);
        }
      });

      // Row 2: y = 99.5 (Water hole is at 18.0, 99.0)
      list.push({
        xMin: 17.2, xMax: 18.8, yMin: 99.2, yMax: 99.8,
        draw: () => {
          drawCarrot(17.5, 99.5, 0.08);
          drawMinecraftPumpkin(18.5, 99.5, 0.08, true);
        }
      });

      // Row 3: y = 100.2
      list.push({
        xMin: 17.2, xMax: 18.8, yMin: 99.9, yMax: 100.5,
        draw: () => {
          drawWheat(17.5, 100.2, 0.08);
          drawCarrot(18.5, 100.2, 0.08);
        }
      });

      // 3C. South & West Perimeter Fences (Placed at x: 16.0 & y: 101.4)
      list.push({
        xMin: 15.9, xMax: 20.1, yMin: 101.3, yMax: 101.7,
        draw: () => {
          // South perimeter fence posts & rails
          models.drawBox(ctx, 16.0, 101.4, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 18.0, 101.4, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 20.0, 101.4, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 16.04, 101.44, 0.25, 3.96, 0.10, 0.10, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 16.04, 101.44, 0.50, 3.96, 0.10, 0.10, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
        }
      });

      // West Perimeter Fence North Segment (x: 16.0, y: 96.6..98.0)
      list.push({
        xMin: 15.8, xMax: 16.2, yMin: 96.5, yMax: 98.1,
        draw: () => {
          models.drawBox(ctx, 16.0, 96.6, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 16.0, 98.0, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 16.04, 96.64, 0.25, 0.10, 1.36, 0.10, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 16.04, 96.64, 0.50, 0.10, 1.36, 0.10, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
        }
      });

      // West Perimeter Fence South Segment & Spacious Farm Gate (x: 16.0, y: 98.0..100.0, 2.0-tile wide entrance!)
      list.push({
        xMin: 15.8, xMax: 16.2, yMin: 97.9, yMax: 101.6,
        draw: () => {
          // Grand High-Clearance Gate Posts (Height 1.65, Width 2.0 tiles: y=98.0 to 100.0)
          models.drawBox(ctx, 16.0, 98.0, 0, 0.22, 0.22, 1.65, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy);
          models.drawBox(ctx, 16.0, 100.0, 0, 0.22, 0.22, 1.65, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy);
          // Overhead High Lintel (spanning across top at z = 1.65, plenty of headroom!)
          models.drawBox(ctx, 16.0, 98.0, 1.65, 0.22, 2.22, 0.20, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);

          // Warm Flickering Torches on both gateposts!
          const tpGate1 = isoToScreen(16.11, 98.11, 1.80, world.ox, world.oy);
          const tpGate2 = isoToScreen(16.11, 100.11, 1.80, world.ox, world.oy);
          ctx.save();
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 8;
          ctx.fillRect(tpGate1.x - 2, tpGate1.y - 2, 4, 4);
          ctx.fillRect(tpGate2.x - 2, tpGate2.y - 2, 4, 4);
          ctx.restore();

          // Fence post and rails towards south (y: 100.0..101.4)
          models.drawBox(ctx, 16.0, 101.4, 0, 0.18, 0.18, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 16.04, 100.04, 0.25, 0.10, 1.36, 0.10, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          models.drawBox(ctx, 16.04, 100.04, 0.50, 0.10, 1.36, 0.10, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
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

      // 5. Blocky Minecraft Oak Tree (at x: 6.8, y: 106.5)
      list.push({
        xMin: 6.0, xMax: 8.2, yMin: 105.5, yMax: 108.0,
        draw: () => {
          const tx = 6.8, ty = 106.5;
          models.drawBox(ctx, tx, ty, 0, 0.65, 0.65, 2.40, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy);
          models.drawBox(ctx, tx - 1.20, ty - 1.20, 2.00, 3.00, 3.00, 1.00, '#38a169', '#2f855a', '#22543d', world.ox, world.oy);
          models.drawBox(ctx, tx - 0.75, ty - 0.75, 3.00, 2.10, 2.10, 0.90, '#48bb78', '#38a169', '#276749', world.ox, world.oy);
          models.drawBox(ctx, tx - 0.35, ty - 0.35, 3.90, 1.35, 1.35, 0.60, '#68d391', '#48bb78', '#2f855a', world.ox, world.oy);
        }
      });

      // ======================================================================
      // F. THE CONNECTING SKYBRIDGE (x: 22.0..26.0, y: 99..101)
      // Connects Minecraft Island smoothly to the new Pokémon Sanctuary!
      // ======================================================================
      list.push({
        xMin: 21.8, xMax: 26.2, yMin: 98.8, yMax: 101.2,
        draw: () => {
          // Bridge North Railing
          drawFenceSegment(22.0, 26.0, 99.0);
          // Bridge South Railing
          drawFenceSegment(22.0, 26.0, 101.0);

          // Minecraft Bridgehead Gateway Posts & Torches (at x: 22.0)
          models.drawBox(ctx, 22.0, 99.0, 0, 0.25, 0.25, 1.80, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy);
          models.drawBox(ctx, 22.0, 101.0, 0, 0.25, 0.25, 1.80, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy);
          models.drawBox(ctx, 22.0, 99.0, 1.80, 0.25, 2.25, 0.22, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          const tp1 = isoToScreen(22.1, 99.1, 1.95, world.ox, world.oy);
          const tp2 = isoToScreen(22.1, 101.1, 1.95, world.ox, world.oy);
          ctx.save();
          ctx.fillStyle = '#f59e0b';
          ctx.shadowColor = '#ea580c';
          ctx.shadowBlur = 8;
          ctx.fillRect(tp1.x - 2, tp1.y - 2, 4, 4);
          ctx.fillRect(tp2.x - 2, tp2.y - 2, 4, 4);
          ctx.restore();

          // Pokémon Sanctuary Bridgehead Archway (at x: 25.8)
          models.drawBox(ctx, 25.8, 99.0, 0, 0.25, 0.25, 1.90, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);
          models.drawBox(ctx, 25.8, 101.0, 0, 0.25, 0.25, 1.90, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);
          models.drawBox(ctx, 25.8, 99.0, 1.90, 0.25, 2.25, 0.25, '#ef4444', '#dc2626', '#b91c1c', world.ox, world.oy);

          // Miniature glowing Poké Ball on Pokémon Sanctuary entrance arch
          const pbp = isoToScreen(25.9, 100.1, 2.05, world.ox, world.oy);
          ctx.save();
          ctx.fillStyle = '#ef4444';
          ctx.beginPath(); ctx.arc(pbp.x, pbp.y, 6.5, Math.PI, 0); ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(pbp.x, pbp.y, 6.5, 0, Math.PI); ctx.fill();
          ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 1.3;
          ctx.beginPath(); ctx.arc(pbp.x, pbp.y, 6.5, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(pbp.x - 6.5, pbp.y); ctx.lineTo(pbp.x + 6.5, pbp.y); ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(pbp.x, pbp.y, 2.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.restore();
        }
      });

      // Helper for Pokémon Sanctuary White Picket Fences
      const drawWhiteFenceSegment = (xStart, xEnd, yPos) => {
        models.drawBox(ctx, xStart, yPos, 0.25, xEnd - xStart, 0.10, 0.08, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);
        models.drawBox(ctx, xStart, yPos, 0.55, xEnd - xStart, 0.10, 0.08, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);
        for (let fx = xStart; fx <= xEnd + 0.1; fx += 1.4) {
          models.drawBox(ctx, fx, yPos, 0, 0.16, 0.16, 0.80, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);
        }
      };

      const drawWhiteFenceSegmentY = (xPos, yStart, yEnd) => {
        models.drawBox(ctx, xPos, yStart, 0.25, 0.10, yEnd - yStart, 0.08, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);
        models.drawBox(ctx, xPos, yStart, 0.55, 0.10, yEnd - yStart, 0.08, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);
        for (let fy = yStart; fy <= yEnd + 0.1; fy += 1.4) {
          models.drawBox(ctx, xPos, fy, 0, 0.16, 0.16, 0.80, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);
        }
      };

      // ======================================================================
      // G. POKÉMON SANCTUARY PERIMETER FENCES (x: 25.8..49.0, y: 93..111)
      // ======================================================================
      list.push({
        xMin: 25.6, xMax: 49.2, yMin: 92.8, yMax: 93.2,
        draw: () => drawWhiteFenceSegment(25.8, 49.0, 93.0)
      });
      list.push({
        xMin: 48.8, xMax: 49.3, yMin: 93.0, yMax: 111.0,
        draw: () => drawWhiteFenceSegmentY(49.0, 93.0, 111.0)
      });
      list.push({
        xMin: 25.6, xMax: 49.2, yMin: 110.8, yMax: 111.2,
        draw: () => drawWhiteFenceSegment(25.8, 49.0, 111.0)
      });
      list.push({
        xMin: 25.6, xMax: 26.1, yMin: 93.0, yMax: 99.0,
        draw: () => drawWhiteFenceSegmentY(25.8, 93.0, 99.0)
      });
      list.push({
        xMin: 25.6, xMax: 26.1, yMin: 101.0, yMax: 111.0,
        draw: () => drawWhiteFenceSegmentY(25.8, 101.0, 111.0)
      });

      // ======================================================================
      // H. THE POKÉMON CENTER (x: 34..42, y: 94..98.5)
      // Authentic Pokémon Center with classic sloping red roof, white walls,
      // glowing Poké Ball emblem, automatic glass doors and 6-ball recovery station!
      // ======================================================================
      // 1. Exterior North Wall & Foundation Base
      list.push({
        xMin: 33.8, xMax: 42.2, yMin: 93.6, yMax: 94.2,
        draw: () => {
          // Foundation plinth
          models.drawBox(ctx, 33.9, 93.7, 0, 8.2, 0.50, 0.25, '#38bdf8', '#0284c7', '#0369a1', world.ox, world.oy);
          // Solid North Wall
          models.drawBox(ctx, 34.0, 93.8, 0.25, 8.0, 0.40, 2.35, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);
        }
      });

      // 2. Exterior West & East Sidewalls
      list.push({
        xMin: 33.7, xMax: 34.2, yMin: 94.2, yMax: 98.1,
        draw: () => {
          models.drawBox(ctx, 33.8, 94.2, 0, 0.40, 3.9, 2.60, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);
          // West Viewing Window
          models.drawBox(ctx, 33.78, 95.2, 0.85, 0.42, 2.0, 1.15, 'rgba(186, 230, 253, 0.70)', 'rgba(147, 197, 253, 0.60)', 'rgba(125, 211, 252, 0.50)', world.ox, world.oy);
        }
      });
      list.push({
        xMin: 41.8, xMax: 42.3, yMin: 94.2, yMax: 98.1,
        draw: () => {
          models.drawBox(ctx, 41.8, 94.2, 0, 0.40, 3.9, 2.60, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);
          // East Viewing Window
          models.drawBox(ctx, 41.78, 95.2, 0.85, 0.42, 2.0, 1.15, 'rgba(186, 230, 253, 0.70)', 'rgba(147, 197, 253, 0.60)', 'rgba(125, 211, 252, 0.50)', world.ox, world.oy);
        }
      });

      // 3a. Interior Healing Counter & 6-Poké Ball Recovery Machine (x: 36.9..40.1, y: 94.9..95.8)
      list.push({
        xMin: 36.9, xMax: 40.1, yMin: 94.9, yMax: 95.8, z: 0,
        draw: () => {
          // Curved Front Healing Counter
          models.drawBox(ctx, 37.0, 95.0, 0, 3.0, 0.80, 0.85, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);
          models.drawBox(ctx, 36.9, 94.9, 0.85, 3.2, 0.90, 0.08, '#f43f5e', '#e11d48', '#be123c', world.ox, world.oy);

          // 6-Poké Ball Recovery Machine Console (on the counter)
          models.drawBox(ctx, 37.5, 95.0, 0.93, 2.0, 0.60, 0.35, '#0f172a', '#1e293b', '#020617', world.ox, world.oy);

          // 6 Animated Poké Ball Healing Slots
          const tNow = performance.now() * 0.004;
          const isHealing = (world.pokeCenterHealTimer > 0);
          if (isHealing) world.pokeCenterHealTimer -= 0.016;

          const slots = [
            { x: 37.85, y: 95.15 }, { x: 38.50, y: 95.15 }, { x: 39.15, y: 95.15 },
            { x: 37.85, y: 95.38 }, { x: 38.50, y: 95.38 }, { x: 39.15, y: 95.38 }
          ];

          slots.forEach((s, idx) => {
            const p = isoToScreen(s.x, s.y, 1.28, world.ox, world.oy);
            const activeCycle = isHealing ? Math.sin(tNow * 4 + idx * 0.8) > 0 : (Math.sin(tNow + idx) > 0.3);
            ctx.save();
            ctx.fillStyle = activeCycle ? '#f43f5e' : '#475569';
            ctx.beginPath(); ctx.arc(p.x, p.y, 4.0, Math.PI, 0); ctx.fill();
            ctx.fillStyle = activeCycle ? '#ffffff' : '#94a3b8';
            ctx.beginPath(); ctx.arc(p.x, p.y, 4.0, 0, Math.PI); ctx.fill();
            ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.arc(p.x, p.y, 4.0, 0, Math.PI * 2); ctx.stroke();
            if (activeCycle) {
              ctx.shadowColor = '#f43f5e';
              ctx.shadowBlur = 6;
              ctx.fillStyle = '#fef08a';
              ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
          });

          // Floating Healing Bubble when healing
          if (world.pokeCenterBubbleTimer > 0 && world.pokeCenterBubbleText) {
            world.pokeCenterBubbleTimer -= 0.016;
            const bp = isoToScreen(38.5, 95.0, 2.2, world.ox, world.oy);
            ctx.save();
            ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            const tw = ctx.measureText(world.pokeCenterBubbleText).width;
            const bw = tw + 18, bh = 24;
            const bx = bp.x - bw / 2, by = bp.y - bh - 6;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 1.3;
            ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#f43f5e';
            ctx.beginPath(); ctx.moveTo(bp.x - 4, by + bh); ctx.lineTo(bp.x + 4, by + bh); ctx.lineTo(bp.x, by + bh + 5); ctx.fill();
            ctx.fillStyle = '#f8fafc';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(world.pokeCenterBubbleText, bp.x, by + bh / 2);
            ctx.restore();
          }
        }
      });

      // 3b. Corner PC Storage Terminal (x: 40.4..41.8, y: 94.9..95.8)
      list.push({
        xMin: 40.4, xMax: 41.8, yMin: 94.9, yMax: 95.8, z: 0,
        draw: () => {
          // PC Storage Terminal on Corner Table (x: 40.5, y: 95.0)
          models.drawBox(ctx, 40.5, 95.0, 0, 1.2, 0.75, 0.80, '#e2e8f0', '#cbd5e1', '#94a3b8', world.ox, world.oy);
          models.drawBox(ctx, 40.8, 95.15, 0.80, 0.60, 0.40, 0.55, '#1e293b', '#0f172a', '#020617', world.ox, world.oy);
          const scrP = isoToScreen(41.1, 95.35, 1.08, world.ox, world.oy);
          ctx.save();
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.fillRect(scrP.x - 5, scrP.y - 4, 10, 7);
          ctx.fillStyle = '#facc15';
          ctx.beginPath(); ctx.arc(scrP.x, scrP.y - 1, 2.5, 0, Math.PI * 2); ctx.fill(); // Pikachu silhouette
          ctx.restore();
        }
      });

      // 4. Interior Waiting Lounge Sofa & Potted Palm (x: 34.0..35.1, y: 96.0..97.6)
      list.push({
        xMin: 34.0, xMax: 35.1, yMin: 96.0, yMax: 97.6, z: 0,
        draw: () => {
          // Curved Red & White Plush Sofa flush against west wall
          models.drawBox(ctx, 34.15, 96.2, 0, 0.85, 1.40, 0.35, '#dc2626', '#b91c1c', '#991b1b', world.ox, world.oy);
          models.drawBox(ctx, 34.15, 96.2, 0.35, 0.25, 1.40, 0.45, '#dc2626', '#b91c1c', '#991b1b', world.ox, world.oy);
          models.drawBox(ctx, 34.40, 96.3, 0.35, 0.55, 1.20, 0.12, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);
          // Ceramic Planter & Palm
          models.drawBox(ctx, 34.15, 97.4, 0, 0.45, 0.45, 0.45, '#e2e8f0', '#cbd5e1', '#94a3b8', world.ox, world.oy);
          models.drawBox(ctx, 34.20, 97.45, 0.45, 0.35, 0.35, 0.85, '#22c55e', '#16a34a', '#15803d', world.ox, world.oy);
        }
      });

      // 5. Camera-Facing South Wall, Automatic Doors & Welcome Mat (Supports wallAlphaPokemonCenter)
      list.push({
        xMin: 33.8, xMax: 42.2, yMin: 98.0, yMax: 98.5, z: 0,
        draw: () => {
          // Welcome Mat at Threshold (Always visible on floor)
          models.drawBox(ctx, 37.1, 98.1, 0, 1.8, 0.50, 0.03, '#0284c7', '#0369a1', '#075985', world.ox, world.oy);
          const matP = isoToScreen(38.0, 98.35, 0.04, world.ox, world.oy);
          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(matP.x, matP.y, 4, 0, Math.PI * 2); ctx.fill();
          ctx.restore();

          // South Wall & Glass Doors fade smoothly to 0.0 when inside
          if (world.wallAlphaPokemonCenter <= 0.005) return;

          ctx.save();
          if (world.wallAlphaPokemonCenter < 0.99) ctx.globalAlpha = world.wallAlphaPokemonCenter;

          // Left South Wall Section (x: 34.0..37.0)
          models.drawBox(ctx, 34.0, 98.1, 0, 3.0, 0.30, 0.85, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);
          models.drawBox(ctx, 34.0, 98.1, 0.85, 3.0, 0.30, 1.45, 'rgba(224, 242, 254, 0.65)', 'rgba(186, 230, 253, 0.55)', 'rgba(147, 197, 253, 0.45)', world.ox, world.oy);
          models.drawBox(ctx, 34.0, 98.1, 2.30, 3.0, 0.30, 0.30, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);

          // Right South Wall Section (x: 39.0..42.0)
          models.drawBox(ctx, 39.0, 98.1, 0, 3.0, 0.30, 0.85, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);
          models.drawBox(ctx, 39.0, 98.1, 0.85, 3.0, 0.30, 1.45, 'rgba(224, 242, 254, 0.65)', 'rgba(186, 230, 253, 0.55)', 'rgba(147, 197, 253, 0.45)', world.ox, world.oy);
          models.drawBox(ctx, 39.0, 98.1, 2.30, 3.0, 0.30, 0.30, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);

          // Automatic Sliding Doors Overhead Lintel (x: 37.0..39.0)
          models.drawBox(ctx, 37.0, 98.1, 2.20, 2.0, 0.30, 0.40, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);

          // Cyan Sliding Glass Door Leaves (Walkable opening at x: 37.0..39.0)
          const pOpen = (world.currentZone === 'pokemon_center') ? 0.35 : 0.0;
          models.drawBox(ctx, 37.0 - pOpen, 98.15, 0.03, 0.95, 0.10, 2.17, 'rgba(186, 230, 253, 0.60)', 'rgba(147, 197, 253, 0.50)', 'rgba(125, 211, 252, 0.40)', world.ox, world.oy);
          models.drawBox(ctx, 38.05 + pOpen, 98.15, 0.03, 0.95, 0.10, 2.17, 'rgba(186, 230, 253, 0.60)', 'rgba(147, 197, 253, 0.50)', 'rgba(125, 211, 252, 0.40)', world.ox, world.oy);

          ctx.restore();
        }
      });

      // 6. Iconic Curved Red Roof, Eaves & Glowing Poké Ball Emblem
      // Elevated at z: 2.6 (drawn after interior furniture), and smoothly fades out completely (opacity 0) when player enters!
      list.push({
        xMin: 33.4, xMax: 42.6, yMin: 93.4, yMax: 98.6, z: 2.6,
        draw: () => {
          // Completely transparent / hidden when inside Pokémon Center
          if (world.wallAlphaPokemonCenter <= 0.005) return;

          ctx.save();
          if (world.wallAlphaPokemonCenter < 0.99) ctx.globalAlpha = world.wallAlphaPokemonCenter;

          // White Molded Eaves Plinth
          models.drawBox(ctx, 33.4, 93.4, 2.50, 9.2, 5.2, 0.12, '#ffffff', '#f1f5f9', '#e2e8f0', world.ox, world.oy);
          // Classic Pokémon Center Sloping Crimson Red Roof Volume
          models.drawBox(ctx, 33.6, 93.6, 2.62, 8.8, 4.8, 0.65, '#ef4444', '#dc2626', '#b91c1c', world.ox, world.oy);
          // Upper Roof Gable Ridge
          models.drawBox(ctx, 34.6, 94.6, 3.27, 6.8, 2.8, 0.40, '#f87171', '#ef4444', '#dc2626', world.ox, world.oy);

          // Front Entrance Pediment Gable (x: 37.0..39.0, y: 98.4, z: 2.60..3.60)
          models.drawBox(ctx, 36.8, 98.3, 2.60, 2.4, 0.35, 0.60, '#ffffff', '#f1f5f9', '#e2e8f0', world.ox, world.oy);

          // Grand Glowing 3D Poké Ball Center Signboard Emblem
          const ep = isoToScreen(38.0, 98.65, 3.15, world.ox, world.oy);
          const rad = 13.5;
          // Upper Crimson Dome
          ctx.fillStyle = '#ef4444';
          ctx.beginPath(); ctx.arc(ep.x, ep.y, rad, Math.PI, 0); ctx.fill();
          // Lower Crisp White Dome
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(ep.x, ep.y, rad, 0, Math.PI); ctx.fill();
          // Black Central Band
          ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2.4;
          ctx.beginPath(); ctx.arc(ep.x, ep.y, rad, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(ep.x - rad, ep.y); ctx.lineTo(ep.x + rad, ep.y); ctx.stroke();
          // Center Button with Pulsing Cyan Neon Glow
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(ep.x, ep.y, 4.2, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 1.4;
          ctx.stroke();
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath(); ctx.arc(ep.x, ep.y, 1.8, 0, Math.PI * 2); ctx.fill();

          ctx.restore();
        }
      });

      // ======================================================================
      // I. GRAND POKÉ BALL PLAZA ACCENTS (Centered at x: 38, y: 104)
      // ======================================================================
      // 4 Plaza Corner Streetlamps (NW, NE, SW, SE)
      const streetlamps = [
        { x: 33.0, y: 99.0 }, { x: 43.0, y: 99.0 },
        { x: 33.0, y: 109.0 }, { x: 43.0, y: 109.0 }
      ];
      streetlamps.forEach((lamp, idx) => {
        list.push({
          xMin: lamp.x - 0.3, xMax: lamp.x + 0.3, yMin: lamp.y - 0.3, yMax: lamp.y + 0.3,
          draw: () => {
            // Iron Lamp Post
            models.drawBox(ctx, lamp.x - 0.08, lamp.y - 0.08, 0, 0.16, 0.16, 1.60, '#334155', '#1e293b', '#0f172a', world.ox, world.oy);
            // Glowing Amber Lantern Head
            models.drawBox(ctx, lamp.x - 0.18, lamp.y - 0.18, 1.60, 0.36, 0.36, 0.36, '#facc15', '#eab308', '#ca8a04', world.ox, world.oy);
            const lp = isoToScreen(lamp.x, lamp.y, 1.78, world.ox, world.oy);
            ctx.save();
            ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.arc(lp.x, lp.y, 5, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
          }
        });
      });

      // ======================================================================
      // J. POKÉMON QUEST SNORLAX (方可夢 卡比獸) (x: 45.0, y: 104.5)
      // 100% Authentic Supine Lying-Down Pose (Giant Mountainous Voxel Anatomy):
      // - Lying on back resting under the sun with head back and feet pointing forward
      // - Massive, mountainous, multi-tiered rounded cream belly dome heaving with deep snores
      // - Right arm lazily raised high into the air with sharp white claws
      // - Left arm resting flat on the grass beside the belly with claws
      // - Two giant forward-facing cream feet with caramel pads & 3 sharp white claws
      // - Head on grass with ears, sleeping closed eyes (- -) and tiny fangs
      // - Glowing animated Zzz bubbles floating up from head into the sky
      // ======================================================================
      list.push({
        xMin: 43.4, xMax: 46.6, yMin: 103.5, yMax: 105.6,
        draw: () => {
          if (!world.snorlax) {
            world.snorlax = { x: 45.0, y: 104.5, bubbleText: '', bubbleTimer: 0 };
          }
          const snor = world.snorlax;
          if (snor.bubbleTimer > 0) snor.bubbleTimer -= 0.016;

          const sx = snor.x, sy = snor.y;
          const tNow = performance.now() * 0.002;
          const breathe = Math.sin(tNow * 1.6) * 0.045;

          // Palette: Authentic Dark Slate Teal-Navy & Warm Vanilla Cream
          const tealT = '#155e75', tealL = '#0e7490', tealR = '#082f49';
          const creamT = '#fffbeb', creamL = '#fef3c7', creamR = '#fde68a';
          const padCol = '#92400e', clawCol = '#ffffff';

          const drawFaceQuad = (hx, hy, hz, dx, dy, dz, u1, v1, u2, v2, fillCol) => {
            const p0 = isoToScreen(hx + u1 * dx, hy + dy, hz + v1 * dz, world.ox, world.oy);
            const p1 = isoToScreen(hx + u2 * dx, hy + dy, hz + v1 * dz, world.ox, world.oy);
            const p2 = isoToScreen(hx + u2 * dx, hy + dy, hz + v2 * dz, world.ox, world.oy);
            const p3 = isoToScreen(hx + u1 * dx, hy + dy, hz + v2 * dz, world.ox, world.oy);
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
            ctx.closePath();
            ctx.fillStyle = fillCol;
            ctx.fill();
          };

          // 1. Head Resting on Grass Behind Body (North / Y = sy - 0.72)
          models.drawBox(ctx, sx - 0.60, sy - 0.75, 0, 1.20, 0.55, 0.48, tealT, tealL, tealR, world.ox, world.oy);

          // Pointed Ears on Back Corners of Head
          // Left Ear
          models.drawBox(ctx, sx - 0.70, sy - 0.78, 0.32, 0.28, 0.26, 0.36, tealT, tealL, tealR, world.ox, world.oy);
          // Right Ear
          models.drawBox(ctx, sx + 0.42, sy - 0.78, 0.32, 0.28, 0.26, 0.36, tealT, tealL, tealR, world.ox, world.oy);

          // Cream Face Mask on Top Surface of Head
          models.drawBox(ctx, sx - 0.45, sy - 0.70, 0.48, 0.90, 0.44, 0.02, creamT, creamL, creamR, world.ox, world.oy);

          // Sleeping Facial Features (Drawn seamlessly on top surface of head)
          const fP = isoToScreen(sx, sy - 0.48, 0.50, world.ox, world.oy);
          ctx.save();
          ctx.strokeStyle = '#082f49';
          ctx.lineWidth = 2.0;
          // Left closed slit eye (- -)
          ctx.beginPath(); ctx.moveTo(fP.x - 16, fP.y - 4); ctx.lineTo(fP.x - 4, fP.y - 1); ctx.stroke();
          // Right closed slit eye (- -)
          ctx.beginPath(); ctx.moveTo(fP.x + 4, fP.y - 1); ctx.lineTo(fP.x + 16, fP.y - 4); ctx.stroke();
          // Nose dots
          ctx.fillStyle = '#082f49';
          ctx.beginPath(); ctx.arc(fP.x - 2, fP.y - 1, 1.8, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(fP.x + 2, fP.y - 1, 1.8, 0, Math.PI * 2); ctx.fill();
          // Peaceful sleeping smile
          ctx.beginPath(); ctx.arc(fP.x, fP.y + 5, 8, 0, Math.PI); ctx.stroke();
          // Two white fangs pointing up from bottom jaw
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.moveTo(fP.x - 7, fP.y + 8); ctx.lineTo(fP.x - 4, fP.y + 2); ctx.lineTo(fP.x - 2, fP.y + 8); ctx.fill();
          ctx.beginPath(); ctx.moveTo(fP.x + 2, fP.y + 8); ctx.lineTo(fP.x + 4, fP.y + 2); ctx.lineTo(fP.x + 7, fP.y + 8); ctx.fill();
          ctx.restore();

          // 2. Base Mountainous Torso Resting Flat on Grass
          models.drawBox(ctx, sx - 1.05, sy - 0.38, 0, 2.10, 1.05, 0.40, tealT, tealL, tealR, world.ox, world.oy);

          // 3. Right Arm (Screen-Left) Lazily Raised into the Air with 5 White Claws
          models.drawBox(ctx, sx - 1.38, sy - 0.32, 0.20, 0.38, 0.42, 0.58, tealT, tealL, tealR, world.ox, world.oy);
          models.drawBox(ctx, sx - 1.34, sy - 0.30, 0.74, 0.32, 0.36, 0.34, tealT, tealL, tealR, world.ox, world.oy);
          models.drawBox(ctx, sx - 1.32, sy - 0.28, 1.04, 0.28, 0.32, 0.12, clawCol, clawCol, clawCol, world.ox, world.oy);

          // 4. Left Arm (Screen-Right) Resting Flat along Side on Grass with 5 White Claws
          models.drawBox(ctx, sx + 0.98, sy - 0.28, 0.02, 0.38, 0.72, 0.28, tealT, tealL, tealR, world.ox, world.oy);
          models.drawBox(ctx, sx + 1.00, sy + 0.40, 0.02, 0.32, 0.14, 0.22, clawCol, clawCol, clawCol, world.ox, world.oy);

          // 5. GIGANTIC MOUNTAINOUS CREAM BELLY DOME (Heaves up & down rhythmically with deep snores)
          // Tier 1: Broad belly foundation
          models.drawBox(ctx, sx - 0.90, sy - 0.32, 0.16, 1.80, 0.92, 0.42 + breathe, creamT, creamL, creamR, world.ox, world.oy);
          // Tier 2: Plump middle belly mound
          models.drawBox(ctx, sx - 0.72, sy - 0.24, 0.44, 1.44, 0.76, 0.36 + breathe * 1.3, creamT, creamL, creamR, world.ox, world.oy);
          // Tier 3: High chest mound
          models.drawBox(ctx, sx - 0.50, sy - 0.16, 0.68, 1.00, 0.58, 0.28 + breathe * 1.6, creamT, creamL, creamR, world.ox, world.oy);
          // Tier 4: Peak crest dome
          models.drawBox(ctx, sx - 0.30, sy - 0.08, 0.88, 0.60, 0.40, 0.18 + breathe * 2.0, creamT, creamL, creamR, world.ox, world.oy);

          // 6. Two Giant Forward-Facing Cream Feet with Caramel Pads & 3 Sharp Claws
          // Left Foot (Screen-Left)
          models.drawBox(ctx, sx - 0.98, sy + 0.34, 0, 0.64, 0.58, 0.55, creamT, creamL, creamR, world.ox, world.oy);
          // Caramel paw pad on front sole
          drawFaceQuad(sx - 0.98, sy + 0.34, 0, 0.64, 0.58, 0.55, 0.18, 0.18, 0.82, 0.82, padCol);
          // 3 sharp white claws on outer rim
          drawFaceQuad(sx - 0.98, sy + 0.34, 0, 0.64, 0.58, 0.55, 0.10, 0.85, 0.28, 1.00, clawCol);
          drawFaceQuad(sx - 0.98, sy + 0.34, 0, 0.64, 0.58, 0.55, 0.42, 0.85, 0.58, 1.00, clawCol);
          drawFaceQuad(sx - 0.98, sy + 0.34, 0, 0.64, 0.58, 0.55, 0.72, 0.85, 0.90, 1.00, clawCol);

          // Right Foot (Screen-Right)
          models.drawBox(ctx, sx + 0.34, sy + 0.34, 0, 0.64, 0.58, 0.55, creamT, creamL, creamR, world.ox, world.oy);
          // Caramel paw pad on front sole
          drawFaceQuad(sx + 0.34, sy + 0.34, 0, 0.64, 0.58, 0.55, 0.18, 0.18, 0.82, 0.82, padCol);
          // 3 sharp white claws on outer rim
          drawFaceQuad(sx + 0.34, sy + 0.34, 0, 0.64, 0.58, 0.55, 0.10, 0.85, 0.28, 1.00, clawCol);
          drawFaceQuad(sx + 0.34, sy + 0.34, 0, 0.64, 0.58, 0.55, 0.42, 0.85, 0.58, 1.00, clawCol);
          drawFaceQuad(sx + 0.34, sy + 0.34, 0, 0.64, 0.58, 0.55, 0.72, 0.85, 0.90, 1.00, clawCol);

          // 7. Animated Floating Neon Zzz Bubbles (Rising gently from head into the sky)
          const zAnchor = isoToScreen(sx + 0.20, sy - 0.60, 0.85, world.ox, world.oy);
          ctx.save();
          for (let i = 0; i < 3; i++) {
            const zPhase = (tNow * 0.75 + i * 0.33) % 1.0;
            const zx = zAnchor.x + zPhase * 28 + Math.sin(zPhase * 5) * 6;
            const zy = zAnchor.y - zPhase * 50;
            const zSize = 14 + zPhase * 10;
            ctx.font = `bold ${Math.round(zSize)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 10;
            ctx.fillStyle = `rgba(186, 230, 253, ${1.0 - zPhase * 0.75})`;
            ctx.fillText('Z', zx, zy);
          }
          ctx.restore();

          // 8. Interactive Speech Bubble
          if (snor.bubbleTimer > 0 && snor.bubbleText) {
            const bp = isoToScreen(sx, sy - 0.10, 1.85, world.ox, world.oy);
            ctx.save();
            ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            const tw = ctx.measureText(snor.bubbleText).width;
            const bw = tw + 18, bh = 24;
            const bx = bp.x - bw / 2, by = bp.y - bh - 6;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.3;
            ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath(); ctx.moveTo(bp.x - 4, by + bh); ctx.lineTo(bp.x + 4, by + bh); ctx.lineTo(bp.x, by + bh + 5); ctx.fill();
            ctx.fillStyle = '#f8fafc';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(snor.bubbleText, bp.x, by + bh / 2);
            ctx.restore();
          }
        }
      });

      // ======================================================================
      // K. POKÉMON QUEST EEVEE (方可夢 伊布) (x: 32.5, y: 101.0)
      // 100% Authentic Pokémon Quest Voxel Anatomy:
      // Huge fluffy cream-white cloud mane, flared fox ears with dark inner cavities,
      // 3-tone pixel eyes with amber iris & sparkle, cute 2-tone mouth, and bushy wagging tail!
      // ======================================================================
      list.push({
        xMin: 31.8, xMax: 33.2, yMin: 100.3, yMax: 101.7,
        draw: () => {
          if (!world.eevee) {
            world.eevee = { x: 32.5, y: 101.0, bubbleText: '', bubbleTimer: 0 };
          }
          const eev = world.eevee;
          if (eev.bubbleTimer > 0) eev.bubbleTimer -= 0.016;

          const ex = eev.x, ey = eev.y;
          const tNow = performance.now() * 0.004;
          const bob = Math.sin(tNow * 2.0) * 0.015;
          const tailWag = Math.sin(tNow * 3.5) * 0.06;

          // Authentic Pokémon Quest Palette
          const furT = '#c48950', furL = '#a8713b', furR = '#8c5928';
          const creamT = '#fffdf5', creamL = '#fef3c7', creamR = '#fae8b0';

          // Helper: Isometric Face Polygon Renderer on front face (Y = front)
          const drawFaceQuad = (hx, hy, hz, dx, dy, dz, u1, v1, u2, v2, fillCol) => {
            const p0 = isoToScreen(hx + u1 * dx, hy + dy, hz + v1 * dz, world.ox, world.oy);
            const p1 = isoToScreen(hx + u2 * dx, hy + dy, hz + v1 * dz, world.ox, world.oy);
            const p2 = isoToScreen(hx + u2 * dx, hy + dy, hz + v2 * dz, world.ox, world.oy);
            const p3 = isoToScreen(hx + u1 * dx, hy + dy, hz + v2 * dz, world.ox, world.oy);
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
            ctx.closePath();
            ctx.fillStyle = fillCol;
            ctx.fill();
          };

          // 1. 4 Stubby Voxel Paws
          const legW = 0.12, legH = 0.18;
          models.drawBox(ctx, ex - 0.18, ey - 0.14, 0, legW, legW, legH, furT, furL, furR, world.ox, world.oy);
          models.drawBox(ctx, ex + 0.06, ey - 0.14, 0, legW, legW, legH, furT, furL, furR, world.ox, world.oy);
          models.drawBox(ctx, ex - 0.18, ey + 0.06, 0, legW, legW, legH, furT, furL, furR, world.ox, world.oy);
          models.drawBox(ctx, ex + 0.06, ey + 0.06, 0, legW, legW, legH, furT, furL, furR, world.ox, world.oy);

          // 2. Compact Voxel Torso
          models.drawBox(ctx, ex - 0.18, ey - 0.18, 0.14 + bob, 0.36, 0.34, 0.26, furT, furL, furR, world.ox, world.oy);

          // 3. Iconic Grand Fluffy Cream-White Cloud Mane (Puffing out in 3D around neck & chest)
          // Central chest ruff puffing out forward over front legs
          models.drawBox(ctx, ex - 0.18, ey + 0.04, 0.16 + bob, 0.36, 0.22, 0.28, creamT, creamL, creamR, world.ox, world.oy);
          models.drawBox(ctx, ex - 0.13, ey + 0.16, 0.18 + bob, 0.26, 0.14, 0.22, creamT, creamL, creamR, world.ox, world.oy);
          // Left & Right shoulder fluff puffs
          models.drawBox(ctx, ex - 0.26, ey - 0.08, 0.18 + bob, 0.16, 0.24, 0.24, creamT, creamL, creamR, world.ox, world.oy);
          models.drawBox(ctx, ex + 0.10, ey - 0.08, 0.18 + bob, 0.16, 0.24, 0.24, creamT, creamL, creamR, world.ox, world.oy);
          // Neck back connector collar
          models.drawBox(ctx, ex - 0.22, ey - 0.16, 0.22 + bob, 0.44, 0.16, 0.20, creamT, creamL, creamR, world.ox, world.oy);

          // 4. Large Bushy Wagging Fox Tail with Big Fluffy Cream Tip
          models.drawBox(ctx, ex - 0.09 + tailWag * 0.6, ey - 0.28, 0.20 + bob, 0.18, 0.16, 0.18, furT, furL, furR, world.ox, world.oy);
          models.drawBox(ctx, ex - 0.12 + tailWag * 1.1, ey - 0.38, 0.28 + bob, 0.24, 0.18, 0.22, furT, furL, furR, world.ox, world.oy);
          models.drawBox(ctx, ex - 0.14 + tailWag * 1.6, ey - 0.48, 0.40 + bob, 0.28, 0.20, 0.26, creamT, creamL, creamR, world.ox, world.oy);
          models.drawBox(ctx, ex - 0.10 + tailWag * 2.0, ey - 0.44, 0.58 + bob, 0.20, 0.16, 0.18, creamT, creamL, creamR, world.ox, world.oy);

          // 5. Voxel Head Cube
          const hx = ex - 0.22, hy = ey - 0.10, hz = 0.38 + bob, dx = 0.44, dy = 0.38, dz = 0.38;
          models.drawBox(ctx, hx, hy, hz, dx, dy, dz, furT, furL, furR, world.ox, world.oy);

          // 6. Two Diagonally Flared Fox Ears with Dark Inner Cavities
          // Left Ear (Angled outwards to -X)
          models.drawBox(ctx, hx - 0.08, hy + 0.06, hz + dz - 0.04, 0.16, 0.14, 0.20, furT, furL, furR, world.ox, world.oy);
          models.drawBox(ctx, hx - 0.18, hy + 0.08, hz + dz + 0.12, 0.16, 0.14, 0.22, furT, furL, furR, world.ox, world.oy);
          models.drawBox(ctx, hx - 0.26, hy + 0.10, hz + dz + 0.30, 0.14, 0.12, 0.18, furT, furL, furR, world.ox, world.oy);
          drawFaceQuad(hx - 0.18, hy + 0.08, hz + dz + 0.12, 0.16, 0.14, 0.22, 0.20, 0.10, 0.85, 0.90, '#3b1808');

          // Right Ear (Angled outwards to +X)
          models.drawBox(ctx, hx + dx - 0.08, hy + 0.06, hz + dz - 0.04, 0.16, 0.14, 0.20, furT, furL, furR, world.ox, world.oy);
          models.drawBox(ctx, hx + dx + 0.02, hy + 0.08, hz + dz + 0.12, 0.16, 0.14, 0.22, furT, furL, furR, world.ox, world.oy);
          models.drawBox(ctx, hx + dx + 0.12, hy + 0.10, hz + dz + 0.30, 0.14, 0.12, 0.18, furT, furL, furR, world.ox, world.oy);
          drawFaceQuad(hx + dx + 0.02, hy + 0.08, hz + dz + 0.12, 0.16, 0.14, 0.22, 0.15, 0.10, 0.80, 0.90, '#3b1808');

          // 7. Authentic Pokémon Quest Facial Features (Projected on front face, zero flat 2D distortions!)
          // Left Eye (3-tone: espresso pupil, amber caramel iris, white sparkle)
          drawFaceQuad(hx, hy, hz, dx, dy, dz, 0.15, 0.44, 0.41, 0.86, '#261005');
          drawFaceQuad(hx, hy, hz, dx, dy, dz, 0.15, 0.44, 0.41, 0.58, '#b45309');
          drawFaceQuad(hx, hy, hz, dx, dy, dz, 0.18, 0.68, 0.28, 0.84, '#ffffff');

          // Right Eye
          drawFaceQuad(hx, hy, hz, dx, dy, dz, 0.59, 0.44, 0.85, 0.86, '#261005');
          drawFaceQuad(hx, hy, hz, dx, dy, dz, 0.59, 0.44, 0.85, 0.58, '#b45309');
          drawFaceQuad(hx, hy, hz, dx, dy, dz, 0.62, 0.68, 0.72, 0.84, '#ffffff');

          // Dark Nose Dot
          drawFaceQuad(hx, hy, hz, dx, dy, dz, 0.47, 0.42, 0.53, 0.48, '#1e0a02');

          // Cheerful Open Mouth (dark cavity + pink tongue)
          drawFaceQuad(hx, hy, hz, dx, dy, dz, 0.41, 0.20, 0.59, 0.36, '#4c0519');
          drawFaceQuad(hx, hy, hz, dx, dy, dz, 0.43, 0.20, 0.57, 0.27, '#fb7185');

          // Interactive Speech Bubble
          if (eev.bubbleTimer > 0 && eev.bubbleText) {
            const bp = isoToScreen(ex, ey, 1.40, world.ox, world.oy);
            ctx.save();
            ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            const tw = ctx.measureText(eev.bubbleText).width;
            const bw = tw + 18, bh = 24;
            const bx = bp.x - bw / 2, by = bp.y - bh - 6;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.3;
            ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath(); ctx.moveTo(bp.x - 4, by + bh); ctx.lineTo(bp.x + 4, by + bh); ctx.lineTo(bp.x, by + bh + 5); ctx.fill();
            ctx.fillStyle = '#f8fafc';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(eev.bubbleText, bp.x, by + bh / 2);
            ctx.restore();
          }
        }
      });

      // ======================================================================
      // L. POKÉMON QUEST JOLTEON (方可夢 雷伊布) (x: 34.5, y: 107.5)
      // Sharp multi-layered exploding white spike collar, tall pointed ears with black cavities,
      // lightning rump spikes, and fierce determined eyes!
      // ======================================================================
      list.push({
        xMin: 33.8, xMax: 35.2, yMin: 106.8, yMax: 108.2,
        draw: () => {
          if (!world.jolteon) {
            world.jolteon = { x: 34.5, y: 107.5, bubbleText: '', bubbleTimer: 0 };
          }
          const jolt = world.jolteon;
          if (jolt.bubbleTimer > 0) jolt.bubbleTimer -= 0.016;

          const jx = jolt.x, jy = jolt.y;
          const tNow = performance.now() * 0.005;
          const bob = Math.sin(tNow * 2.4) * 0.015;

          // Colors
          const yelT = '#fef08a', yelL = '#fde047', yelR = '#eab308';
          const whiteT = '#ffffff', whiteL = '#f8fafc', whiteR = '#e2e8f0';

          const drawFaceQuad = (hx, hy, hz, dx, dy, dz, u1, v1, u2, v2, fillCol) => {
            const p0 = isoToScreen(hx + u1 * dx, hy + dy, hz + v1 * dz, world.ox, world.oy);
            const p1 = isoToScreen(hx + u2 * dx, hy + dy, hz + v1 * dz, world.ox, world.oy);
            const p2 = isoToScreen(hx + u2 * dx, hy + dy, hz + v2 * dz, world.ox, world.oy);
            const p3 = isoToScreen(hx + u1 * dx, hy + dy, hz + v2 * dz, world.ox, world.oy);
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
            ctx.closePath();
            ctx.fillStyle = fillCol;
            ctx.fill();
          };

          // 1. 4 Electric Yellow Voxel Legs
          const legW = 0.12, legH = 0.20;
          models.drawBox(ctx, jx - 0.18, jy - 0.14, 0, legW, legW, legH, yelT, yelL, yelR, world.ox, world.oy);
          models.drawBox(ctx, jx + 0.06, jy - 0.14, 0, legW, legW, legH, yelT, yelL, yelR, world.ox, world.oy);
          models.drawBox(ctx, jx - 0.18, jy + 0.06, 0, legW, legW, legH, yelT, yelL, yelR, world.ox, world.oy);
          models.drawBox(ctx, jx + 0.06, jy + 0.06, 0, legW, legW, legH, yelT, yelL, yelR, world.ox, world.oy);

          // 2. Sleek Yellow Voxel Body
          models.drawBox(ctx, jx - 0.18, jy - 0.18, 0.16 + bob, 0.36, 0.34, 0.26, yelT, yelL, yelR, world.ox, world.oy);

          // 3. Spiky Yellow Rump / Tail Tufts
          models.drawBox(ctx, jx - 0.18, jy - 0.36, 0.28 + bob, 0.36, 0.18, 0.22, yelT, yelL, yelR, world.ox, world.oy);
          models.drawBox(ctx, jx - 0.12, jy - 0.46, 0.34 + bob, 0.24, 0.14, 0.18, yelT, yelL, yelR, world.ox, world.oy);

          // 4. Iconic Exploding Spiky White Collar (Multi-faceted sharp chevron blocks)
          models.drawBox(ctx, jx - 0.30, jy - 0.16, 0.26 + bob, 0.60, 0.38, 0.20, whiteT, whiteL, whiteR, world.ox, world.oy);
          // Left sharp point
          models.drawBox(ctx, jx - 0.42, jy - 0.06, 0.24 + bob, 0.20, 0.24, 0.20, whiteT, whiteL, whiteR, world.ox, world.oy);
          // Right sharp point
          models.drawBox(ctx, jx + 0.22, jy - 0.06, 0.24 + bob, 0.20, 0.24, 0.20, whiteT, whiteL, whiteR, world.ox, world.oy);
          // Front sharp points
          models.drawBox(ctx, jx - 0.24, jy + 0.14, 0.22 + bob, 0.20, 0.16, 0.18, whiteT, whiteL, whiteR, world.ox, world.oy);
          models.drawBox(ctx, jx + 0.04, jy + 0.14, 0.22 + bob, 0.20, 0.16, 0.18, whiteT, whiteL, whiteR, world.ox, world.oy);

          // 5. Voxel Head Cube
          const hx = jx - 0.22, hy = jy - 0.10, hz = 0.38 + bob, dx = 0.44, dy = 0.38, dz = 0.38;
          models.drawBox(ctx, hx, hy, hz, dx, dy, dz, yelT, yelL, yelR, world.ox, world.oy);

          // 6. Tall Pointed Ears with Jet-Black Inner Cavities
          // Left Ear
          models.drawBox(ctx, hx - 0.08, hy + 0.08, hz + dz - 0.02, 0.14, 0.14, 0.24, yelT, yelL, yelR, world.ox, world.oy);
          models.drawBox(ctx, hx - 0.14, hy + 0.08, hz + dz + 0.20, 0.12, 0.12, 0.22, yelT, yelL, yelR, world.ox, world.oy);
          models.drawBox(ctx, hx - 0.18, hy + 0.10, hz + dz + 0.40, 0.10, 0.10, 0.16, yelT, yelL, yelR, world.ox, world.oy);
          drawFaceQuad(hx - 0.14, hy + 0.08, hz + dz + 0.12, 0.12, 0.12, 0.26, 0.20, 0.15, 0.85, 0.90, '#0f172a');

          // Right Ear
          models.drawBox(ctx, hx + dx - 0.06, hy + 0.08, hz + dz - 0.02, 0.14, 0.14, 0.24, yelT, yelL, yelR, world.ox, world.oy);
          models.drawBox(ctx, hx + dx + 0.02, hy + 0.08, hz + dz + 0.20, 0.12, 0.12, 0.22, yelT, yelL, yelR, world.ox, world.oy);
          models.drawBox(ctx, hx + dx + 0.08, hy + 0.10, hz + dz + 0.40, 0.10, 0.10, 0.16, yelT, yelL, yelR, world.ox, world.oy);
          drawFaceQuad(hx + dx + 0.02, hy + 0.08, hz + dz + 0.12, 0.12, 0.12, 0.26, 0.15, 0.15, 0.80, 0.90, '#0f172a');

          // 7. Determined Facial Features
          drawFaceQuad(hx, hy, hz, dx, dy, dz, 0.15, 0.44, 0.41, 0.86, '#0f172a');
          drawFaceQuad(hx, hy, hz, dx, dy, dz, 0.15, 0.44, 0.41, 0.58, '#ca8a04');
          drawFaceQuad(hx, hy, hz, dx, dy, dz, 0.18, 0.68, 0.28, 0.84, '#ffffff');

          drawFaceQuad(hx, hy, hz, dx, dy, dz, 0.59, 0.44, 0.85, 0.86, '#0f172a');
          drawFaceQuad(hx, hy, hz, dx, dy, dz, 0.59, 0.44, 0.85, 0.58, '#ca8a04');
          drawFaceQuad(hx, hy, hz, dx, dy, dz, 0.62, 0.68, 0.72, 0.84, '#ffffff');

          drawFaceQuad(hx, hy, hz, dx, dy, dz, 0.47, 0.42, 0.53, 0.48, '#0f172a');

          drawFaceQuad(hx, hy, hz, dx, dy, dz, 0.41, 0.20, 0.59, 0.36, '#4c0519');
          drawFaceQuad(hx, hy, hz, dx, dy, dz, 0.43, 0.20, 0.57, 0.27, '#fb7185');

          // Electric Spark Particle
          if (Math.sin(tNow * 3.5) > 0.5) {
            const spk = isoToScreen(jx + 0.25 + Math.sin(tNow * 12) * 0.1, jy + 0.05, 0.60 + Math.cos(tNow * 12) * 0.1, world.ox, world.oy);
            ctx.save();
            ctx.fillStyle = '#facc15'; ctx.shadowColor = '#eab308'; ctx.shadowBlur = 6;
            ctx.fillRect(spk.x - 1.5, spk.y - 1.5, 3, 3);
            ctx.restore();
          }

          // Interactive Speech Bubble
          if (jolt.bubbleTimer > 0 && jolt.bubbleText) {
            const bp = isoToScreen(jx, jy, 1.40, world.ox, world.oy);
            ctx.save();
            ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            const tw = ctx.measureText(jolt.bubbleText).width;
            const bw = tw + 18, bh = 24;
            const bx = bp.x - bw / 2, by = bp.y - bh - 6;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 1.3;
            ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#facc15';
            ctx.beginPath(); ctx.moveTo(bp.x - 4, by + bh); ctx.lineTo(bp.x + 4, by + bh); ctx.lineTo(bp.x, by + bh + 5); ctx.fill();
            ctx.fillStyle = '#f8fafc';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(jolt.bubbleText, bp.x, by + bh / 2);
            ctx.restore();
          }
        }
      });

      // ======================================================================
      // N. POKÉMON QUEST FLAREON (方可夢 火伊布) (x: 43.0, y: 101.0)
      // Authentic Pokémon Quest voxel styling: upright fox ears with charcoal cavities,
      // fluffy golden pompadour cloud head crest, massive billowing cloud mane,
      // giant curling flame tail, and cheerful warm amber eyes!
      // ======================================================================
      list.push({
        xMin: 42.2, xMax: 43.8, yMin: 100.2, yMax: 101.8,
        draw: () => {
          if (!world.flareon) {
            world.flareon = { x: 43.0, y: 101.0, bubbleText: '', bubbleTimer: 0 };
          }
          const fla = world.flareon;
          if (fla.bubbleTimer > 0) fla.bubbleTimer -= 0.016;

          const fx = fla.x, fy = fla.y;
          const tNow = performance.now() * 0.0035;
          const bob = Math.sin(tNow * 1.8) * 0.015;

          // Colors
          const orgT = '#fb923c', orgL = '#f97316', orgR = '#ea580c';
          const flameT = '#fef9c3', flameL = '#fef08a', flameR = '#facc15';

          const drawFaceQuad = (hx, hy, hz, dx, dy, dz, u1, v1, u2, v2, fillCol) => {
            const p0 = isoToScreen(hx + u1 * dx, hy + dy, hz + v1 * dz, world.ox, world.oy);
            const p1 = isoToScreen(hx + u2 * dx, hy + dy, hz + v1 * dz, world.ox, world.oy);
            const p2 = isoToScreen(hx + u2 * dx, hy + dy, hz + v2 * dz, world.ox, world.oy);
            const p3 = isoToScreen(hx + u1 * dx, hy + dy, hz + v2 * dz, world.ox, world.oy);
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
            ctx.closePath();
            ctx.fillStyle = fillCol;
            ctx.fill();
          };

          // 1. 4 Orange Voxel Legs
          const legW = 0.12, legH = 0.18;
          models.drawBox(ctx, fx - 0.18, fy - 0.14, 0, legW, legW, legH, orgT, orgL, orgR, world.ox, world.oy);
          models.drawBox(ctx, fx + 0.06, fy - 0.14, 0, legW, legW, legH, orgT, orgL, orgR, world.ox, world.oy);
          models.drawBox(ctx, fx - 0.18, fy + 0.06, 0, legW, legW, legH, orgT, orgL, orgR, world.ox, world.oy);
          models.drawBox(ctx, fx + 0.06, fy + 0.06, 0, legW, legW, legH, orgT, orgL, orgR, world.ox, world.oy);

          // 2. Orange Voxel Body
          models.drawBox(ctx, fx - 0.18, fy - 0.18, 0.14 + bob, 0.36, 0.34, 0.26, orgT, orgL, orgR, world.ox, world.oy);

          // 3. Giant Fluffy Flame Cloud Tail (Warm Golden Yellow curling up high)
          models.drawBox(ctx, fx - 0.14, fy - 0.34, 0.22 + bob, 0.28, 0.22, 0.24, flameT, flameL, flameR, world.ox, world.oy);
          models.drawBox(ctx, fx - 0.20, fy - 0.48, 0.36 + bob, 0.40, 0.26, 0.32, flameT, flameL, flameR, world.ox, world.oy);
          models.drawBox(ctx, fx - 0.16, fy - 0.44, 0.64 + bob, 0.32, 0.22, 0.28, flameT, flameL, flameR, world.ox, world.oy);
          models.drawBox(ctx, fx - 0.11, fy - 0.38, 0.86 + bob, 0.22, 0.18, 0.20, flameT, flameL, flameR, world.ox, world.oy);

          // 4. Massive Billowing Fluffy Golden Cloud Mane (Surrounding neck and puffing in front)
          // Front chest puffs
          models.drawBox(ctx, fx - 0.20, fy + 0.06, 0.16 + bob, 0.40, 0.24, 0.30, flameT, flameL, flameR, world.ox, world.oy);
          models.drawBox(ctx, fx - 0.15, fy + 0.18, 0.18 + bob, 0.30, 0.14, 0.24, flameT, flameL, flameR, world.ox, world.oy);
          // Left & right shoulder puffs
          models.drawBox(ctx, fx - 0.30, fy - 0.08, 0.18 + bob, 0.18, 0.26, 0.26, flameT, flameL, flameR, world.ox, world.oy);
          models.drawBox(ctx, fx + 0.12, fy - 0.08, 0.18 + bob, 0.18, 0.26, 0.26, flameT, flameL, flameR, world.ox, world.oy);
          // Back neck ruff
          models.drawBox(ctx, fx - 0.24, fy - 0.18, 0.22 + bob, 0.48, 0.16, 0.22, flameT, flameL, flameR, world.ox, world.oy);

          // 5. Voxel Head Cube
          const hx = fx - 0.22, fyHead = fy - 0.10, hz = 0.38 + bob, dx = 0.44, dy = 0.38, dz = 0.38;
          models.drawBox(ctx, hx, fyHead, hz, dx, dy, dz, orgT, orgL, orgR, world.ox, world.oy);

          // 6. Upright Sleek Fox Ears with Charcoal Inner Cavities (Rendered on top-back corners of head)
          // Left Ear
          models.drawBox(ctx, hx - 0.02, fyHead + 0.08, hz + dz - 0.02, 0.14, 0.14, 0.22, orgT, orgL, orgR, world.ox, world.oy);
          models.drawBox(ctx, hx - 0.06, fyHead + 0.08, hz + dz + 0.18, 0.12, 0.12, 0.22, orgT, orgL, orgR, world.ox, world.oy);
          models.drawBox(ctx, hx - 0.09, fyHead + 0.10, hz + dz + 0.38, 0.10, 0.10, 0.16, orgT, orgL, orgR, world.ox, world.oy);
          drawFaceQuad(hx - 0.06, fyHead + 0.08, hz + dz + 0.16, 0.12, 0.12, 0.22, 0.18, 0.12, 0.82, 0.88, '#1e293b');

          // Right Ear
          models.drawBox(ctx, hx + dx - 0.12, fyHead + 0.08, hz + dz - 0.02, 0.14, 0.14, 0.22, orgT, orgL, orgR, world.ox, world.oy);
          models.drawBox(ctx, hx + dx - 0.06, fyHead + 0.08, hz + dz + 0.18, 0.12, 0.12, 0.22, orgT, orgL, orgR, world.ox, world.oy);
          models.drawBox(ctx, hx + dx - 0.01, fyHead + 0.10, hz + dz + 0.38, 0.10, 0.10, 0.16, orgT, orgL, orgR, world.ox, world.oy);
          drawFaceQuad(hx + dx - 0.06, fyHead + 0.08, hz + dz + 0.16, 0.12, 0.12, 0.22, 0.18, 0.12, 0.82, 0.88, '#1e293b');

          // 7. Fluffy Golden Cloud Head Crest (Flame Pompadour Tuft between & in front of ears)
          models.drawBox(ctx, fx - 0.14, fyHead + 0.12, hz + dz - 0.02, 0.28, 0.20, 0.18, flameT, flameL, flameR, world.ox, world.oy);
          models.drawBox(ctx, fx - 0.11, fyHead + 0.22, hz + dz + 0.02, 0.22, 0.14, 0.18, flameT, flameL, flameR, world.ox, world.oy);
          models.drawBox(ctx, fx - 0.07, fyHead + 0.16, hz + dz + 0.16, 0.14, 0.14, 0.14, flameT, flameL, flameR, world.ox, world.oy);

          // 8. Facial Features (3-tone warm amber eyes)
          drawFaceQuad(hx, fyHead, hz, dx, dy, dz, 0.15, 0.44, 0.41, 0.86, '#3b1104');
          drawFaceQuad(hx, fyHead, hz, dx, dy, dz, 0.15, 0.44, 0.41, 0.58, '#d97706');
          drawFaceQuad(hx, fyHead, hz, dx, dy, dz, 0.18, 0.68, 0.28, 0.84, '#ffffff');

          drawFaceQuad(hx, fyHead, hz, dx, dy, dz, 0.59, 0.44, 0.85, 0.86, '#3b1104');
          drawFaceQuad(hx, fyHead, hz, dx, dy, dz, 0.59, 0.44, 0.85, 0.58, '#d97706');
          drawFaceQuad(hx, fyHead, hz, dx, dy, dz, 0.62, 0.68, 0.72, 0.84, '#ffffff');

          drawFaceQuad(hx, fyHead, hz, dx, dy, dz, 0.47, 0.42, 0.53, 0.48, '#291006');

          drawFaceQuad(hx, fyHead, hz, dx, dy, dz, 0.41, 0.20, 0.59, 0.36, '#4c0519');
          drawFaceQuad(hx, fyHead, hz, dx, dy, dz, 0.43, 0.20, 0.57, 0.27, '#fb7185');

          // Warm Ember Particle
          if (Math.sin(tNow * 4.0) > 0.6) {
            const ep = isoToScreen(fx - 0.10 + Math.sin(tNow * 8) * 0.1, fy - 0.35, 0.65 + Math.cos(tNow * 8) * 0.1, world.ox, world.oy);
            ctx.save();
            ctx.fillStyle = '#f97316'; ctx.shadowColor = '#ea580c'; ctx.shadowBlur = 6;
            ctx.fillRect(ep.x - 1.5, ep.y - 1.5, 3, 3);
            ctx.restore();
          }

          // Interactive Speech Bubble
          if (fla.bubbleTimer > 0 && fla.bubbleText) {
            const bp = isoToScreen(fx, fy, 1.40, world.ox, world.oy);
            ctx.save();
            ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            const tw = ctx.measureText(fla.bubbleText).width;
            const bw = tw + 18, bh = 24;
            const bx = bp.x - bw / 2, by = bp.y - bh - 6;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
            ctx.strokeStyle = '#f97316';
            ctx.lineWidth = 1.3;
            ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#f97316';
            ctx.beginPath(); ctx.moveTo(bp.x - 4, by + bh); ctx.lineTo(bp.x + 4, by + bh); ctx.lineTo(bp.x, by + bh + 5); ctx.fill();
            ctx.fillStyle = '#f8fafc';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(fla.bubbleText, bp.x, by + bh / 2);
            ctx.restore();
          }
        }
      });
    }
  };

  window.GamingDimensionPrefab = GamingDimensionPrefab;

})(window);
