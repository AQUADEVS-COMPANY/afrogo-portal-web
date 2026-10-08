/* Shared helpers. Exposes the global Portal namespace. */
(function (w, d) {
  'use strict';
  const P = (w.Portal = w.Portal || {});
  const ds = d.body.dataset;
  const NS = 'http://www.w3.org/2000/svg';
  const FLASH_KEY = 'afrogo_portal_flash';

  d.documentElement.classList.add('js');

  P.config = {
    apiBaseUrl: (ds.api || '').replace(/\/$/, ''),
    basePath: ds.base || '',
    idleMinutes: Number(ds.idle) || 15,
    warnMinutes: Number(ds.warn) || 5,
  };

  P.$ = (sel, ctx = d) => ctx.querySelector(sel);
  P.$$ = (sel, ctx = d) => Array.from(ctx.querySelectorAll(sel));
  P.ready = (fn) => (d.readyState === 'loading' ? d.addEventListener('DOMContentLoaded', fn) : fn());
  P.params = new URLSearchParams(w.location.search);
  P.reducedMotion = () => w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  P.path = (p) => P.config.basePath + '/' + String(p).replace(/^\/+/, '');
  P.enc = encodeURIComponent;

  /** Lowercase text without accents, for comparisons. */
  P.normalize = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  P.debounce = (fn, ms = 200) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  /** Safe DOM builder: never uses innerHTML. */
  P.h = (tag, props, ...children) => {
    const el = d.createElement(tag);
    Object.entries(props || {}).forEach(([k, v]) => {
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') el.className = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    children.flat(Infinity).forEach((c) => {
      if (c === null || c === undefined || c === false) return;
      el.append(c.nodeType ? c : d.createTextNode(String(c)));
    });
    return el;
  };

  /** Icon from the SVG sprite rendered by head.php. */
  P.icon = (name, cls = 'icon') => {
    const svg = d.createElementNS(NS, 'svg');
    svg.setAttribute('class', cls);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const use = d.createElementNS(NS, 'use');
    use.setAttribute('href', '#i-' + name);
    svg.append(use);
    return svg;
  };

  P.fullName = (x) => `${x.firstName || ''} ${x.lastName || ''}`.trim();
  P.initials = (name) => String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');

  /** "hace 5 min" from an ISO date. */
  P.timeAgo = (iso) => {
    const t = Date.parse(iso);
    if (Number.isNaN(t)) return '';
    const m = Math.floor(Math.max(0, Date.now() - t) / 60000);
    if (m < 1) return 'hace un momento';
    if (m < 60) return `hace ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `hace ${h} h`;
    const days = Math.floor(h / 24);
    return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
  };

  P.setLoading = (btn, on) => {
    if (!btn) return;
    btn.classList.toggle('is-loading', on);
    btn.disabled = on;
    btn.setAttribute('aria-busy', on ? 'true' : 'false');
  };

  P.copy = async (text, label = 'Dato') => {
    try {
      await navigator.clipboard.writeText(text);
      P.toast(`${label} copiado.`, { type: 'success', duration: 2200 });
    } catch (_) {
      P.toast('No se pudo copiar. Cópialo manualmente.', { type: 'error' });
    }
  };

  /** One-shot message shown on the next page load (see shell.js). */
  P.flash = {
    set(message, type = 'success') {
      try { w.sessionStorage.setItem(FLASH_KEY, JSON.stringify({ message, type })); } catch (_) { /* ignore */ }
    },
    consume() {
      try {
        const v = JSON.parse(w.sessionStorage.getItem(FLASH_KEY) || 'null');
        w.sessionStorage.removeItem(FLASH_KEY);
        return v;
      } catch (_) { return null; }
    },
  };
})(window, document);
