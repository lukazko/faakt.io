/**
 * Volba kompozičního vzoru podle textu.
 *
 * Samotný motiv říká, *co* je na scéně. Kompozice říká, *co se s tím děje*:
 * zda se předmět dělí, stojí proti sobě, mění se, roste, hroutí se, spojuje
 * nebo tvoří protiklad. Vzory jsou záměrně obecné a znovupoužitelné pro
 * libovolný motiv — žádná scéna na míru jednomu příspěvku.
 *
 * Pravidla jsou deterministická a vysvětlitelná. Titulní slovo má váhu 5,
 * obsahové slovo 1,2; obsah sám musí dodat alespoň čtyři různá slova, aby
 * kompozici ospravedlnil. Díky tomu se dynamický vzor nevnucuje každému
 * druhému příspěvku.
 */

import { countHits, wordsOf } from '../analysis/analyze.js';

export const COMPOSITION_META = {
	single: { label: 'Jeden motiv', note: 'výchozí klidná kompozice' },
	split: { label: 'Rozdělení', note: 'dvě poloviny, trhlina mezi nimi' },
	confrontation: { label: 'Konfrontace', note: 'dva motivy proti sobě přes hranici' },
	transformation: { label: 'Proměna', note: 'obrys se mění v hotový objekt' },
	growth: { label: 'Růst', note: 'tři stupně podél stoupající linky' },
	collapse: { label: 'Zhroucení', note: 'stupně padají a ztrácejí barvu' },
	connection: { label: 'Spojení', note: 'dva motivy spojené drahou' },
	contrast: { label: 'Protiklad', note: 'obrys a plná forma přes osu' }
};

/** Pořadí je závazné: konkrétnější význam vyhrává nad obecnějším. */
const RULES = [
	{
		key: 'split',
		tags: [
			'rozdel*', 'rozkol*', 'rozpad*', 'rozpolc*', 'fragment*', 'pulen*',
			'trhl*', 'praskl*', 'separat*', 'odtrzen*', 'odluk*'
		]
	},
	{
		key: 'confrontation',
		tags: [
			'valk*', 'bitv*', 'valecn*', 'konflikt*', 'spor', 'spory', 'sporu',
			'sporech', 'souboj*', 'revoluc*', 'vzpour*', 'obcansk*', 'zrad*',
			'utok*', 'zbran*', 'armad*', 'duel*', 'rival*', 'stret*', 'svar*',
			'nepritel*', 'obran*', 'boj*'
		]
	},
	{
		key: 'transformation',
		tags: [
			'promen*', 'premen*', 'transform*', 'zmen*', 'vyvoj*', 'vznik*',
			'zrod*', 'prechod*', 'metamorfoz*', 'evoluc*'
		]
	},
	{
		key: 'collapse',
		tags: [
			'pad', 'padu', 'padem', 'upadek*', 'zhrouc*', 'kolaps*', 'kriz*',
			'pokles*', 'zanik*', 'destruk*', 'rozval*', 'trosk*', 'zricen*'
		]
	},
	{
		key: 'growth',
		tags: ['rust*', 'vzestup*', 'rozsir*', 'expanz*', 'zvets*', 'pokrok*', 'vzrust*', 'sili', 'silit']
	},
	{
		key: 'connection',
		tags: [
			'spoj*', 'propoj*', 'vztah*', 'dialog*', 'spoluprac*', 'komunikac*',
			'sit*', 'most*', 'pout*', 'svaz*', 'pribuz*'
		]
	},
	{
		key: 'contrast',
		tags: [
			'naopak*', 'paradox*', 'protiklad*', 'rozdil*', 'kontrast*',
			'srovnan*', 'versus*', 'dilema*', 'rozpor*', 'dualit*', 'protichud*'
		]
	}
];

/** Rodiny a kategorie, kde dává smysl stavět dva objekty proti sobě. */
const CONFRONTATION_FAMILIES = new Set(['portrait', 'relic', 'metaphor', 'storybook']);
const CONFRONTATION_CATEGORIES = new Set([
	'historie',
	'politika',
	'filozofie',
	'literatura',
	'filmy',
	'umeni'
]);

/**
 * @param {{
 *   post?: {title?: string, content?: string} | null,
 *   family?: string,
 *   category?: string,
 *   supports?: string[]
 * }} input
 * @returns {string} klíč kompozice
 */
export function chooseComposition({ post, family, category } = {}) {
	if (!post || family === 'layers') return 'single';
	const trimmedCategory = typeof category === 'string' ? category.trim().toLowerCase() : '';
	const confrontationAllowed =
		CONFRONTATION_FAMILIES.has(family) || CONFRONTATION_CATEGORIES.has(trimmedCategory);
	const titleWords = wordsOf(post.title);
	const contentWords = wordsOf(post.content);

	let best = null;
	for (const rule of RULES) {
		if (rule.key === 'confrontation' && !confrontationAllowed) continue;
		const titleHits = countHits(titleWords, rule.tags);
		const contentHits = countHits(contentWords, rule.tags);
		const strong = (titleHits >= 1 && titleHits * 5 >= 5) || (titleHits === 0 && contentHits >= 4);
		if (!strong) continue;
		const score = titleHits * 5 + Math.min(contentHits, 3) * 1.2;
		if (!best || score > best.score) best = { key: rule.key, score, titleHits, contentHits };
	}
	return best?.key ?? 'single';
}

export const COMPOSITION_KEYS = ['single', ...RULES.map((rule) => rule.key)];
