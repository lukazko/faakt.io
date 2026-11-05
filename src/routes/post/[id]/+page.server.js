import fs from 'node:fs';
import path from 'node:path';
import { normalizePostId, postRouteEntries } from '../../../lib/post-id.js';

const postsPath = path.resolve(process.cwd(), 'static', 'data', 'posts.json');

/**
 * Returns all possible [id] values for prerendering.
 */
export function entries() {
	const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
	return postRouteEntries(posts);
}

/**
 * Load post data for the page — pass the target post ID to FeedView
 * a titulek s popisem pro Open Graph náhled při sdílení.
 */
export function load({ params }) {
	const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
	const id = normalizePostId(params.id);
	const post = posts.find(p => p.id === id);

	return {
		targetPostId: id,
		ogTitle: post ? `${post.title} · faakt.io` : undefined,
		ogDescription: post ? plainText(post.content) : undefined
	};
}

/**
 * Obsah příspěvku je HTML — pro og:description potřebujeme čistý text
 * zkrácený na rozumnou délku.
 */
function plainText(html, maxLength = 200) {
	const text = html
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/\s+/g, ' ')
		.trim();

	return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}
