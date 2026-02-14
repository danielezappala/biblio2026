import { Navigate } from 'react-router-dom'

import { useAuthSession } from '@/hooks'

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { logout, status } = useAuthSession()

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

  if (status === 'no_membership') {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-4 py-8">
        <section className="w-full rounded-xl border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Accesso senza libreria assegnata</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Il login e' riuscito, ma il tuo account non risulta membro di nessuna libreria.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Vai su login per creare la prima libreria, oppure chiedi a un Owner di aggiungere la tua membership.
          </p>
          <button
            type="button"
            className="mt-4 inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium"
            onClick={() => void logout()}
          >
            Esci
          </button>
        </section>
      </main>
    )
  }

  return children
}
