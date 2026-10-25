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

      // Day / Night mood
      this.mood = 'auto';
      this.currentTimeState = 'day';

      // Door Proximity Progress (0 = closed, 1 = fully open)
      this.doorLudwigOpen = 0.0;
      this.doorLudwigSideOpen = 0.0;
      this.doorDormOpen = 0.0;
      this.doorAiOpen = 0.0;
      this.doorLibOpen = 0.0;

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
      this.nav.setBlock(HOUSE_MAX_X, 0, 1, 4, true);
      this.nav.setBlock(HOUSE_MAX_X, 7, 1, 3, true);
      this.nav.setBlock(0, HOUSE_MAX_Y, 4, 1, true);
      this.nav.setBlock(7, HOUSE_MAX_Y, 3, 1, true);

      this.nav.setBlock(1, 1, 2.2, 2.3, true);   // Master Bed
      this.nav.setBlock(6, 1, 2.5, 1.2, true);   // Desk
      this.nav.setBlock(0, 3.8, 0.8, 2.6, true); // Bookshelf
      this.nav.setBlock(2, 5, 2.5, 2.0, true);   // Sofa & Rug
      this.nav.setBlock(6, 5, 2.0, 1.8, true);   // Dining Table

      // 2. Men's Dormitory 11 Room 211 (SW: x: 0..9, y: 17..26)
      this.nav.setBlock(0, DORM_MIN_Y, 10, 0.6, true);           // NE Wall
      this.nav.setBlock(0, DORM_MIN_Y, 0.6, 10, true);           // NW Wall
      this.nav.setBlock(DORM_MAX_X + 1, DORM_MIN_Y, 0.6, 3.5, true);  // SE Wall Top
      this.nav.setBlock(DORM_MAX_X + 1, 22.8, 0.6, 4.2, true);        // SE Wall Bottom
      this.nav.setBlock(0, DORM_MAX_Y + 1, 10, 0.6, true);       // SW Wall

      // 4 Loft Bed/Desk Combos
      this.nav.setBlock(1.0, 17.5, 2.2, 1.6, true);   // Happy Wang (Bed 1)
      this.nav.setBlock(6.2, 17.5, 2.2, 1.6, true);   // Clark Wu (Bed 3)
      this.nav.setBlock(1.0, 24.5, 2.2, 1.6, true);   // Kerry Chang (Bed 2)
      this.nav.setBlock(6.2, 24.5, 2.2, 1.6, true);   // Jerry Chung (Bed 4)
      this.nav.setBlock(3.6, 20.8, 1.9, 2.0, true);   // Dorm Lounge Classic Sofa & Table

      // 3. Ludwigia AI Research Studio (NE: x: 18..27, y: 0..9)
      this.nav.setBlock(AI_MIN_X, 0, 10, 1, true);
      this.nav.setBlock(AI_MIN_X, 0, 1, 4.5, true);
      this.nav.setBlock(AI_MIN_X, 7.0, 1, 3.0, true);
      this.nav.setBlock(AI_MAX_X + 1, 0, 1, 10, true);
      this.nav.setBlock(AI_MIN_X, AI_MAX_Y + 1, 10, 1, true);

      this.nav.setBlock(19.5, 1.2, 2.0, 1.4, true); // Server Cabinets
      this.nav.setBlock(23.5, 1.2, 2.5, 1.4, true); // AI Command Desk
      this.nav.setBlock(26.2, 4.0, 0.8, 2.5, true); // Whiteboard
      this.nav.setBlock(19.5, 7.2, 1.8, 1.4, true); // Espresso Bar
      this.nav.setBlock(23.5, 6.8, 2.2, 1.6, true); // Lounge Pod

      // 4. Zone 4: Ludwigia Grand Library (SE: 18..27, 17..26)
      this.nav.setBlock(LIB_MIN_X, LIB_MIN_Y, 10, 1, true); // North Wall
      this.nav.setBlock(LIB_MIN_X, LIB_MIN_Y, 1, 3.5, true); // West Wall Top
      this.nav.setBlock(LIB_MIN_X, 22.8, 1, 4.2, true); // West Wall Bottom
      this.nav.setBlock(LIB_MAX_X + 1, LIB_MIN_Y, 1, 10, true); // East Wall
      this.nav.setBlock(LIB_MIN_X, LIB_MAX_Y + 1, 10, 1, true); // South Wall

      this.nav.setBlock(19.8, 17.2, 7.2, 0.8, true); // Grand Book Walls
      this.nav.setBlock(20.0, 20.0, 2.5, 1.4, true); // Long Banker Study Table
      this.nav.setBlock(23.8, 22.0, 2.2, 2.0, true); // Wingback Reading Nook
      this.nav.setBlock(20.5, 23.8, 1.0, 1.0, true); // Celestial Armillary Globe
      this.nav.setBlock(24.8, 19.2, 1.0, 1.0, true); // Botanical Terrarium Pedestal

      // 5. Central Plaza & Park
      this.nav.setBlock(13, 13, 3, 3, true); // Fountain

      // Park Benches
      this.nav.setBlock(11, 10, 1.6, 0.7, true);
      this.nav.setBlock(16, 10, 1.6, 0.7, true);
      this.nav.setBlock(11, 17, 1.6, 0.7, true);
      this.nav.setBlock(16, 17, 1.6, 0.7, true);

      // Trees (doorway entrances at [11, 6] and [11, 21] kept completely open)
      const treeBlocks = [
        [11, 2], [14, 2], [16, 2],
        [16, 6],
        [11, 14], [16, 14],
        [16, 21],
        [11, 25], [14, 25], [16, 25],
        [20, 13], [24, 13]
      ];
      treeBlocks.forEach(([tx, ty]) => this.nav.setBlock(tx, ty, 1.2, 1.2, true));
    }

    initParticles() {
      for (let i = 0; i < 45; i++) {
        this.particles.push({
          x: 9 + Math.random() * 16,
          y: 1 + Math.random() * 25,
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
        statusMessage = "Ludwig's House • 溫馨客廳與起居室";
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
        statusMessage = "Grand Library • 知識藏書閣與典雅閱覽室";
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

        if (this.nav.isWalkableRadius(nx, ny, 0.32)) {
          player.x = nx;
          player.y = ny;
          player.facing = kx >= ky ? 1 : -1;
          playerActuallyMoved = true;
        } else if (this.nav.isWalkableRadius(nx, player.y, 0.32)) {
          player.x = nx;
          player.facing = kx >= 0 ? 1 : -1;
          playerActuallyMoved = true;
        } else if (this.nav.isWalkableRadius(player.x, ny, 0.32)) {
          player.y = ny;
          player.facing = ky >= 0 ? 1 : -1;
          playerActuallyMoved = true;
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
              // Natural short rest between wanderings (1.2 to 3.2 seconds)
              c.timer = 1.2 + Math.random() * 2.0;
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
              if (c.zone === 'house') {
                targetX = 1.5 + Math.random() * 7.0;
                targetY = 1.5 + Math.random() * 7.0;
              } else if (c.zone === 'dorm_211') {
                // Men's Dorm 11 Room 211 crew wandering ecosystem:
                // Happy Wang, Kerry Chang, Clark Wu, Jerry Chung, Billy Fang
                // They hang out inside 211 (desks, loft beds, classic sofa lounge, aisle)
                // AND stroll outside 211 (stone porch, garden walkway, cherry tree grove, fountain approach)!
                const isInside = c.x < 9.6;
                // If currently inside, 45% chance to venture outside; if outside, 50% chance to head back in
                const targetOutside = isInside ? (Math.random() < 0.45) : (Math.random() < 0.52);

                if (targetOutside) {
                  // Outdoor area around 211:
                  const outdoorAnchors = [
                    { x: 11.0, y: 21.6 }, // Outdoor porch / doorway threshold
                    { x: 12.2, y: 21.6 }, // Walkway intersection outside 211
                    { x: 12.0, y: 18.8 }, // Near north cherry tree & park bench
                    { x: 12.0, y: 24.2 }, // Southwest lawn walkway
                    { x: 13.6, y: 20.2 }, // Approach to central fountain promenade
                    { x: 13.6, y: 22.8 }  // South garden promenade
                  ];

                  if (Math.random() < 0.5) {
                    const spot = outdoorAnchors[Math.floor(Math.random() * outdoorAnchors.length)];
                    targetX = spot.x + (Math.random() - 0.5) * 0.8;
                    targetY = spot.y + (Math.random() - 0.5) * 0.8;
                  } else {
                    targetX = 10.6 + Math.random() * 3.6;
                    targetY = 18.2 + Math.random() * 6.3;
                  }
                } else {
                  // Indoor Dorm 211:
                  const indoorAnchors = [
                    { x: 2.5, y: 19.8 }, // Bed 1 (Happy Wang)
                    { x: 2.5, y: 23.6 }, // Bed 2 (Kerry Chang)
                    { x: 7.0, y: 19.8 }, // Bed 3 (Clark Wu)
                    { x: 7.0, y: 23.6 }, // Bed 4 (Jerry Chung)
                    { x: 2.8, y: 21.6 }, // Common Lounge (Billy Fang & Guitar)
                    { x: 4.8, y: 19.8 }, // North aisle
                    { x: 4.8, y: 23.6 }, // South aisle
                    { x: 8.5, y: 21.6 }  // Inside doorway threshold
                  ];

                  if (Math.random() < 0.5) {
                    const spot = indoorAnchors[Math.floor(Math.random() * indoorAnchors.length)];
                    targetX = spot.x + (Math.random() - 0.5) * 0.6;
                    targetY = spot.y + (Math.random() - 0.5) * 0.6;
                  } else {
                    targetX = 2.2 + Math.random() * 6.4;
                    targetY = 18.5 + Math.random() * 6.5;
                  }
                }
              } else if (c.zone === 'ai_studio') {
                targetX = 19.5 + Math.random() * 6.5;
                targetY = 2.0 + Math.random() * 6.5;
              } else if (c.zone === 'library') {
                targetX = 19.8 + Math.random() * 6.5;
                targetY = 18.5 + Math.random() * 6.5;
              } else {
                targetX = 11.5 + Math.random() * 6.0;
                targetY = 9.0 + Math.random() * 11.0;
              }

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
          p.y = 1 + Math.random() * 25;
        }
      });
    }

    // --- Terrain Renderer for 28x28 Campus ---
    drawTerrain(ctx, ox, oy) {
      for (let x = 0; x < MAP_W; x++) {
        for (let y = 0; y < MAP_H; y++) {
          const isLudwig = (x <= HOUSE_MAX_X && y <= HOUSE_MAX_Y);
          const isDorm = (x <= DORM_MAX_X && y >= DORM_MIN_Y && y <= DORM_MAX_Y);
          const isAi = (x >= AI_MIN_X && x <= AI_MAX_X && y >= AI_MIN_Y && y <= AI_MAX_Y);
          const isLib = (x >= LIB_MIN_X && x <= LIB_MAX_X && y >= LIB_MIN_Y && y <= LIB_MAX_Y);
          const isInsideBuilding = isLudwig || isDorm || isAi || isLib;

          // Cobblestone Pathways connecting doorways and central plaza
          const isPath = (
            (x >= 10 && x <= 11 && y >= 4 && y <= 23) ||
            (y >= 5 && y <= 6 && x >= 10 && x <= 19) ||
            (x >= 12 && x <= 16 && y >= 12 && y <= 16) ||
            (y >= 20 && y <= 22 && x >= 10 && x <= 19)
          );

          ctx.save();
          if (this.currentZone === 'ludwig_house' && !isLudwig) ctx.globalAlpha = this.outsideAlpha;
          else if (this.currentZone === 'dorm_211' && !isDorm) ctx.globalAlpha = this.outsideAlpha;
          else if (this.currentZone === 'ai_studio' && !isAi) ctx.globalAlpha = this.outsideAlpha;
          else if (this.currentZone === 'library' && !isLib) ctx.globalAlpha = this.outsideAlpha;

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
      // SE Doorway Lintel Beam (z: 2.15 to H) & Mounted Lintel Plaque
      list.push({
        xMin: HOUSE_MAX_X + 0.85, xMax: HOUSE_MAX_X + 1.35,
        yMin: 4.5, yMax: 6.8,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaHouse < 0.99) this.ctx.globalAlpha = this.wallAlphaHouse;
          this.models.drawBox(this.ctx, HOUSE_MAX_X + 1, 4.5, 2.15, 0.25, 2.3, H - 2.15, wallT, wallL, wallR, ox, oy);
          const plq = isoToScreen(HOUSE_MAX_X + 1, 5.65, 2.40, ox, oy);
          this.ctx.save();
          this.ctx.translate(plq.x, plq.y);
          this.ctx.transform(1, -0.5, 0, 1, 0, 0);
          this.ctx.fillStyle = '#1e293b';
          this.ctx.fillRect(-30, -9, 60, 18);
          this.ctx.strokeStyle = '#94a3b8';
          this.ctx.lineWidth = 1.2;
          this.ctx.strokeRect(-30, -9, 60, 18);
          this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
          this.ctx.lineWidth = 0.8;
          this.ctx.strokeRect(-28, -7, 56, 14);
          this.ctx.fillStyle = '#f8fafc';
          this.ctx.font = 'bold 8.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('LUDWIGIA', 0, 0);
          this.ctx.restore();
          this.ctx.restore();
        }
      });

      // Interactive Double Doors (Ludwig's House)
      const doorAngle1 = this.doorLudwigOpen * 1.35;
      const doorW = 1.15;
      const hx = HOUSE_MAX_X + 1.0;
      const nTipX = hx + Math.sin(doorAngle1) * doorW;
      const nTipY = 4.5 + Math.cos(doorAngle1) * doorW;
      list.push({
        xMin: Math.min(hx, nTipX) - 0.1, xMax: Math.max(hx, nTipX) + 0.1,
        yMin: 4.4, yMax: Math.max(4.5 + doorW, nTipY) + 0.1,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaHouse < 0.99) this.ctx.globalAlpha = this.wallAlphaHouse;
          this.drawDoorLeaf(hx, 4.5, nTipX, nTipY, ox, oy);
          this.ctx.restore();
        }
      });
      const sTipX = hx + Math.sin(doorAngle1) * doorW;
      const sTipY = 6.8 - Math.cos(doorAngle1) * doorW;
      list.push({
        xMin: Math.min(hx, sTipX) - 0.1, xMax: Math.max(hx, sTipX) + 0.1,
        yMin: Math.min(6.8 - doorW, sTipY) - 0.1, yMax: 6.9,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaHouse < 0.99) this.ctx.globalAlpha = this.wallAlphaHouse;
          this.drawDoorLeaf(hx, 6.8, sTipX, sTipY, ox, oy);
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
          if (this.wallAlphaHouse < 0.99) this.ctx.globalAlpha = this.wallAlphaHouse;
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
          if (this.wallAlphaHouse < 0.99) this.ctx.globalAlpha = this.wallAlphaHouse;
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
          this.models.drawBox(this.ctx, 0, DORM_MIN_Y, 0, (DORM_MAX_X + 1), 0.25, H, wallT, wallL, null, ox, oy);
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
      // Lintel beam over door (z: 2.15 to H) & Mounted Lintel Plaque
      list.push({
        xMin: dormSE_X - 0.15, xMax: dormSE_X + 0.35,
        yMin: 20.5, yMax: 22.8,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaDorm < 0.99) this.ctx.globalAlpha = this.wallAlphaDorm;
          this.models.drawBox(this.ctx, dormSE_X, 20.5, 2.15, 0.25, 2.3, H - 2.15, wallT, wallL, wallR, ox, oy);
          const plq = isoToScreen(dormSE_X, 21.65, 2.40, ox, oy);
          this.ctx.save();
          this.ctx.translate(plq.x, plq.y);
          this.ctx.transform(1, -0.5, 0, 1, 0, 0);
          this.ctx.fillStyle = '#1e3a8a';
          this.ctx.fillRect(-28, -9, 56, 18);
          this.ctx.strokeStyle = '#38bdf8';
          this.ctx.lineWidth = 1.2;
          this.ctx.strokeRect(-28, -9, 56, 18);
          this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          this.ctx.lineWidth = 0.8;
          this.ctx.strokeRect(-26, -7, 52, 14);
          this.ctx.fillStyle = '#f0f9ff';
          this.ctx.font = 'bold 8.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('男11 211', 0, 0);
          this.ctx.restore();
          this.ctx.restore();
        }
      });

      // Dorm Interactive Door with Mounted "男11 211" Plaque
      const dormDoorAngle = this.doorDormOpen * 1.35;
      const dTipX = dormSE_X + Math.sin(dormDoorAngle) * 1.15;
      const dTipY = 20.5 + Math.cos(dormDoorAngle) * 1.15;
      list.push({
        xMin: Math.min(dormSE_X, dTipX) - 0.1, xMax: Math.max(dormSE_X, dTipX) + 0.1,
        yMin: 20.4, yMax: 22.9,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaDorm < 0.99) this.ctx.globalAlpha = this.wallAlphaDorm;
          this.drawDoorLeaf(dormSE_X, 20.5, dTipX, dTipY, ox, oy, '男11 211');
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
      // AI Studio Neon Plaque & Lintel (Sheared along Y axis -0.5 slope)
      list.push({
        xMin: AI_MIN_X - 0.15, xMax: AI_MIN_X + 0.35,
        yMin: 4.5, yMax: 6.8,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaAi < 0.99) this.ctx.globalAlpha = this.wallAlphaAi;
          this.models.drawBox(this.ctx, AI_MIN_X, 4.5, 2.15, 0.25, 2.3, H - 2.15, wallT, wallL, wallR, ox, oy);
          const plq = isoToScreen(AI_MIN_X, 5.65, 2.40, ox, oy);
          this.ctx.save();
          this.ctx.translate(plq.x, plq.y);
          this.ctx.transform(1, -0.5, 0, 1, 0, 0);
          this.ctx.fillStyle = '#0f172a';
          this.ctx.fillRect(-32, -9, 64, 18);
          this.ctx.strokeStyle = '#06b6d4';
          this.ctx.lineWidth = 1.2;
          this.ctx.strokeRect(-32, -9, 64, 18);
          this.ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
          this.ctx.lineWidth = 0.8;
          this.ctx.strokeRect(-30, -7, 60, 14);
          this.ctx.fillStyle = '#22d3ee';
          this.ctx.font = 'bold 8.5px monospace';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('AI STUDIO', 0, 0);
          this.ctx.restore();
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
          const dg2 = isoToScreen(AI_MIN_X, 6.7 + aiSlideOffset, 2.15, ox, oy);
          const dg3 = isoToScreen(AI_MIN_X, 4.6 + aiSlideOffset, 2.15, ox, oy);
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

      // === 4. ZONE 4: LUDWIGIA GRAND LIBRARY & BOTANICAL READING HALL ===
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
      list.push({
        xMin: LIB_MIN_X - 0.15, xMax: LIB_MIN_X + 0.35,
        yMin: 20.5, yMax: 22.8,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaLib < 0.99) this.ctx.globalAlpha = this.wallAlphaLib;
          this.models.drawBox(this.ctx, LIB_MIN_X, 20.5, 2.15, 0.25, 2.3, H - 2.15, wallT, wallL, wallR, ox, oy);
          const plq = isoToScreen(LIB_MIN_X, 21.65, 2.40, ox, oy);
          this.ctx.save();
          this.ctx.translate(plq.x, plq.y);
          this.ctx.transform(1, -0.5, 0, 1, 0, 0);
          this.ctx.fillStyle = '#451a03';
          this.ctx.fillRect(-36, -9, 72, 18);
          this.ctx.strokeStyle = '#d97706';
          this.ctx.lineWidth = 1.2;
          this.ctx.strokeRect(-36, -9, 72, 18);
          this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
          this.ctx.lineWidth = 0.8;
          this.ctx.strokeRect(-34, -7, 68, 14);
          this.ctx.fillStyle = '#fbbf24';
          this.ctx.font = 'bold 8.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('GRAND LIBRARY', 0, 0);
          this.ctx.restore();
          this.ctx.restore();
        }
      });

      // Library Double Mahogany Swinging Doors
      const libDoorAngle = this.doorLibOpen * 1.35;
      const libTipX = LIB_MIN_X + Math.sin(libDoorAngle) * 1.15;
      const libTipY = 20.5 + Math.cos(libDoorAngle) * 1.15;
      list.push({
        xMin: Math.min(LIB_MIN_X, libTipX) - 0.1, xMax: Math.max(LIB_MIN_X, libTipX) + 0.1,
        yMin: 20.4, yMax: 22.9,
        draw: () => {
          this.ctx.save();
          if (this.wallAlphaLib < 0.99) this.ctx.globalAlpha = this.wallAlphaLib;
          this.drawDoorLeaf(LIB_MIN_X, 20.5, libTipX, libTipY, ox, oy);
          this.ctx.restore();
        }
      });

      // Library Interior Furniture:
      // 1. Grand Mahogany Book Walls with Brass Rolling Ladder
      list.push({
        xMin: 19.8, xMax: 23.2, yMin: 17.2, yMax: 18.0,
        draw: () => this.models.drawLibraryBookWall(this.ctx, 19.8, 17.2, ox, oy)
      });
      list.push({
        xMin: 23.6, xMax: 27.0, yMin: 17.2, yMax: 18.0,
        draw: () => this.models.drawLibraryBookWall(this.ctx, 23.6, 17.2, ox, oy)
      });

      // 2. Long Walnut Banker's Study Table with Emerald Lamp
      list.push({
        xMin: 20.0, xMax: 22.6, yMin: 20.0, yMax: 21.4,
        draw: () => this.models.drawBankerDesk(this.ctx, 20.0, 20.0, ox, oy)
      });

      // 3. Tufted Leather Wingback Reading Nook & Rug
      list.push({
        xMin: 23.8, xMax: 26.2, yMin: 22.0, yMax: 24.2,
        draw: () => this.models.drawWingbackReadingNook(this.ctx, 23.8, 22.0, ox, oy)
      });

      // 4. Standing Brass Celestial Armillary Globe
      list.push({
        xMin: 20.2, xMax: 21.4, yMin: 23.6, yMax: 24.8,
        draw: () => this.models.drawCelestialGlobe(this.ctx, 20.8, 24.2, ox, oy)
      });

      // 5. Botanical Terrarium Pedestal
      list.push({
        xMin: 24.8, xMax: 26.0, yMin: 19.2, yMax: 20.4,
        draw: () => this.models.drawTerrarium(this.ctx, 24.8, 19.2, ox, oy)
      });

      // === 5. CENTRAL COURTYARD: BENCHES, FOUNTAIN & TREES ===
      // Fountain
      list.push({
        xMin: 13.0, xMax: 16.0, yMin: 13.0, yMax: 16.0,
        draw: () => this.models.drawGrandFountain(this.ctx, 13.0, 13.0, ox, oy)
      });

      // Refined Park Benches
      const benches = [
        { gx: 11, gy: 10 }, { gx: 16, gy: 10 },
        { gx: 11, gy: 17 }, { gx: 16, gy: 17 }
      ];
      benches.forEach(b => {
        list.push({
          xMin: b.gx, xMax: b.gx + 1.6, yMin: b.gy, yMax: b.gy + 0.65,
          draw: () => this.models.drawParkBench(this.ctx, b.gx, b.gy, ox, oy)
        });
      });

      // Lush Flowering Trees (Doorway entrances kept open and unobstructed)
      const trees = [
        [11, 2], [14, 2], [16, 2],
        [16, 6],
        [11, 14], [16, 14],
        [16, 21],
        [11, 25], [14, 25], [16, 25],
        [20, 13], [24, 13]
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
      const gp2 = isoToScreen(hx + dx * 0.88, hy + dy * 0.88, 2.02, ox, oy);
      const gp3 = isoToScreen(hx + dx * 0.12, hy + dy * 0.12, 2.02, ox, oy);
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
