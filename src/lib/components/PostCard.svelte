<script>
	/**
	 * Oboustranná karta příspěvku.
	 * Líc: hook, titulek, kategorie a CTA, které kartu otočí.
	 * Rub: celý text a zdroje ve vlastní scrollovací ploše.
	 *
	 * Karta má pevnou výšku zvenčí (--card-height, počítá FeedView), takže
	 * otočení ani délka obsahu nemění rozměry ani pozici ve feedu.
	 * @type {{
	 *   post: {
	 *     id: string,
	 *     title: string,
	 *     content: string,
	 *     category: string,
	 *     sources: Array<{ label: string, url: string }>
	 *   },
	 *   onCategoryToggle?: ((slug: string, postId: string) => void) | null
	 * }}
	 */
	import { tick } from 'svelte';
	import CategoryBadge from './CategoryBadge.svelte';
	import PostBody from './PostBody.svelte';
	import { getHook } from '$lib/teaser.js';

	let { post, onCategoryToggle = null } = $props();

	let hook = $derived(getHook(post.content));

	// Stav otočení patří konkrétní kartě. Feed každou kartu klíčuje podle
	// post.id, takže se nikdy nezobrazí rub u jiného příspěvku.
	let flipped = $state(false);

	let frontBtnEl = $state(null);
	let backScrollEl = $state(null);

	const frontId = $derived(`post-front-${post.id}`);
	const backId = $derived(`post-back-${post.id}`);

	async function flipToBack() {
		if (flipped) return;
		flipped = true;
		// Fokus přechází na viditelnou stranu — klávesnicí se tak hned dá
		// pokračovat ve čtení a skrytý líc nezůstane zaměřený.
		await tick();
		// Na rubu není žádné tlačítko — fokus dostane scrollovací plocha,
		// aby se klávesnicí dalo rovnou číst a Escape vrátil kartu zpět.
		backScrollEl?.focus({ preventScroll: true });
	}

	async function flipToFront() {
		if (!flipped) return;
		flipped = false;
		await tick();
		frontBtnEl?.focus({ preventScroll: true });
	}

	function handleKeydown(event) {
		if (event.key === 'Escape' && flipped) {
			event.stopPropagation();
			flipToFront();
		}
	}

	// Kliknutí kamkoli na kartu ji otočí. Ovládací prvky (tlačítka, odkazy)
	// si klik řeší samy, stejně jako dokončený výběr textu.
	function handleCardClick(event) {
		const target = event.target;
		if (!(target instanceof Element)) return;
		if (target.closest('a, button, input, textarea, select, label, summary')) return;

		const selection = window.getSelection();
		if (selection && !selection.isCollapsed) return;

		if (flipped) flipToFront();
		else flipToBack();
	}
</script>

<!-- perspective drží 3D otočení; fokus i čtečka vidí vždy jen jednu stranu -->
<article class="post-card" class:flipped onkeydown={handleKeydown} onclick={handleCardClick}>
	<div class="card-stage">
		<!-- LÍC -->
		<section
			id={frontId}
			class="card-face card-front"
			inert={flipped}
			aria-hidden={flipped}
			aria-labelledby="{frontId}-title"
		>
			<div class="front-inner">
				<div class="front-top">
					<CategoryBadge
						category={post.category}
						postId={post.id}
						onToggle={onCategoryToggle}
					/>
				</div>

				<div class="front-main">
					<h2 id="{frontId}-title" class="title">{post.title}</h2>
					<p class="teaser">{hook}</p>
				</div>

				<div class="front-footer">
					<button
						bind:this={frontBtnEl}
						type="button"
						class="flip-btn"
						aria-controls={backId}
						aria-expanded={flipped}
						aria-label={`Otevřít celý text: ${post.title}`}
						onclick={flipToBack}
					>
						<span class="flip-btn-text">celý text</span>
						<svg class="flip-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
							<path d="M21 3v5h-5" />
							<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
							<path d="M8 16H3v5" />
						</svg>
					</button>
				</div>
			</div>
		</section>

		<!-- RUB -->
		<section
			id={backId}
			class="card-face card-back"
			inert={!flipped}
			aria-hidden={!flipped}
			aria-labelledby="{backId}-title"
		>
			<!-- Vlastní scrollovací plocha rubu. overscroll-behavior: contain
			     brání tomu, aby scrollování článku omylem posunulo feed. -->
			<div class="back-scroll" bind:this={backScrollEl} tabindex="0" aria-label={`Celý text: ${post.title}`} aria-keyshortcuts="Escape">
				<div class="back-inner">
					<div class="back-meta">
						<CategoryBadge category={post.category} />
					</div>
					<h2 id="{backId}-title" class="back-title">{post.title}</h2>
					<PostBody {post} />
				</div>
			</div>
		</section>
	</div>
</article>

<style>
	.post-card {
		position: relative;
		/* Pevná výška z FeedView — nikdy se neřídí délkou obsahu */
		height: var(--card-height, 70dvh);
		width: 100%;
		max-width: 520px;
		margin: 0 auto;
		perspective: 1600px;
		-webkit-perspective: 1600px;
	}

	.card-stage {
		position: relative;
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
		transition: transform 0.42s cubic-bezier(0.2, 0.75, 0.25, 1);
	}

	.post-card.flipped .card-stage {
		transform: rotateY(180deg);
	}

	.card-face {
		position: absolute;
		cursor: pointer;
		inset: 0;
		display: flex;
		flex-direction: column;
		min-height: 0;
		overflow: hidden;
		background: #101010;
		background: linear-gradient(180deg, #141414 0%, #0d0d0d 100%);
		border: 1px solid #262626;
		border-radius: 22px;
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
		-webkit-backface-visibility: hidden;
		backface-visibility: hidden;
	}

	.card-back {
		transform: rotateY(180deg);
	}

	/* Skrytá strana nesmí chytat tapnutí ani myš */
	.post-card.flipped .card-front,
	.post-card:not(.flipped) .card-back {
		pointer-events: none;
	}

	/* --- Líc --- */
	.front-inner {
		display: flex;
		flex-direction: column;
		gap: 14px;
		height: 100%;
		min-height: 0;
		padding: clamp(18px, 3.4vh, 28px) clamp(18px, 5vw, 30px);
	}

	.front-top {
		flex: none;
		display: flex;
		align-items: center;
		min-height: 26px;
	}

	/* Hook i titulek jsou omezené počtem řádků — dlouhý text nikdy
	   neroztáhne kartu ani nepřekryje CTA. */
	.front-main {
		flex: 1 1 auto;
		min-height: 0;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 14px;
	}

	.title {
		font-size: clamp(1.15rem, 1.05rem + 0.7vw, 1.45rem);
		font-weight: 700;
		line-height: 1.3;
		color: var(--text);
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.teaser {
		font-size: 0.95rem;
		line-height: 1.68;
		color: var(--text-muted);
		display: -webkit-box;
		-webkit-line-clamp: 6;
		line-clamp: 6;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.front-footer {
		flex: none;
		display: flex;
		align-items: center;
	}

	/* CTA zůstává textový odkaz, ne pill — drží vizuální jazyk feedu */
	.flip-btn {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		min-height: 44px;
		padding: 8px 0;
		border: none;
		background: none;
		font-family: inherit;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.flip-btn-text {
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

	.flip-btn:hover .flip-btn-text {
		border-color: var(--accent-secondary);
	}

	.flip-icon {
		flex: none;
		color: var(--accent-secondary);
		opacity: 0.8;
		transition: transform 0.3s;
	}

	.flip-btn:hover .flip-icon {
		transform: rotate(180deg);
	}

	/* --- Rub --- */
	/* Rub scrolluje sám; přesah se nepřenáší na feed pod kartou */
	.back-scroll {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		touch-action: pan-y;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: thin;
		scrollbar-color: #333 transparent;
		padding: clamp(16px, 2.8vh, 22px) clamp(18px, 5vw, 30px) clamp(22px, 4vh, 32px);
	}

	.back-scroll:focus-visible {
		outline: 2px solid var(--accent-secondary);
		outline-offset: -3px;
		border-radius: 20px;
	}

	.back-inner {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.back-meta {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.back-title {
		font-size: 1.2rem;
		font-weight: 700;
		line-height: 1.3;
		color: var(--text);
	}

	.flip-btn:focus-visible {
		outline: 2px solid var(--accent-secondary);
		outline-offset: 3px;
		border-radius: 8px;
	}

	/* Nízký viewport (např. mobil na šířku) — méně řádků, aby zůstalo
	   vidět CTA a karta nepůsobila přeplácaně */
	@media (max-height: 560px) {
		.front-inner {
			gap: 10px;
			padding-top: 20px;
			padding-bottom: 16px;
		}

		.title {
			-webkit-line-clamp: 2;
			line-clamp: 2;
		}

		.teaser {
			-webkit-line-clamp: 3;
			line-clamp: 3;
		}
	}

	/* Bez 3D animace, strana se jen okamžitě vymění */
	@media (prefers-reduced-motion: reduce) {
		.card-stage {
			transition: none;
		}

		.flip-btn:hover .flip-icon {
			transform: none;
		}
	}
</style>
