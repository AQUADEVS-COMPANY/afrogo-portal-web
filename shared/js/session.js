/* Session (sessionStorage), page guard, expiry and inactivity watchers. */
(function (w, d) {
  'use strict';
  const P = w.Portal;
  const S = w.sessionStorage;
  const K = { token: 'afrogo_portal_token', user: 'afrogo_portal_user', exp: 'afrogo_portal_exp', pending: 'afrogo_portal_pending' };
  const read = (k) => { try { return S.getItem(k); } catch (_) { return null; } };
  const write = (k, v) => { try { S.setItem(k, v); } catch (_) { /* ignore */ } };

  const session = {
    keys: K,
    save({ token, user, expiresAt }) {
      write(K.token, token);
      write(K.user, JSON.stringify(user));
      write(K.exp, expiresAt || '');
    },
    token: () => read(K.token),
    user() {
      try { return JSON.parse(read(K.user) || 'null'); } catch (_) { return null; }
    },
    expiresAt() {
      const t = Date.parse(read(K.exp) || '');
      return Number.isNaN(t) ? null : t;
    },
    isValid() {
      if (!read(K.token) || !session.user()) return false;
      const e = session.expiresAt();
      return e === null || e > Date.now();
    },
    isAdmin() {
      const u = session.user();
      return !!(u && u.role && u.role.code === 'administrator');
    },
    clear() {
      Object.values(K).forEach((k) => { try { S.removeItem(k); } catch (_) { /* ignore */ } });
    },
    logout(reason) {
      session.clear();
      w.location.replace(P.path('login/') + (reason ? '?reason=' + P.enc(reason) : ''));
    },
  };
  P.session = session;
  P.authed = false;
  P.whenAuthed = (fn) => { if (P.authed) fn(); };

  const reveal = () => d.body.classList.remove('is-guarding');
  const mode = d.body.dataset.auth;

  if (mode === 'root') {
    w.location.replace(P.path(session.isValid() ? 'dashboard/' : 'login/'));
  } else if (mode === 'guest') {
    if (session.isValid()) w.location.replace(P.path('dashboard/'));
    else reveal();
  } else if (!session.isValid()) {
    session.logout(read(K.token) ? 'expired' : '');
  } else {
    P.authed = true;
    reveal();
    startWatchers();
  }

  /** Token expiry warning + auto logout, and inactivity logout. */
  function startWatchers() {
    const MAX = 2147483647;
    const exp = session.expiresAt();
    if (exp) {
      const warnIn = exp - P.config.warnMinutes * 60000 - Date.now();
      if (warnIn > 0) {
        setTimeout(() => P.toast(`Tu sesión vencerá en ${P.config.warnMinutes} minutos. Guarda tu trabajo.`, { type: 'warning', duration: 10000 }), Math.min(warnIn, MAX));
      }
      setTimeout(() => session.logout('expired'), Math.min(Math.max(exp - Date.now(), 0), MAX));
    }

    let last = Date.now();
    let warned = false;
    ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((ev) => d.addEventListener(ev, () => { last = Date.now(); }, { passive: true }));
    const limit = P.config.idleMinutes * 60000;
    setInterval(() => {
      const idle = Date.now() - last;
      if (idle >= limit) session.logout('inactive');
      else if (idle >= limit - 60000 && !warned) {
        warned = true;
        P.toast('Cerraremos tu sesión en 1 minuto por inactividad.', { type: 'warning', duration: 8000 });
      } else if (idle < limit - 60000) warned = false;
    }, 15000);

    // Timers can be throttled while the tab sleeps: re-check on return.
    d.addEventListener('visibilitychange', () => {
      if (!d.hidden && !session.isValid()) session.logout('expired');
    });
  }
})(window, document);
