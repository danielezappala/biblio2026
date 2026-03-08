import {
  collection,
  collectionGroup,
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
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore'

import { getFirestoreDb } from '@/services/firebase/firebaseApp'
import { resolveUserIdByEmail } from '@/services/repositories/userLookupRepository'
import type { PendingInvite } from '@/types'

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
    userId,
    libraryId: libraryRef.id,
    role: 'owner',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
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
  const userMembershipRef = doc(db, 'user_memberships', normalizedViewerUserId)

  const batch = writeBatch(db)
  batch.set(membershipRef, {
    userId: normalizedViewerUserId,
    role: 'viewer',
    createdAt: serverTimestamp(),
  })
  batch.set(
    userMembershipRef,
    {
      userId: normalizedViewerUserId,
      libraryId: normalizedLibraryId,
      role: 'viewer',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )

  await batch.commit()
}

type AddViewerByEmailResult = 'viewer_added' | 'invite_created'

export async function addViewerMembershipByEmail(libraryId: string, viewerEmail: string): Promise<AddViewerByEmailResult> {
  const normalizedLibraryId = libraryId.trim()
  const normalizedEmail = viewerEmail.trim().toLowerCase()
  if (!normalizedLibraryId || !normalizedEmail) {
    throw new Error('Inserisci libreria ed email valide.')
  }

  const viewerUserId = await resolveUserIdByEmail(normalizedEmail)
  if (!viewerUserId) {
    const db = getFirestoreDb()
    const inviteRef = doc(db, 'libraries', normalizedLibraryId, 'invites', normalizedEmail)
    await setDoc(
      inviteRef,
      {
        email: viewerEmail.trim(),
        emailLower: normalizedEmail,
        role: 'viewer',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
    return 'invite_created'
  }

  await addViewerMembershipByUserId(normalizedLibraryId, viewerUserId)
  await deleteDoc(doc(getFirestoreDb(), 'libraries', normalizedLibraryId, 'invites', normalizedEmail))
  return 'viewer_added'
}

export async function claimFirstPendingInviteByEmail(userId: string, email: string): Promise<boolean> {
  const normalizedUserId = userId.trim()
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedUserId || !normalizedEmail) {
    return false
  }

  const db = getFirestoreDb()
  const inviteQuery = query(
    collectionGroup(db, 'invites'),
    where('emailLower', '==', normalizedEmail),
    limit(5)
  )
  const inviteSnapshot = await getDocs(inviteQuery)
  if (inviteSnapshot.empty) {
    return false
  }

  const inviteDoc = inviteSnapshot.docs.find((snapshotDoc) => {
    const data = snapshotDoc.data() as { role?: string }
    return data.role === 'viewer'
  })
  if (!inviteDoc) {
    return false
  }

  const libraryRef = inviteDoc.ref.parent.parent
  if (!libraryRef) {
    return false
  }

  const membershipRef = doc(db, 'libraries', libraryRef.id, 'memberships', normalizedUserId)
  const userMembershipRef = doc(db, 'user_memberships', normalizedUserId)
  const batch = writeBatch(db)

  batch.set(
    membershipRef,
    {
      userId: normalizedUserId,
      role: 'viewer',
      createdAt: serverTimestamp(),
    },
    { merge: true }
  )
  batch.set(
    userMembershipRef,
    {
      userId: normalizedUserId,
      libraryId: libraryRef.id,
      role: 'viewer',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
  await batch.commit()

  try {
    await deleteDoc(inviteDoc.ref)
  } catch {
    // Non blocchiamo il login: eventuale invito residuo viene ripulito successivamente.
  }

  return true
}

type InviteDoc = {
  email?: string
  emailLower?: string
  role?: 'viewer'
  createdAt?: PendingInvite['createdAt']
  updatedAt?: PendingInvite['updatedAt']
}

export function subscribePendingInvitesByLibraryId(
  libraryId: string,
  callback: (invites: PendingInvite[]) => void,
  onError?: (message: string) => void
): Unsubscribe {
  const normalizedLibraryId = libraryId.trim()
  if (!normalizedLibraryId) {
    callback([])
    return () => undefined
  }

  const invitesRef = collection(getFirestoreDb(), 'libraries', normalizedLibraryId, 'invites')
  return onSnapshot(
    invitesRef,
    (snapshot) => {
      const invites = snapshot.docs
        .map((snapshotDoc) => {
          const data = snapshotDoc.data() as InviteDoc
          const emailLower = data.emailLower?.trim() ?? snapshotDoc.id
          const email = data.email?.trim() ?? emailLower

          if (!emailLower) {
            return null
          }

          return {
            id: snapshotDoc.id,
            libraryId: normalizedLibraryId,
            email,
            emailLower,
            role: 'viewer',
            createdAt: data.createdAt ?? null,
            updatedAt: data.updatedAt ?? null,
          } satisfies PendingInvite
        })
        .filter((invite): invite is PendingInvite => Boolean(invite))
        .sort((a, b) => a.emailLower.localeCompare(b.emailLower))

      callback(invites)
    },
    (error) => {
      onError?.(error.message)
      callback([])
    }
  )
}

export async function cleanupStalePendingInvitesByLibraryId(libraryId: string): Promise<number> {
  const normalizedLibraryId = libraryId.trim()
  if (!normalizedLibraryId) {
    return 0
  }

  const db = getFirestoreDb()
  const invitesRef = collection(db, 'libraries', normalizedLibraryId, 'invites')
  const invitesSnapshot = await getDocs(invitesRef)
  if (invitesSnapshot.empty) {
    return 0
  }

  let removedCount = 0
  for (const inviteDoc of invitesSnapshot.docs) {
    const data = inviteDoc.data() as InviteDoc
    const emailLower = data.emailLower?.trim() ?? inviteDoc.id
    if (!emailLower) {
      continue
    }

    const userId = await resolveUserIdByEmail(emailLower)
    if (!userId) {
      continue
    }

    const membershipRef = doc(db, 'libraries', normalizedLibraryId, 'memberships', userId)
    const membershipSnapshot = await getDoc(membershipRef)
    if (!membershipSnapshot.exists()) {
      continue
    }

    await deleteDoc(inviteDoc.ref)
    removedCount += 1
  }

  return removedCount
}

export async function cleanupOwnPendingInvitesByEmail(userId: string, email: string): Promise<number> {
  const normalizedUserId = userId.trim()
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedUserId || !normalizedEmail) {
    return 0
  }

  const db = getFirestoreDb()
  const userMembershipRef = doc(db, 'user_memberships', normalizedUserId)
  const userMembershipSnapshot = await getDoc(userMembershipRef)
  if (!userMembershipSnapshot.exists()) {
    return 0
  }

  const membershipData = userMembershipSnapshot.data() as { libraryId?: string }
  const libraryId = membershipData.libraryId?.trim()
  if (!libraryId) {
    return 0
  }

  const inviteRef = doc(db, 'libraries', libraryId, 'invites', normalizedEmail)
  await deleteDoc(inviteRef)
  return 1
}

export async function deletePendingInviteById(libraryId: string, inviteId: string): Promise<void> {
  const normalizedLibraryId = libraryId.trim()
  const normalizedInviteId = inviteId.trim()

  if (!normalizedLibraryId || !normalizedInviteId) {
    throw new Error('libraryId e inviteId sono obbligatori.')
  }

  const inviteRef = doc(getFirestoreDb(), 'libraries', normalizedLibraryId, 'invites', normalizedInviteId)
  await deleteDoc(inviteRef)
}
