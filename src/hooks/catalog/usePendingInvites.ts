import { useEffect, useState } from 'react'

import { cleanupStalePendingInvitesByLibraryId, subscribePendingInvitesByLibraryId } from '@/services'
import type { PendingInvite } from '@/types'

export function usePendingInvites(libraryId: string) {
  const [invites, setInvites] = useState<PendingInvite[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!libraryId) {
      setInvites([])
      setIsLoading(false)
      setError(null)
      return undefined
    }

    setIsLoading(true)
    setError(null)
    void cleanupStalePendingInvitesByLibraryId(libraryId).catch(() => {
      // Non blocchiamo la UI: la lista rimane leggibile anche se la pulizia fallisce.
    })

    const unsubscribe = subscribePendingInvitesByLibraryId(
      libraryId,
      (nextInvites) => {
        setInvites(nextInvites)
        setIsLoading(false)
      },
      (message) => {
        setError(message)
        setIsLoading(false)
      }
    )

    return () => {
      unsubscribe()
    }
  }, [libraryId])

  return {
    invites,
    isLoading,
    error,
  }
}
