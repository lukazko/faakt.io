<script>
	import { tick } from 'svelte';
	import { pushState } from '$app/navigation';
	import { base } from '$app/paths';
	import PostCard from './PostCard.svelte';
	import { normalizeCategory, getCategoryMeta } from '$lib/categories.js';

	const PAGE_SIZE = 20;
	let allPosts = $state([]);      // celá databáze, neseřazená (zdroj pravdy)
	let posts = $state([]);         // aktuální feed (mixed nebo category)
	let activeCategory = $state(null);
	let visibleCount = $state(PAGE_SIZE);
	let menuOpen = $state(false);
	let loading = $state(true);
	let loadingMore = $state(false);
	let currentIndex = $state(0);
	let totalPosts = $state(0);
	let error = $state(null);

	// Příspěvek, na kterém uživatel právě stojí. Nabídka akcí bydlí v kartě,
	// ale její stav drží feed — otevírá se jen u aktivní karty a při scrollu
	// se zavře. Na koncové kartě ("načíst další") žádný příspěvek není.
	let activePost = $derived(posts[currentIndex] ?? null);

	// --- Rozměry karty ---------------------------------------------------
	// Karta má pevnou výšku, kterou dopočítáme z reálného prostoru feedu:
	// výřez se mění (mobilní chrome, PWA), takže 100vh by nestačilo.
	// Pod kartou zůstává jen tenký proužek horního okraje další karty —
	// dost na pozvánku ke scrollu, ale bez badge kategorie.
	const CARD_GAP = 14;
	const CARD_PEEK_RATIO = 0.025;
	const CARD_PEEK_MIN = 14;
	const CARD_PEEK_MAX = 20;
	const CARD_MIN_HEIGHT = 240;

	let feedEl = $state(null);
	let headerEl = $state(null);
	let cardStep = $state(0); // výška karty + mezera = krok scroll-snapu

	/**
	 * Změří dostupný prostor a nastaví CSS proměnné feedu.
	 * Vychází z clientHeight scrollovacího kontejneru (100dvh), takže
	 * respektuje dynamický chrome prohlížeče i safe-area v hlavičce.
	 */
	function measureFeed() {
		const container = feedEl;
		if (!container) return;

		const viewport = container.clientHeight || window.innerHeight;
		const headerHeight = headerEl?.offsetHeight ?? 0;
		const topOffset = headerHeight + 6;
		const peek = Math.min(
			Math.max(viewport * CARD_PEEK_RATIO, CARD_PEEK_MIN),
			CARD_PEEK_MAX
		);
		const cardHeight = Math.max(
			CARD_MIN_HEIGHT,
			viewport - topOffset - peek - CARD_GAP
		);
		const step = cardHeight + CARD_GAP;

		container.style.setProperty('--feed-top', `${topOffset}px`);
		container.style.setProperty('--feed-peek', `${peek}px`);
		container.style.setProperty('--feed-gap', `${CARD_GAP}px`);
		container.style.setProperty('--card-height', `${cardHeight}px`);
		container.style.setProperty('--feed-step', `${step}px`);
		cardStep = step;
	}

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
		// Bere se skutečná adresa prohlížeče — shallow pushState se do
		// page.url nepropíše a odtud by vypadl filtr kategorie.
		const url = new URL(window.location.href);
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
		menuOpen = false;
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
	 * Zrušení filtru z hlavičky: uživatel zůstane na příspěvku, na kterém stojí —
	 * ten se posune na první místo a zbytek feedu se znovu zamíchá napříč kategoriemi.
	 */
	function clearCategory() {
		const current = posts[currentIndex];
		applyCategory(null, { targetId: current ? current.id : null });
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
			// Absolutní cesta včetně base path — funguje i na /post/[id]/.
			const response = await fetch(`${base}/data/posts.json`);
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
		const step = cardStep || el.clientHeight;
		const scrollTop = el.scrollTop;
		const idx = Math.round(scrollTop / step);
		if (idx !== currentIndex && idx >= 0 && idx < posts.length) {
			currentIndex = idx;
			// Nabídka patří k příspěvku, na kterém uživatel stál — po posunu zavřít.
			menuOpen = false;
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
			// Krok feedu = výška karty + mezera; na první novou kartu
			// najedeme přesně, bez ohledu na výšku viewportu.
			const step = cardStep || container.clientHeight;
			container.style.scrollSnapType = 'none';
			container.style.scrollBehavior = 'auto';
			container.scrollTop = oldCount * step;
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

	// Feed sleduje pohyb v historii prohlížeče — Zpět/Vpřed vrátí i podobu feedu.
	// Schválně se nečte page.url: shallow pushState (přepnutí kategorie) se
	// do něj nepropíše a zůstává v něm adresa z posledního skutečného načtení.
	// Rozhoduje proto skutečná adresa prohlížeče; vlastní přepnutí kategorie
	// je synchronní, takže se sem vůbec nedostane.
	$effect(() => {
		if (!dataReady) return;
		const onPop = () => {
			const urlCategory = getCategoryFromUrl();
			if (urlCategory !== appliedCategory) {
				applyCategory(urlCategory, { syncUrl: false });
			}
		};
		window.addEventListener('popstate', onPop);
		return () => window.removeEventListener('popstate', onPop);
	});

	// Rozměry karty se přepočítají, když se změní viewport (otočení mobilu,
	// vysunutí lišty prohlížeče, resize okna) nebo výška hlavičky (safe-area).
	$effect(() => {
		const container = feedEl;
		const header = headerEl;
		if (!container || !header) return;

		measureFeed();

		const observer = new ResizeObserver(measureFeed);
		observer.observe(header);
		observer.observe(container);

		const onResize = () => measureFeed();
		window.addEventListener('resize', onResize);
		window.addEventListener('orientationchange', onResize);
		window.visualViewport?.addEventListener('resize', onResize);

		return () => {
			observer.disconnect();
			window.removeEventListener('resize', onResize);
			window.removeEventListener('orientationchange', onResize);
			window.visualViewport?.removeEventListener('resize', onResize);
		};
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
	<!-- App header — fixní překryv, výška se započítává do rozměru karty -->
	<header class="app-header" bind:this={headerEl}>
		<a href="." data-sveltekit-reload class="app-logo">faakt.io</a>
		{#if activeCategoryMeta}
			<button
				type="button"
				class="header-category"
				style="--cat-color: {activeCategoryMeta.color}"
				title="Zrušit filtr kategorie"
				aria-label={`Zrušit filtr kategorie ${activeCategoryMeta.label}`}
				onclick={clearCategory}
			>
				<span class="header-category-label">{activeCategoryMeta.label}</span>
				<span class="header-category-close" aria-hidden="true">×</span>
			</button>
		{:else}
			<span class="app-tagline">doomscrolling, ale lepší</span>
		{/if}
	</header>

	<div class="feed-container" bind:this={feedEl} onscroll={handleScroll}>
		<div class="feed-stack">
			{#each posts.slice(0, visibleCount) as post, i (post.id)}
				<div class="card-wrapper">
					<PostCard
						{post}
						onCategoryToggle={handleCategoryToggle}
						actionsOpen={menuOpen && activePost?.id === post.id}
						onToggleActions={() => (menuOpen = !menuOpen)}
						onCloseActions={() => (menuOpen = false)}
						onShare={sharePost}
						onReport={reportPost}
					/>
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

	<!-- Jen na dev serveru: ID právě zobrazeného příspěvku pro rychlé testování.
	     `import.meta.env.DEV` je při produkčním buildu nahrazeno za `false`,
	     takže se badge do produkčního bundle vůbec nedostane. -->
	{#if import.meta.env.DEV}
		<div class="dev-post-badge">
			{activePost ? `#${activePost.id}` : 'konec'}
			<span class="dev-post-badge-meta">
				{Math.min(currentIndex + 1, Math.max(posts.length, 1))}/{posts.length}
			</span>
		</div>
	{/if}

	<!-- Podklad pro zavření nabídky akcí — tlačítko i nabídka bydlí v kartě,
	     tenhle neviditelný překryv ale musí sahat přes celou obrazovku. -->
	{#if menuOpen}
		<button
			type="button"
			class="action-backdrop"
			tabindex="-1"
			aria-hidden="true"
			onclick={() => menuOpen = false}
		></button>
	{/if}

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
		/* Snapport začíná pod hlavičkou — karta se zarovná přesně pod ni,
		   ne pod její překryv. Hodnotu dopočítá measureFeed(). */
		scroll-padding-top: var(--feed-top, 0px);
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
		overscroll-behavior: none;
	}

	/* App header — fixní překryv nad feedem; jeho výšku měří measureFeed() */
	.app-header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 50;
		display: flex;
		align-items: baseline;
		gap: 10px;
		/* V PWA (standalone) jde obsah pod stavovou lištu / výřez — odsazení
		   drží logo pod nimi. V běžném prohlížeči jsou insety nulové. */
		padding:
			calc(16px + env(safe-area-inset-top, 0px))
			calc(20px + env(safe-area-inset-right, 0px))
			20px
			calc(20px + env(safe-area-inset-left, 0px));
		/* Spodní část hlavičky je průhledná — pod ní prosvítá kus předchozí karty */
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
		/* První karta začíná pod hlavičkou; stejná hodnota je i v
		   scroll-padding-top, takže snap sedí na stejné místo. */
		padding-top: var(--feed-top, 0px);
		/* Poslední karta se dá doklouzlit až nahoru */
		padding-bottom: var(--feed-peek, 0px);
	}

	/* Jeden krok feedu = karta + mezera. Pevná výška drží rytmus snapu
	   i tehdy, když se obsah karty liší. */
	.card-wrapper {
		position: relative;
		flex: none;
		height: var(--feed-step, calc(70dvh + 14px));
		padding:
			0
			max(16px, env(safe-area-inset-right, 0px))
			0
			max(16px, env(safe-area-inset-left, 0px));
		scroll-snap-align: start;
	}

	/* Podklad pro zavření nabídky akcí. Tlačítko i nabídka bydlí v kartě,
	   podklad ale musí zachytit tapnutí kdekoli na obrazovce. */
	.action-backdrop {
		position: fixed;
		inset: 0;
		padding: 0;
		border: none;
		background: none;
		z-index: 60;
		cursor: default;
		-webkit-tap-highlight-color: transparent;
	}

	/* End card (load more) — stejný krok jako karta, ať snap neskáče */
	.end-card {
		flex: none;
		height: var(--feed-step, 100dvh);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 24px;
		padding:
			calc(24px + env(safe-area-inset-top, 0px))
			calc(20px + env(safe-area-inset-right, 0px))
			calc(24px + env(safe-area-inset-bottom, 0px))
			calc(20px + env(safe-area-inset-left, 0px));
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

	/* Loading overlay — blokující stav, proto nad čtečkou (400) i nad
	   plovoucím akčním tlačítkem (410) */
	.loading-overlay {
		position: fixed;
		inset: 0;
		z-index: 500;
		background: var(--bg);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		color: var(--text-muted);
		font-size: 1rem;
	}

	/* Dev badge s ID příspěvku — vlevo dole, aby nekryl akce karty
	   (ty jsou vpravo dole) ani toast. Jen na dev serveru. */
	.dev-post-badge {
		position: fixed;
		bottom: calc(12px + env(safe-area-inset-bottom, 0px));
		left: 12px;
		z-index: 600;
		display: flex;
		align-items: baseline;
		gap: 6px;
		padding: 4px 9px;
		border: 1px solid rgba(255, 255, 255, 0.18);
		border-radius: 6px;
		background: rgba(0, 0, 0, 0.65);
		backdrop-filter: blur(6px);
		color: var(--text-muted);
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 11px;
		line-height: 1.3;
		pointer-events: none;
		user-select: none;
	}

	.dev-post-badge-meta {
		opacity: 0.6;
	}

	.progress-bar {
		position: fixed;
		/* Pod stavovou lištou, aby nebyla v PWA schovaná za ní */
		top: env(safe-area-inset-top, 0px);
		left: 0;
		height: 3px;
		background: linear-gradient(90deg, var(--accent), var(--accent-secondary));
		transition: width 0.3s ease;
		z-index: 100;
		border-radius: 0 2px 2px 0;
	}

	.toast {
		position: fixed;
		bottom: calc(80px + env(safe-area-inset-bottom, 0px));
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
		/* Nad vším včetně čtečky (400) — hláška musí být vidět vždy */
		z-index: 450;
		white-space: nowrap;
		pointer-events: none;
	}

	:global(.toast.visible) {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}
</style>
