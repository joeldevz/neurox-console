import { useQuery } from '@tanstack/react-query'
import { Users, Key, Boxes, Brain, CheckSquare, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageLayout } from '@/components/layout'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: number | string | React.ReactNode
  icon: React.ElementType
  urgent?: boolean
  isLoading?: boolean
}

function StatCard({ label, value, icon: Icon, urgent, isLoading }: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-surface-2 border border-border-subtle rounded-xl p-5 min-w-0 overflow-hidden',
        'transition-colors duration-150 hover:border-border-default hover:bg-surface-3',
        urgent && 'border-warning-500/40'
      )}
    >
      <div className="flex items-center justify-between mb-3 gap-2">
        <span className="text-[10px] uppercase tracking-[0.12em] text-text-tertiary truncate">
          {label}
        </span>
        <Icon
          size={14}
          className={cn(
            'shrink-0',
            urgent ? 'text-warning-400' : 'text-text-tertiary'
          )}
        />
      </div>
      {isLoading ? (
        <Skeleton className="h-8 w-12" />
      ) : (
        <p
          className={cn(
            'text-2xl font-bold tracking-tight truncate',
            urgent ? 'text-warning-400' : 'text-text-primary'
          )}
        >
          {value}
        </p>
      )}
    </div>
  )
}

interface QuickActionProps {
  to: string
  label: string
  description: string
  icon: React.ElementType
}

function QuickAction({
  to,
  label,
  description,
  icon: Icon,
}: QuickActionProps) {
  return (
    <Link
      to={to}
      className="group bg-surface-2 hover:bg-surface-3 border border-border-subtle hover:border-border-default rounded-xl p-4 transition-colors duration-150 flex items-center gap-3 min-w-0"
    >
      <div className="w-10 h-10 rounded-lg bg-surface-3 group-hover:bg-brand-light flex items-center justify-center shrink-0 transition-colors">
        <Icon size={16} className="text-text-secondary group-hover:text-brand-400 transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">{label}</p>
        <p className="text-xs text-text-tertiary mt-0.5 truncate">{description}</p>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.dashboardStats(),
    refetchInterval: 30_000,
  })

  // System health indicator — green dot if api.me succeeds
  const systemHealthOk = !error

  return (
    <PageLayout title="Dashboard">
      {/* Hero section */}
      <section className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Overview of your organization.
            </p>
          </div>
          {/* System Health Indicator */}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-3 h-3 rounded-full',
                systemHealthOk ? 'bg-success-400' : 'bg-danger-400'
              )}
            />
            <span className="text-xs text-text-secondary">
              {systemHealthOk ? 'System healthy' : 'System unavailable'}
            </span>
          </div>
        </div>
      </section>

      {/* Error state */}
      {error && (
        <div className="mb-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load stats: {error.message}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Stats grid */}
      <section className="mb-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          label="Users"
          value={stats?.users ?? '—'}
          icon={Users}
          isLoading={isLoading}
        />
        <StatCard
          label="Namespaces"
          value={stats?.namespaces ?? '—'}
          icon={Boxes}
          isLoading={isLoading}
        />
        <StatCard
          label="Memories"
          value={stats?.memories ?? '—'}
          icon={Brain}
          isLoading={isLoading}
        />
        <StatCard
          label="Pending Approvals"
          value={stats?.pending_approvals ?? '—'}
          icon={CheckSquare}
          urgent={(stats?.pending_approvals ?? 0) > 0}
          isLoading={isLoading}
        />
        <StatCard
          label="API Keys"
          value={stats?.api_keys ?? '—'}
          icon={Key}
          isLoading={isLoading}
        />
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-text-tertiary mb-3">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-32">
          <QuickAction
            to="/users"
            label="Manage users"
            description="Invite, suspend, or change roles"
            icon={Users}
          />
          <QuickAction
            to="/api-keys"
            label="Create API key"
            description="Generate a new access token"
            icon={Key}
          />
          <QuickAction
            to="/approvals"
            label="Review approvals"
            description={`${stats?.pending_approvals ?? 0} pending`}
            icon={CheckSquare}
          />
        </div>
      </section>
    </PageLayout>
  )
}
