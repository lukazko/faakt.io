# Uživatelské regresní testy po nasazení

Checklist proveď po každé nové verzi na skutečně nasazeném webu. Odkazy níže jsou relativní k jeho kořeni (např. `https://lukazko.github.io/faakt.io/`); zachovej případnou cestu `/faakt.io/`. Lokální dev server ani úspěšné automatické testy tuto kontrolu nenahrazují.

## Příprava a výsledek

- Zapiš datum, URL, verzi a build z nabídky „Další možnosti“, zařízení a prohlížeč. Porovnej verzi a build s nasazovanou verzí, aby test neproběhl na staré kopii.
- Projdi celý základní checklist na telefonu s Androidem v Chrome, na iPhonu v Safari a na počítači. Na počítači vyzkoušej i klávesnici. Pokud zařízení nemáš, označ příslušnou kontrolu jako neprovedenou; emulaci odliš od fyzického telefonu.
- Nejprve otevři již používanou záložku a obnov ji běžným způsobem; potom otestuj čistou anonymní relaci. Pro automatickou nápovědu otočení použij novou relaci bez předchozího otočení.
- Pro každý bod zaznamenej **OK / chyba / neprovedeno** zvlášť podle prostředí. Nezaškrtnutý bod neznamená úspěch. Podmíněné scénáře označ také „netýká se“ s důvodem.
- Při chybě uveď ID testu, odkaz na příspěvek, kroky, očekávaný a skutečný výsledek, verzi/build a snímek či video. Nefunkční načtení, čtení, navigace nebo akce karet znamenají neúspěšnou regresi; výsledek předej k opravě.

## Základní checklist pro každou verzi

| Hotovo | ID | Postup | Očekávaný výsledek |
| --- | --- | --- | --- |
| [ ] | R17 | Otevři `?post=417` na úzkém mobilu, otoč telefon na šířku a zvětši písmo. Pokud líc přesahuje, posuň úvodní plochu až na konec. Potom použij „Otočit a číst“. | Hook je tvořen celými větami a nikdy nekončí výpustkou kvůli ořezání. Celý úvod lze dočíst posunem i klávesnicí po zaměření úvodní plochy. Text nepřekrývá spodní akce, ilustrace není deformovaná a posun sám kartu neotočí. Tlačítko otočení funguje. Mezera nad spodními akcemi je 12 px, při výšce okna do 560 px pak 8 px. |
| [ ] | R01 | Otevři kořen webu a obnov stránku. V nabídce zkontroluj verzi/build. | Načte se feed se styly a obsahem, načítání skončí, údaje odpovídají nasazení. Nejsou vidět vývojové přepínače „Podle ID“ ani odznak ID. |
| [ ] | R02 | Prohlédni několik karet, včetně dlouhého titulku a příspěvku s ilustrací. | Titulek, kategorie, úvod a „Otočit a číst“ jsou čitelné a dostupné. Na líci je sdílení vlevo dole a „Otočit a číst“ vpravo dole, obě tlačítka jsou na stejné lince a nepřekrývají se. Při šířce do 600 px má horní řádek odsazení 28 px a spodní akce 20 px od okraje karty. Na desktopu je spodní odsazení akcí o 10 px menší než boční odsazení; celé dotykové plochy zůstávají uvnitř karty. Ikonka otočení je za textem a její pravý okraj má stejné odsazení jako text příspěvku. Ilustrace není rozbitá, deformovaná ani oříznutá; nezasahuje do textu a nevytváří nápadně nevyváženou mezeru. |
| [ ] | R03 | Posuň feed o několik karet dolů a zpět, pomalu i rychle. | Karty se zarovnají pod hlavičkou, aktivní karta jde ovládat. Feed nezůstane mezi kartami a obsah nekryje hlavička; ukazatel postupu reaguje. |
| [ ] | R04 | Na mobilu krátce klepni do úvodu karty, na počítači klikni na neinteraktivní plochu. Zopakuj s podržením prstu i myši a ověř také „Otočit a číst“. | Krátké klepnutí i kliknutí otočí kartu. Při podržení se před uvolněním přehraje náznak otočení. Tlačítko otevře celý text. Rub patří stejnému příspěvku, nic není zrcadlové a feed neposkočí. |
| [ ] | R05 | Na rubu dlouhého příspěvku roluj až ke zdrojům; potom dalším gestem pokračuj ve feedu. Klepnutím do textu vrať kartu na líc. | Lze přečíst celý článek. Rolování textu kartu neotočí, na konci lze pokračovat dál. Návrat na líc funguje; jiný příspěvek nepřebírá obsah předchozí karty. |
| [ ] | R06 | Na rubu rozbal a sbal „Zdroje“, otevři jeden zdroj a vrať se do aplikace. Vyber a zkopíruj část textu článku. | Počet odpovídá seznamu, odkaz otevře uvedený zdroj v nové záložce. Ovládání zdrojů ani výběr textu kartu neotočí; aplikace po návratu funguje. |
| [ ] | R07 | Klepni na kategorii na líci i rubu. Projdi několik karet, obnov stránku a filtr zruš křížkem v hlavičce. | Filtr ukazuje jen danou kategorii, její název je v hlavičce i URL. Při zapnutí a zrušení zůstává výchozím právě zvolený příspěvek; obnovení zachová kategorii. Zrušení vrátí smíšený feed. |
| [ ] | R08 | Po zapnutí a zrušení kategorie použij Zpět a Vpřed v prohlížeči. | Kategorie a feed odpovídají adrese. Neobjeví se prázdná obrazovka ani nefunkční ovládání. Náhodné pořadí ostatních karet nemusí být totožné. |
| [ ] | R07-S | Otevři `?category=sport&post=378`, klepni na odznak Sport, obnov stránku a filtr zruš. Projdi sportovní příspěvky 378–382 a otoč jednu kartu ke zdrojům. | Sport má oranžový odznak a vlastní název v hlavičce. Aktivní filtr nabízí jen sportovní příspěvky, obnova jej zachová a zrušení vrátí smíšený feed. Text, ilustrace a zdroje patří stejné kartě. |
| [ ] | R09 | V nové záložce otevři `?post=1` a `post/1/`, oba odkazy obnov. Zkus také `?category=historie` a `?category=neexistuje`. | Oba odkazy na příspěvek začínají příspěvkem 1 a umožňují další čtení. Platná kategorie filtruje, neznámá otevře smíšený feed. Přímá cesta funguje i bez předchozí návštěvy hlavní stránky. |
| [ ] | R10 | Na líci i rubu klepni na „Sdílet“. Na telefonu otevři systémové sdílení, jednou ho zruš a jednou předej odkaz. Vlož odkaz do nové záložky. | Sdílí se aktuální příspěvek s funkční cestou webu a `?post=ID`, i z filtrovaného feedu. Zrušení dialogu nevyvolá chybu ani náhradní kopírování. Otevřený odkaz začne správným příspěvkem. |
| [ ] | R11 | V prohlížeči bez systémového sdílení použij „Sdílet“ a vlož obsah schránky do adresního řádku. | Zobrazí se hláška o zkopírování, nezakryje ji rub karty a ve schránce je funkční odkaz na správný příspěvek. |
| [ ] | R12 | Na obou stranách otevři „Další možnosti“ a klepni na „Nahlásit problém“ a „Podpořit“. | Každý odkaz reaguje na první klepnutí. Hlášení otevře GitHub s odpovídajícím ID, titulkem, kategorií a odkazem; podpora otevře Revolut. Stačí ověřit cíle, hlášení neodesílej a platbu neprováděj. |
| [ ] | R13 | Otevři nabídku, zavři ji klepnutím mimo ni, znovu ji otevři a posuň feed. | Klepnutí mimo nabídku ji pouze zavře, neotočí kartu. Po posunu nezůstane nabídka nad jiným příspěvkem; ovládání nepohlcuje neviditelný překryv. |
| [ ] | R14 | Dojeď za prvních 20 karet a stiskni „Nee, dej mi víc!“. | Přibude další dávka, zobrazí se první nová karta a načítací překryv zmizí. Původní karty nezmizí a nové se neopakují kvůli načtení dávky. |
| [ ] | R15 | Otoč telefon, skryj a vysuň lištu prohlížeče; na počítači změň velikost okna a zvětši stránku na 200 %. | Text i ovládání zůstanou dostupné, nic podstatného nekryje výřez telefonu či spodní lišta. Líc i rub lze používat bez nechtěného vodorovného rolování. |
| [ ] | R16 | Klávesou Tab dojdi na otočení, aktivuj Enterem, čti rub a použij Escape. S otevřenou nabídkou stiskni Escape dvakrát. | Zaměření je viditelné a nevstupuje do skryté strany karty. Otočení přesune fokus na rub, návrat na tlačítko líce. První Escape zavře nabídku, další vrátí rub na líc. |

## Podmíněné a rozšířené kontroly

Proveď dotčené scénáře při změně související funkce; při větší změně rozložení nebo navigace projdi všechny. Uveď, které podmínky se podařilo skutečně vyvolat.

| Hotovo | ID | Postup | Očekávaný výsledek |
| --- | --- | --- | --- |
| [ ] | X01 | Při nových či upravených postech otevři jejich přímé odkazy; u velké dávky zkontroluj první, poslední a vzorek různých kategorií a délek. | Nový obsah je v nasazené verzi, má správnou kategorii, celý text, zdroje a odpovídající ilustraci. Otestuj i starší nezměněnou kartu. |
| [ ] | X02 | Při změně kategorií projdi dotčené názvy a URL se slugy `spolecnost`, `fyzika`, `pocitacove-vedy`, `filmy`. V některé kategorii dojdi až na konec a vrať se na všechny kategorie. | Odkazy zobrazují aktuální názvy a správný obsah. Společnost používá pouze slug `spolecnost`; původní slug není podporován. Konec kategorie nabízí funkční návrat do smíšeného feedu. |
| [ ] | X03 | V nové relaci počkej na náznak otočení, otoč kartu a pokračuj na další. Opakuj se systémovou volbou omezující pohyb. | Před prvním otočením se nápověda opakuje přibližně po 7 sekundách; po otočení automaticky nepokračuje. Při omezení pohybu se náznak nespouští a čtení zůstává funkční. |
| [ ] | X04 | Pokud prohlížeč umožní odmítnout přístup ke schránce a nemá systémové sdílení, odmítni jej a použij „Sdílet“. | Zobrazí se dialog s odkazem pro ruční zkopírování; po jeho zavření lze pokračovat ve čtení. |
| [ ] | X05 | Na již načteném webu vypni připojení a obnov stránku; případně v nástrojích prohlížeče zablokuj požadavek na `data/posts.json`. Pak připojení obnov či blokování vypni. | Pokud se načte aplikace, ale selžou data, ukáže chybu a „Zkusit znovu“ po obnovení spojení načte feed. Pokud selže celá stránka, po návratu online funguje obnovení. Offline provoz není podmínkou úspěchu. |
| [ ] | X06 | Pokud web používáš z ikony na ploše, otevři jej odtud a zopakuj čtení, nabídku, sdílení a otočení telefonu. | Obsah a akce zůstávají dostupné i bez běžné lišty prohlížeče a respektují bezpečné okraje displeje. |

## Záznam jednoho nasazení

Zkopíruj si tuto šablonu do záznamu vydání či samostatného souboru v `reports/`; odškrtání nepřenášej do trvalého checklistu.

```text
Datum:
URL:
Verze / build:
Zařízení / OS / prohlížeč (fyzické nebo emulace):
Výsledky R01–R17:
Výsledky relevantních X01–X06:
Neprovedeno / netýká se a důvod:
Chyby (ID testu, URL postu, kroky, očekávání, skutečnost, příloha):
Celkový výsledek: prošlo / chyba / neúplné
```

## Údržba při dalším vývoji

- Při změně uživatelského chování uprav tento seznam ve stejné změně jako aplikaci: přidej kroky a očekávaný výsledek nové funkce, aktualizuj změněné ovládání a odstraň neplatná očekávání.
- Každou opravenou uživatelskou regresi zachyť konkrétním scénářem, pokud ji dosavadní body nepokrývají. Zachovávej stabilní ID testů; novým přiděluj další volné číslo a nepřečíslovávej existující.
- Při změně mobilního vrstvení, sdílení nebo odkazů zachovej kontrolu skutečným klepnutím a na nasazeném webu. Automatické testy simulují systémové sdílení a schránku, takže jejich úspěch tyto ruční kontroly nenahrazuje.
- Při čistě interní změně zkontroluj relevanci checklistu; bez změny očekávaného chování není potřeba přidávat formální bod ani měnit datum. Tento dokument popisuje aktuální testy, nikoli historii spuštění.

## Záře karet (1.4.1)

| Stav | ID | Postup | Očekávaný výsledek |
|---|---|---|---|
| [ ] | G01 | V dev serveru i produkčním náhledu otevři kartu, otoč ji a posuň text rubu. Zopakuj po nasazení na GitHub Pages. | Obě strany mají jemnou barevnou záři v rozích, střed zůstává tmavý. Záře se neposouvá s textem a neblokuje ovládání. |
