# Shared instructions for AI agents

Read [CLAUDE.md](CLAUDE.md) for project conventions; despite its filename, it documents shared project knowledge for all agents.

## Repository skills

- [faakt-create-posts](skills/faakt-create-posts/SKILL.md): create new Czech posts, check their central ideas against the entire existing database and prepare complete illustration metadata. Provider-independent workflow for any AI agent.
- [faakt-metadata-review](skills/faakt-metadata-review/SKILL.md): review illustration metadata against full post content, apply targeted corrections and resume subsequent checks efficiently. Use when asked to audit or repair the meaning of post illustration metadata. The workflow and Python helpers are independent of any agent provider.
- [faakt-illustrations](skills/faakt-illustrations/SKILL.md): generate compact static post illustrations from existing metadata with cache checks and mobile-first art direction.

Skills are stored in this repository under `skills/`. Open the relevant `SKILL.md` and resolve its relative file links from that skill's directory.
