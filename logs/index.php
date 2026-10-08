<?php
require_once __DIR__ . '/../shared/includes/config.php';
$pageTitle   = 'Bitácora';
$pageAuth    = 'required';
$activeNav   = 'logs';
$pageHeading = 'Bitácora';
$pageCss     = ['logs/css/logs.css'];
$pageJs      = ['logs/js/logs.js'];
require INCLUDES_PATH . '/head.php';
?>
<div class="app">
<?php require INCLUDES_PATH . '/sidebar.php'; ?>
<div class="app__main">
<?php require INCLUDES_PATH . '/topbar.php'; ?>
<main id="main" class="page" tabindex="-1">
    <header class="page-head" data-reveal>
        <h1>Bitácora</h1>
        <p>Movimientos de las solicitudes: quién aprobó o rechazó y cuándo. Se muestran hasta 200 registros.</p>
    </header>

    <section class="toolbar card" aria-label="Filtros" data-reveal>
        <form class="logs-filter" id="logsForm" novalidate>
            <div class="field">
                <label for="logEmail">Filtrar por correo del conductor</label>
                <input class="input" id="logEmail" type="email" inputmode="email" autocomplete="off" placeholder="conductor@ejemplo.com">
            </div>
            <button class="btn btn--primary btn--sm" id="logsApply" type="submit"><?= icon('search') ?>Buscar</button>
            <button class="btn btn--ghost btn--sm" id="logsClear" type="button">Limpiar</button>
        </form>
        <div class="alert alert--info" id="driverFilter" hidden><?= icon('info') ?><span>Mostrando solo los movimientos de un conductor.</span></div>
        <div class="chips" role="group" aria-label="Filtrar por estado">
            <button class="chip is-active" type="button" data-status="all" aria-pressed="true">Todos <span class="chip__n" id="cAll">0</span></button>
            <button class="chip" type="button" data-status="pending" aria-pressed="false">Pendiente <span class="chip__n" id="cPending">0</span></button>
            <button class="chip" type="button" data-status="approved" aria-pressed="false">Aprobado <span class="chip__n" id="cApproved">0</span></button>
            <button class="chip" type="button" data-status="rejected" aria-pressed="false">Rechazado <span class="chip__n" id="cRejected">0</span></button>
        </div>
    </section>

    <ul class="timeline" id="logsList" aria-busy="true"></ul>
</main>
</div>
</div>
<?php require INCLUDES_PATH . '/footer.php'; ?>
