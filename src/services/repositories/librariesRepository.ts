import { doc, serverTimestamp, writeBatch } from 'firebase/firestore'

import { getFirestoreDb } from '@/services/firebase/firebaseApp'

function normalizeLibraryName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

export async function createInitialLibraryWithOwnerMembership(userId: string, libraryName: string): Promise<string> {
  const normalizedName = normalizeLibraryName(libraryName)
  if (!normalizedName) {
    throw new Error('Inserisci un nome libreria valido.')
  }

  const db = getFirestoreDb()
  const libraryRef = doc(db, 'libraries', crypto.randomUUID())
  const membershipRef = doc(db, 'libraries', libraryRef.id, 'memberships', userId)
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

  await batch.commit()
  return libraryRef.id
}

export async function addViewerMembershipByUserId(libraryId: string, viewerUserId: string): Promise<void> {
  const normalizedLibraryId = libraryId.trim()
  const normalizedViewerUserId = viewerUserId.trim()

  if (!normalizedLibraryId || !normalizedViewerUserId) {
    throw new Error('libraryId e viewerUserId sono obbligatori.')
  }

  const db = getFirestoreDb()
  const membershipRef = doc(db, 'libraries', normalizedLibraryId, 'memberships', normalizedViewerUserId)

  const batch = writeBatch(db)
  batch.set(membershipRef, {
    userId: normalizedViewerUserId,
    role: 'viewer',
    createdAt: serverTimestamp(),
  })

  await batch.commit()
}
