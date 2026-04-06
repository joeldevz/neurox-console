'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Namespace } from '@/types/api'

interface NamespaceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  initialNamespace?: Namespace
  parentOptions: Array<{ label: string; value: string }>
  onSubmit: (input: {
    name: string
    parent_path?: string
    node_type: 'team' | 'department' | 'project'
  }) => Promise<void>
  disabledReason?: string
}

const NODE_TYPE_OPTIONS: Array<{
  value: 'team' | 'department' | 'project'
  label: string
}> = [
  { value: 'project', label: 'Project namespace' },
  { value: 'team', label: 'Team namespace' },
  { value: 'department', label: 'Business area / department namespace' },
]

// Validation constants
const NAMESPACE_NAME_MIN_LENGTH = 1
const NAMESPACE_NAME_MAX_LENGTH = 64
// Safe characters: alphanumeric, hyphen, underscore, space (for display name)
// Path segments will be normalized to kebab-case
const NAMESPACE_NAME_PATTERN = /^[a-zA-Z0-9\-_\s]+$/

interface ValidationResult {
  valid: boolean
  error?: string
}

function validateNamespaceName(name: string): ValidationResult {
  const trimmed = name.trim()

  if (trimmed.length < NAMESPACE_NAME_MIN_LENGTH) {
    return { valid: false, error: 'Namespace name is required' }
  }

  if (trimmed.length > NAMESPACE_NAME_MAX_LENGTH) {
    return {
      valid: false,
      error: `Namespace name must be at most ${NAMESPACE_NAME_MAX_LENGTH} characters`,
    }
  }

  if (!NAMESPACE_NAME_PATTERN.test(trimmed)) {
    return {
      valid: false,
      error: 'Namespace name can only contain letters, numbers, spaces, hyphens, and underscores',
    }
  }

  return { valid: true }
}

export function NamespaceFormDialog({
  open,
  onOpenChange,
  mode,
  initialNamespace,
  parentOptions,
  onSubmit,
  disabledReason,
}: NamespaceFormDialogProps) {
  const [name, setName] = useState('')
  const [parentPath, setParentPath] = useState<string | undefined>(undefined)
  const [nodeType, setNodeType] = useState<'team' | 'department' | 'project'>('project')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDisabled = !!disabledReason

  // Validate name on change
  const nameValidation = useMemo(() => validateNamespaceName(name), [name])

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialNamespace) {
        setName(initialNamespace.name)
        setParentPath(initialNamespace.parent_path ?? undefined)
        setNodeType(initialNamespace.node_type as 'team' | 'department' | 'project')
      } else {
        setName('')
        setParentPath(undefined)
        setNodeType('project')
      }
      setError(null)
    }
  }, [open, mode, initialNamespace])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isDisabled) return

    // Run validation
    const validation = validateNamespaceName(name)
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid namespace name')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit({
        name: name.trim(),
        parent_path: parentPath,
        node_type: nodeType,
      })
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save namespace')
    } finally {
      setIsSubmitting(false)
    }
  }

  const title = mode === 'create' ? 'Create namespace' : 'Edit namespace'
  const submitLabel = mode === 'create' ? 'Create' : 'Save changes'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="my-namespace"
              disabled={isSubmitting || isDisabled}
              aria-invalid={!nameValidation.valid && name.length > 0}
              aria-describedby={!nameValidation.valid && name.length > 0 ? 'name-error' : undefined}
            />
            {name.length > 0 && !nameValidation.valid && (
              <p id="name-error" className="text-xs text-destructive">
                {nameValidation.error}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">Parent namespace (optional)</Label>
            <Select
              value={parentPath ?? '__none__'}
              onValueChange={value => setParentPath(value === '__none__' ? undefined : value)}
              disabled={isSubmitting || isDisabled}
            >
              <SelectTrigger id="parent">
                <SelectValue placeholder="No parent (root level)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No parent (root level)</SelectItem>
                {parentOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nodeType">Type</Label>
            <Select
              value={nodeType}
              onValueChange={value =>
                setNodeType(value as 'team' | 'department' | 'project')
              }
              disabled={isSubmitting || isDisabled}
            >
              <SelectTrigger id="nodeType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NODE_TYPE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}

          {isDisabled && disabledReason && (
            <p className="text-sm text-muted-foreground">
              {disabledReason}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !nameValidation.valid || isDisabled}
            >
              {isSubmitting ? 'Saving…' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
