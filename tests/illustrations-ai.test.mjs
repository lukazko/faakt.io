import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';
import { normalizePostId, postRouteEntries } from '../src/lib/post-id.js';

test('post IDs are canonical and historical links resolve to the same post', () => {
	const posts = JSON.parse(readFileSync('static/data/posts.json', 'utf8'));
	assert.equal(new Set(posts.map(post => post.id)).size, posts.length);
	const routes = new Set(postRouteEntries(posts).map(entry => entry.id));
	for (const post of posts) {
		assert.match(post.id, /^[1-9]\d*$/);
		assert.ok(routes.has(post.id));
		assert.ok(routes.has(post.id.padStart(3, '0')));
		assert.equal(normalizePostId(post.id.padStart(3, '0')), post.id);
	}
	assert.equal(normalizePostId('01'), '1');
	assert.equal(normalizePostId('1000'), '1000');
	assert.equal(normalizePostId('001x'), '001x');
	assert.equal(normalizePostId(null), null);
});

test('generated posts through 100 have compact static WebP illustrations', () => {
	for (let index = 1; index <= 100; index += 1) {
		const id = String(index);
		const path = `static/illustrations-ai/${id}.webp`;
		assert.ok(existsSync(path), `missing ${path}`);
		assert.ok(statSync(path).size < 100_000, `${path} is unexpectedly large`);
	}
});

test('accepted illustrations are available on post cards', () => {
	const manifest = JSON.parse(readFileSync('static/illustrations-ai/manifest.json', 'utf8'));
	const component = readFileSync('src/lib/components/PostIllustration.svelte', 'utf8');
	const registry = component.match(/const generatedIds = new Set\(\[([\s\S]*?)\]\);/);
	assert.ok(registry, 'post-card illustration registry is missing');
	const cardIds = new Set([...registry[1].matchAll(/'([^']+)'/g)].map((match) => match[1]));
	for (const entry of manifest.filter((entry) => entry.review?.status?.startsWith('accepted'))) {
		assert.ok(cardIds.has(entry.id), `accepted illustration ${entry.id} is missing from post cards`);
		const image = `static/illustrations-ai/${entry.id}.webp`;
		assert.equal(entry.image, `/illustrations-ai/${entry.id}.webp`);
		assert.ok(existsSync(image), `missing ${image}`);
		assert.ok(statSync(image).size < 100_000, `${image} is unexpectedly large`);
	}
});
