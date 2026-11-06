# faakt.io — Projektové know-how

## Co to je
Mobil-first webová appka: TikTok-style vertikální scrollování textových příspěvků (historie, filozofie, věda, umění…). Všechna fakta jsou 100% reálná s ověřitelnými zdroji.

## Tech stack
- **SvelteKit 2** + `@sveltejs/adapter-static` — čistě statický výstup
- **Vite 6** jako build tool
- **GitHub Pages** hosting (branch: `gh-pages`)
- **Node.js 18** (aktuálně na systému)

## Důležité konfigurace

| Nastavení | Hodnota |
|---|---|
| base path | `/faakt.io` (v `svelte.config.js`) |
| fallback | `404.html` (pro GitHub Pages SPA routing) |
| prerender | `true` (všechny stránky) |
| trailingSlash | `always` |
| `.nojekyll` | **POVINNÝ** — v `static/`, jinak GitHub Pages ignoruje `_app/` složku |

## Struktura projektu
```
faakt.io/
├── src/
│   ├── app.html
│   ├── app.css                    # Dark theme, CSS proměnné
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +layout.js             # prerender = true, trailingSlash = always
│   │   ├── +page.svelte           # Hlavní feed (náhodné pořadí)
│   │   └── post/[id]/
│   │       ├── +page.svelte       # Stránka konkrétní myšlenky
│   │       └── +page.server.js    # entries() pro prerender + load()
│   └── lib/components/
│       ├── FeedView.svelte        # Scrollovací feed + shuffle + share
│       └── PostCard.svelte        # Karta s kategorií, textem, zdroji
├── static/
│   ├── .nojekyll                  # !!! Nutné pro GitHub Pages !!!
│   └── data/posts.json            # Databáze (jen roste, nikdy se nemaže)
├── scripts/
│   ├── generate-posts.mjs         # Claude API generátor
│   └── deploy-gh-pages.mjs        # Fallback deploy skript
└── .github/workflows/deploy.yml   # Auto-deploy na push do main
```

## Datový model (posts.json)
```typescript
interface Post {
  id: string;           // "1", "2", … "1000"; bez úvodních nul, nové ID = maximum + 1
  title: string;        // max 80 znaků, chytlavý
  content: string;      // 500–1200 znaků HTML; hook 2–3 věty, ověřitelná fakta
  category: string;     // viz kategorie
  sources: Array<{      // vždy 2-3 položky
    label: string,      // název zdroje
    url: string         // přímý odkaz
  }>;
  illustration: {
    concept: string;
    scene_type: 'portrait' | 'interaction' | 'process' | 'diagram' | 'environment' | 'object';
    primary_subject: string;
    secondary_subjects: string[];
    visual_keywords: string[];
    composition_hints: string[];
    mood: 'contemplative' | 'dramatic' | 'dynamic' | 'mysterious' | 'neutral' | 'playful';
    palette: 'blue_gold' | 'green_copper' | 'indigo_cyan' | 'monochrome_cool' | 'monochrome_warm' | 'teal_amber' | 'terracotta_cream' | 'violet_coral';
  };
}
```

## Významový index a metadata pro feed

Význam článku popisují čtyři logické atributy `idea`, `point`, `tags`, `type`. **Nepřidávej je do `posts.json`.** Přiřazení ID a tagů je v `static/data/post-knowledge.json`, společné pointy a typy v `static/data/knowledge-ideas.json` a slovník tagů v `static/data/tags.json`. Otisky a ověření jsou pouze v `editorial/knowledge-state.json`, mimo publikovaný obsah. Běžný feed další soubory nenačítá; řazení zůstává beze změny. Podrobné schéma a postup jsou v [docs/post-knowledge.md](docs/post-knowledge.md).

Před generováním spusť `python scripts/post-knowledge.py status`, přečti celý kompaktní katalog přes stránkovaný `catalog` a vyhledej související texty přes `search`. Celé články znovu čti jen u neověřených, změněných a blízkých případů; platný významový index nahrazuje opakované úplné čtení nezměněné databáze. Automatické hledání nenahrazuje sémantický verdikt. Nové pracovní návrhy obsahují navíc `knowledge`; nástroj `append` je po doložené kontrole rozdělí do článků a samostatných registrů. Používej řízené tagy, ne slova získaná pouze z ilustračního motivu.

## Kategorie
`historie`, `filozofie`, `biologie`, `umeni`, `literatura`, `politika`, `fyzika`, `astronomie`, `ekonomie`, `psychologie`, `filmy`, `matematika`, `pocitacove-vedy`

Zobrazované názvy: `politika` = **Společnost a politika**, `fyzika` = **Fyzika a chemie**, `pocitacove-vedy` = **Technologie**, `filmy` = **Kinematografie**. Původní slugy přejmenovaných kategorií zůstávají kvůli kompatibilitě odkazů. Platné kategorie určuje výhradně `src/lib/categories.js`; neznámý kategoriový filtr otevře smíšený feed.

Zařazuj podle hlavního obsahu celého článku. Biologie zahrnuje organismy, genetiku, evoluci, fyziologii i nemoci, léčbu, prevenci, zdravotní výzkum a životosprávu. Fyzika a chemie zahrnuje neživou přírodu, chemické reakce, materiály i geofyzikální procesy. Technologie zahrnují informatiku, technické vynálezy a jejich fungování. Společnost a politika zahrnuje společenské normy, instituce, právo a vládnutí. Jazyk a znaky zůstávají podoborem Filozofie; literární a psychologické teorie již zařazené ve Filozofii se při této změně nepřesouvaly. Přesahy zachycují existující tagy, ne další kategorie.

Barvy v `:root` CSS proměnných: `--cat-{kategorie}`.

## Klíčová pravidla pro obsah
1. **100% reálná fakta** — žádné AI výmysly, fabulace nebo přibližné informace
2. **Každý příspěvek musí mít 2-3 zdroje** s reálnými URL
3. **Žádné smyšlené citáty**, přibližné letopočty nebo „lidé říkají“
4. Databáze **jen roste**, staré příspěvky se nikdy nemažou
5. **Chronologická konzistence**: nikdy nemíchej období — starověcí nemohli používat středověké technologie a naopak
6. **Generování nových dávek**: ~30 % starověkých myslitelů (řečtí, římští, čínští, indičtí), zbytek napříč všemi kategoriemi. Vysvětlení konceptů (mentální modely, kognitivní zkreslení, vědecké principy).
7. **Formát obsahu**: doporučená struktura HOOK → PROBLÉM → NAPĚTÍ → OBRAT → ROZBALENÍ → KONTRAST → POINTA → APLIKACE. Není povinná — historická fakta, vědecké objevy a zajímavosti se řídí vlastním tempem. Důležité: 1 myšlenka = 1 příspěvek, krátké odstavce, přirozená čeština. Otázku na závěr používej jen když dává smysl (paradox, dilema) — u faktických faktů ji nevnucuj.
8. **Správná čeština**: důsledně dbej na gramatiku, skloňování, shodu přísudku s podmětem, interpunkci. Žádné hovorové nebo nespisovné výrazy. Text musí být čtivý a gramaticky bezchybný.
9. **Hook na přední straně karty**: první odstavec (`<p>`) nového příspěvku má 2–3 smysluplné věty, nikoli jedinou větu. Zobrazuje se na přední straně karty, která s jednovětým úvodem působí příliš prázdně. Úvodní otázku či překvapivé tvrzení rozveď konkrétním kontextem nebo napětím; nepřidávej výplň jen kvůli délce. Další odstavce mohou mít 1–3 věty.

## Zadání pro externí AI agenty
- Přenositelný prompt pro tvorbu nových příspěvků je v `docs/generovani-postu-handoff.md`.
- **Při každé změně datové struktury příspěvků, způsobu jejich generování nebo redakčních pravidel obsahu aktualizuj tento soubor ve stejné změně.** Udržuj v souladu ukázkový JSON, datové typy a povolené hodnoty včetně kategorií a ilustračních metadat.
- Nové příspěvky obsahují `illustration` se všemi poli a pravidly uvedenými v zadání; metadata musí vycházet z titulku i celého obsahu.

## Dokončení nové dávky postů

Požadavek na přidání či vygenerování nových postů v tomto repozitáři standardně zahrnuje **obsah, ilustrace, plnohodnotné karty a spuštění pro lokální test**. Postupuj podle `skills/faakt-create-posts/SKILL.md`: ověř originalitu a zdroje, připoj posty přes hlídaný `append`, vytvoř skutečné ilustrace podle `skills/faakt-illustrations/SKILL.md`, zaregistruj je v kartách i galerii a dokonči projektové kontroly. Metadata obrázku ani JSON předaný do chatu nenahrazují hotový post v aplikaci. Na navazující ilustrace a lokální spuštění není potřeba další potvrzení.

Po kontrolách spusť nebo znovu použij lokální server pro správný checkout, ověř v prohlížeči nové karty a předej skutečně dostupnou URL s base path `/faakt.io/` a odkazem na první nové ID. Server ponech běžet pro uživatelův test; samotný `npm run build` lokální test nezpřístupňuje. Build a dev server nespouštěj souběžně nad stejným `.svelte-kit`; po buildu lokální server případně znovu spusť. Podrobnosti a podmínky dokončení jsou ve skillu.

Výslovné zadání pouze návrhů, textů nebo JSON má přednost. Lokální zpřístupnění není veřejná publikace: merge do `main`, push spouštějící Actions a `npm run deploy` vyžadují odpovídající zadání. Pokud některá část nejde dokončit, zachovej hotovou práci a konkrétně uveď překážku; neoznačuj dávku za kompletní.

## Skripty
```bash
npm run dev              # Lokální vývoj (http://localhost:5173/faakt.io/)
npm run dev -- --host    # + přístup z mobilu v síti
npm run build            # Sestavení do build/
npm run preview          # Náhled ostrého buildu
npm run generate         # Generování nových příspěvků (přes Claude API)
npm run deploy           # Ruční deploy na gh-pages (fallback, primárně Actions)
npm test                 # Kontroly dat a ilustrací
npm run test:e2e         # Regrese akcí karet: Android Chromium, iPhone WebKit, desktop
```

Generování přes explicitně autorizované API: `npm run generate -- --plan reports/plan.json --output reports/drafts.json` s nastaveným `ANTHROPIC_API_KEY`. Vyžaduje zkontrolovaný plán; nikdy nezapisuje přímo do článků. Metadata a index: `npm run knowledge -- status`, `npm run knowledge -- search --query "..."`. Formát plánu a závěrečného schválení: `docs/post-knowledge.md`.

Browserové testy vyžadují Node.js 20+ (CI používá 22) a jednorázově
`npx playwright install chromium webkit`. Playwright spouští vlastní dev server
na portu 4175. Testy v `tests/browser/` používají skutečné klepnutí/kliknutí;
systémové sdílení a schránka jsou simulované, hlášení ověřuje navigaci do nové
záložky bez přístupu na GitHub. Varianta s `isolation: isolate` na feedu je
povinná regrese mobilního vrstvení: neviditelný překryv dříve pohltil klepnutí
a pouze zavřel nabídku. Testujeme líc i rub, fallbacky sdílení a zavírání mimo
nabídku. CI je spouští na větvích i PR a úspěch testů je podmínkou nasazení
z main. Při selhání uchová Playwright trace jako artefakt.
Datový požadavek v testech vrací dva skutečné příspěvky z databáze, aby rychlost
regresí akcí nezávisela na celkové velikosti `posts.json`.
Na místním Node.js 18 lze běh spustit bez změny systémové instalace přes
`npm exec --yes --package=node@22 -- node node_modules/playwright/cli.js test`.

## Architektura a chování

### Feed a řazení
- Lokální test: pouze při `npm run dev` lze tlačítkem „Podle ID“ v odznaku vlevo dole výslovně zapnout číselné řazení příspěvků. Volbu drží URL `?order=id`, případně s `&post=5` pro začátek na konkrétním příspěvku. Tlačítko „Náhodně“ režim vypne. Bez této volby se feed dál míchá; produkční build parametr ignoruje a přepínač neobsahuje.
- **Fisher-Yates shuffle** při každém načtení stránky — každý uživatel vidí myšlenky v jiném pořadí
- Pokud je otevřeno `/post/5`, tato myšlenka je první, zbytek je náhodný
- ID jsou kladná desetinná čísla uložená jako řetězce bez úvodních nul. Nové ID je nejvyšší existující ID + 1. Staré odkazy s nulami (`?post=005`, `/post/005/`) zůstávají kompatibilní; `src/lib/post-id.js` normalizuje vstup a zachovává původní statické cesty. Nově sdílené odkazy používají ID bez nul.
- Při scrollování se URL v adresním řádku průběžně mění (`history.replaceState`)

### Sdílení
- Web Share API (`navigator.share({ url })`) — sdílí jen URL konkrétní myšlenky
- Fallback (desktop): kopíruje URL do schránky

### Scrollování
- CSS `scroll-snap-type: y mandatory` + `scroll-snap-align: start`
- Progress bar nahoře (lineární gradient)

### Vizuál
- Dark theme (`#0a0a0a` pozadí)
- Logo: gradient text (fialová→růžová), bold 900, normální řez (ne italic)
- Motto: `font-style: italic`, malé, šedé
- Každá kategorie má vlastní barvu badge

## Deployment
- **Automaticky**: GitHub Actions při pushi do main → build + push na `gh-pages`
- **Ručně**: `npm run deploy` (přes gh-pages npm package)
- **Nastavení Pages**: Settings → Pages → branch `gh-pages`, folder `/ (root)`

## Pracovní postupy
- **Uživatelské regrese:** při každé změně uživatelského chování aktualizuj ve stejné změně [docs/uzivatelske-regresni-testy.md](docs/uzivatelske-regresni-testy.md). Nové funkce doplň o konkrétní postup a očekávaný výsledek, změněné či odstraněné ovládání promítni do existujících scénářů a opravené regrese pokryj testem. Zachovej stabilní ID. Při interních změnách pouze ověř relevanci seznamu. Po nasazení použij checklist na skutečném webu; neoznačuj neprovedené ruční testy za úspěšné na základě buildu nebo automatických testů.
- **Verze aplikace:** zdrojem pravdy je `version` v `package.json`, kterou uživatel obvykle upravuje ručně. Zachovej jeho zvolenou verzi a bez zadání ji nezvyšuj ani nevracej na starší hodnotu. Při změně verze a před odevzdáním změn ověř shodu s `version` a `packages[""].version` v `package-lock.json`; případný nesoulad oprav podle `package.json` bez změn verzí závislostí. Verze zobrazená ve faakt.io musí dál vycházet z `package.json` přes `__APP_VERSION__` ve `vite.config.js`, nikdy z další ručně udržované konstanty. Identifikátor buildu je samostatný údaj.
- **Větve vol podle souvislosti a rozsahu práce; novou větev nezakládej automaticky pro každý požadavek nebo dávku.** Před změnou zkontroluj aktuální větev a rozpracované změny. Navazující úpravy stejného tématu mohou pokračovat v jedné vhodné pracovní větvi, například postupné dávky ilustrací ve větvi `new-illustrations`. Novou větev založ pro samostatný, nesouvisející úkol nebo pokud oddělení usnadní kontrolu a sloučení změn. Nepřimíchávej nesouvisející práci a zachovej rozpracované změny; respektuj výslovné zadání uživatele ohledně větve.
- Commituj pravidelně s popisem v češtině
- Po schválení merge do main, Actions nasadí automaticky
- **Vizuální změny**: každá úprava ilustrací, palety, motivů, kompozic, rendereru nebo vývojové galerie musí ve stejném commitu aktualizovat `docs/ilustrace-handoff.md` — počty, tabulky, mapování, paletu, testy i zlaté otisky. Dokument popisuje aktuální stav, ne historii.

## Illustration Metadata Validation and Repair

Přenositelný skill pro sémantickou kontrolu všech nebo vybraných příspěvků je v [`skills/faakt-metadata-review/SKILL.md`](skills/faakt-metadata-review/SKILL.md). Je určen všem AI agentům, obsahuje dávkovou kontrolu celých textů, hashové checkpointy a bezpečné aplikování oprav pouze v poli `illustration`. Pravidla a nástroje nejsou závislé na Codexu ani jiném poskytovateli.

Použijte `scripts/repair-illustrations.py`:
- při přidání nebo regenerování příspěvků;
- při hromadném vytvoření či úpravě ilustračních metadat;
- pokud audit odhalí opakující se, obecné, nekonzistentní nebo významově nevhodné předměty;
- při hlášení chybných hlavních předmětů, nerelevantních vedlejších objektů nebo opakujících se kompozic;
- před přípravou nové dávky příspěvků k vykreslení nebo publikaci.

Nespouštějte jej kvůli změnám nesouvisejícím s obsahem či ilustračními metadaty.

Skript opravuje pouze známé, deterministicky popsané problémy: pravidla pro konkrétní ID, duplicity a výslovně nevhodné vedlejší předměty, známé nekonzistence typu scény a kompozice. Zachovává ostatní pole příspěvků i metadata bez odpovídajícího pravidla a vypisuje strojově čitelný přehled změněných záznamů. Identifikátory `primary_subject` jsou popisná metadata; nejsou to klíče SVG rendereru. Nevkládejte sem nové identifikátory bez ověření jejich významu.

Skript nesmí náhodně měnit předměty kvůli rozmanitosti, přidávat nesouvisející dekorace, přepisovat ručně kurátorovaná metadata bez jasného pravidla ani potichu zavádět nepodporované identifikátory SVG. Nesmí měnit obsah, titulky, kategorie ani zdroje příspěvků. Nenahrazuje sémantickou kontrolu povrchním porovnáváním klíčových slov; ne každý sporný případ lze opravit deterministicky.

Doporučený postup:
1. Prohlédněte dotčené příspěvky a jejich ilustrační metadata.
2. Nejprve spusťte deterministický repair; výchozí režim je pouze náhled: `npm run repair-illustrations`.
3. Pro podrobnosti změn určete report cestou `--report`, například `npm run repair-illustrations -- --report reports/illustration-repair.json`. Výstupní dataset se zapíše pouze při výslovném zadání `--output`; zdroj lze záměrně upravit příkazem `npm run repair-illustrations -- --output static/data/posts.json`.
4. Prohlédněte změněná pole a nevyřešené případy. Poté spusťte `npm test` a vizuálně zkontrolujte reprezentativní vzorek statických ilustrací.
5. AI použijte až na případy, které deterministická pravidla spolehlivě nerozhodnou. Skript je levný nástroj údržby, nikoli náhrada výběru ilustrace s porozuměním obsahu.

## Známé problémy
- GitHub Pages ignoruje `_app/` → řeší `.nojekyll` v `static/`
- Base path `/faakt.io` → fetch URL musí být `${base}/data/posts.json` (s lomítkem)
- Dev server s base path: app je na `http://localhost:5173/faakt.io/`, ne na `/`

## Shared skills for AI agents

- **Automatická výška ilustrací na kartách:** Vite plugin `scripts/illustration-layout.mjs` při vývoji i buildu načítá aktuální číselné WebP soubory. Z alfa ≥16 určuje svislý rozsah kresby. Pokud spodní okraj přesahuje 20 pixelů a lze ušetřit alespoň 20 pixelů (v přepočtu na šířku 640), použije rám vysoký jako kresba + 20 pixelů a vycentruje v něm viditelný motiv. Zachovává měřítko, proporce i původní soubor; slabé alfa zbytky se neořezávají. Nové i nahrazené ilustrace se přepočítají automaticky, v běžícím dev serveru také při změně souboru. Ruční výjimky podle ID nejsou potřeba. Obvyklá registrace obrázku v kartách a galerii stále platí.

- **Čitelnost ilustrací na barevné záři:** při generování počítej i s lokálním CSS experimentem v `CardGlow.svelte` (nepravidelná vícebarevná záře s opacitou 10 %, aktuálně jen v dev režimu). Zachovej skutečnou průhlednost obrázku, záři do něj nekresli. Silueta i podstatné detaily mají být čitelné díky světlostnímu i barevnému kontrastu na původním tmavém podkladu i na záři při 160×90 a 320×180; ověř také skutečnou kartu. Podrobný postup a společný prompt jsou v `skills/faakt-illustrations/`. Změna pravidel sama neautorizuje regeneraci přijatých obrázků.

- **Ilustrace má vzbudit chuť číst:** výrazným motivem, gestem, atmosférou nebo kontrastem. Samotná přehlednost nestačí; i pár oddělených objektů s jedinou šipkou může působit jako rovnice vstupů a výsledku. Když myšlenku lépe nese přirozené setkání či soudržná scéna, propoj prvky pohledem, pózou, pohybem nebo společným prostorem. Růžový plameňák sklánějící se k šedému mláděti může zaujmout bez schématu mládě + potrava → dospělý. Nejde o zákaz diagramů, šipek či vysvětlení principu: mají své místo, když jejich vizuální forma sama dobře funguje jako ilustrace. Posuzuj celkovou kompozici, nikoli jen počet předmětů či kroků.

- **Vycentrování ilustrací:** hlavní motiv má být opticky uprostřed celého obrázku **vodorovně i svisle**, s vyváženými prázdnými okraji. Nevycentrování je přípustné jen pro konkrétní význam, interakci nebo směr děje uvnitř ilustrace; důvod zaznamenej. Kontroluj skutečně viditelný hlavní motiv včetně alfa odsazení, nikoli pouze střed plátna či vzdálené téměř neviditelné pixely. Při finálním zmenšení lze odstranit nadbytečný plně průhledný okraj a motiv vycentrovat bez ořezu jeho částí. Nerezervuj volný sloupec pro text.
- **Vizuální mezera mezi ilustrací a hookem:** shodné rozměry souboru ani CSS `gap` nezaručují shodnou viditelnou mezeru. Před přijetím porovnej několik karet při stejné šířce a zjisti alfa okraje i skutečné měřítko motivu. Nápadně velký spodní průhledný okraj prověř jako možnou chybu přípravy; samotné vycentrování není dostatečná kontrola. Náprava má zachovat centrování v obou osách: prověř nadbytečné odsazení, nevýznamné alfa zbytky, vhodné měřítko a výšku zobrazovací plochy. Neposouvej motiv automaticky ke spodnímu okraji, nedeformuj jej ani neořezávej jeho viditelné části. Pokud odlišné proporce přirozeně vyžadují více volného místa, zaznamenej omezení; případnou úpravu rozložení řeš v odpovídajícím rozsahu úkolu. Podrobný postup je v ilustračním skillu.

- **Kontrola ilustrací před překreslením:** posuzuj obrázek spolu s titulkem a textem karty. Překreslení musí řešit konkrétní viditelný rozpor nebo nečitelnost; domnělá doslovná interpretace symbolu nestačí. Nejasný počet překrývajících se postav nejprve ověř ve větším náhledu. Spojnice mohou vyjadřovat vztah a šipky výsledek měření, aniž by tvrdily přenos signálu. Nevyžaduj názvy zemí ani popisky jen k zopakování kontextu z textu. Náhradu porovnej s originálem při stejné velikosti a zachovej výraz, děj i čitelnost. První verze `188`, `200` a `212` jsou výslovnou volbou uživatele; pravidla a jejich konkrétní význam popisuje `skills/faakt-illustrations/SKILL.md`.

- **Jednoduchost ilustrace posuzuj podle kontextu.** Stačí relevantní objekt, portrét, jednoduchý děj nebo stručná metafora; vědecký mechanismus, experiment ani celou pointu nemusí vysvětlovat. Například jedoucí sanitka stačí k Dopplerovu jevu, kniha se zákazem k zakázanému románu a pulsar s paprskem k vesmírným pulzům. Nepřidávej Zemi, graf frekvence, magnetické pole a přístroje jen proto, že souvisejí s tématem. Metadata nejsou seznam všeho, co se musí nakreslit. Vol podle kontextu: jednoduchý vědecký vztah, kontrast či interakce jsou vhodné, pokud jsou čitelné na první pohled. Pokud by bylo potřeba mnoho samostatných předmětů, několik kroků nebo šipkový řetězec vysvětlující, co z čeho plyne, vyber raději jeden rozpoznatelný aspekt. Jedna užitečná šipka sama o sobě není problém; rozhoduje celková jednoduchost. Zachovej věcnou správnost vybraného aspektu a čitelnost při 160×90 px. Nepřidávej název objektu jako popisek. Opravené i výslovně uživatelem vyžádané ilustrace zapni v kartách; případné redakční výhrady poctivě eviduj. Podrobnosti obsahují ilustrační a metadatový skill.

- Při sdílení ilustrací rozlišuj obsahovou duplicitu od shody konkrétní scény. Oprava pozadí má zachovat nejlépe odpovídající námět; průhledná ilustrace jiného příběhu není automaticky náhradou. U experimentů ověř i směr účinku (u 9 pozitivnější hodnocení po malé odměně). Podrobnosti a výslovně zvolené sdílení 9/82 popisuje `skills/faakt-illustrations/SKILL.md`.

- **Brána originality nových postů:** dodrž `skills/faakt-create-posts/SKILL.md` a `docs/post-knowledge.md`; přečti známé duplicity. Dolož aktuální ověřený významový index všech ID, přečtení úplného kompaktního katalogu a verdikt pro každý námět s blízkými plnými texty a konkrétním rozdílem. Opakovaný mechanismus v jiném příběhu je duplicita. Celé nezměněné ověřené články není nutné opakovaně číst. Ověř i hotové texty mezi sebou a stav databáze před zápisem; použij kontroly plánu, návrhů a `append` s aktuálními otisky. Pracovní `knowledge` se ukládá do oddělených registrů, rozhodnutí do `reports/`.
- For generating post illustrations from existing metadata, use `skills/faakt-illustrations/SKILL.md`. The workflow and helper are part of this repository and work with any AI agent, without a Codex dependency.
- Po odmítnutí ilustračního námětu pokračuj v rámci stejného ID náhradním motivem podle sekce „Fallback after a provider refusal“ v ilustračním skillu. U osoby zvol skutečně anonymní scénu, pokud nese téma, jinak relevantní motiv bez osoby; nepřejmenovávej stejnou podobiznu. Nejvýše dva odlišné fallbacky, potom poctivě nahlas případnou překážku. Přijatý výsledek ulož, eviduj původní pokusy a zapni v kartách i galerii.

- For creating new posts, use [skills/faakt-create-posts/SKILL.md](skills/faakt-create-posts/SKILL.md). Read the full current posts database and reject any central idea already covered; title-only checks are insufficient. This provider-independent skill specifies current content structure, categories and illustration metadata together with the editorial handoff.
<!-- Explicitní výjimka pro uživatelem zadané doplnění číselné mezery. -->
Pokud uživatel výslovně požádá vyplnit chybějící ID, má tento požadavek přednost před výchozím pokračováním nad maximem. Ověř aktuální volná ID a použij je vzestupně; příkazy `check-plan`, `check-drafts` a `append` v `scripts/post-knowledge.py` v takovém případě vyžadují výslovné `--fill-gaps`. Režim neumožňuje přepsat existující ID ani přeskočit první volné ID. Bez této volby zůstává dosavadní pravidlo maxima + 1. Obsahové kontroly, zdroje a redakční schválení platí beze změny.
