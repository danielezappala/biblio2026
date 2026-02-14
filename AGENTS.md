# AGENTS.md – Biblio2026

## Scope
These instructions apply to all automated agents working in this repository.

## Stack
- React + Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Firebase Auth + Firestore (Spark plan)

## Project Structure
- `src/components`
- `src/pages`
- `src/services`
- `src/hooks`
- `src/utils`
- `src/types`

## Conventions
- `camelCase` for variables/functions
- `PascalCase` for components
- Repository pattern for Firestore
- No direct Firestore access from components

## Clean Code
- Keep components and functions small and focused on a single responsibility
- Prefer descriptive names over abbreviations for variables, functions, and files
- Avoid duplication: extract shared logic into `src/hooks`, `src/services`, or `src/utils`
- Keep business logic out of UI components when possible
- Add comments only when intent is not obvious from the code itself
- Remove dead code, unused imports, and obsolete TODOs before merging
- Keep TypeScript types explicit at module boundaries (props, service inputs/outputs)
- Ensure each PR includes at least basic validation (manual smoke test or automated test)

## Documentation Consistency
- Any change to requirements, roles, permissions, or workflow must be checked for consistency across all related docs before completion
- At minimum, cross-check `AGENTS.md`, `docs/specs/STEERING.md`, `docs/specs/SPEC-1.md`, `docs/specs/USER-STORIES.md`, and `docs/specs/TASKS-MVP.md` when one of them is modified
- If a rule changes in one file, update the corresponding sections in the other files in the same task

## Data & Dates
- Persist Firestore Timestamps
- Convert to local dates only in UI

## Security
- All queries filtered by `libraryId`
- Permissions enforced by Firestore Rules

## Git Workflow (Summary)
- `main` always deployable
- `dev-common` is the integration branch
- Use `feature/*` for development
- Keep PRs small and focused
- Personal branches (for example `dev-antonio`) branch from `dev-common` and merge back via PRs
- Rebase frequently on `dev-common`
- Promote `dev-common` to `main` only when stable

## Testing (Summary)
- Daily dev and smoke tests on localhost
- Use Firebase Hosting (dev project) for device/mobile tests
- Never test new features on production

## Dev Files Policy
- Local-only configs use `.dev` suffix and are never committed
- Provide `.dev.example` templates when needed
- `.env*` files follow the same rule unless explicitly approved

## Dev Scripts
- `scripts/dev/list-ports.sh` to inspect common dev ports
- `scripts/dev/stop-ports.sh` to stop common dev servers on restart

## Constraints
- Firebase Spark only (Hosting, Firestore, Auth)
- No Functions, no Storage
- Zero recurring costs
