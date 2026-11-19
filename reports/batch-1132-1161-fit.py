import json,subprocess,hashlib
from pathlib import Path
from PIL import Image
pre=Path('reports/batch-1132-1161')
entries=json.loads(Path(str(pre)+'-images.json').read_text(encoding='utf-8'))
results=[]
for e in entries:
 dest=Path(f"static/illustrations-ai/{e['id']}.webp")
 if not dest.exists():subprocess.run(['python','scripts/illustrations/fit-image.py','--input',e['path'],'--output',str(dest)],check=True,capture_output=True)
 im=Image.open(dest).convert('RGBA');a=im.getchannel('A')
 assert im.size==(640,360)
 corners=[a.getpixel(xy) for xy in [(0,0),(639,0),(0,359),(639,359)]]
 assert corners==[0]*4,(e['id'],corners)
 assert dest.stat().st_size<100000
 bounds=a.point(lambda x:255 if x>=16 else 0).getbbox()
 results.append(dict(id=e['id'],bytes=dest.stat().st_size,corners=corners,bounds=bounds,imageSha256=hashlib.sha256(dest.read_bytes()).hexdigest()))
Path(str(pre)+'-art-validation.json').write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8')
print('Validated',len(results),'RGBA WebP assets;',sum(x['bytes'] for x in results),'bytes')
