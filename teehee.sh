pnpm run types

terraform -chdir=terraform fmt -recursive
terraform -chdir=terraform workspace select qual
terraform -chdir=terraform workspace show

export BUILD_ENV=$(terraform -chdir=terraform workspace show)
pnpm run build

terraform -chdir=terraform plan -var-file .secret.tfvars -out .plan.tfplan
terraform -chdir=terraform apply .plan.tfplan
