<script>
	/**
	 * Čtečka celého postu jako spodní sheet.
	 * Na mobilu zabírá 90 % zorného pole (článek, ne dialog), na větších
	 * displejích je vycentrovaný panel. Feed zůstává za ní nedotčený —
	 * sheet je překryv, takže se pozice scrollování ve feedu nemění.
	 * @type {{
	 *   post: {
	 *     id: string,
	 *     title: string,
	 *     content: string,
	 *     category: string,
	 *     sources: Array<{ label: string, url: string }>
	 *   },
	 *   onClose: () => void
	 * }}
	 */
	import PostBody from './PostBody.svelte';

	let { post, onClose } = $props();

	let sheetEl = $state(null);
	let scrollEl = $state(null);

	let entered = $state(false);      // úvodní vysunutí zdola
	let dragging = $state(false);     // prst/myš právě táhne sheet
	let dragY = $state(0);            // posun sheetu dolů v px
	let dismissing = $state(false);   // animovaný odjezd dolů
	let closed = false;

	// Posun sheetu: mimo dosah před vjezdem i při odjezdu, jinak podle tažení.
	let offset = $derived(dismissing || !entered ? '100%' : `${dragY}px`);

	// --- Gesto ---
	const DEAD_ZONE = 4;   // px, než se rozhodne směr gesta
	const SLOP = 0.25;     // podíl výšky sheetu, od kterého tažení zavírá
	const SLOP_MIN = 80;
	const SLOP_MAX = 200;
	const FLICK = 0.6;     // px/ms — rychlý švih dolů zavírá i na kratší vzdálenost
	const FLICK_MIN = 48;  // px, od kolika švih platí

	let gesture = null;
	let mouse = null;

	function sheetHeight() {
		return sheetEl?.getBoundingClientRect().height ?? 600;
	}

	function dismissThreshold() {
		return Math.min(Math.max(sheetHeight() * SLOP, SLOP_MIN), SLOP_MAX);
	}

	function release() {
		if (closed) return;
		closed = true;
		dismissing = true;
		setTimeout(onClose, 260);
	}

	/**
	 * Konec tažení: dost daleko (nebo rychlý švih) zavírá, jinak se sheet
	 * plynule vrátí na plnou pozici.
	 */
	function settle(moved, velocity) {
		dragging = false;
		if (moved >= dismissThreshold() || (velocity > FLICK && moved > FLICK_MIN)) release();
		else dragY = 0;
	}

	function onTouchStart(event) {
		if (closed || event.touches.length !== 1) {
			gesture = null;
			return;
		}
		const touch = event.touches[0];
		gesture = {
			startY: touch.clientY,
			lastY: touch.clientY,
			lastT: event.timeStamp,
			velocity: 0,
			// Rozhoduje stav na začátku gesta: kdo není na začátku článku,
			// ten tažením jen scrolluje.
			atTop: (scrollEl?.scrollTop ?? 0) <= 0,
			mode: null
		};
	}

	function onTouchMove(event) {
		if (!gesture) return;
		if (event.touches.length !== 1) {
			cancelGesture();
			return;
		}

		const y = event.touches[0].clientY;
		const dy = y - gesture.startY;

		if (!gesture.mode) {
			// Článek není nahoře → gesto patří scrollování obsahu
			if (!gesture.atTop) {
				gesture.mode = 'scroll';
				return;
			}
			if (Math.abs(dy) < DEAD_ZONE) return;
			// Nahoru → čtenář chce scrollovat článek, ne zavírat
			if (dy < 0) {
				gesture.mode = 'scroll';
				return;
			}
			gesture.mode = 'drag';
			dragging = true;
		}

		if (gesture.mode !== 'drag') return;

		// Teprve tady si bereme gesto pro sebe — do téhle chvíle platilo
		// nativní scrollování článku.
		event.preventDefault();

		const dt = event.timeStamp - gesture.lastT;
		if (dt > 0) gesture.velocity = (y - gesture.lastY) / dt;
		gesture.lastY = y;
		gesture.lastT = event.timeStamp;

		dragY = Math.max(0, dy);
	}

	function onTouchEnd() {
		if (!gesture) return;
		const moved = dragY;
		const velocity = gesture.velocity;
		const wasDrag = gesture.mode === 'drag';
		gesture = null;
		if (wasDrag) settle(moved, velocity);
	}

	function cancelGesture() {
		gesture = null;
		if (dragging) settle(0, 0);
	}

	// Myš na táhlu/liště — na desktopu je tažení pohodlnější než hledat křížek
	function onHeaderPointerDown(event) {
		if (closed || event.pointerType !== 'mouse' || event.button !== 0) return;
		if ((scrollEl?.scrollTop ?? 0) > 0) return;
		event.preventDefault();
		mouse = { startY: event.clientY, lastY: event.clientY, lastT: event.timeStamp, velocity: 0 };
		dragging = true;
		window.addEventListener('pointermove', onMouseMove);
		window.addEventListener('pointerup', onMouseUp);
	}

	function onMouseMove(event) {
		if (!mouse) return;
		const dt = event.timeStamp - mouse.lastT;
		if (dt > 0) mouse.velocity = (event.clientY - mouse.lastY) / dt;
		mouse.lastY = event.clientY;
		mouse.lastT = event.timeStamp;
		dragY = Math.max(0, event.clientY - mouse.startY);
	}

	function onMouseUp() {
		window.removeEventListener('pointermove', onMouseMove);
		window.removeEventListener('pointerup', onMouseUp);
		const moved = dragY;
		const velocity = mouse ? mouse.velocity : 0;
		mouse = null;
		settle(moved, velocity);
	}

	function handleKeydown(event) {
		if (event.key === 'Escape') release();
	}

	$effect(() => {
		const el = sheetEl;
		if (!el) return;
		el.addEventListener('touchstart', onTouchStart, { passive: true });
		el.addEventListener('touchmove', onTouchMove, { passive: false });
		el.addEventListener('touchend', onTouchEnd);
		el.addEventListener('touchcancel', cancelGesture);
		return () => {
			el.removeEventListener('touchstart', onTouchStart);
			el.removeEventListener('touchmove', onTouchMove);
			el.removeEventListener('touchend', onTouchEnd);
			el.removeEventListener('touchcancel', cancelGesture);
		};
	});

	// Vjezd: nejdřív se vykreslí posunutý sheet, pak se plynule vysune nahoru.
	// Dvě animační smyčky — jedna nestačí, změna by splynula s prvním
	// vykreslením a přechod by se vůbec nespustil.
	$effect(() => {
		let inner = 0;
		const outer = requestAnimationFrame(() => {
			inner = requestAnimationFrame(() => { entered = true; });
		});
		return () => {
			cancelAnimationFrame(outer);
			cancelAnimationFrame(inner);
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="sheet-root">
	<!-- Podklad přes celou obrazovku — tapnutí mimo panel čtečku zavře -->
	<button
		type="button"
		class="sheet-backdrop"
		tabindex="-1"
		aria-hidden="true"
		onclick={release}
	></button>

	<section
		bind:this={sheetEl}
		class="sheet"
		class:dragging
		style="transform: translateY({offset})"
		role="dialog"
		aria-modal="true"
		aria-label={post.title}
	>
		<div class="sheet-toolbar" onpointerdown={onHeaderPointerDown}>
			<span class="sheet-handle" aria-hidden="true"></span>
		</div>

		<div class="sheet-scroll" bind:this={scrollEl}>
			<article class="sheet-article">
				<h2 class="title">{post.title}</h2>
				<PostBody {post} />
			</article>
		</div>
	</section>
</div>

<style>
	.sheet-root {
		position: fixed;
		inset: 0;
		z-index: 400;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	/* Feed za čtečkou zůstává čitelný — díky tomu je vidět, že je pořád
	   pod ní otevřený. Silné ztmavení z něj dělalo další černou plochu
	   k nerozeznání od sheetu. */
	.sheet-backdrop {
		position: absolute;
		inset: 0;
		padding: 0;
		border: none;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(1.5px);
		cursor: default;
		-webkit-tap-highlight-color: transparent;
	}

	/* Mobil: 90 % zorného pole — pruh feedu nahoře dá najevo, že čtečka
	   je překryv a dá se odtud zavřít. Zbytek je pořád článek, ne dialog.
	   Plocha je o stupeň světlejší než pozadí a má zaoblenou horní hranu
	   s linkou a stínem — bez toho splývala s feedem do jedné černé. */
	.sheet {
		position: relative;
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 90vh;
		height: 90dvh;
		background: #101010;
		/* Stejná linka jako u ostatních plovoucích ploch (nabídka, panel
		   na desktopu) — drží jednotný jazyk vrstev */
		border-top: 1px solid #333;
		border-radius: 18px 18px 0 0;
		box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.85);
		overflow: hidden;
		will-change: transform;
		transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
	}

	/* Během tažení jde sheet přesně za prstem — žádná animace navíc */
	.sheet.dragging {
		transition: none;
		user-select: none;
	}

	/* Lišta s táhlem — drží se nad scrollovaným obsahem, je i místem
	   pro tažení myší na desktopu. Odsazení výřezu tu netřeba: horní hrana
	   sheetu je vždy až 10 % pod okrajem displeje. */
	.sheet-toolbar {
		flex: none;
		display: flex;
		justify-content: center;
		padding: 10px 0;
	}

	/* O stupeň světlejší než dřív — s linkou na horní hraně by táhlo
	   jinak zaniklo a je to hlavní úchop pro zavření tažením */
	.sheet-handle {
		width: 40px;
		height: 4px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.22);
	}

	/* Obsah se posouvá samostatně — přesah se nepřenáší na feed za sheetem */
	.sheet-scroll {
		flex: 1;
		overflow-y: auto;
		overscroll-behavior: contain;
		-webkit-overflow-scrolling: touch;
		padding:
			4px
			calc(20px + env(safe-area-inset-right, 0px))
			calc(28px + env(safe-area-inset-bottom, 0px))
			calc(20px + env(safe-area-inset-left, 0px));
	}

	.sheet-article {
		display: flex;
		flex-direction: column;
		gap: 16px;
		max-width: 500px;
		margin: 0 auto;
	}

	.title {
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1.35;
		color: var(--text);
	}

	/* Nainstalovaná appka (PWA) je bez lišty prohlížeče — čtečka bere 80 %,
	   takže je pruh feedu nad ní znatelnější. */
	@media (display-mode: standalone) {
		.sheet {
			height: 80vh;
			height: 80dvh;
		}
	}

	/* Na větších displejích vycentrovaný panel místo celé obrazovky */
	@media (min-width: 641px) {
		.sheet-root {
			align-items: center;
			padding: 32px 20px;
		}

		.sheet {
			width: min(560px, 100%);
			height: auto;
			max-height: 100%;
			border: 1px solid #333;
			border-radius: 18px;
			box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
		}

		.sheet-scroll {
			padding: 4px 24px 40px;
		}
	}
</style>
