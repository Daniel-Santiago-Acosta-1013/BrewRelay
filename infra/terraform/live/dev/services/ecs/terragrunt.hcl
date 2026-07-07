include {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../../blueprints/modules/ecs"
}

dependency "vpc" {
  config_path = "../../shared/vpc"
  mock_outputs = {
    vpc_id             = "vpc-mock"
    public_subnet_ids  = ["subnet-mock-1", "subnet-mock-2"]
    private_subnet_ids = ["subnet-mock-3", "subnet-mock-4"]
  }
}

dependency "rds" {
  config_path = "../../shared/rds"
  mock_outputs = {
    db_endpoint = "mock.localhost"
    db_port     = "5432"
  }
}

dependency "ecr" {
  config_path = "../ecr"
  mock_outputs = {
    repository_urls = {
      "brewer-api"    = "mock.dkr.ecr.us-east-1.amazonaws.com/brewer-api"
      "barista-worker" = "mock.dkr.ecr.us-east-1.amazonaws.com/barista-worker"
    }
  }
}

dependency "msk" {
  config_path = "../../shared/msk"
  mock_outputs = {
    msk_bootstrap_brokers = "mock-kafka:9092"
  }
}

inputs = {
  vpc_id             = dependency.vpc.outputs.vpc_id
  public_subnet_ids  = dependency.vpc.outputs.public_subnet_ids
  private_subnet_ids = dependency.vpc.outputs.private_subnet_ids

  api_image    = "${dependency.ecr.outputs.repository_urls["brewer-api"]}:latest"
  worker_image = "${dependency.ecr.outputs.repository_urls["barista-worker"]}:latest"

  db_endpoint = dependency.rds.outputs.db_endpoint
  db_port     = dependency.rds.outputs.db_port
  db_username = "brewrelay"
  db_password = get_env("DB_PASSWORD", "cambia-este-password")

  kafka_bootstrap = split(",", dependency.msk.outputs.msk_bootstrap_brokers)
}