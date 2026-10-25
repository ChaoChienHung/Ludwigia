// ============================================================================
// Ludwigia World Characters — Character Rendering, Animations & Dialogues
// ============================================================================

(function(window) {
  'use strict';

  const { isoToScreen } = window.LudwigWorldEngine;

  class CharacterManager {
    constructor(world) {
      this.world = world;
      this.characters = [];
      this.player = null;
      this.proximityTarget = null;
    }

    async loadCharacters(jsonPath = 'data/characters.json') {
      try {
        const res = await fetch(jsonPath);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        this.initFromData(data.characters);
      } catch (err) {
        console.warn('Failed to load characters.json, using fallback:', err);
      }
    }

    initFromData(charList) {
      // Create Visitor Player
      const visitorName = localStorage.getItem('ludwigia_visitor_name') || 'Visitor';
      this.player = {
        id: 'player',
        name: visitorName,
        isPlayer: true,
        role: 'Explorer / 訪客',
        avatar: '🧭',
        x: 7.2, y: 7.2, z: 0,
        facing: 1,
        speed: 3.2,
        path: [],
        skin: '#f5d0b5',
        hair: '#4a3525',
        shirt: '#0284c7',
        pants: '#1e293b',
        hairStyle: 0,
        nameColor: '#fde047',
        isWalking: false,
        walkTimer: 0
      };

      this.characters = [this.player];

      charList.forEach(c => {
        this.characters.push({
          id: c.id,
          name: c.name,
          gender: c.gender || 'male',
          role: c.role || 'Resident',
          avatar: c.avatar || '👤',
          zone: c.zone || 'plaza',
          x: c.spawn ? c.spawn.x : 14,
          y: c.spawn ? c.spawn.y : 14,
          z: 0,
          facing: 1,
          speed: 1.8 + Math.random() * 0.4,
          path: [],
          skin: c.appearance?.skin || '#f5d0b5',
          hair: c.appearance?.hair || '#1e293b',
          shirt: c.appearance?.shirt || '#3b82f6',
          pants: c.appearance?.pants || '#1e293b',
          hairStyle: c.appearance?.hairStyle || 0,
          isCat: !!c.appearance?.isCat,
          nameColor: c.nameColor || '#38bdf8',
          dialogues: c.dialogues || {},
          timer: 3 + Math.random() * 5,
          state: 'idle',
          isWalking: false,
          walkTimer: 0
        });
      });
    }

    // --- Dialogue System with Random 5-Dialogue Sequence Picker ---
    openDialogue(char) {
      const overlay = document.getElementById('dialogue-overlay');
      if (!overlay) return;

      const lang = localStorage.getItem('site_lang_v1') || 'zh-TW';
      const langKey = lang === 'en' ? 'en' : 'zh-TW';

      document.getElementById('dialogue-avatar').textContent = char.avatar || '💬';
      document.getElementById('dialogue-name').textContent = char.name;
      document.getElementById('dialogue-role').textContent = char.role || 'Resident';

      // Pick randomly among the character's available dialogue options
      let lines = ["Hello!"];
      if (char.dialogues && char.dialogues[langKey] && char.dialogues[langKey].length > 0) {
        const pool = char.dialogues[langKey];
        lines = pool[Math.floor(Math.random() * pool.length)];
      } else if (char.dialogue) {
        lines = Array.isArray(char.dialogue) ? char.dialogue : [char.dialogue];
      }

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

    // --- Name Tag Glass Pill with Thematic Colors ---
    drawNameTag(ctx, x, y, char) {
      const name = char.name;
      ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const tw = ctx.measureText(name).width;
      const pw = tw + 18;
      const ph = 18;
      const rx = x - pw / 2;
      const ry = y - ph / 2;

      // Dark translucent glass pill background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      this.roundRect(ctx, rx, ry, pw, ph, 9);
      ctx.fill();

      // Border tint matching character theme color
      const borderColor = char.nameColor || '#38bdf8';
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1.2;
      this.roundRect(ctx, rx, ry, pw, ph, 9);
      ctx.stroke();

      // Small glowing indicator dot
      ctx.fillStyle = borderColor;
      ctx.beginPath();
      ctx.arc(rx + 7, y, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Name Text
      ctx.fillStyle = borderColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, rx + 13, y + 0.5);
    }

    roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    // --- High-Quality Character Rendering with Animated Walking ---
    drawCharacter(ctx, c, ox, oy) {
      const pos = isoToScreen(c.x, c.y, c.z || 0, ox, oy);

      // 1. Soft Ambient Ground Drop Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Specialized Cat Model (Mochi)
      if (c.isCat) {
        this.drawCat(ctx, c, pos);
        return;
      }

      // 3. Human Character Model with Walking Animation
      const hasActiveInput = c.isPlayer && this.world && this.world.keys && (
        !!this.world.keys['w'] || !!this.world.keys['s'] || !!this.world.keys['a'] || !!this.world.keys['d'] ||
        !!this.world.keys['arrowup'] || !!this.world.keys['arrowdown'] || !!this.world.keys['arrowleft'] || !!this.world.keys['arrowright'] ||
        !!this.world.keys['keyw'] || !!this.world.keys['keys'] || !!this.world.keys['keya'] || !!this.world.keys['keyd'] ||
        !!this.world.dpadDir
      );
      const isWalking = !!c.isWalking || (c.path && c.path.length > 0) || !!hasActiveInput || ((c.walkLingerTimer || 0) > 0);
      const animTime = isWalking ? performance.now() * 0.012 : 0;
      const bob = isWalking ? Math.abs(Math.sin(animTime)) * -2.5 : 0;
      const px = pos.x;
      const py = pos.y + bob;

      // Legs / Pants
      ctx.fillStyle = c.pants || '#1e293b';
      if (isWalking) {
        const swing = Math.sin(animTime) * 5.0;
        // Animated alternating leg stride with realistic vertical step lift
        const leftLift = Math.max(0, swing * 0.7);
        const rightLift = Math.max(0, -swing * 0.7);
        ctx.fillRect(px - 4.5 + swing, py - 12 - leftLift, 3.5, 12);
        ctx.fillRect(px + 1.0 - swing, py - 12 - rightLift, 3.5, 12);

        // Arms swinging in counter-motion
        ctx.fillStyle = c.shirt || '#e06c43';
        ctx.fillRect(px - 9 - swing * 0.6, py - 24, 2.5, 9);
        ctx.fillRect(px + 6.5 + swing * 0.6, py - 24, 2.5, 9);
      } else {
        // Standing Still (neutral upright posture)
        ctx.fillRect(px - 4.5, py - 12, 3.5, 12);
        ctx.fillRect(px + 1.0, py - 12, 3.5, 12);

        ctx.fillStyle = c.shirt || '#e06c43';
        ctx.fillRect(px - 9, py - 24, 2.5, 9);
        ctx.fillRect(px + 6.5, py - 24, 2.5, 9);
      }

      // Shirt Torso
      ctx.fillStyle = c.shirt || '#e06c43';
      this.roundRect(ctx, px - 7, py - 25, 14, 13, 3);
      ctx.fill();

      // Head
      ctx.fillStyle = c.skin || '#f5d0b5';
      ctx.beginPath();
      ctx.arc(px, py - 31, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = c.hair || '#1a1a1a';
      if (c.hairStyle === 1) {
        // Medium Bob with bangs
        ctx.beginPath();
        ctx.arc(px, py - 33, 7, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();
        ctx.fillRect(px - 7, py - 32, 3, 9);
        ctx.fillRect(px + 4, py - 32, 3, 9);
      } else if (c.hairStyle === 2) {
        // Long Hair / Twin Ponytails
        ctx.beginPath();
        ctx.arc(px, py - 33, 7, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();
        ctx.fillRect(px - 8, py - 31, 3.5, 13);
        ctx.fillRect(px + 4.5, py - 31, 3.5, 13);
      } else {
        // Neat Short Crop Hair
        ctx.beginPath();
        ctx.arc(px, py - 33, 7.2, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();
        ctx.fillRect(px - 7, py - 33, 2.5, 5);
        ctx.fillRect(px + 4.5, py - 33, 2.5, 5);
      }

      // Eyes
      ctx.fillStyle = '#0f172a';
      if (c.facing >= 0) {
        ctx.fillRect(px + 1, py - 32, 1.5, 2.5);
        ctx.fillRect(px + 4, py - 32, 1.5, 2.5);
      } else {
        ctx.fillRect(px - 5, py - 32, 1.5, 2.5);
        ctx.fillRect(px - 2, py - 32, 1.5, 2.5);
      }

      // Character Name Tag Pill
      this.drawNameTag(ctx, pos.x, pos.y - 44, c);
    }

    // --- Adorable Studio Cat (Mochi) ---
    drawCat(ctx, c, pos) {
      const isWalking = !!c.isWalking;
      const animTime = c.walkTimer || 0;
      const time = performance.now() * 0.005;

      ctx.save();
      ctx.translate(pos.x, pos.y);

      if (c.state === 'sleeping' && !isWalking) {
        // Loaf / Sleeping pose
        const breathe = Math.sin(time * 2.0) * 0.8;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(0, -5 + breathe, 9, 6.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // White chest patch
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(-2, -3 + breathe, 5, 4, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Sleeping head
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(-7, -6 + breathe, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.beginPath();
        ctx.moveTo(-10, -8 + breathe); ctx.lineTo(-8, -13 + breathe); ctx.lineTo(-6, -8 + breathe);
        ctx.fill();

        // Tail curled
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(6, -4, 4.5, Math.PI * 0.2, Math.PI * 1.4);
        ctx.stroke();
      } else {
        // Standing / Walking pose
        const legSwing = isWalking ? Math.sin(animTime) * 3.5 : 0;
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-6 + legSwing, -5, 2.5, 5);
        ctx.fillRect(3 - legSwing, -5, 2.5, 5);
        ctx.fillRect(-3 - legSwing, -5, 2.5, 5);
        ctx.fillRect(6 + legSwing, -5, 2.5, 5);

        // Body
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(0, -7, 8, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // White bib
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(-3, -6, 4.5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(-7, -10, 4.8, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.beginPath();
        ctx.moveTo(-10, -12); ctx.lineTo(-8, -16); ctx.lineTo(-6, -12);
        ctx.moveTo(-7, -12); ctx.lineTo(-5, -16); ctx.lineTo(-3, -12);
        ctx.fill();

        // Tail wagging
        const tailAngle = Math.sin(time * 3) * 0.35;
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(7, -8);
        ctx.quadraticCurveTo(12, -14 + tailAngle * 8, 14, -10);
        ctx.stroke();
      }

      ctx.restore();
      this.drawNameTag(ctx, pos.x, pos.y - 28, c);
    }
  }

  // Export to Global Scope
  window.LudwigWorldCharacters = CharacterManager;

})(window);
