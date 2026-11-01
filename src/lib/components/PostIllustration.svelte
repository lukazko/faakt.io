<script>
	import { base } from '$app/paths';

	/** @type {{ post?: { id?: string } | null, active?: boolean }} */
	let { post = null, active = false } = $props();

	const generatedIds = new Set([
		'001', '002', '003', '004', '005', '006', '007', '008', '009', '010',
		'011', '012', '013', '014', '015', '016', '017', '018', '019', '020',
		'021', '022', '023', '024', '025', '026', '027', '028', '029', '030',
		'031', '032', '033', '034', '035', '036', '037', '038', '039', '040',
		'041', '042', '043', '044', '045', '046', '047', '048', '049', '050',
		'051', '052', '053', '054', '055', '056', '057', '058', '059', '060',
		'061', '062', '063', '064', '065', '066', '067', '068', '069', '070',
		'071', '072', '073', '074', '075', '076', '077', '078', '079', '080',
		'081', '082', '083', '084', '085', '086', '087', '088', '089', '090',
		'091', '092', '093', '094', '095', '096', '097', '098', '099', '100',
		'102', '104', '105', '106', '107', '108', '110', '111', '126', '558',
		'101', '103', '109', '112', '113', '114', '115', '116', '117', '118',
		'119', '120', '121', '122', '123', '124', '125', '127', '128', '129', '130',
		'131', '132', '133', '134'
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
