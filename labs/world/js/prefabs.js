// ============================================================================
// Ludwigia World — Modular Architecture Prefabs
// Gaming Dimension: Cyber Cafe Enclosure, Symmetric ARAM Bridge & Minecraft Island
// ============================================================================

(function(window) {
  'use strict';

  const GamingDimensionPrefab = {
    id: 'gaming_dimension',

    // --- 1. Collision & Navigation Grid Setup ---
    initNav(nav) {
      if (!nav) return;

      // ======================================================================
      // A. CYBER CAFE (x: 4..14, y: 49..56) — 6 tiles South of Sanmin School
      // ======================================================================
      // North Wall: y = 48.8, x: 4..14 with North Entrance at x: 8..10
      nav.setBlock(4.0, 48.8, 4.0, 0.45, true);   // North Wall Left (x: 4..8)
      nav.setBlock(10.0, 48.8, 4.2, 0.45, true);  // North Wall Right (x: 10..14.2)

      // West Wall: Floor-to-ceiling panoramic glass curtain wall (x = 3.8, y: 48.8..56.2)
      nav.setBlock(3.8, 48.8, 0.45, 7.4, true);

      // East Wall: Floor-to-ceiling panoramic glass curtain wall overlooking chasm (x = 14.0, y: 48.8..56.2)
      nav.setBlock(14.0, 48.8, 0.45, 7.4, true);

      // South Wall: y = 56.0, x: 4..14 with South Abyss Portal doorway at x: 8..10
      nav.setBlock(4.0, 56.0, 4.0, 0.45, true);   // South Wall Left (x: 4..8)
      nav.setBlock(10.0, 56.0, 4.2, 0.45, true);  // South Wall Right (x: 10..14.2)

      // Cyber Cafe Internal Rigs & Snack Bar
      nav.setBlock(5.2, 50.2, 1.4, 0.8, true);    // Rig 1
      nav.setBlock(7.0, 50.2, 1.4, 0.8, true);    // Rig 2
      nav.setBlock(11.0, 50.2, 1.4, 0.8, true);   // Rig 3
      nav.setBlock(5.2, 53.5, 1.4, 0.8, true);    // Rig 4
      nav.setBlock(7.0, 53.5, 1.4, 0.8, true);    // Rig 5
      nav.setBlock(11.0, 53.5, 1.4, 0.8, true);   // Rig 6
      nav.setBlock(11.5, 52.0, 1.8, 0.85, true);  // Snack & Monster Bar

      // ======================================================================
      // B. HOWLING ABYSS NORTH-SOUTH BRIDGE (x: 6..12, y: 56..92, 36 tiles long!)
      // ======================================================================
      // West Balustrade Railing (blocks falling into West Abyss)
      nav.setBlock(5.0, 56.0, 1.0, 36.2, true);
      // East Balustrade Railing (blocks falling into East Abyss)
      nav.setBlock(13.0, 56.0, 1.0, 36.2, true);

      // Symmetrical Artifacts Collision Obstacles
      nav.setBlock(8.0, 57.5, 2.0, 1.8, true);   // Blue Nexus
      nav.setBlock(8.3, 60.5, 1.4, 1.4, true);   // Blue Inhibitor
      nav.setBlock(8.2, 63.5, 1.6, 1.6, true);   // Blue Inner Turret
      nav.setBlock(8.2, 67.5, 1.6, 1.6, true);   // Blue Outer Turret

      nav.setBlock(8.2, 79.5, 1.6, 1.6, true);   // Red Outer Turret
      nav.setBlock(8.2, 83.5, 1.6, 1.6, true);   // Red Inner Turret
      nav.setBlock(8.3, 86.5, 1.4, 1.4, true);   // Red Inhibitor
      nav.setBlock(8.0, 89.5, 2.0, 1.8, true);   // Red Nexus

      // ======================================================================
      // C. THE MINECRAFT ISLAND (x: 2..16, y: 92..110)
      // ======================================================================
      // Oak Wood Cabin (x: 4..10, y: 96..102, doorway at x: 6.5..7.5, y: 96)
      nav.setBlock(4.0, 96.0, 2.5, 0.40, true);  // North Wall Left (x: 4.0..6.5)
      nav.setBlock(7.5, 96.0, 2.5, 0.40, true);  // North Wall Right (x: 7.5..10.0)
      nav.setBlock(3.8, 96.0, 0.40, 6.2, true);  // West Wall
      nav.setBlock(10.0, 96.0, 0.40, 6.2, true); // East Wall
      nav.setBlock(4.0, 102.0, 6.2, 0.40, true); // South Wall

      // Cabin Furniture Obstacles
      nav.setBlock(4.5, 98.2, 1.4, 1.8, true);   // Minecraft Red Bed
      nav.setBlock(8.8, 97.2, 0.8, 0.8, true);   // Crafting Table
      nav.setBlock(8.8, 99.2, 0.8, 0.8, true);   // Furnace
      nav.setBlock(4.5, 96.8, 0.8, 0.8, true);   // Chest

      // Farmland Fences (x: 11..15, y: 96..101, gate at x: 11, y: 98)
      nav.setBlock(11.0, 96.0, 0.35, 2.0, true); // West Fence Top
      nav.setBlock(11.0, 99.0, 0.35, 2.0, true); // West Fence Bottom (leaves 98..99 open as gate!)
      nav.setBlock(15.0, 96.0, 0.35, 5.0, true); // East Fence
      nav.setBlock(11.0, 96.0, 4.2, 0.35, true); // North Fence
      nav.setBlock(11.0, 101.0, 4.2, 0.35, true);// South Fence

      // Tree Trunk Obstacle
      nav.setBlock(2.7, 105.0, 0.8, 0.8, true);  // Oak Tree Trunk
    },

    // --- 2. Register Bed Furniture Spot for Minecraft Red Bed ---
    initFurniture(charManager) {
      if (!charManager || !charManager.furnitureSpots) return;
      if (!charManager.furnitureSpots.some(f => f.id === 'minecraft_bed')) {
        charManager.furnitureSpots.push({
          id: 'minecraft_bed',
          type: 'bed',
          zone: 'minecraft_sanctuary',
          x: 5.2,
          y: 99.2,
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
      // A. CYBER CAFE ENCLOSURE & PANORAMIC GLASS CURTAIN WALLS (x: 4..14, y: 49..56)
      // ======================================================================
      const cyberWallT = '#0f172a';
      const cyberWallL = '#090d16';
      const cyberWallR = '#020617';

      // 1. North Wall (y = 48.8, x: 4..14, doorway at x: 8..10)
      list.push({
        xMin: 4.0, xMax: 8.0, yMin: 48.6, yMax: 49.0,
        draw: () => models.drawBox(ctx, 4.0, 48.8, 0, 4.0, 0.25, H, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy, cyberWallR)
      });
      list.push({
        xMin: 10.0, xMax: 14.2, yMin: 48.6, yMax: 49.0,
        draw: () => models.drawBox(ctx, 10.0, 48.8, 0, 4.2, 0.25, H, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy, cyberWallR)
      });
      // Overhead North Door Lintel & Marquee Sign
      list.push({
        xMin: 8.0, xMax: 10.0, yMin: 48.6, yMax: 49.0,
        draw: () => {
          models.drawBox(ctx, 8.0, 48.8, 2.20, 2.0, 0.25, H - 2.20, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);
          models.drawCyberCafeSign(ctx, 7.6, 48.7, world.ox, world.oy);
        }
      });

      // 2. West Panoramic Glass Curtain Wall (x = 3.8, y: 48.8..56.2)
      list.push({
        xMin: 3.6, xMax: 4.1, yMin: 48.8, yMax: 56.2,
        draw: () => {
          const wLen = 7.4;
          models.drawBox(ctx, 3.8, 48.8, 0, 0.25, wLen, 0.40, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);
          models.drawBox(ctx, 3.8, 48.8, 2.30, 0.25, wLen, H - 2.30, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);
          for (let my = 50.8; my <= 55.2; my += 2.0) {
            models.drawBox(ctx, 3.8, my, 0.40, 0.25, 0.18, 1.90, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);
          }
          for (let gy = 48.8; gy < 56.0; gy += 2.0) {
            const p0 = isoToScreen(3.85, gy, 0.40, world.ox, world.oy);
            const p1 = isoToScreen(3.85, gy + 1.82, 0.40, world.ox, world.oy);
            const p2 = isoToScreen(3.85, gy + 1.82, 2.30, world.ox, world.oy);
            const p3 = isoToScreen(3.85, gy, 2.30, world.ox, world.oy);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p0.x + 3, p0.y - 4); ctx.lineTo(p2.x - 3, p2.y + 4);
            ctx.stroke();
          }
        }
      });

      // 3. East Panoramic Glass Curtain Wall Overlooking Chasm (x = 14.0, y: 48.8..56.2)
      list.push({
        xMin: 13.8, xMax: 14.3, yMin: 48.8, yMax: 56.2,
        draw: () => {
          const wLen = 7.4;
          models.drawBox(ctx, 14.0, 48.8, 0, 0.25, wLen, 0.40, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);
          models.drawBox(ctx, 14.0, 48.8, 2.30, 0.25, wLen, H - 2.30, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);
          for (let my = 50.8; my <= 55.2; my += 2.0) {
            models.drawBox(ctx, 14.0, my, 0.40, 0.25, 0.18, 1.90, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy);
          }
          for (let gy = 48.8; gy < 56.0; gy += 2.0) {
            const p0 = isoToScreen(14.05, gy, 0.40, world.ox, world.oy);
            const p1 = isoToScreen(14.05, gy + 1.82, 0.40, world.ox, world.oy);
            const p2 = isoToScreen(14.05, gy + 1.82, 2.30, world.ox, world.oy);
            const p3 = isoToScreen(14.05, gy, 2.30, world.ox, world.oy);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.40)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p0.x + 4, p0.y - 6); ctx.lineTo(p2.x - 4, p2.y + 6);
            ctx.stroke();
          }
        }
      });

      // 4. South Wall & Abyss Portal Air-lock Gateway (along y = 56.0, x: 4..14, doorway at x: 8..10)
      list.push({
        xMin: 4.0, xMax: 8.0, yMin: 55.8, yMax: 56.2,
        draw: () => models.drawBox(ctx, 4.0, 56.0, 0, 4.0, 0.25, H, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy)
      });
      list.push({
        xMin: 10.0, xMax: 14.2, yMin: 55.8, yMax: 56.2,
        draw: () => models.drawBox(ctx, 10.0, 56.0, 0, 4.2, 0.25, H, cyberWallT, cyberWallL, cyberWallR, world.ox, world.oy)
      });
      // South Abyss Portal Overhead Beam & Runic LED Sign
      list.push({
        xMin: 7.8, xMax: 10.2, yMin: 55.8, yMax: 56.3,
        draw: () => {
          models.drawBox(ctx, 7.8, 56.0, 2.15, 2.4, 0.35, 0.70, '#1e293b', '#0f172a', '#020617', world.ox, world.oy);
          const pP = isoToScreen(9.0, 56.05, 2.45, world.ox, world.oy);
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.fillRect(pP.x - 24, pP.y - 4, 48, 8);
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('⚡ ABYSS GATEWAY ⚡', pP.x, pP.y + 3);
        }
      });

      // 5. Cyber Cafe Internal Stations (Rigs & Snack Counter)
      [5.2, 7.0, 11.0].forEach(rx => {
        list.push({
          xMin: rx, xMax: rx + 1.4, yMin: 50.2, yMax: 51.1,
          draw: () => models.drawCyberCafeRig(ctx, rx, 50.2, world.ox, world.oy, false)
        });
        list.push({
          xMin: rx, xMax: rx + 1.4, yMin: 53.5, yMax: 54.4,
          draw: () => models.drawCyberCafeRig(ctx, rx, 53.5, world.ox, world.oy, true)
        });
      });
      list.push({
        xMin: 11.5, xMax: 13.3, yMin: 52.0, yMax: 53.5,
        draw: () => models.drawCyberSnackBar(ctx, 11.5, 52.0, world.ox, world.oy)
      });

      // ======================================================================
      // B. HOWLING ABYSS NORTH-SOUTH SUSPENSION BRIDGE (x: 6..12, y: 56..92)
      // Fully Symmetrical ARAM Layout (Blue Nexus -> Blue Turrets -> Mid -> Red Turrets -> Red Nexus)
      // ======================================================================
      // 1. Bridgehead Portals & Guardian Obelisks
      list.push({
        xMin: 5.6, xMax: 6.4, yMin: 56.0, yMax: 56.8,
        draw: () => models.drawAbyssEntranceGateway(ctx, 5.6, 56.0, world.ox, world.oy)
      });
      list.push({
        xMin: 11.6, xMax: 12.4, yMin: 56.0, yMax: 56.8,
        draw: () => models.drawAbyssEntranceGateway(ctx, 11.6, 56.0, world.ox, world.oy)
      });
      list.push({
        xMin: 5.6, xMax: 6.4, yMin: 91.5, yMax: 92.3,
        draw: () => models.drawAbyssEntranceGateway(ctx, 5.6, 91.5, world.ox, world.oy)
      });
      list.push({
        xMin: 11.6, xMax: 12.4, yMin: 91.5, yMax: 92.3,
        draw: () => models.drawAbyssEntranceGateway(ctx, 11.6, 91.5, world.ox, world.oy)
      });

      // 2. Parapet Rails along West (x: 5.8) and East (x: 12.0)
      list.push({
        xMin: 5.7, xMax: 6.1, yMin: 56.8, yMax: 70.5,
        draw: () => models.drawAbyssParapetSegment(ctx, 5.8, 56.8, 0.35, 13.7, world.ox, world.oy)
      });
      list.push({
        xMin: 5.7, xMax: 6.1, yMin: 70.5, yMax: 72.5,
        draw: () => models.drawAbyssBrokenRailing(ctx, 5.8, 70.5, world.ox, world.oy, true)
      });
      list.push({
        xMin: 5.7, xMax: 6.1, yMin: 72.5, yMax: 91.5,
        draw: () => models.drawAbyssParapetSegment(ctx, 5.8, 72.5, 0.35, 19.0, world.ox, world.oy)
      });

      list.push({
        xMin: 11.9, xMax: 12.3, yMin: 56.8, yMax: 76.5,
        draw: () => models.drawAbyssParapetSegment(ctx, 12.0, 56.8, 0.35, 19.7, world.ox, world.oy)
      });
      list.push({
        xMin: 11.9, xMax: 12.3, yMin: 76.5, yMax: 78.5,
        draw: () => models.drawAbyssBrokenRailing(ctx, 12.0, 76.5, world.ox, world.oy, false)
      });
      list.push({
        xMin: 11.9, xMax: 12.3, yMin: 78.5, yMax: 91.5,
        draw: () => models.drawAbyssParapetSegment(ctx, 12.0, 78.5, 0.35, 13.0, world.ox, world.oy)
      });

      // 3. Fire Braziers along North-South Parapets
      [
        { gx: 5.8, gy: 60.0 }, { gx: 5.8, gy: 66.0 }, { gx: 5.8, gy: 82.0 }, { gx: 5.8, gy: 88.0 },
        { gx: 12.0, gy: 60.0 }, { gx: 12.0, gy: 66.0 }, { gx: 12.0, gy: 82.0 }, { gx: 12.0, gy: 88.0 }
      ].forEach(b => {
        list.push({
          xMin: b.gx, xMax: b.gx + 0.65, yMin: b.gy, yMax: b.gy + 0.65,
          draw: () => models.drawAbyssBrazier(ctx, b.gx, b.gy, world.ox, world.oy)
        });
      });

      // 4. Guardian Ram-Horn Statues
      [
        { gx: 5.2, gy: 62.0, isNorth: true },
        { gx: 5.2, gy: 86.0, isNorth: true },
        { gx: 12.0, gy: 62.0, isNorth: false },
        { gx: 12.0, gy: 86.0, isNorth: false }
      ].forEach(s => {
        list.push({
          xMin: s.gx, xMax: s.gx + 1.2, yMin: s.gy, yMax: s.gy + 1.2,
          draw: () => models.drawAbyssGuardianStatue(ctx, s.gx, s.gy, world.ox, world.oy, s.isNorth)
        });
      });

      // 5. Symmetric Lane Artifacts:
      // Blue Base
      list.push({
        xMin: 7.9, xMax: 10.1, yMin: 57.5, yMax: 59.5,
        draw: () => models.drawAbyssNexus(ctx, 7.9, 57.5, world.ox, world.oy)
      });
      list.push({
        xMin: 8.3, xMax: 9.7, yMin: 60.5, yMax: 61.9,
        draw: () => models.drawAbyssInhibitor(ctx, 8.3, 60.5, world.ox, world.oy)
      });
      list.push({
        xMin: 8.2, xMax: 9.8, yMin: 63.5, yMax: 65.1,
        draw: () => models.drawAbyssTurret(ctx, 8.2, 63.5, world.ox, world.oy)
      });
      list.push({
        xMin: 8.2, xMax: 9.8, yMin: 67.5, yMax: 69.1,
        draw: () => models.drawAbyssTurret(ctx, 8.2, 67.5, world.ox, world.oy)
      });

      // Blue Health Relic
      list.push({
        xMin: 7.2, xMax: 8.4, yMin: 71.0, yMax: 72.2,
        draw: () => models.drawHealthRelic(ctx, 7.5, 71.2, world.ox, world.oy)
      });

      // Mid-Lane Frost Bushes (Lining the west and east parapets!)
      for (let by = 73.0; by <= 75.2; by += 1.0) {
        list.push({
          xMin: 6.2, xMax: 7.2, yMin: by, yMax: by + 0.8,
          draw: () => models.drawAbyssBrush(ctx, 6.4, by, world.ox, world.oy)
        });
        list.push({
          xMin: 10.8, xMax: 11.8, yMin: by, yMax: by + 0.8,
          draw: () => models.drawAbyssBrush(ctx, 11.0, by, world.ox, world.oy)
        });
      }

      // Poros Playing in Mid-Lane
      list.push({
        xMin: 8.2, xMax: 8.8, yMin: 74.0, yMax: 74.6,
        draw: () => models.drawPoro(ctx, 8.4, 74.2, world.ox, world.oy, 'snack')
      });
      list.push({
        xMin: 9.5, xMax: 10.1, yMin: 74.8, yMax: 75.4,
        draw: () => models.drawPoro(ctx, 9.7, 75.0, world.ox, world.oy, 'tongue')
      });

      // Red Health Relic
      list.push({
        xMin: 9.6, xMax: 10.8, yMin: 76.8, yMax: 78.0,
        draw: () => models.drawHealthRelic(ctx, 10.0, 77.2, world.ox, world.oy)
      });

      // Red Base
      list.push({
        xMin: 8.2, xMax: 9.8, yMin: 79.5, yMax: 81.1,
        draw: () => models.drawAbyssTurret(ctx, 8.2, 79.5, world.ox, world.oy)
      });
      list.push({
        xMin: 8.2, xMax: 9.8, yMin: 83.5, yMax: 85.1,
        draw: () => models.drawAbyssTurret(ctx, 8.2, 83.5, world.ox, world.oy)
      });
      list.push({
        xMin: 8.3, xMax: 9.7, yMin: 86.5, yMax: 87.9,
        draw: () => models.drawAbyssInhibitor(ctx, 8.3, 86.5, world.ox, world.oy)
      });
      list.push({
        xMin: 7.9, xMax: 10.1, yMin: 89.5, yMax: 91.5,
        draw: () => models.drawAbyssNexus(ctx, 7.9, 89.5, world.ox, world.oy)
      });

      // ======================================================================
      // C. THE MINECRAFT ISLAND (x: 2..16, y: 92..110)
      // ======================================================================
      const oakLogBark = '#49331e';
      const oakLogSide = '#6d4c28';
      const oakLogRing = '#9c7a4f';
      const oakPlankTop = '#c69a59';
      const oakPlankLeft = '#a67b3d';
      const oakPlankRight = '#8c6328';

      // 1. Oak Signpost at Island Entrance (x: 9.0, y: 93.0)
      list.push({
        xMin: 8.8, xMax: 9.6, yMin: 92.8, yMax: 93.6,
        draw: () => {
          models.drawBox(ctx, 9.0, 93.0, 0, 0.18, 0.18, 0.70, oakLogSide, oakLogBark, oakLogBark, world.ox, world.oy);
          models.drawBox(ctx, 8.6, 92.9, 0.65, 1.00, 0.14, 0.45, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          const sp = isoToScreen(9.10, 92.95, 0.90, world.ox, world.oy);
          ctx.fillStyle = '#382314';
          ctx.font = 'bold 7px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('MINECRAFT', sp.x, sp.y - 2);
          ctx.fillText('SANCTUARY', sp.x, sp.y + 6);
        }
      });

      // 2. Classic Minecraft Oak Wood Cabin (x: 4..10, y: 96..102)
      // Complete Solid Oak Wood Floor inside the cabin!
      list.push({
        xMin: 4.0, xMax: 10.0, yMin: 96.0, yMax: 102.0,
        draw: () => {
          models.drawBox(ctx, 4.0, 96.0, 0, 6.0, 6.0, 0.08, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
        }
      });

      // 4 Corner Oak Log Pillars (3 blocks high)
      const cabinPosts = [
        { gx: 4.0, gy: 96.0 },
        { gx: 9.4, gy: 96.0 },
        { gx: 4.0, gy: 101.4 },
        { gx: 9.4, gy: 101.4 }
      ];
      cabinPosts.forEach(cp => {
        list.push({
          xMin: cp.gx, xMax: cp.gx + 0.60, yMin: cp.gy, yMax: cp.gy + 0.60,
          draw: () => models.drawBox(ctx, cp.gx, cp.gy, 0, 0.60, 0.60, 2.30, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy)
        });
      });

      // North Wall with finished oak doorway: x: 4..10, y: 96.0 (Door at x: 6.6..7.8)
      list.push({
        xMin: 4.0, xMax: 6.6, yMin: 95.8, yMax: 96.2,
        draw: () => models.drawBox(ctx, 4.58, 96.0, 0, 2.02, 0.25, 2.20, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy)
      });
      list.push({
        xMin: 7.8, xMax: 10.0, yMin: 95.8, yMax: 96.2,
        draw: () => models.drawBox(ctx, 7.8, 96.0, 0, 1.62, 0.25, 2.20, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy)
      });
      list.push({
        xMin: 6.6, xMax: 7.8, yMin: 95.8, yMax: 96.2,
        draw: () => models.drawBox(ctx, 6.6, 96.0, 1.85, 1.20, 0.25, 0.35, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy)
      });

      // West Wall with 2x2 Glass Panes (x: 4.0, y: 96..102)
      list.push({
        xMin: 3.8, xMax: 4.2, yMin: 96.5, yMax: 101.5,
        draw: () => {
          models.drawBox(ctx, 4.0, 96.58, 0, 0.25, 4.84, 0.65, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          models.drawBox(ctx, 4.0, 96.58, 1.85, 0.25, 4.84, 0.35, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          const p0 = isoToScreen(4.05, 97.6, 0.65, world.ox, world.oy);
          const p1 = isoToScreen(4.05, 100.4, 0.65, world.ox, world.oy);
          const p2 = isoToScreen(4.05, 100.4, 1.85, world.ox, world.oy);
          const p3 = isoToScreen(4.05, 97.6, 1.85, world.ox, world.oy);
          ctx.fillStyle = 'rgba(186, 230, 253, 0.40)';
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // East Wall with 2x2 Glass Panes (x: 10.0, y: 96..102)
      list.push({
        xMin: 9.8, xMax: 10.2, yMin: 96.5, yMax: 101.5,
        draw: () => {
          models.drawBox(ctx, 9.75, 96.58, 0, 0.25, 4.84, 0.65, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          models.drawBox(ctx, 9.75, 96.58, 1.85, 0.25, 4.84, 0.35, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy);
          const p0 = isoToScreen(9.82, 97.6, 0.65, world.ox, world.oy);
          const p1 = isoToScreen(9.82, 100.4, 0.65, world.ox, world.oy);
          const p2 = isoToScreen(9.82, 100.4, 1.85, world.ox, world.oy);
          const p3 = isoToScreen(9.82, 97.6, 1.85, world.ox, world.oy);
          ctx.fillStyle = 'rgba(186, 230, 253, 0.40)';
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // South Wall (y = 102.0, x: 4..10)
      list.push({
        xMin: 4.0, xMax: 10.0, yMin: 101.8, yMax: 102.2,
        draw: () => models.drawBox(ctx, 4.58, 101.75, 0, 4.84, 0.25, 2.20, oakPlankTop, oakPlankLeft, oakPlankRight, world.ox, world.oy)
      });

      // Overhanging Finished Eaves / Roof Trim (z: 2.20..2.45)
      list.push({
        xMin: 3.8, xMax: 10.2, yMin: 95.8, yMax: 102.2,
        draw: () => {
          models.drawBox(ctx, 3.8, 95.8, 2.20, 6.4, 6.4, 0.18, '#582b0c', '#3f1d08', '#291006', world.ox, world.oy);
        }
      });

      // 3. Cabin Interior Furniture
      // A. Minecraft Red Bed (x: 4.8, y: 98.5)
      list.push({
        xMin: 4.6, xMax: 6.0, yMin: 98.4, yMax: 100.6,
        draw: () => {
          models.drawBox(ctx, 4.8, 98.5, 0, 1.05, 1.95, 0.18, '#582b0c', '#3f1d08', '#291006', world.ox, world.oy);
          models.drawBox(ctx, 4.8, 98.5, 0.18, 1.05, 1.95, 0.20, '#dc2626', '#b91c1c', '#991b1b', world.ox, world.oy);
          models.drawBox(ctx, 4.82, 98.55, 0.38, 1.00, 0.50, 0.08, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);
        }
      });

      // B. Crafting Table (x: 8.8, y: 97.2)
      list.push({
        xMin: 8.6, xMax: 9.6, yMin: 97.0, yMax: 98.0,
        draw: () => {
          models.drawBox(ctx, 8.8, 97.2, 0, 0.80, 0.80, 0.80, '#b88a53', '#85592e', '#603c19', world.ox, world.oy);
          const tp = isoToScreen(9.20, 97.60, 0.80, world.ox, world.oy);
          ctx.strokeStyle = '#582b0c';
          ctx.lineWidth = 1.0;
          ctx.strokeRect(tp.x - 8, tp.y - 4, 16, 9);
        }
      });

      // C. Cobblestone Furnace (x: 8.8, y: 99.2)
      list.push({
        xMin: 8.6, xMax: 9.6, yMin: 99.0, yMax: 100.0,
        draw: () => {
          models.drawBox(ctx, 8.8, 99.2, 0, 0.80, 0.80, 0.80, '#64748b', '#475569', '#334155', world.ox, world.oy);
          const fp = isoToScreen(9.20, 99.2, 0.35, world.ox, world.oy);
          ctx.fillStyle = '#f97316';
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 6;
          ctx.fillRect(fp.x - 5, fp.y - 4, 10, 7);
          ctx.shadowBlur = 0;
        }
      });

      // D. Large Wooden Chest (x: 4.8, y: 96.8)
      list.push({
        xMin: 4.6, xMax: 5.6, yMin: 96.6, yMax: 97.6,
        draw: () => {
          models.drawBox(ctx, 4.8, 96.8, 0, 0.80, 0.80, 0.65, '#b45309', '#92400e', '#78350f', world.ox, world.oy);
          const lp = isoToScreen(5.20, 96.8, 0.40, world.ox, world.oy);
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(lp.x - 2, lp.y - 3, 5, 7);
        }
      });

      // E. Wall Torch
      list.push({
        xMin: 6.4, xMax: 6.8, yMin: 96.0, yMax: 96.4,
        draw: () => {
          models.drawBox(ctx, 6.5, 96.1, 1.20, 0.10, 0.10, 0.45, '#78350f', '#58240a', '#451a03', world.ox, world.oy);
          const tp = isoToScreen(6.55, 96.15, 1.68, world.ox, world.oy);
          ctx.fillStyle = '#facc15';
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 8;
          ctx.fillRect(tp.x - 3, tp.y - 3, 6, 6);
          ctx.shadowBlur = 0;
        }
      });

      // 4. Continuous Rectangular Farmland & Crops (x: 11..15, y: 96..101)
      // Solid tilled soil bed & water channel
      list.push({
        xMin: 11.0, xMax: 15.0, yMin: 96.0, yMax: 101.0,
        draw: () => {
          // Continuous dark wet soil base
          models.drawBox(ctx, 11.0, 96.0, 0, 4.0, 5.0, 0.14, '#382314', '#26170d', '#1a0f08', world.ox, world.oy);
          // Center 1x1 Water Hole
          models.drawBox(ctx, 12.5, 98.0, 0.05, 1.0, 1.0, 0.09, '#2563eb', '#1d4ed8', '#1e40af', world.ox, world.oy);
          const lp = isoToScreen(13.0, 98.5, 0.15, world.ox, world.oy);
          ctx.fillStyle = '#16a34a';
          ctx.beginPath();
          ctx.arc(lp.x, lp.y, 7, 0.2, Math.PI * 1.9);
          ctx.lineTo(lp.x, lp.y);
          ctx.fill();
        }
      });

      // Crop Stalks: 2 dense rows of Wheat + 2 dense rows of Carrots
      for (let cy = 96.5; cy <= 100.5; cy += 1.0) {
        // Wheat column (x = 11.6)
        list.push({
          xMin: 11.4, xMax: 12.0, yMin: cy - 0.2, yMax: cy + 0.4,
          draw: () => {
            const cp = isoToScreen(11.6, cy, 0.14, world.ox, world.oy);
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(cp.x - 3, cp.y); ctx.lineTo(cp.x - 4, cp.y - 14);
            ctx.moveTo(cp.x, cp.y); ctx.lineTo(cp.x - 16);
            ctx.moveTo(cp.x + 3, cp.y); ctx.lineTo(cp.x + 4, cp.y - 14);
            ctx.stroke();
          }
        });
        // Carrot column (x = 14.2)
        list.push({
          xMin: 14.0, xMax: 14.6, yMin: cy - 0.2, yMax: cy + 0.4,
          draw: () => {
            const cp = isoToScreen(14.2, cy, 0.14, world.ox, world.oy);
            ctx.fillStyle = '#ea580c';
            ctx.fillRect(cp.x - 3, cp.y - 2, 6, 4);
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            ctx.moveTo(cp.x, cp.y - 2); ctx.lineTo(cp.x - 4, cp.y - 11);
            ctx.moveTo(cp.x, cp.y - 2); ctx.lineTo(cp.x + 4, cp.y - 11);
            ctx.stroke();
          }
        });
      }

      // Continuous Fencing surrounding the farmland
      list.push({
        xMin: 10.9, xMax: 15.1, yMin: 95.9, yMax: 101.1,
        draw: () => {
          // Posts
          const posts = [
            { gx: 11.0, gy: 96.0 }, { gx: 13.0, gy: 96.0 }, { gx: 15.0, gy: 96.0 },
            { gx: 15.0, gy: 98.5 }, { gx: 15.0, gy: 101.0 },
            { gx: 13.0, gy: 101.0 }, { gx: 11.0, gy: 101.0 },
            { gx: 11.0, gy: 97.0 }, { gx: 11.0, gy: 100.0 }
          ];
          posts.forEach(p => {
            models.drawBox(ctx, p.gx, p.gy, 0, 0.20, 0.20, 0.75, '#85592e', '#603c19', '#49331e', world.ox, world.oy);
          });
        }
      });

      // 5. Blocky Minecraft Sheep (grazing peacefully at x = 7.5, y = 104.5)
      list.push({
        xMin: 7.2, xMax: 8.4, yMin: 104.0, yMax: 105.2,
        draw: () => {
          const sx = 7.5, sy = 104.5;
          models.drawBox(ctx, sx, sy, 0, 0.16, 0.16, 0.40, '#cbd5e1', '#94a3b8', '#64748b', world.ox, world.oy);
          models.drawBox(ctx, sx + 0.45, sy, 0, 0.16, 0.16, 0.40, '#cbd5e1', '#94a3b8', '#64748b', world.ox, world.oy);
          models.drawBox(ctx, sx, sy + 0.55, 0, 0.16, 0.16, 0.40, '#cbd5e1', '#94a3b8', '#64748b', world.ox, world.oy);
          models.drawBox(ctx, sx + 0.45, sy + 0.55, 0, 0.16, 0.16, 0.40, '#cbd5e1', '#94a3b8', '#64748b', world.ox, world.oy);
          models.drawBox(ctx, sx - 0.06, sy - 0.06, 0.40, 0.75, 0.85, 0.55, '#f8fafc', '#e2e8f0', '#cbd5e1', world.ox, world.oy);
          models.drawBox(ctx, sx + 0.14, sy - 0.38, 0.30, 0.38, 0.38, 0.38, '#f8fafc', '#fbcfe8', '#e2e8f0', world.ox, world.oy);
          const ep = isoToScreen(sx + 0.32, sy - 0.39, 0.50, world.ox, world.oy);
          ctx.fillStyle = '#020617';
          ctx.fillRect(ep.x - 4, ep.y - 2, 2.5, 2.5);
          ctx.fillRect(ep.x + 2, ep.y - 2, 2.5, 2.5);
        }
      });

      // 6. Blocky Minecraft Oak Tree (at x: 2.8, y: 105.0)
      list.push({
        xMin: 2.0, xMax: 4.2, yMin: 104.0, yMax: 106.5,
        draw: () => {
          const tx = 2.8, ty = 105.0;
          models.drawBox(ctx, tx, ty, 0, 0.65, 0.65, 2.40, oakLogRing, oakLogSide, oakLogBark, world.ox, world.oy);
          models.drawBox(ctx, tx - 0.95, ty - 0.95, 2.00, 2.55, 2.55, 0.90, '#2e7d32', '#1b5e20', '#144617', world.ox, world.oy);
          models.drawBox(ctx, tx - 0.50, ty - 0.50, 2.90, 1.65, 1.65, 0.90, '#388e3c', '#2e7d32', '#1b5e20', world.ox, world.oy);
        }
      });
    }
  };

  window.GamingDimensionPrefab = GamingDimensionPrefab;
})(window);
