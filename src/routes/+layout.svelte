<script>
	import '../app.css';
	import { page } from '$app/state';

	const SITE_ORIGIN = 'https://lukazko.github.io';

	// Výchozí hodnoty pro úvodní stránku; stránka příspěvku je přepíše přes data z load().
	const ogTitle = $derived(page.data.ogTitle ?? 'faakt.io — doomscrolling, ale lepší');
	const ogDescription = $derived(
		page.data.ogDescription ??
			'Scrolluj zajímavými historickými fakty, filozofickými myšlenkami a příběhy. TikTok pro tvou mysl.'
	);
	const ogUrl = $derived(SITE_ORIGIN + page.url.pathname);
</script>

<svelte:head>
	<meta property="og:title" content={ogTitle} />
	<meta property="og:description" content={ogDescription} />
	<meta property="og:url" content={ogUrl} />
	<meta name="twitter:title" content={ogTitle} />
	<meta name="twitter:description" content={ogDescription} />
</svelte:head>

<slot />
