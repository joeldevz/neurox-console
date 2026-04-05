# Plan: neurox-console — Full Frontend Build

## Goal
Build the complete enterprise admin dashboard UI for the Neurox memory management backend. Replace the Vite default template with a production-quality React 18 SPA that covers: auth (token-based login), dashboard stats, organization settings, users management, API keys, namespaces tree, memories browser, and approvals workflow.

## Business Context
- **Users**: Internal admins and org owners managing a Neurox backend instance
- **Auth model**: Token/API-key paste on login → stored as `neurox_token` in localStorage → injected as `Authorization: Bearer <token>` on every request
- **401 guard**: Any API response with status 401 redirects to `/login`
- **Theming**: Full dark/light mode via `.dark` class on `<html>` — all colors via CSS variables already in `index.css`
- **Non-functional**: TypeScript strict mode, no `any`, no hardcoded colors, Tailwind utility-first

## Technical Context
- **Stack confirmed**: React 19 (listed as 18+ in conventions), Vite 8, TypeScript 5.9 strict, Tailwind CSS v4 (via `@tailwindcss/vite`), React Router v7 (`react-router-dom`), TanStack Query v5 (`@tanstack/react-query`)
- **`src/lib/api.ts`**: `ApiClient` class fully implemented with all 20 endpoints; `api` singleton exported; `setToken`, `clearToken`, `getToken` already exist
- **`src/types/api.ts`**: All domain types present (`Org`, `User`, `ApiKey`, `ApiKeyCreated`, `Namespace`, `NamespaceTreeNode`, `Memory`, `Approval`, `DashboardStats`, `Me`, `Paginated`, `ApiError`)
- **`src/lib/utils.ts`**: `cn()`, `formatDate()`, `relativeTime()`, `truncate()` all implemented
- **`src/index.css`**: Full CSS variable palette (brand, semantic, surface, text, border, btn, shadow, radius) + `.dark` overrides + `@theme` Tailwind token bridge — **no changes needed**
- **`vite.config.ts`**: `@` alias to `./src` configured; dev proxy `/api → http://localhost:8080` in place
- **`tsconfig.app.json`**: Missing `paths` option for `@/` — must be added (else TS errors on `@/` imports)
- **shadcn/ui**: NOT initialized — no `components.json`, no `@radix-ui` packages — must run init before adding components
- **Lucide React**: v1.7.0 already installed
- **`src/pages/`**: Empty directory — all pages to create
- **`src/hooks/`**: Empty directory — all hooks to create
- **`src/components/ui/`**: Empty directory — populated by shadcn CLI
- **`src/components/layout/`**: Does not exist yet — must create

---

## Implementation Steps

### Step 1: Fix TypeScript path alias + initialize shadcn/ui
- **What**: Add `paths` to `tsconfig.app.json` so TypeScript resolves `@/` imports; then run `shadcn init` to scaffold `components.json` and install Radix UI dependencies
- **Why**: Without `paths` in tsconfig, TS will error on every `@/` import even though Vite resolves them at runtime. shadcn must be initialized before any `shadcn add` commands
- **Where**: `tsconfig.app.json`, project root (`components.json`)
- **How**:
  1. Edit `tsconfig.app.json` — add `"paths"` and `"baseUrl"` inside `compilerOptions`:
     ```json
     "baseUrl": ".",
     "paths": {
       "@/*": ["./src/*"]
     }
     ```
     Full `compilerOptions` section after edit:
     ```json
     "compilerOptions": {
       "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
       "target": "ES2023",
       "useDefineForClassFields": true,
       "lib": ["ES2023", "DOM", "DOM.Iterable"],
       "module": "ESNext",
       "types": ["vite/client"],
       "skipLibCheck": true,
       "moduleResolution": "bundler",
       "allowImportingTsExtensions": true,
       "verbatimModuleSyntax": true,
       "moduleDetection": "force",
       "noEmit": true,
       "jsx": "react-jsx",
       "strict": true,
       "noUnusedLocals": true,
       "noUnusedParameters": true,
       "erasableSyntaxOnly": true,
       "noFallthroughCasesInSwitch": true,
       "noUncheckedSideEffectImports": true,
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"]
       }
     }
     ```
  2. Run shadcn init (choose options: TypeScript=yes, style=default, base color=neutral, CSS vars=yes, tailwind config=no/vite, `src/` dir=yes, import alias=`@/components`):
     ```bash
     npx shadcn@latest init
     ```
     When prompted:
     - Framework: Vite
     - TypeScript: yes
     - Style: Default
     - Base color: Neutral (matches the existing `--bg-sidebar` dark palette)
     - CSS variables: yes
     - Would you like to use CSS variables for colors? yes
     - `components.json` will be created at project root
     - `src/components/ui/` will be populated by subsequent `add` commands
  3. After init, **merge shadcn's CSS variable additions** into `src/index.css` carefully:
     - The existing `index.css` already has `@import "tailwindcss"` and a full custom palette
     - shadcn init may rewrite `index.css` — restore the existing `--brand-*`, `--bg-*`, `--text-*`, `--border-*`, `--btn-*`, `--shadow-*`, `--radius-*` variables AND the `.dark` block
     - Ensure the `@theme` block stays: `--color-brand: var(--brand-500)` etc.
     - Keep `body { ... background: var(--bg-page); color: var(--text-primary); }` rule
- **Acceptance**:
  - `tsc --noEmit` produces no errors for `import ... from '@/lib/api'`
  - `components.json` exists at project root
  - `src/index.css` still has `--brand-50` through `--brand-900` and `.dark` overrides
- **Status**: [x] done

---

### Step 2: Install shadcn/ui components
- **What**: Install all required shadcn/ui primitive components via the CLI
- **Why**: These primitives are used across every page — installing them all in one step avoids repeated interruptions
- **Where**: `src/components/ui/` (CLI copies source files here)
- **How**:
  ```bash
  npx shadcn@latest add button
  npx shadcn@latest add card
  npx shadcn@latest add input
  npx shadcn@latest add badge
  npx shadcn@latest add dialog
  npx shadcn@latest add table
  npx shadcn@latest add select
  npx shadcn@latest add dropdown-menu
  npx shadcn@latest add skeleton
  npx shadcn@latest add toast
  npx shadcn@latest add separator
  npx shadcn@latest add label
  npx shadcn@latest add textarea
  npx shadcn@latest add alert
  npx shadcn@latest add tooltip
  ```
  After running each command, the component TypeScript file is added to `src/components/ui/`.
  
  **Color overrides**: Every shadcn component uses `bg-primary`, `bg-card`, `text-muted-foreground`, etc. For these to map to the existing CSS variable palette, ensure the `@theme` block in `index.css` includes:
  ```css
  @theme {
    --color-brand: var(--brand-500);
    --color-primary: var(--btn-primary-bg);
    --color-primary-foreground: var(--btn-primary-text);
    --color-background: var(--bg-page);
    --color-card: var(--bg-card);
    --color-card-foreground: var(--text-primary);
    --color-muted: var(--bg-muted);
    --color-muted-foreground: var(--text-muted);
    --color-border: var(--border-default);
    --color-input: var(--bg-input);
    --color-destructive: var(--color-danger);
    --color-destructive-foreground: #ffffff;
    --radius: var(--radius-md);
  }
  ```
  Add these to the existing `@theme` block in `src/index.css`.
- **Acceptance**:
  - `src/components/ui/button.tsx`, `card.tsx`, `input.tsx`, `badge.tsx`, `dialog.tsx`, `table.tsx`, `select.tsx`, `dropdown-menu.tsx`, `skeleton.tsx`, `toast.tsx` all exist
  - `npm run build` has no TypeScript errors from `src/components/ui/`
- **Status**: [x] done

---

### Step 3: Auth context + useAuth hook
- **What**: Create `src/context/auth.tsx` (AuthContext + AuthProvider) and `src/hooks/useAuth.ts`
- **Why**: Auth state (token, user identity, login/logout) must be available globally before any route renders
- **Where**:
  - `src/context/auth.tsx` — new file
  - `src/hooks/useAuth.ts` — new file
- **How**:

  **`src/context/auth.tsx`**:
  ```tsx
  import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
  import { api, setToken, clearToken, ApiClientError } from '@/lib/api'
  import type { Me } from '@/types/api'

  interface AuthState {
    token: string | null
    me: Me | null
    isLoading: boolean
  }

  interface AuthContextValue extends AuthState {
    login: (token: string) => Promise<void>
    logout: () => void
  }

  const AuthContext = createContext<AuthContextValue | null>(null)

  export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
      token: localStorage.getItem('neurox_token'),
      me: null,
      isLoading: true,
    })

    // On mount: if token exists, validate by calling /api/admin/me
    useEffect(() => {
      if (!state.token) {
        setState(s => ({ ...s, isLoading: false }))
        return
      }
      api.me()
        .then(me => setState(s => ({ ...s, me, isLoading: false })))
        .catch((err: unknown) => {
          if (err instanceof ApiClientError && err.status === 401) {
            clearToken()
            setState({ token: null, me: null, isLoading: false })
          } else {
            setState(s => ({ ...s, isLoading: false }))
          }
        })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const login = useCallback(async (token: string) => {
      setToken(token)
      const me = await api.me()  // throws ApiClientError on 401
      setState({ token, me, isLoading: false })
    }, [])

    const logout = useCallback(() => {
      clearToken()
      setState({ token: null, me: null, isLoading: false })
    }, [])

    return (
      <AuthContext.Provider value={{ ...state, login, logout }}>
        {children}
      </AuthContext.Provider>
    )
  }

  export function useAuthContext() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider')
    return ctx
  }
  ```

  **`src/hooks/useAuth.ts`**:
  ```ts
  export { useAuthContext as useAuth } from '@/context/auth'
  ```
  (Simple re-export so consumers do `import { useAuth } from '@/hooks/useAuth'`)

- **Acceptance**:
  - `useAuth()` returns `{ token, me, isLoading, login, logout }`
  - Calling `login('bad-token')` that receives 401 from `api.me()` throws and does NOT persist token
  - `isLoading` is `true` on first render, then settles to `false`
- **Status**: [x] done

---

### Step 4: Theme context + dark mode toggle
- **What**: Create `src/context/theme.tsx` (ThemeContext + ThemeProvider) with light/dark toggle
- **Why**: Dark mode is toggled via `.dark` class on `<html>`; must persist preference to `localStorage`
- **Where**: `src/context/theme.tsx` — new file
- **How**:

  **`src/context/theme.tsx`**:
  ```tsx
  import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

  type Theme = 'light' | 'dark'

  interface ThemeContextValue {
    theme: Theme
    toggleTheme: () => void
  }

  const ThemeContext = createContext<ThemeContextValue | null>(null)

  function getInitialTheme(): Theme {
    const stored = localStorage.getItem('neurox_theme') as Theme | null
    if (stored === 'dark' || stored === 'light') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(getInitialTheme)

    useEffect(() => {
      const root = document.documentElement
      if (theme === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
      localStorage.setItem('neurox_theme', theme)
    }, [theme])

    const toggleTheme = useCallback(() => {
      setTheme(t => (t === 'dark' ? 'light' : 'dark'))
    }, [])

    return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    )
  }

  export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
    return ctx
  }
  ```

- **Acceptance**:
  - Toggle adds/removes `.dark` class on `document.documentElement`
  - Preference persists to `localStorage` key `neurox_theme`
  - Respects `prefers-color-scheme` on first visit
- **Status**: [x] done

---

### Step 5: Layout components (Sidebar + Header + PageLayout)
- **What**: Create `src/components/layout/Sidebar.tsx`, `Header.tsx`, and `PageLayout.tsx`
- **Why**: Every authenticated page uses the same shell — sidebar nav, top header with user info and theme toggle, and a main content area
- **Where**:
  - `src/components/layout/Sidebar.tsx` — new file
  - `src/components/layout/Header.tsx` — new file
  - `src/components/layout/PageLayout.tsx` — new file
  - `src/components/layout/index.ts` — re-exports
- **How**:

  **`src/components/layout/Sidebar.tsx`**:
  ```tsx
  import { NavLink } from 'react-router-dom'
  import {
    LayoutDashboard, Building2, Users, Key, FolderTree,
    Brain, CheckSquare, LogOut
  } from 'lucide-react'
  import { cn } from '@/lib/utils'
  import { useAuth } from '@/hooks/useAuth'

  const NAV_ITEMS = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/organization', icon: Building2, label: 'Organization' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/api-keys', icon: Key, label: 'API Keys' },
    { to: '/namespaces', icon: FolderTree, label: 'Namespaces' },
    { to: '/memories', icon: Brain, label: 'Memories' },
    { to: '/approvals', icon: CheckSquare, label: 'Approvals' },
  ] as const

  export function Sidebar() {
    const { logout } = useAuth()

    return (
      <aside
        className="flex flex-col w-64 min-h-screen"
        style={{ background: 'var(--bg-sidebar)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b" style={{ borderColor: 'var(--bg-sidebar-hover)' }}>
          <Brain className="w-6 h-6" style={{ color: 'var(--brand-400)' }} />
          <span className="font-semibold text-base" style={{ color: 'var(--text-inverse)' }}>
            Neurox Console
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'text-white'
                    : 'hover:text-white'
                )
              }
              style={({ isActive }) => ({
                background: isActive ? 'var(--bg-sidebar-active)' : 'transparent',
                color: isActive ? 'var(--text-sidebar-active)' : 'var(--text-sidebar)',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                  {isActive && <span className="sr-only">(current)</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--bg-sidebar-hover)' }}>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-white"
            style={{ color: 'var(--text-sidebar)', background: 'transparent' }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    )
  }
  ```

  **`src/components/layout/Header.tsx`**:
  ```tsx
  import { Moon, Sun } from 'lucide-react'
  import { useTheme } from '@/context/theme'
  import { useAuth } from '@/hooks/useAuth'
  import { Button } from '@/components/ui/button'

  interface HeaderProps {
    title: string
    description?: string
  }

  export function Header({ title, description }: HeaderProps) {
    const { theme, toggleTheme } = useTheme()
    const { me } = useAuth()

    return (
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
      >
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h1>
          {description && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {me && (
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {me.role}
            </span>
          )}
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </header>
    )
  }
  ```

  **`src/components/layout/PageLayout.tsx`**:
  ```tsx
  import { type ReactNode } from 'react'
  import { Sidebar } from './Sidebar'
  import { Header } from './Header'

  interface PageLayoutProps {
    title: string
    description?: string
    children: ReactNode
  }

  export function PageLayout({ title, description, children }: PageLayoutProps) {
    return (
      <div className="flex min-h-screen" style={{ background: 'var(--bg-page)' }}>
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Header title={title} description={description} />
          <main className="flex-1 p-6 space-y-6">
            {children}
          </main>
        </div>
      </div>
    )
  }
  ```

  **`src/components/layout/index.ts`**:
  ```ts
  export { Sidebar } from './Sidebar'
  export { Header } from './Header'
  export { PageLayout } from './PageLayout'
  ```

- **Acceptance**:
  - Sidebar renders 7 nav links + logout button
  - Active route is highlighted with `var(--bg-sidebar-active)` background
  - Header shows page title, role badge, and theme toggle button
  - Dark mode toggle works (`.dark` class added/removed on `<html>`)
- **Status**: [x] done

---

### Step 6: Login page + ProtectedRoute guard
- **What**: Create `src/pages/Login.tsx` (token-paste login form) and `src/components/ProtectedRoute.tsx` (401 redirect guard)
- **Why**: The app must redirect unauthenticated users to `/login`; authenticated users must be blocked from `/login`
- **Where**:
  - `src/pages/Login.tsx` — new file
  - `src/components/ProtectedRoute.tsx` — new file
- **How**:

  **`src/pages/Login.tsx`**:
  ```tsx
  import { useState, type FormEvent } from 'react'
  import { useNavigate } from 'react-router-dom'
  import { Brain } from 'lucide-react'
  import { Button } from '@/components/ui/button'
  import { Input } from '@/components/ui/input'
  import { Label } from '@/components/ui/label'
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
  import { useAuth } from '@/hooks/useAuth'
  import { ApiClientError } from '@/lib/api'

  export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [token, setToken] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: FormEvent) {
      e.preventDefault()
      if (!token.trim()) return
      setLoading(true)
      setError(null)
      try {
        await login(token.trim())
        navigate('/dashboard', { replace: true })
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.status === 401 ? 'Invalid token. Check your API key.' : err.message)
        } else {
          setError('Could not connect to the server.')
        }
      } finally {
        setLoading(false)
      }
    }

    return (
      <div
        className="flex min-h-screen items-center justify-center p-4"
        style={{ background: 'var(--bg-page)' }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-3">
              <Brain className="w-10 h-10" style={{ color: 'var(--brand-500)' }} />
            </div>
            <CardTitle className="text-2xl">Neurox Console</CardTitle>
            <CardDescription>Paste your API key or admin token to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">API Key / Token</Label>
                <Input
                  id="token"
                  type="password"
                  placeholder="nrx_..."
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  autoComplete="current-password"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading || !token.trim()}>
                {loading ? 'Connecting…' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }
  ```

  **`src/components/ProtectedRoute.tsx`**:
  ```tsx
  import { Navigate, Outlet } from 'react-router-dom'
  import { useAuth } from '@/hooks/useAuth'
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
  ```

- **Acceptance**:
  - Visiting `/login` while authenticated redirects to `/dashboard`
  - Visiting any protected route while unauthenticated redirects to `/login`
  - Invalid token shows inline error message
  - Loading state shows skeleton while `isLoading` is true
- **Status**: [x] done

---

### Step 7: Dashboard page
- **What**: Create `src/pages/Dashboard.tsx` — stats overview with 5 metric cards
- **Why**: First page users see after login; surfaces key counts from `/api/admin/dashboard/stats`
- **Where**: `src/pages/Dashboard.tsx` — new file
- **How**:
  ```tsx
  import { useQuery } from '@tanstack/react-query'
  import { Users, Key, FolderTree, Brain, CheckSquare } from 'lucide-react'
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
  import { Skeleton } from '@/components/ui/skeleton'
  import { PageLayout } from '@/components/layout'
  import { api } from '@/lib/api'

  const STATS_CARDS = [
    { key: 'users' as const, label: 'Total Users', icon: Users, color: 'var(--brand-500)' },
    { key: 'namespaces' as const, label: 'Namespaces', icon: FolderTree, color: 'var(--color-success)' },
    { key: 'memories' as const, label: 'Memories', icon: Brain, color: 'var(--color-info)' },
    { key: 'pending_approvals' as const, label: 'Pending Approvals', icon: CheckSquare, color: 'var(--color-warning)' },
    { key: 'api_keys' as const, label: 'API Keys', icon: Key, color: 'var(--text-secondary)' },
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
                <CardTitle className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {label}
                </CardTitle>
                <Icon className="w-4 h-4" style={{ color }} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
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
  ```

- **Acceptance**:
  - 5 cards render with real data from `GET /api/admin/dashboard/stats`
  - Skeletons display while loading
  - Stats auto-refresh every 30 seconds
- **Status**: [ ] pending

---

### Step 8: Organization, Users, and API Keys pages
- **What**: Create `src/pages/Organization.tsx`, `src/pages/Users.tsx`, `src/pages/ApiKeys.tsx`
- **Why**: Core management pages for org settings and member/key administration
- **Where**: `src/pages/Organization.tsx`, `src/pages/Users.tsx`, `src/pages/ApiKeys.tsx` — all new files
- **How**:

  **`src/pages/Organization.tsx`**:
  ```tsx
  import { useState } from 'react'
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
  import { Save } from 'lucide-react'
  import { PageLayout } from '@/components/layout'
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
  import { Input } from '@/components/ui/input'
  import { Label } from '@/components/ui/label'
  import { Button } from '@/components/ui/button'
  import { Skeleton } from '@/components/ui/skeleton'
  import { api } from '@/lib/api'

  export default function Organization() {
    const qc = useQueryClient()
    const { data: org, isLoading } = useQuery({
      queryKey: ['org'],
      queryFn: () => api.getOrg(),
    })
    const [name, setName] = useState('')
    // Initialize form once data loads
    // Use useEffect to sync form state with fetched data:
    // useEffect(() => { if (org) setName(org.name) }, [org])

    const mutation = useMutation({
      mutationFn: (data: { name: string }) => api.patchOrg(data),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['org'] }),
    })

    if (isLoading) return (
      <PageLayout title="Organization">
        <Skeleton className="h-48 w-full" />
      </PageLayout>
    )

    return (
      <PageLayout title="Organization" description="View and update your organization settings">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Name</Label>
              <Input
                id="org-name"
                defaultValue={org?.name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={org?.slug ?? ''} readOnly style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Input value={org?.status ?? ''} readOnly style={{ color: 'var(--text-muted)' }} />
            </div>
            <Button
              onClick={() => mutation.mutate({ name: name || org?.name || '' })}
              disabled={mutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {mutation.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    )
  }
  ```

  **`src/pages/Users.tsx`** — full list + create + patch role/status:
  ```tsx
  import { useState } from 'react'
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
  import { UserPlus } from 'lucide-react'
  import { PageLayout } from '@/components/layout'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import { Skeleton } from '@/components/ui/skeleton'
  import { Input } from '@/components/ui/input'
  import { Label } from '@/components/ui/label'
  import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  } from '@/components/ui/table'
  import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  } from '@/components/ui/dialog'
  import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  } from '@/components/ui/select'
  import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu'
  import { api } from '@/lib/api'
  import { formatDate } from '@/lib/utils'
  import type { User } from '@/types/api'

  const ROLE_COLORS: Record<User['role'], string> = {
    owner: 'var(--brand-500)',
    admin: 'var(--color-info)',
    memory_manager: 'var(--color-success)',
    member: 'var(--text-muted)',
  }

  const STATUS_COLORS: Record<User['status'], string> = {
    active: 'var(--color-success)',
    invited: 'var(--color-warning)',
    suspended: 'var(--color-danger)',
    deleted: 'var(--text-muted)',
  }

  export default function Users() {
    const qc = useQueryClient()
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState('')
    const [role, setRole] = useState<User['role']>('member')

    const { data, isLoading } = useQuery({
      queryKey: ['users'],
      queryFn: () => api.listUsers(100, 0),
    })

    const createMutation = useMutation({
      mutationFn: () => api.createUser({ email, role }),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['users'] })
        setOpen(false)
        setEmail('')
        setRole('member')
      },
    })

    const patchMutation = useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
        api.patchUser(id, data),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
    })

    return (
      <PageLayout title="Users" description="Manage organization members">
        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><UserPlus className="w-4 h-4 mr-2" />Add User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={role} onValueChange={v => setRole(v as User['role'])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="memory_manager">Memory Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || !email.trim()}
                >
                  {createMutation.isPending ? 'Creating…' : 'Create User'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="rounded-md border" style={{ borderColor: 'var(--border-default)' }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Badge style={{ background: ROLE_COLORS[user.role], color: 'white' }}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" style={{ borderColor: STATUS_COLORS[user.status], color: STATUS_COLORS[user.status] }}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">···</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => patchMutation.mutate({ id: user.id, data: { role: 'admin' } })}
                          >
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => patchMutation.mutate({ id: user.id, data: { status: 'suspended' } })}
                          >
                            Suspend
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </PageLayout>
    )
  }
  ```

  **`src/pages/ApiKeys.tsx`** — list keys, create (show plaintext once in dialog), revoke:
  ```tsx
  import { useState } from 'react'
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
  import { Plus, Copy, Trash2 } from 'lucide-react'
  import { PageLayout } from '@/components/layout'
  import { Button } from '@/components/ui/button'
  import { Input } from '@/components/ui/input'
  import { Label } from '@/components/ui/label'
  import { Badge } from '@/components/ui/badge'
  import { Skeleton } from '@/components/ui/skeleton'
  import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  } from '@/components/ui/table'
  import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  } from '@/components/ui/dialog'
  import { api } from '@/lib/api'
  import { formatDate } from '@/lib/utils'
  import type { ApiKeyCreated } from '@/types/api'

  export default function ApiKeys() {
    const qc = useQueryClient()
    const [createOpen, setCreateOpen] = useState(false)
    const [keyName, setKeyName] = useState('')
    const [createdKey, setCreatedKey] = useState<ApiKeyCreated | null>(null)
    const [showKeyOpen, setShowKeyOpen] = useState(false)

    const { data, isLoading } = useQuery({
      queryKey: ['api-keys'],
      queryFn: () => api.listApiKeys(),
    })

    const createMutation = useMutation({
      mutationFn: () => api.createApiKey({ name: keyName }),
      onSuccess: (newKey) => {
        qc.invalidateQueries({ queryKey: ['api-keys'] })
        setCreatedKey(newKey)
        setCreateOpen(false)
        setKeyName('')
        setShowKeyOpen(true)
      },
    })

    const revokeMutation = useMutation({
      mutationFn: (id: string) => api.revokeApiKey(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['api-keys'] }),
    })

    return (
      <PageLayout title="API Keys" description="Manage programmatic access keys">
        <div className="flex justify-end">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Create Key</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create API Key</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={keyName} onChange={e => setKeyName(e.target.value)} placeholder="My integration key" />
                </div>
                <Button
                  className="w-full"
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || !keyName.trim()}
                >
                  {createMutation.isPending ? 'Creating…' : 'Create'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Show plaintext key once */}
        <Dialog open={showKeyOpen} onOpenChange={setShowKeyOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Save your API Key</DialogTitle></DialogHeader>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              This key will only be shown once. Copy it now.
            </p>
            <div className="flex gap-2 mt-2">
              <Input value={createdKey?.plaintext_key ?? ''} readOnly className="font-mono text-xs" />
              <Button
                size="icon"
                variant="outline"
                onClick={() => navigator.clipboard.writeText(createdKey?.plaintext_key ?? '')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="rounded-md border" style={{ borderColor: 'var(--border-default)' }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Prefix</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.keys.map(key => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell className="font-mono text-sm">{key.key_prefix}…</TableCell>
                    <TableCell><Badge variant="outline">{key.role}</Badge></TableCell>
                    <TableCell style={{ color: 'var(--text-secondary)' }}>
                      {key.last_used_at ? formatDate(key.last_used_at) : '—'}
                    </TableCell>
                    <TableCell style={{ color: 'var(--text-secondary)' }}>
                      {key.expires_at ? formatDate(key.expires_at) : '—'}
                    </TableCell>
                    <TableCell>
                      {key.revoked_at ? (
                        <Badge variant="destructive">Revoked</Badge>
                      ) : (
                        <Badge style={{ background: 'var(--color-success)', color: 'white' }}>Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!key.revoked_at && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => revokeMutation.mutate(key.id)}
                          disabled={revokeMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" style={{ color: 'var(--color-danger)' }} />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </PageLayout>
    )
  }
  ```

- **Acceptance**:
  - Org page loads and edits name via `PATCH /api/admin/org`
  - Users table lists all users; "Add User" dialog creates one; dropdown patches role/status
  - API Keys table shows all keys; create dialog saves and shows plaintext key once; revoke button calls `POST /api/admin/api-keys/:id/revoke`
- **Status**: [x] done

---

### Step 9: Namespaces, Memories, and Approvals pages
- **What**: Create `src/pages/Namespaces.tsx`, `src/pages/Memories.tsx`, `src/pages/Approvals.tsx`
- **Why**: These cover namespace browsing (with hierarchy), memory search/filter, and the approval workflow
- **Where**: `src/pages/Namespaces.tsx`, `src/pages/Memories.tsx`, `src/pages/Approvals.tsx` — all new files
- **How**:

  **`src/pages/Namespaces.tsx`** — flat list + tree toggle:
  ```tsx
  import { useState } from 'react'
  import { useQuery } from '@tanstack/react-query'
  import { FolderTree, ChevronRight, ChevronDown } from 'lucide-react'
  import { PageLayout } from '@/components/layout'
  import { Badge } from '@/components/ui/badge'
  import { Button } from '@/components/ui/button'
  import { Skeleton } from '@/components/ui/skeleton'
  import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  } from '@/components/ui/table'
  import { api } from '@/lib/api'
  import { formatDate } from '@/lib/utils'
  import type { NamespaceTreeNode } from '@/types/api'

  function TreeNode({ node, depth = 0 }: { node: NamespaceTreeNode; depth?: number }) {
    const [expanded, setExpanded] = useState(true)
    const hasChildren = node.children.length > 0
    return (
      <div>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:opacity-80 cursor-pointer"
          style={{ paddingLeft: `${(depth * 16) + 12}px`, color: 'var(--text-primary)' }}
          onClick={() => setExpanded(e => !e)}
        >
          {hasChildren ? (
            expanded ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />
          ) : (
            <span className="w-3 h-3 shrink-0" />
          )}
          <FolderTree className="w-4 h-4 shrink-0" style={{ color: 'var(--brand-400)' }} />
          <span className="font-medium">{node.name}</span>
          <Badge variant="outline" className="text-xs">{node.node_type}</Badge>
          <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>{node.path}</span>
        </div>
        {expanded && hasChildren && node.children.map(child => (
          <TreeNode key={child.id} node={child} depth={depth + 1} />
        ))}
      </div>
    )
  }

  export default function Namespaces() {
    const [view, setView] = useState<'list' | 'tree'>('list')

    const listQuery = useQuery({
      queryKey: ['namespaces'],
      queryFn: () => api.listNamespaces(200, 0),
      enabled: view === 'list',
    })
    const treeQuery = useQuery({
      queryKey: ['namespaces-tree'],
      queryFn: () => api.getNamespaceTree(),
      enabled: view === 'tree',
    })

    return (
      <PageLayout title="Namespaces" description="Browse and manage memory namespaces">
        <div className="flex gap-2">
          <Button variant={view === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setView('list')}>List</Button>
          <Button variant={view === 'tree' ? 'default' : 'outline'} size="sm" onClick={() => setView('tree')}>Tree</Button>
        </div>

        {view === 'list' && (
          listQuery.isLoading ? <Skeleton className="h-64 w-full" /> : (
            <div className="rounded-md border" style={{ borderColor: 'var(--border-default)' }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listQuery.data?.namespaces.map(ns => (
                    <TableRow key={ns.id}>
                      <TableCell className="font-medium">{ns.name}</TableCell>
                      <TableCell className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{ns.path}</TableCell>
                      <TableCell><Badge variant="outline">{ns.node_type}</Badge></TableCell>
                      <TableCell>{ns.level}</TableCell>
                      <TableCell style={{ color: 'var(--text-secondary)' }}>{formatDate(ns.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        )}

        {view === 'tree' && (
          treeQuery.isLoading ? <Skeleton className="h-64 w-full" /> : (
            <div className="rounded-md border p-2" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-card)' }}>
              {treeQuery.data?.tree.map(node => (
                <TreeNode key={node.id} node={node} />
              ))}
            </div>
          )
        )}
      </PageLayout>
    )
  }
  ```

  **`src/pages/Memories.tsx`** — list with search + namespace filter:
  ```tsx
  import { useState } from 'react'
  import { useQuery } from '@tanstack/react-query'
  import { Search } from 'lucide-react'
  import { PageLayout } from '@/components/layout'
  import { Input } from '@/components/ui/input'
  import { Badge } from '@/components/ui/badge'
  import { Skeleton } from '@/components/ui/skeleton'
  import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  } from '@/components/ui/table'
  import { api } from '@/lib/api'
  import { formatDate, truncate } from '@/lib/utils'

  const KIND_COLORS = {
    episodic: 'var(--color-info)',
    semantic: 'var(--color-success)',
    procedural: 'var(--color-warning)',
  }

  export default function Memories() {
    const [search, setSearch] = useState('')
    const [nsFilter, setNsFilter] = useState('')

    const { data, isLoading } = useQuery({
      queryKey: ['memories', search, nsFilter],
      queryFn: () => api.listMemories({ limit: 100, query: search || undefined, namespace: nsFilter || undefined }),
      placeholderData: prev => prev,
    })

    return (
      <PageLayout title="Memories" description="Browse and search all stored memories">
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <Input
              className="pl-9"
              placeholder="Search memories…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Input
            className="max-w-xs"
            placeholder="Filter by namespace…"
            value={nsFilter}
            onChange={e => setNsFilter(e.target.value)}
          />
        </div>

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="rounded-md border" style={{ borderColor: 'var(--border-default)' }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Namespace</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Importance</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.memories.map(mem => (
                  <TableRow key={mem.id}>
                    <TableCell className="font-medium max-w-xs">
                      <span title={mem.title}>{truncate(mem.title, 50)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-mono">{mem.namespace}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge style={{ background: KIND_COLORS[mem.kind], color: 'white' }}>
                        {mem.kind}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ color: 'var(--text-secondary)' }}>{mem.observation_type}</TableCell>
                    <TableCell style={{ color: 'var(--text-secondary)' }}>
                      {mem.importance.toFixed(2)}
                    </TableCell>
                    <TableCell style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(mem.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </PageLayout>
    )
  }
  ```

  **`src/pages/Approvals.tsx`** — pending list with approve/reject actions:
  ```tsx
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
  import { CheckCircle, XCircle } from 'lucide-react'
  import { PageLayout } from '@/components/layout'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import { Skeleton } from '@/components/ui/skeleton'
  import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  } from '@/components/ui/table'
  import { api } from '@/lib/api'
  import { formatDate } from '@/lib/utils'

  export default function Approvals() {
    const qc = useQueryClient()

    const { data, isLoading } = useQuery({
      queryKey: ['approvals', 'pending'],
      queryFn: () => api.listApprovals('pending', 100),
      refetchInterval: 15_000,
    })

    const approveMutation = useMutation({
      mutationFn: (id: string) => api.approveApproval(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['approvals'] }),
    })

    const rejectMutation = useMutation({
      mutationFn: (id: string) => api.rejectApproval(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['approvals'] }),
    })

    return (
      <PageLayout title="Approvals" description="Review and process pending memory promotion approvals">
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : data?.approvals.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No pending approvals. All clear!</p>
          </div>
        ) : (
          <div className="rounded-md border" style={{ borderColor: 'var(--border-default)' }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Memory ID</TableHead>
                  <TableHead>Source NS</TableHead>
                  <TableHead>Target NS</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.approvals.map(appr => (
                  <TableRow key={appr.id}>
                    <TableCell className="font-mono text-xs">{appr.memory_id.slice(0, 12)}…</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-mono">{appr.source_ns}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-mono">{appr.target_ns}</Badge>
                    </TableCell>
                    <TableCell>
                      <span style={{ color: appr.score > 0.7 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        {appr.score.toFixed(3)}
                      </span>
                    </TableCell>
                    <TableCell style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(appr.requested_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => approveMutation.mutate(appr.id)}
                          disabled={approveMutation.isPending}
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => rejectMutation.mutate(appr.id)}
                          disabled={rejectMutation.isPending}
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" style={{ color: 'var(--color-danger)' }} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </PageLayout>
    )
  }
  ```

- **Acceptance**:
  - Namespaces page shows flat list tab and tree tab with collapsible nodes
  - Memories page renders table; search input filters results live (query re-runs on value change with `placeholderData`)
  - Approvals table shows pending items; approve/reject buttons call correct endpoints; auto-refreshes every 15s; empty state shown when count = 0
- **Status**: [x] done

---

### Step 10: Wire everything in App.tsx + QueryClient + 401 interceptor
- **What**: Replace `src/App.tsx` with full router setup; wrap with all providers; add global 401 → logout interceptor
- **Why**: All pages, contexts, and providers must be assembled in one place; TanStack Query's `QueryClient` and React Router's `BrowserRouter` wrap the entire tree
- **Where**:
  - `src/App.tsx` — full replacement
  - `src/lib/api.ts` — minor: add optional `onUnauthorized` callback hook to `ApiClient`
- **How**:

  **401 interceptor pattern** — modify `src/lib/api.ts` private `request()` method to call a registered callback on 401:
  ```ts
  // At module level, above ApiClient class:
  let unauthorizedCallback: (() => void) | null = null
  export function setUnauthorizedCallback(cb: () => void) {
    unauthorizedCallback = cb
  }

  // Inside ApiClient.request(), after throwing:
  if (!res.ok) {
    const err = new ApiClientError(res.status, (body as ApiError).error || 'Unknown error')
    if (res.status === 401 && unauthorizedCallback) {
      unauthorizedCallback()
    }
    throw err
  }
  ```

  **`src/App.tsx`** — full replacement:
  ```tsx
  import { useEffect } from 'react'
  import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
  import { AuthProvider, useAuthContext } from '@/context/auth'
  import { ThemeProvider } from '@/context/theme'
  import { ProtectedRoute, PublicRoute } from '@/components/ProtectedRoute'
  import { setUnauthorizedCallback } from '@/lib/api'
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
          // Don't retry on 401/403
          if (error instanceof Error && 'status' in error) {
            const status = (error as { status: number }).status
            if (status === 401 || status === 403) return false
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
      return () => setUnauthorizedCallback(() => {})
    }, [logout])

    return (
      <Routes>
        {/* Public routes (redirect to /dashboard if already logged in) */}
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
  ```

  Also delete `src/App.css` (it's the Vite default, no longer needed) and remove its import from `App.tsx`.

- **Acceptance**:
  - `npm run dev` starts without errors
  - `npm run build` (TypeScript + Vite build) completes without errors
  - Navigating to `http://localhost:3000` redirects to `/login`
  - After pasting a valid token, redirects to `/dashboard`
  - Any 401 response auto-clears token and redirects to `/login`
  - All 8 routes render their page component
- **Status**: [x] done

---

### Step 11: Final polish — remove Vite defaults + smoke test
- **What**: Remove leftover Vite boilerplate files, fix any TypeScript linting issues, verify production build
- **Why**: Vite default assets and `App.css` must be removed; strict TypeScript may catch issues; build must be green before handoff
- **Where**:
  - `src/App.css` — delete
  - `src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png` — delete (if not used elsewhere)
  - All `.tsx` files — lint pass
- **How**:
  1. Delete `src/App.css`:
     ```bash
     rm src/App.css
     ```
  2. Remove imports of deleted files from any remaining references
  3. Run TypeScript check:
     ```bash
     npx tsc --noEmit
     ```
     Fix any errors (common: `noUnusedLocals`, missing return types, implicit `any` from event handlers — add `e: React.ChangeEvent<HTMLInputElement>` explicitly)
  4. Run ESLint:
     ```bash
     npm run lint
     ```
  5. Run production build:
     ```bash
     npm run build
     ```
  6. Preview the build:
     ```bash
     npm run preview
     ```
     Navigate to `http://localhost:4173` and verify login page loads without console errors

- **Acceptance**:
  - `npx tsc --noEmit` exits with code 0
  - `npm run lint` exits with code 0 (warnings only for react-refresh in context files — expected)
  - `npm run build` exits with code 0 and `dist/` is populated
  - Browser console shows no errors on login page, dashboard page, and at least 2 other pages
  - No hardcoded hex colors in any component file (all use `var(--*)` or Tailwind semantic tokens)
- **Status**: [x] done

---

## Verification

```bash
# TypeScript type check
npx tsc --noEmit

# ESLint
npm run lint

# Development server (requires backend at localhost:8080)
npm run dev
# → http://localhost:3000

# Production build
npm run build

# Preview production build
npm run preview
# → http://localhost:4173
```

### Manual smoke test checklist
- [ ] `/login` renders token input; invalid token shows error
- [ ] Valid token redirects to `/dashboard`; 5 stat cards visible
- [ ] `/organization` loads org name; save button patches correctly
- [ ] `/users` lists users; "Add User" creates one; dropdown patches role/status
- [ ] `/api-keys` lists keys; "Create Key" shows plaintext modal; revoke button works
- [ ] `/namespaces` toggles between list and tree views
- [ ] `/memories` shows table; search box filters results
- [ ] `/approvals` shows pending list; approve/reject buttons fire correct endpoints
- [ ] Dark mode toggle in header switches theme; preference persists on reload
- [ ] Logging out (sidebar button) clears token and redirects to `/login`
- [ ] Any 401 response (e.g., manually delete `neurox_token` in DevTools and reload) redirects to `/login`

---

## Risks / Notes

1. **shadcn + Tailwind v4 compatibility**: shadcn/ui's `init` may try to write a `tailwind.config.js` — decline if asked since this project uses the `@tailwindcss/vite` plugin (Tailwind v4 config-free). Verify `index.css` still has `@import "tailwindcss"` after init.

2. **CSS variable bridge**: shadcn components use tokens like `bg-primary`, `text-muted-foreground`. These require `@theme` entries in `index.css` mapping to the existing `--btn-primary-bg`, `--text-muted` etc. If shadcn components render without theme colors, check that the `@theme` block in Step 2 is applied.

3. **React 19 + `react-router-dom` v7**: Package.json lists `react: ^19.2.4` (not React 18 as mentioned in conventions). This is fine — React Router v7 supports React 19. No changes needed.

4. **`noUnusedLocals` + `noUnusedParameters`**: TypeScript strict config will error on unused imports. Import only what each component uses.

5. **`verbatimModuleSyntax`**: All type-only imports must use `import type { ... }` syntax.

6. **`lucide-react` v1.7.0**: Icon API uses named exports (e.g., `import { Brain } from 'lucide-react'`). This version is confirmed to exist and be installed.

7. **`api.me()` for auth validation**: The login flow calls `api.me()` to validate the pasted token. If the backend `/api/admin/me` returns a non-admin user, `me.is_admin === false` — consider adding a check in `login()` to reject non-admin tokens with a clear error message.

8. **Organization.tsx form state**: The `useState('')` for `name` needs a `useEffect` to populate from fetched org data. The code comment in Step 8 notes this — the executor must add `useEffect(() => { if (org) setName(org.name) }, [org])`.
