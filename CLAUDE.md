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
  id: string;           // "001", "002", …
  title: string;        // max 80 znaků, chytlavý
  content: string;      // 2-4 věty, ověřitelná fakta
  category: string;     // viz kategorie
  sources: Array<{      // vždy 2-3 položky
    label: string,      // název zdroje
    url: string         // přímý odkaz
  }>;
}
```

## Kategorie
`historie`, `filozofie`, `veda`, `umeni`, `literatura`, `politika`, `fyzika`, `astronomie`, `zajimavost`, `ekonomie`, `psychologie`, `filmy`, `matematika`, `pocitacove-vedy`, `ekonomie`, `psychologie`, `filmy`

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

## Zadání pro externí AI agenty
- Přenositelný prompt pro tvorbu nových příspěvků je v `docs/generovani-postu-handoff.md`.
- **Při každé změně datové struktury příspěvků, způsobu jejich generování nebo redakčních pravidel obsahu aktualizuj tento soubor ve stejné změně.** Udržuj v souladu ukázkový JSON, datové typy a povolené hodnoty včetně kategorií a ilustračních metadat.
- Nové příspěvky obsahují `illustration` se všemi poli a pravidly uvedenými v zadání; metadata musí vycházet z titulku i celého obsahu.

## Skripty
```bash
npm run dev              # Lokální vývoj (http://localhost:5173/faakt.io/)
npm run dev -- --host    # + přístup z mobilu v síti
npm run build            # Sestavení do build/
npm run preview          # Náhled ostrého buildu
npm run generate         # Generování nových příspěvků (přes Claude API)
npm run deploy           # Ruční deploy na gh-pages (fallback, primárně Actions)
```

Generování: `ANTHROPIC_API_KEY=sk-ant-... npm run generate --count=30`

## Architektura a chování

### Feed a řazení
- Lokální test: pouze při `npm run dev` lze tlačítkem „Podle ID“ v odznaku vlevo dole výslovně zapnout číselné řazení příspěvků. Volbu drží URL `?order=id`, případně s `&post=005` pro začátek na konkrétním příspěvku. Tlačítko „Náhodně“ režim vypne. Bez této volby se feed dál míchá; produkční build parametr ignoruje a přepínač neobsahuje.
- **Fisher-Yates shuffle** při každém načtení stránky — každý uživatel vidí myšlenky v jiném pořadí
- Pokud je otevřeno `/post/005`, tato myšlenka je první, zbytek je náhodný
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
- Každá změna do samostatné **branch**e
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

- Při sdílení ilustrací rozlišuj obsahovou duplicitu od shody konkrétní scény. Oprava pozadí má zachovat nejlépe odpovídající námět; průhledná ilustrace jiného příběhu není automaticky náhradou. U experimentů ověř i směr účinku (u 009 pozitivnější hodnocení po malé odměně). Podrobnosti a výslovně zvolené sdílení 009/082 popisuje `skills/faakt-illustrations/SKILL.md`.

- **Brána originality nových postů:** dodrž povinnou kontrolu v `skills/faakt-create-posts/SKILL.md` a přečti `skills/faakt-create-posts/references/duplicity.md`. Kontrola musí doložit pokrytí celé aktuální databáze (hash, počet, všechna ID) a pracovní verdikt ke každému návrhu s nejbližšími existujícími posty a konkrétním novým poznatkem. Opakovaný mechanismus v jiném příběhu je duplicita. Ověř i hotové texty mezi sebou a změny databáze před zápisem; bez dokončené kontroly dávku nepředávej ani nezapisuj. Pracovní přehled nepatří do datového schématu postů.
- For generating post illustrations from existing metadata, use `skills/faakt-illustrations/SKILL.md`. The workflow and helper are part of this repository and work with any AI agent, without a Codex dependency.

- For creating new posts, use [skills/faakt-create-posts/SKILL.md](skills/faakt-create-posts/SKILL.md). Read the full current posts database and reject any central idea already covered; title-only checks are insufficient. This provider-independent skill specifies current content structure, categories and illustration metadata together with the editorial handoff.
