<script>
	/**
	 * @type {{
	 *   post: {
	 *     id: string,
	 *     title: string,
	 *     content: string,
	 *     category: string,
	 *     sources: Array<{ label: string, url: string }>
	 *   },
	 *   categoryFilterActive?: boolean,
	 *   onCategoryToggle?: ((slug: string, postId: string) => void) | null,
	 *   onOpen?: ((post: object) => void) | null
	 * }}
	 */
	import CategoryBadge from './CategoryBadge.svelte';
	import { getHook, getCta } from '$lib/teaser.js';

	let {
		post,
		categoryFilterActive = false,
		onCategoryToggle = null,
		onOpen = null
	} = $props();

	let hook = $derived(getHook(post.content));
	let cta = $derived(getCta(post, hook));
</script>

<article class="post-card">
	<div class="card-content">
		<!-- V category feedu se label nezobrazuje — kategorii drží hlavička -->
		{#if !categoryFilterActive}
			<CategoryBadge
				category={post.category}
				postId={post.id}
				onToggle={onCategoryToggle}
			/>
		{/if}
		<h2 class="title">{post.title}</h2>

		<div class="body">
			<!-- Teaser + CTA. CTA neotevírá text v kartě, ale čtečku (sheet) —
			     karta zůstává na místě a nemění výšku. -->
			<div class="teaser-inner">
				<p class="teaser">{hook}</p>
				<button
					type="button"
					class="reveal-btn"
					aria-haspopup="dialog"
					onclick={() => onOpen?.(post)}
				>
					<span class="reveal-btn-text">{cta}</span>
				</button>
			</div>
		</div>
	</div>
</article>

<style>
	.post-card {
		height: 100vh;
		height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		/* V PWA drží obsah mimo stavovou lištu a výřez. Dole a po stranách stačí
		   max() — sčítání by zbytečně zkracovalo obsah, i když tam nic nepřekáží. */
		padding:
			calc(24px + env(safe-area-inset-top, 0px))
			max(20px, env(safe-area-inset-right, 0px))
			max(24px, env(safe-area-inset-bottom, 0px))
			max(20px, env(safe-area-inset-left, 0px));
		scroll-snap-align: start;
		position: relative;
	}

	.card-content {
		max-width: 500px;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 16px;
		animation: fadeIn 0.4s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(8px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	.title {
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1.35;
		color: var(--text);
	}

	/* Teaser drží stejné rozestupy jako dřív obsah + zdroje */
	.body {
		display: flex;
		flex-direction: column;
	}

	.teaser-inner {
		display: flex;
		flex-direction: column;
		/* Mezery drží stejný rytmus jako dřív — padding CTA se do nich započítává */
		gap: 6px;
		padding-bottom: 6px;
	}

	/* Bez ořezu na počet řádků — hook musí zůstat celou větou */
	.teaser {
		font-size: 0.95rem;
		line-height: 1.7;
		color: var(--text-muted);
	}

	/* CTA jako pokračování textu, ne tlačítko — zůstává <button> kvůli
	   přístupnosti, ale bez pill tvaru, pozadí a stínu */
	.reveal-btn {
		display: inline-flex;
		align-items: center;
		align-self: flex-start;
		min-height: 44px;
		padding: 10px 0;
		border: none;
		background: none;
		font-family: inherit;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition: opacity 0.15s;
	}

	.reveal-btn:active {
		opacity: 0.65;
	}

	/* Gradient i linka sedí na textu, ne na paddingu tlačítka */
	.reveal-btn-text {
		/* Stejný gradient jako logo */
		background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		color: var(--accent-secondary);
		line-height: 1.3;
		padding-bottom: 2px;
		border-bottom: 1px solid rgba(245, 158, 11, 0.3);
		transition: border-color 0.15s;
	}

	.reveal-btn:hover .reveal-btn-text {
		border-color: var(--accent-secondary);
	}
</style>
