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

