import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

const TARGET_EMAIL = 'antoniogregorio@gmail.com'
const TARGET_LIBRARY_NAME = 'Test1'

function resolveProjectId() {
  if (process.env.FIREBASE_PROJECT_ID) {
    return process.env.FIREBASE_PROJECT_ID
  }

  const firebasercPath = path.resolve('.firebaserc')
  if (!fs.existsSync(firebasercPath)) {
    return null
  }

  const raw = fs.readFileSync(firebasercPath, 'utf8')
  const parsed = JSON.parse(raw)
  return parsed?.projects?.default ?? null
}

async function main() {
  const projectId = resolveProjectId()
  if (!projectId) {
    throw new Error('Missing projectId. Set FIREBASE_PROJECT_ID or configure .firebaserc default project.')
  }

  initializeApp({
    credential: applicationDefault(),
    projectId,
  })

  const auth = getAuth()
  const db = getFirestore()

  const userRecord = await auth.getUserByEmail(TARGET_EMAIL)
  const ownerUserId = userRecord.uid

  const existingLibraryQuery = await db
    .collection('libraries')
    .where('name', '==', TARGET_LIBRARY_NAME)
    .where('ownerUserId', '==', ownerUserId)
    .limit(1)
    .get()

  const libraryRef = existingLibraryQuery.empty
    ? db.collection('libraries').doc()
    : db.collection('libraries').doc(existingLibraryQuery.docs[0].id)

  const membershipRef = db.collection('libraries').doc(libraryRef.id).collection('memberships').doc(ownerUserId)

  const batch = db.batch()

  if (existingLibraryQuery.empty) {
    batch.set(libraryRef, {
      name: TARGET_LIBRARY_NAME,
      ownerUserId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
  }

  batch.set(
    membershipRef,
    {
      userId: ownerUserId,
      role: 'owner',
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  )

  await batch.commit()

  console.log(`OK libraryId=${libraryRef.id} ownerUserId=${ownerUserId} email=${TARGET_EMAIL}`)
}

main().catch((error) => {
  console.error('INIT_FAILED', error.message)
  process.exit(1)
})
