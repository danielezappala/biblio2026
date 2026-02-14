import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuthSession, useCatalogBooks } from '@/hooks'
import { Button } from '@/components/ui/button'

export function CatalogPage() {
  const { session, logout } = useAuthSession()
  const [searchPrefix, setSearchPrefix] = useState<string>('')
  const libraryId = session?.membership.libraryId ?? ''
  const { books, isLoading } = useCatalogBooks(libraryId, searchPrefix)

  if (!session) {
    return null
  }

  const roleLabel = session.membership.role === 'owner' ? 'Owner' : 'Viewer'

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Catalogo libri</h1>
          <p className="text-sm text-muted-foreground">
            Ruolo: {roleLabel} | Libreria: {session.membership.libraryId}
          </p>
        </div>
        <Button variant="outline" onClick={() => void logout()}>
          Logout
        </Button>
      </header>

      <section className="rounded-xl border bg-card p-4 shadow-sm">
        <label htmlFor="search-title" className="text-sm font-medium">
          Cerca per prefisso titolo
        </label>
        <input
          id="search-title"
          type="text"
          value={searchPrefix}
          onChange={(event) => setSearchPrefix(event.target.value)}
          placeholder="Es. harry potter"
          className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
        />
      </section>

      <section className="mt-4 space-y-2">
        {isLoading ? <p className="text-sm text-muted-foreground">Caricamento catalogo...</p> : null}
        {!isLoading && books.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nessun libro trovato per questo filtro.</p>
        ) : null}

        {books.map((book) => (
          <Link
            key={book.id}
            to={`/books/${book.id}`}
            className="block rounded-lg border bg-background p-4 transition-colors hover:bg-secondary"
          >
            <h2 className="text-base font-semibold">{book.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{book.authors.join(', ') || 'Autore non disponibile'}</p>
            <p className="mt-1 text-xs text-muted-foreground">{book.isbn ? `ISBN: ${book.isbn}` : 'ISBN non disponibile'}</p>
          </Link>
        ))}
      </section>
    </main>
  )
}
