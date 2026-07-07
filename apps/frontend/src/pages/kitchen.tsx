import { AnimatePresence } from 'framer-motion'
import { Bell, Loader2, ChefHat } from 'lucide-react'
import { useNotifications } from '@/hooks/use-api'
import { KitchenTicket } from '@/components/kitchen/kitchen-ticket'

export function KitchenPage() {
  const { notifications, loading } = useNotifications()

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <ChefHat className="h-7 w-7 text-primary" />
          Cocina
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pedidos llegando al barista en tiempo real.
        </p>
      </header>

      {loading && notifications.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Cargando…
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Bell className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p className="text-sm text-muted-foreground">
            Sin pedidos todavía. El barista está esperando ☕
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.map((n) => (
              <KitchenTicket key={n.id} notification={n} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}