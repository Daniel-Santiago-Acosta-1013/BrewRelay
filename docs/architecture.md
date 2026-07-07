# Arquitectura

```
┌────────────┐     POST /orders      ┌────────────┐
│  Frontend  │ ───────────────────▶ │  Go API    │
│ TS+Bun+Vite│                       │ (apps/api) │
└────────────┘                       └─────┬──────┘
                                           │  BEGIN TX
                                           │   1) INSERT coffee_orders
                                           │   2) INSERT outbox_events
                                           │  COMMIT
                                           ▼
                                    ┌──────────────┐
                                    │ PostgreSQL   │
                                    │ coffee_orders│
                                    │ outbox_events│  ── REPLICA IDENTITY FULL
                                    └──────┬───────┘
                                           │ WAL (logical)
                                           ▼
                                    ┌──────────────┐
                                    │  Debezium    │  Outbox Event Router SMT
                                    │ (MSK Connect)│  topic.replacement=coffee.orders
                                    └──────┬───────┘
                                           │ Kafka message
                                           ▼
                                    ┌──────────────┐
                                    │    Kafka     │  topic: coffee.orders
                                    │   (MSK)      │
                                    └──────┬───────┘
                                           │ consume
                                           ▼
                                    ┌──────────────┐
                                    │ Barista Svc  │  apps/worker (Go)
                                    │ (ECS Fargate)│  → INSERT barista_notifications
                                    └──────┬───────┘
                                           ▼
                                    ┌──────────────┐
                                    │ PostgreSQL   │  barista_notifications
                                    └──────────────┘
                                           │ GET /barista-notifications
                                           ▲
                                           │
                                    ┌────────────┐
                                    │  Frontend  │  muestra el evento recibido
                                    └────────────┘
```

## Componentes

| Componente | Responsabilidad |
|-----------|-----------------|
| `apps/frontend` | UI: crear y listar pedidos + notificaciones |
| `apps/api` | Crear pedido y evento outbox en una transacción |
| `apps/worker` | Barista Service: consumir Kafka y notificar |
| PostgreSQL | Fuente de verdad + outbox |
| Debezium | Captura `outbox_events` y publica en Kafka |
| Kafka | `coffee.orders` |

## AWS

- **Frontend:** S3 + CloudFront (OAC)
- **Backend:** ECS Fargate (servicios `brewer-api`, `barista-worker`) + ALB + ECR
- **DB:** RDS PostgreSQL con `rds.logical_replication = 1`
- **Kafka/CDC:** Amazon MSK + MSK Connect (Debezium connector)
