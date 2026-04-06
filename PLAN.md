# Plan: Admin namespace, organization, and org-memory frontend exposure

## Goal
Close the admin frontend gap around namespace management, company-level organization information, and org-shared memories by reusing the frontend shell that already exists and adding the missing management UX, capability handling, and fallback states.

## Business Context
- Admins must be able to understand that namespaces represent both engineering projects and non-engineering business areas.
- Organization settings must expose company-level information distinctly from system metadata.
- Org-shared memories must be clearly browseable, and the UI must explain whether org-memory creation is available or currently unsupported.
- Silent omission is not acceptable: when backend/client support is missing, the page must say so explicitly.

## Technical Context
- `src/App.tsx` already routes `/organization`, `/namespaces`, and `/memories`; `src/components/layout/Sidebar.tsx` already exposes those links.
- `src/lib/api.ts` already includes `getOrg()`, `patchOrg(data)`, `listNamespaces()`, `getNamespaceTree()`, `createNamespace(data)`, `patchNamespace(id, data)`, `listMemories(params)`, `getMemory(id)`, and `searchMemories(data)`.
- `src/lib/api.ts` does **not** currently expose an admin `createMemory(...)` or `patchMemory(...)` method, so org-memory browsing exists but org-memory creation is not wired from this repo.
- `src/pages/Namespaces.tsx` is browse-only (list/tree) even though the API client already supports create/edit.
- `src/pages/Organization.tsx` only edits `org.name`; it does not surface company-info fields from `org.settings` or explain unsupported fields.
- `src/pages/Memories.tsx` already supports `visibility` filtering, including `org`, and already renders org memories; the missing gap is create-action exposure and capability messaging.
- `npm run build` succeeds in the current repo, so the primary gap is frontend management UX/capability exposure, not missing routes or a broken build artifact.
- No test runner is configured in `package.json`; verification for this task must use `npm run build` plus manual smoke checks.

## Implementation Steps

### Step 1: Add an explicit frontend capability matrix for admin knowledge-management features
- **What**: Add a small capability layer so the UI can state what is supported now vs. what is unavailable in the current client.
- **Why**: The current pages fail silently; admins cannot tell whether a feature is unsupported or simply hidden.
- **Where**:
  - `src/lib/adminCapabilities.ts` — new file
  - `src/types/api.ts` — add focused helper types only if needed by the new capability layer
  - `src/lib/api.ts` — only modify if a verified admin memory-create endpoint is found during implementation
- **How**:
  1. Create `src/lib/adminCapabilities.ts` with these exact exports:
     ```ts
     export interface FeatureCapability {
       supported: boolean
       reason?: string
     }

     export interface AdminCapabilities {
       namespaceCreate: FeatureCapability
       namespaceEdit: FeatureCapability
       orgProfileEdit: FeatureCapability
       orgMemoryCreate: FeatureCapability
     }

     export function getAdminCapabilities(): AdminCapabilities
     ```
  2. Implement `getAdminCapabilities()` from the current repo state, not guesses:
     - `namespaceCreate.supported = true` because `api.createNamespace(...)` exists in `src/lib/api.ts`.
     - `namespaceEdit.supported = true` because `api.patchNamespace(...)` exists.
     - `orgProfileEdit.supported = true` because `api.patchOrg(...)` exists, but company-profile editing remains schema-dependent.
     - `orgMemoryCreate.supported = false` by default because no admin create-memory client method exists in `src/lib/api.ts` right now.
     - Use the exact fallback reason for org memory creation: `"Admin memory creation is not implemented in src/lib/api.ts yet."`
  3. If implementation discovery finds a real backend endpoint for admin memory creation, add this exact method to `src/lib/api.ts` and then flip `orgMemoryCreate.supported` to `true`:
     ```ts
     async createMemory(data: {
       namespace: string
       title: string
       content: string
       kind: Memory['kind']
       observation_type: string
       visibility: Memory['visibility']
       tags?: string[]
       files?: string[]
     }): Promise<Memory>
     ```
     Do **not** add this method unless the endpoint is verified first.
- **Acceptance**:
  - The repo has one source of truth for feature support.
  - The UI can distinguish “supported but not yet surfaced” from “unsupported by current client”.
  - Org-memory creation is explicitly marked unsupported unless a verified client method exists.
- **Status**: [x] done

### Step 2: Convert `Namespaces` from browse-only into a management page
- **What**: Add create/edit namespace UI on top of the already-working list/tree views.
- **Why**: The API client already supports namespace create/edit, so this is a UI exposure gap rather than a backend/client gap.
- **Where**:
  - `src/pages/Namespaces.tsx`
  - `src/components/namespaces/NamespaceFormDialog.tsx` — new file
  - `src/components/namespaces/NamespaceEmptyState.tsx` — new file
- **How**:
  1. Create `src/components/namespaces/NamespaceFormDialog.tsx` with this exact prop contract:
     ```ts
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
     ```
  2. In `src/pages/Namespaces.tsx`, keep the existing list/tree queries and add:
     - a primary `Create namespace` button in the page header area;
     - an `Edit` action per row in list view;
     - an empty state that says namespaces can represent projects or business areas such as marketing.
  3. Populate `parentOptions` from `listQuery.data?.namespaces`, using `path` as the submitted `parent_path` value.
  4. Use the existing client methods exactly as follows:
     - create: `api.createNamespace({ name, parent_path, node_type })`
     - edit: `api.patchNamespace(namespace.id, { name, parent_path, node_type })`
  5. In the form copy, map backend `department` to business-area language:
     - `project` → “Project namespace”
     - `team` → “Team namespace”
     - `department` → “Business area / department namespace”
  6. After successful create/edit, invalidate both queries:
     ```ts
     queryClient.invalidateQueries({ queryKey: ['namespaces'] })
     queryClient.invalidateQueries({ queryKey: ['namespaces-tree'] })
     ```
  7. If `getAdminCapabilities().namespaceCreate.supported === false`, still render the CTA but disable it and show the capability reason instead of hiding it.
- **Acceptance**:
  - Admins see a visible create action on `/namespaces`.
  - A namespace can be created with `name`, optional `parent_path`, and `node_type` using the existing API client.
  - Existing namespaces can be edited from the UI.
  - Empty-state copy makes it clear namespaces cover both projects and business areas.
  - Unsupported states are disabled-with-reason, not omitted.
- **Status**: [x] done

### Step 3: Expand `Organization` into company-info + system-metadata sections
- **What**: Separate editable company information from read-only org metadata and make the unsupported state explicit when structured company fields are absent.
- **Why**: The current page only edits `org.name`, so admins cannot manage company-level information from the frontend.
- **Where**:
  - `src/pages/Organization.tsx`
  - `src/lib/orgCompanyInfo.ts` — new file
- **How**:
  1. Create `src/lib/orgCompanyInfo.ts` with these exact exports:
     ```ts
     import type { Org } from '@/types/api'

     export interface OrgCompanyInfoDraft {
       display_name: string
       legal_name: string
       description: string
       website: string
     }

     export interface OrgCompanyInfoState {
       editable: boolean
       reason?: string
       draft: OrgCompanyInfoDraft
     }

     export function deriveOrgCompanyInfoState(org: Org): OrgCompanyInfoState
     export function buildOrgCompanyInfoPatch(org: Org, draft: OrgCompanyInfoDraft): Partial<Org>
     ```
  2. Implement `deriveOrgCompanyInfoState(org)` conservatively:
     - if `org.settings.company_info` exists and is a plain object, map its `display_name`, `legal_name`, `description`, and `website` keys into the returned draft and set `editable: true`;
     - otherwise return an empty draft with `editable: false` and reason `"Structured company info is not present in the current org payload."`
  3. Implement `buildOrgCompanyInfoPatch(org, draft)` to preserve existing settings and only update the existing `company_info` object:
     ```ts
     return {
       settings: {
         ...org.settings,
         company_info: {
           ...(((org.settings as Record<string, unknown>).company_info as Record<string, unknown>) ?? {}),
           display_name: draft.display_name,
           legal_name: draft.legal_name,
           description: draft.description,
           website: draft.website,
         },
       },
     }
     ```
     Only use this patch path when `editable === true`.
  4. Refactor `src/pages/Organization.tsx` into two cards:
     - `Company Information` card:
       - editable form when `editable === true`;
       - disabled/read-only fallback with the returned reason when `editable === false`.
     - `System Metadata` card:
       - show `org.name`, `org.slug`, `org.status`, `org.created_at`, `org.updated_at` as read-only.
  5. Keep the existing `api.patchOrg(...)` mutation, but submit `buildOrgCompanyInfoPatch(org, draft)` instead of only `{ name }` when company info is editable.
  6. Preserve toast behavior (`toast.success`, `toast.error`) already used in the file.
- **Acceptance**:
  - `/organization` visibly separates company info from system metadata.
  - If `org.settings.company_info` exists, admins can edit and save those fields through `api.patchOrg(...)`.
  - If the payload has no structured company info, the page still explains that limitation instead of appearing incomplete.
  - The existing org name/slug/status metadata remains visible.
- **Status**: [x] done

### Step 4: Make org-memory support explicit on the Memories page
- **What**: Keep the existing browsing UI, but add org-shared empty states and a visible create action that is either enabled or explicitly unavailable.
- **Why**: Org-memory browsing already exists; the missing part is management visibility and clear capability messaging.
- **Where**:
  - `src/pages/Memories.tsx`
  - `src/components/memories/MemoriesEmptyState.tsx` — new file
  - `src/components/memories/CreateMemoryDialog.tsx` — only create this file if Step 1 confirms a real `api.createMemory(...)` method
- **How**:
  1. Keep the existing `visibility` select, but add a header action area to `src/pages/Memories.tsx` with:
     - a quick-action button labeled `New shared memory`;
     - an inline caption that explains org memories are visible company-wide.
  2. When `visibility === 'org'` and the result set is empty, render a specific empty state message: `"No organization-shared memories yet."`
  3. Drive the create button from `getAdminCapabilities().orgMemoryCreate`:
     - if supported: open `CreateMemoryDialog` and submit with `visibility: 'org'`;
     - if unsupported: render the button disabled and show the exact capability reason from Step 1.
  4. Do **not** invent a local-only create workflow. If `api.createMemory(...)` does not exist, the page must stop at disabled CTA + explanation.
  5. If Step 1 verifies `api.createMemory(...)`, create `src/components/memories/CreateMemoryDialog.tsx` with this exact prop contract:
     ```ts
     interface CreateMemoryDialogProps {
       open: boolean
       onOpenChange: (open: boolean) => void
       defaultVisibility: 'org'
       namespaceOptions: Array<{ label: string; value: string }>
       onSubmit: (input: {
         namespace: string
         title: string
         content: string
         kind: Memory['kind']
         observation_type: string
         visibility: 'org'
       }) => Promise<void>
     }
     ```
  6. Leave the existing detail dialog and table rendering in place; this step is additive.
- **Acceptance**:
  - Org memories remain browseable via the existing visibility filter.
  - The page now exposes a visible org-memory create affordance.
  - If creation is unsupported in the current client, the disabled action explains why.
  - If creation is later verified and implemented, org memories can be created with `visibility: 'org'` from the frontend.
- **Status**: [x] done

### Step 5: Smoke-verify the admin flows that already exist vs. the ones being added
- **What**: Validate the final admin experience end to end.
- **Why**: This task is primarily about missing UI exposure, so manual path verification matters more than unit coverage in this repo.
- **Where**:
  - `src/App.tsx`
  - `src/components/layout/Sidebar.tsx`
  - `src/pages/Organization.tsx`
  - `src/pages/Namespaces.tsx`
  - `src/pages/Memories.tsx`
- **How**:
  1. Run:
     ```bash
     npm run build
     npm run dev
     ```
  2. Log in with an admin token and verify that the sidebar links already navigate to `Organization`, `Namespaces`, and `Memories`.
  3. On `/namespaces`, verify:
     - create CTA is visible;
     - create/edit flows submit through the existing API client;
     - tree/list refresh after mutation.
  4. On `/organization`, verify both branches:
     - if `org.settings.company_info` is present, editing works;
     - if absent, the page shows the unsupported/read-only explanation.
  5. On `/memories`, verify:
     - `org` visibility filter returns org-shared results when available;
     - empty-state copy is specific when no org memories exist;
     - create action is either enabled and working or disabled with the capability reason.
  6. Confirm there is no page where a management feature disappears without explanation.
- **Acceptance**:
  - `npm run build` still succeeds.
  - Namespaces and organization pages expose management UI instead of browse-only surfaces.
  - Org-memory support is explicit, whether enabled or unavailable.
  - The admin can understand current product capability without guessing.
- **Status**: [x] done

## Verification

```bash
npm run build
npm run dev
```

### Manual checks
- [ ] Sidebar routes to `Organization`, `Namespaces`, and `Memories`
- [ ] `/namespaces` shows create/edit management actions
- [ ] `/namespaces` explains that namespaces can represent projects or business areas
- [ ] `/organization` separates company info from system metadata
- [ ] `/organization` shows explicit unsupported/read-only messaging when company-info fields are absent
- [ ] `/memories` can browse `org` visibility distinctly
- [ ] `/memories` shows a visible create affordance with either working flow or disabled explanation
- [ ] No admin management area fails silently

## Risks / Notes
- The current repo confirms namespace create/edit support in the API client, so missing namespace management is a frontend exposure problem.
- The current repo confirms org-memory browsing but does **not** confirm org-memory creation support in the API client; this remains the main blocker for a fully working create flow.
- The current repo confirms generic org patching, but it does **not** define a typed company-profile schema; implementation must only enable structured editing when `org.settings.company_info` is actually present in the live payload.
- The user-reported “no visual UI” is not reproducible from static code inspection alone because the routes/pages are already registered and the project builds successfully; if that symptom persists during execution, it likely comes from runtime data/auth/environment behavior and should be checked in-browser during Step 5.
