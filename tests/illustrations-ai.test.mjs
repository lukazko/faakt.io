import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';
import { normalizePostId, postRouteEntries } from '../src/lib/post-id.js';
import { layoutFromAlpha, scanIllustrations } from '../scripts/illustration-layout.mjs';
import { mkdtemp, copyFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('new, replaced and removed illustrations refresh cached layouts', async () => {
	const directory = await mkdtemp(path.join(tmpdir(), 'faakt-layout-'));
	const cache = new Map();
	try {
		assert.deepEqual(await scanIllustrations(directory, cache), {});
		await copyFile('static/illustrations-ai/524.webp', path.join(directory, '10001.webp'));
		assert.equal((await scanIllustrations(directory, cache))['10001'].height, 212);
		await copyFile('static/illustrations-ai/313.webp', path.join(directory, '10001.webp'));
		assert.deepEqual(await scanIllustrations(directory, cache), {});
		await rm(path.join(directory, '10001.webp'));
		assert.deepEqual(await scanIllustrations(directory, cache), {});
	} finally {
		assert.ok(path.resolve(directory).startsWith(path.resolve(tmpdir()) + path.sep));
		await rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
	}
});

test('illustration layout ignores faint padding and keeps tall and opaque artwork intact', () => {
	function image(width, height, top, bottom) {
		const data = Buffer.alloc(width * height * 4);
		for (let y = top; y < bottom; y++) data[(y * width + width / 2) * 4 + 3] = 255;
		data[3] = 15;
		return data;
	}
	assert.deepEqual(layoutFromAlpha(image(640, 360, 84, 276), 640, 360, 4), { height: 212, canvasHeight: 360, center: 50 });
	assert.deepEqual(layoutFromAlpha(image(1280, 720, 168, 552), 1280, 720, 4), { height: 212, canvasHeight: 360, center: 50 });
	assert.equal(layoutFromAlpha(image(640, 360, 9, 351), 640, 360, 4), null);
	assert.equal(layoutFromAlpha(Buffer.alloc(640 * 360 * 4, 255), 640, 360, 4), null);
	assert.equal(layoutFromAlpha(Buffer.alloc(640 * 360 * 4), 640, 360, 4), null);
	const asymmetric = layoutFromAlpha(image(640, 360, 20, 220), 640, 360, 4);
	assert.equal(asymmetric.height, 220);
	assert.ok(Math.abs(asymmetric.center - 100 / 3) < 1e-10);
});

test('layout scans current assets, including illustrations without manual ID configuration', async () => {
	const layouts = await scanIllustrations('static/illustrations-ai');
	assert.equal(layouts['313'], undefined);
	assert.deepEqual(layouts['524'], { height: 212, canvasHeight: 360, center: 50 });
	for (const layout of Object.values(layouts)) {
		assert.ok(layout.height > 20 && layout.height <= layout.canvasHeight - 20);
		assert.ok(layout.center > 0 && layout.center < 100);
	}
});

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
