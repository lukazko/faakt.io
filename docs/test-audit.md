# Audit testů a úklidu — 10. 11. 2026

Testy nejsou součástí klientského balíčku. Jejich náklady jsou čas v CI a údržba. Současná sada není nepřiměřená: chrání několik dříve rozbitých interakcí a redakční nástroje, které zapisují celou databázi.

| Oblast | Automatická kontrola |
| --- | --- |
| Odkazy na příspěvky | Kanonická i historická ID v jednotkových testech a skutečné otevření odkazů v prohlížeči |
| Feed | Načítání další dávky a průběh čtení, filtrování kategorie a obnovení stránky |
| Karty | Otáčení klepnutím, tlačítkem a návrat klávesou Escape; odlišné chování dlouhého stisku myši a dotyku |
| Akce | Sdílení, zamítnutí, zrušení a fallback do schránky či dialogu; hlášení a zavření nabídky |
| Čitelnost | Celý hook v nízkém viewportu, posouvání textu, mezery ilustrací a omezení animací |
| Obsah | Stav významového indexu, slovník, duplicity, zastaralé schválení a bezpečný zápis do oddělených registrů |
| Ilustrace | Soubory a registrace přijatých obrázků, alfa rozměry a invalidace cache po změně souboru |

Kontrola výpustek ve všech uložených hoocích byla přesunuta z browserové sady do `npm test`: nepotřebuje prohlížeč a dříve běžela třikrát. Kontrola geometrie hooku v prohlížeči zůstává, protože kontroluje skutečné rozložení. Totéž platí pro čistý výpočet rozměrů ilustrací oproti jejich rozložení na kartě. Regrese s izolovanou scrollovací vrstvou zůstává kvůli dřívějšímu pohlcování mobilních klepnutí.

`npm test` už spouští všech 17 Python testů indexu. Samostatný příkaz `test:knowledge` je užitečný při práci na nástroji, CI jej znovu nespouští. Testy pomocných skillů zůstávají oddělené od aplikace.

Odstraněny byly staré statické buildy, lokální náhledy, systémová PowerShell cache, publikovaná záložní databáze, jednorázový opravný skript `fix-json.mjs` a nepoužívaný `PostSheet.svelte`. `teaser.js` zachovává používané převody HTML, celý první odstavec a oddělení závěru; odstraněny byly nepoužívané CTA, zkracování a nedostupné skórování vět za konstantním přepínačem. Pracovní adresář `tmp/` byl vyřazen z Gitu; lokální zdrojové obrázky zůstávají dostupné.

Omezení: systémové sdílení a schránka jsou simulované, testy nepotvrzují funkci jejich nativních dialogů. Neověřují věcnou správnost článků, estetiku ilustrací, dostupnost externích zdrojů ani náhodnost pořadí statistickým testem. Tyto oblasti nelze považovat za pokryté úspěšným během sady. Ruční kontrolu shrnuje [uživatelský checklist](uzivatelske-regresni-testy.md).

## Výsledky ověření této změny

- `npm test`: prošlo všech 13 testů, včetně vnořených 17 Python testů.
- Produkční build přes Vite na Node.js 22 v oddělené pracovní kopii: úspěšný, včetně statického výstupu. Zůstávají varování Svelte o přístupnosti a zastaralém slotu a varování o velkém balíčku galerie ilustrací.
- Browserová sada: neověřena. Standardní start serveru překročil časový limit; i v oddělené kopii s delším čekáním Vite vracel HTTP 500, protože načtení `virtual:illustration-layout` překročilo interní limit 60 sekund. Nejde o úspěšný běh ani o selhání konkrétní browserové aserce. Plné skenování ilustrací v rychlé sadě na tomto počítači trvalo přibližně 29 sekund; tento krok je kandidátem na samostatné měření výkonu vývojového serveru.
