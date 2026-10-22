import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
	GEOMETRIC_FAMILY_KEYS,
	createGeometricIllustration
} from '../src/lib/illustrations/geometric.js';
import { validateElements } from '../src/lib/illustrations/scenes.js';

const posts = JSON.parse(fs.readFileSync(new URL('../static/data/posts.json', import.meta.url), 'utf8'));

test('každý příspěvek dostane platnou geometrickou scénu', () => {
	for (const post of posts) {
		const spec = createGeometricIllustration({ post });
		assert.equal(spec.style, 'geometric', post.id);
		assert.ok(GEOMETRIC_FAMILY_KEYS.includes(spec.family), `${post.id}: ${spec.family}`);
		const result = validateElements(spec.elements);
		assert.ok(result.ok, `${post.id}: ${JSON.stringify(result)}`);
		assert.ok(spec.elements.length > 0, post.id);
	}
});

test('scéna je deterministická a nemá doplňkové objekty', () => {
	const post = posts[0];
	const first = createGeometricIllustration({ post });
	const second = createGeometricIllustration({ post });
	assert.deepEqual(second, first);
	assert.equal('supports' in first, false);
});

test('předmět se vybírá z obsahu a má jeden hlavní motiv', () => {
	const spec = createGeometricIllustration({
		family: 'relic',
		subject: 'lawScroll',
		seed: 'test'
	});
	assert.equal(spec.subject, 'scroll');

	const entropy = createGeometricIllustration({
		family: 'metaphor',
		subject: 'entropy',
		seed: 'test'
	});
	assert.equal(entropy.subject, 'clock');

	const sword = createGeometricIllustration({
		family: 'relic',
		subject: 'sword',
		seed: 'test'
	});
	assert.equal(sword.subject, 'sword');
});

test('neznámý předmět spadne na motiv rodiny', () => {
	const spec = createGeometricIllustration({
		family: 'nature',
		subject: 'neexistujici-motiv',
		seed: 'test'
	});
	assert.equal(spec.subject, 'tree');
});
