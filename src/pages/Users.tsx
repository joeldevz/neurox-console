import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'
import { PageLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { User } from '@/types/api'

const ROLE_COLORS: Record<User['role'], string> = {
  owner: 'var(--brand-500)',
  admin: 'var(--color-info)',
  memory_manager: 'var(--color-success)',
  member: 'var(--text-muted)',
}

const STATUS_COLORS: Record<User['status'], string> = {
  active: 'var(--color-success)',
  invited: 'var(--color-warning)',
  suspended: 'var(--color-danger)',
  deleted: 'var(--text-muted)',
}

export default function Users() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<User['role']>('member')
  const [passwordUserId, setPasswordUserId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.listUsers(100, 0),
  })

  const createMutation = useMutation({
    mutationFn: () => api.createUser({ email, role }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users'] })
      setOpen(false)
      setEmail('')
      setRole('member')
      toast.success('User created')
    },
    onError: () => {
      toast.error('Failed to create user')
    },
  })

  const patchMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      api.patchUser(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User updated')
    },
    onError: () => {
      toast.error('Failed to update user')
    },
  })

  const passwordMutation = useMutation({
    mutationFn: ({ userId, password }: { userId: string; password: string }) =>
      api.setUserPassword(userId, password),
    onSuccess: () => {
      setPasswordUserId(null)
      setNewPassword('')
      toast.success('Password set successfully')
    },
    onError: () => {
      toast.error('Failed to set password')
    },
  })

  return (
    <PageLayout title="Users" description="Manage organization members">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={role}
                  onValueChange={v => setRole(v as User['role'])}
                >
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
              <Button
                className="w-full"
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !email.trim()}
              >
                {createMutation.isPending ? 'Creating…' : 'Create User'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.users ?? []).map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      style={{
                        background: ROLE_COLORS[user.role],
                        color: 'white',
                      }}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: STATUS_COLORS[user.status],
                        color: STATUS_COLORS[user.status],
                      }}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell style={{ color: 'var(--text-secondary)' }}>
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          ···
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            patchMutation.mutate({
                              id: user.id,
                              data: { role: 'admin' },
                            })
                          }
                        >
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            patchMutation.mutate({
                              id: user.id,
                              data: { status: 'suspended' },
                            })
                          }
                        >
                          Suspend
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setPasswordUserId(user.id)
                            setNewPassword('')
                          }}
                        >
                          Set Password
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Set Password Dialog */}
      <Dialog open={passwordUserId !== null} onOpenChange={open => { if (!open) setPasswordUserId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                autoFocus
              />
            </div>
            <Button
              className="w-full"
              disabled={passwordMutation.isPending || newPassword.length < 8}
              onClick={() => {
                if (passwordUserId) {
                  passwordMutation.mutate({ userId: passwordUserId, password: newPassword })
                }
              }}
            >
              {passwordMutation.isPending ? 'Saving…' : 'Set Password'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}
