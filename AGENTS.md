# Shared instructions for AI agents

Read [CLAUDE.md](CLAUDE.md) for project conventions; despite its filename, it documents shared project knowledge for all agents.

## Repository skills

- [faakt-create-posts](skills/faakt-create-posts/SKILL.md): add complete Czech posts to the app, including originality checks, verified content, illustrations, cards and a running local test. Provider-independent workflow for any AI agent.
- [faakt-metadata-review](skills/faakt-metadata-review/SKILL.md): review illustration metadata against full post content, apply targeted corrections and resume subsequent checks efficiently. Use when asked to audit or repair the meaning of post illustration metadata. The workflow and Python helpers are independent of any agent provider.
- [faakt-illustrations](skills/faakt-illustrations/SKILL.md): generate compact static post illustrations from existing metadata with cache checks and mobile-first art direction.

Skills are stored in this repository under `skills/`. Open the relevant `SKILL.md` and resolve its relative file links from that skill's directory.

## Projektové prompty

Když uživatel pošle některý z povelů níže, otevři uvedený soubor z aktuálního checkoutu a proveď jeho instrukce. Zbytek zprávy ber jako argumenty. Stejně fungují textové aliasy bez lomítka.

| Povel v chatu | Prompt | Textový alias |
| --- | --- | --- |
| `/release-notes` | [Release notes](prompts/release-notes.md) | `release-notes` |
| `/build-dev` | [Vývojový server](prompts/build-dev.md) | `build-dev` |
| `/build-prod` | [Produkční náhled](prompts/build-prod.md) | `build-prod` |
| `/dalsi-ilustrace [počet]` | [Další ilustrace](prompts/dalsi-ilustrace.md) | `další ilustrace` |
| `/generovani-postu [počet a téma]` | [Nové příspěvky](prompts/generovani-postu.md) | `přidej nové posty` |

Prompty ukládej do `prompts/`, jejich spustitelné pomocné skripty do `scripts/`. Pro nativní nabídku Codexu zaregistruje `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/register-codex-prompts.ps1` místní odkazy. Po znovunačtení klienta mají příkazy v nabídce tvar `/prompts:release-notes` a stejný prefix pro ostatní názvy.

## Přidání nových postů do aplikace

Požadavky jako **„přidej nové posty“** nebo **„vygeneruj 20 nových postů“** v tomto repozitáři standardně znamenají dokončit celý postup: ověřený originální obsah → zápis do databáze a významového indexu → skutečné ilustrace → zapojení do karet a galerie → kontroly → běžící aplikace pro lokální test s odkazem na nové posty. Samotný JSON, ilustrační metadata ani úspěšný build nejsou dokončením tohoto požadavku. Na ilustrace ani lokální spuštění se znovu neptej; jsou součástí zadání. Podrobný postup určuje [faakt-create-posts](skills/faakt-create-posts/SKILL.md).

Výslovný požadavek pouze na návrhy, texty nebo JSON tento rozsah zužuje. Lokální test neznamená merge do `main`, push spouštějící veřejné nasazení ani publikaci na GitHub Pages.
