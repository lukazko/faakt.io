from pathlib import Path
from PIL import Image, ImageDraw
import json
root=Path.cwd()
records=sorted((root/'tmp/imagegen-batch-521').glob('record-*.json'))
for start in range(0,len(records),10):
    group=records[start:start+10]
    sheet=Image.new('RGB',(690,len(group)*205),'#0d0d0d')
    draw=ImageDraw.Draw(sheet)
    for row,p in enumerate(group):
        rec=json.loads(p.read_text(encoding='utf-8'))
        im=Image.open(root/f'static/illustrations-ai/{rec["id"]}.webp').convert('RGBA')
        for x,size in [(40,(320,180)),(420,(160,90))]:
            thumb=im.resize(size,Image.Resampling.LANCZOS)
            sheet.paste(thumb,(x,row*205+20),thumb)
        draw.text((4,row*205+3),rec['id'],fill='white')
    path=root/f'tmp/imagegen-batch-521/review-{start//10+1}.jpg'
    sheet.save(path,quality=90)
    print(path)
