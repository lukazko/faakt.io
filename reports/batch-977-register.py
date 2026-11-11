import json,pathlib,hashlib,subprocess
from PIL import Image,ImageDraw,ImageFont
R=pathlib.Path(__file__).resolve().parents[1]; O=R/'reports'
sha=lambda b:hashlib.sha256(b).hexdigest()
posts=json.loads((R/'static/data/posts.json').read_text(encoding='utf8'))
prior=json.loads(subprocess.check_output(['git','show','8ad972ac^:static/data/posts.json'],cwd=R,encoding='utf8'))
assert posts[:len(prior)]==prior and len(posts)==1006
manifest_path=R/'static/illustrations-ai/manifest.json'
manifest=json.loads(manifest_path.read_text(encoding='utf8'))
assert not any(int(e['id'])>=977 for e in manifest)
checks=[]
for p in posts[-30:]:
 pid=p['id']; record=json.loads((O/f'batch-977-image-{pid}.json').read_text(encoding='utf8'))
 original=record.copy()
 edit=O/f'batch-977-image-{pid}-edit.json'
 if edit.exists(): record.update(json.loads(edit.read_text(encoding='utf8')))
 path=R/f'static/illustrations-ai/{pid}.webp';raw=path.read_bytes()
 im=Image.open(path).convert('RGBA');a=im.getchannel('A');assert im.size==(640,360) and len(raw)<100000
 assert all(a.getpixel(x)==0 for x in [(0,0),(639,0),(0,359),(639,359)])
 bbox=a.point(lambda x:255 if x>=16 else 0).getbbox()
 margins=dict(left=bbox[0],right=640-bbox[2],top=bbox[1],bottom=360-bbox[3])
 metadata=p['illustration']
 entry=dict(id=pid,title=p['title'],category=p['category'],illustration=metadata,image=f'/illustrations-ai/{pid}.webp',prompt=record['prompt'],promptHash=sha(record['prompt'].encode()),metadataHash=record['metadataHash'],generationSource=record['source'],generationSourceSha256=sha(pathlib.Path(record['source']).read_bytes()),generationMethod=record['generationMethod'],imageSha256=sha(raw),bytes=len(raw),cached=False,review=dict(status='pending-visual-review',alphaMargins=margins,sizes=['160x90','320x180'],meaning='Selected motif accompanies the full article; not a calibrated technical or archaeological reconstruction.',background='RGBA WebP; alpha-zero corners checked. Card and thumbnail review pending.'))
 if edit.exists():entry['attempts']=[dict(prompt=original['prompt'],generationSource=original['source'],reason=record['reason'])]
 manifest.append(entry);checks.append(dict(id=pid,bytes=len(raw),alphaMargins=margins,imageSha256=sha(raw)))
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
component=R/'src/lib/components/PostIllustration.svelte'
text=component.read_text(encoding='utf8')
needle='const generatedIds = new Set(['
text=text.replace(needle,needle+'\n\t\t'+', '.join("'"+p['id']+"'" for p in posts[-30:])+',',1)
component.write_text(text,encoding='utf8')
(O/'batch-977-art-validation.json').write_text(json.dumps(dict(images=checks,totalBytes=sum(x['bytes'] for x in checks),oldPostsPreserved=True),ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Registered 30 images;',sum(x['bytes'] for x in checks),'bytes; previous posts preserved.')
