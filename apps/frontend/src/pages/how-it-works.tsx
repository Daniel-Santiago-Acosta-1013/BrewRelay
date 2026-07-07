import { ArrowRight, Database, Radio, Coffee } from 'lucide-react'

const steps = [
  {
    icon: Coffee,
    title: '1. Creas el pedido',
    text: 'El frontend envía el pedido a la API en Go.',
  },
  {
    icon: Database,
    title: '2. Se guarda en la base de datos',
    text: 'La API guarda el pedido y un evento en la misma transacción (patrón Outbox). Así no hay inconsistencias.',
  },
  {
    icon: Radio,
    title: '3. Debezium detecta el cambio',
    text: 'Debezium captura el INSERT en la tabla outbox_events (CDC) y publica el evento en Kafka.',
  },
  {
    icon: Coffee,
    title: '4. El barista recibe el evento',
    text: 'El Barista Service consume el evento de Kafka y guarda una notificación. El cliente ve el hito "Barista" ✓.',
  },
]

export function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Cómo funciona BrewRelay
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Detrás de un pedido de café hay un flujo Outbox · Debezium · Kafka.
        </p>
      </header>

      <ol className="space-y-4">
        {steps.map((step, i) => (
          <li key={i}>
            <div className="flex gap-4 rounded-2xl border border-border bg-card p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground opacity-40" />
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <h3 className="font-semibold">¿Por qué Outbox?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Si la API publicara directo a Kafka y se cayera entre el guardado del
          pedido y el envío del evento, el sistema quedaría inconsistente. El
          patrón Outbox garantiza que el evento se guarda en la misma
          transacción que el pedido, y Debezium se encarga de entregarlo a Kafka
          de forma confiable.
        </p>
      </div>
    </div>
  )
}