---
name: faakt-metadata-review
description: Review and correct faakt.io posts.json illustration metadata against each post's meaning. Use for individual posts, full semantic audits and repeated checks of changed records; not article rewriting, image generation or general SEO metadata.
---

# Illustration metadata review

These instructions work with any AI agent that can read files and run Python 3.10+; no provider SDK, paid API, particular model or agent-specific tool is required. Run commands from the repository root. Read applicable repository instructions in `AGENTS.md` and `CLAUDE.md`.

## Scope and meaning

Compare each illustration with the **full article**, not only its title or matching keywords. Identify its central claim, event, argument, paradox or mechanism. Correct factual mismatches and unreadable compositions; a relevant standalone subject can simply accompany that meaning. Retain sound metadata; a review does not require a rewrite of every record.

- Default source: `static/data/posts.json`. Inspect the current schema and consumers. IDs are strings with leading zeros and may have gaps; count actual records rather than assuming a contiguous range.
- Modify only `illustration`. Preserve article text, titles, sources, category, IDs, order, schema, unrelated formatting and existing user edits. Leave backups, build copies, renderer, images and manifests alone unless separately requested.
- Keep metadata in its established language (currently English), with `snake_case` subject keys. Preserve appropriate art direction rather than normalizing every palette or mood.
- A full audit covers every actual record. An explicit set of IDs limits the review to those records. Cached decisions are reusable only under the conditions below.

## Bounded, resumable review

The bundled [scripts/review.py](scripts/review.py) is deterministic: it prepares full-text batches, validates agent-authored patches and records checkpoints. It does **not** decide semantic correctness, call a model, access the network or generate images.

Use a persistent state file outside published data, for example a file in your local user cache. Reuse that path to resume or audit updates. Substitute its real path for `STATE` and a temporary review file for `REVIEW`:

```sh
python skills/faakt-metadata-review/scripts/review.py batch --state STATE --limit 12
python skills/faakt-metadata-review/scripts/review.py batch --state STATE --ids 018,022
python skills/faakt-metadata-review/scripts/review.py apply --state STATE --review REVIEW
python skills/faakt-metadata-review/scripts/review.py apply --state STATE --review REVIEW --write
python skills/faakt-metadata-review/scripts/review.py status --state STATE
```

All commands accept `--posts PATH` to override the default. Read one manageable batch at a time. If output is truncated, request smaller batches and reread missing records; never mark an unseen article reviewed. Explicit `--ids` includes cached records too. Normal batches skip previously reviewed, unchanged records. `--force` requests a new audit, appropriate when review criteria change or the user explicitly wants a fresh reread. A hash cache cannot prove its own semantic judgments correct.

For every fully inspected post, write a decision in an UTF-8 JSON array:

```json
[
  {
    "id": "018",
    "input_hash": "copy the exact hash from the batch",
    "verdict": "change",
    "reason": "The river should convey yielding and patient effectiveness, not just scenery.",
    "illustration": {
      "concept": "A river yields around rocks and follows the land while gradually carving a canyon, expressing Laozi's wu wei.",
      "secondary_subjects": ["river_bend", "eroded_canyon"]
    }
  }
]
```

`illustration` is a partial patch of existing fields. Other verdicts: `keep` (reason required, no patch), `needs_review` (reason required, no patch; stays pending). Do not claim a retained or unresolved record was changed. Use a file-writing tool rather than interpolating JSON into shell command strings.

Preview with `apply`, inspect the diff it describes, then use `--write` for local corrections already authorized by the user's request. Checkpoints refer to the **resulting** records, so immediately repeated checks skip completed work. Continue until no requested records remain pending, or explicitly report unresolved cases.

## Review criteria

- **editorial appeal:** Check whether the composition invites reading through a subject, gesture, atmosphere or contrast, rather than merely translating the text into inputs and outputs. Even one arrow joining a few detached objects can feel like an equation. Prefer a coherent scene or natural encounter when it carries the idea better, such as a pink flamingo bending toward a gray chick instead of chick + food → adult. Diagrams, arrows and illustrated principles remain valid when their visual form is itself expressive and suited to the article; object count and immediate readability alone do not decide this.
- **concept:** Select one recognizable aspect that accompanies the article. A relevant standalone object, person, simple action or concise metaphor is enough. Do not demand an explanatory relationship or a complete experiment. Read the full post to choose a subject, not to collect everything it mentions.
- **primary_subject:** Verify the selected subject's identity and factual compatibility. A relevant instrument, particle or author is valid without an illustrated discovery process. Avoid unrelated category symbols and literal misreadings of figurative language.
- **secondary_subjects:** Optional. Keep a supporting symbol when it helps immediate recognition of the chosen motif; remove even article-related objects when they add a second explanation or unnecessary complexity. Empty arrays are valid.
- **scientific visual idea:** Text explains the mechanism. A moving ambulance is sufficient for Doppler effect; a pulsar with a simple beam is sufficient without Earth, waveform, magnetic field or observer. A book with a prohibition sign is sufficient for censorship without a courtroom. Choose according to context: a simple scientific relationship or contrast can carry the point when immediately readable. When it needs many separate objects, multiple steps or arrows tracing implications, prefer one recognizable aspect. A useful single arrow is not inherently a defect; explanatory complexity is. Preserve factual accuracy of what is shown; omitted explanatory context is not an error. Do not use object-name captions.
- **visual_keywords:** Reinforce the chosen scene. Remove leftover decorations and word-fragment matches, such as architectural detail in a star scene.
- **scene_type / composition_hints:** Match the intended scene and current supported schema. A board or chart is not a portrait; a process requires change; a comparison needs a clear relation.
- **centering:** Default to an optically centered main motif with balanced empty margins. Preserve intentional asymmetry only when it supports the specific meaning, interaction or movement; remove inherited asymmetric layout hints that have no such purpose.
- **mood / palette:** Preserve appropriate choices. Correct clearly inappropriate emotional direction, such as a playful treatment of suffering. Palette alone rarely warrants a semantic correction.

Diagnostic examples from this dataset, not permanent ID-based replacement rules:

- A river flowing around a rock is a possible wu wei motif; it need not also show erosion or prove the teaching.
- Buddha's teaching about non-attachment does not establish a scene of detached hands releasing a gold ball. A portrait in meditation is preferable to adding an unspecified "desired object" that the generator must invent. Do not turn this example into a global ban on metaphor; retain metaphors only when their concrete elements and relationship are supported and clearly communicate the particular text.
- Rosetta Stone needs corresponding inscriptions, not a particle accelerator. Franklin's DNA diffraction is not an automobile wheel.
- Distinguish Mars Ingenuity from a Venus probe, Svejk from Catch-22, Galois from Abel, a Pioneer plaque from Voyager's record, a mantis shrimp from a pistol shrimp.
- A black hole alone may accompany the information paradox. If an instrument is included, identify it correctly; radio-interferometry must not be depicted as an ordinary optical camera. Omitting the instrument is valid.
- Preserve epistemic limits: a hypothesis remains a hypothesis; a contested experiment is not proof about everyone; abstract mathematical decompositions do not duplicate physical gold.

Review fidelity to the supplied article, not a general fact-check. If an uncertain fact materially changes the scene, verify that specific issue with authoritative sources or leave it unresolved. Do not silently rewrite the article or introduce unsupported certainty.

## Validation and delivery

- The helper guards against stale decisions, concurrent data edits, duplicate/unknown IDs, wrong field types and fields outside the existing illustration schema. It preserves bytes outside changed illustration objects. Check the proposed diff before writing.
- Inspect consumers of changed keys and scene types. `primary_subject` values are descriptive metadata, not automatically supported SVG keys. Report material renderer limitations; don't turn an audit into a renderer migration. Existing raster images may become stale; generate new images only on request.
- Repository `scripts/repair-illustrations.py` contains historical ID rules, not a semantic oracle. If repository instructions call for it, run its report-only mode and inspect suggestions. Do not blindly apply old rules over newer curated metadata.
- Run relevant existing checks. Compare failures against the **pre-edit working snapshot**, not just HEAD, without reverting user files. Matching failure names/counts alone do not prove identical failures; inspect changed diagnostics. Don't update snapshots just to hide failures.
- Report coverage, retained/changed/unresolved counts, checkpoint reuse and meaningful examples in the user's language. Be explicit that only metadata changed. Never report complete coverage while requested records remain pending.
- Helper regression checks: `python skills/faakt-metadata-review/scripts/test_review.py`.
