(() => {
  const rootSelector = '[data-grimoire-root]';
  const langRuntime = window.LudwigLanguage || null;
  const DAY_MS = 24 * 60 * 60 * 1000;

  const uiText = {
    en: {
      kicker: 'Labs · Spellbook',
      title: 'Grimoire',
      intro: 'The prompts and skills I actually cast. Models shift quickly, so every entry records when it was last tested and with which model.',
      summaryKicker: 'Tome overview',
      summaryTitle: 'Everything bound in this book',
      summaryCaption: 'Pick a kind or a school to narrow the pages.',
      totalLabel: 'entries',
      totalSub: 'in the grimoire',
      prompt: 'Incantations',
      promptOne: 'Incantation · Prompt',
      promptDesc: (n) => `${n} prompts to paste and cast.`,
      skill: 'Spells',
      skillOne: 'Spell · Skill',
      skillDesc: (n) => `${n} skills for agents to follow.`,
      charged: 'Charged',
      chargedDesc: (n) => `${n} verified recently.`,
      schools: 'Schools',
      all: 'All',
      seals: { charged: 'Charged', fading: 'Fading', untested: 'Untested', sealed: 'Sealed' },
      sealExplain: {
        charged: (days, model) => `Tested ${days === 0 ? 'today' : `${days} day${days === 1 ? '' : 's'} ago`}${model ? ` with ${model}` : ''}.`,
        fading: (days, model) => `Last tested ${days} days ago${model ? ` with ${model}` : ''}; it may not hold on newer models.`,
        untested: () => 'No test run has been recorded yet.',
        sealed: () => 'Retired. Kept for reference only.',
      },
      note: (days) => `An entry fades once it goes ${days} days without a fresh test.`,
      open: 'Open',
      close: 'Close',
      status: 'Status',
      lastTested: 'Last tested',
      school: 'School',
      replacedBy: 'Use instead',
      copy: 'Copy text',
      copied: 'Copied',
      copyFailed: 'Copy failed',
      download: 'Download .md',
      source: 'View raw file',
      loading: 'Turning the pages...',
      loadFailed: 'The grimoire could not be opened right now.',
      bodyFailed: 'This page could not be read right now.',
      empty: 'No pages match this filter.',
      back: 'Back to Labs',
    },
    'zh-Hant': {
      kicker: 'Labs · 魔導書',
      title: '魔導書',
      intro: '收錄我實際在用的咒語（Prompt）與法術（Skill）。模型變化很快，所以每一則都記下最後一次試煉的時間，以及用的是哪個模型。',
      summaryKicker: '魔導書總覽',
      summaryTitle: '書中收錄的一切',
      summaryCaption: '選擇類型或流派，縮小要翻閱的範圍。',
      totalLabel: '則',
      totalSub: '收錄於魔導書',
      prompt: '咒語',
      promptOne: '咒語 · Prompt',
      promptDesc: (n) => `${n} 則可直接複製使用的 Prompt。`,
      skill: '法術',
      skillOne: '法術 · Skill',
      skillDesc: (n) => `${n} 個給 Agent 遵循的 Skill。`,
      charged: '靈力充盈',
      chargedDesc: (n) => `${n} 則近期驗證過。`,
      schools: '流派',
      all: '全部',
      seals: { charged: '靈力充盈', fading: '靈力衰退', untested: '未經試煉', sealed: '已封印' },
      sealExplain: {
        charged: (days, model) => `${days === 0 ? '今天' : `${days} 天前`}${model ? `以 ${model} ` : ''}試煉過。`,
        fading: (days, model) => `上次試煉是 ${days} 天前${model ? `（${model}）` : ''}，在較新的模型上可能不再有效。`,
        untested: () => '尚未記錄試煉的模型與日期。',
        sealed: () => '已停用，僅保留作為參考。',
      },
      note: (days) => `超過 ${days} 天沒有重新試煉的項目，靈力會開始衰退。`,
      open: '翻開',
      close: '闔上',
      status: '狀態',
      lastTested: '最後試煉',
      school: '流派',
      replacedBy: '改用',
      copy: '複製全文',
      copied: '已複製',
      copyFailed: '複製失敗',
      download: '下載 .md',
      source: '查看原始檔',
      loading: '正在翻頁...',
      loadFailed: '目前無法翻開魔導書。',
      bodyFailed: '目前無法讀取這一頁。',
      empty: '沒有符合篩選條件的頁面。',
      back: '回到 Labs',
    },
    'zh-Hans': {
      kicker: 'Labs · 魔导书',
      title: '魔导书',
      intro: '收录我实际在用的咒语（Prompt）与法术（Skill）。模型变化很快，所以每一则都记下最后一次试炼的时间，以及用的是哪个模型。',
      summaryKicker: '魔导书总览',
      summaryTitle: '书中收录的一切',
      summaryCaption: '选择类型或流派，缩小要翻阅的范围。',
      totalLabel: '则',
      totalSub: '收录于魔导书',
      prompt: '咒语',
      promptOne: '咒语 · Prompt',
      promptDesc: (n) => `${n} 则可直接复制使用的 Prompt。`,
      skill: '法术',
      skillOne: '法术 · Skill',
      skillDesc: (n) => `${n} 个给 Agent 遵循的 Skill。`,
      charged: '灵力充盈',
      chargedDesc: (n) => `${n} 则近期验证过。`,
      schools: '流派',
      all: '全部',
      seals: { charged: '灵力充盈', fading: '灵力衰退', untested: '未经试炼', sealed: '已封印' },
      sealExplain: {
        charged: (days, model) => `${days === 0 ? '今天' : `${days} 天前`}${model ? `以 ${model} ` : ''}试炼过。`,
        fading: (days, model) => `上次试炼是 ${days} 天前${model ? `（${model}）` : ''}，在较新的模型上可能不再有效。`,
        untested: () => '尚未记录试炼的模型与日期。',
        sealed: () => '已停用，仅保留作为参考。',
      },
      note: (days) => `超过 ${days} 天没有重新试炼的项目，灵力会开始衰退。`,
      open: '翻开',
      close: '合上',
      status: '状态',
      lastTested: '最后试炼',
      school: '流派',
      replacedBy: '改用',
      copy: '复制全文',
      copied: '已复制',
      copyFailed: '复制失败',
      download: '下载 .md',
      source: '查看原始文件',
      loading: '正在翻页...',
      loadFailed: '目前无法翻开魔导书。',
      bodyFailed: '目前无法读取这一页。',
      empty: '没有符合筛选条件的页面。',
      back: '回到 Labs',
    },
  };

  const KIND_ICONS = { prompt: 'fa-solid fa-scroll', skill: 'fa-solid fa-wand-sparkles' };
  const SEAL_ICONS = {
    charged: 'fa-solid fa-bolt',
    fading: 'fa-solid fa-hourglass-half',
    untested: 'fa-regular fa-circle',
    sealed: 'fa-solid fa-lock',
  };

  const state = {
    data: null,
    loadError: false,
    kind: 'all',
    school: 'all',
    openId: null,
    bodies: new Map(),
  };

  let root = null;
  let basePath = '';

  function getLang() {
    const raw = langRuntime && typeof langRuntime.getCurrentLang === 'function'
      ? langRuntime.getCurrentLang()
      : String(document.documentElement.lang || '');
    const l = String(raw || '').toLowerCase();
    if (l.includes('hans') || l === 'zh-cn') return 'zh-Hans';
    if (l.startsWith('zh')) return 'zh-Hant';
    return 'en';
  }

  const t = () => uiText[getLang()] || uiText.en;

  function localized(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[getLang()] || obj['zh-Hant'] || obj.en || '';
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function icon(className) {
    const i = el('i', className);
    i.setAttribute('aria-hidden', 'true');
    return i;
  }

  function parseDate(value) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
    return m ? Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
  }

  const staleAfter = () => Number(state.data && state.data.stale_after_days) || 90;

  // Freshness is derived from verified_at at runtime; authors never hand-edit a status label.
  function seal(item) {
    if (item.status === 'deprecated') return { key: 'sealed', days: null };
    const at = parseDate(item.verified_at);
    if (at === null) return { key: 'untested', days: null };
    const days = Math.max(0, Math.floor((Date.now() - at) / DAY_MS));
    return { key: days > staleAfter() ? 'fading' : 'charged', days };
  }

  const items = () => (state.data && Array.isArray(state.data.items) ? state.data.items : []);
  const categories = () => (state.data && Array.isArray(state.data.categories) ? state.data.categories : []);
  const findItem = (id) => items().find((item) => item.id === id) || null;

  function renderHeader() {
    const txt = t();
    root.querySelector('[data-grimoire-kicker]').textContent = txt.kicker;
    root.querySelector('[data-grimoire-title]').textContent = txt.title;
    root.querySelector('[data-grimoire-intro]').textContent = txt.intro;
    root.querySelector('[data-grimoire-summary-kicker]').textContent = txt.summaryKicker;
    root.querySelector('[data-grimoire-summary-title]').textContent = txt.summaryTitle;
    root.querySelector('[data-grimoire-summary-caption]').textContent = txt.summaryCaption;
    root.querySelector('[data-grimoire-total-label]').textContent = txt.totalLabel;
    root.querySelector('[data-grimoire-total-sub]').textContent = txt.totalSub;
    root.querySelector('[data-grimoire-schools-title]').textContent = txt.schools;
    root.querySelector('[data-grimoire-back]').textContent = txt.back;
    document.title = `${txt.title} — Labs — Ludwig`;
  }

  function statTile({ iconClass, title, desc, active, onClick }) {
    const tile = el(onClick ? 'button' : 'div', `tag-summary-stat grimoire-stat${onClick ? '' : ' grimoire-stat--static'}${active ? ' is-active' : ''}`);
    if (onClick) {
      tile.type = 'button';
      tile.setAttribute('aria-pressed', String(Boolean(active)));
      tile.addEventListener('click', onClick);
    }
    const iconBox = el('div', 'hub-card-icon');
    iconBox.appendChild(icon(iconClass));
    const body = el('div', 'hub-card-body');
    const row = el('div', 'hub-card-title-row');
    row.appendChild(el('h2', '', title));
    body.append(row, el('p', 'mb-0', desc));
    tile.append(iconBox, body);
    return tile;
  }

  function renderSummary() {
    const txt = t();
    const all = items();
    const count = (kind) => all.filter((item) => item.kind === kind).length;
    const charged = all.filter((item) => seal(item).key === 'charged').length;
    root.querySelector('[data-grimoire-total]').textContent = String(all.length);

    const toggleKind = (kind) => () => {
      state.kind = state.kind === kind ? 'all' : kind;
      state.openId = null;
      render();
    };
    root.querySelector('[data-grimoire-stats]').replaceChildren(
      statTile({ iconClass: KIND_ICONS.prompt, title: txt.prompt, desc: txt.promptDesc(count('prompt')), active: state.kind === 'prompt', onClick: toggleKind('prompt') }),
      statTile({ iconClass: KIND_ICONS.skill, title: txt.skill, desc: txt.skillDesc(count('skill')), active: state.kind === 'skill', onClick: toggleKind('skill') }),
      statTile({ iconClass: SEAL_ICONS.charged, title: txt.charged, desc: txt.chargedDesc(charged) }),
    );

    const schools = root.querySelector('[data-grimoire-schools]');
    const pills = [{ id: 'all', label: txt.all, n: all.length }]
      .concat(categories().map((c) => ({ id: c.id, label: localized(c.title), n: all.filter((item) => item.category === c.id).length })));
    schools.replaceChildren(...pills.map(({ id, label, n }) => {
      const pill = el('button', `garden-tag${state.school === id ? ' is-active' : ''}`);
      pill.type = 'button';
      pill.setAttribute('aria-pressed', String(state.school === id));
      pill.append(document.createTextNode(`${label} `), el('span', 'garden-tag-count', String(n)));
      pill.addEventListener('click', () => {
        state.school = id;
        state.openId = null;
        render();
      });
      return pill;
    }));
    root.querySelector('[data-grimoire-note]').textContent = txt.note(staleAfter());
  }

  function sealBadge(sealInfo) {
    const badge = el('span', `hub-card-cta grimoire-seal is-${sealInfo.key}`);
    badge.append(icon(SEAL_ICONS[sealInfo.key]), document.createTextNode(t().seals[sealInfo.key]));
    return badge;
  }

  async function loadBody(item) {
    if (state.bodies.has(item.id)) return state.bodies.get(item.id);
    const res = await fetch(basePath + item.source);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    state.bodies.set(item.id, text);
    return text;
  }

  function renderMarkdown(text, target) {
    const core = window.SearchCore;
    if (core && typeof core.renderMarkdownPreview === 'function') {
      // The renderer escapes source text first, so the slot highlight only wraps already-escaped content.
      target.innerHTML = core.renderMarkdownPreview(text)
        .replace(/\{\{([^{}]{1,120})\}\}/g, '<mark class="grimoire-slot">$1</mark>');
      return;
    }
    target.replaceChildren(el('pre', 'grimoire-raw', text));
  }

  function flash(btn, label) {
    const original = btn.dataset.label || btn.textContent;
    btn.dataset.label = original;
    btn.lastChild.textContent = label;
    setTimeout(() => { btn.lastChild.textContent = original; }, 1600);
  }

  function actionButton(iconClass, label, primary) {
    const btn = el('button', `grimoire-action${primary ? ' grimoire-action--primary' : ''}`);
    btn.type = 'button';
    const span = el('span', '', label);
    btn.dataset.label = label;
    btn.append(icon(iconClass), span);
    return btn;
  }

  function ledgerBlock(label, value) {
    const block = el('div', 'grimoire-ledger-block');
    block.append(el('div', 'grimoire-ledger-label', label));
    if (value instanceof Node) block.appendChild(value);
    else block.appendChild(el('p', 'grimoire-ledger-value', value));
    return block;
  }

  function renderDetail(item, sealInfo) {
    const txt = t();
    const detail = el('div', 'grimoire-detail');

    const sheet = el('div', 'grimoire-sheet');
    const scroll = el('div', 'grimoire-sheet-scroll');
    scroll.appendChild(el('p', 'grimoire-ledger-value', txt.loading));
    sheet.appendChild(scroll);

    const ledger = el('aside', 'grimoire-ledger');
    const statusValue = el('p', 'grimoire-ledger-value');
    statusValue.textContent = txt.sealExplain[sealInfo.key](sealInfo.days, item.verified_with);
    ledger.appendChild(ledgerBlock(txt.status, statusValue));
    if (item.verified_at) ledger.appendChild(ledgerBlock(txt.lastTested, [item.verified_at, item.verified_with].filter(Boolean).join(' · ')));
    const category = categories().find((c) => c.id === item.category);
    ledger.appendChild(ledgerBlock(txt.school, localized(category && category.title) || item.category));
    if (sealInfo.key === 'sealed' && item.replaced_by) {
      const target = findItem(item.replaced_by);
      ledger.appendChild(ledgerBlock(txt.replacedBy, target ? localized(target.title) : item.replaced_by));
    }

    const actions = el('div', 'grimoire-actions');
    const copyBtn = actionButton('fa-regular fa-copy', txt.copy, true);
    const downloadBtn = actionButton('fa-solid fa-download', txt.download, false);
    const sourceLink = el('a', 'grimoire-action');
    sourceLink.href = basePath + item.source;
    sourceLink.target = '_blank';
    sourceLink.rel = 'noopener';
    sourceLink.append(icon('fa-solid fa-arrow-up-right-from-square'), el('span', '', txt.source));
    copyBtn.disabled = true;
    downloadBtn.disabled = true;
    actions.append(copyBtn, downloadBtn, sourceLink);
    ledger.appendChild(actions);

    detail.append(sheet, ledger);

    loadBody(item)
      .then((text) => {
        renderMarkdown(text, scroll);
        copyBtn.disabled = false;
        downloadBtn.disabled = false;
        copyBtn.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(text);
            flash(copyBtn, t().copied);
          } catch (err) {
            flash(copyBtn, t().copyFailed);
          }
        });
        downloadBtn.addEventListener('click', () => {
          const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${item.id}.md`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 0);
        });
      })
      .catch(() => {
        scroll.replaceChildren(el('p', 'grimoire-ledger-value', txt.bodyFailed));
      });

    return detail;
  }

  function renderEntry(item) {
    const txt = t();
    const sealInfo = seal(item);
    const isOpen = state.openId === item.id;
    const entry = el('article', `hub-card grimoire-entry is-${sealInfo.key}${isOpen ? ' is-open' : ''}`);
    entry.id = `grimoire-${item.id}`;

    const head = el('button', 'grimoire-entry-head');
    head.type = 'button';
    head.setAttribute('aria-expanded', String(isOpen));
    head.setAttribute('aria-label', `${isOpen ? txt.close : txt.open}: ${localized(item.title)}`);

    const iconBox = el('div', 'hub-card-icon');
    iconBox.appendChild(icon(KIND_ICONS[item.kind] || KIND_ICONS.prompt));
    const body = el('div', 'hub-card-body flex-grow-1');
    body.appendChild(el('div', 'grimoire-entry-kind', item.kind === 'skill' ? txt.skillOne : txt.promptOne));
    const row = el('div', 'hub-card-title-row');
    row.append(el('h2', '', localized(item.title)), sealBadge(sealInfo));
    body.append(row, el('p', 'grimoire-entry-summary', localized(item.summary)));
    head.append(iconBox, body, icon('fa-solid fa-chevron-down grimoire-chevron'));

    head.addEventListener('click', () => {
      state.openId = isOpen ? null : item.id;
      renderList();
      if (state.openId) {
        const opened = document.getElementById(`grimoire-${item.id}`);
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (opened) opened.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
    });

    entry.appendChild(head);
    if (isOpen) entry.appendChild(renderDetail(item, sealInfo));
    return entry;
  }

  function renderList() {
    const txt = t();
    const list = root.querySelector('[data-grimoire-list]');
    if (state.loadError) {
      list.replaceChildren(el('p', 'grimoire-empty', txt.loadFailed));
      return;
    }
    if (!state.data) {
      list.replaceChildren(el('p', 'grimoire-empty', txt.loading));
      return;
    }
    const visible = items()
      .filter((item) => state.kind === 'all' || item.kind === state.kind)
      .filter((item) => state.school === 'all' || item.category === state.school)
      // Sealed (deprecated) entries stay visible for reference but sink to the bottom.
      .sort((a, b) => Number(a.status === 'deprecated') - Number(b.status === 'deprecated'));
    if (!visible.length) {
      list.replaceChildren(el('p', 'grimoire-empty', txt.empty));
      return;
    }
    list.replaceChildren(...visible.map(renderEntry));
  }

  function render() {
    if (!root) return;
    renderHeader();
    if (state.data) renderSummary();
    renderList();
  }

  async function init() {
    root = document.querySelector(rootSelector);
    if (!root) return;
    basePath = root.getAttribute('data-grimoire-root') || '';
    render();
    try {
      const res = await fetch(`${basePath}data/Grimoire/grimoire.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      state.data = await res.json();
    } catch (err) {
      state.loadError = true;
    }
    render();
    window.addEventListener('ludwig-language-changed', render);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
