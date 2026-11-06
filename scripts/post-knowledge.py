#!/usr/bin/env python3
"""Local post semantics, controlled tags and guarded editorial workflow. Stdlib only."""
import argparse
from collections import Counter, defaultdict
from datetime import date
import hashlib
from html import unescape
import json
import math
import os
from pathlib import Path
import re
import sys
import tempfile
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
VERSION = 1
TYPES = {'principle', 'theory', 'event', 'discovery', 'work', 'practice', 'open-question'}
SLUG = re.compile(r'^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$')


def read(path):
    return json.loads(Path(path).read_text(encoding='utf-8-sig'))


def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True,
                                     separators=(',', ':')).encode()).hexdigest()


def file_hash(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def write(path, value):
    write_bytes(path, (json.dumps(value, ensure_ascii=False, indent=2)+'\n').encode())


def write_bytes(path, raw):
    path = Path(path)
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


def normalize(text):
    return ''.join(c for c in unicodedata.normalize('NFKD', text.lower())
                   if not unicodedata.combining(c))


def tokens(text):
    # Light prefix matching handles many Czech inflections without a model.
    stop = {'ktery', 'ktera', 'ktere', 'jako', 'nebo', 'take', 'jeho', 'bylo', 'byla',
            'jsou', 'neni', 'mezi', 'podle', 'muze', 'pred', 'proti', 'toho', 'teto',
            'kdyz', 'proto', 'misto', 'pomoci', 'cast', 'svych', 'jejich'}
    return {w[:6] for w in re.findall(r'[a-z0-9]+', normalize(text))
            if len(w) >= 3 and w not in stop}


def source_hash(post):
    return digest({key: post.get(key) for key in ['id', 'title', 'content', 'category', 'sources']})


def valid_categories():
    source=(ROOT/'src/lib/categories.js').read_text(encoding='utf-8')
    values=set(re.findall(r"^\s*'([a-z-]+)':\s*\{",source,re.M))
    if not values: raise ValueError('Cannot read central category definitions')
    return values


def attach_knowledge(posts, data):
    if data.get('version') != VERSION:
        raise ValueError('Unsupported knowledge sidecar version')
    ids = {p['id'] for p in posts}
    if set(data['posts']) - ids:
        raise ValueError('Knowledge sidecar refers to absent posts')
    result = []
    for source in posts:
        if 'knowledge' in source:
            raise ValueError('Keep knowledge in sidecar files, not posts.json')
        post = dict(source)
        assignment = data['posts'].get(post['id'])
        if assignment is not None:
            if set(assignment) != {'idea', 'tags'} or assignment['idea'] not in data['ideas']:
                raise ValueError('Invalid knowledge assignment: '+post['id'])
            definition = data['ideas'][assignment['idea']]
            if set(definition) != {'point', 'type'}:
                raise ValueError('Invalid idea definition')
            post['knowledge'] = {**definition, **assignment}
        result.append(post)
    return result


def split_knowledge(posts):
    result = {'version': VERSION, 'ideas': {}, 'posts': {}}
    for p in posts:
        m = p.get('knowledge')
        if not m:
            continue
        definition = {'point': m['point'], 'type': m['type']}
        if m['idea'] in result['ideas'] and result['ideas'][m['idea']] != definition:
            raise ValueError('Conflicting definitions for '+m['idea'])
        result['ideas'][m['idea']] = definition
        result['posts'][p['id']] = {'idea': m['idea'], 'tags': m['tags']}
    return result


def save_knowledge(args, posts):
    data = split_knowledge(posts)
    write(args.ideas_file, {'version': VERSION, 'ideas': data['ideas']})
    write(args.knowledge, {'version': VERSION, 'posts': data['posts']})


def vocabulary(data):
    if data.get('version') != VERSION or data.get('types') != sorted(TYPES):
        raise ValueError('Unsupported vocabulary version or content types')
    tags = {}
    for tag in data['tags']:
        if set(tag) != {'id', 'kind', 'parent', 'label', 'aliases'}:
            raise ValueError('Wrong tag fields')
        if not SLUG.fullmatch(tag['id']) or tag['id'] in tags:
            raise ValueError('Duplicate or invalid tag ID: '+str(tag.get('id')))
        if tag['kind'] not in {'topic', 'theme', 'entity'} or not tag['label'].strip():
            raise ValueError('Invalid tag definition: '+tag['id'])
        if not isinstance(tag['aliases'], list) or any(not isinstance(x, str) or not x.strip() for x in tag['aliases']):
            raise ValueError('Invalid aliases: '+tag['id'])
        tags[tag['id']] = tag
    for tag in tags.values():
        seen = {tag['id']}
        current = tag
        while current['parent'] is not None:
            parent = current['parent']
            if parent not in tags or parent in seen:
                raise ValueError('Missing parent or cycle: '+tag['id'])
            if current['kind'] != 'topic' or tags[parent]['kind'] != 'topic':
                raise ValueError('Only topic tags have topic parents')
            seen.add(parent)
            current = tags[parent]
    return tags


def validate_knowledge(meta, tags):
    if not isinstance(meta, dict) or set(meta) != {'idea', 'point', 'tags', 'type'}:
        raise ValueError('knowledge must contain exactly idea, point, tags, type')
    if not isinstance(meta['idea'], str) or not SLUG.fullmatch(meta['idea']):
        raise ValueError('Invalid stable idea ID')
    point = meta['point']
    if not isinstance(point, str) or not 30 <= len(point) <= 300 or re.search(r'[<>\n\r]', point):
        raise ValueError('point must be 30–300 characters of plain Czech text')
    if point != point.strip() or not point.endswith(('.', '!', '?')):
        raise ValueError('point must be a complete, trimmed sentence')
    if meta['type'] not in TYPES:
        raise ValueError('Unsupported knowledge type')
    values = meta['tags']
    if not isinstance(values, list) or not 2 <= len(values) <= 6 or any(not isinstance(t, str) for t in values):
        raise ValueError('Use 2–6 tag IDs')
    if len(set(values)) != len(values) or any(t not in tags for t in values):
        raise ValueError('Duplicate or unknown tag ID')
    if not any(tags[t]['kind'] == 'topic' for t in values):
        raise ValueError('At least one topic tag is required')
    for t in values:
        parent = tags[t]['parent']
        while parent:
            if parent in values:
                raise ValueError('Do not repeat an ancestor already implied by a topic tag')
            parent = tags[parent]['parent']


def tag_hash(meta, tags):
    ids = set(meta['tags'])
    for key in list(ids):
        while tags[key]['parent']:
            key = tags[key]['parent']
            ids.add(key)
    # Adding aliases or unrelated vocabulary does not invalidate existing reviews.
    return digest([{k: tags[t][k] for k in ['id', 'kind', 'parent', 'label']}
                   for t in sorted(ids)])


def review_entry(post, tags, reviewer, reviewed_at):
    return {'version': VERSION, 'source_hash': source_hash(post),
            'knowledge_hash': digest(post['knowledge']),
            'tags_hash': tag_hash(post['knowledge'], tags), 'status': 'verified',
            'reviewer': reviewer, 'reviewed_at': reviewed_at}


def inspect(posts, tags, state):
    problems = []
    ideas = {}
    ids = set()
    for p in posts:
        id = p.get('id')
        if not isinstance(id, str) or not re.fullmatch(r'[1-9][0-9]*', id) or id in ids:
            problems.append({'id': id, 'reason': 'invalid or duplicate post ID'})
            continue
        ids.add(id)
        try:
            validate_knowledge(p.get('knowledge'), tags)
            m = p['knowledge']
            definition = (m['point'], m['type'])
            if m['idea'] in ideas and ideas[m['idea']] != definition:
                raise ValueError('One idea ID has conflicting points/types')
            ideas[m['idea']] = definition
            r = state.get('reviews', {}).get(id, {})
            if r.get('status') != 'verified' or r.get('version') != VERSION:
                raise ValueError('missing semantic review')
            if r.get('source_hash') != source_hash(p):
                raise ValueError('source changed since review')
            if r.get('knowledge_hash') != digest(m):
                raise ValueError('knowledge changed since review')
            if r.get('tags_hash') != tag_hash(m, tags):
                raise ValueError('used tag definition changed since review')
        except (ValueError, TypeError, KeyError) as e:
            problems.append({'id': id, 'reason': str(e)})
    return problems


def catalog(posts):
    groups = {}
    for p in posts:
        m = p['knowledge']
        g = groups.setdefault(m['idea'], {'idea': m['idea'], 'point': m['point'],
                                        'type': m['type'], 'tags': set(), 'ids': []})
        g['ids'].append(p['id'])
        g['tags'].update(m['tags'])
    for g in groups.values():
        g['tags'] = sorted(g['tags'])
        g['ids'].sort(key=int)
    return sorted(groups.values(), key=lambda g: int(g['ids'][0]))


def expanded_tags(ids, tags):
    result = set(ids)
    for key in ids:
        while tags[key]['parent']:
            key = tags[key]['parent']
            result.add(key)
    return result


def search(posts, tags, query='', selected=(), idea=None, limit=12):
    selected = set(selected)
    unknown = selected - tags.keys()
    if unknown:
        raise ValueError('Unknown tags: '+', '.join(sorted(unknown)))
    query_tokens = tokens(query)
    query_norm = normalize(query)
    # Aliases expand concept searches into the same shared vocabulary.
    aliases = {t['id'] for t in tags.values() if query_norm and
               any(re.search(r'(?<![a-z0-9])'+re.escape(normalize(a))+r'(?![a-z0-9])', query_norm)
                   for a in [t['label'], *t['aliases']] if len(normalize(a)) >= 2)}
    documents = []
    for p in posts:
        m = p.get('knowledge')
        if not m:
            continue
        labels = ' '.join(tags[t]['label']+' '+' '.join(tags[t]['aliases']) for t in m['tags'])
        # Full text is searched locally, but never sent to the model by default.
        text = ' '.join([p['title'], m['point'], m['idea'], labels,
                         unescape(re.sub('<[^>]+>', ' ', p['content']))])
        documents.append((p, tokens(text), expanded_tags(m['tags'], tags)))
    frequency = Counter(t for _, terms, _ in documents for t in terms)
    ranked = []
    for p, terms, all_tags in documents:
        m = p['knowledge']
        lexical = sum(math.log(1+len(documents)/(1+frequency[t])) for t in query_tokens & terms)
        direct = len((selected | aliases) & set(m['tags']))
        ancestor = len((selected | aliases) & all_tags)
        exact = bool(idea and m['idea'] == idea)
        score = lexical + 4*direct + ancestor + 1000*exact
        if (not query.strip() and not selected and not idea) or score > 0:
            ranked.append({'id': p['id'], 'idea': m['idea'], 'point': m['point'],
                           'type': m['type'], 'tags': m['tags'],
                           'score': round(score, 3), 'same_idea': exact})
    groups = {}
    members = defaultdict(list)
    for p in posts:
        if p.get('knowledge'):
            members[p['knowledge']['idea']].append(p['id'])
    for row in sorted(ranked, key=lambda x: (-x['score'], int(x['id']))):
        if row['idea'] not in groups:
            groups[row['idea']] = {**row, 'ids': sorted(members[row['idea']], key=int)}
    return list(groups.values())[:limit]


def snapshot(posts, tags):
    return digest({'posts': [{'source': source_hash(p), 'knowledge': p.get('knowledge')}
                             for p in posts], 'tags': tags, 'version': VERSION})


def draft_check(posts, drafts, tags, fill_gaps=False):
    existing_ideas = defaultdict(list)
    existing_points = defaultdict(list)
    for p in posts:
        existing_ideas[p['knowledge']['idea']].append(p['id'])
        existing_points[normalize(p['knowledge']['point'])].append(p['id'])
    errors, seen_ideas, seen_ids, seen_points, rows = [], set(), set(), set(), []
    max_id = max((int(p['id']) for p in posts), default=0)
    available = [str(i) for i in range(1, max_id) if str(i) not in {p['id'] for p in posts}] if fill_gaps else []
    for offset, p in enumerate(drafts, 1):
        id = p.get('id')
        try:
            if set(p) != {'id','title','content','category','sources','illustration','knowledge'}:
                raise ValueError('Draft fields must match article schema plus working knowledge')
            validate_knowledge(p.get('knowledge'), tags)
            expected = available[offset-1] if fill_gaps and offset <= len(available) else str(max_id+offset-len(available))
            if id != expected or id in seen_ids:
                raise ValueError('Draft IDs must follow the current maximum in order')
            m = p['knowledge']
            if m['idea'] in existing_ideas:
                raise ValueError('Already covered idea: '+','.join(existing_ideas[m['idea']]))
            if normalize(m['point']) in existing_points:
                raise ValueError('Same point under another idea ID')
            if m['idea'] in seen_ideas:
                raise ValueError('Repeated idea within draft batch')
            if normalize(m['point']) in seen_points:
                raise ValueError('Repeated point within draft batch under another ID')
            if not p.get('title') or not p.get('content') or not p.get('illustration'):
                raise ValueError('Complete article and illustration metadata required')
            if not 500 <= len(p['content']) <= 1200 or len(p['title']) > 80:
                raise ValueError('Article lengths do not match editorial requirements')
            if not isinstance(p.get('sources'), list) or not 2 <= len(p['sources']) <= 3:
                raise ValueError('2–3 sources are required')
            for source in p['sources']:
                if (not isinstance(source, dict) or set(source) != {'label','url'} or
                    not isinstance(source['label'], str) or not source['label'].strip() or
                    not isinstance(source['url'], str) or not re.match(r'^https?://[^\s/]+/', source['url'])):
                    raise ValueError('Invalid source fields/URL; factual verification remains editorial')
            if any(tag not in {'<p>','</p>','<strong>','</strong>','<em>','</em>'}
                   for tag in re.findall(r'<[^>]*>', p['content'])):
                raise ValueError('Unsupported HTML markup')
            hook = re.match(r'<p>(.*?)</p>', p['content'], re.S)
            if not hook or not 2 <= len(re.findall(r'[.!?](?:\s|$)', re.sub('<[^>]*>', '', hook[1]))) <= 3:
                raise ValueError('Hook requires 2–3 sentences')
            art = p['illustration']
            if not isinstance(art, dict) or set(art) != {'concept','scene_type','primary_subject','secondary_subjects','visual_keywords','composition_hints','mood','palette'}:
                raise ValueError('Complete illustration schema required')
            if any(not isinstance(art[k], str) or not art[k].strip() for k in ['concept','scene_type','primary_subject','mood','palette']):
                raise ValueError('Invalid illustration string')
            if any(not isinstance(art[k], list) or any(not isinstance(x,str) or not x.strip() for x in art[k]) for k in ['secondary_subjects','visual_keywords','composition_hints']):
                raise ValueError('Invalid illustration array')
            if not 3 <= len(art['visual_keywords']) <= 6:
                raise ValueError('Illustration requires 3–6 visual keywords')
            if art['scene_type'] not in {'portrait','interaction','process','diagram','environment','object'} or art['mood'] not in {'contemplative','dramatic','dynamic','mysterious','neutral','playful'} or art['palette'] not in {'blue_gold','green_copper','indigo_cyan','monochrome_cool','monochrome_warm','teal_amber','terracotta_cream','violet_coral'}:
                raise ValueError('Unsupported illustration enum')
            if p['category'] not in valid_categories():
                raise ValueError('Unknown category')
            seen_ideas.add(m['idea']); seen_ids.add(id); seen_points.add(normalize(m['point']))
            rows.append({'id': id, 'candidates': search(posts, tags, m['point'], m['tags'], m['idea'])})
        except (ValueError, TypeError, KeyError) as e:
            errors.append({'id': id, 'reason': str(e)})
    return {'errors': errors, 'candidates': rows, 'semantic_approval': 'required'}


def validate_plan(posts, plan, tags, fill_gaps=False):
    current = snapshot(posts, tags)
    if plan.get('snapshot') != current or plan.get('catalog_reviewed') != current:
        raise ValueError('Plan requires current snapshot and explicit complete-catalog review')
    proposals = plan.get('proposals')
    if not isinstance(proposals, list) or not proposals:
        raise ValueError('Plan must contain proposals')
    ids = {p['id'] for p in posts}
    ideas = {p['knowledge']['idea'] for p in posts}
    points = {normalize(p['knowledge']['point']) for p in posts}
    categories = valid_categories()
    maximum = max(map(int, ids), default=0)
    available = [str(i) for i in range(1, maximum) if str(i) not in ids] if fill_gaps else []
    for offset, p in enumerate(proposals, 1):
        validate_knowledge(p.get('knowledge'), tags)
        expected = available[offset-1] if fill_gaps and offset <= len(available) else str(maximum+offset-len(available))
        if p.get('id') != expected or p.get('category') not in categories:
            raise ValueError('Plan ID/category invalid')
        m = p['knowledge']
        if m['idea'] in ideas or normalize(m['point']) in points:
            raise ValueError('Plan repeats a covered or within-plan idea')
        ideas.add(m['idea']); points.add(normalize(m['point']))
        if p.get('verdict') != 'accept' or len(p.get('reason', '').strip()) < 30:
            raise ValueError('Explicit, explained acceptance required for each proposal')
        if not isinstance(p.get('compared_ids'), list) or not set(p['compared_ids']) <= ids:
            raise ValueError('Invalid compared IDs in plan')
    return proposals


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--posts', type=Path, default=ROOT/'static/data/posts.json')
    parser.add_argument('--tags-file', type=Path, default=ROOT/'static/data/tags.json')
    parser.add_argument('--knowledge', type=Path, default=ROOT/'static/data/post-knowledge.json')
    parser.add_argument('--ideas-file', type=Path, default=ROOT/'static/data/knowledge-ideas.json')
    parser.add_argument('--state', type=Path, default=ROOT/'editorial/knowledge-state.json')
    sub = parser.add_subparsers(dest='command', required=True)
    sub.add_parser('status')
    sub.add_parser('validate')
    tag_cmd = sub.add_parser('tags')
    tag_cmd.add_argument('--query', default='')
    tag_cmd.add_argument('--kind', choices=['topic', 'theme', 'entity'])
    cat = sub.add_parser('catalog')
    cat.add_argument('--offset', type=int, default=0)
    cat.add_argument('--limit', type=int, default=100)
    cat.add_argument('--details', action='store_true', help='JSONL with tags/type instead of compact TSV')
    find = sub.add_parser('search')
    find.add_argument('--query', default='')
    find.add_argument('--tags', default='')
    find.add_argument('--idea')
    find.add_argument('--limit', type=int, default=12)
    show = sub.add_parser('show')
    show.add_argument('--ids', required=True)
    batch = sub.add_parser('review-batch')
    batch.add_argument('--limit', type=int, default=12)
    batch.add_argument('--ids', default='')
    apply = sub.add_parser('apply-review')
    apply.add_argument('--review', type=Path, required=True)
    apply.add_argument('--write', action='store_true')
    for name in ['check-drafts', 'append']:
        cmd = sub.add_parser(name)
        cmd.add_argument('--drafts', type=Path, required=True)
        cmd.add_argument('--fill-gaps', action='store_true', help='Use only when the user explicitly requests filling missing IDs')
        if name == 'append': cmd.add_argument('--approval', type=Path, required=True)
    plan_cmd = sub.add_parser('check-plan')
    plan_cmd.add_argument('--plan', type=Path, required=True)
    plan_cmd.add_argument('--fill-gaps', action='store_true', help='Use only when the user explicitly requests filling missing IDs')
    args = parser.parse_args(argv)
    input_paths = [args.posts, args.knowledge, args.ideas_file, args.tags_file, args.state]
    input_hashes = {p: file_hash(p) if p.exists() else None for p in input_paths}

    def guard_inputs():
        for p, expected in input_hashes.items():
            if (file_hash(p) if p.exists() else None) != expected:
                raise ValueError('Input changed before write: '+str(p))

    source_bytes = args.posts.read_bytes()
    source_posts = json.loads(source_bytes.decode('utf-8-sig'))
    original_source_hash = hashlib.sha256(source_bytes).hexdigest()
    knowledge = read(args.knowledge) if args.knowledge.exists() else {'version': VERSION, 'ideas': {}, 'posts': {}}
    if 'ideas' not in knowledge:
        definitions = read(args.ideas_file)
        if definitions.get('version') != VERSION: raise ValueError('Unsupported idea registry version')
        knowledge['ideas'] = definitions['ideas']
    posts = attach_knowledge(source_posts, knowledge)
    data = read(args.tags_file)
    tags = vocabulary(data)
    state = read(args.state) if args.state.exists() else {'version': VERSION, 'reviews': {}}
    problems = inspect(posts, tags, state)
    if args.command == 'tags':
        query = normalize(args.query)
        for t in tags.values():
            if args.kind and t['kind'] != args.kind: continue
            if query and query not in normalize(' '.join([t['id'],t['label'],*t['aliases']])): continue
            print('\t'.join([t['id'],t['kind'],t['parent'] or '-',t['label'],'; '.join(t['aliases'])]))
        return 0
    if args.command in {'status', 'validate'}:
        out = {'records': len(posts), 'verified': len(posts)-len(problems), 'problems': problems,
               'snapshot': snapshot(posts, tags), 'database_sha256': file_hash(args.posts)}
        if not problems:
            groups = catalog(posts)
            out.update({'ideas': len(groups), 'duplicate_groups': [g for g in groups if len(g['ids']) > 1],
                        'compact_catalog_chars': sum(len(','.join(g['ids']))+len(g['idea'])+len(g['point'])+3 for g in groups),
                        'full_text_chars': sum(len(p['title'])+len(p['content']) for p in posts)})
        # Status is deliberately short; validate includes duplicate details.
        if args.command == 'status': out.pop('duplicate_groups', None)
        print(json.dumps(out, ensure_ascii=False, indent=2))
        return int(bool(problems))
    if args.command == 'review-batch':
        ids = set(args.ids.split(',')) if args.ids else {x['id'] for x in problems}
        rows = [{'id': p['id'], 'source_hash': source_hash(p), 'title': p['title'],
                 'content': p['content'], 'category': p['category'], 'knowledge': p.get('knowledge')}
                for p in posts if p['id'] in ids][:args.limit]
        print(json.dumps(rows, ensure_ascii=False, indent=2)); return 0
    if args.command == 'apply-review':
        review = read(args.review)
        before = original_source_hash
        knowledge_before = file_hash(args.knowledge) if args.knowledge.exists() else None
        by_id = {p['id']: p for p in posts}
        touched = set()
        for r in review:
            id = r['id']
            if id in touched or id not in by_id or r.get('source_hash') != source_hash(by_id[id]):
                raise ValueError('Duplicate, unknown or stale review: '+str(id))
            if r.get('verdict') != 'verified' or not r.get('reason', '').strip():
                raise ValueError('Only explained, explicitly verified semantic reviews can be applied')
            validate_knowledge(r['knowledge'], tags)
            by_id[id]['knowledge'] = r['knowledge']
            state['reviews'][id] = review_entry(by_id[id], tags, r.get('reviewer', 'editor'),
                                               r.get('reviewed_at', date.today().isoformat()))
            touched.add(id)
        after_problems = inspect(posts, tags, state)
        if any(p['id'] in touched for p in after_problems):
            raise ValueError('Reviewed records still invalid: '+json.dumps(after_problems, ensure_ascii=False))
        if args.write:
            guard_inputs()
            if file_hash(args.posts) != before: raise ValueError('Database changed before write')
            if (file_hash(args.knowledge) if args.knowledge.exists() else None) != knowledge_before:
                raise ValueError('Knowledge sidecar changed before write')
            save_knowledge(args, posts); write(args.state, state)
        print(json.dumps({'reviewed': len(touched), 'written': args.write,
                          'remaining': len(after_problems)})); return 0
    if problems:
        raise ValueError('Metadata missing/stale; run status and review-batch before using the catalog')
    if args.command == 'catalog':
        if args.offset < 0 or not 1 <= args.limit <= 1000: raise ValueError('Invalid pagination')
        groups = catalog(posts)
        print(json.dumps({'snapshot': snapshot(posts, tags), 'records': len(posts), 'ideas': len(groups),
                          'offset': args.offset, 'returned': len(groups[args.offset:args.offset+args.limit])}))
        for g in groups[args.offset:args.offset+args.limit]:
            print(json.dumps(g, ensure_ascii=False, separators=(',', ':')) if args.details else
                  '\t'.join([','.join(g['ids']), g['idea'], g['point']]))
    elif args.command == 'search':
        if not 1 <= args.limit <= 100: raise ValueError('Search limit must be 1–100')
        print(json.dumps({'snapshot': snapshot(posts, tags), 'searched_records': len(posts),
                          'warning': 'Candidate ranking, not a semantic originality verdict',
                          'results': search(posts, tags, args.query, [t for t in args.tags.split(',') if t], args.idea, args.limit)},
                         ensure_ascii=False, indent=2))
    elif args.command == 'show':
        ids = set(args.ids.split(','))
        if ids - {p['id'] for p in posts}: raise ValueError('Unknown requested IDs')
        print(json.dumps([{'id': p['id'], 'title': p['title'], 'content': p['content'],
                           'knowledge': p['knowledge']} for p in posts if p['id'] in ids], ensure_ascii=False, indent=2))
    elif args.command == 'check-plan':
        plan = read(args.plan)
        proposals = validate_plan(posts, plan, tags, args.fill_gaps)
        print(json.dumps({'accepted_proposals': len(proposals), 'snapshot': snapshot(posts, tags)}))
    elif args.command in {'check-drafts', 'append'}:
        drafts = read(args.drafts)
        result = draft_check(posts, drafts, tags, args.fill_gaps)
        result.update({'snapshot': snapshot(posts, tags), 'drafts_hash': digest(drafts)})
        if args.command == 'check-drafts':
            print(json.dumps(result, ensure_ascii=False, indent=2)); return int(bool(result['errors']))
        if not drafts or result['errors']: raise ValueError('Draft validation failed')
        approval = read(args.approval)
        if approval.get('snapshot') != result['snapshot'] or approval.get('drafts_hash') != digest(drafts):
            raise ValueError('Approval is stale or refers to another dataset/draft batch')
        if approval.get('catalog_reviewed') != result['snapshot']:
            raise ValueError('Explicit review of the complete compact catalog is required')
        decisions = approval.get('decisions', [])
        if len(decisions) != len(drafts) or {d['id'] for d in decisions} != {p['id'] for p in drafts}:
            raise ValueError('One editorial decision per draft required')
        by_decision = {d['id']: d for d in decisions}
        old_ids = {p['id'] for p in posts}
        for p in drafts:
            d = by_decision[p['id']]
            if d.get('verdict') != 'accept' or len(d.get('reason', '').strip()) < 30:
                raise ValueError('Unexplained or rejected draft')
            if not isinstance(d.get('compared_ids'), list) or not set(d['compared_ids']) <= old_ids:
                raise ValueError('Invalid compared IDs')
            if not d.get('final_text_reviewed') or not d.get('within_batch_reviewed') or not d.get('sources_verified'):
                raise ValueError('Final text, within-batch review and source verification required')
        before = original_source_hash
        for p in drafts:
            state['reviews'][p['id']] = review_entry(p, tags, approval.get('reviewer', 'editor'), date.today().isoformat())
        combined = posts+drafts
        if inspect(combined, tags, state): raise ValueError('Combined dataset invalid')
        guard_inputs()
        if file_hash(args.posts) != before: raise ValueError('Database changed before append')
        addition = [{k: v for k, v in p.items() if k != 'knowledge'} for p in drafts]
        end = source_bytes.rfind(b']')
        encoded_addition = json.dumps(addition, ensure_ascii=False, indent=2)[2:-2].encode()
        prefix = source_bytes[:end].rstrip()
        output = prefix+(b',\n' if source_posts else b'\n')+encoded_addition+b'\n]\n'
        if json.loads(output) != source_posts+addition: raise ValueError('Append serialization failed')
        write_bytes(args.posts, output)
        save_knowledge(args, combined); write(args.state, state)
        print(json.dumps({'appended': len(drafts), 'records': len(combined)}))
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (ValueError, KeyError, TypeError, OSError) as e:
        print(json.dumps({'error': str(e)}, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)
