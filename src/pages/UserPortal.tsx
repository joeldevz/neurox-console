import { useQuery } from '@tanstack/react-query'
import { Brain, FolderTree, User } from 'lucide-react'
import { PageLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { api } from '@/lib/api'
import { formatDate, truncate } from '@/lib/utils'

const KIND_COLORS: Record<string, string> = {
  episodic: 'var(--color-info)',
  semantic: 'var(--color-success)',
  procedural: 'var(--color-warning)',
}

const VISIBILITY_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  personal: { bg: 'var(--bg-muted)', color: 'var(--text-secondary)', label: '🔒 Personal' },
  namespace: { bg: 'var(--color-info)', color: 'white', label: '👥 Namespace' },
  org: { bg: 'var(--color-success)', color: 'white', label: '🌐 Org' },
}

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
    <PageLayout title="My Portal" description="Your memories — personal ones plus shared namespace and org memories">

      {/* Profile */}
      <Card className="max-w-sm">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <User className="w-5 h-5" style={{ color: 'var(--brand-500)' }} />
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {profileLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {profile?.email}
              </p>
              {profile?.name && (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {profile.name}
                </p>
              )}
              <div className="flex gap-2">
                <Badge>{profile?.role}</Badge>
                <Badge variant="outline">{profile?.status}</Badge>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Member since {profile ? formatDate(profile.created_at) : '—'}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* My Namespaces */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FolderTree className="w-4 h-4" style={{ color: 'var(--brand-500)' }} />
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            My Namespaces ({namespaces?.count ?? 0})
          </h2>
        </div>
        {nsLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : namespaces?.namespaces.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No namespaces assigned yet.
          </p>
        ) : (
          <div className="rounded-md border" style={{ borderColor: 'var(--border-default)' }}>
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
                    <TableCell className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
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
      </div>

      {/* My Memories */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4" style={{ color: 'var(--brand-500)' }} />
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            My Memories ({memories?.count ?? 0})
          </h2>
        </div>
        {memoriesLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : memories?.memories.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No memories recorded yet.
          </p>
        ) : (
          <div className="rounded-md border" style={{ borderColor: 'var(--border-default)' }}>
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
                      <Badge
                        style={{
                          background: VISIBILITY_STYLES[mem.visibility]?.bg ?? 'var(--bg-muted)',
                          color: VISIBILITY_STYLES[mem.visibility]?.color ?? 'var(--text-secondary)',
                        }}
                      >
                        {VISIBILITY_STYLES[mem.visibility]?.label ?? mem.visibility}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge style={{ background: KIND_COLORS[mem.kind] ?? 'var(--text-muted)', color: 'white' }}>
                        {mem.kind}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(mem.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
