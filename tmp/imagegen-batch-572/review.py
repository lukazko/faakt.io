from pathlib import Path
from PIL import Image, ImageDraw
import json
root=Path.cwd()
batch=json.loads((root/'tmp/imagegen-batch-572/batch.json').read_text(encoding='utf-8'))
jobs=[j for j in batch['jobs'] if (root/f'static/illustrations-ai/{j["id"]}.webp').exists()]
for start in range(0,len(jobs),10):
    group=jobs[start:start+10]
    sheet=Image.new('RGB',(690,len(group)*205),'#0d0d0d')
    draw=ImageDraw.Draw(sheet)
    for row,j in enumerate(group):
        im=Image.open(root/('static'+j['image'])).convert('RGBA')
        for x,size in [(40,(320,180)),(420,(160,90))]:
            thumb=im.resize(size,Image.Resampling.LANCZOS)
            sheet.paste(thumb,(x,row*205+20),thumb)
        draw.text((4,row*205+3),j['id'],fill='white')
    path=root/f'tmp/imagegen-batch-572/review-{start//10+1}.jpg'
    sheet.save(path,quality=90)
    print(path)
