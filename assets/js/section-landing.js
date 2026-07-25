(() => {
  const core = window.SearchCore || window.GardenSearchCore;
  const ui = window.GardenSearchUi || null;
  const titleEl = document.getElementById('section-title');
  const resultsEl = document.getElementById('section-results');
  const emptyEl = document.getElementById('section-empty');
  const searchEl = document.getElementById('section-search');
  const filterToggleEl = document.getElementById('section-filter-toggle');
  const filterPanelEl = document.getElementById('section-filter-panel');
  const countEl = document.getElementById('section-count');
  const toolbarEl = document.querySelector('.section-landing-toolbar');

  if (!titleEl || !resultsEl || !emptyEl) return;

  const section = (document.body.getAttribute('data-garden-section') || '').trim().toLowerCase();
  const getUiLang = () => (ui && typeof ui.getUiLang === 'function' ? ui.getUiLang() : 'en');
  const getSectionLabel = () => {
    const lang = getUiLang();
    if (lang === 'zh-Hant') {
      if (section === 'writing') return '文章';
      if (section === 'canvas') return '視界';
      return '筆記';
    }
    if (lang === 'zh-Hans') {
      if (section === 'writing') return '文章';
      if (section === 'canvas') return '视界';
      return '笔记';
    }
    if (section === 'writing') return 'Writing';
    if (section === 'canvas') return 'Canvas';
    return 'Notes';
  };
  const syncSectionHeader = () => {
    titleEl.textContent = getSectionLabel();
  };
  syncSectionHeader();

  const markOpened = (url) => {
    if (ui && typeof ui.markOpened === 'function') ui.markOpened(url);
  };

  const buildLanguageBadge = (doc) => {
    return ui && typeof ui.buildLanguageBadgeElement === 'function'
      ? ui.buildLanguageBadgeElement(doc, core)
      : null;
  };

  const selectedTags = new Set();
  const state = {
    sortBy: 'default',
  };
  let sortControl = null;
  const getReadingTimeLabel = (minutes) => (ui && typeof ui.getReadingTimeLabel === 'function' ? ui.getReadingTimeLabel(minutes) : '');
  const getSortOptions = () => (core && typeof core.getSortOptions === 'function'
    ? core.getSortOptions({ lang: getUiLang(), includeDefault: true })
    : []);
  const ensureSortControl = () => {
    if (!toolbarEl) return null;
    let host = toolbarEl.querySelector('[data-section-sort-host]');
    if (!host) {
      host = document.createElement('div');
      host.className = 'section-sort-control';
      host.setAttribute('data-section-sort-host', '1');
      toolbarEl.insertBefore(host, countEl || null);
    }
    if (sortControl && typeof sortControl.destroy === 'function') sortControl.destroy();
    sortControl = ui && typeof ui.createSortControl === 'function'
      ? ui.createSortControl({
          host,
          options: getSortOptions(),
          value: state.sortBy,
          baseValue: 'default',
          onChange: (nextValue) => {
            state.sortBy = String(nextValue || 'default');
            if (!docsRef) return;
            render(docsRef, searchEl ? searchEl.value : '');
          },
        })
      : null;
    return sortControl;
  };

  const buildPreviewContent = (doc, el) => {
    if (!el) return false;
    const summary = String(doc.summary || '').trim();
    if (summary) {
      el.textContent = summary;
      return true;
    }
    const preview = core ? core.renderMarkdownPreview(String(doc.previewMarkdown || '')) : '';
    if (preview) {
      el.innerHTML = preview;
      if (core) core.renderMathIn(el);
      return true;
    }
    return false;
  };

  const matchesQuery = (doc, query) => (core ? core.matchesQuerySimple(doc, query) : true);
  const matchesFilter = (doc) => (core ? core.matchesAllTags(doc, selectedTags) : true);

  const updateFilterToggle = () => {
    if (!filterToggleEl) return;
    const icon = '<i class="fa-solid fa-tags" aria-hidden="true"></i>';
    if (!selectedTags.size) {
      filterToggleEl.innerHTML = icon;
      return;
    }
    filterToggleEl.innerHTML = `${icon}<span class="section-filter-badge">${selectedTags.size}</span>`;
  };

  const buildFilterPanel = (docs) => {
    if (!filterPanelEl) return;
    const rows = core ? core.buildTagStats(docs, { section, limit: 36 }) : [];
    filterPanelEl.innerHTML = '';

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'garden-tag';
    clearBtn.textContent = 'Clear';
    clearBtn.addEventListener('click', () => {
      selectedTags.clear();
      updateFilterToggle();
      for (const el of filterPanelEl.querySelectorAll('.garden-tag.is-active')) el.classList.remove('is-active');
      if (!docsRef) return;
      render(docsRef, searchEl ? searchEl.value : '');
    });
    filterPanelEl.appendChild(clearBtn);

    for (const row of rows.slice(0, 36)) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'garden-tag';
      btn.textContent = `${row.label} (${row.count})`;
      if (selectedTags.has(row.key)) btn.classList.add('is-active');
      btn.addEventListener('click', () => {
        if (selectedTags.has(row.key)) {
          selectedTags.delete(row.key);
          btn.classList.remove('is-active');
        } else {
          selectedTags.add(row.key);
          btn.classList.add('is-active');
        }
        updateFilterToggle();
        if (!docsRef) return;
        render(docsRef, searchEl ? searchEl.value : '');
      });
      filterPanelEl.appendChild(btn);
    }
    updateFilterToggle();
  };

  const render = (docs, query = '') => {
    resultsEl.innerHTML = '';

    const filtered = core
      ? core.filterDocs(docs, { section, selectedTags, query })
      : docs.filter((d) => matchesQuery(d, query)).filter((d) => matchesFilter(d));
    const sorted = core && typeof core.sortDocs === 'function'
      ? core.sortDocs(filtered, { sortBy: state.sortBy })
      : filtered.slice();
    emptyEl.style.display = sorted.length === 0 ? 'block' : 'none';
    if (countEl) countEl.textContent = getUiLang() === 'zh-Hant'
      ? `${sorted.length} 篇${getSectionLabel()}`
      : `${sorted.length} ${getSectionLabel()}`;

    for (const doc of sorted) {
      const a = document.createElement('a');
      a.href = core ? core.resolveHref(doc, 'section') : String(doc.url || '#');
      a.className = resultsEl.classList.contains('section-feed') ? 'section-entry is-enter' : 'garden-result is-enter';
      a.addEventListener('click', () => markOpened(String(doc.url || doc.path || '')));

      const tags = core && typeof core.getDocTagLabels === 'function'
        ? core.getDocTagLabels(doc, { lang: getUiLang() }).slice(0, 3)
        : (Array.isArray(doc.tags) ? doc.tags : []).slice(0, 3);

      if (resultsEl.classList.contains('section-feed')) {
        const main = document.createElement('div');
        main.className = 'section-entry-main';

        const titleRow = document.createElement('div');
        titleRow.className = 'section-entry-title-row';

        const title = document.createElement('div');
        title.className = 'section-entry-title';
        title.innerHTML = `<span class="section-entry-title-main">${doc.pinned ? '<span class="section-entry-pin" title="Pinned writing" aria-label="Pinned writing">📌</span>' : ''}<span>${String(doc.title || '')}</span></span>`;
        titleRow.appendChild(title);

        const langBadge = buildLanguageBadge(doc);
        if (langBadge) titleRow.appendChild(langBadge);

        const summary = document.createElement('div');
        summary.className = 'section-entry-summary';

        main.appendChild(titleRow);
        if (buildPreviewContent(doc, summary)) {
          main.appendChild(summary);
        }

        const supporting = document.createElement('div');
        supporting.className = 'section-entry-supporting';
        const readingTimeLabel = getReadingTimeLabel(doc.readingTimeMinutes);
        if (readingTimeLabel) {
          const readingTime = document.createElement('span');
          readingTime.className = 'section-reading-time';
          readingTime.innerHTML = `<i class="fa-regular fa-clock" aria-hidden="true"></i><span>${readingTimeLabel}</span>`;
          supporting.appendChild(readingTime);
        }

        const meta = document.createElement('div');
        meta.className = 'section-entry-meta';
        for (const t of tags) {
          const span = document.createElement('span');
          span.className = 'section-tag';
          span.textContent = t;
          meta.appendChild(span);
        }
        if (supporting.childElementCount > 0 || tags.length > 0) {
          if (supporting.childElementCount > 0) main.appendChild(supporting);
          if (tags.length > 0) main.appendChild(meta);
        }

        const cover = document.createElement('div');
        cover.className = 'section-entry-cover';
        const img = document.createElement('img');
        const coverSrc = core && typeof core.resolveAssetHref === 'function'
          ? core.resolveAssetHref(doc.cover, doc)
          : String(doc.cover || '');
        img.src = coverSrc || (core && typeof core.getDefaultCoverHref === 'function' ? core.getDefaultCoverHref({ section }) : '');
        img.alt = '';
        img.loading = 'lazy';
        cover.appendChild(img);

        a.appendChild(main);
        a.appendChild(cover);
      } else {
        const main = document.createElement('div');
        main.className = 'garden-result-main';

        const title = document.createElement('div');
        title.className = 'garden-result-title';
        title.innerHTML = `<span class="garden-result-title-main">${doc.pinned ? '<span class="garden-result-pin" title="Pinned writing" aria-label="Pinned writing">📌</span>' : ''}<span>${String(doc.title || '')} →</span></span>`;

        const meta = document.createElement('div');
        meta.className = 'garden-result-meta';
        for (const t of tags) {
          const span = document.createElement('span');
          span.className = 'badge text-bg-secondary';
          span.textContent = String(t);
          meta.appendChild(span);
        }

        const preview = document.createElement('div');
        preview.className = 'garden-result-preview';
        preview.innerHTML = previewHtml(doc) || String(doc.summary || '');

        main.appendChild(title);
        main.appendChild(meta);
        if (doc.previewMarkdown || doc.summary) {
          main.appendChild(preview);
          if (core) core.renderMathIn(preview);
        }
        a.appendChild(main);
      }

      resultsEl.appendChild(a);
      requestAnimationFrame(() => a.classList.remove('is-enter'));
    }
  };

  let docsRef = null;

  const init = async () => {
    try {
      docsRef = ui && typeof ui.loadIndex === 'function'
        ? await ui.loadIndex({ core, indexPath: '../search/search-index.json' })
        : [];
      ensureSortControl();
      buildFilterPanel(docsRef);
      render(docsRef, searchEl ? searchEl.value : '');
    } catch (e) {
      emptyEl.style.display = 'block';
      emptyEl.textContent = 'Search index is not available.';
    }
  };

  if (searchEl) {
    searchEl.addEventListener('input', () => {
      if (!docsRef) return;
      render(docsRef, searchEl.value);
    });
  }

  if (filterToggleEl && filterPanelEl) {
    filterToggleEl.addEventListener('click', () => {
      const isHidden = filterPanelEl.style.display === 'none' || !filterPanelEl.style.display;
      filterPanelEl.style.display = isHidden ? 'flex' : 'none';
    });
  }

  init();
  window.addEventListener('ludwig-language-changed', () => {
    syncSectionHeader();
    ensureSortControl();
    if (docsRef) {
      buildFilterPanel(docsRef);
      render(docsRef, searchEl ? searchEl.value : '');
    }
  });
})();
