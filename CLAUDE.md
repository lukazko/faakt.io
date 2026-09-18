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
- Git commity končí: `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`
- Po schválení merge do main, Actions nasadí automaticky

## Známé problémy
- GitHub Pages ignoruje `_app/` → řeší `.nojekyll` v `static/`
- Base path `/faakt.io` → fetch URL musí být `${base}/data/posts.json` (s lomítkem)
- Dev server s base path: app je na `http://localhost:5173/faakt.io/`, ne na `/`
