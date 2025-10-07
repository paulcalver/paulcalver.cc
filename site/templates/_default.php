<? snippet('snippet-head'); ?>

<main id="app">


	<section class="about">
		<div class="about-inner">
			<?= page('about')->introduction()->kt(); ?>
			<p class="credit">Website by <a href="https://jakedowsmith.com" target="_blank">Jake Dow-Smith</a></p>
		</div>

		<div class="about-page-links">
			<?php
			$externalLinks = page('about')->externalLinks()->toStructure(); // Fetch the externalLinks structure field

			if ($externalLinks->isNotEmpty()): ?>
				<div class="about-external-links">
					<?php foreach ($externalLinks as $link): ?>
						<a href="<?= $link->link()->escape('attr') ?>" class="external-link" target="_blank">
							<?= $link->text()->html() ?>
						</a>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>
		</div>
	</section>

	<?php

	// Function to render a single media item as a figure
	function renderMediaItem($media, $title, $client, $categories, $resizeDimension) {
		$isVideo = $media->type() === 'video';
		$isMp4 = $media->mime() === 'video/mp4';

		if ($isVideo && !$isMp4) {
			return; // Skip further processing for non-MP4 videos
		}

		$alt = $title;
		$highlight = $media->highlight()->isTrue() ? 'true' : 'false';
		$thumbVideo = $isVideo ? $media->url() : null;
		$videoUrl = $isVideo ? $media->videoUrl()->escape('attr') : null;
		$videoIsPortrait = $isVideo && $media->videoIsPortrait()->isTrue();
		$shouldAutoPlay = $isVideo && $media->autoPlay()->isTrue();
		$isDiptych = $media->isDiptych()->isTrue() ? 'true' : 'false';
		$id = $media->uuid();
		$projectUrl = $media->parent()->url();
		$projectSlug = $media->parent()->slug();
		$figureCaption = $media->caption()->isNotEmpty() ? $media->caption()->escape('attr') : null;
	
		$displayImage = null;
		$displayImageJPEG = null;
		$galleryImage = null;
		$galleryImageJPEG = null;
		$displayPoster = null;
		$galleryPoster = null;
		$width = null;
		$height = null;
	
		// Resize images and generate URLs
		if ($isVideo) {
			if ($media->poster()->isNotEmpty()) {
				$posterFile = $media->poster()->toFile();
				if ($posterFile) {
					$resizedPoster = $posterFile->resize($resizeDimension, $resizeDimension, 80);
					$displayPoster = $resizedPoster->url();
					$galleryPoster = $posterFile->thumb(['width' => 2400, 'height' => 2400, 'format' => 'webp', 'quality' => 50])->url();
					$galleryPosterJPEG = $posterFile->thumb(['width' => 2400, 'height' => 2400, 'format' => 'jpg', 'quality' => 50])->url();
					$width = $resizedPoster->width(); // Width of resized poster
					$height = $resizedPoster->height(); // Height of resized poster
					$galleryWidth = $resizedPoster->width();
					$galleryHeight = $resizedPoster->height();
				}
			} else {
				// Fallback dimensions for videos without a poster
				if ($videoIsPortrait) {
					$width = $resizeDimension * 9 / 16; // Calculate width for 9:16 aspect ratio
					$height = $resizeDimension;
					$galleryWidth = 2400 * 9 / 16;
					$galleryHeight = 2400;
				} else {
					$width = $resizeDimension;
					$height = $resizeDimension * 9 / 16; // Calculate height for 16:9 aspect ratio
					$galleryWidth = 2400;
					$galleryHeight = 2400 * 9 / 16;
				}
			}
		} elseif (!$isVideo) {
			$resizedImage = $media->thumb(['width' => $resizeDimension, 'height' => $resizeDimension, 'format' => 'webp', 'quality' => 80]);  
			$resizedImageJPEG = $media->thumb(['width' => $resizeDimension, 'height' => $resizeDimension, 'format' => 'jpg', 'quality' => 80]);
			$displayImage = $resizedImage->url();
			$displayImageJPEG = $resizedImageJPEG->url();
			$resizedGallery = $media->thumb(['width' => 2400, 'height' => 2400, 'format' => 'webp', 'quality' => 80]);
			$resizedGalleryJPEG = $media->thumb(['width' => 2400, 'height' => 2400, 'format' => 'jpg', 'quality' => 80]);
			$galleryImage = $resizedGallery->url();
			$galleryImageJPEG = $resizedGalleryJPEG->url();
			$width = $resizedImage->width(); // Width of resized image
			$height = $resizedImage->height(); // Height of resized image
			$galleryWidth = $resizedGallery->width();
			$galleryHeight = $resizedGallery->height();
		}
	
		// Output figure
		echo '<figure';
		echo ' data-title="' . $title . '"';
		echo ' data-client="' . $client . '"';
		echo ' data-categories="' . implode(',', $categories) . '"';
		echo ' data-highlight="' . $highlight . '"';
		echo ' data-id="' . $id . '"';
		echo ' data-project-url="' . $projectUrl . '"';
		echo ' data-project-slug="' . $projectSlug . '"';
		echo ' data-autoplay="' . $shouldAutoPlay . '"';
		echo ' data-caption="' . $figureCaption . '"';
		if ($isVideo && $videoUrl) {
			echo ' data-video-url="' . $videoUrl . '"';
		}
		if ($isVideo && $videoIsPortrait) {
			echo ' data-video-is-portrait="true"';
		}
		if ($isVideo && $galleryPoster) {
			echo ' data-gallery="' . $galleryPoster . '"';
			echo ' data-galleryjpeg="' . $galleryPosterJPEG . '"';
		} elseif ($galleryImage) {
			echo ' data-gallery="' . $galleryImage . '"';
			echo ' data-galleryjpeg="' . $galleryImageJPEG . '"';
		}
		echo ' data-gallery-width="' . $galleryWidth . '"';
		echo ' data-gallery-height="' . $galleryHeight . '"';
		echo ' data-is-diptych="' . $isDiptych . '"';
		echo ' class="unfiltered-figure stagger "';
		echo '>';
		echo '<a href="' . $projectUrl . '" class="project-link">';
		echo '<div class="project-link-inner">';
		if ($isVideo) {
			echo '<video';
			echo ' data-src="' . $thumbVideo . '" data-galleryVideo="' . $videoUrl . '" type="video/mp4"';
			if ($displayPoster) {
				echo ' poster="' . $displayPoster . '"';
			}
			echo ' width="' . $width . '" height="' . $height . '" autoplay muted loop playsinline>';
			echo '</video>';
		} else {
			echo '<img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" data-src="' . $displayImage . '" data-srcjpeg="' . $displayImageJPEG . '" alt="' . $alt . '" width="' . $width . '" height="' . $height . '">';
		}
		echo '<figcaption>';
		echo '<h2>' . $title . '</h2>';
		echo '</figcaption>';
		echo '</div>';
		echo '</a>';
		echo '</figure>';
	}

	// Fetch all published projects
	$projects = page('projects')->children()->listed()->filterBy('hideFromIndex', '!=', true);

	?>

	<section class="featured">
		<div class="featured-inner container-inner">
			<div class="featured-items">

			<?php
			$allHighlightedMedia = [];

			foreach ($projects as $project) {
				// Ensure categories are correctly parsed
				$categories = $project->categories()->isEmpty() ? [] : $project->categories()->split(',');

				// Convert categories to slugs
				$categorySlugs = array_map(function($category) {
					return Str::slug($category); // Use Kirby's Str::slug() helper
				}, $categories);

				// Check for 'featured' in slugs (case-insensitive)
				if (in_array('featured', $categorySlugs, true)) {
					// Fetch all media files
					$mediaItems = $project->media()->toFiles();
					
					if ($mediaItems->isNotEmpty()) {
						// Filter images with the toggle 'highlight' set to true
						$highlightedMedia = $mediaItems->filter(function($file) {
							return $file->highlight()->toBool(); // Assumes 'highlight' is a field in the file metadata
						});

						// Add to the combined array
						foreach ($highlightedMedia as $media) {
							$allHighlightedMedia[] = [
								'media' => $media,
								'title' => $project->title()->escape('attr'),
								'client' => $project->client()->escape('attr'),
								'categories' => $categorySlugs
							];
						}
					}
				}
			}

			// Shuffle all highlighted media
			shuffle($allHighlightedMedia);

			// Render each highlighted media item
			foreach ($allHighlightedMedia as $item) {
				renderMediaItem(
					$item['media'],
					$item['title'],
					$item['client'],
					$item['categories'],
					900
				);
			}
			?>

			</div>
		</div>
	</section>

	<section class="index">
		<div class="index-inner container-inner">
			<div class="index-items">
			<?php

			if ($page->parent() && $page->parent()->is(page('projects')) && $page->hideFromIndex()->isTrue()) {
				// Fetch the single project page
				$project = page('projects')->children()->findBy('id', $page->id());

				if ($project) {
					$categories = $project->categories()->isEmpty() ? [] : $project->categories()->split(',');

					// Convert categories to slugs
					$categorySlugs = array_map(function($category) {
						return Str::slug($category); // Convert each category to a slug
					}, $categories);

					$mediaItems = $project->media()->toFiles();
					if ($mediaItems->isNotEmpty()) {
						foreach ($mediaItems as $media) {
							renderMediaItem($media, $project->title()->escape('attr'), $project->client()->escape('attr'), $categorySlugs, 600);
						}
					}
				}
			} else {
				foreach ($projects as $project) {
					$categories = $project->categories()->isEmpty() ? [] : $project->categories()->split(',');
	
					// Convert categories to slugs
					$categorySlugs = array_map(function($category) {
						return Str::slug($category); // Convert each category to a slug
					}, $categories);
	
					$mediaItems = $project->media()->toFiles();
					if ($mediaItems->isNotEmpty()) {
						foreach ($mediaItems as $media) {
							renderMediaItem($media, $project->title()->escape('attr'), $project->client()->escape('attr'), $categorySlugs, 600);
						}
					}
				}
			}
			
			?>
			</div>
		</div>
	</section>


	<section class="gallery">
		<div class="gallery-inner">
			<?php
			$totalSlides = 0;
			// Check if the current page is a project and should be displayed
			// if ($page->parent() && $page->parent()->is(page('projects')) && $page->hideFromIndex()->isTrue()) {
			// 	// Fetch media items from the project
			// 	$mediaItems = $page->media()->toFiles();
			// 	$currentSlide = [];
			// 	$slides = [];

			// 	if ($mediaItems->isNotEmpty()) {
			// 		foreach ($mediaItems as $index => $media) {
			// 			$isDiptych = $media->isDiptych()->isTrue();
			// 			$index = (int) $index; // Ensure $index is an integer
			// 			$nextMedia = $mediaItems->nth($index + 1) ?? null;
			// 			$sameProject = $nextMedia && $nextMedia->parent()->is($media->parent());

			// 			// Group diptychs together
			// 			if ($isDiptych && $sameProject && count($currentSlide) < 2) {
			// 				$currentSlide[] = $media;
			// 				$currentSlide[] = $nextMedia;
			// 				$slides[] = $currentSlide;
			// 				$currentSlide = [];
			// 			} else {
			// 				$slides[] = [$media];
			// 			}
			// 		}

			// 		$totalSlides = count($slides) - 1 ?? 0;

			// 		$slideIndex = 0;
			// 		$totalSlides = 0;
					
			// 		foreach ($slides as $slide) {
			// 			if($page->parent() && $page->parent()->is(page('projects')) && $page->hideFromIndex()->isTrue()){
			// 				if ($slideIndex++ === 0) {
			// 					echo '<div class="gallery-slide active">';
			// 				} else {
			// 					echo '<div class="gallery-slide hide-slide">';
			// 				}
			// 			} else {
			// 				echo '<div class="gallery-slide hide-slide">';
			// 			}

			// 			$totalSlides++;
						

			// 			foreach ($slide as $media) {
			// 				$isVideo = $media->type() === 'video';
			// 				$mediaUrl = $isVideo ? $media->videoUrl()->escape('attr') : $media->resize(1400, 1400)->url();
			// 				$width = $isVideo ? ($media->poster()->toFile()?->width() ?? 1400) : $media->resize(1400, 1400)->width();
			// 				$height = $isVideo ? ($media->poster()->toFile()?->height() ?? 1400) : $media->resize(1400, 1400)->height();
			// 				$projectSlug = $page->slug();
			// 				$title = $page->title()->escape('attr');

			// 				// Check if the media item has a caption
			// 				$caption = $media->caption()->isNotEmpty() ? $media->caption()->escape('attr') : null;

			// 				echo '<figure';
			// 				echo ' data-title="' . $title . '"';
			// 				echo ' data-project-slug="' . $projectSlug . '"';
			// 				if ($caption) {
			// 					echo ' data-caption="' . $caption . '"';
			// 				}
			// 				echo ' class="previously-loaded loaded"';
			// 				echo '>';

			// 				if ($isVideo) {
			// 					$poster = $media->poster()->isNotEmpty() ? $media->poster()->toFile()->url() : '';
			// 					echo '<video src="' . $mediaUrl . '"';
			// 					if ($poster) {
			// 						echo ' poster="' . $poster . '"';
			// 					}
			// 					echo ' width="' . $width . '" height="' . $height . '" controls muted loop playsinline controlslist="nodownload"></video>';
			// 				} else {
			// 					echo '<img src="' . $mediaUrl . '" alt="' . $title . '"';
			// 					echo ' width="' . $width . '" height="' . $height . '">';
			// 				}

			// 				echo '</figure>';
			// 			}

			// 			echo '</div>';
			// 		}
			// 	}
			// }
			?>
		</div>
	</section>
	

	<nav>
		<div class="title">
			<? 
			if($page->parent() && $page->parent()->is(page('projects')) && $page->hideFromIndex()->isTrue()):
				echo '<a href="' . $site->url() . '" class="hidden-title">Paul Calver</a>';
			endif; 
			?>
			<span class="page-title"><?= $page->parent() && $page->parent()->is(page('projects')) && $page->hideFromIndex()->isTrue() ? $page->title()->text() : '' ?></span>
			<? if($page->parent() && $page->parent()->is(page('projects')) && $page->hideFromIndex()->isTrue()):
				echo '<span class="hidden-caption" style="display:none;"></span>';
			endif; ?>
		</div>

		<div class="menu">
			<h1><a href="<?= $site->url(); ?>" class="home-link">Paul Calver</a></h1>
			<a href="<?= $site->url(); ?>" class="featured-link">Featured</a> 
			<a href="<?= page('projects')->url(); ?>" class="index-link">Index</a>

			<?php
			$projectCategories = site()->projectCategories()->toStructure();
			if ($projectCategories->isNotEmpty()): ?>
				<div class="filters">

					<a href="<?= page('projects')->url(); ?>" class="filter-button filter-button-all" data-filter="all">
						All
					</a>

					<?php foreach ($projectCategories as $category): 
						// Skip the 'Featured' category
						if (strtolower($category->categoryName()->value()) === 'featured') {
							continue;
						}

						// Create a slug for the category name
						$slug = $category->categoryName()->slug();
						$url = url("filter/{$slug}"); // Construct the full URL
					?>
						<a href="<?= $url ?>" class="filter-button" data-filter="<?= $slug ?>">
							<?= $category->categoryName()->html() ?>
						</a>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>

			<a href="<?= page('about')->url(); ?>" class="about-link">About</a>

			<?php
			$externalLinks = page('about')->externalLinks()->toStructure(); // Fetch the externalLinks structure field

			if ($externalLinks->isNotEmpty()): ?>
				<div class="external-links">
					<?php foreach ($externalLinks as $link): ?>
						<a href="<?= $link->link()->escape('attr') ?>" class="external-link" target="_blank">
							<?= $link->text()->html() ?>
						</a>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>

			<button class="mobile-button-filters">Filters</button>
			<button class="mobile-button-menu">Menu</button>
			<button class="mobile-button-close">Close</button>

		</div>

		<div class="project-controls">
			<button class="previous">Previous</button>
			<button class="close">Close</button>
			<button class="next">Next</button>
		</div>

		<div class="project-index">
			<? 
			// if($page->parent() && $page->parent()->is(page('projects')) && $page->hideFromIndex()->isTrue()){
			// 	$totalSlides = str_pad($totalSlides, 2, '0', STR_PAD_LEFT);
			// 	echo '01 | ' . $totalSlides;
			// } 
			?>

		</div>
	</nav>


</main>

<? snippet('snippet-footer'); ?>