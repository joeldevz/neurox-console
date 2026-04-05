import { type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface PageLayoutProps {
  title: string
  description?: string
  children: ReactNode
}

export function PageLayout({ title, description, children }: PageLayoutProps) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header title={title} description={description} />
        <main className="flex-1 p-6 space-y-6">{children}</main>
      </div>
    </div>
  )
}
