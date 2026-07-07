import { Outlet } from 'react-router-dom'
import { Sidebar, MobileNav, TopBar } from '@/components/layout/nav'
import { useHealth } from '@/hooks/use-api'
import { cn } from '@/lib/utils'

export function Layout() {
  const healthy = useHealth()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar />
        <div
          className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 pb-24 lg:pb-8"
        >
          <Outlet />
        </div>
        <footer className="hidden lg:flex items-center justify-between border-t border-border bg-card px-6 py-3 text-xs text-muted-foreground">
          <span>BrewRelay — pedidos de café de punta a punta</span>
          <span className="flex items-center gap-2">
            <span
              className={cn(
                'inline-block h-2 w-2 rounded-full',
                healthy === null && 'bg-muted-foreground',
                healthy === true && 'bg-emerald-500',
                healthy === false && 'bg-destructive'
              )}
            />
            API {healthy === null ? 'verificando…' : healthy ? 'en línea' : 'caída'}
          </span>
        </footer>
      </div>
      <MobileNav />
    </div>
  )
}
