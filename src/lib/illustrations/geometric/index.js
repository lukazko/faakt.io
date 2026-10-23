/**
 * Veřejný vstup geometrické vrstvy.
 *
 * Sestaví scénu pro příspěvek nebo explicitní parametry. Vrací data
 * připravená pro `PostIllustration.svelte`; žádný DOM ani Svelte.
 */

import { createRandom, clamp, hashString, round } from '../prng.js';
import { analyzePost } from '../analysis/analyze.js';
import { geometricPalette } from './palette.js';
import { geometricFamilyFor, resolveSubject } from './mapping.js';
import { SCENES, GEOMETRIC_FAMILY_KEYS } from './scenes.js';
import { chooseComposition, COMPOSITION_KEYS, COMPOSITION_META } from './composition.js';
import { refineSubject } from './refine.js';
import { deriveSeed } from './seed.js';

export { GEOMETRIC_FAMILY_KEYS };
export { GEOMETRIC_COLORS, geometricPalette } from './palette.js';
export { DEFAULT_SUBJECT, SUBJECT_ALIAS, FAMILY_FALLBACK } from './mapping.js';
export { COMPOSITION_KEYS, COMPOSITION_META, chooseComposition } from './composition.js';
export { refineSubject, REFINEMENTS } from './refine.js';
export { HEROES, HERO_KEYS } from './heroes.js';
export { deriveSeed } from './seed.js';

/**
 * Sestaví geometrickou scénu pro příspěvek nebo explicitní parametry.
 * Vrací data připravená pro stávající renderer a testy.
 *
 * @param {{
 *   family?: string,
 *   post?: { id?: string, title?: string, content?: string, category?: string } | null,
 *   seed?: string | number,
 *   category?: string,
 *   subject?: string | null,
 *   variant?: number,
 *   density?: number,
 *   scale?: number,
 *   balance?: number,
 *   composition?: string
 * }} [options]
 */
export function createGeometricIllustration(options = {}) {
	const analysis = options.post ? analyzePost(options.post) : null;
	const requested = options.family || analysis?.family || 'metaphor';
	const family = geometricFamilyFor(requested);
	const seed = options.seed == null ? deriveSeed(options.post) : String(options.seed);
	const random = createRandom(seed);

	// Stejné pevné pořadí losování jako klasický systém.
	const variant = clamp(Math.round(options.variant ?? random.int(0, 2)), 0, 2);
	const density = clamp(options.density ?? round(random.range(0.35, 1), 2), 0.35, 1);
	const scale = clamp(options.scale ?? round(random.range(0.9, 1.1), 2), 0.9, 1.1);
	const balance = clamp(options.balance ?? round(random.range(-1, 1), 2), -1, 1);

	const category = options.category ?? options.post?.category;
	const palette = geometricPalette(category);

	// Předmět: explicitní, jinak z textu; neznámý předmět spadne na motiv rodiny.
	let subject = options.subject;
	if (subject === undefined) {
		subject = analysis?.subject ?? null;
	}
	// Motiv se nejdřív přeloží přes alias a potom zpřesní podle konkrétních
	// slov v textu (kometa, galaxie, entropie…). Konkrétní předmět z analýzy
	// se nikdy nepřepisuje.
	subject = family === 'layers' ? null : refineSubject(resolveSubject(family, subject), options.post);
	const supports = analysis?.supports ?? [];
	const secondary =
		family === 'layers'
			? null
			: supports
					.map((key) => refineSubject(resolveSubject(family, key), options.post))
					.find((key) => key && key !== subject) ?? null;

	const composition = family === 'layers'
		? 'single'
		: COMPOSITION_KEYS.includes(options.composition)
			? options.composition
			: chooseComposition({ post: options.post, family, category });

	const context = {
		family,
		subject,
		secondary,
		composition,
		rand: random,
		random,
		variant,
		density,
		scale,
		balance,
		palette
	};

	return {
		style: 'geometric',
		family,
		requestedFamily: requested,
		seed,
		seedHash: hashString(seed),
		category: category || null,
		variant,
		density,
		scale,
		balance,
		palette,
		subject,
		secondary,
		composition,
		elements: SCENES[family](context)
	};
}
