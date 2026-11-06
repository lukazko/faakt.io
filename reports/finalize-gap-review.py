import hashlib,json,subprocess
from pathlib import Path
R=Path(__file__).resolve().parents[1]
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
layout=read(R/'reports/illustrations-313-352-card-layout.json')
assert len(layout)==40 and all(x['flipWorks'] and not x['titleOverflow'] for x in layout)
validation=read(R/'reports/illustrations-313-352-validation.json');images={x['id']:x for x in validation['images']}
by_layout={x['id']:x for x in layout}
path=R/'static/illustrations-ai/manifest.json';manifest=read(path)
for p in manifest:
    if p['id'] not in images:continue
    l=by_layout[p['id']];m=images[p['id']]['alphaMargins'];box=l['imageCss']
    scale=min(box['width']/640,box['height']/360)
    gap=l['hookTop']-(box['y']+(360-m['bottom'])*scale)
    l['visibleArtworkToHookGap']=round(gap,2)
    p['review']={**p['review'],'status':'accepted','sizes':['160x90','320x180'],
      'meaning':'Selected motif accompanies the complete article. Reviewed in numbered asset sheets and real mobile cards with title and hook. It is an editorial illustration, not calibrated scientific data or an exact reconstruction.',
      'background':'RGBA WebP with alpha-zero corners; actual base dark card and current dev-only CSS glow inspected.',
      'simplicity':'Clear main silhouettes. Some clothing, frame and object details exceed the strict flat-shape target; no multistep explanatory inventory.',
      'visibleArtworkToHookGap':round(gap,2)}
    if p['id']=='341':p['review']['meaning']='Corrected male Dorian Gray in one framed portrait, with corruption visible in one half; the first female portrait was rejected.'
path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(R/'reports/illustrations-313-352-card-layout.json').write_text(json.dumps(layout,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
baseline=read(R/'reports/posts-gap-313-352-import.json').get('baselineCommit','HEAD')
old=json.loads(subprocess.check_output(['git','show',baseline+':static/data/posts.json'],cwd=R))
current=read(R/'static/data/posts.json');indexed={p['id']:p for p in current}
assert len(old)==876 and all(indexed[p['id']]==p for p in old)
gaps=[l['visibleArtworkToHookGap'] for l in layout]
summary={'posts':40,'ids':[str(i) for i in range(313,353)],'databaseRecords':len(current),
 'originalPostsUnchanged':len(old),'illustrations':40,'imageBytes':validation['totalBytes'],
 'mobileCards':40,'backgrounds':['base','current CSS glow'],'flipChecks':40,'sourceExpansionChecks':40,
 'visibleArtworkToHookGapRange': [min(gaps),max(gaps)],'localURL':'http://127.0.0.1:4192/faakt.io/?order=id&post=313',
 'version':'1.4.0','publicDeployment':False}
(R/'reports/posts-gap-313-352-final.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(summary))
