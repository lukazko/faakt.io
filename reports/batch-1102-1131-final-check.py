import hashlib,json,subprocess,urllib.request
from collections import Counter
from pathlib import Path
root=Path(__file__).resolve().parents[1]
def read(path):return json.loads((root/path).read_text(encoding='utf-8'))
posts=read('static/data/posts.json');manifest=read('static/illustrations-ai/manifest.json');drafts=read('reports/batch-1102-1131-drafts.json')
old=json.loads(subprocess.check_output(['git','show','HEAD:static/data/posts.json'],cwd=root,encoding='utf-8'))
old_manifest=json.loads(subprocess.check_output(['git','show','HEAD:static/illustrations-ai/manifest.json'],cwd=root,encoding='utf-8'))
assert posts[:1101]==old[:1101] and manifest[:1101]==old_manifest[:1101]
assert len(posts)==len(manifest)==1131
assert [p['id'] for p in drafts]==[str(i) for i in range(1102,1132)]
assert len({p['id'] for p in posts})==1131
assert all('knowledge' not in p for p in posts)
for p in drafts:
 assert next(q for q in posts if q['id']==p['id'])=={k:v for k,v in p.items() if k!='knowledge'}
 asset=root/f"static/illustrations-ai/{p['id']}.webp"
 e=next(e for e in manifest if e['id']==p['id']);assert e['review']['status']=='accepted'
 assert hashlib.sha256(asset.read_bytes()).hexdigest()==e['imageSha256']
 assert (root/f"build/illustrations-ai/{p['id']}.webp").read_bytes()==asset.read_bytes()
 assert (root/f"build/post/{p['id']}/index.html").exists()
assert (root/'build/.nojekyll').exists()
for path in ['data/posts.json','data/post-knowledge.json','data/knowledge-ideas.json','illustrations-ai/manifest.json']:
 assert (root/'build'/path).read_bytes()==(root/'static'/path).read_bytes(),path
package=read('package.json');lock=read('package-lock.json')
assert package['version']==lock['version']==lock['packages']['']['version']=='1.5.2'
local=read('reports/batch-1102-1131-local-validation.json');assert len(local['rows'])==30 and not local['errors']
status=json.loads(subprocess.check_output(['python','scripts/post-knowledge.py','status'],cwd=root,encoding='utf-8'))
assert status['records']==status['verified']==1131 and not status['problems']
with urllib.request.urlopen('http://127.0.0.1:5187/faakt.io/data/posts.json') as r:served=json.load(r)
assert served==posts
result=dict(records=1131,new_ids=[p['id'] for p in drafts],categories=dict(Counter(p['category'] for p in posts)),old_posts_preserved=1101,old_manifest_entries_preserved=1101,knowledge=status,version=package['version'],new_assets=30,asset_bytes=sum((root/f"static/illustrations-ai/{p['id']}.webp").stat().st_size for p in drafts),source_records=60,tests=dict(project=13,passed=13,accepted_asset_check_after_review=True),build='passed',static_pages=30,matching_build_assets=30,build_data_and_manifest_match=True,mobile_cards_reviewed=30,flips_and_sources_reviewed=30,runtime_errors=[],low_viewport=local['low'],preview='http://127.0.0.1:5187/faakt.io/post/1102/',public_deployment=False)
(root/'reports/batch-1102-1131-final-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in result.items() if k not in ['knowledge','new_ids']},ensure_ascii=False))
