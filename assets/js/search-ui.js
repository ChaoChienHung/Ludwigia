(() => {
  const RECENT_KEY = 'garden_recent_v1';

  const getUiLang = () => window.LudwigLanguage && typeof window.LudwigLanguage.getCurrentLang === 'function'
    ? window.LudwigLanguage.getCurrentLang()
    : 'en';

  const getLangLabel = (lang, core = null) => {
    const normalized = core && typeof core.normalizeLang === 'function'
      ? core.normalizeLang(lang)
      : String(lang || '').trim();
    if (!normalized) return '';
    if (normalized === 'zh-Hant') return '中文';
    if (normalized === 'zh-Hans') return '简体中文';
    if (normalized === 'en') return 'English';
    return normalized;
  };

  const getReadingTimeLabel = (minutes) => {
    const value = Math.max(0, Number(minutes) || 0);
    if (!value) return '';
    const uiLang = getUiLang();
    if (uiLang === 'zh-Hant') return `約 ${value} 分鐘`;
    if (uiLang === 'zh-Hans') return `约 ${value} 分钟`;
    return `${value} min read`;
  };

  const getRecentMap = () => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (e) {}
    return {};
  };

  const markOpened = (url) => {
    if (!url) return;
    const now = Date.now();
    const map = getRecentMap();
    map[url] = now;
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(map));
    } catch (e) {}
  };

  const buildLanguageBadgeHtml = (doc, core = null) => {
    const langs = Array.isArray(doc && doc.availableLangs) ? doc.availableLangs : [];
    if (langs.length <= 1) return '';
    const uiLang = getUiLang();
    const title = langs.map((lang) => getLangLabel(lang, core)).filter(Boolean).join(', ');
    const safeTitle = title.replace(/"/g, '&quot;');
    const isZh = uiLang === 'zh-Hant' || uiLang === 'zh-Hans';
    const safeHeader = (isZh ? '可用語言' : 'Available languages').replace(/"/g, '&quot;');
    return `<span class="section-lang-badge" aria-label="${isZh ? `可用語言：${safeTitle}` : `Available languages: ${safeTitle}`}">
      <i class="fa-solid fa-earth-americas" aria-hidden="true"></i>
      <span class="section-lang-popover" aria-hidden="true">
        <span class="section-lang-popover-title">${safeHeader}</span>
        <span class="section-lang-popover-body">${safeTitle}</span>
      </span>
    </span>`;
  };

  const buildLanguageBadgeElement = (doc, core = null) => {
    const html = buildLanguageBadgeHtml(doc, core);
    if (!html) return null;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();
    return wrapper.firstElementChild instanceof HTMLElement ? wrapper.firstElementChild : null;
  };

  const loadIndex = async ({ core = null, indexPath, fallbackProvider = null } = {}) => {
    const adapt = (docs) => (core && typeof core.adaptIndex === 'function' ? core.adaptIndex(docs) : docs);

    if (indexPath) {
      try {
        const res = await fetch(indexPath, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to fetch index: ${res.status}`);
        const docs = await res.json();
        if (!Array.isArray(docs)) throw new Error('Invalid index format');
        return adapt(docs);
      } catch (e) {}
    }

    const idx = window.SITE_SEARCH_INDEX;
    if (Array.isArray(idx) && idx.length > 0) return adapt(idx);

    if (typeof fallbackProvider === 'function') {
      const docs = await fallbackProvider();
      if (Array.isArray(docs) && docs.length > 0) return adapt(docs);
    }

    throw new Error('Search index is not available.');
  };

  const createSortControl = ({
    host = null,
    options = [],
    value = 'default',
    baseValue = 'default',
    onChange = null,
  } = {}) => {
    if (!(host instanceof HTMLElement)) return null;
    const mobileQuery = window.matchMedia('(max-width: 767.98px)');
    let open = false;
    let currentValue = String(value || 'default');
    let desktopMenu = null;
    let mobileSheet = null;
    let mobileBackdrop = null;
    let rafId = 0;

    const resolveOption = (nextValue = currentValue) =>
      (Array.isArray(options) ? options : []).find((option) => option.value === nextValue)
      || (Array.isArray(options) ? options[0] : null);

    const closeMenus = () => {
      open = false;
      if (desktopMenu) desktopMenu.classList.remove('is-open');
      if (mobileSheet) mobileSheet.classList.remove('is-open');
      if (mobileBackdrop) mobileBackdrop.classList.remove('is-open');
      syncTrigger();
    };

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'site-sort-trigger';
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-expanded', 'false');

    const syncTrigger = () => {
      const option = resolveOption();
      const isCustomActive = currentValue !== baseValue;
      const triggerIcon = isCustomActive && option && option.icon
        ? option.icon
        : 'fa-arrow-up-short-wide';
      button.innerHTML = `
        <span class="site-sort-trigger__icon"><i class="fa-solid ${triggerIcon}" aria-hidden="true"></i></span>
      `;
      button.classList.toggle('is-active', isCustomActive);
      button.setAttribute('aria-label', option ? option.label : 'Sort');
      button.setAttribute('title', option ? option.label : 'Sort');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    const emitChange = (nextValue) => {
      currentValue = String(nextValue || currentValue || 'default');
      syncTrigger();
      if (typeof onChange === 'function') onChange(currentValue);
    };

    const buildOptionButton = (option, closeAfterSelect = true) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'site-sort-option';
      item.setAttribute('aria-label', option.label || option.chip || 'Sort');
      item.innerHTML = `
        <span class="site-sort-option__main">
          ${option.showChip ? `<span class="site-sort-option__chip">${option.chip || option.label || ''}</span>` : ''}
          ${!option.showChip ? `<span class="site-sort-option__label">${option.label || ''}</span>` : ''}
        </span>
        <span class="site-sort-option__meta">
          <i class="fa-solid ${option.icon || 'fa-arrow-up-short-wide'}" aria-hidden="true"></i>
          <i class="fa-solid fa-check site-sort-option__check" aria-hidden="true"></i>
        </span>
      `;
      item.classList.toggle('is-active', option.value === currentValue);
      item.addEventListener('click', () => {
        emitChange(option.value);
        if (closeAfterSelect) closeMenus();
      });
      return item;
    };

    const ensureDesktopMenu = () => {
      if (desktopMenu) return desktopMenu;
      desktopMenu = document.createElement('div');
      desktopMenu.className = 'site-sort-menu';
      desktopMenu.addEventListener('click', (event) => event.stopPropagation());
      document.body.appendChild(desktopMenu);
      return desktopMenu;
    };

    const ensureMobileSheet = () => {
      if (mobileSheet && mobileBackdrop) return { mobileSheet, mobileBackdrop };
      mobileBackdrop = document.createElement('button');
      mobileBackdrop.type = 'button';
      mobileBackdrop.className = 'site-sort-drawer-backdrop';
      mobileBackdrop.addEventListener('click', closeMenus);

      mobileSheet = document.createElement('section');
      mobileSheet.className = 'site-sort-drawer';
      mobileSheet.innerHTML = `
        <div class="site-sort-drawer__handle" aria-hidden="true"></div>
        <div class="site-sort-drawer__title">Sort</div>
        <div class="site-sort-drawer__options"></div>
      `;
      document.body.appendChild(mobileBackdrop);
      document.body.appendChild(mobileSheet);
      return { mobileSheet, mobileBackdrop };
    };

    const positionDesktopMenu = () => {
      if (!desktopMenu || !button.isConnected) return;
      const rect = button.getBoundingClientRect();
      const spacing = 10;
      const viewportPadding = 12;
      const width = desktopMenu.offsetWidth || 220;
      const height = desktopMenu.offsetHeight || 0;
      let left = rect.right - width;
      let top = rect.bottom + spacing;
      if (left < viewportPadding) left = viewportPadding;
      if (left + width > window.innerWidth - viewportPadding) {
        left = Math.max(viewportPadding, window.innerWidth - width - viewportPadding);
      }
      if (top + height > window.innerHeight - viewportPadding) {
        top = Math.max(viewportPadding, rect.top - height - spacing);
      }
      desktopMenu.style.left = `${Math.round(left)}px`;
      desktopMenu.style.top = `${Math.round(top)}px`;
    };

    const scheduleDesktopPosition = () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        positionDesktopMenu();
      });
    };

    const renderMenus = () => {
      const desktop = ensureDesktopMenu();
      desktop.innerHTML = '';
      options.forEach((option) => desktop.appendChild(buildOptionButton(option)));
      if (open && !mobileQuery.matches) scheduleDesktopPosition();

      const mobile = ensureMobileSheet();
      const mobileOptions = mobile.mobileSheet.querySelector('.site-sort-drawer__options');
      if (mobileOptions) {
        mobileOptions.innerHTML = '';
        options.forEach((option) => mobileOptions.appendChild(buildOptionButton(option)));
      }
    };

    const openMenus = () => {
      open = true;
      renderMenus();
      if (mobileQuery.matches) {
        ensureMobileSheet();
        if (mobileSheet) mobileSheet.classList.add('is-open');
        if (mobileBackdrop) mobileBackdrop.classList.add('is-open');
      } else {
        ensureDesktopMenu();
        if (desktopMenu) desktopMenu.classList.add('is-open');
        scheduleDesktopPosition();
      }
      syncTrigger();
    };

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (open) {
        closeMenus();
        return;
      }
      openMenus();
    });

    const handleDocumentClick = (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (host.contains(target)) return;
      if (desktopMenu && desktopMenu.contains(target)) return;
      if (mobileSheet && mobileSheet.contains(target)) return;
      closeMenus();
    };
    document.addEventListener('click', handleDocumentClick);

    const handleKeydown = (event) => {
      if (event.key !== 'Escape') return;
      closeMenus();
    };
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('resize', scheduleDesktopPosition);
    document.addEventListener('scroll', scheduleDesktopPosition, true);

    host.innerHTML = '';
    host.classList.add('site-sort-control');
    host.appendChild(button);
    renderMenus();
    syncTrigger();

    return {
      setValue(nextValue) {
        currentValue = String(nextValue || currentValue || 'default');
        renderMenus();
        syncTrigger();
      },
      destroy() {
        if (rafId) window.cancelAnimationFrame(rafId);
        document.removeEventListener('click', handleDocumentClick);
        window.removeEventListener('keydown', handleKeydown);
        window.removeEventListener('resize', scheduleDesktopPosition);
        document.removeEventListener('scroll', scheduleDesktopPosition, true);
        if (desktopMenu) desktopMenu.remove();
        if (mobileSheet) mobileSheet.remove();
        if (mobileBackdrop) mobileBackdrop.remove();
        host.innerHTML = '';
      },
    };
  };

  window.GardenSearchUi = {
    getUiLang,
    getLangLabel,
    getReadingTimeLabel,
    getRecentMap,
    markOpened,
    buildLanguageBadgeHtml,
    buildLanguageBadgeElement,
    loadIndex,
    createSortControl,
  };
})();
