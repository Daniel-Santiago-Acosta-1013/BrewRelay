variable "region" { type = string }
variable "project" { type = string }
variable "environment" { type = string }

variable "api_alb_dns" {
  type        = string
  description = "DNS del ALB de la API para el dashboard"
}

variable "msk_cluster_arn" {
  type        = string
  description = "ARN del cluster MSK"
  default     = ""
}

variable "rds_instance_id" {
  type        = string
  description = "ID de la instancia RDS"
  default     = ""
}

# Log group para la API
resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/${var.project}-${var.environment}-api"
  retention_in_days = 14
}

# Log group para el worker
resource "aws_cloudwatch_log_group" "worker" {
  name              = "/ecs/${var.project}-${var.environment}-worker"
  retention_in_days = 14
}

# Alarma: errores 5xx del ALB
resource "aws_cloudwatch_metric_alarm" "api_5xx" {
  alarm_name          = "${var.project}-${var.environment}-api-5xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Más de 5 errores 5xx en 2 minutos"

  dimensions = {
    LoadBalancer = var.api_alb_dns
  }

  tags = {
    Name        = "${var.project}-${var.environment}-api-5xx"
    Project     = var.project
    Environment = var.environment
  }
}

# Alarma: conexiones RDS altas
resource "aws_cloudwatch_metric_alarm" "rds_connections" {
  alarm_name          = "${var.project}-${var.environment}-rds-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  threshold           = 50
  alarm_description   = "Más de 50 conexiones a RDS"

  dimensions = {
    DBInstanceIdentifier = var.rds_instance_id
  }

  tags = {
    Name        = "${var.project}-${var.environment}-rds-connections"
    Project     = var.project
    Environment = var.environment
  }
}

# Dashboard de operaciones
resource "aws_cloudwatch_dashboard" "operations" {
  dashboard_name = "${var.project}-${var.environment}-operations"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "Metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          title  = "API — Requests 5xx"
          region = var.region
          view   = "timeSeries"
          metrics = [
            ["AWS/ApplicationELB", "HTTPCode_Target_5XX_Count", "LoadBalancer", var.api_alb_dns]
          ]
        }
      },
      {
        type   = "Metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          title  = "RDS — Conexiones"
          region = var.region
          view   = "timeSeries"
          metrics = [
            ["AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", var.rds_instance_id]
          ]
        }
      },
      {
        type   = "Metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          title  = "ECS — CPU utilization"
          region = var.region
          view   = "timeSeries"
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ClusterName", "${var.project}-${var.environment}"]
          ]
        }
      },
      {
        type   = "Metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          title  = "MSK — Bytes in/out"
          region = var.region
          view   = "timeSeries"
          metrics = [
            ["AWS/Kafka", "BytesInPerSec"],
            ["AWS/Kafka", "BytesOutPerSec"]
          ]
        }
      }
    ]
  })
}