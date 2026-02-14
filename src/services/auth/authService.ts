import {
  GoogleAuthProvider,
  onAuthStateChanged,
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

export async function loginWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  await signInWithRedirect(getFirebaseAuth(), provider)
}

export async function logoutUser(): Promise<void> {
  await signOut(getFirebaseAuth())
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
    () => {
      callback(null)
    }
  )
}
