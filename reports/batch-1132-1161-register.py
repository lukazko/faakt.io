import json,hashlib,re
from pathlib import Path
pre=Path('reports/batch-1132-1161')
def read(s):return json.loads(Path(str(pre)+s).read_text(encoding='utf-8-sig'))
drafts=read('-drafts.json');outputs=read('-images.json');jobs=read('-jobs.json')['jobs'];art=read('-art-validation.json')
assert len(outputs)==len(art)==30
manifest_path=Path('static/illustrations-ai/manifest.json');manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
assert not any(int(x['id'])>=1132 for x in manifest)
for p in drafts:
 j=next(x for x in jobs if x['id']==p['id']);out=next(x for x in outputs if x['id']==p['id']);a=next(x for x in art if x['id']==p['id'])
 entry=dict(id=p['id'],metadata=p['illustration'],image=j['image'],prompt=out['prompt'],promptHash=hashlib.sha256(out['prompt'].encode()).hexdigest(),metadataHash=j['metadataHash'],submittedMetadata=json.loads(j['prompt'].split('Metadata: ',1)[1]),generationMethod='built-in image_gen; transparent_background=true; size, quality and cost controls unavailable',imageSha256=a['imageSha256'],source=out['path'],review=dict(status='pending-visual-review',sizes=['160x90','320x180'],alphaBounds=a['bounds'],background='RGBA WebP 640x360; all four corners alpha 0; centered without cropping'))
 if out.get('original'):entry['previousAttempts']=[dict(source=out['original']['path'],prompt=out['original']['prompt'],reason='Colored liquid carbon samples were misleading; corrected to identical solid graphite samples.',savedAsset='reports/batch-1132-1161-1136-first.webp')]
 manifest.append(entry)
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
component=Path('src/lib/components/PostIllustration.svelte');s=component.read_text(encoding='utf-8');line='\n\t\t'+', '.join("'"+p['id']+"'" for p in drafts)+','
s=s.replace('const generatedIds = new Set([','const generatedIds = new Set(['+line,1);component.write_text(s,encoding='utf-8')
print('Registered 30 images in cards and shared gallery manifest.')
