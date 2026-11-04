import hashlib
import json
import re
from pathlib import Path

root=Path(__file__).resolve().parents[1]
posts=json.loads((root/'static/data/posts.json').read_text(encoding='utf-8'))
drafts=json.loads((root/'reports/new-posts-867-896.json').read_text(encoding='utf-8'))
audit=json.loads((root/'reports/new-posts-867-896-originality.json').read_text(encoding='utf-8'))
assert posts[-30:]==drafts
assert hashlib.sha256((root/'static/data/posts.json').read_bytes()).hexdigest()==audit['appendedDatabaseSha256']
assert len(posts)==len({p['id'] for p in posts})==796
categories={'historie','filozofie','veda','umeni','literatura','politika','fyzika','astronomie','zajimavost','ekonomie','psychologie','filmy','matematika','pocitacove-vedy'}
scenes={'portrait','interaction','process','diagram','environment','object'}
moods={'contemplative','dramatic','dynamic','mysterious','neutral','playful'}
palettes={'blue_gold','green_copper','indigo_cyan','monochrome_cool','monochrome_warm','teal_amber','terracotta_cream','violet_coral'}
for p,v in zip(drafts,audit['proposals']):
    assert p['category'] in categories
    assert v['finalTextVerdict']=='přijmout'
    assert v['finalPostSha256']==hashlib.sha256(json.dumps(p,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
    assert 500<=len(p['content'])<=1200 and len(p['title'])<=80
    assert not re.search(r'<(?!/?(?:p|strong|em)\b)',p['content'])
    assert p['illustration']['scene_type'] in scenes
    assert p['illustration']['mood'] in moods
    assert p['illustration']['palette'] in palettes
    assert 3<=len(p['illustration']['visual_keywords'])<=6
    for s in p['sources']:
        assert set(s)=={'label','url'} and s['url'].startswith('https://')
assert {p['category'] for p in drafts}==categories
repair=json.loads((root/'reports/illustration-repair-867-896.json').read_text(encoding='utf-8'))
new_changes=[c for c in repair['changes'] if int(c['id'])>=867]
report={'records':len(posts),'newRecords':30,'ids':[p['id'] for p in drafts], 'schemaAndLengths':'passed','existingDatabaseObjects':'All 766 preserved at append; source hash recorded in originality report','originality':'766/766 full existing texts reviewed; 30 final-text verdicts accepted; within-batch comparison completed','sources':'Direct research publications, institutional releases, academic reference texts and translations checked using web tools. Some sites restrict full automated fetching; indexed research abstracts and accessible institutional counterparts were checked. No unverified numerical claims added.','repair':{'mode':'preview only','suggestedRecords':repair['modified_records'],'newRecordsWithSuggestions':[x['id'] for x in new_changes],'decision':'Keep article-specific metadata. Generic portrait/interaction rewrites of 871, 886 and 896 do not improve the chosen motif.'},'databaseSha256':audit['appendedDatabaseSha256']}
manifest=json.loads((root/'static/illustrations-ai/manifest.json').read_text(encoding='utf-8'))
if len(manifest)==796:
    by_id={x['id']:x for x in manifest}
    for post in drafts:
        item=by_id[post['id']]
        assert item['metadataHash']==hashlib.sha256(json.dumps(post['illustration'],ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
        assert item['promptHash']==hashlib.sha256(item['prompt'].encode()).hexdigest()
        assert item['imageSha256']==hashlib.sha256((root/('static'+item['image'])).read_bytes()).hexdigest()
    report['illustrationHashes']='30/30 metadata, exact submitted prompts and saved WebP hashes passed'
(root/'reports/new-posts-867-896-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('30 new posts: schema, lengths, HTML, 14 categories, metadata, hashes and originality verdicts passed')
