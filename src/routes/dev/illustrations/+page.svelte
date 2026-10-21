<script>
	/**
	 * Vývojová galerie ilustrací.
	 *
	 * Není součástí feedu — slouží k vizuální kontrole všech rodin,
	 * palet a hustot na skutečném tmavém pozadí karty. Vše se generuje
	 * stejným rendererem jako ve feedu.
	 */
	import PostIllustration from '$lib/components/PostIllustration.svelte';
	import {
		FAMILIES,
		MOTIF_BY_KEY,
		createIllustration,
		explainSelection,
		selectIllustration,
		validateElements
	} from '$lib/illustrations/index.js';

	// Kategorie, ze které rodina bere paletu — drží galerii blízko reality.
	const FAMILY_CATEGORY = {
		grid: 'umeni',
		orbit: 'astronomie',
		data: 'ekonomie',
		timeline: 'historie',
		network: 'pocitacove-vedy',
		layers: 'veda',
		signals: 'fyzika',
		structure: 'politika',
		contrast: 'filozofie',
		organic: 'veda',
		storybook: 'literatura',
		portrait: 'filozofie',
		discovery: 'veda',
		relic: 'historie',
		nature: 'zajimavost',
		metaphor: 'matematika'
	};

	const SEEDS = ['eden', 'dva', 'tri'];

	const gallery = FAMILIES.map((family) => ({
		...family,
		category: FAMILY_CATEGORY[family.key],
		items: SEEDS.map((seed) => {
			const spec = createIllustration({
				family: family.key,
				seed: `${family.key}:${seed}`,
				category: FAMILY_CATEGORY[family.key]
			});
			return { seed, spec, valid: validateElements(spec.elements).ok };
		})
	}));

	// --- Interaktivní laboratoř ---
	let family = $state('storybook');
	let subject = $state('book');
	let variant = $state(0);
	let density = $state(0.7);
	let scale = $state(1);
	let balance = $state(0);
	let paletteSwap = $state(false);

	let familyMeta = $derived(FAMILIES.find((item) => item.key === family));

	// Po změně rodiny se předmět srovná na její výchozí motiv.
	$effect(() => {
		const allowed = familyMeta?.subjects ?? [];
		if (!allowed.includes(subject)) subject = familyMeta?.defaultSubject ?? null;
	});

	let labSpec = $derived(
		createIllustration({
			family,
			seed: `lab:${family}:${subject}:${variant}:${density}:${scale}:${balance}:${paletteSwap}`,
			category: FAMILY_CATEGORY[family] ?? 'zajimavost',
			subject,
			variant,
			density,
			scale,
			balance,
			paletteSwap
		})
	);

	let usage = $derived(
		gallery.reduce(
			(sum, family) => sum + family.items.reduce((count, item) => count + item.spec.elements.length, 0),
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
		const spec = selectIllustration({ ...item, content: item.content });
		return { ...item, spec, explanation: explainSelection(item) };
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
			Šedesát čtyři rodin, sémantické motivy a deterministické varianty. Žádné externí assety. Všechno níže je
			stejná komponenta, která se vykresluje v kartách feedu.
		</p>
		<p class="note">
			{usage} řádků ve scénách · viewBox 320 × 180 · seed = ID příspěvku
		</p>
	</header>

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
				<span>Rodina</span>
				<select bind:value={family}>
					{#each FAMILIES as item}
						<option value={item.key}>{item.label}</option>
					{/each}
				</select>
			</label>

			{#if familyMeta?.subjects?.length}
				<label class="control">
					<span>Předmět</span>
					<select bind:value={subject}>
						{#each familyMeta.subjects as key}
							<option value={key}>{MOTIF_BY_KEY[key]?.label ?? key}</option>
						{/each}
					</select>
				</label>
			{/if}

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

			<label class="check">
				<input type="checkbox" bind:checked={paletteSwap} />
				<span>Prohodit accent a secondary</span>
			</label>

			<p class="readout">
				{labSpec.family} · {labSpec.elements.length} prvků · seed {labSpec.seedHash}
			</p>
		</div>
	</section>

	<section class="families" aria-labelledby="families-title">
		<h2 id="families-title">Všech šedesát čtyři rodin</h2>
		<p class="section-note">
			Každá rodina se třemi seedy. Sémantické rodiny navíc ukazují svůj výchozí
			předmět; kompozice se mění podle textu příspěvku, ne jen podle kategorie.
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
						{#if item.explanation.supportLabels.length}
							+ {item.explanation.supportLabels.join(', ')}
						{/if}
					</figcaption>
					<p class="real-title">{item.title}</p>
				</figure>
			{/each}
		</div>
	</section>

	<section class="palettes" aria-labelledby="palettes-title">
		<h2 id="palettes-title">Palety a hustota</h2>
		<p class="section-note">
			Stejná rodina (<code>organic</code>) napříč paletami kategorií a hustotou
			0,35 → 1. <code>primary</code> zůstává barvou kategorie, neutrály tmavé.
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
				{@const spec = createIllustration({
					family: 'organic',
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
	:global(body) {
		overflow: auto;
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

	.check {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.78rem;
		color: var(--text-muted);
	}

	.check input {
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

		.card-art {
			padding: 6px;
		}
	}
</style>
