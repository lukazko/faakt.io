import json
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[1]
drafts = json.loads((root/'reports/gap383-412-drafts.json').read_text(encoding='utf-8'))
results = []
for p in drafts:
    query = p['title']+' '+p['knowledge']['point']
    result = json.loads(subprocess.check_output(['python','scripts/post-knowledge.py','search','--query',query,'--limit','5'],cwd=root,encoding='utf-8'))
    results.append(dict(id=p['id'], query=query, results=result['results']))
    print(p['id'], ' | '.join(x['id']+': '+x['point'] for x in result['results'][:3]), flush=True)
(root/'reports/gap383-412-searches.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
check = json.loads(subprocess.check_output(['python','scripts/post-knowledge.py','check-drafts','--drafts','reports/gap383-412-drafts.json','--fill-gaps'],cwd=root,encoding='utf-8'))
(root/'reports/gap383-412-draft-check.json').write_text(json.dumps(check,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('ERRORS',check['errors'], 'HASH',check['drafts_hash'])
