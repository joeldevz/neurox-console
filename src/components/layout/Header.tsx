import { Moon, Sun, LogOut, ChevronRight } from 'lucide-react'
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
        'sticky top-0 z-40 h-14',
        'flex items-center justify-between',
        'bg-surface-0/80 backdrop-blur-md border-b border-border-subtle'
      )}
    >
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: brand + breadcrumb */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-md bg-brand-500 flex items-center justify-center shrink-0 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_2px_6px_rgba(124,106,247,0.25)]">
            <span className="text-text-inverse font-bold text-[11px] leading-none">N</span>
          </div>
          <span className="text-sm font-semibold text-text-primary tracking-tight">Neurox</span>
          {title && (
            <>
              <ChevronRight size={14} className="text-text-tertiary mx-0.5" />
              <span className="text-sm text-text-secondary truncate">{title}</span>
            </>
          )}
        </div>

        {/* Right: user + actions */}
        <div className="flex items-center gap-1">
          {me && (
            <div className="hidden sm:flex items-center gap-2 mr-2 pr-3 border-r border-border-subtle">
              <div className="w-7 h-7 rounded-full bg-surface-3 border border-border-subtle flex items-center justify-center">
                <span className="text-[11px] font-semibold text-text-primary">
                  {(me.user_id?.charAt(0) ?? 'U').toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] text-text-tertiary uppercase tracking-widest">
                  {ROLE_LABELS[me.role] ?? me.role}
                </span>
                <span className="text-xs text-text-primary font-medium truncate max-w-[160px]">
                  {me.user_id.slice(0, 8)}…
                </span>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className={cn(
              'w-8 h-8 rounded-md flex items-center justify-center',
              'text-text-tertiary hover:text-text-primary hover:bg-surface-3',
              'transition-colors duration-150'
            )}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button
            type="button"
            onClick={logout}
            aria-label="Sign out"
            className={cn(
              'w-8 h-8 rounded-md flex items-center justify-center',
              'text-text-tertiary hover:text-danger-400 hover:bg-surface-3',
              'transition-colors duration-150'
            )}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  )
}
