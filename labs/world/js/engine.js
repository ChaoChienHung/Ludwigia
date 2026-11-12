// ============================================================================
// Ludwigia World Engine — Pure Canvas Isometric Core & Math Foundations
// ============================================================================

(function(window) {
  'use strict';

  // --- Map & Projection Constants ---
  const TW = 64; // Isometric tile width
  const TH = 32; // Isometric tile height
  const MAP_W = 54; // World map width (compactly fitted to East Campus greenway & athletic park)
  const MAP_H = 112; // World map height (expanded for Southbound Abyss Bridge & Minecraft Island)

  // --- Building Zone Coordinates ---
  // Zone 1: Ludwig's Family Residence (NW)
  const HOUSE_MAX_X = 9;
  const HOUSE_MAX_Y = 9;

  // Zone 2: Men's Dormitory 11 Room 211 (SW)
  const DORM_MIN_X = 0;
  const DORM_MAX_X = 9;
  const DORM_MIN_Y = 17;
  const DORM_MAX_Y = 26;

  // Zone 3: Ludwigia AI Research Studio (NE)
  const AI_MIN_X = 18;
  const AI_MAX_X = 27;
  const AI_MIN_Y = 0;
  const AI_MAX_Y = 9;

  // Zone 4: Ludwigia Grand Library & Botanical Reading Hall (SE)
  const LIB_MIN_X = 18;
  const LIB_MAX_X = 27;
  const LIB_MIN_Y = 17;
  const LIB_MAX_Y = 26;

  // Zone 5: Sanmin High School Classroom (SW2)
  const SCHOOL_MIN_X = 0;
  const SCHOOL_MAX_X = 9;
  const SCHOOL_MIN_Y = 33;
  const SCHOOL_MAX_Y = 42;

  // Zone 6: Douyin / TikTok Tech Office (SE2)
  const DOUYIN_MIN_X = 18;
  const DOUYIN_MAX_X = 27;
  const DOUYIN_MIN_Y = 33;
  const DOUYIN_MAX_Y = 42;

  // Zone 7: Ludwigia Indoor Cafe (NE2: x: 38..45, y: 2..8 — Entrance at x: 38)
  const CAFE_MIN_X = 38;
  const CAFE_MAX_X = 45;
  const CAFE_MIN_Y = 2;
  const CAFE_MAX_Y = 8;

  // Zone 8: "How Are You Doing Today" Sanctuary (NE3: x: 38..48, y: 15..24 — Entrance at x: 38)
  const HOW_ARE_YOU_MIN_X = 38;
  const HOW_ARE_YOU_MAX_X = 48;
  const HOW_ARE_YOU_MIN_Y = 15;
  const HOW_ARE_YOU_MAX_Y = 24;

  // Zone 9: Campus Basketball Court (East of Night Market: x: 38..49, y: 34..43 — Entrance at x: 38)
  const COURT_MIN_X = 38;
  const COURT_MAX_X = 49;
  const COURT_MIN_Y = 34;
  const COURT_MAX_Y = 43;

  // --- Axonometric Coordinate Projections ---
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

  // --- 8-Directional Smooth A* Pathfinding Grid ---
  class NavGrid {
    constructor(w = MAP_W, h = MAP_H) {
      this.w = w;
      this.h = h;
      this.blocked = Array(w).fill(0).map(() => Array(h).fill(false));
    }

    setBlock(x, y, bw = 1, bh = 1, isBlocked = true) {
      const minX = Math.floor(x);
      const maxX = Math.floor(x + bw - 0.001);
      const minY = Math.floor(y);
      const maxY = Math.floor(y + bh - 0.001);
      for (let ix = minX; ix <= maxX && ix < this.w; ix++) {
        for (let iy = minY; iy <= maxY && iy < this.h; iy++) {
          if (ix >= 0 && iy >= 0) {
            // Require meaningful geometric overlap (>= 0.28 tile) in both axes to prevent phantom boundary tile blocks
            const overlapX = Math.min(ix + 1, x + bw) - Math.max(ix, x);
            const overlapY = Math.min(iy + 1, y + bh) - Math.max(iy, y);
            if (overlapX >= 0.28 && overlapY >= 0.28) {
              this.blocked[ix][iy] = isBlocked;
            }
          }
        }
      }
    }

    isWalkable(gx, gy) {
      const ix = Math.floor(gx);
      const iy = Math.floor(gy);
      if (ix < 0 || iy < 0 || ix >= this.w || iy >= this.h) return false;

      // Hard Abyss Void & Boundary Enforcement (Guarantees zero characters/paths can ever enter the abyss void)
      if (
        (iy > 57 && iy <= 92 && (ix < 11 || ix > 17)) ||
        (iy >= 93 && (ix < 7 || ix > 21)) ||
        (iy > 111)
      ) {
        return false;
      }

      return !this.blocked[ix][iy];
    }

    isWalkableRadius(gx, gy, r = 0.18) {
      return this.isWalkable(gx - r, gy - r) &&
             this.isWalkable(gx + r, gy - r) &&
             this.isWalkable(gx - r, gy + r) &&
             this.isWalkable(gx + r, gy + r);
    }

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
      let sx = Math.max(0, Math.min(this.w - 1, Math.floor(start.x)));
      let sy = Math.max(0, Math.min(this.h - 1, Math.floor(start.y)));
      let gx = Math.max(0, Math.min(this.w - 1, Math.floor(goal.x)));
      let gy = Math.max(0, Math.min(this.h - 1, Math.floor(goal.y)));

      if (!this.isWalkable(sx, sy)) {
        const startNeighbors = [
          { x: sx + 1, y: sy }, { x: sx - 1, y: sy },
          { x: sx, y: sy + 1 }, { x: sx, y: sy - 1 },
          { x: sx + 1, y: sy + 1 }, { x: sx - 1, y: sy - 1 },
          { x: sx + 1, y: sy - 1 }, { x: sx - 1, y: sy + 1 }
        ];
        const sFree = startNeighbors.find(n => this.isWalkable(n.x, n.y));
        if (sFree) { sx = sFree.x; sy = sFree.y; }
        else return [];
      }

      if (!this.isWalkable(gx, gy)) {
        const neighbors = [
          { x: gx + 1, y: gy }, { x: gx - 1, y: gy },
          { x: gx, y: gy + 1 }, { x: gx, y: gy - 1 },
          { x: gx + 1, y: gy + 1 }, { x: gx - 1, y: gy - 1 },
          { x: gx + 1, y: gy - 1 }, { x: gx - 1, y: gy + 1 }
        ];
        const free = neighbors.find(n => this.isWalkable(n.x, n.y));
        if (free) { gx = free.x; gy = free.y; }
        else return [];
      }

      const open = [{ x: sx, y: sy, g: 0, h: Math.hypot(gx - sx, gy - sy), parent: null }];
      const closed = new Set();
      const key = (x, y) => `${x},${y}`;

      while (open.length > 0) {
        open.sort((a, b) => (a.g + a.h) - (b.g + b.h));
        const cur = open.shift();

        if (cur.x === gx && cur.y === gy) {
          const path = [];
          let curr = cur;
          while (curr) {
            path.unshift({ x: curr.x + 0.5, y: curr.y + 0.5 });
            curr = curr.parent;
          }
          return this.smoothPath(path);
        }

        closed.add(key(cur.x, cur.y));

        const dirs = [
          { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
          { dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 }
        ];

        for (const d of dirs) {
          const nx = cur.x + d.dx;
          const ny = cur.y + d.dy;
          if (!this.isWalkable(nx, ny)) continue;
          if (closed.has(key(nx, ny))) continue;

          if (d.dx !== 0 && d.dy !== 0) {
            if (!this.isWalkable(cur.x + d.dx, cur.y) || !this.isWalkable(cur.x, cur.y + d.dy)) continue;
          }

          const moveCost = (d.dx !== 0 && d.dy !== 0) ? 1.414 : 1.0;
          const g = cur.g + moveCost;
          const existing = open.find(o => o.x === nx && o.y === ny);

          if (!existing) {
            open.push({
              x: nx, y: ny, g,
              h: Math.hypot(gx - nx, gy - ny),
              parent: cur
            });
          } else if (g < existing.g) {
            existing.g = g;
            existing.parent = cur;
          }
        }
      }
      return [];
    }

    smoothPath(path) {
      if (!path || path.length <= 2) return path;
      const smoothed = [path[0]];
      let curIdx = 0;

      while (curIdx < path.length - 1) {
        let furthest = curIdx + 1;
        for (let i = path.length - 1; i > curIdx + 1; i--) {
          if (this.hasLineOfSight(path[curIdx].x, path[curIdx].y, path[i].x, path[i].y)) {
            furthest = i;
            break;
          }
        }
        smoothed.push(path[furthest]);
        curIdx = furthest;
      }
      return smoothed;
    }
  }

  // --- Topological Isometric Sorting (Cycle-Free Kahn's Algorithm on Occlusion Graph) ---
  function sortIsometricEntities(entities) {
    const n = entities.length;
    for (let i = 0; i < n; i++) {
      const e = entities[i];
      e.idx = i;
      e.baseDepth = (e.xMin + e.xMax + e.yMin + e.yMax) / 2;
    }

    function isBehind(b, a) {
      // 1. Explicit Furniture-User Hierarchy
      // If 'a' is a character resting on furniture 'b', furniture MUST be drawn first (behind)
      if (a.isChar && a.char && a.char.furniture && b.furnitureId && a.char.furniture.id === b.furnitureId) {
        return true;
      }
      if (b.isChar && b.char && b.char.furniture && a.furnitureId && b.char.furniture.id === a.furnitureId) {
        return false;
      }

      const overlapX = (b.xMax > a.xMin && b.xMin < a.xMax);
      const overlapY = (b.yMax > a.yMin && b.yMin < a.yMax);

      // If bounding boxes overlap in both axes (e.g. corner intersection, elevated item on ground)
      if (overlapX && overlapY) {
        // Vertical elevation check: lower elevation draws first
        const bZ = (b.isChar && b.char ? (b.char.z || 0) : (b.z || 0));
        const aZ = (a.isChar && a.char ? (a.char.z || 0) : (a.z || 0));
        if (Math.abs(bZ - aZ) > 0.15) {
          return bZ < aZ;
        }
        if (b.baseDepth !== a.baseDepth) {
          return b.baseDepth < a.baseDepth;
        }
        return b.idx < a.idx;
      }

      // Non-overlapping in at least one axis: standard isometric occlusion causality
      if (b.xMax <= a.xMin && overlapY) return true;
      if (b.yMax <= a.yMin && overlapX) return true;
      if (b.xMax <= a.xMin && b.yMax <= a.yMin) return true;

      return false;
    }

    const inDegree = new Int32Array(n);
    const adj = Array.from({ length: n }, () => []);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        if (isBehind(entities[i], entities[j])) {
          adj[i].push(j);
          inDegree[j]++;
        }
      }
    }

    const queue = [];
    for (let i = 0; i < n; i++) {
      if (inDegree[i] === 0) queue.push(i);
    }
    queue.sort((a, b) => entities[a].baseDepth - entities[b].baseDepth);

    const sorted = [];
    const inQueueOrSorted = new Uint8Array(n);
    for (let k = 0; k < queue.length; k++) inQueueOrSorted[queue[k]] = 1;

    while (sorted.length < n) {
      if (queue.length === 0) {
        // Cycle-breaking recovery: pop the unvisited node with the smallest baseDepth
        let best = -1;
        let bestDepth = Infinity;
        for (let i = 0; i < n; i++) {
          if (!inQueueOrSorted[i] && entities[i].baseDepth < bestDepth) {
            bestDepth = entities[i].baseDepth;
            best = i;
          }
        }
        if (best === -1) break;
        queue.push(best);
        inQueueOrSorted[best] = 1;
      }

      const u = queue.shift();
      sorted.push(entities[u]);

      for (let k = 0; k < adj[u].length; k++) {
        const v = adj[u][k];
        inDegree[v]--;
        if (inDegree[v] === 0 && !inQueueOrSorted[v]) {
          queue.push(v);
          inQueueOrSorted[v] = 1;
          queue.sort((a, b) => entities[a].baseDepth - entities[b].baseDepth);
        }
      }
    }

    return sorted;
  }

  // --- Procedural Ambient Audio Synthesis ---
  class AmbientAudio {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.nodes = [];
    }

    init() {
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }

    start() {
      this.init();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      if (this.isPlaying) return;
      this.isPlaying = true;

      // 1. Warm Wind / Low Noise
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      whiteNoise.start();
      this.nodes.push(whiteNoise, filter, gain);

      // 2. Gentle Fountain Stream Noise
      const streamFilter = this.ctx.createBiquadFilter();
      streamFilter.type = 'bandpass';
      streamFilter.frequency.setValueAtTime(850, this.ctx.currentTime);
      streamFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      const streamGain = this.ctx.createGain();
      streamGain.gain.setValueAtTime(0.035, this.ctx.currentTime);

      whiteNoise.connect(streamFilter);
      streamFilter.connect(streamGain);
      streamGain.connect(this.ctx.destination);
      this.nodes.push(streamFilter, streamGain);

      // 3. Periodic Gentle Chimes
      this.chimeInterval = setInterval(() => {
        if (!this.isPlaying) return;
        this.playChime();
      }, 7000);
    }

    playChime() {
      if (!this.ctx || !this.isPlaying) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      const freq = freqs[Math.floor(Math.random() * freqs.length)];

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.025, this.ctx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 2.6);
    }

    stop() {
      if (!this.isPlaying) return;
      this.isPlaying = false;
      clearInterval(this.chimeInterval);
      this.nodes.forEach(n => {
        try { if (n.stop) n.stop(); } catch(e) {}
        try { n.disconnect(); } catch(e) {}
      });
      this.nodes = [];
    }
  }

  // Export to Global Scope
  window.LudwigWorldEngine = {
    TW, TH, MAP_W, MAP_H,
    HOUSE_MAX_X, HOUSE_MAX_Y,
    DORM_MIN_X, DORM_MAX_X, DORM_MIN_Y, DORM_MAX_Y,
    AI_MIN_X, AI_MAX_X, AI_MIN_Y, AI_MAX_Y,
    LIB_MIN_X, LIB_MAX_X, LIB_MIN_Y, LIB_MAX_Y,
    SCHOOL_MIN_X, SCHOOL_MAX_X, SCHOOL_MIN_Y, SCHOOL_MAX_Y,
    DOUYIN_MIN_X, DOUYIN_MAX_X, DOUYIN_MIN_Y, DOUYIN_MAX_Y,
    CAFE_MIN_X, CAFE_MAX_X, CAFE_MIN_Y, CAFE_MAX_Y,
    COURT_MIN_X, COURT_MAX_X, COURT_MIN_Y, COURT_MAX_Y,
    HOW_ARE_YOU_MIN_X, HOW_ARE_YOU_MAX_X, HOW_ARE_YOU_MIN_Y, HOW_ARE_YOU_MAX_Y,
    isoToScreen, screenToIso,
    NavGrid,
    sortIsometricEntities,
    AmbientAudio
  };

})(window);
