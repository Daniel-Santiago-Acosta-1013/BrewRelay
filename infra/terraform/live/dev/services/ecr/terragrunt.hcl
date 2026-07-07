include {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../../blueprints/modules/ecr"
}

inputs = {
  repositories = ["brewer-api", "barista-worker"]
}
