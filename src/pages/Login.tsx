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
import { useAuth } from '@/hooks/useAuth'
import { ApiClientError } from '@/lib/api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!token.trim()) return
    setLoading(true)
    setError(null)
    try {
      await login(token.trim())
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(
          err.status === 401
            ? 'Invalid token. Check your API key and try again.'
            : err.message
        )
      } else {
        setError('Could not connect to the server.')
      }
    } finally {
      setLoading(false)
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
            Paste your API key or admin token to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">API Key / Token</Label>
              <Input
                id="token"
                type="password"
                placeholder="nrx_..."
                value={token}
                onChange={e => setToken(e.target.value)}
                autoComplete="current-password"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !token.trim()}
            >
              {loading ? 'Connecting…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
