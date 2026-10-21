/**
 * Analýza příspěvku a volba kompozice.
 *
 * Pořadí je záměrně pevné:
 *   1. text → normalizovaná slova (bez diakritiky, HTML pryč),
 *   2. skóre sémantických motivů (název má větší váhu než obsah),
 *   3. volba jedné hlavní kompozice podle motivu a vztahu ke kategorii,
 *   4. doplňkové motivy, které daná kompozice umí pojmout,
 *   5. fallback: chronologie → kategorie → bezpečná abstrakce.
 *
 * Kategorie sama nikdy nerozhoduje o konkrétním předmětu, pokud text nabízí
 * silnější sémantický signál. Slouží jen jako vodítko a jako záchranná síť.
 */

import { MOTIFS, MOTIF_BY_KEY } from './motifs.js';

const FALLBACK_SELECTION = {
	family: 'structure',
	subject: null,
	supports: [],
	concept: null,
	reason: 'fallback-structure'
};

/** Pořadí rodin, když se nedaří rozhodnout podle kategorie. */
export const FAMILY_CATEGORY_AFFINITY = {
	storybook: { literatura: 3, filmy: 1.5, historie: 1, umeni: 0.5 },
	portrait: { filozofie: 3, psychologie: 1.5, historie: 1, umeni: 1, politika: 0.5 },
	discovery: { veda: 3, fyzika: 3, astronomie: 3, zajimavost: 1.5, 'pocitacove-vedy': 1 },
	relic: { historie: 3, politika: 2, umeni: 1.5, literatura: 0.5 },
	nature: { zajimavost: 3, veda: 2, astronomie: 0.5 },
	metaphor: {
		matematika: 3,
		ekonomie: 3,
		psychologie: 2.5,
		filmy: 3,
		umeni: 3,
		fyzika: 2,
		'pocitacove-vedy': 2.5,
		filozofie: 1.5,
		literatura: 0.5,
		historie: 0.5,
		politika: 0.5,
		veda: 0.5,
		astronomie: 0.5,
		zajimavost: 0.5
	},
	flame: { fyzika: 2, veda: 1.5, historie: 1.5, filozofie: 1, umeni: 0.5 },
	storm: { fyzika: 2.5, astronomie: 1, zajimavost: 1.5, veda: 1 },
	celestial: { astronomie: 3, fyzika: 1.5, filozofie: 0.5, zajimavost: 1 },
	bloom: { zajimavost: 2, veda: 1.5, umeni: 1.5, literatura: 0.5 },
	undergrowth: { zajimavost: 2, veda: 1.5, umeni: 0.5 },
	canopy: { zajimavost: 2, veda: 1, literatura: 1, umeni: 0.5 },
	peak: { zajimavost: 2, veda: 1.5, historie: 0.5 },
	snowfield: { zajimavost: 3, veda: 2, astronomie: 0.5 },
	clash: { historie: 2, politika: 1.5, literatura: 1, filmy: 1, umeni: 0.5 },
	rupture: { psychologie: 1.5, politika: 1.5, fyzika: 1, filozofie: 1, historie: 0.5 },
	armory: { historie: 2.5, umeni: 1, literatura: 0.5 },
	crowd: { politika: 2, psychologie: 1.5, historie: 1, umeni: 0.5 },
	gaze: { psychologie: 2, filozofie: 1, umeni: 1.5, literatura: 0.5 },
	heart: { psychologie: 2.5, umeni: 1, literatura: 1, filozofie: 0.5 },
	labyrinth: { filozofie: 2, psychologie: 1.5, matematika: 1, literatura: 0.5 },
	knot: { filozofie: 1.5, psychologie: 1, matematika: 1, veda: 0.5 },
	hourglass: { filozofie: 1.5, historie: 1, fyzika: 1, matematika: 0.5 },
	cycle: { filozofie: 2, astronomie: 1, veda: 1, zajimavost: 0.5 },
	decay: { historie: 2, umeni: 1.5, filozofie: 1, zajimavost: 0.5 },
	growth: { veda: 2, zajimavost: 1.5, ekonomie: 1, psychologie: 0.5 },
	transformation: { psychologie: 1.5, veda: 1, umeni: 1.5, literatura: 1, filmy: 0.5 },
	throne: { politika: 2.5, historie: 2, filozofie: 0.5, umeni: 0.5 },
	temple: { historie: 2, umeni: 1.5, filozofie: 1, politika: 0.5 },
	ritual: { historie: 1.5, filozofie: 1.5, umeni: 1, literatura: 0.5 },
	silhouette: { filozofie: 1.5, psychologie: 1.5, umeni: 1, politika: 1 }
};

/** Když text nic neprozradí, sáhne se po tomto tématu kategorie. */
export const CATEGORY_FALLBACK = {
	historie: { family: 'relic', subject: 'amphora' },
	politika: { family: 'relic', subject: 'lawScroll' },
	umeni: { family: 'metaphor', subject: 'palette' },
	literatura: { family: 'storybook', subject: 'book' },
	filozofie: { family: 'portrait', subject: 'bust' },
	psychologie: { family: 'metaphor', subject: 'brain' },
	filmy: { family: 'metaphor', subject: 'film' },
	matematika: { family: 'metaphor', subject: 'polyhedron' },
	ekonomie: { family: 'metaphor', subject: 'balance' },
	fyzika: { family: 'discovery', subject: 'atom' },
	astronomie: { family: 'discovery', subject: 'planet' },
	veda: { family: 'discovery', subject: 'flask' },
	zajimavost: { family: 'nature', subject: 'tree' },
	'pocitacove-vedy': { family: 'metaphor', subject: 'gear' }
};

/**
 * Explicitní chronologie. Používá se jen tehdy, když text opravdu mluví
 * o sledu událostí — samotný letopočet v obsahu nestačí.
 */
/** Časové markery — samy o sobě dovolují časovou osu. */
const CHRONOLOGY_TIME_TAGS = [
	'rok*', 'roce*', 'roku*', 'letech*', 'stoleti*', 'století*', 'obdobi*', 'období*',
	'era', 'eru', 'starovek*', 'stredovek*', 'novovek*', 'antika*', 'dynastie*',
	'vladl*', 'vládl*', 'nasledoval*', 'následoval*'
];

/** Události — samy o sobě ještě neznamenají sled událostí. */
const CHRONOLOGY_EVENT_TAGS = [
	'valk*', 'valecn*', 'bitva*', 'bitve*', 'revoluc*', 'zalozen*', 'založení*',
	'vznik*', 'vzniku*', 'podepsan*', 'podepsán*', 'vyhlasen*', 'vyhlášen*'
];

const CHRONOLOGY_TAGS = [...CHRONOLOGY_TIME_TAGS, ...CHRONOLOGY_EVENT_TAGS];

/**
 * Abstraktní rodiny pro texty bez konkrétního předmětu (sítě, vlny, vrstvy,
 * města…). Nepoužívají se podle kategorie, ale jen když je text zmíní
 * dostatečně silně. `timeline` tu záměrně není — ta patří jen chronologii.
 */
const ABSTRACT_TAGS = {
	network: ['sit', 'site', 'siti', 'neuron*', 'algoritm*', 'internet*', 'propojen*', 'vztah*', 'komunikac*', 'social*', 'web*', 'umele*', 'inteligen*', 'uzel*', 'uzly', 'splet*'],
	signals: ['vln*', 'signal*', 'frekven*', 'zvuk*', 'svetl*', 'elektromagnet*', 'radio*', 'optik*', 'rezonanc*', 'kmit*', 'foton*', 'laser*', 'akustik*', 'spektr*'],
	layers: ['vrstv*', 'geolog*', 'atmosfer*', 'klima*', 'puda*', 'půda*', 'zemetresen*', 'hornin*', 'fosil*', 'sediment*', 'ekosystem*', 'podzemi*', 'ocean*', 'krusta*', 'kůra*'],
	structure: ['mesto*', 'město*', 'most*', 'budov*', 'infrastruktur*', 'mrakodrap*', 'institu*', 'stat*', 'organizac*', 'zelezn*', 'železn*', 'silnic*', 'katedral*', 'hrad*'],
	contrast: ['naopak*', 'paradox*', 'protiklad*', 'rozdil*', 'rozdíl*', 'srovnan*', 'srovnán*', 'kontrast*', 'dilema*', 'versus*', 'rozpor*', 'spor*', 'debat*', 'protichud*'],
	organic: ['bunk*', 'dna', 'rostlin*', 'ekosystem*', 'zivocich*', 'živočich*', 'evoluc*', 'biolog*', 'prirod*', 'přírod*', 'druh*', 'organismus*', 'krev*', 'mozek*', 'semen*', 'list*', 'koren*', 'kořen*', 'vir*', 'bakteri*', 'zvirat*', 'zvířat*'],
	data: ['data', 'statistik*', 'rust*', 'růst*', 'hdp', 'inflac*', 'trh*', 'ekonom*', 'cisl*', 'čísl*', 'procent*', 'meren*', 'měřen*', 'vyzkum*', 'výzkum*', 'graf*', 'trend*', 'poptav*', 'poptáv*', 'urok*', 'úrok*', 'dane*', 'daně*'],
	grid: ['design*', 'tvar*', 'kompozic*', 'geometri*', 'mriz*', 'mříž*', 'architektur*', 'malir*', 'malíř*', 'obraz*', 'soch*', 'umeni*', 'umění*', 'typograf*', 'barv*', 'perspektiv*'],
	orbit: ['vesmir*', 'vesmír*', 'planet*', 'hvezd*', 'hvězd*', 'orbit*', 'slunce*', 'mesic*', 'měsíc*', 'galaxi*', 'astronom*', 'dalekohled*', 'kosm*', 'raket*', 'atom*', 'molekul*', 'drah*'],
	radial: ['vybuch*', 'výbuch*', 'exploz*', 'energie*', 'osln*', 'naraz*', 'náraz*', 'sok*', 'šok*'],
	spiral: ['spiral*', 'spirál*', 'soustred*', 'soustřed*', 'posedlost*', 'obses*', 'smycka*', 'smyčk*'],
	threshold: ['prah*', 'práh*', 'brana*', 'brána*', 'branou*', 'portal*', 'portál*', 'prechod*', 'přechod*', 'rozhodn*', 'vstup*', 'hranic*'],
	ascent: ['vzestup*', 'stoup*', 'pokrok*', 'ambic*', 'hierarch*', 'schod*', 'vystup*', 'výstup*', 'karier*'],
	descent: ['sestup*', 'pad*', 'pád*', 'upadek*', 'úpadek*', 'krize*', 'kriz*', 'zhrouc*', 'propad*', 'pokles*', 'ztrat*', 'ztrát*'],
	waves: ['tok*', 'proud*', 'rytmus*', 'rytm*', 'more*', 'moře*', 'ocean*', 'vlnen*', 'vlnění*'],
	scatter: ['chaos*', 'rozptyl*', 'fragment*', 'castic*', 'částic*', 'neusporadan*', 'neuspořádan*', 'nahod*', 'náhod*', 'zmatek*'],
	convergence: ['konvergen*', 'sjednocen*', 'fokus*', 'zameren*', 'zaměřen*', 'pritah*', 'přitah*', 'centrum*', 'stred*', 'střed*', 'sbih*', 'sbíh*'],
	divergence: ['rozdelen*', 'rozdělen*', 'rozcesti*', 'rozcestí*', 'vetven*', 'větven*', 'odboch*', 'odbočk*', 'alternativ*', 'dusled*', 'důsled*', 'volba*', 'volbu*'],
	lattice: ['mriz*', 'mříž*', 'pravidl*', 'system*', 'systém*', 'logik*', 'kod*', 'kód*', 'tabulk*', 'tabular*'],
	fracture: ['prasklin*', 'trhlin*', 'zlom*', 'konflikt*', 'trauma*', 'rozpolc*', 'napeti*', 'napětí*'],
	pulse: ['pulz*', 'tep*', 'tepu*', 'srdecni*', 'srdeční*', 'rytmus*', 'rytm*', 'signal*', 'signál*', 'vlneni*', 'vlnění*'],
	meander: ['cesta*', 'cestu*', 'putovan*', 'putování*', 'reka*', 'řeka*', 'vyvoj*', 'vývoj*', 'dejin*', 'dějin*', 'pout*'],
	constellation: ['souhvezd*', 'souhvězd*', 'hvezdy*', 'hvězdy*', 'orientac*', 'vzorec*', 'vzor*', 'mytus*', 'mýtus*', 'navigac*'],
	monolith: ['monolit*', 'pomnik*', 'pomník*', 'institu*', 'moc*', 'moci*', 'autorita*', 'barier*', 'zed*', 'zeď*'],
	arch: ['oblouk*', 'klenb*', 'most*', 'architektur*', 'akvadukt*', 'katedral*'],
	mosaic: ['mozaik*', 'rozmanit*', 'skladba*', 'kultura*', 'kulturn*', 'smes*', 'směs*', 'pluralit*'],
	pendulum: ['kyvadl*', 'oscilac*', 'kyv*', 'period*'],
	echo: ['ozven*', 'ozvěn*', 'pamet*', 'paměť*', 'vliv*', 'sireni*', 'šíření*', 'opakov*'],
	mirror: ['zrcadl*', 'odraz*', 'dualit*', 'symetri*', 'protiklad*', 'identit*'],
	cascade: ['kaskad*', 'dominov*', 'retez*', 'řetěz*', 'zhroucen*', 'zhroucení*', 'lavin*'],
	horizon: ['obzor*', 'horizont*', 'krajin*', 'perspektiv*', 'dalka*', 'dálka*', 'rozsah*'],
	weave: ['tkanin*', 'tkani*', 'tkaní*', 'proplet*', 'tradic*', 'kulturn*'],
	vortex: ['vireni*', 'víření*', 'pohlt*', 'pohlc*', 'tornad*', 'smrst*', 'smršt*']
};

const NORMALIZED_ABSTRACT = Object.entries(ABSTRACT_TAGS).map(([family, tags]) => ({
	family,
	tags: tags.map(normalizeStem)
}));

const SUBJECT_ROLES = new Set(['subject', 'both']);
const SUPPORT_ROLES = new Set(['support', 'both']);

/** Malá česká stoplistová sada — neočekává se, že by se objevila v názvech. */
const STOP_WORDS = new Set([
	'jeho',
	'jeji',
	'její',
	'jejich',
	'ktery',
	'který',
	'ktera',
	'která',
	'které',
	'jako',
	'podle',
	'mezi',
	'nejen',
	'proto',
	'protoze',
	'protože',
	'vsak',
	'avšak',
	'byly',
	'být',
	'bylo',
	'byla',
	'jsou',
	'jsme'
]);

/**
 * Normalizace pro porovnávání: HTML pryč, diakritika pryč, malá písmena.
 * @param {unknown} value
 */
export function normalizeText(value) {
	return String(value ?? '')
		.replace(/<[^>]*>/g, ' ')
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();
}

/** Slova bez duplicit — opakování stejného slova nemá zvyšovat skóre. */
export function wordsOf(value) {
	return [...new Set(normalizeText(value).split(' ').filter((word) => word.length > 1 && !STOP_WORDS.has(word)))];
}

function normalizeStem(stem) {
	const prefix = String(stem).trim().endsWith('*');
	const base = normalizeText(String(stem).replace(/\*+$/, '')).replace(/\s+/g, '');
	return prefix ? `${base}*` : base;
}

function stemMatches(word, stem) {
	if (!stem) return false;
	if (stem.endsWith('*')) return word.startsWith(stem.slice(0, -1));
	return word === stem;
}

/**
 * Kolik různých slov odpovídá některému z kmenů.
 * @param {string[]} words
 * @param {string[]} stems
 */
export function countHits(words, stems) {
	let hits = 0;
	for (const word of words) {
		if (stems.some((stem) => stemMatches(word, stem))) hits += 1;
	}
	return hits;
}

const NORMALIZED_MOTIFS = MOTIFS.map((motif, index) => ({
	...motif,
	index,
	tags: motif.tags.map(normalizeStem),
	categories: motif.categories || {}
}));

const NORMALIZED_CHRONOLOGY = CHRONOLOGY_TAGS.map(normalizeStem);
const NORMALIZED_TIME = CHRONOLOGY_TIME_TAGS.map(normalizeStem);

function normalizeCategory(category) {
	return typeof category === 'string' ? category.trim().toLowerCase() : '';
}

/**
 * Skóre všech sémantických motivů pro jeden příspěvek.
 * Název nese hlavní signál; obsah jen potvrzuje a doplňuje.
 * @param {{title?: string, content?: string, category?: string}} post
 */
export function scoreMotifs(post) {
	const category = normalizeCategory(post?.category);
	const titleWords = wordsOf(post?.title);
	const contentWords = wordsOf(post?.content);

	return NORMALIZED_MOTIFS.map((motif) => {
		const titleHits = countHits(titleWords, motif.tags);
		const contentHits = countHits(contentWords, motif.tags);
		const affinity = motif.categories[category] || 0;
		const score = titleHits * 5 + Math.min(contentHits, 4) * 1.2 + Math.min(affinity, 3) * 0.35;
		return { motif, titleHits, contentHits, affinity, score };
	}).sort((a, b) => {
		if (b.score !== a.score) return b.score - a.score;
		const aSubject = SUBJECT_ROLES.has(a.motif.role) ? 1 : 0;
		const bSubject = SUBJECT_ROLES.has(b.motif.role) ? 1 : 0;
		if (bSubject !== aSubject) return bSubject - aSubject;
		return a.motif.index - b.motif.index;
	});
}

function familyAffinity(family, category) {
	return FAMILY_CATEGORY_AFFINITY[family]?.[category] || 0;
}

/** Vybere rodinu, kterou motiv podporuje a která nejlépe sedí kategorii. */
function chooseFamily(motif, category) {
	const options = motif.families || [];
	if (options.length === 0) return null;
	return [...options].sort((a, b) => {
		const diff = familyAffinity(b, category) - familyAffinity(a, category);
		if (diff !== 0) return diff;
		return options.indexOf(a) - options.indexOf(b);
	})[0];
}

/** Explicitní chronologie — jen když je v textu skutečně silná. */
export function detectChronology(post) {
	const category = normalizeCategory(post?.category);
	const titleWords = wordsOf(post?.title);
	const contentWords = wordsOf(post?.content);
	const titleHits = countHits(titleWords, NORMALIZED_CHRONOLOGY);
	const titleTimeHits = countHits(titleWords, NORMALIZED_TIME);
	const contentHits = countHits(contentWords, NORMALIZED_CHRONOLOGY);
	const contentTimeHits = countHits(contentWords, NORMALIZED_TIME);
	const yearInTitle = /\d{3,4}/.test(String(post?.title ?? ''));

	// Samotné slovo „válka“ nebo „vznik“ ještě časovou osu neospravedlní.
	if (titleTimeHits >= 1) return { strong: true, titleHits, contentHits, reason: 'title-time' };
	if (yearInTitle && (titleHits >= 1 || contentHits >= 1 || contentTimeHits >= 1)) {
		return { strong: true, titleHits, contentHits, reason: 'title-year' };
	}
	if (
		// Bez signálu v titulku jde obvykle o pojem, ne o sled událostí.
		titleHits >= 1 &&
		contentHits >= 3 &&
		contentTimeHits >= 1 &&
		['historie', 'politika', 'filozofie', 'literatura'].includes(category)
	) {
		return { strong: true, titleHits, contentHits, reason: 'content-sequence' };
	}
	return { strong: false, titleHits, contentHits, reason: 'none' };
}

/**
 * Hlavní vstup: z příspěvku udělá rozhodnutí o ilustraci.
 * Nikdy nevyhazuje — nerozpoznaný vstup skončí v bezpečné abstrakci.
 *
 * @param {{title?: string, content?: string, category?: string} | null | undefined} post
 * @returns {{
 *   family: string,
 *   subject: string | null,
 *   supports: string[],
 *   concept: string | null,
 *   reason: string,
 *   scores: Array<{key: string, score: number, titleHits: number, contentHits: number}>
 * }}
 */
export function analyzePost(post) {
	if (!post || typeof post !== 'object') {
		return { ...FALLBACK_SELECTION, scores: [] };
	}

	const category = normalizeCategory(post.category);
	const ranked = scoreMotifs(post);
	const scores = ranked.map((entry) => ({
		key: entry.motif.key,
		score: Math.round(entry.score * 100) / 100,
		titleHits: entry.titleHits,
		contentHits: entry.contentHits
	}));

	const best = ranked.find(
		(entry) => SUBJECT_ROLES.has(entry.motif.role) && entry.score >= 2.5
	);

	if (best) {
		const family = chooseFamily(best.motif, category);
		if (family) {
			// Doplňky: jiné motivy se stejným rodinným zařazením, max. tři.
			// Motiv může doplňky zakázat (`maxSupports: 0`) — třeba u hlavního
			// objektu, který má stát sám.
			const supportLimit = best.motif.maxSupports ?? 2;
			const supports = ranked
				.filter(
					(entry) =>
						entry.motif.key !== best.motif.key &&
						entry.score >= 1.2 &&
						SUPPORT_ROLES.has(entry.motif.role) &&
						entry.motif.families.includes(family)
				)
				.slice(0, supportLimit)
				.map((entry) => entry.motif.key);

			return {
				family,
				subject: best.motif.key,
				supports,
				concept: best.motif.key,
				reason: `semantic:${best.motif.key}`,
				scores
			};
		}
	}

	const chronology = detectChronology(post);
	if (chronology.strong) {
		return {
			family: 'timeline',
			subject: null,
			supports: [],
			concept: 'chronology',
			reason: `chronology:${chronology.reason}`,
			scores
		};
	}

	// Abstraktní texty bez konkrétního objektu: síť, vlny, vrstvy, město…
	const titleWords = wordsOf(post.title);
	const contentWords = wordsOf(post.content);
	let abstractBest = null;
	for (const entry of NORMALIZED_ABSTRACT) {
		const titleHits = countHits(titleWords, entry.tags);
		const contentHits = countHits(contentWords, entry.tags);
		const score = titleHits * 5 + Math.min(contentHits, 4) * 1.2;
		if (score >= 2.5 && (!abstractBest || score > abstractBest.score)) {
			abstractBest = { family: entry.family, score, titleHits, contentHits };
		}
	}
	if (abstractBest) {
		return {
			family: abstractBest.family,
			subject: null,
			supports: [],
			concept: abstractBest.family,
			reason: `abstract:${abstractBest.family}`,
			scores
		};
	}

	const fallback = CATEGORY_FALLBACK[category];
	if (fallback) {
		const subject = MOTIF_BY_KEY[fallback.subject] || null;
		return {
			family: fallback.family,
			subject: subject?.key || null,
			supports: [],
			concept: null,
			reason: `category:${category}`,
			scores
		};
	}

	return { ...FALLBACK_SELECTION, scores };
}

/**
 * Symptom pro testy a showcase: které téma bylo vybráno a proč.
 * @param {{title?: string, content?: string, category?: string}} post
 */
export function explainSelection(post) {
	const result = analyzePost(post);
	const subject = result.subject ? MOTIF_BY_KEY[result.subject] : null;
	return {
		...result,
		subjectLabel: subject?.label || null,
		supportLabels: result.supports.map((key) => MOTIF_BY_KEY[key]?.label || key)
	};
}
