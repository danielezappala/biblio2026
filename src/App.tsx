import { Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AuthSessionProvider } from '@/hooks'
import { BookDetailPage } from '@/pages/BookDetailPage'
import { CatalogPage } from '@/pages/CatalogPage'
import { CreateLibraryPage } from '@/pages/CreateLibraryPage'
import { LoginPage } from '@/pages/LoginPage'
import { NoMembershipPage } from '@/pages/NoMembershipPage'
import { firebaseConfigError } from '@/services/firebase/firebaseApp'

function App() {
  if (firebaseConfigError) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-8">
        <section className="w-full rounded-xl border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Configurazione Firebase mancante</h1>
          <p className="mt-2 text-sm text-muted-foreground">{firebaseConfigError}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Crea un file <code>.env.dev</code> (o <code>.env</code>) partendo da <code>.env.dev.example</code> e riavvia
            il dev server.
          </p>
        </section>
      </main>
    )
  }

  return (
    <AuthSessionProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-library" element={<CreateLibraryPage />} />
        <Route path="/no-membership" element={<NoMembershipPage />} />
        <Route
          path="/catalog"
          element={
            <ProtectedRoute>
              <CatalogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/books/:bookId"
          element={
            <ProtectedRoute>
              <BookDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/catalog" replace />} />
      </Routes>
    </AuthSessionProvider>
  )
}

export default App
