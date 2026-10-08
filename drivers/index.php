<?php
require_once __DIR__ . '/../shared/includes/config.php';
$pageTitle   = 'Conductores';
$pageAuth    = 'required';
$activeNav   = 'drivers';
$pageHeading = 'Conductores';
$skipPending = true;
$pageCss     = ['drivers/css/drivers.css'];
$pageJs      = ['drivers/js/drivers.js'];
require INCLUDES_PATH . '/head.php';
?>
<div class="app">
<?php require INCLUDES_PATH . '/sidebar.php'; ?>
<div class="app__main">
<?php require INCLUDES_PATH . '/topbar.php'; ?>
<main id="main" class="page" tabindex="-1">
    <header class="page-head" data-reveal>
        <h1>Conductores</h1>
        <p>Solicitudes de conductores. Entra a una para ver todos sus documentos.</p>
    </header>

    <section class="toolbar card" aria-label="Filtros" data-reveal>
        <div class="search">
            <label class="sr-only" for="search">Buscar conductor</label>
            <?= icon('search') ?>
            <input class="input" id="search" type="search" placeholder="Buscar por nombre, DNI, celular o correo" autocomplete="off">
        </div>
        <div class="chips" role="group" aria-label="Filtrar por estado">
            <button class="chip is-active" type="button" data-status="all" aria-pressed="true">Todos <span class="chip__n" id="countAll">0</span></button>
            <button class="chip" type="button" data-status="pending" aria-pressed="false">Pendientes <span class="chip__n" id="countPending">0</span></button>
            <button class="chip" type="button" data-status="approved" aria-pressed="false">Aprobados <span class="chip__n" id="countApproved">0</span></button>
        </div>
        <div class="toolbar__selects">
            <div class="field"><label class="sr-only" for="vehicle">Tipo de vehículo</label>
                <select class="input" id="vehicle"><option value="">Todos los vehículos</option></select></div>
            <div class="field"><label class="sr-only" for="sort">Ordenar por</label>
                <select class="input" id="sort">
                    <option value="queue">Pendientes primero (más antiguas)</option>
                    <option value="newest">Más recientes</option>
                    <option value="oldest">Más antiguos</option>
                    <option value="name">Nombre (A-Z)</option>
                </select></div>
            <button class="btn btn--ghost btn--sm" id="refresh" type="button"><?= icon('refresh') ?>Actualizar</button>
        </div>
    </section>

    <p class="result-count" id="resultCount" aria-live="polite"></p>
    <section class="grid" id="driversGrid" aria-busy="true"></section>
</main>
</div>
</div>
<?php require INCLUDES_PATH . '/footer.php'; ?>
