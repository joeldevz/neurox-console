import { useQuery } from '@tanstack/react-query'
import { Users, Key, FolderTree, Brain, CheckSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PageLayout } from '@/components/layout'
import { api } from '@/lib/api'
import type { DashboardStats } from '@/types/api'

const STATS_CARDS: Array<{
  key: keyof DashboardStats
  label: string
  icon: React.ElementType
  color: string
}> = [
  { key: 'users', label: 'Total Users', icon: Users, color: 'var(--brand-500)' },
  { key: 'namespaces', label: 'Namespaces', icon: FolderTree, color: 'var(--color-success)' },
  { key: 'memories', label: 'Memories', icon: Brain, color: 'var(--color-info)' },
  { key: 'pending_approvals', label: 'Pending Approvals', icon: CheckSquare, color: 'var(--color-warning)' },
  { key: 'api_keys', label: 'API Keys', icon: Key, color: 'var(--text-secondary)' },
]

export default function Dashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.dashboardStats(),
    refetchInterval: 30_000,
  })

  return (
    <PageLayout title="Dashboard" description="Overview of your Neurox instance">
      {error && (
        <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
          Failed to load stats: {error.message}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {STATS_CARDS.map(({ key, label, icon: Icon, color }) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle
                className="text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                {label}
              </CardTitle>
              <Icon className="w-4 h-4" style={{ color }} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p
                  className="text-3xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {stats?.[key] ?? '—'}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </PageLayout>
  )
}
