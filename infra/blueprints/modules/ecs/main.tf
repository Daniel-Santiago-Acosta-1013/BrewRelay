variable "region" { type = string }
variable "project" { type = string }
variable "environment" { type = string }

variable "vpc_id" { type = string }
variable "public_subnet_ids" { type = list(string) }
variable "private_subnet_ids" { type = list(string) }

variable "api_image" {
  type        = string
  description = "URL de la imagen del brewer-api (ECR)"
}

variable "worker_image" {
  type        = string
  description = "URL de la imagen del barista-worker (ECR)"
}

variable "db_endpoint" { type = string }
variable "db_port" { type = string }
variable "db_username" { type = string }
variable "db_password" {
  type      = string
  sensitive = true
}

variable "kafka_bootstrap" {
  type        = list(string)
  description = "Brokers de MSK (formato host:port)"
}

variable "cpu" {
  type    = number
  default = 256
}

variable "memory" {
  type    = number
  default = 512
}

resource "aws_security_group" "ecs" {
  name        = "${var.project}-${var.environment}-ecs-sg"
  description = "ECS tasks"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project}-${var.environment}-ecs-sg" }
}

resource "aws_security_group_rule" "ecs_ingress_alb" {
  type                     = "ingress"
  from_port                = 8080
  to_port                  = 8080
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
  security_group_id        = aws_security_group.ecs.id
  description              = "API desde ALB"
}

resource "aws_cloudwatch_log_group" "this" {
  name              = "/ecs/${var.project}-${var.environment}"
  retention_in_days = 14
}

resource "aws_ecs_cluster" "this" {
  name = "${var.project}-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_task_definition" "api" {
  family                   = "${var.project}-${var.environment}-api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = aws_iam_role.exec.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([
    {
      name      = "brewer-api"
      image     = var.api_image
      essential = true
      portMappings = [{ containerPort = 8080, protocol = "tcp" }]
      environment = [
        { name = "PGHOST", value = var.db_endpoint },
        { name = "PGPORT", value = var.db_port },
        { name = "PGUSER", value = var.db_username },
        { name = "PGPASSWORD", value = var.db_password },
        { name = "PGDATABASE", value = "brewrelay" },
        { name = "PGSSLMODE", value = "require" },
        { name = "HTTP_ADDR", value = ":8080" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.this.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "api"
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "worker" {
  family                   = "${var.project}-${var.environment}-worker"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = aws_iam_role.exec.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([
    {
      name      = "barista-worker"
      image     = var.worker_image
      essential = true
      environment = [
        { name = "PGHOST", value = var.db_endpoint },
        { name = "PGPORT", value = var.db_port },
        { name = "PGUSER", value = var.db_username },
        { name = "PGPASSWORD", value = var.db_password },
        { name = "PGDATABASE", value = "brewrelay" },
        { name = "PGSSLMODE", value = "require" },
        { name = "KAFKA_BROKERS", value = join(",", var.kafka_bootstrap) },
        { name = "KAFKA_TOPIC", value = "coffee.orders" },
        { name = "KAFKA_GROUP", value = "barista-worker" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.this.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "worker"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "api" {
  name            = "${var.project}-${var.environment}-api"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "brewer-api"
    container_port   = 8080
  }
}

resource "aws_ecs_service" "worker" {
  name            = "${var.project}-${var.environment}-worker"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.worker.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }
}

# IAM
data "aws_iam_policy_document" "assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "exec" {
  name               = "${var.project}-${var.environment}-ecs-exec"
  assume_role_policy = data.aws_iam_policy_document.assume.json
}

resource "aws_iam_role_policy_attachment" "exec" {
  role       = aws_iam_role.exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "task" {
  name               = "${var.project}-${var.environment}-ecs-task"
  assume_role_policy = data.aws_iam_policy_document.assume.json
}

# ALB
resource "aws_security_group" "alb" {
  name        = "${var.project}-${var.environment}-alb-sg"
  description = "ALB público"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project}-${var.environment}-alb-sg" }
}

resource "aws_lb" "this" {
  name               = "${var.project}-${var.environment}-alb"
  load_balancer_type = "application"
  subnets            = var.public_subnet_ids
  security_groups    = [aws_security_group.alb.id]
}

resource "aws_lb_target_group" "api" {
  name        = "${var.project}-${var.environment}-api-tg"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 15
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

output "alb_dns_name" {
  value = aws_lb.this.dns_name
}

output "cluster_name" {
  value = aws_ecs_cluster.this.name
}
