import json,subprocess,os
from pathlib import Path
os.environ['PYTHONUTF8']='1'
pre='reports/batch-1072-1101'
def save(suffix,d):Path(pre+suffix).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
r=json.loads(subprocess.check_output(['python','scripts/post-knowledge.py','review-batch','--ids','456','--limit','1'],encoding='utf-8'))[0]
r['knowledge']['point']='Čaroděj ze země Oz využívá přechod ze sépiového zobrazení do barevného Technicoloru k vypravěčskému oddělení všedního světa a fantazie.'
review={k:r[k] for k in ['id','source_hash','knowledge']}
review.update(verdict='verified',reason='Úplný text pojednává o zemi Oz, nikoli režiséru Ozuovi. Opravena zaměněná pointa; článek se nemění.')
save('-index-repair.json',[review])
subprocess.run(['python','scripts/post-knowledge.py','apply-review','--review',pre+'-index-repair.json','--write'],check=True)
d=json.loads(Path(pre+'-drafts.json').read_text(encoding='utf-8'))
d[1081-1072]['sources'][1]['label']="OpenStax: Solubility and Henry's law"
d[1086-1072]['sources'][1]['label']='The Royal Gazette: zpráva z 3. července 1992'
save('-drafts.json',d)
plan=json.loads(Path(pre+'-plan.json').read_text(encoding='utf-8'))
snap=json.loads(subprocess.check_output(['python','scripts/post-knowledge.py','status'],encoding='utf-8'))['snapshot']
plan['snapshot']=plan['catalog_reviewed']=snap
save('-plan.json',plan)
# UTF-8 files are written by Python, avoiding PowerShell 5 redirection encodings.
for mode,suffix,arg in [('check-plan','-plan-check.json','--plan'),('check-drafts','-check-final.json','--drafts')]:
    target=pre+('-plan.json' if mode=='check-plan' else '-drafts.json')
    result=subprocess.run(['python','scripts/post-knowledge.py',mode,arg,target],capture_output=True,text=True,encoding='utf-8')
    Path(pre+suffix).write_text(result.stdout,encoding='utf-8')
    if result.returncode:raise RuntimeError(result.stderr or result.stdout)
    print(mode,'passed',flush=True)
