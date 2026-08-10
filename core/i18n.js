(() => {
  const runtime = window.LudwigLanguage || null;
  const cipherRuntime = window.LudwigCipherMode || null;
  const getLang = () => (runtime && typeof runtime.getCurrentLang === 'function'
    ? runtime.getCurrentLang()
    : 'en');
  const isCipherMode = () => (cipherRuntime && typeof cipherRuntime.isEnabled === 'function'
    ? cipherRuntime.isEnabled()
    : document.documentElement.classList.contains('cipher-mode'));

  const page = String(document.body.getAttribute('data-i18n-page') || '').trim();

  let siteTranslations = null;

  function getRelativeUrl(subPath) {
    const scripts = document.querySelectorAll('script[src*="i18n"]');
    for (const script of scripts) {
      const src = script.getAttribute('src');
      if (src && src.includes('core/i18n')) {
        const rootPath = src.substring(0, src.indexOf('core/i18n'));
        return rootPath + subPath;
      }
    }
    const path = window.location.pathname;
    if (path.includes('/pages/') || path.includes('/notes/') || path.includes('/writing/') || path.includes('/canvas/') || path.includes('/garden/')) {
      return '../' + subPath;
    }
    return subPath;
  }

  async function loadModularJSON(file) {
    try {
      const res = await fetch(getRelativeUrl('i18n/' + file));
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  }

  let bundles = {
    common: {
      title: {},
      entries: [
        { selector: '#homeDropdown', text: { en: 'Home', 'zh-Hant': '首頁', 'zh-Hans': '首页' } },
        { selector: 'a[href$="index.html#about"]', text: { en: 'About', 'zh-Hant': '關於我', 'zh-Hans': '关于我' } },
        { selector: '[data-nav-skills]', text: { en: 'Skills', 'zh-Hant': '專業能力', 'zh-Hans': '专业能力' } },
        { selector: '[data-nav-credentials]', text: { en: 'Credentials', 'zh-Hant': '學業資歷與榮譽', 'zh-Hans': '学业资历与荣誉' } },
        { selector: '[data-nav-timeline]', text: { en: 'Timeline', 'zh-Hant': 'Timeline', 'zh-Hans': 'Timeline' }, cipherText: { en: 'Chronology', 'zh-Hant': 'Chronology', 'zh-Hans': 'Chronology' } },
        { selector: 'a[href$="index.html#contact"]', text: { en: 'Contact', 'zh-Hant': '聯絡方式', 'zh-Hans': '联系方式' } },
        { selector: '#projectsDropdown', text: { en: 'Projects', 'zh-Hant': '專案', 'zh-Hans': '项目' } },
        { selector: 'a[href$="notes/index.html"]', text: { en: 'Notes', 'zh-Hant': '筆記', 'zh-Hans': '笔记' }, cipherText: { en: 'Notes', 'zh-Hant': '日知', 'zh-Hans': '日知' } },
        { selector: 'a[href$="writing/index.html"]', text: { en: 'Writing', 'zh-Hant': '文章', 'zh-Hans': '文章' }, cipherText: { en: 'Writing', 'zh-Hant': '求音', 'zh-Hans': '求音' } },
        { selector: 'a[href$="canvas/index.html"]', text: { en: 'Canvas', 'zh-Hant': '圖廊', 'zh-Hans': '图廊' }, cipherText: { en: 'Canvas', 'zh-Hant': '視界', 'zh-Hans': '视界' } },
        { selector: 'a[href$="search.html"]', attr: 'aria-label', text: { en: 'Search', 'zh-Hant': '搜尋', 'zh-Hans': '搜索' } },
        { selector: 'a[href$="search.html"]', attr: 'title', text: { en: 'Search', 'zh-Hant': '搜尋', 'zh-Hans': '搜索' } },
        { selector: 'a[href$="search.html"] .visually-hidden', text: { en: 'Search', 'zh-Hant': '搜尋', 'zh-Hans': '搜索' } },
        { selector: 'a[href$="settings.html"]', attr: 'aria-label', text: { en: 'Settings', 'zh-Hant': '設定', 'zh-Hans': '设置' } },
        { selector: 'a[href$="settings.html"]', attr: 'title', text: { en: 'Settings', 'zh-Hant': '設定', 'zh-Hans': '设置' } },
        { selector: 'a[href$="settings.html"] .visually-hidden', text: { en: 'Settings', 'zh-Hant': '設定', 'zh-Hans': '设置' } },
        { selector: 'footer p', text: { en: '© 2025 Ludwig — All Rights Reserved', 'zh-Hant': '© 2025 Ludwig — 保留所有權利', 'zh-Hans': '© 2025 Ludwig — 保留所有权利' } },
      ],
    },
    contentPage: {
      title: {},
      entries: [
        { selector: '.mobile-note-nav-btn-left', attr: 'aria-label', text: { en: 'Open outline', 'zh-Hant': '開啟大綱', 'zh-Hans': '打开大纲' } },
        { selector: '.mobile-note-nav-btn-left', attr: 'title', text: { en: 'Outline', 'zh-Hant': '大綱', 'zh-Hans': '大纲' } },
        { selector: '.mobile-note-nav-btn-left .visually-hidden', text: { en: 'Outline', 'zh-Hant': '大綱', 'zh-Hans': '大纲' } },
        { selector: '.mobile-note-nav-btn-right', attr: 'aria-label', text: { en: 'Open metadata', 'zh-Hant': '開啟資訊', 'zh-Hans': '打开信息' } },
        { selector: '.mobile-note-nav-btn-right', attr: 'title', text: { en: 'Metadata', 'zh-Hant': '資訊', 'zh-Hans': '信息' } },
        { selector: '.mobile-note-nav-btn-right .visually-hidden', text: { en: 'Metadata', 'zh-Hant': '資訊', 'zh-Hans': '信息' } },
      ],
    },
    home: {
      title: {
        en: 'Ludwig — A passionate gamer of Earth Online',
        'zh-Hant': 'Ludwig — 一個熱衷於探索地球 Online 的初級玩家',
        'zh-Hans': 'Ludwig — 一个热衷于探索地球 Online 的初级玩家',
      },
      entries: [
        { selector: '.hero-text h1', text: { en: "Hi, I'm Ludwig", 'zh-Hant': '嗨你好，我叫健宏', 'zh-Hans': '嗨你好，我叫健宏' } },
        { selector: '.hero-text p', text: { en: 'An engineer who stays curious about Earth Online.', 'zh-Hant': '是一名對地球 Online 始終保持好奇的工程師', 'zh-Hans': '是一名对地球 Online 始终保持好奇的工程师' } },
        { selector: '#about h2', text: { en: 'About Me', 'zh-Hant': '關於我', 'zh-Hans': '关于我' } },
        { selector: '#contact h2', text: { en: 'Contact', 'zh-Hant': '聯絡方式', 'zh-Hans': '联系方式' } },
        { selector: '#contact h5:nth-of-type(1)', text: { en: 'Phone', 'zh-Hant': '電話', 'zh-Hans': '电话' } },
        { selector: '#contact h5:nth-of-type(2)', text: { en: 'Email', 'zh-Hant': '電子郵件', 'zh-Hans': '电子邮件' } },
      ],
    },
  };

  async function loadTranslationsFromData() {
    try {
      const navbarData = await loadModularJSON('navbar.json');
      if (navbarData && Array.isArray(navbarData.entries)) {
        bundles.common.entries = navbarData.entries;
      }

      const pageFiles = {
        home: 'index.json',
        projects: 'projects.json',
        search: 'search.json',
        settings: 'settings.json',
      };
      if (pageFiles[page]) {
        const pData = await loadModularJSON(pageFiles[page]);
        if (pData) bundles[page] = pData;
      }
      if (page === 'notesLanding' || page === 'writingLanding' || page === 'canvasLanding') {
        const lData = await loadModularJSON('landings.json');
        if (lData && lData[page]) bundles[page] = lData[page];
      }

      const skillsDict = await loadModularJSON('skills.json');
      const credsDict = await loadModularJSON('credentials.json');
      if (!siteTranslations) siteTranslations = {};
      if (skillsDict) siteTranslations.skills = skillsDict;
      if (credsDict) siteTranslations.credentials = credsDict;

      applyPageTranslations();
    } catch (e) {
      // Keep inline fallback
    }
  }

  const getEntryValue = (entry, lang) => {
    if (isCipherMode()) {
      if (entry && entry.cipherText && entry.cipherText[lang]) return entry.cipherText[lang];
      if (entry && entry.cipherHtml && entry.cipherHtml[lang]) return entry.cipherHtml[lang];
    }
    return (entry && entry.text && entry.text[lang]) || (entry && entry.html && entry.html[lang]) || '';
  };

  const applyEntries = (entries, lang) => {
    (Array.isArray(entries) ? entries : []).forEach((entry) => {
      const value = getEntryValue(entry, lang);
      if (!value) return;
      document.querySelectorAll(entry.selector).forEach((el) => {
        if (entry.attr) {
          el.setAttribute(entry.attr, value);
          return;
        }
        if (entry.html) {
          el.innerHTML = value;
          return;
        }
        el.textContent = value;
      });
    });
  };

  const applyPageTranslations = () => {
    const lang = getLang();
    const common = bundles.common || { entries: [] };
    applyEntries(common.entries, lang);

    const pageBundle = bundles[page];
    if (pageBundle && isCipherMode() && pageBundle.cipherTitle && pageBundle.cipherTitle[lang]) {
      document.title = pageBundle.cipherTitle[lang];
    } else if (pageBundle && pageBundle.title && pageBundle.title[lang]) {
      document.title = pageBundle.title[lang];
    } else if (common.title && common.title[lang]) {
      document.title = common.title[lang];
    }
    if (pageBundle) applyEntries(pageBundle.entries, lang);
    document.documentElement.setAttribute('data-site-lang', lang);
    document.documentElement.classList.remove('i18n-pending');
  };

  window.LudwigI18n = {
    t: (keyPath, fallback = '') => {
      if (!siteTranslations || !keyPath) return fallback;
      const parts = keyPath.split('.');
      let cur = siteTranslations;
      for (const p of parts) {
        if (cur && typeof cur === 'object' && p in cur) {
          cur = cur[p];
        } else {
          return fallback;
        }
      }
      const lang = getLang();
      if (cur && typeof cur === 'object' && (cur[lang] || cur['zh-Hant'] || cur['en'])) {
        return cur[lang] || cur['zh-Hant'] || cur['en'];
      }
      return typeof cur === 'string' ? cur : fallback;
    },
    applyPageTranslations,
    loadTranslationsFromData,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyPageTranslations();
      loadTranslationsFromData();
    }, { once: true });
  } else {
    applyPageTranslations();
    loadTranslationsFromData();
  }

  window.addEventListener('ludwig-language-changed', applyPageTranslations);
  window.addEventListener('ludwig-cipher-mode-changed', applyPageTranslations);
})();
