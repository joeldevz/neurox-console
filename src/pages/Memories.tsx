import { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Plus, Search, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { PageLayout } from '@/components/layout'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
} from '@/components/ui/dialog'
import { MemoriesEmptyState } from '@/components/memories/MemoriesEmptyState'
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

  if (error) {
    return (
      <PageLayout title="Memories" description="Browse and search all stored memories">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load memories: {error.message}
          </AlertDescription>
        </Alert>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Memories"
      description="Browse and search all stored memories"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48 max-w-sm">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              />
              <Input
                className="pl-9"
                placeholder="Search memories…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={namespaceFilter} onValueChange={setNamespaceFilter}>
              <SelectTrigger className="w-48">
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
            <Select value={visibility} onValueChange={(val) => setVisibility(val as typeof visibility)}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="personal">🔒 Personal</SelectItem>
                <SelectItem value="namespace">👥 Namespace</SelectItem>
                <SelectItem value="org">🌐 Org</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Button
              onClick={() => setCreateDialogOpen(true)}
              disabled={!isAdmin || !orgMemoryCapability.supported}
            >
              <Plus className="mr-2 h-4 w-4" />
              New shared memory
            </Button>
            <p className="text-xs text-muted-foreground">
              Organization memories are visible company-wide
            </p>
            {!isAdmin && (
              <p className="text-xs text-muted-foreground">
                Only admins and owners can create shared memories.
              </p>
            )}
            {isAdmin && !orgMemoryCapability.supported && orgMemoryCapability.reason && (
              <p className="text-xs text-muted-foreground">
                {orgMemoryCapability.reason}
              </p>
            )}
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : !hasMemories ? (
          <MemoriesEmptyState
            visibility={visibility === 'all' ? undefined : visibility}
            onCreate={() => setCreateDialogOpen(true)}
            disabled={!isAdmin || !orgMemoryCapability.supported}
            disabledReason={!isAdmin ? 'Only admins and owners can create shared memories.' : orgMemoryCapability.reason}
          />
        ) : (
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Namespace</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Importance</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memories.map(mem => (
                  <TableRow
                    key={mem.id}
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => setSelectedMemory(mem)}
                  >
                    <TableCell className="font-medium max-w-xs">
                      <span title={mem.title}>{truncate(mem.title, 50)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-mono">
                        {mem.namespace}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold', VISIBILITY_STYLES[mem.visibility].className)}>
                        <span aria-label={VISIBILITY_STYLES[mem.visibility].label}>
                          {VISIBILITY_STYLES[mem.visibility].icon}
                        </span>
                        {VISIBILITY_STYLES[mem.visibility].label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={KIND_COLORS[mem.kind]}>
                        {mem.kind}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-secondary">
                      {mem.observation_type}
                    </TableCell>
                    <TableCell className="text-secondary">
                      {mem.importance.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-secondary">
                      {formatDate(mem.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog
        open={selectedMemory !== null}
        onOpenChange={open => !open && setSelectedMemory(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMemory?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className="text-sm whitespace-pre-wrap font-mono p-4 rounded-md bg-muted text-secondary"
            >
              {selectedMemory?.content}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs font-mono">
                NS: {selectedMemory?.namespace}
              </Badge>
               {selectedMemory?.visibility && (
                 <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold', VISIBILITY_STYLES[selectedMemory.visibility as keyof typeof VISIBILITY_STYLES].className)}>
                   <span aria-label={VISIBILITY_STYLES[selectedMemory.visibility as keyof typeof VISIBILITY_STYLES].label}>
                     {VISIBILITY_STYLES[selectedMemory.visibility as keyof typeof VISIBILITY_STYLES].icon}
                   </span>
                   {VISIBILITY_STYLES[selectedMemory.visibility as keyof typeof VISIBILITY_STYLES].label}
                 </span>
               )}
               {selectedMemory?.kind && (
                 <Badge className={KIND_COLORS[selectedMemory.kind as Memory['kind']]}>
                   {selectedMemory.kind}
                 </Badge>
               )}
              {selectedMemory?.observation_type && (
                <Badge variant="secondary">
                  {selectedMemory.observation_type}
                </Badge>
              )}
            </div>
            {selectedMemory?.tags && selectedMemory.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedMemory.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            {selectedMemory?.files && selectedMemory.files.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Files:
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedMemory.files.map(file => (
                    <Badge
                      key={file}
                      variant="outline"
                      className="text-xs font-mono"
                    >
                      {file}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
             <div
               className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-border"
             >
               <div>
                 <span className="text-muted-foreground">Confidence: </span>
                 <span>{selectedMemory?.confidence?.toFixed?.(2) ?? 'N/A'}</span>
               </div>
              <div>
                <span className="text-muted-foreground">Importance: </span>
                <span>{selectedMemory?.importance.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Created: </span>
                <span>
                  {selectedMemory?.created_at
                    ? formatDate(selectedMemory.created_at)
                    : '—'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Updated: </span>
                <span>
                  {selectedMemory?.updated_at
                    ? formatDate(selectedMemory.updated_at)
                    : '—'}
                </span>
              </div>
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