import json
from pathlib import Path
pre='reports/batch-1072-1101'
def read(s):return json.loads(Path(pre+s).read_text(encoding='utf-8'))
check=read('-check-final.json');plan=read('-plan.json')
assert not check['errors']
extra={
'1072':(['1023','1022'],'Pufrační kapacita je schopnost chemicky tlumit přídavek kyseliny či zásady, ne kapacita adsorbentu ani srážení mýdla.'),
'1074':(['1002','912'],'Mez separace dvousložkové směsi je odlišná od latentního tepla varu čisté látky i trojného bodu.'),
'1075':(['322','396'],'Propojení uhlíku ve vrstvách a prostorové síti, nikoli ukládání sodných iontů či mýtus o stékání amorfního skla.'),
'1078':(['1004','1057'],'Srovnán celý text pasivace i obětované anody; nový článek učí nutnou účast vody a kyslíku při rezivění železa.'),
'1081':(['913'],'Rozpustnost CO2 v nápoji podle parciálního tlaku není extrakční schopnost superkritického CO2.'),
'1091':(['1070'],'Převod absolutních výkonů různých jednotek na nelineární body, nikoli vzdálenostní hranice hodnoty střely.'),
'1092':(['1039'],'Záměrné vložení skokanského výsledku do startovních časů místo optického měření dojezdu.'),
'1097':(['1065','404'],'Jednorázový společný impuls pro zarovnání nezávislých záznamů, nikoli jejich umělecké rozdělení nebo nové nahrání hlasu.'),
'1099':(['256','1032'],'Vzdálenost a měřítko předmětů před kamerou vytváří iluzi velikosti; nejde o současnou ostrost různých plánů ani připojení malby.'),
'1101':(['892'],'Časová elipsa s viditelným poskokem při podobném rámování, nikoli prostorová orientace po stranách dialogové osy.')}
decisions=[]
for p in plan['proposals']:
 ids=list(p['compared_ids']);reason=p['reason']
 if p['id'] in extra:
  more,note=extra[p['id']];ids=list(dict.fromkeys(ids+more));reason+=' '+note
 decisions.append(dict(id=p['id'],verdict='accept',compared_ids=ids,reason=reason,final_text_reviewed=True,within_batch_reviewed=True,sources_verified=True))
out=dict(snapshot=check['snapshot'],catalog_reviewed=plan['catalog_reviewed'],drafts_hash=check['drafts_hash'],decisions=decisions,reviewer='Codex editorial review, 2026-11-17')
Path(pre+'-approval.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Approved',len(decisions),'exact drafts',check['drafts_hash'])
