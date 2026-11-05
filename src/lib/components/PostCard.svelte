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
	 *   active?: boolean,
	 *   onCategoryToggle?: ((slug: string, postId: string) => void) | null,
	 *   actionsOpen?: boolean,
	 *   onToggleActions?: (() => void) | null,
	 *   onCloseActions?: (() => void) | null,
	 *   onShare?: ((post: any) => void) | null,
	 *   reportUrl?: string | null
	 * }}
	 */
	import { tick } from 'svelte';
	import CategoryBadge from './CategoryBadge.svelte';
	import PostBody from './PostBody.svelte';
	import PostIllustration from './PostIllustration.svelte';
	import CardGlow from './CardGlow.svelte';
	import { getHook } from '$lib/teaser.js';
	import { shouldShowFlipHint, markCardFlipped } from '$lib/flipHint.js';

	let {
		post,
		active = true,
		onCategoryToggle = null,
		actionsOpen = false,
		onToggleActions = null,
		onCloseActions = null,
		onShare = null,
		reportUrl = null
	} = $props();

	let hook = $derived(getHook(post.content));

	// Stav otočení patří konkrétní kartě. Feed každou kartu klíčuje podle
	// post.id, takže se nikdy nezobrazí rub u jiného příspěvku.
	let flipped = $state(false);
	let flipHint = $state(false);
	let manualHint = $state(false);
	let lastPointerType = '';
	let hintRequest = 0;
	let cardStageEl;

	async function replayFlipHint() {
		const request = ++hintRequest;
		flipHint = false;
		manualHint = false;
		await tick();
		if (request !== hintRequest || !active || flipped) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		// Commit the removed animation before replaying it on another tap.
		if (cardStageEl) void cardStageEl.offsetWidth;
		manualHint = true;
		flipHint = true;
	}

	$effect(() => {
		if (!active || flipped) {
			flipHint = false;
			return;
		}
		const showHint = () => {
			manualHint = false;
			flipHint = shouldShowFlipHint()
				&& !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		};
		showHint();
		const interval = window.setInterval(showHint, 7000);
		return () => window.clearInterval(interval);
	});

	let frontBtnEl = $state(null);
	let backScrollEl = $state(null);

	const frontId = $derived(`post-front-${post.id}`);
	const backId = $derived(`post-back-${post.id}`);

	async function flipToBack() {
		if (flipped) return;
		// Preserve the visible angle when handing the preview over to the flip.
		const previewTransform = flipHint && cardStageEl
			? getComputedStyle(cardStageEl).transform : null;
		++hintRequest;
		markCardFlipped();
		flipHint = false;
		if (previewTransform) cardStageEl.style.transform = previewTransform;
		await tick();
		// Commit the end of the CSS animation before starting the transition.
		if (cardStageEl) void cardStageEl.offsetWidth;
		// Nabídka patří jedné straně — při otáčení by na rubu visela
		// zrcadlově, takže ji otočení zavře.
		onCloseActions?.();
		flipped = true;
		// Fokus přechází na viditelnou stranu — klávesnicí se tak hned dá
		// pokračovat ve čtení a skrytý líc nezůstane zaměřený.
		await tick();
		if (previewTransform) cardStageEl.style.removeProperty('transform');
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

	// Dotyk na líci přehraje náznak, ostatní kliknutí kartu otočí. Ovládací prvky (tlačítka, odkazy)
	// si klik řeší samy, stejně jako dokončený výběr textu.
	function handleCardPointerDown(event) {
		lastPointerType = event.pointerType;
		if (event.pointerType !== 'mouse' || event.button !== 0 || actionsOpen || flipped) return;
		if (!(event.target instanceof Element)) return;
		if (event.target.closest('a, button, input, textarea, select, label, summary')) return;
		replayFlipHint();
	}

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

		if (!flipped && lastPointerType === 'touch' && event.detail !== 0) {
			replayFlipHint();
			return;
		}
		if (flipped) flipToFront();
		else flipToBack();
	}
</script>

<!-- More options in the category row on each side of the card. -->
{#snippet actionControls(side)}
	<div class="more-controls">
		<button
			class="action-btn more-btn"
			type="button"
			aria-label="Další možnosti"
			aria-haspopup="menu"
			aria-expanded={actionsOpen}
			onclick={() => onToggleActions?.()}
		>
			<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
				<g fill="currentColor">
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
				<a class="action-item" role="menuitem" href="https://revolut.me/lukpgvgg" target="_blank" rel="noopener noreferrer" onclick={() => onCloseActions?.()}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
					</svg>
					Podpořit
				</a>
				<a class="action-item" role="menuitem" href={reportUrl} target="_blank" rel="noopener noreferrer">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M15.07 2.46A6.94 6.94 0 0 0 12 1.93c-5.52 0-10 3.58-10 8 0 1.77.63 3.4 1.7 4.73L2 22l7.78-3.55c1.68.47 3.46.72 5.3.7 5.53 0 10-3.58 10-8 0-1.1-.26-2.16-.74-3.12"/>
						<path d="M22 2l-4.5 4.5"/><path d="M17 2v4h4"/>
					</svg>
					Nahlásit problém
				</a>
				<div class="app-build-info">v{__APP_VERSION__} · build {__APP_BUILD_ID__}</div>
			</div>
		{/if}
	</div>
{/snippet}

{#snippet shareControl(side)}
	{@const gradientId = `share-gradient-${post.id}-${side}`}
	<button class="action-btn share-btn" type="button" aria-label="Sdílet" onclick={() => { onShare?.(post); onCloseActions?.(); }}>
		<svg class="share-ring" width="42" height="42" viewBox="0 0 42 42" fill="none" aria-hidden="true">
			<circle cx="21" cy="21" r="19.5" stroke="currentColor" stroke-width="1" />
		</svg>
		<svg width="22" height="22" viewBox="0 0 24 24" fill="url(#{gradientId})" aria-hidden="true">
			<defs>
				<linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" style="stop-color: var(--accent)" />
					<stop offset="100%" style="stop-color: var(--accent-secondary)" />
				</linearGradient>
			</defs>
			<path d="M14 3v5C6.5 8 3 12.5 2 20c2.5-4.5 6-6 12-6v5l8-8-8-8Z" />
		</svg>
	</button>
{/snippet}

<!-- perspective drží 3D otočení; fokus i čtečka vidí vždy jen jednu stranu -->
<article
	class="post-card"
	class:flipped
	class:flip-hint={flipHint}
	class:manual-hint={manualHint}
	class:is-active={active}
	onpointerdown={handleCardPointerDown}
	onkeydown={handleKeydown}
	onclick={handleCardClick}
>
	<div class="card-stage" bind:this={cardStageEl} onanimationend={() => { flipHint = false; }}>
		<!-- LÍC -->
		<section
			id={frontId}
			class="card-face card-front"
			inert={flipped}
			aria-hidden={flipped}
			aria-labelledby="{frontId}-title"
		>
			<CardGlow {post} />
			<div class="front-inner">
				<div class="front-main">
					<div class="front-top">
						<CategoryBadge
							category={post.category}
							postId={post.id}
							onToggle={onCategoryToggle}
						/>
						{@render actionControls('front')}
					</div>
					<h2 id="{frontId}-title" class="title">{post.title}</h2>
					<div class="front-art" aria-hidden="true">
						<PostIllustration {post} {active} />
					</div>
					<p class="teaser">{hook}</p>
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
						<svg class="flip-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="m15.194 13.707 3.814 1.86-1.86 3.814" />
							<path d="M16.47214 7.52786 A 5 10 0 1 0 13 21.79796" />
							<path d="M21.79796 11 A 10 5 0 1 0 19 15.57071" />
						</svg>
						<span class="flip-btn-text">Otočit a číst</span>
					</button>
				</div>
			</div>

			{@render shareControl('front')}
		</section>

		<!-- RUB -->
		<section
			id={backId}
			class="card-face card-back"
			inert={!flipped}
			aria-hidden={!flipped}
			aria-labelledby="{backId}-title"
		>
			<CardGlow {post} />
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
						{@render actionControls('back')}
					</div>
					<h2 id="{backId}-title" class="back-title">{post.title}</h2>
					<PostBody {post} />
				</div>
			</div>

			{@render shareControl('back')}
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
		--card-action-inset: clamp(18px, 5vw, 30px);
		--card-meta-top: var(--card-action-inset);
		-webkit-perspective: 1600px;
	}

	/* --- Akce k příspěvku --- */
	/* Sedí v pravém dolním rohu karty, ne fixně nad obsahem. Je součástí
	   otáčející se strany (každá strana má vlastní kopii), takže se kartou
	   otáčí a nikdy se neobjeví zrcadlově převrácené. */
	.action-btn {
		position: absolute;
		right: var(--card-action-inset);
		bottom: 16px;
		z-index: 4;
		width: 46px;
		height: 46px;
		border-radius: 50%;
		border: 1px solid var(--accent);
		color: var(--accent);
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


	/* Pojistka pro prohlížeče, které vrstvu tlačítka neflattenují do plochy
	   strany: tlačítko odvrácené strany zmizí ve chvíli, kdy se karta otáčí
	   hranou — tedy zhruba ve čtvrtině easingové křivky, ne až po otočení.
	   Do té doby se viditelně otáčí s kartou. */
	.post-card.flipped .card-front .action-btn,
	.post-card:not(.flipped) .card-back .action-btn {
		visibility: hidden;
		transition: background 0.2s, transform 0.15s,
			visibility 0s linear calc(var(--flip-duration) * 0.16);
	}

	/* Tlačítko patří jen kartě, na které uživatel právě stojí. Karta nad ní
	   prosvítá pod průhledným spodkem hlavičky jen jako náznak, že ve feedu
	   je další — a nesmí u sebe mít vlastní akce. */
	.post-card:not(.is-active) .action-btn {
		visibility: hidden;
	}

	.action-btn:hover {
		background: rgba(194, 65, 12, 0.14);
	}

	.action-btn:active {
		transform: scale(0.9);
		background: rgba(194, 65, 12, 0.24);
	}

	.share-btn {
		bottom: var(--card-action-inset);
		width: 42px;
		height: 42px;
		appearance: none;
		border: none;
	}

	.share-ring {
		position: absolute;
		inset: 0;
		pointer-events: none;
		/* Celý tah i vyhlazení mají rezervu uvnitř SVG viewportu.
		   Při změně zoomu ani 3D transformaci se tak neopírají o jeho okraj. */
	}

	.more-controls {
		position: relative;
		margin-left: auto;
		flex: 0 0 44px;
		height: 26px;
		z-index: 5;
	}

	.more-btn {
		right: -9px;
		top: -9px;
		bottom: auto;
		width: 44px;
		height: 44px;
		border: none;
		border-radius: 0;
		color: var(--text-muted);
		background: transparent;
	}

	.more-btn:hover,
	.more-btn:active {
		color: var(--text);
		background: transparent;
	}

	.action-menu {
		position: absolute;
		right: 0;
		top: 32px;
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
		from { opacity: 0; transform: translateY(-8px) scale(0.95); }
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

	.post-card.flip-hint:not(.flipped) .card-stage {
		animation: flip-preview 1.2s ease-in-out 0.5s;
	}

	.post-card.flip-hint.manual-hint:not(.flipped) .card-stage {
		--flip-preview-angle: 40deg;
		animation-delay: 0s;
	}

	@keyframes flip-preview {
		0%, 100% { transform: rotateY(0deg); }
		45% { transform: rotateY(var(--flip-preview-angle, 20deg)); }
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
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 14px;
		height: 100%;
		min-height: 0;
		/* Spodní odsazení je stejné jako odsazení tlačítka sdílení, aby
		   obě tlačítka seděla na stejné lince. */
		padding: var(--card-meta-top) var(--card-action-inset) var(--card-action-inset);
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
		overflow: visible;
		display: flex;
		flex-direction: column;
		/* Titulek s hookem sedí v horní části karty, ne uprostřed */
		justify-content: flex-start;
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
		/* Text se nikdy nesmršťuje — jinak by ho při dlouhém hooku
		   ukrojila flexová kolize s ilustrací. Veškeré smrštění řeší
		   až .front-art, který jako jediný smí na výšku ustoupit. */
		flex: 0 0 auto;
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
		/* Stejně jako titulek: hook dostane celou svou výšku a nikdy
		   nezmizí pod ilustrací. */
		flex: 0 0 auto;
	}

	/* Illustration sits between title and hook; spare space stays below the hook. */
	.front-art {
		position: relative;
		flex: 0 1 auto;
		width: 100%;
		aspect-ratio: 16 / 9;
		min-height: 0;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		overflow: visible;
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
		gap: 6px;
		/* Stejná výška jako kruhové tlačítko akcí — středy obou tlačítek
		   tak leží v jedné ose. */
		min-height: 42px;
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
		font-size: 1.12rem;
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
		stroke-width: 2.2;
		width: 1em;
		height: 1em;
		position: relative;
		top: 1px;
		color: var(--accent);
		opacity: 0.8;
		transition: transform 0.3s;
	}

	.flip-btn:hover .flip-icon {
		transform: rotateY(180deg);
	}

	/* --- Rub --- */
	/* Rub scrolluje sám; po dojetí na konec textu se gesto přelije do feedu
	   a posune na další kartu. Tenký pás pod kartou zůstává pro scrollování
	   rovnou z rubu, takže o zpětný chod feedu není nouze. */
	.back-scroll {
		position: relative;
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
		padding: var(--card-meta-top) var(--card-action-inset) clamp(56px, 7vh, 72px);
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
		}

		.title {
			-webkit-line-clamp: 2;
			line-clamp: 2;
		}

		.teaser {
			-webkit-line-clamp: 3;
			line-clamp: 3;
		}

	}

	/* Bez 3D animace, strana se jen okamžitě vymění */
	@media (prefers-reduced-motion: reduce) {
		.card-stage {
			transition: none;
		}

		.post-card.flip-hint .card-stage {
			animation: none;
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
