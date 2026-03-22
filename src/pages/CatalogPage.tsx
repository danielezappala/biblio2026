import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuthSession, useCatalogBooks } from '@/hooks'
import { Button } from '@/components/ui/button'
import { addViewerInviteByEmail } from '@/services'

export function CatalogPage() {
  const { availableLibraries, isLibrariesLoading, librariesError, session, logout, switchPrimaryLibrary } = useAuthSession()
  const [searchPrefix, setSearchPrefix] = useState<string>('')
  const [viewerEmail, setViewerEmail] = useState<string>('')
  const [selectedLibraryId, setSelectedLibraryId] = useState<string>('')
  const [librarySwitchMessage, setLibrarySwitchMessage] = useState<string | null>(null)
  const [isLibrarySwitchLoading, setIsLibrarySwitchLoading] = useState<boolean>(false)
  const [memberActionMessage, setMemberActionMessage] = useState<string | null>(null)
  const [isMemberActionLoading, setIsMemberActionLoading] = useState<boolean>(false)
  const libraryId = session?.membership.libraryId ?? ''
  const { books, isLoading } = useCatalogBooks(libraryId, searchPrefix)
  const canManageLibraries = session?.membership.role === 'owner'

  useEffect(() => {
    setSelectedLibraryId(session?.membership.libraryId ?? '')
  }, [session?.membership.libraryId])

  if (!session) {
    return null
  }

  const roleLabel = session.membership.role === 'owner' ? 'Owner' : 'Viewer'

  const handleAddViewer = async () => {
    setMemberActionMessage(null)
    setIsMemberActionLoading(true)

    try {
      await addViewerInviteByEmail(session.membership.libraryId, viewerEmail)
      setMemberActionMessage("Invito viewer salvato. L'utente potra' entrare con Google usando questa email.")
      setViewerEmail('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore durante aggiunta viewer.'
      setMemberActionMessage(message)
    } finally {
      setIsMemberActionLoading(false)
    }
  }

  const handleSwitchLibrary = async () => {
    if (!selectedLibraryId || selectedLibraryId === session.membership.libraryId) {
      return
    }

    setLibrarySwitchMessage(null)
    setIsLibrarySwitchLoading(true)

    try {
      await switchPrimaryLibrary(selectedLibraryId)
      setLibrarySwitchMessage('Libreria attiva aggiornata.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore durante cambio libreria.'
      setLibrarySwitchMessage(message)
    } finally {
      setIsLibrarySwitchLoading(false)
    }
  }

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

      {canManageLibraries ? (
        <section className="mt-4 rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">Pannello admin</h2>
          <p className="mt-1 text-sm text-muted-foreground">Seleziona la libreria owner da usare come libreria attiva.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <select
              value={selectedLibraryId}
              onChange={(event) => setSelectedLibraryId(event.target.value)}
              className="h-10 flex-1 rounded-md border bg-background px-3 text-sm"
              disabled={isLibrariesLoading || isLibrarySwitchLoading}
            >
              <option value="" disabled>
                {isLibrariesLoading ? 'Caricamento librerie...' : 'Seleziona una libreria'}
              </option>
              {availableLibraries.map((library) => (
                <option key={library.libraryId} value={library.libraryId}>
                  {library.name} ({library.libraryId})
                </option>
              ))}
            </select>
            <Button
              type="button"
              disabled={
                isLibrariesLoading ||
                isLibrarySwitchLoading ||
                !selectedLibraryId ||
                selectedLibraryId === session.membership.libraryId
              }
              onClick={() => void handleSwitchLibrary()}
            >
              {isLibrarySwitchLoading ? 'Cambio in corso...' : 'Usa libreria'}
            </Button>
          </div>
          {librariesError ? <p className="mt-2 text-sm text-destructive">{librariesError}</p> : null}
          {librarySwitchMessage ? <p className="mt-2 text-sm text-muted-foreground">{librarySwitchMessage}</p> : null}
        </section>
      ) : null}

      {canManageLibraries ? (
        <section className="mt-4 rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">Gestione membri</h2>
          <p className="mt-1 text-sm text-muted-foreground">Aggiungi un viewer tramite email Google.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={viewerEmail}
              onChange={(event) => setViewerEmail(event.target.value)}
              placeholder="Inserisci email viewer"
              className="h-10 flex-1 rounded-md border bg-background px-3 text-sm"
            />
            <Button type="button" disabled={isMemberActionLoading} onClick={() => void handleAddViewer()}>
              {isMemberActionLoading ? 'Salvataggio...' : 'Aggiungi viewer'}
            </Button>
          </div>
          {memberActionMessage ? <p className="mt-2 text-sm text-muted-foreground">{memberActionMessage}</p> : null}
        </section>
      ) : null}

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
