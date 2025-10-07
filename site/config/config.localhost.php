<?php

return [
  'debug' => true,

  // The local base URL Kirby should use when generating links & data attributes
  'url' => 'http://localhost:8000',

  // Optional: make sure cache & thumbs regenerate freshly on each load
  'cache' => [
    'pages' => false,
    'files' => false,
  ],

  // Optional: keep thumbs in jpg locally to avoid WebP issues
  //'thumbs' => ['format' => 'jpg'],
];