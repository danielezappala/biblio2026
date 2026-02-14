# SPEC-1 – Biblioteca domestica condivisa

## Background

Gestione di una biblioteca domestica di grandi dimensioni (alcune migliaia di libri), composta da libri cartacei ed eBook EPUB. L’obiettivo è consentire una catalogazione a sforzo minimo, sapere immediatamente se un libro è già posseduto e mantenere nel tempo informazioni, note e storico della collezione.

Il progetto deve essere a costo zero (Firebase piano gratuito), sviluppato prevalentemente con AI, accessibile da desktop e mobile, e utilizzabile da una cerchia ristretta di utenti con ruoli distinti.

## Requirements

### Must Have

- Verifica immediata possesso libro
- Inserimento libro tramite ISBN, foto copertina, titolo
- Recupero automatico metadati
- Import EPUB locale (solo metadati)
- Export intera libreria in CSV (solo Owner)
- Accesso web + mobile
- Gestione utenti e permessi (Owner / Viewer)
- Note e valutazioni condivise

### Should Have (Fase 2)

- Filtri (letti/non letti, autore, valutazione)
- Filtri autore (sesso, provenienza)

### Could Have

- Suggerimenti di lettura
- Statistiche avanzate

## Vincoli

- Firebase Spark (Hosting, Firestore, Auth)
- No Functions, no Storage
- Zero costi ricorrenti
- Alcune migliaia di libri

## Method

### Architettura

- PWA mobile-first
- Client-side processing (ISBN scan, OCR, EPUB parsing)
- Firestore come unico backend
- API esterne gratuite (Open Library)

### Modello dati (sintesi)

- **books**: titolo, autori, editore, data pubblicazione, ISBN, sinossi, pagine, date aggiunta/rimozione
- **book_notes**: note condivise, rating, scaffale, date personalizzate
- **reading_state**: stato lettura per utente

### Sicurezza

- Firestore Rules con controllo membership library
- Owner: scrittura + export CSV
- Viewer: sola lettura

## Criteri di accettazione

- Inserimento libro < 30s
- Nessun duplicato
- Viewer non può modificare
- Owner può esportare l'intera libreria in CSV da UI
