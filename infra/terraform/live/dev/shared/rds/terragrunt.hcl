include {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../../blueprints/modules/rds"
}

dependency "vpc" {
  config_path = "../vpc"
  mock_outputs = {
    vpc_id             = "vpc-mock"
    private_subnet_ids = ["subnet-mock-1", "subnet-mock-2"]
  }
}

inputs = {
  vpc_id             = dependency.vpc.outputs.vpc_id
  private_subnet_ids = dependency.vpc.outputs.private_subnet_ids
  db_username        = "brewrelay"
  db_password        = get_env("DB_PASSWORD", "cambia-este-password")
}