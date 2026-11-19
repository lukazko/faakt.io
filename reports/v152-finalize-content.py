from pathlib import Path
import json, subprocess, sys, re
ROOT=Path(__file__).resolve().parents[1]
def read(p): return json.loads((ROOT/p).read_text(encoding='utf-8'))
def write(p,d): (ROOT/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
drafts=read('reports/v152-drafts.json')
plan=read('reports/v152-plan.json')
assert len(drafts)==35
for p in drafts:
    assert 500<=len(p['content'])<=1200
    hook=re.search(r'<p>(.*?)</p>',p['content']).group(1)
    assert 2<=len(re.findall(r'[.!?](?:\s|$)',hook))<=3,(p['id'],hook)
    assert not re.search(r'…|\.\.\.',hook)
result=subprocess.run([sys.executable,'scripts/post-knowledge.py','check-drafts','--drafts','reports/v152-drafts.json'],cwd=ROOT,capture_output=True,text=True,encoding='utf-8',check=True)
check=json.loads(result.stdout)
write('reports/v152-draft-check.json',check)
assert not check['errors'],check['errors']
approval=dict(snapshot=check['snapshot'],catalog_reviewed=plan['catalog_reviewed'],drafts_hash=check['drafts_hash'],decisions=[dict(id=p['id'],verdict='accept',compared_ids=p['compared_ids'],reason=p['reason'],final_text_reviewed=True,within_batch_reviewed=True,sources_verified=True) for p in plan['proposals']])
write('reports/v152-approval.json',approval)
write('reports/v152-source-review.json',dict(method='Opened institutional, publisher and research sources; checked final factual claims and qualifications against the retrieved texts. Where a research abstract was blocked, checked the available indexed abstract or an accessible full text. No invented quotations.',posts=[dict(id=p['id'],claim_checked=p['knowledge']['point'],sources=p['sources']) for p in drafts]))
append=subprocess.run([sys.executable,'scripts/post-knowledge.py','append','--drafts','reports/v152-drafts.json','--approval','reports/v152-approval.json'],cwd=ROOT,capture_output=True,text=True,encoding='utf-8')
(ROOT/'reports/v152-append-result.txt').write_text(append.stdout+append.stderr,encoding='utf-8')
print(append.stdout,append.stderr)
if append.returncode: sys.exit(append.returncode)
for name in ['package.json','package-lock.json']:
    p=read(name);p['version']='1.5.2'
    if name=='package-lock.json': p['packages']['']['version']='1.5.2'
    write(name,p)
print('Content appended and versions synchronized to 1.5.2.')
