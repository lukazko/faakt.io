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
// Zrcadlo musí být v textu výslovně; „odraz“ sám je i odraz míče.
const MIRROR = ['zrcadl*'];
// Zrcadlo dalekohledu není zrcadlo člověka: u optických přístrojů scéna
// s rukama a odrazem mate, patří jim vlastní motiv.
const OPTICAL = ['teleskop*', 'dalekohled*', 'mikroskop*', 'optik*'];
const ELEPHANT = ['slon*', 'slona*', 'slonem*'];
const PARABLE = ['slep*', 'nevidom*', 'podobenstv*', 'hmat*', 'ohmatav*'];
const TAXI = ['taxi*', 'taxik*'];
const LEGAL = ['zakon*', 'zakonu*', 'zakonik*', 'pravidl*', 'pravni*', 'pravo*', 'desk*', 'ustav*'];
const COLUMN = ['sloup*', 'sloupu*', 'sloupem*'];
// Jen skutečné stroje, které komunikují; obecný „program“ nebo „test“ nestačí.
const AI = ['turing*', 'robot*', 'chatbot*', 'umely*', 'umela*'];
const AI_TEST = ['test*', 'konverzac*', 'mluv*', 'otazk*', 'napodob*', 'odpov*'];
const CRASH = ['burz*', 'akcie*', 'akcii*', 'akciovy*', 'krach*', 'propad*'];
const DIGIT = ['benford*', 'cislic*', 'cislice*'];
const DIGIT_CONTEXT = ['rozdelen*', 'procent*', 'zacina*', 'cetnost*', 'pravdepodob*'];
// „uspořádat“ není komprese; úspora musí být přesné slovo, ne prefix.
const COMPRESSION = ['kompres*', 'huffman*', 'kodovan*', 'zkrat*', 'zmensen*', 'uspora', 'uspory', 'usporu', 'usporne'];
const COMPRESSION_CORE = ['kompres*', 'huffman*', 'kodovan*'];
const RESPONSE = ['reag*', 'ocekavan*', 'chovan*', 'reakc*', 'prizpusob*'];
const SPACE_CRAFT = /vesmirn\w* (lod|plavidl|korab)|hvezdolet|starship/;

// --- Iterace 3: konkrétní obrazy z feedbacku -------------------------------
const GOLD = ['zlato*', 'zlata*', 'zlate*', 'zlatem*', 'zlaty*', 'zlatou*', 'zlatych*'];
const ACID = ['kyselin*', 'lucavk*', 'rozpoust*', 'rozpust*'];
const MUSIC = ['hudb*', 'hudeb*', 'ton*', 'strun*', 'harmoni*', 'not*', 'melodi*', 'rytmu*'];
const SPACE = ['vesmir*', 'kosm*', 'planet*', 'hvezd*', 'sfer*'];
const DOORS = ['dver*'];
const CHOICE = ['pravdepodob*', 'sanc*', 'zmen*', 'volb*'];
const DIVISION = ['rozdelen*', 'rozdeli*', 'rozdelit*'];
const ROLES = ['skupin*', 'vezn*', 'dozorc*', 'roli*', 'role*', 'student*', 'experiment*'];
const ATOM_ANCIENT = ['demokrit*', 'antick*', 'reck*', 'predsokrat*', 'atomist*', 'epikur*', 'lucreti*'];
const CALENDAR = ['kalendar*', 'prestupn*', 'julian*', 'gregorian*'];
const POWER = ['mocnin*'];
const POWER_CONTEXT = ['imaginarn*', 'komplexn*', 'druha', 'druhou', 'druhe', 'druheho'];
const JUSTICE = ['spravedln*', 'spravedliv*'];
const POWER_WORDS = ['sil*', 'slab*', 'moc*', 'rovn*'];
// „mír“ musí být přesné slovo; prefix „mir*“ by chytil i „míru“ nebo „mírně“.
const PEACE = ['mir', 'miru', 'mirem', 'miry', 'mirova*', 'mirove*', 'mirov*'];
const FAITH = ['vira*', 'vire*', 'viru*', 'viry*', 'nabozen*', 'krestan*', 'katolic*', 'protestant*', 'cirkv*'];
// Bakterie musí být v textu výslovně dvakrát; pandemie viru ani plíseň
// nestačí. Houby a kvasinky mají vlastní podobu, ne bakteriální kolonii.
const BACTERIA = ['bakteri*', 'mikrob*'];
const CIRCLE = ['kruh*', 'kruhu*', 'kruhem*', 'kruzn*'];
const SQUARE = ['ctverc*', 'ctver*'];
const PRICE = ['cena*', 'ceny*', 'cenu*', 'cenou*', 'cenach*', 'cenami*', 'zdraz*', 'inflac*'];
const RISING = ['rust*', 'rost*', 'stoup*', 'zvys*', 'zdraz*', 'inflac*', 'bublina*'];
const DECIPHER = ['rosetta*', 'hieroglyf*', 'rozlust*', 'desifr*', 'klinopis*'];
const NETWORK = ['sit', 'site', 'siti', 'sitich', 'sitemi', 'sitovy*', 'neuron*', 'internet*', 'propoj*', 'uzl*'];
const ELECTION = ['volb*', 'volic*', 'hlasovan*', 'referend*', 'zvole*', 'kandid*', 'mandat*'];

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

	// 0. Zrcadlo: text řeší odraz, ne knihu.
	if (hits(text, MIRROR) >= 1 && hits(text, OPTICAL) === 0) {
		return { scene: 'mirrorScene', subject: 'mirror', secondary: 'hand', reason: 'scene:mirrorScene' };
	}

	// 0b. Podobenství o slepcích a slonovi. Slon bez podobenství zůstane
	//     slonem (např. Hannibalovy válečné slony), ale scéna s rukama ne.
	if (hits(text, ELEPHANT) >= 1 && hits(text, PARABLE) >= 1) {
		return { scene: 'parable', subject: 'elephant', secondary: 'hand', reason: 'scene:parable' };
	}

	// 0c. Taxík: konkrétní auto, ne abstraktní mnohostěn.
	if (hits(text, TAXI) >= 1) {
		return { scene: 'taxi', subject: 'car', secondary: null, reason: 'scene:taxi' };
	}

	// 0d. Stroj, který komunikuje: jeden stroj a signál, ne zánik světa.
	if (
		hits(text, AI) >= 1 &&
		hits(text, AI_TEST) >= 1 &&
		['pocitacove-vedy', 'veda', 'filozofie'].includes(categoryKey)
	) {
		return { scene: 'artificial', subject: 'machine', secondary: null, reason: 'scene:artificial' };
	}

	// 0e. Vesmírná loď není plachetnice.
	if (SPACE_CRAFT.test(text)) {
		return { scene: 'spacecraft', subject: 'rocket', secondary: null, reason: 'scene:spacecraft' };
	}

	// 0f. Zlato a kyselina: baňka a jantarová kapka, ne koruna.
	if (
		hits(text, ACID) >= 1 &&
		hits(text, GOLD) >= 1 &&
		['veda', 'fyzika', 'chemie'].includes(categoryKey)
	) {
		return { scene: 'alchemy', subject: 'flask', secondary: null, reason: 'scene:alchemy' };
	}

	// 0g. Pravidelná symetrie a zachování: spojitá vlna, ne mnohostěn.
	if (
		['fyzika', 'veda'].includes(categoryKey) &&
		hits(text, ['symetri*']) >= 1 &&
		hits(text, ['zachovan*']) >= 1
	) {
		return { scene: 'waveform', subject: 'cycle', secondary: null, reason: 'scene:waveform' };
	}

	// 0h. Vesmír jako hudba: planeta a nota, ne dalekohled.
	if (hits(text, MUSIC) >= 2 && hits(text, SPACE) >= 1) {
		return { scene: 'cosmicMusic', subject: 'planet', secondary: null, reason: 'scene:cosmicMusic' };
	}

	// 0i. Tři dveře: volba a pravděpodobnost, ne abstraktní vrstvy.
	if (hits(text, DOORS) >= 2 && hits(text, CHOICE) >= 1) {
		return { scene: 'threeDoors', subject: 'car', secondary: null, reason: 'scene:threeDoors' };
	}

	// 0j. Rozdělení skupiny na role: postavy a hranice.
	if (
		hits(text, DIVISION) >= 1 &&
		hits(text, ROLES) >= 2 &&
		['psychologie', 'historie', 'politika', 'veda'].includes(categoryKey)
	) {
		return { scene: 'division', subject: 'figure', secondary: null, reason: 'scene:division' };
	}

	// 0k. Antická myšlenka atomu: jeden atom, žádný mikroskop.
	if (
		hits(text, ['atom*']) >= 1 &&
		['filozofie', 'historie'].includes(categoryKey) &&
		hits(text, ATOM_ANCIENT) >= 1
	) {
		return { scene: 'atomIdea', subject: 'atom', secondary: null, reason: 'scene:atomIdea' };
	}

	// 0l. Kalendář: mřížka dnů a přestupný den, ne přesýpací hodiny.
	if (
		hits(text, CALENDAR) >= 2 &&
		['historie', 'astronomie', 'veda'].includes(categoryKey)
	) {
		return { scene: 'calendar', subject: 'cycle', secondary: null, reason: 'scene:calendar' };
	}

	// 0m. Mocniny a imaginární čísla: číslice s exponentem.
	if (
		categoryKey === 'matematika' &&
		hits(text, POWER) >= 1 &&
		hits(text, POWER_CONTEXT) >= 1
	) {
		return { scene: 'powers', subject: 'numeralOne', secondary: 'numeralTwo', reason: 'scene:powers' };
	}

	// 0n. Spravedlnost mezi silným a slabým: jediné váhy.
	if (
		hits(text, JUSTICE) >= 1 &&
		hits(text, POWER_WORDS) >= 2 &&
		['politika', 'filozofie', 'historie'].includes(categoryKey)
	) {
		return { scene: 'justice', subject: 'balance', secondary: null, reason: 'scene:justice' };
	}

	// 0o. Mír a víra: holubice a kříž. Tato scéna musí být před zákoníkem,
	//     protože mírové smlouvy obsahují právní slova.
	if (
		hits(text, PEACE) >= 1 &&
		hits(text, FAITH) >= 2 &&
		['politika', 'historie'].includes(categoryKey)
	) {
		return { scene: 'peaceFaith', subject: 'bird', secondary: null, reason: 'scene:peaceFaith' };
	}

	// 0p. Bakterie: kolonie v kruhu, ne osamocený mikroskop.
	if (
		hits(text, BACTERIA) >= 2 &&
		hits(text, ['plisen*', 'houb*', 'kvasink*']) === 0 &&
		['veda', 'zajimavost', 'historie'].includes(categoryKey)
	) {
		return { scene: 'bacteria', subject: 'bacterium', secondary: null, reason: 'scene:bacteria' };
	}

	// 0q. Kruh a čtverec: dva geometrické ideály, ne vlny.
	if (hits(text, CIRCLE) >= 1 && hits(text, SQUARE) >= 1) {
		return { scene: 'circleSquare', subject: 'figure', secondary: null, reason: 'scene:circleSquare' };
	}

	// 0r. Růst cen: stoupající křivka a sloupce.
	if (
		categoryKey === 'ekonomie' &&
		hits(text, CRASH) < 2 &&
		(hits(text, ['inflac*', 'zdraz*', 'bublina*']) >= 1 ||
			(hits(text, PRICE) >= 2 && hits(text, RISING) >= 1))
	) {
		return { scene: 'inflation', subject: 'balance', secondary: null, reason: 'scene:inflation' };
	}

	// 0s. Rozluštění písma: stélé a dvě kolony znaků. Musí být před obecným
	//     písmem, jinak Rosettská deska skončí jako tabulka s perem.
	if (hits(text, DECIPHER) >= 1 && hits(text, SCRIPT) >= 1) {
		const stele = hits(text, ['stele*', 'deska*', 'kamen*', 'rosetta*']) >= 1;
		return { scene: 'decipherment', subject: stele ? 'stele' : 'script', secondary: null, reason: 'scene:decipherment' };
	}

	// 0t. Síť uzlů a spojnic: internet, neurony, propojené systémy.
	if (
		['pocitacove-vedy', 'veda', 'filozofie'].includes(categoryKey) &&
		hits(text, NETWORK) >= 2
	) {
		const subject = hits(text, ['neuron*']) >= 1 ? 'brain' : 'machine';
		return { scene: 'networkScene', subject, secondary: null, reason: 'scene:networkScene' };
	}

	// 0u. Volby: urna a hlasovací lístek.
	if (
		['politika', 'historie'].includes(categoryKey) &&
		hits(text, ELECTION) >= 2
	) {
		return { scene: 'ballot', subject: 'crowd', secondary: null, reason: 'scene:ballot' };
	}

	// 0v. Zákoník: právní text s antickým sloupem a pergamenem.
	//     Rosettská deska je kámen s písmem, ne zákoník.
	const legal = hits(text, LEGAL);
	const rosetta = /rosetta|hieroglyf/.test(text) || selected === 'stele';
	if (legal >= 2 && ['historie', 'politika'].includes(categoryKey) && !rosetta) {
		const columnMentioned = hits(text, COLUMN) >= 1;
		return {
			scene: 'codex',
			subject: columnMentioned ? 'column' : 'scroll',
			secondary: columnMentioned ? 'scroll' : 'column',
			reason: 'scene:codex'
		};
	}

	// 0w. Burzovní propad: křivka dolů, ne geologické vrstvy.
	if (hits(text, CRASH) >= 2 && ['ekonomie', 'politika'].includes(categoryKey)) {
		return { scene: 'crash', subject: 'chart', secondary: null, reason: 'scene:crash' };
	}

	// 0x. Rozdělení prvních číslic: jednička a sloupce četností.
	if (
		hits(text, DIGIT) >= 1 &&
		(hits(text, DIGIT_CONTEXT) >= 1 || categoryKey === 'matematika') &&
		(hits(text, ['benford*']) >= 1 || hits(title, DIGIT) >= 1)
	) {
		return { scene: 'digits', subject: 'numeralOne', secondary: null, reason: 'scene:digits' };
	}

	// 0y. Komprese: velký objekt se zmenší, nezobrazuje se písmo.
	//     „Zkrátil válku“ ani „uspořádal prvky“ není komprese.
	if (
		hits(text, COMPRESSION_CORE) >= 1 &&
		hits(text, COMPRESSION) >= 2 &&
		['pocitacove-vedy', 'veda', 'matematika'].includes(categoryKey)
	) {
		return { scene: 'compression', subject: 'polyhedron', secondary: null, reason: 'scene:compression' };
	}

	// 0z. Reakce na pravidla: lidé a zpětná vazba, ne abstraktní vrstvy.
	if (
		hits(text, RESPONSE) >= 2 &&
		['ekonomie', 'politika'].includes(categoryKey)
	) {
		return { scene: 'response', subject: 'crowd', secondary: null, reason: 'scene:response' };
	}

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
	'celestial',
	'mirrorScene',
	'parable',
	'codex',
	'response',
	'digits',
	'crash',
	'compression',
	'spacecraft',
	'artificial',
	'taxi',
	'alchemy',
	'waveform',
	'cosmicMusic',
	'threeDoors',
	'division',
	'atomIdea',
	'calendar',
	'powers',
	'justice',
	'peaceFaith',
	'bacteria',
	'circleSquare',
	'inflation',
	'decipherment',
	'networkScene',
	'ballot'
];
