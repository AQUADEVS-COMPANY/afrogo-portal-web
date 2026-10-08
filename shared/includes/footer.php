<?php
/** Closes the document and loads scripts. Var: $pageJs[]. */
$pageJs   = $pageJs ?? [];
$sharedJs = ['utils', 'ui', 'validators', 'session', 'api-client', 'animations', 'components', 'shell'];
?>
<noscript><p class="noscript-msg">Necesitas activar JavaScript para usar <?= e(PORTAL_NAME) ?>.</p></noscript>
<?php foreach ($sharedJs as $js): ?>
<script src="<?= e(asset("shared/js/$js.js")) ?>"></script>
<?php endforeach; ?>
<?php foreach ($pageJs as $js): ?>
<script src="<?= e(asset($js)) ?>"></script>
<?php endforeach; ?>
</body>
</html>
