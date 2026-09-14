<script>
	/**
	 * FeedView — hlavní komponenta pro scrollování příspěvky
	 * @param {string} [targetPostId] — pokud je uvedeno, tato myšlenka se zobrazí jako první
	 */
	import PostCard from './PostCard.svelte';

	let { targetPostId } = $props();

	let posts = $state([]);
	let loading = $state(true);
	let currentIndex = $state(0);
	let totalPosts = $state(0);
	let error = $state(null);
	let base = $state(import.meta.env.BASE_URL || '');

	/**
	 * Fisher-Yates shuffle — každý uživatel vidí myšlenky v jiném pořadí.
	 * Pokud je zadáno targetPostId, daná myšlenka bude první.
	 */
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

	async function loadPosts() {
		try {
			const res = await fetch(`${base}data/posts.json`);
			if (!res.ok) throw new Error('Nepodařilo se načíst příspěvky');
			const raw = await res.json();
			posts = shufflePosts(raw, targetPostId);
			totalPosts = posts.length;
			// Scroll to top after data loads so the first post is visible
			requestAnimationFrame(() => {
				const container = document.querySelector('.feed-container');
				if (container) container.scrollTop = 0;
			});
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	function handleScroll(e) {
		const el = e.target;
		const cardHeight = el.clientHeight;
		const scrollTop = el.scrollTop;
		const idx = Math.round(scrollTop / cardHeight);
		if (idx !== currentIndex && idx >= 0 && idx < posts.length) {
			currentIndex = idx;
			// Update URL hash to match current post
			const post = posts[idx];
			if (post) {
				const url = `${window.location.origin}${base}post/${post.id}`;
				window.history.replaceState({}, '', url);
			}
		}
	}

	async function sharePost(post) {
		const url = `${window.location.origin}${base}post/${post.id}`;
		if (navigator.share) {
			try {
				await navigator.share({
					title: post.title,
					text: `${post.title}\n\n${post.content}`,
					url: url
				});
			} catch (err) {
				// user cancelled
			}
		} else {
			// Fallback: copy to clipboard
			try {
				await navigator.clipboard.writeText(`${post.title}\n\n${post.content}\n\n${url}`);
				showToast('Text zkopírován do schránky');
			} catch {
				showToast('Sdílení není podporováno');
			}
		}
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
		if (totalPosts === 0) return 0;
		return Math.round((currentIndex / totalPosts) * 100);
	}

	$effect(() => {
		loadPosts();
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
			<span class="app-logo">faakt.io</span>
			<span class="app-tagline">doomscrolling, který má smysl</span>
		</header>

		<div class="feed-stack">
			{#each posts as post, i (post.id)}
				<div class="card-wrapper">
					<PostCard {post} />

					<!-- Share button overlay -->
					<button
						class="share-btn"
						aria-label="Sdílet příspěvek"
						onclick={() => sharePost(post)}
					>
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
							<line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
						</svg>
					</button>
				</div>
			{/each}
		</div>
	</div>

	<!-- Progress bar -->
	<div class="progress-bar" style="width: {getProgress()}%"></div>

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
		font-size: 1.3rem;
		font-weight: 900;
		font-style: italic;
		letter-spacing: -0.02em;
		background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		position: relative;
	}

	.app-logo::before {
		content: '';
		position: absolute;
		inset: -6px -10px;
		background: radial-gradient(ellipse, rgba(167,139,250,0.12) 0%, transparent 70%);
		z-index: -1;
		pointer-events: none;
	}

	.app-tagline {
		font-size: 0.65rem;
		color: #555;
		font-weight: 400;
		letter-spacing: 0.03em;
	}

	.feed-stack {
		display: flex;
		flex-direction: column;
	}

	.card-wrapper {
		position: relative;
	}

	.share-btn {
		position: absolute;
		bottom: 32px;
		right: 20px;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: 1px solid #333;
		background: rgba(20, 20, 20, 0.8);
		backdrop-filter: blur(8px);
		color: var(--text-muted);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		z-index: 10;
	}

	.share-btn:active {
		transform: scale(0.9);
		background: var(--accent);
		color: var(--bg);
		border-color: var(--accent);
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