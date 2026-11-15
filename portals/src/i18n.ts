import { useEffect, useState } from 'react';

// Portals follows the main site's language preference (localStorage `site_lang_v1`,
// same normalisation as core/script.js). It is a separate page, so it reads the value on load
// and re-reads it when another tab changes it (`storage` event).
export type Lang = 'zh-Hant' | 'zh-Hans' | 'en';
export type LocalizedText = Record<Lang, string>;

export const LANG_KEY = 'site_lang_v1';

export function normalizeLang(value: string | null | undefined): Lang {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'zh-hans' || raw === 'zh-cn' || raw === 'zh-sg') return 'zh-Hans';
  if (raw.startsWith('zh')) return 'zh-Hant';
  if (raw.startsWith('en')) return 'en';
  return 'zh-Hant';
}

export function readLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved) return normalizeLang(saved);
  } catch {
    /* storage unavailable */
  }
  return normalizeLang(typeof navigator !== 'undefined' ? navigator.language : 'zh-Hant');
}

export function useLang(): Lang {
  const [lang, setLang] = useState<Lang>(readLang);
  useEffect(() => {
    const sync = () => setLang(readLang());
    window.addEventListener('storage', sync);
    window.addEventListener('ludwig-language-changed', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('ludwig-language-changed', sync);
    };
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    document.title = UI.pageTitle[lang];
  }, [lang]);
  return lang;
}

/** Interpolate `{name}` placeholders */
export function fmt(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

const L = (zhHant: string, zhHans: string, en: string): LocalizedText => ({
  'zh-Hant': zhHant,
  'zh-Hans': zhHans,
  en,
});

// All UI copy in one place. One concrete sentence per item; no adjective stacks.
export const UI = {
  pageTitle: L('傳送門 · Ludwigia', '传送门 · Ludwigia', 'Portals · Ludwigia'),
  brand: L('Portals', 'Portals', 'Portals'),
  home: L('首頁', '首页', 'Home'),
  garden: L('數位花園', '数字花园', 'Garden'),
  world: L('Ludwigia World', 'Ludwigia World', 'Ludwigia World'),
  goHome: L('回到主站首頁', '回到主站首页', 'Back to the main site'),
  goGarden: L('前往數位花園', '前往数字花园', 'Go to the Digital Garden'),
  goWorld: L('前往 Ludwigia World', '前往 Ludwigia World', 'Go to Ludwigia World'),
  resetView: L('回到起點', '回到起点', 'Back to start'),
  soundOn: L('開啟音效', '开启音效', 'Sound on'),
  soundOff: L('關閉音效', '关闭音效', 'Sound off'),

  welcomeEyebrow: L('Ludwigia 的傳送門大廳', 'Ludwigia 的传送门大厅', 'The Ludwigia portal hall'),
  welcomeTitle: L('選一扇門，走進去', '选一扇门，走进去', 'Pick a door and step through'),
  welcomeBody: L(
    '左右拖曳瀏覽。點一下傳送門就會直接進入那個世界。',
    '左右拖动浏览。点一下传送门就会直接进入那个世界。',
    'Drag sideways to look around. Click a portal to go straight into that world.',
  ),
  welcomeOpen: L('目前開放：數位花園、Ludwigia World', '目前开放：数字花园、Ludwigia World', 'Open now: Digital Garden and Ludwigia World'),
  welcomeStart: L('開始', '开始', 'Start'),

  enter: L('進入', '进入', 'Enter'),
  sealed: L('尚未開放', '尚未开放', 'Not open yet'),
  sealedNotice: L('{name} 尚未開放', '{name} 尚未开放', '{name} is not open yet'),
  clickToEnter: L('點擊進入', '点击进入', 'Click to enter'),
  warping: L('前往', '前往', 'Going to'),
  cancelWarp: L('取消（Esc）', '取消（Esc）', 'Cancel (Esc)'),
  portalAria: L('傳送門：{name}，進入 {dest}', '传送门：{name}，进入 {dest}', 'Portal: {name}, enters {dest}'),
  portalSealedAria: L('傳送門：{name}，尚未開放', '传送门：{name}，尚未开放', 'Portal: {name}, not open yet'),

  panLeft: L('往左', '往左', 'Pan left'),
  panRight: L('往右', '往右', 'Pan right'),
  minimapHint: L('拖曳或滾輪平移 · 點圓點跳轉', '拖动或滚轮平移 · 点圆点跳转', 'Drag or scroll to pan · click a dot to jump'),
  swipeHint: L('左右滑動切換', '左右滑动切换', 'Swipe to switch'),
  jumpTo: L('跳到 {name}', '跳到 {name}', 'Jump to {name}'),

  timeOfDay: L('時段', '时段', 'Time of day'),
  autoCycle: L('自動輪替', '自动轮替', 'Auto cycle'),
  pauseCycle: L('暫停自動輪替', '暂停自动轮替', 'Pause auto cycle'),
  resumeCycle: L('恢復自動輪替', '恢复自动轮替', 'Resume auto cycle'),
  openHud: L('調整時段', '调整时段', 'Change time of day'),
  closeHud: L('收合', '收合', 'Collapse'),
  phase: {
    dawn: L('清晨', '清晨', 'Dawn'),
    day: L('正午', '正午', 'Noon'),
    dusk: L('黃昏', '黄昏', 'Dusk'),
    night: L('夜晚', '夜晚', 'Night'),
  },
} as const;
