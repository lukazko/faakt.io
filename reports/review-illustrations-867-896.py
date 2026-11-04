import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw

root=Path(__file__).resolve().parents[1]
paths=json.loads((root/'reports/illustrations-867-896-generated.json').read_text(encoding='utf-8-sig'))
for item in paths:
    target=root/f"static/illustrations-ai/{item['id']}.webp"
    if not target.exists():
        subprocess.run(['python',str(root/'skills/faakt-illustrations/scripts/fit-image.py'),'--input',item['path'],'--output',str(target)],check=True)
ids=[int(x['id']) for x in paths if (root/f"static/illustrations-ai/{x['id']}.webp").exists()]
for start in range(867,897,10):
    group=[i for i in ids if start<=i<start+10]
    if not group: continue
    for width in [160,320]:
        height=width*9//16
        sheet=Image.new('RGB',(width*2,((len(group)+1)//2)*(height+25)),'#0d0d0d')
        draw=ImageDraw.Draw(sheet)
        for index,i in enumerate(group):
            img=Image.open(root/f'static/illustrations-ai/{i}.webp').convert('RGBA')
            assert img.size==(640,360)
            assert all(img.getpixel(p)[3]==0 for p in [(0,0),(639,0),(0,359),(639,359)])
            assert (root/f'static/illustrations-ai/{i}.webp').stat().st_size<100000
            img.thumbnail((width,height))
            x=(index%2)*width; y=(index//2)*(height+25)
            sheet.paste(img,(x,y),img)
            draw.text((x+5,y+height+3),str(i),fill='white')
        sheet.save(root/f'reports/illustrations-{start}-{start+9}-{width}.png')
print('Fitted and technical checks passed:',','.join(map(str,ids)))
