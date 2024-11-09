variable "qual_account_id" {}
variable "prod_account_id" {}

locals {
  aws_region = "us-east-1"

  org          = "dffp"
  env          = terraform.workspace
  service_name = "clash-discord-bot"
  git          = "git@github.com:deep-fried-family-planning/clash-discord-bot.git"

  account_id = {
    qual = var.qual_account_id
    prod = var.prod_account_id
  }[local.env]

  capacity = {
    qual = [1, 1]
    prod = [5, 5]
  }[local.env]

  deploy_role = "arn:aws:iam::${local.account_id}:role/initial-terraform"
}
