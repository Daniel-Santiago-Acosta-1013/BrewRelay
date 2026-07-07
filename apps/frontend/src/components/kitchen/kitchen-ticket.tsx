import { motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import type { BaristaNotification } from '@/types'

interface Props {
  notification: BaristaNotification
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

export function KitchenTicket({ notification }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="relative rounded-xl border-2 border-primary/30 bg-card p-4 shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium leading-relaxed">
            {notification.message}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {timeAgo(notification.receivedAt)}
          </div>
        </div>
      </div>
    </motion.div>
  )
}