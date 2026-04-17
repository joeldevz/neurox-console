import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
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

  const approvalsCount = approvalsQuery.data?.approvals?.length ?? 0

  return (
    <PageLayout title="Approvals">
      {/* Hero */}
      <section className="pb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary mb-3">
              Review Queue
            </p>
            <h1 className="text-[32px] leading-none font-semibold text-text-primary tracking-[-0.02em]">
              Approvals
            </h1>
            <p className="text-sm text-text-secondary mt-3">
              {tab === 'pending' && approvalsCount === 0
                ? 'All clear — no pending reviews.'
                : `${approvalsCount} ${approvalsCount === 1 ? 'item' : 'items'} awaiting decision`}
            </p>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {/* Tabs bar */}
        <div className="card-surface p-3 mb-3">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
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
            <div className="card-surface p-12 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30 text-text-tertiary" />
              <p className="text-sm text-text-secondary">
                {tab === 'pending'
                  ? 'No pending approvals. All clear!'
                  : `No ${tab} approvals.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(approvalsQuery.data?.approvals ?? []).map(appr => (
                <div key={appr.id} className="card-surface-flat p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-3 flex-wrap items-center mb-2">
                        <div className="font-mono text-xs text-text-tertiary truncate">
                          {appr.memory_id.slice(0, 12)}…
                        </div>
                        <Badge variant="outline" className="text-xs font-mono">
                          {appr.source_ns}
                        </Badge>
                        <span className="text-text-tertiary text-xs">→</span>
                        <Badge variant="outline" className="text-xs font-mono">
                          {appr.target_ns}
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-sm text-text-secondary flex-wrap">
                        <div>
                          Score: <span className={appr.score > 0.7 ? 'text-success-400' : 'text-warning-400'}>
                            {appr.score.toFixed(3)}
                          </span>
                        </div>
                        <div>
                          Status: <Badge className={cn(APPROVAL_STATUS_COLORS[appr.status], 'text-xs')}>
                            {appr.status}
                          </Badge>
                        </div>
                        <div className="text-text-tertiary">
                          {formatDate(appr.requested_at)}
                        </div>
                      </div>
                    </div>
                    {tab === 'pending' && (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleApprove(appr)}
                          disabled={approveMutation.isPending && approveMutation.variables?.id === appr.id || rejectMutation.isPending && rejectMutation.variables?.id === appr.id}
                          title="Approve"
                          className="h-8 w-8"
                        >
                          <CheckCircle className="w-4 h-4 text-success-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleReject(appr)}
                          disabled={approveMutation.isPending && approveMutation.variables?.id === appr.id || rejectMutation.isPending && rejectMutation.variables?.id === appr.id}
                          title="Reject"
                          className="h-8 w-8"
                        >
                          <XCircle className="w-4 h-4 text-danger-400" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        </Tabs>
      </div>

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
