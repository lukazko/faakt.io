from pathlib import Path
from PIL import Image
import json,hashlib
root=Path.cwd()
sha=lambda data:hashlib.sha256(data).hexdigest()
batch=json.loads((root/'tmp/imagegen-batch-572/batch.json').read_text(encoding='utf-8'))
posts={p['id']:p for p in json.loads((root/'static/data/posts.json').read_text(encoding='utf-8'))}
mp=root/'static/illustrations-ai/manifest.json'
manifest=json.loads(mp.read_text(encoding='utf-8'))
notes_path=root/'tmp/imagegen-batch-572/notes.json'
notes=json.loads(notes_path.read_text(encoding='utf-8'))
added=[]
for job in batch['jobs']:
    rid=job['id']
    if any(e['id']==rid for e in manifest): continue
    rp=root/f'tmp/imagegen-batch-572/record-{rid}.json'
    image=root/('static'+job['image'])
    if not rp.exists() or not image.exists() or rid not in notes: continue
    r=json.loads(rp.read_text(encoding='utf-8'))
    im=Image.open(image)
    assert im.size==(640,360) and im.mode=='RGBA',rid
    a=im.getchannel('A')
    corners=[a.getpixel(p) for p in [(0,0),(639,0),(0,359),(639,359)]]
    assert corners==[0]*4 and image.stat().st_size<100000,(rid,corners)
    entry={k:r[k] for k in ['id','title','content','image','prompt','metadataHash','generationSource']}
    entry.update(category=posts[rid]['category'],originalMetadata=posts[rid]['illustration'],promptHash=sha(r['prompt'].encode()),imageSha256=sha(image.read_bytes()),cached=True,
      generationMethod='built-in image_gen; transparent_background=true; generation dimensions, quality and cost controls unavailable',
      review={'status':'accepted','sizes':['160x90','320x180'],'cornerAlpha':corners,'background':'True-alpha RGBA WebP, transparent corners; visually reviewed on dark card surface.','meaning':notes[rid], 'simplicity':'Readable thumbnail motif; departures from strict shape, color or flat-shading targets are recorded in the handoff; no cosmetic variants.'})
    if 'originalPrompt' in r: entry['preparedOriginalPrompt']=r['originalPrompt']
    if 'previousVersion' in r: entry['previousVersion']=r['previousVersion']
    manifest.append(entry)
    added.append(rid)
mp.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
cp=root/'src/lib/components/PostIllustration.svelte'
t=cp.read_text(encoding='utf-8')
if added: t=t.replace('\n\t]);',',\n\t\t'+', '.join("'"+i+"'" for i in added)+'\n\t]);',1)
cp.write_text(t,encoding='utf-8')
completed=[j['id'] for j in batch['jobs'] if any(e['id']==j['id'] for e in manifest)]
report={'requested':50,'selected':batch['selected'],'completed':completed,'incomplete':[i for i in batch['selected'] if i not in completed],'bytes':sum((root/f'static/illustrations-ai/{i}.webp').stat().st_size for i in completed),'totalAssets':len(list((root/'static/illustrations-ai').glob('*.webp'))),'databaseSha256':sha((root/'static/data/posts.json').read_bytes()),'method':'built-in image_gen; transparent_background=true; size/quality/cost controls unavailable'}
(root/'reports/illustration-generation-572-622.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report))
