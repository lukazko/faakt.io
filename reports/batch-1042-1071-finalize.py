import json, subprocess, hashlib, re
from collections import Counter
from pathlib import Path
root=Path(__file__).resolve().parents[1]
prefix=root/'reports/batch-1042-1071'
def read(path):return json.loads((root/path).read_text(encoding='utf-8-sig'))
def original(path):return json.loads(subprocess.check_output(['git','show','HEAD:'+path],cwd=root))
posts=read('static/data/posts.json')
old=original('static/data/posts.json')
drafts=read('reports/batch-1042-1071-drafts.json')
assert posts[:len(old)]==old
assert posts[len(old):]==[{k:v for k,v in p.items() if k!='knowledge'} for p in drafts]
categories=Counter(p['category'] for p in drafts)
assert len(categories)==15 and set(categories.values())=={2}
package=read('package.json');lock=read('package-lock.json')
assert package['version']==lock['version']==lock['packages']['']['version']
manifest=read('static/illustrations-ai/manifest.json');oldmanifest=original('static/illustrations-ai/manifest.json')
assert manifest[:len(oldmanifest)]==oldmanifest
local=read('reports/batch-1042-1071-local-validation.json')
assert len(local['rows'])==30 and not local['errors']
gaps=[r['metrics']['visibleGap'] for r in local['rows']]
for entry in manifest[len(oldmanifest):]:
    row=next(r for r in local['rows'] if r['id']==entry['id'])
    entry['review'].update(status='accepted',background='Inspected at 160x90 and 320x180 on base card gradient and exact current CardGlow; RGBA WebP, all four corners alpha 0.',card='Real mobile card at 390x844 inspected on base and glow; full hook, flip, complete body and source links verified.',visibleArtworkToHookGapCssPx=round(row['metrics']['visibleGap'],2))
    if entry['id'] in ['1047','1051','1059','1064','1071']:
        entry['review']['caveat']='Some shading or detail exceeds the strict 5–8-shape target; motif remains legible at both thumbnail sizes.'
(root/'static/illustrations-ai/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
assets=read('reports/batch-1042-1071-art-validation.json')
summary=dict(records=len(posts),new_ids=[p['id'] for p in drafts],categories=categories,original_posts_preserved=len(old),original_manifest_entries_preserved=len(oldmanifest),version=package['version'],asset_bytes=sum(s['bytes'] for s in assets),card_gap_css_px=[round(min(gaps),2),round(max(gaps),2)],browser_cards=30,browser_errors=local['errors'],unit_tests='13/13 passed on Node.js 22.23.4',build='pending')
Path(str(prefix)+'-final-validation.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
intro=f'''## Dávka 1042–1071: po dvou příspěvcích ve všech kategoriích

Databáze má **1071 příspěvků, 1028 různých poznatků a 15 kategorií**. Dávka přidala přesně dva nové příspěvky do každé kategorie. Všech 1041 původních objektů článků i položek obrazového manifestu je obsahově zachováno. Verze aplikace a obě verze lockfile zůstávají **{package['version']}**.

Všech 30 nových ID má registrovaný statický RGBA WebP 640×360 v kartách i společném manifestu galerie. Dohromady mají **{summary['asset_bytes']} B**, rohy mají nulovou alfu. Vzniklo 30 samostatných generování vestavěným image_gen a jedna cílená úprava britské čepice u 1042: původní ocelová přilba byla pro rok 1914 anachronická. První verze je uchována v `reports/batch-1042-1071-1042-first.webp`; přesné prompty, zdrojové cesty a oprava v `reports/batch-1042-1071-images.json` a manifestu. Nástroj nenabízí řízení rozměrů, kvality ani ceny generování. Následné zmenšení neomezuje spotřebu generování.

Motivy: 1042 výměna dárku mezi vojáky, 1043 hořící parník, 1044 rostoucí výhonek jako metafora conatu, 1045 kniha a kostka, 1046 lovící stříkoun, 1047 kukaččí mládě, 1048 litografický kámen, 1049 závěsný mobil, 1050 divadelní maska, 1051 urna s téměř se líbající dvojicí, 1052 společné hlasovací žetony, 1053 uzavřený spis, 1054 ladičky, 1055 gyroskop, 1056 barevný indikátor, 1057 loď se zinkovou anodou, 1058 Uran, 1059 Jupiterova skvrna, 1060 brambory, 1061 plynovod a továrna, 1062 karty s tvářemi, 1063 promítnutý názor v bublinách, 1064 filmový objektiv, 1065 přesah zvukové stopy, 1066 mřížový mnohoúhelník, 1067 tři řezy pizzy, 1068 směrovka s přesýpacími hodinami, 1069 tlačítko, 1070 míč s košem, 1071 skokan s lyžemi do V. Jde o doprovodné motivy a stručné metafory, nikoli o rekonstrukci konkrétních osob, úplné experimenty nebo technické výkresy. Některé kresby překračují přísný cíl počtu ploch či míry stínování; čitelnost zůstává zachována.

Všech 30 motivů bylo prohlédnuto při 160×90 a 320×180 na základním gradientu a přesném současném CardGlow. Prohlédnuto bylo rovněž všech 30 skutečných mobilních karet při 390×844 na obou pozadích. Browser ověřil 30 otočení, úplný text a správné odkazy na zdroje, bez runtime chyb; ověřen byl nízký viewport 390×500 a desktop. Viditelná mezera od alfa≥16 kresby k hooku je **{min(gaps):.2f}–{max(gaps):.2f} CSS px**. Bez ručních výjimek pro odsazení a bez změny společného rozložení, palet či rendereru. Podklady: `reports/batch-1042-1071-review/` a `reports/batch-1042-1071-local-validation.json`.

Významový index je kompletní a platný; prošlo všech 13 datových a obrazových testů. Deterministický repair byl pouze prohlédnut: nové návrhy 1062 a 1063 na portrét a 1068 na diagram nejsou pro zvolený doprovodný motiv potřebné a nebyly aplikovány. Původní metadata a zlaté otisky se nemění. Redakční kontrolu uchovávají plán, návrhy, hledání, závěrečné schválení a `reports/batch-1042-1071-editorial-review.md`.

Lokální produkční náhled po sestavení: [http://127.0.0.1:5182/faakt.io/post/1042/](http://127.0.0.1:5182/faakt.io/post/1042/). Stav buildu a konečné dostupnosti uvádí `reports/batch-1042-1071-final-validation.json`.

'''
doc=root/'docs/ilustrace-handoff.md'
text=doc.read_text(encoding='utf-8')
text=text.replace('# Ilustrace — aktuální stav\n\n','# Ilustrace — aktuální stav\n\n'+intro,1)
text=text.replace('Databáze má **1041 příspěvků, 998 různých poznatků a 15 kategorií**.','Před dávkou 1042–1071 měla databáze **1041 příspěvků, 998 různých poznatků a 15 kategorií**.',1)
doc.write_text(text,encoding='utf-8')
print(json.dumps(summary,ensure_ascii=False))
