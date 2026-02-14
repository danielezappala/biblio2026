import { collection, onSnapshot, orderBy, query, where, type Unsubscribe } from 'firebase/firestore'
import type { Timestamp } from 'firebase/firestore'

import { getFirestoreDb } from '@/services/firebase/firebaseApp'
import type { BookNote } from '@/types'

type BookNoteDoc = {
  libraryId: string
  bookId: string
  note?: string
  rating?: number | null
  shelf?: string | null
  customDates?: BookNote['customDates']
  updatedByUserId: string
  updatedAt: Timestamp
}

function mapBookNote(docId: string, data: BookNoteDoc): BookNote {
  return {
    id: docId,
    libraryId: data.libraryId,
    bookId: data.bookId,
    note: data.note ?? '',
    rating: data.rating ?? null,
    shelf: data.shelf ?? null,
    customDates: data.customDates ?? [],
    updatedByUserId: data.updatedByUserId,
    updatedAt: data.updatedAt,
  }
}

export function subscribeNotesByBookId(
  libraryId: string,
  bookId: string,
  callback: (notes: BookNote[]) => void
): Unsubscribe {
  const notesRef = collection(getFirestoreDb(), 'book_notes')
  const notesQuery = query(
    notesRef,
    where('libraryId', '==', libraryId),
    where('bookId', '==', bookId),
    orderBy('updatedAt', 'desc')
  )

  return onSnapshot(notesQuery, (snapshot) => {
    const notes = snapshot.docs.map((snapshotDoc) => mapBookNote(snapshotDoc.id, snapshotDoc.data() as BookNoteDoc))
    callback(notes)
  })
}
