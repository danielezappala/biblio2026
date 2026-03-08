import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'

import { getFirestoreDb } from '@/services/firebase/firebaseApp'

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function syncCurrentUserLookup(userId: string, email: string): Promise<void> {
  const normalizedEmail = normalizeEmail(email)
  if (!userId.trim() || !normalizedEmail) {
    return
  }

  const db = getFirestoreDb()
  const lookupRef = doc(db, 'user_lookup', normalizedEmail)

  await setDoc(
    lookupRef,
    {
      userId: userId.trim(),
      email,
      emailLower: normalizedEmail,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function resolveUserIdByEmail(email: string): Promise<string | null> {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) {
    return null
  }

  const db = getFirestoreDb()
  const lookupRef = doc(db, 'user_lookup', normalizedEmail)
  const lookupSnapshot = await getDoc(lookupRef)

  if (!lookupSnapshot.exists()) {
    return null
  }

  const data = lookupSnapshot.data() as { userId?: string }
  const userId = data.userId?.trim()
  return userId ? userId : null
}
