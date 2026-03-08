import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuthSession, useCatalogBooks, usePendingInvites } from '@/hooks'
import { Button } from '@/components/ui/button'
import { addViewerMembershipByEmail, deletePendingInviteById, seedPublicBooksByLibraryId } from '@/services'

const MEMBER_ACTION_TIMEOUT_MS = 10000

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error(timeoutMessage))
    }, timeoutMs)

    promise
      .then((value) => {
        window.clearTimeout(timeoutId)
        resolve(value)
      })
      .catch((error: unknown) => {
        window.clearTimeout(timeoutId)
        reject(error)
      })
  })
}

export function CatalogPage() {
  const { session, logout } = useAuthSession()
  const [searchPrefix, setSearchPrefix] = useState<string>('')
  const [viewerEmail, setViewerEmail] = useState<string>('')
  const [memberActionMessage, setMemberActionMessage] = useState<string | null>(null)
  const [isMemberActionLoading, setIsMemberActionLoading] = useState<boolean>(false)
  const [seedBooksMessage, setSeedBooksMessage] = useState<string | null>(null)
  const [isSeedBooksLoading, setIsSeedBooksLoading] = useState<boolean>(false)
  const [inviteActionMessage, setInviteActionMessage] = useState<string | null>(null)
  const [deletingInviteId, setDeletingInviteId] = useState<string | null>(null)
  const libraryId = session?.membership.libraryId ?? ''
  const ownerLibraryId = session?.membership.role === 'owner' ? libraryId : ''
  const { books, isLoading } = useCatalogBooks(libraryId, searchPrefix)
  const { invites: pendingInvites, isLoading: isInvitesLoading, error: invitesError } = usePendingInvites(ownerLibraryId)

  if (!session) {
    return null
  }

  const roleLabel = session.membership.role === 'owner' ? 'Owner' : 'Viewer'

  const handleAddViewer = async () => {
    setMemberActionMessage(null)

    if (!viewerEmail.trim()) {
      setMemberActionMessage('Inserisci una email valida.')
      return
    }

    if (!viewerEmail.includes('@')) {
      setMemberActionMessage('Inserisci una email valida.')
      return
    }

    setIsMemberActionLoading(true)

    try {
      const addResult = await withTimeout(
        addViewerMembershipByEmail(session.membership.libraryId, viewerEmail),
        MEMBER_ACTION_TIMEOUT_MS,
        'Operazione in timeout. Controlla connessione, progetto Firebase e regole Firestore.',
      )
      setMemberActionMessage(
        addResult === 'viewer_added'
          ? 'Viewer aggiunto correttamente.'
          : "Invito salvato. L'utente verra' aggiunto dopo il primo login.",
      )
      setViewerEmail('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore durante aggiunta viewer.'
      setMemberActionMessage(message)
    } finally {
      setIsMemberActionLoading(false)
    }
  }

  const handleSeedBooks = async () => {
    setSeedBooksMessage(null)
    setIsSeedBooksLoading(true)

    try {
      const result = await withTimeout(
        seedPublicBooksByLibraryId(session.membership.libraryId, 20),
        MEMBER_ACTION_TIMEOUT_MS,
        'Timeout durante caricamento libri esempio. Riprova.',
      )
      setSeedBooksMessage(`Caricati ${result.addedCount} libri reali. Duplicati ignorati: ${result.skippedCount}.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore durante caricamento libri esempio.'
      setSeedBooksMessage(message)
    } finally {
      setIsSeedBooksLoading(false)
    }
  }

  const handleDeleteInvite = async (inviteId: string) => {
    setInviteActionMessage(null)
    setDeletingInviteId(inviteId)

    try {
      await withTimeout(
        deletePendingInviteById(session.membership.libraryId, inviteId),
        MEMBER_ACTION_TIMEOUT_MS,
        'Timeout durante annullamento invito. Riprova.',
      )
      setInviteActionMessage('Invito annullato.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore durante annullamento invito.'
      setInviteActionMessage(message)
    } finally {
      setDeletingInviteId(null)
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

      {session.membership.role === 'owner' ? (
        <section className="mt-4 rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">Gestione membri</h2>
          <p className="mt-1 text-sm text-muted-foreground">Invita un viewer tramite email.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              id="viewer-email"
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

          <div className="mt-4 border-t pt-4">
            <p className="text-sm text-muted-foreground">Carica libri reali da un servizio pubblico (Google Books).</p>
            <Button className="mt-2" type="button" disabled={isSeedBooksLoading} onClick={() => void handleSeedBooks()}>
              {isSeedBooksLoading ? 'Caricamento...' : 'Carica libri esempio reali'}
            </Button>
            {seedBooksMessage ? <p className="mt-2 text-sm text-muted-foreground">{seedBooksMessage}</p> : null}
          </div>

          <div className="mt-4 border-t pt-4">
            <p className="text-sm font-medium">Inviti pendenti</p>
            {isInvitesLoading ? <p className="mt-2 text-sm text-muted-foreground">Caricamento inviti...</p> : null}
            {invitesError ? <p className="mt-2 text-sm text-destructive">Errore inviti: {invitesError}</p> : null}
            {!isInvitesLoading && pendingInvites.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Nessun invito pendente.</p>
            ) : null}
            {!isInvitesLoading && pendingInvites.length > 0 ? (
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {pendingInvites.map((invite) => (
                  <li key={invite.id} className="flex items-center justify-between gap-2">
                    <span>{invite.email}</span>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8"
                      disabled={deletingInviteId === invite.id}
                      onClick={() => void handleDeleteInvite(invite.id)}
                    >
                      {deletingInviteId === invite.id ? 'Annullamento...' : 'Annulla'}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
            {inviteActionMessage ? <p className="mt-2 text-sm text-muted-foreground">{inviteActionMessage}</p> : null}
          </div>
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
