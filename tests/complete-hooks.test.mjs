import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getHook } from '../src/lib/teaser.js';

test('hook fallback preserves the complete text without paragraph markup', () => {
	const text = 'Dlouhý úvod má zůstat dostupný celý i tehdy, když neobsahuje odstavcové značky. Druhá věta musí také zůstat celá.';
	assert.equal(getHook(`<strong>${text}</strong>`, 20), text);
});

test('hook preserves the whole first paragraph beyond the preferred length', () => {
	const first = 'Úvod nekončí uprostřed věty. Ani druhá věta se nesmí zkrátit výpustkou.';
	assert.equal(getHook(`<p>${first}</p><p>Další obsah příspěvku.</p>`, 20), first);
});
