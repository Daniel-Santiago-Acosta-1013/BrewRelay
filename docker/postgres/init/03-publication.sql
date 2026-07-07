-- Publicación enfocada SOLO en outbox_events (lo que Debezium debe capturar)
CREATE PUBLICATION dbz_publication FOR TABLE outbox_events;
