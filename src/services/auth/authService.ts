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
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore'

import { getFirebaseAuth, getFirestoreDb } from '@/services/firebase/firebaseApp'
import type { Membership, UserRole } from '@/types'
import { normalizeEmailAddress } from '@/utils/email'

type UserMembershipDoc = {
  primaryLibraryId: string
  userId: string
  email?: string | null
  role: UserRole
  createdAt: Timestamp
}

async function findOwnedLibraryMembership(userId: string): Promise<Membership | null> {
  const librariesQuery = query(collection(getFirestoreDb(), 'libraries'), where('ownerUserId', '==', userId), limit(1))
  const snapshot = await getDocs(librariesQuery)

  if (snapshot.empty) {
    return null
  }

  return {
    libraryId: snapshot.docs[0].id,
    userId,
    role: 'owner',
    createdAt: snapshot.docs[0].get('createdAt') as Timestamp,
  }
}

async function backfillPrimaryMembership(membership: Membership): Promise<void> {
  await setDoc(doc(getFirestoreDb(), 'user_memberships', membership.userId), {
    primaryLibraryId: membership.libraryId,
    userId: membership.userId,
    email: null,
    role: membership.role,
    createdAt: membership.createdAt ?? serverTimestamp(),
  })
}

type MembershipInviteDoc = {
  email: string
  primaryLibraryId: string
  role: UserRole
  createdAt: Timestamp
}

export async function claimMembershipInvite(userId: string, userEmail: string | null): Promise<boolean> {
  const normalizedEmail = userEmail ? normalizeEmailAddress(userEmail) : ''
  if (!normalizedEmail) {
    return false
  }

  const db = getFirestoreDb()
  const inviteRef = doc(db, 'membership_invites', normalizedEmail)
  const inviteSnapshot = await getDoc(inviteRef)

  if (!inviteSnapshot.exists()) {
    return false
  }

  const invite = inviteSnapshot.data() as MembershipInviteDoc
  if (!invite.primaryLibraryId || invite.role !== 'viewer') {
    return false
  }

  await setDoc(doc(db, 'libraries', invite.primaryLibraryId, 'memberships', userId), {
    userId,
    role: 'viewer',
    createdAt: invite.createdAt ?? serverTimestamp(),
  })

  await setDoc(doc(db, 'user_memberships', userId), {
    primaryLibraryId: invite.primaryLibraryId,
    userId,
    email: normalizedEmail,
    role: 'viewer',
    createdAt: invite.createdAt ?? serverTimestamp(),
  })

  await deleteDoc(inviteRef)
  return true
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
  const membershipDocRef = doc(getFirestoreDb(), 'user_memberships', userId)

  return onSnapshot(
    membershipDocRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        void findOwnedLibraryMembership(userId)
          .then((membership) => {
            callback(membership)

            if (!membership) {
              return
            }

            return backfillPrimaryMembership(membership).catch((error) => {
              console.error('Primary membership backfill failed:', error)
            })
          })
          .catch((error) => {
            console.error('Owned library lookup failed:', error)
            callback(null)
          })
        return
      }

      const data = snapshot.data() as UserMembershipDoc

      if (!data.primaryLibraryId || !data.role || !data.userId) {
        callback(null)
        return
      }

      callback({
        libraryId: data.primaryLibraryId,
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
