(() => {
  const searchInput = document.getElementById('cluster-search');
  const grid = document.getElementById('cluster-grid');
  const empty = document.getElementById('cluster-empty');
  const popularBtn = document.getElementById('cluster-mode-popular');
  const recentBtn = document.getElementById('cluster-mode-recent');
  const topKEl = document.getElementById('cluster-topk');

  if (!searchInput || !grid || !empty || !popularBtn || !recentBtn) return;

  const docs = Array.isArray(window.SITE_SEARCH_INDEX) ? window.SITE_SEARCH_INDEX : [];
  const TOP_K = 24;
  if (topKEl) topKEl.textContent = String(TOP_K);

  const RECENT_TAG_KEY = 'garden_recent_tags_v1';

  const normalize = (v) => String(v || '').toLowerCase().trim();

  const getRecentTagMap = () => {
    try {
      const raw = localStorage.getItem(RECENT_TAG_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (e) {}
    return {};
  };

  const markTagOpened = (tag) => {
    if (!tag) return;
    const now = Date.now();
    const map = getRecentTagMap();
    map[tag] = now;
    try {
      localStorage.setItem(RECENT_TAG_KEY, JSON.stringify(map));
    } catch (e) {}
  };

  const buildTagStats = () => {
    const map = new Map();
    for (const doc of docs) {
      const tags = Array.isArray(doc.tags) ? doc.tags : [];
      for (const rawTag of tags) {
        const tag = String(rawTag || '').trim();
        if (!tag) continue;
        if (!map.has(tag)) map.set(tag, { tag, count: 0, docs: [] });
        map.get(tag).count += 1;
        map.get(tag).docs.push(doc);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  };

  const stats = buildTagStats();

  const focusShortcut = () => {
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
    });
  };

  const openTag = (tag) => {
    markTagOpened(tag);
    window.location.href = `index.html#patch/${encodeURIComponent(tag)}`;
  };

  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

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

  const makeFlowers = (tag, docsForTag) => {
    const docs = Array.isArray(docsForTag)
      ? docsForTag.slice().sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')))
      : [];

    const count = docs.length;
    const n = clamp(count, 1, 8);
    const seed = hash32(tag);

    const positions = [
      { left: 16, top: 18 },
      { left: 36, top: 12 },
      { left: 58, top: 18 },
      { left: 74, top: 10 },
      { left: 22, top: 38 },
      { left: 44, top: 34 },
      { left: 66, top: 40 },
      { left: 80, top: 30 },
    ];

    const palette = [
      '#ff9ab3',
      '#ffe688',
      '#a5e0ff',
      '#ceaaFF',
      '#b8ffb1',
      '#ffd1a3',
      '#ffa3f1',
      '#a3fff6',
    ];

    const glyphs = [
      '✿', '✿', '✿',
      '❀', '❀', '❀',
      '✽', '✽',
      '✾', '✾',
      '❁',
      '❃',
      '❋',
      '✻',
      '✺',
      '✹',
      '✸',
      '❈',
      '❉',
      '❊',
      '✤',
      '✥',
      '❧',
      '❦',
      '☘',
      '✧',
      '✦',
    ];

    const used = new Set();
    const flowers = [];
    for (let i = 0; i < n; i += 1) {
      const idx = (seed + i * 13) % positions.length;
      const posIdx = used.has(idx) ? (idx + 3) % positions.length : idx;
      used.add(posIdx);
      const p = positions[posIdx];
      const doc = docs[i];
      const title = doc ? String(doc.title || '') : '';

      const h = hash32(`${tag}:${title || i}`);
      const color = palette[h % palette.length];
      const glyph = glyphs[(h >>> 3) % glyphs.length] || glyphs[0];
      const size = 12 + (h % 7);
      const rotate = (h % 36) - 18;

      flowers.push(
        `<span class="garden-flower" title="${escapeHtml(title)}" style="left:${p.left}%;top:${p.top}%;color:${color};font-size:${size}px;transform:translate(-50%,-50%) rotate(${rotate}deg)">${glyph}</span>`
      );
    }
    return flowers.join('');
  };

  const buildPopular = () => stats;

  const buildRecent = () => {
    const recent = getRecentTagMap();
    const items = stats
      .map((s) => ({ ...s, ts: recent[s.tag] || 0 }))
      .filter((s) => s.ts > 0)
      .sort((a, b) => b.ts - a.ts || b.count - a.count || a.tag.localeCompare(b.tag));
    return items.length > 0 ? items : stats;
  };

  let mode = buildRecent().length > 0 ? 'recent' : 'popular';

  const render = () => {
    const q = normalize(searchInput.value);
    const source = mode === 'recent' ? buildRecent() : buildPopular();
    const filtered = q ? source.filter((t) => normalize(t.tag).includes(q)) : source;

    grid.innerHTML = '';
    empty.style.display = filtered.length === 0 ? 'block' : 'none';

    for (const item of filtered.slice(0, TOP_K)) {
      const a = document.createElement('a');
      a.href = `index.html#patch/${encodeURIComponent(item.tag)}`;
      a.className = 'garden-cluster-card';
      a.addEventListener('click', () => markTagOpened(item.tag));

      const flowers = makeFlowers(item.tag, item.docs);
      a.innerHTML = `
        <div class="garden-cluster-card-art">
          <div class="garden-cluster-card-bush"></div>
          <div class="garden-cluster-card-flowers">${flowers}</div>
        </div>
        <div class="garden-cluster-card-label">
          <div class="garden-cluster-card-tag">${item.tag}</div>
          <div class="garden-cluster-card-count">${item.count} ${item.count === 1 ? 'flower' : 'flowers'}</div>
        </div>
      `;
      grid.appendChild(a);
    }
  };

  const init = () => {
    focusShortcut();
    searchInput.addEventListener('input', render);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const q = normalize(searchInput.value);
      const source = mode === 'recent' ? buildRecent() : buildPopular();
      const top = (q ? source.filter((t) => normalize(t.tag).includes(q)) : source)[0];
      if (top) openTag(top.tag);
    });

    const setMode = (next) => {
      mode = next;
      popularBtn.classList.toggle('is-active', mode === 'popular');
      recentBtn.classList.toggle('is-active', mode === 'recent');
      render();
    };

    popularBtn.addEventListener('click', () => setMode('popular'));
    recentBtn.addEventListener('click', () => setMode('recent'));

    setMode(mode);
  };

  init();
})();
