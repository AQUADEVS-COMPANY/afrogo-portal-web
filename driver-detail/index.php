<?php
require_once __DIR__ . '/../shared/includes/config.php';
$pageTitle   = 'Detalle del conductor';
$pageAuth    = 'required';
$activeNav   = 'drivers';
$pageHeading = 'Detalle del conductor';
$pageCss     = ['driver-detail/css/detail.css'];
$pageJs      = ['driver-detail/js/detail.js'];
require INCLUDES_PATH . '/head.php';
?>
<div class="app">
<?php require INCLUDES_PATH . '/sidebar.php'; ?>
<div class="app__main">
<?php require INCLUDES_PATH . '/topbar.php'; ?>
<main id="main" class="page" tabindex="-1">
    <a class="btn btn--ghost btn--sm back" href="<?= e(url('drivers/')) ?>"><?= icon('back') ?>Volver a conductores</a>
    <div id="detail" aria-live="polite" aria-busy="true"></div>

    <section class="card history" aria-labelledby="historyTitle">
        <div class="section-head">
            <h2 id="historyTitle">Historial</h2>
            <a class="btn btn--ghost btn--sm" id="logsLink" href="<?= e(url('logs/')) ?>" target="_blank" rel="noopener" hidden><?= icon('logs') ?>Ver en Bitácora</a>
        </div>
        <ul class="timeline" id="historyList"></ul>
    </section>
</main>
</div>
</div>

<!-- PDF viewer -->
<dialog class="dialog dialog--wide" id="viewerDialog" aria-labelledby="viewerTitle">
    <div class="dialog__head">
        <div><h2 id="viewerTitle"></h2><small class="muted" id="viewerCounter"></small></div>
        <div class="dialog__tools">
            <button class="icon-btn" id="viewerPrev" type="button" aria-label="Documento anterior"><?= icon('prev') ?></button>
            <button class="icon-btn" id="viewerNext" type="button" aria-label="Documento siguiente"><?= icon('next') ?></button>
            <button class="icon-btn" id="viewerDownload" type="button" aria-label="Descargar documento"><?= icon('download') ?></button>
            <button class="icon-btn" type="button" data-close aria-label="Cerrar visor"><?= icon('close') ?></button>
        </div>
    </div>
    <div class="dialog__body viewer__body" id="viewerBody"></div>
    <p class="dialog__hint">Si el documento no se muestra en tu navegador, usa «Descargar». Flechas ← → para cambiar de documento.</p>
</dialog>

<!-- Approve -->
<dialog class="dialog" id="approveDialog" aria-labelledby="approveTitle">
    <div class="dialog__head"><h2 id="approveTitle">Aprobar solicitud</h2></div>
    <div class="dialog__body">
        <p>Vas a aprobar a <strong id="approveName"></strong>. Se enviará un correo al conductor confirmando que ya es conductor de AfroGo.</p>
        <div class="alert alert--error" id="approveAlert" role="alert" hidden></div>
    </div>
    <div class="dialog__foot">
        <button class="btn btn--ghost" type="button" data-close>Cancelar</button>
        <button class="btn btn--success" type="button" id="approveConfirm"><?= icon('check') ?>Sí, aprobar</button>
    </div>
</dialog>

<!-- Reject -->
<dialog class="dialog" id="rejectDialog" aria-labelledby="rejectTitle">
    <div class="dialog__head"><h2 id="rejectTitle">Rechazar solicitud</h2></div>
    <div class="dialog__body">
        <div class="alert alert--warning"><?= icon('alert') ?><span>Al rechazar se <strong>elimina al conductor y sus documentos</strong>. Solo quedará el registro en la Bitácora. Esta acción no se puede deshacer.</span></div>
        <div class="field">
            <label for="rejectReason">Motivo (opcional)</label>
            <div class="chips" id="reasonChips" role="group" aria-label="Motivos rápidos"></div>
            <textarea class="input" id="rejectReason" maxlength="200" rows="3" placeholder="Escribe el motivo que verá el conductor en el correo" aria-describedby="rejectReasonError reasonCount"></textarea>
            <span class="field__hint" id="reasonCount">0/200</span>
            <span class="field__error" id="rejectReasonError"></span>
        </div>
        <div class="alert alert--error" id="rejectAlert" role="alert" hidden></div>
    </div>
    <div class="dialog__foot">
        <button class="btn btn--ghost" type="button" data-close>Cancelar</button>
        <button class="btn btn--danger" type="button" id="rejectConfirm"><?= icon('x-circle') ?>Rechazar solicitud</button>
    </div>
</dialog>
<?php require INCLUDES_PATH . '/footer.php'; ?>
