(() => {
  const STORAGE_KEY = "site_companion_v1";
  const ROOT_ID = "site-companion";
  const DESKTOP_MEDIA = "(max-width: 991.98px)";
  let root = null;
  let dragState = null;
  let bodyClassObserver = null;
  let justDragged = false;

  const readPrefs = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object"
        ? {
            ...parsed,
            variant: typeof parsed.variant === "string" && parsed.variant.trim() ? parsed.variant.trim() : "companion-placeholder",
          }
        : { variant: "companion-placeholder" };
    } catch (error) {
      return { variant: "companion-placeholder" };
    }
  };

  const writePrefs = (next) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next && typeof next === "object" ? next : {}));
    } catch (error) {}
  };

  const isRouteSupported = () => {
    const path = String(window.location.pathname || "").toLowerCase();
    return !/(^|\/)(garden|labs|future)(\/|$)/.test(path);
  };

  const isViewportSupported = () => {
    if (typeof window.matchMedia === "function") {
      return !window.matchMedia(DESKTOP_MEDIA).matches;
    }
    return window.innerWidth > 991;
  };

  const isSupported = () => Boolean(window.LudwigCopilotBase && isRouteSupported() && isViewportSupported());

  const isSuppressedByContext = () => {
    if (!document.body) return false;
    return (
      document.body.classList.contains("reading-mode")
      || document.body.classList.contains("note-toc-open")
      || document.body.classList.contains("note-meta-open")
      || document.body.classList.contains("modal-open")
    );
  };

  const getState = () => {
    const prefs = readPrefs();
    return {
      enabled: prefs.enabled === true,
      supported: isSupported(),
      mounted: Boolean(root && root.isConnected),
      hiddenByContext: isSuppressedByContext(),
    };
  };

  const emitChange = () => {
    const state = getState();
    try {
      window.dispatchEvent(new CustomEvent("ludwig-companion-changed", { detail: state }));
    } catch (error) {}
    return state;
  };

  const clampPosition = (x, y) => {
    const width = root ? root.offsetWidth : 88;
    const height = root ? root.offsetHeight : 88;
    return {
      x: Math.min(Math.max(Number(x) || 12, 12), Math.max(12, window.innerWidth - width - 12)),
      y: Math.min(Math.max(Number(y) || 88, 88), Math.max(88, window.innerHeight - height - 16)),
    };
  };

  const getDefaultPosition = () => {
    const base = window.LudwigCopilotBase;
    if (!base || typeof base.getDefaultAnchorPosition !== "function") return clampPosition(18, window.innerHeight - 172);
    const pos = base.getDefaultAnchorPosition({
      width: root?.offsetWidth || 88,
      height: root?.offsetHeight || 88,
    });
    return clampPosition(pos.x, pos.y);
  };

  const applyPosition = (position, persist = false) => {
    if (!root) return;
    const next = clampPosition(position && position.x, position && position.y);
    root.style.left = `${next.x}px`;
    root.style.top = `${next.y}px`;
    if (persist) {
      writePrefs({ ...readPrefs(), positionMode: "custom", position: { x: next.x, y: next.y } });
    }
  };

  const syncPosition = () => {
    const prefs = readPrefs();
    if (prefs.positionMode === "custom" && prefs.position) {
      applyPosition(prefs.position, false);
      return;
    }
    applyPosition(getDefaultPosition(), false);
  };

  const syncVisibility = () => {
    if (!root) return;
    root.classList.toggle("is-suppressed", isSuppressedByContext());
  };

  const endDrag = (persist = true) => {
    if (!dragState || !root) return;
    root.classList.remove("is-dragging");
    justDragged = Boolean(dragState.moved);
    if (persist) applyPosition({ x: dragState.latestX, y: dragState.latestY }, true);
    dragState = null;
  };

  const bindDrag = () => {
    if (!root) return;
    const dragHandle = root.querySelector("[data-companion-drag]");
    if (!(dragHandle instanceof HTMLElement) || dragHandle.dataset.bound === "true") return;
    dragHandle.dataset.bound = "true";

    dragHandle.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || !root) return;
      const rect = root.getBoundingClientRect();
      dragState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: rect.left,
        originY: rect.top,
        latestX: rect.left,
        latestY: rect.top,
        moved: false,
      };
      root.classList.add("is-dragging");
      dragHandle.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    dragHandle.addEventListener("pointermove", (event) => {
      if (!dragState || event.pointerId !== dragState.pointerId) return;
      const next = clampPosition(
        dragState.originX + (event.clientX - dragState.startX),
        dragState.originY + (event.clientY - dragState.startY)
      );
      dragState.latestX = next.x;
      dragState.latestY = next.y;
      dragState.moved = true;
      applyPosition(next, false);
    });

    const release = (event) => {
      if (!dragState || event.pointerId !== dragState.pointerId) return;
      if (dragHandle.hasPointerCapture(event.pointerId)) {
        dragHandle.releasePointerCapture(event.pointerId);
      }
      endDrag(true);
    };

    dragHandle.addEventListener("pointerup", release);
    dragHandle.addEventListener("pointercancel", () => endDrag(false));
  };

  const bindBodyClassObserver = () => {
    if (bodyClassObserver || !document.body || typeof MutationObserver !== "function") return;
    bodyClassObserver = new MutationObserver(() => {
      syncVisibility();
      emitChange();
    });
    bodyClassObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  };

  const mount = () => {
    if (!document.body || !window.LudwigCopilotBase) return null;
    if (root && root.isConnected) {
      syncPosition();
      syncVisibility();
      return root;
    }
    const prefs = readPrefs();
    root = document.createElement("aside");
    root.id = ROOT_ID;
    root.className = "site-companion";
    const button = window.LudwigCopilotBase.createAvatarButton({
      className: "site-companion__avatar",
      title: "Companion",
      variant: prefs.variant || "companion-placeholder",
      interactive: true,
      onActivate: ({ button: anchorEl, event }) => {
        if (justDragged || (dragState && dragState.moved)) {
          justDragged = false;
          return;
        }
        event.preventDefault();
        if (window.LudwigCopilot?.open) {
          window.LudwigCopilot.open({ source: "companion", anchorEl });
        } else {
          window.LudwigCopilotBase.openSheet({ source: "companion", anchorEl });
        }
      },
    });
    button.dataset.companionDrag = "true";
    button.dataset.companionDragHandle = "true";
    button.setAttribute("data-companion-drag", "true");
    root.appendChild(button);
    document.body.appendChild(root);
    bindBodyClassObserver();
    bindDrag();
    syncPosition();
    syncVisibility();
    return root;
  };

  const unmount = () => {
    endDrag(false);
    if (root && root.parentElement) {
      const button = root.querySelector(".site-copilot-avatar");
      if (button && window.LudwigCopilotBase?.unregisterAvatar) {
        window.LudwigCopilotBase.unregisterAvatar(button);
      }
      root.remove();
    }
    root = null;
    justDragged = false;
  };

  const setEnabled = (enabled, persist = true) => {
    const prefs = { ...readPrefs(), enabled: Boolean(enabled) };
    if (persist) writePrefs(prefs);
    if (prefs.enabled && isSupported()) mount();
    else unmount();
    return emitChange();
  };

  const resetPosition = () => {
    const prefs = { ...readPrefs() };
    delete prefs.position;
    delete prefs.positionMode;
    writePrefs(prefs);
    if (root) syncPosition();
    justDragged = false;
    return emitChange();
  };

  const syncFromStorage = () => {
    const state = getState();
    if (state.enabled && state.supported) {
      if (root && root.isConnected) unmount();
      mount();
    }
    else unmount();
    if (root) {
      syncPosition();
      syncVisibility();
    }
    return emitChange();
  };

  const setVariant = (variant) => {
    const next = String(variant || "").trim() || "companion-placeholder";
    writePrefs({ ...readPrefs(), variant: next });
    return syncFromStorage();
  };

  const onViewportChange = () => {
    syncFromStorage();
  };

  if (typeof window.matchMedia === "function") {
    const viewportQuery = window.matchMedia(DESKTOP_MEDIA);
    if (typeof viewportQuery.addEventListener === "function") {
      viewportQuery.addEventListener("change", onViewportChange);
    } else if (typeof viewportQuery.addListener === "function") {
      viewportQuery.addListener(onViewportChange);
    }
  }

  window.addEventListener("resize", () => {
    if (root) syncPosition();
    emitChange();
  });
  window.addEventListener("ludwig-language-changed", () => {
    if (root) {
      const button = root.querySelector(".site-copilot-avatar");
      if (button instanceof HTMLElement) {
        button.setAttribute("aria-label", "Companion");
        button.setAttribute("title", "Companion");
      }
    }
  });
  window.addEventListener("ludwig-reading-mode-changed", syncVisibility);

  window.LudwigCompanion = {
    getState,
    isSupported,
    setEnabled: (enabled) => setEnabled(enabled, true),
    setVariant,
    resetPosition,
    syncFromStorage,
  };

  syncFromStorage();
})();
