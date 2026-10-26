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

      // Particles
      this.particles = [];
      this.initParticles();

      // Input keys
      this.keys = {};
      this.bindEvents();

      // Setup Obstacles
      this.setupWorldObstacles();

      // Load Characters from JSON
      this.charManager.loadCharacters('data/characters.json').then(() => {
        // Start Loop
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop.bind(this));
      });
    }

    setupWorldObstacles() {
      // 1. Ludwig's Family Residence (NW: x: 0..9, y: 0..9)
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

      // Park Benches (Precise seat footprints, keeping surrounding lawn and paths 100% open)
      this.nav.setBlock(13.8, 9.5, 1.4, 0.5, true);
      this.nav.setBlock(13.8, 17.5, 1.4, 0.5, true);
      this.nav.setBlock(22.2, 13.5, 1.4, 0.5, true);
      this.nav.setBlock(5.2, 12.5, 1.4, 0.5, true);
      this.nav.setBlock(13.8, 29.5, 1.4, 0.5, true); // South Avenue Bench

      // Garden Stone Chess Table & Stools (Ludwig's South Lawn Terrace)
      this.nav.setBlock(2.7, 13.8, 1.8, 1.3, true);

      // Campus Landmark Monument Totems (Facing the Courtyard Avenue)
      this.nav.setBlock(16.5, 7.2, 0.65, 0.35, true);  // AI Studio Monument Totem
      this.nav.setBlock(16.5, 23.2, 0.65, 0.35, true); // Grand Library Monument Totem
      this.nav.setBlock(16.5, 39.2, 0.65, 0.35, true); // Douyin Office Monument Totem

      // 5. Sanmin High School Classroom (SW2: x: 0..9, y: 33..42)
      this.nav.setBlock(0, SCHOOL_MIN_Y, 10, 0.6, true);             // North Wall (y: 33)
      this.nav.setBlock(0, SCHOOL_MIN_Y, 0.6, 10, true);             // West Wall (x: 0)
      this.nav.setBlock(0, SCHOOL_MAX_Y + 1, 10, 0.6, true);         // South Wall (y: 43)
      // East Wall Doorway at y: 36.5 to 38.8 (keep tiles 37 and 38 100% open)
      this.nav.setBlock(SCHOOL_MAX_X + 1, SCHOOL_MIN_Y, 0.6, 3.5, true);  // East Wall Top (y: 33 to 36.5)
      this.nav.setBlock(SCHOOL_MAX_X + 1, 39.0, 0.6, 4.0, true);          // East Wall Bottom (y: 39 to 43)

      // Classroom Furniture Obstacles
      this.nav.setBlock(0.2, 34.0, 0.6, 3.8, true); // Blackboard Wall Area
      this.nav.setBlock(1.5, 34.2, 1.0, 0.8, true); // Teacher Podium
      // 16 Student Desks in 4x4 Grid
      for (const cx of [2.2, 4.4, 6.6, 8.5]) {
        for (const ry of [35.8, 37.4, 39.0, 40.6]) {
          this.nav.setBlock(cx + 0.1, ry + 0.1, 0.85, 0.55, true);
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

      // Trees (Only block the exact tile of the 0.35x0.35 trunk)
      const treeBlocks = [
        [13, 2], [16, 2],
        [14, 8],
        [16, 18],
        [13, 25], [16, 25],
        [20, 12], [24, 12],
        [21, 15], [25, 15],
        [13, 28], [16, 28],
        [13, 35], [16, 35]
      ];
      treeBlocks.forEach(([tx, ty]) => {
        const trunkX = Math.floor(tx + 0.35);
        const trunkY = Math.floor(ty + 0.35);
        this.nav.setBlock(trunkX, trunkY, 1, 1, true);
      });
    }

    initParticles() {
      for (let i = 0; i < 45; i++) {
        this.particles.push({
          x: 9 + Math.random() * 16,
          y: 1 + Math.random() * 41,
          z: 1 + Math.random() * 2.8,
          vz: -0.012 - Math.random() * 0.02,
          vx: 0.01 + Math.random() * 0.02,
          vy: 0.005 + Math.random() * 0.015,
          color: Math.random() > 0.45 ? 'rgba(251, 207, 232, 0.75)' : 'rgba(186, 230, 253, 0.65)',
          size: 2 + Math.random() * 2.5
        });
      }
    }

    bindEvents() {
      window.addEventListener('resize', this.resize.bind(this));
      this.resize();

      // Keyboard Controls (Support both e.key and e.code for Mac/IME compatibility)
      window.addEventListener('keydown', (e) => {
        const k = e.key ? e.key.toLowerCase() : '';
        const c = e.code ? e.code.toLowerCase() : '';
        if (k) this.keys[k] = true;
        if (c) this.keys[c] = true;

        // Prevent browser scrolling with game controls
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(k) ||
            ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'keyw', 'keya', 'keys', 'keyd', 'space'].includes(c)) {
          e.preventDefault();
        }

        if (e.key === ' ' || e.key === 'Enter') {
          if (this.charManager.proximityTarget) {
            e.preventDefault();
            this.charManager.openDialogue(this.charManager.proximityTarget);
          }
        }
      });

      window.addEventListener('keyup', (e) => {
        const k = e.key ? e.key.toLowerCase() : '';
        const c = e.code ? e.code.toLowerCase() : '';
        if (k) this.keys[k] = false;
        if (c) this.keys[c] = false;
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
        const rect = this.canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const { ox, oy } = this.getOrigin();

        const adjSx = (sx - ox) / this.zoom + ox;
        const adjSy = (sy - oy) / this.zoom + oy;
        const { gx, gy } = screenToIso(adjSx, adjSy, ox, oy);

        const player = this.charManager.player;
        if (!player) return;

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

      this.canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.08 : 0.92;
        this.zoom = Math.max(0.65, Math.min(2.0, this.zoom * factor));
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
      const p = this.charManager.player || { x: 7.2, y: 7.2 };
      const screenPos = isoToScreen(p.x, p.y, 0, 0, 0);
      return {
        ox: this.width / 2 - screenPos.x + this.panX,
        oy: this.height / 2 - screenPos.y + this.panY
      };
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

      const player = this.charManager.player;
      if (!player) return;

      // 1. Zone Detection & Dynamic Camera
      let currentZone = 'plaza';
      let isInsideAnyHouse = false;
      let statusMessage = "Courtyard Plaza • 綠意花園與社交廣場";

      if (player.x <= 9.8 && player.y <= 9.8) {
        currentZone = 'ludwig_house';
        isInsideAnyHouse = true;
        statusMessage = "Ludwig's Home • 溫馨客廳與起居室";
      } else if (player.x <= 9.8 && player.y >= 10.0 && player.y <= 16.4) {
        currentZone = 'garden_terrace';
        isInsideAnyHouse = false;
        statusMessage = "Garden Terrace • 露天花園與石雕棋盤";
      } else if (player.x <= 9.8 && player.y >= 16.5 && player.y <= 26.5) {
        currentZone = 'dorm_211';
        isInsideAnyHouse = true;
        statusMessage = "男11 211 宿舍 • 青春熱血的大學生活";
      } else if (player.x >= 17.5 && player.x <= 27.5 && player.y <= 9.8) {
        currentZone = 'ai_studio';
        isInsideAnyHouse = true;
        statusMessage = "AI Studio • Ludwigia 智慧研究室";
      } else if (player.x >= 17.5 && player.x <= 27.5 && player.y >= 16.5 && player.y <= 26.5) {
        currentZone = 'library';
        isInsideAnyHouse = true;
        statusMessage = "Central Library • 知識藏書閣與典雅閱覽室";
      } else if (player.x <= 9.8 && player.y >= 32.5 && player.y <= 42.8) {
        currentZone = 'sanmin_school';
        isInsideAnyHouse = true;
        statusMessage = "Sanmin High School • 青春回憶與三民高中教室";
      } else if (player.x >= 17.5 && player.x <= 27.5 && player.y >= 32.5 && player.y <= 42.8) {
        currentZone = 'douyin_office';
        isInsideAnyHouse = true;
        statusMessage = "Douyin Office • 抖音演算法研發辦公室";
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

      const nearDouyinDoor = this.charManager.characters.some(c => Math.hypot(c.x - 18.0, c.y - 37.65) < 2.4);
      this.doorDouyinOpen += ((nearDouyinDoor ? 1.0 : 0.0) - this.doorDouyinOpen) * Math.min(1.0, dt * 5.0);

      // Status text
      const statusEl = document.getElementById('status-text');
      if (statusEl) statusEl.textContent = statusMessage;

      // 3. Player Movement with Reliable Walking Animation
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

      if (kx !== 0 || ky !== 0) {
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
          // Unstuck escape fallback: if player was placed near an obstacle boundary,
          // allow moving towards open ground
          if (this.nav.isWalkable(nx, ny)) {
            player.x = nx;
            player.y = ny;
            playerActuallyMoved = true;
          } else if (this.nav.isWalkable(nx, player.y)) {
            player.x = nx;
            playerActuallyMoved = true;
          } else if (this.nav.isWalkable(player.x, ny)) {
            player.y = ny;
            playerActuallyMoved = true;
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
              c.state = 'idle';
              c.isWalking = false;
              c.walkTimer = 0;
              // Natural rest while observing/enjoying spot (2.5 to 6.0 seconds)
              c.timer = 2.5 + Math.random() * 3.5;
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
          c.timer = 1.5 + Math.random() * 2.5;
          if (c.isCat) {
            c.state = Math.random() > 0.45 ? 'sleeping' : 'walking';
            if (c.state === 'walking') {
              const catSpots = [{ x: 4.5, y: 7.5 }, { x: 7.5, y: 4.5 }, { x: 3.5, y: 3.5 }, { x: 5.5, y: 6.5 }];
              const dest = catSpots[Math.floor(Math.random() * catSpots.length)];
              c.path = this.nav.findPath({ x: c.x, y: c.y }, dest);
            }
          } else {
            let targetX, targetY;
            let attempts = 0;
            let valid = false;

            while (!valid && attempts < 16) {
              attempts++;

              // Shared Multi-Zone Ecological Anchors
              const plazaAnchors = [
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
                { x: 17.8, y: 14.5 }  // Central East Path Intersection
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
                { x: 2.5, y: 19.8 }, // Bed 1 Happy Wang
                { x: 2.5, y: 23.6 }, // Bed 2 Kerry Chang
                { x: 7.0, y: 19.8 }, // Bed 3 Clark Wu
                { x: 7.0, y: 23.6 }, // Bed 4 Jerry Chung
                { x: 2.8, y: 21.6 }, // Common Lounge Sofa & Guitar (Billy)
                { x: 5.8, y: 21.6 }, // Common Lounge Study Table (Bo Han)
                { x: 4.8, y: 19.8 }, // North Aisle
                { x: 4.8, y: 23.6 }, // South Aisle
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
                { x: 3.2, y: 35.0 }, // Teacher Area
                { x: 3.2, y: 37.2 }, // Center Classroom Aisle
                { x: 6.0, y: 37.2 }, // Side Classroom Aisle
                { x: 3.2, y: 39.5 }, // Back Student Desks
                { x: 5.5, y: 41.5 }, // Noticeboard / Lockers
                { x: 8.5, y: 37.6 }  // School Door Threshold
              ];

              const douyinAnchors = [
                { x: 21.0, y: 35.5 }, // Dev Workstation 1 & 2
                { x: 25.0, y: 35.5 }, // Standing Desk Area
                { x: 22.5, y: 37.5 }, // Conference Table
                { x: 21.0, y: 40.0 }, // Dev Workstation 3 & 4
                { x: 24.5, y: 39.0 }, // Douyin Logo Center
                { x: 19.2, y: 37.6 }  // Douyin Door Threshold
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
                douyin: douyinAnchors
              };

              const rawVisited = c.visitedZones;
              const visitedPool = Array.isArray(rawVisited) && rawVisited.length > 0
                ? rawVisited
                : (c.zone === 'house' ? ['house', 'plaza'] :
                   c.zone === 'ai_studio' ? ['ai_studio', 'plaza', 'library', 'douyin_office'] :
                   c.zone === 'library' ? ['library', 'plaza', 'ai_studio', 'sanmin_school'] :
                   c.zone === 'dorm_211' ? ['dorm_211', 'plaza', 'library', 'sanmin_school'] :
                   c.zone === 'sanmin_school' ? ['sanmin_school', 'plaza', 'dorm_211'] :
                   c.zone === 'douyin_office' ? ['douyin_office', 'plaza', 'ai_studio'] :
                   [c.zone, 'plaza']);

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
              const path = this.nav.findPath({ x: c.x, y: c.y }, { x: targetX, y: targetY });
              if (path && path.length > 0) {
                c.path = path;
                c.state = 'walking';
              } else {
                c.timer = 0.6;
              }
            } else {
              c.timer = 0.6;
            }
          }
        }
      });

      // 6. Proximity Check for Space/Enter Dialogue Prompt
      let closest = null;
      let minDist = 1.8;
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

      // 7. Update Floating Ambient Particles
      this.particles.forEach(p => {
        p.z += p.vz;
        p.x += p.vx;
        p.y += p.vy;
        if (p.z <= 0 || p.x > MAP_W || p.y > MAP_H) {
          p.z = 2.2 + Math.random() * 0.5;
          p.x = 9 + Math.random() * 16;
          p.y = 1 + Math.random() * 41;
        }
      });
    }

    // --- Terrain Renderer for Campus (expanded to MAP_W x MAP_H) ---
    drawTerrain(ctx, ox, oy) {
      for (let x = 0; x < MAP_W; x++) {
        for (let y = 0; y < MAP_H; y++) {
          const isLudwig = (x <= HOUSE_MAX_X && y <= HOUSE_MAX_Y);
          const isDorm = (x <= DORM_MAX_X && y >= DORM_MIN_Y && y <= DORM_MAX_Y);
          const isAi = (x >= AI_MIN_X && x <= AI_MAX_X && y >= AI_MIN_Y && y <= AI_MAX_Y);
          const isLib = (x >= LIB_MIN_X && x <= LIB_MAX_X && y >= LIB_MIN_Y && y <= LIB_MAX_Y);
          const isSchool = (x <= SCHOOL_MAX_X && y >= SCHOOL_MIN_Y && y <= SCHOOL_MAX_Y);
          const isDouyin = (x >= DOUYIN_MIN_X && x <= DOUYIN_MAX_X && y >= DOUYIN_MIN_Y && y <= DOUYIN_MAX_Y);
          const isInsideBuilding = isLudwig || isDorm || isAi || isLib || isSchool || isDouyin;

          // Cobblestone Pathways connecting doorways, central plaza, and south sector
          const isPath = (
            (x >= 10 && x <= 11 && y >= 4 && y <= 39) ||
            (y >= 5 && y <= 6 && x >= 10 && x <= 19) ||
            (x >= 12 && x <= 16 && y >= 12 && y <= 16) ||
            (y >= 20 && y <= 22 && x >= 10 && x <= 19) ||
            (y >= 36 && y <= 38 && x >= 10 && x <= 19)
          );

          ctx.save();
          if (this.currentZone === 'ludwig_house' && !isLudwig) ctx.globalAlpha = this.outsideAlpha;
          else if (this.currentZone === 'dorm_211' && !isDorm) ctx.globalAlpha = this.outsideAlpha;
          else if (this.currentZone === 'ai_studio' && !isAi) ctx.globalAlpha = this.outsideAlpha;
          else if (this.currentZone === 'library' && !isLib) ctx.globalAlpha = this.outsideAlpha;
          else if (this.currentZone === 'sanmin_school' && !isSchool) ctx.globalAlpha = this.outsideAlpha;
          else if (this.currentZone === 'douyin_office' && !isDouyin) ctx.globalAlpha = this.outsideAlpha;

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

          ctx.strokeStyle = isInsideBuilding ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.05)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Cyber Floor Neon Runners in AI Studio
          if (isAi && (x === AI_MIN_X + 4 || y === AI_MIN_Y + 5)) {
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.55)';
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          ctx.restore();
        }
      }
    }

    // --- Collect All World Props & Entities for Topological Sorting ---
    collectWorldEntities(ox, oy) {
      const list = [];
      const isDark = (this.currentTimeState === 'night' || this.currentTimeState === 'galaxy');
      const wallL = isDark ? '#2a2e38' : '#e8e2d2';
      const wallR = isDark ? '#1f232b' : '#d8d1be';
      const wallT = isDark ? '#334155' : '#f1f5f9';
      const H = 2.55; // Slightly taller than the doors (2.15m), providing solid lintel & architectural wall structure

      // === 1. ZONE 1: LUDWIG'S HOUSE ===
      // SE Dividing Wall Left Segment (dL, y: 0 to 4.5)
      list.push({
        xMin: HOUSE_MAX_X + 0.85, xMax: HOUSE_MAX_X + 1.35,
        yMin: 0, yMax: 4.5,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaHouse < 0.99) this.ctx.globalAlpha = this.wallAlphaHouse;
          this.models.drawBox(this.ctx, HOUSE_MAX_X + 1, 0, 0, 0.25, 4.5, H, wallT, wallL, wallR, ox, oy);
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
          this.models.drawBox(this.ctx, HOUSE_MAX_X + 1, 6.8, 0, 0.25, (HOUSE_MAX_Y + 1) - 6.8, H, wallT, wallL, wallR, ox, oy);
          this.ctx.restore();
        }
      });
      // Interactive Double Doors (Ludwig's House)
      const doorAngle1 = this.doorLudwigOpen * 1.35;
      const doorW = 1.15;
      const hx = HOUSE_MAX_X + 1.0;
      const nTipX = hx + Math.sin(doorAngle1) * doorW;
      const nTipY = 4.5 + Math.cos(doorAngle1) * doorW;
      const sTipX = hx + Math.sin(doorAngle1) * doorW;
      const sTipY = 6.8 - Math.cos(doorAngle1) * doorW;
      list.push({
        xMin: Math.min(hx, nTipX, sTipX) - 0.15,
        xMax: Math.max(hx, nTipX, sTipX) + 0.15,
        yMin: 4.4,
        yMax: 6.9,
        draw: () => {
          this.ctx.save();
          this.drawDoorLeaf(hx, 4.5, nTipX, nTipY, ox, oy);
          this.drawDoorLeaf(hx, 6.8, sTipX, sTipY, ox, oy);
          this.ctx.restore();
        }
      });

      // SE Doorway Lintel Beam (z: 2.15 to H, covers door tops cleanly)
      list.push({
        xMin: HOUSE_MAX_X + 0.85, xMax: HOUSE_MAX_X + 1.35,
        yMin: 4.45, yMax: 6.85,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaHouse < 0.99) this.ctx.globalAlpha = this.wallAlphaHouse;
          this.models.drawBox(this.ctx, HOUSE_MAX_X + 1, 4.5, 2.15, 0.25, 2.3, H - 2.15, wallT, wallL, wallR, ox, oy);
          this.ctx.restore();
        }
      });

      // Mounted Lintel Plaque (Exterior Wall Face Foreground)
      list.push({
        xMin: HOUSE_MAX_X + 1.15, xMax: HOUSE_MAX_X + 1.45,
        yMin: 4.5, yMax: 6.95,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaHouse < 0.99) this.ctx.globalAlpha = this.wallAlphaHouse;
          const plq = isoToScreen(HOUSE_MAX_X + 1.26, 5.65, 2.48, ox, oy);
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
          this.models.drawBox(this.ctx, 0, swY, 0, 4.5, 0.25, H, wallT, wallL, wallR, ox, oy);
          // Panoramic Frosted Glass Window inset into South Wall (z: 0.85 to 1.85)
          const wp0 = isoToScreen(0.8, swY + 0.12, 0.85, ox, oy);
          const wp1 = isoToScreen(3.8, swY + 0.12, 0.85, ox, oy);
          const wp2 = isoToScreen(3.8, swY + 0.12, 1.85, ox, oy);
          const wp3 = isoToScreen(0.8, swY + 0.12, 1.85, ox, oy);
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
          this.models.drawBox(this.ctx, 6.8, swY, 0, 3.2, 0.25, H, wallT, wallL, wallR, ox, oy);
          this.ctx.restore();
        }
      });
      // SW Side Doorway Lintel Beam (z: 2.15 to H)
      list.push({
        xMin: 4.5, xMax: 6.8, yMin: swY - 0.15, yMax: swY + 0.35,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaHouse < 0.99) this.ctx.globalAlpha = this.wallAlphaHouse;
          this.models.drawBox(this.ctx, 4.5, swY, 2.15, 2.3, 0.25, H - 2.15, wallT, wallL, wallR, ox, oy);
          this.ctx.restore();
        }
      });

      // Side Porch Woven Coir Mat
      list.push({
        xMin: 4.8, xMax: 6.5, yMin: swY + 0.15, yMax: swY + 0.85,
        draw: () => {
          const sm0 = isoToScreen(4.8, swY + 0.15, 0.01, ox, oy);
          const sm1 = isoToScreen(6.5, swY + 0.15, 0.01, ox, oy);
          const sm2 = isoToScreen(6.5, swY + 0.85, 0.01, ox, oy);
          const sm3 = isoToScreen(4.8, swY + 0.85, 0.01, ox, oy);
          this.ctx.fillStyle = '#b45309';
          this.ctx.beginPath();
          this.ctx.moveTo(sm0.x, sm0.y); this.ctx.lineTo(sm1.x, sm1.y); this.ctx.lineTo(sm2.x, sm2.y); this.ctx.lineTo(sm3.x, sm3.y);
          this.ctx.closePath();
          this.ctx.fill();
        }
      });

      // Interactive Side Terrace Double Doors (Swings open into south garden porch)
      const sideDoorAngle = this.doorLudwigSideOpen * 1.35;
      const wTipX = 4.5 + Math.cos(sideDoorAngle) * doorW;
      const wTipY = swY + Math.sin(sideDoorAngle) * doorW;
      list.push({
        xMin: 4.4, xMax: 5.7,
        yMin: swY - 0.1, yMax: Math.max(swY + doorW, wTipY) + 0.1,
        draw: () => {
          this.ctx.save();
          this.drawDoorLeaf(4.5, swY, wTipX, wTipY, ox, oy);
          this.ctx.restore();
        }
      });
      const eTipX = 6.8 - Math.cos(sideDoorAngle) * doorW;
      const eTipY = swY + Math.sin(sideDoorAngle) * doorW;
      list.push({
        xMin: 5.6, xMax: 6.9,
        yMin: swY - 0.1, yMax: Math.max(swY + doorW, eTipY) + 0.1,
        draw: () => {
          this.ctx.save();
          this.drawDoorLeaf(6.8, swY, eTipX, eTipY, ox, oy);
          this.ctx.restore();
        }
      });

      // House Furniture Props
      list.push({
        xMin: 1.0, xMax: 3.1, yMin: 1.0, yMax: 3.3,
        draw: () => this.models.drawMasterBed(this.ctx, 1.0, 1.0, ox, oy)
      });
      list.push({
        xMin: 6.0, xMax: 8.5, yMin: 1.0, yMax: 2.2,
        draw: () => this.models.drawDeveloperDesk(this.ctx, 6.0, 1.0, ox, oy)
      });
      list.push({
        xMin: 0.1, xMax: 0.8, yMin: 3.8, yMax: 6.4,
        draw: () => this.models.drawBookshelf(this.ctx, 0.1, 3.8, ox, oy)
      });
      list.push({
        xMin: 2.0, xMax: 4.5, yMin: 5.0, yMax: 7.0,
        draw: () => this.models.drawLivingRoom(this.ctx, 2.0, 5.0, ox, oy)
      });
      list.push({
        xMin: 6.0, xMax: 8.2, yMin: 5.0, yMax: 6.8,
        draw: () => this.models.drawDiningTable(this.ctx, 6.0, 5.0, ox, oy)
      });

      // === 2. ZONE 2: MEN'S DORMITORY 11 ROOM 211 ===
      // 1. Northwest Back Wall (along x = 0, y: 17 to 27)
      list.push({
        xMin: -0.1, xMax: 0.35,
        yMin: DORM_MIN_Y, yMax: DORM_MAX_Y + 1,
        draw: () => {
          this.models.drawBox(this.ctx, 0, DORM_MIN_Y, 0, 0.25, (DORM_MAX_Y + 1) - DORM_MIN_Y, H, wallT, null, wallR, ox, oy);
          // Large Dorm Window at x = 0.26, y: 20.8..23.2, z: 1.15..2.15
          const w0 = isoToScreen(0.26, 20.8, 1.15, ox, oy);
          const w1 = isoToScreen(0.26, 23.2, 1.15, ox, oy);
          const w2 = isoToScreen(0.26, 23.2, 2.15, ox, oy);
          const w3 = isoToScreen(0.26, 20.8, 2.15, ox, oy);
          this.ctx.fillStyle = 'rgba(186, 230, 253, 0.55)';
          this.ctx.beginPath();
          this.ctx.moveTo(w0.x, w0.y); this.ctx.lineTo(w1.x, w1.y); this.ctx.lineTo(w2.x, w2.y); this.ctx.lineTo(w3.x, w3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#334155';
          this.ctx.lineWidth = 1.5;
          this.ctx.stroke();

          // University Hackathon Poster at x = 0.26, y: 18.2..19.6, z: 1.15..1.95
          const hp0 = isoToScreen(0.26, 18.2, 1.15, ox, oy);
          const hp1 = isoToScreen(0.26, 19.6, 1.15, ox, oy);
          const hp2 = isoToScreen(0.26, 19.6, 1.95, ox, oy);
          const hp3 = isoToScreen(0.26, 18.2, 1.95, ox, oy);
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
          this.models.drawBox(this.ctx, 0, DORM_MIN_Y, 0, (DORM_MAX_X + 1), 0.25, H, wallT, wallL, null, ox, oy, wallR);
          // Cork Noticeboard at y = 17.26, x: 3.8..6.2, z: 1.15..1.85
          const cb0 = isoToScreen(3.8, DORM_MIN_Y + 0.26, 1.15, ox, oy);
          const cb1 = isoToScreen(6.2, DORM_MIN_Y + 0.26, 1.15, ox, oy);
          const cb2 = isoToScreen(6.2, DORM_MIN_Y + 0.26, 1.85, ox, oy);
          const cb3 = isoToScreen(3.8, DORM_MIN_Y + 0.26, 1.85, ox, oy);
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
          this.models.drawBox(this.ctx, dormSE_X, DORM_MIN_Y, 0, 0.25, 20.5 - DORM_MIN_Y, H, wallT, wallL, wallR, ox, oy);
          this.ctx.restore();
        }
      });
      // Wall segment right of door (y: 22.8 to 27)
      list.push({
        xMin: dormSE_X - 0.15, xMax: dormSE_X + 0.35,
        yMin: 22.8, yMax: DORM_MAX_Y + 1,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaDorm < 0.99) this.ctx.globalAlpha = this.wallAlphaDorm;
          this.models.drawBox(this.ctx, dormSE_X, 22.8, 0, 0.25, (DORM_MAX_Y + 1) - 22.8, H, wallT, wallL, wallR, ox, oy);
          this.ctx.restore();
        }
      });
      // Dorm Interactive Double Doors
      const dormDoorAngle = this.doorDormOpen * 1.35;
      const dormDoorW = 1.15;
      const dnTipX = dormSE_X + Math.sin(dormDoorAngle) * dormDoorW;
      const dnTipY = 20.5 + Math.cos(dormDoorAngle) * dormDoorW;
      const dsTipX = dormSE_X + Math.sin(dormDoorAngle) * dormDoorW;
      const dsTipY = 22.8 - Math.cos(dormDoorAngle) * dormDoorW;
      list.push({
        xMin: Math.min(dormSE_X, dnTipX, dsTipX) - 0.15,
        xMax: Math.max(dormSE_X, dnTipX, dsTipX) + 0.15,
        yMin: 20.4,
        yMax: 22.9,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaDorm < 0.99) this.ctx.globalAlpha = this.wallAlphaDorm;
          this.drawDoorLeaf(dormSE_X, 20.5, dnTipX, dnTipY, ox, oy);
          this.drawDoorLeaf(dormSE_X, 22.8, dsTipX, dsTipY, ox, oy);
          this.ctx.restore();
        }
      });

      // Lintel beam over door (z: 2.15 to H, covers door tops cleanly)
      list.push({
        xMin: dormSE_X - 0.15, xMax: dormSE_X + 0.35,
        yMin: 20.45, yMax: 22.85,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaDorm < 0.99) this.ctx.globalAlpha = this.wallAlphaDorm;
          this.models.drawBox(this.ctx, dormSE_X, 20.5, 2.15, 0.25, 2.3, H - 2.15, wallT, wallL, wallR, ox, oy);
          this.ctx.restore();
        }
      });

      // Dorm 211 Lintel Bronze Plaque (Exterior Wall Face Foreground)
      list.push({
        xMin: dormSE_X + 0.15, xMax: dormSE_X + 0.45,
        yMin: 20.5, yMax: 22.95,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaDorm < 0.99) this.ctx.globalAlpha = this.wallAlphaDorm;
          const plq = isoToScreen(dormSE_X + 0.26, 21.65, 2.48, ox, oy);
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

      // 4. Southwest Boundary Skirting
      list.push({
        xMin: 0, xMax: DORM_MAX_X + 1,
        yMin: DORM_MAX_Y + 0.9, yMax: DORM_MAX_Y + 1.2,
        draw: () => {
          this.models.drawBox(this.ctx, 0, DORM_MAX_Y + 1, 0, (DORM_MAX_X + 1), 0.20, 0.35, wallT, wallL, null, ox, oy);
        }
      });

      // 5. Four Symmetrical Loft Bed/Desk Combos Facing Each Other
      // NORTH ROW BEDS (facing: 'south' into room, chair back faces south towards central aisle)
      // Bed 1 (Happy Wang: x: 1.0, y: 17.5)
      list.push({
        xMin: 1.0, xMax: 3.2, yMin: 17.5, yMax: 19.5,
        draw: () => this.models.drawLoftBedDesk(this.ctx, 1.0, 17.5, { duvetColor: '#ea580c', screenColor: '#f97316', facing: 'south' }, ox, oy)
      });
      // Bed 3 (Clark Wu: x: 6.2, y: 17.5)
      list.push({
        xMin: 6.2, xMax: 8.4, yMin: 17.5, yMax: 19.5,
        draw: () => this.models.drawLoftBedDesk(this.ctx, 6.2, 17.5, { duvetColor: '#1d4ed8', screenColor: '#38bdf8', facing: 'south' }, ox, oy)
      });

      // SOUTH ROW BEDS (facing: 'north' into room, chair back faces north towards central aisle)
      // Bed 2 (Kerry Chang: x: 1.0, y: 24.5)
      list.push({
        xMin: 1.0, xMax: 3.2, yMin: 23.8, yMax: 26.0,
        draw: () => this.models.drawLoftBedDesk(this.ctx, 1.0, 24.5, { duvetColor: '#0d9488', screenColor: '#2dd4bf', facing: 'north' }, ox, oy)
      });
      // Bed 4 (Jerry Chung: x: 6.2, y: 24.5)
      list.push({
        xMin: 6.2, xMax: 8.4, yMin: 23.8, yMax: 26.0,
        draw: () => this.models.drawLoftBedDesk(this.ctx, 6.2, 24.5, { duvetColor: '#7c3aed', screenColor: '#c084fc', facing: 'north' }, ox, oy)
      });

      // Dorm Common Lounge: Beloved Classic Blue Sofa, Orange Pillows & Coffee Table (Billy Fang's hangout)
      list.push({
        xMin: 3.6, xMax: 5.8, yMin: 20.6, yMax: 22.8,
        draw: () => this.models.drawDormCommonArea(this.ctx, 3.6, 20.8, ox, oy)
      });

      // === 3. ZONE 3: LUDWIGIA AI RESEARCH STUDIO ===
      // AI Studio Entrance Walls & Plaque
      list.push({
        xMin: AI_MIN_X - 0.15, xMax: AI_MIN_X + 0.35,
        yMin: 0, yMax: 4.5,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaAi < 0.99) this.ctx.globalAlpha = this.wallAlphaAi;
          this.models.drawBox(this.ctx, AI_MIN_X, 0, 0, 0.25, 4.5, H, wallT, wallL, wallR, ox, oy);
          this.ctx.restore();
        }
      });
      list.push({
        xMin: AI_MIN_X - 0.15, xMax: AI_MIN_X + 0.35,
        yMin: 6.8, yMax: 10,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaAi < 0.99) this.ctx.globalAlpha = this.wallAlphaAi;
          this.models.drawBox(this.ctx, AI_MIN_X, 6.8, 0, 0.25, 3.2, H, wallT, wallL, wallR, ox, oy);
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
          this.models.drawBox(this.ctx, AI_MIN_X, 4.5, 2.15, 0.25, 2.3, H - 2.15, wallT, wallL, wallR, ox, oy);
          this.ctx.restore();
        }
      });

      // AI Studio Sliding Glass Door
      const aiSlideOffset = this.doorAiOpen * 1.5;
      list.push({
        xMin: AI_MIN_X - 0.1, xMax: AI_MIN_X + 0.1,
        yMin: 4.5, yMax: 6.8,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaAi < 0.99) this.ctx.globalAlpha = this.wallAlphaAi;
          const dg0 = isoToScreen(AI_MIN_X, 4.6 + aiSlideOffset, 0, ox, oy);
          const dg1 = isoToScreen(AI_MIN_X, 6.7 + aiSlideOffset, 0, ox, oy);
          const dg2 = isoToScreen(AI_MIN_X, 6.7 + aiSlideOffset, 2.06, ox, oy);
          const dg3 = isoToScreen(AI_MIN_X, 4.6 + aiSlideOffset, 2.06, ox, oy);
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
          this.models.drawBox(this.ctx, AI_MIN_X, 0, 0, (AI_MAX_X + 1) - AI_MIN_X, 0.25, H, wallT, wallL, wallR, ox, oy, wallR);
        }
      });
      list.push({
        xMin: 21.0, xMax: 24.5, yMin: 0.15, yMax: 0.35,
        draw: () => {
          this.models.drawInteriorBrandSign(this.ctx, 22.8, 0.26, 2.45, 'ai', ox, oy);
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
          this.models.drawBox(this.ctx, 17.2, 4.5, 2.20, 0.85, 2.30, 0.15, '#0f172a', '#06b6d4', '#1e293b', ox, oy);

          // 2. Under-Canopy Cyber Neon Underside Glow (Facing courtyard)
          const ug0 = isoToScreen(17.2, 4.5, 2.20, ox, oy);
          const ug1 = isoToScreen(18.0, 4.5, 2.20, ox, oy);
          const ug2 = isoToScreen(18.0, 6.8, 2.20, ox, oy);
          const ug3 = isoToScreen(17.2, 6.8, 2.20, ox, oy);
          this.ctx.fillStyle = 'rgba(6, 182, 212, 0.22)';
          this.ctx.beginPath();
          this.ctx.moveTo(ug0.x, ug0.y); this.ctx.lineTo(ug1.x, ug1.y); this.ctx.lineTo(ug2.x, ug2.y); this.ctx.lineTo(ug3.x, ug3.y);
          this.ctx.closePath();
          this.ctx.fill();

          this.ctx.restore();
        }
      });

      // AI Studio Campus Landmark Monument Totem (Standing proudly on the entrance lawn facing courtyard)
      list.push({
        xMin: 16.4, xMax: 17.2,
        yMin: 7.1, yMax: 7.6,
        draw: () => this.models.drawEntranceTotem(this.ctx, 16.5, 7.2, 'ai', ox, oy)
      });

      // AI Studio Equipment
      list.push({
        xMin: 19.5, xMax: 21.3, yMin: 1.2, yMax: 2.4,
        draw: () => this.models.drawServerRacks(this.ctx, 19.5, 1.2, ox, oy)
      });
      list.push({
        xMin: 23.5, xMax: 26.0, yMin: 1.2, yMax: 2.4,
        draw: () => this.models.drawAiCommandDesk(this.ctx, 23.5, 1.2, ox, oy)
      });
      list.push({
        xMin: 26.2, xMax: 27.0, yMin: 4.0, yMax: 6.4,
        draw: () => this.models.drawGlassWhiteboard(this.ctx, 26.2, 4.0, ox, oy)
      });
      list.push({
        xMin: 19.5, xMax: 21.3, yMin: 7.2, yMax: 8.4,
        draw: () => this.models.drawEspressoBar(this.ctx, 19.5, 7.2, ox, oy)
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
          this.models.drawBox(this.ctx, AI_MIN_X, aiSouthY, 0, (AI_MAX_X + 1) - AI_MIN_X, 0.25, H, wallT, wallL, wallR, ox, oy);

          // Panoramic Cyber Glass Observation Window (x: 21.0 to 26.5, z: 0.85 to 1.95)
          const cw0 = isoToScreen(21.0, aiSouthY + 0.26, 0.85, ox, oy);
          const cw1 = isoToScreen(26.5, aiSouthY + 0.26, 0.85, ox, oy);
          const cw2 = isoToScreen(26.5, aiSouthY + 0.26, 1.95, ox, oy);
          const cw3 = isoToScreen(21.0, aiSouthY + 0.26, 1.95, ox, oy);
          this.ctx.fillStyle = 'rgba(6, 182, 212, 0.45)';
          this.ctx.beginPath();
          this.ctx.moveTo(cw0.x, cw0.y); this.ctx.lineTo(cw1.x, cw1.y); this.ctx.lineTo(cw2.x, cw2.y); this.ctx.lineTo(cw3.x, cw3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#06b6d4';
          this.ctx.lineWidth = 1.5;
          this.ctx.stroke();

          // Cyber Window Horizontal Dividing Mullion (z: 1.40)
          const cm0 = isoToScreen(21.0, aiSouthY + 0.26, 1.40, ox, oy);
          const cm1 = isoToScreen(26.5, aiSouthY + 0.26, 1.40, ox, oy);
          this.ctx.strokeStyle = 'rgba(34, 211, 238, 0.7)';
          this.ctx.lineWidth = 1.0;
          this.ctx.beginPath();
          this.ctx.moveTo(cm0.x, cm0.y); this.ctx.lineTo(cm1.x, cm1.y);
          this.ctx.stroke();

          this.ctx.restore();
        }
      });

      // === 4. ZONE 4: LUDWIGIA GRAND LIBRARY & BOTANICAL READING HALL ===
      // Library North Partition Wall (along y = LIB_MIN_Y = 17, x: 18 to 28)
      // Solid architectural wall behind Grand Mahogany Bookcases facing the lawn
      list.push({
        xMin: LIB_MIN_X - 0.15, xMax: LIB_MAX_X + 1.0,
        yMin: LIB_MIN_Y - 0.15, yMax: LIB_MIN_Y + 0.35,
        draw: () => {
          this.models.drawBox(this.ctx, LIB_MIN_X, LIB_MIN_Y, 0, (LIB_MAX_X + 1) - LIB_MIN_X, 0.25, H, wallT, wallL, wallR, ox, oy, wallR);

          // Exterior Classical Stained Glass Clerestory Windows (facing lawn at y = 17.0, z: 1.25 to 2.15)
          // Window 1 (x: 20.0 to 22.8)
          const lw0 = isoToScreen(20.0, LIB_MIN_Y - 0.01, 1.25, ox, oy);
          const lw1 = isoToScreen(22.8, LIB_MIN_Y - 0.01, 1.25, ox, oy);
          const lw2 = isoToScreen(22.8, LIB_MIN_Y - 0.01, 2.15, ox, oy);
          const lw3 = isoToScreen(20.0, LIB_MIN_Y - 0.01, 2.15, ox, oy);
          this.ctx.fillStyle = 'rgba(251, 191, 36, 0.45)';
          this.ctx.beginPath();
          this.ctx.moveTo(lw0.x, lw0.y); this.ctx.lineTo(lw1.x, lw1.y); this.ctx.lineTo(lw2.x, lw2.y); this.ctx.lineTo(lw3.x, lw3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#d97706';
          this.ctx.lineWidth = 1.2;
          this.ctx.stroke();

          // Window 2 (x: 23.8 to 26.6)
          const rw0 = isoToScreen(23.8, LIB_MIN_Y - 0.01, 1.25, ox, oy);
          const rw1 = isoToScreen(26.6, LIB_MIN_Y - 0.01, 1.25, ox, oy);
          const rw2 = isoToScreen(26.6, LIB_MIN_Y - 0.01, 2.15, ox, oy);
          const rw3 = isoToScreen(23.8, LIB_MIN_Y - 0.01, 2.15, ox, oy);
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
          this.models.drawBox(this.ctx, LIB_MIN_X, LIB_MIN_Y, 0, 0.25, 3.5, H, wallT, wallL, wallR, ox, oy);
          this.ctx.restore();
        }
      });
      list.push({
        xMin: LIB_MIN_X - 0.15, xMax: LIB_MIN_X + 0.35,
        yMin: 22.8, yMax: LIB_MAX_Y + 1,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaLib < 0.99) this.ctx.globalAlpha = this.wallAlphaLib;
          this.models.drawBox(this.ctx, LIB_MIN_X, 22.8, 0, 0.25, 4.2, H, wallT, wallL, wallR, ox, oy);
          this.ctx.restore();
        }
      });
      // Library Double Mahogany Swinging Doors
      const libDoorAngle = this.doorLibOpen * 1.35;
      const libDoorW = 1.15;
      const libnTipX = LIB_MIN_X + Math.sin(libDoorAngle) * libDoorW;
      const libnTipY = 20.5 + Math.cos(libDoorAngle) * libDoorW;
      const libsTipX = LIB_MIN_X + Math.sin(libDoorAngle) * libDoorW;
      const libsTipY = 22.8 - Math.cos(libDoorAngle) * libDoorW;
      list.push({
        xMin: Math.min(LIB_MIN_X, libnTipX, libsTipX) - 0.15,
        xMax: Math.max(LIB_MIN_X, libnTipX, libsTipX) + 0.15,
        yMin: 20.4,
        yMax: 22.9,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaLib < 0.99) this.ctx.globalAlpha = this.wallAlphaLib;
          this.drawDoorLeaf(LIB_MIN_X, 20.5, libnTipX, libnTipY, ox, oy);
          this.drawDoorLeaf(LIB_MIN_X, 22.8, libsTipX, libsTipY, ox, oy);
          this.ctx.restore();
        }
      });

      // Lintel beam over library door (z: 2.15 to H, covers door tops cleanly)
      list.push({
        xMin: LIB_MIN_X - 0.15, xMax: LIB_MIN_X + 0.35,
        yMin: 20.45, yMax: 22.85,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaLib < 0.99) this.ctx.globalAlpha = this.wallAlphaLib;
          this.models.drawBox(this.ctx, LIB_MIN_X, 20.5, 2.15, 0.25, 2.3, H - 2.15, wallT, wallL, wallR, ox, oy);
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
          this.models.drawBox(this.ctx, 17.2, 20.5, 2.20, 0.85, 2.30, 0.15, '#78350f', '#451a03', '#92400e', ox, oy);

          // 2. Warm Amber Underside Illumination
          const ug0 = isoToScreen(17.2, 20.5, 2.20, ox, oy);
          const ug1 = isoToScreen(18.0, 20.5, 2.20, ox, oy);
          const ug2 = isoToScreen(18.0, 22.8, 2.20, ox, oy);
          const ug3 = isoToScreen(17.2, 22.8, 2.20, ox, oy);
          this.ctx.fillStyle = 'rgba(251, 191, 36, 0.20)';
          this.ctx.beginPath();
          this.ctx.moveTo(ug0.x, ug0.y); this.ctx.lineTo(ug1.x, ug1.y); this.ctx.lineTo(ug2.x, ug2.y); this.ctx.lineTo(ug3.x, ug3.y);
          this.ctx.closePath();
          this.ctx.fill();

          this.ctx.restore();
        }
      });

      // Grand Library Campus Landmark Monument Totem (Standing proudly on the entrance lawn facing courtyard)
      list.push({
        xMin: 16.4, xMax: 17.2,
        yMin: 23.1, yMax: 23.6,
        draw: () => this.models.drawEntranceTotem(this.ctx, 16.5, 23.2, 'lib', ox, oy)
      });

      // Grand Library Interior Feature Brand Wall Sign (Mounted high on interior North partition wall, facing South towards camera!)
      list.push({
        xMin: 20.8, xMax: 24.4, yMin: 17.15, yMax: 17.35,
        draw: () => {
          this.models.drawInteriorBrandSign(this.ctx, 22.6, 17.24, 2.48, 'library', ox, oy);
        }
      });

      // Library Interior Furniture:
      // 1. Grand Mahogany Book Walls with Brass Rolling Ladders (North Wall)
      list.push({
        xMin: 18.4, xMax: 22.5, yMin: 17.2, yMax: 18.0,
        draw: () => this.models.drawLibraryBookWall(this.ctx, 18.4, 17.2, ox, oy, 4.1, 1)
      });
      list.push({
        xMin: 22.7, xMax: 26.8, yMin: 17.2, yMax: 18.0,
        draw: () => this.models.drawLibraryBookWall(this.ctx, 22.7, 17.2, ox, oy, 4.1, 2)
      });

      // 1B. West Wall Library Corner Stack (Floor-to-Ceiling Shelves)
      list.push({
        xMin: 18.1, xMax: 18.9, yMin: 17.6, yMax: 20.4,
        draw: () => this.models.drawLibraryWestBookWall(this.ctx, 18.2, 17.6, ox, oy, 2.6)
      });

      // 1C. Mobile Library Book Cart (Scholarly Book Trolley)
      list.push({
        xMin: 22.4, xMax: 23.5, yMin: 18.4, yMax: 19.2,
        draw: () => this.models.drawLibraryBookCart(this.ctx, 22.5, 18.4, ox, oy)
      });

      // 2. Long Walnut Banker's Study Table with Emerald Lamp & Folios
      list.push({
        xMin: 20.0, xMax: 22.6, yMin: 20.0, yMax: 21.4,
        draw: () => this.models.drawBankerDesk(this.ctx, 20.0, 20.0, ox, oy)
      });

      // 3. Botanical Terrarium Pedestal
      list.push({
        xMin: 24.8, xMax: 26.0, yMin: 19.2, yMax: 20.4,
        draw: () => this.models.drawTerrarium(this.ctx, 24.8, 19.2, ox, oy)
      });

      // 4. Tufted Leather Wingback Reading Nook & Rug & Novel Stack
      list.push({
        xMin: 23.8, xMax: 26.2, yMin: 22.0, yMax: 24.2,
        draw: () => this.models.drawWingbackReadingNook(this.ctx, 23.8, 22.0, ox, oy)
      });

      // 5. Standing Brass Celestial Armillary Globe
      list.push({
        xMin: 20.2, xMax: 21.4, yMin: 23.6, yMax: 24.8,
        draw: () => this.models.drawCelestialGlobe(this.ctx, 20.8, 24.2, ox, oy)
      });

      // 6. Illuminated Rare Book Vitrine & Manuscript Cabinet (SE Alcove)
      list.push({
        xMin: 24.2, xMax: 26.8, yMin: 24.8, yMax: 25.5,
        draw: () => this.models.drawRareBookVitrine(this.ctx, 24.3, 24.8, ox, oy)
      });

      // 6. Library South Boundary Skirting (along y = LIB_MAX_Y + 1 = 27, x: 18 to 28)
      list.push({
        xMin: LIB_MIN_X, xMax: LIB_MAX_X + 1,
        yMin: LIB_MAX_Y + 0.9, yMax: LIB_MAX_Y + 1.2,
        draw: () => {
          this.models.drawBox(this.ctx, LIB_MIN_X, LIB_MAX_Y + 1, 0, (LIB_MAX_X + 1) - LIB_MIN_X, 0.20, 0.35, wallT, wallL, null, ox, oy);
        }
      });

      // === 5. ZONE 5: SANMIN HIGH SCHOOL (ROW 3 WEST, x: 0..9, y: 33..42) ===
      // Classroom NW Exterior Wall with Windows (along x = 0, y: 33 to 43)
      list.push({
        xMin: -0.15, xMax: 0.35,
        yMin: SCHOOL_MIN_Y, yMax: SCHOOL_MAX_Y + 1,
        draw: () => {
          this.models.drawBox(this.ctx, 0, SCHOOL_MIN_Y, 0, 0.25, (SCHOOL_MAX_Y + 1) - SCHOOL_MIN_Y, H, wallT, null, wallR, ox, oy);

          // Classroom High Windows (y: 35.0 to 37.5 and 38.5 to 41.0, z: 1.15 to 2.15)
          const sw1_0 = isoToScreen(0.26, 35.0, 1.15, ox, oy);
          const sw1_1 = isoToScreen(0.26, 37.5, 1.15, ox, oy);
          const sw1_2 = isoToScreen(0.26, 37.5, 2.15, ox, oy);
          const sw1_3 = isoToScreen(0.26, 35.0, 2.15, ox, oy);
          this.ctx.fillStyle = 'rgba(224, 242, 254, 0.5)';
          this.ctx.beginPath();
          this.ctx.moveTo(sw1_0.x, sw1_0.y); this.ctx.lineTo(sw1_1.x, sw1_1.y); this.ctx.lineTo(sw1_2.x, sw1_2.y); this.ctx.lineTo(sw1_3.x, sw1_3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#0284c7';
          this.ctx.lineWidth = 1.2;
          this.ctx.stroke();

          const sw2_0 = isoToScreen(0.26, 38.5, 1.15, ox, oy);
          const sw2_1 = isoToScreen(0.26, 41.0, 1.15, ox, oy);
          const sw2_2 = isoToScreen(0.26, 41.0, 2.15, ox, oy);
          const sw2_3 = isoToScreen(0.26, 38.5, 2.15, ox, oy);
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

      // Classroom North Partition Wall & Interior Feature Academic Banner (facing South towards camera!)
      list.push({
        xMin: 0, xMax: SCHOOL_MAX_X + 1,
        yMin: SCHOOL_MIN_Y - 0.1, yMax: SCHOOL_MIN_Y + 0.35,
        draw: () => {
          this.models.drawBox(this.ctx, 0, SCHOOL_MIN_Y, 0, (SCHOOL_MAX_X + 1), 0.25, H, wallT, wallL, null, ox, oy, wallR);
        }
      });
      list.push({
        xMin: 3.5, xMax: 6.5, yMin: SCHOOL_MIN_Y + 0.15, yMax: SCHOOL_MIN_Y + 0.35,
        draw: () => {
          this.models.drawInteriorBrandSign(this.ctx, 5.0, SCHOOL_MIN_Y + 0.26, 2.45, 'school', ox, oy);
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
          this.models.drawBox(this.ctx, schoolSE_X, SCHOOL_MIN_Y, 0, 0.25, 36.5 - SCHOOL_MIN_Y, H, wallT, wallL, wallR, ox, oy);
          this.ctx.restore();
        }
      });
      list.push({
        xMin: schoolSE_X - 0.15, xMax: schoolSE_X + 0.35,
        yMin: 38.8, yMax: SCHOOL_MAX_Y + 1,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaSchool < 0.99) this.ctx.globalAlpha = this.wallAlphaSchool;
          this.models.drawBox(this.ctx, schoolSE_X, 38.8, 0, 0.25, (SCHOOL_MAX_Y + 1) - 38.8, H, wallT, wallL, wallR, ox, oy);
          this.ctx.restore();
        }
      });

      // Classroom Interactive Double Doors
      const schoolDoorAngle = this.doorSchoolOpen * 1.35;
      const schoolDoorW = 1.15;
      const sdnTipX = schoolSE_X + Math.sin(schoolDoorAngle) * schoolDoorW;
      const sdnTipY = 36.5 + Math.cos(schoolDoorAngle) * schoolDoorW;
      const sdsTipX = schoolSE_X + Math.sin(schoolDoorAngle) * schoolDoorW;
      const sdsTipY = 38.8 - Math.cos(schoolDoorAngle) * schoolDoorW;
      list.push({
        xMin: Math.min(schoolSE_X, sdnTipX, sdsTipX) - 0.15,
        xMax: Math.max(schoolSE_X, sdnTipX, sdsTipX) + 0.15,
        yMin: 36.4,
        yMax: 38.9,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaSchool < 0.99) this.ctx.globalAlpha = this.wallAlphaSchool;
          this.drawDoorLeaf(schoolSE_X, 36.5, sdnTipX, sdnTipY, ox, oy);
          this.drawDoorLeaf(schoolSE_X, 38.8, sdsTipX, sdsTipY, ox, oy);
          this.ctx.restore();
        }
      });

      // Lintel beam over classroom door
      list.push({
        xMin: schoolSE_X - 0.15, xMax: schoolSE_X + 0.35,
        yMin: 36.45, yMax: 38.85,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaSchool < 0.99) this.ctx.globalAlpha = this.wallAlphaSchool;
          this.models.drawBox(this.ctx, schoolSE_X, 36.5, 2.15, 0.25, 2.3, H - 2.15, wallT, wallL, wallR, ox, oy);
          this.ctx.restore();
        }
      });

      // Sanmin High School Entrance Plaque (Green & Gold)
      list.push({
        xMin: schoolSE_X + 0.15, xMax: schoolSE_X + 0.45,
        yMin: 36.5, yMax: 38.95,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaSchool < 0.99) this.ctx.globalAlpha = this.wallAlphaSchool;
          const plq = isoToScreen(schoolSE_X + 0.26, 37.65, 2.48, ox, oy);
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
          this.ctx.font = 'bold 8.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('三民高中 • 經典教室', 0, 0);
          this.ctx.restore();
          this.ctx.restore();
        }
      });

      // Classroom Interior Props
      // 1. Blackboard
      list.push({
        xMin: 0.1, xMax: 0.8, yMin: 34.0, yMax: 38.0,
        draw: () => this.models.drawSchoolBlackboard(this.ctx, 0.25, 34.0, ox, oy)
      });

      // 2. Teacher Podium
      list.push({
        xMin: 1.2, xMax: 2.4, yMin: 34.2, yMax: 35.1,
        draw: () => this.models.drawTeacherPodium(this.ctx, 1.2, 34.2, ox, oy)
      });

      // 3. Neatly Arranged Student Desks & Chairs (4 columns x 4 rows = 16 desks)
      const sCols = [2.2, 4.4, 6.6, 8.5];
      const sRows = [35.8, 37.4, 39.0, 40.6];
      const bpColors = ['#0284c7', '#ef4444', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4'];
      let dIdx = 0;
      for (const cx of sCols) {
        for (const ry of sRows) {
          const bpColor = bpColors[(dIdx++) % bpColors.length];
          list.push({
            xMin: cx, xMax: cx + 1.25, yMin: ry, yMax: ry + 1.20,
            draw: () => this.models.drawStudentDesk(this.ctx, cx, ry, ox, oy, { backpackColor: bpColor })
          });
        }
      }

      // 4. Classroom Lockers along South Wall
      list.push({
        xMin: 1.5, xMax: 4.0, yMin: 41.8, yMax: 42.5,
        draw: () => this.models.drawClassroomLockers(this.ctx, 1.5, 41.8, ox, oy)
      });

      // 5. Classroom Cork Bulletin Board
      list.push({
        xMin: 4.8, xMax: 7.2, yMin: 42.0, yMax: 42.5,
        draw: () => this.models.drawClassroomBulletinBoard(this.ctx, 4.8, 42.2, ox, oy)
      });

      // 6. Classroom South Boundary Skirting
      list.push({
        xMin: 0, xMax: SCHOOL_MAX_X + 1,
        yMin: SCHOOL_MAX_Y + 0.9, yMax: SCHOOL_MAX_Y + 1.2,
        draw: () => {
          this.models.drawBox(this.ctx, 0, SCHOOL_MAX_Y + 1, 0, (SCHOOL_MAX_X + 1), 0.20, 0.35, wallT, wallL, null, ox, oy);
        }
      });

      // === 6. ZONE 6: DOUYIN / TIKTOK TECH OFFICE (ROW 3 EAST, x: 18..27, y: 33..42) ===
      // Office North Partition Wall with Clerestory Glass (along y = 33, x: 18 to 28)
      list.push({
        xMin: DOUYIN_MIN_X - 0.15, xMax: DOUYIN_MAX_X + 1.0,
        yMin: DOUYIN_MIN_Y - 0.15, yMax: DOUYIN_MIN_Y + 0.35,
        draw: () => {
          this.models.drawBox(this.ctx, DOUYIN_MIN_X, DOUYIN_MIN_Y, 0, (DOUYIN_MAX_X + 1) - DOUYIN_MIN_X, 0.25, H, wallT, wallL, wallR, ox, oy, wallR);

          // Sleek Cyan/Magenta Frosted Clerestory Glass Windows
          const dw1_0 = isoToScreen(20.0, DOUYIN_MIN_Y - 0.01, 1.25, ox, oy);
          const dw1_1 = isoToScreen(23.0, DOUYIN_MIN_Y - 0.01, 1.25, ox, oy);
          const dw1_2 = isoToScreen(23.0, DOUYIN_MIN_Y - 0.01, 2.15, ox, oy);
          const dw1_3 = isoToScreen(20.0, DOUYIN_MIN_Y - 0.01, 2.15, ox, oy);
          this.ctx.fillStyle = 'rgba(37, 244, 238, 0.35)';
          this.ctx.beginPath();
          this.ctx.moveTo(dw1_0.x, dw1_0.y); this.ctx.lineTo(dw1_1.x, dw1_1.y); this.ctx.lineTo(dw1_2.x, dw1_2.y); this.ctx.lineTo(dw1_3.x, dw1_3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#25f4ee';
          this.ctx.lineWidth = 1.2;
          this.ctx.stroke();

          const dw2_0 = isoToScreen(24.0, DOUYIN_MIN_Y - 0.01, 1.25, ox, oy);
          const dw2_1 = isoToScreen(27.0, DOUYIN_MIN_Y - 0.01, 1.25, ox, oy);
          const dw2_2 = isoToScreen(27.0, DOUYIN_MIN_Y - 0.01, 2.15, ox, oy);
          const dw2_3 = isoToScreen(24.0, DOUYIN_MIN_Y - 0.01, 2.15, ox, oy);
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
          this.models.drawInteriorBrandSign(this.ctx, 22.8, DOUYIN_MIN_Y + 0.26, 2.45, 'douyin', ox, oy);
        }
      });

      // Office SE Exterior Wall with Panoramic Windows (along x = 28, y: 33 to 43)
      list.push({
        xMin: DOUYIN_MAX_X + 0.85, xMax: DOUYIN_MAX_X + 1.35,
        yMin: DOUYIN_MIN_Y, yMax: DOUYIN_MAX_Y + 1,
        draw: () => {
          this.models.drawBox(this.ctx, DOUYIN_MAX_X + 1, DOUYIN_MIN_Y, 0, 0.25, (DOUYIN_MAX_Y + 1) - DOUYIN_MIN_Y, H, wallT, wallL, wallR, ox, oy);
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
          this.models.drawBox(this.ctx, douyinNW_X, DOUYIN_MIN_Y, 0, 0.25, 36.5 - DOUYIN_MIN_Y, H, wallT, wallL, wallR, ox, oy);
          this.ctx.restore();
        }
      });
      list.push({
        xMin: douyinNW_X - 0.15, xMax: douyinNW_X + 0.35,
        yMin: 38.8, yMax: DOUYIN_MAX_Y + 1,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaDouyin < 0.99) this.ctx.globalAlpha = this.wallAlphaDouyin;
          this.models.drawBox(this.ctx, douyinNW_X, 38.8, 0, 0.25, (DOUYIN_MAX_Y + 1) - 38.8, H, wallT, wallL, wallR, ox, oy);
          this.ctx.restore();
        }
      });

      // Office Lintel Beam over door (z: 2.15 to H)
      list.push({
        xMin: douyinNW_X - 0.15, xMax: douyinNW_X + 0.35,
        yMin: 36.45, yMax: 38.85,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaDouyin < 0.99) this.ctx.globalAlpha = this.wallAlphaDouyin;
          this.models.drawBox(this.ctx, douyinNW_X, 36.5, 2.15, 0.25, 2.3, H - 2.15, wallT, wallL, wallR, ox, oy);
          this.ctx.restore();
        }
      });

      // Office High-Tech Bi-Parting Smart Glass Sliding Doors
      const douyinSlideOffset = this.doorDouyinOpen * 1.05;
      list.push({
        xMin: douyinNW_X - 0.15, xMax: douyinNW_X + 0.15,
        yMin: 36.4, yMax: 38.9,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaDouyin < 0.99) this.ctx.globalAlpha = this.wallAlphaDouyin;

          // Left leaf (sliding north)
          const dgL0 = isoToScreen(douyinNW_X, 36.55 - douyinSlideOffset, 0, ox, oy);
          const dgL1 = isoToScreen(douyinNW_X, 37.60 - douyinSlideOffset, 0, ox, oy);
          const dgL2 = isoToScreen(douyinNW_X, 37.60 - douyinSlideOffset, 2.10, ox, oy);
          const dgL3 = isoToScreen(douyinNW_X, 36.55 - douyinSlideOffset, 2.10, ox, oy);
          this.ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
          this.ctx.beginPath();
          this.ctx.moveTo(dgL0.x, dgL0.y); this.ctx.lineTo(dgL1.x, dgL1.y); this.ctx.lineTo(dgL2.x, dgL2.y); this.ctx.lineTo(dgL3.x, dgL3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#25f4ee'; // Douyin Cyan edge
          this.ctx.lineWidth = 1.6;
          this.ctx.stroke();

          // Right leaf (sliding south)
          const dgR0 = isoToScreen(douyinNW_X, 37.70 + douyinSlideOffset, 0, ox, oy);
          const dgR1 = isoToScreen(douyinNW_X, 38.75 + douyinSlideOffset, 0, ox, oy);
          const dgR2 = isoToScreen(douyinNW_X, 38.75 + douyinSlideOffset, 2.10, ox, oy);
          const dgR3 = isoToScreen(douyinNW_X, 37.70 + douyinSlideOffset, 2.10, ox, oy);
          this.ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
          this.ctx.beginPath();
          this.ctx.moveTo(dgR0.x, dgR0.y); this.ctx.lineTo(dgR1.x, dgR1.y); this.ctx.lineTo(dgR2.x, dgR2.y); this.ctx.lineTo(dgR3.x, dgR3.y);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#fe2c55'; // Douyin Magenta edge
          this.ctx.lineWidth = 1.6;
          this.ctx.stroke();

          this.ctx.restore();
        }
      });

      // Douyin Office High-Tech Cyber Canopy
      list.push({
        xMin: 17.1, xMax: 18.15,
        yMin: 36.5, yMax: 38.95,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaDouyin < 0.99) this.ctx.globalAlpha = this.wallAlphaDouyin;

          // 1. High-Tech Floating Glass Canopy (Extending outward over the entrance door)
          this.models.drawBox(this.ctx, 17.2, 36.5, 2.20, 0.85, 2.30, 0.15, '#0f172a', '#25f4ee', '#1e293b', ox, oy);

          // 2. Cyan / Magenta Edge Illumination on Canopy Underside
          const ug0 = isoToScreen(17.2, 36.5, 2.20, ox, oy);
          const ug1 = isoToScreen(18.0, 36.5, 2.20, ox, oy);
          const ug2 = isoToScreen(18.0, 38.8, 2.20, ox, oy);
          const ug3 = isoToScreen(17.2, 38.8, 2.20, ox, oy);
          this.ctx.fillStyle = 'rgba(37, 244, 238, 0.20)';
          this.ctx.beginPath();
          this.ctx.moveTo(ug0.x, ug0.y); this.ctx.lineTo(ug1.x, ug1.y); this.ctx.lineTo(ug2.x, ug2.y); this.ctx.lineTo(ug3.x, ug3.y);
          this.ctx.closePath();
          this.ctx.fill();

          this.ctx.restore();
        }
      });

      // Douyin Office Campus Landmark Monument Totem (Standing proudly on the entrance lawn facing courtyard)
      list.push({
        xMin: 16.4, xMax: 17.2,
        yMin: 39.1, yMax: 39.6,
        draw: () => this.models.drawEntranceTotem(this.ctx, 16.5, 39.2, 'douyin', ox, oy)
      });

      // Official TikTok Circular Tech Floor Emblem (High-resolution ground decal with chromatic shift)
      list.push({
        xMin: 21.3, xMax: 24.3, yMin: 36.0, yMax: 39.0,
        draw: () => this.models.drawTikTokFloorEmblem(this.ctx, 22.8, 37.5, 1.5, ox, oy)
      });

      // Douyin Office Props: 6 Modern Developer Workstations with Ultrawide Displays & Aeron Chairs
      // North Pod
      list.push({
        xMin: 19.2, xMax: 21.4, yMin: 34.4, yMax: 35.8,
        draw: () => this.models.drawOfficeWorkstation(this.ctx, 19.2, 34.4, ox, oy)
      });
      list.push({
        xMin: 22.2, xMax: 24.4, yMin: 34.4, yMax: 35.8,
        draw: () => this.models.drawOfficeWorkstation(this.ctx, 22.2, 34.4, ox, oy, { isStanding: true })
      });
      list.push({
        xMin: 25.2, xMax: 27.4, yMin: 34.4, yMax: 35.8,
        draw: () => this.models.drawOfficeWorkstation(this.ctx, 25.2, 34.4, ox, oy)
      });
      // South Pod
      list.push({
        xMin: 19.2, xMax: 21.4, yMin: 40.2, yMax: 41.6,
        draw: () => this.models.drawOfficeWorkstation(this.ctx, 19.2, 40.2, ox, oy)
      });
      list.push({
        xMin: 22.2, xMax: 24.4, yMin: 40.2, yMax: 41.6,
        draw: () => this.models.drawOfficeWorkstation(this.ctx, 22.2, 40.2, ox, oy)
      });
      list.push({
        xMin: 25.2, xMax: 27.4, yMin: 40.2, yMax: 41.6,
        draw: () => this.models.drawOfficeWorkstation(this.ctx, 25.2, 40.2, ox, oy, { isStanding: true })
      });

      // Glass Conference & Brainstorming Table
      list.push({
        xMin: 24.5, xMax: 27.2, yMin: 36.8, yMax: 38.3,
        draw: () => this.models.drawOfficeMeetingTable(this.ctx, 24.5, 36.8, ox, oy)
      });

      // AI Compute Cluster / Server Rig
      list.push({
        xMin: 26.2, xMax: 27.4, yMin: 33.6, yMax: 35.0,
        draw: () => this.models.drawOfficeServerStation(this.ctx, 26.2, 33.6, ox, oy)
      });

      // Office Tech Coffee & Refreshment Bar
      list.push({
        xMin: 26.4, xMax: 27.8, yMin: 38.5, yMax: 39.8,
        draw: () => this.models.drawOfficeCoffeeBar(this.ctx, 26.4, 38.5, ox, oy)
      });

      // Douyin Office South Boundary Skirting
      list.push({
        xMin: DOUYIN_MIN_X, xMax: DOUYIN_MAX_X + 1,
        yMin: DOUYIN_MAX_Y + 0.9, yMax: DOUYIN_MAX_Y + 1.2,
        draw: () => {
          this.models.drawBox(this.ctx, DOUYIN_MIN_X, DOUYIN_MAX_Y + 1, 0, (DOUYIN_MAX_X + 1) - DOUYIN_MIN_X, 0.20, 0.35, wallT, wallL, null, ox, oy);
        }
      });

      // === 7. CENTRAL COURTYARD & SOUTH AVENUE: BENCHES, FOUNTAIN & TREES ===
      // Fountain
      list.push({
        xMin: 13.0, xMax: 16.0, yMin: 13.0, yMax: 16.0,
        draw: () => this.models.drawGrandFountain(this.ctx, 13.0, 13.0, ox, oy)
      });

      // Refined Park Benches (Placed on grass, completely clear of all pathways)
      const benches = [
        { gx: 13.5, gy: 9.5 },  // North Plaza Lawn (facing fountain from grass, clear of east-west path)
        { gx: 13.5, gy: 17.5 }, // South Plaza Lawn (facing fountain from grass, clear of south path)
        { gx: 22.0, gy: 13.5 }, // East Central Lawn (peaceful reading bench between AI Studio and Library)
        { gx: 5.0,  gy: 12.5 }, // Ludwig's South Garden Terrace (private lawn bench below house terrace)
        { gx: 13.5, gy: 30.5 }  // South Promenade Lawn (scenic rest area between Classroom and Office)
      ];
      benches.forEach(b => {
        list.push({
          xMin: b.gx, xMax: b.gx + 1.6, yMin: b.gy, yMax: b.gy + 0.65,
          draw: () => this.models.drawParkBench(this.ctx, b.gx, b.gy, ox, oy)
        });
      });

      // Garden Stone Chess Table & Drum Stools (Ludwig's South Lawn Terrace)
      list.push({
        xMin: 2.5, xMax: 4.8, yMin: 13.5, yMax: 15.5,
        draw: () => this.models.drawGardenChessTable(this.ctx, 2.8, 13.8, ox, oy)
      });

      // Lush Flowering Trees (Beautifying gardens and park lawns, with all corridors, pathways & doorways 100% open)
      const trees = [
        [13, 2], [16, 2],       // North garden lawn (well north of path y=5)
        [14, 8],                // North-central lawn pocket (between path y=6 and fountain)
        [16, 18],               // South-central lawn pocket (flanking south park bench on the right)
        [13, 25], [16, 25],     // South garden lawn (well south of path y=22)
        [20, 12], [24, 12],     // East central lawn north grove
        [21, 15], [25, 15],     // East central lawn south grove
        [13, 28], [16, 28],     // South promenade entrance trees
        [13, 35], [16, 35]      // South avenue central boulevard grove
      ];
      trees.forEach(([tx, ty]) => {
        list.push({
          xMin: tx, xMax: tx + 1.0, yMin: ty, yMax: ty + 1.0,
          draw: () => this.models.drawTree(this.ctx, tx, ty, ox, oy)
        });
      });

      // === 5. CHARACTERS ===
      this.charManager.characters.forEach(c => {
        list.push({
          isChar: true,
          xMin: c.x - 0.25, xMax: c.x + 0.25,
          yMin: c.y - 0.25, yMax: c.y + 0.25,
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

      if (this.currentTimeState === 'sunset') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, 'rgba(249, 115, 22, 0.18)');
        grad.addColorStop(0.5, 'rgba(236, 72, 153, 0.14)');
        grad.addColorStop(1, 'rgba(124, 58, 237, 0.18)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else if (this.currentTimeState === 'night') {
        const rad = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.9);
        rad.addColorStop(0, 'rgba(15, 23, 42, 0.32)');
        rad.addColorStop(1, 'rgba(2, 6, 23, 0.72)');
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, w, h);
      } else if (this.currentTimeState === 'galaxy') {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, 'rgba(88, 28, 135, 0.38)');
        grad.addColorStop(0.5, 'rgba(30, 27, 75, 0.48)');
        grad.addColorStop(1, 'rgba(15, 23, 42, 0.65)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
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
      ctx.translate(ox, oy);
      ctx.scale(this.zoom, this.zoom);
      ctx.translate(-ox, -oy);

      // 1. Draw Map Terrain
      this.drawTerrain(ctx, ox, oy);

      // 2. Collect and Sort Entities
      const entities = this.collectWorldEntities(ox, oy);
      const sorted = sortIsometricEntities(entities);

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
