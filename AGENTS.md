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

## Data & Dates
- Persist Firestore Timestamps
- Convert to local dates only in UI

## Security
- All queries filtered by `libraryId`
- Permissions enforced by Firestore Rules

## Git Workflow (Summary)
- `main` always deployable
- `common_dev` is the integration branch
- Use `feature/*` for development
- Keep PRs small and focused
- `Daniele` and `Antonio` branch from `common_dev` and merge back via PRs
- Rebase frequently on `common_dev`
- Promote `common_dev` to `main` only when stable

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
