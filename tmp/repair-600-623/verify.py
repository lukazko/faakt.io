import json,hashlib,subprocess
from pathlib import Path
from PIL import Image
sha=lambda b:hashlib.sha256(b).hexdigest()
baseline=json.loads(Path('tmp/repair-600-623/baseline-hashes.json').read_text())
manifest={e['id']:e for e in json.loads(Path('static/illustrations-ai/manifest.json').read_text(encoding='utf-8'))}
posts=json.loads(Path('static/data/posts.json').read_text(encoding='utf-8'))
cards=Path('src/lib/components/PostIllustration.svelte').read_text(encoding='utf-8')
for post in posts:
 rid=post['id'];e=manifest[rid];path=Path('static'+e['image'])
 assert path.exists() and "'"+rid+"'" in cards,rid
 if rid not in ['600','623']:
  assert sha(path.read_bytes())==baseline[rid],rid
  continue
 im=Image.open(path)
 assert im.mode=='RGBA' and im.size==(640,360),rid
 assert all(im.getchannel('A').getpixel(p)==0 for p in [(0,0),(639,0),(0,359),(639,359)]),rid
 assert path.stat().st_size<100000,rid
 assert e['imageSha256']==sha(path.read_bytes()),rid
 assert e['promptHash']==sha(e['prompt'].encode()),rid
 assert e['originalMetadata']==post['illustration'],rid
 assert e['content']==post['content'] and e['title']==post['title'],rid
 assert e['previousVersion']['imageSha256']==baseline[rid],rid
assert not subprocess.check_output(['git','diff','HEAD','--','static/data/posts.json'])
rp=Path('reports/illustration-repair-600-623.json');r=json.loads(rp.read_text())
r['validation']={'status':'passed','allPostsHaveRegisteredAssets':len(posts),'unrelatedImagesUnchanged':True,'datasetUnchanged':True,'rgbaSize':'640x360','cornerAlpha':[0,0,0,0],'imageAndPromptHashes':'passed','beforeAfterThumbnailReview':['160x90','320x180']}
rp.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r['validation']))
