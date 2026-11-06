# Kontrola mezer ilustrací

- Prohledáno 916 číselných WebP souborů; 667 splňuje pravidlo nadbytečného spodního prostoru. Úplný výsledek měření je v `illustration-spacing-audit.json`. Jde o automatický geometrický audit, nikoli individuální vizuální schválení všech 916 obrázků.
- Alfa práh 16 odpovídá přípravě ilustrací. Při šířce zdroje 640 px zůstává kolem hlavního motivu 10 px nahoře i dole. Rám se zkracuje jen při spodním okraji větším než 20 px a úspoře alespoň 20 px.
- Původní soubory, proporce a měřítko kresby se nemění. Rám centruje viditelný svislý rozsah, slabé vzdálené alfa pixely zůstávají zachované přes `overflow: visible`. Obrázky bez významné rezervy jako 313 používají původní rozložení.
- Vizuálně zkontrolovány skutečné karty 313, 524, 820, 212, 433, 711, 554 a 231 při 390×844 a karty 524 a 820 při 375×667, včetně stávající barevné záře, titulku a hooku. Snímky: `spacing-ID-automatic.png`, případně `spacing-ID-compact.png`. V těchto případech bez kolizí či viditelného ořezu motivu. Alfa práh není sémantické rozpoznání; případné záměrné velmi slabé detaily vyžadují vizuální posouzení.
- `npm test`: 9/9; prohlížečové kontroly `illustration-spacing.spec.js`: 12/12 (Android Chromium, iPhone WebKit, desktop Chromium); produkční build dokončen. Build hlásí stávající upozornění Svelte/a11y a velikost galerie.
- Ověřeno i na běžícím dev serveru: dočasně přidaný obrázek dostal rozložení automaticky, jeho náhrada obrázkem bez rezervy opravu odstranila. Dočasný soubor byl smazán.
- Vite plugin počítá údaje při vývoji i každém buildu. Do klienta jde jen statická mapa rozměrů; v prohlížeči se alfa neanalyzuje. Registrace nových ilustrací v kartách a galerii zůstává součástí existujícího workflow.
