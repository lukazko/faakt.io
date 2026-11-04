import hashlib
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
draft_path = root / 'reports/new-posts-867-896.json'
posts = json.loads(draft_path.read_text(encoding='utf-8'))
by_id = {p['id']: p for p in posts}
by_id['873']['sources'][1] = {'label': 'Plútarchos: Život Solóna, části 15–16', 'url': 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Solon*.html'}
by_id['875']['sources'] = [
    {'label': 'Smarthistory: The Severan Tondo — damnatio memoriae', 'url': 'https://smarthistory.org/damnatio-memoriae-in-ancient-rome/'},
    {'label': 'Smarthistory: The Arch of Septimius Severus', 'url': 'https://smarthistory.org/arch-septimius-severus-ancient-rome/'},
]
by_id['877']['sources'][1] = {'label': 'Magoja: Natural Justice and Loyalty to the Legislator in Aristotle’s Theory of Equity', 'url': 'https://ojs.austral.edu.ar/juridicaaustral/article/view/714'}
by_id['894']['sources'][1] = {'label': 'NASA Goddard: Ancient Brines and the Chemical Building Blocks of Life in Asteroid Bennu', 'url': 'https://science.gsfc.nasa.gov/600/public-nuggets/nugget032425.pdf'}
by_id['896']['sources'][1] = {'label': 'Alvin Roth: Nobel autobiography, kidney exchange', 'url': 'https://www.nobelprize.org/prizes/economic-sciences/2012/roth/biographical/'}
by_id['881']['illustration'].update(concept='A single gold-colored atomic nucleus ejects three separated proton dots; symbolic nuclear motif, no gold bar.', visual_keywords=['compact_nucleus', 'three_proton_dots', 'nuclear_emission'], palette='blue_gold')
draft_path.write_text(json.dumps(posts, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

audit_path = root / 'reports/new-posts-867-896-originality.json'
audit = json.loads(audit_path.read_text(encoding='utf-8'))
database_path = root / 'static/data/posts.json'
raw = database_path.read_bytes()
assert hashlib.sha256(raw).hexdigest() == audit['databaseSha256'], 'Database changed: re-review required'
old = json.loads(raw)
assert len(old) == audit['processedRecords'] == len(audit['coverageIds']) == 766
assert {p['id'] for p in old} == set(audit['coverageIds'])
assert [p['id'] for p in posts] == [str(i) for i in range(867, 897)]
assert not ({p['id'] for p in posts} & {p['id'] for p in old})
assert len({p['title'] for p in posts}) == 30
for post, verdict in zip(posts, audit['proposals']):
    assert post['id'] == verdict['id']
    assert set(post) == {'id','title','content','category','sources','illustration'}
    assert len(post['title']) <= 80 and 500 <= len(post['content']) <= 1200
    assert 2 <= len(post['sources']) <= 3
    hook = re.match(r'<p>(.*?)</p>', post['content']).group(1)
    assert len(re.findall(r'[.!?](?:\s|$)', hook)) in (2,3), (post['id'],hook)
    assert set(post['illustration']) == {'concept','scene_type','primary_subject','secondary_subjects','visual_keywords','composition_hints','mood','palette'}
    verdict['finalTextVerdict'] = 'přijmout'
    verdict['finalTextReview'] = 'Celý hotový text odpovídá uvedené samostatné myšlence a konkrétnímu rozdílu od původního plného textu; test záměny neprošel. Porovnáno také s ostatními 29 hotovými příspěvky.'
    verdict['finalPostSha256'] = hashlib.sha256(json.dumps(post,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
audit['withinBatchReview'] = '30 odlišných hlavních myšlenek: alokace odměn; mediánový vítěz; informační převaha vedení; slabé vazby a mobilita; anomie; řízení dojmu; dluhová svoboda; římské občanství; sankce památky; akrasie; epieikeia; kompatibilismus; řečové akty; nástroj v tělesném schématu; elektromagnetická transmutace; baryonové CP; jaderný oscilátor; načasování chůze; beta-glukan; spánek a energie; SSSP bez řazení; exponent matic; FHE; anamorfóza; polopřímá řeč; filmová osa; aperiodická monotila; Bennu solanka; neznámý dvanáctistěn; cykly dárců.'
audit['additionalNearestReview'] = {'867': {'ids':['840'], 'difference':'Versailles kontroluje šlechtu ceremoniálem a blízkostí; selektorát předpovídá změnu veřejných versus soukromých statků podle velikosti koalice.'},'878':{'ids':['719','770'],'difference':'Budoucí pravdivost a výroková logika nejsou kompatibilistickou odpovědí na kauzální determinismus.'},'879':{'ids':['596'],'difference':'Interpelace vytváří subjekt ideologie; řečový akt vykonává konvenční závazek za podmínek zdařilosti.'},'891':{'ids':['608'],'difference':'Polyfonie nechává postavám samostatné hlasy; polopřímá řeč formálně slučuje vyprávění a hodnocení postavy bez uvozování.'}}
# Preserve every existing byte before the closing array bracket.
end = raw.rfind(b']')
addition = json.dumps(posts,ensure_ascii=False,indent=2)[2:-2]
combined = raw[:end].rstrip() + b',\n' + addition.encode('utf-8') + b'\n]\n'
assert json.loads(combined) == old + posts
database_path.write_bytes(combined)
audit['appendedDatabaseSha256'] = hashlib.sha256(combined).hexdigest()
audit['finalRecords'] = len(old)+len(posts)
audit_path.write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
review_path = root / 'reports/new-posts-867-896-review.md'
review = review_path.read_text(encoding='utf-8').replace('Stav: probíhá čtení; žádný nový příspěvek dosud není schválen ani zapsán.', 'Stav: úplná kontrola 766 původních textů a 30 finálních nových textů dokončena; ID 867–896 připojena. Podrobné verdikty a otisky jsou v sousedním originality.json.')
review_path.write_text(review,encoding='utf-8')
print('Appended 30 posts; existing 766 objects preserved; total',len(old)+len(posts))
