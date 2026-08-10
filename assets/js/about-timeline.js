(() => {
  const rootSelector = '[data-about-timeline-root]';
  const langRuntime = window.LudwigLanguage || null;
  const cipherRuntime = window.LudwigCipherMode || null;
  const stageConfigs = {
    1: { minMagnitude: 3, visibleCount: 2, cardWidth: 300, gap: 28, labelEvery: 2, showEventTicks: false, showMinorTicks: false },
    2: { minMagnitude: 2, visibleCount: 2, cardWidth: 300, gap: 28, labelEvery: 1, showEventTicks: true, showMinorTicks: false },
    3: { minMagnitude: 1, visibleCount: 2, cardWidth: 300, gap: 28, labelEvery: 1, showEventTicks: true, showMinorTicks: true },
  };
  const scaleVisibility = {
    macro: [1, 2, 3],
    meso: [2, 3],
    micro: [3],
  };
  const timelineLayout = {
    railPadStart: 64,
    railPadEnd: 72,
    dividerOffset: 18,
    pointOffset: 44,
  };
  const timelineDataRelativePath = 'data/Timeline/timeline.json';

  const state = {
    stage: 1,
    offset: 0,
    activeId: null,
    dragStartX: null,
    dragOffsetStart: 0,
    dragTranslateStart: 0,
    dragLiveTranslate: null,
    isLoading: true,
    loadError: false,
  };

  const uiText = {
    en: {
      kicker: 'Path So Far',
      title: 'Timeline',
      cipherTitle: 'Chronology',
      intro:
        'Not a resume, and not quite a diary either. More like a shifting map of how certain turns, phases, and obsessions gradually shaped the person standing here now.',
      detailTitle: 'Focused Event',
      pointLabel: 'Point Event',
      periodStartLabel: 'Start',
      periodEndLabel: 'End',
      periodPresentLabel: 'Present',
      presentClusterTitle: 'Current Ongoing Phases',
      presentClusterListLabel: 'Currently Ongoing',
      durationLabel: 'Duration',
      referencesLabel: 'Related Links',
      categories: {
        education: 'Education',
        internship: 'Internship',
        work: 'Work',
      },
      loadingDetail: 'Loading timeline...',
      loadFailedDetail: 'Unable to load timeline right now.',
      emptyDetail: 'Select an event to read more.',
      previous: 'Go earlier',
      next: 'Go later',
      keyboardHint: 'Use ← / → to move the timeline',
      viewportLabel: 'Interactive timeline viewport',
      stagePrefix: 'Scale',
      stages: {
        1: { label: 'Macro Scale' },
        2: { label: 'Meso Scale' },
        3: { label: 'Micro Scale' },
      },
      presentClusterSummary(count) {
        return count === 1 ? '1 ongoing phase is active here.' : `${count} ongoing phases are active here.`;
      },
      presentClusterDetail(count) {
        return count === 1
          ? 'This cluster groups the timeline phase that is still in progress.'
          : 'This cluster groups the timeline phases that are still in progress.';
      },
    },
    'zh-Hant': {
      kicker: '一路走來',
      title: '時間軸',
      cipherTitle: 'Chronology',
      intro:
        '這不是履歷，也不完全是日記；比較像一張還在變動的地圖，慢慢把那些轉折、階段與長期執念怎麼把我塑造成現在的樣子勾出來。',
      detailTitle: '目前聚焦事件',
      pointLabel: '單點事件',
      periodStartLabel: '開始',
      periodEndLabel: '結束',
      periodPresentLabel: '至今',
      presentClusterTitle: '目前進行中',
      presentClusterListLabel: '目前進行中的階段',
      durationLabel: '期間',
      referencesLabel: '延伸連結',
      categories: {
        education: '學歷',
        internship: '實習',
        work: '工作',
      },
      loadingDetail: '正在載入 timeline...',
      loadFailedDetail: '目前無法載入 timeline 資料。',
      emptyDetail: '點擊任一事件即可查看更多內容。',
      previous: '往更早',
      next: '往更晚',
      keyboardHint: '可用鍵盤 ← / → 左右移動 timeline',
      viewportLabel: '可互動的時間線視窗',
      stagePrefix: 'Scale',
      stages: {
        1: { label: '宏觀尺度' },
        2: { label: '中觀尺度' },
        3: { label: '微觀尺度' },
      },
      presentClusterSummary(count) {
        return count === 1 ? '這裡收斂了 1 個仍在進行中的階段。' : `這裡收斂了 ${count} 個仍在進行中的階段。`;
      },
      presentClusterDetail(count) {
        return count === 1
          ? '這個 cluster 把目前仍在進行中的 timeline 階段收斂在一起。'
          : '這個 cluster 把目前仍在進行中的 timeline 階段收斂在一起。';
      },
    },
    'zh-Hans': {
      kicker: '一路走来',
      title: '时间轴',
      cipherTitle: 'Chronology',
      intro:
        '这不是履历，也不完全是日记；更像一张仍在变化的地图，慢慢把那些转折、阶段与长期执念怎样把我塑造成现在的样子勾出来。',
      detailTitle: '当前聚焦事件',
      pointLabel: '单点事件',
      periodStartLabel: '开始',
      periodEndLabel: '结束',
      periodPresentLabel: '至今',
      presentClusterTitle: '当前进行中',
      presentClusterListLabel: '当前进行中的阶段',
      durationLabel: '期间',
      referencesLabel: '延伸链接',
      categories: {
        education: '学历',
        internship: '实习',
        work: '工作',
      },
      loadingDetail: '正在载入 timeline...',
      loadFailedDetail: '目前无法载入 timeline 资料。',
      emptyDetail: '点击任一事件即可查看更多内容。',
      previous: '往更早',
      next: '往更晚',
      keyboardHint: '可用键盘 ← / → 左右移动 timeline',
      viewportLabel: '可互动的时间线视窗',
      stagePrefix: 'Scale',
      stages: {
        1: { label: '宏观尺度' },
        2: { label: '中观尺度' },
        3: { label: '微观尺度' },
      },
      presentClusterSummary(count) {
        return count === 1 ? '这里收敛了 1 个仍在进行中的阶段。' : `这里收敛了 ${count} 个仍在进行中的阶段。`;
      },
      presentClusterDetail(count) {
        return count === 1
          ? '这个 cluster 把目前仍在进行中的 timeline 阶段收敛在一起。'
          : '这个 cluster 把目前仍在进行中的 timeline 阶段收敛在一起。';
      },
    },
  };

  let events = [];

  const getLang = () => {
    if (langRuntime && typeof langRuntime.getCurrentLang === 'function') {
      return langRuntime.getCurrentLang();
    }
    return 'en';
  };

  const isCipherMode = () => {
    if (cipherRuntime && typeof cipherRuntime.isEnabled === 'function') {
      return cipherRuntime.isEnabled();
    }
    return document.documentElement.classList.contains('cipher-mode');
  };

  const isMobile = () => window.matchMedia('(max-width: 991.98px)').matches;

  const readLocalized = (value, lang) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value[lang] || value.en || '';
  };

  const buildTimelineDataCandidates = () => {
    const candidates = [timelineDataRelativePath];
    if (window.location.protocol !== 'file:' && window.location.origin) {
      candidates.push(new URL(`/${timelineDataRelativePath}`, window.location.origin).href);
    }
    return [...new Set(candidates)];
  };

  const mapScaleToMagnitude = (scale) => {
    if (scale === 'macro') return 'major';
    if (scale === 'meso') return 'medium';
    return 'minor';
  };

  const getPresentSortKey = () => {
    const now = new Date();
    const year = `${now.getFullYear()}`;
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    const day = `${now.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const normalizeTimelineDateString = (value) => {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (!raw) return '';
    if (raw.toLowerCase() === 'present') return 'present';
    if (/^\d{4}$/.test(raw)) return raw;
    if (/^\d{4}-\d{2}$/.test(raw)) return raw;
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    if (/^\d{4}\.\d{2}$/.test(raw)) return raw.replace('.', '-');
    if (/^\d{4}\.\d{4}$/.test(raw)) return `${raw.slice(0, 4)}-${raw.slice(5, 7)}-${raw.slice(7, 9)}`;
    if (/^\d{4}\.\d{2}\.\d{2}$/.test(raw)) return raw.replace(/\./g, '-');
    return '';
  };

  const buildTimelineSortKey = (value) => {
    const normalized = normalizeTimelineDateString(value);
    if (!normalized || normalized === 'present') return '';
    if (/^\d{4}$/.test(normalized)) return `${normalized}0000`;
    if (/^\d{4}-\d{2}$/.test(normalized)) return normalized.replace('-', '') + '00';
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized.replace(/-/g, '');
    return '';
  };

  const normalizeLocalizedText = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value !== 'object' || Array.isArray(value)) return '';

    const localized = {};
    Object.entries(value).forEach(([lang, text]) => {
      if (typeof text === 'string' && text.trim()) {
        localized[lang] = text.trim();
      }
    });
    return Object.keys(localized).length ? localized : '';
  };

  const normalizeReferences = (references) => {
    if (!Array.isArray(references)) return [];

    return references
      .map((reference) => {
        if (!reference || typeof reference !== 'object') return null;
        const href = typeof reference.href === 'string' ? reference.href.trim() : '';
        if (!href) return null;
        const label = normalizeLocalizedText(reference.label);
        if (!label) return null;
        return {
          href,
          label,
          kind: typeof reference.kind === 'string' ? reference.kind : undefined,
        };
      })
      .filter(Boolean);
  };

  const normalizeEvent = (rawEvent) => {
    if (!rawEvent || typeof rawEvent !== 'object') return null;

    const id = typeof rawEvent.id === 'string' ? rawEvent.id.trim() : '';
    const type = rawEvent.type === 'period' ? 'period' : rawEvent.type === 'point' ? 'point' : '';
    const scale = rawEvent.scale === 'macro' || rawEvent.scale === 'meso' || rawEvent.scale === 'micro'
      ? rawEvent.scale
      : rawEvent.magnitude === 'major'
        ? 'macro'
        : rawEvent.magnitude === 'medium'
          ? 'meso'
          : rawEvent.magnitude === 'minor'
            ? 'micro'
            : '';
    const category = rawEvent.category === 'education' || rawEvent.category === 'internship' || rawEvent.category === 'work'
      ? rawEvent.category
      : '';

    if (!id || !type || !scale) return null;

    const title = normalizeLocalizedText(rawEvent.title);
    const summary = normalizeLocalizedText(rawEvent.summary);
    const detail = normalizeLocalizedText(rawEvent.detail);
    if (!title || !summary) return null;

    const normalized = {
      id,
      type,
      scale,
      magnitude: mapScaleToMagnitude(scale),
      title,
      summary,
      detail,
      references: normalizeReferences(rawEvent.references),
      category,
    };

    if (type === 'point') {
      const rawYear = typeof rawEvent.at === 'string' ? rawEvent.at.trim() : typeof rawEvent.year === 'string' ? rawEvent.year.trim() : '';
      const year = normalizeTimelineDateString(rawYear);
      if (!year) return null;
      return {
        ...normalized,
        year,
        sortKey: buildTimelineSortKey(year),
      };
    }

    const startYear = normalizeTimelineDateString(
      typeof rawEvent.start === 'string'
        ? rawEvent.start.trim()
        : typeof rawEvent.startYear === 'string'
          ? rawEvent.startYear.trim()
          : '',
    );
    const rawEndYear = normalizeTimelineDateString(
      typeof rawEvent.end === 'string'
        ? rawEvent.end.trim()
        : typeof rawEvent.endYear === 'string'
          ? rawEvent.endYear.trim()
          : '',
    );
    const isOngoing = rawEndYear.toLowerCase() === 'present';
    const endYear = isOngoing ? getPresentSortKey() : rawEndYear;
    if (!startYear || !endYear) return null;

    return {
      ...normalized,
      startYear,
      endYear,
      startSortKey: buildTimelineSortKey(startYear),
      endSortKey: isOngoing ? buildTimelineSortKey(getPresentSortKey()) : buildTimelineSortKey(endYear),
      isOngoing,
      label: normalizeLocalizedText(rawEvent.label),
      startTitle: normalizeLocalizedText(rawEvent.start_title),
      startSummary: normalizeLocalizedText(rawEvent.start_summary),
      startDetail: normalizeLocalizedText(rawEvent.start_detail),
      endTitle: normalizeLocalizedText(rawEvent.end_title),
      endSummary: normalizeLocalizedText(rawEvent.end_summary),
      endDetail: normalizeLocalizedText(rawEvent.end_detail),
    };
  };

  const loadTimelineData = async () => {
    state.isLoading = true;
    state.loadError = false;

    try {
      let payload = null;
      let lastError = null;

      for (const candidate of buildTimelineDataCandidates()) {
        try {
          const response = await fetch(candidate, { cache: 'no-store' });
          if (!response.ok) {
            throw new Error(`Timeline fetch failed: ${response.status}`);
          }
          payload = await response.json();
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!payload || !Array.isArray(payload.events)) {
        throw lastError || new Error('Timeline payload is invalid.');
      }

      events = payload.events.map(normalizeEvent).filter(Boolean);
      state.activeId = events[0] ? events[0].id : null;
      state.offset = 0;
      state.loadError = false;
    } catch (error) {
      console.error('[about-timeline] Failed to load timeline data.', error);
      events = [];
      state.activeId = null;
      state.offset = 0;
      state.loadError = true;
    } finally {
      state.isLoading = false;
    }
  };

  const syncTimelineNavLabels = () => {
    const label = isCipherMode() ? 'Chronology' : 'Timeline';
    document.querySelectorAll('[data-nav-timeline]').forEach((el) => {
      el.textContent = label;
      el.setAttribute('aria-label', label);
      el.setAttribute('title', label);
    });
  };

  const getStageConfig = () => stageConfigs[state.stage] || stageConfigs[1];

  const expandEventForTimeline = (event, baseOrder) => {
    if (event.type === 'point') {
      return [
        {
          ...event,
          timelineType: 'point',
          timelineOrder: baseOrder,
        },
      ];
    }

    return [
      {
        ...event,
        id: `${event.id}--start`,
        type: 'point',
        year: event.startYear,
        sortKey: event.startSortKey,
        title: event.startTitle || event.title,
        summary: event.startSummary || event.summary,
        detail: event.startDetail || event.detail,
        timelineType: 'period-start',
        sourceEventId: event.id,
        timelineOrder: baseOrder,
      },
      {
        ...event,
        id: `${event.id}--end`,
        type: 'point',
        year: event.endYear,
        sortKey: event.endSortKey,
        displayYear: event.isOngoing ? 'present' : event.endYear,
        title: event.endTitle || event.title,
        summary: event.endSummary || event.summary,
        detail: event.endDetail || event.detail,
        timelineType: 'period-end',
        sourceEventId: event.id,
        isOngoing: Boolean(event.isOngoing),
        timelineOrder: baseOrder + 1,
      },
    ];
  };

  const getClusterMagnitude = (clusterEvents) => {
    if (clusterEvents.some((event) => event.magnitude === 'major')) return 'major';
    if (clusterEvents.some((event) => event.magnitude === 'medium')) return 'medium';
    return 'minor';
  };

  const buildPresentCluster = (visibleEvents) => {
    const ongoingEndEvents = visibleEvents.filter((event) => event.timelineType === 'period-end' && event.isOngoing);
    if (!ongoingEndEvents.length) return visibleEvents;

    const lang = getLang();
    const text = uiText[lang] || uiText.en;
    const lastTimelineOrder = ongoingEndEvents.reduce((maxValue, event) => Math.max(maxValue, event.timelineOrder || 0), 0);
    const clusterEvent = {
      id: 'timeline-present-cluster',
      type: 'point',
      year: getPresentSortKey(),
      sortKey: buildTimelineSortKey(getPresentSortKey()),
      displayYear: 'present',
      timelineType: 'present-cluster',
      title: text.presentClusterTitle,
      summary: text.presentClusterSummary(ongoingEndEvents.length),
      detail: text.presentClusterDetail(ongoingEndEvents.length),
      references: [],
      magnitude: getClusterMagnitude(ongoingEndEvents),
      scale: ongoingEndEvents[0].scale,
      timelineOrder: lastTimelineOrder + 1,
      childEvents: ongoingEndEvents,
    };

    return [
      ...visibleEvents.filter((event) => !(event.timelineType === 'period-end' && event.isOngoing)),
      clusterEvent,
    ].sort((left, right) => left.sortKey.localeCompare(right.sortKey) || left.timelineOrder - right.timelineOrder);
  };

  const getVisibleEvents = () => {
    const expanded = events
      .flatMap((event, index) => {
        const visibleStages = scaleVisibility[event.scale] || [];
        if (!visibleStages.includes(state.stage)) return [];
        return expandEventForTimeline(event, index * 10);
      })
      .sort((left, right) => left.sortKey.localeCompare(right.sortKey) || left.timelineOrder - right.timelineOrder);
    return buildPresentCluster(expanded);
  };

  const getMaxTranslate = (visibleEvents, config) => {
    if (isMobile()) return 0;
    return Math.max(0, (visibleEvents.length - config.visibleCount) * (config.cardWidth + config.gap));
  };

  const clampOffset = (offset, visibleEvents) => {
    if (isMobile()) return 0;
    const config = getStageConfig();
    const maxOffset = Math.max(0, visibleEvents.length - config.visibleCount);
    return Math.max(0, Math.min(offset, maxOffset));
  };

  const ensureActiveEvent = (visibleEvents) => {
    if (!visibleEvents.length) return null;
    const active = visibleEvents.find((event) => event.id === state.activeId);
    if (active) return active;
    state.activeId = visibleEvents[0].id;
    return visibleEvents[0];
  };

  const syncViewportToActive = (visibleEvents) => {
    if (!visibleEvents.length || isMobile()) {
      state.offset = 0;
      return;
    }

    const config = getStageConfig();
    const activeIndex = Math.max(0, visibleEvents.findIndex((event) => event.id === state.activeId));
    const maxOffset = Math.max(0, visibleEvents.length - config.visibleCount);

    if (activeIndex < state.offset) {
      state.offset = activeIndex;
    } else if (activeIndex >= state.offset + config.visibleCount) {
      state.offset = activeIndex - config.visibleCount + 1;
    }

    state.offset = Math.max(0, Math.min(state.offset, maxOffset));
  };

  const formatEventLabel = (event, text) => {
    const yearLabel = event.displayYear === 'present' ? text.periodPresentLabel : event.displayYear || event.year;
    if (event.timelineType === 'present-cluster') return yearLabel;
    if (event.timelineType === 'period-start') return `${yearLabel} · ${text.periodStartLabel}`;
    if (event.timelineType === 'period-end') {
      return event.isOngoing ? yearLabel : `${yearLabel} · ${text.periodEndLabel}`;
    }
    return yearLabel;
  };

  const getCategoryLabel = (event, text) => {
    if (!event || !event.category || !text.categories) return '';
    return text.categories[event.category] || '';
  };

  const buildCategoryBadge = (event, text) => {
    const label = getCategoryLabel(event, text);
    if (!label) return '';
    return `<span class="timeline-category-badge" data-category="${event.category}">${label}</span>`;
  };

  const formatDurationValue = (value, text) => {
    if (!value) return '';
    return value === getPresentSortKey() || value === 'present' ? text.periodPresentLabel : value;
  };

  const buildDurationMarkup = (event, text) => {
    if (!event || (event.timelineType !== 'period-start' && event.timelineType !== 'period-end')) return '';
    const start = formatDurationValue(event.startYear, text);
    const end = event.isOngoing ? text.periodPresentLabel : formatDurationValue(event.endYear, text);
    if (!start || !end) return '';
    return `
      <div class="timeline-detail-duration">
        <span class="timeline-detail-duration-label">${text.durationLabel}</span>
        <span class="timeline-detail-duration-value">${start} &rarr; ${end}</span>
      </div>
    `;
  };

  const buildYearLayer = () => '';

  const buildStageControls = (text) =>
    [1, 2, 3]
      .map((stage) => {
        const stageText = text.stages[stage];
        return `
          <button
            type="button"
            class="timeline-stage-btn${state.stage === stage ? ' is-active' : ''}"
            data-timeline-stage="${stage}"
            aria-pressed="${state.stage === stage ? 'true' : 'false'}"
          >
            <span class="timeline-stage-btn-label">${stageText.label}</span>
          </button>
        `;
      })
      .join('');

  const buildEventButton = (event, index, lang, text, mobileMode) => {
    const isActive = event.id === state.activeId;
    const yearLabel = formatEventLabel(event, text);
    const title = readLocalized(event.title, lang);
    const summary = readLocalized(event.summary, lang);
    const position = mobileMode ? 'stack' : index % 2 === 0 ? 'upper' : 'lower';

    return `
      <button
        type="button"
        class="timeline-event timeline-event--${event.type}${isActive ? ' is-active' : ''}"
        data-timeline-event
        data-event-id="${event.id}"
        data-timeline-type="${event.timelineType || 'point'}"
        data-position="${position}"
        data-scale="${event.scale}"
        data-magnitude="${event.magnitude}"
        aria-pressed="${isActive ? 'true' : 'false'}"
      >
        <span class="timeline-event-card">
          <span class="timeline-event-meta">
            <span class="timeline-event-meta-label">${yearLabel}</span>
            ${buildCategoryBadge(event, text)}
          </span>
          <strong class="timeline-event-title">${title}</strong>
          <span class="timeline-event-summary">${summary}</span>
        </span>
        <span class="timeline-event-axis-slot" aria-hidden="true">
          <span class="timeline-event-connector"></span>
          <span class="timeline-event-marker"></span>
        </span>
      </button>
    `;
  };

  const buildViewport = (visibleEvents, lang, text) => {
    const mobileMode = isMobile();
    const config = getStageConfig();
    const offset = clampOffset(state.offset, visibleEvents);
    const railWidth = mobileMode
      ? 0
      : visibleEvents.length * config.cardWidth +
        Math.max(0, visibleEvents.length - 1) * config.gap +
        timelineLayout.railPadStart +
        timelineLayout.railPadEnd;
    const shift = mobileMode ? 0 : offset * (config.cardWidth + config.gap);
    const translateValue = state.dragLiveTranslate != null ? state.dragLiveTranslate : shift;
    const canMovePrev = offset > 0;
    const canMoveNext = !mobileMode && offset < Math.max(0, visibleEvents.length - config.visibleCount);

    state.offset = offset;

    return `
      <div class="about-timeline-toolbar">
        <div class="about-timeline-stage-controls" role="group" aria-label="${text.stagePrefix}">
          ${buildStageControls(text)}
        </div>
        <p class="about-timeline-keyboard-hint">${text.keyboardHint}</p>
      </div>
      <div class="about-timeline-canvas" data-stage="${state.stage}">
        <button
          type="button"
          class="timeline-side-nav timeline-side-nav--prev"
          data-timeline-nav="prev"
          aria-label="${text.previous}"
          ${canMovePrev ? '' : 'disabled'}
        >
          <span aria-hidden="true">←</span>
        </button>
        <div class="about-timeline-viewport" tabindex="0" aria-label="${text.viewportLabel}">
          <div class="about-timeline-axis" aria-hidden="true"></div>
          <div
            class="about-timeline-rail"
            style="
              --timeline-card-width: ${config.cardWidth}px;
              --timeline-gap: ${config.gap}px;
              --timeline-rail-width: ${railWidth}px;
              --timeline-rail-pad-start: ${timelineLayout.railPadStart}px;
              --timeline-rail-pad-end: ${timelineLayout.railPadEnd}px;
              --timeline-point-offset: ${timelineLayout.pointOffset}px;
              --timeline-translate: -${translateValue}px;
            "
          >
            ${buildYearLayer(visibleEvents, config, mobileMode)}
            ${visibleEvents.map((event, index) => buildEventButton(event, index, lang, text, mobileMode)).join('')}
          </div>
        </div>
        <button
          type="button"
          class="timeline-side-nav timeline-side-nav--next"
          data-timeline-nav="next"
          aria-label="${text.next}"
          ${canMoveNext ? '' : 'disabled'}
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    `;
  };

  const buildClusterItemMeta = (event, text) => `${event.startYear} - ${text.periodPresentLabel}`;

  const buildClusterDetail = (event, lang, text) => {
    const childEvents = Array.isArray(event.childEvents) ? event.childEvents : [];
    const childMarkup = childEvents
      .map((childEvent) => {
        const references = Array.isArray(childEvent.references) ? childEvent.references : [];
        const referenceMarkup = references.length
          ? `
            <div class="timeline-detail-links timeline-detail-links--cluster-item">
              <div class="timeline-detail-links-list">
                ${references
                  .map(
                    (ref) => `
                      <a class="timeline-detail-link" href="${ref.href}">
                        ${readLocalized(ref.label, lang)}
                      </a>
                    `,
                  )
                  .join('')}
              </div>
            </div>
          `
          : '';

        return `
          <article class="timeline-detail-cluster-item">
            <div class="timeline-detail-meta-row timeline-detail-meta-row--cluster-item">
              <div class="timeline-detail-cluster-item-meta">${buildClusterItemMeta(childEvent, text)}</div>
              ${buildCategoryBadge(childEvent, text)}
            </div>
            ${buildDurationMarkup(childEvent, text)}
            <h5>${readLocalized(childEvent.title, lang)}</h5>
            <p class="timeline-detail-summary">${readLocalized(childEvent.summary, lang)}</p>
            <p class="timeline-detail-body">${readLocalized(childEvent.detail, lang)}</p>
            ${referenceMarkup}
          </article>
        `;
      })
      .join('');

    return `
      <div class="timeline-detail-card timeline-detail-card--cluster">
        <div class="timeline-detail-meta">${formatEventLabel(event, text)}</div>
        <h4>${readLocalized(event.title, lang)}</h4>
        <p class="timeline-detail-summary">${readLocalized(event.summary, lang)}</p>
        <p class="timeline-detail-body">${readLocalized(event.detail, lang)}</p>
        <div class="timeline-detail-cluster-list-wrap">
          <div class="timeline-detail-links-label">${text.presentClusterListLabel}</div>
          <div class="timeline-detail-cluster-list">
            ${childMarkup}
          </div>
        </div>
      </div>
    `;
  };

  const buildDetail = (event, lang, text) => {
    if (!event) {
      if (state.isLoading) {
        return `<p class="timeline-detail-empty">${text.loadingDetail}</p>`;
      }
      if (state.loadError) {
        return `<p class="timeline-detail-empty">${text.loadFailedDetail}</p>`;
      }
      return `<p class="timeline-detail-empty">${text.emptyDetail}</p>`;
    }

    if (event.timelineType === 'present-cluster') {
      return buildClusterDetail(event, lang, text);
    }

    const references = Array.isArray(event.references) ? event.references : [];
    const referenceMarkup = references.length
      ? `
        <div class="timeline-detail-links">
          <div class="timeline-detail-links-label">${text.referencesLabel}</div>
          <div class="timeline-detail-links-list">
            ${references
              .map(
                (ref) => `
                  <a class="timeline-detail-link" href="${ref.href}">
                    ${readLocalized(ref.label, lang)}
                  </a>
                `,
              )
              .join('')}
          </div>
        </div>
      `
      : '';

    return `
      <div class="timeline-detail-card">
        <div class="timeline-detail-meta-row">
          <div class="timeline-detail-meta">${formatEventLabel(event, text)}</div>
          ${buildCategoryBadge(event, text)}
        </div>
        ${buildDurationMarkup(event, text)}
        <h4>${readLocalized(event.title, lang)}</h4>
        <p class="timeline-detail-summary">${readLocalized(event.summary, lang)}</p>
        <p class="timeline-detail-body">${readLocalized(event.detail, lang)}</p>
        ${referenceMarkup}
      </div>
    `;
  };

  const syncViewportDom = ({ animate = true } = {}) => {
    const root = document.querySelector(rootSelector);
    const rail = document.querySelector('.about-timeline-rail');
    if (!root || !rail) {
      render();
      return;
    }

    const visibleEvents = getVisibleEvents();
    const config = getStageConfig();
    const offset = clampOffset(state.offset, visibleEvents);
    const shift = isMobile() ? 0 : offset * (config.cardWidth + config.gap);
    const prevButton = root.querySelector('[data-timeline-nav="prev"]');
    const nextButton = root.querySelector('[data-timeline-nav="next"]');
    const maxOffset = Math.max(0, visibleEvents.length - config.visibleCount);

    state.offset = offset;
    state.dragLiveTranslate = null;

    rail.style.transition = animate ? '' : 'none';
    rail.style.setProperty('--timeline-translate', `-${shift}px`);

    if (!animate) {
      requestAnimationFrame(() => {
        rail.style.transition = '';
      });
    }

    if (prevButton) prevButton.disabled = offset <= 0;
    if (nextButton) nextButton.disabled = offset >= maxOffset;
  };

  const render = () => {
    const root = document.querySelector(rootSelector);
    if (!root) return;

    const lang = getLang();
    const text = uiText[lang] || uiText.en;
    const visibleEvents = getVisibleEvents();
    const activeEvent = ensureActiveEvent(visibleEvents);
    const timelineTitle = isCipherMode() ? text.cipherTitle || text.title : text.title;

    root.innerHTML = `
      <section class="about-timeline-shell" data-stage="${state.stage}">
        <div class="about-timeline-header">
          <p class="about-timeline-kicker">${text.kicker}</p>
          <h3>${timelineTitle}</h3>
          <p class="about-timeline-intro">${text.intro}</p>
        </div>
        ${buildViewport(visibleEvents, lang, text)}
        <div class="about-timeline-detail">
          ${buildDetail(activeEvent, lang, text)}
        </div>
      </section>
    `;
    syncTimelineNavLabels();
  };

  const moveViewport = (direction) => {
    const visibleEvents = getVisibleEvents();
    state.dragLiveTranslate = null;
    state.offset = clampOffset(state.offset + direction, visibleEvents);
    syncViewportDom({ animate: true });
  };

  const updateLiveDragTranslate = (deltaX) => {
    if (isMobile()) return;
    const visibleEvents = getVisibleEvents();
    const config = getStageConfig();
    const maxTranslate = getMaxTranslate(visibleEvents, config);
    const nextTranslate = Math.max(0, Math.min(state.dragTranslateStart + deltaX, maxTranslate));
    state.dragLiveTranslate = nextTranslate;

    const rail = document.querySelector('.about-timeline-rail');
    if (rail) {
      rail.style.setProperty('--timeline-translate', `-${nextTranslate}px`);
    }
  };

  const setStage = (stageValue) => {
    const nextStage = Number(stageValue);
    if (![1, 2, 3].includes(nextStage)) return;
    state.stage = nextStage;
    state.offset = 0;
    state.dragLiveTranslate = null;
    const visibleEvents = getVisibleEvents();
    if (!visibleEvents.some((event) => event.id === state.activeId)) {
      state.activeId = visibleEvents[0] ? visibleEvents[0].id : null;
    }
    syncViewportToActive(visibleEvents);
    render();
  };

  const handleClick = (event) => {
    const root = document.querySelector(rootSelector);
    if (!root) return;

    const stageTrigger = event.target.closest('[data-timeline-stage]');
    if (stageTrigger) {
      setStage(stageTrigger.getAttribute('data-timeline-stage'));
      return;
    }

    const navTrigger = event.target.closest('[data-timeline-nav]');
    if (navTrigger) {
      moveViewport(navTrigger.getAttribute('data-timeline-nav') === 'next' ? 1 : -1);
      return;
    }

    const eventTrigger = event.target.closest('[data-timeline-event]');
    if (eventTrigger) {
      state.activeId = eventTrigger.getAttribute('data-event-id');
      state.dragLiveTranslate = null;
      syncViewportToActive(getVisibleEvents());
      render();
    }
  };

  const handleKeydown = (event) => {
    if (isMobile()) return;
    if (event.defaultPrevented) return;
    if (event.target && /input|textarea|select/i.test(event.target.tagName)) return;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveViewport(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveViewport(1);
    }
  };

  const handlePointerDown = (event) => {
    const viewport = event.target.closest('.about-timeline-viewport');
    if (!viewport || isMobile()) return;
    state.dragStartX = event.clientX;
    state.dragOffsetStart = state.offset;
    state.dragTranslateStart = state.offset * (getStageConfig().cardWidth + getStageConfig().gap);
    state.dragLiveTranslate = state.dragTranslateStart;
    viewport.classList.add('is-dragging');
  };

  const handlePointerMove = (event) => {
    if (state.dragStartX == null || isMobile()) return;
    updateLiveDragTranslate(state.dragStartX - event.clientX);
  };

  const clearPointerState = () => {
    if (state.dragStartX != null) {
      const visibleEvents = getVisibleEvents();
      const config = getStageConfig();
      const step = config.cardWidth + config.gap;
      const translate = state.dragLiveTranslate != null ? state.dragLiveTranslate : state.dragTranslateStart;
      state.offset = clampOffset(Math.round(translate / step), visibleEvents);
    }
    state.dragStartX = null;
    const viewport = document.querySelector('.about-timeline-viewport');
    viewport?.classList.remove('is-dragging');
    syncViewportDom({ animate: true });
  };

  const handleTouchStart = (event) => {
    const viewport = event.target.closest('.about-timeline-viewport');
    if (!viewport || !event.touches?.length || !isMobile()) return;
    state.dragStartX = event.touches[0].clientX;
    state.dragOffsetStart = state.offset;
    state.dragTranslateStart = state.offset * (getStageConfig().cardWidth + getStageConfig().gap);
    state.dragLiveTranslate = state.dragTranslateStart;
  };

  const handleTouchMove = (event) => {
    if (state.dragStartX == null || !event.touches?.length) return;
    updateLiveDragTranslate(state.dragStartX - event.touches[0].clientX);
  };

  const init = async () => {
    const root = document.querySelector(rootSelector);
    if (!root) return;
    syncTimelineNavLabels();
    root.addEventListener('click', handleClick);
    root.addEventListener('pointerdown', handlePointerDown);
    root.addEventListener('touchstart', handleTouchStart, { passive: true });
    root.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('keydown', handleKeydown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', clearPointerState);
    window.addEventListener('pointercancel', clearPointerState);
    window.addEventListener('touchend', clearPointerState);
    window.addEventListener('resize', render);
    render();
    await loadTimelineData();
    render();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  window.addEventListener('ludwig-language-changed', render);
  window.addEventListener('ludwig-cipher-mode-changed', render);
})();
