# Kategorie příspěvků — konečný stav

Stav k 4. listopadu 2026: 796 příspěvků ve 13 kategoriích. Jediným zdrojem platných slugů a zobrazovaných názvů je `src/lib/categories.js`.

| Slug | Název | Počet |
|---|---|---:|
| `historie` | Historie | 79 |
| `filozofie` | Filozofie | 137 |
| `biologie` | Biologie | 63 |
| `umeni` | Umění | 46 |
| `literatura` | Literatura | 40 |
| `politika` | Společnost a politika | 50 |
| `fyzika` | Fyzika a chemie | 74 |
| `astronomie` | Astronomie | 68 |
| `ekonomie` | Ekonomie | 46 |
| `psychologie` | Psychologie | 58 |
| `filmy` | Kinematografie | 38 |
| `matematika` | Matematika | 52 |
| `pocitacove-vedy` | Technologie | 45 |

Biologie zahrnuje organismy, evoluci, genetiku, fyziologii, nemoci, prevenci, léčbu a životosprávu. Jazyk a znaky patří do Filozofie; původních 133 filozofických příspěvků se nepřesouvalo, čtyři jazykové příspěvky přibyly. Fyzika a chemie zahrnuje také neživou přírodu a geofyziku. Technologie zahrnují informatiku i technické vynálezy. Společnost a politika pokrývá společenské normy, instituce, právo a vládnutí.

Historie používá modrou barvu `#60a5fa`, odlišenou od oranžových prvků aplikace. Neznámé kategoriové filtry se normalizují na smíšený feed. Přesahy mezi obory zachycují existující řízené tagy.

Podrobný přehled finálních kategorií a ID přeřazených příspěvků je v `category-migration-2026-11-04.json`. Při přerozdělení se měnila pouze pole `category`; obsah příspěvků, zdroje a ilustrační metadata zůstaly zachovány. Aktuální redakční pravidla jsou v `CLAUDE.md` a `docs/generovani-postu-handoff.md`.
