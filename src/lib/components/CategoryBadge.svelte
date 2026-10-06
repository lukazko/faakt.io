<script>
	/**
	 * Label kategorie. V kartě ve feedu je klikací (přepne na feed kategorie),
	 * v čtečce postu je jen popiskem — proto je bez `onToggle` vykreslený
	 * jako <span>, ale se stejným vzhledem.
	 * @type {{
	 *   category: string,
	 *   postId?: string | null,
	 *   onToggle?: ((slug: string, postId: string) => void) | null
	 * }}
	 */
	import { getCategoryMeta } from '$lib/categories.js';

	let { category, postId = null, onToggle = null } = $props();

	let cat = $derived(getCategoryMeta(category));
</script>

{#if onToggle}
	<button
		type="button"
		class="category-badge"
		style="--cat-color: {cat.color}"
		title={`Zobrazit jen kategorii ${cat.label}`}
		onclick={() => onToggle(category, postId)}
	>
		{cat.label}
	</button>
{:else}
	<span class="category-badge" style="--cat-color: {cat.color}">{cat.label}</span>
{/if}

<style>
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
</style>
