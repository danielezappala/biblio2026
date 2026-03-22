import { createContext } from 'react'

import type { AuthIdentity, AuthSession, LibrarySummary, SessionStatus } from '@/types'

export type AuthSessionContextValue = {
  status: SessionStatus
  authUser: AuthIdentity | null
  session: AuthSession | null
  availableLibraries: LibrarySummary[]
  isLibrariesLoading: boolean
  librariesError: string | null
  login: () => Promise<void>
  logout: () => Promise<void>
  switchPrimaryLibrary: (libraryId: string) => Promise<void>
}

export const AuthSessionContext = createContext<AuthSessionContextValue | null>(null)
