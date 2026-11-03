from PIL import Image,ImageDraw
from pathlib import Path
canvas=Image.new('RGB',(680,820),'#0d0d0d');draw=ImageDraw.Draw(canvas)
for row,(rid,version) in enumerate([('600','before'),('600','new'),('623','before'),('623','new')]):
 im=Image.open(f'tmp/repair-600-623/{rid}-{version}.webp').convert('RGBA')
 for x,size in [(25,(320,180)),(430,(160,90))]:
  thumb=im.resize(size,Image.Resampling.LANCZOS);canvas.paste(thumb,(x,row*205+20),thumb)
 draw.text((5,row*205+3),rid+' '+version,fill='white')
canvas.save('tmp/repair-600-623/comparison.jpg',quality=92)
