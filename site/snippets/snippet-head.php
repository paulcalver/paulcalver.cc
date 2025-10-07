<!DOCTYPE html>
<? 
$referrer = isset($_SERVER['HTTP_REFERER']) ? parse_url($_SERVER['HTTP_REFERER'], PHP_URL_HOST) : null;
$currentSite = $_SERVER['HTTP_HOST'];

$referType = ($referrer && $referrer === $currentSite) ? 'internal-refer' : 'external-refer';
?>
<html lang="en" class="<?= $referType; ?>">
<head>

	<? 
	$description = $site->siteDescription()->text();
	$featured = ($site->siteImage()->toFile()) ? $site->siteImage()->toFile()->url() : null;
	$title = $site->title();
	
	?>

	<meta charset="utf-8">
	<meta http-equiv="x-ua-compatible" content="ie=edge">
	<title><?= $title; ?></title>
	<meta name="description" content="<?= $description; ?>">
	<meta name="viewport" content="width=device-width">
	<link rel="icon" type="image/png" href="<?= $kirby->url('assets') ?>/img/favicon.ico">
	<link rel="stylesheet" href="<?= $kirby->url('assets') ?>/css/app.css">

	<meta property="og:title" content="<?= $title; ?>">
	<meta name="twitter:title" content="<?= $title; ?>">
	<meta property="og:type" content="website">
	<meta name="twitter:card" content="summary_large_image">
	<meta property="og:url" content="<?= $page->url() ?>">
	<meta name="twitter:description" content="<?= $description; ?>">
	<meta property="og:description" content="<?= $description; ?>">
	<meta name="twitter:image" content="<?= $featured; ?>">
	<meta property="og:image" content="<?= $featured; ?>">

</head>

<?php
$isHidden = $page->parent() && $page->parent()->is(page('projects')) && $page->hideFromIndex()->isTrue();
$hiddenClass = '';
if ($isHidden): 
	$hiddenClass = 'hidden-page';
endif; ?>

<? $isSingle = $page->parent() && $page->parent()->is(page('projects')) ? 'single-project' : null; ?>

<body data-basepath="<?= $site->url(); ?>" data-uri="<?= $page->uri(); ?>" data-uuid="<?= $page->uuid(); ?>" class="show-site-title <?= $hiddenClass; ?> <?= $isSingle; ?>">