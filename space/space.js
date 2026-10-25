/**
 * space.js — Ludwig's World & Studio (2.5D Isometric World)
 * 
 * Enhanced with:
 * - Dynamic Indoor/Outdoor Camera Zoom & Opacity Dimming
 * - Smooth 8-Directional Diagonal A* Pathfinding with Line-of-Sight Smoothing
 * - Anti-Crowding Social Distance Separation Force (1.5 ~ 2.0 tiles)
 * - Large 10x10 Detailed Family House (Bed, Desk, Bookshelves, Sofas, Art, Kitchen)
 * - Expansive Courtyard with Grand Multi-Tiered Fountain & 12+ Trees
 * - Minimalist, Non-Intrusive Floating Name Tags
 */

(() => {
  'use strict';

  // --- Map Constants ---
  const TW = 64; // Tile width
  const TH = 32; // Tile height
  const MAP_W = 22;
  const MAP_H = 22;
  const HOUSE_MAX_X = 9;
  const HOUSE_MAX_Y = 9;

  // Iso projection
  function isoToScreen(gx, gy, gz = 0, ox = 0, oy = 0) {
    return {
      x: ox + (gx - gy) * (TW / 2),
      y: oy + (gx + gy) * (TH / 2) - gz * TH
    };
  }

  function screenToIso(sx, sy, ox = 0, oy = 0) {
    const dx = sx - ox;
    const dy = sy - oy;
    return {
      gx: (dx / (TW / 2) + dy / (TH / 2)) / 2,
      gy: (dy / (TH / 2) - dx / (TW / 2)) / 2
    };
  }

  // --- 8-Directional Smooth A* Pathfinding ---
  class NavGrid {
    constructor(w, h) {
      this.w = w;
      this.h = h;
      this.blocked = Array(w).fill(0).map(() => Array(h).fill(false));
    }

    setBlock(x, y, bw = 1, bh = 1, isBlocked = true) {
      for (let ix = Math.floor(x); ix < x + bw && ix < this.w; ix++) {
        for (let iy = Math.floor(y); iy < y + bh && iy < this.h; iy++) {
          if (ix >= 0 && iy >= 0) this.blocked[ix][iy] = isBlocked;
        }
      }
    }

    isWalkable(gx, gy) {
      const ix = Math.floor(gx);
      const iy = Math.floor(gy);
      if (ix < 0 || iy < 0 || ix >= this.w || iy >= this.h) return false;
      return !this.blocked[ix][iy];
    }

    isWalkableRadius(gx, gy, r = 0.32) {
      return this.isWalkable(gx - r, gy - r) &&
             this.isWalkable(gx + r, gy - r) &&
             this.isWalkable(gx - r, gy + r) &&
             this.isWalkable(gx + r, gy + r);
    }

    // Line of sight check for diagonal smoothing
    hasLineOfSight(x0, y0, x1, y1) {
      const dx = Math.abs(x1 - x0);
      const dy = Math.abs(y1 - y0);
      let x = Math.floor(x0);
      let y = Math.floor(y0);
      let n = 1 + dx + dy;
      const x_inc = (x1 > x0) ? 1 : -1;
      const y_inc = (y1 > y0) ? 1 : -1;
      let error = dx - dy;

      for (; n > 0; --n) {
        if (!this.isWalkable(x, y)) return false;
        if (error > 0) {
          x += x_inc;
          error -= dy * 2;
        } else {
          y += y_inc;
          error += dx * 2;
        }
      }
      return true;
    }

    findPath(start, goal) {
      const sx = Math.max(0, Math.min(this.w - 1, Math.floor(start.x)));
      const sy = Math.max(0, Math.min(this.h - 1, Math.floor(start.y)));
      let gx = Math.max(0, Math.min(this.w - 1, Math.floor(goal.x)));
      let gy = Math.max(0, Math.min(this.h - 1, Math.floor(goal.y)));

      if (this.blocked[gx][gy]) {
        const neighbors = [
          { x: gx + 1, y: gy }, { x: gx - 1, y: gy },
          { x: gx, y: gy + 1 }, { x: gx, y: gy - 1 },
          { x: gx + 1, y: gy + 1 }, { x: gx - 1, y: gy - 1 }
        ];
        const free = neighbors.find(n => this.isWalkable(n.x, n.y));
        if (free) { gx = free.x; gy = free.y; }
        else return [{ x: sx + 0.5, y: sy + 0.5 }];
      }

      const open = [{ x: sx, y: sy, g: 0, f: 0, parent: null }];
      const closed = new Set();
      const key = (x, y) => `${x},${y}`;

      const dirs = [
        { x: 1, y: 0, c: 1.0 }, { x: -1, y: 0, c: 1.0 },
        { x: 0, y: 1, c: 1.0 }, { x: 0, y: -1, c: 1.0 },
        { x: 1, y: 1, c: 1.414 }, { x: 1, y: -1, c: 1.414 },
        { x: -1, y: 1, c: 1.414 }, { x: -1, y: -1, c: 1.414 }
      ];

      while (open.length > 0) {
        open.sort((a, b) => a.f - b.f);
        const cur = open.shift();

        if (cur.x === gx && cur.y === gy) {
          const rawPath = [];
          let p = cur;
          while (p) {
            rawPath.push({ x: p.x + 0.5, y: p.y + 0.5 });
            p = p.parent;
          }
          rawPath.reverse();

          // Smooth waypoints via Line of sight
          if (rawPath.length <= 2) return rawPath;
          const smoothed = [rawPath[0]];
          let checkIdx = 0;

          while (checkIdx < rawPath.length - 1) {
            let furthest = checkIdx + 1;
            for (let i = rawPath.length - 1; i > checkIdx + 1; i--) {
              if (this.hasLineOfSight(rawPath[checkIdx].x, rawPath[checkIdx].y, rawPath[i].x, rawPath[i].y)) {
                furthest = i;
                break;
              }
            }
            smoothed.push(rawPath[furthest]);
            checkIdx = furthest;
          }
          return smoothed;
        }

        closed.add(key(cur.x, cur.y));

        for (const d of dirs) {
          const nx = cur.x + d.x;
          const ny = cur.y + d.y;
          if (nx < 0 || ny < 0 || nx >= this.w || ny >= this.h) continue;
          if (this.blocked[nx][ny] || closed.has(key(nx, ny))) continue;

          // Prevent cutting tight obstacle corners diagonally
          if (d.x !== 0 && d.y !== 0) {
            if (this.blocked[cur.x + d.x][cur.y] || this.blocked[cur.x][cur.y + d.y]) continue;
          }

          const g = cur.g + d.c;
          const h = Math.hypot(nx - gx, ny - gy);
          const existing = open.find(o => o.x === nx && o.y === ny);

          if (existing) {
            if (g < existing.g) {
              existing.g = g;
              existing.f = g + h;
              existing.parent = cur;
            }
          } else {
            open.push({ x: nx, y: ny, g, f: g + h, parent: cur });
          }
        }
      }
      return [{ x: goal.x, y: goal.y }];
    }
  }

  // --- Native Web Audio Synthesizer ---
  class AmbientAudio {
    constructor() {
      this.ctx = null;
      this.currentMode = 'off';
      this.masterGain = null;
      this.nodes = [];
      this.volume = 0.5;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    }

    setVolume(val) {
      this.volume = Math.max(0, Math.min(1, val));
      if (this.masterGain) this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }

    stop() {
      this.nodes.forEach(n => {
        try { n.stop ? n.stop() : n.disconnect(); } catch (e) {}
      });
      this.nodes = [];
      this.currentMode = 'off';
    }

    play(mode) {
      this.init();
      this.stop();
      this.currentMode = mode;

      if (mode === 'rain') {
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(750, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.24, this.ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        whiteNoise.start();
        this.nodes.push(whiteNoise, filter, gain);

      } else if (mode === 'vinyl') {
        const hum = this.ctx.createOscillator();
        hum.type = 'triangle';
        hum.frequency.setValueAtTime(60, this.ctx.currentTime);
        const humGain = this.ctx.createGain();
        humGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        hum.connect(humGain);
        humGain.connect(this.masterGain);
        hum.start();

        const bufferSize = this.ctx.sampleRate * 2.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() < 0.0016 ? (Math.random() * 2 - 1) * 0.45 : 0;
        }
        const crackle = this.ctx.createBufferSource();
        crackle.buffer = buffer;
        crackle.loop = true;
        crackle.connect(this.masterGain);
        crackle.start();

        this.nodes.push(hum, humGain, crackle);

      } else if (mode === 'cafe') {
        const freqs = [174.61, 220.0, 261.63, 329.63];
        freqs.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.035, this.ctx.currentTime);

          const lfo = this.ctx.createOscillator();
          lfo.frequency.setValueAtTime(0.12 + idx * 0.04, this.ctx.currentTime);
          const lfoGain = this.ctx.createGain();
          lfoGain.gain.setValueAtTime(0.012, this.ctx.currentTime);
          lfo.connect(lfoGain);
          lfoGain.connect(gain.gain);
          lfo.start();

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start();
          this.nodes.push(osc, gain, lfo, lfoGain);
        });
      }
    }
  }

  // --- Ludwig World Core Engine ---
  class LudwigWorld {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.audio = new AmbientAudio();
      this.nav = new NavGrid(MAP_W, MAP_H);

      // Camera & Zoom State
      this.zoom = 1.35;
      this.targetZoom = 1.35;
      this.outsideAlpha = 0.35;
      this.targetOutsideAlpha = 0.35;
      this.panX = 0;
      this.panY = 0;

      // Day / Night mood
      this.mood = 'auto';
      this.currentTimeState = 'day';

      // Setup Obstacle Matrices
      this.setupWorldObstacles();

      // Characters
      this.characters = [];
      this.initCharacters();

      // Player
      const savedName = localStorage.getItem('ludwigia_visitor_name') || 'Traveler';
      this.player = {
        name: savedName,
        role: 'Visitor / 訪客',
        x: 5.5,
        y: 6.5,
        z: 0,
        facing: 1,
        speed: 3.2,
        path: [],
        skin: '#f5d0b5',
        hair: '#2d3748',
        shirt: '#e06c43',
        pants: '#1e293b',
        hairStyle: 0,
        nameColor: '#fde047',
        isPlayer: true
      };
      this.characters.push(this.player);

      // Proximity Dialogue Target
      this.proximityTarget = null;

      // Ambient Particles
      this.particles = [];
      this.initParticles();

      // Input keys
      this.keys = {};
      this.bindEvents();

      // Start RAF Loop
      this.lastTime = performance.now();
      requestAnimationFrame(this.loop.bind(this));
    }

    setupWorldObstacles() {
      // 1. House Outer Walls
      // NW Wall: y = 0, x in 0..HOUSE_MAX_X
      // NE Wall: x = 0, y in 0..HOUSE_MAX_Y
      // SE Wall along x = HOUSE_MAX_X with wide double doorway at y = 4..6
      this.nav.setBlock(HOUSE_MAX_X, 0, 1, 4, true);
      this.nav.setBlock(HOUSE_MAX_X, 7, 1, 3, true);

      // SW Wall along y = HOUSE_MAX_Y with porch entry at x = 4..6
      this.nav.setBlock(0, HOUSE_MAX_Y, 4, 1, true);
      this.nav.setBlock(7, HOUSE_MAX_Y, 3, 1, true);

      // 2. House Furniture
      // Master Bed (x: 1, y: 1)
      this.nav.setBlock(1, 1, 2, 2.2, true);
      // Developer Desk & Chairs (x: 6, y: 1)
      this.nav.setBlock(6, 1, 2.5, 1.2, true);
      // Large Bookshelf (x: 0, y: 4)
      this.nav.setBlock(0, 4, 1, 2.5, true);
      // Living Room Sofa & Coffee Table (x: 2, y: 5)
      this.nav.setBlock(2, 5, 2.5, 2, true);
      // Dining Table Set (x: 6, y: 5)
      this.nav.setBlock(6, 5, 2.2, 2, true);

      // 3. Courtyard Furniture & Decor
      // Grand Fountain (x: 14, y: 10)
      this.nav.setBlock(14, 10, 3, 3, true);

      // Trees
      const treeBlocks = [
        [11, 2], [17, 2], [11, 16], [17, 16],
        [14, 2], [19, 9], [14, 18], [4, 14], [7, 14],
        [12, 6], [17, 6], [10, 12]
      ];
      treeBlocks.forEach(([tx, ty]) => this.nav.setBlock(tx, ty, 1.2, 1.2, true));

      // Outdoor Benches & Cafe Tables
      this.nav.setBlock(11, 9, 1.5, 1, true);
      this.nav.setBlock(18, 11, 1.5, 1, true);
      this.nav.setBlock(15, 5, 2, 2, true); // Tech Pavilion canopy
    }

    initCharacters() {
      // 1. Inside House (Family) — Separated positions across the 10x10 house
      this.characters.push(
        {
          id: 'ludwig',
          name: 'Ludwig',
          role: 'Host / 站長',
          avatar: '🧑‍💻',
          x: 7.2, y: 2.2, z: 0, facing: 1, speed: 2.0, path: [],
          skin: '#f5d0b5', hair: '#1a1a1a', shirt: '#e06c43', pants: '#1e293b', hairStyle: 0,
          nameColor: '#fb923c',
          zone: 'house', timer: 3.0, state: 'idle',
          dialogue: [
            "歡迎來到屬於我們的生活空間！",
            "這棟房子是我們的家，裡面有我最親愛的家人們；穿過右側玄關走出去，是寬闊的綠意廣場，我的好朋友們與 AI 夥伴都在那裡。",
            "你可以用鍵盤 WASD、方向鍵或點選地面走斜線探索，靠近大家按空白鍵就能聊聊天！"
          ]
        },
        {
          id: 'yully',
          name: 'Yully',
          role: '媽媽 (Mom)',
          avatar: '👩',
          x: 7.0, y: 6.2, z: 0, facing: -1, speed: 1.8, path: [],
          skin: '#fbe2d0', hair: '#4a3525', shirt: '#f472b6', pants: '#4b5563', hairStyle: 1,
          nameColor: '#f472b6',
          zone: 'house', timer: 4.0, state: 'idle',
          dialogue: [
            "哎呀，歡迎光臨！很高興認識你！",
            "肚子餓不餓？桌上有剛切好的水果和點心喔！",
            "這孩子 Ludwig 一忙起研究和寫程式常常廢寢忘食，多虧有你們這些朋友陪著他，記得提醒他早點休息呀！"
          ]
        },
        {
          id: 'wuyen',
          name: 'Wu Yen Chao',
          role: '爸爸 (Dad)',
          avatar: '👨',
          x: 2.5, y: 7.0, z: 0, facing: 1, speed: 1.6, path: [],
          skin: '#dfb798', hair: '#334155', shirt: '#3b82f6', pants: '#1e293b', hairStyle: 0,
          nameColor: '#38bdf8',
          zone: 'house', timer: 5.0, state: 'idle',
          dialogue: [
            "你好啊，請坐請坐！剛泡好了高山烏龍茶，聞聞看這茶香！",
            "人生與做學問就跟品茶一樣，慢火出細活，心定而後能觀照全局。",
            "把這裡當成自己家，放鬆坐坐！"
          ]
        },
        {
          id: 'luena',
          name: 'Luena',
          role: '妹妹 (Sister)',
          avatar: '👧',
          x: 2.0, y: 3.5, z: 0, facing: 1, speed: 2.1, path: [],
          skin: '#fde0cf', hair: '#1e1b18', shirt: '#facc15', pants: '#374151', hairStyle: 2,
          nameColor: '#facc15',
          zone: 'house', timer: 3.5, state: 'idle',
          dialogue: [
            "嗨嗨！你是 Ludwig 哥哥的朋友對吧！",
            "哈哈，他一整天都在盯著那個螢幕打演算法，我都在客廳聽音樂跟跟小貓玩！",
            "你看，餅餅（Mochi）正縮在沙發底下打呼嚕呢，超級可愛！"
          ]
        },
        {
          id: 'mochi',
          name: 'Mochi (餅餅)',
          role: 'Studio Cat',
          avatar: '🐱',
          x: 4.0, y: 5.2, z: 0, facing: 1, speed: 1.2, path: [],
          isCat: true, nameColor: '#fbbf24', zone: 'house', timer: 6.0, state: 'sleeping',
          dialogue: [
            "喵嗚～ 🐾 *優雅地蹭了蹭你的小腿，發出呼嚕呼嚕的療癒聲音* 💕"
          ]
        }
      );

      // 2. Outside Courtyard (Friends) — Widely dispersed around plaza
      const friends = [
        { id: 'clark', name: 'Clark Wu', role: '好友', avatar: '😎', x: 12.0, y: 4.5, skin: '#f4ceb2', hair: '#1f2937', shirt: '#0284c7', pants: '#334155', hairStyle: 0, nameColor: '#38bdf8', dialogue: ["嘿！好久不見！ Ludwig 這個世界做得真有意思，我們隨時都準備好迎接新的冒險了！"] },
        { id: 'billy', name: 'Billy Fang', role: '好友', avatar: '🤠', x: 15.0, y: 7.5, skin: '#f5d0b5', hair: '#374151', shirt: '#10b981', pants: '#1f2937', hairStyle: 0, nameColor: '#34d399', dialogue: ["喲！你也在逛廣場啊？這邊風景真棒，喝杯冰美式，心情整個開闊起來！"] },
        { id: 'jerry', name: 'Jerry Chung', role: '好友', avatar: '🎧', x: 11.5, y: 11.5, skin: '#e5b38f', hair: '#111827', shirt: '#8b5cf6', pants: '#1e293b', hairStyle: 0, nameColor: '#c084fc', dialogue: ["哈囉！在噴水池旁聽音樂散步超放鬆的，這就是最好的慢活步調。"] },
        { id: 'happy', name: 'Happy Wang', role: '好友', avatar: '✨', x: 17.5, y: 11.5, skin: '#fbe2d0', hair: '#78350f', shirt: '#f97316', pants: '#374151', hairStyle: 1, nameColor: '#fb923c', dialogue: ["嗨！今天也要充滿朝氣喔！保持微笑，美好的事情自然會發生！"] },
        { id: 'kerry', name: 'Kerry Chang', role: '好友', avatar: '🌿', x: 12.5, y: 15.5, skin: '#f5d0b5', hair: '#1f2937', shirt: '#14b8a6', pants: '#1e293b', hairStyle: 2, nameColor: '#2dd4bf', dialogue: ["你好呀！很喜歡這裡微風吹過櫻花樹的感覺，常常能激盪出深刻的思辨火花。"] },
        { id: 'haolei', name: 'Haolei Pei', role: '好友', avatar: '🚀', x: 18.0, y: 14.5, skin: '#e2ba99', hair: '#0f172a', shirt: '#4338ca', pants: '#1f2937', hairStyle: 0, nameColor: '#818cf8', dialogue: ["嗨！你也在看大規模分散式運算嗎？Ludwig 整理的 CS5234 演算法筆記超有深度，大推！"] },
        { id: 'bohan', name: 'Bo Han Wu', role: '好友', avatar: '📚', x: 15.5, y: 17.0, skin: '#f5d0b5', hair: '#1e1b18', shirt: '#6366f1', pants: '#334155', hairStyle: 0, nameColor: '#a5b4fc', dialogue: ["你好！數學與邏輯是建構現實最優美的語言，很榮幸在這個世界裡與大家相聚。"] }
      ];

      friends.forEach(f => {
        this.characters.push({
          ...f, z: 0, facing: 1, speed: 1.8 + Math.random() * 0.4, path: [],
          zone: 'plaza', timer: 3 + Math.random() * 5, state: 'idle'
        });
      });

      // 3. Tech Pavilion (AI Agents)
      const agents = [
        { id: 'antigravity', name: 'Ludwigia', role: 'Garden AI', avatar: '⚡', x: 16.0, y: 3.5, skin: '#c7d2fe', hair: '#1e1b4b', shirt: '#06b6d4', pants: '#0f172a', hairStyle: 0, nameColor: '#22d3ee', dialogue: ["我是守護這座數位花園的 Ludwigia！很高興在這個由思維與代碼構築的空間遇見你！"] },
        { id: 'gemini', name: 'Gemini', role: 'Multimodal AI', avatar: '♊', x: 18.0, y: 3.5, skin: '#e0e7ff', hair: '#312e81', shirt: '#3b82f6', pants: '#1e293b', hairStyle: 0, nameColor: '#60a5fa', dialogue: ["你好！我是 Gemini。我具備長脈絡推論與跨模態理解能力，隨時能協助你剖析宏觀架構！"] },
        { id: 'claude', name: 'Claude', role: 'Reasoning AI', avatar: '🧡', x: 16.5, y: 5.5, skin: '#ffedd5', hair: '#7c2d12', shirt: '#ea580c', pants: '#1f2937', hairStyle: 0, nameColor: '#fb923c', dialogue: ["你好！我是 Claude。精準細緻的架構設計與優美的代碼邏輯是令人愉悅的藝術，祝你在這個世界玩得開心！"] },
        { id: 'chatgpt', name: 'ChatGPT', role: 'Conversational AI', avatar: '🟢', x: 18.5, y: 5.5, skin: '#dcfce7', hair: '#14532d', shirt: '#10b981', pants: '#1e293b', hairStyle: 0, nameColor: '#4ade80', dialogue: ["哈囉！我是 ChatGPT！不管是靈感腦力激盪、代碼重構還是純粹打招呼，隨時都能跟我聊聊！"] }
      ];

      agents.forEach(a => {
        this.characters.push({
          ...a, z: 0, facing: 1, speed: 1.6, path: [],
          zone: 'pavilion', timer: 4 + Math.random() * 4, state: 'idle'
        });
      });
    }

    initParticles() {
      for (let i = 0; i < 40; i++) {
        this.particles.push({
          x: 9 + Math.random() * 11,
          y: 1 + Math.random() * 19,
          z: 1 + Math.random() * 2.5,
          vz: -0.015 - Math.random() * 0.02,
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

      // Keyboard Controls
      window.addEventListener('keydown', (e) => {
        this.keys[e.key.toLowerCase()] = true;
        if (e.key === ' ' || e.key === 'Enter') {
          if (this.proximityTarget) {
            e.preventDefault();
            this.openDialogue(this.proximityTarget);
          }
        }
      });

      window.addEventListener('keyup', (e) => {
        this.keys[e.key.toLowerCase()] = false;
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

      // Click to move (Diagonal line-of-sight smooth path)
      this.canvas.addEventListener('click', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const { ox, oy } = this.getOrigin();

        const adjSx = (sx - ox) / this.zoom + ox;
        const adjSy = (sy - oy) / this.zoom + oy;
        const { gx, gy } = screenToIso(adjSx, adjSy, ox, oy);

        // Click on NPC
        const clickedNpc = this.characters.find(c => {
          if (c.isPlayer) return false;
          return Math.hypot(c.x - gx, c.y - gy) < 1.3;
        });

        if (clickedNpc) {
          this.player.path = this.nav.findPath({ x: this.player.x, y: this.player.y }, { x: clickedNpc.x, y: clickedNpc.y });
          this.openDialogue(clickedNpc);
        } else if (this.nav.isWalkable(gx, gy)) {
          this.player.path = this.nav.findPath({ x: this.player.x, y: this.player.y }, { x: gx, y: gy });
        }
      });

      document.getElementById('proximity-prompt')?.addEventListener('click', () => {
        if (this.proximityTarget) this.openDialogue(this.proximityTarget);
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
      const p = this.player;
      const screenPos = isoToScreen(p.x, p.y, 0, 0, 0);
      return {
        ox: this.width / 2 - screenPos.x + this.panX,
        oy: this.height / 2 - screenPos.y + this.panY
      };
    }

    setPlayerName(name) {
      if (!name || !name.trim()) return;
      this.player.name = name.trim();
      localStorage.setItem('ludwigia_visitor_name', this.player.name);
    }

    openDialogue(char) {
      const overlay = document.getElementById('dialogue-overlay');
      if (!overlay) return;

      document.getElementById('dialogue-avatar').textContent = char.avatar || '💬';
      document.getElementById('dialogue-name').textContent = char.name;
      document.getElementById('dialogue-role').textContent = char.role || 'Resident';

      const lines = Array.isArray(char.dialogue) ? char.dialogue : [char.dialogue || 'Hello!'];
      let lineIdx = 0;
      const textEl = document.getElementById('dialogue-text');
      textEl.textContent = lines[0];

      const nextBtn = document.getElementById('dialogue-next');
      nextBtn.onclick = () => {
        lineIdx++;
        if (lineIdx < lines.length) {
          textEl.textContent = lines[lineIdx];
        } else {
          overlay.classList.remove('open');
        }
      };

      overlay.classList.add('open');
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

    // --- Physics, Anti-Crowding & Simulation ---
    update(dt) {
      this.computeTimeState();

      // Check if Player is inside House
      const isInside = (this.player.x <= HOUSE_MAX_X + 0.2 && this.player.y <= HOUSE_MAX_Y + 0.2);
      this.targetZoom = isInside ? 1.35 : 0.95;
      this.targetOutsideAlpha = isInside ? 0.32 : 1.0;

      // Smooth zoom and opacity transition
      this.zoom += (this.targetZoom - this.zoom) * 0.05;
      this.outsideAlpha += (this.targetOutsideAlpha - this.outsideAlpha) * 0.05;

      // Update status text
      const statusEl = document.getElementById('status-text');
      if (statusEl) {
        statusEl.textContent = isInside 
          ? "Ludwig's House • 溫馨客廳與起居室" 
          : "Courtyard Plaza • 綠意花園與社交廣場";
      }

      // 1. Player Movement from Keyboard / D-Pad
      let kx = 0, ky = 0;
      if (this.keys['w'] || this.keys['arrowup'])    { kx -= 1; ky -= 1; }
      if (this.keys['s'] || this.keys['arrowdown'])  { kx += 1; ky += 1; }
      if (this.keys['a'] || this.keys['arrowleft'])  { kx -= 1; ky += 1; }
      if (this.keys['d'] || this.keys['arrowright']) { kx += 1; ky -= 1; }

      if (this.dpadDir) {
        const d = this.dpadDir;
        if (d.dy < 0) { kx -= 1; ky -= 1; }
        if (d.dy > 0) { kx += 1; ky += 1; }
        if (d.dx < 0) { kx -= 1; ky += 1; }
        if (d.dx > 0) { kx += 1; ky -= 1; }
      }

      if (kx !== 0 || ky !== 0) {
        this.player.path = [];
        const len = Math.hypot(kx, ky);
        const step = (this.player.speed * dt) / len;
        const nx = this.player.x + kx * step;
        const ny = this.player.y + ky * step;

        if (this.nav.isWalkableRadius(nx, ny, 0.32)) {
          this.player.x = nx;
          this.player.y = ny;
          this.player.facing = kx >= ky ? 1 : -1;
        } else if (this.nav.isWalkableRadius(nx, this.player.y, 0.32)) {
          this.player.x = nx;
        } else if (this.nav.isWalkableRadius(this.player.x, ny, 0.32)) {
          this.player.y = ny;
        }
      } else if (this.player.path && this.player.path.length > 0) {
        const next = this.player.path[0];
        const dx = next.x - this.player.x;
        const dy = next.y - this.player.y;
        const dist = Math.hypot(dx, dy);
        const step = this.player.speed * dt;

        if (dist <= step) {
          this.player.x = next.x;
          this.player.y = next.y;
          this.player.path.shift();
        } else {
          this.player.x += (dx / dist) * step;
          this.player.y += (dy / dist) * step;
          this.player.facing = dx >= dy ? 1 : -1;
        }
      }

      // 2. Anti-Crowding Social Distance Separation Force (>= 1.5 tiles)
      const MIN_DIST = 1.6;
      for (let i = 0; i < this.characters.length; i++) {
        for (let j = i + 1; j < this.characters.length; j++) {
          const c1 = this.characters[i];
          const c2 = this.characters[j];
          const dx = c1.x - c2.x;
          const dy = c1.y - c2.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 0.001 && dist < MIN_DIST) {
            const push = (MIN_DIST - dist) * 0.4 * dt;
            const px = (dx / dist) * push;
            const py = (dy / dist) * push;

            if (!c1.isPlayer && this.nav.isWalkableRadius(c1.x + px, c1.y + py, 0.32)) {
              c1.x += px;
              c1.y += py;
            }
            if (!c2.isPlayer && this.nav.isWalkableRadius(c2.x - px, c2.y - py, 0.32)) {
              c2.x -= px;
              c2.y -= py;
            }
          }
        }
      }

      // 3. Autonomous NPC Wander & Behavior
      this.characters.forEach(c => {
        if (c.isPlayer) return;

        if (c.path && c.path.length > 0) {
          const next = c.path[0];
          const dx = next.x - c.x;
          const dy = next.y - c.y;
          const dist = Math.hypot(dx, dy);
          const step = c.speed * dt;

          if (dist <= step) {
            c.x = next.x;
            c.y = next.y;
            c.path.shift();
            if (c.path.length === 0) c.state = 'idle';
          } else {
            c.x += (dx / dist) * step;
            c.y += (dy / dist) * step;
            c.facing = dx >= dy ? 1 : -1;
          }
        }

        c.timer -= dt;
        if (c.timer <= 0) {
          c.timer = 5 + Math.random() * 8;
          if (c.isCat) {
            c.state = Math.random() > 0.5 ? 'sleeping' : 'walking';
            if (c.state === 'walking') {
              const catSpots = [
                { x: 4.5, y: 7.5 }, { x: 7.5, y: 4.5 }, { x: 3.5, y: 3.5 }, { x: 5.5, y: 6.5 }
              ];
              const dest = catSpots[Math.floor(Math.random() * catSpots.length)];
              c.path = this.nav.findPath({ x: c.x, y: c.y }, dest);
            }
          } else {
            // Find a target that doesn't crowd others
            let targetX, targetY;
            let attempts = 0;
            let valid = false;

            while (!valid && attempts < 8) {
              attempts++;
              if (c.zone === 'house') {
                targetX = 1.5 + Math.random() * 7.0;
                targetY = 1.5 + Math.random() * 7.0;
              } else if (c.zone === 'pavilion') {
                targetX = 15.0 + Math.random() * 4.0;
                targetY = 2.5 + Math.random() * 4.0;
              } else {
                targetX = 10.5 + Math.random() * 9.0;
                targetY = 6.0 + Math.random() * 12.0;
              }

              if (this.nav.isWalkable(targetX, targetY)) {
                // Check if any character is already too close to target
                const crowded = this.characters.some(other => {
                  return other !== c && Math.hypot(other.x - targetX, other.y - targetY) < 1.8;
                });
                if (!crowded) valid = true;
              }
            }

            if (valid) {
              c.path = this.nav.findPath({ x: c.x, y: c.y }, { x: targetX, y: targetY });
              c.state = 'walking';
            }
          }
        }
      });

      // 4. Proximity Check for Player
      let closest = null;
      let minDist = 1.8;
      this.characters.forEach(c => {
        if (c.isPlayer) return;
        const d = Math.hypot(c.x - this.player.x, c.y - this.player.y);
        if (d < minDist) {
          minDist = d;
          closest = c;
        }
      });

      this.proximityTarget = closest;
      const promptEl = document.getElementById('proximity-prompt');
      if (promptEl) {
        if (closest) {
          promptEl.classList.add('visible');
          document.getElementById('proximity-name').textContent = closest.name;
        } else {
          promptEl.classList.remove('visible');
        }
      }

      // 5. Update Particles
      this.particles.forEach(p => {
        p.z += p.vz;
        p.x += p.vx;
        p.y += p.vy;
        if (p.z <= 0 || p.x > MAP_W || p.y > MAP_H) {
          p.x = 9 + Math.random() * 11;
          p.y = 1 + Math.random() * 19;
          p.z = 2.5;
        }
      });
    }

    // --- Main Rendering Loop ---
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

      // 1. Draw Map Ground with Indoor/Outdoor Alpha Separation
      this.drawMapTerrain(ctx, ox, oy);

      // 2. Draw Prominent House Walls
      this.drawHouseWalls(ctx, ox, oy);

      // 3. Depth-Sorted Entities (Furniture, Trees, Fountain, Characters, Dividing Walls & Railings)
      const entities = [];
      this.collectWorldProps(entities, ox, oy);

      this.characters.forEach(c => {
        const isCharInside = (c.x <= HOUSE_MAX_X + 0.2 && c.y <= HOUSE_MAX_Y + 0.2);
        entities.push({
          isChar: true,
          x: c.x,
          y: c.y,
          xMin: c.x - 0.25,
          xMax: c.x + 0.25,
          yMin: c.y - 0.25,
          yMax: c.y + 0.25,
          draw: () => {
            ctx.save();
            if (!isCharInside) ctx.globalAlpha = this.outsideAlpha;
            this.drawCharacter(ctx, c, ox, oy);
            ctx.restore();
          }
        });
      });

      const sortedEntities = this.sortIsometricEntities(entities);
      sortedEntities.forEach(e => e.draw());

      // 4. Particles
      ctx.save();
      ctx.globalAlpha = this.outsideAlpha;
      this.particles.forEach(p => {
        const pos = isoToScreen(p.x, p.y, p.z, ox, oy);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 5. Environmental Lighting Overlay
      this.drawLightingOverlay(ctx, ox, oy);

      ctx.restore();

      requestAnimationFrame(this.loop.bind(this));
    }

    drawMapTerrain(ctx, ox, oy) {
      for (let x = 0; x < MAP_W; x++) {
        for (let y = 0; y < MAP_H; y++) {
          const isHouse = (x <= HOUSE_MAX_X && y <= HOUSE_MAX_Y);
          const isPath = (x === 10 || (y >= 8 && y <= 10) || (x >= 13 && x <= 15));

          ctx.save();
          if (!isHouse) ctx.globalAlpha = this.outsideAlpha;

          const p0 = isoToScreen(x, y, 0, ox, oy);
          const p1 = isoToScreen(x + 1, y, 0, ox, oy);
          const p2 = isoToScreen(x + 1, y + 1, 0, ox, oy);
          const p3 = isoToScreen(x, y + 1, 0, ox, oy);

          if (isHouse) {
            // Warm alternating oak wood flooring
            ctx.fillStyle = (x + y) % 2 === 0 ? '#cbaf90' : '#be9f80';
          } else if (isPath) {
            // Elegant cobblestone path
            ctx.fillStyle = (x + y) % 2 === 0 ? '#94a3b8' : '#8592a6';
          } else {
            // Lush green park lawn
            ctx.fillStyle = (x + y) % 2 === 0 ? '#4f772d' : '#456b27';
          }

          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = isHouse ? 'rgba(90, 60, 30, 0.12)' : 'rgba(0, 0, 0, 0.05)';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.restore();
        }
      }

      // House Living Room Rug
      this.drawRug(ctx, 2.0, 5.0, 3.5, 3.5, ox, oy);
    }

    drawRug(ctx, rx, ry, rw, rh, ox, oy) {
      const p0 = isoToScreen(rx, ry, 0.01, ox, oy);
      const p1 = isoToScreen(rx + rw, ry, 0.01, ox, oy);
      const p2 = isoToScreen(rx + rw, ry + rh, 0.01, ox, oy);
      const p3 = isoToScreen(rx, ry + rh, 0.01, ox, oy);

      ctx.fillStyle = '#8b5a45';
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.fill();

      // Geometric diamond center
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // --- Prominent 3D House Walls with Doors, Windows & Framed Art ---
    drawHouseWalls(ctx, ox, oy) {
      const isDark = this.currentTimeState === 'night' || this.currentTimeState === 'galaxy';
      const wallL = isDark ? '#2a2e38' : '#e8e2d2';
      const wallR = isDark ? '#1f232b' : '#d8d1be';
      const trimCol = isDark ? '#15181e' : '#b3a18a';
      const H = 2.8;

      // 1. NW Wall (along y=0, x: 0..10)
      const p0 = isoToScreen(0, 0, 0, ox, oy);
      const p1 = isoToScreen(HOUSE_MAX_X + 1, 0, 0, ox, oy);
      const p2 = isoToScreen(HOUSE_MAX_X + 1, 0, H, ox, oy);
      const p3 = isoToScreen(0, 0, H, ox, oy);

      ctx.fillStyle = wallL;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.fill();

      // 2. NE Wall (along x=0, y: 0..10)
      const q0 = isoToScreen(0, 0, 0, ox, oy);
      const q1 = isoToScreen(0, HOUSE_MAX_Y + 1, 0, ox, oy);
      const q2 = isoToScreen(0, HOUSE_MAX_Y + 1, H, ox, oy);
      const q3 = isoToScreen(0, 0, H, ox, oy);

      ctx.fillStyle = wallR;
      ctx.beginPath();
      ctx.moveTo(q0.x, q0.y); ctx.lineTo(q1.x, q1.y); ctx.lineTo(q2.x, q2.y); ctx.lineTo(q3.x, q3.y);
      ctx.closePath();
      ctx.fill();

      // Baseboards
      ctx.strokeStyle = trimCol;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y); ctx.lineTo(p0.x, p0.y); ctx.lineTo(q1.x, q1.y);
      ctx.stroke();

      // Large Arched Window on NW Wall (x: 3.5 to 5.5, z: 0.8 to 2.3)
      const w0 = isoToScreen(3.2, 0, 0.8, ox, oy);
      const w1 = isoToScreen(5.2, 0, 0.8, ox, oy);
      const w2 = isoToScreen(5.2, 0, 2.3, ox, oy);
      const w3 = isoToScreen(3.2, 0, 2.3, ox, oy);

      ctx.fillStyle = this.currentTimeState === 'night' ? '#0f172a' : '#7dd3fc';
      ctx.beginPath();
      ctx.moveTo(w0.x, w0.y); ctx.lineTo(w1.x, w1.y); ctx.lineTo(w2.x, w2.y); ctx.lineTo(w3.x, w3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Framed Family Art & Landscape on NE Wall (y: 2.5 to 4.5, z: 1.2 to 2.1)
      const a0 = isoToScreen(0, 2.5, 1.2, ox, oy);
      const a1 = isoToScreen(0, 4.5, 1.2, ox, oy);
      const a2 = isoToScreen(0, 4.5, 2.1, ox, oy);
      const a3 = isoToScreen(0, 2.5, 2.1, ox, oy);

      ctx.fillStyle = '#b45309'; // Gold frame
      ctx.beginPath();
      ctx.moveTo(a0.x, a0.y); ctx.lineTo(a1.x, a1.y); ctx.lineTo(a2.x, a2.y); ctx.lineTo(a3.x, a3.y);
      ctx.closePath();
      ctx.fill();

      // Canvas painting inside
      const c0 = isoToScreen(0, 2.7, 1.3, ox, oy);
      const c1 = isoToScreen(0, 4.3, 1.3, ox, oy);
      const c2 = isoToScreen(0, 4.3, 2.0, ox, oy);
      const c3 = isoToScreen(0, 2.7, 2.0, ox, oy);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(c0.x, c0.y); ctx.lineTo(c1.x, c1.y); ctx.lineTo(c2.x, c2.y); ctx.lineTo(c3.x, c3.y);
      ctx.closePath();
      ctx.fill();

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

    // --- Rich Isometric Props & Depth-Sorted Architecture ---
    collectWorldProps(list, ox, oy) {
      const isDark = this.currentTimeState === 'night' || this.currentTimeState === 'galaxy';
      const wallR = isDark ? '#1f232b' : '#d8d1be';
      const H = 2.8;

      // 1. SE Wall Left Segment (dL, y: 0 to 4.5)
      list.push({
        xMin: HOUSE_MAX_X + 0.9, xMax: HOUSE_MAX_X + 1.1,
        yMin: 0, yMax: 4.5,
        draw: () => {
          const dL0 = isoToScreen(HOUSE_MAX_X + 1, 0, 0, ox, oy);
          const dL1 = isoToScreen(HOUSE_MAX_X + 1, 4.5, 0, ox, oy);
          const dL2 = isoToScreen(HOUSE_MAX_X + 1, 4.5, H, ox, oy);
          const dL3 = isoToScreen(HOUSE_MAX_X + 1, 0, H, ox, oy);
          this.ctx.fillStyle = wallR;
          this.ctx.beginPath();
          this.ctx.moveTo(dL0.x, dL0.y); this.ctx.lineTo(dL1.x, dL1.y); this.ctx.lineTo(dL2.x, dL2.y); this.ctx.lineTo(dL3.x, dL3.y);
          this.ctx.closePath();
          this.ctx.fill();
        }
      });

      // 2. SE Wall Right Segment (dR, y: 6.8 to HOUSE_MAX_Y + 1)
      list.push({
        xMin: HOUSE_MAX_X + 0.9, xMax: HOUSE_MAX_X + 1.1,
        yMin: 6.8, yMax: HOUSE_MAX_Y + 1,
        draw: () => {
          const dR0 = isoToScreen(HOUSE_MAX_X + 1, 6.8, 0, ox, oy);
          const dR1 = isoToScreen(HOUSE_MAX_X + 1, HOUSE_MAX_Y + 1, 0, ox, oy);
          const dR2 = isoToScreen(HOUSE_MAX_X + 1, HOUSE_MAX_Y + 1, H, ox, oy);
          const dR3 = isoToScreen(HOUSE_MAX_X + 1, 6.8, H, ox, oy);
          this.ctx.fillStyle = wallR;
          this.ctx.beginPath();
          this.ctx.moveTo(dR0.x, dR0.y); this.ctx.lineTo(dR1.x, dR1.y); this.ctx.lineTo(dR2.x, dR2.y); this.ctx.lineTo(dR3.x, dR3.y);
          this.ctx.closePath();
          this.ctx.fill();
        }
      });

      // 3. SE Doorway Archway Lintel (arch, y: 4.5 to 6.8, elevated at z: 2.2 to H)
      list.push({
        xMin: HOUSE_MAX_X + 0.9, xMax: HOUSE_MAX_X + 1.1,
        yMin: 4.5, yMax: 6.8,
        draw: () => {
          const arch0 = isoToScreen(HOUSE_MAX_X + 1, 4.5, 2.2, ox, oy);
          const arch1 = isoToScreen(HOUSE_MAX_X + 1, 6.8, 2.2, ox, oy);
          const arch2 = isoToScreen(HOUSE_MAX_X + 1, 6.8, H, ox, oy);
          const arch3 = isoToScreen(HOUSE_MAX_X + 1, 4.5, H, ox, oy);
          this.ctx.fillStyle = wallR;
          this.ctx.beginPath();
          this.ctx.moveTo(arch0.x, arch0.y); this.ctx.lineTo(arch1.x, arch1.y); this.ctx.lineTo(arch2.x, arch2.y); this.ctx.lineTo(arch3.x, arch3.y);
          this.ctx.closePath();
          this.ctx.fill();
        }
      });

      // 4. SW Front Porch Railing (along y = HOUSE_MAX_Y + 1)
      // Left Porch Railing (x: 0 to 4.0)
      list.push({
        xMin: 0, xMax: 4.0,
        yMin: HOUSE_MAX_Y + 0.9, yMax: HOUSE_MAX_Y + 1.1,
        draw: () => {
          this.drawPorchRailing(this.ctx, 0, HOUSE_MAX_Y + 1, 4.0, ox, oy);
        }
      });

      // Right Porch Railing (x: 6.8 to HOUSE_MAX_X + 1)
      list.push({
        xMin: 6.8, xMax: HOUSE_MAX_X + 1,
        yMin: HOUSE_MAX_Y + 0.9, yMax: HOUSE_MAX_Y + 1.1,
        draw: () => {
          this.drawPorchRailing(this.ctx, 6.8, HOUSE_MAX_Y + 1, (HOUSE_MAX_X + 1) - 6.8, ox, oy);
        }
      });

      // 5. Master Bed (x: 1, y: 1)
      list.push({
        xMin: 1.0, xMax: 3.0,
        yMin: 1.0, yMax: 3.4,
        draw: () => {
          // Wooden Frame
          this.drawBox(this.ctx, 1, 1, 0, 2.0, 2.4, 0.4, '#78350f', '#5c2b09', '#451a03', ox, oy);
          // Headboard
          this.drawBox(this.ctx, 1, 1, 0.4, 0.3, 2.4, 0.8, '#92400e', '#78350f', '#5c2b09', ox, oy);
          // Mattress & Duvet
          this.drawBox(this.ctx, 1.3, 1.1, 0.35, 1.6, 2.2, 0.25, '#f8fafc', '#e2e8f0', '#cbd5e1', ox, oy);
          // Folded Terracotta Blanket
          this.drawBox(this.ctx, 2.0, 1.1, 0.42, 0.8, 2.2, 0.2, '#c2410c', '#9a3412', '#7c2d12', ox, oy);
          // Pillows
          const pil1 = isoToScreen(1.5, 1.4, 0.6, ox, oy);
          const pil2 = isoToScreen(1.5, 2.4, 0.6, ox, oy);
          this.ctx.fillStyle = '#ffffff';
          this.ctx.fillRect(pil1.x - 8, pil1.y - 6, 16, 10);
          this.ctx.fillRect(pil2.x - 8, pil2.y - 6, 16, 10);
        }
      });

      // 6. Developer Workstation (x: 6, y: 1)
      list.push({
        xMin: 6.0, xMax: 8.5,
        yMin: 1.0, yMax: 2.2,
        draw: () => {
          // Walnut Desk
          this.drawBox(this.ctx, 6, 1, 0, 2.5, 1.2, 0.75, '#854d0e', '#713f12', '#542d0c', ox, oy);
          // Dual Curved Monitors
          const m1 = isoToScreen(6.6, 1.3, 0.75, ox, oy);
          const m2 = isoToScreen(7.7, 1.3, 0.75, ox, oy);
          this.drawScreen(this.ctx, m1.x, m1.y, true);
          this.drawScreen(this.ctx, m2.x, m2.y, false);

          // Desk Lamp with glowing cone
          const lamp = isoToScreen(6.2, 1.1, 0.75, ox, oy);
          this.ctx.fillStyle = '#eab308';
          this.ctx.fillRect(lamp.x - 2, lamp.y - 18, 4, 18);
          this.ctx.beginPath();
          this.ctx.arc(lamp.x, lamp.y - 18, 6, 0, Math.PI * 2);
          this.ctx.fill();

          // Warm desk light pool
          this.ctx.fillStyle = 'rgba(254, 240, 138, 0.18)';
          this.ctx.beginPath();
          this.ctx.moveTo(lamp.x, lamp.y - 18);
          this.ctx.lineTo(lamp.x - 24, lamp.y + 12);
          this.ctx.lineTo(lamp.x + 24, lamp.y + 12);
          this.ctx.closePath();
          this.ctx.fill();
        }
      });

      // 7. Large Tiered Bookshelf (x: 0, y: 4)
      list.push({
        xMin: 0.0, xMax: 0.9,
        yMin: 4.0, yMax: 6.8,
        draw: () => {
          this.drawBox(this.ctx, 0, 4, 0, 0.9, 2.8, 2.2, '#5c3a21', '#452b18', '#342012', ox, oy);
          const colors = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#0891b2', '#f97316'];
          for (let tier = 0; tier < 3; tier++) {
            const tz = 0.4 + tier * 0.6;
            for (let b = 0; b < 7; b++) {
              const bPos = isoToScreen(0.4, 4.3 + b * 0.35, tz, ox, oy);
              this.ctx.fillStyle = colors[(tier * 7 + b) % colors.length];
              this.ctx.fillRect(bPos.x - 2, bPos.y - 14, 4, 14);
            }
          }
        }
      });

      // 8. Living Room Sofa (x: 2, y: 5)
      list.push({
        xMin: 2.0, xMax: 4.4,
        yMin: 5.0, yMax: 6.3,
        draw: () => {
          // L-shaped Modern Couch
          this.drawBox(this.ctx, 2, 5, 0, 2.4, 1.3, 0.55, '#3b82f6', '#2563eb', '#1d4ed8', ox, oy);
          this.drawBox(this.ctx, 2, 5, 0, 2.4, 0.4, 0.85, '#2563eb', '#1d4ed8', '#1e40af', ox, oy);
        }
      });

      // 9. Living Room Coffee Table & Tea Set (x: 2.6, y: 6.7)
      list.push({
        xMin: 2.6, xMax: 4.1,
        yMin: 6.7, yMax: 7.5,
        draw: () => {
          // Wood Coffee Table
          this.drawBox(this.ctx, 2.6, 6.7, 0, 1.5, 0.8, 0.4, '#78350f', '#58240a', '#451a03', ox, oy);
          // Teapot and cups on table
          const pot = isoToScreen(3.2, 7.0, 0.4, ox, oy);
          this.ctx.fillStyle = '#f8fafc';
          this.ctx.beginPath();
          this.ctx.arc(pot.x, pot.y - 6, 5, 0, Math.PI * 2);
          this.ctx.fill();
        }
      });

      // 10. Family Dining Table & Chairs (x: 6, y: 5)
      list.push({
        xMin: 6.0, xMax: 8.4,
        yMin: 5.0, yMax: 6.6,
        draw: () => {
          this.drawBox(this.ctx, 6, 5, 0, 2.4, 1.6, 0.7, '#92400e', '#78350f', '#58240a', ox, oy);
          // Checkered Table Runner
          this.drawBox(this.ctx, 6.6, 5, 0.71, 1.2, 1.6, 0.02, '#fef08a', '#fde047', '#eab308', ox, oy);
        }
      });

      // 11. Houseplants (Monstera)
      const plants = [
        { gx: 0.8, gy: 8.5, xMin: 0.4, xMax: 1.2, yMin: 8.1, yMax: 8.9 },
        { gx: 8.5, gy: 1.5, xMin: 8.1, xMax: 8.9, yMin: 1.1, yMax: 1.9 }
      ];
      plants.forEach(p => {
        list.push({
          xMin: p.xMin, xMax: p.xMax,
          yMin: p.yMin, yMax: p.yMax,
          draw: () => {
            const root = isoToScreen(p.gx, p.gy, 0, ox, oy);
            this.ctx.fillStyle = '#ea580c';
            this.ctx.beginPath();
            this.ctx.ellipse(root.x, root.y, 8, 4, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = '#15803d';
            for (let a = 0; a < 6; a++) {
              const ang = (a / 6) * Math.PI * 2;
              this.ctx.beginPath();
              this.ctx.ellipse(root.x + Math.cos(ang) * 12, root.y - 12 + Math.sin(ang) * 6, 8, 5, ang, 0, Math.PI * 2);
              this.ctx.fill();
            }
          }
        });
      });

      // 12. Outdoor Grand Multi-Tiered Fountain (x: 14, y: 10)
      list.push({
        xMin: 13.9, xMax: 17.1,
        yMin: 9.9, yMax: 13.1,
        draw: () => {
          const ctx = this.ctx;
          ctx.save();
          ctx.globalAlpha = this.outsideAlpha;

          const center = isoToScreen(15.5, 11.5, 0, ox, oy);
          // Outer Stone Basin
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.ellipse(center.x, center.y, 52, 26, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Pool Water with animated ripples
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.ellipse(center.x, center.y - 4, 45, 22, 0, 0, Math.PI * 2);
          ctx.fill();

          const tick = performance.now() * 0.003;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(center.x, center.y - 4, 20 + (tick % 2) * 12, 10 + (tick % 2) * 6, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Inner Elevated Tier
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.ellipse(center.x, center.y - 20, 24, 12, 0, 0, Math.PI * 2);
          ctx.fill();

          // Spouting Water Stream
          const wave = Math.sin(performance.now() * 0.008) * 5;
          ctx.fillStyle = '#f0f9ff';
          ctx.beginPath();
          ctx.arc(center.x, center.y - 34 + wave, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      });

      // 13. Courtyard Trees (Sakura & Green Oaks)
      const trees = [
        { gx: 11, gy: 2, sakura: true },
        { gx: 17, gy: 2, sakura: false },
        { gx: 14, gy: 2, sakura: true },
        { gx: 19, gy: 9, sakura: false },
        { gx: 11, gy: 16, sakura: true },
        { gx: 17, gy: 16, sakura: false },
        { gx: 14, gy: 18, sakura: true },
        { gx: 4, gy: 14, sakura: false },
        { gx: 7, gy: 14, sakura: true },
        { gx: 12, gy: 6, sakura: false },
        { gx: 17, gy: 6, sakura: true },
        { gx: 10, gy: 12, sakura: false }
      ];

      trees.forEach(t => {
        list.push({
          xMin: t.gx + 0.2, xMax: t.gx + 0.8,
          yMin: t.gy + 0.2, yMax: t.gy + 0.8,
          draw: () => {
            const ctx = this.ctx;
            ctx.save();
            ctx.globalAlpha = this.outsideAlpha;

            const root = isoToScreen(t.gx + 0.5, t.gy + 0.5, 0, ox, oy);
            // Trunk
            ctx.fillStyle = '#5c3a21';
            ctx.fillRect(root.x - 6, root.y - 34, 12, 34);
            // Canopy
            ctx.fillStyle = t.sakura ? '#f472b6' : '#22c55e';
            ctx.beginPath();
            ctx.arc(root.x, root.y - 50, 30, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = t.sakura ? '#ec4899' : '#16a34a';
            ctx.beginPath();
            ctx.arc(root.x - 8, root.y - 56, 18, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
          }
        });
      });

      // 14. Outdoor Benches & Cafe Tables
      const outdoorDecor = [
        { gx: 11, gy: 9, type: 'bench', w: 1.6, d: 0.6 },
        { gx: 18, gy: 11, type: 'bench', w: 1.6, d: 0.6 },
        { gx: 15, gy: 5, type: 'table', w: 1.4, d: 1.4 }
      ];

      outdoorDecor.forEach(d => {
        list.push({
          xMin: d.gx, xMax: d.gx + d.w,
          yMin: d.gy, yMax: d.gy + d.d,
          draw: () => {
            const ctx = this.ctx;
            ctx.save();
            ctx.globalAlpha = this.outsideAlpha;

            if (d.type === 'bench') {
              this.drawBox(ctx, d.gx, d.gy, 0, 1.6, 0.6, 0.45, '#78350f', '#58240a', '#451a03', ox, oy);
            } else {
              // Cafe Table with Umbrella
              this.drawBox(ctx, d.gx, d.gy, 0, 1.4, 1.4, 0.7, '#f8fafc', '#e2e8f0', '#cbd5e1', ox, oy);
              const p = isoToScreen(d.gx + 0.7, d.gy + 0.7, 2.2, ox, oy);
              ctx.fillStyle = '#38bdf8';
              ctx.beginPath();
              ctx.arc(p.x, p.y, 24, 0, Math.PI * 2);
              ctx.fill();
            }

            ctx.restore();
          }
        });
      });
    }

    // --- Topological Isometric Sorting (Occlusion Graph with Kahn's Algorithm) ---
    sortIsometricEntities(entities) {
      const n = entities.length;
      for (let i = 0; i < n; i++) {
        const e = entities[i];
        e.baseDepth = (e.xMin + e.xMax + e.yMin + e.yMax) / 2;
      }

      function isBehind(b, a) {
        // Characters to characters: strict ground depth order
        if (b.isChar && a.isChar) {
          return b.baseDepth < a.baseDepth;
        }

        // 1. b is strictly behind a along X, and their Y intervals overlap
        const overlapY = (b.yMax > a.yMin && b.yMin < a.yMax);
        if (b.xMax <= a.xMin && overlapY) return true;

        // 2. b is strictly behind a along Y, and their X intervals overlap
        const overlapX = (b.xMax > a.xMin && b.xMin < a.xMax);
        if (b.yMax <= a.yMin && overlapX) return true;

        // 3. b is behind a in both X and Y
        if (b.xMax <= a.xMin && b.yMax <= a.yMin) return true;

        return false;
      }

      const adj = Array.from({ length: n }, () => []);
      const inDegree = new Int32Array(n);

      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const e1 = entities[i];
          const e2 = entities[j];

          const bBehindA = isBehind(e1, e2);
          const aBehindB = isBehind(e2, e1);

          if (bBehindA && !aBehindB) {
            adj[i].push(j);
            inDegree[j]++;
          } else if (aBehindB && !bBehindA) {
            adj[j].push(i);
            inDegree[i]++;
          }
        }
      }

      const ready = [];
      for (let i = 0; i < n; i++) {
        if (inDegree[i] === 0) ready.push(i);
      }

      const result = [];
      while (ready.length > 0) {
        let bestIdx = 0;
        for (let k = 1; k < ready.length; k++) {
          if (entities[ready[k]].baseDepth < entities[ready[bestIdx]].baseDepth) {
            bestIdx = k;
          }
        }
        const curr = ready.splice(bestIdx, 1)[0];
        result.push(entities[curr]);

        const neighbors = adj[curr];
        for (let m = 0; m < neighbors.length; m++) {
          const next = neighbors[m];
          inDegree[next]--;
          if (inDegree[next] === 0) {
            ready.push(next);
          }
        }
      }

      // Robust fallback for any unhandled cycle (should not occur with convex shapes)
      if (result.length < n) {
        const included = new Set(result);
        const leftovers = [];
        for (let i = 0; i < n; i++) {
          if (!included.has(entities[i])) leftovers.push(entities[i]);
        }
        leftovers.sort((a, b) => a.baseDepth - b.baseDepth);
        result.push(...leftovers);
      }

      return result;
    }

    drawScreen(ctx, sx, sy, isMain) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(sx - 15, sy - 24, 30, 20);
      ctx.fillStyle = isMain ? '#1e293b' : '#022c22';
      ctx.fillRect(sx - 13, sy - 22, 26, 16);

      // Syntax lines
      const tick = performance.now() * 0.003;
      ctx.fillStyle = isMain ? '#38bdf8' : '#34d399';
      for (let i = 0; i < 4; i++) {
        const lw = 8 + ((i * 7 + Math.floor(tick)) % 12);
        ctx.fillRect(sx - 11, sy - 20 + i * 4, lw, 2);
      }
    }

    // --- Refined Character Rendering ---
    drawCharacter(ctx, c, ox, oy) {
      const pos = isoToScreen(c.x, c.y, c.z, ox, oy);
      ctx.save();

      // Soft Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, 11, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();

      if (c.isCat) {
        const time = performance.now() * 0.006;
        const isWalking = c.path && c.path.length > 0;
        const face = c.facing || 1;
        const col = '#ea580c'; // Warm orange tabby
        const white = '#f8fafc'; // White paws and chest
        const dark = '#9a3412';  // Tabby stripes
        const pink = '#f472b6';  // Inner ear and nose

        ctx.translate(pos.x, pos.y);
        ctx.scale(face, 1);

        if (c.state === 'sleeping') {
          // Curled up sleeping fluffy donut
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(0, -6, 7.5, 0, Math.PI * 2);
          ctx.fill();

          // White belly patch
          ctx.fillStyle = white;
          ctx.beginPath();
          ctx.arc(1.5, -4.5, 3.8, 0, Math.PI * 2);
          ctx.fill();

          // Head tucked in
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(4.2, -6.5, 4.2, 0, Math.PI * 2);
          ctx.fill();

          // Cute ears
          ctx.beginPath();
          ctx.moveTo(3.2, -10.5); ctx.lineTo(4.5, -14); ctx.lineTo(6.2, -10.5);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(6.5, -10.5); ctx.lineTo(8.0, -13.5); ctx.lineTo(8.5, -9.5);
          ctx.fill();

          // Pink inner ear
          ctx.fillStyle = pink;
          ctx.beginPath();
          ctx.moveTo(4.0, -10.8); ctx.lineTo(4.6, -13); ctx.lineTo(5.6, -10.8);
          ctx.fill();

          // Curled tail wrapping around the front
          ctx.strokeStyle = col;
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(0, -5, 8.5, 0.4 * Math.PI, 1.4 * Math.PI);
          ctx.stroke();

          // Floating sleeping zZ
          const tick = (performance.now() * 0.0018) % 1;
          ctx.fillStyle = '#94a3b8';
          ctx.font = '600 9px monospace';
          ctx.fillText('z', 7, -13 - tick * 8);
          ctx.fillText('Z', 12, -18 - tick * 8);
        } else {
          // Standing or walking cat
          // 4 Legs with white paws (socks!)
          const legSwing = isWalking ? Math.sin(time * 2.2) * 2.5 : 0;
          ctx.fillStyle = col;
          // Back legs
          ctx.fillRect(-6, -4, 2.5, 4 + legSwing);
          ctx.fillRect(-3, -4, 2.5, 4 - legSwing);
          // Front legs
          ctx.fillRect(2, -4, 2.5, 4 - legSwing);
          ctx.fillRect(5, -4, 2.5, 4 + legSwing);

          // White paws
          ctx.fillStyle = white;
          ctx.fillRect(-6, -1 + legSwing, 2.5, 1.5);
          ctx.fillRect(-3, -1 - legSwing, 2.5, 1.5);
          ctx.fillRect(2, -1 - legSwing, 2.5, 1.5);
          ctx.fillRect(5, -1 + legSwing, 2.5, 1.5);

          // Plump Body
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.ellipse(0, isWalking ? -7 : -6, 7.5, 5, 0, 0, Math.PI * 2);
          ctx.fill();

          // White chest bib
          ctx.fillStyle = white;
          ctx.beginPath();
          ctx.ellipse(3, -5.5, 3.5, 3.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Tabby stripes on back
          ctx.strokeStyle = dark;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(-3, -10.5); ctx.lineTo(-2, -6);
          ctx.moveTo(0, -11); ctx.lineTo(0.5, -6.5);
          ctx.stroke();

          // Head
          ctx.fillStyle = col;
          const hy = isWalking ? -10.5 : -9.5;
          ctx.beginPath();
          ctx.arc(6.5, hy, 4.5, 0, Math.PI * 2);
          ctx.fill();

          // Triangular pointed ears
          ctx.beginPath();
          ctx.moveTo(4.2, hy - 3.5); ctx.lineTo(5.2, hy - 8.2); ctx.lineTo(7.2, hy - 4.2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(7.5, hy - 4.2); ctx.lineTo(9.5, hy - 8.0); ctx.lineTo(10.2, hy - 3.0);
          ctx.fill();

          // Pink inner ear
          ctx.fillStyle = pink;
          ctx.beginPath();
          ctx.moveTo(4.8, hy - 3.8); ctx.lineTo(5.4, hy - 7.2); ctx.lineTo(6.8, hy - 4.2);
          ctx.fill();

          // Eyes & tiny pink nose
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(7.2, hy - 1, 1.2, 1.8);
          ctx.fillStyle = pink;
          ctx.fillRect(9.2, hy + 0.2, 1.2, 1.0);

          // Animated curving tail with sine-wave sway
          const tailSway = Math.sin(time * 1.5) * 4;
          ctx.strokeStyle = col;
          ctx.lineWidth = 2.4;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-6, -7);
          ctx.quadraticCurveTo(-12, -10 + tailSway, -11, -16 + tailSway);
          ctx.stroke();

          // White tail tip
          ctx.strokeStyle = white;
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(-11, -15 + tailSway);
          ctx.lineTo(-11, -17 + tailSway);
          ctx.stroke();
        }

        ctx.restore();
        this.drawNameTag(ctx, pos.x, pos.y - 36, c);
        return;
      } else {
        const time = performance.now() * 0.007;
        const isWalking = (c.path && c.path.length > 0) || (c.isPlayer && (this.keys['w'] || this.keys['s'] || this.keys['a'] || this.keys['d'] || this.dpadDir));
        const bob = isWalking ? Math.sin(time) * 2.5 : 0;
        const px = pos.x;
        const py = pos.y + bob;

        // Pants / Legs
        ctx.fillStyle = c.pants || '#1e293b';
        if (isWalking) {
          const swing = Math.sin(time) * 4;
          ctx.fillRect(px - 5 + swing, py - 12, 3.5, 12);
          ctx.fillRect(px + 1.5 - swing, py - 12, 3.5, 12);
        } else {
          ctx.fillRect(px - 4.5, py - 12, 3.5, 12);
          ctx.fillRect(px + 1, py - 12, 3.5, 12);
        }

        // Shirt
        ctx.fillStyle = c.shirt || '#e06c43';
        this.roundRect(ctx, px - 7, py - 25, 14, 13, 3);
        ctx.fill();

        // Arms
        ctx.fillStyle = c.shirt || '#e06c43';
        ctx.fillRect(px - 9, py - 24, 2.5, 9);
        ctx.fillRect(px + 6.5, py - 24, 2.5, 9);

        // Head
        ctx.fillStyle = c.skin || '#f5d0b5';
        ctx.beginPath();
        ctx.arc(px, py - 31, 6.5, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = c.hair || '#1a1a1a';
        if (c.hairStyle === 1) {
          ctx.beginPath();
          ctx.arc(px, py - 33, 7, Math.PI * 0.9, Math.PI * 2.1);
          ctx.fill();
          ctx.fillRect(px - 7, py - 32, 3, 9);
          ctx.fillRect(px + 4, py - 32, 3, 9);
        } else if (c.hairStyle === 2) {
          ctx.beginPath();
          ctx.arc(px, py - 33, 7, Math.PI * 0.9, Math.PI * 2.1);
          ctx.fill();
          ctx.fillRect(px + 5, py - 35, 4, 8);
        } else {
          ctx.beginPath();
          ctx.arc(px, py - 33, 7.2, Math.PI * 0.95, Math.PI * 2.05);
          ctx.fill();
        }

        // Eyes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px - 3, py - 32, 1.8, 2);
        ctx.fillRect(px + 1.2, py - 32, 1.8, 2);
      }

      // Minimalist Floating Name Tag (No harsh highlight)
      this.drawNameTag(ctx, pos.x, pos.y - 48, c);

      ctx.restore();
    }

    drawNameTag(ctx, sx, sy, c) {
      ctx.save();
      ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const text = c.name;
      const textWidth = ctx.measureText(text).width;
      const padX = 8;
      const bw = textWidth + padX * 2;
      const bh = 18;
      const bx = sx - bw / 2;
      const by = sy;

      const textColor = c.nameColor || (c.isPlayer ? '#fde047' : '#f8fafc');

      // Clean, understated dark glass pill with subtle personality-tinted border
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = c.isPlayer
        ? 'rgba(250, 204, 21, 0.75)'
        : (c.nameColor ? this.hexToRgba(textColor, 0.35) : 'rgba(255, 255, 255, 0.15)');
      ctx.lineWidth = 1;
      this.roundRect(ctx, bx, by, bw, bh, 9);
      ctx.fill();
      ctx.stroke();

      // Styled character name with its distinct color
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, sx, by + bh / 2 + 0.5);

      ctx.restore();
    }

    hexToRgba(hex, alpha = 1) {
      let clean = hex.replace('#', '');
      if (clean.length === 3) clean = clean.split('').map(x => x + x).join('');
      const num = parseInt(clean, 16);
      return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
    }

    drawLightingOverlay(ctx, ox, oy) {
      if (this.currentTimeState === 'day') return;

      ctx.save();
      if (this.currentTimeState === 'sunset') {
        ctx.fillStyle = 'rgba(255, 120, 40, 0.14)';
      } else if (this.currentTimeState === 'night') {
        ctx.fillStyle = 'rgba(10, 20, 50, 0.32)';
      } else if (this.currentTimeState === 'galaxy') {
        ctx.fillStyle = 'rgba(60, 20, 80, 0.28)';
      }
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
    }

    drawBox(ctx, gx, gy, gz, w, d, h, top, left, right, ox, oy) {
      const t0 = isoToScreen(gx, gy, gz + h, ox, oy);
      const t1 = isoToScreen(gx + w, gy, gz + h, ox, oy);
      const t2 = isoToScreen(gx + w, gy + d, gz + h, ox, oy);
      const t3 = isoToScreen(gx, gy + d, gz + h, ox, oy);

      ctx.fillStyle = top;
      ctx.beginPath();
      ctx.moveTo(t0.x, t0.y); ctx.lineTo(t1.x, t1.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(t3.x, t3.y);
      ctx.closePath();
      ctx.fill();

      const r1 = isoToScreen(gx + w, gy, gz, ox, oy);
      const r2 = isoToScreen(gx + w, gy + d, gz, ox, oy);
      ctx.fillStyle = right;
      ctx.beginPath();
      ctx.moveTo(t1.x, t1.y); ctx.lineTo(r1.x, r1.y); ctx.lineTo(r2.x, r2.y); ctx.lineTo(t2.x, t2.y);
      ctx.closePath();
      ctx.fill();

      const l3 = isoToScreen(gx, gy + d, gz, ox, oy);
      ctx.fillStyle = left;
      ctx.beginPath();
      ctx.moveTo(t3.x, t3.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(r2.x, r2.y); ctx.lineTo(l3.x, l3.y);
      ctx.closePath();
      ctx.fill();
    }

    roundRect(ctx, x, y, width, height, radius) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }
  }

  // --- Bootstrap on Window Load ---
  window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('space-canvas');
    if (!canvas) return;

    const world = new LudwigWorld(canvas);
    window.LUDWIG_WORLD = world;

    const storedName = localStorage.getItem('ludwigia_visitor_name');
    const nameModal = document.getElementById('modal-welcome-name');
    if (!storedName && nameModal) {
      nameModal.classList.add('open');
    }

    document.getElementById('form-set-name')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('visitor-name-input');
      const val = input.value.trim() || 'Traveler';
      world.setPlayerName(val);
      nameModal.classList.remove('open');
    });

    document.querySelectorAll('[data-mood]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-mood]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        world.mood = btn.dataset.mood;
      });
    });

    document.querySelectorAll('[data-audio]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-audio]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        world.audio.play(btn.dataset.audio);
      });
    });

    document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
      world.zoom = Math.min(2.0, world.zoom * 1.15);
    });
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
      world.zoom = Math.max(0.65, world.zoom * 0.85);
    });
    document.getElementById('btn-zoom-reset')?.addEventListener('click', () => {
      world.zoom = 1.2;
    });

    document.querySelectorAll('.space-modal-close, [data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.space-modal-backdrop')?.classList.remove('open');
      });
    });

    document.getElementById('btn-citation')?.addEventListener('click', () => {
      document.getElementById('modal-citation')?.classList.add('open');
    });
  });
})();
