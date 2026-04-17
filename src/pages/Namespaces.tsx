import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Boxes, ChevronRight, ChevronDown, Plus, Pencil, AlertCircle } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/ConfirmDialog'
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
          paddingLeft: `${Math.min(depth, 6) * 16 + 12}px`,
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
        <Boxes className="w-4 h-4 shrink-0 text-brand-400" />
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
          className="w-4 h-4 shrink-0 ml-2"
          onClick={e => {
            e.stopPropagation()
            onEdit(node as Namespace)
          }}
        >
          <Pencil className="w-4 h-4" />
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
  const [editingNamespace, setEditingNamespace] = useState<Namespace | undefined>(undefined)
  const [deleteConfirm, setDeleteConfirm] = useState<Namespace | null>(null)

  const qc = useQueryClient()
  const { me } = useAuthContext()
  const capabilities = getAdminCapabilities()
  const isAdmin = me?.is_admin || me?.role === 'owner' || me?.role === 'admin'

  const listQuery = useQuery({
    queryKey: ['namespaces', 'list'],
    queryFn: () => api.listNamespaces(200, 0),
    enabled: view === 'list',
  })

  const treeQuery = useQuery({
    queryKey: ['namespaces', 'tree'],
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

  // Build parent options from list query data using path as value, excluding the namespace being edited
  const parentOptions = useMemo(() => {
    const all = listQuery.data?.namespaces ?? []
    const editingId = editingNamespace?.id
    if (!editingId) return all.map(ns => ({ label: `${ns.name} (${ns.path})`, value: ns.path }))
    return all
      .filter(ns => ns.id !== editingId)
      .map(ns => ({ label: `${ns.name} (${ns.path})`, value: ns.path }))
  }, [listQuery.data, editingNamespace])

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
    <PageLayout title="Namespaces">
      {/* Hero */}
      <section className="pb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary mb-3">
              Organization
            </p>
            <h1 className="text-[32px] leading-none font-semibold text-text-primary tracking-[-0.02em]">
              Namespaces
            </h1>
            <p className="text-sm text-text-secondary mt-3">
              {namespacesCount} {namespacesCount === 1 ? 'namespace' : 'namespaces'}
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            disabled={!isAdmin || !capabilities.namespaceCreate.supported}
            className="shrink-0 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_2px_8px_rgba(124,106,247,0.35)]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create namespace
          </Button>
        </div>
      </section>

      {currentError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load namespaces: {currentError.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {/* View tabs */}
        <div className="card-surface p-3 mb-3">
          <Tabs value={view} onValueChange={(v) => {
            setView(v as 'list' | 'tree')
            void qc.invalidateQueries({ queryKey: ['namespaces'] })
          }}>
            <TabsList>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="tree">Tree</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Tabs value={view} onValueChange={(v) => {
          setView(v as 'list' | 'tree')
          void qc.invalidateQueries({ queryKey: ['namespaces'] })
        }}>
          <TabsContent value="list">
            {createDisabledReason && (
              <p className="text-xs text-muted-foreground mb-4">
                {createDisabledReason}
              </p>
            )}
            {listQuery.isLoading ? (
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
              <div className="card-surface overflow-hidden">
                <Table>

                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
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
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(ns)}
                            disabled={!isAdmin || !capabilities.namespaceEdit.supported}
                            className="w-4 h-4"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tree">
            {createDisabledReason && (
              <p className="text-xs text-muted-foreground mb-4">
                {createDisabledReason}
              </p>
            )}
            {treeQuery.isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : treeQuery.error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Unable to display namespace tree. Please try again later.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="card-surface p-2">
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
            )}
          </TabsContent>
        </Tabs>
      </div>

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

      <ConfirmDialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete namespace?"
        description={`This action cannot be undone. The namespace "${deleteConfirm?.name}" will be deleted. Memories in this namespace will remain but become unlinked.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          // Note: deleteNamespace API method does not exist in src/lib/api.ts
          // This confirm dialog is prepared for future backend support
          setDeleteConfirm(null)
        }}
      />
    </PageLayout>
  )
}
