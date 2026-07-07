# Live: entorno dev. Cada carpeta es un módulo orquestado por terragrunt.
include {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../../blueprints/modules/vpc"
}

inputs = {
  vpc_cidr    = "10.0.0.0/16"
  environment = "dev"
}
