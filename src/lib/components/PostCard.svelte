<script>
	/**
	 * Oboustranná karta příspěvku.
	 * Líc: hook, titulek, kategorie a CTA, které kartu otočí.
	 * Rub: celý text a zdroje ve vlastní scrollovací ploše.
	 *
	 * Karta má pevnou výšku zvenčí (--card-height, počítá FeedView), takže
	 * otočení ani délka obsahu nemění rozměry ani pozici ve feedu.
	 * @type {{
	 *   post: {
	 *     id: string,
	 *     title: string,
	 *     content: string,
	 *     category: string,
	 *     sources: Array<{ label: string, url: string }>
	 *   },
	 *   onCategoryToggle?: ((slug: string, postId: string) => void) | null,
	 *   actionsOpen?: boolean,
	 *   onToggleActions?: (() => void) | null,
	 *   onCloseActions?: (() => void) | null,
	 *   onShare?: ((post: any) => void) | null,
	 *   onReport?: ((post: any) => void) | null
	 * }}
	 */
	import { tick } from 'svelte';
	import CategoryBadge from './CategoryBadge.svelte';
	import PostBody from './PostBody.svelte';
	import PostIllustration from './PostIllustration.svelte';
	import { getHook } from '$lib/teaser.js';

	let {
		post,
		onCategoryToggle = null,
		actionsOpen = false,
		onToggleActions = null,
		onCloseActions = null,
		onShare = null,
		onReport = null
	} = $props();

	let hook = $derived(getHook(post.content));

	// Stav otočení patří konkrétní kartě. Feed každou kartu klíčuje podle
	// post.id, takže se nikdy nezobrazí rub u jiného příspěvku.
	let flipped = $state(false);

	let frontBtnEl = $state(null);
	let backScrollEl = $state(null);

	const frontId = $derived(`post-front-${post.id}`);
	const backId = $derived(`post-back-${post.id}`);
	// Unikátní id gradientu — v DOM je karta pro každý příspěvek zvlášť.
	const actionGradId = $derived(`action-grad-${post.id}`);

	async function flipToBack() {
		if (flipped) return;
		// Nabídka patří jedné straně — při otáčení by na rubu visela
		// zrcadlově, takže ji otočení zavře.
		onCloseActions?.();
		flipped = true;
		// Fokus přechází na viditelnou stranu — klávesnicí se tak hned dá
		// pokračovat ve čtení a skrytý líc nezůstane zaměřený.
		await tick();
		// Na rubu není žádné tlačítko — fokus dostane scrollovací plocha,
		// aby se klávesnicí dalo rovnou číst a Escape vrátil kartu zpět.
		backScrollEl?.focus({ preventScroll: true });
	}

	async function flipToFront() {
		if (!flipped) return;
		flipped = false;
		await tick();
		frontBtnEl?.focus({ preventScroll: true });
	}

	function handleKeydown(event) {
		if (event.key !== 'Escape') return;
		// Nabídka se zavírá dřív než otočení — Escape vždy o krok zpět.
		if (actionsOpen) {
			event.stopPropagation();
			onCloseActions?.();
		} else if (flipped) {
			event.stopPropagation();
			flipToFront();
		}
	}

	// Kliknutí kamkoli na kartu ji otočí. Ovládací prvky (tlačítka, odkazy)
	// si klik řeší samy, stejně jako dokončený výběr textu.
	function handleCardClick(event) {
		const target = event.target;
		if (!(target instanceof Element)) return;
		if (target.closest('a, button, input, textarea, select, label, summary')) return;

		const selection = window.getSelection();
		if (selection && !selection.isCollapsed) return;

		// Otevřená nabídka leží nad podkladem, takže klik na kartu řeší karta
		// sama — první klik jen nabídku zavře, kartu nepřevrací.
		if (actionsOpen) {
			onCloseActions?.();
			return;
		}

		if (flipped) flipToFront();
		else flipToBack();
	}
</script>

<!-- Tlačítko akcí + nabídka pro jednu stranu karty. Každá strana má
     vlastní kopii s vlastním id gradientu, takže se obě otáčejí se svou
     plochou a nikdy se v DOM neperou o stejné id. -->
{#snippet actionControls(side)}
	{@const gradId = `${actionGradId}-${side}`}
	<button
		class="action-btn"
		type="button"
		aria-label="Další možnosti"
		aria-haspopup="menu"
		aria-expanded={actionsOpen}
		onclick={() => onToggleActions?.()}
	>
		<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
			<defs>
				<linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1="5" y1="12" x2="19" y2="12">
					<stop offset="0%" style="stop-color: var(--accent)" />
					<stop offset="100%" style="stop-color: var(--accent-secondary)" />
				</linearGradient>
			</defs>
			<g fill="url(#{gradId})">
				<circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
			</g>
		</svg>
	</button>

	<!-- Nabídka patří jen straně, která je zrovna vidět. Odvrácená strana je
	     otočená o 180°, takže by se její kopie zobrazila zrcadlově na druhé
	     straně karty (animace jí navíc dělá vlastní vrstvu, kterou skrytí
	     zadní plochy nechytí). -->
	{#if actionsOpen && (side === 'front' ? !flipped : flipped)}
		<div class="action-menu" role="menu">
			<button class="action-item" role="menuitem" onclick={() => { onShare?.(post); onCloseActions?.(); }}>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
					<line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
				</svg>
				Sdílet
			</button>
			<button class="action-item" role="menuitem" onclick={() => { onReport?.(post); onCloseActions?.(); }}>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M15.07 2.46A6.94 6.94 0 0 0 12 1.93c-5.52 0-10 3.58-10 8 0 1.77.63 3.4 1.7 4.73L2 22l7.78-3.55c1.68.47 3.46.72 5.3.7 5.53 0 10-3.58 10-8 0-1.1-.26-2.16-.74-3.12"/>
					<path d="M22 2l-4.5 4.5"/><path d="M17 2v4h4"/>
				</svg>
				Nahlásit problém
			</button>
			<div class="app-build-info">v{__APP_VERSION__} · build {__APP_BUILD_ID__}</div>
		</div>
	{/if}
{/snippet}

<!-- perspective drží 3D otočení; fokus i čtečka vidí vždy jen jednu stranu -->
<article
	class="post-card"
	class:flipped
	class:actions-open={actionsOpen}
	onkeydown={handleKeydown}
	onclick={handleCardClick}
>
	<div class="card-stage">
		<!-- LÍC -->
		<section
			id={frontId}
			class="card-face card-front"
			inert={flipped}
			aria-hidden={flipped}
			aria-labelledby="{frontId}-title"
		>
			<div class="front-inner">
				<div class="front-top">
					<CategoryBadge
						category={post.category}
						postId={post.id}
						onToggle={onCategoryToggle}
					/>
				</div>

				<div class="front-main">
					<h2 id="{frontId}-title" class="title">{post.title}</h2>
					<p class="teaser">{hook}</p>

					<!-- Dekorativní grafika do spodní části líce. Je v toku
					     flexu, takže nikdy nepřekryje text ani CTA a nemění
					     výšku karty — jen vyplní zbývající prostor. -->
					<div class="front-art" aria-hidden="true">
						<PostIllustration {post} />
					</div>
				</div>

				<div class="front-footer">
					<button
						bind:this={frontBtnEl}
						type="button"
						class="flip-btn"
						aria-controls={backId}
						aria-expanded={flipped}
						aria-label={`Otevřít celý text: ${post.title}`}
						onclick={flipToBack}
					>
						<span class="flip-btn-text">Přečíst celý text</span>
						<svg class="flip-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
							<path d="M21 3v5h-5" />
							<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
							<path d="M8 16H3v5" />
						</svg>
					</button>
				</div>
			</div>

			{@render actionControls('front')}
		</section>

		<!-- RUB -->
		<section
			id={backId}
			class="card-face card-back"
			inert={!flipped}
			aria-hidden={!flipped}
			aria-labelledby="{backId}-title"
		>
			<!-- Vlastní scrollovací plocha rubu. Na konci textu se scroll
			     přirozeně přelije do feedu — další gesto posune na další kartu. -->
			<div class="back-scroll" bind:this={backScrollEl} tabindex="0" aria-label={`Celý text: ${post.title}`} aria-keyshortcuts="Escape">
				<div class="back-inner">
					<div class="back-meta">
						<CategoryBadge
							category={post.category}
							postId={post.id}
							onToggle={onCategoryToggle}
						/>
					</div>
					<h2 id="{backId}-title" class="back-title">{post.title}</h2>
					<PostBody {post} />
				</div>
			</div>

			{@render actionControls('back')}
		</section>
	</div>

	<!-- Akce k tomuto příspěvku. Vykreslují se uvnitř každé strany karty
	     (viz actionControls v líci i rubu), takže se otáčejí spolu s ní
	     a působí jako její součást — na obou stranách ale existují vlastní
	     kopie, takže je tlačítko vidět vždy, na kteroukoli stranu se karta
	     otočí. -->
</article>

<style>
	.post-card {
		position: relative;
		/* Pevná výška z FeedView — nikdy se neřídí délkou obsahu */
		height: var(--card-height, 70dvh);
		width: 100%;
		max-width: 520px;
		margin: 0 auto;
		perspective: 1600px;
		/* Délka otočení na jednom místě — od ní se odvozuje i okamžik,
		   kdy má zmizet tlačítko akcí na odvrácené straně. */
		--flip-duration: 0.42s;
		-webkit-perspective: 1600px;
	}

	/* Otevřená nabídka musí být nad podkladem, který v FeedView zachytává
	   tapnutí mimo bublinu (z-index 60). */
	.post-card.actions-open {
		z-index: 65;
	}

	/* --- Akce k příspěvku --- */
	/* Sedí v pravém dolním rohu karty, ne fixně nad obsahem. Je součástí
	   otáčející se strany (každá strana má vlastní kopii), takže se kartou
	   otáčí a nikdy se neobjeví zrcadlově převrácené. */
	.action-btn {
		position: absolute;
		right: 16px;
		bottom: 16px;
		z-index: 4;
		width: 46px;
		height: 46px;
		border-radius: 50%;
		border: none;
		background: rgba(20, 20, 20, 0.85);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background 0.2s, transform 0.15s;
		-webkit-tap-highlight-color: transparent;
		/* Tlačítko musí zůstat součástí plochy strany: backdrop-filter by ho
		   vyčlenil do vlastní vrstvy, která na rubu prosvítá zrcadlově
		   (skrývání zadní strany rodiče ji totiž nechytí). Ostatně pod ním
		   je neprůhledná karta, takže blur nebylo vůbec vidět. */
		-webkit-backface-visibility: hidden;
		backface-visibility: hidden;
	}

	/* Gradientový obrys — stejný přechod jako u CTA a loga. Kreslí se přes
	   masku, aby zůstalo jen 1px ohraničení a průhledné pozadí tlačítka. */
	.action-btn::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		padding: 1px;
		background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
		-webkit-mask:
			linear-gradient(#000 0 0) content-box,
			linear-gradient(#000 0 0);
		-webkit-mask-composite: xor;
		mask:
			linear-gradient(#000 0 0) content-box,
			linear-gradient(#000 0 0);
		mask-composite: exclude;
		pointer-events: none;
	}

	/* Pojistka pro prohlížeče, které vrstvu tlačítka neflattenují do plochy
	   strany: tlačítko odvrácené strany zmizí ve chvíli, kdy se karta otáčí
	   hranou — tedy zhruba ve čtvrtině easingové křivky, ne až po otočení.
	   Do té doby se viditelně otáčí s kartou. */
	.post-card.flipped .card-front .action-btn,
	.post-card:not(.flipped) .card-back .action-btn {
		visibility: hidden;
		transition: background 0.2s, transform 0.15s,
			visibility 0s linear calc(var(--flip-duration) * 0.22);
	}

	.action-btn:hover {
		background: rgba(245, 158, 11, 0.14);
	}

	.action-btn:active {
		transform: scale(0.9);
		background: var(--accent);
	}

	/* Nabídka vyrůstá z tlačítka v rohu, proto je absolutní vůči straně
	   karty a otáčí se spolu s ní. */
	.action-menu {
		position: absolute;
		right: 16px;
		bottom: 70px;
		z-index: 70;
		background: rgba(24, 24, 24, 0.95);
		border: 1px solid #333;
		border-radius: 14px;
		padding: 6px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 160px;
		animation: menuIn 0.2s ease-out;
		/* Stejná pojistka jako u tlačítka: animace (transform/opacity) dělá
		   z nabídky vlastní vrstvu, kterou skrytí zadní plochy strany nechytí. */
		-webkit-backface-visibility: hidden;
		backface-visibility: hidden;
	}

	@keyframes menuIn {
		from { opacity: 0; transform: translateY(8px) scale(0.95); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}

	.action-item {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 10px 14px;
		border: none;
		background: transparent;
		color: var(--text-muted);
		font-family: inherit;
		font-size: 0.85rem;
		cursor: pointer;
		border-radius: 10px;
		transition: background 0.15s, color 0.15s;
		white-space: nowrap;
	}

	.action-item:hover {
		background: rgba(255, 255, 255, 0.06);
		color: var(--text);
	}

	.action-item:active {
		background: var(--accent);
		color: var(--bg);
	}

	.app-build-info {
		padding: 7px 10px 4px;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		color: #666;
		font-size: 0.62rem;
		letter-spacing: 0.03em;
		text-align: center;
		white-space: nowrap;
	}

	.card-stage {
		position: relative;
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
		transition: transform var(--flip-duration) cubic-bezier(0.2, 0.75, 0.25, 1);
	}

	.post-card.flipped .card-stage {
		transform: rotateY(180deg);
	}

	.card-face {
		position: absolute;
		cursor: pointer;
		inset: 0;
		display: flex;
		flex-direction: column;
		min-height: 0;
		overflow: hidden;
		background: #101010;
		background: linear-gradient(180deg, #141414 0%, #0d0d0d 100%);
		border: 1px solid #262626;
		border-radius: 22px;
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
		-webkit-backface-visibility: hidden;
		backface-visibility: hidden;
	}

	.card-back {
		transform: rotateY(180deg);
	}

	/* Skrytá strana nesmí chytat tapnutí ani myš */
	.post-card.flipped .card-front,
	.post-card:not(.flipped) .card-back {
		pointer-events: none;
	}

	/* --- Líc --- */
	.front-inner {
		display: flex;
		flex-direction: column;
		gap: 14px;
		height: 100%;
		min-height: 0;
		/* Spodní odsazení je stejné jako odsazení tlačítka akcí (16px), aby
		   obě tlačítka seděla na stejné lince. */
		padding: clamp(18px, 3.4vh, 28px) clamp(18px, 5vw, 30px) 16px;
	}

	.front-top {
		flex: none;
		display: flex;
		align-items: center;
		min-height: 26px;
	}

	/* Hook i titulek jsou omezené počtem řádků — dlouhý text nikdy
	   neroztáhne kartu ani nepřekryje CTA. */
	.front-main {
		flex: 1 1 auto;
		min-height: 0;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		/* Titulek s hookem sedí v horní části karty, ne uprostřed */
		justify-content: flex-start;
		padding-top: clamp(20px, 5vh, 44px);
		gap: 14px;
	}

	.title {
		font-size: clamp(1.15rem, 1.05rem + 0.7vw, 1.45rem);
		font-weight: 700;
		line-height: 1.3;
		color: var(--text);
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.teaser {
		font-size: 0.95rem;
		line-height: 1.68;
		color: var(--text-muted);
		display: -webkit-box;
		-webkit-line-clamp: 6;
		line-clamp: 6;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* Ilustrace vyplní jen zbývající spodní prostor líce. Když je text
	   dlouhý nebo karta nízká, SVG se zmenší — nikdy ale nezvětší kartu. */
	.front-art {
		flex: 1 1 auto;
		min-height: 0;
		margin-top: clamp(4px, 1.2vh, 12px);
		display: flex;
		align-items: flex-end;
		justify-content: center;
		overflow: hidden;
		opacity: 0.92;
	}

	.front-footer {
		flex: none;
		display: flex;
		align-items: center;
	}

	/* CTA zůstává textový odkaz, ne pill — drží vizuální jazyk feedu */
	.flip-btn {
		display: inline-flex;
		outline: none;
		align-items: center;
		gap: 9px;
		/* Stejná výška jako kruhové tlačítko akcí — středy obou tlačítek
		   tak leží v jedné ose. */
		min-height: 46px;
		padding: 8px 0;
		border: none;
		background: none;
		font-family: inherit;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.flip-btn-text {
		background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		color: var(--accent-secondary);
		line-height: 1.3;
		text-decoration: none;
	}

	.flip-icon {
		flex: none;
		color: var(--accent-secondary);
		opacity: 0.8;
		transition: transform 0.3s;
	}

	.flip-btn:hover .flip-icon {
		transform: rotate(180deg);
	}

	/* --- Rub --- */
	/* Rub scrolluje sám; po dojetí na konec textu se gesto přelije do feedu
	   a posune na další kartu. Tenký pás pod kartou zůstává pro scrollování
	   rovnou z rubu, takže o zpětný chod feedu není nouze. */
	.back-scroll {
		flex: 1;
		min-height: 0;
		outline: none;
		overflow-y: auto;
		overscroll-behavior-y: auto;
		touch-action: pan-y;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: thin;
		scrollbar-color: #333 transparent;
		/* Větší spodní odsazení, aby poslední řádky nezmizely pod tlačítkem
		   akcí v pravém dolním rohu karty */
		padding: clamp(16px, 2.8vh, 22px) clamp(18px, 5vw, 30px) clamp(56px, 7vh, 72px);
	}

	.back-inner {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.back-meta {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.back-title {
		font-size: 1.2rem;
		font-weight: 700;
		line-height: 1.3;
		color: var(--text);
	}

	/* Nízký viewport (např. mobil na šířku) — méně řádků, aby zůstalo
	   vidět CTA a karta nepůsobila přeplácaně */
	@media (max-height: 560px) {
		.front-inner {
			gap: 10px;
			padding-top: 20px;
			padding-bottom: 16px;
		}

		/* V nízké kartě stačí menší odsazení, aby se text neusekl */
		.front-main {
			padding-top: 12px;
		}

		.title {
			-webkit-line-clamp: 2;
			line-clamp: 2;
		}

		.teaser {
			-webkit-line-clamp: 3;
			line-clamp: 3;
		}

		/* Na nízkém viewportu je priorita text a CTA — grafika se schová,
		   místo aby text stlačila. */
		.front-art {
			display: none;
		}
	}

	/* Bez 3D animace, strana se jen okamžitě vymění */
	@media (prefers-reduced-motion: reduce) {
		.card-stage {
			transition: none;
		}

		/* Bez animace není co otáčet — tlačítko odvrácené strany zmizí hned */
		.post-card.flipped .card-front .action-btn,
		.post-card:not(.flipped) .card-back .action-btn {
			transition-delay: 0s;
		}

		.flip-btn:hover .flip-icon {
			transform: none;
		}
	}
</style>
