# Flujo técnico

1. El usuario crea un pedido desde el frontend.
2. El frontend llama `POST /orders`.
3. La Go API abre una transacción.
4. Inserta el pedido en `coffee_orders`.
5. Inserta el evento en `outbox_events` (misma transacción).
6. Debezium detecta el `INSERT` en `outbox_events` (CDC sobre WAL lógico).
7. Debezium aplica el **Outbox Event Router** y publica el evento en Kafka (`coffee.orders`).
8. El Barista Service consume el evento.
9. El Barista Service guarda una notificación en `barista_notifications`.
10. El frontend muestra que el barista recibió el pedido.

## Evento `OrderCreated`

Payload guardado en `outbox_events.payload` (JSONB):

```json
{
  "orderId": "uuid",
  "customerName": "Santi",
  "drink": "Latte",
  "size": "Medium",
  "quantity": 1,
  "status": "CREATED"
}
```

## Mensaje en Kafka (`coffee.orders`)

Gracias al Outbox Event Router con `route.topic.replacement=coffee.orders` y
campos adicionales en el envelope (`eventType`, `aggregateType`, `aggregateId`):

```json
{
  "eventType": "OrderCreated",
  "aggregateType": "CoffeeOrder",
  "aggregateId": "uuid",
  "payload": {
    "orderId": "uuid",
    "customerName": "Santi",
    "drink": "Latte",
    "size": "Medium",
    "quantity": 1,
    "status": "CREATED"
  }
}
```

## Notificación generada por el Barista Service

```
Nuevo pedido recibido: Latte Medium x1 para Santi
```
