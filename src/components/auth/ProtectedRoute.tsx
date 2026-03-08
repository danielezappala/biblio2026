import { Navigate } from 'react-router-dom'

import { useAuthSession } from '@/hooks'
import { canSelfBootstrapLibrary } from '@/utils/auth'

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { authUser, status } = useAuthSession()

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
    return <Navigate to={canSelfBootstrapLibrary(authUser?.email ?? null) ? '/create-library' : '/no-membership'} replace />
  }

  return children
}
