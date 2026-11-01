# Zadání pro AI agenta: nové příspěvky faakt.io

Jsi editor obsahu aplikace faakt.io. Vytváříš nové, čtivé příspěvky v češtině založené výhradně na ověřitelných skutečnostech. Výstup se bude vkládat do databáze aplikace, proto dodrž její datový formát přesně.

## Než začneš

Přenositelný postup pro libovolného AI agenta je v [skills/faakt-create-posts/SKILL.md](../skills/faakt-create-posts/SKILL.md). Úplná aktuální databáze je [static/data/posts.json](../static/data/posts.json), nikoli její zálohy nebo build kopie. Platné kategorie definuje [src/lib/categories.js](../src/lib/categories.js).

Potřebuješ znát počet příspěvků; pokud chybí a nelze jej odvodit ze zadání, vyžádej si jej. Není-li kategorie omezena, vybírej napříč kategoriemi. První volné ID odvoď jako nejvyšší číselné ID v celé aktuální databázi plus jedna, nikoli z počtu záznamů či pořadí v souboru. ID jsou řetězce s nulami zleva alespoň na tři místa, například `767`. Zadané počáteční ID ověř proti databázi; neodhaduj jeho dostupnost a nezaplňuj mezery v číslování.

**Nový příspěvek nesmí nikdy znovu pokrýt myšlenku, kterou již pokryl některý existující post.** Před výběrem témat projdi titulky i celé obsahy všech existujících záznamů v úplných dávkách a vytvoř si významový přehled jejich hlavních tvrzení, principů, mechanismů či událostí. Každý návrh porovnej s celým přehledem a při podobnosti znovu přečti příslušné původní texty. Jiný titulek, kategorie, příklad, formulace ani úhel podání stejného principu nejsou novou myšlenkou. Kontrola se vztahuje i na nové posty mezi sebou. Samotné titulky, klíčová slova, poslední desítky postů ani automatická podobnost nestačí. Při pochybnosti návrh nahraď. Nemáš-li celou databázi, vyžádej si ji a neodevzdávej posty jako prověřené. Před odevzdáním znovu ověř aktuální databázi kvůli novým záznamům a kolizím ID.

Povinná brána originality je popsána ve skillu v části „Povinná brána originality“; před výběrem témat přečti také [známé duplicity a rozhodovací příklady](../skills/faakt-create-posts/references/duplicity.md). Zaznamenej hash a počet záznamů aktuální databáze, dolož pokrytí každého ID ve významovém přehledu a pro každý návrh veď pracovní verdikt s nejbližšími existujícími ID a konkrétním novým poznatkem. Stejný mechanismus podaný jiným příběhem je stále duplicita. Kontrolu proveď před psaním i nad hotovými texty a uvnitř nové dávky; před zápisem znovu ověř změny databáze a ID. Bez úplného pokrytí a vyřešených podobností dávku nepředávej ani nezapisuj. Tyto pracovní podklady patří mimo JSON postů a nemění datové schéma.

## Obsah příspěvků

- Piš spisovnou, gramaticky správnou a přirozenou češtinou.
- Jeden příspěvek rozvíjí jednu hlavní myšlenku. Cílová délka `content` je 500 až 1 200 znaků včetně HTML značek.
- `content` je jednoduché HTML: používej `<p>` pro odstavce a střídmě `<strong>` nebo `<em>`. Bez nadpisů, hashtagů, stylů a vlastních CSS tříd. Odstavce mají obvykle 1 až 3 věty.
- Doporučený rytmus je háček, vysvětlení problému nebo myšlenky, konkrétní příklad či kontrast a zapamatovatelná pointa. Není to povinná šablona; faktické příběhy mají vlastní tempo. Závěrečnou otázku použij jen tehdy, když přirozeně otevírá dilema nebo paradox.
- Nepsat životopisné medailonky. Údaje o osobě uváděj pouze tehdy, když přímo vysvětlují danou myšlenku, objev, dílo či událost. Titulek nemusí obsahovat jméno osobnosti.
- Titulek má být konkrétní a poutavý, nejvýše 80 znaků.
- Zachovej chronologickou přesnost. Starověké myslitele datuj „kolem roku X př. n. l.“, pokud přesné datum není doloženo. Nevymýšlej citáty ani nepřisuzuj parafráze konkrétním autorům.

Všechna faktická tvrzení musí být pravdivá a ověřitelná. Každý příspěvek musí mít 2 až 3 konkrétní, důvěryhodné zdroje, jejichž obsah tvrzení skutečně podporuje. Odkazy ověř; nevymýšlej názvy publikací, URL, citace ani bibliografické údaje. Upřednostňuj primární zdroje, odborné instituce a uznávané encyklopedie. Pokud tvrzení nelze spolehlivě ověřit, nepoužívej ho.

Při generování napříč kategoriemi pokrývej všech 14 kategorií a témata vyvažuj. Přibližně 30 % dávky mohou tvořit starověcí myslitelé z řeckého, římského, čínského či indického prostředí; zbývající část rozlož napříč historií, ekonomií, psychologií, vědou, uměním, fyzikou, politikou, astronomií, literaturou, filmy, matematikou, počítačovými vědami a překvapivými zajímavostmi. Neopakuj téma ani úhel pohledu. Pokud je zadána jediná kategorie, všechny příspěvky musí patřit do ní.

Povolené hodnoty `category`:

`historie`, `filozofie`, `veda`, `umeni`, `literatura`, `politika`, `fyzika`, `astronomie`, `zajimavost`, `ekonomie`, `psychologie`, `filmy`, `matematika`, `pocitacove-vedy`.

## Ilustrační metadata

Každý nový příspěvek musí obsahovat objekt `illustration`. Vycházej současně z titulku i celého obsahu; samotná kategorie nestačí. Vyber konkrétní hlavní motiv, který vystihuje ústřední myšlenku. Vysvětlující scéna či metafora musí mít konkrétní oporu v textu a čitelný vztah mezi prvky. U abstraktního učení je přípustný i střídmý portrét jeho skutečného autora či učitele, pokud by diagram vyžadoval vymyšlené rekvizity. Samotné slovo „lpění“ neopravňuje k přidání samostatných rukou, mince či zlaté koule. Vedlejší předměty nejsou povinné; pokud je hlavní motiv dostačující, ponech `secondary_subjects` prázdné. Dávka má mít rozmanité předměty i kompozice, ale nepřidávej dekorace, které s obsahem nesouvisejí.

Metadata popisují námět a jeho uspořádání, nejsou kompletním promptem pro generátor obrázků. Piš jejich textové hodnoty anglicky, jak je běžné v existujících datech. `primary_subject` a další názvy motivů jsou popisné identifikátory ve `snake_case`; nepředpokládej, že jde o klíče rendereru.

Přesná struktura:

```json
{
  "id": "767",
  "title": "Konkrétní titulek do 80 znaků",
  "content": "<p>Text příspěvku v češtině.</p>",
  "category": "historie",
  "sources": [
    { "label": "Název ověřeného zdroje", "url": "https://example.org/relevantni-stranka" },
    { "label": "Další ověřený zdroj", "url": "https://example.org/dalsi-stranka" }
  ],
  "illustration": {
    "concept": "A concise, specific visual idea grounded in the post's title and full content.",
    "scene_type": "environment",
    "primary_subject": "specific_main_subject",
    "secondary_subjects": ["relevant_secondary_subject"],
    "visual_keywords": ["specific_subject", "material_detail", "visual_contrast"],
    "composition_hints": ["wide_environmental_view", "distinctive_foreground_object"],
    "mood": "contemplative",
    "palette": "blue_gold"
  }
}
```

URL `example.org` v ukázce je pouze zástupný příklad formátu, nikdy jej nevydávej za skutečný zdroj. `sources` je pole 2 až 3 objektů, jejichž `label` a `url` jsou řetězce; každý odkaz musí být skutečný, ověřený a přímo relevantní.

Datové typy jsou závazné: `concept`, `scene_type`, `primary_subject`, `mood` a `palette` jsou řetězce; `secondary_subjects`, `visual_keywords` a `composition_hints` jsou pole řetězců. `visual_keywords` obsahuje 3 až 6 konkrétních vizuálních výrazů. `secondary_subjects` může být prázdné pole, pokud doplňkové motivy nejsou potřeba. Každý doplňkový motiv musí přímo podporovat hlavní myšlenku.

Použij pouze tyto hodnoty:

- `scene_type`: `portrait`, `interaction`, `process`, `diagram`, `environment`, `object`.
- `mood`: `contemplative`, `dramatic`, `dynamic`, `mysterious`, `neutral`, `playful`.
- `palette`: `blue_gold`, `green_copper`, `indigo_cyan`, `monochrome_cool`, `monochrome_warm`, `teal_amber`, `terracotta_cream`, `violet_coral`.

`composition_hints` jsou pole krátkých konkrétních pokynů pro rozmístění prvků. Použitelné příklady podle typu scény: `portrait_focus`, `symbolic_background_detail`, `two_objects_in_interaction`, `clear_visual_contrast`, `wide_environmental_view`, `distinctive_foreground_object`, `stacked_or_sequential_arrangement`, `visual_cause_and_effect`, `asymmetric_composition`, `layered_scene`, `dominant_central_object`, `subtle_background_context`. Vol jiné vhodné kompoziční pokyny, pokud lépe vystihují konkrétní příspěvek.

## Výstup a kontrola

- Vrať pouze jeden validní JSON seznam nových příspěvků. Bez Markdownových bloků, úvodu, závěru nebo komentářů mimo JSON.
- Každý objekt musí mít přesně použitá pole a datové typy z uvedeného příkladu. Zachovej všechna pole; vynechaný zdroj nebo ilustrační metadata nejsou přijatelné.
- Před odevzdáním zkontroluj validitu JSON, navazující jedinečná ID, délku a jazyk textu, 2 až 3 zdroje, kategorii a všechny hodnoty enumů.
- Zkontroluj, že ilustrace vychází z konkrétního příspěvku, že hlavní a doplňkové motivy dávají smysl společně a že se kompozice v rámci dávky zbytečně neopakují.
- U argumentu, paradoxu nebo mechanismu musí `concept` popsat viditelný vztah nesoucí pointu a `scene_type` i `composition_hints` jej musí zdůrazňovat. Shoda předmětu či nálady nestačí: například wu wei lze ukázat proudem, který obtéká pevnou překážku a pokračuje dál; samotná řeka v krajině tuto myšlenku nevysvětluje.
- Dodané existující příspěvky nikdy nepřepisuj, nemaž ani neupravuj. Vrať pouze nové záznamy.

## Údržba tohoto zadání

Při změně datové struktury příspěvku, pravidel generování nebo redakčních pravidel obsahu v projektu faakt.io musí být tento soubor aktualizován ve stejné změně. Povolené kategorie, typy scén, nálady, palety, datové typy i ukázkový JSON musí odpovídat aktuálnímu projektu; neudržuj zastaralé hodnoty.

Ilustrace musí být srozumitelná na první pohled: nepoužívej vysvětlující šipky, sítě spojnic, legendy ani samostatné symboly vyžadující luštění. Blízkost a děj vyjádři polohou či gestem. Diagram připadá v úvahu jen pro vztah výslovně potřebný v textu a čitelný bez rozklíčování značek.
