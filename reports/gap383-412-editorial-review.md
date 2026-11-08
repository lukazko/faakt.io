# Redakční kontrola dávky 383–412

Zadání: 30 nových českých postů napříč kategoriemi, přednostně vyplnit mezery. Výchozí čistý checkout `feature/1.5-content-sport` obsahoval 946 článků, maximum 976 a přesně 30 volných ID 383–412. Existující články se nepřepisují.

## Originalita

Byl přečten celý kompaktní katalog 903 poznatků v dávkách offset 0, 200, 400, 600 a 800. Výchozí snapshot byl `b092f42ba5ddf6b185bceff1a7121fa08c64c74327dd6ad90d391a0f0595a963`. Srovnání vychází také z plných blízkých textů uvedených jednotlivě v plánu. Samostatná hledání všech 30 návrhů jsou zachována v `gap383-412-searches.json`. Výsledky slovního vyhledávání často obsahují tematicky vzdálené shody; nebyly pokládány za verdikt.

Po plném čtení byl námět o modré krvi chobotnic zamítnut: i když index 152 zdůrazňuje srdce, samotný článek již vysvětluje hemocyanin. Nahrazen anatomií narvalího klu. Pro konzervativní rozlišení byly nahrazeny také Aristotelovy návyky a Rocheova mez: konečná témata jsou rozdíl básnictví a historie a Lagrangeovy body. Post 395 vysvětluje metastabilitu podchlazené vody a atmosférické kapky, zatímco hlavní poznatek 911 je tání galia teplem dlaně; jeho vedlejší zmínka podchlazení byla přečtena a posouzena. Nové články nepřevyprávějí hlavní pointy ani mechanismy jiných nových článků.

U starého 838 byl zjištěn chybný index: skutečný text je o právu na odstranění odkazu z vyhledávače, nikoli o paměťovém efektu vyhledávání. Plný text a source_hash byly načteny pomocí review-batch. Opraven pouze index přes apply-review, nikoli původní článek. Jedinou změnu katalogu tvoří tento skutečně přečtený záznam. Aktuální snapshot po opravě: `82a7f117195b6b97913a6ce2fde39b99632c5907b5a7eaa65388b6cad698e3dd`. Plán používá tento snapshot.

## Zdroje a přesnost

Každý text má dva přímé odkazy. Ověřeny byly primární texty Aristotelovy Poetiky a Fyziky, autorská studie o Sutton Hoo, studie quorum sensing, studie Jensena a Millera, Kargerova studie a dokumentace PostgreSQL. Další podklady tvoří odborné instituce a muzea: NOAA, NASA, ESA, ASM, V&A, Met, Escher Museum, NPG, Haiku Foundation, vydavatelská ukázka Calvina, Rada Evropy a právní texty EUR-Lex, centrální banky, UBC a Psychological Science, ScreenSkills a Avid, matematické univerzitní materiály, Springfield College, basketbalová síň slávy, IOC a sportovní federace.

Průběžné neúspěšné adresy se nevydávají za přečtené: odmítnutý Smithsonian byl nahrazen dvěma stránkami NOAA; Harvard CID a NBER blokovaly přístup a studie byla otevřena v primárním PDF `research.hks.harvard.edu/publications/getFile.aspx?Id=482`. Vadný odkaz na Io a beta adresu ISU nahradily platné adresy. Buffonův druhý zdroj byl nahrazen univerzitním výkladem Harvey Mudd. US Open má v přímém výstupu nulový počet čitelných řádků, ale jeho indexovaný obsah potvrzuje rok 1970 a historickou odlišnost formátů; přesná současná pravidla byla otevřena v PDF ITF 2026. Stránka AER byla otevřena jako bibliografický záznam a abstrakt; nejde o tvrzení, že byl dostupný její placený plný text.

Ověřené významové hranice: Sutton Hoo neurčuje s jistotou jméno pohřbeného; narvalí kel není roh a pohlavní rozdíly mají výjimky; quorum sensing není vědomé počítání buněk; subsidiarita neplatí pro výlučné pravomoci stejně jako pro nevýlučné; Lagrangeovy body nejsou místa bez gravitace; Giffenův jev není Veblenova prestiž; výškový sport nemění procentuální zastoupení kyslíku; tie-break nemá pevný maximální počet bodů. Žádné vymyšlené citáty ani neověřené přesné starověké datace.

Všech 30 textů má délku 500–1200 znaků včetně HTML, první odstavec dvě až tři věty, jednu kategorii a oddělené knowledge. Články byly přečteny celé v autorském souboru a finálním návrhu, porovnány s plánovanou pointou a mezi sebou. Metadata volí jediný výtvarný aspekt a konkrétní vizuální znaky; nepředstavují hotové ilustrace. Dokončení obrazové a lokální kontroly se zaznamenává samostatně.

## Dokončení

Hlídání originality i validace návrhů prošly. Kvůli odmítnutému Windows os.replace byl nezměněný append spuštěn v kopii s přesně stejnými vstupy a schválením; před přenosem výsledku byly znovu porovnány otisky všech pěti vstupních souborů. Konečný dataset má 976 ověřených postů, 933 poznatků a souvislá ID 1–976. Obsah všech 946 původních článků je shodný s výchozím HEAD.

Vytvořeno 30 ilustrací a jedna věcná oprava 384. Před generováním upřesněny pouze ilustrace 405 (jehla nesmí být delší než rozestup čar) a 406 (jediné domino přes dvě kontrastní pole místo celé šachovnice). Finální obrazové prompty a metadata jsou v jednotlivých provenance souborech a manifestu; schválené texty ani pointy se tím nezměnily. Všech 30 obrázků je registrováno v kartách i galerii a prohlédnuto na obou aktuálních podkladech při mobilním rozměru. Přijata byla především věcná slučitelnost a čitelný motiv; drobná míra přidaného stínování nebo detailů není prohlášena za dokonalé splnění přísného plochého stylu.

Devět testů npm test prošlo na Node.js 22, úspěšný produkční build vytvořil všech 30 cest a obrazových souborů. Byl dokončen v izolované kopii, nikoli nad .svelte-kit původního dev serveru; první nesprávně umístěný příkaz byl ihned ukončen. Zůstávají známá upozornění Svelte na stávající markup a velikost galerie. Samostatná kontrola 30 mobilních karet ověřila titulek, hook, obrázek, otočení i zdrojové odkazy, základní pozadí a CardGlow; runtime chyby nula. Zkontrolován i desktopový první post. Seznam uživatelských regresí zůstává relevantní, neboť ovládání ani globální rozvržení nebyly změněny. Plná 81testová sada e2e nebyla pro tuto datovou dávku opakována.

Náhled deterministického repairu navrhl u nových ID pouze změnu 404 na portrét. Nebyla přijata, protože celý motiv představuje studiovou interakci herce s mikrofonem a sledovaným obrazem. Nebyly aplikovány ani návrhy ke starším článkům.

Výsledky a metriky: `gap383-412-final-validation.json`, `gap383-412-local-validation.json` a `gap383-412-image-validation.json`. Lokální náhled zůstává běžet na http://127.0.0.1:4196/faakt.io/post/383/. Veřejná publikace ani push nebyly součástí práce.
