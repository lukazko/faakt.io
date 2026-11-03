import json,hashlib,subprocess
from pathlib import Path
from PIL import Image
sha=lambda b:hashlib.sha256(b).hexdigest()
report=json.loads(Path('reports/illustration-generation-623-866.json').read_text())
posts=json.loads(Path('static/data/posts.json').read_text(encoding='utf-8'))
entries=json.loads(Path('static/illustrations-ai/manifest.json').read_text(encoding='utf-8'))
manifest={p['id']:p for p in entries}
assert len(entries)==len(manifest),'Duplicate manifest IDs'
cards=Path('src/lib/components/PostIllustration.svelte').read_text(encoding='utf-8')
sizes=[]
for rid in report['completed']:
 e=manifest[rid];path=Path('static'+e['image']);im=Image.open(path)
 assert im.mode=='RGBA' and im.size==(640,360),rid
 assert all(im.getchannel('A').getpixel(pt)==0 for pt in [(0,0),(639,0),(0,359),(639,359)]),rid
 assert e['imageSha256']==sha(path.read_bytes()),rid
 assert e['promptHash']==sha(e['prompt'].encode()),rid
 post=next(p for p in posts if p['id']==rid)
 assert e['originalMetadata']==post['illustration'],rid
 assert e['title']==post['title'] and e['content']==post['content'],rid
 assert path.stat().st_size<100000,rid
 sizes.append(path.stat().st_size)
for post in posts:
 rid=post['id']
 assert Path(f'static/illustrations-ai/{rid}.webp').exists(),rid
 assert "'"+rid+"'" in cards,rid
 assert rid in manifest,rid
assert len(report['completed'])==244 and not report['incomplete']
assert report['databaseSha256']==sha(Path('static/data/posts.json').read_bytes())
changed=subprocess.check_output(['git','diff','--name-only','a6109ca9^','--','static/illustrations-ai'],text=True).splitlines()
assert all(p.endswith('/manifest.json') or int(Path(p).stem)>=623 for p in changed),changed
assert not subprocess.check_output(['git','diff','a6109ca9^','--','static/data/posts.json']),'Dataset changed'
result={'status':'passed','newIllustrations':244,'postCount':len(posts),'totalAssets':len(posts),'missing':[],'bytes':sum(sizes),'minBytes':min(sizes),'maxBytes':max(sizes),'checks':['640x360 RGBA','corner alpha zero','file <100kB','SHA-256 prompt and image','all posts registered in cards and manifest','original metadata/title/content unchanged','preexisting assets unchanged','zero missing illustrations'],'databaseSha256':sha(Path('static/data/posts.json').read_bytes())}
Path('reports/illustration-validation-623-866.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
