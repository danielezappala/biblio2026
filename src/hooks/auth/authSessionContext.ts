import { createContext } from 'react'

import type { AuthIdentity, AuthSession, SessionStatus } from '@/types'

export type AuthSessionContextValue = {
  status: SessionStatus
  authUser: AuthIdentity | null
  session: AuthSession | null
  login: () => Promise<void>
  logout: () => Promise<void>
}

export const AuthSessionContext = createContext<AuthSessionContextValue | null>(null)
