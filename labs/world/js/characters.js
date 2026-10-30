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
      this.furnitureTarget = null;
      this.furnitureSpots = this.initFurnitureSpots();
      this.autoChatTimer = 3.0 + Math.random() * 2.0;
      this.dialogueQueue = [];
      this.queueTimer = 0;
      this.npcDialogues = [];
    }

    initFurnitureSpots() {
      return [
        // Dorm 211 Loft Beds (上床下桌, upper bunk platform at z = 1.45)
        { id: 'dorm_bed_happy', type: 'bed', zone: 'dorm_211', x: 2.1, y: 18.2, z: 1.45, facing: 1, name: 'Happy 的床', duvetColor: '#ea580c', labelZh: '上床睡覺', labelEn: 'Sleep in Bed' },
        { id: 'dorm_bed_clark', type: 'bed', zone: 'dorm_211', x: 7.2, y: 18.2, z: 1.45, facing: -1, name: 'Clark 的床', duvetColor: '#1d4ed8', labelZh: '上床睡覺', labelEn: 'Sleep in Bed' },
        { id: 'dorm_bed_kerry', type: 'bed', zone: 'dorm_211', x: 2.1, y: 25.2, z: 1.45, facing: 1, name: 'Kerry 的床', duvetColor: '#0d9488', labelZh: '上床睡覺', labelEn: 'Sleep in Bed' },
        { id: 'dorm_bed_billy', type: 'bed', zone: 'dorm_211', x: 7.2, y: 25.2, z: 1.45, facing: -1, name: '阿方的床', duvetColor: '#7c3aed', labelZh: '上阿方的床', labelEn: "Climb Ah-Fang's Bed" },

        // Ludwig's House Master Bed (z = 0.40)
        { id: 'ludwig_bed', type: 'bed', zone: 'ludwig_house', x: 2.0, y: 2.0, z: 0.40, facing: 1, name: 'Ludwig 的主臥床', duvetColor: '#1e3a8a', labelZh: '上床休息', labelEn: 'Sleep in Bed' },

        // Ludwig's House Living Room Blue Sofa (z = 0.42, exact seat cushion center)
        { id: 'ludwig_sofa', type: 'seat', zone: 'ludwig_house', x: 2.55, y: 6.0, z: 0.42, facing: 1, exitOffset: { dx: 0.85, dy: 0 }, name: '客廳舒適藍沙發', labelZh: '坐上沙發', labelEn: 'Sit on Sofa' },

        // Dorm 211 Lounge Blue Sofa (z = 0.42, exact seat cushion center on sofa, NOT on floor!)
        { id: 'dorm_sofa', type: 'seat', zone: 'dorm_211', x: 4.15, y: 21.8, z: 0.42, facing: 1, exitOffset: { dx: 0.85, dy: 0 }, name: '宿舍經典沙發', labelZh: '坐上沙發', labelEn: 'Sit on Sofa' },

        // Central Midnight Snack Street 傻師傅湯包 Red Dining Stool (z = 0.35, inside restaurant dining table)
        { id: 'market_stool', type: 'seat', zone: 'night_market', x: 36.9, y: 41.85, z: 0.35, facing: 1, exitOffset: { dx: -0.6, dy: 0 }, name: '傻師傅內用紅圓凳', labelZh: '坐下吃宵夜', labelEn: 'Sit Down' },

        // Ludwigia Indoor Specialty Cafe Lounge Chair (z = 0.38, armchair seat)
        { id: 'cafe_chair', type: 'seat', zone: 'cafe', x: 34.8, y: 4.85, z: 0.38, facing: 1, exitOffset: { dx: 0.6, dy: 0 }, name: '室內文青咖啡椅', labelZh: '坐下品咖啡', labelEn: 'Sit & Sip Coffee' },

        // Campus Basketball Court Sideline Rest Bench (z = 0.42, exact seat center)
        { id: 'basketball_bench', type: 'seat', zone: 'basketball_court', x: 33.8, y: 17.55, z: 0.42, facing: 1, name: '球場休息長椅', labelZh: '坐下看球', labelEn: 'Sit & Watch Game' },

        // Garden Terrace Chinese Chess Bench beside Xiangqi Table (z = 0.42, exact seat center)
        { id: 'xiangqi_bench', type: 'seat', zone: 'garden_terrace', x: 2.6, y: 12.15, z: 0.42, facing: 1, name: '花園象棋長凳', labelZh: '坐下觀棋', labelEn: 'Watch Xiangqi' },

        // Gray Road North Edge Benches (Placed on the northern edge of gray paved roads, facing south onto the road)
        { id: 'bench_boulevard_north', type: 'seat', zone: 'plaza', x: 11.6, y: 12.35, z: 0.42, facing: 1, name: '中庭廣場北緣長椅', labelZh: '坐下吹風', labelEn: 'Sit & Rest' },
        { id: 'bench_central_east', type: 'seat', zone: 'plaza', x: 19.0, y: 12.35, z: 0.42, facing: 1, name: '東向大道西側長椅', labelZh: '坐下看書', labelEn: 'Sit & Read' },
        { id: 'bench_east_lawn', type: 'seat', zone: 'plaza', x: 26.0, y: 12.35, z: 0.42, facing: 1, name: '東向大道東側長椅', labelZh: '坐下吹風', labelEn: 'Sit & Rest' },
        { id: 'bench_west_greenway', type: 'seat', zone: 'plaza', x: 5.3, y: 29.35, z: 0.42, facing: 1, name: '西區綠廊北緣長椅', labelZh: '坐下小憩', labelEn: 'Sit & Rest' },
        { id: 'bench_south_avenue', type: 'seat', zone: 'plaza', x: 11.8, y: 43.35, z: 0.42, facing: 1, name: '南區大道北緣長椅', labelZh: '坐下休息', labelEn: 'Sit & Rest' }
      ];
    }

    isSpotOccupied(spot, excludingChar = null) {
      if (!spot) return false;
      return this.characters.some(c => c !== excludingChar && c.furniture && c.furniture.id === spot.id);
    }

    getOccupant(spot) {
      if (!spot) return null;
      return this.characters.find(c => c.furniture && c.furniture.id === spot.id);
    }

    useFurniture(char, spot) {
      if (!char || !spot) return false;
      if (this.isSpotOccupied(spot, char)) return false;

      char.furniture = spot;
      char.state = (spot.type === 'bed') ? 'lying' : 'sitting';
      char.x = spot.x;
      char.y = spot.y;
      char.z = spot.z || 0;
      char.facing = spot.facing || 1;
      char.path = [];
      char.isWalking = false;
      char.snoreSeed = Math.random() * 5.0;

      // Special banter: if someone climbs into Billy's bed, Billy gets frustrated!
      if (spot.id === 'dorm_bed_billy') {
        const billy = this.characters.find(c => c.id === 'billy');
        if (billy && char.id !== 'billy') {
          const lk = this.getLangKey();
          const txt = (lk === 'en') ? "I literally can't... People keep climbing on my bed! Get down!" : "我真的快中風了！有群人一直上我的床，快給我下來！";
          setTimeout(() => {
            this.triggerSpeechBubble(billy, txt, 4.2);
          }, 600);
        }
      }
      return true;
    }

    leaveFurniture(char) {
      if (!char || !char.furniture) return;
      const f = char.furniture;
      char.state = 'idle';
      char.z = 0;
      if (f.type === 'bed') {
        if (f.id === 'ludwig_bed') {
          char.x = 3.4;
          char.y = 2.2;
        } else if (char.x > 5.0) {
          char.x = Math.max(4.2, char.x - 1.4);
        } else {
          char.x = Math.min(4.0, char.x + 1.4);
        }
      } else if (f.type === 'seat') {
        if (f.exitOffset) {
          char.x += f.exitOffset.dx || 0;
          char.y += f.exitOffset.dy || 0;
        } else {
          char.y = char.y + ((f.facing && f.facing > 0) ? 0.6 : -0.6);
        }
      }
      char.furniture = null;
    }

    async loadCharacters(jsonPath = 'data/characters.json') {
      try {
        const res = await fetch(jsonPath);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        this.initFromData(data.characters);
        this.npcDialogues = this.validateNpcDialogues(data.npcDialogues);
      } catch (err) {
        console.warn('Failed to load characters.json, using fallback:', err);
      }
    }

    validateNpcDialogues(pairs) {
      if (!Array.isArray(pairs)) return [];
      const ids = new Set(this.characters.map(char => char.id));
      return pairs.filter((pair, index) => {
        const participants = pair && pair.participants;
        const valid = Array.isArray(participants) && participants.length >= 2 &&
          participants.every(id => ids.has(id)) &&
          ['zh-TW', 'en'].every(lang => {
            const lines = pair.dialogues && pair.dialogues[lang];
            return Array.isArray(lines) && lines.length > 0 &&
              lines.every(line => participants.includes(line.speaker) &&
                typeof line.text === 'string' && line.text.trim());
          });
        if (!valid) console.warn(`Skipping invalid conversation pair ${index} in characters.json`);
        return valid;
      });
    }

    getLangKey() {
      const raw = (this.world && this.world.lang) || localStorage.getItem('site_lang_v1') || document.documentElement.getAttribute('lang') || 'zh-Hant';
      const lowered = String(raw).toLowerCase();
      return (lowered === 'en' || lowered.startsWith('en-')) ? 'en' : 'zh-TW';
    }

    updateLanguage(lang) {
      if (this.world) this.world.lang = lang;
      const promptName = document.getElementById('prompt-name');
      if (promptName && this.proximityTarget) {
        promptName.textContent = this.proximityTarget.name;
      }
      if (this.activeDialogueChar) {
        const nameEl = document.getElementById('dialogue-name');
        const roleEl = document.getElementById('dialogue-role');
        const avatarEl = document.getElementById('dialogue-avatar');
        if (nameEl) nameEl.textContent = this.activeDialogueChar.name;
        if (roleEl) roleEl.textContent = this.activeDialogueChar.role;
        if (avatarEl) this.renderAvatar(avatarEl, this.activeDialogueChar);
      }
    }

    renderAvatar(avatarEl, char) {
      if (!avatarEl) return;
      const av = (char && char.avatar) ? String(char.avatar).trim() : '';
      const fallback = (char && char.avatarFallback) || (char && char.isCat ? '🐱' : '👤');
      const isImg = av && (
        av.includes('/') ||
        /\.(png|jpe?g|webp|svg|gif|avif)$/i.test(av) ||
        av.startsWith('data:') ||
        av.startsWith('http:') ||
        av.startsWith('https:')
      );

      if (isImg) {
        avatarEl.innerHTML = '';
        const img = document.createElement('img');
        img.src = av;
        img.alt = char.name || 'Avatar';
        img.onerror = () => {
          avatarEl.innerHTML = '';
          avatarEl.textContent = fallback;
        };
        avatarEl.appendChild(img);
      } else {
        avatarEl.innerHTML = '';
        avatarEl.textContent = av || fallback || '💬';
      }
    }

    initFromData(charList) {
      // Create Visitor Player
      const visitorName = localStorage.getItem('ludwigia_visitor_name') || 'Visitor';
      const playerNameI18n = { 'zh-TW': visitorName, 'en': visitorName };
      const playerRoleI18n = { 'zh-TW': '探索者 / 訪客', 'en': 'Explorer / Visitor' };

      this.player = {
        id: 'player',
        nameI18n: playerNameI18n,
        roleI18n: playerRoleI18n,
        isPlayer: true,
        avatar: '🧭',
        x: 4.8, y: 3.8, z: 0,
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

      Object.defineProperty(this.player, 'name', {
        get: () => {
          const lk = this.getLangKey();
          return playerNameI18n[lk] || visitorName;
        },
        set: (v) => {
          playerNameI18n['zh-TW'] = v;
          playerNameI18n['en'] = v;
        },
        configurable: true,
        enumerable: true
      });

      Object.defineProperty(this.player, 'role', {
        get: () => {
          const lk = this.getLangKey();
          return playerRoleI18n[lk] || playerRoleI18n['zh-TW'];
        },
        set: (v) => {
          playerRoleI18n['zh-TW'] = v;
          playerRoleI18n['en'] = v;
        },
        configurable: true,
        enumerable: true
      });

      this.characters = [this.player];

      charList.forEach(c => {
        const nameObj = (typeof c.name === 'object' && c.name) ? c.name : null;
        const roleObj = (typeof c.role === 'object' && c.role) ? c.role : null;
        const nameI18n = {
          'zh-TW': (nameObj && (nameObj['zh-TW'] || nameObj.zh || nameObj['zh-Hant'])) || c.name_zh || (typeof c.name === 'string' ? c.name : '') || '',
          'en': (nameObj && (nameObj['en'] || nameObj.en_US)) || c.name_en || (typeof c.name === 'string' ? c.name : '') || ''
        };
        const roleI18n = {
          'zh-TW': (roleObj && (roleObj['zh-TW'] || roleObj.zh || roleObj['zh-Hant'])) || c.role_zh || (typeof c.role === 'string' ? c.role : '') || 'Resident',
          'en': (roleObj && (roleObj['en'] || roleObj.en_US)) || c.role_en || (typeof c.role === 'string' ? c.role : '') || 'Resident'
        };

        const charObj = {
          id: c.id,
          nameI18n,
          roleI18n,
          gender: c.gender || 'male',
          avatar: c.avatar || (c.isCat ? '🐱' : '👤'),
          avatarFallback: c.avatarFallback || (c.isCat ? '🐱' : '👤'),
          zone: c.zone || 'plaza',
          visitedZones: Array.isArray(c.visitedZones) ? [...c.visitedZones] : null,
          x: c.spawn ? c.spawn.x : 14,
          y: c.spawn ? c.spawn.y : 14,
          z: 0,
          facing: 1,
          speed: 2.1 + Math.random() * 0.4,
          path: [],
          skin: c.appearance?.skin || '#f5d0b5',
          hair: c.appearance?.hair || '#1e293b',
          shirt: c.appearance?.shirt || '#3b82f6',
          pants: c.appearance?.pants || '#1e293b',
          hairStyle: c.appearance?.hairStyle || 0,
          isCat: !!c.appearance?.isCat,
          nameColor: c.nameColor || '#38bdf8',
          dialogues: c.dialogues || {},
          timer: 0.8 + Math.random() * 2.2,
          state: 'idle',
          isWalking: false,
          walkTimer: 0
        };

        Object.defineProperty(charObj, 'name', {
          get: () => {
            const lk = this.getLangKey();
            const val = nameI18n[lk] || nameI18n['zh-TW'] || nameI18n['en'];
            if (val && typeof val === 'string') return val;
            if (typeof c.name === 'string') return c.name;
            return c.id || '';
          },
          set: (v) => {
            nameI18n['zh-TW'] = v;
            nameI18n['en'] = v;
          },
          configurable: true,
          enumerable: true
        });

        Object.defineProperty(charObj, 'role', {
          get: () => {
            const lk = this.getLangKey();
            const val = roleI18n[lk] || roleI18n['zh-TW'] || roleI18n['en'];
            if (val && typeof val === 'string') return val;
            if (typeof c.role === 'string') return c.role;
            return 'Resident';
          },
          set: (v) => {
            roleI18n['zh-TW'] = v;
            roleI18n['en'] = v;
          },
          configurable: true,
          enumerable: true
        });

        this.characters.push(charObj);
      });
    }

    // --- Dialogue System with Random 5-Dialogue Sequence Picker ---
    openDialogue(char) {
      const overlay = document.getElementById('dialogue-overlay');
      if (!overlay) return;

      if (char.speechBubble) char.speechBubble = null;
      this.activeDialogueChar = char;
      const langKey = this.getLangKey();

      this.renderAvatar(document.getElementById('dialogue-avatar'), char);
      document.getElementById('dialogue-name').textContent = char.name;
      document.getElementById('dialogue-role').textContent = char.role || 'Resident';

      // Player-initiated dialogue has its own pool; ambient lines never appear here.
      let lines = ["Hello!"];
      const pool = char.dialogues?.user?.[langKey] || char.dialogues?.user?.['zh-TW'];
      if (pool && pool.length > 0) {
        lines = pool[Math.floor(Math.random() * pool.length)];
      }

      let lineIdx = 0;
      const textEl = document.getElementById('dialogue-text');
      textEl.textContent = lines[0];

      const nextBtn = document.getElementById('dialogue-next');
      const btnSpan = nextBtn ? (nextBtn.querySelector('.dialogue-btn-label') || nextBtn.querySelector('span')) : null;
      if (btnSpan) btnSpan.textContent = (lines.length <= 1) ? (langKey === 'en' ? 'Done' : '結束') : (langKey === 'en' ? 'Next' : '繼續');

      nextBtn.onclick = () => {
        lineIdx++;
        if (lineIdx < lines.length) {
          textEl.textContent = lines[lineIdx];
          if (btnSpan) btnSpan.textContent = (lineIdx === lines.length - 1) ? (langKey === 'en' ? 'Done' : '結束') : (langKey === 'en' ? 'Next' : '繼續');
        } else {
          this.closeDialogue();
        }
      };

      overlay.classList.add('open');
      if (this.world && this.world.setCinematicFocus) {
        this.world.setCinematicFocus(this.player, char);
      }
    }

    closeDialogue() {
      const overlay = document.getElementById('dialogue-overlay');
      if (overlay) overlay.classList.remove('open');
      this.activeDialogueChar = null;
      if (this.world) {
        this.world.keys = {};
        if (this.world.clearCinematicFocus) {
          this.world.clearCinematicFocus();
        }
      }
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

      // 3. Human Character Model with Walking Animation & States
      // Specialized State: Lying down on Bed (Sleeping with Animated Snoring zZ)
      if (c.state === 'lying') {
        const facingDir = c.facing || 1;
        const headX = pos.x - 7 * facingDir;
        const headY = pos.y - 6;

        // Soft White Fluffy Pillow under head
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(headX, headY, 7.5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Sleeping Head
        ctx.fillStyle = c.skin || '#f5d0b5';
        ctx.beginPath();
        ctx.arc(headX, headY - 2, 6, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = c.hair || '#1a1a1a';
        ctx.beginPath();
        ctx.arc(headX, headY - 4, 6.2, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();

        // Peaceful Closed Sleeping Eyes (^ ^)
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(headX + 1 * facingDir, headY - 2);
        ctx.lineTo(headX + 3 * facingDir, headY - 3);
        ctx.lineTo(headX + 5 * facingDir, headY - 2);
        ctx.stroke();

        // Tucked-in Cozy Bed Blanket / Quilt Covering Body
        const quiltCol = (c.furniture && c.furniture.duvetColor) || c.shirt || '#ea580c';
        ctx.fillStyle = quiltCol;
        this.roundRect(ctx, pos.x - 8, pos.y - 5, 17, 13, 3);
        ctx.fill();

        // White folded top sheet hem
        ctx.fillStyle = '#f8fafc';
        this.roundRect(ctx, pos.x - 8, pos.y - 7, 17, 3.5, 1.5);
        ctx.fill();

        // Floating Animated Snoring Particles (z Z z drifting up)
        const snoreSeed = c.snoreSeed || 0;
        const snoreTime = (performance.now() * 0.0018 + snoreSeed) % 3;
        for (let i = 0; i < 3; i++) {
          const prog = (snoreTime + i * 1.0) % 3;
          const zAlpha = Math.max(0, 0.9 - prog * 0.3);
          const zOffset = prog * 16;
          const zX = headX + facingDir * (4 + prog * 4) + Math.sin(prog * 2) * 3;
          const zY = headY - 8 - zOffset;
          ctx.fillStyle = `rgba(186, 230, 253, ${zAlpha})`;
          ctx.font = `bold ${8 + prog * 2.2}px monospace`;
          ctx.fillText('z', zX, zY);
        }

        // Character Name Tag & Speech Bubble
        this.drawNameTag(ctx, pos.x, pos.y - 32, c);
        if (c.speechBubble) this.drawSpeechBubble(ctx, pos.x, pos.y - 46, c);
        return;
      }

      // Specialized State: Sitting upright on Chair / Stool / Sofa
      if (c.state === 'sitting') {
        const sitY = pos.y;

        // Seated Pants & Thighs (resting naturally on seat surface at sitY)
        ctx.fillStyle = c.pants || '#1e293b';
        ctx.fillRect(pos.x - 5.5, sitY - 5, 11, 4.5); // Thighs extending forward
        ctx.fillRect(pos.x - 4.5, sitY - 1, 3.2, 7.5); // Left lower leg hanging down
        ctx.fillRect(pos.x + 1.2, sitY - 1, 3.2, 7.5); // Right lower leg hanging down

        // Seated Torso
        ctx.fillStyle = c.shirt || '#e06c43';
        this.roundRect(ctx, pos.x - 6.5, sitY - 17, 13, 12, 3);
        ctx.fill();

        // Relaxed hands resting on knees
        ctx.fillStyle = c.skin || '#f5d0b5';
        ctx.beginPath();
        ctx.arc(pos.x - 3, sitY - 2, 2, 0, Math.PI * 2);
        ctx.arc(pos.x + 3, sitY - 2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = c.skin || '#f5d0b5';
        ctx.beginPath();
        ctx.arc(pos.x, sitY - 23, 6.5, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = c.hair || '#1a1a1a';
        ctx.beginPath();
        ctx.arc(pos.x, sitY - 25, 7.2, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();
        ctx.fillRect(pos.x - 7, sitY - 25, 2.5, 5);
        ctx.fillRect(pos.x + 4.5, sitY - 25, 2.5, 5);

        // Eyes
        ctx.fillStyle = '#0f172a';
        if (c.facing >= 0) {
          ctx.fillRect(pos.x + 1, sitY - 24, 1.5, 2.5);
          ctx.fillRect(pos.x + 4, sitY - 24, 1.5, 2.5);
        } else {
          ctx.fillRect(pos.x - 5, sitY - 24, 1.5, 2.5);
          ctx.fillRect(pos.x - 2, sitY - 24, 1.5, 2.5);
        }

        // Character Name Tag & Speech Bubble
        this.drawNameTag(ctx, pos.x, pos.y - 38, c);
        if (c.speechBubble) this.drawSpeechBubble(ctx, pos.x, pos.y - 50, c);
        return;
      }

      // Standard Human Character Model with Walking Animation
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

      // Autonomous Speech Bubble
      if (c.speechBubble) {
        this.drawSpeechBubble(ctx, pos.x, pos.y - 56, c);
      }
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
      if (c.speechBubble) {
        this.drawSpeechBubble(ctx, pos.x, pos.y - 40, c);
      }
    }

    // --- Autonomous Dialogue Update Loop ---
    update(dt) {
      // 1. Update active speech bubble timers & smooth alpha fade
      this.characters.forEach(c => {
        if (c.speechBubble) {
          c.speechBubble.timer -= dt;
          if (c.speechBubble.timer > c.speechBubble.duration - 0.25) {
            c.speechBubble.alpha = Math.min(1.0, (c.speechBubble.duration - c.speechBubble.timer) / 0.25);
          } else if (c.speechBubble.timer < 0.45) {
            c.speechBubble.alpha = Math.max(0, c.speechBubble.timer / 0.45);
          } else {
            c.speechBubble.alpha = 1.0;
          }
          if (c.speechBubble.timer <= 0) {
            c.speechBubble = null;
          }
        }
      });

      // 2. Process conversation queue sequence (supports simultaneous chorus lines when nextDelay === 0)
      if (this.dialogueQueue.length > 0) {
        this.queueTimer -= dt;
        while (this.queueTimer <= 0 && this.dialogueQueue.length > 0) {
          const nextItem = this.dialogueQueue.shift();
          const targetChar = this.characters.find(c => c.id === nextItem.speakerId);
          if (targetChar) {
            this.triggerSpeechBubble(targetChar, nextItem.text, nextItem.duration || 3.8);
          }
          this.queueTimer = (nextItem.nextDelay !== undefined) ? nextItem.nextDelay : 2.2;
          if (this.queueTimer > 0) break;
        }
        return;
      }

      // 3. Autonomous scheduler
      this.autoChatTimer -= dt;
      if (this.autoChatTimer <= 0) {
        this.autoChatTimer = 5.5 + Math.random() * 4.5;
        this.tryTriggerAutonomousConversation();
      }
    }

    tryTriggerAutonomousConversation() {
      // Don't pop ambient bubbles if user is actively in a full dialogue modal
      if (this.activeDialogueChar || document.querySelector('.dialogue-overlay.open')) return;

      const langKey = this.getLangKey();
      const now = performance.now();
      if (Math.random() < 0.5) {
        if (!this.tryTriggerNpcDialogue(langKey, now)) this.tryTriggerSelfDialogue(langKey, now);
      } else if (!this.tryTriggerSelfDialogue(langKey, now)) {
        this.tryTriggerNpcDialogue(langKey, now);
      }
    }

    tryTriggerNpcDialogue(langKey, now) {
      const pairs = this.npcDialogues.slice().sort(() => Math.random() - 0.5);

      for (const pair of pairs) {
        const group = pair.participants.map(id => this.characters.find(c => c.id === id));
        if (group.some(c => !c)) continue;

        // Ensure no character in the group has spoken within the last 10 seconds
        if (group.some(c => now - (c.lastSpokeTime || 0) < 10000)) continue;

        const maxDist = pair.maxDistance || (group.length > 2 ? 4.5 : 3.8);
        const centerX = group.reduce((sum, c) => sum + c.x, 0) / group.length;
        const centerY = group.reduce((sum, c) => sum + c.y, 0) / group.length;

        // Check if all characters in the group are close to conversation center
        const allNear = group.every(c => Math.hypot(c.x - centerX, c.y - centerY) <= maxDist);

        const firstZone = group[0].zone;
        const shareLocation = group.every(c =>
          c.zone === firstZone ||
          (c.visitedZones && group[0].visitedZones && c.visitedZones.some(z => group[0].visitedZones.includes(z))) ||
          Math.hypot(c.x - centerX, c.y - centerY) <= 4.5
        );
        if (!shareLocation) continue;

        // Location-Restricted Events Contract:
        // If dialogue/event specifies requiredZone, ensure the conversation group is currently inside that zone!
        if (pair.requiredZone) {
          const reqZone = pair.requiredZone;
          const currentZone = this.world && this.world.getZoneAt ? this.world.getZoneAt(centerX, centerY) : group[0].zone;
          const isHouse = (reqZone === 'house' || reqZone === 'ludwig_house') && (currentZone === 'ludwig_house' || group[0].zone === 'house');
          const isDorm = (reqZone === 'dorm_211') && (currentZone === 'dorm_211' || group[0].zone === 'dorm_211');
          const matchesZone = (currentZone === reqZone) || isHouse || isDorm;
          if (!matchesZone) continue;
        }

        // Bed Occupancy Action for Dorm Events (e.g. Late-Night Bed Chat)
        if (pair.occupyBeds && this.furnitureSpots) {
          const dormBedMap = {
            billy: 'dorm_bed_billy',
            clark: 'dorm_bed_clark',
            jerry: 'dorm_bed_kerry',
            ludwig: 'dorm_bed_happy'
          };
          for (const c of group) {
            const bedId = dormBedMap[c.id];
            if (bedId) {
              const spot = this.furnitureSpots.find(f => f.id === bedId);
              if (spot && c.furniture !== spot) {
                this.useFurniture(c, spot);
              }
            }
          }
        }

        // If characters share zone but are spread apart, guide them to approach conversation center
        if (!allNear) {
          if (this.world && this.world.nav) {
            for (const c of group) {
              const d = Math.hypot(c.x - centerX, c.y - centerY);
              if (d > maxDist && d <= 7.0) {
                if (!c.path || c.path.length === 0) {
                  const path = this.world.nav.findPath({ x: c.x, y: c.y }, { x: centerX, y: centerY });
                  if (path && path.length > 0) {
                    c.path = path;
                    c.isWalking = true;
                  }
                }
              }
            }
          }
          continue;
        }

        // Within conversational proximity: pause wandering, face toward group center, and converse!
        const lines = pair.dialogues[langKey] || pair.dialogues['zh-TW'];
        if (!lines || lines.length === 0) continue;

        const totalDialogueTime = lines.reduce((sum, item) => sum + (item.delay || 2.2), 0) + 3.5;
        for (const c of group) {
          c.path = []; c.isWalking = false;
          c.facing = (centerX - c.x >= 0) ? 1 : -1;
          c.timer = Math.max(8.0, totalDialogueTime);
        }

        // First character speaks
        const first = lines[0];
        const speaker1 = this.characters.find(c => c.id === first.speaker);
        if (speaker1) {
          const firstDuration = first.duration || (first.delay ? Math.max(3.8, first.delay + 1.2) : 3.8);
          this.triggerSpeechBubble(speaker1, first.text, firstDuration);
        }

        // Queue remaining replies
        this.dialogueQueue = [];
        for (let i = 1; i < lines.length; i++) {
          const item = lines[i];
          const itemDuration = item.duration || (item.delay ? Math.max(3.8, item.delay + 1.2) : 3.8);
          this.dialogueQueue.push({
            speakerId: item.speaker,
            text: item.text,
            duration: itemDuration,
            nextDelay: item.delay || 2.2
          });
        }
        this.queueTimer = lines[0].delay || 2.2;
        return true;
      }
      return false;
    }

    tryTriggerSelfDialogue(langKey, now) {
      const eligible = this.characters.filter(c => !c.isPlayer && !c.speechBubble &&
        now - (c.lastSpokeTime || 0) > 12000 &&
        (c.dialogues?.self?.[langKey] || c.dialogues?.self?.['zh-TW'])?.length);
      if (!eligible.length) return false;
      const char = eligible[Math.floor(Math.random() * eligible.length)];
      const pool = char.dialogues.self[langKey] || char.dialogues.self['zh-TW'];
      this.triggerSpeechBubble(char, pool[Math.floor(Math.random() * pool.length)], 3.8);
      return true;
    }

    triggerSpeechBubble(char, text, duration = 3.8) {
      if (!char || !text) return;
      char.speechBubble = {
        text,
        name: char.name,
        color: char.nameColor || '#38bdf8',
        duration,
        timer: duration,
        alpha: 0.0
      };
      char.lastSpokeTime = performance.now();
    }

    wrapText(ctx, text, maxWidth = 145) {
      if (!text) return [];
      const lines = [];
      let currentLine = '';
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const testLine = currentLine + char;
        const width = ctx.measureText(testLine).width;
        if (width > maxWidth && currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = char;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    }

    // --- Floating Comic Speech Bubble Rendering ---
    drawSpeechBubble(ctx, x, y, char) {
      const bubble = char.speechBubble;
      if (!bubble || bubble.alpha <= 0.01) return;

      ctx.save();
      ctx.font = '500 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const lines = this.wrapText(ctx, bubble.text, 145);
      if (lines.length === 0) {
        ctx.restore();
        return;
      }

      let maxLineWidth = 0;
      lines.forEach(l => {
        const w = ctx.measureText(l).width;
        if (w > maxLineWidth) maxLineWidth = w;
      });

      const padX = 10;
      const padY = 7;
      const lineHeight = 15;
      const headerH = 12;
      const bw = Math.max(76, Math.min(175, maxLineWidth + padX * 2));
      const bh = lines.length * lineHeight + padY * 2 + headerH;
      const bx = x - bw / 2;
      const by = y - bh;

      // Pop-in Scale & Alpha
      ctx.globalAlpha = bubble.alpha;
      const scale = 0.88 + 0.12 * bubble.alpha;
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.translate(-x, -y);

      // Glassmorphic Body
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.shadowColor = bubble.color;
      ctx.shadowBlur = 8;
      this.roundRect(ctx, bx, by, bw, bh, 8);
      ctx.fill();

      // Border matching character theme color
      ctx.strokeStyle = bubble.color;
      ctx.lineWidth = 1.3;
      this.roundRect(ctx, bx, by, bw, bh, 8);
      ctx.stroke();

      // Downward Pointer Tail
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.beginPath();
      ctx.moveTo(x - 5, by + bh);
      ctx.lineTo(x + 5, by + bh);
      ctx.lineTo(x, by + bh + 5.5);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = bubble.color;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(x - 5, by + bh);
      ctx.lineTo(x, by + bh + 5.5);
      ctx.lineTo(x + 5, by + bh);
      ctx.stroke();

      // Speaker Name Header
      ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = bubble.color;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(bubble.name, bx + padX, by + padY);

      // Dialogue Text Lines
      ctx.font = '500 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#f8fafc';
      let textY = by + padY + headerH + 1;
      lines.forEach(line => {
        ctx.fillText(line, bx + padX, textY);
        textY += lineHeight;
      });

      ctx.restore();
    }
  }

  // Export to Global Scope
  window.LudwigWorldCharacters = CharacterManager;

})(window);
