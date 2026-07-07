include {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../../blueprints/modules/iam"
}

inputs = {
  github_repo = "santiagoacosta/BrewRelay"
}