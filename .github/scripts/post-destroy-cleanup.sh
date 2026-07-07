#!/usr/bin/env bash
# Limpieza post-destroy: elimina log groups, task definitions, cluster ECS, locks y estado.
# Uso: .github/scripts/post-destroy-cleanup.sh
set -euo pipefail

PROJECT_NAME="${PROJECT_NAME:-brewrelay}"
ENVIRONMENT="${ENVIRONMENT:-dev}"
AWS_REGION="${AWS_REGION:-us-east-1}"
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
CLUSTER_NAME="${PROJECT_NAME}-${ENVIRONMENT}"
LOCK_TABLE="${PROJECT_NAME}-${ENVIRONMENT}-terraform-locks"
STATE_BUCKET="${PROJECT_NAME}-${ENVIRONMENT}-terraform-state-${ACCOUNT_ID}"

echo ">> Post-destroy cleanup"

# 1. Log groups de CloudWatch
for log_group in "/ecs/${CLUSTER_NAME}" "/ecs/${CLUSTER_NAME}-api" "/ecs/${CLUSTER_NAME}-worker"; do
  if aws logs describe-log-group --log-group-name "${log_group}" --region "${AWS_REGION}" >/dev/null 2>&1; then
    echo ">> Eliminando log group ${log_group} ..."
    aws logs delete-log-group --log-group-name "${log_group}" --region "${AWS_REGION}" >/dev/null 2>&1 || true
  fi
done

# 2. Task definitions ECS
echo ">> Desregistrando task definitions ECS ..."
TASK_DEFS=$(aws ecs list-task-definitions --region "${AWS_REGION}" --query "taskDefinitionArns[]" --output text 2>/dev/null || true)
for td in ${TASK_DEFS}; do
  family=$(echo "${td}" | rev | cut -d: -f2- | rev | cut -d/ -f2)
  aws ecs deregister-task-definition --task-definition "${td}" --region "${AWS_REGION}" >/dev/null 2>&1 || true
done

# 3. Cluster ECS
if aws ecs describe-clusters --clusters "${CLUSTER_NAME}" --region "${AWS_REGION}" --query "clusters[0].clusterArn" --output text 2>/dev/null | grep -q .; then
  echo ">> Eliminando cluster ECS ${CLUSTER_NAME} ..."
  aws ecs delete-cluster --cluster "${CLUSTER_NAME}" --region "${AWS_REGION}" >/dev/null 2>&1 || true
fi

# 4. Tabla de locks DynamoDB
if aws dynamodb describe-table --table-name "${LOCK_TABLE}" --region "${AWS_REGION}" >/dev/null 2>&1; then
  echo ">> Eliminando tabla de locks ${LOCK_TABLE} ..."
  aws dynamodb delete-table --table-name "${LOCK_TABLE}" --region "${AWS_REGION}" >/dev/null 2>&1 || true
fi

# 5. Bucket de estado S3
if aws s3api head-bucket --bucket "${STATE_BUCKET}" 2>/dev/null; then
  echo ">> Vaciando y eliminando bucket de estado ${STATE_BUCKET} ..."
  aws s3 rm "s3://${STATE_BUCKET}" --recursive --region "${AWS_REGION}" >/dev/null 2>&1 || true
  aws s3api delete-bucket --bucket "${STATE_BUCKET}" --region "${AWS_REGION}" >/dev/null 2>&1 || true
fi

echo "✅ Post-destroy cleanup completo."