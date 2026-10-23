<script>
	/**
	 * Vývojová galerie ilustrací.
	 *
	 * Není součástí feedu — slouží k vizuální kontrole všech scén, motivů
	 * a palet na skutečném tmavém pozadí karty. Vše se generuje stejným
	 * rendererem jako ve feedu.
	 */
	import PostIllustration from '$lib/components/PostIllustration.svelte';
	import {
		COMPOSITION_KEYS,
		COMPOSITION_META,
		DEFAULT_SUBJECT,
		GEOMETRIC_FAMILY_KEYS,
		HERO_KEYS,
		SCENE_TYPES,
		SUBJECT_BY_KEY,
		createGeometricIllustration,
		explainSelection,
		validateElements
	} from '$lib/illustrations/index.js';
	import { PROTOTYPE_CASES } from './prototype-cases.js';

	// Popisky sedmi geometrických kompozic.
	const SCENE_META = {
		portrait: { label: 'Portrét', note: 'osobnosti, filozofie, psychologie' },
		discovery: { label: 'Objev', note: 'věda, fyzika, astronomie' },
		storybook: { label: 'Příběh', note: 'literatura, filmy' },
		relic: { label: 'Artefakt', note: 'historie, politika, právo' },
		metaphor: { label: 'Metafora', note: 'matematika, ekonomie, umění, počítače' },
		nature: { label: 'Příroda', note: 'zajímavosti, biologie, krajina' },
		layers: { label: 'Vrstvy', note: 'abstraktní texty, chronologie, geologie' }
	};

	// Kategorie, ze které scéna bere paletu — drží galerii blízko reality.
	const SCENE_CATEGORY = {
		portrait: 'filozofie',
		discovery: 'veda',
		storybook: 'literatura',
		relic: 'historie',
		metaphor: 'matematika',
		nature: 'zajimavost',
		layers: 'veda'
	};

	const HERO_LABELS = {
		heelix: 'Helix',
		helix: 'Šroubovice',
		dna: 'DNA',
		comet: 'Kometa',
		galaxy: 'Galaxie',
		rocket: 'Raketa',
		wall: 'Zeď',
		bird: 'Pták',
		entropy: 'Entropie',
		blackhole: 'Černá díra',
		stele: 'Stélé',
		knot: 'Uzel'
	};
	const heroLabel = (key) => SUBJECT_BY_KEY[key]?.label ?? HERO_LABELS[key] ?? key;

	// Sémantické scény: ukázka každého typu s typickým předmětem a doplňkem.
	// Nejde o nová pravidla — jen o ruční vstup do stejného rendereru, který
	// scénu jinak vybírá z textu (`selection.js`).
	const SEMANTIC_DEMO = {
		bookFire: { family: 'relic', category: 'historie', subject: 'library', secondary: 'flame' },
		timeFigure: { family: 'portrait', category: 'filozofie', subject: 'figure', secondary: 'clock' },
		writing: { family: 'relic', category: 'historie', subject: 'script', secondary: 'ship' },
		disruption: { family: 'metaphor', category: 'ekonomie', subject: 'machine', secondary: 'ruin' },
		solarSystem: { family: 'discovery', category: 'astronomie', subject: 'sun', secondary: 'planet' },
		voyage: { family: 'discovery', category: 'historie', subject: 'ship', secondary: 'compass' },
		mechanism: { family: 'metaphor', category: 'ekonomie', subject: 'machine', secondary: 'gear' },
		laboratory: { family: 'discovery', category: 'veda', subject: 'flask', secondary: 'microscope' },
		theatre: { family: 'portrait', category: 'filmy', subject: 'mask', secondary: 'film' },
		mapScene: { family: 'discovery', category: 'historie', subject: 'map', secondary: 'compass' },
		labyrinth: { family: 'metaphor', category: 'filozofie', subject: 'labyrinth', secondary: 'key' },
		metamorphosis: { family: 'nature', category: 'zajimavost', subject: 'butterfly', secondary: 'cocoon' },
		seedGrowth: { family: 'nature', category: 'zajimavost', subject: 'sprout', secondary: 'tree' },
		procession: { family: 'portrait', category: 'historie', subject: 'crowd', secondary: 'torch' },
		siege: { family: 'relic', category: 'historie', subject: 'castle', secondary: 'shield' },
		monument: { family: 'relic', category: 'historie', subject: 'tower', secondary: 'figure' },
		ritual: { family: 'relic', category: 'historie', subject: 'candle', secondary: 'temple' },
		weave: { family: 'relic', category: 'historie', subject: 'loom', secondary: 'thread' },
		measurement: { family: 'discovery', category: 'veda', subject: 'compass', secondary: 'clock' },
		orbitCycle: { family: 'discovery', category: 'astronomie', subject: 'cycle', secondary: 'hourglass' },
		observatory: { family: 'discovery', category: 'astronomie', subject: 'telescope', secondary: 'star' },
		celestial: { family: 'discovery', category: 'astronomie', subject: 'sun', secondary: null },
		mirrorScene: { family: 'discovery', category: 'fyzika', subject: 'mirror', secondary: 'hand' },
		parable: { family: 'storybook', category: 'filozofie', subject: 'elephant', secondary: 'hand' },
		codex: { family: 'relic', category: 'historie', subject: 'column', secondary: 'scroll' },
		response: { family: 'metaphor', category: 'ekonomie', subject: 'crowd', secondary: null },
		digits: { family: 'metaphor', category: 'matematika', subject: 'numeralOne', secondary: null },
		crash: { family: 'metaphor', category: 'ekonomie', subject: 'chart', secondary: null },
		compression: { family: 'metaphor', category: 'pocitacove-vedy', subject: 'polyhedron', secondary: null },
		spacecraft: { family: 'discovery', category: 'filmy', subject: 'rocket', secondary: null },
		artificial: { family: 'metaphor', category: 'pocitacove-vedy', subject: 'machine', secondary: null },
		taxi: { family: 'metaphor', category: 'matematika', subject: 'car', secondary: null },
		alchemy: { family: 'discovery', category: 'veda', subject: 'flask', secondary: null },
		waveform: { family: 'discovery', category: 'fyzika', subject: 'cycle', secondary: null },
		cosmicMusic: { family: 'discovery', category: 'filozofie', subject: 'planet', secondary: null },
		threeDoors: { family: 'metaphor', category: 'matematika', subject: 'car', secondary: null },
		division: { family: 'portrait', category: 'psychologie', subject: 'figure', secondary: null },
		atomIdea: { family: 'discovery', category: 'filozofie', subject: 'atom', secondary: null },
		calendar: { family: 'relic', category: 'historie', subject: 'cycle', secondary: null },
		powers: { family: 'metaphor', category: 'matematika', subject: 'numeralOne', secondary: 'numeralTwo' },
		justice: { family: 'metaphor', category: 'politika', subject: 'balance', secondary: null },
		peaceFaith: { family: 'relic', category: 'politika', subject: 'bird', secondary: null },
		bacteria: { family: 'discovery', category: 'veda', subject: 'bacterium', secondary: null },
		circleSquare: { family: 'metaphor', category: 'umeni', subject: 'figure', secondary: null },
		inflation: { family: 'metaphor', category: 'ekonomie', subject: 'balance', secondary: null },
		decipherment: { family: 'relic', category: 'historie', subject: 'stele', secondary: null },
		networkScene: { family: 'metaphor', category: 'pocitacove-vedy', subject: 'machine', secondary: null },
		ballot: { family: 'relic', category: 'politika', subject: 'crowd', secondary: null }
	};

	const SEEDS = ['eden', 'dva', 'tri'];

	// Všech 62 typů scén: sedm rodin, osm kompozic a 48 sémantických scén.
	const SEMANTIC_GALLERY = SCENE_TYPES.filter((type) => type.group === 'semantic').map((type) => {
		const demo = SEMANTIC_DEMO[type.key] ?? {};
		return {
			...type,
			spec: createGeometricIllustration({
				scene: type.key,
				family: demo.family ?? 'metaphor',
				category: demo.category ?? 'zajimavost',
				subject: demo.subject ?? null,
				secondary: demo.secondary ?? null,
				seed: `scene:${type.key}`,
				composition: 'single'
			})
		};
	});

	const gallery = GEOMETRIC_FAMILY_KEYS.map((key) => ({
		key,
		...SCENE_META[key],
		items: SEEDS.map((seed) => {
			const spec = createGeometricIllustration({
				family: key,
				seed: `${key}:${seed}`,
				category: SCENE_CATEGORY[key]
			});
			return { seed, spec, valid: validateElements(spec.elements).ok };
		})
	}));

	// Osm kompozičních vzorů na stejném motivu — jde vidět, co dělá vztah objektů.
	const COMPOSITION_GALLERY = COMPOSITION_KEYS.map((key) => ({
		key,
		...COMPOSITION_META[key],
		spec: createGeometricIllustration({
			family: 'metaphor',
			subject: 'crown',
			composition: key,
			category: 'politika',
			seed: `composition:${key}`
		})
	}));

	// --- Interaktivní laboratoř ---
	let family = $state('portrait');
	let subject = $state(DEFAULT_SUBJECT.portrait);
	let variant = $state(0);
	let density = $state(0.7);
	let scale = $state(1);
	let balance = $state(0);
	let composition = $state('auto');

	// Po změně scény se předmět srovná na její výchozí motiv.
	$effect(() => {
		const fallback = DEFAULT_SUBJECT[family];
		if (fallback) subject = fallback;
	});

	let labSpec = $derived(
		createGeometricIllustration({
			family,
			seed: `lab:${family}:${subject}:${variant}:${density}:${scale}:${balance}`,
			category: SCENE_CATEGORY[family] ?? 'zajimavost',
			subject,
			variant,
			density,
			scale,
			balance,
			composition: composition === 'auto' ? undefined : composition
		})
	);

	let usage = $derived(
		gallery.reduce(
			(sum, scene) => sum + scene.items.reduce((count, item) => count + item.spec.elements.length, 0),
			0
		)
	);

	// Skutečné příspěvky — ukazují, že rozhoduje text, ne jen kategorie.
	const REAL_CASES = [
		{
			id: '864',
			title: 'Proč jsou Grimmové víc než sběratelé pohádek',
			category: 'literatura',
			content:
				'<p>Bratři Jacob a Wilhelm Grimmovi vydali v letech 1812 až 1815 sbírku Dětské a domácí pohádky.</p><p>Pohádky jako O Červené karkulce a vlkovi vycházejí z lidového vypravování.</p>'
		},
		{
			id: '027',
			title: 'Sokrates: vím, že nic nevím, a proto jsem nejmoudřejší z Athéňanů',
			category: 'filozofie',
			content: '<p>Aténský filozof Sokrates nepsal knihy. Učil dialogy na náměstí a zpochybňoval jistoty.</p>'
		},
		{
			id: '051',
			title: 'Milgramův experiment: jak snadno uposlechneme rozkaz ubližovat',
			category: 'psychologie',
			content: '<p>Psycholog Stanley Milgram v roce 1961 na Yaleově univerzitě zkoumal poslušnost autoritě.</p>'
		},
		{
			id: '059',
			title: 'Gutenberg a vynález, který rozmnožil knihy jako nikdy dřív',
			category: 'historie',
			content: '<p>Johannes Gutenberg v Mohuči kolem roku 1450 sestavil knihtisk. Knihy se už nemusely přepisovat ručně.</p>'
		},
		{
			id: '062',
			title: 'Entropie: proč se rozbité vejce nikdy nesloží zpátky',
			category: 'fyzika',
			content: '<p>Druhý zákon termodynamiky popisuje neuspořádanost a šipku času.</p>'
		},
		{
			id: '152',
			title: 'Chobotnice mají tři srdce a modrou krev',
			category: 'zajimavost',
			content: '<p>Chobotnice mají tři srdce a modrou krev. Žijí v moři a patří mezi hlavonožce.</p>'
		}
	].map((item) => {
		const spec = createGeometricIllustration({ post: item });
		return { ...item, spec, explanation: explainSelection(item) };
	});

	// --- Prototyp na skutečných příspěvcích ---
	const prototype = PROTOTYPE_CASES.map((item) => {
		const geometric = createGeometricIllustration({
			post: item,
			family: item.family,
			subject: item.subject
		});
		return {
			...item,
			geometric,
			valid: validateElements(geometric.elements).ok
		};
	});
</script>

<svelte:head>
	<title>Ilustrace — vývojová galerie</title>
</svelte:head>

<div class="dev-page">
	<header class="dev-header">
		<p class="eyebrow">faakt.io · vývoj</p>
		<h1>Ilustrační systém</h1>
		<p class="lede">
			Sedm rodin, {HERO_KEYS.length} motivů, {SCENE_TYPES.length} typů scén a deterministické
			varianty. Žádné externí assety. Všechno níže je stejná komponenta, která se vykresluje
			v kartách feedu.
		</p>
		<p class="note">
			{usage} prvků ve scénách · viewBox 320 × 180 · seed = ID příspěvku
		</p>
	</header>

	<section class="prototype" aria-labelledby="prototype-title">
		<div class="prototype-head">
			<div>
				<h2 id="prototype-title">Prototyp: geometrické ilustrace</h2>
				<p class="section-note">
					Čtrnáct skutečných příspěvků. Tmavé plochy, průhledné pozadí a barva kategorie
					jako akcent. Přepínač porovná stejné příspěvky s původním stylem.
				</p>
			</div>
		</div>

		<div class="prototype-grid">
			{#each prototype as item}
				<article class="prototype-card">
					<div class="prototype-label">
						<span class="family-chip">{item.family}</span>
						<span>ID {item.id} · {item.category}</span>
					</div>

					<div class="prototype-art">
						<figure class="tile">
							<div class="card-surface">
								<div class="card-art">
									<PostIllustration spec={item.geometric} />
								</div>
							</div>
						</figure>
					</div>

					<p class="real-title">{item.title}</p>
					<figcaption>
						{item.geometric.subject ?? 'krajinný řez'}
						{#if !item.valid}<span class="invalid">neplatná scéna</span>{/if}
					</figcaption>
				</article>
			{/each}
		</div>
	</section>

	<section class="lab" aria-labelledby="lab-title">
		<div class="lab-preview">
			<div class="card-surface">
				<div class="card-badge">Interaktivní náhled</div>
				<div class="card-art">
					<PostIllustration spec={labSpec} />
				</div>
			</div>
		</div>

		<div class="lab-controls">
			<h2 id="lab-title">Laboratoř</h2>

			<label class="control">
				<span>Scéna</span>
				<select bind:value={family}>
					{#each gallery as scene}
						<option value={scene.key}>{scene.label}</option>
					{/each}
				</select>
			</label>

			<label class="control">
				<span>Předmět</span>
				<select bind:value={subject} disabled={family === 'layers'}>
					{#each HERO_KEYS as key}
						<option value={key}>{heroLabel(key)}</option>
					{/each}
				</select>
			</label>

			<label class="control">
				<span>Varianta <code>{variant}</code></span>
				<input type="range" min="0" max="2" step="1" bind:value={variant} />
			</label>

			<label class="control">
				<span>Hustota <code>{density.toFixed(2)}</code></span>
				<input type="range" min="0.35" max="1" step="0.01" bind:value={density} />
			</label>

			<label class="control">
				<span>Měřítko <code>{scale.toFixed(2)}</code></span>
				<input type="range" min="0.9" max="1.1" step="0.01" bind:value={scale} />
			</label>

			<label class="control">
				<span>Rovnováha <code>{balance.toFixed(2)}</code></span>
				<input type="range" min="-1" max="1" step="0.01" bind:value={balance} />
			</label>

			<label class="control">
				<span>Kompozice</span>
				<select bind:value={composition}>
					<option value="auto">auto podle textu</option>
					{#each COMPOSITION_KEYS as key}
						<option value={key}>{COMPOSITION_META[key].label}</option>
					{/each}
				</select>
			</label>

			<p class="readout">
				{labSpec.family} · {labSpec.subject ?? 'krajinný řez'} · {labSpec.composition}
				{#if labSpec.secondary} + {labSpec.secondary}{/if}
				· {labSpec.elements.length} prvků · seed {labSpec.seedHash}
			</p>
		</div>
	</section>

	<section class="families" aria-labelledby="families-title">
		<h2 id="families-title">Sedm rodinných scén</h2>
		<p class="section-note">
			Každá scéna se třemi seedy. Výchozí předměty ukazují, co kompozice
			obvykle nese; konkrétní motiv se mění podle textu příspěvku, ne jen podle kategorie.
		</p>

		<div class="grid">
			{#each gallery as family}
				<article class="family">
					<div class="family-head">
						<h3>{family.label}</h3>
						<p>{family.note}</p>
					</div>
					<div class="family-art">
						{#each family.items as item}
							<figure class="tile">
								<div class="card-surface">
									<div class="card-art">
										<PostIllustration spec={item.spec} />
									</div>
								</div>
								<figcaption>
									seed {item.seed} · v{item.spec.variant} · d{item.spec.density}
									{#if !item.valid}<span class="invalid">neplatná scéna</span>{/if}
								</figcaption>
							</figure>
						{/each}
					</div>
				</article>
			{/each}
		</div>
	</section>

	<section class="real" aria-labelledby="real-title">
		<h2 id="real-title">Skutečné příspěvky</h2>
		<p class="section-note">
			Titulky a obsah rozhodují o předmětu. Pohádky končí jako příběh, filozof
			jako portrét, kámen s hieroglyfy jako artefakt — i když kategorie samotná
			nabízí jinou výchozí rodinu.
		</p>

		<div class="grid small">
			{#each REAL_CASES as item}
				<figure class="tile real-tile">
					<div class="card-surface">
						<div class="card-badge">{item.category}</div>
						<div class="card-art">
							<PostIllustration spec={item.spec} />
						</div>
					</div>
					<figcaption>
						<strong>{item.explanation.subjectLabel ?? item.spec.family}</strong>
						· {item.explanation.family}
						· scéna {item.spec.scene}
						{#if item.explanation.supportLabels.length}
							+ {item.explanation.supportLabels.join(', ')}
						{/if}
					</figcaption>
					<p class="real-title">{item.title}</p>
				</figure>
			{/each}
		</div>
	</section>

	<section class="compositions" aria-labelledby="semantic-title">
		<h2 id="semantic-title">Sémantické scény</h2>
		<p class="section-note">
			{SEMANTIC_GALLERY.length} scén, které nevznikají z kategorie,
			ale z významu textu: požár knihovny, člověk a hodiny, písmo s lodí, stroj místo
			zříceniny. Každá má vlastní vztah objektů a vlastní pravidlo v <code>selection.js</code>.
		</p>
		<div class="grid small">
			{#each SEMANTIC_GALLERY as item}
				<figure class="tile">
					<div class="card-surface">
						<div class="card-badge">sémantická</div>
						<div class="card-art">
							<PostIllustration spec={item.spec} />
						</div>
					</div>
					<figcaption><strong>{item.label}</strong> · {item.note}</figcaption>
				</figure>
			{/each}
		</div>
	</section>

	<section class="compositions" aria-labelledby="compositions-title">
		<h2 id="compositions-title">Kompoziční vzory</h2>
		<p class="section-note">
			Stejná koruna v osmi vzorech. Vzor neříká, co je na scéně — to určuje motiv —
			ale co se s objektem děje: dělí se, stojí proti sobě, mění se, roste nebo se hroutí.
			V produkci se vzor vybírá z textu, ne ručně.
		</p>
		<div class="grid small">
			{#each COMPOSITION_GALLERY as item}
				<figure class="tile">
					<div class="card-surface">
						<div class="card-art">
							<PostIllustration spec={item.spec} />
						</div>
					</div>
					<figcaption><strong>{item.label}</strong> · {item.note}</figcaption>
				</figure>
			{/each}
		</div>
	</section>

	<section class="palettes" aria-labelledby="palettes-title">
		<h2 id="palettes-title">Palety a hustota</h2>
		<p class="section-note">
			Stejná scéna (<code>metaphor</code>) napříč paletami kategorií a hustotou
			0,35 → 1. Akcent zůstává barvou kategorie, plochy drží indigovo-tealový jazyk
			s teplými korálovými a jantarovými akcenty.
		</p>
		<div class="grid small">
			{#each [
				['umeni', 0.35],
				['astronomie', 0.55],
				['ekonomie', 0.7],
				['filozofie', 0.85],
				['fyzika', 1],
				['historie', 0.55],
				['psychologie', 0.7],
				['pocitacove-vedy', 0.9]
			] as [category, value], index}
				{@const spec = createGeometricIllustration({
					family: 'metaphor',
					seed: `palette:${category}:${index}`,
					category,
					density: value
				})}
				<figure class="tile">
					<div class="card-surface">
						<div class="card-art">
							<PostIllustration {spec} />
						</div>
					</div>
					<figcaption>{category} · d{value}</figcaption>
				</figure>
			{/each}
		</div>
	</section>
</div>

<style>
	/* app.css zamyká html i body kvůli scroll-snap feedu; galerie potřebuje
	   běžné stránkové rolování, takže obojí odemkneme. */
	:global(html) {
		height: auto;
		overflow-y: auto;
	}

	:global(body) {
		overflow: visible;
		position: static;
		height: auto;
	}

	.dev-page {
		max-width: 1180px;
		margin: 0 auto;
		padding: 48px 20px 96px;
		color: var(--text);
	}

	.dev-header h1 {
		font-size: clamp(1.8rem, 4vw, 2.6rem);
		line-height: 1.15;
		letter-spacing: -0.02em;
	}

	.eyebrow {
		font-size: 0.68rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--accent-secondary);
		margin-bottom: 10px;
	}

	.lede {
		max-width: 620px;
		margin-top: 14px;
		color: var(--text-muted);
		line-height: 1.65;
		font-size: 0.95rem;
	}

	.note {
		margin-top: 10px;
		font-size: 0.72rem;
		color: #666;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	}

	section {
		margin-top: 56px;
	}

	h2 {
		font-size: 1.2rem;
	}

	h3 {
		font-size: 0.95rem;
	}

	.section-note {
		margin-top: 6px;
		color: var(--text-muted);
		font-size: 0.82rem;
		line-height: 1.6;
		max-width: 680px;
	}

	code {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.78em;
		color: var(--accent-secondary);
	}

	/* --- Prototyp --- */
	.prototype-head {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
	}

	.prototype-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 22px;
		margin-top: 20px;
	}

		.prototype-card {
		border: 1px solid #262626;
		border-radius: 16px;
		padding: 12px;
		background: #0d0d0d;
	}

	.prototype-label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin-bottom: 8px;
		font-size: 0.64rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		color: #777;
	}

	.family-chip {
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--accent-secondary);
	}

	.prototype-art {
		display: grid;
		gap: 8px;
	}

		.prototype-card .real-title {
		font-family: inherit;
		font-size: 0.78rem;
		margin-top: 8px;
	}

		/* --- Laboratoř --- */
	.lab {
		display: grid;
		grid-template-columns: minmax(0, 1.4fr) minmax(260px, 1fr);
		gap: 28px;
		align-items: start;
		margin-top: 32px;
		padding: 22px;
		border: 1px solid #262626;
		border-radius: 18px;
		background: #0d0d0d;
	}

	.lab-preview .card-surface {
		aspect-ratio: 16 / 7;
	}

	.lab-controls {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.control {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 0.78rem;
		color: var(--text-muted);
	}

	.control span {
		display: flex;
		justify-content: space-between;
		gap: 12px;
	}

	select {
		width: 100%;
		padding: 8px 10px;
		border-radius: 8px;
		border: 1px solid #333;
		background: #161616;
		color: var(--text);
		font-family: inherit;
		font-size: 0.82rem;
	}

	input[type='range'] {
		width: 100%;
		accent-color: var(--accent-secondary);
	}

		.readout {
		margin-top: 4px;
		padding-top: 10px;
		border-top: 1px solid #222;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.68rem;
		color: #666;
	}

	/* --- Karty a mřížky --- */
	.families {
		display: flex;
		flex-direction: column;
		gap: 30px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 26px;
		margin-top: 18px;
	}

	.grid.small {
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 18px;
	}

	.real-tile figcaption {
		white-space: normal;
		line-height: 1.5;
	}

	.real-title {
		margin-top: 4px;
		font-size: 0.72rem;
		line-height: 1.45;
		color: var(--text-muted);
	}

	.family-head p {
		margin-top: 3px;
		font-size: 0.72rem;
		color: #666;
	}

	.family-art {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 8px;
		margin-top: 10px;
	}

	.tile {
		margin: 0;
		min-width: 0;
	}

	/* Skutečné pozadí a rádius karty z PostCard.svelte */
	.card-surface {
		position: relative;
		aspect-ratio: 16 / 9;
		border-radius: 14px;
		border: 1px solid #262626;
		background: linear-gradient(180deg, #141414 0%, #0d0d0d 100%);
		box-shadow: 0 8px 26px rgba(0, 0, 0, 0.35);
		overflow: hidden;
	}

	.card-badge {
		position: absolute;
		top: 10px;
		left: 12px;
		font-size: 0.55rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--accent-secondary);
		border: 1px solid rgba(245, 158, 11, 0.35);
		border-radius: 999px;
		padding: 2px 8px;
	}

	.card-art {
		width: 100%;
		height: 100%;
		padding: 10px;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	figcaption {
		margin-top: 6px;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.62rem;
		color: #666;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.invalid {
		color: #f87171;
	}

	@media (max-width: 720px) {
		.lab {
			grid-template-columns: 1fr;
		}

		.family-art {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 5px;
		}

		.prototype-grid {
			grid-template-columns: minmax(0, 1fr);
		}

		.prototype-label {
			flex-wrap: wrap;
		}

		.card-art {
			padding: 6px;
		}
	}
</style>
