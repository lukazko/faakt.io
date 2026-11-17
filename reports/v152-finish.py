from pathlib import Path
import json,hashlib,subprocess
from PIL import Image,ImageOps,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
def read(p):return json.loads((ROOT/p).read_text(encoding='utf-8'))
def write(p,d):(ROOT/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
drafts=read('reports/v152-drafts.json')
if '--sheets' in __import__('sys').argv:
    for mode in ['glow','base']:
        for start in range(0,35,7):
            sheet=Image.new('RGB',(810,1370),'#252525');draw=ImageDraw.Draw(sheet)
            for j,p in enumerate(drafts[start:start+7]):
                with Image.open(ROOT/f'reports/v152-review/card-{p["id"]}-{mode}.png') as im:
                    thumb=ImageOps.contain(im.convert('RGB'),(260,420))
                    x=(j%3)*270;y=(j//3)*455
                    draw.text((x+6,y+4),p['id'],fill='white');sheet.paste(thumb,(x+5,y+24))
            sheet.save(ROOT/f'reports/v152-review/cards-{mode}-{start//7+1}.jpg',quality=90)
    print('Created ten contact sheets from the real card screenshots.')
    raise SystemExit
local=read('reports/v152-local-validation.json');assert len(local['rows'])==35 and not local['errors']
manifest=read('static/illustrations-ai/manifest.json');rows=[]
for p in drafts:
    pid=p['id'];entry=next(x for x in manifest if x['id']==pid)
    artifact=ROOT/f'static/illustrations-ai/{pid}.webp'
    with Image.open(artifact) as im:
        assert im.mode=='RGBA' and im.size==(640,360)
        assert all(im.getpixel(xy)[3]==0 for xy in [(0,0),(639,0),(0,359),(639,359)])
        l,t,r,b=im.getchannel('A').point(lambda a:255 if a>=16 else 0).getbbox()
    entry['bytes']=artifact.stat().st_size;entry['imageSha256']=hashlib.sha256(artifact.read_bytes()).hexdigest()
    review=entry['review'];review.update(status='accepted-card-and-thumbnail',alphaMargins=dict(left=l,right=640-r,top=t,bottom=360-b),background='All 35 viewed at 160x90 and 320x180 on the base gradient and exact current CardGlow. Actual mobile card contact sheets viewed on both backgrounds; all flips, complete text and source links verified in Chromium.',simplicity='Recognizable editorial motifs. Some images contain more shading or detail than the strict 5–8-shape target; accepted without cosmetic regeneration.',cardReview=next(x for x in local['rows'] if x['id']==pid))
    if pid=='1013':review['meaning']='An unmixed painter palette accompanies Seurat’s color separation; it is not itself a pointillist painting.'
    if pid=='1023':review['meaning']='Pale-edged porous granule is an enlarged symbolic cutaway, not a literal microscopic image or molecular sieve.'
    if pid=='1026':review['meaning']='A cropped editorial sunset view emphasizes the blue area near the Sun; not a quantitative all-sky color model.'
    if pid=='1035':review['meaning']='A curved descent accompanies the ideal mathematical problem; track contour is not a dimensioned cycloid construction.'
    if pid=='1039':review['meaning']='A finish camera accompanies the article; the icon is not a diagram of precise track alignment.'
    if pid=='1040':review['contrastNote']='Dark wheel and frame lines are subdued at 160x90, but riders, cycling pose and paired bicycles remain identifiable on both backgrounds.'
    if pid=='1021':review['correction']='Original rectangular background rejected; one background-only transparent edit accepted, preserving the toast.'
    rows.append(dict(id=pid,bytes=entry['bytes'],imageSha256=entry['imageSha256'],alphaMargins=review['alphaMargins']))
write('static/illustrations-ai/manifest.json',manifest)
gaps=[x['metrics']['visibleGap'] for x in local['rows']]
write('reports/v152-art-validation.json',dict(status='accepted-card-and-thumbnail',rows=rows,totalBytes=sum(x['bytes'] for x in rows),dimensions='640x360',cornersAlphaZero=True,visibleGapRange=[min(gaps),max(gaps)],generationCalls=35,targetedBackgroundEdits=1))
posts=read('static/data/posts.json');old=json.loads(subprocess.check_output(['git','show','HEAD:static/data/posts.json'],cwd=ROOT,encoding='utf-8'));assert posts[:len(old)]==old
oldmanifest=json.loads(subprocess.check_output(['git','show','HEAD:static/illustrations-ai/manifest.json'],cwd=ROOT,encoding='utf-8'));assert manifest[:len(oldmanifest)]==oldmanifest
versions=[read('package.json')['version'],read('package-lock.json')['version'],read('package-lock.json')['packages']['']['version']];assert versions==['1.5.2']*3
for p in drafts:
    assert (ROOT/f'build/post/{p["id"]}/index.html').is_file()
    assert hashlib.sha256((ROOT/f'build/illustrations-ai/{p["id"]}.webp').read_bytes()).hexdigest()==hashlib.sha256((ROOT/f'static/illustrations-ai/{p["id"]}.webp').read_bytes()).hexdigest()
assert (ROOT/'build/.nojekyll').is_file()
write('reports/v152-final-validation.json',dict(version='1.5.2',newIds=[p['id'] for p in drafts],posts=len(posts),ideas=len(read('static/data/knowledge-ideas.json')['ideas']),categories=15,oldArticleObjectsPreserved=len(old),oldManifestEntriesPreserved=len(oldmanifest),staticPagesVerified=35,staticImagesMatchSource=35,nojekyll=True,tests=dict(passed=13,failed=0,node='22.23.4',note='System Node 18 cannot parse the current sharp dependency. Tests succeeded with cached Node 22. Corrected 1021 additionally verified visually and by alpha/hash checks.'),build='passed',browser='35 real mobile cards, two backgrounds, flips, complete texts, sources, low viewport and desktop; no page errors',preview=local['base']+'post/1007/',remainingWarnings='Existing Svelte slot/accessibility warnings and large development-gallery bundle.'))
doc=ROOT/'docs/ilustrace-handoff.md';s=doc.read_text(encoding='utf-8')
section=f'''## Verze 1.5.2: 35 nových příspěvků 1007–1041

Databáze má **1041 příspěvků, 998 různých poznatků a 15 kategorií**. Nová dávka rovnoměrně přidává po dvou textech ve všech kategoriích a třetí v Chemii, Vesmíru, Matematice, Technologiích a Sportu. Původních 1006 objektů článků, položek manifestu i obrázků zůstává zachováno. Verze `package.json` a oba údaje lockfile jsou **1.5.2**. Zobrazení verze nadále používá `__APP_VERSION__`, bez nové konstanty.

Všech 35 nových ID má RGBA WebP 640×360 s nulovou alfou v rozích; dohromady **{sum(x['bytes'] for x in rows)} B**. Vzniklo 35 samostatných generování vestavěným image_gen a jedna cílená průhledná úprava topinky 1021 po nalezení obdélníkového pozadí. První verze, přesné prompty, skutečné zdrojové cesty a oprava jsou doložené v `reports/v152-image-*.json`, `reports/v152-1021-first.webp` a společném manifestu. Rozměry, kvalitu a cenu generování nástroj neumožňuje nastavit; následná konverze spotřebu generování neurčuje. Nová ID jsou registrována v produkčních kartách i galerii. Dosavadní palety, CardGlow, renderer a zlaté otisky se nemění.

Motivy: 1007 H4, 1008 zděný londýnský dům, 1009 ruka a hranice donucení, 1010 osel mezi senem, 1011 ptakopysk, 1012 upravující se vydra, 1013 malířská paleta, 1014 dřevořez, 1015 kniha a komentář, 1016 prázdná školní židle, 1017 nádražní hodiny, 1018 záznam narození, 1019 kapilára, 1020 termoska, 1021 topinka, 1022 mýdlo a povlak, 1023 porézní uhlí, 1024 Měsíc, 1025 Saturn, 1026 marťanský západ, 1027 sazební ovladač s dorazem, 1028 vstupenky, 1029 gorilí kostým, 1030 poznámka bez atribuce, 1031 promítačka, 1032 dokreslovačka, 1033 krychle, 1034 tětivy, 1035 zakřivený skluz, 1036 flash paměť, 1037 databáze a deník, 1038 pořadí bajtů, 1039 cílová kamera, 1040 dvojice cyklistů, 1041 míč na penaltě. Jde o doprovodné redakční motivy, nikoli úplné rekonstrukce nebo přesné měřicí diagramy. U 1040 zůstávají tmavé linie kol při 160×90 méně výrazné; cyklisté a děj jsou rozpoznatelní. Některé motivy mají více detailů a stínování než přísný cíl 5–8 ploch.

Všech 35 motivů bylo prohlédnuto při 160×90 a 320×180 na původním gradientu i přesném aktuálním CardGlow. Prohlédnuty byly také skutečné mobilní karty při 390×844 na obou pozadích; browser ověřil 35 otočení, úplné texty a správné zdrojové odkazy bez runtime chyb. Viditelná mezera od alfa≥16 kresby k hooku je **{min(gaps):.2f}–{max(gaps):.2f} CSS px**. Nízký viewport 390×500 umožňuje dočíst hook posunem a otočit kartu; ověřen je i desktop. Bez ručních výjimek pro odsazení. Podklady jsou v `reports/v152-review/`, metriky v `reports/v152-local-validation.json` a `reports/v152-art-validation.json`.

Významový index je úplný a platný. Náhled deterministického repairu nenavrhuje změny u nových ID; staré návrhy nebyly aplikovány. **Všech 13 projektových testů prošlo pod Node.js 22.23.4**; systémový Node 18 nepodporuje syntaxi aktuálního sharp. Produkční build vytvořil všech 35 nových stránek a obrázků i `.nojekyll`. Přetrvávají dosavadní upozornění Svelte a velikost balíčku vývojové galerie. Redakční rozhodnutí a zdroje: `reports/v152-editorial-review.md`, plán, návrhy a schválení. Souhrn: `reports/v152-final-validation.json`.

**Běžící lokální náhled:** [{local['base']}post/1007/]({local['base']}post/1007/).

'''
assert '## Verze 1.5.2: 35 nových' not in s
s=s.replace('# Ilustrace — aktuální stav\n\n','# Ilustrace — aktuální stav\n\n'+section,1);doc.write_text(s,encoding='utf-8')
print('Final validation, visual acceptance and current illustration handoff saved.')
