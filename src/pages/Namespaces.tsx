import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FolderTree, ChevronRight, ChevronDown } from 'lucide-react'
import { PageLayout } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { formatDate } from '@/lib/utils'
import type { NamespaceTreeNode } from '@/types/api'

function TreeNode({
  node,
  depth = 0,
}: {
  node: NamespaceTreeNode
  depth?: number
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children.length > 0

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 rounded-md text-sm hover:opacity-80 cursor-pointer"
        style={{
          paddingLeft: `${depth * 16 + 12}px`,
          paddingRight: '12px',
          color: 'var(--text-primary)',
        }}
        onClick={() => setExpanded(e => !e)}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="w-3 h-3 shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 shrink-0" />
          )
        ) : (
          <span className="w-3 h-3 shrink-0" />
        )}
        <FolderTree
          className="w-4 h-4 shrink-0"
          style={{ color: 'var(--brand-400)' }}
        />
        <span className="font-medium">{node.name}</span>
        <Badge variant="outline" className="text-xs">
          {node.node_type}
        </Badge>
        <span
          className="ml-auto text-xs font-mono"
          style={{ color: 'var(--text-muted)' }}
        >
          {node.path}
        </span>
      </div>
      {expanded &&
        hasChildren &&
        node.children.map(child => (
          <TreeNode key={child.id} node={child} depth={depth + 1} />
        ))}
    </div>
  )
}

export default function Namespaces() {
  const [view, setView] = useState<'list' | 'tree'>('list')

  const listQuery = useQuery({
    queryKey: ['namespaces'],
    queryFn: () => api.listNamespaces(200, 0),
    enabled: view === 'list',
  })

  const treeQuery = useQuery({
    queryKey: ['namespaces-tree'],
    queryFn: () => api.getNamespaceTree(),
    enabled: view === 'tree',
  })

  return (
    <PageLayout
      title="Namespaces"
      description="Browse and manage memory namespaces"
    >
      <div className="flex gap-2">
        <Button
          variant={view === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('list')}
        >
          List
        </Button>
        <Button
          variant={view === 'tree' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('tree')}
        >
          Tree
        </Button>
      </div>

      {view === 'list' &&
        (listQuery.isLoading ? (
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
                  <TableHead>Path</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(listQuery.data?.namespaces ?? []).map(ns => (
                  <TableRow key={ns.id}>
                    <TableCell className="font-medium">{ns.name}</TableCell>
                    <TableCell
                      className="font-mono text-xs"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {ns.path}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ns.node_type}</Badge>
                    </TableCell>
                    <TableCell>{ns.level}</TableCell>
                    <TableCell style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(ns.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}

      {view === 'tree' &&
        (treeQuery.isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div
            className="rounded-md border p-2"
            style={{
              borderColor: 'var(--border-default)',
              background: 'var(--bg-card)',
            }}
          >
            {treeQuery.data?.tree.map(node => (
              <TreeNode key={node.id} node={node} />
            ))}
          </div>
        ))}
    </PageLayout>
  )
}
