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

/**
 * Decode a JWT without verifying signature.
 * Returns the payload or null if the token is malformed.
 */
function decodeJwt(token: string): { exp?: number; [key: string]: unknown } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

/**
 * Check if a JWT is expired. Non-JWT tokens (e.g. nrx_ API keys) return false
 * because they don't have an expiry claim the client can check.
 */
function isTokenExpired(token: string): boolean {
  // Non-JWT tokens (nrx_ API keys) — no client-side expiry check
  if (!token.includes('.') || token.startsWith('nrx_')) return false

  const payload = decodeJwt(token)
  if (!payload?.exp) return false

  // exp is in seconds since epoch; Date.now() is ms
  const nowSeconds = Math.floor(Date.now() / 1000)
  return payload.exp <= nowSeconds
}

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

const storedToken = localStorage.getItem('neurox_token')
const initialToken = storedToken && !isTokenExpired(storedToken) ? storedToken : null

// If we had a token but it was expired, clean it up
if (storedToken && !initialToken) {
  localStorage.removeItem('neurox_token')
}

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

  // Proactively logout when JWT expires
  useEffect(() => {
    if (!state.token) return
    const payload = decodeJwt(state.token)
    if (!payload?.exp) return

    const msUntilExpiry = payload.exp * 1000 - Date.now()
    if (msUntilExpiry <= 0) {
      // Already expired — logout immediately
      logout()
      return
    }

    const timer = setTimeout(() => {
      // eslint-disable-next-line no-console
      console.warn('[auth] Token expired, logging out')
      logout()
    }, msUntilExpiry)

    return () => clearTimeout(timer)
  }, [state.token, logout])

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
