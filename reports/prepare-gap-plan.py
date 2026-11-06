import json, importlib.util
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('knowledge',ROOT/'scripts/post-knowledge.py')
k=importlib.util.module_from_spec(spec);spec.loader.exec_module(k)
rows=json.loads((ROOT/'reports/posts-gap-313-352-specs.json').read_text(encoding='utf-8'))
rows[5][6]='960'
rows[5][7]='Vyhledání externích dokumentů pro odpověď je jiný mechanismus než postupné odšumování při tvorbě obrazu.'
rows[13]=['filozofie','Aristotelés: ne každé nevěděl jsem je omluva','Aristotelés rozlišuje jednání z neznalosti konkrétních okolností od zaviněné nevědomosti, takže opilost nebo zanedbané poznání nemusí zbavovat odpovědnosti.','ancient-philosophy,ethics,aristotle,freedom','theory','overturned_wine_cup_beside_hand','876,877','Zaviněná neznalost a dobrovolnost činu je odlišná od slabé vůle navzdory vědění i opravy obecného zákona.']
(ROOT/'reports/posts-gap-313-352-specs.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
posts=json.loads((ROOT/'static/data/posts.json').read_text(encoding='utf-8'))
meta=json.loads((ROOT/'static/data/post-knowledge.json').read_text(encoding='utf-8'))['posts']
ideas=json.loads((ROOT/'static/data/knowledge-ideas.json').read_text(encoding='utf-8'))['ideas']
for p in posts:p['knowledge']={**meta[p['id']],**ideas[meta[p['id']]['idea']]}
tags=k.vocabulary(json.loads((ROOT/'static/data/tags.json').read_text(encoding='utf-8')))
snapshot=k.snapshot(posts,tags)
plan={'snapshot':snapshot,'catalog_reviewed':snapshot,'id_policy':'User explicitly requested filling existing gaps; first 40 missing IDs are 313–352.','proposals':[]}
searches=[]
for i,r in enumerate(rows,313):
    category,title,point,tagstr,typ,motif,compared,reason=r
    knowledge={'idea':f'idea-{i}','point':point,'tags':tagstr.split(','),'type':typ}
    plan['proposals'].append({'id':str(i),'category':category,'knowledge':knowledge,'compared_ids':compared.split(','),'reason':reason,'verdict':'accept'})
    searches.append({'id':str(i),'query':title+' '+point,'results':k.search(posts,tags,title+' '+point,knowledge['tags'],None,3)})
k.write(ROOT/'reports/posts-gap-313-352-plan.json',plan)
k.write(ROOT/'reports/posts-gap-313-352-searches.json',searches)
for row in searches:print(row['id'],[(p['id'],p['point']) for p in row['results']])
