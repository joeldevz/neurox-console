import { FolderTree, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NamespaceEmptyStateProps {
  onCreate?: () => void
  disabled?: boolean
  disabledReason?: string
}

export function NamespaceEmptyState({
  onCreate,
  disabled,
  disabledReason,
}: NamespaceEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border p-8 text-center"
      style={{ borderColor: 'var(--border-default)', background: 'var(--bg-card)' }}
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: 'var(--bg-muted)' }}
      >
        <FolderTree
          className="h-6 w-6"
          style={{ color: 'var(--brand-400)' }}
        />
      </div>
      <h3
        className="mb-2 text-lg font-medium"
        style={{ color: 'var(--text-primary)' }}
      >
        No namespaces yet
      </h3>
      <p
        className="mb-6 max-w-md text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        Namespaces represent projects or business areas such as marketing.
        Create a namespace to organize memories and control access.
      </p>
      <Button
        onClick={onCreate}
        disabled={disabled}
        className={disabled ? 'opacity-50 cursor-not-allowed' : ''}
      >
        <Plus className="mr-2 h-4 w-4" />
        Create namespace
      </Button>
      {disabled && disabledReason && (
        <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          {disabledReason}
        </p>
      )}
    </div>
  )
}
