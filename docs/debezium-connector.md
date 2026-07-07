# Conector Debezium (Outbox Event Router)

Archivo: [`docker/debezium/connector.json`](../docker/debezium/connector.json)

## Registro

```bash
./docker/debezium/register-connector.sh          # usa http://localhost:8083
./docker/debezium/register-connector.sh http://mi-host:8083
```

## Configuración clave

| Clave | Valor | Propósito |
|------|-------|-----------|
| `connector.class` | `io.debezium.connector.postgresql.PostgresConnector` | Source PostgreSQL |
| `database.user` / `database.password` | `debezium` / `dbz` | Usuario con `REPLICATION` |
| `publication.name` | `dbz_publication` | Publicación lógica creada en init |
| `slot.name` | `brewrelay_slot` | Replication slot |
| `table.include.list` | `public.outbox_events` | **Solo** la tabla outbox |
| `snapshot.mode` | `never` | No hace snapshot inicial; solo CDC |
| `transforms` | `outbox` | Aplica el SMT |
| `transforms.outbox.type` | `io.debezium.transforms.outbox.EventRouter` | Outbox router |
| `transforms.outbox.table.expand.json.payload` | `true` | Expande el JSONB a JSON |
| `transforms.outbox.route.topic.replacement` | `coffee.orders` | Topic destino |
| `transforms.outbox.table.fields.additional.placement` | `event_type:envelope:eventType,aggregate_type:envelope:aggregateType,aggregate_id:envelope:aggregateId` | Campos extra en el envelope |

## Verificación

```bash
# Estado
curl http://localhost:8083/connectors/brewrelay-outbox-connector/status

# Forzar re-creación (si cambiaste el connector.json)
curl -X DELETE http://localhost:8083/connectors/brewrelay-outbox-connector
./docker/debezium/register-connector.sh
```

## Notas
- El usuario `debezium` debe tener `REPLICATION` y permisos sobre el esquema.
- `wal_level=logical` debe estar habilitado en PostgreSQL (ver docker-compose).
- En AWS esto se despliega como **MSK Connect** apuntando al mismo conector.
