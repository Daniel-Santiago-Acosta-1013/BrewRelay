-- Usuario de la aplicación
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'brewrelay') THEN
      CREATE ROLE brewrelay WITH LOGIN PASSWORD 'brewrelay';
   END IF;
END
$$;

-- Usuario de Debezium con privilegios de replicación lógica
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'debezium') THEN
      CREATE ROLE debezium WITH LOGIN PASSWORD 'dbz' REPLICATION;
   END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE brewrelay TO brewrelay;
GRANT ALL PRIVILEGES ON DATABASE brewrelay TO debezium;
