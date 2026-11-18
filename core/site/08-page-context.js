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

