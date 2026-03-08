export const AUTO_BOOTSTRAP_EMAIL = 'antoniogregorio@gmail.com'

export function canSelfBootstrapLibrary(email: string | null): boolean {
  return email?.toLowerCase() === AUTO_BOOTSTRAP_EMAIL
}
