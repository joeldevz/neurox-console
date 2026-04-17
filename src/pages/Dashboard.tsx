import { useQuery } from '@tanstack/react-query'
import {
  Users,
  Key,
  Boxes,
  Brain,
  CheckSquare,
  AlertCircle,
  ArrowUpRight,
  Activity,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageLayout } from '@/components/layout'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function Dashboard() {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.dashboardStats(),
    refetchInterval: 30_000,
  })

  const systemHealthOk = !error

  return (
    <PageLayout title="Dashboard">
      {/* Hero section — generous spacing, refined hierarchy */}
      <section className="pt-2 pb-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary mb-3">
              Overview
            </p>
            <h1 className="text-[32px] leading-none font-semibold text-text-primary tracking-[-0.02em]">
              Good to see you back.
            </h1>
            <p className="text-sm text-text-secondary mt-3">
              Here's what's happening in your organization right now.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <div
              className={cn(
                'relative flex items-center justify-center w-2 h-2 rounded-full',
                systemHealthOk ? 'bg-success-500' : 'bg-danger-500'
              )}
            >
              {systemHealthOk && (
                <div className="absolute inset-0 rounded-full bg-success-500 animate-ping opacity-60" />
              )}
            </div>
            <span className="text-xs text-text-secondary">
              {systemHealthOk ? 'All systems operational' : 'Service degraded'}
            </span>
          </div>
        </div>
      </section>

      {/* Error state */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load stats: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats grid — Fey-style with context labels */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">
            Key metrics
          </h2>
          <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
            <Activity className="w-3 h-3" />
            <span>Updated every 30s</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-border-subtle rounded-2xl overflow-hidden border border-border-subtle">
          <StatCell
            label="Users"
            value={stats?.users}
            icon={Users}
            accent="brand"
            to="/users"
            isLoading={isLoading}
          />
          <StatCell
            label="Namespaces"
            value={stats?.namespaces}
            icon={Boxes}
            accent="info"
            to="/namespaces"
            isLoading={isLoading}
          />
          <StatCell
            label="Memories"
            value={stats?.memories}
            icon={Brain}
            accent="success"
            to="/memories"
            isLoading={isLoading}
          />
          <StatCell
            label="Pending"
            value={stats?.pending_approvals}
            icon={CheckSquare}
            accent="warning"
            to="/approvals"
            urgent={(stats?.pending_approvals ?? 0) > 0}
            isLoading={isLoading}
          />
          <StatCell
            label="API Keys"
            value={stats?.api_keys}
            icon={Key}
            accent="neutral"
            to="/api-keys"
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* Quick actions */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">
            Quick actions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ActionCard
            to="/users"
            title="Manage users"
            description="Invite new members or adjust roles"
            icon={Users}
          />
          <ActionCard
            to="/api-keys"
            title="Create API key"
            description="Generate credentials for an integration"
            icon={Key}
          />
          <ActionCard
            to="/approvals"
            title="Review approvals"
            description={
              (stats?.pending_approvals ?? 0) > 0
                ? `${stats?.pending_approvals} waiting for review`
                : 'All caught up — nothing pending'
            }
            icon={CheckSquare}
            badge={
              (stats?.pending_approvals ?? 0) > 0
                ? String(stats?.pending_approvals)
                : undefined
            }
          />
        </div>
      </section>

      {/* Footer hint */}
      <section className="mt-12 pt-6 border-t border-border-subtle">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center">
              <Zap className="w-4 h-4 text-brand-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                Connect Claude to this workspace
              </p>
              <p className="text-xs text-text-tertiary">
                Use Neurox as persistent memory for your AI workflows.
              </p>
            </div>
          </div>
          <Link
            to="/connect-claude"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-400 hover:text-brand-500 transition-colors"
          >
            Get started
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </PageLayout>
  )
}

// ─────────────────────────────────────────────────────────────
// StatCell — borderless cell inside a unified grid of metrics
// Inspired by Fey's "KPI strip"
// ─────────────────────────────────────────────────────────────

interface StatCellProps {
  label: string
  value: number | undefined
  icon: React.ElementType
  accent: 'brand' | 'info' | 'success' | 'warning' | 'neutral'
  to: string
  urgent?: boolean
  isLoading?: boolean
}

const ACCENT_COLORS: Record<StatCellProps['accent'], { bg: string; text: string }> = {
  brand:   { bg: 'bg-brand-light',   text: 'text-brand-400' },
  info:    { bg: 'bg-info-light',    text: 'text-info-400' },
  success: { bg: 'bg-success-light', text: 'text-success-400' },
  warning: { bg: 'bg-warning-light', text: 'text-warning-400' },
  neutral: { bg: 'bg-surface-4',     text: 'text-text-secondary' },
}

function StatCell({ label, value, icon: Icon, accent, to, urgent, isLoading }: StatCellProps) {
  const colors = urgent ? ACCENT_COLORS.warning : ACCENT_COLORS[accent]

  return (
    <Link
      to={to}
      className={cn(
        'group relative bg-surface-2 p-5 transition-colors duration-150',
        'hover:bg-surface-3 cursor-pointer'
      )}
    >
      {/* Icon chip */}
      <div className="flex items-center justify-between mb-5">
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            colors.bg
          )}
        >
          <Icon size={14} className={colors.text} strokeWidth={2} />
        </div>
        <ArrowUpRight
          size={14}
          className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>

      {/* Label */}
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-tertiary mb-1.5">
        {label}
      </p>

      {/* Value */}
      {isLoading ? (
        <Skeleton className="h-9 w-16 bg-surface-3" />
      ) : (
        <p
          className={cn(
            'text-[28px] leading-none font-semibold tracking-[-0.03em] tabular-nums',
            urgent ? 'text-warning-400' : 'text-text-primary'
          )}
        >
          {value ?? '—'}
        </p>
      )}

      {/* Urgency indicator dot */}
      {urgent && (
        <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-warning-500 animate-pulse" />
      )}
    </Link>
  )
}

// ─────────────────────────────────────────────────────────────
// ActionCard — larger card with icon, title, description, optional badge
// ─────────────────────────────────────────────────────────────

interface ActionCardProps {
  to: string
  title: string
  description: string
  icon: React.ElementType
  badge?: string
}

function ActionCard({ to, title, description, icon: Icon, badge }: ActionCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        'group relative bg-surface-2 border border-border-subtle rounded-xl p-5',
        'transition-all duration-150',
        'hover:bg-surface-3 hover:border-border-default'
      )}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-surface-3 group-hover:bg-brand-light flex items-center justify-center shrink-0 transition-colors">
          <Icon
            size={16}
            className="text-text-secondary group-hover:text-brand-400 transition-colors"
          />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-text-primary">{title}</p>
            {badge && (
              <span className="inline-flex items-center px-1.5 py-px rounded text-[10px] font-semibold bg-warning-light text-warning-400 tabular-nums">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-text-tertiary mt-1 leading-relaxed">
            {description}
          </p>
        </div>
        <ArrowUpRight
          size={14}
          className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1"
        />
      </div>
    </Link>
  )
}
