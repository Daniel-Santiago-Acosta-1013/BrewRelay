CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Pedidos de café
CREATE TABLE IF NOT EXISTS coffee_orders (
  id            UUID PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  drink         VARCHAR(50)  NOT NULL,
  size          VARCHAR(20)  NOT NULL,
  quantity      INT          NOT NULL,
  status        VARCHAR(30)  NOT NULL DEFAULT 'CREATED',
  created_at    TIMESTAMP    NOT NULL DEFAULT now()
);

-- Tabla outbox: Debezium captura los INSERT aquí
-- Nombres de columnas sin underscore (convención esperada por Debezium Outbox Event Router)
CREATE TABLE IF NOT EXISTS outbox_events (
  id            UUID PRIMARY KEY,
  aggregatetype VARCHAR(100) NOT NULL,
  aggregateid   UUID NOT NULL,
  type          VARCHAR(100) NOT NULL,
  payload       JSONB NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT now()
);

-- Notificaciones generadas por el Barista Service
CREATE TABLE IF NOT EXISTS barista_notifications (
  id         UUID PRIMARY KEY,
  order_id   UUID NOT NULL,
  message    TEXT NOT NULL,
  received_at TIMESTAMP NOT NULL DEFAULT now()
);

-- REPLICA IDENTITY FULL para que Debezium pueda leer valores completos en UPDATE/DELETE
ALTER TABLE outbox_events REPLICA IDENTITY FULL;

-- Debezium necesita permisos sobre los objetos
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO debezium;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO debezium;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO debezium;
