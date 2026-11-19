import json,hashlib,subprocess,shutil
from pathlib import Path
from collections import Counter
pre='reports/batch-1072-1101'
def read(s):return json.loads(Path(pre+s).read_text(encoding='utf-8'))
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
drafts=read('-drafts.json');local=read('-local-validation.json');art=read('-art-validation.json')
assert len(local['rows'])==30 and not local['errors']
posts=json.loads(Path('static/data/posts.json').read_text(encoding='utf-8'))
old=json.loads(subprocess.check_output(['git','show','HEAD:static/data/posts.json'],encoding='utf-8'))
assert posts[:len(old)]==old
for p in drafts:
 assert next(x for x in posts if x['id']==p['id'])=={k:v for k,v in p.items() if k!='knowledge'}
 assert Path('build/post/'+p['id']+'/index.html').exists()
 assert sha('build/illustrations-ai/'+p['id']+'.webp')==sha('static/illustrations-ai/'+p['id']+'.webp')
assert Path('build/.nojekyll').exists()
status=json.loads(subprocess.check_output(['python','scripts/post-knowledge.py','status'],encoding='utf-8'))
assert status['verified']==1101 and not status['problems']
file=Path('static/illustrations-ai/manifest.json');manifest=json.loads(file.read_text(encoding='utf-8'))
for e in manifest:
 if e['id'] not in {p['id'] for p in drafts}:continue
 e['review']['status']='accepted'
 e['review']['cardReviewReport']=pre+'-local-validation.json'
 e['review']['background']='Inspected at 160x90 and 320x180, then on real 390x844 cards on both the base gradient and current CardGlow; no opaque backdrop or loss of main motif.'
 e['review']['meaning']='Article-relevant accompanying motif; no claim to reconstruct an entire experiment. '+e['metadata']['concept']
 if e['id']=='1100':e['review']['meaning']+=' Corrected three monochrome records; tiny RGB corner tabs identify filters, not colored negatives.'
 if e['id']=='1082':e['review']['meaning']+=' Abstract ligand metaphor, not a literal EDTA coordination diagram; decorative haze removed.'
 if e['id']=='1095':e['review']['meaning']+=' Corrected V-shaped skating push instead of classical parallel-ski stride.'
 e['review']['visibleGapCssPixels']=next(x['metrics']['visibleGap'] for x in local['rows'] if x['id']==e['id'])
file.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
# Review annotations do not affect rendering (gallery only branches on rejected statuses).
# Keep the static review manifest in the preview artifact in sync, without changing code or artwork.
shutil.copyfile(file,'build/illustrations-ai/manifest.json')
counts=Counter(x['category'] for x in posts)
summary=dict(ids=[p['id'] for p in drafts],records=len(posts),ideas=status['ideas'],categories=dict(counts),original_posts_preserved=len(old),original_manifest_entries_preserved=1071,
 tests=dict(command='npm test under Node.js 22.23.4',passed=13,failed=0),build='passed; 30 new static pages, identical WebP files and .nojekyll verified',
 knowledge=status,illustrations=dict(count=30,bytes=sum(x['bytes'] for x in art),dimensions='640x360',corners='alpha 0',generation_calls=30,targeted_edits=3),
 browser=dict(url=local['base']+'post/1072/',cards=30,backgrounds=['base gradient','current CardGlow'],flips=30,source_sets=30,low_viewport=local['low'],errors=local['errors'],visible_gap_min=min(x['metrics']['visibleGap'] for x in local['rows']),visible_gap_max=max(x['metrics']['visibleGap'] for x in local['rows'])),version='1.5.2')
Path(pre+'-final-validation.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
header=f'''## Dávka 1072–1101: doplnění nejméně zastoupených kategorií

Databáze má **1101 příspěvků, 1058 různých poznatků a 15 kategorií**. Nová dávka doplnila Chemii o 14 příspěvků (18 → 32), Sport o 11 (29 → 40) a Kinematografii o 5 (48 → 53). Všech 1071 původních objektů článků a položek obrazového manifestu je zachováno. Verze aplikace a oba údaje lockfile jsou **1.5.2**. Ve významovém indexu byla opravena pointa 456, která zaměňovala zemi Oz za režiséra Ozua; samotný článek se nemění.

Všech 30 nových ID má registrovaný RGBA WebP 640×360 v kartách a společném manifestu galerie, dohromady **{sum(x['bytes'] for x in art)} B**. Rohy mají nulovou alfu. Vzniklo 30 samostatných vestavěných generování a tři cílené úpravy: 1082 odstranění dekorativní mlhy, 1095 bruslařský odraz místo klasického kroku, 1100 černobílé výtažky místo barevných pásů. Původní verze, prompty, zdrojové cesty a důvody jsou v `reports/batch-1072-1101-*` a manifestu. Rozměry, kvalitu ani cenu generování nástroj neumožňuje nastavit; následné zmenšení neurčuje spotřebu generování.

Motivy: 1072 pufr s kapkou, 1073 chromatogram, 1074 destilační aparatura, 1075 diamant a tužka, 1076 síťovaná pryž, 1077 nylonové vlákno, 1078 rezavý hřebík, 1079 rozklad peroxidu, 1080 chladivý sáček, 1081 perlivá voda, 1082 kov s ligandem, 1083 žlutý plamen, 1084 elektrolytická pec, 1085 sádrový odlitek, 1086 brankář hrající nohou, 1087 volejbal a skóre, 1088 střídání drah, 1089 biatlonový terč, 1090 kámen a koště, 1091 desetibojařská tabulka, 1092 start běžce, 1093 ohnutá tyč, 1094 vstup na tenisový kurt, 1095 bruslící běžkař, 1096 kriket v dešti, 1097 klapka, 1098 optická stopa, 1099 různé vzdálenosti od kamery, 1100 tři černobílé záznamy, 1101 poskok postavy mezi okénky. Jde o doprovodné ilustrace a stručné metafory, nikoli úplné technické diagramy. Některé mají více ploch a stínování než doporučený cíl; hlavní motivy jsou rozpoznatelné.

Prohlédnuty všechny motivy při 160×90 a 320×180 i všech 30 skutečných mobilních karet při 390×844 na základním gradientu a přesném současném CardGlow. Browser ověřil 30 otočení, úplný text a správné zdrojové odkazy, bez runtime chyb. Ověřen také nízký viewport 390×500 a desktop. Viditelná mezera od alfa≥16 kresby k hooku činí **{summary['browser']['visible_gap_min']:.2f}–{summary['browser']['visible_gap_max']:.2f} CSS px**. Bez změny CSS, rendereru, palet, sdíleného stylu, automatického měření či zlatých otisků a bez výjimek podle ID.

Významový index je úplný a platný, všechny nové texty prošly kontrolou originality a mají dva ověřené zdroje. Náhled deterministického repairu navrhuje 99 změn; nových ID se týká pouze nesprávný návrh portrétu u filmových okének 1101, který byl významově odmítnut. Staré návrhy nebyly aplikovány. **Prošlo všech 13 projektových testů pod Node.js 22.23.4 a produkční build**, ověřeny všechny nové statické stránky, shodné WebP i `.nojekyll`. Přetrvávají dosavadní upozornění Svelte a velikost balíčku galerie. Regresní checklist uživatelského chování zůstává relevantní; ovládání se nemění.

**Běžící lokální náhled:** [{local['base']}post/1072/]({local['base']}post/1072/). Podklady: `reports/batch-1072-1101-editorial-review.md`, plán, návrhy, schválení, 60 ověřených zdrojových záznamů, obrazové provenance, vizuální náhledy a `reports/batch-1072-1101-final-validation.json`. Bez veřejného nasazení.

'''
handoff=Path('docs/ilustrace-handoff.md');text=handoff.read_text(encoding='utf-8');text=text.replace('# Ilustrace — aktuální stav\n\n','# Ilustrace — aktuální stav\n\n'+header,1);handoff.write_text(text,encoding='utf-8')
print(json.dumps(summary['browser'],ensure_ascii=False))
