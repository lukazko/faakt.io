from PIL import Image,ImageDraw
import pathlib,json
R=pathlib.Path(__file__).resolve().parents[1]
folder=R/'tmp/imagegen-batch-927/cards'
files=[folder/f'{i}.png' for i in range(927,957)]
assert all(f.exists() for f in files),'Wait for all card screenshots'
for start in range(0,30,6):
 sheet=Image.new('RGB',(1170,1660),'#090909')
 for n,f in enumerate(files[start:start+6]):
  card=Image.open(f).convert('RGB');card.thumbnail((390,800))
  x=(n%3)*390;y=(n//3)*830
  sheet.paste(card,(x,y+25));ImageDraw.Draw(sheet).text((x+10,y+5),f.stem,fill='white')
 sheet.save(folder/f'sheet-{start//6+1}.jpg',quality=90)
# Thumbnail cards retain each post’s title and hook beside the 160x90 asset.
posts=json.loads((R/'reports/new-posts-927-956.json').read_text(encoding='utf-8'))
for start in range(0,30,10):
 sheet=Image.new('RGB',(800,780),'#101010');d=ImageDraw.Draw(sheet)
 for n,p in enumerate(posts[start:start+10]):
  x=(n%2)*400;y=(n//2)*156
  im=Image.open(R/f"static/illustrations-ai/{p['id']}.webp").convert('RGBA').resize((160,90))
  sheet.paste(im,(x+8,y+24),im)
  # IDs map unambiguously to the actual title/hook screenshots above.
  d.text((x+8,y+5),p['id'],fill='white')
  small=Image.open(folder/f"{p['id']}.png").convert('RGB');small.thumbnail((180,145))
  sheet.paste(small,(x+190,y))
 sheet.save(folder/f'thumbnails-{start//10+1}.jpg',quality=92)
print('5 actual-card sheets and 3 thumbnail comparison sheets ready')
