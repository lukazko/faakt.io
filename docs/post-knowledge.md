# Významový index a společné tagy

## Rozhodnutí

Samostatná pole pro subject, claim, mechanism, scope a takeaway by se překrývala a zvyšovala náklady na generování i kontrolu. Používáme čtyři logické atributy: `idea`, `point`, `tags`, `type`. Důležitý mechanismus a podmínky patří do jedné konkrétní pointy. Obtížnost, dojmy z ilustrace, domnělé zájmy čtenářů ani ruční seznam všech podobných článků nepřidáváme.

`category` zůstává stávající zobrazovací kategorií příspěvku. Významový index je samostatný: nevychází z obrázku, titulku samotného ani automaticky vytažené první věty.

## Soubory a datové schéma

`static/data/posts.json` obsahuje nadále jen `id`, `title`, `content`, `category`, `sources`, `illustration`. Při doplnění indexu se tento soubor vůbec nezměnil. Běžný feed dál načítá pouze články; další data lze později načíst podle potřeby.

| Soubor | Obsah |
|---|---|
| `static/data/post-knowledge.json` | Pro každé ID pouze odkaz `idea` a pole `tags`. |
| `static/data/knowledge-ideas.json` | Společná `point` a `type` pro každý poznatek, uložené právě jednou. |
| `static/data/tags.json` | Řízený slovník tagů, jejich rodičů a alternativních názvů; povolené druhy obsahu. |
| `editorial/knowledge-state.json` | Neveřejné kontrolní otisky, verze a údaje o významové kontrole. Nenačítá se do aplikace. |

Příklad skutečného sdíleného poznatku:

```json
{
  "version": 1,
  "posts": {
    "9": { "idea": "idea-9", "tags": ["social-psychology", "cognitive-biases", "identity"] },
    "82": { "idea": "idea-9", "tags": ["social-psychology", "cognitive-biases", "identity"] }
  }
}
```

Odpovídající část registru poznatků:

```json
{
  "version": 1,
  "ideas": {
    "idea-9": {
      "point": "Rozpor mezi přesvědčením a jednáním může člověk zmírňovat změnou vlastního postoje místo přijetí nepříjemného rozporu.",
      "type": "principle"
    }
  }
}
```

`idea` je stabilní ID hlavního poznatku, ne ID autora či širokého tématu. Výchozí tvar je `idea-<ID prvního příspěvku>`. Nemění se při přejmenování titulku. Jiný příklad stejného mechanismu má stejné `idea`; stejný myslitel s jinou myšlenkou jiné `idea`. Nové ID samo nedokazuje originalitu. Známé staré duplicity zůstávají v článcích a jsou přiřazením pouze pojmenovány.

`point` je jedna česká věta o 30–300 znacích, bez HTML. Musí vyjádřit poznatek a podstatné omezení, které mění jeho význam. Neopisuj otázku z titulku, životopisný údaj ani obecnost typu „spánek je důležitý“. Není třeba shrnout všechny vedlejší informace. Pokud by věta platila stejně pro dva články a čtenář získal stejný poznatek, prověř společné `idea`.

`type` má jednu z hodnot:

| ID | Význam |
|---|---|
| `principle` | Fungování jevu, pravidla, mechanismu nebo důkazu. |
| `theory` | Pojmenované teoretické nebo filozofické vysvětlení či argument. |
| `event` | Konkrétní historická událost nebo změna. |
| `discovery` | Konkrétní objev, doložený výsledek výzkumu či nový algoritmus. |
| `work` | Konkrétní umělecké či literární dílo a jeho pointa. |
| `practice` | Vědecky podložený postup přímo použitelný v jednání. |
| `open-question` | Nevyřešený problém nebo skutečná nejistota jako hlavní téma. |

Jde o druh obsahu, nikoli automatické hodnocení kvality důkazů. Například `discovery` samo neříká, zda práce prošla recenzním řízením; důležité omezení uvádí článek a případně pointa.

## Tagy pro hledání a budoucí feed

Každý příspěvek má 2–6 existujících tagů a alespoň jeden `topic`. Tag má `id`, český `label`, `kind`, `parent` a `aliases`. ID jsou stabilní ASCII slugy. `parent` je ID nadřazeného tématu nebo `null`.

- `topic`: odborná oblast, například `cryptography`, `sleep`, `narratology`. Hierarchie umožňuje najít širší oblast bez jejího opakovaného ukládání ke každému článku.
- `theme`: přesah mezi obory, například `power`, `cooperation`, `knowledge-evidence`. Propojuje tematicky vzdálené články s příbuznou otázkou.
- `entity`: vybraná hlavní osoba, objekt nebo civilizační kontext, například `aristotle`, `roman-empire`, `moon`. Přidávej jej pro skutečný předmět příspěvku, ne pro náhodnou zmínku nebo autora citovaného zdroje.

Používej nejkonkrétnější vhodné téma. Rodiče dítěte do téhož příspěvku neopakuj; skript je při hledání dopočítává. Stejně tak nevytvářej nový tag pro jiný zápis existujícího názvu: doplň `aliases`. Nové téma přidej jen při skutečné mezeře slovníku, s ověřeným rodičem a jasně odlišitelným významem. Slovník nemusí obsahovat každou osobu, která se kdy objeví v jednom textu.

Pro budoucí doporučování lze kombinovat konkrétní témata, přesahové motivy, hlavní entity a druh obsahu. `idea` omezuje opakování stejného poznatku. Nadřazená témata umožní doporučit něco nového z blízké oblasti. Podobnost tagů není obsahová duplicita ani hotový personalizační algoritmus; uživatelské reakce budou samostatná data. Současné řazení feedu se nemění.

## Nástroj bez AI a dalších závislostí

Příkazy spouštěj z kořene repozitáře. `npm run knowledge -- ...` je zkratka za `python scripts/post-knowledge.py ...`. Na Windows používej UTF-8 (`$env:PYTHONUTF8='1'`), pokud terminál nezobrazuje češtinu správně.

```sh
python scripts/post-knowledge.py status
python scripts/post-knowledge.py catalog --offset 0 --limit 100
python scripts/post-knowledge.py tags --query filozof
python scripts/post-knowledge.py tags --kind theme
python scripts/post-knowledge.py search --query "slabé vazby pracovní příležitosti" --limit 8
python scripts/post-knowledge.py search --tags aristotle --limit 20
python scripts/post-knowledge.py show --ids 9,82
```

`status` lokálně prověří pokrytí všech článků, schéma a aktuálnost otisků, ale vypíše jen stav. `catalog` vypisuje unikátní poznatky v kompaktních řádcích `ID článků / idea / point`; úplnější JSONL poskytne `--details`. Projdi všechny stránky až do počtu `ideas` v hlavičce, ne pouze první dávku. Useknutý výstup přečti v menší dávce. V rámci téhož úkolu lze již přečtený katalog znovu použít při nezměněném `snapshot`; samotný otisk nenahrazuje jeho přečtení.

`search` prohledává lokálně celý dataset: pointy, titulky, obsah i alternativní názvy tagů; nikdy ho neomezuje na jednu zobrazovací kategorii. Vrací jen omezený počet stručných kandidátů a seskupuje známé duplicity. Používá shodu slov, krátkých prefixů a tagů, nikoli jazykový model či embeddingy. Skóre je pořadí kandidátů, ne pravděpodobnost duplicity. Proto nenahrazuje porovnání s celým kompaktním katalogem. Slova lze zadat i v dalším přeformulování.

## Nové příspěvky

Plán a závěrečné schválení jsou pracovní redakční záznamy, které agent vyplňuje v rámci zadané tvorby. Nevyžadují další potvrzení uživatelem ani samostatný schvalovací dialog.

1. Spusť `status`. Pokud něco chybí nebo zastaralo, nejprve dokonči potřebnou významovou kontrolu. Potom přečti celý kompaktní katalog; **není nutné znovu číst celé nezměněné ověřené články**.
2. Před psaním navrhni `knowledge` a kategorii. Použij existující tagy. Hledej příbuzné poznatky různými formulacemi a otevři jejich plné texty pomocí `show`. Stejný mechanismus v jiném příběhu vyřaď; nové články porovnej také mezi sebou.
3. Zapiš plán s aktuálním `snapshot`, potvrzením přečteného katalogu a jednotlivými rozhodnutími:

```json
{
  "snapshot": "otisk ze statusu",
  "catalog_reviewed": "stejný otisk po skutečném přečtení celého katalogu",
  "proposals": [
    {
      "id": "897",
      "category": "filozofie",
      "knowledge": {
        "idea": "idea-897",
        "point": "Konkrétní samostatný a dosud nepokrytý poznatek, který bude článek skutečně vysvětlovat.",
        "tags": ["ethics", "decision-making"],
        "type": "theory"
      },
      "compared_ids": ["876"],
      "reason": "Konkrétní vysvětlení rozdílu proti přečtenému nejbližšímu textu, nikoli pouhé jiné jméno nebo příklad.",
      "verdict": "accept"
    }
  ]
}
```

Jde o ukázku formátu, nikoli o předem schválený námět. ID vždy odvoď od skutečného maxima. Prázdné `compared_ids` použij jen tehdy, když po dokončeném porovnání opravdu není blízký text; vysvětli to v `reason`.

```sh
python scripts/post-knowledge.py check-plan --plan reports/plan.json
```

4. Napiš články obvyklým způsobem s ověřením zdrojů a úplnými ilustračními metadaty. Pracovní JSON návrhu má šest běžných polí plus objekt `knowledge` z plánu. Pokud používáš explicitně autorizované API, `npm run generate -- --plan reports/plan.json --output reports/drafts.json` pošle jen příslušné plánované pointy a použité tagy, nikoli celý dataset; výstup ukládá pouze do nového souboru v `reports/`. Použití tohoto nástroje samo neautorizuje placená API volání.
5. Spusť kontrolu hotových návrhů. Porovnej finální pointy s textem, kandidáty i ostatními návrhy a ověř zdroje. Výsledek skriptu není významové schválení.

```sh
python scripts/post-knowledge.py check-drafts --drafts reports/drafts.json
```

6. Zapiš závěrečné rozhodnutí se `snapshot` a `drafts_hash` vrácenými kontrolou:

```json
{
  "snapshot": "aktuální otisk",
  "catalog_reviewed": "otisk přečteného úplného katalogu",
  "drafts_hash": "otisk přesných hotových návrhů",
  "decisions": [
    {
      "id": "897",
      "verdict": "accept",
      "compared_ids": ["876"],
      "reason": "Konkrétní odlišný poznatek po porovnání finálního článku s blízkými plnými texty.",
      "final_text_reviewed": true,
      "within_batch_reviewed": true,
      "sources_verified": true
    }
  ]
}
```

```sh
python scripts/post-knowledge.py append --drafts reports/drafts.json --approval reports/approval.json
```

`append` odmítne známé shodné `idea`, identickou pointu pod jiným ID, opakování v dávce, neplatné tagy, chybné články a zastaralé rozhodnutí. Nemůže odhalit všechny významové parafráze; jejich kontrola patří editorovi. Zapíše články **bez** pracovního `knowledge`, významová data rozdělí do registrů a uloží kontrolní stav. Původní objekty článků zachová. Nejde o publikaci ani generování obrázků. Při přerušení mezi zápisy více souborů se stav musí znovu ověřit a opravit z uchovaného návrhu/rozhodnutí; neignoruj neúplný index.

Při běžném přidání nových postů poté pokračuj ilustracemi pro nová ID, jejich registrací v kartách a galerii, projektovými kontrolami a běžícím lokálním testem podle [faakt-create-posts](../skills/faakt-create-posts/SKILL.md). Tyto kroky jsou součástí zadání a nevyžadují další potvrzení; výslovné omezení pouze na návrhy či JSON má přednost. Samotná oprava významových souborů existujících článků není důvod znovu generovat jejich obrázky nebo měnit ilustrační metadata.

## Oprava změněných metadat

```sh
python scripts/post-knowledge.py review-batch --limit 12
python scripts/post-knowledge.py review-batch --ids 9,82 --limit 12
```

Výstup obsahuje celé texty pouze chybějících, změněných nebo explicitně vybraných článků a jejich `source_hash`. Po přečtení připrav JSON pole:

```json
[
  {
    "id": "9",
    "source_hash": "přesný otisk z review-batch",
    "verdict": "verified",
    "reason": "Konkrétní potvrzení nebo vysvětlení změny pointy a tagů podle celého článku.",
    "knowledge": {
      "idea": "idea-9",
      "point": "Rozpor mezi přesvědčením a jednáním může člověk zmírňovat změnou vlastního postoje místo přijetí nepříjemného rozporu.",
      "tags": ["social-psychology", "cognitive-biases", "identity"],
      "type": "principle"
    }
  }
]
```

```sh
python scripts/post-knowledge.py apply-review --review reports/review.json
python scripts/post-knowledge.py apply-review --review reports/review.json --write
```

Výchozí režim je náhled. Příkaz upravuje jen významové soubory a kontrolní stav, nikoli články. Změna společné pointy vyžaduje sladění všech článků přiřazených ke stejnému poznatku. Ověření se zneplatní při změně titulku, textu, kategorie, zdrojů, přiřazených metadat nebo významu používaného tagu. Pouhá změna obrázku, přidání alternativního názvu či nesouvisejícího tagu znovučtení článku nevyžaduje.

## Výchozí pokrytí a kontroly

Doplněno 796 článků, 753 různých poznatků a 163 řízených tagů. Podkladem bylo úplné čtení zaznamenané při posledním generování, shodný otisk nynějších textů a nově kurátorované pointy a klasifikace v `reports/knowledge-backfill.tsv`. Nejde o nové ověření všech historických faktů. Pro původní známé duplicity i nově srovnané dvojice 86/90 a 495/846 je použit společný poznatek. Přiřazení není prohlášením, že již byly vyčerpávajícím způsobem nalezeny všechny staré duplicity.

Skript odstraňuje opakované předky tagů, validuje registr, hashe, úplnost a konzistenci. Není zdrojem úsudku o významu. Backfill ani následná práce nepoužívají AI API, externí služby či placené embeddingy. Stručný katalog má 87 565 znaků proti 628 377 znakům titulků a textů: přibližně o 86 % méně znaků, nikoli měřených tokenů. Aktuální počty a velikosti vždy vypočte `status`.

`npm test` zahrnuje skutečný dataset, kontrolu zastarávání, hledání přes aliasy, seskupování duplicit a odmítání neplatných či zastaralých zápisů. `npm run build` ověří statické zabalení samostatných souborů.
<!-- Explicitní výjimka pro uživatelem zadané doplnění číselné mezery. -->
Pokud uživatel výslovně požádá vyplnit chybějící ID, má tento požadavek přednost před výchozím pokračováním nad maximem. Ověř aktuální volná ID a použij je vzestupně; příkazy `check-plan`, `check-drafts` a `append` v `scripts/post-knowledge.py` v takovém případě vyžadují výslovné `--fill-gaps`. Režim neumožňuje přepsat existující ID ani přeskočit první volné ID. Bez této volby zůstává dosavadní pravidlo maxima + 1. Obsahové kontroly, zdroje a redakční schválení platí beze změny.
