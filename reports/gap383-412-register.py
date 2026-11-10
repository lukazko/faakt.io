import hashlib
import json
from pathlib import Path
from PIL import Image

root=Path(__file__).resolve().parents[1]
posts={p['id']:p for p in json.loads((root/'static/data/posts.json').read_text(encoding='utf-8'))}
manifest_path=root/'static/illustrations-ai/manifest.json'
manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
old_manifest=list(manifest)
assert not {str(i) for i in range(383,413)} & {x['id'] for x in manifest}
sha=lambda raw:hashlib.sha256(raw).hexdigest()
notes={
'384':'Corrected to a sandy boat-shaped impression without an intact wooden hull; a few iron rivets remain. Not a measured archaeological reconstruction.',
'385':'Anonymous ancient writers accompany the distinction between historical particulars and poetic possibilities.',
'386':'A folded strip accompanies potential further division; it is not a literal completed infinity.',
'392':'The reader and broken book are an editorial metaphor for interrupted reading, not a literal damaged edition.',
'394':'Nested civic buildings are a metaphor for levels of governance, not a drawing of a particular EU institution.',
'398':'Spacecraft and Earth accompany the topic; the curved arc is symbolic and is not a calibrated orbit or an assertion of zero gravity.',
'400':'The unstable three-coin balance accompanies the trilemma; its currency symbols do not identify particular national policy choices.',
'401':'The chair is visibly absent in the second room; these are illustrative scenes, not original experimental stimuli.',
'405':'One short needle crosses only the central line; its length is less than the line spacing.',
'406':'One domino spans contrasting adjacent squares; the artwork illustrates the invariant rather than reconstructing the entire mutilated board.',
'407':'Server markers on a ring accompany consistent hashing, with one newly added marker.',
'408':'The shared locked gate is a metaphor for coordinated readiness and possible waiting, not a network protocol diagram.',
'409':'Closed-bottom basket and plain leather ball accompany basketball origins, not a reconstruction of the first match.',
'410':'Anonymous sprinter accompanies altitude performance, not a portrait of an Olympic athlete.',
'411':'Raised boot heel and level blade show the front hinge relationship of the clap skate.',
'412':'The 6:6 board accompanies the context of a tiebreak; it does not claim every tennis format uses identical rules.'}
checks=[]
for i in range(383,413):
    pid=str(i);post=posts[pid]
    record=json.loads((root/f'reports/gap383-412-image-{pid}.json').read_text(encoding='utf-8'))
    edit_path=root/f'reports/gap383-412-image-{pid}-edit.json'
    initial=record
    if edit_path.exists(): record=json.loads(edit_path.read_text(encoding='utf-8'))
    path=root/f'static/illustrations-ai/{pid}.webp'
    raw=path.read_bytes();im=Image.open(path).convert('RGBA')
    assert im.size==(640,360) and len(raw)<100000
    alpha=im.getchannel('A')
    assert all(alpha.getpixel(p)==0 for p in [(0,0),(639,0),(0,359),(639,359)])
    box=alpha.point(lambda a:255 if a>=16 else 0).getbbox()
    margins=dict(left=box[0],right=640-box[2],top=box[1],bottom=360-box[3])
    prompt=record['prompt'];metadata=post['illustration'];source=Path(record['generationSource'])
    entry=dict(id=pid,title=post['title'],category=post['category'],illustration=metadata,
               image=f'/illustrations-ai/{pid}.webp',prompt=prompt,promptHash=sha(prompt.encode()),
               metadataHash=sha(json.dumps(metadata,ensure_ascii=False,separators=(',',':')).encode()),
               currentMetadata=metadata,generationSource=str(source),generationSourceSha256=sha(source.read_bytes()),
               generationMethod=record['method'],imageSha256=sha(raw),bytes=len(raw),cached=False,
               review=dict(status='accepted-thumbnail',alphaMargins=margins,sizes=['160x90','320x180'],
                           meaning=notes.get(pid,'The recognizable selected motif accompanies the complete article; it does not reconstruct every part of the explanation.'),
                           background='RGBA WebP, alpha-zero corners verified; thumbnails inspected on the dark card surface. Actual card/glow review pending.',
                           simplicity='Recognizable subject at both thumbnail scales; some outputs exceed the strict target for flat shapes, shadows or detail.'))
    if edit_path.exists():
        entry['attempts']=[dict(prompt=initial['prompt'],generationSource=initial['generationSource'],reason=record['reason'])]
        entry['editReference']=initial['generationSource']
    manifest.append(entry)
    checks.append(dict(id=pid,bytes=len(raw),imageSha256=sha(raw),alphaMargins=margins,cornersAlphaZero=True))
assert manifest[:len(old_manifest)]==old_manifest
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(root/'reports/gap383-412-image-validation.json').write_text(json.dumps(dict(records=len(posts),added=30,totalBytes=sum(x['bytes'] for x in checks),images=checks),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Registered',len(checks),'images;',sum(x['bytes'] for x in checks),'bytes total; original manifest objects preserved.')
