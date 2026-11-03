from PIL import Image, ImageDraw
from pathlib import Path
import json

root=Path(__file__).resolve().parents[2]
records=sorted((root/'tmp/imagegen').glob('result-*.json'))
for start in range(0,len(records),10):
    sheet=Image.new('RGB',(690,10*205),'#0d0d0d')
    draw=ImageDraw.Draw(sheet)
    for row,p in enumerate(records[start:start+10]):
        rec=json.loads(p.read_text(encoding='utf-8'))
        asset=root/f'static/illustrations-ai/{rec["id"]}.webp'
        im=Image.open(asset).convert('RGBA')
        for x,size in [(40,(320,180)),(420,(160,90))]:
            thumb=im.resize(size,Image.Resampling.LANCZOS)
            sheet.paste(thumb,(x,row*205+20),thumb)
        draw.text((4,row*205+3),rec['id'],fill='white')
    path=root/f'tmp/imagegen/review-{start//10+1}.jpg'
    sheet.crop((0,0,690,min(10,len(records)-start)*205)).save(path,quality=90)
    print(path)
