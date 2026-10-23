/**
 * Volba konkrétní scény podle významu textu.
 *
 * Analýza vybírá předmět (`co`), kompozice řeší vztah (`jak`). Tato vrstva
 * rozhoduje, kdy samotný předmět nestačí: požár knihovny není osamocená
 * kniha, písmo u moře není hodiny a člověk pohlcený činností není jen
 * postava. Pravidla jsou deterministická a seřazená od nejspecifičtějšího
 * významu k obecnějšímu; první shoda vyhrává.
 *
 * Každé pravidlo musí být znovupoužitelné pro celou třídu textů. Žádný klíč
 * není vázaný na konkrétní ID příspěvku.
 */

import { countHits, normalizeText, wordsOf } from '../analysis/analyze.js';

const hits = (text, stems) => countHits(wordsOf(text), stems);
const titleOf = (post) => normalizeText(post?.title ?? '');
const bodyOf = (post) => normalizeText(`${post?.title ?? ''} ${post?.content ?? ''}`);

const FIRE = ['ohen*', 'ohne*', 'ohni*', 'pozaru*', 'pozar*', 'horeni*', 'horet*', 'shor*', 'spal*', 'plamen*', 'vzplan*', 'znicen*'];
const LIBRARY = ['knihovn*', 'bibliotek*', 'archiv*', 'museion*'];
const BOOK = ['knih*', 'svitk*', 'rukopis*', 'text*'];
const SCRIPT = ['pismo*', 'pism*', 'abeced*', 'alfabet*', 'znak*', 'glyf*', 'napisu*', 'napisy*', 'napis*', 'fenick*', 'klinopis*', 'gramotnost*'];
const SHIP = ['lod*', 'plachet*', 'korab*', 'obchodnik*', 'pobrezi*', 'pristav*', 'plavb*', 'namorn*', 'moreplav*', 'flotil*'];
const MACHINE = ['stroj*', 'vynalez*', 'inovac*', 'technolog*', 'prumysl*', 'tovarn*', 'mechan*', 'motor*', 'automatiz*'];
const DECLINE = ['zanik*', 'zanikl*', 'upadek*', 'nahrad*', 'vystrid*', 'krach*', 'zkaz*', 'zastaral*', 'prekonal*'];
const FIGURE = ['clovek*', 'postava*', 'osob*', 'horolezec*', 'hudebnik*', 'programator*', 'ucitel*', 'poutnik*'];
const TIME = ['cas', 'case', 'casy', 'casu', 'casem', 'hodin*', 'hodinky*'];
const SUN = ['slunce*', 'slunci*', 'sluncem*', 'slunecni*', 'solarn*', 'heliocentr*'];
const MOON = ['mesic*', 'mesice*', 'mesici*', 'luna*', 'lunar*'];
const PLANET = ['planet*', 'planety*', 'obezn*', 'orbit*', 'drah*', 'stred*'];
const STAR = ['hvezd*', 'souhvezd*'];
const COMET = ['komet*'];
const BLACKHOLE = ['singularit*', 'horizont*', 'cernodir*'];
const TELESCOPE = ['dalekohled*', 'teleskop*', 'astronom*', 'obloh*'];
const MAP = ['mapa', 'mapu', 'mapy', 'map', 'atlas*', 'uzemi*'];
const COMPASS = ['kompas*', 'buzol*', 'navigac*', 'astrolab*', 'orientac*'];
const LOOM = ['tkani*', 'tkan*', 'tkalc*', 'tkadl*', 'textil*', 'remesl*', 'tradic*', 'latk*'];
const LABYRINTH = ['labyrint*', 'bludist*'];
const BUTTERFLY = ['motyl*', 'kukla*', 'metamorfoz*', 'promena*'];
// Botanický objekt musí být v textu výslovně; samotné „roste“ nestačí.
const SEED = ['semen*', 'klic*', 'klici*', 'vyklic*', 'sazen*', 'rostlin*', 'bylin*', 'strom*', 'kvet*'];
// Dav musí být jmenován podstatným jménem; samotné „revoluční“ je adjektivum
// a scénu pochodu neospravedlňuje.
const CROWD = ['dav*', 'demonstrac*', 'pruvod*', 'procesi*', 'povstal*', 'straz*', 'shromazd*'];
const WAR = ['valk*', 'bitv*', 'oblek*', 'utok*', 'armad*', 'dobyt*', 'bran*', 'obran*'];
const WALL = ['zed*', 'zdi*', 'barier*', 'hradb*', 'pevnost*'];
const CASTLE = ['hrad*', 'hradek*', 'tvrz*'];
const TOWER = ['vez', 'veze', 'vezi', 'vezich', 'vezi', 'vezi*'];
const TEMPLE = ['chram*', 'katedral*', 'oltar*', 'svatyne*'];
const RITUAL = ['obrad*', 'ritual*', 'oltar*', 'svick*', 'kadidl*', 'modlitb*', 'bohosluz*', 'svatek*'];
const THEATRE = ['divadl*', 'maska*', 'masky*', 'herec*', 'inscenac*', 'predstaven*'];
const FILM = ['film*', 'kino*', 'kamera*', 'reziser*'];
const LAB = ['laborator*', 'experiment*', 'pokus*', 'mikroskop*', 'bunk*', 'zavod*', 'vyzkum*'];
const CYCLE = ['cykl*', 'obdobi*', 'rocni*', 'sezona*', 'navrat*', 'presypac*', 'kyvadl*'];

/** Která nebeská tělesa text jmenuje — vrací klíče s počtem zásahů. */
function celestialMentions(text) {
	// „Sluneční soustava“ je místo, ne Slunce jako objekt; jinak by popis
	// měsíce Titanu vykreslil Slunce jen kvůli spojení „sluneční soustavy“.
	const solarPhrases = (text.match(/(?:slunecni|solarni) soustav\w*/g) || []).length;
	const sunCount = Math.max(0, hits(text, SUN) - solarPhrases);
	return [
		{ key: 'sun', count: sunCount },
		{ key: 'moon', count: hits(text, MOON) },
		{ key: 'planet', count: hits(text, PLANET) },
		{ key: 'comet', count: hits(text, COMET) + hits(text, ['kometa*']) },
		{ key: 'galaxy', count: hits(text, ['galaxi*', 'mlec* drah*']) },
		{ key: 'blackhole', count: hits(text, BLACKHOLE) },
		{ key: 'star', count: hits(text, STAR) }
	]
		.filter((entry) => entry.count > 0)
		.sort((a, b) => b.count - a.count);
}

/**
 * Vybere scénu, která lépe odpovídá významu než výchozí scéna rodiny.
 * Vrací `null`, pokud text žádnou specifickou scénu neospravedlňuje.
 *
 * @param {{
 *   post?: {title?: string, content?: string, category?: string} | null,
 *   analysis?: {subject?: string | null, family?: string, supports?: string[]} | null,
 *   family?: string,
 *   category?: string
 * }} input
 * @returns {{scene: string, subject: string | null, secondary: string | null, reason: string} | null}
 */
export function selectScene({ post, analysis, family, category } = {}) {
	if (!post) return null;
	const title = titleOf(post);
	const text = bodyOf(post);
	const categoryKey = String(category ?? post.category ?? '').toLowerCase();
	const selected = analysis?.subject ?? null;

	const fire = hits(text, FIRE);
	const library = hits(text, LIBRARY);
	const book = hits(text, BOOK);
	const figure = hits(text, FIGURE);
	const time = hits(text, TIME);
	const sun = hits(text, SUN);
	const moon = hits(text, MOON);
	const planet = hits(text, PLANET);
	const telescope = hits(text, TELESCOPE);
	const ship = hits(text, SHIP);
	const script = hits(text, SCRIPT);
	const machine = hits(text, MACHINE);
	const decline = hits(text, DECLINE);
	const lab = hits(text, LAB);

	// 1. Požár knihovny: hořící vědění musí nést knihovna i plamen.
	if (fire >= 1 && (library >= 1 || (book >= 1 && hits(title, ['knih*']) >= 1))) {
		return {
			scene: 'bookFire',
			subject: library >= 1 ? 'library' : 'book',
			secondary: 'flame',
			reason: 'scene:bookFire'
		};
	}

	// 2. Člověk a čas: postava sama nevypráví, co se s časem děje.
	if (figure >= 1 && time >= 1 && (hits(title, TIME) >= 1 || time >= 2)) {
		return { scene: 'timeFigure', subject: 'figure', secondary: 'clock', reason: 'scene:timeFigure' };
	}

	// 3. Písmo a jeho šíření: tabulka/znaky, volitelně loď obchodníků.
	if (script >= 1 && (hits(title, SCRIPT) >= 1 || script >= 2)) {
		const subject = hits(text, ['stele*', 'rosetta*', 'kamen*', 'deska*']) > hits(text, SCRIPT) ? 'stele' : 'script';
		return {
			scene: 'writing',
			subject,
			secondary: ship >= 1 ? 'ship' : 'quill',
			reason: 'scene:writing'
		};
	}

	// 4. Inovace a zánik: starý svět vedle stroje, ne kamenné trosky.
	if (machine >= 1 && decline >= 1 && (hits(title, MACHINE) >= 1 || machine >= 2)) {
		return { scene: 'disruption', subject: 'machine', secondary: 'ruin', reason: 'scene:disruption' };
	}

	// 5. Slunce v centru a planety na drahách.
	if (sun >= 1 && planet >= 1) {
		return { scene: 'solarSystem', subject: 'sun', secondary: 'planet', reason: 'scene:solarSystem' };
	}

	// 6. Plavba a obchod: loď nese význam, ne jen pozadí.
	if (ship >= 1 && (hits(title, SHIP) >= 1 || ship >= 2)) {
		return {
			scene: 'voyage',
			subject: 'ship',
			secondary: hits(text, MAP) >= 1 ? 'map' : 'compass',
			reason: 'scene:voyage'
		};
	}

	// 7. Stroj jako mechanismus, i bez slov o zániku.
	if (machine >= 1 && (hits(title, MACHINE) >= 1 || machine >= 2)) {
		return { scene: 'mechanism', subject: 'machine', secondary: 'gear', reason: 'scene:mechanism' };
	}

	// 8. Laboratoř: sklo, nástroj a zkoumání.
	if (lab >= 1 && (selected === 'flask' || selected === 'microscope' || selected === 'dna' || selected === 'atom')) {
		return { scene: 'laboratory', subject: selected, secondary: selected === 'microscope' ? 'flask' : 'microscope', reason: 'scene:laboratory' };
	}

	// 9. Divadlo: maska a jeviště. Film bez divadelních slov zůstává filmem.
	if (hits(text, THEATRE) >= 1 && ['filmy', 'umeni', 'literatura'].includes(categoryKey)) {
		return { scene: 'theatre', subject: 'mask', secondary: 'film', reason: 'scene:theatre' };
	}

	// 10. Mapa a navigace.
	if (hits(text, MAP) >= 1 && (hits(text, COMPASS) >= 1 || hits(text, ['obchod*', 'cest*', 'objev*', 'uzemi*']) >= 1)) {
		return { scene: 'mapScene', subject: 'map', secondary: 'compass', reason: 'scene:mapScene' };
	}

	// 11. Bludiště a rozhodnutí — jen když text mluví o bludišti.
	if (hits(text, LABYRINTH) >= 1) {
		return { scene: 'labyrinth', subject: 'labyrinth', secondary: 'key', reason: 'scene:labyrinth' };
	}

	// 12. Proměna: kukla a motýl, ne osamocený symbol.
	if (hits(text, BUTTERFLY) >= 1 && (hits(text, ['promena*', 'metamorfoz*', 'kukla*', 'motyl*']) >= 1)) {
		return { scene: 'metamorphosis', subject: 'butterfly', secondary: 'cocoon', reason: 'scene:metamorphosis' };
	}

	// 13. Růst: semeno → klíček → strom. Samotné semeno nestačí, musí
	//     být přítomný proces klíčení nebo růstu.
	if (hits(text, SEED) >= 1 && (hits(text, ['rust*', 'vzrust*', 'vyklic*', 'vzklice*', 'klicek*', 'kliceni*', 'sazen*']) >= 1)) {
		return { scene: 'seedGrowth', subject: 'sprout', secondary: 'tree', reason: 'scene:seedGrowth' };
	}

	// 14. Pohyb davu: pochod, revoluce, shromáždění.
	if (hits(text, CROWD) >= 1 && (hits(text, ['revoluc*', 'povstal*', 'demonstrac*', 'pruvod*', 'pochod*', 'straz*']) >= 1)) {
		return { scene: 'procession', subject: 'crowd', secondary: 'torch', reason: 'scene:procession' };
	}

	// 15. Obléhání: hradba, zbraň a tlak zvenčí.
	if ((hits(text, WALL) >= 1 || hits(text, CASTLE) >= 1) && hits(text, WAR) >= 1) {
		return {
			scene: 'siege',
			subject: hits(text, CASTLE) >= 1 ? 'castle' : 'wall',
			secondary: 'shield',
			reason: 'scene:siege'
		};
	}

	// 16. Monument: architektura a měřítko člověka.
	if ((hits(text, TOWER) >= 1 || hits(text, TEMPLE) >= 1) && categoryKey === 'historie') {
		return {
			scene: 'monument',
			subject: hits(text, TEMPLE) >= 1 ? 'temple' : 'tower',
			secondary: 'figure',
			reason: 'scene:monument'
		};
	}

	// 17. Obřad: svíčka, chrám a rituální kruh.
	if (hits(text, RITUAL) >= 1 && (selected === 'candle' || selected === 'torch' || selected === 'temple' || hits(text, ['obrad*', 'ritual*']) >= 1)) {
		return { scene: 'ritual', subject: 'candle', secondary: 'temple', reason: 'scene:ritual' };
	}

	// 18. Tkaní a tradice.
	if (hits(text, LOOM) >= 1 && (selected === 'loom' || hits(text, ['tkalc*', 'tkadl*', 'textil*', 'tkani*']) >= 1)) {
		return { scene: 'weave', subject: 'loom', secondary: 'thread', reason: 'scene:weave' };
	}

	// 19. Měření a orientace v čase i prostoru.
	if (hits(text, COMPASS) >= 1 && hits(text, ['meren*', 'meri*', 'mira*', 'presnost*', 'sirka*', 'delka*', 'uhel*']) >= 1) {
		return { scene: 'measurement', subject: 'compass', secondary: 'clock', reason: 'scene:measurement' };
	}

	// 20. Cykly a návraty.
	if (hits(text, CYCLE) >= 1 && (selected === 'cycle' || selected === 'hourglass' || hits(text, ['cykl*', 'navrat*', 'presypac*', 'kyvadl*']) >= 1)) {
		return { scene: 'orbitCycle', subject: 'cycle', secondary: 'hourglass', reason: 'scene:orbitCycle' };
	}

	// 21. Samotné nebeské těleso jako hlavní objekt má přednost před
	//     přístrojem, kterým se pozoruje.
	const titleCelestial = celestialMentions(title);
	if (titleCelestial.length > 0) {
		return {
			scene: 'celestial',
			subject: titleCelestial[0].key,
			secondary: null,
			reason: 'scene:celestial'
		};
	}

	// 22. Pozorování oblohy přístrojem, když titulek objekt nejmenuje.
	const celestial = celestialMentions(text);
	if (telescope >= 1 && celestial.length > 0) {
		return { scene: 'observatory', subject: 'telescope', secondary: celestial[0].key, reason: 'scene:observatory' };
	}

	return null;
}

export const SEMANTIC_SCENE_KEYS = [
	'bookFire',
	'timeFigure',
	'writing',
	'disruption',
	'solarSystem',
	'voyage',
	'mechanism',
	'laboratory',
	'theatre',
	'mapScene',
	'labyrinth',
	'metamorphosis',
	'seedGrowth',
	'procession',
	'siege',
	'monument',
	'ritual',
	'weave',
	'measurement',
	'orbitCycle',
	'observatory',
	'celestial'
];
