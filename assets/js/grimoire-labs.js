(() => {
  const rootSelector = '[data-grimoire-root]';
  const langRuntime = window.LudwigLanguage || null;
  const DAY_MS = 24 * 60 * 60 * 1000;

  const cipherText = {
    en: {
      kicker: 'Labs · Spellbook',
      title: 'Grimoire',
      intro: 'A collection of prompts, skills, patterns, and field notes. Model-dependent spells record when and where they were last tested.',
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
      template: 'Patterns', templateOne: 'Pattern · Template', templateDesc: (n) => `${n} reusable templates.`,
      guide: 'Field notes', guideOne: 'Field note · Guide', guideDesc: (n) => `${n} practical guides.`,
      reference: 'Reference',
      charged: 'Charged',
      chargedDesc: (n) => `${n} verified recently.`,
      schools: 'Schools',
      all: 'All',
      seals: { charged: 'Charged', fading: 'Fading', untested: 'Untested', sealed: 'Sealed', reference: 'Reference' },
      sealExplain: {
        charged: (days, model) => `Tested ${days === 0 ? 'today' : `${days} day${days === 1 ? '' : 's'} ago`}${model ? ` with ${model}` : ''}.`,
        fading: (days, model) => `Last tested ${days} days ago${model ? ` with ${model}` : ''}; it may not hold on newer models.`,
        untested: () => 'No test run has been recorded yet.',
        sealed: () => 'Retired. Kept for reference only.',
        reference: () => 'Reusable reference material.',
      },
      note: (days) => `Prompts and skills fade after ${days} days without a fresh test; patterns and field notes remain references.`,
      open: 'Open',
      close: 'Close',
      status: 'Status',
      referenceLabel: 'Reference',
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
      intro: '收錄咒語（Prompt）、法術（Skill）、範本與手記。需要依賴模型的項目會記下最後試煉的時間與模型。',
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
      template: '範本', templateOne: '範本 · Template', templateDesc: (n) => `${n} 份可重用範本。`,
      guide: '手記', guideOne: '手記 · Guide', guideDesc: (n) => `${n} 份實用指南。`,
      reference: '參考資料',
      charged: '靈力充盈',
      chargedDesc: (n) => `${n} 則近期驗證過。`,
      schools: '流派',
      all: '全部',
      seals: { charged: '靈力充盈', fading: '靈力衰退', untested: '未經試煉', sealed: '已封印', reference: '參考資料' },
      sealExplain: {
        charged: (days, model) => `${days === 0 ? '今天' : `${days} 天前`}${model ? `以 ${model} ` : ''}試煉過。`,
        fading: (days, model) => `上次試煉是 ${days} 天前${model ? `（${model}）` : ''}，在較新的模型上可能不再有效。`,
        untested: () => '尚未記錄試煉的模型與日期。',
        sealed: () => '已停用，僅保留作為參考。',
        reference: () => '可直接閱讀與重用的參考資料。',
      },
      note: (days) => `Prompt 與 Skill 超過 ${days} 天未重新試煉會逐漸衰退；範本與手記屬於參考資料。`,
      open: '翻開',
      close: '闔上',
      status: '狀態',
      referenceLabel: 'Reference',
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
      intro: '收录咒语（Prompt）、法术（Skill）、模板与手记。需要依赖模型的项目会记下最后试炼的时间与模型。',
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
      template: '模板', templateOne: '模板 · Template', templateDesc: (n) => `${n} 份可复用模板。`,
      guide: '手记', guideOne: '手记 · Guide', guideDesc: (n) => `${n} 份实用指南。`,
      reference: '参考资料',
      charged: '灵力充盈',
      chargedDesc: (n) => `${n} 则近期验证过。`,
      schools: '流派',
      all: '全部',
      seals: { charged: '灵力充盈', fading: '灵力衰退', untested: '未经试炼', sealed: '已封印', reference: '参考资料' },
      sealExplain: {
        charged: (days, model) => `${days === 0 ? '今天' : `${days} 天前`}${model ? `以 ${model} ` : ''}试炼过。`,
        fading: (days, model) => `上次试炼是 ${days} 天前${model ? `（${model}）` : ''}，在较新的模型上可能不再有效。`,
        untested: () => '尚未记录试炼的模型与日期。',
        sealed: () => '已停用，仅保留作为参考。',
        reference: () => '可直接阅读与复用的参考资料。',
      },
      note: (days) => `Prompt 与 Skill 超过 ${days} 天未重新试炼会逐渐衰退；模板与手记属于参考资料。`,
      open: '翻开',
      close: '合上',
      status: '状态',
      referenceLabel: 'Reference',
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

  const neutralText = {
    en: {
      ...cipherText.en,
      kicker: 'Labs · Resources', title: 'Toolkit',
      intro: 'Templates, guides, prompts and skills I use or recommend. Browse by type and purpose, then open an entry to copy or download it.',
      summaryKicker: 'Resource overview', summaryTitle: 'Browse the toolkit',
      summaryCaption: 'Choose a type and a purpose to narrow the collection.', totalSub: 'in this toolkit',
      prompt: 'Prompts', promptOne: 'Prompt', promptDesc: (n) => `${n} prompts for specific tasks.`,
      skill: 'Skills', skillOne: 'Skill', skillDesc: (n) => `${n} agent workflows.`,
      template: 'Templates', templateOne: 'Template', guide: 'Guides', guideOne: 'Guide',
      schools: 'Purpose', school: 'Purpose',
      charged: 'Verified', chargedDesc: (n) => `${n} recently verified.`,
      seals: { charged: 'Verified', fading: 'Review needed', untested: 'Not yet tested', sealed: 'Archived', reference: 'Reference' },
      sealExplain: {
        charged: (days, model) => `Tested ${days === 0 ? 'today' : `${days} days ago`}${model ? ` with ${model}` : ''}.`,
        fading: (days, model) => `Last tested ${days} days ago${model ? ` with ${model}` : ''}; retest before relying on it.`,
        untested: () => 'No model test has been recorded yet.',
        sealed: () => 'Archived for reference.',
        reference: () => 'Reusable reference material; model verification does not apply.',
      },
      note: (days) => `Prompts and skills need a fresh test after ${days} days; templates and guides are references.`,
      open: 'Open', close: 'Close',
      lastTested: 'Last tested', loading: 'Loading resource...',
      loadFailed: 'Resources are unavailable right now.', bodyFailed: 'This resource could not be loaded.',
      empty: 'No resources match these filters.',
    },
    'zh-Hant': {
      ...cipherText['zh-Hant'],
      kicker: 'Labs · 資源', title: '工具庫',
      intro: '收錄可重用範本、指南、Prompt 與 Skill。可按種類與用途篩選，展開後複製或下載。',
      summaryKicker: '資源總覽', summaryTitle: '瀏覽工具庫',
      summaryCaption: '依種類與用途縮小範圍。', totalSub: '收錄於工具庫',
      prompt: 'Prompt', promptOne: 'Prompt', promptDesc: (n) => `${n} 則實用 Prompt。`,
      skill: 'Skill', skillOne: 'Skill', skillDesc: (n) => `${n} 份 Agent 工作流。`,
      template: '範本', templateOne: '範本 · Template', guide: '指南', guideOne: '指南 · Guide',
      schools: '用途', school: '用途',
      charged: '已驗證', chargedDesc: (n) => `${n} 則近期驗證過。`,
      seals: { charged: '已驗證', fading: '需要複驗', untested: '尚未驗證', sealed: '已封存', reference: '參考資料' },
      sealExplain: {
        charged: (days, model) => `${days === 0 ? '今天' : `${days} 天前`}${model ? `以 ${model} ` : ''}驗證過。`,
        fading: (days, model) => `${days} 天前${model ? `以 ${model} ` : ''}驗證，使用前建議複驗。`,
        untested: () => '尚未記錄模型驗證結果。',
        sealed: () => '已封存，僅供參考。',
        reference: () => '可重用的參考資料，不需要模型驗證。',
      },
      note: (days) => `Prompt 與 Skill 超過 ${days} 天需複驗；範本與指南屬於參考資料。`,
      open: '展開', close: '收起',
      lastTested: '最後驗證', loading: '正在載入資源...',
      loadFailed: '目前無法載入資源。', bodyFailed: '目前無法讀取此資源。',
      empty: '沒有符合篩選條件的資源。',
    },
    'zh-Hans': {
      ...cipherText['zh-Hans'],
      kicker: 'Labs · 资源', title: '工具库',
      intro: '收录可复用模板、指南、Prompt 与 Skill。可按种类与用途筛选，展开后复制或下载。',
      summaryKicker: '资源总览', summaryTitle: '浏览工具库',
      summaryCaption: '按种类与用途缩小范围。', totalSub: '收录于工具库',
      prompt: 'Prompt', promptOne: 'Prompt', promptDesc: (n) => `${n} 则实用 Prompt。`,
      skill: 'Skill', skillOne: 'Skill', skillDesc: (n) => `${n} 份 Agent 工作流。`,
      template: '模板', templateOne: '模板 · Template', guide: '指南', guideOne: '指南 · Guide',
      schools: '用途', school: '用途',
      charged: '已验证', chargedDesc: (n) => `${n} 则近期验证过。`,
      seals: { charged: '已验证', fading: '需要复验', untested: '尚未验证', sealed: '已归档', reference: '参考资料' },
      sealExplain: {
        charged: (days, model) => `${days === 0 ? '今天' : `${days} 天前`}${model ? `以 ${model} ` : ''}验证过。`,
        fading: (days, model) => `${days} 天前${model ? `以 ${model} ` : ''}验证，使用前建议复验。`,
        untested: () => '尚未记录模型验证结果。',
        sealed: () => '已归档，仅供参考。',
        reference: () => '可复用的参考资料，不需要模型验证。',
      },
      note: (days) => `Prompt 与 Skill 超过 ${days} 天需复验；模板与指南属于参考资料。`,
      open: '展开', close: '收起',
      lastTested: '最后验证', loading: '正在载入资源...',
      loadFailed: '目前无法载入资源。', bodyFailed: '目前无法读取此资源。',
      empty: '没有符合筛选条件的资源。',
    },
  };

  const KIND_ICONS = { prompt: 'fa-solid fa-terminal', skill: 'fa-solid fa-list-check', template: 'fa-regular fa-file-lines', guide: 'fa-regular fa-compass' };
  const SEAL_ICONS = {
    charged: 'fa-solid fa-bolt',
    fading: 'fa-solid fa-hourglass-half',
    untested: 'fa-regular fa-circle',
    sealed: 'fa-solid fa-lock',
    reference: 'fa-regular fa-bookmark',
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

  const isCipher = () => Boolean(window.LudwigCipherMode && window.LudwigCipherMode.isEnabled());
  const t = () => (isCipher() ? cipherText : neutralText)[getLang()] || neutralText.en;

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
    if (item.kind === 'template' || item.kind === 'guide') return { key: 'reference', days: null };
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
    root.querySelector('[data-grimoire-total]').textContent = String(all.length);

    const toggleKind = (kind) => () => {
      state.kind = state.kind === kind ? 'all' : kind;
      state.openId = null;
      render();
    };
    root.querySelector('[data-grimoire-stats]').replaceChildren(
      statTile({ iconClass: KIND_ICONS.prompt, title: txt.prompt, desc: txt.promptDesc(count('prompt')), active: state.kind === 'prompt', onClick: toggleKind('prompt') }),
      statTile({ iconClass: KIND_ICONS.skill, title: txt.skill, desc: txt.skillDesc(count('skill')), active: state.kind === 'skill', onClick: toggleKind('skill') }),
      statTile({ iconClass: KIND_ICONS.template, title: txt.template, desc: txt.templateDesc(count('template')), active: state.kind === 'template', onClick: toggleKind('template') }),
      statTile({ iconClass: KIND_ICONS.guide, title: txt.guide, desc: txt.guideDesc(count('guide')), active: state.kind === 'guide', onClick: toggleKind('guide') }),
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

  async function loadFile(relPath) {
    if (state.bodies.has(relPath)) return state.bodies.get(relPath);
    const res = await fetch(basePath + relPath);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    state.bodies.set(relPath, text);
    return text;
  }

  function getFileIcon(filename) {
    const ext = (filename || '').split('.').pop().toLowerCase();
    if (ext === 'md') return 'fa-regular fa-file-lines';
    if (ext === 'py') return 'fa-brands fa-python';
    if (ext === 'sh' || ext === 'bash') return 'fa-solid fa-terminal';
    if (ext === 'js' || ext === 'ts' || ext === 'json') return 'fa-regular fa-file-code';
    return 'fa-regular fa-file';
  }

  function resolveItemFiles(item) {
    const source = item.source || '';
    const lastSlash = source.lastIndexOf('/');
    const itemDir = lastSlash !== -1 ? source.slice(0, lastSlash + 1) : '';
    if (Array.isArray(item.files) && item.files.length > 0) {
      return item.files.map((f) => {
        const rel = typeof f === 'string' ? f : f.path;
        const label = typeof f === 'object' && f.label ? f.label : rel;
        const fullPath = rel.startsWith('skills/') || rel.startsWith('data/') || rel.startsWith('/') ? rel : itemDir + rel;
        const rawName = rel.split('/').pop() || rel;
        const lang = typeof f === 'object' && f.lang ? f.lang : null;
        return { path: fullPath, label, rawName, lang };
      });
    }
    let rawName = source.split('/').pop() || source;
    let label = rawName;
    if (item.kind === 'template' && item.title && typeof item.title.en === 'string' && item.title.en.includes('.')) {
      label = item.title.en;
      rawName = item.title.en;
    }
    return [{ path: source, label, rawName, lang: null }];
  }

  // Language versions of one resource are file tabs tagged with `lang`; open the one matching the site language.
  function initialFileIndex(files) {
    const lang = getLang();
    const order = lang === 'zh-Hans' ? ['zh-Hans', 'zh-Hant'] : lang === 'zh-Hant' ? ['zh-Hant', 'zh-Hans'] : [lang];
    for (const want of order) {
      const index = files.findIndex((f) => f.lang === want);
      if (index !== -1) return index;
    }
    return 0;
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

    const files = resolveItemFiles(item);
    const isLanguageSet = files.length > 1 && files.every((f) => f.lang);
    let activeIndex = initialFileIndex(files);
    let currentText = '';

    const sheet = el('div', 'grimoire-sheet');
    const scroll = el('div', 'grimoire-sheet-scroll');
    scroll.setAttribute('role', 'tabpanel');
    scroll.appendChild(el('p', 'grimoire-ledger-value', txt.loading));

    const tabButtons = [];
    // Single-file prompts read as one sheet; language versions and multi-file resources get tabs.
    if (item.kind !== 'prompt' || files.length > 1) {
      const header = el('div', 'grimoire-sheet-header');
      const tabsContainer = el('div', 'grimoire-sheet-tabs');
      tabsContainer.setAttribute('role', 'tablist');

      files.forEach((file, index) => {
        const tabBtn = el('button', `grimoire-sheet-tab${index === activeIndex ? ' is-active' : ''}`);
        tabBtn.type = 'button';
        tabBtn.setAttribute('role', 'tab');
        tabBtn.setAttribute('aria-selected', index === activeIndex ? 'true' : 'false');
        tabBtn.append(icon(getFileIcon(file.rawName)), el('span', '', file.label));
        tabBtn.addEventListener('click', () => {
          if (index === activeIndex) return;
          switchTab(index);
        });
        tabButtons.push(tabBtn);
        tabsContainer.appendChild(tabBtn);
      });

      header.appendChild(tabsContainer);
      if (files.length > 1 && !isLanguageSet) {
        const badge = el('span', 'grimoire-sheet-badge', `${files.length} files`);
        header.appendChild(badge);
      }
      sheet.appendChild(header);
    }
    sheet.appendChild(scroll);

    const ledger = el('aside', 'grimoire-ledger');
    const statusValue = el('p', 'grimoire-ledger-value');
    statusValue.textContent = txt.sealExplain[sealInfo.key](sealInfo.days, item.verified_with);
    ledger.appendChild(ledgerBlock(txt.status, statusValue));
    if (item.verified_at) ledger.appendChild(ledgerBlock(txt.lastTested, [item.verified_at, item.verified_with].filter(Boolean).join(' · ')));
    const category = categories().find((c) => c.id === item.category);
    ledger.appendChild(ledgerBlock(txt.school, localized(category && category.title) || item.category));
    const reference = item.reference;
    if (reference) {
      if (/^https:\/\//.test(reference)) {
        const link = el('a', 'grimoire-ledger-reference', reference);
        link.href = reference;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        ledger.appendChild(ledgerBlock(txt.referenceLabel, link));
      } else {
        ledger.appendChild(ledgerBlock(txt.referenceLabel, reference));
      }
    }
    if (sealInfo.key === 'sealed' && item.replaced_by) {
      const target = findItem(item.replaced_by);
      ledger.appendChild(ledgerBlock(txt.replacedBy, target ? localized(target.title) : item.replaced_by));
    }

    const actions = el('div', 'grimoire-actions');
    const copyBtn = actionButton('fa-regular fa-copy', txt.copy, true);
    const downloadBtn = actionButton('fa-solid fa-download', txt.download, false);
    const sourceLink = el('a', 'grimoire-action');
    sourceLink.target = '_blank';
    sourceLink.rel = 'noopener';
    sourceLink.append(icon('fa-solid fa-arrow-up-right-from-square'), el('span', '', txt.source));
    copyBtn.disabled = true;
    downloadBtn.disabled = true;
    actions.append(copyBtn, downloadBtn, sourceLink);
    ledger.appendChild(actions);

    detail.append(sheet, ledger);

    async function switchTab(index) {
      activeIndex = index;
      tabButtons.forEach((btn, i) => {
        btn.classList.toggle('is-active', i === index);
        btn.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });

      const activeFile = files[activeIndex];
      sourceLink.href = basePath + activeFile.path;
      copyBtn.disabled = true;
      downloadBtn.disabled = true;

      scroll.replaceChildren(el('p', 'grimoire-ledger-value', txt.loading));

      try {
        const text = await loadFile(activeFile.path);
        currentText = text;
        if (activeFile.path.endsWith('.md')) {
          renderMarkdown(text, scroll);
        } else {
          const pre = el('pre', 'grimoire-code');
          const codeEl = el('code', '', text);
          pre.appendChild(codeEl);
          scroll.replaceChildren(pre);
        }
        copyBtn.disabled = false;
        downloadBtn.disabled = false;
      } catch (err) {
        scroll.replaceChildren(el('p', 'grimoire-ledger-value', txt.bodyFailed));
      }
    }

    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(currentText);
        flash(copyBtn, txt.copied);
      } catch (err) {
        flash(copyBtn, txt.copyFailed);
      }
    });

    downloadBtn.addEventListener('click', () => {
      const activeFile = files[activeIndex];
      const blob = new Blob([currentText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeFile.rawName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    });

    switchTab(activeIndex);

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
    body.appendChild(el('div', 'grimoire-entry-kind', txt[`${item.kind}One`] || item.kind));
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
      const res = await fetch(`${basePath}data/Toolkit/toolkit.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      state.data = await res.json();
    } catch (err) {
      state.loadError = true;
    }
    render();
    window.addEventListener('ludwig-language-changed', render);
    window.addEventListener('ludwig-cipher-mode-changed', render);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
