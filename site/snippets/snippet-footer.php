<?php
  // site/snippets/snippet-footer.php
  $assets = $kirby->url('assets');
?>
  <script src="<?= $assets ?>/js/vendor.js"></script>
  <script src="<?= $assets ?>/js/app.min.js"></script>

  <?php if ($site->customEmbeds()->isNotEmpty()): ?>
    <?= $site->customEmbeds(); ?>
  <?php endif; ?>

</body>
</html>