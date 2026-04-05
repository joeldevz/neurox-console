import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { PageLayout } from '@/components/layout'
import { Input } from '@/components/ui/input'
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
import { api } from '@/lib/api'
import { formatDate, truncate } from '@/lib/utils'
import type { Memory } from '@/types/api'

const KIND_COLORS: Record<Memory['kind'], string> = {
  episodic: 'var(--color-info)',
  semantic: 'var(--color-success)',
  procedural: 'var(--color-warning)',
}

export default function Memories() {
  const [search, setSearch] = useState('')
  const [nsFilter, setNsFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['memories', search, nsFilter],
    queryFn: () =>
      api.listMemories({
        limit: 100,
        query: search || undefined,
        namespace: nsFilter || undefined,
      }),
    placeholderData: prev => prev,
  })

  return (
    <PageLayout
      title="Memories"
      description="Browse and search all stored memories"
    >
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--text-muted)' }}
          />
          <Input
            className="pl-9"
            placeholder="Search memories…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Input
          className="max-w-xs"
          placeholder="Filter by namespace…"
          value={nsFilter}
          onChange={e => setNsFilter(e.target.value)}
        />
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
                <TableHead>Title</TableHead>
                <TableHead>Namespace</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Importance</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.memories.map(mem => (
                <TableRow key={mem.id}>
                  <TableCell className="font-medium max-w-xs">
                    <span title={mem.title}>{truncate(mem.title, 50)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-mono">
                      {mem.namespace}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      style={{
                        background: KIND_COLORS[mem.kind],
                        color: 'white',
                      }}
                    >
                      {mem.kind}
                    </Badge>
                  </TableCell>
                  <TableCell style={{ color: 'var(--text-secondary)' }}>
                    {mem.observation_type}
                  </TableCell>
                  <TableCell style={{ color: 'var(--text-secondary)' }}>
                    {mem.importance.toFixed(2)}
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
    </PageLayout>
  )
}
