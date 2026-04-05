import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import { api, setToken, clearToken, ApiClientError } from '@/lib/api'
import type { Me } from '@/types/api'

interface AuthState {
  token: string | null
  me: Me | null
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (token: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const initialToken = localStorage.getItem('neurox_token')

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: initialToken,
    me: null,
    // If no token exists, skip loading phase entirely
    isLoading: !!initialToken,
  })

  // On mount: if token exists, validate by calling /api/admin/me
  useEffect(() => {
    if (!initialToken) return
    api
      .me()
      .then(me => setState(s => ({ ...s, me, isLoading: false })))
      .catch((err: unknown) => {
        if (err instanceof ApiClientError && err.status === 401) {
          clearToken()
          setState({ token: null, me: null, isLoading: false })
        } else {
          setState(s => ({ ...s, isLoading: false }))
        }
      })
  }, []) // only run on mount

  const login = useCallback(async (newToken: string) => {
    setToken(newToken)
    try {
      const me = await api.me()
      setState({ token: newToken, me, isLoading: false })
    } catch (err) {
      clearToken()
      throw err
    }
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setState({ token: null, me: null, isLoading: false })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider')
  return ctx
}
