# Redakční kontrola hooků — 9. listopadu 2026

Zkontrolováno všech 976 úvodních odstavců podle aktuálního pravidla 2–3 smysluplných vět. Upraveno 378 příspěvků: 371 jednovětných úvodů a 7 čtyřvětných. Datum ani původní generovací prompt nejsou součástí záznamů; výběr proto vychází ze skutečného textu, nikoli z domnělé hranice ID.

## Zjištění a řešení

- **164 úvodů:** potřebný kontext už byl v následující větě. Přesun do prvního odstavce zachovává celý text i pořadí tvrzení. Rovnost úplného textu bez HTML a normalizovaných mezer byla ověřena programově.
- **209 úvodů:** lehké rozdělení souvětí, zkrácení nebo přeformulování při zachování hlavního poznatku. Patří sem také zkrácení sedmi čtyřvětných hooků. U dlouhých souvětí by pouhé připojení další věty zbytečně zaplnilo kartu. Po měření délky byly příliš dlouhé návrhy nahrazeny kratším úvodem; některé vedlejší údaje z původního hooku jsou vypuštěny.
- **4 úvody (48, 66, 68, 178):** přesun konkrétní související věty z textu místo automatického připojení životopisného údaje. Podle potřeby je doplněn podmět, aby věta fungovala samostatně.
- **1 úvod (465):** přesun následující věty a oprava překlepu „náměstu“ na „námětu“.

Například u 48 je otázka na zbytečné trápení doplněna větou „Mysl si dokáže vytvořit hrozby dřív, než k nim vůbec dojde.“ U 594 je jediná věta o aktivním a pasivním vyjádření rozdělena na rozdíl ve znění a shodu vztahu. U 134 zůstává úvod u Enigmy, její technické řešení je dál v textu.

Všechny upravené hooky mají 2–3 věty a nejvýše 360 viditelných znaků. Hranice 360 je pracovní omezení této úpravy, nikoli nové redakční pravidlo. Zkratky, číslované dny a iniciály nejsou samostatnými větami. Zachovány jsou celé věty a vyvážené HTML; všechny upravené články mají nadále 500–1 200 znaků včetně HTML.

## Konzistence

Titulky, kategorie, zdroje, ilustrační metadata a bitmapy se nemění. Hlavní poznatky, typy a tagy zůstávají stejné; obnoveny jsou pouze kontrolní otisky upravených textů. U přesunů se nezměnil obsah, u jazykových úprav se nemění téma, aktéři ani vysvětlovaný vztah. Vizuálně byly porovnány existující ilustrace 7, 9, 48, 66, 90, 134, 417, 477, 594, 610, 637 a 643.

Úplný přehled ID, původních a nových hooků a způsobu úpravy je v [JSON přehledu](hook-review-2026-11-09.json). Jde o kontrolu hooků a zachování jejich významové návaznosti, nikoli o nové úplné ověření všech historických faktů nebo vizuální audit všech bitmap.

## Ověření

- Programové porovnání: shodný počet a pořadí příspěvků; mimo `content` se žádné pole článku nezměnilo.
- Významový index: všech 976 příspěvků má aktuální kontrolní otisk, bez chyb; všech 933 poznatků je zachováno.
- Datové a ilustrační testy: všech 9 kontrol úspěšných pod Node.js 22. Výchozí Node.js 18 neumí syntaxi nynější závislosti Sharp.
- Samostatné měření textu: všechny upravené hooky se vejdou do šesti řádků při šířce 335 px a stejném písmu i řádkování jako na kartě.
- Build proběhl úspěšně před závěrečným zkrácením textů. Po zkrácení jsou znovu kontrolována data a skutečné karty v aplikaci; starší obsah v ignorovaném adresáři `build/` není předáván jako aktuální publikační balíček.
- Skutečné karty v Chromium při 390 × 844 px: ověřeny 48, 90, 134, 149, 154, 263, 417, 477, 594, 610, 637 a 643. Hooky se zobrazily celé, ilustrace se načetly a text nepřekrýval tlačítko otočení. Snímky 48 a 417 byly také vizuálně posouzeny.
- Závěrečné měření všech 378 upravených hooků v reálném prvku karty při 390 × 844 px: žádný hook se neořezává šestřádkovým limitem. Navíc ověřeny skutečné karty 106, 124, 416, 645 a 740, včetně načtení ilustrace a absence překryvu textu s tlačítkem.
- Lokální test aktuálních zdrojů: `http://127.0.0.1:5173/faakt.io/?order=id&post=48`. Server je ponechán běžet.

Navazující pravidlo zobrazení: hook nikdy nekončí výpustkou. Řádkový limit byl proto z líce zcela odstraněn, včetně varianty pro nízká okna; při nedostatku místa lze úvod posunout a dočíst celý. Původní měření šestřádkového limitu výše zaznamenává stav při redakční kontrole, nikoli současné omezení rozhraní.

Navazující ověření: 9 prohlížečových kontrol úspěšných v emulaci Android Chromium, iPhone WebKit a desktop Chromium (390 × 844 a 360 × 540 px), včetně dočtení klávesnicí, dostupného otočení a kontroly všech uložených hooků. Desktopový nízký viewport byl po přerušení načítání lokálním restartem opakován samostatně a prošel. Dvě jednotkové kontroly navíc ověřují, že ani náhradní zpracování textu bez odstavcových značek nepřidává výpustku. Nejde o ruční test fyzických telefonů ani o dokončení celé ostatní prohlížečové sady.
