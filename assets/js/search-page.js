(() => {
  const core = window.SearchCore || window.GardenSearchCore;
  const ui = window.GardenSearchUi || null;
  const searchInput = document.getElementById('garden-search');
  const tagsContainer = document.getElementById('garden-tags');
  const resultsContainer = document.getElementById('garden-results');
  const emptyState = document.getElementById('garden-empty');
  const filterState = document.getElementById('garden-filter-state');
  const activeTagsContainer = document.getElementById('garden-active-tags');
  const clearTagsButton = document.getElementById('garden-clear-tags');
  const searchRow = searchInput.closest('.col-lg-10');

  if (!searchInput || !tagsContainer || !resultsContainer || !emptyState) return;

  const isInGarden = (window.location.pathname || '').includes('/garden/');

  const state = {
    docs: [],
    selectedTags: new Set(),
    tfidf: null,
    tagLabelByKey: new Map(),
    tagMetaByKey: new Map(),
    sortBy: 'relevance',
  };
  let sortControl = null;

  const getRecentMap = () => (ui && typeof ui.getRecentMap === 'function' ? ui.getRecentMap() : {});
  const markOpened = (url) => {
    if (ui && typeof ui.markOpened === 'function') {
      ui.markOpened(url);
    }
  };

  const resolveDocHref = (doc) => {
    if (core) return core.resolveHref(doc);
    const u = String((doc && doc.url) || '');
    if (isInGarden) return u;
    if (u.startsWith('../')) return u.slice('../'.length);
    return u;
  };

  const getUiLang = () => (ui && typeof ui.getUiLang === 'function' ? ui.getUiLang() : 'en');
  const getReadingTimeLabel = (minutes) => (ui && typeof ui.getReadingTimeLabel === 'function' ? ui.getReadingTimeLabel(minutes) : '');
  const getSortOptions = () => {
    if (!core || typeof core.getSortOptions !== 'function') return [];
    const lang = getUiLang();
    const defaultLabel = lang === 'zh-Hant'
      ? '預設排序'
      : lang === 'zh-Hans'
        ? '默认排序'
        : 'Default';
    const defaultChip = lang === 'zh-Hant'
      ? '預設'
      : lang === 'zh-Hans'
        ? '默认'
        : 'Default';
    return core.getSortOptions({ lang, includeDefault: false, includeRelevance: true }).map((option) => (
      option.value === 'relevance'
        ? { ...option, label: defaultLabel, chip: defaultChip }
        : option
    ));
  };
  const ensureSortControl = () => {
    if (!searchRow) return null;
    let host = document.querySelector('[data-search-sort-host]');
    if (!host) {
      host = document.createElement('div');
      host.className = 'garden-sort-row mt-3';
      host.setAttribute('data-search-sort-host', '1');
      searchRow.appendChild(host);
    }
    if (sortControl && typeof sortControl.destroy === 'function') sortControl.destroy();
    sortControl = ui && typeof ui.createSortControl === 'function'
      ? ui.createSortControl({
          host,
          options: getSortOptions(),
          value: state.sortBy,
          baseValue: 'relevance',
          onChange: (nextValue) => {
            state.sortBy = String(nextValue || 'relevance');
            renderResults();
          },
        })
      : null;
    return sortControl;
  };

  const buildLanguageBadgeHtml = (doc) => {
    return ui && typeof ui.buildLanguageBadgeHtml === 'function'
      ? ui.buildLanguageBadgeHtml(doc, core)
      : '';
  };

  const renderTags = () => {
    const tags = core ? core.buildTagStats(state.docs, { limit: 24 }) : [];

    tagsContainer.innerHTML = '';
    state.tagLabelByKey = new Map();
    state.tagMetaByKey = new Map();

    for (const row of tags) {
      const link = document.createElement('a');
      link.className = 'garden-tag';
      link.dataset.tag = row.key;
      state.tagLabelByKey.set(row.key, row.label);
      state.tagMetaByKey.set(row.key, row);
      link.href = core && typeof core.resolveTagHref === 'function'
        ? core.resolveTagHref({ conceptId: row.conceptId, label: row.label })
        : `tag/index.html?tag=${encodeURIComponent(row.label)}`;
      link.innerHTML = `${row.label} <span class="garden-tag-count">${row.count}</span>`;
      link.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        if (state.selectedTags.has(row.key)) {
          state.selectedTags.delete(row.key);
        } else {
          state.selectedTags.add(row.key);
        }
        updateTagActiveState();
        renderResults();
      });
      tagsContainer.appendChild(link);
    }

    updateTagActiveState();
  };

  const updateTagActiveState = () => {
    tagsContainer.querySelectorAll('[data-tag]').forEach((el) => {
      const isActive = state.selectedTags.has(el.dataset.tag || '');
      el.classList.toggle('is-active', isActive);
    });

    const openTagLink = document.getElementById('garden-open-tag-page');
    if (openTagLink) {
      const single = state.selectedTags.size === 1;
      openTagLink.style.display = single ? 'inline-flex' : 'none';
      if (single) {
        const key = Array.from(state.selectedTags.values())[0];
        const label = state.tagLabelByKey.get(key) || key;
        const meta = state.tagMetaByKey.get(key) || { conceptId: '', label };
        openTagLink.href = core && typeof core.resolveTagHref === 'function'
          ? core.resolveTagHref({ conceptId: meta.conceptId, label })
          : `tag/index.html?tag=${encodeURIComponent(label)}`;
      }
    }

    if (filterState && activeTagsContainer && clearTagsButton) {
      const hasTags = state.selectedTags.size > 0;
      filterState.style.display = hasTags ? 'block' : 'none';
      activeTagsContainer.innerHTML = '';

      for (const tag of Array.from(state.selectedTags.values())) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'garden-tag is-active';
        btn.textContent = state.tagLabelByKey.get(tag) || tag;
        btn.addEventListener('click', () => {
          state.selectedTags.delete(tag);
          updateTagActiveState();
          renderResults();
        });
        activeTagsContainer.appendChild(btn);
      }
    }
  };

  const sortDocsByRecent = (docs) => {
    const recent = getRecentMap();
    return (Array.isArray(docs) ? docs : []).slice().sort((a, b) => {
      const pinnedA = core && typeof core.isPinnedWriting === 'function' && core.isPinnedWriting(a) ? 1 : 0;
      const pinnedB = core && typeof core.isPinnedWriting === 'function' && core.isPinnedWriting(b) ? 1 : 0;
      if (pinnedA !== pinnedB) return pinnedB - pinnedA;
      const priorityA = Number(a && a.priority) || 0;
      const priorityB = Number(b && b.priority) || 0;
      if (priorityA !== priorityB) return priorityB - priorityA;
      const ra = recent[a.url] || 0;
      const rb = recent[b.url] || 0;
      if (ra !== rb) return rb - ra;
      const titleCmp = String(a.title || '').localeCompare(String(b.title || ''));
      if (titleCmp) return titleCmp;
      return String(a.path || a.url || '').localeCompare(String(b.path || b.url || ''));
    });
  };

  const getVisibleDocs = (query) => {
    if (!core || !state.tfidf) return [];
    if (query) {
      return core.searchTfidf(state.tfidf, {
        query,
        selectedTags: state.selectedTags,
        sortBy: state.sortBy,
      });
    }
    const filtered = core.filterDocs(state.docs, {
      selectedTags: state.selectedTags,
    });
    if (state.sortBy === 'relevance') return sortDocsByRecent(filtered);
    return core.sortDocs(filtered, { sortBy: state.sortBy === 'relevance' ? 'default' : state.sortBy });
  };

  const renderResults = () => {
    const raw = searchInput.value || '';
    const query = core ? core.normalizeText(raw).trim() : String(raw || '').toLowerCase().trim();
    const docs = getVisibleDocs(query);

    resultsContainer.innerHTML = '';
    emptyState.style.display = docs.length === 0 ? 'block' : 'none';

    for (const doc of docs) {
      const a = document.createElement('a');
      a.href = resolveDocHref(doc);
      a.className = 'section-entry is-enter';
      a.addEventListener('click', () => markOpened(doc.url));

      const displayTags = core && typeof core.getDocTagLabels === 'function'
        ? core.getDocTagLabels(doc, { lang: getUiLang() })
        : doc.tags;
      const tags = displayTags.slice(0, 3).map((t) => `<span class="section-tag">${t}</span>`).join('');
      const langBadge = buildLanguageBadgeHtml(doc);
      const pinBadge = doc.pinned ? '<span class="section-entry-pin" title="Pinned writing" aria-label="Pinned writing">📌</span>' : '';
      const coverSrc = core && typeof core.resolveAssetHref === 'function'
        ? core.resolveAssetHref(doc.cover, doc)
        : String(doc.cover || '');
      const finalCover = coverSrc || (core && typeof core.getDefaultCoverHref === 'function' ? core.getDefaultCoverHref(doc) : '');

      const summary = String(doc.summary || '').trim();
      const previewHtml = summary || (core ? core.renderMarkdownPreview(String(doc.previewMarkdown || '')) : '');
      const readingTimeLabel = getReadingTimeLabel(doc.readingTimeMinutes);
      a.innerHTML = `<div class="section-entry-main">
        <div class="section-entry-title-row">
          <div class="section-entry-title"><span class="section-entry-title-main">${pinBadge}<span>${doc.title} →</span></span></div>
          ${langBadge}
        </div>
        ${previewHtml ? `<div class="section-entry-summary">${previewHtml}</div>` : ''}
        ${(readingTimeLabel || tags) ? `<div class="section-entry-supporting">${readingTimeLabel ? `<span class="section-reading-time"><i class="fa-regular fa-clock" aria-hidden="true"></i><span>${readingTimeLabel}</span></span>` : ''}</div>` : ''}
        ${tags ? `<div class="section-entry-meta">${tags}</div>` : ''}
      </div>
      <div class="section-entry-cover">
        <img src="${finalCover}" alt="" loading="lazy">
      </div>`;
      const previewEl = a.querySelector('.section-entry-summary');
      if (previewEl && core && !summary) core.renderMathIn(previewEl);

      resultsContainer.appendChild(a);
      requestAnimationFrame(() => a.classList.remove('is-enter'));
    }
  };

  const attachKeyboardShortcut = () => {
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
    });
  };

  const attachSearchFocusBehavior = () => {
    const initialPlaceholder = searchInput.getAttribute('placeholder') || '';

    searchInput.addEventListener('focus', () => {
      searchInput.setAttribute('placeholder', '');
      if (typeof searchInput.select === 'function') searchInput.select();
    });

    searchInput.addEventListener('blur', () => {
      if (!searchInput.value) searchInput.setAttribute('placeholder', initialPlaceholder);
    });
  };

  const extractDocsFromDOM = () => {
    const anchors = Array.from(resultsContainer.querySelectorAll('a[href]'));
    const docs = [];

    for (const a of anchors) {
      const firstLine = String(a.textContent || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)[0] || '';

      const title = firstLine.replace(/→.*/g, '').trim();
      const url = a.getAttribute('href') || '';
      const tags = Array.from(a.querySelectorAll('.badge'))
        .map((el) => (el.textContent || '').trim())
        .filter(Boolean);

      if (!title || !url) continue;
      docs.push({ title, url, tags });
    }

    return docs;
  };

  const init = async () => {
    attachKeyboardShortcut();
    attachSearchFocusBehavior();
    const params = new URLSearchParams(window.location.search);
    const initialQuery = (params.get('q') || '').trim();
    const initialConcepts = params.getAll('concept')
      .map((value) => String(value || '').trim())
      .filter(Boolean);
    const initialTags = params.getAll('tag')
      .flatMap((value) => String(value || '').split(','))
      .map((value) => core && typeof core.resolveTagKey === 'function'
        ? core.resolveTagKey(value)
        : String(value || '').trim().toLowerCase())
      .filter(Boolean);
    const initialSelectedTags = new Set([
      ...initialConcepts,
      ...initialTags,
    ]);
    if (initialQuery) searchInput.value = initialQuery;

    if (clearTagsButton) {
      clearTagsButton.addEventListener('click', () => {
        state.selectedTags.clear();
        updateTagActiveState();
        renderResults();
      });
    }

    resultsContainer.querySelectorAll('a[href]').forEach((a) => {
      a.addEventListener('click', () => markOpened(a.getAttribute('href') || ''));
    });

    try {
      state.docs = ui && typeof ui.loadIndex === 'function'
        ? await ui.loadIndex({
            core,
            indexPath: isInGarden ? '../search/search-index.json' : 'search/search-index.json',
            fallbackProvider: extractDocsFromDOM,
          })
        : [];
      state.tfidf = core ? core.buildTfidf(state.docs) : null;
      state.selectedTags = new Set(initialSelectedTags);
      ensureSortControl();
      renderTags();
      renderResults();

      searchInput.addEventListener('input', () => renderResults());
    } catch (err) {
      resultsContainer.innerHTML = '';
      emptyState.style.display = 'block';
      emptyState.textContent = 'Search index is not available.';
    }
  };

  init();
  window.addEventListener('ludwig-language-changed', () => {
    ensureSortControl();
    renderTags();
    renderResults();
  });
})();
