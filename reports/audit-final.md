# Audit ilustrací

Vygenerováno: 2026-10-23T08:42:34.132Z

```
Příspěvků: 766
Scény: 36 · motivy: 68 · strukturální scény: 181 · kombinace: 193
Nejčastější motiv: bust (58×, 7.6 %) · entropie 0.893
Fallbacky podle kategorie: 56 (7.3 %)
Varování: 91 (category-fallback, subject-not-in-text)
Regresní případy: 5/5
  OK  754 ničivá síla inovací → stroj/mechanismus → disruption/machine
  OK  085 Slunce → slunce, ne srpek měsíce → solarSystem/sun
  OK  199 Alexandrijská knihovna → knihovna a oheň → bookFire/library
  OK  417 člověk ztratí pojem o čase → postava a hodiny → timeFigure/figure
  OK  540 fénické písmo a obchodníci → písmo nebo plavba, ne hodiny → writing/script

Scény:
  metaphor: 160
  portrait: 97
  relic: 39
  laboratory: 38
  discovery: 37
  layers: 37
  mechanism: 35
  celestial: 32
  nature: 31
  storybook: 31
  transformation: 25
  confrontation: 20
Motivy:
  bust: 58
  brain: 46
  machine: 38
  (bez motivu): 37
  book: 37
  polyhedron: 37
  palette: 25
  atom: 24
  sun: 24
  film: 22
  ship: 21
  crowd: 19

Proti baseline:
  scenes: 8 → 36
  subjects: 51 → 68
  structuralScenes: 146 → 181
  fallbacks: 66 → 56
  warnings: 127 → 91
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

### subject-not-in-text (35)

- 096 — Černé díry: místa, kde se hroutí i samotný prostor: motiv flask nemá v textu žádné vlastní slovo
- 136 — Eiffelova věž je v létě o kus vyšší než v zimě: motiv balance nemá v textu žádné vlastní slovo
- 228 — Procházka po sedmi mostech dala vzniknout teorii grafů: motiv amphora nemá v textu žádné vlastní slovo
- 230 — Informace se dá měřit a jednotkou je bit: motiv gear nemá v textu žádné vlastní slovo
- 231 — Šifra, kterou lze zveřejnit, aniž by se dala prolomit: motiv gear nemá v textu žádné vlastní slovo
- 235 — Za vyřešení otázky P versus NP čeká milion dolarů: motiv balance nemá v textu žádné vlastní slovo
- 236 — Tulipánová horečka jako první učebnicová spekulativní bublina: motiv balance nemá v textu žádné vlastní slovo
- 240 — Proč zůstáváme na platformě, která se nám nelíbí: motiv balance nemá v textu žádné vlastní slovo
- 248 — Malby v jeskyni vznikaly po tisíciletí a stále je chránil chlad: motiv palette nemá v textu žádné vlastní slovo
- 270 — Dopisy z římské pevnosti řeší ponožky a pozvánku na oslavu: motiv amphora nemá v textu žádné vlastní slovo

## Nejčastější kombinace scény a motivu

| scéna | motiv | doplněk | počet | příklady |
|---|---|---|---|---|
| layers | - | - | 37 | 030, 040, 128, 164, 183 |
| mechanism | machine | gear | 35 | 005, 012, 059, 065, 095 |
| portrait | bust | - | 31 | 027, 028, 037, 066, 068 |
| metaphor | polyhedron | - | 30 | 021, 041, 053, 116, 162 |
| metaphor | brain | - | 25 | 009, 061, 071, 082, 093 |
| solarSystem | sun | planet | 20 | 014, 024, 044, 074, 085 |
| voyage | ship | compass | 18 | 023, 127, 156, 182, 195 |
| storybook | book | - | 18 | 131, 144, 160, 176, 225 |
| laboratory | atom | microscope | 17 | 034, 036, 077, 108, 114 |
| metaphor | palette | - | 16 | 004, 011, 033, 073, 120 |
| writing | script | quill | 15 | 029, 233, 264, 312, 415 |
| metaphor | film | - | 15 | 257, 259, 279, 281, 282 |
| orbitCycle | cycle | hourglass | 14 | 064, 217, 249, 271, 418 |
| theatre | mask | film | 13 | 083, 254, 310, 455, 459 |
| celestial | planet | - | 12 | 017, 088, 091, 206, 288 |
| nature | tree | - | 11 | 265, 272, 274, 301, 449 |
| portrait | bust | scroll | 10 | 018, 047, 048, 058, 099 |
| celestial | star | - | 9 | 003, 550, 551, 557, 570 |
| relic | scroll | - | 9 | 013, 038, 179, 194, 260 |
| storybook | book | scroll | 9 | 015, 025, 177, 191, 253 |

