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
	let { post } = $props();
	let expanded = $state(false);

	const categoryMeta = {
		'historie':    { label: 'Historie',    color: 'var(--cat-historie)' },
		'filozofie':   { label: 'Filozofie',   color: 'var(--cat-filozofie)' },
		'veda':        { label: 'Věda',        color: 'var(--cat-veda)' },
		'umeni':       { label: 'Umění',       color: 'var(--cat-umeni)' },
		'literatura':  { label: 'Literatura',  color: 'var(--cat-literatura)' },
		'politika':    { label: 'Politika',    color: 'var(--cat-politika)' },
		'fyzika':      { label: 'Fyzika',      color: 'var(--cat-fyzika)' },
		'astronomie':  { label: 'Astronomie',  color: 'var(--cat-astronomie)' },
		'zajimavost':  { label: 'Zajímavost',  color: 'var(--cat-zajimavost)' },
			'ekonomie':    { label: 'Ekonomie',    color: 'var(--cat-ekonomie)' },
			'psychologie': { label: 'Psychologie', color: 'var(--cat-psychologie)' },
			'filmy':       { label: 'Filmy',       color: 'var(--cat-filmy)' },
			'matematika':  { label: 'Matematika',  color: 'var(--cat-matematika)' },
			'pocitacove-vedy': { label: 'Počítačové vědy', color: 'var(--cat-pocitacove-vedy)' }
	};

	let cat = $derived(categoryMeta[post.category] || { label: post.category, color: 'var(--text-muted)' });
	let hasSources = $derived(post.sources && post.sources.length > 0);
</script>

<article class="post-card">
	<div class="card-content">
		<span class="category-badge" style="--cat-color: {cat.color}">{cat.label}</span>
		<h2 class="title">{post.title}</h2>
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
		display: inline-block;
		font-size: 0.65rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--cat-color);
		border: 1px solid var(--cat-color);
		border-radius: 999px;
		padding: 4px 12px;
		width: fit-content;
		background: rgba(0, 0, 0, 0.3);
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