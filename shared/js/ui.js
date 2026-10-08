/* UI primitives: toasts and native <dialog> helpers. */
(function (w, d) {
  'use strict';
  const P = w.Portal;
  const { h, icon } = P;
  const TYPE_ICON = { success: 'check', error: 'alert', info: 'info', warning: 'alert' };
  let box;

  function container() {
    if (!box) {
      box = h('div', { class: 'toasts', role: 'region', 'aria-label': 'Notificaciones', 'aria-live': 'polite' });
      d.body.append(box);
    }
    return box;
  }

  P.toast = (message, { type = 'info', duration = 5000 } = {}) => {
    const remove = () => {
      t.classList.add('is-leaving');
      setTimeout(() => t.remove(), 260);
    };
    const t = h('div', { class: 'toast toast--' + type, role: type === 'error' ? 'alert' : 'status' },
      icon(TYPE_ICON[type] || 'info'),
      h('p', {}, message),
      h('button', { class: 'icon-btn icon-btn--sm', type: 'button', 'aria-label': 'Cerrar notificación', onClick: remove }, icon('close')));
    container().append(t);
    if (duration) setTimeout(remove, duration);
    return remove;
  };

  P.dialog = {
    open(dlg) {
      if (dlg.open) return;
      dlg.showModal();
      d.body.classList.add('no-scroll');
    },
    close(dlg) {
      if (dlg.open) dlg.close();
    },
    /** Click on backdrop closes; body scroll lock is released on close. */
    bind(dlg) {
      dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener('close', () => {
        if (!P.$$('dialog[open]').length) d.body.classList.remove('no-scroll');
      });
    },
  };

  // Any [data-close] button closes its parent dialog.
  d.addEventListener('click', (e) => {
    const b = e.target.closest('[data-close]');
    const dlg = b && b.closest('dialog');
    if (dlg) dlg.close();
  });
})(window, document);
