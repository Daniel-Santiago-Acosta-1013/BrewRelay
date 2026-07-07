import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag, Plus, Minus, Trash2, X, Send, Loader2 } from 'lucide-react'
import type { CartLine } from '@/types'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'

interface Props {
  open: boolean
  onClose: () => void
  lines: CartLine[]
  total: number
  count: number
  onSetQty: (key: string, qty: number) => void
  onRemove: (key: string) => void
  customerName: string
  onCustomerNameChange: (v: string) => void
  onSubmit: () => void
  submitting: boolean
}

export function CartDrawer({
  open,
  onClose,
  lines,
  total,
  count,
  onSetQty,
  onRemove,
  customerName,
  onCustomerNameChange,
  onSubmit,
  submitting,
}: Props) {
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-xl transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Tu pedido</h2>
            {count > 0 && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <ShoppingBag className="mb-3 h-10 w-10 opacity-40" />
              <p className="text-sm">Tu carrito está vacío.</p>
              <p className="mt-1 text-xs">Agrega algo de la carta ☕</p>
            </div>
          ) : (
            <ul className="space-y-3">
              <AnimatePresence initial={false}>
                {lines.map((line) => (
                  <motion.li
                    key={line.key}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {line.drink}{' '}
                        <span className="text-muted-foreground font-normal">
                          · {line.size}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatPrice(line.unitPrice)} c/u
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onSetQty(line.key, line.quantity - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent"
                        aria-label="Quitar"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-7 text-center text-sm font-medium">
                        {line.quantity}
                      </span>
                      <button
                        onClick={() => onSetQty(line.key, line.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent"
                        aria-label="Agregar"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="w-16 text-right text-sm font-semibold">
                      {formatPrice(line.unitPrice * line.quantity)}
                    </div>

                    <button
                      onClick={() => onRemove(line.key)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <footer className="border-t border-border px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(total)}
              </span>
            </div>

            <input
              type="text"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              placeholder="Tu nombre"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />

            <button
              onClick={onSubmit}
              disabled={submitting || !customerName.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar al barista
                </>
              )}
            </button>
          </footer>
        )}
      </aside>
    </>
  )
}