# Ilustrace — aktuální stav

Produkční karty používají statické AI ilustrace ve formátu WebP. Procedurální SVG renderer, jeho galerie, audit, baseline a testy byly odstraněny.

## Rozsah

- Dostupné ilustrace: `001`–`214` a `558` (215 souborů, včetně sdílených kopií).
- `043` je uložený pro kontrolu v galerii, ale není zapnutý v produkčních kartách: při 160×90 px má příliš mnoho jemných architektonických detailů.
- Assety: `static/illustrations-ai/<id>.webp`.
- Rozměr: 640×360 px, poměr 16:9, WebP quality 80.
- Velikost souborů: pod 100 kB; typicky 5–35 kB.
- Příspěvky bez statického assetu zatím nezobrazují ilustraci.

## Vykreslení

Ilustrace na líci karty má vlastní relativně umístěnou flexovou plochu s nulovou výchozí výškou a `min-height: 0`. Obrázek je absolutně ukotvený uvnitř této plochy; `object-fit: contain` a `object-position: center bottom` zachovávají celý obraz i poměr stran. Výšku plochy určuje místo zbývající pod titulkem a hookem nad CTA, takže se obrázek zmenšuje bez překrytí textu či ořezu. Ani nízký viewport ilustraci plošně neskrývá; při vyčerpání dostupného místa se její plocha zmenší na nulu.

Kategorie Literatura používá výraznou citronově žlutou barvu `#e6dc58` (`--cat-literatura` v `src/app.css`), která ji odlišuje od oranžových akcentů loga a ovládacích prvků.

`src/lib/components/PostIllustration.svelte` vykresluje dekorativní `<img>` pouze pro ID s vytvořeným assetem. Cesta respektuje SvelteKit base path `/faakt.io`. Obrázky mají prázdný alt text, pevný poměr stran a `object-fit: contain`.

Vývojová galerie je na `/faakt.io/dev/illustrations-ai/` a zobrazuje všech 215 obrázků ve stylu karet; počet v nadpisu přebírá z manifestu. Obrázky nemají vlastní CSS pozadí; alfa kanál odkrývá gradient karty. Poznámky k významu a odchylkám jsou v `review` každého nového záznamu manifestu.

## Dávka 185–214

Všech 30 ilustrací vytvořil vestavěný image_gen s `transparent_background=true`, samostatným požadavkem pro každý post. `198` používá cílenou náhradu s předáváním zboží mezi prostředníky. `188`, `200` a `212` používají první vygenerované verze výslovně vybrané uživatelem: aktivní děj dilematu u kolejí, prodavače novin vedle tlumeného válečného zpravodajství a kvantová měření propojená symbolickými křivkami. Byly obnoveny z uložených originálů, bez nového generování. Celková spotřeba původní dávky zůstává 34 generovacích volání; nástroj nenabízí řízení vstupního rozměru, kvality ani ceny.

Finální soubory jsou RGBA WebP 640×360, quality 80, s průhledným odsazením a nulovou alfou ve všech rozích. Velikosti jsou 17 988–47 678 B, celkem 952 616 B. Všech 30 ID je zapnuto v kartách i dostupné v galerii. `posts.json` se nemění. Manifest uchovává skutečně odeslané prompty aktivních verzí, SHA-256 promptů, metadat a obrázků a jednotlivé kontroly významu. U obnovených verzí eviduje také původní zdroj, volbu uživatele a hashe nahrazených verzí. Nové barevné kombinace vycházejí z metadat; některé obrázky překračují cílové tři barvy nebo počet ploch.

Miniatury byly prohlédnuty při 160×90 a 320×180 na tmavém povrchu karty, včetně tří obnovených originálů. Hlavní motivy jsou čitelné, bez obdélníkového pozadí. `188` zachovává výrazné jednání u výhybky a na mostě; stylizované skupiny vyjadřují mnoho proti jednomu, přesnou premisu pěti proti jednomu dodává text. `190` používá klíč a klávesu jako analogii významu podle kontextu. `192` má jemnější soukolí, `194` členitější architekturu a `199` tři fáze úpadku; jde o zaznamenané odchylky od jednoduchosti. `200` nechává španělský kontext textu a zachovává lidský děj otevřeného zpravodajství; symbol viru je retrospektivní. `202` spojuje záměrně zvětšený detail zdi s orbitálním pohledem, netvrdí viditelnost pouhým okem. `208` doprovází úbytek izotopu bez kvantitativního měřítka. `210` je rekonstrukce hominina, nikoli přesný soupis dochovaných kostí Lucy. `211` je zjednodušené schéma interference, nikoli měřené dráhy částic; křivky v `212` symbolizují sdílený stav a šipky párové výsledky měření, nejsou drahou nadsvětelného signálu ani důkazem Bellových nerovností. `214` zobrazuje detektor a srážku, nikoli přímo mechanismus hmotnosti. Další omezení jsou u jednotlivých záznamů manifestu.

Deterministický repair proběhl pouze v náhledu; obecné přepisy nebyly aplikovány. Ověření zahrnuje rozměry, alfa kanál, velikosti a SHA-256 všech 30 souborů, `npm test` a `npm run build`. Procedurální renderer ani zlaté otisky se nepoužívají.

## Dávka 160–184

Dalších 25 chybějících ilustrací vytvořil vestavěný image_gen, vždy jedním požadavkem s `transparent_background=true`. Nástroj nenabízí nastavení vstupních rozměrů, kvality ani ceny. Výstupy jsou statické RGBA WebP 640×360, quality 80, s průhledným odsazením a nulovou alfou ve všech rozích; velikosti 6 026–45 684 B. Všech 25 ID je zapnutých v produkčních kartách. Přesné odeslané prompty, hashe metadat, promptů a obrázků i jednotlivé významové kontroly jsou v manifestu. Existující ilustrace se nepřegenerovaly.

Kontrola vycházela z celých textů příspěvků. U abstraktních argumentů portrét nebo konkrétní metafora doprovází učení a nevydává se za jeho důkaz: například `175` používá rostlinu závislou na půdě a vodě, `183` prořezávání nadbytečné větve a `184` Humeův portrét. `163`, `164` a `181` zobrazují historické představy, nikoli platnou fyziku. `162` používá potřebné matematické údaje u jednotkového čtverce a úhlopříčky; nejde o důkaz iracionality. `177` má ilustrační značky částic, nikoli autentický přepis rukopisu.

Miniatury byly prohlédnuty na tmavém povrchu při 160×90 a 320×180 px. Hlavní motivy jsou čitelné a bez obdélníkového pozadí. Některé scény překračují cílových 5–8 ploch a tři barvy; zejména `160` má členitější terén, portréty používají více obrysových detailů. `178` doprovází skeptické vážení argumentů, ale tvary kamenů nejsou přesnou mírou jejich síly. Tyto odchylky jsou zaznamenané bez kosmetického opakování generování. Deterministický repair proběhl pouze v náhledu; jeho obecné přepisy nebyly aplikovány. Obsah ani metadata `posts.json` se nemění. Ověření: `npm test`, `npm run build` a kontrola rozměrů, alfa kanálu, velikostí a SHA-256 všech 25 souborů.

## Generování

Kontrola posuzuje ilustraci spolu s titulkem a textem. Překreslení řeší doložený viditelný rozpor nebo skutečnou nečitelnost; samotná možnost doslovně vyložit symbol nestačí. Nejistý počet překrývajících se postav se ověřuje ve větším náhledu a jeho význam pro hlavní kontrast se posuzuje před opravou. Spojnice, šipky a dvojice scén mohou vztah zpřehlednit. Názvy zemí ani popisky se nepřidávají jen proto, že je kontext v článku. Při oprávněné opravě se zachovává originál a obě verze se porovnají při stejné velikosti; náhrada má odstranit konkrétní problém a současně zachovat výraz, děj i čitelnost. První verze `188`, `200` a `212` jsou výslovně zvolené kompozice. Tato kritéria jsou ve skillu i sdíleném promptu; neoslabují kontrolu jasného obrácení účinku nebo nesprávného hlavního předmětu.

Doprovodné symboly a vedlejší objekty jsou vítané, pokud mají smysluplný vztah k obsahu příspěvku a kompozice zůstává snadno pochopitelná. Mohou vyjadřovat abstraktní myšlenku a nemusí být doslova zmíněné v textu ani nezbytné pro hlavní motiv. Odstraňují se jen tehdy, když nemají význam pro obsah nebo kompozici příliš komplikují. Toto pravidlo platí i pro portréty a má přednost před staršími formulacemi požadujícími jen nezbytné objekty; konkrétní schválené scény zůstávají zachované. Odpovídá mu skill i sdílený generovací prompt.

Nikdy se nenakreslí objekt a pod něj jeho název jako náhrada obsahu. Obrázek musí nést význam vztahem, dějem, kontextem nebo odhaleným detailem bez čtení popisku. Samostatná pojmenovaná částice ani schéma s ciferníky a rovností tuto podmínku nesplňují. Text jako USA na bedně je jiný případ: přidává původ pomoci, nepojmenovává nakreslenou bednu. Vědecká ilustrace nemusí diagramem shrnovat výsledek experimentu; může názorně zobrazit i historickou představu, kterou článek zkoumá a odmítá. Hypotéza se tím neprohlašuje za skutečnost.

Výchozím cílem je jednoduchá ilustrace s jedním výrazným hlavním motivem, který vystihuje obsah a zaujme na první pohled. Obrázek `040` (pracovníci, státní výdaje, stavba) je krajní případ přijatelné složitosti, nikoli vzor pro další ilustrace; běžné výstupy mají být výrazně jednodušší. Vedlejší prvky podporují hlavní motiv a nemají vyžadovat postupné čtení několika scén. Soubor `040.webp` zůstává beze změny.

Sdílený postup pro AI agenty je v `skills/faakt-illustrations/SKILL.md`. Kompaktní prompt a cache kontrolu připravuje `skills/faakt-illustrations/scripts/prepare.mjs`; společný styl je v `prompt.mjs`. Existující asset se bez žádosti o opravu neregeneruje. U výslovné opravy se vytvoří jedna cílená náhrada či úprava; pokud stále významově selhává, je přípustná jedna další zjednodušující úprava. Nevytvářejí se kosmetické varianty ani neomezené smyčky.

Ilustrace vycházejí z `post.illustration`: `concept`, `primary_subject`, `secondary_subjects`, `visual_keywords`, `composition_hints`, `scene_type`, `mood` a `palette`, vždy po přečtení titulku a celého obsahu daného postu. Vysvětlující scéna musí mít čitelný vztah nesoucí hlavní myšlenku. U abstraktního učení je přípustný i doprovodný portrét skutečného učitele, pokud by diagram vyžadoval vymyšlené rekvizity; portrét se nevydává za úplné vysvětlení argumentu. Každý vedlejší předmět se ověřuje proti textu, nejen proti metadatům. Vizuální cíl je 5–8 velkých ploch, nejvýše tři barvy popředí, průhledné pozadí a čitelnost při 160×90 px.

Post `028` používá samotného Buddhu v klidné meditaci s vlastníma prázdnýma rukama přirozeně v klíně. Metadata mají `portrait`, hlavní motiv `buddha_meditating_figure` a prázdné `secondary_subjects`. Neobsahují samostatné ruce, zlatou kuličku ani neurčitý „předmět touhy“. Ilustrace doprovází učení o utrpení a nelpění; nevytváří jeho doslovný diagram. Soubor má 17 584 B, 640×360 px a průhledné rohy; kontrola proběhla při 160×90 a 320×180 px. Přesný prompt, hashe a výsledek kontroly jsou v manifestu. Oba skilly a společný prompt požadují oporu vedlejších objektů v celém textu a odmítají nepodložené symbolické vsuvky.

Post `033` zobrazuje Michelangela vestoje na jednoduchém lešení, se zakloněnou hlavou a štětcem u krátkého pásu stropu. Tento jediný motiv zdůrazňuje fyzickou námahu práce nad hlavou. Metadata používají `interaction` a pohled zblízka místo panoramatu kaple; celá freska ani další postavy nejsou potřeba. Asset má 17 616 B, 640×360 px a alfa kanál s průhlednými rohy; byl zkontrolován při 160×90 a 320×180 px. Přesný prompt, hashe a metoda generování jsou v manifestu.

Post `018` má detail proudu obtékajícího jediný pevný kámen a spojujícího se za ním: přizpůsobení umožňuje pokračovat bez násilného tlaku (wu wei). Metadata používají `interaction` a detailní pohled místo široké krajiny. Ilustrace neobsahuje město ani panoramatické dekorace. Přesný prompt, hashe, metoda a výsledek kontroly jsou u záznamu `018` v manifestu. Generátor nepodporoval nastavení ceny, rozměru ani kvality; finální asset je zmenšený WebP 640×360 s alfa kanálem. Barevně používá modrý proud a hnědý kámen místo striktně teplé monochromatické palety metadat, aby odlišil oba prvky.

Nové ilustrace mají přednostně skutečně průhledné pozadí, aby navazovaly na gradient karty `#141414 → #0d0d0d` bez viditelného obdélníku. Pokud generátor neumí alfa kanál, neprůhledný fallback musí převzít přesnou barvu z aktuálního CSS; pro spodní část dnešní karty je to `#0d0d0d`. Konverze musí zachovat RGBA a průhledné okraje.

Černý, téměř černý nebo tmavý gradient uvnitř samotného assetu je zakázaný. Neprůhledný fallback smí být pouze jedna přesná plná barva se shodnými pixely na všech prázdných hranách a v rozích; jinak se asset odmítne a regeneruje průhledně.

Vadný existující asset lze po výslovném požadavku připravit znovu pomocí `prepare.mjs --ids '<id>' --force`. Přepínač se používá jen pro konkrétní vizuálně zkontrolovaná ID, ne pro nezkontrolované dávky.

`scripts/illustrations-ai.mjs` obnoví manifest galerie pro prvních 100 příspěvků a zachovává existující provenienci i další záznamy. Manifest eviduje metadata, cestu, hash promptu a stav cache; neprovádí AI volání.

Dávka `026`–`045` používá vestavěný image_gen, jeden samostatný požadavek na post s výslovně zapnutou průhledností. Nástroj nenabízí řízení rozměru, kvality ani ceny generování. Přesné prompty a hashe připravuje sdílený helper; kontrola významu vychází z celých textů. Deterministický repair byl spuštěn pouze v náhledu; starší pravidla navrhovala návrat od konkrétních vztahů k obecným předmětům, proto nebyla aplikována.

Všech 20 výstupů pro příspěvky 026–045 má 640×360 px, skutečný alfa kanál a nulovou alfu ve čtyřech rozích; velikosti jsou 17–52 kB. Vizuálně byly zkontrolovány na povrchu karty při 160×90 a 320×180 px. `043` nesplnil střídmost zadání a je označen k opravě, bez automatického opakování. U `027`, `037` a `042` je část argumentu či mechanismu pouze naznačená; `036`, `038` a `040` překračují cílový počet ploch. Nápisy na `029` jsou ilustrativní značky, nikoli ověřený přepis desky.

## Ověření

Kontrola pozadí prvních 25 ilustrací (`001`–`025`): všech 25 má skutečný alfa kanál a průhledné rohy. U `005`, `007`, `013`, `020`, `021`, `022` a `023` bylo neprůhledné pozadí odstraněno vestavěným image_gen jako cílená úprava původního obrázku. Původní scény, předměty a nápisy zůstávají zachované; nejde o nové obsahové ilustrace. Výstupy mají průhledné odsazení po všech hranách, RGBA WebP 640×360, quality 80, velikost 13–39 kB. Kontrola při 160×90 a 320×180 px na gradientu karty potvrdila odstranění obdélníkového pozadí. Zbývajících 18 souborů se nemění. Přesné editační prompty, původní a výsledné SHA-256 i metoda jsou v `backgroundEdit` příslušných záznamů manifestu. Nástroj nenabízel řízení rozměru, kvality ani ceny generování. Tato kontrola pozadí není novým sémantickým auditem článků.

- `npm test` kontroluje existenci prvních 100 WebP a limit 100 kB; u všech přijatých záznamů manifestu navíc ověřuje skutečné zapnutí ID v kartách, shodu cesty a existenci souboru pod 100 kB.
- `npm run build` ověřuje produkční SvelteKit sestavení.
- Vizuální kontrola: hlavní feed a `/faakt.io/dev/illustrations-ai/` na mobilní šířce.

Post `044` pou??v? jednoduch? detail ob?? exoplanety t?sn? u hv?zdy podobn? Slunci. Metadata ani prompt neobsahuj? m??en? radi?ln? rychlosti, pohyb hv?zdy, ob??n? dr?hy ani ?ipky; m??ic? mechanismus nen? obsahem p??sp?vku. Skill a spole?n? prompt vy?aduj? okam?it? porozum?n? bez lu?t?n? zna?ek, spojnic nebo krok?. Diagram je v?jimkou pouze pro vztah v?slovn? pot?ebn? v textu. Deterministick? repair prob?hl v n?hledu; jeho obecn? p?episy nebyly aplikov?ny.

Nov? `044.webp` m? 22 308 B, 640?360 px a pr?hledn? rohy. Kontrola p?i 160?90 a 320?180 px potvrdila ?itelnou dvojici t?les bez ?ipek; p?sy planety a skvrny hv?zdy p?ekra?uj? c?l velk?ch ploch, sc?na v?ak nevy?aduje lu?t?n?. P?esn? prompt, hashe a omezen? jsou v manifestu.


## Dávka 046–100

Posty 046–100 mají průhledné ilustrace vytvořené vestavěným image_gen nebo převzaté ze stejného tématu. Manifest ukládá prompty, hashe a stav kontroly; záznamy `needs-review` stále čekají na úplný sémantický audit. Miniatury byly prohlédnuty při 160×90 a 320×180 px. Ilustrace `090` je odmítnutá a není zapnutá v kartách. `068` používá schválený portrét z `028`; `081` používá novou scénu z `001` bez šipek. Obě jsou zapnuté v kartách. Post 046 má opravená ilustrační metadata podle obsahu. U postu 073 byla scéna zjednodušena na Michelangela při malbě nefigurální části stropu, protože původní prompt zobrazující fresku narazil na bezpečnostní filtr.

## Ilustrace duplicitních témat

Kontrola pokrývá 67 příspěvků ve 28 skupinách uvedených v `skills/faakt-create-posts/references/duplicity.md`. Všech 67 má WebP 640×360, skutečný alfa kanál, čtyři průhledné rohy a soubor pod 100 kB. Nahrazeno je 16 obrázků s neprůhledným pozadím, dvě dříve odmítnuté ilustrace a tematická scéna 082 podle výslovné volby uživatele; doplněno je 10 chybějících souborů. Oproti stavu před opravou duplicit jde o 29 assetů: tři nové výstupy image_gen a 26 přesných kopií. `posts.json` ani jeho metadata se nemění.

Nová `001` (také `081`) ukazuje zákazníky se zavřenými peněženkami vedle zavíraného stánku: omezení nákupů ubírá obchodníkovi příjem. Jedna scéna bez šipek; počet detailů přesahuje orientační cíl ploch, děj je však při 160×90 a 320×180 čitelný. Nová `126` (také `558`) používá nezbytné jednoduché porovnání dvou galaxií a krátkých/delších světelných vln. Velikost a poloha galaxií nejsou kalibrovaným měřítkem vzdálenosti. Oba výstupy mají průhledné odsazení po všech hranách; při konverzi se zachovává RGBA. Nástroj nenabízel řízení ceny, kvality ani vstupních rozměrů.

| Zdrojová ilustrace | Příspěvky přebírající stejný soubor |
|---|---|
| 001 (nová) | 081 |
| 051 | 002, 106 |
| 063 | 004 |
| 046 | 006 |
| 050 | 008, 105 |
| 009 (nová) | 082 |
| 052 | 010 |
| 094 | 011 |
| 095 | 012 |
| 054 | 014 |
| 045 | 015, 025 |
| 056 | 016 |
| 057 | 017 |
| 080 | 019 |
| 074 | 024 |
| 028 | 068, 102 |
| 029 | 104 |
| 036 | 108 |
| 038 | 110 |
| 039 | 111 |
| 047 | 107 |
| 126 (nová) | 558 |

`009` a `082` používají na výslovné přání uživatele novou variantu původní ilustrace kolíčkového experimentu 009. Má dvě postavy u desky s kolíčky: účastník s malou odměnou hodnotí práci nadšeněji, účastník s větší odměnou působí znuděně. Tento směr účinku je podstatou výsledku; ilustrace jej nesmí obrátit. Nová verze má 25 270 B, průhledné okraje, 640×360 px a byla prohlédnuta při 160×90 a 320×180 na gradientu karty. Jemné stínování přesahuje přísně plochý stylový cíl. U 082 jde o uživatelem zvolený doprovod společného principu, nikoli o zobrazení příběhu sekty z jeho textu.

Obsahová duplicita automaticky neznamená vizuální zaměnitelnost. Při opravě pozadí má přednost konkrétní scéna nejlépe odpovídající textu; odlišný příběh se stejným principem není automaticky náhradou. Toto pravidlo včetně srovnání původní a navržené scény je v ilustračním skillu. Manifest u kopií eviduje `reusedFrom`, `sourceImageSha256`, výsledný `imageSha256`, původní prompt a jeho zdrojový `metadataHash`, důvod nahrazení a hash předchozího souboru, pokud existoval. `009` navíc eviduje revizi a hash původního obrazového podkladu. Pole `illustration` nadále patří cílovému postu. Stav `accepted-user-selected-topic-accompaniment` u 082 výslovně rozlišuje zvolený tematický doprovod od přesné shody scény; starší `accepted-background-reuse` nepotvrzuje úplný sémantický audit.

Ověření této změny zahrnuje dekódování všech 67 WebP, rozměry, alfu, průhledné rohy, limit velikosti, shodu kopií se zdrojem, manifest a zapnutí cílových ID v komponentě. Dále platí `npm test` a `npm run build`.

## P??sp?vek 090

Ilustraci tvo?? samostatn? idealizovan? portr?t Epikt?ta s klidn?m v?razem a rukou u brady. Doprov?z? u?en? o vlastn?ch ?sudc?ch a reakc?ch; nezobrazuje diagram kontroly. Metadata jsou upravena na portr?t bez kruh?, minc?, koruny, bou?e a dal??ch symbol? p?vodn?ho odm?tnut?ho obr?zku. Text p??sp?vku se nem?n?.

Vestav?n? image_gen vytvo?il jeden nov? pr?hledn? v?stup. Fin?ln? RGBA WebP m? 640?360 px, 20 828 B a pr?hledn? odsazen? na v?ech hran?ch. P?i 160?90 a 320?180 px na tmav?m povrchu je portr?t ?iteln? bez obd?ln?kov?ho pozad?. Vlasy, z?hyby a t?nov?n? p?ekra?uj? p??sn? c?l n?kolika ploch. P?esn? prompt, hashe a kontrola jsou v manifestu. N?stroj nenab?zel nastaven? rozm?r?, kvality ani ceny generov?n?. ID 090 je povoleno v PostIllustration.svelte.

Deterministick? repair prob?hl pouze v n?hledu; obecn? p?episy nebyly aplikov?ny. Ov??en?: `npm test`, `npm run build` a `git diff --check`.

## Dalších 25 chybějících ilustrací

V pořadí databáze jsou doplněny `101`, `103`, `109`, `112`–`125` a `127`–`134`; existující assety byly přeskočeny. Generování používá vestavěný image_gen s výslovnou průhledností, u cílených oprav také referenční úpravy. Nástroj nenabízí nastavení rozměru, kvality ani ceny generování. Finální WebP mají 640 × 360 px, quality 80, skutečný alfa kanál, průhledné odsazení a velikost pod 100 kB. Přesné prompty včetně upřesnění kompozice, jejich SHA-256, hashe metadat a výsledných souborů jsou v manifestu. Texty příspěvků zůstávají zachované; metadata 114, 118, 123 a 125 odpovídají níže uvedeným motivům. Deterministický repair proběhl v náhledu, bez aplikace obecných přepisů.

Kontrola proběhla při 160 × 90 a 320 × 180 px. Všech 25 ilustrací této dávky je zapnuto v kartách. `118` má na bedně čitelné USA a stav `accepted`; stará poznámka o odmítnutí už neplatí.

Doprovodné symboly zůstávají, pokud pomáhají obsahu a neznepřehledňují kompozici: například přesýpací hodiny u `103`, medaile u `113` nebo zeměkoule na monitoru u `117`. Nejde o doslovné historické rekonstrukce těchto symbolů. Portrét může doprovázet abstraktní učení, ale nepochopitelný přístroj nelze přijmout jen s poznámkou, že doprovází objev. Vědecká ilustrace ukazuje smysluplný vztah, vnitřní strukturu nebo zkoumanou představu bez nutnosti luštit schéma. Konkrétní omezení uvádí `review.meaning`. Ověření: `npm test`, `npm run build` a kontrola rozměrů, alfa kanálů, limitu velikosti, hashů i registrace přijatých ID.

## Motivy 114, 118, 123 a 125

| ID | Čitelný hlavní motiv | Barvy | Velikost |
|---|---|---|---|
| 114 | Lupa odhalující atom se třemi viditelnými elektrony kolem malého středu; obrazový vztah celku a menších částic bez popisku. | modrá, zlatá | 21 412 B |
| 118 | Vykládání americké pomoci s velkým USA na bedně u obnovované továrny; původní scéna zachována referenční úpravou. | fialová, korálová, krémová | 33 016 B |
| 123 | Povstalci se vztyčenými píkami před masivem kulatých věží Bastily, francouzský kontext vyznačený trikolorní stuhou pod scénou. | modrá, krémová, červená | 36 568 B |
| 125 | Světelná vlna prochází průsvitnou modrou mlhou představovaného éteru; jedna scéna bez přístrojů, schémat a popisků. | modrá, zlatá | 31 666 B |

U `123` je trikolorní stuha redakční symbol Francie, nikoli tvrzení o vlajce nesené při útoku 14. července 1789. Dobový kontext pařížských červeno-modrých kokard a povstání ověřuje [Élysée](https://www.elysee.fr/en/french-presidency/bastille-day-14-july). Architektura je zjednodušená, ne měřená rekonstrukce.

U `114` je lupa s atomovým symbolem redakční metafora odhalení vnitřní struktury. Nejde o tvrzení, že lze atom pozorovat běžnou lupou, ani o rekonstrukci Thomsonova dobového modelu. Tři elektrony jsou rozlišitelné i při 160 × 90 px; odlesky čočky a stínování částic přesahují přísně plochý stylový cíl.

U `125` jde podle výslovného zadání o představu éteru jako média pro šíření světla, kterou článek zkoumá a odmítá. Obrázek nezobrazuje skutečně prokázaný éter ani nepředstírá vysvětlení výsledku experimentu pomocí ciferníků. Modré průsvitné záhyby a zlatá vlna tvoří jeden motiv. Měkké přechody a svítivost patří přímo ke světlu a mlze; okolí obrázku zůstává průhledné. Skill i prompt dovolují tuto účelnou měkkost, nikoli dekorativní záři nebo pozadí přes celý obrázek.

Všechny čtyři RGBA WebP mají 640 × 360 px, průhledné odsazení i rohy a byly prohlédnuty při 160 × 90 a 320 × 180 px na skutečném gradientu karty. `114` a `125` vznikly každá jedním generováním z metadat odpovídajících novému vizuálnímu záměru; neobsahují text. Manifest ukládá aktuální metadata, přesné prompty, SHA-256 a důvod náhrady v `correction`, včetně hashů předchozích obrázků odmítnutých uživatelem. Přijetí se posuzuje podle skutečně viditelného vztahu nebo rozpoznávacích znaků události; význam se nesmí nahradit názvem objektu pod obrázkem ani nepochopitelným schématem. Texty, zdroje, kategorie a ostatní záznamy databáze se nemění.

## Dávka 135–159

Doplněno 25 samostatných ilustrací vestavěným image_gen, vždy s transparent_background=true. Všech 25 je zapnuto v kartách a galerii. Výstupy jsou RGBA WebP 640×360, quality 80, pod 100 kB, s průhledným odsazením a nulovou alfou ve všech rozích. Kontrola proběhla při 160×90 a 320×180 na tmavém povrchu. Přesné prompty, hashe a individuální významové poznámky jsou v manifestu. Nástroj neumožňuje nastavit velikost, kvalitu ani cenu generování.

Deterministický repair proběhl v náhledu; obecné návraty ke generickým motivům nebyly aplikovány. Obsah ani metadata příspěvků se nemění. Některé obrázky mají více detailů než cílových 5–8 ploch; konkrétní omezení zaznamenává manifest.

Velikosti nové dávky jsou 16 896–39 036 B, dohromady 706 204 B. U `141` byl cílenou úpravou nahrazen anachronický znak eura frankem; přesný editační prompt je v `targetedEdit`. `npm test` i `npm run build` prošly; build hlásí existující upozornění Svelte na slot/přístupnost a velikost balíčku galerie.
