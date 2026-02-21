import {
  browserLocalPersistence,
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth'
import type { Timestamp } from 'firebase/firestore'
import { collectionGroup, limit, onSnapshot, query, where, type Unsubscribe } from 'firebase/firestore'

import { getFirebaseAuth, getFirestoreDb } from '@/services/firebase/firebaseApp'
import type { Membership, UserRole } from '@/types'

type MembershipDoc = {
  userId: string
  role: UserRole
  createdAt: Timestamp
}

export async function initializeAuthSession(): Promise<void> {
  await setPersistence(getFirebaseAuth(), browserLocalPersistence)
}

export async function loginWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  try {
    await signInWithPopup(getFirebaseAuth(), provider)
  } catch (error) {
    const authError = error as { code?: string }
    const shouldFallbackToRedirect =
      authError.code === 'auth/popup-blocked' ||
      authError.code === 'auth/cancelled-popup-request' ||
      authError.code === 'auth/popup-closed-by-user' ||
      authError.code === 'auth/internal-error' ||
      authError.code === 'auth/network-request-failed'

    if (!shouldFallbackToRedirect) {
      throw error
    }

    await signInWithRedirect(getFirebaseAuth(), provider)
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(getFirebaseAuth())
}

export async function completeGoogleRedirectSignIn(): Promise<void> {
  try {
    await getRedirectResult(getFirebaseAuth())
  } catch (error) {
    console.error('Google redirect completion failed:', error)
  }
}

export function subscribeAuthState(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(getFirebaseAuth(), callback)
}

export function subscribePrimaryMembership(userId: string, callback: (membership: Membership | null) => void): Unsubscribe {
  const membershipsQuery = query(collectionGroup(getFirestoreDb(), 'memberships'), where('userId', '==', userId), limit(1))

  return onSnapshot(
    membershipsQuery,
    (snapshot) => {
      if (snapshot.empty) {
        callback(null)
        return
      }

      const membershipDoc = snapshot.docs[0]
      const data = membershipDoc.data() as MembershipDoc
      const libraryRef = membershipDoc.ref.parent.parent

      if (!libraryRef || !data.role || !data.userId) {
        callback(null)
        return
      }

      callback({
        libraryId: libraryRef.id,
        userId: data.userId,
        role: data.role,
        createdAt: data.createdAt,
      })
    },
    (error) => {
      console.error('Membership listener error:', error)
      callback(null)
    }
  )
}
