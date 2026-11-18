let cipherInputBuffer = "";
window.addEventListener("keydown", (event) => {
  if (!isCipherModeRouteAllowed()) return;
  if (event.defaultPrevented) return;
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (isCipherEditableTarget(event.target)) return;

  let char = "";
  const key = String(event.key || "");
  if (key.length === 1 && /[a-z]/i.test(key)) {
    char = key.toLowerCase();
  } else if (event.code && /^Key[A-Z]$/i.test(event.code)) {
    char = event.code.slice(3).toLowerCase();
  }
  if (!char) return;

  cipherInputBuffer = `${cipherInputBuffer}${char}`.slice(-CIPHER_INPUT_MAX);
  if (cipherInputBuffer === CIPHER_TRIGGER) {
    cipherInputBuffer = "";
    window.LudwigCipherMode.toggle({ persist: true, notify: true });
  }
});

