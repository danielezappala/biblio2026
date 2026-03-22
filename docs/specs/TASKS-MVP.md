# TASKS - MVP Biblioteca domestica

## Setup

- [x] Init repo React + Vite + TS
- [x] Setup Tailwind + shadcn/ui
- [x] Config Firebase (dev/prod)

## Autenticazione

- [x] Login Google
- [x] Gestione ruoli (Owner/Viewer)
- [x] Bootstrap prima libreria per owner iniziale
- [x] Claim invito Viewer tramite email
- [x] Selezione libreria attiva per Owner/Admin

## Catalogo

- [x] Lista libri
- [x] Ricerca per titolo
- [x] Dettaglio libro
- [ ] Export CSV libreria (solo Owner)

## Inserimento libro

- [ ] ISBN scan
- [ ] Inserimento titolo
- [ ] OCR copertina
- [ ] Import EPUB locale
- [ ] Deduplica

## Note e stato

- [ ] Note condivise in modifica
- [ ] Valutazione in modifica
- [ ] Scaffale in modifica
- [ ] Date personalizzate in modifica
- [ ] Stato lettura UI

## Sicurezza

- [x] Firestore Rules
- [x] Test permessi documentati
- [ ] Verifica visibilita'/permessi export CSV per ruolo

## QA

- [ ] Test mobile documentati
- [ ] Test duplicati documentati
- [x] Test ruoli documentati
- [ ] Test download CSV su desktop/mobile

## Execution Tracking

- Maintain `docs/DEV-LOG.md` during development
- Keep `docs/DEV-LOG.md` in reverse chronological order, with newest entries at the top
- For each session, annotate difficulties, adopted solutions, and differences between implemented behavior and planned scope
- Before closing a task with scope drift, ensure the drift is recorded in the development log

## Sprint 1 (2026-02-16 -> 2026-02-27)

### Goal

- Rilasciare su `dev-common` un MVP navigabile con autenticazione Google, ruoli base e consultazione catalogo.

### Scope In

- US-1 Login con Google
- US-1a Creare la prima libreria
- US-1b Accedere tramite invito Viewer
- US-2 Visualizzare catalogo
- US-3 Ricercare un libro (prefisso titolo)
- US-4 Vedere dettaglio libro (metadati + note condivise in sola lettura)
- Sicurezza base: filtri `libraryId` e permessi Owner/Viewer

### Scope Out

- US-5/US-6/US-7/US-8 inserimento libro (ISBN/titolo/OCR/EPUB)
- US-9 export CSV
- US-10/US-11/US-12/US-13 note avanzate, stato lettura, rimozione libro

### Backlog operativo

- [x] Setup Firebase client + `.dev.example` per configurazione locale
- [x] Definizione tipi TS espliciti per `books`, `book_notes`, `reading_state`, `memberships`
- [x] Implementazione login/logout e protezione rotte
- [x] Risoluzione ruolo utente (Owner/Viewer) per library corrente
- [x] Lista catalogo ordinata per titolo (mobile-first)
- [x] Ricerca per prefisso titolo con query Firestore
- [x] Pagina dettaglio libro con metadati e note condivise read-only
- [x] Firestore Rules v1 con enforcement `libraryId` e blocco scrittura Viewer
- [x] Seed minimo dati dev per smoke test
- [x] Flusso no-membership con bootstrap owner o attesa invito
- [x] Gestione invito Viewer da catalogo Owner
- [x] Pannello admin per selezione libreria owner attiva

### QA e validazione

- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] Smoke test locale: login valido/non valido
- [x] Smoke test ruoli: Viewer senza permessi di modifica
- [x] Smoke test catalogo: lista, ricerca, dettaglio
- [x] Verifica che tutte le query applicano filtro `libraryId`

### Milestone interne

- 2026-02-16 -> 2026-02-18: setup, tipi, autenticazione
- 2026-02-19 -> 2026-02-23: catalogo, ricerca, dettaglio
- 2026-02-24 -> 2026-02-25: hardening security rules e membership flows
- 2026-02-26: QA completa e regressione
- 2026-02-27: PR finale verso `dev-common`

### Definition of Done Sprint 1

- Build, lint e typecheck verdi
- Criteri US-1/US-1a/US-1b/US-2/US-3/US-4 verificati
- Viewer non puo' modificare dati (UI + Firestore Rules)
- Tutte le query dati sono filtrate per `libraryId`
- Evidenze di test manuali riportate nella PR

## Note sullo stato attuale

- Il codice implementa autenticazione Google, bootstrap owner iniziale, claim invito Viewer e consultazione catalogo.
- Lo Sprint 1 e' chiuso con evidenze QA manuali annotate in `docs/DEV-LOG.md`.
- Il build corrente e' verde ma segnala un bundle JavaScript grande, quindi il tema performance resta aperto.

## Smoke test manuali 2026-03-08

- Test 1-6 eseguiti con esito OK
- Test 7-10 non eseguibili per assenza di libri di test nel catalogo
- Sprint 1 bloccato solo sulla disponibilita' di dati per validare catalogo e dettaglio con casi reali

## Aggiornamento 2026-03-22

- Seed libri di test completato su libreria primaria e su `Test1`
- Pannello admin multi-libreria funzionante dopo fix di query e Firestore Rules
- Diagnostica temporanea usata per isolare il problema e poi rimossa
- Smoke test finali Sprint 1 completati con esito OK su login, catalogo, ricerca, dettaglio, switch libreria e gestione membri
- Sprint 1 chiuso formalmente

