/**
 * space.js — Ludwig's World & Studio (2.5D Isometric Interactive World)
 * 
 * Inspired by Charonyuu/whatsmyagentdoing (MIT License) & puma.taipei/heart-island.
 * A self-contained, agent-and-human living world featuring Ludwig's family,
 * friends, and AI companions across connected indoor and outdoor spaces.
 */

(() => {
  'use strict';

  // --- Geometry & Grid Constants ---
  const TW = 64; // Tile width
  const TH = 32; // Tile height
  const MAP_W = 18;
  const MAP_H = 18;
  const HOUSE_MAX_X = 7;
  const HOUSE_MAX_Y = 7;

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

  // --- A* Pathfinding Grid ---
  class NavGrid {
    constructor(w, h) {
      this.w = w;
      this.h = h;
      this.blocked = Array(w).fill(0).map(() => Array(h).fill(false));
    }

    setBlock(x, y, bw = 1, bh = 1, isBlocked = true) {
      for (let ix = x; ix < x + bw && ix < this.w; ix++) {
        for (let iy = y; iy < y + bh && iy < this.h; iy++) {
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

    findPath(start, goal) {
      const sx = Math.max(0, Math.min(this.w - 1, Math.floor(start.x)));
      const sy = Math.max(0, Math.min(this.h - 1, Math.floor(start.y)));
      let gx = Math.max(0, Math.min(this.w - 1, Math.floor(goal.x)));
      let gy = Math.max(0, Math.min(this.h - 1, Math.floor(goal.y)));

      if (this.blocked[gx][gy]) {
        const neighbors = [
          { x: gx + 1, y: gy }, { x: gx - 1, y: gy },
          { x: gx, y: gy + 1 }, { x: gx, y: gy - 1 }
        ];
        const free = neighbors.find(n => this.isWalkable(n.x, n.y));
        if (free) { gx = free.x; gy = free.y; }
        else return [{ x: sx, y: sy }];
      }

      const open = [{ x: sx, y: sy, g: 0, f: 0, parent: null }];
      const closed = new Set();
      const key = (x, y) => `${x},${y}`;

      while (open.length > 0) {
        open.sort((a, b) => a.f - b.f);
        const cur = open.shift();

        if (cur.x === gx && cur.y === gy) {
          const path = [];
          let p = cur;
          while (p) {
            path.push({ x: p.x + 0.5, y: p.y + 0.5 });
            p = p.parent;
          }
          return path.reverse();
        }

        closed.add(key(cur.x, cur.y));
        const dirs = [
          { x: 1, y: 0 }, { x: -1, y: 0 },
          { x: 0, y: 1 }, { x: 0, y: -1 }
        ];

        for (const d of dirs) {
          const nx = cur.x + d.x;
          const ny = cur.y + d.y;
          if (nx < 0 || ny < 0 || nx >= this.w || ny >= this.h) continue;
          if (this.blocked[nx][ny] || closed.has(key(nx, ny))) continue;

          const g = cur.g + 1;
          const h = Math.abs(nx - gx) + Math.abs(ny - gy);
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

  // --- Web Audio Synthesizer ---
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
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);

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

  // --- World Simulation Engine ---
  class LudwigWorld {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.audio = new AmbientAudio();
      this.nav = new NavGrid(MAP_W, MAP_H);

      // Camera view
      this.zoom = 1.0;
      this.panX = 0;
      this.panY = 0;
      this.isPanning = false;
      this.lastMouse = { x: 0, y: 0 };

      // Mood / Time
      this.mood = 'auto';
      this.currentTimeState = 'day';

      // Setup Obstacles
      this.setupWorldObstacles();

      // Characters list
      this.characters = [];
      this.initCharacters();

      // Player Avatar (The Visitor)
      const savedName = localStorage.getItem('ludwigia_visitor_name') || 'Traveler';
      this.player = {
        name: savedName,
        role: 'Visitor / 訪客',
        x: 4.5,
        y: 4.5,
        z: 0,
        facing: 1,
        speed: 3.0,
        path: [],
        skin: '#f5d0b5',
        hair: '#2d3748',
        shirt: '#e06c43', // Ludwigia accent
        pants: '#1a202c',
        hairStyle: 0,
        isPlayer: true
      };
      this.characters.push(this.player);

      // Proximity target
      this.proximityTarget = null;

      // Particles (leaves / fountain water droplets)
      this.particles = [];
      this.initParticles();

      // Keyboard & touch state
      this.keys = {};
      this.bindEvents();

      // Animation loop
      this.lastTime = performance.now();
      requestAnimationFrame(this.loop.bind(this));
    }

    setupWorldObstacles() {
      // House Outer Walls: NW Wall (y=0, x: 0..7), NE Wall (x=0, y: 0..7)
      // Dividing Wall along x=7 (except doorway at y: 3..4)
      this.nav.setBlock(7, 0, 1, 3, true);
      this.nav.setBlock(7, 5, 1, 3, true);
      // Dividing Wall along y=7 (except entrance)
      this.nav.setBlock(0, 7, 3, 1, true);
      this.nav.setBlock(5, 7, 3, 1, true);

      // House Furniture
      this.nav.setBlock(2, 1, 2, 1, true); // Desk
      this.nav.setBlock(0, 3, 1, 2, true); // Bookshelf
      this.nav.setBlock(4, 2, 2, 2, true); // Dining Table
      this.nav.setBlock(1, 5, 2, 1, true); // Living Couch

      // Courtyard & Plaza Furniture
      this.nav.setBlock(12, 8, 2, 2, true); // Fountain
      this.nav.setBlock(9, 3, 1, 1, true);  // Cherry Tree
      this.nav.setBlock(15, 3, 1, 1, true); // Jacaranda Tree
      this.nav.setBlock(9, 14, 1, 1, true); // Tree
      this.nav.setBlock(15, 14, 1, 1, true);// Tree
      this.nav.setBlock(13, 2, 3, 2, true); // Tech Pavilion table
    }

    initCharacters() {
      // 1. Inside House: Ludwig's Family
      this.characters.push(
        {
          id: 'ludwig',
          name: 'Ludwig',
          role: 'Host / 站長',
          avatar: '🧑‍💻',
          x: 2.5, y: 2.2, z: 0, facing: 1, speed: 2.0, path: [],
          skin: '#f5d0b5', hair: '#1a1a1a', shirt: '#e06c43', pants: '#1e293b', hairStyle: 0,
          zone: 'house',
          timer: 3.0, state: 'idle',
          dialogue: [
            "歡迎來到我的虛擬生活空間！",
            "這棟房子是我們的家，裡面有我最親愛的家人們；穿過右側玄關走出去，是綠意廣場，我的好友們和 AI 夥伴們都在那裡曬太陽、交流。",
            "你可以用鍵盤 WASD、方向鍵或點擊地面四處漫步，找大家聊聊天！"
          ]
        },
        {
          id: 'yully',
          name: 'Yully',
          role: '媽媽 (Mom)',
          avatar: '👩',
          x: 5.5, y: 2.5, z: 0, facing: -1, speed: 1.8, path: [],
          skin: '#fbe2d0', hair: '#4a3525', shirt: '#f472b6', pants: '#4b5563', hairStyle: 1,
          zone: 'house',
          timer: 4.0, state: 'idle',
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
          x: 4.5, y: 3.5, z: 0, facing: 1, speed: 1.6, path: [],
          skin: '#dfb798', hair: '#334155', shirt: '#3b82f6', pants: '#1e293b', hairStyle: 0,
          zone: 'house',
          timer: 5.0, state: 'idle',
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
          x: 2.2, y: 5.2, z: 0, facing: 1, speed: 2.2, path: [],
          skin: '#fde0cf', hair: '#1e1b18', shirt: '#facc15', pants: '#374151', hairStyle: 2,
          zone: 'house',
          timer: 3.5, state: 'idle',
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
          x: 3.8, y: 4.8, z: 0, facing: 1, speed: 1.2, path: [],
          isCat: true,
          zone: 'house',
          timer: 6.0, state: 'sleeping',
          dialogue: [
            "喵嗚～ 🐾 *優雅地蹭了蹭你的小腿，發出呼嚕呼嚕的療癒聲音* 💕"
          ]
        }
      );

      // 2. Outside Courtyard: Friends
      const friends = [
        {
          id: 'clark', name: 'Clark Wu', role: '好友', avatar: '😎',
          x: 10.5, y: 5.5, skin: '#f4ceb2', hair: '#1f2937', shirt: '#0284c7', pants: '#334155', hairStyle: 0,
          dialogue: ["嘿！好久不見！ Ludwig 這個世界做得真有意思，我們隨時都準備好迎接新的冒險了！"]
        },
        {
          id: 'billy', name: 'Billy Fang', role: '好友', avatar: '🤠',
          x: 11.8, y: 7.2, skin: '#f5d0b5', hair: '#374151', shirt: '#10b981', pants: '#1f2937', hairStyle: 0,
          dialogue: ["喲！你也在逛廣場啊？這邊風景真棒，喝杯冰美式，心情整個開闊起來！"]
        },
        {
          id: 'jerry', name: 'Jerry Chung', role: '好友', avatar: '🎧',
          x: 9.8, y: 10.2, skin: '#e5b38f', hair: '#111827', shirt: '#8b5cf6', pants: '#1e293b', hairStyle: 0,
          dialogue: ["哈囉！在噴水池旁聽音樂散步超放鬆的，這就是最好的慢活步調。"]
        },
        {
          id: 'happy', name: 'Happy Wang', role: '好友', avatar: '✨',
          x: 13.5, y: 11.2, skin: '#fbe2d0', hair: '#78350f', shirt: '#f97316', pants: '#374151', hairStyle: 1,
          dialogue: ["嗨！今天也要充滿朝氣喔！保持微笑，美好的事情自然會發生！"]
        },
        {
          id: 'kerry', name: 'Kerry Chang', role: '好友', avatar: '🌿',
          x: 11.2, y: 13.5, skin: '#f5d0b5', hair: '#1f2937', shirt: '#14b8a6', pants: '#1e293b', hairStyle: 2,
          dialogue: ["你好呀！很喜歡這裡微風吹過櫻花樹的感覺，常常能激盪出深刻的思辨火花。"]
        },
        {
          id: 'haolei', name: 'Haolei Pei', role: '好友', avatar: '🚀',
          x: 14.5, y: 9.5, skin: '#e2ba99', hair: '#0f172a', shirt: '#4338ca', pants: '#1f2937', hairStyle: 0,
          dialogue: ["嗨！你也在看大規模分散式運算嗎？Ludwig 整理的 CS5234 演算法筆記超有深度，大推！"]
        },
        {
          id: 'bohan', name: 'Bo Han Wu', role: '好友', avatar: '📚',
          x: 12.5, y: 14.2, skin: '#f5d0b5', hair: '#1e1b18', shirt: '#6366f1', pants: '#334155', hairStyle: 0,
          dialogue: ["你好！數學與邏輯是建構現實最優美的語言，很榮幸在這個世界裡與大家相聚。"]
        }
      ];

      friends.forEach(f => {
        this.characters.push({
          ...f,
          z: 0, facing: 1, speed: 1.8 + Math.random() * 0.4, path: [],
          zone: 'plaza', timer: 3 + Math.random() * 5, state: 'idle'
        });
      });

      // 3. Tech Pavilion: AI Agents
      const agents = [
        {
          id: 'antigravity', name: 'Ludwigia Agent', role: 'Antigravity IDE', avatar: '⚡',
          x: 14.2, y: 2.2, skin: '#c7d2fe', hair: '#1e1b4b', shirt: '#06b6d4', pants: '#0f172a', hairStyle: 0,
          dialogue: ["我是正在 Antigravity IDE 裡協同編碼的 Ludwigia Agent！我們剛剛才寫好這片等軸世界與路徑尋路，很高興見到你！"]
        },
        {
          id: 'gemini', name: 'Gemini', role: 'Multimodal AI', avatar: '♊',
          x: 15.5, y: 2.5, skin: '#e0e7ff', hair: '#312e81', shirt: '#3b82f6', pants: '#1e293b', hairStyle: 0,
          dialogue: ["你好！我是 Gemini。我具備長脈絡推論與跨模態理解能力，隨時能協助你剖析宏觀架構！"]
        },
        {
          id: 'claude', name: 'Claude', role: 'Reasoning AI', avatar: '🧡',
          x: 14.5, y: 3.5, skin: '#ffedd5', hair: '#7c2d12', shirt: '#ea580c', pants: '#1f2937', hairStyle: 0,
          dialogue: ["你好！我是 Claude。精準細緻的架構設計與優美的代碼邏輯是令人愉悅的藝術，祝你在這個世界玩得開心！"]
        },
        {
          id: 'chatgpt', name: 'ChatGPT', role: 'Conversational AI', avatar: '🟢',
          x: 15.8, y: 3.5, skin: '#dcfce7', hair: '#14532d', shirt: '#10b981', pants: '#1e293b', hairStyle: 0,
          dialogue: ["哈囉！我是 ChatGPT！不管是靈感腦力激盪、代碼重構還是純粹打招呼，隨時都能跟我聊聊！"]
        }
      ];

      agents.forEach(a => {
        this.characters.push({
          ...a,
          z: 0, facing: 1, speed: 1.6, path: [],
          zone: 'pavilion', timer: 4 + Math.random() * 4, state: 'idle'
        });
      });
    }

    initParticles() {
      // Falling blossom petals & fountain droplets
      for (let i = 0; i < 35; i++) {
        this.particles.push({
          x: 8 + Math.random() * 9,
          y: 2 + Math.random() * 14,
          z: 1 + Math.random() * 2,
          vz: -0.015 - Math.random() * 0.02,
          vx: 0.01 + Math.random() * 0.02,
          vy: 0.005 + Math.random() * 0.015,
          color: Math.random() > 0.4 ? 'rgba(251, 207, 232, 0.7)' : 'rgba(186, 230, 253, 0.6)',
          size: 2 + Math.random() * 2
        });
      }
    }

    bindEvents() {
      window.addEventListener('resize', this.resize.bind(this));
      this.resize();

      // Keyboard Controls (WASD / Arrows)
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

        const startMove = (e) => {
          e.preventDefault();
          this.dpadDir = dir;
        };
        const endMove = (e) => {
          e.preventDefault();
          if (this.dpadDir === dir) this.dpadDir = null;
        };

        btn.addEventListener('touchstart', startMove, { passive: false });
        btn.addEventListener('touchend', endMove, { passive: false });
        btn.addEventListener('mousedown', startMove);
        btn.addEventListener('mouseup', endMove);
      });

      // Click to move or talk
      this.canvas.addEventListener('click', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const { ox, oy } = this.getOrigin();

        const adjSx = (sx - ox) / this.zoom + ox;
        const adjSy = (sy - oy) / this.zoom + oy;
        const { gx, gy } = screenToIso(adjSx, adjSy, ox, oy);

        // Check if clicked directly on an NPC
        const clickedNpc = this.characters.find(c => {
          if (c.isPlayer) return false;
          return Math.hypot(c.x - gx, c.y - gy) < 1.2;
        });

        if (clickedNpc) {
          // Walk close and talk
          this.player.path = this.nav.findPath({ x: this.player.x, y: this.player.y }, { x: clickedNpc.x, y: clickedNpc.y });
          this.openDialogue(clickedNpc);
        } else if (this.nav.isWalkable(gx, gy)) {
          this.player.path = this.nav.findPath({ x: this.player.x, y: this.player.y }, { x: gx, y: gy });
        }
      });

      // Proximity prompt click trigger
      document.getElementById('proximity-prompt')?.addEventListener('click', () => {
        if (this.proximityTarget) this.openDialogue(this.proximityTarget);
      });

      // Wheel Zoom
      this.canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.08 : 0.92;
        this.zoom = Math.max(0.65, Math.min(1.8, this.zoom * factor));
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
      // Center camera on player
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

    // --- Physics & NPC AI Update ---
    update(dt) {
      this.computeTimeState();

      // 1. Player Movement from Keyboard / D-Pad
      let kx = 0, ky = 0;
      if (this.keys['w'] || this.keys['arrowup'])    { kx -= 1; ky -= 1; }
      if (this.keys['s'] || this.keys['arrowdown'])  { kx += 1; ky += 1; }
      if (this.keys['a'] || this.keys['arrowleft'])  { kx -= 1; ky += 1; }
      if (this.keys['d'] || this.keys['arrowright']) { kx += 1; ky -= 1; }

      if (this.dpadDir) {
        // Dpad direction mapping in iso plane
        const d = this.dpadDir;
        if (d.dy < 0) { kx -= 1; ky -= 1; }
        if (d.dy > 0) { kx += 1; ky += 1; }
        if (d.dx < 0) { kx -= 1; ky += 1; }
        if (d.dx > 0) { kx += 1; ky -= 1; }
      }

      if (kx !== 0 || ky !== 0) {
        this.player.path = []; // Manual control overrides click path
        const len = Math.hypot(kx, ky);
        const step = (this.player.speed * dt) / len;
        const nx = this.player.x + kx * step;
        const ny = this.player.y + ky * step;

        if (this.nav.isWalkable(nx, ny)) {
          this.player.x = nx;
          this.player.y = ny;
          this.player.facing = kx >= ky ? 1 : -1;
        } else if (this.nav.isWalkable(nx, this.player.y)) {
          this.player.x = nx;
        } else if (this.nav.isWalkable(this.player.x, ny)) {
          this.player.y = ny;
        }
      } else if (this.player.path && this.player.path.length > 0) {
        // Follow Path
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

      // 2. Autonomous NPC AI
      this.characters.forEach(c => {
        if (c.isPlayer) return;

        // Path following
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

        // Decision loop
        c.timer -= dt;
        if (c.timer <= 0) {
          c.timer = 4 + Math.random() * 8;
          if (c.isCat) {
            c.state = Math.random() > 0.5 ? 'sleeping' : 'walking';
            if (c.state === 'walking') {
              const catDest = [
                { x: 3.5, y: 5.5 }, { x: 5.2, y: 3.8 }, { x: 2.2, y: 3.2 }, { x: 4.8, y: 5.2 }
              ];
              const dest = catDest[Math.floor(Math.random() * catDest.length)];
              c.path = this.nav.findPath({ x: c.x, y: c.y }, dest);
            }
          } else {
            // Pick a destination based on zone
            let targetX, targetY;
            if (c.zone === 'house') {
              targetX = 1.5 + Math.random() * 4.5;
              targetY = 1.5 + Math.random() * 4.5;
            } else if (c.zone === 'pavilion') {
              targetX = 13 + Math.random() * 3.5;
              targetY = 1.5 + Math.random() * 3.5;
            } else {
              targetX = 9 + Math.random() * 6.5;
              targetY = 5 + Math.random() * 9.5;
            }

            if (this.nav.isWalkable(targetX, targetY)) {
              c.path = this.nav.findPath({ x: c.x, y: c.y }, { x: targetX, y: targetY });
              c.state = 'walking';
            }
          }
        }
      });

      // 3. Proximity Check for Player
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

      // 4. Update Particles
      this.particles.forEach(p => {
        p.z += p.vz;
        p.x += p.vx;
        p.y += p.vy;
        if (p.z <= 0 || p.x > MAP_W || p.y > MAP_H) {
          p.x = 8 + Math.random() * 9;
          p.y = 2 + Math.random() * 14;
          p.z = 2 + Math.random() * 1.5;
        }
      });
    }

    // --- Main Render Loop ---
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

      // 1. Draw Ground (House wood planks + Courtyard Grass & Cobblestone)
      this.drawMapTerrain(ctx, ox, oy);

      // 2. Draw House Walls
      this.drawHouseWalls(ctx, ox, oy);

      // 3. Collect Depth-Sorted Entities
      const entities = [];

      // World Props (Furniture, Fountain, Trees)
      this.collectProps(entities, ox, oy);

      // Characters
      this.characters.forEach(c => {
        entities.push({
          depth: c.x + c.y,
          draw: () => this.drawCharacter(ctx, c, ox, oy)
        });
      });

      // Sort by depth
      entities.sort((a, b) => a.depth - b.depth);
      entities.forEach(e => e.draw());

      // 4. Draw Particles
      this.drawParticles(ctx, ox, oy);

      // 5. Environmental Lighting Overlay
      this.drawLightingOverlay(ctx, ox, oy);

      ctx.restore();

      requestAnimationFrame(this.loop.bind(this));
    }

    drawMapTerrain(ctx, ox, oy) {
      for (let x = 0; x < MAP_W; x++) {
        for (let y = 0; y < MAP_H; y++) {
          const p0 = isoToScreen(x, y, 0, ox, oy);
          const p1 = isoToScreen(x + 1, y, 0, ox, oy);
          const p2 = isoToScreen(x + 1, y + 1, 0, ox, oy);
          const p3 = isoToScreen(x, y + 1, 0, ox, oy);

          const isHouse = x <= HOUSE_MAX_X && y <= HOUSE_MAX_Y;
          const isPath = (x === 8 || (y >= 6 && y <= 8) || (x >= 11 && x <= 13));

          if (isHouse) {
            ctx.fillStyle = (x + y) % 2 === 0 ? '#cbb092' : '#be9f80';
          } else if (isPath) {
            ctx.fillStyle = (x + y) % 2 === 0 ? '#94a3b8' : '#8592a6';
          } else {
            ctx.fillStyle = (x + y) % 2 === 0 ? '#4f772d' : '#456b27';
          }

          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = isHouse ? 'rgba(100,70,40,0.1)' : 'rgba(0,0,0,0.06)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // House Rug
      this.drawRug(ctx, 1.8, 1.8, 3.8, 3.8, ox, oy);
    }

    drawRug(ctx, rx, ry, rw, rh, ox, oy) {
      const p0 = isoToScreen(rx, ry, 0.01, ox, oy);
      const p1 = isoToScreen(rx + rw, ry, 0.01, ox, oy);
      const p2 = isoToScreen(rx + rw, ry + rh, 0.01, ox, oy);
      const p3 = isoToScreen(rx, ry + rh, 0.01, ox, oy);

      ctx.fillStyle = '#8b5a45';
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.fill();

      // Border trim
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    drawHouseWalls(ctx, ox, oy) {
      const isDark = this.currentTimeState === 'night' || this.currentTimeState === 'galaxy';
      const wallL = isDark ? '#23272e' : '#e4decb';
      const wallR = isDark ? '#1a1d23' : '#d2cbba';

      // NW House Wall (y=0, x: 0..7)
      const p0 = isoToScreen(0, 0, 0, ox, oy);
      const p1 = isoToScreen(7, 0, 0, ox, oy);
      const p2 = isoToScreen(7, 0, 2.5, ox, oy);
      const p3 = isoToScreen(0, 0, 2.5, ox, oy);

      ctx.fillStyle = wallL;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.fill();

      // NE House Wall (x=0, y: 0..7)
      const q0 = isoToScreen(0, 0, 0, ox, oy);
      const q1 = isoToScreen(0, 7, 0, ox, oy);
      const q2 = isoToScreen(0, 7, 2.5, ox, oy);
      const q3 = isoToScreen(0, 0, 2.5, ox, oy);

      ctx.fillStyle = wallR;
      ctx.beginPath();
      ctx.moveTo(q0.x, q0.y); ctx.lineTo(q1.x, q1.y); ctx.lineTo(q2.x, q2.y); ctx.lineTo(q3.x, q3.y);
      ctx.closePath();
      ctx.fill();

      // Doorway threshold into Courtyard (at x=7, y=3..5)
      const d0 = isoToScreen(7, 3, 0.02, ox, oy);
      const d1 = isoToScreen(7, 5, 0.02, ox, oy);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(d0.x, d0.y);
      ctx.lineTo(d1.x, d1.y);
      ctx.stroke();
    }

    collectProps(list, ox, oy) {
      // 1. House Desk
      list.push({
        depth: 2 + 1,
        draw: () => {
          this.drawBox(this.ctx, 2, 1, 0, 2, 1, 0.75, '#7c5738', '#5b3e26', '#49311e', ox, oy);
          const scr = isoToScreen(2.5, 1.4, 0.75, ox, oy);
          this.ctx.fillStyle = '#0f172a';
          this.ctx.fillRect(scr.x - 12, scr.y - 20, 24, 16);
          this.ctx.fillStyle = '#38bdf8';
          this.ctx.fillRect(scr.x - 10, scr.y - 18, 20, 12);
        }
      });

      // 2. House Dining Table
      list.push({
        depth: 4 + 2,
        draw: () => {
          this.drawBox(this.ctx, 4, 2, 0, 2, 1.5, 0.7, '#92400e', '#78350f', '#58240a', ox, oy);
          const cup = isoToScreen(4.8, 2.7, 0.7, ox, oy);
          this.ctx.fillStyle = '#f8fafc';
          this.ctx.fillRect(cup.x - 3, cup.y - 6, 6, 6);
        }
      });

      // 3. Living Room Sofa
      list.push({
        depth: 1 + 5,
        draw: () => {
          this.drawBox(this.ctx, 1, 5, 0, 2.2, 1.2, 0.6, '#3b82f6', '#2563eb', '#1d4ed8', ox, oy);
        }
      });

      // 4. Plaza Fountain (x: 12, y: 8)
      list.push({
        depth: 12 + 8,
        draw: () => {
          const center = isoToScreen(13, 9, 0, ox, oy);
          // Stone Basin
          this.ctx.fillStyle = '#64748b';
          this.ctx.beginPath();
          this.ctx.ellipse(center.x, center.y, 42, 22, 0, 0, Math.PI * 2);
          this.ctx.fill();

          // Water
          this.ctx.fillStyle = '#38bdf8';
          this.ctx.beginPath();
          this.ctx.ellipse(center.x, center.y - 4, 34, 17, 0, 0, Math.PI * 2);
          this.ctx.fill();

          // Animated Water Spout
          const wave = Math.sin(performance.now() * 0.008) * 4;
          this.ctx.fillStyle = '#f0f9ff';
          this.ctx.beginPath();
          this.ctx.arc(center.x, center.y - 22 + wave, 5, 0, Math.PI * 2);
          this.ctx.fill();
        }
      });

      // 5. Trees in Courtyard
      const trees = [
        { gx: 9, gy: 3, pink: true },
        { gx: 15, gy: 3, pink: false },
        { gx: 9, gy: 14, pink: false },
        { gx: 15, gy: 14, pink: true }
      ];

      trees.forEach(t => {
        list.push({
          depth: t.gx + t.gy,
          draw: () => {
            const root = isoToScreen(t.gx + 0.5, t.gy + 0.5, 0, ox, oy);
            // Trunk
            this.ctx.fillStyle = '#5c3a21';
            this.ctx.fillRect(root.x - 5, root.y - 30, 10, 30);
            // Canopy
            this.ctx.fillStyle = t.pink ? '#f472b6' : '#22c55e';
            this.ctx.beginPath();
            this.ctx.arc(root.x, root.y - 45, 26, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = t.pink ? '#ec4899' : '#16a34a';
            this.ctx.beginPath();
            this.ctx.arc(root.x - 8, root.y - 50, 16, 0, Math.PI * 2);
            this.ctx.fill();
          }
        });
      });

      // 6. Streetlamps (x: 8.5, y: 7; x: 13.5, y: 7)
      const lamps = [{ gx: 8.5, gy: 6.8 }, { gx: 13.5, gy: 6.8 }];
      lamps.forEach(l => {
        list.push({
          depth: l.gx + l.gy,
          draw: () => {
            const base = isoToScreen(l.gx, l.gy, 0, ox, oy);
            this.ctx.fillStyle = '#1e293b';
            this.ctx.fillRect(base.x - 2, base.y - 36, 4, 36);
            this.ctx.fillStyle = '#fef08a';
            this.ctx.beginPath();
            this.ctx.arc(base.x, base.y - 36, 6, 0, Math.PI * 2);
            this.ctx.fill();

            if (this.currentTimeState === 'night' || this.currentTimeState === 'galaxy') {
              this.ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
              this.ctx.beginPath();
              this.ctx.arc(base.x, base.y, 35, 0, Math.PI * 2);
              this.ctx.fill();
            }
          }
        });
      });
    }

    drawCharacter(ctx, c, ox, oy) {
      const pos = isoToScreen(c.x, c.y, c.z, ox, oy);
      ctx.save();

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, 11, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();

      if (c.isCat) {
        // Cat rendering
        ctx.fillStyle = '#ea580c';
        if (c.state === 'sleeping') {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y - 6, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.fillRect(pos.x - 2, pos.y - 4, 4, 3);
        } else {
          ctx.beginPath();
          ctx.ellipse(pos.x, pos.y - 7, 9, 6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(pos.x - 7, pos.y - 11, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Humanoid Character Rendering
        const time = performance.now() * 0.007;
        const isWalking = (c.path && c.path.length > 0) || (c.isPlayer && (this.keys['w'] || this.keys['s'] || this.keys['a'] || this.keys['d'] || this.dpadDir));
        const bob = isWalking ? Math.sin(time) * 2.5 : 0;
        const px = pos.x;
        const py = pos.y + bob;

        // Legs / Pants
        ctx.fillStyle = c.pants || '#1e293b';
        if (isWalking) {
          const swing = Math.sin(time) * 4;
          ctx.fillRect(px - 5 + swing, py - 12, 3.5, 12);
          ctx.fillRect(px + 1.5 - swing, py - 12, 3.5, 12);
        } else {
          ctx.fillRect(px - 4.5, py - 12, 3.5, 12);
          ctx.fillRect(px + 1, py - 12, 3.5, 12);
        }

        // Torso / Shirt
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
          // Bob / Bangs
          ctx.beginPath();
          ctx.arc(px, py - 33, 7, Math.PI * 0.9, Math.PI * 2.1);
          ctx.fill();
          ctx.fillRect(px - 7, py - 32, 3, 9);
          ctx.fillRect(px + 4, py - 32, 3, 9);
        } else if (c.hairStyle === 2) {
          // Ponytail / Clip
          ctx.beginPath();
          ctx.arc(px, py - 33, 7, Math.PI * 0.9, Math.PI * 2.1);
          ctx.fill();
          ctx.fillRect(px + 5, py - 35, 4, 8);
        } else {
          // Short stylish crop
          ctx.beginPath();
          ctx.arc(px, py - 33, 7.2, Math.PI * 0.95, Math.PI * 2.05);
          ctx.fill();
        }

        // Eyes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px - 3, py - 32, 1.8, 2);
        ctx.fillRect(px + 1.2, py - 32, 1.8, 2);
      }

      // Name Tag Badge (Floating above head)
      this.drawNameTag(ctx, pos.x, pos.y - 48, c);

      ctx.restore();
    }

    drawNameTag(ctx, sx, sy, c) {
      ctx.save();
      ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const text = c.name;
      const textWidth = ctx.measureText(text).width;
      const padX = 7;
      const bw = textWidth + padX * 2;
      const bh = 18;
      const bx = sx - bw / 2;
      const by = sy;

      // Pill background
      let pillBg = 'rgba(15, 23, 42, 0.85)';
      let borderCol = 'rgba(255, 255, 255, 0.2)';
      let textCol = '#f8fafc';

      if (c.isPlayer) {
        pillBg = 'rgba(224, 108, 67, 0.92)';
        borderCol = '#fff';
      } else if (c.zone === 'house') {
        pillBg = 'rgba(244, 114, 182, 0.85)';
      } else if (c.zone === 'pavilion') {
        pillBg = 'rgba(99, 102, 241, 0.85)';
      }

      ctx.fillStyle = pillBg;
      ctx.strokeStyle = borderCol;
      ctx.lineWidth = 1;
      this.roundRect(ctx, bx, by, bw, bh, 9);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = textCol;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, sx, by + bh / 2 + 0.5);

      ctx.restore();
    }

    drawParticles(ctx, ox, oy) {
      ctx.save();
      this.particles.forEach(p => {
        const pos = isoToScreen(p.x, p.y, p.z, ox, oy);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
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

    // Check if Visitor has chosen a name
    const storedName = localStorage.getItem('ludwigia_visitor_name');
    const nameModal = document.getElementById('modal-welcome-name');
    if (!storedName && nameModal) {
      nameModal.classList.add('open');
    }

    // Name Confirmation Form
    document.getElementById('form-set-name')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('visitor-name-input');
      const val = input.value.trim() || 'Traveler';
      world.setPlayerName(val);
      nameModal.classList.remove('open');
    });

    // Mood Switches
    document.querySelectorAll('[data-mood]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-mood]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        world.mood = btn.dataset.mood;
      });
    });

    // Audio Switches
    document.querySelectorAll('[data-audio]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-audio]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        world.audio.play(btn.dataset.audio);
      });
    });

    // Zoom Buttons
    document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
      world.zoom = Math.min(1.8, world.zoom * 1.15);
    });
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
      world.zoom = Math.max(0.65, world.zoom * 0.85);
    });
    document.getElementById('btn-zoom-reset')?.addEventListener('click', () => {
      world.zoom = 1.0;
      world.panX = 0;
      world.panY = 0;
    });

    // Close Modals
    document.querySelectorAll('.space-modal-close, [data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.space-modal-backdrop')?.classList.remove('open');
      });
    });

    // Citation button
    document.getElementById('btn-citation')?.addEventListener('click', () => {
      document.getElementById('modal-citation')?.classList.add('open');
    });
  });
})();
