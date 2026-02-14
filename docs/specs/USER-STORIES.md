# User Stories – Biblioteca domestica condivisa (MVP)

## Ruoli

- **Owner**: proprietario della biblioteca (inserisce e gestisce libri)
- **Viewer**: familiare/amico (consulta soltanto)

---

## Epic: Autenticazione e accesso

### US-1 Login

**Come** utente registrato
**Voglio** autenticarmi con email e password
**Così da** accedere alla biblioteca condivisa

**Criteri di accettazione**

- Login riuscito con credenziali valide
- Errore chiaro in caso di credenziali errate

---

## Epic: Consultazione catalogo

### US-2 Visualizzare catalogo

**Come** utente (Owner o Viewer)
**Voglio** vedere la lista dei libri della biblioteca
**Così da** sapere quali libri sono disponibili

**Criteri di accettazione**

- Lista ordinata per titolo
- Accessibile da mobile senza zoom

---

### US-3 Ricercare un libro

**Come** utente
**Voglio** cercare un libro per titolo
**Così da** trovarlo rapidamente

**Criteri di accettazione**

- Ricerca per prefisso titolo
- Risultati aggiornati in tempo reale

---

### US-4 Vedere dettaglio libro

**Come** utente
**Voglio** vedere i dettagli di un libro
**Così da** conoscerne informazioni e note

**Criteri di accettazione**

- Visualizzazione metadati completi
- Visualizzazione note condivise

---

## Epic: Inserimento libro (Owner)

### US-5 Aggiungere libro via ISBN

**Come** Owner
**Voglio** aggiungere un libro scansionando l’ISBN
**Così da** inserirlo velocemente

**Criteri di accettazione**

- Scansione da camera
- Recupero automatico metadati
- Blocco duplicati

---

### US-6 Aggiungere libro via titolo

**Come** Owner
**Voglio** aggiungere un libro inserendo il titolo
**Così da** catalogarlo anche senza ISBN

**Criteri di accettazione**

- Ricerca Open Library
- Selezione manuale risultato

---

### US-7 Aggiungere libro via foto copertina

**Come** Owner
**Voglio** aggiungere un libro fotografando la copertina
**Così da** ridurre l’inserimento manuale

**Criteri di accettazione**

- OCR on-device
- Conferma manuale del match

---

### US-8 Importare EPUB

**Come** Owner
**Voglio** importare un file EPUB locale
**Così da** estrarne automaticamente i metadati

**Criteri di accettazione**

- Parsing client-side
- Nessun file salvato in cloud

---


### US-9 Esportare libreria in CSV

**Come** Owner
**Voglio** esportare tutta la libreria in un file CSV
**Cos� da** poterla analizzare o archiviare offline

**Criteri di accettazione**

- Export di tutti i libri della libreria corrente
- CSV con intestazioni coerenti (es. titolo, autori, ISBN, editore, data pubblicazione)
- Download avviato lato client senza backend server-side
- Viewer non pu� vedere o usare l'azione di export

---
## Epic: Note e gestione personale

### US-10 Aggiungere note condivise

**Come** Owner
**Voglio** aggiungere note e valutazioni a un libro
**Così da** condividerle con gli altri utenti

**Criteri di accettazione**

- Note visibili a tutti
- Modificabili solo da Owner

---

### US-11 Gestire posizione e date

**Come** Owner
**Voglio** indicare scaffale e date personalizzate
**Così da** tenere traccia della storia del libro

**Criteri di accettazione**

- Campo scaffale libero
- Aggiunta di più date con etichetta

---

### US-12 Gestire stato di lettura

**Come** utente
**Voglio** segnare lo stato di lettura di un libro
**Così da** ricordare cosa ho letto

**Criteri di accettazione**

- Stato personale
- Non visibile agli altri utenti

---

## Epic: Ciclo di vita libro

### US-13 Rimuovere un libro

**Come** Owner
**Voglio** segnare un libro come rimosso
**Così da** mantenere lo storico della biblioteca

**Criteri di accettazione**

- Impostazione data di uscita
- Libro non più mostrato di default

---

## Vincoli non funzionali

- Tutte le user story devono rispettare Firebase Spark
- Nessuna funzione server-side
- Prestazioni accettabili fino a migliaia di libri
