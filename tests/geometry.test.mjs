import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
	CATEGORY_PALETTES,
	COMPOSITION_KEYS,
	GEOMETRIC_COLORS,
	GEOMETRIC_FAMILY_KEYS,
	HERO_KEYS,
	MATERIALS,
	SUBJECTS,
	createGeometricIllustration,
	deriveSeed,
	paletteForCategory,
	refineSubject,
	validateElements
} from '../src/lib/illustrations/index.js';

const posts = JSON.parse(readFileSync(new URL('../static/data/posts.json', import.meta.url), 'utf8'));

const signature = (spec) =>
	JSON.stringify({
		family: spec.family,
		requestedFamily: spec.requestedFamily,
		subject: spec.subject,
		variant: spec.variant,
		density: spec.density,
		scale: spec.scale,
		balance: spec.balance,
		elements: spec.elements
	});

const hashOf = (value) => createHash('sha256').update(value).digest('hex');

// Zlaté otisky: scéna se nesmí změnit bez vědomého zásahu.
// Hashe odpovídají stavu před sloučením vrstev.
// Hashe odpovídají záměrnému přebarvení palety, novým motivům (stélé, DNA,
// trůn, entropie…) a kompoziční vrstvě. Scény se nesmí změnit bez vysvětlení
// v commitu — proto jsou tady pevné otisky, ne dopočítané hodnoty.
const GOLDEN = {
	'001': ['metaphor', 'balance', '81b2ce0d50eaf8e97713496532fd8aa0894221d4809538ce717d27abea7bdf55'],
	'002': ['metaphor', 'brain', '9105c822239be2be8bc6e1a3fdc53e9bfb5ef5dae56732376e82f99a61342716'],
	'003': ['discovery', 'telescope', '4915925191cd5e547af6abd385dff8bbac83f442c1b522a33560bd29010ae87d'],
	'010': ['discovery', 'dna', '044c8c84c0690ad281b5f7071eff30d5fbf009e7fe0b74397b50894424380a8e'],
	'100': ['portrait', 'bust', '9638570e2a5db6d7e95364964bf1daa76fdfe386bf39970a91784f0d88c4576f'],
	'200': ['discovery', 'planet', 'c894ed44497f52d79f77568a36c7b5a8b2f1d14f5d408290d7bb86637e7918c7'],
	'500': ['metaphor', 'polyhedron', '4b864753c8c70866f073f81f1f6096b1c31aaae9e05369181b688ab56eda2cb2']
};

test('každý příspěvek dostane platnou scénu', () => {
	for (const post of posts) {
		const spec = createGeometricIllustration({ post });
		assert.equal(spec.style, 'geometric', post.id);
		assert.ok(GEOMETRIC_FAMILY_KEYS.includes(spec.family), `${post.id}: ${spec.family}`);

		const result = validateElements(spec.elements);
		assert.deepEqual(result.errors, [], `${post.id}: ${result.errors.join(', ')}`);
		assert.ok(spec.elements.length > 0, post.id);
	}
});

test('scény odpovídají zlatým otiskům', () => {
	for (const [id, [family, subject, hash]] of Object.entries(GOLDEN)) {
		const post = posts.find((item) => item.id === id);
		assert.ok(post, `chybí příspěvek ${id}`);

		const spec = createGeometricIllustration({ post });
		assert.equal(spec.family, family, id);
		assert.equal(spec.subject, subject, id);
		assert.equal(hashOf(signature(spec)), hash, id);
	}
});

test('stejný vstup vždy vrátí stejnou scénu a scéna nemá doplňky', () => {
	const post = posts[0];
	const first = createGeometricIllustration({ post });
	const second = createGeometricIllustration({ post });

	assert.deepEqual(second, first);
	assert.equal('supports' in first, false);
});

test('pořadí vykreslení nemá vliv na výsledek', () => {
	const batch = posts.slice(0, 40);
	const forward = batch.map((item) => signature(createGeometricIllustration({ post: item })));
	const backward = [...batch].reverse().map((item) => signature(createGeometricIllustration({ post: item })));

	assert.deepEqual(forward, backward.reverse());
});

test('předmět se překládá na existující motiv', () => {
	const cases = [
		[{ family: 'relic', subject: 'lawScroll' }, 'scroll'],
		[{ family: 'metaphor', subject: 'entropy' }, 'entropy'],
		[{ family: 'relic', subject: 'stele' }, 'stele'],
		[{ family: 'relic', subject: 'throne' }, 'throne'],
		[{ family: 'relic', subject: 'temple' }, 'temple'],
		[{ family: 'relic', subject: 'sword' }, 'sword'],
		[{ family: 'discovery', subject: 'telescope' }, 'telescope']
	];

	for (const [options, expected] of cases) {
		const spec = createGeometricIllustration({ ...options, seed: 'test' });
		assert.equal(spec.subject, expected);
		assert.ok(HERO_KEYS.includes(spec.subject), expected);
	}
});

test('neznámý nebo chybějící předmět spadne na motiv rodiny', () => {
	const unknown = createGeometricIllustration({ family: 'nature', subject: 'neexistujici-motiv', seed: 'test' });
	assert.equal(unknown.subject, 'tree');
	assert.equal(validateElements(unknown.elements).ok, true);

	const missing = createGeometricIllustration({ family: 'discovery', seed: 'test', category: 'veda' });
	assert.equal(missing.subject, 'flask');
	assert.equal(validateElements(missing.elements).ok, true);
});

test('vrstvy jsou krajinný řez bez hlavního motivu', () => {
	const spec = createGeometricIllustration({ family: 'layers', subject: 'book', seed: 'layers' });
	assert.equal(spec.family, 'layers');
	assert.equal(spec.subject, null);
	assert.ok(validateElements(spec.elements).ok);
});

test('každý motiv vykreslí validní scénu ve všech scénách, které ho používají', () => {
	for (const subject of SUBJECTS) {
		for (const family of GEOMETRIC_FAMILY_KEYS) {
			if (family === 'layers') continue;
			const spec = createGeometricIllustration({ family, subject: subject.key, seed: `${family}:${subject.key}` });
			assert.ok(validateElements(spec.elements).ok, `${family}/${subject.key}`);
			// Motiv, který do scény nepatří, se nahradí výchozím motivem scény.
			assert.ok(HERO_KEYS.includes(spec.subject), `${family}/${subject.key} → ${spec.subject}`);
		}
	}
});

test('každá kompozice je validní pro více seedů', () => {
	for (const family of GEOMETRIC_FAMILY_KEYS) {
		for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
			const spec = createGeometricIllustration({ family, seed: `${family}:${seed}`, category: 'veda' });
			assert.equal(spec.family, family);
			assert.deepEqual(validateElements(spec.elements).errors, [], `${family}/${seed}`);
			assert.ok(spec.elements.length >= 3, `${family}/${seed}: příliš málo prvků`);
		}
	}
});

test('všechny parametry jsou v mezích a scény neobsahují text', () => {
	const categories = [...Object.keys(CATEGORY_PALETTES), 'neznamy', ''];

	for (let i = 0; i < 250; i++) {
		const spec = createGeometricIllustration({
			post: {
				id: String(i).padStart(4, '0'),
				title: `Testovací příspěvek ${i}`,
				content: '<p>Vlna, síť, buňka, město, válka, trh, obraz, hvězda, paradox, vrstva.</p>',
				category: categories[i % categories.length]
			}
		});

		assert.ok(GEOMETRIC_FAMILY_KEYS.includes(spec.family), `neznámá scéna ${spec.family}`);
		assert.ok(Number.isInteger(spec.variant) && spec.variant >= 0 && spec.variant <= 2);
		assert.ok(spec.density >= 0.35 && spec.density <= 1);
		assert.ok(spec.scale >= 0.9 && spec.scale <= 1.1);
		assert.ok(spec.balance >= -1 && spec.balance <= 1);
		assert.ok(spec.elements.length > 0 && spec.elements.length < 100);

		for (const el of spec.elements) {
			for (const value of Object.values(el)) {
				if (typeof value === 'number') assert.ok(Number.isFinite(value));
			}
			assert.ok(!('text' in el) && !('content' in el), 'scéna nesmí obsahovat text');
		}
	}
});

test('ručně zadané parametry se ořežou do povolených mezí', () => {
	const low = createGeometricIllustration({ family: 'layers', seed: 'x', variant: -9, density: -3, scale: 0.1, balance: -8 });
	assert.equal(low.variant, 0);
	assert.equal(low.density, 0.35);
	assert.equal(low.scale, 0.9);
	assert.equal(low.balance, -1);

	const high = createGeometricIllustration({ family: 'layers', seed: 'x', variant: 9, density: 9, scale: 9, balance: 9 });
	assert.equal(high.variant, 2);
	assert.equal(high.density, 1);
	assert.equal(high.scale, 1.1);
	assert.equal(high.balance, 1);
});

test('různé seedy dávají vizuálně odlišné scény', () => {
	const signatures = new Set();
	const variants = new Set();

	for (const family of GEOMETRIC_FAMILY_KEYS) {
		for (let i = 0; i < 20; i++) {
			const spec = createGeometricIllustration({ family, seed: `variation:${family}:${i}`, category: 'umeni' });
			signatures.add(JSON.stringify(spec.elements));
			variants.add(spec.variant);
		}
	}

	assert.ok(signatures.size >= 100, `jen ${signatures.size} unikátních scén`);
	assert.equal(variants.size, 3, 'měly by se objevit všechny tři varianty');
});

test('kompozice se vybírá deterministicky a zůstává v povolených vzorech', () => {
	const counts = Object.fromEntries(COMPOSITION_KEYS.map((key) => [key, 0]));

	for (const post of posts) {
		const spec = createGeometricIllustration({ post });
		assert.ok(COMPOSITION_KEYS.includes(spec.composition), `${post.id}: ${spec.composition}`);
		assert.deepEqual(createGeometricIllustration({ post }), spec, post.id);
		counts[spec.composition] += 1;

		if (spec.family === 'layers') assert.equal(spec.composition, 'single', post.id);
	}

	// Dynamické vzory mají nést menšinu scén, ne přebít klidný základ.
	const dynamic = Object.entries(counts)
		.filter(([key]) => key !== 'single')
		.reduce((sum, [, count]) => sum + count, 0);
	assert.ok(dynamic >= 80, `dynamických kompozic je jen ${dynamic}`);
	assert.ok(counts.single > posts.length / 2, `single je jen ${counts.single}`);
});

test('textové signály rozliší konkrétní motiv místo generického objektu', () => {
	assert.equal(refineSubject('telescope', { title: 'Kometa Halleyova', content: '' }), 'comet');
	assert.equal(refineSubject('telescope', { title: 'Galaxie v Andromedě', content: '' }), 'galaxy');
	assert.equal(refineSubject('telescope', { title: 'Sonda k Marsu', content: '' }), 'rocket');
	assert.equal(refineSubject('clock', { title: 'Entropie a šipka času', content: '' }), 'entropy');
	assert.equal(refineSubject('crown', { title: 'Trůn a korunovace', content: '' }), 'throne');
	assert.equal(refineSubject('amphora', { title: 'Berlínská zeď', content: 'bariéra město' }), 'wall');
	assert.equal(refineSubject('bust', { title: 'Sokrates', content: '' }), 'bust');
	assert.equal(refineSubject(null, { title: 'Kometa', content: '' }), null);

	const comet = createGeometricIllustration({
		post: { id: 'kometa', title: 'Kometa, která se vrací', content: '', category: 'astronomie' }
	});
	assert.equal(comet.family, 'discovery');
	assert.equal(comet.subject, 'comet');
});

test('kompozice staví víc objektů než klidný základ', () => {
	const single = createGeometricIllustration({
		post: { id: 'single', title: 'Neutrální', content: '', category: 'veda' }
	});
	const split = createGeometricIllustration({
		post: {
			id: 'split',
			title: 'Berlínská zeď rozdělila město',
			content: '',
			category: 'politika'
		}
	});

	assert.equal(single.composition, 'single');
	assert.equal(split.composition, 'split');
	assert.ok(split.elements.length > single.elements.length);
	assert.ok(validateElements(split.elements).ok);
});

test('paleta vychází z barvy kategorie a akcent je stabilní', () => {
	for (const [category, pair] of Object.entries(CATEGORY_PALETTES)) {
		const palette = paletteForCategory(category);
		assert.equal(palette.primary, pair[0], `${category}: primary`);
		assert.equal(palette.accent, pair[0], `${category}: accent = primary`);
		assert.equal(palette.secondary, pair[1], `${category}: secondary`);
		assert.notEqual(palette.primary, palette.secondary);

		for (let seed = 0; seed < 3; seed++) {
			const spec = createGeometricIllustration({
				post: { id: `p${seed}`, title: 'x', category, content: '' }
			});
			// Barva kategorie zůstává akcentem, plochy drží jednotný jazyk scény.
			assert.equal(spec.palette.accent, pair[0], `${category}/${seed}: accent`);
			assert.equal(spec.palette.primary, '#F2E8D5', `${category}/${seed}: primary`);
		}
	}

	const fallback = createGeometricIllustration({ post: { id: '008', title: 'x', category: 'neznamy', content: '' } });
	assert.equal(fallback.palette.accent, '#f59e0b');

	for (const [name, value] of Object.entries(MATERIALS)) {
		assert.equal(paletteForCategory('historie')[name], value, name);
	}
});

test('nová paleta není zelená a drží kontrast světlých obrysů', () => {
	const channels = (hex) => [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));
	const surfaces = ['forest', 'forestDeep', 'teal', 'tealDeep', 'sage', 'sageDeep'];

	for (const name of surfaces) {
		const [r, g, b] = channels(GEOMETRIC_COLORS[name]);
		assert.ok(b > r && b > g, `${name} (#${GEOMETRIC_COLORS[name]}) má modrou jako nosnou složku`);
	}

	const luminance = (hex) => {
		const [r, g, b] = channels(hex).map((value) => {
			const channel = value / 255;
			return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
		});
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	};
	const light = luminance(GEOMETRIC_COLORS.light);
	const deep = luminance(GEOMETRIC_COLORS.forestDeep);
	assert.ok((light + 0.05) / (deep + 0.05) > 8, 'obrysy musí být na tmavé hmotě čitelné');
});

test('kompozice používají víc barev a nesou akcent kategorie', () => {
	for (const family of GEOMETRIC_FAMILY_KEYS) {
		const spec = createGeometricIllustration({ family, seed: `colors-${family}`, category: 'historie' });
		const colors = new Set(
			spec.elements.flatMap((el) => [el.fill, el.stroke]).filter((color) => color && color !== 'none')
		);
		assert.ok(colors.has(spec.palette.primary), `${family}: chybí primary`);
		assert.ok(colors.size >= 3, `${family}: jen ${colors.size} barev`);
	}
});

test('seed z ID je stabilní a nezávislý na ostatních metadatech', () => {
	assert.equal(deriveSeed({ id: '042', title: 'A', category: 'veda' }), 'id:042');
	assert.equal(deriveSeed({ id: ' 042 ', title: 'B', category: 'historie' }), 'id:042');

	const sceneA = createGeometricIllustration({ post: { id: '042', title: 'A', category: 'veda', content: '' } });
	const sceneB = createGeometricIllustration({ post: { id: '042', title: 'B', category: 'veda', content: '' } });
	assert.equal(sceneA.seed, sceneB.seed);
	assert.equal(sceneA.variant, sceneB.variant);
	assert.equal(sceneA.density, sceneB.density);

	const noId = { title: 'Bez ID', category: 'veda', content: '' };
	assert.equal(deriveSeed(noId), deriveSeed(noId));
	assert.notEqual(deriveSeed(noId), deriveSeed({ ...noId, title: 'Jiný titulek' }));
	assert.ok(validateElements(createGeometricIllustration({ post: noId }).elements).ok);
});

test('chybějící metadata mají platný deterministický fallback', () => {
	const empty = createGeometricIllustration();
	assert.equal(empty.requestedFamily, 'metaphor');
	assert.equal(empty.family, 'metaphor');
	assert.deepEqual(empty, createGeometricIllustration());

	const unknown = createGeometricIllustration({ post: { category: 'neexistuje' } });
	assert.equal(unknown.requestedFamily, 'structure');
	assert.equal(unknown.family, 'relic');
	assert.equal(unknown.subject, 'amphora');
	assert.equal(unknown.palette.accent, '#f59e0b');
	assert.ok(validateElements(unknown.elements).ok);

	const invalidFamily = createGeometricIllustration({
		family: 'neexistuje',
		seed: 'x',
		category: 'neexistuje',
		subject: 'taky-neexistuje'
	});
	assert.equal(invalidFamily.family, 'metaphor');
	assert.equal(invalidFamily.subject, 'balance');
	assert.ok(validateElements(invalidFamily.elements).ok);
});

test('ilustrační moduly neobsahují síťová volání ani LLM', () => {
	const root = new URL('../src/lib/illustrations/', import.meta.url);
	const files = [];

	const walk = (url) => {
		for (const entry of readdirSync(url, { withFileTypes: true })) {
			const child = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, url);
			if (entry.isDirectory()) walk(child);
			else if (entry.name.endsWith('.js')) files.push(child);
		}
	};
	walk(root);

	for (const file of files) {
		const name = fileURLToPath(file);
		const source = readFileSync(file, 'utf8');
		assert.ok(files.length > 0);
		assert.ok(!/\bfetch\s*\(/.test(source), `${name}: neočekávaný fetch`);
		assert.ok(!/anthropic|openai|generat/i.test(source), `${name}: neočekávané volání generátoru`);
	}

	assert.ok(files.length >= 10, `nalezeno jen ${files.length} modulů`);
});
