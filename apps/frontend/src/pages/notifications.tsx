import { Bell, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNotifications } from '@/hooks/use-api'
import { cn } from '@/lib/utils'

export function NotificationsPage() {
  const { notifications, loading, error, reload } = useNotifications()

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            Notificaciones
          </h1>
          <p className="text-muted-foreground mt-1">
            Eventos recibidos por el Barista Service a través de Kafka.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={reload} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
          Refrescar
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 p-4 text-destructive mb-4">
          No se pudieron cargar las notificaciones: {error}
        </div>
      )}

      <div className="grid gap-4">
        {loading && notifications.length === 0 && (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Cargando notificaciones…
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              El barista aún no ha recibido eventos. Crea un pedido y espera el
              flujo CDC + Kafka.
            </CardContent>
          </Card>
        )}

        {notifications.map((n) => (
          <Card key={n.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">
                      Evento recibido
                    </CardTitle>
                    <CardDescription className="mt-1 leading-relaxed">
                      {n.message}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="whitespace-nowrap">
                  Orden #{n.orderId.slice(0, 8)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">
                Recibido el {new Date(n.receivedAt).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
