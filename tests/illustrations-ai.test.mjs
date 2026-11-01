import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { test } from 'node:test';

test('generated posts through 100 have compact static WebP illustrations', () => {
	for (let index = 1; index <= 100; index += 1) {
		const id = String(index).padStart(3, '0');
		const path = `static/illustrations-ai/${id}.webp`;
		assert.ok(existsSync(path), `missing ${path}`);
		assert.ok(statSync(path).size < 100_000, `${path} is unexpectedly large`);
	}
});
