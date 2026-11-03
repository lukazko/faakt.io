import json,hashlib,re
from pathlib import Path
from PIL import Image
root=Path.cwd(); work=root/'tmp/imagegen-batch-623'
sha=lambda b:hashlib.sha256(b).hexdigest()
posts={p['id']:p for p in json.loads((root/'static/data/posts.json').read_text(encoding='utf-8'))}
notes=json.loads((work/'notes.json').read_text(encoding='utf-8'))
mp=root/'static/illustrations-ai/manifest.json'
manifest=json.loads(mp.read_text(encoding='utf-8')); existing={p['id'] for p in manifest};added=[]
for rid,note in notes.items():
    if rid in existing:continue
    r=json.loads((work/f'record-{rid}.json').read_text(encoding='utf-8'))
    path=root/('static'+r['image']);im=Image.open(path)
    assert im.size==(640,360) and im.mode=='RGBA',rid
    corners=[im.getchannel('A').getpixel(pt) for pt in [(0,0),(639,0),(0,359),(639,359)]]
    assert corners==[0]*4 and path.stat().st_size<100000,(rid,corners)
    entry={k:r[k] for k in ['id','title','content','image','prompt','metadataHash','generationSource']}
    entry.update(category=posts[rid]['category'],originalMetadata=posts[rid]['illustration'],promptHash=sha(r['prompt'].encode()),imageSha256=sha(path.read_bytes()),cached=True,generationMethod='built-in image_gen; transparent_background=true; generation dimensions, quality and cost controls unavailable',review={'status':'accepted','sizes':['160x90','320x180'],'cornerAlpha':corners,'background':'True-alpha RGBA WebP reviewed on dark card surface.','meaning':note,'simplicity':'Readable editorial motif; strict shape/color/shading targets may be exceeded.'})
    if 'originalPrompt' in r:entry['preparedOriginalPrompt']=r['originalPrompt']
    if 'fallback' in r:entry['fallback']=r['fallback']
    if 'previousVersion' in r:entry['previousVersion']=r['previousVersion']
    manifest.append(entry);added.append(rid)
mp.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
cp=root/'src/lib/components/PostIllustration.svelte';t=cp.read_text(encoding='utf-8')
if added:t=t.replace('\n\t]);',',\n\t\t'+', '.join("'"+i+"'" for i in added)+'\n\t]);',1)
cp.write_text(t,encoding='utf-8')
selected=json.loads((work/'batch.json').read_text(encoding='utf-8'))['selected']
completed=[rid for rid in selected if rid in notes]
report={'requested':244,'selected':selected,'completed':completed,'incomplete':[rid for rid in selected if rid not in completed],'bytes':sum((root/f'static/illustrations-ai/{rid}.webp').stat().st_size for rid in completed),'totalAssets':len(list((root/'static/illustrations-ai').glob('*.webp'))),'databaseSha256':sha((root/'static/data/posts.json').read_bytes()),'method':'built-in image_gen; true alpha; size/quality/cost controls unavailable'}
(root/'reports/illustration-generation-623-866.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
hp=root/'docs/ilustrace-handoff.md';h=hp.read_text(encoding='utf-8')
block=f'<!-- batch-623-start -->\n## Doplnění zbývajících ilustrací 623–866\n\nDokončeno a vizuálně zkontrolováno {len(completed)} z 244 požadovaných ilustrací; celkem {report["totalAssets"]} statických WebP. Přijatá ID jsou v `reports/illustration-generation-623-866.json`; zbývající ID uvádí `incomplete`. Nové obrázky jsou zapnuté v kartách i galerii. Vestavěný image_gen používá skutečnou průhlednost; řízení velikosti, kvality a ceny generování není dostupné. Finální WebP mají 640×360 px, nulovou alfu rohů a velikost pod 100 kB. Zkontrolováno při 160×90 a 320×180 px na tmavé kartě. Přesné prompty, původní metadata, zdroje, hashe a významové poznámky jsou v manifestu. Historické a literární scény jsou stylizace, nikoli autentické rekonstrukce; obraz může doprovázet vybraný aspekt článku. Výstupy místy překračují cílový počet ploch, barev a stínů. Články a metadata se nemění, deterministický repair proběhl pouze v náhledu. Procedurální renderer ani zlaté otisky se nepoužívají.\n<!-- batch-623-end -->'
if '<!-- batch-623-start -->' in h:h=re.sub(r'<!-- batch-623-start -->.*?<!-- batch-623-end -->',lambda _:block,h,flags=re.S)
else:h=h.replace('\n','\n\n'+block+'\n',1)
hp.write_text(h,encoding='utf-8')
print(json.dumps({'added':added,'completed':len(completed),'remaining':len(report['incomplete'])}))
