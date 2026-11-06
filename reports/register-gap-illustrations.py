import hashlib,json,re
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
posts=read(ROOT/'static/data/posts.json'); selected=[p for p in posts if 313<=int(p['id'])<=352]
assert len(selected)==40,'Wait for guarded content import'
manifest_path=ROOT/'static/illustrations-ai/manifest.json';manifest=read(manifest_path)
assert not {p['id'] for p in selected}&{p['id'] for p in manifest},'Already registered'
report=[]
for post in sorted(selected,key=lambda p:int(p['id'])):
    id=post['id'];record=read(ROOT/f'reports/gap-image-{id}.json')
    previous=None
    if id=='341':
        previous=record;record=read(ROOT/'reports/gap-image-341-correction.json')
    path=ROOT/f'static/illustrations-ai/{id}.webp';source=Path(record['path']);im=Image.open(path)
    assert im.mode=='RGBA' and im.size==(640,360) and path.stat().st_size<100000
    assert all(im.getpixel(xy)[3]==0 for xy in [(0,0),(639,0),(0,359),(639,359)])
    bounds=im.getchannel('A').point(lambda a:255 if a>=16 else 0).getbbox()
    margins=dict(zip(['left','top','right','bottom'],[bounds[0],bounds[1],640-bounds[2],360-bounds[3]]))
    original=record.get('generationMetadata') or json.loads(record['prompt'].split('\nMetadata: ',1)[1].split('\n',1)[0])
    entry={**post,'image':f'/illustrations-ai/{id}.webp','prompt':record['prompt'],
      'promptHash':hashlib.sha256(record['prompt'].encode()).hexdigest(),
      'originalMetadata':original,'metadataHash':hashlib.sha256(json.dumps(original,ensure_ascii=False,separators=(',',':')).encode()).hexdigest(),
      'currentMetadata':post['illustration'],'generationSource':str(source),'generationSourceSha256':sha(source),
      'generationMethod':'built-in image_gen; transparent_background=true; dimensions, quality and cost controls unavailable',
      'imageSha256':sha(path),'bytes':path.stat().st_size,'cached':False,
      'review':{'status':'pending-local-review','alphaMargins':margins,
      'metadataRefinement':'Visual keywords made concrete after generation; scene and main subject retained. Exact submitted metadata preserved separately.'}}
    if record.get('unusedRepeat'):entry['unusedRepeat']=record['unusedRepeat']
    if previous:entry['previousAttempts']=[{**previous,'status':'replaced-semantic-defect','reason':'Female portrait replaced with the male Dorian Gray.'}]
    manifest.append(entry);report.append({'id':id,'bytes':entry['bytes'],'imageSha256':entry['imageSha256'],'alphaMargins':margins})
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
component=ROOT/'src/lib/components/PostIllustration.svelte';text=component.read_text(encoding='utf-8')
match=re.search(r'const generatedIds = new Set\(\[([\s\S]*?)\]\);',text)
assert match and not any(f"'{p['id']}'" in match[1] for p in selected)
addition=',\n\t'+', '.join("'"+str(i)+"'" for i in range(313,353))
text=text[:match.end(1)]+addition+text[match.end(1):]
component.write_text(text,encoding='utf-8')
(ROOT/'reports/illustrations-313-352-validation.json').write_text(json.dumps({'count':40,'totalBytes':sum(r['bytes'] for r in report),'images':report},indent=2)+'\n')
print('Registered 40 illustrations; manifest entries',len(manifest))
