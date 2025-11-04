locals {
  ssm_names = {
    DFFP_DISCORD_BOT_TOKEN  = "/DFFP/${local.ENV}/DISCORD_BOT_TOKEN"
    DFFP_DISCORD_PUBLIC_KEY = "/DFFP/${local.ENV}/DISCORD_PUBLIC_KEY"
    DFFP_DISCORD_ERROR_URL  = "/DFFP/${local.ENV}/DISCORD_ERROR_URL"
    DFFP_DISCORD_DEBUG_URL  = "/DFFP/${local.ENV}/DISCORD_DEBUG_URL"
    DFFP_COC_KEY            = "/DFFP/${local.ENV}/COC_KEY"
    APIGW_DEV_WS            = "/dffp/${local.env}/dev_ws_apigw"
  }
}

data "aws_ssm_parameter" "ssm_param" {
  for_each        = local.ssm_names
  name            = each.value
  with_decryption = true
}
