include {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../../blueprints/modules/observability"
}

dependency "ecs" {
  config_path = "../../services/ecs"
  mock_outputs = {
    alb_dns_name = "mock-alb.us-east-1.elb.amazonaws.com"
  }
}

dependency "rds" {
  config_path = "../rds"
  mock_outputs = {
    db_instance_id = "mock-rds-instance"
  }
}

dependency "msk" {
  config_path = "../msk"
  mock_outputs = {
    msk_cluster_arn = "arn:aws:kafka:us-east-1:000000000000:cluster/mock-cluster/abcd"
  }
}

inputs = {
  api_alb_dns      = dependency.ecs.outputs.alb_dns_name
  msk_cluster_arn  = dependency.msk.outputs.msk_cluster_arn
  rds_instance_id = dependency.rds.outputs.db_instance_id
}