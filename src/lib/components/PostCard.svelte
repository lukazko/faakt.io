<script>
	/**
	 * @type {{
	 *   id: string,
	 *   title: string,
	 *   content: string,
	 *   category: string,
	 *   sources: Array<{ label: string, url: string }>
	 * }}
	 */
	import { untrack } from 'svelte';
	import { getCategoryMeta } from '$lib/categories.js';
	import { getHook, getCta, splitTakeaway } from '$lib/teaser.js';

	let {
		post,
		categoryFilterActive = false,
		onCategoryToggle = null,
		onHeaderEl = null,     // (postId, element) — FeedView si hlavičku pozoruje
		onReveal = null        // (postId, rozbaleno) — FeedView podle toho vypíná snap
	} = $props();
	let expanded = $state(false);        // rozbalené zdroje
	let revealed = $state(false);        // odhalený celý text postu
	let teaserHeight = $state(0);
	let contentHeight = $state(0);
	let headerEl = $state(null);         // kategorie + titulek jako jeden blok

	// FeedView potřebuje k pozorování samotný element hlavičky. `untrack`, aby
	// se registrace nepřepočítávala při každé změně stavu ve FeedView.
	$effect(() => {
		const el = headerEl;
		if (!el) return;
		untrack(() => onHeaderEl?.(post.id, el));
		return () => onHeaderEl?.(post.id, null);
	});

	// Odmountovaná karta nesmí nechat ve FeedView viset svůj stav
	$effect(() => () => onReveal?.(post.id, false));

	function reveal() {
		if (revealed) return;
		revealed = true;
		// Hlásí se synchronně s kliknutím — feed musí stihnout vypnout
		// scroll-snap dřív, než se karta začne natahovat.
		onReveal?.(post.id, true);
	}

	let cat = $derived(getCategoryMeta(post.category));
	let hasSources = $derived(post.sources && post.sources.length > 0);

	let hook = $derived(getHook(post.content));
	let cta = $derived(getCta(post, hook));
	let parts = $derived(splitTakeaway(post.content));

	// Změřené výšky drží animaci přesnou — bez mrtvého času u max-height.
	// Dokud teaser není změřený, max-height se neaplikuje, aby neproblikl.
	let teaserMaxHeight = $derived(revealed ? '0px' : teaserHeight ? `${teaserHeight}px` : null);
	let contentMaxHeight = $derived(revealed ? `${contentHeight || 1200}px` : '0px');
</script>

<article class="post-card">
	<div class="card-content">
		<!-- Kategorie + titulek jako jeden blok — FeedView na něm pozná,
		     že původní hlavička odscrollovala za sticky hlavičku -->
		<div class="post-header" data-post-id={post.id} bind:this={headerEl}>
			<!-- V category feedu se label nezobrazuje — kategorii drží hlavička -->
			{#if !categoryFilterActive}
				<button
					type="button"
					class="category-badge"
					style="--cat-color: {cat.color}"
					title={`Zobrazit jen kategorii ${cat.label}`}
					onclick={() => onCategoryToggle?.(post.category, post.id)}
				>
					{cat.label}
				</button>
			{/if}
			<h2 class="title">{post.title}</h2>
		</div>

		<div class="body">
			<!-- Teaser + CTA — po odhalení se plynule sbalí -->
			<div
				class="teaser-block"
				class:collapsed={revealed}
				style="max-height: {teaserMaxHeight}"
				aria-hidden={revealed}
			>
				<div class="teaser-inner" bind:clientHeight={teaserHeight}>
					<p class="teaser">{hook}</p>
					<button
						type="button"
						class="reveal-btn"
						tabindex={revealed ? -1 : 0}
						aria-expanded={revealed}
						onclick={reveal}
					>
						<span class="reveal-btn-text">{cta}</span>
					</button>
				</div>
			</div>

			<!-- Celý obsah postu — skrytý, dokud uživatel neklikne na CTA -->
			<div class="content-reveal" class:open={revealed} style="max-height: {contentMaxHeight}">
				<div class="reveal-inner" bind:clientHeight={contentHeight}>
					<div class="content">{@html parts.body}</div>

					<!-- Závěrečný odstavec jako samostatný takeaway -->
					{#if parts.takeaway}
						<div class="takeaway">
							<span class="takeaway-label">Takeaway</span>
							<div class="takeaway-text">{@html parts.takeaway}</div>
						</div>
					{/if}

					{#if hasSources}
						<div class="sources">
							<button class="source-toggle" onclick={() => expanded = !expanded}>
								<span class="source-icon">&#9432;</span>
								Zdroje ({post.sources.length})
								<span class="chevron" class:rotated={expanded}>&#9662;</span>
							</button>
							{#if expanded}
								<ul class="source-list">
									{#each post.sources as src}
										<li>
											<a href={src.url} target="_blank" rel="noopener noreferrer">{src.label}</a>
										</li>
									{/each}
								</ul>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</article>

<style>
	/* min-height, ne height — rozbalený text delší než obrazovka musí kartu
	   natáhnout, aby se dalo číst scrollováním (dřív přetékal přes další kartu) */
	.post-card {
		min-height: 100vh;
		min-height: 100dvh;
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

	.category-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.65rem;
		font-family: inherit;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--cat-color);
		border: 1px solid var(--cat-color);
		border-radius: 999px;
		padding: 4px 12px;
		width: fit-content;
		background: rgba(0, 0, 0, 0.3);
		position: relative;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
	}

	.category-badge:active {
		transform: scale(0.95);
	}

	/* Větší dotyková plocha na mobilu — vzhled zůstává stejný */
	.category-badge::after {
		content: '';
		position: absolute;
		inset: -10px;
	}

	/* Obal drží stejný rytmus jako dřív — badge a titulek byly přímé potomky
	   `.card-content`, teď jsou spolu v jedné skupině se stejnou mezerou */
	.post-header {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.title {
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1.35;
		color: var(--text);
	}

	.content {
		font-size: 0.95rem;
		line-height: 1.7;
		color: var(--text-muted);
	}

	/* Teaser a rozbalený obsah drží stejné rozestupy jako dřív obsah + zdroje */
	.body {
		display: flex;
		flex-direction: column;
	}

	.teaser-block {
		overflow: hidden;
		opacity: 1;
		transition: max-height 0.35s ease, opacity 0.22s ease;
	}

	.teaser-block.collapsed {
		opacity: 0;
		pointer-events: none;
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

	.content-reveal {
		overflow: hidden;
		opacity: 0;
		transform: translateY(-6px);
		transition: max-height 0.4s ease, opacity 0.3s ease, transform 0.4s ease;
	}

	.content-reveal.open {
		opacity: 1;
		transform: translateY(0);
	}

	.reveal-inner {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.content :global(p) {
		margin-bottom: 14px;
	}

	.content :global(p:last-child) {
		margin-bottom: 0;
	}

	.content :global(strong) {
		color: var(--text);
		font-weight: 700;
	}

	.content :global(ul) {
		list-style: none;
		padding-left: 0;
		margin: 8px 0;
	}

	.content :global(ul li) {
		padding: 4px 0 4px 20px;
		position: relative;
	}

	.content :global(ul li::before) {
		content: '—';
		position: absolute;
		left: 0;
		color: var(--accent);
	}

	.content :global(em) { font-style: italic; color: var(--text-muted); }

	/* Takeaway — vizuálně oddělený závěr postu */
	.takeaway {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 14px 16px;
		border-left: 2px solid var(--accent);
		border-radius: 0 10px 10px 0;
		background: rgba(255, 255, 255, 0.03);
	}

	.takeaway-label {
		font-size: 0.6rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--accent);
		opacity: 0.85;
	}

	.takeaway-text {
		font-size: 0.95rem;
		line-height: 1.7;
		color: var(--text);
	}

	.takeaway-text :global(p) {
		margin: 0;
	}

	.takeaway-text :global(strong) {
		font-weight: 700;
	}

	/* Sources */
	.sources {
		margin-top: 4px;
	}

	.source-toggle {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.72rem;
		color: #555;
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px 8px;
		border-radius: 6px;
		transition: background 0.15s, color 0.15s;
	}

	.source-toggle:hover {
		background: rgba(255,255,255,0.04);
		color: #888;
	}

	.source-icon {
		font-size: 0.8rem;
	}

	.chevron {
		font-size: 0.6rem;
		transition: transform 0.2s;
	}

	.chevron.rotated {
		transform: rotate(180deg);
	}

	.source-list {
		margin-top: 8px;
		padding-left: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.source-list li {
		padding: 0;
	}

	.source-list a {
		font-size: 0.7rem;
		color: var(--accent);
		opacity: 0.7;
		text-decoration: none;
		transition: opacity 0.15s;
		word-break: break-all;
	}

	.source-list a:hover {
		opacity: 1;
		text-decoration: underline;
	}
</style>