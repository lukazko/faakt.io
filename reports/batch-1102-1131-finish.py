import json,subprocess,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1];pre=root/'reports/batch-1102-1131'
def read(s):return json.loads(Path(str(pre)+s).read_text(encoding='utf-8'))
drafts=read('-drafts.json');local=read('-local-validation.json');art=read('-art-validation.json')
assert len(local['rows'])==len(art)==30 and not local['errors']
manifest_path=root/'static/illustrations-ai/manifest.json';manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
notes={
'1102':'Membrane cartridge accompanies reverse osmosis; this is not a complete pressure or brine diagram. Coil detail exceeds the flat-shape target.',
'1103':'Trowel and lime mortar joint accompany carbonation; the image does not claim that visible drying proves completed carbonation.',
'1104':'Blue-black spot on a cut potato directly matches the described starch test.',
'1105':'Developing tray and illustrative tree print accompany photographic image formation; not a named historical photograph or a diagram of silver grains.',
'1106':'Swollen gel in a measuring cup accompanies polyacrylate swelling. Soft highlights exceed the flat-color target.',
'1107':'Copper-colored spoon in blue bath accompanies electrodeposition; omitted electrodes and wiring mean this is not a complete apparatus diagram.',
'1108':'Cutaway resin cartridge accompanies ion exchange; oversized beads aid recognition and are not a literal scale model.',
'1109':'Sugar crystal stick accompanies growth from solution; facets are intentionally simplified.',
'1110':'Scent bottle with a pear is topic accompaniment for fruity esters, not a claim that the named ethyl acetate is the sole pear aroma.',
'1111':'Soap bar and mould accompany the product of saponification; the arrow describes lifting, not the chemical mechanism.',
'1112':'Iodine crystals and contained violet vapor under a watch glass accompany sublimation; soft vapor is a meaningful subject, not decorative background.',
'1113':'Salted melting ice accompanies freezing-point depression. Warm palette gives the ice a cream tint; this is a schematic cube, not a color measurement.',
'1114':'Gas syringe accompanies compression of a gas equilibrium. Single chamber does not itself demonstrate the before/after composition.',
'1115':'Tarnished silver spoon matches the subject; mottled tarnish and highlights exceed the strict large-shape target.',
'1116':'Burette and pink solution accompany titration; the pink endpoint is not presented as the universal equivalence pH. Tall narrow motif remains fully visible.',
'1117':'Cut muffin with large pores accompanies gas leavening, not a proof that all pores came from one specific reaction.',
'1118':'Two hands transfer one baton; no exact takeover-zone geometry is claimed.',
'1119':'Walker has a straight forward supporting leg and visible heel contact; one pose accompanies the technique rather than proving continuous legal progression.',
'1120':'Crossed foils depict a parry between anonymous fencers; the image does not assign a point or priority from the pose alone.',
'1121':'Ball carrier turns to pass toward a trailing teammate; the depicted interaction matches the direction of the article.',
'1122':'Hand reaches toward a ball above the rim; no motion arrow claims that every such contact is illegal. Text provides the descent and scoring conditions.',
'1123':'Compound bow with eccentric cams accompanies let-off; no force curve is drawn. Tall narrow silhouette and darker blue riser are retained; yellow cams remain recognizable at thumbnail scale.',
'1124':'Open palm and tossed ball accompany legal service preparation; no drawn distance scale claims to certify 16 cm.',
'1125':'Six large player discs and clockwise arrow accompany rotational order. This is an intentionally simple schematic, not a complete receiving-position diagram.',
'1126':'Swimmer grips the start block from the water, directly accompanying the backstroke relay start.',
'1127':'Coxswain faces a rower and gives a coordinating signal without holding an oar; cropped boat accompanies the role, not a full racing-shell blueprint.',
'1128':'Car cabin, screen and projector accompany rear projection; simplified depth separates projector from the action in front of the screen.',
'1129':'Hand turns the cinema lens focus ring. Lens detail and highlights exceed the strict flat-shape target; this is topic accompaniment, not an illustration of zoom.',
'1130':'Radio is a recognizable possible source of diegetic music; sound arcs are editorial symbols, not literal visible sound.',
'1131':'Matching plate and moon circles illustrate the explicit hypothetical example, not a citation of an existing film sequence.'}
for p in drafts:
 e=next(e for e in manifest if e['id']==p['id']);row=next(r for r in local['rows'] if r['id']==p['id'])
 e['review'].update(status='accepted',meaning=notes[p['id']],cardReview=dict(viewport='390x844',baseAndGlowInspected=True,flipped=True,completeText=True,sourcesVerifiedInCard=True,visibleGapCssPx=round(row['metrics']['visibleGap'],3)),simplicity='Recognizable at 160x90 and 320x180. Several assets exceed the 5–8-shape/3-color target through shading and fine internal details; no automated claim of compliance.',generationLimitations='Built-in generator exposed no size, quality or cost controls; WebP sizing happened afterwards.')
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
gaps=[r['metrics']['visibleGap'] for r in local['rows']];total=sum(a['bytes'] for a in art)
handoff=root/'docs/ilustrace-handoff.md';old=handoff.read_text(encoding='utf-8')
section=f'''## Dávka 1102–1131: posílení nejméně zastoupených kategorií

Databáze má **1131 příspěvků, 1088 různých poznatků a 15 kategorií**. Dávka přidala Chemii 16 příspěvků (32 → 48), Sportu 10 (40 → 50) a Kinematografii 4 (53 → 57). Všech 1101 původních objektů článků i položek obrazového manifestu je zachováno. Verze aplikace i oba údaje lockfile zůstávají **1.5.2**.

Všech 30 nových ID má registrovaný statický RGBA WebP 640×360 v kartách i společném manifestu galerie. Celkem **{total} B**, každý soubor pod 100 kB, všechny rohy mají nulovou alfu. Vzniklo 30 samostatných vestavěných generování `image_gen` s `transparent_background=true`, bez regenerací. Nástroj nenabízel řízení rozměrů, kvality ani ceny; následné zmenšení tuto spotřebu neřídí. Přesné odeslané prompty a zdrojové cesty jsou v `reports/batch-1102-1131-images.json`, hashe promptů, metadat a výsledných obrázků i individuální významové kontroly v manifestu. Starší ilustrace se nemění.

Motivy: 1102 membránová patrona, 1103 zednická lžíce a vápenná spára, 1104 jódová skvrna na bramboře, 1105 vyvolávací miska s ilustrační fotografií stromu, 1106 bobtnající gel, 1107 poměděná lžíce v lázni, 1108 iontoměnič s pryskyřicí, 1109 cukrové krystaly na špejli, 1110 vonná lahvička a hruška, 1111 mýdlo z formy, 1112 jód pod hodinovým sklem, 1113 solená kostka ledu, 1114 plynová stříkačka, 1115 zčernalé stříbro, 1116 titrační aparatura, 1117 pórovitý muffin, 1118 předání kolíku, 1119 závodní chodec, 1120 kryt fleretem, 1121 zpětná ragbyová přihrávka, 1122 míč nad košem a ruka obránce, 1123 kladkový luk, 1124 nadhoz z otevřené dlaně, 1125 šest volejbalových pozic s hodinovou rotací, 1126 znakový start z vody, 1127 kormidelník a veslař, 1128 zadní projekce za kabinou automobilu, 1129 ostřicí prstenec objektivu, 1130 rádio, 1131 podobné kruhy talíře a Měsíce. Jde o doprovodné motivy a ilustrativní příklady, nikoli úplné laboratorní nebo pravidlové důkazy. Stínování, textura povlaku 1115 a vnitřní kresba některých nástrojů překračují přísný cíl několika ploch; tato omezení jsou zaznamenána v manifestu.

Prohlédnuty všechny motivy při 160×90 a 320×180 na základním gradientu i přesném současném CardGlow. Ověřeno všech 30 skutečných mobilních karet při 390×844, otočení, úplný text a oba zdrojové odkazy, bez runtime chyb. Dále ověřen nízký viewport 390×500 a desktop. Viditelná mezera od alfa≥16 kresby k hooku je **{min(gaps):.2f}–{max(gaps):.2f} CSS px**. Vysoké úzké motivy 1116 a 1123 zůstávají celé a mají přirozeně menší šířku. Bez změn CSS, rendereru, automatického měření či zlatých otisků.

Významový index je úplný a aktuální; před zápisem byl přečten katalog všech 1058 původních poznatků a plné blízké texty. Plán, finální návrhy, jednotlivé sémantické verdikty a 60 ověřených zdrojových záznamů jsou v `reports/batch-1102-1131-*`. Náhled deterministického repairu navrhuje 101 změn, z nových ID pouze změnu scény u 1108 a 1119; oba návrhy byly významově odmítnuty, protože jednotlivý iontoměnič a chodec nepotřebují druhého aktéra. Náhled nebyl aplikován. Prošlo 13 projektových testů pod Node.js 22 a produkční build; nové statické stránky a shodné WebP jsou ověřeny. Existující upozornění Svelte a velký balíček vývojové galerie přetrvávají. Regresní checklist uživatelského chování zůstává relevantní; změna přidává obsah, nemění ovládání. Fyzické mobilní zařízení ani veřejné nasazení nebyly testovány.

**Běžící lokální náhled:** [http://127.0.0.1:5187/faakt.io/post/1102/](http://127.0.0.1:5187/faakt.io/post/1102/). Server patří tomuto checkoutu a ponechává se běžet. Starší preview mělo po zvětšení dat neaktuální délku odpovědi, proto vznikl čerstvý proces na portu 5187. Bez merge, push nebo veřejného nasazení.

'''
handoff.write_text(old.replace('# Ilustrace — aktuální stav\n\n','# Ilustrace — aktuální stav\n\n'+section,1),encoding='utf-8')
print('Accepted 30 assets; documented all cards and spacing:',min(gaps),max(gaps))
