# CONVENTIONS.md — neurox-console

> Living document for project standards. Update as patterns emerge.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | React 18+ | Functional components only |
| Bundler | Vite 6 | Fast HMR, ESM-first |
| Language | TypeScript | Strict mode, no `any` |
| Styling | Tailwind CSS v4 | Use CSS vars for theming |
| UI Library | shadcn/ui | Copy-paste components |
| Routing | React Router v7 | File-based or manual routes |
| Data Fetching | TanStack Query v5 | Cache, dedupe, background refresh |
| Icons | Lucide React | Consistent icon set |
| State | React Context + Query | No Redux/Zustand unless needed |

---

## Project Structure

```
src/
├── api/              # API client (fetch wrappers, types)
│   ├── client.ts     # Base fetch with auth
│   ├── org.ts        # Organization endpoints
│   ├── users.ts      # User endpoints
│   ├── keys.ts       # API key endpoints
│   ├── namespaces.ts # Namespace endpoints
│   ├── memories.ts   # Memory endpoints
│   ├── approvals.ts  # Approval endpoints
│   ├── dashboard.ts  # Dashboard stats
│   └── index.ts      # Re-exports
├── components/
│   ├── ui/           # shadcn/ui primitives (Button, Card, etc.)
│   └── layout/       # Sidebar, Header, PageLayout
├── context/          # React Context providers
│   ├── auth.tsx      # Auth state, login, logout
│   └── theme.tsx     # Light/dark mode toggle
├── hooks/            # Custom hooks
│   ├── useApi.ts     # Generic data fetching wrapper
│   └── useAuth.ts    # Auth helpers
├── lib/              # Utilities
│   └── utils.ts      # cn(), formatDate(), etc.
├── pages/            # Page components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Organization.tsx
│   ├── Users.tsx
│   ├── ApiKeys.tsx
│   ├── Namespaces.tsx
│   ├── Memories.tsx
│   └── Approvals.tsx
├── types/            # TypeScript types
│   └── api.ts        # All API response types
├── App.tsx           # Router + providers
├── main.tsx          # Entry point
└── index.css         # Global styles + CSS variables
```

---

## Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Components | PascalCase | `Sidebar.tsx`, `UserCard.tsx` |
| Hooks | camelCase, `use` prefix | `useAuth.ts`, `useApi.ts` |
| Utilities | camelCase | `formatDate()`, `cn()` |
| Types | PascalCase | `User`, `Memory`, `ApiResponse` |
| Files | kebab-case for pages | `api-keys.tsx` |
| CSS vars | `--color-*` | `--color-brand-500` |
| Tailwind classes | utility-first | `text-sm font-medium` |
| API endpoints | kebab-case | `/api/admin/api-keys` |

---

## Theming

All colors are defined as CSS variables in `src/index.css`. To change the entire theme:

1. Edit `--color-brand-*` for primary brand colors
2. Edit `--color-surface-*` for neutrals
3. Edit `--color-*` for semantic colors (success, warning, error, info)
4. Dark mode overrides automatic via `prefers-color-scheme` or `.dark` class

**Never hardcode colors in components.** Always use Tailwind classes that reference CSS variables:
- ✅ `bg-primary text-primary-foreground`
- ✅ `bg-card text-card-foreground`
- ✅ `text-muted-foreground`
- ❌ `bg-blue-500 text-white` (hardcoded)
- ❌ `text-gray-400` (hardcoded)

---

## Component Patterns

### shadcn/ui Components
Use shadcn/ui for: Button, Card, Input, Badge, Dialog, Select, Table, Toast, DropdownMenu.

```bash
npx shadcn@latest add button card input badge dialog
```

### Page Pattern
Every page follows:
```tsx
export default function PageName() {
  const { data, isLoading, error } = useQuery(...)

  return (
    <div className="space-y-6">
      <PageHeader title="..." description="..." />
      {/* Content */}
    </div>
  )
}
```

### Loading/Error Pattern
```tsx
if (isLoading) return <Skeleton className="h-48 w-full" />
if (error) return <ErrorMessage message={error.message} />
```

---

## API Client

- Base URL from env: `import.meta.env.VITE_API_URL`
- All requests go through `api/client.ts`
- Auth header injected automatically from localStorage
- Errors thrown as `ApiError` with status code

---

## Environment Variables

```bash
# .env.local
VITE_API_URL=http://localhost:8080
```

---

## Git Conventions

- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
- Branches: `feature/xxx`, `fix/xxx`, `chore/xxx`
- No direct commits to `main`
