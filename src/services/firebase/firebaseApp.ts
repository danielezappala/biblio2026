import { initializeApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
] as const

const missingEnvVars = requiredEnvVars.filter((name) => !import.meta.env[name])

export const firebaseConfigError =
  missingEnvVars.length > 0 ? `Missing required env var: ${missingEnvVars.join(', ')}` : null

let firebaseAuth: Auth | null = null
let firestoreDb: Firestore | null = null

if (!firebaseConfigError) {
  const app = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? undefined,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? undefined,
  })

  firebaseAuth = getAuth(app)
  firestoreDb = getFirestore(app)
}

export function getFirebaseAuth(): Auth {
  if (!firebaseAuth) {
    throw new Error(firebaseConfigError ?? 'Firebase Auth not initialized.')
  }
  return firebaseAuth
}

export function getFirestoreDb(): Firestore {
  if (!firestoreDb) {
    throw new Error(firebaseConfigError ?? 'Firestore not initialized.')
  }
  return firestoreDb
}
