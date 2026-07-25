(() => {
  const VIEWPORT_QUERY = "(max-width: 991.98px)";
  const ASSISTANT_BOTTOM_OFFSET = 84;
  const ASSISTANT_LEFT_OFFSET = 4;
  const SHEET_ID = "site-copilot-sheet";
  const interactiveAvatars = new Set();
  const avatarButtons = new Set();
  let lastPointerEvent = null;
  let chatState = {
    messages: [],
  };

  const resolveProjectPath = (rel) => {
    const path = window.location.pathname || "";
    const cleaned = String(rel || "").replace(/^\/+/, "");
    if (!cleaned) return window.location.href;

    const idxNotes = path.indexOf("/notes/");
    const idxPages = path.indexOf("/pages/");
    const idxGarden = path.indexOf("/garden/");
    const idxWriting = path.indexOf("/writing/");
    const idxCanvas = path.indexOf("/canvas/");
    const idxTag = path.indexOf("/tag/");
    const idxLabs = path.indexOf("/labs/");
    const idxFuture = path.indexOf("/future/");

    let root = "";
    if (idxNotes >= 0) root = path.slice(0, idxNotes + 1);
    else if (idxPages >= 0) root = path.slice(0, idxPages + 1);
    else if (idxGarden >= 0) root = path.slice(0, idxGarden + 1);
    else if (idxWriting >= 0) root = path.slice(0, idxWriting + 1);
    else if (idxCanvas >= 0) root = path.slice(0, idxCanvas + 1);
    else if (idxTag >= 0) root = path.slice(0, idxTag + 1);
    else if (idxLabs >= 0) root = path.slice(0, idxLabs + 1);
    else if (idxFuture >= 0) root = path.slice(0, idxFuture + 1);
    else root = path.slice(0, path.lastIndexOf("/") + 1);

    if (window.location.protocol === "file:") return `file://${root}${cleaned}`;
    return `${root}${cleaned}`;
  };

  const getLang = () => String(document.documentElement.getAttribute("lang") || "en").trim();

  const getCopy = () => {
    const lang = getLang();
    if (lang === "zh-Hans") {
      return {
        title: "Ask Ludwig",
        intro: "目前聊天室先提供最基础的站内导览模式。如果你想找文章、主题或入口，可以直接问我，我会先把你导去 Search。",
        fallback: "我现在还不能可靠地直接回答这个问题，不过我可以先帮你把入口导到 Search。",
        keywordLead: "Search 关键词：",
        placeholder: "例如：我想找 system design 的文章",
        send: "发送",
        cta: "打开 Search",
        close: "关闭",
        avatarLabel: "打开站内 Copilot",
      };
    }
    if (lang === "zh-Hant") {
      return {
        title: "Ask Ludwig",
        intro: "目前聊天室先提供最基礎的站內導覽模式。如果你想找文章、主題或入口，可以直接問我，我會先把你導去 Search。",
        fallback: "我現在還不能可靠地直接回答這個問題，不過我可以先幫你把入口導到 Search。",
        keywordLead: "Search 關鍵字：",
        placeholder: "例如：我想找 system design 的文章",
        send: "送出",
        cta: "打開 Search",
        close: "關閉",
        avatarLabel: "打開站內 Copilot",
      };
    }
    return {
      title: "Ask Ludwig",
      intro: "This chat currently works as a lightweight site guide. Ask about articles, topics, or where to go next, and I will route you to Search first.",
      fallback: "I can't answer that reliably yet, but I can route you to Search as the best next step.",
      keywordLead: "Search query:",
      placeholder: "For example: find articles about system design",
      send: "Send",
      cta: "Open Search",
      close: "Close",
      avatarLabel: "Open site copilot",
    };
  };

  const isViewportSupported = () => {
    if (typeof window.matchMedia === "function") {
      return !window.matchMedia(VIEWPORT_QUERY).matches;
    }
    return window.innerWidth > 991;
  };

  const getDefaultAnchorPosition = ({ width = 88, height = 88 } = {}) => {
    const brand = document.querySelector(".custom-nav .navbar-brand, .custom-nav .custom-brand");
    const x = brand instanceof HTMLElement ? brand.getBoundingClientRect().left + ASSISTANT_LEFT_OFFSET : 18;
    const y = window.innerHeight - height - ASSISTANT_BOTTOM_OFFSET;
    return {
      x: Math.min(Math.max(12, Math.round(x)), Math.max(12, window.innerWidth - width - 12)),
      y: Math.max(88, Math.round(y)),
    };
  };

  const ensureSheet = () => {
    let sheet = document.getElementById(SHEET_ID);
    if (sheet) return sheet;

    sheet = document.createElement("section");
    sheet.id = SHEET_ID;
    sheet.className = "site-copilot-sheet";
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "false");
    sheet.innerHTML = `
      <button type="button" class="site-copilot-sheet__close" data-copilot-close aria-label="Close">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="site-copilot-sheet__header">
        <div class="site-copilot-sheet__title" data-copilot-title></div>
      </div>
      <div class="site-copilot-chat" data-copilot-chat></div>
      <form class="site-copilot-composer" data-copilot-composer>
        <input class="site-copilot-composer__input" data-copilot-input type="text" />
        <button class="site-copilot-composer__send" data-copilot-send type="submit"></button>
      </form>
    `;
    document.body.appendChild(sheet);
    sheet.querySelector("[data-copilot-close]")?.addEventListener("click", () => closeSheet());
    sheet.querySelector("[data-copilot-composer]")?.addEventListener("submit", handleComposerSubmit);
    syncSheetCopy();
    return sheet;
  };

  const getSearchHref = (query = "") => {
    const base = resolveProjectPath("pages/search.html");
    const q = String(query || "").trim();
    if (!q) return base;
    const url = new URL(base, window.location.href);
    url.searchParams.set("q", q);
    return url.toString();
  };

  const buildInitialMessages = () => {
    const text = getCopy();
    return [
      {
        role: "assistant",
        content: text.intro,
        ctaLabel: text.cta,
        ctaHref: getSearchHref(""),
      },
    ];
  };

  const ensureConversation = () => {
    if (!Array.isArray(chatState.messages) || !chatState.messages.length) {
      chatState.messages = buildInitialMessages();
    }
    return chatState.messages;
  };

  const escapeHtml = (value) => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const renderMessages = () => {
    const sheet = ensureSheet();
    const chat = sheet.querySelector("[data-copilot-chat]");
    if (!(chat instanceof HTMLElement)) return;
    const messages = ensureConversation();
    chat.innerHTML = messages.map((message) => `
      <div class="site-copilot-message site-copilot-message--${escapeHtml(message.role)}">
        <div class="site-copilot-message__bubble">
          <div class="site-copilot-message__text">${escapeHtml(message.content)}</div>
          ${message.ctaLabel && message.ctaHref ? `<a class="site-copilot-message__cta" href="${escapeHtml(message.ctaHref)}">${escapeHtml(message.ctaLabel)}</a>` : ""}
        </div>
      </div>
    `).join("");
    chat.scrollTop = chat.scrollHeight;
  };

  const pushMessage = (message) => {
    ensureConversation();
    chatState.messages.push(message);
    renderMessages();
  };

  const handleComposerSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;
    const input = form.querySelector("[data-copilot-input]");
    if (!(input instanceof HTMLInputElement)) return;
    const value = String(input.value || "").trim();
    if (!value) return;
    pushMessage({ role: "user", content: value });
    const text = getCopy();
    pushMessage({
      role: "assistant",
      content: `${text.fallback} ${value ? `${text.keywordLead} ${value}` : ""}`.trim(),
      ctaLabel: text.cta,
      ctaHref: getSearchHref(value),
    });
    input.value = "";
    input.focus();
  };

  const syncSheetCopy = () => {
    const sheet = ensureSheet();
    const text = getCopy();
    const title = sheet.querySelector("[data-copilot-title]");
    const close = sheet.querySelector("[data-copilot-close]");
    const input = sheet.querySelector("[data-copilot-input]");
    const send = sheet.querySelector("[data-copilot-send]");
    if (title) title.textContent = text.title;
    if (close) close.setAttribute("aria-label", text.close);
    if (input instanceof HTMLInputElement) {
      input.placeholder = text.placeholder;
      input.setAttribute("aria-label", text.placeholder);
    }
    if (send instanceof HTMLButtonElement) send.textContent = text.send;
    chatState.messages = buildInitialMessages();
    renderMessages();
  };

  const placeSheet = (anchorEl) => {
    const sheet = ensureSheet();
    const anchorRect = anchorEl instanceof HTMLElement ? anchorEl.getBoundingClientRect() : null;
    const width = sheet.offsetWidth || 280;
    const height = sheet.offsetHeight || 148;
    const fallback = getDefaultAnchorPosition({ width: 88, height: 88 });
    const left = anchorRect ? anchorRect.left + anchorRect.width + 14 : fallback.x + 100;
    const top = anchorRect ? anchorRect.top - Math.max(0, height - anchorRect.height) : fallback.y - 24;
    const clampedLeft = Math.min(Math.max(12, left), window.innerWidth - width - 12);
    const clampedTop = Math.min(Math.max(88, top), window.innerHeight - height - 12);
    sheet.style.left = `${Math.round(clampedLeft)}px`;
    sheet.style.top = `${Math.round(clampedTop)}px`;
  };

  const openSheet = ({ anchorEl = null, source = "copilot" } = {}) => {
    const sheet = ensureSheet();
    syncSheetCopy();
    document.querySelectorAll("[data-copilot-anchor='active']").forEach((node) => {
      node.setAttribute("data-copilot-anchor", "inactive");
    });
    if (anchorEl instanceof HTMLElement) {
      anchorEl.setAttribute("data-copilot-anchor", "active");
    }
    placeSheet(anchorEl);
    sheet.classList.add("is-open");
    sheet.dataset.source = source;
    try {
      window.dispatchEvent(new CustomEvent("ludwig-copilot-opened", { detail: { source } }));
    } catch (error) {}
  };

  const closeSheet = () => {
    const sheet = document.getElementById(SHEET_ID);
    if (!sheet) return;
    sheet.classList.remove("is-open");
    document.querySelectorAll("[data-copilot-anchor='active']").forEach((node) => {
      node.setAttribute("data-copilot-anchor", "inactive");
    });
  };

  const applyGazeToAvatar = (button, event) => {
    if (!(button instanceof HTMLElement)) return;
    const pupils = Array.from(button.querySelectorAll("[data-avatar-pupil]"));
    if (!pupils.length) return;
    const rect = button.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = Math.max(-1, Math.min(1, (event.clientX - cx) / Math.max(rect.width / 2, 1)));
    const dy = Math.max(-1, Math.min(1, (event.clientY - cy) / Math.max(rect.height / 2, 1)));
    const tx = (dx * 0.42).toFixed(2);
    const ty = (dy * 0.32).toFixed(2);
    pupils.forEach((node) => {
      node.setAttribute("transform", `translate(${tx} ${ty})`);
    });
  };

  const resetGazeForAvatar = (button) => {
    if (!(button instanceof HTMLElement)) return;
    button.querySelectorAll("[data-avatar-pupil]").forEach((node) => {
      node.removeAttribute("transform");
    });
  };

  const registerAvatar = (button, { interactive = false } = {}) => {
    if (!(button instanceof HTMLElement)) return;
    avatarButtons.add(button);
    if (!interactive || interactiveAvatars.has(button)) return;
    interactiveAvatars.add(button);
    if (lastPointerEvent) applyGazeToAvatar(button, lastPointerEvent);
  };

  const unregisterAvatar = (button) => {
    if (!(button instanceof HTMLElement)) return;
    interactiveAvatars.delete(button);
    avatarButtons.delete(button);
    resetGazeForAvatar(button);
  };

  const createAvatarButton = ({
    className = "",
    onActivate = null,
    title = "",
    variant = "copilot",
    interactive = false,
    imageSrc = "",
    imageAlt = "",
    imagePosition = "50% 50%",
  } = {}) => {
    const vendor = window.LudwigAvatarVendor;
    const text = getCopy();
    const svg = vendor && typeof vendor.getSvg === "function"
      ? vendor.getSvg(variant)
      : vendor && vendor.svg
        ? vendor.svg
        : "";
    const resolvedImageSrc = String(imageSrc || "").trim();
    const mediaMarkup = resolvedImageSrc
      ? `
        <span class="site-copilot-avatar__photo-wrap" aria-hidden="true">
          <img
            class="site-copilot-avatar__photo"
            src="${resolvedImageSrc}"
            alt="${String(imageAlt || "").trim()}"
            loading="eager"
            decoding="async"
            style="object-position: ${String(imagePosition || "50% 50%").trim()};"
          />
        </span>
      `
      : svg;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `site-copilot-avatar site-copilot-avatar--${variant} ${className}`.trim();
    button.innerHTML = `
      <span class="site-copilot-avatar__glow"></span>
      ${mediaMarkup}
    `;
    button.setAttribute("aria-label", title || text.avatarLabel);
    button.setAttribute("title", title || text.avatarLabel);
    button.dataset.copilotAvatar = variant;
    if (typeof onActivate === "function") {
      button.addEventListener("click", (event) => onActivate({ event, button }));
    }
    registerAvatar(button, { interactive });
    return button;
  };

  window.addEventListener("pointermove", (event) => {
    lastPointerEvent = event;
    interactiveAvatars.forEach((button) => applyGazeToAvatar(button, event));
  });
  window.addEventListener("pointerleave", () => {
    lastPointerEvent = null;
    interactiveAvatars.forEach((button) => resetGazeForAvatar(button));
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSheet();
  });
  document.addEventListener("pointerdown", (event) => {
    const sheet = document.getElementById(SHEET_ID);
    if (!sheet || !sheet.classList.contains("is-open")) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (sheet.contains(target)) return;
    for (const button of avatarButtons.values()) {
      if (button.contains(target)) return;
    }
    closeSheet();
  });
  window.addEventListener("resize", () => {
    const sheet = document.getElementById(SHEET_ID);
    if (sheet && sheet.classList.contains("is-open")) {
      const anchor = document.querySelector("[data-copilot-anchor='active']");
      placeSheet(anchor);
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) return;
    lastPointerEvent = null;
    interactiveAvatars.forEach((button) => resetGazeForAvatar(button));
  });
  window.addEventListener("ludwig-language-changed", syncSheetCopy);

  window.LudwigCopilotBase = {
    VIEWPORT_QUERY,
    ASSISTANT_BOTTOM_OFFSET,
    isViewportSupported,
    getDefaultAnchorPosition,
    createAvatarButton,
    openSheet,
    closeSheet,
    ensureSheet,
    registerAvatar,
    unregisterAvatar,
    resolveProjectPath,
  };
})();
