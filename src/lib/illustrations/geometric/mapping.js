/**
 * Mapování analytických rodin a předmětů na geometrické motivy.
 *
 * `analyzePost()` vrací jednu z 65 analytických rodin. Geometric jich
 * používá sedm; zbytek se mapuje na nejbližší scénu. Předmět se překládá
 * přes `SUBJECT_ALIAS` a neznámý klíč vždy spadne na motiv rodiny.
 */

import { HEROES } from './heroes.js';

const DEFAULT_SUBJECT = {
	portrait: 'bust',
	discovery: 'flask',
	storybook: 'book',
	relic: 'amphora',
	metaphor: 'balance',
	nature: 'tree',
	layers: null
};

// Některé předměty mají v klasickém systému jiné jméno než náš motiv.
// Mapování drží jednu rozpoznatelnou věc na příspěvek, ne dekoraci navíc.
const SUBJECT_ALIAS = {
	lawScroll: 'scroll',
	periodicTable: 'flask',
	throne: 'crown',
	temple: 'column',
	altar: 'column',
	stele: 'column',
	entropy: 'clock',
	knot: 'infinity',
	roots: 'tree',
	leaf: 'tree',
	forest: 'tree',
	bird: 'tree',
	cloud: 'wind',
	lightning: 'bolt'
};

const FAMILY_FALLBACK = {
	grid: 'layers',
	orbit: 'discovery',
	data: 'layers',
	timeline: 'layers',
	network: 'layers',
	signals: 'discovery',
	structure: 'relic',
	contrast: 'metaphor',
	organic: 'nature',
	silhouette: 'portrait',
	crowd: 'portrait',
	gaze: 'portrait',
	armory: 'relic',
	throne: 'relic',
	temple: 'relic',
	ritual: 'relic',
	storm: 'nature',
	snowfield: 'nature',
	peak: 'nature',
	undergrowth: 'nature',
	transformation: 'nature',
	rupture: 'layers',
	decay: 'layers',
	descent: 'layers',
	lattice: 'layers',
	meander: 'layers',
	cascade: 'layers',
	divergence: 'layers',
	threshold: 'layers',
	monolith: 'relic',
	arch: 'relic'
};

export function geometricFamilyFor(family) {
	if (DEFAULT_SUBJECT[family] !== undefined) return family;
	return FAMILY_FALLBACK[family] || 'metaphor';
}

export function resolveSubject(family, subject) {
	const key = SUBJECT_ALIAS[subject] || subject;
	if (key && HEROES[key]) return key;
	return DEFAULT_SUBJECT[family];
}

export { DEFAULT_SUBJECT, SUBJECT_ALIAS, FAMILY_FALLBACK };
