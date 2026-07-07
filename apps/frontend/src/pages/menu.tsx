import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Coffee, ShoppingBag, Loader2 } from 'lucide-react'
import type { Size } from '@/types'
import { useMenu, useOrders, useCreateOrder } from '@/hooks/use-api'
import { useCart } from '@/hooks/use-cart'
import { useToast } from '@/components/ui/toast'
import { DrinkCard } from '@/components/menu/drink-card'
import { CartDrawer } from '@/components/menu/cart-drawer'
import { OrderCard } from '@/components/order/order-card'

export function MenuPage() {
  const { menu, loading: menuLoading } = useMenu()
  const { orders, loading: ordersLoading } = useOrders()
  const { submit, submitting } = useCreateOrder()
  const toast = useToast()

  const cart = useCart()
  const [cartOpen, setCartOpen] = useState(false)
  const [customerName, setCustomerName] = useState('')

  function handleAdd(drink: string, size: Size, unitPrice: number) {
    cart.add({ drink, size, quantity: 1, unitPrice })
    toast('success', `${drink} ${size} agregado al pedido ☕`)
  }

  async function handleSubmit() {
    if (cart.lines.length === 0 || !customerName.trim()) return
    for (const line of cart.lines) {
      for (let i = 0; i < line.quantity; i++) {
        await submit({
          customerName: customerName.trim(),
          drink: line.drink,
          size: line.size,
          quantity: 1,
        })
      }
    }
    toast('success', `Pedido enviado a la cocina ☕ (${cart.count} ${cart.count === 1 ? 'café' : 'cafés'})`)
    cart.clear()
    setCustomerName('')
    setCartOpen(false)
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <Coffee className="h-7 w-7 text-primary" />
            BrewRelay
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Arma tu pedido y míralo viajar hasta el barista.
          </p>
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="relative inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="hidden sm:inline">Carrito</span>
          {cart.count > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {cart.count}
            </span>
          )}
        </button>
      </header>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">Carta</h2>
        {menuLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Cargando carta…
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {menu.map((item) => (
                <DrinkCard key={item.id} item={item} onAdd={handleAdd} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Tus pedidos</h2>
        {ordersLoading && orders.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Cargando pedidos…
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <Coffee className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p className="text-sm text-muted-foreground">
              Aún no hay pedidos. Pide tu primer café ☕
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <AnimatePresence>
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        lines={cart.lines}
        total={cart.total}
        count={cart.count}
        onSetQty={cart.setQuantity}
        onRemove={cart.remove}
        customerName={customerName}
        onCustomerNameChange={setCustomerName}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  )
}