(() => {
  const ROOT_ID = "site-copilot";
  let root = null;
  let bodyClassObserver = null;

  const isCompanionEnabled = () => {
    if (window.LudwigCompanionSettings && typeof window.LudwigCompanionSettings.getState === "function") {
      return window.LudwigCompanionSettings.getState().enabled === true;
    }
    try {
      const raw = localStorage.getItem("site_companion_v1");
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && parsed.enabled === true;
    } catch (error) {
      return false;
    }
  };

  const getCopilotVisibility = () => {
    if (window.LudwigCopilotSettings && typeof window.LudwigCopilotSettings.getVisibility === "function") {
      return window.LudwigCopilotSettings.getVisibility();
    }
    try {
      const raw = localStorage.getItem("site_copilot_visibility_v1");
      return raw === "off" || raw === "home" || raw === "all" ? raw : "all";
    } catch (error) {
      return "all";
    }
  };

  const isHomeRoute = () => {
    const path = String(window.location.pathname || "").toLowerCase();
    return path === "/" || path.endsWith("/index.html");
  };

  const isRouteSupported = () => {
    const path = String(window.location.pathname || "").toLowerCase();
    return !/(^|\/)(garden|labs|future)(\/|$)/.test(path);
  };

  const isSupported = () => {
    const base = window.LudwigCopilotBase;
    return Boolean(base && base.isViewportSupported && base.isViewportSupported() && isRouteSupported());
  };

  const shouldShowCopilot = () => {
    if (!isSupported() || isCompanionEnabled()) return false;
    const visibility = getCopilotVisibility();
    if (visibility === "off") return false;
    if (visibility === "home") return isHomeRoute();
    return true;
  };

  const syncPosition = () => {
    if (!root || !window.LudwigCopilotBase) return;
    const pos = window.LudwigCopilotBase.getDefaultAnchorPosition({
      width: root.offsetWidth || 88,
      height: root.offsetHeight || 88,
    });
    root.style.left = `${pos.x}px`;
    root.style.top = `${pos.y}px`;
  };

  const mount = () => {
    if (!window.LudwigCopilotBase || !document.body) return null;
    if (root && root.isConnected) {
      syncPosition();
      return root;
    }
    root = document.createElement("aside");
    root.id = ROOT_ID;
    root.className = "site-copilot";
    const button = window.LudwigCopilotBase.createAvatarButton({
      className: "site-copilot__button",
      variant: "copilot-photo",
      imageSrc: window.LudwigCopilotBase.resolveProjectPath("assets/images/copilot/copilot-smile-photo.jpeg"),
      imageAlt: "",
      imagePosition: "50% 38%",
      onActivate: ({ button: anchorEl }) => open({ source: "copilot", anchorEl }),
    });
    button.dataset.copilotAnchor = "active";
    root.appendChild(button);
    document.body.appendChild(root);
    syncPosition();
    bindBodyClassObserver();
    return root;
  };

  const unmount = () => {
    if (root && root.parentElement) {
      const button = root.querySelector(".site-copilot-avatar");
      if (button && window.LudwigCopilotBase?.unregisterAvatar) {
        window.LudwigCopilotBase.unregisterAvatar(button);
      }
      root.remove();
    }
    root = null;
  };

  const open = ({ source = "copilot", anchorEl = null } = {}) => {
    if (!window.LudwigCopilotBase) return;
    const anchor = anchorEl || root?.querySelector(".site-copilot-avatar") || null;
    window.LudwigCopilotBase.openSheet({ source, anchorEl: anchor });
  };

  const close = () => {
    window.LudwigCopilotBase?.closeSheet();
  };

  const syncVisibility = () => {
    if (shouldShowCopilot()) {
      mount();
      return;
    }
    unmount();
    close();
  };

  const bindBodyClassObserver = () => {
    if (bodyClassObserver || !document.body || typeof MutationObserver !== "function") return;
    bodyClassObserver = new MutationObserver(() => {
      if (!root) return;
      syncPosition();
    });
    bodyClassObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  };

  window.addEventListener("resize", syncVisibility);
  window.addEventListener("ludwig-copilot-changed", syncVisibility);
  window.addEventListener("ludwig-companion-changed", syncVisibility);
  window.addEventListener("ludwig-language-changed", syncVisibility);

  window.LudwigCopilot = {
    open,
    close,
    mount,
    unmount,
    syncVisibility,
  };

  syncVisibility();
})();
