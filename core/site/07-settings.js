const SETTINGS_MODAL_ID = "site-settings-modal";
let settingsModalTab = "general";

const getSettingsBackdrop = () => document.getElementById("site-settings-modal-backdrop");

const hideSettingsModalFallback = () => {
  const modalEl = document.getElementById(SETTINGS_MODAL_ID);
  if (!modalEl) return;
  modalEl.classList.remove("settings-modal-fallback");
  modalEl.classList.remove("show");
  modalEl.style.display = "none";
  modalEl.setAttribute("aria-hidden", "true");
  const backdrop = getSettingsBackdrop();
  if (backdrop) backdrop.remove();
  document.body.classList.remove("modal-open");
};

const showSettingsModalFallback = (modalEl) => {
  let backdrop = getSettingsBackdrop();
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "site-settings-modal-backdrop";
    backdrop.className = "modal-backdrop fade show";
    document.body.appendChild(backdrop);
  }
  modalEl.classList.add("settings-modal-fallback");
  modalEl.style.display = "block";
  modalEl.classList.add("show");
  modalEl.removeAttribute("aria-hidden");
  document.body.classList.add("modal-open");
};

const getSettingsI18n = () => {
  const lang = window.LudwigLanguage.getCurrentLang();
  if (lang === "zh-Hans") {
    return {
      title: "设置",
      close: "关闭",
      general: "通用",
      style: "外观",
      language: "语言",
      theme: "主题",
      palette: "色盘",
      themeLabels: { dark: "深色", light: "浅色", "deep-sea": "深海", galaxy: "银河", sky: "天空", garden: "花园" },
      paletteLabels: { default: "默认", red: "宝石红", ember: "余烬橘", cedar: "雪松棕", yellow: "金黄色", garden: "花园绿", grove: "苔林绿", abyss: "深海青", sky: "天空蓝", galaxy: "银河蓝", nebula: "星云紫", ash: "灰烬灰" },
      motion: "动态效果",
      motionOn: "开启",
      motionOff: "关闭",
      copilot: "Copilot",
      copilotLabels: { off: "关闭", home: "仅首页", all: "全站" },
      copilotHint: "控制 Copilot 入口出现在哪些页面；用来降低阅读页与首页的视觉拥挤感。",
      companion: "陪伴物",
      companionHiddenTitle: "Companion 暂时隐藏",
      companionHiddenHint: "先只保留 Copilot 入口；Companion 的逻辑会先保留在代码里，等之后重新设计 avatar 再打开。",
      cipherHintLabel: "暗语提示",
      cipherHintTitle: "暗语模式",
      cipherHintBody: "试着用键盘输入一个你已经很熟悉的名字。",
      cipherHintStatusOn: "当前：已开启",
      cipherHintStatusOff: "当前：未开启",
    };
  }
  if (lang === "zh-Hant") {
    return {
      title: "設定",
      close: "關閉",
      general: "一般",
      style: "外觀",
      language: "語言",
      theme: "主題",
      palette: "色盤",
      themeLabels: { dark: "深色", light: "淺色", "deep-sea": "深海", galaxy: "銀河", sky: "天空", garden: "花園" },
      paletteLabels: { default: "預設", red: "寶石紅", ember: "餘燼橘", cedar: "雪松棕", yellow: "金黃色", garden: "花園綠", grove: "苔林綠", abyss: "深海青", sky: "天空藍", galaxy: "銀河藍", nebula: "星雲紫", ash: "灰燼灰" },
      motion: "動態效果",
      motionOn: "開啟",
      motionOff: "關閉",
      copilot: "Copilot",
      copilotLabels: { off: "關閉", home: "僅首頁", all: "全站" },
      copilotHint: "控制 Copilot 入口出現在哪些頁面；用來降低閱讀頁與首頁的視覺擁擠感。",
      companion: "陪伴物",
      companionHiddenTitle: "Companion 暫時隱藏",
      companionHiddenHint: "先只保留 Copilot 入口；Companion 的邏輯會先留在程式裡，等之後重新設計 avatar 再開回來。",
      cipherHintLabel: "暗語提示",
      cipherHintTitle: "暗語模式",
      cipherHintBody: "試著用鍵盤輸入一個你已經很熟悉的名字。",
      cipherHintStatusOn: "目前：已開啟",
      cipherHintStatusOff: "目前：未開啟",
    };
  }
  return {
    title: "Settings",
    close: "Close",
    general: "General",
    style: "Style",
    language: "Language",
    theme: "Theme",
    palette: "Palette",
    themeLabels: { dark: "Dark", light: "Light", "deep-sea": "Deep Sea", galaxy: "Galaxy", sky: "Sky", garden: "Garden" },
    paletteLabels: { default: "Default", red: "Ruby Red", ember: "Ember Orange", cedar: "Cedar Brown", yellow: "Golden Yellow", garden: "Garden Green", grove: "Garden Moss", abyss: "Abyss Cyan", sky: "Sky Blue", galaxy: "Galaxy Blue", nebula: "Nebula Violet", ash: "Ash Gray" },
    motion: "Effects",
    motionOn: "On",
    motionOff: "Off",
    copilot: "Copilot",
    copilotLabels: { off: "Off", home: "Home only", all: "All pages" },
    copilotHint: "Choose where Copilot should appear to reduce visual density on the homepage and reading surfaces.",
    companion: "Companion",
    companionHiddenTitle: "Companion is hidden for now",
    companionHiddenHint: "Copilot stays available, while the Companion runtime remains in code but hidden until the avatar set is redesigned.",
    cipherHintLabel: "Cipher hint",
    cipherHintTitle: "Cipher Mode",
    cipherHintBody: "Try typing a name you already know by heart.",
    cipherHintStatusOn: "Current: Enabled",
    cipherHintStatusOff: "Current: Off",
  };
};

const renderSettingsModalBody = () => {
  const text = getSettingsI18n();
  const activeTab = settingsModalTab === "style" ? "style" : "general";
  return `
    <div class="settings-modal-layout">
      <div class="settings-nav settings-modal-tabs">
        <button type="button" class="nav-link${activeTab === "general" ? " active" : ""}" data-settings-tab="general">${text.general}</button>
        <button type="button" class="nav-link${activeTab === "style" ? " active" : ""}" data-settings-tab="style">${text.style}</button>
      </div>
      <div class="settings-modal-panels">
        <div class="settings-modal-panel${activeTab === "general" ? " is-active" : ""}" data-settings-panel="general">
          <div class="project-card">
            <div class="settings-heading-row mb-3">
              <h3 class="mb-0">${text.language}</h3>
              <button type="button" class="garden-icon-btn settings-hint-btn" data-cipher-hint data-cipher-hint-title="${text.cipherHintTitle}" data-cipher-hint-body="${text.cipherHintBody}" aria-label="${text.cipherHintLabel}" title="${text.cipherHintLabel}">
                <i class="fa-solid fa-question"></i>
              </button>
            </div>
            <div class="settings-segmented-group">
              <button type="button" class="settings-pill settings-pill--status" data-settings-lang="en">English</button>
              <button type="button" class="settings-pill settings-pill--status" data-settings-lang="zh-Hant">中文</button>
              <button type="button" class="settings-pill settings-pill--status" data-settings-lang="zh-Hans">简体中文</button>
            </div>
            <p class="settings-hint-status mt-3 mb-0" data-cipher-hint-status>${window.LudwigCipherMode.isEnabled() ? text.cipherHintStatusOn : text.cipherHintStatusOff}</p>
          </div>
        </div>
        <div class="settings-modal-panel${activeTab === "style" ? " is-active" : ""}" data-settings-panel="style">
          <div class="project-card">
            <h3 class="mb-3">${text.theme}</h3>
            <div class="settings-theme-grid">
              <button type="button" class="settings-pill" data-settings-theme="dark">${text.themeLabels.dark}</button>
              <button type="button" class="settings-pill" data-settings-theme="light">${text.themeLabels.light}</button>
              <button type="button" class="settings-pill" data-settings-theme="deep-sea">${text.themeLabels["deep-sea"]}</button>
              <button type="button" class="settings-pill" data-settings-theme="galaxy">${text.themeLabels.galaxy}</button>
              <button type="button" class="settings-pill" data-settings-theme="sky">${text.themeLabels.sky}</button>
              <button type="button" class="settings-pill" data-settings-theme="garden">${text.themeLabels.garden}</button>
            </div>
          </div>
          <div class="project-card mt-3">
            <h3 class="mb-3">${text.palette}</h3>
            <div class="settings-option-carousel">
              <button type="button" class="garden-icon-btn settings-carousel-btn" data-settings-scroll="-1" data-settings-scroll-controls="settings-palette-track" aria-label="Scroll palettes left">
                <i class="fa-solid fa-chevron-left"></i>
              </button>
              <div class="settings-option-track" id="settings-palette-track" data-settings-scroll-target>
                <button type="button" class="settings-pill settings-pill--preview" data-settings-palette="default">${text.paletteLabels.default}</button>
                <button type="button" class="settings-pill settings-pill--preview" data-settings-palette="red">${text.paletteLabels.red}</button>
                <button type="button" class="settings-pill settings-pill--preview" data-settings-palette="ember">${text.paletteLabels.ember}</button>
                <button type="button" class="settings-pill settings-pill--preview" data-settings-palette="cedar">${text.paletteLabels.cedar}</button>
                <button type="button" class="settings-pill settings-pill--preview" data-settings-palette="yellow">${text.paletteLabels.yellow}</button>
                <button type="button" class="settings-pill settings-pill--preview" data-settings-palette="garden">${text.paletteLabels.garden}</button>
                <button type="button" class="settings-pill settings-pill--preview" data-settings-palette="grove">${text.paletteLabels.grove}</button>
                <button type="button" class="settings-pill settings-pill--preview" data-settings-palette="abyss">${text.paletteLabels.abyss}</button>
                <button type="button" class="settings-pill settings-pill--preview" data-settings-palette="sky">${text.paletteLabels.sky}</button>
                <button type="button" class="settings-pill settings-pill--preview" data-settings-palette="galaxy">${text.paletteLabels.galaxy}</button>
                <button type="button" class="settings-pill settings-pill--preview" data-settings-palette="nebula">${text.paletteLabels.nebula}</button>
                <button type="button" class="settings-pill settings-pill--preview" data-settings-palette="ash">${text.paletteLabels.ash}</button>
              </div>
              <button type="button" class="garden-icon-btn settings-carousel-btn" data-settings-scroll="1" data-settings-scroll-controls="settings-palette-track" aria-label="Scroll palettes right">
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
          <div class="project-card mt-3">
            <h3 class="mb-3">${text.motion}</h3>
            <div class="settings-segmented-group">
              <button type="button" class="settings-pill settings-pill--status" data-settings-motion="on">${text.motionOn}</button>
              <button type="button" class="settings-pill settings-pill--status" data-settings-motion="off">${text.motionOff}</button>
            </div>
          </div>
          <div class="project-card mt-3">
            <h3 class="mb-3">${text.copilot}</h3>
            <div class="settings-segmented-group">
              <button type="button" class="settings-pill settings-pill--status" data-settings-copilot="off">${text.copilotLabels.off}</button>
              <button type="button" class="settings-pill settings-pill--status" data-settings-copilot="home">${text.copilotLabels.home}</button>
              <button type="button" class="settings-pill settings-pill--status" data-settings-copilot="all">${text.copilotLabels.all}</button>
            </div>
            <p class="settings-inline-note mt-2 mb-0">${text.copilotHint}</p>
          </div>
          <div class="project-card mt-3">
            <h3 class="mb-3">${text.companion}</h3>
            <p class="settings-hint-status mb-0">${text.companionHiddenTitle}</p>
            <p class="settings-inline-note mt-2 mb-0">${text.companionHiddenHint}</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

const syncCipherHintElements = (root = document) => {
  const scope = root && typeof root.querySelectorAll === "function" ? root : document;
  const text = getSettingsI18n();
  const cipherText = getCipherModeI18n();
  scope.querySelectorAll("[data-cipher-hint]").forEach((el) => {
    el.setAttribute("aria-label", text.cipherHintLabel);
    el.setAttribute("title", text.cipherHintLabel);
    el.setAttribute("data-bs-title", text.cipherHintTitle);
    el.setAttribute("data-bs-content", text.cipherHintBody);
    if (window.bootstrap && window.bootstrap.Popover) {
      const existing = window.bootstrap.Popover.getInstance(el);
      if (existing) existing.dispose();
      window.bootstrap.Popover.getOrCreateInstance(el, {
        container: "body",
        customClass: "cipher-hint-popover",
        html: false,
        placement: "bottom",
        trigger: "hover focus click",
        title: text.cipherHintTitle,
        content: text.cipherHintBody,
      });
    }
  });
  scope.querySelectorAll("[data-cipher-hint-status]").forEach((el) => {
    el.textContent = window.LudwigCipherMode.isEnabled() ? cipherText.hintStatusOn : cipherText.hintStatusOff;
  });
};

const setSettingsActive = (root, selector, predicate) => {
  if (!root || typeof root.querySelectorAll !== "function") return;
  root.querySelectorAll(selector).forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    el.classList.toggle("is-active", Boolean(predicate(el)));
  });
};

const getSettingsSurfaceState = () => ({
  currentLang: window.LudwigLanguage.getCurrentLang(),
  currentTheme: getCurrentTheme(),
  currentPalette: String(getSavedPalette() || "").trim().toLowerCase() || "default",
  currentMotion: document.documentElement.classList.contains("theme-motion-off") ? "off" : "on",
  copilotVisibility: getSavedCopilotVisibility(),
  companionEnabled: getSavedCompanionState().enabled ? "on" : "off",
  companionVariant: getSavedCompanionState().variant,
  companionSupported: getSavedCompanionState().supported,
});

const syncSettingsSurfaceState = (root, { activeTab = "", syncCipherHints = true } = {}) => {
  if (!root || typeof root.querySelectorAll !== "function") return;
  const state = getSettingsSurfaceState();
  setSettingsActive(root, "[data-settings-lang]", (el) => String(el.getAttribute("data-settings-lang") || "").trim() === state.currentLang);
  setSettingsActive(root, "[data-settings-theme]", (el) => String(el.getAttribute("data-settings-theme") || "").trim() === state.currentTheme);
  setSettingsActive(root, "[data-settings-palette]", (el) => String(el.getAttribute("data-settings-palette") || "").trim().toLowerCase() === state.currentPalette);
  setSettingsActive(root, "[data-settings-motion]", (el) => String(el.getAttribute("data-settings-motion") || "").trim() === state.currentMotion);
  setSettingsActive(root, "[data-settings-copilot]", (el) => String(el.getAttribute("data-settings-copilot") || "").trim() === state.copilotVisibility);
  setSettingsActive(root, "[data-settings-companion]", (el) => String(el.getAttribute("data-settings-companion") || "").trim() === state.companionEnabled);
  setSettingsActive(root, "[data-settings-companion-variant]", (el) => String(el.getAttribute("data-settings-companion-variant") || "").trim() === state.companionVariant);
  if (activeTab) {
    root.querySelectorAll("[data-settings-tab]").forEach((el) => {
      const tab = String(el.getAttribute("data-settings-tab") || "");
      el.classList.toggle("active", tab === activeTab);
    });
    root.querySelectorAll("[data-settings-panel]").forEach((el) => {
      const tab = String(el.getAttribute("data-settings-panel") || "");
      el.classList.toggle("is-active", tab === activeTab);
    });
  }
  const text = getSettingsI18n();
  root.querySelectorAll("[data-settings-companion-status]").forEach((el) => {
    el.textContent = state.companionEnabled === "on"
      ? (state.companionSupported ? text.companionStatusOn : text.companionStatusUnsupportedOn)
      : (state.companionSupported ? text.companionStatusOff : text.companionStatusUnsupportedOff);
  });
  if (syncCipherHints) syncCipherHintElements(root);
};

const bindSettingsScrollControls = (root) => {
  if (!root) return;
  const update = () => {
    root.querySelectorAll("[data-settings-scroll-target]").forEach((track) => {
      if (!(track instanceof HTMLElement) || !track.id) return;
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      root.querySelectorAll(`[data-settings-scroll-controls="${track.id}"]`).forEach((btn) => {
        if (!(btn instanceof HTMLButtonElement)) return;
        const dir = Number(btn.getAttribute("data-settings-scroll") || "0");
        if (dir < 0) btn.disabled = track.scrollLeft <= 4;
        if (dir > 0) btn.disabled = track.scrollLeft >= maxScroll - 4;
      });
    });
  };

  root.querySelectorAll("[data-settings-scroll-target]").forEach((track) => {
    if (!(track instanceof HTMLElement) || track.dataset.scrollBound === "true") return;
    track.dataset.scrollBound = "true";
    track.addEventListener("scroll", update, { passive: true });
  });

  root.querySelectorAll("[data-settings-scroll]").forEach((btn) => {
    if (!(btn instanceof HTMLButtonElement) || btn.dataset.scrollBound === "true") return;
    btn.dataset.scrollBound = "true";
    btn.addEventListener("click", () => {
      const targetId = String(btn.getAttribute("data-settings-scroll-controls") || "");
      const target = targetId ? root.querySelector(`#${targetId}`) : null;
      if (!(target instanceof HTMLElement)) return;
      const dir = Number(btn.getAttribute("data-settings-scroll") || "0");
      target.scrollBy({ left: dir * Math.max(180, target.clientWidth * 0.72), behavior: "smooth" });
    });
  });

  update();
};

const applySettingsAction = (target, { onTabChange, onClose } = {}) => {
  const source = target instanceof Element ? target : null;
  if (!source) return false;

  const closeBtn = source.closest("[data-settings-modal-close]");
  if (closeBtn) {
    if (typeof onClose === "function") onClose();
    return true;
  }

  const langBtn = source.closest("[data-settings-lang]");
  if (langBtn) {
    setLanguage(String(langBtn.getAttribute("data-settings-lang") || ""), true);
    return true;
  }

  const themeBtn = source.closest("[data-settings-theme]");
  if (themeBtn) {
    setTheme(String(themeBtn.getAttribute("data-settings-theme") || ""), true);
    return true;
  }

  const paletteBtn = source.closest("[data-settings-palette]");
  if (paletteBtn) {
    const value = String(paletteBtn.getAttribute("data-settings-palette") || "").trim().toLowerCase();
    setPalette(value === "default" ? "" : value, true);
    return true;
  }

  const motionBtn = source.closest("[data-settings-motion]");
  if (motionBtn) {
    const value = String(motionBtn.getAttribute("data-settings-motion") || "").trim();
    setThemeMotion(value !== "off", true);
    return true;
  }

  const copilotBtn = source.closest("[data-settings-copilot]");
  if (copilotBtn) {
    const value = String(copilotBtn.getAttribute("data-settings-copilot") || "").trim();
    setCopilotVisibility(value);
    return true;
  }

  const companionBtn = source.closest("[data-settings-companion]");
  if (companionBtn) {
    const value = String(companionBtn.getAttribute("data-settings-companion") || "").trim();
    setCompanionEnabled(value === "on");
    return true;
  }

  const companionResetBtn = source.closest("[data-settings-companion-reset]");
  if (companionResetBtn) {
    resetCompanionPosition();
    return true;
  }

  const companionVariantBtn = source.closest("[data-settings-companion-variant]");
  if (companionVariantBtn) {
    const value = String(companionVariantBtn.getAttribute("data-settings-companion-variant") || "").trim();
    setCompanionVariant(value);
    return true;
  }

  const tabBtn = source.closest("[data-settings-tab]");
  if (tabBtn) {
    const nextTab = String(tabBtn.getAttribute("data-settings-tab") || "general");
    if (typeof onTabChange === "function") onTabChange(nextTab);
    return true;
  }

  return false;
};

const bindSettingsSurface = (root, options = {}) => {
  const scope = root && typeof root.addEventListener === "function" ? root : null;
  if (!scope) return;
  const boundMarker = scope instanceof HTMLElement ? scope : document.documentElement;
  if (boundMarker && boundMarker.dataset.settingsBound === "true") return;
  if (boundMarker) boundMarker.dataset.settingsBound = "true";
  scope.addEventListener("click", (event) => {
    const handled = applySettingsAction(event.target, options);
    if (!handled && options.closeOnBackdropClick && event.target === scope && typeof options.onClose === "function") {
      options.onClose();
      return;
    }
    if (handled && typeof options.onAfterAction === "function") options.onAfterAction();
  });
};

const createSettingsStateSync = (root, options = {}) => () => syncSettingsSurfaceState(root, options);

window.LudwigSettingsRuntime = {
  getState: getSettingsSurfaceState,
  syncState: syncSettingsSurfaceState,
  bindScrollControls: bindSettingsScrollControls,
  bindSurface: bindSettingsSurface,
  createStateSync: createSettingsStateSync,
};

window.LudwigCopilotSettings = {
  getState: getSavedCopilotState,
  getVisibility: getSavedCopilotVisibility,
  setVisibility: (value) => setCopilotVisibility(value),
};

const syncSettingsModalState = () => {
  const modalEl = document.getElementById(SETTINGS_MODAL_ID);
  if (!modalEl) return;
  syncSettingsSurfaceState(modalEl, { activeTab: settingsModalTab });
};

const ensureSettingsModal = () => {
  let modalEl = document.getElementById(SETTINGS_MODAL_ID);
  if (!modalEl) {
    const text = getSettingsI18n();
    modalEl = document.createElement("div");
    modalEl.className = "modal fade";
    modalEl.id = SETTINGS_MODAL_ID;
    modalEl.tabIndex = -1;
    modalEl.setAttribute("aria-hidden", "true");
    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-lg settings-modal-dialog">
        <div class="modal-content garden-modal settings-modal-shell">
          <div class="modal-header border-0">
            <h2 class="modal-title h4 mb-0" data-settings-modal-title>${text.title}</h2>
            <button type="button" class="btn-close" data-settings-modal-close data-bs-dismiss="modal" aria-label="${text.close}"></button>
          </div>
          <div class="modal-body pt-0" data-settings-modal-body></div>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);

    bindSettingsSurface(modalEl, {
      closeOnBackdropClick: true,
      onClose: () => {
        if (window.bootstrap && typeof window.bootstrap.Modal === "function") {
          window.bootstrap.Modal.getOrCreateInstance(modalEl).hide();
        } else {
          hideSettingsModalFallback();
        }
      },
      onTabChange: (nextTab) => {
        settingsModalTab = nextTab === "style" ? "style" : "general";
      },
      onAfterAction: syncSettingsModalState,
    });
  }

  const titleEl = modalEl.querySelector("[data-settings-modal-title]");
  const bodyEl = modalEl.querySelector("[data-settings-modal-body]");
  const closeEl = modalEl.querySelector("[data-settings-modal-close]");
  const text = getSettingsI18n();
  if (titleEl) titleEl.textContent = text.title;
  if (bodyEl) bodyEl.innerHTML = renderSettingsModalBody();
  if (bodyEl) syncCipherHintElements(bodyEl);
  if (closeEl) closeEl.setAttribute("aria-label", text.close);
  if (bodyEl) bindSettingsScrollControls(bodyEl);
  syncSettingsModalState();
  return modalEl;
};

const openSettingsModal = (tab = "general") => {
  settingsModalTab = tab === "style" ? "style" : "general";
  const modalEl = ensureSettingsModal();
  if (window.bootstrap && typeof window.bootstrap.Modal === "function") {
    window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
  } else {
    showSettingsModalFallback(modalEl);
  }
};

window.LudwigSettings = {
  open: openSettingsModal,
};

window.addEventListener("ludwig-language-changed", () => {
  syncCipherHintElements(document);
  syncSettingsModalState();
});

window.addEventListener("ludwig-cipher-mode-changed", () => {
  syncCipherHintElements(document);
  syncSettingsModalState();
});

syncCipherHintElements(document);

document.querySelectorAll('a[href$="settings.html"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    openSettingsModal("general");
  });
});

window.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const modalEl = document.getElementById(SETTINGS_MODAL_ID);
  if (!modalEl || !modalEl.classList.contains("show")) return;
  if (window.bootstrap && typeof window.bootstrap.Modal === "function") {
    window.bootstrap.Modal.getOrCreateInstance(modalEl).hide();
  } else {
    hideSettingsModalFallback();
  }
});

window.addEventListener("ludwig-language-changed", () => {
  const modalEl = document.getElementById(SETTINGS_MODAL_ID);
  if (!modalEl) return;
  ensureSettingsModal();
});
window.addEventListener("ludwig-theme-changed", syncSettingsModalState);
window.addEventListener("ludwig-palette-changed", syncSettingsModalState);
window.addEventListener("ludwig-theme-motion-changed", syncSettingsModalState);
window.addEventListener("ludwig-copilot-changed", syncSettingsModalState);
window.addEventListener("ludwig-cipher-mode-changed", syncSettingsModalState);
window.addEventListener("ludwig-companion-changed", syncSettingsModalState);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const order = ["dark", "light", "deep-sea", "galaxy", "sky", "garden"];
    const cur = getCurrentTheme();
    const idx = order.indexOf(cur);
    const next = order[(idx + 1 + order.length) % order.length];
    setTheme(next, true);
  });
}

