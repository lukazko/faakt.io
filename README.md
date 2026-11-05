# faakt.io

Doomscrolling, ale lepší — scrollovací feed s historickými fakty, filozofií, vědou a uměním.

## Lokální spuštění

```bash
# 1. Stáhnout repozitář
git clone https://github.com/lukazko/faakt.io.git
cd faakt.io

# 2. Nainstalovat závislosti
npm install

# 3. Spustit vývojový server
npm run dev
```

Otevři **http://localhost:5173/** v prohlížeči.

### Zobrazení na mobilu

```bash
npm run dev -- --host
```

V terminálu uvidíš lokální IP (např. `http://192.168.0.68:5173/`) — otevři ji na mobilu ve stejné síti.

### Ostrý build

```bash
npm run build
npm run preview
```

Build vygeneruje statické soubory do `build/` a `preview` je obslouží na **http://localhost:4173/**.

## Generování obsahu

Nejprve se ověřuje originalita proti významovému indexu. Pointy a tagy jsou uložené odděleně od článků; celý postup včetně formátu plánu popisuje [docs/post-knowledge.md](docs/post-knowledge.md).

```bash
npm run knowledge -- status
npm run knowledge -- search --query "téma nového příspěvku"
```

Při použití autorizovaného Claude API nastav `ANTHROPIC_API_KEY` a předej zkontrolovaný plán:

```bash
npm run generate -- --plan reports/plan.json --output reports/drafts.json
```

Počet a témata určuje plán. Generátor ukládá pouze pracovní návrhy; kontrola zdrojů a finálních textů předchází připojení přes `post-knowledge.py append`. Tento nástroj uloží články bez pracovního pole `knowledge` a metadata rozdělí do samostatných souborů. Nepublikuje web.

Požadavky na generování:
- **100% reálná fakta** — žádné AI výmysly
- **Ověřitelné zdroje** — každý příspěvek obsahuje 2–3 odkazy
- **Obsah před životopisem** — u lidí se soustřeď na hlavní myšlenku, objev, dílo nebo událost; biografické údaje uváděj jen tehdy, když jsou pro vysvětlení podstatné
- **Titulek nemusí obsahovat jméno** — může být postavený na principu, objevu, díle nebo důsledku
- **Kategorie**: všech 14 hodnot z `src/lib/categories.js`; tematické tagy upřesňuje `static/data/tags.json`

## Nasazení

### GitHub Pages

1. Přejmenuj repozitář na GitHubu na `faakt.io`
2. V **Settings → Pages** nastav:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
3. Spusť deploy:
```bash
npm run deploy
```

Stránka bude dostupná na **https://lukazko.github.io/faakt.io/**.

## Struktura projektu

```
faakt.io/
├── src/
│   ├── app.html              # HTML shell
│   ├── app.css               # Globální styly (dark theme)
│   ├── routes/
│   │   ├── +layout.svelte    # Layout
│   │   ├── +layout.js        # Prerender konfigurace
│   │   ├── +page.svelte      # Hlavní stránka — náhodný feed
│   │   └── post/
│   │       └── [id]/
│   │           ├── +page.svelte      # Stránka konkrétní myšlenky
│   │           └── +page.server.js   # Napojení na JSON data
│   └── lib/components/
│       ├── FeedView.svelte   # Scrollovací feed s random řazením
│       └── PostCard.svelte   # Karta příspěvku se zdroji
├── static/
│   └── data/
│       ├── posts.json              # Články se zdroji a ilustračními metadaty
│       ├── post-knowledge.json     # Přiřazení poznatků a tagů k ID
│       ├── knowledge-ideas.json    # Společné pointy a druhy obsahu
│       └── tags.json               # Řízený tematický slovník
├── editorial/knowledge-state.json  # Neveřejné otisky a stav významové kontroly
├── scripts/
│   ├── generate-posts.mjs    # Generování přes Claude API
│   ├── post-knowledge.py    # Katalog, hledání a hlídaný zápis článků/metadat
│   └── deploy-gh-pages.mjs   # Deploy na GitHub Pages
├── package.json
└── svelte.config.js
```

## Technologie

- **SvelteKit 2** + **adapter-static** — čistě statický výstup
- **Vite 6** — build tool
- **CSS scroll-snap** — TikTok-like vertikální scrollování
- **Web Share API** — nativní share dialog na mobilu
- **Fisher-Yates shuffle** — náhodné pořadí při každém načtení
