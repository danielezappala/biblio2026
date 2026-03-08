import { useState } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuthSession } from '@/hooks'
import { Button } from '@/components/ui/button'
import { createInitialLibraryWithOwnerMembership } from '@/services'
import { canSelfBootstrapLibrary } from '@/utils/auth'

export function CreateLibraryPage() {
  const { authUser, status, logout } = useAuthSession()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [libraryName, setLibraryName] = useState<string>('Biblioteca di casa')

  if (status === 'loading') {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Caricamento sessione...</p>
      </main>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  if (status === 'authenticated') {
    return <Navigate to="/catalog" replace />
  }

  if (!canSelfBootstrapLibrary(authUser?.email ?? null)) {
    return <Navigate to="/no-membership" replace />
  }

  const handleCreateLibrary = async () => {
    if (!authUser) {
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      await createInitialLibraryWithOwnerMembership(authUser.userId, libraryName, authUser.email)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore durante la creazione libreria.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
      <section className="w-full rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Crea la tua libreria</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Il login Google e' riuscito, ma manca una libreria associata al tuo account.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Crea ora la prima libreria per completare la configurazione iniziale.
        </p>

        <div className="mt-6 space-y-3">
          <label className="text-sm font-medium" htmlFor="libraryName">
            Nome libreria
          </label>
          <input
            id="libraryName"
            type="text"
            value={libraryName}
            onChange={(event) => setLibraryName(event.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="button" className="w-full" disabled={isSubmitting} onClick={() => void handleCreateLibrary()}>
            {isSubmitting ? 'Creazione in corso...' : 'Crea libreria e continua'}
          </Button>
          <Button type="button" className="w-full" variant="outline" onClick={() => void logout()}>
            Esci
          </Button>
        </div>
      </section>
    </main>
  )
}
