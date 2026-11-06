import json
from pathlib import Path
from PIL import Image,ImageDraw
mp=Path('static/illustrations-ai/manifest.json')
manifest=json.loads(mp.read_text(encoding='utf-8'))
layout=json.loads(Path('reports/illustrations-957-976-card-layout.json').read_text(encoding='utf-8'))
assert len(layout)==20 and all(m['flipWorks'] and not m['titleOverflow'] and m['glowVisible'] for m in layout)
for m in layout:
    e=next(e for e in manifest if e['id']==m['id'])
    rect=m['imageCss']
    gap=m['hookTop']-(rect['y']+rect['height']-e['review']['alphaMargins']['bottom']*rect['width']/640)
    e['review'].update({'visibleArtworkToHookCssPixels':round(gap,2),'cardViewport':'390x844',
      'cardImageCssSize':[rect['width'],rect['height']],
      'spacing':'Centered alpha footprint retained. Wide motifs have a larger visible gap; no downward shifting, stretching or global layout change.'})
    m['visibleArtworkToHookCssPixels']=round(gap,2)
mp.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
Path('reports/illustrations-957-976-card-layout.json').write_text(json.dumps(layout,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for group in range(2):
    sheet=Image.new('RGB',(640,1000),'#101010')
    draw=ImageDraw.Draw(sheet)
    for n,m in enumerate(layout[group*10:(group+1)*10]):
        rect=m['imageCss']
        for b,bg in enumerate(['base','glow']):
            im=Image.open(f"tmp/imagegen-batch-957/cards/{m['id']}-{bg}.png")
            art=im.crop((rect['x'],rect['y'],rect['x']+rect['width'],rect['y']+rect['height'])).resize((160,90))
            sheet.paste(art,(b*320,n*100))
            draw.text((b*320+165,n*100+32),m['id']+' '+bg,fill='white')
    sheet.save(f'tmp/imagegen-batch-957/review-thumbnails-{group}.jpg')
print(json.dumps({'cards':len(layout),'gapMin':min(m['visibleArtworkToHookCssPixels'] for m in layout),'gapMax':max(m['visibleArtworkToHookCssPixels'] for m in layout)}))
