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
	import { getCategoryMeta } from '$lib/categories.js';
	import { getTeaser } from '$lib/teaser.js';

	let { post, categoryFilterActive = false, onCategoryToggle = null } = $props();
	let expanded = $state(false);        // rozbalené zdroje
	let revealed = $state(false);        // odhalený celý text postu
	let teaserHeight = $state(0);
	let contentHeight = $state(0);

	let cat = $derived(getCategoryMeta(post.category));
	let hasSources = $derived(post.sources && post.sources.length > 0);
	let teaser = $derived(getTeaser(post.content));

	// Změřené výšky drží animaci přesnou — bez mrtvého času u max-height.
	// Dokud teaser není změřený, max-height se neaplikuje, aby neproblikl.
	let teaserMaxHeight = $derived(revealed ? '0px' : teaserHeight ? `${teaserHeight}px` : null);
	let contentMaxHeight = $derived(revealed ? `${contentHeight || 1200}px` : '0px');
</script>

<article class="post-card">
	<div class="card-content">
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

		<div class="body">
			<!-- Teaser + CTA — po odhalení se plynule sbalí -->
			<div
				class="teaser-block"
				class:collapsed={revealed}
				style="max-height: {teaserMaxHeight}"
				aria-hidden={revealed}
			>
				<div class="teaser-inner" bind:clientHeight={teaserHeight}>
					<p class="teaser">{teaser}</p>
					<button
						type="button"
						class="reveal-btn"
						tabindex={revealed ? -1 : 0}
						aria-expanded={revealed}
						onclick={() => revealed = true}
					>
						Zjistit proč <span class="reveal-arrow" aria-hidden="true">→</span>
					</button>
				</div>
			</div>

			<!-- Celý obsah postu — skrytý, dokud uživatel neklikne na CTA -->
			<div class="content-reveal" class:open={revealed} style="max-height: {contentMaxHeight}">
				<div class="reveal-inner" bind:clientHeight={contentHeight}>
					<div class="content">{@html post.content}</div>

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
	.post-card {
		height: 100vh;
		height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px 20px;
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
		gap: 16px;
		padding-bottom: 16px;
	}

	.teaser {
		font-size: 0.95rem;
		line-height: 1.7;
		color: var(--text-muted);
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.reveal-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		align-self: flex-start;
		min-height: 44px;
		padding: 12px 24px;
		border: none;
		border-radius: 999px;
		background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
		color: var(--bg);
		font-family: inherit;
		font-size: 0.9rem;
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.15s, box-shadow 0.15s;
		box-shadow: 0 4px 20px rgba(217, 119, 6, 0.25);
	}

	.reveal-btn:active {
		transform: scale(0.95);
		box-shadow: 0 2px 10px rgba(217, 119, 6, 0.4);
	}

	.reveal-arrow {
		font-size: 1rem;
		line-height: 1;
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
		margin-bottom: 10px;
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