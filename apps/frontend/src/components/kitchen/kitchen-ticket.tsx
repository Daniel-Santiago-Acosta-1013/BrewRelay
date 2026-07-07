import { motion } from 'framer-motion'
import { Coffee, Clock, CheckCircle2, Loader2 } from 'lucide-react'
import type { Order } from '@/types'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'

interface Props {
  order: Order
  onAdvance: (id: string, status: string) => void
  updating: boolean
}

const statusLabel: Record<string, string> = {
  CREATED: 'Nuevo',
  PREPARING: 'Preparando',
  READY: 'Listo',
  DELIVERED: 'Entregado',
}

const statusAccent: Record<string, string> = {
  CREATED: 'border-primary/40 bg-primary/5',
  PREPARING: 'border-amber-500/40 bg-amber-500/5',
  READY: 'border-emerald-500/40 bg-emerald-500/5',
  DELIVERED: 'border-border bg-card',
}

const statusBadge: Record<string, string> = {
  CREATED: 'bg-primary/15 text-primary',
  PREPARING: 'bg-amber-500/15 text-amber-500',
  READY: 'bg-emerald-500/15 text-emerald-500',
  DELIVERED: 'bg-muted text-muted-foreground',
}

const nextStatusLabel: Record<string, string> = {
  CREATED: 'Empezar a preparar',
  PREPARING: 'Marcar como listo',
  READY: 'Entregar',
}

const nextStatusValue: Record<string, string> = {
  CREATED: 'PREPARING',
  PREPARING: 'READY',
  READY: 'DELIVERED',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `hace ${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `hace ${m}m`
  const h = Math.floor(m / 60)
  return `hace ${h}h`
}

export function KitchenTicket({ order, onAdvance, updating }: Props) {
  const canAdvance = Boolean(nextStatusValue[order.status])
  const accent = statusAccent[order.status] ?? statusAccent.CREATED
  const badge = statusBadge[order.status] ?? statusBadge.CREATED

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={cn('rounded-2xl border-2 p-4 shadow-sm', accent)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-card text-2xl shadow-sm">
            <Coffee className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="font-semibold">
              {order.drink} <span className="text-muted-foreground font-normal">· {order.size}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {order.customerName} · x{order.quantity} · {formatPrice(order.total)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {timeAgo(order.createdAt)}
            </div>
          </div>
        </div>
        <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', badge)}>
          {statusLabel[order.status] ?? order.status}
        </span>
      </div>

      {canAdvance && (
        <button
          onClick={() => onAdvance(order.id, nextStatusValue[order.status])}
          disabled={updating}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent disabled:opacity-50"
        >
          {updating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : order.status === 'PREPARING' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <Clock className="h-4 w-4" />
          )}
          {nextStatusLabel[order.status]}
        </button>
      )}
    </motion.div>
  )
}