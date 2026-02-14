import { useEffect, useState } from 'react'

import { subscribeBookById, subscribeNotesByBookId } from '@/services'
import type { Book, BookNote } from '@/types'

export function useBookDetails(libraryId: string, bookId: string) {
  const [book, setBook] = useState<Book | null>(null)
  const [notes, setNotes] = useState<BookNote[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!libraryId || !bookId) {
      setBook(null)
      setNotes([])
      setIsLoading(false)
      return undefined
    }

    setIsLoading(true)

    const unsubscribeBook = subscribeBookById(libraryId, bookId, (nextBook) => {
      setBook(nextBook)
      setIsLoading(false)
    })

    const unsubscribeNotes = subscribeNotesByBookId(libraryId, bookId, (nextNotes) => {
      setNotes(nextNotes)
    })

    return () => {
      unsubscribeBook()
      unsubscribeNotes()
    }
  }, [bookId, libraryId])

  return {
    book,
    notes,
    isLoading,
  }
}
