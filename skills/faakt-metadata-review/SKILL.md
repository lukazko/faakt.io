---
name: faakt-metadata-review
description: Review and correct faakt.io posts.json illustration metadata against each post's meaning. Use for individual posts, full semantic audits and repeated checks of changed records; not article rewriting, image generation or general SEO metadata.
---

# Illustration metadata review

These instructions work with any AI agent that can read files and run Python 3.10+; no provider SDK, paid API, particular model or agent-specific tool is required. Run commands from the repository root. Read applicable repository instructions in `AGENTS.md` and `CLAUDE.md`.

## Scope and meaning

Compare each illustration with the **full article**, not only its title or matching keywords. Identify its central claim, event, argument, paradox or mechanism. Correct mismatches and descriptions too generic to convey that meaning. Retain sound metadata; a review does not require a rewrite of every record.

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

- **concept:** Choose an explanatory relationship (cause and effect, contrast, sequence, uncertainty, conflict or paradox) when the text supports a legible scene. For an abstract teaching that would require invented props, a restrained portrait of its actual author or teacher is valid; describe its accompanying role honestly instead of manufacturing a diagram. Prefer one coherent scene over a collage of article nouns or a portrait plus an unrelated symbolic vignette.
- **primary_subject:** Use the actual central entity or mechanism. Check named people, species, places and events in the body. Avoid literal depictions of figurative wording, incidental objects, generic category symbols and discovery instruments displacing the discovered object.
- **secondary_subjects:** Retain symbols and supporting objects that meaningfully relate to the full article and keep the composition understandable. They may interpret an abstract idea and need not be literally mentioned or indispensable. Remove unrelated additions, duplicates, aliases and objects that make the composition too complex. Preserve cues needed to identify a particular historical event rather than reducing it to generic architecture.
- **scientific visual idea:** Describe a meaningful visible relationship, revealing detail or article-specific concept rather than requiring a measurement diagram for every experiment. An isolated named particle or unexplained apparatus is insufficient. Do not add the subject's name underneath it or use captions and schematic marks to compensate for missing visual meaning. Text may add distinct information, such as origin, but may never merely name the pictured object. A historical hypothesis may be visualized as the subject of inquiry without asserting its truth; preserve that distinction in the concept and review. Prefer a coherent editorial image to an abstract diagram requiring explanation.
- **visual_keywords:** Reinforce the chosen scene. Remove leftover decorations and word-fragment matches, such as architectural detail in a star scene.
- **scene_type / composition_hints:** Match the intended scene and current supported schema. A board or chart is not a portrait; a process requires change; a comparison needs a clear relation.
- **mood / palette:** Preserve appropriate choices. Correct clearly inappropriate emotional direction, such as a playful treatment of suffering. Palette alone rarely warrants a semantic correction.

Diagnostic examples from this dataset, not permanent ID-based replacement rules:

- Laozi's river should adapt to terrain and change it patiently to convey wu wei.
- Buddha's teaching about non-attachment does not establish a scene of detached hands releasing a gold ball. A portrait in meditation is preferable to adding an unspecified "desired object" that the generator must invent. Do not turn this example into a global ban on metaphor; retain metaphors only when their concrete elements and relationship are supported and clearly communicate the particular text.
- Rosetta Stone needs corresponding inscriptions, not a particle accelerator. Franklin's DNA diffraction is not an automobile wheel.
- Distinguish Mars Ingenuity from a Venus probe, Svejk from Catch-22, Galois from Abel, a Pioneer plaque from Voyager's record, a mantis shrimp from a pistol shrimp.
- A black-hole image needs the correct radio-interferometry context, not an ordinary optical camera. An information paradox needs an unresolved relationship, not merely a dark circle.
- Preserve epistemic limits: a hypothesis remains a hypothesis; a contested experiment is not proof about everyone; abstract mathematical decompositions do not duplicate physical gold.

Review fidelity to the supplied article, not a general fact-check. If an uncertain fact materially changes the scene, verify that specific issue with authoritative sources or leave it unresolved. Do not silently rewrite the article or introduce unsupported certainty.

## Validation and delivery

- The helper guards against stale decisions, concurrent data edits, duplicate/unknown IDs, wrong field types and fields outside the existing illustration schema. It preserves bytes outside changed illustration objects. Check the proposed diff before writing.
- Inspect consumers of changed keys and scene types. `primary_subject` values are descriptive metadata, not automatically supported SVG keys. Report material renderer limitations; don't turn an audit into a renderer migration. Existing raster images may become stale; generate new images only on request.
- Repository `scripts/repair-illustrations.py` contains historical ID rules, not a semantic oracle. If repository instructions call for it, run its report-only mode and inspect suggestions. Do not blindly apply old rules over newer curated metadata.
- Run relevant existing checks. Compare failures against the **pre-edit working snapshot**, not just HEAD, without reverting user files. Matching failure names/counts alone do not prove identical failures; inspect changed diagnostics. Don't update snapshots just to hide failures.
- Report coverage, retained/changed/unresolved counts, checkpoint reuse and meaningful examples in the user's language. Be explicit that only metadata changed. Never report complete coverage while requested records remain pending.
- Helper regression checks: `python skills/faakt-metadata-review/scripts/test_review.py`.
