import { Brain, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MemoriesEmptyStateProps {
  visibility?: string
  onCreate?: () => void
  disabled?: boolean
  disabledReason?: string
}

export function MemoriesEmptyState({
  visibility,
  onCreate,
  disabled,
  disabledReason,
}: MemoriesEmptyStateProps) {
  const isOrgVisibility = visibility === 'org'
  const title = isOrgVisibility
    ? 'No organization-shared memories yet.'
    : 'No memories found.'
  const description = isOrgVisibility
    ? 'Organization-shared memories are visible company-wide. Create one to share important information with your team.'
    : 'Try adjusting your filters or search query to find what you are looking for.'

  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border p-8 text-center"
      style={{ borderColor: 'var(--border-default)', background: 'var(--bg-card)' }}
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: 'var(--bg-muted)' }}
      >
        <Brain
          className="h-6 w-6"
          style={{ color: 'var(--brand-400)' }}
        />
      </div>
      <h3
        className="mb-2 text-lg font-medium"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </h3>
      <p
        className="mb-6 max-w-md text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        {description}
      </p>
      {isOrgVisibility && (
        <>
          <Button
            onClick={onCreate}
            disabled={disabled}
            className={disabled ? 'opacity-50 cursor-not-allowed' : ''}
          >
            <Plus className="mr-2 h-4 w-4" />
            New shared memory
          </Button>
          {disabled && disabledReason && (
            <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              {disabledReason}
            </p>
          )}
        </>
      )}
    </div>
  )
}
