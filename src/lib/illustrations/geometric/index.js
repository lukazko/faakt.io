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
import { drawScene, GEOMETRIC_FAMILY_KEYS, SCENES, SCENE_TYPES } from './scenes.js';
import { chooseComposition, COMPOSITION_KEYS, COMPOSITION_META } from './composition.js';
import { refineSubject } from './refine.js';
import { deriveSeed } from './seed.js';
import { selectScene, SEMANTIC_SCENE_KEYS } from './selection.js';
import { HEROES } from './heroes.js';
import { CULTURES, detectCulture, cultureBackdrop } from './culture.js';

export { GEOMETRIC_FAMILY_KEYS, SCENE_TYPES, SEMANTIC_SCENE_KEYS, drawScene };
export { CULTURES, CULTURE_KEYS, detectCulture, cultureBackdrop } from './culture.js';
export { selectScene } from './selection.js';
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
 *   secondary?: string | null,
 *   scene?: string,
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

	// Sémantická scéna se volí jen z textu a jen tehdy, když uživatel
	// nepředepsal předmět ani kompozici (galerie a testy tak zůstávají
	// deterministické). Pravidla jsou v `selection.js`.
	const semantic =
		options.post && options.subject === undefined && !options.composition && !options.scene
			? selectScene({
					post: options.post,
					analysis,
					family,
					category: options.category ?? options.post?.category
				})
			: null;

	// Předmět: explicitní, potom scénický, potom z analýzy; neznámý spadne
	// na motiv rodiny. Sémantická scéna už nese konkrétní motiv, proto se
	// u ní alias ani zpřesnění neuplatní — jinak by se ztratil (např. slunce).
	let subject = null;
	if (family !== 'layers' || semantic) {
		const candidate =
			options.subject !== undefined ? options.subject : (semantic?.subject ?? analysis?.subject ?? null);
		subject = semantic
			? candidate && HEROES[candidate]
				? candidate
				: resolveSubject(family, candidate)
			: refineSubject(resolveSubject(family, candidate), options.post);
	}

	const supports = analysis?.supports ?? [];
	let secondary;
	if (options.secondary !== undefined) {
		secondary = options.secondary && HEROES[options.secondary] ? options.secondary : null;
	} else if (semantic) {
		secondary = semantic.secondary && HEROES[semantic.secondary] ? semantic.secondary : null;
	} else if (family === 'layers') {
		secondary = null;
	} else {
		secondary =
			supports
				.map((key) => refineSubject(resolveSubject(family, key), options.post))
				.find((key) => key && key !== subject) ?? null;
	}

	const composition =
		family === 'layers' && !semantic
			? 'single'
			: COMPOSITION_KEYS.includes(options.composition)
				? options.composition
				: chooseComposition({ post: options.post, family, category });

	// Klíč scény: sémantická scéna > dynamická kompozice > rodina.
	// `family` zůstává kvůli paletě, testům a zpětné kompatibilitě.
	const scene = options.scene || semantic?.scene || (composition === 'single' ? family : composition);

	// Kulturní kontext: rozpozná se z textu, ale nikdy nevybírá scénu ani
	// předmět. Explicitní `culture` v galerii jen předepíše stejnou kulisu.
	const culture =
		options.culture === false
			? null
			: typeof options.culture === 'string' && CULTURES[options.culture]
				? { key: options.culture, label: CULTURES[options.culture].label, score: 0, reason: `culture:${options.culture}` }
				: options.post
					? detectCulture(options.post)
					: null;

	const context = {
		family,
		scene,
		subject,
		secondary,
		composition,
		culture,
		rand: random,
		random,
		variant,
		density,
		scale,
		balance,
		palette
	};

	let elements = options.scene
		? drawScene(options.scene, context)
		: semantic
			? drawScene(semantic.scene, context)
			: composition === 'single'
				? SCENES[family](context)
				: drawScene(composition, context);

	// Kulisa jde před scénu, aby zůstala vzadu. Nikdy nemění hlavní motiv.
	if (culture) elements = [...cultureBackdrop(culture, context), ...elements];

	return {
		style: 'geometric',
		family,
		requestedFamily: requested,
		scene,
		sceneGroup: SCENE_TYPES.find((type) => type.key === (semantic?.scene || scene))?.group ?? 'family',
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
		culture,
		reason: semantic?.reason ?? analysis?.reason ?? null,
		elements
	};
}
