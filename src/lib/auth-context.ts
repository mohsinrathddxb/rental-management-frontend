import { createContext, useContext } from 'react'
import type { AuthUser } from './types'

type LoginPayload = {
  email: string
  password: string
}

export type AuthContextValue = {
  isLoading: boolean
  isAuthenticated: boolean
  user: AuthUser | null
  login: (payload: LoginPayload) => Promise<AuthUser>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
