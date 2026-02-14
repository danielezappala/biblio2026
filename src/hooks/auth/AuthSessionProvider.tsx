import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'

import { loginWithGoogle, logoutUser, subscribeAuthState, subscribePrimaryMembership } from '@/services'
import type { AuthIdentity, AuthSession, Membership, SessionStatus } from '@/types'
import { AuthSessionContext, type AuthSessionContextValue } from './authSessionContext'

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading')
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [membership, setMembership] = useState<Membership | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeAuthState((user) => {
      setFirebaseUser(user)
      if (!user) {
        setMembership(null)
        setStatus('unauthenticated')
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!firebaseUser) {
      return undefined
    }

    setStatus('loading')
    const unsubscribeMembership = subscribePrimaryMembership(firebaseUser.uid, (nextMembership) => {
      setMembership(nextMembership)
      setStatus(nextMembership ? 'authenticated' : 'no_membership')
    })

    return unsubscribeMembership
  }, [firebaseUser])

  const session = useMemo<AuthSession | null>(() => {
    if (!firebaseUser || !membership) {
      return null
    }

    return {
      userId: firebaseUser.uid,
      email: firebaseUser.email,
      membership,
    }
  }, [firebaseUser, membership])

  const authUser = useMemo<AuthIdentity | null>(() => {
    if (!firebaseUser) {
      return null
    }

    return {
      userId: firebaseUser.uid,
      email: firebaseUser.email,
    }
  }, [firebaseUser])

  const contextValue = useMemo<AuthSessionContextValue>(
    () => ({
      status,
      authUser,
      session,
      login: async () => {
        await loginWithGoogle()
      },
      logout: async () => {
        await logoutUser()
      },
    }),
    [authUser, session, status]
  )

  return <AuthSessionContext.Provider value={contextValue}>{children}</AuthSessionContext.Provider>
}
