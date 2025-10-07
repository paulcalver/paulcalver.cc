<?php
  $assets = $kirby->url('assets');
?>
  <!-- Patch pushState so SPA URLs stay same-origin on localhost -->
  <script>
  (function () {
    var orig = history.pushState;
    history.pushState = function (state, title, url) {
      try {
        var base = document.body.dataset.basepath || location.href;
        var u = new URL(url, base);
        url = u.pathname + u.search + u.hash; // force relative, same-origin
      } catch (e) {}
      return orig.call(history, state, title, url);
    };
  })();
  </script>

  <script src="<?= $assets ?>/js/vendor.js"></script>
  <script src="<?= $assets ?>/js/app.min.js?v=<?= time() ?>"></script>

  <?php if ($site->customEmbeds()->isNotEmpty()): ?>
    <?= $site->customEmbeds(); ?>
  <?php endif; ?>
</body>
</html>