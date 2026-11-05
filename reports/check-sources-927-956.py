import json,pathlib,urllib.request,concurrent.futures,re
R=pathlib.Path(__file__).resolve().parents[1]
import runpy
refs=runpy.run_path(str(R/'reports/batch-927-956-sources.py'))['sources']
posts=[dict(id=str(n),sources=[dict(label=l,url=u) for l,u in ss]) for n,ss in enumerate(refs,927)]
cache=R/'tmp/imagegen-batch-927/sources';cache.mkdir(exist_ok=True,parents=True)
def check(task):
 post,i,s=task
 try:
  req=urllib.request.Request(s['url'],headers={'User-Agent':'Mozilla/5.0'})
  with urllib.request.urlopen(req,timeout=25) as response:
   raw=response.read();typ=response.headers.get('Content-Type','');url=response.url
  text=raw.decode('utf-8',errors='replace') if 'pdf' not in typ else ''
  text=re.sub(r'<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>','',text,flags=re.S|re.I)
  text=re.sub('<[^>]+>',' ',text);text=re.sub(r'\s+',' ',text)
  (cache/f'{post}-{i}.txt').write_text(text,encoding='utf-8')
  if 'pdf' in typ: (cache/f'{post}-{i}.pdf').write_bytes(raw)
  return dict(id=post,source=i,url=s['url'],resolved_url=url,status=200,bytes=len(raw),content_type=typ)
 except Exception as e: return dict(id=post,source=i,url=s['url'],error=str(e))
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
 results=list(pool.map(check,[(p['id'],i,s) for p in posts for i,s in enumerate(p['sources'])]))
(R/'reports/new-posts-927-956-source-access.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(dict(ok=sum(x.get('status')==200 for x in results),errors=[x for x in results if 'error' in x]),ensure_ascii=False))
