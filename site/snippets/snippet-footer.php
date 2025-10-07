</body>

<script src="<?= $kirby->url('assets') ?>/js/vendor.js"></script>
<script src="<?= $kirby->url('assets') ?>/js/app.min.js"></script>

<? if($site->customEmbeds()->isNotEmpty()): ?>
	<?= $site->customEmbeds(); ?>
<? endif; ?>

</html>