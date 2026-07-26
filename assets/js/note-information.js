(() => {
  const normalizeLang = (value) => {
    const raw = String(value || "").trim().toLowerCase();
    if (raw === "zh_tw" || raw === "zh-hant" || raw === "zh_hant") return "zh-Hant";
    if (raw === "zh_cn" || raw === "zh-hans" || raw === "zh_hans") return "zh-Hans";
    if (raw === "en") return "en";
    return String(value || "").trim() || "en";
  };

  const pickLocalizedText = (values, lang) => {
    if (!values || typeof values !== "object") return "";
    const preferred = normalizeLang(lang);
    const fallbacks = preferred === "zh-Hans"
      ? ["zh-Hans", "zh-Hant", "en"]
      : preferred === "zh-Hant"
        ? ["zh-Hant", "zh-Hans", "en"]
        : ["en", "zh-Hant", "zh-Hans"];

    const normalized = {};
    Object.entries(values).forEach(([key, value]) => {
      const text = String(value || "").trim();
      if (text) normalized[normalizeLang(key)] = text;
    });

    for (const key of fallbacks) {
      if (normalized[key]) return normalized[key];
    }
    return Object.values(normalized).find(Boolean) || "";
  };

  const buildConceptIndex = () => {
    const payload = window.LUDWIG_INFORMATION_ONTOLOGY;
    const concepts = Array.isArray(payload && payload.concepts) ? payload.concepts : [];
    return new Map(
      concepts
        .map((concept) => [String(concept && concept.concept_id || "").trim(), concept])
        .filter(([key]) => key)
    );
  };

  const hydrate = () => {
    const conceptsById = buildConceptIndex();
    if (conceptsById.size === 0) return;

    const nodes = document.querySelectorAll(".note-information[data-information-concept]");
    nodes.forEach((node) => {
      const conceptId = String(node.getAttribute("data-information-concept") || "").trim();
      if (!conceptId) return;
      const concept = conceptsById.get(conceptId);
      if (!concept) return;

      const lang = (window.LudwigLanguage && typeof window.LudwigLanguage.getCurrentLang === "function")
        ? window.LudwigLanguage.getCurrentLang()
        : document.documentElement.getAttribute("lang")
        || node.getAttribute("data-information-lang")
        || "en";
      const label = pickLocalizedText(concept.labels, lang);
      const context = pickLocalizedText(concept.contexts, lang);
      if (!context) return;

      node.setAttribute("aria-label", label ? `${label}: ${context}` : context);
      const tooltip = node.querySelector(".note-information-tooltip");
      if (tooltip) {
        tooltip.textContent = "";
        if (label) {
          const titleEl = document.createElement("strong");
          titleEl.className = "note-information-tooltip-title";
          titleEl.textContent = label;

          const dividerEl = document.createElement("span");
          dividerEl.className = "note-information-tooltip-divider";

          const textEl = document.createElement("span");
          textEl.className = "note-information-tooltip-text";
          textEl.textContent = context;

          tooltip.appendChild(titleEl);
          tooltip.appendChild(dividerEl);
          tooltip.appendChild(textEl);
        } else {
          tooltip.textContent = context;
        }
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hydrate, { once: true });
  } else {
    hydrate();
  }

  window.addEventListener("ludwig-language-changed", hydrate);
})();
