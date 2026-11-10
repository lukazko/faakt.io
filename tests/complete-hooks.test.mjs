import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getHook } from '../src/lib/teaser.js';

test('hook fallback preserves the complete text without paragraph markup', () => {
	const text = 'Dlouhý úvod má zůstat dostupný celý i tehdy, když neobsahuje odstavcové značky. Druhá věta musí také zůstat celá.';
	assert.equal(getHook(`<strong>${text}</strong>`), text);
});

test('hook preserves a long first paragraph without including later paragraphs', () => {
	const first = 'Úvod nekončí uprostřed věty. Ani druhá věta se nesmí zkrátit výpustkou.';
	assert.equal(getHook(`<p>${first}</p><p>Další obsah příspěvku.</p>`), first);
});

test('stored hooks never end with an ellipsis', () => {
	for (const post of JSON.parse(readFileSync('static/data/posts.json', 'utf8'))) {
		assert.doesNotMatch(getHook(post.content), /(?:\.{3}|\u2026)[\u201d"\u00bb']?$/, `hook ${post.id}`);
	}
});

test('empty hooks and HTML entities produce readable text', () => {
	assert.equal(getHook(null), '');
	assert.equal(getHook('<p>A &amp; B &#8212; why?</p><p>End.</p>'), 'A & B \u2014 why?');
});
