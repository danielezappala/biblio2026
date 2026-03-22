# Development Log

Running log of implementation progress, technical difficulties, adopted solutions, and deviations from the agreed plan.

## Entry Template

### YYYY-MM-DD - Short title
- Scope:
- Difficulties:
- Solution:
- Differences from plan:
- Validation:

## 2026-03-22 - Skill locale per il diario di bordo
- Scope: Created a project-local skill to manage `docs/DEV-LOG.md`, formalized reverse chronological ordering in repository workflow docs, and reordered the existing development log so the latest entries appear first.
- Difficulties: The log already contained valid historical entries, but they were appended in chronological order, so the skill needed to standardize insertion behavior without rewriting the historical substance.
- Solution: Added `.codex/skills/dev-log-journal/SKILL.md`, updated the diary workflow rules in `AGENTS.md` and `docs/specs/TASKS-MVP.md`, and reordered `docs/DEV-LOG.md` into reverse chronological order.
- Differences from plan: None.
- Validation: Cross-check completed against `AGENTS.md`, `docs/specs/STEERING.md`, `docs/specs/SPEC-1.md`, `docs/specs/USER-STORIES.md`, and `docs/specs/TASKS-MVP.md`. No code validation was required.

## 2026-03-22 - Chiusura formale Sprint 1
- Scope: Recorded the final manual smoke test results needed to close Sprint 1 and aligned the task tracker with the validated product state.
- Difficulties: Sprint closure had remained open because catalog validation was previously blocked by missing test data and because the multi-library admin panel needed a production-grade fix before final QA could be trusted.
- Solution: Reused the seeded test books, completed the final 5-minute smoke checklist on login, catalog, prefix search, book detail, active library switch, member management, and session regression, then marked Sprint 1 as closed in the planning document.
- Differences from plan: Sprint 1 closed later than the original calendar due to missing seed data and a debugging cycle on owner library selection, but no further scope was added beyond the already documented admin panel enhancement.
- Validation: User-reported manual smoke tests all passed on 2026-03-22 with `1 OK`, `2 OK`, `3 OK`, `4 OK`, `5 OK`, `6 OK`, `7 OK`.

## 2026-03-22 - Risoluzione definitiva pannello admin multi-libreria
- Scope: Closed the investigation on the admin library selector and restored the catalog page to a normal user-facing state.
- Difficulties: The root cause was not the selector widget itself but Firestore permissions on the `libraries` query. The intermediate `collectionGroup('memberships')` workaround added complexity and misleading failure modes. A temporary diagnostics panel was necessary to isolate where the read failed.
- Solution: Updated Firestore Rules so an authenticated owner can read `libraries` documents where `ownerUserId == request.auth.uid`, reverted the selector data source to a direct query on `libraries`, verified the fix in the running app, and then removed the temporary diagnostics block from the UI.
- Differences from plan: A temporary diagnostics surface was introduced in production briefly to accelerate debugging, then removed once the issue was understood and fixed.
- Validation: Static checks passed (`npm.cmd run typecheck`, `npm.cmd run lint`). User confirmation reported that the panel now works. The diagnostics UI was removed after confirmation.

## 2026-03-22 - Deploy completo pannello multi-libreria
- Scope: Deployed the latest app build and Firebase configuration after the fix for the admin library selector.
- Difficulties: The build still required elevated execution because of the known sandbox `esbuild spawn EPERM` limitation. The bundle size warning remains open.
- Solution: Ran `npm.cmd run build` outside the sandbox and deployed with `npx.cmd firebase-tools deploy --project biblio2026-35f4e`.
- Differences from plan: None on functional scope. This was a standard live deploy after the bugfix.
- Validation: Deploy completed successfully on 2026-03-22; Hosting live channel updated; Firestore rules released; Firestore indexes confirmed. Live URL: `https://biblio2026-35f4e.web.app`.

## 2026-03-22 - Pannello admin multi-libreria
- Scope: Implemented an owner/admin panel to list owned libraries and switch the active library without logging out.
- Difficulties: The current session model only tracked one primary library, so the feature needed both UI work and an update path for `user_memberships`. Firestore rules also blocked self-service switching of the primary library.
- Solution: Added owned-library subscription to the auth session, exposed `switchPrimaryLibrary` through the auth context, rendered a selection panel in the catalog page, and updated Firestore rules to allow a signed-in user to switch the primary library only when a matching membership exists.
- Differences from plan: The owner role now behaves as an admin across multiple owned libraries, which was not explicit in the original MVP wording.
- Validation: `npm.cmd run typecheck` OK; `npm.cmd run lint` OK; `npm.cmd run build` OK after rerunning outside the sandbox because of the known `esbuild spawn EPERM` environment issue.

## 2026-03-22 - Diagnosi ricerca catalogo vuota
- Scope: Investigated why searching for a known seeded book returned no results in the deployed app.
- Difficulties: The query logic was correct, but the seeded books had been created in the `Test1` library while the current authenticated session was still bound to a different `primaryLibraryId`.
- Solution: Inspected Firestore `user_memberships`, confirmed the active primary library was `51fc57ae-8dac-478d-856b-c0199720587e` (`Biblioteca di Antonio`), then seeded the same 4 test books and shared notes into that active library as well.
- Differences from plan: Test data had originally been prepared in an auxiliary library rather than in the library actually used by the current session, so search validation failed for environmental reasons instead of code defects.
- Validation: Firestore inspection confirmed books existed only in `wZhQ0BvZAJXABYnYhb9o` before the fix; the follow-up seed completed successfully with `OK primaryLibraryId=51fc57ae-8dac-478d-856b-c0199720587e seededBooks=4`.

## 2026-03-22 - Deploy su Firebase live
- Scope: Built the current app and deployed Hosting plus Firestore configuration to the configured Firebase project.
- Difficulties: The first local build failed inside the sandbox with `spawn EPERM` from `esbuild`, so the build had to be rerun outside the sandbox. The build still reports a large JavaScript chunk warning.
- Solution: Reran `npm.cmd run build` with elevated execution, then deployed with `npx.cmd firebase-tools deploy --project biblio2026-35f4e`.
- Differences from plan: None on product scope. The only operational deviation was needing elevated execution for the build step in this environment.
- Validation: Deploy completed successfully on 2026-03-22 to project `biblio2026-35f4e`; Hosting live channel updated; Firestore rules released; Firestore indexes confirmed deployed. Live URL: `https://biblio2026-35f4e.web.app`.

## 2026-03-22 - Seed libri di test per Sprint 1
- Scope: Added and executed a Firestore seed script to create test books and shared notes for the Test1 library.
- Difficulties: The first seed attempt failed because Google ADC were not configured in the environment. After forcing the local service account JSON, the script failed again because the target Test1 library did not yet exist remotely.
- Solution: Added `scripts/dev/seed-test1-books.mjs`, exposed it through `npm run seed:books:test1`, initialized the remote Test1 library with the existing init script, then reran the seed with `GOOGLE_APPLICATION_CREDENTIALS` pointing to the local admin SDK JSON.
- Differences from plan: Sprint 1 validation now depends on seeded data created through an explicit dev utility rather than on pre-existing manual data.
- Validation: `npm.cmd run init:library:test1` completed successfully with `libraryId=wZhQ0BvZAJXABYnYhb9o`; `npm.cmd run seed:books:test1` completed successfully with `seededBooks=4`; each seeded book also received a shared note document for detail-page testing.

## 2026-03-08 - Smoke test manuali Sprint 1
- Scope: Recorded the outcome of the manual smoke tests executed against the current Sprint 1 flows.
- Difficulties: Catalog validation from list, search, and detail could not be completed because there are no books available in the current test library.
- Solution: Marked authentication and membership smoke tests as completed, and kept catalog-related validation explicitly open with the blocking reason documented.
- Differences from plan: Sprint closure is now blocked by test data availability rather than by missing authentication or permission features.
- Validation: Tests 1-6 completed with OK result: valid Google login, no-membership handling, owner bootstrap, viewer invite, viewer claim, and viewer read-only permissions. Tests 7 onward were not executable due to empty catalog data.

## 2026-03-08 - Smoke test locali da terminale
- Scope: Executed the smoke tests that are realistically runnable from the current terminal environment.
- Difficulties: Full authentication smoke tests cannot be completed here because the app uses Google Sign-In and the environment does not provide an interactive browser session or test credentials. A first background launch of the dev server also terminated unexpectedly, so the server check had to be re-run in a single controlled command.
- Solution: Validated the codebase with npm.cmd run typecheck, npm.cmd run lint, and npm.cmd run build, then started the Vite dev server and probed the local app shell through HTTP requests to /, /login, and /catalog.
- Differences from plan: The QA checklist implies end-to-end login and role validation, but in this environment only terminal-driven smoke checks were executable. Manual validation for Google login success/failure, viewer permissions, and real catalog navigation is still pending.
- Validation: npm.cmd run typecheck OK; npm.cmd run lint OK; npm.cmd run build OK; Vite dev server responded with HTTP 200 on /, /login, and /catalog; root HTML included the expected /src/main.tsx bootstrap. Build still reports a large JavaScript chunk warning.

## 2026-03-08 - Documentation realigned to current implementation
- Scope: Updated product and planning documents to match the code currently present in the repository.
- Difficulties: The original planning documents described email/password authentication and a narrower Sprint 1, while the code now includes Google Sign-In, owner bootstrap, no-membership handling, invite claim, and viewer invitation management.
- Solution: Rewrote the affected spec files to reflect the implemented authentication model, current membership flows, and actual Sprint 1 completion state.
- Differences from plan: The documented MVP now explicitly reflects the current Google-based access model and the additional membership flows already implemented before the documentation caught up.
- Validation: Cross-check completed across AGENTS.md, docs/specs/STEERING.md, docs/specs/SPEC-1.md, docs/specs/USER-STORIES.md, and docs/specs/TASKS-MVP.md. No code changes were required for this alignment.

## 2026-03-08 - Status snapshot and workflow alignment
- Scope: Reviewed the current repository status against AGENTS.md, docs/specs/STEERING.md, docs/specs/SPEC-1.md, docs/specs/USER-STORIES.md, and docs/specs/TASKS-MVP.md. Added this development log as a workflow artifact.
- Difficulties: The planned scope and the implemented scope are no longer perfectly aligned, which makes progress reporting ambiguous. PowerShell execution policy also blocked npm.ps1, which initially prevented validation commands from running through the plain npm alias.
- Solution: Compared specs and code directly, then reran validation with npm.cmd instead of npm. Formalized a shared log so future divergence is documented as it happens instead of being reconstructed later.
- Differences from plan: The plan for US-1 and Sprint 1 still states email/password login, while the implementation currently uses Google Sign-In. The codebase also includes bootstrap flows for library creation, invite claiming, and viewer invitation, which go beyond the originally scoped Sprint 1 documentation.
- Validation: npm.cmd run typecheck, npm.cmd run lint, and npm.cmd run build completed successfully on 2026-03-08. Build output reported a large JavaScript chunk warning, so performance optimization is still open.
