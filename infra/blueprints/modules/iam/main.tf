variable "region" { type = string }
variable "project" { type = string }
variable "environment" { type = string }

variable "github_repo" {
  type        = string
  description = "Repositorio de GitHub en formato owner/repo"
}

# OIDC provider para GitHub Actions
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

# Rol asumible desde GitHub Actions
resource "aws_iam_role" "github_deploy" {
  name = "${var.project}-${var.environment}-github-deploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = data.aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:${var.github_repo}:*"
        }
      }
    }]
  })

  tags = {
    Name        = "${var.project}-${var.environment}-github-deploy"
    Project     = var.project
    Environment = var.environment
  }
}

# Política con permisos para deploy
resource "aws_iam_role_policy" "github_deploy" {
  name = "${var.project}-${var.environment}-deploy"
  role = aws_iam_role.github_deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:*",
          "ecs:*",
          "iam:PassRole",
          "logs:*",
          "s3:*",
          "cloudfront:*",
          "rds:*",
          "kafka:*",
          "tag:*"
        ]
        Resource = "*"
      }
    ]
  })
}