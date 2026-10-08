<?php
require_once __DIR__ . '/../shared/includes/config.php';
$pageTitle   = 'Inicio';
$pageAuth    = 'required';
$activeNav   = 'dashboard';
$pageHeading = 'Inicio';
$skipPending = true;
$pageCss     = ['dashboard/css/dashboard.css'];
$pageJs      = ['dashboard/js/dashboard.js'];
require INCLUDES_PATH . '/head.php';
?>
<div class="app">
<?php require INCLUDES_PATH . '/sidebar.php'; ?>
<div class="app__main">
<?php require INCLUDES_PATH . '/topbar.php'; ?>
<main id="main" class="page" tabindex="-1">
    <section class="welcome card" data-reveal>
        <div>
            <span class="role-pill" id="rolePill"></span>
            <h1>Hola, <span class="gradient-text" id="welcomeName"></span></h1>
            <p><?= e(PORTAL_SLOGAN) ?>. Revisa las solicitudes de los conductores y sus documentos.</p>
        </div>
        <a class="btn btn--primary" href="<?= e(url('drivers/')) ?>"><?= icon('users') ?>Ver conductores</a>
    </section>

    <div class="alert alert--info" id="readOnlyNote" hidden data-reveal>
        <?= icon('info') ?><span>Tu rol es de <strong>solo lectura</strong>: puedes ver y descargar los documentos, pero no aprobar ni rechazar.</span>
    </div>

    <section class="kpis" aria-label="Resumen">
        <article class="kpi card kpi--pending" data-reveal><span class="kpi__icon"><?= icon('clock') ?></span><div><strong id="kpiPending">–</strong><span>Pendientes</span></div></article>
        <article class="kpi card kpi--approved" data-reveal><span class="kpi__icon"><?= icon('check') ?></span><div><strong id="kpiApproved">–</strong><span>Aprobados</span></div></article>
        <article class="kpi card" data-reveal><span class="kpi__icon"><?= icon('users') ?></span><div><strong id="kpiTotal">–</strong><span>Total</span></div></article>
    </section>

    <section class="quick" aria-label="Accesos rápidos">
        <a class="quick__card card" href="<?= e(url('drivers/')) ?>" data-reveal>
            <span class="quick__icon"><?= icon('users') ?></span>
            <div><h3>Ver conductores</h3><p>Lista, filtros y detalle con todos sus documentos.</p></div>
            <?= icon('arrow', 'icon quick__arrow') ?>
        </a>
        <a class="quick__card card" href="<?= e(url('logs/')) ?>" target="_blank" rel="noopener" data-reveal>
            <span class="quick__icon"><?= icon('logs') ?></span>
            <div><h3>Bitácora <?= icon('external', 'icon icon--sm') ?></h3><p>Quién aprobó o rechazó cada solicitud. Se abre en otra pestaña.</p></div>
            <?= icon('arrow', 'icon quick__arrow') ?>
        </a>
    </section>

    <section aria-labelledby="oldestTitle">
        <div class="section-head" data-reveal>
            <h2 id="oldestTitle">Pendientes más antiguas</h2>
            <a class="btn btn--ghost btn--sm" href="<?= e(url('drivers/')) ?>">Ver todos</a>
        </div>
        <div class="grid" id="pendingList" aria-busy="true"></div>
    </section>
</main>
</div>
</div>
<?php require INCLUDES_PATH . '/footer.php'; ?>
