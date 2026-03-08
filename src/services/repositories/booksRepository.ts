import {
  collection,
  doc,
  endAt,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAt,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore'
import type { Timestamp } from 'firebase/firestore'

import { getFirestoreDb } from '@/services/firebase/firebaseApp'
import type { Book } from '@/types'

type BookDoc = {
  libraryId: string
  title: string
  titleLowercase: string
  authors?: string[]
  publisher?: string | null
  publishedDate?: string | null
  isbn?: string | null
  synopsis?: string | null
  pageCount?: number | null
  createdAt: Timestamp
  updatedAt: Timestamp
  removedAt?: Book['removedAt']
}

function mapBook(docId: string, data: BookDoc): Book {
  return {
    id: docId,
    libraryId: data.libraryId,
    title: data.title,
    titleLowercase: data.titleLowercase,
    authors: data.authors ?? [],
    publisher: data.publisher ?? null,
    publishedDate: data.publishedDate ?? null,
    isbn: data.isbn ?? null,
    synopsis: data.synopsis ?? null,
    pageCount: data.pageCount ?? null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    removedAt: data.removedAt ?? null,
  }
}

type GoogleBooksApiResponse = {
  items?: Array<{
    volumeInfo?: {
      title?: string
      authors?: string[]
      publisher?: string
      publishedDate?: string
      description?: string
      pageCount?: number
      industryIdentifiers?: Array<{
        type?: string
        identifier?: string
      }>
    }
  }>
}

type BookSeedCandidate = {
  title: string
  authors: string[]
  publisher: string | null
  publishedDate: string | null
  isbn: string | null
  synopsis: string | null
  pageCount: number | null
}

export type SeedPublicBooksResult = {
  addedCount: number
  skippedCount: number
}

function normalizeTitle(title: string): string {
  return title.trim().replace(/\s+/g, ' ')
}

function pickIsbn(identifiers?: Array<{ type?: string; identifier?: string }>): string | null {
  if (!identifiers || identifiers.length === 0) {
    return null
  }

  const isbn13 = identifiers.find((entry) => entry.type === 'ISBN_13' && entry.identifier)?.identifier?.trim()
  if (isbn13) {
    return isbn13
  }

  const isbn10 = identifiers.find((entry) => entry.type === 'ISBN_10' && entry.identifier)?.identifier?.trim()
  return isbn10 ?? null
}

function buildBookKey(title: string, isbn: string | null): string {
  const normalizedTitle = title.trim().toLowerCase()
  return isbn ? `isbn:${isbn}` : `title:${normalizedTitle}`
}

async function fetchGoogleBooks(queryText: string, maxResults: number): Promise<BookSeedCandidate[]> {
  const params = new URLSearchParams({
    q: queryText,
    printType: 'books',
    orderBy: 'relevance',
    maxResults: String(maxResults),
  })

  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?${params.toString()}`)
  if (!response.ok) {
    throw new Error(`Google Books error (${response.status}).`)
  }

  const payload = (await response.json()) as GoogleBooksApiResponse
  const items = payload.items ?? []

  return items
    .map((item) => {
      const info = item.volumeInfo
      if (!info?.title) {
        return null
      }

      const title = normalizeTitle(info.title)
      if (!title) {
        return null
      }

      return {
        title,
        authors: info.authors ?? [],
        publisher: info.publisher?.trim() ?? null,
        publishedDate: info.publishedDate?.trim() ?? null,
        isbn: pickIsbn(info.industryIdentifiers),
        synopsis: info.description?.trim() ?? null,
        pageCount: typeof info.pageCount === 'number' ? info.pageCount : null,
      } satisfies BookSeedCandidate
    })
    .filter((book): book is BookSeedCandidate => Boolean(book))
}

export async function seedPublicBooksByLibraryId(libraryId: string, maxBooks = 20): Promise<SeedPublicBooksResult> {
  const normalizedLibraryId = libraryId.trim()
  if (!normalizedLibraryId) {
    throw new Error('libraryId obbligatorio.')
  }

  const safeMaxBooks = Math.min(Math.max(maxBooks, 1), 40)
  const sourceQueries = ['subject:classic literature', 'subject:fantasy', 'subject:history']
  const fetchedCandidates: BookSeedCandidate[] = []

  for (const sourceQuery of sourceQueries) {
    const chunk = await fetchGoogleBooks(sourceQuery, 15)
    fetchedCandidates.push(...chunk)
    if (fetchedCandidates.length >= safeMaxBooks * 2) {
      break
    }
  }

  const uniqueCandidates = new Map<string, BookSeedCandidate>()
  for (const candidate of fetchedCandidates) {
    const key = buildBookKey(candidate.title, candidate.isbn)
    if (!uniqueCandidates.has(key)) {
      uniqueCandidates.set(key, candidate)
    }
  }

  const db = getFirestoreDb()
  const existingBooksQuery = query(
    collection(db, 'books'),
    where('libraryId', '==', normalizedLibraryId),
    where('removedAt', '==', null),
    limit(400)
  )
  const existingBooksSnapshot = await getDocs(existingBooksQuery)
  const existingBookKeys = new Set<string>()

  for (const existingDoc of existingBooksSnapshot.docs) {
    const existingData = existingDoc.data() as BookDoc
    existingBookKeys.add(buildBookKey(existingData.title, existingData.isbn ?? null))
  }

  const booksToCreate = Array.from(uniqueCandidates.values())
    .filter((candidate) => !existingBookKeys.has(buildBookKey(candidate.title, candidate.isbn)))
    .slice(0, safeMaxBooks)

  if (booksToCreate.length === 0) {
    return {
      addedCount: 0,
      skippedCount: uniqueCandidates.size,
    }
  }

  let addedCount = 0
  for (let index = 0; index < booksToCreate.length; index += 200) {
    const chunk = booksToCreate.slice(index, index + 200)
    const batch = writeBatch(db)

    for (const candidate of chunk) {
      const bookRef = doc(collection(db, 'books'))
      batch.set(bookRef, {
        libraryId: normalizedLibraryId,
        title: candidate.title,
        titleLowercase: candidate.title.toLowerCase(),
        authors: candidate.authors,
        publisher: candidate.publisher,
        publishedDate: candidate.publishedDate,
        isbn: candidate.isbn,
        synopsis: candidate.synopsis,
        pageCount: candidate.pageCount,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        removedAt: null,
      })
    }

    await batch.commit()
    addedCount += chunk.length
  }

  return {
    addedCount,
    skippedCount: uniqueCandidates.size - addedCount,
  }
}

export function subscribeBooksByLibraryId(
  libraryId: string,
  searchPrefix: string,
  callback: (books: Book[]) => void
): Unsubscribe {
  const normalizedPrefix = searchPrefix.trim().toLowerCase()
  const booksRef = collection(getFirestoreDb(), 'books')
  const queryConstraints = [
    where('libraryId', '==', libraryId),
    where('removedAt', '==', null),
    orderBy('titleLowercase', 'asc'),
    limit(200),
  ] as const

  const booksQuery =
    normalizedPrefix.length === 0
      ? query(booksRef, ...queryConstraints)
      : query(booksRef, ...queryConstraints, startAt(normalizedPrefix), endAt(`${normalizedPrefix}\uf8ff`))

  return onSnapshot(booksQuery, (snapshot) => {
    const books = snapshot.docs.map((snapshotDoc) => mapBook(snapshotDoc.id, snapshotDoc.data() as BookDoc))
    callback(books)
  })
}

export function subscribeBookById(
  libraryId: string,
  bookId: string,
  callback: (book: Book | null) => void
): Unsubscribe {
  const bookRef = doc(getFirestoreDb(), 'books', bookId)

  return onSnapshot(bookRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null)
      return
    }

    const data = snapshot.data() as BookDoc
    if (data.libraryId !== libraryId || data.removedAt) {
      callback(null)
      return
    }

    callback(mapBook(snapshot.id, data))
  })
}
