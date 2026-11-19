import json,subprocess
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
entries=json.loads((root/'reports/batch-1072-1101-images.json').read_text(encoding='utf-8'))
results=[]
for e in entries:
    dest=root/f"static/illustrations-ai/{e['id']}.webp"
    if not dest.exists():
        subprocess.run(['python','scripts/illustrations/fit-image.py','--input',e['source'],'--output',str(dest)],cwd=root,check=True)
    im=Image.open(dest).convert('RGBA'); a=im.getchannel('A')
    assert im.size==(640,360)
    corners=[a.getpixel(xy) for xy in [(0,0),(639,0),(0,359),(639,359)]]
    assert corners==[0]*4,(e['id'],corners)
    assert dest.stat().st_size<100000
    bounds=a.point(lambda x:255 if x>=16 else 0).getbbox()
    results.append(dict(id=e['id'],bytes=dest.stat().st_size,corners=corners,bounds=bounds))
(root/'reports/batch-1072-1101-art-validation.json').write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8')
print('Validated',len(results),'RGBA WebP assets;',sum(x['bytes'] for x in results),'bytes')
