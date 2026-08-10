(() => {
  const rootSelector = '[data-about-skills-root]';
  const langRuntime = window.LudwigLanguage || null;
  const dataPath = 'data/Skills/skills.json';

  const state = {
    activeCategoryIndex: 0,
    data: null,
    isLoading: true,
    loadError: false,
  };

  const uiText = {
    en: {
      kicker: 'Proficiency & Stack',
      title: 'Skills & Capabilities',
      intro: 'Grouped skill domains sharing a compact, scalable space. Use the tabs or arrows to switch genres.',
      loading: 'Loading skills...',
      loadFailed: 'Unable to load skills data right now.',
      prevCategory: 'Previous category',
      nextCategory: 'Next category',
    },
    'zh-Hant': {
      kicker: '專業領域與能力值',
      title: '專業能力',
      intro: '將專業技能依主題分組，並在精簡空間內動態展示。可使用標籤或左右按鈕切換不同領域。',
      loading: '正在載入技能資料...',
      loadFailed: '目前無法載入技能資料。',
      prevCategory: '上一個類別',
      nextCategory: '下一個類別',
    },
    'zh-Hans': {
      kicker: '专业领域与能力值',
      title: '专业能力',
      intro: '将专业技能依主题分组，并在精简空间内动态展示。可使用标签或左右按钮切换不同领域。',
      loading: '正在载入技能数据...',
      loadFailed: '目前无法载入技能数据。',
      prevCategory: '上一个类别',
      nextCategory: '下一个类别',
    },
  };

  function getLang() {
    if (langRuntime && typeof langRuntime.getCurrentLang === 'function') {
      const l = langRuntime.getCurrentLang();
      if (l === 'zh-Hans' || l === 'zh-CN') return 'zh-Hans';
      if (l === 'zh-Hant' || l === 'zh-TW' || l === 'zh') return 'zh-Hant';
      return 'en';
    }
    const htmlLang = String(document.documentElement.lang || '').toLowerCase();
    if (htmlLang.includes('hans') || htmlLang.includes('cn')) return 'zh-Hans';
    if (htmlLang.includes('hant') || htmlLang.includes('tw')) return 'zh-Hant';
    return 'en';
  }

  function getLocalizedText(obj, lang) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj['zh-Hant'] || obj['en'] || '';
  }

  async function fetchSkillsData() {
    try {
      const res = await fetch(dataPath);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      state.data = json;
      state.isLoading = false;
    } catch (err) {
      console.warn('[about-skills] Failed to load skills.json:', err);
      state.loadError = true;
      state.isLoading = false;
    }
  }

  function render(container) {
    const lang = getLang();
    const txt = uiText[lang] || uiText['en'];

    if (state.isLoading) {
      container.innerHTML = `
        <div class="skills-card text-center p-4">
          <div class="spinner-border text-primary spinner-border-sm mb-2" role="status"></div>
          <p class="skills-loading-text mb-0">${txt.loading}</p>
        </div>
      `;
      return;
    }

    if (state.loadError || !state.data || !Array.isArray(state.data.categories) || state.data.categories.length === 0) {
      container.innerHTML = `
        <div class="skills-card text-center p-4">
          <p class="skills-loading-text mb-0">${txt.loadFailed}</p>
        </div>
      `;
      return;
    }

    const categories = state.data.categories;
    if (state.activeCategoryIndex < 0) state.activeCategoryIndex = 0;
    if (state.activeCategoryIndex >= categories.length) state.activeCategoryIndex = categories.length - 1;

    const currentCat = categories[state.activeCategoryIndex];
    const catTitle = getLocalizedText(currentCat.title, lang);

    // Build Tabs
    const tabsHtml = categories.map((cat, idx) => {
      const isActive = idx === state.activeCategoryIndex;
      const titleStr = getLocalizedText(cat.title, lang);
      const iconClass = cat.icon || 'fa-solid fa-layer-group';
      return `
        <button type="button" 
                class="skill-category-pill ${isActive ? 'active' : ''}" 
                data-skill-cat-idx="${idx}"
                aria-selected="${isActive}">
          <i class="${iconClass} me-1"></i> ${titleStr}
        </button>
      `;
    }).join('');

    // Build Skill Items
    const itemsHtml = (currentCat.items || []).map((item) => {
      const itemName = getLocalizedText(item.name, lang);
      const itemDesc = getLocalizedText(item.desc, lang);
      const pct = Math.max(0, Math.min(100, item.percentage || 0));
      const badgeText = item.badge || item.level || '';

      return `
        <div class="skill-item mb-4">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="skill-name fw-bold me-2">${itemName}</span>
            <div class="skill-meta text-end">
              ${badgeText ? `<span class="badge skill-badge me-2">${badgeText}</span>` : ''}
              <span class="skill-percent fw-semibold">${pct}%</span>
            </div>
          </div>
          <div class="skill-bar-outer">
            <div class="skill-bar-fill" style="width: ${pct}%;"></div>
          </div>
          ${itemDesc ? `<p class="skill-item-desc mt-1 mb-0 small">${itemDesc}</p>` : ''}
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="skills-section-wrapper">
        <div class="skills-header text-center mb-4">
          <span class="skills-kicker text-uppercase fw-semibold mb-1 d-block">${txt.kicker}</span>
          <h3 class="skills-title fw-bold mb-2">${txt.title}</h3>
          <p class="skills-intro mx-auto" style="max-width: 650px;">${txt.intro}</p>
        </div>

        <div class="skills-card p-4 rounded-4 shadow-sm">
          <!-- Category Navigation -->
          <div class="skills-nav-container d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
            <button type="button" 
                    class="btn btn-outline-secondary btn-sm rounded-circle skill-nav-arrow skill-nav-prev" 
                    data-skill-nav="prev"
                    aria-label="${txt.prevCategory}"
                    title="${txt.prevCategory}"
                    ${state.activeCategoryIndex === 0 ? 'disabled' : ''}>
              <i class="fa-solid fa-chevron-left"></i>
            </button>

            <div class="skill-category-pills d-flex flex-wrap justify-content-center gap-2 mx-2">
              ${tabsHtml}
            </div>

            <button type="button" 
                    class="btn btn-outline-secondary btn-sm rounded-circle skill-nav-arrow skill-nav-next" 
                    data-skill-nav="next"
                    aria-label="${txt.nextCategory}"
                    title="${txt.nextCategory}"
                    ${state.activeCategoryIndex === categories.length - 1 ? 'disabled' : ''}>
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          <!-- Active Category Content -->
          <div class="skills-content-viewport">
            <div class="d-flex align-items-center mb-3">
              <i class="${currentCat.icon || 'fa-solid fa-layer-group'} me-2 fs-5 text-primary"></i>
              <h4 class="mb-0 fw-bold fs-5">${catTitle}</h4>
            </div>
            <div class="skills-grid">
              ${itemsHtml}
            </div>
          </div>
        </div>
      </div>
    `;

    bindEvents(container);
  }

  function bindEvents(container) {
    container.querySelectorAll('[data-skill-cat-idx]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(e.currentTarget.getAttribute('data-skill-cat-idx'), 10);
        if (!isNaN(idx) && idx !== state.activeCategoryIndex) {
          state.activeCategoryIndex = idx;
          render(container);
        }
      });
    });

    const prevBtn = container.querySelector('[data-skill-nav="prev"]');
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (state.activeCategoryIndex > 0) {
          state.activeCategoryIndex--;
          render(container);
        }
      });
    }

    const nextBtn = container.querySelector('[data-skill-nav="next"]');
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (state.data && state.data.categories && state.activeCategoryIndex < state.data.categories.length - 1) {
          state.activeCategoryIndex++;
          render(container);
        }
      });
    }
  }

  async function init() {
    const container = document.querySelector(rootSelector);
    if (!container) return;

    render(container);
    await fetchSkillsData();
    render(container);

    if (langRuntime && typeof langRuntime.onLangChange === 'function') {
      langRuntime.onLangChange(() => {
        render(container);
      });
    }

    window.addEventListener('ludwig-language-changed', () => {
      render(container);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
