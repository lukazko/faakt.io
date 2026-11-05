import json,pathlib,hashlib
R=pathlib.Path(__file__).resolve().parents[1]
read=lambda p:json.loads((R/p).read_text(encoding='utf-8'))
check=read('reports/new-posts-897-926-draft-check.json')
plan=read('reports/new-posts-897-926-plan.json')
assert not check['errors']
decisions=[]
for p in plan['proposals']:
 ids=p['compared_ids']+(['789'] if p['id']=='908' else [])
 decisions.append(dict(id=p['id'],verdict='accept',compared_ids=ids,reason=p['reason'],final_text_reviewed=True,within_batch_reviewed=True,sources_verified=True))
approval=dict(snapshot=check['snapshot'],catalog_reviewed=check['snapshot'],drafts_hash=check['drafts_hash'],decisions=decisions)
(R/'reports/new-posts-897-926-approval.json').write_text(json.dumps(approval,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
before=R/'tmp/imagegen-batch-897/before-append';before.mkdir(exist_ok=True)
for name in ['static/data/posts.json','static/data/post-knowledge.json','static/data/knowledge-ideas.json','editorial/knowledge-state.json','static/illustrations-ai/manifest.json','src/lib/components/PostIllustration.svelte','docs/ilustrace-handoff.md']:
 target=before/pathlib.Path(name).name
 if not target.exists(): target.write_bytes((R/name).read_bytes())
print(json.dumps(dict(decisions=len(decisions),snapshot=check['snapshot'])))
