include {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../modules/msk"
}

dependency "vpc" {
  config_path = "../vpc"
}

inputs = {
  vpc_id               = dependency.vpc.outputs.vpc_id
  private_subnet_ids   = dependency.vpc.outputs.private_subnet_ids
  number_of_broker_nodes = 2
}
