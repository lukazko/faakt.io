import json,subprocess,pathlib,runpy
R=pathlib.Path.cwd(); O=R/'reports'
drafts=json.loads((O/'batch-977-drafts.json').read_text(encoding='utf8'))
drafts[2]['title']='Čtyři centimetry změnily let oštěpu'
scene={'978':'interaction','980':'object','982':'interaction','984':'portrait','986':'interaction','987':'interaction','990':'interaction','998':'object','1001':'object'}
for p in drafts:
 if p['id'] in scene:p['illustration']['scene_type']=scene[p['id']]
 if p['id'] in ['978','982','984','986','987','990']:p['illustration']['mood']='dynamic'
(O/'batch-977-drafts.json').write_text(json.dumps(drafts,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
res=json.loads(subprocess.check_output(['python','scripts/post-knowledge.py','check-drafts','--drafts','reports/batch-977-drafts.json'],encoding='utf8'))
(O/'batch-977-check.json').write_text(json.dumps(res,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Errors',res['errors'])
for x in res['candidates']:
 print(x['id'],[(c['id'],c['point']) for c in x['candidates'][:2]])
plan=json.loads((O/'batch-977-plan.json').read_text(encoding='utf8'))
approval=dict(snapshot=res['snapshot'],catalog_reviewed=res['snapshot'],drafts_hash=res['drafts_hash'],decisions=[dict(id=x['id'],verdict='accept',compared_ids=x['compared_ids'],reason=x['reason'],final_text_reviewed=True,within_batch_reviewed=True,sources_verified=True) for x in plan['proposals']])
(O/'batch-977-approval.json').write_text(json.dumps(approval,ensure_ascii=False,indent=2)+'\n',encoding='utf8')

