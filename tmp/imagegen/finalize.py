from pathlib import Path
from PIL import Image
import hashlib,json,re

root=Path(__file__).resolve().parents[2]
manifest_path=root/'static/illustrations-ai/manifest.json'
manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
posts={p['id']:p for p in json.loads((root/'static/data/posts.json').read_text(encoding='utf-8'))}
sha=lambda b:hashlib.sha256(b).hexdigest()
records=[]
meanings=json.loads((root/'tmp/imagegen/meanings.json').read_text(encoding='utf-8'))
for path in sorted((root/'tmp/imagegen').glob('result-*.json')):
    r=json.loads(path.read_text(encoding='utf-8'))
    image=root/f'static/illustrations-ai/{r["id"]}.webp'
    im=Image.open(image)
    assert im.size==(640,360),(r['id'],im.size)
    assert im.mode=='RGBA',(r['id'],im.mode)
    alpha=im.getchannel('A')
    corners=[alpha.getpixel(p) for p in [(0,0),(639,0),(0,359),(639,359)]]
    assert corners==[0]*4,(r['id'],corners)
    assert image.stat().st_size<100000
    assert not any(e['id']==r['id'] for e in manifest),r['id']
    post=posts[r['id']]
    r.setdefault('title',post['title'])
    r.setdefault('content',post['content'])
    entry={k:r[k] for k in ['id','title','content','image','prompt','metadataHash','generationSource']}
    if 'previousVersion' in r:
        entry['previousVersion']=r['previousVersion']
    entry.update(category=post['category'],promptHash=sha(r['prompt'].encode()),originalMetadata=post['illustration'],cached=True,
        generationMethod='built-in image_gen; transparent_background=true; dimensions, quality and price controls unavailable',imageSha256=sha(image.read_bytes()),
        review={'status':'accepted','sizes':['160x90','320x180'],
        'background':'RGBA WebP with alpha 0 at all corners; viewed on #0d0d0d at both card sizes.',
        'meaning':meanings[r['id']],
        'simplicity':'Readable main silhouette at both sizes. Some model outputs exceed the strict flat-shape and shading targets; specific caveats are recorded where needed. No cosmetic retries.',
        'cornerAlpha':corners})
    records.append(entry)
manifest.extend(records)
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
component=root/'src/lib/components/PostIllustration.svelte'
text=component.read_text(encoding='utf-8')
addition=',\n\t\t'+', '.join("'"+r['id']+"'" for r in records)
text=text.replace('\n\t]);',addition+'\n\t]);',1)
component.write_text(text,encoding='utf-8')
report={'requested':50,'selected':json.loads((root/'tmp/imagegen/next-50.json').read_text())['selected'],'generated':[r['id'] for r in records],
    'bytes':sum((root/('static'+r['image'])).stat().st_size for r in records),
    'method':'built-in image_gen; transparent_background=true; 50 initial requests, one simplified replacement for rejected 453, and targeted edits of 489 and 518',
    'generationCalls':53,
    'resolvedRejections':[{'id':'453','code':'moderation_blocked','requestId':'7055eb0f-3438-44d8-b4b3-5df94d405111','resolution':'A revised animation-cel motif from the current metadata succeeded.'}],
    'failures':[json.loads(p.read_text(encoding='utf-8')) for p in (root/'tmp/imagegen').glob('failure-*.json')],
    'totalAssets':len(list((root/'static/illustrations-ai').glob('*.webp')))}
(root/'reports/illustration-generation-next-50.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report))
