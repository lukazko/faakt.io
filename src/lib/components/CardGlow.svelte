<script>

	/** @type {{ post?: { category?: string, illustration?: { palette?: string } } | null }} */
	let { post = null } = $props();

	// Záře karty: tři odlišné odstíny z ilustrační palety ve všech prostředích.
	const glowColors = {
		blue_gold: ['#4285db', '#e2ad45', '#6570ce'],
		green_copper: ['#49ac7c', '#d18350', '#399caa'],
		indigo_cyan: ['#7560d4', '#35c4d5', '#4b83d9'],
		monochrome_cool: ['#638fbe', '#8e83b4', '#59a9b3'],
		monochrome_warm: ['#bd855b', '#d6b578', '#b47286'],
		teal_amber: ['#27aaa6', '#e5a13e', '#4d82ba'],
		terracotta_cream: ['#d16f50', '#dfbf80', '#b77995'],
		violet_coral: ['#9657d2', '#e37e79', '#617ed0']
	};
	let glowPalette = $derived(glowColors[post?.illustration?.palette]
		?? [`var(--cat-${post?.category}, #638fbe)`, '#d6a363', '#8772bd']);

</script>

	<span
		class="illustration-glow"
		style:--glow-primary={glowPalette[0]}
		style:--glow-secondary={glowPalette[1]}
		style:--glow-accent={glowPalette[2]}
		aria-hidden="true"
	></span>

<style>
	.illustration-glow {
		position: absolute;
		inset: 0;
		z-index: 0;
		background:
			radial-gradient(ellipse 80% 56% at 0% 0%, var(--glow-primary), transparent 100%),
			radial-gradient(ellipse 68% 48% at 100% 0%, var(--glow-secondary), transparent 100%),
			radial-gradient(ellipse 74% 54% at 100% 100%, var(--glow-accent), transparent 100%),
			radial-gradient(ellipse 62% 45% at 0% 100%, var(--glow-primary), transparent 100%);
		opacity: 0.10;
		pointer-events: none;
	}

</style>
