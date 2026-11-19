# Verze 1.5.2 — příspěvky 1007–1041

Zadání: 35 nových příspěvků, rovnoměrné zastoupení všech aktuálních kategorií, skutečné ilustrace a lokální test. Pět kategorií má po třech novinkách (Chemie, Vesmír, Matematika, Technologie, Sport), deset ostatních po dvou. Nová dávka má 35 samostatných poznatků. Explicitní požadavek rovnoměrného rozdělení má přednost před orientačním zastoupením starověkých myslitelů.

## Originalita

Před výběrem byl přečten celý katalog 963 unikátních poznatků ve stránkách s offsety 0, 100, 300, 500, 700 a 850. Výchozí stav: 1006 záznamů, všechny ověřené, žádný problém; snapshot `f0c60951330b0a5f53dd52bee54030fa198d9545f7464c9fa1ad86843f488478`. Přečteny také známé duplicity a plné texty srovnání uvedených v plánu. První výpis katalogu selhal na kódování konzole; byl znovu načten s PYTHONUTF8, nebyl vydáván za úplné čtení.

`v152-search.json` obsahuje lokální hledání všech 35 námětů; lexikální pořadí vracelo i nesouvisející výsledky, proto porovnání nevychází jen z pořadí skóre. `v152-plan.json` zachycuje konkrétní odlišnost každého poznatku proti blízkým přečteným článkům a prošel check-plan. `v152-draft-check.json` prověřuje hotové texty; automatická podobnost nebyla použita jako sémantický verdikt. Finální rozhodnutí a přesné otisky obsahuje `v152-approval.json`. Zápis do článků a registrů provádí hlídaný append, nikoli vlastní připojení objektů.

Vyřazená témata: modrá krev chobotnic je již výslovně vysvětlena v celém textu 152; indukční ohřev již zmiňuje text 297; technika mokré fresky je součástí 159. Tyto náměty nebyly připojeny pod novými ID.

Zvlášť posouzené hranice:

- 1015/908: přivlastňující komentář k básni a jeho místo v konstrukci románu je jiný poznatek než selektivní zamlčení detektivního vypravěče.
- 1023/1006: kapacitně omezená adsorpce na aktivním uhlí oproti přístupnosti pravidelných pórů molekulového síta. Text nepřisuzuje uhlí univerzální účinnost.
- 1026/295: směrové působení marťanského prachu, nikoli další příklad pozemského molekulárního rozptylu.
- 1029/401/918: nečekaný objekt v nepřerušené scéně oproti porovnávání změněných scén a omezení při časově blízkých cílech.
- 1030/242/945: ztráta atribuce zachovaného obsahu, nikoli sugesce nových událostí nebo výhoda samostatně generované odpovědi.
- 1039/947: časová osa měřicího záznamu cílové čáry oproti vytváření fiktivního prostoru řízeným pohybem v expozici.
- 1012/1020: fyziologická závislost vydry na udržované srsti a její zranitelnost při znečištění oproti konstrukci vakuové nádoby s odlišnými cestami přenosu tepla.

## Zdroje a jazyk

Zdroje byly otevírány přes webový nástroj. Upřednostněny instituce, muzea, vydavatelé, odborné publikace a dokumentace výrobců. U nedostupných PMC stránek byl pro ptakopyska zvolen přístupný materiál University of Western Australia; předběžný neexistující odkaz na Lucasfilm byl nahrazen ověřeným článkem StarWars.com. U abstraktů PubMed, jejichž přímé zobrazení vracelo prázdnou stránku, byl ověřen indexovaný abstrakt nebo dostupný plný text práce. Výsledné články mají po dvou přímých zdrojových odkazech. Přehled tvrzení a použitých zdrojů je v `v152-source-review.json`.

Každý text má 500–1200 znaků HTML a první odstavec dvě nebo tři dokončené věty. Žádné smyšlené citáty. Literární závěry jsou interpretací popsané konstrukce díla; neprezentují se jako experimentální přírodní zákony. Historické přijetí pravidla se odlišuje od prvního použití (rozstřely), přístroj od přímého ukazatele polohy (H4), hypotetický příklad od experimentu (osel), časový součet pohledů od okamžitého zobrazení (librace) a ideální model od reálné dráhy (brachistochrona).

## Ilustrace a dokončení

Pro každé nové ID je autorizován jeden nový obrázek. Sdílený STYLE z projektového ilustračního skillu byl odeslán beze změny s metadaty konkrétního hotového textu. Použit vestavěný image_gen s transparent_background=true; nástroj neposkytuje řízení velikosti, kvality ani ceny. Přesné prompty a původní cesty jsou v `v152-image-<ID>.json`. Konverze fit-image.py zachovává všechny viditelné části, alfu a centrování.

Stav vizuální přejímky, registrace, buildu, lokální URL a kontrol je veden v navazujících validačních reportech a aktuální části `docs/ilustrace-handoff.md`. Tento redakční záznam sám nepotvrzuje dosud neprovedené vizuální ani běhové kontroly.
