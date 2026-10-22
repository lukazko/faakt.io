<script>
	/**
	 * Dekorativní ilustrace příspěvku.
	 *
	 * Scéna se skládá z několika desítek primitiv z `$lib/illustrations` —
	 * žádný obrázek, žádný filtr, žádné externí assety. Výběr i všechny
	 * varianty jsou deterministické podle ID příspěvku, takže stejná karta
	 * vypadá vždy stejně.
	 *
	 * Ilustrace je čistě vizuální: `aria-hidden`, žádný fokus a
	 * `pointer-events: none`, aby tapnutí prošlo na kartu (otočení).
	 *
	 * Volitelné `spec` umožňuje showcase a testovací stránce vykreslit
	 * konkrétní scénu bez obcházení stejného rendereru.
	 *
	 * @type {{
	 *   post?: {
	 *     id?: string,
	 *     title?: string,
	 *     content?: string,
	 *     category?: string
	 *   } | null,
	 *   spec?: ReturnType<typeof createGeometricIllustration> | null
	 * }}
	 */
	import { createGeometricIllustration } from '$lib/illustrations/index.js';

	let { post = null, spec: forcedSpec = null } = $props();

	let spec = $derived(forcedSpec ?? createGeometricIllustration({ post }));
</script>

<svg
	class="post-illustration"
	viewBox="0 0 320 180"
	preserveAspectRatio="xMidYMid meet"
	aria-hidden="true"
	focusable="false"
	role="presentation"
	data-family={spec.family}
>
	<g transform="translate(160 90) scale({spec.scale}) translate(-160 -90)">
		{#each spec.elements as el}
			{#if el.t === 'rect'}
				<rect
					x={el.x}
					y={el.y}
					width={el.w}
					height={el.h}
					rx={el.rx ?? 0}
					transform={el.transform}
					fill={el.fill ?? 'none'}
					fill-opacity={el.fillOpacity}
					stroke={el.stroke}
					stroke-width={el.sw}
					stroke-dasharray={el.dash}
					opacity={el.opacity}
				/>
			{:else if el.t === 'circle'}
				<circle
					cx={el.cx}
					cy={el.cy}
					r={el.r}
					transform={el.transform}
					fill={el.fill ?? 'none'}
					fill-opacity={el.fillOpacity}
					stroke={el.stroke}
					stroke-width={el.sw}
					stroke-dasharray={el.dash}
					opacity={el.opacity}
				/>
			{:else if el.t === 'ellipse'}
				<ellipse
					cx={el.cx}
					cy={el.cy}
					rx={el.rx}
					ry={el.ry}
					transform={[el.rot ? `rotate(${el.rot} ${el.cx} ${el.cy})` : '', el.transform]
						.filter(Boolean)
						.join(' ') || undefined}
					fill={el.fill ?? 'none'}
					fill-opacity={el.fillOpacity}
					stroke={el.stroke}
					stroke-width={el.sw}
					stroke-dasharray={el.dash}
					opacity={el.opacity}
				/>
			{:else if el.t === 'line'}
				<line
					x1={el.x1}
					y1={el.y1}
					x2={el.x2}
					y2={el.y2}
					transform={el.transform}
					stroke={el.stroke}
					stroke-width={el.sw}
					stroke-dasharray={el.dash}
					stroke-linecap={el.linecap}
					opacity={el.opacity}
				/>
			{:else if el.t === 'polyline'}
				<polyline
					points={el.points}
					transform={el.transform}
					fill={el.fill ?? 'none'}
					stroke={el.stroke}
					stroke-width={el.sw}
					stroke-dasharray={el.dash}
					stroke-linecap={el.linecap}
					stroke-linejoin={el.linejoin}
					opacity={el.opacity}
				/>
			{:else if el.t === 'path'}
				<path
					d={el.d}
					transform={el.transform}
					fill={el.fill ?? 'none'}
					fill-opacity={el.fillOpacity}
					stroke={el.stroke}
					stroke-width={el.sw}
					stroke-dasharray={el.dash}
					stroke-linecap={el.linecap}
					stroke-linejoin={el.linejoin}
					opacity={el.opacity}
				/>
			{/if}
		{/each}
	</g>
</svg>

<style>
	.post-illustration {
		display: block;
		width: 100%;
		height: auto;
		max-height: 100%;
		/* Ilustrace je dekorace — nesmí chytat tapnutí ani kurzor */
		pointer-events: none;
		user-select: none;
	}
</style>
