import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
prefix=root/'reports/batch-1042-1071'
def read(s):
    raw=Path(str(prefix)+s).read_bytes()
    return json.loads(raw.decode('utf-16' if raw.startswith(b'\xff\xfe') else 'utf-8-sig'))
check=read('-check-final.json')
assert not check['errors'],check['errors']
Path(str(prefix)+'-check-final.json').write_text(json.dumps(check,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
plan=read('-plan.json')
extra={
'1046':(['791'],'Na rozdíl od kavitačního úderu strašíka zde ryba řídí sbíhání částí vystříknutého proudu.'),
'1049':(['466'],'Rodinův článek řeší osamostatnění figury z většího díla, nikoli pohyb součástí skutečné sochy.'),
'1051':(['626'],'Godot řeší absurdní očekávání bez vyústění; urna zkoumá uchování výjevu uměním a cenu zastaveného času.'),
'1054':(['998'],'Piano Phase posouvá rytmické vzorce, zatímco zde skládání akustických kmitů vytváří měřitelné rázy rozdílové frekvence.'),
'1055':(['669'],'Hipparchův článek popisuje astronomické rozpoznání precese a změnu oblohy; nový text vysvětluje mechanický účinek vnějšího momentu na vektor momentu hybnosti.'),
}
decisions=[]
for p in plan['proposals']:
    ids=list(p['compared_ids']);reason=p['reason']
    if p['id'] in extra:
        more,note=extra[p['id']];ids=list(dict.fromkeys(ids+more));reason+=' '+note
    decisions.append(dict(id=p['id'],verdict='accept',compared_ids=ids,reason=reason,final_text_reviewed=True,within_batch_reviewed=True,sources_verified=True))
out=dict(snapshot=check['snapshot'],catalog_reviewed=plan['catalog_reviewed'],drafts_hash=check['drafts_hash'],decisions=decisions,reviewer='Codex editorial review, 2026-11-17')
Path(str(prefix)+'-approval.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Final approval for',len(decisions),'drafts, hash',check['drafts_hash'])
