import type { Timestamp } from 'firebase/firestore'

export type UserRole = 'owner' | 'viewer'

export type SessionStatus = 'loading' | 'authenticated' | 'no_membership' | 'unauthenticated'

export type Book = {
  id: string
  libraryId: string
  title: string
  titleLowercase: string
  authors: string[]
  publisher: string | null
  publishedDate: string | null
  isbn: string | null
  synopsis: string | null
  pageCount: number | null
  createdAt: Timestamp
  updatedAt: Timestamp
  removedAt: Timestamp | null
}

export type BookNoteDate = {
  label: string
  date: Timestamp
}

export type BookNote = {
  id: string
  libraryId: string
  bookId: string
  note: string
  rating: number | null
  shelf: string | null
  customDates: BookNoteDate[]
  updatedByUserId: string
  updatedAt: Timestamp
}

export type ReadingState = {
  id: string
  libraryId: string
  bookId: string
  userId: string
  status: 'to_read' | 'reading' | 'read'
  updatedAt: Timestamp
}

export type PendingInvite = {
  id: string
  libraryId: string
  email: string
  emailLower: string
  role: 'viewer'
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export type Membership = {
  libraryId: string
  userId: string
  role: UserRole
  createdAt: Timestamp
}

export type AuthSession = {
  userId: string
  email: string | null
  membership: Membership
}

export type AuthIdentity = {
  userId: string
  email: string | null
}
