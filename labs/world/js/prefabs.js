// ============================================================================
// Ludwigia World — Modular Architecture Prefabs
// Gaming Dimension: Cyber Cafe Enclosure, Howling Abyss Bridge & Minecraft Sanctuary
// ============================================================================

(function(window) {
  'use strict';

  const GamingDimensionPrefab = {
    id: 'gaming_dimension',

    // --- 1. Collision & Navigation Grid Setup ---
    initNav(nav) {
      if (!nav) return;

      // 1. Cyber Cafe Full Enclosure Walls (x: 1..11, y: 45..53)
      // North Wall: x: 1..11, y: 44.8, with doorway at x: 5..7
      nav.setBlock(1.0, 44.8, 4.0, 0.45, true);   // North Wall Left
      nav.setBlock(7.0, 44.8, 4.5, 0.45, true);   // North Wall Right (North Entrance)

      // West Wall: Floor-to-ceiling panoramic glass curtain wall
      nav.setBlock(0.8, 44.8, 0.45, 8.5, true);   // West Wall

      // East Wall: Floor-to-ceiling panoramic glass curtain wall overlooking the chasm
      nav.setBlock(11.2, 44.8, 0.45, 8.5, true);  // East Wall

      // South Wall: x: 1..11, y: 53.0 with South Abyss Portal doorway at x: 4.8..7.2
      nav.setBlock(1.0, 53.0, 3.8, 0.45, true);   // South Wall Left
      nav.setBlock(7.2, 53.0, 4.3, 0.45, true);   // South Wall Right (leaves x: 4.8..7.2 open to bridge!)

      // Cyber Cafe Internal Rigs
      nav.setBlock(2.2, 46.2, 1.4, 0.8, true);    // Blue Rig 1
      nav.setBlock(4.2, 46.2, 1.4, 0.8, true);    // Blue Rig 2
      nav.setBlock(6.2, 46.2, 1.4, 0.8, true);    // Blue Rig 3
      nav.setBlock(2.2, 50.2, 1.4, 0.8, true);    // Red Rig 1
      nav.setBlock(4.2, 50.2, 1.4, 0.8, true);    // Red Rig 2
      nav.setBlock(6.2, 50.2, 1.4, 0.8, true);    // Red Rig 3
      nav.setBlock(8.5, 47.8, 1.8, 0.85, true);   // Snack & Ramen Bar

      // 2. Howling Abyss North-South Bridge (x: 4..8, y: 53.2..61.2)
      // West Balustrade Railing (blocks falling into West Abyss)
      nav.setBlock(3.7, 53.2, 0.45, 8.2, true);
      // East Balustrade Railing (blocks falling into East Abyss)
      nav.setBlock(8.0, 53.2, 0.45, 8.2, true);

      // Mid-bridge Obstacles
      nav.setBlock(5.2, 56.5, 1.6, 1.6, true);   // Ancient Outer Turret Plinth
      nav.setBlock(5.3, 59.2, 1.4, 1.4, true);   // Freljordian Inhibitor Dais

      // 3. Minecraft Sanctuary (x: 1..12, y: 61.5..70.0)
      // Classic Oak Wood Cabin (x: 2..6, y: 63..67, door at x: 4.0..5.0, y: 63)
      nav.setBlock(2.0, 63.0, 2.0, 0.40, true);  // Cabin North Wall Left: x: 2..4
      nav.setBlock(5.0, 63.0, 1.4, 0.40, true);  // Cabin North Wall Right: x: 5..6.4 (leaves tile 4 wide open as doorway!)
      nav.setBlock(1.8, 63.0, 0.40, 4.2, true);  // Cabin West Wall
      nav.setBlock(6.0, 63.0, 0.40, 4.2, true);  // Cabin East Wall
      nav.setBlock(2.0, 67.0, 4.2, 0.40, true);  // Cabin South Wall

      // Cabin Furniture Obstacles
      nav.setBlock(2.2, 65.0, 1.3, 1.8, true);   // Minecraft Red Bed
      nav.setBlock(5.2, 64.0, 0.75, 0.75, true); // Crafting Table
      nav.setBlock(5.2, 65.2, 0.75, 0.75, true); // Furnace
      nav.setBlock(2.2, 63.6, 0.75, 0.75, true); // Chest

      // Farmland Fences (x: 8..11, y: 64..67, fence gate at x: 8, y: 64)
      nav.setBlock(8.0, 64.0, 0.35, 3.2, true);  // West Fence
      nav.setBlock(11.2, 64.0, 0.35, 3.2, true); // East Fence
      nav.setBlock(8.0, 67.0, 3.5, 0.35, true);  // South Fence
      nav.setBlock(9.0, 64.0, 2.4, 0.35, true);  // North Fence (leaves 8.0..9.0 open as gate)

      // Blocky Oak Tree & Sign
      nav.setBlock(1.6, 68.0, 0.75, 0.75, true); // Oak Tree Trunk
      nav.setBlock(7.4, 62.2, 0.35, 0.35, true); // Oak Signboard
    },

    // --- 2. Register Bed Furniture Spot for Minecraft Red Bed ---
    initFurniture(charManager) {
      if (!charManager || !charManager.furnitureSpots) return;
      if (!charManager.furnitureSpots.some(f => f.id === 'minecraft_bed')) {
        charManager.furnitureSpots.push({
          id: 'minecraft_bed',
          type: 'bed',
          zone: 'minecraft_sanctuary',
          x: 2.8,
          y: 65.8,
          z: 0.32,
          facing: 1,
          name: 'Minecraft 經典大紅床',
          duvetColor: '#dc2626',
          labelZh: '躺上紅床睡覺',
          labelEn: 'Sleep in Minecraft Bed'
        });
      }
    },

    // --- 3. Static Entities Registration (Walls, Bridge, Cabin, Crops, Sheep) ---
    initEntities(list, world) {
      if (!list || !world) return;
      const ctx = world.ctx;
      const models = world.models;
      const H = 2.70;

      // ======================================================================
      // A. CYBER CAFE ENCLOSURE & PANORAMIC GLASS CURTAIN WALLS
      // ======================================================================
      const cyberWallT = '#0f172a';
      const cyberWallL = '#090d16';
      const cyberWallR = '#020617';

      // 1. North Wall (y = 44.8, x: 1..11, doorway at x: 5..7)
      // Left Segment: x: 1..5
      list.push({
        xMin: 1.0, xMax: 5.0, yMin: 44.6, yMax: 45.0,
        draw: () => {
          models.drawBox(ctx, 1.0, 44.8, 0, 4.0, 0.25, H, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy, cyberWallR);
        }
      });
      // Right Segment: x: 7..11.2
      list.push({
        xMin: 7.0, xMax: 11.2, yMin: 44.6, yMax: 45.0,
        draw: () => {
          models.drawBox(ctx, 7.0, 44.8, 0, 4.2, 0.25, H, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy, cyberWallR);
        }
      });
      // Overhead North Door Lintel (x: 5..7, z: 2.2..2.7)
      list.push({
        xMin: 5.0, xMax: 7.0, yMin: 44.6, yMax: 45.0,
        draw: () => {
          models.drawBox(ctx, 5.0, 44.8, 2.20, 2.0, 0.25, H - 2.20, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);
        }
      });

      // 2. West Panoramic Glass Curtain Wall (along x = 0.8, y: 44.8..53.2)
      list.push({
        xMin: 0.6, xMax: 1.1, yMin: 44.8, yMax: 53.2,
        draw: () => {
          const wLen = 8.4;
          // Bottom Sill & Top Lintel
          models.drawBox(ctx, 0.8, 44.8, 0, 0.25, wLen, 0.40, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);
          models.drawBox(ctx, 0.8, 44.8, 2.30, 0.25, wLen, H - 2.30, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);
          // Vertical Mullions
          for (let my = 46.8; my <= 52.8; my += 2.0) {
            models.drawBox(ctx, 0.8, my, 0.40, 0.25, 0.18, 1.90, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);
          }
          // Translucent Glass Panes
          for (let gy = 44.8; gy < 53.0; gy += 2.0) {
            const p0 = isoToScreen(0.85, gy, 0.40, world.ox, world.oy);
            const p1 = isoToScreen(0.85, gy + 1.82, 0.40, world.ox, world.oy);
            const p2 = isoToScreen(0.85, gy + 1.82, 2.30, world.ox, world.oy);
            const p3 = isoToScreen(0.85, gy, 2.30, world.ox, world.oy);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
            ctx.closePath(); ctx.fill();
            // Cyan Glass Sheen Line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p0.x + 3, p0.y - 4); ctx.lineTo(p2.x - 3, p2.y + 4);
            ctx.stroke();
          }
        }
      });

      // 3. East Panoramic Glass Curtain Wall Overlooking Howling Abyss (along x = 11.2, y: 44.8..53.2)
      list.push({
        xMin: 11.0, xMax: 11.5, yMin: 44.8, yMax: 53.2,
        draw: () => {
          const wLen = 8.4;
          // Bottom Sill & Top Lintel
          models.drawBox(ctx, 11.2, 44.8, 0, 0.25, wLen, 0.40, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);
          models.drawBox(ctx, 11.2, 44.8, 2.30, 0.25, wLen, H - 2.30, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);
          // Vertical Mullions
          for (let my = 46.8; my <= 52.8; my += 2.0) {
            models.drawBox(ctx, 11.2, my, 0.40, 0.25, 0.18, 1.90, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);
          }
          // Translucent Glass Panes
          for (let gy = 44.8; gy < 53.0; gy += 2.0) {
            const p0 = isoToScreen(11.25, gy, 0.40, world.ox, world.oy);
            const p1 = isoToScreen(11.25, gy + 1.82, 0.40, world.ox, world.oy);
            const p2 = isoToScreen(11.25, gy + 1.82, 2.30, world.ox, world.oy);
            const p3 = isoToScreen(11.25, gy, 2.30, world.ox, world.oy);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
            ctx.closePath(); ctx.fill();
            // Starlight reflection
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.40)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p0.x + 4, p0.y - 6); ctx.lineTo(p2.x - 4, p2.y + 6);
            ctx.stroke();
          }
        }
      });

      // 4. South Wall & Abyss Portal Air-lock Gateway (along y = 53.0, x: 1..11, gateway at x: 4.8..7.2)
      // Left Segment: x: 1..4.8
      list.push({
        xMin: 1.0, xMax: 4.8, yMin: 52.8, yMax: 53.3,
        draw: () => {
          models.drawBox(ctx, 1.0, 53.0, 0, 3.8, 0.25, H, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);
        }
      });
      // Right Segment: x: 7.2..11.2
      list.push({
        xMin: 7.2, xMax: 11.2, yMin: 52.8, yMax: 53.3,
        draw: () => {
          models.drawBox(ctx, 7.2, 53.0, 0, 4.0, 0.25, H, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);
        }
      });
      // South Abyss Portal Overhead Archway & Neon Warning Plate (x: 4.8..7.2, z: 2.15..2.85)
      list.push({
        xMin: 4.6, xMax: 7.4, yMin: 52.8, yMax: 53.3,
        draw: () => {
          // Heavy Steel Archway Beam
          models.drawBox(ctx, 4.6, 53.0, 2.15, 2.8, 0.35, 0.70, '#1e293b', '#0f172a', '#020617', world.ox, world.oy);
          // Cyan Glowing Portal Warning Bar
          const pP = isoToScreen(6.0, 53.05, 2.45, world.ox, world.oy);
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.fillRect(pP.x - 22, pP.y - 4, 44, 8);
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('⚡ ABYSS GATE ⚡', pP.x, pP.y + 3);
        }
      });

      // ======================================================================
      // B. HOWLING ABYSS NORTH-SOUTH SUSPENSION BRIDGE (x: 4..8, y: 53.2..61.2)
      // ======================================================================
      // 1. Entrance Guardian Obelisks at Bridgehead
      list.push({
        xMin: 3.5, xMax: 4.3, yMin: 53.2, yMax: 54.0,
        draw: () => models.drawAbyssEntranceGateway(ctx, 3.5, 53.2, world.ox, world.oy)
      });
      list.push({
        xMin: 7.7, xMax: 8.5, yMin: 53.2, yMax: 54.0,
        draw: () => models.drawAbyssEntranceGateway(ctx, 7.7, 53.2, world.ox, world.oy)
      });

      // 2. West Bridge Parapet Wall (along x = 3.8, y: 53.8..61.2)
      list.push({
        xMin: 3.7, xMax: 4.1, yMin: 53.8, yMax: 61.2,
        draw: () => {
          models.drawAbyssParapetSegment(ctx, 3.8, 53.8, 0.35, 3.2, world.ox, world.oy);
          models.drawAbyssBrokenRailing(ctx, 3.8, 57.2, world.ox, world.oy, true);
          models.drawAbyssParapetSegment(ctx, 3.8, 58.8, 0.35, 2.4, world.ox, world.oy);
        }
      });

      // 3. East Bridge Parapet Wall (along x = 8.0, y: 53.8..61.2)
      list.push({
        xMin: 7.9, xMax: 8.3, yMin: 53.8, yMax: 61.2,
        draw: () => {
          models.drawAbyssParapetSegment(ctx, 8.0, 53.8, 0.35, 2.4, world.ox, world.oy);
          models.drawAbyssBrokenRailing(ctx, 8.0, 56.4, world.ox, world.oy, false);
          models.drawAbyssParapetSegment(ctx, 8.0, 58.0, 0.35, 3.2, world.ox, world.oy);
        }
      });

      // 4. Fire Braziers along North-South Parapets
      [
        { gx: 3.8, gy: 54.5 },
        { gx: 3.8, gy: 59.8 },
        { gx: 8.0, gy: 54.5 },
        { gx: 8.0, gy: 59.8 }
      ].forEach(b => {
        list.push({
          xMin: b.gx, xMax: b.gx + 0.65, yMin: b.gy, yMax: b.gy + 0.65,
          draw: () => models.drawAbyssBrazier(ctx, b.gx, b.gy, world.ox, world.oy)
        });
      });

      // 5. Guardian Statues at Bridge Midpoint
      list.push({
        xMin: 3.2, xMax: 4.4, yMin: 55.6, yMax: 56.8,
        draw: () => models.drawAbyssGuardianStatue(ctx, 3.2, 55.6, world.ox, world.oy, true)
      });
      list.push({
        xMin: 7.8, xMax: 9.0, yMin: 55.6, yMax: 56.8,
        draw: () => models.drawAbyssGuardianStatue(ctx, 7.8, 55.6, world.ox, world.oy, false)
      });

      // 6. Ancient Mid-Bridge Turret
      list.push({
        xMin: 5.2, xMax: 6.8, yMin: 56.5, yMax: 58.1,
        draw: () => models.drawAbyssTurret(ctx, 5.2, 56.5, world.ox, world.oy)
      });

      // 7. Freljordian Inhibitor Dais
      list.push({
        xMin: 5.3, xMax: 6.7, yMin: 59.2, yMax: 60.6,
        draw: () => models.drawAbyssInhibitor(ctx, 5.3, 59.2, world.ox, world.oy)
      });

      // 8. Bridge Snow Poros
      list.push({
        xMin: 4.5, xMax: 5.1, yMin: 54.8, yMax: 55.4,
        draw: () => models.drawPoro(ctx, 4.8, 55.1, world.ox, world.oy, 'snack')
      });
      list.push({
        xMin: 6.8, xMax: 7.4, yMin: 58.2, yMax: 58.8,
        draw: () => models.drawPoro(ctx, 7.1, 58.5, world.ox, world.oy, 'tongue')
      });

      // ======================================================================
      // C. THE MINECRAFT SANCTUARY (x: 1..12, y: 61.5..70.0)
      // ======================================================================
      const oakLogBark = '#49331e';
      const oakLogSide = '#6d4c28';
      const oakLogRing = '#9c7a4f';
      const oakPlankTop = '#c69a59';
      const oakPlankLeft = '#a67b3d';
      const oakPlankRight = '#8c6328';

      // 1. Oak Signpost near Bridge Landing (x: 7.4, y: 62.2)
      list.push({
        xMin: 7.2, xMax: 7.8, yMin: 62.0, yMax: 62.6,
        draw: () => {
          // Wooden Post
          models.drawBox(ctx, 7.4, 62.2, 0, 0.16, 0.16, 0.65, oakLogSide, oakLogBark, oakLogBark, world.ox, world.oy);
          // Sign Board
          models.drawBox(ctx, 7.1, 62.1, 0.60, 0.70, 0.12, 0.40, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          // Pixel Text
          const sp = isoToScreen(7.45, 62.15, 0.85, world.ox, world.oy);
          ctx.fillStyle = '#382314';
          ctx.font = 'bold 7px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('MINECRAFT', sp.x, sp.y - 2);
          ctx.fillText('SANCTUARY', sp.x, sp.y + 6);
        }
      });

      // 2. Classic Oak Wood Cabin (x: 2..6, y: 63..67)
      // Corner Posts (Logs)
      const cabinPosts = [
        { gx: 2.0, gy: 63.0 },
        { gx: 5.6, gy: 63.0 },
        { gx: 2.0, gy: 66.6 },
        { gx: 5.6, gy: 66.6 }
      ];
      cabinPosts.forEach(cp => {
        list.push({
          xMin: cp.gx, xMax: cp.gx + 0.42, yMin: cp.gy, yMax: cp.gy + 0.42,
          draw: () => models.drawBox(ctx, cp.gx, cp.gy, 0, 0.42, 0.42, 2.40, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy)
        });
      });

      // North Wall: x: 2..6, y: 63.0 (Doorway at x: 4.0..5.0)
      list.push({
        xMin: 2.0, xMax: 4.0, yMin: 62.8, yMax: 63.2,
        draw: () => models.drawBox(ctx, 2.42, 63.0, 0, 1.58, 0.22, 2.30, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy)
      });
      list.push({
        xMin: 5.0, xMax: 5.6, yMin: 62.8, yMax: 63.2,
        draw: () => models.drawBox(ctx, 5.0, 63.0, 0, 0.60, 0.22, 2.30, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy)
      });
      // Doorway Lintel
      list.push({
        xMin: 4.0, xMax: 5.0, yMin: 62.8, yMax: 63.2,
        draw: () => models.drawBox(ctx, 4.0, 63.0, 1.95, 1.0, 0.22, 0.35, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy)
      });

      // West Wall with 2x2 Glass Window Pane (x: 2.0, y: 63..67)
      list.push({
        xMin: 1.8, xMax: 2.2, yMin: 63.4, yMax: 66.6,
        draw: () => {
          // Bottom sill & Top lintel
          models.drawBox(ctx, 2.0, 63.42, 0, 0.22, 3.18, 0.65, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          models.drawBox(ctx, 2.0, 63.42, 1.85, 0.22, 3.18, 0.45, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          // Glass Pane
          const p0 = isoToScreen(2.05, 64.2, 0.65, world.ox, world.oy);
          const p1 = isoToScreen(2.05, 65.8, 0.65, world.ox, world.oy);
          const p2 = isoToScreen(2.05, 65.8, 1.85, world.ox, world.oy);
          const p3 = isoToScreen(2.05, 64.2, 1.85, world.ox, world.oy);
          ctx.fillStyle = 'rgba(186, 230, 253, 0.35)';
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // East Wall with 2x2 Glass Window Pane (x: 5.6, y: 63..67)
      list.push({
        xMin: 5.6, xMax: 6.0, yMin: 63.4, yMax: 66.6,
        draw: () => {
          models.drawBox(ctx, 5.78, 63.42, 0, 0.22, 3.18, 0.65, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          models.drawBox(ctx, 5.78, 63.42, 1.85, 0.22, 3.18, 0.45, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          const p0 = isoToScreen(5.82, 64.2, 0.65, world.ox, world.oy);
          const p1 = isoToScreen(5.82, 65.8, 0.65, world.ox, world.oy);
          const p2 = isoToScreen(5.82, 65.8, 1.85, world.ox, world.oy);
          const p3 = isoToScreen(5.82, 64.2, 1.85, world.ox, world.oy);
          ctx.fillStyle = 'rgba(186, 230, 253, 0.35)';
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // South Wall (along y = 67.0, x: 2..6)
      list.push({
        xMin: 2.0, xMax: 6.0, yMin: 66.8, yMax: 67.2,
        draw: () => models.drawBox(ctx, 2.42, 66.78, 0, 3.18, 0.22, 2.30, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy)
      });

      // 3. Cabin Interior Furniture
      // A. Minecraft Red Bed (x: 2.4, y: 65.0)
      list.push({
        xMin: 2.3, xMax: 3.5, yMin: 65.0, yMax: 66.8,
        draw: () => {
          // Oak Legs & Wooden Slat Base (z: 0..0.18)
          models.drawBox(ctx, 2.4, 65.0, 0, 0.95, 1.70, 0.18, '#582b0c', '#3f1d08', '#291006', world.ox, world.oy);
          // Red Wool Mattress (z: 0.18..0.38)
          models.drawBox(ctx, 2.4, 65.0, 0.18, 0.95, 1.70, 0.20, '#dc2626', '#b91c1c', '#991b1b', world.ox, world.oy);
          // White Fluffy Wool Pillow (z: 0.38..0.45 at head)
          models.drawBox(ctx, 2.42, 65.05, 0.38, 0.90, 0.45, 0.08, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);
        }
      });

      // B. Crafting Table (x: 5.1, y: 63.8)
      list.push({
        xMin: 5.0, xMax: 5.8, yMin: 63.7, yMax: 64.5,
        draw: () => {
          // Main Block
          models.drawBox(ctx, 5.1, 63.8, 0, 0.70, 0.70, 0.70, '#b88a53', '#85592e', '#603c19', world.ox, world.oy);
          // 3x3 Grid on Top Face
          const tp = isoToScreen(5.45, 64.15, 0.70, world.ox, world.oy);
          ctx.strokeStyle = '#582b0c';
          ctx.lineWidth = 1.0;
          ctx.strokeRect(tp.x - 7, tp.y - 4, 14, 8);
        }
      });

      // C. Cobblestone Furnace (x: 5.1, y: 65.2)
      list.push({
        xMin: 5.0, xMax: 5.8, yMin: 65.1, yMax: 65.9,
        draw: () => {
          // Cobblestone Cube
          models.drawBox(ctx, 5.1, 65.2, 0, 0.70, 0.70, 0.70, '#64748b', '#475569', '#334155', world.ox, world.oy);
          // Burning Orifice on Front Face
          const fp = isoToScreen(5.45, 65.2, 0.32, world.ox, world.oy);
          ctx.fillStyle = '#f97316';
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 6;
          ctx.fillRect(fp.x - 4, fp.y - 3, 8, 6);
          ctx.shadowBlur = 0;
        }
      });

      // D. Wooden Chest (x: 2.4, y: 63.6)
      list.push({
        xMin: 2.3, xMax: 3.1, yMin: 63.5, yMax: 64.3,
        draw: () => {
          // Oak Chest
          models.drawBox(ctx, 2.4, 63.6, 0, 0.65, 0.65, 0.58, '#b45309', '#92400e', '#78350f', world.ox, world.oy);
          // Silver Lock Latch
          const lp = isoToScreen(2.72, 63.6, 0.35, world.ox, world.oy);
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(lp.x - 2, lp.y - 3, 4, 6);
        }
      });

      // E. Wall Torch (at x: 3.5, y: 63.1, z: 1.5)
      list.push({
        xMin: 3.4, xMax: 3.7, yMin: 63.0, yMax: 63.3,
        draw: () => {
          models.drawBox(ctx, 3.5, 63.1, 1.20, 0.08, 0.08, 0.40, '#78350f', '#58240a', '#451a03', world.ox, world.oy);
          const tp = isoToScreen(3.54, 63.14, 1.62, world.ox, world.oy);
          ctx.fillStyle = '#facc15';
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 8;
          ctx.fillRect(tp.x - 3, tp.y - 3, 6, 6);
          ctx.shadowBlur = 0;
        }
      });

      // 4. Farmland & Crops (x: 8..11, y: 64..67)
      // Center 1x1 Water Hole & Lilypad (x: 9.5, y: 65.5)
      list.push({
        xMin: 9.4, xMax: 10.6, yMin: 65.4, yMax: 66.6,
        draw: () => {
          // Deep Blue Water
          models.drawBox(ctx, 9.5, 65.5, 0, 0.90, 0.90, 0.05, '#2563eb', '#1d4ed8', '#1e40af', world.ox, world.oy);
          // Green Lilypad
          const lp = isoToScreen(9.95, 65.95, 0.06, world.ox, world.oy);
          ctx.fillStyle = '#16a34a';
          ctx.beginPath();
          ctx.arc(lp.x, lp.y, 6, 0.2, Math.PI * 1.9);
          ctx.lineTo(lp.x, lp.y);
          ctx.fill();
        }
      });

      // Farmland Crops: Wheat & Carrots
      const crops = [
        { gx: 8.6, gy: 64.6, type: 'wheat' },
        { gx: 9.5, gy: 64.6, type: 'carrot' },
        { gx: 10.4, gy: 64.6, type: 'wheat' },
        { gx: 8.6, gy: 66.4, type: 'carrot' },
        { gx: 10.4, gy: 66.4, type: 'wheat' }
      ];
      crops.forEach(c => {
        list.push({
          xMin: c.gx, xMax: c.gx + 0.60, yMin: c.gy, yMax: c.gy + 0.60,
          draw: () => {
            // Tilled Moist Soil Mound
            models.drawBox(ctx, c.gx, c.gy, 0, 0.60, 0.60, 0.12, '#382314', '#26170d', '#1a0f08', world.ox, world.oy);
            const cp = isoToScreen(c.gx + 0.30, c.gy + 0.30, 0.12, world.ox, world.oy);
            if (c.type === 'wheat') {
              // Golden Pixel Wheat Stalks
              ctx.strokeStyle = '#eab308';
              ctx.lineWidth = 2.2;
              ctx.beginPath();
              ctx.moveTo(cp.x - 3, cp.y); ctx.lineTo(cp.x - 4, cp.y - 12);
              ctx.moveTo(cp.x, cp.y); ctx.lineTo(cp.x, cp.y - 14);
              ctx.moveTo(cp.x + 3, cp.y); ctx.lineTo(cp.x + 4, cp.y - 12);
              ctx.stroke();
            } else {
              // Green Feathered Carrot Tops
              ctx.fillStyle = '#ea580c';
              ctx.fillRect(cp.x - 2, cp.y - 2, 4, 3);
              ctx.strokeStyle = '#22c55e';
              ctx.lineWidth = 1.8;
              ctx.beginPath();
              ctx.moveTo(cp.x, cp.y - 2); ctx.lineTo(cp.x - 3, cp.y - 9);
              ctx.moveTo(cp.x, cp.y - 2); ctx.lineTo(cp.x + 3, cp.y - 9);
              ctx.stroke();
            }
          }
        });
      });

      // Oak Fences around Farmland
      const fencePosts = [
        { gx: 8.0, gy: 64.0 }, { gx: 11.2, gy: 64.0 },
        { gx: 8.0, gy: 67.0 }, { gx: 11.2, gy: 67.0 }
      ];
      fencePosts.forEach(fp => {
        list.push({
          xMin: fp.gx, xMax: fp.gx + 0.25, yMin: fp.gy, yMax: fp.gy + 0.25,
          draw: () => models.drawBox(ctx, fp.gx, fp.gy, 0, 0.20, 0.20, 0.70, '#85592e', '#603c19', '#49331e', world.ox, world.oy)
        });
      });

      // 5. Blocky Minecraft Sheep (x: 9.2, y: 62.5)
      list.push({
        xMin: 8.8, xMax: 9.8, yMin: 62.0, yMax: 63.0,
        draw: () => {
          const sx = 9.2, sy = 62.5;
          // 4 Blocky Legs
          models.drawBox(ctx, sx, sy, 0, 0.14, 0.14, 0.35, '#cbd5e1', '#94a3b8', '#64748b', world.ox, world.oy);
          models.drawBox(ctx, sx + 0.40, sy, 0, 0.14, 0.14, 0.35, '#cbd5e1', '#94a3b8', '#64748b', world.ox, world.oy);
          models.drawBox(ctx, sx, sy + 0.50, 0, 0.14, 0.14, 0.35, '#cbd5e1', '#94a3b8', '#64748b', world.ox, world.oy);
          models.drawBox(ctx, sx + 0.40, sy + 0.50, 0, 0.14, 0.14, 0.35, '#cbd5e1', '#94a3b8', '#64748b', world.ox, world.oy);
          // Cubic Fluffy White Body (z: 0.35..0.85)
          models.drawBox(ctx, sx - 0.05, sy - 0.05, 0.35, 0.65, 0.75, 0.50, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);
          // Cubic Head lowered toward ground for grazing
          models.drawBox(ctx, sx + 0.10, sy - 0.35, 0.25, 0.35, 0.35, 0.35, '#f8fafc', '#fbcfe8', '#e2e8f0', world.ox, world.oy);
          // Pixel Eyes
          const ep = isoToScreen(sx + 0.25, sy - 0.36, 0.45, world.ox, world.oy);
          ctx.fillStyle = '#020617';
          ctx.fillRect(ep.x - 4, ep.y - 2, 2.5, 2.5);
          ctx.fillRect(ep.x + 2, ep.y - 2, 2.5, 2.5);
        }
      });

      // 6. Blocky Minecraft Oak Tree (x: 1.8, y: 68.2)
      list.push({
        xMin: 1.2, xMax: 2.8, yMin: 67.5, yMax: 69.2,
        draw: () => {
          const tx = 1.8, ty = 68.2;
          // Trunk (z: 0..2.2)
          models.drawBox(ctx, tx, ty, 0, 0.55, 0.55, 2.20, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy);
          // Stepped Cubic Foliage Canopy
          // Layer 1: wide 2.2 x 2.2 (z: 1.8..2.6)
          models.drawBox(ctx, tx - 0.85, ty - 0.85, 1.80, 2.25, 2.25, 0.80, '#2e7d32', '#1b5e20', '#144617', world.ox, world.oy);
          // Layer 2: top cube 1.4 x 1.4 (z: 2.6..3.4)
          models.drawBox(ctx, tx - 0.42, ty - 0.42, 2.60, 1.40, 1.40, 0.80, '#388e3c', '#2e7d32', '#1b5e20', world.ox, world.oy);
        }
      });
    }
  };

  window.GamingDimensionPrefab = GamingDimensionPrefab;
})(window);
