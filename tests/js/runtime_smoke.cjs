// Smoke test for the site runtime (core/site/*.js).
// Runs the given scripts in order inside one shared Node vm context that mimics
// a browser page closely enough for load-time code: a minimal document/window,
// localStorage, matchMedia and timers that never fire. It reports load-time
// exceptions and the set of window.Ludwig* globals the scripts install.
//
// Usage: node tests/js/runtime_smoke.cjs <pathname> <script.js> [<script.js> ...]
// Prints one JSON line: {"errors": [...], "globals": [...], "htmlClasses": [...]}
'use strict';
const fs = require('fs');
const vm = require('vm');

const [pathname, ...files] = process.argv.slice(2);

const noop = () => {};
const makeClassList = () => {
  const set = new Set();
  return {
    add: (...c) => c.forEach((x) => set.add(String(x))),
    remove: (...c) => c.forEach((x) => set.delete(String(x))),
    toggle: (c, force) => { const on = force === undefined ? !set.has(c) : !!force; if (on) set.add(c); else set.delete(c); return on; },
    contains: (c) => set.has(c),
    get length() { return set.size; },
    [Symbol.iterator]: () => set.values(),
    _set: set,
  };
};
const makeElement = (tag = 'div') => {
  const el = {
    tagName: String(tag).toUpperCase(),
    classList: makeClassList(),
    style: { setProperty: noop, removeProperty: noop },
    dataset: {},
    attributes: {},
    children: [],
    childNodes: [],
    textContent: '',
    innerHTML: '',
    hidden: false,
    setAttribute(k, v) { this.attributes[k] = String(v); },
    getAttribute(k) { return k in this.attributes ? this.attributes[k] : null; },
    hasAttribute(k) { return k in this.attributes; },
    removeAttribute(k) { delete this.attributes[k]; },
    appendChild(c) { this.children.push(c); return c; },
    append(...c) { this.children.push(...c); },
    prepend(...c) { this.children.unshift(...c); },
    insertBefore(c) { this.children.push(c); return c; },
    insertAdjacentElement(_, c) { return c; },
    insertAdjacentHTML: noop,
    remove: noop,
    replaceChildren(...c) { this.children = c; },
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: () => true,
    querySelector: () => null,
    querySelectorAll: () => [],
    closest: () => null,
    matches: () => false,
    contains: () => false,
    focus: noop,
    blur: noop,
    click: noop,
    scrollIntoView: noop,
    scrollTo: noop,
    scrollBy: noop,
    getBoundingClientRect: () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }),
    getContext: () => null,
  };
  return el;
};

const storage = new Map();
const localStorage = {
  getItem: (k) => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear(),
};

const documentElement = makeElement('html');
const body = makeElement('body');
const head = makeElement('head');
const document = {
  documentElement, body, head,
  readyState: 'complete',
  title: '',
  cookie: '',
  createElement: (t) => makeElement(t),
  createElementNS: (_, t) => makeElement(t),
  createTextNode: (t) => ({ textContent: t }),
  createDocumentFragment: () => makeElement('fragment'),
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementsByTagName: () => [],
  addEventListener: noop,
  removeEventListener: noop,
  dispatchEvent: () => true,
};

class CustomEvent { constructor(type, init = {}) { this.type = type; this.detail = init.detail; } }

const window = {
  document,
  localStorage,
  sessionStorage: localStorage,
  location: { pathname, search: '', hash: '', href: `http://localhost${pathname}`, origin: 'http://localhost', protocol: 'http:' },
  navigator: { userAgent: 'node', language: 'en', clipboard: { writeText: () => Promise.resolve() }, maxTouchPoints: 0 },
  innerWidth: 1280,
  innerHeight: 800,
  devicePixelRatio: 1,
  matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop }),
  addEventListener: noop,
  removeEventListener: noop,
  dispatchEvent: () => true,
  setTimeout: () => 0,
  clearTimeout: noop,
  setInterval: () => 0,
  clearInterval: noop,
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: noop,
  requestIdleCallback: () => 0,
  getComputedStyle: () => ({ getPropertyValue: () => '' }),
  scrollTo: noop,
  scrollBy: noop,
  fetch: () => new Promise(noop),
  CustomEvent,
  Event: CustomEvent,
  URL, URLSearchParams, console,
  IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
  ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
  MutationObserver: class { observe() {} disconnect() {} },
};
window.window = window;
window.self = window;
window.globalThis = window;

const context = vm.createContext(window);
const errors = [];
for (const file of files) {
  try {
    new vm.Script(fs.readFileSync(file, 'utf8'), { filename: file }).runInContext(context);
  } catch (err) {
    errors.push(`${file}: ${err && err.message}`);
  }
}

const globals = Object.keys(window).filter((k) => /^Ludwig/.test(k)).sort();
const htmlClasses = [...documentElement.classList._set].sort();
process.stdout.write(JSON.stringify({ errors, globals, htmlClasses }) + '\n');
