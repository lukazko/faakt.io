/**
 * Regresní testy sémantického výběru scény.
 *
 * Každý test odpovídá jedné třídě chyb, kterou audit ilustrací odhalil:
 * konkrétní příklad z datasetu + zobecněné pravidlo, aby se chyba nemohla
 * vrátit přes jiný text. Testy jsou deterministické a nevolají síť.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createGeometricIllustration, selectScene } from '../src/lib/illustrations/index.js';

const posts = JSON.parse(readFileSync(new URL('../static/data/posts.json', import.meta.url), 'utf8'));
const post = (id) => {
	const found = posts.find((item) => item.id === id);
	assert.ok(found, `chybí příspěvek ${id}`);
	return found;
};
const render = (id) => createGeometricIllustration({ post: post(id) });
const synthetic = (title, content, category = 'zajimavost') =>
	createGeometricIllustration({ post: { id: 'synthetic', title, content, category } });

test('inovace a zánik ukazují stroj, ne geologickou vrstvu ani zříceninu', () => {
	const spec = render('754');
	assert.equal(spec.scene, 'disruption');
	assert.ok(['machine', 'gear'].includes(spec.subject), spec.subject);
	assert.notEqual(spec.subject, 'ruin');
});

test('příspěvek o Slunci nikdy nevykreslí srpek Měsíce', () => {
	const spec = render('085');
	assert.equal(spec.subject, 'sun');
	assert.notEqual(spec.secondary, 'moon');

	const syntheticSun = synthetic(
		'Slunce spálí Zemi za pět miliard let',
		'Slunce se postupně zvětšuje. Až dosáhne fáze červeného obra, pohltí Merkur a Venuši.'
	);
	assert.equal(syntheticSun.subject, 'sun');
	assert.notEqual(syntheticSun.secondary, 'moon');
});

test('příspěvek o Měsíci nevykreslí Slunce', () => {
	const spec = synthetic(
		'Měsíc se od Země každý rok vzdaluje',
		'Přílivové síly zpomalují rotaci Země a Měsíc se vzdaluje o přibližně čtyři centimetry ročně.'
	);
	assert.ok(['moon', 'planet'].includes(spec.subject), spec.subject);
	assert.notEqual(spec.subject, 'sun');
});

test('„sluneční soustava“ není Slunce: Titan zůstane Měsícem', () => {
	const spec = render('580');
	assert.equal(spec.subject, 'moon');
	assert.notEqual(spec.secondary, 'sun');
});

test('požár knihovny nese knihovnu i plamen, ne osamocenou knihu', () => {
	const spec = render('199');
	assert.equal(spec.scene, 'bookFire');
	assert.equal(spec.subject, 'library');
	assert.equal(spec.secondary, 'flame');
});

test('člověk pohlcený činností ukazuje vztah k hodinám', () => {
	const spec = render('417');
	assert.equal(spec.scene, 'timeFigure');
	assert.equal(spec.subject, 'figure');
	assert.equal(spec.secondary, 'clock');
});

test('písmo a námořní obchod nekončí jako hodiny', () => {
	const spec = render('540');
	assert.equal(spec.scene, 'writing');
	assert.equal(spec.subject, 'script');
	assert.equal(spec.secondary, 'ship');
	assert.notEqual(spec.subject, 'clock');
});

test('hvězda v titulku má přednost před přístrojem, kterým se pozoruje', () => {
	const spec = render('003');
	assert.equal(spec.scene, 'celestial');
	assert.equal(spec.subject, 'star');
	assert.notEqual(spec.subject, 'telescope');
	assert.equal(spec.secondary, null);
});

test('krátký řetězec „dna“ se nesmí chytit uvnitř jiného slova', () => {
	const spec = render('010');
	assert.equal(spec.subject, 'flask');
	assert.notEqual(spec.subject, 'dna');
});

test('revoluční adjektivum samo o sobě neznamená dav ani pochod', () => {
	const spec = render('010');
	assert.notEqual(spec.scene, 'procession');
	assert.notEqual(spec.subject, 'crowd');
});

test('vrstvy zůstávají krajinný řez bez hlavního motivu', () => {
	const spec = createGeometricIllustration({ family: 'layers', subject: 'book', seed: 'layers' });
	assert.equal(spec.subject, null);
});

test('scéna se vybírá deterministicky a nese důvod', () => {
	const first = render('417');
	const second = render('417');
	assert.deepEqual(second, first);
	assert.match(first.reason, /^scene:/);
});

test('zrcadlo ukazuje odraz a ruce, ne knihu', () => {
	const spec = render('617');
	assert.equal(spec.scene, 'mirrorScene');
	assert.equal(spec.subject, 'mirror');
	assert.equal(spec.secondary, 'hand');
});

test('podobenství o slepcích a slonovi vykreslí slona', () => {
	const spec = render('176');
	assert.equal(spec.scene, 'parable');
	assert.equal(spec.subject, 'elephant');
});

test('zákoník spojí sloup nebo pergamen s právním textem', () => {
	const spec = render('525');
	assert.equal(spec.scene, 'codex');
	assert.ok(['column', 'scroll'].includes(spec.subject), spec.subject);
	assert.notEqual(spec.subject, spec.secondary);
});

test('reakce na politiku ukáže skupinu a zpětnou vazbu, ne vrstvy', () => {
	const spec = render('479');
	assert.equal(spec.scene, 'response');
	assert.equal(spec.subject, 'crowd');
});

test('rozpad prvních číslic ukáže jedničku, ne krajinný řez', () => {
	const spec = render('303');
	assert.equal(spec.scene, 'digits');
	assert.equal(spec.subject, 'numeralOne');
});

test('burzovní propad ukáže křivku dolů, ne vrstvy', () => {
	const spec = render('128');
	assert.equal(spec.scene, 'crash');
	assert.equal(spec.subject, 'chart');
});

test('komprese zmenší tentýž objekt, nezobrazí písmo', () => {
	const spec = render('866');
	assert.equal(spec.scene, 'compression');
	assert.notEqual(spec.subject, 'script');
});

test('stroj, který mluví, zůstane jedním strojem bez zříceniny', () => {
	const spec = render('055');
	assert.equal(spec.scene, 'artificial');
	assert.equal(spec.subject, 'machine');
	assert.equal(spec.secondary, null);
});

test('vesmírná loď není plachetnice', () => {
	const spec = render('458');
	assert.equal(spec.scene, 'spacecraft');
	assert.equal(spec.subject, 'rocket');
});

test('taxík v textu vykreslí auto', () => {
	const spec = render('815');
	assert.equal(spec.scene, 'taxi');
	assert.equal(spec.subject, 'car');
});

test('banán jako každodenní míra záření', () => {
	const spec = render('451');
	assert.equal(spec.subject, 'banana');
});

test('„uspořádal“ není komprese', () => {
	const spec = render('010');
	assert.notEqual(spec.scene, 'compression');
});

test('zrcadlo dalekohledu není zrcadlo člověka', () => {
	const spec = render('566');
	assert.notEqual(spec.scene, 'mirrorScene');
});

test('odraz od mola ani rozptyl částic nejsou zrcadlová scéna', () => {
	assert.notEqual(render('023').scene, 'mirrorScene');
	assert.notEqual(render('138').scene, 'mirrorScene');
});

test('válečný slon není podobenství o slepcích', () => {
	const spec = render('516');
	assert.notEqual(spec.scene, 'parable');
});

test('Rosettská deska není zákoník se sloupem', () => {
	for (const id of ['029', '069', '104']) {
		const spec = render(id);
		assert.notEqual(spec.scene, 'codex', `${id} nemá být codex`);
	}
});

test('obecný test ani program nespustí scénu umělého stroje', () => {
	for (const id of ['188', '235', '429', '743']) {
		assert.notEqual(render(id).scene, 'artificial', `${id} nemá být artificial`);
	}
});

test('zkrácení války není komprese dat', () => {
	assert.notEqual(render('134').scene, 'compression');
});

test('hodiny vracející se k jedničce nejsou rozpad číslic', () => {
	assert.notEqual(render('657').scene, 'digits');
});

test('selectScene vrací null pro neutrální text bez specifické scény', () => {
	const neutral = {
		title: 'Ticho jako součást hudby',
		content: 'John Cage složil skladbu 4′33″, ve které hudebníci nehrají žádný tón.',
		category: 'umeni'
	};
	assert.equal(selectScene({ post: neutral, category: 'umeni' }), null);
});
