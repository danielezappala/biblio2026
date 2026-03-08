import { Navigate } from 'react-router-dom'

import { useAuthSession } from '@/hooks'
import { Button } from '@/components/ui/button'
import { canSelfBootstrapLibrary } from '@/utils/auth'

export function NoMembershipPage() {
  const { authUser, status, logout } = useAuthSession()

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

  if (canSelfBootstrapLibrary(authUser?.email ?? null)) {
    return <Navigate to="/create-library" replace />
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
      <section className="w-full rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Accesso non ancora assegnato</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Il login Google e' riuscito, ma il tuo account non appartiene a nessuna libreria.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Chiedi a un Owner di invitarti tramite email oppure esci e rientra con l'account corretto.
        </p>
        <Button type="button" className="mt-6 w-full" variant="outline" onClick={() => void logout()}>
          Esci
        </Button>
      </section>
    </main>
  )
}
