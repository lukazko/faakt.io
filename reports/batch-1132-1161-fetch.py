import json,urllib.request,concurrent.futures,re,io,html
from pathlib import Path
from pypdf import PdfReader
pre=Path('reports/batch-1132-1161')
drafts=json.loads(Path(str(pre)+'-drafts.json').read_text(encoding='utf-8'))
urls=list(dict.fromkeys(s['url'] for p in drafts for s in p['sources']))
def fetch(url):
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
  with urllib.request.urlopen(req,timeout=35) as r:data=r.read();status=r.status;final=r.url;ctype=r.headers.get('Content-Type','')
  if data.startswith(b'%PDF'):text='\n'.join(p.extract_text() or '' for p in PdfReader(io.BytesIO(data)).pages)
  else:
   text=data.decode('utf-8',errors='replace');text=re.sub(r'<(script|style)\b[^>]*>.*?</\1>','',text,flags=re.S|re.I);text=html.unescape(re.sub('<[^>]+>',' ',text));text=re.sub(r'\s+',' ',text)
  return dict(url=url,final=final,status=status,chars=len(text),text=text)
 except Exception as e:return dict(url=url,error=str(e))
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:results=list(ex.map(fetch,urls))
Path(str(pre)+'-source-fetch.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for r in results:print(r.get('status','FAIL'),r.get('chars',0),r['url'],r.get('error',''))
