import { useEffect, useState } from 'react'

import { subscribeBooksByLibraryId } from '@/services'
import type { Book } from '@/types'

export function useCatalogBooks(libraryId: string, searchPrefix: string) {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!libraryId) {
      setBooks([])
      setIsLoading(false)
      return undefined
    }

    setIsLoading(true)
    setError(null)

    const unsubscribe = subscribeBooksByLibraryId(libraryId, searchPrefix, (nextBooks) => {
      setBooks(nextBooks)
      setIsLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [libraryId, searchPrefix])

  return {
    books,
    isLoading,
    error,
  }
}
