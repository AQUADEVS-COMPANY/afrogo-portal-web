<?php
// Entry point: JS decides between /login and /dashboard based on the session.
require_once __DIR__ . '/shared/includes/config.php';
$pageTitle = 'Redirigiendo';
$pageAuth  = 'root';
require INCLUDES_PATH . '/head.php';
?>
<main id="main"></main>
<?php require INCLUDES_PATH . '/footer.php'; ?>
