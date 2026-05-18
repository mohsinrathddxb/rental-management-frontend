import { useEffect, useState, type PropsWithChildren } from 'react'
import { AuthContext } from './auth-context'
import { http } from './http'
import type { AuthUser, LoginResponse, SessionResponse } from './types'

type LoginPayload = {
  email: string
  password: string
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshSession = async () => {
    try {
      const { data } = await http.get<SessionResponse>('/auth/session.php')
      if (data.authenticated && data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isActive = true

    http
      .get<SessionResponse>('/auth/session.php')
      .then(({ data }) => {
        if (!isActive) return
        if (data.authenticated && data.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      })
      .catch(() => {
        if (isActive) {
          setUser(null)
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  const login = async (payload: LoginPayload) => {
    const { data } = await http.post<LoginResponse>('/auth/login.php', payload)
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    await http.post('/auth/logout.php')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated: Boolean(user),
        user,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
