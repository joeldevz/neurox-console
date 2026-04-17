import { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Plus, Search, AlertCircle, Brain, X } from 'lucide-react'
import { toast } from 'sonner'
import { PageLayout } from '@/components/layout'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CreateMemoryDialog } from '@/components/memories/CreateMemoryDialog'
import { api } from '@/lib/api'
import { getAdminCapabilities } from '@/lib/adminCapabilities'
import { useAuthContext } from '@/context/auth'
import { formatDate, truncate, cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'
import { KIND_COLORS, VISIBILITY_STYLES } from '@/lib/constants'
import type { Memory } from '@/types/api'

export default function Memories() {
  const [search, setSearch] = useState('')
  const [namespaceFilter, setNamespaceFilter] = useState('all')
  const [visibility, setVisibility] = useState<'all' | 'personal' | 'namespace' | 'org'>('all')
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const { me } = useAuthContext()
  const isAdmin = me?.is_admin || me?.role === 'owner' || me?.role === 'admin'
  const queryClient = useQueryClient()

  const debouncedSearch = useDebounce(search, 300)

  const { data: namespacesData } = useQuery({
    queryKey: ['namespaces-for-filter'],
    queryFn: () => api.listNamespaces(100),
    staleTime: 60_000,
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['memories', { search: debouncedSearch, namespace: namespaceFilter, visibility }],
    queryFn: () =>
      api.listMemories({
        limit: 100,
        query: debouncedSearch || undefined,
        namespace: namespaceFilter === 'all' ? undefined : namespaceFilter,
        visibility: visibility === 'all' ? undefined : (visibility as 'personal' | 'namespace' | 'org'),
      }),
    placeholderData: prev => prev,
  })

  const memories = data?.memories ?? []
  const hasMemories = memories.length > 0

  const capabilities = getAdminCapabilities()
  const orgMemoryCapability = capabilities.orgMemoryCreate

  const namespaceOptions = namespacesData?.namespaces.map(ns => ({
    label: ns.name,
    value: ns.path,
  })) ?? [{ label: 'Default', value: 'default' }]

  const createMutation = useMutation({
    mutationFn: (input: Parameters<typeof api.createMemory>[0]) => api.createMemory(input),
    onSuccess: () => {
      toast.success('Memory created successfully')
      queryClient.invalidateQueries({ queryKey: ['memories'] })
      setCreateDialogOpen(false)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create memory')
    },
  })

  const handleCreateMemory = async (input: Parameters<typeof api.createMemory>[0]): Promise<void> => {
    await createMutation.mutateAsync(input)
  }

  return (
    <PageLayout title="Memories">
      {/* Hero */}
      <section className="pt-2 pb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary mb-3">
              Knowledge base
            </p>
            <h1 className="text-[32px] leading-none font-semibold text-text-primary tracking-[-0.02em]">
              Memories
            </h1>
            <p className="text-sm text-text-secondary mt-3">
              {data
                ? `${memories.length} ${memories.length === 1 ? 'result' : 'results'} across your organization.`
                : 'Browse and search stored memories.'}
            </p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            disabled={!isAdmin || !orgMemoryCapability.supported}
            className="shrink-0 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_2px_8px_rgba(124,106,247,0.35)]"
          >
            <Plus className="w-4 h-4" />
            New shared memory
          </Button>
        </div>
      </section>

      {/* Error state */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load memories: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Filter bar — card with visible elevation */}
      <div className="card-surface mb-3 p-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none z-10" />
            <input
              type="text"
              className="w-full h-10 pl-9 pr-8 rounded-lg bg-surface-3 ring-1 ring-border-default text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-brand-400 focus:ring-2 transition-shadow"
              placeholder="Search memories…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-4 z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Namespace filter */}
          <Select value={namespaceFilter} onValueChange={setNamespaceFilter}>
            <SelectTrigger className="w-48 h-10 bg-surface-3 ring-1 ring-border-default border-0 text-text-primary hover:bg-surface-4 transition-colors">
              <SelectValue placeholder="All namespaces" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All namespaces</SelectItem>
              {namespacesData?.namespaces.map(ns => (
                <SelectItem key={ns.path} value={ns.path}>
                  {ns.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Visibility filter */}
          <Select value={visibility} onValueChange={(val) => setVisibility(val as typeof visibility)}>
            <SelectTrigger className="w-40 h-10 bg-surface-3 ring-1 ring-border-default border-0 text-text-primary hover:bg-surface-4 transition-colors">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All visibility</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="namespace">Namespace</SelectItem>
              <SelectItem value="org">Organization</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!isAdmin && (
          <p className="text-xs text-text-tertiary mt-2">
            Only admins and owners can create shared memories.
          </p>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="card-surface p-6">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full bg-surface-3" />
            ))}
          </div>
        </div>
      ) : !hasMemories ? (
        <EmptyState onCreate={() => setCreateDialogOpen(true)} disabled={!isAdmin || !orgMemoryCapability.supported} />
      ) : (
        <section className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <Th>Title</Th>
                  <Th>Namespace</Th>
                  <Th>Visibility</Th>
                  <Th>Kind</Th>
                  <Th>Type</Th>
                  <Th align="right">Importance</Th>
                  <Th align="right">Created</Th>
                </tr>
              </thead>
              <tbody>
                {memories.map(mem => (
                  <tr
                    key={mem.id}
                    onClick={() => setSelectedMemory(mem)}
                    className="cursor-pointer transition-colors hover:bg-surface-3"
                  >
                    <Td>
                      <span className="font-medium text-text-primary" title={mem.title}>
                        {truncate(mem.title, 50)}
                      </span>
                    </Td>
                    <Td>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-4 text-text-secondary text-xs font-mono">
                        {mem.namespace}
                      </span>
                    </Td>
                    <Td>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold',
                          VISIBILITY_STYLES[mem.visibility].className
                        )}
                      >
                        <span aria-label={VISIBILITY_STYLES[mem.visibility].label}>
                          {VISIBILITY_STYLES[mem.visibility].icon}
                        </span>
                        {VISIBILITY_STYLES[mem.visibility].label}
                      </span>
                    </Td>
                    <Td>
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold',
                          KIND_COLORS[mem.kind]
                        )}
                      >
                        {mem.kind}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-text-secondary text-xs">
                        {mem.observation_type}
                      </span>
                    </Td>
                    <Td align="right">
                      <span className="text-text-secondary font-mono text-xs">
                        {mem.importance.toFixed(2)}
                      </span>
                    </Td>
                    <Td align="right">
                      <span className="text-text-tertiary text-xs">
                        {formatDate(mem.created_at)}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Memory detail dialog */}
      <Dialog
        open={selectedMemory !== null}
        onOpenChange={open => !open && setSelectedMemory(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-surface-2 border-border-default">
          <DialogHeader>
            <DialogTitle className="text-text-primary">{selectedMemory?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm whitespace-pre-wrap font-mono p-4 rounded-md bg-surface-3 text-text-primary border border-border-subtle">
              {selectedMemory?.content}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-3 text-text-secondary text-xs font-mono border border-border-subtle">
                NS: {selectedMemory?.namespace}
              </span>
              {selectedMemory?.visibility && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold',
                    VISIBILITY_STYLES[selectedMemory.visibility as keyof typeof VISIBILITY_STYLES].className
                  )}
                >
                  <span aria-label={VISIBILITY_STYLES[selectedMemory.visibility as keyof typeof VISIBILITY_STYLES].label}>
                    {VISIBILITY_STYLES[selectedMemory.visibility as keyof typeof VISIBILITY_STYLES].icon}
                  </span>
                  {VISIBILITY_STYLES[selectedMemory.visibility as keyof typeof VISIBILITY_STYLES].label}
                </span>
              )}
              {selectedMemory?.kind && (
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold',
                    KIND_COLORS[selectedMemory.kind as Memory['kind']]
                  )}
                >
                  {selectedMemory.kind}
                </span>
              )}
              {selectedMemory?.observation_type && (
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-3 text-text-secondary text-xs border border-border-subtle">
                  {selectedMemory.observation_type}
                </span>
              )}
            </div>
            {selectedMemory?.tags && selectedMemory.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedMemory.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded bg-surface-3 text-text-tertiary text-xs border border-border-subtle">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-border-default">
              <MetaRow label="Confidence" value={selectedMemory?.confidence?.toFixed?.(2) ?? 'N/A'} />
              <MetaRow label="Importance" value={selectedMemory?.importance.toFixed(2) ?? '—'} />
              <MetaRow label="Created" value={selectedMemory?.created_at ? formatDate(selectedMemory.created_at) : '—'} />
              <MetaRow label="Updated" value={selectedMemory?.updated_at ? formatDate(selectedMemory.updated_at) : '—'} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CreateMemoryDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        defaultVisibility="org"
        namespaceOptions={namespaceOptions}
        onSubmit={handleCreateMemory}
      />
    </PageLayout>
  )
}

function Th({
  children,
  align = 'left',
}: {
  children: React.ReactNode
  align?: 'left' | 'right'
}) {
  return (
    <th
      className={cn(
        'px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-tertiary whitespace-nowrap',
        align === 'right' ? 'text-right' : 'text-left'
      )}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  align = 'left',
}: {
  children: React.ReactNode
  align?: 'left' | 'right'
}) {
  return (
    <td
      className={cn(
        'px-5 py-3.5 align-middle',
        align === 'right' ? 'text-right' : 'text-left'
      )}
    >
      {children}
    </td>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-text-tertiary mb-1">{label}</p>
      <p className="text-sm text-text-primary font-medium">{value}</p>
    </div>
  )
}

function EmptyState({ onCreate, disabled }: { onCreate: () => void; disabled: boolean }) {
  return (
    <section className="card-surface p-12 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-surface-3 flex items-center justify-center">
        <Brain className="w-6 h-6 text-text-tertiary" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-2">No memories found</h3>
      <p className="text-sm text-text-secondary max-w-sm mx-auto mb-6">
        Try adjusting your search or filters, or create the first shared memory.
      </p>
      <Button onClick={onCreate} disabled={disabled}>
        <Plus className="w-4 h-4" />
        New shared memory
      </Button>
    </section>
  )
}
