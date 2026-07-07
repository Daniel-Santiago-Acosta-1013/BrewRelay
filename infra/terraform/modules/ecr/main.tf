variable "region" { type = string }
variable "project" { type = string }
variable "environment" { type = string }

variable "repositories" {
  description = "Nombres de repositorios ECR a crear"
  type        = list(string)
  default     = ["brewer-api", "barista-worker"]
}

resource "aws_ecr_repository" "this" {
  for_each             = toset(var.repositories)
  name                 = "${var.project}-${each.key}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.project}-${each.key}"
  }
}

output "repository_urls" {
  value = { for k, r in aws_ecr_repository.this : k => r.repository_url }
}
