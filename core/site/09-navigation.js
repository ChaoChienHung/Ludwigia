const PHONE_VIEWPORT_QUERY = "(max-width: 767.98px) and (hover: none), (max-width: 767.98px) and (pointer: coarse)";
const isPhoneViewport = () =>
  typeof window.matchMedia === "function" && window.matchMedia(PHONE_VIEWPORT_QUERY).matches;

const getCurrentPath = () => String(window.location.pathname || "");
const isProjectsPage = () => /\/projects\.html$/i.test(getCurrentPath());
const isNotesIndexPage = () => /\/notes\/index\.html$/i.test(getCurrentPath());
const isWritingIndexPage = () => /\/writing\/index\.html$/i.test(getCurrentPath());
const isCanvasIndexPage = () => /\/canvas\/index\.html$/i.test(getCurrentPath());
const isSearchPage = () => /\/search\.html$/i.test(getCurrentPath());
const isSettingsPage = () => /\/settings\.html$/i.test(getCurrentPath());
const isGardenPage = () => /\/garden\/(?:index|tag)\.html$/i.test(getCurrentPath());
const isLabsPage = () => /\/labs\/index\.html$/i.test(getCurrentPath());
const isPortfolioLandingPage = () => /\/portfolio\.html$/i.test(getCurrentPath());
const isMoreLandingPage = () => /\/more\.html$/i.test(getCurrentPath());
const isHomePage = () => /\/(?:index\.html)?$/i.test(getCurrentPath()) && !isNotesPage;
const isPortfolioPage = () =>
  isPortfolioLandingPage() || isProjectsPage() || isNotesPage || isNotesIndexPage() || isWritingIndexPage() || isCanvasIndexPage();
const isMorePage = () => isMoreLandingPage() || isGardenPage() || isLabsPage() || isSettingsPage();

const getMobileNavI18n = () => {
  const lang = window.LudwigLanguage ? window.LudwigLanguage.getCurrentLang() : "en";
  if (lang === "zh-Hans") {
    return {
      home: "首页",
      portfolio: "作品集",
      search: "搜索",
      menu: "菜单",
      menuTitle: "导航菜单",
      sections: "页面章节",
      about: "关于我",
      aboutDesc: "个人简介与专业背景",
      skills: "技能量表",
      skillsDesc: "多维度技能树与熟练度",
      credentials: "荣誉凭证",
      credentialsDesc: "奖状、成绩单与证书展示",
      timeline: "经历时间轴",
      timelineDesc: "学业、工作与成长里程碑",
      contact: "联系方式",
      contactDesc: "电话、邮箱与社交渠道",
      explore: "全站探索",
      projects: "精选项目",
      projectsDesc: "独立开发与工程作品",
      portals: "传送门",
      portalsDesc: "幻光仙境与多维传送枢纽",
      garden: "数字花园",
      gardenDesc: "交互式网状思辨与视觉标签",
      labs: "实验室",
      labsDesc: "实验性交互原型与动效",
      settings: "偏好设置",
      settingsDesc: "主题、调色盘、语言与动效",
      allPages: "更多页面总览",
      allPagesDesc: "全站地图、标签与本体论",
      readingControls: "阅读控制",
      toc: "大纲目录",
      tocDesc: "快速跳转文章小节",
      meta: "文章信息",
      metaDesc: "标签、日期与 Markdown 导出",
      readingMode: "沉浸阅读模式",
      readingModeDesc: "无干扰纯净阅读视图",
      close: "关闭"
    };
  }
  if (lang === "zh-Hant") {
    return {
      home: "首頁",
      portfolio: "作品集",
      search: "搜尋",
      menu: "選單",
      menuTitle: "導覽選單",
      sections: "頁面章節",
      about: "關於我",
      aboutDesc: "個人簡介與專業背景",
      skills: "技能量表",
      skillsDesc: "多維度技能樹與熟練度",
      credentials: "榮譽憑證",
      credentialsDesc: "獎狀、成績單與證書展示",
      timeline: "經歷時間軸",
      timelineDesc: "學業、工作與成長里程碑",
      contact: "聯絡方式",
      contactDesc: "電話、信箱與社交管道",
      explore: "全站探索",
      projects: "精選專案",
      projectsDesc: "獨立開發與工程作品",
      portals: "傳送門",
      portalsDesc: "幻光仙境與多維傳送樞紐",
      garden: "數位花園",
      gardenDesc: "互動式網狀思辨與視覺標籤",
      labs: "實驗室",
      labsDesc: "實驗性互動原型與動效",
      settings: "偏好設置",
      settingsDesc: "主題、調色盤、語言與動效",
      allPages: "更多頁面總覽",
      allPagesDesc: "全站地圖、標籤與本體論",
      readingControls: "閱讀控制",
      toc: "大綱目錄",
      tocDesc: "快速跳轉文章小節",
      meta: "文章資訊",
      metaDesc: "標籤、日期與 Markdown 導出",
      readingMode: "沉浸閱讀模式",
      readingModeDesc: "無干擾純淨閱讀視圖",
      close: "關閉"
    };
  }
  return {
    home: "Home",
    portfolio: "Portfolio",
    search: "Search",
    menu: "Menu",
    menuTitle: "Navigation Menu",
    sections: "Page Sections",
    about: "About Me",
    aboutDesc: "Personal intro and background",
    skills: "Skills Matrix",
    skillsDesc: "Technical and language proficiency",
    credentials: "Credentials & Honors",
    credentialsDesc: "Awards, transcripts & certificates",
    timeline: "Timeline",
    timelineDesc: "Career and academic milestones",
    contact: "Contact",
    contactDesc: "Reach out via email or phone",
    explore: "Explore Site",
    projects: "Projects",
    projectsDesc: "Showcase of projects and works",
    portals: "Portals",
    portalsDesc: "Aetheria portals & dimensional hub",
    garden: "Digital Garden",
    gardenDesc: "Visual concept map & idea garden",
    labs: "Labs",
    labsDesc: "Interactive experiments & visual demos",
    settings: "Settings",
    settingsDesc: "Theme, palette, language & motion",
    allPages: "More Hub",
    allPagesDesc: "Sitemap, ontology & tags",
    readingControls: "Reading Controls",
    toc: "Table of Contents",
    tocDesc: "Jump to section headings",
    meta: "Article Info",
    metaDesc: "Tags, dates & copy markdown",
    readingMode: "Reading Mode",
    readingModeDesc: "Distraction-free focus view",
    close: "Close"
  };
};

const closeMobileNavSheet = () => {
  document.body.classList.remove("mobile-nav-sheet-open");
};

const openMobileNavSheet = () => {
  ensureMobileNavSheet();
  document.body.classList.add("mobile-nav-sheet-open");
};

const toggleMobileNavSheet = () => {
  if (document.body.classList.contains("mobile-nav-sheet-open")) {
    closeMobileNavSheet();
  } else {
    openMobileNavSheet();
  }
};

const ensureMobileNavSheet = () => {
  let existingSheet = document.getElementById("mobile-nav-sheet");
  let existingBackdrop = document.getElementById("mobile-nav-sheet-backdrop");
  if (existingSheet) existingSheet.remove();
  if (existingBackdrop) existingBackdrop.remove();

  const txt = getMobileNavI18n();

  const backdrop = document.createElement("div");
  backdrop.id = "mobile-nav-sheet-backdrop";
  backdrop.className = "mobile-nav-sheet-backdrop";
  backdrop.addEventListener("click", closeMobileNavSheet);
  document.body.appendChild(backdrop);

  const sheet = document.createElement("div");
  sheet.id = "mobile-nav-sheet";
  sheet.className = "mobile-nav-sheet";
  sheet.setAttribute("role", "dialog");
  sheet.setAttribute("aria-modal", "true");
  sheet.setAttribute("aria-label", txt.menuTitle);

  const makeItemHtml = (iconClass, title, desc, href, actionAttr = "") => `
    <a class="mobile-nav-sheet-item" href="${href || '#'}" ${actionAttr}>
      <span class="mobile-nav-sheet-item-icon"><i class="${iconClass}"></i></span>
      <span class="mobile-nav-sheet-item-copy">
        <span class="mobile-nav-sheet-item-title">${title}</span>
        <span class="mobile-nav-sheet-item-desc">${desc}</span>
      </span>
    </a>
  `;

  let bodyContent = "";

  if (isHomePage()) {
    bodyContent += `
      <div class="mobile-nav-sheet-section-title">${txt.sections}</div>
      ${makeItemHtml("fa-regular fa-user", txt.about, txt.aboutDesc, "#about", 'data-mobile-sheet-jump="#about"')}
      ${makeItemHtml("fa-solid fa-chart-simple", txt.skills, txt.skillsDesc, "#skills", 'data-mobile-sheet-jump="#skills"')}
      ${makeItemHtml("fa-solid fa-certificate", txt.credentials, txt.credentialsDesc, "#credentials", 'data-mobile-sheet-jump="#credentials"')}
      ${makeItemHtml("fa-regular fa-clock", txt.timeline, txt.timelineDesc, "#timeline", 'data-mobile-sheet-jump="#timeline"')}
      ${makeItemHtml("fa-regular fa-envelope", txt.contact, txt.contactDesc, "#contact", 'data-mobile-sheet-jump="#contact"')}
      <div class="mobile-nav-sheet-section-title mt-2">${txt.explore}</div>
      ${makeItemHtml("fa-solid fa-laptop-code", txt.projects, txt.projectsDesc, resolveProjectPath("pages/projects.html"))}
      ${makeItemHtml("fa-solid fa-circle-nodes", txt.portals, txt.portalsDesc, resolveProjectPath("portals/index.html"))}
      ${makeItemHtml("fa-solid fa-flask", txt.labs, txt.labsDesc, resolveProjectPath("labs/index.html"))}
      ${makeItemHtml("fa-solid fa-gear", txt.settings, txt.settingsDesc, "#", 'data-mobile-sheet-action="settings"')}
      ${makeItemHtml("fa-solid fa-sitemap", txt.allPages, txt.allPagesDesc, resolveProjectPath("pages/more.html"))}
    `;
  } else if (isNotesPage) {
    bodyContent += `
      <div class="mobile-nav-sheet-section-title">${txt.readingControls}</div>
      ${makeItemHtml("fa-solid fa-list-ul", txt.toc, txt.tocDesc, "#", 'data-mobile-sheet-action="toc"')}
      ${makeItemHtml("fa-solid fa-circle-info", txt.meta, txt.metaDesc, "#", 'data-mobile-sheet-action="meta"')}
      ${makeItemHtml("fa-solid fa-book-open", txt.readingMode, txt.readingModeDesc, "#", 'data-mobile-sheet-action="reading-mode"')}
      <div class="mobile-nav-sheet-section-title mt-2">${txt.explore}</div>
      ${makeItemHtml("fa-solid fa-house", txt.home, txt.aboutDesc, resolveProjectPath("index.html"))}
      ${makeItemHtml("fa-regular fa-folder-open", txt.portfolio, "Notes, Writing & Canvas", resolveProjectPath("pages/portfolio.html"))}
      ${makeItemHtml("fa-solid fa-circle-nodes", txt.portals, txt.portalsDesc, resolveProjectPath("portals/index.html"))}
      ${makeItemHtml("fa-solid fa-gear", txt.settings, txt.settingsDesc, "#", 'data-mobile-sheet-action="settings"')}
      ${makeItemHtml("fa-solid fa-sitemap", txt.allPages, txt.allPagesDesc, resolveProjectPath("pages/more.html"))}
    `;
  } else {
    bodyContent += `
      <div class="mobile-nav-sheet-section-title">${txt.explore}</div>
      ${makeItemHtml("fa-solid fa-house", txt.home, "Main landing page", resolveProjectPath("index.html"))}
      ${makeItemHtml("fa-solid fa-laptop-code", txt.projects, txt.projectsDesc, resolveProjectPath("pages/projects.html"))}
      ${makeItemHtml("fa-solid fa-circle-nodes", txt.portals, txt.portalsDesc, resolveProjectPath("portals/index.html"))}
      ${makeItemHtml("fa-solid fa-flask", txt.labs, txt.labsDesc, resolveProjectPath("labs/index.html"))}
      ${makeItemHtml("fa-solid fa-gear", txt.settings, txt.settingsDesc, "#", 'data-mobile-sheet-action="settings"')}
      ${makeItemHtml("fa-solid fa-sitemap", txt.allPages, txt.allPagesDesc, resolveProjectPath("pages/more.html"))}
    `;
  }

  sheet.innerHTML = `
    <div class="mobile-nav-sheet-handle"></div>
    <div class="mobile-nav-sheet-header">
      <span class="mobile-nav-sheet-title">${txt.menuTitle}</span>
      <button type="button" class="mobile-nav-sheet-close" aria-label="${txt.close}">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div class="mobile-nav-sheet-body">
      ${bodyContent}
    </div>
  `;

  sheet.querySelector(".mobile-nav-sheet-close").addEventListener("click", closeMobileNavSheet);

  sheet.querySelectorAll("[data-mobile-sheet-jump]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      closeMobileNavSheet();
      const selector = item.getAttribute("data-mobile-sheet-jump");
      const target = document.querySelector(selector);
      if (target) {
        setTimeout(() => target.scrollIntoView({ behavior: "smooth" }), 80);
      }
    });
  });

  sheet.querySelectorAll("[data-mobile-sheet-action]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      closeMobileNavSheet();
      const action = item.getAttribute("data-mobile-sheet-action");
      if (action === "settings") {
        setTimeout(() => {
          if (typeof openSettingsModal === "function") openSettingsModal("general");
        }, 120);
      } else if (action === "toc") {
        setTimeout(openNoteToc, 120);
      } else if (action === "meta") {
        setTimeout(openNoteMeta, 120);
      } else if (action === "reading-mode") {
        setTimeout(() => {
          setReadingMode(!document.body.classList.contains("reading-mode"));
        }, 120);
      }
    });
  });

  document.body.appendChild(sheet);
};

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.body.classList.contains("mobile-nav-sheet-open")) {
    closeMobileNavSheet();
  }
});

const initMobileNavigation = () => {
  if (document.getElementById("mobile-bottom-nav")) return;
  if (!document.querySelector(".custom-nav")) return;

  document.body.classList.add("mobile-nav-enabled");

  const bottomNav = document.createElement("nav");
  bottomNav.id = "mobile-bottom-nav";
  bottomNav.className = "mobile-bottom-nav";
  bottomNav.setAttribute("aria-label", "Mobile navigation");

  const makeNavLink = (label, iconClass, href, isActive = false) => {
    const link = document.createElement("a");
    link.className = `mobile-bottom-nav-item${isActive ? " is-current" : ""}`;
    link.href = href;
    link.innerHTML = `
      <i class="${iconClass}"></i>
      <span>${label}</span>
    `;
    return link;
  };

  const txt = getMobileNavI18n();

  const homeLink = makeNavLink(txt.home, "fa-solid fa-house", resolveProjectPath("index.html"), isHomePage());
  if (isHomePage()) {
    homeLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  bottomNav.appendChild(homeLink);

  bottomNav.appendChild(makeNavLink(txt.portfolio, "fa-regular fa-folder-open", resolveProjectPath("pages/portfolio.html"), isPortfolioPage()));
  bottomNav.appendChild(makeNavLink(txt.search, "fa-solid fa-magnifying-glass", resolveProjectPath("pages/search.html"), isSearchPage()));

  const menuLink = makeNavLink(txt.menu, "fa-solid fa-bars", resolveProjectPath("pages/more.html"), false);
  menuLink.addEventListener("click", (e) => {
    e.preventDefault();
    toggleMobileNavSheet();
  });
  bottomNav.appendChild(menuLink);

  const updateMobileNavLabels = () => {
    const t = getMobileNavI18n();
    const items = bottomNav.querySelectorAll(".mobile-bottom-nav-item span");
    if (items.length >= 4) {
      items[0].textContent = t.home;
      items[1].textContent = t.portfolio;
      items[2].textContent = t.search;
      items[3].textContent = t.menu;
    }
  };
  window.addEventListener("ludwig-language-changed", updateMobileNavLabels);

  document.body.appendChild(bottomNav);
};

const openNoteToc = () => document.dispatchEvent(new CustomEvent("ludwig-open-note-toc"));
const openNoteMeta = () => document.dispatchEvent(new CustomEvent("ludwig-open-note-meta"));

const initMobileNoteNavbar = () => {
  if (!isNotesPage) return;

  document.body.classList.add("mobile-note-nav-page");
  document.querySelectorAll("[data-mobile-note-nav-action]").forEach((btn) => {
    if (btn.dataset.mobileNoteNavBound === "true") return;
    const action = btn.getAttribute("data-mobile-note-nav-action");
    if (action === "toc") {
      btn.addEventListener("click", openNoteToc);
    } else if (action === "meta") {
      btn.addEventListener("click", openNoteMeta);
    }
    btn.dataset.mobileNoteNavBound = "true";
  });
};

const ensureSiteIndexScript = () => {
  if (Array.isArray(window.SITE_SEARCH_INDEX)) return Promise.resolve(window.SITE_SEARCH_INDEX);
  const url = resolveProjectPath("search/search-index.js");
  const existing = Array.from(document.querySelectorAll("script[src]")).find((s) => s.getAttribute("src") === url);
  if (existing) return Promise.resolve(Array.isArray(window.SITE_SEARCH_INDEX) ? window.SITE_SEARCH_INDEX : []);

  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = url;
    s.async = true;
    s.onload = () => resolve(Array.isArray(window.SITE_SEARCH_INDEX) ? window.SITE_SEARCH_INDEX : []);
    s.onerror = () => resolve([]);
    document.head.appendChild(s);
    setTimeout(() => resolve(Array.isArray(window.SITE_SEARCH_INDEX) ? window.SITE_SEARCH_INDEX : []), 1200);
  });
};

const fetchSiteIndexJson = async () => {
  try {
    const res = await fetch(resolveProjectPath("search/search-index.json"), { cache: "no-store" });
    if (!res.ok) return [];
    const docs = await res.json();
    return Array.isArray(docs) ? docs : [];
  } catch (e) {
    return [];
  }
};

let siteIndexPromise = null;

const loadSiteIndex = async () => {
  if (Array.isArray(window.SITE_SEARCH_INDEX) && window.SITE_SEARCH_INDEX.length > 0) {
    return window.SITE_SEARCH_INDEX;
  }
  if (siteIndexPromise) return siteIndexPromise;

  siteIndexPromise = (async () => {
    const byJson = await fetchSiteIndexJson();
    if (Array.isArray(byJson) && byJson.length > 0) return byJson;

    const byScript = await ensureSiteIndexScript();
    if (Array.isArray(byScript) && byScript.length > 0) return byScript;

    return [];
  })();

  const docs = await siteIndexPromise;
  if (!Array.isArray(docs) || docs.length === 0) {
    siteIndexPromise = null;
  }
  return docs;
};

const deferNonCriticalInit = (fn, timeout = 1200) => {
  if (typeof fn !== "function") return;
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(() => fn(), { timeout });
    return;
  }
  window.setTimeout(fn, 1);
};

const getDocCanonicalId = (doc) => String((doc && (doc.canonical_id || doc.canonicalId || doc.path || doc.url)) || "");
const getDocLang = (doc) => normalizeLang((doc && doc.lang) || "");
const getCurrentSiteLang = () => window.LudwigLanguage.getCurrentLang();
const getContentUiI18n = () => {
  const uiLang = getCurrentSiteLang();
  if (uiLang === "zh-Hans") {
    return {
      fabOpenMenu: "打开菜单",
      fabMetadata: "信息",
      fabOutline: "大纲",
      fabPortals: "传送门",
      fabGarden: "花园",
      fabLabs: "实验室",
      estimatedReadingTime: "预计阅读时间",
      datesSection: "日期",
      lastModified: "最后更新",
      published: "发布日期",
      tagsSection: "标签",
      markdownSection: "Markdown",
      copyMarkdown: "复制 Markdown",
      downloadMarkdown: "下载 Markdown",
      copySuccess: "已复制。",
      copyFailure: "复制失败。",
      downloadSuccess: "已下载。",
      downloadFailure: "下载失败。",
      relatedHeading: "推荐文章",
      exploreMoreOn: (tag) => `探索更多 ${tag} 相关内容`,
      noteKind: "笔记",
      writingKind: "文章",
      openCount: (count) => `${count} 次打开`,
      relativeDay: (days) => (days === 0 ? "今天" : `${days} 天前`),
      languageSection: "语言",
      viewSection: "模式",
      toggleReadingMode: "切换阅读模式",
      readingModeState: (isOn) => (isOn ? "阅读模式：开启" : "阅读模式：关闭"),
    };
  }
  if (uiLang === "zh-Hant") {
    return {
      fabOpenMenu: "開啟選單",
      fabMetadata: "資訊",
      fabOutline: "大綱",
      fabPortals: "傳送門",
      fabGarden: "花園",
      fabLabs: "實驗室",
      estimatedReadingTime: "預估閱讀時間",
      datesSection: "日期",
      lastModified: "最後更新",
      published: "發布日期",
      tagsSection: "標籤",
      markdownSection: "Markdown",
      copyMarkdown: "複製 Markdown",
      downloadMarkdown: "下載 Markdown",
      copySuccess: "已複製。",
      copyFailure: "複製失敗。",
      downloadSuccess: "已下載。",
      downloadFailure: "下載失敗。",
      relatedHeading: "推薦文章",
      exploreMoreOn: (tag) => `探索更多 ${tag} 相關內容`,
      noteKind: "筆記",
      writingKind: "文章",
      openCount: (count) => `${count} 次開啟`,
      relativeDay: (days) => (days === 0 ? "今天" : `${days} 天前`),
      languageSection: "語言",
      viewSection: "模式",
      toggleReadingMode: "切換閱讀模式",
      readingModeState: (isOn) => (isOn ? "閱讀模式：開啟" : "閱讀模式：關閉"),
    };
  }
  return {
    fabOpenMenu: "Open menu",
    fabMetadata: "Metadata",
    fabOutline: "Outline",
    fabPortals: "Portals",
    fabGarden: "Garden",
    fabLabs: "Labs",
    estimatedReadingTime: "Estimated Reading Time",
    datesSection: "Dates",
    lastModified: "Last Modified",
    published: "Published",
    tagsSection: "Tags",
    markdownSection: "Markdown",
    copyMarkdown: "Copy Markdown",
    downloadMarkdown: "Download Markdown",
    copySuccess: "Copied.",
    copyFailure: "Copy failed.",
    downloadSuccess: "Downloaded.",
    downloadFailure: "Download failed.",
    relatedHeading: "Recommended Posts",
    exploreMoreOn: (tag) => `Explore more on ${tag}`,
    noteKind: "note",
    writingKind: "writing",
    openCount: (count) => `${count} opens`,
    relativeDay: (days) => (days === 0 ? "today" : `${days}d ago`),
    languageSection: "Language",
    viewSection: "View",
    toggleReadingMode: "Toggle reading mode",
    readingModeState: (isOn) => (isOn ? "Reading Mode: On" : "Reading Mode: Off"),
  };
};

const pickPreferredVariant = (docs, lang = "") => {
  const preferredLang = normalizeLang(lang || getCurrentSiteLang());
  const variants = Array.isArray(docs) ? docs.slice() : [];
  if (variants.length === 0) return null;
  variants.sort((a, b) => {
    const exactA = getDocLang(a) === preferredLang ? 1 : 0;
    const exactB = getDocLang(b) === preferredLang ? 1 : 0;
    if (exactA !== exactB) return exactB - exactA;
    return String((a && a.title) || "").localeCompare(String((b && b.title) || ""));
  });
  return variants[0] || null;
};

const initFab = () => {
  if (document.getElementById("site-fab")) return;

  if (isNotesPage) {
    document.body.classList.add("site-fab-mobile-unified");
  }

  const btn = document.createElement("button");
  btn.id = "site-fab";
  btn.type = "button";
  btn.className = "site-fab";
  btn.setAttribute("aria-expanded", "false");
  btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i>`;

  const panel = document.createElement("div");
  panel.id = "site-fab-panel";
  panel.className = "site-fab-panel";
  panel.setAttribute("aria-hidden", "true");
  panel.inert = true;

  const makeEntryMarkup = (iconClass, label) =>
    `<i class="${iconClass}"></i><span class="site-fab-entry-label">${label}</span>`;

  const makeLink = (href, label, iconClass, options = {}) => {
    const a = document.createElement("a");
    a.className = "site-fab-entry site-fab-link";
    if (options.mobileOnly) a.classList.add("site-fab-entry-mobile-only");
    a.href = href;
    a.setAttribute("aria-label", label);
    a.setAttribute("title", label);
    a.innerHTML = makeEntryMarkup(iconClass, label);
    return a;
  };

  const makeAction = (eventName, label, iconClass, options = {}) => {
    const action = document.createElement("button");
    action.type = "button";
    action.className = "site-fab-entry site-fab-action";
    if (options.mobileOnly) action.classList.add("site-fab-entry-mobile-only");
    action.setAttribute("aria-label", label);
    action.setAttribute("title", label);
    action.innerHTML = makeEntryMarkup(iconClass, label);
    action.addEventListener("click", () => {
      setOpen(false);
      document.dispatchEvent(new CustomEvent(eventName));
    });
    return action;
  };

  const setOpen = (on) => {
    document.body.classList.toggle("site-fab-open", on);
    btn.setAttribute("aria-expanded", on ? "true" : "false");
    panel.setAttribute("aria-hidden", on ? "false" : "true");
    panel.inert = !on;
  };

  if (isNotesPage) {
    const metaAction = makeAction("ludwig-open-note-meta", "", "fa-regular fa-circle-question", { mobileOnly: true });
    metaAction.dataset.fabLabelKey = "metadata";
    panel.appendChild(metaAction);
    const tocAction = makeAction("ludwig-open-note-toc", "", "fa-solid fa-list", { mobileOnly: true });
    tocAction.dataset.fabLabelKey = "outline";
    panel.appendChild(tocAction);
  }

  const portalsLink = makeLink(resolveProjectPath("portals/index.html"), "", "fa-solid fa-circle-nodes fa-fw");
  portalsLink.dataset.fabLabelKey = "portals";
  panel.appendChild(portalsLink);
  const labsLink = makeLink(resolveProjectPath("labs/index.html"), "", "fa-solid fa-flask fa-fw");
  labsLink.dataset.fabLabelKey = "labs";
  panel.appendChild(labsLink);

  const updateLabels = () => {
    const labels = getContentUiI18n();
    btn.setAttribute("aria-label", labels.fabOpenMenu);
    const mapping = {
      metadata: labels.fabMetadata,
      outline: labels.fabOutline,
      portals: labels.fabPortals,
      garden: labels.fabGarden,
      labs: labels.fabLabs,
    };
    panel.querySelectorAll("[data-fab-label-key]").forEach((entry) => {
      const key = String(entry.getAttribute("data-fab-label-key") || "");
      const text = mapping[key];
      if (!text) return;
      entry.setAttribute("aria-label", text);
      entry.setAttribute("title", text);
      const labelEl = entry.querySelector(".site-fab-entry-label");
      if (labelEl) labelEl.textContent = text;
    });
  };
  updateLabels();
  window.addEventListener("ludwig-language-changed", updateLabels);

  let closeTimer = null;
  const clearCloseTimer = () => {
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }
  };
  const openNow = () => {
    clearCloseTimer();
    setOpen(true);
  };
  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer = window.setTimeout(() => setOpen(false), 260);
  };

  const supportsHover = typeof window.matchMedia === "function" && window.matchMedia("(hover: hover)").matches;
  const syncDesktopFabOffset = () => {
    if (isPhoneViewport()) return;
    const container = document.querySelector(".custom-nav .container");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const rightOffset = Math.max(14, Math.round(window.innerWidth - rect.right));
    document.documentElement.style.setProperty("--fab-right", `${rightOffset}px`);
  };

  if (supportsHover) {
    btn.addEventListener("mouseenter", openNow);
    btn.addEventListener("mouseleave", scheduleClose);
    panel.addEventListener("mouseenter", openNow);
    panel.addEventListener("mouseleave", scheduleClose);
  }

  btn.addEventListener("click", () => setOpen(!document.body.classList.contains("site-fab-open")));
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!t) return;
    if (t === btn || btn.contains(t) || panel.contains(t)) return;
    setOpen(false);
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  document.body.appendChild(btn);
  document.body.appendChild(panel);
  syncDesktopFabOffset();
  window.addEventListener("resize", syncDesktopFabOffset);
};

initMobileNavigation();
initMobileNoteNavbar();
initFab();
initCopilot();
initCompanion();

