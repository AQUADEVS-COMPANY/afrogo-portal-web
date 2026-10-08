/* Reusable DOM components. Data from the API is always set as text (no innerHTML). */
(function (w) {
  'use strict';
  const P = w.Portal;
  const { h, icon } = P;
  const BADGE = { pending: 'badge--pending', approved: 'badge--approved', rejected: 'badge--rejected' };

  const statusBadge = (status) => {
    const code = (status && status.code) || 'pending';
    return h('span', { class: 'badge ' + (BADGE[code] || 'badge--muted') },
      h('span', { class: 'badge__dot', 'aria-hidden': 'true' }), (status && status.name) || code);
  };

  /** Driver card: pending = normal, approved = soft green. */
  const driverCard = (d) => {
    const approved = d.status && d.status.code === 'approved';
    const name = P.fullName(d);
    const meta = (ic, label, val) => h('li', { class: 'meta__item' }, icon(ic), h('span', { class: 'sr-only' }, label + ': '), h('span', {}, val || '—'));
    return h('a', {
      class: 'driver-card ' + (approved ? 'is-approved' : 'is-pending'),
      href: P.path('driver-detail/') + '?id=' + P.enc(d.id),
      'data-reveal': '',
    },
    h('div', { class: 'driver-card__top' },
      h('span', { class: 'avatar', 'aria-hidden': 'true' }, P.initials(name)),
      h('div', { class: 'driver-card__id' }, h('h3', {}, name), statusBadge(d.status))),
    h('ul', { class: 'meta' },
      meta('idcard', 'DNI', d.dni),
      meta('phone', 'Celular', d.phone),
      meta('car', 'Vehículo', d.vehicleType && d.vehicleType.name)),
    h('div', { class: 'driver-card__time' },
      icon('clock'),
      h('div', {},
        h('small', {}, 'Registrado el'),
        h('strong', {}, d.createdAtDisplay || '—'),
        h('small', {}, approved ? 'Aprobado: ' + (d.approvedAtDisplay || '—') : P.timeAgo(d.createdAt)))),
    h('span', { class: 'driver-card__cta' }, 'Ver documentos', icon('arrow')));
  };

  /** Bitácora / history entry. */
  const logItem = (l, { showDriver = false } = {}) => {
    const code = (l.status && l.status.code) || 'pending';
    const who = l.user && l.user.fullName ? l.user.fullName : 'Postulante';
    return h('li', { class: 'log log--' + code, 'data-reveal': '' },
      h('div', { class: 'log__head' },
        showDriver ? h('span', { class: 'log__driver' }, l.fullName || '—') : null,
        statusBadge(l.status)),
      showDriver && l.email ? h('span', { class: 'log__who' }, l.email) : null,
      h('span', { class: 'log__who' }, 'Por: ' + who),
      l.comment ? h('p', { class: 'log__comment' }, l.comment) : null,
      h('span', { class: 'log__time' }, icon('clock', 'icon icon--sm'), l.createdAtDisplay || '—'));
  };

  const skeletons = (n, cls = 'skeleton--card') => Array.from({ length: n }, () => h('div', { class: 'skeleton ' + cls, 'aria-hidden': 'true' }));

  const emptyState = ({ icon: ic = 'search', title, text }) =>
    h('div', { class: 'state' }, h('span', { class: 'state__icon' }, icon(ic)), h('h3', {}, title), text ? h('p', {}, text) : null);

  const errorState = (message, onRetry) =>
    h('div', { class: 'state state--error', role: 'alert' },
      h('span', { class: 'state__icon' }, icon('alert')),
      h('h3', {}, 'No pudimos cargar la información'),
      h('p', {}, message),
      onRetry ? h('button', { class: 'btn btn--ghost btn--sm', type: 'button', onClick: onRetry }, icon('refresh'), 'Reintentar') : null);

  P.components = { statusBadge, driverCard, logItem, skeletons, emptyState, errorState };
})(window);
