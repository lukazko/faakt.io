# Redakční kontrola příspěvků 1042–1071

Zadání z 17. listopadu 2026: 30 nových kompletních příspěvků rovnoměrně napříč kategoriemi. Výsledek má přesně dva příspěvky v každé z 15 platných kategorií. Verze aplikace zůstává 1.5.2; veřejné nasazení není součástí práce.

## Originalita a zápis

Výchozí databáze měla 1041 ověřených záznamů a 998 poznatků. Celý kompaktní katalog byl přečten v pěti dávkách na offsetech 0, 200, 400, 600 a 800 (poslední 198 položek), se snapshotem `81321a1d35e39a23619d4f5bca3ac04d4a19aecbab6968f68a97e38aa58299b4`. Přečtena byla také reference známých duplicit. Lokální hledání všech námětů uchovává `batch-1042-1071-searches.json`.

Plán obsahuje pro každý text vlastní konkrétní pointu, existující řízené tagy, druh obsahu a konkrétní rozdíl proti blízkým plným textům. Byly přečteny plné texty ID 112, 145, 285, 378, 393, 398, 401, 404, 446, 457, 465, 466, 479, 592, 613, 616, 626, 639, 642, 669, 768, 791, 821, 845, 860, 890, 892, 901, 907, 914, 927, 931, 952, 977, 998, 1004, 1014, 1033, 1034 a 1036. Finální kontrola znovu porovnala hotové pointy, všechny texty v dávce a automaticky nabídnuté kandidáty; skóre není verdiktem.

Podstatná rozlišení: stříkoun řídí proud, zatímco strašík 791 vyvolává kavitaci; litografie tiskne chemickým rozlišením rovné plochy, zatímco 1014 z vyvýšených míst; rázy jsou interference blízkých akustických frekvencí, zatímco 998 posouvá rytmické vzorce; gyroskop vysvětluje změnu vektoru momentu hybnosti vnějším momentem, zatímco 616 mění moment setrvačnosti a 669 popisuje astronomické rozpoznání precese. Zinková anoda není pasivační vrstva 1004. Zákaz opakovaného řízení není presumpce neviny 393. Anamorfotická záznamová optika není divákova šikmá pozice před Holbeinovou anamorfózou 890. U V-stylu je ústřední konflikt délky letu s bodováním stylu, nikoli obecná teze o sportovní inovaci.

`check-plan` přijal 30 námětů; `check-drafts` nevrátil chyby. Finální hash návrhů je `acf7f186d959dd49f836e8f89724cfa4df46c673eb0e586bbc8d49f02a373f56`. Schválení a hlídaný `append` vytvořily 30 záznamů a samostatná významová přiřazení. Původních 1041 objektů článků i manifestu je přesně zachováno proti výchozímu commitu. Výsledný index má 1071 ověřených záznamů a 1028 poznatků bez problémů.

## Zdroje a věcné hranice

Každý finální text má dva konkrétní odkazy. Kontrola použila otevřené institucionální stránky, primární články a PDF; tam, kde vydavatel blokoval přímé stažení, také indexované pasáže téhož dokumentu. První automatický HTTP pokus v `batch-1042-1071-source-fetch.json` je diagnostika přístupu, nikoli tvrzení, že všechny odkazy odpověděly bez omezení. Některé weby vrátily 403/429 nebo jen prázdnou klientskou stránku. Odkazy na prázdný archiv Halifaxu, nedostupný list SHSU, nepřístupný výklad koroze a nefunkční doménu švédského muzea byly nahrazeny níže uvedenými finálními zdroji; původní diagnostika zachovává tyto zamítnuté pokusy. Úplné stažené pracovní texty nejsou publikovaným obsahem.

| ID | Ověřený podklad a hranice tvrzení |
|---|---|
| 1042 | National Army Museum: místní neoficiální příměří, nikoli mír celé fronty; fotbal není univerzální rekonstrukce. |
| 1043 | Nova Scotia Museum a Parks Canada: srážka, požár muničního nákladu a téměř dva tisíce obětí; nevynucujeme přesný počet ani superlativ velikosti exploze. |
| 1044 | Stanford Encyclopedia a IEP: conatus jako snaha setrvat v bytí a základ touhy či emocí; jde o filozofickou teorii. |
| 1045 | Stanford Encyclopedia a IEP: praktický argument očekávaného užitku, nikoli důkaz Boha; zahrnuta námitka více náboženských možností. |
| 1046 | Gerl/Schuster a studie adaptivních podvodních proudů: řízení dynamiky výstřiku; žádné tvrzení o výpočtu rovnic rybou nebo dokonalé úspěšnosti. |
| 1047 | Oxford University Museum a RSPB: hnízdní parazitismus a vypuzování hostitelské snůšky; bez lidského morálního úmyslu. |
| 1048 | Met a MoMA: planografický tisk, mastná kresba a vodní film; nevydáváme desku za vyřezávanou matrici. |
| 1049 | SFMOMA a National Gallery: pohyblivé vyvážené části a proudění vzduchu; obrázek není kopií určitého Calderova díla. |
| 1050 | Sofoklův text v Harvard CHS a EBSCO Research Starters: rozdíl vědění publika a postavy. |
| 1051 | Keatsův text a odborný rozbor Poetry Foundation: nedokončený polibek a zastavený čas; závěr o ceně trvání je literární interpretace, nikoli historický fakt o konkrétní urně. |
| 1052 | Zpráva World Bank a podklady PADECO: Porto Alegre 1989, investiční priority a omezení skutečné účasti; žádný příslib automaticky lepších výsledků. |
| 1053 | Aktuální průvodce kanceláře ESLP a článek 4 Protokolu 7: konečnost, totožnost skutku, tentýž stát a vymezená obnova; zahrnuty hranice souběhu. |
| 1054 | OpenStax: interference a rozdílová četnost; příklad 440/442 Hz je vlastní přímé dosazení, nikoli samostatný slyšitelný tón 2 Hz. |
| 1055 | OpenStax a univerzitní mechanika UT Austin: moment síly mění směr momentu hybnosti; podmínkou zjednodušeného popisu je rychlá rotace. |
| 1056 | ACS a studie antokyanů: barva závisí na pH; z výluhu nelze bez kalibrace odvozovat přesné pH. |
| 1057 | OpenStax a Penn State: elektricky propojená obětovaná anoda v elektrolytu; nutná údržba a spotřeba zinku. |
| 1058 | NASA a výzkum University of Wisconsin: přibližně 98°, 84 let a tepelné zpoždění atmosféry; nejde o pouhou vzdálenost od Slunce. |
| 1059 | NASA/Hubble: pozorování prosinec 2023 až březen 2024 a oscilace tvaru; mechanismus devadesátidenního cyklu není vydáván za uzavřený. |
| 1060 | Univerzitní materiál MENDELU a primární studie výrobního zpoždění: model závisí na očekávání a sklonech křivek; cykly nejsou univerzální předpověď. |
| 1061 | IMF a World Bank: reálný kurz, přesun zdrojů a konkurenceschopnost; suroviny nejsou nevyhnutelná škoda. |
| 1062 | Johansson a kol., Science 2005: část záměn zůstala nepovšimnuta a byla zdůvodněna; žádná univerzální popření stabilních preferencí. |
| 1063 | Ross/Greene/House a meta-analýza 115 testů: odhady četnosti vlastní volby relativně vůči jinak volícím; bez záměny s konformitou. |
| 1064 | Dvě technické příručky ARRI: směrové stlačení a odpovídající de-squeeze, různé faktory; generický objektiv není technický řez optikou. |
| 1065 | Avid a Pearson Video Production 101: oddělené hranice obrazové a zvukové stopy; J a L ve správném časovém směru. |
| 1066 | MathWorld a NYU: jednoduchý mřížový mnohoúhelník bez děr; čtverec má 1 vnitřní a 8 hraničních bodů. |
| 1067 | MathWorld: maximum kruhových oblastí při přímých řezech; díly se nepřesouvají a nemusejí být stejně velké. |
| 1068 | RFC 1035 a 8767: TTL, různé zbývající časy cache a výjimka serve-stale; žádná záruka souběžné aktualizace všech uživatelů. |
| 1069 | TI a Arduino: zákmit kontaktů a časové filtrování; univerzální konstantu čekání nepředepisujeme. |
| 1070 | FIBA a primární analýza střeleckých dat: sezona 1979–80; 40 % trojek a 60 % dvojek je ilustrační výpočet, nikoli doporučení všech herních situací. |
| 1071 | Rozhovorový dokument Sveriges Radio a historická studie s rozhovory: konflikt V-stylu s rozhodčími a celkový pohár 1988–89; kresba není portrétem Boklöva. |

## Ilustrace, karty a kontroly

30 samostatných generování a jedna cílená historická úprava 1042, vždy se skutečnou alfou. Ilustrace mají 640×360 px, celkem 583554 B. Přesné prompty a zdrojové cesty jsou v `batch-1042-1071-images.json`; manifest má odpovídající SHA-256. Generátor neumožnil nastavit rozměr, kvalitu nebo cenu; konverze neomezuje již spotřebované generování.

Prohlédnuty všechny motivy při 160×90 a 320×180 na základním gradientu a přesném aktuálním CardGlow, všech 30 skutečných karet na obou pozadích, nízký viewport a desktop. Šest přehledů skutečných karet je v adresáři `batch-1042-1071-review`. Automaticky prošly všechny nové líce, otočení, úplné rubové texty a shoda zdrojových URL bez runtime chyb. Ověření přítomnosti odkazů v browseru není vydáváno za úspěšné síťové načtení každého externího webu.

Prošlo 13 datových a obrazových testů na Node.js 22.23.4. Náhled deterministického repairu nemění data; tři návrhy nových ID byly významově posouzeny a ponechány. Výsledek produkčního buildu, konečná URL a zachování původních dat jsou uvedeny v `batch-1042-1071-final-validation.json`.
