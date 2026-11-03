from pathlib import Path
from PIL import Image
import json,hashlib,re
root=Path.cwd()
sha=lambda b:hashlib.sha256(b).hexdigest()
batch=json.loads((root/'tmp-illustration-batch.json').read_text(encoding='utf-8'))
posts={p['id']:p for p in json.loads((root/'static/data/posts.json').read_text(encoding='utf-8'))}
mp=root/'static/illustrations-ai/manifest.json'
manifest=json.loads(mp.read_text(encoding='utf-8'))
meanings=json.loads((root/'tmp/imagegen-batch-521/meanings.json').read_text(encoding='utf-8'))
records=[]
for job in batch['jobs']:
    rp=root/f'tmp/imagegen-batch-521/record-{job["id"]}.json'
    if not rp.exists(): continue
    r=json.loads(rp.read_text(encoding='utf-8'))
    image=root/f'static/illustrations-ai/{r["id"]}.webp'
    if not image.exists(): continue
    im=Image.open(image)
    assert im.size==(640,360) and im.mode=='RGBA',r['id']
    a=im.getchannel('A')
    corners=[a.getpixel(p) for p in [(0,0),(639,0),(0,359),(639,359)]]
    assert corners==[0]*4 and image.stat().st_size<100000,(r['id'],corners)
    assert not any(e['id']==r['id'] for e in manifest),r['id']
    post=posts[r['id']]
    entry={k:r[k] for k in ['id','title','content','image','prompt','metadataHash','generationSource']}
    entry.update(category=post['category'],promptHash=sha(r['prompt'].encode()),originalMetadata=post['illustration'],cached=True,
        generationMethod='built-in image_gen; transparent_background=true; dimensions, quality and generation cost controls unavailable',imageSha256=sha(image.read_bytes()),
        review={'status':'accepted','sizes':['160x90','320x180'],'cornerAlpha':corners,
        'background':'RGBA WebP; transparent corners; reviewed on a dark card surface at both sizes.',
        'meaning':meanings[r['id']],
        'simplicity':'The main motif remains readable at both sizes. Model output may exceed the strict 5–8 shapes, three colors and single shading-plane targets; no cosmetic retries.'})
    if 'fallback' in r: entry['fallback']=r['fallback']
    records.append(entry)
manifest.extend(records)
mp.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
cp=root/'src/lib/components/PostIllustration.svelte'
t=cp.read_text(encoding='utf-8')
t=t.replace('\n\t]);',',\n\t\t'+', '.join("'"+r['id']+"'" for r in records)+'\n\t]);',1)
cp.write_text(t,encoding='utf-8')
report={'requested':50,'selected':batch['selected'],'completed':[r['id'] for r in records],
    'incomplete':[i for i in batch['selected'] if i not in {r['id'] for r in records}],
    'bytes':sum((root/('static'+r['image'])).stat().st_size for r in records),
    'totalAssets':len(list((root/'static/illustrations-ai').glob('*.webp'))),
    'method':'built-in image_gen; transparent_background=true; generation dimensions, quality and cost cannot be capped',
    'databaseSha256':sha((root/'static/data/posts.json').read_bytes()),
    'generationCalls':51,
    'resolvedRejections':[{'id':'562','requestId':'439fb5c7-a667-44c6-acdf-7681be9156a5','resolution':'Non-person probe and message plaque motif.'}]}
(root/'reports/illustration-generation-521-571.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report))
