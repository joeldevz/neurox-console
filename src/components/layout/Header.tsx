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
      className="flex items-center justify-between px-6 py-4 border-b shrink-0"
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
          <span
            className="text-xs px-2 py-1 rounded-md font-medium"
            style={{
              background: 'var(--bg-muted)',
              color: 'var(--text-secondary)',
            }}
          >
            {me.role}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>
      </div>
    </header>
  )
}
