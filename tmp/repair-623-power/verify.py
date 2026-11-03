import json,hashlib,subprocess
from pathlib import Path
from PIL import Image
sha=lambda b:hashlib.sha256(b).hexdigest()
baseline=json.loads(Path('tmp/repair-623-power/baseline-hashes.json').read_text())
manifest={e['id']:e for e in json.loads(Path('static/illustrations-ai/manifest.json').read_text(encoding='utf-8'))}
posts=json.loads(Path('static/data/posts.json').read_text(encoding='utf-8'))
cards=Path('src/lib/components/PostIllustration.svelte').read_text(encoding='utf-8')
for post in posts:
 rid=post['id'];e=manifest[rid];path=Path('static'+e['image'])
 assert path.exists() and "'"+rid+"'" in cards,rid
 if rid!='623':
  assert sha(path.read_bytes())==baseline[rid],rid
  continue
 im=Image.open(path)
 assert im.mode=='RGBA' and im.size==(640,360)
 assert all(im.getchannel('A').getpixel(p)==0 for p in [(0,0),(639,0),(0,359),(639,359)])
 assert e['imageSha256']==sha(path.read_bytes()) and e['promptHash']==sha(e['prompt'].encode())
 assert e['originalMetadata']==post['illustration'] and e['content']==post['content']
 assert e['previousVersion']['imageSha256']==baseline[rid]
assert not subprocess.check_output(['git','diff','HEAD','--','static/data/posts.json'])
p=Path('reports/illustration-repair-623-power.json');r=json.loads(p.read_text())
r['validation']={'status':'passed','allPostsRegistered':len(posts),'unrelatedImagesUnchanged':True,'datasetUnchanged':True,'rgbaSize':'640x360','cornerAlpha':[0,0,0,0],'hashes':'passed','beforeAfterReview':['160x90','320x180']}
p.write_text(json.dumps(r,indent=2)+'\n')
print(json.dumps(r['validation']))
