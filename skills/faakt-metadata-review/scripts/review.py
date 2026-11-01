#!/usr/bin/env python3
"""Prepare review batches and apply guarded illustration-only patches. Stdlib only."""
import argparse
import copy
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import sys
import tempfile

REVIEW_VERSION = 1


def digest(value):
    raw = json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':'))
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode('utf-8')


def atomic_write(path, raw):
    path.parent.mkdir(parents=True, exist_ok=True)
    name = None
    try:
        with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as stream:
            name = stream.name
            stream.write(raw)
        os.replace(name, path)
    finally:
        if name and os.path.exists(name):
            os.unlink(name)


class Text(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)

    def handle_starttag(self, tag, attrs):
        if tag in {'p', 'br', 'li', 'h1', 'h2', 'h3'}:
            self.parts.append('\n')

    def handle_endtag(self, tag):
        if tag in {'p', 'li', 'h1', 'h2', 'h3'}:
            self.parts.append('\n')


def validate_metadata(meta, old):
    if set(meta) != set(old):
        raise ValueError('Illustration schema changed')
    for key, value in meta.items():
        if type(value) is not type(old[key]):
            raise ValueError(f'Wrong type: {key}')
        if isinstance(value, str) and not value.strip():
            raise ValueError(f'Empty string: {key}')
        if isinstance(value, list):
            if any(not isinstance(x, str) or not x.strip() for x in value):
                raise ValueError(f'Invalid array item: {key}')
            if len(value) != len(set(value)):
                raise ValueError(f'Duplicate items: {key}')
    if meta.get('scene_type') not in {'object', 'portrait', 'interaction', 'environment',
                                     'diagram', 'process', 'story', 'narrative'}:
        raise ValueError('Unsupported scene_type; inspect current schema before adapting helper')
    subjects = [meta.get('primary_subject')] + meta.get('secondary_subjects', [])
    if any(not isinstance(x, str) or not re.fullmatch(r'[a-z][a-z0-9_]*', x) for x in subjects):
        raise ValueError('Subjects must be snake_case machine keys')
    if len(subjects) != len(set(subjects)):
        raise ValueError('Repeated primary/secondary subject')


def patch_bytes(raw, changes):
    """Parse actual object fields so markers inside content cannot be mistaken for keys."""
    bom = raw.startswith(b'\xef\xbb\xbf')
    text = raw.decode('utf-8-sig')
    decoder = json.JSONDecoder()
    position = text.index('[') + 1
    replacements = []
    while True:
        while text[position].isspace() or text[position] == ',':
            position += 1
        if text[position] == ']':
            break
        post, end = decoder.raw_decode(text, position)
        if post['id'] in changes:
            field = position + 1
            while field < end:
                while text[field].isspace() or text[field] == ',':
                    field += 1
                if text[field] == '}':
                    break
                key, field = decoder.raw_decode(text, field)
                while text[field].isspace():
                    field += 1
                if text[field] != ':':
                    raise ValueError('Expected JSON field separator')
                field += 1
                while text[field].isspace():
                    field += 1
                _, value_end = decoder.raw_decode(text, field)
                if key == 'illustration':
                    start = text.rfind('\n', 0, field) + 1
                    indent = re.match(r'[ \t]*', text[start:]).group()
                    newline = '\r\n' if '\r\n' in text else '\n'
                    value = json.dumps(changes[post['id']], ensure_ascii=False, indent=2)
                    replacements.append((field, value_end, value.replace('\n', newline + indent)))
                    break
                field = value_end
        position = end
    if len(replacements) != len(changes):
        raise ValueError('Could not locate all illustration fields')
    for start, end, value in reversed(replacements):
        text = text[:start] + value + text[end:]
    return (b'\xef\xbb\xbf' if bom else b'') + text.encode('utf-8')


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['batch', 'apply', 'status'])
    parser.add_argument('--posts', type=Path, default=Path('static/data/posts.json'))
    parser.add_argument('--state', type=Path, required=True)
    parser.add_argument('--limit', type=int, default=12)
    parser.add_argument('--ids')
    parser.add_argument('--force', action='store_true')
    parser.add_argument('--review', type=Path)
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args(argv)
    if args.limit < 1:
        raise ValueError('--limit must be positive')
    paths = [args.posts.resolve(), args.state.resolve()]
    if args.review:
        paths.append(args.review.resolve())
    if len(paths) != len(set(paths)):
        raise ValueError('Posts, state and review need distinct paths')
    raw = args.posts.read_bytes()
    posts = json.loads(raw.decode('utf-8-sig'))
    if not isinstance(posts, list) or any(not isinstance(p, dict) for p in posts):
        raise ValueError('Posts must be an array of objects')
    index = {p['id']: p for p in posts}
    if len(index) != len(posts) or any(not isinstance(k, str) for k in index):
        raise ValueError('IDs must be unique strings')
    origin = str(args.posts.resolve())
    state_raw = args.state.read_bytes() if args.state.exists() else None
    state = json.loads(state_raw.decode('utf-8-sig')) if state_raw else {
        'version': REVIEW_VERSION, 'posts_path': origin, 'records': {}}
    if state.get('version') != REVIEW_VERSION or state.get('posts_path') != origin:
        raise ValueError('State belongs to a different dataset or review version')
    records = state['records']
    pending = [p for p in posts if args.force or records.get(p['id'], {}).get('hash') != digest(p)
               or records.get(p['id'], {}).get('verdict') not in {'keep', 'change'}]
    if args.command == 'status':
        return {'total': len(posts), 'current_reviewed': len(posts) - len(pending),
                'pending': len(pending), 'pending_ids': [p['id'] for p in pending]}
    if args.command == 'batch':
        if args.ids:
            ids = args.ids.split(',')
            if len(ids) != len(set(ids)) or any(id not in index for id in ids):
                raise ValueError('Requested IDs must exist and be unique')
            selected = [index[id] for id in ids]
        else:
            selected = pending[:args.limit]
        result = []
        for p in selected:
            reader = Text()
            reader.feed(p.get('content', ''))
            result.append({'id': p['id'], 'input_hash': digest(p), 'title': p.get('title'),
                           'category': p.get('category'), 'content_text': ''.join(reader.parts).strip(),
                           'illustration': p.get('illustration'), 'sources': p.get('sources', [])})
        return {'total': len(posts), 'pending': len(pending), 'batch': result}
    if not args.review:
        raise ValueError('apply requires --review')
    decisions = read_json(args.review)
    if not isinstance(decisions, list) or not decisions:
        raise ValueError('Review must be a nonempty array')
    updated = copy.deepcopy(posts)
    target = {p['id']: p for p in updated}
    changes, seen = {}, set()
    counts = {'keep': 0, 'change': 0, 'needs_review': 0}
    for decision in decisions:
        if set(decision) - {'id', 'input_hash', 'verdict', 'reason', 'illustration'}:
            raise ValueError('Unexpected review fields')
        id = decision['id']
        if id in seen or id not in index:
            raise ValueError(f'Duplicate or unknown ID: {id}')
        seen.add(id)
        p = index[id]
        if decision.get('input_hash') != digest(p):
            raise ValueError(f'Stale review: {id}; reread the current record')
        verdict = decision.get('verdict')
        if verdict not in counts or not isinstance(decision.get('reason'), str) or not decision['reason'].strip():
            raise ValueError(f'Invalid verdict or missing reason: {id}')
        patch = decision.get('illustration', {})
        if not isinstance(patch, dict) or (verdict != 'change' and patch):
            raise ValueError('Only change decisions may patch metadata')
        if verdict == 'change':
            old = p.get('illustration')
            if not isinstance(old, dict) or not patch or set(patch) - set(old):
                raise ValueError('Patch must update existing illustration fields')
            meta = {**old, **patch}
            validate_metadata(meta, old)
            if meta == old:
                raise ValueError(f'No actual change: {id}; use keep')
            target[id]['illustration'] = meta
            changes[id] = meta
        counts[verdict] += 1
        records[id] = {'hash': digest(target[id]), 'verdict': verdict, 'reason': decision['reason']}
    output = patch_bytes(raw, changes) if changes else raw
    if json.loads(output.decode('utf-8-sig')) != updated:
        raise ValueError('Unexpected output changes')
    if args.write:
        if args.posts.read_bytes() != raw:
            raise ValueError('Posts changed concurrently; reread before applying')
        current_state = args.state.read_bytes() if args.state.exists() else None
        if current_state != state_raw:
            raise ValueError('State changed concurrently; reread before applying')
        if changes:
            atomic_write(args.posts, output)
        atomic_write(args.state, encoded(state))
    return {'write': args.write, 'reviewed': len(decisions), **counts,
            'changes': {id: {key: {'before': index[id]['illustration'][key], 'after': value}
                              for key, value in meta.items() if value != index[id]['illustration'][key]}
                        for id, meta in changes.items()}}


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    try:
        print(json.dumps(main(), ensure_ascii=False, indent=2))
    except (ValueError, KeyError, TypeError, OSError, IndexError) as error:
        print(json.dumps({'error': str(error)}, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)
