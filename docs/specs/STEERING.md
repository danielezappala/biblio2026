# Steering - Biblioteca domestica condivisa

## Principi guida

- Mobile-first PWA
- Client-side processing (ISBN scan, OCR, EPUB parsing)
- Firestore come unico backend
- API esterne gratuite (Open Library)
- Zero costi ricorrenti
- Google Sign-In come provider di autenticazione corrente

## Vincoli

- Firebase Spark only (Hosting, Firestore, Auth)
- No Functions
- No Storage
- Alcune migliaia di libri

## Sicurezza

- Firestore Rules con controllo membership library
- Owner: scrittura + gestione membri + export CSV
- Viewer: sola lettura
- Tutte le query filtrate per `libraryId`
- Bootstrap iniziale libreria consentito solo all'owner previsto
- Accesso Viewer tramite invito email e successivo login Google con la stessa email

## Dati e date

- Timestamp Firestore in persistenza
- Conversione locale solo in UI

## Performance

- Prestazioni accettabili fino a migliaia di libri