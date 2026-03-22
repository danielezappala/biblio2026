import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore'

import { getFirestoreDb } from '@/services/firebase/firebaseApp'
import type { LibrarySummary, UserRole } from '@/types'
import { normalizeEmailAddress } from '@/utils/email'

function normalizeLibraryName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

export async function createInitialLibraryWithOwnerMembership(
  userId: string,
  libraryName: string,
  userEmail: string | null
): Promise<string> {
  const normalizedName = normalizeLibraryName(libraryName)
  if (!normalizedName) {
    throw new Error('Inserisci un nome libreria valido.')
  }

  const db = getFirestoreDb()
  const libraryRef = doc(db, 'libraries', crypto.randomUUID())
  const membershipRef = doc(db, 'libraries', libraryRef.id, 'memberships', userId)
  const userMembershipRef = doc(db, 'user_memberships', userId)
  const batch = writeBatch(db)

  batch.set(libraryRef, {
    name: normalizedName,
    ownerUserId: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  batch.set(membershipRef, {
    userId,
    role: 'owner',
    createdAt: serverTimestamp(),
  })

  batch.set(userMembershipRef, {
    primaryLibraryId: libraryRef.id,
    userId,
    email: userEmail ? normalizeEmailAddress(userEmail) : null,
    role: 'owner',
    createdAt: serverTimestamp(),
  })

  await batch.commit()
  return libraryRef.id
}

export async function addViewerInviteByEmail(libraryId: string, viewerEmail: string): Promise<void> {
  const normalizedLibraryId = libraryId.trim()
  const normalizedViewerEmail = normalizeEmailAddress(viewerEmail)

  if (!normalizedLibraryId || !normalizedViewerEmail) {
    throw new Error('libraryId e viewerEmail sono obbligatori.')
  }

  const db = getFirestoreDb()
  const inviteRef = doc(db, 'membership_invites', normalizedViewerEmail)

  const batch = writeBatch(db)
  batch.set(inviteRef, {
    email: normalizedViewerEmail,
    primaryLibraryId: normalizedLibraryId,
    role: 'viewer',
    createdAt: serverTimestamp(),
  })

  await batch.commit()
}

type LibraryDoc = {
  name: string
  ownerUserId: string
}

export function subscribeOwnedLibraries(
  userId: string,
  callback: (libraries: LibrarySummary[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const librariesQuery = query(collection(getFirestoreDb(), 'libraries'), where('ownerUserId', '==', userId))

  return onSnapshot(
    librariesQuery,
    (snapshot) => {
      const libraries = snapshot.docs
        .map((libraryDoc) => {
          const data = libraryDoc.data() as LibraryDoc
          return {
            libraryId: libraryDoc.id,
            name: data.name,
            ownerUserId: data.ownerUserId,
            role: 'owner' as const,
          }
        })
        .sort((left, right) => left.name.localeCompare(right.name, 'it'))

      callback(libraries)
    },
    (error) => {
      onError?.(error)
    }
  )
}

export async function switchPrimaryLibrary(userId: string, targetLibraryId: string): Promise<void> {
  const normalizedLibraryId = targetLibraryId.trim()
  if (!userId || !normalizedLibraryId) {
    throw new Error('userId e libraryId sono obbligatori.')
  }

  const db = getFirestoreDb()
  const libraryRef = doc(db, 'libraries', normalizedLibraryId)
  const membershipRef = doc(db, 'libraries', normalizedLibraryId, 'memberships', userId)
  const userMembershipRef = doc(db, 'user_memberships', userId)

  const [librarySnapshot, membershipSnapshot, userMembershipSnapshot] = await Promise.all([getDoc(libraryRef), getDoc(membershipRef), getDoc(userMembershipRef)])

  if (!librarySnapshot.exists()) {
    throw new Error('Libreria non trovata.')
  }

  if (!membershipSnapshot.exists()) {
    throw new Error('Non hai accesso a questa libreria.')
  }

  if (!userMembershipSnapshot.exists()) {
    throw new Error('Membership primaria non trovata.')
  }

  const membershipData = membershipSnapshot.data() as { role: UserRole }

  await updateDoc(userMembershipRef, {
    primaryLibraryId: normalizedLibraryId,
    role: membershipData.role,
  })
}
