(() => {
  const core = window.SearchCore || window.GardenSearchCore;
  const container = document.getElementById('note-tags');
  if (!container) return;

  const parseMetaTags = () => {
    const meta = document.querySelector('meta[name="site:tags"]') || document.querySelector('meta[name="garden:tags"]');
    const raw = meta ? meta.getAttribute('content') : '';
    return String(raw || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  };
  const parseMetaTagConcepts = () => {
    const meta = document.querySelector('meta[name="site:tag_concepts"]') || document.querySelector('meta[name="garden:tag_concepts"]');
    const raw = meta ? meta.getAttribute('content') : '';
    return String(raw || '').split(',').map((t) => t.trim());
  };
  const parseMetaTagLabels = () => {
    const meta = document.querySelector('meta[name="site:tag_labels"]') || document.querySelector('meta[name="garden:tag_labels"]');
    const raw = meta ? meta.getAttribute('content') : '';
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      return {};
    }
  };

  const getCurrentDocKey = () => {
    const path = window.location.pathname || '';
    const idxNotes = path.indexOf('/notes/');
    if (idxNotes >= 0) {
      const sub = path.slice(idxNotes + '/notes/'.length);
      return { root: 'notes', sub: sub.replace(/^\/+/, '') };
    }
    const idxWriting = path.indexOf('/writing/');
    if (idxWriting >= 0) {
      const sub = path.slice(idxWriting + '/writing/'.length);
      return { root: 'writing', sub: sub.replace(/^\/+/, '') };
    }
    const idxCanvas = path.indexOf('/canvas/');
    if (idxCanvas >= 0) {
      const sub = path.slice(idxCanvas + '/canvas/'.length);
      return { root: 'canvas', sub: sub.replace(/^\/+/, '') };
    }
    const parts = path.split('/').filter(Boolean);
    return { root: '', sub: parts[parts.length - 1] || '' };
  };
  const getUiLang = () => window.LudwigLanguage && typeof window.LudwigLanguage.getCurrentLang === 'function'
    ? window.LudwigLanguage.getCurrentLang()
    : document.documentElement.getAttribute('lang') || 'en';

  const getTagHref = (tag, conceptId = '') => {
    if (core && typeof core.resolveTagHref === 'function') {
      return core.resolveTagHref({ conceptId, label: tag });
    }
    const path = String(window.location.pathname || '');
    const markers = ['/notes/', '/writing/', '/canvas/', '/garden/', '/tag/', '/labs/', '/future/'];
    let root = '';
    for (const marker of markers) {
      const idx = path.indexOf(marker);
      if (idx >= 0) {
        root = path.slice(0, idx + 1);
        break;
      }
    }
    if (!root) root = path.slice(0, path.lastIndexOf('/') + 1);
    const params = new URLSearchParams();
    if (conceptId) params.set('concept', conceptId);
    if (tag) params.set('tag', tag);
    const href = `${root}tag/index.html${params.toString() ? `?${params.toString()}` : ''}`;
    if (window.location.protocol === 'file:') return `file://${href.replace(/^file:\/+/, '').replace(/^\/+/, '/')}`;
    return href;
  };

  const render = (entries) => {
    container.innerHTML = '';
    for (const entry of entries) {
      const a = document.createElement('a');
      a.className = 'note-tag-pill';
      a.href = getTagHref(entry.label, entry.conceptId);
      a.textContent = entry.label;
      container.appendChild(a);
    }
  };

  const buildEntriesFromMeta = () => {
    const tags = parseMetaTags();
    const concepts = parseMetaTagConcepts();
    const labelsByConcept = parseMetaTagLabels();
    return tags.map((tag, index) => {
      const conceptId = String(concepts[index] || '').trim();
      const localizedLabels = conceptId && labelsByConcept && typeof labelsByConcept === 'object'
        ? labelsByConcept[conceptId]
        : null;
      const label = conceptId && core && typeof core.getTagLabel === 'function'
        ? core.getTagLabel(conceptId, { lang: getUiLang(), fallback: tag })
        : conceptId && localizedLabels && typeof localizedLabels === 'object'
          ? String(
              localizedLabels[getUiLang()]
              || (getUiLang() === 'zh-Hans' ? localizedLabels['zh-Hant'] : '')
              || (getUiLang() === 'zh-Hant' ? localizedLabels['zh-Hans'] : '')
              || localizedLabels.en
              || localizedLabels['zh-Hant']
              || localizedLabels['zh-Hans']
              || Object.values(localizedLabels)[0]
              || tag
            ).trim()
          : tag;
      return { label, conceptId };
    }).filter((entry) => entry.label);
  };

  const buildEntriesFromDoc = (doc) => {
    if (core && typeof core.getTagEntries === 'function') {
      return core.getTagEntries(doc, { lang: getUiLang() }).map((entry) => ({
        label: entry.label,
        conceptId: entry.conceptId,
      }));
    }
    return (Array.isArray(doc && doc.tags) ? doc.tags : []).map((tag) => ({ label: String(tag), conceptId: '' }));
  };

  const resolveCurrentDocFromIndex = () => {
    if (!core || typeof core.adaptIndex !== 'function') return null;
    const index = Array.isArray(window.SITE_SEARCH_INDEX) ? window.SITE_SEARCH_INDEX : null;
    if (!index) return null;
    const docs = core.adaptIndex(index);
    const { root, sub } = getCurrentDocKey();
    const inContent =
      (window.location.pathname || '').includes('/notes/') ||
      (window.location.pathname || '').includes('/writing/') ||
      (window.location.pathname || '').includes('/canvas/');
    const docKey = inContent && root && sub ? `${root}/${sub}` : sub;
    return docs.find((d) => String(d.path || '').replace(/^\/+/, '') === docKey.replace(/^\/+/, '')) || null;
  };

  const init = async () => {
    const doc = resolveCurrentDocFromIndex();
    if (doc) {
      const entries = buildEntriesFromDoc(doc);
      if (entries.length > 0) {
        render(entries);
        return;
      }
    }
    const metaEntries = buildEntriesFromMeta();
    if (metaEntries.length > 0) render(metaEntries);
  };

  init();
  window.addEventListener('ludwig-language-changed', () => init());
})();
