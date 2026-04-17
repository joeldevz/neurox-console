/**
 * Shared UI constants used across multiple pages.
 * Uses Tailwind utility classes mapped to design system tokens.
 *
 * These REPLACE the inline style maps with CSS variables that were
 * previously duplicated across Memories.tsx, UserPortal.tsx, Users.tsx.
 *
 * Design system reference: /DESIGN_SYSTEM.md
 */

// Memory kind — semantic colors match the design system
// Use as: <span className={KIND_COLORS[kind]}>...</span>
export const KIND_COLORS: Record<'episodic' | 'semantic' | 'procedural', string> = {
  episodic:   'bg-info-light text-info-400',
  semantic:   'bg-brand-light text-brand-400',
  procedural: 'bg-warning-light text-warning-400',
}

// Memory visibility — maps visibility to badge class + optional icon
export const VISIBILITY_STYLES: Record<
  'personal' | 'namespace' | 'org',
  { className: string; label: string; icon: string }
> = {
  personal:  { className: 'bg-surface-3 text-text-secondary border border-border-subtle', label: 'Personal',  icon: '🔒' },
  namespace: { className: 'bg-brand-light text-brand-400', label: 'Namespace', icon: '👥' },
  org:       { className: 'bg-success-light text-success-400', label: 'Organization', icon: '🌐' },
}

// User roles
export const ROLE_COLORS: Record<
  'owner' | 'admin' | 'memory_manager' | 'member',
  string
> = {
  owner:          'bg-brand-light text-brand-400',
  admin:          'bg-info-light text-info-400',
  memory_manager: 'bg-success-light text-success-400',
  member:         'bg-surface-3 text-text-secondary border border-border-subtle',
}

// User/entity status
export const STATUS_COLORS: Record<'active' | 'invited' | 'suspended' | 'deleted' | 'pending', string> = {
  active:    'bg-success-light text-success-400',
  invited:   'bg-info-light text-info-400',
  suspended: 'bg-warning-light text-warning-400',
  deleted:   'bg-danger-light text-danger-400',
  pending:   'bg-surface-3 text-text-secondary border border-border-subtle',
}

// Approval action
export const APPROVAL_STATUS_COLORS: Record<'pending' | 'approved' | 'rejected', string> = {
  pending:  'bg-warning-light text-warning-400',
  approved: 'bg-success-light text-success-400',
  rejected: 'bg-danger-light text-danger-400',
}

// API key status
export const API_KEY_STATUS_COLORS: Record<'active' | 'revoked' | 'expired', string> = {
  active:  'bg-success-light text-success-400',
  revoked: 'bg-danger-light text-danger-400',
  expired: 'bg-surface-3 text-text-secondary border border-border-subtle',
}
