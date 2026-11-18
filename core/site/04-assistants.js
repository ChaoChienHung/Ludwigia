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
  return !/(^|\/)(garden|labs|future|portals)(\/|$)/.test(path);
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

