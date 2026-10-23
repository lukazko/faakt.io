import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
	CATEGORY_PALETTES,
	GEOMETRIC_FAMILY_KEYS,
	HERO_KEYS,
	MATERIALS,
	SUBJECTS,
	createGeometricIllustration,
	deriveSeed,
	paletteForCategory,
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
const GOLDEN = {
	'001': ['metaphor', 'balance', 'bbd9daff30946c2d99ea493c9da9186fb22acb98989eec8d530561d94fbbc826'],
	'002': ['metaphor', 'brain', 'ed585e16a645a2cfe81c3c4e270567335940b20ff81d2259132b33ea6c56e648'],
	'003': ['discovery', 'telescope', '9338e700e6154035c320be67063c2d4d02bdc249f8a96f35e1440d7fa54b7532'],
	'010': ['discovery', 'flask', 'b78284005f3f05a2e1384b5b0ee206de666dfb1f66626c4f35e5900aa8046e47'],
	'100': ['portrait', 'bust', '0c4d7606f579c9014dbcc2c4492754fbf158cb67da2a2a4ccd97c36ca4eef017'],
	'200': ['discovery', 'planet', '0127e5429842566563763ec0b658f1de906422c2a5776006975fca9d3011853b'],
	'500': ['metaphor', 'polyhedron', '9e4f84422ae70d612f4f18635ad800c5e61b2b10249361846431d1349d549757']
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
		[{ family: 'metaphor', subject: 'entropy' }, 'clock'],
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
			assert.equal(spec.palette.primary, '#E9E0CC', `${category}/${seed}: primary`);
		}
	}

	const fallback = createGeometricIllustration({ post: { id: '008', title: 'x', category: 'neznamy', content: '' } });
	assert.equal(fallback.palette.accent, '#f59e0b');

	for (const [name, value] of Object.entries(MATERIALS)) {
		assert.equal(paletteForCategory('historie')[name], value, name);
	}
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
