import json
from pathlib import Path
pre=Path('reports/batch-1132-1161')
v=json.loads(Path(str(pre)+'-final-validation.json').read_text(encoding='utf-8'))
section=f'''## Dávka 1132–1161: vyrovnání nejmenších kategorií

Aktuálně **1161 příspěvků, 1118 různých poznatků a 15 kategorií**. Všech 1131 původních objektů článků i záznamů obrazového manifestu je zachováno. Verze aplikace a oba údaje lockfile zůstávají **1.5.2**.

| Kategorie | Před dávkou | Přidáno | Nyní |
| --- | ---: | ---: | ---: |
| Chemie | 48 | 12 | 60 |
| Sport | 50 | 10 | 60 |
| Ekonomie | 56 | 4 | 60 |
| Kinematografie | 57 | 3 | 60 |
| Společnost | 60 | 1 | 61 |

Všech 30 nových ID má skutečný průhledný RGBA WebP 640×360 v produkčních kartách i společném manifestu galerie; nové záznamy galerie obsahují také titulky a kategorie. Celkem **{v['art_bytes']} B**, každý soubor pod 100 kB, rohy mají alfu 0. Použito 30 samostatných vestavěných generování `image_gen` s `transparent_background=true` a dvě cílené úpravy 1136: barevné kapaliny byly nahrazeny stejně vypadajícími pevnými vzorky grafitu, následně byl odstraněn vzniklý průhledný lem. Předchozí verze a přesné prompty zůstávají v `reports/batch-1132-1161-*` a manifestu. Generátor nenabízel nastavení rozměrů, kvality ani ceny; převod na WebP tuto spotřebu neřídí.

Motivy: 1132 chemická tyčinka, 1133 hořící zápalka, 1134 zalomený model vody, 1135 váha se vzorkem vody, 1136 dva izotopové vzorky grafitu, 1137 krystaly soli, 1138 kapka vody, 1139 uzavřená reakční baňka, 1140 láhev kyseliny, 1141 mísení do válce, 1142 nepřilnavá pánev s vejcem, 1143 jódové hodiny, 1144 šachový král, 1145 sousední pěšci, 1146 rukavice a noha na baseballové metě, 1147 míček na síti, 1148 badmintonový míček u rohu kurtu, 1149 šipka střídavého držení, 1150 výškařská laťka, 1151 golfová karta, 1152 ragbyový rozhodčí signalizující výhodu, 1153 šermíř za koncem planše, 1154 rozdělená mince, 1155 společná pouliční lampa, 1156 chléb a cenovka, 1157 dům na pružině, 1158 viržovaný filmový pás, 1159 dělená předsádka, 1160 benši vedle plátna, 1161 dvě sousedské skupiny. Jednotlivé významové poznámky rozlišují doprovod tématu od úplného technického diagramu. Některé motivy přesahují cíl 5–8 ploch a tří barev vnitřní kresbou nebo stínováním; tato omezení jsou zaznamenaná. Obecná vizuální hesla byla po kontrole nahrazena třemi konkrétními výrazy pro stejný námět; skutečně odeslaná metadata a prompty jsou zachované odděleně.

Prohlédnuty všechny motivy při 160×90 a 320×180 na základním gradientu i přesném současném CardGlow. Ověřeno všech 30 skutečných mobilních karet při 390×844: ilustrace, celé hooky, otočení, úplný text a všechny zdrojové odkazy. Ověřeno také 390×500, desktop 1440×1000 a odkaz na číselně řazený feed. Viditelná mezera od alfa≥16 kresby k hooku je **{v['visible_gaps'][0]:.2f}–{v['visible_gaps'][1]:.2f} CSS px**. Dvojice vzorků 1136 má přirozeně užší motiv; bez posunu dolů, ořezu nebo individuálních CSS výjimek. Renderer, palety, CardGlow a zlaté otisky se nemění.

Významový index je úplný a aktuální. Před výběrem byl přečten katalog všech 1088 původních poznatků a plné blízké texty; 30 jednotlivých rozhodnutí a 61 zdrojových odkazů dokládají plán, schválení a redakční review v `reports/batch-1132-1161-*`. Náhled repairu navrhuje 102 změn, z nových ID jedinou u 1144; návrh portrétu byl odmítnut, protože obrázek zobrazuje šachovou figuru. Náhled nebyl aplikován. Prošlo všech 13 projektových testů pod Node.js 22.23.4 a následná kontrola registrace přijatých ilustrací. Regresní checklist uživatelského chování zůstává relevantní; přidává se obsah a registrace obrázků, ovládání se nemění. Fyzický mobil ani veřejné nasazení nebyly testovány.

Finální build a kontrola statických souborů: probíhá. Lokální test se po dokončení obnoví na [http://127.0.0.1:5188/faakt.io/?order=id&post=1132](http://127.0.0.1:5188/faakt.io/?order=id&post=1132). Bez merge, push nebo veřejné publikace.

'''
p=Path('docs/ilustrace-handoff.md');s=p.read_text(encoding='utf-8');s=s.replace('# Ilustrace — aktuální stav\n\n','# Ilustrace — aktuální stav\n\n'+section,1);p.write_text(s,encoding='utf-8')
print('Updated illustration handoff with counts, mappings, palette policy, review and spacing.')
