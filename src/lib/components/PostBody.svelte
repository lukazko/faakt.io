<script>
	/**
	 * Plné znění postu — tělo, takeaway a zdroje.
	 * Sdílí ho čtečka postu (PostSheet); karta ve feedu z něj zobrazuje jen teaser.
	 * @type {{
	 *   post: {
	 *     id: string,
	 *     title: string,
	 *     content: string,
	 *     category: string,
	 *     sources: Array<{ label: string, url: string }>
	 *   }
	 * }}
	 */
	import { splitTakeaway } from '$lib/teaser.js';

	let { post } = $props();

	let sourcesOpen = $state(false);

	let parts = $derived(splitTakeaway(post.content));
	let hasSources = $derived(post.sources && post.sources.length > 0);
</script>

<div class="post-body">
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
			<button class="source-toggle" onclick={() => sourcesOpen = !sourcesOpen}>
				<span class="source-icon">&#9432;</span>
				Zdroje ({post.sources.length})
				<span class="chevron" class:rotated={sourcesOpen}>&#9662;</span>
			</button>
			{#if sourcesOpen}
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

<style>
	.post-body {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.content {
		font-size: 0.95rem;
		line-height: 1.7;
		color: var(--text-muted);
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
