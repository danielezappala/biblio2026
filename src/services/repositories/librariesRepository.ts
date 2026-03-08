import { doc, serverTimestamp, writeBatch } from 'firebase/firestore'

import { getFirestoreDb } from '@/services/firebase/firebaseApp'
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
