include {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../../blueprints/modules/frontend"
}

dependency "ecs" {
  config_path = "../ecs"
  mock_outputs = {
    alb_dns_name = "mock-alb.us-east-1.elb.amazonaws.com"
  }
}

inputs = {
  api_alb_dns = dependency.ecs.outputs.alb_dns_name
}