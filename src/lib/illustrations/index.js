/**
 * Veřejné rozhraní ilustračního systému.
 *
 * Používá se dvěma způsoby:
 * - `selectIllustration(post)` v kartě feedu — metadata + deterministický seed,
 * - `createIllustration({ family, ... })` v showcase a testech.
 *
 * Moduly jsou čisté (bez Svelte a DOM), takže je lze testovat přímo v Node.
 */

export {
	FAMILIES,
	ABSTRACT_FAMILIES,
	FAMILY_BUILDERS,
	FAMILY_KEYS,
	VIEWBOX,
	validateElements,
	boundsOf
} from './scenes.js';
export {
	FAMILY_BY_CATEGORY,
	DEFAULT_FAMILY,
	SEMANTIC_FAMILY_KEYS,
	selectFamily,
	deriveSeed,
	selectIllustration,
	createIllustration,
	normalizeText
} from './select.js';
export {
	analyzePost,
	explainSelection,
	scoreMotifs,
	detectChronology,
	wordsOf,
	countHits
} from './concepts.js';
export { MOTIFS, MOTIF_KEYS, MOTIF_BY_KEY, renderMotif, supportsForFamily } from './motifs.js';
export { SEMANTIC_FAMILIES, SEMANTIC_FAMILY_BY_KEY } from './semantic-scenes.js';
export { SYMBOLIC_FAMILIES } from './symbolic-scenes.js';
export { EXTRA_ABSTRACT_FAMILIES } from './abstract-extra.js';
export { SYMBOLIC_MOTIFS } from './motifs-symbolic.js';
export {
	CATEGORY_PALETTES,
	NEUTRALS,
	MATERIALS,
	FALLBACK_PALETTE,
	paletteForCategory,
	resolvePalette
} from './palettes.js';
export { hashString, createRandom, clamp, lerp, round } from './prng.js';
