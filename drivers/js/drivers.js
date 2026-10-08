/* Drivers list: live search, status/vehicle filters, queue sorting. */
(function (w) {
  'use strict';
  const P = w.Portal;

  P.whenAuthed(() => P.ready(() => {
    const grid = P.$('#driversGrid');
    const search = P.$('#search');
    const vehicle = P.$('#vehicle');
    const sort = P.$('#sort');
    const count = P.$('#resultCount');
    const chips = P.$$('.chip[data-status]');
    const state = { all: [], status: 'all' };

    const ts = (d) => Date.parse(d.createdAt) || 0;
    const code = (d) => (d.status && d.status.code) || '';
    const SORTS = {
      // Pending first (oldest first, to attend in order), then approved (newest first)
      queue: (a, b) => {
        const pa = code(a) === 'pending' ? 0 : 1;
        const pb = code(b) === 'pending' ? 0 : 1;
        if (pa !== pb) return pa - pb;
        return pa === 0 ? ts(a) - ts(b) : ts(b) - ts(a);
      },
      newest: (a, b) => ts(b) - ts(a),
      oldest: (a, b) => ts(a) - ts(b),
      name: (a, b) => P.fullName(a).localeCompare(P.fullName(b), 'es'),
    };

    function render() {
      const q = P.normalize(search.value);
      const list = state.all
        .filter((d) => state.status === 'all' || code(d) === state.status)
        .filter((d) => !vehicle.value || (d.vehicleType && d.vehicleType.code === vehicle.value))
        .filter((d) => !q || P.normalize([P.fullName(d), d.dni, d.phone, d.email].join(' ')).includes(q))
        .sort(SORTS[sort.value]);

      count.textContent = `${list.length} ${list.length === 1 ? 'conductor' : 'conductores'}`;
      grid.replaceChildren(...(list.length
        ? list.map(P.components.driverCard)
        : [P.components.emptyState({ title: 'Sin resultados', text: 'Prueba con otra búsqueda o cambia los filtros.' })]));
      P.animations.reveal(grid);
    }

    function fillFilters() {
      const pending = state.all.filter((d) => code(d) === 'pending').length;
      const approved = state.all.filter((d) => code(d) === 'approved').length;
      P.$('#countAll').textContent = state.all.length;
      P.$('#countPending').textContent = pending;
      P.$('#countApproved').textContent = approved;
      P.shell.setPending(pending);

      const types = new Map();
      state.all.forEach((d) => { if (d.vehicleType) types.set(d.vehicleType.code, d.vehicleType.name); });
      const current = vehicle.value;
      vehicle.replaceChildren(P.h('option', { value: '' }, 'Todos los vehículos'),
        ...Array.from(types, ([c, n]) => P.h('option', { value: c }, n)));
      vehicle.value = types.has(current) ? current : '';
    }

    async function load() {
      grid.setAttribute('aria-busy', 'true');
      count.textContent = '';
      grid.replaceChildren(...P.components.skeletons(6));
      try {
        const res = await P.api.get('/api/admin/drivers');
        state.all = res.data || [];
        fillFilters();
        render();
      } catch (err) {
        grid.replaceChildren(P.components.errorState(err.message, load));
      } finally {
        grid.setAttribute('aria-busy', 'false');
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
    search.addEventListener('input', P.debounce(render, 150));
    vehicle.addEventListener('change', render);
    sort.addEventListener('change', render);
    P.$('#refresh').addEventListener('click', load);

    load();
  }));
})(window);
