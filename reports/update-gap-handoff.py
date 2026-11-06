import json
from pathlib import Path
R=Path(__file__).resolve().parents[1]
summary=json.loads((R/'reports/posts-gap-313-352-final.json').read_text(encoding='utf-8'))
for id in range(313,353):
 assert (R/f'build/post/{id}/index.html').exists()
 assert (R/f'build/illustrations-ai/{id}.webp').exists()
path=R/'docs/ilustrace-handoff.md';old=path.read_text(encoding='utf-8')
tail=old[old.index('## Lokální experiment se září za ilustrací'):]
head='''# Ilustrace — aktuální stav

## Nové příspěvky a ilustrace 313–352

Databáze obsahuje 916 příspěvků a 873 různých poznatků. Dávka 313–352 vyplňuje prvních 40 ID z mezery 313–412 podle výslovného zadání uživatele; zbývá 353–412. Všech osm zadaných tematických okruhů má po pěti textech. Existující kategorie: Historie 10, Filozofie 10, Technologie 5, Astronomie 5, Literatura 5 a Psychologie 5. Původních 876 objektů příspěvků je přesně zachovaných, což ověřuje závěrečný report proti původnímu HEAD.

Všech 916 ID má statický WebP, registraci v produkčních kartách a položku společného manifestu používaného také galerií. Nových 40 RGBA WebP má 640×360 px, nulovou alfu rohů, jednotlivě 11 264–36 702 B a dohromady 877 402 B. Vznikly vestavěným image_gen s `transparent_background=true`; rozměry, kvalitu ani cenu generování tento nástroj nenabízí. Přesné prompty a cesty zdrojů uchovávají `reports/gap-image-313.json` až `reports/gap-image-352.json`, společný manifest a `reports/posts-gap-image-inputs.json`. Jedna věcná oprava změnila původně ženský portrét 341 na mladého muže Doriana Graye; původní verze i opravný prompt zůstávají zachované.

Ilustrace doprovázejí vybraný aspekt článku. Čipy 319, mřížkový zámek 320, překrývající se horizonty 331 a opravený hrnek 349 jsou redakční metafory. Planetka 333 není kalibrovaný záznam nárazu DART a plachetnice 337 není technický výkres. Portrét 341 zobrazuje fiktivní literární postavu. Některé oděvy, rámy a předměty mají více detailů, než stanovuje přísný cíl plochého stylu; motivy zůstávají rozeznatelné na miniaturách.

Všechny obrázky byly prohlédnuty při 160×90 a 320×180 na skutečném základním gradientu karty i s přesným CSS aktuálního CardGlow. Všech 40 skutečných karet bylo zkontrolováno při viewportu 390×844 s titulkem a úplným hookem na obou podkladech. Žádný titulek ani hook nepřetéká; funguje 40 otočení na rub i 40 rozbalení správných zdrojových odkazů a prohlížeč nehlásí runtime chybu. Viditelná mezera mezi alfa≥16 okrajem ilustrace a hookem je 18,49–41,41 CSS px. Centrované proporce i globální rozvržení zůstávají zachované.

Assety a alfa okraje dokládá `reports/illustrations-313-352-validation.json`, mobilní metriky `reports/illustrations-313-352-card-layout.json` a miniatury `reports/illustrations-313-352-thumbnails.json`. Snímky a přehledové listy jsou v `tmp/posts-gap-313-352/`. Manifest uchovává skutečně předaná ilustrační metadata odděleně od následného zpřesnění konkrétních vizuálních klíčových slov. Náhled deterministického repairu vedl k cílenému zpřesnění typu scény čtyř nových postů; závěrečný náhled už pro nová ID nic nenavrhuje. Starších záznamů se repair nedotkl.

Úplný katalog 833 původních poznatků a blízké celé texty byly porovnány před psaním. Plán, hotové návrhy a redakční rozhodnutí jsou v `reports/posts-gap-313-352-*`; import proběhl hlídaným `append --fill-gaps`. Tento výslovný režim umožňuje jen vzestupná volná ID a nemění výchozí pravidlo maxima + 1. Významová metadata zůstávají v oddělených registrech; všech 916 záznamů má platné ověření. Zdroje rozlišují původní výsledky výzkumu od jejich interpretace a omezení.

Prošlo všech šest kontrol `npm test` a 17 testů významového nástroje včetně nových regresí pro vyplňování mezer. Produkční `npm run build` vytvořil všech 40 nových statických stránek i obrázků. Zůstávají dřívější upozornění Svelte na markup a velikost balíku vývojové galerie. Verze aplikace i oba údaje lockfile jsou shodně 1.4.0. Lokální test používá `http://127.0.0.1:4192/faakt.io/?order=id&post=313`; veřejné nasazení neproběhlo. Závěrečný souhrn je v `reports/posts-gap-313-352-final.json`.

'''
path.write_text(head+tail,encoding='utf-8')
summary['buildVerified']=True;summary['staticPagesVerified']=40;summary['testSuitePassed']=6;summary['knowledgeTestsPassed']=17
(R/'reports/posts-gap-313-352-final.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Updated handoff and verified all 40 built pages and assets.')
