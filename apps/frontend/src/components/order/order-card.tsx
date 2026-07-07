import { motion } from 'framer-motion'
import { CheckCircle2, Clock } from 'lucide-react'
import type { Order } from '@/types'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'

interface Props {
  order: Order
  receivedByBarista: boolean
}

export function OrderCard({ order, receivedByBarista }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="font-semibold">
            {order.drink}{' '}
            <span className="text-muted-foreground font-normal">· {order.size}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {order.customerName} · x{order.quantity}
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-primary">{formatPrice(order.total)}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Milestone label="Creado" done />
        <Line done={receivedByBarista} />
        <Milestone label="Barista" done={receivedByBarista} />
      </div>

      <div className="mt-2 text-xs text-muted-foreground">
        {new Date(order.createdAt).toLocaleString()}
      </div>
    </motion.div>
  )
}

function Milestone({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : (
        <Clock className="h-4 w-4 text-muted-foreground" />
      )}
      <span
        className={cn(
          'text-xs font-medium',
          done ? 'text-emerald-500' : 'text-muted-foreground',
        )}
      >
        {label}
      </span>
    </div>
  )
}

function Line({ done }: { done: boolean }) {
  return (
    <div
      className={cn(
        'h-px flex-1 transition-colors',
        done ? 'bg-emerald-500' : 'bg-border',
      )}
    />
  )
}