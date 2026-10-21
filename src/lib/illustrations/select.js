/**
 * Výběr ilustrace pro příspěvek.
 *
 * Pořadí rozhodování (viz `concepts.js`):
 * 1. sémantický motiv z titulku a textu,
 * 2. výslovně chronologický obsah → časová osa,
 * 3. výchozí předmět kategorie,
 * 4. bezpečná abstraktní kompozice.
 *
 * Seed z ID příspěvku řídí jen variantu, hustotu, měřítko a rovnováhu.
 * Primární barva kategorie je vždy stabilní a nikdy se nevybírá náhodou.
 * Nic se nepočítá při renderu opakovaně nad celou databází — funkce dostane
 * jeden příspěvek a vrátí hotovou scénu. Žádné LLM volání, žádné assety.
 */

import { createRandom, hashString, round } from './prng.js';
import { resolvePalette } from './palettes.js';
import { CATEGORY_FALLBACK, analyzePost, normalizeText } from './concepts.js';
import { MOTIF_BY_KEY } from './motifs.js';
import { FAMILIES, FAMILY_BUILDERS, clampParams } from './scenes.js';

/** @typedef {import('./scenes.js').Family} Family */

/** Kategorie → výchozí rodina, když text nenabídne konkrétnější předmět. */
export const FAMILY_BY_CATEGORY = Object.fromEntries(
	Object.entries(CATEGORY_FALLBACK).map(([category, fallback]) => [category, fallback.family])
);

export const DEFAULT_FAMILY = 'structure';

const FAMILY_DEFAULTS = Object.fromEntries(
	FAMILIES.filter((family) => family.defaultSubject).map((family) => [
		family.key,
		family.defaultSubject
	])
);

const FAMILY_SUBJECTS = Object.fromEntries(
	FAMILIES.filter((family) => family.subjects).map((family) => [family.key, new Set(family.subjects)])
);

/** Rodiny, které umí pojmout sémantický předmět. */
export const SEMANTIC_FAMILY_KEYS = Object.keys(FAMILY_DEFAULTS);

/**
 * Zpětně kompatibilní export. Analyzuje příspěvek stejně jako hlavní výběr,
 * takže volání `selectFamily(post)` a `selectIllustration(post)` zůstávají
 * konzistentní.
 * @param {{ title?: string, content?: string, category?: string }} post
 * @returns {Family}
 */
export function selectFamily(post) {
	return analyzePost(post).family;
}

/** @deprecated Použij `normalizeText` z `concepts.js`; ponecháno pro starší volající. */
export { normalizeText };

/**
 * Stabilní seed. Primárně ID příspěvku, jinak normalizovaná metadata.
 * @param {{ id?: string, title?: string, category?: string }} post
 * @returns {string}
 */
export function deriveSeed(post) {
	const id = post?.id == null ? '' : String(post.id).trim();
	if (id) return `id:${id}`;

	const title = normalizeText(post?.title);
	const category = normalizeText(post?.category);
	const meta = `${category}|${title}`.replace(/^[|]+|[|]+$/g, '');
	return `meta:${meta || 'fallback'}`;
}

function defaultSubjectFor(family) {
	return FAMILY_DEFAULTS[family] || null;
}

/** Neplatný nebo cizí předmět nikdy nesmí projít do scény. */
function normalizeSubject(family, subject) {
	const allowed = FAMILY_SUBJECTS[family];
	if (allowed && typeof subject === 'string' && allowed.has(subject)) return subject;
	return defaultSubjectFor(family);
}

/** Doplňky musí patřit do rodiny a nesmí duplikovat předmět. */
function normalizeSupports(family, supports, subject) {
	if (!Array.isArray(supports) || !FAMILY_SUBJECTS[family]) return [];
	const unique = [];
	for (const key of supports) {
		const motif = MOTIF_BY_KEY[key];
		if (!motif || motif.role === 'subject' || !motif.families.includes(family)) continue;
		if (key === subject || unique.includes(key)) continue;
		unique.push(key);
		if (unique.length === 2) break;
	}
	return unique;
}

/**
 * Sestaví kompletní scénu z explicitních parametrů. Používá showcase a testy;
 * běžný feed volá `selectIllustration`.
 *
 * `post` umožní doplnit předmět a doplňky podle textu i při ručně zvolené
 * rodině. Explicitní `subject` / `supports` mají přednost.
 *
 * @param {{
 *   family?: Family,
 *   seed?: string | number,
 *   category?: string,
 *   subject?: string | null,
 *   supports?: string[],
 *   post?: { title?: string, content?: string, category?: string } | null,
 *   variant?: number,
 *   density?: number,
 *   scale?: number,
 *   balance?: number,
 *   paletteSwap?: boolean
 * }} [options]
 */
export function createIllustration(options = {}) {
	const family = FAMILY_BUILDERS[options.family] ? options.family : DEFAULT_FAMILY;
	const seed = options.seed == null ? `meta:${family}` : String(options.seed);
	const random = createRandom(seed);

	// Pevné pořadí losování — změna jednoho parametru nesmí rozhodit ostatní.
	const variant = options.variant ?? random.int(0, 2);
	const density = options.density ?? round(random.range(0.35, 1), 2);
	const scale = options.scale ?? round(random.range(0.9, 1.1), 2);
	const balance = options.balance ?? round(random.range(-1, 1), 2);
	const params = clampParams({ variant, density, scale, balance });

	const category = options.category ?? options.post?.category;
	let palette = resolvePalette(category, random);
	if (options.paletteSwap) {
		// Jen výměna doplňkových rolí pro showcase. `primary` zůstává.
		palette = {
			...palette,
			secondary: palette.primary,
			accent: palette.secondary
		};
	}

	const analysis = options.post ? analyzePost(options.post) : null;
	const candidateSubject =
		options.subject !== undefined
			? options.subject
			: analysis?.family === family
				? analysis.subject
				: defaultSubjectFor(family);
	const subject = normalizeSubject(family, candidateSubject);
	const supports = normalizeSupports(
		family,
		options.supports !== undefined
			? options.supports
			: analysis?.family === family
				? analysis.supports
				: [],
		subject
	);

	const elements = FAMILY_BUILDERS[family]({
		...params,
		palette,
		rand: random,
		family,
		subject,
		supports
	});

	return {
		family,
		seed,
		seedHash: hashString(seed),
		category: category || null,
		...params,
		palette,
		subject,
		supports,
		elements
	};
}

/**
 * Hlavní vstup pro kartu příspěvku.
 * Stejný příspěvek vždy vrátí stejnou ilustraci, ať se vykreslí kdekoli.
 *
 * @param {{
 *   id?: string,
 *   title?: string,
 *   content?: string,
 *   category?: string
 * } | null | undefined} post
 */
export function selectIllustration(post) {
	const seed = deriveSeed(post);
	const analysis = analyzePost(post);
	return createIllustration({
		family: analysis.family,
		seed,
		category: post?.category,
		subject: analysis.subject,
		supports: analysis.supports,
		post
	});
}
