(() => {
  const normalizeText = (value) => String(value || '').toLowerCase();
  const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const tokenize = (value) => {
    const text = normalizeText(value);
    const tokens = [];
    const latin = text.match(/[a-z0-9]+/g);
    if (latin) tokens.push(...latin);
    for (const ch of text) {
      const code = ch.charCodeAt(0);
      const isCJK =
        (code >= 0x4e00 && code <= 0x9fff) ||
        (code >= 0x3400 && code <= 0x4dbf) ||
        (code >= 0xf900 && code <= 0xfaff);
      if (isCJK) tokens.push(ch);
    }
    return tokens;
  };

  const normalizeTag = (value) => String(value || '').trim().toLowerCase();
  const TAG_LABEL_PREFIX = 'label:';
  const tagLabelsByConcept = new Map();
  const tagConceptByLabel = new Map();
  const isConceptId = (value) => String(value || '').trim().startsWith('concept.');
  const buildFallbackTagKey = (value) => `${TAG_LABEL_PREFIX}${normalizeTag(value)}`;
  const stripFallbackTagKey = (value) => {
    const raw = String(value || '');
    return raw.startsWith(TAG_LABEL_PREFIX) ? raw.slice(TAG_LABEL_PREFIX.length) : raw;
  };
  const registerTagLabels = (conceptId, labels = {}, fallbackLabel = '') => {
    const normalizedConceptId = String(conceptId || '').trim();
    if (!normalizedConceptId) return;
    const current = tagLabelsByConcept.get(normalizedConceptId) || {};
    const merged = { ...current };
    const rawLabels = labels && typeof labels === 'object' ? labels : {};
    Object.entries(rawLabels).forEach(([lang, label]) => {
      const normalizedLabel = String(label || '').trim();
      const normalizedLang = String(lang || '').trim();
      if (!normalizedLang || !normalizedLabel) return;
      merged[normalizedLang] = normalizedLabel;
      tagConceptByLabel.set(normalizeTag(normalizedLabel), normalizedConceptId);
    });
    const fallback = String(fallbackLabel || '').trim();
    if (fallback) tagConceptByLabel.set(normalizeTag(fallback), normalizedConceptId);
    tagLabelsByConcept.set(normalizedConceptId, merged);
  };
  const getTagLabels = (conceptId) => {
    const normalizedConceptId = String(conceptId || '').trim();
    if (!normalizedConceptId) return {};
    return { ...(tagLabelsByConcept.get(normalizedConceptId) || {}) };
  };
  const getConceptLabel = (conceptId, lang = '') => {
    const normalizedConceptId = String(conceptId || '').trim();
    if (!normalizedConceptId) return '';
    const labels = tagLabelsByConcept.get(normalizedConceptId) || {};
    const preferredLang = normalizeLang(lang || getPreferredLang());
    const fallbackChain = [preferredLang];
    if (preferredLang === 'zh-Hans') {
      fallbackChain.push('zh-Hant', 'en');
    } else if (preferredLang === 'zh-Hant') {
      fallbackChain.push('zh-Hans', 'en');
    } else {
      fallbackChain.push('en', 'zh-Hant', 'zh-Hans');
    }
    return String(
      fallbackChain.map((key) => labels[key]).find(Boolean)
      || Object.values(labels)[0]
      || ''
    ).trim();
  };
  const resolveTagConcept = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (isConceptId(raw)) return raw;
    return tagConceptByLabel.get(normalizeTag(raw)) || '';
  };
  const resolveTagKey = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const conceptId = resolveTagConcept(raw);
    return conceptId || buildFallbackTagKey(raw);
  };
  const getTagLabel = (value, { lang = '', fallback = '' } = {}) => {
    const raw = String(value || '').trim();
    if (!raw) return String(fallback || '').trim();
    const conceptId = isConceptId(raw) ? raw : resolveTagConcept(raw);
    if (conceptId) {
      const localized = getConceptLabel(conceptId, lang);
      if (localized) return localized;
    }
    return String(fallback || stripFallbackTagKey(raw) || raw).trim();
  };
  const getTagEntries = (doc, { lang = '' } = {}) => {
    const tags = Array.isArray(doc && doc.tags) ? doc.tags : [];
    const tagConcepts = Array.isArray(doc && doc.tagConcepts) ? doc.tagConcepts : [];
    return tags
      .map((tag, index) => {
        const rawLabel = String(tag || '').trim();
        const conceptId = String(tagConcepts[index] || '').trim();
        const key = conceptId || buildFallbackTagKey(rawLabel);
        return {
          key,
          conceptId,
          label: conceptId ? getTagLabel(conceptId, { lang, fallback: rawLabel }) : rawLabel,
          rawLabel,
        };
      })
      .filter((entry) => entry.label);
  };
  const getDocTagLabels = (doc, { lang = '' } = {}) =>
    getTagEntries(doc, { lang }).map((entry) => entry.label);
  const toPriorityNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const isPinnedWriting = (doc) => Boolean(
    doc &&
    String(doc.section || '').toLowerCase() === 'writing' &&
    doc.pinned
  );
  const compareDocIdentity = (docA, docB) =>
    String((docA && docA.path) || (docA && docA.url) || (docA && docA.title) || '')
      .localeCompare(String((docB && docB.path) || (docB && docB.url) || (docB && docB.title) || ''));
  const comparePinnedPriority = (docA, docB) => {
    const pinnedA = isPinnedWriting(docA) ? 1 : 0;
    const pinnedB = isPinnedWriting(docB) ? 1 : 0;
    if (pinnedA !== pinnedB) return pinnedB - pinnedA;
    const priorityA = toPriorityNumber(docA && docA.priority);
    const priorityB = toPriorityNumber(docB && docB.priority);
    if (priorityA !== priorityB) return priorityB - priorityA;
    return 0;
  };
  const parseDateToTs = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return 0;
    const parsed = Date.parse(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const compareTitle = (docA, docB, dir = 'asc') => {
    const factor = dir === 'desc' ? -1 : 1;
    const cmp = String((docA && docA.title) || '').localeCompare(String((docB && docB.title) || ''));
    if (cmp) return cmp * factor;
    return compareDocIdentity(docA, docB) * factor;
  };
  const compareNumberField = (docA, docB, field, dir = 'desc') => {
    const factor = dir === 'asc' ? 1 : -1;
    const a = Number(docA && docA[field]) || 0;
    const b = Number(docB && docB[field]) || 0;
    const hasA = a > 0;
    const hasB = b > 0;
    if (hasA !== hasB) return hasA ? -1 : 1;
    if (a !== b) return (a - b) * factor;
    const pinnedCmp = comparePinnedPriority(docA, docB);
    if (pinnedCmp) return pinnedCmp;
    return compareTitle(docA, docB, 'asc');
  };
  const compareBySort = (docA, docB, sortBy = 'default') => {
    switch (String(sortBy || 'default')) {
      case 'title-asc':
        return compareTitle(docA, docB, 'asc');
      case 'title-desc':
        return compareTitle(docA, docB, 'desc');
      case 'reading-asc':
        return compareNumberField(docA, docB, 'readingTimeMinutes', 'asc');
      case 'reading-desc':
        return compareNumberField(docA, docB, 'readingTimeMinutes', 'desc');
      case 'published-asc':
        return compareNumberField(docA, docB, 'publishedAtTs', 'asc');
      case 'published-desc':
        return compareNumberField(docA, docB, 'publishedAtTs', 'desc');
      case 'modified-asc':
        return compareNumberField(docA, docB, 'lastModifiedAtTs', 'asc');
      case 'modified-desc':
        return compareNumberField(docA, docB, 'lastModifiedAtTs', 'desc');
      default:
        break;
    }
    const pinnedCmp = comparePinnedPriority(docA, docB);
    if (pinnedCmp) return pinnedCmp;
    return compareTitle(docA, docB, 'asc');
  };

  const inferSection = (raw) => {
    const section = String(raw.section || '').trim().toLowerCase();
    if (section) return section;
    const path = String(raw.path || '').replace(/^\/+/, '');
    if (path.startsWith('notes/')) return 'notes';
    if (path.startsWith('writing/')) return 'writing';
    if (path.startsWith('canvas/')) return 'canvas';
    const url = String(raw.url || '');
    if (url.includes('../notes/')) return 'notes';
    if (url.includes('../writing/')) return 'writing';
    if (url.includes('../canvas/')) return 'canvas';
    return 'page';
  };

  const inferPath = (raw) => {
    const p = String(raw.path || '').trim();
    if (p) return p.replace(/^\/+/, '');
    const url = String(raw.url || '').trim();
    if (url.startsWith('../')) return url.slice('../'.length);
    return url.replace(/^\/+/, '');
  };

  // Preview renderer only handles lightweight card snippets.
  // Full article rendering stays in Garden's markdown pipeline.
  const renderInlineMarkdown = (value) => {
    let out = escapeHtml(value || '');
    out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
    out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return out;
  };

  const renderMarkdownPreview = (markdown) => {
    const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
    const html = [];
    let paragraph = [];
    let quote = [];
    let inCode = false;
    let codeLines = [];

    const flushParagraph = () => {
      if (!paragraph.length) return;
      html.push(`<p>${renderInlineMarkdown(paragraph.join(' '))}</p>`);
      paragraph = [];
    };
    const flushList = () => {};
    const flushQuote = () => {
      if (!quote.length) return;
      html.push(`<blockquote><p>${renderInlineMarkdown(quote.join(' '))}</p></blockquote>`);
      quote = [];
    };
    const flushCode = () => {
      if (!inCode) return;
      html.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
      codeLines = [];
      inCode = false;
    };

    const renderListTree = (nodes, type) => {
      const items = nodes.map((node) => {
        const nested = node.children && node.children.length ? renderListTree(node.children, node.type) : '';
        return `<li>${renderInlineMarkdown(node.text)}${nested}</li>`;
      }).join('');
      return `<${type}>${items}</${type}>`;
    };

    const parseListBlock = (startIndex) => {
      const root = [];
      const stack = [{ indent: -1, children: root, type: 'ul' }];
      let i = startIndex;
      let rootType = 'ul';
      while (i < lines.length) {
        const raw = lines[i];
        const match = raw.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
        if (!match) break;
        const indent = String(match[1] || '').length;
        const marker = match[2];
        const type = /\d+\./.test(marker) ? 'ol' : 'ul';
        const text = match[3];
        if (root.length === 0) rootType = type;
        while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
        const node = { text, children: [], type };
        stack[stack.length - 1].children.push(node);
        stack.push({ indent, children: node.children, type });
        i += 1;
      }
      return { html: renderListTree(root, rootType), nextIndex: i };
    };

    for (let i = 0; i < lines.length; i += 1) {
      const rawLine = lines[i];
      const line = rawLine.replace(/\s+$/, '');
      const trimmed = line.trim();
      if (/^```/.test(trimmed)) {
        flushParagraph();
        flushList();
        flushQuote();
        if (inCode) {
          flushCode();
        } else {
          inCode = true;
        }
        continue;
      }
      if (inCode) {
        codeLines.push(rawLine);
        continue;
      }
      if (!trimmed) {
        flushParagraph();
        flushList();
        flushQuote();
        continue;
      }
      const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
      if (heading) {
        flushParagraph();
        flushList();
        flushQuote();
        const level = Math.min(4, heading[1].length + 1);
        html.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
        continue;
      }
      const quoteMatch = trimmed.match(/^>\s?(.*)$/);
      if (quoteMatch) {
        flushParagraph();
        flushList();
        quote.push(quoteMatch[1]);
        continue;
      }
      const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
      if (listMatch) {
        flushParagraph();
        flushQuote();
        const listBlock = parseListBlock(i);
        html.push(listBlock.html);
        i = listBlock.nextIndex - 1;
        continue;
      }
      flushList();
      flushQuote();
      paragraph.push(trimmed);
    }

    flushParagraph();
    flushList();
    flushQuote();
    flushCode();
    return html.join('');
  };

  const renderMathIn = (element, remaining = 20) => {
    if (!element) return;
    const shared = window.LudwigContentRuntime;
    if (shared && typeof shared.renderMathInElementSafely === 'function') {
      shared.renderMathInElementSafely(element);
      return;
    }
    if (typeof window.renderMathInElement !== 'function') {
      if (remaining <= 0) return;
      window.setTimeout(() => renderMathIn(element, remaining - 1), 50);
      return;
    }
    try {
      window.renderMathInElement(element, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
        ],
        ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
        throwOnError: false,
      });
    } catch (e) {}
  };

  const adaptIndex = (rawItems) => {
    const items = Array.isArray(rawItems) ? rawItems : [];
    const adapted = items.map((raw) => {
      const tags = Array.isArray(raw.tags) ? raw.tags.map((t) => String(t)) : [];
      const rawTagConcepts = Array.isArray(raw.tag_concepts) ? raw.tag_concepts.map((t) => String(t || '').trim()) : [];
      const tagConcepts = tags.map((_, index) => rawTagConcepts[index] || '');
      const rawTagLabels = raw.tag_labels && typeof raw.tag_labels === 'object' ? raw.tag_labels : {};
      Object.entries(rawTagLabels).forEach(([conceptId, labels]) => registerTagLabels(conceptId, labels));
      tags.forEach((tag, index) => {
        const conceptId = tagConcepts[index];
        if (conceptId) registerTagLabels(conceptId, rawTagLabels[conceptId], tag);
      });
      const tagKeys = tags.map((tag, index) => {
        const conceptId = String(tagConcepts[index] || '').trim();
        return conceptId || buildFallbackTagKey(tag);
      }).filter(Boolean);
      const normTags = tags.map(normalizeTag).filter(Boolean);
      const path = inferPath(raw);
      const section = inferSection({ ...raw, path });
      const related = Array.isArray(raw.related)
        ? raw.related
            .map((r) => ({
              url: String((r && r.url) || ''),
              path: String((r && r.path) || ''),
              score: typeof (r && r.score) === 'number' ? r.score : 0,
            }))
            .filter((r) => r.url || r.path)
        : [];

      return {
        title: String(raw.title || ''),
        url: String(raw.url || ''),
        path,
        cover: String(raw.cover || ''),
        section,
        kind: String(raw.kind || ''),
        lang: String(raw.lang || ''),
        canonicalId: String(raw.canonical_id || path || raw.url || ''),
        status: String(raw.status || 'published'),
        pinned: Boolean(raw.pinned),
        priority: toPriorityNumber(raw.priority),
        tags,
        tagConcepts,
        tagKeys,
        tagLabels: rawTagLabels,
        normTags,
        summary: String(raw.summary || ''),
        content: String(raw.content || ''),
        previewMarkdown: String(raw.preview_markdown || ''),
        readingTimeMinutes: Math.max(0, Number(raw.reading_time_minutes) || 0),
        publishedAt: String(raw.published_at || ''),
        lastModifiedAt: String(raw.last_modified_at || ''),
        publishedAtTs: parseDateToTs(raw.published_at),
        lastModifiedAtTs: parseDateToTs(raw.last_modified_at),
        related,
      };
    });
    const langsByCanonical = new Map();
    adapted.forEach((doc) => {
      const key = String(doc.canonicalId || doc.path || doc.url || '');
      if (!langsByCanonical.has(key)) langsByCanonical.set(key, new Set());
      langsByCanonical.get(key).add(normalizeLang(doc.lang));
    });
    adapted.forEach((doc) => {
      const key = String(doc.canonicalId || doc.path || doc.url || '');
      doc.availableLangs = Array.from(langsByCanonical.get(key) || []).filter(Boolean).sort();
    });
    return adapted;
  };

  const normalizeLang = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return 'en';
    const lowered = raw.toLowerCase();
    if (lowered === 'zh-hans' || lowered === 'zh-cn' || lowered === 'zh-sg') return 'zh-Hans';
    if (lowered === 'zh-hant' || lowered === 'zh-tw' || lowered === 'zh-hk' || lowered === 'zh-mo') return 'zh-Hant';
    if (lowered.startsWith('zh')) return 'zh-Hant';
    if (lowered === 'en-us' || lowered === 'en-gb') return 'en';
    return raw;
  };

  const getPreferredLang = () => {
    try {
      const saved = localStorage.getItem('site_lang_v1');
      if (saved) return normalizeLang(saved);
    } catch (e) {}
    return normalizeLang(document.documentElement.getAttribute('lang') || 'en');
  };

  const collapseByCanonical = (items, { lang = '', scored = false } = {}) => {
    const preferredLang = normalizeLang(lang || getPreferredLang());
    const groups = new Map();
    for (const item of Array.isArray(items) ? items : []) {
      const doc = scored ? item.doc : item;
      const key = String((doc && (doc.canonicalId || doc.path || doc.url)) || '');
      if (!key) continue;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }

    const pickOne = (bucket) => {
      const sorted = bucket.slice().sort((a, b) => {
        const docA = scored ? a.doc : a;
        const docB = scored ? b.doc : b;
        const pinnedCmp = comparePinnedPriority(docA, docB);
        if (pinnedCmp) return pinnedCmp;
        const langA = normalizeLang(docA && docA.lang);
        const langB = normalizeLang(docB && docB.lang);
        const exactA = langA === preferredLang ? 1 : 0;
        const exactB = langB === preferredLang ? 1 : 0;
        if (exactA !== exactB) return exactB - exactA;
        if (scored) {
          const scoreA = Number(a.score) || 0;
          const scoreB = Number(b.score) || 0;
          if (scoreA !== scoreB) return scoreB - scoreA;
        }
        const titleCmp = String((docA && docA.title) || '').localeCompare(String((docB && docB.title) || ''));
        if (titleCmp) return titleCmp;
        return compareDocIdentity(docA, docB);
      });
      return sorted[0];
    };

    const out = Array.from(groups.values()).map(pickOne);
    if (scored) {
      return out.sort((a, b) => {
        const pinnedCmp = comparePinnedPriority(a.doc, b.doc);
        if (pinnedCmp) return pinnedCmp;
        const langA = normalizeLang(a.doc && a.doc.lang);
        const langB = normalizeLang(b.doc && b.doc.lang);
        const exactA = langA === preferredLang ? 1 : 0;
        const exactB = langB === preferredLang ? 1 : 0;
        if (exactA !== exactB) return exactB - exactA;
        const scoreA = Number(a.score) || 0;
        const scoreB = Number(b.score) || 0;
        if (scoreA !== scoreB) return scoreB - scoreA;
        const titleCmp = String((a.doc && a.doc.title) || '').localeCompare(String((b.doc && b.doc.title) || ''));
        if (titleCmp) return titleCmp;
        return compareDocIdentity(a.doc, b.doc);
      });
    }
    return out.sort((a, b) => {
      const pinnedCmp = comparePinnedPriority(a, b);
      if (pinnedCmp) return pinnedCmp;
      const langA = normalizeLang(a && a.lang);
      const langB = normalizeLang(b && b.lang);
      const exactA = langA === preferredLang ? 1 : 0;
      const exactB = langB === preferredLang ? 1 : 0;
      if (exactA !== exactB) return exactB - exactA;
      const titleCmp = String((a && a.title) || '').localeCompare(String((b && b.title) || ''));
      if (titleCmp) return titleCmp;
      return compareDocIdentity(a, b);
    });
  };

  const getProjectRoot = () => {
    const path = String(window.location.pathname || '');
    const markers = ['/notes/', '/writing/', '/canvas/', '/garden/', '/tag/', '/pages/', '/labs/', '/future/'];
    for (const marker of markers) {
      const idx = path.indexOf(marker);
      if (idx >= 0) return path.slice(0, idx + 1);
    }
    const lastSlash = path.lastIndexOf('/');
    return lastSlash >= 0 ? path.slice(0, lastSlash + 1) : '/';
  };

  const normalizePathLike = (raw) => {
    const parts = [];
    for (const part of String(raw || '').split('/')) {
      if (!part || part === '.') continue;
      if (part === '..') {
        if (parts.length) parts.pop();
        continue;
      }
      parts.push(part);
    }
    return parts.join('/');
  };

  const toProjectHref = (target) => {
    const cleaned = String(target || '').replace(/^\/+/, '');
    if (!cleaned) return '';
    const root = getProjectRoot();
    if (window.location.protocol === 'file:') return `file://${root}${cleaned}`;
    return `${root}${cleaned}`;
  };

  const resolveSiteHref = (target) => {
    const cleaned = String(target || '').replace(/^\/+/, '');
    if (!cleaned) return '';
    return toProjectHref(cleaned);
  };

  const resolveAssetHref = (target, doc) => {
    const raw = String(target || '').trim();
    if (!raw) return '';
    if (/^(https?:|data:|blob:|file:)/i.test(raw)) return raw;
    if (raw.startsWith('#')) return raw;

    if (raw.startsWith('./') || raw.startsWith('../')) {
      const basePath = String((doc && (doc.path || doc.url)) || '')
        .replace(/^(\.\.\/)+/, '')
        .replace(/^\/+/, '');
      const baseDir = basePath.includes('/') ? basePath.slice(0, basePath.lastIndexOf('/') + 1) : '';
      return toProjectHref(normalizePathLike(`${baseDir}${raw}`));
    }

    return toProjectHref(normalizePathLike(raw));
  };

  const resolveTagHref = (tag, ctx = '') => {
    const conceptCandidate = typeof tag === 'object' && tag !== null
      ? String(tag.conceptId || tag.concept_id || '').trim()
      : resolveTagConcept(tag);
    const conceptId = isConceptId(conceptCandidate) ? conceptCandidate : '';
    const labelCandidate = typeof tag === 'object' && tag !== null
      ? String(tag.label || '').trim()
      : String(tag || '').trim();
    const label = conceptId
      ? getTagLabel(conceptId, { lang: getPreferredLang(), fallback: labelCandidate })
      : labelCandidate;
    const params = new URLSearchParams();
    if (conceptId) params.set('concept', conceptId);
    if (label) params.set('tag', label);
    const query = params.toString();
    return resolveSiteHref(`tag/index.html${query ? `?${query}` : ''}`, ctx);
  };

  const resolveTagPatchHref = (tag, ctx = '') => {
    const label = typeof tag === 'object' && tag !== null
      ? String(tag.label || getTagLabel(tag.conceptId || tag.concept_id || '', { lang: getPreferredLang() }) || '').trim()
      : getTagLabel(tag, { lang: getPreferredLang(), fallback: String(tag || '').trim() });
    const encoded = encodeURIComponent(String(label || '').trim());
    return resolveSiteHref(`garden/index.html#patch/${encoded}`, ctx);
  };

  const resolveHref = (doc) => {
    const candidate = String((doc && (doc.path || doc.url)) || '').replace(/^(\.\.\/)+/, '').replace(/^\/+/, '');
    return toProjectHref(candidate);
  };

  const DEFAULT_COVER_IMAGE_SIZE = 'landscape_4_3';
  const getDefaultCoverPrompt = (sectionLike) => {
    const section = typeof sectionLike === 'object' && sectionLike !== null
      ? inferSection(sectionLike)
      : String(sectionLike || '').trim().toLowerCase();
    if (section === 'writing') {
      return 'Minimalist editorial photo of a modern desk with a printed magazine and a pen, soft studio lighting, shallow depth of field, high contrast, no text, professional, realistic';
    }
    if (section === 'canvas') {
      return 'Minimalist gallery wall with pinned photographs, sketchbook pages and soft natural light, clean composition, high contrast, no text, professional, realistic';
    }
    return 'Minimalist editorial photo of a notebook and pen on a dark desk, soft studio lighting, shallow depth of field, high contrast, no text, professional, realistic';
  };

  const getDefaultCoverHref = (sectionLike) => {
    const section = typeof sectionLike === 'object' && sectionLike !== null
      ? inferSection(sectionLike)
      : String(sectionLike || '').trim().toLowerCase();
    if (section === 'writing') {
      return resolveSiteHref('assets/images/defaults/Writing.png');
    }
    return resolveSiteHref('assets/images/defaults/Notes.png');
  };

  const matchesAllTags = (doc, selectedTags) => {
    const required = selectedTags instanceof Set ? selectedTags : new Set();
    if (required.size === 0) return true;
    const docTags = new Set((doc.tagKeys || []).map(resolveTagKey).filter(Boolean));
    for (const t of required.values()) {
      const key = resolveTagKey(t);
      if (key && docTags.has(key)) return true;
    }
    return false;
  };

  const matchesQuerySimple = (doc, query) => {
    const q = normalizeText(query).trim();
    if (!q) return true;
    const hay = normalizeText([doc.title, doc.summary, (doc.tags || []).join(' '), doc.content].join(' '));
    return hay.includes(q);
  };

  const filterDocs = (docs, { section = '', selectedTags = new Set(), query = '' } = {}) => {
    const sec = String(section || '').trim().toLowerCase();
    const required = selectedTags instanceof Set ? selectedTags : new Set();
    const filtered = (Array.isArray(docs) ? docs : [])
      .filter((d) => !sec || String(d.section || '').toLowerCase() === sec)
      .filter((d) => matchesAllTags(d, required))
      .filter((d) => matchesQuerySimple(d, query));
    return collapseByCanonical(filtered, { scored: false });
  };
  const sortDocs = (docs, { sortBy = 'default' } = {}) =>
    (Array.isArray(docs) ? docs : []).slice().sort((a, b) => compareBySort(a, b, sortBy));
  const sortRankedDocs = (items, { sortBy = 'default' } = {}) => {
    const ranked = Array.isArray(items) ? items.slice() : [];
    const mode = String(sortBy || 'default');
    if (mode === 'relevance' || mode === 'default') {
      return ranked.sort((a, b) => {
        const pinnedCmp = comparePinnedPriority(a.doc, b.doc);
        if (pinnedCmp) return pinnedCmp;
        if ((Number(a.score) || 0) !== (Number(b.score) || 0)) return (Number(b.score) || 0) - (Number(a.score) || 0);
        return compareTitle(a.doc, b.doc, 'asc');
      });
    }
    return ranked.sort((a, b) => compareBySort(a.doc, b.doc, mode));
  };
  const getSortOptions = ({ lang = '', includeDefault = true, includeRelevance = false } = {}) => {
    const uiLang = normalizeLang(lang || getPreferredLang());
    const labels = uiLang === 'zh-Hant'
      ? {
          default: '預設排序',
          relevance: '相關性',
          publishedDesc: 'Published：晚到早',
          publishedAsc: 'Published：早到晚',
          modifiedDesc: 'Last modified：晚到早',
          modifiedAsc: 'Last modified：早到晚',
          readingDesc: 'Estimated reading time：長到短',
          readingAsc: 'Estimated reading time：短到長',
        }
      : uiLang === 'zh-Hans'
        ? {
            default: '默认排序',
            relevance: '相关性',
            publishedDesc: 'Published：晚到早',
            publishedAsc: 'Published：早到晚',
            modifiedDesc: 'Last modified：晚到早',
            modifiedAsc: 'Last modified：早到晚',
            readingDesc: 'Estimated reading time：长到短',
            readingAsc: 'Estimated reading time：短到长',
          }
        : {
            default: 'Default',
            relevance: 'Relevance',
            publishedDesc: 'Published: newest first',
            publishedAsc: 'Published: oldest first',
            modifiedDesc: 'Last modified: newest first',
            modifiedAsc: 'Last modified: oldest first',
            readingDesc: 'Estimated reading time: longest first',
            readingAsc: 'Estimated reading time: shortest first',
          };
    const chips = {
      default: uiLang === 'zh-Hant' ? '預設' : uiLang === 'zh-Hans' ? '默认' : 'Default',
      relevance: uiLang === 'zh-Hant' ? '相關' : uiLang === 'zh-Hans' ? '相关' : 'Relevant',
      published: 'Published',
      modified: 'Modified',
      reading: 'Reading',
    };
    const options = [];
    if (includeDefault) options.push({ value: 'default', label: labels.default, chip: chips.default, icon: 'fa-arrow-up-short-wide', showChip: true });
    if (includeRelevance) options.push({ value: 'relevance', label: labels.relevance, chip: chips.relevance, icon: 'fa-wand-magic-sparkles', showChip: true });
    options.push(
      { value: 'published-desc', label: labels.publishedDesc, chip: chips.published, icon: 'fa-arrow-down-wide-short', showChip: true },
      { value: 'published-asc', label: labels.publishedAsc, chip: chips.published, icon: 'fa-arrow-up-short-wide', showChip: true },
      { value: 'modified-desc', label: labels.modifiedDesc, chip: chips.modified, icon: 'fa-arrow-down-wide-short', showChip: true },
      { value: 'modified-asc', label: labels.modifiedAsc, chip: chips.modified, icon: 'fa-arrow-up-short-wide', showChip: true },
      { value: 'reading-desc', label: labels.readingDesc, chip: chips.reading, icon: 'fa-arrow-down-wide-short', showChip: true },
      { value: 'reading-asc', label: labels.readingAsc, chip: chips.reading, icon: 'fa-arrow-up-short-wide', showChip: true },
    );
    return options;
  };

  const buildTagStats = (docs, { section = '', limit = 36 } = {}) => {
    const sec = String(section || '').trim().toLowerCase();
    const counts = new Map();
    const labels = new Map();
    const concepts = new Map();
    const lang = getPreferredLang();
    for (const doc of Array.isArray(docs) ? docs : []) {
      if (sec && String(doc.section || '').toLowerCase() !== sec) continue;
      const seen = new Set();
      for (const entry of getTagEntries(doc, { lang })) {
        const key = entry.key;
        if (!key) continue;
        if (seen.has(key)) continue;
        seen.add(key);
        if (!labels.has(key)) labels.set(key, entry.label);
        if (entry.conceptId) concepts.set(key, entry.conceptId);
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([key, count]) => ({
        key,
        conceptId: concepts.get(key) || '',
        label: labels.get(key) || getTagLabel(key, { lang, fallback: key }),
        count,
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .slice(0, Math.max(0, Number(limit) || 0));
  };

  const buildRelatedTagStats = (docs, activeTag, { section = '', limit = 12 } = {}) => {
    const sec = String(section || '').trim().toLowerCase();
    const activeKey = resolveTagKey(activeTag);
    const counts = new Map();
    const labels = new Map();
    const concepts = new Map();
    const lang = getPreferredLang();

    for (const doc of Array.isArray(docs) ? docs : []) {
      if (sec && String(doc.section || '').toLowerCase() !== sec) continue;
      const uniqueTags = new Map();
      for (const entry of getTagEntries(doc, { lang })) {
        if (!entry.key || uniqueTags.has(entry.key)) continue;
        uniqueTags.set(entry.key, entry);
      }
      if (activeKey && !uniqueTags.has(activeKey)) continue;
      uniqueTags.forEach((entry, key) => {
        if (key === activeKey) return;
        if (!labels.has(key)) labels.set(key, entry.label);
        if (entry.conceptId) concepts.set(key, entry.conceptId);
        counts.set(key, (counts.get(key) || 0) + 1);
      });
    }

    return Array.from(counts.entries())
      .map(([key, count]) => ({
        key,
        conceptId: concepts.get(key) || '',
        label: labels.get(key) || getTagLabel(key, { lang, fallback: key }),
        count,
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .slice(0, Math.max(0, Number(limit) || 0));
  };

  const buildTfidf = (docs) => {
    const items = (Array.isArray(docs) ? docs : []).map((d, i) => ({ ...d, _id: i }));
    const df = new Map();
    const inverted = new Map();

    for (let id = 0; id < items.length; id++) {
      const doc = items[id];
      const seen = new Set();

      const titleTokens = tokenize(doc.title);
      const tagTokens = (doc.tags || []).flatMap((t) => tokenize(t));
      const summaryTokens = tokenize(doc.summary);
      const contentTokens = tokenize(doc.content);

      const addToken = (token, weight) => {
        if (!token) return;
        if (!inverted.has(token)) inverted.set(token, []);
        inverted.get(token).push({ id, weight });
        if (!seen.has(token)) {
          df.set(token, (df.get(token) || 0) + 1);
          seen.add(token);
        }
      };

      for (const t of titleTokens) addToken(t, 3);
      for (const t of tagTokens) addToken(t, 2);
      for (const t of summaryTokens) addToken(t, 1.2);
      for (const t of contentTokens) addToken(t, 1);
    }

    const N = items.length;
    const idf = new Map();
    for (const [token, n] of df.entries()) {
      idf.set(token, Math.log((N + 1) / (n + 1)) + 1);
    }

    return { docs: items, df, idf, inverted };
  };

  const searchTfidfRanked = (index, { query = '', selectedTags = new Set(), section = '' } = {}) => {
    const docs = Array.isArray(index && index.docs) ? index.docs : [];
    const required = selectedTags instanceof Set ? selectedTags : new Set();
    const sec = String(section || '').trim().toLowerCase();
    const q = normalizeText(query).trim();

    const base = docs
      .filter((d) => !sec || String(d.section || '').toLowerCase() === sec)
      .filter((d) => matchesAllTags(d, required));

    if (!q) return collapseByCanonical(base.map((doc) => ({ doc, score: 0 })), { scored: true });

    const scores = new Map();
    for (const token of tokenize(q)) {
      const postings = index.inverted.get(token);
      if (!postings) continue;
      const w = index.idf.get(token) || 1;
      for (const { id, weight } of postings) {
        scores.set(id, (scores.get(id) || 0) + w * weight);
      }
    }

    const ranked = base
      .map((doc) => ({ doc, score: scores.get(doc._id) || 0 }))
      .filter(({ doc, score }) => score > 0 || matchesQuerySimple(doc, q))
      .sort((a, b) => {
        const pinnedCmp = comparePinnedPriority(a.doc, b.doc);
        if (pinnedCmp) return pinnedCmp;
        if (a.score !== b.score) return b.score - a.score;
        return compareTitle(a.doc, b.doc, 'asc');
      });
    return collapseByCanonical(ranked, { scored: true });
  };
  const searchTfidf = (index, { query = '', selectedTags = new Set(), section = '', sortBy = 'relevance' } = {}) =>
    sortRankedDocs(searchTfidfRanked(index, { query, selectedTags, section }), { sortBy }).map(({ doc }) => doc);

  const getRelated = (doc, docs, limit = 6) => {
    const byPath = new Map();
    const byUrl = new Map();
    for (const d of Array.isArray(docs) ? docs : []) {
      if (d.path) byPath.set(String(d.path), d);
      if (d.url) byUrl.set(String(d.url), d);
    }
    const rel = Array.isArray(doc.related) ? doc.related : [];
    const out = [];
    for (const r of rel) {
      const found = (r.path && byPath.get(String(r.path))) || (r.url && byUrl.get(String(r.url)));
      if (found) out.push({ doc: found, score: r.score });
      if (out.length >= limit) break;
    }
    return out;
  };

  const core = {
    normalizeText,
    tokenize,
    normalizeTag,
    resolveTagConcept,
    resolveTagKey,
    getTagLabel,
    getTagLabels,
    getTagEntries,
    getDocTagLabels,
    adaptIndex,
    normalizeLang,
    getPreferredLang,
    collapseByCanonical,
    resolveSiteHref,
    resolveAssetHref,
    getDefaultCoverHref,
    resolveHref,
    resolveTagHref,
    resolveTagPatchHref,
    matchesAllTags,
    matchesQuerySimple,
    filterDocs,
    sortDocs,
    getSortOptions,
    buildTagStats,
    buildRelatedTagStats,
    buildTfidf,
    searchTfidfRanked,
    searchTfidf,
    sortRankedDocs,
    getRelated,
    renderMarkdownPreview,
    renderMathIn,
    isPinnedWriting,
  };

  window.SearchCore = core;
  if (!window.GardenSearchCore) window.GardenSearchCore = core;
})();
