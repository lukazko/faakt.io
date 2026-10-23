# Audit ilustrací

Vygenerováno: 2026-10-23T10:11:37.257Z

```
Příspěvků: 766
Scény: 62 · motivy: 75 · strukturální scény: 208 · kombinace: 219
Nejčastější motiv: bust (58×, 7.6 %) · entropie 0.89
Fallbacky podle kategorie: 56 (7.3 %)
Varování: 94 (category-fallback, subject-not-in-text)
Regresní případy: 5/5
  OK  754 ničivá síla inovací → stroj/mechanismus → disruption/machine
  OK  085 Slunce → slunce, ne srpek měsíce → solarSystem/sun
  OK  199 Alexandrijská knihovna → knihovna a oheň → bookFire/library
  OK  417 člověk ztratí pojem o čase → postava a hodiny → timeFigure/figure
  OK  540 fénické písmo a obchodníci → písmo nebo plavba, ne hodiny → writing/script

Scény:
  metaphor: 147
  portrait: 92
  laboratory: 33
  celestial: 32
  discovery: 32
  mechanism: 31
  relic: 31
  nature: 30
  storybook: 26
  layers: 23
  transformation: 21
  solarSystem: 20
Motivy:
  bust: 58
  brain: 44
  machine: 43
  polyhedron: 33
  book: 32
  scroll: 28
  sun: 24
  (bez motivu): 23
  atom: 23
  balance: 23
  palette: 23
  crowd: 21

Proti baseline:
  scenes: 8 → 62
  subjects: 51 → 75
  structuralScenes: 146 → 208
  fallbacks: 66 → 56
  warnings: 127 → 94
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

### subject-not-in-text (38)

- 096 — Černé díry: místa, kde se hroutí i samotný prostor: motiv flask nemá v textu žádné vlastní slovo
- 136 — Eiffelova věž je v létě o kus vyšší než v zimě: motiv balance nemá v textu žádné vlastní slovo
- 231 — Šifra, kterou lze zveřejnit, aniž by se dala prolomit: motiv gear nemá v textu žádné vlastní slovo
- 235 — Za vyřešení otázky P versus NP čeká milion dolarů: motiv balance nemá v textu žádné vlastní slovo
- 236 — Tulipánová horečka jako první učebnicová spekulativní bublina: motiv balance nemá v textu žádné vlastní slovo
- 240 — Proč zůstáváme na platformě, která se nám nelíbí: motiv balance nemá v textu žádné vlastní slovo
- 248 — Malby v jeskyni vznikaly po tisíciletí a stále je chránil chlad: motiv palette nemá v textu žádné vlastní slovo
- 270 — Dopisy z římské pevnosti řeší ponožky a pozvánku na oslavu: motiv amphora nemá v textu žádné vlastní slovo
- 304 — Malá část příčin obvykle způsobí většinu následků: motiv balance nemá v textu žádné vlastní slovo
- 431 — Než internet znal e-mail, adresa potřebovala nový symbol: motiv machine nemá v textu žádné vlastní slovo

## Nejčastější kombinace scény a motivu

| scéna | motiv | doplněk | počet | příklady |
|---|---|---|---|---|
| mechanism | machine | gear | 31 | 005, 012, 059, 065, 095 |
| portrait | bust | - | 31 | 027, 028, 037, 066, 068 |
| metaphor | polyhedron | - | 26 | 021, 041, 053, 116, 162 |
| layers | - | - | 23 | 030, 040, 164, 183, 222 |
| metaphor | brain | - | 22 | 009, 082, 093, 106, 210 |
| solarSystem | sun | planet | 20 | 014, 024, 044, 074, 085 |
| codex | scroll | column | 17 | 013, 035, 171, 284, 287 |
| voyage | ship | compass | 16 | 023, 127, 156, 182, 195 |
| metaphor | palette | - | 15 | 004, 011, 033, 073, 120 |
| storybook | book | - | 15 | 131, 144, 160, 225, 255 |
| laboratory | atom | microscope | 14 | 034, 114, 125, 138, 154 |
| metaphor | film | - | 14 | 257, 259, 279, 281, 282 |
| theatre | mask | film | 13 | 083, 254, 310, 455, 459 |
| celestial | planet | - | 12 | 017, 088, 091, 206, 288 |
| orbitCycle | cycle | hourglass | 12 | 064, 217, 249, 271, 418 |
| writing | script | quill | 12 | 264, 312, 415, 600, 601 |
| nature | tree | - | 11 | 265, 272, 274, 301, 449 |
| portrait | bust | scroll | 10 | 018, 047, 048, 058, 099 |
| celestial | star | - | 9 | 003, 550, 551, 557, 570 |
| laboratory | flask | microscope | 9 | 042, 113, 129, 158, 493 |

