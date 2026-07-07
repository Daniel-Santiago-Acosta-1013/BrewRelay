#!/usr/bin/env bash
# Crea el bucket S3 de estado de Terraform + tabla DynamoDB de locks si no existen.
# Uso: .github/scripts/bootstrap-terraform-state.sh
set -euo pipefail

PROJECT_NAME="${PROJECT_NAME:-brewrelay}"
ENVIRONMENT="${ENVIRONMENT:-dev}"
AWS_REGION="${AWS_REGION:-us-east-1}"
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"

STATE_BUCKET="${PROJECT_NAME}-${ENVIRONMENT}-terraform-state-${ACCOUNT_ID}"
LOCK_TABLE="${PROJECT_NAME}-${ENVIRONMENT}-terraform-locks"

echo ">> Bootstrap del estado de Terraform"
echo "   bucket: ${STATE_BUCKET}"
echo "   table:  ${LOCK_TABLE}"
echo "   region: ${AWS_REGION}"

# Bucket S3
if aws s3api head-bucket --bucket "${STATE_BUCKET}" 2>/dev/null; then
  echo "   bucket ya existe"
else
  echo ">> Creando bucket ${STATE_BUCKET} ..."
  aws s3api create-bucket \
    --bucket "${STATE_BUCKET}" \
    --region "${AWS_REGION}" \
    --create-bucket-configuration LocationConstraint="${AWS_REGION}" >/dev/null

  aws s3api put-bucket-versioning \
    --bucket "${STATE_BUCKET}" \
    --versioning-configuration Status=Enabled >/dev/null

  aws s3api put-bucket-encryption \
    --bucket "${STATE_BUCKET}" \
    --server-side-encryption-configuration \
      '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}' >/dev/null

  aws s3api put-public-access-block \
    --bucket "${STATE_BUCKET}" \
    --public-access-block-configuration \
      BlockPublicAcls=true,BlockPublicPolicy=true,IgnorePublicAcls=true,RestrictPublicBuckets=true >/dev/null

  echo "   bucket creado"
fi

# Tabla DynamoDB
if aws dynamodb describe-table --table-name "${LOCK_TABLE}" >/dev/null 2>&1; then
  echo "   tabla de locks ya existe"
else
  echo ">> Creando tabla ${LOCK_TABLE} ..."
  aws dynamodb create-table \
    --table-name "${LOCK_TABLE}" \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema KeySchemaElement=AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region "${AWS_REGION}" >/dev/null
  echo "   tabla creada"
fi

echo "✅ Bootstrap completo."