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

import {
	CULTURES,
	CULTURE_KEYS,
	SEMANTIC_SCENE_KEYS,
	createGeometricIllustration,
	detectCulture,
	selectScene
} from '../src/lib/illustrations/index.js';

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

test('z druhé iterace feedbacku: zlato, vlny, vesmírná hudba a tři dveře', () => {
	assert.equal(render('823').scene, 'alchemy');
	assert.equal(render('823').subject, 'flask');
	assert.equal(render('704').scene, 'waveform');
	assert.equal(render('056').scene, 'cosmicMusic');
	assert.notEqual(render('056').subject, 'telescope');
	assert.equal(render('226').scene, 'threeDoors');
});

test('rozdělení skupiny, antický atom, kalendář a mocniny', () => {
	assert.equal(render('071').scene, 'division');
	assert.equal(render('108').scene, 'atomIdea');
	assert.equal(render('108').secondary, null);
	assert.equal(render('526').scene, 'calendar');
	assert.equal(render('501').scene, 'powers');
	assert.equal(render('501').secondary, 'numeralTwo');
});

test('spravedlnost, mír a víra, bakterie, kruh se čtvercem a růst cen', () => {
	assert.equal(render('727').scene, 'justice');
	assert.equal(render('727').subject, 'balance');
	assert.equal(render('482').scene, 'peaceFaith');
	assert.notEqual(render('482').scene, 'codex');
	assert.equal(render('205').scene, 'bacteria');
	assert.equal(render('800').scene, 'circleSquare');
	assert.equal(render('236').scene, 'inflation');
});

test('nové vrstvy: rozluštění, síť a volby', () => {
	// Egyptské písmo má egyptskou scénu; ostatní rozluštění zůstávají obecná.
	assert.equal(render('029').scene, 'rosetta');
	assert.equal(render('191').scene, 'decipherment');
	assert.equal(render('117').scene, 'networkScene');
	assert.equal(render('805').scene, 'ballot');
});

test('viróza ani plíseň nespustí bakteriální kolonii', () => {
	assert.notEqual(render('200').scene, 'bacteria');
	assert.notEqual(render('032').scene, 'bacteria');
});

test('propad burzy zůstává propadem, ne růstem cen', () => {
	assert.equal(render('128').scene, 'crash');
});

test('čtvrtá iterace: objekt musí odpovídat textu, ne jen kategorii', () => {
	// Moderní stát: vlajka a datum, žádná antická nádoba.
	const birth = render('746');
	assert.equal(birth.scene, 'stateBirth');
	assert.equal(birth.subject, 'flag');
	assert.notEqual(birth.subject, 'amphora');

	// Psychologický mechanismus nese pes a miska, ne ozubené kolo.
	const pavlov = render('119');
	assert.equal(pavlov.scene, 'conditioning');
	assert.equal(pavlov.subject, 'dog');
	assert.equal(pavlov.secondary, 'bowl');

	// Kočka v krabici: krychle, ne stroj s pákou.
	const cat = render('005');
	assert.equal(cat.scene, 'boxParadox');
	assert.equal(cat.subject, 'box');
	assert.notEqual(cat.scene, 'mechanism');

	// Averze ke ztrátě: váhy a mince, ne geologické vrstvy.
	const loss = render('245');
	assert.equal(loss.scene, 'lossAversion');
	assert.equal(loss.subject, 'balance');
	assert.notEqual(loss.scene, 'layers');

	// Aktanti: jedna postava v několika rolích.
	const roles = render('609');
	assert.equal(roles.scene, 'roles');
	assert.equal(roles.subject, 'figure');
});

test('čtvrtá iterace nespouští nové scény na podobných, ale jiných textech', () => {
	// Volby zůstávají volbami, i když text mluví o státu a vzniku.
	assert.equal(render('805').scene, 'ballot');
	// Psi ve vědeckém textu o domestikaci nejsou Pavlovovo podmiňování.
	assert.notEqual(render('636').scene, 'conditioning');
	// Efekt rámování zmiňuje ztrátu i zisk, ale žádné peníze.
	assert.notEqual(render('244').scene, 'lossAversion');
	// Starověký stát nemá moderní letopočet.
	const ancient = synthetic(
		'Jak vznikl starověký stát v Mezopotámii',
		'Stát vznikl kolem roku 3000 př. n. l. kolem chrámů. Státní správa potřebovala písmo a úředníky.',
		'historie'
	);
	assert.notEqual(ancient.scene, 'stateBirth');
	// Rostlina bez procesu klíčení zůstává rostlinou, ne klíčkem.
	assert.equal(render('726').subject, 'leaves');
});

test('pátá iterace: hlavní objekt příspěvku, ne náhodná okolnost', () => {
	// Warholova konzerva: plechovka v sérii, ne paleta ani metaforické zrcadlo.
	const soup = render('465');
	assert.equal(soup.scene, 'canSeries');
	assert.equal(soup.subject, 'can');
	assert.notEqual(soup.scene, 'mirrorScene');

	// Symposion: talíř s plody, ne abstraktní spojení.
	const feast = render('539');
	assert.equal(feast.scene, 'feast');
	assert.equal(feast.subject, 'plate');
	assert.equal(feast.secondary, 'fruit');

	// Egyptské písmo: stéla, pyramida a slunce.
	const egypt = render('104');
	assert.equal(egypt.scene, 'rosetta');
	assert.equal(egypt.subject, 'stele');

	// 0,999… = 1: číslice, ne mnohostěn.
	const decimal = render('818');
	assert.equal(decimal.scene, 'repeatingDecimal');
	assert.equal(decimal.subject, 'numeralZero');
	assert.equal(decimal.secondary, 'numeralNine');

	// Terakotová armáda: řady vojáků, ne obecný dav.
	const army = render('196');
	assert.equal(army.scene, 'terracottaArmy');
	assert.equal(army.subject, 'warrior');
	assert.notEqual(army.scene, 'confrontation');
});

test('pátá iterace nespouští scény na podobných, ale jiných textech', () => {
	// Zrcadlo musí být v titulku; „text zrcadlí dobu“ ani zrcadlo u pokusu
	// s perspektivou hlavním motivem není.
	assert.notEqual(render('699').scene, 'mirrorScene');
	assert.notEqual(render('858').scene, 'mirrorScene');
	assert.notEqual(render('462').scene, 'mirrorScene');
	assert.equal(render('598').scene, 'mirrorScene');

	// Hostina bez jídla a vína scénu nespustí.
	const meeting = synthetic(
		'Společné setkání odborníků',
		'Konference spojila odborníky z několika zemí. Společná debata trvala dva dny.',
		'historie'
	);
	assert.notEqual(meeting.scene, 'feast');

	// Hlína bez vojáků není terakotová armáda.
	const pottery = synthetic(
		'Hrnčířská hlína a její vlastnosti',
		'Keramická hlína se pálí při vysoké teplotě. Sochař ji tvaruje rukama.',
		'historie'
	);
	assert.notEqual(pottery.scene, 'terracottaArmy');

	// Jiné písmo bez Egypta zůstává obecným rozluštěním.
	assert.equal(render('191').scene, 'decipherment');
	const linearB = synthetic(
		'Jak se rozluštilo lineární písmo B',
		'Písmo z Knóssu rozluštil Michael Ventris. Znaky nesly slabiky, ne obrázky.',
		'historie'
	);
	assert.equal(linearB.scene, 'decipherment');

	// Jiné nekonečné řady bez 0,999… nejsou tato scéna.
	const series = synthetic(
		'Nekonečná geometrická řada',
		'Součet 1/2 + 1/4 + 1/8 se blíží jedné. Řada má nekonečně mnoho členů.',
		'matematika'
	);
	assert.notEqual(series.scene, 'repeatingDecimal');
});

test('šestá iterace: hlavní objekt nese význam a scéna zůstává jednoduchá', () => {
	// Rotující člověk, ne dalekohled ani abstraktní obrazec.
	assert.equal(render('616').scene, 'spin');
	assert.equal(render('616').subject, 'figure');

	// Placebo: dvoubarevná kapsle, ne mozek.
	assert.equal(render('093').scene, 'placebo');
	assert.equal(render('093').subject, 'pill');

	// Výroba papíru: list a čínská kulisa, ne stroj s převody.
	const paper = render('269');
	assert.equal(paper.scene, 'paper');
	assert.equal(paper.subject, 'paper');
	assert.equal(paper.culture?.key, 'china');

	// Král a listina: koruna nad svitkem, ne sloup a pergamen.
	assert.equal(render('013').scene, 'charter');
	assert.equal(render('013').subject, 'crown');

	// Vznik státu: jediná vlajka, kalendář už scénu nezahlcuje.
	const state = render('746');
	assert.equal(state.scene, 'stateBirth');
	assert.equal(state.subject, 'flag');
	assert.ok(state.elements.length <= 16, String(state.elements.length));

	// Kurýrní pošta: přerušovaná cesta a dopis, ne mapa s kompasem.
	assert.equal(render('528').scene, 'courier');
	assert.equal(render('528').subject, 'envelope');

	// Rotace Země, hurikán ani kočka nejsou rotující člověk.
	for (const id of ['217', '613', '826', '852']) {
		assert.notEqual(render(id).scene, 'spin', id);
	}

	// Papír bez výroby a technologie zůstává obecným textem, ne scénou.
	const plainPaper = synthetic(
		'Kniha na papíře',
		'Román vyšel na papíře a čtenáři si ho oblíbili.',
		'literatura'
	);
	assert.notEqual(plainPaper.scene, 'paper');

	// Král bez listiny není charta.
	const king = synthetic(
		'Král a jeho armáda',
		'Panovník vedl vojsko do bitvy a dobyl hrad.',
		'historie'
	);
	assert.notEqual(king.scene, 'charter');

	// Zpráva bez poštovních stanic není kurýrní síť.
	const message = synthetic(
		'Dopis rodině',
		'Posel přinesl zprávu a korespondence pokračovala.',
		'historie'
	);
	assert.notEqual(message.scene, 'courier');

	// Placebo bez léku nebo tablety scénu nespustí.
	const noMedicine = synthetic(
		'Placebo v psychologii',
		'Očekávání samo o sobě mění prožitek situace.',
		'psychologie'
	);
	assert.notEqual(noMedicine.scene, 'placebo');
});

test('kulturní kontext se rozpozná napříč civilizacemi, ne jen u Egypta', () => {
	// Každý profil má vlastní klíče i kresbu památky.
	assert.ok(CULTURE_KEYS.length >= 10, String(CULTURE_KEYS.length));
	for (const key of CULTURE_KEYS) {
		assert.ok(CULTURES[key].label, key);
		assert.ok(CULTURES[key].stems.length >= 3, key);
		assert.equal(typeof CULTURES[key].landmark, 'function', key);
	}

	const samples = [
		['027', 'greece'],
		['194', 'rome'],
		['196', 'china'],
		['249', 'japan'],
		['028', 'india'],
		['191', 'mesopotamia'],
		['676', 'islam'],
		['195', 'norse'],
		['104', 'egypt']
	];
	for (const [id, key] of samples) {
		assert.equal(detectCulture(post(id))?.key, key, id);
	}

	// Mezoamerika v datasetu zastoupená není, profil ale musí fungovat.
	const aztec = synthetic(
		'Tenochtitlan: město na jezeře',
		'Aztékové postavili Tenochtitlan na ostrovech jezera. Mayské a aztecké písmo se dochovalo v kodexech.',
		'historie'
	);
	assert.equal(aztec.culture?.key, 'mesoamerica');
});

test('kulturní kontext nemění scénu ani předmět a umí zůstat neutrální', () => {
	// Kulisa se přidá jen k historickému textu, scéna zůstává stejná.
	const greek = {
		id: 'synthetic-greek',
		title: 'Sókratés a dialog',
		content: 'Sókratés učil v Athénách dialogem. Athéňané ho odsoudili k smrti.',
		category: 'filozofie'
	};
	const withCulture = createGeometricIllustration({ post: greek });
	const withoutCulture = createGeometricIllustration({ post: greek, culture: false });
	assert.equal(withCulture.culture?.key, 'greece');
	assert.equal(withCulture.scene, withoutCulture.scene);
	assert.equal(withCulture.subject, withoutCulture.subject);
	assert.ok(withCulture.elements.length > withoutCulture.elements.length);

	// Moderní zmínka bez historického kontextu kulisa nedostane.
	const modern = synthetic(
		'Řecko a jeho dluhová krize',
		'Řecko v roce 2010 potřebovalo záchranný program. Dluhová krize zasáhla eurozónu.',
		'ekonomie'
	);
	assert.equal(modern.culture, null);

	// Text záměrně spojující dvě kultury zůstává bez jedné kulisy.
	assert.equal(render('813').culture, null);
	// Pouhá zmínka v zajímavosti o stromu nestačí.
	assert.equal(render('739').culture, null);
	// Obecné „dynastie“ bez Číny nejsou čínský kontext.
	assert.equal(render('678').culture, null);
});

test('sémantických scén je alespoň jeden a půl násobku původních dvaatřiceti', () => {
	assert.ok(SEMANTIC_SCENE_KEYS.length >= 63, String(SEMANTIC_SCENE_KEYS.length));
	assert.equal(new Set(SEMANTIC_SCENE_KEYS).size, SEMANTIC_SCENE_KEYS.length);
});

test('selectScene vrací null pro neutrální text bez specifické scény', () => {
	const neutral = {
		title: 'Ticho jako součást hudby',
		content: 'John Cage složil skladbu 4′33″, ve které hudebníci nehrají žádný tón.',
		category: 'umeni'
	};
	assert.equal(selectScene({ post: neutral, category: 'umeni' }), null);
});
