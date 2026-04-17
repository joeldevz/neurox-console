import { Moon, Sun, LogOut } from 'lucide-react'
import { useAuthContext } from '@/context/auth'
import { useTheme } from '@/context/theme'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title?: string
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  memory_manager: 'Memory Manager',
  member: 'Member',
}

export function Header({ title }: HeaderProps) {
  const { me, logout } = useAuthContext()
  const { theme, toggleTheme } = useTheme()

  return (
    <header
      className={cn(
        'sticky top-0 z-40 h-16 px-4 sm:px-6 lg:px-8',
        'flex items-center justify-between',
        'bg-surface-0/80 backdrop-blur-md border-b border-border-subtle'
      )}
    >
      {/* Logo + page title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
          <span className="text-text-inverse font-bold text-sm">N</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-text-tertiary uppercase tracking-widest leading-none">
            Neurox
          </p>
          {title && (
            <h1 className="text-sm font-semibold text-text-primary leading-tight truncate mt-0.5">
              {title}
            </h1>
          )}
        </div>
      </div>

      {/* Right: role badge + theme toggle + logout */}
      <div className="flex items-center gap-2">
        {me && (
          <>
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-[10px] text-text-tertiary uppercase tracking-widest">
                {ROLE_LABELS[me.role] ?? me.role}
              </span>
            </div>
          </>
        )}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className={cn(
            'w-9 h-9 rounded-md flex items-center justify-center',
            'text-text-secondary hover:text-text-primary hover:bg-surface-3',
            'transition-colors duration-150'
          )}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          type="button"
          onClick={logout}
          aria-label="Sign out"
          className={cn(
            'w-9 h-9 rounded-md flex items-center justify-center',
            'text-text-secondary hover:text-danger-400 hover:bg-surface-3',
            'transition-colors duration-150'
          )}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
