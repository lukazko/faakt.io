from pathlib import Path
from PIL import Image, ImageDraw
folder=Path(__file__).resolve().parent/'batch-1042-1071-review'
for start in range(1042,1072,5):
    sheet=Image.new('RGB',(1150,950),'#252525')
    draw=ImageDraw.Draw(sheet)
    for col,id in enumerate(range(start,min(start+5,1072))):
        for row,bg in enumerate(['base','glow']):
            pic=Image.open(folder/f'card-{id}-{bg}.png').convert('RGB')
            pic.thumbnail((222,440),Image.Resampling.LANCZOS)
            x=col*230;y=row*475
            draw.text((x+5,y+5),f'{id} {bg}',fill='white')
            sheet.paste(pic,(x+4,y+25))
    sheet.save(folder/f'cards-{start}.jpg',quality=88)
print('Saved six real-card contact sheets.')
