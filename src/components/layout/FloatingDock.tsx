import { NavLink } from 'react-router-dom'
import {
  Home, Boxes, Brain, Users, Key, CheckSquare, Plug, User,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = {
  to: string
  icon: React.ElementType
  label: string
  adminOnly: boolean
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: '/dashboard',       icon: Home,        label: 'Dashboard',    adminOnly: true  },
  { to: '/organization',    icon: Building2,   label: 'Organization', adminOnly: true  },
  { to: '/namespaces',      icon: Boxes,       label: 'Namespaces',   adminOnly: true  },
  { to: '/memories',        icon: Brain,       label: 'Memories',     adminOnly: true  },
  { to: '/users',           icon: Users,       label: 'Users',        adminOnly: true  },
  { to: '/api-keys',        icon: Key,         label: 'API Keys',     adminOnly: true  },
  { to: '/approvals',       icon: CheckSquare, label: 'Approvals',    adminOnly: true  },
  { to: '/connect-claude',  icon: Plug,        label: 'Connect Claude', adminOnly: false },
  { to: '/portal',          icon: User,        label: 'My Portal',    adminOnly: false },
] as const

interface FloatingDockProps {
  isAdmin?: boolean
}

export function FloatingDock({ isAdmin = false }: FloatingDockProps) {
  const items = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin)

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-1 px-3 py-2',
        'bg-surface-3 border border-border-subtle rounded-full',
        'shadow-[0_8px_32px_rgba(0,0,0,0.6)]',
        'backdrop-blur-sm',
        // Responsive: smaller padding on mobile, scroll on overflow
        'max-w-[calc(100vw-24px)] overflow-x-auto',
      )}
    >
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          title={label}
          aria-label={label}
          className={({ isActive }) =>
            cn(
              'flex items-center justify-center w-10 h-10 rounded-full shrink-0',
              'text-text-tertiary transition-colors duration-150',
              'hover:text-text-primary hover:bg-surface-4',
              'focus-visible:outline-2 focus-visible:outline-brand-400 focus-visible:outline-offset-2',
              isActive && 'text-brand-400 bg-surface-4'
            )
          }
        >
          <Icon size={20} strokeWidth={1.5} />
        </NavLink>
      ))}
    </nav>
  )
}
