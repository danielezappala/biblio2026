# Git Workflow – Biblio2026

## Branches

- `main`: sempre stabile e deployabile. Solo merge da `common_dev`.
- `common_dev`: integrazione continua. Deve restare verde.
- `Daniele`, `Antonio`: branch personali per lavoro in parallelo.

## Flusso consigliato (2 dev in parallelo)

1. Parti sempre da `common_dev`.
2. Sviluppa sul tuo branch personale (`Daniele` o `Antonio`).
3. Fai PR piccole e frequenti verso `common_dev`.
4. Revisione reciproca, merge su `common_dev`.
5. Quando `common_dev` è stabile, PR di rilascio verso `main`.

## Sync e Rebase

- Sincronizza spesso il tuo branch personale:

```bash
git fetch origin
git checkout Daniele
git rebase origin/common_dev
```

- Se il rebase è complesso, preferisci un merge da `common_dev` al tuo branch personale.

## Policy PR

- Scope limitato (una feature/fix alla volta).
- Descrizione chiara con checklist minima: build ok, test locali passati, nessun accesso diretto a Firestore dai componenti.

## Politica di merge

- Preferire `squash` su `common_dev` per tenere la storia pulita.
- PR `common_dev` → `main` come merge commit o squash (a scelta), ma sempre con test passati.

## Convenzioni di naming

- `feature/<slug>` per feature grandi (se non si usa solo il branch personale).
- `fix/<slug>` per bugfix.
- Commit brevi e descrittivi, in inglese.
