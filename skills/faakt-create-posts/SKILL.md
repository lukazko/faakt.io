---
name: faakt-create-posts
description: Vytváření nových českých postů pro faakt.io, ověření originality proti celé databázi a příprava úplných ilustračních metadat. Použij při zadání nových postů nebo tematické dávky, nikoli pouze pro audit metadat či generování obrázků.
---

# Nové posty faakt.io

Skill je použitelný libovolným AI agentem schopným číst soubory a ověřovat webové zdroje. Nevyžaduje konkrétní model, SDK ani placené API. Relativní odkazy níže vycházejí z adresáře tohoto skillu; příkazy spouštěj z kořene repozitáře.

## Zdroje a zadání

- Přečti projektové konvence v [CLAUDE.md](../../CLAUDE.md) a přesné redakční zadání v [generovani-postu-handoff.md](../../docs/generovani-postu-handoff.md), včetně ukázkového JSON. Oba dokumenty platí společně s tímto skillem.
- **Úplná databáze existujících postů je [static/data/posts.json](../../static/data/posts.json).** Nepoužívej zálohy ani kopie v build adresářích. Databázi vždy načti z aktuálního pracovního stromu.
- Zdroj platných kategorií je [src/lib/categories.js](../../src/lib/categories.js). Při rozporu mezi kódem a dokumentací rozpor vyřeš před odevzdáním.
- Počet převezmi ze zadání; pokud chybí a nelze jej odvodit z kontextu, vyžádej si jej. Neuvedené tematické omezení znamená výběr napříč kategoriemi. První volné ID odvoď z nejvyššího číselného ID v celé databázi, nikoli z počtu záznamů či poslední pozice. ID jsou řetězce bez úvodních nul (například `1`, `99`, `1000`); mezery v číslování nezaplňuj. Zadané ID musíš ověřit proti databázi.

## Žádné opakování již pokryté myšlenky

**Nově vytvářený post nesmí nikdy znovu pokrýt hlavní myšlenku některého existujícího postu.** Jiný titulek, kategorie, příklad, autor, formulace či nový úhel podání stejného principu z něj nedělá nové téma. Kontrola platí i mezi novými posty v jedné dávce a proti dříve schváleným novým záznamům.

1. Spusť `python scripts/post-knowledge.py status`. Ověř úplné pokrytí aktuální databáze a platnost významových metadat. Chybějící či zastaralé záznamy načti přes `review-batch`, přečti celé dotčené články a oprav je postupem v [post-knowledge.md](../../docs/post-knowledge.md). Neodvozuj pointu automaticky z titulku nebo prvního odstavce.
2. Přečti celý **kompaktní katalog unikátních poznatků** přes `catalog --offset 0 --limit 100` a následující stránky. Obsahuje ID, stabilní `idea` a českou `point`, nikoli celé články či obrázky. Není nutné znovu číst celé nezměněné články s platným ověřením. Useknutý výstup načti v menších dávkách; neoznačuj nepřečtený katalog za zkontrolovaný.
3. Pro každý námět nejprve vytvoř pracovní `knowledge` se čtyřmi poli `idea`, `point`, `tags`, `type`. Definice a řízený slovník jsou v [post-knowledge.md](../../docs/post-knowledge.md) a `static/data/tags.json`; stručný výpis poskytne `tags --query ...`. Používej konkrétní tagy bez opakování nadřazených témat.
4. Vyhledej kandidáty přes `search --query "..." --tags ...`, případně několika formulacemi. Skript hledá lokálně napříč celým datasetem a kategoriemi; vrací jen stručné kandidáty seskupené podle poznatku. Přečti celé blízké články přes `show --ids ...`. Vyhledávání je pomocný filtr, nikoli sémantický verdikt. Při pochybnosti námět nahraď.
5. Shodný princip vyřaď i při jiném příběhu, autorovi, zdroji, kategorii či ilustraci. Stejná osobnost s odlišným poznatkem je přípustná. Test záměny: pokud oba články učí stejnou pointu nebo mechanismus, nové ID `idea` nepomůže. Kontroluj i náměty uvnitř dávky.

### Povinná brána originality

Před výběrem námětů přečti [známé obsahové duplicity](references/duplicity.md). Úplný postup, formát plánu a schválení jsou v [post-knowledge.md](../../docs/post-knowledge.md).

- Dolož aktuální `snapshot` ze `status`, úplné pokrytí všech ID a skutečné přečtení celého kompaktního katalogu. V rámci téhož úkolu lze nezměněný zkontrolovaný katalog použít znovu; při pokračování obnov pracovní podklady. Otisk sám není důkazem přečtení ani správnosti významových rozhodnutí.
- Pro každý námět zaznamenej hlavní pointu, nejbližší přečtená existující ID, konkrétní odlišný poznatek a verdikt. Použij `check-plan --plan reports/plan.json`. Prázdné srovnání je přípustné jen po skutečně dokončeném porovnání; vysvětli, proč není blízký text.
- Hotové texty znovu porovnej s jejich schválenou pointou, blízkými texty a mezi sebou; ověř zdroje. Spusť `check-drafts --drafts reports/drafts.json`. Vysoké či nízké skóre podobnosti ani rozdílné `idea` nejsou automatickým rozhodnutím o originalitě.
- Zápis proveď přes `append --drafts ... --approval ...` s rozhodnutími pro každý hotový text a otisky přesného datasetu i návrhů. Pokud se data změnila, nejprve prověř rozdíly a obnov schválení. Bez platného indexu a vyřešených podobností dávku nezapisuj ani nepředávej jako prověřenou.
- **Významová metadata nepatří do `posts.json`.** Pracovní návrh obsahuje `knowledge` pro kontrolu; `append` jej vydělí do `post-knowledge.json` a `knowledge-ideas.json` a uloží neveřejný kontrolní stav. Záznamy originality zůstávají v `reports/`. Články, metadata obrázků a významový index mají oddělenou odpovědnost.
- Skripty nevolají AI ani placené služby. Stávající API generátor vyžaduje schválený plán a zapisuje pouze pracovní návrhy; jeho spuštění není souhlasem s produkčním připojením ani publikací.

## Kategorie

Použij přesně jeden slug z těchto 14 hodnot:

| Slug | Kategorie |
|---|---|
| `historie` | Historie |
| `filozofie` | Filozofie |
| `veda` | Věda |
| `umeni` | Umění |
| `literatura` | Literatura |
| `politika` | Politika |
| `fyzika` | Fyzika |
| `astronomie` | Astronomie |
| `zajimavost` | Zajímavost |
| `ekonomie` | Ekonomie |
| `psychologie` | Psychologie |
| `filmy` | Filmy |
| `matematika` | Matematika |
| `pocitacove-vedy` | Počítačové vědy |

Při jedné zadané kategorii zůstaň v ní. U smíšené dávky vyvažuj kategorie podle velikosti dávky; při dostatečném počtu pokryj všech 14. Orientačně 30 % mohou tvořit starověcí myslitelé z řeckého, římského, čínského či indického prostředí. Rozmanitost ani tento poměr nikdy neospravedlňují opakování myšlenky.

## Struktura a psaní

Každý uložený objekt článku má přesně pole `id`, `title`, `content`, `category`, `sources`, `illustration`. Pracovní návrh má navíc `knowledge` (`idea`, `point`, `tags`, `type`); při zápisu se přesune do samostatných registrů podle `docs/post-knowledge.md`. První čtyři jsou řetězce. `sources` je pole 2–3 objektů s řetězci `label` a `url`; `illustration` je objekt popsaný níže. Kompletní ukázka je v propojeném redakčním zadání.

- Český konkrétní a poutavý `title` má nejvýše 80 znaků.
- `content` má 500–1 200 znaků včetně HTML. Používej `<p>` pro krátké odstavce po 1–3 větách, střídmě `<strong>` a `<em>`. Nepřidávej nadpisy, hashtagy, styly, třídy ani skripty.
- První odstavec (`<p>`, hook) má 2–3 smysluplné věty, nikoli jedinou větu. Zobrazuje se na přední straně karty, která s jednovětým úvodem působí příliš prázdně. Úvodní otázku či překvapivé tvrzení rozveď konkrétním kontextem nebo napětím, bez výplně. Další odstavce mohou mít 1–3 věty. Před odevzdáním délku hooku samostatně zkontroluj.
- Jeden post = jedna hlavní myšlenka. Piš přirozenou, spisovnou a gramaticky správnou češtinou, bez životopisných medailonků a výplně.
- Doporučený rytmus: háček → problém → napětí → obrat → vysvětlení na příkladu → kontrast → pointa → případná aplikace. Není povinné vynucovat všechny kroky. Faktický příběh může mít prostý úvod, vysvětlení a pointu. Závěrečná otázka patří jen k přirozenému dilematu či paradoxu.
- Všechna faktická tvrzení ověř otevřením důvěryhodných zdrojů, přednostně primárních publikací, odborných institucí či uznávaných encyklopedií. Odevzdej 2–3 přímé relevantní odkazy, jejichž obsah tvrzení opravdu podporuje. Nevymýšlej URL, citáty ani bibliografické údaje. Neověřitelná tvrzení vynech.
- Zachovej chronologii, rozlišuj hypotézu od prokázaného výsledku a nejistotu od jistoty. Nedoložené přesné starověké datace nahraď doloženým přibližným údajem „kolem roku … př. n. l.“. Parafráze nevydávej za doslovné citace.

## Ilustrační metadata každého postu

Ilustrace má vzbudit chuť číst výrazným motivem, gestem, atmosférou či vizuálním kontrastem. Samotná přehlednost nestačí: i několik oddělených objektů s jedinou šipkou může působit jako rovnice vstupů a výsledku. Když myšlenku lépe nese přirozené setkání nebo soudržná scéna, propoj prvky pohledem, pózou, pohybem či společným prostorem. Růžový plameňák sklánějící se k šedému mláděti může zaujmout bez schématu mládě + potrava → dospělý. Diagramy, šipky ani vysvětlení principu nejsou zakázané; používej je, pokud jejich vizuální podoba sama dobře funguje jako ilustrace k danému textu. Nerozhoduje jen počet předmětů či kroků.

Všechny následující klíče jsou povinné. Textové hodnoty piš anglicky, názvy motivů jako popisné identifikátory `snake_case`; nejsou to automaticky klíče SVG rendereru.

| Pole | Typ a pravidlo |
|---|---|
| `concept` | Řetězec: jeden konkrétní rozpoznatelný aspekt doprovázející post; nemusí vysvětlit jeho celou myšlenku. |
| `scene_type` | Řetězec: `portrait`, `interaction`, `process`, `diagram`, `environment`, `object`. |
| `primary_subject` | Řetězec: jeden konkrétní hlavní motiv. |
| `secondary_subjects` | Pole řetězců; pouze potřebné, textem podložené doplňky, jinak `[]`. |
| `visual_keywords` | Pole 3–6 konkrétních vizuálních výrazů. |
| `composition_hints` | Pole řetězců: stručné konkrétní pokyny k rozmístění a vztahu prvků. |
| `mood` | Řetězec: `contemplative`, `dramatic`, `dynamic`, `mysterious`, `neutral`, `playful`. |
| `palette` | Řetězec: `blue_gold`, `green_copper`, `indigo_cyan`, `monochrome_cool`, `monochrome_warm`, `teal_amber`, `terracotta_cream`, `violet_coral`. |

Přečti titulek i celý hotový obsah a vyber jeden relevantní aspekt pro jednoduchou ilustraci. Stačí samostatný objekt, skutečný autor, jednoduchý děj nebo stručná metafora. Text vysvětluje mechanismus a pointu; obrázek nemusí rekonstruovat experiment, zobrazit všechny jeho části ani dokazovat závěr. Například sanitka stačí k Dopplerovu jevu, kniha se zákazem k zakázanému románu a pulsar s paprskem k pulzům z vesmíru. Nepřidávej zároveň Zemi, graf frekvence, magnetické pole a přístroje.

`secondary_subjects` nech prázdné, pokud je hlavní motiv dostačující. Doplňky a symboly mohou pomoci rozpoznání zvoleného aspektu, jejich relevance k článku však sama nestačí k jejich přidání. Klíčová slova popisují stejný motiv, nerozšiřují inventář obrázku. `scene_type` a `composition_hints` mají podporovat vybraný jednoduchý motiv čitelný při 160×90 px. Vol podle kontextu: jednoduchý vědecký vztah, kontrast či interakce jsou vhodné, když jsou čitelné na první pohled. Jestli by byly potřeba mnohé samostatné předměty, několik kroků či řetězec šipek pro rozluštění vztahů, vyber jeden rozpoznatelný aspekt. Jedna užitečná šipka není sama o sobě problém. Zachovej věcnou identitu, nevymýšlej detaily a nepřidávej popisek pouze pojmenovávající nakreslený objekt. Metadata nejsou kompletní generovací prompt a jejich vytvoření neznamená generovat obrázek.
Hlavní motiv má být opticky vycentrovaný v celém obrázku vodorovně i svisle, s vyváženými prázdnými okraji. Asymetrie je vhodná jen tehdy, když pomáhá konkrétnímu významu, interakci nebo směru děje uvnitř ilustrace; bez takového důvodu nepřidávej `asymmetric_composition` ani volný sloupec pro text. Preferuj kompozici, jejíž hlavní motiv bude na kartě dostatečně velký; shodné rozměry obrázků nezaručují shodnou viditelnou mezeru k hooku. Při následné výrobě ilustrací porovnej skutečné karty podle sekce „Check visible spacing to the hook“ v [ilustračním skillu](../faakt-illustrations/SKILL.md). Mezeru neřeš automatickým posunutím motivu dolů.

## Kontrola a předání

Před odevzdáním ověř úplnost kontroly originality, jedinečnost ID, JSON a datové typy, délky, HTML, češtinu, kategorie, 2–3 ověřené zdroje, všech osm polí ilustrace a enumy. Samostatně posuď věrnost ilustrace celému textu a nepotřebné vedlejší motivy. Pro podrobný sémantický audit lze použít [faakt-metadata-review](../faakt-metadata-review/SKILL.md).

Při požadavku na nové posty vrať pouze validní JSON pole nových objektů bez Markdownu a komentářů, není-li zadán jiný způsob předání. Při požadavku na vložení do databáze připoj jen nové záznamy a zachovej existující obsah i rozpracované změny; dodrž projektové kontroly v CLAUDE.md včetně náhledu repairu. Generovací skript není zárukou originality ani úplných metadat. Nepublikuj automaticky a nespouštěj generování obrázků bez odpovídajícího zadání.

Při změně schématu nebo redakčních pravidel udržuj tento skill a redakční handoff ve vzájemném souladu ve stejné změně.
