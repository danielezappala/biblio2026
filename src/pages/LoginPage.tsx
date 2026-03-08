import { useState } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuthSession } from '@/hooks'
import { Button } from '@/components/ui/button'
import { canSelfBootstrapLibrary } from '@/utils/auth'

export function LoginPage() {
  const { authUser, status, login } = useAuthSession()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  if (status === 'authenticated') {
    return <Navigate to="/catalog" replace />
  }

  if (status === 'no_membership') {
    return <Navigate to={canSelfBootstrapLibrary(authUser?.email ?? null) ? '/create-library' : '/no-membership'} replace />
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
