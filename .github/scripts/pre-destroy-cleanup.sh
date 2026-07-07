#!/usr/bin/env bash
# Limpieza pre-destroy: detiene tareas ECS, vacía buckets S3 y repos ECR.
# Uso: .github/scripts/pre-destroy-cleanup.sh
set -euo pipefail

PROJECT_NAME="${PROJECT_NAME:-brewrelay}"
ENVIRONMENT="${ENVIRONMENT:-dev}"
AWS_REGION="${AWS_REGION:-us-east-1}"
CLUSTER_NAME="${PROJECT_NAME}-${ENVIRONMENT}"

echo ">> Pre-destroy cleanup para ${CLUSTER_NAME}"

# 1. Detener tareas ECS
echo ">> Deteniendo tareas ECS ..."
ECS_SERVICES=$(aws ecs list-services --cluster "${CLUSTER_NAME}" --region "${AWS_REGION}" --query "serviceArns[]" --output text 2>/dev/null || true)
if [[ -n "${ECS_SERVICES}" ]]; then
  for svc in ${ECS_SERVICES}; do
    aws ecs update-service --cluster "${CLUSTER_NAME}" --service "${svc}" --desired-count 0 --region "${AWS_REGION}" >/dev/null 2>&1 || true
  done
  sleep 5
  TASKS=$(aws ecs list-tasks --cluster "${CLUSTER_NAME}" --region "${AWS_REGION}" --query "taskArns[]" --output text 2>/dev/null || true)
  for task in ${TASKS}; do
    aws ecs stop-task --cluster "${CLUSTER_NAME}" --task "${task}" --region "${AWS_REGION}" >/dev/null 2>&1 || true
  done
  echo "   tareas detenidas"
else
  echo "   sin servicios ECS"
fi

# 2. Vaciar buckets S3
for bucket_suffix in frontend input output; do
  BUCKET="${PROJECT_NAME}-${ENVIRONMENT}-${bucket_suffix}"
  if aws s3api head-bucket --bucket "${BUCKET}" 2>/dev/null; then
    echo ">> Vaciando bucket ${BUCKET} ..."
    aws s3 rm "s3://${BUCKET}" --recursive --region "${AWS_REGION}" >/dev/null 2>&1 || true
    # Eliminar versiones (si las hay)
    versions=$(aws s3api list-object-versions --bucket "${BUCKET}" --query "Versions[].{Key:Key,VersionId:VersionId}" --output json 2>/dev/null || echo "[]")
    if [[ "${versions}" != "[]" ]]; then
      echo "${versions}" | python3 -c "
import sys, json
for v in json.load(sys.stdin):
    print(f\"{v['Key']} {v['VersionId']}\")
" 2>/dev/null | while read -r key vid; do
        aws s3api delete-object --bucket "${BUCKET}" --key "${key}" --version-id "${vid}" >/dev/null 2>&1 || true
      done
    fi
    echo "   bucket vaciado"
  fi
done

# 3. Vaciar repos ECR
for repo in brewer-api barista-worker; do
  ECR_REPO="${PROJECT_NAME}-${repo}"
  if aws ecr describe-repositories --repository-names "${ECR_REPO}" --region "${AWS_REGION}" >/dev/null 2>&1; then
    echo ">> Vaciando ECR ${ECR_REPO} ..."
    IMAGES=$(aws ecr list-images --repository-name "${ECR_REPO}" --region "${AWS_REGION}" --query "imageIds[]" --output json 2>/dev/null || echo "[]")
    if [[ "${IMAGES}" != "[]" ]]; then
      aws ecr batch-delete-image --repository-name "${ECR_REPO}" --image-ids "${IMAGES}" --region "${AWS_REGION}" >/dev/null 2>&1 || true
    fi
    echo "   repositorio vaciado"
  fi
done

echo "✅ Pre-destroy cleanup completo."