import { User } from '@/types'

export const setAuth = (token: string, user: User): void => {
  localStorage.setItem('runite_token', token)
  localStorage.setItem('runite_user', JSON.stringify(user))
}

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('runite_token')
}

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('runite_user')
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export const clearAuth = (): void => {
  localStorage.removeItem('runite_token')
  localStorage.removeItem('runite_user')
}

export const isAuthenticated = (): boolean => {
  return !!getToken()
}

export const updateStoredUser = (updates: Partial<User>): void => {
  const user = getUser()
  if (!user) return
  localStorage.setItem('runite_user', JSON.stringify({ ...user, ...updates }))
}