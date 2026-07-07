include {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../modules/frontend"
}

dependency "ecs" {
  config_path = "../ecs"
}

inputs = {
  api_alb_dns = dependency.ecs.outputs.alb_dns_name
}
