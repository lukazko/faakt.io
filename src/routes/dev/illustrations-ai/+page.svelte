<script>
	import { base } from '$app/paths';
	import samples from '../../../../static/illustrations-ai/manifest.json';
	import CategoryBadge from '$lib/components/CategoryBadge.svelte';
</script>

<svelte:head>
	<title>AI ilustrace — faakt.io</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main>
	<header>
		<a href={`${base}/`}>faakt.io</a>
		<h1>AI ilustrace 001–045</h1>
		<p>Produkční náhled statických obrázků v rozměru mobilní karty.</p>
	</header>
	<div class="gallery">
		{#each samples as post}
			<article>
				<img src={`${base}${post.image}`} alt="" width="640" height="360" />
				<div class="copy">
					<div><CategoryBadge category={post.category} /><span>#{post.id}</span></div>
					<h2>{post.title}</h2>
					{#if post.review?.status === 'rejected-simplicity'}
						<p>Ke zjednodušení: příliš jemné detaily při 160×90 px. V produkčních kartách se nezobrazuje.</p>
					{/if}
				</div>
			</article>
		{/each}
	</div>
</main>

<style>
	main { height: 100dvh; overflow: auto; padding: 32px 18px 72px; color: var(--text); }
	header, .gallery { width: min(100%, 1080px); margin-inline: auto; }
	header { margin-bottom: 24px; }
	header a { font-size: 24px; font-weight: 900; color: var(--accent-secondary); }
	h1 { margin: 16px 0 6px; font-size: 26px; }
	header p, span { color: var(--text-muted); }
	.gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; }
	article { overflow: hidden; border: 1px solid #262626; border-radius: 22px; background: linear-gradient(180deg, #141414, #0d0d0d); }
	img { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: contain; }
	.copy { padding: 18px 20px 22px; }
	.copy div { display: flex; align-items: center; justify-content: space-between; }
	h2 { margin-top: 14px; font-size: 18px; line-height: 1.3; }
</style>
