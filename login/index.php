<?php
require_once __DIR__ . '/../shared/includes/config.php';
$pageTitle = 'Iniciar sesión';
$pageAuth  = 'guest';
$bodyClass = 'page-login';
$pageCss   = ['login/css/login.css'];
$pageJs    = ['login/js/login.js'];
require INCLUDES_PATH . '/head.php';
?>
<div class="auth">
    <aside class="auth__brand" aria-hidden="false">
        <span class="shape shape--1"></span><span class="shape shape--2"></span><span class="shape shape--3"></span>
        <a class="brand" href="<?= e(url('login/')) ?>">
            <img src="<?= e(asset('shared/img/logo.svg')) ?>" alt="" width="48" height="48">
            <span><span class="brand__name"><?= e(PORTAL_NAME) ?></span><small class="brand__sub"><?= e(BRAND_SLOGAN) ?></small></span>
        </a>
        <div class="auth__pitch">
            <h1><?= e(PORTAL_SLOGAN) ?></h1>
            <p class="lead">Revisa los documentos de cada conductor y gestiona sus solicitudes en un solo lugar.</p>
            <ul class="auth__points">
                <li><?= icon('doc') ?><span>Visor de PDF seguro dentro del portal</span></li>
                <li><?= icon('shield') ?><span>Acceso por roles: administrador y secretario</span></li>
                <li><?= icon('logs') ?><span>Bitácora con quién aprobó o rechazó</span></li>
            </ul>
        </div>
        <small class="muted">Desarrollado por <?= e(DEVELOPER_NAME) ?></small>
    </aside>

    <main id="main" class="auth__panel" tabindex="-1">
        <section class="auth__card card" id="loginCard" aria-labelledby="loginTitle">
            <img class="auth__logo" src="<?= e(asset('shared/img/logo.svg')) ?>" alt="" width="52" height="52">
            <h2 id="loginTitle">Iniciar sesión</h2>
            <p><?= e(PORTAL_SUBTITLE) ?></p>

            <div class="alert alert--error" id="loginAlert" role="alert" hidden></div>

            <form id="loginForm" novalidate>
                <div class="field">
                    <label for="email">Correo electrónico</label>
                    <input class="input" id="email" name="email" type="email" inputmode="email" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="tucorreo@ejemplo.com" aria-describedby="emailError" required>
                    <span class="field__error" id="emailError"></span>
                </div>
                <div class="field">
                    <label for="password">Contraseña</label>
                    <div class="input-wrap">
                        <input class="input" id="password" name="password" type="password" autocomplete="current-password" placeholder="Tu contraseña" aria-describedby="passwordError capsHint" required>
                        <button class="icon-btn" id="togglePassword" type="button" aria-label="Mostrar contraseña" aria-pressed="false"><?= icon('eye') ?></button>
                    </div>
                    <span class="field__error" id="passwordError"></span>
                    <span class="field__hint" id="capsHint" hidden>Las mayúsculas están activadas.</span>
                </div>
                <button class="btn btn--primary btn--block" id="loginBtn" type="submit"><?= icon('lock') ?><span>Ingresar</span></button>
            </form>
            <p class="auth__note">Acceso solo para personal autorizado de AfroGo.</p>
        </section>
    </main>
</div>
<?php require INCLUDES_PATH . '/footer.php'; ?>
