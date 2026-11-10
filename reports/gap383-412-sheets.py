"""Review-only contact sheets; production assets are never modified."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json
root=Path(__file__).resolve().parents[1]
posts={p['id']:p for p in json.loads((root/'static/data/posts.json').read_text(encoding='utf-8'))}
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',16)
small=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',13)
available=[i for i in range(383,413) if (root/f'static/illustrations-ai/{i}.webp').exists()]
for start in range(0,len(available),6):
    ids=available[start:start+6]
    sheet=Image.new('RGB',(1020,310*((len(ids)+1)//2)), '#141414')
    draw=ImageDraw.Draw(sheet)
    for offset,pid in enumerate(ids):
        x=(offset%2)*510; y=(offset//2)*310
        im=Image.open(root/f'static/illustrations-ai/{pid}.webp').convert('RGBA')
        for size,at in [((320,180),(x+8,y+45)),((160,90),(x+342,y+90))]:
            thumb=im.resize(size,Image.Resampling.LANCZOS)
            sheet.paste(thumb,at,thumb)
        title=f"{pid}  {posts[str(pid)]['title']}"
        while draw.textlength(title,font=font)>490: title=title[:-2]+'…'
        draw.text((x+8,y+8),title,font=font,fill='white')
        draw.text((x+8,y+250),'320×180                         160×90',font=small,fill='#aaaaaa')
    output=root/f'reports/gap383-412-art-sheet-{start//6+1}.jpg'
    sheet.save(output,quality=90)
    print(output)
