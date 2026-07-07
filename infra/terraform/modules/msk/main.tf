variable "region" { type = string }
variable "project" { type = string }
variable "environment" { type = string }

variable "vpc_id" { type = string }
variable "private_subnet_ids" { type = list(string) }

variable "kafka_version" {
  type    = string
  default = "3.6.0"
}

variable "broker_instance_type" {
  type    = string
  default = "kafka.m5.large"
}

variable "number_of_broker_nodes" {
  type    = number
  default = 2
}

resource "aws_security_group" "msk" {
  name        = "${var.project}-${var.environment}-msk-sg"
  description = "MSK"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 9092
    to_port     = 9098
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  tags = { Name = "${var.project}-${var.environment}-msk-sg" }
}

resource "aws_msk_cluster" "this" {
  cluster_name           = "${var.project}-${var.environment}"
  kafka_version         = var.kafka_version
  number_of_broker_nodes = var.number_of_broker_nodes

  broker_node_group_info {
    instance_type   = var.broker_instance_type
    client_subnets  = var.private_subnet_ids
    security_groups = [aws_security_group.msk.id]

    storage_info {
      ebs_storage_info {
        volume_size = 10
      }
    }
  }

  encryption_info {
    encryption_in_transit {
      client_broker = "TLS_PLAINTEXT"
      in_cluster    = true
    }
  }
}

output "msk_bootstrap_brokers" {
  value = aws_msk_cluster.this.bootstrap_brokers
}

output "msk_bootstrap_brokers_tls" {
  value = aws_msk_cluster.this.bootstrap_brokers_tls
}

output "msk_sg_id" {
  value = aws_security_group.msk.id
}
