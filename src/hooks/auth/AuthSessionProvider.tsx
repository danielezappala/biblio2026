import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'

import {
  completeGoogleRedirectSignIn,
  createInitialLibraryWithOwnerMembership,
  initializeAuthSession,
  loginWithGoogle,
  logoutUser,
  subscribeAuthState,
  subscribePrimaryMembership,
} from '@/services'
import type { AuthIdentity, AuthSession, Membership, SessionStatus } from '@/types'
import { AuthSessionContext, type AuthSessionContextValue } from './authSessionContext'

const AUTO_BOOTSTRAP_EMAIL = 'antoniogregorio@gmail.com'
const AUTO_BOOTSTRAP_LIBRARY_NAME = 'Biblioteca di Antonio'
const MEMBERSHIP_RESOLUTION_TIMEOUT_MS = 8000

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading')
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [membership, setMembership] = useState<Membership | null>(null)
  const hasAttemptedAutoBootstrap = useRef<boolean>(false)

  useEffect(() => {
    const unsubscribeAuth = subscribeAuthState((user) => {
      setFirebaseUser(user)
      if (!user) {
        setMembership(null)
        setStatus('unauthenticated')
      }
    })

    return unsubscribeAuth
  }, [])

  useEffect(() => {
    void initializeAuthSession()
      .then(async () => {
        await completeGoogleRedirectSignIn()
      })
      .catch((error) => {
        console.error('Auth initialization failed:', error)
      })
  }, [])

  useEffect(() => {
    if (!firebaseUser) {
      hasAttemptedAutoBootstrap.current = false
      return undefined
    }

    setStatus('loading')
    let hasResolvedMembership = false
    const resolutionTimeout = setTimeout(() => {
      if (!hasResolvedMembership) {
        setStatus('no_membership')
      }
    }, MEMBERSHIP_RESOLUTION_TIMEOUT_MS)

    const unsubscribeMembership = subscribePrimaryMembership(firebaseUser.uid, (nextMembership) => {
      hasResolvedMembership = true
      setMembership(nextMembership)

      if (nextMembership) {
        setStatus('authenticated')
        return
      }

      const canAutoBootstrap =
        firebaseUser.email?.toLowerCase() === AUTO_BOOTSTRAP_EMAIL && !hasAttemptedAutoBootstrap.current

      if (canAutoBootstrap) {
        hasAttemptedAutoBootstrap.current = true
        void createInitialLibraryWithOwnerMembership(firebaseUser.uid, AUTO_BOOTSTRAP_LIBRARY_NAME)
          .then(() => {
            setStatus('loading')
          })
          .catch(() => {
            setStatus('no_membership')
          })
        return
      }

      setStatus('no_membership')
    })

    return () => {
      clearTimeout(resolutionTimeout)
      unsubscribeMembership()
    }
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
