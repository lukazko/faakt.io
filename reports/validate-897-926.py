import json,pathlib,hashlib,re,collections
from PIL import Image
R=pathlib.Path(__file__).resolve().parents[1]
read=lambda p:json.loads((R/p).read_text(encoding='utf-8'))
sha=lambda b:hashlib.sha256(b).hexdigest()
posts=read('static/data/posts.json');drafts=read('reports/new-posts-897-926.json')
before=read('tmp/imagegen-batch-897/before-append/posts.json')
assert posts[:-30]==before and len(posts)==826
assert posts[-30:]==[{k:v for k,v in p.items() if k!='knowledge'} for p in drafts]
manifest=read('static/illustrations-ai/manifest.json');by_id={p['id']:p for p in manifest}
registry=set(re.findall("'([0-9]+)'",(R/'src/lib/components/PostIllustration.svelte').read_text(encoding='utf-8')))
assert len(manifest)==826 and all(p['id'] in registry for p in posts)
old_manifest=read('tmp/imagegen-batch-897/before-append/manifest.json')
assert manifest[:-30]==old_manifest
images=[]
for p in drafts:
 m=by_id[p['id']];path=R/'static'/m['image'].lstrip('/')
 assert sha(path.read_bytes())==m['imageSha256']
 assert sha(m['prompt'].encode())==m['promptHash']
 assert sha(json.dumps(p['illustration'],ensure_ascii=False,separators=(',',':')).encode())==m['metadataHash']
 with Image.open(path) as im:
  assert im.mode=='RGBA' and im.size==(640,360)
  assert all(im.getpixel(q)[3]==0 for q in [(0,0),(639,0),(0,359),(639,359)])
  bbox=im.getchannel('A').point(lambda a:255 if a>=16 else 0).getbbox()
  margins=dict(left=bbox[0],top=bbox[1],right=640-bbox[2],bottom=360-bbox[3])
 assert path.stat().st_size<100_000
 images.append(dict(id=p['id'],bytes=path.stat().st_size,alphaMargins=margins))
counts=collections.Counter(p['category'] for p in drafts)
assert len(counts)==13 and set(counts.values())=={2,3}
for p in drafts:
 assert 500<=len(p['content'])<=1200 and len(p['title'])<=80
 hook=re.search('<p>(.*?)</p>',p['content']).group(1)
 assert len(re.findall(r'[.!?](?:\s|$)',hook)) in [2,3]
 assert len(p['sources'])==2
versions=[read('package.json')['version'],read('package-lock.json')['version'],read('package-lock.json')['packages']['']['version']]
assert len(set(versions))==1
report=dict(records=826,newRecords=30,categories=dict(counts),ids=[p['id'] for p in drafts],existingArticleObjectsPreserved=True,existingManifestEntriesPreserved=True,allRegistered=True,version=versions[0],contentLengthRange=[min(len(p['content']) for p in drafts),max(len(p['content']) for p in drafts)],imageBytes=sum(i['bytes'] for i in images),images=images,databaseSha256=sha((R/'static/data/posts.json').read_bytes()))
(R/'reports/new-posts-897-926-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k not in ['images','ids']},ensure_ascii=False))
