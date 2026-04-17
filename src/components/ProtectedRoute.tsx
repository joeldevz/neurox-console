import { Navigate, Outlet } from 'react-router-dom'
import { useAuthContext as useAuth } from '@/context/auth'
import { Skeleton } from '@/components/ui/skeleton'

export function ProtectedRoute() {
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    )
  }

  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}

export function PublicRoute() {
  const { token, isLoading } = useAuth()
  if (isLoading) return null
  if (token) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
