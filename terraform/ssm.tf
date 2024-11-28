locals {
  ssm_names = {

  }
}

data "aws_ssm_parameter" "ssm_param" {
  for_each        = local.ssm_names
  name            = each.value
  with_decryption = true
}
