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
      this.autoChatTimer = 3.0 + Math.random() * 2.0;
      this.dialogueQueue = [];
      this.queueTimer = 0;
      this.conversationPairs = this.initConversationPairs();
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
    }

    closeDialogue() {
      const overlay = document.getElementById('dialogue-overlay');
      if (overlay) overlay.classList.remove('open');
      this.activeDialogueChar = null;
      if (this.world) this.world.keys = {};
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

    // --- Autonomous Dialogues & Multi-Character Conversational Interactions ---
    initConversationPairs() {
      return [
        // === 1. Dorm 211 Group (男11 211寢室爆笑日常) ===
        {
          zone: 'dorm_211',
          participants: ['clark', 'billy'],
          dialogues: {
            'zh-TW': [
              { speaker: 'clark', text: '阿方的床真的很舒服欸。', delay: 2.2 },
              { speaker: 'billy', text: '我真的快中風了！下來！', delay: 2.2 }
            ],
            'en': [
              { speaker: 'clark', text: "Ah-Fang's bed is seriously so comfy.", delay: 2.2 },
              { speaker: 'billy', text: "I am literally about to have a stroke! Get down!", delay: 2.2 }
            ]
          }
        },
        {
          zone: 'dorm_211',
          participants: ['bohan', 'billy'],
          dialogues: {
            'zh-TW': [
              { speaker: 'bohan', text: '阿方在房間嗎？那我要去上他的床。', delay: 2.0 },
              { speaker: 'billy', text: '我不知道啊，有群人一直上我的床。下來！', delay: 2.2 }
            ],
            'en': [
              { speaker: 'bohan', text: "Is Ah-Fang in the room? Gonna climb onto his bed.", delay: 2.0 },
              { speaker: 'billy', text: "People keep climbing on my bed... Get down!", delay: 2.2 }
            ]
          }
        },
        {
          zone: 'dorm_211',
          participants: ['bohan', 'billy'],
          dialogues: {
            'zh-TW': [
              { speaker: 'bohan', text: '幹麻那麼小氣，你的床就是大家的床啊，一起躺嘛。', delay: 2.2 },
              { speaker: 'billy', text: '我真的快中風了！下來！', delay: 2.2 }
            ],
            'en': [
              { speaker: 'bohan', text: "Why so stingy? Your bed is everyone's bed, let's crash together!", delay: 2.2 },
              { speaker: 'billy', text: "I am literally about to have a stroke! Get down!", delay: 2.2 }
            ]
          }
        },
        {
          zone: 'dorm_211',
          participants: ['clark', 'billy'],
          dialogues: {
            'zh-TW': [
              { speaker: 'clark', text: '這阿方的方塊酥，你要吃嗎？還滿好吃的。', delay: 2.2 },
              { speaker: 'billy', text: '我不知道啊，有群人一直偷拿我的方塊酥。想吃不會自己買喔？', delay: 2.2 }
            ],
            'en': [
              { speaker: 'clark', text: "These are Ah-Fang's wheat square cookies, want some? Pretty good.", delay: 2.2 },
              { speaker: 'billy', text: "People keep stealing my cookies. Buy your own!", delay: 2.2 }
            ]
          }
        },
        {
          zone: 'dorm_211',
          participants: ['billy', 'clark'],
          dialogues: {
            'zh-TW': [
              { speaker: 'billy', text: '老開的期中考，猜一個IPv4地址：0.0.0.0', delay: 2.4 },
              { speaker: 'clark', text: '老開桌上那兩顆火龍果都爛到出汁了... 兩顆爛掉的火龍果對應兩顆爛掉的期中考', delay: 2.4 }
            ],
            'en': [
              { speaker: 'billy', text: "Lao-Kai's midterm score, guess an IPv4 address: 0.0.0.0", delay: 2.4 },
              { speaker: 'clark', text: "Those two rotten dragon fruits correspond to two rotten midterms...", delay: 2.4 }
            ]
          }
        },
        {
          zone: 'dorm_211',
          participants: ['clark', 'jerry'],
          dialogues: {
            'zh-TW': [
              { speaker: 'clark', text: '老開機統期末考的那個背景... 看得真的很讓人鼻酸，有朱自清的背影的感覺。', delay: 2.2 },
              { speaker: 'jerry', text: '你是水蛭喔？台北是我家後花園。', delay: 2.2 }
            ],
            'en': [
              { speaker: 'clark', text: "Lao-Kai's silhouette taking the Probability final gives pure Zhu Ziqing vibes.", delay: 2.2 },
              { speaker: 'jerry', text: "Are you a leech? Taipei is basically my backyard.", delay: 2.2 }
            ]
          }
        },
        {
          zone: 'dorm_211',
          participants: ['happy', 'billy'],
          dialogues: {
            'zh-TW': [
              { speaker: 'happy', text: '這把贏了就睡！今晚宵夜要不要叫鹹酥雞跟大杯微糖微冰？', delay: 2.2 },
              { speaker: 'billy', text: '欸走拉，吃宵！一起去吃傻師傅！', delay: 2.2 }
            ],
            'en': [
              { speaker: 'happy', text: "Win this match and sleep! Midnight Taiwanese chicken tonight?", delay: 2.2 },
              { speaker: 'billy', text: "Let's go! Midnight snack run together!", delay: 2.2 }
            ]
          }
        },
        // === 2. Douyin Office Group (抖音演算法研發辦公室) ===
        {
          zone: 'douyin_office',
          participants: ['weihao', 'baisen'],
          dialogues: {
            'zh-TW': [
              { speaker: 'weihao', text: '好煩呀，我答辯都不知道要講啥，沒啥可以講的內容呀！', delay: 2.2 },
              { speaker: 'baisen', text: '這個 bug 我抓了一整個下午，終於給它修掉了！', delay: 2.2 }
            ],
            'en': [
              { speaker: 'weihao', text: "So annoying, I have no idea what to say for my defense!", delay: 2.2 },
              { speaker: 'baisen', text: "Squashed this bug after tracking it all afternoon!", delay: 2.2 }
            ]
          }
        },
        {
          zone: 'douyin_office',
          participants: ['da', 'weihao'],
          dialogues: {
            'zh-TW': [
              { speaker: 'da', text: '這個演算法模型明天上線，大家今晚先對一下指標。', delay: 2.2 },
              { speaker: 'weihao', text: '下午要不要叫杯手搖飲？我看看滿減券……', delay: 2.2 }
            ],
            'en': [
              { speaker: 'da', text: "This model goes live tomorrow, let's sync metrics.", delay: 2.2 },
              { speaker: 'weihao', text: "Order boba this afternoon? Let me check discount coupons...", delay: 2.2 }
            ]
          }
        },
        {
          zone: 'douyin_office',
          participants: ['chenxin', 'baisen'],
          dialogues: {
            'zh-TW': [
              { speaker: 'chenxin', text: '這版 Figma 設計稿的元件間距很舒服，切起版來太爽了！', delay: 2.2 },
              { speaker: 'baisen', text: '大家今天站會的進度都同步了嗎？', delay: 2.2 }
            ],
            'en': [
              { speaker: 'chenxin', text: "Component spacing in Figma is super crisp, slicing it is great!", delay: 2.2 },
              { speaker: 'baisen', text: "Has everyone synced on today's standup updates?", delay: 2.2 }
            ]
          }
        },
        // === 3. AI Studio Group (前瞻智慧實驗室) ===
        {
          zone: 'ai_studio',
          participants: ['chatgpt', 'claude'],
          dialogues: {
            'zh-TW': [
              { speaker: 'chatgpt', text: '嗨！今天想探索什麼新想法或有趣的知識？', delay: 2.2 },
              { speaker: 'claude', text: '我可以為你提供嚴密、結構化且深度的推理分析。', delay: 2.2 }
            ],
            'en': [
              { speaker: 'chatgpt', text: "Hi! What new ideas or knowledge would you like to explore today?", delay: 2.2 },
              { speaker: 'claude', text: "I can provide rigorous, structured and deep analytical reasoning.", delay: 2.2 }
            ]
          }
        },
        {
          zone: 'ai_studio',
          participants: ['gemini', 'ludwigia'],
          dialogues: {
            'zh-TW': [
              { speaker: 'gemini', text: '我擅長融合多模態資訊，文字、圖像與程式碼都能靈活掌握！', delay: 2.2 },
              { speaker: 'ludwigia', text: '歡迎來到數位花園！每一株思想都在這裡茁壯成長。', delay: 2.2 }
            ],
            'en': [
              { speaker: 'gemini', text: "I seamlessly bridge multimodal context: text, images and code!", delay: 2.2 },
              { speaker: 'ludwigia', text: "Welcome to the Digital Garden! Every thought blooms here.", delay: 2.2 }
            ]
          }
        },
        // === 4. Sanmin High School Group (三民高中校園) ===
        {
          zone: 'sanmin_school',
          participants: ['benny', 'zhenyan'],
          dialogues: {
            'zh-TW': [
              { speaker: 'benny', text: 'I have a pen, I have an apple. Uh! Apple pen!', delay: 2.2 },
              { speaker: 'zhenyan', text: '下課要不要去打球？', delay: 2.2 }
            ],
            'en': [
              { speaker: 'benny', text: 'I have a pen, I have an apple. Uh! Apple pen!', delay: 2.2 },
              { speaker: 'zhenyan', text: 'Wanna go shoot hoops after class?', delay: 2.2 }
            ]
          }
        },
        {
          zone: 'sanmin_school',
          participants: ['zhewei', 'youting'],
          dialogues: {
            'zh-TW': [
              { speaker: 'zhewei', text: '這題數學解析幾何也太難了吧，算到頭好痛……', delay: 2.2 },
              { speaker: 'youting', text: '午餐便當我要吃大雞腿！', delay: 2.2 }
            ],
            'en': [
              { speaker: 'zhewei', text: "This analytic geometry problem is brutal...", delay: 2.2 },
              { speaker: 'youting', text: "For lunch bento I definitely want the big chicken leg!", delay: 2.2 }
            ]
          }
        },
        // === 5. Ludwig's House Group (路德維希的家) ===
        {
          zone: 'ludwig_house',
          participants: ['dad', 'mom'],
          dialogues: {
            'zh-TW': [
              { speaker: 'dad', text: '吃飯了沒？今天外面天氣挺不錯的。', delay: 2.2 },
              { speaker: 'mom', text: '出門記得多穿件外套！別著涼了。', delay: 2.2 }
            ],
            'en': [
              { speaker: 'dad', text: "Have you eaten yet? Weather is lovely outside.", delay: 2.2 },
              { speaker: 'mom', text: "Remember to bring a jacket when going out!", delay: 2.2 }
            ]
          }
        }
      ];
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

      // 2. Process conversation queue sequence
      if (this.dialogueQueue.length > 0) {
        this.queueTimer -= dt;
        if (this.queueTimer <= 0) {
          const nextItem = this.dialogueQueue.shift();
          const targetChar = this.characters.find(c => c.id === nextItem.speakerId);
          if (targetChar) {
            this.triggerSpeechBubble(targetChar, nextItem.text, nextItem.duration || 3.8);
          }
          this.queueTimer = nextItem.nextDelay || 2.2;
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

      // Check paired conversations first
      const pairs = this.conversationPairs.slice().sort(() => Math.random() - 0.5);

      for (const pair of pairs) {
        const p1 = this.characters.find(c => c.id === pair.participants[0]);
        const p2 = this.characters.find(c => c.id === pair.participants[1]);
        if (!p1 || !p2) continue;

        // Ensure characters haven't spoken within the last 10 seconds
        if (now - (p1.lastSpokeTime || 0) < 10000 || now - (p2.lastSpokeTime || 0) < 10000) continue;

        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const inSameZone = (p1.zone && p2.zone && p1.zone === p2.zone);
        if (dist < 5.0 || inSameZone) {
          const lines = pair.dialogues[langKey] || pair.dialogues['zh-TW'];
          if (!lines || lines.length === 0) continue;

          // First character speaks
          const first = lines[0];
          const speaker1 = this.characters.find(c => c.id === first.speaker);
          if (speaker1) {
            this.triggerSpeechBubble(speaker1, first.text, 3.8);
          }

          // Queue remaining replies
          this.dialogueQueue = [];
          for (let i = 1; i < lines.length; i++) {
            const item = lines[i];
            this.dialogueQueue.push({
              speakerId: item.speaker,
              text: item.text,
              duration: 3.8,
              nextDelay: item.delay || 2.2
            });
          }
          this.queueTimer = lines[0].delay || 2.2;
          return;
        }
      }

      // Fallback: Pick a single random NPC to say an ambient thought
      const eligible = this.characters.filter(c => !c.isPlayer && !c.speechBubble && (now - (c.lastSpokeTime || 0) > 12000));
      if (eligible.length > 0) {
        const char = eligible[Math.floor(Math.random() * eligible.length)];
        const pool = char.dialogues && (char.dialogues[langKey] || char.dialogues['zh-TW']);
        if (pool && pool.length > 0) {
          const choice = pool[Math.floor(Math.random() * pool.length)];
          const line = Array.isArray(choice) ? choice[0] : choice;
          if (line) {
            this.triggerSpeechBubble(char, line, 3.8);
          }
        }
      }
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
