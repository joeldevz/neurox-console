# neurox-console — Full Refactor PLAN

**Version**: 2.0 (replaces earlier org/namespace plan)
**Started**: 2026-04-17
**Status**: In Progress

Full frontend refactor: Fey-inspired dark-first design system + 22 tech debt items + feature gaps.
Spec of truth: `DESIGN_SYSTEM.md`.

---

## Execution Strategy (Wave-Based Parallel)

```
WAVE 1 (parallel, independent)
  Step 1 — Design tokens in index.css (purple, dark-first, @theme bridge)
  Step 2 — Shared constants module (KIND_COLORS, VISIBILITY_STYLES, ROLE_COLORS)
  Step 3 — Cleanup 'use client', useAuth.ts, date locale, index.html title

WAVE 2 (parallel, depends on Step 1)
  Step 4 — Floating dock + new PageLayout + responsive
  Step 5 — Toaster repositioned + ErrorBoundary + JWT expiry

WAVE 3 (depends on Step 2)
  Step 6 — UI primitives: inline styles → Tailwind utilities; fix badge/sonner

WAVE 4 (parallel, depends on Waves 2 + 3)
  Step 7 — Dashboard + Organization
  Step 8 — Users + ApiKeys
  Step 9 — Memories + Namespaces + Approvals
  Step 10 — UserPortal + ConnectClaude + Login

WAVE 5
  Verification — lint + build
```

---

## Steps

- [ ] **Step 1** — Rewrite `src/index.css` with new dark-first tokens + `@theme` bridge for Tailwind v4
- [ ] **Step 2** — Create `src/lib/constants.ts` with shared KIND_COLORS / VISIBILITY_STYLES / ROLE_COLORS / STATUS_COLORS
- [ ] **Step 3** — Cleanup: remove `'use client'` from all non-Next.js files; fold `useAuth.ts` into `context/auth.tsx`; dynamic `<title>` in `index.html`; configurable date locale in `utils.ts`
- [ ] **Step 4** — Create `FloatingDock.tsx`, rewrite `PageLayout.tsx` (minimal header + floating dock + 2-col content), delete `Sidebar.tsx`, ensure responsive
- [ ] **Step 5** — Move `<Toaster>` inside `<ThemeProvider>`; add `ErrorBoundary` in `App.tsx`; add JWT `exp` inspection in `context/auth.tsx` + proactive logout
- [ ] **Step 6** — Migrate all `src/components/ui/*.tsx`: inline `style={{ color: var(--..) }}` → Tailwind utility classes; fix `badge.tsx` `<div>` → `<span>`; clean `sonner.tsx` wrapper
- [ ] **Step 7** — Redesign `Dashboard.tsx` + `Organization.tsx`: Fey stat cards, quick actions, status badge, description → Textarea
- [ ] **Step 8** — Redesign `Users.tsx` + `ApiKeys.tsx`: confirm dialogs on destructive, `isPending` per-row, full role dropdown, API key role/scope/expiry, search
- [ ] **Step 9** — Redesign `Memories.tsx` + `Namespaces.tsx` + `Approvals.tsx`: debounce search, namespace filter as dropdown, approval comments + history tab, namespace delete with confirm
- [ ] **Step 10** — Redesign `UserPortal.tsx` + `ConnectClaude.tsx` + `Login.tsx`: self-service actions, accessible error alerts (`role="alert"`), OAuth token revoke

---

## Tech Debt Mapping

| # | Debt item | Addressed in step |
|---|-----------|-------------------|
| DT-01 | No tests | deferred — P2 backlog |
| DT-02 | JWT expiry | 5 |
| DT-03 | Pagination hardcoded | 7, 8, 9, 10 |
| DT-04 | No ErrorBoundary | 5 |
| DT-05 | CSS vars vs Tailwind inconsistency | 1, 6, 7–10 |
| DT-06 | Duplicated VISIBILITY_STYLES / KIND_COLORS | 2, 9, 10 |
| DT-07 | No responsive | 4 |
| DT-08 | Capability system hardcoded | deferred — backend contract |
| DT-09 | Search no debounce | 9 |
| DT-10 | `'use client'` everywhere | 3 |
| DT-11 | CONVENTIONS.md stale | noted |
| DT-12 | Date locale | 3 |
| DT-13 | No destructive confirm | 8, 9 |
| DT-14 | `isPending` affects all rows | 8, 9 |
| DT-15 | Description input→Textarea | 7 |
| DT-16 | Toaster outside providers | 5 |
| DT-17 | `ui/sonner.tsx` broken | 6 |
| DT-18 | `useAuth.ts` indirection | 3 |
| DT-19 | `index.html` generic title | 3 |
| DT-20 | Sidebar DOM hover hack | 4 (sidebar removed) |
| DT-21 | Missing aria labels | 4, 6, 8, 9, 10 |
| DT-22 | Hidden field in OrgCompanyInfoState | 7 |

---

## Verification (after all steps)

1. `npm run lint` → 0 errors
2. `npm run build` → PASS, bundle size reasonable
3. Smoke: `npm run dev` → dashboard + 2 pages render, floating dock works, dark mode correct
