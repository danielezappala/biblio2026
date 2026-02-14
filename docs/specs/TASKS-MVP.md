# TASKS â€“ MVP Biblioteca domestica

## Setup

- Init repo React + Vite + TS
- Setup Tailwind + shadcn/ui
- Config Firebase (dev/prod)

## Autenticazione

- Login email/password
- Gestione ruoli (Owner/Viewer)

## Catalogo

- Lista libri
- Ricerca per titolo
- Dettaglio libro
- Export CSV libreria (solo Owner)

## Inserimento libro

- ISBN scan
- Inserimento titolo
- OCR copertina
- Import EPUB locale
- Deduplica

## Note e stato

- Note condivise
- Valutazione
- Scaffale
- Date personalizzate
- Stato lettura

## Sicurezza

- Firestore Rules
- Test permessi
- Verifica visibilità/permessi export CSV per ruolo

## QA

- Test mobile
- Test duplicati
- Test ruoli
- Test download CSV su desktop/mobile
## Sprint 1 (2026-02-16 -> 2026-02-27)

### Goal

- Rilasciare su `dev-common` un MVP navigabile con autenticazione, ruoli base e consultazione catalogo.

### Scope In

- US-1 Login (email/password)
- US-2 Visualizzare catalogo
- US-3 Ricercare un libro (prefisso titolo)
- US-4 Vedere dettaglio libro (metadati + note condivise in sola lettura)
- Sicurezza base: filtri `libraryId` e permessi Owner/Viewer

### Scope Out

- US-5/US-6/US-7/US-8 inserimento libro (ISBN/titolo/OCR/EPUB)
- US-9 export CSV
- US-10/US-11/US-12/US-13 note avanzate, stato lettura, rimozione libro

### Backlog operativo

- [ ] Setup Firebase client + `.dev.example` per configurazione locale
- [ ] Definizione tipi TS espliciti per `books`, `book_notes`, `reading_state`, `memberships`
- [ ] Implementazione login/logout e protezione rotte
- [ ] Risoluzione ruolo utente (Owner/Viewer) per library corrente
- [ ] Lista catalogo ordinata per titolo (mobile-first)
- [ ] Ricerca per prefisso titolo con query Firestore
- [ ] Pagina dettaglio libro con metadati e note condivise read-only
- [ ] Firestore Rules v1 con enforcement `libraryId` e blocco scrittura Viewer
- [ ] Seed minimo dati dev per smoke test

### QA e validazione

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] Smoke test locale: login valido/non valido
- [ ] Smoke test ruoli: Viewer senza permessi di modifica
- [ ] Smoke test catalogo: lista, ricerca, dettaglio
- [ ] Verifica che tutte le query applicano filtro `libraryId`

### Milestone interne

- 2026-02-16 -> 2026-02-18: setup, tipi, autenticazione
- 2026-02-19 -> 2026-02-23: catalogo, ricerca, dettaglio
- 2026-02-24 -> 2026-02-25: hardening security rules e bugfix
- 2026-02-26: QA completa e regressione
- 2026-02-27: PR finale verso `dev-common`

### Definition of Done Sprint 1

- Build, lint e typecheck verdi
- Criteri US-1/US-2/US-3/US-4 verificati
- Viewer non puo' modificare dati (UI + Firestore Rules)
- Tutte le query dati sono filtrate per `libraryId`
- Evidenze di test manuali riportate nella PR
