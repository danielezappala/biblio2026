# Development Log

Running log of implementation progress, technical difficulties, adopted solutions, and deviations from the agreed plan.

## Entry Template

### YYYY-MM-DD - Short title
- Scope:
- Difficulties:
- Solution:
- Differences from plan:
- Validation:

## 2026-03-08 - Status snapshot and workflow alignment
- Scope: Reviewed the current repository status against AGENTS.md, docs/specs/STEERING.md, docs/specs/SPEC-1.md, docs/specs/USER-STORIES.md, and docs/specs/TASKS-MVP.md. Added this development log as a workflow artifact.
- Difficulties: The planned scope and the implemented scope are no longer perfectly aligned, which makes progress reporting ambiguous. PowerShell execution policy also blocked npm.ps1, which initially prevented validation commands from running through the plain npm alias.
- Solution: Compared specs and code directly, then reran validation with npm.cmd instead of npm. Formalized a shared log so future divergence is documented as it happens instead of being reconstructed later.
- Differences from plan: The plan for US-1 and Sprint 1 still states email/password login, while the implementation currently uses Google Sign-In. The codebase also includes bootstrap flows for library creation, invite claiming, and viewer invitation, which go beyond the originally scoped Sprint 1 documentation.
- Validation: npm.cmd run typecheck, npm.cmd run lint, and npm.cmd run build completed successfully on 2026-03-08. Build output reported a large JavaScript chunk warning, so performance optimization is still open.

## 2026-03-08 - Documentation realigned to current implementation
- Scope: Updated product and planning documents to match the code currently present in the repository.
- Difficulties: The original planning documents described email/password authentication and a narrower Sprint 1, while the code now includes Google Sign-In, owner bootstrap, no-membership handling, invite claim, and viewer invitation management.
- Solution: Rewrote the affected spec files to reflect the implemented authentication model, current membership flows, and actual Sprint 1 completion state.
- Differences from plan: The documented MVP now explicitly reflects the current Google-based access model and the additional membership flows already implemented before the documentation caught up.
- Validation: Cross-check completed across AGENTS.md, docs/specs/STEERING.md, docs/specs/SPEC-1.md, docs/specs/USER-STORIES.md, and docs/specs/TASKS-MVP.md. No code changes were required for this alignment.
## 2026-03-08 - Smoke test locali da terminale
- Scope: Executed the smoke tests that are realistically runnable from the current terminal environment.
- Difficulties: Full authentication smoke tests cannot be completed here because the app uses Google Sign-In and the environment does not provide an interactive browser session or test credentials. A first background launch of the dev server also terminated unexpectedly, so the server check had to be re-run in a single controlled command.
- Solution: Validated the codebase with npm.cmd run typecheck, npm.cmd run lint, and npm.cmd run build, then started the Vite dev server and probed the local app shell through HTTP requests to /, /login, and /catalog.
- Differences from plan: The QA checklist implies end-to-end login and role validation, but in this environment only terminal-driven smoke checks were executable. Manual validation for Google login success/failure, viewer permissions, and real catalog navigation is still pending.
- Validation: npm.cmd run typecheck OK; npm.cmd run lint OK; npm.cmd run build OK; Vite dev server responded with HTTP 200 on /, /login, and /catalog; root HTML included the expected /src/main.tsx bootstrap. Build still reports a large JavaScript chunk warning.
## 2026-03-08 - Smoke test manuali Sprint 1
- Scope: Recorded the outcome of the manual smoke tests executed against the current Sprint 1 flows.
- Difficulties: Catalog validation from list, search, and detail could not be completed because there are no books available in the current test library.
- Solution: Marked authentication and membership smoke tests as completed, and kept catalog-related validation explicitly open with the blocking reason documented.
- Differences from plan: Sprint closure is now blocked by test data availability rather than by missing authentication or permission features.
- Validation: Tests 1-6 completed with OK result: valid Google login, no-membership handling, owner bootstrap, viewer invite, viewer claim, and viewer read-only permissions. Tests 7 onward were not executable due to empty catalog data.