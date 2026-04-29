import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Boxes, ChevronRight, ChevronDown, Plus, Pencil, AlertCircle } from 'lucide-react'
import { PageLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
          color: 'var(--color-ink)',
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
        <Boxes className="w-4 h-4 shrink-0" style={{ color: 'var(--color-accent)' }} />
        <span className="font-medium">{node.name}</span>
        <span className="tag tag-semantic text-xs">
          {node.node_type}
        </span>
        <span className="ml-auto text-xs font-mono" style={{ color: 'var(--color-ink-3)' }}>
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
        <div className="section">
          <div className="section-title">Organization</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, letterSpacing: '-0.02em', color: 'var(--color-ink)', marginBottom: 12 }}>
            Namespaces
          </h1>
          <p style={{ color: 'var(--color-ink-3)', fontSize: 14, marginBottom: 24 }}>
            {namespacesCount} {namespacesCount === 1 ? 'namespace' : 'namespaces'}
          </p>
          <Button
            onClick={handleOpenCreate}
            disabled={!isAdmin || !capabilities.namespaceCreate.supported}
            className="btn-primary"
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
        <div style={{ background: 'var(--color-paper-2)', padding: 12, borderRadius: 8 }}>
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
              <p className="text-xs" style={{ color: 'var(--color-ink-3)', marginBottom: 16 }}>
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
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Path</th>
                      <th>Type</th>
                      <th>Level</th>
                      <th>Created</th>
                      <th style={{ width: 96 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(listQuery.data?.namespaces ?? []).map(ns => (
                      <tr key={ns.id}>
                        <td style={{ paddingLeft: 20, paddingRight: 20, fontWeight: 500 }}>{ns.name}</td>
                        <td style={{ paddingLeft: 20, paddingRight: 20, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink-3)' }}>
                          {ns.path}
                        </td>
                        <td style={{ paddingLeft: 20, paddingRight: 20 }}>
                          <span className="tag tag-semantic">{ns.node_type}</span>
                        </td>
                        <td style={{ paddingLeft: 20, paddingRight: 20 }}>{ns.level}</td>
                        <td style={{ paddingLeft: 20, paddingRight: 20, color: 'var(--color-ink-3)' }}>
                          {formatDate(ns.created_at)}
                        </td>
                        <td style={{ paddingLeft: 20, paddingRight: 20 }}>
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tree">
            {createDisabledReason && (
              <p className="text-xs" style={{ color: 'var(--color-ink-3)', marginBottom: 16 }}>
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
              <div style={{ background: 'var(--color-paper-2)', padding: 8, borderRadius: 8 }}>
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
