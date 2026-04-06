import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Copy, Check, ExternalLink, RefreshCw, Info } from 'lucide-react'
import { PageLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'

// Resolve MCP URL: prefer explicit env var, otherwise append /mcp to API URL
const MCP_URL =
  import.meta.env.VITE_MCP_URL ||
  (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/mcp'

// Pre-registered Claude client_id — Claude uses this automatically, no registration needed
const CLAUDE_CLIENT_ID = 'claude-mcp-client'

export default function ConnectClaude() {
  const [copied, setCopied] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['oauth-tokens'],
    queryFn: () => api.listOAuthTokens(),
  })

  const isConnected = (data?.count ?? 0) > 0

  const handleCopy = () => {
    navigator.clipboard.writeText(MCP_URL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <PageLayout
      title="Connect Claude"
      description="Integrate Claude with your Neurox memory via the MCP protocol"
    >
      <div className="space-y-6 max-w-2xl">
        {/* Status card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Connection Status</CardTitle>
              <Badge variant={isConnected ? 'default' : 'secondary'}>
                {isLoading ? 'Checking…' : isConnected ? 'Connected' : 'Not connected'}
              </Badge>
            </div>
            <CardDescription>
              {isConnected
                ? `${data!.count} active OAuth session${data!.count > 1 ? 's' : ''}`
                : 'No active Claude connections detected'}
            </CardDescription>
          </CardHeader>
          {isConnected && data && data.tokens.length > 0 && (
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-1">
                {data.tokens.map(tok => (
                  <div key={tok.id} className="flex justify-between">
                    <span className="font-mono text-xs">{tok.client_id.slice(0, 16)}…</span>
                    <span>Expires {formatDate(tok.expires_at)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* MCP URL card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">MCP Server URL</CardTitle>
            <CardDescription>
              Paste this URL into Claude's MCP connector settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono break-all">
                {MCP_URL}
              </code>
              <Button size="sm" variant="outline" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            {/* Pre-registered client_id info */}
            <div className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                Claude uses the pre-registered client ID{' '}
                <code className="font-mono text-foreground">{CLAUDE_CLIENT_ID}</code>{' '}
                — no manual registration needed.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Instructions card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How to Connect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ol className="list-decimal list-inside space-y-2">
              <li>Open Claude → Settings → Connections → Add MCP Server</li>
              <li>Paste the MCP Server URL above</li>
              <li>Claude will open a browser window — log in with your Neurox credentials</li>
              <li>Approve the connection request</li>
              <li>Return here and click Refresh to confirm the connection</li>
            </ol>
            <div className="pt-2 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh Status
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <a
                  href="https://modelcontextprotocol.io/docs/develop/connect-remote-servers"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  MCP Docs
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}