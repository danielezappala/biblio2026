import {
  collection,
  doc,
  endAt,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAt,
  where,
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
