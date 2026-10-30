// ============================================================================
// Ludwigia World Controller — Main Orchestrator & Game Loop
// ============================================================================

(function(window) {
  'use strict';

  const {
    TW, TH, MAP_W, MAP_H,
    HOUSE_MAX_X, HOUSE_MAX_Y,
    DORM_MIN_X, DORM_MAX_X, DORM_MIN_Y, DORM_MAX_Y,
    AI_MIN_X, AI_MAX_X, AI_MIN_Y, AI_MAX_Y,
    LIB_MIN_X, LIB_MAX_X, LIB_MIN_Y, LIB_MAX_Y,
    SCHOOL_MIN_X, SCHOOL_MAX_X, SCHOOL_MIN_Y, SCHOOL_MAX_Y,
    DOUYIN_MIN_X, DOUYIN_MAX_X, DOUYIN_MIN_Y, DOUYIN_MAX_Y,
    CAFE_MIN_X, CAFE_MAX_X, CAFE_MIN_Y, CAFE_MAX_Y,
    COURT_MIN_X, COURT_MAX_X, COURT_MIN_Y, COURT_MAX_Y,
    isoToScreen, screenToIso,
    NavGrid,
    sortIsometricEntities,
    AmbientAudio
  } = window.LudwigWorldEngine;

  class LudwigiaWorld {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.audio = new AmbientAudio();
      this.nav = new NavGrid(MAP_W, MAP_H);
      this.models = new window.LudwigWorldModels(this);
      this.charManager = new window.LudwigWorldCharacters(this);

      // Camera & Zoom State
      this.zoom = 1.35;
      this.targetZoom = 1.35;
      this.outsideAlpha = 0.35;
      this.targetOutsideAlpha = 0.35;
      this.panX = 0;
      this.panY = 0;
      this.currentZone = 'ludwig_house';

      // Dynamic Cutaway Wall Alphas (1.0 = solid exterior when outside; ~0.32 = cutaway when inside)
      this.wallAlphaHouse = 0.32; // starts inside house
      this.wallAlphaDorm = 1.0;
      this.wallAlphaAi = 1.0;
      this.wallAlphaLib = 1.0;
      this.wallAlphaSchool = 1.0;
      this.wallAlphaDouyin = 1.0;
      this.wallAlphaCafe = 1.0;

      // Day / Night mood
      this.mood = 'auto';
      this.currentTimeState = 'day';

      // Door Proximity Progress (0 = closed, 1 = fully open)
      this.doorLudwigOpen = 0.0;
      this.doorLudwigSideOpen = 0.0;
      this.doorDormOpen = 0.0;
      this.doorAiOpen = 0.0;
      this.doorLibOpen = 0.0;
      this.doorSchoolOpen = 0.0;
      this.doorDouyinOpen = 0.0;
      this.douyinGateTimer = 2.0;
      this.douyinGateOpen = 0.0;
      this.douyinGateAnim = 0.0;
      this.douyinGateState = 'closed';
      this.douyinGateMessage = '';
      this.douyinGateBlocked = true;

      // Particles
      this.particles = [];
      this.initParticles();

      // Input keys
      this.keys = {};
      this.bindEvents();

      // Setup Obstacles
      this.setupWorldObstacles();

      // Camera Smoothing & Cinematic Dialogue Framing
      this.baseZoom = 1.35;
      this.cinematicZoomBoost = 0.0;
      this.camTargetX = 7.2;
      this.camTargetY = 7.2;
      this.camCurrentX = 7.2;
      this.camCurrentY = 7.2;
      this.cinematicTarget = null;

      // Time-Sliced Pathfinding Queue (Throttles NPC A* to 1 per frame)
      this.pathQueue = [];

      // Current render origin coordinates for static entity draw calls
      this.ox = 0;
      this.oy = 0;

      // Zero-GC Pre-baked Static World Entities
      this.staticEntities = this.buildStaticWorldEntities();

      // Load Characters from JSON
      this.charManager.loadCharacters('data/characters.json?v=2026-10-26-dialogues').then(() => {
        // Start Loop
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop.bind(this));
      });
    }

    get isDark() {
      return (this.currentTimeState === 'night' || this.currentTimeState === 'galaxy');
    }
    get wallL() {
      return this.isDark ? '#2a2e38' : '#e8e2d2';
    }
    get wallR() {
      return this.isDark ? '#1f232b' : '#d8d1be';
    }
    get wallT() {
      return this.isDark ? '#334155' : '#f1f5f9';
    }

    setCinematicFocus(player, char) {
      if (!char) return;
      const px = player ? player.x : char.x;
      const py = player ? player.y : char.y;
      this.cinematicTarget = {
        x: (px + char.x) * 0.5,
        y: (py + char.y) * 0.5
      };
      this.cinematicZoomBoost = 0.25;
    }

    clearCinematicFocus() {
      this.cinematicTarget = null;
      this.cinematicZoomBoost = 0.0;
    }

    requestNpcPath(char, targetX, targetY) {
      if (!char || char.isPlayer) return;
      const existing = this.pathQueue.find(q => q.char === char);
      if (existing) {
        existing.target = { x: targetX, y: targetY };
      } else {
        this.pathQueue.push({ char, target: { x: targetX, y: targetY } });
      }
    }

    setupWorldObstacles() {
      // 1. Ludwig's Family Residence (NW: x: 0..9, y: 0..9)
      this.nav.setBlock(0, 0, 10, 0.6, true);                  // Northeast Wall (y: 0)
      this.nav.setBlock(0, 0, 0.6, 10, true);                  // Northwest Wall (x: 0)
      // East Wall Doorway at y: 4.5 to 6.8 (keep tiles 5 and 6 100% open)
      this.nav.setBlock(HOUSE_MAX_X + 1, 0, 0.6, 4.2, true);   // East Wall Top (y: 0 to 4.2)
      this.nav.setBlock(HOUSE_MAX_X + 1, 7.0, 0.6, 3.0, true); // East Wall Bottom (y: 7.0 to 10)
      // South Terrace Doorway at x: 4.5 to 6.8 (keep tiles 5 and 6 100% open)
      this.nav.setBlock(0, HOUSE_MAX_Y + 1, 4.2, 0.6, true);   // South Terrace Wall Left (x: 0 to 4.2)
      this.nav.setBlock(7.0, HOUSE_MAX_Y + 1, 3.0, 0.6, true); // South Terrace Wall Right (x: 7.0 to 10)

      this.nav.setBlock(1.0, 1.0, 2.2, 2.3, true); // Master Bed
      this.nav.setBlock(6.0, 1.0, 2.5, 1.2, true); // Desk
      this.nav.setBlock(0.0, 3.8, 0.8, 2.6, true); // Bookshelf
      this.nav.setBlock(2.0, 5.0, 0.85, 2.0, true); // Living Room Sofa (accurate base footprint, rug is walkable)
      this.nav.setBlock(3.3, 5.5, 0.85, 1.0, true); // Coffee Table
      this.nav.setBlock(6.0, 5.0, 1.8, 1.4, true); // Dining Table

      // 2. Men's Dormitory 11 Room 211 (SW: x: 0..9, y: 17..26)
      this.nav.setBlock(0, DORM_MIN_Y, 10, 0.6, true);           // NE Wall
      this.nav.setBlock(0, DORM_MIN_Y, 0.6, 10, true);           // NW Wall
      // SE Wall Doorway at y: 20.5 to 22.8 (keep tiles 21 and 22 100% open)
      this.nav.setBlock(DORM_MAX_X + 1, DORM_MIN_Y, 0.6, 3.2, true);  // SE Wall Top (y: 17 to 20.2)
      this.nav.setBlock(DORM_MAX_X + 1, 23.0, 0.6, 4.0, true);        // SE Wall Bottom (y: 23.0 to 27)
      this.nav.setBlock(0, DORM_MAX_Y + 1, 10, 0.6, true);       // SW Wall

      // 4 Loft Bed/Desk Combos
      this.nav.setBlock(1.0, 17.5, 2.2, 1.6, true);   // Happy Wang (Bed 1)
      this.nav.setBlock(6.2, 17.5, 2.2, 1.6, true);   // Clark Wu (Bed 3)
      this.nav.setBlock(1.0, 24.5, 2.2, 1.6, true);   // Kerry Chang (Bed 2)
      this.nav.setBlock(6.2, 24.5, 2.2, 1.6, true);   // Jerry Chung (Bed 4)
      this.nav.setBlock(3.6, 20.8, 1.9, 2.0, true);   // Dorm Lounge Classic Sofa & Table

      // 3. Ludwigia AI Research Studio (NE: x: 18..27, y: 0..9)
      this.nav.setBlock(AI_MIN_X, 0, 10, 1, true);
      // West Doorway at y: 4.5 to 7.0 (keep tiles 5 and 6 100% open)
      this.nav.setBlock(AI_MIN_X, 0, 1, 4.2, true);
      this.nav.setBlock(AI_MIN_X, 7.0, 1, 3.0, true);
      this.nav.setBlock(AI_MAX_X + 1, 0, 1, 10, true);
      this.nav.setBlock(AI_MIN_X, AI_MAX_Y + 1, 10, 1, true);

      this.nav.setBlock(19.2, 1.2, 1.7, 1.1, true); // Server Cabinets
      this.nav.setBlock(23.5, 1.2, 2.5, 1.1, true); // AI Command Desk
      this.nav.setBlock(26.5, 4.0, 0.5, 2.4, true); // Whiteboard
      this.nav.setBlock(19.2, 7.2, 1.7, 1.1, true); // Espresso Bar

      // 4. Zone 4: Ludwigia Grand Library (SE: 18..27, 17..26)
      this.nav.setBlock(LIB_MIN_X, LIB_MIN_Y, 10, 1, true); // North Wall
      // West Doorway at y: 20.5 to 22.8 (keep tiles 21 and 22 100% open)
      this.nav.setBlock(LIB_MIN_X, LIB_MIN_Y, 1, 3.2, true); // West Wall Top (y: 17 to 20.2)
      this.nav.setBlock(LIB_MIN_X, 23.0, 1, 4.0, true); // West Wall Bottom (y: 23.0 to 27)
      this.nav.setBlock(LIB_MAX_X + 1, LIB_MIN_Y, 1, 10, true); // East Wall
      this.nav.setBlock(LIB_MIN_X, LIB_MAX_Y + 1, 10, 1, true); // South Wall

      this.nav.setBlock(18.4, 17.2, 8.4, 0.8, true); // Grand North Book Walls
      this.nav.setBlock(18.2, 17.6, 0.8, 2.6, true); // West Wall Library Stack
      this.nav.setBlock(22.5, 18.4, 1.0, 0.7, true); // Mobile Library Book Cart
      this.nav.setBlock(20.0, 20.0, 2.5, 1.4, true); // Long Banker Study Table
      this.nav.setBlock(24.8, 19.2, 1.0, 1.0, true); // Botanical Terrarium Pedestal
      this.nav.setBlock(23.8, 22.0, 2.2, 2.0, true); // Wingback Reading Nook
      this.nav.setBlock(20.5, 23.8, 1.0, 1.0, true); // Celestial Armillary Globe
      this.nav.setBlock(24.2, 24.8, 2.5, 0.7, true); // Rare Book Vitrine

      // 5. Central Plaza & Park
      this.nav.setBlock(13, 13, 3, 3, true); // Fountain

      // Park Benches (Placed precisely on the North edge of gray paved paths, facing south onto the road)
      this.nav.setBlock(10.8, 12.0, 1.6, 0.5, true);  // Central Plaza North Edge Bench
      this.nav.setBlock(18.2, 12.0, 1.6, 0.5, true);  // East Avenue West Bench (Plaza side)
      this.nav.setBlock(25.2, 12.0, 1.6, 0.5, true);  // East Avenue East Bench (Court & Cafe side)
      this.nav.setBlock(4.5, 29.0, 1.6, 0.5, true);   // West Greenway North Edge Bench
      this.nav.setBlock(11.0, 43.0, 1.6, 0.5, true);  // South Avenue North Edge Bench
      this.nav.setBlock(1.8, 11.8, 1.6, 0.5, true);   // Garden Stone Terrace Bench beside Xiangqi Table (Lawn)

      // Garden Stone Chess Table & Stools (Ludwig's South Lawn Terrace)
      this.nav.setBlock(2.7, 13.8, 1.8, 1.3, true);

      // Campus Landmark Monument Totems (Placed on the open grass lawn facing courtyard avenue)
      this.nav.setBlock(15.5, 7.2, 0.65, 0.35, true);  // AI Studio Monument Totem
      this.nav.setBlock(15.5, 22.0, 0.65, 0.35, true); // Grand Library Monument Totem
      this.nav.setBlock(15.5, 38.0, 0.65, 0.35, true); // Douyin Office Monument Totem

      // 5. Sanmin High School Classroom (SW2: x: 0..9, y: 33..42)
      this.nav.setBlock(0, SCHOOL_MIN_Y, 10, 0.6, true);             // North Wall (y: 33)
      this.nav.setBlock(0, SCHOOL_MIN_Y, 0.6, 10, true);             // West Wall (x: 0)
      this.nav.setBlock(0, SCHOOL_MAX_Y + 1, 10, 0.6, true);         // South Wall (y: 43)
      // East Wall Doorway at y: 36.5 to 38.8 (keep tiles 37 and 38 100% open)
      this.nav.setBlock(SCHOOL_MAX_X + 1, SCHOOL_MIN_Y, 0.6, 3.5, true);  // East Wall Top (y: 33 to 36.5)
      this.nav.setBlock(SCHOOL_MAX_X + 1, 39.0, 0.6, 4.0, true);          // East Wall Bottom (y: 39 to 43)

      // Classroom Furniture Obstacles
      this.nav.setBlock(2.4, 33.1, 5.2, 0.4, true); // Blackboard Wall Area (North Wall)
      this.nav.setBlock(4.4, 34.4, 1.1, 0.8, true); // Teacher Podium (Centered)
      // 16 Student Desks in 4x4 Grid with Center Aisle
      for (const cx of [1.6, 3.2, 5.8, 7.4]) {
        for (const ry of [36.2, 37.8, 39.4, 41.0]) {
          this.nav.setBlock(cx + 0.08, ry + 0.08, 0.85, 0.55, true);
        }
      }
      this.nav.setBlock(1.5, 42.2, 2.4, 0.65, true); // Lockers & Storage

      // 6. Douyin / TikTok Tech Office (SE2: x: 18..27, y: 33..42)
      this.nav.setBlock(DOUYIN_MIN_X, DOUYIN_MIN_Y, 10, 0.6, true);           // North Wall (y: 33)
      this.nav.setBlock(DOUYIN_MAX_X + 1, DOUYIN_MIN_Y, 0.6, 10, true);       // East Wall (x: 28)
      this.nav.setBlock(DOUYIN_MIN_X, DOUYIN_MAX_Y + 1, 10, 0.6, true);       // South Wall (y: 43)
      // West Wall Doorway at y: 36.5 to 38.8 (keep tiles 37 and 38 100% open)
      this.nav.setBlock(DOUYIN_MIN_X, DOUYIN_MIN_Y, 0.6, 3.5, true);          // West Wall Top (y: 33 to 36.5)
      this.nav.setBlock(DOUYIN_MIN_X, 39.0, 0.6, 4.0, true);                  // West Wall Bottom (y: 39 to 43)

      // Tech Office Furniture Obstacles
      this.nav.setBlock(19.2, 34.4, 1.6, 0.85, true); // Workstation 1
      this.nav.setBlock(22.2, 34.4, 1.6, 0.85, true); // Workstation 2 (Standing)
      this.nav.setBlock(25.2, 34.4, 1.6, 0.85, true); // Workstation 3
      this.nav.setBlock(19.2, 40.2, 1.6, 0.85, true); // Workstation 4
      this.nav.setBlock(22.2, 40.2, 1.6, 0.85, true); // Workstation 5
      this.nav.setBlock(25.2, 40.2, 1.6, 0.85, true); // Workstation 6 (Standing)
      this.nav.setBlock(24.5, 37.0, 2.2, 1.2, true);  // Conference Meeting Table
      this.nav.setBlock(26.4, 33.8, 0.8, 0.8, true);  // Compute Rig
      this.nav.setBlock(26.5, 38.6, 1.2, 0.65, true); // Coffee & Pantry Bar

      // Trees (Lush trees placed 100% strictly on green grass lawns, keeping all road tiles open)
      const treeBlocks = [
        [10.5, 2], [10.5, 8], [10.5, 23], [10.5, 31], [10.5, 38], // West grass lawn strip
        [16.5, 2], [16.5, 8], [16.5, 23], [16.5, 31], [16.5, 38], // East grass lawn strip
        [28.5, 4],                                                 // AI & East Promenade lawn buffer
        [28.5, 21.5],                                               // Wide green park corridor between Library and Basketball Court
        [36.5, 11], [40.5, 13],                                    // Wide green park between Cafe and Basketball Court
        [36.5, 29], [40.5, 30.5],                                  // Wide lawn buffer between Basketball Court and Night Market
        [2.5, 28.5]                                                // West Greenway shaded tree
      ];
      treeBlocks.forEach(([tx, ty]) => {
        const trunkX = Math.floor(tx + 0.35);
        const trunkY = Math.floor(ty + 0.35);
        this.nav.setBlock(trunkX, trunkY, 1, 1, true);
      });

      // 7. West Campus Greenway (x: 0..9, y: 27..32 — Peaceful lawn between Dorm 211 and Sanmin High)
      this.nav.setBlock(4.5, 29.0, 1.6, 0.5, true);    // Greenway Shaded Park Bench along path roadside
      this.nav.setBlock(2.5, 28.5, 1.0, 1.0, true);    // Greenway Shaded Tree

      // 8. Campus Basketball Court Obstacles (East Dedicated Athletic Ground x: 41..52, y: 17..26)
      this.nav.setBlock(41.2, 21.2, 0.65, 0.70, true);  // Basketball Hoop Base (West sideline)
      this.nav.setBlock(47.5, 17.2, 0.45, 0.90, true);  // Metallic Ball Rack (North sideline)
      this.nav.setBlock(44.0, 17.2, 1.60, 0.65, true);  // Court Rest Bench (North sideline)
      this.nav.setBlock(41.0, 16.8, 11.2, 0.4, true);   // North Boundary Fence
      this.nav.setBlock(52.0, 17.0, 0.4, 9.4, true);    // East Boundary Fence
      this.nav.setBlock(41.0, 26.2, 11.2, 0.4, true);   // South Boundary Fence

      // 9. Central Midnight Snack Street Obstacles (East Wing x: 32..38, y: 33..44 — Slender 2.5-tile road)
      this.nav.setBlock(31.5, 33.0, 3.2, 0.40, true);  // Archway
      this.nav.setBlock(35.0, 34.2, 1.60, 2.80, true); // Blue Food Truck (小貨車餐車)
      this.nav.setBlock(35.0, 37.8, 1.60, 2.00, true); // 無敵蛋餅 (Egg Pancake Stall)
      // 傻師傅湯包 (Storefront Building Walls & Front Counter)
      this.nav.setBlock(34.8, 41.0, 0.95, 1.85, true); // Front Dumpling Cooking Counter
      this.nav.setBlock(34.8, 41.0, 3.80, 0.30, true); // North Wall
      this.nav.setBlock(38.3, 41.0, 0.30, 3.20, true); // East Back Wall
      this.nav.setBlock(34.8, 43.95, 3.80, 0.25, true); // South Wall
      this.nav.setBlock(36.8, 41.5, 1.30, 0.85, true); // Interior Dining Table & Stools
      this.nav.setBlock(31.2, 35.5, 0.50, 0.90, true); // Parked Scooter 1 (West curb)
      this.nav.setBlock(31.2, 38.5, 0.50, 0.90, true); // Parked Scooter 2 (West curb)

      // 10. South Boulevard Twin Streetlights & Signpost
      this.nav.setBlock(11.2, 42.4, 0.35, 0.35, true); // Streetlight Left
      this.nav.setBlock(17.2, 42.4, 0.35, 0.35, true); // Streetlight Right
      this.nav.setBlock(14.2, 42.8, 0.35, 0.35, true); // Portal Signpost

      // 11. Ludwigia Indoor Cafe Obstacles (Compact Cozy Indoor Building x: 33..39, y: 2..7)
      this.nav.setBlock(33.0, 2.0, 6.5, 0.5, true);    // North Wall
      this.nav.setBlock(39.0, 2.0, 0.5, 5.5, true);    // East Wall
      this.nav.setBlock(33.0, 7.0, 6.5, 0.5, true);    // South Wall (with panoramic window)
      // West Wall (Entrance doorway at y: 4.2 to 5.6)
      this.nav.setBlock(33.0, 2.0, 0.5, 2.2, true);    // West Wall Top
      this.nav.setBlock(33.0, 5.6, 0.5, 1.8, true);    // West Wall Bottom
      // Indoor Cafe Furniture
      this.nav.setBlock(36.5, 2.8, 2.2, 1.0, true);    // Barista Bar & Espresso Station
      this.nav.setBlock(34.5, 4.0, 1.2, 1.2, true);    // Indoor Lounge Table & Chairs

      // 11. Cyber LAN Lounge Obstacles (x: 1..11, y: 45..53)
      this.nav.setBlock(1.0, 44.8, 4.0, 0.45, true);   // North Wall Left
      this.nav.setBlock(7.0, 44.8, 4.5, 0.45, true);   // North Wall Right (Entrance at 5..7)
      this.nav.setBlock(0.8, 44.8, 0.45, 8.5, true);   // West Wall
      this.nav.setBlock(1.0, 53.2, 10.5, 0.45, true);  // South Wall
      this.nav.setBlock(11.2, 44.8, 0.45, 3.2, true);  // East Wall Top
      this.nav.setBlock(11.2, 50.0, 0.45, 3.5, true);  // East Wall Bottom (Doorway to Abyss at 48..50)
      this.nav.setBlock(2.2, 46.2, 1.4, 0.8, true);    // Blue Rig 1
      this.nav.setBlock(4.2, 46.2, 1.4, 0.8, true);    // Blue Rig 2
      this.nav.setBlock(6.2, 46.2, 1.4, 0.8, true);    // Blue Rig 3
      this.nav.setBlock(2.2, 50.2, 1.4, 0.8, true);    // Red Rig 1
      this.nav.setBlock(4.2, 50.2, 1.4, 0.8, true);    // Red Rig 2
      this.nav.setBlock(6.2, 50.2, 1.4, 0.8, true);    // Red Rig 3
      this.nav.setBlock(8.5, 47.8, 1.8, 0.85, true);   // Snack & Ramen Bar

      // 12. Howling Abyss ARAM Obstacles (Grand Suspension Bridge x: 13..41.5, y: 48..53)
      this.nav.setBlock(13.0, 47.3, 28.5, 0.5, true);  // North Bridge Stone Parapet (blocks falling into North Abyss)
      this.nav.setBlock(13.0, 53.3, 28.5, 0.5, true);  // South Bridge Stone Parapet (blocks falling into South Abyss)
      this.nav.setBlock(41.2, 47.5, 0.6, 6.0, true);   // East Bridge Terminus Railing
      this.nav.setBlock(12.8, 47.2, 0.8, 0.8, true);   // West Entrance Gateway North Obelisk
      this.nav.setBlock(12.8, 52.8, 0.8, 0.8, true);   // West Entrance Gateway South Obelisk
      this.nav.setBlock(19.2, 49.8, 1.6, 1.6, true);   // Ancient Outer Turret Plinth
      this.nav.setBlock(29.5, 49.8, 1.4, 1.4, true);   // Freljordian Inhibitor Dais
      this.nav.setBlock(37.8, 49.5, 2.2, 2.2, true);   // Grand Nexus Core Platform
    }

    initParticles() {
      const dreamColors = [
        'rgba(251, 207, 232, 0.85)', // Pastel cherry blossom
        'rgba(244, 114, 182, 0.78)', // Dream pink petal
        'rgba(253, 164, 175, 0.80)', // Soft rose glow
        'rgba(249, 168, 212, 0.75)', // Ethereal blush
        'rgba(224, 231, 255, 0.65)'  // Starlight pearl
      ];
      for (let i = 0; i < 65; i++) {
        this.particles.push({
          x: 1 + Math.random() * 26,
          y: 1 + Math.random() * 56,
          z: 0.5 + Math.random() * 3.2,
          vz: -0.008 - Math.random() * 0.015,
          vx: 0.008 + Math.random() * 0.018,
          vy: 0.004 + Math.random() * 0.012,
          color: dreamColors[Math.floor(Math.random() * dreamColors.length)],
          size: 2.2 + Math.random() * 2.8
        });
      }
    }

    bindEvents() {
      window.addEventListener('resize', this.resize.bind(this));
      this.resize();

      // Helper: check if keyboard inputs should be captured for character controls
      const isTypingActive = (e) => {
        const target = e.target;
        return Boolean(target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable));
      };

      // Keyboard Controls (Support both e.key and e.code for Mac/IME compatibility)
      window.addEventListener('keydown', (e) => {
        if (isTypingActive(e)) {
          return;
        }

        // --- RPG Dialogue Box Keyboard Navigation (Enter / Space / Escape) ---
        const dialogueOverlay = document.getElementById('dialogue-overlay');
        const isDialogueOpen = dialogueOverlay && dialogueOverlay.classList.contains('open');

        if (isDialogueOpen) {
          const isAdvanceKey = e.key === ' ' || e.key === 'Enter' || e.code === 'Space' || e.code === 'Enter';
          const isEscapeKey = e.key === 'Escape' || e.code === 'Escape';

          if (isAdvanceKey) {
            e.preventDefault();
            e.stopPropagation();
            if (e.repeat) return; // Prevent runaway auto-skipping if holding down key
            const nextBtn = document.getElementById('dialogue-next');
            if (nextBtn) nextBtn.click();
            return;
          }

          if (isEscapeKey) {
            e.preventDefault();
            e.stopPropagation();
            if (this.charManager) {
              this.charManager.closeDialogue();
            } else {
              dialogueOverlay.classList.remove('open');
            }
            return;
          }

          // While dialogue box is active, suppress any player movement or canvas hotkeys
          return;
        }

        // If any modal (name selection, citation) is currently open, suppress controls
        if (document.querySelector('.space-modal-backdrop.open')) {
          return;
        }

        const k = e.key ? e.key.toLowerCase() : '';
        const c = e.code ? e.code.toLowerCase() : '';
        if (k) this.keys[k] = true;
        if (c) this.keys[c] = true;

        // Prevent browser scrolling with game controls
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(k) ||
            ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'keyw', 'keya', 'keys', 'keyd', 'space'].includes(c)) {
          e.preventDefault();
        }

        if (e.key === ' ' || e.key === 'Enter' || e.code === 'Space' || e.code === 'Enter') {
          if (this.charManager && this.charManager.proximityTarget) {
            e.preventDefault();
            if (e.repeat) return;
            this.charManager.openDialogue(this.charManager.proximityTarget);
          }
        }

        // Key E for Interactive Object / Furniture (Climbing into bed, sitting on sofa or stool)
        if (e.key === 'e' || e.key === 'E' || e.code === 'KeyE') {
          if (this.charManager) {
            const player = this.charManager.player;
            if (player && player.furniture) {
              e.preventDefault();
              this.charManager.leaveFurniture(player);
            } else if (this.charManager.furnitureTarget) {
              e.preventDefault();
              this.charManager.useFurniture(player, this.charManager.furnitureTarget);
            }
          }
        }

        // If player moves while on furniture, automatically stand up
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k) ||
            ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'keyw', 'keya', 'keys', 'keyd'].includes(c)) {
          if (this.charManager && this.charManager.player && this.charManager.player.furniture) {
            this.charManager.leaveFurniture(this.charManager.player);
          }
        }
      });

      window.addEventListener('keyup', (e) => {
        const k = e.key ? e.key.toLowerCase() : '';
        const c = e.code ? e.code.toLowerCase() : '';
        if (k) this.keys[k] = false;
        if (c) this.keys[c] = false;
      });

      // Clear all active keys when window loses focus or modal opens
      window.addEventListener('blur', () => {
        this.keys = {};
      });

      // Mobile Virtual D-Pad
      const dpadMap = {
        'dpad-up': { dx: 0, dy: -1 },
        'dpad-down': { dx: 0, dy: 1 },
        'dpad-left': { dx: -1, dy: 0 },
        'dpad-right': { dx: 1, dy: 0 }
      };

      Object.entries(dpadMap).forEach(([id, dir]) => {
        const btn = document.getElementById(id);
        if (!btn) return;

        const startMove = (e) => { e.preventDefault(); this.dpadDir = dir; };
        const endMove = (e) => { e.preventDefault(); if (this.dpadDir === dir) this.dpadDir = null; };

        btn.addEventListener('touchstart', startMove, { passive: false });
        btn.addEventListener('touchend', endMove, { passive: false });
        btn.addEventListener('mousedown', startMove);
        btn.addEventListener('mouseup', endMove);
      });

      // Click to Move
      this.canvas.addEventListener('click', (e) => {
        // Prevent click-to-move when modal is open
        if (document.querySelector('.space-modal-backdrop.open') || document.querySelector('.dialogue-overlay.open')) {
          return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const { ox, oy } = this.getOrigin();
        const cx = this.width / 2;
        const cy = this.height / 2;

        const adjSx = (sx - cx) / this.zoom + cx;
        const adjSy = (sy - cy) / this.zoom + cy;
        const { gx, gy } = screenToIso(adjSx, adjSy, ox, oy);

        const player = this.charManager.player;
        if (!player) return;

        // If player is on furniture and clicks to move, stand up first
        if (player.furniture) {
          this.charManager.leaveFurniture(player);
        }

        // Click on NPC to talk
        const clickedNpc = this.charManager.characters.find(c => {
          if (c.isPlayer) return false;
          return Math.hypot(c.x - gx, c.y - gy) < 1.3;
        });

        if (clickedNpc) {
          player.path = this.nav.findPath({ x: player.x, y: player.y }, { x: clickedNpc.x, y: clickedNpc.y });
          clickedNpc.path = [];
          clickedNpc.isWalking = false;
          clickedNpc.timer = 8;
          clickedNpc.facing = player.x >= clickedNpc.x ? 1 : -1;
          this.charManager.openDialogue(clickedNpc);
        } else if (this.nav.isWalkable(gx, gy)) {
          player.path = this.nav.findPath({ x: player.x, y: player.y }, { x: gx, y: gy });
        }
      });

      document.getElementById('proximity-prompt')?.addEventListener('click', () => {
        if (this.charManager.proximityTarget) {
          this.charManager.openDialogue(this.charManager.proximityTarget);
        }
      });

      document.getElementById('furniture-prompt')?.addEventListener('click', () => {
        if (this.charManager) {
          const player = this.charManager.player;
          if (player && player.furniture) {
            this.charManager.leaveFurniture(player);
          } else if (this.charManager.furnitureTarget) {
            this.charManager.useFurniture(player, this.charManager.furnitureTarget);
          }
        }
      });

      // Touch Gesture Support: Pinch-to-Zoom & Drag-to-Pan / Tap-to-Move
      let touchStartX = 0, touchStartY = 0, touchStartTime = 0;
      let initialPinchDist = null, initialPinchZoom = 1.35;
      let isTouchDragging = false;

      this.canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchStartTime = performance.now();
          isTouchDragging = false;
        } else if (e.touches.length === 2) {
          e.preventDefault();
          const t1 = e.touches[0];
          const t2 = e.touches[1];
          initialPinchDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
          initialPinchZoom = this.zoom;
        }
      }, { passive: false });

      this.canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
          const dx = e.touches[0].clientX - touchStartX;
          const dy = e.touches[0].clientY - touchStartY;
          if (Math.hypot(dx, dy) > 8) {
            isTouchDragging = true;
            this.panX += dx * 0.7;
            this.panY += dy * 0.7;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
          }
        } else if (e.touches.length === 2 && initialPinchDist) {
          e.preventDefault();
          const t1 = e.touches[0];
          const t2 = e.touches[1];
          const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
          if (currentDist > 10) {
            const scale = currentDist / initialPinchDist;
            this.zoom = Math.max(0.65, Math.min(2.2, initialPinchZoom * scale));
            this.baseZoom = this.zoom;
          }
        }
      }, { passive: false });

      this.canvas.addEventListener('touchend', (e) => {
        if (e.touches.length === 0) {
          initialPinchDist = null;
          const elapsed = performance.now() - touchStartTime;
          if (!isTouchDragging && elapsed < 320) {
            const touch = e.changedTouches[0];
            if (touch) {
              const clickEvent = new MouseEvent('click', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                bubbles: true
              });
              this.canvas.dispatchEvent(clickEvent);
            }
          }
          isTouchDragging = false;
        } else if (e.touches.length === 1) {
          initialPinchDist = null;
        }
      }, { passive: false });

      this.canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.08 : 0.92;
        this.zoom = Math.max(0.65, Math.min(2.0, this.zoom * factor));
        this.baseZoom = this.zoom;
      }, { passive: false });
    }

    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.scale(dpr, dpr);
      this.width = rect.width;
      this.height = rect.height;
    }

    getOrigin() {
      const screenPos = isoToScreen(this.camCurrentX, this.camCurrentY, 0, 0, 0);
      return {
        ox: this.width / 2 - screenPos.x + this.panX,
        oy: this.height / 2 - screenPos.y + this.panY
      };
    }

    getZoneAt(x, y) {
      if (x <= 9.8 && y <= 9.8) return 'ludwig_house';
      if (x <= 9.8 && y >= 10.0 && y <= 16.4) return 'garden_terrace';
      if (x <= 9.8 && y >= 16.5 && y <= 26.5) return 'dorm_211';
      if (x >= 17.5 && x <= 27.5 && y <= 9.8) return 'ai_studio';
      if (x >= 17.5 && x <= 27.5 && y >= 16.5 && y <= 26.5) return 'library';
      if (x <= 9.8 && y >= 32.5 && y <= 42.8) return 'sanmin_school';
      if (x >= 17.5 && x <= 27.5 && y >= 32.5 && y <= 42.8) return 'douyin_office';
      if (x >= 34.5 && x <= 46.5 && y >= 16.5 && y <= 26.5) return 'basketball_court';
      if (x >= 31.5 && x <= 39.5 && y >= 32.5 && y <= 44.5) return 'night_market';
      if (x >= 32.5 && x <= 39.5 && y >= 2.0 && y <= 7.5) return 'cafe';
      if (x >= 0.8 && x <= 11.5 && y >= 44.5 && y <= 53.5) return 'cyber_cafe';
      if (x >= 12.0 && x <= 42.5 && y >= 46.5 && y <= 55.5) return 'howling_abyss';
      return 'plaza';
    }

    computeTimeState() {
      if (this.mood !== 'auto') {
        this.currentTimeState = this.mood;
        return;
      }
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 16) this.currentTimeState = 'day';
      else if (hour >= 16 && hour < 19) this.currentTimeState = 'sunset';
      else if (hour >= 19 && hour < 23) this.currentTimeState = 'night';
      else this.currentTimeState = 'galaxy';
    }

    // --- Physics, Anti-Crowding, Movement & Simulation Loop ---
    update(dt) {
      this.computeTimeState();

      // 0. Time-Sliced Pathfinding Queue (throttled to 1 NPC A* search per frame)
      if (this.pathQueue && this.pathQueue.length > 0) {
        const req = this.pathQueue.shift();
        if (req && req.char && !req.char.isPlayer) {
          const path = this.nav.findPath({ x: req.char.x, y: req.char.y }, req.target);
          if (path && path.length > 0) {
            req.char.path = path;
            req.char.state = 'walking';
          } else {
            req.char.timer = 1.0 + Math.random() * 1.0;
          }
        }
      }

      const player = this.charManager.player;
      if (!player) return;

      // Smooth Camera Tracking & Cinematic Dialogue Framing
      let focusX = player.x;
      let focusY = player.y;
      if (this.cinematicTarget) {
        focusX = this.cinematicTarget.x;
        focusY = this.cinematicTarget.y;
      }
      this.camTargetX = focusX;
      this.camTargetY = focusY;

      const camSpeed = 1 - Math.exp(-8 * dt);
      this.camCurrentX += (this.camTargetX - this.camCurrentX) * camSpeed;
      this.camCurrentY += (this.camTargetY - this.camCurrentY) * camSpeed;

      const targetZoom = this.baseZoom + this.cinematicZoomBoost;
      this.zoom += (targetZoom - this.zoom) * camSpeed;

      // 1. Zone Detection & Dynamic Camera with Hysteresis (buffer of 0.35 tiles to prevent doorway threshold flickering)
      const prevZone = this.currentZone || 'plaza';
      let currentZone = 'plaza';
      let isInsideAnyHouse = false;
      let statusMessage = "Courtyard Plaza • 綠意花園與社交廣場";

      // Helper function to check rectangular zone with hysteresis
      const checkZone = (zoneId, minX, maxX, minY, maxY) => {
        const isCurrentlyIn = (prevZone === zoneId);
        const margin = isCurrentlyIn ? 0.35 : -0.15; // Stay inside longer, require clear exit before leaving
        return (player.x >= minX - margin && player.x <= maxX + margin &&
                player.y >= minY - margin && player.y <= maxY + margin);
      };

      if (checkZone('ludwig_house', 0, 9.8, 0, 9.8)) {
        currentZone = 'ludwig_house';
        isInsideAnyHouse = true;
        statusMessage = "Ludwig's Home • 溫馨客廳與起居室";
      } else if (checkZone('garden_terrace', 0, 9.8, 10.0, 16.4)) {
        currentZone = 'garden_terrace';
        isInsideAnyHouse = false;
        statusMessage = "Garden Terrace • 露天花園與石雕棋盤";
      } else if (checkZone('dorm_211', 0, 9.8, 16.5, 26.5)) {
        currentZone = 'dorm_211';
        isInsideAnyHouse = true;
        statusMessage = "男11 211 宿舍 • 青春熱血的大學生活";
      } else if (checkZone('ai_studio', 17.5, 27.5, 0, 9.8)) {
        currentZone = 'ai_studio';
        isInsideAnyHouse = true;
        statusMessage = "AI Studio • Ludwigia 智慧研究室";
      } else if (checkZone('library', 17.5, 27.5, 16.5, 26.5)) {
        currentZone = 'library';
        isInsideAnyHouse = true;
        statusMessage = "Central Library • 知識藏書閣與典雅閱覽室";
      } else if (checkZone('sanmin_school', 0, 9.8, 32.5, 42.8)) {
        currentZone = 'sanmin_school';
        isInsideAnyHouse = true;
        statusMessage = "Sanmin High School • 青春回憶與三民高中教室";
      } else if (checkZone('douyin_office', 17.5, 27.5, 32.5, 42.8)) {
        currentZone = 'douyin_office';
        isInsideAnyHouse = true;
        statusMessage = "Douyin Office • 抖音演算法研發辦公室";
      } else if (checkZone('basketball_court', 40.5, 52.5, 16.5, 26.5)) {
        currentZone = 'basketball_court';
        isInsideAnyHouse = false;
        statusMessage = "Campus Basketball Court • 青春熱血的陽光運動場 🏀";
      } else if (checkZone('night_market', 31.5, 39.5, 32.5, 44.5)) {
        currentZone = 'night_market';
        isInsideAnyHouse = false;
        statusMessage = "中央宵夜街 • NCU Midnight Snack Street 🏮";
      } else if (checkZone('cafe', 32.5, 39.5, 2.0, 7.5)) {
        currentZone = 'cafe';
        isInsideAnyHouse = true;
        statusMessage = "Ludwigia Cafe • 溫馨文青的室內精品咖啡館 ☕";
      } else if (checkZone('cyber_cafe', 0.8, 11.5, 44.5, 53.5)) {
        currentZone = 'cyber_cafe';
        isInsideAnyHouse = true;
        statusMessage = "Howling Abyss Cyber • 召喚師電競網咖 🎮";
      } else if (checkZone('howling_abyss', 12.0, 42.5, 46.5, 55.5)) {
        currentZone = 'howling_abyss';
        isInsideAnyHouse = false;
        statusMessage = "The Howling Abyss • 冰封咆哮深淵戰場 ❄️";
      }

      this.currentZone = currentZone;
      this.targetZoom = isInsideAnyHouse ? 1.35 : 0.88;
      this.targetOutsideAlpha = isInsideAnyHouse ? 0.35 : 1.0;

      // Smooth camera transition
      this.zoom += (this.targetZoom - this.zoom) * 0.05;
      this.outsideAlpha += (this.targetOutsideAlpha - this.outsideAlpha) * 0.05;

      // Dynamic Wall Cutaway Transparency:
      // When looking from outside, building walls are solid (opacity: 1.0).
      // When player goes inside a room, that room's camera-facing dividing walls become cutaway (opacity: ~0.32)
      // so the interior desks, beds, furniture and characters are fully visible!
      const targetWallHouse = (this.currentZone === 'ludwig_house') ? 0.32 : 1.0;
      this.wallAlphaHouse += (targetWallHouse - this.wallAlphaHouse) * Math.min(1.0, dt * 6.0);

      const targetWallDorm = (this.currentZone === 'dorm_211') ? 0.32 : 1.0;
      this.wallAlphaDorm += (targetWallDorm - this.wallAlphaDorm) * Math.min(1.0, dt * 6.0);

      const targetWallAi = (this.currentZone === 'ai_studio') ? 0.32 : 1.0;
      this.wallAlphaAi += (targetWallAi - this.wallAlphaAi) * Math.min(1.0, dt * 6.0);

      const targetWallLib = (this.currentZone === 'library') ? 0.32 : 1.0;
      this.wallAlphaLib += (targetWallLib - this.wallAlphaLib) * Math.min(1.0, dt * 6.0);

      const targetWallSchool = (this.currentZone === 'sanmin_school') ? 0.32 : 1.0;
      this.wallAlphaSchool += (targetWallSchool - this.wallAlphaSchool) * Math.min(1.0, dt * 6.0);

      const targetWallDouyin = (this.currentZone === 'douyin_office') ? 0.32 : 1.0;
      this.wallAlphaDouyin += (targetWallDouyin - this.wallAlphaDouyin) * Math.min(1.0, dt * 6.0);

      const targetWallCafe = (this.currentZone === 'cafe') ? 0.32 : 1.0;
      this.wallAlphaCafe += (targetWallCafe - this.wallAlphaCafe) * Math.min(1.0, dt * 6.0);

      // 2. Multi-Door Proximity Sensors
      const nearLudwigDoor = this.charManager.characters.some(c => Math.hypot(c.x - 10.0, c.y - 5.65) < 2.4);
      this.doorLudwigOpen += ((nearLudwigDoor ? 1.0 : 0.0) - this.doorLudwigOpen) * Math.min(1.0, dt * 5.0);

      const nearLudwigSideDoor = this.charManager.characters.some(c => Math.hypot(c.x - 5.65, c.y - 10.0) < 2.4);
      this.doorLudwigSideOpen += ((nearLudwigSideDoor ? 1.0 : 0.0) - this.doorLudwigSideOpen) * Math.min(1.0, dt * 5.0);

      const nearDormDoor = this.charManager.characters.some(c => Math.hypot(c.x - 10.0, c.y - 21.8) < 2.4);
      this.doorDormOpen += ((nearDormDoor ? 1.0 : 0.0) - this.doorDormOpen) * Math.min(1.0, dt * 5.0);

      const nearAiDoor = this.charManager.characters.some(c => Math.hypot(c.x - 18.0, c.y - 5.65) < 2.4);
      this.doorAiOpen += ((nearAiDoor ? 1.0 : 0.0) - this.doorAiOpen) * Math.min(1.0, dt * 5.0);

      const nearLibDoor = this.charManager.characters.some(c => Math.hypot(c.x - 18.0, c.y - 21.65) < 2.4);
      this.doorLibOpen += ((nearLibDoor ? 1.0 : 0.0) - this.doorLibOpen) * Math.min(1.0, dt * 5.0);

      const nearSchoolDoor = this.charManager.characters.some(c => Math.hypot(c.x - 10.0, c.y - 37.65) < 2.4);
      this.doorSchoolOpen += ((nearSchoolDoor ? 1.0 : 0.0) - this.doorSchoolOpen) * Math.min(1.0, dt * 5.0);

      // 2. Douyin Office Erratic Speed Gate State Machine ("開關時機難以捉摸、不定期開關搞人心態")
      const playerNearDouyin = (Math.hypot(player.x - 18.0, player.y - 37.65) < 3.2);
      const anyCharNearDouyin = this.charManager.characters.some(c => Math.hypot(c.x - 18.0, c.y - 37.65) < 2.6);

      this.douyinGateTimer -= dt;

      if (this.douyinGateTimer <= 0) {
        if (this.douyinGateOpen > 0) {
          // Gate is currently OPEN -> decide to close it!
          this.douyinGateOpen = 0.0;
          this.douyinGateState = 'closed';
          // Next closed duration: unpredictable! (1.5 to 4.2 seconds)
          this.douyinGateTimer = 1.5 + Math.random() * 2.7;
          this.douyinGateMessage = "🔒 閘門已鎖定 • 隨機審批中...";
        } else {
          // Gate is currently CLOSED -> erratic behavior!
          const roll = Math.random();
          if (playerNearDouyin || anyCharNearDouyin) {
            // Someone is waiting! 搞人心態 time:
            if (roll < 0.35) {
              // Tease mode: opens briefly or half-way for 0.45s then snaps shut!
              this.douyinGateOpen = 0.35;
              this.douyinGateState = 'tease';
              this.douyinGateTimer = 0.48;
              this.douyinGateMessage = "⚠️ 工卡感應異常！請勿尾隨！";
            } else if (roll < 0.75) {
              // Quick pass mode: opens fully for only 1.2 ~ 1.8 seconds! (快步通過)
              this.douyinGateOpen = 1.0;
              this.douyinGateState = 'open';
              this.douyinGateTimer = 1.2 + Math.random() * 0.7;
              this.douyinGateMessage = "🟢 閘門放行 • 請在 1.5 秒內快步通過！";
            } else if (roll < 0.90) {
              // Generous open: 3.5 seconds
              this.douyinGateOpen = 1.0;
              this.douyinGateState = 'open';
              this.douyinGateTimer = 3.2 + Math.random() * 1.0;
              this.douyinGateMessage = "🟢 訪客通行已核准";
            } else {
              // Strict lockdown hesitation: stays closed for another 2.5s!
              this.douyinGateOpen = 0.0;
              this.douyinGateState = 'locked';
              this.douyinGateTimer = 2.5 + Math.random() * 1.5;
              this.douyinGateMessage = "⏳ 權限審批佇列排隊中，請耐心等待...";
            }
          } else {
            // Idle background opening/closing
            if (roll < 0.25) {
              this.douyinGateOpen = 1.0;
              this.douyinGateTimer = 1.5 + Math.random() * 1.5;
            } else {
              this.douyinGateOpen = 0.0;
              this.douyinGateTimer = 2.0 + Math.random() * 3.0;
            }
          }
        }
      }

      // Smooth mechanical animation: snaps shut faster than it opens!
      const gateSpeed = (this.douyinGateOpen === 0.0) ? 9.5 : 6.5;
      this.douyinGateAnim += (this.douyinGateOpen - this.douyinGateAnim) * Math.min(1.0, dt * gateSpeed);

      // Physical navigation mesh collision update
      const isGatePassable = (this.douyinGateAnim > 0.65);
      if (this.douyinGateBlocked === isGatePassable) {
        this.douyinGateBlocked = !isGatePassable;
        // Doorway corridor is x: 18.0, y: 36.8 to 38.4
        this.nav.setBlock(18.0, 36.8, 0.45, 1.8, !isGatePassable);
      }

      if (playerNearDouyin && this.douyinGateMessage) {
        statusMessage = `Douyin Office • ${this.douyinGateMessage}`;
      }

      // Status text
      const statusEl = document.getElementById('status-text');
      if (statusEl) statusEl.textContent = statusMessage;

      // Compass Realtime Coordinates
      const compassCoordsEl = document.getElementById('compass-coords');
      if (compassCoordsEl) {
        compassCoordsEl.textContent = `X: ${Math.round(player.x)} · Y: ${Math.round(player.y)}`;
      }

      // 3. Player Movement with Reliable Walking Animation
      const isModalOrInputActive = () => {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
          return true;
        }
        if (document.querySelector('.space-modal-backdrop.open') || document.querySelector('.dialogue-overlay.open')) {
          return true;
        }
        return false;
      };

      if (isModalOrInputActive()) {
        this.keys = {};
        this.dpadDir = null;
      }

      let kx = 0, ky = 0;
      const k = this.keys;
      if (k['w'] || k['arrowup'] || k['keyw'])    { kx -= 1; ky -= 1; }
      if (k['s'] || k['arrowdown'] || k['keys'])  { kx += 1; ky += 1; }
      if (k['a'] || k['arrowleft'] || k['keya'])  { kx -= 1; ky += 1; }
      if (k['d'] || k['arrowright'] || k['keyd']) { kx += 1; ky -= 1; }

      if (this.dpadDir) {
        const d = this.dpadDir;
        if (d.dy < 0) { kx -= 1; ky -= 1; }
        if (d.dy > 0) { kx += 1; ky += 1; }
        if (d.dx < 0) { kx -= 1; ky -= 1; }
        if (d.dx > 0) { kx += 1; ky += 1; }
      }

      const isInputActive = (kx !== 0 || ky !== 0) || !!this.dpadDir;
      let playerActuallyMoved = false;

      // Update Compass Active Needles
      const ngN = document.getElementById('needle-group-n');
      const ngE = document.getElementById('needle-group-e');
      const ngS = document.getElementById('needle-group-s');
      const ngW = document.getElementById('needle-group-w');
      if (ngN && ngE && ngS && ngW) {
        ngN.classList.toggle('active', ky < 0);
        ngS.classList.toggle('active', ky > 0);
        ngE.classList.toggle('active', kx > 0);
        ngW.classList.toggle('active', kx < 0);
      }

      if (kx !== 0 || ky !== 0) {
        // If player is sitting or lying down, immediately stand up upon movement input
        if (player.furniture && this.charManager) {
          this.charManager.leaveFurniture(player);
        }

        player.path = [];
        const len = Math.hypot(kx, ky);
        const step = (player.speed * dt) / len;
        const nx = player.x + kx * step;
        const ny = player.y + ky * step;

        const r = 0.16;
        if (this.nav.isWalkableRadius(nx, ny, r)) {
          player.x = nx;
          player.y = ny;
          player.facing = kx >= ky ? 1 : -1;
          playerActuallyMoved = true;
        } else if (this.nav.isWalkableRadius(nx, player.y, r)) {
          // Smooth slide along X axis
          player.x = nx;
          player.facing = kx >= 0 ? 1 : -1;
          playerActuallyMoved = true;
        } else if (this.nav.isWalkableRadius(player.x, ny, r)) {
          // Smooth slide along Y axis
          player.y = ny;
          player.facing = ky >= 0 ? 1 : -1;
          playerActuallyMoved = true;
        } else {
          // Robust Unstuck Escape: probe forward along input direction for the nearest walkable position
          let popped = false;
          for (let dist = 0.08; dist <= 1.6; dist += 0.08) {
            const px = player.x + (kx / len) * dist;
            const py = player.y + (ky / len) * dist;
            if (this.nav.isWalkable(px, py)) {
              player.x = px;
              player.y = py;
              player.facing = kx >= ky ? 1 : -1;
              playerActuallyMoved = true;
              popped = true;
              break;
            }
          }
          if (!popped && !this.nav.isWalkable(player.x, player.y)) {
            // Radial omnidirectional escape if completely enclosed
            const angles = [0, Math.PI / 2, Math.PI, -Math.PI / 2, Math.PI / 4, -Math.PI / 4, 3 * Math.PI / 4, -3 * Math.PI / 4];
            for (let dist = 0.15; dist <= 1.6; dist += 0.15) {
              for (const ang of angles) {
                const px = player.x + Math.cos(ang) * dist;
                const py = player.y + Math.sin(ang) * dist;
                if (this.nav.isWalkable(px, py)) {
                  player.x = px;
                  player.y = py;
                  playerActuallyMoved = true;
                  popped = true;
                  break;
                }
              }
              if (popped) break;
            }
          }
        }
      } else if (player.path && player.path.length > 0) {
        const next = player.path[0];
        const dx = next.x - player.x;
        const dy = next.y - player.y;
        const dist = Math.hypot(dx, dy);
        const step = player.speed * dt;

        if (dist <= step) {
          player.x = next.x;
          player.y = next.y;
          player.path.shift();
        } else {
          player.x += (dx / dist) * step;
          player.y += (dy / dist) * step;
          player.facing = dx >= dy ? 1 : -1;
        }
        playerActuallyMoved = true;
      }

      // Crucial: Walking is active whenever player is actively driving movement or moving along path
      const isWalking = isInputActive || (player.path && player.path.length > 0) || playerActuallyMoved;
      if (isWalking) {
        player.walkLingerTimer = 0.22;
        player.isWalking = true;
      } else if ((player.walkLingerTimer || 0) > 0) {
        player.walkLingerTimer -= dt;
        player.isWalking = true;
      } else {
        player.isWalking = false;
      }

      // 4. Anti-Crowding Social Distance Force (>= 1.6 tiles)
      const MIN_DIST = 1.6;
      const chars = this.charManager.characters;
      for (let i = 0; i < chars.length; i++) {
        for (let j = i + 1; j < chars.length; j++) {
          const c1 = chars[i];
          const c2 = chars[j];
          const dx = c1.x - c2.x;
          const dy = c1.y - c2.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 0.001 && dist < MIN_DIST) {
            const push = (MIN_DIST - dist) * 0.4 * dt;
            const px = (dx / dist) * push;
            const py = (dy / dist) * push;

            if (!c1.isPlayer && this.nav.isWalkableRadius(c1.x + px, c1.y + py, 0.32)) {
              c1.x += px; c1.y += py;
            }
            if (!c2.isPlayer && this.nav.isWalkableRadius(c2.x - px, c2.y - py, 0.32)) {
              c2.x -= px; c2.y -= py;
            }
          }
        }
      }

      // 5. Autonomous NPC Wander
      chars.forEach(c => {
        if (c.isPlayer) return;

        if (c.path && c.path.length > 0) {
          const next = c.path[0];
          const dx = next.x - c.x;
          const dy = next.y - c.y;
          const dist = Math.hypot(dx, dy);
          const step = c.speed * dt;

          if (dist <= step) {
            c.x = next.x; c.y = next.y;
            c.path.shift();
            if (c.path.length === 0) {
              c.isWalking = false;
              c.walkTimer = 0;
              // Check if arrived near an unoccupied bench/chair
              const nearSeat = this.charManager.furnitureSpots.find(s =>
                s.type === 'seat' &&
                (!s.zone || s.zone === 'plaza' || s.zone === c.zone) &&
                Math.hypot(s.x - c.x, s.y - c.y) < 1.15 &&
                !this.charManager.isSpotOccupied(s, c)
              );
              if (nearSeat && Math.random() < 0.65) {
                this.charManager.useFurniture(c, nearSeat);
                // Rest on bench enjoying the scenery for 8 to 18 seconds
                c.timer = 8.0 + Math.random() * 10.0;
              } else {
                c.state = 'idle';
                // Natural rest while observing/enjoying spot (2.5 to 6.0 seconds)
                c.timer = 2.5 + Math.random() * 3.5;
              }
            }
          } else {
            c.x += (dx / dist) * step;
            c.y += (dy / dist) * step;
            c.facing = dx >= dy ? 1 : -1;
            c.isWalking = true;
            c.walkTimer = (c.walkTimer || 0) + dt * 10.0;
          }
        } else {
          c.isWalking = false;
          c.walkTimer = 0;
          c.timer -= dt;
        }

        if (c.timer <= 0) {
          if (c.furniture) {
            this.charManager.leaveFurniture(c);
          }
          c.timer = 1.5 + Math.random() * 2.5;
          if (c.isCat) {
            c.state = Math.random() > 0.45 ? 'sleeping' : 'walking';
            if (c.state === 'walking') {
              const catSpots = [{ x: 4.5, y: 7.5 }, { x: 7.5, y: 4.5 }, { x: 3.5, y: 3.5 }, { x: 5.5, y: 6.5 }];
              const dest = catSpots[Math.floor(Math.random() * catSpots.length)];
              this.requestNpcPath(c, dest.x, dest.y);
            }
          } else {
            let targetX, targetY;
            let attempts = 0;
            let valid = false;

            while (!valid && attempts < 16) {
              attempts++;

              // Shared Multi-Zone Ecological Anchors
              const plazaAnchors = [
                // 1. Central Fountain Promenade & Walkways
                { x: 12.0, y: 14.5 }, // Fountain West Promenade
                { x: 17.0, y: 14.5 }, // Fountain East Promenade
                { x: 14.5, y: 11.8 }, // Fountain North Promenade
                { x: 14.5, y: 16.5 }, // Fountain South Promenade
                { x: 13.0, y: 12.5 }, // Fountain NW Edge
                { x: 16.0, y: 12.5 }, // Fountain NE Edge
                { x: 13.0, y: 16.5 }, // Fountain SW Edge
                { x: 16.0, y: 16.5 }, // Fountain SE Edge
                { x: 14.5, y: 10.4 }, // North Cherry Bench Walkway
                { x: 14.5, y: 18.5 }, // South Cherry Bench Walkway
                { x: 21.2, y: 14.5 }, // East Courtyard Promenade
                { x: 6.8, y: 13.5 },  // West Terrace Walkway
                { x: 14.5, y: 5.8 },  // North Walkway between House & AI Studio
                { x: 14.5, y: 21.6 }, // South Walkway between Dorm & Library
                { x: 11.2, y: 14.5 }, // Central West Path Intersection
                { x: 17.8, y: 14.5 }, // Central East Path Intersection

                // 2. Garden Terrace & Stone Chess Table Lawn (West)
                { x: 3.6, y: 14.5 },  // Standing beside Stone Chess Table
                { x: 4.8, y: 13.8 },  // Spectating Lawn around Chessboard
                { x: 5.2, y: 12.2 },  // Private Garden Lawn Bench

                // 3. North Plaza Lawn & Blossom Canopy (North)
                { x: 13.5, y: 10.2 }, // North Park Bench Lawn Seat
                { x: 12.5, y: 8.5 },  // Blossom Tree Shade (West)
                { x: 15.2, y: 8.2 },  // Blossom Tree Shade (East)
                { x: 13.8, y: 7.2 },  // North Lawn Grove

                // 4. South Plaza Lawn & Rest Grove (Central South)
                { x: 13.5, y: 18.2 }, // South Park Bench Lawn Seat
                { x: 15.2, y: 19.0 }, // South Shaded Lawn
                { x: 12.8, y: 20.0 }, // Central Southern Grass Pocket

                // 5. East Central Lawn & Sunlit Grove (East between AI Studio & Library)
                { x: 22.0, y: 14.2 }, // East Reading Bench Lawn
                { x: 23.5, y: 12.8 }, // East Open Lawn Sunbathing
                { x: 24.8, y: 14.2 }, // East Pine Grove Shade
                { x: 21.5, y: 11.8 }, // East Quiet Greenery Corner

                // 6. South Avenue Promenade Lawn (South Sector)
                { x: 13.5, y: 31.2 }, // South Avenue Park Bench Lawn
                { x: 15.0, y: 29.8 }, // South Avenue Shaded Boulevard Lawn
                { x: 12.5, y: 29.2 }  // Boulevard West Grass
              ];

              const libraryAnchors = [
                { x: 19.6, y: 20.8 }, // Banker Desk Left Chair
                { x: 21.3, y: 19.5 }, // Banker Desk Center Seat
                { x: 23.2, y: 20.8 }, // Banker Desk Right Chair
                { x: 19.2, y: 18.2 }, // Book Wall West Ladder
                { x: 21.5, y: 18.8 }, // Book Wall Center Aisle
                { x: 25.5, y: 18.2 }, // Book Wall East Section
                { x: 19.2, y: 19.2 }, // West Archival Bookshelf
                { x: 23.2, y: 23.0 }, // Wingback Armchair Lounge
                { x: 24.5, y: 21.5 }, // Reading Nook Rug Side
                { x: 24.2, y: 20.2 }, // Terrarium Display
                { x: 21.5, y: 23.5 }, // Celestial Globe Aisle
                { x: 22.0, y: 24.5 }, // Antique Rug Center
                { x: 24.6, y: 24.2 }, // Rare Book Vitrine
                { x: 19.2, y: 21.6 }  // Library Entrance Threshold
              ];

              const aiStudioAnchors = [
                { x: 21.2, y: 2.8 }, // Server Cabinets Aisle
                { x: 24.0, y: 3.2 }, // AI Command Desk Chair
                { x: 25.4, y: 5.0 }, // Glass Whiteboard
                { x: 21.5, y: 7.2 }, // Espresso Bar Stool
                { x: 22.5, y: 5.2 }, // Studio Center Lounge
                { x: 18.8, y: 5.6 }  // AI Studio Threshold
              ];

              const dormAnchors = [
                { x: 2.1, y: 18.2 }, // Bed 1 Happy Wang
                { x: 2.1, y: 25.2 }, // Bed 2 Kerry Chang
                { x: 7.2, y: 18.2 }, // Bed 3 Clark Wu
                { x: 7.2, y: 25.2 }, // Bed 4 Jerry Chung / Billy's Bed
                { x: 4.8, y: 19.5 }, // Common Lounge Sofa & Guitar
                { x: 4.8, y: 22.0 }, // Central Room Aisle
                { x: 4.8, y: 24.5 }, // Guitar Corner
                { x: 8.5, y: 21.6 }  // Dorm Doorway Threshold
              ];

              const houseAnchors = [
                { x: 3.5, y: 3.5 }, // Living Room Rug Center
                { x: 5.5, y: 3.5 }, // Sectional Sofa Corner
                { x: 2.5, y: 6.5 }, // Dining Table
                { x: 7.2, y: 6.5 }, // Kitchen Island / Bar
                { x: 5.0, y: 7.5 }, // South Terrace French Doors
                { x: 8.5, y: 5.5 }  // House East Entrance Threshold
              ];

              const schoolAnchors = [
                { x: 5.0, y: 35.0 }, // Teacher Area / Blackboard Center
                { x: 5.0, y: 37.0 }, // Center Classroom Aisle (Front)
                { x: 5.0, y: 39.5 }, // Center Classroom Aisle (Mid)
                { x: 5.0, y: 41.8 }, // Center Classroom Aisle (Back) / Bulletin
                { x: 9.0, y: 37.6 }, // East Classroom Entrance Threshold
                { x: 0.8, y: 38.5 }  // West Window Side Aisle
              ];

              const douyinAnchors = [
                { x: 21.0, y: 35.5 }, // Dev Workstation 1 & 2
                { x: 25.0, y: 35.5 }, // Standing Desk Area
                { x: 22.5, y: 37.5 }, // Conference Table
                { x: 21.0, y: 40.0 }, // Dev Workstation 3 & 4
                { x: 24.5, y: 39.0 }, // Douyin Logo Center
                { x: 19.2, y: 37.6 }  // Douyin Door Threshold
              ];

              const basketballAnchors = [
                { x: 47.0, y: 21.5 }, // Top of the Key
                { x: 45.5, y: 21.5 }, // Free Throw Line
                { x: 41.8, y: 21.5 }, // Under the West Basketball Hoop
                { x: 49.5, y: 21.5 }, // Right Half-Court Aisle
                { x: 44.0, y: 18.5 }, // North Wing Three-Point Corner
                { x: 44.0, y: 24.5 }, // South Wing Three-Point Corner
                { x: 44.2, y: 17.8 }  // Sideline Team Bench Area
              ];

              const nightMarketAnchors = [
                { x: 31.0, y: 23.5 }, // Ordering at Blue Food Truck (小貨車炒泡麵)
                { x: 31.0, y: 27.2 }, // Waiting for Sizzling Egg Pancake (無敵蛋餅)
                { x: 31.2, y: 30.5 }, // Steaming Dumplings & Rib Soup (傻師傅湯包店面)
                { x: 28.5, y: 25.5 }, // Seated at West Lawn Red Stool Round Table
                { x: 29.5, y: 31.0 }, // Checking out Parked Scooters
                { x: 31.0, y: 22.8 }, // Entering under Central Night Market Archway
                { x: 31.0, y: 33.5 }  // Strolling along the Narrow Night Market Street
              ];

              const cafeAnchors = [
                { x: 33.2, y: 5.5 },  // Barista Counter Order Spot
                { x: 31.0, y: 7.5 },  // Indoor Lounge Table & Armchairs
                { x: 34.5, y: 8.5 },  // Window-Facing Bar Stool Counter
                { x: 35.5, y: 4.0 },  // Barista Espresso Machine Station
                { x: 30.0, y: 6.2 }   // Indoor Cafe Glass Entrance Doorway
              ];

              const cyberAnchors = [
                { x: 3.0, y: 47.5 }, // Blue Side Gaming Station 1
                { x: 5.0, y: 47.5 }, // Blue Side Gaming Station 2
                { x: 7.0, y: 47.5 }, // Blue Side Gaming Station 3
                { x: 3.0, y: 51.5 }, // Red Side Gaming Station 1
                { x: 5.0, y: 51.5 }, // Red Side Gaming Station 2
                { x: 8.8, y: 49.0 }, // Hot Ramen & Coke Counter
                { x: 6.0, y: 49.5 }  // Cyber Cafe Central Lobby
              ];

              const abyssAnchors = [
                { x: 14.5, y: 50.5 }, // West Gateway Approach
                { x: 17.5, y: 49.0 }, // Parapet Fire Brazier Glow
                { x: 21.5, y: 51.5 }, // Flanking Ancient Turret
                { x: 24.5, y: 52.0 }, // West Health Relic Shrine
                { x: 27.5, y: 49.2 }, // Mid-Lane Frost Brush Ambush Spot
                { x: 31.0, y: 52.0 }, // Guarding Inhibitor Crystal
                { x: 34.5, y: 49.0 }, // East Health Relic Shrine
                { x: 37.0, y: 50.5 }, // Nexus Platform Approach
                { x: 40.0, y: 50.5 }, // Gazing in Awe at Grand Nexus Core
                { x: 23.0, y: 49.2 }  // Petting Poros in the Lane
              ];

              const zoneAnchorMap = {
                house: houseAnchors,
                ludwig_house: houseAnchors,
                dorm: dormAnchors,
                dorm_211: dormAnchors,
                ai_studio: aiStudioAnchors,
                library: libraryAnchors,
                plaza: plazaAnchors,
                sanmin_school: schoolAnchors,
                school: schoolAnchors,
                douyin_office: douyinAnchors,
                douyin: douyinAnchors,
                basketball_court: basketballAnchors,
                basketball: basketballAnchors,
                night_market: nightMarketAnchors,
                snack_street: nightMarketAnchors,
                cafe: cafeAnchors,
                garden_cafe: cafeAnchors,
                cyber_cafe: cyberAnchors,
                cyber: cyberAnchors,
                howling_abyss: abyssAnchors,
                abyss: abyssAnchors
              };

              const rawVisited = c.visitedZones;
              const visitedPool = Array.isArray(rawVisited) && rawVisited.length > 0
                ? rawVisited
                : (c.zone === 'house' ? ['house', 'cafe', 'library', 'plaza'] :
                   c.zone === 'ai_studio' ? ['ai_studio', 'cafe', 'library', 'plaza'] :
                   c.zone === 'library' ? ['library', 'plaza', 'cafe'] :
                   c.zone === 'dorm_211' ? ['dorm_211', 'basketball_court', 'night_market', 'cyber_cafe', 'howling_abyss', 'library', 'plaza'] :
                   c.zone === 'sanmin_school' ? ['sanmin_school', 'basketball_court', 'cyber_cafe', 'howling_abyss', 'library', 'plaza'] :
                   c.zone === 'douyin_office' ? ['douyin_office', 'cafe', 'cyber_cafe', 'library', 'plaza'] :
                   [c.zone, 'cafe', 'cyber_cafe', 'howling_abyss', 'library', 'plaza']);

              // Pick target zone: 40% bias to home zone if present in visitedPool, otherwise uniform
              let chosenZone;
              if (visitedPool.includes(c.zone) && visitedPool.length > 1) {
                if (Math.random() < 0.40) {
                  chosenZone = c.zone;
                } else {
                  const others = visitedPool.filter(z => z !== c.zone);
                  chosenZone = others[Math.floor(Math.random() * others.length)];
                }
              } else {
                chosenZone = visitedPool[Math.floor(Math.random() * visitedPool.length)];
              }

              const chosenPool = zoneAnchorMap[chosenZone] || plazaAnchors;
              const spot = chosenPool[Math.floor(Math.random() * chosenPool.length)];
              targetX = spot.x + (Math.random() - 0.5) * 0.5;
              targetY = spot.y + (Math.random() - 0.5) * 0.5;

              if (this.nav.isWalkable(targetX, targetY)) {
                const crowded = chars.some(other => other !== c && Math.hypot(other.x - targetX, other.y - targetY) < 1.4);
                if (!crowded) valid = true;
              }
            }

            if (valid) {
              this.requestNpcPath(c, targetX, targetY);
            } else {
              c.timer = 0.8 + Math.random() * 0.8;
            }
          }
        }
      });

      // 6. Autonomous NPC Dialogues & Speech Bubble Dynamics
      this.charManager.update(dt);

      // 7. Proximity Check for Space/Enter Dialogue Prompt with Hysteresis (prevents threshold flickering)
      let closest = null;
      // Enter threshold is 1.85 tiles; exit threshold is 2.30 tiles to prevent rapid toggling
      const threshold = this.charManager.proximityTarget ? 2.30 : 1.85;
      let minDist = threshold;
      chars.forEach(c => {
        if (c.isPlayer) return;
        const d = Math.hypot(c.x - player.x, c.y - player.y);
        if (d < minDist) {
          minDist = d;
          closest = c;
        }
      });
      this.charManager.proximityTarget = closest;

      const promptEl = document.getElementById('proximity-prompt');
      if (promptEl) {
        if (closest) {
          promptEl.classList.add('visible');
          document.getElementById('prompt-name').textContent = closest.name;
        } else {
          promptEl.classList.remove('visible');
        }
      }

      // 7.1 Proximity Check for Furniture Prompt (Beds, Sofas, Stools)
      let closestFurniture = null;
      let minFurnDist = 1.25;
      if (this.charManager.furnitureSpots) {
        this.charManager.furnitureSpots.forEach(f => {
          // If furniture belongs to an indoor room, player must be in that zone
          if (f.zone && f.zone !== 'plaza' && f.zone !== this.currentZone) return;
          const d = Math.hypot(f.x - player.x, f.y - player.y);
          if (d < minFurnDist) {
            minFurnDist = d;
            closestFurniture = f;
          }
        });
      }
      this.charManager.furnitureTarget = closestFurniture;

      const furnPromptEl = document.getElementById('furniture-prompt');
      if (furnPromptEl) {
        if (player.furniture) {
          furnPromptEl.classList.add('visible');
          const isZh = (this.charManager.getLangKey() === 'zh-TW');
          furnPromptEl.innerHTML = `<i class="fa-solid fa-person-walking-arrow-right text-accent"></i> <span>[E / 點擊] ${isZh ? '起身' : 'Stand Up'}</span>`;
        } else if (closestFurniture) {
          furnPromptEl.classList.add('visible');
          const isZh = (this.charManager.getLangKey() === 'zh-TW');
          const occupant = this.charManager.getOccupant(closestFurniture);
          if (occupant) {
            const occName = occupant.name || (isZh ? '有人' : 'Someone');
            furnPromptEl.innerHTML = `<i class="fa-solid fa-user-clock text-accent"></i> <span>[${occName} ${isZh ? '正坐著休息' : 'is resting'}]</span>`;
          } else {
            const icon = (closestFurniture.type === 'bed') ? 'fa-bed' : 'fa-chair';
            const label = isZh ? closestFurniture.labelZh : closestFurniture.labelEn;
            furnPromptEl.innerHTML = `<i class="fa-solid ${icon} text-accent"></i> <span>[E / 點擊] ${label}</span>`;
          }
        } else {
          furnPromptEl.classList.remove('visible');
        }
      }

      // 7. Update Floating Ambient Particles
      this.particles.forEach(p => {
        p.z += p.vz;
        p.x += p.vx;
        p.y += p.vy;
        if (p.z <= 0 || p.x > MAP_W || p.y > MAP_H) {
          p.z = 2.4 + Math.random() * 0.8;
          p.x = 1 + Math.random() * 26;
          p.y = 1 + Math.random() * 56;
        }
      });
    }

    // --- Terrain Renderer for Campus (expanded to MAP_W x MAP_H with Viewport Culling) ---
    drawTerrain(ctx, ox, oy) {
      const cx = this.width / 2;
      const cy = this.height / 2;
      const margin = 140 / this.zoom;
      const minX = cx - (cx / this.zoom) - margin;
      const maxX = cx + (cx / this.zoom) + margin;
      const minY = cy - (cy / this.zoom) - margin;
      const maxY = cy + (cy / this.zoom) + margin;

      for (let x = 0; x < MAP_W; x++) {
        for (let y = 0; y < MAP_H; y++) {
          // High-performance Viewport Culling (skips ~80% off-screen ground tiles)
          const pCenter = isoToScreen(x + 0.5, y + 0.5, 0, ox, oy);
          if (pCenter.x < minX || pCenter.x > maxX || pCenter.y < minY || pCenter.y > maxY) {
            continue;
          }

          const isLudwig = (x <= HOUSE_MAX_X && y <= HOUSE_MAX_Y);
          const isDorm = (x <= DORM_MAX_X && y >= DORM_MIN_Y && y <= DORM_MAX_Y);
          const isAi = (x >= AI_MIN_X && x <= AI_MAX_X && y >= AI_MIN_Y && y <= AI_MAX_Y);
          const isLib = (x >= LIB_MIN_X && x <= LIB_MAX_X && y >= LIB_MIN_Y && y <= LIB_MAX_Y);
          const isSchool = (x <= SCHOOL_MAX_X && y >= SCHOOL_MIN_Y && y <= SCHOOL_MAX_Y);
          const isDouyin = (x >= DOUYIN_MIN_X && x <= DOUYIN_MAX_X && y >= DOUYIN_MIN_Y && y <= DOUYIN_MAX_Y);
          const isBasketball = (x >= 41 && x <= 52 && y >= 17 && y <= 26);
          const isNightMarket = (x >= 32 && x <= 34 && y >= 33 && y <= 44);
          const isCafe = (x >= 33 && x <= 39 && y >= 2 && y <= 7);
          const isCyber = (x >= 1 && x <= 11 && y >= 45 && y <= 53);
          const isAbyssBridge = (
            (x >= 13 && x <= 41 && y >= 48 && y <= 53) ||
            (x >= 11 && x <= 13 && y >= 48 && y <= 50) // Ramp connector from Cyber Cafe
          );
          const isAbyssChasm = (
            x >= 12 && x <= 43 && y >= 44 && y <= 57 && !isCyber && !isAbyssBridge
          );
          const isInsideBuilding = isLudwig || isDorm || isAi || isLib || isSchool || isDouyin || isCyber || isCafe;

          // Orthogonal Grid Pathway Network connecting all buildings, courtyards and attractions
          const isMainNorthSouthSpine = (x >= 12 && x <= 15 && y >= 0 && y <= 45); // Central Boulevard (width 4)
          const isEastNorthSouthSpine = (x >= 30 && x <= 32 && y >= 4 && y <= 34);  // East Promenade Spine (connects Cafe ↔ Plaza Ave ↔ Basketball ↔ Night Market)
          const isEastWestAve1 = (y >= 5 && y <= 6 && x >= 10 && x <= 17);         // Row 1: Ludwig's Home ↔ Central Spine ↔ AI Studio West Entrance
          const isEastWestAve2 = (y >= 12 && y <= 16 && x >= 10 && x <= 32);        // Central Cross Street & Plaza Axis ↔ East Spine (flush with Library North Wall)
          const isGardenTerracePath = (y >= 12 && y <= 13 && x >= 5 && x <= 11);   // Walkway spur from Ludwig Terrace stairs to Plaza
          const isEastWestAve3 = (y >= 19 && y <= 20 && x >= 0 && x <= 27);        // Street between Home/Terrace and Dorm 211 / Library
          const isWestGreenwayAve = (y >= 29 && y <= 30 && x >= 0 && x <= 12);     // West Greenway Street between Dorm 211 and Sanmin High
          const isEastWestAve4 = (y >= 33 && y <= 34 && x >= 0 && x <= 32);        // Street between Classroom and Douyin Office ↔ East Spine
          const isEastWestAve5 = (y >= 43 && y <= 45 && x >= 0 && x <= 27);        // South Boulevard avenue
          const isNightMarketConnector = (y >= 33 && y <= 34 && x >= 30 && x <= 34); // Branch connecting East Spine to narrow Night Market street
          const isSouthSectorConnector = (x >= 5 && x <= 14 && y >= 43 && y <= 45); // South Connector to Cyber & Abyss

          // East Campus Basketball Court Direct Paved Access
          const isBasketballEntrance = (x >= 32 && x <= 41 && y >= 20 && y <= 22); // Direct paved avenue from East Spine into Basketball Court West Sideline

          // Local Doorway Connectors (short clean 2-tile spurs into doorway thresholds)
          const isLudwigDoorSpur = (x >= 10 && x <= 11 && y >= 5 && y <= 6);
          const isLudwigTerraceSpur = (y >= 10 && y <= 11 && x >= 5 && x <= 6);
          const isDormDoorSpur = (x >= 10 && x <= 11 && y >= 21 && y <= 22);
          const isSchoolDoorSpur = (x >= 10 && x <= 11 && y >= 37 && y <= 38);
          const isAiDoorSpur = (x >= 16 && x <= 17 && y >= 5 && y <= 6);
          const isLibDoorSpur = (x >= 16 && x <= 17 && y >= 21 && y <= 22);
          const isDouyinDoorSpur = (x >= 16 && x <= 17 && y >= 37 && y <= 38);
          const isCafeDoorSpur = (x >= 32 && x <= 33 && y >= 4 && y <= 6);

          const isPath = (
            isMainNorthSouthSpine ||
            isEastNorthSouthSpine ||
            isEastWestAve1 ||
            isEastWestAve2 ||
            isGardenTerracePath ||
            isEastWestAve3 ||
            isWestGreenwayAve ||
            isEastWestAve4 ||
            isEastWestAve5 ||
            isNightMarketConnector ||
            isSouthSectorConnector ||
            isBasketballEntrance ||
            isLudwigDoorSpur ||
            isLudwigTerraceSpur ||
            isDormDoorSpur ||
            isSchoolDoorSpur ||
            isAiDoorSpur ||
            isLibDoorSpur ||
            isDouyinDoorSpur ||
            isCafeDoorSpur
          );

          ctx.save();
          if (this.currentZone === 'ludwig_house' && !isLudwig) ctx.globalAlpha = this.outsideAlpha;
          else if (this.currentZone === 'dorm_211' && !isDorm) ctx.globalAlpha = this.outsideAlpha;
          else if (this.currentZone === 'ai_studio' && !isAi) ctx.globalAlpha = this.outsideAlpha;
          else if (this.currentZone === 'library' && !isLib) ctx.globalAlpha = this.outsideAlpha;
          else if (this.currentZone === 'sanmin_school' && !isSchool) ctx.globalAlpha = this.outsideAlpha;
          else if (this.currentZone === 'douyin_office' && !isDouyin) ctx.globalAlpha = this.outsideAlpha;
          else if (this.currentZone === 'cafe' && !isCafe) ctx.globalAlpha = this.outsideAlpha;
          else if (this.currentZone === 'cyber_cafe' && !isCyber) ctx.globalAlpha = this.outsideAlpha;

          const p0 = isoToScreen(x, y, 0, ox, oy);
          const p1 = isoToScreen(x + 1, y, 0, ox, oy);
          const p2 = isoToScreen(x + 1, y + 1, 0, ox, oy);
          const p3 = isoToScreen(x, y + 1, 0, ox, oy);

          if (isLudwig) {
            // Warm Alternating Oak Parquet Flooring
            ctx.fillStyle = (x + y) % 2 === 0 ? '#cbaf90' : '#be9f80';
          } else if (isDorm) {
            // Taiwanese University Dorm Terrazzo Composite Flooring
            ctx.fillStyle = (x + y) % 2 === 0 ? '#cbd5e1' : '#94a3b8';
          } else if (isAi) {
            // Futuristic Dark Cyber Slate Tiles
            ctx.fillStyle = (x + y) % 2 === 0 ? '#0f172a' : '#1e293b';
          } else if (isLib) {
            // Classic Dark Walnut Parquet Floor with Amber Sheen
            ctx.fillStyle = (x + y) % 2 === 0 ? '#451a03' : '#3b180a';
          } else if (isSchool) {
            // Classic Taiwanese Classroom Polished Honey Wood Parquet
            ctx.fillStyle = (x + y) % 2 === 0 ? '#dfb88e' : '#ce9e72';
          } else if (isDouyin) {
            // High-Tech Cyber Carbon Slate Floor Tiles
            ctx.fillStyle = (x + y) % 2 === 0 ? '#0b1120' : '#111827';
          } else if (isBasketball) {
            // Campus Basketball Court — Brick Red Key & Emerald Green Court PU Turf
            const isKey = (x >= 41 && x <= 45 && y >= 20 && y <= 23);
            const isBorder = (x === 41 || x === 52 || y === 17 || y === 26);
            if (isBorder) {
              ctx.fillStyle = '#c2410c'; // Terracotta court apron
            } else if (isKey) {
              ctx.fillStyle = (x + y) % 2 === 0 ? '#b91c1c' : '#991b1b';
            } else {
              ctx.fillStyle = (x + y) % 2 === 0 ? '#15803d' : '#166534';
            }
          } else if (isNightMarket) {
            // Central Midnight Snack Street — Slender Authentic Taiwanese Asphalt Roadway
            const isCenterDash = (x === 33 && y % 2 === 0);
            if (isCenterDash) {
              ctx.fillStyle = '#facc15'; // Yellow dashed line
            } else {
              ctx.fillStyle = (x + y) % 2 === 0 ? '#334155' : '#1e293b'; // Dark asphalt
            }
          } else if (isCafe) {
            // Ludwigia Indoor Specialty Cafe — Warm Walnut Herringbone Wood Floor
            ctx.fillStyle = (x + y) % 2 === 0 ? '#58240a' : '#451a03';
          } else if (isCyber) {
            // Cyber LAN Lounge — High-Tech Carbon Soundproof Carpet
            ctx.fillStyle = (x + y) % 2 === 0 ? '#0b0f19' : '#020617';
          } else if (isAbyssBridge) {
            // Howling Abyss ARAM Bridge — Freljordian Frost-Carved Flagstones & Snow Edges
            const isEdge = (y === 48 || y === 53);
            if (isEdge) {
              ctx.fillStyle = (x + y) % 2 === 0 ? '#334155' : '#1e293b';
            } else {
              ctx.fillStyle = (x + y) % 2 === 0 ? '#1a2738' : '#23344a';
            }
          } else if (isAbyssChasm) {
            // Deep Bottomless Frozen Abyss Chasm Void
            ctx.fillStyle = (x + y) % 2 === 0 ? '#020617' : '#050f22';
          } else if (y >= 45) {
            // Dreamscape Chasm of Clouds — Ethereal Pastel Pink & Nebula Sea
            ctx.fillStyle = (x + y) % 2 === 0 ? 'rgba(251, 207, 232, 0.40)' : 'rgba(244, 114, 182, 0.35)';
          } else if (isPath) {
            // Cobblestone Paved Paths
            ctx.fillStyle = (x + y) % 2 === 0 ? '#94a3b8' : '#8592a6';
          } else {
            // Lush Green Campus Lawn
            ctx.fillStyle = (x + y) % 2 === 0 ? '#4f772d' : '#456b27';
          }

          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fill();

          if (isAbyssChasm || isAbyssBridge || (y >= 45 && !isCyber && !isPath)) {
            ctx.strokeStyle = isAbyssChasm ? 'rgba(56, 189, 248, 0.08)' : (isAbyssBridge ? 'rgba(147, 197, 253, 0.20)' : 'rgba(244, 114, 182, 0.22)');
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // Centerline Glowing Arcane Rune Inlays on Bridge Spine
          if (isAbyssBridge && (y === 50 || y === 51) && x >= 14 && x <= 40) {
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }

          // Cyber Floor Neon Runners in AI Studio
          if (isAi && (x === AI_MIN_X + 4 || y === AI_MIN_Y + 5)) {
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.55)';
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          ctx.restore();
        }
      }

      // Render Permanent Ground Plane Decals (e.g. Official TikTok Floor Emblem)
      // Rendered at floor level so characters and 3D furniture naturally render ON TOP of it without depth sorting popping
      ctx.save();
      if (this.currentZone !== 'douyin_office') ctx.globalAlpha = this.outsideAlpha;
      this.models.drawTikTokFloorEmblem(ctx, 22.8, 37.5, 1.5, ox, oy);
      ctx.restore();

      // Basketball Court Boundary & Key Markings (Rendered on ground plane at x: 41..52, y: 17..26)
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.8;

      // Key Rectangle (x: 41.5 to 45.5, y: 20.0 to 23.0)
      const k0 = isoToScreen(41.5, 20.0, 0, ox, oy);
      const k1 = isoToScreen(45.5, 20.0, 0, ox, oy);
      const k2 = isoToScreen(45.5, 23.0, 0, ox, oy);
      const k3 = isoToScreen(41.5, 23.0, 0, ox, oy);
      ctx.beginPath();
      ctx.moveTo(k0.x, k0.y); ctx.lineTo(k1.x, k1.y); ctx.lineTo(k2.x, k2.y); ctx.lineTo(k3.x, k3.y);
      ctx.stroke();

      // Free throw circle top (centered at x: 45.5, y: 21.5)
      const ftP = isoToScreen(45.5, 21.5, 0, ox, oy);
      ctx.beginPath();
      ctx.ellipse(ftP.x, ftP.y, 16, 8, 0, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();

      // Three-point arc (centered at basket base x: 41.5, y: 21.5)
      const bCenter = isoToScreen(41.5, 21.5, 0, ox, oy);
      ctx.beginPath();
      ctx.ellipse(bCenter.x, bCenter.y, 50, 25, 0, -Math.PI / 2.3, Math.PI / 2.3);
      ctx.stroke();

      // Court Perimeter White Line (x: 41.2 to 51.8, y: 17.2 to 25.8)
      const c0 = isoToScreen(41.2, 17.2, 0, ox, oy);
      const c1 = isoToScreen(51.8, 17.2, 0, ox, oy);
      const c2 = isoToScreen(51.8, 25.8, 0, ox, oy);
      const c3 = isoToScreen(41.2, 25.8, 0, ox, oy);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(c0.x, c0.y); ctx.lineTo(c1.x, c1.y); ctx.lineTo(c2.x, c2.y); ctx.lineTo(c3.x, c3.y); ctx.lineTo(c0.x, c0.y);
      ctx.stroke();

      // Half-court line at x: 48.0
      const hc0 = isoToScreen(48.0, 17.2, 0, ox, oy);
      const hc1 = isoToScreen(48.0, 25.8, 0, ox, oy);
      ctx.beginPath();
      ctx.moveTo(hc0.x, hc0.y); ctx.lineTo(hc1.x, hc1.y);
      ctx.stroke();
      ctx.restore();

      // Render 3D Diorama Floating Island Crust along outer borders
      this.models.drawDioramaCrust(ctx, MAP_W, MAP_H, ox, oy);
    }

    // --- Collect All World Props & Entities for Topological Sorting ---
    buildStaticWorldEntities() {
      const list = [];
      const wallL = this.wallL;
      const wallR = this.wallR;
      const wallT = this.wallT;
      const H = 2.55; // Slightly taller than the doors (2.15m), providing solid lintel & architectural wall structure

      // === 1. ZONE 1: LUDWIG'S HOUSE ===
      // Ludwig's House Northwest Back Wall (along x = 0, y: 0 to 10)
      list.push({
        xMin: -0.15, xMax: 0.35,
        yMin: 0, yMax: HOUSE_MAX_Y + 1.0,
        draw: () => {
          this.models.drawBox(this.ctx, 0, 0, 0, 0.25, HOUSE_MAX_Y + 1, H, wallT, null, wallR, this.ox, this.oy);
          // Bedroom West Scenic Window at x = 0.26, y: 2.0..4.0, z: 1.15..2.15
          const bw0 = isoToScreen(0.26, 2.0, 1.15, this.ox, this.oy);
          const bw1 = isoToScreen(0.26, 4.0, 1.15, this.ox, this.oy);
          const bw2 = isoToScreen(0.26, 4.0, 2.15, this.ox, this.oy);
          const bw3 = isoToScreen(0.26, 2.0, 2.15, this.ox, this.oy);
          this.ctx.fillStyle = 'rgba(224, 242, 254, 0.55)';
          this.ctx.beginPath();
          this.ctx.moveTo(bw0.x, bw0.y); this.ctx.lineTo(bw1.x, bw1.y); this.ctx.lineTo(bw2.x, bw2.y); this.ctx.lineTo(bw3.x, bw3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#92400e';
          this.ctx.lineWidth = 1.6;
          this.ctx.stroke();
        }
      });

      // Ludwig's House Northeast Partition Wall (along y = 0, x: 0 to 10)
      list.push({
        xMin: 0, xMax: HOUSE_MAX_X + 1.0,
        yMin: -0.15, yMax: 0.35,
        draw: () => {
          this.models.drawBox(this.ctx, 0, 0, 0, HOUSE_MAX_X + 1, 0.25, H, wallT, wallL, null, this.ox, this.oy, wallR);
          // Master Bedroom Clerestory Window at y = 0.26, x: 1.2..3.5, z: 1.25..2.05
          const nw0 = isoToScreen(1.2, 0.26, 1.25, this.ox, this.oy);
          const nw1 = isoToScreen(3.5, 0.26, 1.25, this.ox, this.oy);
          const nw2 = isoToScreen(3.5, 0.26, 2.05, this.ox, this.oy);
          const nw3 = isoToScreen(1.2, 0.26, 2.05, this.ox, this.oy);
          this.ctx.fillStyle = 'rgba(224, 242, 254, 0.55)';
          this.ctx.beginPath();
          this.ctx.moveTo(nw0.x, nw0.y); this.ctx.lineTo(nw1.x, nw1.y); this.ctx.lineTo(nw2.x, nw2.y); this.ctx.lineTo(nw3.x, nw3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#92400e';
          this.ctx.lineWidth = 1.4;
          this.ctx.stroke();

          // Living Room Modern Framed Artwork at y = 0.26, x: 6.8..8.8, z: 1.15..1.95
          const ap0 = isoToScreen(6.8, 0.26, 1.15, this.ox, this.oy);
          const ap1 = isoToScreen(8.8, 0.26, 1.15, this.ox, this.oy);
          const ap2 = isoToScreen(8.8, 0.26, 1.95, this.ox, this.oy);
          const ap3 = isoToScreen(6.8, 0.26, 1.95, this.ox, this.oy);
          this.ctx.fillStyle = '#0f766e';
          this.ctx.beginPath();
          this.ctx.moveTo(ap0.x, ap0.y); this.ctx.lineTo(ap1.x, ap1.y); this.ctx.lineTo(ap2.x, ap2.y); this.ctx.lineTo(ap3.x, ap3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#f59e0b';
          this.ctx.lineWidth = 1.2;
          this.ctx.stroke();
        }
      });

      // SE Dividing Wall Left Segment (dL, y: 0 to 4.5)
      list.push({
        xMin: HOUSE_MAX_X + 0.85, xMax: HOUSE_MAX_X + 1.35,
        yMin: 0, yMax: 4.5,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaHouse < 0.99) this.ctx.globalAlpha = this.wallAlphaHouse;
          this.models.drawBox(this.ctx, HOUSE_MAX_X + 1, 0, 0, 0.25, 4.5, H, wallT, wallL, wallR, this.ox, this.oy);
          this.ctx.restore();
        }
      });
      // SE Dividing Wall Right Segment (dR, y: 6.8 to HOUSE_MAX_Y + 1)
      list.push({
        xMin: HOUSE_MAX_X + 0.85, xMax: HOUSE_MAX_X + 1.35,
        yMin: 6.8, yMax: HOUSE_MAX_Y + 1.25,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaHouse < 0.99) this.ctx.globalAlpha = this.wallAlphaHouse;
          this.models.drawBox(this.ctx, HOUSE_MAX_X + 1, 6.8, 0, 0.25, (HOUSE_MAX_Y + 1) - 6.8, H, wallT, wallL, wallR, this.ox, this.oy);
          this.ctx.restore();
        }
      });
      // Interactive Double Doors (Ludwig's House)
      const doorW = 1.15;
      const hx = HOUSE_MAX_X + 1.0;
      list.push({
        xMin: hx - 0.25,
        xMax: hx + 1.35,
        yMin: 4.4,
        yMax: 6.9,
        draw: () => {
          const doorAngle1 = this.doorLudwigOpen * 1.35;
          const nTipX = hx + Math.sin(doorAngle1) * doorW;
          const nTipY = 4.5 + Math.cos(doorAngle1) * doorW;
          const sTipX = hx + Math.sin(doorAngle1) * doorW;
          const sTipY = 6.8 - Math.cos(doorAngle1) * doorW;
          this.ctx.save();
          this.drawDoorLeaf(hx, 4.5, nTipX, nTipY, this.ox, this.oy);
          this.drawDoorLeaf(hx, 6.8, sTipX, sTipY, this.ox, this.oy);
          this.ctx.restore();
        }
      });

      // SE Doorway Lintel Beam & Mounted Home Plaque
      list.push({
        xMin: HOUSE_MAX_X + 0.85, xMax: HOUSE_MAX_X + 1.45,
        yMin: 4.45, yMax: 6.95,
        z: 2.15,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaHouse < 0.99) this.ctx.globalAlpha = this.wallAlphaHouse;
          this.models.drawBox(this.ctx, HOUSE_MAX_X + 1, 4.5, 2.15, 0.25, 2.3, H - 2.15, wallT, wallL, wallR, this.ox, this.oy);

          const plq = isoToScreen(HOUSE_MAX_X + 1.26, 5.65, 2.48, this.ox, this.oy);
          this.ctx.save();
          this.ctx.translate(plq.x, plq.y);
          this.ctx.transform(1, -0.5, 0, 1, 0, 0);
          this.ctx.fillStyle = '#1e293b';
          this.ctx.fillRect(-39, -8.5, 78, 17);
          this.ctx.strokeStyle = '#94a3b8';
          this.ctx.lineWidth = 1.2;
          this.ctx.strokeRect(-39, -8.5, 78, 17);
          this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
          this.ctx.lineWidth = 0.8;
          this.ctx.strokeRect(-37, -6.5, 74, 13);
          this.ctx.fillStyle = '#f8fafc';
          this.ctx.font = 'bold 8.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText("Ludwig's Home", 0, 0);
          this.ctx.restore();

          this.ctx.restore();
        }
      });

      // SW Side Wall & Terrace Doorway (along y = HOUSE_MAX_Y + 1 = 10)
      const swY = HOUSE_MAX_Y + 1.0;
      // Left Wall Segment (x: 0 to 4.5) with Inset Modern Window
      list.push({
        xMin: -0.1, xMax: 4.5, yMin: swY - 0.15, yMax: swY + 0.35,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaHouse < 0.99) this.ctx.globalAlpha = this.wallAlphaHouse;
          this.models.drawBox(this.ctx, 0, swY, 0, 4.5, 0.25, H, wallT, wallL, wallR, this.ox, this.oy);
          // Panoramic Frosted Glass Window inset into South Wall (z: 0.85 to 1.85)
          const wp0 = isoToScreen(0.8, swY + 0.12, 0.85, this.ox, this.oy);
          const wp1 = isoToScreen(3.8, swY + 0.12, 0.85, this.ox, this.oy);
          const wp2 = isoToScreen(3.8, swY + 0.12, 1.85, this.ox, this.oy);
          const wp3 = isoToScreen(0.8, swY + 0.12, 1.85, this.ox, this.oy);
          this.ctx.fillStyle = 'rgba(224, 242, 254, 0.55)';
          this.ctx.beginPath();
          this.ctx.moveTo(wp0.x, wp0.y); this.ctx.lineTo(wp1.x, wp1.y); this.ctx.lineTo(wp2.x, wp2.y); this.ctx.lineTo(wp3.x, wp3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#92400e';
          this.ctx.lineWidth = 1.8;
          this.ctx.stroke();
          this.ctx.restore();
        }
      });
      // Right Wall Segment (x: 6.8 to 10)
      list.push({
        xMin: 6.8, xMax: 10.25, yMin: swY - 0.15, yMax: swY + 0.35,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaHouse < 0.99) this.ctx.globalAlpha = this.wallAlphaHouse;
          this.models.drawBox(this.ctx, 6.8, swY, 0, 3.2, 0.25, H, wallT, wallL, wallR, this.ox, this.oy);
          this.ctx.restore();
        }
      });
      // SW Side Doorway Lintel Beam (z: 2.15 to H)
      list.push({
        xMin: 4.5, xMax: 6.8, yMin: swY - 0.15, yMax: swY + 0.35,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaHouse < 0.99) this.ctx.globalAlpha = this.wallAlphaHouse;
          this.models.drawBox(this.ctx, 4.5, swY, 2.15, 2.3, 0.25, H - 2.15, wallT, wallL, wallR, this.ox, this.oy);
          this.ctx.restore();
        }
      });

      // Side Porch Woven Coir Mat
      list.push({
        xMin: 4.8, xMax: 6.5, yMin: swY + 0.15, yMax: swY + 0.85,
        draw: () => {
          const sm0 = isoToScreen(4.8, swY + 0.15, 0.01, this.ox, this.oy);
          const sm1 = isoToScreen(6.5, swY + 0.15, 0.01, this.ox, this.oy);
          const sm2 = isoToScreen(6.5, swY + 0.85, 0.01, this.ox, this.oy);
          const sm3 = isoToScreen(4.8, swY + 0.85, 0.01, this.ox, this.oy);
          this.ctx.fillStyle = '#b45309';
          this.ctx.beginPath();
          this.ctx.moveTo(sm0.x, sm0.y); this.ctx.lineTo(sm1.x, sm1.y); this.ctx.lineTo(sm2.x, sm2.y); this.ctx.lineTo(sm3.x, sm3.y);
          this.ctx.closePath();
          this.ctx.fill();
        }
      });

      // Interactive Side Terrace Double Doors (Swings open into south garden porch)
      list.push({
        xMin: 4.4, xMax: 6.9,
        yMin: swY - 0.1, yMax: swY + 1.45,
        draw: () => {
          const sideDoorAngle = this.doorLudwigSideOpen * 1.35;
          const wTipX = 4.5 + Math.cos(sideDoorAngle) * doorW;
          const wTipY = swY + Math.sin(sideDoorAngle) * doorW;
          const eTipX = 6.8 - Math.cos(sideDoorAngle) * doorW;
          const eTipY = swY + Math.sin(sideDoorAngle) * doorW;
          this.ctx.save();
          this.drawDoorLeaf(4.5, swY, wTipX, wTipY, this.ox, this.oy);
          this.drawDoorLeaf(6.8, swY, eTipX, eTipY, this.ox, this.oy);
          this.ctx.restore();
        }
      });

      // House Furniture Props
      list.push({
        furnitureId: 'ludwig_bed',
        xMin: 1.0, xMax: 3.1, yMin: 1.0, yMax: 3.3,
        draw: () => this.models.drawMasterBed(this.ctx, 1.0, 1.0, this.ox, this.oy)
      });
      list.push({
        xMin: 6.0, xMax: 8.5, yMin: 1.0, yMax: 2.2,
        draw: () => this.models.drawDeveloperDesk(this.ctx, 6.0, 1.0, this.ox, this.oy)
      });
      list.push({
        xMin: 0.1, xMax: 0.8, yMin: 3.8, yMax: 6.4,
        draw: () => this.models.drawBookshelf(this.ctx, 0.1, 3.8, this.ox, this.oy)
      });
      list.push({
        furnitureId: 'ludwig_sofa',
        xMin: 2.0, xMax: 4.5, yMin: 5.0, yMax: 7.0,
        draw: () => this.models.drawLivingRoom(this.ctx, 2.0, 5.0, this.ox, this.oy)
      });
      list.push({
        xMin: 6.0, xMax: 8.2, yMin: 5.0, yMax: 6.8,
        draw: () => this.models.drawDiningTable(this.ctx, 6.0, 5.0, this.ox, this.oy)
      });

      // === 2. ZONE 2: MEN'S DORMITORY 11 ROOM 211 ===
      // 1. Northwest Back Wall (along x = 0, y: 17 to 27)
      list.push({
        xMin: -0.1, xMax: 0.35,
        yMin: DORM_MIN_Y, yMax: DORM_MAX_Y + 1,
        draw: () => {
          this.models.drawBox(this.ctx, 0, DORM_MIN_Y, 0, 0.25, (DORM_MAX_Y + 1) - DORM_MIN_Y, H, wallT, null, wallR, this.ox, this.oy);
          // Large Dorm Window at x = 0.26, y: 20.8..23.2, z: 1.15..2.15
          const w0 = isoToScreen(0.26, 20.8, 1.15, this.ox, this.oy);
          const w1 = isoToScreen(0.26, 23.2, 1.15, this.ox, this.oy);
          const w2 = isoToScreen(0.26, 23.2, 2.15, this.ox, this.oy);
          const w3 = isoToScreen(0.26, 20.8, 2.15, this.ox, this.oy);
          this.ctx.fillStyle = 'rgba(186, 230, 253, 0.55)';
          this.ctx.beginPath();
          this.ctx.moveTo(w0.x, w0.y); this.ctx.lineTo(w1.x, w1.y); this.ctx.lineTo(w2.x, w2.y); this.ctx.lineTo(w3.x, w3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#334155';
          this.ctx.lineWidth = 1.5;
          this.ctx.stroke();

          // University Hackathon Poster at x = 0.26, y: 18.2..19.6, z: 1.15..1.95
          const hp0 = isoToScreen(0.26, 18.2, 1.15, this.ox, this.oy);
          const hp1 = isoToScreen(0.26, 19.6, 1.15, this.ox, this.oy);
          const hp2 = isoToScreen(0.26, 19.6, 1.95, this.ox, this.oy);
          const hp3 = isoToScreen(0.26, 18.2, 1.95, this.ox, this.oy);
          this.ctx.fillStyle = '#0284c7';
          this.ctx.beginPath();
          this.ctx.moveTo(hp0.x, hp0.y); this.ctx.lineTo(hp1.x, hp1.y); this.ctx.lineTo(hp2.x, hp2.y); this.ctx.lineTo(hp3.x, hp3.y);
          this.ctx.closePath();
          this.ctx.fill();
        }
      });

      // 2. Northeast Partition Wall (along y = 17, x: 0 to 10)
      list.push({
        xMin: 0, xMax: DORM_MAX_X + 1,
        yMin: DORM_MIN_Y - 0.1, yMax: DORM_MIN_Y + 0.35,
        draw: () => {
          this.models.drawBox(this.ctx, 0, DORM_MIN_Y, 0, (DORM_MAX_X + 1), 0.25, H, wallT, wallL, null, this.ox, this.oy, wallR);
          // Cork Noticeboard at y = 17.26, x: 3.8..6.2, z: 1.15..1.85
          const cb0 = isoToScreen(3.8, DORM_MIN_Y + 0.26, 1.15, this.ox, this.oy);
          const cb1 = isoToScreen(6.2, DORM_MIN_Y + 0.26, 1.15, this.ox, this.oy);
          const cb2 = isoToScreen(6.2, DORM_MIN_Y + 0.26, 1.85, this.ox, this.oy);
          const cb3 = isoToScreen(3.8, DORM_MIN_Y + 0.26, 1.85, this.ox, this.oy);
          this.ctx.fillStyle = '#b45309';
          this.ctx.beginPath();
          this.ctx.moveTo(cb0.x, cb0.y); this.ctx.lineTo(cb1.x, cb1.y); this.ctx.lineTo(cb2.x, cb2.y); this.ctx.lineTo(cb3.x, cb3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#78350f';
          this.ctx.lineWidth = 1.2;
          this.ctx.stroke();
        }
      });

      // 3. Southeast Entrance Wall with Doorway
      const dormSE_X = DORM_MAX_X + 1;
      // Wall segment left of door (y: 17 to 20.5)
      list.push({
        xMin: dormSE_X - 0.15, xMax: dormSE_X + 0.35,
        yMin: DORM_MIN_Y, yMax: 20.5,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaDorm < 0.99) this.ctx.globalAlpha = this.wallAlphaDorm;
          this.models.drawBox(this.ctx, dormSE_X, DORM_MIN_Y, 0, 0.25, 20.5 - DORM_MIN_Y, H, wallT, wallL, wallR, this.ox, this.oy);
          this.ctx.restore();
        }
      });
      // Wall segment right of door (y: 22.8 to 27.25)
      list.push({
        xMin: dormSE_X - 0.15, xMax: dormSE_X + 0.35,
        yMin: 22.8, yMax: DORM_MAX_Y + 1.25,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaDorm < 0.99) this.ctx.globalAlpha = this.wallAlphaDorm;
          this.models.drawBox(this.ctx, dormSE_X, 22.8, 0, 0.25, (DORM_MAX_Y + 1.25) - 22.8, H, wallT, wallL, wallR, this.ox, this.oy);
          this.ctx.restore();
        }
      });
      // Dorm Interactive Double Doors
      const dormDoorW = 1.15;
      list.push({
        xMin: dormSE_X - 0.25,
        xMax: dormSE_X + 1.35,
        yMin: 20.4,
        yMax: 22.9,
        draw: () => {
          const dormDoorAngle = this.doorDormOpen * 1.35;
          const dnTipX = dormSE_X + Math.sin(dormDoorAngle) * dormDoorW;
          const dnTipY = 20.5 + Math.cos(dormDoorAngle) * dormDoorW;
          const dsTipX = dormSE_X + Math.sin(dormDoorAngle) * dormDoorW;
          const dsTipY = 22.8 - Math.cos(dormDoorAngle) * dormDoorW;
          this.ctx.save();
          if (this.wallAlphaDorm < 0.99) this.ctx.globalAlpha = this.wallAlphaDorm;
          this.drawDoorLeaf(dormSE_X, 20.5, dnTipX, dnTipY, this.ox, this.oy);
          this.drawDoorLeaf(dormSE_X, 22.8, dsTipX, dsTipY, this.ox, this.oy);
          this.ctx.restore();
        }
      });

      // Lintel beam & Mounted Bronze Plaque over Dorm 211 door
      list.push({
        xMin: dormSE_X - 0.25, xMax: dormSE_X + 1.35,
        yMin: 20.4, yMax: 22.9,
        z: 2.15,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaDorm < 0.99) this.ctx.globalAlpha = this.wallAlphaDorm;
          this.models.drawBox(this.ctx, dormSE_X, 20.5, 2.15, 0.25, 2.3, H - 2.15, wallT, wallL, wallR, this.ox, this.oy);

          const plq = isoToScreen(dormSE_X + 0.26, 21.65, 2.48, this.ox, this.oy);
          this.ctx.save();
          this.ctx.translate(plq.x, plq.y);
          this.ctx.transform(1, -0.5, 0, 1, 0, 0);
          this.ctx.fillStyle = '#1e3a8a';
          this.ctx.fillRect(-26, -8, 52, 16);
          this.ctx.strokeStyle = '#38bdf8';
          this.ctx.lineWidth = 1.2;
          this.ctx.strokeRect(-26, -8, 52, 16);
          this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          this.ctx.lineWidth = 0.8;
          this.ctx.strokeRect(-24, -6, 48, 12);
          this.ctx.fillStyle = '#f0f9ff';
          this.ctx.font = 'bold 8.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('男11 211', 0, 0);
          this.ctx.restore();

          this.ctx.restore();
        }
      });

      // 5. Four Symmetrical Loft Bed/Desk Combos Facing Each Other
      // NORTH ROW BEDS (facing: 'south' into room, chair back faces south towards central aisle)
      // Bed 1 (Happy Wang: x: 1.0, y: 17.5)
      list.push({
        furnitureId: 'dorm_bed_happy',
        xMin: 1.0, xMax: 3.2, yMin: 17.5, yMax: 19.5,
        draw: () => this.models.drawLoftBedDesk(this.ctx, 1.0, 17.5, { duvetColor: '#ea580c', screenColor: '#f97316', facing: 'south' }, this.ox, this.oy)
      });
      // Bed 3 (Clark Wu: x: 6.2, y: 17.5)
      list.push({
        furnitureId: 'dorm_bed_clark',
        xMin: 6.2, xMax: 8.4, yMin: 17.5, yMax: 19.5,
        draw: () => this.models.drawLoftBedDesk(this.ctx, 6.2, 17.5, { duvetColor: '#1d4ed8', screenColor: '#38bdf8', facing: 'south' }, this.ox, this.oy)
      });

      // SOUTH ROW BEDS (facing: 'north' into room, chair back faces north towards central aisle)
      // Bed 2 (Kerry Chang: x: 1.0, y: 24.5)
      list.push({
        furnitureId: 'dorm_bed_kerry',
        xMin: 1.0, xMax: 3.2, yMin: 23.8, yMax: 26.0,
        draw: () => this.models.drawLoftBedDesk(this.ctx, 1.0, 24.5, { duvetColor: '#0d9488', screenColor: '#2dd4bf', facing: 'north' }, this.ox, this.oy)
      });
      // Bed 4 (Jerry Chung: x: 6.2, y: 24.5)
      list.push({
        furnitureId: 'dorm_bed_billy',
        xMin: 6.2, xMax: 8.4, yMin: 23.8, yMax: 26.0,
        draw: () => this.models.drawLoftBedDesk(this.ctx, 6.2, 24.5, { duvetColor: '#7c3aed', screenColor: '#c084fc', facing: 'north' }, this.ox, this.oy)
      });

      // Dorm Common Lounge: Beloved Classic Blue Sofa, Orange Pillows & Coffee Table (Billy Fang's hangout)
      list.push({
        furnitureId: 'dorm_sofa',
        xMin: 3.6, xMax: 5.8, yMin: 20.6, yMax: 22.8,
        draw: () => this.models.drawDormCommonArea(this.ctx, 3.6, 20.8, this.ox, this.oy)
      });

      // Dormitory South Exterior Wall with Dual Campus Casement Windows (along y = DORM_MAX_Y + 1 = 27, x: 0 to 10)
      const dormSouthY = DORM_MAX_Y + 1.0;
      list.push({
        xMin: -0.1, xMax: DORM_MAX_X + 1.1,
        yMin: dormSouthY - 0.15, yMax: dormSouthY + 0.35,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaDorm < 0.99) this.ctx.globalAlpha = this.wallAlphaDorm;
          const isNight = (this.currentTimeState === 'night' || this.currentTimeState === 'galaxy');
          const wLen = (DORM_MAX_X + 1); // 10.0

          // Lower Base Wall (z: 0 to 0.85)
          this.models.drawBox(this.ctx, 0, dormSouthY, 0, wLen, 0.25, 0.85, wallT, wallL, wallR, this.ox, this.oy);
          // Upper Lintel Wall (z: 2.15 to H)
          this.models.drawBox(this.ctx, 0, dormSouthY, 2.15, wLen, 0.25, H - 2.15, wallT, wallL, wallR, this.ox, this.oy);
          // Concrete Pier Columns: Left (0..0.35), Center (4.85..5.15), Right (9.65..10.0 flush with East wall)
          this.models.drawBox(this.ctx, 0, dormSouthY, 0.85, 0.35, 0.25, 1.30, wallT, wallL, wallR, this.ox, this.oy);
          this.models.drawBox(this.ctx, 4.85, dormSouthY, 0.85, 0.30, 0.25, 1.30, wallT, wallL, wallR, this.ox, this.oy);
          this.models.drawBox(this.ctx, 9.65, dormSouthY, 0.85, 0.35, 0.25, 1.30, wallT, wallL, wallR, this.ox, this.oy);

          // Dual Campus Casement Windows (Bay 1: x: 0.35 to 4.85, Bay 2: x: 5.15 to 9.65, z: 0.85 to 2.15)
          [ { x0: 0.35, x1: 4.85 }, { x0: 5.15, x1: 9.65 } ].forEach(bay => {
            const p0 = isoToScreen(bay.x0, dormSouthY + 0.12, 0.85, this.ox, this.oy);
            const p1 = isoToScreen(bay.x1, dormSouthY + 0.12, 0.85, this.ox, this.oy);
            const p2 = isoToScreen(bay.x1, dormSouthY + 0.12, 2.15, this.ox, this.oy);
            const p3 = isoToScreen(bay.x0, dormSouthY + 0.12, 2.15, this.ox, this.oy);
            this.ctx.fillStyle = isNight ? 'rgba(254, 240, 138, 0.22)' : 'rgba(224, 242, 254, 0.35)';
            this.ctx.beginPath();
            this.ctx.moveTo(p0.x, p0.y); this.ctx.lineTo(p1.x, p1.y); this.ctx.lineTo(p2.x, p2.y); this.ctx.lineTo(p3.x, p3.y);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.strokeStyle = '#64748b';
            this.ctx.lineWidth = 1.4;
            this.ctx.stroke();

            // Window Mullions (vertical dividers)
            const midX = (bay.x0 + bay.x1) / 2;
            const m0 = isoToScreen(midX, dormSouthY + 0.12, 0.85, this.ox, this.oy);
            const m1 = isoToScreen(midX, dormSouthY + 0.12, 2.15, this.ox, this.oy);
            this.ctx.lineWidth = 1.0;
            this.ctx.beginPath();
            this.ctx.moveTo(m0.x, m0.y); this.ctx.lineTo(m1.x, m1.y);
            this.ctx.stroke();
          });

          this.ctx.restore();
        }
      });

      // === 3. ZONE 3: LUDWIGIA AI RESEARCH STUDIO ===
      // AI Studio Entrance Walls & Plaque
      list.push({
        xMin: AI_MIN_X - 0.15, xMax: AI_MIN_X + 0.35,
        yMin: 0, yMax: 4.5,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaAi < 0.99) this.ctx.globalAlpha = this.wallAlphaAi;
          this.models.drawBox(this.ctx, AI_MIN_X, 0, 0, 0.25, 4.5, H, wallT, wallL, wallR, this.ox, this.oy);
          this.ctx.restore();
        }
      });
      list.push({
        xMin: AI_MIN_X - 0.15, xMax: AI_MIN_X + 0.35,
        yMin: 6.8, yMax: 10,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaAi < 0.99) this.ctx.globalAlpha = this.wallAlphaAi;
          this.models.drawBox(this.ctx, AI_MIN_X, 6.8, 0, 0.25, 3.2, H, wallT, wallL, wallR, this.ox, this.oy);
          this.ctx.restore();
        }
      });
      // AI Studio Lintel Beam (z: 2.15 to H)
      list.push({
        xMin: AI_MIN_X - 0.15, xMax: AI_MIN_X + 0.35,
        yMin: 4.5, yMax: 6.8,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaAi < 0.99) this.ctx.globalAlpha = this.wallAlphaAi;
          this.models.drawBox(this.ctx, AI_MIN_X, 4.5, 2.15, 0.25, 2.3, H - 2.15, wallT, wallL, wallR, this.ox, this.oy);
          this.ctx.restore();
        }
      });

      // AI Studio Sliding Glass Door
      list.push({
        xMin: AI_MIN_X - 0.15, xMax: AI_MIN_X + 0.15,
        yMin: 4.5, yMax: 8.5,
        draw: () => {
          const aiSlideOffset = this.doorAiOpen * 1.5;
          this.ctx.save();
          if (this.wallAlphaAi < 0.99) this.ctx.globalAlpha = this.wallAlphaAi;
          const dg0 = isoToScreen(AI_MIN_X, 4.6 + aiSlideOffset, 0, this.ox, this.oy);
          const dg1 = isoToScreen(AI_MIN_X, 6.7 + aiSlideOffset, 0, this.ox, this.oy);
          const dg2 = isoToScreen(AI_MIN_X, 6.7 + aiSlideOffset, 2.06, this.ox, this.oy);
          const dg3 = isoToScreen(AI_MIN_X, 4.6 + aiSlideOffset, 2.06, this.ox, this.oy);
          this.ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
          this.ctx.beginPath();
          this.ctx.moveTo(dg0.x, dg0.y); this.ctx.lineTo(dg1.x, dg1.y); this.ctx.lineTo(dg2.x, dg2.y); this.ctx.lineTo(dg3.x, dg3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#06b6d4';
          this.ctx.lineWidth = 1.5;
          this.ctx.stroke();
          this.ctx.restore();
        }
      });

      // AI Studio North Partition Wall & Interior Feature Brand Sign (facing South towards camera!)
      list.push({
        xMin: AI_MIN_X - 0.15, xMax: AI_MAX_X + 1.0,
        yMin: -0.15, yMax: 0.35,
        draw: () => {
          this.models.drawBox(this.ctx, AI_MIN_X, 0, 0, (AI_MAX_X + 1) - AI_MIN_X, 0.25, H, wallT, wallL, wallR, this.ox, this.oy, wallR);
        }
      });
      list.push({
        xMin: 21.0, xMax: 24.5, yMin: 0.15, yMax: 0.35,
        draw: () => {
          this.models.drawInteriorBrandSign(this.ctx, 22.8, 0.26, 2.45, 'ai', this.ox, this.oy);
        }
      });

      // AI Studio Entrance Cyber Canopy
      list.push({
        xMin: 17.1, xMax: 18.15,
        yMin: 4.5, yMax: 6.95,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaAi < 0.99) this.ctx.globalAlpha = this.wallAlphaAi;

          // 1. Sleek Floating Cyber Canopy Roof Slab (Extending outward over the door toward the courtyard)
          this.models.drawBox(this.ctx, 17.2, 4.5, 2.20, 0.85, 2.30, 0.15, '#0f172a', '#06b6d4', '#1e293b', this.ox, this.oy);

          // 2. Under-Canopy Cyber Neon Underside Glow (Facing courtyard)
          const ug0 = isoToScreen(17.2, 4.5, 2.20, this.ox, this.oy);
          const ug1 = isoToScreen(18.0, 4.5, 2.20, this.ox, this.oy);
          const ug2 = isoToScreen(18.0, 6.8, 2.20, this.ox, this.oy);
          const ug3 = isoToScreen(17.2, 6.8, 2.20, this.ox, this.oy);
          this.ctx.fillStyle = 'rgba(6, 182, 212, 0.22)';
          this.ctx.beginPath();
          this.ctx.moveTo(ug0.x, ug0.y); this.ctx.lineTo(ug1.x, ug1.y); this.ctx.lineTo(ug2.x, ug2.y); this.ctx.lineTo(ug3.x, ug3.y);
          this.ctx.closePath();
          this.ctx.fill();

          this.ctx.restore();
        }
      });

      // AI Studio Campus Landmark Monument Totem (Standing proudly on open entrance lawn facing courtyard)
      list.push({
        xMin: 15.3, xMax: 16.2,
        yMin: 7.0, yMax: 7.6,
        draw: () => this.models.drawEntranceTotem(this.ctx, 15.5, 7.2, 'ai', this.ox, this.oy)
      });

      // AI Studio Equipment
      list.push({
        xMin: 19.5, xMax: 21.3, yMin: 1.2, yMax: 2.4,
        draw: () => this.models.drawServerRacks(this.ctx, 19.5, 1.2, this.ox, this.oy)
      });
      list.push({
        xMin: 23.5, xMax: 26.0, yMin: 1.2, yMax: 2.4,
        draw: () => this.models.drawAiCommandDesk(this.ctx, 23.5, 1.2, this.ox, this.oy)
      });
      list.push({
        xMin: 26.2, xMax: 27.0, yMin: 4.0, yMax: 6.4,
        draw: () => this.models.drawGlassWhiteboard(this.ctx, 26.2, 4.0, this.ox, this.oy)
      });
      list.push({
        xMin: 19.5, xMax: 21.3, yMin: 7.2, yMax: 8.4,
        draw: () => this.models.drawEspressoBar(this.ctx, 19.5, 7.2, this.ox, this.oy)
      });

      // AI Studio South Wall (along y = AI_MAX_Y + 1 = 10, x: 18 to 28)
      // Facing the central lawn with panoramic Cyber Glass Observation Window
      const aiSouthY = AI_MAX_Y + 1.0;
      list.push({
        xMin: AI_MIN_X - 0.15, xMax: AI_MAX_X + 1.0,
        yMin: aiSouthY - 0.15, yMax: aiSouthY + 0.35,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaAi < 0.99) this.ctx.globalAlpha = this.wallAlphaAi;
          this.models.drawBox(this.ctx, AI_MIN_X, aiSouthY, 0, (AI_MAX_X + 1) - AI_MIN_X, 0.25, H, wallT, wallL, wallR, this.ox, this.oy);

          // Panoramic Cyber Glass Observation Window (x: 21.0 to 26.5, z: 0.85 to 1.95)
          const cw0 = isoToScreen(21.0, aiSouthY + 0.26, 0.85, this.ox, this.oy);
          const cw1 = isoToScreen(26.5, aiSouthY + 0.26, 0.85, this.ox, this.oy);
          const cw2 = isoToScreen(26.5, aiSouthY + 0.26, 1.95, this.ox, this.oy);
          const cw3 = isoToScreen(21.0, aiSouthY + 0.26, 1.95, this.ox, this.oy);
          this.ctx.fillStyle = 'rgba(6, 182, 212, 0.45)';
          this.ctx.beginPath();
          this.ctx.moveTo(cw0.x, cw0.y); this.ctx.lineTo(cw1.x, cw1.y); this.ctx.lineTo(cw2.x, cw2.y); this.ctx.lineTo(cw3.x, cw3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#06b6d4';
          this.ctx.lineWidth = 1.5;
          this.ctx.stroke();

          // Cyber Window Horizontal Dividing Mullion (z: 1.40)
          const cm0 = isoToScreen(21.0, aiSouthY + 0.26, 1.40, this.ox, this.oy);
          const cm1 = isoToScreen(26.5, aiSouthY + 0.26, 1.40, this.ox, this.oy);
          this.ctx.strokeStyle = 'rgba(34, 211, 238, 0.7)';
          this.ctx.lineWidth = 1.0;
          this.ctx.beginPath();
          this.ctx.moveTo(cm0.x, cm0.y); this.ctx.lineTo(cm1.x, cm1.y);
          this.ctx.stroke();

          this.ctx.restore();
        }
      });

      // AI Studio East Facade Floor-to-Ceiling Panoramic Glass Window (along x = AI_MAX_X + 1 = 28, y: 0 to 10)
      list.push({
        xMin: AI_MAX_X + 0.85, xMax: AI_MAX_X + 1.35,
        yMin: 0, yMax: 10.0,
        draw: () => {
          const ex = AI_MAX_X + 1.0;
          this.ctx.save();
          if (this.wallAlphaAi < 0.99) this.ctx.globalAlpha = this.wallAlphaAi;

          // 1. Dark Titanium Base Sill & Top Header Beams
          this.models.drawBox(this.ctx, ex, 0, 0, 0.25, 10.0, 0.40, '#0f172a', '#1e293b', '#334155', this.ox, this.oy);
          this.models.drawBox(this.ctx, ex, 0, 2.45, 0.25, 10.0, H - 2.45, '#0f172a', '#1e293b', '#334155', this.ox, this.oy);

          // 2. Corner Structural Pillars
          this.models.drawBox(this.ctx, ex, 0, 0.40, 0.25, 0.6, 2.05, wallT, wallL, wallR, this.ox, this.oy);
          this.models.drawBox(this.ctx, ex, 9.4, 0.40, 0.25, 0.6, 2.05, wallT, wallL, wallR, this.ox, this.oy);

          // 3. Floor-to-Ceiling Cyan Glazed Glass Panel (y: 0.6 to 9.4, z: 0.40 to 2.45)
          const gw0 = isoToScreen(ex + 0.12, 0.6, 0.40, this.ox, this.oy);
          const gw1 = isoToScreen(ex + 0.12, 9.4, 0.40, this.ox, this.oy);
          const gw2 = isoToScreen(ex + 0.12, 9.4, 2.45, this.ox, this.oy);
          const gw3 = isoToScreen(ex + 0.12, 0.6, 2.45, this.ox, this.oy);
          this.ctx.fillStyle = 'rgba(6, 182, 212, 0.28)';
          this.ctx.beginPath();
          this.ctx.moveTo(gw0.x, gw0.y); this.ctx.lineTo(gw1.x, gw1.y); this.ctx.lineTo(gw2.x, gw2.y); this.ctx.lineTo(gw3.x, gw3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#06b6d4';
          this.ctx.lineWidth = 1.4;
          this.ctx.stroke();

          // 4. Vertical Slim Mullion Dividers
          [2.8, 5.0, 7.2].forEach(my => {
            const m0 = isoToScreen(ex + 0.12, my, 0.40, this.ox, this.oy);
            const m1 = isoToScreen(ex + 0.12, my, 2.45, this.ox, this.oy);
            this.ctx.beginPath();
            this.ctx.moveTo(m0.x, m0.y); this.ctx.lineTo(m1.x, m1.y);
            this.ctx.stroke();
          });

          this.ctx.restore();
        }
      });

      // === 4. ZONE 4: LUDWIGIA GRAND LIBRARY & BOTANICAL READING HALL ===
      // Library North Partition Wall (along y = LIB_MIN_Y = 17, x: 18 to 28)
      // Solid architectural wall behind Grand Mahogany Bookcases facing the lawn
      list.push({
        xMin: LIB_MIN_X - 0.15, xMax: LIB_MAX_X + 1.0,
        yMin: LIB_MIN_Y - 0.15, yMax: LIB_MIN_Y + 0.18,
        draw: () => {
          this.models.drawBox(this.ctx, LIB_MIN_X, LIB_MIN_Y, 0, (LIB_MAX_X + 1) - LIB_MIN_X, 0.25, H, wallT, wallL, wallR, this.ox, this.oy, wallR);

          // Exterior Classical Stained Glass Clerestory Windows (facing lawn at y = 17.0, z: 1.25 to 2.15)
          // Window 1 (x: 20.0 to 22.8)
          const lw0 = isoToScreen(20.0, LIB_MIN_Y - 0.01, 1.25, this.ox, this.oy);
          const lw1 = isoToScreen(22.8, LIB_MIN_Y - 0.01, 1.25, this.ox, this.oy);
          const lw2 = isoToScreen(22.8, LIB_MIN_Y - 0.01, 2.15, this.ox, this.oy);
          const lw3 = isoToScreen(20.0, LIB_MIN_Y - 0.01, 2.15, this.ox, this.oy);
          this.ctx.fillStyle = 'rgba(251, 191, 36, 0.45)';
          this.ctx.beginPath();
          this.ctx.moveTo(lw0.x, lw0.y); this.ctx.lineTo(lw1.x, lw1.y); this.ctx.lineTo(lw2.x, lw2.y); this.ctx.lineTo(lw3.x, lw3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#d97706';
          this.ctx.lineWidth = 1.2;
          this.ctx.stroke();

          // Window 2 (x: 23.8 to 26.6)
          const rw0 = isoToScreen(23.8, LIB_MIN_Y - 0.01, 1.25, this.ox, this.oy);
          const rw1 = isoToScreen(26.6, LIB_MIN_Y - 0.01, 1.25, this.ox, this.oy);
          const rw2 = isoToScreen(26.6, LIB_MIN_Y - 0.01, 2.15, this.ox, this.oy);
          const rw3 = isoToScreen(23.8, LIB_MIN_Y - 0.01, 2.15, this.ox, this.oy);
          this.ctx.fillStyle = 'rgba(251, 191, 36, 0.45)';
          this.ctx.beginPath();
          this.ctx.moveTo(rw0.x, rw0.y); this.ctx.lineTo(rw1.x, rw1.y); this.ctx.lineTo(rw2.x, rw2.y); this.ctx.lineTo(rw3.x, rw3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#d97706';
          this.ctx.lineWidth = 1.2;
          this.ctx.stroke();
        }
      });

      // Library NW Entrance Walls & Bronze Plaque
      list.push({
        xMin: LIB_MIN_X - 0.15, xMax: LIB_MIN_X + 0.35,
        yMin: LIB_MIN_Y, yMax: 20.5,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaLib < 0.99) this.ctx.globalAlpha = this.wallAlphaLib;
          this.models.drawBox(this.ctx, LIB_MIN_X, LIB_MIN_Y, 0, 0.25, 3.5, H, wallT, wallL, wallR, this.ox, this.oy);
          this.ctx.restore();
        }
      });
      list.push({
        xMin: LIB_MIN_X - 0.15, xMax: LIB_MIN_X + 0.35,
        yMin: 22.8, yMax: LIB_MAX_Y + 1.25,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaLib < 0.99) this.ctx.globalAlpha = this.wallAlphaLib;
          this.models.drawBox(this.ctx, LIB_MIN_X, 22.8, 0, 0.25, (LIB_MAX_Y + 1.25) - 22.8, H, wallT, wallL, wallR, this.ox, this.oy);
          this.ctx.restore();
        }
      });
      // Library Double Mahogany Swinging Doors
      const libDoorW = 1.15;
      list.push({
        xMin: LIB_MIN_X - 0.25,
        xMax: LIB_MIN_X + 1.35,
        yMin: 20.4,
        yMax: 22.9,
        draw: () => {
          const libDoorAngle = this.doorLibOpen * 1.35;
          const libnTipX = LIB_MIN_X + Math.sin(libDoorAngle) * libDoorW;
          const libnTipY = 20.5 + Math.cos(libDoorAngle) * libDoorW;
          const libsTipX = LIB_MIN_X + Math.sin(libDoorAngle) * libDoorW;
          const libsTipY = 22.8 - Math.cos(libDoorAngle) * libDoorW;
          this.ctx.save();
          if (this.wallAlphaLib < 0.99) this.ctx.globalAlpha = this.wallAlphaLib;
          this.drawDoorLeaf(LIB_MIN_X, 20.5, libnTipX, libnTipY, this.ox, this.oy);
          this.drawDoorLeaf(LIB_MIN_X, 22.8, libsTipX, libsTipY, this.ox, this.oy);
          this.ctx.restore();
        }
      });

      // Lintel beam & Mounted Brand Sign over library door
      list.push({
        xMin: LIB_MIN_X - 0.25, xMax: LIB_MIN_X + 1.35,
        yMin: 20.4, yMax: 22.9,
        z: 2.15,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaLib < 0.99) this.ctx.globalAlpha = this.wallAlphaLib;
          this.models.drawBox(this.ctx, LIB_MIN_X, 20.5, 2.15, 0.25, 2.3, H - 2.15, wallT, wallL, wallR, this.ox, this.oy);

          const plq = isoToScreen(18.26, 21.65, 2.48, this.ox, this.oy);
          this.ctx.save();
          this.ctx.translate(plq.x, plq.y);
          this.ctx.transform(1, -0.5, 0, 1, 0, 0);
          this.ctx.fillStyle = '#451a03';
          this.ctx.fillRect(-38, -9, 76, 18);
          this.ctx.strokeStyle = '#d97706';
          this.ctx.lineWidth = 1.2;
          this.ctx.strokeRect(-38, -9, 76, 18);
          this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
          this.ctx.lineWidth = 0.8;
          this.ctx.strokeRect(-36, -7, 72, 14);
          this.ctx.fillStyle = '#fbbf24';
          this.ctx.font = 'bold 8.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('📖 知識藏書閣', 0, -3.5);
          this.ctx.fillStyle = '#fde68a';
          this.ctx.font = 'bold 6.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
          this.ctx.fillText('GRAND LIBRARY', 0, 4.5);
          this.ctx.restore();

          this.ctx.restore();
        }
      });

      // Grand Library Entrance Classical Portico Canopy & Front-Facing (South-Facing) Bronze Plaque
      list.push({
        xMin: 17.1, xMax: 18.15,
        yMin: 20.5, yMax: 22.95,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaLib < 0.99) this.ctx.globalAlpha = this.wallAlphaLib;

          // 1. Classical Mahogany Portico Canopy (Extending outward over the entrance door)
          this.models.drawBox(this.ctx, 17.2, 20.5, 2.20, 0.85, 2.30, 0.15, '#78350f', '#451a03', '#92400e', this.ox, this.oy);

          // 2. Warm Amber Underside Illumination
          const ug0 = isoToScreen(17.2, 20.5, 2.20, this.ox, this.oy);
          const ug1 = isoToScreen(18.0, 20.5, 2.20, this.ox, this.oy);
          const ug2 = isoToScreen(18.0, 22.8, 2.20, this.ox, this.oy);
          const ug3 = isoToScreen(17.2, 22.8, 2.20, this.ox, this.oy);
          this.ctx.fillStyle = 'rgba(251, 191, 36, 0.20)';
          this.ctx.beginPath();
          this.ctx.moveTo(ug0.x, ug0.y); this.ctx.lineTo(ug1.x, ug1.y); this.ctx.lineTo(ug2.x, ug2.y); this.ctx.lineTo(ug3.x, ug3.y);
          this.ctx.closePath();
          this.ctx.fill();

          this.ctx.restore();
        }
      });

      // Grand Library Campus Landmark Monument Totem (Standing proudly on open entrance lawn facing courtyard)
      list.push({
        xMin: 15.3, xMax: 16.2,
        yMin: 21.8, yMax: 22.5,
        draw: () => this.models.drawEntranceTotem(this.ctx, 15.5, 22.0, 'lib', this.ox, this.oy)
      });

      // Library Interior Furniture:
      // 1. Grand Mahogany Book Walls with Brass Rolling Ladders (North Wall)
      list.push({
        xMin: 18.4, xMax: 22.5, yMin: 17.20, yMax: 18.00,
        draw: () => this.models.drawLibraryBookWall(this.ctx, 18.4, 17.20, this.ox, this.oy, 4.1, 1)
      });
      list.push({
        xMin: 22.7, xMax: 26.8, yMin: 17.20, yMax: 18.00,
        draw: () => this.models.drawLibraryBookWall(this.ctx, 22.7, 17.20, this.ox, this.oy, 4.1, 2)
      });

      // 1B. West Wall Library Corner Stack (Floor-to-Ceiling Shelves)
      list.push({
        xMin: 18.1, xMax: 18.9, yMin: 17.6, yMax: 20.4,
        draw: () => this.models.drawLibraryWestBookWall(this.ctx, 18.2, 17.6, this.ox, this.oy, 2.6)
      });

      // 1C. Mobile Library Book Cart (Scholarly Book Trolley)
      list.push({
        xMin: 22.4, xMax: 23.5, yMin: 18.4, yMax: 19.2,
        draw: () => this.models.drawLibraryBookCart(this.ctx, 22.5, 18.4, this.ox, this.oy)
      });

      // 2. Long Walnut Banker's Study Table with Emerald Lamp & Folios
      list.push({
        xMin: 20.0, xMax: 22.6, yMin: 20.0, yMax: 21.4,
        draw: () => this.models.drawBankerDesk(this.ctx, 20.0, 20.0, this.ox, this.oy)
      });

      // 3. Botanical Terrarium Pedestal
      list.push({
        xMin: 24.8, xMax: 26.0, yMin: 19.2, yMax: 20.4,
        draw: () => this.models.drawTerrarium(this.ctx, 24.8, 19.2, this.ox, this.oy)
      });

      // 4. Tufted Leather Wingback Reading Nook & Rug & Novel Stack
      list.push({
        xMin: 23.8, xMax: 26.2, yMin: 22.0, yMax: 24.2,
        draw: () => this.models.drawWingbackReadingNook(this.ctx, 23.8, 22.0, this.ox, this.oy)
      });

      // 5. Standing Brass Celestial Armillary Globe
      list.push({
        xMin: 20.2, xMax: 21.4, yMin: 23.6, yMax: 24.8,
        draw: () => this.models.drawCelestialGlobe(this.ctx, 20.8, 24.2, this.ox, this.oy)
      });

      // 6. Illuminated Rare Book Vitrine & Manuscript Cabinet (SE Alcove)
      list.push({
        xMin: 24.2, xMax: 26.8, yMin: 24.8, yMax: 25.5,
        draw: () => this.models.drawRareBookVitrine(this.ctx, 24.3, 24.8, this.ox, this.oy)
      });

      // 6. Library South Exterior Wall with Classical Reading Windows (along y = LIB_MAX_Y + 1 = 27, x: 18 to 28)
      const libSouthY = LIB_MAX_Y + 1.0;
      list.push({
        xMin: LIB_MIN_X - 0.1, xMax: LIB_MAX_X + 1.1,
        yMin: libSouthY - 0.15, yMax: libSouthY + 0.35,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaLib < 0.99) this.ctx.globalAlpha = this.wallAlphaLib;
          const isNight = (this.currentTimeState === 'night' || this.currentTimeState === 'galaxy');
          const wLen = (LIB_MAX_X + 1) - LIB_MIN_X; // 10.0

          // Lower Walnut Plinth Base Wall (z: 0 to 0.70)
          this.models.drawBox(this.ctx, LIB_MIN_X, libSouthY, 0, wLen, 0.25, 0.70, '#451a03', '#331402', '#260e01', this.ox, this.oy);
          // Upper Arch Cornice / Lintel Wall (z: 2.20 to H)
          this.models.drawBox(this.ctx, LIB_MIN_X, libSouthY, 2.20, wLen, 0.25, H - 2.20, '#451a03', '#331402', '#260e01', this.ox, this.oy);
          // Classical Pilasters / Columns at x: 18.0..18.6, 21.0..21.6, 24.4..25.0, 27.4..28.0
          const cols = [18.0, 21.0, 24.4, 27.4];
          cols.forEach(cx => {
            this.models.drawBox(this.ctx, cx, libSouthY, 0.70, 0.6, 0.25, 1.50, '#58240a', '#451a03', '#331402', this.ox, this.oy);
          });

          // Classical Library Reading Window Bays
          const bays = [
            { x0: 18.6, x1: 21.0 },
            { x0: 21.6, x1: 24.4 },
            { x0: 25.0, x1: 27.4 }
          ];
          bays.forEach(bay => {
            const p0 = isoToScreen(bay.x0, libSouthY + 0.12, 0.70, this.ox, this.oy);
            const p1 = isoToScreen(bay.x1, libSouthY + 0.12, 0.70, this.ox, this.oy);
            const p2 = isoToScreen(bay.x1, libSouthY + 0.12, 2.20, this.ox, this.oy);
            const p3 = isoToScreen(bay.x0, libSouthY + 0.12, 2.20, this.ox, this.oy);
            this.ctx.fillStyle = isNight ? 'rgba(254, 243, 199, 0.28)' : 'rgba(219, 234, 254, 0.35)';
            this.ctx.beginPath();
            this.ctx.moveTo(p0.x, p0.y); this.ctx.lineTo(p1.x, p1.y); this.ctx.lineTo(p2.x, p2.y); this.ctx.lineTo(p3.x, p3.y);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.strokeStyle = '#b45309'; // Warm brass/amber framing
            this.ctx.lineWidth = 1.3;
            this.ctx.stroke();

            // Vertical mullion
            const midX = (bay.x0 + bay.x1) / 2;
            const m0 = isoToScreen(midX, libSouthY + 0.12, 0.70, this.ox, this.oy);
            const m1 = isoToScreen(midX, libSouthY + 0.12, 2.20, this.ox, this.oy);
            this.ctx.lineWidth = 0.9;
            this.ctx.beginPath();
            this.ctx.moveTo(m0.x, m0.y); this.ctx.lineTo(m1.x, m1.y);
            this.ctx.stroke();
          });

          this.ctx.restore();
        }
      });

      // Library East Facade Floor-to-Ceiling Botanical Panoramic Glass Window (along x = LIB_MAX_X + 1 = 28, y: 17 to 27)
      list.push({
        xMin: LIB_MAX_X + 0.85, xMax: LIB_MAX_X + 1.35,
        yMin: LIB_MIN_Y, yMax: LIB_MAX_Y + 1.25,
        draw: () => {
          const ex = LIB_MAX_X + 1.0;
          this.ctx.save();
          if (this.wallAlphaLib < 0.99) this.ctx.globalAlpha = this.wallAlphaLib;

          // 1. Classical Mahogany Base Sill & Top Header Beams
          this.models.drawBox(this.ctx, ex, LIB_MIN_Y, 0, 0.25, 10.25, 0.40, '#58240a', '#451a03', '#291006', this.ox, this.oy);
          this.models.drawBox(this.ctx, ex, LIB_MIN_Y, 2.45, 0.25, 10.25, H - 2.45, '#58240a', '#451a03', '#291006', this.ox, this.oy);

          // 2. Solid Corner Mahogany Pillars
          this.models.drawBox(this.ctx, ex, LIB_MIN_Y, 0.40, 0.25, 0.6, 2.05, wallT, wallL, wallR, this.ox, this.oy);
          this.models.drawBox(this.ctx, ex, LIB_MAX_Y + 0.5, 0.40, 0.25, 0.75, 2.05, wallT, wallL, wallR, this.ox, this.oy);

          // 3. Floor-to-Ceiling Warm Amber Glazed Glass Panel (y: 17.6 to 26.5, z: 0.40 to 2.45)
          const gw0 = isoToScreen(ex + 0.12, 17.6, 0.40, this.ox, this.oy);
          const gw1 = isoToScreen(ex + 0.12, 26.5, 0.40, this.ox, this.oy);
          const gw2 = isoToScreen(ex + 0.12, 26.5, 2.45, this.ox, this.oy);
          const gw3 = isoToScreen(ex + 0.12, 17.6, 2.45, this.ox, this.oy);
          this.ctx.fillStyle = 'rgba(254, 243, 199, 0.30)';
          this.ctx.beginPath();
          this.ctx.moveTo(gw0.x, gw0.y); this.ctx.lineTo(gw1.x, gw1.y); this.ctx.lineTo(gw2.x, gw2.y); this.ctx.lineTo(gw3.x, gw3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#d97706';
          this.ctx.lineWidth = 1.4;
          this.ctx.stroke();

          // 4. Vertical Slim Bronze Mullion Dividers
          [19.8, 22.0, 24.2].forEach(my => {
            const m0 = isoToScreen(ex + 0.12, my, 0.40, this.ox, this.oy);
            const m1 = isoToScreen(ex + 0.12, my, 2.45, this.ox, this.oy);
            this.ctx.beginPath();
            this.ctx.moveTo(m0.x, m0.y); this.ctx.lineTo(m1.x, m1.y);
            this.ctx.stroke();
          });

          this.ctx.restore();
        }
      });

      // === 5. ZONE 5: SANMIN HIGH SCHOOL (ROW 3 WEST, x: 0..9, y: 33..42) ===
      // Classroom NW Exterior Wall with Windows (along x = 0, y: 33 to 43)
      list.push({
        xMin: -0.15, xMax: 0.35,
        yMin: SCHOOL_MIN_Y, yMax: SCHOOL_MAX_Y + 1,
        draw: () => {
          this.models.drawBox(this.ctx, 0, SCHOOL_MIN_Y, 0, 0.25, (SCHOOL_MAX_Y + 1) - SCHOOL_MIN_Y, H, wallT, null, wallR, this.ox, this.oy);

          // Classroom High Windows (y: 35.0 to 37.5 and 38.5 to 41.0, z: 1.15 to 2.15)
          const sw1_0 = isoToScreen(0.26, 35.0, 1.15, this.ox, this.oy);
          const sw1_1 = isoToScreen(0.26, 37.5, 1.15, this.ox, this.oy);
          const sw1_2 = isoToScreen(0.26, 37.5, 2.15, this.ox, this.oy);
          const sw1_3 = isoToScreen(0.26, 35.0, 2.15, this.ox, this.oy);
          this.ctx.fillStyle = 'rgba(224, 242, 254, 0.5)';
          this.ctx.beginPath();
          this.ctx.moveTo(sw1_0.x, sw1_0.y); this.ctx.lineTo(sw1_1.x, sw1_1.y); this.ctx.lineTo(sw1_2.x, sw1_2.y); this.ctx.lineTo(sw1_3.x, sw1_3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#0284c7';
          this.ctx.lineWidth = 1.2;
          this.ctx.stroke();

          const sw2_0 = isoToScreen(0.26, 38.5, 1.15, this.ox, this.oy);
          const sw2_1 = isoToScreen(0.26, 41.0, 1.15, this.ox, this.oy);
          const sw2_2 = isoToScreen(0.26, 41.0, 2.15, this.ox, this.oy);
          const sw2_3 = isoToScreen(0.26, 38.5, 2.15, this.ox, this.oy);
          this.ctx.fillStyle = 'rgba(224, 242, 254, 0.5)';
          this.ctx.beginPath();
          this.ctx.moveTo(sw2_0.x, sw2_0.y); this.ctx.lineTo(sw2_1.x, sw2_1.y); this.ctx.lineTo(sw2_2.x, sw2_2.y); this.ctx.lineTo(sw2_3.x, sw2_3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#0284c7';
          this.ctx.lineWidth = 1.2;
          this.ctx.stroke();
        }
      });

      // Classroom North Partition Wall & Integrated Blackboard (facing South towards students)
      list.push({
        xMin: 0, xMax: SCHOOL_MAX_X + 1,
        yMin: SCHOOL_MIN_Y - 0.1, yMax: SCHOOL_MIN_Y + 0.35,
        draw: () => {
          this.models.drawBox(this.ctx, 0, SCHOOL_MIN_Y, 0, (SCHOOL_MAX_X + 1), 0.25, H, wallT, wallL, null, this.ox, this.oy, wallR);
          this.models.drawSchoolBlackboard(this.ctx, 2.4, SCHOOL_MIN_Y + 0.12, this.ox, this.oy, 5.2);
        }
      });

      // Classroom East Entrance Wall & Doorway (along x = 10, y: 33 to 43)
      const schoolSE_X = SCHOOL_MAX_X + 1;
      list.push({
        xMin: schoolSE_X - 0.15, xMax: schoolSE_X + 0.35,
        yMin: SCHOOL_MIN_Y, yMax: 36.5,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaSchool < 0.99) this.ctx.globalAlpha = this.wallAlphaSchool;
          this.models.drawBox(this.ctx, schoolSE_X, SCHOOL_MIN_Y, 0, 0.25, 36.5 - SCHOOL_MIN_Y, H, wallT, wallL, wallR, this.ox, this.oy);
          this.ctx.restore();
        }
      });
      list.push({
        xMin: schoolSE_X - 0.15, xMax: schoolSE_X + 0.35,
        yMin: 38.8, yMax: SCHOOL_MAX_Y + 1.25,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaSchool < 0.99) this.ctx.globalAlpha = this.wallAlphaSchool;
          this.models.drawBox(this.ctx, schoolSE_X, 38.8, 0, 0.25, (SCHOOL_MAX_Y + 1.25) - 38.8, H, wallT, wallL, wallR, this.ox, this.oy);
          this.ctx.restore();
        }
      });

      // Classroom Interactive Double Doors
      const schoolDoorW = 1.15;
      list.push({
        xMin: schoolSE_X - 0.25,
        xMax: schoolSE_X + 1.35,
        yMin: 36.4,
        yMax: 38.9,
        draw: () => {
          const schoolDoorAngle = this.doorSchoolOpen * 1.35;
          const sdnTipX = schoolSE_X + Math.sin(schoolDoorAngle) * schoolDoorW;
          const sdnTipY = 36.5 + Math.cos(schoolDoorAngle) * schoolDoorW;
          const sdsTipX = schoolSE_X + Math.sin(schoolDoorAngle) * schoolDoorW;
          const sdsTipY = 38.8 - Math.cos(schoolDoorAngle) * schoolDoorW;
          this.ctx.save();
          if (this.wallAlphaSchool < 0.99) this.ctx.globalAlpha = this.wallAlphaSchool;
          this.drawDoorLeaf(schoolSE_X, 36.5, sdnTipX, sdnTipY, this.ox, this.oy);
          this.drawDoorLeaf(schoolSE_X, 38.8, sdsTipX, sdsTipY, this.ox, this.oy);
          this.ctx.restore();
        }
      });

      // Lintel beam & Mounted Entrance Plaque over classroom door
      list.push({
        xMin: schoolSE_X - 0.25, xMax: schoolSE_X + 1.35,
        yMin: 36.4, yMax: 38.9,
        z: 2.15,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaSchool < 0.99) this.ctx.globalAlpha = this.wallAlphaSchool;
          this.models.drawBox(this.ctx, schoolSE_X, 36.5, 2.15, 0.25, 2.3, H - 2.15, wallT, wallL, wallR, this.ox, this.oy);

          const plq = isoToScreen(schoolSE_X + 0.26, 37.65, 2.48, this.ox, this.oy);
          this.ctx.save();
          this.ctx.translate(plq.x, plq.y);
          this.ctx.transform(1, -0.5, 0, 1, 0, 0);
          this.ctx.fillStyle = '#064e3b'; // Forest pine green
          this.ctx.fillRect(-32, -8, 64, 16);
          this.ctx.strokeStyle = '#f59e0b'; // Gold border
          this.ctx.lineWidth = 1.2;
          this.ctx.strokeRect(-32, -8, 64, 16);
          this.ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
          this.ctx.lineWidth = 0.8;
          this.ctx.strokeRect(-30, -6, 60, 12);
          this.ctx.fillStyle = '#ffffff';
          this.ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('三民高中', 0, 0);
          this.ctx.restore();

          this.ctx.restore();
        }
      });

      // Classroom Interior Props
      // 1. Teacher Podium (Centered right in front of blackboard & middle aisle)
      list.push({
        xMin: 4.3, xMax: 5.6, yMin: 34.3, yMax: 35.3,
        draw: () => this.models.drawTeacherPodium(this.ctx, 4.4, 34.4, this.ox, this.oy)
      });

      // 2. Neatly Arranged Student Desks & Chairs (4 columns x 4 rows = 16 desks with center aisle)
      const sCols = [1.6, 3.2, 5.8, 7.4];
      const sRows = [36.2, 37.8, 39.4, 41.0];
      const bpColors = ['#0284c7', '#ef4444', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4'];
      let dIdx = 0;
      for (const cx of sCols) {
        for (const ry of sRows) {
          const bpColor = bpColors[(dIdx++) % bpColors.length];
          list.push({
            xMin: cx, xMax: cx + 1.25, yMin: ry, yMax: ry + 1.45,
            draw: () => this.models.drawStudentDesk(this.ctx, cx, ry, this.ox, this.oy, { backpackColor: bpColor })
          });
        }
      }

      // 4. Classroom Lockers along South Wall
      list.push({
        xMin: 1.5, xMax: 4.0, yMin: 41.8, yMax: 42.5,
        draw: () => this.models.drawClassroomLockers(this.ctx, 1.5, 41.8, this.ox, this.oy)
      });

      // 5. Classroom Cork Bulletin Board
      list.push({
        xMin: 4.8, xMax: 7.2, yMin: 42.0, yMax: 42.5,
        draw: () => this.models.drawClassroomBulletinBoard(this.ctx, 4.8, 42.2, this.ox, this.oy)
      });

      // 6. Classroom South Exterior Wall with Retro Corridor Windows (along y = SCHOOL_MAX_Y + 1 = 43, x: 0 to 10)
      const schoolSouthY = SCHOOL_MAX_Y + 1.0;
      list.push({
        xMin: -0.1, xMax: SCHOOL_MAX_X + 1.1,
        yMin: schoolSouthY - 0.15, yMax: schoolSouthY + 0.35,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaSchool < 0.99) this.ctx.globalAlpha = this.wallAlphaSchool;
          const isNight = (this.currentTimeState === 'night' || this.currentTimeState === 'galaxy');
          const wLen = SCHOOL_MAX_X + 1; // 10.0

          // Lower Wainscot Wall (z: 0 to 0.90) - retro classroom wainscot
          this.models.drawBox(this.ctx, 0, schoolSouthY, 0, wLen, 0.25, 0.90, '#d1d5db', '#9ca3af', '#6b7280', this.ox, this.oy);
          // Upper Lintel Wall (z: 2.15 to H)
          this.models.drawBox(this.ctx, 0, schoolSouthY, 2.15, wLen, 0.25, H - 2.15, wallT, wallL, wallR, this.ox, this.oy);
          // Concrete Pillars: Left (0..0.35), Center (4.85..5.15), Right (9.65..10.0 flush with East wall)
          this.models.drawBox(this.ctx, 0, schoolSouthY, 0.90, 0.35, 0.25, 1.25, wallT, wallL, wallR, this.ox, this.oy);
          this.models.drawBox(this.ctx, 4.85, schoolSouthY, 0.90, 0.30, 0.25, 1.25, wallT, wallL, wallR, this.ox, this.oy);
          this.models.drawBox(this.ctx, 9.65, schoolSouthY, 0.90, 0.35, 0.25, 1.25, wallT, wallL, wallR, this.ox, this.oy);

          // Corridor Windows with Retro Green Frames (Bay 1: 0.35 to 4.85, Bay 2: 5.15 to 9.65)
          [ { x0: 0.35, x1: 4.85 }, { x0: 5.15, x1: 9.65 } ].forEach(bay => {
            const p0 = isoToScreen(bay.x0, schoolSouthY + 0.12, 0.90, this.ox, this.oy);
            const p1 = isoToScreen(bay.x1, schoolSouthY + 0.12, 0.90, this.ox, this.oy);
            const p2 = isoToScreen(bay.x1, schoolSouthY + 0.12, 2.15, this.ox, this.oy);
            const p3 = isoToScreen(bay.x0, schoolSouthY + 0.12, 2.15, this.ox, this.oy);
            this.ctx.fillStyle = isNight ? 'rgba(254, 240, 138, 0.20)' : 'rgba(209, 250, 229, 0.32)';
            this.ctx.beginPath();
            this.ctx.moveTo(p0.x, p0.y); this.ctx.lineTo(p1.x, p1.y); this.ctx.lineTo(p2.x, p2.y); this.ctx.lineTo(p3.x, p3.y);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.strokeStyle = '#10b981'; // Nostalgic Sanmin green
            this.ctx.lineWidth = 1.3;
            this.ctx.stroke();

            // Multi-pane classroom window grid (horizontal transom + 2 vertical mullions)
            const midY_Z = (0.90 + 2.15) / 2;
            const h0 = isoToScreen(bay.x0, schoolSouthY + 0.12, midY_Z, this.ox, this.oy);
            const h1 = isoToScreen(bay.x1, schoolSouthY + 0.12, midY_Z, this.ox, this.oy);
            this.ctx.lineWidth = 0.9;
            this.ctx.beginPath();
            this.ctx.moveTo(h0.x, h0.y); this.ctx.lineTo(h1.x, h1.y);
            this.ctx.stroke();

            const stepX = (bay.x1 - bay.x0) / 3;
            for (let i = 1; i <= 2; i++) {
              const mx = bay.x0 + stepX * i;
              const v0 = isoToScreen(mx, schoolSouthY + 0.12, 0.90, this.ox, this.oy);
              const v1 = isoToScreen(mx, schoolSouthY + 0.12, 2.15, this.ox, this.oy);
              this.ctx.beginPath();
              this.ctx.moveTo(v0.x, v0.y); this.ctx.lineTo(v1.x, v1.y);
              this.ctx.stroke();
            }
          });

          this.ctx.restore();
        }
      });

      // === 6. ZONE 6: DOUYIN / TIKTOK TECH OFFICE (ROW 3 EAST, x: 18..27, y: 33..42) ===
      // Office North Partition Wall with Clerestory Glass (along y = 33, x: 18 to 28)
      list.push({
        xMin: DOUYIN_MIN_X - 0.15, xMax: DOUYIN_MAX_X + 1.0,
        yMin: DOUYIN_MIN_Y - 0.15, yMax: DOUYIN_MIN_Y + 0.35,
        draw: () => {
          this.models.drawBox(this.ctx, DOUYIN_MIN_X, DOUYIN_MIN_Y, 0, (DOUYIN_MAX_X + 1) - DOUYIN_MIN_X, 0.25, H, wallT, wallL, wallR, this.ox, this.oy, wallR);

          // Sleek Cyan/Magenta Frosted Clerestory Glass Windows
          const dw1_0 = isoToScreen(20.0, DOUYIN_MIN_Y - 0.01, 1.25, this.ox, this.oy);
          const dw1_1 = isoToScreen(23.0, DOUYIN_MIN_Y - 0.01, 1.25, this.ox, this.oy);
          const dw1_2 = isoToScreen(23.0, DOUYIN_MIN_Y - 0.01, 2.15, this.ox, this.oy);
          const dw1_3 = isoToScreen(20.0, DOUYIN_MIN_Y - 0.01, 2.15, this.ox, this.oy);
          this.ctx.fillStyle = 'rgba(37, 244, 238, 0.35)';
          this.ctx.beginPath();
          this.ctx.moveTo(dw1_0.x, dw1_0.y); this.ctx.lineTo(dw1_1.x, dw1_1.y); this.ctx.lineTo(dw1_2.x, dw1_2.y); this.ctx.lineTo(dw1_3.x, dw1_3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#25f4ee';
          this.ctx.lineWidth = 1.2;
          this.ctx.stroke();

          const dw2_0 = isoToScreen(24.0, DOUYIN_MIN_Y - 0.01, 1.25, this.ox, this.oy);
          const dw2_1 = isoToScreen(27.0, DOUYIN_MIN_Y - 0.01, 1.25, this.ox, this.oy);
          const dw2_2 = isoToScreen(27.0, DOUYIN_MIN_Y - 0.01, 2.15, this.ox, this.oy);
          const dw2_3 = isoToScreen(24.0, DOUYIN_MIN_Y - 0.01, 2.15, this.ox, this.oy);
          this.ctx.fillStyle = 'rgba(254, 44, 85, 0.35)';
          this.ctx.beginPath();
          this.ctx.moveTo(dw2_0.x, dw2_0.y); this.ctx.lineTo(dw2_1.x, dw2_1.y); this.ctx.lineTo(dw2_2.x, dw2_2.y); this.ctx.lineTo(dw2_3.x, dw2_3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#fe2c55';
          this.ctx.lineWidth = 1.2;
          this.ctx.stroke();
        }
      });

      // Douyin Office Interior Feature Brand Wall Sign (Mounted on interior North partition wall, facing South towards camera!)
      list.push({
        xMin: 21.0, xMax: 24.6, yMin: DOUYIN_MIN_Y + 0.15, yMax: DOUYIN_MIN_Y + 0.35,
        draw: () => {
          this.models.drawInteriorBrandSign(this.ctx, 22.8, DOUYIN_MIN_Y + 0.26, 2.45, 'douyin', this.ox, this.oy);
        }
      });

      // Office SE Exterior Wall with Panoramic Windows (along x = 28, y: 33 to 43)
      list.push({
        xMin: DOUYIN_MAX_X + 0.85, xMax: DOUYIN_MAX_X + 1.35,
        yMin: DOUYIN_MIN_Y, yMax: DOUYIN_MAX_Y + 1,
        draw: () => {
          this.models.drawBox(this.ctx, DOUYIN_MAX_X + 1, DOUYIN_MIN_Y, 0, 0.25, (DOUYIN_MAX_Y + 1) - DOUYIN_MIN_Y, H, wallT, wallL, wallR, this.ox, this.oy);
        }
      });

      // Office NW Entrance Wall & High-Tech Sliding Doors (along x = 18, y: 33 to 43)
      const douyinNW_X = DOUYIN_MIN_X;
      list.push({
        xMin: douyinNW_X - 0.15, xMax: douyinNW_X + 0.35,
        yMin: DOUYIN_MIN_Y, yMax: 36.5,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaDouyin < 0.99) this.ctx.globalAlpha = this.wallAlphaDouyin;
          this.models.drawBox(this.ctx, douyinNW_X, DOUYIN_MIN_Y, 0, 0.25, 36.5 - DOUYIN_MIN_Y, H, wallT, wallL, wallR, this.ox, this.oy);
          this.ctx.restore();
        }
      });
      list.push({
        xMin: douyinNW_X - 0.15, xMax: douyinNW_X + 0.35,
        yMin: 38.8, yMax: DOUYIN_MAX_Y + 1,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaDouyin < 0.99) this.ctx.globalAlpha = this.wallAlphaDouyin;
          this.models.drawBox(this.ctx, douyinNW_X, 38.8, 0, 0.25, (DOUYIN_MAX_Y + 1) - 38.8, H, wallT, wallL, wallR, this.ox, this.oy);
          this.ctx.restore();
        }
      });

      // Office Lintel Beam over door (z: 2.15 to H)
      list.push({
        xMin: douyinNW_X - 0.25, xMax: douyinNW_X + 0.85,
        yMin: 36.4, yMax: 38.9,
        z: 2.15,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaDouyin < 0.99) this.ctx.globalAlpha = this.wallAlphaDouyin;
          this.models.drawBox(this.ctx, douyinNW_X, 36.5, 2.15, 0.25, 2.3, H - 2.15, wallT, wallL, wallR, this.ox, this.oy);
          this.ctx.restore();
        }
      });

      // Douyin Office High-Tech Optical Speed Gate Turnstile (透明速通門閘機)
      list.push({
        xMin: douyinNW_X - 0.25, xMax: douyinNW_X + 0.85,
        yMin: 36.4, yMax: 38.9,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaDouyin < 0.99) this.ctx.globalAlpha = this.wallAlphaDouyin;
          this.models.drawDouyinSpeedGate(
            this.ctx,
            douyinNW_X,
            37.65,
            this.douyinGateAnim,
            this.douyinGateOpen >= 0.5,
            this.ox,
            this.oy
          );
          this.ctx.restore();
        }
      });

      // Douyin Office High-Tech Cyber Canopy & Mounted Brand Sign
      list.push({
        xMin: 17.1, xMax: 18.35,
        yMin: 36.5, yMax: 38.95,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaDouyin < 0.99) this.ctx.globalAlpha = this.wallAlphaDouyin;

          // 1. High-Tech Floating Glass Canopy (Extending outward over the entrance door)
          this.models.drawBox(this.ctx, 17.2, 36.5, 2.20, 0.85, 2.30, 0.15, '#0f172a', '#25f4ee', '#1e293b', this.ox, this.oy);

          // 2. Cyan / Magenta Edge Illumination on Canopy Underside
          const ug0 = isoToScreen(17.2, 36.5, 2.20, this.ox, this.oy);
          const ug1 = isoToScreen(18.0, 36.5, 2.20, this.ox, this.oy);
          const ug2 = isoToScreen(18.0, 38.8, 2.20, this.ox, this.oy);
          const ug3 = isoToScreen(17.2, 38.8, 2.20, this.ox, this.oy);
          this.ctx.fillStyle = 'rgba(37, 244, 238, 0.20)';
          this.ctx.beginPath();
          this.ctx.moveTo(ug0.x, ug0.y); this.ctx.lineTo(ug1.x, ug1.y); this.ctx.lineTo(ug2.x, ug2.y); this.ctx.lineTo(ug3.x, ug3.y);
          this.ctx.closePath();
          this.ctx.fill();

          // 3. Brand Sign mounted on entrance doorway
          const plq = isoToScreen(18.26, 37.65, 2.48, this.ox, this.oy);
          this.ctx.save();
          this.ctx.translate(plq.x, plq.y);
          this.ctx.transform(1, -0.5, 0, 1, 0, 0);
          this.ctx.fillStyle = '#020617';
          this.ctx.fillRect(-40, -9, 80, 18);
          this.ctx.strokeStyle = '#25f4ee';
          this.ctx.lineWidth = 1.2;
          this.ctx.strokeRect(-40, -9, 80, 18);
          this.ctx.strokeStyle = '#fe2c55';
          this.ctx.lineWidth = 0.8;
          this.ctx.strokeRect(-38, -7, 76, 14);
          this.ctx.fillStyle = '#ffffff';
          this.ctx.font = 'bold 8px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('🎵 TikTok RecSys', 0, -3.5);
          this.ctx.fillStyle = '#25f4ee';
          this.ctx.font = 'bold 6.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
          this.ctx.fillText('TikTok 推薦團隊', 0, 4.5);
          this.ctx.restore();

          this.ctx.restore();
        }
      });

      // Douyin Office Campus Landmark Monument Totem (Standing proudly on open entrance lawn facing courtyard)
      list.push({
        xMin: 15.3, xMax: 16.2,
        yMin: 37.8, yMax: 38.5,
        draw: () => this.models.drawEntranceTotem(this.ctx, 15.5, 38.0, 'douyin', this.ox, this.oy)
      });


      // Douyin Office Props: 6 Modern Developer Workstations with Ultrawide Displays & Aeron Chairs
      // North Pod
      list.push({
        xMin: 19.2, xMax: 21.4, yMin: 34.4, yMax: 35.8,
        draw: () => this.models.drawOfficeWorkstation(this.ctx, 19.2, 34.4, this.ox, this.oy)
      });
      list.push({
        xMin: 22.2, xMax: 24.4, yMin: 34.4, yMax: 35.8,
        draw: () => this.models.drawOfficeWorkstation(this.ctx, 22.2, 34.4, this.ox, this.oy, { isStanding: true })
      });
      list.push({
        xMin: 25.2, xMax: 27.4, yMin: 34.4, yMax: 35.8,
        draw: () => this.models.drawOfficeWorkstation(this.ctx, 25.2, 34.4, this.ox, this.oy)
      });
      // South Pod
      list.push({
        xMin: 19.2, xMax: 21.4, yMin: 40.2, yMax: 41.6,
        draw: () => this.models.drawOfficeWorkstation(this.ctx, 19.2, 40.2, this.ox, this.oy)
      });
      list.push({
        xMin: 22.2, xMax: 24.4, yMin: 40.2, yMax: 41.6,
        draw: () => this.models.drawOfficeWorkstation(this.ctx, 22.2, 40.2, this.ox, this.oy)
      });
      list.push({
        xMin: 25.2, xMax: 27.4, yMin: 40.2, yMax: 41.6,
        draw: () => this.models.drawOfficeWorkstation(this.ctx, 25.2, 40.2, this.ox, this.oy, { isStanding: true })
      });

      // Glass Conference & Brainstorming Table
      list.push({
        xMin: 24.5, xMax: 27.2, yMin: 36.8, yMax: 38.3,
        draw: () => this.models.drawOfficeMeetingTable(this.ctx, 24.5, 36.8, this.ox, this.oy)
      });

      // AI Compute Cluster / Server Rig
      list.push({
        xMin: 26.2, xMax: 27.4, yMin: 33.6, yMax: 35.0,
        draw: () => this.models.drawOfficeServerStation(this.ctx, 26.2, 33.6, this.ox, this.oy)
      });

      // Office Tech Coffee & Refreshment Bar
      list.push({
        xMin: 26.4, xMax: 27.8, yMin: 38.5, yMax: 39.2,
        draw: () => this.models.drawOfficeCoffeeBar(this.ctx, 26.4, 38.5, this.ox, this.oy)
      });

      // Douyin Office South Panoramic Glass Curtain Wall (along y = DOUYIN_MAX_Y + 1 = 43, x: 18 to 28)
      const douyinSouthY = DOUYIN_MAX_Y + 1.0;
      list.push({
        xMin: DOUYIN_MIN_X - 0.1, xMax: DOUYIN_MAX_X + 1.1,
        yMin: douyinSouthY - 0.15, yMax: douyinSouthY + 0.35,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaDouyin < 0.99) this.ctx.globalAlpha = this.wallAlphaDouyin;
          const isNight = (this.currentTimeState === 'night' || this.currentTimeState === 'galaxy');
          const wLen = (DOUYIN_MAX_X + 1) - DOUYIN_MIN_X; // 10.0

          // Matte Black Carbon Base (z: 0 to 0.40)
          this.models.drawBox(this.ctx, DOUYIN_MIN_X, douyinSouthY, 0, wLen, 0.25, 0.40, '#18181b', '#09090b', '#040405', this.ox, this.oy);
          // Matte Black Structural Top Slab (z: 2.30 to H)
          this.models.drawBox(this.ctx, DOUYIN_MIN_X, douyinSouthY, 2.30, wLen, 0.25, H - 2.30, '#18181b', '#09090b', '#040405', this.ox, this.oy);
          // Dark Steel Edge Pillars: Left (18.0..18.7), Center (22.65..23.35), Right (27.3..28.0)
          this.models.drawBox(this.ctx, 18.0, douyinSouthY, 0.40, 0.7, 0.25, 1.90, '#27272a', '#18181b', '#09090b', this.ox, this.oy);
          this.models.drawBox(this.ctx, 22.65, douyinSouthY, 0.40, 0.7, 0.25, 1.90, '#27272a', '#18181b', '#09090b', this.ox, this.oy);
          this.models.drawBox(this.ctx, 27.3, douyinSouthY, 0.40, 0.7, 0.25, 1.90, '#27272a', '#18181b', '#09090b', this.ox, this.oy);

          // Panoramic Glass Curtain Wall with Douyin Brand Tint (Bay 1: 18.7..22.65, Bay 2: 23.35..27.3)
          [ { x0: 18.7, x1: 22.65 }, { x0: 23.35, x1: 27.3 } ].forEach(bay => {
            const p0 = isoToScreen(bay.x0, douyinSouthY + 0.12, 0.40, this.ox, this.oy);
            const p1 = isoToScreen(bay.x1, douyinSouthY + 0.12, 0.40, this.ox, this.oy);
            const p2 = isoToScreen(bay.x1, douyinSouthY + 0.12, 2.30, this.ox, this.oy);
            const p3 = isoToScreen(bay.x0, douyinSouthY + 0.12, 2.30, this.ox, this.oy);
            this.ctx.fillStyle = isNight ? 'rgba(37, 244, 238, 0.18)' : 'rgba(224, 242, 254, 0.32)';
            this.ctx.beginPath();
            this.ctx.moveTo(p0.x, p0.y); this.ctx.lineTo(p1.x, p1.y); this.ctx.lineTo(p2.x, p2.y); this.ctx.lineTo(p3.x, p3.y);
            this.ctx.closePath();
            this.ctx.fill();

            // Douyin Cyber Glow Edges (Cyan #25f4ee)
            this.ctx.strokeStyle = '#25f4ee';
            this.ctx.lineWidth = 1.2;
            this.ctx.stroke();

            // Modern floor-to-ceiling glass panel seams (2 vertical seams per bay)
            const stepX = (bay.x1 - bay.x0) / 3;
            for (let i = 1; i <= 2; i++) {
              const mx = bay.x0 + stepX * i;
              const s0 = isoToScreen(mx, douyinSouthY + 0.12, 0.40, this.ox, this.oy);
              const s1 = isoToScreen(mx, douyinSouthY + 0.12, 2.30, this.ox, this.oy);
              this.ctx.lineWidth = 0.8;
              this.ctx.strokeStyle = '#3f3f46';
              this.ctx.beginPath();
              this.ctx.moveTo(s0.x, s0.y); this.ctx.lineTo(s1.x, s1.y);
              this.ctx.stroke();
            }
          });

          this.ctx.restore();
        }
      });

      // === 7. CENTRAL COURTYARD & SOUTH AVENUE: BENCHES, FOUNTAIN & TREES ===
      // Fountain
      list.push({
        xMin: 13.0, xMax: 16.0, yMin: 13.0, yMax: 16.0,
        draw: () => this.models.drawGrandFountain(this.ctx, 13.0, 13.0, this.ox, this.oy)
      });

      // Refined Park Benches (Placed on grass, completely clear of all pathways)
      const benches = [
        { gx: 10.8, gy: 12.0, furnitureId: 'bench_boulevard_north' }, // Central Plaza North Edge Bench
        { gx: 18.2, gy: 12.0, furnitureId: 'bench_central_east' },     // East Avenue West Bench (Plaza side)
        { gx: 25.2, gy: 12.0, furnitureId: 'bench_east_lawn' },         // East Avenue East Bench (Court & Cafe side)
        { gx: 1.8,  gy: 11.8, furnitureId: 'xiangqi_bench' },          // Beside Garden Chinese Chess Table (Lawn, clear of doorway)
        { gx: 11.0, gy: 43.0, furnitureId: 'bench_south_avenue' }      // South Avenue North Edge Bench
      ];
      benches.forEach(b => {
        list.push({
          furnitureId: b.furnitureId,
          xMin: b.gx, xMax: b.gx + 1.6, yMin: b.gy, yMax: b.gy + 0.65,
          draw: () => this.models.drawParkBench(this.ctx, b.gx, b.gy, this.ox, this.oy)
        });
      });

      // Garden Stone Chinese Chess Table & Drum Stools (Ludwig's South Lawn Terrace)
      list.push({
        xMin: 2.4, xMax: 4.5, yMin: 13.5, yMax: 15.6,
        draw: () => this.models.drawGardenChessTable(this.ctx, 2.6, 13.8, this.ox, this.oy)
      });

      // Lush Flowering Trees (Beautifying gardens and park lawns, placed 100% strictly on true grass)
      const trees = [
        // 1. Ludwig's House South Lawn Terrace Garden (x: 0..9, y: 10..16)
        [1.5, 11.5],
        [7.5, 15.0],

        // 2. West Campus Greenway & Park (x: 0..9, y: 27..32 — between Dorm 211 and Sanmin High)
        [1.8, 27.8],
        [7.5, 27.8],
        [1.8, 31.5],
        [7.5, 31.5],

        // 3. East Promenade Lawn Buffer (x: 28..30, y: 0..9 — east of AI Studio)
        [28.5, 3.5],
        [28.5, 7.5],

        // 4. East Park Corridor (x: 28..40, y: 17..26 — vast peaceful park between Library and Basketball Court)
        [28.5, 20.0],
        [28.5, 24.5],
        [34.0, 24.5],

        // 5. Campus Grand Central Park (x: 33..46, y: 8..16 — between Cafe and Basketball Court)
        [34.5, 10.5],
        [41.5, 10.5],
        [45.5, 13.5],

        // 6. South Lawn Buffer (x: 41..52, y: 27..32 — south of Basketball Court)
        [43.5, 29.0],
        [48.5, 29.5]
      ];
      trees.forEach(([tx, ty]) => {
        list.push({
          xMin: tx, xMax: tx + 1.0, yMin: ty, yMax: ty + 1.0,
          draw: () => this.models.drawTree(this.ctx, tx, ty, this.ox, this.oy)
        });
      });

      // === 8. WEST CAMPUS GREENWAY & LAWN PARK (x: 0..9, y: 27..32 — between Dorm 211 and Sanmin High) ===
      list.push({
        furnitureId: 'bench_west_greenway',
        xMin: 4.5, xMax: 6.1, yMin: 29.0, yMax: 29.65,
        draw: () => this.models.drawParkBench(this.ctx, 4.5, 29.0, this.ox, this.oy)
      });

      // === 9. CENTRAL MIDNIGHT SNACK STREET (中央宵夜街 x: 32..38, y: 33..44 — Slender 2.5-tile road) ===
      // Entrance Archway "🏮 中央宵夜街 • NCU MIDNIGHT SNACK STREET 🏮"
      list.push({
        xMin: 31.5, xMax: 34.7, yMin: 33.0, yMax: 33.6,
        draw: () => this.models.drawNightMarketArch(this.ctx, 31.5, 33.0, this.ox, this.oy)
      });

      // Food Stall 1: Authentic NCU Blue Food Truck (經典小貨車改裝炒泡麵餐車)
      list.push({
        xMin: 35.0, xMax: 36.8, yMin: 34.2, yMax: 37.2,
        draw: () => this.models.drawFoodTruck(this.ctx, 35.0, 34.2, this.ox, this.oy)
      });

      // Food Stall 2: Famous 「無敵蛋餅」 with iconic round yellow sign & sizzling griddle
      list.push({
        xMin: 35.0, xMax: 36.6, yMin: 37.8, yMax: 39.8,
        draw: () => this.models.drawEggPancakeStall(this.ctx, 35.0, 37.8, this.ox, this.oy)
      });

      // Food Stall 3: Legendary 「傻師傅湯包」 Storefront Shop Building (實體店面建築)
      list.push({
        xMin: 34.8, xMax: 38.6, yMin: 41.0, yMax: 44.2,
        draw: () => this.models.drawShaShiFuDumplings(this.ctx, 34.8, 41.0, this.ox, this.oy)
      });

      // West Curb: Parked Scooters outside (along x = 31.2)
      list.push({
        xMin: 31.0, xMax: 31.6, yMin: 35.5, yMax: 36.5,
        draw: () => this.models.drawScooter(this.ctx, 31.2, 35.5, '#f8fafc', this.ox, this.oy)
      });
      list.push({
        xMin: 31.0, xMax: 31.6, yMin: 38.5, yMax: 39.5,
        draw: () => this.models.drawScooter(this.ctx, 31.2, 38.5, '#1e3a8a', this.ox, this.oy)
      });

      // Overhead Hanging Street Fairy Lights Strands across narrow NCU Night Market Street
      list.push({
        xMin: 31.5, xMax: 34.8, yMin: 34.0, yMax: 34.2,
        draw: () => this.models.drawFairyLights(this.ctx, 31.5, 34.0, 2.5, 34.8, 34.0, 2.5, this.ox, this.oy)
      });
      list.push({
        xMin: 31.5, xMax: 34.8, yMin: 38.0, yMax: 38.2,
        draw: () => this.models.drawFairyLights(this.ctx, 31.5, 38.0, 2.5, 34.8, 38.0, 2.5, this.ox, this.oy)
      });

      // === 10. SOUTH BOULEVARD STREETLIGHTS & HIGHWAY PORTAL SIGN (y: 42..43) ===
      list.push({
        xMin: 11.2, xMax: 11.6, yMin: 42.4, yMax: 42.8,
        draw: () => this.models.drawStreetlight(this.ctx, 11.2, 42.4, this.ox, this.oy)
      });
      list.push({
        xMin: 17.2, xMax: 17.6, yMin: 42.4, yMax: 42.8,
        draw: () => this.models.drawStreetlight(this.ctx, 17.2, 42.4, this.ox, this.oy)
      });
      list.push({
        xMin: 14.2, xMax: 15.2, yMin: 42.8, yMax: 43.2,
        draw: () => this.models.drawRoadPortalSign(this.ctx, 14.2, 42.8, this.ox, this.oy)
      });

      // === 11. CAMPUS BASKETBALL COURT (East Dedicated Athletic Ground x: 41..52, y: 17..26) ===
      // Basketball Hoop (Positioned at West boundary line facing east towards court)
      list.push({
        xMin: 41.0, xMax: 42.8, yMin: 21.0, yMax: 22.4,
        draw: () => this.models.drawBasketballHoop(this.ctx, 41.2, 21.2, this.ox, this.oy)
      });

      // Metallic Ball Rack with Spalding Basketballs (North sideline)
      list.push({
        xMin: 47.2, xMax: 48.0, yMin: 16.9, yMax: 17.9,
        draw: () => this.models.drawBasketballRack(this.ctx, 47.5, 17.2, this.ox, this.oy)
      });

      // Court Sideline Rest Bench (North sideline, with exact seat center)
      list.push({
        furnitureId: 'basketball_bench',
        xMin: 43.8, xMax: 45.6, yMin: 16.9, yMax: 17.8,
        draw: () => this.models.drawParkBench(this.ctx, 44.0, 17.2, this.ox, this.oy)
      });

      // Protective Sports Boundary Fences (North, East, South)
      list.push({
        xMin: 41.0, xMax: 52.0, yMin: 16.8, yMax: 17.2,
        draw: () => this.models.drawPerimeterHedge(this.ctx, 41.0, 16.9, this.ox, this.oy, 11.0, 0.3)
      });
      list.push({
        xMin: 51.8, xMax: 52.2, yMin: 17.0, yMax: 26.2,
        draw: () => this.models.drawPerimeterHedge(this.ctx, 52.0, 17.0, this.ox, this.oy, 0.3, 9.2)
      });
      list.push({
        xMin: 41.0, xMax: 52.0, yMin: 26.0, yMax: 26.4,
        draw: () => this.models.drawPerimeterHedge(this.ctx, 41.0, 26.1, this.ox, this.oy, 11.0, 0.3)
      });

      // === 12. LUDWIGIA INDOOR SPECIALTY CAFE (Compact Cozy Building x: 33..39, y: 2..7) ===
      // North Wall (y = 2, x: 33 to 39)
      list.push({
        xMin: 32.9, xMax: 39.1, yMin: 1.8, yMax: 2.2,
        draw: () => {
          this.ctx.save();
          this.models.drawBox(this.ctx, 33.0, 2.0, 0, 6.2, 0.25, 2.7, '#78350f', '#58240a', '#451a03', this.ox, this.oy);
          // Blackboard menu mounted on North Wall (X-axis transversal shear)
          this.models.drawCafeMenuBoard(this.ctx, 35.5, 2.15, this.ox, this.oy);
          this.ctx.restore();
        }
      });

      // East Wall (x = 39, y: 2 to 7)
      list.push({
        xMin: 38.9, xMax: 39.3, yMin: 2.0, yMax: 7.1,
        draw: () => {
          this.ctx.save();
          this.models.drawBox(this.ctx, 39.0, 2.0, 0, 0.25, 5.0, 2.7, '#58240a', '#451a03', '#291006', this.ox, this.oy);
          this.ctx.restore();
        }
      });

      // South Wall with Floor-to-Ceiling Panoramic Glass Window (y = 7, x: 33 to 39)
      list.push({
        xMin: 32.9, xMax: 39.1, yMin: 6.8, yMax: 7.3,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaCafe < 0.99) this.ctx.globalAlpha = this.wallAlphaCafe;
          // Timber Frame Base & Top
          this.models.drawBox(this.ctx, 33.0, 7.0, 0, 6.2, 0.25, 0.55, '#78350f', '#58240a', '#451a03', this.ox, this.oy);
          this.models.drawBox(this.ctx, 33.0, 7.0, 2.45, 6.2, 0.25, 0.25, '#78350f', '#58240a', '#451a03', this.ox, this.oy);

          // Floor-to-Ceiling Glass Window Panels (x: 33.5 to 38.5, z: 0.55 to 2.45)
          const g0 = isoToScreen(33.5, 7.12, 0.55, this.ox, this.oy);
          const g1 = isoToScreen(38.5, 7.12, 0.55, this.ox, this.oy);
          const g2 = isoToScreen(38.5, 7.12, 2.45, this.ox, this.oy);
          const g3 = isoToScreen(33.5, 7.12, 2.45, this.ox, this.oy);
          this.ctx.fillStyle = 'rgba(224, 242, 254, 0.35)';
          this.ctx.beginPath();
          this.ctx.moveTo(g0.x, g0.y); this.ctx.lineTo(g1.x, g1.y); this.ctx.lineTo(g2.x, g2.y); this.ctx.lineTo(g3.x, g3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#b45309';
          this.ctx.lineWidth = 1.2;
          this.ctx.stroke();

          // Mullion divider lines
          [35.2, 36.8].forEach(mx => {
            const m0 = isoToScreen(mx, 7.12, 0.55, this.ox, this.oy);
            const m1 = isoToScreen(mx, 7.12, 2.45, this.ox, this.oy);
            this.ctx.beginPath();
            this.ctx.moveTo(m0.x, m0.y); this.ctx.lineTo(m1.x, m1.y);
            this.ctx.stroke();
          });
          this.ctx.restore();
        }
      });

      // West Facade Wall (x = 33, y: 2 to 7) with Entrance Doorway at y: 4.2 to 5.6
      // West Wall Top Segment (y: 2.0 to 4.2)
      list.push({
        xMin: 32.8, xMax: 33.3, yMin: 2.0, yMax: 4.2,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaCafe < 0.99) this.ctx.globalAlpha = this.wallAlphaCafe;
          this.models.drawBox(this.ctx, 33.0, 2.0, 0, 0.25, 2.2, 2.7, '#78350f', '#58240a', '#451a03', this.ox, this.oy);
          this.ctx.restore();
        }
      });
      // West Wall Bottom Segment (y: 5.6 to 7.0)
      list.push({
        xMin: 32.8, xMax: 33.3, yMin: 5.6, yMax: 7.1,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaCafe < 0.99) this.ctx.globalAlpha = this.wallAlphaCafe;
          this.models.drawBox(this.ctx, 33.0, 5.6, 0, 0.25, 1.4, 2.7, '#78350f', '#58240a', '#451a03', this.ox, this.oy);
          this.ctx.restore();
        }
      });
      // West Entrance Doorway Lintel Beam & Mounted Signboard
      list.push({
        xMin: 32.8, xMax: 33.4, yMin: 4.1, yMax: 5.7,
        z: 2.25,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaCafe < 0.99) this.ctx.globalAlpha = this.wallAlphaCafe;
          this.models.drawBox(this.ctx, 33.0, 4.2, 2.25, 0.25, 1.4, 0.45, '#78350f', '#58240a', '#451a03', this.ox, this.oy);

          // Illuminated Entrance Plaque (Sheared on Y-axis longitudinal wall)
          const plq = isoToScreen(32.95, 4.9, 2.45, this.ox, this.oy);
          this.ctx.save();
          this.ctx.translate(plq.x, plq.y);
          this.ctx.transform(1, -0.5, 0, 1, 0, 0);
          const W = 88;
          const H = 18;
          this.ctx.fillStyle = '#451a03';
          this.ctx.fillRect(-W / 2, -H / 2, W, H);
          this.ctx.strokeStyle = '#d97706';
          this.ctx.lineWidth = 1.4;
          this.ctx.strokeRect(-W / 2, -H / 2, W, H);
          this.ctx.fillStyle = '#fef3c7';
          this.ctx.font = 'bold 8px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('☕ LUDWIGIA CAFE', 0, 0);
          this.ctx.restore();

          this.ctx.restore();
        }
      });

      // Interior Barista Bar & Commercial Espresso Machine
      list.push({
        xMin: 36.2, xMax: 38.8, yMin: 2.6, yMax: 3.8,
        draw: () => this.models.drawCafeBarCounter(this.ctx, 36.5, 2.8, this.ox, this.oy)
      });

      // Interior Lounge Table & Leather Armchairs
      list.push({
        furnitureId: 'cafe_chair',
        xMin: 34.0, xMax: 35.8, yMin: 3.8, yMax: 5.2,
        draw: () => this.models.drawCafeLoungeTable(this.ctx, 34.5, 4.2, this.ox, this.oy)
      });

      // Tall Indoor Potted Monstera Plant
      list.push({
        xMin: 37.8, xMax: 38.7, yMin: 2.1, yMax: 2.9,
        draw: () => this.models.drawCafeIndoorPlant(this.ctx, 38.0, 2.3, this.ox, this.oy)
      });

      // Corner Bookshelf
      list.push({
        xMin: 38.0, xMax: 38.8, yMin: 4.4, yMax: 5.8,
        draw: () => this.models.drawCafeBookshelf(this.ctx, 38.2, 4.6, this.ox, this.oy)
      });

      // Suspended Warm Pendant Lamp
      list.push({
        xMin: 34.8, xMax: 35.3, yMin: 4.0, yMax: 4.5,
        draw: () => this.models.drawCafePendantLamp(this.ctx, 35.0, 4.2, 2.2, this.ox, this.oy)
      });


      // === 13. CYBER LAN LOUNGE / 召喚師電競網咖 (West x: 1..11, y: 45..53) ===
      // Neon Marquee Sign at North Entrance
      list.push({
        xMin: 3.5, xMax: 5.5, yMin: 44.5, yMax: 44.9,
        draw: () => this.models.drawCyberCafeSign(this.ctx, 4.0, 44.6, this.ox, this.oy)
      });

      // Blue Team Battle Stations (North Row)
      [2.2, 4.2, 6.2].forEach(rx => {
        list.push({
          xMin: rx, xMax: rx + 1.4, yMin: 46.2, yMax: 47.1,
          draw: () => this.models.drawCyberCafeRig(this.ctx, rx, 46.2, this.ox, this.oy, false)
        });
      });

      // Red Team Battle Stations (South Row)
      [2.2, 4.2, 6.2].forEach(rx => {
        list.push({
          xMin: rx, xMax: rx + 1.4, yMin: 50.2, yMax: 51.1,
          draw: () => this.models.drawCyberCafeRig(this.ctx, rx, 50.2, this.ox, this.oy, true)
        });
      });

      // Ramen & Monster Snack Counter
      list.push({
        xMin: 8.5, xMax: 10.3, yMin: 47.8, yMax: 49.3,
        draw: () => this.models.drawCyberSnackBar(this.ctx, 8.5, 47.8, this.ox, this.oy)
      });

      // === 14. HOWLING ABYSS ARAM BRIDGE / 咆哮深淵長橋 (Grand Suspension Bridge x: 13..41.5, y: 48..53) ===
      // West Gateway Entrance Rune Obelisks
      list.push({
        xMin: 12.8, xMax: 13.6, yMin: 47.2, yMax: 48.0,
        draw: () => this.models.drawAbyssEntranceGateway(this.ctx, 12.8, 47.2, this.ox, this.oy)
      });
      list.push({
        xMin: 12.8, xMax: 13.6, yMin: 52.8, yMax: 53.6,
        draw: () => this.models.drawAbyssEntranceGateway(this.ctx, 12.8, 52.8, this.ox, this.oy)
      });

      // North Balustrade Railing Segments
      const northRailingIntervals = [
        { gx: 13.6, len: 1.4 },
        { gx: 16.3, len: 1.2 },
        { gx: 18.2, len: 3.8 },
        { gx: 23.3, len: 1.2 },
        { gx: 27.2, len: 3.3 },
        { gx: 31.8, len: 3.2 },
        { gx: 35.7, len: 2.3 },
        { gx: 39.3, len: 1.9 }
      ];
      northRailingIntervals.forEach(r => {
        list.push({
          xMin: r.gx, xMax: r.gx + r.len, yMin: 47.3, yMax: 47.7,
          draw: () => this.models.drawAbyssParapetSegment(this.ctx, r.gx, 47.3, r.len, 0.40, this.ox, this.oy)
        });
      });

      // South Balustrade Railing Segments
      const southRailingIntervals = [
        { gx: 13.6, len: 1.9 },
        { gx: 16.2, len: 2.3 },
        { gx: 19.8, len: 1.7 },
        { gx: 22.8, len: 1.7 },
        { gx: 25.2, len: 2.3 },
        { gx: 28.8, len: 2.7 },
        { gx: 32.2, len: 1.3 },
        { gx: 34.2, len: 2.3 },
        { gx: 37.8, len: 3.4 }
      ];
      southRailingIntervals.forEach(r => {
        list.push({
          xMin: r.gx, xMax: r.gx + r.len, yMin: 53.3, yMax: 53.7,
          draw: () => this.models.drawAbyssParapetSegment(this.ctx, r.gx, 53.3, r.len, 0.40, this.ox, this.oy)
        });
      });

      // East Bridge Terminus Railing
      list.push({
        xMin: 41.2, xMax: 41.6, yMin: 47.5, yMax: 53.5,
        draw: () => this.models.drawAbyssParapetSegment(this.ctx, 41.2, 47.5, 0.40, 6.00, this.ox, this.oy)
      });

      // Broken Railing Gaps with Dangling Chains
      list.push({
        xMin: 24.5, xMax: 26.1, yMin: 47.2, yMax: 47.7,
        draw: () => this.models.drawAbyssBrokenRailing(this.ctx, 24.5, 47.3, this.ox, this.oy, true)
      });
      list.push({
        xMin: 21.5, xMax: 22.8, yMin: 53.2, yMax: 53.7,
        draw: () => this.models.drawAbyssBrokenRailing(this.ctx, 21.5, 53.3, this.ox, this.oy, false)
      });

      // Glowing Fire Braziers on Parapets (Flickering Orange Flame on Frost Stone)
      const braziers = [
        { gx: 17.5, gy: 47.3 },
        { gx: 26.5, gy: 47.3 },
        { gx: 35.0, gy: 47.3 },
        { gx: 15.5, gy: 53.3 },
        { gx: 24.5, gy: 53.3 },
        { gx: 33.5, gy: 53.3 }
      ];
      braziers.forEach(b => {
        list.push({
          xMin: b.gx, xMax: b.gx + 0.65, yMin: b.gy, yMax: b.gy + 0.65,
          draw: () => this.models.drawAbyssBrazier(this.ctx, b.gx, b.gy, this.ox, this.oy)
        });
      });

      // Giant Horned Freljordian Guardian Statues (holding heavy suspension chains over the abyss!)
      const statues = [
        { gx: 15.0, gy: 46.8, isNorth: true },
        { gx: 22.0, gy: 46.8, isNorth: true },
        { gx: 30.5, gy: 46.8, isNorth: true },
        { gx: 38.0, gy: 46.8, isNorth: true },
        { gx: 18.5, gy: 53.5, isNorth: false },
        { gx: 27.5, gy: 53.5, isNorth: false },
        { gx: 36.5, gy: 53.5, isNorth: false }
      ];
      statues.forEach(s => {
        list.push({
          xMin: s.gx, xMax: s.gx + 1.30, yMin: s.gy, yMax: s.gy + 1.30,
          draw: () => this.models.drawAbyssGuardianStatue(this.ctx, s.gx, s.gy, this.ox, this.oy, s.isNorth)
        });
      });

      // Floating Broken Abyss Chasm Crags & Anchor Chains in the Deep Void
      const chasmPillars = [
        { gx: 20.0, gy: 44.5 },
        { gx: 33.0, gy: 44.2 },
        { gx: 25.0, gy: 55.8 },
        { gx: 35.5, gy: 56.0 }
      ];
      chasmPillars.forEach(cp => {
        list.push({
          xMin: cp.gx, xMax: cp.gx + 1.10, yMin: cp.gy, yMax: cp.gy + 1.10,
          draw: () => this.models.drawAbyssChasmPillar(this.ctx, cp.gx, cp.gy, this.ox, this.oy)
        });
      });

      // Ancient Outer Turret (Frost Obelisk with Floating Laser Gem & Target Ring)
      list.push({
        xMin: 19.2, xMax: 20.8, yMin: 49.8, yMax: 51.4,
        draw: () => this.models.drawAbyssTurret(this.ctx, 19.2, 49.8, this.ox, this.oy)
      });

      // West Emerald Health Relic
      list.push({
        xMin: 23.6, xMax: 24.8, yMin: 51.4, yMax: 52.6,
        draw: () => this.models.drawHealthRelic(this.ctx, 24.0, 51.8, this.ox, this.oy)
      });

      // Mid-Lane Freljord Frost Brush Patches
      list.push({
        xMin: 26.5, xMax: 27.5, yMin: 49.0, yMax: 49.8,
        draw: () => this.models.drawAbyssBrush(this.ctx, 26.8, 49.2, this.ox, this.oy)
      });
      list.push({
        xMin: 27.5, xMax: 28.5, yMin: 49.0, yMax: 49.8,
        draw: () => this.models.drawAbyssBrush(this.ctx, 27.8, 49.2, this.ox, this.oy)
      });

      // Freljordian Inhibitor (Hexagonal Dais & Floating Arcane Core Crystal)
      list.push({
        xMin: 29.5, xMax: 30.9, yMin: 49.8, yMax: 51.2,
        draw: () => this.models.drawAbyssInhibitor(this.ctx, 29.5, 49.8, this.ox, this.oy)
      });

      // East Emerald Health Relic
      list.push({
        xMin: 34.1, xMax: 35.3, yMin: 48.4, yMax: 49.6,
        draw: () => this.models.drawHealthRelic(this.ctx, 34.5, 48.8, this.ox, this.oy)
      });

      // The Grand Nexus Core Platform (Pulsing Nexus Crystal & Rotating Golden Orbital Blades)
      list.push({
        xMin: 37.8, xMax: 40.0, yMin: 49.5, yMax: 51.7,
        draw: () => this.models.drawAbyssNexus(this.ctx, 37.8, 49.5, this.ox, this.oy)
      });

      // Fluffy Snow Poros (Snack / Tongue / Sleep / Hop)
      list.push({
        xMin: 17.2, xMax: 17.8, yMin: 49.2, yMax: 49.8,
        draw: () => this.models.drawPoro(this.ctx, 17.5, 49.5, this.ox, this.oy, 'snack')
      });
      list.push({
        xMin: 23.2, xMax: 23.8, yMin: 50.5, yMax: 51.1,
        draw: () => this.models.drawPoro(this.ctx, 23.5, 50.8, this.ox, this.oy, 'tongue')
      });
      list.push({
        xMin: 27.7, xMax: 28.3, yMin: 51.9, yMax: 52.5,
        draw: () => this.models.drawPoro(this.ctx, 28.0, 52.2, this.ox, this.oy, 'sleep')
      });
      list.push({
        xMin: 32.7, xMax: 33.3, yMin: 49.2, yMax: 49.8,
        draw: () => this.models.drawPoro(this.ctx, 33.0, 49.5, this.ox, this.oy, 'tongue')
      });
      list.push({
        xMin: 36.7, xMax: 37.3, yMin: 51.7, yMax: 52.3,
        draw: () => this.models.drawPoro(this.ctx, 37.0, 52.0, this.ox, this.oy, 'snack')
      });

      // Pre-calculate midpoint bounds for fast O(1) viewport culling
      list.forEach(e => {
        e.midX = (e.xMin + e.xMax) * 0.5;
        e.midY = (e.yMin + e.yMax) * 0.5;
        e.z = e.z || 0;
      });

      return list;
    }

    // Backwards-compatible entity collector
    collectWorldEntities(ox, oy) {
      this.ox = ox;
      this.oy = oy;
      if (!this.staticEntities) {
        this.staticEntities = this.buildStaticWorldEntities();
      }
      const list = [...this.staticEntities];
      this.charManager.characters.forEach(c => {
        list.push({
          isChar: true,
          char: c,
          xMin: c.x - 0.25, xMax: c.x + 0.25,
          yMin: c.y - 0.25, yMax: c.y + 0.25,
          z: c.z || 0,
          furnitureId: c.furniture ? c.furniture.id : null,
          draw: () => this.charManager.drawCharacter(this.ctx, c, ox, oy)
        });
      });
      return list;
    }

    drawDoorLeaf(hx, hy, tx, ty, ox, oy, plaqueText) {
      const H = 2.15;
      const b0 = isoToScreen(hx, hy, 0, ox, oy);
      const b1 = isoToScreen(tx, ty, 0, ox, oy);
      const t1 = isoToScreen(tx, ty, H, ox, oy);
      const t0 = isoToScreen(hx, hy, H, ox, oy);

      // Cedar Door Frame
      this.ctx.fillStyle = '#92400e';
      this.ctx.beginPath();
      this.ctx.moveTo(b0.x, b0.y); this.ctx.lineTo(b1.x, b1.y); this.ctx.lineTo(t1.x, t1.y); this.ctx.lineTo(t0.x, t0.y);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.strokeStyle = '#78350f';
      this.ctx.lineWidth = 2.5;
      this.ctx.stroke();

      // Lower Wood Inset Panel
      const dx = tx - hx;
      const dy = ty - hy;
      const lp0 = isoToScreen(hx + dx * 0.12, hy + dy * 0.12, 0.15, ox, oy);
      const lp1 = isoToScreen(hx + dx * 0.88, hy + dy * 0.88, 0.15, ox, oy);
      const lp2 = isoToScreen(hx + dx * 0.88, hy + dy * 0.88, 0.75, ox, oy);
      const lp3 = isoToScreen(hx + dx * 0.12, hy + dy * 0.12, 0.75, ox, oy);
      this.ctx.fillStyle = '#78350f';
      this.ctx.beginPath();
      this.ctx.moveTo(lp0.x, lp0.y); this.ctx.lineTo(lp1.x, lp1.y); this.ctx.lineTo(lp2.x, lp2.y); this.ctx.lineTo(lp3.x, lp3.y);
      this.ctx.closePath();
      this.ctx.fill();

      // Upper Frosted Glass Pane
      const gp0 = isoToScreen(hx + dx * 0.12, hy + dy * 0.12, 0.88, ox, oy);
      const gp1 = isoToScreen(hx + dx * 0.88, hy + dy * 0.88, 0.88, ox, oy);
      const gp2 = isoToScreen(hx + dx * 0.88, hy + dy * 0.88, 1.95, ox, oy);
      const gp3 = isoToScreen(hx + dx * 0.12, hy + dy * 0.12, 1.95, ox, oy);
      this.ctx.fillStyle = 'rgba(224, 242, 254, 0.45)';
      this.ctx.beginPath();
      this.ctx.moveTo(gp0.x, gp0.y); this.ctx.lineTo(gp1.x, gp1.y); this.ctx.lineTo(gp2.x, gp2.y); this.ctx.lineTo(gp3.x, gp3.y);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.strokeStyle = '#78350f';
      this.ctx.lineWidth = 1.2;
      this.ctx.stroke();

      // Mounted Door Plaque (e.g. 男11 211 on the door itself, dynamically sheared with door slope)
      if (plaqueText) {
        const pMidX = hx + dx * 0.50;
        const pMidY = hy + dy * 0.50;
        const pp = isoToScreen(pMidX, pMidY, 1.45, ox, oy);
        const screenDx = b1.x - b0.x;
        const screenDy = b1.y - b0.y;
        const slope = Math.abs(screenDx) > 0.001 ? (screenDy / screenDx) : (screenDy > 0 ? 0.5 : -0.5);

        this.ctx.save();
        this.ctx.translate(pp.x, pp.y);
        this.ctx.transform(1, slope, 0, 1, 0, 0);

        this.ctx.fillStyle = '#1e3a8a';
        this.ctx.fillRect(-22, -8, 44, 16);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1.2;
        this.ctx.strokeRect(-22, -8, 44, 16);

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.lineWidth = 0.8;
        this.ctx.strokeRect(-20, -6, 40, 12);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(plaqueText, 0, 0);
        this.ctx.restore();
      }

      // Brass Handle
      const hPos = isoToScreen(hx + dx * 0.86, hy + dy * 0.86, 0.98, ox, oy);
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.fillRect(hPos.x - 2, hPos.y - 10, 4, 16);
    }

    // --- Atmospheric Full-Screen Lighting Overlay ---
    drawLightingOverlay(ctx) {
      const w = this.width;
      const h = this.height;

      // 1. Time-of-day subtle ambient tone
      if (this.currentTimeState === 'sunset') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, 'rgba(251, 146, 60, 0.12)');
        grad.addColorStop(0.5, 'rgba(244, 114, 182, 0.08)');
        grad.addColorStop(1, 'rgba(147, 51, 234, 0.10)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else if (this.currentTimeState === 'night') {
        const rad = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.95);
        rad.addColorStop(0, 'rgba(15, 23, 42, 0.10)');
        rad.addColorStop(0.70, 'rgba(28, 14, 38, 0.20)');
        rad.addColorStop(1, 'rgba(54, 18, 52, 0.32)');
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, w, h);
      } else if (this.currentTimeState === 'galaxy') {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, 'rgba(99, 102, 241, 0.12)');
        grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.10)');
        grad.addColorStop(1, 'rgba(24, 24, 58, 0.22)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // 2. The Howling Abyss: Volumetric God Rays & Swirling Frost Blizzard
      if (this.player && this.player.y >= 44 && this.player.x >= 10) {
        ctx.save();
        const t = performance.now() * 0.001;
        // 1. Diagonal Volumetric Light Beams (streaming from top-left, matching the iconic ARAM map!)
        const beamPulse = 0.82 + Math.sin(t * 1.6) * 0.18;
        const numRays = 4;
        for (let i = 0; i < numRays; i++) {
          const rayX = (w * 0.12) + (i * w * 0.22) + Math.sin(t * 0.4 + i) * 30;
          const rayWidth = 70 + (i % 2) * 35;
          const beamGrad = ctx.createLinearGradient(rayX, 0, rayX + h * 0.55, h);
          beamGrad.addColorStop(0, `rgba(224, 242, 254, ${0.20 * beamPulse})`);
          beamGrad.addColorStop(0.35, `rgba(56, 189, 248, ${0.11 * beamPulse})`);
          beamGrad.addColorStop(0.80, 'rgba(14, 165, 233, 0.02)');
          beamGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(rayX - rayWidth * 0.4, 0);
          ctx.lineTo(rayX + rayWidth * 0.4, 0);
          ctx.lineTo(rayX + h * 0.55 + rayWidth, h);
          ctx.lineTo(rayX + h * 0.55 - rayWidth, h);
          ctx.closePath();
          ctx.fill();
        }

        // 2. Swirling Frost Snowflakes & Ice Shards Drifting in the Wind
        ctx.fillStyle = 'rgba(240, 249, 255, 0.72)';
        for (let j = 0; j < 32; j++) {
          const fx = ((j * 137.5 + t * 50) % w);
          const fy = ((j * 91.3 + t * 70) % h);
          const size = 1.1 + (j % 3) * 0.7;
          ctx.beginPath();
          ctx.arc(fx, fy, size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // --- Main Render Frame Loop ---
    loop(now) {
      const dt = Math.min(0.1, (now - this.lastTime) / 1000);
      this.lastTime = now;

      this.update(dt);

      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);

      ctx.save();
      const { ox, oy } = this.getOrigin();
      this.ox = ox;
      this.oy = oy;

      const cx = this.width / 2;
      const cy = this.height / 2;
      ctx.translate(cx, cy);
      ctx.scale(this.zoom, this.zoom);
      ctx.translate(-cx, -cy);

      // 1. Draw Map Terrain
      this.drawTerrain(ctx, ox, oy);

      // 2. Collect and Sort Entities with Zero-GC Viewport Culling
      const margin = 160 / this.zoom;
      const minX = cx - (cx / this.zoom) - margin;
      const maxX = cx + (cx / this.zoom) + margin;
      const minY = cy - (cy / this.zoom) - margin;
      const maxY = cy + (cy / this.zoom) + margin;

      // Filter visible static entities (zero allocations)
      const visibleEntities = [];
      const staticCount = this.staticEntities ? this.staticEntities.length : 0;
      for (let i = 0; i < staticCount; i++) {
        const e = this.staticEntities[i];
        const pt = isoToScreen(e.midX, e.midY, e.z || 0, ox, oy);
        if (pt.x >= minX && pt.x <= maxX && pt.y >= minY && pt.y <= maxY) {
          visibleEntities.push(e);
        }
      }

      // Add dynamic characters
      const chars = this.charManager ? this.charManager.characters : [];
      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        const pt = isoToScreen(c.x, c.y, c.z || 0, ox, oy);
        if (pt.x >= minX && pt.x <= maxX && pt.y >= minY && pt.y <= maxY) {
          visibleEntities.push({
            isChar: true,
            char: c,
            xMin: c.x - 0.25,
            xMax: c.x + 0.25,
            yMin: c.y - 0.25,
            yMax: c.y + 0.25,
            z: c.z || 0,
            furnitureId: c.furniture ? c.furniture.id : null,
            draw: () => this.charManager.drawCharacter(ctx, c, ox, oy)
          });
        }
      }

      const sorted = sortIsometricEntities(visibleEntities);

      // 3. Render Depth-Sorted Entities
      sorted.forEach(e => {
        try { e.draw(); } catch(err) { console.error('Render entity error:', err); }
      });

      // 4. Render Ambient Particles
      this.particles.forEach(p => {
        const pt = isoToScreen(p.x, p.y, p.z, ox, oy);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();

      // 5. Full-Screen Lighting Overlay (Drawn in screen space)
      this.drawLightingOverlay(ctx);

      requestAnimationFrame(this.loop.bind(this));
    }
  }

  // Export to Global Scope
  window.LudwigiaWorld = LudwigiaWorld;

})(window);
