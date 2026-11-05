import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { getPrompt, normalizeDrafts } from '../scripts/generate-posts.mjs';

test('guarded metadata workflow handles stale inputs, duplicates and sidecar writes', () => {
  const result = spawnSync('python', ['-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_post_knowledge.py'], {
    encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' }
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test('all current posts have verified metadata and a valid shared vocabulary', () => {
  const result = spawnSync('python', ['scripts/post-knowledge.py', 'status'], {
    encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' }
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const state = JSON.parse(result.stdout);
  assert.equal(state.verified, JSON.parse(readFileSync('static/data/posts.json', 'utf8')).length);
  assert.deepEqual(state.problems, []);
});

test('API drafts must preserve approved knowledge and include illustration metadata', () => {
  const knowledge = { idea: 'example-idea', point: 'A distinct complete point.', type: 'principle', tags: ['example'] };
  const proposal = { id: '897', category: 'filozofie', knowledge };
  const draft = { ...proposal, title: 'Title', content: 'x'.repeat(600),
    sources: [{ label: 'a', url: 'https://example.org/a' }, { label: 'b', url: 'https://example.org/b' }], illustration: { concept: 'Object' } };
  assert.deepEqual(normalizeDrafts([draft], [proposal])[0].knowledge, knowledge);
  assert.throws(() => normalizeDrafts([{ ...draft, knowledge: { ...knowledge, idea: 'changed' } }], [proposal]));
  assert.throws(() => normalizeDrafts([{ ...draft, illustration: null }], [proposal]));
  assert.throws(() => normalizeDrafts([], [proposal]));
  const prompt = getPrompt([proposal], [{ id: 'example', label: 'Example' }, { id: 'unrelated', label: 'Unused' }]);
  assert.ok(prompt.includes('example-idea'));
  assert.ok(!prompt.includes('"id":"unrelated"'));
});
