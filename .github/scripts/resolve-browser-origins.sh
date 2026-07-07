#!/usr/bin/env bash
# Normaliza orígenes CORS combinando localhost con el dominio de CloudFront.
# Exporta ALLOWED_ORIGINS y FRONTEND_ORIGIN a GITHUB_ENV.
# Uso: .github/scripts/resolve-browser-origins.sh
set -euo pipefail

PROJECT_NAME="${PROJECT_NAME:-brewrelay}"
ENVIRONMENT="${ENVIRONMENT:-dev}"
AWS_REGION="${AWS_REGION:-us-east-1}"

LOCAL_ORIGIN="http://localhost:5173"
FRONTEND_ORIGIN=""

# Intentar obtener el dominio de CloudFront vía terragrunt output
if command -v terragrunt >/dev/null 2>&1; then
  CF_DOMAIN=$(cd infra/terraform/live/dev/services/frontend && terragrunt output -raw cloudfront_domain 2>/dev/null || true)
  if [[ -z "${CF_DOMAIN}" ]]; then
    CF_DOMAIN=$(cd infra/terraform/live/dev/services/frontend && terragrunt output -raw cloudfront_url 2>/dev/null || true)
  fi
fi

# Fallback: buscar via aws cloudfront
if [[ -z "${CF_DOMAIN:-}" ]]; then
  CF_DOMAIN=$(aws cloudfront list-distributions \
    --region "${AWS_REGION}" \
    --query "DistributionList.Items[?contains(DisplayName, '${PROJECT_NAME}')].DomainName" \
    --output text 2>/dev/null | head -1 || true)
fi

if [[ -n "${CF_DOMAIN:-}" ]]; then
  FRONTEND_ORIGIN="https://${CF_DOMAIN}"
  ALLOWED_ORIGINS="${LOCAL_ORIGIN},${FRONTEND_ORIGIN}"
else
  FRONTEND_ORIGIN="${LOCAL_ORIGIN}"
  ALLOWED_ORIGINS="${LOCAL_ORIGIN}"
fi

echo "ALLOWED_ORIGINS=${ALLOWED_ORIGINS}" >> "${GITHUB_ENV:-/dev/null}"
echo "FRONTEND_ORIGIN=${FRONTEND_ORIGIN}" >> "${GITHUB_ENV:-/dev/null}"

echo ">> Orígenes resueltos:"
echo "   ALLOWED_ORIGINS=${ALLOWED_ORIGINS}"
echo "   FRONTEND_ORIGIN=${FRONTEND_ORIGIN}"