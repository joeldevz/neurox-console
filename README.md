# Neurox Console

Admin dashboard for [Neurox](https://github.com/joeldevz/neurox) — the brain-inspired persistent memory system for AI agents.

## Stack

- React 18 + Vite 6 + TypeScript (strict)
- Tailwind CSS v4 + shadcn/ui
- TanStack Query v5
- React Router v7
- Lucide React icons

## Getting Started

### 1. Clone and install
```bash
git clone https://github.com/joeldevz/neurox-console
cd neurox-console
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
# Edit VITE_API_URL to point to your Neurox backend
```

### 3. Run dev server
```bash
npm run dev
# Opens at http://localhost:3000
```

### 4. Login
Go to `http://localhost:3000` — you'll see the login screen.  
Paste your **Neurox admin API key** (starts with `nrx_`) and click **Sign in**.

## Features

| Section | What you can do |
|---------|----------------|
| Dashboard | See live stats: users, namespaces, memories, pending approvals, API keys |
| Organization | View and edit org name |
| Users | List users, invite new ones, change role/status |
| API Keys | Create keys, view prefix, revoke — plaintext shown once on creation |
| Namespaces | Browse flat list or collapsible tree |
| Memories | Search and filter all stored memories, click to view full content |
| Approvals | Review pending cross-namespace memory promotions |

## Development

```bash
npm run build    # Production build
npm run preview  # Preview production build locally
```

## License
MIT
