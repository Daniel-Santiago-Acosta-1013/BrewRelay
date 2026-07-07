import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Bell,
  Coffee,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const items = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/new-order', icon: PlusCircle, label: 'Nueva orden' },
  { to: '/orders', icon: ClipboardList, label: 'Pedidos' },
  { to: '/notifications', icon: Bell, label: 'Notificaciones' },
]

function useIsActive(path: string) {
  const { pathname } = useLocation()
  return pathname === path
}

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col w-64 border-r border-border bg-card min-h-screen sticky top-0',
        className
      )}
    >
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <Coffee className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold tracking-tight">BrewRelay</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => (
          <NavLink key={item.to} {...item} />
        ))}
      </nav>
      <div className="px-6 py-4 text-xs text-muted-foreground border-t border-border">
        Outbox · Debezium · Kafka
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
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon className={cn('h-4 w-4', isActive ? 'text-primary-foreground' : '')} />
      {label}
    </Link>
  )
}

export function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
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
        'flex flex-col items-center gap-1 p-2 text-xs font-medium transition-colors rounded-lg',
        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label.split(' ')[0]}</span>
    </Link>
  )
}

export function TopBar() {
  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2">
        <Coffee className="h-5 w-5 text-primary" />
        <span className="font-bold tracking-tight">BrewRelay</span>
      </div>
      <Button variant="ghost" size="icon" asChild>
        <Link to="/new-order">
          <PlusCircle className="h-5 w-5" />
        </Link>
      </Button>
    </header>
  )
}
