<?php
/**
 * Global configuration and helpers for AfroGo Verifica.
 * Requires PHP 7.4+.
 */
declare(strict_types=1);

const PORTAL_NAME      = 'AfroGo Verifica';
const PORTAL_SUBTITLE  = 'Portal de Documentos de Conductores';
const PORTAL_SLOGAN    = 'Cada documento, bajo control';
const BRAND_SLOGAN     = 'Tu viaje, Nuestra cultura';
const API_BASE_URL     = 'https://m5s4qtmk-3000.brs.devtunnels.ms'; // Same URL used by afrogo-web. TODO: replace with the real API URL
const DEVELOPER_NAME   = 'Aquadevs Perú';
const DEVELOPER_URL    = 'https://www.aquadevsperu.com';
const SESSION_IDLE_MIN = 15; // Auto logout after this many idle minutes
const SESSION_WARN_MIN = 5;  // Warn this many minutes before the token expires
const INCLUDES_PATH    = __DIR__;

define('ROOT_PATH', dirname(__DIR__, 2));

// Detect the base path so it works in the web root or in a subfolder.
$docRoot = realpath($_SERVER['DOCUMENT_ROOT'] ?? '') ?: '';
$siteDir = realpath(ROOT_PATH) ?: ROOT_PATH;
$base    = ($docRoot !== '' && strpos($siteDir, $docRoot) === 0)
    ? str_replace('\\', '/', substr($siteDir, strlen($docRoot)))
    : '';
define('BASE_PATH', rtrim($base, '/'));

/** Escape output for HTML. */
function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** Site URL (path only). */
function url(string $path = ''): string
{
    return BASE_PATH . '/' . ltrim($path, '/');
}

/** Asset URL with cache-busting based on file modification time. */
function asset(string $path): string
{
    $file = ROOT_PATH . '/' . ltrim($path, '/');
    return url($path) . (is_file($file) ? '?v=' . filemtime($file) : '');
}

/** Security headers: strict CSP (no inline scripts), noindex, no cache. */
function send_security_headers(): void
{
    $p      = parse_url(API_BASE_URL) ?: [];
    $origin = ($p['scheme'] ?? 'http') . '://' . ($p['host'] ?? 'localhost') . (isset($p['port']) ? ':' . $p['port'] : '');
    header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' $origin; frame-src blob:; object-src blob:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
    header('X-Robots-Tag: noindex, nofollow, noarchive');
    header('Cache-Control: no-store');
}

/** Stroke icon paths (24x24). Paths are separated by "|". Used for the SVG sprite. */
const ICONS = [
    'shield'   => 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z|M9 12l2 2 4-4',
    'check'    => 'M5 13l4 4L19 7',
    'home'     => 'M3 11l9-8 9 8|M5 10v10h14V10|M10 20v-6h4v6',
    'users'    => 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z|M2.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5|M16 4.3a3.5 3.5 0 0 1 0 6.4|M18 14.8c2 .7 3.5 2.4 3.5 5.2',
    'user'     => 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z|M4 21c0-4 3.5-6 8-6s8 2 8 6',
    'doc'      => 'M7 3h7l5 5v13H7z|M14 3v5h5|M10 13h6|M10 17h6',
    'logs'     => 'M9 4h6v3H9z|M7 5H5v16h14V5h-2|M9 12h6|M9 16h6',
    'logout'   => 'M9 4H5v16h4|M16 8l4 4-4 4|M20 12H9',
    'search'   => 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z|M20 20l-4-4',
    'eye'      => 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z|M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    'eye-off'  => 'M3 3l18 18|M10.6 6.1A9.8 9.8 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9|M6.2 6.9C3.6 8.7 2 12 2 12s4 7 10 7c1.5 0 2.9-.4 4.1-1|M9.9 9.9a3 3 0 0 0 4.2 4.2',
    'download' => 'M12 3v12|M7 11l5 5 5-5|M4 21h16',
    'copy'     => 'M9 9h11v11H9z|M5 15V4h11',
    'phone'    => 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
    'mail'     => 'M3 5h18v14H3z|M3 7l9 6 9-6',
    'whatsapp' => 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z',
    'back'     => 'M19 12H5|M11 6l-6 6 6 6',
    'arrow'    => 'M5 12h14|M13 6l6 6-6 6',
    'prev'     => 'M15 6l-6 6 6 6',
    'next'     => 'M9 6l6 6-6 6',
    'close'    => 'M6 6l12 12|M18 6L6 18',
    'alert'    => 'M12 3l10 18H2z|M12 10v5|M12 18h.01',
    'info'     => 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z|M12 11v5|M12 8h.01',
    'lock'     => 'M5 11h14v10H5z|M8 11V7a4 4 0 0 1 8 0v4',
    'refresh'  => 'M20 11a8 8 0 1 0-2.3 5.7|M20 4v7h-7',
    'external' => 'M14 4h6v6|M20 4l-9 9|M18 14v6H4V6h6',
    'clock'    => 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z|M12 7v5l3 2',
    'menu'     => 'M4 6h16|M4 12h16|M4 18h16',
    'idcard'   => 'M3 5h18v14H3z|M8 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z|M5 16c0-1.5 1.5-2.5 3-2.5s3 1 3 2.5|M14 10h5|M14 14h4',
    'car'      => 'M5 16l1.5-5.5A2 2 0 0 1 8.4 9h7.2a2 2 0 0 1 1.9 1.5L19 16|M3 16h18v3H3z|M7 19v1.5|M17 19v1.5',
    'x-circle' => 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z|M9 9l6 6|M15 9l-6 6',
];

/** Hidden SVG sprite, referenced with <use href="#i-name">. */
function icon_sprite(): string
{
    $out = '<svg class="sprite" aria-hidden="true" focusable="false">';
    foreach (ICONS as $name => $paths) {
        $out .= '<symbol id="i-' . $name . '" viewBox="0 0 24 24">';
        foreach (explode('|', $paths) as $d) {
            $out .= '<path d="' . $d . '"/>';
        }
        $out .= '</symbol>';
    }
    return $out . '</svg>';
}

/** Inline icon that uses the sprite. */
function icon(string $name, string $class = 'icon'): string
{
    return '<svg class="' . e($class) . '" aria-hidden="true" focusable="false"><use href="#i-' . e($name) . '"/></svg>';
}
