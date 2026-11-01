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
- Počet převezmi ze zadání; pokud chybí a nelze jej odvodit z kontextu, vyžádej si jej. Neuvedené tematické omezení znamená výběr napříč kategoriemi. První volné ID odvoď z nejvyššího číselného ID v celé databázi, nikoli z počtu záznamů či poslední pozice. ID jsou řetězce, s nulami zleva alespoň na tři místa; mezery v číslování nezaplňuj. Zadané ID musíš ověřit proti databázi.

## Žádné opakování již pokryté myšlenky

**Nově vytvářený post nesmí nikdy znovu pokrýt hlavní myšlenku některého existujícího postu.** Jiný titulek, kategorie, příklad, autor, formulace či nový úhel podání stejného principu z něj nedělá nové téma. Kontrola platí i mezi novými posty v jedné dávce a proti dříve schváleným novým záznamům.

1. Před psaním projdi titulky **i celé obsahy všech existujících postů**, po úplných zvládnutelných dávkách. Pro každý si udržuj stručný významový přehled: ID, ústřední tvrzení či princip, mechanismus nebo událost a její pointu. Zpracuj skutečné záznamy, nikoli předpokládanou souvislou řadu ID. Zkrácený či useknutý výstup není přečtená dávka.
2. Pro každý návrh formuluj jednou větou hlavní myšlenku a porovnej ji s celým přehledem. U blízkých témat znovu otevři plné původní texty. Vyhledávání slov, shoda titulků či automatická podobnost jsou pomocné filtry, nikdy důkaz originality. Nespoléhej na posledních 30 postů ani na samotný generovací skript.
3. Shodný princip vyřaď, i když má jiné příklady. Například další vysvětlení ukotvení při vyjednávání opakuje již vysvětlené kognitivní ukotvení v obchodě. Stejná osobnost však může být námětem jiného postu o skutečně odlišném objevu; musí přinést samostatnou dosud nepokrytou myšlenku.
4. Při pochybnostech návrh nahraď jiným. Pokud nemáš přístup k celé databázi nebo ji nelze úplně zkontrolovat, vyžádej si chybějící data a neodevzdávej návrhy jako prověřené nové posty. Nemožnost kontroly není povolením opakování.
5. Před konečným odevzdáním načti aktuální databázi znovu a posuď případně přidané či změněné záznamy; znovu ověř ID. Existující posty kvůli uvolnění tématu nikdy nemaž ani nepřepisuj.

### Povinná brána originality

Před výběrem námětů přečti [známé obsahové duplicity](references/duplicity.md). Jde o skutečné příklady selhání kontroly, nikoli úplný seznam zakázaných témat. Existující duplicita není precedent pro další opakování.

- Pro kontrolovanou databázi zaznamenej SHA-256 souboru, počet skutečných záznamů a počet zpracovaných záznamů. Významový přehled musí obsahovat každé existující ID právě jednou. Čti po menších dávkách; useknutý výstup znovu načti v menších částech. Při pokračování po ztrátě kontextu obnov přehled i pokrytí, nespoléhej na paměť.
- Pro každý návrh veď pracovní záznam: hlavní myšlenka bez marketingového titulku, nejbližší existující ID, konkrétní rozdíl v poznatku a verdikt `přijmout` / `vyřadit`. Za nejbližší vyber významově související záznamy z celého přehledu a přečti jejich plné texty. Samotné tvrzení „téma je nové“ nestačí. Pokud není žádné blízké téma, uveď to a dolož dokončené pokrytí databáze.
- Použij test záměny: pokud lze oba texty shrnout stejnou větou a čtenář se dozví stejný princip, událost či pointu, návrh vyřaď. Jiný experiment vysvětlující tentýž mechanismus, nové přirovnání, dnešní aplikace, jiné zdroje nebo jiná ilustrace samy o sobě originalitu nezakládají. Stejný autor s jiným samostatným poznatkem je přípustný.
- Kontrolu zopakuj nad **hotovým celým textem**, který se mohl při psaní od původního námětu odchýlit, a také mezi všemi novými texty. Každý přijatý návrh ihned přidej do pracovního významového přehledu. Vyřazený námět nahraď a náhradu zkontroluj stejným postupem; počet v zadání není důvod přijmout duplicitu.
- Bez úplného pokrytí a kladného verdiktu pro každý hotový text dávku neodevzdávej ani nepřipojuj do databáze. Před zápisem znovu porovnej hash zdrojové databáze; při změně načti a významově zkontroluj přidané či změněné záznamy a znovu ověř všechna navržená ID. Není-li původní přehled spolehlivý, zopakuj úplnou kontrolu.

Pracovní přehled a verdikty udržuj odděleně od objektů postů; nemění datové schéma ani předepsaný JSON výstup. Při předání pouze JSON je nepřidávej do odpovědi. Automatické porovnání slov či zdrojů může vyhledat kandidáty, ale nemůže potvrdit sémantickou originalitu. Ani tento postup není matematickou zárukou; neprohlašuj kontrolu za dokončenou bez uvedených podkladů.

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

Každý nový objekt má přesně pole `id`, `title`, `content`, `category`, `sources`, `illustration`. První čtyři jsou řetězce. `sources` je pole 2–3 objektů s řetězci `label` a `url`; `illustration` je objekt popsaný níže. Kompletní ukázka je v propojeném redakčním zadání.

- Český konkrétní a poutavý `title` má nejvýše 80 znaků.
- `content` má 500–1 200 znaků včetně HTML. Používej `<p>` pro krátké odstavce po 1–3 větách, střídmě `<strong>` a `<em>`. Nepřidávej nadpisy, hashtagy, styly, třídy ani skripty.
- Jeden post = jedna hlavní myšlenka. Piš přirozenou, spisovnou a gramaticky správnou češtinou, bez životopisných medailonků a výplně.
- Doporučený rytmus: háček → problém → napětí → obrat → vysvětlení na příkladu → kontrast → pointa → případná aplikace. Není povinné vynucovat všechny kroky. Faktický příběh může mít prostý úvod, vysvětlení a pointu. Závěrečná otázka patří jen k přirozenému dilematu či paradoxu.
- Všechna faktická tvrzení ověř otevřením důvěryhodných zdrojů, přednostně primárních publikací, odborných institucí či uznávaných encyklopedií. Odevzdej 2–3 přímé relevantní odkazy, jejichž obsah tvrzení opravdu podporuje. Nevymýšlej URL, citáty ani bibliografické údaje. Neověřitelná tvrzení vynech.
- Zachovej chronologii, rozlišuj hypotézu od prokázaného výsledku a nejistotu od jistoty. Nedoložené přesné starověké datace nahraď doloženým přibližným údajem „kolem roku … př. n. l.“. Parafráze nevydávej za doslovné citace.

## Ilustrační metadata každého postu

Všechny následující klíče jsou povinné. Textové hodnoty piš anglicky, názvy motivů jako popisné identifikátory `snake_case`; nejsou to automaticky klíče SVG rendereru.

| Pole | Typ a pravidlo |
|---|---|
| `concept` | Řetězec: konkrétní viditelná scéna vystihující hlavní myšlenku celého postu. |
| `scene_type` | Řetězec: `portrait`, `interaction`, `process`, `diagram`, `environment`, `object`. |
| `primary_subject` | Řetězec: jeden konkrétní hlavní motiv. |
| `secondary_subjects` | Pole řetězců; pouze potřebné, textem podložené doplňky, jinak `[]`. |
| `visual_keywords` | Pole 3–6 konkrétních vizuálních výrazů. |
| `composition_hints` | Pole řetězců: stručné konkrétní pokyny k rozmístění a vztahu prvků. |
| `mood` | Řetězec: `contemplative`, `dramatic`, `dynamic`, `mysterious`, `neutral`, `playful`. |
| `palette` | Řetězec: `blue_gold`, `green_copper`, `indigo_cyan`, `monochrome_cool`, `monochrome_warm`, `teal_amber`, `terracotta_cream`, `violet_coral`. |

Přečti titulek i celý hotový obsah, pojmenuj jeho pointu a až pak navrhni motiv. Kategorie ani seznam podstatných jmen nestačí. U mechanismu, paradoxu či argumentu ukaž čitelný vztah (kontrast, příčinu, následek, změnu); `scene_type` i kompozice jej musí podporovat. Například proud obtékající pevnou překážku vyjadřuje přizpůsobení lépe než obecná říční krajina.

Pokud by abstraktní učení vyžadovalo vymyšlené rekvizity, použij střídmý portrét skutečného autora či učitele. Nepřidávej mince, řetězy, oddělené ruce nebo koule pouze podle asociace s abstraktním slovem. Každý vedlejší objekt musí mít oporu v plném textu a zvolené scéně. Nepřidávej dekorace kvůli rozmanitosti.

Navrhuj jednu jednoduchou scénu čitelnou už při 160 × 90 px, s jedním dominantním motivem. Bez vysvětlujících šipek, sítí spojnic, legend a samostatných symbolů vyžadujících luštění. Diagram použij jen pro vztah výslovně potřebný v textu a srozumitelný bez dekódování značek. Kompozice může využít např. `dominant_central_object`, `two_objects_in_interaction`, `clear_visual_contrast`, `portrait_focus` nebo jiný přesný pokyn odpovídající scéně. Metadata nejsou kompletní generovací prompt a jejich vytvoření neznamená generovat obrázek.

## Kontrola a předání

Před odevzdáním ověř úplnost kontroly originality, jedinečnost ID, JSON a datové typy, délky, HTML, češtinu, kategorie, 2–3 ověřené zdroje, všech osm polí ilustrace a enumy. Samostatně posuď věrnost ilustrace celému textu a nepotřebné vedlejší motivy. Pro podrobný sémantický audit lze použít [faakt-metadata-review](../faakt-metadata-review/SKILL.md).

Při požadavku na nové posty vrať pouze validní JSON pole nových objektů bez Markdownu a komentářů, není-li zadán jiný způsob předání. Při požadavku na vložení do databáze připoj jen nové záznamy a zachovej existující obsah i rozpracované změny; dodrž projektové kontroly v CLAUDE.md včetně náhledu repairu. Generovací skript není zárukou originality ani úplných metadat. Nepublikuj automaticky a nespouštěj generování obrázků bez odpovídajícího zadání.

Při změně schématu nebo redakčních pravidel udržuj tento skill a redakční handoff ve vzájemném souladu ve stejné změně.
