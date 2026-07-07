include {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../modules/ecs"
}

dependency "vpc" {
  config_path = "../vpc"
}

dependency "rds" {
  config_path = "../rds"
}

dependency "ecr" {
  config_path = "../ecr"
}

dependency "msk" {
  config_path = "../msk"
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
