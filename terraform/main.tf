terraform {
  backend "s3" {
    region               = "us-east-1"
    bucket               = "tfstate-dffp"
    workspace_key_prefix = ""
    key                  = "clash-discord-bot.tfstate"
    dynamodb_table       = "tfstate-dffp"
  }
}


provider "aws" {
  region = "us-east-1"
  assume_role {
    role_arn = local.deploy_role
  }
  default_tags {
    tags = {
      org  = local.org
      env  = local.env
      comp = local.service_name
      git  = local.git
    }
  }
}


locals {
  prefix = "${local.env}-${local.org}-${local.service_name}"
  ENV    = upper(terraform.workspace)
}
