from PIL import Image,ImageDraw
from pathlib import Path
canvas=Image.new('RGB',(680,410),'#0d0d0d');draw=ImageDraw.Draw(canvas)
for row,(rid,version) in enumerate([('623','before'),('623','new')]):
 im=Image.open(f'tmp/repair-623-power/{rid}-{version}.webp').convert('RGBA')
 for x,size in [(25,(320,180)),(430,(160,90))]:
  thumb=im.resize(size,Image.Resampling.LANCZOS);canvas.paste(thumb,(x,row*205+20),thumb)
 draw.text((5,row*205+3),rid+' '+version,fill='white')
canvas.save('tmp/repair-623-power/comparison.jpg',quality=92)

