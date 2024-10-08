terraform {
  required_version = "1.9.1"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.57.0"
    }
  }
  backend "s3" {
    region               = "us-east-1"
    bucket               = "tf-ryanemcdaniel-management"
    workspace_key_prefix = "dffp"
    key                  = "clash-discord-bot.tfstate"
    dynamodb_table       = "tf-ryanemcdaniel-management-lock"
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
      env   = local.env
      comp  = local.service_name
      git   = local.git
    }
  }
}

locals {
  prefix = "${local.env}-${local.org}-${local.service_name}"
}
