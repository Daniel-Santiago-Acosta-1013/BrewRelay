# Decisiones técnicas

## 1. Patrón Outbox vs. publicar directo en Kafka
Se eligió el patrón Outbox para garantizar consistencia atómica entre el
pedido y el evento. Si la API publicara directamente a Kafka, una caída
entre el `INSERT` y el `produce` dejaría al sistema inconsistente. El outbox
convierte el problema en "escribir en tu propia DB" (lo que la app ya sabe
hacer con transacciones) y delega la entrega a Debezium/Kafka.

## 2. Debezium captura SOLO `outbox_events`
El conector tiene `table.include.list = public.outbox_events`. No se usa
CDC sobre `coffee_orders`. Esto evita ruido, reduce carga y mantiene claro
el contrato: la API nunca publica a Kafka por sí misma.

## 3. Outbox Event Router (SMT)
En lugar de un conector plano, se usa `io.debezium.transforms.outbox.EventRouter`
con:
- `table.expand.json.payload=true` → el `payload` JSONB se expande a JSON real.
- `route.topic.replacement=coffee.orders` → nombre de topic fijo (no
  `outbox.event.CoffeeOrder`).
- `table.fields.additional.placement` → `event_type`, `aggregate_type`,
  `aggregate_id` se exponen en el envelope del mensaje, coincidiendo con el
  formato pedido en el PRD.

## 4. `REPLICA IDENTITY FULL` en `outbox_events`
Necesario para que Debezium pueda reconstruir valores completos en caso de
UPDATE/DELETE (aunque el MVP solo hace INSERT).

## 5. Publicación lógica dedicada
`CREATE PUBLICATION dbz_publication FOR TABLE outbox_events;` aísla la
replicación a la tabla outbox, alineado con el alcance del conector.

## 6. Lenguajes y despliegue
- Go para API y worker: bajo overhead, binarios estáticos, ideal para Fargate.
- Bun + Vite para el frontend: arranque rápido y build ligero.
- Terraform/Terragrunt separan módulos reutilizables (`modules/`) de la
  configuración por entorno (`live/`), facilitando promover dev → staging → prod.
