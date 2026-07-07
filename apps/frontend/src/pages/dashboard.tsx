import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Bell,
  ArrowRight,
  Activity,
  Coffee,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useOrders, useNotifications } from '@/hooks/use-api'
import { cn } from '@/lib/utils'

export function DashboardPage() {
  const { orders, loading: ordersLoading } = useOrders()
  const { notifications, loading: notifsLoading } = useNotifications()

  const recentOrders = orders.slice(0, 5)
  const recentNotifications = notifications.slice(0, 5)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Resumen del flujo Outbox · Debezium · Kafka.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/new-order">
            <PlusCircle className="h-4 w-4" />
            Nueva orden
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total de pedidos"
          value={orders.length}
          icon={ClipboardList}
          loading={ordersLoading}
        />
        <StatCard
          title="Notificaciones"
          value={notifications.length}
          icon={Bell}
          loading={notifsLoading}
        />
        <StatCard
          title="Bebidas disponibles"
          value={5}
          icon={Coffee}
          loading={false}
        />
        <StatCard
          title="Estado"
          value={orders.length > 0 ? 'Activo' : 'En espera'}
          icon={Activity}
          loading={ordersLoading && notifsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pedidos recientes</CardTitle>
              <CardDescription>
                Últimos pedidos recibidos en el sistema.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/orders" className="gap-1">
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders.length === 0 && !ordersLoading && (
              <div className="text-sm text-muted-foreground">
                No hay pedidos aún.
              </div>
            )}
            {recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <div className="font-medium">
                    {o.drink}{' '}
                    <span className="text-muted-foreground font-normal">
                      ({o.size})
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {o.customerName} · x{o.quantity}
                  </div>
                </div>
                <Badge variant="outline">{o.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Eventos del barista</CardTitle>
              <CardDescription>
                Últimas notificaciones entregadas vía Kafka.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/notifications" className="gap-1">
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentNotifications.length === 0 && !notifsLoading && (
              <div className="text-sm text-muted-foreground">
                Sin notificaciones todavía.
              </div>
            )}
            {recentNotifications.map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
                <div>
                  <div className="text-sm">{n.message}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(n.receivedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Flujo de datos</CardTitle>
          <CardDescription>
            Cómo viaja un pedido desde el frontend hasta el barista.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {[
              'Frontend',
              'Go API',
              'PostgreSQL',
              'outbox_events',
              'Debezium',
              'Kafka',
              'Barista Service',
            ].map((step, idx, arr) => (
              <>
                <span
                  key={step}
                  className="rounded-full border bg-card px-3 py-1 text-xs font-medium"
                >
                  {step}
                </span>
                {idx < arr.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground hidden sm:inline" />
                )}
              </>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string
  value: number | string
  icon: React.ElementType
  loading: boolean
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className={cn('text-2xl font-bold', loading && 'animate-pulse')} >
              {loading ? '—' : value}
            </div>
          </div>
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
