import { ClipboardList, RefreshCw, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useOrders } from '@/hooks/use-api'
import { cn } from '@/lib/utils'

const statusMap: Record<string, string> = {
  pending: 'Pendiente',
  preparing: 'Preparando',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30',
  preparing: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  ready: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  delivered: 'bg-primary/15 text-primary border-primary/30',
  cancelled: 'bg-destructive/15 text-destructive border-destructive/30',
}

export function OrdersPage() {
  const { orders, loading, error, reload } = useOrders()

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            Pedidos
          </h1>
          <p className="text-muted-foreground mt-1">
            Lista de pedidos recibidos y su estado actual.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={reload} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
          Refrescar
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 p-4 text-destructive mb-4">
          No se pudieron cargar los pedidos: {error}
        </div>
      )}

      <div className="grid gap-4">
        {loading && orders.length === 0 && (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Cargando pedidos…
          </div>
        )}

        {!loading && orders.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Sin pedidos todavía. Crea el primero desde "Nueva orden".
            </CardContent>
          </Card>
        )}

        {orders.map((o) => (
          <Card key={o.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base sm:text-lg">
                    {o.drink}{' '}
                    <span className="text-muted-foreground font-normal">
                      ({o.size})
                    </span>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {o.customerName} · x{o.quantity}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'whitespace-nowrap',
                    statusColor[o.status] ?? statusColor.pending
                  )}
                >
                  {statusMap[o.status] ?? o.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">
                Recibido el {new Date(o.createdAt).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
