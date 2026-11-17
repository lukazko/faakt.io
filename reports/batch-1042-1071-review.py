import json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
path=root/'reports/batch-1042-1071-check.json'
raw=path.read_bytes()
check=json.loads(raw.decode('utf-16' if raw.startswith(b'\xff\xfe') else 'utf-8-sig'))
path.write_text(json.dumps(check,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Errors:',check['errors'])
for row in check['candidates']:
    print(row['id']+': '+' | '.join(str(c.get('score'))+' '+c['id']+' '+c['point'] for c in row['candidates'][:3]))
cache=root/'tmp/batch-1042-1071-source-cache'
for id,term in [('1043','Mont'),('1044','conatus'),('1045','infinite'),('1050','Laius'),('1052','1989'),('1060',''),('1063','sandwich'),('1065','J-cut'),('1070','1979')]:
    for path in cache.glob(id+'-*.txt'):
        t=path.read_text(encoding='utf-8')
        m=re.search(term,t,re.I)
        print(path.name+': '+(t[max(0,m.start()-120):m.end()+500] if m else 'No keyword'))
