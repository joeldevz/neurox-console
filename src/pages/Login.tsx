import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { api, ApiClientError } from '@/lib/api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

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
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ background: 'var(--bg-page)' }}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <Brain className="w-10 h-10" style={{ color: 'var(--brand-500)' }} />
          </div>
          <CardTitle className="text-2xl">Neurox Console</CardTitle>
          <CardDescription>
            Sign in to manage your Neurox instance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="password">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="password" className="flex-1">Email &amp; Password</TabsTrigger>
              <TabsTrigger value="token" className="flex-1">API Key</TabsTrigger>
            </TabsList>

            {/* Email + Password */}
            <TabsContent value="password">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                {emailError && (
                  <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
                    {emailError}
                  </p>
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
                  <Label htmlFor="token">API Key / Token</Label>
                  <Input
                    id="token"
                    type="password"
                    placeholder="nrx_..."
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                {tokenError && (
                  <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
                    {tokenError}
                  </p>
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
        </CardContent>
      </Card>
    </div>
  )
}
