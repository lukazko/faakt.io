# Audit ilustrací

Vygenerováno: 2026-10-23T09:19:18.245Z

```
Příspěvků: 766
Scény: 46 · motivy: 74 · strukturální scény: 196 · kombinace: 207
Nejčastější motiv: bust (58×, 7.6 %) · entropie 0.888
Fallbacky podle kategorie: 56 (7.3 %)
Varování: 88 (category-fallback, subject-not-in-text)
Regresní případy: 5/5
  OK  754 ničivá síla inovací → stroj/mechanismus → disruption/machine
  OK  085 Slunce → slunce, ne srpek měsíce → solarSystem/sun
  OK  199 Alexandrijská knihovna → knihovna a oheň → bookFire/library
  OK  417 člověk ztratí pojem o čase → postava a hodiny → timeFigure/figure
  OK  540 fénické písmo a obchodníci → písmo nebo plavba, ne hodiny → writing/script

Scény:
  metaphor: 156
  portrait: 92
  laboratory: 38
  discovery: 36
  mechanism: 34
  celestial: 32
  layers: 32
  relic: 32
  nature: 31
  storybook: 27
  codex: 23
  transformation: 22
Motivy:
  bust: 58
  brain: 44
  machine: 38
  polyhedron: 37
  book: 33
  scroll: 33
  (bez motivu): 32
  sun: 24
  atom: 23
  palette: 23
  film: 22
  ship: 20

Proti baseline:
  scenes: 8 → 46
  subjects: 51 → 74
  structuralScenes: 146 → 196
  fallbacks: 66 → 56
  warnings: 127 → 88
  topSubjectShare: 8.1 → 7.6
  regressionPassed: 1 → 5
```

## Varování podle typu

### category-fallback (56)

- 075 — Mol, který uvízl v počítači a dal jméno chybám v programech: výběr jen podle kategorie (category:pocitacove-vedy)
- 087 — Diogenés a sud, ve kterém bydlel místo v domě: výběr jen podle kategorie (category:filozofie)
- 161 — Hannah Arendtová a banalita zla u byrokrata, ne netvora: výběr jen podle kategorie (category:filozofie)
- 163 — Když někdo poprvé hledal vysvětlení světa bez bohů: výběr jen podle kategorie (category:filozofie)
- 165 — Argument, podle kterého je veškerá změna jen klam smyslů: výběr jen podle kategorie (category:filozofie)
- 166 — Čtyři živly a dvě síly, které je spojují a rozdělují: výběr jen podle kategorie (category:filozofie)
- 169 — Rovné prkno se ohne jen tehdy, když ho někdo ohýbá: výběr jen podle kategorie (category:filozofie)
- 172 — Jednej, ale nelpi na ovoci svého jednání: výběr jen podle kategorie (category:filozofie)
- 175 — Prázdnota neznamená, že nic není, ale že nic nestojí samo: výběr jen podle kategorie (category:filozofie)
- 184 — Z toho, jak věci jsou, nevyplývá, jak by být měly: výběr jen podle kategorie (category:filozofie)

### subject-not-in-text (32)

- 096 — Černé díry: místa, kde se hroutí i samotný prostor: motiv flask nemá v textu žádné vlastní slovo
- 136 — Eiffelova věž je v létě o kus vyšší než v zimě: motiv balance nemá v textu žádné vlastní slovo
- 231 — Šifra, kterou lze zveřejnit, aniž by se dala prolomit: motiv gear nemá v textu žádné vlastní slovo
- 235 — Za vyřešení otázky P versus NP čeká milion dolarů: motiv balance nemá v textu žádné vlastní slovo
- 236 — Tulipánová horečka jako první učebnicová spekulativní bublina: motiv balance nemá v textu žádné vlastní slovo
- 240 — Proč zůstáváme na platformě, která se nám nelíbí: motiv balance nemá v textu žádné vlastní slovo
- 248 — Malby v jeskyni vznikaly po tisíciletí a stále je chránil chlad: motiv palette nemá v textu žádné vlastní slovo
- 270 — Dopisy z římské pevnosti řeší ponožky a pozvánku na oslavu: motiv amphora nemá v textu žádné vlastní slovo
- 304 — Malá část příčin obvykle způsobí většinu následků: motiv balance nemá v textu žádné vlastní slovo
- 434 — Existují úlohy, u kterých počítač nikdy dopředu nepozná, že se zacyklí: motiv gear nemá v textu žádné vlastní slovo

## Nejčastější kombinace scény a motivu

| scéna | motiv | doplněk | počet | příklady |
|---|---|---|---|---|
| mechanism | machine | gear | 34 | 005, 012, 059, 065, 095 |
| layers | - | - | 32 | 030, 040, 164, 183, 222 |
| portrait | bust | - | 31 | 027, 028, 037, 066, 068 |
| metaphor | polyhedron | - | 28 | 021, 041, 053, 116, 162 |
| metaphor | brain | - | 23 | 009, 071, 082, 093, 106 |
| codex | scroll | column | 22 | 013, 035, 171, 261, 283 |
| solarSystem | sun | planet | 20 | 014, 024, 044, 074, 085 |
| voyage | ship | compass | 17 | 023, 127, 156, 182, 195 |
| laboratory | atom | microscope | 17 | 034, 036, 077, 108, 114 |
| metaphor | palette | - | 15 | 004, 011, 033, 073, 120 |
| storybook | book | - | 15 | 131, 144, 160, 225, 255 |
| metaphor | film | - | 15 | 257, 259, 279, 281, 282 |
| writing | script | quill | 14 | 029, 233, 264, 312, 415 |
| orbitCycle | cycle | hourglass | 13 | 064, 217, 249, 271, 418 |
| theatre | mask | film | 13 | 083, 254, 310, 455, 459 |
| celestial | planet | - | 12 | 017, 088, 091, 206, 288 |
| nature | tree | - | 11 | 265, 272, 274, 301, 449 |
| portrait | bust | scroll | 10 | 018, 047, 048, 058, 099 |
| celestial | star | - | 9 | 003, 550, 551, 557, 570 |
| laboratory | flask | microscope | 9 | 042, 113, 129, 158, 493 |

