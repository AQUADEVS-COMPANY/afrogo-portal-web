/* App shell: user info, logout, mobile menu, pending badge, flash messages. */
(function (w, d) {
  'use strict';
  const P = w.Portal;

  function setPending(n) {
    try { w.sessionStorage.setItem(P.session.keys.pending, String(n)); } catch (_) { /* ignore */ }
    const badge = P.$('#navPending');
    if (!badge) return;
    badge.textContent = n > 99 ? '99+' : String(n);
    badge.hidden = !(n > 0);
  }

  async function refreshPending() {
    try {
      const res = await P.api.get('/api/admin/drivers?status=pending');
      setPending((res.data || []).length);
    } catch (_) { /* badge is optional */ }
  }

  P.shell = { setPending, refreshPending };

  P.ready(() => {
    if (d.body.dataset.auth !== 'required' || !P.authed) return;

    const u = P.session.user() || {};
    P.$$('[data-user-name]').forEach((el) => { el.textContent = u.fullName || ''; });
    P.$$('[data-user-role]').forEach((el) => { el.textContent = (u.role && u.role.name) || ''; });
    P.$$('[data-user-initials]').forEach((el) => { el.textContent = P.initials(u.fullName); });
    P.$$('[data-logout]').forEach((b) => b.addEventListener('click', () => P.session.logout('logout')));

    // Mobile sidebar
    const side = P.$('#sidebar');
    const overlay = P.$('#sidebarOverlay');
    const toggle = P.$('#menuToggle');
    if (side && toggle) {
      const set = (open) => {
        side.classList.toggle('is-open', open);
        overlay.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        d.body.classList.toggle('no-scroll', open);
      };
      toggle.addEventListener('click', () => set(!side.classList.contains('is-open')));
      overlay.addEventListener('click', () => set(false));
      d.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
      P.$$('.nav__link', side).forEach((a) => a.addEventListener('click', () => set(false)));
    }

    // Pending badge: cached value first, refresh unless the page already loads the list
    const cached = Number(w.sessionStorage.getItem(P.session.keys.pending));
    if (cached > 0) setPending(cached);
    if (!d.body.dataset.skipPending) refreshPending();

    const flash = P.flash.consume();
    if (flash) P.toast(flash.message, { type: flash.type });
  });
})(window, document);
