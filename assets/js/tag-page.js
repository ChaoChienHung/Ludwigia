(() => {
  const core = window.SearchCore || window.GardenSearchCore;
  const ui = window.GardenSearchUi || null;
  const titleEl = document.getElementById('tag-title');
  const contextEl = document.getElementById('tag-context');
  const totalCountEl = document.getElementById('tag-total-count');
  const totalLabelEl = document.getElementById('tag-total-label');
  const patchLinkEl = document.getElementById('tag-open-patch');
  const searchLinkEl = document.getElementById('tag-open-search');
  const relatedSectionEl = document.getElementById('tag-related-section');
  const relatedEl = document.getElementById('tag-related');
  const relatedEmptyEl = document.getElementById('tag-related-empty');
  const resultsEl = document.getElementById('tag-results');
  const emptyEl = document.getElementById('tag-empty');

  if (!titleEl || !resultsEl || !emptyEl) return;

  const params = new URLSearchParams(window.location.search);
  const requestedConcept = (params.get('concept') || '').trim();
  const requestedTag = (params.get('tag') || '').trim();
  const topN = Math.max(0, Number(params.get('top') || 0));
  const getUiLang = () => (ui && typeof ui.getUiLang === 'function' ? ui.getUiLang() : 'en');
  const getI18n = () => {
    const lang = getUiLang();
    if (lang === 'zh-Hant') {
      return {
        fallbackTag: '標籤',
        kicker: 'Tag detail',
        browseAll: '瀏覽 notes、writing、canvas 裡的標籤內容。',
        browseOne: (label) => `瀏覽 notes、writing、canvas 中所有屬於「${label}」這個概念的內容。`,
        overviewKicker: '結果總覽',
        overviewTitle: '這個標籤概念底下的全部內容',
        overviewCaption: '快速掃過 notes、writing、canvas 的分佈。',
        acrossAllSections: '跨所有分區',
        notes: '筆記',
        notesCount: (count) => `${count} 篇筆記`,
        writing: '文章',
        writingCount: (count) => `${count} 篇文章`,
        canvas: '視界',
        canvasCount: (count) => `${count} 篇視界`,
        sameTagTitle: '同一個 tag，兩種視角',
        sameTagText: '這頁是穩定的 tag detail route；若想看 Garden 風格的群聚探索，再切去 Patch。',
        searchCta: '用這個 tag 去搜尋',
        patchCta: '打開 Patch 視角',
        entry: '篇內容',
        entries: '篇內容',
        relatedTitle: '相關標籤',
        relatedCaption: '常和這個概念一起出現的相鄰主題。',
        noRelated: '目前還沒有相關標籤。',
        noResults: '目前沒有結果。',
        searchIndexUnavailable: '目前無法載入搜尋索引。',
      };
    }
    return {
      fallbackTag: 'Tag',
      kicker: 'Tag detail',
      browseAll: 'Browse tagged content across notes, writing, and canvas.',
      browseOne: (label) => `Browse everything mapped to "${label}" across notes, writing, and canvas.`,
      overviewKicker: 'Results overview',
      overviewTitle: 'Everything gathered under this tag',
      overviewCaption: 'A quick scan across notes, writing, and canvas.',
      acrossAllSections: 'across all sections',
      notes: 'Notes',
      notesCount: (count) => `${count} notes`,
      writing: 'Writing',
      writingCount: (count) => `${count} writing`,
      canvas: 'Canvas',
      canvasCount: (count) => `${count} canvas`,
      sameTagTitle: 'Same tag, two views',
      sameTagText: 'Use this page as the stable detail route; open Patch when you want the Garden-style cluster view.',
      searchCta: 'Search with this tag',
      patchCta: 'Open Patch view',
      entry: 'entry',
      entries: 'entries',
      relatedTitle: 'Related tags',
      relatedCaption: 'Neighboring ideas that often appear with this concept.',
      noRelated: 'No related tags yet.',
      noResults: 'No results.',
      searchIndexUnavailable: 'Search index is not available.',
    };
  };

  const state = {
    docs: [],
  };
  const getActiveConceptId = () => {
    if (requestedConcept) return requestedConcept;
    if (core && typeof core.resolveTagConcept === 'function') {
      return core.resolveTagConcept(requestedTag);
    }
    return '';
  };
  const getActiveLabel = () => {
    const conceptId = getActiveConceptId();
    if (conceptId && core && typeof core.getTagLabel === 'function') {
      return core.getTagLabel(conceptId, { lang: getUiLang(), fallback: requestedTag });
    }
    return requestedTag || getI18n().fallbackTag;
  };
  const syncHeader = () => {
    const i18n = getI18n();
    const label = getActiveLabel();
    titleEl.textContent = label || i18n.fallbackTag;
    document.title = `${label || i18n.fallbackTag} — Ludwig`;
    if (contextEl) {
      contextEl.textContent = getActiveConceptId() || requestedTag
        ? i18n.browseOne(label || i18n.fallbackTag)
        : i18n.browseAll;
    }
    const kickerEl = document.querySelector('.hub-hero-kicker');
    if (kickerEl) kickerEl.innerHTML = `<i class="fa-solid fa-hashtag"></i>${i18n.kicker}`;
    const overviewKickerEl = document.querySelector('.tag-summary-kicker');
    if (overviewKickerEl) overviewKickerEl.textContent = i18n.overviewKicker;
    const overviewTitleEl = document.querySelector('.tag-summary-title');
    if (overviewTitleEl) overviewTitleEl.textContent = i18n.overviewTitle;
    const overviewCaptionEl = document.querySelector('.tag-summary-caption');
    if (overviewCaptionEl) overviewCaptionEl.textContent = i18n.overviewCaption;
    const totalMetaEl = document.querySelector('.tag-summary-total-meta span:last-child');
    if (totalMetaEl) totalMetaEl.textContent = i18n.acrossAllSections;
    const notesTitleEl = document.querySelector('.tag-summary-stat:nth-child(1) h2');
    if (notesTitleEl) notesTitleEl.textContent = i18n.notes;
    const writingTitleEl = document.querySelector('.tag-summary-stat:nth-child(2) h2');
    if (writingTitleEl) writingTitleEl.textContent = i18n.writing;
    const canvasTitleEl = document.querySelector('.tag-summary-stat:nth-child(3) h2');
    if (canvasTitleEl) canvasTitleEl.textContent = i18n.canvas;
    const relatedTitleEl = document.querySelector('#tag-related-section h3');
    if (relatedTitleEl) relatedTitleEl.textContent = i18n.relatedTitle;
    const relatedCaptionEl = document.querySelector('#tag-related-section p');
    if (relatedCaptionEl) relatedCaptionEl.textContent = i18n.relatedCaption;
    const sameTagTitleEl = document.querySelector('.hub-callout-title');
    if (sameTagTitleEl) sameTagTitleEl.textContent = i18n.sameTagTitle;
    const sameTagTextEl = document.querySelector('.hub-callout-text');
    if (sameTagTextEl) sameTagTextEl.textContent = i18n.sameTagText;
    if (relatedEmptyEl) relatedEmptyEl.textContent = i18n.noRelated;
    emptyEl.textContent = i18n.noResults;
    if (patchLinkEl) {
      patchLinkEl.href = core && typeof core.resolveTagPatchHref === 'function'
        ? core.resolveTagPatchHref({ conceptId: getActiveConceptId(), label })
        : `index.html#patch/${encodeURIComponent(label || '')}`;
      patchLinkEl.style.display = label ? 'inline-flex' : 'none';
    }
    if (searchLinkEl) {
      const queryParams = new URLSearchParams();
      if (getActiveConceptId()) queryParams.set('concept', getActiveConceptId());
      if (label) queryParams.set('tag', label);
      const query = queryParams.toString();
      searchLinkEl.href = core && typeof core.resolveSiteHref === 'function'
        ? core.resolveSiteHref(`pages/search.html${query ? `?${query}` : ''}`)
        : `../pages/search.html${query ? `?${query}` : ''}`;
      searchLinkEl.textContent = i18n.searchCta;
    }
    if (patchLinkEl) {
      patchLinkEl.textContent = i18n.patchCta;
    }
  };

  const markOpened = (url) => {
    if (ui && typeof ui.markOpened === 'function') ui.markOpened(url);
  };

  const getFilteredDocs = (docs) => {
    const activeKey = getActiveConceptId() || requestedTag;
    if (!activeKey) return core && typeof core.collapseByCanonical === 'function'
      ? core.collapseByCanonical(docs, { scored: false })
      : docs;
    if (core && typeof core.filterDocs === 'function') {
      return core.filterDocs(docs, { selectedTags: new Set([activeKey]) });
    }
    return docs;
  };

  const renderSummary = (docs) => {
    const counts = { notes: 0, writing: 0, canvas: 0 };
    for (const doc of docs) {
      const key = String(doc.section || '').toLowerCase();
      if (Object.prototype.hasOwnProperty.call(counts, key)) counts[key] += 1;
    }
    if (totalCountEl) totalCountEl.textContent = String(docs.length);
    if (totalLabelEl) totalLabelEl.textContent = docs.length === 1 ? getI18n().entry : getI18n().entries;
    const i18n = getI18n();
    const notesTextEl = document.querySelector('#tag-notes-count')?.parentElement || null;
    if (notesTextEl) notesTextEl.innerHTML = `<strong id="tag-notes-count">${counts.notes}</strong> ${i18n.notesCount(counts.notes).replace(/^\d+\s*/, '')}`;
    const writingTextEl = document.querySelector('#tag-writing-count')?.parentElement || null;
    if (writingTextEl) writingTextEl.innerHTML = `<strong id="tag-writing-count">${counts.writing}</strong> ${i18n.writingCount(counts.writing).replace(/^\d+\s*/, '')}`;
    const canvasTextEl = document.querySelector('#tag-canvas-count')?.parentElement || null;
    if (canvasTextEl) canvasTextEl.innerHTML = `<strong id="tag-canvas-count">${counts.canvas}</strong> ${i18n.canvasCount(counts.canvas).replace(/^\d+\s*/, '')}`;
  };

  const renderRelated = (docs) => {
    const activeKey = getActiveConceptId() || requestedTag;
    if (!relatedSectionEl || !relatedEl || !relatedEmptyEl || !activeKey) return;
    const rows = core && typeof core.buildRelatedTagStats === 'function'
      ? core.buildRelatedTagStats(docs, activeKey, { limit: 12 })
      : [];
    relatedEl.innerHTML = '';
    relatedEmptyEl.style.display = rows.length === 0 ? 'block' : 'none';
    relatedSectionEl.style.display = 'block';

    for (const row of rows) {
      const link = document.createElement('a');
      link.className = 'garden-tag';
      link.href = core && typeof core.resolveTagHref === 'function'
        ? core.resolveTagHref({ conceptId: row.conceptId, label: row.label })
        : `index.html?tag=${encodeURIComponent(row.label)}`;
      link.innerHTML = `${row.label} <span class="garden-tag-count">${row.count}</span>`;
      relatedEl.appendChild(link);
    }
  };

  const render = (docs) => {
    resultsEl.innerHTML = '';

    let filtered = getFilteredDocs(docs);

    if (topN > 0) filtered = filtered.slice(0, topN);

    emptyEl.style.display = filtered.length === 0 ? 'block' : 'none';
    renderSummary(filtered);
    renderRelated(docs);

    for (const doc of filtered) {
      const a = document.createElement('a');
      a.href = core ? core.resolveHref(doc, 'garden') : doc.url;
      a.className = 'garden-result is-enter';
      a.addEventListener('click', () => markOpened(doc.url || doc.path || ''));

      const displayTags = core && typeof core.getDocTagLabels === 'function'
        ? core.getDocTagLabels(doc, { lang: getUiLang() })
        : (Array.isArray(doc.tags) ? doc.tags : []);
      const tags = displayTags
        .slice(0, 3)
        .map((t) => `<span class="section-tag">${t}</span>`)
        .join('');

      const previewHtml = core ? core.renderMarkdownPreview(String(doc.previewMarkdown || '')) : '';
      a.innerHTML = `<div class="garden-result-main">
        <div class="garden-result-title">${doc.title} →</div>
        <div class="garden-result-meta">${tags}</div>
        ${previewHtml || doc.summary ? `<div class="garden-result-preview">${previewHtml || doc.summary}</div>` : ''}
      </div>`;
      const previewEl = a.querySelector('.garden-result-preview');
      if (previewEl && core) core.renderMathIn(previewEl);

      resultsEl.appendChild(a);
      requestAnimationFrame(() => a.classList.remove('is-enter'));
    }
  };

  const init = async () => {
    syncHeader();
    try {
      state.docs = ui && typeof ui.loadIndex === 'function'
        ? await ui.loadIndex({ core, indexPath: '../search/search-index.json' })
        : [];
      render(state.docs);
    } catch (e) {
      emptyEl.style.display = 'block';
      emptyEl.textContent = getI18n().searchIndexUnavailable;
    }
  };

  init();
  window.addEventListener('ludwig-language-changed', () => {
    syncHeader();
    if (state.docs.length) render(state.docs);
  });
})();
