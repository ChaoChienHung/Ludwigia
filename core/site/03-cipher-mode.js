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
    return sessionStorage.getItem(CIPHER_MODE_KEY) === "1" || localStorage.getItem(CIPHER_MODE_KEY) === "1";
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
      localStorage.setItem(CIPHER_MODE_KEY, on ? "1" : "0");
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

