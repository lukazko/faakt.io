import json,math
from pathlib import Path
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parents[1];out=R/'tmp/posts-gap-313-352';out.mkdir(parents=True,exist_ok=True)
for start in range(313,353,8):
    ids=list(range(start,min(start+8,353)))
    sheet=Image.new('RGB',(1280,math.ceil(len(ids)/4)*220),'#111111');d=ImageDraw.Draw(sheet)
    for n,id in enumerate(ids):
        image=Image.open(R/f'static/illustrations-ai/{id}.webp').convert('RGBA');image.thumbnail((320,180))
        x=(n%4)*320;y=(n//4)*220;sheet.paste(image,(x,y+20),image);d.text((x+10,y+3),str(id),fill='white')
    sheet.save(out/f'art-{start}.jpg',quality=94)
if (out/'cards/313-base.png').exists():
 for start in range(313,353,6):
    ids=list(range(start,min(start+6,353)));sheet=Image.new('RGB',(1170,math.ceil(len(ids)/3)*422),'#101010')
    for n,id in enumerate(ids):
      for b,bg in enumerate(['base','glow']):
        im=Image.open(out/'cards'/f'{id}-{bg}.png').convert('RGB').resize((195,422));sheet.paste(im,((n%3)*390+b*195,(n//3)*422))
    sheet.save(out/f'cards-{start}.jpg',quality=94)
print('Review sheets saved in',out)
