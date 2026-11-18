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

