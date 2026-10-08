<?php
/**
 * Document head + <body> opening.
 * Vars: $pageTitle, $pageDescription, $pageCss[], $bodyClass, $pageAuth ('required'|'guest'|'root'), $skipPending.
 */
send_security_headers();
$title       = isset($pageTitle) ? $pageTitle . ' · ' . PORTAL_NAME : PORTAL_NAME . ' | ' . PORTAL_SUBTITLE;
$description = $pageDescription ?? PORTAL_SUBTITLE . ' de AfroGo. Acceso restringido.';
$pageCss     = $pageCss ?? [];
$bodyClass   = $bodyClass ?? '';
$pageAuth    = $pageAuth ?? 'required';
$sharedCss   = ['variables', 'base', 'components', 'animations'];
?>
<!DOCTYPE html>
<html lang="es-PE">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= e($title) ?></title>
    <meta name="description" content="<?= e($description) ?>">
    <meta name="robots" content="noindex, nofollow, noarchive">
    <meta name="theme-color" content="#0B0620">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="es_PE">
    <meta property="og:site_name" content="<?= e(PORTAL_NAME) ?>">
    <meta property="og:title" content="<?= e($title) ?>">
    <meta property="og:description" content="<?= e($description) ?>">
    <link rel="icon" type="image/svg+xml" href="<?= e(asset('shared/img/favicon.svg')) ?>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@800&display=swap">
<?php foreach ($sharedCss as $css): ?>
    <link rel="stylesheet" href="<?= e(asset("shared/css/$css.css")) ?>">
<?php endforeach; ?>
<?php foreach ($pageCss as $css): ?>
    <link rel="stylesheet" href="<?= e(asset($css)) ?>">
<?php endforeach; ?>
    <noscript><link rel="stylesheet" href="<?= e(asset('shared/css/noscript.css')) ?>"></noscript>
</head>
<body class="is-guarding <?= e($bodyClass) ?>"
      data-auth="<?= e($pageAuth) ?>"
      data-api="<?= e(API_BASE_URL) ?>"
      data-base="<?= e(BASE_PATH) ?>"
      data-idle="<?= SESSION_IDLE_MIN ?>"
      data-warn="<?= SESSION_WARN_MIN ?>"<?= !empty($skipPending) ? ' data-skip-pending="1"' : '' ?>>
<?= icon_sprite() ?>

<a class="skip-link" href="#main">Saltar al contenido</a>
