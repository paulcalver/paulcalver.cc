<?php
/** @var Kirby\Cms\File|null $media */
/** @var string $landingLink */
/** @var bool $showOnce */
$isVideo = $media && in_array(strtolower($media->extension()), ['mp4','mov','webm','m4v']);

// Pick logo based on panel selection
$logoColor = $site->landing_logo_color()->or('white')->value(); // "black" or "white"
$logoFile  = $logoColor === 'black' ? 'title.png' : 'title_white.png';

// Byline from Panel
$byline = $site->landing_byline()->value();

// Get custom poster image or generate from video
$customPoster = $site->landing_poster()->toFile();
$posterUrl = $customPoster 
  ? $customPoster->url() 
  : ($isVideo ? $media->thumb(['width' => 1600, 'quality' => 60])->url() : null);
?>
<div id="landing-overlay"
     class="landing-overlay landing-variant-<?= esc($logoColor) ?>"
     data-show-once="<?= $showOnce ? '1' : '0' ?>"
     data-target="<?= esc($landingLink, 'attr') ?>">

  <div class="landing-logo">
    <img src="<?= url($logoFile) ?>" alt="Logo" width="500">
    <?php if ($byline): ?>
      <p class="landing-byline"><?= esc($byline) ?></p>
    <?php endif; ?>
  </div>

  <div class="landing-media">
    <?php if ($isVideo): ?>
      <video id="landing-video" playsinline muted autoplay loop preload="none"
             <?php if ($posterUrl): ?>poster="<?= $posterUrl ?>"<?php endif; ?>>
        <source data-src="<?= $media->url() ?>" type="video/<?= $media->extension() ?>">
      </video>
    <?php else: ?>
      <img id="landing-image" src="<?= $media->url() ?>" alt="Landing">
    <?php endif; ?>
  </div>
</div>