<script>
	import { tick } from 'svelte';
	import { page } from '$app/state';
	import { pushState } from '$app/navigation';
	import PostCard from './PostCard.svelte';
	import { normalizeCategory, getCategoryMeta } from '$lib/categories.js';

	const PAGE_SIZE = 20;
	let allPosts = $state([]);      // celá databáze, neseřazená (zdroj pravdy)
	let posts = $state([]);         // aktuální feed (mixed nebo category)
	let activeCategory = $state(null);
	let visibleCount = $state(PAGE_SIZE);
	let activeMenu = $state(null); // post id, or null
	let loading = $state(true);
	let loadingMore = $state(false);
	let currentIndex = $state(0);
	let totalPosts = $state(0);
	let error = $state(null);

	// Nereaktivní zrcadlo activeCategory — kvůli porovnání v $effect bez smyčky
	let appliedCategory = null;
	let dataReady = $state(false);

	let activeCategoryMeta = $derived(activeCategory ? getCategoryMeta(activeCategory) : null);

	function shufflePosts(arr, targetId) {
		const shuffled = [...arr];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		if (targetId) {
			const idx = shuffled.findIndex(p => p.id === targetId);
			if (idx !== -1) {
				const target = shuffled.splice(idx, 1)[0];
				shuffled.unshift(target);
			}
		}
		return shuffled;
	}

	/**
	 * Vrátí ID příspěvku z URL query parametru (?post=XXX)
	 */
	function getPostIdFromUrl() {
		if (typeof window === 'undefined') return null;
		const params = new URLSearchParams(window.location.search);
		return params.get('post');
	}

	/**
	 * Vrátí slug kategorie z URL query parametru (?category=XXX)
	 */
	function getCategoryFromUrl() {
		if (typeof window === 'undefined') return null;
		const params = new URLSearchParams(window.location.search);
		return normalizeCategory(params.get('category'));
	}

	/**
	 * Sestaví feed pro danou kategorii z celé databáze (allPosts).
	 * category = null → mixed feed (celá databáze).
	 */
	function buildFeed(category, targetId) {
		const pool = category ? allPosts.filter(p => p.category === category) : allPosts;
		return shufflePosts(pool, targetId);
	}

	/**
	 * Reset pozice ve feedu na úplně první příspěvek (bez animace).
	 */
	function resetScroll() {
		requestAnimationFrame(() => {
			const container = document.querySelector('.feed-container');
			if (!container) return;
			container.style.scrollBehavior = 'auto';
			container.style.scrollSnapType = 'none';
			container.scrollTop = 0;
			container.style.scrollBehavior = '';
			container.style.scrollSnapType = '';
		});
	}

	/**
	 * Zapíše aktivní kategorii do URL (shallow routing — bez reloadu).
	 * `post` drží příspěvek, kterým feed začíná, aby refresh i odkaz vrátily stejný stav.
	 */
	function syncCategoryUrl(category, targetId = null) {
		const url = new URL(page.url);
		if (category) url.searchParams.set('category', category);
		else url.searchParams.delete('category');
		if (targetId) url.searchParams.set('post', targetId);
		else url.searchParams.delete('post');
		pushState(url, {});
	}

	/**
	 * Přepne feed na danou kategorii (nebo na mixed feed při null).
	 * Sestaví nový feed z celé databáze, resetuje pozici i progress bar.
	 */
	function applyFeed(category, targetId) {
		activeCategory = category;
		appliedCategory = category;
		posts = buildFeed(category, targetId);
		totalPosts = posts.length;
		visibleCount = PAGE_SIZE;
		currentIndex = 0;
		activeMenu = null;
	}

	function applyCategory(category, { syncUrl = true, targetId = null } = {}) {
		applyFeed(category, targetId);
		if (syncUrl) syncCategoryUrl(category, targetId);
		resetScroll();
	}

	/**
	 * Klik na category label: přepne na category feed, který začíná příspěvkem,
	 * na kterém uživatel kliknul.
	 */
	function handleCategoryToggle(slug, postId = null) {
		const next = normalizeCategory(slug);
		if (!next || activeCategory === next) return;
		applyCategory(next, { targetId: postId });
	}

	/**
	 * Vrátí správné URL pro sdílení, nezávisle na BASE_URL
	 * Pracuje stejně na localhost i GitHub Pages
	 */
	function getShareUrl(postId) {
		const baseUrl = window.location.origin + window.location.pathname.replace(/\/$/, '');
		return `${baseUrl}/?post=${postId}`;
	}

	async function loadPosts() {
		try {
			// Dynamicky načti posts.json relativně ke current location
			const response = await fetch('data/posts.json');
			if (!response.ok) throw new Error(`Nepodařilo se načíst příspěvky (${response.status})`);
			allPosts = await response.json();
			dataReady = true;
			// Respektuj ?category= i ?post= z URL (refresh i přímý odkaz).
			// Feed sestavíme ještě před prvním vykreslením, ať neproblikne prázdný stav.
			applyFeed(getCategoryFromUrl(), getPostIdFromUrl());
			loading = false;
			await tick();
			resetScroll();
		} catch (e) {
			error = e.message;
			loading = false;
			console.error('❌ Chyba:', e);
		}
	}

	function handleScroll(e) {
		const el = e.target;
		const cardHeight = el.clientHeight;
		const scrollTop = el.scrollTop;
		const idx = Math.round(scrollTop / cardHeight);
		if (idx !== currentIndex && idx >= 0 && idx < posts.length) {
			currentIndex = idx;
		}
	}

	async function loadMore() {
		const oldCount = visibleCount;
		loadingMore = true;
		visibleCount += PAGE_SIZE;
		await tick();
		await new Promise(resolve => requestAnimationFrame(resolve));
		const container = document.querySelector('.feed-container');
		if (container) {
			const cardHeight = container.clientHeight;
			container.style.scrollSnapType = 'none';
			container.style.scrollBehavior = 'auto';
			container.scrollTop = oldCount * cardHeight;
			container.style.scrollSnapType = '';
			container.style.scrollBehavior = '';
		}
		currentIndex = oldCount;
		loadingMore = false;
	}

	async function sharePost(post) {
		const url = getShareUrl(post.id);
		console.log('🔗 Share URL:', url);
		if (navigator.share) {
			try {
				await navigator.share({ url, title: post.title });
			} catch (err) {
				// user cancelled
			}
		} else {
			try {
				await navigator.clipboard.writeText(url);
				showToast('Odkaz zkopírován do schránky');
			} catch {
				showToast('Sdílení není podporováno');
			}
		}
	}

	function reportPost(post) {
		const url = getShareUrl(post.id);
		const title = encodeURIComponent(post.title.slice(0, 80));
		const body = encodeURIComponent(
			'**ID příspěvku:** ' + post.id + '\n' +
			'**Titulek:** ' + post.title + '\n' +
			'**Kategorie:** ' + post.category + '\n' +
			'**Odkaz:** ' + url + '\n\n' +
			'**Popis problému:\n' +
			'(doplň, co je špatně)\n' +
			'(fakta, datum, zdroje...)'
		);
		window.open('https://github.com/lukazko/faakt.io/issues/new?template=report-post.yml&title=Nahlášení+problému:+ ' + title + '&body=' + body, '_blank');
	}

	let toastTimeout;
	function showToast(msg) {
		const el = document.getElementById('toast');
		if (!el) return;
		el.textContent = msg;
		el.classList.add('visible');
		clearTimeout(toastTimeout);
		toastTimeout = setTimeout(() => el.classList.remove('visible'), 2000);
	}

	function getProgress() {
		const denom = Math.min(visibleCount, totalPosts);
		if (denom === 0) return 0;
		return Math.round((Math.min(currentIndex, denom - 1) / denom) * 100);
	}

	$effect(() => {
		loadPosts();
	});

	// Sleduj URL — pokryje browser Back/Forward i ruční změnu query parametru.
	// Vlastní přepnutí kategorie je synchronní, takže tady se nic nemění.
	$effect(() => {
		if (!dataReady) return;
		const urlCategory = normalizeCategory(page.url.searchParams.get('category'));
		if (urlCategory !== appliedCategory) {
			applyCategory(urlCategory, { syncUrl: false });
		}
	});
</script>

{#if loading}
	<div class="loading-screen">
		<div class="spinner"></div>
		<p>Načítám všechnu moudrost světa...</p>
	</div>
{:else if error}
	<div class="error-screen">
		<p>😔 {error}</p>
		<button onclick={loadPosts}>Zkusit znovu</button>
	</div>
{:else}
	<div class="feed-container" onscroll={handleScroll}>
		<!-- App header -->
		<header class="app-header">
			<a href="." data-sveltekit-reload class="app-logo">faakt.io</a>
			{#if activeCategoryMeta}
				<button
					type="button"
					class="header-category"
					style="--cat-color: {activeCategoryMeta.color}"
					title="Zrušit filtr kategorie"
					aria-label={`Zrušit filtr kategorie ${activeCategoryMeta.label}`}
					onclick={() => applyCategory(null)}
				>
					<span class="header-category-label">{activeCategoryMeta.label}</span>
					<span class="header-category-close" aria-hidden="true">×</span>
				</button>
			{:else}
				<span class="app-tagline">doomscrolling, ale lepší</span>
			{/if}
		</header>

		<div class="feed-stack">
			{#each posts.slice(0, visibleCount) as post, i (post.id)}
				<div class="card-wrapper">
					<PostCard
						{post}
						categoryFilterActive={!!activeCategory}
						onCategoryToggle={handleCategoryToggle}
					/>

					<!-- Action button -->
					<button
						class="action-btn"
						aria-label="Akce"
						onclick={() => activeMenu = activeMenu === post.id ? null : post.id}
					>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
						</svg>
					</button>
					<!-- Action menu -->
					{#if activeMenu === post.id}
						<div class="action-menu" onclick={() => activeMenu = null}>
							<button class="action-item" onclick={(e) => { e.stopPropagation(); sharePost(post); activeMenu = null; }}>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
									<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
									<line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
								</svg>
								Sdílet
							</button>
							<button class="action-item" onclick={(e) => { e.stopPropagation(); reportPost(post); activeMenu = null; }}>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M15.07 2.46A6.94 6.94 0 0 0 12 1.93c-5.52 0-10 3.58-10 8 0 1.77.63 3.4 1.7 4.73L2 22l7.78-3.55c1.68.47 3.46.72 5.3.7 5.53 0 10-3.58 10-8 0-1.1-.26-2.16-.74-3.12"/>
									<path d="M22 2l-4.5 4.5"/><path d="M17 2v4h4"/>
								</svg>
								Nahlásit problém
							</button>
							<div class="app-build-info">v{__APP_VERSION__} · build {__APP_BUILD_ID__}</div>
						</div>
					{/if}
				</div>
			{/each}

			{#if visibleCount < totalPosts}
				<div class="end-card">
					<p class="end-card-text">Nesedíš už na tom záchodě moc dlouho?</p>
					<button class="load-more-btn" onclick={loadMore}>
						<span class="load-more-icon">+</span>
						Nee, dej mi víc!
					</button>
				</div>
			{:else if totalPosts === 0}
				<div class="end-card">
					<p class="end-card-text">
						V této kategorii zatím žádné příspěvky nejsou.
					</p>
					<button class="load-more-btn" onclick={() => applyCategory(null)}>
						Zpět na všechny kategorie
					</button>
				</div>
			{:else if activeCategory}
				<div class="end-card">
					<p class="end-card-text">To je vše z této kategorie.</p>
					<button class="load-more-btn" onclick={() => applyCategory(null)}>
						Zpět na všechny kategorie
					</button>
				</div>
			{/if}
		</div>
	</div>

	<!-- Progress bar -->
	<div class="progress-bar" style="width: {getProgress()}%"></div>

	<!-- Loading overlay for loadMore -->
	{#if loadingMore}
		<div class="loading-overlay">
			<div class="spinner"></div>
			<p>Načítám další...</p>
		</div>
	{/if}

	<!-- Toast -->
	<div id="toast" class="toast"></div>
{/if}

<style>
	.loading-screen,
	.error-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		height: 100dvh;
		gap: 16px;
		color: var(--text-muted);
		font-size: 1rem;
	}

	.error-screen button {
		margin-top: 8px;
		padding: 8px 20px;
		border: 1px solid var(--accent);
			box-shadow: 0 1px 8px rgba(194,65,12,0.2);
		border-radius: 999px;
		background: transparent;
		color: var(--accent);
		font-size: 0.9rem;
		cursor: pointer;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid #333;
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.feed-container {
		height: 100vh;
		height: 100dvh;
		overflow-y: scroll;
		scroll-snap-type: y mandatory;
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
		overscroll-behavior: none;
	}

	/* App header */
	.app-header {
		position: sticky;
		top: 0;
		z-index: 50;
		display: flex;
		align-items: baseline;
		gap: 10px;
		padding: 16px 20px 20px;
		background: linear-gradient(to bottom, var(--bg) 60%, transparent);
		pointer-events: none;
	}

	.app-logo {
		font-size: 1.5rem;
		font-weight: 900;
		letter-spacing: -0.02em;
		position: relative;
		flex: none;
		cursor: pointer;
		pointer-events: auto;
		text-decoration: none;
		background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.app-logo::before {
		content: '';
		position: absolute;
		inset: -6px -10px;
		background: radial-gradient(ellipse, rgba(251,146,60,0.15) 0%, transparent 70%);
		z-index: -1;
		pointer-events: none;
	}

	.app-tagline {
		font-size: 0.65rem;
		font-style: italic;
		color: #555;
		font-weight: 400;
		letter-spacing: 0.03em;
	}

	/* Aktivní kategorie v hlavičce — zároveň jediné místo pro zrušení filtru */
	.header-category {
		pointer-events: auto;
		position: relative;
		display: inline-flex;
		align-items: center;
		align-self: center;
		gap: 6px;
		max-width: 55vw;
		padding: 4px 10px 4px 12px;
		border: 1px solid var(--cat-color);
		border-radius: 999px;
		background: rgba(0, 0, 0, 0.3);
		background: color-mix(in srgb, var(--cat-color) 14%, transparent);
		color: var(--cat-color);
		font-family: inherit;
		font-size: 0.65rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition: background 0.15s, transform 0.1s;
	}

	.header-category:active {
		transform: scale(0.95);
	}

	.header-category-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.header-category-close {
		flex: none;
		font-size: 0.9rem;
		line-height: 1;
		opacity: 0.85;
	}

	/* Větší dotyková plocha na mobilu — vzhled zůstává stejný */
	.header-category::after {
		content: '';
		position: absolute;
		inset: -8px -4px;
	}

	.feed-stack {
		display: flex;
		flex-direction: column;
	}

	.card-wrapper {
		position: relative;
	}

	.action-btn {
		position: absolute;
		bottom: 24px;
		right: 20px;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: 1px solid #333;
		background: rgba(20, 20, 20, 0.85);
		backdrop-filter: blur(8px);
		color: var(--text-muted);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		z-index: 10;
	}

	.action-btn:active {
		transform: scale(0.9);
		background: var(--accent);
		color: var(--bg);
		border-color: var(--accent);
	}

	.action-menu {
		position: absolute;
		bottom: 80px;
		right: 20px;
		background: rgba(24, 24, 24, 0.95);
		backdrop-filter: blur(12px);
		border: 1px solid #333;
		border-radius: 14px;
		padding: 6px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		z-index: 20;
		min-width: 160px;
		animation: menuIn 0.2s ease-out;
	}

	@keyframes menuIn {
		from { opacity: 0; transform: translateY(8px) scale(0.95); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}

	.action-item {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 10px 14px;
		border: none;
		background: transparent;
		color: var(--text-muted);
		font-size: 0.85rem;
		cursor: pointer;
		border-radius: 10px;
		transition: all 0.15s;
		white-space: nowrap;
	}

	.action-item:hover {
		background: rgba(255, 255, 255, 0.06);
		color: var(--text);
	}

	.action-item:active {
		background: var(--accent);
		color: var(--bg);
	}

	.app-build-info {
		padding: 7px 10px 4px;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		color: #666;
		font-size: 0.62rem;
		letter-spacing: 0.03em;
		text-align: center;
		white-space: nowrap;
	}

	/* End card (load more) */
	.end-card {
		height: 100vh;
		height: 100dvh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 24px;
		padding: 24px 20px;
		scroll-snap-align: start;
		text-align: center;
	}

	.end-card-text {
		font-size: 1.1rem;
		font-style: italic;
		color: var(--text-muted);
		line-height: 1.5;
		max-width: 320px;
	}

	.load-more-btn {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding: 14px 32px;
		border: none;
		border-radius: 999px;
		background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
		color: var(--bg);
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.15s, box-shadow 0.15s;
		box-shadow: 0 4px 20px rgba(217, 119, 6, 0.25);
	}

	.load-more-btn:active {
		transform: scale(0.95);
		box-shadow: 0 2px 10px rgba(217, 119, 6, 0.4);
	}

	.load-more-icon {
		font-size: 1.3rem;
		font-weight: 300;
		line-height: 1;
	}

	/* Loading overlay */
	.loading-overlay {
		position: fixed;
		inset: 0;
		z-index: 300;
		background: var(--bg);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		color: var(--text-muted);
		font-size: 1rem;
	}

	.progress-bar {
		position: fixed;
		top: 0;
		left: 0;
		height: 3px;
		background: linear-gradient(90deg, var(--accent), var(--accent-secondary));
		transition: width 0.3s ease;
		z-index: 100;
		border-radius: 0 2px 2px 0;
	}

	.toast {
		position: fixed;
		bottom: 80px;
		left: 50%;
		transform: translateX(-50%) translateY(20px);
		background: rgba(30, 30, 30, 0.95);
		backdrop-filter: blur(8px);
		color: var(--text);
		padding: 10px 20px;
		border-radius: 999px;
		font-size: 0.85rem;
		opacity: 0;
		transition: all 0.3s ease;
		z-index: 200;
		white-space: nowrap;
		pointer-events: none;
	}

	:global(.toast.visible) {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}
</style>
