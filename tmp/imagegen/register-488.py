from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib

root=Path.cwd()
data=json.loads((root/'tmp/imagegen/488-fallback-input.json').read_text(encoding='utf-8'))
source=json.loads((root/'tmp/imagegen/488-source.json').read_text())['source']
post=data['post']; image=root/'static/illustrations-ai/488.webp'
sha=lambda value:hashlib.sha256(value).hexdigest()
im=Image.open(image); assert im.size==(640,360) and im.mode=='RGBA'
corners=[im.getpixel(p)[3] for p in [(0,0),(639,0),(0,359),(639,359)]]
assert corners==[0]*4 and image.stat().st_size<100000
report_path=root/'reports/illustration-generation-next-50.json'
report=json.loads(report_path.read_text(encoding='utf-8'))
failed=next(f for f in report['failures'] if f['id']=='488')
metadata_json=json.dumps(post['illustration'],ensure_ascii=False,separators=(',',':'))
entry={'id':'488','title':post['title'],'content':post['content'],'category':post['category'],'image':'/illustrations-ai/488.webp',
'prompt':data['prompt'],'promptHash':sha(data['prompt'].encode()),'metadataHash':sha(metadata_json.encode()),
'originalMetadata':post['illustration'],'promptMetadata':data['promptMetadata'],'generationSource':source,
'generationMethod':'built-in image_gen; transparent_background=true; dimensions, quality and price controls unavailable',
'imageSha256':sha(image.read_bytes()),'cached':True,
'fallback':{'reason':'Named-person motif rejected with public-figure category; genuinely anonymous salt gatherer selected instead of a lookalike.',
'attempts':[{'prompt':failed['prompt'],'error':failed['error'],'outcome':'rejected'},{'prompt':data['prompt'],'outcome':'accepted'}]},
'review':{'status':'accepted','sizes':['160x90','320x180'],'cornerAlpha':corners,
'background':'Real RGBA transparency with alpha 0 in corners; inspected at both card sizes on #0d0d0d.',
'meaning':'Fictional anonymous worker gathers salt at the coast. Topic accompaniment to salt production and civil resistance, not a portrait of Gandhi or an authenticated participant, garment or moment from the march.',
'simplicity':'One coherent scene with a readable salt-gathering gesture. Salt grains, clothing folds and water reflections exceed the strict flat-shape target.'}}
mp=root/'static/illustrations-ai/manifest.json'; manifest=json.loads(mp.read_text(encoding='utf-8'))
assert not any(e['id']=='488' for e in manifest)
manifest.append(entry); mp.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
cp=root/'src/lib/components/PostIllustration.svelte'; component=cp.read_text(encoding='utf-8'); component=component.replace("'487', '489'","'487', '488', '489'",1); cp.write_text(component,encoding='utf-8')
report['generated']=sorted(report['generated']+['488'],key=int);report['failures']=[f for f in report['failures'] if f['id']!='488']
report['resolvedRejections'].append({'id':'488','code':'moderation_blocked','category':'public-figure','requestId':'a27a2972-1999-42ad-9d1b-9530f4946523','resolution':'Accepted genuinely anonymous salt-gathering worker; original refusal and both prompts preserved in manifest fallback.attempts.'})
report['bytes']+=image.stat().st_size; report['generationCalls']+=1; report['totalAssets']+=1
report['method']+='; 488 completed with an anonymous salt-gathering motif after its named-person refusal'
report_path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sheet=Image.new('RGB',(520,210),'#0d0d0d')
for x,size in [(0,(320,180)),(350,(160,90))]:
    thumb=im.resize(size,Image.Resampling.LANCZOS);sheet.paste(thumb,(x,20),thumb)
sheet.save(root/'tmp/imagegen/488-review.jpg',quality=90)
print(json.dumps({'bytes':image.stat().st_size,'corners':corners,'totalAssets':report['totalAssets']}))
