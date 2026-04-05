import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  Key,
  FolderTree,
  Brain,
  CheckSquare,
  LogOut,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

const NAV_ITEMS = [
  { to: '/portal', icon: User, label: 'My Portal' },
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
      className="flex flex-col w-64 min-h-screen shrink-0"
      style={{ background: 'var(--bg-sidebar)' }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2 px-6 py-5 border-b"
        style={{ borderColor: 'var(--bg-sidebar-hover)' }}
      >
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
                isActive ? 'text-white' : ''
              )
            }
            style={({ isActive }) => ({
              background: isActive ? 'var(--bg-sidebar-active)' : 'transparent',
              color: isActive ? 'var(--text-sidebar-active)' : 'var(--text-sidebar)',
            })}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--bg-sidebar-hover)' }}>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors"
          style={{ color: 'var(--text-sidebar)', background: 'transparent' }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-inverse)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-sidebar)'
          }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
