"""Offline regression checks; all writes stay inside temporary fixture directories."""
import copy
import json
from pathlib import Path
import tempfile
import unittest
import sys

sys.dont_write_bytecode = True
import review


class ReviewTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        self.posts = root / 'posts.json'
        self.state = root / 'state.json'
        self.decisions = root / 'review.json'
        self.data = [{
            'id': '018', 'title': 'Řeka a nečinění',
            'content': '<p>Plný text &amp; význam.</p><p>Další odstavec.</p>',
            'category': 'filozofie', 'sources': [{'label': 'Zdroj', 'url': 'https://example.org'}],
            'illustration': {
                'concept': 'A generic river.', 'scene_type': 'environment',
                'primary_subject': 'flowing_river', 'secondary_subjects': [],
                'visual_keywords': ['flowing_river'],
                'composition_hints': ['wide_environmental_view'],
                'mood': 'contemplative', 'palette': 'teal_amber',
            },
        }]
        second = copy.deepcopy(self.data[0])
        second['id'] = '022'
        self.data.append(second)
        self.posts.write_bytes(review.encoded(self.data).replace(b'\n', b'\r\n'))

    def run_command(self, command, *extra):
        return review.main([command, '--posts', str(self.posts), '--state', str(self.state), *extra])

    def decision(self, verdict='change', patch=None):
        result = {'id': '018', 'input_hash': review.digest(self.data[0]),
                  'verdict': verdict, 'reason': 'Show yielding and patient erosion.'}
        if verdict == 'change':
            result['illustration'] = patch if patch is not None else {
                'concept': 'A river yields around rocks while gradually carving a canyon.'}
        return result

    def apply(self, decisions, write=False):
        self.decisions.write_bytes(review.encoded(decisions))
        extra = ['--review', str(self.decisions)] + (['--write'] if write else [])
        return self.run_command('apply', *extra)

    def test_full_text_and_noncontiguous_ids(self):
        batch = self.run_command('batch', '--limit', '1')
        self.assertEqual(len(batch['batch']), 1)
        self.assertIn('Plný text & význam.\n\nDalší odstavec.', batch['batch'][0]['content_text'])
        self.assertEqual(self.run_command('status')['pending_ids'], ['018', '022'])

    def test_dry_run_writes_nothing(self):
        raw = self.posts.read_bytes()
        result = self.apply([self.decision()])
        self.assertEqual(result['change'], 1)
        self.assertEqual(self.posts.read_bytes(), raw)
        self.assertFalse(self.state.exists())

    def test_patch_preserves_all_other_bytes_and_caches_result(self):
        before = self.posts.read_bytes()
        self.apply([self.decision()], write=True)
        after = self.posts.read_bytes()
        old = b'A generic river.'
        new = b'A river yields around rocks while gradually carving a canyon.'
        self.assertEqual(after, before.replace(old, new, 1))
        self.assertEqual(self.run_command('status')['pending_ids'], ['022'])
        self.assertEqual(self.run_command('batch', '--ids', '018')['batch'][0]['id'], '018')
        self.assertEqual(self.run_command('status', '--force')['pending'], 2)

    def test_changed_article_invalidates_checkpoint(self):
        self.apply([self.decision('keep')], write=True)
        self.data[0]['content'] += '<p>New meaning.</p>'
        self.posts.write_bytes(review.encoded(self.data))
        self.assertEqual(self.run_command('status')['pending'], 2)

    def test_unresolved_remains_pending(self):
        self.apply([self.decision('needs_review')], write=True)
        self.assertEqual(self.run_command('status')['pending'], 2)

    def test_reject_stale_duplicate_and_outside_schema_without_writes(self):
        stale = self.decision()
        stale['input_hash'] = 'outdated'
        cases = [[stale], [self.decision(), self.decision()],
                 [self.decision(patch={'title': 'Unexpected'})],
                 [self.decision(patch={'secondary_subjects': ['flowing_river']})],
                 [self.decision(patch={'concept': []})]]
        raw = self.posts.read_bytes()
        for decisions in cases:
            with self.subTest(decisions=decisions):
                with self.assertRaises(ValueError):
                    self.apply(decisions, write=True)
                self.assertEqual(self.posts.read_bytes(), raw)
                self.assertFalse(self.state.exists())

    def test_state_and_review_cannot_overwrite_source(self):
        with self.assertRaises(ValueError):
            review.main(['status', '--posts', str(self.posts), '--state', str(self.posts)])
        with self.assertRaises(ValueError):
            self.run_command('apply', '--review', str(self.state), '--write')

    def test_content_marker_does_not_confuse_field_patching(self):
        self.data[0]['content'] = '<p>Text with "illustration": {"concept": "unrelated"}.</p>'
        self.posts.write_bytes(review.encoded(self.data))
        self.apply([self.decision()], write=True)
        actual = review.read_json(self.posts)
        self.assertEqual(actual[0]['content'], self.data[0]['content'])
        self.assertNotEqual(actual[0]['illustration']['concept'], self.data[0]['illustration']['concept'])


if __name__ == '__main__':
    unittest.main()
