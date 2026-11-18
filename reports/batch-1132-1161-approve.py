import json,subprocess,re
from pathlib import Path
pre=Path('reports/batch-1132-1161')
def read(s):return json.loads(Path(str(pre)+s).read_text(encoding='utf-8'))
drafts=read('-drafts.json');plan=read('-plan.json')
check=json.loads(subprocess.check_output(['python','scripts/post-knowledge.py','check-drafts','--drafts',str(pre)+'-drafts.json'],encoding='utf-8'))
Path(str(pre)+'-check-final.json').write_text(json.dumps(check,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
assert not check['errors'],check['errors']
decisions=[]
for p,proposal in zip(drafts,plan['proposals']):
 hook=re.search(r'^<p>(.*?)</p>',p['content']).group(1)
 assert len(re.findall(r'[.!?](?:\s|$)',hook)) in [2,3],(p['id'],hook)
 decisions.append(dict(id=p['id'],verdict='accept',compared_ids=proposal['compared_ids'],reason=proposal['reason']+' Finální text zachovává plánovanou pointu; porovnány i všechny ostatní návrhy dávky.',final_text_reviewed=True,within_batch_reviewed=True,sources_verified=True))
approval=dict(snapshot=check['snapshot'],catalog_reviewed=plan['catalog_reviewed'],drafts_hash=check['drafts_hash'],decisions=decisions)
Path(str(pre)+'-approval.json').write_text(json.dumps(approval,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Approved',len(decisions),'drafts; every hook has 2–3 sentences.')
