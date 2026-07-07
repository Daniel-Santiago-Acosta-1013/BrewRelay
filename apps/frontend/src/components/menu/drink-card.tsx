import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import type { MenuItem, Size } from '@/types'
import { SIZES } from '@/types'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'

interface Props {
  item: MenuItem
  onAdd: (drink: string, size: Size, unitPrice: number) => void
}

export function DrinkCard({ item, onAdd }: Props) {
  const [size, setSize] = useState<Size>('Medium')
  const [qty, setQty] = useState(1)
  const price = item.sizePrice[size] ?? item.price

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{item.emoji}</span>
            <h3 className="text-lg font-semibold tracking-tight">{item.name}</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-primary">{formatPrice(price)}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        {SIZES.map((s) => (
          <button
            key={s}
            onClick={() => setSize(s)}
            className={cn(
              'flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors',
              size === s
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:bg-accent',
            )}
          >
            {s[0]}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent"
            aria-label="Quitar uno"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-medium">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent"
            aria-label="Agregar uno"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={() => {
            onAdd(item.name, size, price)
            setQty(1)
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Agregar
        </button>
      </div>
    </motion.div>
  )
}