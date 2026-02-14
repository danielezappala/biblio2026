import { Link, Navigate, useParams } from 'react-router-dom'

import { useAuthSession, useBookDetails } from '@/hooks'
import { formatTimestampToLocalDate } from '@/utils/date'

export function BookDetailPage() {
  const { session } = useAuthSession()
  const { bookId } = useParams<{ bookId: string }>()
  const libraryId = session?.membership.libraryId ?? ''
  const resolvedBookId = bookId ?? ''
  const { book, notes, isLoading } = useBookDetails(libraryId, resolvedBookId)

  if (!session || !bookId) {
    return <Navigate to="/catalog" replace />
  }

  if (isLoading) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-6">
        <p className="text-sm text-muted-foreground">Caricamento dettaglio libro...</p>
      </main>
    )
  }

  if (!book) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-6">
        <p className="text-sm text-muted-foreground">Libro non disponibile o fuori dalla libreria corrente.</p>
        <Link to="/catalog" className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">
          Torna al catalogo
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-6">
      <Link to="/catalog" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
        Torna al catalogo
      </Link>

      <section className="mt-4 rounded-xl border bg-card p-5 shadow-sm">
        <h1 className="text-2xl font-semibold">{book.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{book.authors.join(', ') || 'Autore non disponibile'}</p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-muted-foreground">ISBN</dt>
            <dd className="text-sm">{book.isbn ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-muted-foreground">Editore</dt>
            <dd className="text-sm">{book.publisher ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-muted-foreground">Data pubblicazione</dt>
            <dd className="text-sm">{book.publishedDate ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-muted-foreground">Pagine</dt>
            <dd className="text-sm">{book.pageCount ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-muted-foreground">Inserito</dt>
            <dd className="text-sm">{formatTimestampToLocalDate(book.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-muted-foreground">Ultimo aggiornamento</dt>
            <dd className="text-sm">{formatTimestampToLocalDate(book.updatedAt)}</dd>
          </div>
        </dl>

        <div className="mt-4">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">Sinossi</h2>
          <p className="mt-1 text-sm">{book.synopsis ?? 'Nessuna sinossi disponibile.'}</p>
        </div>
      </section>

      <section className="mt-4 rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Note condivise</h2>
        {notes.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">Nessuna nota disponibile.</p> : null}
        <div className="mt-3 space-y-3">
          {notes.map((note) => (
            <article key={note.id} className="rounded-lg border bg-background p-3">
              <p className="text-sm">{note.note || 'Nota vuota.'}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Valutazione: {note.rating ?? '-'} | Scaffale: {note.shelf ?? '-'} | Aggiornata: {formatTimestampToLocalDate(note.updatedAt)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
