import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { UserPlus, MoreHorizontal, Search } from 'lucide-react'
import { PageLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
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
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { api } from '@/lib/api'
import { formatDate, cn } from '@/lib/utils'
import { ROLE_COLORS, STATUS_COLORS } from '@/lib/constants'
import type { User } from '@/types/api'

export default function Users() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<User['role']>('member')
  const [passwordUserId, setPasswordUserId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [userToSuspend, setUserToSuspend] = useState<User | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.listUsers(100, 0),
  })

  const users = data?.users
  const filteredUsers = useMemo(() => {
    if (!users) return []
    const q = searchQuery.toLowerCase()
    return users
      .filter(user =>
        user.email.toLowerCase().includes(q) ||
        (user.name && user.name.toLowerCase().includes(q))
      )
      .sort((a, b) => a.email.localeCompare(b.email))
  }, [users, searchQuery])

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
      setUserToSuspend(null)
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

  const isRowPending = (id: string) =>
    (patchMutation.isPending && patchMutation.variables?.id === id) ||
    (passwordMutation.isPending && passwordMutation.variables?.userId === id)

  const handleRoleChange = (userId: string, newRole: User['role']) => {
    patchMutation.mutate({ id: userId, data: { role: newRole } })
  }

  const handleActivate = (userId: string) => {
    patchMutation.mutate({ id: userId, data: { status: 'active' } })
  }

  const handleSuspendConfirmed = () => {
    if (userToSuspend) {
      patchMutation.mutate({ id: userToSuspend.id, data: { status: 'suspended' } })
    }
  }

  return (
    <PageLayout title="Users">
      {/* Hero */}
      <section className="pb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary mb-3">
              Team
            </p>
            <h1 className="text-[32px] leading-none font-semibold text-text-primary tracking-[-0.02em]">
              Users
            </h1>
            <p className="text-sm text-text-secondary mt-3">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'member' : 'members'} in your organization.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_2px_8px_rgba(124,106,247,0.35)]">
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
      </section>

      <div className="space-y-4">
        {/* Filter bar */}
        <div className="card-surface p-3 mb-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none z-10" />
            <input
              type="text"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-3 ring-1 ring-border-default text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-brand-400 focus:ring-2 transition-shadow"
              placeholder="Search by email or name…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="card-surface overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email / Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user.id} className="hover:bg-surface-3 transition-colors">
                    <TableCell className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{user.email}</p>
                        {user.name && <p className="text-xs text-text-tertiary">{user.name}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={cn(
                              'px-2 py-0.5 rounded text-xs font-semibold capitalize cursor-pointer hover:opacity-80 transition-opacity',
                              ROLE_COLORS[user.role]
                            )}
                            disabled={isRowPending(user.id)}
                          >
                            {user.role.replace('_', ' ')}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, 'member')}
                            disabled={isRowPending(user.id)}
                          >
                            Make Member
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, 'memory_manager')}
                            disabled={isRowPending(user.id)}
                          >
                            Make Memory Manager
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, 'admin')}
                            disabled={isRowPending(user.id)}
                          >
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, 'owner')}
                            disabled={isRowPending(user.id)}
                          >
                            Make Owner
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className={cn('px-2 py-0.5 rounded text-xs font-semibold capitalize', STATUS_COLORS[user.status])}>
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-text-secondary">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isRowPending(user.id)}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.status === 'suspended' ? (
                            <DropdownMenuItem
                              onClick={() => handleActivate(user.id)}
                              disabled={isRowPending(user.id)}
                            >
                              Activate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => setUserToSuspend(user)}
                              disabled={isRowPending(user.id)}
                            >
                              Suspend
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setPasswordUserId(user.id)
                              setNewPassword('')
                            }}
                            disabled={isRowPending(user.id)}
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

      {/* Suspend User Confirmation */}
      <ConfirmDialog
        open={!!userToSuspend}
        onOpenChange={(open) => !open && setUserToSuspend(null)}
        title="Suspend user?"
        description={`This will revoke active sessions for ${userToSuspend?.email}. They can be reactivated later.`}
        confirmLabel="Suspend"
        variant="danger"
        loading={patchMutation.isPending}
        onConfirm={handleSuspendConfirmed}
      />
      </div>
    </PageLayout>
  )
}
