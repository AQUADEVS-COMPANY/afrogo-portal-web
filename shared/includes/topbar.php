<?php /** Topbar. Var: $pageHeading. */ ?>
<header class="topbar">
    <button class="icon-btn menu-btn" id="menuToggle" type="button" aria-label="Abrir menú" aria-controls="sidebar" aria-expanded="false"><?= icon('menu') ?></button>
    <p class="topbar__title"><?= e($pageHeading ?? '') ?></p>
    <div class="topbar__right">
        <div class="user-chip">
            <span class="avatar avatar--sm" data-user-initials aria-hidden="true"></span>
            <div class="user-chip__txt">
                <strong data-user-name></strong>
                <small data-user-role></small>
            </div>
        </div>
        <button class="btn btn--ghost btn--sm" type="button" data-logout><?= icon('logout') ?><span>Salir</span></button>
    </div>
</header>
