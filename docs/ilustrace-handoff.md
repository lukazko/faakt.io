# Ilustrační systém faakt.io — kompletní popis

Dokument pro vývojového agenta, který má systému porozumět a navrhnout úpravy.
Stav k 23. 10. 2026, branch `feat/ilustrace-rozmanitost`, verze 0.6.0-beta.

Systém má **jedinou kreslicí vrstvu** — geometrickou. Analýza textu, metadata
předmětů, palety a PRNG jsou její součásti. Klasická vrstva byla odstraněna;
v kapitole 12 je zaznamenáno, co a proč zmizelo.

**Tento soubor je závazný popis aktuálního stavu.** Každá změna ilustrací,
palety, motivů, kompozic, rendereru nebo vývojové galerie musí ve stejném
commitu aktualizovat i tento dokument — počty, tabulky, mapování a testy.

## 0. Shrnutí v pěti bodech

1. Ilustrace nejsou obrázky ani assety. Jsou to **SVG scény složené z primitiv**
   (`rect`, `circle`, `ellipse`, `line`, `path`, `polyline`), které se generují
   čistě v JS při renderu.
2. Vrstva je **deterministická**: seed je ID příspěvku, stejný příspěvek vždy
   vykreslí stejnou scénu — na serveru, v prohlížeči i mezi buildy.
3. O výběru rozhoduje **analýza českého textu** (titulku a obsahu) přes 88
   předmětů s kmeny slov, skóre a vazbou na kategorii. Kategorie je záchranná
   síť, ne hlavní rozhodnutí.
4. Analýza vybírá z **65 analytických rodin**; geometrická vrstva jich používá
   **7 scén**, **52 kreslených motivů** a **8 kompozičních vzorů**. Mapování je
   v `geometric/mapping.js`, vztah objektů v `geometric/composition.js`.
5. Ilustrace je dekorativní (`aria-hidden`, `pointer-events: none`), sedí ve
   flexu pod textem karty a na nízkém viewportu se skrývá.

---

## 1. Mapa souborů

```
src/lib/illustrations/
├── index.js                 # jediné veřejné rozhraní knihovny
├── subjects.js              # 88 předmětů: metadata a klíčová slova (bez kreslení)
├── validate.js              # validateElements(), boundsOf() pro testy a galerii
├── palettes.js              # palety kategorií, materiálové barvy, mixHex
├── primitives.js            # rect, circle, ellipse, line, path, polyline,
│                            # polygon, group, arcPath, tick
├── prng.js                  # FNV-1a hash + Mulberry32, clamp, lerp, round
├── analysis/
│   └── analyze.js           # analyzePost, scoreMotifs, detectChronology,
│                            # explainSelection, normalizeText, wordsOf, countHits
└── geometric/
    ├── index.js             # createGeometricIllustration()
    ├── scenes.js            # 7 scén × 8 kompozičních vzorů
    ├── heroes.js            # 52 kreslicích funkcí motivů
    ├── mapping.js           # 65 rodin → 7 scén, aliasy předmětů
    ├── composition.js       # volba vzoru (dělení, konfrontace, proměna…)
    ├── refine.js            # zpřesnění obecného motivu podle textu
    ├── palette.js           # GEOMETRIC_COLORS, geometricPalette, stroke, shape
    ├── seed.js              # deriveSeed()
    └── constants.js         # VIEWBOX 320 × 180
```

Doplňující soubory:

| Soubor | Role |
|---|---|
| `src/lib/components/PostIllustration.svelte` | Jediný renderer: spec → SVG. Používá ho feed i galerie. |
| `src/routes/dev/illustrations/+page.svelte` | Vývojová galerie: prototyp, laboratoř, všech 7 scén, 8 kompozičních vzorů, reálné příspěvky, palety. |
| `src/routes/dev/illustrations/prototype-cases.js` | 14 ručně vybraných reálných příspěvků pro prototyp. |
| `tests/analysis.test.mjs` | Testy analýzy textu a metadat předmětů. |
| `tests/geometry.test.mjs` | Testy scén na všech 766 příspěvcích, zlaté otisky, determinismus, paleta, čistota modulů. |

Všechny moduly v `src/lib/illustrations/` jsou **čisté** — žádné Svelte, žádný
DOM, žádný `fetch`, žádné volání LLM. Díky tomu běží přímo v Node testech.

---

## 2. Datový tok

```
posts.json (766 příspěvků)
   │
   ├─ post.id ─────────────────────────────► deriveSeed() → "id:027"
   │
   ├─ post.title + content + category ────► analyzePost()
   │                                           │
   │                                           ├─ scoreMotifs()      88 předmětů × kmeny slov
   │                                           ├─ detectChronology() časová osa
   │                                           ├─ ABSTRACT_TAGS      abstraktní rodiny
   │                                           └─ CATEGORY_FALLBACK  poslední záchrana
   │                                           ▼
   │                            { family, subject, supports, concept, reason, scores }
   │
   ├─ family ─────────────────────────────► geometricFamilyFor()  mapování 65 → 7
   ├─ subject ────────────────────────────► resolveSubject()      alias + validace
   │                                        └─ refineSubject()    konkrétnější motiv
   ├─ title + content ────────────────────► chooseComposition()  8 vzorů vztahu
   └─ category ───────────────────────────► geometricPalette()    accent kategorie
                                             │
                                             ▼
                              createGeometricIllustration({ post })
                                             │
                                             ▼
                        spec = { style, family, requestedFamily, seed, seedHash,
                                 category, variant, density, scale, balance,
                                 palette, subject, secondary, composition,
                                 elements: [...] }
                                             │
                                             ▼
                                 PostIllustration.svelte  →  <svg>
```

### Klíčové API

- `createGeometricIllustration({ post?, family?, subject?, seed?, category?, variant?, density?, scale?, balance?, composition? })`
  — **jediný vstup pro produkci**. Vrací spec s polem `elements`; `composition`
  lze vynutit (galerie/testy), jinak se odvodí z textu.
- `analyzePost(post)` → `{ family, subject, supports, concept, reason, scores }`.
- `explainSelection(post)` → totéž plus `subjectLabel` a `supportLabels`
  (používá galerie, v produkci se nevolá).
- `validateElements(elements)` → `{ ok, errors }`; kontroluje tvary, konečná
  čísla, opacity 0–1 a formát barev (`#hex`, `none`, `currentColor`).
- `boundsOf(elements)` → obdélník pokrytí scény.
- `deriveSeed(post)` → stabilní řetězec seedu.
- `geometricPalette(category)` → paleta scény s akcentem kategorie.
- `chooseComposition({ post, family, category })` → jeden z `COMPOSITION_KEYS`.
- `refineSubject(subject, post)` → konkrétnější motiv, nebo vstup beze změny.

Veřejné exporty shrnuje `src/lib/illustrations/index.js`; nic mimo něj by se
z knihovny importovat nemělo.

### Deterministický seed

`deriveSeed(post)` v `geometric/seed.js`:

- primárně `id:<post.id>` (trimované),
- jinak `meta:<kategorie>|<normalizovaný titulek>`,
- úplně bez vstupu `meta:fallback`.

PRNG je Mulberry32 nad FNV-1a hashem. Pořadí losování je pevné:
`variant → density → scale → balance`. Díky tomu změna jednoho parametru
nerozhodí ostatní a stejný příspěvek je identický v libovolném pořadí
vykreslení i mezi buildy.

| Parametr | Rozsah | Vliv |
|---|---|---|
| `variant` | 0–2 | jiné detaily motivu (zrcadlení busty, jiná záložka, počet vrstev) |
| `density` | 0,35–1 | měřítko `0,98 + density × 0,04` a počet vrstev u `layers` |
| `scale` | 0,9–1,1 | globální měřítko skupiny v rendereru |
| `balance` | −1…1 | vodorovný posun o ±6–8 px |

Ručně zadané parametry se vždy ořežou do mezí (`clamp`), takže galerie ani
testy nemohou vyrobit scénu mimo rozsah.

---

## 3. Analýza textu

Zdroj: `analysis/analyze.js`. Pořadí je záměrně pevné a nic se nepřeskakuje.

### 3.1 Normalizace

`normalizeText(value)`:

1. odstraní HTML tagy (nahradí mezerou),
2. rozloží diakritiku (`NFD`) a odstraní kombinační znaménka,
3. převede na malá písmena,
4. vše kromě `a–z0–9` nahradí mezerou a ořeže.

`wordsOf(value)` navíc zahodí slova kratší než 2 znaky, stoplist a duplicity —
opakování stejného slova nemá zvyšovat skóre.

Kmeny v metadatech končí hvězdičkou a chovají se jako prefix
(`knih*` odpovídá `kniha`, `knihy`, `knihou`…). Bez hvězdičky jde o přesnou
shodu. Kmeny se normalizují stejnou funkcí, takže diakritika v datech nevadí.

### 3.2 Skóre předmětů

`scoreMotifs(post)` projde všech 88 předmětů:

```
score = titleHits × 5 + min(contentHits, 4) × 1,2 + min(affinity, 3) × 0,35
```

- `titleHits` — kolik různých slov titulku odpovídá kmenům předmětu,
- `contentHits` — totéž pro obsah, zastropované na 4, aby dlouhý text
  nepřebil titulek,
- `affinity` — volitelná afinita předmětu ke kategorii (`categories`),
  zastropovaná na 3.

Třídění: skóre sestupně → předměty s rolí `subject`/`both` před `support` →
index v `SUBJECTS`. **Pořadí v `SUBJECTS` je proto závazné** — rozhoduje
remízy a nesmí se svévolně přeskládat.

### 3.3 Volba rodiny

Nejlepší předmět musí mít skóre **≥ 2,5** a roli `subject` nebo `both`.
Pak `chooseFamily()` vybere z `motif.families` tu rodinu, která má nejvyšší
afinitu ke kategorii (`FAMILY_CATEGORY_AFFINITY`); při shodě rozhoduje pořadí
v `families`.

Doplňky (`supports`): další předměty se skóre ≥ 1,2, rolí `support`/`both`
a stejnou rodinou, maximálně `maxSupports` (výchozí 2, `0` doplňky zakáže).
Geometrická vrstva z `supports` odvodí `spec.secondary` (první doplněk, který
po aliasu a zpřesnění není stejný jako hlavní motiv), ale **do scény ho zatím
nekreslí** — ilustrace má nést jednu myšlenku. Pole zůstává v analýze pro
galerii a budoucí rozšíření.

### 3.4 Chronologie

`detectChronology(post)` pustí časovou osu jen tehdy, když je v textu skutečně
silná:

- `title-time` — časový marker přímo v titulku (`rok*`, `stoleti*`, `vladl*`…),
- `title-year` — letopočet (3–4 číslice) v titulku **a** další chronologický
  signál v titulku nebo obsahu,
- `content-sequence` — signál v titulku, alespoň 3 v obsahu, z toho jeden
  časový marker, a kategorie z `historie`/`politika`/`filozofie`/`literatura`.

Samotné slovo „válka“ nebo „vznik“ časovou osu neospravedlní; samotný letopočet
v obsahu také ne. Rosettská deska je proto `relic`, ne `timeline`.

### 3.5 Abstraktní rodiny

Když text nemá konkrétní předmět, zkusí se **33 abstraktních rodin**
(`ABSTRACT_TAGS`): `network`, `signals`, `layers`, `structure`, `contrast`,
`organic`, `data`, `grid`, `orbit`, `radial`, `spiral`, `threshold`, `ascent`,
`descent`, `waves`, `scatter`, `convergence`, `divergence`, `lattice`,
`fracture`, `pulse`, `meander`, `constellation`, `monolith`, `arch`, `mosaic`,
`pendulum`, `echo`, `mirror`, `cascade`, `horizon`, `weave`, `vortex`.
Skóre je `titleHits × 5 + min(contentHits, 4) × 1,2` a práh opět 2,5.
`timeline` tu záměrně není — patří jen chronologii.

### 3.6 Fallback

1. `CATEGORY_FALLBACK` podle kategorie (14 kategorií, každá má výchozí rodinu
   i předmět),
2. jinak `structure` s `subject: null`.

`analyzePost(null)` nikdy nevyhazuje; vrací `structure` s prázdnými poli.

### 3.7 Příklady

| Příspěvek | family | subject |
|---|---|---|
| Bratři Grimmové a pohádky (literatura) | `storybook` | `book`, supports `wolf`, `forest` |
| Sokrates a umění klást otázky (filozofie) | `portrait` | `bust` |
| Rosettská deska (historie) | `relic` | `stele` |
| Entropie a šipka času (fyzika) | `metaphor` | `entropy` |
| Síť neuronů a algoritmus (filozofie) | `network` | — |
| Rok 1066 a změny v dějinách (historie) | `timeline` | — |
| Neutrální titulek (ekonomie) | `metaphor` | `balance` |

---

## 4. Metadata předmětů (88)

`subjects.js` obsahuje **jen metadata** — žádné kreslicí funkce:

```js
{
  key: 'book',
  label: 'Otevřená kniha',
  note: 'literatura, příběhy, pohádky, eposy',
  role: 'subject' | 'support' | 'both',
  families: ['storybook', ...],
  tags: ['knih*', 'pohadk*', ...],       // kmeny, * = prefix
  categories: { literatura: 3 },         // volitelná afinita
  maxSupports: 0                          // volitelné: zakáže doplňky
}
```

Rozložení rolí: 45 × `subject`, 7 × `support`, 36 × `both`.
Soubor exportuje `SUBJECTS`, `SUBJECT_BY_KEY`, `SUBJECT_KEYS`.

Předměty jsou řazené symbolické (45) a poté základní (43) — toto pořadí je
součást chování, viz 3.2.

---

## 5. Scény (7) a kompoziční vzory (8)

Zdroj: `geometric/scenes.js`, konstanta `SCENES`.

| Scéna | Výchozí motiv | Použití |
|---|---|---|
| `portrait` | `bust` | filozofie, psychologie, osobnosti |
| `discovery` | `flask` | věda, fyzika, astronomie, počítače |
| `storybook` | `book` | literatura, filmy |
| `relic` | `amphora` | historie, politika, artefakty |
| `metaphor` | `balance` | matematika, ekonomie, umění |
| `nature` | `tree` | zajímavosti, biologie, krajina |
| `layers` | `null` | abstraktní texty, chronologie, geologie |

Scéna určuje **výtvarný jazyk a výchozí motiv**. Nad ním stojí kompoziční
vzor, který určuje **vztah objektů**:

| Vzor | Co ukazuje | Kdy se vybere |
|---|---|---|
| `single` | jeden motiv na podstavci | výchozí; `layers`; text bez vztahového signálu |
| `split` | dvě poloviny, trhlina a zlomený podstavec | dělení, rozkol, fragmentace, puklina |
| `confrontation` | dva motivy proti sobě přes přerušovanou hranici | válka, bitva, spor, revoluce, souboj |
| `transformation` | obrys vlevo, plná forma vpravo, šipka | proměna, vývoj, vznik, přechod |
| `growth` | tři stupně větší a výš na stoupající linii | růst, expanze, vzestup, pokrok |
| `collapse` | tři stupně padají, rotují a ztrácejí barvu | pád, úpadek, kolaps, zánik |
| `connection` | dva motivy spojené přerušovanou drahou | spojení, vztah, dialog, spolupráce |
| `contrast` | obrys a plná forma přes svislou osu | paradox, protiklad, rozdíl, dilema |

`single` kreslí **jednu vodorovnou linku podstavce** (`baseline`, y ≈ 150–152,
opacity 0,24) + **jeden hlavní motiv** vycentrovaný na `x = 160 ± balance`,
s měřítkem 1,05–1,22 a svislým posunem podle typu motivu. Dynamické vzory
skládají dvě nebo tři kopie téhož motivu (`group` s jiným měřítkem, rotací
a opacitou), přidají jednu až tři linky a maximálně tři doprovodné částice.
Žádná dekorace navíc.

Volba je deterministická (`composition.js`): titulní shoda má váhu 5,
obsahová 1,2; obsah musí sám dodat alespoň čtyři různá slova. Konkrétnější
význam vyhrává (`split` před `confrontation` atd.). Konfrontace se navíc
povoluje jen v rodinách `portrait/relic/metaphor/storybook` a v kategoriích
`historie/politika/filozofie/literatura/filmy/umeni`, aby se vojenská
metafora nevnucovala každé vědecké zprávě. `layers` zůstává vždy `single`.

`layers` kreslí krajinný řez: dvě pevniny nad horizontem, linku horizontu, dvě
šipky mířící od sebe, 4–5 vrstev pod povrchem a zlom. Ignoruje předmět — jde
o abstraktní text, ne o konkrétní věc.

`GEOMETRIC_FAMILY_KEYS` je odvozené z `Object.keys(SCENES)`; pořadí je
`portrait, discovery, storybook, relic, metaphor, nature, layers`.

---

## 6. Kreslené motivy (52)

Zdroj: `geometric/heroes.js`, konstanta `HEROES`.

`bust`, `flask`, `telescope`, `book`, `amphora`, `column`, `tree`, `octopus`,
`balance`, `brain`, `palette`, `polyhedron`, `film`, `gear`, `clock`, `atom`,
`planet`, `star`, `comet`, `galaxy`, `blackhole`, `rocket`, `moon`, `entropy`,
`throne`, `stele`, `temple`, `ruin`, `explosion`, `wall`, `knot`, `dna`, `bird`,
`sun`, `heelix`, `crown`, `sword`, `crowd`, `scroll`, `hand`, `eye`, `heart`,
`flame`, `microscope`, `map`, `coin`, `infinity`, `figure`, `wind`, `bolt`,
`mountain`, `snowflake`.

Nové motivy vznikly tam, kde analýza už rozlišovala předmět, ale geometrie ho
slévala do obecného tvaru: astronomie (`comet`, `galaxy`, `blackhole`, `rocket`,
`moon`, `star`), abstrakce (`entropy`, `knot`), historie (`throne`, `stele`,
`temple`, `ruin`, `wall`) a biologie (`dna`, `bird`). Každý má vlastní
siluetu, ne jen jinou barvu obecného tvaru.

Každá funkce dostane kontext `{ palette, variant, density, scale, balance, rand,
random }` a vrací pole primitiv v **lokálních souřadnicích kolem počátku**.
Umístění řeší `group()` ve scéně (`x`, `y`, `scale`, `rotate`, `flip`).

Kreslí se plochami v barvách `forest`, `forestDeep`, `teal`, `tealDeep`, `sage`,
`sageDeep`, `amber`, `terracotta`, `light`; obrysy jsou vždy světlé
(`p.light`). Barva kategorie (`p.accent`) se objevuje jen v drobných detailech:
šerpa busty, záložka knihy, pás sloupu, jádro mozku.

Příklady obsahu:

- `octopus` má explicitně **tři srdce** (odpovídá příspěvku o chobotnicích),
- `bust` je profil s vlasy, uchem a drapérií,
- `balance` jsou váhy, `clock` hodiny, `atom` tři eliptické dráhy,
- `tree`, `mountain`, `snowflake` jsou krajinné siluety.

**Pozor na `heelix`:** klíč je historický překlep. Zůstává kvůli zpětné
kompatibilitě, ale analýza i refine používají `dna` (stejná kreslicí funkce).
DNA texty se tak konečně dostanou k helixu.

---

## 7. Mapování analytických rodin a předmětů

Zdroj: `geometric/mapping.js`.

`analyzePost()` vrací jednu z 65 analytických rodin. Geometrická vrstva jich
zná sedm, zbytek se mapuje:

- `DEFAULT_SUBJECT` — sedm scén a jejich výchozí motiv,
- `FAMILY_FALLBACK` — např. `grid/data/timeline/network → layers`,
  `orbit/signals → discovery`,
  `structure/armory/throne/temple/ritual/monolith/arch → relic`,
  `storm/peak/snowfield/undergrowth/transformation → nature`,
  `rupture/decay/descent/lattice/meander/cascade/divergence/threshold → layers`,
  `crowd/gaze/silhouette → portrait`, `contrast → metaphor`.
  Neznámá rodina → `metaphor`.

`SUBJECT_ALIAS` překládá názvy předmětů na kreslené motivy:

`lawScroll→scroll`, `periodicTable→flask`, `altar→temple`,
`roots/leaf/forest→tree`, `cloud→wind`, `lightning→bolt`.

Aliasy zůstaly jen tam, kde jde o skutečně totéž (oltář je součást chrámu,
mrak a vítr sdílejí pohyb). Dřívější ztrátové aliasy (`throne→crown`,
`stele→column`, `entropy→clock`, `knot→infinity`, `bird→tree`) byly zrušeny —
tyto předměty mají vlastní motiv.

**Zpřesnění podle textu** (`refine.js`) se používá jen na obecný motiv a nikdy
nepřepíše konkrétní předmět z analýzy. Patnáct pravidel pokrývá případy, kdy
text mluví o konkrétní věci, ale analýza zná jen obecnější tvar: dalekohled →
kometa/galaxie/černá díra/raketa/Měsíc, hodiny → entropie, koruna → trůn,
sloup → chrám/stélé, baňka → DNA, amfora → zeď/armáda, meč → stroj, infinita →
uzel. Pravidla jsou krátká, deterministická a vysvětlitelná; každé má
`from` (kdy se smí použít) a `test` (jaká slova ho ospravedlní).

`resolveSubject(family, subject)` vrátí alias, pokud na něj existuje kreslicí
funkce; jinak výchozí motiv rodiny. `layers` dostane vždy `null`.

Neznámý předmět tedy nikdy neprojde a scéna nikdy nezůstane prázdná.

---

## 8. Paleta

`GEOMETRIC_COLORS` (`geometric/palette.js`) je fixní tmavá paleta postavená
na indigové hloubce, tealu a teplých akcentech:

```
bg         #0B0E17    forest     #27325F    forestDeep #151B38
teal       #1AA6B7    tealDeep   #0D6C80    sage       #8F97CE
sageDeep   #5C639C    amber      #F6B94A    terracotta #E96A4B
light      #F2E8D5
```

Historické názvy (`forest`, `sage`) zůstaly kvůli API a motivům, ale hodnoty
jsou přemapované: `forest` je nyní tmavě indigová, `sage` světle levandulová.
Zelená dominance zmizela; poměr modrého kanálu je u každé plochy vyšší než
u červeného a zeleného, takže scéna drží jednotný chladný základ a teplé
akcenty vynikají. Kontrast `light` vůči `bg` je větší než 8:1.

`geometricPalette(category)` přidá:

- `accent` = primární barva kategorie z `CATEGORY_PALETTES`,
- `accentSoft` = mix accent + forest (45 %),
- `accentPale` = mix accent + bg (55 %),
- `lightSoft` = mix light + sage (35 %),
- kompatibilitní role `primary` (= light), `secondary` (= amber), `dark`,
  `muted`, `soft`, `faint`.

**Kategorie neurčuje barvu objektu, jen identifikační akcent.** To je záměr —
dark mode drží jednotný indigovo-tealový jazyk, kategorie se pozná podle
detailu a teplý akcent (jantar, korál) nese pozornost. Neznámá kategorie
spadne na `#f59e0b`. Paleta má na scénu nejvýše tři až čtyři významné barvy;
nejde o duhu.

Pomocníci `stroke(color, sw, opacity)` a `shape(fill, stroke, sw)` vracejí
společné atributy, aby se motivy neopakovaly.

---

## 9. Renderer

`PostIllustration.svelte` je jediné místo, kde se ze specu stává SVG:

- `viewBox="0 0 320 180"`, `preserveAspectRatio="xMidYMid meet"`,
- `aria-hidden="true"`, `focusable="false"`, `pointer-events: none`,
- skupina `translate(160 90) scale(spec.scale) translate(-160 -90)` —
  globální měřítko kolem středu,
- `{#each spec.elements}` s větvemi pro `rect`, `circle`, `ellipse`, `line`,
  `path`, `polyline`; neznámý tvar se nevykreslí,
- `data-family={spec.family}` pro snadné ladění v DOM.

Komponenta umí dostat hotový `spec` (galerie, testy) nebo `post` a scénu si
vytvoří sama. Feed používá druhou cestu, takže galerie nikdy neobchází
produkční renderer.

---

## 10. Vývojová galerie

`/dev/illustrations` (prerenderovaná routa) slouží k vizuální kontrole:

1. **Prototyp** — 14 reálných příspěvků (`prototype-cases.js`), každý s vlastní
   rodinou a předmětem.
2. **Laboratoř** — volba scény, předmětu, varianty, hustoty, měřítka, balance
   a kompozice; čte všechny parametry včetně `composition` a `secondary`
   a ukazuje počet prvků i seed.
3. **Všech sedm scén** — každá se třemi seedy.
4. **Osm kompozičních vzorů** — stejná koruna ve všech vzorech, aby byl vidět
   rozdíl mezi motivem a vztahem.
5. **Skutečné příspěvky** — šest případů s vysvětlením výběru
   (`explainSelection`).
6. **Palety a hustota** — stejná scéna `metaphor` napříč kategoriemi
   a hustotou 0,35 → 1.

Galerie není součástí feedu, ale je součástí statického buildu. Pokud ji
nechceme na produkci, musí se vypnout v `+page.js` (`prerender = false`)
nebo přesunout mimo `src/routes`.

---

## 11. Testy

`npm test` spouští dva soubory, dohromady 32 testů:

### `tests/analysis.test.mjs`

- mapování 14 kategorií na výchozí rodinu a předmět,
- Grimm / Sokrates / Rosetta / entropie: správná rodina, předmět i doplňky,
- abstraktní síť vs. slabé klíčové slovo,
- chronologie: letopočet v titulku ano, faktický text ne,
- doplňky patří do vybrané rodiny a neopakují předmět,
- normalizace diakritiky, velikosti písmen a HTML,
- deterministický fallback pro `null` a neznámou kategorii,
- `explainSelection` odpovídá `analyzePost`,
- konzistence metadat 88 předmětů (role, rodiny, tagy, žádné `build`).

### `tests/geometry.test.mjs`

- **všech 766 příspěvků** vygeneruje validní scénu,
- **zlaté otisky** sedmi příspěvků: SHA-256 přes rodinu, předmět, parametry
  a elementy; chrání proti nechtěné změně kreslení,
- determinismus a nezávislost na pořadí vykreslení,
- aliasy předmětů a fallback na výchozí motiv,
- každý motiv ve všech scénách, každá scéna pro šest seedů,
- meze parametrů, ořezávání ručních vstupů, žádný text v elementech,
- paleta: akcent kategorie, stabilní `primary`, materiálové barvy, žádná
  zelená dominance, kontrast vůči pozadí,
- kompozice: determinismus, platné klíče, rozumné zastoupení (`single`
  u většiny, dynamické vzory u menšiny), dynamická scéna má více prvků,
- refine: textové signály vyberou konkrétní motiv, konkrétní předmět se
  nepřepíše,
- stabilita seedu z ID,
- čistota modulů: žádný `fetch`, žádné `anthropic|openai|generat`.

Zlaté otisky se při záměrné změně kreslení přepočítají ručně a v commitu se
vysvětlí proč. Bez toho je test bezcenný.

---

## 12. Historie refaktoru (co zmizelo)

Před refaktorem existovaly dvě paralelní vrstvy. Klasická vrstva dodávala
analyzu a metadata, ale její kreslení se v produkci nepoužívalo — přesto se
kvůli importům dostávalo do klientského bundlu.

Odstraněno:

| Soubor | Co obsahoval |
|---|---|
| `scenes.js` | 65 rodin, 34 abstraktních builderů, `validateElements`, `VIEWBOX` |
| `abstract-extra.js` | 24 abstraktních rodin |
| `semantic-scenes.js` | 6 sémantických kompozic |
| `symbolic-scenes.js` | 25 symbolických kompozic |
| `motifs.js` | 43 motivů včetně kreslicích funkcí |
| `motifs-symbolic.js` | 45 symbolických motivů včetně kreslení |
| `select.js` | `selectIllustration`, `createIllustration`, `deriveSeed` |
| `concepts.js` | analýza textu (přesunuta do `analysis/analyze.js`) |
| `geometric.js` | monolitická geometrická vrstva (rozřezána do `geometric/`) |
| `tests/illustrations.test.mjs`, `tests/geometric.test.mjs` | nahrazeny novými testy |

Zachováno a přesunuto:

- analýza textu beze změny chování → `analysis/analyze.js`,
- metadata 88 motivů bez kreslení, ve stejném pořadí → `subjects.js`,
- mapování rodin a předmětů → `geometric/mapping.js`,
- palety, primitiva a PRNG beze změny,
- `validateElements` a `boundsOf` → `validate.js`.

Ověření: snapshot všech 766 příspěvků (rodina, předmět, parametry, hash
elementů) byl před refaktorem a po něm **bitově shodný**. Klasická kreslicí
větev už není v klientském bundlu; největší JS chunk klesl z přibližně
196 kB na 72 kB.

---

## 13. Jak systém rozšířit

**Nový kreslený motiv**

1. Přidej funkci do `geometric/heroes.js` a zaregistruj ji v `HEROES`.
2. Pokud ho má analýza umět vybrat, přidej metadata do `subjects.js`
   (stejný `key`) — jinak zůstane jen pro galerii.
3. Pokud má mít jiný název v analýze, přidej alias do `SUBJECT_ALIAS`.
4. Spusť `npm test`; zlaté otisky se nesmí změnit, dokud se nemění existující
   motivy.

**Nová scéna**

1. Napiš scénu v `geometric/scenes.js` a zaregistruj ji v `SCENES`.
2. Doplň `DEFAULT_SUBJECT` a případně `FAMILY_FALLBACK`.
3. Doplň popisek a kategorii do `SCENE_META`/`SCENE_CATEGORY` v galerii.
4. Ověř validitu pro všech 52 motivů.

**Nový kompoziční vzor**

1. Přidej renderer do `COMPOSERS` v `geometric/scenes.js` a klíč do
   `COMPOSITION_KEYS`.
2. Přidej popisek a poznámku do `COMPOSITION_META` a pravidlo do `RULES`
   v `geometric/composition.js` (pořadí = priorita).
3. Galerie si nový vzor vykreslí automaticky.
4. Ověř, že vzor funguje pro všechny motivy a že `boundsOf` zůstává v 320×180.

**Nové zpřesnění**

1. Přidej pravidlo do `REFINEMENTS` v `geometric/refine.js` s úzkým `from`
   a konkrétním `test`.
2. Ověř na skutečných příspěvcích, že se nespouští u nesouvisejícího textu.

**Nová kategorie**

1. Přidej pár barev do `CATEGORY_PALETTES`.
2. Přidej výchozí rodinu a předmět do `CATEGORY_FALLBACK`.
3. Doplň afinitu do `FAMILY_CATEGORY_AFFINITY`, pokud má kategorie táhnout
   k některé rodině.
4. Přidej barvu do `app.css` (`--cat-*`) — týká se badge, ne ilustrace.

**Změna existující scény**

Zlaté otisky v `tests/geometry.test.mjs` se musí přepočítat. Do commitu patří
vysvětlení, proč se vizuál mění.

---

## 14. Známá omezení

- **Většina scén zůstává `single`.** Dynamický vzor dostane jen přibližně
  šestina příspěvků (111 z 766). Je to záměr — vztah se nemá vnucovat textu,
  který žádný nemá — ale znamená to, že variabilita stojí hlavně na motivech.
- **Druhá kopie je vždy stejný motiv.** Konfrontace neumí postavit proti sobě
  dva různé předměty; `secondary` se do geometrie zatím nekreslí.
- **Refine je heuristika.** Patnáct pravidel pokrývá časté případy; méně
  obvyklý text zůstane u obecného motivu. Není to klasifikátor.
- **`heelix`** — překlep v klíči zůstává kvůli kompatibilitě; nový kód používá
  `dna` (viz 6).
- **`&amp;` v textu** se normalizuje na slovo `amp`; na skóre to nemá vliv,
  protože žádný kmen na `amp` neodkazuje.
- **Galerie je ve statickém buildu.** Je dostupná na produkční URL, dokud se
  nevypne.
