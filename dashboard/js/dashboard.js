/* Dashboard: counters and the oldest pending requests. */
(function (w) {
  'use strict';
  const P = w.Portal;

  P.whenAuthed(() => P.ready(() => {
    const u = P.session.user();
    P.$('#welcomeName').textContent = (u.fullName || '').split(' ')[0];
    P.$('#rolePill').textContent = (u.role && u.role.name) || '';
    P.$('#readOnlyNote').hidden = P.session.isAdmin();

    const list = P.$('#pendingList');
    const ts = (d) => Date.parse(d.createdAt) || 0;

    async function load() {
      list.setAttribute('aria-busy', 'true');
      list.replaceChildren(...P.components.skeletons(3));
      try {
        const res = await P.api.get('/api/admin/drivers');
        const all = res.data || [];
        const pending = all.filter((d) => d.status && d.status.code === 'pending').sort((a, b) => ts(a) - ts(b));
        const approved = all.filter((d) => d.status && d.status.code === 'approved');

        P.animations.countUp(P.$('#kpiPending'), pending.length);
        P.animations.countUp(P.$('#kpiApproved'), approved.length);
        P.animations.countUp(P.$('#kpiTotal'), all.length);
        P.shell.setPending(pending.length);

        list.replaceChildren(...(pending.length
          ? pending.slice(0, 6).map(P.components.driverCard)
          : [P.components.emptyState({ icon: 'check', title: '¡Todo al día!', text: 'No hay solicitudes pendientes por revisar.' })]));
        P.animations.reveal(list);
      } catch (err) {
        list.replaceChildren(P.components.errorState(err.message, load));
      } finally {
        list.setAttribute('aria-busy', 'false');
      }
    }
    load();
  }));
})(window);
