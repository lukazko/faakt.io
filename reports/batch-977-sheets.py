from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,sys
R=Path(__file__).resolve().parents[1];O=R/'reports'
posts={p['id']:p for p in json.loads((R/'static/data/posts.json').read_text(encoding='utf8'))}
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',15)
ids=[i for i in range(977,1007) if (R/f'static/illustrations-ai/{i}.webp').exists()]
for start in range(0,len(ids),6):
 group=ids[start:start+6];sheet=Image.new('RGB',(1020,250*((len(group)+1)//2)),'#141414');d=ImageDraw.Draw(sheet)
 for n,pid in enumerate(group):
  x=n%2*510;y=n//2*250;im=Image.open(R/f'static/illustrations-ai/{pid}.webp').convert('RGBA')
  for size,at in [((320,180),(x+4,y+40)),((160,90),(x+344,y+85))]:
   thumb=im.resize(size,Image.Resampling.LANCZOS);sheet.paste(thumb,at,thumb)
  title=f"{pid} {posts[str(pid)]['title']}"
  while d.textlength(title,font=font)>500:title=title[:-2]+'…'
  d.text((x+5,y+8),title,font=font,fill='white')
 sheet.save(O/f'batch-977-art-sheet-{start//6+1}.jpg',quality=90)
print('Sheets for',len(ids),'assets')
if '--cards' in sys.argv:
 for start in range(977,1007,6):
  sheet=Image.new('RGB',(1170,844),'#141414')
  for n,pid in enumerate(range(start,min(start+6,1007))):
   for suffix,row in [('glow',0),('base',1)]:
    im=Image.open(O/f'batch-977-cards/{pid}-{suffix}.png').convert('RGB').resize((195,422),Image.Resampling.LANCZOS)
    sheet.paste(im,(n*195,row*422))
  sheet.save(O/f'batch-977-card-sheet-{start}.jpg',quality=90)
