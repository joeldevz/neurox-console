import { useQuery } from '@tanstack/react-query'
import { PageLayout } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { api } from '@/lib/api'
import { formatDate, truncate, cn } from '@/lib/utils'
import { KIND_COLORS, VISIBILITY_STYLES, ROLE_COLORS } from '@/lib/constants'

export default function UserPortal() {
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-me'],
    queryFn: () => api.userMe(),
  })

  const { data: memories, isLoading: memoriesLoading } = useQuery({
    queryKey: ['user-memories'],
    queryFn: () => api.userMemories({ limit: 50 }),
  })

  const { data: namespaces, isLoading: nsLoading } = useQuery({
    queryKey: ['user-namespaces'],
    queryFn: () => api.userNamespaces(),
  })

  return (
    <PageLayout title="My Portal">
      {/* Page header */}
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">My Portal</h1>
        <p className="text-sm text-text-secondary mt-1">Your profile and personal memories.</p>
      </section>

      {/* Profile card */}
      <section className="mb-8">
        <div className="bg-surface-2 border border-border-subtle rounded-lg p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-surface-3 flex items-center justify-center text-text-primary text-lg font-semibold">
            {profileLoading ? (
              <Skeleton className="w-14 h-14 rounded-full" />
            ) : (
              profile?.email?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            {profileLoading ? (
              <>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <p className="text-base font-semibold text-text-primary truncate">{profile?.email}</p>
                {profile?.name && <p className="text-sm text-text-secondary">{profile.name}</p>}
                <div className="mt-2 flex items-center gap-2">
                  <span className={cn('px-2 py-0.5 rounded text-xs font-semibold capitalize', ROLE_COLORS[profile?.role as keyof typeof ROLE_COLORS ?? 'member'])}>
                    {(profile?.role ?? 'member').replace('_', ' ')}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* TODO: Enable profile editing when backend PATCH /api/user/me is ready */}

      {/* My Namespaces */}
      <section className="mb-8">
        <h2 className="text-xs uppercase tracking-widest text-text-tertiary mb-3">My namespaces</h2>
        {nsLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : namespaces?.namespaces.length === 0 ? (
          <p className="text-sm text-text-secondary">
            No namespaces assigned yet.
          </p>
        ) : (
          <div className="rounded-md border border-border-subtle">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {namespaces?.namespaces.map(ns => (
                  <TableRow key={ns.id}>
                    <TableCell className="font-medium">{ns.name}</TableCell>
                    <TableCell className="font-mono text-xs text-text-secondary">
                      {ns.path}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ns.node_type}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* My Memories */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-text-tertiary mb-3">My memories</h2>
        {memoriesLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : memories?.memories.length === 0 ? (
          <p className="text-sm text-text-secondary">
            No memories recorded yet.
          </p>
        ) : (
          <div className="rounded-md border border-border-subtle">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Namespace</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memories?.memories.map(mem => (
                  <TableRow key={mem.id}>
                    <TableCell className="font-medium">
                      {truncate(mem.title, 50)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-mono">
                        {mem.namespace}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={VISIBILITY_STYLES[mem.visibility as keyof typeof VISIBILITY_STYLES]?.className || 'bg-surface-3 text-text-secondary'}>
                        {VISIBILITY_STYLES[mem.visibility as keyof typeof VISIBILITY_STYLES]?.label ?? mem.visibility}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={KIND_COLORS[mem.kind as keyof typeof KIND_COLORS] || 'bg-surface-3 text-text-secondary'}>
                        {mem.kind}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {formatDate(mem.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </PageLayout>
  )
}
