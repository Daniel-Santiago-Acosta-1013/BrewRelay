import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Coffee, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { DRINKS, SIZES } from '@/types'
import { useCreateOrder } from '@/hooks/use-api'

export function NewOrderPage() {
  const navigate = useNavigate()
  const { submit, submitting } = useCreateOrder()
  const [banner, setBanner] = useState<
    { kind: 'ok' | 'err'; text: string } | null
  >(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBanner(null)
    const form = e.currentTarget
    const data = {
      customerName: (form.elements.namedItem('customerName') as HTMLInputElement).value,
      drink: (form.elements.namedItem('drink') as HTMLSelectElement).value,
      size: (form.elements.namedItem('size') as HTMLSelectElement).value,
      quantity: Number((form.elements.namedItem('quantity') as HTMLInputElement).value),
    }
    try {
      await submit(data)
      setBanner({
        kind: 'ok',
        text: `Pedido creado: ${data.drink} ${data.size} x${data.quantity} para ${data.customerName}.`,
      })
      form.reset()
      setTimeout(() => navigate('/orders'), 900)
    } catch (err) {
      setBanner({ kind: 'err', text: `Error: ${(err as Error).message}` })
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Coffee className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          Nueva orden
        </h1>
        <p className="text-muted-foreground mt-1">
          Crea un pedido y deja que el flujo Outbox lo entregue al barista.
        </p>
      </div>

      {banner && (
        <Alert
          variant={banner.kind === 'ok' ? 'success' : 'destructive'}
          className="mb-4"
        >
          <AlertTitle>{banner.kind === 'ok' ? 'Pedido enviado' : 'Algo salió mal'}</AlertTitle>
          <AlertDescription>{banner.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Detalles del pedido</CardTitle>
          <CardDescription>
            Completa los datos del cliente y la bebida.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="customerName" className="text-sm font-medium">
                Nombre del cliente
              </label>
              <Input
                id="customerName"
                name="customerName"
                placeholder="Santi"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="drink" className="text-sm font-medium">Bebida</label>
                <Select id="drink" name="drink" required>
                  {DRINKS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="size" className="text-sm font-medium">Tamaño</label>
                <Select id="size" name="size" required>
                  {SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">
                Cantidad
              </label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min={1}
                defaultValue={1}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Enviando…' : 'Crear pedido'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
