import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthContext as useAuth } from '@/context/auth'
import { api, ApiClientError } from '@/lib/api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  // Set page title
  useEffect(() => {
    document.title = 'Sign in · Neurox'
  }, [])

  // Tab mode state
  const [mode, setMode] = useState<'password' | 'token'>('password')

  // Email + password state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailLoading, setEmailLoading] = useState(false)

  // API key state
  const [token, setToken] = useState('')
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [tokenLoading, setTokenLoading] = useState(false)

  async function handleEmailLogin(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setEmailLoading(true)
    setEmailError(null)
    try {
      const res = await api.loginWithPassword(email.trim(), password)
      await login(res.token)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (err instanceof ApiClientError) {
        setEmailError(
          err.status === 401
            ? 'Invalid email or password.'
            : err.message
        )
      } else {
        setEmailError('Could not connect to the server.')
      }
    } finally {
      setEmailLoading(false)
    }
  }

  async function handleTokenLogin(e: FormEvent) {
    e.preventDefault()
    if (!token.trim()) return
    setTokenLoading(true)
    setTokenError(null)
    try {
      await login(token.trim())
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (err instanceof ApiClientError) {
        setTokenError(
          err.status === 401
            ? 'Invalid token. Check your API key and try again.'
            : err.message
        )
      } else {
        setTokenError('Could not connect to the server.')
      }
    } finally {
      setTokenLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center">
            <span className="text-text-inverse font-bold">N</span>
          </div>
          <span className="text-xl font-semibold text-text-primary">Neurox</span>
        </div>

        <div className="bg-surface-2 border border-border-subtle rounded-lg p-8">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            Sign in to your admin console.
          </p>

          <Tabs value={mode} onValueChange={(v) => setMode(v as 'password' | 'token')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="password">Email + Password</TabsTrigger>
              <TabsTrigger value="token">API Key</TabsTrigger>
            </TabsList>

            {/* Email + Password */}
            <TabsContent value="password">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                {emailError && (
                  <div role="alert" aria-live="polite" className="text-sm text-danger-400 bg-danger-light/20 border border-danger-500/30 rounded-md px-3 py-2">
                    {emailError}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={emailLoading || !email.trim() || !password}
                >
                  {emailLoading ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>
            </TabsContent>

            {/* API Key */}
            <TabsContent value="token">
              <form onSubmit={handleTokenLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-token">API Key</Label>
                  <Input
                    id="login-token"
                    type="password"
                    placeholder="nrx_..."
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>
                {tokenError && (
                  <div role="alert" aria-live="polite" className="text-sm text-danger-400 bg-danger-light/20 border border-danger-500/30 rounded-md px-3 py-2">
                    {tokenError}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={tokenLoading || !token.trim()}
                >
                  {tokenLoading ? 'Connecting…' : 'Sign in'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-center text-xs text-text-tertiary mt-6">
          Protected by Neurox Auth
        </p>
      </div>
    </div>
  )
}
