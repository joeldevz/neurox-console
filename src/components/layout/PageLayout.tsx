import type { ReactNode } from 'react'
import { FloatingDock } from './FloatingDock'
import { Header } from './Header'
import { useAuthContext } from '@/context/auth'
import { cn } from '@/lib/utils'

interface PageLayoutProps {
  children: ReactNode
  title?: string
  /** Optional description (deprecated, kept for backward compatibility) */
  description?: string
  /** Optional right-side contextual panel (30% width on desktop) */
  panel?: ReactNode
  /** Force full-width layout (no panel even if provided) */
  fullWidth?: boolean
}

export function PageLayout({ children, title, panel, fullWidth = false }: PageLayoutProps) {
  const { me } = useAuthContext()
  const isAdmin = me?.role === 'owner' || me?.role === 'admin' || me?.role === 'memory_manager'

  const showPanel = panel && !fullWidth

  return (
    <div className="min-h-screen bg-surface-0">
      <Header title={title} />

      <main
        className={cn(
          'mx-auto px-4 sm:px-6 lg:px-8',
          'pt-8 pb-24 lg:pt-12',
          'max-w-[1400px]',
          showPanel && 'lg:flex lg:gap-6 lg:items-start'
        )}
      >
        <div className={cn('min-w-0', showPanel && 'lg:flex-[0.7]')}>
          {children}
        </div>
        {showPanel && (
          <aside className="hidden lg:block lg:flex-[0.3] lg:min-w-[280px] lg:sticky lg:top-20">
            {panel}
          </aside>
        )}
      </main>

      <FloatingDock isAdmin={isAdmin} />
    </div>
  )
}
