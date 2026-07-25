(() => {
  const LANGUAGE_LABELS = {
    en: "English",
    "zh-Hant": "中文",
    "zh-Hans": "简体中文",
  };

  const state = {
    banks: [
      {
        id: "kddm-algorithms-en",
        title: "KDDM Algorithms & Methods",
        canonicalId: "brief-introduction-to-knowledge-discovery-and-data-mining-algorithms-and-methods",
        lang: "en",
        bankUrl: "../../notes/brief-introduction-to-knowledge-discovery-and-data-mining-algorithms-and-methods/questions.en.json",
        bankRootPath: "/notes/brief-introduction-to-knowledge-discovery-and-data-mining-algorithms-and-methods/questions.en.json",
        noteUrl:
          "../../notes/brief-introduction-to-knowledge-discovery-and-data-mining-algorithms-and-methods/brief-introduction-to-knowledge-discovery-and-data-mining-algorithms-and-methods-en.html",
        noteRootPath:
          "/notes/brief-introduction-to-knowledge-discovery-and-data-mining-algorithms-and-methods/brief-introduction-to-knowledge-discovery-and-data-mining-algorithms-and-methods-en.html",
        noteTitle: "Brief Introduction to Knowledge Discovery and Data Mining Algorithms & Methods",
      },
    ],
    ontologyLabels: new Map(),
    questionMetaOntology: {
      question_types: {},
      difficulty_levels: {},
      question_focuses: {},
      review_statuses: {},
    },
    allQuestions: [],
    filteredQuestions: [],
    activeIndex: 0,
    selectedTags: new Set(),
    languageFilter: "site",
    focusFilter: "all",
    activeBankId: "",
  };

  const quizShellEl = document.getElementById("question-bank-quiz");
  const statusEl = document.getElementById("question-bank-status");
  const statsVisibleEl = document.getElementById("question-bank-visible-count");
  const statsActiveTagsEl = document.getElementById("question-bank-active-tag-count");
  const statsLanguagesEl = document.getElementById("question-bank-language-count");
  const bankTitleEl = document.getElementById("question-bank-title");
  const bankSubtitleEl = document.getElementById("question-bank-subtitle");
  const bankSourceNoteEl = document.getElementById("question-bank-source-note");
  const tagFiltersEl = document.getElementById("question-bank-tag-filters");
  const focusFiltersEl = document.getElementById("question-bank-focus-filters");
  const languageFiltersEl = document.getElementById("question-bank-language-filters");
  const labelFiltersEl = document.getElementById("question-bank-label-filters");
  const labelLanguageEl = document.getElementById("question-bank-label-language");
  const labelFocusEl = document.getElementById("question-bank-label-focus");
  const labelTagsEl = document.getElementById("question-bank-label-tags");
  const labelSnapshotEl = document.getElementById("question-bank-label-snapshot");
  const labelVisibleQuestionsEl = document.getElementById("question-bank-label-visible-questions");
  const labelActiveTagsEl = document.getElementById("question-bank-label-active-tags");
  const labelVisibleLanguagesEl = document.getElementById("question-bank-label-visible-languages");
  const labelActiveBankEl = document.getElementById("question-bank-label-active-bank");
  const questionMetaEl = document.getElementById("question-bank-question-meta");
  const questionPromptEl = document.getElementById("question-bank-question-prompt");
  const questionOptionsEl = document.getElementById("question-bank-options");
  const questionResponseEl = document.getElementById("question-bank-response");
  const questionTagsEl = document.getElementById("question-bank-tags");
  const sourceNoteTitleEl = document.getElementById("question-bank-source-note-title");
  const sourceNoteLabelEl = document.getElementById("question-bank-label-source-note");
  const progressEl = document.getElementById("question-bank-progress");
  const prevBtn = document.getElementById("question-bank-prev");
  const nextBtn = document.getElementById("question-bank-next");
  const resetBtn = document.getElementById("question-bank-reset");
  const clearTagsBtn = document.getElementById("question-bank-clear-tags");
  const prevLabelEl = document.getElementById("question-bank-label-prev");
  const nextLabelEl = document.getElementById("question-bank-label-next");
  const resetLabelEl = document.getElementById("question-bank-label-reset");

  if (
    !quizShellEl ||
    !statusEl ||
    !statsVisibleEl ||
    !statsActiveTagsEl ||
    !statsLanguagesEl ||
    !bankTitleEl ||
    !bankSubtitleEl ||
    !bankSourceNoteEl ||
    !tagFiltersEl ||
    !focusFiltersEl ||
    !languageFiltersEl ||
    !labelFiltersEl ||
    !labelLanguageEl ||
    !labelFocusEl ||
    !labelTagsEl ||
    !labelSnapshotEl ||
    !labelVisibleQuestionsEl ||
    !labelActiveTagsEl ||
    !labelVisibleLanguagesEl ||
    !labelActiveBankEl ||
    !questionMetaEl ||
    !questionPromptEl ||
    !questionOptionsEl ||
    !questionResponseEl ||
    !questionTagsEl ||
    !sourceNoteTitleEl ||
    !sourceNoteLabelEl ||
    !progressEl ||
    !prevBtn ||
    !nextBtn ||
    !resetBtn ||
    !clearTagsBtn ||
    !prevLabelEl ||
    !nextLabelEl ||
    !resetLabelEl
  ) {
    return;
  }

  const resolveHref = (relativeUrl, rootPath = "") => {
    try {
      return new URL(relativeUrl, window.location.href).href;
    } catch (error) {
      if (rootPath && /^https?:$/i.test(window.location.protocol)) {
        try {
          return new URL(rootPath, window.location.origin).href;
        } catch (_) {
          return relativeUrl || rootPath;
        }
      }
      return relativeUrl || rootPath;
    }
  };

  const normalizeLang = (value) => {
    const raw = String(value || "").trim().toLowerCase();
    if (raw === "zh_tw" || raw === "zh-hant" || raw === "zh_hant") return "zh-Hant";
    if (raw === "zh_cn" || raw === "zh-hans" || raw === "zh_hans") return "zh-Hans";
    if (raw === "en") return "en";
    return String(value || "").trim();
  };

  const getUiLang = () => {
    if (window.LudwigLanguage && typeof window.LudwigLanguage.getCurrentLang === "function") {
      return normalizeLang(window.LudwigLanguage.getCurrentLang());
    }
    return normalizeLang(document.documentElement.getAttribute("lang") || "en");
  };

  const getSiteLang = () => getUiLang();

  const getLanguageLabel = (lang) => {
    const normalized = normalizeLang(lang);
    return LANGUAGE_LABELS[normalized] || normalized || "Unknown";
  };

  const titleize = (value) => String(value || "")
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const getLocalizedFacetLabel = (groupName, value, lang = "") => {
    const normalizedValue = String(value || "").trim().toLowerCase();
    const group = state.questionMetaOntology[groupName] || {};
    const labels = group[normalizedValue] || {};
    const preferred = normalizeLang(lang || getUiLang());
    const fallbacks = preferred === "zh-Hans"
      ? ["zh-Hans", "zh-Hant", "en"]
      : preferred === "zh-Hant"
        ? ["zh-Hant", "zh-Hans", "en"]
        : ["en", "zh-Hant", "zh-Hans"];
    for (const key of fallbacks) {
      const candidate = String(labels[key] || "").trim();
      if (candidate) return candidate;
    }
    const first = Object.values(labels).map((item) => String(item || "").trim()).find(Boolean);
    return first || titleize(value);
  };

  const getUiText = (key, replacements = {}, lang = "") => {
    const group = state.questionMetaOntology.ui || {};
    const labels = group[String(key || "").trim()] || {};
    const preferred = normalizeLang(lang || getUiLang());
    const fallbacks = preferred === "zh-Hans"
      ? ["zh-Hans", "zh-Hant", "en"]
      : preferred === "zh-Hant"
        ? ["zh-Hant", "zh-Hans", "en"]
        : ["en", "zh-Hant", "zh-Hans"];
    let template = "";
    for (const candidateKey of fallbacks) {
      const candidate = String(labels[candidateKey] || "").trim();
      if (candidate) {
        template = candidate;
        break;
      }
    }
    template = template || String(key || "").trim();
    return Object.entries(replacements).reduce(
      (acc, [token, value]) => acc.replaceAll(`{${token}}`, String(value ?? "")),
      template,
    );
  };

  const getTypeLabel = (value, lang = "") => getLocalizedFacetLabel("question_types", value, lang);
  const getStatusLabel = (value, lang = "") => getLocalizedFacetLabel("review_statuses", value, lang);
  const getDifficultyLabel = (value, lang = "") => getLocalizedFacetLabel("difficulty_levels", value, lang);
  const getFocusLabel = (value, lang = "") => getLocalizedFacetLabel("question_focuses", value, lang);

  const humanizeConceptFallback = (conceptId) => {
    const raw = String(conceptId || "").trim().replace(/^concept\./, "");
    return titleize(raw);
  };

  const getTagLabel = (conceptId, lang = "") => {
    const labels = state.ontologyLabels.get(String(conceptId || "").trim()) || {};
    const preferred = normalizeLang(lang || getUiLang());
    const fallbacks = preferred === "zh-Hans"
      ? ["zh-Hans", "zh-Hant", "en"]
      : preferred === "zh-Hant"
        ? ["zh-Hant", "zh-Hans", "en"]
        : ["en", "zh-Hant", "zh-Hans"];
    for (const key of fallbacks) {
      const candidate = String(labels[key] || "").trim();
      if (candidate) return candidate;
    }
    const first = Object.values(labels).map((item) => String(item || "").trim()).find(Boolean);
    return first || humanizeConceptFallback(conceptId);
  };

  const collectLanguageOptions = () => {
    const values = Array.from(
      new Set(
        state.allQuestions
          .map((question) => normalizeLang(question.lang))
          .filter(Boolean)
      )
    ).sort();
    return ["site", "all", ...values];
  };

  const collectFocusOptions = () => {
    const values = Array.from(
      new Set(
        state.allQuestions
          .map((question) => String(question.question_focus || "").trim().toLowerCase())
          .filter(Boolean)
      )
    ).sort((a, b) => getFocusLabel(a, getUiLang()).localeCompare(getFocusLabel(b, getUiLang())));
    return ["all", ...values];
  };

  const getFetchCandidates = (bank) => {
    const candidates = [];
    const add = (value) => {
      const normalized = String(value || "").trim();
      if (!normalized || candidates.includes(normalized)) return;
      candidates.push(normalized);
    };
    add(resolveHref(bank.bankUrl, bank.bankRootPath || ""));
    if (bank.bankRootPath && /^https?:$/i.test(window.location.protocol)) {
      add(new URL(bank.bankRootPath, window.location.origin).href);
    }
    return candidates;
  };

  const setStatus = (text, tone = "") => {
    statusEl.textContent = text;
    statusEl.dataset.tone = tone;
  };

  const buildOntologyCandidates = () => {
    const relative = resolveHref("../../data/Ontology/tags-ontology.json", "/data/Ontology/tags-ontology.json");
    const candidates = [relative];
    if (/^https?:$/i.test(window.location.protocol)) {
      const root = new URL("/data/Ontology/tags-ontology.json", window.location.origin).href;
      if (!candidates.includes(root)) candidates.push(root);
    }
    return candidates;
  };

  const buildQuestionMetaOntologyCandidates = () => {
    const relative = resolveHref("../../data/Ontology/question-bank-ontology.json", "/data/Ontology/question-bank-ontology.json");
    const candidates = [relative];
    if (/^https?:$/i.test(window.location.protocol)) {
      const root = new URL("/data/Ontology/question-bank-ontology.json", window.location.origin).href;
      if (!candidates.includes(root)) candidates.push(root);
    }
    return candidates;
  };

  const loadOntology = async () => {
    const candidates = buildOntologyCandidates();
    for (const candidate of candidates) {
      try {
        const response = await fetch(candidate, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json();
        const concepts = Array.isArray(payload && payload.concepts) ? payload.concepts : [];
        state.ontologyLabels = new Map(
          concepts.map((concept) => [
            String(concept && concept.concept_id || "").trim(),
            concept && typeof concept.labels === "object" ? concept.labels : {},
          ]).filter(([key]) => key)
        );
        return;
      } catch (error) {
        continue;
      }
    }
    state.ontologyLabels = new Map();
  };

  const loadQuestionMetaOntology = async () => {
    const candidates = buildQuestionMetaOntologyCandidates();
    for (const candidate of candidates) {
      try {
        const response = await fetch(candidate, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json();
        const dimensions = Array.isArray(payload && payload.dimensions) ? payload.dimensions : [];
        const toValueMap = (dimensionId, fallbackLegacyGroup) => {
          const match = dimensions.find((item) => String(item && item.id || "").trim() === dimensionId);
          if (match && Array.isArray(match.values)) {
            return Object.fromEntries(
              match.values
                .map((item) => [String(item && item.id || "").trim().toLowerCase(), item && typeof item.labels === "object" ? item.labels : {}])
                .filter(([key]) => key)
            );
          }
          return payload && typeof payload[fallbackLegacyGroup] === "object" ? payload[fallbackLegacyGroup] : {};
        };
        const uiStrings = Array.isArray(payload && payload.ui_strings) ? payload.ui_strings : [];
        const uiMap = uiStrings.length > 0
          ? Object.fromEntries(
              uiStrings
                .map((item) => [String(item && item.id || "").trim(), item && typeof item.labels === "object" ? item.labels : {}])
                .filter(([key]) => key)
            )
          : payload && typeof payload.ui === "object"
            ? payload.ui
            : {};
        state.questionMetaOntology = {
          question_types: toValueMap("question_type", "question_types"),
          difficulty_levels: toValueMap("difficulty", "difficulty_levels"),
          question_focuses: toValueMap("question_focus", "question_focuses"),
          review_statuses: toValueMap("review_status", "review_statuses"),
          ui: uiMap,
        };
        return;
      } catch (error) {
        continue;
      }
    }
    state.questionMetaOntology = {
      question_types: {},
      difficulty_levels: {},
      question_focuses: {},
      review_statuses: {},
      ui: {},
    };
  };

  const buildAggregatedQuestions = (bank, payload) => {
    const questions = Array.isArray(payload && payload.questions) ? payload.questions : [];
    return questions.map((question) => {
      const questionId = String(question.question_id || "").trim();
      return {
        ...question,
        bankId: bank.id,
        bankTitle: bank.title,
        noteTitle: bank.noteTitle,
        noteUrl: resolveHref(bank.noteUrl, bank.noteRootPath || ""),
        canonicalId: bank.canonicalId,
        globalQuestionId: `${bank.canonicalId}::${questionId}`,
        lang: normalizeLang(question.lang || bank.lang),
        question_focus: String(question.question_focus || "").trim().toLowerCase(),
        tagConcepts: Array.isArray(question.tag_concepts) ? question.tag_concepts.map((item) => String(item || "").trim()).filter(Boolean) : [],
      };
    });
  };

  const questionMatchesLanguage = (question) => {
    const filter = state.languageFilter;
    if (filter === "all") return true;
    if (filter === "site") return normalizeLang(question.lang) === getSiteLang();
    return normalizeLang(question.lang) === normalizeLang(filter);
  };

  const questionMatchesTags = (question) => {
    if (state.selectedTags.size === 0) return true;
    const tags = new Set((question.tagConcepts || []).map((item) => String(item || "").trim()).filter(Boolean));
    for (const key of state.selectedTags.values()) {
      if (tags.has(key)) return true;
    }
    return false;
  };

  const questionMatchesFocus = (question) => {
    if (state.focusFilter === "all") return true;
    return String(question.question_focus || "").trim().toLowerCase() === state.focusFilter;
  };

  const applyFilters = () => {
    state.filteredQuestions = state.allQuestions.filter(
      (question) => questionMatchesLanguage(question) && questionMatchesFocus(question) && questionMatchesTags(question)
    );
    if (state.filteredQuestions.length === 0) {
      state.activeIndex = 0;
    } else if (state.activeIndex >= state.filteredQuestions.length) {
      state.activeIndex = 0;
    }
  };

  const updateStats = () => {
    statsVisibleEl.textContent = String(state.filteredQuestions.length);
    statsActiveTagsEl.textContent = String(state.selectedTags.size);
    statsLanguagesEl.textContent = String(new Set(state.filteredQuestions.map((question) => normalizeLang(question.lang)).filter(Boolean)).size);
  };

  const renderStaticLabels = () => {
    labelFiltersEl.textContent = getUiText("filters");
    labelLanguageEl.textContent = getUiText("language");
    labelFocusEl.textContent = getUiText("question_focus");
    labelTagsEl.textContent = getUiText("tags");
    labelSnapshotEl.textContent = getUiText("snapshot");
    labelVisibleQuestionsEl.textContent = getUiText("visible_questions");
    labelActiveTagsEl.textContent = getUiText("active_tags");
    labelVisibleLanguagesEl.textContent = getUiText("visible_languages");
    labelActiveBankEl.textContent = getUiText("active_bank");
    bankTitleEl.textContent = getUiText("question_bank");
    bankSourceNoteEl.textContent = getUiText("open_source_note");
    sourceNoteLabelEl.textContent = getUiText("source_note");
    clearTagsBtn.textContent = getUiText("clear_tags");
    prevLabelEl.textContent = getUiText("previous");
    nextLabelEl.textContent = getUiText("next");
    resetLabelEl.textContent = getUiText("reset");
  };

  const renderLanguageFilters = () => {
    const options = collectLanguageOptions();
    languageFiltersEl.innerHTML = "";
    options.forEach((value) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "question-bank-filter-chip";
      button.dataset.value = value;
      button.classList.toggle("is-active", state.languageFilter === value);
      button.textContent = value === "site"
        ? getUiText("site_language", { lang: getLanguageLabel(getSiteLang()) })
        : value === "all"
          ? getUiText("all_languages")
          : getLanguageLabel(value);
      button.addEventListener("click", () => {
        state.languageFilter = value;
        applyFilters();
        renderFilters();
        renderCurrentQuestion();
      });
      languageFiltersEl.appendChild(button);
    });
  };

  const renderFocusFilters = () => {
    const options = collectFocusOptions();
    focusFiltersEl.innerHTML = "";
    options.forEach((value) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "question-bank-filter-chip";
      button.dataset.focus = value;
      button.classList.toggle("is-active", state.focusFilter === value);
      button.textContent = value === "all"
        ? getUiText("all_focuses")
        : getFocusLabel(value, getUiLang());
      button.addEventListener("click", () => {
        state.focusFilter = value;
        applyFilters();
        renderFilters();
        renderCurrentQuestion();
      });
      focusFiltersEl.appendChild(button);
    });
  };

  const renderTagFilters = () => {
    const counts = new Map();
    for (const question of state.allQuestions) {
      const seen = new Set();
      for (const tag of question.tagConcepts || []) {
        if (!tag || seen.has(tag)) continue;
        seen.add(tag);
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }
    const rows = Array.from(counts.entries())
      .map(([key, count]) => ({ key, count, label: getTagLabel(key, getUiLang()) }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

    tagFiltersEl.innerHTML = "";
    rows.forEach((row) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "question-bank-filter-chip";
      button.dataset.tag = row.key;
      button.classList.toggle("is-active", state.selectedTags.has(row.key));
      button.textContent = `${row.label} (${row.count})`;
      button.addEventListener("click", () => {
        if (state.selectedTags.has(row.key)) state.selectedTags.delete(row.key);
        else state.selectedTags.add(row.key);
        applyFilters();
        renderFilters();
        renderCurrentQuestion();
      });
      tagFiltersEl.appendChild(button);
    });
  };

  const renderFilters = () => {
    renderLanguageFilters();
    renderFocusFilters();
    renderTagFilters();
    clearTagsBtn.disabled = state.selectedTags.size === 0;
  };

  const renderCurrentQuestion = () => {
    const question = state.filteredQuestions[state.activeIndex];
    if (!question) {
      quizShellEl.style.display = "none";
      const activeBank = state.banks.find((bank) => bank.id === state.activeBankId) || state.banks[0] || null;
      bankTitleEl.textContent = activeBank ? activeBank.title : "Question Pool";
      bankSubtitleEl.textContent = getUiText("no_questions_match");
      setStatus(getUiText("no_questions_match_status"), "error");
      updateStats();
      return;
    }

    const activeBank = state.banks.find((bank) => bank.id === state.activeBankId) || state.banks[0] || null;
    quizShellEl.style.display = "block";
    bankTitleEl.textContent = activeBank ? activeBank.title : "Question Pool";
    bankSubtitleEl.textContent = getUiText("single_bank_subtitle");
    bankSourceNoteEl.href = question.noteUrl;
    sourceNoteTitleEl.textContent = question.noteTitle;
    questionMetaEl.textContent = [
      getStatusLabel(question.review_status, getUiLang()),
      getDifficultyLabel(question.difficulty, getUiLang()),
      getFocusLabel(question.question_focus, getUiLang()),
      getTypeLabel(question.question_type, getUiLang()),
      getLanguageLabel(question.lang),
    ].filter(Boolean).join(" · ");
    questionPromptEl.textContent = question.prompt;
    progressEl.textContent = `${state.activeIndex + 1} / ${state.filteredQuestions.length}`;

    questionOptionsEl.innerHTML = "";
    questionResponseEl.textContent = "";
    questionResponseEl.className = "question-bank-response";

    (Array.isArray(question.choices) ? question.choices : []).forEach((choice) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "question-bank-option";
      button.dataset.choiceId = String(choice.id || "").toUpperCase();
      button.dataset.correct = String(choice.id || "").toUpperCase() === String(question.answer || "").toUpperCase() ? "1" : "0";
      button.dataset.response = String(choice.response || "").trim();
      button.textContent = `${choice.id}. ${choice.text}`;
      questionOptionsEl.appendChild(button);
    });

    questionTagsEl.innerHTML = "";
    (Array.isArray(question.tagConcepts) ? question.tagConcepts : []).forEach((tag) => {
      const pill = document.createElement("span");
      pill.className = "question-bank-tag";
      pill.textContent = getTagLabel(tag, getUiLang());
      questionTagsEl.appendChild(pill);
    });

    prevBtn.disabled = state.activeIndex <= 0;
    nextBtn.disabled = state.activeIndex >= state.filteredQuestions.length - 1;
    updateStats();
    setStatus(
      getUiText(
        state.filteredQuestions.length === 1 ? "showing_after_filters_one" : "showing_after_filters_many",
        { count: state.filteredQuestions.length },
      ),
      "ok",
    );
  };

  const handleChoice = (button) => {
    if (!button) return;
    const buttons = Array.from(questionOptionsEl.querySelectorAll(".question-bank-option"));
    buttons.forEach((item) => item.classList.remove("is-selected", "is-correct", "is-wrong", "is-revealed-correct"));

    button.classList.add("is-selected");
    const isCorrect = button.dataset.correct === "1";
    button.classList.add(isCorrect ? "is-correct" : "is-wrong");
    if (!isCorrect) {
      const correctButton = questionOptionsEl.querySelector('[data-correct="1"]');
      if (correctButton && correctButton !== button) correctButton.classList.add("is-revealed-correct");
    }

    const question = state.filteredQuestions[state.activeIndex];
    const fallback = isCorrect && question && question.explanation ? `Correct. ${question.explanation}` : question?.explanation || "";
    questionResponseEl.classList.add(isCorrect ? "is-correct" : "is-wrong");
    questionResponseEl.classList.remove(isCorrect ? "is-wrong" : "is-correct");
    questionResponseEl.textContent = button.dataset.response || fallback;
  };

  const goToQuestion = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= state.filteredQuestions.length) return;
    state.activeIndex = nextIndex;
    renderCurrentQuestion();
  };

  const loadActiveBank = async (bankId = "") => {
    const bank = state.banks.find((item) => item.id === bankId) || state.banks[0] || null;
    if (!bank) {
      setStatus(getUiText("no_bank_configured"), "error");
      return;
    }
    state.activeBankId = bank.id;
    setStatus(getUiText("loading_bank", { title: bank.title }));
    quizShellEl.style.display = "none";

    if (window.location.protocol === "file:") {
      state.allQuestions = [];
      state.filteredQuestions = [];
      state.activeIndex = 0;
      updateStats();
      setStatus(getUiText("file_protocol_error"), "error");
      return;
    }

    try {
      await loadOntology();
      await loadQuestionMetaOntology();
      renderStaticLabels();
      const candidates = getFetchCandidates(bank);
      let payload = null;
      let lastError = null;
      for (const candidate of candidates) {
        try {
          const response = await fetch(candidate, { cache: "no-store" });
          if (!response.ok) throw new Error(`HTTP ${response.status} @ ${candidate}`);
          payload = await response.json();
          break;
        } catch (error) {
          lastError = error;
        }
      }
      if (!payload) throw lastError || new Error(`Question bank fetch failed for ${bank.title}`);
      const loadedQuestions = buildAggregatedQuestions(bank, payload);
      if (loadedQuestions.length === 0) throw new Error("No questions found in the configured bank");
      state.allQuestions = loadedQuestions;
      state.activeIndex = 0;
      applyFilters();
      renderFilters();
      renderCurrentQuestion();
    } catch (error) {
      state.allQuestions = [];
      state.filteredQuestions = [];
      state.activeIndex = 0;
      updateStats();
      quizShellEl.style.display = "none";
      setStatus(
        getUiText("failed_to_load_data", { message: error instanceof Error ? error.message : "unknown error" }),
        "error",
      );
    }
  };

  questionOptionsEl.addEventListener("click", (event) => {
    const button = event.target.closest(".question-bank-option");
    if (!button) return;
    handleChoice(button);
  });

  prevBtn.addEventListener("click", () => goToQuestion(state.activeIndex - 1));
  nextBtn.addEventListener("click", () => goToQuestion(state.activeIndex + 1));
  resetBtn.addEventListener("click", () => renderCurrentQuestion());
  clearTagsBtn.addEventListener("click", () => {
    state.selectedTags.clear();
    applyFilters();
    renderFilters();
    renderCurrentQuestion();
  });

  if (state.banks.length > 0) {
    loadActiveBank(state.banks[0].id);
  } else {
    setStatus(getUiText("no_bank_loaded"));
  }

  window.addEventListener("ludwig-language-changed", () => {
    renderStaticLabels();
    renderFilters();
    renderCurrentQuestion();
  });
})();
