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
import { deriveSeed } from './seed.js';

export { GEOMETRIC_FAMILY_KEYS };
export { GEOMETRIC_COLORS, geometricPalette } from './palette.js';
export { DEFAULT_SUBJECT, SUBJECT_ALIAS, FAMILY_FALLBACK } from './mapping.js';
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
 *   balance?: number
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
	subject = family === 'layers' ? null : resolveSubject(family, subject);
	const context = {
		family,
		subject,
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
		elements: SCENES[family](context)
	};
}
