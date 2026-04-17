import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Copy, Eye, EyeOff } from 'lucide-react'
import { PageLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { api } from '@/lib/api'
import { formatDate, cn } from '@/lib/utils'
import { ROLE_COLORS, API_KEY_STATUS_COLORS } from '@/lib/constants'
import type { ApiKey, ApiKeyCreated } from '@/types/api'

export default function ApiKeys() {
  const qc = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [keyRole, setKeyRole] = useState<string>('member')
  const [keyScopes, setKeyScopes] = useState('')
  const [keyExpiresAt, setKeyExpiresAt] = useState('')
  const [createdKey, setCreatedKey] = useState<ApiKeyCreated | null>(null)
  const [showKeyOpen, setShowKeyOpen] = useState(false)
  const [showPlaintext, setShowPlaintext] = useState(false)
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'revoked'>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => api.listApiKeys(),
  })

  const createMutation = useMutation({
    mutationFn: () => api.createApiKey({
      name: keyName,
      role: keyRole || undefined,
      scopes: keyScopes ? keyScopes.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      expires_at: keyExpiresAt || undefined,
    }),
    onSuccess: newKey => {
      void qc.invalidateQueries({ queryKey: ['api-keys'] })
      setCreatedKey(newKey)
      setCreateOpen(false)
      setKeyName('')
      setKeyRole('member')
      setKeyScopes('')
      setKeyExpiresAt('')
      setShowKeyOpen(true)
      toast.success('API key created')
    },
    onError: () => {
      toast.error('Failed to create key')
    },
  })

  const revokeMutation = useMutation({
    mutationFn: (id: string) => api.revokeApiKey(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['api-keys'] })
      setKeyToRevoke(null)
      toast.success('Key revoked')
    },
    onError: () => {
      toast.error('Failed to revoke key')
    },
  })

  const isRowPending = (id: string) =>
    revokeMutation.isPending && revokeMutation.variables === id

  const filteredKeys = (data?.keys ?? []).filter(key => {
    if (filterStatus === 'active') return !key.revoked_at
    if (filterStatus === 'revoked') return !!key.revoked_at
    return true
  })

  return (
    <PageLayout title="API Keys">
      {/* Hero */}
      <section className="pb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary mb-3">
              Access
            </p>
            <h1 className="text-[32px] leading-none font-semibold text-text-primary tracking-[-0.02em]">
              API Keys
            </h1>
            <p className="text-sm text-text-secondary mt-3">
              {(data?.keys ?? []).length} active {(data?.keys ?? []).length === 1 ? 'key' : 'keys'}
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_2px_8px_rgba(124,106,247,0.35)]">
                <Plus className="w-4 h-4 mr-2" />
                Create Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create API Key</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={keyName}
                    onChange={e => setKeyName(e.target.value)}
                    placeholder="My integration key"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={keyRole} onValueChange={setKeyRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="memory_manager">Memory Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Scopes (optional, comma-separated)</Label>
                  <Input
                    value={keyScopes}
                    onChange={e => setKeyScopes(e.target.value)}
                    placeholder="e.g., memories:read, users:write"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expires At (optional)</Label>
                  <Input
                    type="date"
                    value={keyExpiresAt}
                    onChange={e => setKeyExpiresAt(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || !keyName.trim()}
                >
                  {createMutation.isPending ? 'Creating…' : 'Create'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <div className="space-y-4">
        {/* Tabs bar */}
        <div className="card-surface p-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Label className="text-sm font-medium">Status:</Label>
            <div className="flex gap-1">
              {(['all', 'active', 'revoked'] as const).map(status => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Show plaintext key once */}
        <Dialog open={showKeyOpen} onOpenChange={setShowKeyOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save your API Key</DialogTitle>
            </DialogHeader>
            <div className="bg-warning-light text-warning-400 border border-warning-300 rounded px-3 py-2 text-sm flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <span>Save this key now — you won't see it again.</span>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex gap-2">
                <Input
                  type={showPlaintext ? 'text' : 'password'}
                  value={createdKey?.plaintext_key ?? ''}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setShowPlaintext(!showPlaintext)}
                  title={showPlaintext ? 'Hide key' : 'Show key'}
                >
                  {showPlaintext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    void navigator.clipboard.writeText(
                      createdKey?.plaintext_key ?? ''
                    )
                    toast.success('Copied to clipboard')
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="card-surface overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Prefix</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKeys.map(key => (
                  <TableRow key={key.id} className="hover:bg-surface-3 transition-colors">
                    <TableCell className="px-5 py-4 font-medium">{key.name}</TableCell>
                    <TableCell className="px-5 py-4 font-mono text-sm">
                      {key.key_prefix}…
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge className={cn('capitalize', ROLE_COLORS[key.role as keyof typeof ROLE_COLORS] || 'bg-surface-3 text-text-secondary')}>
                        {key.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-text-secondary">
                      {key.last_used_at ? formatDate(key.last_used_at) : '—'}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-text-secondary">
                      {key.expires_at ? formatDate(key.expires_at) : '—'}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className={cn('px-2 py-0.5 rounded text-xs font-semibold capitalize', key.revoked_at ? API_KEY_STATUS_COLORS.revoked : API_KEY_STATUS_COLORS.active)}>
                        {key.revoked_at ? 'Revoked' : 'Active'}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      {!key.revoked_at && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setKeyToRevoke(key)}
                          disabled={isRowPending(key.id)}
                          title="Revoke key"
                        >
                          <span className="text-danger-400">🗑️</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Revoke Key Confirmation */}
      <ConfirmDialog
        open={!!keyToRevoke}
        onOpenChange={(open) => !open && setKeyToRevoke(null)}
        title="Revoke API key?"
        description={`This will immediately invalidate the key "${keyToRevoke?.name}". This action cannot be undone.`}
        confirmLabel="Revoke"
        variant="danger"
        loading={revokeMutation.isPending}
        onConfirm={() => {
          if (keyToRevoke) {
            revokeMutation.mutate(keyToRevoke.id)
          }
        }}
      />
    </PageLayout>
  )
}
