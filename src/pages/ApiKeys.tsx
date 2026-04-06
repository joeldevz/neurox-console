import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Copy, Trash2 } from 'lucide-react'
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
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { ApiKeyCreated } from '@/types/api'

export default function ApiKeys() {
  const qc = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [createdKey, setCreatedKey] = useState<ApiKeyCreated | null>(null)
  const [showKeyOpen, setShowKeyOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => api.listApiKeys(),
  })

  const createMutation = useMutation({
    mutationFn: () => api.createApiKey({ name: keyName }),
    onSuccess: newKey => {
      void qc.invalidateQueries({ queryKey: ['api-keys'] })
      setCreatedKey(newKey)
      setCreateOpen(false)
      setKeyName('')
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
      toast.success('Key revoked')
    },
    onError: () => {
      toast.error('Failed to revoke key')
    },
  })

  return (
    <PageLayout title="API Keys" description="Manage programmatic access keys">
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
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

      {/* Show plaintext key once */}
      <Dialog open={showKeyOpen} onOpenChange={setShowKeyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save your API Key</DialogTitle>
          </DialogHeader>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            This key will only be shown once. Copy it now.
          </p>
          <div className="flex gap-2 mt-2">
            <Input
              value={createdKey?.plaintext_key ?? ''}
              readOnly
              className="font-mono text-xs"
            />
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
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div
          className="rounded-md border"
          style={{ borderColor: 'var(--border-default)' }}
        >
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
              {(data?.keys ?? []).map(key => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {key.key_prefix}…
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{key.role}</Badge>
                  </TableCell>
                  <TableCell style={{ color: 'var(--text-secondary)' }}>
                    {key.last_used_at ? formatDate(key.last_used_at) : '—'}
                  </TableCell>
                  <TableCell style={{ color: 'var(--text-secondary)' }}>
                    {key.expires_at ? formatDate(key.expires_at) : '—'}
                  </TableCell>
                  <TableCell>
                    {key.revoked_at ? (
                      <Badge variant="destructive">Revoked</Badge>
                    ) : (
                      <Badge
                        style={{
                          background: 'var(--color-success)',
                          color: 'var(--text-inverse)',
                        }}
                      >
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {!key.revoked_at && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => revokeMutation.mutate(key.id)}
                        disabled={revokeMutation.isPending}
                      >
                        <Trash2
                          className="w-4 h-4"
                          style={{ color: 'var(--color-danger)' }}
                        />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </PageLayout>
  )
}
