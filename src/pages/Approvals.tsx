import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle, XCircle } from 'lucide-react'
import { PageLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
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
import { formatDate } from '@/lib/utils'

export default function Approvals() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['approvals', 'pending'],
    queryFn: () => api.listApprovals('pending', 100),
    refetchInterval: 15_000,
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.approveApproval(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['approvals'] })
      toast.success('Approved')
    },
    onError: () => {
      toast.error('Failed to approve')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.rejectApproval(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['approvals'] })
      toast.success('Rejected')
    },
    onError: () => {
      toast.error('Failed to reject')
    },
  })

  return (
    <PageLayout
      title="Approvals"
      description="Review and process pending memory promotion approvals"
    >
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (data?.approvals ?? []).length === 0 ? (
        <div
          className="text-center py-16"
          style={{ color: 'var(--text-muted)' }}
        >
          <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No pending approvals. All clear!</p>
        </div>
      ) : (
        <div
          className="rounded-md border"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Memory ID</TableHead>
                <TableHead>Source NS</TableHead>
                <TableHead>Target NS</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.approvals ?? []).map(appr => (
                <TableRow key={appr.id}>
                  <TableCell className="font-mono text-xs">
                    {appr.memory_id.slice(0, 12)}…
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-mono">
                      {appr.source_ns}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-mono">
                      {appr.target_ns}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      style={{
                        color:
                          appr.score > 0.7
                            ? 'var(--color-success)'
                            : 'var(--color-warning)',
                      }}
                    >
                      {appr.score.toFixed(3)}
                    </span>
                  </TableCell>
                  <TableCell style={{ color: 'var(--text-secondary)' }}>
                    {formatDate(appr.requested_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => approveMutation.mutate(appr.id)}
                        disabled={approveMutation.isPending}
                        title="Approve"
                      >
                        <CheckCircle
                          className="w-4 h-4"
                          style={{ color: 'var(--color-success)' }}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => rejectMutation.mutate(appr.id)}
                        disabled={rejectMutation.isPending}
                        title="Reject"
                      >
                        <XCircle
                          className="w-4 h-4"
                          style={{ color: 'var(--color-danger)' }}
                        />
                      </Button>
                    </div>
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
