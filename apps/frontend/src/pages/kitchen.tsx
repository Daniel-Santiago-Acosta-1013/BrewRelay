import { AnimatePresence } from 'framer-motion'
import { ChefHat, Loader2, Coffee } from 'lucide-react'
import { useOrders, useUpdateOrderStatus } from '@/hooks/use-api'
import { useToast } from '@/components/ui/toast'
import { KitchenTicket } from '@/components/kitchen/kitchen-ticket'
import type { Order } from '@/types'

const COLUMNS = [
  { key: 'CREATED', title: 'Nuevos', empty: 'Sin pedidos nuevos.' },
  { key: 'PREPARING', title: 'Preparando', empty: 'Nada en preparación.' },
  { key: 'READY', title: 'Listos', empty: 'Nada listo todavía.' },
]

export function KitchenPage() {
  const { orders, loading } = useOrders()
  const { update, updating } = useUpdateOrderStatus()
  const toast = useToast()

  function handleAdvance(id: string, status: string) {
    update(id, status)
      .then(() => toast('success', `Pedido ${status === 'PREPARING' ? 'en preparación' : status === 'READY' ? 'listo' : 'entregado'} ✓`))
      .catch((err) => toast('error', `Error: ${(err as Error).message}`))
  }

  const byStatus = (status: string): Order[] => orders.filter((o) => o.status === status)

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <ChefHat className="h-7 w-7 text-primary" />
          Cocina
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pedidos reales del barista. Avanza el estado de cada uno.
        </p>
      </header>

      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Cargando pedidos…
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Coffee className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p className="text-sm text-muted-foreground">
            Sin pedidos todavía. El barista está esperando ☕
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {COLUMNS.map((col) => {
            const items = byStatus(col.key)
            return (
              <section key={col.key}>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {col.title}
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {items.length}
                  </span>
                </h2>
                {items.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    {col.empty}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {items.map((order) => (
                        <KitchenTicket
                          key={order.id}
                          order={order}
                          onAdvance={handleAdvance}
                          updating={updating}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}