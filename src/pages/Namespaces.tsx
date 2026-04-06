'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { FolderTree, ChevronRight, ChevronDown, Plus, Pencil, AlertCircle } from 'lucide-react'
import { PageLayout } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { getAdminCapabilities } from '@/lib/adminCapabilities'
import { useAuthContext } from '@/context/auth'
import { NamespaceFormDialog } from '@/components/namespaces/NamespaceFormDialog'
import { NamespaceEmptyState } from '@/components/namespaces/NamespaceEmptyState'
import type { Namespace, NamespaceTreeNode } from '@/types/api'

function TreeNode({
  node,
  depth = 0,
  onEdit,
}: {
  node: NamespaceTreeNode
  depth?: number
  onEdit: (ns: Namespace) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children.length > 0

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 rounded-md text-sm hover:opacity-80 cursor-pointer px-3"
        style={{
          paddingLeft: `${depth * 16 + 12}px`,
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
          className="w-4 h-4 shrink-0 text-brand"
          style={{ color: 'var(--brand-400)' }}
        />
        <span className="font-medium">{node.name}</span>
        <Badge variant="outline" className="text-xs">
          {node.node_type}
        </Badge>
        <span className="ml-auto text-xs font-mono text-muted-foreground">
          {node.path}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 ml-2"
          onClick={e => {
            e.stopPropagation()
            onEdit(node as Namespace)
          }}
        >
          <Pencil className="w-3 h-3" />
        </Button>
      </div>
      {expanded &&
        hasChildren &&
        node.children.map(child => (
          <TreeNode key={child.id} node={child} depth={depth + 1} onEdit={onEdit} />
        ))}
    </div>
  )
}

export default function Namespaces() {
  const [view, setView] = useState<'list' | 'tree'>('list')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [editingNamespace, setEditingNamespace] = useState<Namespace | undefined>(
    undefined
  )

  const qc = useQueryClient()
  const { me } = useAuthContext()
  const capabilities = getAdminCapabilities()
  const isAdmin = me?.is_admin || me?.role === 'owner' || me?.role === 'admin'

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

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string
      parent_path?: string
      node_type: 'team' | 'department' | 'project'
    }) => api.createNamespace(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['namespaces'] })
      void qc.invalidateQueries({ queryKey: ['namespaces-tree'] })
      setDialogOpen(false)
      toast.success('Namespace created')
    },
    onError: () => {
      toast.error('Failed to create namespace')
    },
  })

  const editMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: {
        name: string
        parent_path?: string
        node_type: 'team' | 'department' | 'project'
      }
    }) => api.patchNamespace(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['namespaces'] })
      void qc.invalidateQueries({ queryKey: ['namespaces-tree'] })
      setDialogOpen(false)
      setEditingNamespace(undefined)
      toast.success('Namespace updated')
    },
    onError: () => {
      toast.error('Failed to update namespace')
    },
  })

  const handleOpenCreate = () => {
    setDialogMode('create')
    setEditingNamespace(undefined)
    setDialogOpen(true)
  }

  const handleOpenEdit = (ns: Namespace) => {
    setDialogMode('edit')
    setEditingNamespace(ns)
    setDialogOpen(true)
  }

  const handleSubmit = async (input: {
    name: string
    parent_path?: string
    node_type: 'team' | 'department' | 'project'
  }) => {
    if (dialogMode === 'create') {
      await createMutation.mutateAsync(input)
    } else if (editingNamespace) {
      await editMutation.mutateAsync({ id: editingNamespace.id, data: input })
    }
  }

  // Build parent options from list query data using path as value
  const parentOptions =
    listQuery.data?.namespaces.map(ns => ({
      label: `${ns.name} (${ns.path})`,
      value: ns.path,
    })) ?? []

  const namespacesCount = listQuery.data?.namespaces.length ?? 0
  const hasNamespaces = namespacesCount > 0

  const createDisabledReason = !isAdmin
    ? 'Only admins and owners can create namespaces.'
    : !capabilities.namespaceCreate.supported
      ? capabilities.namespaceCreate.reason
      : undefined

  // Determine which error to show based on current view
  const currentError = view === 'list' ? listQuery.error : treeQuery.error

  return (
    <PageLayout
      title="Namespaces"
      description="Browse and manage memory namespaces"
    >
      {currentError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load namespaces: {currentError.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
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
        <Button
          onClick={handleOpenCreate}
          disabled={!isAdmin || !capabilities.namespaceCreate.supported}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create namespace
        </Button>
      </div>

      {createDisabledReason && (
        <p className="text-xs text-right text-muted-foreground">
          {createDisabledReason}
        </p>
      )}

      {view === 'list' &&
        (listQuery.isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : listQuery.error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to display namespace list. Please try again later.
            </AlertDescription>
          </Alert>
        ) : !hasNamespaces ? (
          <NamespaceEmptyState
            onCreate={handleOpenCreate}
            disabled={!isAdmin || !capabilities.namespaceCreate.supported}
            disabledReason={createDisabledReason}
          />
        ) : (
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(listQuery.data?.namespaces ?? []).map(ns => (
                  <TableRow key={ns.id}>
                    <TableCell className="font-medium">{ns.name}</TableCell>
                    <TableCell className="font-mono text-xs text-secondary">
                      {ns.path}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ns.node_type}</Badge>
                    </TableCell>
                    <TableCell>{ns.level}</TableCell>
                    <TableCell className="text-secondary">
                      {formatDate(ns.created_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(ns)}
                        disabled={!isAdmin || !capabilities.namespaceEdit.supported}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
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
        ) : treeQuery.error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to display namespace tree. Please try again later.
            </AlertDescription>
          </Alert>
        ) : (
          <div
            className="rounded-md border p-2"
            style={{
              borderColor: 'var(--border-default)',
              background: 'var(--bg-card)',
            }}
          >
            {treeQuery.data?.tree.map(node => (
              <TreeNode key={node.id} node={node} onEdit={handleOpenEdit} />
            ))}
            {!treeQuery.data?.tree.length && (
              <NamespaceEmptyState
                onCreate={handleOpenCreate}
                disabled={!capabilities.namespaceCreate.supported}
                disabledReason={createDisabledReason}
              />
            )}
          </div>
        ))}

      <NamespaceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        initialNamespace={editingNamespace}
        parentOptions={parentOptions}
        onSubmit={handleSubmit}
        disabledReason={
          dialogMode === 'create'
            ? createDisabledReason
            : capabilities.namespaceEdit.supported
              ? undefined
              : capabilities.namespaceEdit.reason
        }
      />
    </PageLayout>
  )
}
