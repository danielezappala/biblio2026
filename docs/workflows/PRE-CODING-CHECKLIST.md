# Pre-Coding Checklist - Biblio2026

Use this checklist before starting implementation of a new feature or major change.

## 1) Scope Lock

- Feature is explicitly linked to one or more user stories in `docs/specs/USER-STORIES.md`
- Out-of-scope items are listed and postponed (no implicit phase-2 work in MVP)
- Acceptance criteria are clear and testable

## 2) Specs Alignment

- `docs/specs/SPEC-1.md` is aligned with the feature requirements
- `docs/specs/STEERING.md` is aligned with architecture and security constraints
- `docs/specs/TASKS-MVP.md` contains the implementation and QA tasks
- `AGENTS.md` remains aligned for workflow, rules, and conventions
- If one document changed, all related documents were cross-checked

## 3) Data Model & Rules

- Firestore collections and fields are defined (including required/optional fields)
- `libraryId` filtering is applied to all reads/writes
- Owner/Viewer permissions are defined for the feature
- Deduplication strategy is defined where relevant (for books and imports)
- Any required Firestore indexes are identified before coding

## 4) API/Client Behavior

- Client-side vs external API responsibilities are explicit
- Error states and empty states are defined
- Performance expectations are documented for libraries with thousands of books
- Mobile-first behavior is defined for core flows

## 5) UX and Output Contracts

- UI actions are mapped by role (Owner vs Viewer)
- Output format contracts are defined when applicable (for example CSV columns/order/encoding)
- Date handling is consistent with project rule: persist timestamp, localize in UI only

## 6) Definition of Done

- Functional acceptance criteria mapped to tests
- Minimum QA plan defined (local + device/mobile when relevant)
- Security checks included (Firestore Rules + UI permission visibility)
- PR scope is small, focused, and has explicit validation evidence

## 7) Ready-to-Start Gate

Implementation starts only if all items above are satisfied, or open items are explicitly marked with owner and follow-up task.
