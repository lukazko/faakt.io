import json,pathlib,subprocess,runpy
R=pathlib.Path(__file__).resolve().parents[1]
def read(p):return json.loads((R/p).read_text(encoding='utf-8'))
def save(p,d):(R/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
drafts=read('reports/new-posts-927-956.json')
save('reports/new-posts-927-956-before-copyedit.json',drafts)
posts=read('static/data/posts.json');changes=[]
for p in posts:
 if p['id']=='950':
  p['content']=p['content'].replace('potřebujete hranu dlouhou třetí odmocninu ze dvou násobků původní hrany','potřebujete původní hranu vynásobit třetí odmocninou ze dvou')
  changes.append('950')
 if p['id']=='931':
  p['content']=p['content'].replace('rozdíl v obsahu kyslíku','rozdíl v koncentraci rozpuštěného kyslíku')
  changes.append('931')
for d in drafts:
 if d['id'] in changes:d['content']=next(p['content'] for p in posts if p['id']==d['id'])
save('static/data/posts.json',posts);save('reports/new-posts-927-956.json',drafts)
(R/'reports/batch-927-956-texts.py').write_text('texts='+repr([p['content'] for p in drafts])+'\n',encoding='utf-8')
batch=json.loads(subprocess.check_output(['python','scripts/post-knowledge.py','review-batch','--ids',','.join(changes),'--limit','2'],cwd=R))
save('reports/new-posts-927-956-copyedit-input.json',batch)
print(json.dumps(batch,ensure_ascii=False))
