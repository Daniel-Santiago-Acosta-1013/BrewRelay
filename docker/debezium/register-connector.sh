#!/usr/bin/env bash
# Registra el conector Debezium Outbox en Kafka Connect.
# Uso: ./docker/debezium/register-connector.sh [CONNECT_URL]
set -euo pipefail

CONNECT_URL="${1:-http://localhost:8083}"
CONNECTOR_FILE="$(cd "$(dirname "$0")" && pwd)/connector.json"

echo ">> Esperando a Kafka Connect en $CONNECT_URL ..."
for i in $(seq 1 30); do
  if curl -sf "$CONNECT_URL/" >/dev/null 2>&1; then
    echo "   Kafka Connect disponible."
    break
  fi
  echo "   intento $i/30..."
  sleep 4
done

echo ">> Registrando conector desde $CONNECTOR_FILE ..."
curl -sf -X POST \
  -H "Content-Type: application/json" \
  --data @"$CONNECTOR_FILE" \
  "$CONNECT_URL/connectors" && echo "" && echo "✅ Conector registrado."

echo ">> Estado de los conectores:"
curl -sf "$CONNECT_URL/connectors?expand=status" | python3 -m json.tool 2>/dev/null || \
  curl -sf "$CONNECT_URL/connectors?expand=status"
