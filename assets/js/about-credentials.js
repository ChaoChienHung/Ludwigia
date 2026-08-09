(() => {
  const rootSelector = '[data-about-credentials-root]';
  const langRuntime = window.LudwigLanguage || null;
  const dataPath = 'data/Credentials/credentials.json';

  const state = {
    activeType: 'all',
    activeCategory: 'all',
    activeItemId: null,
    data: null,
    isLoading: true,
    loadError: false,
  };

  const uiText = {
    en: {
      kicker: 'Credentials',
      title: 'Credentials',
      intro: 'Certificates, official transcripts, honor awards, and letters of appreciation. Filter by type or domain to explore.',
      typeLabel: 'Type',
      categoryLabel: 'Domain',
      loading: 'Loading credentials...',
      loadFailed: 'Unable to load credentials data right now.',
      empty: 'No credentials found matching the selected filters.',
      zoomHint: 'Click image to expand view',
      zoomButton: 'Full Preview',
      downloadButton: 'Download Document',
      issuerLabel: 'Issued by',
      dateLabel: 'Date',
      prevItem: 'Previous item',
      nextItem: 'Next item',
      modalClose: 'Close',
    },
    'zh-Hant': {
      kicker: '憑證紀錄',
      title: 'Credentials',
      intro: '包含各式獎狀、成績單、結業證書與感謝狀等紀錄。可依據「種類」或「領域」進行選取與檢視。',
      typeLabel: '種類',
      categoryLabel: '領域',
      loading: '正在載入憑證資料...',
      loadFailed: '目前無法載入憑證資料。',
      empty: '沒有符合目前篩選條件的憑證項目。',
      zoomHint: '點擊圖片放大檢視',
      zoomButton: '全螢幕檢視',
      downloadButton: '下載檔案',
      issuerLabel: '頒發單位',
      dateLabel: '日期',
      prevItem: '上一個項目',
      nextItem: '下一個項目',
      modalClose: '關閉',
    },
    'zh-Hans': {
      kicker: '凭证纪录',
      title: 'Credentials',
      intro: '包含各式奖状、成绩单、结业证书与感谢状等纪录。可依据“种类”或“领域”进行选取与检视。',
      typeLabel: '种类',
      categoryLabel: '领域',
      loading: '正在载入凭证数据...',
      loadFailed: '目前无法载入凭证数据。',
      empty: '没有符合当前筛选条件的凭证项目。',
      zoomHint: '点击图片放大检视',
      zoomButton: '全屏幕检视',
      downloadButton: '下载文件',
      issuerLabel: '颁发单位',
      dateLabel: '日期',
      prevItem: '上一个项目',
      nextItem: '下一个项目',
      modalClose: '关闭',
    },
  };

  function getLang() {
    if (langRuntime && typeof langRuntime.getCurrentLang === 'function') {
      const l = langRuntime.getCurrentLang();
      if (l === 'zh-Hans' || l === 'zh-CN') return 'zh-Hans';
      if (l === 'zh-Hant' || l === 'zh-TW' || l === 'zh') return 'zh-Hant';
      return 'en';
    }
    const htmlLang = String(document.documentElement.lang || '').toLowerCase();
    if (htmlLang.includes('hans') || htmlLang.includes('cn')) return 'zh-Hans';
    if (htmlLang.includes('hant') || htmlLang.includes('tw')) return 'zh-Hant';
    return 'en';
  }

  function getLocalizedText(obj, lang) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj['zh-Hant'] || obj['en'] || '';
  }

  function ensureModalExists(txt) {
    let modalEl = document.getElementById('credentialModal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.className = 'modal fade';
      modalEl.id = 'credentialModal';
      modalEl.setAttribute('tabindex', '-1');
      modalEl.setAttribute('aria-hidden', 'true');
      modalEl.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content rounded-4 overflow-hidden position-relative shadow-lg">
            <button type="button" class="btn-close position-absolute" data-bs-dismiss="modal" aria-label="${txt ? txt.modalClose : 'Close'}"></button>
            <div class="modal-header border-0 pb-0 pt-4 px-4">
              <h5 class="modal-title fw-bold pe-4" id="credentialModalTitle"></h5>
            </div>
            <div class="modal-body p-4 text-center">
              <img id="credentialModalImage" src="" alt="" class="img-fluid rounded-3 mb-3 shadow">
              <p id="credentialModalSummary" class="credential-modal-summary small mb-3"></p>
              <a id="credentialModalDownload" href="#" download="" target="_blank" class="btn btn-primary btn-sm rounded-pill px-4 py-2 fw-semibold shadow-sm">
                <i class="fa-solid fa-download me-1.5"></i> <span id="credentialModalDownloadText">${txt ? txt.downloadButton : 'Download'}</span>
              </a>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalEl);
    }
  }

  async function fetchCredentialsData() {
    try {
      const res = await fetch(dataPath);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      state.data = json;
      state.isLoading = false;
      if (json.items && json.items.length > 0) {
        state.activeItemId = json.items[0].id;
      }
    } catch (err) {
      console.warn('[about-credentials] Failed to load credentials.json:', err);
      state.loadError = true;
      state.isLoading = false;
    }
  }

  function getFilteredItems() {
    if (!state.data || !Array.isArray(state.data.items)) return [];
    return state.data.items.filter((item) => {
      const typeMatch = state.activeType === 'all' || item.type === state.activeType;
      const catMatch = state.activeCategory === 'all' || item.category === state.activeCategory;
      return typeMatch && catMatch;
    });
  }

  function render(container) {
    const lang = getLang();
    const txt = uiText[lang] || uiText['en'];

    ensureModalExists(txt);

    if (state.isLoading) {
      container.innerHTML = `
        <div class="credentials-card text-center p-4">
          <div class="spinner-border text-primary spinner-border-sm mb-2" role="status"></div>
          <p class="credentials-loading-text mb-0">${txt.loading}</p>
        </div>
      `;
      return;
    }

    if (state.loadError || !state.data) {
      container.innerHTML = `
        <div class="credentials-card text-center p-4">
          <p class="credentials-loading-text mb-0">${txt.loadFailed}</p>
        </div>
      `;
      return;
    }

    const filteredItems = getFilteredItems();

    // Ensure activeItemId is valid inside filtered list
    if (filteredItems.length > 0) {
      const exists = filteredItems.some((it) => it.id === state.activeItemId);
      if (!exists) {
        state.activeItemId = filteredItems[0].id;
      }
    } else {
      state.activeItemId = null;
    }

    const currentItem = filteredItems.find((it) => it.id === state.activeItemId) || null;
    const currentIndex = filteredItems.findIndex((it) => it.id === state.activeItemId);

    // Type Chips
    const typeChipsHtml = (state.data.types || []).map((t) => {
      const isActive = state.activeType === t.id;
      const labelStr = getLocalizedText(t.label, lang);
      return `
        <button type="button" 
                class="credential-chip ${isActive ? 'active' : ''}" 
                data-cred-type="${t.id}"
                aria-pressed="${isActive}">
          ${labelStr}
        </button>
      `;
    }).join('');

    // Category Chips
    const catChipsHtml = (state.data.categories || []).map((c) => {
      const isActive = state.activeCategory === c.id;
      const labelStr = getLocalizedText(c.label, lang);
      return `
        <button type="button" 
                class="credential-chip ${isActive ? 'active' : ''}" 
                data-cred-cat="${c.id}"
                aria-pressed="${isActive}">
          ${labelStr}
        </button>
      `;
    }).join('');

    // Thumbnail strip html
    const thumbsHtml = filteredItems.map((item) => {
      const isActive = item.id === state.activeItemId;
      const itemTitle = getLocalizedText(item.title, lang);
      const imgSrc = item.thumbnail || item.image || 'assets/images/cover.jpg';
      return `
        <button type="button" 
                class="credential-thumb-item ${isActive ? 'active' : ''}"
                data-cred-item-id="${item.id}"
                title="${itemTitle}">
          <img src="${imgSrc}" alt="${itemTitle}" loading="lazy">
        </button>
      `;
    }).join('');

    // Active showcase view html
    let showcaseHtml = '';
    if (currentItem) {
      const titleStr = getLocalizedText(currentItem.title, lang);
      const issuerStr = getLocalizedText(currentItem.issuer, lang);
      const summaryStr = getLocalizedText(currentItem.summary, lang);
      const detailStr = getLocalizedText(currentItem.detail, lang);
      const fullDesc = summaryStr ? (detailStr ? `${summaryStr} ${detailStr}` : summaryStr) : detailStr;

      const typeObj = (state.data.types || []).find((t) => t.id === currentItem.type);
      const catObj = (state.data.categories || []).find((c) => c.id === currentItem.category);
      const typeLabel = typeObj ? getLocalizedText(typeObj.label, lang) : currentItem.type;
      const catLabel = catObj ? getLocalizedText(catObj.label, lang) : currentItem.category;
      const imgSrc = currentItem.image || 'assets/images/cover.jpg';

      showcaseHtml = `
        <div class="row g-4 align-items-center">
          <div class="col-lg-6">
            <div class="credential-image-wrapper rounded-3 overflow-hidden shadow-sm position-relative" 
                 data-cred-lightbox="trigger"
                 style="cursor: pointer;"
                 title="${txt.zoomHint}">
              <img src="${imgSrc}" alt="${titleStr}" class="img-fluid w-100 object-fit-cover">
              <div class="credential-image-overlay d-flex align-items-center justify-content-center">
                <span class="btn btn-sm btn-light shadow-sm fw-semibold">
                  <i class="fa-solid fa-magnifying-glass-plus me-1"></i> ${txt.zoomButton}
                </span>
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="credential-info">
              <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span class="credential-badge-type text-uppercase">${typeLabel}</span>
                <span class="credential-badge-domain text-uppercase">${catLabel}</span>
                <span class="credential-badge-date">${currentItem.date}</span>
              </div>

              <h4 class="fw-bold mb-2">${titleStr}</h4>
              <p class="credential-issuer small mb-3"><i class="fa-solid fa-building-columns me-1"></i> <strong>${txt.issuerLabel}:</strong> ${issuerStr}</p>

              <div class="credential-description mb-3">
                <p class="mb-0">${fullDesc}</p>
              </div>

              <div class="d-flex flex-wrap gap-2">
                <button type="button" 
                        class="btn btn-sm btn-outline-primary rounded-pill credential-action-btn" 
                        data-cred-lightbox="trigger">
                  <i class="fa-solid fa-magnifying-glass-plus me-1"></i> ${txt.zoomButton}
                </button>
                <a href="${imgSrc}" 
                   download="${currentItem.id}.png" 
                   target="_blank" 
                   class="btn btn-sm btn-outline-secondary rounded-pill credential-action-btn credential-download-btn">
                  <i class="fa-solid fa-download me-1"></i> ${txt.downloadButton}
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      showcaseHtml = `
        <div class="text-center p-5 credentials-empty-box">
          <i class="fa-solid fa-folder-open fs-2 mb-2 d-block"></i>
          <p class="mb-0">${txt.empty}</p>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="credentials-section-wrapper">
        <div class="credentials-header text-center mb-4">
          <span class="credentials-kicker text-uppercase fw-semibold mb-1 d-block">${txt.kicker}</span>
          <h3 class="credentials-title fw-bold mb-2">${txt.title}</h3>
          <p class="credentials-intro mx-auto" style="max-width: 650px;">${txt.intro}</p>
        </div>

        <div class="credentials-card p-4 rounded-4 shadow-sm">
          <!-- Filters -->
          <div class="credentials-filters mb-4 pb-3 border-bottom">
            <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3 mb-2">
              <span class="credential-filter-label fw-bold text-nowrap small text-uppercase"><i class="fa-solid fa-filter me-1"></i>${txt.typeLabel}:</span>
              <div class="d-flex flex-wrap gap-2">
                ${typeChipsHtml}
              </div>
            </div>
            <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
              <span class="credential-filter-label fw-bold text-nowrap small text-uppercase"><i class="fa-solid fa-tags me-1"></i>${txt.categoryLabel}:</span>
              <div class="d-flex flex-wrap gap-2">
                ${catChipsHtml}
              </div>
            </div>
          </div>

          <!-- Main Showcase Viewport -->
          <div class="credentials-showcase-viewport mb-4">
            ${showcaseHtml}
          </div>

          <!-- Thumbnail Option Carousel Bar -->
          ${filteredItems.length > 0 ? `
            <div class="credentials-thumb-bar d-flex align-items-center pt-3 border-top">
              <button type="button" 
                      class="btn btn-outline-secondary btn-sm rounded-circle cred-thumb-arrow cred-thumb-prev me-2"
                      data-cred-thumb-nav="prev"
                      aria-label="${txt.prevItem}"
                      ${currentIndex <= 0 ? 'disabled' : ''}>
                <i class="fa-solid fa-chevron-left"></i>
              </button>

              <div class="cred-thumb-strip d-flex gap-2 flex-grow-1 overflow-x-auto py-1">
                ${thumbsHtml}
              </div>

              <button type="button" 
                      class="btn btn-outline-secondary btn-sm rounded-circle cred-thumb-arrow cred-thumb-next ms-2"
                      data-cred-thumb-nav="next"
                      aria-label="${txt.nextItem}"
                      ${currentIndex >= filteredItems.length - 1 ? 'disabled' : ''}>
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    bindEvents(container, currentItem, filteredItems);
  }

  function bindEvents(container, currentItem, filteredItems) {
    // Type Filter Click
    container.querySelectorAll('[data-cred-type]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const type = e.currentTarget.getAttribute('data-cred-type');
        if (type && type !== state.activeType) {
          state.activeType = type;
          render(container);
        }
      });
    });

    // Category Filter Click
    container.querySelectorAll('[data-cred-cat]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const cat = e.currentTarget.getAttribute('data-cred-cat');
        if (cat && cat !== state.activeCategory) {
          state.activeCategory = cat;
          render(container);
        }
      });
    });

    // Thumbnail Click
    container.querySelectorAll('[data-cred-item-id]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = e.currentTarget.getAttribute('data-cred-item-id');
        if (id && id !== state.activeItemId) {
          state.activeItemId = id;
          render(container);
        }
      });
    });

    // Thumbnail Nav Arrows
    const prevBtn = container.querySelector('[data-cred-thumb-nav="prev"]');
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = filteredItems.findIndex((it) => it.id === state.activeItemId);
        if (idx > 0) {
          state.activeItemId = filteredItems[idx - 1].id;
          render(container);
        }
      });
    }

    const nextBtn = container.querySelector('[data-cred-thumb-nav="next"]');
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = filteredItems.findIndex((it) => it.id === state.activeItemId);
        if (idx >= 0 && idx < filteredItems.length - 1) {
          state.activeItemId = filteredItems[idx + 1].id;
          render(container);
        }
      });
    }

    // Lightbox Triggers
    container.querySelectorAll('[data-cred-lightbox="trigger"]').forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!currentItem) return;
        const lang = getLang();
        const txt = uiText[lang] || uiText['en'];
        ensureModalExists(txt);

        const titleStr = getLocalizedText(currentItem.title, lang);
        const summaryStr = getLocalizedText(currentItem.summary, lang);
        const detailStr = getLocalizedText(currentItem.detail, lang);
        const fullDesc = summaryStr ? (detailStr ? `${summaryStr} ${detailStr}` : summaryStr) : detailStr;
        const imgSrc = currentItem.image || 'assets/images/cover.jpg';

        const modalEl = document.getElementById('credentialModal');
        const modalTitle = document.getElementById('credentialModalTitle');
        const modalImg = document.getElementById('credentialModalImage');
        const modalSummary = document.getElementById('credentialModalSummary');
        const modalDl = document.getElementById('credentialModalDownload');
        const modalDlText = document.getElementById('credentialModalDownloadText');

        if (modalEl && window.bootstrap && window.bootstrap.Modal) {
          if (modalTitle) modalTitle.textContent = titleStr;
          if (modalImg) {
            modalImg.src = imgSrc;
            modalImg.alt = titleStr;
          }
          if (modalSummary) modalSummary.textContent = fullDesc;
          if (modalDl) {
            modalDl.href = imgSrc;
            modalDl.download = `${currentItem.id}.png`;
          }
          if (modalDlText) modalDlText.textContent = txt.downloadButton;

          const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
          modal.show();
        }
      });
    });
  }

  async function init() {
    const container = document.querySelector(rootSelector);
    if (!container) return;

    render(container);
    await fetchCredentialsData();
    render(container);

    if (langRuntime && typeof langRuntime.onLangChange === 'function') {
      langRuntime.onLangChange(() => {
        render(container);
      });
    }

    window.addEventListener('ludwig-language-changed', () => {
      render(container);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
