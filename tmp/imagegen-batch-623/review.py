import json, sys
from pathlib import Path
from PIL import Image, ImageDraw
ids=sys.argv[1:]
canvas=Image.new('RGB',(680,205*len(ids)),'#0d0d0d')
d=ImageDraw.Draw(canvas)
for row,rid in enumerate(ids):
    im=Image.open(f'static/illustrations-ai/{rid}.webp').convert('RGBA')
    for x,size in [(30,(320,180)),(430,(160,90))]:
        thumb=im.resize(size,Image.Resampling.LANCZOS)
        canvas.paste(thumb,(x,row*205+20),thumb)
    d.text((4,row*205+3),rid,fill='white')
path=f'tmp/imagegen-batch-623/review-{ids[0]}-{ids[-1]}.jpg'
canvas.save(path,quality=90)
print(path)
