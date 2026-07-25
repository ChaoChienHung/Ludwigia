if (window.AOS && typeof window.AOS.init === 'function') {
  window.AOS.init({
    duration: 900,
    offset: 80,
  });
}

const navbar = document.querySelector('.custom-nav');

if (navbar) {
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const current = window.scrollY;

    if (current > lastScrollY && current > 80) {
      navbar.classList.add('show');
    } else if (current < lastScrollY) {
      navbar.classList.remove('show');
    }

    lastScrollY = current;
  });
}

// Dropdown parent link clickable on desktop
document.querySelectorAll('.dropdown-toggle').forEach(function(dropdown) {
  dropdown.addEventListener('click', function() {
    if (window.innerWidth >= 992) {
      const href = String(this.getAttribute('href') || '');
      if (!href || href === '#') return;
      window.location.href = this.href;
    }
  });
});

const themeToggle = document.getElementById("theme-toggle");

const LANG_KEY = "site_lang_v1";
const langLinks = document.querySelectorAll("[data-lang]");
const normalizeLang = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "en";
  const lowered = raw.toLowerCase();
  if (lowered === "zh-hans" || lowered === "zh-cn" || lowered === "zh-sg") return "zh-Hans";
  if (lowered === "zh-hant" || lowered === "zh-tw" || lowered === "zh-hk" || lowered === "zh-mo") return "zh-Hant";
  if (lowered.startsWith("zh")) return "zh-Hant";
  if (lowered === "en-us" || lowered === "en-gb") return "en";
  return raw;
};
const getLanguageLabel = (lang) => {
  const normalized = normalizeLang(lang);
  if (normalized === "zh-Hant") return "中文";
  if (normalized === "zh-Hans") return "简体中文";
  if (normalized === "en") return "English";
  return normalized;
};
const getSavedLang = () => {
  try {
    return normalizeLang(localStorage.getItem(LANG_KEY));
  } catch (e) {}
  return normalizeLang(document.documentElement.getAttribute("lang") || "en");
};
const setLanguage = (value, persist = true) => {
  const lang = normalizeLang(value);
  if (persist) {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (err) {}
  }
  try {
    document.documentElement.setAttribute("lang", lang);
  } catch (err) {}
  try {
    window.dispatchEvent(new CustomEvent("ludwig-language-changed", { detail: { lang } }));
  } catch (e) {}
  return lang;
};
setLanguage(getSavedLang(), false);
window.LudwigLanguage = {
  getCurrentLang: () => normalizeLang(document.documentElement.getAttribute("lang") || getSavedLang()),
  getSavedLang,
  setLanguage,
  normalizeLang,
  getLanguageLabel,
};
langLinks.forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const lang = String(a.getAttribute("data-lang") || "").trim();
    if (!lang) return;
    setLanguage(lang, true);
  });
});

const CIPHER_MODE_KEY = "ludwig_cipher_mode_v1";
const CIPHER_TRIGGER = "ludwig";
const CIPHER_INPUT_MAX = CIPHER_TRIGGER.length;

const isCipherModeRouteAllowed = () => {
  const path = String(window.location.pathname || "").toLowerCase();
  return !/(^|\/)garden(\/|$)/.test(path);
};

const isCipherEditableTarget = (target) => {
  if (!(target instanceof Element)) return false;
  if (target.closest("input, textarea, select")) return true;
  const editable = target.closest("[contenteditable=''], [contenteditable='true'], [contenteditable='plaintext-only']");
  return Boolean(editable);
};

const getSavedCipherMode = () => {
  try {
    return sessionStorage.getItem(CIPHER_MODE_KEY) === "1";
  } catch (e) {}
  return false;
};

const getCipherModeI18n = () => {
  const lang = window.LudwigLanguage.getCurrentLang();
  if (lang === "zh-Hans") {
    return {
      name: "暗语模式",
      on: "暗语模式已启用",
      off: "已返回正版语气",
      hintLabel: "暗语提示",
      hintTitle: "暗语模式",
      hintBody: "试着用键盘输入一个你已经很熟悉的名字。",
      hintStatusOn: "当前：已开启",
      hintStatusOff: "当前：未开启",
    };
  }
  if (lang === "zh-Hant") {
    return {
      name: "暗語模式",
      on: "暗語模式已啟用",
      off: "已返回正版語氣",
      hintLabel: "暗語提示",
      hintTitle: "暗語模式",
      hintBody: "試著用鍵盤輸入一個你已經很熟悉的名字。",
      hintStatusOn: "目前：已開啟",
      hintStatusOff: "目前：未開啟",
    };
  }
  return {
    name: "Cipher Mode",
    on: "Cipher mode enabled",
    off: "Returned to the default voice",
    hintLabel: "Cipher hint",
    hintTitle: "Cipher Mode",
    hintBody: "Try typing a name you already know by heart.",
    hintStatusOn: "Current: Enabled",
    hintStatusOff: "Current: Off",
  };
};

const showCipherModeToast = (message) => {
  if (!message) return;
  let toast = document.getElementById("cipher-mode-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "cipher-mode-toast";
    toast.className = "cipher-mode-toast";
    toast.innerHTML = `
      <div class="cipher-mode-toast__icon"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
      <div class="cipher-mode-toast__content">
        <div class="cipher-mode-toast__eyebrow"></div>
        <div class="cipher-mode-toast__message"></div>
      </div>
    `;
    document.body.appendChild(toast);
  }
  const text = getCipherModeI18n();
  const eyebrow = toast.querySelector(".cipher-mode-toast__eyebrow");
  const content = toast.querySelector(".cipher-mode-toast__message");
  if (eyebrow) eyebrow.textContent = text.name;
  if (content) content.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showCipherModeToast._timer);
  showCipherModeToast._timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
};

const setCipherMode = (enabled, options = {}) => {
  const { persist = true, notify = true } = options;
  const on = Boolean(enabled) && isCipherModeRouteAllowed();
  document.documentElement.classList.toggle("cipher-mode", on);
  document.body.classList.toggle("cipher-mode", on);
  if (persist) {
    try {
      sessionStorage.setItem(CIPHER_MODE_KEY, on ? "1" : "0");
    } catch (e) {}
  }
  if (notify) {
    const text = getCipherModeI18n();
    showCipherModeToast(on ? text.on : text.off);
  }
  try {
    window.dispatchEvent(new CustomEvent("ludwig-cipher-mode-changed", { detail: { enabled: on } }));
  } catch (e) {}
  return on;
};

setCipherMode(getSavedCipherMode(), { persist: false, notify: false });

window.LudwigCipherMode = {
  isEnabled: () => document.documentElement.classList.contains("cipher-mode"),
  isRouteAllowed: isCipherModeRouteAllowed,
  setEnabled: setCipherMode,
  toggle: (options = {}) => setCipherMode(!document.documentElement.classList.contains("cipher-mode"), options),
};

const COMPANION_KEY = "site_companion_v1";
const COMPANION_FEATURE_ENABLED = false;
const COPILOT_VISIBILITY_KEY = "site_copilot_visibility_v1";
const COPILOT_AVATAR_VENDOR_VERSION = "2026-06-21-4";
const COPILOT_BASE_SCRIPT_VERSION = "2026-06-21-3";
const COPILOT_SCRIPT_VERSION = "2026-06-21-6";
const COMPANION_SCRIPT_VERSION = "2026-06-21-4";
let copilotBaseLoaderPromise = null;
let copilotLoaderPromise = null;
let companionLoaderPromise = null;

const getSavedCompanionPrefs = () => {
  try {
    const raw = localStorage.getItem(COMPANION_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === "object") return parsed;
  } catch (e) {}
  return {};
};

const setSavedCompanionPrefs = (next) => {
  try {
    localStorage.setItem(COMPANION_KEY, JSON.stringify(next && typeof next === "object" ? next : {}));
  } catch (e) {}
};

const normalizeCopilotVisibility = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "off") return "off";
  if (normalized === "home") return "home";
  if (normalized === "all") return "all";
  return "all";
};

const getSavedCopilotVisibility = () => {
  try {
    return normalizeCopilotVisibility(localStorage.getItem(COPILOT_VISIBILITY_KEY));
  } catch (e) {
    return "all";
  }
};

const setSavedCopilotVisibility = (value) => {
  const normalized = normalizeCopilotVisibility(value);
  try {
    localStorage.setItem(COPILOT_VISIBILITY_KEY, normalized);
  } catch (e) {}
  return normalized;
};

const getSavedCopilotState = () => ({
  visibility: getSavedCopilotVisibility(),
});

const dispatchCopilotStateChange = () => {
  const state = getSavedCopilotState();
  try {
    window.dispatchEvent(new CustomEvent("ludwig-copilot-changed", { detail: state }));
  } catch (e) {}
  return state;
};

const setCopilotVisibility = (value, { persist = true } = {}) => {
  const normalized = normalizeCopilotVisibility(value);
  if (persist) setSavedCopilotVisibility(normalized);
  return dispatchCopilotStateChange();
};

if (!COMPANION_FEATURE_ENABLED) {
  const prefs = getSavedCompanionPrefs();
  if (prefs.enabled === true) {
    setSavedCompanionPrefs({ ...prefs, enabled: false });
  }
}

const isCompanionRouteSupported = () => {
  const path = String(window.location.pathname || "").toLowerCase();
  return !/(^|\/)(garden|labs|future)(\/|$)/.test(path);
};

const isCompanionViewportSupported = () => {
  if (typeof window.matchMedia === "function") {
    return !window.matchMedia("(max-width: 991.98px)").matches;
  }
  return window.innerWidth > 991;
};

const getSavedCompanionState = () => {
  const prefs = getSavedCompanionPrefs();
  return {
    enabled: COMPANION_FEATURE_ENABLED && prefs.enabled === true,
    variant: typeof prefs.variant === "string" && prefs.variant.trim() ? prefs.variant.trim() : "companion-placeholder",
    supported: COMPANION_FEATURE_ENABLED && isCompanionRouteSupported() && isCompanionViewportSupported(),
  };
};

const dispatchCompanionStateChange = () => {
  const state = getSavedCompanionState();
  try {
    window.dispatchEvent(new CustomEvent("ludwig-companion-changed", { detail: state }));
  } catch (e) {}
  return state;
};

const loadRuntimeScript = (src, { globalName = "" } = {}) => new Promise((resolve, reject) => {
  if (globalName && window[globalName]) {
    resolve(window[globalName]);
    return;
  }

  const existing = document.querySelector(`script[data-runtime-src="${src}"]`);
  if (existing) {
    existing.addEventListener("load", () => resolve(globalName ? window[globalName] || null : null), { once: true });
    existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
    return;
  }

  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  script.dataset.runtimeSrc = src;
  script.onload = () => resolve(globalName ? window[globalName] || null : null);
  script.onerror = () => reject(new Error(`Failed to load ${src}`));
  document.body.appendChild(script);
});

const loadCopilotBaseRuntime = () => {
  if (window.LudwigCopilotBase) return Promise.resolve(window.LudwigCopilotBase);
  if (copilotBaseLoaderPromise) return copilotBaseLoaderPromise;
  copilotBaseLoaderPromise = loadRuntimeScript(
    resolveProjectPath(`assets/vendor/avatar/dicebear-pixel-art-neutral-ludwig.js?v=${COPILOT_AVATAR_VENDOR_VERSION}`),
    { globalName: "LudwigAvatarVendor" }
  )
    .then(() => loadRuntimeScript(
      resolveProjectPath(`assets/js/copilot-base.js?v=${COPILOT_BASE_SCRIPT_VERSION}`),
      { globalName: "LudwigCopilotBase" }
    ))
    .catch((error) => {
      copilotBaseLoaderPromise = null;
      throw error;
    });
  return copilotBaseLoaderPromise;
};

const initCopilot = () => {
  if (window.LudwigCopilot) return Promise.resolve(window.LudwigCopilot);
  if (copilotLoaderPromise) return copilotLoaderPromise;
  copilotLoaderPromise = loadCopilotBaseRuntime()
    .then(() => loadRuntimeScript(
      resolveProjectPath(`assets/js/copilot.js?v=${COPILOT_SCRIPT_VERSION}`),
      { globalName: "LudwigCopilot" }
    ))
    .catch((error) => {
      copilotLoaderPromise = null;
      throw error;
    });
  return copilotLoaderPromise;
};

const loadCompanionRuntime = () => {
  if (window.LudwigCompanion) return Promise.resolve(window.LudwigCompanion);
  if (companionLoaderPromise) return companionLoaderPromise;
  companionLoaderPromise = loadCopilotBaseRuntime()
    .then(() => loadRuntimeScript(
      resolveProjectPath(`assets/js/companion.js?v=${COMPANION_SCRIPT_VERSION}`),
      { globalName: "LudwigCompanion" }
    ))
    .catch((error) => {
      companionLoaderPromise = null;
      throw error;
    });
  return companionLoaderPromise;
};

const setCompanionEnabled = (enabled) => {
  if (!COMPANION_FEATURE_ENABLED) {
    const prefs = { ...getSavedCompanionPrefs(), enabled: false };
    setSavedCompanionPrefs(prefs);
    if (window.LudwigCompanion && typeof window.LudwigCompanion.setEnabled === "function") {
      window.LudwigCompanion.setEnabled(false);
    }
    dispatchCompanionStateChange();
    return;
  }
  const prefs = { ...getSavedCompanionPrefs(), enabled: Boolean(enabled) };
  setSavedCompanionPrefs(prefs);

  if (!enabled) {
    if (window.LudwigCompanion && typeof window.LudwigCompanion.setEnabled === "function") {
      window.LudwigCompanion.setEnabled(false);
    } else {
      dispatchCompanionStateChange();
    }
    return;
  }

  const state = getSavedCompanionState();
  if (!state.supported) {
    dispatchCompanionStateChange();
    return;
  }

  loadCompanionRuntime()
    .then((api) => {
      if (api && typeof api.setEnabled === "function") {
        api.setEnabled(true);
        return;
      }
      dispatchCompanionStateChange();
    })
    .catch((error) => {
      if (window.location.protocol === "file:" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        console.debug("[Companion] runtime load skipped", error);
      }
      dispatchCompanionStateChange();
    });
};

const resetCompanionPosition = () => {
  if (!COMPANION_FEATURE_ENABLED) {
    dispatchCompanionStateChange();
    return;
  }
  const prefs = { ...getSavedCompanionPrefs() };
  delete prefs.position;
  setSavedCompanionPrefs(prefs);
  if (window.LudwigCompanion && typeof window.LudwigCompanion.resetPosition === "function") {
    window.LudwigCompanion.resetPosition();
  } else {
    dispatchCompanionStateChange();
  }
};

const setCompanionVariant = (variant) => {
  if (!COMPANION_FEATURE_ENABLED) {
    dispatchCompanionStateChange();
    return;
  }
  const next = String(variant || "").trim() || "companion-placeholder";
  const prefs = { ...getSavedCompanionPrefs(), variant: next };
  setSavedCompanionPrefs(prefs);
  if (window.LudwigCompanion && typeof window.LudwigCompanion.setVariant === "function") {
    window.LudwigCompanion.setVariant(next);
  } else {
    dispatchCompanionStateChange();
  }
};

const initCompanion = () => {
  if (!COMPANION_FEATURE_ENABLED) {
    if (window.LudwigCompanion && typeof window.LudwigCompanion.setEnabled === "function") {
      window.LudwigCompanion.setEnabled(false);
    }
    dispatchCompanionStateChange();
    return;
  }
  const state = getSavedCompanionState();
  if (!state.enabled || !state.supported) {
    dispatchCompanionStateChange();
    return;
  }

  loadCompanionRuntime()
    .then((api) => {
      if (api && typeof api.syncFromStorage === "function") {
        api.syncFromStorage();
        return;
      }
      if (api && typeof api.setEnabled === "function") {
        api.setEnabled(true);
        return;
      }
      dispatchCompanionStateChange();
    })
    .catch((error) => {
      if (window.location.protocol === "file:" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        console.debug("[Companion] init skipped", error);
      }
      dispatchCompanionStateChange();
    });
};

window.LudwigCompanionSettings = {
  getState: getSavedCompanionState,
  setEnabled: setCompanionEnabled,
  setVariant: setCompanionVariant,
  resetPosition: resetCompanionPosition,
};

let cipherInputBuffer = "";
window.addEventListener("keydown", (event) => {
  if (!isCipherModeRouteAllowed()) return;
  if (event.defaultPrevented || event.isComposing) return;
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (isCipherEditableTarget(event.target)) return;
  const key = String(event.key || "");
  if (key.length !== 1 || !/[a-z]/i.test(key)) return;
  cipherInputBuffer = `${cipherInputBuffer}${key.toLowerCase()}`.slice(-CIPHER_INPUT_MAX);
  if (cipherInputBuffer === CIPHER_TRIGGER) {
    cipherInputBuffer = "";
    window.LudwigCipherMode.toggle({ persist: true, notify: true });
  }
});

const THEME_KEY = "theme";
const THEME_LABELS = {
  dark: "Dark",
  light: "Light",
  "deep-sea": "Deep Sea",
  galaxy: "Galaxy",
  sky: "Sky",
  garden: "Garden",
};
const THEME_CLASSES = ["light-theme", "deep-sea-theme", "galaxy-night-theme", "galaxy-theme", "sky-theme", "garden-theme"];
const getSavedTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch (e) {}
  return null;
};

const PALETTE_KEY = "site_palette_v1";
const PALETTE_CLASSES = ["palette-ember", "palette-cedar", "palette-abyss", "palette-nebula", "palette-galaxy", "palette-sky", "palette-garden", "palette-grove", "palette-red", "palette-yellow", "palette-ash"];
const MOTION_KEY = "site_theme_motion_v1";
const getSavedMotion = () => {
  try {
    return String(localStorage.getItem(MOTION_KEY) || "").trim().toLowerCase();
  } catch (e) {}
  return "";
};
const shouldEnableThemeMotion = () => {
  const saved = getSavedMotion();
  if (saved === "on") return true;
  if (saved === "off") return false;
  try {
    if (typeof window.matchMedia === "function") {
      return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
  } catch (e) {}
  return true;
};
const setThemeMotion = (isOn, persist = true) => {
  const on = Boolean(isOn);
  document.documentElement.classList.toggle("theme-motion-off", !on);
  document.body.classList.toggle("theme-motion-off", !on);
  if (persist) {
    try {
      localStorage.setItem(MOTION_KEY, on ? "on" : "off");
    } catch (e) {}
  }
  try {
    window.dispatchEvent(new CustomEvent("ludwig-theme-motion-changed", { detail: { enabled: on } }));
  } catch (e) {}
};
const setPalette = (value, persist = true) => {
  PALETTE_CLASSES.forEach((c) => document.documentElement.classList.remove(c));
  PALETTE_CLASSES.forEach((c) => document.body.classList.remove(c));
  const v = String(value || "").trim().toLowerCase();
  if (v === "ember") {
    document.documentElement.classList.add("palette-ember");
    document.body.classList.add("palette-ember");
  }
  if (v === "cedar") {
    document.documentElement.classList.add("palette-cedar");
    document.body.classList.add("palette-cedar");
  }
  if (v === "abyss") {
    document.documentElement.classList.add("palette-abyss");
    document.body.classList.add("palette-abyss");
  }
  if (v === "nebula") {
    document.documentElement.classList.add("palette-nebula");
    document.body.classList.add("palette-nebula");
  }
  if (v === "galaxy") {
    document.documentElement.classList.add("palette-galaxy");
    document.body.classList.add("palette-galaxy");
  }
  if (v === "sky") {
    document.documentElement.classList.add("palette-sky");
    document.body.classList.add("palette-sky");
  }
  if (v === "garden") {
    document.documentElement.classList.add("palette-garden");
    document.body.classList.add("palette-garden");
  }
  if (v === "grove") {
    document.documentElement.classList.add("palette-grove");
    document.body.classList.add("palette-grove");
  }
  if (v === "red") {
    document.documentElement.classList.add("palette-red");
    document.body.classList.add("palette-red");
  }
  if (v === "yellow") {
    document.documentElement.classList.add("palette-yellow");
    document.body.classList.add("palette-yellow");
  }
  if (v === "ash") {
    document.documentElement.classList.add("palette-ash");
    document.body.classList.add("palette-ash");
  }
  if (persist) {
    try {
      localStorage.setItem(PALETTE_KEY, v);
    } catch (e) {}
  }
  try {
    window.dispatchEvent(new CustomEvent("ludwig-palette-changed", { detail: { palette: v } }));
  } catch (e) {}
};
const getSavedPalette = () => {
  try {
    return localStorage.getItem(PALETTE_KEY);
  } catch (e) {}
  return null;
};

const setTheme = (value, persist = true) => {
  const raw = String(value || "").trim().toLowerCase();
  const v = raw === "galaxy-night" ? "deep-sea" : raw;
  const isLight = v === "light";
  const isDeepSea = v === "deep-sea";
  const isGalaxy = v === "galaxy";
  const isSky = v === "sky";
  const isGarden = v === "garden";

  THEME_CLASSES.forEach((cls) => {
    document.documentElement.classList.remove(cls);
    document.body.classList.remove(cls);
  });
  if (isLight) {
    document.documentElement.classList.add("light-theme");
    document.body.classList.add("light-theme");
  }
  if (isDeepSea) {
    document.documentElement.classList.add("deep-sea-theme");
    document.body.classList.add("deep-sea-theme");
    document.documentElement.classList.add("galaxy-night-theme");
    document.body.classList.add("galaxy-night-theme");
  }
  if (isGalaxy) {
    document.documentElement.classList.add("galaxy-theme");
    document.body.classList.add("galaxy-theme");
  }
  if (isSky) {
    document.documentElement.classList.add("sky-theme");
    document.body.classList.add("sky-theme");
  }
  if (isGarden) {
    document.documentElement.classList.add("garden-theme");
    document.body.classList.add("garden-theme");
  }

  try {
    document.documentElement.style.colorScheme = isLight || isSky ? "light" : "dark";
  } catch (e) {}

  const label = THEME_LABELS[v] || THEME_LABELS.dark;
  if (themeToggle) themeToggle.textContent = `Theme: ${label}`;

  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, (THEME_LABELS[v] ? v : "dark"));
    } catch (e) {}
  }

  try {
    window.dispatchEvent(new CustomEvent("ludwig-theme-changed", { detail: { theme: v } }));
  } catch (e) {}
};

const initialTheme = getSavedTheme()
  || (document.documentElement.classList.contains("light-theme")
    ? "light"
    : (document.documentElement.classList.contains("deep-sea-theme") || document.documentElement.classList.contains("galaxy-night-theme")
      ? "deep-sea"
      : (document.documentElement.classList.contains("galaxy-theme")
        ? "galaxy"
        : (document.documentElement.classList.contains("sky-theme")
          ? "sky"
          : (document.documentElement.classList.contains("garden-theme") ? "garden" : "dark")))));
setTheme(initialTheme, false);
setPalette(getSavedPalette(), false);
setThemeMotion(shouldEnableThemeMotion(), false);

const getCurrentTheme = () => {
  if (document.documentElement.classList.contains("garden-theme")) return "garden";
  if (document.documentElement.classList.contains("sky-theme")) return "sky";
  if (document.documentElement.classList.contains("galaxy-theme")) return "galaxy";
  if (document.documentElement.classList.contains("deep-sea-theme") || document.documentElement.classList.contains("galaxy-night-theme")) return "deep-sea";
  if (document.documentElement.classList.contains("light-theme")) return "light";
  return "dark";
};

window.LudwigTheme = {
  setTheme,
  setPalette,
  setThemeMotion,
  getCurrentTheme,
  getSavedTheme,
  getSavedPalette,
  isThemeMotionEnabled: () => !document.body.classList.contains("theme-motion-off"),
};

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
            <div class="d-flex gap-2 flex-wrap">
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
            <div class="d-flex gap-2 flex-wrap">
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
            <div class="d-flex gap-2 flex-wrap">
              <button type="button" class="settings-pill settings-pill--status" data-settings-motion="on">${text.motionOn}</button>
              <button type="button" class="settings-pill settings-pill--status" data-settings-motion="off">${text.motionOff}</button>
            </div>
          </div>
          <div class="project-card mt-3">
            <h3 class="mb-3">${text.copilot}</h3>
            <div class="d-flex gap-2 flex-wrap">
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

const READING_KEY = "reading_mode_v1";
const readingToggleId = "reading-toggle";
const readingIconId = "reading-icon";
const currentPathname = String(window.location.pathname || "");
const isNotesPage = (
  (/\/notes\/.+/i.test(currentPathname) || /\/writing\/.+/i.test(currentPathname))
  && !/\/(?:notes|writing)\/index\.html$/i.test(currentPathname)
);
const RECENT_KEY = "garden_recent_v1";
const CLICKS_KEY = "garden_clicks_v1";

const canUseReadingMode = () => {
  return Boolean(isNotesPage && document.body && document.body.classList.contains("note-page"));
};

const isReadingModeActive = () => {
  return Boolean(canUseReadingMode() && document.body.classList.contains("reading-mode"));
};

if (!canUseReadingMode() && document.body) {
  document.body.classList.remove("reading-mode");
}

const getStorageMap = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === "object") return parsed;
  } catch (e) {}
  return {};
};

const setStorageMap = (key, map) => {
  try {
    localStorage.setItem(key, JSON.stringify(map));
  } catch (e) {}
};

const getContentRoot = () => {
  const path = window.location.pathname || "";
  const idxNotes = path.indexOf("/notes/");
  if (idxNotes >= 0) return "notes";
  const idxWriting = path.indexOf("/writing/");
  if (idxWriting >= 0) return "writing";
  return "";
};

const getContentSubpath = () => {
  const root = getContentRoot();
  if (!root) return "";
  const path = window.location.pathname || "";
  const token = `/${root}/`;
  const idx = path.indexOf(token);
  if (idx < 0) return "";
  return path.slice(idx + token.length).replace(/^\/+/, "");
};

const getCurrentDocKey = () => {
  const root = getContentRoot();
  const sub = getContentSubpath();
  return root && sub ? `../${root}/${sub}` : "";
};

const resolveProjectPath = (rel) => {
  const path = window.location.pathname || "";
  const cleaned = String(rel || "").replace(/^\/+/, "");

  const idxNotes = path.indexOf("/notes/");
  const idxPages = path.indexOf("/pages/");
  const idxGarden = path.indexOf("/garden/");
  const idxWriting = path.indexOf("/writing/");
  const idxCanvas = path.indexOf("/canvas/");
  const idxTag = path.indexOf("/tag/");
  const idxLabs = path.indexOf("/labs/");
  const idxFuture = path.indexOf("/future/");

  let root = "";
  if (idxNotes >= 0) root = path.slice(0, idxNotes + 1);
  else if (idxPages >= 0) root = path.slice(0, idxPages + 1);
  else if (idxGarden >= 0) root = path.slice(0, idxGarden + 1);
  else if (idxWriting >= 0) root = path.slice(0, idxWriting + 1);
  else if (idxCanvas >= 0) root = path.slice(0, idxCanvas + 1);
  else if (idxTag >= 0) root = path.slice(0, idxTag + 1);
  else if (idxLabs >= 0) root = path.slice(0, idxLabs + 1);
  else if (idxFuture >= 0) root = path.slice(0, idxFuture + 1);
  else root = path.slice(0, path.lastIndexOf("/") + 1);

  if (window.location.protocol === "file:") return `file://${root}${cleaned}`;
  return `${root}${cleaned}`;
};

const buildTagDetailHref = (tagValue, extras = new URLSearchParams(), conceptId = "") => {
  const target = resolveProjectPath("tag/index.html");
  const params = new URLSearchParams();
  const tag = String(tagValue || "").trim();
  const concept = String(conceptId || "").trim();
  if (concept) params.set("concept", concept);
  if (tag) params.set("tag", tag);
  extras.forEach((value, key) => {
    if (key === "tag" || key === "concept") return;
    params.set(key, value);
  });
  const query = params.toString();
  return query ? `${target}?${query}` : target;
};

const repairLegacyTagLinks = (root = document) => {
  if (!root || typeof root.querySelectorAll !== "function") return;
  root.querySelectorAll('a[href*="garden/tag.html"]').forEach((link) => {
    const rawHref = String(link.getAttribute("href") || "");
    if (!rawHref.includes("garden/tag.html")) return;
    try {
      const url = new URL(rawHref, window.location.href);
      const repaired = buildTagDetailHref(url.searchParams.get("tag"), url.searchParams);
      if (repaired) link.setAttribute("href", repaired);
    } catch (e) {}
  });
};

const initTagDetailRouteRepair = () => {
  repairLegacyTagLinks(document);
  const noteTags = document.getElementById("note-tags");
  if (noteTags && typeof MutationObserver === "function") {
    const observer = new MutationObserver(() => repairLegacyTagLinks(noteTags));
    observer.observe(noteTags, { childList: true, subtree: true });
  }
  window.setTimeout(() => repairLegacyTagLinks(document), 0);
};

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

  bottomNav.appendChild(makeNavLink("Portfolio", "fa-regular fa-folder-open", resolveProjectPath("pages/portfolio.html"), isPortfolioPage()));
  bottomNav.appendChild(makeNavLink("Search", "fa-solid fa-magnifying-glass", resolveProjectPath("pages/search.html"), isSearchPage()));
  bottomNav.appendChild(makeNavLink("More", "fa-solid fa-ellipsis", resolveProjectPath("pages/more.html"), isMorePage()));
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

  const gardenLink = makeLink(resolveProjectPath("garden/index.html"), "", "fa-solid fa-seedling fa-fw");
  gardenLink.dataset.fabLabelKey = "garden";
  panel.appendChild(gardenLink);
  const labsLink = makeLink(resolveProjectPath("labs/index.html"), "", "fa-solid fa-flask fa-fw");
  labsLink.dataset.fabLabelKey = "labs";
  panel.appendChild(labsLink);

  const updateLabels = () => {
    const labels = getContentUiI18n();
    btn.setAttribute("aria-label", labels.fabOpenMenu);
    const mapping = {
      metadata: labels.fabMetadata,
      outline: labels.fabOutline,
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

const initSkyGardenAmbience = () => {
  let defs = null;
  let skyLayer = null;
  let gardenLayer = null;
  const SKY_LAYER_ID = "sky-clouds";
  const GARDEN_LAYER_ID = "garden-ambient";
  const SKY_FILTER_IDS = {
    back: "sky-cloud-filter-back",
    mid: "sky-cloud-filter-mid",
    front: "sky-cloud-filter-front",
  };

  const ensureDefs = () => {
    if (defs && defs.parentElement) return defs;
    defs = document.getElementById("theme-svg-defs");
    if (defs) return defs;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("id", "theme-svg-defs");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.setAttribute("aria-hidden", "true");
    svg.style.position = "absolute";
    svg.style.width = "0";
    svg.style.height = "0";
    svg.style.overflow = "hidden";
    svg.innerHTML = `
      <defs>
        <filter id="${SKY_FILTER_IDS.back}" x="-120%" y="-120%" width="340%" height="340%">
          <feTurbulence type="fractalNoise" baseFrequency="0.0068" numOctaves="5" seed="18" result="cloudNoiseBack" />
          <feDisplacementMap in="SourceGraphic" in2="cloudNoiseBack" scale="132" xChannelSelector="R" yChannelSelector="G" result="cloudWarpBack" />
          <feGaussianBlur in="cloudWarpBack" stdDeviation="1.4" result="cloudSoftBack" />
          <feBlend in="SourceGraphic" in2="cloudSoftBack" mode="screen" />
        </filter>
        <filter id="${SKY_FILTER_IDS.mid}" x="-120%" y="-120%" width="340%" height="340%">
          <feTurbulence type="fractalNoise" baseFrequency="0.0078" numOctaves="4" seed="24" result="cloudNoiseMid" />
          <feDisplacementMap in="SourceGraphic" in2="cloudNoiseMid" scale="102" xChannelSelector="R" yChannelSelector="G" result="cloudWarpMid" />
          <feGaussianBlur in="cloudWarpMid" stdDeviation="1.05" result="cloudSoftMid" />
          <feBlend in="SourceGraphic" in2="cloudSoftMid" mode="screen" />
        </filter>
        <filter id="${SKY_FILTER_IDS.front}" x="-120%" y="-120%" width="340%" height="340%">
          <feTurbulence type="fractalNoise" baseFrequency="0.0092" numOctaves="3" seed="31" result="cloudNoiseFront" />
          <feDisplacementMap in="SourceGraphic" in2="cloudNoiseFront" scale="78" xChannelSelector="R" yChannelSelector="G" result="cloudWarpFront" />
          <feGaussianBlur in="cloudWarpFront" stdDeviation="0.75" result="cloudSoftFront" />
          <feBlend in="SourceGraphic" in2="cloudSoftFront" mode="screen" />
        </filter>
      </defs>
    `;
    document.body.appendChild(svg);
    defs = svg;
    return defs;
  };

  const ensureSkyLayer = () => {
    if (skyLayer && skyLayer.parentElement) return skyLayer;
    skyLayer = document.getElementById(SKY_LAYER_ID);
    if (skyLayer) return skyLayer;
    const container = document.createElement("div");
    container.id = SKY_LAYER_ID;
    container.className = "sky-clouds";
    const cloudPresets = [
      { reverse: false, width: 760, height: 236, top: 9, dur: 188, rise: -7, scale: 1.04, opacity: 0.92, delay: -24, srcWidthRatio: 0.84, srcHeightRatio: 0.68 },
      { reverse: true, width: 520, height: 254, top: 19, dur: 214, rise: -10, scale: 0.96, opacity: 0.84, delay: -116, srcWidthRatio: 0.62, srcHeightRatio: 0.9 },
      { reverse: false, width: 880, height: 278, top: 31, dur: 236, rise: -8, scale: 1.14, opacity: 0.8, delay: -72, srcWidthRatio: 0.88, srcHeightRatio: 0.7 },
      { reverse: true, width: 430, height: 212, top: 45, dur: 202, rise: -6, scale: 0.88, opacity: 0.76, delay: -148, srcWidthRatio: 0.58, srcHeightRatio: 0.84 },
      { reverse: false, width: 610, height: 170, top: 58, dur: 248, rise: -5, scale: 0.82, opacity: 0.7, delay: -196, srcWidthRatio: 0.9, srcHeightRatio: 0.58 },
      { reverse: true, width: 700, height: 304, top: 67, dur: 226, rise: -9, scale: 1.08, opacity: 0.68, delay: -38, srcWidthRatio: 0.74, srcHeightRatio: 0.92 },
    ];
    cloudPresets.forEach((preset, i) => {
      const cloud = document.createElement("div");
      cloud.className = `sky-cloud${preset.reverse ? " sky-cloud--reverse" : ""}`;
      cloud.style.setProperty("--cloud-seed", `${i + 1}`);
      cloud.style.top = `${preset.top}vh`;
      cloud.style.setProperty("--cloud-width", `${preset.width}px`);
      cloud.style.setProperty("--cloud-height", `${preset.height}px`);
      cloud.style.setProperty("--cloud-src-width-ratio", `${preset.srcWidthRatio || 0.7}`);
      cloud.style.setProperty("--cloud-src-height-ratio", `${preset.srcHeightRatio || 0.78}`);
      cloud.style.setProperty("--cloud-dur", `${preset.dur}s`);
      cloud.style.setProperty("--cloud-rise", `${preset.rise}px`);
      cloud.style.setProperty("--cloud-scale", `${preset.scale}`);
      cloud.style.opacity = `${preset.opacity}`;
      cloud.style.animationDelay = `${preset.delay}s`;
      ["back", "mid", "front"].forEach((layerName) => {
        const layer = document.createElement("span");
        layer.className = `sky-cloud__layer sky-cloud__layer--${layerName}`;
        cloud.appendChild(layer);
      });
      container.appendChild(cloud);
    });
    document.body.appendChild(container);
    skyLayer = container;
    return skyLayer;
  };

  const ensureGardenLayer = () => {
    if (gardenLayer && gardenLayer.parentElement) return gardenLayer;
    gardenLayer = document.getElementById(GARDEN_LAYER_ID);
    if (gardenLayer) return gardenLayer;

    const container = document.createElement("div");
    container.id = GARDEN_LAYER_ID;
    container.className = "garden-ambient";

    const blooms = [
      { cls: "garden-ambient__bloom garden-ambient__bloom--canopy", style: { left: "-12vw", top: "-10vh", width: "50vw", height: "34vh" } },
      { cls: "garden-ambient__bloom garden-ambient__bloom--mist", style: { right: "-14vw", top: "2vh", width: "40vw", height: "30vh" } },
      { cls: "garden-ambient__bloom garden-ambient__bloom--floor", style: { left: "14vw", bottom: "-14vh", width: "60vw", height: "38vh" } },
    ];
    blooms.forEach(({ cls, style }) => {
      const bloom = document.createElement("span");
      bloom.className = cls;
      Object.entries(style).forEach(([key, value]) => {
        bloom.style[key] = value;
      });
      container.appendChild(bloom);
    });

    const beams = [
      { left: "17%", top: "-10vh", width: "10.5vw", height: "88vh", rotate: "-33deg", opacity: "0.22", blur: "17px", dur: "20s", delay: "-8s" },
      { left: "30%", top: "-9vh", width: "6vw", height: "96vh", rotate: "-23deg", opacity: "0.42", blur: "15px", dur: "18s", delay: "-3s", primary: true },
      { left: "49%", top: "-10vh", width: "6vw", height: "94vh", rotate: "-8deg", opacity: "0.5", blur: "16px", dur: "22s", delay: "-12s", primary: true },
      { left: "70%", top: "-9vh", width: "6vw", height: "92vh", rotate: "11deg", opacity: "0.38", blur: "15px", dur: "19s", delay: "-5s", primary: true },
      { left: "84%", top: "-8vh", width: "10vw", height: "84vh", rotate: "23deg", opacity: "0.2", blur: "17px", dur: "24s", delay: "-15s" },
      { left: "7%", top: "-8vh", width: "13vw", height: "92vh", rotate: "-43deg", opacity: "0.16", blur: "22px", dur: "28s", delay: "-17s", shadow: true },
    ];
    beams.forEach((preset) => {
      const beam = document.createElement("span");
      beam.className = `garden-ambient__beam${preset.primary ? " garden-ambient__beam--primary" : ""}${preset.shadow ? " garden-ambient__beam--shadow" : ""}`;
      beam.style.left = preset.left;
      beam.style.top = preset.top;
      beam.style.width = preset.width;
      beam.style.height = preset.height;
      beam.style.setProperty("--garden-beam-rotate", preset.rotate);
      beam.style.setProperty("--garden-beam-opacity", preset.opacity);
      beam.style.setProperty("--garden-beam-blur", preset.blur);
      beam.style.setProperty("--garden-beam-dur", preset.dur);
      beam.style.setProperty("--garden-beam-delay", preset.delay);
      container.appendChild(beam);
    });

    const spotlight = document.createElement("span");
    spotlight.className = "garden-ambient__spotlight";
    container.appendChild(spotlight);

    const leaves = [
      { left: "-3vw", top: "12vh", width: "18vw", height: "24vh", rotate: "-26deg", delay: "-6s", alpha: "0.18" },
      { right: "-2vw", top: "22vh", width: "14vw", height: "21vh", rotate: "24deg", delay: "-14s", alpha: "0.16" },
      { left: "4vw", bottom: "6vh", width: "16vw", height: "20vh", rotate: "-18deg", delay: "-10s", alpha: "0.16" },
      { right: "6vw", bottom: "10vh", width: "13vw", height: "18vh", rotate: "16deg", delay: "-18s", alpha: "0.14" },
    ];
    leaves.forEach((preset) => {
      const leaf = document.createElement("span");
      leaf.className = "garden-ambient__leaf";
      if (preset.left) leaf.style.left = preset.left;
      if (preset.right) leaf.style.right = preset.right;
      if (preset.top) leaf.style.top = preset.top;
      if (preset.bottom) leaf.style.bottom = preset.bottom;
      leaf.style.width = preset.width;
      leaf.style.height = preset.height;
      leaf.style.setProperty("--garden-leaf-rotate", preset.rotate);
      leaf.style.setProperty("--garden-leaf-delay", preset.delay);
      leaf.style.setProperty("--garden-leaf-alpha", preset.alpha);
      container.appendChild(leaf);
    });

    const flowerClusters = [
      {
        side: "left",
        left: "-2vw",
        bottom: "-2vh",
        scale: "0.82",
        opacity: "0.42",
        branches: [
          { left: "2vw", bottom: "1vh", width: "5vw", height: "28vh", rotate: "-6deg", delay: "-4s", alpha: "0.52", kind: "trunk" },
          { left: "4vw", bottom: "8vh", width: "8vw", height: "12px", rotate: "-58deg", delay: "-9s", alpha: "0.42" },
          { left: "4vw", bottom: "10vh", width: "12vw", height: "10px", rotate: "-28deg", delay: "-6s", alpha: "0.34" },
          { left: "5vw", bottom: "9vh", width: "15vw", height: "9px", rotate: "-12deg", delay: "-12s", alpha: "0.3" },
        ],
        flowers: [
          { left: "2vw", bottom: "0vh", size: "116px", delay: "-5.2s", tilt: "-12deg" },
          { left: "10vw", bottom: "6vh", size: "92px", delay: "-9.5s", tilt: "10deg" },
        ],
      },
      {
        side: "right",
        right: "-1vw",
        bottom: "-1vh",
        scale: "0.8",
        opacity: "0.4",
        branches: [
          { right: "2vw", bottom: "1vh", width: "5vw", height: "27vh", rotate: "6deg", delay: "-5s", alpha: "0.5", kind: "trunk" },
          { right: "4vw", bottom: "8vh", width: "8vw", height: "12px", rotate: "58deg", delay: "-10s", alpha: "0.4" },
          { right: "4vw", bottom: "10vh", width: "12vw", height: "10px", rotate: "28deg", delay: "-7s", alpha: "0.32" },
          { right: "5vw", bottom: "9vh", width: "15vw", height: "9px", rotate: "12deg", delay: "-13s", alpha: "0.28" },
        ],
        flowers: [
          { right: "1vw", bottom: "1vh", size: "108px", delay: "-7.8s", tilt: "12deg" },
          { right: "10vw", bottom: "7vh", size: "90px", delay: "-11.6s", tilt: "-9deg" },
        ],
      },
    ];
    const flowerPalettes = [
      "garden-ambient__flower--ivory",
      "garden-ambient__flower--spring",
      "garden-ambient__flower--golden",
      "garden-ambient__flower--ruby",
      "garden-ambient__flower--sky",
    ];
    flowerClusters.forEach((clusterPreset) => {
      const cluster = document.createElement("div");
      cluster.className = `garden-ambient__cluster garden-ambient__cluster--${clusterPreset.side}`;
      if (clusterPreset.left) cluster.style.left = clusterPreset.left;
      if (clusterPreset.right) cluster.style.right = clusterPreset.right;
      cluster.style.bottom = clusterPreset.bottom;
      cluster.style.setProperty("--garden-cluster-scale", clusterPreset.scale);

      clusterPreset.flowers.forEach((flowerPreset, flowerIndex) => {
        const flower = document.createElement("div");
        const paletteClass = flowerPalettes[(flowerIndex + (clusterPreset.side === "right" ? 1 : 0)) % flowerPalettes.length];
        flower.className = `garden-ambient__flower ${paletteClass}`;
        if (flowerPreset.left) flower.style.left = flowerPreset.left;
        if (flowerPreset.right) flower.style.right = flowerPreset.right;
        flower.style.bottom = flowerPreset.bottom;
        flower.style.width = flowerPreset.size;
        flower.style.height = flowerPreset.size;
        flower.style.setProperty("--garden-flower-delay", flowerPreset.delay);
        flower.style.setProperty("--garden-flower-tilt", flowerPreset.tilt);
        flower.style.setProperty("--garden-flower-index", `${flowerIndex}`);
        flower.style.setProperty("--garden-flower-opacity", clusterPreset.opacity);
        const flowerSize = parseInt(flowerPreset.size, 10);
        const curveDirection = clusterPreset.side === "left" ? -1 : 1;
        const stemCurve = curveDirection * (16 + flowerIndex * 6);

        const stem = document.createElement("span");
        stem.className = "garden-ambient__flower-stem";
        stem.style.setProperty("--garden-flower-stem-length", `${Math.round(flowerSize * 1.16)}px`);
        stem.style.setProperty("--garden-flower-stem-width", `${Math.max(12, Math.round(flowerSize * 0.12))}px`);
        stem.style.setProperty("--garden-flower-stem-curve", `${stemCurve}deg`);
        stem.style.setProperty("--garden-flower-stem-delay", flowerPreset.delay);
        stem.style.setProperty("--garden-flower-stem-alpha", "1");
        flower.appendChild(stem);

        const stemBranchA = document.createElement("span");
        stemBranchA.className = "garden-ambient__flower-stem-branch";
        stemBranchA.style.setProperty("--garden-flower-branch-top", `${58 + flowerIndex * 8}%`);
        stemBranchA.style.setProperty("--garden-flower-branch-length", `${Math.round(flowerSize * 0.44)}px`);
        stemBranchA.style.setProperty("--garden-flower-branch-rotate", `${curveDirection * -38}deg`);
        stemBranchA.style.setProperty("--garden-flower-branch-alpha", `${0.28 - flowerIndex * 0.03}`);
        flower.appendChild(stemBranchA);

        const stemBranchB = document.createElement("span");
        stemBranchB.className = "garden-ambient__flower-stem-branch garden-ambient__flower-stem-branch--secondary";
        stemBranchB.style.setProperty("--garden-flower-branch-top", `${72 + flowerIndex * 5}%`);
        stemBranchB.style.setProperty("--garden-flower-branch-length", `${Math.round(flowerSize * 0.34)}px`);
        stemBranchB.style.setProperty("--garden-flower-branch-rotate", `${curveDirection * 30}deg`);
        stemBranchB.style.setProperty("--garden-flower-branch-alpha", `${0.22 - flowerIndex * 0.025}`);
        flower.appendChild(stemBranchB);

        const center = document.createElement("span");
        center.className = "garden-ambient__flower-center";
        flower.appendChild(center);

        for (let petalIndex = 0; petalIndex < 6; petalIndex += 1) {
          const petal = document.createElement("span");
          petal.className = "garden-ambient__flower-petal";
          petal.style.setProperty("--garden-flower-petal-rot", `${petalIndex * 60}deg`);
          flower.appendChild(petal);
        }

        cluster.appendChild(flower);
      });

      container.appendChild(cluster);
    });

    const petalRainPresets = [
      { left: "3%", top: "-6%", size: "18px", dur: "15s", delay: "-2s", driftX: "38px", rotateFrom: "-18deg", rotateTo: "120deg", alpha: "0.24" },
      { left: "12%", top: "-2%", size: "16px", dur: "16s", delay: "-11s", driftX: "28px", rotateFrom: "-10deg", rotateTo: "144deg", alpha: "0.22" },
      { left: "24%", top: "-8%", size: "17px", dur: "14s", delay: "-6s", driftX: "34px", rotateFrom: "-22deg", rotateTo: "136deg", alpha: "0.25" },
      { left: "38%", top: "-3%", size: "15px", dur: "17s", delay: "-14s", driftX: "22px", rotateFrom: "-12deg", rotateTo: "152deg", alpha: "0.2" },
      { right: "3%", top: "-4%", size: "18px", dur: "15s", delay: "-3s", driftX: "-40px", rotateFrom: "18deg", rotateTo: "-126deg", alpha: "0.24" },
      { right: "12%", top: "0%", size: "16px", dur: "16s", delay: "-12s", driftX: "-32px", rotateFrom: "10deg", rotateTo: "-146deg", alpha: "0.22" },
      { right: "24%", top: "-7%", size: "17px", dur: "14s", delay: "-8s", driftX: "-36px", rotateFrom: "22deg", rotateTo: "-132deg", alpha: "0.25" },
      { right: "38%", top: "-1%", size: "15px", dur: "17s", delay: "-15s", driftX: "-24px", rotateFrom: "12deg", rotateTo: "-154deg", alpha: "0.2" },
    ];
    const petalRainPalettes = [
      "garden-ambient__petal-rain--ivory",
      "garden-ambient__petal-rain--spring",
      "garden-ambient__petal-rain--golden",
      "garden-ambient__petal-rain--ruby",
      "garden-ambient__petal-rain--sky",
    ];
    petalRainPresets.forEach((preset) => {
      const petal = document.createElement("span");
      const paletteIndex = (preset.left ? 0 : 1) + (parseInt(String(preset.size), 10) % petalRainPalettes.length);
      petal.className = `garden-ambient__petal-rain ${petalRainPalettes[paletteIndex % petalRainPalettes.length]}`;
      if (preset.left) petal.style.left = preset.left;
      if (preset.right) petal.style.right = preset.right;
      petal.style.top = preset.top;
      petal.style.width = preset.size;
      petal.style.height = `calc(${preset.size} * 1.55)`;
      petal.style.setProperty("--garden-petal-dur", preset.dur);
      petal.style.setProperty("--garden-petal-delay", preset.delay);
      petal.style.setProperty("--garden-petal-drift-x", preset.driftX);
      petal.style.setProperty("--garden-petal-rot-from", preset.rotateFrom);
      petal.style.setProperty("--garden-petal-rot-to", preset.rotateTo);
      petal.style.setProperty("--garden-petal-alpha", preset.alpha);
      container.appendChild(petal);
    });

    document.body.appendChild(container);
    gardenLayer = container;
    return gardenLayer;
  };

  const apply = (theme) => {
    const t = String(theme || "").trim().toLowerCase();
    const motionOff = document.body.classList.contains("theme-motion-off");
    const readingMode = isReadingModeActive();
    const showSky = t === "sky" && !motionOff && !readingMode;
    const showGarden = t === "garden" && !motionOff && !readingMode;

    document.body.classList.toggle("sky-clouds-on", showSky);
    document.body.classList.toggle("garden-ambient-on", showGarden);

    if (showSky) {
      ensureDefs();
      const layer = ensureSkyLayer();
      layer.hidden = false;
    } else if (skyLayer) {
      skyLayer.hidden = true;
    }

    if (showGarden) {
      const layer = ensureGardenLayer();
      layer.hidden = false;
    } else if (gardenLayer) {
      gardenLayer.hidden = true;
    }
  };

  apply(getCurrentTheme());
  window.addEventListener("ludwig-theme-changed", (e) => apply(e && e.detail ? e.detail.theme : ""));
  window.addEventListener("ludwig-theme-motion-changed", () => apply(getCurrentTheme()));
  window.addEventListener("ludwig-reading-mode-changed", () => apply(getCurrentTheme()));
};

initSkyGardenAmbience();

const initMeteorShower = () => {
  if (document.getElementById("meteor-shower")) return;

  const container = document.createElement("div");
  container.id = "meteor-shower";
  container.className = "meteor-shower";

  const starfield = document.createElement("div");
  starfield.id = "starfield";
  starfield.className = "starfield";

  const starsOnlyClass = "galaxy-stars-only-on";

  let intervalId = null;

  const buildStars = () => {
    if (starfield.childElementCount) return;
    const count = 70;
    for (let i = 0; i < count; i += 1) {
      const s = document.createElement("div");
      s.className = "star";
      const size = 1 + Math.random() * 2.4;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const dur = 1400 + Math.random() * 2600;
      const delay = Math.random() * 2200;
      const alpha = 0.55 + Math.random() * 0.4;
      s.style.left = `${left}%`;
      s.style.top = `${top}%`;
      s.style.width = `${size}px`;
      s.style.height = `${size}px`;
      s.style.setProperty("--twinkle-dur", `${dur}ms`);
      s.style.setProperty("--twinkle-delay", `${delay}ms`);
      s.style.setProperty("--star-alpha", `${alpha}`);
      starfield.appendChild(s);
    }
  };

  const startStars = () => {
    buildStars();
    if (!document.body.contains(starfield)) document.body.appendChild(starfield);
  };

  const stopStars = () => {
    if (starfield.parentElement) starfield.remove();
  };

  const spawnMeteor = () => {
    const m = document.createElement("div");
    m.className = "meteor";
    const left = 20 + Math.random() * 100;
    const top = -20 + Math.random() * 70;
    const dur = 1500 + Math.random() * 1400;
    const len = 320 + Math.random() * 280;
    const thickness = 2.4 + Math.random() * 1.2;
    m.style.left = `${left}%`;
    m.style.top = `${top}%`;
    m.style.setProperty("--meteor-dur", `${dur}ms`);
    m.style.setProperty("--meteor-len", `${len}px`);
    m.style.setProperty("--meteor-thickness", `${thickness}px`);
    m.style.setProperty("--meteor-dx", `-920px`);
    m.style.setProperty("--meteor-dy", `920px`);
    container.appendChild(m);
    window.setTimeout(() => m.remove(), dur + 80);
  };

  const startMeteors = () => {
    if (intervalId) return;
    startStars();
    if (!document.body.contains(container)) document.body.appendChild(container);
    document.body.classList.add("galaxy-meteors-on");

    spawnMeteor();
    spawnMeteor();
    intervalId = window.setInterval(() => {
      if (document.hidden) return;
      spawnMeteor();
      if (Math.random() < 0.35) spawnMeteor();
    }, 560);
  };

  const stopMeteors = () => {
    if (intervalId) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
    if (container.parentElement) container.remove();
    document.body.classList.remove("galaxy-meteors-on");
  };

  const apply = (theme) => {
    const t = String(theme || "").trim().toLowerCase();
    const motionOff = document.body.classList.contains("theme-motion-off");
    const readingMode = isReadingModeActive();
    if (t === "galaxy" && !motionOff && !readingMode) {
      const path = String(window.location.pathname || "");
      const isNotesDetail = /\/notes\//.test(path) && !path.endsWith("/index.html");
      const isWritingDetail = /\/writing\//.test(path) && !path.endsWith("/index.html");
      const isCanvasDetail = /\/canvas\//.test(path) && !path.endsWith("/index.html");

      document.body.classList.remove(starsOnlyClass);
      if (isNotesDetail || isWritingDetail || isCanvasDetail) {
        stopMeteors();
        startStars();
        document.body.classList.add(starsOnlyClass);
      } else {
        startMeteors();
      }
    } else {
      stopMeteors();
      stopStars();
      document.body.classList.remove(starsOnlyClass);
    }
  };

  apply(getCurrentTheme());
  window.addEventListener("ludwig-theme-changed", (e) => apply(e && e.detail ? e.detail.theme : ""));
  window.addEventListener("ludwig-theme-motion-changed", () => apply(getCurrentTheme()));
  document.addEventListener("visibilitychange", () => apply(getCurrentTheme()));
  window.addEventListener("ludwig-reading-mode-changed", () => apply(getCurrentTheme()));
};

initMeteorShower();

const initDeepSeaBubbles = () => {
  const containerId = "deep-sea-bubbles";
  let container = null;
  let active = false;
  let timerId = null;
  let rafId = null;

  const prefersReducedMotion = () => {
    try {
      return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {}
    return false;
  };

  const ensureContainer = () => {
    if (container && document.getElementById(containerId) === container) return container;
    const existing = document.getElementById(containerId);
    if (existing) {
      container = existing;
      return container;
    }
    container = document.createElement("div");
    container.id = containerId;
    container.className = "deep-sea-bubbles";
    document.body.appendChild(container);
    return container;
  };

  const stop = () => {
    active = false;
    if (timerId) {
      window.clearTimeout(timerId);
      timerId = null;
    }
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
    const el = document.getElementById(containerId);
    if (el) el.remove();
  };

  const spawn = () => {
    if (!active) return;
    if (document.hidden) return;
    if (isReadingModeActive()) return;

    const host = ensureContainer();
    const b = document.createElement("div");
    b.className = "deep-sea-bubble";

    const size = 8 + Math.random() * 22;
    const left = Math.random() * 100;
    const alpha = 0.38 + Math.random() * 0.28;
    const drift = -26 + Math.random() * 52;
    const wobble = 6 + Math.random() * 16;
    const rot = 3 + Math.random() * 6;
    const rotSign = Math.random() < 0.5 ? -1 : 1;
    const durBase = prefersReducedMotion() ? 17000 : 10000;
    const dur = durBase + Math.random() * (prefersReducedMotion() ? 12000 : 9000);

    b.style.left = `${left}%`;
    b.style.setProperty("--bubble-size", `${size}px`);
    b.style.setProperty("--bubble-alpha", `${alpha}`);
    b.style.setProperty("--bubble-drift", `${drift}px`);
    b.style.setProperty("--bubble-w1", `${-wobble}px`);
    b.style.setProperty("--bubble-w2", `${wobble}px`);
    b.style.setProperty("--bubble-w3", `${-(wobble * 0.6)}px`);
    b.style.setProperty("--bubble-r1", `${rotSign * -rot}deg`);
    b.style.setProperty("--bubble-r2", `${rotSign * rot}deg`);
    b.style.setProperty("--bubble-r3", `${rotSign * -(rot * 0.6)}deg`);
    b.style.setProperty("--bubble-dur", `${dur}ms`);
    b.style.setProperty("--bubble-blur", `${(Math.random() * 0.7).toFixed(2)}px`);

    b.addEventListener("animationend", () => b.remove());
    host.appendChild(b);
  };

  const loop = () => {
    if (!active) return;
    spawn();
    const gapBase = prefersReducedMotion() ? 1200 : 500;
    const gap = gapBase + Math.random() * (prefersReducedMotion() ? 1600 : 900);
    timerId = window.setTimeout(() => {
      rafId = window.requestAnimationFrame(loop);
    }, gap);
  };

  const start = () => {
    if (active) return;
    active = true;
    ensureContainer();
    loop();
  };

  const apply = (theme) => {
    const t = String(theme || "").trim().toLowerCase();
    const isDeepSea = t === "deep-sea" || t === "galaxy-night";
    const motionOff = document.body.classList.contains("theme-motion-off");
    if (!isDeepSea || motionOff || isReadingModeActive()) stop();
    else start();
  };

  apply(getCurrentTheme());
  window.addEventListener("ludwig-theme-changed", (e) => apply(e && e.detail ? e.detail.theme : ""));
  window.addEventListener("ludwig-theme-motion-changed", () => apply(getCurrentTheme()));
  document.addEventListener("visibilitychange", () => apply(getCurrentTheme()));
  window.addEventListener("ludwig-reading-mode-changed", () => apply(getCurrentTheme()));
};

initDeepSeaBubbles();

const initDeepSeaFish = () => {
  const containerId = "deep-sea-fish";
  let container = null;
  let active = false;

  const prefersReducedMotion = () => {
    try {
      return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {}
    return false;
  };

  const ensureContainer = () => {
    if (container && document.getElementById(containerId) === container) return container;
    const existing = document.getElementById(containerId);
    if (existing) {
      container = existing;
      return container;
    }
    container = document.createElement("div");
    container.id = containerId;
    container.className = "deep-sea-fish";
    container.setAttribute("aria-hidden", "true");
    document.body.appendChild(container);
    return container;
  };

  const buildFishSvg = (variant) => {
    const bodyOpacity = variant === 2 ? "0.78" : "0.74";
    const finOpacity = variant === 2 ? "0.68" : "0.64";
    return `<svg viewBox="0 0 240 99" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path class="fin-tail" d="M228.47 36.1471C230.769 31.1344 232.184 25.7614 232.651 20.266C232.702 19.7482 232.632 19.2257 232.448 18.7392C232.264 18.2528 231.969 17.8156 231.588 17.4619C231.206 17.1082 230.748 16.8475 230.249 16.7003C229.75 16.5531 229.224 16.5234 228.712 16.6133C218.014 18.5493 195.915 30.1123 189.397 48.6705C191.26 51.5175 193.582 54.0349 196.27 56.1196C208.208 67.9926 227.472 72.515 236.802 72.0007C237.312 71.9671 237.809 71.8185 238.254 71.566C238.699 71.3135 239.081 70.9636 239.372 70.5425C239.663 70.1214 239.855 69.64 239.933 69.1343C240.012 68.6286 239.975 68.1116 239.826 67.622C236.734 57.564 233.951 52.5501 230.836 49.7066C229.046 47.9958 227.85 45.7563 227.424 43.3162C226.998 40.876 227.365 38.3636 228.47 36.1471V36.1471Z" fill="currentColor" opacity="${finOpacity}"/>
  <path class="fin-back-bottom" d="M178.495 60.1602C173.483 62.4289 165.242 65.7942 155.391 69.1065C156.409 70.2731 157.28 71.5609 157.984 72.9407C158.243 73.479 158.655 73.9285 159.169 74.2327C159.683 74.5369 160.276 74.682 160.872 74.6498C167.868 74.1668 174.896 74.5248 181.807 75.7161C182.434 75.8351 183.082 75.753 183.659 75.4813C184.236 75.2097 184.712 74.7624 185.02 74.2036L186.971 70.6115C187.188 70.2134 187.313 69.7716 187.337 69.3187C187.36 68.8658 187.282 68.4133 187.107 67.9948L184.839 62.5423C184.635 62.0552 184.307 61.63 183.888 61.3089C183.469 60.9879 182.973 60.7822 182.45 60.7122L178.495 60.1602Z" fill="currentColor" opacity="${finOpacity}"/>
  <path class="fin-back-top" d="M171.593 37.4432L145.887 26.8557L163.942 23.7249C165.967 23.3753 168.043 23.4645 170.031 23.9864C172.019 24.5082 173.871 25.4506 175.464 26.7498L182.639 32.6107C182.861 32.7914 183.027 33.0314 183.118 33.3027C183.209 33.5741 183.221 33.8656 183.153 34.1436C183.085 34.4216 182.939 34.6745 182.733 34.873C182.527 35.0715 182.269 35.2075 181.989 35.2652L171.593 37.4432Z" fill="currentColor" opacity="${finOpacity}"/>
  <path class="fin-dorsel" d="M93.6292 15.8725C107.45 15.8725 121.943 18.6403 135.265 22.3459C135.605 21.6953 135.845 20.9966 135.975 20.2738C137.367 12.4996 125.391 3.84063 109.158 0.936655C104.071 -0.00705102 98.8777 -0.236105 93.7275 0.256062L80.542 16.2204C84.3827 16.0011 88.6695 15.8725 93.6292 15.8725Z" fill="currentColor" opacity="${finOpacity}"/>
  <path class="bod" d="M208.026 46.4122C207.716 43.4401 202.114 35.3256 198.455 36.7852C192.958 38.9783 192.013 43.4931 185.148 40.9218C176.832 37.8137 132.558 15.875 93.6666 15.875C50.8818 15.875 55.1686 24.9878 36.0482 28.2245C15.0603 31.7713 8.11974 43.2208 8.11974 43.2208C5.44332 47.0474 4.46803 50.1707 8.97407 50.4505L22.3788 51.6757L1.59503 53.3167C1.17423 53.4417 0.800822 53.6907 0.52349 54.031C0.246157 54.3714 0.0777661 54.7874 0.0402305 55.2249C0.00269499 55.6624 0.0977673 56.101 0.313066 56.4837C0.528365 56.8664 0.853904 57.1752 1.24726 57.3702C10.0703 61.9076 19.5663 66.672 30.7936 70.6271C42.777 71.0809 55.1459 67.708 62.782 57.9827C65.156 54.8519 68.6565 49.4523 66.5623 45.6106C64.0219 41.3378 59.5083 38.464 55.4937 35.3029C52.6283 33.0796 49.5209 30.947 47.1772 28.1262C53.7624 31.5671 60.65 33.8736 66.4867 38.8119C68.0833 40.1108 69.4395 41.6798 70.4937 43.4477C72.8828 47.2894 71.4615 52.3033 69.4655 55.8955C62.8652 67.9954 49.4454 73.2891 36.396 72.4875C51.9479 77.3274 70.7886 80.5415 95.3677 79.9517C129.458 81.7969 177.391 61.3707 183.251 57.8466C189.11 54.3225 199.196 59.412 202.152 59.9187C208.185 61.0001 208.457 50.5035 208.026 46.4122Z" fill="currentColor" opacity="${bodyOpacity}"/>
  <path class="eye" d="M32.268 42.4575C35.0364 42.4575 37.2806 40.2127 37.2806 37.4436C37.2806 34.6745 35.0364 32.4297 32.268 32.4297C29.4996 32.4297 27.2554 34.6745 27.2554 37.4436C27.2554 40.2127 29.4996 42.4575 32.268 42.4575Z" fill="currentColor" opacity="${finOpacity}"/>
  <path class="fin-front-bottom" d="M111.721 84.494L101.235 78.6558C98.0912 76.9025 94.638 75.7751 91.0658 75.3359L76.9504 73.6041C76.8167 73.5919 76.6827 73.6245 76.5696 73.6968C76.4564 73.7691 76.3706 73.8771 76.3256 74.0036C76.2805 74.1301 76.2789 74.268 76.3208 74.3955C76.3627 74.5231 76.4459 74.6331 76.5572 74.7082L88.5633 82.558L96.532 94.1588L111.6 98.9307C111.838 99.0052 112.09 99.0198 112.334 98.9734C112.579 98.927 112.808 98.8209 113.002 98.6645C113.196 98.5082 113.348 98.3064 113.445 98.0771C113.542 97.8478 113.581 97.5981 113.558 97.3501L112.507 85.6813C112.484 85.434 112.4 85.1964 112.263 84.9893C112.125 84.7822 111.939 84.6121 111.721 84.494Z" fill="currentColor" opacity="${finOpacity}"/>
  <path class="fin-front-top" d="M110.776 39.9819C107.456 38.8133 103.837 38.8133 100.516 39.9819L79.2563 47.4007C80.2023 48.0611 80.9822 48.9322 81.5346 49.9452C82.0869 50.9583 82.3966 52.0858 82.4393 53.2389C82.4189 54.8025 81.861 56.3113 80.8592 57.5117L97.6888 59.0242C100.494 59.2719 103.307 58.6283 105.725 57.1851C108.144 55.7418 110.047 53.5723 111.162 50.9853L113.347 45.9109C113.59 45.3554 113.717 44.7557 113.718 44.1491C113.719 43.5425 113.595 42.9422 113.354 42.3857C113.113 41.8292 112.759 41.3285 112.316 40.9149C111.872 40.5013 111.348 40.1837 110.776 39.9819V39.9819Z" fill="currentColor" opacity="${finOpacity}"/>
</svg>`;
  };

  const rebuild = () => {
    const host = ensureContainer();
    host.innerHTML = "";

    const count = 6;
    for (let i = 0; i < count; i += 1) {
      const item = document.createElement("div");
      item.className = "deep-sea-fish-item";

      const motion = document.createElement("div");
      motion.className = "deep-sea-fish-motion";

      const size = 22 + Math.random() * 44;
      const top = 10 + Math.random() * 80;
      const dur = 42000 + Math.random() * 52000;
      const delay = -Math.random() * dur;
      const dir = Math.random() < 0.5 ? -1 : 1;
      const alpha = 0.10 + Math.random() * 0.12;
      const blur = (Math.random() * 0.7).toFixed(2);
      const wag = 1500 + Math.random() * 1700;
      const fin = 1300 + Math.random() * 1500;
      const variant = Math.random() < 0.5 ? 1 : 2;
      const face = dir === 1 ? -1 : 1;

      item.style.setProperty("--fish-size", `${size.toFixed(2)}px`);
      item.style.setProperty("--fish-top", `${top.toFixed(2)}`);
      item.style.setProperty("--fish-dur", `${dur.toFixed(0)}ms`);
      item.style.setProperty("--fish-delay", `${delay.toFixed(0)}ms`);
      item.style.setProperty("--fish-dir", String(dir));
      item.style.setProperty("--fish-face", String(face));
      item.style.setProperty("--fish-wag-dir", String(face));
      item.style.setProperty("--fish-drift-from", dir === 1 ? "-30vw" : "130vw");
      item.style.setProperty("--fish-drift-to", dir === 1 ? "130vw" : "-30vw");
      item.style.setProperty("--fish-alpha", `${alpha.toFixed(3)}`);
      item.style.setProperty("--fish-blur", `${blur}px`);
      item.style.setProperty("--fish-wag", `${wag.toFixed(0)}ms`);
      item.style.setProperty("--fish-fin", `${fin.toFixed(0)}ms`);

      motion.innerHTML = `<div class="deep-sea-fish-art">${buildFishSvg(variant)}</div>`;
      item.appendChild(motion);
      host.appendChild(item);
    }
  };

  const stop = () => {
    active = false;
    const el = document.getElementById(containerId);
    if (el) el.remove();
    container = null;
  };

  const start = () => {
    if (active) return;
    if (document.body.classList.contains("theme-motion-off")) return;
    if (prefersReducedMotion()) return;
    active = true;
    ensureContainer();
    rebuild();
  };

  const apply = (theme) => {
    const t = String(theme || "").trim().toLowerCase();
    const isDeepSea = t === "deep-sea" || t === "galaxy-night";
    const motionOff = document.body.classList.contains("theme-motion-off");
    if (!isDeepSea || motionOff || isReadingModeActive() || document.hidden) stop();
    else start();
  };

  apply(getCurrentTheme());
  window.addEventListener("ludwig-theme-changed", (e) => apply(e && e.detail ? e.detail.theme : ""));
  window.addEventListener("ludwig-theme-motion-changed", () => apply(getCurrentTheme()));
  document.addEventListener("visibilitychange", () => apply(getCurrentTheme()));
  window.addEventListener("ludwig-reading-mode-changed", () => apply(getCurrentTheme()));
};

initDeepSeaFish();

const markOpened = (docKey) => {
  if (!docKey) return;
  const now = Date.now();
  const recent = getStorageMap(RECENT_KEY);
  recent[docKey] = now;
  setStorageMap(RECENT_KEY, recent);

  const clicks = getStorageMap(CLICKS_KEY);
  clicks[docKey] = (Number(clicks[docKey]) || 0) + 1;
  setStorageMap(CLICKS_KEY, clicks);
};

const setReadingMode = (isOn, persist = true) => {
  const nextState = Boolean(isOn) && canUseReadingMode();
  const previousScrollY = window.scrollY || window.pageYOffset || 0;
  document.body.classList.toggle("reading-mode", nextState);
  if (persist && canUseReadingMode()) localStorage.setItem(READING_KEY, nextState ? "1" : "0");
  const labels = getContentUiI18n();
  const icon = document.getElementById(readingIconId);
  if (icon) {
    icon.classList.toggle("fa-book", !nextState);
    icon.classList.toggle("fa-book-open", nextState);
  }
  const label = document.getElementById("reading-label");
  if (label) {
    label.textContent = labels.readingModeState(nextState);
  }
  const btn = document.getElementById(readingToggleId);
  if (btn) {
    btn.setAttribute("aria-pressed", nextState ? "true" : "false");
    btn.setAttribute("aria-label", labels.toggleReadingMode);
    btn.setAttribute("title", labels.toggleReadingMode);
  }
  try {
    window.dispatchEvent(new CustomEvent("ludwig-reading-mode-changed", { detail: { isOn: nextState } }));
  } catch (e) {}
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (previousScrollY > maxScroll) {
        window.scrollTo({ top: maxScroll, behavior: "auto" });
      }
    });
  });
};

const setEstimatedReadingTime = () => {
  if (!isNotesPage) return;
  const timeEl = document.getElementById("note-reading-time");
  if (!timeEl) return;
  const textEl = timeEl.querySelector(".note-reading-time-text");
  if (!textEl) return;

  const metaMinutes = Number(document.querySelector('meta[name="garden:reading_time_minutes"]')?.getAttribute("content") || 0);
  if (metaMinutes > 0) {
    textEl.textContent = `${metaMinutes} min`;
    return;
  }

  const contentEl = document.querySelector(".note-content");
  const raw = contentEl ? String(contentEl.innerText || "") : "";
  const latinWords = (raw.match(/[A-Za-z0-9]+(?:'[A-Za-z0-9]+)?/g) || []).length;
  const cjkChars = (raw.match(/[\u4E00-\u9FFF]/g) || []).length;
  const tableCount = contentEl ? contentEl.querySelectorAll("table").length : 0;
  const preCount = contentEl ? contentEl.querySelectorAll("pre").length : 0;
  const calloutCount = contentEl ? contentEl.querySelectorAll(".note-callout, .note-block").length : 0;
  const mathCount = contentEl ? contentEl.querySelectorAll(".katex-display").length : 0;
  const denseBlockPenalty = tableCount * 0.4 + preCount * 0.5 + calloutCount * 0.2 + mathCount * 0.3;
  const minutes = Math.max(1, Math.ceil(latinWords / 170 + cjkChars / 320 + denseBlockPenalty));
  textEl.textContent = `${minutes} min`;
};

const escapeMarkdown = (text) => {
  return String(text || "").replace(/\s+/g, " ").trim();
};

const normalizeMarkdownSpacing = (text) => {
  const lines = String(text || "").replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  let blankCount = 0;
  lines.forEach((line) => {
    const trimmedRight = line.replace(/\s+$/, "");
    if (trimmedRight === "") {
      blankCount += 1;
      if (blankCount <= 1) out.push("");
      return;
    }
    blankCount = 0;
    out.push(trimmedRight);
  });
  while (out.length > 0 && out[0] === "") out.shift();
  while (out.length > 0 && out[out.length - 1] === "") out.pop();
  return out.join("\n");
};

const renderMathInElementSafely = (element = document.body) => {
  if (!element || typeof window.renderMathInElement !== "function") return;
  try {
    window.renderMathInElement(element, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
      ],
      ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
      throwOnError: false,
    });
  } catch (_) {}
};
window.LudwigContentRuntime = window.LudwigContentRuntime || {};
window.LudwigContentRuntime.renderMathInElementSafely = renderMathInElementSafely;

const extractCoreMarkdown = (sourceText) => {
  const lines = String(sourceText || "").replace(/\r\n?/g, "\n").split("\n");
  const kept = [];
  let currentTag = "";
  let inFence = false;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (/^```/.test(trimmed)) {
      if (!currentTag) kept.push(line);
      inFence = !inFence;
      return;
    }
    if (inFence) {
      if (!currentTag) kept.push(line);
      return;
    }
    if (currentTag) {
      if (trimmed === `</${currentTag}>`) currentTag = "";
      return;
    }
    const openMatch = trimmed.match(/^<([a-z][a-z0-9_-]*)>$/i);
    if (openMatch) {
      currentTag = openMatch[1].toLowerCase();
      return;
    }
    if (/^<\/[a-z][a-z0-9_-]*>$/i.test(trimmed)) return;
    kept.push(line);
  });

  return normalizeMarkdownSpacing(kept.join("\n"));
};

const domToMarkdown = (rootEl) => {
  const lines = [];
  const pushBlank = () => {
    if (lines.length === 0) return;
    if (lines[lines.length - 1] !== "") lines.push("");
  };

  const walkList = (listEl, indent = "") => {
    const isOrdered = listEl.tagName === "OL";
    let index = 1;
    Array.from(listEl.children).forEach((child) => {
      if (!(child instanceof HTMLElement) || child.tagName !== "LI") return;
      const prefix = isOrdered ? `${index}. ` : `- `;
      const itemTextParts = [];
      Array.from(child.childNodes).forEach((node) => {
        if (node instanceof HTMLElement && (node.tagName === "UL" || node.tagName === "OL")) return;
        if (node instanceof HTMLElement) itemTextParts.push(node.innerText);
        else itemTextParts.push(node.textContent || "");
      });
      const itemText = escapeMarkdown(itemTextParts.join(" "));
      lines.push(`${indent}${prefix}${itemText}`);
      const nested = child.querySelector(":scope > ul, :scope > ol");
      if (nested) walkList(nested, indent + "  ");
      index += 1;
    });
  };

  const walkBlock = (el) => {
    if (!(el instanceof HTMLElement)) return;
    if (el.getAttribute("data-md-exclude") === "1") return;
    if (el.classList.contains("note-quiz")) return;
    if (el.classList.contains("note-markdown-block")) return;

    if (el.tagName === "PRE") {
      const code = (el.innerText || "").replace(/\n$/, "");
      if (code.trim()) {
        lines.push("```");
        lines.push(code);
        lines.push("```");
        pushBlank();
      }
      return;
    }

    if (el.tagName === "H1") {
      lines.push(`# ${escapeMarkdown(el.innerText)}`);
      pushBlank();
      return;
    }
    if (el.tagName === "H2") {
      lines.push(`## ${escapeMarkdown(el.innerText)}`);
      pushBlank();
      return;
    }
    if (el.tagName === "H3") {
      lines.push(`## ${escapeMarkdown(el.innerText)}`);
      pushBlank();
      return;
    }
    if (el.tagName === "H4") {
      lines.push(`### ${escapeMarkdown(el.innerText)}`);
      pushBlank();
      return;
    }
    if (el.tagName === "H5") {
      lines.push(`#### ${escapeMarkdown(el.innerText)}`);
      pushBlank();
      return;
    }
    if (el.tagName === "P") {
      const t = escapeMarkdown(el.innerText);
      if (t) lines.push(t);
      pushBlank();
      return;
    }
    if (el.tagName === "UL" || el.tagName === "OL") {
      walkList(el);
      pushBlank();
      return;
    }
    if (el.tagName === "SECTION") {
      Array.from(el.children).forEach(walkBlock);
      return;
    }
    if (el.classList.contains("note-callout")) {
      Array.from(el.children).forEach(walkBlock);
      pushBlank();
      return;
    }

    Array.from(el.children).forEach(walkBlock);
  };

  walkBlock(rootEl);
  while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  return lines.join("\n");
};

const getNoteSourcePath = () => {
  const meta = document.querySelector('meta[name="garden:source"]');
  return String(meta?.getAttribute("content") || "").trim();
};

const getSourceMarkdown = async () => {
  const sourcePath = getNoteSourcePath();
  if (!sourcePath) return "";
  try {
    const res = await fetch(resolveProjectPath(sourcePath), { cache: "no-store" });
    if (!res.ok) return "";
    return await res.text();
  } catch (_) {
    return "";
  }
};

const getNoteMarkdown = async () => {
  const sourceText = await getSourceMarkdown();
  if (sourceText) {
    const coreMarkdown = extractCoreMarkdown(sourceText);
    if (coreMarkdown) return coreMarkdown;
  }

  const title = document.querySelector("h1")?.innerText?.trim() || document.title || "Note";
  const contentEl = document.querySelector(".note-content");
  const md = domToMarkdown(contentEl || document.body);
  return `# ${escapeMarkdown(title)}\n\n${md.replace(/^## /m, "## ")}`;
};

const syncNoteMetaStaticI18n = () => {
  if (!isNotesPage) return;
  const labels = getContentUiI18n();

  const syncSectionLabel = (selector, text) => {
    const anchor = document.querySelector(selector);
    const labelEl = anchor?.closest(".note-meta-section")?.querySelector(".note-meta-label");
    if (labelEl) labelEl.textContent = text;
  };

  syncSectionLabel("#note-reading-time", labels.estimatedReadingTime);
  syncSectionLabel(".note-date-menu-shell", labels.datesSection);
  syncSectionLabel("#note-tags", labels.tagsSection);
  syncSectionLabel("#note-copy-md", labels.markdownSection);

  const copyBtn = document.getElementById("note-copy-md");
  if (copyBtn) {
    copyBtn.setAttribute("aria-label", labels.copyMarkdown);
    copyBtn.innerHTML = `<i class="fa-regular fa-copy"></i> ${labels.copyMarkdown}`;
  }

  const downloadBtn = document.getElementById("note-download-md");
  if (downloadBtn) {
    downloadBtn.setAttribute("aria-label", labels.downloadMarkdown);
    downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i> ${labels.downloadMarkdown}`;
  }
};

const initNoteMarkdownActions = () => {
  if (!isNotesPage) return;
  const copyBtn = document.getElementById("note-copy-md");
  const downloadBtn = document.getElementById("note-download-md");
  if (!copyBtn || !downloadBtn) return;

  syncNoteMetaStaticI18n();

  const statusEl = document.getElementById("note-md-status");
  const setStatus = (text) => {
    if (!statusEl) return;
    statusEl.textContent = text;
    if (text) setTimeout(() => { if (statusEl.textContent === text) statusEl.textContent = ""; }, 1800);
  };

  copyBtn.addEventListener("click", async () => {
    try {
      const md = await getNoteMarkdown();
      await navigator.clipboard.writeText(md);
      setStatus(getContentUiI18n().copySuccess);
    } catch (e) {
      setStatus(getContentUiI18n().copyFailure);
    }
  });

  downloadBtn.addEventListener("click", async () => {
    try {
      const md = await getNoteMarkdown();
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const base = window.location.pathname.split("/").pop() || "note.html";
      const name = base.replace(/\.html$/i, ".md");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus(getContentUiI18n().downloadSuccess);
    } catch (e) {
      setStatus(getContentUiI18n().downloadFailure);
    }
  });
};

const initNoteRelated = () => {
  if (!isNotesPage) return;

  const contentEl = document.querySelector(".note-content");
  if (!contentEl) return;
  contentEl.querySelectorAll(".note-related-section[data-generated-related='1']").forEach((el) => el.remove());

  const meta = document.querySelector('meta[name="garden:tags"]');
  const raw = meta ? meta.getAttribute("content") : "";
  const tags = String(raw || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const firstTag = tags[0] || "";

  const docKey = getCurrentDocKey();
  markOpened(docKey);
  const labels = getContentUiI18n();

  const section = document.createElement("section");
  section.className = "note-related-section";
  section.setAttribute("data-md-exclude", "1");
  section.dataset.generatedRelated = "1";
  section.style.paddingTop = "28px";

  const heading = document.createElement("h3");
  heading.className = "note-related-heading";
  heading.textContent = labels.relatedHeading;

  const grid = document.createElement("div");
  grid.className = "note-related-grid";

  section.appendChild(heading);
  section.appendChild(grid);
  if (firstTag) {
    const tagHref = buildTagDetailHref(firstTag);
    const cta = document.createElement("a");
    cta.className = "note-related-cta";
    cta.href = tagHref;
    cta.textContent = labels.exploreMoreOn(firstTag);
    section.appendChild(cta);
  }

  contentEl.appendChild(section);

  const getRecency = (recentMap, key) => {
    const now = Date.now();
    const last = Number(recentMap[key]) || 0;
    if (!last) return 0;
    const ageDays = Math.max(0, (now - last) / (24 * 60 * 60 * 1000));
    return 1 / (1 + ageDays);
  };

  const rerank = (docs, baseScores, currentTags) => {
    const recent = getStorageMap(RECENT_KEY);
    const clicks = getStorageMap(CLICKS_KEY);
    const currentTagSet = new Set((currentTags || []).map((t) => String(t).toLowerCase()));

    const scoreOf = (doc) => {
      const base = Number(baseScores.get(doc.url)) || 0;
      const docTags = Array.isArray(doc.tags) ? doc.tags : [];
      let overlap = 0;
      for (const t of docTags) {
        if (currentTagSet.has(String(t).toLowerCase())) overlap += 1;
      }
      const overlapScore = overlap > 0 ? overlap / (1 + currentTagSet.size) : 0;
      const rec = getRecency(recent, doc.url);
      const click = Math.log1p(Math.max(0, Number(clicks[doc.url]) || 0));
      return base * 1.0 + overlapScore * 0.22 + rec * 0.85 + click * 0.22;
    };

    return docs
      .map((d) => ({ doc: d, score: scoreOf(d) }))
      .sort((a, b) => b.score - a.score || String(a.doc.title || "").localeCompare(String(b.doc.title || "")))
      .map((x) => x.doc);
  };

  const dedupeAndPickVariant = (docs, preferredLang) => {
    const groups = new Map();
    for (const doc of docs || []) {
      if (!doc) continue;
      const url = String(doc.url || "");
      if (!url || url === docKey) continue;
      const key = getDocCanonicalId(doc);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(doc);
    }
    return Array.from(groups.values())
      .map((bucket) => pickPreferredVariant(bucket, preferredLang))
      .filter(Boolean);
  };

  const render = (relatedDocs) => {
    grid.innerHTML = "";
    const recent = getStorageMap(RECENT_KEY);
    const clicks = getStorageMap(CLICKS_KEY);

    for (const d of relatedDocs) {
      const url = String(d.url || "");
      let href = "";
      let kind = "";
      if (url.startsWith("../notes/")) {
        kind = "note";
        href = resolveProjectPath(`notes/${url.slice("../notes/".length)}`);
      } else if (url.startsWith("../writing/")) {
        kind = "writing";
        href = resolveProjectPath(`writing/${url.slice("../writing/".length)}`);
      } else {
        href = resolveProjectPath(url.replace(/^\/+/, ""));
      }

      const a = document.createElement("a");
      a.className = "note-related-item";
      a.href = href;
      a.addEventListener("click", () => markOpened(url));

      const t = document.createElement("div");
      t.className = "note-related-item-title";
      t.textContent = String(d.title || "");

      const metaEl = document.createElement("div");
      metaEl.className = "note-related-item-meta";
      const clickCount = Math.max(0, Number(clicks[url]) || 0);
      const last = Number(recent[url]) || 0;
      const bits = [];
      const kindText = kind === "writing" ? labels.writingKind : (kind === "note" ? labels.noteKind : "");
      if (kindText) bits.push(kindText);
      if (clickCount > 0) bits.push(labels.openCount(clickCount));
      if (last > 0) {
        const days = Math.max(0, Math.round((Date.now() - last) / (24 * 60 * 60 * 1000)));
        bits.push(labels.relativeDay(days));
      }
      if (bits.length > 0) {
        if (kindText) {
          const badge = document.createElement("span");
          badge.className = `note-related-kind ${kind === "writing" ? "is-writing" : "is-note"}`;
          badge.textContent = kindText;
          metaEl.appendChild(badge);
        }
        const rest = bits.filter((b) => b !== kindText);
        if (rest.length > 0) {
          const tnode = document.createElement("span");
          tnode.textContent = (kindText ? " · " : "") + rest.join(" · ");
          metaEl.appendChild(tnode);
        }
      }

      a.appendChild(t);
      a.appendChild(metaEl);
      grid.appendChild(a);
    }
  };

  loadSiteIndex()
    .then((docs) => {
      if (!Array.isArray(docs) || docs.length === 0) return;
      const current = docs.find((d) => String(d.url || "") === docKey) || null;
      const currentTags = current && Array.isArray(current.tags) ? current.tags : tags;
      const currentLang = getDocLang(current);
      const contentDocs = docs.filter((d) => {
        const u = String((d && d.url) || "");
        return u.startsWith("../notes/") || u.startsWith("../writing/");
      });

      const baseScores = new Map();
      const rel = current && Array.isArray(current.related) ? current.related : [];
      for (const r of rel) {
        const u = r && typeof r === "object" ? String(r.url || "") : "";
        if (!u || u === docKey) continue;
        baseScores.set(u, r && typeof r === "object" ? Number(r.score) || 0 : 0);
      }
      const relatedDocs = rel
        .map((r) => {
          const u = r && typeof r === "object" ? String(r.url || "") : "";
          return docs.find((d) => String(d.url || "") === u) || null;
        })
        .filter(Boolean);
      const candidates = dedupeAndPickVariant(relatedDocs, currentLang || getCurrentSiteLang());

      let picked = candidates;
      if (picked.length === 0 && firstTag) {
        const firstLower = String(firstTag).toLowerCase();
        const fallback = contentDocs.filter((d) => {
          if (String(d.url || "") === docKey) return false;
          return Array.isArray(d.tags) && d.tags.some((t) => String(t).toLowerCase() === firstLower);
        });
        picked = dedupeAndPickVariant(fallback, currentLang || getCurrentSiteLang());
      }

      if (picked.length === 0) {
        picked = dedupeAndPickVariant(contentDocs, currentLang || getCurrentSiteLang());
      }

      picked = rerank(picked, baseScores, currentTags).slice(0, 6);
      if (picked.length > 0) render(picked);
      else section.remove();
    })
    .catch(() => {
      section.remove();
    });
};

const savedReading = isNotesPage && localStorage.getItem(READING_KEY) === "1";

const getNoteDateI18n = () => {
  const labels = getContentUiI18n();
  return {
    section: labels.datesSection,
    lastModified: labels.lastModified,
    published: labels.published,
  };
};

const ensureNoteDateSwitcher = () => {
  if (!isNotesPage) return;

  const renderDateMenu = (container, requestedMode = "") => {
    if (!container) return;

    const lastModifiedAt = String(container.dataset.lastModifiedAt || "").trim();
    const publishedAt = String(container.dataset.publishedAt || "").trim();
    const labels = getNoteDateI18n();
    const sectionLabel = container.closest(".note-meta-section")?.querySelector(".note-meta-label");
    if (sectionLabel) sectionLabel.textContent = labels.section;

    const options = [];
    if (lastModifiedAt) {
      options.push({
        mode: "last-modified",
        label: labels.lastModified,
        value: lastModifiedAt,
        icon: "fa-regular fa-pen-to-square",
      });
    }
    if (publishedAt) {
      options.push({
        mode: "published",
        label: labels.published,
        value: publishedAt,
        icon: "fa-regular fa-calendar",
      });
    }

    if (options.length === 0) {
      container.innerHTML = "";
      return;
    }

    const current = options.find((option) => option.mode === requestedMode)
      || options.find((option) => option.mode === "last-modified")
      || options[0];

    container.dataset.currentMode = current.mode;

    if (options.length === 1) {
      container.innerHTML = `
        <div class="note-meta-item">
          <i class="${current.icon}" aria-hidden="true"></i>
          <span>${current.label}: ${current.value}</span>
        </div>
      `;
      return;
    }

    const items = options.map((option) => {
      const activeClass = option.mode === current.mode ? " is-active" : "";
      const check = option.mode === current.mode ? "✓" : "";
      return `
        <button type="button" class="note-language-option${activeClass}" data-note-date-mode="${option.mode}">
          <span class="note-language-check" aria-hidden="true">${check}</span>
          <span>${option.label}: ${option.value}</span>
        </button>
      `;
    }).join("");

    container.innerHTML = `
      <details class="note-language-menu note-date-menu">
        <summary class="note-meta-action note-language-trigger">
          <span class="note-language-trigger-main">
            <i class="${current.icon}" aria-hidden="true"></i>
            <span>${current.label}: ${current.value}</span>
          </span>
          <i class="fa-solid fa-chevron-down note-language-caret" aria-hidden="true"></i>
        </summary>
        <div class="note-language-options">
          ${items}
        </div>
      </details>
    `;

    container.querySelectorAll("[data-note-date-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        renderDateMenu(container, String(btn.getAttribute("data-note-date-mode") || ""));
      });
    });
  };

  document.querySelectorAll(".note-date-menu-shell").forEach((container) => {
    renderDateMenu(container, String(container.dataset.currentMode || ""));
  });
};

const ensureLanguageSwitcher = () => {
  if (!isNotesPage) return;

  const panel = document.querySelector(".note-meta-panel");
  if (!panel) return;

  const currentDocKey = getCurrentDocKey();
  const currentDocPath = `${getContentRoot()}/${getContentSubpath()}`;
  const sectionId = "note-language-section";

  const renderVariants = (docs) => {
    const current = (Array.isArray(docs) ? docs : []).find((d) => {
      const rawUrl = String((d && d.url) || "");
      const rawPath = String((d && d.path) || "");
      return rawUrl === currentDocKey || rawPath === currentDocPath;
    }) || null;
    const canonicalId = getDocCanonicalId(current);
    const variants = canonicalId
      ? (Array.isArray(docs) ? docs : []).filter((d) => getDocCanonicalId(d) === canonicalId)
      : [];

    let section = document.getElementById(sectionId);
    if (!current || variants.length <= 1) {
      if (section) section.remove();
      return;
    }

    if (!section) {
      section = document.createElement("div");
      section.className = "note-meta-section";
      section.id = sectionId;
      panel.insertBefore(section, panel.children[1] || null);
    }

    const preferredLang = getCurrentSiteLang();
    const orderedVariants = variants.slice().sort((a, b) => {
      const exactA = getDocLang(a) === preferredLang ? 1 : 0;
      const exactB = getDocLang(b) === preferredLang ? 1 : 0;
      if (exactA !== exactB) return exactB - exactA;
      const currentA = String((a && (a.url || a.path)) || "") === String(current && (current.url || current.path));
      const currentB = String((b && (b.url || b.path)) || "") === String(current && (current.url || current.path));
      if (currentA !== currentB) return currentB - currentA;
      return getLanguageLabel(a.lang).localeCompare(getLanguageLabel(b.lang));
    });

    const currentLabel = getLanguageLabel(current.lang);
    const items = orderedVariants.map((doc) => {
      const href = resolveProjectPath(String(doc.path || "").replace(/^\/+/, ""));
      const active = String((doc && (doc.url || doc.path)) || "") === String((current && (current.url || current.path)) || "");
      const label = getLanguageLabel(doc.lang);
      if (active) {
        return `<span class="note-language-option is-active" aria-current="page"><span class="note-language-check">✓</span><span>${label}</span></span>`;
      }
      return `<a href="${href}" class="note-language-option" title="${String(doc.title || "").replace(/"/g, "&quot;")}"><span class="note-language-check" aria-hidden="true"></span><span>${label}</span></a>`;
    }).join("");

    section.innerHTML = `
      <div class="note-meta-label">${getContentUiI18n().languageSection}</div>
      <details class="note-language-menu">
        <summary class="note-meta-action note-language-trigger">
          <span class="note-language-trigger-main">
            <i class="fa-solid fa-earth-americas" aria-hidden="true"></i>
            <span>${currentLabel}</span>
          </span>
          <i class="fa-solid fa-chevron-down note-language-caret" aria-hidden="true"></i>
        </summary>
        <div class="note-language-options">
          ${items}
        </div>
      </details>
    `;
  };

  loadSiteIndex()
    .then(renderVariants)
    .catch(() => {
      const existing = document.getElementById(sectionId);
      if (existing) existing.remove();
    });
};

const ensureReadingToggle = () => {
  if (!isNotesPage) return;

  let btn = document.getElementById(readingToggleId);
  if (!btn) {
    const panel = document.querySelector(".note-meta-panel");
    if (panel) {
      const labels = getContentUiI18n();
      const section = document.createElement("div");
      section.className = "note-meta-section";
      section.innerHTML = `<div class="note-meta-label">${labels.viewSection}</div>
<div class="note-meta-actions">
  <button id="${readingToggleId}" type="button" class="note-meta-action" aria-label="${labels.toggleReadingMode}" title="${labels.toggleReadingMode}">
    <i id="${readingIconId}" class="fa-solid fa-book"></i> <span id="reading-label">${labels.readingModeState(false)}</span>
  </button>
</div>`;
      panel.insertBefore(section, panel.firstElementChild || null);
      btn = document.getElementById(readingToggleId);
    }
  }

  if (!btn) return;
  const labels = getContentUiI18n();
  const sectionLabel = btn.closest(".note-meta-section")?.querySelector(".note-meta-label");
  if (sectionLabel) sectionLabel.textContent = labels.viewSection;
  btn.setAttribute("aria-label", labels.toggleReadingMode);
  btn.setAttribute("title", labels.toggleReadingMode);
  const readingLabel = document.getElementById("reading-label");
  if (readingLabel) {
    readingLabel.textContent = labels.readingModeState(isReadingModeActive());
  }
  if (btn.dataset.bound === "1") return;
  btn.dataset.bound = "1";

  btn.addEventListener("click", () => {
    const isOn = isReadingModeActive();
    setReadingMode(!isOn);
  });
};

ensureNoteDateSwitcher();
ensureReadingToggle();
setReadingMode(savedReading, false);
setEstimatedReadingTime();
initNoteMarkdownActions();
initTagDetailRouteRepair();
window.addEventListener("ludwig-language-changed", () => {
  syncNoteMetaStaticI18n();
  ensureNoteDateSwitcher();
  ensureLanguageSwitcher();
  ensureReadingToggle();
  setReadingMode(isReadingModeActive(), false);
  initNoteRelated();
});

const createNoteTocVisibilitySync = (tocLinks) => {
  const isVisibleTarget = (el) => {
    if (!(el instanceof HTMLElement)) return false;
    if (el.hidden) return false;
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;
    return el.getClientRects().length > 0;
  };
  return () => {
    tocLinks.forEach((link) => {
      const href = String(link.getAttribute("href") || "");
      if (!href.startsWith("#")) {
        link.hidden = false;
        return;
      }
      const target = document.getElementById(href.slice(1));
      link.hidden = !isVisibleTarget(target);
    });
  };
};

const initNoteOverlays = () => {
  if (!isNotesPage) return;

  const overlaySelectors = [
    ".note-toc-hover-zone",
    ".note-toc-backdrop",
    ".note-toc-fab",
    ".note-toc-overlay",
    ".note-meta-hover-zone",
    ".note-meta-fab",
    ".note-meta-overlay",
  ];
  overlaySelectors.forEach((selector) => {
    const el = document.querySelector(selector);
    if (!el || el.parentElement === document.body) return;
    document.body.appendChild(el);
  });

  const supportsHover = typeof window.matchMedia === "function" && window.matchMedia("(hover: hover)").matches;
  const tocFab = document.querySelector(".note-toc-fab");
  const tocHoverZone = document.querySelector(".note-toc-hover-zone");
  const tocBackdrop = document.querySelector(".note-toc-backdrop");
  const tocOverlay = document.querySelector(".note-toc-overlay");
  const metaFab = document.querySelector(".note-meta-fab");
  const metaHoverZone = document.querySelector(".note-meta-hover-zone");
  const metaOverlay = document.querySelector(".note-meta-overlay");

  const closeNoteToc = () => document.body.classList.remove("note-toc-open");
  const toggleNoteToc = () => document.body.classList.toggle("note-toc-open");
  const closeNoteMeta = () => document.body.classList.remove("note-meta-open");
  const toggleNoteMeta = () => document.body.classList.toggle("note-meta-open");
  const openNoteToc = () => document.body.classList.add("note-toc-open");
  const openNoteMeta = () => document.body.classList.add("note-meta-open");
  const ensureLegacyNoteToc = () => {
    if (!tocOverlay) return [];
    const existingLinks = Array.from(tocOverlay.querySelectorAll("a.note-toc-link"));
    if (existingLinks.length > 0) return existingLinks;

    const tocNav = tocOverlay.querySelector(".note-toc");
    const noteContent = document.querySelector(".note-content");
    if (!tocNav || !noteContent) return existingLinks;

    const slugCounts = new Map();
    const slugify = (text) => {
      const base = String(text || "")
        .trim()
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
        .replace(/^-+|-+$/g, "");
      return base || "section";
    };

    const makeUniqueId = (text) => {
      const slug = slugify(text);
      const count = slugCounts.get(slug) || 0;
      slugCounts.set(slug, count + 1);
      return count === 0 ? slug : `${slug}-${count + 1}`;
    };

    const headings = Array.from(noteContent.querySelectorAll("h3, h4, h5, h6")).filter((heading) => {
      return String(heading.textContent || "").trim().length > 0;
    });
    if (headings.length === 0) return existingLinks;

    tocNav.innerHTML = "";
    headings.forEach((heading) => {
      if (!heading.id) {
        heading.id = makeUniqueId(heading.textContent || "");
      }
      const link = document.createElement("a");
      link.className = "note-toc-link";
      if (heading.tagName === "H5" || heading.tagName === "H6") {
        link.classList.add("level-2");
      } else {
        link.classList.add("level-1");
      }
      link.href = `#${heading.id}`;
      link.textContent = String(heading.textContent || "").trim();
      tocNav.appendChild(link);
    });

    return Array.from(tocNav.querySelectorAll("a.note-toc-link"));
  };

  const tocLinks = ensureLegacyNoteToc();
  let tocHoverCloseTimer = null;
  let metaHoverCloseTimer = null;

  const syncTocLinksForCurrentMode = createNoteTocVisibilitySync(tocLinks);

  const clearHoverTimer = (timerId) => {
    if (timerId) window.clearTimeout(timerId);
    return null;
  };

  const attachSwipeClose = (overlay, direction, onClose) => {
    if (!overlay) return;
    let startX = 0;
    let startY = 0;
    let tracking = false;

    overlay.addEventListener("touchstart", (event) => {
      if (!isPhoneViewport() || event.touches.length !== 1) return;
      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      tracking = true;
    }, { passive: true });

    overlay.addEventListener("touchend", (event) => {
      if (!tracking || !isPhoneViewport()) return;
      tracking = false;
      const touch = event.changedTouches && event.changedTouches[0];
      if (!touch) return;
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      if (Math.abs(deltaY) > 48) return;
      if (direction === "left" && deltaX <= -56) onClose();
      if (direction === "right" && deltaX >= 56) onClose();
    }, { passive: true });

    overlay.addEventListener("touchcancel", () => {
      tracking = false;
    }, { passive: true });
  };

  const scheduleHoverClose = (which) => {
    const close = which === "toc" ? closeNoteToc : closeNoteMeta;
    const timer = window.setTimeout(close, 140);
    if (which === "toc") {
      tocHoverCloseTimer = timer;
    } else {
      metaHoverCloseTimer = timer;
    }
  };

  if (tocFab && tocBackdrop && tocOverlay) {
    tocFab.addEventListener("click", () => {
      closeNoteMeta();
      toggleNoteToc();
    });
    tocOverlay.addEventListener("click", (e) => {
      const link = e.target.closest("a.note-toc-link");
      if (link) closeNoteToc();
    });
  }

  if (supportsHover && tocHoverZone && tocOverlay) {
    const openFromHover = () => {
      tocHoverCloseTimer = clearHoverTimer(tocHoverCloseTimer);
      closeNoteMeta();
      openNoteToc();
    };
    const closeFromHover = () => {
      tocHoverCloseTimer = clearHoverTimer(tocHoverCloseTimer);
      scheduleHoverClose("toc");
    };
    tocHoverZone.addEventListener("mouseenter", openFromHover);
    tocOverlay.addEventListener("mouseenter", openFromHover);
    tocHoverZone.addEventListener("mouseleave", closeFromHover);
    tocOverlay.addEventListener("mouseleave", closeFromHover);
  }

  if (metaFab && tocBackdrop && metaOverlay) {
    metaFab.addEventListener("click", () => {
      closeNoteToc();
      toggleNoteMeta();
    });
    metaOverlay.addEventListener("click", (e) => {
      const link = e.target.closest("#note-tags a");
      if (link) closeNoteMeta();
    });
  }

  if (supportsHover && metaHoverZone && metaOverlay) {
    const openFromHover = () => {
      metaHoverCloseTimer = clearHoverTimer(metaHoverCloseTimer);
      closeNoteToc();
      openNoteMeta();
    };
    const closeFromHover = () => {
      metaHoverCloseTimer = clearHoverTimer(metaHoverCloseTimer);
      scheduleHoverClose("meta");
    };
    metaHoverZone.addEventListener("mouseenter", openFromHover);
    metaOverlay.addEventListener("mouseenter", openFromHover);
    metaHoverZone.addEventListener("mouseleave", closeFromHover);
    metaOverlay.addEventListener("mouseleave", closeFromHover);
  }

  document.addEventListener("ludwig-open-note-toc", () => {
    closeNoteMeta();
    openNoteToc();
  });

  document.addEventListener("ludwig-open-note-meta", () => {
    closeNoteToc();
    openNoteMeta();
  });

  attachSwipeClose(tocOverlay, "left", closeNoteToc);
  attachSwipeClose(metaOverlay, "right", closeNoteMeta);

  if (tocBackdrop) {
    tocBackdrop.addEventListener("click", () => {
      closeNoteToc();
      closeNoteMeta();
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeNoteToc();
      closeNoteMeta();
    }
  });

  syncTocLinksForCurrentMode();
  window.addEventListener("ludwig-reading-mode-changed", () => {
    syncTocLinksForCurrentMode();
    if (document.body.classList.contains("note-toc-open")) {
      closeNoteMeta();
    }
  });
};

const initImageViewer = () => {
  const candidates = Array.from(
    document.querySelectorAll(
      ".note-content img, .garden-note-panel-content img, .section-entry-cover img, .garden-result-cover img"
    )
  );
  if (candidates.length === 0) return;

  let overlay = document.getElementById("site-image-viewer");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "site-image-viewer";
    overlay.className = "site-image-viewer";
    overlay.innerHTML = `
      <div class="site-image-viewer-backdrop" data-image-viewer-close></div>
      <figure class="site-image-viewer-figure" role="dialog" aria-modal="true" aria-label="Image viewer">
        <img class="site-image-viewer-image" alt="">
        <figcaption class="site-image-viewer-caption"></figcaption>
        <button type="button" class="site-image-viewer-close" data-image-viewer-close aria-label="Close image viewer">
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </figure>
    `;
    document.body.appendChild(overlay);
  }

  const imageEl = overlay.querySelector(".site-image-viewer-image");
  const captionEl = overlay.querySelector(".site-image-viewer-caption");
  const close = () => {
    overlay.classList.remove("is-open");
    document.body.classList.remove("site-image-viewer-open");
    if (imageEl) {
      imageEl.removeAttribute("src");
      imageEl.setAttribute("alt", "");
    }
    if (captionEl) captionEl.textContent = "";
  };
  overlay.addEventListener("click", (event) => {
    if (event.target.closest("[data-image-viewer-close]")) close();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) {
      close();
    }
  });

  const extractCaption = (img) => {
    const figure = img.closest("figure");
    const figCaption = figure ? figure.querySelector("figcaption") : null;
    if (figCaption) return String(figCaption.textContent || "").trim();
    return String(img.getAttribute("alt") || img.getAttribute("title") || "").trim();
  };

  candidates.forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.dataset.imageViewerBound === "1") return;
    if (img.closest(".no-image-viewer,[data-image-viewer='off']")) return;
    img.dataset.imageViewerBound = "1";
    img.classList.add("image-viewer-target");
    img.setAttribute("tabindex", img.getAttribute("tabindex") || "0");
    img.setAttribute("role", "button");

    const openFromImage = () => {
      const src = img.currentSrc || img.getAttribute("src") || "";
      if (!src || !imageEl || !captionEl) return;
      imageEl.setAttribute("src", src);
      imageEl.setAttribute("alt", img.getAttribute("alt") || "");
      captionEl.textContent = extractCaption(img);
      overlay.classList.add("is-open");
      document.body.classList.add("site-image-viewer-open");
    };

    const shouldBypassViewer = (event, anchor) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return true;
      if (anchor && String(anchor.getAttribute("data-image-viewer") || "").toLowerCase() === "link-only") {
        return true;
      }
      return false;
    };

    img.addEventListener("click", (event) => {
      const anchor = img.closest("a[href]");
      if (shouldBypassViewer(event, anchor)) return;
      event.preventDefault();
      openFromImage();
    });
    img.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const anchor = img.closest("a[href]");
      if (shouldBypassViewer(event, anchor)) return;
      event.preventDefault();
      openFromImage();
    });
  });
};

const initNoteQuizzes = () => {
  if (!isNotesPage) return;
  const quizEls = Array.from(document.querySelectorAll(".note-quiz"));
  if (quizEls.length === 0) return;

  quizEls.forEach((quizEl) => {
    const carouselEl = quizEl.querySelector(".note-quiz-carousel");
    const progressEl = quizEl.querySelector(".note-quiz-progress");
    const resetBtn = quizEl.querySelector(".note-quiz-reset");
    if (!carouselEl || !progressEl) return;

    const getItems = () => Array.from(carouselEl.querySelectorAll(".carousel-item"));
    const updateProgress = () => {
      const items = getItems();
      const idx = items.findIndex((x) => x.classList.contains("active"));
      const current = idx >= 0 ? idx + 1 : 1;
      progressEl.textContent = `${current} / ${items.length}`;
    };

    const ensureNavButtons = () => {
      const hasPrev = !!carouselEl.querySelector(".note-quiz-prev");
      const hasNext = !!carouselEl.querySelector(".note-quiz-next");
      if (hasPrev && hasNext) return;

      const makeBtn = (kind) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `carousel-control-${kind} note-quiz-nav note-quiz-${kind}`;
        btn.innerHTML = `<span class="carousel-control-${kind}-icon" aria-hidden="true"></span><span class="visually-hidden">${kind === "prev" ? "Previous" : "Next"}</span>`;
        return btn;
      };

      if (!hasPrev) carouselEl.appendChild(makeBtn("prev"));
      if (!hasNext) carouselEl.appendChild(makeBtn("next"));
    };

    ensureNavButtons();

    carouselEl.addEventListener("slid.bs.carousel", updateProgress);
    updateProgress();

    quizEl.addEventListener("click", (e) => {
      const navBtn = e.target.closest(".note-quiz-prev, .note-quiz-next");
      if (navBtn) {
        const bs = window.bootstrap?.Carousel?.getOrCreateInstance(carouselEl, { interval: false, ride: false, touch: true });
        if (!bs) return;
        if (navBtn.classList.contains("note-quiz-prev")) bs.prev();
        else bs.next();
        return;
      }

      const btn = e.target.closest(".note-quiz-option");
      if (!btn) return;
      const q = btn.closest(".note-quiz-question");
      if (!q) return;
      const responseEl = q.querySelector(".note-quiz-response");
      if (!responseEl) return;

      q.querySelectorAll(".note-quiz-option").forEach((b) => {
        b.classList.remove("is-selected", "is-correct", "is-wrong", "is-revealed-correct");
      });

      btn.classList.add("is-selected");
      const isCorrect = btn.getAttribute("data-correct") === "1";
      btn.classList.add(isCorrect ? "is-correct" : "is-wrong");
      if (!isCorrect) {
        const correctBtn = q.querySelector('.note-quiz-option[data-correct="1"]');
        if (correctBtn && correctBtn !== btn) correctBtn.classList.add("is-revealed-correct");
      }
      responseEl.classList.toggle("is-correct", isCorrect);
      responseEl.classList.toggle("is-wrong", !isCorrect);
      responseEl.textContent = btn.getAttribute("data-response") || "";
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        quizEl.querySelectorAll(".note-quiz-option").forEach((b) => {
          b.classList.remove("is-selected", "is-correct", "is-wrong", "is-revealed-correct");
        });
        quizEl.querySelectorAll(".note-quiz-response").forEach((r) => {
          r.classList.remove("is-correct", "is-wrong");
          r.textContent = "";
        });
        const bs = window.bootstrap?.Carousel?.getOrCreateInstance(carouselEl, { interval: false, ride: false, touch: true });
        if (bs) bs.to(0);
        updateProgress();
      });
    }
  });
};

const initNoteQaPromptCopy = () => {
  if (!isNotesPage) return;
  const blocks = Array.from(document.querySelectorAll(".note-qa"));
  if (blocks.length === 0) return;

  blocks.forEach((block) => {
    const btn = block.querySelector(".note-qa-copy");
    if (!btn) return;

    const getFullText = async () => {
      const sourceSel = btn.getAttribute("data-qa-source");
      let text = "";
      if (sourceSel) {
        const srcEl = block.querySelector(sourceSel) || document.querySelector(sourceSel);
        text = srcEl ? (srcEl.innerText || srcEl.textContent || "") : "";
      } else {
        const fullEl = block.querySelector(".note-qa-full");
        text = fullEl ? (fullEl.innerText || fullEl.textContent || "") : "";
      }

      if (btn.getAttribute("data-qa-append-core") === "1") {
        const coreMd = await getNoteMarkdown();
        if (coreMd) {
          return `${String(text || "").trim()}\n\nInput:\n${coreMd}`;
        }
      }

      return text;
    };

    const previewEl = block.querySelector(".note-qa-preview");
    if (previewEl) {
      const sourceSel = btn.getAttribute("data-qa-source");
      const srcEl = sourceSel ? (block.querySelector(sourceSel) || document.querySelector(sourceSel)) : null;
      const full = srcEl ? (srcEl.innerText || srcEl.textContent || "") : "";
      const [head] = full.split(/\nInput:\n/);
      previewEl.textContent = String(head || "").trim();
    }

    btn.addEventListener("click", async () => {
      try {
        const txt = await getFullText();
        await navigator.clipboard.writeText(txt);
        btn.classList.add("is-copied");
        setTimeout(() => btn.classList.remove("is-copied"), 1200);
      } catch (e) {
        btn.classList.add("is-failed");
        setTimeout(() => btn.classList.remove("is-failed"), 1200);
      }
    });
  });
};

deferNonCriticalInit(() => {
  ensureLanguageSwitcher();
  initNoteRelated();
  initNoteQuizzes();
  initNoteQaPromptCopy();
  initNoteOverlays();
  initImageViewer();
});

renderMathInElementSafely(document.querySelector(".note-content") || document.body);
