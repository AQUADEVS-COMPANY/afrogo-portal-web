/* Bitácora: driver-logs with server filters (driverId, email) and status chips. */
(function (w) {
  'use strict';
  const P = w.Portal;

  P.whenAuthed(() => P.ready(() => {
    const list = P.$('#logsList');
    const email = P.$('#logEmail');
    const chips = P.$$('.chip[data-status]');
    const driverId = P.params.get('driverId') || '';
    const state = { all: [], status: 'all' };
    const code = (l) => (l.status && l.status.code) || '';
    const ts = (l) => Date.parse(l.createdAt) || 0;

    P.$('#driverFilter').hidden = !driverId;

    function render() {
      const items = state.all.filter((l) => state.status === 'all' || code(l) === state.status);
      P.$('#cAll').textContent = state.all.length;
      ['pending', 'approved', 'rejected'].forEach((s) => {
        P.$('#c' + s[0].toUpperCase() + s.slice(1)).textContent = state.all.filter((l) => code(l) === s).length;
      });
      list.replaceChildren(...(items.length
        ? items.map((l) => P.components.logItem(l, { showDriver: true }))
        : [P.components.emptyState({ icon: 'logs', title: 'Sin movimientos', text: 'No hay registros con estos filtros.' })]));
      P.animations.reveal(list);
    }

    async function load() {
      list.setAttribute('aria-busy', 'true');
      list.replaceChildren(...P.components.skeletons(4, 'skeleton--row'));
      const q = new URLSearchParams();
      if (driverId) q.set('driverId', driverId);
      if (email.value.trim()) q.set('email', email.value.trim());
      try {
        const res = await P.api.get('/api/admin/driver-logs' + (q.toString() ? '?' + q : ''));
        state.all = (res.data || []).slice().sort((a, b) => ts(b) - ts(a));
        render();
      } catch (err) {
        list.replaceChildren(P.components.errorState(err.message, load));
      } finally {
        list.setAttribute('aria-busy', 'false');
      }
    }

    chips.forEach((chip) => chip.addEventListener('click', () => {
      state.status = chip.dataset.status;
      chips.forEach((c) => {
        const on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      render();
    }));
    P.$('#logsForm').addEventListener('submit', (e) => { e.preventDefault(); load(); });
    P.$('#logsClear').addEventListener('click', () => {
      email.value = '';
      if (driverId) w.location.replace(P.path('logs/'));
      else load();
    });

    load();
  }));
})(window);
