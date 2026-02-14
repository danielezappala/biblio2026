import type { Timestamp } from 'firebase/firestore'

export function formatTimestampToLocalDate(value: Timestamp | null): string {
  if (!value) {
    return '-'
  }

  return new Date(value.seconds * 1000).toLocaleDateString()
}
