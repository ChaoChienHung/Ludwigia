// Theme / Palette preload: the single source for the classes that must be on <html>
// before the first paint. Load it as a plain blocking <script src> in <head>, ahead of
// any stylesheet, so pages never flash the default theme. It stays dependency-free and
// works under file://.
//
// Storage keys and legacy aliases must stay backward compatible (see AGENTS.md):
// "galaxy-night" is an old alias of "deep-sea".
(() => {
  try {
    const root = document.documentElement;
    const THEME_CLASSES = new Map([
      ["light", "light-theme"],
      ["deep-sea", "deep-sea-theme"],
      ["galaxy-night", "deep-sea-theme"],
      ["galaxy", "galaxy-theme"],
      ["sky", "sky-theme"],
      ["garden", "garden-theme"],
    ]);
    const PALETTES = new Set([
      "ember", "cedar", "abyss", "nebula", "galaxy", "sky",
      "garden", "grove", "red", "yellow", "ash",
    ]);

    const theme = String(localStorage.getItem("theme") || "").trim().toLowerCase();
    if (THEME_CLASSES.has(theme)) root.classList.add(THEME_CLASSES.get(theme));

    const palette = String(localStorage.getItem("site_palette_v1") || "").trim().toLowerCase();
    if (PALETTES.has(palette)) root.classList.add(`palette-${palette}`);
  } catch (e) {}
})();
