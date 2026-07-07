include {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../modules/ecr"
}

inputs = {
  repositories = ["brewer-api", "barista-worker"]
}
