(() => {
  const titleEl = document.getElementById('patch-title');
  const subtitleEl = document.getElementById('patch-subtitle');
  const gridEl = document.getElementById('patch-grid');
  const emptyEl = document.getElementById('patch-empty');
  const openRawEl = document.getElementById('patch-open-raw');

  if (!titleEl || !subtitleEl || !gridEl || !emptyEl || !openRawEl) return;

  const params = new URLSearchParams(window.location.search);
  const tag = (params.get('tag') || '').trim();
  const tagLower = tag.toLowerCase();
  const topN = Math.max(0, Number(params.get('top') || 0));

  const docs = Array.isArray(window.SITE_SEARCH_INDEX) ? window.SITE_SEARCH_INDEX : [];

  const RECENT_KEY = 'garden_recent_v1';
  const getRecentMap = () => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (e) {}
    return {};
  };

  const normalize = (v) => String(v || '').replace(/\s+/g, ' ').trim();

  const decodeHtml = (value) => {
    const raw = String(value || '');
    if (!raw.includes('&')) return raw;
    const el = document.createElement('textarea');
    el.innerHTML = raw;
    return el.value;
  };

  const hash32 = (input) => {
    let h = 2166136261;
    for (let i = 0; i < input.length; i += 1) {
      h ^= input.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const species = [
    { name: 'Camellia', latin: 'Camellia japonica', desc: 'Evergreen, calm structure, slow growth.' },
    { name: 'Daisy', latin: 'Bellis perennis', desc: 'Small, resilient, returns often.' },
    { name: 'Lavender', latin: 'Lavandula', desc: 'Clear notes, strong scent, sharp edges.' },
    { name: 'Sunflower', latin: 'Helianthus annuus', desc: 'High signal, points to the sun.' },
    { name: 'Iris', latin: 'Iris', desc: 'Layered meaning, subtle gradients.' },
    { name: 'Peony', latin: 'Paeonia', desc: 'Dense, rich, more narrative.' },
  ];

  const pickSpecies = (doc) => {
    const h = hash32(`${doc.title}|${doc.url}`);
    return species[h % species.length];
  };

  const makeSvgBg = (doc) => {
    const h = hash32(`${doc.title}|${doc.url}`);
    const hueA = h % 360;
    const hueB = (hueA + 60) % 360;
    const hueC = (hueA + 140) % 360;
    const c1 = `hsl(${hueA} 70% 70%)`;
    const c2 = `hsl(${hueB} 65% 72%)`;
    const c3 = `hsl(${hueC} 60% 62%)`;

    const petals = [
      { x: 30, y: 26, r: 16 },
      { x: 44, y: 34, r: 18 },
      { x: 34, y: 44, r: 18 },
      { x: 20, y: 36, r: 18 },
    ];

    const petalSvg = petals
      .map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${i % 2 === 0 ? c1 : c2}" opacity="0.85"/>`)
      .join('');

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 100 70">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="rgba(255,255,255,0.10)"/>
            <stop offset="1" stop-color="rgba(0,0,0,0.18)"/>
          </linearGradient>
          <radialGradient id="bg" cx="25%" cy="15%" r="90%">
            <stop offset="0" stop-color="${c3}" stop-opacity="0.55"/>
            <stop offset="1" stop-color="#0b1610" stop-opacity="0.0"/>
          </radialGradient>
        </defs>
        <rect width="100" height="70" fill="url(#bg)"/>
        <g transform="translate(${15 + (h % 40)},${8 + ((h >>> 6) % 22)}) rotate(${(h % 30) - 15})">
          ${petalSvg}
          <circle cx="32" cy="36" r="10" fill="${c3}" opacity="0.85"/>
          <circle cx="32" cy="36" r="4" fill="rgba(255,255,255,0.9)"/>
        </g>
        <rect width="100" height="70" fill="url(#g)"/>
      </svg>
    `;

    const encoded = encodeURIComponent(svg)
      .replace(/%0A/g, '')
      .replace(/%20/g, ' ')
      .replace(/%3D/g, '=')
      .replace(/%3A/g, ':')
      .replace(/%2F/g, '/');

    return `url("data:image/svg+xml,${encoded}")`;
  };

  const truncate = (text, n) => {
    const t = normalize(text);
    if (t.length <= n) return t;
    return `${t.slice(0, n).trim()}…`;
  };

  const selectDocs = () => {
    let filtered = tag
      ? docs.filter((d) => Array.isArray(d.tags) && d.tags.some((t) => String(t).toLowerCase() === tagLower))
      : docs.slice();

    const recent = getRecentMap();
    filtered = filtered.sort((a, b) => {
      const ra = recent[String(a.url || '')] || 0;
      const rb = recent[String(b.url || '')] || 0;
      if (ra !== rb) return rb - ra;
      return String(a.title || '').localeCompare(String(b.title || ''));
    });

    if (topN > 0) filtered = filtered.slice(0, topN);
    return filtered;
  };

  const isEditableTarget = (t) => {
    if (!t) return false;
    const tagName = String(t.tagName || '').toLowerCase();
    if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') return true;
    return Boolean(t.isContentEditable);
  };

  let toggleFlipAllShortcut = null;
  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (isEditableTarget(e.target)) return;
    if (e.key === 'f' || e.key === 'F') {
      if (typeof toggleFlipAllShortcut === 'function') {
        e.preventDefault();
        toggleFlipAllShortcut();
      }
    }
  });

  const preview = (() => {
    const overlay = document.createElement('div');
    overlay.className = 'garden-note-overlay';
    overlay.innerHTML = `
      <div class="garden-note-panel">
        <div class="garden-note-panel-bg"></div>
        <button class="garden-note-panel-arrow garden-note-panel-arrow-prev" id="garden-note-preview-prev" type="button" disabled aria-label="Previous">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <button class="garden-note-panel-arrow garden-note-panel-arrow-next" id="garden-note-preview-next" type="button" disabled aria-label="Next">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
        <div class="garden-note-panel-inner">
          <div class="garden-note-panel-header">
            <div class="garden-note-panel-title" id="garden-note-preview-title"></div>
            <div class="garden-note-panel-actions">
              <a class="garden-note-panel-btn" id="garden-note-preview-open" href="#">Open</a>
              <button class="garden-note-panel-close" id="garden-note-preview-close" type="button">×</button>
            </div>
          </div>
          <div class="garden-note-panel-content" id="garden-note-preview-content"></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const title = overlay.querySelector('#garden-note-preview-title');
    const prev = overlay.querySelector('#garden-note-preview-prev');
    const next = overlay.querySelector('#garden-note-preview-next');
    const open = overlay.querySelector('#garden-note-preview-open');
    const close = overlay.querySelector('#garden-note-preview-close');
    const content = overlay.querySelector('#garden-note-preview-content');
    const bg = overlay.querySelector('.garden-note-panel');
    const cache = new Map();

    let hoverHideTimer = null;
    let pinned = false;
    let onPrev = null;
    let onNext = null;

    const setOpen = (isOpen) => {
      overlay.classList.toggle('is-open', isOpen);
      if (!isOpen) pinned = false;
    };

    const safeSetHtml = (html) => {
      content.innerHTML = html;
      const scripts = content.querySelectorAll('script');
      for (let i = 0; i < scripts.length; i += 1) scripts[i].remove();
    };

    const renderTextFallback = (doc) => {
      const t = escapeHtml(decodeHtml(doc.title || ''));
      const s = escapeHtml(decodeHtml(doc.summary || ''));
      const c = escapeHtml(decodeHtml(doc.content || ''));
      const body = s ? s : c;
      safeSetHtml(`<h3 style="margin-top:0;">${t}</h3><div class="divider"></div><div class="page-text">${body}</div>`);
    };

    const extractMainHtml = (htmlText) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      const section = doc.querySelector('section.page-section');
      if (!section) return '';
      const container = section.querySelector('.container');
      return container ? container.innerHTML : section.innerHTML;
    };

    const load = async (doc) => {
      const url = String(doc.url || '');
      if (!url) return;
      if (cache.has(url)) {
        safeSetHtml(cache.get(url));
        return;
      }
      try {
        const res = await fetch(url, { cache: 'force-cache' });
        if (!res.ok) throw new Error(String(res.status));
        const txt = await res.text();
        const html = extractMainHtml(txt);
        if (html) {
          cache.set(url, html);
          safeSetHtml(html);
        } else {
          renderTextFallback(doc);
        }
      } catch (e) {
        renderTextFallback(doc);
      }
    };

    const show = (doc) => {
      if (hoverHideTimer) {
        clearTimeout(hoverHideTimer);
        hoverHideTimer = null;
      }
      title.textContent = decodeHtml(doc.title || '');
      open.textContent = 'Open';
      open.href = String(doc.url || '#');
      bg.style.setProperty('--note-bg', makeSvgBg(doc));
      setOpen(true);
      load(doc);
    };

    const showFlower = (doc) => {
      if (hoverHideTimer) {
        clearTimeout(hoverHideTimer);
        hoverHideTimer = null;
      }
      const s = pickSpecies(doc);
      title.textContent = String(s && s.name ? s.name : 'Flower');
      open.textContent = 'Open Note';
      open.href = String(doc.url || '#');
      bg.style.setProperty('--note-bg', makeSvgBg(doc));
      setOpen(true);
      const latin = escapeHtml((s && s.latin) || '');
      const desc = escapeHtml((s && s.desc) || '');
      safeSetHtml(`
        <div class="project-card" style="margin-top:0;">
          <div class="garden-flip-species">${escapeHtml((s && s.name) || '')}</div>
          <div class="garden-flip-latin">${latin}</div>
          <div class="divider"></div>
          <div class="page-text">${desc}</div>
        </div>
      `);
    };

    const hideSoon = () => {
      if (pinned) return;
      if (hoverHideTimer) clearTimeout(hoverHideTimer);
      hoverHideTimer = setTimeout(() => setOpen(false), 220);
    };

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) setOpen(false);
    });
    overlay.addEventListener('mouseenter', () => {
      if (hoverHideTimer) clearTimeout(hoverHideTimer);
    });
    overlay.addEventListener('mouseleave', hideSoon);

    close.addEventListener('click', () => setOpen(false));
    open.addEventListener('click', () => {
      pinned = true;
    });
    prev.addEventListener('click', () => {
      if (typeof onPrev === 'function') onPrev();
    });
    next.addEventListener('click', () => {
      if (typeof onNext === 'function') onNext();
    });

    window.addEventListener('keydown', (e) => {
      if (isEditableTarget(e.target)) return;
      if (e.key === 'Escape') {
        if (overlay.classList.contains('is-open')) setOpen(false);
        return;
      }
      if (!overlay.classList.contains('is-open')) return;
      if (e.key === 'ArrowLeft') {
        if (typeof onPrev === 'function') {
          e.preventDefault();
          onPrev();
        }
        return;
      }
      if (e.key === 'ArrowRight') {
        if (typeof onNext === 'function') {
          e.preventDefault();
          onNext();
        }
      }
    });

    const isOpen = () => overlay.classList.contains('is-open');
    const setNavigator = (nav) => {
      onPrev = nav && typeof nav.onPrev === 'function' ? nav.onPrev : null;
      onNext = nav && typeof nav.onNext === 'function' ? nav.onNext : null;
      prev.disabled = !(nav && nav.canPrev);
      next.disabled = !(nav && nav.canNext);
    };
    return { show, showFlower, hideSoon, pin: () => { pinned = true; }, isOpen, close: () => setOpen(false), setNavigator };
  })();

  const render = () => {
    titleEl.textContent = tag ? tag : 'Garden Patch';
    openRawEl.href = tag ? `tag.html?tag=${encodeURIComponent(tag)}` : 'tag.html';
    subtitleEl.textContent = tag
      ? `A curated patch for “${tag}”. Click a card to expand.`
      : 'Pick a tag from clusters to start exploring.';

    const items = selectDocs();
    gridEl.innerHTML = '';
    emptyEl.style.display = items.length === 0 ? 'block' : 'none';

    const flipAllBtn = document.getElementById('patch-flip-all');
    let flippedAll = false;
    const applyFlipAll = () => {
      const cards = gridEl.querySelectorAll('.garden-flip-card');
      for (let i = 0; i < cards.length; i += 1) {
        cards[i].classList.toggle('is-flipped', flippedAll);
      }
      if (flipAllBtn) flipAllBtn.textContent = flippedAll ? 'Flip Back' : 'Flip All';
    };
    if (flipAllBtn) {
      flipAllBtn.onclick = () => {
        flippedAll = !flippedAll;
        applyFlipAll();
      };
      flipAllBtn.textContent = 'Flip All';
    }
    toggleFlipAllShortcut = () => {
      flippedAll = !flippedAll;
      applyFlipAll();
    };

    const docByUrl = new Map(items.map((d) => [String(d.url || ''), d]));

    let currentIndex = -1;
    let currentMode = 'doc';
    const openAt = (idx, mode) => {
      if (!items.length) return;
      const nextIdx = Math.max(0, Math.min(items.length - 1, idx));
      const doc = items[nextIdx];
      currentIndex = nextIdx;
      currentMode = mode === 'flower' ? 'flower' : 'doc';
      if (currentMode === 'flower') {
        preview.showFlower(doc);
      } else {
        preview.show(doc);
      }
      preview.pin();
      preview.setNavigator({
        canPrev: currentIndex > 0,
        canNext: currentIndex >= 0 && currentIndex < items.length - 1,
        onPrev: currentIndex > 0 ? () => openAt(currentIndex - 1, currentMode) : null,
        onNext: currentIndex >= 0 && currentIndex < items.length - 1 ? () => openAt(currentIndex + 1, currentMode) : null,
      });
    };
    preview.setNavigator({ canPrev: false, canNext: false, onPrev: null, onNext: null });

    items.forEach((doc, idx) => {
      const s = pickSpecies(doc);
      const bg = makeSvgBg(doc);

      const wrap = document.createElement('div');
      wrap.className = 'garden-flip-item';

      const card = document.createElement('div');
      card.className = 'garden-flip-card';
      card.setAttribute('role', 'button');
      card.tabIndex = 0;
      card.style.setProperty('--flower-bg', bg);
      card.addEventListener('click', (e) => {
        const target = e.target;
        if (target && target.closest && (target.closest('a') || target.closest('button'))) return;
        if (e.metaKey || e.ctrlKey) {
          window.open(String(doc.url || '#'), '_blank');
          return;
        }
        openAt(idx, card.classList.contains('is-flipped') ? 'flower' : 'doc');
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openAt(idx, card.classList.contains('is-flipped') ? 'flower' : 'doc');
          return;
        }
      });

      const decodedTitle = decodeHtml(doc.title || '');
      const decodedSummary = decodeHtml(doc.summary || '');
      const title = escapeHtml(truncate(decodedTitle, 42));
      const excerptSource = decodedSummary || decodeHtml(doc.content || '');
      const excerpt = escapeHtml(truncate(excerptSource, 360));
      const href = escapeHtml(String(doc.url || '#'));
      const related = Array.isArray(doc.related) ? doc.related : [];
      const relatedUrl = related.length > 0 ? String(related[0].url || '') : '';
      const relatedDoc = relatedUrl ? docByUrl.get(relatedUrl) : null;
      const relatedTitle = relatedDoc ? escapeHtml(truncate(decodeHtml(relatedDoc.title || ''), 44)) : '';
      const relatedHref = relatedDoc ? escapeHtml(String(relatedDoc.url || '#')) : '';
      const relatedHtml = relatedDoc
        ? `<div class="garden-flip-related">Related: <a href="${relatedHref}">${relatedTitle}</a></div>`
        : '';

      card.innerHTML = `
        <div class="garden-flip-inner">
          <div class="garden-flip-face garden-flip-front">
            <div class="garden-flip-front-bg"></div>
            <div class="garden-flip-front-content">
              <div class="garden-flip-title">${title}</div>
              <div class="garden-flip-excerpt">${excerpt}</div>
              ${relatedHtml}
              <a class="garden-flip-open" href="${href}">Open →</a>
            </div>
          </div>
          <div class="garden-flip-face garden-flip-back">
            <div class="garden-flip-back-content">
              <div class="garden-flip-species">${escapeHtml(s.name)}</div>
              <div class="garden-flip-latin">${escapeHtml(s.latin)}</div>
              <div class="garden-flip-desc">${escapeHtml(s.desc)}</div>
            </div>
          </div>
        </div>
      `;

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'garden-flip-toggle';
      toggle.setAttribute('aria-label', 'Flip card');
      toggle.textContent = '↺';
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        card.classList.toggle('is-flipped');
      });

      wrap.appendChild(card);
      wrap.appendChild(toggle);
      gridEl.appendChild(wrap);
    });

    applyFlipAll();
  };

  render();
})();
