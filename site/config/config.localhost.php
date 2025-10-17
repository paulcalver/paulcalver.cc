<?php

return [
  'debug' => false,

  // The local base URL Kirby should use when generating links & data attributes
  'url' => 'http://localhost:8000',

  // Optional: make sure cache & thumbs regenerate freshly on each load
  'cache' => [
    'pages' => false,
    'files' => false,
  ],

  // Optional: keep thumbs in jpg locally to avoid WebP issues
  //'thumbs' => ['format' => 'jpg'],
  'hooks' => [
    'file.update:after' => function ($newFile, $oldFile) {
      if ($newFile->hero()->toBool()) {
        // Unset hero on all other files
        $others = site()->index()->files()->filterBy('hero', true)->not($newFile);
        foreach ($others as $f) {
          try {
            $f->update(['hero' => false]);
          } catch (Throwable $e) {
            // ignore or log
          }
        }
      }
    },
    'file.create:after' => function ($file) {
      if ($file->hero()->toBool()) {
        $others = site()->index()->files()->filterBy('hero', true)->not($file);
        foreach ($others as $f) {
          try {
            $f->update(['hero' => false]);
          } catch (Throwable $e) {}
        }
      }
    }
  ]


];