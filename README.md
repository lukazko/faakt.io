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

Nové příspěvky se generují přes Claude API:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm run generate
```

Výchozí počet je 30 příspěvků. Můžeš změnit:

```bash
npm run generate --count=50
```

Požadavky na generování:
- **100% reálná fakta** — žádné AI výmysly
- **Ověřitelné zdroje** — každý příspěvek obsahuje 2–3 odkazy
- **Obsah před životopisem** — u lidí se soustřeď na hlavní myšlenku, objev, dílo nebo událost; biografické údaje uváděj jen tehdy, když jsou pro vysvětlení podstatné
- **Titulek nemusí obsahovat jméno** — může být postavený na principu, objevu, díle nebo důsledku
- **Kategorie**: historie, filozofie, věda, umění, literatura, politika, fyzika, astronomie, zajímavost

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
│   └── data/posts.json       # Všechny příspěvky (neustále roste)
├── scripts/
│   ├── generate-posts.mjs    # Generování přes Claude API
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