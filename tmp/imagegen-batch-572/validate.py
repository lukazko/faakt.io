import json, hashlib
from pathlib import Path
from PIL import Image
sha=lambda d:hashlib.sha256(d).hexdigest()
batch=json.loads(Path('tmp/imagegen-batch-572/batch.json').read_text(encoding='utf-8'))
manifest={e['id']:e for e in json.loads(Path('static/illustrations-ai/manifest.json').read_text(encoding='utf-8'))}
sizes=[]
for j in batch['jobs']:
    e=manifest[j['id']]
    p=Path('static'+e['image'])
    im=Image.open(p)
    assert im.mode=='RGBA' and im.size==(640,360)
    a=im.getchannel('A')
    assert all(a.getpixel(pt)==0 for pt in [(0,0),(639,0),(0,359),(639,359)])
    assert e['imageSha256']==sha(p.read_bytes()),j['id']
    assert e['promptHash']==sha(e['prompt'].encode()),j['id']
    assert p.stat().st_size<100000
    sizes.append(p.stat().st_size)
assert sha(Path('static/data/posts.json').read_bytes())=='b85a1dda9cefdca2a722830ac8e860b3cf88f03404ac8829304b856112a85105'
report_path=Path('reports/illustration-generation-572-622.json')
report=json.loads(report_path.read_text(encoding='utf-8'))
report.update(generationCalls=52,correctionIds=['580','616'],validation={'count':len(sizes),'bytes':sum(sizes),'minBytes':min(sizes),'maxBytes':max(sizes),'dimensions':'640x360','mode':'RGBA','cornerAlpha':[0,0,0,0],'imageAndPromptHashes':'verified','database':'unchanged'})
report_path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report['validation']))
