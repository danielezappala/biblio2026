# Testing – Biblio2026

## Localhost

- Sviluppo e test principale in locale.
- Usare emulatori Firebase in locale quando possibile.
- Verificare login, ruoli e flussi core prima di ogni merge in `dev-common`.

## Firebase Hosting (dev/staging)

- Deploy solo quando necessario per test reali su device mobile.
- Usare un progetto Firebase separato per `dev` (Spark plan).
- Testare auth su device mobile, camera/ISBN scan, performance su rete mobile.

## Quando usare cosa

- Localhost: sviluppo quotidiano, test rapidi, UI/UX.
- Firebase Hosting: test di integrazione e device reali.

## Regole

- Mai testare su produzione per nuove feature.
- Ogni PR verso `main` deve avere test completi (local + deploy dev se la feature tocca camera/ISBN/OCR).
