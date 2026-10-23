import test from 'node:test';
import assert from 'node:assert/strict';

import {
	SUBJECTS,
	SUBJECT_BY_KEY,
	analyzePost,
	detectChronology,
	explainSelection,
	normalizeText
} from '../src/lib/illustrations/index.js';

const post = (overrides = {}) => ({
	id: '001',
	title: 'Titulek',
	content: '<p>Text bez zvláštních klíčových slov.</p>',
	category: 'zajimavost',
	...overrides
});

test('kategorie má výchozí rodinu i předmět', () => {
	const expectations = {
		historie: ['relic', 'amphora'],
		filozofie: ['portrait', 'bust'],
		veda: ['discovery', 'flask'],
		umeni: ['metaphor', 'palette'],
		literatura: ['storybook', 'book'],
		politika: ['relic', 'lawScroll'],
		fyzika: ['discovery', 'atom'],
		astronomie: ['discovery', 'planet'],
		zajimavost: ['nature', 'tree'],
		ekonomie: ['metaphor', 'balance'],
		psychologie: ['metaphor', 'brain'],
		filmy: ['metaphor', 'film'],
		matematika: ['metaphor', 'polyhedron'],
		'pocitacove-vedy': ['metaphor', 'gear']
	};

	for (const [category, [family, subject]] of Object.entries(expectations)) {
		const result = analyzePost(post({ category, title: 'Neutrální titulek', content: '' }));
		assert.equal(result.family, family, category);
		assert.equal(result.subject, subject, category);
	}
});

test('konkrétní předmět v textu přebije kategorii', () => {
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

test('silná abstraktní klíčová slova vyberou síť, slabé kategorii nepodlehnou', () => {
	const network = analyzePost(
		post({
			category: 'filozofie',
			title: 'Síť neuronů a algoritmus',
			content: '<p>Umělá neuronová síť se učí z dat.</p>'
		})
	);
	assert.equal(network.family, 'network');

	const weak = analyzePost(
		post({ id: 'slabe', category: 'ekonomie', title: 'Neutrální titulek', content: '<p>Zmínka o jedné vlně.</p>' })
	);
	assert.equal(weak.subject, 'balance');
});

test('časová osa se použije jen pro výslovně chronologický obsah', () => {
	const factual = analyzePost(
		post({
			category: 'historie',
			title: 'Rosettská deska',
			content: '<p>Kámen nese stejný text ve třech písmenech.</p>'
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
	assert.equal(event.subject, null);

	assert.equal(detectChronology(post({ title: 'Rok 1968 a revoluce', content: '' })).strong, true);
	assert.equal(detectChronology(post({ title: 'Rozhovor o knize', content: '' })).strong, false);
});

test('doplňky patří do vybrané rodiny a nikdy se neopakují jako předmět', () => {
	const cases = [
		post({
			id: 'a',
			category: 'literatura',
			title: 'Pohádky bratří Grimmů',
			content: '<p>V lese číhá vlk a hrad v dálce.</p>'
		}),
		post({
			id: 'b',
			category: 'astronomie',
			title: 'Černá díra a dalekohled',
			content: '<p>Astronomové pozorovali horizont událostí.</p>'
		}),
		post({
			id: 'c',
			category: 'historie',
			title: 'Rosettská deska',
			content: '<p>Hieroglyfy na kamenné desce.</p>'
		})
	];

	for (const input of cases) {
		const result = analyzePost(input);
		assert.ok(result.supports.length <= 3, input.id);
		for (const key of result.supports) {
			const subject = SUBJECT_BY_KEY[key];
			assert.ok(subject, `neznámý doplněk ${key}`);
			assert.ok(subject.families.includes(result.family), `${key} nepatří do ${result.family}`);
			assert.notEqual(key, result.subject);
		}
	}
});

test('nesouvisející předmět se do výsledku nedostane', () => {
	const result = analyzePost(
		post({
			category: 'literatura',
			title: 'Kniha a atom',
			content: '<p>Autor mluví o knize i o atomu.</p>'
		})
	);
	assert.equal(result.family, 'storybook');
	assert.equal(result.subject, 'book');
	assert.ok(!result.supports.includes('atom'));
	assert.ok(!result.supports.includes('telescope'));
});

test('chybějící metadata mají deterministický fallback', () => {
	const empty = analyzePost(null);
	assert.equal(empty.family, 'structure');
	assert.equal(empty.subject, null);
	assert.deepEqual(empty.supports, []);
	assert.deepEqual(empty.scores, []);

	const unknown = analyzePost({ category: 'neexistuje' });
	assert.equal(unknown.family, 'structure');
	assert.equal(unknown.subject, null);
});

test('normalizace textu zvládá diakritiku, velikost písmen i HTML', () => {
	assert.equal(normalizeText('Síť, VLNA a Bunka!'), 'sit vlna a bunka');
	assert.equal(normalizeText('<p><strong>Neuronová</strong> síť &amp; algoritmus.</p>'), 'neuronova sit amp algoritmus');
});

test('vysvětlení výběru odpovídá výsledku analýzy', () => {
	const input = post({
		id: 'vysvetleni',
		category: 'historie',
		title: 'Rosettská deska',
		content: '<p>Hieroglyfy na kamenné desce.</p>'
	});
	const result = analyzePost(input);
	const explanation = explainSelection(input);

	assert.equal(explanation.family, result.family);
	assert.equal(explanation.subject, result.subject);
	assert.deepEqual(explanation.supports, result.supports);
	assert.equal(explanation.supportLabels.length, result.supports.length);
	assert.ok(explanation.reason.length > 0);
});

test('katalog předmětů má konzistentní metadata', () => {
	assert.ok(SUBJECTS.length >= 20);
	assert.equal(new Set(SUBJECTS.map((subject) => subject.key)).size, SUBJECTS.length);
	assert.equal(Object.keys(SUBJECT_BY_KEY).length, SUBJECTS.length);

	for (const subject of SUBJECTS) {
		assert.ok(subject.label.length > 0, subject.key);
		assert.ok(['subject', 'support', 'both'].includes(subject.role), subject.key);
		assert.ok(subject.families.length > 0, subject.key);
		assert.ok(subject.tags.length > 0, subject.key);
		assert.equal(typeof subject.note, 'string', subject.key);
		assert.equal('build' in subject, false, `${subject.key}: metadata nesmí nést kreslení`);
	}
});
