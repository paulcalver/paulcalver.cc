<?php

return [
    'debug' => false,

   
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


    // Optional image format override
    // 'thumbs' => [
    //     'format' => 'webp'
    // ],

    // Optional KQL settings for Panel/API
    // 'kql' => [
    //     'auth' => false, // Ensure this is enabled if needed
    // ],
];