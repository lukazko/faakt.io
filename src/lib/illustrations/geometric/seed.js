/**
 * Stabilní seed ilustrace.
 *
 * Primárně ID příspěvku, jinak normalizovaná metadata. Stejný příspěvek
 * musí dostat stejnou scénu bez ohledu na pořadí vykreslení.
 */

import { normalizeText } from '../analysis/analyze.js';

/**
 * @param {{ id?: string, title?: string, category?: string } | null | undefined} post
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
