import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
	FAMILIES,
	ABSTRACT_FAMILIES,
	SEMANTIC_FAMILIES,
	SEMANTIC_FAMILY_KEYS,
	FAMILY_BUILDERS,
	FAMILY_BY_CATEGORY,
	FAMILY_KEYS,
	CATEGORY_PALETTES,
	MATERIALS,
	MOTIFS,
	MOTIF_BY_KEY,
	renderMotif,
	analyzePost,
	detectChronology,
	createIllustration,
	selectIllustration,
	selectFamily,
	deriveSeed,
	createRandom,
	normalizeText,
	paletteForCategory,
	validateElements
} from '../src/lib/illustrations/index.js';

const post = (overrides = {}) => ({
	id: '001',
	title: 'Titulek',
	content: '<p>Text bez zvláštních klíčových slov.</p>',
	category: 'zajimavost',
	...overrides
});

const signature = (spec) => JSON.stringify({ family: spec.family, subject: spec.subject, elements: spec.elements });

test('stejný příspěvek vždy vrátí stejnou ilustraci', () => {
	const input = post({
		title: 'Hvězda, kterou vidíte dnes, možná už dávno nesvítí',
		content: '<p>Betelgeuze je vzdálená 640 světelných let.</p>',
		category: 'astronomie'
	});

	const first = selectIllustration(input);
	const second = selectIllustration(input);
	assert.deepEqual(first, second);
	assert.equal(JSON.stringify(first), JSON.stringify(second));
});

test('pořadí vykreslení nemá vliv na výsledek', () => {
	const posts = Array.from({ length: 40 }, (_, i) =>
		post({ id: String(i + 1).padStart(3, '0'), category: FAMILY_KEYS[i % FAMILY_KEYS.length] })
	);

	const forward = posts.map((item) => signature(selectIllustration(item)));
	const backwardMap = new Map();
	[...posts].reverse().forEach((item) => {
		backwardMap.set(item.id, signature(selectIllustration(item)));
	});
	const backward = posts.map((item) => backwardMap.get(item.id));

	assert.deepEqual(forward, backward);
});

test('kategorie vybírá výchozí sémantickou rodinu', () => {
	const expectations = {
		historie: 'relic',
		filozofie: 'portrait',
		veda: 'discovery',
		umeni: 'metaphor',
		literatura: 'storybook',
		politika: 'relic',
		fyzika: 'discovery',
		astronomie: 'discovery',
		zajimavost: 'nature',
		ekonomie: 'metaphor',
		psychologie: 'metaphor',
		filmy: 'metaphor',
		matematika: 'metaphor',
		'pocitacove-vedy': 'metaphor'
	};

	for (const [category, family] of Object.entries(expectations)) {
		assert.equal(selectFamily(post({ category, title: 'Neutrální titulek', content: '' })), family);
	}
});

test('text s konkrétním předmětem přebije kategorii', () => {
	const grimm = analyzePost(
		post({
			category: 'literatura',
			title: 'Bratři Grimmové a pohádky',
			content: '<p>Pohádky bratří Grimmů vycházejí z lidového vypravování. V lese číhá vlk.</p>'
		})
	);
	assert.equal(grimm.family, 'storybook');
	assert.equal(grimm.subject, 'book');
	assert.ok(grimm.supports.includes('wolf'));
	assert.ok(grimm.supports.includes('forest'));

	const philosopher = analyzePost(
		post({
			category: 'filozofie',
			title: 'Sokrates a umění klást otázky',
			content: '<p>Sokrates nepsal knihy, učil dialogy na athénském náměstí.</p>'
		})
	);
	assert.equal(philosopher.family, 'portrait');
	assert.equal(philosopher.subject, 'bust');

	const rosetta = analyzePost(
		post({
			category: 'historie',
			title: 'Rosettská deska',
			content: '<p>Kamenná deska z roku 196 př. n. l. nesla hieroglyfy a umožnila rozluštit egyptské písmo.</p>'
		})
	);
	assert.equal(rosetta.family, 'relic');
	assert.equal(rosetta.subject, 'stele');
});

test('abstraktní pojem používá metaforu, ne nesouvisející strukturu', () => {
	const entropy = analyzePost(
		post({
			category: 'fyzika',
			title: 'Entropie a šipka času',
			content: '<p>Druhý termodynamický zákon popisuje neuspořádanost systému.</p>'
		})
	);
	assert.equal(entropy.family, 'metaphor');
	assert.equal(entropy.subject, 'entropy');
});

test('silná abstraktní klíčová slova stále vyberou síť', () => {
	const family = selectFamily(
		post({
			category: 'filozofie',
			title: 'Síť neuronů a algoritmus',
			content: '<p>Umělá neuronová síť se učí z dat.</p>'
		})
	);
	assert.equal(family, 'network');
});

test('slabé klíčové slovo kategorii nepřebije', () => {
	const family = selectFamily(
		post({ category: 'ekonomie', title: 'Neutrální titulek', content: '<p>Zmínka o jedné vlně.</p>' })
	);
	assert.equal(family, 'metaphor');
});

test('časová osa se použije jen pro výslovně chronologický obsah', () => {
	const factual = analyzePost(
		post({
			category: 'historie',
			title: 'Rosettská deska',
			content: '<p>Kámen nese stejný text ve třech písmech.</p>'
		})
	);
	assert.notEqual(factual.family, 'timeline');
	assert.equal(factual.subject, 'stele');

	const event = analyzePost(
		post({
			category: 'historie',
			title: 'Rok 1066 a změny v anglických dějinách',
			content: '<p>Letopočet se stal mezníkem.</p>'
		})
	);
	assert.equal(event.family, 'timeline');
	assert.equal(detectChronology(post({ title: 'Rok 1968 a revoluce', content: '' })).strong, true);
});

test('doplňky jsou kompatibilní s vybranou rodinou', () => {
	const cases = [
		post({
			category: 'literatura',
			title: 'Pohádky bratří Grimmů',
			content: '<p>V lese číhá vlk a hrad v dálce.</p>'
		}),
		post({
			category: 'astronomie',
			title: 'Černá díra a dalekohled',
			content: '<p>Astronomové pozorovali horizont událostí.</p>'
		}),
		post({
			category: 'historie',
			title: 'Rosettská deska',
			content: '<p>Hieroglyfy na kamenné desce.</p>'
		})
	];

	for (const input of cases) {
		const spec = selectIllustration(input);
		assert.ok(spec.supports.length <= 3);
		for (const key of spec.supports) {
			const motif = MOTIF_BY_KEY[key];
			assert.ok(motif, `neznámý doplněk ${key}`);
			assert.ok(motif.families.includes(spec.family), `${key} nepatří do ${spec.family}`);
			assert.notEqual(key, spec.subject);
		}
	}
});

test('nesouvisející motiv se do kompozice nepřidá', () => {
	const spec = selectIllustration(
		post({
			category: 'literatura',
			title: 'Kniha a atom',
			content: '<p>Autor mluví o knize i o atomu.</p>'
		})
	);
	assert.equal(spec.family, 'storybook');
	assert.equal(spec.subject, 'book');
	assert.ok(!spec.supports.includes('atom'));
	assert.ok(!spec.supports.includes('telescope'));
});

test('předmět skutečně mění kompozici', () => {
	const grimm = selectIllustration(
		post({ category: 'literatura', title: 'Pohádky bratří Grimmů', content: '<p>Vlk a les.</p>' })
	);
	const rosetta = selectIllustration(
		post({ category: 'historie', title: 'Rosettská deska', content: '<p>Hieroglyfy a kámen.</p>' })
	);
	const blackhole = selectIllustration(
		post({ category: 'astronomie', title: 'Černá díra', content: '<p>Horizont událostí a gravitace.</p>' })
	);

	assert.notEqual(grimm.subject, rosetta.subject);
	assert.notEqual(grimm.family, rosetta.family);
	assert.equal(grimm.subject, 'book');
	assert.equal(rosetta.subject, 'stele');
	assert.equal(blackhole.subject, 'blackhole');
	assert.notEqual(signature(grimm), signature(rosetta));
	assert.notEqual(signature(rosetta), signature(blackhole));
});

test('neznámý nebo chybějící předmět spadne na výchozí motiv rodiny', () => {
	const unknown = createIllustration({ family: 'storybook', seed: 'x', category: 'literatura', subject: 'neexistuje' });
	assert.equal(unknown.subject, 'book');
	assert.equal(validateElements(unknown.elements).ok, true);

	const missing = createIllustration({ family: 'discovery', seed: 'x', category: 'veda' });
	assert.equal(missing.subject, 'flask');
	assert.equal(validateElements(missing.elements).ok, true);
});

test('chybějící metadata mají platný deterministický fallback', () => {
	const empty = selectIllustration(null);
	assert.equal(empty.family, 'structure');
	assert.equal(empty.subject, null);
	assert.equal(validateElements(empty.elements).ok, true);
	assert.deepEqual(empty, selectIllustration(null));

	const unknown = selectIllustration({ category: 'neexistuje' });
	assert.equal(unknown.family, 'structure');
	assert.equal(unknown.palette.primary, '#f59e0b');
	assert.equal(validateElements(unknown.elements).ok, true);

	const invalidFamily = createIllustration({
		family: 'neexistuje',
		seed: 'x',
		category: 'neexistuje',
		subject: 'taky-neexistuje',
		supports: ['atom', 'nic']
	});
	assert.equal(invalidFamily.family, 'structure');
	assert.equal(invalidFamily.subject, null);
	assert.deepEqual(invalidFamily.supports, []);
	assert.equal(validateElements(invalidFamily.elements).ok, true);

	const noId = { title: 'Bez ID', category: 'veda', content: '' };
	assert.equal(deriveSeed(noId), deriveSeed(noId));
	assert.notEqual(deriveSeed(noId), deriveSeed({ ...noId, title: 'Jiný titulek' }));
	assert.equal(validateElements(selectIllustration(noId).elements).ok, true);
});

test('seed z ID je stabilní a nezávislý na ostatních metadatech', () => {
	const a = deriveSeed({ id: '042', title: 'A', category: 'veda' });
	const b = deriveSeed({ id: ' 042 ', title: 'B', category: 'historie' });
	assert.equal(a, 'id:042');
	assert.equal(b, 'id:042');

	// Stejné ID, jiný text → stejná scéna; sémantický předmět se ale může změnit.
	const sceneA = selectIllustration({ id: '042', title: 'A', category: 'veda', content: '' });
	const sceneB = selectIllustration({ id: '042', title: 'B', category: 'veda', content: '' });
	assert.equal(sceneA.seed, sceneB.seed);
	assert.equal(sceneA.variant, sceneB.variant);
	assert.equal(sceneA.density, sceneB.density);
});

test('všechny parametry jsou v mezích a scény jsou validní', () => {
	const categories = [...Object.keys(CATEGORY_PALETTES), 'neznamy', ''];

	for (let i = 0; i < 250; i++) {
		const category = categories[i % categories.length];
		const spec = selectIllustration({
			id: String(i).padStart(4, '0'),
			title: `Testovací příspěvek ${i}`,
			content: '<p>Vlna, síť, buňka, město, válka, trh, obraz, hvězda, paradox, vrstva.</p>',
			category
		});

		assert.ok(FAMILY_KEYS.includes(spec.family), `neznámá rodina ${spec.family}`);
		assert.ok(Number.isInteger(spec.variant) && spec.variant >= 0 && spec.variant <= 2);
		assert.ok(spec.density >= 0.35 && spec.density <= 1);
		assert.ok(spec.scale >= 0.9 && spec.scale <= 1.1);
		assert.ok(spec.balance >= -1 && spec.balance <= 1);
		assert.ok(spec.elements.length > 0 && spec.elements.length < 100);

		const validation = validateElements(spec.elements);
		assert.deepEqual(validation.errors, [], `${spec.family} #${i}: ${validation.errors.join(', ')}`);

		for (const el of spec.elements) {
			for (const value of Object.values(el)) {
				if (typeof value === 'number') assert.ok(Number.isFinite(value));
			}
			assert.ok(!('text' in el) && !('content' in el), 'scéna nesmí obsahovat text');
		}
	}
});

test('ručně zadané parametry se ořežou do povolených mezí', () => {
	const low = createIllustration({ family: 'grid', seed: 'x', variant: -9, density: -3, scale: 0.1, balance: -8 });
	assert.equal(low.variant, 0);
	assert.equal(low.density, 0.35);
	assert.equal(low.scale, 0.9);
	assert.equal(low.balance, -1);

	const high = createIllustration({ family: 'grid', seed: 'x', variant: 9, density: 9, scale: 9, balance: 9 });
	assert.equal(high.variant, 2);
	assert.equal(high.density, 1);
	assert.equal(high.scale, 1.1);
	assert.equal(high.balance, 1);
});

test('každá rodina vygeneruje validní scénu pro více seedů', () => {
	for (const family of FAMILIES) {
		for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
			const spec = createIllustration({ family: family.key, seed: `${family.key}:${seed}`, category: 'veda' });
			const validation = validateElements(spec.elements);
			assert.deepEqual(validation.errors, [], `${family.key}/${seed}: ${validation.errors.join(', ')}`);
			assert.equal(spec.family, family.key);
			assert.ok(spec.elements.length >= 3, `${family.key}/${seed}: příliš málo prvků`);
		}
	}
});

test('každá sémantická rodina umí všechny své předměty', () => {
	for (const family of SEMANTIC_FAMILIES) {
		assert.ok(family.subjects.length > 0, `${family.key}: žádné předměty`);
		for (const subject of family.subjects) {
			const spec = createIllustration({
				family: family.key,
				seed: `subject:${subject}`,
				category: 'veda',
				subject
			});
			assert.equal(spec.subject, subject);
			const validation = validateElements(spec.elements);
			assert.deepEqual(validation.errors, [], `${family.key}/${subject}`);
		}
	}
});

test('různé seedy dávají vizuálně odlišné scény', () => {
	const signatures = new Set();
	const variants = new Set();

	for (let i = 0; i < 40; i++) {
		const spec = createIllustration({ family: 'grid', seed: `variation:${i}`, category: 'umeni' });
		signatures.add(JSON.stringify(spec.elements));
		variants.add(spec.variant);
	}

	assert.ok(signatures.size >= 30, `jen ${signatures.size} unikátních scén`);
	assert.equal(variants.size, 3, 'měly by se objevit všechny tři varianty');
});

test('paleta vychází z barvy kategorie a primary je vždy stabilní', () => {
	for (const [category, pair] of Object.entries(CATEGORY_PALETTES)) {
		const first = paletteForCategory(category);
		const second = paletteForCategory(category, true);
		assert.equal(first.primary, pair[0], `${category}: primary`);
		assert.equal(first.accent, pair[0], `${category}: accent = primary`);
		assert.equal(first.secondary, pair[1], `${category}: secondary`);
		assert.equal(second.primary, pair[0], `${category}: primary se nesmí změnit`);
		assert.notEqual(first.primary, first.secondary);

		for (let seed = 0; seed < 5; seed++) {
			const spec = selectIllustration({ id: `p${seed}`, title: 'x', category, content: '' });
			assert.equal(spec.palette.primary, pair[0], `${category}/${seed}: primary`);
		}
	}

	const fallback = selectIllustration({ id: '008', title: 'x', category: 'neznamy', content: '' });
	assert.equal(fallback.palette.primary, '#f59e0b');
	assert.equal(fallback.palette.accent, fallback.palette.primary);
});

test('kompozice nemění primární barvu kategorie', () => {
	const atom = selectIllustration({
		id: 'a',
		category: 'fyzika',
		title: 'Atom a kvantová mechanika',
		content: '<p>Elektrony a protony.</p>'
	});
	const entropy = selectIllustration({
		id: 'b',
		category: 'fyzika',
		title: 'Entropie a neuspořádanost',
		content: '<p>Chaos a pravděpodobnost.</p>'
	});

	assert.notEqual(atom.family, entropy.family);
	assert.equal(atom.palette.primary, CATEGORY_PALETTES.fyzika[0]);
	assert.equal(entropy.palette.primary, CATEGORY_PALETTES.fyzika[0]);
	assert.equal(atom.palette.primary, entropy.palette.primary);
});

test('paleta obsahuje materiálové barvy a harmonický akcent', () => {
	for (const category of Object.keys(CATEGORY_PALETTES)) {
		const palette = paletteForCategory(category);
		for (const [name, value] of Object.entries(MATERIALS)) {
			assert.equal(palette[name], value, `${category}: ${name}`);
		}
		assert.notEqual(palette.tertiary, palette.primary, `${category}: tertiary nesmí splývat s primary`);
		assert.notEqual(palette.tertiary, palette.secondary, `${category}: tertiary nesmí splývat se secondary`);
	}
});

test('motivy míchají barvu kategorie s přirozenými materiály', () => {
	const palette = paletteForCategory('historie');
	const colorsOf = (key) =>
		new Set(
			renderMotif(key, { palette, rand: createRandom(key), variant: 0, density: 0.5 })
				.flatMap((el) => [el.fill, el.stroke])
				.filter((color) => color && color !== 'none')
		);

	const cases = {
		book: [palette.primary, palette.paper, palette.woodDark],
		leaf: [palette.primary, palette.foliage],
		tree: [palette.primary, palette.wood, palette.foliage],
		wolf: [palette.primary, palette.stoneDark, palette.gold],
		castle: [palette.primary, palette.stone, palette.stoneDark]
	};

	for (const [key, expected] of Object.entries(cases)) {
		const colors = colorsOf(key);
		for (const color of expected) {
			assert.ok(colors.has(color), `${key}: chybí ${color}`);
		}
		assert.ok(colors.size >= 3, `${key}: ilustrace je jednobarevná (${colors.size} barev)`);
	}
});

test('kompozice používají víc barev, ale primary zůstává přítomné', () => {
	for (const family of FAMILIES) {
		const spec = createIllustration({
			family: family.key,
			seed: `colors-${family.key}`,
			category: 'historie'
		});
		const colors = new Set(
			spec.elements.flatMap((el) => [el.fill, el.stroke]).filter((color) => color && color !== 'none')
		);
		assert.ok(colors.has(spec.palette.primary), `${family.key}: chybí primary`);
		assert.ok(colors.size >= 3, `${family.key}: jen ${colors.size} barev`);
	}
});

test('časová osa zůstává barevná ve všech variantách', () => {
	for (let i = 0; i < 12; i++) {
		const spec = createIllustration({
			family: 'timeline',
			seed: `timeline-colors-${i}`,
			category: 'historie'
		});
		const colors = new Set(
			spec.elements.flatMap((el) => [el.fill, el.stroke]).filter((color) => color && color !== 'none')
		);
		assert.ok(colors.has(spec.palette.primary), `varianta ${spec.variant}: chybí primary`);
		assert.ok(colors.has(spec.palette.gold), `varianta ${spec.variant}: chybí zlatý akcent`);
		assert.ok(
			colors.has(spec.palette.tertiary) || colors.has(spec.palette.secondary),
			`varianta ${spec.variant}: chybí doplňkový akcent`
		);
		assert.ok(colors.size >= 5, `varianta ${spec.variant}: jen ${colors.size} barev`);
	}
});

test('normalizace textu zvládá diakritiku i HTML', () => {
	assert.equal(normalizeText('Síť, VLNA a Bunka!'), 'sit vlna a bunka');
	const spec = selectIllustration({
		id: '009',
		title: 'Síť',
		content: '<p><strong>Neuronová</strong> síť &amp; algoritmus.</p>',
		category: 'filozofie'
	});
	assert.equal(spec.family, 'network');
});

test('katalog motivů má konzistentní metadata', () => {
	assert.ok(MOTIFS.length >= 20);
	assert.equal(new Set(MOTIFS.map((motif) => motif.key)).size, MOTIFS.length);

	for (const motif of MOTIFS) {
		assert.ok(motif.label.length > 0);
		assert.ok(['subject', 'support', 'both'].includes(motif.role));
		assert.ok(motif.families.length > 0);
		for (const family of motif.families) {
			assert.ok(SEMANTIC_FAMILY_KEYS.includes(family), `${motif.key}: ${family}`);
		}
		assert.ok(motif.tags.length > 0);
		assert.equal(typeof motif.build, 'function');
	}
});

test('ilustrační moduly neobsahují síťová volání ani LLM', () => {
	const files = [
		'src/lib/illustrations/primitives.js',
		'src/lib/illustrations/prng.js',
		'src/lib/illustrations/palettes.js',
		'src/lib/illustrations/motifs.js',
		'src/lib/illustrations/concepts.js',
		'src/lib/illustrations/semantic-scenes.js',
		'src/lib/illustrations/scenes.js',
		'src/lib/illustrations/select.js',
		'src/lib/components/PostIllustration.svelte'
	];

	for (const file of files) {
		const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
		assert.ok(!/\bfetch\s*\(/.test(source), `${file}: neočekávaný fetch`);
		assert.ok(!/anthropic|openai|generat/i.test(source), `${file}: neočekávané volání generátoru`);
	}
});

test('katalog obsahuje rozšířenou sadu abstraktních a sémantických rodin', () => {
	assert.equal(ABSTRACT_FAMILIES.length, 34);
	assert.equal(SEMANTIC_FAMILIES.length, 31);
	assert.equal(FAMILIES.length, 65);
	assert.equal(new Set(FAMILY_KEYS).size, 65);
	for (const key of FAMILY_KEYS) {
		assert.equal(typeof FAMILY_BUILDERS[key], 'function');
	}
});

test('kategorie v mapě jsou známé a mapa nepoužívá neexistující rodinu', () => {
	for (const [category, family] of Object.entries(FAMILY_BY_CATEGORY)) {
		assert.ok(category.length > 0);
		assert.ok(FAMILY_KEYS.includes(family), `${category} → ${family}`);
		assert.ok(SEMANTIC_FAMILY_KEYS.includes(family), `${category} → ${family} není sémantická`);
	}
});
