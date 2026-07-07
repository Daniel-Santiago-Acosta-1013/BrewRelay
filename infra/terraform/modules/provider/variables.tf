variable "region" {
  description = "Región AWS"
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Nombre del proyecto"
  type        = string
  default     = "brewrelay"
}

variable "environment" {
  description = "Entorno (dev, staging, prod)"
  type        = string
}
