import json,urllib.request,concurrent.futures,re,io,ssl
from pathlib import Path
from html import unescape
from pypdf import PdfReader
root=Path(__file__).resolve().parents[1]
prefix=root/'reports/batch-1102-1131'
posts=json.loads(Path(str(prefix)+'-drafts.json').read_text(encoding='utf-8'))
# After initial source selection, fetch only the current, editorially amended draft URLs.
if any(not p['sources'] for p in posts):
    for p,ss in zip(posts,sources):p['sources']=[dict(label=l,url=u) for l,u in ss]
    Path(str(prefix)+'-drafts.json').write_text(json.dumps(posts,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
cache=root/'tmp/batch-1102-1131-source-cache';cache.mkdir(parents=True,exist_ok=True)
terms=['osmos','carbonat','amylose','silver','polymer','copper','resin','sugar','ester','soap','iodine','freez','pressure','sul','titr','baking','baton','straight','way','forward','downward','let','16','rotat','medley','cox','rear','focus','diegetic','graphic']

def get(job):
    p,j,s=job;dest=cache/f"{p['id']}-{j}.txt"
    try:
        if dest.exists():t=dest.read_text(encoding='utf-8')
        else:
            req=urllib.request.Request(s['url'],headers={'User-Agent':'Mozilla/5.0'})
            try:
                response=urllib.request.urlopen(req,timeout=35)
            except urllib.error.URLError as e:
                if 'CERTIFICATE_VERIFY_FAILED' not in str(e):raise
                # Read-only public pages; host trust store lacks some university CA chains.
                response=urllib.request.urlopen(req,timeout=35,context=ssl._create_unverified_context())
            with response as r:data=r.read()
            if data.startswith(b'%PDF'):t=' '.join(page.extract_text() or '' for page in list(PdfReader(io.BytesIO(data)).pages)[:12])
            else:
                t=data.decode('utf-8',errors='replace');t=re.sub(r'<(script|style)\b[^>]*>.*?</\1>',' ',t,flags=re.S|re.I);t=unescape(re.sub('<[^>]+>',' ',t))
            t=re.sub(r'\s+',' ',t);dest.write_text(t,encoding='utf-8')
        term=terms[int(p['id'])-1102];matches=list(re.finditer(re.escape(term),t,re.I))
        return dict(id=p['id'],source=j,url=s['url'],chars=len(t),status='downloaded',excerpts=[t[max(0,m.start()-90):m.end()+450] for m in matches[:3]])
    except Exception as e:return dict(id=p['id'],source=j,url=s['url'],status='failed',error=str(e))
if __name__=='__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:results=list(ex.map(get,[(p,j,s) for p in posts for j,s in enumerate(p['sources'])]))
    Path(str(prefix)+'-source-fetch.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
    for r in results:print(json.dumps(r,ensure_ascii=False))
