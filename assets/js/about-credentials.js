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
      kicker: 'Achievements',
      title: 'Achievements',
      intro: 'Certificates, official transcripts, honor awards, admission offers, and competition achievements. Filter by type or domain to explore.',
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
      kicker: '成就',
      title: '成就',
      intro: '包含學術證書、歷年成績單、榮譽獎項、頂尖名校錄取通知與競賽參賽證明。可依據「種類」或「領域」進行篩選與檢視。',
      typeLabel: '種類',
      categoryLabel: '領域',
      loading: '正在載入資歷資料...',
      loadFailed: '目前無法載入資歷資料。',
      empty: '沒有符合目前篩選條件的項目。',
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
      kicker: '成就',
      title: '成就',
      intro: '包含学术证书、历年成绩单、荣誉奖项、顶尖名校录取通知与竞赛参赛证明。可依据“种类”或“领域”进行筛选与检视。',
      typeLabel: '种类',
      categoryLabel: '领域',
      loading: '正在载入资历数据...',
      loadFailed: '目前无法载入资历数据。',
      empty: '没有符合当前筛选条件的项目。',
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
        <div class="modal-dialog modal-dialog-centered modal-xl">
          <div class="modal-content credential-modal-content">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title h6 fw-bold" id="credentialModalTitle"></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="${txt.modalClose}"></button>
            </div>
            <div class="modal-body text-center p-3" id="credentialModalBody">
              <img id="credentialModalImage" src="" alt="" class="img-fluid rounded shadow-sm credential-modal-img d-none">
              <iframe id="credentialModalPdf" src="" class="w-100 rounded border-0 d-none" style="height: 72vh; min-height: 500px;"></iframe>
            </div>
            <div class="modal-footer border-0 pt-0 justify-content-between">
              <a id="credentialModalDownloadBtn" href="#" download target="_blank" class="btn btn-outline-primary btn-sm rounded-pill px-3">
                <i class="fa-solid fa-download me-1"></i> <span id="credentialModalDownloadText">${txt.downloadButton}</span>
              </a>
              <button type="button" class="btn btn-secondary btn-sm rounded-pill px-3" data-bs-dismiss="modal">${txt.modalClose}</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalEl);
    }
  }

  async function fetchCredentialsData() {
    state.isLoading = true;
    state.loadError = false;
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
    }).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
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

    // Active labels for dropdown triggers
    const activeTypeObj = (state.data.types || []).find((t) => t.id === state.activeType);
    const activeTypeLabel = activeTypeObj ? getLocalizedText(activeTypeObj.label, lang) : txt.typeLabel;

    const activeCatObj = (state.data.categories || []).find((c) => c.id === state.activeCategory);
    const activeCatLabel = activeCatObj ? getLocalizedText(activeCatObj.label, lang) : txt.categoryLabel;

    // Type Dropdown Items
    const typeMenuItemsHtml = (state.data.types || []).map((t) => {
      const isActive = state.activeType === t.id;
      const labelStr = getLocalizedText(t.label, lang);
      return `
        <li>
          <button class="dropdown-item credential-dropdown-item d-flex align-items-center justify-content-between gap-3 ${isActive ? 'active' : ''}" 
                  type="button" 
                  data-cred-type-select="${t.id}">
            <span>${labelStr}</span>
            ${isActive ? '<i class="fa-solid fa-check small ms-2" style="color: var(--site-accent, var(--accent, #ff6b00));"></i>' : ''}
          </button>
        </li>
      `;
    }).join('');

    // Category Dropdown Items
    const catMenuItemsHtml = (state.data.categories || []).map((c) => {
      const isActive = state.activeCategory === c.id;
      const labelStr = getLocalizedText(c.label, lang);
      return `
        <li>
          <button class="dropdown-item credential-dropdown-item d-flex align-items-center justify-content-between gap-3 ${isActive ? 'active' : ''}" 
                  type="button" 
                  data-cred-cat-select="${c.id}">
            <span>${labelStr}</span>
            ${isActive ? '<i class="fa-solid fa-check small ms-2" style="color: var(--site-accent, var(--accent, #ff6b00));"></i>' : ''}
          </button>
        </li>
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
    const showcaseHtml = getShowcaseHtml(currentItem, lang, txt);

    container.innerHTML = `
      <div class="credentials-section-wrapper">
        <div class="credentials-header text-center mb-4">
          <span class="credentials-kicker text-uppercase fw-semibold mb-1 d-block">${txt.kicker}</span>
          <h3 class="credentials-title fw-bold mb-2">${txt.title}</h3>
          <p class="credentials-intro mx-auto" style="max-width: 650px;">${txt.intro}</p>
        </div>

        <div class="credentials-card p-4 rounded-4 shadow-sm">
          <!-- Custom Filters -->
          <div class="credentials-filters mb-4 pb-3 border-bottom">
            <div class="d-flex flex-wrap align-items-center justify-content-start gap-3">
              
              <!-- Type Dropdown -->
              <div class="dropdown credential-dropdown">
                <button class="btn credential-filter-btn dropdown-toggle d-flex align-items-center gap-2 shadow-none" 
                        type="button" 
                        id="credTypeDropdown" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false">
                  <span class="text-secondary small text-uppercase fw-semibold"><i class="fa-solid fa-filter me-1"></i>${txt.typeLabel}:</span>
                  <span class="credential-filter-val fw-bold">${activeTypeLabel}</span>
                </button>
                <ul class="dropdown-menu credential-dropdown-menu shadow-lg border-0 rounded-3" aria-labelledby="credTypeDropdown">
                  ${typeMenuItemsHtml}
                </ul>
              </div>

              <!-- Domain Dropdown -->
              <div class="dropdown credential-dropdown">
                <button class="btn credential-filter-btn dropdown-toggle d-flex align-items-center gap-2 shadow-none" 
                        type="button" 
                        id="credCatDropdown" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false">
                  <span class="text-secondary small text-uppercase fw-semibold"><i class="fa-solid fa-tags me-1"></i>${txt.categoryLabel}:</span>
                  <span class="credential-filter-val fw-bold">${activeCatLabel}</span>
                </button>
                <ul class="dropdown-menu credential-dropdown-menu shadow-lg border-0 rounded-3" aria-labelledby="credCatDropdown">
                  ${catMenuItemsHtml}
                </ul>
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

  function getShowcaseHtml(currentItem, lang, txt) {
    if (!currentItem) {
      return `
        <div class="text-center p-5 credentials-empty-box">
          <i class="fa-solid fa-folder-open fs-2 mb-2 d-block"></i>
          <p class="mb-0">${txt.empty}</p>
        </div>
      `;
    }

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
    const docSrc = currentItem.document || currentItem.pdf || currentItem.image || 'assets/images/cover.jpg';
    const docExt = docSrc.split('.').pop() || 'png';

    const mediaHtml = `<img src="${imgSrc}" alt="${titleStr}" class="img-fluid w-100 object-fit-cover rounded-3">`;

    return `
      <div class="row g-4 align-items-center">
        <div class="col-lg-6">
          <div class="credential-image-wrapper rounded-3 overflow-hidden shadow-sm position-relative" 
               data-cred-lightbox="trigger"
               style="cursor: pointer;"
               title="${txt.zoomHint}">
            ${mediaHtml}
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
              <a href="${docSrc}" 
                 download="${currentItem.id}.${docExt}" 
                 target="_blank" 
                 class="btn btn-sm btn-outline-secondary rounded-pill credential-action-btn credential-download-btn">
                <i class="fa-solid fa-download me-1"></i> ${txt.downloadButton}
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function updateActiveItem(container, itemId, filteredItems) {
    if (!itemId) return;
    state.activeItemId = itemId;
    const lang = getLang();
    const txt = uiText[lang] || uiText['en'];

    const currentItem = filteredItems.find((it) => it.id === itemId);
    const showcaseViewport = container.querySelector('.credentials-showcase-viewport');
    if (showcaseViewport && currentItem) {
      showcaseViewport.innerHTML = getShowcaseHtml(currentItem, lang, txt);
      bindLightboxEvents(container, currentItem);
    }

    container.querySelectorAll('.credential-thumb-item').forEach((btn) => {
      const bId = btn.getAttribute('data-cred-item-id');
      if (bId === itemId) {
        btn.classList.add('active');
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      } else {
        btn.classList.remove('active');
      }
    });

    const idx = filteredItems.findIndex((it) => it.id === itemId);
    const prevBtn = container.querySelector('[data-cred-thumb-nav="prev"]');
    const nextBtn = container.querySelector('[data-cred-thumb-nav="next"]');
    if (prevBtn) prevBtn.disabled = (idx <= 0);
    if (nextBtn) nextBtn.disabled = (idx < 0 || idx >= filteredItems.length - 1);
  }

  function bindEvents(container, currentItem, filteredItems) {
    // Type Filter Select Items
    container.querySelectorAll('[data-cred-type-select]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const type = e.currentTarget.getAttribute('data-cred-type-select');
        if (type && type !== state.activeType) {
          state.activeType = type;
          render(container);
        }
      });
    });

    // Category Filter Select Items
    container.querySelectorAll('[data-cred-cat-select]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const cat = e.currentTarget.getAttribute('data-cred-cat-select');
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
          updateActiveItem(container, id, filteredItems);
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
          updateActiveItem(container, filteredItems[idx - 1].id, filteredItems);
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
          updateActiveItem(container, filteredItems[idx + 1].id, filteredItems);
        }
      });
    }

    bindLightboxEvents(container, currentItem);
  }

  function bindLightboxEvents(container, currentItem) {
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
        const docSrc = currentItem.document || currentItem.pdf || currentItem.image || 'assets/images/cover.jpg';
        const docExt = docSrc.split('.').pop() || 'pdf';

        const modalEl = document.getElementById('credentialModal');
        const modalTitle = document.getElementById('credentialModalTitle');
        const modalImg = document.getElementById('credentialModalImage');
        const modalPdf = document.getElementById('credentialModalPdf');
        const modalSummary = document.getElementById('credentialModalSummary');
        const modalDl = document.getElementById('credentialModalDownloadBtn');
        const modalDlText = document.getElementById('credentialModalDownloadText');

        if (modalEl && window.bootstrap && window.bootstrap.Modal) {
          if (modalTitle) modalTitle.textContent = titleStr;

          const isPdf = docSrc.toLowerCase().endsWith('.pdf');
          if (isPdf) {
            if (modalImg) modalImg.classList.add('d-none');
            if (modalPdf) {
              modalPdf.src = docSrc;
              modalPdf.classList.remove('d-none');
            }
          } else {
            if (modalPdf) {
              modalPdf.src = '';
              modalPdf.classList.add('d-none');
            }
            if (modalImg) {
              modalImg.src = imgSrc;
              modalImg.alt = titleStr;
              modalImg.classList.remove('d-none');
            }
          }

          if (modalSummary) modalSummary.textContent = fullDesc;
          if (modalDl) {
            modalDl.href = docSrc;
            modalDl.download = `${currentItem.id}.${docExt}`;
            modalDl.target = '_blank';
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
