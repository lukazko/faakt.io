import json, urllib.request, concurrent.futures, re, io
from pathlib import Path
from html import unescape
from pypdf import PdfReader
root=Path(__file__).resolve().parents[1]
posts=json.loads((root/'reports/batch-1042-1071-drafts.json').read_text(encoding='utf-8'))
cache=root/'tmp/batch-1042-1071-source-cache'
cache.mkdir(exist_ok=True)
keywords=['truce','December 6','conatus','infinite','hydrodynamic','evict','greas','mobile','Oedipus','kiss','participat','reopen','beat','precess','anthocyan','sacrificial','98','oscillat','delay','exchange rate','mismatch','consensus','squeeze','split edit','lattice','regions','TTL','bounce','1979','1988']
def get(job):
    p,j,s=job
    dest=cache/f"{p['id']}-{j}.txt"
    try:
        if dest.exists(): t=dest.read_text(encoding='utf-8')
        else:
            req=urllib.request.Request(s['url'],headers={'User-Agent':'Mozilla/5.0'})
            with urllib.request.urlopen(req,timeout=30) as r:
                data=r.read(); ct=r.headers.get('Content-Type','')
            if data.startswith(b'%PDF'):
                t='\n'.join(page.extract_text() or '' for page in PdfReader(io.BytesIO(data)).pages)
            else:
                t=data.decode('utf-8',errors='replace')
                t=re.sub(r'<(script|style)\b[^>]*>.*?</\1>',' ',t,flags=re.S|re.I)
                t=unescape(re.sub('<[^>]+>',' ',t))
            t=re.sub(r'\s+',' ',t)
            dest.write_text(t,encoding='utf-8')
        term=keywords[int(p['id'])-1042]
        matches=list(re.finditer(re.escape(term),t,re.I))
        snippets=[t[max(0,m.start()-130):m.end()+350] for m in matches[:2]]
        return dict(id=p['id'],source=j,url=s['url'],chars=len(t),excerpts=snippets,status='downloaded')
    except Exception as e:return dict(id=p['id'],source=j,url=s['url'],status='failed',error=str(e))
jobs=[(p,j,s) for p in posts for j,s in enumerate(p['sources'])]
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:
    result=list(ex.map(get,jobs))
(root/'reports/batch-1042-1071-source-fetch.json').write_text(json.dumps([{k:v for k,v in r.items() if k!='excerpts'} for r in result],ensure_ascii=False,indent=2),encoding='utf-8')
for r in result:print(json.dumps(r,ensure_ascii=False))
