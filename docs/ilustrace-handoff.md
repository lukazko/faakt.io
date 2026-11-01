# Ilustrace — aktuální stav

Produkční karty používají statické AI ilustrace ve formátu WebP. Procedurální SVG renderer, jeho galerie, audit, baseline a testy byly odstraněny.

## Rozsah

- Vygenerované příspěvky: `001`–`100` (100 souborů).
- `043` je uložený pro kontrolu v galerii, ale není zapnutý v produkčních kartách: při 160×90 px má příliš mnoho jemných architektonických detailů.
- Assety: `static/illustrations-ai/<id>.webp`.
- Rozměr: 640×360 px, poměr 16:9, WebP quality 80.
- Velikost souborů: pod 100 kB; typicky 5–35 kB.
- Příspěvky bez statického assetu zatím nezobrazují ilustraci.

## Vykreslení

Kategorie Literatura používá výraznou citronově žlutou barvu `#e6dc58` (`--cat-literatura` v `src/app.css`), která ji odlišuje od oranžových akcentů loga a ovládacích prvků.

`src/lib/components/PostIllustration.svelte` vykresluje dekorativní `<img>` pouze pro ID s vytvořeným assetem. Cesta respektuje SvelteKit base path `/faakt.io`. Obrázky mají prázdný alt text, pevný poměr stran a `object-fit: contain`.

Vývojová galerie je na `/faakt.io/dev/illustrations-ai/` a zobrazuje všech 100 obrázků ve stylu karet. Obrázky nemají vlastní CSS pozadí; alfa kanál odkrývá gradient karty. Poznámky k významu a odchylkám jsou v `review` každého nového záznamu manifestu.

## Generování

Výchozím cílem je jednoduchá ilustrace s jedním výrazným hlavním motivem, který vystihuje obsah a zaujme na první pohled. Obrázek `040` (pracovníci, státní výdaje, stavba) je krajní případ přijatelné složitosti, nikoli vzor pro další ilustrace; běžné výstupy mají být výrazně jednodušší. Vedlejší prvky podporují hlavní motiv a nemají vyžadovat postupné čtení několika scén. Soubor `040.webp` zůstává beze změny.

Sdílený postup pro AI agenty je v `skills/faakt-illustrations/SKILL.md`. Kompaktní prompt a cache kontrolu připravuje `skills/faakt-illustrations/scripts/prepare.mjs`; společný styl je v `prompt.mjs`. Jeden příspěvek znamená nejvýše jedno generování, pokud už asset existuje.

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

- `npm test` kontroluje existenci všech 100 WebP a limit 100 kB.
- `npm run build` ověřuje produkční SvelteKit sestavení.
- Vizuální kontrola: hlavní feed a `/faakt.io/dev/illustrations-ai/` na mobilní šířce.

Post `044` pou??v? jednoduch? detail ob?? exoplanety t?sn? u hv?zdy podobn? Slunci. Metadata ani prompt neobsahuj? m??en? radi?ln? rychlosti, pohyb hv?zdy, ob??n? dr?hy ani ?ipky; m??ic? mechanismus nen? obsahem p??sp?vku. Skill a spole?n? prompt vy?aduj? okam?it? porozum?n? bez lu?t?n? zna?ek, spojnic nebo krok?. Diagram je v?jimkou pouze pro vztah v?slovn? pot?ebn? v textu. Deterministick? repair prob?hl v n?hledu; jeho obecn? p?episy nebyly aplikov?ny.

Nov? `044.webp` m? 22 308 B, 640?360 px a pr?hledn? rohy. Kontrola p?i 160?90 a 320?180 px potvrdila ?itelnou dvojici t?les bez ?ipek; p?sy planety a skvrny hv?zdy p?ekra?uj? c?l velk?ch ploch, sc?na v?ak nevy?aduje lu?t?n?. P?esn? prompt, hashe a omezen? jsou v manifestu.


## Dávka 046–100

Posty 046–100 mají samostatné průhledné ilustrace vytvořené vestavěným image_gen. Manifest ukládá prompty, hashe a stav kontroly; nové záznamy jsou označeny `needs-review`, dokud neproběhne sémantická kontrola proti celému textu příspěvku. Miniatury byly prohlédnuty při 160×90 a 320×180 px. Ilustrace `068`, `081` a `090` byly při této kontrole odmítnuty kvůli nepodloženým symbolům nebo vysvětlujícím šipkám a nejsou zapnuty v kartách. Post 046 má opravená ilustrační metadata podle obsahu. U postu 073 byla scéna zjednodušena na Michelangela při malbě nefigurální části stropu, protože původní prompt zobrazující fresku narazil na bezpečnostní filtr.
