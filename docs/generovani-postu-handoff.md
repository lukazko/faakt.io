# Zadání pro AI agenta: nové příspěvky faakt.io

Jsi editor obsahu aplikace faakt.io. Vytváříš nové, čtivé příspěvky v češtině založené výhradně na ověřitelných skutečnostech. Výstup se bude vkládat do databáze aplikace, proto dodrž její datový formát přesně.

## Než začneš

Přenositelný postup pro libovolného AI agenta je v [skills/faakt-create-posts/SKILL.md](../skills/faakt-create-posts/SKILL.md). Úplná aktuální databáze je [static/data/posts.json](../static/data/posts.json), nikoli její zálohy nebo build kopie. Platné kategorie definuje [src/lib/categories.js](../src/lib/categories.js).

Potřebuješ znát počet příspěvků; pokud chybí a nelze jej odvodit ze zadání, vyžádej si jej. Není-li kategorie omezena, vybírej napříč kategoriemi. První volné ID odvoď jako nejvyšší číselné ID v celé aktuální databázi plus jedna, nikoli z počtu záznamů či pořadí v souboru. ID jsou řetězce bez úvodních nul (například `1`, `99`, `1000`). Zadané počáteční ID ověř proti databázi; neodhaduj jeho dostupnost a nezaplňuj mezery v číslování.

**Nový příspěvek nesmí znovu pokrýt hlavní myšlenku již existujícího článku.** Jiný titulek, autor, příklad ani kategorie z něj nedělají nový poznatek. Použij ověřený významový index podle [docs/post-knowledge.md](post-knowledge.md): spusť `python scripts/post-knowledge.py status`, přečti celý stránkovaný kompaktní `catalog`, vyhledej kandidáty přes `search` a celé blízké články otevři přes `show`. Celé nezměněné články s platně ověřenými metadaty není nutné opakovaně číst. Chybějící nebo zastaralé záznamy zkontroluj z plného textu přes `review-batch`.

Povinná brána originality je popsána ve skillu v části „Povinná brána originality“ a v [post-knowledge.md](post-knowledge.md). Přečti také [známé duplicity](../skills/faakt-create-posts/references/duplicity.md). Pro každý námět nejprve připrav pracovní `knowledge`, blízká přečtená ID a konkrétní rozdíl v poznatku; plán ověř pomocí `check-plan`. Po napsání znovu porovnej celé hotové texty, jejich pointy a ostatní návrhy, ověř zdroje a použij `check-drafts`. Zápis přes `append` vyžaduje aktuální otisky katalogu a návrhů i doložené finální rozhodnutí. Automatické skóre podobnosti ani nové `idea` nejsou sémantický verdikt.

## Významová metadata pracovního návrhu

Pracovní nový objekt obsahuje vedle článku `knowledge` se čtyřmi poli:

- `idea`: stabilní identifikátor hlavního poznatku; výchozí tvar `idea-<ID prvního článku>`. Stejný mechanismus má stejný identifikátor i při jiném příběhu.
- `point`: jedna konkrétní česká věta o 30–300 znacích bez HTML. Vyjadřuje nový poznatek a podstatné hranice jeho platnosti, nikoli jen téma nebo otázku z titulku.
- `tags`: 2–6 existujících ID ze `static/data/tags.json`, alespoň jedno odborné téma; přidej vhodný přesah nebo hlavní entitu. Neopakuj nadřazený tag, pokud už používáš jeho potomka. Alternativní zápis patří mezi aliasy, nikoli do nového tagu.
- `type`: `principle`, `theory`, `event`, `discovery`, `work`, `practice` nebo `open-question`, podle definic v `docs/post-knowledge.md`.

**Pole `knowledge` je pracovní formát, ne rozšíření souboru článků.** Nástroj `append` jej vydělí do `post-knowledge.json` a `knowledge-ideas.json`. V `posts.json` zůstává dosavadních šest polí. Kontrolní otisky, historie review a schválení nepatří do publikovaného obsahu. Ilustrační metadata jsou oddělená a nemají nahrazovat pointu článku.

## Obsah příspěvků

- Piš spisovnou, gramaticky správnou a přirozenou češtinou.
- Jeden příspěvek rozvíjí jednu hlavní myšlenku. Cílová délka `content` je 500 až 1 200 znaků včetně HTML značek.
- `content` je jednoduché HTML: používej `<p>` pro odstavce a střídmě `<strong>` nebo `<em>`. Bez nadpisů, hashtagů, stylů a vlastních CSS tříd. Odstavce mají obvykle 1 až 3 věty.
- První odstavec (`<p>`, hook) má 2 až 3 smysluplné věty, nikoli jedinou větu. Zobrazuje se na přední straně karty, která s jednovětým úvodem působí příliš prázdně. Úvodní otázku či překvapivé tvrzení rozveď konkrétním kontextem nebo napětím, bez výplně. Další odstavce mohou mít 1 až 3 věty.
- Doporučený rytmus je háček, vysvětlení problému nebo myšlenky, konkrétní příklad či kontrast a zapamatovatelná pointa. Není to povinná šablona; faktické příběhy mají vlastní tempo. Závěrečnou otázku použij jen tehdy, když přirozeně otevírá dilema nebo paradox.
- Nepsat životopisné medailonky. Údaje o osobě uváděj pouze tehdy, když přímo vysvětlují danou myšlenku, objev, dílo či událost. Titulek nemusí obsahovat jméno osobnosti.
- Titulek má být konkrétní a poutavý, nejvýše 80 znaků.
- Zachovej chronologickou přesnost. Starověké myslitele datuj „kolem roku X př. n. l.“, pokud přesné datum není doloženo. Nevymýšlej citáty ani nepřisuzuj parafráze konkrétním autorům.

Všechna faktická tvrzení musí být pravdivá a ověřitelná. Každý příspěvek musí mít 2 až 3 konkrétní, důvěryhodné zdroje, jejichž obsah tvrzení skutečně podporuje. Odkazy ověř; nevymýšlej názvy publikací, URL, citace ani bibliografické údaje. Upřednostňuj primární zdroje, odborné instituce a uznávané encyklopedie. Pokud tvrzení nelze spolehlivě ověřit, nepoužívej ho.

Při generování napříč kategoriemi pokrývej všech 13 kategorií a témata vyvažuj. Přibližně 30 % dávky mohou tvořit starověcí myslitelé z řeckého, římského, čínského či indického prostředí; zbývající část rozlož napříč ostatními kategoriemi podle seznamu níže. Neopakuj téma ani úhel pohledu. Pokud je zadána jediná kategorie, všechny příspěvky musí patřit do ní.

Povolené hodnoty `category`:

`historie`, `filozofie`, `biologie`, `umeni`, `literatura`, `politika`, `fyzika`, `astronomie`, `ekonomie`, `psychologie`, `filmy`, `matematika`, `pocitacove-vedy`.

Zobrazované názvy a hranice: `politika` = Společnost a politika (společenské normy, instituce, právo, vládnutí); `fyzika` = Fyzika a chemie (neživá příroda včetně chemie a geofyziky); `pocitacove-vedy` = Technologie (informatika a technické vynálezy). Biologie zahrnuje organismy, genetiku, evoluci, fyziologii i nemoci, léčbu, prevenci a životosprávu. Jazyk a znaky jsou podoborem Filozofie. Rozhoduje hlavní obsah a pointa, přesahy se zapisují do řízených tagů. Platné slugy určuje `src/lib/categories.js`.

## Ilustrační metadata

Kategorie `filmy` se zobrazuje jako **Kinematografie**; slug zůstává zachován pro existující odkazy.

Každý nový příspěvek musí obsahovat objekt `illustration`. Po přečtení titulku i celého obsahu vyber jeden rozpoznatelný aspekt: objekt, osobu, jednoduchý děj nebo stručnou metaforu. Ilustrace doprovází text; nemusí vysvětlit mechanismus, rekonstruovat experiment ani shrnout celou pointu. Jedoucí sanitka stačí k Dopplerovu jevu, kniha se zákazem k zakázanému románu a pulsar s paprskem k pravidelným pulzům. Metadata nejsou seznam všech souvisejících objektů. `secondary_subjects` může zůstat prázdné; doplňky přidávej jen pro lepší rozpoznání vybraného motivu. Zachovej faktickou identitu a čitelnost při 160×90 px, nepřidávej dekorace kvůli rozmanitosti.

Ilustrace má vzbudit chuť číst výrazným motivem, gestem, atmosférou či kontrastem. Samotná přehlednost nestačí: i několik oddělených objektů s jedinou šipkou může působit jako rovnice vstupů a výsledku. Když myšlenku lépe nese přirozené setkání nebo soudržná scéna, propoj prvky pohledem, pózou, pohybem či společným prostorem. Růžový plameňák sklánějící se k šedému mláděti může zaujmout bez schématu mládě + potrava → dospělý. Diagramy, šipky ani vysvětlení principu nejsou zakázané; používej je, pokud jejich vizuální podoba sama dobře funguje jako ilustrace k danému textu. Nerozhoduje jen počet předmětů či kroků.

Metadata popisují námět a jeho uspořádání, nejsou kompletním promptem pro generátor obrázků. Piš jejich textové hodnoty anglicky, jak je běžné v existujících datech. `primary_subject` a další názvy motivů jsou popisné identifikátory ve `snake_case`; nepředpokládej, že jde o klíče rendereru.
Výchozí kompozice má hlavní motiv opticky vycentrovaný vodorovně i svisle a vyvážené prázdné okraje v celém obrázku. Nevycentrování použij jen pro konkrétní význam, interakci či směr děje uvnitř ilustrace; nerezervuj prázdný sloupec pro text. Motiv má být na kartě dostatečně velký. Při výrobě obrázků kontroluj také viditelnou mezeru k hooku, kterou zvětšuje průhledné spodní odsazení; stejný rozměr souboru ani CSS mezera ji nesjednotí. Zachovej centrování v obou osách a postupuj podle sekce „Check visible spacing to the hook“ v [ilustračním skillu](../skills/faakt-illustrations/SKILL.md); samotné posunutí motivu dolů není náprava.

Přesná struktura:

```json
{
  "id": "767",
  "title": "Konkrétní titulek do 80 znaků",
  "content": "<p>Úvodní věta představí překvapivou myšlenku. Druhá věta ji rozvede konkrétním kontextem a vzbudí chuť číst dál.</p><p>Zde pokračuje vysvětlení a pointa příspěvku v češtině.</p>",
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
  },
  "knowledge": {
    "idea": "idea-767",
    "point": "Konkrétní poznatek, který článek vysvětluje a který se významově odlišuje od již pokrytých myšlenek.",
    "tags": ["ancient-history", "knowledge-evidence"],
    "type": "event"
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
- Samostatně ověř, že první odstavec (hook) obsahuje 2 až 3 smysluplné věty a není prodloužený výplní.
- Zkontroluj, že ilustrace vychází z konkrétního příspěvku, že hlavní a doplňkové motivy dávají smysl společně a že se kompozice v rámci dávky zbytečně neopakují.
- `concept`, `scene_type` a `composition_hints` popisují stejný vybraný aspekt. Relevantní objekt je dostačující i u argumentu, paradoxu nebo mechanismu; není potřeba zobrazit celý vztah či důkaz. Klíčová slova nesmějí zbytečně rozšiřovat inventář obrázku.
- Dodané existující příspěvky nikdy nepřepisuj, nemaž ani neupravuj. Vrať pouze nové záznamy.

## Údržba tohoto zadání

Při změně datové struktury příspěvku, pravidel generování nebo redakčních pravidel obsahu v projektu faakt.io musí být tento soubor aktualizován ve stejné změně. Povolené kategorie, typy scén, nálady, palety, datové typy i ukázkový JSON musí odpovídat aktuálnímu projektu; neudržuj zastaralé hodnoty.

Ilustrace musí mít rozpoznatelný hlavní motiv na první pohled. Vol podle kontextu: objekt, portrét, jednoduchý děj nebo vědecký vztah či kontrast čitelný na první pohled. Pokud by bylo potřeba mnoho samostatných předmětů, několik kroků nebo šipkový řetězec pro rozluštění vztahů, vyber jeden rozpoznatelný aspekt. Jedna užitečná šipka sama o sobě není problém. Drobné značky, grafy, přístroje a pozorovatele nepřidávej pro úplnost. Stručný známý symbol, například značka zákazu, je vhodný doplněk.
