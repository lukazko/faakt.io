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
3. O výběru rozhoduje **analýza českého textu** (titulku a obsahu) přes 96
   předmětů s kmeny slov, skóre a vazbou na kategorii. Kategorie je záchranná
   síť, ne hlavní rozhodnutí.
4. Analýza vybírá z **65 analytických rodin**; geometrická vrstva jich používá
   **7 rodinných scén**, **92 kreslených motivů**, **8 kompozičních vzorů**
   a **48 sémantických scén** — celkem **62 typů scén**. Mapování je
   v `geometric/mapping.js`, vztah objektů v `geometric/composition.js`,
   významová pravidla v `geometric/selection.js`.
5. Ilustrace je dekorativní (`aria-hidden`, `pointer-events: none`), sedí ve
   flexu pod textem karty a na nízkém viewportu se skrývá.

---

## 1. Mapa souborů

```
src/lib/illustrations/
├── index.js                 # jediné veřejné rozhraní knihovny
├── subjects.js              # 102 předmětů: metadata a klíčová slova (bez kreslení)
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
    ├── selection.js         # 48 sémantických scén: význam textu → scéna
    ├── scenes.js            # 7 rodin + 8 kompozic + 48 sémantických scén
    ├── heroes.js            # 92 kreslicích funkcí motivů
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
| `scripts/audit-illustrations.mjs` | Deterministický audit všech příspěvků: scény, motivy, strukturální otisky, fallbacky, varování, regresní případy, srovnání s baseline. |
| `tests/analysis.test.mjs` | Testy analýzy textu a metadat předmětů. |
| `tests/geometry.test.mjs` | Testy scén na všech 766 příspěvcích, zlaté otisky, determinismus, paleta, čistota modulů. |
| `tests/selection.test.mjs` | Regresní testy sémantického výběru: pět zadaných příkladů a třídy chyb z auditu. |

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
   │                                           ├─ scoreMotifs()      102 předmětů × kmeny slov
   │                                           ├─ detectChronology() časová osa
   │                                           ├─ ABSTRACT_TAGS      abstraktní rodiny
   │                                           └─ CATEGORY_FALLBACK  poslední záchrana
   │                                           ▼
   │                     { family, subject, supports, concept, reason, scores }
   │                                           │
   │                                           ▼
   │                                  selectScene()   48 sémantických pravidel
   │                                           │      (požár knihovny, čas,
   │                                           │       písmo, stroj, plavba…)
   │                                           ▼
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
                        spec = { style, family, requestedFamily, scene, sceneGroup,
                                 seed, seedHash, category, variant, density, scale,
                                 balance, palette, subject, secondary, composition,
                                 reason, elements: [...] }
                                             │
                                             ▼
                                 PostIllustration.svelte  →  <svg>
```

### Klíčové API

- `createGeometricIllustration({ post?, family?, subject?, secondary?, scene?, seed?, category?, variant?, density?, scale?, balance?, composition? })`
  — **jediný vstup pro produkci**. Vrací spec s polem `elements`; `scene`
  a `composition` lze vynutit (galerie/testy), jinak se odvodí z textu.
  `secondary` je určený jen pro galerii a testy; v produkci ho dodá analýza
  nebo sémantická scéna.
- `analyzePost(post)` → `{ family, subject, supports, concept, reason, scores }`.
- `selectScene({ post, analysis, family, category })` → `{ scene, subject, secondary, reason }`
  nebo `null`; čistě deterministická pravidla bez sítě a LLM.
- `SCENE_TYPES` → všech 62 typů scén s `{ key, group, label, note }`, kde
  `group` je `family`, `composition` nebo `semantic`.
- `SEMANTIC_SCENE_KEYS` → 48 klíčů sémantických scén v pořadí priorit.
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

`scoreMotifs(post)` projde všech 102 předmětů:

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
po aliasu a zpřesnění není stejný jako hlavní motiv). Sémantické scény si
`secondary` určují samy a kreslí ho jako druhý objekt; kompozice ho použijí,
jen když dává smysl (např. `split` kreslí druhou polovinu z `secondary`).
Osamocená `single` scéna zůstává jeden motiv.

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

## 4. Metadata předmětů (102)

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

Rozložení rolí: 57 × `subject`, 7 × `support`, 38 × `both`.
Soubor exportuje `SUBJECTS`, `SUBJECT_BY_KEY`, `SUBJECT_KEYS`.

Předměty jsou řazené symbolické a poté základní — toto pořadí je součást
chování, viz 3.2. Nové předměty se proto přidávají na konec, ne doprostřed.

Mezi novější patří `machine`, `ship`, `library`, `script`, `compass`, `loom`,
`lyre`, `tower`, `key`, `hourglass`, `labyrinth`, `wolf`, `castle`, `sprout`,
`flower`, `butterfly`, `shield`, `quill`, `magnifier`, `candle`, `torch`,
`volcano`, `rain`, `thread`, `cycle`, `laurel`, `cat`, `mushroom`, `cocoon`,
`crack` a `glacier`. Vznikly z auditních tříd textů, které dosud končily
u obecného motivu (obchod, písmo, tkaní, obléhání, přírodní procesy).
Nejnovější přírůstky z feedbacku jsou `mirror`, `elephant`, `car`, `chart`,
`banana` a `numeralOne`; každý má vlastní kreslicí funkci a úzké kmeny slov,
aby se nepletl s obecnými texty.

---

## 5. Scény (7 + 8 + 48) a kompoziční vzory

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

### 5.1 Sémantické scény (48)

Zdroj: `geometric/selection.js` (pravidla) a `geometric/scenes.js` (kreslení).
Rodina odpovídá na „jaký jazyk“, kompozice na „jaký vztah“, sémantická scéna
na „co se v textu skutečně děje“. Pravidla jsou seřazená podle priority
a první shoda vyhrává; každé vrací `{ scene, subject, secondary, reason }`.

| Scéna | Hlavní objekt + doplněk | Kdy se vybere |
|---|---|---|
| `bookFire` | knihovna/kniha + plamen, létající listy | požár knihovny nebo knihy |
| `timeFigure` | postava + hodiny, přerušovaný oblouk | člověk a jeho vztah k času |
| `writing` | písmo/stélé + loď nebo pero | písmo, abeceda, šíření znaků |
| `disruption` | stroj + zaniklý motiv, šipka | inovace nahrazuje starý svět |
| `solarSystem` | Slunce ve středu + oběžnice | Slunce a planety v jednom textu |
| `voyage` | loď + vlny, trasa, kompas | plavba, obchod, námořní cesta |
| `mechanism` | stroj + ozubené kolo, šipka | stroj, vynález, mechanismus |
| `laboratory` | baňka + mikroskop, stůl | laboratoř, experiment, výzkum |
| `theatre` | maska + film, světelné kužely | divadlo, inscenace, film |
| `mapScene` | mapa + trasa, kompas | mapa, objevování, navigace |
| `labyrinth` | bludiště + postava, klíč, nit | bludiště a rozhodnutí |
| `metamorphosis` | kukla → motýl, šipka | proměna, metamorfóza |
| `seedGrowth` | klíček → strom, stoupající linie | klíčení a růst (musí být proces) |
| `procession` | dav + pochodeň, šipka | pochod, demonstrace, shromáždění |
| `siege` | hrad/hradba + štít, šípy | obléhání, válka o pevnost |
| `monument` | věž/chrám + malá postava, slunce | architektura a měřítko člověka |
| `ritual` | svíčka + dva chrámy, kruh | obřad, ritus, bohoslužba |
| `weave` | stav + pásy látky, nit | tkaní, textil, tradice |
| `measurement` | kompas + hodiny, stupnice | měření času i prostoru |
| `orbitCycle` | prstenec + přesýpací hodiny, body | cykly, návraty, období |
| `observatory` | dalekohled + konkrétní těleso, záměrná linie | pozorování oblohy |
| `celestial` | jedno nebeské těleso + dráha, hvězdy | těleso je hlavní objekt titulku |
| `mirrorScene` | oválné zrcadlo + dvě ruce, čárkovaná osa | zrcadlo a převrácení stran v textu |
| `parable` | slon + pozorovací body a pohledy | podobenství o slepcích a slonovi |
| `codex` | sloup + pergamen přes sebe | nejstarší zákoník, právo a zákon |
| `response` | skupina lidí + dvě šipky a zpětná vazba | reakce lidí na pravidla a pobídky |
| `digits` | číslice 1 + klesající sloupce | Benfordův zákon a rozdělení prvních číslic |
| `crash` | osy + klesající křivka a sloupce | burzovní krach a propad |
| `compression` | velký objekt → malý objekt, oblouk | komprese a zmenšení téhož objektu |
| `spacecraft` | raketa + dráha a hvězdy | vesmírná loď, ne plachetnice |
| `artificial` | jeden stroj + signální oblouky | Turingův test a stroj, který komunikuje |
| `taxi` | auto + silnice a přerušovaná čára | taxík nebo auto jako nositelem textu |
| `alchemy` | baňka + jantarová kapka | zlato a rozpouštění kyselinou |
| `waveform` | osa + pravidelná vlna | symetrie, frekvence, pravidelné vlnění |
| `cosmicMusic` | planeta + nota, dráha | vesmír jako hudba a harmonie |
| `threeDoors` | tři dveře s otazníky | volba mezi třemi možnostmi |
| `division` | dvě skupiny postav + hranice | rozdělení lidí na role nebo skupiny |
| `atomIdea` | jeden atom, žádný přístroj | antická myšlenka atomu |
| `calendar` | mřížka dnů a zvýrazněný den | kalendář a přestupné roky |
| `powers` | číslice 1 s exponentem 2 | mocniny a imaginární čísla |
| `justice` | jediné váhy | spravedlnost mezi silným a slabým |
| `peaceFaith` | holubice + kříž | mír a víra, náboženský konflikt |
| `bacteria` | kolonie bakterií v kruhu | bakterie a mikrobi |
| `circleSquare` | kruh + čtverec | geometrické ideály a proporce |
| `inflation` | stoupající křivka a sloupce | růst cen a inflace |
| `decipherment` | stélé + dvě kolony znaků | rozluštění písma |
| `networkScene` | uzly + spojnice | sítě, internet, neurony |
| `ballot` | urna + hlasovací lístek | volby a hlasování |

Priorita je záměrná: konkrétní událost (požár, plavba, obléhání) předchází
obecnému tělesu a teprve potom rozhoduje rodina. Příklady regresí:
`754` → `disruption/machine`, `085` → `solarSystem/sun`, `199` →
`bookFire/library`, `417` → `timeFigure/figure`, `540` → `writing/script`,
`617` → `mirrorScene/mirror`, `176` → `parable/elephant`, `525` →
`codex/scroll`, `479` → `response/crowd`, `303` → `digits/numeralOne`.

Novější pravidla mají záměrně úzké podmínky, aby se nespustila na jediném
slově: zrcadlo vyžaduje `zrcadl*` („odraz“ sám je i odraz míče) a vynechává
optické přístroje; podobenství vyžaduje slona i slepce; zákoník vynechává
Rosettskou desku a hieroglyfy; stroj, který mluví, vyžaduje Turinga, robota
nebo umělou inteligenci, ne obecný program; komprese vyžaduje `kompres*`,
`huffman*` nebo `kodovan*`, takže „zkrátil válku“ ji nespustí; číslice
vyžadují Benforda nebo slovo „číslice“ v titulku. Negativní případy hlídají
testy (`023` odraz od mola, `516` válečný slon, `029/069/104` Rosettská
deska, `134` zkrácení války, `566` zrcadlo dalekohledu).

Třetí iterace zúžila pravidla stejně obezřetně: zlato se rozpouští jen
s kyselinou; vesmírná hudba chce hudbu i vesmír; tři dveře chtějí dveře
a pravděpodobnost; atom bez přístroje jen u antických filozofů; kalendář
chce kalendářní pojmy; spravedlnost chce spor silného a slabého; mír a víra
chtějí obojí; bakterie musí být v textu dvakrát a plíseň je vyloučena;
růst cen nesmí být burzovní propad; rozluštění musí zmínit písmo i jeho
luštění; síť chce dva síťové pojmy; volby chtějí volební slova. Nová
scéna `peaceFaith` má přednost před zákoníkem, `decipherment` před obecným
písmem a `bacteria` před laboratoří.

Text `003` (hvězda) je `celestial/star`, i když obsah zmiňuje dalekohled —
titulek jmenuje objekt, ne přístroj. Naopak `580` (měsíc Titanu) je
`celestial/moon`, protože spojení „sluneční soustava“ se do Slunce nepočítá.

---

## 6. Kreslené motivy (92)

Zdroj: `geometric/heroes.js`, konstanta `HEROES`.

Základní a symbolické motivy:

`bust`, `flask`, `telescope`, `book`, `amphora`, `column`, `tree`, `octopus`,
`balance`, `brain`, `palette`, `polyhedron`, `film`, `gear`, `clock`, `atom`,
`planet`, `star`, `comet`, `galaxy`, `blackhole`, `rocket`, `moon`, `entropy`,
`throne`, `stele`, `temple`, `ruin`, `explosion`, `wall`, `knot`, `dna`, `bird`,
`sun`, `heelix`, `crown`, `sword`, `crowd`, `scroll`, `hand`, `eye`, `heart`,
`flame`, `microscope`, `map`, `coin`, `infinity`, `figure`, `wind`, `bolt`,
`mountain`, `snowflake`.

Motivy přidané v rozšíření 0.6:

`machine`, `ship`, `library`, `tower`, `loom`, `mask`, `key`, `hourglass`,
`labyrinth`, `wolf`, `castle`, `sprout`, `flower`, `butterfly`, `shield`,
`quill`, `script`, `magnifier`, `compass`, `lyre`, `candle`, `torch`,
`volcano`, `rain`, `thread`, `cycle`, `laurel`, `cat`, `mushroom`, `cocoon`,
`crack`, `glacier`.

Motivy z iterace podle vizuálního feedbacku:

`mirror`, `elephant`, `car`, `banana`, `chart`, `numeralOne`. Vznikly tam,
kde dosavadní scéna mátla: zrcadlo místo knihy u textu o převrácení stran,
slon u podobenství, žluté auto u taxíku, banán s částicemi u radioaktivity,
klesající křivka u burzovního propadu a výrazná číslice 1 u Benfordova zákona.

Třetí iterace přidala `numeralTwo` pro exponenty a `bacterium` pro kolonii
buněk. Obě kresby jsou geometrické a používají stejné primitivy jako
ostatní motivy.

Nové motivy vznikly tam, kde analýza už rozlišovala předmět, ale geometrie ho
slévala do obecného tvaru: astronomie (`comet`, `galaxy`, `blackhole`, `rocket`,
`moon`, `star`, `glacier`), abstrakce (`entropy`, `knot`, `cycle`), historie
(`throne`, `stele`, `temple`, `ruin`, `wall`, `castle`, `tower`, `laurel`),
řemesla a obchod (`loom`, `thread`, `ship`, `compass`, `key`, `hourglass`),
písmo (`script`, `quill`, `library`), příroda (`sprout`, `flower`, `butterfly`,
`cocoon`, `mushroom`, `volcano`, `rain`, `cat`, `wolf`) a válka (`shield`,
`crack`). Každý má vlastní siluetu, ne jen jinou barvu obecného tvaru.

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
  `storm/peak/snowfield/undergrowth/transformation/flame → nature`,
  `rupture/decay/descent/lattice/meander/cascade/divergence/threshold → layers`,
  `crowd/gaze/silhouette/heart → portrait`,
  `contrast/clash/pulse/knot/hourglass/convergence/cycle → metaphor`,
  `celestial → discovery`.
  Neznámá rodina → `metaphor`.

`SUBJECT_ALIAS` překládá názvy předmětů na kreslené motivy:

`lawScroll→scroll`, `periodicTable→flask`, `altar→temple`,
`roots/leaf/branch/forest→tree`, `petal→flower`, `seed→sprout`,
`cloud→wind`, `lightning→bolt`, `chalice→amphora`, `helmet→shield`,
`knife→sword`, `scepter→crown`, `seal→scroll`, `eclipse→moon`.

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
3. **Sedm rodinných scén** — každá se třemi seedy.
4. **Sémantické scény** — všech 22 typů s typickým předmětem a doplňkem;
   popisky a poznámky jdou z `SEMANTIC_SCENE_META`, galerie je neduplikuje.
   Nadpis uvádí celkový počet `SCENE_TYPES` (36) a počet motivů (`HERO_KEYS`).
5. **Osm kompozičních vzorů** — stejná koruna ve všech vzorech, aby byl vidět
   rozdíl mezi motivem a vztahem.
6. **Skutečné příspěvky** — šest případů s vysvětlením výběru
   (`explainSelection`) a názvem zvolené scény.
7. **Palety a hustota** — stejná scéna `metaphor` napříč kategoriemi
   a hustotou 0,35 → 1.

Galerie není součástí feedu, ale je součástí statického buildu. Pokud ji
nechceme na produkci, musí se vypnout v `+page.js` (`prerender = false`)
nebo přesunout mimo `src/routes`.

---

## 11. Testy

`npm test` spouští tři soubory, dohromady 45 testů:

### `tests/analysis.test.mjs`

- mapování 14 kategorií na výchozí rodinu a předmět,
- Grimm / Sokrates / Rosetta / entropie: správná rodina, předmět i doplňky,
- abstraktní síť vs. slabé klíčové slovo,
- chronologie: letopočet v titulku ano, faktický text ne,
- doplňky patří do vybrané rodiny a neopakují předmět,
- normalizace diakritiky, velikosti písmen a HTML,
- deterministický fallback pro `null` a neznámou kategorii,
- `explainSelection` odpovídá `analyzePost`,
- konzistence metadat 102 předmětů (role, rodiny, tagy, žádné `build`).

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

### `tests/selection.test.mjs`

- pět zadaných regresí: inovace → `disruption/machine`, Slunce →
  `solarSystem/sun`, požár knihovny → `bookFire/library`, člověk a čas →
  `timeFigure/figure`, fénické písmo → `writing/script`;
- jedenáct případů z vizuálního feedbacku: zrcadlo, slon, zákoník, reakce,
  číslice, propad, komprese, stroj který mluví, vesmírná loď, taxík a banán;
- negativní případy nových pravidel: odraz od mola, zrcadlo dalekohledu,
  válečný slon, Rosettská deska, obecný program, zkrácení války a hodiny
  vracející se k jedničce;
- třetí iterace: třináct případů z feedbacku (zlato, vlnění, vesmírná hudba,
  tři dveře, rozdělení skupiny, antický atom, kalendář, mocniny, spravedlnost,
  mír a víra, bakterie, kruh a čtverec, růst cen) a tři nové vrstvy
  (rozluštění, síť, volby);
- negativní případy třetí iterace: virus ani plíseň nespustí bakterie,
  burzovní propad zůstane propadem a sémantických scén je alespoň 48;
- nebeská tělesa: Slunce nikdy jako Měsíc, Měsíc nikdy jako Slunce,
  hvězda v titulku před dalekohledem, Titan jako Měsíc i přes „sluneční soustavu“;
- hranice krátkých řetězců: „dna“ uvnitř „prázdná“ nesmí změnit motiv;
- „revoluční“ bez davu nesmí spustit pochod;
- `layers` zůstává bez motivu, volba je deterministická a nese `reason`;
- neutrální text bez specifické scény vrací `null`.

Zlaté otisky se při záměrné změně kreslení přepočítají ručně a v commitu se
vysvětlí proč. Bez toho je test bezcenný.

### Audit a diagnostika

`scripts/audit-illustrations.mjs` projde všech 766 příspěvků stejným kódem jako
produkce a vypíše:

- počty scén, motivů, kompozic, rodin a strukturálních otisků (bez barev,
  pozic, měřítka a rotace), včetně koncentrace nejčastějšího motivu,
- fallbacky podle kategorie a podíl na všech příspěvcích,
- varování tříděná po typech: `category-fallback`, `subject-not-in-text`,
  `sun-for-moon`, `moon-for-sun`, `instrument-over-object`,
  `ruin-for-abstract-decline`,
- regresní případy a jejich skutečný výsledek,
- srovnání s baseline (`--baseline`, `--write-baseline`).

Užitečné přepínače: `--top`, `--limit`, `--scene`, `--family`, `--show`,
`--json`, `--md`, `--rows`. Exit kód je nenulový, když některý regresní případ
selže. Aktuální stav: 62 scén, 75 použitých motivů, 208 strukturálních scén,
56 fallbacků (7,3 %), 94 varování, 5/5 regresí, entropie motivů 0,89.

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
- metadata motivů bez kreslení, ve stejném pořadí → `subjects.js`,
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

**Nová rodinná scéna**

1. Napiš scénu v `geometric/scenes.js` a zaregistruj ji v `SCENES`.
2. Doplň `DEFAULT_SUBJECT` a případně `FAMILY_FALLBACK`.
3. Doplň popisek a kategorii do `SCENE_META`/`SCENE_CATEGORY` v galerii.
4. Ověř validitu pro všech 92 motivů.

**Nová sémantická scéna**

1. Přidej kreslicí funkci do `SEMANTIC_SCENES` v `geometric/scenes.js`
   a popisek do `SEMANTIC_SCENE_META` (label + note).
2. Přidej pravidlo do `selectScene()` v `geometric/selection.js` na správné
   místo priority (konkrétnější význam výš) a klíč do `SEMANTIC_SCENE_KEYS`.
3. Doplň ukázkový předmět a doplněk do `SEMANTIC_DEMO` v galerii.
4. Přidej regresní test do `tests/selection.test.mjs` — jak pozitivní případ,
   tak text, který scénu spustit nesmí.
5. Spusť audit a sleduj, kolik příspěvků scéna zachytila; pokud jich je
   nepřiměřeně mnoho, zúžete kmeny nebo přidejte druhou podmínku.

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

- **Většina scén zůstává `single`.** Dynamický kompoziční vzor dostane 115
  příspěvků z 766 (15 %); zbytek řeší sémantické scény, které kreslí vlastní
  vztah objektů. Je to záměr — vztah se nemá vnucovat textu, který žádný nemá.
- **Druhá kopie v kompozicích je obvykle stejný motiv.** `split` umí použít
  `secondary`, konfrontace a spojení kreslí dvě kopie téhož motivu. Sémantické
  scény naopak staví dva různé předměty (knihovna + plamen, postava + hodiny).
- **Fallbacky zůstávají u abstraktní filozofie.** 56 příspěvků (7,3 %) nemá
  konkrétní předmět ani sémantickou scénu a spadne na rodinu podle kategorie;
  nejčastěji jde o abstraktní filozofické argumenty. Diagnostika je hlásí jako
  `category-fallback`, aby se daly cíleně doplňovat.
- **Sémantická pravidla jsou heuristiky.** Každé má druhou podmínku, aby se
  nespustilo na jediném slově („revoluční“ bez davu, „semena“ bez klíčení,
  „sluneční soustava“ bez Slunce). Přesto může méně obvyklý text minout;
  audit proto vypisuje distribuci a varování.
- **Refine je heuristika.** Patnáct pravidel pokrývá časté případy; méně
  obvyklý text zůstane u obecného motivu. Není to klasifikátor. Krátké řetězce
  musí mít hranice slov (`dna` nesmí chytit „prázdná“).
- **`heelix`** — překlep v klíči zůstává kvůli kompatibilitě; nový kód používá
  `dna` (viz 6).
- **`&amp;` v textu** se normalizuje na slovo `amp`; na skóre to nemá vliv,
  protože žádný kmen na `amp` neodkazuje.
- **Galerie je ve statickém buildu.** Je dostupná na produkční URL, dokud se
  nevypne.
