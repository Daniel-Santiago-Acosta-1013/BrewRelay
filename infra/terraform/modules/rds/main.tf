variable "region" { type = string }
variable "project" { type = string }
variable "environment" { type = string }

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "db_instance_class" {
  description = "Clase de instancia RDS"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  type    = number
  default = 20
}

variable "db_username" {
  type      = string
  default   = "brewrelay"
  sensitive = true
}

variable "db_password" {
  type      = string
  sensitive = true
}

resource "aws_db_subnet_group" "this" {
  name       = "${var.project}-${var.environment}-db-subnet"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.project}-${var.environment}-db-subnet"
  }
}

resource "aws_security_group" "rds" {
  name        = "${var.project}-${var.environment}-rds-sg"
  description = "Acceso a RDS PostgreSQL"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
    description = "PostgreSQL desde la VPC"
  }

  tags = {
    Name = "${var.project}-${var.environment}-rds-sg"
  }
}

resource "aws_db_instance" "this" {
  identifier              = "${var.project}-${var.environment}"
  engine                  = "postgres"
  engine_version          = "16.3"
  instance_class          = var.db_instance_class
  allocated_storage       = var.db_allocated_storage
  storage_type            = "gp3"
  db_name                 = "brewrelay"
  username                = var.db_username
  password                = var.db_password
  db_subnet_group_name    = aws_db_subnet_group.this.name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  publicly_accessible     = false
  skip_final_snapshot     = true
  deletion_protection     = false
  backup_retention_period = 7

  # Replicación lógica requerida por Debezium
  parameter_group_name = aws_db_parameter_group.logical.id

  tags = {
    Name = "${var.project}-${var.environment}-rds"
  }
}

resource "aws_db_parameter_group" "logical" {
  name   = "${var.project}-${var.environment}-pg-logical"
  family = "postgres16"

  parameter {
    name  = "rds.logical_replication"
    value = "1"
    apply_method = "pending-reboot"
  }
}

output "db_endpoint" {
  value = aws_db_instance.this.address
}

output "db_port" {
  value = aws_db_instance.this.port
}

output "db_sg_id" {
  value = aws_security_group.rds.id
}
