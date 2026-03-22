# User Stories - Biblioteca domestica condivisa (MVP)

## Ruoli

- **Owner**: proprietario della biblioteca (inserisce e gestisce libri, membri e export)
- **Viewer**: familiare/amico (consulta soltanto)

---

## Epic: Autenticazione e accesso

### US-1 Login con Google

**Come** utente autorizzato
**Voglio** autenticarmi con il mio account Google
**Cosi da** accedere alla biblioteca condivisa

**Criteri di accettazione**

- Login riuscito con account Google valido
- Fallback redirect se il popup non e' disponibile
- Errore chiaro in caso di autenticazione fallita

---

### US-1a Creare la prima libreria

**Come** owner iniziale autorizzato
**Voglio** creare la prima libreria al primo accesso
**Cosi da** completare il bootstrap dell'applicazione

**Criteri di accettazione**

- Se l'utente autenticato non ha membership ma e' autorizzato al bootstrap, puo' creare una libreria
- La libreria viene creata con membership Owner associata allo stesso utente
- Un utente non autorizzato al bootstrap non vede questa azione

---

### US-1b Accedere tramite invito Viewer

**Come** utente invitato
**Voglio** entrare con la stessa email Google usata nell'invito
**Cosi da** essere associato automaticamente alla libreria corretta

**Criteri di accettazione**

- L'Owner puo' salvare un invito Viewer tramite email
- Al primo login con la stessa email Google, l'utente ottiene la membership Viewer
- Se non esiste membership o invito valido, l'utente vede un messaggio chiaro

---

---

### US-1c Selezionare la libreria attiva

**Come** Owner/Admin con piu' librerie
**Voglio** vedere le librerie a mia disposizione e selezionarne una come attiva
**Cosi da** consultare e gestire il catalogo corretto senza cambiare account

**Criteri di accettazione**

- L'Owner vede un pannello con le librerie owner disponibili
- L'Owner puo' cambiare libreria attiva senza fare logout
- Dopo il cambio, catalogo e azioni operano sulla nuova libreria primaria
## Epic: Consultazione catalogo

### US-2 Visualizzare catalogo

**Come** utente (Owner o Viewer)
**Voglio** vedere la lista dei libri della biblioteca
**Cosi da** sapere quali libri sono disponibili

**Criteri di accettazione**

- Lista ordinata per titolo
- Accessibile da mobile senza zoom

---

### US-3 Ricercare un libro

**Come** utente
**Voglio** cercare un libro per titolo
**Cosi da** trovarlo rapidamente

**Criteri di accettazione**

- Ricerca per prefisso titolo
- Risultati aggiornati in tempo reale

---

### US-4 Vedere dettaglio libro

**Come** utente
**Voglio** vedere i dettagli di un libro
**Cosi da** conoscerne informazioni e note

**Criteri di accettazione**

- Visualizzazione metadati completi
- Visualizzazione note condivise

---

## Epic: Inserimento libro (Owner)

### US-5 Aggiungere libro via ISBN

**Come** Owner
**Voglio** aggiungere un libro scansionando l'ISBN
**Cosi da** inserirlo velocemente

**Criteri di accettazione**

- Scansione da camera
- Recupero automatico metadati
- Blocco duplicati

---

### US-6 Aggiungere libro via titolo

**Come** Owner
**Voglio** aggiungere un libro inserendo il titolo
**Cosi da** catalogarlo anche senza ISBN

**Criteri di accettazione**

- Ricerca Open Library
- Selezione manuale risultato

---

### US-7 Aggiungere libro via foto copertina

**Come** Owner
**Voglio** aggiungere un libro fotografando la copertina
**Cosi da** ridurre l'inserimento manuale

**Criteri di accettazione**

- OCR on-device
- Conferma manuale del match

---

### US-8 Importare EPUB

**Come** Owner
**Voglio** importare un file EPUB locale
**Cosi da** estrarne automaticamente i metadati

**Criteri di accettazione**

- Parsing client-side
- Nessun file salvato in cloud

---

### US-9 Esportare libreria in CSV

**Come** Owner
**Voglio** esportare tutta la libreria in un file CSV
**Cosi da** poterla analizzare o archiviare offline

**Criteri di accettazione**

- Export di tutti i libri della libreria corrente
- CSV con intestazioni coerenti (es. titolo, autori, ISBN, editore, data pubblicazione)
- Download avviato lato client senza backend server-side
- Viewer non puo' vedere o usare l'azione di export

---

## Epic: Note e gestione personale

### US-10 Aggiungere note condivise

**Come** Owner
**Voglio** aggiungere note e valutazioni a un libro
**Cosi da** condividerle con gli altri utenti

**Criteri di accettazione**

- Note visibili a tutti
- Modificabili solo da Owner

---

### US-11 Gestire posizione e date

**Come** Owner
**Voglio** indicare scaffale e date personalizzate
**Cosi da** tenere traccia della storia del libro

**Criteri di accettazione**

- Campo scaffale libero
- Aggiunta di piu' date con etichetta

---

### US-12 Gestire stato di lettura

**Come** utente
**Voglio** segnare lo stato di lettura di un libro
**Cosi da** ricordare cosa ho letto

**Criteri di accettazione**

- Stato personale
- Non visibile agli altri utenti

---

## Epic: Ciclo di vita libro

### US-13 Rimuovere un libro

**Come** Owner
**Voglio** segnare un libro come rimosso
**Cosi da** mantenere lo storico della biblioteca

**Criteri di accettazione**

- Impostazione data di uscita
- Libro non piu' mostrato di default

---

## Vincoli non funzionali

- Tutte le user story devono rispettare Firebase Spark
- Nessuna funzione server-side
- Prestazioni accettabili fino a migliaia di libri