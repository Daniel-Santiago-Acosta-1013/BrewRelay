import { Link, useLocation } from 'react-router-dom'
import { Coffee, ChefHat, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { to: '/', icon: Coffee, label: 'Carta' },
  { to: '/kitchen', icon: ChefHat, label: 'Cocina' },
  { to: '/how-it-works', icon: Info, label: 'Cómo funciona' },
]

function useIsActive(path: string) {
  const { pathname } = useLocation()
  return pathname === path
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex sticky top-0 h-screen w-64 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-6 py-5">
        <Coffee className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold tracking-tight">BrewRelay</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => (
          <NavLink key={item.to} {...item} />
        ))}
      </nav>
      <div className="border-t border-border px-6 py-4 text-xs text-muted-foreground">
        Pedidos de café de punta a punta
      </div>
    </aside>
  )
}

function NavLink({
  to,
  icon: Icon,
  label,
}: {
  to: string
  icon: React.ElementType
  label: string
}) {
  const isActive = useIsActive(to)
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      )}
    >
      <Icon className={cn('h-4 w-4', isActive ? 'text-primary-foreground' : '')} />
      {label}
    </Link>
  )
}

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card lg:hidden">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => (
          <MobileNavLink key={item.to} {...item} />
        ))}
      </div>
    </nav>
  )
}

function MobileNavLink({
  to,
  icon: Icon,
  label,
}: {
  to: string
  icon: React.ElementType
  label: string
}) {
  const isActive = useIsActive(to)
  return (
    <Link
      to={to}
      className={cn(
        'flex flex-col items-center gap-1 rounded-lg p-2 text-xs font-medium transition-colors',
        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label.split(' ')[0]}</span>
    </Link>
  )
}

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
      <div className="flex items-center gap-2">
        <Coffee className="h-5 w-5 text-primary" />
        <span className="font-bold tracking-tight">BrewRelay</span>
      </div>
    </header>
  )
}