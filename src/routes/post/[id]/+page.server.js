import fs from 'node:fs';
import path from 'node:path';

const postsPath = path.resolve(process.cwd(), 'static', 'data', 'posts.json');

/**
 * Returns all possible [id] values for prerendering.
 */
export function entries() {
	const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
	return posts.map(p => ({ id: p.id }));
}

/**
 * Load post data for the page — pass the target post ID to FeedView.
 */
export function load({ params }) {
	return {
		targetPostId: params.id
	};
}