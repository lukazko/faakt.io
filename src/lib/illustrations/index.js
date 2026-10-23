/**
 * Veřejné rozhraní ilustračního systému.
 *
 * Jediná kreslicí vrstva je geometrická. Analýza textu, metadata předmětů
 * a palety jsou její součásti; žádná paralelní klasická implementace
 * v projektu neexistuje.
 *
 * Moduly jsou čisté (bez Svelte a DOM), takže je lze testovat přímo v Node.
 */

export {
	FAMILY_FALLBACK,
	GEOMETRIC_COLORS,
	GEOMETRIC_FAMILY_KEYS,
	HEROES,
	HERO_KEYS,
	SUBJECT_ALIAS,
	DEFAULT_SUBJECT,
	COMPOSITION_KEYS,
	COMPOSITION_META,
	REFINEMENTS,
	chooseComposition,
	createGeometricIllustration,
	deriveSeed,
	geometricPalette,
	refineSubject
} from './geometric/index.js';

export {
	analyzePost,
	explainSelection,
	scoreMotifs,
	detectChronology,
	normalizeText,
	wordsOf,
	countHits
} from './analysis/analyze.js';

export { SUBJECTS, SUBJECT_BY_KEY, SUBJECT_KEYS } from './subjects.js';

export { VIEWBOX } from './geometric/constants.js';

export { validateElements, boundsOf } from './validate.js';

export {
	CATEGORY_PALETTES,
	NEUTRALS,
	MATERIALS,
	FALLBACK_PALETTE,
	paletteForCategory,
	mixHex
} from './palettes.js';

export { hashString, createRandom, clamp, round } from './prng.js';
