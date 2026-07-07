# BrewRelay ☕

> Mini app de pedidos de cafetería para aprender el patrón **Outbox** con **Debezium** y **Kafka**.

## ¿Qué demuestra?

El flujo completo de punta a punta:

```
Frontend → Go API → PostgreSQL → outbox_events → Debezium → Kafka → Barista Service
```

**Concepto clave:** el Outbox **no reemplaza** a Kafka.

- El **Outbox** (`outbox_events`) guarda el evento de forma confiable en la misma transacción que el pedido.
- **Debezium** captura el cambio (CDC) en `outbox_events`.
- **Kafka** distribuye el evento al consumidor.
- El **Barista Service** (`apps/worker`) consume el evento y guarda una notificación.

## Stack

| Capa            | Tecnología |
|-----------------|------------|
| Frontend        | TypeScript + Bun + Vite |
| API             | Go (`apps/api`) |
| Worker          | Go (`apps/worker` — Barista Service) |
| DB              | PostgreSQL |
| Outbox          | tabla `outbox_events` |
| CDC             | Debezium (Outbox Event Router) |
| Broker          | Kafka |
| Infra local     | Docker Compose |
| Infra AWS       | S3 + CloudFront, ECS Fargate, RDS, MSK, MSK Connect |
| IaC             | Terraform / Terragrunt |

## Estructura

```
BrewRelay/
├── apps/
│   ├── api/          # API en Go (POST/GET /orders, /barista-notifications, /health)
│   ├── frontend/     # Web TS + Bun + Vite
│   └── worker/       # Barista Service en Go (consumidor Kafka)
├── docker/
│   ├── postgres/init # schema SQL + usuario + publicación lógica
│   └── debezium/     # connector.json + script de registro (manual/opcional)
├── docker-compose.yml
├── infra/terraform/
│   ├── modules/      # vpc, rds, ecr, ecs, msk, frontend
│   ├── live/dev/     # configuración terragrunt por entorno
│   ├── root.hcl
│   └── backend.hcl.example
├── docs/
│   ├── architecture.md
│   ├── flow.md
│   ├── decisions.md
│   ├── debezium-connector.md
│   └── aws-deployment.md
└── README.md
```

## Arranque local (Docker Compose)

```bash
# Levanta TODO: postgres, kafka, kafka-connect, debezium-register, api, worker, frontend
docker compose up -d --build
```

El servicio `debezium-register` registra el conector Outbox automáticamente
(es idempotente: si ya existe, lo borra y lo vuelve a crear con la config actual).

### Verificación rápida

```bash
# Estado de todos los servicios
docker compose ps

# Crear un pedido
curl -X POST http://localhost:8080/orders \
  -H 'Content-Type: application/json' \
  -d '{"customerName":"Santi","drink":"Latte","size":"Medium","quantity":1}'

# Ver pedidos
curl http://localhost:8080/orders

# Ver notificaciones del barista (tras CDC + Kafka)
curl http://localhost:8080/barista-notifications

# Estado del conector Debezium
curl http://localhost:8083/connectors/brewrelay-outbox-connector/status
```

### Registro manual del conector (opcional)

Si necesitas re-registrar el conector fuera del `docker compose up`:

```bash
./docker/debezium/register-connector.sh
```

## Funcionalidades del MVP

- Pantalla única: crear pedido, listar pedidos y listar eventos del barista.
- Bebidas: `Latte`, `Americano`, `Cappuccino`, `Mocha`, `Espresso`.
- Tamaños: `Small`, `Medium`, `Large`.
- El `Barista Service` genera: `Nuevo pedido recibido: Latte Medium x1 para Santi`.

## Criterios de aceptación

1. **Crear pedido** → se guarda en `coffee_orders` y en `outbox_events` (misma transacción).
2. **Captura CDC** → Debezium publica el evento en `coffee.orders`.
3. **Barista** → `Barista Service` crea una fila en `barista_notifications`.
4. **Visualización** → el frontend muestra pedidos y eventos recibidos.

## Fuera de alcance

Login, pagos, inventario, roles, panel administrativo, correo, Kubernetes,
múltiples tipos de eventos y múltiples consumidores.

## Modelo de datos

Ver [`docker/postgres/init/02-schema.sql`](../docker/postgres/init/02-schema.sql).

- `coffee_orders`
- `outbox_events`
- `barista_notifications`
# BrewRelay
