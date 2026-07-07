# Despliegue en AWS

## Componentes

| Servicio | Detalle |
|----------|---------|
| S3 + CloudFront | Frontend estático (build de Vite), OAC para acceso privado |
| ECS Fargate | Servicios `brewer-api` (2 tareas) y `barista-worker` (1 tarea) |
| ALB | Expone `brewer-api` en puerto 80, health check en `/health` |
| ECR | Repositorios `brewer-api`, `barista-worker` |
| RDS PostgreSQL | `rds.logical_replication = 1` (requisito Debezium) |
| MSK | Cluster Kafka (2 brokers, 2 AZs) |
| MSK Connect | Debezium connector (igual `connector.json`) |

## Orden de despliegue con Terragrunt

```bash
cd infra/terraform

# 1. Backend remoto (una vez)
aws s3 mb s3://brewrelay-tf-state --region us-east-1
aws dynamodb create-table --table-name brewrelay-tf-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema KeySchemaElement=AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST --region us-east-1

# 2. Desplegar módulos en orden (por dependencias)
terragrunt run-all apply --working-dir live/dev
```

El orden de dependencias está resuelto con `dependency` en cada `terragrunt.hcl`:

```
vpc → rds, msk, ecr
vpc + rds + ecr + msk → ecs
ecs → frontend (usa el DNS del ALB)
```

## Variables sensibles

`DB_PASSWORD` se pasa por entorno a terragrunt:

```bash
export DB_PASSWORD="un-password-seguro"
terragrunt run-all apply --working-dir live/dev
```

## Imágenes

```bash
# Tag y push a ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker build -t brewer-api apps/api && docker tag brewer-api <url>/brewer-api:latest && docker push <url>/brewer-api:latest
# análogo para barista-worker
```

## Debezium en MSK Connect
Crear un connector personalizado en MSK Connect usando el mismo
`connector.json` (ajustando `database.hostname` al endpoint de RDS y
`bootstrap.servers` a los brokers de MSK).
