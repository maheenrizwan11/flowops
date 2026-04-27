import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api } from '../lib/api'
import type { Me, Membership } from '../types/api'

type AuthState = {
  token: string | null
  user: Me | null
  currentOrg: Membership | null
  loading: boolean
  login: (token: string) => Promise<void>
  logout: () => void
  setCurrentOrg: (m: Membership) => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('flowops_token'))
  const [user, setUser] = useState<Me | null>(null)
  const [currentOrg, setCurrentOrgState] = useState<Membership | null>(null)
  const [loading, setLoading] = useState<boolean>(!!token)

  async function fetchMe() {
    try {
      const data = await api.get<Me>('/auth/me')
      setUser(data)
      const savedOrgId = localStorage.getItem('flowops_org')
      const fallback = data.memberships[0] ?? null
      const found = data.memberships.find((m) => m.organization.id === savedOrgId) ?? fallback
      setCurrentOrgState(found)
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchMe()
    else setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function login(newToken: string) {
    localStorage.setItem('flowops_token', newToken)
    setToken(newToken)
    setLoading(true)
    await fetchMe()
  }

  function logout() {
    localStorage.removeItem('flowops_token')
    localStorage.removeItem('flowops_org')
    setToken(null)
    setUser(null)
    setCurrentOrgState(null)
  }

  function setCurrentOrg(m: Membership) {
    localStorage.setItem('flowops_org', m.organization.id)
    setCurrentOrgState(m)
  }

  return (
    <AuthContext.Provider value={{ token, user, currentOrg, loading, login, logout, setCurrentOrg }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}