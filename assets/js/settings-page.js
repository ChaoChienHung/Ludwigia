(() => {
  const init = () => {
    const runtime = window.LudwigSettingsRuntime || null;
    if (!runtime) return;
    const syncState = runtime.createStateSync
      ? runtime.createStateSync(document)
      : () => runtime.syncState(document);

    if (typeof runtime.bindSurface === "function") {
      runtime.bindSurface(document, { onAfterAction: syncState });
    }
    if (typeof runtime.bindScrollControls === "function") {
      runtime.bindScrollControls(document);
    }

    syncState();
    window.addEventListener("ludwig-language-changed", syncState);
    window.addEventListener("ludwig-theme-changed", syncState);
    window.addEventListener("ludwig-palette-changed", syncState);
    window.addEventListener("ludwig-theme-motion-changed", syncState);
    window.addEventListener("ludwig-copilot-changed", syncState);
    window.addEventListener("ludwig-cipher-mode-changed", syncState);
    window.addEventListener("ludwig-companion-changed", syncState);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
