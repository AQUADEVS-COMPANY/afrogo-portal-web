/* Driver detail: data, PDF viewer (fetch+blob), approve/reject (admin only), history. */
(function (w, d) {
  'use strict';
  const P = w.Portal;
  const { h, icon } = P;

  const REASONS = ['Documentos ilegibles', 'Documento vencido', 'Los datos no coinciden con el DNI', 'Faltan documentos válidos'];
  
  // Touch devices (iOS/Android) can't render PDFs inside an iframe.
  const isTouch = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  const canInline = navigator.pdfViewerEnabled !== false && !isTouch;

  P.whenAuthed(() => P.ready(() => {
    const id = P.params.get('id');
    const root = P.$('#detail');
    const history = P.$('#historyList');
    const viewer = { dlg: P.$('#viewerDialog'), body: P.$('#viewerBody'), index: 0, req: 0, url: null };
    const approveDlg = P.$('#approveDialog');
    const rejectDlg = P.$('#rejectDialog');
    let driver = null;

    [viewer.dlg, approveDlg, rejectDlg].forEach(P.dialog.bind);

    /* ---------- Load ---------- */
    async function load() {
      root.setAttribute('aria-busy', 'true');
      root.replaceChildren(...P.components.skeletons(1, 'skeleton--card'), ...P.components.skeletons(1, 'skeleton--card'));
      try {
        const res = await P.api.get('/api/admin/drivers/' + P.enc(id));
        driver = res.data;
        render();
        loadHistory();
      } catch (err) {
        driver = null;
        root.replaceChildren(err.status === 404
          ? P.components.emptyState({ icon: 'alert', title: 'Conductor no encontrado', text: 'La solicitud ya no existe (pudo ser rechazada) o el enlace es incorrecto.' })
          : P.components.errorState(err.message, load));
      } finally {
        root.setAttribute('aria-busy', 'false');
      }
    }

    async function loadHistory() {
      history.replaceChildren(...P.components.skeletons(1, 'skeleton--row'));
      P.$('#logsLink').href = P.path('logs/') + '?driverId=' + P.enc(id);
      P.$('#logsLink').hidden = false;
      try {
        const res = await P.api.get('/api/admin/driver-logs?driverId=' + P.enc(id));
        const items = (res.data || []).slice().sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
        history.replaceChildren(...(items.length ? items.map((l) => P.components.logItem(l)) : [h('li', { class: 'muted' }, 'Sin movimientos registrados.')]));
        P.animations.reveal(history);
      } catch (err) {
        history.replaceChildren(h('li', { class: 'muted' }, 'No se pudo cargar el historial. ' + err.message));
      }
    }

    /* ---------- Render ---------- */
    const info = (label, value, { copy } = {}) => h('div', { class: 'info' },
      h('span', { class: 'info__label' }, label),
      h('span', { class: 'info__value' }, value || '—',
        copy && value ? h('button', { class: 'icon-btn icon-btn--sm', type: 'button', 'aria-label': 'Copiar ' + label, onClick: () => P.copy(value, label) }, icon('copy')) : null));

    function render() {
      const x = driver;
      const code = x.status && x.status.code;
      const approved = code === 'approved';
      const pending = code === 'pending';
      const admin = P.session.isAdmin();
      const name = P.fullName(x);
      const docs = x.documents || [];

      const actions = admin && pending
        ? h('div', { class: 'actions' },
          h('button', { class: 'btn btn--success', type: 'button', onClick: openApprove }, icon('check'), 'Aprobar'),
          h('button', { class: 'btn btn--danger', type: 'button', onClick: openReject }, icon('x-circle'), 'Rechazar'))
        : null;

      const readOnly = !admin
        ? h('div', { class: 'alert alert--info' }, icon('info'), h('span', {}, 'Solo lectura: puedes ver y descargar los documentos, pero no aprobar ni rechazar.'))
        : null;

      const hero = h('section', { class: 'detail-hero card' + (approved ? ' is-approved' : ''), 'data-reveal': '' },
        h('div', { class: 'detail-hero__main' },
          h('span', { class: 'avatar avatar--lg', 'aria-hidden': 'true' }, P.initials(name)),
          h('div', {}, h('h1', {}, name), P.components.statusBadge(x.status))),
        h('div', { class: 'stamps' },
          h('div', { class: 'stamp' }, icon('clock'),
            h('div', {}, h('small', {}, 'Fecha y hora de creación'), h('strong', {}, x.createdAtDisplay || '—'), h('small', {}, P.timeAgo(x.createdAt)))),
          approved ? h('div', { class: 'stamp stamp--approved' }, icon('check'),
            h('div', {}, h('small', {}, 'Fecha y hora de aprobación'), h('strong', {}, x.approvedAtDisplay || '—'))) : null),
        actions, readOnly);

      const phone = x.phone ? h('a', { class: 'btn btn--ghost btn--sm', href: 'https://wa.me/51' + x.phone, target: '_blank', rel: 'noopener' }, icon('whatsapp'), 'WhatsApp') : null;
      const data = h('section', { class: 'card', 'data-reveal': '', 'aria-labelledby': 'dataTitle' },
        h('div', { class: 'section-head' }, h('h2', { id: 'dataTitle' }, 'Datos del conductor'), phone),
        h('div', { class: 'info-grid' },
          info('Nombres', x.firstName), info('Apellidos', x.lastName),
          info('DNI', x.dni, { copy: true }), info('Celular', x.phone, { copy: true }),
          info('Correo', x.email, { copy: true }),
          info('Tipo de vehículo', x.vehicleType && x.vehicleType.name),
          x.vehicleType && x.vehicleType.code === 'car' ? info('Luna polarizada', x.hasTintedPermit ? 'Sí, con permiso adjunto' : 'No') : null,
          info('ID de solicitud', x.id, { copy: true })));

      const docsSection = h('section', { class: 'card', 'data-reveal': '', 'aria-labelledby': 'docsTitle' },
        h('div', { class: 'section-head' }, h('h2', { id: 'docsTitle' }, 'Documentos subidos'), h('span', { class: 'badge badge--muted' }, `${docs.length} PDF`)),
        h('div', { class: 'docs' }, docs.map((doc, i) => docCard(doc, i))));

      root.replaceChildren(hero, data, docsSection);
      P.animations.reveal(root);
    }

    function docCard(doc, i) {
      const dl = h('button', { class: 'btn btn--ghost btn--sm', type: 'button', 'aria-label': 'Descargar ' + doc.label, onClick: () => download(doc, dl) }, icon('download'), 'Descargar');
      return h('article', { class: 'doc-card' },
        h('div', { class: 'doc-card__top' },
          h('span', { class: 'doc-card__icon' }, icon('doc')),
          h('div', {}, h('h3', {}, doc.label), h('span', { class: 'badge ' + (doc.required ? 'badge--pending' : 'badge--muted') }, doc.required ? 'Obligatorio' : 'Opcional'))),
        h('div', { class: 'doc-card__actions' },
          h('button', { class: 'btn btn--primary btn--sm', type: 'button', 'aria-label': 'Ver ' + doc.label, onClick: () => openViewer(i) }, icon('eye'), 'Ver'),
          dl));
    }

    /* ---------- PDF viewer (token via fetch, shown from a blob URL) ---------- */
    const releaseUrl = () => { if (viewer.url) { URL.revokeObjectURL(viewer.url); viewer.url = null; } };

    async function showDoc(i) {
      const docs = driver.documents;
      const doc = docs[i];
      if (!doc) return;
      viewer.index = i;
      const req = ++viewer.req;
      releaseUrl();
      P.$('#viewerTitle').textContent = doc.label;
      P.$('#viewerCounter').textContent = `${i + 1} de ${docs.length}`;
      P.$('#viewerPrev').disabled = i === 0;
      P.$('#viewerNext').disabled = i === docs.length - 1;
      viewer.body.replaceChildren(h('div', { class: 'viewer__loading' }, h('div', { class: 'spinner' }), h('p', {}, 'Cargando documento…')));
      try {
        const blob = await P.api.blob(doc.url);
        if (req !== viewer.req) return; // user moved on
        viewer.url = URL.createObjectURL(blob);
        
        viewer.body.replaceChildren(canInline
          ? h('iframe', { class: 'viewer__frame', src: viewer.url, title: 'Vista previa de ' + doc.label })
          : h('div', { class: 'viewer__loading' },
            icon('doc', 'icon viewer__icon'),
            h('p', {}, 'Tu dispositivo no puede mostrar el PDF dentro del portal.'),
            h('a', { class: 'btn btn--primary', href: viewer.url, target: '_blank', rel: 'noopener' }, icon('external'), 'Abrir PDF')));
      } catch (err) {
        if (req !== viewer.req) return;
        viewer.body.replaceChildren(P.components.errorState(err.message, () => showDoc(i)));
      }
    }

    function openViewer(i) {
      P.dialog.open(viewer.dlg);
      showDoc(i);
    }

    async function download(doc, btn) {
      P.setLoading(btn, true);
      try {
        const blob = await P.api.blob(doc.url);
        const url = URL.createObjectURL(blob);
        const a = h('a', { href: url, download: `${doc.code}_${driver.dni || driver.id}.pdf` });
        d.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      } catch (err) {
        P.toast(err.message, { type: 'error' });
      } finally {
        P.setLoading(btn, false);
      }
    }

    P.$('#viewerPrev').addEventListener('click', () => showDoc(viewer.index - 1));
    P.$('#viewerNext').addEventListener('click', () => showDoc(viewer.index + 1));
    P.$('#viewerDownload').addEventListener('click', (e) => download(driver.documents[viewer.index], e.currentTarget));
    viewer.dlg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' && viewer.index > 0) showDoc(viewer.index - 1);
      if (e.key === 'ArrowRight' && viewer.index < driver.documents.length - 1) showDoc(viewer.index + 1);
    });
    viewer.dlg.addEventListener('close', () => {
      viewer.req++;
      releaseUrl();
      viewer.body.replaceChildren();
    });

    /* ---------- Approve / reject (administrator only; API/DB re-validate) ---------- */
    const showErr = (box, msg) => {
      box.replaceChildren(icon('alert'), h('span', {}, msg));
      box.hidden = false;
    };

    /** Shared handling for approve/reject errors. */
    function actionError(err, dlg, box) {
      if (err.status === 404) {
        P.flash.set('La solicitud ya no existe.', 'warning');
        w.location.replace(P.path('drivers/'));
      } else if (err.status === 409) {
        P.dialog.close(dlg);
        P.toast(err.message, { type: 'warning' });
        load();
      } else {
        showErr(box, err.message);
        if (err.status === 403) load(); // role changed: refresh to hide buttons
      }
    }

    function openApprove() {
      P.$('#approveName').textContent = P.fullName(driver);
      P.$('#approveAlert').hidden = true;
      P.dialog.open(approveDlg);
    }

    P.$('#approveConfirm').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      P.setLoading(btn, true);
      P.$('#approveAlert').hidden = true;
      try {
        const res = await P.api.post('/api/admin/drivers/' + P.enc(id) + '/approve');
        P.dialog.close(approveDlg);
        P.toast((res && res.message) || 'Solicitud aprobada correctamente.', { type: 'success' });
        P.shell.refreshPending();
        load();
      } catch (err) {
        actionError(err, approveDlg, P.$('#approveAlert'));
      } finally {
        P.setLoading(btn, false);
      }
    });

    const reason = P.$('#rejectReason');
    const counter = P.$('#reasonCount');
    const updateCounter = () => { counter.textContent = `${reason.value.length}/200`; };
    P.$('#reasonChips').replaceChildren(...REASONS.map((t) => h('button', {
      class: 'chip', type: 'button',
      onClick: () => { reason.value = t; updateCounter(); P.setFieldError(reason, ''); reason.focus(); },
    }, t)));
    reason.addEventListener('input', updateCounter);

    function openReject() {
      reason.value = '';
      updateCounter();
      P.setFieldError(reason, '');
      P.$('#rejectAlert').hidden = true;
      P.dialog.open(rejectDlg);
    }

    P.$('#rejectConfirm').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      const text = reason.value.trim();
      if (!P.setFieldError(reason, P.validators.reason(text))) return;
      P.setLoading(btn, true);
      P.$('#rejectAlert').hidden = true;
      try {
        const res = await P.api.post('/api/admin/drivers/' + P.enc(id) + '/reject', text ? { reason: text } : {});
        // The driver is deleted: detail would now return 404, so go back to the list.
        P.flash.set((res && res.message) || 'Solicitud rechazada correctamente.', 'success');
        w.location.replace(P.path('drivers/'));
      } catch (err) {
        P.setLoading(btn, false);
        actionError(err, rejectDlg, P.$('#rejectAlert'));
      }
    });

    if (!id) {
      root.replaceChildren(P.components.emptyState({ icon: 'alert', title: 'Falta el conductor', text: 'Abre el detalle desde la lista de conductores.' }));
      root.setAttribute('aria-busy', 'false');
      return;
    }
    load();
  }));
})(window, document);
