import { useState } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuthSession } from '@/hooks'
import { Button } from '@/components/ui/button'
import { createInitialLibraryWithOwnerMembership } from '@/services'

export function LoginPage() {
  const { authUser, status, login, logout } = useAuthSession()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [libraryName, setLibraryName] = useState<string>('Biblioteca di casa')

  if (status === 'authenticated') {
    return <Navigate to="/catalog" replace />
  }

  if (status === 'no_membership') {
    const handleCreateLibrary = async () => {
      if (!authUser) {
        return
      }

      setError(null)
      setIsSubmitting(true)
      try {
        await createInitialLibraryWithOwnerMembership(authUser.userId, libraryName)
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
          <h1 className="text-xl font-semibold">Account non associato a una libreria</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Il login Google e' riuscito, ma manca la membership utente in Firestore.
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

  const handleGoogleLogin = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      await login()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore durante il login.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
      <section className="w-full rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Accedi a Biblio2026</h1>
        <p className="mt-2 text-sm text-muted-foreground">Usa il tuo account Google per entrare nella libreria condivisa.</p>

        <div className="mt-6 space-y-4">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="button" className="w-full" disabled={isSubmitting} onClick={() => void handleGoogleLogin()}>
            {isSubmitting ? 'Accesso in corso...' : 'Continua con Google'}
          </Button>
        </div>
      </section>
    </main>
  )
}
