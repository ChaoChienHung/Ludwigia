// Content metadata is `site:*`; older generated pages used `garden:*`, so read that as a fallback.
const readSiteMeta = (name) => {
  const meta = document.querySelector(`meta[name="site:${name}"]`) || document.querySelector(`meta[name="garden:${name}"]`);
  return String(meta?.getAttribute("content") || "").trim();
};

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

  const metaMinutes = Number(readSiteMeta("reading_time_minutes") || 0);
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
  return readSiteMeta("source");
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

let cachedNoteMarkdown = "";

const getNoteMarkdownFallback = () => {
  const title = document.querySelector("h1")?.innerText?.trim() || document.title || "Note";
  const contentEl = document.querySelector(".note-content");
  const md = domToMarkdown(contentEl || document.body);
  return `# ${escapeMarkdown(title)}\n\n${md.replace(/^## /m, "## ")}`;
};

const getNoteMarkdown = async () => {
  if (cachedNoteMarkdown) return cachedNoteMarkdown;
  const sourceText = await getSourceMarkdown();
  if (sourceText) {
    const coreMarkdown = extractCoreMarkdown(sourceText);
    if (coreMarkdown) {
      cachedNoteMarkdown = coreMarkdown;
      return coreMarkdown;
    }
  }
  cachedNoteMarkdown = getNoteMarkdownFallback();
  return cachedNoteMarkdown;
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

const copyTextToClipboardSync = (text) => {
  if (!text) return false;
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    textarea.remove();
    if (success) return true;
  } catch (_) {}
  return false;
};

const copyTextToClipboard = async (text) => {
  if (!text) return false;
  if (copyTextToClipboardSync(text)) return true;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {}
  }
  return false;
};

const initNoteMarkdownActions = () => {
  if (!isNotesPage) return;
  const copyBtn = document.getElementById("note-copy-md");
  const downloadBtn = document.getElementById("note-download-md");
  if (!copyBtn || !downloadBtn) return;

  syncNoteMetaStaticI18n();

  // Start pre-fetching source markdown in background so click is instant & synchronous
  getNoteMarkdown().catch(() => {});

  const statusEl = document.getElementById("note-md-status");
  const setStatus = (text) => {
    if (!statusEl) return;
    statusEl.textContent = text;
    if (text) setTimeout(() => { if (statusEl.textContent === text) statusEl.textContent = ""; }, 1800);
  };

  copyBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const md = cachedNoteMarkdown || getNoteMarkdownFallback();
    const success = copyTextToClipboardSync(md);
    if (success) {
      setStatus(getContentUiI18n().copySuccess);
    } else {
      copyTextToClipboard(md).then((ok) => {
        setStatus(ok ? getContentUiI18n().copySuccess : getContentUiI18n().copyFailure);
      }).catch(() => {
        setStatus(getContentUiI18n().copyFailure);
      });
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

  const raw = readSiteMeta("tags");
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

