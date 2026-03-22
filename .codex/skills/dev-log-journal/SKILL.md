---
name: dev-log-journal
description: Use when updating docs/DEV-LOG.md in this repository. Keeps the development diary complete, concise, and in reverse chronological order with the newest entries at the top.
---

# Dev Log Journal

Use this skill whenever the task adds, edits, reorders, or validates entries in `docs/DEV-LOG.md`.

## Goal

Keep `docs/DEV-LOG.md` as a reliable running diary of meaningful development sessions.

## Workflow

1. Read `AGENTS.md` and the current `docs/DEV-LOG.md` header/template before editing.
2. If the task changes diary workflow rules, cross-check `docs/specs/STEERING.md`, `docs/specs/SPEC-1.md`, `docs/specs/USER-STORIES.md`, and `docs/specs/TASKS-MVP.md` for consistency.
3. Insert every new session immediately below `## Entry Template`.
4. Keep entries in reverse chronological order:
   - newer dates above older dates
   - for the same date, the newest session stays above earlier sessions from that date
5. Preserve this entry shape:

```md
## YYYY-MM-DD - Short title
- Scope:
- Difficulties:
- Solution:
- Differences from plan:
- Validation:
```

6. Record only meaningful sessions. Be concrete and brief.
7. Do not rewrite historical content unless needed for ordering, formatting consistency, or factual correction tied to the current task.

## Entry Rules

- `Scope` states what changed or was investigated.
- `Difficulties` states the actual blocker, risk, or notes `None`.
- `Solution` states the adopted fix or decision.
- `Differences from plan` states the deviation explicitly, or `None`.
- `Validation` states checks run, user confirmation, or `Not run`.

## Output Standard

- Keep the file readable as plain Markdown.
- Leave a blank line between entries.
- If the file is out of order, reorder the touched section so the newest items are on top.
