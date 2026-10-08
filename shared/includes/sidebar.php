<?php
/** Sidebar navigation. Var: $activeNav ('dashboard'|'drivers'|'logs'). */
$activeNav = $activeNav ?? '';
$items = [
    ['key' => 'dashboard', 'label' => 'Inicio',      'icon' => 'home',  'href' => url('dashboard/'), 'new' => false],
    ['key' => 'drivers',   'label' => 'Conductores', 'icon' => 'users', 'href' => url('drivers/'),   'new' => false],
    ['key' => 'logs',      'label' => 'Bitácora',    'icon' => 'logs',  'href' => url('logs/'),      'new' => true],
];
?>
<div class="sidebar-overlay" id="sidebarOverlay"></div>
<aside class="sidebar" id="sidebar" aria-label="Navegación principal">
    <a class="brand" href="<?= e(url('dashboard/')) ?>">
        <img src="<?= e(asset('shared/img/logo.svg')) ?>" alt="" width="40" height="40">
        <span>
            <span class="brand__name"><?= e(PORTAL_NAME) ?></span>
            <small class="brand__sub">Portal de conductores</small>
        </span>
    </a>

    <nav class="nav">
<?php foreach ($items as $it): ?>
        <a class="nav__link" href="<?= e($it['href']) ?>"<?= $activeNav === $it['key'] ? ' aria-current="page"' : '' ?><?= $it['new'] ? ' target="_blank" rel="noopener" aria-label="' . e($it['label']) . ' (se abre en una pestaña nueva)"' : '' ?>>
            <?= icon($it['icon']) ?>
            <span><?= e($it['label']) ?></span>
<?php if ($it['key'] === 'drivers'): ?>
            <span class="nav__count" id="navPending" hidden title="Solicitudes pendientes">0</span>
<?php endif; ?>
<?php if ($it['new']): ?>
            <?= icon('external', 'icon icon--sm nav__ext') ?>
<?php endif; ?>
        </a>
<?php endforeach; ?>
    </nav>

    <div class="sidebar__foot">
        <p class="sidebar__slogan"><?= e(PORTAL_SLOGAN) ?></p>
        <small>Desarrollado por <a href="<?= e(DEVELOPER_URL) ?>" target="_blank" rel="noopener"><?= e(DEVELOPER_NAME) ?></a></small>
    </div>
</aside>
