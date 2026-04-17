import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { PageLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { APPROVAL_STATUS_COLORS } from '@/lib/constants'
import type { Approval } from '@/types/api'

export default function Approvals() {
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [actionState, setActionState] = useState<{
    approval: Approval
    action: 'approve' | 'reject'
  } | null>(null)
  const [comments, setComments] = useState('')
  const [rejectConfirm, setRejectConfirm] = useState(false)

  const qc = useQueryClient()

  const approvalsQuery = useQuery({
    queryKey: ['approvals', tab],
    queryFn: () => api.listApprovals(tab, 100),
    refetchInterval: tab === 'pending' ? 15_000 : false,
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      api.approveApproval(id, comments),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['approvals'] })
      toast.success('Approved')
      setActionState(null)
      setComments('')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to approve')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      api.rejectApproval(id, comments),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['approvals'] })
      toast.success('Rejected')
      setActionState(null)
      setComments('')
      setRejectConfirm(false)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to reject')
    },
  })

  const handleApprove = (approval: Approval) => {
    setActionState({ approval, action: 'approve' })
  }

  const handleReject = (approval: Approval) => {
    setActionState({ approval, action: 'reject' })
    setRejectConfirm(true)
  }

  const submitAction = () => {
    if (!actionState) return
    const { approval, action } = actionState
    if (action === 'approve') {
      approveMutation.mutate({ id: approval.id, comments: comments || undefined })
    } else {
      rejectMutation.mutate({ id: approval.id, comments: comments || undefined })
    }
  }

  return (
    <PageLayout
      title="Approvals"
      description="Review and process pending memory promotion approvals"
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {approvalsQuery.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : approvalsQuery.error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load approvals: {approvalsQuery.error.message}
              </AlertDescription>
            </Alert>
          ) : (approvalsQuery.data?.approvals ?? []).length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                {tab === 'pending'
                  ? 'No pending approvals. All clear!'
                  : `No ${tab} approvals.`}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Memory ID</TableHead>
                    <TableHead>Source NS</TableHead>
                    <TableHead>Target NS</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    {tab === 'pending' && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(approvalsQuery.data?.approvals ?? []).map(appr => (
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
                          className={appr.score > 0.7 ? 'text-success-400' : 'text-warning-400'}
                        >
                          {appr.score.toFixed(3)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={APPROVAL_STATUS_COLORS[appr.status]}>
                          {appr.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-secondary text-sm">
                        {formatDate(appr.requested_at)}
                      </TableCell>
                      {tab === 'pending' && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApprove(appr)}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                              title="Approve"
                              className="w-4 h-4"
                            >
                              <CheckCircle className="w-4 h-4 text-success-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReject(appr)}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                              title="Reject"
                              className="w-4 h-4"
                            >
                              <XCircle className="w-4 h-4 text-danger-400" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={actionState !== null && !rejectConfirm}
        onOpenChange={(open) => {
          if (!open) {
            setActionState(null)
            setComments('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionState?.action === 'approve' ? 'Approve memory?' : 'Reject memory?'}
            </DialogTitle>
            <DialogDescription>
              Memory ID: {actionState?.approval.memory_id.slice(0, 12)}…
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Comments (optional)</label>
              <Textarea
                placeholder="Add a comment…"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionState(null)
                setComments('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant={actionState?.action === 'approve' ? 'default' : 'destructive'}
              onClick={submitAction}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              {approveMutation.isPending || rejectMutation.isPending
                ? 'Processing…'
                : actionState?.action === 'approve'
                  ? 'Approve'
                  : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={rejectConfirm}
        onOpenChange={(open) => {
          if (!open) {
            setRejectConfirm(false)
          }
        }}
        title="Reject memory?"
        description="This action is irreversible. The memory will be marked as rejected and you can add optional comments."
        confirmLabel="Reject"
        variant="danger"
        loading={rejectMutation.isPending}
        onConfirm={submitAction}
      />
    </PageLayout>
  )
}
