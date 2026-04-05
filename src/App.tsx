import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuthContext } from '@/context/auth'
import { ThemeProvider } from '@/context/theme'
import { ProtectedRoute, PublicRoute } from '@/components/ProtectedRoute'
import { setUnauthorizedCallback, ApiClientError } from '@/lib/api'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Organization from '@/pages/Organization'
import Users from '@/pages/Users'
import ApiKeys from '@/pages/ApiKeys'
import Namespaces from '@/pages/Namespaces'
import Memories from '@/pages/Memories'
import Approvals from '@/pages/Approvals'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiClientError) {
          if (error.status === 401 || error.status === 403) return false
        }
        return failureCount < 2
      },
      staleTime: 30_000,
    },
  },
})

// Inner component: registers 401 callback after AuthProvider is mounted
function AppWithAuth() {
  const { logout } = useAuthContext()

  useEffect(() => {
    setUnauthorizedCallback(() => {
      queryClient.clear()
      logout()
    })
    return () => setUnauthorizedCallback(null)
  }, [logout])

  return (
    <Routes>
      {/* Public routes — redirect to /dashboard if already logged in */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/organization" element={<Organization />} />
        <Route path="/users" element={<Users />} />
        <Route path="/api-keys" element={<ApiKeys />} />
        <Route path="/namespaces" element={<Namespaces />} />
        <Route path="/memories" element={<Memories />} />
        <Route path="/approvals" element={<Approvals />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <AppWithAuth />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
