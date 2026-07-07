# Root configuration de Terragrunt.
# Define el backend remoto (S3 + DynamoDB) y el generador de provider
# para que cada módulo (live) herede esta configuración.

remote_state {
  backend = "s3"
  config = {
    bucket         = "brewrelay-tf-state"
    key            = "${path_relative_to_include()}/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "brewrelay-tf-locks"
  }
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
}

generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}
EOF
}

inputs = {
  region      = "us-east-1"
  project     = "brewrelay"
  environment = "dev"
}
