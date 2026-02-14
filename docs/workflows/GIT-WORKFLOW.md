# Git Workflow – Biblio2026

## Branches

- `main`: sempre stabile e deployabile. Solo merge da `dev-common`.
- `dev-common`: integrazione continua. Deve restare verde.
- Branch personali (es. `dev-antonio`): lavoro in parallelo.

## Flusso consigliato (2 dev in parallelo)

1. Parti sempre da `dev-common`.
2. Sviluppa sul tuo branch personale (es. `dev-antonio`).
3. Fai PR piccole e frequenti verso `dev-common`.
4. Revisione reciproca, merge su `dev-common`.
5. Quando `dev-common` è stabile, PR di rilascio verso `main`.

## Sync e Rebase

- Sincronizza spesso il tuo branch personale:

```bash
git fetch origin
git checkout dev-antonio
git rebase origin/dev-common
```

- Se il rebase è complesso, preferisci un merge da `dev-common` al tuo branch personale.

## Policy PR

- Scope limitato (una feature/fix alla volta).
- Descrizione chiara con checklist minima: build ok, test locali passati, nessun accesso diretto a Firestore dai componenti.

## Politica di merge

- Preferire `squash` su `dev-common` per tenere la storia pulita.
- PR `dev-common` → `main` come merge commit o squash (a scelta), ma sempre con test passati.

## Convenzioni di naming

- `feature/<slug>` per feature grandi (se non si usa solo il branch personale).
- `fix/<slug>` per bugfix.
- Commit brevi e descrittivi, in inglese.
