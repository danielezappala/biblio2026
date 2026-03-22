import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'

import {
  claimMembershipInvite,
  completeGoogleRedirectSignIn,
  createInitialLibraryWithOwnerMembership,
  initializeAuthSession,
  loginWithGoogle,
  logoutUser,
  subscribeOwnedLibraries,
  subscribeAuthState,
  subscribePrimaryMembership,
  switchPrimaryLibrary,
} from '@/services'
import type { AuthIdentity, AuthSession, LibrarySummary, Membership, SessionStatus } from '@/types'
import { canSelfBootstrapLibrary } from '@/utils/auth'
import { AuthSessionContext, type AuthSessionContextValue } from './authSessionContext'

const AUTO_BOOTSTRAP_LIBRARY_NAME = 'Biblioteca di Antonio'
const MEMBERSHIP_RESOLUTION_TIMEOUT_MS = 8000

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading')
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [membership, setMembership] = useState<Membership | null>(null)
  const [availableLibraries, setAvailableLibraries] = useState<LibrarySummary[]>([])
  const [isLibrariesLoading, setIsLibrariesLoading] = useState<boolean>(true)
  const [librariesError, setLibrariesError] = useState<string | null>(null)
  const hasAttemptedAutoBootstrap = useRef<boolean>(false)
  const hasAttemptedInviteClaim = useRef<boolean>(false)

  useEffect(() => {
    const unsubscribeAuth = subscribeAuthState((user) => {
      setFirebaseUser(user)
      if (!user) {
        setMembership(null)
        setAvailableLibraries([])
        setIsLibrariesLoading(false)
        setLibrariesError(null)
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
      hasAttemptedInviteClaim.current = false
      setAvailableLibraries([])
      setIsLibrariesLoading(false)
      setLibrariesError(null)
      return undefined
    }

    setIsLibrariesLoading(true)
    setLibrariesError(null)
    const unsubscribeLibraries = subscribeOwnedLibraries(
      firebaseUser.uid,
      (nextLibraries) => {
        setAvailableLibraries(nextLibraries)
        setIsLibrariesLoading(false)
        setLibrariesError(null)
      },
      (error) => {
        setAvailableLibraries([])
        setIsLibrariesLoading(false)
        setLibrariesError(error.message)
      }
    )

    return unsubscribeLibraries
  }, [firebaseUser])

  useEffect(() => {
    if (!firebaseUser) {
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

      const canClaimInvite = Boolean(firebaseUser.email) && !hasAttemptedInviteClaim.current
      if (canClaimInvite) {
        hasAttemptedInviteClaim.current = true
        void claimMembershipInvite(firebaseUser.uid, firebaseUser.email)
          .then((hasClaimedInvite) => {
            if (hasClaimedInvite) {
              setStatus('loading')
              return
            }

            const canAutoBootstrap = canSelfBootstrapLibrary(firebaseUser.email) && !hasAttemptedAutoBootstrap.current

            if (canAutoBootstrap) {
              hasAttemptedAutoBootstrap.current = true
              void createInitialLibraryWithOwnerMembership(firebaseUser.uid, AUTO_BOOTSTRAP_LIBRARY_NAME, firebaseUser.email)
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
          .catch(() => {
            setStatus('no_membership')
          })
        return
      }

      const canAutoBootstrap = canSelfBootstrapLibrary(firebaseUser.email) && !hasAttemptedAutoBootstrap.current

      if (canAutoBootstrap) {
        hasAttemptedAutoBootstrap.current = true
        void createInitialLibraryWithOwnerMembership(firebaseUser.uid, AUTO_BOOTSTRAP_LIBRARY_NAME, firebaseUser.email)
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
      availableLibraries,
      isLibrariesLoading,
      librariesError,
      login: async () => {
        await loginWithGoogle()
      },
      logout: async () => {
        await logoutUser()
      },
      switchPrimaryLibrary: async (libraryId: string) => {
        if (!firebaseUser) {
          throw new Error('Utente non autenticato.')
        }

        await switchPrimaryLibrary(firebaseUser.uid, libraryId)
      },
    }),
    [authUser, availableLibraries, firebaseUser, isLibrariesLoading, librariesError, session, status]
  )

  return <AuthSessionContext.Provider value={contextValue}>{children}</AuthSessionContext.Provider>
}
