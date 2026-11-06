# Shared instructions for AI agents

Read [CLAUDE.md](CLAUDE.md) for project conventions; despite its filename, it documents shared project knowledge for all agents.

## Repository skills

- [faakt-create-posts](skills/faakt-create-posts/SKILL.md): add complete Czech posts to the app, including originality checks, verified content, illustrations, cards and a running local test. Provider-independent workflow for any AI agent.
- [faakt-metadata-review](skills/faakt-metadata-review/SKILL.md): review illustration metadata against full post content, apply targeted corrections and resume subsequent checks efficiently. Use when asked to audit or repair the meaning of post illustration metadata. The workflow and Python helpers are independent of any agent provider.
- [faakt-illustrations](skills/faakt-illustrations/SKILL.md): generate compact static post illustrations from existing metadata with cache checks and mobile-first art direction.

Skills are stored in this repository under `skills/`. Open the relevant `SKILL.md` and resolve its relative file links from that skill's directory.

## Rychlý povel pro ilustrace

Povel **„další ilustrace“** spouští [faakt-illustrations](skills/faakt-illustrations/SKILL.md). Pokud chybí počet, zeptej se „Pro kolik dalších příspěvků chceš vygenerovat ilustrace?“ a počkej na odpověď. Potom bez dalšího potvrzování zpracuj zadaný počet dosud chybějících ilustrací vzestupně podle ID. Každé spuštění vybírá z aktuálních souborů, takže navazuje i v nové konverzaci.

## Přidání nových postů do aplikace

Požadavky jako **„přidej nové posty“** nebo **„vygeneruj 20 nových postů“** v tomto repozitáři standardně znamenají dokončit celý postup: ověřený originální obsah → zápis do databáze a významového indexu → skutečné ilustrace → zapojení do karet a galerie → kontroly → běžící aplikace pro lokální test s odkazem na nové posty. Samotný JSON, ilustrační metadata ani úspěšný build nejsou dokončením tohoto požadavku. Na ilustrace ani lokální spuštění se znovu neptej; jsou součástí zadání. Podrobný postup určuje [faakt-create-posts](skills/faakt-create-posts/SKILL.md).

Výslovný požadavek pouze na návrhy, texty nebo JSON tento rozsah zužuje. Lokální test neznamená merge do `main`, push spouštějící veřejné nasazení ani publikaci na GitHub Pages.
