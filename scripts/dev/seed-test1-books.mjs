import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

const TARGET_EMAIL = 'antoniogregorio@gmail.com'
const TARGET_LIBRARY_NAME = 'Test1'

const TEST_BOOKS = [
  {
    id: 'test-hobbit',
    title: 'Il Signore degli Anelli: Lo Hobbit',
    authors: ['J.R.R. Tolkien'],
    publisher: 'Bompiani',
    publishedDate: '1937-09-21',
    isbn: '9788845292613',
    synopsis: 'Bilbo Baggins lascia la Contea per un viaggio inatteso con nani e stregone.',
    pageCount: 310,
    note: 'Ottimo libro per verificare ricerca per prefisso e dettaglio.',
    rating: 5,
    shelf: 'Fantasy A1',
  },
  {
    id: 'test-dune',
    title: 'Dune',
    authors: ['Frank Herbert'],
    publisher: 'Fanucci',
    publishedDate: '1965-08-01',
    isbn: '9788834712016',
    synopsis: 'Intrighi politici, ecologia e destino sul pianeta Arrakis.',
    pageCount: 624,
    note: 'Usare il prefisso du per verificare la ricerca live.',
    rating: 4,
    shelf: 'SciFi B2',
  },
  {
    id: 'test-foundation',
    title: 'Fondazione',
    authors: ['Isaac Asimov'],
    publisher: 'Mondadori',
    publishedDate: '1951-06-01',
    isbn: '9788804668237',
    synopsis: 'Hari Seldon prova a ridurre i secoli di barbarie con la psicostoria.',
    pageCount: 255,
    note: 'Titolo utile per verificare ordinamento alfabetico.',
    rating: 4,
    shelf: 'SciFi B1',
  },
  {
    id: 'test-nome-della-rosa',
    title: 'Il nome della rosa',
    authors: ['Umberto Eco'],
    publisher: 'La nave di Teseo',
    publishedDate: '1980-01-01',
    isbn: '9788893445900',
    synopsis: 'Un mistero medievale tra biblioteca, simboli e indagine.',
    pageCount: 536,
    note: 'Verificare dettaglio e rendering note condivise.',
    rating: 5,
    shelf: 'Romanzi C3',
  },
]

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

async function resolveTargetLibrary(db, ownerUserId) {
  const snapshot = await db
    .collection('libraries')
    .where('name', '==', TARGET_LIBRARY_NAME)
    .where('ownerUserId', '==', ownerUserId)
    .limit(1)
    .get()

  if (snapshot.empty) {
    throw new Error(
      `Library ${TARGET_LIBRARY_NAME} not found for ${TARGET_EMAIL}. Run npm run init:library:test1 first.`
    )
  }

  return snapshot.docs[0].ref
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
  const libraryRef = await resolveTargetLibrary(db, ownerUserId)

  const batch = db.batch()

  for (const book of TEST_BOOKS) {
    const bookRef = db.collection('books').doc(book.id)
    batch.set(
      bookRef,
      {
        libraryId: libraryRef.id,
        title: book.title,
        titleLowercase: book.title.toLowerCase(),
        authors: book.authors,
        publisher: book.publisher,
        publishedDate: book.publishedDate,
        isbn: book.isbn,
        synopsis: book.synopsis,
        pageCount: book.pageCount,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        removedAt: null,
      },
      { merge: true }
    )

    const noteRef = db.collection('book_notes').doc(`note-${book.id}`)
    batch.set(
      noteRef,
      {
        libraryId: libraryRef.id,
        bookId: book.id,
        note: book.note,
        rating: book.rating,
        shelf: book.shelf,
        customDates: [],
        updatedByUserId: ownerUserId,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
  }

  await batch.commit()

  console.log(`OK seededBooks=${TEST_BOOKS.length} libraryId=${libraryRef.id} ownerUserId=${ownerUserId}`)
}

main().catch((error) => {
  console.error('SEED_FAILED', error.message)
  process.exit(1)
})
