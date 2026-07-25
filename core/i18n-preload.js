(() => {
  const PENDING_STYLE_ID = 'site-i18n-pending-style';
  const ensurePendingStyle = () => {
    if (!document.head || document.getElementById(PENDING_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = PENDING_STYLE_ID;
    style.textContent = 'html.i18n-pending body[data-i18n-page]{visibility:hidden;}';
    document.head.appendChild(style);
  };

  try {
    const raw = String(localStorage.getItem('site_lang_v1') || '').trim();
    const lowered = raw.toLowerCase();
    const lang = !raw
      ? 'en'
      : (
          lowered === 'zh-hans' || lowered === 'zh-cn' || lowered === 'zh-sg'
            ? 'zh-Hans'
            : (
                lowered === 'zh-hant' || lowered === 'zh-tw' || lowered === 'zh-hk' || lowered === 'zh-mo'
                  ? 'zh-Hant'
                  : (lowered.startsWith('zh') ? 'zh-Hant' : (lowered === 'en-us' || lowered === 'en-gb' ? 'en' : raw))
              )
        );
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('data-site-lang', lang);
    if (lang !== 'en') {
      ensurePendingStyle();
      document.documentElement.classList.add('i18n-pending');
    }
  } catch (e) {}
})();
