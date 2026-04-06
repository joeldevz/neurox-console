# SPEC.md — Admin namespace and organization knowledge management gap

## Goal
Add clear admin-facing frontend support for managing shared knowledge structures that already exist in the product model: namespaces for projects and non-engineering business areas, organization-level company information, and organization-wide shared memories. This matters because admins currently cannot tell whether these capabilities are unsupported or simply hidden, which blocks setup, governance, and shared knowledge adoption across the company.

## Users
- **Primary:** Organization admins and owners configuring the workspace and shared knowledge model.
- **Secondary:** Memory managers who may browse shared knowledge depending on backend permissions.
- **Indirectly affected:** All members who rely on correctly structured namespaces and organization-wide information being visible in the right scope.

## Behavior
- The admin console presents namespaces as managed collaboration spaces, not only engineering projects but also business areas such as marketing, operations, or leadership.
- An admin can create a new namespace from the UI, choosing a name and, when supported, a parent location and namespace type so the namespace can represent either a project or a broader area.
- The namespaces area makes creation and edit actions visible and discoverable. Existing list/tree browsing remains available, but management actions are no longer hidden behind API-only support.
- The organization area lets an admin view and edit company-level information that defines the shared organization identity. At minimum, the UI clearly separates editable company information from read-only system metadata.
- The memories area lets an admin browse organization-shared memories distinctly from personal and namespace memories.
- The admin can create a new shared memory at **org** visibility from the frontend when backend capability exists.
- If backend capability for create or update is unavailable, the UI still shows the intended action and explains why it cannot be completed (for example: unsupported endpoint, insufficient permissions, or feature not yet enabled), instead of silently omitting the workflow.
- Empty states explain what each area is for:
  - no namespaces yet → explain namespaces can represent projects or business areas and provide a create action when allowed;
  - no organization information yet → explain company-level information is shared at org scope and provide an edit/setup action when allowed;
  - no org memories yet → explain org memories are visible company-wide and provide a create action when allowed.

## Acceptance Criteria
- **Namespace creation visibility:** Given an admin opens the namespaces area, when management capabilities are available, then they see a clear action to create a namespace.
- **Namespace model clarity:** Given an admin is creating a namespace, when they review the form, then the UI makes it clear namespaces may represent projects or non-engineering business areas.
- **Namespace fallback:** Given namespace creation is not supported by the backend or current auth, when the admin attempts to create one, then the UI explains the limitation and does not leave the admin guessing.
- **Organization information management:** Given an admin opens organization settings, when company-level fields are supported, then they can view and edit organization information beyond read-only metadata.
- **Organization fallback:** Given company-level fields are not supported for editing, when the admin views organization settings, then the UI labels those fields as unavailable or read-only with a clear reason.
- **Org memory browsing:** Given an admin opens memories, when org-scoped memories exist, then they can filter or browse organization-shared memories distinctly from personal and namespace memories.
- **Org memory creation:** Given the backend supports memory creation and the admin has permission, when they create a memory with org visibility, then the memory is saved as organization-shared and is visible in org browsing flows.
- **Org memory creation fallback:** Given org memory creation is not available, when the admin looks for or starts that workflow, then the UI communicates that the backend capability is missing or disabled.
- **Permission clarity:** Given a non-admin or otherwise restricted user opens these areas, when they lack management rights, then management actions are hidden or disabled and the page remains understandable in read-only mode.

## Edge Cases
- The backend exposes list/read endpoints but not create/update endpoints for one or more areas.
- The backend supports namespace creation but restricts available node types, parent paths, or ownership assignment.
- Organization data exists only partially, with some fields editable and others system-managed.
- Org memories exist but the current user can browse them without being allowed to create them.
- There are zero namespaces, zero org memories, or effectively blank company information on first setup.
- API capability checks fail due to auth, network errors, or unexpected response shapes; the UI should show explicit failure states rather than appearing empty.
- Concurrent edits cause stale data; the admin should see refreshed values or a conflict-oriented error rather than assuming a save succeeded.

## Out of Scope
- Backend implementation or schema changes.
- Final technical design, routing, component structure, or API integration details.
- Automatic promotion of memories between personal, namespace, and org scopes.
- Full organization profile modeling beyond defining that company-level information must be visible and manageable from the frontend.
