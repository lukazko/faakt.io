<script>
	/**
	 * Čtečka celého postu otevřená z CTA v kartě.
	 * Na mobilu zabírá celou obrazovku (článek, ne dialog), na větších
	 * displejích je vycentrovaný panel. Feed zůstává za ní nedotčený —
	 * sheet je překryv, takže se pozice scrollování ve feedu nemění.
	 * @type {{
	 *   post: {
	 *     id: string,
	 *     title: string,
	 *     content: string,
	 *     category: string,
	 *     sources: Array<{ label: string, url: string }>
	 *   },
	 *   onClose: () => void
	 * }}
	 */
	import CategoryBadge from './CategoryBadge.svelte';
	import PostBody from './PostBody.svelte';

	let { post, onClose } = $props();

	function handleKeydown(event) {
		if (event.key === 'Escape') onClose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="sheet-root">
	<!-- Podklad přes celou obrazovku — tapnutí mimo panel čtečku zavře -->
	<button
		type="button"
		class="sheet-backdrop"
		tabindex="-1"
		aria-hidden="true"
		onclick={onClose}
	></button>

	<section class="sheet" role="dialog" aria-modal="true" aria-label={post.title}>
		<div class="sheet-header">
			<button type="button" class="sheet-close" aria-label="Zavřít" onclick={onClose}>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
					<line x1="6" y1="6" x2="18" y2="18"/>
					<line x1="18" y1="6" x2="6" y2="18"/>
				</svg>
			</button>
		</div>

		<div class="sheet-scroll">
			<article class="sheet-article">
				<CategoryBadge category={post.category} />
				<h2 class="title">{post.title}</h2>
				<PostBody {post} />
			</article>
		</div>
	</section>
</div>

<style>
	.sheet-root {
		position: fixed;
		inset: 0;
		z-index: 400;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.sheet-backdrop {
		position: absolute;
		inset: 0;
		padding: 0;
		border: none;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(2px);
		cursor: default;
		-webkit-tap-highlight-color: transparent;
	}

	/* Mobil: celá obrazovka — čtečka článku, ne malý dialog */
	.sheet {
		position: relative;
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		background: var(--bg);
		overflow: hidden;
		animation: sheetIn 0.28s ease-out;
	}

	@keyframes sheetIn {
		from { opacity: 0; transform: translateY(16px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	.sheet-header {
		flex: none;
		display: flex;
		justify-content: flex-end;
		padding:
			calc(12px + env(safe-area-inset-top, 0px))
			calc(12px + env(safe-area-inset-right, 0px))
			0
			calc(12px + env(safe-area-inset-left, 0px));
	}

	.sheet-close {
		width: 40px;
		height: 40px;
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
	}

	.sheet-close:active {
		transform: scale(0.9);
		background: var(--accent);
		color: var(--bg);
		border-color: var(--accent);
	}

	/* Obsah se posouvá samostatně — přesah se nepřenáší na feed za sheetem */
	.sheet-scroll {
		flex: 1;
		overflow-y: auto;
		overscroll-behavior: contain;
		-webkit-overflow-scrolling: touch;
		padding:
			4px
			calc(20px + env(safe-area-inset-right, 0px))
			calc(40px + env(safe-area-inset-bottom, 0px))
			calc(20px + env(safe-area-inset-left, 0px));
	}

	.sheet-article {
		display: flex;
		flex-direction: column;
		gap: 16px;
		max-width: 500px;
		margin: 0 auto;
	}

	.title {
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1.35;
		color: var(--text);
	}

	/* Na větších displejích vycentrovaný panel místo celé obrazovky */
	@media (min-width: 641px) {
		.sheet-root {
			padding: 32px 20px;
		}

		.sheet {
			width: min(560px, 100%);
			height: auto;
			max-height: 100%;
			border: 1px solid #333;
			border-radius: 18px;
			box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
			animation: none;
		}

		.sheet-header {
			padding: 12px 12px 0;
		}

		.sheet-scroll {
			padding: 4px 24px 32px;
		}
	}
</style>
