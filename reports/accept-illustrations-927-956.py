import json,pathlib
R=pathlib.Path(__file__).resolve().parents[1]
read=lambda p:json.loads((R/p).read_text(encoding='utf-8'))
manifest=read('static/illustrations-ai/manifest.json');layout={x['id']:x for x in read('reports/illustrations-927-956-card-layout.json')}
validation=read('reports/new-posts-927-956-validation.json');metrics={x['id']:x for x in validation['images']}
prompts=[]
for m in manifest:
 if not 927<=int(m['id'])<=956: continue
 l=layout[m['id']];a=metrics[m['id']]['alphaMargins'];scale=l['image']['width']/640
 m['review'].update(status='accepted',background='True-alpha RGBA WebP, zero-alpha corners. All 30 inspected on actual gradient cards at 390x844 viewport and as 160x90 thumbnails; no opaque background rectangle.',simplicity='Recognizable accompanying motif at thumbnail size. Some generated shading and texture exceed strict flat-shape targets; no image depends on tiny labels or a multistep explanation.',alphaMargins=a,visibleArtworkToHookCssPixels=round(l['cssGap']+a['bottom']*scale,2),cardViewport='390x844',cardImageCssSize=[l['image']['width'],l['image']['height']],spacing='Balanced alpha margins retained. Wide low motifs leave a larger visible gap than tall motifs; no shifting, stretching, cropping or global layout change.')
 prompts.append({k:m[k] for k in ['id','image','prompt','promptHash','metadataHash','generationSource','generationMethod','imageSha256']})
(R/'static/illustrations-ai/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(R/'reports/illustrations-927-956-final-prompts.json').write_text(json.dumps(prompts,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
gaps=[m['review']['visibleArtworkToHookCssPixels'] for m in manifest[-30:]]
print(json.dumps(dict(accepted=30,minVisibleGap=min(gaps),maxVisibleGap=max(gaps),outliers=[dict(id=m['id'],gap=m['review']['visibleArtworkToHookCssPixels']) for m in manifest[-30:] if m['review']['visibleArtworkToHookCssPixels']>45])))
