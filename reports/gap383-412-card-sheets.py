from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).resolve().parents[1]
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',14)
for background in ['glow','base']:
    suffix='' if background=='glow' else '-base'
    for batch in range(3):
        sheet=Image.new('RGB',(975,900),'#202020')
        draw=ImageDraw.Draw(sheet)
        for offset in range(10):
            pid=383+batch*10+offset
            source=root/f'reports/gap383-412-cards/{pid}{suffix}.png'
            im=Image.open(source).convert('RGB').resize((195,422),Image.Resampling.LANCZOS)
            x=(offset%5)*195;y=(offset//5)*450
            draw.text((x+8,y+2),f'{pid} · {background}',font=font,fill='white')
            sheet.paste(im,(x,y+24))
        path=root/f'reports/gap383-412-card-sheet-{background}-{batch+1}.jpg'
        sheet.save(path,quality=92)
        print(path)
