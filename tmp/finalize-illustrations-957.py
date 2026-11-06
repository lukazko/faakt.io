import json, hashlib, shutil, re
from pathlib import Path
from PIL import Image

def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

notes = {
 '957': 'Historical ambulance accompaniment; the anachronistic Red Cross emblem was removed in a targeted edit. Not an exact reconstruction of Larrey plans.',
 '958': 'Cut sugar beet accompanies the wartime substitution story; not a depiction of a specific historical cultivar.',
 '959': 'Stylized Napoleonic marching columns; accompanies distributed movement, not a map of a named campaign or exact corps composition.',
 '960': 'Bird emerging from noise is a metaphor for iterative image synthesis, not a visualization of network internals.',
 '961': 'Schematic dies sharing a package, not a model-specific processor layout.',
 '962': 'Phone and protected key symbol accompany domain-bound authentication; the picture does not assert protection from every attack.',
 '963': 'Mutual handshake accompanies the Epicurean agreement, not an authenticated ancient ritual.',
 '964': 'Anonymous resting builder accompanies retained ability during inactivity.',
 '965': 'Anonymous ancient thinker accompanies internal conflict, not a named likeness or anatomical diagram.',
 '966': 'Stylized portrait of Simone de Beauvoir accompanies her argument about the Other.',
 '967': 'An ordinary face-to-face encounter accompanies the I-Thou concept; not a psychological experiment.',
 '968': 'Illustrative clouded world; not a resolved Webb photograph or assertion of known visible colors.',
 '969': 'Stylized fuzzy moving object over galaxies accompanies the discovery; not a calibrated reproduction of Euclid data.',
 '970': 'Remedios rising with sheets depicts the selected fictional literary episode.',
 '971': 'Generic nineteenth-century Ohio house accompanies haunting; not a reconstruction of a real address.',
 '972': 'Mid-century cargo ship in a canal accompanies Suez 1956; modern container ship was replaced for period compatibility.',
 '973': 'Carnation in rifle muzzle accompanies the revolution symbol; does not imply that there were no casualties.',
 '974': 'Stylized portrait of Ruhollah Khomeini accompanies the historical institutional struggle, not an endorsement.',
 '975': 'Enthusiastic response to shared good news; ordinary fictional participants.',
 '976': 'Attentive response during disclosure; ordinary fictional participants, not a reconstruction of research subjects.'
}
posts = json.loads(Path('static/data/posts.json').read_text(encoding='utf-8'))
manifest_path = Path('static/illustrations-ai/manifest.json')
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
assert len(manifest) == 856, 'Avoid duplicate append'
report = []
archive = Path('tmp/imagegen-batch-957/sources')
archive.mkdir(parents=True, exist_ok=True)
for post in [p for p in posts if 957 <= int(p['id']) <= 976]:
    pid = post['id']
    record = json.loads(Path(f'reports/illustration-{pid}-generation.json').read_text(encoding='utf-8'))
    src = Path(record['source'])
    shutil.copy2(src, archive / f'{pid}.png')
    target = Path(f'static/illustrations-ai/{pid}.webp')
    im = Image.open(target)
    assert im.mode == 'RGBA' and im.size == (640,360)
    assert target.stat().st_size < 100000
    assert all(im.getpixel(p)[3] == 0 for p in [(0,0),(639,0),(0,359),(639,359)])
    bounds = im.getchannel('A').point(lambda a: 255 if a >= 16 else 0).getbbox()
    margins = dict(zip(['left','top','right','bottom'], [bounds[0], bounds[1],640-bounds[2],360-bounds[3]]))
    entry = {**post, 'image':f'/illustrations-ai/{pid}.webp', 'originalMetadata':post['illustration'],
      'metadataHash':record['metadataHash'], 'prompt':record['prompt'],
      'promptHash':hashlib.sha256(record['prompt'].encode()).hexdigest(),
      'generationSource':str(src), 'generationSourceSha256':digest(src),
      'generationMethod':'built-in image_gen; transparent_background=true; generation dimensions, quality and cost controls unavailable',
      'cached':False, 'imageSha256':digest(target), 'bytes':target.stat().st_size,
      'review':{'status':'accepted','meaning':notes[pid], 'sizes':['160x90','320x180'],
        'background':'True-alpha WebP; zero-alpha corners. Base dark surface and current dev CSS glow checked in real cards and thumbnail sheets.',
        'simplicity':'Recognizable selected motif. Some generated shading, garment folds and small details exceed the strict flat-shape target; no explanatory labels or multistep diagrams.',
        'alphaMargins':margins}}
    if record.get('previousAttempt'):
        prev=record['previousAttempt']
        entry['previousAttempts']=[{**prev,'sourceSha256':digest(prev['source']), 'promptHash':hashlib.sha256(prev['prompt'].encode()).hexdigest(), 'status':'replaced-semantic-defect'}]
        shutil.copy2(prev['source'], archive / f'{pid}-original.png')
    manifest.append(entry)
    report.append({'id':pid,'imageSha256':entry['imageSha256'],'bytes':entry['bytes'],'alphaMargins':margins,'meaning':notes[pid]})
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
Path('reports/illustrations-957-976-validation.json').write_text(json.dumps({'count':20,'totalBytes':sum(r['bytes'] for r in report),'images':report},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'manifest':len(manifest),'new':len(report),'bytes':sum(r['bytes'] for r in report)}))
