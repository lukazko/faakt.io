<script>
	import FeedView from '$lib/components/FeedView.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>faakt.io — doomscrolling, který má smysl</title>
</svelte:head>

<FeedView targetPostId={data.targetPostId} />