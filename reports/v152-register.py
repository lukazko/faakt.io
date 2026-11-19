import json, hashlib, subprocess
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
def read(p): return json.loads((ROOT/p).read_text(encoding='utf-8'))
def write(p,d): (ROOT/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
drafts=read('reports/v152-drafts.json')
posts=read('static/data/posts.json'); byid={p['id']:p for p in posts}
manifest=read('static/illustrations-ai/manifest.json'); oldids={p['id'] for p in manifest}
rows=[]
for p in drafts:
    pid=p['id']; assert pid in byid
    asset=ROOT/f'static/illustrations-ai/{pid}.webp'
    job=read(f'reports/v152-image-{pid}.json')
    with Image.open(asset) as im:
        assert im.mode=='RGBA' and im.size==(640,360)
        assert all(im.getpixel(xy)[3]==0 for xy in [(0,0),(639,0),(0,359),(639,359)])
        l,t,r,b=im.getchannel('A').point(lambda a:255 if a>=16 else 0).getbbox()
        margins=dict(left=l,right=640-r,top=t,bottom=360-b)
    assert asset.stat().st_size<100_000
    entry=dict(id=pid,title=p['title'],category=p['category'],illustration=p['illustration'],image=f'/illustrations-ai/{pid}.webp',prompt=job['prompt'],promptHash=hashlib.sha256(job['prompt'].encode()).hexdigest(),metadataHash=hashlib.sha256(json.dumps(p['illustration'],ensure_ascii=False,separators=(',',':')).encode()).hexdigest(),generationSource=job['source'],generationSourceSha256=sha(job['source']),generationMethod='built-in image_gen; transparent_background=true; size, quality and generation cost controls unavailable',imageSha256=sha(asset),bytes=asset.stat().st_size,cached=False,review=dict(status='pending-visual-review',alphaMargins=margins,sizes=['160x90','320x180'],meaning=p['illustration']['concept'],role='Accompanying editorial motif; does not reconstruct every detail or prove the article.'))
    assert pid not in oldids,'Preserve existing manifest entries'
    manifest.append(entry);rows.append(dict(id=pid,bytes=entry['bytes'],alphaMargins=margins,imageSha256=entry['imageSha256']))
write('static/illustrations-ai/manifest.json',manifest)
write('reports/v152-art-validation.json',dict(rows=rows,totalBytes=sum(x['bytes'] for x in rows),cornersAlphaZero=True,dimensions='640x360',status='pending-visual-review'))
component=ROOT/'src/lib/components/PostIllustration.svelte'
s=component.read_text(encoding='utf-8'); needle='const generatedIds = new Set(['
assert s.count(needle)==1
s=s.replace(needle,needle+'\n\t\t'+', '.join("'"+p['id']+"'" for p in drafts)+',',1)
component.write_text(s,encoding='utf-8')
old=json.loads(subprocess.check_output(['git','show','HEAD:static/data/posts.json'],cwd=ROOT,encoding='utf-8'))
assert posts[:len(old)]==old,'Old article objects must remain unchanged'
original_manifest=json.loads(subprocess.check_output(['git','show','HEAD:static/illustrations-ai/manifest.json'],cwd=ROOT,encoding='utf-8'))
assert manifest[:len(original_manifest)]==original_manifest
print(f'Registered {len(rows)} assets; preserved {len(old)} articles and {len(original_manifest)} manifest entries; {sum(x["bytes"] for x in rows)} bytes.')
