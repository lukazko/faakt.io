"""One-time curated backfill. Canonical points/tags are in the adjacent TSV files."""
import importlib.util
import json
from pathlib import Path
import tempfile

root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('knowledge',root/'scripts/post-knowledge.py')
k=importlib.util.module_from_spec(spec); spec.loader.exec_module(k)
posts_path=root/'static/data/posts.json'
expected='e5509c3937a3a2550a904e52d43d891a856b6f222bb4ab31f7b4a4282f2c008b'
assert k.file_hash(posts_path)==expected, 'Text dataset changed: inspect differences before backfill'
posts=k.read(posts_path)
tags=[]
for line in (root/'reports/knowledge-tags-seed.tsv').read_text(encoding='utf-8').splitlines():
    if not line or line.startswith('#'): continue
    id,kind,parent,label,aliases=line.split('|')
    tags.append({'id':id,'kind':kind,'parent':parent or None,'label':label,
                 'aliases':[s for s in aliases.split(';') if s]})
vocab={'version':1,'types':sorted(k.TYPES),'tags':tags}
registry=k.vocabulary(vocab)
k.write(root/'static/data/tags.json',vocab)
mapping={}
for line in (root/'reports/knowledge-backfill.tsv').read_text(encoding='utf-8').splitlines():
    if not line or line.startswith('#'): continue
    ids,type,tags,point=line.split('|')
    ids=ids.split(',')
    tag_ids=tags.split(',')
    implied=set()
    for tag_id in tag_ids:
        parent=registry[tag_id]['parent']
        while parent:
            implied.add(parent)
            parent=registry[parent]['parent']
    meta={'idea':'idea-'+ids[0],'point':point,'tags':[t for t in tag_ids if t not in implied],'type':type}
    k.validate_knowledge(meta,registry)
    for id in ids:
        assert id not in mapping, 'Duplicate curated ID '+id
        mapping[id]=meta
actual={p['id'] for p in posts}
assert set(mapping)==actual, {'missing':sorted(actual-set(mapping),key=int),'extra':sorted(set(mapping)-actual,key=int)}
reviews=[]
for p in posts:
    reviews.append({'id':p['id'],'source_hash':k.source_hash(p),'knowledge':mapping[p['id']],
                    'verdict':'verified','reviewer':'editorial semantic backfill',
                    'reviewed_at':'2026-11-04',
                    'reason':'Curated point and classification based on the full-text review of the unchanged dataset, its per-ID semantic overview and final 867–896 review; mapping inspected as a whole.'})
with tempfile.TemporaryDirectory(prefix='faakt-knowledge-review-') as temporary:
    review_file=Path(temporary)/'review.json'
    k.write(review_file,reviews)
    assert k.main(['apply-review','--review',str(review_file),'--write'])==0
assert k.file_hash(posts_path)==expected, 'Backfill must not change the article file'
report={'source_sha256':expected,'records':len(posts),'ideas':len({x['idea'] for x in mapping.values()}),
        'tag_count':len(registry),'article_file_unchanged':True,
        'semantic_basis':['reports/new-posts-867-896-review.md','reports/new-posts-867-896-originality.json'],
        'curated_mapping':'reports/knowledge-backfill.tsv','vocabulary_seed':'reports/knowledge-tags-seed.tsv',
        'illustrations':'unchanged; knowledge is separate from visual metadata',
        'scope':'Classification and semantic summaries of existing content, not a new factual/source audit'}
k.write(root/'reports/knowledge-backfill-validation.json',report)
print(json.dumps(report,ensure_ascii=False))
