<script>
	import { base } from '$app/paths';

	/** @type {{ post?: { id?: string } | null, active?: boolean }} */
	let { post = null, active = false } = $props();

	const generatedIds = new Set([
		'001', '002', '003', '004', '005', '006', '007', '008', '009', '010',
		'011', '012', '013', '014', '015', '016', '017', '018', '019', '020',
		'021', '022', '023', '024', '025', '026', '027', '028', '029', '030',
		'031', '032', '033', '034', '035', '036', '037', '038', '039', '040',
		'041', '042', '043', '044', '045'
	]);

	let imageAvailable = $derived(Boolean(post?.id && generatedIds.has(post.id)));
</script>

{#if imageAvailable}
	<img
		class="post-illustration"
		src={`${base}/illustrations-ai/${post.id}.webp`}
		alt=""
		width="640"
		height="360"
		loading={active ? 'eager' : 'lazy'}
		fetchpriority={active ? 'high' : 'auto'}
		decoding="async"
		aria-hidden="true"
	/>
{/if}

<style>
	.post-illustration {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
		pointer-events: none;
		user-select: none;
	}
</style>
